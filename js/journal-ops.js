// Journal de campagne : toutes les modifications sont des « opérations » (données simples).
// Les mêmes servent pour le journal personnel (dans la fiche) et pour celui du groupe partagé
// (envoyées dans une transaction Firebase, comme la caisse). s = objet qui porte { journal: [], npcs: [] }.
// Chaque opération renvoie une ligne de journal { text } (vide = rien à noter) et changed: true si l'état a changé.
const fail = (msg) => { throw Object.assign(new Error(msg), { invalid: true }); };
const FIELDS = ['title', 'date', 'summary', 'places', 'loot', 'npcs'];
const NPC_FIELDS = ['name', 'role', 'place', 'attitude', 'notes', 'photo', 'portrait'];
const short = (t) => (t.length > 60 ? `${t.slice(0, 57)}…` : t);

export function applyJournalOp(s, op) {
  s.journal ??= []; s.npcs ??= [];
  const ses = (id) => s.journal.find((x) => x.id === id) || fail('Session introuvable (supprimée ?)');
  const npc = (id) => s.npcs.find((x) => x.id === id) || fail('PNJ introuvable (supprimé ?)');
  const nextN = () => s.journal.reduce((m, x) => Math.max(m, +x.n || 0), 0) + 1;
  const ok = (text = '') => ({ text, changed: true });
  switch (op.t) {
    case 'j:new': {
      // Numéro recalculé ici : deux joueurs qui créent une session en même temps ont chacun la leur
      const x = { title: '', summary: '', npcs: '', places: '', loot: '', todos: [], npcIds: [], sketch: null, ...op.session, n: nextN() };
      s.journal.unshift(x);
      return ok(`Journal : session ${x.n}${x.title ? ` « ${x.title} »` : ''} ouverte`);
    }
    case 'j:set': {
      if (!FIELDS.includes(op.field)) fail('Champ inconnu');
      const x = ses(op.sid);
      if ((x[op.field] ?? '') === op.value) return { text: '' };
      x[op.field] = op.value;
      return ok(op.field === 'title' ? `Journal : session ${x.n} renommée « ${op.value} »` : '');
    }
    case 'j:del': {
      const x = ses(op.sid);
      s.journal = s.journal.filter((y) => y !== x);
      return ok(`Journal : session ${x.n} supprimée`);
    }
    case 'j:todoAdd': {
      const x = ses(op.sid); (x.todos ||= []).push(op.todo);
      return ok(`Piste (S${x.n}) : ${short(op.todo.t)}`);
    }
    case 'j:todoSet': {
      const x = ses(op.sid); const t = (x.todos || []).find((y) => y.id === op.tid) || fail('Piste introuvable');
      const doneChanged = op.v.done !== undefined && !!op.v.done !== !!t.done;
      Object.assign(t, op.v);
      return ok(doneChanged ? `Piste ${t.done ? 'terminée' : 'rouverte'} : ${short(t.t)}` : '');
    }
    case 'j:todoDel': {
      const x = ses(op.sid); x.todos = (x.todos || []).filter((y) => y.id !== op.tid);
      return ok();
    }
    case 'j:npcAdd': {
      // Même nom déjà connu (autre joueur plus rapide) : on relie celui qui existe
      const same = s.npcs.find((y) => y.id === op.npc.id || (y.name || '').trim().toLowerCase() === (op.npc.name || '').trim().toLowerCase());
      const n = same || op.npc;
      if (!same) s.npcs.push(n);
      if (op.sid) { const x = ses(op.sid); x.npcIds ||= []; if (!x.npcIds.includes(n.id)) x.npcIds.push(n.id); }
      return ok(same ? '' : `PNJ : ${n.name}`);
    }
    case 'j:npcSet': {
      const n = npc(op.nid);
      for (const k of Object.keys(op.v)) if (NPC_FIELDS.includes(k)) n[k] = op.v[k];
      return ok();
    }
    case 'j:npcDel': {
      const n = npc(op.nid);
      s.npcs = s.npcs.filter((y) => y !== n);
      s.journal.forEach((x) => { x.npcIds = (x.npcIds || []).filter((id) => id !== n.id); });
      return ok(`PNJ supprimé : ${n.name}`);
    }
    case 'j:npcLink': {
      const x = ses(op.sid); npc(op.nid); x.npcIds ||= [];
      if (x.npcIds.includes(op.nid)) return { text: '' };
      x.npcIds.push(op.nid);
      return ok();
    }
    case 'j:npcUnlink': {
      const x = ses(op.sid); x.npcIds = (x.npcIds || []).filter((id) => id !== op.nid);
      return ok();
    }
    case 'j:sketch': { const x = ses(op.sid); x.sketch = op.mid; return ok(); }
    // Verser un journal personnel dans celui du groupe (les sessions déjà présentes sont ignorées)
    case 'j:import': {
      const had = new Set(s.journal.map((x) => x.id));
      const add = (op.journal || []).filter((x) => !had.has(x.id)).sort((a, b) => (a.n || 0) - (b.n || 0));
      const renumber = s.journal.length > 0;
      for (const x of add) { s.journal.push(renumber ? { ...x, n: nextN() } : { ...x }); }
      s.journal.sort((a, b) => (b.n || 0) - (a.n || 0));
      const known = new Set(s.npcs.map((n) => n.id));
      const npcs = (op.npcs || []).filter((n) => !known.has(n.id));
      s.npcs.push(...npcs);
      if (!add.length && !npcs.length) return { text: '' };
      return ok(`Journal versé : ${add.length} session${add.length > 1 ? 's' : ''}, ${npcs.length} PNJ`);
    }
    default: fail('Opération inconnue');
  }
  return { text: '' };
}
