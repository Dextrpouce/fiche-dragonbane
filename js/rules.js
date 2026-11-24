// Règles de Dragonbane : attributs, compétences, peuples, professions et calculs.
// Les listes servent de suggestions : tout reste modifiable dans l'appli (mode libre).

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
export const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

// ----- Attributs et états -----
export const ATTRS = [
  { key: 'FOR', name: 'Force', cond: 'Épuisé' },
  { key: 'CON', name: 'Constitution', cond: 'Malade' },
  { key: 'AGI', name: 'Agilité', cond: 'Étourdi' },
  { key: 'INT', name: 'Intelligence', cond: 'Furieux' },
  { key: 'VOL', name: 'Volonté', cond: 'Effrayé' },
  { key: 'CHA', name: 'Charisme', cond: 'Découragé' },
];
export const ATTR = Object.fromEntries(ATTRS.map((a) => [a.key, a]));

// Chance de base d'une compétence selon l'attribut (doublée si la compétence est entraînée)
export function baseChance(v) {
  v = +v || 0;
  if (v <= 5) return 3;
  if (v <= 8) return 4;
  if (v <= 12) return 5;
  if (v <= 15) return 6;
  return 7;
}

// Bonus aux dégâts (FOR au contact, AGI à distance)
export function damageBonus(v) {
  v = +v || 0;
  if (v >= 17) return 'D6';
  if (v >= 13) return 'D4';
  return '';
}

// Modificateur de déplacement selon l'AGI
export function moveMod(agi) {
  agi = +agi || 0;
  if (agi <= 6) return -4;
  if (agi <= 9) return -2;
  if (agi <= 12) return 0;
  if (agi <= 15) return 2;
  return 4;
}

// ----- Compétences -----
export const SKILLS = [
  // Compétences générales
  ['acrobatie', 'Acrobatie', 'AGI', 'gen'],
  ['artisanat', 'Artisanat', 'FOR', 'gen'],
  ['bluff', 'Bluff', 'CHA', 'gen'],
  ['chasse', 'Chasse et pêche', 'AGI', 'gen'],
  ['betes', 'Connaissance des bêtes', 'INT', 'gen'],
  ['discretion', 'Discrétion', 'AGI', 'gen'],
  ['equitation', 'Équitation', 'AGI', 'gen'],
  ['escamotage', 'Escamotage', 'AGI', 'gen'],
  ['esquive', 'Esquive', 'AGI', 'gen'],
  ['fouille', 'Fouille', 'INT', 'gen'],
  ['langues', 'Langues', 'INT', 'gen'],
  ['marchandage', 'Marchandage', 'CHA', 'gen'],
  ['mythes', 'Mythes et légendes', 'INT', 'gen'],
  ['natation', 'Natation', 'AGI', 'gen'],
  ['navigation', 'Navigation', 'INT', 'gen'],
  ['persuasion', 'Persuasion', 'CHA', 'gen'],
  ['representation', 'Représentation', 'CHA', 'gen'],
  ['soins', 'Soins', 'INT', 'gen'],
  ['survie', 'Survie', 'INT', 'gen'],
  ['vigilance', 'Vigilance', 'INT', 'gen'],
  // Compétences d'armes
  ['arbaletes', 'Arbalètes', 'AGI', 'arme'],
  ['arcs', 'Arcs', 'AGI', 'arme'],
  ['bagarre', 'Bagarre', 'FOR', 'arme'],
  ['batons', 'Bâtons', 'AGI', 'arme'],
  ['couteaux', 'Couteaux', 'AGI', 'arme'],
  ['epees', 'Épées', 'FOR', 'arme'],
  ['frondes', 'Frondes', 'AGI', 'arme'],
  ['haches', 'Haches', 'FOR', 'arme'],
  ['lances', 'Lances', 'FOR', 'arme'],
  ['marteaux', 'Marteaux', 'FOR', 'arme'],
  // Compétences secondaires (écoles de magie)
  ['animisme', 'Animisme', 'VOL', 'magie'],
  ['elementalisme', 'Élémentalisme', 'VOL', 'magie'],
  ['mentalisme', 'Mentalisme', 'VOL', 'magie'],
].map(([id, name, attr, kind]) => ({ id, name, attr, kind }));
export const SKILL = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
export const SKILL_KINDS = { gen: 'Générales', arme: 'Armes', magie: 'Magie', autre: 'Autres' };
export const MAGIC_SKILLS = ['animisme', 'elementalisme', 'mentalisme'];

