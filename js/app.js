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
const C = () => store.current();
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
  store.save();
  if (rerender) render();
}

// ================= État de l'interface =================
const ui = {
  tab: localStorage.getItem('dragonbane.tab') || 'fiche',
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
      <p class="small muted" style="margin:14px 0 0">Tu as déjà un personnage sur un autre appareil ? Touche le <b>nuage</b> pour te connecter : il reviendra tout seul. Tu as un fichier ? Menu <b>⋮</b> › Importer.</p>
    </section></main>
  </div>`;
  if (!welcomeOpened && !dlg.open) { welcomeOpened = true; setTimeout(() => { if (!C() && !dlg.open) A.newCharacter(); }, 300); }
}

function render() {
  const c = C();
  if (!c) { renderWelcome(); return; }
  if (ui.tab === 'magie' && !R.isCaster(c)) ui.tab = 'fiche';
  const y = window.scrollY;
  const marked = c.skills.filter((s) => s.mark).length;
  $app.innerHTML = `<div class="shell mode-${ui.mode}">
    ${topbar(c)}
    ${isFree() ? `<div class="banner free-banner">${icon('edit')}<span><b>Mode libre</b> — touche une valeur pour la changer, sans jet ni contrainte.</span><button class="btn small ghost-dark" data-act="setMode" data-m="normal">Terminer</button></div>` : ''}
    ${isProg() ? `<div class="banner prog-banner">${icon('star')}<span><b>Progression</b> — ${marked} compétence${marked > 1 ? 's' : ''} cochée${marked > 1 ? 's' : ''}${c.pendingMarks ? `, <b>${c.pendingMarks}</b> coche${c.pendingMarks > 1 ? 's' : ''} de fin de séance à placer` : ''}. Touche une compétence pour la cocher.</span>
      <button class="btn small gold" data-act="advanceRolls" ${marked ? '' : 'disabled'}>${icon('d20')} Jets d’amélioration</button></div>` : ''}
    <main>${VIEWS[ui.tab](c)}</main>
    <nav class="tabs">${TABS.filter(([k]) => k !== 'magie' || R.isCaster(c)).map(([k, l, i]) => `<button class="${ui.tab === k ? 'active' : ''}" data-act="tab" data-tab="${k}">${icon(i)}<span>${l}</span></button>`).join('')}</nav>
  </div>`;
  window.scrollTo(0, y);
  if (ui.tab === 'biblio' && ui.libSearch) filterLib();
  if (ui.tab === 'journal') { afterJournal(); if (ui.jSearch) filterJournal(); } else { sketchCtl = null; stopSketchWatch(); }
}

function topbar(c) {
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
const author = () => C()?.name || store.userEmail || 'Joueur';
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
const carrierIcon = (k) => icon(carrierKind(k));
const carrierEmoji = (k) => ({ monture: '🐴', coffre: '🧰', barque: '🛶' })[carrierKind(k)] || '🛞';
const pullers = (g, v) => v.pulledBy.map((id) => g.carriers.find((k) => k.id === id)).filter(Boolean);
const attachedTo = (g, a) => g.carriers.find((v) => v.pulledBy.includes(a.id));
const fmtWhen = (t) => new Date(t).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

function shareCard() {
  const sh = group.shared;
  if (!sh) {
    return `<section class="card span-all share">
      <h2>Groupe partagé</h2>
      <p class="small">Ce groupe n’est pour l’instant que sur ton compte. Partage-le : chaque joueur verra et modifiera la même caisse et le même matériel depuis son téléphone, et le journal dira qui a fait quoi.</p>
      <div class="add-row center-row"><button class="btn" data-act="gShareCreate">${icon('users')} Partager ce groupe</button><button class="btn ghost" data-act="gShareJoin">Rejoindre avec un code</button></div>
    </section>`;
  }
  const members = Object.values(sh.members || {});
  const err = group.error; const pend = group.pending;
  const status = pend ? `<p class="small ${err ? 'bad' : 'muted'}">⏳ ${pend} modification${pend > 1 ? 's' : ''} en attente d’envoi${err ? ` : ${esc(err)}` : ''}</p>`
    : err ? `<p class="small bad">${esc(err)}</p>` : '<p class="small good">À jour : tout le groupe voit la même chose.</p>';
  return `<section class="card span-all share">
    <div class="share-head"><span class="share-name"><b>${esc(sh.name)}</b><small>Groupe partagé · code <b class="code">${esc(sh.id)}</b></small></span>
      <button class="btn small ghost" data-act="gShareCode">${icon('users')} Inviter</button></div>
    ${members.length ? `<p class="small muted">Membres : ${members.map(esc).join(', ')}</p>` : ''}
    ${status}
  </section>`;
}

function viewGroupe(c) {
  const g = G();
  const lastUndo = g.log.find((e) => e.undo && !e.undone);
  const shown = ui.logAll ? g.log : g.log.slice(0, 25);
  const log = shown.map((e) => `<div class="log-row ${e.undone ? 'undone' : ''} ${e.pending ? 'pending' : ''}">
      <span class="log-date">${fmtWhen(e.date)}</span>
      <span class="log-txt">${e.pending ? '⏳ ' : ''}${esc(e.text ?? e.label ?? '')}${e.who ? ` <span class="muted">· ${esc(e.who)}</span>` : ''}</span>
      <span class="log-amt ${e.sign === 0 ? 'muted' : e.sign < 0 ? 'bad' : 'good'}">${e.amount ? `${e.sign === 0 ? '' : e.sign < 0 ? '−' : '+'}${fmtMoney(e.amount)}` : ''}</span>
      ${e === lastUndo ? `<button class="icon-btn small" data-act="gUndo" data-id="${e.id}" title="Annuler">${icon('undo')}</button>` : '<span></span>'}
    </div>`).join('') || '<div class="empty">Aucune modification pour l’instant.</div>';

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
    <section class="card span-all journal">
      <h2>Journal</h2>
      ${log}
      ${g.log.length > 25 ? `<div class="add-row center-row"><button class="btn ghost small" data-act="gLogAll">${ui.logAll ? 'Réduire' : `Tout afficher (${g.log.length})`}</button></div>` : ''}
    </section>
  </div>`;
}

