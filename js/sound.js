// Son des dés, synthétisé à la volée (Web Audio) : aucun fichier à télécharger, marche hors ligne.
// Un cliquetis par rebond pendant l'animation, puis un « clac » quand le dé s'arrête.
// Réglage : menu ⋮ › Son des dés (activé par défaut), mémorisé sur l'appareil.
const KEY = 'dragonbane.sound';
let ctx = null;
let noise = null;

export const soundOn = () => localStorage.getItem(KEY) !== 'off';
export const setSound = (on) => localStorage.setItem(KEY, on ? 'on' : 'off');

// À appeler pendant un geste de l'utilisateur (toucher « Lancer ») : les navigateurs mobiles l'exigent
function audio() {
  if (!soundOn()) return null;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    if (!noise) {
      // Un dixième de seconde de bruit blanc, réutilisé pour chaque choc
      noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.1), ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return ctx;
  } catch { return null; }
}

// Un choc : bruit filtré très court (bois/os sur la table). freq = timbre, len = durée, vol = volume.
function knock(freq, len, vol, when = 0) {
  const a = audio(); if (!a) return;
  const t = a.currentTime + when;
  const src = a.createBufferSource(); src.buffer = noise;
  src.playbackRate.value = 0.8 + Math.random() * 0.4;
  const bp = a.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 3 + Math.random() * 3;
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  src.connect(bp).connect(g).connect(a.destination);
  src.start(t, Math.random() * 0.05, len + 0.02);
}

// Rebond pendant que le dé roule (plusieurs dés = petits chocs décalés)
export function rattle(dice = 1) {
  for (let i = 0; i < Math.min(dice, 3); i++) {
    knock(1800 + Math.random() * 2200, 0.035 + Math.random() * 0.02, 0.18 + Math.random() * 0.1, i * (0.012 + Math.random() * 0.02));
  }
}

// Le dé s'immobilise : un choc plus grave et un petit dernier rebond
export function land(dice = 1) {
  knock(900 + Math.random() * 300, 0.09, 0.4);
  knock(2400 + Math.random() * 800, 0.04, 0.15, 0.05);
  if (dice > 1) knock(1100 + Math.random() * 400, 0.07, 0.25, 0.03);
}

// Prépare le son (geste de l'utilisateur) sans rien jouer
export const unlock = () => { audio(); };
