// Journal de campagne : toutes les modifications sont des « opérations » (données simples).
// Les mêmes servent pour le journal personnel (dans la fiche) et pour celui du groupe partagé
// (envoyées dans une transaction Firebase, comme la caisse). s = objet qui porte { journal: [], npcs: [] }.
// Chaque opération renvoie une ligne de journal { text } (vide = rien à noter) et changed: true si l'état a changé.
// Lieux importants : s.lieux (le champ texte « places » d'une session reste pour les notes libres).
const fail = (msg) => { throw Object.assign(new Error(msg), { invalid: true }); };
const FIELDS = ['title', 'date', 'summary', 'places', 'loot', 'npcs'];
const NPC_FIELDS = ['name', 'role', 'place', 'attitude', 'notes', 'photo', 'portrait'];
const PLACE_FIELDS = ['name', 'kind', 'where', 'notes', 'photo', 'npcIds'];
const short = (t) => ((t || '').length > 60 ? `${t.slice(0, 57)}…` : t || '');
const LABEL = { title: 'titre', date: 'date', summary: 'résumé', places: 'notes de lieux', loot: 'butin', npcs: 'notes PNJ' };
// Historique : toutes les lignes du journal de campagne portent cat: 'j' (affichées dans l'onglet Historique du journal,
// pas dans celui de la caisse). key : les corrections répétées d'un même champ par la même personne sont regroupées.

