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

// Doit suivre un geste de l'utilisateur (ouvre la fenêtre Google)
export async function signIn() {
  const provider = new fb.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  await fb.signInWithPopup(auth, provider);
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
