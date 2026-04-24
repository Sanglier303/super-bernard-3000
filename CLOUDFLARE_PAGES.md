# Cloudflare Pages - mise en ligne rapide

Objectif actuel :
- publier `super-bernard-3000` gratuitement
- lier le site aux mises a jour GitHub
- garder une version **lecture seule** exploitable tout de suite
- preparer plus tard une vraie version editable via D1 / Functions

## Etat actuel

- la version **D1 editable en ligne** existe maintenant sur la branche `V8`
- `V8` est la branche principale de travail actuelle
- convention voulue : les branches numérotées avancent par version (`V8`, puis `V9`, etc.) sans retour systématique vers la branche numérotée précédente

## Ce qui est deja prepare dans le repo

- le build du front exporte maintenant des JSON statiques depuis les CSV du depot
- l application tente d abord l API locale (`/api/data/...`)
- si cette API n existe pas, elle bascule automatiquement sur `/data/*.json`
- dans ce mode, les tentatives de sauvegarde sont bloquees avec un message clair `lecture seule`
- `_redirects` est ajoute pour le fallback SPA sur Pages

## Reglages Cloudflare Pages conseilles

- **Provider** : GitHub
- **Repository** : `Sanglier303/super-bernard-3000`
- **Production branch** : la branche que tu veux publier
- **Root directory** : `bernard-app`
- **Build command** : `npm run build`
- **Build output directory** : `dist`
- **Node version** : laisser par defaut si le preset Vite fonctionne, sinon Node 22

## Comportement attendu

- en local avec le serveur Express : edition normale
- sur Cloudflare Pages sans backend : consultation publique en lecture seule
- chaque push GitHub sur la branche de prod redeploie le site
- les autres branches peuvent servir de previews

## Etape suivante si on veut l edition en ligne

Passer la persistence hors CSV local :
- soit Cloudflare D1
- soit autre backend persistant

Tant que cette migration n est pas faite, la version Cloudflare doit etre consideree comme **vitrine / consultation / ecoute / navigation**, pas comme back-office d edition.
