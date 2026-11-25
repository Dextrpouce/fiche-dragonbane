import * as R from './rules.js';
import { store } from './store.js';
import * as cloud from './cloud.js';
import * as snd from './sound.js';
import * as SK from './sketch.js';
import * as media from './media.js';
import { applyJournalOp } from './journal-ops.js';
import * as L from './library.js';
import { MANUAL } from './manual.js';
import { RULES } from './combat-rules.js';
import { group, ACCOUNT_KINDS, fortune } from './group.js';

// ================= Utilitaires =================
const $app = document.getElementById('app');
const dlg = document.getElementById('dlg');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
// Personnage affiché : le tien, ou celui d'un joueur absent que tu joues (ui.guest, voir « Personnages prêtés »)
let mjStubObj = null;
// Le personnage affiché (le mien, pas un prêté ni la fiche du MJ) rejoint un groupe
function linkChar(gid) {
  const c = C();
  if (!gid || !c || c.stub || ui.guest || ui.mjView) return;
  c.groupId = gid; c.updatedAt = Date.now(); store.save();
}
function setMjActive(on) { ui.mjActive = !!on; localStorage.setItem('dragonbane.mjActive', on ? '1' : '0'); }
// MJ sans personnage à lui : une fiche vide en mémoire (jamais enregistrée), pour que l'appli fonctionne
const mjStub = () => { mjStubObj ||= Object.assign(R.upgradeCharacter(R.newCharacter({ name: 'Meneur de jeu' })), { id: '__mj', stub: true }); mjStubObj.name = isMJ() ? 'Meneur de jeu' : 'Sans personnage'; return mjStubObj; };
// ui.mjActive : dans le groupe affiché sans personnage (MJ, ou ancien MJ qui y reste membre)
const C = () => ui.mjView || ui.guest || (ui.mjActive && group.shared ? mjStub() : null) || store.current() || (isMJ() ? mjStub() : null);
const num = (v) => (v === '' || v == null || isNaN(+v) ? 0 : +v);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const fmtDate = (t) => new Date(t).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });

