# Super Bernard 3000 - passage a Cloudflare D1

Objectif : sortir de la version publique lecture seule et permettre les sauvegardes en ligne depuis Cloudflare Pages.

## Ce qui a ete ajoute sur V8

- `functions/api/data/[type].js` : API Pages Functions pour lecture / ecriture
- `functions/api/soundcloud/oembed.js` : proxy oEmbed SoundCloud cote Pages
- `functions/_lib/d1-store.js` : acces D1 partage
- `d1/schema.sql` : schema D1 minimal
- `scripts/generate-d1-seed.mjs` : generation d un seed SQL a partir des CSV locaux

## Binding attendu dans Cloudflare Pages

- **Variable name** : `BERNARD_DB`
- **Type** : D1 database

## Strategie choisie

On ne normalise pas encore toutes les tables metier une par une.
On stocke chaque ligne comme un JSON dans D1, par dataset :

- `artistes`
- `collectifs`
- `lieux`
- `festivals`
- `projets`
- `notes`
- `todos`
- `stickies`

Avantage : migration plus rapide, moins risquee, plus proche du fonctionnement actuel base sur tableaux complets.

## Mise en place conseillee

1. creer une base D1 dans Cloudflare
2. ajouter le binding `BERNARD_DB` au projet Pages
3. executer `d1/schema.sql` sur cette base
4. generer le seed localement :

```bash
cd bernard-app
npm run d1:seed:generate
```

5. importer `d1/seed.generated.sql` dans la base D1
6. redeployer Pages

## Effet attendu

- si `/api/data/...` repond via Pages Functions + D1 : edition en ligne active
- sinon : fallback actuel vers `/data/*.json` et mode lecture seule

## Point de vigilance

- ce chantier n inclut pas encore de gestion des conflits d ecriture multi-utilisateur
- la sauvegarde actuelle reecrit un dataset complet comme aujourd hui avec les CSV
- une phase ulterieure pourra raffiner le schema et les ecritures partielles
