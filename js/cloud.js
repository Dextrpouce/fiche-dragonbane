// Sauvegarde en ligne via Firebase (offre gratuite « Spark », sans carte bancaire).
// Même projet Firebase que le Grimoire WFRP : chaque personnage est un document
// users/{uid}/dragonbane/{id}, déjà couvert par la règle « users/{uid}/{document=**} ».
// La connexion Google reste active d'une session à l'autre : la synchro est automatique.
const SDK = 'https://www.gstatic.com/firebasejs/10.14.1';
const COLLECTION = 'dragonbane';

let fb = null;
let auth = null;
let db = null;
let readyPromise = null;

export function isConfigured(config) {
  return !!(config && config.apiKey && config.projectId);
}

// Charge Firebase et attend de savoir si l'utilisateur est déjà connecté
export function init(config) {
  if (readyPromise) return readyPromise;
  readyPromise = (async () => {
    const [appMod, authMod, fsMod] = await Promise.all([
      import(`${SDK}/firebase-app.js`),
      import(`${SDK}/firebase-auth.js`),
      import(`${SDK}/firebase-firestore.js`),
    ]);
    fb = { ...appMod, ...authMod, ...fsMod };
    const app = fb.initializeApp(config);
    auth = fb.getAuth(app);
    db = fb.getFirestore(app);
    await new Promise((resolve) => { const off = fb.onAuthStateChanged(auth, () => { off(); resolve(); }); });
  })().catch((e) => { readyPromise = null; throw e; });
  return readyPromise;
}

export const user = () => auth?.currentUser || null;

// Connexion : l'interface fournit une fenêtre (Google ou e-mail + mot de passe) qui se résout une fois
// connecté et échoue avec le code « auth/popup-closed-by-user » si on la ferme (comme l'appli INS/MV).
// Même projet Firebase : un compte créé ici marche aussi dans le Grimoire et INS/MV.
let loginUI = null;
export const setLoginUI = (fn) => { loginUI = fn; };
export async function signIn() { if (loginUI) return loginUI(); return signInGoogle(); }
// Doit suivre un geste de l'utilisateur (ouvre la fenêtre Google)
export async function signInGoogle() {
  const provider = new fb.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await fb.signInWithPopup(auth, provider);
}
export async function signInEmail(email, password) {
  await fb.signInWithEmailAndPassword(auth, email.trim(), password);
}
export async function signUpEmail(email, password) {
  await fb.createUserWithEmailAndPassword(auth, email.trim(), password);
}
export async function resetPassword(email) {
  auth.languageCode = 'fr';
  await fb.sendPasswordResetEmail(auth, email.trim());
}

export async function signOut() {
  if (auth) await fb.signOut(auth);
}

function col() {
  const u = user();
  if (!u) throw Object.assign(new Error('Non connecté'), { auth: true });
  return fb.collection(db, 'users', u.uid, COLLECTION);
}

// Récupère tout ce qui est en ligne : { characters: {id: perso}, deleted: {id: date} }
export async function pull() {
  const snap = await fb.getDocs(col());
  const characters = {};
  const deleted = {};
  let group = null;
  const sketches = {};
  let myGroup;
  snap.forEach((doc) => {
    const v = doc.data();
    // Croquis du journal : champ « sketch » (les anciennes versions de l'appli les ignorent)
    if (doc.id.startsWith(SKETCH)) { if (v.sketch) sketches[doc.id.slice(SKETCH.length)] = JSON.parse(v.sketch); return; }
    // Mon groupe partagé (pour le retrouver sur tous mes appareils sans ressaisir le code)
    if (doc.id === MY_GROUP) { try { myGroup = v.ref ? JSON.parse(v.ref) : null; } catch { /* illisible */ } return; }
    // Le groupe est rangé dans le champ « group » (pas « json ») : les anciennes versions l'ignorent
    if (doc.id === GROUP_ID) { if (v.group) group = JSON.parse(v.group); return; }
    if (v.deleted) deleted[doc.id] = v.updatedAt || 0;
    else if (v.json) characters[doc.id] = JSON.parse(v.json);
  });
  return { characters, deleted, group, sketches, myGroup };
}
const GROUP_ID = '__groupe';
const MY_GROUP = '__monGroupe';
// Mon groupe partagé, rangé dans mon compte : { id, name } (ref vide = je n'en ai pas)
export async function setMyGroup(ref) {
  await fb.setDoc(fb.doc(col(), MY_GROUP), { ref: ref ? JSON.stringify(ref) : '', updatedAt: Date.now() });
}
const SKETCH = '__croquis_';