const ICONS = {
  charrette: '<path d="M2 7.5h13v5H2z"/><path d="M2 10h13"/><path d="M15 11.5l7-2.5"/><circle cx="8.5" cy="16.5" r="4"/><circle cx="8.5" cy="16.5" r="1"/><path d="M8.5 12.5v3M8.5 17.5v3M4.5 16.5h3M9.5 16.5h3"/>',
  chariot: '<path d="M4 12V8.5C4 6 6 4.5 8 4.5h5c2 0 4 1.5 4 4V12"/><path d="M8.5 4.5V12M12.5 4.5V12"/><path d="M2.5 12h16v3h-16z"/><path d="M18.5 13.5l3.5-1"/><circle cx="6.5" cy="18.3" r="2.7"/><circle cx="15" cy="18.3" r="2.7"/><path d="M6.5 15.6v5.4M3.8 18.3h5.4M15 15.6v5.4M12.3 18.3h5.4"/>',
  coffre: '<path d="M3 10h18v10H3z"/><path d="M3 10V8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2"/><path d="M7 4.3V20M17 4.3V20"/><path d="M10.5 9h3v4h-3z"/>',
  barque: '<path d="M2 12.5h20c-1.2 3-3.5 5-6 5H8c-2.5 0-4.8-2-6-5z"/><path d="M5 5l11 15"/><path d="M15.5 17.5l2 3.2"/><path d="M7 12.5v-1.5h10v1.5"/>',
  monture: '<path d="M8.5 21v-5.5c0-3.5 1-5.5 2.5-7L9.5 3l3 3.5L13.5 2.5l1.5 5.5c2.5 1.5 4.5 4 5 6.5l-1.5 2-2.5-.7-2 1.7V21"/><path d="M11 8.5c-1.5 1.5-2.5 3.5-2.5 5"/><circle cx="15.3" cy="11" r=".8" fill="currentColor"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.9.7c0 1.7-2.5 2.2-2.5 3.8"/><circle cx="12" cy="17.2" r=".6" fill="currentColor"/>',
  sheet: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h7M9 9h3"/>',
  sword: '<path d="M20 4l-.6 3.4L10 16.8 7.2 14 16.6 4.6z"/><path d="M5.2 12.4l6.4 6.4"/><path d="M8.4 15.6 4.2 19.8"/><circle cx="3.6" cy="20.4" r=".9"/>',
  wand: '<path d="M4 20L15 9"/><path d="M17 3v3M15.5 4.5h3M20 8v2M19 9h2M13 4v1.5M12.2 4.8h1.6"/>',
  bag: '<path d="M9 7.5h6"/><path d="M9.2 7.5C5.5 9.5 4 12.6 4 15.5 4 19 6.8 21 12 21s8-2 8-5.5c0-2.9-1.5-6-5.2-8"/><path d="M9.2 7.5 7.5 3.8c1.6.7 3 .9 4.5.9s2.9-.2 4.5-.9l-1.7 3.7"/><circle cx="12" cy="14.5" r="2.2"/>',
  up: '<path d="M12 3l7 7h-4v6H9v-6H5z"/><path d="M8 21h8"/>',
  book: '<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>',
  cloud: '<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z"/>',
  google: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20.5 12H12.5"/>',
  dots: '<circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  quill: '<path d="M20 3C11 4 6 10 5 19"/><path d="M20 3c-1 6-5 10-11 11"/><path d="M4 21l2-3"/>',
  eraser: '<path d="M8 20h12"/><path d="M4.5 15.5l9-9a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L11 19H8z"/><path d="M9 11l5 5"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3 4v4h4"/><path d="M12 7.5V12l3 2"/>',
  crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/><path d="M5 16h14"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  down: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  d20: '<path d="M12 2.5l8.5 4.9v9.2L12 21.5l-8.5-4.9V7.4z"/><path d="M12 2.5 7.6 15.2h8.8zM3.5 7.4l4.1 7.8M20.5 7.4l-4.1 7.8M7.6 15.2 12 21.5l4.4-6.3M3.5 16.6l4.1-1.4M20.5 16.6l-4.1-1.4"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.4 7.9-8 9-4.6-1.1-8-4.5-8-9V6z"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  flame: '<path d="M12 21c-4 0-6.5-2.6-6.5-6.2 0-3.9 3.4-5.6 3.7-9.8 2.3 1.4 3.6 3.5 3.8 5.6.9-.8 1.5-2 1.6-3.3 2.4 2 3.9 4.7 3.9 7.5 0 3.6-2.5 6.2-6.5 6.2z"/>',
  bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  library: '<path d="M4 4h3v16H4zM9 4h3v16H9z"/><path d="M14.5 5.2l2.9-.8 3.6 14.6-2.9.7z"/>',
  coin: '<circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 10.5c0-1 1-1.6 2.5-1.6s2.5.7 2.5 1.6c0 2.2-5 1-5 3.2 0 1 1.1 1.6 2.5 1.6s2.5-.6 2.5-1.6"/>',
};
const icon = (n) => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]}</svg>`;

let toastTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

function commit(rerender = true) {
  C().updatedAt = Date.now();
  if (ui.mjView || C().stub) return void (rerender && render()); // fiche vue par le MJ ou MJ sans personnage : rien à enregistrer
  if (ui.guest) pushGuest(); else { store.save(); pushLent(C()); pushMJ(C()); }
  if (rerender) render();
}

// ================= État de l'interface =================
const ui = {
  tab: localStorage.getItem('dragonbane.tab') || 'fiche',
  // Mode MJ choisi dans la bannière (partie où je suis MJ), retenu d'un lancement à l'autre
  mjActive: localStorage.getItem('dragonbane.mjActive') === '1',
  // Mode de la fiche : 'normal' (toucher = jet), 'prog' (coches et amélioration), 'libre' (saisie)
  mode: 'normal',
  skillFilter: localStorage.getItem('dragonbane.skillFilter') || 'all',
};
const isFree = () => ui.mode === 'libre';
const isProg = () => ui.mode === 'prog';
const MODES = {
  normal: { label: 'Jeu', icon: 'd20', desc: 'Pour jouer : toucher un attribut ou une compétence lance le D20. Un Dragon (1) ou un Démon (20) coche automatiquement la compétence.' },
  prog: { label: 'Progression', icon: 'star', desc: 'Fin de séance : coche les compétences à améliorer, puis lance les jets d’amélioration (D20 au-dessus du niveau = +1).' },
  libre: { label: 'Libre', icon: 'edit', desc: 'Créer ou corriger un personnage : attributs, compétences et capacités se modifient directement.' },
};

const TABS = [
  ['fiche', 'Fiche', 'sheet'], ['combat', 'Combat', 'sword'], ['magie', 'Magie', 'wand'], ['sac', 'Sac', 'bag'],
  ['prog', 'Progrès', 'up'], ['carnet', 'Carnet', 'book'], ['journal', 'Journal', 'quill'], ['groupe', 'Groupe', 'users'], ['biblio', 'Biblio', 'library'],
];

// ================= Champs de formulaire =================
const F = {
  text: (name, label, val, cls = '', attrs = '') => `<div class="field ${cls}"><label>${label}</label><input name="${name}" value="${esc(val)}" ${attrs}></div>`,
  num: (name, label, val, cls = '', attrs = '') => `<div class="field ${cls}"><label>${label}</label><input type="number" inputmode="numeric" name="${name}" value="${esc(val)}" ${attrs}></div>`,
  area: (name, label, val, cls = 'full') => `<div class="field ${cls}"><label>${label}</label><textarea name="${name}">${esc(val)}</textarea></div>`,
  select: (name, label, val, opts, cls = '', attrs = '') => `<div class="field ${cls}"><label>${label}</label><select name="${name}" ${attrs}>${opts.map((o) => {
    const [v, l] = Array.isArray(o) ? o : [o, o];
    return `<option value="${esc(v)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(l)}</option>`;
  }).join('')}</select></div>`,
  check: (name, label, on, cls = '') => `<label class="check ${cls}"><input type="checkbox" name="${name}" ${on ? 'checked' : ''}><span>${label}</span></label>`,
};

// Champ lié directement au personnage (enregistré à la frappe)
const bind = (path, val, type = 'text', attrs = '') => type === 'area'
  ? `<textarea data-bind="${path}" ${attrs}>${esc(val)}</textarea>`
  : `<input data-bind="${path}" ${type === 'number' ? 'type="number" inputmode="numeric" data-num' : ''} value="${esc(val)}" ${attrs}>`;

function setPath(obj, path, value) {
  const keys = path.split('.');
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) o = o[keys[i]];
  o[keys.at(-1)] = value;
}
function getPath(obj, path) { return path.split('.').reduce((o, k) => o?.[k], obj); }

// ================= Dialogues =================
function openDialog({ title, body, actions = [], onOpen, cls = '' }) {
  dlg.onclick = null;
  dlg.innerHTML = `<form class="card ${cls}" autocomplete="off"><h2>${esc(title)}</h2>${body}<div class="dlg-actions">${actions.map((a, i) => a === 'spacer'
    ? '<span class="spacer"></span>'
    : `<button type="${a.primary ? 'submit' : 'button'}" class="btn ${a.cls || ''}" data-i="${i}">${a.label}</button>`).join('')}</div></form>`;
  const form = dlg.querySelector('form');
  const run = (a) => { const r = a.onClick ? a.onClick(form) : undefined; if (r !== false) dlg.close(); };
  dlg.querySelectorAll('.dlg-actions button').forEach((b) => {
    if (b.type === 'button') b.onclick = () => run(actions[b.dataset.i]);
  });
  form.onsubmit = (e) => { e.preventDefault(); const a = actions.find((x) => x.primary); if (a) run(a); };
  if (!dlg.open) dlg.showModal();
  onOpen?.(form);
}
dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
const cancel = { label: 'Annuler', cls: 'ghost' };
const closeBtn = { label: 'Fermer', cls: 'ghost' };

// ----- Connexion : compte Google ou e-mail + mot de passe (comme INS/MV ; utile sur iPad ou sans compte Google) -----
const authErr = (e) => ({
  'auth/invalid-credential': 'E-mail ou mot de passe incorrect',
  'auth/wrong-password': 'E-mail ou mot de passe incorrect',
  'auth/user-not-found': 'Aucun compte avec cet e-mail',
  'auth/invalid-email': 'Adresse e-mail invalide',
  'auth/missing-email': 'Saisis ton e-mail',
  'auth/missing-password': 'Mot de passe manquant',
  'auth/email-already-in-use': 'Un compte existe déjà avec cet e-mail : connecte-toi',
  'auth/weak-password': 'Mot de passe trop court (6 caractères minimum)',
  'auth/too-many-requests': 'Trop d’essais : réessaie dans quelques minutes',
  'auth/network-request-failed': 'Pas de connexion internet',
  'auth/operation-not-allowed': 'Connexion par e-mail non activée dans Firebase (voir README)',
  'auth/popup-blocked': 'Fenêtre Google bloquée par le navigateur',
  'auth/popup-closed-by-user': 'Fenêtre Google fermée',
  'auth/unauthorized-domain': 'Domaine non autorisé dans Firebase (voir README)',
}[e?.code] || e?.message || 'Erreur de connexion');

function loginDialog() {
  return new Promise((resolve, reject) => {
    let mode = 'login'; let done = false;
    const st = { email: '', pw: '', pw2: '' };
    const draw = (msg = '', info = '') => {
      const isNew = mode === 'new';
      openDialog({
        title: isNew ? 'Créer un compte' : 'Connexion',
        cls: 'login',
        body: `<p class="small muted">Le compte sauvegarde tes personnages et ton groupe en ligne, pour les retrouver sur tous tes appareils et partager le groupe. C’est le même compte que pour le Grimoire et INS/MV.</p>
          ${isNew ? '' : `<button type="button" class="btn full google" data-lg="google">${icon('google')} Continuer avec Google</button>
          <p class="small muted center or">ou avec ton e-mail (iCloud, Gmail, Outlook…)</p>`}
          <div class="fields">
            ${F.text('email', 'E-mail', st.email, 'full', 'type="email" autocomplete="email" autocapitalize="off" spellcheck="false"')}
            ${F.text('pw', `Mot de passe${isNew ? ' (6 caractères minimum)' : ''}`, st.pw, 'full', `type="password" autocomplete="${isNew ? 'new-password' : 'current-password'}"`)}
            ${isNew ? F.text('pw2', 'Confirme le mot de passe', st.pw2, 'full', 'type="password" autocomplete="new-password"') : ''}
          </div>
          ${msg ? `<p class="small bad">${esc(msg)}</p>` : ''}${info ? `<p class="small good">${esc(info)}</p>` : ''}
          <p class="small center">${isNew
            ? '<a href="#" data-lg="mode">J’ai déjà un compte</a>'
            : '<a href="#" data-lg="mode">Créer un compte</a> · <a href="#" data-lg="reset">Mot de passe oublié</a>'}</p>`,
        actions: [cancel, { label: isNew ? 'Créer le compte' : 'Se connecter', primary: true, onClick: (f) => { submit(f); return false; } }],
        onOpen: (f) => {
          const keep = () => { st.email = f.email.value; st.pw = f.pw.value; if (f.pw2) st.pw2 = f.pw2.value; };
          const busy = (on) => f.querySelectorAll('button, input').forEach((el) => { el.disabled = on; });
          const run = async (fn) => {
            keep(); busy(true);
            try { await fn(); done = true; dlg.close(); resolve(); } catch (e) { busy(false); draw(authErr(e)); }
          };
          submit = () => {
            keep();
            if (isNew && st.pw !== st.pw2) return draw('Les deux mots de passe ne sont pas identiques');
            run(() => (isNew ? cloud.signUpEmail(st.email, st.pw) : cloud.signInEmail(st.email, st.pw)));
          };
          f.querySelector('[data-lg="google"]')?.addEventListener('click', () => run(() => cloud.signInGoogle()));
          f.querySelector('[data-lg="mode"]').onclick = (e) => { e.preventDefault(); keep(); mode = isNew ? 'login' : 'new'; draw(); };
          const reset = f.querySelector('[data-lg="reset"]');
          if (reset) reset.onclick = async (e) => {
            e.preventDefault(); keep();
            if (!st.email.trim()) return draw('Saisis d’abord ton e-mail');
            try { await cloud.resetPassword(st.email); draw('', 'E-mail de réinitialisation envoyé (regarde aussi dans les spams).'); } catch (err) { draw(authErr(err)); }
          };
          setTimeout(() => (st.email ? f.pw : f.email).focus(), 50);
        },
      });
    };
    let submit = () => {};
    // Fermer la fenêtre sans s'être connecté = connexion annulée
    const onClose = () => { dlg.removeEventListener('close', onClose); if (!done) reject(Object.assign(new Error('Connexion annulée'), { code: 'auth/popup-closed-by-user' })); };
    draw();
    dlg.addEventListener('close', onClose);
  });
}
cloud.setLoginUI(loginDialog);

function confirmDialog(title, text, okLabel, onOk) {
  openDialog({ title, body: `<p>${text}</p>`, actions: [cancel, { label: okLabel, primary: true, onClick: onOk }] });
}

// ================= Journal =================
function logEntry(c, label, undo = null) {
  c.log.unshift({ id: R.uid(), date: Date.now(), label, undo });
  c.log = c.log.slice(0, 200);
}

// ================= Rendu =================
let welcomeOpened = false;
function syncButton() {
  const st = store.status;
  return `<button id="syncBtn" class="icon-btn sync-${st.state}" data-act="syncNow" title="${esc(st.message)}" aria-label="Synchronisation">${icon('cloud')}<span class="sync-dot"></span></button>`;
}

function renderWelcome() {
  $app.innerHTML = `<div class="shell">
    <header class="topbar">
      <div class="who"><span class="crest">?</span><span class="who-txt"><div class="who-name">Aucun personnage</div><div class="who-sub">Crée ton premier aventurier</div></span></div>
      <button class="icon-btn" data-act="manual" aria-label="Manuel d’utilisation">${icon('help')}</button>
      ${syncButton()}
      <button class="icon-btn" data-act="menu" aria-label="Menu">${icon('dots')}</button>
    </header>
    <main><section class="card welcome">
      <div class="welcome-art">${icon('d20')}</div>
      <h2>Bienvenue, aventurier</h2>
      <p>Commence par créer ton personnage : peuple, profession, âge, attributs et compétences entraînées.</p>
      <button class="btn block" data-act="newCharacter">${icon('plus')} Créer un personnage</button>
      <button class="btn ghost block mj-entry" data-act="mjJoin">👑 Je suis le meneur de jeu</button>
      <p class="small muted" style="margin:14px 0 0">Tu as déjà un personnage sur un autre appareil ? Touche le <b>nuage</b> pour te connecter : il reviendra tout seul. Tu as un fichier ? Menu <b>⋮</b> › Importer.</p>
    </section></main>
  </div>`;
  // Création proposée d'office… sauf sur un appareil relié à un groupe (sans doute le MJ, reconnu dès la connexion)
  if (!welcomeOpened && !dlg.open && !group.shared) { welcomeOpened = true; setTimeout(() => { if (!C() && !dlg.open) A.newCharacter(); }, 300); }
}

function render() {
  const c = C();
  if (!c) { renderWelcome(); return; }
  if (ui.tab === 'magie' && !R.isCaster(c)) ui.tab = 'fiche';
  if ((ui.guest || ui.mjView) && ui.mode !== 'normal') ui.mode = 'normal'; // personnage prêté ou vu par le MJ : ni mode libre ni progression
  if (ui.tab === 'mj' && !isMJ()) ui.tab = 'fiche';
  if (c.stub && !['mj', 'journal', 'groupe', 'biblio'].includes(ui.tab)) ui.tab = isMJ() ? 'mj' : 'groupe';
  watchLent(); mjSync(); mjWatch();
  const y = window.scrollY;
  const marked = c.skills.filter((s) => s.mark).length;
  $app.innerHTML = `<div class="shell mode-${ui.mode}">
    ${topbar(c)}
    ${ui.mjView ? `<div class="banner guest-banner mj-banner">👑<span>Fiche de <b>${esc(ui.mjView.name)}</b> (${esc(ui.mjViewPlayer || 'joueur')}) — lecture seule : rien n’est enregistré.</span><button class="btn small ghost-dark" data-act="mjClose">Retour au MJ</button></div>` : ''}
    ${ui.guest ? `<div class="banner guest-banner">🎭<span>Tu joues <b>${esc(ui.guest.name)}</b> à la place de ${esc(ui.guestOwner || 'son joueur')} — mode Jeu uniquement, tout est enregistré sur sa fiche.</span><button class="btn small ghost-dark" data-act="guestEnd">Rendre</button></div>` : ''}
    ${isFree() ? `<div class="banner free-banner">${icon('edit')}<span><b>Mode libre</b> — touche une valeur pour la changer, sans jet ni contrainte.</span><button class="btn small ghost-dark" data-act="setMode" data-m="normal">Terminer</button></div>` : ''}
    ${isProg() ? `<div class="banner prog-banner">${icon('star')}<span><b>Progression</b> — ${marked} compétence${marked > 1 ? 's' : ''} cochée${marked > 1 ? 's' : ''}${c.pendingMarks ? `, <b>${c.pendingMarks}</b> coche${c.pendingMarks > 1 ? 's' : ''} de fin de séance à placer` : ''}. Touche une compétence pour la cocher.</span>
      <button class="btn small gold" data-act="advanceRolls" ${marked ? '' : 'disabled'}>${icon('d20')} Jets d’amélioration</button></div>` : ''}
    <main>${VIEWS[ui.tab](c)}</main>
    <nav class="tabs">${[...(c.stub ? [] : TABS), ...(isMJ() && !ui.mjView ? [['mj', 'MJ', 'crown']] : []), ...(c.stub ? TABS.filter(([k]) => ['journal', 'groupe', 'biblio'].includes(k)) : [])].filter(([k]) => k !== 'magie' || R.isCaster(c)).map(([k, l, i]) => `<button class="${ui.tab === k ? 'active' : ''}" data-act="tab" data-tab="${k}">${icon(i)}<span>${l}</span></button>`).join('')}</nav>
  </div>`;
  window.scrollTo(0, y);
  if (ui.tab === 'biblio' && ui.libSearch) filterLib();
  if (ui.tab === 'journal') { afterJournal(); if (ui.jSearch) filterJournal(); } else { sketchCtl = null; stopSketchWatch(); }
  presWatch(); presShow();
}

function topbar(c) {
  if (c.stub) {
    return `<header class="topbar">
    <button class="who" data-act="characters" aria-label="Mes personnages"><span class="crest">${isMJ() ? "👑" : "?"}</span><span class="who-txt"><div class="who-name">${isMJ() ? "Meneur de jeu" : "Sans personnage"}</div><div class="who-sub">${esc(group.shared?.name || '')}</div></span></button>
    <button class="icon-btn" data-act="manual" aria-label="Manuel d’utilisation">${icon('help')}</button>
    ${syncButton()}
    <button class="icon-btn" data-act="menu" aria-label="Menu">${icon('dots')}</button>
  </header>`;
  }
  const sub = [R.kinName(c), R.profName(c), R.AGE[c.age]?.name].filter(Boolean).join(' · ');
  return `<header class="topbar">
    <button class="who" data-act="characters" aria-label="Changer de personnage">
      ${c.portrait ? `<span class="crest photo" style="background-image:url('${c.portrait}')"></span>` : `<span class="crest">${esc((c.name || '?').trim().charAt(0).toUpperCase())}</span>`}
      <span class="who-txt"><div class="who-name">${esc(c.name || 'Sans nom')}</div><div class="who-sub">${esc(sub || 'Touche pour gérer tes personnages')}</div></span>
    </button>
    <button class="mode-toggle mode-${ui.mode}" data-act="modeMenu" aria-label="Mode : ${MODES[ui.mode].label}">${icon(MODES[ui.mode].icon)}<span>${MODES[ui.mode].label}</span></button>
    <button class="icon-btn" data-act="manual" aria-label="Manuel d’utilisation">${icon('help')}</button>
    ${syncButton()}
    <button class="icon-btn" data-act="menu" aria-label="Menu">${icon('dots')}</button>
  </header>`;
}

// Petite barre PV / PVol / états, en tête de Fiche et Combat
function vitals(c) {
  const hpMax = R.maxHP(c); const wpMax = R.maxWP(c);
  const conds = R.ATTRS.filter((a) => c.conditions[a.key]);
  return `<div class="vitals">
    <div class="vital hp" data-act="tab" data-tab="combat"><span class="vk">PV</span><span class="vv">${c.hp.cur}<small>/${hpMax}</small></span><span class="vbar"><i style="width:${hpMax ? clamp(c.hp.cur / hpMax * 100, 0, 100) : 0}%"></i></span></div>
    <div class="vital wp" data-act="tab" data-tab="combat"><span class="vk">PVol</span><span class="vv">${c.wp.cur}<small>/${wpMax}</small></span><span class="vbar"><i style="width:${wpMax ? clamp(c.wp.cur / wpMax * 100, 0, 100) : 0}%"></i></span></div>
    <div class="vital conds" data-act="tab" data-tab="combat">${c.music ? '<span class="cond-pill music">♪ Barde</span>' : ''}${conds.length ? conds.map((a) => `<span class="cond-pill">${a.cond}</span>`).join('') : c.music ? '' : '<span class="vk">Aucun état</span>'}</div>
  </div>`;
}

// ----- Portrait du personnage -----
// L'image est réduite (600 × 800 au plus) et enregistrée en JPEG dans la fiche (c.portrait) :
// elle suit la sauvegarde, l'export et la synchro. On vise moins de ~200 Ko.
function readPortrait(file, maxW = 600, maxH = 800, maxLen = 270000) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const k = Math.min(1, maxW / img.width, maxH / img.height);
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      const g = cv.getContext('2d');
      g.fillStyle = '#f3e6c8'; g.fillRect(0, 0, cv.width, cv.height); // fond pour les images transparentes
      g.drawImage(img, 0, 0, cv.width, cv.height);
      let q = 0.85; let data = cv.toDataURL('image/jpeg', q);
      while (data.length > maxLen && q > 0.45) { q -= 0.1; data = cv.toDataURL('image/jpeg', q); }
      resolve(data);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image illisible')); };
    img.src = url;
  });
}
// Téléphone ou tablette : on propose aussi l'appareil photo (sur ordinateur, seulement le choix de fichier)
const canCamera = () => matchMedia('(pointer: coarse)').matches;
// Ouvre l'appareil photo (camera = true) ou la galerie / les fichiers, et rend le fichier choisi
function chooseImage(camera, onFile) {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = 'image/*';
  if (camera) inp.setAttribute('capture', 'environment');
  inp.onchange = () => { const f = inp.files[0]; if (f) onFile(f); };
  inp.click();
}
function pickPortrait(camera = false) {
  const c = C(); if (!c) return;
  chooseImage(camera, async (f) => {
    try { c.portrait = await readPortrait(f); commit(); toast('Portrait ajouté'); } catch (e) { toast(e.message || 'Image illisible'); }
  });
}
function portraitCard(c) {
  if (!c.portrait) {
    return `<section class="card portrait-card empty-portrait">
      ${canCamera() ? `<button class="btn ghost small" data-act="portraitPick" data-cam="1">${icon('camera')} Prendre une photo</button>` : ''}
      <button class="btn ghost small" data-act="portraitPick">${icon('plus')} ${canCamera() ? 'Choisir une image' : 'Ajouter un portrait'}</button>
    </section>`;
  }
  return `<section class="card portrait-card">
    <button class="portrait" data-act="portraitView" aria-label="Voir le portrait"><img src="${c.portrait}" alt="Portrait de ${esc(c.name || 'ton personnage')}"></button>
  </section>`;
}

// ---------- Fiche ----------
function viewFiche(c) {
  const attrs = R.ATTRS.map(({ key, name, cond }) => {
    const v = c.attrs[key];
    const on = c.conditions[key];
    return `<button class="attr ${on ? 'cond' : ''}" data-act="attr" data-k="${key}" title="${name}${on ? ` — ${cond} : désavantage` : ''}">
      <span class="ak">${key}</span><span class="av">${v}</span><span class="an">${name}</span>
      ${isFree() ? `<span class="ac">Base ${R.baseChance(v)}</span>`
        // En jeu : la ligne du bas est l'interrupteur de l'état lié (le reste de la case lance le dé)
        : `<span class="ac cond-tog ${on ? 'on' : ''}" data-act="cond" data-k="${key}" role="button" title="${on ? `Retirer l’état ${cond}` : `Mettre l’état ${cond} (désavantage aux jets de ${name})`}">${on ? `⚠ ${cond}` : cond}</span>`}
    </button>`;
  }).join('');

  const fb = R.damageBonus(c.attrs.FOR); const ab = R.damageBonus(c.attrs.AGI);
  const used = R.encUsed(c); const lim = R.encLimit(c);

  let skills = [...c.skills];
  if (ui.skillFilter === 'trained') skills = skills.filter((s) => s.trained);
  if (ui.skillFilter === 'arme') skills = skills.filter((s) => s.kind === 'arme');
  if (ui.skillFilter === 'marked') skills = skills.filter((s) => s.mark);
  if (ui.skillFilter === 'all') skills = skills.filter((s) => s.kind !== 'magie' || R.knowsMagic(s) || isFree());
  const groups = ['gen', 'arme', 'magie', 'autre'].map((k) => {
    const list = skills.filter((s) => (s.kind || 'autre') === k).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    if (!list.length) return '';
    return `<h3>${R.SKILL_KINDS[k]}</h3><div class="skills">${list.map((s) => skillRow(c, s)).join('')}</div>`;
  }).join('') || '<div class="empty">Aucune compétence ici.</div>';

  const abilities = c.abilities.map((a, i) => `<button class="list-item" data-act="ability" data-i="${i}">
      <span class="badge ${a.wp ? '' : 'soft'}" title="Coût en points de Volonté">${a.wp ? `${esc(a.wp)}` : '—'}</span>
      <span class="li-main"><div class="li-title">${esc(a.name)}${a.source ? ` <span class="tag">${esc(a.source)}</span>` : ''}</div>${abilityDesc(a) ? `<div class="li-sub">${esc(abilityDesc(a))}</div>` : ''}</span>
    </button>`).join('') || '<div class="empty">Aucune capacité.</div>';

  return `${vitals(c)}
  <div class="grid fiche">
    <section class="card attrs-card">
      <h2>Attributs</h2>
      <div class="attrs">${attrs}</div>
      <div class="stats-row">
        <div class="stat"><div class="sk">Déplacement</div><div class="sv">${R.movement(c)}</div></div>
        <div class="stat"><div class="sk">Bonus FOR</div><div class="sv">${fb ? `+${fb}` : '—'}</div></div>
        <div class="stat"><div class="sk">Bonus AGI</div><div class="sv">${ab ? `+${ab}` : '—'}</div></div>
        <div class="stat ${used > lim ? 'over' : ''}"><div class="sk">Charge</div><div class="sv">${used}<small>/${lim}</small></div></div>
      </div>
      <p class="small muted hint">${isFree() ? 'Touche un attribut pour modifier sa valeur.' : 'Touche un attribut pour lancer le D20 (réussite si ≤ valeur), ou l’étiquette du bas pour mettre ou retirer son état.'}</p>
    </section>
    ${portraitCard(c)}
    <section class="card skills-card">
      <h2>Compétences</h2>
      <div class="filters">
        ${[['all', 'Toutes'], ['trained', 'Entraînées'], ['arme', 'Armes'], ['marked', 'Cochées ✦']].map(([k, l]) => `<button class="chip ${ui.skillFilter === k ? 'on' : ''}" data-act="skillFilter" data-f="${k}">${l}</button>`).join('')}
      </div>
      ${groups}
      ${isFree() ? `<div class="add-row"><button class="btn ghost small" data-act="addSkill">${icon('plus')} Autre compétence</button></div>` : ''}
      <p class="small muted hint">● entraînée · ✦ cochée pour l’amélioration · ${isProg() ? 'touche une compétence pour la cocher' : isFree() ? 'touche pour modifier' : 'touche pour lancer le D20'}</p>
    </section>
    <section class="card">
      <h2>Capacités héroïques</h2>
      ${abilities}
      ${isFree() || isProg() ? `<div class="add-row"><button class="btn ${isProg() ? 'gold' : 'ghost'} small" data-act="addAbility">${icon('plus')} ${isProg() ? 'Nouvelle capacité héroïque' : 'Ajouter une capacité'}</button></div>` : ''}
    </section>
  </div>`;
}

function skillRow(c, s) {
  const cond = c.conditions[s.attr];
  const banes = R.armorBanes(c, s);
  const max = s.value >= 18;
  return `<button class="skill ${s.trained ? 'trained' : ''} ${s.mark ? 'marked' : ''}" data-act="skill" data-id="${s.id}">
    <span class="sdot">${s.trained ? '●' : ''}</span>
    <span class="sn">${esc(s.name)}${banes.length ? ` <small class="bane" title="Désavantage : ${esc(banes.join(', '))}">▼</small>` : ''}</span>
    <span class="sa ${cond ? 'cond' : ''}" title="${cond ? `${R.ATTR[s.attr].cond} : désavantage` : ''}">${s.attr}</span>
    <span class="sv ${max ? 'max' : ''}">${s.value}</span>
    ${max && !s.mark ? '<span class="smark"></span>' : `<span class="smark ${s.mark ? 'on' : ''}" data-act="markSkill" data-id="${s.id}" title="${s.mark ? 'Cochée pour l’amélioration' : 'Cocher après un Dragon ou un Démon'}">${s.mark ? '✦' : '✧'}</span>`}
  </button>`;
}

// ---------- Combat ----------
function viewCombat(c) {
  const hpMax = R.maxHP(c); const wpMax = R.maxWP(c);
  const pool = (k, label, cur, max, cls) => `<section class="card pool ${cls}">
    <h2>${label}</h2>
    <div class="pool-row">
      <button class="round-btn" data-act="pool" data-k="${k}" data-d="-1" aria-label="Retirer 1">${icon('minus')}</button>
      <button class="big" data-act="poolSet" data-k="${k}">${cur}<small>/${max}</small></button>
      <button class="round-btn" data-act="pool" data-k="${k}" data-d="1" aria-label="Ajouter 1">${icon('plus')}</button>
    </div>
    <div class="bar"><i style="width:${max ? clamp(cur / max * 100, 0, 100) : 0}%"></i></div>
  </section>`;

  const death = c.hp.cur <= 0 ? `<section class="card death span-all">
      <h2>Jets de mort</h2>
      <p class="small">À 0 PV, lance un jet de <b>CON</b> à chaque tour. Trois réussites : tu es hors de danger. Trois échecs : ton personnage meurt.</p>
      <div class="death-row"><span>Réussites</span>${[0, 1, 2].map((i) => `<i class="pip ok ${i < c.death.succ ? 'on' : ''}"></i>`).join('')}</div>
      <div class="death-row"><span>Échecs</span>${[0, 1, 2].map((i) => `<i class="pip ko ${i < c.death.fail ? 'on' : ''}"></i>`).join('')}</div>
      ${c.death.fail >= 3 ? '<p class="verdict demon">Ton personnage est mort.</p>' : c.death.succ >= 3 ? '<p class="verdict dragon">Hors de danger.</p>' : ''}
      <div class="add-row"><button class="btn" data-act="deathRoll" ${c.death.fail >= 3 || c.death.succ >= 3 ? 'disabled' : ''}>${icon('d20')} Jet de mort (CON ${c.attrs.CON})</button><button class="btn ghost small" data-act="deathReset">Remettre à zéro</button></div>
    </section>` : '';

  const conds = R.ATTRS.map((a) => `<button class="cond-chip ${c.conditions[a.key] ? 'on' : ''}" data-act="cond" data-k="${a.key}"><b>${a.cond}</b><small>${a.key}</small></button>`).join('');

  const weapons = c.weapons.map((w, i) => {
    const sk = c.skills.find((s) => s.id === w.skill);
    const bonus = w.bonus ? R.damageBonus(c.attrs[w.bonus]) : '';
    return `<div class="weapon ${w.broken ? 'broken' : ''}">
      <div class="w-head"><b>${esc(w.name || 'Arme')}</b>${w.broken ? ' <span class="tag bad">brisée</span>' : ''}</div>
      <div class="w-stats">
        <span><small>Compétence</small>${esc(sk?.name || '—')} <b>${sk?.value ?? '—'}</b></span>
        <span><small>Dégâts</small><b>${esc(w.damage || '—')}${bonus ? ` + ${bonus}` : ''}</b></span>
        ${w.range ? `<span><small>Portée</small>${esc(rangeTxt(c, w.range))}</span>` : ''}
        ${+w.strReq ? `<span class="${+c.attrs.FOR < +w.strReq ? 'bad' : ''}"><small>FOR min.</small>${w.strReq}</span>` : ''}
        ${w.durability ? `<span><small>Solidité</small>${esc(w.durability)}</span>` : ''}
        ${w.grip ? `<span><small>Prise</small>${esc(w.grip)}</span>` : ''}
      </div>
      ${w.features ? `<div class="small muted">${esc(w.features)}</div>` : ''}
      <div class="w-actions">
        <button class="btn small" data-act="attack" data-i="${i}" ${sk ? '' : 'disabled'}>${icon('d20')} Attaquer</button>
        <button class="btn small ghost" data-act="parry" data-i="${i}" ${sk ? '' : 'disabled'}>${icon('shield')} Parer</button>
        <button class="btn small gold" data-act="damage" data-i="${i}" ${w.damage ? '' : 'disabled'}>Dégâts</button>
        <button class="btn small ghost" data-act="sneak" data-i="${i}" ${sk ? '' : 'disabled'} title="Attaque sournoise">🗡 Sournoise</button>
      </div>
    </div>`;
  }).join('') || '<div class="empty">Aucune arme.</div>';

  // Lecture seule : armes et armures se gèrent dans le Sac
  const armor = (k, label) => {
    const a = c[k];
    if (!a.name && !a.rating) return '';
    return `<div class="list-item">
      <span class="badge ${a.rating ? '' : 'soft'}">${a.rating || 0}</span>
      <span class="li-main"><div class="li-title">${esc(a.name || label)}</div><div class="li-sub">${a.banes ? `Désavantage : ${esc(a.banes)}` : 'Aucun désavantage'}</div></span>
    </div>`;
  };
  const toSac = (label) => `<button class="btn ghost small" data-act="tab" data-tab="sac">${icon('bag')} ${label}</button>`;
  const armorRows = armor('armor', 'Armure') + armor('helmet', 'Casque');

  const esquive = c.skills.find((s) => s.id === 'esquive');
  return `<div class="grid combat">
    <section class="card span-all">
      <h2>États</h2>
      <div class="conds">${conds}</div>
      <div class="cond-foot">
        <p class="small muted hint">Un état donne un désavantage aux jets de l’attribut indiqué et des compétences qui en dépendent.</p>
        <!-- Barde : petite pastille sur la même ligne que l'aide -->
        <button class="music-toggle compact ${c.music ? 'on' : ''}" data-act="music" aria-pressed="${c.music ? 'true' : 'false'}" title="${c.music ? 'Le barde joue : avantage à tous tes jets. Touche pour arrêter.' : 'Touche quand le barde joue : avantage à tous tes jets.'}">
          <span class="mt-icon">♪</span><span class="mt-txt">${c.music ? '<b>Le barde joue</b> · avantage' : 'Musique du barde'}</span><span class="mt-switch"><i></i></span>
        </button>
      </div>
    </section>
    ${pool('hp', 'Points de vie', c.hp.cur, hpMax, 'hp')}
    ${pool('wp', 'Points de volonté', c.wp.cur, wpMax, 'wp')}
    ${death}
    <section class="card">
      <h2>Armes</h2>
      ${weapons}
      <div class="add-row">${c.weapons.length ? '' : toSac('Ajouter des armes dans le Sac')}
      ${esquive ? `<button class="btn ghost small" data-act="skill" data-id="esquive" data-roll="1">${icon('d20')} Esquiver (${esquive.value})</button>` : ''}</div>
    </section>
    <section class="card">
      <h2>Armure</h2>
      <div class="armor-total"><span>Valeur d’armure</span><b>${R.armorTotal(c)}</b></div>
      ${armorRows || `<div class="empty">Ni armure ni casque.</div><div class="add-row">${toSac('Équiper dans le Sac')}</div>`}
    </section>
    ${combatAbilities(c)}
    <section class="card">
      <h2>Repos</h2>
      <div class="rests">
        <button class="btn ghost ${c.rests?.round ? 'used' : ''}" data-act="rest" data-r="round">${icon('moon')} Repos de round<small>+D6 PVol${c.rests?.round ? ' · déjà pris' : ''}</small></button>
        <button class="btn ghost ${c.rests?.stretch ? 'used' : ''}" data-act="rest" data-r="stretch">${icon('moon')} Repos court<small>+D6 PV, +D6 PVol, 1 état${c.rests?.stretch ? ' · déjà pris' : ''}</small></button>
        <button class="btn ghost" data-act="rest" data-r="shift">${icon('moon')} Repos long<small>Tout récupéré</small></button>
      </div>
    </section>
    <section class="card">
      <h2>Dés</h2>
      <div class="dice-btns">${[4, 6, 8, 10, 12, 20].map((n) => `<button class="die-btn" data-act="freeRoll" data-e="D${n}">${dieSvg(n, 'mini')}D${n}</button>`).join('')}
        <button class="die-btn wide" data-act="freeRoll" data-e="">Autre…</button></div>
    </section>
  </div>`;
}

// Capacités utiles en combat (repère de la bibliothèque ; les capacités inconnues avec un coût sont gardées)
function combatAbilities(c) {
  const list = c.abilities.map((a, i) => ({ a, i, info: R.abilityInfo(a.name) }))
    .filter(({ a, info }) => (info ? info.combat : parseInt(a.wp, 10) > 0));
  if (!list.length) return '';
  return `<section class="card span-all">
    <h2>Capacités de combat</h2>
    <div class="cab-list">${list.map(({ a, i }) => {
      const cost = parseInt(a.wp, 10);
      const variable = /variable/i.test(a.wp || '');
      const can = !cost || c.wp.cur >= cost;
      return `<div class="cab">
        <div class="cab-main" data-act="ability" data-i="${i}"><b>${esc(a.name)}</b><small>${esc(abilityDesc(a))}</small></div>
        ${cost || variable ? `<button class="btn small ${can ? '' : 'ghost'}" data-act="useAbility" data-i="${i}" ${can ? '' : 'disabled'}>${cost ? `${cost} PVol` : 'PVol…'}</button>` : '<span class="tag">passive</span>'}
      </div>`;
    }).join('')}</div>
    <p class="small muted hint">Le bouton dépense les PVol (tu en as ${c.wp.cur}). Touche le nom pour le détail.</p>
  </section>`;
}

// ---------- Groupe : caisse commune et matériel par monture / véhicule ----------
// Les données passent par group.js : chaque modification est une opération notée au journal (qui, quoi),
// partagée en direct si le groupe est partagé.
const G = () => group.state;
const author = () => (C()?.stub ? (isMJ() ? `MJ (${group.shared?.mjName || 'MJ'})` : ownerName()) : ui.guest ? `${ui.guest.name} (joué par ${store.current()?.name || 'un joueur'})` : C()?.name || store.userEmail || 'Joueur');
// Applique une opération du groupe ; false (et message) si elle est impossible
function gApply(op, okMsg = '') {
  try {
    const e = group.apply(op, author());
    render();
    if (okMsg) toast(okMsg);
    return e || true;
  } catch (err) { toast(err.message); return false; }
}
// Retire un montant (en cuivre) d'une bourse en rendant la monnaie ; false s'il manque de l'argent
function purseTake(m, amount) {
  const total = totalCopper(m);
  if (amount > total) return false;
  let rest = total - amount;
  const or = Math.min(+m.or || 0, Math.floor(rest / 100)); rest -= or * 100;
  const argent = Math.floor(rest / 10); rest -= argent * 10;
  Object.assign(m, { or, argent, cuivre: rest });
  return true;
}
const purseAdd = (m, coins) => { for (const k of ['or', 'argent', 'cuivre']) m[k] = (+m[k] || 0) + (+coins[k] || 0); };
// Corrige la bourse d'un personnage de cet appareil (versement vers / depuis la caisse, ou son annulation)
function purseFix(p) {
  const ch = p && store.list().find((x) => x.id === p.cid);
  if (!ch) return;
  if (p.sign > 0) purseAdd(ch.money, cuToCoins(p.cu)); else if (!purseTake(ch.money, p.cu)) ch.money = { or: 0, argent: 0, cuivre: 0 };
  ch.updatedAt = Date.now(); store.save();
}
// Icône dessinée (cartes) et emoji (listes déroulantes, qui n'affichent que du texte)
const carrierKind = (k) => (R.CARRIER_TYPES[k.type]?.animal ? 'monture' : k.type === 'coffre' ? 'coffre' : k.type === 'barque' ? 'barque' : k.type === 'chariot' ? 'chariot' : 'charrette');
// Pictogrammes des transports : icônes de game-icons.net (licence CC BY 3.0 — Skoll, Delapouite, Lorc ; crédits dans le manuel),
// tracés d'origine (viewBox 0 0 512 512), remplis de la couleur du texte.
const CARRIER_SVG = {
  ane: 'M363.426 18.516s-43.17 34.89-62 89.74c-7.55 22.02-12.52 43.05-14.77 60.69-25 5.23-70.76 33.85-70.76 33.85l-35-3.79 12.08 18.29-36.08 5.71 15.83 14.89-30.37-1.35 3.37 12.82-27-.68 2.7 20.798-23.63-4.548 2.7 23.62-18.9-3.77-.67 19.288-29.7-4.72 2.7 22.27L18 332.085V494h178.46l67.597-115.734-36-45.782 12.63-9.82 44.43 56.53c4.5 4.47 9.25 8.63 12.5 10 17.69 7.47 53.25 8.35 69.69 18.21 9.25 5.52 20.38 26.832 30.52 30.522 1.76.516 3.595.742 5.43.67 8.88 0 22.65-3.112 22.65-3.112l12.49 12.16 11.66-10-30.59-31.32 11.44-11.19 32.38 33.09 2.19-1.548s9.76-54.132 3.2-70.512c-7.79-19.47-45.732-43.81-57.232-61.35-9.47-14.4-16.998-49.51-27.468-63.18-10.17-13.32-31.17-33.618-52.17-47.618 8.99-15.24 17.91-34.76 25.41-56.62 18.83-54.88 6.21-108.88 6.21-108.88zm65.79 21.7s-22 11.37-45.94 33.8a214.075 214.075 0 0 1-10.92 58.61c-5.43 16.018-12.002 31.63-19.66 46.71 3.28 2.51 6.47 5.1 9.58 7.71a357.567 357.567 0 0 0 32.94-43.892c31.32-48.77 34-102.94 34-102.94zm-86.43 214.01c13.597 0 20.403 16.437 10.79 26.05-9.613 9.612-26.05 2.805-26.05-10.792 0-8.427 6.833-15.26 15.26-15.26zm106.98 101.92c2.69 0 4.88 7 4.88 15.7s-2.19 15.7-4.88 15.7-4.88-7.03-4.88-15.7c0-8.67 2.19-15.7 4.88-15.7z', // Âne : tête d’âne, par Skoll
  cheval: 'M400 16c-21.335 9.73-58.244 17.34-73.086 48.232-22.36 1.948-72.753 10.673-122.22 40.25-58.098 34.74-116.017 97.417-131.776 213.702l-.48 3.537-2.774 2.25c-30.87 25.002-40.657 38.937-44.416 61.153-3.536 20.9-.72 51.46-.363 101.877H328.36c3.455-16.892 10.44-29.245 12.472-41.568 2.337-14.176.19-29.938-20.812-58.547-43.078-58.683-46.853-129.458-12.916-171.28-8.654-2.765-15.09-6.887-19.458-12.546-6.115-7.924-7.4-17.006-8.57-25.884l17.848-2.352c1.112 8.446 2.38 13.88 4.97 17.237 2.59 3.356 7.31 6.472 19.55 8.46l-.022.128.172-.17 5.998 9.424c19.957 31.358 42.84 51.292 73.332 54.44l6.51.672 1.367 6.4c2.74 12.828 8.626 19.095 15.116 22.238 6.49 3.143 14.225 2.944 20.47.205 9.316-4.086 14.518-11.35 16.7-22.712 2.122-11.05.546-25.834-5.137-42.106-33.538-38.248-44.475-87.277-63.903-128.772-6.055-9.947-12.448-18.518-20.385-24.856C376.808 55.126 386.456 34.852 400 16zM214.068 34.97C179.55 35.06 146.075 43.06 96 58.58c31.146 9.92 70.397 18.9 86.037 39.01 4.463-3.017 8.94-5.88 13.418-8.56 40.51-24.22 80.387-35.286 108.23-40.04-35.854-9.477-63.047-14.094-89.617-14.023zM157.16 96.712c-1.13-.01-2.265-.01-3.402.004-30.353.37-63.1 9.745-96.647 31.283 27.186 3.672 54.67 3.724 72.58 15.398 15.9-17.92 33.144-32.634 50.677-44.668-7.548-1.244-15.292-1.938-23.207-2.017zM368 128a13.214 13.215 0 0 1 13.213 13.215A13.214 13.215 0 0 1 368 154.432a13.214 13.215 0 0 1-13.213-13.217A13.214 13.215 0 0 1 368 128zm-238.906 16.068c-36.395 1.495-68.903 6.53-104.76 24.766 33.236 7.095 50.913 13.507 65.025 33.83 11.522-22.53 25.045-41.93 39.734-58.596zM74.518 201.46C53.53 201.65 36.614 213.14 16 224c27.854 0 46.067 3.862 58.71 12.055 4.33-11.652 9.16-22.615 14.41-32.924-5.12-1.19-9.963-1.71-14.602-1.67zm-.623 36.82c-17.933 5.845-35.452 7.15-54.23 22.284 17.62 4.638 34.79 9.596 41.398 22.034 3.496-15.77 7.814-30.523 12.832-44.32zm370.142 8.57c1.617-.035 3.222.044 4.783.187l-1.64 17.926c-3.928-.36-5.513.416-5.57.465-.058.048-1.035.656-.635 5.886l-17.95 1.372c-.638-8.35 1.297-16.207 6.955-20.997 4.245-3.593 9.206-4.735 14.057-4.84zM52.215 290.723c-10.352.13-23.76 5.646-34.656 12.334 12.173 6.83 12.357 23.472 8.938 37.668 7.3-9.105 16.855-18.323 29.158-28.48 1.016-7.043 2.19-13.9 3.506-20.585-2.082-.67-4.42-.97-6.947-.937z', // Cheval : tête de cheval, par Delapouite
  destrier: 'M222.776 64.76a16.1 16.1 0 0 1 4.22.56c8.45 2.29 13.88 11.15 14.57 22l-25.78 6 21.89 13.86c-4.93 10.47-13.67 17.3-22.34 17.3a16.1 16.1 0 0 1-4.22-.56c-11.68-3.16-17.59-18.85-13.2-35 3.87-14.26 14.43-24.16 24.86-24.16zm-20.29-9.44a38.78 38.78 0 0 1 9.18-4.65c-5.47-4.23-12.06-8.82-15.9-9.73-27.8-6.55-28.34 34.41-49.08 15.35 16.77 30.56 35.36-12.18 55.8-.96zm54 115.56c-6.437-14.24-23.208-20.557-37.44-14.1l23.34 51.55c14.246-6.438 20.57-23.21 14.12-37.45zm-69.52 35l-21.72-6.66-60.94 31 7.16 14.07zm29.88-65.41h-1.53c-2.836.002-5.66-.37-8.4-1.11a32.64 32.64 0 0 1-14.27-8.23l-19.49 53.78 47.69 14.63-10.68-23.59-14-2.64 9.69-7-8.01-17.51s17.52-7.83 19-8.33zm-132.65 143c-64.72-46.18 42-97.32-47.05-105.87 59.27 26.57-49.43 44.81-10.25 97.71 7.49 10.11 34.76 24.95 49.64 32.56a78.51 78.51 0 0 1 7.7-24.38zm132.79-63.26l2.31-4.42-10.29-3.15-49.91 25.39 68.65 26.47-48.34 40.09 40.63 26.55-6.5-23.93 45.41-49zm13.73-82c4.898.003 9.76.82 14.39 2.42l41.79-21.22a184.67 184.67 0 0 0-35.66-3.51c-5.68 11-14.35 19-24.17 22.51 1.21-.09 2.43-.16 3.65-.16zm182 124.37h-4.15c-5.37 0-11.36-.21-17.77-.63l12.66 18 25-7.33s-1.13-4.55-2.74-11.23a82.78 82.78 0 0 1-13.04 1.23zm-138.97-46.37c13.84-22.89 46.76-66.73 96-66.73 16.79 0 35.49 5.1 56 17.86l-11 19.83.21 21.93c-.43 3.25 3.4 21 7.08 36.9-6.65 1.15-23 1-43.18-1l-5.68-8.1c-16.16-9.55-28.75-15.76-28.75-15.76s.91 7.77 1.22 19.23c-23.06-4.18-46.85-10.67-64.84-20.13a81.992 81.992 0 0 1-7.06-4.03zm120.1-18.38c0 4.678 5.655 7.02 8.963 3.712 3.306-3.307.964-8.962-3.714-8.962a5.25 5.25 0 0 0-5.25 5.25zm-132.64-47.42a44.15 44.15 0 0 1 9.43 12.91l223.21-123.4v-9.4zm76.17 154.12c5.64-14.72 7.68-32.58 8.2-48a325.89 325.89 0 0 1-49-12.25 151.31 151.31 0 0 1-30.12-13.81l13.78 96.66-129 17.14-10.39-87.05c-4.26 1.77-8.45 3.64-12.54 5.64-58.81 28.68-29.46 96.18-29.46 96.18l-25 49.21 30.11 54.35v18.81h33.9l-15.74-22.83-14.48-52.57 48.87-46.4c27.89 1.26 102.44-11.49 134.52-17l83 4.55 22.88 29.29-16.85 12.55 29.55 13.9 9.37-18.45-19.23-49.28zm-51.22-131.12l-11.31 5.72a44.08 44.08 0 0 1-.07 7.38c3.46-4.32 7.23-8.75 11.38-13.1zm31.69 231.92l-5-45.44-20.89-1.14c-6.2 1.06-13.11 2.22-20.44 3.43l21.46 47.74 17.68 54.56-.63 17h31.67l-9.65-17.83zm-140.38 19.45l36.79-53.82c-21.33 2.95-51.31 5.07-51.47 5.07l2.93 7.61-19.1 41.87 47 44.07v11.75h28.65l-11.35-12.92z', // Cheval de guerre : chevalier monté, par Skoll
  char: 'M253.75 18.72C150.05 19.84 55.67 89.402 27.5 194.53-6.415 321.106 68.582 451.023 195.156 484.94c126.574 33.915 256.49-41.083 290.406-167.657C519.478 190.708 444.48 60.79 317.906 26.876c-19.777-5.3-39.657-7.957-59.22-8.156-1.65-.018-3.29-.02-4.936 0zm2.313 53.81c12.822-.048 25.848 1.247 38.843 4.032 1.034.222 2.06.48 3.094.72.488.115.98.223 1.47.343.51.123 1.018.247 1.53.375 1.004.255 1.994.512 3 .78 3.028.812 6.018 1.674 8.97 2.626 41.44 13.382 75.138 40.527 97.374 74.906.1.158.21.312.312.47.742 1.153 1.473 2.33 2.188 3.5.812 1.33 1.596 2.65 2.375 4 .733 1.27 1.452 2.555 2.155 3.843.594 1.09 1.177 2.18 1.75 3.28.107.207.206.42.313.626.08.16.17.312.25.47 18.66 36.453 25.32 79.192 16.187 121.78-.323 1.508-.7 3.026-1.063 4.533-.374 1.525-.747 3.037-1.156 4.562-.81 3.028-1.672 6.018-2.625 8.97-13.38 41.44-40.526 75.138-74.905 97.374-.157.1-.31.21-.47.31-1.153.743-2.33 1.474-3.5 2.19-1.328.81-2.65 1.595-4 2.374-1.27.734-2.554 1.453-3.842 2.156-1.09.594-2.18 1.177-3.282 1.75-.205.107-.417.206-.624.313-.157.08-.31.17-.47.25-36.452 18.66-79.19 25.32-121.78 16.187-1.507-.323-3.025-.693-4.53-1.063-.01-.002-.022.003-.032 0-1.516-.37-3.016-.75-4.53-1.156-3.03-.81-6.02-1.67-8.97-2.624-41.49-13.398-75.107-40.577-97.22-75-.068-.107-.15-.205-.218-.312-.773-1.21-1.505-2.43-2.25-3.656-.015-.025-.047-.04-.062-.063-.34-.56-.666-1.124-1-1.688-1.16-1.956-2.29-3.938-3.375-5.937-.7-1.287-1.395-2.57-2.064-3.875-.113-.22-.232-.436-.344-.656-18.464-36.382-24.94-79.035-15.812-121.533.324-1.506.693-3.025 1.063-4.53.002-.01-.003-.022 0-.032.37-1.516.75-3.017 1.156-4.53.33-1.242.672-2.463 1.03-3.69.08-.272.17-.54.25-.81.437-1.473.875-2.952 1.344-4.407.007-.022.024-.04.03-.063 13.345-41.36 40.262-75.04 74.44-97.313 1.284-.837 2.567-1.662 3.874-2.468.02-.012.042-.02.062-.03.99-.612 1.998-1.222 3-1.814.342-.202.688-.394 1.03-.594.687-.4 1.373-.797 2.064-1.187.485-.275.98-.544 1.47-.814.23-.13.453-.278.686-.406 1.314-.72 2.638-1.407 3.97-2.094 23.324-12.032 49.244-19.11 76.093-20.22 2.247-.09 4.49-.146 6.75-.155zm33.968 22.157l-25.75 96.188c3.07.368 6.15.96 9.22 1.78 3.062.822 6.01 1.85 8.844 3.064l25.78-96.22c-2.947-.97-5.933-1.874-8.968-2.688-3.038-.814-6.083-1.49-9.125-2.124zM182.5 109c-5.56 2.83-10.95 5.965-16.156 9.406l49.72 86.094c4.922-3.863 10.38-7.01 16.186-9.344L182.5 109zm211.72 56.594l-86.25 49.812c3.865 4.92 7.037 10.383 9.374 16.188l86.25-49.813c-2.812-5.572-5.953-10.965-9.375-16.186zM100.686 204.47c-.97 2.948-1.873 5.93-2.687 8.968-.81 3.025-1.522 6.065-2.156 9.093l95.687 25.626c.367-3.058.932-6.13 1.75-9.187.825-3.074 1.875-6.033 3.095-8.876l-95.688-25.625zM255.25 209c-20.188.584-38.553 14.304-44.03 34.75-6.68 24.925 8.23 50.79 33.155 57.47 24.925 6.677 50.79-8.233 57.47-33.158 6.677-24.924-8.233-50.79-33.158-57.468-3.115-.835-6.27-1.35-9.375-1.53-1.358-.08-2.716-.103-4.062-.064zm1.688 18.625c.408.008.807.037 1.218.063 1.88.117 3.792.43 5.688.937 15.17 4.065 24.033 19.424 19.97 34.594-4.066 15.17-19.425 24.032-34.595 19.967-15.17-4.064-24.035-19.423-19.97-34.593 3.446-12.86 15.01-21.206 27.688-20.97zm64.656 36.03c-.365 3.07-.928 6.152-1.75 9.22-.822 3.066-1.877 6.006-3.094 8.844l96.188 25.78c.97-2.948 1.874-5.934 2.687-8.97.81-3.025 1.524-6.063 2.156-9.092l-96.186-25.782zM195.78 280.22l-86.093 49.686c2.787 5.577 5.884 10.995 9.282 16.22l86.124-49.72c-3.857-4.922-6.983-10.384-9.313-16.187zm101.25 27.155c-4.92 3.86-10.383 7.01-16.186 9.344l49.812 86.25c5.566-2.81 10.942-5.96 16.156-9.376l-49.78-86.22zm-66.31 8.75l-25.782 96.188c2.947.97 5.933 1.874 8.968 2.687 3.026.81 6.065 1.524 9.094 2.156l25.78-96.187c-3.057-.367-6.128-.932-9.186-1.75-3.076-.825-6.03-1.873-8.875-3.095z', // Charrette : roue de charrette, par Lorc
  chariot: 'M425.208 118.428c-9.115.04-17.29 2.663-25.45 5.927-9.33 3.732-18.268 8.75-27.847 12.13-6.67 2.356-14.156 3.768-21.694 2.615-22.832 71.052-27.844 149.083-28.654 219.9h68.322c-1.45-5.723-1.952-12.17-1.916-19.543.09-18.73 3.936-43.15 10.523-69.63 12.235-49.176 33.65-104.615 60.876-139.776-11.49-7.335-21.364-10.784-30.19-11.476-1.345-.105-2.666-.152-3.968-.146zM330.95 140.39c-12.268 3.536-23.886 8.28-38.29 10.81-17.517 3.073-38.528 1.747-67.245-9.64V359h78.14c.756-69.366 5.42-146.51 27.395-218.61zm-123.535 4.823c-17.95 11.885-33.58 18.606-50.568 18.578-16.442-.026-33.08-6.19-53.598-17.17 18.834 69.4 24.842 144.742 25.946 212.38h78.22V145.213zM84.7 147.055c-11.136 11.845-23.253 18.937-35.195 22.353-9.05 2.59-17.778 3.007-25.92 2.363 12.242 29.09 21.534 63.203 25.182 96.45 3.63 33.078 1.834 65.296-9.413 90.78h71.834c-1.15-68.14-7.4-143.78-26.488-211.945zM408.823 309c-.05.322-.105.65-.154.97l-2.667 27.608c-.014.66-.032 1.328-.035 1.965-.04 8.135.928 14.47 2.107 17.578.41 1.086.744 1.595.953 1.88h40.387v16h18v-34h-44v-32h-14.592zM33.415 377v46H47.99c2.265-18.264 11.31-34.465 24.538-46H33.415zm134.887 0c13.227 11.535 22.273 27.736 24.537 46h47.15c2.265-18.264 11.31-34.465 24.538-46h-96.226zm192 0c13.227 11.535 22.273 27.736 24.537 46h46.575v-14h57v-18h-57v-14h-71.113zm-248.887.738c-8.502 1.388-16.332 4.71-23.033 9.502l23.033 23.033v-32.535zm18 0v32.535l23.033-23.033c-6.7-4.793-14.53-8.114-23.033-9.502zm174 0c-8.502 1.388-16.332 4.71-23.033 9.502l23.033 23.033v-32.535zm18 0v32.535l23.033-23.033c-6.7-4.793-14.53-8.114-23.033-9.502zm-245.76 22.23c-4.793 6.7-8.114 14.53-9.502 23.032h32.535l-23.033-23.033zm89.52 0L142.142 423h32.535c-1.388-8.502-4.71-16.332-9.502-23.033zm102.48 0c-4.793 6.7-8.114 14.53-9.502 23.032h32.535l-23.033-23.033zm89.52 0L334.142 423h32.535c-1.388-8.502-4.71-16.332-9.502-23.033zM66.153 441c1.388 8.502 4.71 16.332 9.502 23.033L98.688 441H66.153zm75.99 0l23.032 23.033c4.793-6.7 8.114-14.53 9.502-23.033h-32.535zm116.01 0c1.388 8.502 4.71 16.332 9.502 23.033L290.688 441h-32.535zm75.99 0l23.032 23.033c4.793-6.7 8.114-14.53 9.502-23.033h-32.535zm-222.728 12.727L88.382 476.76c6.7 4.793 14.53 8.114 23.033 9.502v-32.535zm18 0v32.535c8.502-1.388 16.332-4.71 23.033-9.502l-23.033-23.033zm174 0l-23.033 23.033c6.7 4.793 14.53 8.114 23.033 9.502v-32.535zm18 0v32.535c8.502-1.388 16.332-4.71 23.033-9.502l-23.033-23.033z', // Chariot : chariot bâché, par Delapouite
  barque: 'M482.2 66.37c-62.8 22.61-139.5 57.53-219.3 96.03H408c31.3-31.8 55-66.02 74.2-96.03zm9.1 18.91C462.4 129.7 423 182.1 363.8 223.3c-67.2 46.8-159.8 78.3-288.82 66.9 2.19 55.4 28.92 97.4 67.92 143.7 184.6-62.2 266.8-127.6 306-191.2 32.4-52.7 35.9-105.4 42.4-157.42zM226 180.4c-9.5 4.7-19.1 9.4-28.6 14.1h175c5.8-4.6 11.3-9.3 16.7-14.1zm-64.8 32.1c-33.3 16.7-66.19 33.2-98.25 49.4.26.1.52.3.77.4 4.1 2.4 7.87 5.7 10.24 9.9 123.04 11.6 209.84-17 273.84-59.7zm-121.63 62c-6.3 0-11.89 1.6-15.22 3.5s-3.62 3.3-3.62 3.4c0 .1.29 1.5 3.62 3.4s8.92 3.5 15.22 3.5c6.3 0 11.89-1.6 15.22-3.5s3.62-3.3 3.62-3.4c0-.1-.29-1.5-3.62-3.4s-8.92-3.5-15.22-3.5zm18.34 28.7c-5.5 2-11.72 3.1-18.34 3.1-4.33 0-8.48-.5-12.38-1.4 2.45 28.1 12.83 60.1 26.72 86.3 9.54 18.1 20.63 33.5 30.85 43.1 10.22 9.7 18.54 12.4 22.94 11 5.7-1.8 11.3-3.6 16.8-5.4-34.9-42.2-61.13-84.1-66.59-136.7z', // Barque : barque en bois, par Delapouite
  coffre: 'M146.857 20.842c-12.535-.036-24.268 2.86-37.285 9.424h.004C61.356 54.6 19.966 120.734 17.982 175.91l41.848 14.236c4.33-61.89 47.057-128.37 101.527-155.86h.002c4.423-2.23 8.822-4.162 13.185-5.8l-22.26-7.45c-1.83-.123-3.637-.19-5.428-.194zm59.34 20.19c-10.478-.09-22.832 3.093-36.424 9.943l.004-.004c-48.23 24.34-89.625 90.513-91.548 145.436l156.485 53.24c3.865-62.22 46.797-129.372 101.613-157.035h.002l.002-.003c4.303-2.168 8.584-4.056 12.832-5.666l-134.54-45.036c-2.652-.542-5.458-.847-8.427-.873zm174.97 58.323c-10.476-.09-22.83 3.092-36.42 9.94l-.005.002c-48.577 24.518-90.225 91.473-91.586 146.623l46.205 15.72c3.914-62.188 46.825-129.274 101.607-156.92 4.522-2.283 9.04-4.258 13.53-5.91l-26.544-8.884c-2.164-.35-4.423-.55-6.785-.57zm63.554 22.014c-10.267.093-22.094 3.353-35.333 10.034-47.158 23.8-87.777 87.587-91.362 141.75l174.55-73.726c-.404-39.01-10.754-61.304-24.415-71.082-2.347-1.68-4.867-3.057-7.55-4.137l-.01.034-4.735-1.584c-3.48-.887-7.195-1.327-11.144-1.29zM17.9 195.622l-.035 187.484L59.46 397.58V209.764L17.9 195.624zM78.15 216.12v187.962l156.282 54.37V269.288l-29.053-9.886v119.43l-101.054-34.082V225.025L78.15 216.12zm414.22 3.683L318.433 293.27v189.236l173.935-73.504v-189.2zm-369.354 11.582v99.947l63.675 21.477v-99.763l-63.674-21.662zm31.306 28.797c9.705 0 17.573 7.867 17.573 17.572 0 6.34-3.37 11.88-8.407 14.97v28.53h-18.69v-28.746c-4.838-3.13-8.048-8.562-8.048-14.754 0-9.705 7.867-17.572 17.572-17.572zm98.797 15.464v189.307l46.626 16.22V291.51l-46.627-15.864z', // Coffre : coffre fermé, par Lorc
  autre: 'M230.125 18.156V247h49.313V18.156h-49.313zM78.812 21.438l-16 136.906c48.707 30.112 97.637 47.843 148.625 53.094V33.125c-44.244-1.822-88.46-5.89-132.625-11.688zm349.438.28c-43.398 6.814-86.784 10.647-130.125 11.97v175c46.732-7.458 95.816-24.375 148.438-50.844L428.25 21.72zm-1.938 166.532c-44.474 19.847-87.06 32.836-128.187 38.97V247h37.031v143.188h-37.031v8.718c0 34.41-20.516 56.084-43.25 56.28-22.734.2-43.438-21.34-43.438-56.28v-8.72l-27.656.002h-9.343V247h37.001v-17.188c-43.774-4.164-86.14-16.857-127.687-38.062 5.04 92.69 3.66 185.37-5.063 278.063 117.402 32.047 234.788 31.002 352.188 0-6.853-93.858-9.223-187.706-4.563-281.563zm-233.187 77.438V371.5H316.47V265.687H193.124zm20.47 18.156H296v67.5H213.594v-67.5zm18.686 18.687v30.126h45.032V302.53h-45.03zm-2.155 87.658v8.718c0 28.23 13.32 37.692 24.594 37.594 11.27-.098 24.718-10.018 24.718-37.594v-8.72l-49.313.002z', // Autre : sac, par Lorc
};
const carrierSvg = (type) => `<svg class="i gi" viewBox="0 0 512 512" aria-hidden="true"><path d="${CARRIER_SVG[type] || CARRIER_SVG.autre}"/></svg>`;
const carrierIcon = (k) => carrierSvg(k.type);
const carrierEmoji = (k) => ({ monture: '🐴', coffre: '🧰', barque: '🛶' })[carrierKind(k)] || '🛞';
const pullers = (g, v) => v.pulledBy.map((id) => g.carriers.find((k) => k.id === id)).filter(Boolean);
const attachedTo = (g, a) => g.carriers.find((v) => v.pulledBy.includes(a.id));
const fmtWhen = (t) => new Date(t).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

function shareCard() {
  const sh = group.shared;
  if (!sh) {
    const c = C(); const known = group.list.filter((r) => r.role !== 'mj');
    return `<section class="card span-all share">
      <h2>Groupe partagé</h2>
      <p class="small">${c && !c.stub ? `<b>${esc(c.name)}</b> ne fait partie d’aucun groupe partagé.` : 'Aucun groupe partagé.'} Crée un groupe et donne son code aux autres joueurs, ou rejoins celui de ta table : chacun verra et modifiera la même caisse, le même matériel et le même journal.</p>
      <div class="add-row center-row"><button class="btn" data-act="gShareCreate">${icon('users')} Créer un groupe</button><button class="btn ghost" data-act="gShareJoin">Rejoindre avec un code</button></div>
      ${known.length ? `<p class="small muted">Ou rejoindre un de tes groupes :</p><div class="add-row center-row">${known.map((r) => `<button class="btn small ghost" data-act="gJoinKnown" data-id="${r.id}">↪ ${esc(r.name)}</button>`).join('')}</div>` : ''}
    </section>`;
  }
  const members = Object.values(sh.members || {});
  const err = group.error; const pend = group.pending;
  const status = pend ? `<p class="small ${err ? 'bad' : 'muted'}">⏳ ${pend} modification${pend > 1 ? 's' : ''} en attente d’envoi${err ? ` : ${esc(err)}` : ''}</p>`
    : err ? `<p class="small bad">${esc(err)}</p>` : '<p class="small good">À jour : tout le groupe voit la même chose.</p>';
  return `<section class="card span-all share">
    <div class="share-head"><span class="share-name"><b>${esc(sh.name)}</b><small>Groupe partagé · code <b class="code">${esc(sh.id)}</b></small></span>
      <span class="share-btns"><button class="btn small ghost" data-act="gShareCode">${icon('users')} Inviter</button><button class="btn small ghost" data-act="gLeave">Quitter le groupe</button></span></div>
    ${members.length ? `<p class="small muted">Membres : ${members.map(esc).join(', ')}</p>` : ''}
    ${status}
    ${C()?.stub && !isMJ() ? `<p class="small">Tu es dans ce groupe <b>sans personnage</b>.<button class="btn small" data-act="gNewHere">${icon('plus')} Créer mon personnage dans ce groupe</button></p>` : ''}
    <div class="mj-share">
      ${!sh.mj ? `<span class="small">Pas encore de meneur de jeu.${isAdmin() ? '' : ' L’administrateur du groupe peut créer un code MJ.'}</span>${isAdmin() ? '<button class="btn small ghost" data-act="mjClaim">👑 Je serai le MJ</button>' : ''}`
        : isMJ() ? `<span class="small">👑 <b>Tu es le MJ</b> : tu vois toutes les fiches (onglet MJ).</span><button class="btn small ghost" data-act="mjLeave">Ne plus être MJ</button>`
        : `<span class="small">👑 MJ : <b>${esc(sh.mjName || '?')}</b>. Il voit vos fiches complètes, notes secrètes et journal perso compris.</span>
          <p class="small mj-state ${mjError || !cloud.user() ? 'bad' : 'good'}">${!cloud.user() ? 'Connecte-toi (le nuage en haut) pour que le MJ reçoive ta fiche.'
            : mjError ? esc(mjError) : mjOkAt ? `✓ Tes fiches sont à jour chez le MJ (${new Date(mjOkAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})` : 'Envoi de tes fiches au MJ…'}
            ${cloud.user() ? '<button class="btn small ghost" data-act="mjResend">Renvoyer mes fiches au MJ</button>' : ''}</p>`}
      ${isAdmin() ? `<p class="small mj-admin">🔑 Tu es l’administrateur du groupe.<button class="btn small ghost" data-act="mjCode">Code MJ</button></p>` : ''}
    </div>
  </section>`;
}

function viewGroupe(c) {
  const g = G();

  const vehicles = g.carriers.filter((v) => R.CARRIER_TYPES[v.type]?.pulls);
  // Du plus petit au plus grand (capacité, sacoches comprises) ; à égalité, l'ordre d'ajout
  const carriers = g.carriers.map((k, i) => ({ k, i })).sort((a, b) => R.carrierCapacity(a.k) - R.carrierCapacity(b.k) || a.i - b.i).map(({ k }) => {
    const t = R.CARRIER_TYPES[k.type] || R.CARRIER_TYPES.autre;
    const cap = R.carrierCapacity(k); const load = R.carrierLoad(k);
    const items = k.items.map((it) => `<button class="list-item" data-act="gItem" data-k="${k.id}" data-id="${it.id}">
        <span class="badge soft" title="Encombrement">${+((+it.weight || 0) * (+it.qty || 1)).toFixed(2)}</span>
        <span class="li-main"><div class="li-title">${esc(it.name)}${+it.qty > 1 ? ` <span class="muted">×${it.qty}</span>` : ''}${it.sell ? ` <span class="tag sell">à vendre${+it.value ? ` · ${fmtMoney(+it.value * (+it.qty || 1))}` : ''}</span>` : ''}</div>${it.notes ? `<div class="li-sub">${esc(it.notes)}</div>` : ''}</span>
      </button>`).join('') || '<div class="empty">Rien pour l’instant.</div>';
    let rig = '';
    if (t.animal) {
      const att = attachedTo(g, k);
      rig = `<div class="rig">
        <div class="rig-row"><span>Sacoches de selle <small>(+2 chacune, 2 au plus)</small></span>
          <div class="step"><button data-act="gSaddle" data-k="${k.id}" data-d="-1">−</button><span class="val">${k.saddlebags || 0}</span><button data-act="gSaddle" data-k="${k.id}" data-d="1">+</button></div></div>
        ${vehicles.length ? `<div class="rig-row"><span>Harnais</span><select data-gharness="${k.id}">
          <option value="">Non attelé</option>${vehicles.map((v) => `<option value="${v.id}" ${att?.id === v.id ? 'selected' : ''}>Attelé : ${esc(v.name)}</option>`).join('')}
        </select></div>` : ''}
      </div>`;
    } else if (t.pulls) {
      const p = pullers(g, k);
      rig = `<p class="small ${p.length < t.pulls ? 'bad' : ''}">${p.length ? `Tiré par : <b>${p.map((a) => esc(a.name)).join(', ')}</b>` : '<b>Personne n’est attelé :</b> choisis un harnais sur une monture.'}${p.length && p.length < t.pulls ? ` (il en faut ${t.pulls})` : ''}</p>`;
    }
    return `<section class="card carrier">
      <div class="carrier-head"><span class="carrier-ico">${carrierIcon(k)}</span><span class="carrier-name"><b>${esc(k.name)}</b><small>${esc(t.name)}${t.people ? ` · ${t.people} passagers` : ''}</small></span>
        <button class="icon-btn small" data-act="gEditCarrier" data-k="${k.id}" aria-label="Modifier">${icon('edit')}</button></div>
      ${k.notes ? `<p class="small muted carrier-notes">${esc(k.notes)}</p>` : ''}
      <div class="enc ${load > cap ? 'over' : ''}"><b>${+load.toFixed(2)}</b> / ${cap}</div>
      <div class="bar"><i style="width:${cap ? clamp(load / cap * 100, 0, 100) : 0}%"></i></div>
      ${load > cap ? '<p class="small bad">Surchargé !</p>' : ''}
      ${rig}
      <h3>Chargement</h3>
      ${items}
      <form class="quick-add" data-form="gItem" data-k="${k.id}"><input name="item" placeholder="Ajouter (ex. Tente, Rations ×4…)"><button class="btn small" type="submit">${icon('plus')}</button></form>
      <div class="add-row"><button class="btn ghost small" data-act="gAddItem" data-k="${k.id}">${icon('bag')} Choisir dans la liste de matériel</button></div>
    </section>`;
  }).join('');

  return `<div class="grid two groupe">
    <section class="card span-all">
      <h2>Caisse et comptes</h2>
      ${accountsCard(g)}
    </section>
    ${carriers}
    <section class="card span-all">
      <div class="add-row"><button class="btn ghost small" data-act="gAddCarrier">${icon('plus')} Ajouter une monture, un véhicule ou un coffre</button></div>
      <p class="small muted hint">Âne : 10 · cheval : 10 (plus son cavalier) · charrette : 50, tirée par un âne ou un cheval · chariot : 100, tiré par deux. Chaque sacoche de selle ajoute 2 à une monture.</p>
    </section>
    ${saleCard(g)}
    ${shareCard()}
    <div class="span-all hist-link"><button class="btn ghost small" data-act="history">${icon('history')} Historique des modifications</button></div>
  </div>`;
}

// Recette / dépense de la caisse, avec transfert possible vers ou depuis la bourse du personnage
function groupMoneyDialog(sign) {
  const c = C(); const g = G();
  openDialog({
    title: sign > 0 ? 'Recette' : 'Dépense',
    body: `<div class="fields three">${F.num('or', 'Or', '', '', 'autofocus')}${F.num('argent', 'Argent', '')}${F.num('cuivre', 'Cuivre', '')}</div>
      <div class="fields">${F.text('label', 'Motif', '', 'full', `placeholder="${sign > 0 ? 'Butin, vente, récompense…' : 'Auberge, fourrage, réparation…'}"`)}</div>
      ${c.stub ? '' : F.check('transfer', sign > 0 ? `Pris dans la bourse de ${esc(c.name)} (${fmtMoney(totalCopper(c.money))})` : `Donné à ${esc(c.name)} (va dans sa bourse)`, false)}
      ${sign < 0 ? `<p class="small muted">La caisse contient ${fmtMoney(totalCopper(g.money))}. La monnaie est rendue automatiquement si besoin.</p>` : ''}`,
    actions: [cancel, { label: sign > 0 ? 'Ajouter à la caisse' : 'Retirer de la caisse', primary: true, onClick: (f) => {
      const coins = { or: num(f.or.value), argent: num(f.argent.value), cuivre: num(f.cuivre.value) };
      const amount = totalCopper(coins);
      if (!amount) { toast('Indique un montant'); return false; }
      const tr = !!f.transfer?.checked;
      if (tr && sign > 0 && totalCopper(c.money) < amount) { toast(`${c.name} n’a pas assez (il manque ${fmtMoney(amount - totalCopper(c.money))})`); return false; }
      const motif = f.label.value.trim();
      const label = tr ? (sign > 0 ? `${c.name} verse dans la caisse` : `Donné à ${c.name}`) + (motif ? ` : ${motif}` : '') : (motif || (sign > 0 ? 'Recette' : 'Dépense'));
      const purse = tr ? { cid: c.id, cu: amount, sign: -sign } : undefined;
      if (!gApply({ t: 'money', sign, coins, label, purse }, `${sign > 0 ? 'Caisse +' : 'Caisse −'}${fmtMoney(amount)}`)) return false;
      if (tr) { purseFix(purse); render(); }
    } }],
  });
}

// ----- Comptes : dépôts, dettes, ce qu'on nous doit, projets -----
// Mouvements possibles selon le type : [libellé, sens (+ / −) du solde, via ('caisse' | '' | 'dep'), texte du journal]
const ACCOUNT_MOVES = {
  depot: [
    ['Déposer (pris dans la caisse)', 1, 'caisse', (a) => `Dépôt chez ${a.name}`],
    ['Retirer (va dans la caisse)', -1, 'caisse', (a) => `Retrait chez ${a.name}`],
    ['Dépensé sur place (ne passe pas par la caisse)', -1, '', (a) => `${a.name} : dépense sur place`],
    ['Ajouté sans passer par la caisse (intérêts…)', 1, '', (a) => `${a.name} : ajout`],
  ],
  creance: [
    ['Encaisser (va dans la caisse)', -1, 'caisse', (a) => `${a.name} nous rembourse`],
    ['Prêter encore (pris dans la caisse)', 1, 'caisse', (a) => `Prêt à ${a.name}`],
    ['On ne sera pas payé (effacer)', -1, '', (a) => `${a.name} : dette effacée`],
  ],
  dette: [
    ['Rembourser (pris dans la caisse)', -1, 'caisse', (a) => `Remboursement à ${a.name}`],
    ['Rembourser avec un dépôt', -1, 'dep', (a, x) => `Remboursement à ${a.name} (payé par ${x.name})`],
    ['Emprunter encore (va dans la caisse)', 1, 'caisse', (a) => `Emprunt à ${a.name}`],
    ['La dette augmente (intérêts, pénalité…)', 1, '', (a) => `${a.name} : la dette augmente`],
    ['Dette effacée', -1, '', (a) => `${a.name} : dette effacée`],
  ],
  projet: [
    ['Payer (pris dans la caisse)', 1, 'caisse', (a) => `Paiement : ${a.name}`],
    ['Payer avec un dépôt', 1, 'dep', (a, x) => `Paiement : ${a.name} (payé par ${x.name})`],
    ['Payé autrement (bourse d’un joueur…)', 1, '', (a) => `Paiement : ${a.name} (hors caisse)`],
  ],
};
const accountIcon = { depot: '🏦', creance: '📜', dette: '⚖️', projet: '🏗️' };

// Boutons principaux de chaque type de compte : [n° du mouvement dans ACCOUNT_MOVES, libellé, bouton plein ?]
const ACCOUNT_BUTTONS = {
  depot: [[0, 'Déposer', true], [1, 'Retirer']],
  creance: [[0, 'Encaisser', true], [1, 'Prêter']],
  dette: [[0, 'Rembourser', true], [2, 'Emprunter']],
  projet: [[0, 'Payer', true]],
};

// Chaque compte se présente comme la caisse (en plus petit) : pièces, total, boutons
function accountsCard(g) {
  const rows = g.accounts.map((a) => {
    const kind = ACCOUNT_KINDS[a.kind] || ACCOUNT_KINDS.depot;
    const bal = +a.bal || 0; const m = cuToCoins(bal);
    let total;
    if (a.kind === 'projet') {
      const goal = +a.goal || 0;
      total = goal ? `<div class="bar acct-bar ${bal >= goal ? 'full' : ''}"><i style="width:${clamp(bal / goal * 100, 0, 100)}%"></i></div>
        <p class="small center ${bal >= goal ? 'good' : 'muted'}">Payé : ${fmtMoney(bal)} sur ${fmtMoney(goal)}${bal >= goal ? ' · payé en entier' : ` · <b>reste ${fmtMoney(goal - bal)}</b>`}</p>`
        : `<p class="small muted center">Payé : ${fmtMoney(bal)}</p>`;
    } else {
      total = `<p class="small center ${a.kind === 'dette' ? 'bad' : a.kind === 'creance' ? 'good' : 'muted'}">${kind.name} : ${a.kind === 'dette' && bal ? '−' : ''}${fmtMoney(bal)}</p>`;
    }
    const buttons = (ACCOUNT_BUTTONS[a.kind] || []).map(([i, label, main]) => `<button class="btn small ${main ? '' : 'ghost'}" data-act="gAcct" data-id="${a.id}" data-m="${i}">${label}</button>`).join('');
    return `<div class="purse-acct ${a.kind}">
      <div class="acct-head"><span class="acct-ico">${accountIcon[a.kind] || '💰'}</span>
        <span class="acct-name"><b>${esc(a.name)}</b><small>${esc(kind.name)}${a.notes ? ` · ${esc(a.notes)}` : ''}</small></span>
        <button class="icon-btn small" data-act="gEditAcct" data-id="${a.id}" aria-label="Modifier">${icon('edit')}</button></div>
      <div class="caisse small"><span class="coin-big gold"><b>${m.or}</b> or</span><span class="coin-big silver"><b>${m.argent}</b> argent</span><span class="coin-big copper"><b>${m.cuivre}</b> cuivre</span></div>
      ${total}
      <div class="add-row center-row">${buttons}<button class="btn small ghost" data-act="gAcct" data-id="${a.id}" aria-label="Autres opérations">…</button></div>
    </div>`;
  }).join('');
  // La caisse : première petite carte, dorée pour ressortir
  const caisse = `<div class="purse-acct main">
      <div class="acct-head"><span class="acct-ico coin-ico">${icon('coin')}</span>
        <span class="acct-name"><b>Caisse du groupe</b><small>L’argent qu’on a sur nous</small></span></div>
      <div class="caisse small"><span class="coin-big gold"><b>${+g.money.or || 0}</b> or</span><span class="coin-big silver"><b>${+g.money.argent || 0}</b> argent</span><span class="coin-big copper"><b>${+g.money.cuivre || 0}</b> cuivre</span></div>
      <p class="small muted center">Total : ${fmtMoney(totalCopper(g.money))}</p>
      <div class="add-row center-row"><button class="btn small" data-act="gMoney" data-s="1">${icon('plus')} Recette</button><button class="btn small ghost" data-act="gMoney" data-s="-1">Dépense</button></div>
    </div>`;
  // Dernière petite carte : fortune du groupe et notes
  const f = fortune(g);
  const summary = `<div class="purse-acct summary">
      <div class="acct-head"><span class="acct-ico">⚜️</span><span class="acct-name"><b>Fortune du groupe</b><small>Caisse + dépôts + ce qu’on nous doit − ce qu’on doit</small></span></div>
      ${(() => { const fm = cuToCoins(Math.abs(f)); const neg = f < 0 ? '−' : '';
        // Comme la caisse et les comptes : les trois pièces puis le total (en rouge si le groupe doit plus qu'il n'a)
        return `<div class="caisse small ${f < 0 ? 'neg' : ''}"><span class="coin-big gold"><b>${neg}${fm.or}</b> or</span><span class="coin-big silver"><b>${fm.argent}</b> argent</span><span class="coin-big copper"><b>${fm.cuivre}</b> cuivre</span></div>
          <p class="small center ${f < 0 ? 'bad' : 'muted'}">Total : ${neg}${fmtMoney(Math.abs(f))}</p>`; })()}
      <div class="group-notes" data-pres="gnotes"><h3>Notes du groupe <button class="icon-btn small" data-act="gNotes" aria-label="Modifier les notes">${icon('edit')}</button></h3>
        ${g.notes ? `<p class="small pre">${esc(g.notes)}</p>` : '<p class="small muted">Rendez-vous, promesses, rumeurs… touche le crayon.</p>'}</div>
    </div>`;
  return `<div class="accounts">
    <div class="acct-grid">${caisse}${rows}${summary}</div>
    ${rows ? '' : '<p class="small muted center">Pas encore de compte : ajoute un dépôt chez un banquier, une dette, ce qu’on vous doit, ou un projet à payer en plusieurs fois.</p>'}
    <div class="add-row center-row"><button class="btn ghost small" data-act="gEditAcct">${icon('plus')} Nouveau compte</button></div>
  </div>`;
}

// Création / modification d'un compte (le montant de départ ne passe pas par la caisse)
function groupAccountDialog(a) {
  const isNew = !a;
  const cur = a || { kind: 'depot', name: '', bal: 0, goal: 0, notes: '' };
  const balLabel = (k) => (k === 'projet' ? 'Déjà payé' : k === 'dette' ? 'Montant dû' : k === 'creance' ? 'Montant qu’on nous doit' : 'Montant déposé');
  openDialog({
    title: isNew ? 'Nouveau compte' : cur.name,
    body: `<div class="fields">
      ${isNew ? F.select('kind', 'Type', cur.kind, Object.entries(ACCOUNT_KINDS).map(([k, v]) => [k, `${accountIcon[k]} ${v.name}`]), 'full') : ''}
      ${F.text('name', 'Nom', cur.name, 'full', 'autofocus placeholder="Ex. Maître Ulwar, Construction de la maison…"')}
    </div>
    <p class="small muted kind-note">${esc(ACCOUNT_KINDS[cur.kind].long)}</p>
    ${isNew ? `<div class="bal-fields">${coinFields('b_', 0, balLabel(cur.kind))}</div>` : `<p class="small">Solde : <b>${fmtMoney(+cur.bal || 0)}</b> <span class="muted">(pour le changer, touche le compte : ce sera noté au journal)</span></p>`}
    <div class="goal-fields" ${cur.kind === 'projet' ? '' : 'hidden'}>${coinFields('g_', cur.goal, 'Coût total')}</div>
    <div class="fields">${F.area('notes', 'Notes', cur.notes)}</div>
    ${isNew ? '<p class="small muted">Le montant de départ ne sort pas de la caisse : c’est pour un compte qui existe déjà. Pour y mettre de l’argent de la caisse, crée-le vide puis touche-le.</p>' : ''}`,
    actions: [
      ...(!isNew ? [{ label: icon('trash'), cls: 'ghost', onClick: () => {
        if (+a.bal && !confirm(`${a.name} a encore ${fmtMoney(+a.bal)}. Le supprimer quand même ? (annulable depuis le journal)`)) return false;
        gApply({ t: 'acctDel', id: a.id });
      } }, 'spacer'] : []),
      cancel,
      { label: 'Enregistrer', primary: true, onClick: (f) => {
        const kind = isNew ? f.kind.value : cur.kind;
        const name = f.name.value.trim();
        if (!name) { toast('Donne un nom au compte'); return false; }
        const v = { name, notes: f.notes.value.trim(), goal: kind === 'projet' ? totalCopper(readCoins(f, 'g_')) : 0 };
        if (isNew) return gApply({ t: 'acctAdd', acct: { id: R.uid(), kind, bal: totalCopper(readCoins(f, 'b_')), ...v } }) && undefined;
        return gApply({ t: 'acctEdit', id: a.id, v }) && undefined;
      } },
    ],
    onOpen: (f) => {
      if (!isNew) return;
      f.kind.onchange = () => {
        const k = f.kind.value;
        f.querySelector('.kind-note').textContent = ACCOUNT_KINDS[k].long;
        f.querySelector('.goal-fields').hidden = k !== 'projet';
        f.querySelector('.bal-fields .coins-label').textContent = balLabel(k);
      };
    },
  });
}

// Mouvement sur un compte : dépôt, retrait, remboursement, paiement…
function groupAccountMoveDialog(a, pick) {
  const g = G();
  const deposits = g.accounts.filter((x) => x.kind === 'depot' && x.id !== a.id);
  const opts = [];
  (ACCOUNT_MOVES[a.kind] || []).forEach(([label, , via], i) => {
    if (via === 'dep') deposits.forEach((x) => opts.push([`${i}:${x.id}`, `${label} : ${x.name} (${fmtMoney(+x.bal || 0)})`]));
    else opts.push([`${i}:`, label]);
  });
  const bal = +a.bal || 0;
  const state = a.kind === 'projet' ? `Déjà payé : <b>${fmtMoney(bal)}</b>${+a.goal ? ` sur ${fmtMoney(+a.goal)} (reste ${fmtMoney(Math.max(0, +a.goal - bal))})` : ''}`
    : `${ACCOUNT_KINDS[a.kind].name} : <b>${fmtMoney(bal)}</b>`;
  openDialog({
    title: a.name,
    body: `<p class="small">${state} · caisse : ${fmtMoney(totalCopper(g.money))}</p>
      <div class="fields">${F.select('move', 'Opération', (opts.find(([v]) => pick != null && v.startsWith(`${pick}:`)) || opts[0])?.[0] || '', opts, 'full')}</div>
      <div class="fields three">${F.num('or', 'Or', '', '', 'autofocus')}${F.num('argent', 'Argent', '')}${F.num('cuivre', 'Cuivre', '')}</div>
      <div class="fields">${F.text('label', 'Motif (facultatif)', '', 'full', 'placeholder="Ex. avance pour les fondations"')}</div>`,
    actions: [cancel, { label: 'Valider', primary: true, onClick: (f) => {
      const coins = { or: num(f.or.value), argent: num(f.argent.value), cuivre: num(f.cuivre.value) };
      const amount = totalCopper(coins);
      if (!amount) { toast('Indique un montant'); return false; }
      const [i, depId] = f.move.value.split(':');
      const [, sign, via, text] = ACCOUNT_MOVES[a.kind][+i];
      const dep = depId ? g.accounts.find((x) => x.id === depId) : null;
      const motif = f.label.value.trim();
      const op = { t: 'acct', id: a.id, d: sign * amount, via: via === 'dep' ? depId : via, coins, label: text(a, dep) + (motif ? ` : ${motif}` : '') };
      return gApply(op, `${a.name} : ${sign > 0 ? '+' : '−'}${fmtMoney(amount)}`) && undefined;
    } }],
  });
}

// Cuivre → pièces (pour pré-remplir les montants)
const cuToCoins = (cu) => ({ or: Math.floor(cu / 100), argent: Math.floor((cu % 100) / 10), cuivre: cu % 10 });
const coinFields = (prefix, cu, label = '') => {
  const m = cuToCoins(+cu || 0);
  return `${label ? `<label class="coins-label">${label}</label>` : ''}<div class="fields three">${F.num(`${prefix}or`, 'Or', m.or || '')}${F.num(`${prefix}argent`, 'Argent', m.argent || '')}${F.num(`${prefix}cuivre`, 'Cuivre', m.cuivre || '')}</div>`;
};
const readCoins = (f, prefix) => ({ or: num(f[`${prefix}or`].value), argent: num(f[`${prefix}argent`].value), cuivre: num(f[`${prefix}cuivre`].value) });

// Objets à vendre : tous les transports, avec valeur estimée et bouton « Vendu »
function saleCard(g) {
  const list = g.carriers.flatMap((k) => k.items.filter((it) => it.sell).map((it) => ({ k, it })));
  const total = list.reduce((n, { it }) => n + (+it.value || 0) * (+it.qty || 1), 0);
  const unknown = list.filter(({ it }) => !+it.value).length;
  return `<section class="card span-all sale">
    <h2>À vendre</h2>
    ${list.length ? list.map(({ k, it }) => `<div class="sale-row">
        <span class="sale-main" data-act="gItem" data-k="${k.id}" data-id="${it.id}"><b>${esc(it.name)}${+it.qty > 1 ? ` ×${it.qty}` : ''}</b><small>${carrierIcon(k)} ${esc(k.name)}${+it.value && +it.qty > 1 ? ` · ${fmtMoney(+it.value)} pièce` : ''}</small></span>
        <span class="sale-val">${+it.value ? fmtMoney(+it.value * (+it.qty || 1)) : '<span class="muted">à estimer</span>'}</span>
        <button class="btn small gold" data-act="gSell" data-k="${k.id}" data-id="${it.id}">Vendu</button>
      </div>`).join('')
      : '<div class="empty">Rien à vendre. Touche un objet d’une monture ou du char et coche « À vendre ».</div>'}
    ${list.length ? `<div class="sale-total"><span>Valeur estimée</span><b>${fmtMoney(total)}</b></div>${unknown ? `<p class="small muted">${unknown} objet${unknown > 1 ? 's' : ''} sans estimation.</p>` : ''}` : ''}
  </section>`;
}

// Vente : le prix obtenu entre dans la caisse, l'objet sort du transport (annulable)
function groupSellDialog(k, it) {
  const qty = +it.qty || 1;
  openDialog({
    title: `Vendre : ${it.name}`,
    body: `<div class="fields">${F.num('qty', `Quantité vendue (sur ${qty})`, qty, 'full', `min="1" max="${qty}"`)}</div>
      ${coinFields('p_', (+it.value || 0) * qty, 'Prix obtenu')}
      <p class="small muted">${+it.value ? `Estimation : ${fmtMoney(+it.value)} pièce. ` : ''}Le prix va dans la caisse du groupe.</p>`,
    actions: [cancel, { label: 'Vendre', primary: true, onClick: (f) => {
      const n = clamp(Math.round(num(f.qty.value)), 1, qty);
      const coins = readCoins(f, 'p_'); const amount = totalCopper(coins);
      return gApply({ t: 'sell', k: k.id, id: it.id, qty: n, coins }, `${it.name} vendu${amount ? ` : +${fmtMoney(amount)}` : ''}`) && undefined;
    } }],
    onOpen: (f) => {
      // Changer la quantité recalcule le prix d'après l'estimation
      f.qty.oninput = () => {
        if (!+it.value) return;
        const m = cuToCoins(+it.value * clamp(Math.round(num(f.qty.value)), 1, qty));
        f.p_or.value = m.or || ''; f.p_argent.value = m.argent || ''; f.p_cuivre.value = m.cuivre || '';
      };
    },
  });
}

function groupItemDialog(k, it) {
  const c = C(); const g = G();
  const dests = [['', '— Ne pas déplacer —'], ...g.carriers.filter((x) => x.id !== k.id).map((x) => [`k:${x.id}`, `${carrierEmoji(x)} ${x.name}`]), ...(c.stub ? [] : [[`c:${c.id}`, `🎒 Sac de ${c.name}`]])];
  openDialog({
    title: it.name,
    body: `<div class="fields">
      ${F.text('name', 'Nom', it.name, 'full')}
      ${F.num('qty', 'Quantité', it.qty)}
      ${F.num('weight', 'Encombrement (par unité)', it.weight)}
      ${F.area('notes', 'Notes', it.notes)}
      ${F.select('dest', 'Déplacer vers', '', dests, 'full')}
      ${F.check('sell', '<b>À vendre</b> (on ne le garde pas)', !!it.sell, 'full')}
    </div>
    <div class="sell-value" ${it.sell ? '' : 'hidden'}>${coinFields('v_', it.value, 'Valeur estimée (par pièce)')}</div>`,
    actions: [{ label: icon('trash'), cls: 'ghost', onClick: () => { gApply({ t: 'itemDel', k: k.id, id: it.id }); } }, 'spacer', cancel,
      { label: 'Enregistrer', primary: true, onClick: (f) => {
        const v = { name: f.name.value.trim() || 'Objet', qty: Math.max(1, num(f.qty.value)), weight: num(f.weight.value), notes: f.notes.value.trim(), sell: f.sell.checked, value: f.sell.checked ? totalCopper(readCoins(f, 'v_')) : (+it.value || 0) };
        if (!gApply({ t: 'itemEdit', k: k.id, id: it.id, v })) return false;
        const d = f.dest.value;
        if (d.startsWith('k:')) gApply({ t: 'itemMove', k: k.id, id: it.id, to: d.slice(2) }, `${v.name} déplacé`);
        if (d.startsWith('c:') && gApply({ t: 'itemTake', k: k.id, id: it.id, who: c.name }, `${v.name} est dans ton sac`)) {
          c.items.push({ id: R.uid(), name: v.name, qty: v.qty, weight: v.weight, notes: v.notes, worn: false });
          commit();
        }
      } }],
    onOpen: (f) => { f.sell.onchange = () => { f.querySelector('.sell-value').hidden = !f.sell.checked; }; },
  });
}

function groupCarrierDialog(k) {
  const isNew = !k;
  const cur = k || { type: 'ane', name: '', capacity: R.CARRIER_TYPES.ane.capacity, notes: '' };
  openDialog({
    title: isNew ? 'Nouveau transport' : cur.name,
    body: `<div class="fields">
      ${F.select('type', 'Type', cur.type, Object.entries(R.CARRIER_TYPES).map(([key, t]) => [key, `${t.name}${t.capacity ? ` (${t.capacity})` : ''}`]))}
      ${F.text('name', 'Nom', cur.name, '', 'placeholder="Ex. Caramel"')}
      ${F.num('capacity', 'Capacité de base', cur.capacity)}
      ${F.area('notes', 'Notes (déplacement, PV, compétences…)', cur.notes)}
    </div><p class="small muted type-note">${esc(R.CARRIER_TYPES[cur.type]?.note || '')}</p>`,
    actions: [
      ...(!isNew ? [{ label: icon('trash'), cls: 'ghost', onClick: () => {
        if (k.items.length && !confirm(`${k.name} transporte encore ${k.items.length} objet(s). Le supprimer quand même ?`)) return false;
        gApply({ t: 'carrierDel', id: k.id });
      } }, 'spacer'] : []),
      cancel,
      { label: 'Enregistrer', primary: true, onClick: (f) => {
        const v = { type: f.type.value, name: f.name.value.trim() || R.CARRIER_TYPES[f.type.value].name, capacity: num(f.capacity.value), notes: f.notes.value.trim() };
        if (isNew) return gApply({ t: 'carrierAdd', carrier: { ...R.newCarrier(v.type), ...v } }) && undefined;
        return gApply({ t: 'carrierEdit', id: k.id, v }) && undefined;
      } },
    ],
    onOpen: (f) => {
      f.type.onchange = () => {
        const t = R.CARRIER_TYPES[f.type.value];
        f.capacity.value = t.capacity ?? 10;
        f.querySelector('.type-note').textContent = t.note || '';
      };
    },
  });
}

// ----- Partage du groupe -----
function needCloud() {
  if (group.online) return false;
  if (!navigator.onLine) { toast('Il faut du réseau pour partager le groupe'); return true; }
  toast('Connecte-toi d’abord (le nuage en haut)');
  store.sync({ interactive: true });
  return true;
}
function shareCreateDialog() {
  if (needCloud()) return;
  openDialog({
    title: 'Partager le groupe',
    body: `<div class="fields">${F.text('name', 'Nom du groupe', 'Les aventuriers', 'full', 'autofocus')}</div>
      ${F.check('seed', 'Partir de mon groupe actuel (caisse, montures et matériel)', true)}
      <p class="small muted">Tu obtiendras un code à donner aux autres joueurs. Ils le saisissent dans « Rejoindre avec un code » sur leur téléphone (connectés avec leur propre compte : Google ou e-mail).</p>`,
    actions: [cancel, { label: 'Créer le groupe', primary: true, onClick: (f) => {
      const name = f.name.value.trim() || 'Les aventuriers';
      const seed = f.seed.checked ? store.group : { carriers: R.newGroup().carriers };
      (async () => {
        try { await group.create(name, seed, author()); linkChar(group.shared?.id); dlg.close(); render(); shareCodeDialog(); } catch (e) { toast(e.message || 'Création impossible'); }
      })();
      return false;
    } }],
  });
}
function shareJoinDialog() {
  if (needCloud()) return;
  openDialog({
    title: 'Rejoindre un groupe',
    body: `<div class="fields">${F.text('code', 'Code du groupe', '', 'full', 'autofocus autocapitalize="characters" placeholder="Ex. K7MP2QXA"')}</div>
      <p class="small muted">L’onglet Groupe affichera le groupe partagé. Ton groupe personnel reste de côté sur ton compte : tu le retrouves si tu quittes le groupe.</p>`,
    actions: [cancel, { label: 'Rejoindre', primary: true, onClick: (f) => {
      (async () => {
        try { const name = await group.join(f.code.value); linkChar(group.shared?.id); dlg.close(); render(); toast(`Bienvenue dans « ${name} »`); } catch (e) { toast(e.message || 'Code refusé'); }
      })();
      return false;
    } }],
  });
}
function shareCodeDialog() {
  const sh = group.shared;
  if (!sh) return;
  const text = `Rejoins notre groupe Dragonbane « ${sh.name} » : onglet Groupe › Rejoindre avec un code › ${sh.id}`;
  openDialog({
    title: sh.name,
    body: `<p>Code du groupe :</p><p class="share-code">${esc(sh.id)}</p>
      <p class="small muted">Chaque joueur ouvre l’onglet <b>Groupe</b> › <b>Rejoindre avec un code</b>. Tout le monde voit et modifie la même caisse et le même matériel ; le journal indique qui a fait quoi.</p>`,
    actions: [
      { label: 'Quitter', cls: 'ghost', onClick: () => { setTimeout(() => A.gLeave()); } },
      'spacer',
      { label: 'Copier', cls: 'ghost', onClick: () => { navigator.clipboard?.writeText(text).then(() => toast('Invitation copiée')).catch(() => toast(sh.id)); return false; } },
      ...(navigator.share ? [{ label: 'Envoyer', primary: true, onClick: () => { navigator.share({ text }).catch(() => {}); } }] : [closeBtn]),
    ],
  });
}

// ---------- Bibliothèque (consultation) ----------
const LIB_SECTIONS = [['armes', 'Armes'], ['armures', 'Armures'], ['materiel', 'Matériel'], ['sorts', 'Sorts'], ['tours', 'Tours'], ['capacites', 'Capacités'], ['regles', 'Règles']];
function viewBiblio() {
  const sec = ui.libSection || 'armes';
  const row = (title, meta, body, search) => `<details class="lib-item" data-search="${esc(R.norm(search))}">
      <summary><b>${esc(title)}</b><span class="lib-meta">${meta}</span></summary>
      <div class="lib-body">${body}</div>
    </details>`;
  const stats = (pairs) => `<div class="w-stats">${pairs.filter(([, v]) => v !== '' && v != null).map(([k, v]) => `<span><small>${k}</small>${esc(v)}</span>`).join('')}</div>`;
  let content = '';
  if (sec === 'armes') {
    content = [['Armes de contact', 'contact'], ['Armes à distance', 'distance']].map(([g, k]) => `<h3>${g}</h3>${L.WEAPONS.filter((w) => w.kind === k).map((w) => row(w.name, `${esc(w.damage)} · ${esc(R.SKILL[w.skill]?.name || '')}`,
      `${stats([['Compétence', R.SKILL[w.skill]?.name], ['Dégâts', w.damage], ['Bonus', w.bonus || 'aucun'], ['FOR min.', w.str || '—'], ['Prise', w.grip], ['Portée', w.range === 'FOR' ? 'FOR m' : w.range === 'FOR×2' ? 'FOR×2 m' : `${w.range} m`], ['Solidité', w.dur || '—'], ['Prix', w.cost]])}<p class="small">${esc(w.features)}</p>`,
      `${w.name} ${w.features} ${R.SKILL[w.skill]?.name}`)).join('')}`).join('');
  }
  if (sec === 'materiel') {
    content = L.GEAR_CATS.map((cat) => `<h3>${cat}</h3>${L.GEAR.filter((x) => x.cat === cat).map((x) => row(x.name,
      `${fmtMoney(x.cu)}${x.item ? ` · enc. ${x.w === 0.25 ? '¼' : x.w || '—'}` : ''}`,
      `${stats([['Prix', fmtMoney(x.cu)], ...(x.item ? [['Encombrement', x.w === 0.25 ? '¼' : x.w || 'ne compte pas']] : [])])}<p class="small">${esc(x.desc)}</p>`,
      `${x.name} ${x.desc} ${cat}`)).join('')}`).join('');
  }
  if (sec === 'armures') {
    content = [['Armures', 'armor'], ['Casques', 'helmet']].map(([g, k]) => `<h3>${g}</h3>${L.ARMORS.filter((a) => a.slot === k).map((a) => row(a.name, `Armure ${a.rating} · ${esc(a.cost)}`,
      `${stats([['Valeur', a.rating], ['Prix', a.cost]])}<p class="small">${a.banes ? `Désavantage : ${esc(a.banes)}` : 'Aucun désavantage.'}</p>`, `${a.name} ${a.banes}`)).join('')}`).join('');
  }
  if (sec === 'sorts' || sec === 'tours') {
    const src = sec === 'sorts' ? L.SPELLS : L.TRICKS;
    content = Object.entries(L.SCHOOL_LABEL).map(([k, g]) => {
      const items = src.filter((s) => s.school === k).sort((a, b) => (a.rank || 0) - (b.rank || 0));
      if (!items.length) return '';
      return `<h3>${g}</h3>${items.map((s) => sec === 'tours'
        ? row(s.name, '1 PVol', `<p class="small">${esc(s.desc)}</p>`, `${s.name} ${s.desc}`)
        : row(s.name, `Rang ${s.rank}`, `${stats([['Prérequis', s.prereq], ['Composantes', s.req], ['Incantation', s.time], ['Portée', s.range], ['Durée', s.duration]])}<p class="small">${esc(s.desc)}</p>`, `${s.name} ${s.desc} ${s.prereq}`)).join('')}`;
    }).join('');
  }
  if (sec === 'capacites') {
    content = `<h3>Capacités héroïques</h3>${R.HEROIC.map((h) => row(h.name, `${h.wp ? `${esc(h.wp)} PVol` : 'passive'}${h.combat ? ' · combat' : ''}`,
      `${stats([['Prérequis', h.req], ['Coût', h.wp ? `${h.wp} PVol` : '—']])}<p class="small">${esc(h.desc)}</p>`, `${h.name} ${h.desc} ${h.req}`)).join('')}
      <h3>Capacités innées des peuples</h3>${R.KIN_ABILITIES.map((h) => row(h.name, esc(h.req), `${stats([['Peuple', h.req], ['Coût', h.wp ? `${h.wp} PVol` : '—']])}<p class="small">${esc(h.desc)}</p>`, `${h.name} ${h.desc} ${h.req}`)).join('')}`;
  }
  if (sec === 'regles') {
    // Deux sous-rubriques : combat (chapitre 4) et magie (chapitre 5)
    const sub = ui.ruleSub || 'combat';
    const themes = [...new Set(RULES.map(([t]) => t))].filter((t) => t.startsWith('Magie') === (sub === 'magie'));
    content = `<div class="filters sub">${[['combat', '⚔️ Combat'], ['magie', '✨ Magie']].map(([k, l]) => `<button class="chip ${sub === k ? 'on' : ''}" data-act="ruleSub" data-s="${k}">${l}</button>`).join('')}</div>`
      + themes.map((t) => `<h3>${t.replace(/^Magie : /, '')}</h3>${RULES.filter(([x]) => x === t).map(([, title, meta, html]) => row(title, esc(meta),
      `<div class="small rule">${html}</div>`, `${title} ${meta} ${t} ${html.replace(/<[^>]+>/g, ' ')}`)).join('')}`).join('');
  }
  return `<section class="card biblio">
    <h2>Bibliothèque</h2>
    <div class="filters">${LIB_SECTIONS.map(([k, l]) => `<button class="chip ${sec === k ? 'on' : ''}" data-act="libSection" data-s="${k}">${l}</button>`).join('')}</div>
    <input class="lib-search" id="libSearch" type="search" placeholder="Rechercher…" value="${esc(ui.libSearch || '')}">
    <div class="lib-list">${content}</div>
    <p class="empty lib-none" hidden>Rien ne correspond.</p>
    <p class="small muted hint">${sec === 'regles' ? 'Rappels résumés des chapitres combat et magie : le livre fait foi, et le MJ a le dernier mot.' : 'Noms traduits librement, effets résumés : le livre fait foi. Pour équiper ou apprendre, utilise le Sac ou la Magie.'}</p>
  </section>`;
}
// Filtre la liste sans tout redessiner (garde le clavier ouvert)
function filterLib() {
  const q = R.norm(ui.libSearch || '');
  let shown = 0;
  document.querySelectorAll('.lib-list h3').forEach((h) => {
    let el = h.nextElementSibling; let any = false;
    while (el && el.tagName !== 'H3') { const ok = !q || el.dataset.search.includes(q); el.hidden = !ok; if (ok) { any = true; shown++; } el = el.nextElementSibling; }
    h.hidden = !any;
  });
  const none = document.querySelector('.lib-none'); if (none) none.hidden = shown > 0;
}

// ---------- Magie ----------
function viewMagie(c) {
  const schools = c.skills.filter(R.knowsMagic);
  const prepared = c.spells.filter((s) => s.prepared).length;
  const pmax = R.preparedMax(c);
  const tricks = c.tricks.map((t, i) => `<div class="spell trick">
      <div class="w-head"><b>${esc(t.name)}</b><span class="tag">${esc(schoolName(t.school))}</span><button class="icon-btn small" data-act="editTrick" data-i="${i}" aria-label="Modifier">${icon('edit')}</button></div>
      ${t.desc ? `<div class="small">${esc(t.desc)}</div>` : ''}
      <div class="w-actions"><button class="btn small" data-act="castTrick" data-i="${i}">${icon('bolt')} Lancer (1 PVol)</button></div>
    </div>`).join('') || '<div class="empty">Aucun tour de magie.</div>';
  const spells = c.spells.map((s, i) => `<div class="spell ${s.prepared ? 'prepared' : ''}">
      <div class="w-head"><b>${esc(s.name)}</b><span class="tag">Rang ${esc(s.rank || 1)}</span><span class="tag">${esc(schoolName(s.school))}</span><button class="icon-btn small" data-act="editSpell" data-i="${i}" aria-label="Modifier">${icon('edit')}</button></div>
      <div class="w-stats">
        ${s.time ? `<span><small>Incantation</small>${esc(s.time)}</span>` : ''}
        ${s.range ? `<span><small>Portée</small>${esc(s.range)}</span>` : ''}
        ${s.duration ? `<span><small>Durée</small>${esc(s.duration)}</span>` : ''}
        ${s.req ? `<span><small>Composantes</small>${esc(s.req)}</span>` : ''}
        ${s.prereq ? `<span><small>Prérequis</small>${esc(s.prereq)}</span>` : ''}
        ${s.power ? '' : '<span><small>Niveau de puissance</small>non</span>'}
      </div>
      ${s.desc ? `<div class="small spell-desc">${esc(s.desc)}</div>` : ''}
      <div class="w-actions">
        <button class="btn small" data-act="castSpell" data-i="${i}">${icon('wand')} Lancer</button>
        <button class="chip ${s.prepared ? 'on' : ''}" data-act="prepSpell" data-i="${i}">${s.prepared ? '✓ Préparé' : 'Préparer'}</button>
      </div>
    </div>`).join('') || '<div class="empty">Aucun sort.</div>';

  return `${vitals(c)}
  <div class="grid two">
    <section class="card span-all">
      <h2>Écoles de magie</h2>
      ${schools.length ? `<div class="skills">${schools.map((s) => skillRow(c, s)).join('')}</div>` : '<p class="small muted">Aucune école entraînée. Passe en mode libre et entraîne Animisme, Élémentalisme ou Mentalisme dans la Fiche.</p>'}
      <div class="stats-row two">
        <div class="stat"><div class="sk">PVol</div><div class="sv">${c.wp.cur}<small>/${R.maxWP(c)}</small></div></div>
        <div class="stat ${prepared > pmax ? 'over' : ''}"><div class="sk">Sorts préparés</div><div class="sv">${prepared}<small>/${pmax}</small></div></div>
      </div>
      <p class="small muted hint">Un sort coûte 2 PVol par niveau de puissance. Le nombre de sorts préparés est limité à la chance de base de l’INT.</p>
    </section>
    <section class="card">
      <h2>Tours de magie</h2>
      ${tricks}
      <div class="add-row"><button class="btn ghost small" data-act="editTrick" data-i="-1">${icon('plus')} Ajouter un tour</button></div>
    </section>
    <section class="card">
      <h2>Sorts</h2>
      ${spells}
      <div class="add-row"><button class="btn ghost small" data-act="editSpell" data-i="-1">${icon('plus')} Ajouter un sort</button></div>
    </section>
  </div>`;
}
const schoolName = (id) => R.SKILL[id]?.name || (id === 'general' ? 'Générale' : id || 'Générale');
const schoolOpts = [['general', 'Magie générale'], ...R.MAGIC_SKILLS.map((id) => [id, R.SKILL[id].name])];

// ---------- Sac ----------
const totalCopper = (m) => (+m.or || 0) * 100 + (+m.argent || 0) * 10 + (+m.cuivre || 0);
function viewSac(c) {
  const used = R.encUsed(c); const lim = R.encLimit(c);
  const coin = (k, label, cls) => `<div class="coin ${cls}"><span class="ck">${label}</span>
    <div class="step"><button data-act="money" data-k="${k}" data-d="-1">−</button>${bind(`money.${k}`, c.money[k], 'number')}<button data-act="money" data-k="${k}" data-d="1">+</button></div></div>`;
  const items = c.items.map((it, i) => `<button class="list-item ${it.worn ? 'worn' : ''}" data-act="editItem" data-i="${i}">
      <span class="badge soft" title="Encombrement">${it.worn ? '—' : (+it.weight || 0) * (+it.qty || 1)}</span>
      <span class="li-main"><div class="li-title">${esc(it.name)}${+it.qty > 1 ? ` <span class="muted">×${it.qty}</span>` : ''}</div>${it.notes ? `<div class="li-sub">${esc(it.notes)}</div>` : ''}</span>
    </button>`).join('') || '<div class="empty">Sac vide.</div>';
  const weapons = c.weapons.map((w, i) => {
    const sk = c.skills.find((s) => s.id === w.skill);
    const bonus = w.bonus ? R.damageBonus(c.attrs[w.bonus]) : '';
    const info = [sk?.name, w.grip, w.range && `portée ${rangeTxt(c, w.range)}`, +w.strReq && `FOR ${w.strReq}`, w.durability && `solidité ${w.durability}`, w.features].filter(Boolean).join(' · ');
    return `<button class="list-item ${w.broken ? 'worn' : ''}" data-act="editWeapon" data-i="${i}">
      <span class="badge dmg-badge" title="Dégâts${bonus ? ` + bonus ${bonus}` : ''}"><b>${esc(w.damage || '—')}</b>${bonus ? `<small>+${bonus}</small>` : ''}</span>
      <span class="li-main"><div class="li-title">${esc(w.name || 'Arme')}${w.broken ? ' <span class="tag bad">brisée</span>' : ''}</div>${info ? `<div class="li-sub">${esc(info)}</div>` : ''}</span>
    </button>`;
  }).join('') || '<div class="empty">Aucune arme.</div>';
  const armorRow = (k, label) => {
    const a = c[k];
    return `<button class="list-item" data-act="editArmor" data-k="${k}">
      <span class="badge ${a.rating ? '' : 'soft'}" title="Valeur d’armure">${a.rating || 0}</span>
      <span class="li-main"><div class="li-title">${esc(a.name || `${label} : aucun${k === 'armor' ? 'e' : ''}`)}</div><div class="li-sub">${a.banes ? `Désavantage : ${esc(a.banes)}` : 'Aucun désavantage'}</div></span>
    </button>`;
  };
  return `<div class="grid two">
    <section class="card">
      <h2>Armes à portée de main</h2>
      ${weapons}
      ${c.weapons.length > 3 ? '<p class="small bad">3 armes au plus à portée de main : range les autres dans l’équipement.</p>' : ''}
      <div class="add-row"><button class="btn ghost small" data-act="editWeapon" data-i="-1">${icon('plus')} Ajouter une arme</button></div>
    </section>
    <section class="card">
      <h2>Armure et casque</h2>
      <div class="armor-total"><span>Valeur d’armure</span><b>${R.armorTotal(c)}</b></div>
      ${armorRow('armor', 'Armure')}
      ${armorRow('helmet', 'Casque')}
      <p class="small muted hint">Touche pour changer. Les compétences gênées reçoivent un désavantage automatique.</p>
    </section>
    <section class="card">
      <h2>Bourse</h2>
      <div class="coins">${coin('or', 'Or', 'gold')}${coin('argent', 'Argent', 'silver')}${coin('cuivre', 'Cuivre', 'copper')}</div>
      <p class="small muted hint">1 or = 10 argent = 100 cuivre · total : ${fmtMoney(totalCopper(c.money))}</p>
      <div class="add-row"><button class="btn small" data-act="pay">${icon('coin')} Payer</button><button class="btn small ghost" data-act="earn">${icon('plus')} Recevoir</button></div>
    </section>
    <section class="card">
      <h2>Encombrement</h2>
      <div class="enc ${used > lim ? 'over' : ''}"><b>${used}</b> / ${lim}</div>
      <div class="bar"><i style="width:${lim ? clamp(used / lim * 100, 0, 100) : 0}%"></i></div>
      <p class="small muted">Limite : FOR ÷ 2 (arrondi au supérieur)${c.backpack ? ' + 2 (sac à dos)' : ''}. Les armes à portée de main (3 au plus), l’armure et le casque portés ne comptent pas. 4 rations = 1 objet.${used > lim ? ' <b class="bad">Surchargé : jet de FOR pour avancer.</b>' : ''}</p>
      <label class="check"><input type="checkbox" data-act="toggleBackpack" ${c.backpack ? 'checked' : ''}><span>Sac à dos (+2)</span></label>
    </section>
    <section class="card span-all">
      <h2>Équipement</h2>
      ${items}
      <div class="add-row"><button class="btn ghost small" data-act="editItem" data-i="-1">${icon('bag')} Choisir dans la liste de matériel</button></div>
      <form class="quick-add" data-form="quickItem"><input name="item" placeholder="Ajouter un objet (ex. Corde, Torche…)"><button class="btn small" type="submit">${icon('plus')}</button></form>
    </section>
    <section class="card">
      <h2>Objets minuscules</h2>
      ${bind('tiny', c.tiny, 'area', 'placeholder="Objets qui ne comptent pas dans l’encombrement (bague, clé, dé…)"')}
    </section>
    <section class="card">
      <h2>Souvenir</h2>
      ${bind('memento', c.memento, 'text', 'placeholder="Un objet chargé de sens"')}
    </section>
  </div>`;
}
function fmtMoney(cu) {
  const o = Math.floor(cu / 100); const a = Math.floor((cu % 100) / 10); const k = cu % 10;
  return [o && `${o} or`, a && `${a} arg.`, k && `${k} cu.`].filter(Boolean).join(' ') || '0';
}

// ---------- Progrès ----------
function viewProg(c) {
  const marked = c.skills.filter((s) => s.mark).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  const at18 = c.skills.filter((s) => s.value >= 18);
  const lastUndo = c.log.find((e) => e.undo && !e.undone);
  const log = c.log.slice(0, 60).map((e) => `<div class="log-row ${e.undone ? 'undone' : ''}">
      <span class="log-date">${fmtDate(e.date)}</span><span class="log-txt">${esc(e.label)}</span>
      ${e === lastUndo ? `<button class="icon-btn small" data-act="undo" title="Annuler">${icon('undo')}</button>` : ''}
    </div>`).join('') || '<div class="empty">Rien pour l’instant.</div>';
  return `<div class="grid two">
    <section class="card">
      <h2>Fin de séance</h2>
      <ol class="steps">
        <li>Pendant la partie, chaque <b>Dragon</b> ou <b>Démon</b> coche la compétence utilisée (automatique avec le lanceur de dés).</li>
        <li>Réponds aux questions de fin de séance : chaque « oui » donne une coche à placer.</li>
        <li>Lance les jets d’amélioration : D20 <b>supérieur</b> au niveau de la compétence = +1 (maximum 18).</li>
      </ol>
      <div class="add-row">
        <button class="btn" data-act="endSession">${icon('check')} Questions de fin de séance</button>
        <button class="btn gold" data-act="advanceRolls" ${marked.length ? '' : 'disabled'}>${icon('d20')} Jets d’amélioration</button>
      </div>
      ${c.pendingMarks ? `<p class="small"><b>${c.pendingMarks}</b> coche${c.pendingMarks > 1 ? 's' : ''} à placer : passe en mode <b>Progression</b> et touche les compétences dans la Fiche. <button class="btn small gold" data-act="setMode" data-m="prog">Placer</button></p>` : ''}
    </section>
    <section class="card">
      <h2>Compétences cochées</h2>
      ${marked.length ? `<div class="skills">${marked.map((s) => skillRow(c, s)).join('')}</div>` : '<div class="empty">Aucune coche pour l’instant.</div>'}
      ${at18.length ? `<p class="small"><b>Compétence${at18.length > 1 ? 's' : ''} à 18 :</b> ${at18.map((s) => esc(s.name)).join(', ')}. Atteindre 18 donne immédiatement une nouvelle capacité héroïque (dont tu remplis le prérequis).</p>` : ''}
    </section>
    <section class="card span-all">
      <h2>Historique</h2>
      ${log}
    </section>
  </div>`;
}

// ---------- Carnet ----------
function viewCarnet(c) {
  const free = isFree();
  const ro = (label, val) => `<div class="field"><label>${label}</label><div class="ro">${esc(val || '—')}</div></div>`;
  const identity = free ? `
      <div class="field"><label>Nom</label>${bind('name', c.name)}</div>
      ${F.select('kin', 'Peuple', c.kin, R.KINS.map((k) => [k.key, k.name]), '', 'data-ident')}
      ${c.kin === 'autre' ? `<div class="field"><label>Nom du peuple</label>${bind('kinName', c.kinName)}</div><div class="field"><label>Déplacement de base</label>${bind('kinMove', c.kinMove ?? 10, 'number', 'data-rerender')}</div>` : ''}
      ${F.select('profession', 'Profession', c.profession, R.PROFESSIONS.map((p) => [p.key, p.name]), '', 'data-ident')}
      ${c.profession === 'mage' ? F.select('school', 'École', c.school, [['', '—'], ...Object.entries(R.SCHOOLS).map(([k, s]) => [k, s.name])], '', 'data-ident') : ''}
      ${c.profession === 'autre' ? `<div class="field"><label>Nom de la profession</label>${bind('professionName', c.professionName)}</div>` : ''}
      ${F.select('age', 'Âge', c.age, R.AGES.map((a) => [a.key, a.name]), '', 'data-ident')}
      <div class="field"><label>Bonus PV max</label>${bind('hp.bonus', c.hp.bonus, 'number', 'data-rerender')}</div>
      <div class="field"><label>Bonus PVol max</label>${bind('wp.bonus', c.wp.bonus, 'number', 'data-rerender')}</div>`
    : `${ro('Nom', c.name)}${ro('Peuple', R.kinName(c))}${ro('Profession', R.profName(c))}${ro('Âge', R.AGE[c.age]?.name)}`;
  return `<div class="grid two">
    <section class="card">
      <h2>Identité</h2>
      <div class="fields">${identity}</div>
      ${free ? '' : `<p class="small muted hint">Passe en mode <b>Libre</b> pour changer le nom, le peuple, la profession ou l’âge. <button class="btn small ghost" data-act="setMode" data-m="libre">Mode libre</button></p>`}
    </section>
    <section class="card">
      <h2>Personnalité</h2>
      ${ui.mode === 'normal' ? `<div class="fields">
        <div class="field full"><label>Faiblesse</label><div class="ro ro-text">${esc(c.weakness || '—')}</div></div>
        <div class="field full"><label>Apparence</label><div class="ro ro-text">${esc(c.appearance || '—')}</div></div>
        <div class="field full"><label>Souvenir</label><div class="ro ro-text">${esc(c.memento || '—')}</div></div>
      </div>
      ${ui.guest || ui.mjView ? '' : `<p class="small muted hint">Passe en mode <b>Libre</b> ou <b>Progression</b> pour modifier la personnalité. <button class="btn small ghost" data-act="setMode" data-m="libre">Mode libre</button></p>`}` : `<div class="fields">
        <div class="field full"><label>Faiblesse</label>${bind('weakness', c.weakness, 'area', 'rows="2"')}</div>
        <div class="field full"><label>Apparence</label>${bind('appearance', c.appearance, 'area', 'rows="2"')}</div>
        <div class="field full"><label>Souvenir</label>${bind('memento', c.memento)}</div>
      </div>`}
    </section>
    <section class="card">
      <h2>Compagnons et relations</h2>
      ${bind('companions', c.companions, 'area', 'placeholder="Compagnons d’aventure, alliés, ennemis…"')}
    </section>
    <section class="card">
      <h2>Notes</h2>
      ${bind('notes', c.notes, 'area', 'rows="8" placeholder="Journal de campagne, indices, dettes…"')}
    </section>
    <section class="card span-all">
      <h2>Personnage</h2>
      <div class="add-row">
        <button class="btn ghost small" data-act="exportOne">${icon('down')} Exporter ce personnage</button>
        <button class="btn ghost small" data-act="deleteCharacter">${icon('trash')} Supprimer</button>
      </div>
    </section>
  </div>`;
}

// ---------- Meneur de jeu ----------
// Le MJ est un compte désigné dans le groupe partagé (champ « mj » du document du groupe).
// Chaque joueur envoie automatiquement ses fiches COMPLÈTES (notes secrètes, journal perso, PNJ, lieux, croquis)
// dans groups/{code}/mj/{son uid}/… ; la règle Firestore réserve leur lecture au joueur lui-même et au MJ.
const isMJ = () => !!(group.shared?.mj && cloud.uid() === group.shared.mj);
// Administrateur du groupe : son créateur (premier membre pour les groupes créés avant cette version)
const isAdmin = () => !!(group.shared && cloud.uid() && cloud.uid() === group.shared.owner);
const mjSent = new Map();    // id → updatedAt déjà envoyé au MJ
let mjTimer = null; let mjError = ''; let mjFullKey = '';
const mjErrText = (e) => (e?.code === 'permission-denied' ? 'Envoi au MJ refusé par Firebase : ajoute la règle « mj » (voir le manuel)' : e?.message || 'Erreur');
// Images et croquis de mon journal perso (fiche) référencés par un personnage
const mjMediaIds = (c) => [...(c.journal || []).map((s) => s.sketch), ...(c.npcs || []).map((n) => n.photo), ...(c.lieux || []).map((l) => l.photo)].filter(Boolean);
let mjOkAt = 0; let mjRetry = null;
// Personnage de la partie active ? (un personnage sans partie n'est envoyé que si je ne suis pas le MJ de celle-ci)
const inActiveGroup = (c) => !!c.groupId && c.groupId === group.shared?.id;
async function mjSend(c) {
  const g = group.shared?.id;
  if (!g || !group.shared.mj || !cloud.user() || !c) return false;
  if (!inActiveGroup(c)) return true; // personnage d'une autre partie : pas pour ce MJ
  try {
    if (mjSent.get(c.id) !== c.updatedAt) { await cloud.putMJPerso(g, c); mjSent.set(c.id, c.updatedAt); }
    for (const id of mjMediaIds(c)) {
      const m = store.sketch(id);
      if (m && mjSent.get(id) !== m.updatedAt) { await cloud.putMJMedia(g, m); mjSent.set(id, m.updatedAt); }
    }
    mjError = ''; mjOkAt = Date.now();
    return true;
  } catch (e) { mjError = mjErrText(e); return false; }
}
function pushMJ(c) { clearTimeout(mjTimer); mjTimer = setTimeout(async () => { if (!(await mjSend(c))) mjSync(true); }, 3000); }
// Une fois par session (et à chaque changement de groupe ou de MJ) : toutes mes fiches
// En cas d'échec (hors ligne, règle Firebase pas encore en place…), on réessaie toutes les minutes.
function mjSync(force = false) {
  const key = group.shared?.mj && cloud.user() ? `${group.shared.id}/${group.shared.mj}/${cloud.uid()}` : '';
  if (!key || (key === mjFullKey && !force)) return;
  mjFullKey = key;
  (async () => {
    let ok = true;
    for (const c of store.list()) ok = (await mjSend(c)) && ok;
    clearTimeout(mjRetry);
    if (!ok) { mjFullKey = ''; mjRetry = setTimeout(() => mjSync(), 60000); }
    if (ui.tab === 'groupe' && !dlg.open && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) render();
  })();
}

// ----- Côté MJ : suivi en direct des fiches de chaque joueur -----
const mjData = {};             // uid du joueur → personnages
const mjLive = {};             // id → copie prêtée en cours de jeu (plus récente que la fiche reçue du joueur)
const mjLiveWatches = new Map();
const mjWatches = new Map();   // uid → arrêt du suivi
const mjErrBy = {};            // uid → dernière erreur de lecture
let mjErr = '';
function mjWatch() {
  if (!isMJ()) { mjWatches.forEach((stop) => stop()); mjWatches.clear(); mjLiveWatches.forEach((stop) => stop()); mjLiveWatches.clear(); return; }
  const g = group.shared.id;
  // Personnages prêtés : on suit la copie jouée pour voir PV et états en direct pendant la séance
  const lentIds = new Set((G().persos || []).map((x) => x.id));
  mjLiveWatches.forEach((stop, id) => { if (!lentIds.has(id)) { stop(); mjLiveWatches.delete(id); delete mjLive[id]; } });
  lentIds.forEach((id) => {
    if (mjLiveWatches.has(id)) return;
    mjLiveWatches.set(id, cloud.watchPerso(g, id, (c) => {
      mjLive[id] = c;
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (ui.tab === 'mj' && !typing && !dlg.open) render();
    }, () => { delete mjLive[id]; }));
  });
  for (const owner of Object.keys(group.shared.members || {})) {
    if (mjWatches.has(owner)) continue;
    mjWatches.set(owner, cloud.watchMJPersos(g, owner, (list) => {
      mjData[owner] = list; mjErr = ''; delete mjErrBy[owner];
      if (ui.mjView) { const fresh = list.find((x) => x.id === ui.mjView.id); if (fresh) ui.mjView = R.upgradeCharacter(fresh); }
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (['mj'].includes(ui.tab) && !typing && !dlg.open) render();
    }, (e) => {
      // Un suivi refusé s'arrête définitivement : on l'oublie pour le relancer dans 30 s
      mjWatches.delete(owner);
      mjErrBy[owner] = e?.code === 'permission-denied' ? 'lecture refusée par Firebase' : (e?.message || 'erreur');
      setTimeout(() => { if (isMJ()) mjWatch(); }, 30000);
      mjErr = e?.code === 'permission-denied' ? 'Lecture refusée par Firebase : ajoute la règle « mj » (voir le manuel)' : e.message;
      if (ui.tab === 'mj') render();
    }));
  }
}
// Notes secrètes des joueurs sur une session (s), un PNJ (n) ou un lieu (l) : visibles par le MJ seulement
function mjSecrets(kind, id) {
  if (!isMJ()) return [];
  const members = group.shared.members || {};
  return Object.entries(mjData).flatMap(([owner, list]) => (list || []).map((ch) => ({ ch, player: members[owner] || '', t: ch.secret?.[kind]?.[id] })).filter((x) => x.t));
}
// Champ privé du MJ (sessions, PNJ, lieux) : rangé dans son compte, jamais envoyé au groupe
const mjNoteField = (kind, id) => (isMJ() && id ? `<div class="field full j-secret mj-own"><label>👑 Notes du MJ <small>visibles par toi seul</small></label><textarea data-mjn="${kind}|${id}" rows="3" placeholder="Ce que les joueurs ne savent pas…">${esc(store.mjNote(group.shared.id, kind, id))}</textarea></div>` : '');
const mjNoteLine = (kind, id) => { const t = isMJ() ? store.mjNote(group.shared.id, kind, id) : ''; return t ? `<p class="small npc-notes mj-note-line">👑 ${esc(t)}</p>` : ''; };
function mjSecretBlock(kind, id) {
  const list = mjSecrets(kind, id);
  if (!list.length) return '';
  return `<div class="mj-secrets full"><p class="small"><b>👑 Secrets des joueurs</b> <span class="muted">(visibles par toi seul)</span></p>
    ${list.map(({ ch, player, t }) => `<p class="small mj-secret"><b>${esc(ch.name)}</b>${player ? ` <span class="muted">(${esc(player)})</span>` : ''} : ${esc(t)}</p>`).join('')}</div>`;
}
const MJ_SKILLS = ['vigilance', 'esquive', 'discretion', 'fouille', 'persuasion', 'bluff', 'soins'];
function mjCard(ch, player, owner) {
  const hpMax = R.maxHP(ch); const wpMax = R.maxWP(ch);
  const conds = R.ATTRS.filter((a) => ch.conditions?.[a.key]);
  const bar = (cur, max, cls) => `<span class="vbar ${cls}"><i style="width:${max ? clamp(cur / max * 100, 0, 100) : 0}%"></i></span>`;
  const skills = MJ_SKILLS.map((id) => ch.skills.find((s) => s.id === id)).filter(Boolean);
  const weapons = (ch.weapons || []).filter((w) => w.name);
  return `<article class="card mj-card ${ch.hp.cur <= 0 ? 'down' : ''}">
    <div class="mj-head">
      ${ch.portrait ? `<span class="crest photo" style="background-image:url('${ch.portrait}')"></span>` : `<span class="crest">${esc((ch.name || '?').charAt(0).toUpperCase())}</span>`}
      <span class="mj-name"><b>${esc(ch.name || 'Sans nom')}</b><small>${esc([R.kinName(ch), R.profName(ch)].filter(Boolean).join(' · '))} · joueur : ${esc(player)}</small></span>
    </div>
    <div class="mj-pools">
      <div><span>PV</span><b class="${ch.hp.cur <= 0 ? 'bad' : ''}">${ch.hp.cur}<small>/${hpMax}</small></b>${bar(ch.hp.cur, hpMax, 'hp')}</div>
      <div><span>PVol</span><b>${ch.wp.cur}<small>/${wpMax}</small></b>${bar(ch.wp.cur, wpMax, 'wp')}</div>
      <div><span>Armure</span><b>${R.armorTotal(ch)}</b></div>
      <div><span>Dépl.</span><b>${R.movement(ch)}</b></div>
    </div>
    ${ch.hp.cur <= 0 ? `<p class="small bad">À 0 PV — jets de mort : ${ch.death?.succ || 0} réussite(s), ${ch.death?.fail || 0} échec(s)</p>` : ''}
    <div class="mj-conds">${ch.music ? '<span class="cond-pill music">♪ Barde</span>' : ''}${conds.map((a) => `<span class="cond-pill">${a.cond}</span>`).join('') || '<span class="small muted">Aucun état</span>'}</div>
    ${weapons.length ? `<p class="small mj-line"><b>Armes</b> ${weapons.map((w) => `${esc(w.name)} (${esc(w.damage || '')})`).join(' · ')}</p>` : ''}
    <p class="small mj-line"><b>Compétences</b> ${skills.map((s) => `${esc(s.name)} ${s.value}`).join(' · ')}</p>
    ${(G().persos || []).some((p) => p.id === ch.id) ? `<p class="small mj-lent">🎭 Prêté au groupe${mjLive[ch.id] && (mjLive[ch.id].updatedAt || 0) > 0 ? ' : les PV et états affichés suivent la partie' : ''}</p>` : ''}
    <div class="add-row"><button class="btn small" data-act="mjOpen" data-u="${owner}" data-id="${ch.id}">${icon('book')} Fiche complète</button><button class="btn small ghost" data-act="mjPrivate" data-u="${owner}" data-id="${ch.id}">🔒 Notes privées</button>
      ${(G().persos || []).some((p) => p.id === ch.id) ? `<button class="btn small ghost" data-act="mjUnlend" data-id="${ch.id}">Ne plus prêter</button>` : `<button class="btn small ghost" data-act="mjLend" data-u="${owner}" data-id="${ch.id}" title="Le joueur est absent : les autres pourront jouer son personnage (mode Jeu)">🎭 Prêter au groupe</button>`}</div>
  </article>`;
}
function viewMJ() {
  if (!isMJ()) return '<section class="card"><h2>Meneur de jeu</h2><p>Réservé au MJ du groupe.</p></section>';
  const sh = group.shared; const members = sh.members || {};
  const cards = Object.entries(members).flatMap(([owner, name]) => (mjData[owner] || []).map((ch) => mjCard(mjMerged(ch), name, owner))).join('');
  const waiting = Object.entries(members).filter(([owner]) => owner !== cloud.uid() && !(mjData[owner] || []).length).map(([, name]) => name);
  return `<div class="grid mj">
    <section class="card span-all">
      <h2>Meneur de jeu</h2>
      <p class="small muted">Toutes les fiches du groupe « ${esc(sh.name)} », mises à jour en direct, notes privées comprises. Touche « Fiche complète » pour tout voir (lecture seule).</p>
      ${mjErr ? `<p class="small bad">${esc(mjErr)}</p>` : ''}
      <details class="mj-link" ${cards ? '' : 'open'}><summary class="small">État de la liaison : groupe « ${esc(sh.name)} » · code ${esc(sh.id)} · ${Object.keys(members).length} membre(s)</summary>
        ${Object.entries(members).map(([owner, name]) => {
          const list = mjData[owner] || [];
          const last = list.reduce((m, x) => Math.max(m, x.updatedAt || 0), 0);
          const state = owner === cloud.uid() ? '<span class="muted">toi (MJ)</span>'
            : list.length ? `<span class="good">${list.length} fiche${list.length > 1 ? 's' : ''} reçue${list.length > 1 ? 's' : ''}${last ? ` · mise à jour ${fmtWhen(last)}` : ''}</span>`
            : mjErrBy[owner] ? `<span class="bad">${esc(mjErrBy[owner])}</span>`
            : '<span class="muted">aucune fiche reçue : il doit ouvrir l’appli (version à jour), connecté, et voir « ✓ Tes fiches sont à jour chez le MJ » dans l’onglet Groupe</span>';
          return `<p class="small mj-member"><b>${esc(name)}</b> — ${state}</p>`;
        }).join('')}
      </details>
    </section>
    <div class="mj-grid span-all">${cards || '<p class="empty">Aucune fiche reçue pour l’instant.</p>'}</div>
  </div>`;
}
const mjMerged = (ch) => {
  const live = mjLive[ch.id];
  if (!live || (live.updatedAt || 0) <= (ch.updatedAt || 0)) return ch;
  const m = { ...live }; PRIVATE_KEYS.forEach((k) => { if (ch[k] !== undefined) m[k] = ch[k]; });
  return m;
};
const mjChar = (owner, id) => { const ch = (mjData[owner] || []).find((x) => x.id === id); return ch && mjMerged(ch); };
// Notes privées d'un personnage : notes secrètes, journal perso, carnet
function mjPrivateDialog(owner, id) {
  const ch = mjChar(owner, id); if (!ch) return;
  const gj = group.state; const sec = ch.secret || {};
  const line = (label, text) => (text ? `<div class="mj-note"><b>${label}</b><p class="small pre">${esc(text)}</p></div>` : '');
  const secS = Object.entries(sec.s || {}).filter(([, t]) => t).map(([sid, t]) => { const s = gj.journal?.find((x) => x.id === sid); return line(`Session ${s ? `${s.n}${s.title ? ` « ${esc(s.title)} »` : ''}` : '(supprimée)'}`, t); }).join('');
  const secN = Object.entries(sec.n || {}).filter(([, t]) => t).map(([nid, t]) => line(`PNJ ${esc(gj.npcs?.find((x) => x.id === nid)?.name || '?')}`, t)).join('');
  const secL = Object.entries(sec.l || {}).filter(([, t]) => t).map(([pid, t]) => line(`Lieu ${esc(gj.lieux?.find((x) => x.id === pid)?.name || '?')}`, t)).join('');
  const perso = (ch.journal || []).map((s) => line(`Session ${s.n}${s.title ? ` « ${esc(s.title)} »` : ''} (${fmtDay(s.date)})`, [s.summary, s.loot && `Butin : ${s.loot}`, (s.todos || []).filter((t) => !t.done).map((t) => `☐ ${t.t}`).join('\n')].filter(Boolean).join('\n'))).join('');
  openDialog({
    title: `${ch.name} — notes privées`,
    cls: 'history',
    body: `<h3>🔒 Notes secrètes</h3>${secS + secN + secL || '<p class="small muted">Aucune.</p>'}
      <h3>Carnet</h3>${line('Faiblesse', ch.weakness) + line('Notes', ch.notes) + line('Compagnons et relations', ch.companions) || '<p class="small muted">Rien.</p>'}
      <h3>Journal personnel</h3>${perso || '<p class="small muted">Aucune session.</p>'}
      ${(ch.npcs || []).length || (ch.lieux || []).length ? `<p class="small">PNJ perso : ${(ch.npcs || []).map((n) => esc(n.name)).join(', ') || '—'} · Lieux perso : ${(ch.lieux || []).map((l) => esc(l.name)).join(', ') || '—'}</p>` : ''}`,
    actions: [closeBtn],
  });
}

// ----- Personnages prêtés au groupe : jouer le personnage d'un joueur absent -----
// Le joueur coche « Prêter au groupe » : une copie de sa fiche de jeu (sans notes secrètes, journal perso,
// PNJ ni lieux) va dans groups/{code}/media/perso_{id}, tenue à jour à chaque modification.
// Un autre membre peut la jouer en mode Jeu seulement (ui.guest) : ses changements vont dans cette copie,
// et le propriétaire les reprend dès que son appli la voit (PV, objets, compétences cochées…).
const PRIVATE_KEYS = ['secret', 'journal', 'npcs', 'lieux', 'jImportHide'];
const lendCopy = (c) => { const x = { ...c }; PRIVATE_KEYS.forEach((k) => delete x[k]); return x; };
const ownerName = () => cloud.user()?.displayName || store.userEmail || 'un joueur';
const lentHere = (c) => !!(group.shared && c?.lentTo === group.shared.id);
let lendTimer = null;
let lendWatch = null; let lendWatchId = null;
let guestWatch = null;
const lentDocs = new Set(); // mes personnages dont une copie prêtée existe dans le groupe (prêtés par moi ou par le MJ)
function pushLent(c, now = false) {
  if (!(lentHere(c) || lentDocs.has(c?.id)) || !cloud.user()) return;
  clearTimeout(lendTimer);
  const send = () => cloud.putPerso(group.shared.id, lendCopy(c), ownerName()).catch((e) => toast(media.error() || e.message));
  if (now) send(); else lendTimer = setTimeout(send, 2500);
}
function pushGuest() {
  if (!ui.guest || !group.shared) return;
  clearTimeout(lendTimer);
  const g = ui.guest; const owner = ui.guestOwner;
  lendTimer = setTimeout(() => cloud.putPerso(group.shared.id, lendCopy(g), owner).catch((e) => toast(e.message)), 1500);
}
// Le propriétaire reprend la fiche jouée en son absence (en gardant ses notes privées)
function adoptLent(remote) {
  const local = store.list().find((x) => x.id === remote.id);
  if (!local || (remote.updatedAt || 0) <= (local.updatedAt || 0)) return false;
  const merged = { ...remote };
  PRIVATE_KEYS.forEach((k) => { if (local[k] !== undefined) merged[k] = local[k]; });
  merged.lentTo = local.lentTo;
  store.replaceCharacter(merged);
  return true;
}
// Suivi en direct de mes personnages prêtés (appelé à chaque affichage ; ne fait rien si rien n'a changé)
// Suit la copie prêtée de mon personnage affiché (si le MJ l'a prêtée sans moi, je reprends quand même les changements)
let lentCheckKey = '';
function watchLent() {
  const c = store.current();
  const want = !ui.guest && group.shared && cloud.user() && c ? `${group.shared.id}/${c.id}` : null;
  if (want !== lendWatchId) {
    lendWatch?.(); lendWatch = null; lendWatchId = want;
    if (want) {
      lendWatch = cloud.watchPerso(group.shared.id, c.id, (remote) => {
        lentDocs.add(remote.id);
        if (!adoptLent(remote)) return;
        toast(`${remote.name} a été joué en ton absence : fiche mise à jour`);
        const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
        if (!typing && !dlg.open) render();
      }, () => { lentDocs.delete(c.id); });
    }
  }
  // Une fois par session : mes autres personnages ont-ils été prêtés et joués ?
  const key = group.shared && cloud.user() ? `${group.shared.id}/${cloud.uid()}` : '';
  if (key && key !== lentCheckKey) {
    lentCheckKey = key;
    (async () => {
      for (const x of store.list()) {
        try {
          const got = await cloud.getPerso(group.shared.id, x.id);
          if (got) { lentDocs.add(x.id); if (adoptLent(got.c)) toast(`${got.c.name} a été joué en ton absence : fiche mise à jour`); }
        } catch { /* hors ligne ou règle absente : on réessaiera au prochain lancement */ }
      }
    })();
  }
}
async function lendToggle(c, on) {
  const g = group.shared; if (!g) return;
  if (!cloud.user()) { toast('Connecte-toi d’abord (le nuage en haut)'); return; }
  if (on) {
    c.lentTo = g.id; c.updatedAt = Date.now(); store.save();
    try { await cloud.putPerso(g.id, lendCopy(c), ownerName()); } catch (e) { delete c.lentTo; store.save(); toast(media.error() || e.message); render(); return; }
    group.apply({ t: 'p:lend', perso: { id: c.id, name: c.name, owner: ownerName(), sub: [R.kinName(c), R.profName(c)].filter(Boolean).join(' · ') } }, c.name);
    toast(`${c.name} est prêté au groupe`);
  } else {
    delete c.lentTo; c.updatedAt = Date.now(); store.save();
    cloud.deletePerso(g.id, c.id).catch(() => {});
    group.apply({ t: 'p:unlend', id: c.id }, c.name);
    toast(`${c.name} n’est plus prêté`);
  }
  render();
}
async function guestStart(id) {
  const g = group.shared; if (!g) return;
  try {
    const got = await cloud.getPerso(g.id, id);
    if (!got) { toast('Ce personnage n’est plus prêté'); return; }
    ui.guest = R.upgradeCharacter(got.c); ui.guestOwner = got.owner; ui.mode = 'normal';
    guestWatch?.();
    // Le propriétaire revient et modifie sa fiche, ou arrête de la prêter
    guestWatch = cloud.watchPerso(g.id, id, (remote) => {
      if (!ui.guest || ui.guest.id !== remote.id || (remote.updatedAt || 0) <= (ui.guest.updatedAt || 0)) return;
      ui.guest = R.upgradeCharacter(remote);
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (!typing && !dlg.open) render();
    }, () => { if (ui.guest?.id === id) { guestEnd(); toast('Ce personnage n’est plus prêté'); } });
    render(); window.scrollTo(0, 0);
    toast(`Tu joues ${ui.guest.name} à la place de ${got.owner || 'son joueur'}`);
  } catch (e) { toast(media.error() || e.message); }
}
function guestEnd() {
  if (ui.guest) { clearTimeout(lendTimer); cloud.putPerso(group.shared.id, lendCopy(ui.guest), ui.guestOwner).catch(() => {}); }
  guestWatch?.(); guestWatch = null;
  ui.guest = null; ui.guestOwner = '';
  render();
}

// ----- Historique des modifications (à la demande : menu ⋮ ou bouton discret) -----
const LOG_CATS = {
  caisse: ['Caisse', '🪙'], comptes: ['Comptes', '🏦'], materiel: ['Matériel', '🎒'], vente: ['Ventes', '🏷️'], notes: ['Notes', '📝'],
  session: ['Sessions', '📖'], pnj: ['PNJ', '👤'], lieu: ['Lieux', '📍'], piste: ['Pistes', '☑️'], persos: ['Personnages prêtés', '🎭'], autre: ['Autre', '•'],
};
const JOURNAL_CATS = ['session', 'pnj', 'lieu', 'piste'];
// Type d'une ligne (les plus anciennes n'en avaient pas : on le devine d'après le texte)
function logCat(e) {
  if (e.cat && e.cat !== 'j' && LOG_CATS[e.cat]) return e.cat;
  const t = e.text ?? e.label ?? '';
  if (/^(Nouveau PNJ|PNJ)/.test(t)) return 'pnj';
  if (/^(Nouveau lieu|Lieu )/.test(t)) return 'lieu';
  if (/^Piste/.test(t)) return 'piste';
  if (e.cat === 'j' || /^(Journal|Session)/.test(t)) return 'session';
  if (/^(Vente|Annulé : Vente)/.test(t)) return 'vente';
  if (/compte|Dépôt|Retrait|Remboursement|Paiement|Emprunt|Prêt|nous rembourse|dette/i.test(t)) return 'comptes';
  if (/^Notes du groupe/.test(t)) return 'notes';
  if (e.amount) return 'caisse';
  return 'materiel';
}
function historyDialog(filter = 'all') {
  let f = filter; let limit = 100;
  const draw = () => {
    const g = G();
    const sorted = [...g.log].sort((a, b) => b.date - a.date); // du plus récent au plus ancien
    const all = sorted.map((e) => ({ e, cat: logCat(e) }));
    const present = new Set(all.map((x) => x.cat));
    const chips = [['all', 'Tout'], ...Object.entries(LOG_CATS).filter(([k]) => present.has(k)).map(([k, [l, i]]) => [k, `${i} ${l}`])];
    if (JOURNAL_CATS.some((k) => present.has(k))) chips.splice(1, 0, ['journal', '📖 Tout le journal']);
    const keep = (x) => f === 'all' || x.cat === f || (f === 'journal' && JOURNAL_CATS.includes(x.cat));
    const list = all.filter(keep);
    const lastUndo = sorted.find((e) => e.undo && !e.undone);
    const rows = list.slice(0, limit).map(({ e, cat }) => {
      const [label, ico] = LOG_CATS[cat];
      return `<div class="log-row hist-row ${e.undone ? 'undone' : ''} ${e.pending ? 'pending' : ''}">
        <span class="log-date">${fmtWhen(e.date)}</span>
        <span class="hist-tag" title="${label}">${ico}</span>
        <span class="log-txt">${e.pending ? '⏳ ' : ''}${esc(e.text ?? e.label ?? '')}${e.who ? ` <span class="muted">· ${esc(e.who)}</span>` : ''}</span>
        <span class="log-amt ${e.sign === 0 ? 'muted' : e.sign < 0 ? 'bad' : 'good'}">${e.amount ? `${e.sign === 0 ? '' : e.sign < 0 ? '−' : '+'}${fmtMoney(e.amount)}` : ''}</span>
        ${e === lastUndo ? `<button type="button" class="icon-btn small" data-undo="${e.id}" title="Annuler cette modification">${icon('undo')}</button>` : '<span></span>'}
      </div>`;
    }).join('') || '<div class="empty">Aucune modification de ce type.</div>';
    openDialog({
      title: 'Historique des modifications',
      cls: 'history',
      body: `<div class="filters hist-filters">${chips.map(([k, l]) => `<button type="button" class="chip ${f === k ? 'on' : ''}" data-hf="${k}">${l}</button>`).join('')}</div>
        <p class="small muted">${group.shared ? `Groupe « ${esc(group.shared.name)} » : qui a modifié quoi, du plus récent au plus ancien.` : 'Ton groupe personnel, du plus récent au plus ancien.'} Seule la dernière action annulable peut être annulée (↶). Les notes secrètes n’y figurent jamais.</p>
        <div class="hist-list">${rows}</div>
        ${list.length > limit ? '<div class="add-row center-row"><button type="button" class="btn ghost small" data-hmore>Afficher plus</button></div>' : ''}`,
      actions: [closeBtn],
      onOpen: (form) => {
        form.querySelectorAll('[data-hf]').forEach((b) => { b.onclick = () => { f = b.dataset.hf; limit = 100; draw(); }; });
        form.querySelector('[data-hmore]')?.addEventListener('click', () => { limit += 200; draw(); });
        form.querySelector('[data-undo]')?.addEventListener('click', (ev) => { A.gUndo({ dataset: { id: ev.currentTarget.dataset.undo } }); draw(); });
      },
    });
  };
  draw();
}

// ---------- Journal : une page par session (rubriques, pistes, PNJ, croquis au stylet) ----------
// Deux sources, même code : le journal personnel (dans la fiche) ou celui du groupe partagé (tout le monde
// le lit et le complète). Toute modification est une opération (journal-ops.js) : appliquée à la fiche,
// ou envoyée au groupe comme la caisse (avec son auteur, en attente hors ligne).
// Images et croquis : media.js (sur l'appareil, ou groups/{code}/media pour le groupe).
const todayISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const fmtDay = (iso) => { const d = iso ? new Date(`${iso}T12:00`) : null; return d && !isNaN(d) ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''; };
const jShared = () => !!group.shared;
// « ✎ Jorunda · 25 nov., 14:02 » : dernier auteur d'un champ (journal partagé)
const jEd = (o, f) => (group.shared && o?.ed?.[f] ? `<small class="j-ed" title="Dernière modification">✎ ${esc(o.ed[f].by)} · ${fmtWhen(o.ed[f].at)}</small>` : '');
const J = () => (jShared() ? group.state : C());
function jApply(op, rerender = true) {
  try {
    if (jShared()) { group.apply({ ...op, by: author(), at: Date.now() }, author()); if (rerender) render(); } else { applyJournalOp(C(), op); commit(rerender); }
    return true;
  } catch (e) { toast(e.message); return false; }
}
// Champ de texte du journal : enregistré après une pause de frappe, et à la sortie du champ
const jField = (sid, field, val, attrs = '', area = false) => (area
  ? `<textarea data-jf="${sid}|${field}" ${attrs}>${esc(val || '')}</textarea>`
  : `<input data-jf="${sid}|${field}" value="${esc(val || '')}" ${attrs}>`);
const jTimers = new Map();
function jSave(el, now) {
  clearTimeout(jTimers.get(el)); jTimers.delete(el);
  const save = () => {
    const value = jGuard(el); if (value === null) return;
    if (el.dataset.jf) { const [sid, field] = el.dataset.jf.split('|'); jApply({ t: 'j:set', sid, field, value }, now && ['title', 'date'].includes(field)); }
    if (el.dataset.jt) { const [sid, tid] = el.dataset.jt.split('|'); jApply({ t: 'j:todoSet', sid, tid, v: { t: value } }, false); }
  };
  if (now) save(); else jTimers.set(el, setTimeout(save, 1200));
}

// ---------- Édition partagée (journal du groupe, notes du groupe) ----------
// 1. Mise à jour en direct sans toucher au champ en cours de saisie ; 2. présence « ✎ Léa écrit… » ;
// 3. protection : un texte modifié par un autre pendant que j'écrivais n'est pas écrasé (les deux versions sont gardées).
const jKey = (el) => (el?.dataset?.jf ? `jf:${el.dataset.jf}` : el?.dataset?.jt ? `jt:${el.dataset.jt}` : '');
function jRemote(el) {
  const s = group.state; if (!s?.journal) return null;
  if (el.dataset.jf) { const [sid, f] = el.dataset.jf.split('|'); const x = s.journal.find((y) => y.id === sid); return x ? (x[f] ?? '') : null; }
  if (el.dataset.jt) { const [sid, tid] = el.dataset.jt.split('|'); const t = s.journal.find((y) => y.id === sid)?.todos?.find((y) => y.id === tid); return t ? (t.t ?? '') : null; }
  return null;
}
function jRemoteBy(el) {
  if (!el.dataset.jf) return '';
  const [sid, f] = el.dataset.jf.split('|');
  return group.state?.journal?.find((y) => y.id === sid)?.ed?.[f]?.by || '';
}
// Deux versions d'un texte : la sienne d'abord, puis la mienne
function mergeText(theirs, mine, line = false) {
  const t = (theirs || '').trim(); const m = (mine || '').trim();
  if (!t || t === m || m.includes(t)) return mine;
  if (!m || t.includes(m)) return theirs;
  return line ? `${t} / ${m}` : `${t}\n\n— Version de ${author()} :\n${m}`;
}
// Fiche (PNJ, lieu) enregistrée : seuls les champs que j'ai changés partent ; un champ changé aussi par un autre garde les deux versions
function protectEdit(orig, now, v, edKey) {
  const same = (a, b) => JSON.stringify(a ?? '') === JSON.stringify(b ?? '');
  const out = {}; let clash = false;
  for (const k of Object.keys(v)) {
    if (same(v[k], orig[k])) continue; // je n'y ai pas touché : on garde la version actuelle (peut-être celle d'un autre)
    let val = v[k];
    if (jShared() && now && !same(now[k], orig[k]) && !same(now[k], val)) {
      clash = true;
      if (typeof val === 'string' && typeof now[k] === 'string' && !['attitude', 'kind', 'photo', 'portrait'].includes(k)) val = mergeText(now[k], val, k !== 'notes');
    }
    out[k] = val;
  }
  if (clash) toast(`${now?.ed?.[edKey]?.by || 'Un autre membre'} a modifié cette fiche pendant que tu écrivais : les deux versions sont gardées`);
  return out;
}
const jBase = new Map(); // champ → valeur du groupe au début de ma saisie (ou à mon dernier envoi)
// Valeur à envoyer (null : rien à envoyer) ; fusionne si quelqu'un a changé le champ pendant que j'écrivais
function jGuard(el) {
  if (!jShared()) return el.value;
  const k = jKey(el); const base = jBase.get(k); const remote = jRemote(el);
  if (remote === null) return el.value;
  if (base !== undefined && el.value === base) return null; // rien changé depuis mon dernier envoi
  let value = el.value;
  if (base !== undefined && remote !== base && remote !== value) {
    const date = el.dataset.jf?.endsWith('|date');
    value = date ? value : mergeText(remote, value, el.tagName === 'INPUT');
    const by = jRemoteBy(el) || 'Un autre membre';
    toast(date ? `${by} avait aussi changé la date : la tienne est gardée` : `${by} a modifié ce champ pendant que tu écrivais : les deux versions sont gardées`);
    if (el.isConnected && value !== el.value) { el.value = value; if (document.activeElement === el) el.setSelectionRange?.(value.length, value.length); }
  }
  jBase.set(k, value);
  return value;
}
// Le groupe a changé pendant que j'écris : on met à jour les autres champs du journal, pas le mien
let renderLater = false;
function liveJournalUpdate() {
  const act = document.activeElement;
  $app.querySelectorAll('[data-jf], [data-jt]').forEach((el) => {
    if (el === act) return;
    const v = jRemote(el);
    if (v !== null && el.value !== v && !jTimers.has(el)) el.value = v;
  });
  renderLater = true; // nouveaux éléments (pistes, PNJ…) : redessinés quand je quitte le champ
}
let pointerDown = false;
document.addEventListener('pointerdown', () => { pointerDown = true; }, true);
document.addEventListener('pointerup', () => { pointerDown = false; }, true);
document.addEventListener('pointercancel', () => { pointerDown = false; }, true);
function renderWhenIdle() {
  setTimeout(() => {
    if (!renderLater) return;
    const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if (typing || dlg.open || document.querySelector('.sketch.full')) return;
    if (pointerDown) { renderWhenIdle(); return; } // un clic est en cours : ne pas remplacer le bouton sous le doigt
    renderLater = false; render();
  }, 300);
}
// Présence : qui écrit où
let presList = []; let presStop = null; let presGid = null; let presMine = null;
function presWatch() {
  const g = group.shared?.id || null;
  if (g === presGid || (g && !cloud.user())) return;
  presStop?.(); presStop = null; presGid = g; presList = [];
  if (g) presStop = cloud.watchPresence(g, (l) => { presList = l; presShow(); }, () => {});
}
function presSet(key, force = false) {
  const g = group.shared?.id; if (!g || !key || !cloud.user()) return;
  if (!force && presMine?.key === key && Date.now() - presMine.at < 8000) return;
  presMine = { key, at: Date.now(), g };
  cloud.setPresence(g, key, author()).catch(() => {});
}
function presClear() {
  if (!presMine) return;
  const { g } = presMine; presMine = null;
  cloud.clearPresence(g).catch(() => {});
}
setInterval(() => { if (presMine) presSet(presMine.key, true); presShow(); }, 10000);
window.addEventListener('pagehide', presClear);
function presShow() {
  document.querySelectorAll('.pres-badge').forEach((b) => b.remove());
  const now = Date.now(); const me = cloud.uid();
  for (const p of presList) {
    if (!p.field || p.uid === me || now - (p.at || 0) > 15000) continue;
    const i = p.field.indexOf(':'); const kind = p.field.slice(0, i); const id = p.field.slice(i + 1);
    const sel = kind === 'jf' ? `[data-jf="${CSS.escape(id)}"]` : kind === 'jt' ? `[data-jt="${CSS.escape(id)}"]` : null;
    const make = () => { const b = document.createElement('span'); b.className = 'pres-badge'; b.textContent = `✎ ${p.name || 'Quelqu’un'} écrit…`; return b; };
    if (sel) document.querySelectorAll(sel).forEach((el) => el.before(make()));
    document.querySelectorAll(`[data-pres="${CSS.escape(p.field)}"]`).forEach((el) => el.append(make()));
  }
}
dlg.addEventListener('close', presClear);

const sessionText = (s, j) => [s.title, s.summary, s.npcs, s.places, s.loot, C()?.secret?.s?.[s.id], ...(s.todos || []).map((t) => t.t), ...(s.npcIds || []).map((id) => npcOf(j, id)?.name), ...(s.placeIds || []).map((id) => placeOf(j, id)?.name)].join(' ');
const J_FIELDS = [['places', 'Lieux', 'Villages, ruines, chemins…', 3], ['loot', 'Butin et récompenses', 'Pièces, objets trouvés, promesses…', 3]];
// PNJ : registre du journal (j.npcs), relié aux sessions (session.npcIds)
const NPC_ATT = { ami: ['Allié', 'good'], neutre: ['Neutre', ''], hostile: ['Hostile', 'bad'], inconnu: ['Inconnu', 'muted'] };
const npcOf = (j, id) => j.npcs.find((n) => n.id === id);
const npcSessions = (j, id) => j.journal.filter((s) => (s.npcIds || []).includes(id)).sort((a, b) => a.n - b.n);
// Image d'un PNJ : rangée à part (media) ; les toutes premières vignettes restaient dans la fiche (portrait)
const npcImg = (n) => (n.photo && media.get(n.photo)?.image) || n.portrait || '';
const npcFace = (n, cls = '') => (npcImg(n) ? `<span class="npc-face ${cls}" style="background-image:url('${npcImg(n)}')"></span>`
  : `<span class="npc-face ${cls} initial">${esc((n.name || '?').trim().charAt(0).toUpperCase())}</span>`);
function npcCards(j) {
  if (!j.npcs.length) return '<div class="empty">Aucun PNJ pour l’instant. Crée-les ici ou depuis une session (« PNJ rencontrés »).</div>';
  return `<div class="npc-grid">${[...j.npcs].sort((a, b) => a.name.localeCompare(b.name, 'fr')).map((n) => {
    const [att, cls] = NPC_ATT[n.attitude] || NPC_ATT.inconnu;
    const seen = npcSessions(j, n.id);
    return `<article class="npc-card" data-pres="npc:${n.id}" data-search="${esc(R.norm([n.name, n.role, n.place, n.notes].join(' ')))}">
      <button class="npc-main" data-act="npcOpen" data-id="${n.id}">
        ${npcFace(n)}
        <span class="npc-txt"><b>${esc(n.name)}</b><small>${esc(n.role || '')}</small></span>
        <span class="tag npc-att ${cls}">${att}</span>
      </button>
      ${n.place ? `<p class="small npc-place">📍 ${esc(n.place)}</p>` : ''}
      ${n.notes ? `<p class="small npc-notes">${esc(n.notes)}</p>` : ''}
      ${group.shared && C().secret?.n?.[n.id] ? `<p class="small npc-notes npc-secret">🔒 ${esc(C().secret.n[n.id])}</p>` : ''}
      ${mjNoteLine('n', n.id)}
      ${mjSecretBlock('n', n.id)}
      ${jEd(n, 'fiche')}
      ${seen.length ? `<div class="npc-seen"><small class="muted">Rencontré :</small>${seen.map((s) => `<button class="chip" data-act="jGoSession" data-id="${s.id}" title="${esc(s.title || '')}">S${s.n}</button>`).join('')}</div>` : ''}
    </article>`;
  }).join('')}</div>`;
}
// Fiche d'un PNJ (création si npc est null ; linkTo : identifiant de la session à laquelle le relier)
function npcDialog(npc, linkTo = null) {
  const j = J(); const isNew = !npc;
  const cur = npc ? { ...npc } : { name: '', role: '', place: '', attitude: 'inconnu', notes: '', portrait: '' };
  const img = npc ? npcImg(npc) : '';
  const seen = npc ? npcSessions(j, npc.id) : [];
  if (npc && jShared()) setTimeout(() => { presSet(`npc:${npc.id}`, true); presShow(); });
  openDialog({
    title: isNew ? 'Nouveau PNJ' : cur.name,
    cls: 'npc-dlg',
    body: `${npc ? `<p class="pres-slot" data-pres="npc:${npc.id}"></p>` : ''}<div class="npc-dlg-top">
        <div class="npc-photo-col">
          <button type="button" class="npc-photo" data-npc-photo title="${img ? 'Voir en grand' : 'Ajouter une image'}">${img ? `<img src="${img}" alt="">` : `<span>${icon('plus')}<small>Image</small></span>`}</button>
          <div class="npc-photo-btns">
            ${canCamera() ? `<button type="button" class="btn small ghost" data-npc-pick="cam" title="Prendre une photo">${icon('camera')}</button>` : ''}
            <button type="button" class="btn small ghost" data-npc-pick="file" title="Choisir une image">${icon('plus')}</button>
          </div>
        </div>
        <div class="fields">
          ${F.text('name', 'Nom', cur.name, 'full', 'autofocus placeholder="Ex. Maître Ulwar"')}
          ${F.text('role', 'Rôle, métier', cur.role, 'full', 'placeholder="Ex. Charpentier, chef du village…"')}
        </div>
      </div>
      <div class="fields">
        ${F.select('attitude', 'Attitude envers le groupe', cur.attitude, Object.entries(NPC_ATT).map(([k, [l]]) => [k, l]))}
        ${F.text('place', 'Où le trouver', cur.place, '', 'placeholder="Ex. Atelier près du port"')}
        ${F.area('notes', group.shared ? 'Notes (partagées avec le groupe)' : 'Notes', cur.notes)}
        ${group.shared && !C().stub ? `<div class="field full j-secret"><label>🔒 Mes notes secrètes <small>visibles par toi${group.shared?.mj ? " et le MJ" : " seul"}</small></label><textarea name="secret" rows="2">${esc(C().secret.n[npc?.id] || '')}</textarea></div>` : ''}
      </div>
      ${isMJ() ? `<div class="field full j-secret mj-own"><label>👑 Notes du MJ <small>visibles par toi seul</small></label><textarea name="mjnote" rows="3">${esc(npc ? store.mjNote(group.shared.id, 'n', npc.id) : '')}</textarea></div>` : ''}
      ${npc ? mjSecretBlock('n', npc.id) : ''}
      ${seen.length ? `<p class="small muted">Rencontré : ${seen.map((s) => `Session ${s.n}${s.title ? ` (${esc(s.title)})` : ''}`).join(', ')}</p>` : ''}
      ${img ? '<label class="check"><input type="checkbox" name="noPhoto"><span>Retirer l’image</span></label>' : ''}
      <div class="npc-zoom" hidden><img alt=""><small>Touche pour fermer</small></div>`,
    actions: [
      ...(!isNew ? [{ label: icon('trash'), cls: 'ghost', onClick: () => {
        setTimeout(() => confirmDialog('Supprimer le PNJ', `Supprimer la fiche de ${esc(npc.name)} ? Il sera retiré des sessions où il apparaît.`, 'Supprimer', () => {
          if (npc.photo) media.remove(npc.photo);
          jApply({ t: 'j:npcDel', nid: npc.id });
        }));
      } }, 'spacer'] : []),
      cancel,
      { label: 'Enregistrer', primary: true, onClick: (f) => {
        const name = f.name.value.trim();
        if (!name) { toast('Donne un nom au PNJ'); return false; }
        const v = { name, role: f.role.value.trim(), place: f.place.value.trim(), attitude: f.attitude.value, notes: f.notes.value.trim() };
        if (f.noPhoto?.checked) {
          if (cur.photo) media.remove(cur.photo);
          Object.assign(v, { photo: null, portrait: '' });
        } else if (f.dataset.photo) {
          // Nouvelle image : rangée à part, le journal ne garde que son identifiant
          const id = cur.photo || R.uid();
          media.put({ id, image: f.dataset.photo }, C().id).catch(() => toast(media.error() || 'Image non envoyée'));
          Object.assign(v, { photo: id, portrait: '' });
        }
        const nid = npc?.id || R.uid();
        if (f.mjnote) store.setMjNote(group.shared.id, 'n', nid, f.mjnote.value.trim());
        // Note secrète : gardée dans ta fiche, jamais envoyée au groupe
        if (f.secret) { const c = C(); const t = f.secret.value.trim(); if (t) c.secret.n[nid] = t; else delete c.secret.n[nid]; c.updatedAt = Date.now(); store.save(); }
        if (isNew) jApply({ t: 'j:npcAdd', npc: { id: nid, ...v }, sid: linkTo });
        else { const p = protectEdit(cur, npcOf(J(), nid), v, 'fiche'); if (Object.keys(p).length) jApply({ t: 'j:npcSet', nid, v: p }); }
      } },
    ],
    onOpen: (f) => {
      const pick = (camera) => chooseImage(camera, async (file) => {
        try {
          f.dataset.photo = await readPortrait(file, 720, 900, 140000); // assez grande pour voir l'illustration du MJ
          f.querySelector('[data-npc-photo]').innerHTML = `<img src="${f.dataset.photo}" alt="">`;
        } catch (e) { toast(e.message || 'Image illisible'); }
      });
      f.querySelectorAll('[data-npc-pick]').forEach((b) => { b.onclick = () => pick(b.dataset.npcPick === 'cam'); });
      // Toucher l'image : la voir en grand (ou en choisir une s'il n'y en a pas)
      const zoom = f.querySelector('.npc-zoom');
      f.querySelector('[data-npc-photo]').onclick = () => {
        const src = f.dataset.photo || img;
        if (!src) { pick(canCamera()); return; }
        zoom.querySelector('img').src = src; zoom.hidden = false;
      };
      zoom.onclick = () => { zoom.hidden = true; };
    },
  });
}

// Lieux importants : registre du journal (j.lieux), reliés aux sessions (session.placeIds) et aux PNJ (lieu.npcIds)
const PLACE_KINDS = { ville: ['Ville', '🏰'], village: ['Village', '🏘️'], auberge: ['Auberge', '🍺'], donjon: ['Donjon, ruine', '🗝️'], nature: ['Nature', '🌲'], autre: ['Autre', '📍'] };
const placeOf = (j, id) => j.lieux.find((l) => l.id === id);
const placeSessions = (j, id) => j.journal.filter((s) => (s.placeIds || []).includes(id)).sort((a, b) => a.n - b.n);
const placeImg = (l) => (l.photo && media.get(l.photo)?.image) || '';
function placeCards(j) {
  if (!j.lieux.length) return '<div class="empty">Aucun lieu pour l’instant. Crée-les ici ou depuis une session (« Lieux visités »).</div>';
  const sec = group.shared ? (C().secret?.l || {}) : {};
  return `<div class="npc-grid">${[...j.lieux].sort((a, b) => a.name.localeCompare(b.name, 'fr')).map((l) => {
    const [kind, ico] = PLACE_KINDS[l.kind] || PLACE_KINDS.autre;
    const seen = placeSessions(j, l.id);
    const img = placeImg(l);
    const npcs = (l.npcIds || []).map((id) => npcOf(j, id)).filter(Boolean);
    return `<article class="npc-card place-card" data-pres="lieu:${l.id}" data-search="${esc(R.norm([l.name, kind, l.where, l.notes, ...npcs.map((n) => n.name)].join(' ')))}">
      <button class="place-main" data-act="placeOpen" data-id="${l.id}">
        ${img ? `<span class="place-img" style="background-image:url('${img}')"></span>` : ''}
        <span class="npc-txt"><b>${ico} ${esc(l.name)}</b><small>${esc(kind)}${l.where ? ` · ${esc(l.where)}` : ''}</small></span>
      </button>
      ${l.notes ? `<p class="small npc-notes">${esc(l.notes)}</p>` : ''}
      ${sec[l.id] ? `<p class="small npc-notes npc-secret">🔒 ${esc(sec[l.id])}</p>` : ''}
      ${mjNoteLine('l', l.id)}
      ${mjSecretBlock('l', l.id)}
      ${jEd(l, 'fiche')}
      ${npcs.length ? `<div class="npc-seen"><small class="muted">PNJ sur place :</small>${npcs.map((n) => `<button class="chip" data-act="npcOpen" data-id="${n.id}">${esc(n.name)}</button>`).join('')}</div>` : ''}
      ${seen.length ? `<div class="npc-seen"><small class="muted">Visité :</small>${seen.map((s) => `<button class="chip" data-act="jGoSession" data-id="${s.id}" title="${esc(s.title || '')}">S${s.n}</button>`).join('')}</div>` : ''}
    </article>`;
  }).join('')}</div>`;
}
// Fiche d'un lieu (création si lieu est null ; linkTo : session à laquelle le relier)
function placeDialog(lieu, linkTo = null) {
  const j = J(); const isNew = !lieu;
  const cur = lieu ? { ...lieu } : { name: '', kind: 'village', where: '', notes: '', npcIds: [] };
  const img = lieu ? placeImg(lieu) : '';
  const seen = lieu ? placeSessions(j, lieu.id) : [];
  if (lieu && jShared()) setTimeout(() => { presSet(`lieu:${lieu.id}`, true); presShow(); });
  openDialog({
    title: isNew ? 'Nouveau lieu' : cur.name,
    cls: 'npc-dlg',
    body: `${lieu ? `<p class="pres-slot" data-pres="lieu:${lieu.id}"></p>` : ''}<div class="npc-dlg-top">
        <div class="npc-photo-col">
          <button type="button" class="npc-photo place-photo" data-npc-photo title="${img ? 'Voir en grand' : 'Ajouter une image (plan, illustration…)'}">${img ? `<img src="${img}" alt="">` : `<span>${icon('plus')}<small>Image</small></span>`}</button>
          <div class="npc-photo-btns">
            ${canCamera() ? `<button type="button" class="btn small ghost" data-npc-pick="cam" title="Prendre une photo">${icon('camera')}</button>` : ''}
            <button type="button" class="btn small ghost" data-npc-pick="file" title="Choisir une image">${icon('plus')}</button>
          </div>
        </div>
        <div class="fields">
          ${F.text('name', 'Nom', cur.name, 'full', 'autofocus placeholder="Ex. Le Gué-aux-Saules"')}
          ${F.select('kind', 'Type', cur.kind, Object.entries(PLACE_KINDS).map(([k, [l, i]]) => [k, `${i} ${l}`]), 'full')}
        </div>
      </div>
      <div class="fields">
        ${F.text('where', 'Où, comment y aller', cur.where, 'full', 'placeholder="Ex. Deux jours au nord, après le pont"')}
        ${F.area('notes', group.shared ? 'Notes (partagées avec le groupe)' : 'Notes', cur.notes)}
        ${group.shared && !C().stub ? `<div class="field full j-secret"><label>🔒 Mes notes secrètes <small>visibles par toi${group.shared?.mj ? " et le MJ" : " seul"}</small></label><textarea name="secret" rows="2">${esc(C().secret.l[lieu?.id] || '')}</textarea></div>` : ''}
      </div>
      ${j.npcs.length ? `<p class="small"><b>PNJ sur place</b></p><div class="place-npcs">${j.npcs.map((n) => `<label class="check"><input type="checkbox" name="npc_${n.id}" ${(cur.npcIds || []).includes(n.id) ? 'checked' : ''}><span>${esc(n.name)}</span></label>`).join('')}</div>` : ''}
      ${isMJ() ? `<div class="field full j-secret mj-own"><label>👑 Notes du MJ <small>visibles par toi seul</small></label><textarea name="mjnote" rows="3">${esc(lieu ? store.mjNote(group.shared.id, 'l', lieu.id) : '')}</textarea></div>` : ''}
      ${lieu ? mjSecretBlock('l', lieu.id) : ''}
      ${seen.length ? `<p class="small muted">Visité : ${seen.map((s) => `Session ${s.n}${s.title ? ` (${esc(s.title)})` : ''}`).join(', ')}</p>` : ''}
      ${img ? '<label class="check"><input type="checkbox" name="noPhoto"><span>Retirer l’image</span></label>' : ''}
      <div class="npc-zoom" hidden><img alt=""><small>Touche pour fermer</small></div>`,
    actions: [
      ...(!isNew ? [{ label: icon('trash'), cls: 'ghost', onClick: () => {
        setTimeout(() => confirmDialog('Supprimer le lieu', `Supprimer la fiche de ${esc(lieu.name)} ? Il sera retiré des sessions où il apparaît.`, 'Supprimer', () => {
          if (lieu.photo) media.remove(lieu.photo);
          jApply({ t: 'j:placeDel', pid: lieu.id });
        }));
      } }, 'spacer'] : []),
      cancel,
      { label: 'Enregistrer', primary: true, onClick: (f) => {
        const name = f.name.value.trim();
        if (!name) { toast('Donne un nom au lieu'); return false; }
        const v = { name, kind: f.kind.value, where: f.where.value.trim(), notes: f.notes.value.trim(), npcIds: j.npcs.filter((n) => f[`npc_${n.id}`]?.checked).map((n) => n.id) };
        if (f.noPhoto?.checked) {
          if (cur.photo) media.remove(cur.photo);
          v.photo = null;
        } else if (f.dataset.photo) {
          const id = cur.photo || R.uid();
          media.put({ id, image: f.dataset.photo }, C().id).catch(() => toast(media.error() || 'Image non envoyée'));
          v.photo = id;
        }
        const pid = lieu?.id || R.uid();
        if (f.mjnote) store.setMjNote(group.shared.id, 'l', pid, f.mjnote.value.trim());
        if (f.secret) { const c = C(); const t = f.secret.value.trim(); if (t) c.secret.l[pid] = t; else delete c.secret.l[pid]; c.updatedAt = Date.now(); store.save(); }
        if (isNew) jApply({ t: 'j:placeAdd', place: { id: pid, ...v }, sid: linkTo });
        else { const p = protectEdit(cur, placeOf(J(), pid), v, 'fiche'); if (Object.keys(p).length) jApply({ t: 'j:placeSet', pid, v: p }); }
      } },
    ],
    onOpen: (f) => {
      const pick = (camera) => chooseImage(camera, async (file) => {
        try {
          f.dataset.photo = await readPortrait(file, 1000, 1000, 180000); // un plan doit rester lisible
          f.querySelector('[data-npc-photo]').innerHTML = `<img src="${f.dataset.photo}" alt="">`;
        } catch (e) { toast(e.message || 'Image illisible'); }
      });
      f.querySelectorAll('[data-npc-pick]').forEach((b) => { b.onclick = () => pick(b.dataset.npcPick === 'cam'); });
      const zoom = f.querySelector('.npc-zoom');
      f.querySelector('[data-npc-photo]').onclick = () => {
        const src = f.dataset.photo || img;
        if (!src) { pick(canCamera()); return; }
        zoom.querySelector('img').src = src; zoom.hidden = false;
      };
      zoom.onclick = () => { zoom.hidden = true; };
    },
  });
}

let sketchCtl = null; // zone de dessin affichée
let sketchWatch = null; // suivi en direct du croquis (groupe)

function viewJournal(c) {
  const j = J(); const list = j.journal; const sh = group.shared;
  // Journal partagé : bandeau, erreurs d'images, et proposition de verser son journal personnel
  const mine = sh ? { s: c.journal.filter((s) => !list.some((x) => x.id === s.id)).length, n: c.npcs.filter((n) => !j.npcs.some((x) => x.id === n.id)).length + c.lieux.filter((l) => !j.lieux.some((x) => x.id === l.id)).length } : null;
  const shareInfo = sh ? `<p class="small j-shared">${icon('users')} Journal partagé avec le groupe « ${esc(sh.name)} » : tout le monde le voit et le complète.</p>
      ${media.error() ? `<p class="small bad">${esc(media.error())}</p>` : ''}
      ${(mine.s || mine.n) && !(c.jImportHide || []).includes(sh.id) ? `<p class="small j-import">${icon('upload')}<a href="#" data-act="jImport">Verser mon journal perso</a> <span class="muted">(${mine.s} session${mine.s > 1 ? 's' : ''}, ${mine.n} fiche${mine.n > 1 ? 's' : ''})</span><button class="j-import-x" data-act="jImportHide" title="Ne plus proposer pour ce groupe (reste possible depuis le menu ⋮)">✕ Ne plus proposer</button></p>` : ''}` : '';
  if (!list.length) {
    return `<section class="card journal-empty">
      <h2>Journal de campagne</h2>
      ${shareInfo}
      <p>Une page par séance : ce qui s’est passé, les PNJ, les lieux, le butin, les pistes à suivre, et une page de croquis pour dessiner au stylet (plans, cartes, notes griffonnées).</p>
      <button class="btn" data-act="jNew">${icon('plus')} Première session</button>
      <p class="small muted">Sur iPad avec l’Apple Pencil, tu peux aussi écrire à la main directement dans les champs : l’iPad transforme l’écriture en texte. Sur Android, utilise le mode écriture manuscrite du clavier.</p>
    </section>`;
  }
  const cur = list.find((s) => s.id === (ui.jSession ?? localStorage.getItem('dragonbane.jSession'))) || list[0];
  ui.jSession = cur.id; localStorage.setItem('dragonbane.jSession', cur.id); // session ouverte retenue d'un lancement à l'autre
  const open = list.flatMap((s) => (s.todos || []).map((t) => ({ s, t }))).filter((x) => !x.t.done);
  const sessions = list.map((s) => `<button class="j-item ${s === cur ? 'on' : ''}" data-act="jOpen" data-id="${s.id}" data-search="${esc(R.norm(sessionText(s, j)))}">
      <b>Session ${s.n}</b><span>${esc(s.title || 'Sans titre')}</span><small>${fmtDay(s.date)}${s.sketch ? ' · ✎' : ''}</small>
    </button>`).join('');
  const jTabs = `<div class="filters j-tabs"><button class="chip ${ui.jView !== 'npcs' ? 'on' : ''}" data-act="jView" data-v="sessions">Sessions (${list.length})</button><button class="chip ${ui.jView === 'npcs' ? 'on' : ''}" data-act="jView" data-v="npcs">PNJ (${j.npcs.length})</button><button class="chip ${ui.jView === 'lieux' ? 'on' : ''}" data-act="jView" data-v="lieux">Lieux (${j.lieux.length})</button></div>${sh ? `<button class="btn ghost small hist-mini" data-act="history" data-f="journal">${icon('history')} Qui a modifié quoi</button>` : ''}`;
  if (ui.jView === 'lieux') {
    return `<div class="grid journal">
      <section class="card j-list">
        <h2>Journal</h2>${shareInfo}${jTabs}
        <button class="btn block" data-act="placeNew">${icon('plus')} Nouveau lieu</button>
        <input class="lib-search" id="jSearch" type="search" placeholder="Rechercher un lieu…" value="${esc(ui.jSearch || '')}">
        <p class="small muted">Chaque lieu a sa fiche : type, où il se trouve, notes, image (plan, illustration), les PNJ qu’on y trouve et les sessions où vous y êtes passés.</p>
      </section>
      <section class="card j-main-npcs"><h2>Lieux importants</h2>${placeCards(j)}<p class="empty j-none" hidden>Rien ne correspond.</p></section>
    </div>`;
  }
  if (ui.jView === 'npcs') {
    return `<div class="grid journal">
      <section class="card j-list">
        <h2>Journal</h2>${shareInfo}${jTabs}
        <button class="btn block" data-act="npcNew">${icon('plus')} Nouveau PNJ</button>
        <input class="lib-search" id="jSearch" type="search" placeholder="Rechercher un PNJ…" value="${esc(ui.jSearch || '')}">
        <p class="small muted">Chaque PNJ a sa fiche : rôle, attitude, où le trouver, notes, et les sessions où vous l’avez croisé. Relie-les depuis une session (« PNJ rencontrés »).</p>
      </section>
      <section class="card j-main-npcs"><h2>Personnages non joueurs</h2>${npcCards(j)}<p class="empty j-none" hidden>Rien ne correspond.</p></section>
    </div>`;
  }
  const sid = cur.id;
  return `<div class="grid journal">
    <section class="card j-list">
      <h2>Journal</h2>${shareInfo}${jTabs}
      <button class="btn block" data-act="jNew">${icon('plus')} Nouvelle session</button>
      <input class="lib-search" id="jSearch" type="search" placeholder="Rechercher dans le journal…" value="${esc(ui.jSearch || '')}">
      <div class="j-items">${sessions}</div>
      <p class="empty j-none" hidden>Rien ne correspond.</p>
    </section>
    <div class="j-main">
      ${open.length ? `<section class="card j-open">
        <h2>Pistes en cours</h2>
        ${open.map(({ s, t }) => `<label class="j-todo"><input type="checkbox" data-act="jTodo" data-sid="${s.id}" data-tid="${t.id}"><span>${esc(t.t)}</span><small>S${s.n}</small></label>`).join('')}
      </section>` : ''}
      <section class="card j-page">
        <div class="j-head">
          <span class="j-num">Session ${cur.n}</span>
          ${jField(sid, 'title', cur.title, 'class="j-title" placeholder="Titre de la séance"')}
          ${jField(sid, 'date', cur.date, 'class="j-date" type="date"')}
          <button class="icon-btn small" data-act="jDelete" aria-label="Supprimer cette session">${icon('trash')}</button>
        </div>
        <div class="j-fields">
          ${jEd(cur, 'title') || jEd(cur, 'date') ? `<div class="full j-ed-row">${jEd(cur, 'title')}</div>` : ''}
          <div class="field full"><label>Résumé ${jEd(cur, 'summary')}</label>${jField(sid, 'summary', cur.summary, 'rows="6" placeholder="Ce qui s’est passé…"', true)}</div>
          <div class="field j-npcs"><label>PNJ rencontrés</label>
            <div class="npc-chips">${(cur.npcIds || []).map((id) => npcOf(j, id)).filter(Boolean).map((n) => `<span class="npc-chip att-${n.attitude || 'inconnu'}">
                <button data-act="npcOpen" data-id="${n.id}">${npcFace(n, 'mini')}${esc(n.name)}</button><button class="x" data-act="jNpcUnlink" data-id="${n.id}" aria-label="Retirer de la session">×</button></span>`).join('')}</div>
            <form class="quick-add" data-form="jNpc"><input name="n" list="npcNames" autocomplete="off" placeholder="Nom du PNJ (déjà croisé ou nouveau)"><button class="btn small" type="submit">${icon('plus')}</button></form>
            <datalist id="npcNames">${j.npcs.filter((n) => !(cur.npcIds || []).includes(n.id)).map((n) => `<option value="${esc(n.name)}">`).join('')}</datalist>
            ${cur.npcs ? `<label class="small muted">Notes</label>${jField(sid, 'npcs', cur.npcs, 'rows="2"', true)}` : ''}
          </div>
          <div class="field j-npcs j-places"><label>Lieux visités</label>
            <div class="npc-chips">${(cur.placeIds || []).map((id) => placeOf(j, id)).filter(Boolean).map((l) => `<span class="npc-chip">
                <button data-act="placeOpen" data-id="${l.id}">${(PLACE_KINDS[l.kind] || PLACE_KINDS.autre)[1]} ${esc(l.name)}</button><button class="x" data-act="jPlaceUnlink" data-id="${l.id}" aria-label="Retirer de la session">×</button></span>`).join('')}</div>
            <form class="quick-add" data-form="jPlace"><input name="n" list="placeNames" autocomplete="off" placeholder="Nom du lieu (déjà connu ou nouveau)"><button class="btn small" type="submit">${icon('plus')}</button></form>
            <datalist id="placeNames">${j.lieux.filter((l) => !(cur.placeIds || []).includes(l.id)).map((l) => `<option value="${esc(l.name)}">`).join('')}</datalist>
            ${cur.places ? `<label class="small muted">Notes</label>${jField(sid, 'places', cur.places, 'rows="2"', true)}` : ''}
          </div>
          <div class="field"><label>Butin et récompenses ${jEd(cur, 'loot')}</label>${jField(sid, 'loot', cur.loot, 'rows="3" placeholder="Pièces, objets trouvés, promesses…"', true)}</div>
          ${mjSecretBlock('s', sid)}
          ${mjNoteField('s', sid)}
          ${sh && !c.stub ? `<div class="field full j-secret"><label>🔒 Mes notes secrètes <small>visibles par toi${group.shared?.mj ? " et le MJ" : " seul"}</small></label>${bind(`secret.s.${sid}`, c.secret.s[sid] || '', 'area', 'rows="3" placeholder="Ce que tu gardes pour toi : soupçons, plans, secrets de ton personnage…"')}</div>` : ''}
        </div>
        <h3>Pistes et choses à faire</h3>
        ${(cur.todos || []).map((t) => `<div class="j-todo-row ${t.done ? 'done' : ''}">
            <input type="checkbox" data-act="jTodo" data-sid="${sid}" data-tid="${t.id}" ${t.done ? 'checked' : ''}>
            <input data-jt="${sid}|${t.id}" value="${esc(t.t)}">
            <button class="icon-btn small" data-act="jTodoDel" data-tid="${t.id}" aria-label="Supprimer">${icon('trash')}</button>
          </div>`).join('')}
        <form class="quick-add" data-form="jTodo"><input name="t" placeholder="Ajouter une piste (ex. Retourner voir Maître Ulwar)"><button class="btn small" type="submit">${icon('plus')}</button></form>
        <h3>Croquis</h3>
        ${cur.sketch ? `<div class="sketch" data-sketch="${cur.sketch}">
            <div class="sk-tools">
              ${SK.COLORS.map((col, ci) => `<button class="sk-btn sk-col" data-act="skColor" data-c="${ci}" title="${col.name}"><i style="background:${col.css}"></i></button>`).join('')}
              <button class="sk-btn" data-act="skErase" title="Gomme">${icon('eraser')}</button>
              <span class="spacer"></span>
              <button class="sk-btn" data-act="skUndo" title="Annuler mon dernier trait">${icon('undo')}</button>
              <button class="sk-btn" data-act="skClear" title="Tout effacer">${icon('trash')}</button>
              <button class="btn small sk-full-btn" data-act="skFull">${icon('expand')}<span class="lbl-open">Plein écran</span><span class="lbl-close">Fermer</span></button>
            </div>
            <canvas class="sk-canvas"></canvas>
            <p class="sk-loading small muted" hidden>Chargement du croquis…</p>
          </div>
          <p class="small muted hint">Stylet, doigt ou souris. Avec un stylet, la paume posée sur l’écran ne dessine pas ; la pression épaissit le trait.${sh ? ' Les traits des autres joueurs apparaissent en direct.' : ''}</p>`
          : `<button class="btn ghost" data-act="jSketch">${icon('edit')} Ajouter une page de croquis</button>`}
      </section>
    </div>
  </div>`;
}
// Après l'affichage : active la zone de dessin (et son suivi en direct pour le groupe)
function stopSketchWatch() { sketchWatch?.(); sketchWatch = null; }
function afterJournal() {
  stopSketchWatch();
  const wrap = document.querySelector('.sketch[data-sketch]');
  if (!wrap) { sketchCtl = null; return; }
  const id = wrap.dataset.sketch;
  const sk = media.get(id);
  if (!sk) { wrap.querySelector('.sk-loading').hidden = false; sketchCtl = null; return; } // il arrive : on redessinera
  sk.strokes ||= [];
  const prev = sketchCtl;
  sketchCtl = SK.mountSketch(wrap, sk, (ev) => media.strokes(sk, ev), { undoAny: !jShared() });
  if (prev) { sketchCtl.setColor(prev.color); sketchCtl.setErase(prev.erase); }
  syncSketchTools();
  if (jShared()) sketchWatch = media.watch(id, (m) => sketchCtl?.setStrokes(m.strokes));
  if (ui.skOpenFull) { ui.skOpenFull = false; A.skFull(); }
}
function syncSketchTools() {
  document.querySelectorAll('.sk-col').forEach((b) => b.classList.toggle('on', !sketchCtl.erase && +b.dataset.c === sketchCtl.color));
  document.querySelector('[data-act="skErase"]')?.classList.toggle('on', sketchCtl.erase);
}
function filterJournal() {
  const q = R.norm(ui.jSearch || ''); let shown = 0;
  document.querySelectorAll('.j-item, .npc-card').forEach((b) => { const ok = !q || b.dataset.search.includes(q); b.hidden = !ok; if (ok) shown++; });
  const none = document.querySelector('.j-none'); if (none) none.hidden = shown > 0;
}
window.addEventListener('resize', () => { if (sketchCtl && document.querySelector('.sketch')) sketchCtl.resize(); });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.querySelector('.sketch.full') && !dlg.open) A.skFull(); });
// Une image ou un croquis du groupe vient d'arriver : on redessine (sauf pendant la frappe)
media.setOnArrive(() => {
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
  if (ui.tab === 'journal' && C() && !typing && !dlg.open && !document.querySelector('.sketch.full')) render();
});

const VIEWS = { mj: viewMJ, fiche: viewFiche, combat: viewCombat, magie: viewMagie, sac: viewSac, prog: viewProg, carnet: viewCarnet, journal: viewJournal, groupe: viewGroupe, biblio: viewBiblio };

// ================= Lanceur de dés =================
// Jet de D20 sous une valeur : avantages/désavantages, Dragon (1), Démon (20), forcer le jet.
// FOR minimale d'une arme : désavantage en dessous, inutilisable sous la moitié (renvoie null)
function strBanes(c, w) {
  const req = +w.strReq || 0; const str = +c.attrs.FOR || 0;
  if (req && str * 2 < req) { toast(`${w.name} est trop lourde : FOR ${req} requise (tu as ${str})`); return null; }
  return req && str < req ? [`FOR ${str} < ${req} requise`] : [];
}

const hasAbility = (c, name) => c.abilities.some((a) => R.norm(a.name) === R.norm(name));
const isSubtle = (w) => /discr[eè]te/i.test(w.features || '');
const isRanged = (w) => ['arcs', 'arbaletes', 'frondes'].includes(w.skill);
// Un dé de plus sur le premier terme : D8 → 2D8, 2D6 → 3D6
const addDie = (expr) => String(expr || '').replace(/^(\d*)D(\d+)/i, (m, n, f) => `${(+n || 1) + 1}D${f}`);

// Boutons de dégâts d'une arme : dégâts normaux + capacités héroïques qui s'y ajoutent
function damageOptions(c, w, sneak) {
  const base = sneak && isSubtle(w) ? addDie(w.damage) : w.damage;
  const bonus = w.bonus ? R.damageBonus(c.attrs[w.bonus]) : '';
  const expr = (plus) => `${base}${plus ? `+${plus}` : ''}${bonus ? `+${bonus}` : ''}`;
  const opts = [{ label: 'Dégâts', expr: expr() }];
  const add = (name, plus, wp, cond = true, why = '') => { if (cond && hasAbility(c, name)) opts.push({ label: `+ ${name}${why} (+${plus}, ${wp} PVol)`, expr: expr(plus), wp, name }); };
  add('Assassin', 'D8', 3, sneak);
  add('Tueur de dragons', 'D8', 3, true, ' contre un monstre');
  add('Coup puissant', 'D8', 3, w.grip === '2 mains' && !isRanged(w), ' sans t’être déplacé');
  add('Poing de fer', 'D6', 1, w.skill === 'bagarre');
  return opts;
}

// Attaque sournoise : Discrétion (désavantage au contact), puis attaque avec avantage, ni esquive ni parade,
// +1 dé de dégâts avec une arme discrète. Poignarder permet de la faire en plein combat (3 PVol).
function sneakAttack(i) {
  const c = C(); const w = c.weapons[i]; const s = c.skills.find((x) => x.id === w.skill);
  const extra = strBanes(c, w); if (!extra) return;
  const stab = hasAbility(c, 'Poignarder') && isSubtle(w) && !isRanged(w);
  const attack = () => openRoll({
    title: `Attaque sournoise — ${w.name}`, target: s.value, attr: s.attr, skill: s, weapon: w, extra,
    boons: ['attaque sournoise'], dmgOptions: damageOptions(c, w, true),
    note: `La cible ne peut ni esquiver ni parer.${isSubtle(w) ? ' Arme discrète : +1 dé de dégâts.' : ''}`,
  });
  openDialog({
    title: `Attaque sournoise — ${w.name}`,
    body: `<p class="small">Approche-toi sans être vu : jet de <b>Discrétion</b>. Réussi, tu choisis ta carte d’initiative et ton attaque a un <b>avantage</b> ; la cible ne peut <b>ni esquiver ni parer</b>${isSubtle(w) ? ', et ton arme discrète fait <b>+1 dé</b> de dégâts' : ''}. Raté, la cible te repère : tirez l’initiative.</p>
      ${stab ? `<div class="checks one">
        <label class="check"><input type="radio" name="mode" value="sneak" checked><span>Hors combat : jet de Discrétion d’abord</span></label>
        <label class="check"><input type="radio" name="mode" value="stab"><span><b>Poignarder</b> en plein combat (3 PVol, un allié à 2 m de la cible) : pas de jet de Discrétion</span></label>
      </div>` : ''}
      ${F.check('close', 'Je m’approche à 2 m pour frapper au contact (désavantage en Discrétion)', !isRanged(w))}
      <p class="small muted">Pas pendant un combat déjà engagé${stab ? ', sauf avec Poignarder' : ''}. Toujours un seul attaquant contre une seule cible.</p>`,
    actions: [cancel, { label: 'Commencer', primary: true, onClick: (f) => {
      if (f.mode?.value === 'stab') {
        if (c.wp.cur < 3) { toast('Pas assez de points de volonté pour Poignarder'); return false; }
        c.wp.cur -= 3; commit(false); toast('Poignarder : −3 PVol');
        setTimeout(attack);
        return;
      }
      const d = c.skills.find((x) => x.id === 'discretion');
      setTimeout(() => openRoll({
        title: `Discrétion — approche de la cible`, target: d.value, attr: d.attr, skill: d,
        extra: f.close.checked ? ['approche au contact'] : [],
        next: { label: `${icon('sword')} Attaquer`, onClick: attack },
        onResult: (r, st) => { st.msg += r.success ? ' Tu n’es pas repéré : choisis ta carte d’initiative, puis attaque.' : ' <b>Repéré !</b> La cible te remarque : tirez l’initiative.'; },
      }));
    } }],
  });
}

// extra : désavantages en plus · boons : avantages en plus · dmgOptions : boutons de dégâts [{label, expr, wp, name}]
// next : bouton proposé après une réussite ({label, onClick}) pour enchaîner un autre jet
// ----- Dés dessinés selon leur forme (vue de face) : D4 triangle, D6 carré, D8 losange, D10 cerf-volant,
// D12 pentagone, D20 hexagone avec son triangle central. Les autres : rond. -----
const DIE_SHAPES = {
  4: { face: '<polygon points="50,6 96,90 4,90"/>' },
  6: { face: '<rect x="10" y="10" width="80" height="80" rx="12"/>', edge: '<path d="M22 22h56v56H22z"/>' },
  8: { face: '<polygon points="50,4 95,50 50,96 5,50"/>', edge: '<path d="M5 50H95"/>' },
  10: { face: '<polygon points="50,4 95,36 95,54 50,96 5,54 5,36"/>', edge: '<path d="M5 36 50 60 95 36M50 60V96M50 4V22"/>' },
  12: { face: '<polygon points="50,6 94,38 77,91 23,91 6,38"/>', edge: '<polygon points="50,24 74,42 65,72 35,72 26,42"/>' },
  20: { face: '<polygon points="50,4 90,27 90,73 50,96 10,73 10,27"/>',
    edge: '<path d="M50 26 79 70H21z M50 26V4 M50 26 90 27 M50 26 10 27 M79 70 90 27 M79 70 90 73 M79 70 50 96 M21 70 50 96 M21 70 10 73 M21 70 10 27"/>' },
};
const dieSvg = (f, cls = '') => {
  const s = DIE_SHAPES[f] || { face: '<circle cx="50" cy="50" r="44"/>' };
  return `<svg class="die-shape ${cls}" viewBox="0 0 100 100" aria-hidden="true"><g class="face">${s.face}</g>${s.edge ? `<g class="edge">${s.edge}</g>` : ''}</svg>`;
};
// Un dé : sa forme et sa valeur (data-max sert à l'animation : nombres de 1 à f)
const dieEl = (f, v, cls = '', style = '') => `<span class="die d${f} ${cls}" ${style ? `style="${style}"` : ''}>${dieSvg(f)}<b data-max="${f}">${v}</b></span>`;
// Bloc de dégâts : chaque dé tiré, la partie fixe, puis le total
function dmgBox(res, rolling, label = '', big = false) {
  return `<div class="dmg ${big ? 'big' : ''} ${rolling ? 'rolling' : ''}">${label ? `<span>${label}</span>` : ''}
    <div class="dice dmg-dice">${(res.dice || []).map((d) => dieEl(d.f, rolling ? '?' : d.v, `small ${d.neg ? 'neg' : ''}`)).join('')}${res.flat ? `<span class="dmg-flat">${res.flat > 0 ? '+' : '−'}${Math.abs(res.flat)}</span>` : ''}</div>
    <b class="dmg-total" data-max="${Math.max(res.max || 0, res.total, 2)}">${rolling ? '?' : res.total}</b><small>${rolling ? 'Les dés roulent…' : esc(res.detail)}</small></div>`;
}

// ----- Suspense : les dés roulent un instant avant d'afficher le résultat (déjà tiré) -----
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// Fait défiler des nombres au hasard (1 à max) dans les éléments, de plus en plus lentement, puis appelle done.
// S'arrête sans rien faire si la fenêtre a été fermée ou remplacée entre-temps.
function spin(els, max, ms, done) {
  els = [...els];
  const n = els.length;
  if (!n || reducedMotion()) { snd.land(n || 1); done(); return; }
  const start = performance.now();
  const tick = () => {
    if (!els[0].isConnected) return;
    const t = performance.now() - start;
    if (t >= ms) { snd.land(n); done(); return; }
    snd.rattle(n);
    els.forEach((e) => { e.textContent = 1 + Math.floor(Math.random() * (+e.dataset.max || max)); });
    setTimeout(tick, 45 + 190 * (t / ms) ** 2);
  };
  tick();
}
const DICE_MS = 1100;
const DMG_MS = 850;

function openRoll({ title, target, attr = null, skill = null, weapon = null, onResult = null, note = '', noPush = false, once = false, extra = [], boons = [], dmgOptions = null, next = null }) {
  const c = C();
  const reasons = [];
  if (attr && c.conditions[attr]) reasons.push(`${R.ATTR[attr].cond}`);
  if (skill) R.armorBanes(c, skill).forEach((n) => reasons.push(n));
  reasons.push(...extra);
  const boosts = [...(c.music ? ['Musique du barde'] : []), ...boons];
  const dmgOpts = weapon ? (dmgOptions || damageOptions(c, weapon, false)) : [];
  const st = { boons: boosts.length ? 1 : 0, banes: reasons.length ? 1 : 0, res: null, pushed: false, dmg: null, msg: '', rolling: false, dmgRolling: false };

  const draw = () => {
    // Pendant que les dés roulent, on cache le verdict et tout ce qui en dépend
    const r = st.rolling ? null : st.res;
    const rolling = st.rolling ? st.res : null;
    const free = R.ATTRS.filter((a) => !c.conditions[a.key]);
    const canPush = !noPush && r && !r.success && !r.demon && !st.pushed && free.length;
    const verdict = !r ? '' : r.dragon ? '<div class="verdict dragon">Dragon !</div>' : r.demon ? '<div class="verdict demon">Démon !</div>'
      : r.success ? '<div class="verdict ok">Réussite</div>' : '<div class="verdict ko">Échec</div>';
    const lock = (once && st.res) || st.rolling || st.dmgRolling ? 'disabled' : '';
    dlg.innerHTML = `<div class="card roll">
      <h2>${esc(title)}</h2>
      <div class="roll-target">Réussite sur <b>${target}</b> ou moins</div>
      ${note ? `<p class="small muted center">${note}</p>` : ''}
      <div class="bb">
        <div class="bb-col"><span>Avantages</span><div class="step"><button data-r="boon" data-d="-1" ${lock}>−</button><span class="val">${st.boons}</span><button data-r="boon" data-d="1" ${lock}>+</button></div></div>
        <div class="bb-col"><span>Désavantages</span><div class="step"><button data-r="bane" data-d="-1" ${lock}>−</button><span class="val">${st.banes}</span><button data-r="bane" data-d="1" ${lock}>+</button></div></div>
      </div>
      ${boosts.length ? `<p class="small center boon">Avantage : ${esc(boosts.join(', '))}</p>` : ''}
      ${reasons.length ? `<p class="small center bad">Désavantage : ${esc(reasons.join(', '))}</p>` : ''}
      <div class="roll-zone">
        ${rolling ? `<div class="dice rolling ${rolling.net > 0 ? 'boon' : rolling.net < 0 ? 'bane' : ''}">${rolling.dice.map(() => dieEl(20, '?')).join('')}</div><div class="verdict wait">…</div>`
          : r ? `<div class="dice ${r.net > 0 ? 'boon' : r.net < 0 ? 'bane' : ''}">${r.dice.map((v, i) => dieEl(20, v, `${r.dice.length > 1 && v !== r.kept ? 'drop' : ''} ${v === 1 ? 'dragon' : v === 20 ? 'demon' : ''}`, `animation-delay:${i * 80}ms`)).join('')}</div>${verdict}` : (() => {
          // Avant le jet : autant de dés que ceux qui seront lancés, et lequel on gardera
          const net = st.boons - st.banes; const n = 1 + Math.abs(net);
          const kind = net > 0 ? 'boon' : net < 0 ? 'bane' : '';
          return `<div class="dice idle ${kind}">${dieEl(20, '').repeat(n)}</div>
            <p class="small center dice-count ${kind || 'muted'}">${n === 1 ? '1 dé' : `${n} dés : on garde le plus ${net > 0 ? 'petit' : 'grand'}`}</p>`;
        })()}
        ${st.msg && !st.rolling && !st.dmgRolling ? `<p class="small center">${st.msg}</p>` : ''}
        ${st.dmg ? dmgBox(st.dmg, st.dmgRolling, 'Dégâts') : ''}
      </div>
      ${canPush ? `<div class="push"><p class="small"><b>Forcer le jet ?</b> Relance en acceptant un état :</p><div class="conds small">${free.map((a) => `<button class="cond-chip" data-r="push" data-k="${a.key}"><b>${a.cond}</b><small>${a.key}</small></button>`).join('')}</div></div>` : ''}
      <div class="dlg-actions">
        <button class="btn ghost" data-r="close">Fermer</button><span class="spacer"></span>
        ${next && r?.success ? `<button class="btn gold" data-r="next">${next.label}</button>` : ''}
        ${once && st.res ? '' : `<button class="btn ${next && r?.success ? 'ghost' : ''}" data-r="roll" ${st.rolling || st.dmgRolling ? 'disabled' : ''}>${icon('d20')} ${r ? 'Nouveau jet' : 'Lancer'}</button>`}
      </div>
      ${weapon && r?.success ? `<div class="dmg-opts">${dmgOpts.map((o, i) => `<button class="btn gold ${i ? 'small' : ''}" data-r="dmg" data-o="${i}" ${(o.wp && c.wp.cur < o.wp) || st.dmgRolling ? 'disabled' : ''}>${esc(o.label)}</button>`).join('')}</div>` : ''}
    </div>`;
    if (st.rolling) spin(dlg.querySelectorAll('.dice.rolling .die b'), 20, DICE_MS, () => { st.rolling = false; draw(); });
    if (st.dmgRolling) spin(dlg.querySelectorAll('.dmg.rolling [data-max]'), 6, DMG_MS, () => { st.dmgRolling = false; draw(); });
  };
  const roll = () => {
    st.res = R.rollD20(target, st.boons, st.banes);
    st.dmg = null; st.msg = '';
    if (skill && (st.res.dragon || st.res.demon) && !skill.mark) {
      skill.mark = 'jeu';
      st.msg = `✦ ${esc(skill.name)} est cochée pour l’amélioration.`;
      commit(false);
    }
    if (st.res.dragon && weapon) st.msg += ' Coup critique : effet bonus au choix.';
    if (st.res.demon && skill?.kind === 'magie') st.msg += ' Incident magique !';
    onResult?.(st.res, st);
    st.rolling = true;
  };
  dlg.onclick = (e) => {
    const b = e.target.closest('[data-r]');
    if (!b) return;
    const k = b.dataset.r;
    if (k === 'close') { dlg.close(); render(); return; }
    if (st.rolling || st.dmgRolling) return;
    if (k === 'boon' || k === 'bane') {
      // Jet unique déjà compté (jet de mort) : on ne change plus rien
      if (once && st.res) return;
      if (k === 'boon') st.boons = Math.max(0, st.boons + +b.dataset.d);
      else st.banes = Math.max(0, st.banes + +b.dataset.d);
      // Changer avantages ou désavantages oublie le jet précédent : on revient à l'aperçu des dés
      st.res = null; st.dmg = null; st.msg = ''; st.pushed = false;
    }
    if (k === 'roll') { st.pushed = false; roll(); }
    if (k === 'push') {
      c.conditions[b.dataset.k] = true; st.pushed = true;
      commit(false);
      roll();
      st.msg = `Jet forcé : tu es ${R.ATTR[b.dataset.k].cond.toLowerCase()}. ${st.msg}`;
    }
    if (k === 'dmg') {
      const o = dmgOpts[+b.dataset.o];
      if (o.wp) {
        if (c.wp.cur < o.wp) { toast('Pas assez de points de volonté'); return; }
        c.wp.cur -= o.wp; commit(false);
      }
      st.dmg = R.rollExpr(o.expr); st.dmgRolling = true;
      st.msg = o.name ? `${esc(o.name)} : −${o.wp} PVol (il t’en reste ${c.wp.cur}).` : '';
    }
    if (k === 'next') { next.onClick(); return; }
    draw();
  };
  dlg.onclose = () => { dlg.onclose = null; render(); };
  draw();
  if (!dlg.open) dlg.showModal();
}

function freeRoll(expr) {
  const go = (e) => {
    const r = R.rollExpr(e);
    openDialog({ title: e.toUpperCase(), body: `<div class="dmg-wrap">${dmgBox(r, true, '', true)}</div>`,
      actions: [closeBtn, { label: 'Relancer', primary: true, onClick: () => { go(e); return false; } }],
      onOpen: (f) => {
        const wrap = f.querySelector('.dmg-wrap'); const relaunch = f.querySelector('.dlg-actions [type=submit]');
        if (relaunch) relaunch.disabled = true;
        spin(wrap.querySelectorAll('[data-max]'), 6, DMG_MS, () => {
          wrap.innerHTML = dmgBox(r, false, '', true);
          if (relaunch) relaunch.disabled = false;
        });
      } });
  };
  if (expr) return go(expr);
  openDialog({ title: 'Lancer des dés', body: `<div class="fields">${F.text('e', 'Expression', '2D6', 'full', 'autofocus placeholder="ex. 2D6+D4"')}</div>`,
    actions: [cancel, { label: 'Lancer', primary: true, onClick: (f) => { setTimeout(() => go(f.e.value || 'D20')); } }] });
}

// ================= Création de personnage =================
function creationDialog() {
  const rollAttr = () => { const r = [R.d(6), R.d(6), R.d(6), R.d(6)].sort((a, b) => a - b); return r[1] + r[2] + r[3]; };
  const skillChecks = (prof, school) => {
    const sugg = R.professionSkills(prof, school);
    const box = (s) => `<label class="check skill-check ${sugg.includes(s.id) ? 'sugg' : ''}"><input type="checkbox" name="sk" value="${s.id}"><span>${esc(s.name)} <small>${s.attr}</small></span></label>`;
    return `${sugg.length ? `<h3>Compétences de profession <small>(choisis-en 6)</small></h3><div class="checks">${sugg.map((id) => box(R.SKILL[id])).join('')}</div>` : ''}
      <h3>Autres compétences</h3><div class="checks">${R.SKILLS.filter((s) => !sugg.includes(s.id)).map(box).join('')}</div>`;
  };
  openDialog({
    title: 'Nouveau personnage',
    cls: 'wide',
    body: `<div class="fields">
        ${F.text('name', 'Nom', '', 'full', 'autofocus required')}
        ${F.select('kin', 'Peuple', 'humain', R.KINS.map((k) => [k.key, k.name]))}
        ${F.select('age', 'Âge', 'adulte', R.AGES.map((a) => [a.key, a.name]))}
        ${F.select('profession', 'Profession', 'guerrier', R.PROFESSIONS.map((p) => [p.key, p.name]))}
        ${F.select('school', 'École de magie', 'elementalisme', Object.entries(R.SCHOOLS).map(([k, s]) => [k, s.name]), 'school-field')}
      </div>
      <h3>Attributs <button type="button" class="btn small ghost" data-roll-all>${icon('d20')} Tirer 4D6 (3 meilleurs)</button></h3>
      <div class="attr-inputs">${R.ATTRS.map((a) => `<div class="field"><label>${a.key}</label><input type="number" inputmode="numeric" name="a_${a.key}" value="10" min="3" max="18"></div>`).join('')}</div>
      ${F.check('ageMods', 'Appliquer l’effet de l’âge sur les attributs', true)}<span class="small muted age-mods"></span>
      <p class="small muted">PV = CON · PVol = VOL · chaque compétence entraînée vaut le double de sa chance de base.</p>
      <div class="skill-picks"></div>
      <p class="small skill-count"></p>`,
    actions: [cancel, { label: 'Créer', primary: true, onClick: (f) => {
      const name = f.name.value.trim();
      if (!name) { toast('Donne un nom à ton personnage'); return false; }
      const mods = f.ageMods.checked ? R.AGE[f.age.value].mods : {};
      const attrs = Object.fromEntries(R.ATTRS.map((a) => [a.key, clamp(num(f[`a_${a.key}`].value) + (mods[a.key] || 0), 1, 18)]));
      const trained = [...f.querySelectorAll('[name=sk]:checked')].map((x) => x.value);
      const c = R.newCharacter({ name, kin: f.kin.value, profession: f.profession.value, school: f.profession.value === 'mage' ? f.school.value : '', age: f.age.value, attrs, trained });
      logEntry(c, 'Création du personnage');
      // Bouton + d'un groupe dans la bannière : le personnage en fait partie ; sinon il n'est dans aucun groupe
      if (ui.newInGroup) { c.groupId = ui.newInGroup; store.add(c); group.switchTo(c.groupId); } else { store.add(c); group.deactivate(); }
      ui.newInGroup = null; setMjActive(false);
      ui.mode = 'libre'; ui.tab = 'fiche';
      render();
      toast(`${name} est prêt. Complète sa fiche en mode libre.`);
    } }],
    onOpen: (f) => {
      const picks = f.querySelector('.skill-picks');
      const refresh = () => {
        f.querySelector('.school-field').style.display = f.profession.value === 'mage' ? '' : 'none';
        const kept = new Set([...f.querySelectorAll('[name=sk]:checked')].map((x) => x.value));
        if (f.profession.value === 'mage') { R.MAGIC_SKILLS.forEach((id) => kept.delete(id)); kept.add(f.school.value); }
        picks.innerHTML = skillChecks(f.profession.value, f.school.value);
        picks.querySelectorAll('[name=sk]').forEach((x) => { x.checked = kept.has(x.value); });
        count();
      };
      const count = () => {
        const n = f.querySelectorAll('[name=sk]:checked').length;
        const age = R.AGE[f.age.value];
        const mage = f.profession.value === 'mage';
        f.querySelector('.skill-count').innerHTML = `<b>${n}</b> compétence${n > 1 ? 's' : ''} entraînée${n > 1 ? 's' : ''} · conseillé : 6 de la profession + ${age.free} au choix (${age.name.toLowerCase()}) = ${6 + age.free}${mage ? ' (l’école de magie en fait partie)' : ''}`;
        const m = Object.entries(age.mods);
        f.querySelector('.age-mods').textContent = m.length ? ` (${m.map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`).join(', ')})` : ' (aucun pour un adulte)';
      };
      f.profession.onchange = refresh; f.school.onchange = refresh; f.age.onchange = count;
      picks.addEventListener('change', count);
      f.querySelector('[data-roll-all]').onclick = () => R.ATTRS.forEach((a) => { f[`a_${a.key}`].value = rollAttr(); });
      refresh();
    },
  });
}

