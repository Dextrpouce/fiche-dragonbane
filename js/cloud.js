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
  snap.forEach((doc) => {
    const v = doc.data();
    // Le groupe est rangé dans le champ « group » (pas « json ») : les anciennes versions l'ignorent
    if (doc.id === GROUP_ID) { if (v.group) group = JSON.parse(v.group); return; }
    if (v.deleted) deleted[doc.id] = v.updatedAt || 0;
    else if (v.json) characters[doc.id] = JSON.parse(v.json);
  });
  return { characters, deleted, group };
}
const GROUP_ID = '__groupe';

// Envoie les personnages modifiés depuis la dernière synchro
export async function push(characters, deleted, since, group = null) {
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
    name, members: [u.uid], memberNames: { [u.uid]: u.displayName || u.email || 'Joueur' },
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
    onData({ id, name: d.name, members: d.memberNames || {}, state: JSON.parse(d.json || '{}'), updatedAt: d.updatedAt || 0 });
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
