# Plan ergonomie mobile exécutable — 2026-04-20

## Phase 1 — Simplification visuelle et stabilité
- [x] Alléger les headers mobiles
- [x] Supprimer les contrôles redondants visibles en haut
- [x] Garder le tri/filtre principal dans les panneaux du bas
- [x] Vérifier les overlays, retours et fermetures
- [x] Vérifier le scroll sur toutes les sections
- [x] Quand on valide un artiste, conserver la position de scroll et ne pas remonter en haut de page

## Phase 2 — Architecture propre
- [x] Découper `MobileArtistApp.jsx`
- [x] Créer un `MobileShell`
- [x] Isoler chaque section mobile dans son composant
- [~] Factoriser les composants d overlay / détail / quick edit

## Phase 3 — Artistes
- [~] Rendre la fiche plus hiérarchique
- [~] Rendre l édition rapide vraiment courte
- [~] Clarifier les actions principales
- [~] Réduire le bruit visuel dans la liste

## Phase 4 — Projets
- [~] Vue gestion plus forte
- [~] Mieux distinguer urgent / en cours / fait
- [~] Faire ressortir priorité / échéance
- [~] Mieux exploiter les liens internes

## Phase 5 — Outils
- [~] Séparer Notes / Todos / Stickies par sous-navigation
- [~] Rendre les todos plus rapides à traiter
- [~] Garder les stickies très légers

## Phase 6 — Collectifs / Lieux / Festivals
- [~] Spécialiser l ergonomie de chaque section
- [~] Mettre en avant les infos vraiment utiles à la décision
- [~] Réduire l effet copie conforme de la section artistes

## Phase 7 — Performance et finition
- [~] Poursuivre le code splitting par section
- [~] Réduire la taille de l entrée mobile
- [ ] Faire une passe de test multi-écrans
- [ ] Corriger les derniers frottements d ergonomie