// Envoie les personnages modifiés depuis la dernière synchro
export async function push(characters, deleted, since, group = null, sketches = {}) {
  const c = col();
  const batch = fb.writeBatch(db);
  let n = 0;
  if (group && (group.updatedAt || 0) > since) {
    batch.set(fb.doc(c, GROUP_ID), { group: JSON.stringify(group), updatedAt: group.updatedAt });
    n++;
  }
  for (const ch of Object.values(characters)) {
    if ((ch.updatedAt || 0) <= since) continue;
    batch.set(fb.doc(c, ch.id), { json: JSON.stringify(ch), name: ch.name, updatedAt: ch.updatedAt || Date.now(), deleted: false });
    n++;
  }
  for (const s of Object.values(sketches)) {
    if ((s.updatedAt || 0) <= since) continue;
    batch.set(fb.doc(c, SKETCH + s.id), { sketch: JSON.stringify(s), updatedAt: s.updatedAt });
    n++;
  }
  for (const [id, ts] of Object.entries(deleted)) {
    if (ts <= since) continue;
    batch.set(fb.doc(c, id), { deleted: true, updatedAt: ts });
    n++;
  }
  if (n) await batch.commit();
  return n;
}

// ----- Groupe partagé : groups/{code} (même collection et mêmes règles que le Grimoire WFRP) -----
// Un document par groupe : membres + état (caisse, montures, journal) en JSON.
// Toute modification passe par une transaction : deux joueurs peuvent écrire en même temps sans rien perdre.
// L'état porte « game: 'dragonbane' » pour ne pas confondre avec un groupe Warhammer.
const groupDoc = (id) => fb.doc(db, 'groups', id);
const who = () => { const u = user(); if (!u) throw Object.assign(new Error('Non connecté'), { auth: true }); return u; };

export async function createGroup(id, name, state) {
  const u = who();
  await fb.setDoc(groupDoc(id), {
    name, owner: u.uid, members: [u.uid], memberNames: { [u.uid]: u.displayName || u.email || 'Joueur' },
    json: JSON.stringify(state), updatedAt: Date.now(), createdAt: Date.now(),
  });
}

// Rejoindre : on s'ajoute à la liste des membres (refusé si c'est un groupe d'un autre jeu)
export async function joinGroup(id, game) {
  const u = who();
  return fb.runTransaction(db, async (tx) => {
    const snap = await tx.get(groupDoc(id));
    if (!snap.exists()) throw new Error('Code de groupe inconnu');
    const d = snap.data();
    let g = '';
    try { g = JSON.parse(d.json || '{}').game || ''; } catch { /* état illisible */ }
    if (g !== game) throw new Error('Ce code n’est pas un groupe Dragonbane');
    if (!d.members.includes(u.uid)) {
      tx.update(groupDoc(id), { members: [...d.members, u.uid], memberNames: { ...d.memberNames, [u.uid]: u.displayName || u.email || 'Joueur' } });
    }
    return d.name;
  });
}