// ================= Édition =================
// Liste déroulante « Choisir dans la bibliothèque » : groups = [[libellé, [[valeur, texte], …]], …]
function libPicker(groups, label = 'Bibliothèque') {
  return `<div class="field full lib-pick"><label>${label}</label><select name="lib"><option value="">— Choisir dans la liste pour tout remplir —</option>${groups.map(([g, opts]) => `<optgroup label="${esc(g)}">${opts.map(([v, t]) => `<option value="${esc(v)}">${esc(t)}</option>`).join('')}</optgroup>`).join('')}</select></div>`;
}
const rangeTxt = (c, r) => (!r ? '' : r === 'FOR' ? `${c.attrs.FOR} m` : r === 'FOR×2' ? `${c.attrs.FOR * 2} m` : /^\d+$/.test(r) ? `${r} m` : r);

function editWeapon(i) {
  const c = C(); const w = c.weapons[i] || { name: '', skill: 'epees', damage: 'D8', bonus: 'FOR', range: '2', durability: '', grip: '1 main', features: '', strReq: 0, broken: false };
  const weaponSkills = c.skills.filter((s) => s.kind === 'arme' || s.kind === 'autre').map((s) => [s.id, `${s.name} (${s.value})`]);
  const lib = [['Armes de contact', 'contact'], ['Armes à distance', 'distance']].map(([g, k]) => [g, L.WEAPONS.map((x, n) => [n, x]).filter(([, x]) => x.kind === k)
    .map(([n, x]) => [n, `${x.name} — ${x.damage}${x.str ? ` · FOR ${x.str}` : ''} · ${x.cost}`])]);
  openDialog({
    title: i >= 0 ? w.name || 'Arme' : 'Nouvelle arme',
    body: `<div class="fields">
      ${i < 0 ? libPicker(lib) : ''}
      ${F.text('name', 'Nom', w.name, 'full', i < 0 ? '' : 'autofocus')}
      ${F.select('skill', 'Compétence', w.skill, weaponSkills)}
      ${F.text('damage', 'Dégâts', w.damage, '', 'placeholder="2D6"')}
      ${F.select('bonus', 'Bonus aux dégâts', w.bonus, [['FOR', 'FOR'], ['AGI', 'AGI'], ['', 'Aucun']])}
      ${F.num('strReq', 'FOR minimale', w.strReq || '')}
      ${F.select('grip', 'Prise', w.grip, ['1 main', '2 mains', '—', ''])}
      ${F.text('range', 'Portée (m)', w.range, '', 'placeholder="2, 20, FOR…"')}
      ${F.text('durability', 'Solidité', w.durability)}
      ${F.text('features', 'Particularités', w.features, 'full', 'placeholder="Perforante, renversement…"')}
      ${F.check('broken', 'Arme brisée', w.broken, 'full')}
    </div>
    <p class="small muted">FOR inférieure au minimum : désavantage à l’attaque et à la parade ; moins de la moitié : arme inutilisable.</p>`,
    actions: [
      ...(i >= 0 ? [{ label: icon('trash'), cls: 'ghost', onClick: () => { c.weapons.splice(i, 1); commit(); } }, 'spacer'] : []),
      cancel,
      { label: 'Enregistrer', primary: true, onClick: (f) => {
        Object.assign(w, { name: f.name.value.trim() || 'Arme', skill: f.skill.value, damage: f.damage.value.trim(), bonus: f.bonus.value, strReq: num(f.strReq.value), grip: f.grip.value, range: f.range.value.trim(), durability: f.durability.value.trim(), features: f.features.value.trim(), broken: f.broken.checked });
        if (i < 0) c.weapons.push(w);
        commit();
      } },
    ],
    onOpen: (f) => {
      if (!f.lib) return;
      f.lib.onchange = () => {
        const x = L.WEAPONS[f.lib.value];
        if (!x) return;
        f.name.value = x.name; f.skill.value = x.skill; f.damage.value = x.damage; f.bonus.value = x.bonus;
        f.strReq.value = x.str || ''; f.grip.value = x.grip; f.range.value = x.range; f.durability.value = x.dur; f.features.value = x.features;
      };
    },
  });
}

