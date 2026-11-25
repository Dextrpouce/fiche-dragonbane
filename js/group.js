// Groupe : caisse commune et matériel des montures / véhicules.
// Toute modification est une « opération » (données simples) qui renvoie une ligne de journal claire
// (qui, quoi, combien). Deux modes, même code :
//  - groupe personnel : appliqué sur la copie de l'appareil (sauvegardée avec ton compte) ;
//  - groupe partagé (code à donner aux autres joueurs) : appliqué tout de suite sur l'appareil,
//    gardé en file d'attente, puis envoyé dans une transaction Firebase dès que possible.
//    Tous les membres voient et modifient le même groupe, en direct.
import * as cloud from './cloud.js';
import { store } from './store.js';
import { uid, upgradeGroup, CARRIER_TYPES } from './rules.js';
import { applyJournalOp } from './journal-ops.js';

const KEY = 'dragonbane.sharedGroup';
const QKEY = 'dragonbane.groupQueue';
const GAME = 'dragonbane';
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || 'null') ?? d; } catch { return d; } };
let cur = read(KEY, null);          // { id, name, members, state (dernier état connu du serveur), updatedAt }
let queue = read(QKEY, []);         // [{ id, op, author, date }]
let stop = null;
let watching = null;
let error = '';
let flushing = false;
let retryTimer = null;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());
const save = () => {
  if (cur) localStorage.setItem(KEY, JSON.stringify(cur)); else localStorage.removeItem(KEY);
  localStorage.setItem(QKEY, JSON.stringify(queue));
};

// ---------- Argent (en cuivre : 1 or = 10 argent = 100 cuivre) ----------
const n = (v) => (v === '' || v == null || isNaN(+v) ? 0 : +v);
export const cu = (m) => n(m?.or) * 100 + n(m?.argent) * 10 + n(m?.cuivre);
export function fmt(c) {
  const o = Math.floor(c / 100); const a = Math.floor((c % 100) / 10); const k = c % 10;
  return [o && `${o} or`, a && `${a} arg.`, k && `${k} cu.`].filter(Boolean).join(' ') || '0';
}
const add = (m, coins) => { for (const k of ['or', 'argent', 'cuivre']) m[k] = n(m[k]) + n(coins[k]); };
// Retire des pièces (objet) ou un montant en cuivre (nombre). On retire les pièces données
// et on ne fait de la monnaie (casser une pièce plus grosse) que s'il le faut.
function take(m, x) {
  const total = typeof x === 'number' ? x : cu(x);
  if (cu(m) < total) fail(`Pas assez dans la caisse (il manque ${fmt(total - cu(m))})`);
  let coins = x;
  if (typeof x === 'number') { // payer d'abord avec les grosses pièces disponibles
    let r = x;
    const o = Math.min(n(m.or), Math.floor(r / 100)); r -= o * 100;
    const a = Math.min(n(m.argent), Math.floor(r / 10)); r -= a * 10;
    coins = { or: o, argent: a, cuivre: r };
  }
  let o = n(m.or) - n(coins.or), a = n(m.argent) - n(coins.argent), c = n(m.cuivre) - n(coins.cuivre);
  for (let guard = 0; (o < 0 || a < 0 || c < 0) && guard < 100000; guard++) {
    if (c < 0) { if (a > 0) { a--; c += 10; } else if (o > 0) { o--; a += 10; } else break; }
    else if (a < 0) { if (o > 0) { o--; a += 10; } else if (c >= 10) { c -= 10; a++; } else break; }
    else if (a >= 10) { a -= 10; o++; } else if (c >= 10) { c -= 10; a++; } else break;
  }
  Object.assign(m, { or: o, argent: a, cuivre: c });
}
const fail = (msg) => { throw Object.assign(new Error(msg), { invalid: true }); };
const qtyTxt = (q) => (n(q) > 1 ? ` ×${q}` : '');

export const EMPTY = () => ({ game: GAME, money: { or: 0, argent: 0, cuivre: 0 }, carriers: [], accounts: [], notes: '', log: [], journal: [], npcs: [], lieux: [], persos: [] });

