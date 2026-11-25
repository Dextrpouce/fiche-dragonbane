// Page de croquis du journal : dessin au stylet (pression), au doigt ou à la souris.
// Les traits sont gardés en coordonnées « page » (1200 × 900), indépendantes de l'écran :
// le croquis reste net et identique sur téléphone, tablette ou ordinateur.
// Trait : { c: couleur (0 encre, 1 rouge, 2 crayon), p: [x, y, pression (0-100), x, y, pression, …] } (entiers)
export const PAGE_W = 1200;
export const PAGE_H = 900;
export const COLORS = [
  { name: 'Encre', css: '#2b2118', w: 3.2, a: 1 },
  { name: 'Rouge', css: '#a5281f', w: 3.2, a: 1 },
  { name: 'Crayon', css: '#6f675c', w: 2.2, a: 0.8 },
];
const ERASE_R = 14; // rayon de la gomme (unités page)

// Dessine un trait (largeur selon la pression, segments arrondis et lissés)
function drawStroke(g, s, k) {
  const col = COLORS[s.c] || COLORS[0];
  const p = s.p; const n = p.length / 3;
  if (!n) return;
  g.strokeStyle = col.css; g.fillStyle = col.css; g.globalAlpha = col.a;
  g.lineCap = 'round'; g.lineJoin = 'round';
  const wid = (i) => Math.max(0.6, col.w * (0.35 + (p[i * 3 + 2] / 100) * 1.3) * k);
  if (n === 1) { g.beginPath(); g.arc(p[0] * k, p[1] * k, wid(0) / 2, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; return; }
  // Courbes passant par les milieux des segments : tracé doux sans angles
  let mx = p[0] * k; let my = p[1] * k;
  for (let i = 1; i < n; i++) {
    const x0 = p[(i - 1) * 3] * k; const y0 = p[(i - 1) * 3 + 1] * k;
    const x1 = p[i * 3] * k; const y1 = p[i * 3 + 1] * k;
    const nx = (x0 + x1) / 2; const ny = (y0 + y1) / 2;
    g.lineWidth = (wid(i - 1) + wid(i)) / 2;
    g.beginPath(); g.moveTo(mx, my); g.quadraticCurveTo(x0, y0, nx, ny); g.stroke();
    mx = nx; my = ny;
  }
  g.beginPath(); g.moveTo(mx, my); g.lineTo(p[(n - 1) * 3] * k, p[(n - 1) * 3 + 1] * k); g.stroke();
  g.globalAlpha = 1;
}

let penSeen = false; // dès qu'un stylet est utilisé, le doigt (paume posée) ne dessine plus

// Monte la zone de dessin dans « wrap » (qui contient un <canvas>). sketch = { strokes: [] } (modifié sur place).
// onSave() est appelé après chaque trait ou effacement. Renvoie des commandes pour la barre d'outils.
export function mountSketch(wrap, sketch, onSave) {
  const cv = wrap.querySelector('canvas');
  const g = cv.getContext('2d');
  const st = { color: 0, erase: false, cur: null, pid: null, k: 1 };
  sketch.strokes ??= [];

  const resize = () => {
    const w = cv.clientWidth || wrap.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    st.k = w / PAGE_W;
    cv.width = Math.round(w * dpr); cv.height = Math.round(w * PAGE_H / PAGE_W * dpr);
    cv.style.height = `${Math.round(w * PAGE_H / PAGE_W)}px`;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  };
  const redraw = () => {
    g.clearRect(0, 0, cv.width, cv.height);
    sketch.strokes.forEach((s) => drawStroke(g, s, st.k));
    if (st.cur) drawStroke(g, st.cur, st.k);
  };
  const pos = (e) => {
    const r = cv.getBoundingClientRect();
    const x = Math.round((e.clientX - r.left) / r.width * PAGE_W);
    const y = Math.round((e.clientY - r.top) / r.height * PAGE_H);
    const pr = e.pointerType === 'pen' ? Math.round(Math.min(1, Math.max(0.05, e.pressure || 0.5)) * 100) : 50;
    return [Math.max(0, Math.min(PAGE_W, x)), Math.max(0, Math.min(PAGE_H, y)), pr];
  };
  // Gomme : retire les traits qui passent près du point
  const eraseAt = ([x, y]) => {
    const before = sketch.strokes.length;
    sketch.strokes = sketch.strokes.filter((s) => {
      for (let i = 0; i < s.p.length; i += 3) if (Math.hypot(s.p[i] - x, s.p[i + 1] - y) < ERASE_R) return false;
      return true;
    });
    if (sketch.strokes.length !== before) { redraw(); st.erased = true; }
  };

  cv.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'pen') penSeen = true;
    if (e.pointerType === 'touch' && penSeen) return; // paume posée sur l'écran
    if (st.pid !== null || e.button > 0) return;     // un seul trait à la fois
    e.preventDefault();
    try { cv.setPointerCapture(e.pointerId); } catch { /* pointeur déjà relâché */ }
    st.pid = e.pointerId;
    const pt = pos(e);
    // Le bouton du stylet (ou la gomme au dos du stylet) efface aussi
    st.erasing = st.erase || e.button === 5 || (e.buttons & 32) === 32;
    if (st.erasing) { st.erased = false; eraseAt(pt); return; }
    st.cur = { c: st.color, p: pt };
    redraw();
  });
  cv.addEventListener('pointermove', (e) => {
    if (e.pointerId !== st.pid) return;
    e.preventDefault();
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of (evs.length ? evs : [e])) {
      const pt = pos(ev);
      if (st.erasing) { eraseAt(pt); continue; }
      const p = st.cur.p; const l = p.length;
      if (Math.hypot(pt[0] - p[l - 3], pt[1] - p[l - 2]) < 2) continue; // points trop proches : ignorés
      p.push(...pt);
    }
    if (!st.erasing) redraw();
  });
  const end = (e) => {
    if (e.pointerId !== st.pid) return;
    st.pid = null;
    if (st.erasing) { st.erasing = false; if (st.erased) onSave(); return; }
    if (st.cur) { sketch.strokes.push(st.cur); st.cur = null; redraw(); onSave(); }
  };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', end);

  resize();
  return {
    resize,
    setColor(i) { st.color = i; st.erase = false; },
    setErase(on) { st.erase = on; },
    get color() { return st.color; },
    get erase() { return st.erase; },
    undo() { if (sketch.strokes.length) { sketch.strokes.pop(); redraw(); onSave(); } },
    clear() { sketch.strokes = []; redraw(); onSave(); },
  };
}
