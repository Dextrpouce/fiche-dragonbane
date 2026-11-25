// Rappels de règles pour le combat (bibliothèque « Règles »).
// Résumés écrits librement d'après le chapitre 4 du livre (et les jets du chapitre 3) : le livre fait foi.
// [thème, titre, repère court, contenu HTML]
export const RULES = [
  // ----- Le tour de combat -----
  ['Le tour de combat', 'Rounds et initiative', '≈ 10 secondes', `
    <p>Au début de chaque round, chacun tire une carte d’initiative (1 à 10). On agit dans l’ordre des cartes, le 1 en premier. Le MJ peut tirer une seule carte pour tout un groupe de PNJ.</p>
    <p>Quand tous ont agi, le round se termine et on retire les cartes.</p>`],
  ['Le tour de combat', 'Surprise et embuscade', 'carte au choix', `
    <p><b>Attaque surprise</b> : les attaquants choisissent leur carte d’initiative au premier round, les autres tirent parmi celles qui restent.</p>
    <p><b>Embuscade</b> : chaque victime fait un jet de Vigilance (désavantage si l’embuscade est bien préparée). Celles qui échouent reçoivent au hasard les dernières cartes (10, 9, 8…).</p>`],
  ['Le tour de combat', 'Attendre', 'échanger sa carte', `
    <p>À ton tour, tu peux échanger ta carte avec celle d’un combattant qui joue après toi (personnage ou PNJ) : il ne peut pas refuser.</p>
    <p>Impossible avec quelqu’un qui a déjà joué ou qui a lui-même attendu ce round. Les monstres n’attendent jamais.</p>`],
  ['Le tour de combat', 'À ton tour : déplacement + 1 action', '', `
    <p>Tu te déplaces (jusqu’à ton Déplacement en mètres) et tu fais <b>une action</b>, dans l’ordre que tu veux. Tu peux même couper ton déplacement en deux autour de l’action. Rien ne se garde pour plus tard.</p>
    <p><b>Actions courantes</b> : courir (déplacement ×2), attaquer au contact ou à distance, ramasser un objet, mettre ou retirer armure ou casque, premiers soins, remotiver un allié, enfoncer une porte, crocheter une serrure, utiliser un objet, activer une capacité, lancer un sort, aider (avantage à un allié), repos de round (D6 PVol, une fois par quart).</p>`],
  ['Le tour de combat', 'Actions gratuites', 'une de chaque par tour', `
    <p>Elles ne comptent pas comme ton action, mais une seule de chaque type par round, et seulement à ton tour :</p>
    <ul><li>dégainer, changer ou ranger une arme gardée à portée de main ;</li><li>se jeter au sol ou se relever ;</li><li>lâcher un objet ;</li><li>dire ou crier quelques mots.</li></ul>`],
  ['Le tour de combat', 'Réactions (parer, esquiver)', 'retourne ta carte', `
    <p>Parer ou esquiver se fait pendant le tour de l’adversaire. Cela <b>remplace ton tour</b> (action et déplacement) : retourne ta carte d’initiative.</p>
    <p>Si tu as déjà joué ce round, tu ne peux plus réagir. D’où l’intérêt de se mettre à plusieurs sur le même ennemi : il ne peut se défendre qu’une fois (sauf capacités Défensif ou Rapide comme l’éclair).</p>`],
  ['Le tour de combat', 'Déplacement', '', `
    <ul>
      <li><b>Sauter</b> en longueur : jusqu’à la moitié de ton Déplacement avec un jet d’Acrobatie (sans jet jusqu’au quart).</li>
      <li><b>Porte</b> fermée mais pas verrouillée : la franchir coûte la moitié de ton déplacement.</li>
      <li><b>Ennemis</b> : un ennemi debout bloque environ 2 × 2 m. Pour passer, il faut le faire tomber ou le mettre à 0 PV. On traverse librement les alliés.</li>
      <li><b>Carte</b> : une case = 2 × 2 m, diagonales permises sauf entre deux cases bloquées.</li>
    </ul>`],
  ['Le tour de combat', 'Attaque d’opportunité', 'jet d’Esquive', `
    <p>Si tu t’éloignes volontairement d’un ennemi à 2 m ou moins (ou que tu passes à côté de lui), fais un jet d’<b>Esquive</b> (ce n’est pas une action).</p>
    <p>En cas d’échec, il t’attaque aussitôt gratuitement : attaque impossible à parer ou esquiver. Tourner autour de lui en restant à 2 m, ou être déplacé de force, ne déclenche rien.</p>`],
  ['Le tour de combat', 'Terrain', '', `
    <ul>
      <li><b>Exigu</b> (peu de place, plafond bas) : désavantage à toutes les armes de contact, sauf perforantes et discrètes.</li>
      <li><b>Accidenté</b> : jet d’Acrobatie à chaque déplacement ; si raté, tu tombes et perds le reste du déplacement.</li>
      <li><b>Pénombre</b> : désavantage aux attaques à distance.</li>
      <li><b>Obscurité totale</b> : pas de course ni de tir ; jet de Vigilance avant chaque attaque au contact.</li>
    </ul>`],

  // ----- Attaquer -----
  ['Attaquer', 'Attaque au contact', '2 m (4 m arme longue)', `
    <p>Jet avec la compétence de l’arme. Si ça touche : dégâts de l’arme + bonus aux dégâts (FOR ou AGI selon la compétence), moins l’armure de la cible.</p>
    <ul>
      <li><b>Armes en main</b> : jusqu’à trois prêtes ; il faut l’avoir dégainée pour attaquer.</li>
      <li><b>FOR minimale</b> : en dessous, désavantage aux attaques et parades ; sous la moitié, arme inutilisable. Une arme à une main tenue à deux mains demande 3 de FOR en moins.</li>
      <li><b>Arme longue</b> : touche jusqu’à 4 m, même par-dessus un allié.</li>
      <li><b>Cible au sol</b> (et toi debout) : avantage et +D6 dégâts.</li>
    </ul>`],
  ['Attaquer', 'Pousser l’ennemi', 'bonus FOR ≥ le sien', `
    <p>Si tu touches au contact et que ton bonus aux dégâts de FOR est au moins égal à celui de la cible, tu peux en plus la repousser de 2 m (une case). Ce déplacement ne déclenche pas d’attaque d’opportunité. Pas contre les monstres.</p>`],
  ['Attaquer', 'Coup critique (Dragon)', 'au contact', `
    <p>Un Dragon (1) en attaquant : la cible ne peut parer ou esquiver qu’en faisant elle aussi un Dragon. Choisis un effet :</p>
    <ul><li>dés de dégâts de l’arme doublés (avant les bonus) ;</li><li>une deuxième attaque gratuite contre un autre ennemi ;</li><li>avec des dégâts perforants (règle optionnelle) : l’armure ne compte pas.</li></ul>`],
  ['Attaquer', 'Démon au contact', 'D6', `
    <p>Un Démon (20) : raté, impossible de forcer le jet, et le MJ peut faire tirer un incident sur D6 :</p>
    <ol><li>arme lâchée à tes pieds ;</li><li>tu te découvres : attaque gratuite de l’ennemi, imparable ;</li><li>arme coincée : jet de FOR (une action) pour la dégager ;</li><li>arme projetée à D3+3 m ;</li><li>arme abîmée : désavantage jusqu’à réparation ;</li><li>tu te blesses toi-même (dégâts sans bonus).</li></ol>`],
  ['Attaquer', 'Attaque à distance', 'portée ×2 = désavantage', `
    <p>Jet avec la compétence de l’arme (armes de jet : même compétence qu’au contact). Dégâts + bonus aux dégâts, <b>sauf arbalètes</b> (pas de bonus).</p>
    <ul>
      <li>À 2 m ou moins de la cible : désavantage.</li>
      <li>Au-delà de la portée et jusqu’au double : désavantage.</li>
      <li>Cible partiellement cachée (même par un allié) : désavantage. Entièrement cachée : impossible.</li>
      <li>Pas de tir dans l’eau ni dans le noir complet.</li>
    </ul>`],
  ['Attaquer', 'Coup critique à distance', '', `
    <p>Un Dragon : la cible ne peut esquiver (ou parer au bouclier) qu’avec un Dragon. Choisis : dés de dégâts doublés (avant les bonus), ou, avec des dégâts perforants (optionnel), armure ignorée.</p>`],
  ['Attaquer', 'Démon à distance', 'D6', `
    <ol><li>arme lâchée à tes pieds ;</li><li>plus de flèches (relance pour fronde et armes de jet) ;</li><li>tu touches un objet précieux proche ;</li><li>arme abîmée : désavantage jusqu’à réparation ;</li><li>tu touches un allié au hasard (dégâts normaux) ;</li><li>tu te touches toi-même (dégâts sans bonus).</li></ol>`],
  ['Attaquer', 'Attaque sournoise', 'avantage, pas de défense', `
    <p>Uniquement hors combat (sauf capacité Poignarder). Jet de <b>Discrétion</b>, avec désavantage si tu t’approches au contact. Raté : on te repère, tirez l’initiative.</p>
    <p>Réussi : carte d’initiative au choix, <b>avantage</b> à l’attaque, la cible ne peut ni parer ni esquiver. Arme discrète : un dé de dégâts en plus (2D8 au lieu de D8). Toujours un attaquant contre une cible.</p>`],
  ['Attaquer', 'Types de dégâts', 'optionnel', `
    <p>Tranchant, perforant ou contondant (voir la fiche de l’arme ; certaines font les deux, annonce-le avant de lancer).</p>
    <ul><li>Cuir et cuir clouté : +2 d’armure contre le contondant.</li><li>Cotte de mailles : +2 d’armure contre le tranchant.</li><li>Le perforant n’abîme jamais l’arme ou le bouclier qui pare.</li></ul>`],

  // ----- Se défendre -----
  ['Se défendre', 'Parer', 'compétence de l’arme', `
    <p>Annonce-le avant le jet de dégâts. Il faut une arme ou un bouclier déjà en main (on ne dégaine pas hors de son tour). Pas de parade à mains nues. Possible au sol.</p>
    <ul>
      <li>Réussi : aucun dégât. Mais si les dégâts dépassent la <b>Solidité</b> de l’arme, elle est abîmée (jet d’Artisanat pour la réparer).</li>
      <li><b>Bouclier</b> : se manie avec n’importe quelle compétence de contact basée sur la FOR (donc pas Couteaux ni Bâtons). Seul moyen de parer un tir.</li>
      <li>Après une parade réussie, tu peux te déplacer de 2 m et déplacer l’ennemi de 2 m, sans attaque d’opportunité.</li>
      <li>Les attaques de monstres ne se parent pas, sauf indication contraire.</li>
    </ul>`],
  ['Se défendre', 'Dragon en parant', 'contre-attaque', `
    <p>Un Dragon en parant au contact : contre-attaque immédiate, qui touche automatiquement et ne peut être ni parée ni esquivée. Pas de contre-attaque si l’attaquant a aussi fait un Dragon (il te fallait alors un Dragon juste pour parer), ni contre un tir.</p>`],
  ['Se défendre', 'Esquiver', 'jet d’Esquive', `
    <p>Annonce-le avant le jet de dégâts, puis fais un jet d’Esquive : réussi, aucun dégât ; raté, tu es touché. Possible au sol. On ne peut pas parer et esquiver la même attaque.</p>
    <p>Réussi : tu peux bouger de 2 m sans attaque d’opportunité. Les attaques de monstres s’esquivent, sauf indication contraire.</p>`],
  ['Se défendre', 'Armure et casque', '', `
    <p>On retire la valeur d’armure (armure + casque) des dégâts d’une attaque physique. Si une attaque au contact est entièrement absorbée, c’est l’arme de l’attaquant qui encaisse et peut s’abîmer.</p>
    <p>Mettre ou retirer une armure ou un casque prend une action. L’armure portée ne compte pas dans l’encombrement. Pas d’armure contre les chutes.</p>`],

  // ----- Attaques spéciales -----
  ['Attaques spéciales', 'Chercher le défaut', 'arme perforante', `
    <p>À annoncer avant le jet. Désavantage à l’attaque, mais si elle touche, la cible compte comme sans armure.</p>`],
  ['Attaques spéciales', 'Renverser', 'arme contre Esquive', `
    <p>Jet opposé : ta compétence d’arme contre l’Esquive de la cible (avantage si l’arme a la propriété « renversement »). Pas de dégâts, mais la cible tombe. Ne peut être ni paré ni esquivé.</p>
    <p>Astuce : un allié frappe ensuite la cible au sol avec avantage et +D6 dégâts.</p>`],
  ['Attaques spéciales', 'Désarmer', 'arme contre arme', `
    <p>Jet opposé entre vos compétences d’arme ; désavantage si l’ennemi tient son arme à deux mains. Réussi : l’arme tombe à D6 m dans la direction de ton choix. Ne marche pas sur un bouclier ni sur des griffes ou crocs.</p>`],
  ['Attaques spéciales', 'Empoigner', 'Bagarre contre Bagarre', `
    <p>Contre un humanoïde. Raté : tu tombes. Réussi : vous tombez tous les deux et il est immobilisé (ni déplacement ni action physique, sauf tenter de se libérer : jet opposé de Bagarre, gratuit pour lui).</p>
    <p>Toi non plus ne bouges pas, mais tu peux frapper à mains nues avec avantage (imparable). Lâcher prise est gratuit.</p>`],
  ['Attaques spéciales', 'Jets opposés', '', `
    <ul><li>Si tu rates, c’est raté.</li><li>Si tu réussis et l’autre rate, c’est gagné.</li><li>Si les deux réussissent, le plus petit résultat gagne (égalité : celui qui agit).</li></ul>
    <p>En combat, ça ne coûte une action qu’à celui qui agit. Un PNJ sans la compétence lance contre 5.</p>`],

  // ----- Dégâts, mort et soins -----
  ['Dégâts et mort', 'À 0 PV', 'jets de mort', `
    <p>Tu tombes, tu ne peux plus bouger ni agir, sauf tenter de te remotiver.</p>
    <ul>
      <li><b>Jet de mort</b> à chacun de tes tours : jet de CON. 3 réussites : tu reprends D6 PV. 3 échecs : mort. Un Dragon compte pour 2 réussites, un Démon pour 2 échecs.</li>
      <li>Tout nouveau dégât à 0 PV = un échec.</li>
      <li><b>Mort sur le coup</b> si une seule attaque t’amène en négatif d’autant que tes PV max.</li>
      <li>Les PNJ ne font pas de jets de mort : le MJ décide.</li>
    </ul>`],
  ['Dégâts et mort', 'Sauver un allié', 'Soins (action)', `
    <p>Un allié à côté de toi à 0 PV : jet de <b>Soins</b> (désavantage sans bandages). Réussi : il arrête les jets de mort et reprend D6 PV. On peut réessayer. On ne peut pas se soigner soi-même ainsi.</p>`],
  ['Dégâts et mort', 'Remotiver', 'Persuasion (action)', `
    <p>Un allié à 0 PV, à 10 m et à portée de voix : jet de <b>Persuasion</b>. Réussi : il se relève et agit normalement, mais continue ses jets de mort. On peut se remotiver soi-même : jet de VOL avec désavantage.</p>`],
  ['Dégâts et mort', 'Blessures graves', 'si jet de CON raté', `
    <p>Revenu de 0 PV : jet de CON. Raté, on tire sur D20 :</p>
    <ul>
      <li>1–2 nez cassé (désav. Vigilance, D6 j) · 3–4 visage balafré (désav. Représentation et Persuasion, 2D6 j) · 5–6 dents perdues (−2 Représentation et Persuasion, définitif)</li>
      <li>7–8 côtes cassées (désav. FOR et AGI, D6 j) · 9–10 commotion (désav. INT, D6 j) · 11–12 plaies profondes (désav. FOR et AGI, et D6 dégâts à chaque jet, 2D6 j)</li>
      <li>13 jambe cassée (Déplacement ÷2, 3D6 j) · 14 bras cassé (ni arme à deux mains ni deux armes, 3D6 j) · 15 orteil perdu (−2 Déplacement, définitif) · 16 doigt perdu (−1 à toutes les armes, définitif)</li>
      <li>17 œil crevé (−2 Fouille, définitif) · 18 cauchemars (2D6 j) · 19 caractère changé (nouvelle faiblesse) · 20 amnésie (D6 j)</li>
    </ul>
    <p class="muted">Durée divisée par deux avec repos et soins (jet de Soins) chaque jour.</p>`],
  ['Dégâts et mort', 'Se reposer', 'round · court · long', `
    <ul>
      <li><b>Repos de round</b> (une action) : D6 PVol, pas de PV. Une fois par quart.</li>
      <li><b>Repos court</b> (un intervalle) : D6 PV (2D6 si quelqu’un réussit un jet de Soins sur toi), D6 PVol et un état guéri. Une fois par quart ; perdu s’il est interrompu.</li>
      <li><b>Repos long</b> (un quart), en lieu sûr : tous les PV, PVol et états.</li>
    </ul>`],

  // ----- Jets de dés -----
  ['Jets de dés', 'Réussir un jet', 'D20 ≤ compétence', `
    <p>Lance un D20 : un résultat inférieur ou égal à ta compétence réussit.</p>
    <ul><li><b>Dragon</b> (1) : réussite remarquable, effets spéciaux en combat.</li><li><b>Démon</b> (20) : échec quoi qu’il arrive, impossible à forcer.</li></ul>`],
  ['Jets de dés', 'Avantage et désavantage', '2 D20', `
    <p>Avantage : lance deux D20 et garde le plus petit. Désavantage : garde le plus grand. Un D20 de plus par avantage ou désavantage supplémentaire ; chaque avantage annule un désavantage.</p>
    <p><b>Aider</b> un allié lui donne un avantage, mais en combat cela te coûte ton action. Une seule personne peut aider.</p>`],
  ['Jets de dés', 'Forcer un jet', 'contre un état', `
    <p>Après un échec (sauf Démon), tu peux relancer une fois ; le nouveau résultat compte. Tu subis alors un état de ton choix, que tu n’as pas déjà et que tu peux justifier. Avec les six états, on ne peut plus forcer. Les PNJ et monstres ne forcent jamais.</p>`],

  // ----- États -----
  ['États', 'Les six états', 'désavantage', `
    <p>Chaque état donne un désavantage aux jets de son attribut et des compétences qui en dépendent :</p>
    <ul><li>Épuisé – FOR</li><li>Malade – CON</li><li>Étourdi – AGI</li><li>Furieux – INT</li><li>Effrayé – VOL</li><li>Découragé – CHA</li></ul>
    <p>Un état déjà subi oblige à en choisir un autre. Avec les six, chaque nouvel état coûte D6 PVol (puis D6 PV sans PVol).</p>`],
  ['États', 'Peur', 'jet de VOL', `
    <p>Face à une attaque de peur : jet de VOL (pas une action, peut être forcé). Raté, on tire sur D8 :</p>
    <ol><li>vidé : −2D6 PVol et Découragé ;</li><li>ébranlé : Effrayé ;</li><li>essoufflé : Épuisé ;</li><li>livide : toi et les alliés à 10 m qui te voient devenez Effrayés ;</li><li>hurlement : tous ceux qui l’entendent subissent aussi l’attaque de peur ;</li><li>rage : Furieux, et tu dois attaquer la source de ta peur au prochain tour ;</li><li>paralysé : ni action ni déplacement au prochain tour, puis jet de VOL à chaque tour pour en sortir ;</li><li>panique : tu fuis en courant au prochain tour, puis jet de VOL à chaque tour pour t’arrêter.</li></ol>`],

  // ----- Autres dangers -----
  ['Autres dangers', 'Poison', 'puissance contre CON', `
    <p>Jet opposé ouvert entre la puissance (faible 9, moyen 12, fort 15+) et ta CON. Le poison gagne : effet complet ; tu gagnes : effet limité. Sans effet sur les monstres.</p>
    <ul>
      <li><b>Mortel</b> : D6 dégâts par round jusqu’à 0 PV (antidote pour l’arrêter) ; limité : D6 une fois.</li>
      <li><b>Paralysant</b> : Épuisé, et jet de CON à chaque tour sinon ni action ni déplacement, pendant un intervalle ; limité : Épuisé.</li>
      <li><b>Soporifique</b> : Étourdi, et jet de CON à chaque tour sinon tu dors un quart (un dégât ou un antidote réveille) ; limité : Étourdi.</li>
    </ul>`],
  ['Autres dangers', 'Chute', 'D6 par 2 m', `
    <p>Un D6 de dégâts contondants par tranche de 2 m de chute (moins de 2 m : rien). Un jet d’Acrobatie réussi divise le nombre de dés par deux (arrondi au-dessus). L’armure ne protège pas.</p>`],
  ['Autres dangers', 'Dans l’eau', '', `
    <p>Déplacement divisé par deux, pas de tir, désavantage au contact. Jet de Natation à chaque intervalle pour rester à flot (à chaque round en cotte de mailles ou plate, avec désavantage).</p>
    <p>Sous l’eau : jet de CON à chaque round pour retenir son souffle, sinon D6 dégâts par round.</p>`],
  ['Autres dangers', 'Torches et lanternes', '10 m', `
    <p>Éclairent 10 m autour. Allumer prend une action (briquet, feu ou tour de magie). Tenues dans une main. Une torche sert de gourdin qui brûle, mais peut s’éteindre à chaque coup porté.</p>`],
  ['Autres dangers', 'Combat à cheval', 'monture dressée', `
    <p>Il faut une monture dressée au combat. Tu utilises son Déplacement. Attaques et parades avec la plus basse de tes compétences entre Équitation et l’arme ; Équitation remplace l’Esquive. Sans selle : désavantage partout. L’ennemi choisit de viser toi ou ta monture ; au contact depuis le sol, il a un désavantage contre toi.</p>`],
];