// fn(state) modifie l'état (journal compris) et renvoie la ligne ajoutée, ou null s'il n'y a rien à écrire
export async function updateGroup(id, fn) {
  who();
  return fb.runTransaction(db, async (tx) => {
    const snap = await tx.get(groupDoc(id));
    if (!snap.exists()) throw new Error('Groupe introuvable');
    const state = JSON.parse(snap.data().json || '{}');
    if (!fn(state)) return false;
    tx.update(groupDoc(id), { json: JSON.stringify(state), updatedAt: Date.now() });
    return true;
  });
}

// Suit le groupe en direct ; renvoie la fonction pour arrêter
export function watchGroup(id, onData, onError) {
  return fb.onSnapshot(groupDoc(id), (snap) => {
    if (!snap.exists()) { onError?.(new Error('Groupe introuvable')); return; }
    const d = snap.data();
    onData({ id, name: d.name, members: d.memberNames || {}, owner: d.owner || d.members?.[0] || '', mj: d.mj || '', mjName: d.mjName || '', state: JSON.parse(d.json || '{}'), updatedAt: d.updatedAt || 0 });
  }, (e) => onError?.(e));
}

// ----- Images et croquis du groupe : groups/{code}/media/{id} -----
// Trop lourds pour le document du groupe (1 Mo au plus) : un document chacun, sous le groupe.
// Règle Firestore nécessaire (voir README) : lecture/écriture réservées aux membres du groupe.
// Croquis : chaque trait est une chaîne JSON du tableau « strokes » ; ajouter/retirer un trait
// (arrayUnion / arrayRemove) ne touche pas aux traits des autres joueurs qui dessinent en même temps.
const mediaDoc = (g, id) => fb.doc(db, 'groups', g, 'media', id);
const fromMedia = (id, d) => ({ id, kind: d.kind || (d.image ? 'image' : 'sketch'), image: d.image || '', strokes: (d.strokes || []).map((x) => JSON.parse(x)) });
export async function getMedia(g, id) {
  who();
  const snap = await fb.getDoc(mediaDoc(g, id));
  return snap.exists() ? fromMedia(id, snap.data()) : null;
}
export async function setMedia(g, id, m) {
  who();
  await fb.setDoc(mediaDoc(g, id), { kind: m.image ? 'image' : 'sketch', image: m.image || '', strokes: (m.strokes || []).map((s) => JSON.stringify(s)), updatedAt: Date.now() });
}
export async function editStrokes(g, id, mode, strokes) {
  who();
  const v = mode === 'clear' ? [] : mode === 'add' ? fb.arrayUnion(...strokes.map((s) => JSON.stringify(s))) : fb.arrayRemove(...strokes.map((s) => JSON.stringify(s)));
  await fb.updateDoc(mediaDoc(g, id), { strokes: v, updatedAt: Date.now() });
}
export function watchMedia(g, id, onData, onError) {
  return fb.onSnapshot(mediaDoc(g, id), (snap) => { if (snap.exists()) onData(fromMedia(id, snap.data())); }, (e) => onError?.(e));
}
export async function deleteMedia(g, id) { who(); await fb.deleteDoc(mediaDoc(g, id)); }

// ----- Personnages prêtés au groupe (joueur absent) : groups/{code}/media/perso_{id} -----
// Copie de la fiche de jeu (sans notes secrètes ni journal perso), lisible et modifiable par les membres.
const persoDoc = (g, id) => mediaDoc(g, `perso_${id}`);
export async function putPerso(g, c, owner) {
  who();
  await fb.setDoc(persoDoc(g, c.id), { kind: 'perso', json: JSON.stringify(c), owner: owner || '', updatedAt: c.updatedAt || Date.now() });
}
export async function getPerso(g, id) {
  who();
  const snap = await fb.getDoc(persoDoc(g, id));
  return snap.exists() ? { c: JSON.parse(snap.data().json), owner: snap.data().owner || '' } : null;
}
export function watchPerso(g, id, onData, onGone) {
  return fb.onSnapshot(persoDoc(g, id), (snap) => { if (snap.exists()) onData(JSON.parse(snap.data().json)); else onGone?.(); }, () => {});
}
export async function deletePerso(g, id) { who(); await fb.deleteDoc(persoDoc(g, id)); }