function editSpell(i, list = 'spells') {
  const c = C(); const trick = list === 'tricks';
  const defSchool = c.school || R.MAGIC_SKILLS.find((id) => c.skills.find((s) => s.id === id)?.trained) || 'general';
  const s = c[list][i] || { name: '', school: defSchool, rank: 1, prereq: '', req: '', time: 'Action', range: '', duration: '', desc: '', power: true, prepared: false };
  // Bibliothèque : écoles connues d'abord, sorts déjà appris retirés
  const known = new Set(c[list].map((x) => R.norm(x.name)));
  const mine = new Set(['general', ...c.skills.filter(R.knowsMagic).map((x) => x.id)]);
  const src = trick ? L.TRICKS : L.SPELLS;
  const order = Object.keys(L.SCHOOL_LABEL).sort((a, b) => (mine.has(b) ? 1 : 0) - (mine.has(a) ? 1 : 0));
  const basic = /^(Une école|Animisme|Élémentalisme|Mentalisme)/;
  const lib = order.map((sc) => [`${L.SCHOOL_LABEL[sc]}${mine.has(sc) ? '' : ' (école non apprise)'}`, src.map((x, n) => [n, x]).filter(([, x]) => x.school === sc && !known.has(R.norm(x.name)))
    .map(([n, x]) => [n, trick ? x.name : `${x.name} — rang ${x.rank}${x.prereq && !basic.test(x.prereq) ? ` (après ${x.prereq})` : ''}`])]).filter(([, o]) => o.length);
  openDialog({
    title: i >= 0 ? s.name : trick ? 'Nouveau tour de magie' : 'Nouveau sort',
    body: `<div class="fields">
      ${i < 0 && lib.length ? libPicker(lib) : ''}
      ${F.text('name', 'Nom', s.name, 'full', i < 0 ? '' : 'autofocus')}
      ${F.select('school', 'École', s.school, schoolOpts)}
      ${trick ? '' : `${F.num('rank', 'Rang', s.rank)}
      ${F.text('prereq', 'Prérequis', s.prereq || '')}
      ${F.text('time', 'Temps d’incantation', s.time)}
      ${F.text('range', 'Portée', s.range)}
      ${F.text('duration', 'Durée', s.duration)}
      ${F.text('req', 'Composantes', s.req, '', 'placeholder="Mot, geste, focus…"')}
      ${F.check('power', 'Niveau de puissance variable (1 à 3)', s.power !== false, 'full')}`}
      ${F.area('desc', 'Effet', s.desc)}
    </div>`,
    actions: [
      ...(i >= 0 ? [{ label: icon('trash'), cls: 'ghost', onClick: () => { c[list].splice(i, 1); commit(); } }, 'spacer'] : []),
      cancel,
      { label: 'Enregistrer', primary: true, onClick: (f) => {
        s.name = f.name.value.trim() || (trick ? 'Tour' : 'Sort'); s.school = f.school.value; s.desc = f.desc.value.trim();
        if (!trick) Object.assign(s, { rank: num(f.rank.value) || 1, prereq: f.prereq.value.trim(), time: f.time.value.trim(), range: f.range.value.trim(), duration: f.duration.value.trim(), req: f.req.value.trim(), power: f.power.checked });
        if (i < 0) c[list].push(s);
        commit();
      } },
    ],
    onOpen: (f) => {
      if (!f.lib) return;
      f.lib.onchange = () => {
        const x = src[f.lib.value];
        if (!x) return;
        f.name.value = x.name; f.school.value = x.school; f.desc.value = x.desc;
        if (!trick) { f.rank.value = x.rank; f.prereq.value = x.prereq; f.time.value = x.time; f.range.value = x.range; f.duration.value = x.duration; f.req.value = x.req; f.power.checked = x.power; }
      };
    },
  });
}

