// Image de la carte de campagne : trop lourde pour le journal, rangée à part.
// Sur l'appareil : IndexedDB (chargée une seule fois). Groupe partagé : groups/{code}/media, découpée en morceaux
// (un document Firebase ne dépasse pas 1 Mo). Journal personnel : sur l'appareil seulement.
import * as cloud from './cloud.js';

const DB = 'dragonbane-cartes';
const mem = new Map();
let dbp = null;
function idb() {
  dbp ||= new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('img');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}
async function idbGet(k) {
  const db = await idb();
  return new Promise((res, rej) => { const q = db.transaction('img').objectStore('img').get(k); q.onsuccess = () => res(q.result || null); q.onerror = () => rej(q.error); });
}
async function idbPut(k, v) {
  const db = await idb();
  return new Promise((res, rej) => { const t = db.transaction('img', 'readwrite'); t.objectStore('img').put(v, k); t.oncomplete = () => res(); t.onerror = () => rej(t.error); });
}

// Image de la carte (data URL) : mémoire, appareil, puis groupe
export async function load(id, gid) {
  if (!id) return null;
  if (mem.has(id)) return mem.get(id);
  let data = await idbGet(id).catch(() => null);
  if (!data && gid && cloud.user()) {
    data = await cloud.getMapImage(gid, id);
    if (data) idbPut(id, data).catch(() => {});
  }
  if (data) mem.set(id, data);
  return data;
}
export const cached = (id) => mem.get(id) || null;

export async function save(id, data, gid) {
  mem.set(id, data);
  await idbPut(id, data).catch(() => {});
  if (gid) await cloud.putMapImage(gid, id, data);
}

export function remove(id, gid) {
  mem.delete(id);
  if (gid) cloud.deleteMapImage(gid, id).catch(() => {});
}

// Fichier image choisi → JPEG réduit (3000 px au plus, environ 2 Mo au plus) et ses dimensions
export async function readImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Choisis une image (JPEG ou PNG). Pour un PDF, exporte d’abord la carte en image.');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Image illisible')); i.src = url; });
    const k = Math.min(1, 3000 / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * k); const h = Math.round(img.naturalHeight * k);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    cv.getContext('2d').drawImage(img, 0, 0, w, h);
    let q = 0.85; let data = cv.toDataURL('image/jpeg', q);
    while (data.length > 2_600_000 && q > 0.45) { q -= 0.1; data = cv.toDataURL('image/jpeg', q); }
    return { data, w, h };
  } finally { URL.revokeObjectURL(url); }
}