// ---------- Comptes : argent du groupe gardé ailleurs, dettes, projets ----------
// bal (en cuivre) : dépôt = ce qui est gardé ; on nous doit = ce qu'on attend ; on doit = ce qu'on doit ;
// projet = déjà payé (goal = coût total). Seul « on doit » est une dette : le reste compte dans la fortune.
export const ACCOUNT_KINDS = {
  depot: { name: 'Dépôt', long: 'Argent gardé par quelqu’un (banquier, marchand…)' },
  creance: { name: 'On nous doit', long: 'Quelqu’un doit de l’argent au groupe' },
  dette: { name: 'On doit', long: 'Le groupe doit de l’argent à quelqu’un' },
  projet: { name: 'Projet', long: 'Une grosse dépense payée en plusieurs fois (construction, bateau…)' },
};
// Fortune du groupe : caisse + dépôts + ce qu'on nous doit − ce qu'on doit
export const fortune = (g) => cu(g.money) + (g.accounts || []).reduce((t, a) => t + (a.kind === 'dette' ? -1 : a.kind === 'projet' ? 0 : 1) * n(a.bal), 0);
const toCoins = (c) => ({ or: Math.floor(c / 100), argent: Math.floor((c % 100) / 10), cuivre: c % 10 });

// ---------- Opérations : modifient l'état et renvoient la ligne de journal ----------
// Ligne : { text, cat (type), amount?, sign?, undo? (opération inverse), purse? (bourse du personnage à corriger si on annule) }
// Types de lignes (filtres de l'historique) ; le journal de campagne donne les siens (session, pnj, lieu, piste)
const OP_CAT = {
  money: 'caisse', buy: 'caisse', unbuy: 'caisse', sell: 'vente', unsell: 'vente', notes: 'notes',
  acct: 'comptes', acctAdd: 'comptes', acctEdit: 'comptes', acctDel: 'comptes',
  itemAdd: 'materiel', itemEdit: 'materiel', itemDel: 'materiel', itemMove: 'materiel', itemTake: 'materiel',
  carrierAdd: 'materiel', carrierEdit: 'materiel', carrierDel: 'materiel', saddle: 'materiel', harness: 'materiel',
  'p:lend': 'persos', 'p:unlend': 'persos',
};
export function applyOp(s, op) {
  const e = applyOp0(s, op);
  if (e?.text && !e.cat) e.cat = op.t === 'undo' ? (s.log.find((x) => x.id === op.id)?.cat || 'autre') : (OP_CAT[op.t] || 'autre');
  return e;
}
function applyOp0(s, op) {
  for (const [k, v] of Object.entries(EMPTY())) if (s[k] === undefined) s[k] = v;
  upgradeGroup(s);
  const car = (id) => s.carriers.find((x) => x.id === id) || fail('Monture ou véhicule introuvable (supprimé ?)');
  const item = (k, id) => k.items.find((x) => x.id === id) || fail('Objet introuvable (déjà déplacé ou supprimé ?)');
  const acct = (id) => s.accounts.find((x) => x.id === id) || fail('Compte introuvable (supprimé ?)');
  if (op.t.startsWith('j:')) return applyJournalOp(s, op); // journal de campagne partagé
  // Personnages prêtés (la fiche elle-même est dans groups/{code}/media/perso_{id}) : liste visible de tous
  if (op.t === 'p:lend') {
    s.persos = [...(s.persos || []).filter((p) => p.id !== op.perso.id), op.perso];
    return { text: `${op.perso.name} prêté au groupe par ${op.perso.owner}`, changed: true };
  }
  if (op.t === 'p:unlend') {
    const p = (s.persos || []).find((x) => x.id === op.id);
    s.persos = (s.persos || []).filter((x) => x.id !== op.id);
    return { text: p ? `${p.name} n’est plus prêté au groupe` : '', changed: true };
  }
  switch (op.t) {
    case 'money': {
      if (op.sign > 0) add(s.money, op.coins); else take(s.money, op.coins);
      return { text: op.label, amount: cu(op.coins), sign: op.sign, undo: { t: 'money', sign: -op.sign, coins: op.coins, label: '' }, purse: op.purse };
    }
    case 'buy': {
      const k = car(op.k);
      take(s.money, op.price);
      k.items.push(op.item);
      return { text: `Achat : ${op.item.name}${qtyTxt(op.item.qty)} (${k.name})`, amount: op.price, sign: -1, undo: { t: 'unbuy', k: op.k, id: op.item.id, price: op.price } };
    }
    case 'unbuy': {
      const k = car(op.k); item(k, op.id);
      k.items = k.items.filter((x) => x.id !== op.id);
      add(s.money, { or: Math.floor(op.price / 100), argent: Math.floor((op.price % 100) / 10), cuivre: op.price % 10 });
      return { text: '' };
    }
    case 'itemAdd': {
      const k = car(op.k); k.items.push(op.item);
      return { text: `${op.from ? `${op.from} range` : 'Ajout :'} ${op.item.name}${qtyTxt(op.item.qty)} → ${k.name}` };
    }
    case 'itemEdit': {
      const k = car(op.k); const it = item(k, op.id);
      const changes = [];
      if (op.v.name !== undefined && op.v.name !== it.name) changes.push(`renommé « ${op.v.name} »`);
      if (op.v.qty !== undefined && n(op.v.qty) !== n(it.qty)) changes.push(`quantité ${it.qty} → ${op.v.qty}`);
      if (op.v.weight !== undefined && n(op.v.weight) !== n(it.weight)) changes.push(`encombrement ${it.weight} → ${op.v.weight}`);
      if (op.v.sell !== undefined && !!op.v.sell !== !!it.sell) changes.push(op.v.sell ? `à vendre${n(op.v.value) ? ` (${fmt(n(op.v.value))} pièce)` : ''}` : 'retiré de la vente');
      else if (op.v.sell && n(op.v.value) !== n(it.value)) changes.push(`estimé ${fmt(n(op.v.value))} pièce`);
      if (op.v.notes !== undefined && op.v.notes !== (it.notes || '')) changes.push('notes modifiées');
      const name = it.name;
      Object.assign(it, op.v);
      return changes.length ? { text: `${name} (${k.name}) : ${changes.join(', ')}` } : { text: '' };
    }
    case 'itemDel': {
      const k = car(op.k); const it = item(k, op.id);
      k.items = k.items.filter((x) => x.id !== op.id);
      return { text: `Retiré : ${it.name}${qtyTxt(it.qty)} (${k.name})`, undo: { t: 'itemAdd', k: op.k, item: it, silent: true } };
    }
    case 'itemMove': {
      const k = car(op.k); const to = car(op.to); const it = item(k, op.id);
      k.items = k.items.filter((x) => x.id !== op.id); to.items.push(it);
      return { text: `${it.name}${qtyTxt(it.qty)} : ${k.name} → ${to.name}`, undo: { t: 'itemMove', k: op.to, to: op.k, id: op.id } };
    }
    case 'itemTake': {
      const k = car(op.k); const it = item(k, op.id);
      k.items = k.items.filter((x) => x.id !== op.id);
      return { text: `${op.who} prend ${it.name}${qtyTxt(it.qty)} (${k.name}) dans son sac` };
    }
    case 'sell': {
      const k = car(op.k); const it = item(k, op.id);
      const qty = n(it.qty) || 1; const sold = Math.min(qty, Math.max(1, n(op.qty)));
      if (sold >= qty) k.items = k.items.filter((x) => x.id !== op.id); else it.qty = qty - sold;
      add(s.money, op.coins);
      return { text: `Vente : ${it.name}${qtyTxt(sold)}`, amount: cu(op.coins), sign: 1, undo: { t: 'unsell', k: op.k, item: { ...it, qty }, coins: op.coins } };
    }
    case 'unsell': {
      const k = car(op.k);
      take(s.money, op.coins);
      const it = k.items.find((x) => x.id === op.item.id);
      if (it) it.qty = op.item.qty; else k.items.push(op.item);
      return { text: '' };
    }
    case 'carrierAdd': s.carriers.push(op.carrier); return { text: `Nouveau : ${op.carrier.name} (${CARRIER_TYPES[op.carrier.type]?.name || 'transport'})` };
    case 'carrierEdit': {
      const k = car(op.id); const old = k.name;
      Object.assign(k, op.v);
      return { text: old !== k.name ? `${old} renommé ${k.name}` : `${k.name} : fiche modifiée` };
    }
    case 'carrierDel': {
      const k = car(op.id);
      s.carriers = s.carriers.filter((x) => x.id !== op.id);
      s.carriers.forEach((v) => { v.pulledBy = v.pulledBy.filter((id) => id !== op.id); });
      return { text: `Supprimé : ${k.name}${k.items.length ? ` (avec ${k.items.length} objet${k.items.length > 1 ? 's' : ''})` : ''}`, undo: { t: 'carrierAdd', carrier: k } };
    }
    case 'saddle': {
      const k = car(op.id); const before = n(k.saddlebags);
      k.saddlebags = Math.max(0, Math.min(2, before + op.d));
      return k.saddlebags === before ? { text: '' } : { text: `${k.name} : ${k.saddlebags} sacoche${k.saddlebags > 1 ? 's' : ''} de selle` };
    }
    case 'harness': {
      const a = car(op.id);
      s.carriers.forEach((v) => { v.pulledBy = v.pulledBy.filter((x) => x !== op.id); });
      if (!op.to) return { text: `${a.name} est dételé` };
      const v = car(op.to);
      const max = CARRIER_TYPES[v.type]?.pulls || 1;
      let extra = '';
      if (v.pulledBy.length >= max) { const old = s.carriers.find((x) => x.id === v.pulledBy[0]); v.pulledBy.shift(); extra = ` (${old?.name || 'l’autre'} dételé)`; }
      v.pulledBy.push(op.id);
      return { text: `${a.name} attelé : ${v.name}${extra}` };
    }
    case 'notes': s.notes = op.v; return { text: 'Notes du groupe modifiées' };
    case 'acctAdd': {
      s.accounts.push(op.acct);
      const a = op.acct;
      if (op.silent) return { text: '' };
      const what = a.kind === 'projet' ? `coût ${fmt(n(a.goal))}${n(a.bal) ? `, déjà payé ${fmt(n(a.bal))}` : ''}` : fmt(n(a.bal));
      return { text: `Nouveau compte : ${a.name} (${ACCOUNT_KINDS[a.kind]?.name || 'compte'}, ${what})`, undo: { t: 'acctDel', id: a.id, silent: true } };
    }
    case 'acctEdit': {
      const a = acct(op.id); const old = { ...a };
      const changes = [];
      if (op.v.name !== undefined && op.v.name !== a.name) changes.push(`renommé « ${op.v.name} »`);
      if (op.v.goal !== undefined && n(op.v.goal) !== n(a.goal)) changes.push(`coût ${fmt(n(a.goal))} → ${fmt(n(op.v.goal))}`);
      if (op.v.notes !== undefined && op.v.notes !== (a.notes || '')) changes.push('notes modifiées');
      Object.assign(a, op.v);
      return changes.length ? { text: `${old.name} : ${changes.join(', ')}` } : { text: '' };
    }
    case 'acctDel': {
      const a = acct(op.id);
      s.accounts = s.accounts.filter((x) => x.id !== op.id);
      if (op.silent) return { text: '' };
      return { text: `Compte supprimé : ${a.name}${n(a.bal) ? ` (${fmt(n(a.bal))})` : ''}`, undo: { t: 'acctAdd', acct: a, silent: true } };
    }
    // Mouvement sur un compte : d (cuivre, signé) change le solde ; via = 'caisse', l'id d'un dépôt, ou rien
    // (l'argent ne passe pas par la caisse : dépense sur place, intérêts, correction).
    case 'acct': {
      const a = acct(op.id); const d = Math.round(n(op.d));
      const cashOut = a.kind === 'dette' ? -d : d; // > 0 : l'argent sort de la caisse (ou du dépôt)
      if (n(a.bal) + d < 0) fail(`${a.name} : il n’y a que ${fmt(n(a.bal))}`);
      let raw;
      if (op.via === 'caisse' && cashOut) {
        const before = { ...s.money };
        if (op.raw) add(s.money, op.raw);
        else if (cashOut > 0) take(s.money, op.coins || cashOut);
        else add(s.money, op.coins || toCoins(-cashOut));
        raw = { or: n(before.or) - n(s.money.or), argent: n(before.argent) - n(s.money.argent), cuivre: n(before.cuivre) - n(s.money.cuivre) };
      } else if (op.via && op.via !== 'caisse' && cashOut) {
        const x = acct(op.via);
        if (n(x.bal) - cashOut < 0) fail(`${x.name} : il n’y a que ${fmt(n(x.bal))}`);
        x.bal = n(x.bal) - cashOut;
      }
      a.bal = n(a.bal) + d;
      const done = a.kind === 'projet' && n(a.goal) && a.bal >= n(a.goal) && a.bal - d < n(a.goal) ? ' : payé en entier !' : '';
      return {
        text: (op.label || `${a.name} : ${d > 0 ? '+' : '−'}${fmt(Math.abs(d))}`) + done,
        amount: Math.abs(d), sign: op.via === 'caisse' ? (cashOut > 0 ? -1 : 1) : 0,
        undo: { t: 'acct', id: op.id, d: -d, via: op.via, raw },
      };
    }
    case 'undo': {
      const e = s.log.find((x) => x.id === op.id) || fail('Ligne du journal introuvable');
      if (e.undone) fail('Déjà annulé');
      if (!e.undo) fail('Impossible d’annuler cette ligne');
      applyOp(s, e.undo);
      e.undone = true;
      return { text: `Annulé : ${e.text}`, purse: e.purse ? { ...e.purse, sign: -e.purse.sign } : undefined };
    }
    default: fail('Opération inconnue');
  }
  return { text: '' };
}

