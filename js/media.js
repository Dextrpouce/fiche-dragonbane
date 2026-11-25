// Images et croquis du journal : même interface pour le journal personnel (rangés sur l'appareil et dans
// ton compte, via store) et pour le journal du groupe partagé (groups/{code}/media, lus à la demande).
// Croquis : { id, strokes: [...] } — Image : { id, image: 'data:image/jpeg…' }
import * as cloud from './cloud.js';
import { store } from './store.js';
import { group } from './group.js';

const cache = new Map();   // groupe : id → croquis ou image déjà chargé
const loading = new Set();
let onArrive = () => {};   // appelé quand une image du groupe arrive (pour redessiner)
let lastError = '';
export const setOnArrive = (fn) => { onArrive = fn; };
export const error = () => lastError;
const gid = () => group.shared?.id || null;
const errText = (e) => (e?.code === 'permission-denied'
  ? 'Images et croquis du groupe refusés par Firebase : ajoute la règle « media » (voir le manuel)'
  : e?.message || 'Erreur');
const fail = (e) => { lastError = errText(e); onArrive(null); };

// Renvoie l'objet s'il est disponible tout de suite (sinon lance le chargement et renvoie null)
export function get(id) {
  if (!id) return null;
  const g = gid();
  if (!g) return store.sketch(id);
  if (cache.has(id)) return cache.get(id);
  if (!loading.has(id) && navigator.onLine && cloud.user()) {
    loading.add(id);
    cloud.getMedia(g, id).then((m) => { cache.set(id, m || { id, strokes: [], image: '' }); lastError = ''; onArrive(id); })
      .catch(fail).finally(() => loading.delete(id));
  }
  return null;
}

// Crée (ou remplace) un croquis ou une image
export async function put(m, cid) {
  const g = gid();
  if (!g) { store.saveSketch({ ...m, cid }); return; }
  cache.set(m.id, m);
  try { await cloud.setMedia(g, m.id, m); lastError = ''; } catch (e) { fail(e); throw e; }
}

// Croquis modifié : ev = { type: 'add', stroke } | { type: 'remove', strokes } | { type: 'clear' }
export function strokes(sk, ev) {
  const g = gid();
  if (!g) { store.saveSketch(sk); return; }
  cache.set(sk.id, sk);
  const p = ev.type === 'add' ? cloud.editStrokes(g, sk.id, 'add', [ev.stroke])
    : ev.type === 'remove' ? cloud.editStrokes(g, sk.id, 'remove', ev.strokes)
    : cloud.editStrokes(g, sk.id, 'clear', []);
  p.then(() => { lastError = ''; }).catch(fail);
}

// Suit un croquis du groupe en direct (traits des autres joueurs) ; renvoie la fonction pour arrêter
export function watch(id, onData) {
  const g = gid();
  if (!g || !cloud.user()) return () => {};
  return cloud.watchMedia(g, id, (m) => { cache.set(id, m); onData(m); }, fail);
}

export function remove(id) {
  if (!id) return;
  const g = gid();
  if (!g) { store.removeSketch(id); return; }
  cache.delete(id);
  cloud.deleteMedia(g, id).catch(() => {});
}

// Copie une image ou un croquis personnel dans le groupe (pour « Verser mon journal »)
export async function copyToGroup(id) {
  const m = store.sketch(id);
  if (!m || !gid()) return;
  await put({ id, ...(m.image ? { image: m.image } : { strokes: m.strokes || [] }) });
}