// ----- Peuples -----
// Capacités innées : [nom, coût en PVol]
export const KINS = [
  { key: 'humain', name: 'Humain', move: 10, abilities: [['Adaptable', '3']] },
  { key: 'halfelin', name: 'Halfelin', move: 8, abilities: [['Insaisissable', '3']] },
  { key: 'nain', name: 'Nain', move: 8, abilities: [['Rancunier', '3']] },
  { key: 'elfe', name: 'Elfe', move: 10, abilities: [['Paix intérieure', '']] },
  { key: 'canardin', name: 'Canardin', move: 8, abilities: [['Colérique', ''], ['Pattes palmées', '']] },
  { key: 'loup', name: 'Homme-loup', move: 12, abilities: [['Instinct de chasseur', '3']] },
  { key: 'autre', name: 'Autre', move: 10, abilities: [] },
];
export const KIN = Object.fromEntries(KINS.map((k) => [k.key, k]));

// ----- Professions -----
export const PROFESSIONS = [
  { key: 'artisan', name: 'Artisan', attr: 'FOR', ability: 'Maître forgeron', skills: ['artisanat', 'haches', 'bagarre', 'marteaux', 'couteaux', 'escamotage', 'fouille', 'epees'] },
  { key: 'barde', name: 'Barde', attr: 'CHA', ability: 'Musicien', skills: ['acrobatie', 'bluff', 'esquive', 'couteaux', 'langues', 'mythes', 'representation', 'persuasion'] },
  { key: 'guerrier', name: 'Guerrier', attr: 'FOR', ability: 'Vétéran', skills: ['haches', 'arcs', 'bagarre', 'arbaletes', 'esquive', 'marteaux', 'lances', 'epees'] },
  { key: 'chasseur', name: 'Chasseur', attr: 'AGI', ability: 'Compagnon', skills: ['acrobatie', 'vigilance', 'arcs', 'survie', 'chasse', 'couteaux', 'frondes', 'discretion'] },
  { key: 'chevalier', name: 'Chevalier', attr: 'FOR', ability: 'Gardien', skills: ['betes', 'marteaux', 'mythes', 'representation', 'persuasion', 'equitation', 'lances', 'epees'] },
  { key: 'mage', name: 'Mage', attr: 'VOL', ability: '', skills: [] },
  { key: 'marin', name: 'Marin', attr: 'AGI', ability: 'Pied marin', skills: ['acrobatie', 'vigilance', 'chasse', 'couteaux', 'langues', 'navigation', 'natation', 'epees'] },
  { key: 'marchand', name: 'Marchand', attr: 'CHA', ability: 'Chasseur de trésors', skills: ['vigilance', 'marchandage', 'bluff', 'esquive', 'couteaux', 'persuasion', 'escamotage', 'fouille'] },
  { key: 'erudit', name: 'Érudit', attr: 'INT', ability: 'Intuition', skills: ['vigilance', 'betes', 'survie', 'esquive', 'soins', 'langues', 'mythes', 'fouille'] },
  { key: 'voleur', name: 'Voleur', attr: 'AGI', ability: 'Poignarder', skills: ['acrobatie', 'vigilance', 'bluff', 'esquive', 'couteaux', 'escamotage', 'discretion', 'fouille'] },
  { key: 'autre', name: 'Autre', attr: '', ability: '', skills: [] },
];
export const PROF = Object.fromEntries(PROFESSIONS.map((p) => [p.key, p]));

