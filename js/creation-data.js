// Tables de création de personnage (chapitre 2 du livre), traduites librement.
// Équipement : chaque objet renvoie à la bibliothèque (library.js) par son nom :
//   w : arme (ou liste d'armes au choix) · a : armure · h : casque · i : objet du matériel (qty : quantité)
//   food / silver : dé des rations et des pièces d'argent.

// Tirages : D12 peuple, D10 profession, D6 âge
export const KIN_ROLL = ['humain', 'humain', 'humain', 'humain', 'halfelin', 'halfelin', 'halfelin', 'nain', 'nain', 'elfe', 'canardin', 'loup'];
export const PROF_ROLL = ['artisan', 'barde', 'guerrier', 'chasseur', 'chevalier', 'mage', 'marin', 'marchand', 'erudit', 'voleur'];
export const AGE_ROLL = ['jeune', 'jeune', 'jeune', 'adulte', 'adulte', 'vieux'];

// Noms typiques de chaque peuple (D6)
export const NAMES = {
  humain: ['Joruna', 'Tym', 'Halvelda', 'Garmander', 'Verolun', 'Lothar'],
  halfelin: ['Snappy', 'Brine', 'Cottar', 'Bumble', 'Perrywick', 'Theoline'],
  nain: ['Tinderrock', 'Halwyld', 'Tymolana', 'Traut', 'Urd', 'Fermer'],
  elfe: ['Arasin', 'Illyriana', 'Galvander', 'Tyrindelia', 'Erwilnor', 'Andremone'],
  canardin: ['Qwucksum', 'Splats', 'Moggee', 'Groddy', 'Blisandina', 'Hackleswell'],
  loup: ['Wyld', 'Ombre-de-loup', 'Lunariem', 'Obdurian', 'Morsure-du-givre', 'Wuldenhall'],
};

// Surnoms typiques de chaque profession (D6)
export const NICKNAMES = {
  artisan: ['Martèle-pierre', 'Fend-bois', 'Poigne-de-fer', 'le Tonnelier', 'Bâtit-ponts', 'Maître-du-fer'],
  barde: ['Faiseur-d’odes', 'le Conteur', 'Voix-d’argent', 'Clef-dorée', 'Langue-de-miel', 'Forge-rimes'],
  guerrier: ['Creuse-tombes', 'Mâchoire-sombre', 'Vent-glacé', 'Acier-froid', 'l’Intrépide', 'le Boucher'],
  chasseur: ['Renard-des-bois', 'Fléau-des-loups', 'l’Éclaireur', 'le Buriné', 'Soif-de-sang', 'Trait-d’ombre'],
  chevalier: ['Cœur-de-dragon', 'Lance-d’or', 'Griffe-de-griffon', 'le Noble', 'Heaume-brillant', 'Cape-de-deuil'],
  mage: ['Cœur-de-racine', 'Dos-voûté', 'Cape-grise', 'Main-d’orage', 'Boite-au-bâton', 'Porte-ombre'],
  marin: ['Eau-vive', 'Chevauche-vagues', 'Né-de-l’écume', 'Embrun-salé', 'Loup-de-mer', 'Court-tempête'],
  marchand: ['Sourire-d’argent', 'Dent-d’or', 'Langue-de-soie', 'le Zézayant-et-Honnête', 'Panse-de-lard', 'Grippe-sou'],
  erudit: ['Esprit-clair', 'Poumon-de-poussière', 'Vue-lointaine', 'le Lettré', 'l’Omniscient', 'le Dodu-et-Savant'],
  voleur: ['Demi-doigt', 'Rat-noir', 'Œil-rouge', 'Pied-léger', 'Double-langue', 'Poignard-de-nuit'],
};

// Capacité héroïque de départ au choix (Artisan)
export const ABILITY_CHOICE = { artisan: ['Maître forgeron', 'Maître charpentier', 'Maître tanneur'] };

const torch = { i: 'Torche' }; const flint = { i: 'Briquet à silex' }; const rope = { i: 'Corde de chanvre (10 m)' };
const pelt = { i: 'Fourrure de couchage' }; const quiver = { i: 'Carquois, flèches à pointe de bois' };
const lantern = [{ i: 'Lanterne' }, { i: 'Huile de lampe' }]; const lamp = [{ i: 'Lampe à huile' }, { i: 'Huile de lampe' }];

