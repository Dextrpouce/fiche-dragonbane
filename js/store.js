// Données : toujours enregistrées sur l'appareil d'abord, puis envoyées en ligne dès que possible.
import * as cloud from './cloud.js';
import { upgradeCharacter, newGroup, upgradeGroup } from './rules.js';
import { FIREBASE_CONFIG } from './config.js';

const DATA_KEY = 'dragonbane.data';
const META_KEY = 'dragonbane.meta';

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

const data = load(DATA_KEY, { characters: {}, deleted: {} });
const meta = load(META_KEY, { currentId: null, firebase: null, dirty: false, lastSync: 0, lastPush: 0 });
Object.values(data.characters).forEach(upgradeCharacter);
// Caisse et matériel du groupe (montures, véhicules) : un seul par compte
data.group = upgradeGroup(data.group || newGroup());
// Croquis du journal : rangés à part des personnages (un document chacun en ligne) pour ne pas alourdir les fiches.
// { id: { id, cid, strokes, updatedAt, deleted? } } — un croquis supprimé garde une trace (deleted) pour la synchro.
data.sketches ??= {};

let syncTimer = null;
let syncing = false;
let again = false;
const listeners = new Set();
let status = { state: 'idle', message: '' };

function persist() {
  localStorage.setItem(DATA_KEY, JSON.stringify(data));
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

function setStatus(state, message = '', info) {
  status = { state, message };
  listeners.forEach((fn) => fn(status, info));
}

const config = () => meta.firebase || (cloud.isConfigured(FIREBASE_CONFIG) ? FIREBASE_CONFIG : null);

export const store = {
  onStatus(fn) { listeners.add(fn); },
  get status() { return status; },
  get meta() { return meta; },
  get configured() { return !!config(); },
  get userEmail() { return cloud.user()?.email || ''; },
  setFirebaseConfig(text) {
    if (!text.trim()) { meta.firebase = null; persist(); return true; }
    // Accepte le bloc copié depuis la console Firebase (const firebaseConfig = {...})
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('Configuration introuvable');
    const json = m[0]
      .replace(/^\s*\/\/.*$/gm, '')
      .replace(/'/g, '"')
      .replace(/([{,]\s*)([A-Za-z_]\w*)\s*:/g, '$1"$2":')
      .replace(/,\s*}/g, '}');
    const obj = JSON.parse(json);
    if (!cloud.isConfigured(obj)) throw new Error('apiKey ou projectId manquant');
    meta.firebase = obj; persist();
    return true;
  },

  list() {
    return Object.values(data.characters).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr'));
  },
  // Personnage affiché ; null s'il n'y en a aucun (l'appli propose alors d'en créer un)
  current() {
    let c = data.characters[meta.currentId];
    if (!c) {
      c = this.list()[0] || null;
      if (c) { meta.currentId = c.id; persist(); }
    }
    return c;
  },
  select(id) { meta.currentId = id; persist(); },
  add(c) { c.updatedAt = Date.now(); data.characters[c.id] = c; meta.currentId = c.id; markDirty(); },
  remove(id) {
    delete data.characters[id];
    data.deleted[id] = Date.now();
    if (meta.currentId === id) meta.currentId = null;
    markDirty();
  },
  save() { markDirty(); },
  get group() { return data.group; },
  sketch(id) { const s = data.sketches[id]; return s && !s.deleted ? s : null; },
  // Enregistre un croquis sans redessiner l'appli (on est peut-être en train de dessiner)
  saveSketch(s) { s.updatedAt = Date.now(); delete s.deleted; data.sketches[s.id] = s; markDirty(); },
  removeSketch(id) { if (data.sketches[id]) { data.sketches[id] = { id, deleted: true, strokes: [], updatedAt: Date.now() }; markDirty(); } },
  saveGroup() { data.group.updatedAt = Date.now(); markDirty(); },

  exportAll() { return JSON.stringify({ format: 'dragonbane', version: 1, ...data }, null, 2); },
  // (l'import d'un export complet reprend aussi le groupe s'il est plus récent)
  exportOne(c) {
    const sketches = Object.fromEntries(Object.values(data.sketches).filter((s) => s.cid === c.id && !s.deleted).map((s) => [s.id, s]));
    return JSON.stringify({ format: 'dragonbane', version: 1, characters: { [c.id]: c }, sketches }, null, 2);
  },
  importAll(json) {
    const incoming = JSON.parse(json);
    const chars = incoming.characters ? Object.values(incoming.characters) : [incoming];
    let n = 0;
    for (const c of chars) {
      if (!c?.id || !c.attrs) continue;
      upgradeCharacter(c);
      c.updatedAt = Date.now();
      data.characters[c.id] = c;
      delete data.deleted[c.id];
      n++;
    }
    if (n) meta.currentId = chars.find((c) => c?.id && c.attrs).id;
    if (incoming.group && (incoming.group.updatedAt || 0) > (data.group.updatedAt || 0)) data.group = upgradeGroup(incoming.group);
    for (const s of Object.values(incoming.sketches || {})) {
      if (s?.id && (s.updatedAt || 0) >= (data.sketches[s.id]?.updatedAt || 0)) data.sketches[s.id] = { ...s, updatedAt: Date.now() };
    }
    markDirty();
    return n;
  },

  // ----- Synchronisation -----
  async sync({ interactive = false } = {}) {
    if (syncing) { again = true; return; }
    const cfg = config();
    if (!cfg) return setStatus('nocloud', 'Sauvegarde en ligne non configurée');
    if (!navigator.onLine) return setStatus(meta.dirty ? 'offline' : 'synced', meta.dirty ? 'Hors ligne — envoi dès le retour du réseau' : 'Hors ligne');
    syncing = true;
    try {
      await cloud.init(cfg);
      if (!cloud.user()) {
        if (!interactive) { setStatus('needauth', 'Touche le nuage pour te connecter'); return; }
        setStatus('syncing', 'Connexion…');
        await cloud.signIn();
      }
      setStatus('syncing', 'Synchronisation…');
      const start = Date.now();
      const remote = await cloud.pull();
      const changed = merge(remote);
      await cloud.push(data.characters, data.deleted, meta.lastPush, data.group, data.sketches);
      meta.lastPush = start;
      meta.lastSync = Date.now();
      meta.dirty = Object.values(data.characters).some((c) => (c.updatedAt || 0) > start) || (data.group.updatedAt || 0) > start
        || Object.values(data.sketches).some((s) => (s.updatedAt || 0) > start);
      persist();
      setStatus(meta.dirty ? 'pending' : 'synced', `Synchronisé (${cloud.user().email})`, { reloaded: changed });
    } catch (e) {
      const msg = e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request' ? 'Connexion annulée'
        : e.code === 'auth/popup-blocked' ? 'Fenêtre Google bloquée : touche à nouveau le nuage'
        : e.code === 'auth/api-key-not-valid' || e.code?.startsWith('auth/invalid-api-key') ? 'Configuration Firebase invalide (apiKey)'
        : e.code === 'auth/unauthorized-domain' ? 'Domaine non autorisé dans Firebase (voir README)'
        : e.code === 'permission-denied' ? 'Accès refusé : vérifie les règles Firestore (voir README)'
        : e.code === 'resource-exhausted' ? 'Limite gratuite de Firebase atteinte pour aujourd’hui : tes modifications restent sur l’appareil'
        : e.auth ? 'Touche le nuage pour te connecter' : (e.message || 'Erreur de synchronisation');
      setStatus(e.auth ? 'needauth' : 'error', msg);
    } finally {
      syncing = false;
      if (again) { again = false; scheduleSync(); }
    }
  },
  async disconnect() {
    await cloud.signOut();
    meta.lastPush = 0; persist();
    setStatus('needauth', 'Déconnecté');
  },
};

function markDirty() {
  meta.dirty = true;
  persist();
  if (['synced', 'idle'].includes(status.state)) setStatus('pending', 'Modifications à envoyer');
  scheduleSync();
}

function scheduleSync() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => store.sync(), 4000);
}