// Écoles de magie du Mage : compétence d'école + compétences proposées
export const SCHOOLS = {
  animisme: { name: 'Animiste', skills: ['animisme', 'betes', 'survie', 'esquive', 'soins', 'chasse', 'discretion', 'batons'] },
  elementalisme: { name: 'Élémentaliste', skills: ['elementalisme', 'vigilance', 'esquive', 'soins', 'langues', 'mythes', 'fouille', 'batons'] },
  mentalisme: { name: 'Mentaliste', skills: ['mentalisme', 'acrobatie', 'vigilance', 'bagarre', 'esquive', 'soins', 'langues', 'mythes'] },
};

// Âge : compétences libres en plus des 6 de profession, et effet sur les attributs (maximum 18)
export const AGES = [
  { key: 'jeune', name: 'Jeune', free: 2, mods: { AGI: 1, CON: 1 } },
  { key: 'adulte', name: 'Adulte', free: 4, mods: {} },
  { key: 'vieux', name: 'Âgé', free: 6, mods: { FOR: -2, AGI: -2, CON: -2, INT: 1, VOL: 1 } },
];
export const AGE = Object.fromEntries(AGES.map((a) => [a.key, a]));

export function professionSkills(prof, school) {
  if (prof === 'mage') return SCHOOLS[school]?.skills || [];
  return PROF[prof]?.skills || [];
}

// ----- Questions de fin de séance (une coche d'amélioration par « oui ») -----
export const SESSION_QUESTIONS = [
  'As-tu participé à la séance ?',
  'As-tu exploré un nouveau lieu ?',
  'As-tu vaincu un ou plusieurs adversaires dangereux ?',
  'As-tu surmonté un obstacle sans recourir à la force ?',
  'As-tu cédé à ta faiblesse ?',
];
export const WEAKNESS_OVERCOME = 'As-tu agi clairement contre ta faiblesse ? (2 coches ; la faiblesse est surmontée)';

// ----- Capacités héroïques : [nom, prérequis, coût en PVol] -----
export const HEROIC = [
  ['Ambidextre', 'Arme de contact 12', '3'], ['Assassin', 'Couteaux 12', '3'], ['Belette', 'Esquive 12', '3'],
  ['Berserker', 'Arme de contact 12', '3'], ['Blocage au bouclier', 'Arme de contact (FOR) 12', '2'], ['Bras de lanceur', 'Arme de contact 12', '2'],
  ['Chasseur de monstres', 'Connaissance des bêtes 12', '3'], ['Chasseur de trésors', 'Marchandage 12', '3'], ['Compagnon', 'Chasse et pêche 12', '3'],
  ['Contorsionniste', 'Esquive 12', '1'], ['Coup double', 'Haches ou Épées 12', '3'], ['Coup puissant', 'Arme de contact (FOR) 12', '3'],
  ['Cri de guerre', '—', '3'], ['Défensif', 'Arme de contact 12', '3'], ['Déguisement', 'Bluff 12', '2'],
  ['Dévier les flèches', 'Arme de contact 12', '1'], ['Éclaireur', 'Survie 12', '1'], ['Félin', 'Acrobatie 12', 'Variable'],
  ['Focalisé', '—', ''], ['Gardien', 'Haches, Marteaux ou Épées 12', '2'], ['Guérison rapide', '—', '2'],
  ['Intendant', 'Survie 12', '1'], ['Intrépide', '—', '2'], ['Intuition', 'Mythes et légendes 12', '3'],
  ['Jeu de jambes', 'Esquive 12', '3'], ['Loup solitaire', 'Survie 12', ''], ['Maître charpentier', 'Artisanat 12', 'Variable'],
  ['Maître cuisinier', '—', '1'], ['Maître forgeron', 'Artisanat 12', 'Variable'], ['Maître sorcier', 'École de magie 12', '3'],
  ['Maître tanneur', 'Artisanat 12', 'Variable'], ['Musicien', 'Représentation 12', '3'], ['Œil d’aigle', 'Vigilance 12', '2'],
  ['Perspicacité', 'Persuasion 12', '2'], ['Pied marin', 'Natation 12', '1'], ['Poignarder', 'Couteaux 12', '3'],
  ['Poigne de fer', 'Bagarre 12', '1'], ['Poing de fer', 'Bagarre 12', '1'], ['Rapide comme l’éclair', 'Esquive 12', '2'],
  ['Robuste', '—', ''], ['Talent magique', '—', ''], ['Tir double', 'Arcs 12', '3'],
  ['Tueur de dragons', 'Arme 12', '3'], ['Vétéran', 'Arme 12', '1'],
].map(([name, req, wp]) => ({ name, req, wp }));
export const findHeroic = (name) => HEROIC.find((h) => norm(h.name) === norm(name)) || null;
// Capacités qui augmentent un maximum (+2, cumulables)
export const POOL_ABILITIES = { robuste: 'hp', focalise: 'wp' };

