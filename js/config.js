// Configuration Firebase : on réutilise le projet « grimoire-wfrp » (mêmes comptes Google,
// mêmes règles de sécurité). Les personnages Dragonbane sont rangés à part (users/{uid}/dragonbane).
// Ces valeurs ne sont pas secrètes : c'est la règle de sécurité Firestore qui protège les données.
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDkqzmJULyB80JyJDdexX43t7fgsrEwgR4',
  authDomain: 'grimoire-wfrp.firebaseapp.com',
  projectId: 'grimoire-wfrp',
  storageBucket: 'grimoire-wfrp.firebasestorage.app',
  messagingSenderId: '1069878600833',
  appId: '1:1069878600833:web:5c43750aa4188833609980',
};
