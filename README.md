# Fiche Dragonbane — Gestion de personnage

Application pour téléphone, tablette et PC qui gère ton personnage de **Dragonbane** :

- **Fiche** : les 6 attributs (FOR, CON, AGI, INT, VOL, CHA), déplacement, bonus aux dégâts, charge, compétences (générales, armes, magie) et capacités héroïques. Toucher un attribut ou une compétence **lance le D20**.
- **Lanceur de dés** : réussite si le D20 est ≤ au niveau, **avantages / désavantages** (deux dés, on garde le meilleur ou le pire), **Dragon** (1) et **Démon** (20). Un Dragon ou un Démon **coche automatiquement** la compétence pour l'amélioration. Désavantage ajouté tout seul quand tu as l'état lié à l'attribut, ou quand ton armure/casque gêne la compétence. **Forcer le jet** en choisissant un état.
- **Coche à la main** : à droite de chaque compétence, le losange vide ✧. Tu as fait un Dragon ou un Démon avec tes propres dés ? Touche-le et confirme : la compétence est cochée ✦ pour l'amélioration.
- **Combat** (pour jouer, sans édition) : PV et PVol, états, jets de mort (Dragon et Démon comptent double), attaque / parade / dégâts avec tes armes (bonus FOR/AGI), valeur d'armure, interrupteur **Musique du barde** (avantage automatique à tous tes jets tant que le barde joue), repos (round, court, long — une fois par quart pour les deux premiers), dés libres.
- **Magie** (pour les mages ou si tu connais une école) : écoles, tours de magie (1 PVol, réussite automatique), sorts avec niveau de puissance (2 PVol par niveau), sorts préparés (limite = chance de base de l'INT).
- **Sac** : armes à portée de main (3 au plus), armure et casque (avec les compétences gênées), bourse (or, argent, cuivre, avec rendu de monnaie), encombrement (FOR ÷ 2 + sac à dos), équipement, objets minuscules, souvenir.
- **Progrès** : questions de fin de séance, coches d'amélioration, **jets d'amélioration** automatiques (D20 > niveau = +1, maximum 18), nouvelle capacité héroïque à 18, historique avec annulation.
- **Bibliothèque intégrée** : en ajoutant une arme, une armure, un casque, un sort ou un tour de magie, choisis-le dans la liste pour tout remplir d'un coup (35 armes, 6 armures et casques, 49 sorts, 17 tours). Les noms sont traduits librement et les effets résumés : le livre fait foi. La FOR minimale des armes est appliquée (désavantage en dessous, arme inutilisable sous la moitié).
- **Attaque sournoise** (bouton « 🗡 Sournoise » de chaque arme) : jet de Discrétion (désavantage si tu t'approches au contact), puis attaque avec avantage, sans esquive ni parade, +1 dé de dégâts avec une arme discrète. Poignarder permet de la faire en plein combat. Les capacités qui ajoutent des dégâts (Assassin, Tueur de dragons, Coup puissant, Poing de fer) apparaissent comme boutons de dégâts et dépensent leurs PVol.
- **Groupe** : la caisse commune (recettes, dépenses, versements depuis ou vers la bourse de ton personnage, journal avec annulation), les **comptes** (dépôt chez un banquier, ce qu'on nous doit, ce qu'on doit, projet payé en plusieurs fois avec son coût total ; dépôts, retraits, remboursements et paiements notés au journal, et fortune du groupe affichée sous la caisse) et le matériel rangé par monture ou véhicule (2 ânes et un char au départ) : chargement et encombrement de chacun, sacoches de selle (+2, 2 au plus), harnais pour atteler un âne au char, déplacement d'un objet d'un transport à l'autre ou vers ton sac. Un objet peut être marqué **à vendre** avec sa valeur estimée : la carte « À vendre » liste tout ce qu'on ne garde pas avec le total estimé, et « Vendu » verse le prix obtenu dans la caisse (vente partielle possible, annulable). Le groupe peut être **partagé** : « Partager ce groupe » donne un code que les autres joueurs saisissent dans « Rejoindre avec un code ». Tout le monde voit et modifie la même caisse et le même matériel en direct, et le **journal** indique pour chaque modification quand, quoi et qui. Sans réseau, les modifications attendent et partent dès le retour du réseau. Le groupe partagé utilise la collection `groups` du projet Firebase, comme le groupe du Grimoire WFRP (les groupes Dragonbane sont marqués pour ne pas se mélanger).
- **Journal** : une page par séance (numéro, date, titre, résumé, PNJ, lieux, butin), des pistes à cocher (celles en cours restent affichées en haut) et une page de croquis par séance pour dessiner au stylet (pression, paume ignorée), au doigt ou à la souris, avec plein écran. Les **PNJ** ont chacun leur fiche (image ou photo prise avec l'appareil sur mobile, rangée à part comme les croquis ; rôle, attitude, lieu, notes) et sont reliés aux sessions où on les croise ; de même pour les **lieux importants** (type, accès, notes, image, PNJ sur place). En groupe partagé, le journal est commun : un onglet **Historique** liste qui a modifié quoi (avec l'heure), chaque rubrique affiche son dernier auteur, et chacun garde des **notes secrètes** dans sa propre fiche. Les croquis sont enregistrés à part des fiches (un document `__croquis_…` chacun en ligne) pour ne pas les alourdir. Recherche dans tout le journal.
- **Biblio** : consultation des armes, armures, matériel (117 objets, services, transports et animaux avec leur prix), sorts, tours de magie, capacités (héroïques et innées) et **règles** (rappels du combat : initiative, actions, attaques et défenses, attaques spéciales, coups critiques et Démons, dégâts et mort, états, peur, poison, chute… et magie : lancer un sort, niveau de puissance, sorts préparés, grimoire, métal, Dragon et incidents magiques, apprendre un sort), avec recherche.
- **Liste de matériel** dans le Sac et sur chaque monture du Groupe : choisis un objet pour remplir nom, encombrement et effet ; case pour l'acheter avec ta bourse (Sac) ou avec la caisse (Groupe, achat annulable dans le journal).
- **Capacités de combat** (onglet Combat) : tes capacités utiles en combat (Assassin, Poignarder, Berserker…) avec leur effet et un bouton qui dépense les PVol (Berserker et Colérique te rendent Furieux).
- **Carnet** : identité, faiblesse, apparence, souvenir, compagnons, notes.
- **Trois modes** (bouton en haut) : **Jeu** (toucher = jet de dé), **Progression** (placer les coches et améliorer), **Libre** (saisir ou corriger sans contrainte).
- Plusieurs personnages, export/import en fichier JSON.
- **Manuel d’utilisation** intégré : bouton **?** en haut (à côté du nuage) ou menu ⋮ › Manuel d’utilisation, un sujet par onglet.

Tout est enregistré **sur l'appareil**, donc l'appli fonctionne **sans internet**. Dès que le réseau revient, les modifications sont envoyées en ligne automatiquement.

## Sauvegarde en ligne : rien à faire

L'appli utilise le **même projet Firebase que le Grimoire WFRP** (`grimoire-wfrp`). Les personnages Dragonbane sont rangés à part (`users/{ton compte}/dragonbane`), et la règle Firestore déjà en place (`match /users/{uid}/{document=**}`) les protège : toi seul peux les lire et les modifier.

**Journal partagé avec le groupe** : quand le groupe est partagé, l'onglet Journal (sessions, pistes, PNJ) est rangé dans le document du groupe (`groups/{code}`), comme la caisse. Les croquis et les images des PNJ sont trop lourds pour ce document : ils vont dans `groups/{code}/media/{id}`. Il faut pour cela ajouter cette règle dans Firestore (**Firestore Database** › **Règles**, à l'intérieur de `match /databases/{database}/documents { … }`), puis **Publier** :

```
// Images et croquis du journal d'un groupe : réservés aux membres du groupe
match /groups/{id}/media/{mid} {
  allow read, write: if request.auth != null
    && request.auth.uid in get(/databases/$(database)/documents/groups/$(id)).data.members;
}
```

Sans cette règle, le texte du journal est partagé normalement, mais les croquis et les images restent en « Chargement… » et l'appli affiche « Images et croquis du groupe refusés par Firebase ».

Si tu héberges l'appli sur la même adresse GitHub Pages que le Grimoire (`TON-PSEUDO.github.io`), ce domaine est déjà autorisé dans Firebase. Sinon, ajoute-le dans Firebase › Authentication › Paramètres › Domaines autorisés.

## Mettre l'appli en ligne (GitHub Pages)

1. Sur <https://github.com> : **+** › **New repository**, nom `fiche-dragonbane`, **Public**, **Create repository**.
2. **uploading an existing file** : glisse `index.html`, `manifest.webmanifest`, `sw.js` et les dossiers `css`, `js`, `icons` (pas le PDF). **Commit changes**.
3. **Settings** › **Pages** › Branch `main` et `/ (root)` › **Save**.
4. Après une minute : `https://TON-PSEUDO.github.io/fiche-dragonbane/`.

## Installer sur Android

1. Ouvre l'adresse dans **Chrome**, menu **⋮** › **Installer l'application**.
2. Touche le **nuage** en haut et connecte-toi avec Google, ou avec un e-mail et un mot de passe (« Créer un compte » dans la fenêtre de connexion, pratique sur iPad ou sans compte Google ; « Mot de passe oublié » envoie un e-mail de réinitialisation). C'est le même compte que pour le Grimoire WFRP et INS/MV, car ils partagent le projet Firebase. Tes personnages te suivent sur tous tes appareils.

## Le nuage en haut de l'écran

| Pastille | Signification |
|---|---|
| 🟢 verte | Tout est synchronisé |
| 🟡 jaune | Modifications enregistrées sur l'appareil, en attente d'envoi |
| 🔴 rouge | Connexion à refaire ou erreur : touche le nuage |
| ⚪ grise | Sauvegarde en ligne non configurée |

Si tu modifies le même personnage sur deux appareils sans réseau, c'est la version modifiée **en dernier** qui gagne.

## Premiers pas

1. **Créer un personnage** : nom, peuple, âge, profession (et école pour un mage), attributs (saisis-les ou tire 4D6 en gardant les 3 meilleurs), puis coche les compétences entraînées : 6 de la profession + 2, 4 ou 6 selon l'âge. L'effet de l'âge sur les attributs est appliqué si la case est cochée.
2. Le personnage s'ouvre en **mode libre** : complète les capacités (description), ajoute armes, armure, équipement, sorts. Touche **Terminer** quand c'est fini.
3. **En partie** : touche une compétence pour lancer le D20. Les Dragons et Démons cochent la compétence tout seuls.
4. **En fin de séance** : Progrès › **Questions de fin de séance**, place les coches en touchant les compétences, puis **Jets d'amélioration**.
5. Une erreur ? Le bouton ↶ de l'historique annule la dernière opération de progression.

## Règles appliquées

- **Chance de base** selon l'attribut : 1–5 → 3, 6–8 → 4, 9–12 → 5, 13–15 → 6, 16–18 → 7. Compétence entraînée au départ : le double. Les écoles de magie n'ont pas de chance de base.
- **Bonus aux dégâts** (FOR ou AGI) : 13–16 → +D4, 17–18 → +D6.
- **Déplacement** : selon le peuple (Humain 10, Halfelin 8, Nain 8, Elfe 10, Canardin 8, Homme-loup 12), modifié par l'AGI (−4 à +4).
- **PV** = CON, **PVol** = VOL (+2 par capacité Robuste / Focalisé).
- **Amélioration** : une coche par Dragon/Démon et par « oui » aux questions de fin de séance (2 si tu as agi contre ta faiblesse), une seule par compétence. D20 > niveau = +1, maximum 18. Atteindre 18 donne une capacité héroïque.

Les noms français (compétences, états, capacités) sont des traductions libres et se modifient dans l'appli.

Un compte peut appartenir à **plusieurs groupes** (joueur dans l'un, MJ dans un autre) : la liste, avec le rôle dans chacun, est enregistrée dans le compte (`users/{uid}/dragonbane/__monGroupe`) et retrouvée à la connexion, sans code. La bannière du haut permet de passer d'un personnage (et de sa partie) à une partie où l'on est MJ ; les modifications en attente restent rattachées à leur groupe, et le MJ d'une partie ne reçoit que les personnages de cette partie.

## Meneur de jeu

Dans un groupe partagé, l'**administrateur** (le créateur du groupe, champ `owner`) obtient un **code MJ** (onglet Groupe › « Code MJ ») : un petit document `groups/{code MJ}` (`kind: 'mjinvite'`) qui pointe vers le groupe. Le meneur de jeu, connecté, touche « 👑 Je suis le meneur de jeu » sur la première page et saisit ce code : il rejoint le groupe et son compte devient le MJ (champ `mj`), sans avoir besoin de personnage (onglets MJ, Journal, Groupe, Biblio). « Nouveau code » révoque l'ancien ; l'administrateur peut aussi se désigner MJ lui-même. Aucune règle Firestore supplémentaire n'est nécessaire. Chaque joueur envoie alors automatiquement ses fiches **complètes** (notes secrètes, journal perso, PNJ, lieux et leurs images) dans `groups/{code}/mj/{son uid}/…`, et le MJ dispose d'un onglet **MJ** : tableau en direct de tous les personnages, notes privées, et fiche complète en lecture seule. Les joueurs sont prévenus dans la carte du groupe. Le MJ a aussi ses propres **notes du MJ** sur chaque session, PNJ et lieu, rangées dans son compte (document `__notesMJ`, champ `notes`) et jamais envoyées au groupe.

Chaque personnage retient son groupe (`groupId`) : la bannière propose « + Nouveau personnage dans ce groupe » pour chaque groupe où l'on n'est pas MJ, et « Nouveau (sans groupe) ». Un personnage sans groupe rejoint un groupe depuis la carte « Groupe partagé » (créer, code, ou groupe déjà connu) ; « Quitter le groupe » le remet sans groupe.

Règle Firestore à ajouter (à côté de la règle « media ») pour que **seuls le joueur et le MJ** puissent lire ces fiches :

```
// Fiches complètes envoyées au MJ : chaque joueur écrit dans son dossier ; lecture par lui et le MJ du groupe
match /groups/{id}/mj/{uid}/{doc=**} {
  allow write: if request.auth != null && request.auth.uid == uid
    && request.auth.uid in get(/databases/$(database)/documents/groups/$(id)).data.members;
  allow read: if request.auth != null && (request.auth.uid == uid
    || get(/databases/$(database)/documents/groups/$(id)).data.mj == request.auth.uid);
}
```

## Joueur absent

Un joueur peut **prêter** son personnage au groupe partagé (« Mes personnages » › « Prêter au groupe ») : une copie de sa fiche de jeu, sans notes secrètes, journal perso, PNJ ni lieux, est rangée dans `groups/{code}/media/perso_{id}` (même règle Firestore que les croquis). Les autres membres peuvent la jouer en **mode Jeu uniquement** ; leurs modifications sont reprises par la fiche du propriétaire dès que son appli la voit (la plus récente l'emporte, ses données privées sont conservées).

## Crédits

- Pictogrammes des montures et véhicules : [game-icons.net](https://game-icons.net), licence [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) — *donkey* et *mounted-knight* par Skoll, *horse-head*, *old-wagon* et *wood-canoe* par Delapouite, *cartwheel*, *locked-chest* et *knapsack* par Lorc. Tracés repris tels quels, recolorés.

## Tester sur ton PC

```bash
python -m http.server 8766
```

Puis ouvre <http://localhost:8766>.
