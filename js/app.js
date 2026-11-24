import * as R from './rules.js';
import { store } from './store.js';

// ================= Utilitaires =================
const $app = document.getElementById('app');
const dlg = document.getElementById('dlg');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const C = () => store.current();
const num = (v) => (v === '' || v == null || isNaN(+v) ? 0 : +v);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const fmtDate = (t) => new Date(t).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });

const ICONS = {
  sheet: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h7M9 9h3"/>',
  sword: '<path d="M20 4l-.6 3.4L10 16.8 7.2 14 16.6 4.6z"/><path d="M5.2 12.4l6.4 6.4"/><path d="M8.4 15.6 4.2 19.8"/><circle cx="3.6" cy="20.4" r=".9"/>',
  wand: '<path d="M4 20L15 9"/><path d="M17 3v3M15.5 4.5h3M20 8v2M19 9h2M13 4v1.5M12.2 4.8h1.6"/>',
  bag: '<path d="M9 7.5h6"/><path d="M9.2 7.5C5.5 9.5 4 12.6 4 15.5 4 19 6.8 21 12 21s8-2 8-5.5c0-2.9-1.5-6-5.2-8"/><path d="M9.2 7.5 7.5 3.8c1.6.7 3 .9 4.5.9s2.9-.2 4.5-.9l-1.7 3.7"/><circle cx="12" cy="14.5" r="2.2"/>',
  up: '<path d="M12 3l7 7h-4v6H9v-6H5z"/><path d="M8 21h8"/>',
  book: '<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z"/>',
  cloud: '<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z"/>',
  dots: '<circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
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
  ['prog', 'Progrès', 'up'], ['carnet', 'Carnet', 'book'],
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
}

function topbar(c) {
  const sub = [R.kinName(c), R.profName(c), R.AGE[c.age]?.name].filter(Boolean).join(' · ');
  return `<header class="topbar">
    <button class="who" data-act="characters" aria-label="Changer de personnage">
      <span class="crest">${esc((c.name || '?').trim().charAt(0).toUpperCase())}</span>
      <span class="who-txt"><div class="who-name">${esc(c.name || 'Sans nom')}</div><div class="who-sub">${esc(sub || 'Touche pour gérer tes personnages')}</div></span>
    </button>
    <button class="mode-toggle mode-${ui.mode}" data-act="modeMenu" aria-label="Mode : ${MODES[ui.mode].label}">${icon(MODES[ui.mode].icon)}<span>${MODES[ui.mode].label}</span></button>
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
    <div class="vital conds" data-act="tab" data-tab="combat">${conds.length ? conds.map((a) => `<span class="cond-pill">${a.cond}</span>`).join('') : '<span class="vk">Aucun état</span>'}</div>
  </div>`;
}