// ----- Personnage -----
// Niveau de départ : chance de base, doublée si entraînée. Les écoles de magie n'ont pas de chance de base.
export function startValue(kind, attrValue, trained) {
  const b = baseChance(attrValue);
  if (kind === 'magie') return trained ? b * 2 : 0;
  return trained ? b * 2 : b;
}

export function newCharacter({ name = '', kin = 'humain', profession = 'guerrier', school = '', age = 'adulte', attrs, trained = [] } = {}) {
  const a = { FOR: 10, CON: 10, AGI: 10, INT: 10, VOL: 10, CHA: 10, ...(attrs || {}) };
  const set = new Set(trained);
  if (profession === 'mage' && SCHOOLS[school]) set.add(school);
  const skills = SKILLS.map((s) => ({
    id: s.id, name: s.name, attr: s.attr, kind: s.kind,
    trained: set.has(s.id),
    value: startValue(s.kind, a[s.attr], set.has(s.id)),
    mark: false,
  }));
  const pa = PROF[profession]?.ability;
  const abilities = [
    ...(KIN[kin]?.abilities || []).map(([n, wp]) => ({ id: uid(), name: n, wp, desc: '', source: 'Peuple' })),
    ...(pa ? [{ id: uid(), name: pa, wp: findHeroic(pa)?.wp || '', req: findHeroic(pa)?.req || '', desc: '', source: 'Profession' }] : []),
  ];
  return upgradeCharacter({
    id: uid(), name, kin, kinName: '', profession, professionName: '', school, age,
    attrs: a,
    hp: { cur: a.CON, bonus: 0 },
    wp: { cur: a.VOL, bonus: 0 },
    conditions: {},
    death: { succ: 0, fail: 0 },
    skills, abilities,
    weapons: [], armor: { name: '', rating: 0, banes: '' }, helmet: { name: '', rating: 0, banes: '' },
    items: [], tiny: '', backpack: true,
    money: { or: 0, argent: 0, cuivre: 0 },
    spells: [], tricks: [],
    appearance: '', weakness: '', memento: '', notes: '', companions: '',
    pendingMarks: 0,
    log: [],
    createdAt: Date.now(),
  });
}

// Complète les anciennes fiches (champs ajoutés au fil des versions)
export function upgradeCharacter(c) {
  c.attrs ??= { FOR: 10, CON: 10, AGI: 10, INT: 10, VOL: 10, CHA: 10 };
  c.hp ??= { cur: c.attrs.CON, bonus: 0 };
  c.wp ??= { cur: c.attrs.VOL, bonus: 0 };
  c.conditions ??= {};
  c.death ??= { succ: 0, fail: 0 };
  c.skills ??= [];
  for (const s of SKILLS) if (!c.skills.some((x) => x.id === s.id)) c.skills.push({ ...s, trained: false, value: startValue(s.kind, c.attrs[s.attr], false), mark: false });
  c.abilities ??= [];
  c.weapons ??= [];
  c.armor ??= { name: '', rating: 0, banes: '' };
  c.helmet ??= { name: '', rating: 0, banes: '' };
  c.items ??= [];
  c.money ??= { or: 0, argent: 0, cuivre: 0 };
  c.spells ??= [];
  c.tricks ??= [];
  c.log ??= [];
  c.pendingMarks ??= 0;
  c.backpack ??= true;
  return c;
}