// Équipement de départ : trois lots par profession (D6 : 1–2, 3–4, 5–6)
export const GEAR_SETS = {
  artisan: [
    { items: [{ w: 'Marteau de guerre léger' }, { a: 'Cuir' }, { i: 'Outils de forgeron' }, torch, flint], food: 'D8', silver: 'D8' },
    { items: [{ w: 'Hachette' }, { a: 'Cuir' }, { i: 'Outils de charpentier' }, torch, rope, flint], food: 'D8', silver: 'D8' },
    { items: [{ w: 'Couteau' }, { a: 'Cuir' }, { i: 'Outils de tanneur' }, ...lantern, flint], food: 'D8', silver: 'D8' },
  ],
  barde: [
    { items: [{ i: 'Lyre' }, { w: 'Couteau' }, ...lamp, flint], food: 'D6', silver: 'D8' },
    { items: [{ i: 'Flûte' }, { w: 'Dague' }, rope, torch, flint], food: 'D6', silver: 'D8' },
    { items: [{ i: 'Cor' }, { w: 'Couteau' }, torch, flint], food: 'D6', silver: 'D8' },
  ],
  guerrier: [
    { items: [{ w: ['Épée large', 'Hache de bataille', 'Morgenstern'] }, { w: 'Petit bouclier' }, { a: 'Cotte de mailles' }, torch, flint], food: 'D6', silver: 'D6' },
    { items: [{ w: ['Épée courte', 'Hachette', 'Lance courte'] }, { w: 'Arbalète légère' }, quiver, { a: 'Cuir' }, torch, flint], food: 'D6', silver: 'D6' },
    { items: [{ w: 'Lance longue' }, { a: 'Cuir clouté' }, { h: 'Casque ouvert' }, torch, flint], food: 'D6', silver: 'D6' },
  ],
  chasseur: [
    { items: [{ w: 'Dague' }, { w: 'Arc court' }, quiver, { a: 'Cuir' }, pelt, torch, flint, rope, { i: 'Collet' }], food: 'D8', silver: 'D6' },
    { items: [{ w: 'Couteau' }, { w: 'Arc long' }, quiver, { a: 'Cuir' }, pelt, torch, flint, rope, { i: 'Canne à pêche' }], food: 'D8', silver: 'D6' },
    { items: [{ w: 'Dague' }, { w: 'Fronde' }, { a: 'Cuir' }, pelt, torch, flint, rope, { i: 'Collet' }], food: 'D8', silver: 'D6' },
  ],
  chevalier: [
    { items: [{ w: ['Épée large', 'Morgenstern'] }, { w: 'Petit bouclier' }, { a: 'Armure de plates' }, { h: 'Heaume' }, torch, flint], food: 'D6', silver: 'D12' },
    { items: [{ w: ['Fléau', 'Marteau de guerre léger'] }, { w: 'Petit bouclier' }, { a: 'Cotte de mailles' }, { h: 'Casque ouvert' }, torch, flint], food: 'D6', silver: 'D12' },
    { items: [{ w: 'Épée courte' }, { w: 'Lance de cavalerie' }, { w: 'Petit bouclier' }, { a: 'Cotte de mailles' }, { h: 'Casque ouvert' }, { i: 'Cheval de guerre' }], food: 'D6', silver: 'D12' },
  ],
  mage: [
    { items: [{ w: 'Bâton' }, { i: 'Boule de cristal' }, { i: 'Grimoire' }, torch, flint], food: 'D6', silver: 'D8' },
    { items: [{ w: 'Couteau' }, { i: 'Baguette' }, { i: 'Grimoire' }, torch, flint], food: 'D6', silver: 'D8' },
    { items: [{ i: 'Amulette' }, { i: 'Grimoire' }, pelt, torch, flint], food: 'D6', silver: 'D8' },
  ],
  marin: [
    { items: [{ w: 'Dague' }, { w: 'Arc court' }, quiver, rope, { i: 'Grappin' }, pelt, torch, flint], food: 'D8', silver: 'D10' },
    { items: [{ w: 'Cimeterre' }, { a: 'Cuir' }, rope, { i: 'Grappin' }, torch, flint], food: 'D8', silver: 'D10' },
    { items: [{ w: 'Trident' }, { i: 'Longue-vue' }, rope, { i: 'Grappin' }, torch, flint], food: 'D8', silver: 'D10' },
  ],
  marchand: [
    { items: [{ w: 'Dague' }, pelt, torch, flint, rope, { i: 'Âne' }], food: 'D6', silver: 'D12' },
    { items: [{ w: 'Couteau' }, pelt, ...lantern, flint, { i: 'Cuisine de campagne' }, { i: 'Âne' }, { i: 'Charrette' }], food: 'D6', silver: 'D12' },
    { items: [{ w: 'Dague' }, pelt, { i: 'Grande tente' }, ...lamp, flint, { i: 'Sac à dos' }], food: 'D6', silver: 'D12' },
  ],
  erudit: [
    { items: [{ w: 'Bâton' }, { i: 'Carnet' }, { i: 'Plume et encre' }, pelt, torch, flint], food: 'D6', silver: 'D10' },
    { items: [{ w: 'Couteau' }, { i: 'Livre' }, pelt, ...lamp, flint], food: 'D6', silver: 'D10' },
    { items: [{ w: 'Épée courte' }, { i: 'Bandages (10)' }, { i: 'Poison soporifique (dose)' }, pelt, ...lantern, flint], food: 'D6', silver: 'D10' },
  ],
  voleur: [
    { items: [{ w: 'Dague' }, { w: 'Fronde' }, rope, { i: 'Grappin' }, torch, flint], food: 'D6', silver: 'D10' },
    { items: [{ w: 'Couteau' }, { i: 'Crochets de serrurier simples' }, torch, flint], food: 'D6', silver: 'D10' },
    { items: [{ w: 'Dague' }, { w: 'Dague' }, { i: 'Billes' }, rope, torch, flint], food: 'D6', silver: 'D10' },
  ],
};

