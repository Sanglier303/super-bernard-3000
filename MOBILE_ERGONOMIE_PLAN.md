# Plan ergonomie mobile exécutable — 2026-04-20

## Phase 1 — Simplification visuelle et stabilité
- [x] Alléger les headers mobiles
- [x] Supprimer les contrôles redondants visibles en haut
- [x] Garder le tri/filtre principal dans les panneaux du bas
- [x] Vérifier les overlays, retours et fermetures
- [x] Vérifier le scroll sur toutes les sections
- [x] Quand on valide un artiste, conserver la position de scroll et ne pas remonter en haut de page

## Phase 2 — Architecture propre
- [ ] Découper `MobileArtistApp.jsx`
- [ ] Créer un `MobileShell`
- [ ] Isoler chaque section mobile dans son composant
- [~] Factoriser les composants d overlay / détail / quick edit

## Phase 3 — Artistes
- [ ] Rendre la fiche plus hiérarchique
- [ ] Rendre l édition rapide vraiment courte
- [ ] Clarifier les actions principales
- [ ] Réduire le bruit visuel dans la liste

## Phase 4 — Projets
- [ ] Vue gestion plus forte
- [ ] Mieux distinguer urgent / en cours / fait
- [ ] Faire ressortir priorité / échéance
- [ ] Mieux exploiter les liens internes

## Phase 5 — Outils
- [ ] Séparer Notes / Todos / Stickies par sous-navigation
- [ ] Rendre les todos plus rapides à traiter
- [ ] Garder les stickies très légers

## Phase 6 — Collectifs / Lieux / Festivals
- [ ] Spécialiser l ergonomie de chaque section
- [ ] Mettre en avant les infos vraiment utiles à la décision
- [ ] Réduire l effet copie conforme de la section artistes

## Phase 7 — Performance et finition
- [ ] Poursuivre le code splitting par section
- [ ] Réduire la taille de l entrée mobile
- [ ] Faire une passe de test multi-écrans
- [ ] Corriger les derniers frottements d ergonomie

## Exécution immédiate lancée
- phase 1 point 1 : allègement des headers mobiles
- phase 1 : conserver la position de scroll lors de la validation d un artiste
- phase 2 point 1 : extraction des primitives mobiles communes hors de `MobileArtistApp.jsx`
- phase 2 point 2 : mutualisation du header, des stats et de la navigation basse