// Ajoute la ligne de journal (sauf si l'opération n'a rien changé)
export function record(s, entry, who, date = Date.now(), id = uid()) {
  if (!entry?.text) return null;
  // Corrections répétées d'un même champ par la même personne (moins de 10 min) : une seule ligne, mise à jour
  if (entry.key) {
    const top = (s.log || []).find((x) => x.key === entry.key);
    if (top && top.who === who && date >= top.date && date - top.date < 600000) { top.date = date; top.text = entry.text; return top; }
  }
  const e = { id, date, who, ...entry };
  if (!e.undo) delete e.undo;
  if (!e.purse) delete e.purse;
  delete e.changed;
  s.log = [e, ...(s.log || [])].sort((a, b) => b.date - a.date).slice(0, 600);
  return e;
}

// État affiché : groupe partagé (dernier état du serveur + opérations en attente) ou groupe personnel
function viewState() {
  if (!cur) return store.group;
  const s = JSON.parse(JSON.stringify({ ...EMPTY(), ...(cur.state || {}) }));
  upgradeGroup(s);
  for (const q of queue) {
    try { const e = record(s, applyOp(s, q.op), q.author, q.date, q.id); if (e) e.pending = true; } catch { /* sera écartée à l'envoi */ }
  }
  return s;
}