// Recette / dépense de la caisse, avec transfert possible vers ou depuis la bourse du personnage
function groupMoneyDialog(sign) {
  const c = C(); const g = G();
  openDialog({
    title: sign > 0 ? 'Recette' : 'Dépense',
    body: `<div class="fields three">${F.num('or', 'Or', '', '', 'autofocus')}${F.num('argent', 'Argent', '')}${F.num('cuivre', 'Cuivre', '')}</div>
      <div class="fields">${F.text('label', 'Motif', '', 'full', `placeholder="${sign > 0 ? 'Butin, vente, récompense…' : 'Auberge, fourrage, réparation…'}"`)}</div>
      ${F.check('transfer', sign > 0 ? `Pris dans la bourse de ${esc(c.name)} (${fmtMoney(totalCopper(c.money))})` : `Donné à ${esc(c.name)} (va dans sa bourse)`, false)}
      ${sign < 0 ? `<p class="small muted">La caisse contient ${fmtMoney(totalCopper(g.money))}. La monnaie est rendue automatiquement si besoin.</p>` : ''}`,
    actions: [cancel, { label: sign > 0 ? 'Ajouter à la caisse' : 'Retirer de la caisse', primary: true, onClick: (f) => {
      const coins = { or: num(f.or.value), argent: num(f.argent.value), cuivre: num(f.cuivre.value) };
      const amount = totalCopper(coins);
      if (!amount) { toast('Indique un montant'); return false; }
      const tr = f.transfer.checked;
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
      <div class="group-notes"><h3>Notes du groupe <button class="icon-btn small" data-act="gNotes" aria-label="Modifier les notes">${icon('edit')}</button></h3>
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
  const dests = [['', '— Ne pas déplacer —'], ...g.carriers.filter((x) => x.id !== k.id).map((x) => [`k:${x.id}`, `${carrierEmoji(x)} ${x.name}`]), [`c:${c.id}`, `🎒 Sac de ${c.name}`]];
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
        try { await group.create(name, seed, author()); dlg.close(); render(); shareCodeDialog(); } catch (e) { toast(e.message || 'Création impossible'); }
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
        try { const name = await group.join(f.code.value); dlg.close(); render(); toast(`Bienvenue dans « ${name} »`); } catch (e) { toast(e.message || 'Code refusé'); }
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
      { label: 'Quitter', cls: 'ghost', onClick: () => { setTimeout(() => confirmDialog('Quitter le groupe', `Quitter « ${esc(sh.name)} » ? Tu retrouveras ton groupe personnel. Tu pourras revenir avec le code <b>${esc(sh.id)}</b>.`, 'Quitter', async () => { await group.leave(); render(); toast('Groupe quitté'); })); } },
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
      <div class="fields">
        <div class="field full"><label>Faiblesse</label>${bind('weakness', c.weakness, 'area', 'rows="2"')}</div>
        <div class="field full"><label>Apparence</label>${bind('appearance', c.appearance, 'area', 'rows="2"')}</div>
        <div class="field full"><label>Souvenir</label>${bind('memento', c.memento)}</div>
      </div>
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

// ---------- Journal : une page par session (rubriques, pistes, PNJ, croquis au stylet) ----------
// Deux sources, même code : le journal personnel (dans la fiche) ou celui du groupe partagé (tout le monde
// le lit et le complète). Toute modification est une opération (journal-ops.js) : appliquée à la fiche,
// ou envoyée au groupe comme la caisse (avec son auteur, en attente hors ligne).
// Images et croquis : media.js (sur l'appareil, ou groups/{code}/media pour le groupe).
const todayISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const fmtDay = (iso) => { const d = iso ? new Date(`${iso}T12:00`) : null; return d && !isNaN(d) ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''; };
const jShared = () => !!group.shared;
const J = () => (jShared() ? group.state : C());
function jApply(op, rerender = true) {
  try {
    if (jShared()) { group.apply(op, author()); if (rerender) render(); } else { applyJournalOp(C(), op); commit(rerender); }
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
    if (el.dataset.jf) { const [sid, field] = el.dataset.jf.split('|'); jApply({ t: 'j:set', sid, field, value: el.value }, now && ['title', 'date'].includes(field)); }
    if (el.dataset.jt) { const [sid, tid] = el.dataset.jt.split('|'); jApply({ t: 'j:todoSet', sid, tid, v: { t: el.value } }, false); }
  };
  if (now) save(); else jTimers.set(el, setTimeout(save, 1200));
}

const sessionText = (s, j) => [s.title, s.summary, s.npcs, s.places, s.loot, C()?.secret?.s?.[s.id], ...(s.todos || []).map((t) => t.t), ...(s.npcIds || []).map((id) => npcOf(j, id)?.name)].join(' ');
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
    return `<article class="npc-card" data-search="${esc(R.norm([n.name, n.role, n.place, n.notes].join(' ')))}">
      <button class="npc-main" data-act="npcOpen" data-id="${n.id}">
        ${npcFace(n)}
        <span class="npc-txt"><b>${esc(n.name)}</b><small>${esc(n.role || '')}</small></span>
        <span class="tag npc-att ${cls}">${att}</span>
      </button>
      ${n.place ? `<p class="small npc-place">📍 ${esc(n.place)}</p>` : ''}
      ${n.notes ? `<p class="small npc-notes">${esc(n.notes)}</p>` : ''}
      ${group.shared && C().secret.n[n.id] ? `<p class="small npc-notes npc-secret">🔒 ${esc(C().secret.n[n.id])}</p>` : ''}
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
  openDialog({
    title: isNew ? 'Nouveau PNJ' : cur.name,
    cls: 'npc-dlg',
    body: `<div class="npc-dlg-top">
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
        ${group.shared ? `<div class="field full j-secret"><label>🔒 Mes notes secrètes <small>visibles par toi seul</small></label><textarea name="secret" rows="2">${esc(C().secret.n[npc?.id] || '')}</textarea></div>` : ''}
      </div>
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
        // Note secrète : gardée dans ta fiche, jamais envoyée au groupe
        if (f.secret) { const c = C(); const t = f.secret.value.trim(); if (t) c.secret.n[nid] = t; else delete c.secret.n[nid]; c.updatedAt = Date.now(); store.save(); }
        if (isNew) jApply({ t: 'j:npcAdd', npc: { id: nid, ...v }, sid: linkTo });
        else jApply({ t: 'j:npcSet', nid, v });
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

let sketchCtl = null; // zone de dessin affichée
let sketchWatch = null; // suivi en direct du croquis (groupe)

function viewJournal(c) {
  const j = J(); const list = j.journal; const sh = group.shared;
  // Journal partagé : bandeau, erreurs d'images, et proposition de verser son journal personnel
  const mine = sh ? { s: c.journal.filter((s) => !list.some((x) => x.id === s.id)).length, n: c.npcs.filter((n) => !j.npcs.some((x) => x.id === n.id)).length } : null;
  const shareInfo = sh ? `<p class="small j-shared">${icon('users')} Journal partagé avec le groupe « ${esc(sh.name)} » : tout le monde le voit et le complète.</p>
      ${media.error() ? `<p class="small bad">${esc(media.error())}</p>` : ''}
      ${mine.s || mine.n ? `<button class="btn ghost small block" data-act="jImport">${icon('upload')} Verser mon journal perso (${mine.s} session${mine.s > 1 ? 's' : ''}, ${mine.n} PNJ)</button>` : ''}` : '';
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
  const jTabs = `<div class="filters j-tabs"><button class="chip ${ui.jView !== 'npcs' ? 'on' : ''}" data-act="jView" data-v="sessions">Sessions (${list.length})</button><button class="chip ${ui.jView === 'npcs' ? 'on' : ''}" data-act="jView" data-v="npcs">PNJ (${j.npcs.length})</button></div>`;
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
          <div class="field full"><label>Résumé</label>${jField(sid, 'summary', cur.summary, 'rows="6" placeholder="Ce qui s’est passé…"', true)}</div>
          <div class="field j-npcs"><label>PNJ rencontrés</label>
            <div class="npc-chips">${(cur.npcIds || []).map((id) => npcOf(j, id)).filter(Boolean).map((n) => `<span class="npc-chip att-${n.attitude || 'inconnu'}">
                <button data-act="npcOpen" data-id="${n.id}">${npcFace(n, 'mini')}${esc(n.name)}</button><button class="x" data-act="jNpcUnlink" data-id="${n.id}" aria-label="Retirer de la session">×</button></span>`).join('')}</div>
            <form class="quick-add" data-form="jNpc"><input name="n" list="npcNames" autocomplete="off" placeholder="Nom du PNJ (déjà croisé ou nouveau)"><button class="btn small" type="submit">${icon('plus')}</button></form>
            <datalist id="npcNames">${j.npcs.filter((n) => !(cur.npcIds || []).includes(n.id)).map((n) => `<option value="${esc(n.name)}">`).join('')}</datalist>
            ${cur.npcs ? `<label class="small muted">Notes</label>${jField(sid, 'npcs', cur.npcs, 'rows="2"', true)}` : ''}
          </div>
          ${J_FIELDS.map(([k, label, ph, rows]) => `<div class="field"><label>${label}</label>${jField(sid, k, cur[k], `rows="${rows}" placeholder="${ph}"`, true)}</div>`).join('')}
          ${sh ? `<div class="field full j-secret"><label>🔒 Mes notes secrètes <small>visibles par toi seul</small></label>${bind(`secret.s.${sid}`, c.secret.s[sid] || '', 'area', 'rows="3" placeholder="Ce que tu gardes pour toi : soupçons, plans, secrets de ton personnage…"')}</div>` : ''}
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

const VIEWS = { fiche: viewFiche, combat: viewCombat, magie: viewMagie, sac: viewSac, prog: viewProg, carnet: viewCarnet, journal: viewJournal, groupe: viewGroupe, biblio: viewBiblio };

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
      store.add(c);
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
  setMode(el) { ui.mode = el.dataset.m; render(); },
  modeMenu() {
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
    const cur = C();
    openDialog({
      title: 'Mes personnages',
      body: `<div class="menu-list">${store.list().map((c) => `<button type="button" data-id="${c.id}" class="${c.id === cur?.id ? 'on' : ''}"><span class="crest small">${esc((c.name || '?').charAt(0).toUpperCase())}</span><span><b>${esc(c.name || 'Sans nom')}</b><small>${esc([R.kinName(c), R.profName(c)].filter(Boolean).join(' · '))}</small></span></button>`).join('')}</div>`,
      actions: [closeBtn, { label: `${icon('plus')} Nouveau`, primary: true, onClick: () => { setTimeout(creationDialog); } }],
      onOpen: (f) => f.querySelectorAll('[data-id]').forEach((b) => { b.onclick = () => { store.select(b.dataset.id); ui.mode = 'normal'; dlg.close(); render(); }; }),
    });
  },
  newCharacter() { creationDialog(); },
  deleteCharacter() {
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
  npcNew() { npcDialog(null); },
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
  jImport() {
    const c = C();
    confirmDialog('Verser mon journal', `Copier tes ${c.journal.length} session(s) et ${c.npcs.length} PNJ dans le journal du groupe ? Les autres joueurs les verront. Ton journal personnel reste intact.`, 'Verser', async () => {
      toast('Copie des images et croquis…');
      const ids = [...c.journal.map((s) => s.sketch), ...c.npcs.map((n) => n.photo)].filter(Boolean);
      let failed = 0;
      for (const id of ids) { try { await media.copyToGroup(id); } catch { failed++; } }
      // Une image ou un croquis n'a pas pu être copié : on ne verse rien (on pourra réessayer, rien n'est perdu)
      if (failed) { toast(`Rien n’a été versé : ${failed} image(s) ou croquis non copiés (${media.error() || 'erreur'}). Réessaie une fois connecté.`); render(); return; }
      jApply({ t: 'j:import', journal: c.journal, npcs: c.npcs });
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
    openDialog({
      title: 'Notes du groupe',
      body: `<div class="fields">${F.area('notes', 'Notes', G().notes || '')}</div>`,
      actions: [cancel, { label: 'Enregistrer', primary: true, onClick: (f) => { if (f.notes.value.trim() !== (G().notes || '')) return gApply({ t: 'notes', v: f.notes.value.trim() }) && undefined; } }],
    });
  },
  gShareCreate() { shareCreateDialog(); },
  gShareJoin() { shareJoinDialog(); },
  gShareCode() { shareCodeDialog(); },
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
  if (el.dataset.jf || el.dataset.jt) { jSave(el, false); return; }
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

store.onStatus((st, info) => {
  const btn = document.getElementById('syncBtn');
  if (btn) { btn.className = `icon-btn sync-${st.state}`; btn.title = st.message; }
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
  if (info?.reloaded && !typing && !dlg.open) render();
  group.refresh();
});
// Groupe partagé : un autre joueur a modifié quelque chose
group.onChange(() => {
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
  if (['groupe', 'journal'].includes(ui.tab) && C() && !typing && !dlg.open && !document.querySelector('.sketch.full')) render();
});

render();
store.sync();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// Pour le débogage dans la console
window.__db = { store, R, getPath, group };