// Fusion : pour chaque personnage, la version modifiée le plus récemment gagne
function merge(remote) {
  let changed = false;
  if (remote.group && (remote.group.updatedAt || 0) > (data.group.updatedAt || 0)) { data.group = upgradeGroup(remote.group); changed = true; }
  for (const [id, s] of Object.entries(remote.sketches || {})) {
    if ((s.updatedAt || 0) > (data.sketches[id]?.updatedAt || 0)) { data.sketches[id] = s; changed = true; }
  }
  for (const [id, ts] of Object.entries(remote.deleted || {})) {
    data.deleted[id] = Math.max(data.deleted[id] || 0, ts);
  }
  for (const [id, c] of Object.entries(remote.characters || {})) {
    const local = data.characters[id];
    if (!local || (c.updatedAt || 0) > (local.updatedAt || 0)) { data.characters[id] = upgradeCharacter(c); changed = true; }
  }
  for (const [id, ts] of Object.entries(data.deleted)) {
    const c = data.characters[id];
    if (c && (c.updatedAt || 0) <= ts) { delete data.characters[id]; changed = true; }
    else if (c) delete data.deleted[id];
  }
  persist();
  return changed;
}

window.addEventListener('online', () => store.sync());
window.addEventListener('offline', () => setStatus(meta.dirty ? 'offline' : 'synced', 'Hors ligne'));
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') store.sync(); });
setInterval(() => { if (meta.dirty) store.sync(); }, 60_000);
