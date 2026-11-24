// Bibliothèque intégrée : armes, armures et sorts de Dragonbane.
// Noms traduits librement de l'anglais ; caractéristiques reprises des tables du livre ;
// effets résumés en quelques mots (se reporter au livre pour le détail).

// ----- Armes -----
// skill : compétence utilisée · grip : prise · str : FOR minimale · range : portée (m, « FOR » = valeur de FOR)
// damage · dur : solidité · bonus : attribut du bonus aux dégâts ('' = aucun)
const M = (name, skill, grip, str, range, damage, dur, cost, features, bonus) => ({ name, skill, grip, str, range, damage, dur, cost, features, bonus, kind: 'contact' });
const D = (name, skill, grip, str, range, damage, dur, cost, features, bonus) => ({ name, skill, grip, str, range, damage, dur, cost, features, bonus, kind: 'distance' });

export const WEAPONS = [
  M('Mains nues', 'bagarre', '—', 0, '2', 'D6', '', '—', 'Contondante', 'FOR'),
  M('Objet contondant léger', 'marteaux', '1 main', 0, 'FOR', 'D8', '3', '—', 'Contondante, peut être lancé', 'FOR'),
  M('Objet contondant lourd', 'marteaux', '2 mains', 16, '2', '2D8', '3', '—', 'Contondante', 'FOR'),
  M('Couteau', 'couteaux', '1 main', 0, 'FOR', 'D8', '6', '5 argent', 'Discrète, perforante, peut être lancé', 'AGI'),
  M('Dague', 'couteaux', '1 main', 0, 'FOR', 'D8', '9', '1 or', 'Discrète, perforante, tranchante, peut être lancée', 'AGI'),
  M('Main-gauche', 'couteaux', '1 main', 0, '2', 'D6', '15', '2 or', 'Discrète, perforante, tranchante', 'AGI'),
  M('Épée courte', 'epees', '1 main', 7, '2', 'D10', '12', '8 or', 'Perforante, tranchante', 'FOR'),
  M('Épée large', 'epees', '1 main', 10, '2', '2D6', '15', '12 or', 'Perforante, tranchante', 'FOR'),
  M('Épée longue', 'epees', '1 main', 13, '2', '2D8', '15', '25 or', 'Perforante, tranchante', 'FOR'),
  M('Épée à deux mains', 'epees', '2 mains', 16, '2', '2D10', '15', '50 or', 'Perforante, tranchante', 'FOR'),
  M('Cimeterre', 'epees', '1 main', 10, '2', '2D6', '12', '10 or', 'Renversement, tranchante', 'FOR'),
  M('Hachette', 'haches', '1 main', 7, 'FOR', '2D6', '9', '2 or', 'Renversement, tranchante, peut être lancée', 'FOR'),
  M('Hache de bataille', 'haches', '1 main', 13, '2', '2D8', '9', '10 or', 'Renversement, tranchante', 'FOR'),
  M('Hache à deux mains', 'haches', '2 mains', 16, '2', '2D10', '9', '25 or', 'Renversement, tranchante', 'FOR'),
  M('Masse', 'marteaux', '1 main', 7, '2', '2D4', '12', '8 or', 'Contondante', 'FOR'),
  M('Morgenstern', 'marteaux', '1 main', 13, '2', '2D8', '12', '14 or', 'Contondante', 'FOR'),
  M('Fléau', 'marteaux', '1 main', 13, '2', '2D8', '', '16 or', 'Contondante, renversement, ne peut pas parer', 'FOR'),
  M('Marteau de guerre léger', 'marteaux', '1 main', 10, '2', '2D6', '12', '10 or', 'Contondante, renversement', 'FOR'),
  M('Marteau de guerre lourd', 'marteaux', '2 mains', 16, '2', '2D10', '12', '20 or', 'Contondante, renversement', 'FOR'),
  M('Petit gourdin', 'marteaux', '1 main', 7, '2', 'D8', '9', '1 argent', 'Contondante', 'FOR'),
  M('Grand gourdin', 'marteaux', '2 mains', 16, '2', '2D8', '12', '2 argent', 'Contondante', 'FOR'),
  M('Bâton', 'batons', '2 mains', 7, '2', 'D8', '9', '2 argent', 'Contondante, renversement', 'AGI'),
  M('Lance courte', 'lances', '1 main', 7, 'FOR×2', 'D10', '9', '5 argent', 'Perforante, peut être lancée', 'FOR'),
  M('Lance longue', 'lances', '2 mains', 10, '4', '2D8', '9', '1 or', 'Longue, perforante', 'FOR'),
  M('Lance de cavalerie', 'lances', '1 main', 13, '4', '2D10', '12', '12 or', 'Longue, perforante, monture entraînée au combat', 'FOR'),
  M('Hallebarde', 'lances', '2 mains', 13, '4', '2D8', '12', '20 or', 'Longue, renversement, perforante, tranchante', 'FOR'),
  M('Trident', 'lances', '1 main', 10, 'FOR', '2D6', '9', '5 or', 'Renversement, perforant, peut être lancé', 'FOR'),
  M('Petit bouclier', 'epees', '1 main', 7, '2', 'D8', '15', '4 or', 'Contondant. Pas de compétence propre : n’importe quelle arme de contact sauf Couteaux et Bâtons', 'FOR'),
  M('Grand bouclier', 'epees', '1 main', 13, '2', 'D8', '18', '12 or', 'Contondant. Pas de compétence propre : n’importe quelle arme de contact sauf Couteaux et Bâtons', 'FOR'),
  D('Fronde', 'frondes', '1 main', 0, '20', 'D8', '', '1 argent', 'Contondante, objet minuscule', 'AGI'),
  D('Arc court', 'arcs', '2 mains', 7, '30', 'D10', '3', '25 or', 'Perforante, carquois nécessaire', 'AGI'),
  D('Arc long', 'arcs', '2 mains', 13, '100', 'D12', '6', '50 or', 'Perforante, carquois nécessaire', 'AGI'),
  D('Arbalète légère', 'arbaletes', '2 mains', 7, '40', '2D6', '6', '75 or', 'Perforante, carquois nécessaire, sans bonus aux dégâts', ''),
  D('Arbalète lourde', 'arbaletes', '2 mains', 13, '60', '2D8', '9', '200 or', 'Perforante, carquois nécessaire, sans bonus aux dégâts', ''),
  D('Arbalète de poing', 'arbaletes', '1 main', 7, '30', '2D6', '6', '90 or', 'Perforante, carquois nécessaire, sans bonus aux dégâts', ''),
];