export const kinName = (c) => (c.kin === 'autre' ? c.kinName : KIN[c.kin]?.name) || c.kinName || '';
export const profName = (c) => {
  if (c.profession === 'autre') return c.professionName || '';
  const p = PROF[c.profession]?.name || c.professionName || '';
  return c.profession === 'mage' && SCHOOLS[c.school] ? `${p} ${SCHOOLS[c.school].name.toLowerCase()}` : p;
};

export const maxHP = (c) => (+c.attrs.CON || 0) + (+c.hp.bonus || 0);
export const maxWP = (c) => (+c.attrs.VOL || 0) + (+c.wp.bonus || 0);
export function movement(c) {
  const base = c.kin === 'autre' ? (+c.kinMove || 10) : (KIN[c.kin]?.move ?? 10);
  return Math.max(0, base + moveMod(c.attrs.AGI));
}
export const encLimit = (c) => Math.ceil((+c.attrs.FOR || 0) / 2) + (c.backpack ? 2 : 0);
// Seul l'inventaire compte : armes à portée de main (3 max), armure et casque portés ne comptent pas
export function encUsed(c) {
  return c.items.reduce((n, it) => n + (it.worn ? 0 : (+it.weight || 0) * (+it.qty || 1)), 0);
}
export const knowsMagic = (s) => s.kind === 'magie' && (s.trained || +s.value > 0);
export const isCaster = (c) => c.profession === 'mage' || c.spells.length > 0 || c.tricks.length > 0 || c.skills.some(knowsMagic);
export const preparedMax = (c) => baseChance(c.attrs.INT);
export const hasCondition = (c, attr) => !!c.conditions[attr];

// Total d'armure (armure + casque)
export const armorTotal = (c) => (+c.armor.rating || 0) + (+c.helmet.rating || 0);

// Désavantages imposés par l'armure/le casque à une compétence (liste séparée par des virgules)
export function armorBanes(c, skill) {
  const n = norm(skill.name);
  const hit = (txt) => (txt || '').split(/[,;]/).map(norm).filter(Boolean).some((x) => x === n);
  return [c.armor, c.helmet].filter((a) => hit(a.banes)).map((a) => a.name || 'Armure');
}

// ----- Dés -----
export const d = (n) => 1 + Math.floor(Math.random() * n);

// Lance une expression de dés : « 2D6 », « D8+D4 », « D10+2 »
export function rollExpr(expr) {
  const parts = String(expr || '').toUpperCase().replace(/\s+/g, '').match(/[+-]?[^+-]+/g) || [];
  let total = 0; let detail = '';
  for (const p of parts) {
    const sign = p.startsWith('-') ? -1 : 1;
    const t = p.replace(/^[+-]/, '');
    const m = t.match(/^(\d*)D(\d+)$/);
    let txt = null;
    if (m) {
      const n = +(m[1] || 1); const f = +m[2];
      const rolls = Array.from({ length: n }, () => d(f));
      total += sign * rolls.reduce((a, b) => a + b, 0);
      txt = `${n > 1 ? n : ''}D${f} [${rolls.join(', ')}]`;
    } else if (/^\d+$/.test(t)) { total += sign * +t; txt = t; }
    if (txt) detail += `${detail ? (sign < 0 ? ' − ' : ' + ') : (sign < 0 ? '−' : '')}${txt}`;
  }
  return { total: Math.max(0, total), detail };
}

// Jet de D20 sous une valeur, avec avantages (boons) et désavantages (banes) qui s'annulent
export function rollD20(target, boons = 0, banes = 0) {
  const net = boons - banes;
  const dice = [d(20)];
  if (net !== 0) dice.push(d(20));
  const kept = net > 0 ? Math.min(...dice) : net < 0 ? Math.max(...dice) : dice[0];
  const dragon = kept === 1;
  const demon = kept === 20;
  const success = dragon || (!demon && kept <= target);
  return { dice, kept, net, dragon, demon, success, target };
}