// ---------- Fiche ----------
function viewFiche(c) {
  const attrs = R.ATTRS.map(({ key, name, cond }) => {
    const v = c.attrs[key];
    const on = c.conditions[key];
    return `<button class="attr ${on ? 'cond' : ''}" data-act="attr" data-k="${key}" title="${name}${on ? ` — ${cond} : désavantage` : ''}">
      <span class="ak">${key}</span><span class="av">${v}</span><span class="an">${name}</span>
      <span class="ac">${on ? `⚠ ${cond}` : `Base ${R.baseChance(v)}`}</span>
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
      <span class="li-main"><div class="li-title">${esc(a.name)}${a.source ? ` <span class="tag">${esc(a.source)}</span>` : ''}</div>${a.desc ? `<div class="li-sub">${esc(a.desc)}</div>` : ''}</span>
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
      <p class="small muted hint">${isFree() ? 'Touche un attribut pour modifier sa valeur.' : 'Touche un attribut pour lancer le D20 (réussite si ≤ valeur).'}</p>
    </section>
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
    <span class="smark">${s.mark ? '✦' : isProg() ? '<i class="empty-mark"></i>' : ''}</span>
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
      <div class="w-head"><b>${esc(w.name || 'Arme')}</b>${w.broken ? ' <span class="tag bad">brisée</span>' : ''}<button class="icon-btn small" data-act="editWeapon" data-i="${i}" aria-label="Modifier">${icon('edit')}</button></div>
      <div class="w-stats">
        <span><small>Compétence</small>${esc(sk?.name || '—')} <b>${sk?.value ?? '—'}</b></span>
        <span><small>Dégâts</small><b>${esc(w.damage || '—')}${bonus ? ` + ${bonus}` : ''}</b></span>
        ${w.range ? `<span><small>Portée</small>${esc(w.range)}</span>` : ''}
        ${w.durability ? `<span><small>Solidité</small>${esc(w.durability)}</span>` : ''}
        ${w.grip ? `<span><small>Prise</small>${esc(w.grip)}</span>` : ''}
      </div>
      ${w.features ? `<div class="small muted">${esc(w.features)}</div>` : ''}
      <div class="w-actions">
        <button class="btn small" data-act="attack" data-i="${i}" ${sk ? '' : 'disabled'}>${icon('d20')} Attaquer</button>
        <button class="btn small ghost" data-act="parry" data-i="${i}" ${sk ? '' : 'disabled'}>${icon('shield')} Parer</button>
        <button class="btn small gold" data-act="damage" data-i="${i}" ${w.damage ? '' : 'disabled'}>Dégâts</button>
      </div>
    </div>`;
  }).join('') || '<div class="empty">Aucune arme.</div>';

  const armor = (k, label) => {
    const a = c[k];
    return `<button class="list-item" data-act="editArmor" data-k="${k}">
      <span class="badge ${a.rating ? '' : 'soft'}">${a.rating || 0}</span>
      <span class="li-main"><div class="li-title">${esc(a.name || label)}</div><div class="li-sub">${a.banes ? `Désavantage : ${esc(a.banes)}` : 'Aucun désavantage'}</div></span>
    </button>`;
  };

  const esquive = c.skills.find((s) => s.id === 'esquive');
  return `<div class="grid combat">
    ${pool('hp', 'Points de vie', c.hp.cur, hpMax, 'hp')}
    ${pool('wp', 'Points de volonté', c.wp.cur, wpMax, 'wp')}
    <section class="card">
      <h2>Protection</h2>
      <div class="armor-total"><span>Valeur d’armure</span><b>${R.armorTotal(c)}</b></div>
      ${armor('armor', 'Armure')}
      ${armor('helmet', 'Casque')}
    </section>
    ${death}
    <section class="card span-all">
      <h2>États</h2>
      <div class="conds">${conds}</div>
      <p class="small muted hint">Un état donne un désavantage aux jets de l’attribut indiqué et des compétences qui en dépendent.</p>
    </section>
    <section class="card span-2">
      <h2>Armes</h2>
      ${weapons}
      <div class="add-row"><button class="btn ghost small" data-act="editWeapon" data-i="-1">${icon('plus')} Ajouter une arme</button>
      ${esquive ? `<button class="btn ghost small" data-act="skill" data-id="esquive" data-roll="1">${icon('d20')} Esquiver (${esquive.value})</button>` : ''}</div>
    </section>
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
      <div class="dice-btns">${[4, 6, 8, 10, 12, 20].map((n) => `<button class="die-btn" data-act="freeRoll" data-e="D${n}">D${n}</button>`).join('')}
        <button class="die-btn wide" data-act="freeRoll" data-e="">Autre…</button></div>
    </section>
  </div>`;
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
  return `<div class="grid two">
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
      <p class="small muted">Limite : FOR ÷ 2 (arrondi au supérieur)${c.backpack ? ' + 2 (sac à dos)' : ''}. Les armes à portée de main (3 au plus), l’armure et le casque portés ne comptent pas. 4 rations = 1 objet.${used > lim ? ' <b class="bad">Surchargé : jet de FOR pour avancer.</b>' : ''}${c.weapons.length > 3 ? ` <b class="bad">${c.weapons.length} armes : 3 au plus à portée de main, range les autres dans l’équipement.</b>` : ''}</p>
      <label class="check"><input type="checkbox" data-act="toggleBackpack" ${c.backpack ? 'checked' : ''}><span>Sac à dos (+2)</span></label>
    </section>
    <section class="card span-all">
      <h2>Équipement</h2>
      ${items}
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

const VIEWS = { fiche: viewFiche, combat: viewCombat, magie: viewMagie, sac: viewSac, prog: viewProg, carnet: viewCarnet };

// ================= Lanceur de dés =================
// Jet de D20 sous une valeur : avantages/désavantages, Dragon (1), Démon (20), forcer le jet.
// Deux façons de jouer : l'appli lance le dé, ou tu lances tes vrais dés et tu entres le résultat.
const realDice = () => localStorage.getItem('dragonbane.realDice') === '1';
const setRealDice = (on) => localStorage.setItem('dragonbane.realDice', on ? '1' : '0');

// Résultat d'un vrai dé : même forme que R.rollD20
function manualResult(v, target, boons, banes) {
  const dragon = v === 1; const demon = v === 20;
  return { dice: [v], kept: v, net: boons - banes, dragon, demon, success: dragon || (!demon && v <= target), target, manual: true };
}

function openRoll({ title, target, attr = null, skill = null, weapon = null, onResult = null, note = '', noPush = false, once = false }) {
  const c = C();
  const reasons = [];
  if (attr && c.conditions[attr]) reasons.push(`${R.ATTR[attr].cond}`);
  if (skill) R.armorBanes(c, skill).forEach((n) => reasons.push(n));
  const st = { boons: 0, banes: reasons.length ? 1 : 0, res: null, pushed: false, awaitPush: null, dmg: null, msg: '' };
  const dmgExpr = () => {
    if (!weapon) return '';
    const bonus = weapon.bonus ? R.damageBonus(c.attrs[weapon.bonus]) : '';
    return `${weapon.damage}${bonus ? `+${bonus}` : ''}`;
  };

  const draw = () => {
    const r = st.res;
    const real = realDice();
    const free = R.ATTRS.filter((a) => !c.conditions[a.key]);
    const canPush = !noPush && r && !r.success && !r.demon && !st.pushed && free.length;
    const net = st.boons - st.banes;
    const verdict = !r ? '' : r.dragon ? '<div class="verdict dragon">Dragon !</div>' : r.demon ? '<div class="verdict demon">Démon !</div>'
      : r.success ? '<div class="verdict ok">Réussite</div>' : '<div class="verdict ko">Échec</div>';
    const showEntry = real && (!r || !once);
    const howTo = net > 0 ? 'Lance <b>2 D20</b> et garde le <b>plus petit</b>.' : net < 0 ? 'Lance <b>2 D20</b> et garde le <b>plus grand</b>.' : 'Lance <b>1 D20</b>.';
    dlg.innerHTML = `<div class="card roll">
      <h2>${esc(title)}</h2>
      <div class="dice-mode">
        <button class="${real ? '' : 'on'}" data-r="mode" data-v="0">${icon('d20')} Dés de l’appli</button>
        <button class="${real ? 'on' : ''}" data-r="mode" data-v="1">✋ Mes dés</button>
      </div>
      <div class="roll-target">Réussite sur <b>${target}</b> ou moins</div>
      ${note ? `<p class="small muted center">${note}</p>` : ''}
      <div class="bb">
        <div class="bb-col"><span>Avantages</span><div class="step"><button data-r="boon" data-d="-1">−</button><span class="val">${st.boons}</span><button data-r="boon" data-d="1">+</button></div></div>
        <div class="bb-col"><span>Désavantages</span><div class="step"><button data-r="bane" data-d="-1">−</button><span class="val">${st.banes}</span><button data-r="bane" data-d="1">+</button></div></div>
      </div>
      ${reasons.length ? `<p class="small center bad">Désavantage : ${esc(reasons.join(', '))}</p>` : ''}
      <div class="roll-zone ${real && !r ? 'compact' : ''}">
        ${r ? `<div class="dice">${r.dice.map((v, i) => `<span class="die ${r.dice.length > 1 && v !== r.kept ? 'drop' : ''} ${v === 1 ? 'dragon' : v === 20 ? 'demon' : ''}" style="animation-delay:${i * 80}ms">${v}</span>`).join('')}</div>${verdict}`
          : real ? '' : `<div class="dice idle"><span class="die">${icon('d20')}</span></div>`}
        ${st.msg ? `<p class="small center">${st.msg}</p>` : ''}
        ${st.dmg ? `<div class="dmg"><span>Dégâts</span><b>${st.dmg.total}</b><small>${esc(st.dmg.detail)}</small></div>` : ''}
        ${weapon && r?.success && real ? `<p class="center">Dégâts à lancer : <b>${esc(dmgExpr().replace(/\+/g, ' + '))}</b></p>` : ''}
      </div>
      ${showEntry ? `<div class="manual">
        <p class="small center">${st.awaitPush ? '<b>Jet forcé :</b> relance tes dés. ' : r ? 'Nouveau jet : ' : ''}${howTo}</p>
        <div class="manual-row">
          <input type="number" inputmode="numeric" min="1" max="20" id="manualVal" placeholder="Résultat">
          <button class="btn" data-r="manual">Valider</button>
        </div>
        <div class="manual-row">
          <button class="btn gold small" data-r="manual" data-v="1">Dragon (1)</button>
          <button class="btn small demon-btn" data-r="manual" data-v="20">Démon (20)</button>
        </div>
      </div>` : ''}
      ${canPush ? `<div class="push"><p class="small"><b>Forcer le jet ?</b> ${real ? 'Choisis l’état que tu acceptes, puis relance tes dés :' : 'Relance en acceptant un état :'}</p><div class="conds small">${free.map((a) => `<button class="cond-chip" data-r="push" data-k="${a.key}"><b>${a.cond}</b><small>${a.key}</small></button>`).join('')}</div></div>` : ''}
      <div class="dlg-actions">
        <button class="btn ghost" data-r="close">Fermer</button><span class="spacer"></span>
        ${weapon && r?.success && !real ? `<button class="btn gold" data-r="dmg">Dégâts</button>` : ''}
        ${real || (once && r) ? '' : `<button class="btn" data-r="roll">${icon('d20')} ${r ? 'Nouveau jet' : 'Lancer'}</button>`}
      </div>
    </div>`;
    const inp = dlg.querySelector('#manualVal');
    if (inp) {
      inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); dlg.querySelector('[data-r=manual]:not([data-v])').click(); } };
      if (!matchMedia('(pointer: coarse)').matches) inp.focus();
    }
  };
  // Applique un résultat (appli ou vrai dé) : coche automatique, messages, suite propre au jet
  const apply = (res) => {
    st.res = res;
    st.dmg = null; st.msg = '';
    if (skill && (res.dragon || res.demon) && !skill.mark) {
      skill.mark = 'jeu';
      st.msg = `✦ ${esc(skill.name)} est cochée pour l’amélioration.`;
      commit(false);
    }
    if (res.dragon && weapon) st.msg += ' Coup critique : effet bonus au choix.';
    if (res.demon && skill?.kind === 'magie') st.msg += ' Incident magique !';
    if (st.awaitPush) { st.msg = `Jet forcé : tu es ${R.ATTR[st.awaitPush].cond.toLowerCase()}. ${st.msg}`; st.awaitPush = null; }
    onResult?.(res, st);
  };
  dlg.onclick = (e) => {
    const b = e.target.closest('[data-r]');
    if (!b) return;
    const k = b.dataset.r;
    if (k === 'close') { dlg.close(); render(); return; }
    if (k === 'mode') setRealDice(b.dataset.v === '1');
    if (k === 'boon') st.boons = Math.max(0, st.boons + +b.dataset.d);
    if (k === 'bane') st.banes = Math.max(0, st.banes + +b.dataset.d);
    if (k === 'roll') { st.pushed = false; apply(R.rollD20(target, st.boons, st.banes)); }
    if (k === 'manual') {
      const v = b.dataset.v ? +b.dataset.v : Math.round(num(dlg.querySelector('#manualVal')?.value));
      if (v < 1 || v > 20) { toast('Entre un résultat entre 1 et 20'); return; }
      if (!st.awaitPush) st.pushed = false;
      apply(manualResult(v, target, st.boons, st.banes));
    }
    if (k === 'push') {
      c.conditions[b.dataset.k] = true; st.pushed = true;
      commit(false);
      if (realDice()) { st.awaitPush = b.dataset.k; st.res = null; st.msg = ''; }
      else { st.awaitPush = b.dataset.k; apply(R.rollD20(target, st.boons, st.banes)); }
    }
    if (k === 'dmg') st.dmg = R.rollExpr(dmgExpr());
    draw();
  };
  dlg.onclose = () => { dlg.onclose = null; render(); };
  draw();
  if (!dlg.open) dlg.showModal();
}

function freeRoll(expr) {
  const go = (e) => {
    const r = R.rollExpr(e);
    openDialog({ title: e.toUpperCase(), body: `<div class="dmg big"><b>${r.total}</b><small>${esc(r.detail)}</small></div>`,
      actions: [closeBtn, { label: 'Relancer', primary: true, onClick: () => { go(e); return false; } }] });
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
function editWeapon(i) {
  const c = C(); const w = c.weapons[i] || { name: '', skill: 'epees', damage: 'D8', bonus: 'FOR', range: '', durability: '', grip: '1 main', features: '', weight: 1, broken: false };
  const weaponSkills = c.skills.filter((s) => s.kind === 'arme' || s.kind === 'autre').map((s) => [s.id, `${s.name} (${s.value})`]);
  openDialog({
    title: i >= 0 ? w.name || 'Arme' : 'Nouvelle arme',
    body: `<div class="fields">
      ${F.text('name', 'Nom', w.name, 'full', 'autofocus')}
      ${F.select('skill', 'Compétence', w.skill, weaponSkills)}
      ${F.text('damage', 'Dégâts', w.damage, '', 'placeholder="2D6"')}
      ${F.select('bonus', 'Bonus aux dégâts', w.bonus, [['FOR', 'FOR (contact)'], ['AGI', 'AGI (distance)'], ['', 'Aucun']])}
      ${F.select('grip', 'Prise', w.grip, ['1 main', '2 mains', ''])}
      ${F.text('range', 'Portée', w.range, '', 'placeholder="2 ou 20…"')}
      ${F.text('durability', 'Solidité', w.durability)}
      ${F.text('features', 'Particularités', w.features, 'full', 'placeholder="Perforant, crochet, lancer…"')}
      ${F.check('broken', 'Arme brisée', w.broken, 'full')}
    </div>`,
    actions: [
      ...(i >= 0 ? [{ label: icon('trash'), cls: 'ghost', onClick: () => { c.weapons.splice(i, 1); commit(); } }, 'spacer'] : []),
      cancel,
      { label: 'Enregistrer', primary: true, onClick: (f) => {
        Object.assign(w, { name: f.name.value.trim() || 'Arme', skill: f.skill.value, damage: f.damage.value.trim(), bonus: f.bonus.value, grip: f.grip.value, range: f.range.value.trim(), durability: f.durability.value.trim(), features: f.features.value.trim(), broken: f.broken.checked });
        if (i < 0) c.weapons.push(w);
        commit();
      } },
    ],
  });
}

function editSpell(i, list = 'spells') {
  const c = C(); const trick = list === 'tricks';
  const defSchool = c.school || R.MAGIC_SKILLS.find((id) => c.skills.find((s) => s.id === id)?.trained) || 'general';
  const s = c[list][i] || { name: '', school: defSchool, rank: 1, req: '', time: 'Action', range: '', duration: '', desc: '', power: true, prepared: false };
  openDialog({
    title: i >= 0 ? s.name : trick ? 'Nouveau tour de magie' : 'Nouveau sort',
    body: `<div class="fields">
      ${F.text('name', 'Nom', s.name, 'full', 'autofocus')}
      ${F.select('school', 'École', s.school, schoolOpts)}
      ${trick ? '' : `${F.num('rank', 'Rang', s.rank)}
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
        if (!trick) Object.assign(s, { rank: num(f.rank.value) || 1, time: f.time.value.trim(), range: f.range.value.trim(), duration: f.duration.value.trim(), req: f.req.value.trim(), power: f.power.checked });
        if (i < 0) c[list].push(s);
        commit();
      } },
    ],
  });
}

function editItem(i) {
  const c = C(); const it = c.items[i] || { name: '', qty: 1, weight: 1, notes: '', worn: false };
  openDialog({
    title: i >= 0 ? it.name : 'Nouvel objet',
    body: `<div class="fields">
      ${F.text('name', 'Nom', it.name, 'full', 'autofocus')}
      ${F.num('qty', 'Quantité', it.qty)}
      ${F.num('weight', 'Encombrement (par unité)', it.weight)}
      ${F.area('notes', 'Notes', it.notes)}
      ${F.check('worn', 'Porté sur soi (ne compte pas : armure portée, vêtements…)', it.worn, 'full')}
    </div>`,
    actions: [
      ...(i >= 0 ? [{ label: icon('trash'), cls: 'ghost', onClick: () => { c.items.splice(i, 1); commit(); } }, 'spacer'] : []),
      cancel,
      { label: 'Enregistrer', primary: true, onClick: (f) => {
        Object.assign(it, { name: f.name.value.trim() || 'Objet', qty: Math.max(1, num(f.qty.value)), weight: num(f.weight.value), notes: f.notes.value.trim(), worn: f.worn.checked });
        if (i < 0) c.items.push(it);
        commit();
      } },
    ],
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

function showAbility(i) {
  const c = C(); const a = c.abilities[i];
  const cost = parseInt(a.wp, 10);
  openDialog({
    title: a.name,
    body: `${a.source || a.req ? `<p class="small muted">${[a.source, a.req && `Prérequis : ${a.req}`].filter(Boolean).map(esc).join(' · ')}</p>` : ''}
      <p>${esc(a.desc) || '<i class="muted">Pas de description. Passe en mode libre pour la compléter.</i>'}</p>
      ${cost ? `<p class="small">Coût : <b>${cost} PVol</b> · tu en as ${c.wp.cur}.</p>` : ''}`,
    actions: [closeBtn, ...(cost ? [{ label: `Utiliser (−${cost} PVol)`, primary: true, onClick: () => {
      if (c.wp.cur < cost) { toast('Pas assez de points de volonté'); return false; }
      c.wp.cur -= cost; commit(); toast(`${a.name} : −${cost} PVol`);
    } }] : [])],
  });
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
        <p class="small muted">Tes personnages sont toujours enregistrés sur l’appareil. Connecté à Google, ils sont aussi sauvegardés en ligne et retrouvés sur tes autres appareils.</p>`,
      actions: [
        ...(store.userEmail ? [{ label: 'Se déconnecter', cls: 'ghost', onClick: () => { store.disconnect().then(render); } }] : []),
        { label: 'Configuration', cls: 'ghost', onClick: () => { setTimeout(A.firebaseConfig); } },
        'spacer', closeBtn,
        { label: store.userEmail ? 'Synchroniser' : 'Se connecter avec Google', primary: true, onClick: () => { store.sync({ interactive: true }); } },
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
        <button type="button" data-m="toggleDice">${icon('d20')} <span><b>Dés : ${realDice() ? 'mes vrais dés' : 'lancés par l’appli'}</b><small>Toucher pour passer ${realDice() ? 'aux dés de l’appli' : 'à tes vrais dés (tu entres le résultat)'}</small></span></button>
      </div>
      <p class="small muted center">Fiche Dragonbane · fonctionne hors ligne</p>`,
      actions: [closeBtn],
      onOpen: (f) => f.querySelectorAll('[data-m]').forEach((b) => { b.onclick = () => { dlg.close(); setTimeout(() => A[b.dataset.m]()); }; }),
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
  toggleDice() { setRealDice(!realDice()); toast(realDice() ? 'Mes vrais dés : tu entres le résultat du D20' : 'Les dés sont lancés par l’appli'); },
  deleteCharacter() {
    const c = C();
    confirmDialog('Supprimer le personnage', `Supprimer <b>${esc(c.name)}</b> sur tous tes appareils ? Pense à l’exporter d’abord si tu veux le garder.`, 'Supprimer', () => { store.remove(c.id); ui.mode = 'normal'; render(); toast('Personnage supprimé'); });
  },
  exportAll() { download(`dragonbane-${new Date().toISOString().slice(0, 10)}.json`, store.exportAll()); },
  exportOne() { const c = C(); download(`${R.norm(c.name).replace(/[^a-z0-9]+/g, '-') || 'personnage'}.json`, store.exportOne(c)); },
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
  addSkill() {
    const c = C();
    const s = { id: R.uid(), name: 'Nouvelle compétence', attr: 'INT', kind: 'autre', trained: false, value: R.baseChance(c.attrs.INT), mark: false, custom: true };
    c.skills.push(s);
    editSkill(s);
  },
  addAbility() { editAbility(-1); },
  ability(el) { const i = +el.dataset.i; if (isFree()) editAbility(i); else showAbility(i); },

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
    openRoll({ title: `Attaque — ${w.name}`, target: s.value, attr: s.attr, skill: s, weapon: w });
  },
  parry(el) {
    const c = C(); const w = c.weapons[+el.dataset.i]; const s = c.skills.find((x) => x.id === w.skill);
    openRoll({ title: `Parade — ${w.name}`, target: s.value, attr: s.attr, skill: s, note: 'Si la parade réussit, l’arme encaisse les dégâts : au-delà de sa solidité, elle se brise.' });
  },
  damage(el) {
    const c = C(); const w = c.weapons[+el.dataset.i];
    const bonus = w.bonus ? R.damageBonus(c.attrs[w.bonus]) : '';
    freeRoll(`${w.damage}${bonus ? `+${bonus}` : ''}`);
  },
  editWeapon(el) { editWeapon(+el.dataset.i); },
  editArmor(el) {
    const c = C(); const k = el.dataset.k; const a = c[k];
    openDialog({
      title: k === 'armor' ? 'Armure' : 'Casque',
      body: `<div class="fields">
        ${F.text('name', 'Nom', a.name, 'full', `autofocus placeholder="${k === 'armor' ? 'Cotte de mailles…' : 'Heaume…'}"`)}
        ${F.num('rating', 'Valeur d’armure', a.rating)}
        ${F.text('banes', 'Désavantage sur', a.banes, 'full', `placeholder="${k === 'armor' ? 'Discrétion, Esquive' : 'Vigilance'}"`)}
      </div><p class="small muted">Sépare les compétences par des virgules : le lanceur de dés ajoutera le désavantage automatiquement.</p>`,
      actions: [cancel, { label: 'Enregistrer', primary: true, onClick: (f) => {
        Object.assign(a, { name: f.name.value.trim(), rating: num(f.rating.value), banes: f.banes.value.trim() }); commit();
      } }],
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
  advanceRolls(el, e, manual = null) {
    const c = C();
    const marked = c.skills.filter((s) => s.mark);
    if (!marked.length) return;
    // Vrais dés : on demande d'abord le résultat du D20 pour chaque compétence cochée
    if (realDice() && !manual) {
      openDialog({
        title: 'Jets d’amélioration',
        body: `<p class="small">Lance un D20 par compétence : si le résultat est <b>supérieur</b> au niveau, elle gagne +1.</p>
          <div class="adv-list">${marked.map((s) => `<label class="adv"><span>${esc(s.name)}</span><input type="number" inputmode="numeric" min="1" max="20" name="r_${s.id}" placeholder="D20"><b>${s.value}</b></label>`).join('')}</div>
          <p class="small muted">Une case vide est lancée par l’appli.</p>`,
        actions: [
          { label: 'Dés de l’appli', cls: 'ghost', onClick: () => { setTimeout(() => A.advanceRolls(null, null, {})); } },
          'spacer', cancel,
          { label: 'Valider', primary: true, onClick: (f) => {
            const vals = {};
            for (const s of marked) {
              const raw = f[`r_${s.id}`].value.trim();
              if (!raw) continue;
              const v = Math.round(num(raw));
              if (v < 1 || v > 20) { toast(`${s.name} : entre un résultat entre 1 et 20`); return false; }
              vals[s.id] = v;
            }
            setTimeout(() => A.advanceRolls(null, null, vals));
          } },
        ],
      });
      return;
    }
    const prev = marked.map((s) => ({ id: s.id, value: s.value, mark: s.mark }));
    const results = marked.map((s) => {
      const roll = manual?.[s.id] ?? R.d(20);
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
      body: `<div class="adv-list">${results.map((r) => `<div class="adv ${r.up ? 'up' : ''}"><span>${esc(r.s.name)}</span><span class="die small ${r.roll === 1 ? 'dragon' : r.roll === 20 ? 'demon' : ''}">${r.roll}</span><b>${r.up ? `${r.before} → ${r.s.value}` : `${r.before}`}</b></div>`).join('')}</div>
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
  if (!el.dataset.bind) return;
  setPath(C(), el.dataset.bind, el.hasAttribute('data-num') ? num(el.value) : el.value);
  commit(false);
});
$app.addEventListener('change', (e) => {
  const el = e.target;
  if (el.type === 'checkbox' && el.dataset.act) { A[el.dataset.act]?.(el); return; }
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
});

render();
store.sync();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

// Pour le débogage dans la console
window.__db = { store, R, getPath };