export function applyJournalOp(s, op) {
  s.journal ??= []; s.npcs ??= []; s.lieux ??= [];
  const ses = (id) => s.journal.find((x) => x.id === id) || fail('Session introuvable (supprimée ?)');
  const npc = (id) => s.npcs.find((x) => x.id === id) || fail('PNJ introuvable (supprimé ?)');
  const lieu = (id) => s.lieux.find((x) => x.id === id) || fail('Lieu introuvable (supprimé ?)');
  const nextN = () => s.journal.reduce((m, x) => Math.max(m, +x.n || 0), 0) + 1;
  const ok = (text = '', key) => ({ text, changed: true, cat: 'j', ...(key ? { key } : {}) });
  // Dernier auteur d'un champ (journal partagé : op.by et op.at sont ajoutés par l'appli)
  const mark = (o, f) => { if (op.by) o.ed = { ...(o.ed || {}), [f]: { by: op.by, at: op.at || Date.now() } }; };
  switch (op.t) {
    case 'j:new': {
      // Numéro recalculé ici : deux joueurs qui créent une session en même temps ont chacun la leur
      const x = { title: '', summary: '', npcs: '', places: '', loot: '', todos: [], npcIds: [], sketch: null, ...op.session, n: nextN() };
      s.journal.unshift(x);
      return ok(`Session ${x.n}${x.title ? ` « ${x.title} »` : ''} ouverte`);
    }
    case 'j:set': {
      if (!FIELDS.includes(op.field)) fail('Champ inconnu');
      const x = ses(op.sid);
      if ((x[op.field] ?? '') === op.value) return { text: '' };
      x[op.field] = op.value; mark(x, op.field);
      return ok(op.field === 'title' ? `Session ${x.n} renommée « ${short(op.value)} »` : `Session ${x.n} : ${LABEL[op.field]} modifié`, `${op.sid}|${op.field}`);
    }
    case 'j:del': {
      const x = ses(op.sid);
      s.journal = s.journal.filter((y) => y !== x);
      return ok(`Session ${x.n}${x.title ? ` « ${short(x.title)} »` : ''} supprimée`);
    }
    case 'j:todoAdd': {
      const x = ses(op.sid); (x.todos ||= []).push(op.todo);
      return ok(`Piste (S${x.n}) : ${short(op.todo.t)}`);
    }
    case 'j:todoSet': {
      const x = ses(op.sid); const t = (x.todos || []).find((y) => y.id === op.tid) || fail('Piste introuvable');
      const doneChanged = op.v.done !== undefined && !!op.v.done !== !!t.done;
      Object.assign(t, op.v);
      return doneChanged ? ok(`Piste ${t.done ? 'terminée' : 'rouverte'} : ${short(t.t)}`) : ok(`Piste modifiée (S${x.n}) : ${short(t.t)}`, `t|${op.tid}`);
    }
    case 'j:todoDel': {
      const x = ses(op.sid); const t = (x.todos || []).find((y) => y.id === op.tid);
      x.todos = (x.todos || []).filter((y) => y.id !== op.tid);
      return ok(`Piste retirée (S${x.n}) : ${short(t?.t)}`);
    }
    case 'j:npcAdd': {
      // Même nom déjà connu (autre joueur plus rapide) : on relie celui qui existe
      const same = s.npcs.find((y) => y.id === op.npc.id || (y.name || '').trim().toLowerCase() === (op.npc.name || '').trim().toLowerCase());
      const n = same || op.npc;
      if (!same) s.npcs.push(n);
      if (op.sid) { const x = ses(op.sid); x.npcIds ||= []; if (!x.npcIds.includes(n.id)) x.npcIds.push(n.id); }
      return ok(same ? (op.sid ? `${n.name} ajouté à la session ${ses(op.sid).n}` : '') : `Nouveau PNJ : ${n.name}${op.sid ? ` (session ${ses(op.sid).n})` : ''}`);
    }
    case 'j:npcSet': {
      const n = npc(op.nid);
      for (const k of Object.keys(op.v)) if (NPC_FIELDS.includes(k)) n[k] = op.v[k];
      mark(n, 'fiche');
      return ok(`PNJ ${n.name} : fiche modifiée`, `n|${op.nid}`);
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
      return ok(`${npc(op.nid).name} ajouté à la session ${x.n}`);
    }
    case 'j:npcUnlink': {
      const x = ses(op.sid); x.npcIds = (x.npcIds || []).filter((id) => id !== op.nid);
      return ok(`${s.npcs.find((n) => n.id === op.nid)?.name || 'PNJ'} retiré de la session ${x.n}`);
    }
    case 'j:placeAdd': {
      const same = s.lieux.find((y) => y.id === op.place.id || (y.name || '').trim().toLowerCase() === (op.place.name || '').trim().toLowerCase());
      const l = same || op.place;
      if (!same) s.lieux.push(l);
      if (op.sid) { const x = ses(op.sid); x.placeIds ||= []; if (!x.placeIds.includes(l.id)) x.placeIds.push(l.id); }
      return ok(same ? (op.sid ? `${l.name} ajouté à la session ${ses(op.sid).n}` : '') : `Nouveau lieu : ${l.name}${op.sid ? ` (session ${ses(op.sid).n})` : ''}`);
    }
    case 'j:placeSet': {
      const l = lieu(op.pid);
      for (const k of Object.keys(op.v)) if (PLACE_FIELDS.includes(k)) l[k] = op.v[k];
      mark(l, 'fiche');
      return ok(`Lieu ${l.name} : fiche modifiée`, `l|${op.pid}`);
    }
    case 'j:placeDel': {
      const l = lieu(op.pid);
      s.lieux = s.lieux.filter((y) => y !== l);
      s.journal.forEach((x) => { x.placeIds = (x.placeIds || []).filter((id) => id !== l.id); });
      return ok(`Lieu supprimé : ${l.name}`);
    }
    case 'j:placeLink': {
      const x = ses(op.sid); lieu(op.pid); x.placeIds ||= [];
      if (x.placeIds.includes(op.pid)) return { text: '' };
      x.placeIds.push(op.pid);
      return ok(`${lieu(op.pid).name} ajouté à la session ${x.n}`);
    }
    case 'j:placeUnlink': {
      const x = ses(op.sid); x.placeIds = (x.placeIds || []).filter((id) => id !== op.pid);
      return ok(`${s.lieux.find((l) => l.id === op.pid)?.name || 'Lieu'} retiré de la session ${x.n}`);
    }
    case 'j:sketch': { const x = ses(op.sid); x.sketch = op.mid; return ok(`Session ${x.n} : page de croquis ajoutée`); }
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
      const knownL = new Set(s.lieux.map((l) => l.id));
      const lieux = (op.lieux || []).filter((l) => !knownL.has(l.id));
      s.lieux.push(...lieux);
      if (!add.length && !npcs.length && !lieux.length) return { text: '' };
      return ok(`Journal versé : ${add.length} session${add.length > 1 ? 's' : ''}, ${npcs.length} PNJ, ${lieux.length} lieu${lieux.length > 1 ? 'x' : ''}`);
    }
    default: fail('Opération inconnue');
  }
  return { text: '' };
}