// Liste déroulante du matériel transportable (Sac, Groupe)
function gearPicker() {
  return libPicker(L.GEAR_CATS.map((cat) => [cat, L.GEAR.map((x, n) => [n, x]).filter(([, x]) => x.cat === cat && x.item)
    .map(([n, x]) => [n, `${x.name} — ${fmtMoney(x.cu)}${x.w ? ` · enc. ${x.w === 0.25 ? '¼' : x.w}` : ''}`])]).filter(([, o]) => o.length), 'Liste de matériel');
}
// Remplit le formulaire depuis la liste et met à jour le prix d'achat affiché
// label(total) : texte de la case d'achat pour un prix total donné
function wireGearPicker(f, label) {
  let unit = 0;
  const refresh = () => {
    const total = unit * Math.max(1, num(f.qty.value));
    const lbl = f.querySelector('.buy-label');
    if (lbl) lbl.textContent = total ? label(total) : 'Acheter (choisis d’abord un objet de la liste)';
    if (f.buy) { f.buy.disabled = !total; if (!total) f.buy.checked = false; }
  };
  f.lib.onchange = () => {
    const x = L.GEAR[f.lib.value];
    if (!x) { unit = 0; refresh(); return; }
    unit = x.cu;
    f.name.value = x.name; f.weight.value = x.w; f.notes.value = x.desc;
    if (f.worn) f.worn.checked = x.cat === 'Vêtements';
    refresh();
  };
  f.qty.addEventListener('input', refresh);
  refresh();
  return () => unit * Math.max(1, num(f.qty.value));
}
const buyCheck = () => `<label class="check full"><input type="checkbox" name="buy" disabled><span class="buy-label"></span></label>`;