// ----- Armures et casques -----
export const ARMORS = [
  { name: 'Cuir', slot: 'armor', rating: 1, cost: '2 or', banes: '' },
  { name: 'Cuir clouté', slot: 'armor', rating: 2, cost: '10 or', banes: 'Discrétion' },
  { name: 'Cotte de mailles', slot: 'armor', rating: 4, cost: '50 or', banes: 'Esquive, Discrétion' },
  { name: 'Armure de plates', slot: 'armor', rating: 6, cost: '500 or', banes: 'Acrobatie, Esquive, Discrétion' },
  { name: 'Casque ouvert', slot: 'helmet', rating: 1, cost: '12 or', banes: 'Vigilance' },
  { name: 'Heaume', slot: 'helmet', rating: 2, cost: '100 or', banes: 'Vigilance, Arcs, Arbalètes, Frondes' },
];

// ----- Tours de magie (1 PVol, réussite automatique) -----
const T = (name, school, desc) => ({ name, school, desc });
export const TRICKS = [
  T('Rapporter', 'general', 'Un objet libre (poids 1 au plus) à 10 m vient flotter jusqu’à toi.'),
  T('Pichenette', 'general', 'Une pichenette magique à 10 m : 1 point de dégâts (assez pour briser du verre).'),
  T('Lumière', 'general', 'Une lumière vive sur un focus éclaire 10 m de rayon pendant un quart ; elle s’éteint si tu tombes à 0 PV.'),
  T('Ouvrir/Fermer', 'general', 'Ouvre ou ferme une porte non verrouillée visible à 10 m.'),
  T('Raccommoder', 'general', 'Des vêtements à 10 m sont aussitôt réparés et propres.'),
  T('Sentir la magie', 'general', 'Tu sais si le lieu ou l’objet tenu est magique, et de quelle magie.'),
  T('Chant d’oiseaux', 'animisme', 'Des oiseaux chantent autour de toi pendant un intervalle : avantage en Vigilance (dehors seulement).'),
  T('Nettoyer', 'animisme', 'La pièce est nettoyée et rangée.'),
  T('Cuisiner', 'animisme', 'Tu réussis la cuisine sans jet de Survie, instantanément.'),
  T('Sentier fleuri', 'animisme', 'Des fleurs poussent sur tes pas et fanent au bout d’un quart.'),
  T('Coiffure', 'animisme', 'Tu changes couleur, longueur et style de tes cheveux ; parfois un avantage en Bluff ou Persuasion.'),
  T('Chaud/Froid', 'elementalisme', 'Rend les 10 m autour de toi tièdes ou frais ; protège du froid pendant un quart.'),
  T('Embraser', 'elementalisme', 'Allume ou éteint une bougie, une torche ou une lanterne à 10 m.'),
  T('Nuage de fumée', 'elementalisme', 'Un nuage de fumée spectaculaire ; parfois un avantage en Discrétion.'),
  T('Verrouiller/Déverrouiller', 'mentalisme', 'Ton toucher ferme ou ouvre une serrure non magique.'),
  T('Tabouret magique', 'mentalisme', 'Une surface ronde d’un demi-mètre où s’asseoir ou poser des choses, jusqu’à ton départ.'),
  T('Chute ralentie', 'mentalisme', 'Tu ralentis ta chute et atterris en douceur, quelle que soit la hauteur.'),
];