## Exécution immédiate lancée
- phase 1 point 1 : allègement des headers mobiles
- phase 1 : conserver la position de scroll lors de la validation d un artiste
- phase 2 point 1 : extraction des primitives mobiles communes hors de `MobileArtistApp.jsx`
- phase 2 point 2 : mutualisation du header, des stats et de la navigation basse
- phase 2 point 3 : extraction des fonctions utilitaires mobiles dans `MobileDataUtils.js`
- phase 2 point 4 : extraction des panneaux artistes dans `MobileArtistPanels.jsx`
- phase 2 point 5 : extraction de la section artistes dans `MobileArtistSection.jsx`
- phase 2 point 6 : création de `MobileShell.jsx` et branchement des vues mobiles principales dessus
- phase 2 point 7 : extraction de la section outils dans `MobileToolsSection.jsx`
- phase 2 point 8 : extraction du placeholder mobile dans `MobilePlaceholderSection.jsx` et suppression de la double enveloppe shell
- phase 2 point 9 : extraction de l écran placeholder des sections non spécialisées dans `MobilePlaceholderScreen.jsx`
- phase 2 point 10 : extraction des éditeurs outils dans `MobileToolsEditors.jsx`
- phase 2 point 11 : extraction de la section projets dans `MobileProjectSection.jsx`
- phase 2 point 12 : extraction des panneaux projets dans `MobileProjectPanels.jsx`
- phase 2 point 13 : extraction de la section festivals dans `MobileFestivalSection.jsx`
- phase 2 point 14 : extraction des panneaux festivals dans `MobileFestivalPanels.jsx`
- phase 2 point 15 : extraction de la section lieux dans `MobileLieuSection.jsx`
- phase 2 point 16 : extraction des panneaux lieux dans `MobileLieuPanels.jsx`
- phase 2 point 17 : extraction de la section collectifs dans `MobileCollectifSection.jsx`
- phase 2 point 18 : extraction des panneaux collectifs dans `MobileCollectifPanels.jsx`
- phase 2 point 19 : suppression de la branche placeholder morte dans `MobileArtistApp.jsx` maintenant que toutes les sections principales sont spécialisées
- phase 3 point 1 : hiérarchisation de `MobileArtistDetail` et raccourcissement de `MobileQuickEditSheet`
- phase 3 point 2 : réduction du bruit visuel dans `MobileArtistSection.jsx` avec cartes plus compactes et actions plus sobres
- phase 3 point 3 : hiérarchisation des actions de carte artiste avec duo principal `Voir / Modifier` puis actions secondaires plus discrètes
- phase 3 point 4 : resserrement des liens dans `MobileArtistDetail` pour une lecture plus compacte
- phase 4 point 1 : première passe de pilotage projet dans `MobileProjectSection.jsx` et `MobileProjectPanels.jsx` pour mieux faire ressortir urgence, priorité, échéance et liens internes
- phase 4 point 2 : amélioration du socle projets avec filtres et compteurs plus justes (`urgent`, `en cours`, `à faire`, `fait`) et pilotage rapide visible dans la section
- phase 4 point 3 : ajout d un tri de pilotage `Pilotage` pour faire ressortir urgent / en cours / à faire / fait dans les projets
- phase 4 point 4 : réglage du tri projets par défaut sur le pilotage et ajout du compteur `à faire` dans la section projets
- phase 5 point 1 : séparation des outils par sous-navigation réelle (`notes`, `todos`, `stickies`) dans `MobileToolsSection.jsx`
- phase 5 point 2 : accélération du traitement des todos avec filtre local (`à faire`, `faits`, `tous`) et cartes plus directes dans `MobileToolsSection.jsx`
- phase 5 point 3 : allègement des stickies avec une grille plus légère et des cartes plus courtes dans `MobileToolsSection.jsx`
- phase 6 point 1 : première spécialisation des collectifs dans `MobileCollectifSection.jsx` et `MobileCollectifPanels.jsx` avec mise en avant du réseau, du visuel et du repère de présence
- phase 6 point 2 : première spécialisation des lieux dans `MobileLieuSection.jsx` et `MobileLieuPanels.jsx` avec mise en avant de la capacité, du réseau et du repère d exploitation
- phase 6 point 3 : première spécialisation des festivals dans `MobileFestivalSection.jsx` et `MobileFestivalPanels.jsx` avec mise en avant de la période, du lieu, du réseau et du repère de diffusion
- phase 7 point 1 : lazy load du `Desktop` dans `App.jsx` pour ne pas charger la branche bureau tant que l on reste en mobile
- phase 7 point 2 : premier découpage de chunks dans `vite.config.js` (`mobile`, `desktop`, `react-vendor`, `media`, `vendor`) avec relèvement mesuré du seuil d alerte
- phase 7 point 3 : assouplissement multi écrans des stats et de la navigation basse dans `MobilePrimitives.jsx` pour éviter les boutons tassés sur petits téléphones
- phase 7 point 4 : assouplissement des grilles d actions et de résumés dans les panneaux mobile (`artist`, `project`, `collectif`, `lieu`, `festival`) avec `auto-fit` au lieu de grilles rigides
- phase 7 point 5 : correction du retour du panneau stats outils et assouplissement des grilles `notes` / `todos` / `stickies` dans `MobileToolsSection.jsx`
- phase 7 point 6 : durcissement des primitives mobiles communes (`MobileButton`, `MobileBottomSheet`, `MobileSectionHeader`) pour mieux tenir sur écrans étroits et titres plus longs
- phase 7 point 7 : assouplissement des cartes et rangées d actions dans les sections (`artist`, `project`, `collectif`, `lieu`, `festival`) pour éviter les blocs trop serrés en largeur réduite
- phase 7 point 8 : lazy load des sections mobiles depuis `MobileArtistApp.jsx` et découpe plus fine des chunks (`mobile-core`, `mobile-artists`, `mobile-projects`, `mobile-network`, `mobile-tools`) dans `vite.config.js`