function editItem(i) {
  const c = C(); const it = c.items[i] || { name: '', qty: 1, weight: 1, notes: '', worn: false };
  openDialog({
    title: i >= 0 ? it.name : 'Nouvel objet',
    body: `<div class="fields">
      ${i < 0 ? gearPicker() : ''}
      ${F.text('name', 'Nom', it.name, 'full', i < 0 ? '' : 'autofocus')}
      ${F.num('qty', 'Quantité', it.qty)}
      ${F.num('weight', 'Encombrement (par unité)', it.weight)}
      ${F.area('notes', 'Notes', it.notes)}
      ${F.check('worn', 'Porté sur soi (ne compte pas : armure portée, vêtements…)', it.worn, 'full')}
      ${i < 0 ? buyCheck() : ''}
      ${i >= 0 && G().carriers.length ? F.select('dest', 'Ranger dans le matériel du groupe', '', [['', '— Garder dans mon sac —'], ...G().carriers.map((k) => [k.id, `${carrierEmoji(k)} ${k.name}`])], 'full') : ''}
    </div>`,
    actions: [
      ...(i >= 0 ? [{ label: icon('trash'), cls: 'ghost', onClick: () => { c.items.splice(i, 1); commit(); } }, 'spacer'] : []),
      cancel,
      { label: 'Enregistrer', primary: true, onClick: (f) => {
        const price = f._price ? f._price() : 0;
        if (f.buy?.checked && price) {
          if (!purseTake(c.money, price)) { toast(`Il te manque ${fmtMoney(price - totalCopper(c.money))}`); return false; }
          toast(`Acheté : −${fmtMoney(price)}`);
        }
        Object.assign(it, { name: f.name.value.trim() || 'Objet', qty: Math.max(1, num(f.qty.value)), weight: num(f.weight.value), notes: f.notes.value.trim(), worn: f.worn.checked });
        if (i < 0) c.items.push(it);
        if (f.dest?.value) {
          const k = G().carriers.find((x) => x.id === f.dest.value);
          if (gApply({ t: 'itemAdd', k: k.id, from: c.name, item: { id: R.uid(), name: it.name, qty: it.qty, weight: it.weight, notes: it.notes } }, `${it.name} rangé : ${k.name}`)) c.items.splice(i, 1);
        }
        commit();
      } },
    ],
    onOpen: (f) => { if (f.lib) f._price = wireGearPicker(f, (t) => `Acheter pour ${fmtMoney(t)} avec ma bourse (j’ai ${fmtMoney(totalCopper(c.money))})`); },
  });
}