const errText = (e) => (e.code === 'resource-exhausted' ? 'Limite gratuite de Firebase atteinte pour aujourd’hui'
  : e.code === 'permission-denied' ? 'Accès refusé par le groupe'
  : e.code === 'unavailable' || !navigator.onLine ? 'Hors ligne'
  : e.auth ? 'Non connecté (touche le nuage)'
  : e.message || 'Erreur');

export const group = {
  get shared() { return cur; },
  get state() { return viewState(); },
  get pending() { return queue.length; },
  get error() { return cur ? (error || (!navigator.onLine ? 'Hors ligne' : !cloud.user() ? 'Connexion au nuage en attente' : '')) : ''; },
  get online() { return !!cloud.user() && navigator.onLine; },
  onChange(fn) { listeners.add(fn); },

  // À appeler quand la connexion change : suivi en direct + envoi de la file
  refresh() {
    const id = cur?.id;
    if (!id || !cloud.user()) { stop?.(); stop = null; watching = null; return; }
    if (watching !== id) {
      stop?.();
      watching = id;
      stop = cloud.watchGroup(id, (g) => { cur = g; save(); emit(); }, (e) => { error = errText(e); emit(); });
    }
    this.flush();
  },

  // Crée un groupe partagé ; seed = état de départ (ex. ton groupe personnel)
  async create(name, seed, author) {
    const id = Array.from({ length: 8 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
    const state = { ...EMPTY(), ...JSON.parse(JSON.stringify(seed || {})), game: GAME, log: [] };
    delete state.updatedAt;
    record(state, { text: `Groupe « ${name} » créé` }, author);
    await cloud.createGroup(id, name, state);
    cur = { id, name, members: {}, state, updatedAt: Date.now() }; queue = []; save(); this.refresh(); emit();
    return id;
  },
  async join(code) {
    const id = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!id) throw new Error('Saisis le code du groupe');
    const name = await cloud.joinGroup(id, GAME);
    cur = { id, name, members: {}, state: EMPTY(), updatedAt: 0 }; queue = []; save(); this.refresh(); emit();
    return name;
  },
  // Entrer dans un groupe comme meneur de jeu, avec le code MJ donné par l'administrateur
  async joinAsMJ(code) {
    const c = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!c) throw new Error('Saisis le code MJ');
    const id = await cloud.redeemMJInvite(c);
    const name = await cloud.joinGroup(id, GAME);
    const u = cloud.user();
    const mjName = u.displayName || u.email || 'MJ';
    await cloud.setGroupMJ(id, u.uid, mjName);
    cur = { id, name, members: {}, mj: u.uid, mjName, state: EMPTY(), updatedAt: 0 }; queue = []; save(); this.refresh(); emit();
    return name;
  },
  async leave() {
    const id = cur?.id;
    stop?.(); stop = null; watching = null;
    cur = null; queue = []; error = ''; save(); emit();
    if (id) await cloud.leaveGroup(id).catch(() => {});
  },

  // Applique une opération (lève une erreur si elle est impossible, ex. caisse trop vide). Renvoie la ligne du journal.
  apply(op, author) {
    if (!cur) {
      const g = store.group;
      const e = record(g, applyOp(g, op), author);
      store.saveGroup();
      emit();
      return e;
    }
    const s = viewState();
    const entry = applyOp(s, op); // vérifie qu'elle est possible
    queue.push({ id: uid(), op, author, date: Date.now() });
    save(); emit();
    this.flush();
    return entry;
  },

  // Envoie les opérations en attente, une par une, dans l'ordre
  async flush() {
    if (flushing || !queue.length || !cur?.id) return;
    if (!this.online) { error = !navigator.onLine ? 'Hors ligne' : 'Connexion au nuage en attente'; emit(); return; }
    flushing = true;
    clearTimeout(retryTimer);
    let dropped = 0;
    try {
      while (queue.length) {
        const q = queue[0];
        try {
          // Une modification sans ligne de journal (texte du journal…) doit quand même être écrite
          await cloud.updateGroup(cur.id, (s) => { const e = applyOp(s, q.op); return record(s, e, q.author, q.date, q.id) || e?.changed; });
        } catch (e) {
          if (e.invalid) dropped++; else throw e;
        }
        queue.shift(); save();
      }
      error = '';
    } catch (e) {
      error = errText(e);
      retryTimer = setTimeout(() => this.flush(), e.code === 'resource-exhausted' ? 15 * 60e3 : 60e3);
    } finally {
      flushing = false;
      if (dropped) error = `${dropped} modification(s) écartée(s) : devenues impossibles (déjà faites par un autre joueur ?)`;
      emit();
    }
  },
};

window.addEventListener('online', () => group.flush());
