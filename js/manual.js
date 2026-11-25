// Manuel utilisateur affiché depuis le menu : [titre, contenu HTML]
export const MANUAL = [
  ['Pour commencer', `
    <p>Ouvre le <b>menu</b> (bouton ⋮ en haut à droite ; le bouton <b>?</b> à côté ouvre ce manuel) › <b>Nouveau personnage</b>. Donne un nom, choisis le peuple, l’âge et la profession (et l’école pour un mage), puis saisis les attributs ou tire-les (4D6, on garde les 3 meilleurs).</p>
    <p>Coche ensuite les compétences entraînées : 6 de ta profession, plus 2, 4 ou 6 selon l’âge.</p>
    <p>Le personnage s’ouvre en <b>mode libre</b> : complète ce qui manque, puis touche <b>Terminer</b>.</p>`],
  ['Les trois modes', `
    <p>Le bouton en haut de l’écran change de mode :</p>
    <ul>
      <li><b>Jeu</b> : toucher un attribut ou une compétence lance le D20.</li>
      <li><b>Progression</b> : toucher une compétence place ou retire la coche d’amélioration.</li>
      <li><b>Libre</b> : tout se modifie directement (valeurs, nom, identité…). Pratique pour corriger une erreur.</li>
    </ul>`],
  ['Lancer un dé', `
    <p>Touche une compétence : la fenêtre de jet s’ouvre. Ajoute des <b>avantages</b> ou des <b>désavantages</b> si le MJ le demande (ils s’annulent entre eux), puis lance.</p>
    <p>Réussite si le dé est inférieur ou égal au niveau. <b>1 = Dragon</b>, <b>20 = Démon</b> : la compétence est cochée toute seule.</p>
    <p>Raté ? Tu peux <b>forcer le jet</b> en choisissant un état (impossible sur un Démon).</p>
    <p>Tes états, ton armure et la musique du barde ajoutent leurs avantages ou désavantages automatiquement.</p>
    <p>Avant le jet, la fenêtre montre les dés qui seront lancés (vert-bleu : avantage, rouge : désavantage). Les dés roulent un instant, avec un bruit de dés, avant le résultat. Le son se coupe dans le menu ⋮ › Son des dés.</p>`],
  ['Jouer avec tes propres dés', `
    <p>À droite de chaque compétence, le losange vide <b>✧</b>. Tu as fait un Dragon ou un Démon avec tes dés ? Touche-le et confirme : la compétence est cochée <b>✦</b>.</p>`],
  ['Fiche', `
    <p>Tes attributs, compétences et capacités. En haut, le résumé : PV, PVol, déplacement, bonus aux dégâts et charge.</p>
    <p>Sous chaque attribut, l’étiquette de son <b>état</b> (Épuisé, Malade, Étourdi…) : touche-la pour le mettre ou l’enlever, elle passe en rouge. Le reste de la case lance le dé.</p>
    <p><b>Portrait</b> : sous les attributs, choisis une image (photo, dessin…) ou, sur téléphone, « Prendre une photo ». Elle s’affiche aussi dans l’hexagone en haut. Touche-la pour l’agrandir, la changer ou la retirer. L’image est réduite pour rester légère dans la sauvegarde.</p>
    <p>Les boutons au-dessus des compétences filtrent la liste : toutes, entraînées, armes ou cochées ✦.</p>`],
  ['Combat', `
    <p>Tout ce qu’il faut pendant un combat, sans rien modifier par erreur :</p>
    <ul>
      <li><b>États</b> : touche un état pour le prendre ou l’enlever. L’interrupteur <b>Musique du barde</b> donne un avantage à tous tes jets tant qu’il est allumé.</li>
      <li><b>Tes propres dés</b> 🎲 : coche « Je lance mes dés » dans une fenêtre de jet (ou menu ⋮ › Dés). Partout, l’appli te demande alors le résultat au lieu de tirer : Réussite, Échec, Dragon ou Démon pour un D20 (coche, jet forcé et incidents compris), le D6 d’un repos, les PV et PVol d’un repos court, les compétences améliorées en fin de séance ; pour les dégâts, elle te dit quels dés lancer. Les jets de mort se notent avec les boutons à côté des cases. Ce choix est retenu.</li>
      <li><b>PV et PVol</b> : boutons − et + pour suivre les dégâts et les dépenses. À 0 PV, les <b>jets de mort</b> apparaissent : lance-les avec l’appli, ou avec tes dés et indique le résultat (Réussite, Échec, Dragon, Démon ; à la troisième réussite, choisis les PV du D6).</li>
      <li><b>Armes</b> : Attaquer, Parer, Dégâts, ou <b>🗡 Sournoise</b> pour une attaque par surprise (jet de Discrétion d’abord). Esquiver est en dessous.</li>
      <li><b>Capacités</b> : tes capacités utiles en combat, avec un bouton qui dépense les PVol.</li>
      <li><b>Repos</b> : round, court ou long. L’appli retient ceux déjà pris dans le quart.</li>
    </ul>`],
  ['Magie', `
    <p>Visible si tu connais une école. Les <b>tours</b> coûtent 1 PVol et réussissent toujours. Les <b>sorts</b> coûtent 2 PVol par niveau de puissance.</p>
    <p>Marque les sorts <b>préparés</b> : leur nombre est limité par la chance de base de ton INT.</p>`],
  ['Sac', `
    <ul>
      <li><b>Armes</b> (3 à portée de main au plus) et <b>armure / casque</b> : ajoute-les ici, choisis-les dans la liste pour tout remplir d’un coup.</li>
      <li><b>Bourse</b> : or, argent, cuivre. Les dépenses rendent la monnaie toutes seules.</li>
      <li><b>Équipement</b> : « Choisir dans la liste de matériel » remplit nom et encombrement, et peut payer avec ta bourse. L’ajout rapide (« Corde », « Rations x4 ») marche aussi.</li>
      <li>La barre d’<b>encombrement</b> vire au rouge si tu portes trop (FOR ÷ 2, +2 avec un sac à dos).</li>
    </ul>`],
  ['Progrès', `
    <p>À la fin de la séance :</p>
    <ol>
      <li>Touche <b>Questions de fin de séance</b> et réponds : chaque « oui » donne une coche à placer.</li>
      <li>Passe en mode <b>Progression</b> et touche les compétences à cocher.</li>
      <li>Touche <b>Jets d’amélioration</b> : D20 plus grand que le niveau = +1 (18 au plus).</li>
    </ol>
    <p>Une erreur ? Le bouton <b>↶</b> de l’historique annule la dernière opération.</p>`],
  ['Carnet', `
    <p>Identité, faiblesse, apparence, souvenir, compagnons et notes libres. L’identité se modifie en mode libre.</p>`],
  ['Journal', `
    <p>Une page par séance : « Nouvelle session » crée la page du jour, numérotée. Donne-lui un titre, puis remplis ce que tu veux : <b>Résumé</b>, <b>PNJ rencontrés</b>, <b>Lieux</b>, <b>Butin</b>.</p>
    <p><b>PNJ</b> : dans une session, tape le nom d’un PNJ et touche + : s’il existe déjà, il est relié à la session, sinon sa fiche est créée. Touche son nom pour compléter sa fiche (image, rôle, attitude, où le trouver, notes). Sur téléphone ou tablette, le bouton 📷 prend directement en photo l’illustration du MJ ; touche l’image pour la voir en grand. L’onglet « PNJ » du journal montre toutes les fiches, avec les sessions où vous les avez croisés.</p>
    <p><b>Lieux</b> : pareil pour les lieux importants (« Lieux visités » dans une session). Leur fiche garde le type (ville, auberge, donjon…), où il se trouve, des notes, une image (le plan du MJ en photo, par exemple) et les PNJ qu’on y trouve. L’onglet « Lieux » du journal les montre tous.</p>
    <p><b>Pistes</b> : ajoute les choses à faire ; celles qui ne sont pas cochées restent en haut du journal (« Pistes en cours »), quelle que soit la session.</p>
    <p><b>Croquis</b> : « Ajouter une page de croquis » ouvre une feuille pour dessiner au stylet, au doigt ou à la souris (plans, cartes…). Trois couleurs, gomme, annuler, tout effacer et <b>Plein écran</b> (une nouvelle page s’ouvre directement en plein écran). Avec un stylet, la paume posée sur l’écran ne dessine pas et la pression épaissit le trait.</p>
    <p>Sur iPad avec l’Apple Pencil, tu peux écrire à la main directement dans les champs de texte : l’iPad transforme l’écriture en texte. Sur Android, utilise le mode écriture manuscrite du clavier. La recherche fouille tout le journal.</p>
    <p><b>Journal du groupe</b> : quand ton groupe est partagé (onglet Groupe), le journal devient celui du groupe : tout le monde voit et complète les mêmes sessions, pistes, PNJ et croquis (les traits des autres apparaissent en direct). Pour savoir <b>qui a modifié quoi</b> : le petit bouton « Qui a modifié quoi » ouvre l’historique filtré sur le journal, et chaque rubrique d’une session (ainsi que chaque fiche PNJ ou lieu) affiche son dernier auteur (« ✎ Jorunda · 14:02 »). « Verser mon journal perso » y copie tes sessions et PNJ déjà écrits. Hors groupe partagé, tu retrouves ton journal personnel.</p>
    <p><b>Écrire à plusieurs</b> : les changements des autres apparaissent en direct, sans toucher au champ dans lequel tu écris (ton curseur ne bouge pas). Un badge <b>« ✎ Léa écrit… »</b> montre le champ, la fiche PNJ ou lieu, ou les notes du groupe qu’un autre membre est en train de modifier. Si quelqu’un a changé le même texte pendant que tu écrivais, rien n’est écrasé : sa version est gardée et la tienne est ajoutée dessous (« — Version de … : »), à toi de faire le tri. Dans une fiche PNJ ou lieu, seuls les champs que tu as touchés sont enregistrés.</p>
    <p><b>Notes secrètes</b> 🔒 : dans le journal du groupe, chaque session, chaque fiche PNJ et chaque lieu ont un champ « Mes notes secrètes ». Il est rangé dans ta fiche, pas dans le groupe : les autres joueurs ne le voient jamais ; seuls toi (sur tous tes appareils) et le MJ du groupe, s’il y en a un, le lisez.</p>`],
  ['Groupe', `
    <p><b>Groupe partagé</b> : un personnage sans groupe affiche la carte « Groupe partagé » : <b>Créer un groupe</b> (tu obtiens un code à donner aux autres joueurs), <b>Rejoindre avec un code</b>, ou rejoindre d’un geste <b>un de tes groupes</b> déjà connus. Tout le monde voit et modifie la même caisse, le même matériel et le même journal, en direct (chacun connecté avec son propre compte).</p>
    <p>Une fois le groupe rejoint, la carte propose <b>Inviter</b> (le code) et <b>Quitter le groupe</b> : ton personnage repasse sans groupe (tu restes membre si un autre de tes personnages y joue). Tes groupes sont enregistrés <b>dans ton compte</b> : sur un autre appareil, connecte-toi et ils reviennent tout seuls, sans ressaisir le code.</p>
    <p>Chaque modification est notée (quand, quoi, et qui). Cet <b>historique</b> ne s’affiche qu’à la demande : bouton « Historique des modifications » en bas de l’onglet Groupe, ou menu ⋮. Il se filtre par type : caisse, comptes, matériel, ventes, notes, sessions, PNJ, lieux, pistes. Sans réseau, tes modifications attendent (⏳) et partent dès le retour du réseau.</p>
    <ul>
      <li><b>Caisse</b> : Recette ou Dépense. Coche la case pour prendre l’argent dans ta bourse ou l’y verser. La dernière opération s’annule avec ↶ dans l’historique.</li>
      <li><b>Comptes</b> : l’argent du groupe gardé ailleurs. « Nouveau compte » crée un <b>dépôt</b> (chez un banquier, un marchand), ce qu’<b>on nous doit</b>, ce qu’<b>on doit</b>, ou un <b>projet</b> payé en plusieurs fois (construction…) avec son coût total. Touche un compte pour déposer, retirer, rembourser ou payer (depuis la caisse, avec un dépôt, ou sans passer par la caisse). La <b>fortune du groupe</b> s’affiche sous la caisse : caisse + dépôts + ce qu’on nous doit − ce qu’on doit.</li>
      <li><b>Montures et véhicules</b> : chaque âne et le char ont leur chargement. Ajoute des sacoches de selle (+2), attelle un âne au char avec le harnais.</li>
      <li>Touche un objet pour le déplacer vers un autre transport ou ton sac, ou le marquer <b>à vendre</b> avec sa valeur.</li>
      <li><b>À vendre</b> : la liste de ce qu’on ne garde pas et son total. « Vendu » verse le prix dans la caisse.</li>
    </ul>`],
  ['Biblio', `
    <p>Pour consulter : armes, armures, matériel, sorts, tours, capacités et <b>règles</b> (rappels pour le combat : initiative, parer, esquiver, attaques spéciales, Dragon et Démon, 0 PV, états, peur, poison… et pour la magie : PVol et niveau de puissance, sorts préparés, grimoire, métal, incidents magiques, apprendre un sort). Choisis une rubrique ou tape un mot dans la recherche, puis touche une ligne pour voir le détail.</p>
    <p>Les noms sont des traductions libres et les effets sont résumés : le livre fait foi.</p>`],
  ['Personnages et parties', `
    <p>Touche la <b>bannière en haut</b> (ton nom) : chaque <b>groupe</b> est un bloc qui contient « Mener la partie » si tu en es le MJ, <b>tes personnages</b> de ce groupe et les <b>personnages prêtés</b> par ses joueurs. Les personnages qui ne font partie d’aucun groupe sont dans « Sans groupe ». Choisis-en un pour y passer.</p>
    <p>Dans chaque groupe où tu n’es pas MJ, <b>« + Nouveau personnage dans ce groupe »</b> crée un personnage qui en fait partie. « Nouveau (sans groupe) » crée un personnage hors de tout groupe, jusqu’à ce que tu rejoignes un groupe depuis l’onglet Groupe.</p>
    <p>Tu peux ainsi jouer un personnage dans une partie et être MJ d’une autre : choisir ton personnage te ramène dans sa partie ; choisir « 👑 nom de la partie » te met en MJ (onglets MJ, Journal, Groupe, Biblio). « 👑 MJ d’une partie… » permet d’en rejoindre une nouvelle avec un code MJ. Tous tes groupes sont enregistrés dans ton compte.</p>`],
  ['Meneur de jeu', `
    <p><b>Devenir MJ</b> : l’administrateur du groupe (celui qui l’a créé) touche <b>« Code MJ »</b> dans la carte du groupe (onglet Groupe) et donne ce code au meneur de jeu — pas aux joueurs. Le MJ, connecté, touche <b>« 👑 Je suis le meneur de jeu »</b> sur la première page de l’appli (ou dans le menu ⋮) et saisit le code : il entre dans le groupe comme MJ, <b>sans avoir besoin de personnage</b> (il a alors les onglets MJ, Journal, Groupe et Biblio). « Nouveau code » rend l’ancien inutilisable. L’administrateur peut aussi être le MJ lui-même (« Je serai le MJ »). Le MJ peut « Ne plus être MJ » : il reste dans le groupe, avec son personnage de ce groupe s’il en a un, sinon « Sans personnage » (il peut alors en créer un dans le groupe).</p>
    <p><b>L’administrateur quitte le groupe ?</b> Il choisit qui le devient à sa place (le MJ est proposé d’office). S’il part sans successeur, le plus ancien membre devient administrateur.</p>
    <p>Le MJ a un onglet <b>MJ</b> : toutes les fiches des joueurs, en direct (PV, PVol, états, armure, armes, compétences utiles, jets de mort). « 🔒 Notes privées » montre les notes secrètes, le carnet et le journal perso ; « Fiche complète » ouvre la fiche entière en lecture seule.</p>
    <p>Dans le <b>Journal</b>, le MJ voit aussi, directement sur chaque session, chaque fiche PNJ et chaque lieu, les <b>notes secrètes de tous les joueurs</b> (cadre doré « 👑 Secrets des joueurs », avec le nom du personnage et du joueur).</p>
    <p>Le MJ a aussi ses propres <b>« 👑 Notes du MJ »</b> sur chaque session, chaque PNJ et chaque lieu : rangées dans son compte (retrouvées sur ses autres appareils), jamais envoyées au groupe, invisibles des joueurs.</p>
    <p>Un joueur est absent et n’a pas prêté son personnage ? Sur sa carte, <b>« 🎭 Prêter au groupe »</b> le prête à sa place (sans ses notes privées). Pendant la partie, sa carte suit les PV et états du personnage joué. « Ne plus prêter » arrête le prêt ; le joueur récupère tout ce qui s’est passé en rouvrant l’appli.</p>
    <p>Joueurs : dès qu’un MJ est désigné, vos fiches complètes lui sont envoyées automatiquement (notes secrètes et journal perso compris) ; la carte du groupe le rappelle. Les autres joueurs, eux, ne les voient jamais.</p>`],
  ['Joueur absent', `
    <p>Un joueur ne pourra pas venir ? Avant la séance, il ouvre <b>Mes personnages</b> (touche son nom en haut) et coche <b>« Prêter au groupe »</b>. Il faut un groupe partagé et être connecté.</p>
    <p>Le jour de la séance, un autre joueur ouvre <b>Mes personnages</b> › « Personnages prêtés par le groupe » › <b>Jouer</b>. Un bandeau 🎭 rappelle qu’il joue à sa place : seul le mode <b>Jeu</b> est possible (ni mode libre, ni progression). Jets, PV, PVol, états, objets utilisés : tout est enregistré sur la fiche du joueur absent. « Rendre » revient à ton personnage.</p>
    <p>Quand le joueur rouvre l’appli, sa fiche récupère tout ce qui s’est passé (PV perdus, compétences cochées par un Dragon ou un Démon…). En fin de séance, celui qui joue le personnage répond aux <b>questions de fin de séance</b> pour lui (« As-tu participé ? » reste à non) ; les coches gagnées attendent son joueur, qui les place et fait lui-même les jets d’amélioration. À l’ouverture de l’appli, une fenêtre « Points à dépenser » rappelle les coches à placer et les jets à faire. Ses notes secrètes et son journal perso ne sont jamais prêtés. Décoche « Prêter au groupe » pour reprendre la main.</p>`],
  ['Sauvegarde et appareils', `
    <p>Tout est enregistré sur l’appareil : l’appli marche <b>sans internet</b>.</p>
    <p>Menu › <b>Sauvegarde en ligne</b> : connecte-toi avec ton compte Google ou avec un e-mail et un mot de passe (« Créer un compte » la première fois) pour retrouver tes personnages et le groupe sur tous tes appareils. La pastille du nuage indique l’état : verte = à jour, jaune = en attente d’envoi, rouge = connexion à refaire.</p>
    <p>Si tu modifies le même personnage sur deux appareils hors ligne, c’est la dernière modification qui gagne.</p>
    <p>Menu › <b>Exporter</b> crée un fichier de sauvegarde, <b>Importer</b> le recharge.</p>`],
  ['Installer sur le téléphone', `
    <p>Dans Chrome, ouvre le site puis menu <b>⋮</b> › <b>Installer l’application</b>. Elle s’ouvre ensuite comme une appli normale et se met à jour toute seule quand tu as du réseau.</p>`],
  ['Crédits', `
    <p>Pictogrammes des montures et véhicules : <b>game-icons.net</b>, sous licence <b>CC BY 3.0</b> (creativecommons.org/licenses/by/3.0) — tête d’âne et chevalier monté par <b>Skoll</b> ; tête de cheval, chariot bâché et barque par <b>Delapouite</b> ; roue de charrette, coffre et sac par <b>Lorc</b>.</p>
    <p>Règles : Dragonbane (Free League Publishing). Noms et effets résumés librement : le livre fait foi.</p>`],
];