// Groupe : ajouter du matériel à un transport, payé ou non par la caisse
function groupAddItemDialog(k) {
  const g = G();
  openDialog({
    title: `Charger : ${k.name}`,
    body: `<div class="fields">
      ${gearPicker()}
      ${F.text('name', 'Nom', '', 'full')}
      ${F.num('qty', 'Quantité', 1)}
      ${F.num('weight', 'Encombrement (par unité)', 1)}
      ${F.area('notes', 'Notes', '')}
      ${buyCheck()}
    </div>`,
    actions: [cancel, { label: 'Ajouter', primary: true, onClick: (f) => {
      const name = f.name.value.trim();
      if (!name) { toast('Choisis un objet ou donne un nom'); return false; }
      const it = { id: R.uid(), name, qty: Math.max(1, num(f.qty.value)), weight: num(f.weight.value), notes: f.notes.value.trim() };
      const price = f._price();
      if (f.buy.checked && price) return gApply({ t: 'buy', k: k.id, item: it, price }, `${name} acheté : −${fmtMoney(price)}`) && undefined;
      return gApply({ t: 'itemAdd', k: k.id, item: it }, `${name} chargé sur ${k.name}`) && undefined;
    } }],
    onOpen: (f) => { f._price = wireGearPicker(f, (t) => `Payer ${fmtMoney(t)} avec la caisse (elle contient ${fmtMoney(totalCopper(g.money))})`); },
  });
}

function editAbility(i) {
  const c = C(); const a = c.abilities[i] || { id: R.uid(), name: '', wp: '', desc: '', source: isProg() ? 'Apprise' : '' };
  const owned = new Set(c.abilities.map((x) => R.norm(x.name)));
  openDialog({
    title: i >= 0 ? a.name : 'Capacité héroïque',
    body: `<div class="fields">
      ${F.text('name', 'Nom', a.name, 'full', 'autofocus list="heroicList" placeholder="Choisis dans la liste ou écris un nom"')}
      <datalist id="heroicList">${R.HEROIC.filter((h) => !owned.has(R.norm(h.name)) || ['robuste', 'focalise'].includes(R.norm(h.name))).map((h) => `<option value="${esc(h.name)}">${esc(h.req)}${h.wp ? ` · ${esc(h.wp)} PVol` : ''}</option>`).join('')}</datalist>
      ${F.text('wp', 'Coût en PVol', a.wp, '', 'placeholder="ex. 3"')}
      ${F.text('source', 'Origine', a.source, '', 'placeholder="Peuple, Profession, Apprise…"')}
      ${F.text('req', 'Prérequis', a.req || '', 'full', 'placeholder="ex. Épées 12"')}
      ${F.area('desc', 'Effet', a.desc)}
    </div>
    ${i < 0 ? '<p class="small muted">Robuste et Focalisé augmentent automatiquement les PV ou PVol maximum de 2.</p>' : ''}`,
    actions: [
      ...(i >= 0 ? [{ label: icon('trash'), cls: 'ghost', onClick: () => {
        const pool = R.POOL_ABILITIES[R.norm(a.name)];
        if (pool) { c[pool].bonus = (+c[pool].bonus || 0) - 2; c[pool].cur = Math.min(c[pool].cur, pool === 'hp' ? R.maxHP(c) : R.maxWP(c)); }
        c.abilities.splice(i, 1); commit();
      } }, 'spacer'] : []),
      cancel,
      { label: 'Enregistrer', primary: true, onClick: (f) => {
        Object.assign(a, { name: f.name.value.trim() || 'Capacité', wp: f.wp.value.trim(), source: f.source.value.trim(), req: f.req.value.trim(), desc: f.desc.value.trim() });
        if (i < 0) {
          c.abilities.push(a);
          const pool = R.POOL_ABILITIES[R.norm(a.name)];
          if (pool) { c[pool].bonus = (+c[pool].bonus || 0) + 2; c[pool].cur += 2; }
          logEntry(c, `Nouvelle capacité héroïque : ${a.name}${pool ? ` (+2 ${pool === 'hp' ? 'PV' : 'PVol'} max)` : ''}`, { type: 'ability', id: a.id, pool });
        }
        commit();
      } },
    ],
    onOpen: (f) => {
      // Choix dans la liste : prérequis et coût remplis automatiquement
      f.name.addEventListener('input', () => {
        const h = R.findHeroic(f.name.value);
        if (!h) return;
        if (!f.wp.value) f.wp.value = h.wp;
        if (!f.req.value) f.req.value = h.req;
        if (!f.source.value) f.source.value = 'Apprise';
      });
    },
  });
}

// Effet d'une capacité : celui saisi sur la fiche, sinon le résumé de la bibliothèque
const abilityDesc = (a) => a.desc || R.abilityInfo(a.name)?.desc || '';

function showAbility(i) {
  const c = C(); const a = c.abilities[i];
  const cost = parseInt(a.wp, 10);
  const variable = /variable/i.test(a.wp || '');
  const desc = abilityDesc(a);
  openDialog({
    title: a.name,
    body: `${a.source || a.req ? `<p class="small muted">${[a.source, a.req && `Prérequis : ${a.req}`].filter(Boolean).map(esc).join(' · ')}</p>` : ''}
      <p>${esc(desc) || '<i class="muted">Pas de description. Passe en mode libre pour la compléter.</i>'}</p>
      ${cost ? `<p class="small">Coût : <b>${cost} PVol</b> · tu en as ${c.wp.cur}.</p>` : ''}
      ${variable ? `<div class="fields">${F.num('wpv', `PVol à dépenser (tu en as ${c.wp.cur})`, 1, 'full')}</div>` : ''}`,
    actions: [closeBtn, ...(cost || variable ? [{ label: cost ? `Utiliser (−${cost} PVol)` : 'Utiliser', primary: true, onClick: (f) => useAbility(c, a, cost || num(f.wpv?.value)) }] : [])],
  });
}

// Dépense les PVol d'une capacité ; Berserker et Colérique rendent Furieux
function useAbility(c, a, cost) {
  if (!cost || cost < 0) { toast('Indique le nombre de PVol'); return false; }
  if (c.wp.cur < cost) { toast(`Pas assez de points de volonté (${c.wp.cur}/${cost})`); return false; }
  c.wp.cur -= cost;
  let extra = '';
  if (['berserker', 'colerique'].includes(R.norm(a.name)) && !c.conditions.INT) { c.conditions.INT = true; extra = ' · tu es Furieux'; }
  commit();
  toast(`${a.name} : −${cost} PVol${extra}`);
  return true;
}

function editSkill(s) {
  const c = C();
  const base = R.baseChance(c.attrs[s.attr]);
  openDialog({
    title: s.name,
    body: `<div class="fields">
      ${s.custom ? F.text('name', 'Nom', s.name, 'full') : ''}
      ${F.select('attr', 'Attribut', s.attr, R.ATTRS.map((a) => [a.key, `${a.key} — ${a.name}`]))}
      ${F.num('value', 'Niveau', s.value, '', 'min="0" max="18"')}
      ${F.check('trained', 'Compétence entraînée', s.trained, 'full')}
      ${F.check('mark', 'Cochée pour l’amélioration', !!s.mark, 'full')}
    </div>
    <p class="small muted">${s.kind === 'magie' ? `Pas de chance de base pour une école de magie · entraînée au départ : <b>${base * 2}</b>.` : `Chance de base (${s.attr} ${c.attrs[s.attr]}) : <b>${base}</b> · entraînée : <b>${base * 2}</b>.`} Cocher « entraînée » met le niveau de départ s’il n’avait pas progressé.</p>`,
    actions: [
      ...(s.custom ? [{ label: icon('trash'), cls: 'ghost', onClick: () => { c.skills = c.skills.filter((x) => x !== s); commit(); } }, 'spacer'] : []),
      cancel,
      { label: 'Enregistrer', primary: true, onClick: (f) => {
        let v = clamp(num(f.value.value), 0, 18);
        const av = c.attrs[f.attr.value];
        if (f.trained.checked !== s.trained && v === R.startValue(s.kind, av, s.trained)) v = R.startValue(s.kind, av, f.trained.checked);
        if (s.custom) s.name = f.name.value.trim() || s.name;
        Object.assign(s, { attr: f.attr.value, value: v, trained: f.trained.checked, mark: f.mark.checked ? (s.mark || 'jeu') : false });
        commit();
      } },
    ],
  });
}