// ----- Sorts (2 PVol par niveau de puissance) -----
// req : composantes · time : temps d'incantation · prereq : prérequis
const S = (name, school, rank, prereq, req, time, range, duration, desc) => ({ name, school, rank, prereq, req, time, range, duration, desc, power: true });
export const SPELLS = [
  // Magie générale
  S('Dissipation', 'general', 1, 'Une école de magie', 'Mot, geste', 'Action', '10 m', 'Instantanée', 'Annule un sort en cours de puissance inférieure ou égale.'),
  S('Protecteur', 'general', 1, 'Une école de magie', 'Geste, ingrédient (de quoi dessiner)', 'Action', 'Toucher', 'Quart', 'Protège une personne ou un lieu : la puissance des sorts qui le visent baisse d’autant ; contre les attaques magiques de monstres, −1 dé de dégâts par niveau.'),
  S('Bouclier magique', 'general', 2, 'Protecteur ou Dissipation', 'Geste', 'Réaction', '10 m', 'Instantanée', 'En réaction au sort d’un autre mage : réduit sa puissance d’autant (0 = sans effet) ; −1 dé de dégâts par niveau contre un monstre.'),
  S('Transfert', 'general', 3, 'Bouclier magique', 'Geste', 'Action', 'Toucher', 'Instantanée', 'Prend ou donne des PVol (jusqu’à 4 par niveau) à un humanoïde ; désavantage s’il refuse.'),
  S('Sceau magique', 'general', 4, 'Transfert', 'Mot, geste', 'Quart', 'Toucher', 'Permanente', 'Lie un sort à un objet, déclenché selon une condition choisie, avec les PVol de celui qui l’active.'),
  S('Charge', 'general', 4, 'Transfert', 'Mot, geste', 'Intervalle', 'Toucher', 'Quart', 'Stocke jusqu’à 10 PVol par niveau dans un objet, utilisables par qui le touche.'),
  S('Permanence', 'general', 5, 'Sceau magique', 'Mot, geste', 'Quart', 'Toucher', 'Permanente', 'Rend un autre sort permanent (même puissance) ; coûte 1 point de VOL définitif.'),
  // Animisme
  S('Parler aux bêtes', 'animisme', 1, 'Animisme', 'Mot', 'Intervalle', '2 m', 'Instantanée', 'Parle à un oiseau ou un mammifère : une question par niveau ; il ne ment jamais.'),
  S('Bannissement', 'animisme', 1, 'Animisme', 'Mot, geste, focus (symbole sacré)', 'Action', '10 m', 'Instantanée', 'Démon ou mort-vivant : 2D8 dégâts, +D8 par niveau ; ni armure, ni esquive, ni parade.'),
  S('Racines entravantes', 'animisme', 1, 'Animisme', 'Geste, ingrédient (branches ou racines)', 'Action', '10 m', 'Quart', 'Immobilise la cible ; s’en libérer demande un jet d’Esquive (plus dur selon la puissance). Pas sur les monstres.'),
  S('Éclair', 'animisme', 1, 'Animisme', 'Geste', 'Action', '30 m', 'Instantanée', '2D6 dégâts puis 2D4 à une cible voisine, +1 dé par niveau ; ignore l’armure métallique ; coût doublé à l’intérieur.'),
  S('Soigner une blessure', 'animisme', 1, 'Animisme', 'Mot', 'Action', 'Toucher', 'Instantanée', 'Soigne 2D6 PV, +D6 par niveau ; utilisable sur soi.'),
  S('Forêt engloutissante', 'animisme', 2, 'Racines entravantes', 'Geste, ingrédient (branches ou racines)', 'Action', '10 m (sphère)', 'Quart', 'Zone de ronces : terrain difficile, et tous ceux qui s’y trouvent (sauf toi) sont entravés.'),
  S('Foudre', 'animisme', 2, 'Éclair', 'Geste', 'Action', '40 m', 'Instantanée', '2D8 dégâts puis 2D6 et 2D4 à deux cibles voisines, +1 dé par niveau ; coût doublé à l’intérieur.'),
  S('Guérir une blessure', 'animisme', 2, 'Soigner une blessure', 'Mot', 'Action', 'Toucher', 'Instantanée', 'Soigne 2D8 PV, +D8 par niveau, et une blessure grave non permanente.'),
  S('Purification', 'animisme', 2, 'Bannissement', 'Mot, geste, focus (symbole sacré)', 'Action', '10 m', 'Instantanée', 'Exorcise un démon ou mort-vivant : 2D10 dégâts, +D10 par niveau ; ni armure, ni esquive, ni parade.'),
  S('Sommeil', 'animisme', 2, 'Soigner une blessure', 'Mot', 'Action', 'Toucher', 'Instantanée', 'Jet de VOL ou la cible dort un intervalle (étourdie même en cas de réussite). Pas sur les monstres.'),
  S('Restauration', 'animisme', 3, 'Guérir une blessure', 'Mot', 'Action', 'Toucher', 'Instantanée', 'Soigne 2D10 PV, +D10 par niveau, et une blessure grave au choix.'),
  S('Résurrection', 'animisme', 3, 'Guérir une blessure', 'Mot, geste, ingrédient (cadavre)', 'Quart', 'Toucher', 'Permanente', 'Ramène un mort à la vie (puissance selon le temps écoulé, une semaine au plus) ; coûte 1 point de VOL définitif.'),
  S('Coup de tonnerre', 'animisme', 3, 'Foudre', 'Geste', 'Action', '50 m', 'Instantanée', '2D10 dégâts puis jusqu’à trois cibles voisines (2D8, 2D6, 2D4), +1 dé par niveau ; coût doublé à l’intérieur.'),
  // Élémentalisme
  S('Boule de feu', 'elementalisme', 1, 'Élémentalisme', 'Mot, geste', 'Action', '20 m', 'Instantanée', '2D6 dégâts, enflamme ; chaque niveau : +D6 ou une boule de plus sur une autre cible. Esquivable.'),
  S('Gel', 'elementalisme', 1, 'Élémentalisme', 'Mot, geste', 'Action', '4 m (sphère)', 'Intervalle', 'Éteint les feux, D6 PV et D6 PVol aux vivants qui ont froid ; les humanoïdes sont figés (jet de FOR pour se libérer).'),
  S('Bourrasque', 'elementalisme', 1, 'Élémentalisme', 'Mot, geste', 'Action', '10 m (cône)', 'Instantanée', 'Repousse de 2D4 m et inflige autant de dégâts, +1 dé par niveau.'),
  S('Pilier', 'elementalisme', 1, 'Élémentalisme', 'Mot, geste', 'Action', '10 m', 'Quart', 'Fait surgir un pilier de 3 m (+3 m par niveau).'),
  S('Briser', 'elementalisme', 1, 'Élémentalisme', 'Mot', 'Action', 'Toucher', 'Instantanée', '2D10 dégâts à un objet non magique, +D10 par niveau, armure ignorée.'),
  S('Jet de flammes', 'elementalisme', 2, 'Boule de feu', 'Mot, geste', 'Action', '30 m', 'Instantanée', '2D8 dégâts, enflamme ; chaque niveau : +D8 ou un jet de plus. Esquivable.'),
  S('Bouclier de pierre', 'elementalisme', 2, 'Pilier', 'Geste, ingrédient (cailloux)', 'Réaction', 'Personnelle', 'Instantanée', 'Réduit de 2D6 les dégâts d’une attaque, +D6 par niveau ; cumulable avec l’armure.'),
  S('Mur de pierre', 'elementalisme', 2, 'Pilier', 'Mot, geste', 'Action', '10 m', 'Quart', 'Un mur de 3 × 2 × 1 m, une section de plus par niveau.'),
  S('Raz-de-marée', 'elementalisme', 2, 'Gel', 'Mot, geste, ingrédient (point d’eau)', 'Action', '20 m (cône)', 'Instantanée', 'Repousse de 2D6 m et inflige autant de dégâts, +1 dé par niveau.'),
  S('Tourbillon', 'elementalisme', 2, 'Bourrasque', 'Mot, geste', 'Action', '4 m (sphère)', 'Instantanée', 'Projette à 2D4 m tout ce qui t’entoure (autant de dégâts, à terre) ; +4 m et +D4 par niveau.'),
  S('Oiseau de feu', 'elementalisme', 3, 'Jet de flammes', 'Mot, geste', 'Action', '40 m', 'Instantanée', '2D10 dégâts, enflamme ; chaque niveau : +D10 ou un oiseau de plus. Esquivable.'),
  S('Sylphe', 'elementalisme', 3, 'Tourbillon', 'Mot, geste', 'Intervalle', '4 m', 'Intervalle', 'Invoque un élémentaire d’air qui t’obéit (5 PV par niveau).'),
  S('Tempête de feu', 'elementalisme', 3, 'Jet de flammes et Tourbillon', 'Mot, geste', 'Action', '4 m (sphère)', 'Instantanée', '2D6 dégâts à tous autour de toi ; +4 m et +D6 par niveau.'),
  S('Gnome', 'elementalisme', 3, 'Mur de pierre', 'Mot, geste, ingrédient (pierre ou terre)', 'Intervalle', '4 m', 'Intervalle', 'Invoque un élémentaire de terre qui t’obéit (5 PV par niveau, armure 4).'),
  S('Salamandre', 'elementalisme', 3, 'Jet de flammes', 'Mot, geste, ingrédient (feu)', 'Intervalle', '4 m', 'Intervalle', 'Invoque un élémentaire de feu qui t’obéit (5 PV par niveau).'),
  S('Ondine', 'elementalisme', 3, 'Raz-de-marée', 'Mot, geste, ingrédient (eau)', 'Intervalle', '4 m', 'Intervalle', 'Invoque un élémentaire d’eau qui t’obéit (5 PV par niveau).'),
  // Mentalisme
  S('Vision lointaine', 'mentalisme', 1, 'Mentalisme', 'Mot, geste', 'Action', '1 km', 'Concentration', 'Voir et entendre un lieu connu ou visible ; portée ×10 par niveau.'),
  S('Lévitation', 'mentalisme', 1, 'Mentalisme', 'Mot, geste', 'Action', '6 m', 'Instantanée', 'Fait flotter une personne ou un objet jusqu’à 6 m ; chaque niveau : +2 m ou une cible de plus.'),
  S('Grandes enjambées', 'mentalisme', 1, 'Mentalisme', 'Mot, geste', 'Action', 'Toucher', 'Intervalle', 'Double le déplacement de la cible ; une cible de plus par niveau.'),
  S('Poing de force', 'mentalisme', 1, 'Mentalisme', 'Mot, geste', 'Action', 'Personnelle', 'Intervalle', 'Tes attaques à mains nues font +D6 dégâts par niveau.'),
  S('Peau de pierre', 'mentalisme', 1, 'Mentalisme', 'Mot, geste, ingrédient (pierre)', 'Action', 'Toucher', 'Intervalle', 'Armure 4, +2 par niveau au-delà du premier (ne se cumule pas avec une armure).'),
  S('Divination', 'mentalisme', 2, 'Vision lointaine', 'Mot, geste', 'Action', '100 m', 'Instantanée', 'Indique la direction de la chose ou créature nommée la plus proche ; portée doublée par niveau.'),
  S('Arme enchantée', 'mentalisme', 2, 'Poing de force', 'Mot, geste', 'Action', 'Toucher', 'Intervalle', 'L’arme devient magique et fait un Dragon sur 1–2 (+1 par niveau).'),
  S('Frappe mentale', 'mentalisme', 2, 'Poing de force', 'Mot, geste', 'Action', '10 m', 'Instantanée', 'Projette la cible à 2D6 m avec autant de dégâts, +D6 par niveau. Esquivable.'),
  S('Rétrocognition', 'mentalisme', 2, 'Vision lointaine', 'Geste', 'Action', '10 m', 'Concentration', 'Visions du passé du lieu : un jour, un an ou des siècles selon la puissance.'),
  S('Télépathie', 'mentalisme', 2, 'Vision lointaine', 'Mot, geste', 'Action', '10 m', 'Concentration', 'Lit les pensées de surface (plus profond avec plus de puissance) ou envoie les tiennes.'),
  S('Domination', 'mentalisme', 3, 'Télépathie', 'Mot, geste', 'Action', '10 m', 'Instantanée', 'Jet opposé contre la VOL : la victime fait un déplacement et une action de ton choix, puis perd son tour. Pas sur les monstres.'),
  S('Vol', 'mentalisme', 3, 'Lévitation', 'Mot, geste', 'Action', 'Toucher', 'Intervalle', 'La cible vole avec un déplacement de 6 (12 puis 24 selon la puissance).'),
  S('Téléportation', 'mentalisme', 3, 'Vision lointaine', 'Mot, geste', 'Action', 'Toucher', 'Instantanée', 'Te téléporte jusqu’à 100 m vers un lieu vu ou connu ; chaque niveau : un passager de plus ou portée doublée.'),
];

export const SCHOOL_LABEL = { general: 'Magie générale', animisme: 'Animisme', elementalisme: 'Élémentalisme', mentalisme: 'Mentalisme' };
