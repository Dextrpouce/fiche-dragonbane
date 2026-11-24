# Fiche Dragonbane — Gestion de personnage

Application pour téléphone, tablette et PC qui gère ton personnage de **Dragonbane** :

- **Fiche** : les 6 attributs (FOR, CON, AGI, INT, VOL, CHA), déplacement, bonus aux dégâts, charge, compétences (générales, armes, magie) et capacités héroïques. Toucher un attribut ou une compétence **lance le D20**.
- **Lanceur de dés** : réussite si le D20 est ≤ au niveau, **avantages / désavantages** (deux dés, on garde le meilleur ou le pire), **Dragon** (1) et **Démon** (20). Un Dragon ou un Démon **coche automatiquement** la compétence pour l'amélioration. Désavantage ajouté tout seul quand tu as l'état lié à l'attribut, ou quand ton armure/casque gêne la compétence. **Forcer le jet** en choisissant un état.
- **Vrais dés** : bouton « ✋ Mes dés » dans le lanceur (ou menu ⋮) : tu lances tes dés et tu entres le résultat, ou tu touches directement **Dragon (1)** / **Démon (20)**. L'appli en déduit réussite ou échec, coche la compétence et propose de forcer le jet. Les jets d'amélioration de fin de séance se saisissent aussi à la main.
- **Combat** : PV et PVol, états, jets de mort (Dragon et Démon comptent double), armes (attaque, parade, dégâts + bonus FOR/AGI), armure et casque, repos (round, court, long — une fois par quart pour les deux premiers), dés libres.
- **Magie** (pour les mages ou si tu connais une école) : écoles, tours de magie (1 PVol, réussite automatique), sorts avec niveau de puissance (2 PVol par niveau), sorts préparés (limite = chance de base de l'INT).
- **Sac** : bourse (or, argent, cuivre, avec rendu de monnaie), encombrement (FOR ÷ 2 + sac à dos), équipement, objets minuscules, souvenir.
- **Progrès** : questions de fin de séance, coches d'amélioration, **jets d'amélioration** automatiques (D20 > niveau = +1, maximum 18), nouvelle capacité héroïque à 18, historique avec annulation.
- **Carnet** : identité, faiblesse, apparence, souvenir, compagnons, notes.
- **Trois modes** (bouton en haut) : **Jeu** (toucher = jet de dé), **Progression** (placer les coches et améliorer), **Libre** (saisir ou corriger sans contrainte).
- Plusieurs personnages, export/import en fichier JSON.

Tout est enregistré **sur l'appareil**, donc l'appli fonctionne **sans internet**. Dès que le réseau revient, les modifications sont envoyées en ligne automatiquement.

## Sauvegarde en ligne : rien à faire

L'appli utilise le **même projet Firebase que le Grimoire WFRP** (`grimoire-wfrp`). Les personnages Dragonbane sont rangés à part (`users/{ton compte}/dragonbane`), et la règle Firestore déjà en place (`match /users/{uid}/{document=**}`) les protège : toi seul peux les lire et les modifier.

Si tu héberges l'appli sur la même adresse GitHub Pages que le Grimoire (`TON-PSEUDO.github.io`), ce domaine est déjà autorisé dans Firebase. Sinon, ajoute-le dans Firebase › Authentication › Paramètres › Domaines autorisés.

## Mettre l'appli en ligne (GitHub Pages)

1. Sur <https://github.com> : **+** › **New repository**, nom `fiche-dragonbane`, **Public**, **Create repository**.
2. **uploading an existing file** : glisse `index.html`, `manifest.webmanifest`, `sw.js` et les dossiers `css`, `js`, `icons` (pas le PDF). **Commit changes**.
3. **Settings** › **Pages** › Branch `main` et `/ (root)` › **Save**.
4. Après une minute : `https://TON-PSEUDO.github.io/fiche-dragonbane/`.

## Installer sur Android

1. Ouvre l'adresse dans **Chrome**, menu **⋮** › **Installer l'application**.
2. Touche le **nuage** en haut et connecte-toi avec Google : tes personnages te suivent sur tous tes appareils.

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

## Tester sur ton PC

```bash
python -m http.server 8766
```

Puis ouvre <http://localhost:8766>.