// Faiblesse (D20)
export const WEAKNESSES = [
  'Crédule. Je crois tout ce qu’on me dit.',
  'Avide. Je veux une plus grosse part de chaque trésor.',
  'Susceptible. Je ne supporte aucune provocation.',
  'Téméraire. Je suis toujours le premier à foncer vers le danger.',
  'Timoré. Je reste toujours à l’arrière du groupe.',
  'Tueur de monstres. Tous les monstres sont mauvais et doivent être abattus.',
  'Intolérant. Les peuples de la nuit, comme les orques et les gobelins, sont mauvais et doivent être combattus.',
  'Paresseux. Je saisis chaque occasion de me reposer.',
  'Gourmand. Je saisis chaque occasion de manger quelque chose de bon.',
  'Kleptomane. Je ne peux pas m’empêcher de voler les objets de valeur.',
  'Vaniteux. J’aide quiconque me flatte ou me complimente.',
  'Imprudent. Je prends toujours de gros risques sans penser aux conséquences.',
  'Craint la magie. La magie est une force maléfique et on ne peut pas se fier aux mages.',
  'Soif de savoir. La quête du savoir passe avant mes amis.',
  'Enfant de la nature. Je ne dors jamais sous un toit.',
  'Vantard. J’exagère toujours mes exploits.',
  'Violent. Je règle tous les obstacles par la violence.',
  'Autoritaire. Je dis toujours aux autres ce qu’ils doivent faire.',
  'Pessimiste. Je pense toujours que les choses vont mal tourner.',
  'Hautain. Je méprise tous ceux que je rencontre.',
];

// Souvenir (D20) : un objet minuscule sans usage, auquel on tient
export const MEMENTOS = [
  'Tes bonnes vieilles chaussures', 'Un simple médaillon d’argent', 'Une lettre d’un vieil ami ou d’un parent', 'Un vieux journal en lambeaux',
  'Un bracelet transmis dans ta famille', 'Une figurine de bois reçue enfant', 'Une pierre à la forme étrange', 'Une pièce de cuivre d’un trésor que cherchait ta mère ou ton père',
  'Une vieille chope d’étain', 'Une corne prise à un monstre en trophée', 'Un croc pris à une bête en trophée', 'Une paire de dés en os',
  'Un médaillon contenant une mèche de cheveux', 'Une clé ouvragée', 'Une carte dessinée à la main, héritée', 'Une bague gravée',
  'Un sifflet en os', 'Le vieux chapeau râpé de ta mère ou de ton père', 'Une plume de griffon', 'Une pipe joliment sculptée',
];

// Apparence (D20)
export const APPEARANCES = [
  'Une vilaine cicatrice sur la joue', 'Un étrange couvre-chef', 'Teint anormalement pâle et blafard', 'Un sourire toujours aux lèvres',
  'Regard glacial et perçant', 'Quelques kilos en trop autour de la taille', 'Maigre et nerveux', 'Pilosité abondante (selon le peuple)',
  'Calvitie naissante (selon le peuple)', 'Un tatouage bien visible', 'Une forte odeur corporelle', 'Une coiffure magnifique',
  'Boiteux', 'Crasseux', 'De francs yeux bleus', 'Une dent d’argent',
  'Lourdement parfumé', 'Des yeux de couleurs différentes', 'Une voix sifflante', 'Un visage buriné',
];