// ----- Meneur de jeu : un compte désigné dans le groupe (champs « mj » et « mjName » du document du groupe) -----
export const uid = () => user()?.uid || '';
// Code MJ : un petit document à part dans « groups » (son identifiant EST le code), créé par l'administrateur.
// Il indique le groupe à rejoindre ; on ne peut pas lister ces documents, seulement les lire si on connaît le code.
// Son JSON porte game: 'dragonbane-mj' pour qu'on ne puisse pas le « rejoindre » comme un groupe ordinaire.
export async function createMJInvite(code, g) {
  const u = who();
  await fb.setDoc(groupDoc(code), { kind: 'mjinvite', group: g, members: [u.uid], memberNames: { [u.uid]: u.displayName || u.email || 'Admin' },
    json: JSON.stringify({ game: 'dragonbane-mj' }), revoked: false, createdAt: Date.now() });
}
export async function revokeMJInvite(code) { who(); await fb.updateDoc(groupDoc(code), { revoked: true }); }
export async function redeemMJInvite(code) {
  who();
  const snap = await fb.getDoc(groupDoc(code));
  if (!snap.exists()) throw new Error('Code MJ inconnu');
  const d = snap.data();
  if (d.kind !== 'mjinvite') throw new Error('Ce n’est pas un code MJ (c’est peut-être le code du groupe pour les joueurs)');
  if (d.revoked) throw new Error('Ce code MJ n’est plus valable : demandes-en un nouveau à l’administrateur du groupe');
  return d.group;
}
export async function setGroupMJ(g, mjUid, mjName) {
  who();
  await fb.updateDoc(groupDoc(g), { mj: mjUid || '', mjName: mjName || '' });
}
// Fiches complètes (notes secrètes, journal perso…) pour le MJ : groups/{code}/mj/{uid joueur}/persos|media/{id}
// Règle Firestore : chaque joueur écrit dans son dossier ; seuls lui et le MJ du groupe peuvent le lire.
const mjCol = (g, owner, kind) => fb.collection(db, 'groups', g, 'mj', owner, kind);
export async function putMJPerso(g, c) {
  const u = who();
  await fb.setDoc(fb.doc(mjCol(g, u.uid, 'persos'), c.id), { json: JSON.stringify(c), name: c.name || '', updatedAt: c.updatedAt || Date.now() });
}
export async function deleteMJPerso(g, cid) { const u = who(); await fb.deleteDoc(fb.doc(mjCol(g, u.uid, 'persos'), cid)); }
export async function putMJMedia(g, m) {
  const u = who();
  await fb.setDoc(fb.doc(mjCol(g, u.uid, 'media'), m.id), { json: JSON.stringify(m), updatedAt: m.updatedAt || Date.now() });
}
export async function getMJMedia(g, owner, id) {
  who();
  const snap = await fb.getDoc(fb.doc(mjCol(g, owner, 'media'), id));
  return snap.exists() ? JSON.parse(snap.data().json) : null;
}
// MJ : suit en direct les fiches d'un joueur ; onData(liste de personnages)
export function watchMJPersos(g, owner, onData, onError) {
  return fb.onSnapshot(mjCol(g, owner, 'persos'), (snap) => {
    const list = []; snap.forEach((d) => { try { list.push(JSON.parse(d.data().json)); } catch { /* fiche illisible */ } });
    onData(list);
  }, (e) => onError?.(e));
}

export async function leaveGroup(id) {
  const u = who();
  await fb.runTransaction(db, async (tx) => {
    const snap = await tx.get(groupDoc(id));
    if (!snap.exists()) return;
    const d = snap.data();
    const names = { ...d.memberNames }; delete names[u.uid];
    tx.update(groupDoc(id), { members: d.members.filter((m) => m !== u.uid), memberNames: names });
  });
}