// ================= Actions =================
const A = {
  tab(el) { ui.tab = el.dataset.tab; localStorage.setItem('dragonbane.tab', ui.tab); render(); window.scrollTo(0, 0); },
  skillFilter(el) { ui.skillFilter = el.dataset.f; localStorage.setItem('dragonbane.skillFilter', ui.skillFilter); render(); },
  setMode(el) { if ((ui.guest || ui.mjView) && el.dataset.m !== 'normal') { toast('Personnage prêté : mode Jeu uniquement'); return; } ui.mode = el.dataset.m; render(); },
  guestEnd() { guestEnd(); },
  mjOpen(el) {
    const ch = mjChar(el.dataset.u, el.dataset.id); if (!ch) return;
    ui.mjView = R.upgradeCharacter(JSON.parse(JSON.stringify(ch))); ui.mjViewPlayer = group.shared?.members?.[el.dataset.u] || '';
    ui.mjBackTab = 'mj'; ui.tab = 'fiche'; render(); window.scrollTo(0, 0);
  },
  mjClose() { ui.mjView = null; ui.tab = 'mj'; render(); window.scrollTo(0, 0); },
  mjPrivate(el) { mjPrivateDialog(el.dataset.u, el.dataset.id); },
  // Le MJ prête la fiche d'un joueur absent (copie sans ses notes privées ; il la récupère à son retour)
  mjLend(el) {
    const ch = mjChar(el.dataset.u, el.dataset.id); const g = group.shared; if (!ch || !g) return;
    const player = g.members?.[el.dataset.u] || 'son joueur';
    confirmDialog('Prêter au groupe', `Prêter <b>${esc(ch.name)}</b> (joueur : ${esc(player)}) ? Les autres membres pourront le jouer à sa place, en mode Jeu seulement. Ses notes secrètes et son journal perso ne sont pas prêtés ; il récupérera tout ce qui s’est passé à son retour.`, 'Prêter', async () => {
      try {
        await cloud.putPerso(g.id, lendCopy(ch), player);
        group.apply({ t: 'p:lend', perso: { id: ch.id, name: ch.name, owner: player, sub: [R.kinName(ch), R.profName(ch)].filter(Boolean).join(' · ') } }, `MJ (${store.current()?.name || 'MJ'})`);
        toast(`${ch.name} est prêté au groupe`); render();
      } catch (e) { toast(media.error() || e.message); }
    });
  },
  mjUnlend(el) {
    const g = group.shared; if (!g) return;
    const p = (G().persos || []).find((x) => x.id === el.dataset.id);
    confirmDialog('Ne plus prêter', `Arrêter le prêt de <b>${esc(p?.name || 'ce personnage')}</b> ? Ce qui a été joué reste sur sa copie : son joueur le récupérera en ouvrant l’appli.`, 'Arrêter le prêt', () => {
      // La copie est gardée (le joueur doit encore récupérer la partie) ; elle disparaît seulement de la liste
      group.apply({ t: 'p:unlend', id: el.dataset.id }, `MJ (${store.current()?.name || 'MJ'})`);
      toast('Prêt arrêté'); render();
    });
  },
  mjResend() { mjSent.clear(); toast('Envoi de tes fiches au MJ…'); mjSync(true); },
  // Devenir MJ du groupe (ou céder la place)
  // Première page (ou menu) : entrer dans un groupe comme MJ, sans personnage, avec le code MJ
  mjJoin() {
    if (!cloud.user()) { toast('Connecte-toi d’abord : le MJ est reconnu par son compte'); store.sync({ interactive: true }); return; }
    openDialog({
      title: 'Je suis le meneur de jeu',
      body: `<p class="small">Saisis le <b>code MJ</b> que l’administrateur du groupe t’a donné (il l’obtient dans l’onglet Groupe, bouton « Code MJ »). Pas besoin de créer un personnage.</p>
        <div class="fields">${F.text('code', 'Code MJ', '', 'full', 'autofocus autocapitalize="characters" placeholder="Ex. MJ7K2QPX"')}</div>`,
      actions: [cancel, { label: 'Entrer comme MJ', primary: true, onClick: (f) => {
        (async () => {
          try { const name = await group.joinAsMJ(f.code.value); dlg.close(); setMjActive(true); ui.tab = 'mj'; render(); toast(`Tu es le MJ du groupe « ${name} »`); } catch (e) { toast(e.message || 'Code refusé'); }
        })();
        return false;
      } }],
    });
  },
  // Administrateur : obtenir (ou renouveler) le code MJ à donner au meneur de jeu
  mjCode() {
    const sh = group.shared; if (!sh || !isAdmin()) return;
    const KEY = `dragonbane.mjInvite.${sh.id}`;
    const show = (code) => openDialog({
      title: 'Code MJ',
      body: `<p class="small">Donne ce code au <b>meneur de jeu</b> : sur la première page de l’appli (ou dans le menu ⋮), il touche « Je suis le meneur de jeu » et le saisit. Il entre dans le groupe comme MJ et voit toutes les fiches, notes privées comprises. Ne le donne pas aux joueurs.</p>
        <div class="share-code">${esc(code)}</div>
        <p class="small muted">« Nouveau code » rend l’ancien inutilisable.</p>`,
      actions: [
        { label: 'Nouveau code', cls: 'ghost', onClick: () => { make(code); return false; } }, 'spacer',
        { label: 'Copier', cls: 'ghost', onClick: () => { navigator.clipboard?.writeText(code).then(() => toast('Code copié')); return false; } },
        ...(navigator.share ? [{ label: 'Envoyer', cls: 'ghost', onClick: () => { navigator.share({ text: `Code MJ du groupe « ${sh.name} » (Fiche Dragonbane) : ${code}` }).catch(() => {}); return false; } }] : []),
        closeBtn,
      ],
    });
    const make = async (old) => {
      const code = `MJ${Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('')}`;
      try {
        await cloud.createMJInvite(code, sh.id);
        if (old) cloud.revokeMJInvite(old).catch(() => {});
        localStorage.setItem(KEY, code); show(code);
      } catch (e) { toast(e.message || 'Création du code impossible'); }
    };
    const saved = localStorage.getItem(KEY);
    if (saved) show(saved); else make(null);
  },
  async mjClaim() {
    const sh = group.shared; if (!sh) return;
    if (!cloud.user()) { toast('Connecte-toi d’abord (le nuage en haut)'); return; }
    if (!isAdmin()) { toast('Seul l’administrateur du groupe peut se désigner MJ ; les autres utilisent un code MJ'); return; }
    if (sh.mj && sh.mj !== cloud.uid()) { toast(`${sh.mjName || 'Quelqu’un'} est déjà le MJ : seul lui peut céder sa place`); return; }
    confirmDialog('Devenir MJ', `Tu seras le meneur de jeu du groupe « ${esc(sh.name)} » : tu verras toutes les fiches des joueurs, <b>notes secrètes et journaux perso compris</b>. Les joueurs en sont prévenus.`, 'Je suis le MJ', async () => {
      try { await cloud.setGroupMJ(sh.id, cloud.uid(), ownerName()); toast('Tu es le MJ du groupe'); } catch (e) { toast(e.message); }
    });
  },
  async mjLeave() {
    const sh = group.shared; if (!sh || !isMJ()) return;
    confirmDialog('Ne plus être MJ', 'Tu ne verras plus les fiches des joueurs. Un autre membre pourra devenir MJ.', 'Ne plus être MJ', async () => {
      try {
        await cloud.setGroupMJ(sh.id, '', '');
        sh.mj = ''; sh.mjName = ''; ui.mjView = null;
        // On reste dans le groupe : avec mon personnage de ce groupe s'il y en a un, sinon sans personnage
        const mine = store.list().find((x) => x.groupId === sh.id);
        if (mine) { setMjActive(false); store.select(mine.id); } else setMjActive(true);
        ui.tab = 'groupe'; render(); toast('Tu n’es plus le MJ : tu restes dans le groupe');
      } catch (e) { toast(e.message); }
    });
  },
  modeMenu() {
    if (ui.guest || ui.mjView) { toast(ui.mjView ? 'Fiche d’un joueur : lecture seule' : 'Personnage prêté : mode Jeu uniquement'); return; }
    openDialog({
      title: 'Mode de la fiche',
      body: `<div class="modes">${Object.entries(MODES).map(([k, m]) => `<button type="button" class="mode-opt ${ui.mode === k ? 'on' : ''}" data-m="${k}">${icon(m.icon)}<span><b>${m.label}</b><small>${m.desc}</small></span></button>`).join('')}</div>`,
      actions: [closeBtn],
      onOpen: (f) => f.querySelectorAll('.mode-opt').forEach((b) => { b.onclick = () => { ui.mode = b.dataset.m; dlg.close(); render(); }; }),
    });
  },
  syncNow() {
    if (!store.configured) return A.cloudMenu();
    if (store.status.state === 'needauth' || store.status.state === 'error') return store.sync({ interactive: true });
    A.cloudMenu();
  },
  cloudMenu() {
    const st = store.status;
    openDialog({
      title: 'Sauvegarde en ligne',
      body: `<p>${esc(st.message || 'Non synchronisé')}</p>
        ${store.meta.lastSync ? `<p class="small muted">Dernière synchro : ${new Date(store.meta.lastSync).toLocaleString('fr-FR')}</p>` : ''}
        <p class="small muted">Tes personnages sont toujours enregistrés sur l’appareil. Une fois connecté (compte Google ou e-mail), ils sont aussi sauvegardés en ligne et retrouvés sur tes autres appareils.</p>`,
      actions: [
        ...(store.userEmail ? [{ label: 'Se déconnecter', cls: 'ghost', onClick: () => { store.disconnect().then(render); } }] : []),
        { label: 'Configuration', cls: 'ghost', onClick: () => { setTimeout(A.firebaseConfig); } },
        'spacer', closeBtn,
        { label: store.userEmail ? 'Synchroniser' : 'Se connecter', primary: true, onClick: () => { store.sync({ interactive: true }); } },
      ],
    });
  },
  firebaseConfig() {
    openDialog({
      title: 'Configuration Firebase',
      body: `<p class="small">Laisse vide pour utiliser la configuration intégrée à l’appli. Sinon, colle le bloc <code>firebaseConfig</code> de ta console Firebase.</p>
        <div class="fields">${F.area('cfg', 'Configuration', store.meta.firebase ? JSON.stringify(store.meta.firebase, null, 2) : '')}</div>`,
      actions: [cancel, { label: 'Enregistrer', primary: true, onClick: (f) => {
        try { store.setFirebaseConfig(f.cfg.value); toast('Configuration enregistrée'); location.reload(); } catch (e) { toast(e.message); return false; }
      } }],
    });
  },
  menu() {
    openDialog({
      title: 'Menu',
      body: `<div class="menu-list">
        <button type="button" data-m="characters">${icon('users')} Mes personnages</button>
        <button type="button" data-m="newCharacter">${icon('plus')} Nouveau personnage</button>
        <button type="button" data-m="exportAll">${icon('down')} Exporter tous les personnages</button>
        <button type="button" data-m="importFile">${icon('upload')} Importer un fichier</button>
        <button type="button" data-m="cloudMenu">${icon('cloud')} Sauvegarde en ligne</button>
        <button type="button" data-m="history">${icon('history')} Historique des modifications</button>
        ${isMJ() ? '' : `<button type="button" data-m="mjJoin">👑 Je suis le meneur de jeu (code MJ)</button>`}
        ${group.shared && C()?.journal?.length ? `<button type="button" data-m="jImport">${icon('upload')} Verser mon journal perso dans le groupe</button>` : ''}
        <button type="button" data-m="manual">${icon('book')} Manuel d’utilisation</button>
        <button type="button" data-m="soundToggle">${icon('d20')} Son des dés : ${snd.soundOn() ? 'activé' : 'coupé'}</button>
      </div>
      <p class="small muted center">Fiche Dragonbane · fonctionne hors ligne</p>`,
      actions: [closeBtn],
      onOpen: (f) => f.querySelectorAll('[data-m]').forEach((b) => { b.onclick = () => { dlg.close(); setTimeout(() => A[b.dataset.m]()); }; }),
    });
  },
  soundToggle() {
    snd.setSound(!snd.soundOn());
    toast(snd.soundOn() ? 'Son des dés activé' : 'Son des dés coupé');
    if (snd.soundOn()) { snd.rattle(2); setTimeout(() => snd.land(2), 180); }
  },
  manual() {
    openDialog({
      title: 'Manuel d’utilisation',
      cls: 'manual',
      body: `<p class="small muted">Touche un sujet pour l’ouvrir.</p>${MANUAL.map(([t, h], n) => `<details class="lib-item"${n === 0 ? ' open' : ''}><summary><b>${esc(t)}</b></summary><div class="lib-body">${h}</div></details>`).join('')}`,
      actions: [closeBtn],
    });
  },
  characters() {
    const cur = C(); const sh = group.shared;
    const mine = new Set(store.list().map((c) => c.id));
    const groupName = (id) => group.list.find((r) => r.id === id)?.name || '';
    // Partie d'un personnage : celle qu'il a retenue (sinon le groupe actif, si je n'en suis pas le MJ)
    const gOf = (c) => c.groupId || null;
    const charRow = (c, gid) => `<div class="char-row"><button type="button" data-id="${c.id}" class="${c.id === cur?.id && !cur?.stub ? 'on' : ''}"><span class="crest small">${esc((c.name || '?').charAt(0).toUpperCase())}</span><span><b>${esc(c.name || 'Sans nom')}</b><small>${esc([R.kinName(c), R.profName(c)].filter(Boolean).join(' · '))}</small></span></button>
        ${sh && gid === sh.id ? `<label class="check lend-check" title="Si tu es absent, les autres joueurs du groupe pourront le jouer (mode Jeu uniquement)"><input type="checkbox" data-lend="${c.id}" ${lentHere(c) ? 'checked' : ''}><span>Prêter</span></label>` : ''}</div>`;
    // Un bloc par groupe : mener la partie (MJ), mes personnages, les personnages prêtés
    const blocks = group.list.map((r) => {
      const st = group.cached(r.id);
      const chars = store.list().filter((c) => gOf(c) === r.id);
      const lent = (st?.persos || []).filter((p) => !mine.has(p.id));
      const active = sh?.id === r.id;
      return `<section class="pick-group ${active ? 'active' : ''}">
        <div class="pick-head"><b>${esc(r.name)}</b><small>code ${esc(r.id)}${r.role === 'mj' ? ' · 👑 tu es le MJ' : ''}${active ? ' · partie affichée' : ''}</small></div>
        <div class="menu-list">
          ${r.role === 'mj' ? `<button type="button" data-mjg="${r.id}" class="${cur?.stub && active ? 'on' : ''}"><span class="crest small">👑</span><span><b>Mener la partie</b><small>Onglets MJ, Journal, Groupe, Biblio</small></span></button>` : ''}
          ${chars.map((c) => charRow(c, r.id)).join('')}
          ${lent.map((p) => `<button type="button" data-guest="${p.id}" data-gid="${r.id}" class="${ui.guest?.id === p.id ? 'on' : ''}"><span class="crest small">🎭</span><span><b>${esc(p.name)}</b><small>prêté · joueur : ${esc(p.owner || '?')}</small></span><span class="btn small">Jouer</span></button>`).join('')}
          ${r.role !== 'mj' ? `<button type="button" class="pick-add" data-newin="${r.id}">${icon('plus')} Nouveau personnage dans ce groupe</button>` : ''}
        </div>
      </section>`;
    }).join('');
    const loose = store.list().filter((c) => !gOf(c) || !group.list.some((r) => r.id === gOf(c)));
    openDialog({
      title: 'Personnages et parties',
      cls: 'pick-dlg',
      body: `${blocks}
        ${loose.length || !group.list.length ? `<section class="pick-group"><div class="pick-head"><b>${group.list.length ? 'Sans groupe' : 'Mes personnages'}</b>${group.list.length ? '<small>pas encore joués dans un groupe partagé</small>' : ''}</div>
          <div class="menu-list">${loose.map((c) => charRow(c, null)).join('') || '<p class="small muted">Aucun personnage.</p>'}</div></section>` : ''}
        <p class="small muted">Les personnages prêtés se jouent en mode Jeu uniquement, à la place d’un joueur absent.</p>`,
      actions: [{ label: '👑 MJ d’une partie…', cls: 'ghost', onClick: () => { setTimeout(() => A.mjJoin()); } }, 'spacer', closeBtn, { label: `${icon('plus')} Nouveau (sans groupe)`, primary: true, onClick: () => { ui.newInGroup = null; setTimeout(creationDialog); } }],
      onOpen: (f) => {
        f.querySelectorAll('[data-id]').forEach((b) => { b.onclick = () => {
          if (ui.guest) guestEnd();
          ui.mjView = null; setMjActive(false);
          store.select(b.dataset.id);
          // Le groupe affiché suit le personnage : le sien, ou aucun s'il n'est dans aucun groupe
          const c = store.current();
          if (c?.groupId && group.list.some((r) => r.id === c.groupId)) { if (c.groupId !== group.shared?.id) group.switchTo(c.groupId); } else group.deactivate();
          ui.mode = 'normal'; dlg.close(); render();
        }; });
        f.querySelectorAll('[data-newin]').forEach((b) => { b.onclick = () => { dlg.close(); ui.newInGroup = b.dataset.newin; setTimeout(creationDialog); }; });
        f.querySelectorAll('[data-mjg]').forEach((b) => { b.onclick = () => {
          if (ui.guest) guestEnd();
          ui.mjView = null;
          group.switchTo(b.dataset.mjg); setMjActive(true); ui.tab = 'mj'; ui.mode = 'normal';
          dlg.close(); render(); window.scrollTo(0, 0);
        }; });
        f.querySelectorAll('[data-guest]').forEach((b) => { b.onclick = () => { dlg.close(); setMjActive(false); if (b.dataset.gid && b.dataset.gid !== group.shared?.id) group.switchTo(b.dataset.gid); guestStart(b.dataset.guest); }; });
        f.querySelectorAll('[data-lend]').forEach((x) => { x.onchange = () => { const c = store.list().find((y) => y.id === x.dataset.lend); if (c) lendToggle(c, x.checked); }; });
      },
    });
  },
  newCharacter() { creationDialog(); },
  deleteCharacter() {
    if (ui.guest) { toast('Personnage prêté : seul son joueur peut le supprimer'); return; }
    const c = C();
    confirmDialog('Supprimer le personnage', `Supprimer <b>${esc(c.name)}</b> sur tous tes appareils ? Pense à l’exporter d’abord si tu veux le garder.`, 'Supprimer', () => { store.remove(c.id); ui.mode = 'normal'; render(); toast('Personnage supprimé'); });
  },
  exportAll() { download(`dragonbane-${new Date().toISOString().slice(0, 10)}.json`, store.exportAll()); },
  exportOne() { const c = C(); download(`${R.norm(c.name).replace(/[^a-z0-9]+/g, '-') || 'personnage'}.json`, store.exportOne(c)); },
  // ----- Journal (perso ou groupe : tout passe par jApply) -----
  jNew() {
    const id = R.uid();
    if (jApply({ t: 'j:new', session: { id, date: todayISO() } }, false)) { ui.jSession = id; ui.jSearch = ''; ui.jView = 'sessions'; render(); window.scrollTo(0, 0); }
  },
  jView(el) { ui.jView = el.dataset.v; ui.jSearch = ''; render(); },
  jGoSession(el) { ui.jView = 'sessions'; ui.jSession = el.dataset.id; ui.jSearch = ''; render(); document.querySelector('.j-page')?.scrollIntoView({ block: 'start' }); },
  history(el) { historyDialog(el?.dataset?.f || 'all'); },
  npcNew() { npcDialog(null); },
  placeNew() { placeDialog(null); },
  placeOpen(el) { const l = placeOf(J(), el.dataset.id); if (l) placeDialog(l); },
  jPlaceUnlink(el) { jApply({ t: 'j:placeUnlink', sid: ui.jSession, pid: el.dataset.id }); },
  npcOpen(el) { const n = npcOf(J(), el.dataset.id); if (n) npcDialog(n); },
  jNpcUnlink(el) { jApply({ t: 'j:npcUnlink', sid: ui.jSession, nid: el.dataset.id }); },
  jOpen(el) { ui.jSession = el.dataset.id; render(); if (innerWidth < 720) document.querySelector('.j-page')?.scrollIntoView({ block: 'start' }); },
  jDelete() {
    const s = J().journal.find((x) => x.id === ui.jSession); if (!s) return;
    confirmDialog('Supprimer la session', `Supprimer la session ${s.n}${s.title ? ` « ${esc(s.title)} »` : ''}, ses notes et son croquis ?${jShared() ? ' Elle disparaîtra pour tout le groupe.' : ''} C’est définitif.`, 'Supprimer', () => {
      if (s.sketch) media.remove(s.sketch);
      ui.jSession = null;
      jApply({ t: 'j:del', sid: s.id });
    });
  },
  jTodo(el) { jApply({ t: 'j:todoSet', sid: el.dataset.sid, tid: el.dataset.tid, v: { done: el.checked } }); },
  jTodoDel(el) { jApply({ t: 'j:todoDel', sid: ui.jSession, tid: el.dataset.tid }); },
  jSketch() {
    const s = J().journal.find((x) => x.id === ui.jSession); if (!s) return;
    const id = R.uid();
    media.put({ id, strokes: [] }, C().id).catch(() => toast(media.error() || 'Croquis non créé'));
    ui.skOpenFull = true;
    jApply({ t: 'j:sketch', sid: s.id, mid: id });
  },
  // Verser son journal personnel dans celui du groupe (images et croquis copiés aussi)
  // Ne plus proposer de verser le journal perso dans ce groupe (reste possible depuis le menu ⋮)
  jImportHide() {
    const c = C(); const id = group.shared?.id; if (!id) return;
    c.jImportHide = [...new Set([...(c.jImportHide || []), id])];
    commit(); toast('Proposition masquée. Tu peux toujours verser ton journal depuis le menu ⋮.');
  },
  jImport() {
    const c = C();
    confirmDialog('Verser mon journal', `Copier tes ${c.journal.length} session(s), ${c.npcs.length} PNJ et ${c.lieux.length} lieu(x) dans le journal du groupe ? Les autres joueurs les verront. Ton journal personnel reste intact.`, 'Verser', async () => {
      toast('Copie des images et croquis…');
      const ids = [...c.journal.map((s) => s.sketch), ...c.npcs.map((n) => n.photo), ...c.lieux.map((l) => l.photo)].filter(Boolean);
      let failed = 0;
      for (const id of ids) { try { await media.copyToGroup(id); } catch { failed++; } }
      // Une image ou un croquis n'a pas pu être copié : on ne verse rien (on pourra réessayer, rien n'est perdu)
      if (failed) { toast(`Rien n’a été versé : ${failed} image(s) ou croquis non copiés (${media.error() || 'erreur'}). Réessaie une fois connecté.`); render(); return; }
      jApply({ t: 'j:import', journal: c.journal, npcs: c.npcs, lieux: c.lieux });
      toast('Journal versé dans le groupe');
    });
  },
  skColor(el) { sketchCtl?.setColor(+el.dataset.c); syncSketchTools(); },
  skErase() { sketchCtl?.setErase(!sketchCtl.erase); syncSketchTools(); },
  skUndo() { sketchCtl?.undo(); },
  skClear() { if (sketchCtl) confirmDialog('Effacer le croquis', 'Effacer tous les traits de cette page ?', 'Effacer', () => { sketchCtl.clear(); }); },
  skFull() {
    const w = document.querySelector('.sketch'); if (!w) return;
    const on = !w.classList.contains('full');
    w.classList.toggle('full', on); document.body.classList.toggle('no-scroll', on);
    sketchCtl?.resize();
  },
  portraitPick(el) { pickPortrait(!!el?.dataset.cam); },
  portraitView() {
    const c = C(); if (!c?.portrait) return;
    openDialog({
      title: c.name || 'Portrait',
      cls: 'portrait-dlg',
      body: `<img class="portrait-full" src="${c.portrait}" alt="Portrait de ${esc(c.name || 'ton personnage')}">`,
      actions: [
        { label: icon('trash'), cls: 'ghost', onClick: () => { setTimeout(() => confirmDialog('Retirer le portrait', 'Retirer l’image de ce personnage ?', 'Retirer', () => { delete c.portrait; commit(); })); } },
        'spacer', closeBtn,
        ...(canCamera() ? [{ label: `${icon('camera')} Photo`, cls: 'ghost', onClick: () => { pickPortrait(true); } }] : []),
        { label: 'Changer l’image', primary: true, onClick: () => { pickPortrait(); } },
      ],
    });
  },
  importFile() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = async () => {
      try { const n = store.importAll(await inp.files[0].text()); toast(n ? `${n} personnage${n > 1 ? 's' : ''} importé${n > 1 ? 's' : ''}` : 'Aucun personnage dans ce fichier'); render(); } catch { toast('Fichier illisible'); }
    };
    inp.click();
  },

  // ----- Fiche -----
  attr(el) {
    const c = C(); const k = el.dataset.k; const a = R.ATTR[k];
    if (isFree()) {
      openDialog({
        title: `${a.name} (${k})`,
        body: `<div class="fields">${F.num('v', 'Valeur', c.attrs[k], 'full', 'autofocus min="1" max="18"')}</div>
          <p class="small muted">Changer un attribut ne modifie pas les compétences déjà calculées${k === 'CON' ? ', mais change les PV maximum' : k === 'VOL' ? ', mais change les PVol maximum' : ''}.</p>`,
        actions: [cancel, { label: 'Enregistrer', primary: true, onClick: (f) => {
          const v = clamp(num(f.v.value), 1, 18);
          if (k === 'CON' && c.hp.cur === R.maxHP(c)) c.hp.cur = v + (+c.hp.bonus || 0);
          if (k === 'VOL' && c.wp.cur === R.maxWP(c)) c.wp.cur = v + (+c.wp.bonus || 0);
          c.attrs[k] = v;
          c.hp.cur = Math.min(c.hp.cur, R.maxHP(c)); c.wp.cur = Math.min(c.wp.cur, R.maxWP(c));
          commit();
        } }],
      });
      return;
    }
    openRoll({ title: `Jet de ${a.name}`, target: c.attrs[k], attr: k });
  },
  skill(el) {
    const c = C(); const s = c.skills.find((x) => x.id === el.dataset.id);
    if (!s) return;
    if (isFree() && !el.dataset.roll) return editSkill(s);
    if (isProg() && !el.dataset.roll) {
      if (s.mark) {
        if (s.mark === 'seance') c.pendingMarks++;
        s.mark = false;
      } else if (s.value >= 18) { toast(`${s.name} est déjà au maximum (18)`); return; }
      else if (c.pendingMarks > 0) { s.mark = 'seance'; c.pendingMarks--; }
      else s.mark = 'jeu';
      commit();
      return;
    }
    if (!s.value) { toast(`${s.name} : niveau 0, impossible de lancer (passe en mode libre pour l’entraîner)`); return; }
    openRoll({ title: s.name, target: s.value, attr: s.attr, skill: s });
  },
  // Coche d'amélioration posée à la main (jet fait avec de vrais dés, ou oubli)
  markSkill(el) {
    const c = C(); const s = c.skills.find((x) => x.id === el.dataset.id);
    if (!s) return;
    if (isProg()) return A.skill(el);
    if (s.mark) {
      confirmDialog('Retirer la coche', `Retirer la coche d’amélioration de <b>${esc(s.name)}</b> ?`, 'Retirer', () => {
        if (s.mark === 'seance') c.pendingMarks++;
        s.mark = false; commit();
      });
      return;
    }
    openDialog({
      title: 'Dragon ou Démon ?',
      body: `<p>As-tu obtenu un <b>Dragon</b> (1) ou un <b>Démon</b> (20) sur un jet de <b>${esc(s.name)}</b> ?</p>
        <p class="small muted">La compétence reçoit une coche d’amélioration : en fin de séance, tu lanceras un D20 pour tenter de l’améliorer.</p>`,
      actions: [cancel, { label: '✦ Cocher la compétence', primary: true, onClick: () => { s.mark = 'jeu'; commit(); toast(`✦ ${s.name} est cochée pour l’amélioration`); } }],
    });
  },
  addSkill() {
    const c = C();
    const s = { id: R.uid(), name: 'Nouvelle compétence', attr: 'INT', kind: 'autre', trained: false, value: R.baseChance(c.attrs.INT), mark: false, custom: true };
    c.skills.push(s);
    editSkill(s);
  },
  addAbility() { editAbility(-1); },
  ability(el) { const i = +el.dataset.i; if (isFree()) editAbility(i); else showAbility(i); },
  useAbility(el) {
    const c = C(); const a = c.abilities[+el.dataset.i];
    const cost = parseInt(a.wp, 10);
    if (cost) useAbility(c, a, cost); else showAbility(+el.dataset.i);
  },
  libSection(el) { ui.libSection = el.dataset.s; render(); },
  ruleSub(el) { ui.ruleSub = el.dataset.s; render(); if (ui.libSearch) filterLib(); },

  // ----- Combat -----
  pool(el) {
    const c = C(); const k = el.dataset.k; const max = k === 'hp' ? R.maxHP(c) : R.maxWP(c);
    c[k].cur = clamp((+c[k].cur || 0) + +el.dataset.d, 0, max);
    if (k === 'hp' && c.hp.cur > 0) c.death = { succ: 0, fail: 0 };
    commit();
  },
  poolSet(el) {
    const c = C(); const k = el.dataset.k; const max = k === 'hp' ? R.maxHP(c) : R.maxWP(c);
    const label = k === 'hp' ? 'Points de vie' : 'Points de volonté';
    openDialog({
      title: label,
      body: `<div class="fields">${F.num('delta', k === 'hp' ? 'Dégâts (−) ou soins (+)' : 'Dépense (−) ou gain (+)', '', 'full', 'autofocus placeholder="ex. -5"')}${F.num('cur', 'Ou valeur exacte', c[k].cur)}</div>
        ${k === 'hp' && R.armorTotal(c) ? `<p class="small muted">Armure : ${R.armorTotal(c)} (à retirer des dégâts d’une attaque).</p>` : ''}`,
      actions: [cancel, { label: 'Appliquer', primary: true, onClick: (f) => {
        const delta = f.delta.value.trim();
        c[k].cur = clamp(delta ? c[k].cur + num(delta) : num(f.cur.value), 0, max);
        if (k === 'hp' && c.hp.cur > 0) c.death = { succ: 0, fail: 0 };
        commit();
      } }],
    });
  },
  cond(el) { const c = C(); c.conditions[el.dataset.k] = !c.conditions[el.dataset.k]; commit(); },
  music() { const c = C(); c.music = !c.music; commit(); toast(c.music ? '♪ Le barde joue : avantage à tous tes jets' : 'La musique s’arrête'); },
  deathRoll() {
    const c = C();
    openRoll({ title: 'Jet de mort', target: c.attrs.CON, attr: 'CON', noPush: true, once: true, note: `Réussites ${c.death.succ}/3 · Échecs ${c.death.fail}/3 · un Dragon compte double, un Démon aussi`, onResult: (r, st) => {
      const n = r.dragon || r.demon ? 2 : 1;
      if (r.success) c.death.succ = Math.min(3, c.death.succ + n); else c.death.fail = Math.min(3, c.death.fail + n);
      if (c.death.succ >= 3 && c.death.fail < 3) {
        const h = R.d(6);
        c.hp.cur = Math.min(R.maxHP(c), h);
        c.death = { succ: 0, fail: 0 };
        st.msg = `<b>Trois réussites : tu récupères ${h} PV (D6).</b>`;
      } else {
        st.msg = c.death.fail >= 3 ? '<b class="bad">Trois échecs : ton personnage meurt.</b>' : `Réussites ${c.death.succ}/3 · Échecs ${c.death.fail}/3`;
      }
      commit(false);
    } });
  },
  deathReset() { C().death = { succ: 0, fail: 0 }; commit(); },
  rest(el) {
    const c = C(); const r = el.dataset.r;
    c.rests ??= {};
    // Repos de round et repos court : une fois par quart (remis à zéro par un repos long)
    if (r !== 'shift' && c.rests[r]) {
      confirmDialog('Déjà pris', `Tu as déjà pris un ${r === 'round' ? 'repos de round' : 'repos court'} pendant ce quart. Un seul par quart : le reprendre quand même ?`, 'Oui, nouveau quart', () => { c.rests = {}; setTimeout(() => A.rest(el)); });
      return;
    }
    if (r === 'round') {
      const n = R.d(6); c.wp.cur = Math.min(R.maxWP(c), c.wp.cur + n); c.rests.round = true; commit(); toast(`Repos de round : +${n} PVol (D6 = ${n})`);
    }
    if (r === 'stretch') {
      const conds = R.ATTRS.filter((a) => c.conditions[a.key]);
      openDialog({
        title: 'Repos court',
        body: `<p class="small">Un intervalle de temps : D6 PV (2D6 si quelqu’un te soigne et réussit un jet de Soins), D6 PVol et un état guéri.</p>
          ${conds.length ? F.select('cond', 'État à guérir', conds[0].key, [...conds.map((a) => [a.key, a.cond]), ['', 'Aucun']], 'full') : '<p class="small muted">Aucun état à guérir.</p>'}
          ${F.check('tended', 'Soigné par quelqu’un (jet de Soins réussi) : 2D6 PV', false)}`,
        actions: [cancel, { label: 'Se reposer', primary: true, onClick: (f) => {
          const h = f.tended.checked ? R.d(6) + R.d(6) : R.d(6); const w = R.d(6);
          c.rests.stretch = true;
          c.hp.cur = Math.min(R.maxHP(c), c.hp.cur + h); c.wp.cur = Math.min(R.maxWP(c), c.wp.cur + w);
          if (f.cond?.value) c.conditions[f.cond.value] = false;
          if (c.hp.cur > 0) c.death = { succ: 0, fail: 0 };
          commit(); toast(`Repos court : +${h} PV, +${w} PVol`);
        } }],
      });
    }
    if (r === 'shift') {
      confirmDialog('Repos long', 'Un quart complet en lieu sûr : tous les PV, tous les PVol et tous les états sont récupérés.', 'Se reposer', () => {
        c.hp.cur = R.maxHP(c); c.wp.cur = R.maxWP(c); c.conditions = {}; c.death = { succ: 0, fail: 0 }; c.rests = {};
        commit(); toast('Repos long : tout est récupéré');
      });
    }
  },
  attack(el) {
    const c = C(); const w = c.weapons[+el.dataset.i]; const s = c.skills.find((x) => x.id === w.skill);
    const extra = strBanes(c, w); if (!extra) return;
    openRoll({ title: `Attaque — ${w.name}`, target: s.value, attr: s.attr, skill: s, weapon: w, extra });
  },
  parry(el) {
    const c = C(); const w = c.weapons[+el.dataset.i]; const s = c.skills.find((x) => x.id === w.skill);
    if (/ne peut pas parer/i.test(w.features || '')) { toast(`${w.name} ne peut pas servir à parer`); return; }
    const extra = strBanes(c, w); if (!extra) return;
    openRoll({ title: `Parade — ${w.name}`, target: s.value, attr: s.attr, skill: s, extra, note: 'Si la parade réussit, l’arme encaisse les dégâts : au-delà de sa solidité, elle se brise.' });
  },
  damage(el) {
    const c = C(); const w = c.weapons[+el.dataset.i];
    const bonus = w.bonus ? R.damageBonus(c.attrs[w.bonus]) : '';
    freeRoll(`${w.damage}${bonus ? `+${bonus}` : ''}`);
  },
  editWeapon(el) { editWeapon(+el.dataset.i); },
  sneak(el) { sneakAttack(+el.dataset.i); },

  // ----- Groupe -----
  gMoney(el) { groupMoneyDialog(+el.dataset.s); },
  gUndo(el) {
    const e = gApply({ t: 'undo', id: el.dataset.id });
    if (!e) return;
    if (e.purse) { purseFix(e.purse); render(); }
    toast(e.text);
  },
  gItem(el) { const k = G().carriers.find((x) => x.id === el.dataset.k); const it = k?.items.find((x) => x.id === el.dataset.id); if (it) groupItemDialog(k, it); },
  gAddItem(el) { groupAddItemDialog(G().carriers.find((x) => x.id === el.dataset.k)); },
  gSell(el) { const k = G().carriers.find((x) => x.id === el.dataset.k); const it = k?.items.find((x) => x.id === el.dataset.id); if (it) groupSellDialog(k, it); },
  gSaddle(el) { gApply({ t: 'saddle', id: el.dataset.k, d: +el.dataset.d }); },
  gEditCarrier(el) { groupCarrierDialog(G().carriers.find((x) => x.id === el.dataset.k)); },
  gLogAll() { ui.logAll = !ui.logAll; render(); },
  gNotes() {
    const orig = G().notes || '';
    openDialog({
      title: 'Notes du groupe',
      body: `<p class="pres-slot" data-pres="gnotes"></p><div class="fields">${F.area('notes', 'Notes', orig)}</div>`,
      actions: [cancel, { label: 'Enregistrer', primary: true, onClick: (f) => {
        let v = f.notes.value.trim(); const now = G().notes || '';
        if (v === orig) return; // rien changé de mon côté : on garde la version actuelle
        if (group.shared && now !== orig && now !== v) { v = mergeText(now, v); toast('Un autre membre a modifié les notes pendant que tu écrivais : les deux versions sont gardées'); }
        if (v !== now) return gApply({ t: 'notes', v }) && undefined;
      } }],
      onOpen: () => { presSet('gnotes', true); presShow(); },
    });
  },
  gShareCreate() { shareCreateDialog(); },
  gShareJoin() { shareJoinDialog(); },
  gShareCode() { shareCodeDialog(); },
  // Membre du groupe sans personnage : en créer un qui en fait partie
  gNewHere() { if (group.shared) { ui.newInGroup = group.shared.id; creationDialog(); } },
  // Personnage sans groupe : rejoindre un de mes groupes déjà connus (sans code)
  gJoinKnown(el) {
    const r = group.list.find((x) => x.id === el.dataset.id); if (!r) return;
    linkChar(r.id); group.switchTo(r.id); render(); toast(`${C()?.name || 'Personnage'} rejoint « ${r.name} »`);
  },
  // Quitter le groupe : le personnage repasse sans groupe ; le compte quitte le groupe s'il n'y a plus personne à lui
  gLeave() {
    const sh = group.shared; if (!sh) return;
    const c = C(); const asMJ = !!c?.stub;
    // Le compte quitte vraiment le groupe ? (sinon un autre de mes personnages y joue, ou j'en reste le MJ)
    const leaves = asMJ || (!store.list().some((x) => x.groupId === sh.id && x.id !== c?.id) && !isMJ());
    const others = Object.entries(sh.members || {}).filter(([u]) => u !== cloud.uid());
    const pickOwner = leaves && isAdmin() && others.length;
    const def = others.find(([u]) => u === sh.mj)?.[0] || others[0]?.[0];
    const text = (asMJ ? `Quitter « ${esc(sh.name)} » ?${isMJ() ? ' Tu ne seras plus son MJ.' : ''}`
      : `<b>${esc(c?.name || 'Ton personnage')}</b> quittera « ${esc(sh.name)} » et repassera sans groupe. Tu pourras revenir avec le code <b>${esc(sh.id)}</b>.`)
      + (pickOwner ? `</p><p class="small">🔑 Tu es l’administrateur : qui le devient à ta place (code MJ, « Je serai le MJ ») ?</p><p><select name="owner">${others.map(([u, n]) => `<option value="${esc(u)}" ${u === def ? 'selected' : ''}>${esc(n || 'Membre')}${u === sh.mj ? ' (MJ)' : ''}</option>`).join('')}</select>` : '');
    confirmDialog('Quitter le groupe', text, 'Quitter', async (f) => {
      try {
        if (pickOwner && f?.owner?.value) await cloud.setGroupOwner(sh.id, f.owner.value).catch(() => {});
        if (asMJ) { if (isMJ()) await cloud.setGroupMJ(sh.id, '', '').catch(() => {}); setMjActive(false); await group.leave(); render(); toast('Groupe quitté'); return; }
        if (c && !ui.guest && !ui.mjView) {
          if (lentHere(c)) { group.apply({ t: 'p:unlend', id: c.id }, c.name); cloud.deletePerso(sh.id, c.id).catch(() => {}); }
          delete c.lentTo; delete c.groupId; c.updatedAt = Date.now(); store.save();
        }
        const stillMine = store.list().some((x) => x.groupId === sh.id);
        if (!stillMine && !isMJ()) await group.leave(); else group.deactivate();
        render(); toast(stillMine || isMJ() ? `${c?.name || 'Personnage'} a quitté le groupe` : 'Groupe quitté');
      } catch (e) { toast(e.message); }
    });
  },
  gAcct(el) { const a = G().accounts.find((x) => x.id === el.dataset.id); if (a) groupAccountMoveDialog(a, el.dataset.m); },
  gEditAcct(el) { const id = el.dataset.id; groupAccountDialog(id ? G().accounts.find((x) => x.id === id) : null); },
  gAddCarrier() { groupCarrierDialog(null); },
  editArmor(el) {
    const c = C(); const k = el.dataset.k; const a = c[k];
    const opts = L.ARMORS.map((x, n) => [n, x]).filter(([, x]) => x.slot === k).map(([n, x]) => [n, `${x.name} — ${x.rating} · ${x.cost}`]);
    openDialog({
      title: k === 'armor' ? 'Armure' : 'Casque',
      body: `<div class="fields">
        ${libPicker([[k === 'armor' ? 'Armures' : 'Casques', opts]])}
        ${F.text('name', 'Nom', a.name, 'full', `placeholder="${k === 'armor' ? 'Cotte de mailles…' : 'Heaume…'}"`)}
        ${F.num('rating', 'Valeur d’armure', a.rating)}
        ${F.text('banes', 'Désavantage sur', a.banes, 'full', `placeholder="${k === 'armor' ? 'Discrétion, Esquive' : 'Vigilance'}"`)}
      </div><p class="small muted">Sépare les compétences par des virgules : le lanceur de dés ajoutera le désavantage automatiquement.</p>`,
      actions: [
        ...(a.name || a.rating ? [{ label: k === 'armor' ? 'Retirer l’armure' : 'Retirer le casque', cls: 'ghost', onClick: () => { Object.assign(a, { name: '', rating: 0, banes: '' }); commit(); } }, 'spacer'] : []),
        cancel, { label: 'Enregistrer', primary: true, onClick: (f) => {
          Object.assign(a, { name: f.name.value.trim(), rating: num(f.rating.value), banes: f.banes.value.trim() }); commit();
        } }],
      onOpen: (f) => { f.lib.onchange = () => { const x = L.ARMORS[f.lib.value]; if (!x) return; f.name.value = x.name; f.rating.value = x.rating; f.banes.value = x.banes; }; },
    });
  },
  freeRoll(el) { freeRoll(el.dataset.e); },

  // ----- Magie -----
  editSpell(el) { editSpell(+el.dataset.i, 'spells'); },
  editTrick(el) { editSpell(+el.dataset.i, 'tricks'); },
  prepSpell(el) { const s = C().spells[+el.dataset.i]; s.prepared = !s.prepared; commit(); },
  castTrick(el) {
    const c = C(); const t = c.tricks[+el.dataset.i];
    if (c.wp.cur < 1) return toast('Plus de points de volonté');
    c.wp.cur -= 1; commit(); toast(`${t.name} : −1 PVol`);
  },
  castSpell(el) {
    const c = C(); const sp = c.spells[+el.dataset.i];
    const school = c.skills.find((s) => s.id === sp.school) || c.skills.find((s) => s.kind === 'magie' && s.trained);
    if (!school) return toast('Aucune école de magie entraînée pour lancer ce sort');
    const levels = sp.power !== false ? [1, 2, 3] : [1];
    openDialog({
      title: sp.name,
      body: `${sp.desc ? `<p class="small">${esc(sp.desc)}</p>` : ''}
        <p class="small muted">Jet de ${esc(school.name)} (${school.value}) · PVol : ${c.wp.cur}</p>
        <div class="power">${levels.map((n) => `<button type="button" class="btn ${n * 2 > c.wp.cur ? 'ghost' : ''}" data-p="${n}" ${n * 2 > c.wp.cur ? 'disabled' : ''}>${sp.power !== false ? `Puissance ${n}<small>${n * 2} PVol</small>` : `Lancer<small>2 PVol</small>`}</button>`).join('')}</div>`,
      actions: [cancel],
      onOpen: (f) => f.querySelectorAll('[data-p]').forEach((b) => { b.onclick = () => {
        const n = +b.dataset.p;
        c.wp.cur -= n * 2; commit(false);
        openRoll({ title: `${sp.name}${sp.power !== false ? ` (puissance ${n})` : ''}`, target: school.value, attr: school.attr, skill: school, note: `${n * 2} PVol dépensés` });
      }; }),
    });
  },

  // ----- Sac -----
  money(el) { const c = C(); const k = el.dataset.k; c.money[k] = Math.max(0, (+c.money[k] || 0) + +el.dataset.d); commit(); },
  pay() { moneyDialog(-1); },
  earn() { moneyDialog(1); },
  toggleBackpack() { const c = C(); c.backpack = !c.backpack; commit(); },
  editItem(el) { editItem(+el.dataset.i); },

  // ----- Progrès -----
  endSession() {
    const c = C();
    openDialog({
      title: 'Fin de séance',
      body: `<p class="small muted">Chaque « oui » te donne une coche à placer sur la compétence de ton choix (une seule coche par compétence).</p>
        <div class="checks one">${R.SESSION_QUESTIONS.map((q, i) => F.check(`q${i}`, q, i === 0)).join('')}${c.weakness ? F.check('qw', R.WEAKNESS_OVERCOME, false) : ''}</div>`,
      actions: [cancel, { label: 'Valider', primary: true, onClick: (f) => {
        const overcome = !!f.qw?.checked;
        const n = R.SESSION_QUESTIONS.filter((_, i) => f[`q${i}`].checked && !(i === 4 && overcome)).length + (overcome ? 2 : 0);
        if (!n) return;
        if (overcome) { c.notes = `${c.notes ? `${c.notes}\n` : ''}Faiblesse surmontée (${fmtDate(Date.now())}) : ${c.weakness}`; c.weakness = ''; }
        c.pendingMarks = (+c.pendingMarks || 0) + n;
        logEntry(c, `Fin de séance : ${n} coche${n > 1 ? 's' : ''} à placer`, { type: 'marks', n });
        ui.mode = 'prog'; ui.tab = 'fiche';
        commit();
        toast(`${n} coche${n > 1 ? 's' : ''} à placer : touche les compétences`);
      } }],
    });
  },
  advanceRolls() {
    const c = C();
    const marked = c.skills.filter((s) => s.mark);
    if (!marked.length) return;
    const prev = marked.map((s) => ({ id: s.id, value: s.value, mark: s.mark }));
    const results = marked.map((s) => {
      const roll = R.d(20);
      const up = roll > s.value && s.value < 18;
      const before = s.value;
      if (up) s.value += 1;
      s.mark = false;
      return { s, roll, up, before };
    });
    const ups = results.filter((r) => r.up);
    logEntry(c, `Amélioration : ${ups.length ? ups.map((r) => `${r.s.name} ${r.before}→${r.s.value}`).join(', ') : 'aucune compétence améliorée'}`, { type: 'advance', prev });
    commit();
    const reached = ups.filter((r) => r.s.value >= 18);
    openDialog({
      title: 'Jets d’amélioration',
      body: `<div class="adv-list">${results.map((r) => `<div class="adv ${r.up ? 'up' : ''}"><span>${esc(r.s.name)}</span>${dieEl(20, r.roll, `small ${r.roll === 1 ? 'dragon' : r.roll === 20 ? 'demon' : ''}`)}<b>${r.up ? `${r.before} → ${r.s.value}` : `${r.before}`}</b></div>`).join('')}</div>
        <p class="small center">${ups.length} compétence${ups.length > 1 ? 's' : ''} améliorée${ups.length > 1 ? 's' : ''} sur ${results.length}.</p>
        ${reached.length ? `<p class="small center"><b>${reached.map((r) => esc(r.s.name)).join(', ')}</b> atteint 18 : tu gagnes immédiatement une nouvelle capacité héroïque !</p>` : ''}`,
      actions: [
        ...(reached.length ? [{ label: 'Choisir la capacité', cls: 'gold', onClick: () => { ui.mode = 'prog'; render(); setTimeout(() => editAbility(-1)); } }] : []),
        { label: 'Terminer', primary: true, onClick: () => { ui.mode = 'normal'; render(); } },
      ],
    });
  },
  undo() {
    const c = C(); const e = c.log.find((x) => x.undo && !x.undone);
    if (!e) return;
    const u = e.undo;
    if (u.type === 'advance') {
      for (const p of u.prev) { const s = c.skills.find((x) => x.id === p.id); if (s) { s.value = p.value; s.mark = p.mark; } }
    }
    if (u.type === 'marks') {
      const left = Math.min(u.n, c.pendingMarks);
      c.pendingMarks -= left;
      // Coches déjà placées : on les retire aussi
      let rest = u.n - left;
      for (const s of c.skills) { if (rest <= 0) break; if (s.mark === 'seance') { s.mark = false; rest--; } }
    }
    if (u.type === 'ability') {
      c.abilities = c.abilities.filter((a) => a.id !== u.id);
      if (u.pool) { c[u.pool].bonus = (+c[u.pool].bonus || 0) - 2; c[u.pool].cur = Math.min(c[u.pool].cur, u.pool === 'hp' ? R.maxHP(c) : R.maxWP(c)); }
    }
    e.undone = true;
    commit();
    toast(`Annulé : ${e.label}`);
  },
};

function moneyDialog(sign) {
  const c = C();
  openDialog({
    title: sign < 0 ? 'Payer' : 'Recevoir',
    body: `<div class="fields three">${F.num('or', 'Or', '', '', 'autofocus')}${F.num('argent', 'Argent', '')}${F.num('cuivre', 'Cuivre', '')}</div>
      ${sign < 0 ? '<p class="small muted">La monnaie est rendue automatiquement si besoin.</p>' : ''}`,
    actions: [cancel, { label: sign < 0 ? 'Payer' : 'Ajouter', primary: true, onClick: (f) => {
      const amount = num(f.or.value) * 100 + num(f.argent.value) * 10 + num(f.cuivre.value);
      if (!amount) return;
      if (sign > 0) {
        c.money.or = (+c.money.or || 0) + num(f.or.value); c.money.argent = (+c.money.argent || 0) + num(f.argent.value); c.money.cuivre = (+c.money.cuivre || 0) + num(f.cuivre.value);
      } else {
        const total = totalCopper(c.money);
        if (amount > total) { toast(`Il te manque ${fmtMoney(amount - total)}`); return false; }
        let rest = total - amount;
        // Garde autant que possible les pièces d'or et d'argent qu'on avait
        const or = Math.min(+c.money.or || 0, Math.floor(rest / 100)); rest -= or * 100;
        const argent = Math.floor(rest / 10); rest -= argent * 10;
        c.money = { or, argent, cuivre: rest };
      }
      commit();
      toast(`${sign < 0 ? 'Payé' : 'Reçu'} : ${fmtMoney(amount)}`);
    } }],
  });
}

function download(name, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ================= Événements =================
$app.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  if (el.type === 'checkbox') return; // géré par « change »
  e.stopPropagation();
  A[el.dataset.act]?.(el, e);
});

// Champs liés : enregistrement à la frappe, rafraîchissement à la validation
$app.addEventListener('input', (e) => {
  const el = e.target;
  if (el.id === 'libSearch') { ui.libSearch = el.value; filterLib(); return; }
  if (el.id === 'jSearch') { ui.jSearch = el.value; filterJournal(); return; }
  if (el.dataset.jf || el.dataset.jt) {
    if (jShared() && !jBase.has(jKey(el))) { const v = jRemote(el); if (v !== null) jBase.set(jKey(el), v); } // valeur de départ (si le début de saisie n'a pas été vu)
    jSave(el, false); if (jShared()) presSet(jKey(el)); return;
  }
  if (el.dataset.mjn && group.shared) { const [k, id] = el.dataset.mjn.split('|'); store.setMjNote(group.shared.id, k, id, el.value); return; }
  if (!el.dataset.bind) return;
  setPath(C(), el.dataset.bind, el.hasAttribute('data-num') ? num(el.value) : el.value);
  commit(false);
});
$app.addEventListener('change', (e) => {
  const el = e.target;
  if (el.type === 'checkbox' && el.dataset.act) { A[el.dataset.act]?.(el); return; }
  if (el.dataset.jf || el.dataset.jt) { jSave(el, true); return; }
  if (el.dataset.gharness) {
    gApply({ t: 'harness', id: el.dataset.gharness, to: el.value });
    return;
  }
  const c = C();
  if (el.hasAttribute('data-ident')) {
    c[el.name] = el.value;
    if (el.name === 'profession' && el.value === 'mage' && !c.school) c.school = 'elementalisme';
    commit();
    return;
  }
  if (!el.dataset.bind) return;
  setPath(c, el.dataset.bind, el.hasAttribute('data-num') ? num(el.value) : el.value);
  if (el.dataset.bind.startsWith('money.')) setPath(c, el.dataset.bind, Math.max(0, num(el.value)));
  if (el.dataset.bind === 'hp.bonus') c.hp.cur = Math.min(c.hp.cur, R.maxHP(c));
  if (el.dataset.bind === 'wp.bonus') c.wp.cur = Math.min(c.wp.cur, R.maxWP(c));
  commit(el.hasAttribute('data-rerender') || el.hasAttribute('data-num'));
});
$app.addEventListener('submit', (e) => {
  const form = e.target;
  if (form.dataset.form === 'jNpc') {
    e.preventDefault();
    const name = form.n.value.trim(); if (!name) return;
    const known = J().npcs.find((x) => R.norm(x.name) === R.norm(name));
    const ok = known ? jApply({ t: 'j:npcLink', sid: ui.jSession, nid: known.id })
      : jApply({ t: 'j:npcAdd', sid: ui.jSession, npc: { id: R.uid(), name, role: '', place: '', attitude: 'inconnu', notes: '' } });
    if (ok) toast(known ? `${known.name} ajouté à la session` : `Nouveau PNJ : ${name} — touche son nom pour compléter sa fiche`);
    setTimeout(() => document.querySelector('form[data-form="jNpc"] input')?.focus());
    return;
  }
  if (form.dataset.form === 'jPlace') {
    e.preventDefault();
    const name = form.n.value.trim(); if (!name) return;
    const known = J().lieux.find((x) => R.norm(x.name) === R.norm(name));
    const ok = known ? jApply({ t: 'j:placeLink', sid: ui.jSession, pid: known.id })
      : jApply({ t: 'j:placeAdd', sid: ui.jSession, place: { id: R.uid(), name, kind: 'autre', where: '', notes: '', npcIds: [] } });
    if (ok) toast(known ? `${known.name} ajouté à la session` : `Nouveau lieu : ${name} — touche son nom pour compléter sa fiche`);
    setTimeout(() => document.querySelector('form[data-form="jPlace"] input')?.focus());
    return;
  }
  if (form.dataset.form === 'jTodo') {
    e.preventDefault();
    const t = form.t.value.trim(); if (!t) return;
    jApply({ t: 'j:todoAdd', sid: ui.jSession, todo: { id: R.uid(), t, done: false } });
    setTimeout(() => document.querySelector('form[data-form="jTodo"] input')?.focus());
    return;
  }
  if (form.dataset.form === 'gItem') {
    e.preventDefault();
    const raw = form.item.value.trim();
    if (!raw) return;
    // « Rations ×4 » ou « Rations x4 » : quantité
    const m = raw.match(/^(.*?)\s*[×x]\s*(\d+)$/i);
    gApply({ t: 'itemAdd', k: form.dataset.k, item: { id: R.uid(), name: m ? m[1] : raw, qty: m ? +m[2] : 1, weight: /ration/i.test(raw) ? 0.25 : 1, notes: '' } });
    document.querySelector(`[data-form=gItem][data-k="${form.dataset.k}"] input`)?.focus();
    return;
  }
  if (form.dataset.form !== 'quickItem') return;
  e.preventDefault();
  const name = form.item.value.trim();
  if (!name) return;
  C().items.push({ name, qty: 1, weight: 1, notes: '', worn: false });
  commit();
  document.querySelector('[data-form=quickItem] input')?.focus();
});

// MJ sans personnage reconnu alors que la première page est affichée : on bascule sur l'onglet MJ
// Groupe retrouvé dans le compte (autre appareil, réinstallation) : plus besoin de ressaisir le code
store.onMyGroup((ref) => {
  const added = group.restore(ref);
  if (!group.shared) {
    const c = store.current();
    const target = c?.groupId && group.list.some((r) => r.id === c.groupId) ? c.groupId
      : !c ? group.list.find((r) => r.role === 'mj')?.id : null;
    if (target) { group.switchTo(target); if (!c) setMjActive(true); if (!dlg.open) render(); return; }
  }
  if (added && !dlg.open) render();
});
function welcomeToMJ() {
  if (!$app.querySelector('.welcome') || !C()?.stub) return false;
  if (dlg.open && dlg.querySelector('h2')?.textContent === 'Nouveau personnage') dlg.close();
  if (dlg.open) return false;
  ui.tab = 'mj'; render(); return true;
}
store.onStatus((st, info) => {
  const btn = document.getElementById('syncBtn');
  if (btn) { btn.className = `icon-btn sync-${st.state}`; btn.title = st.message; }
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
  // MJ sans personnage : tant que le compte n'est pas reconnu, la première page s'affiche ; on redessine dès qu'il l'est
  if (welcomeToMJ()) { group.refresh(); mjSync(); return; }
  if (info?.reloaded && !typing && !dlg.open) render();
  group.refresh();
  mjSync();
});
// Groupe partagé : un autre joueur a modifié quelque chose
group.onChange(() => {
  mjSync(); // un MJ vient d'être désigné : envoyer mes fiches sans attendre
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
  if (welcomeToMJ()) return;
  presWatch();
  if (!['groupe', 'journal', 'mj'].includes(ui.tab) || !C()) return;
  if (typing) { if (ui.tab === 'journal' && jKey(document.activeElement)) liveJournalUpdate(); else renderLater = true; return; }
  if (dlg.open || document.querySelector('.sketch.full')) { renderLater = true; return; }
  render();
});
// Début de saisie dans un champ du journal partagé : valeur de départ (protection) et présence
$app.addEventListener('focusin', (e) => {
  const k = jKey(e.target); if (!k || !jShared()) return;
  const v = jRemote(e.target); if (v !== null && !jTimers.has(e.target)) jBase.set(k, v);
  presSet(k, true);
});
$app.addEventListener('focusout', (e) => {
  const k = jKey(e.target);
  if (k && jShared()) { presClear(); if (!jTimers.has(e.target)) jBase.delete(k); }
  renderWhenIdle();
});
dlg.addEventListener('close', () => { if (renderLater) renderWhenIdle(); });

// Passage à la v60 (une seule fois) : les personnages encore sans groupe étaient joués dans le groupe affiché
if (!localStorage.getItem('dragonbane.v60link')) {
  localStorage.setItem('dragonbane.v60link', '1');
  const gid = group.shared?.id;
  if (gid && group.list.find((r) => r.id === gid)?.role !== 'mj') store.list().forEach((c) => { if (!c.groupId) { c.groupId = gid; store.save(); } });
}
// Au lancement, le groupe affiché suit le personnage (sauf en mode MJ)
{
  const c = store.current();
  if (c && !ui.mjActive) {
    if (c.groupId && group.list.some((r) => r.id === c.groupId)) group.switchTo(c.groupId); else if (!c.groupId) group.deactivate();
  }
}
render();
store.sync();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// Pour le débogage dans la console
window.__db = { store, R, getPath, group, ui, render };
