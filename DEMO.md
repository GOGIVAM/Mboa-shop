# Branche `demo` — Mboa Shop

Cette branche contient la **version de démonstration** publiée sur https://mko-mboa-shop.vercel.app.
Toutes les données affichées sont **simulées** ; aucun appel n'est envoyé à un backend réel.

## Ce qui diffère de la branche principale

- `public/demo/banner.js` affiche le bandeau « Démo · données simulées ».
- Le site fonctionne déjà avec des données locales ; seul le bandeau de démonstration est ajouté.
- Validation du téléphone corrigée : `/^(\+?237)?6\d{8}$/` appliquée au numéro débarrassé des espaces, points et tirets.

## Construire

```bash
npm ci
npm run build   # sortie : dist/
```

Branche de référence du code : `master`. Cette branche n'est pas destinée à y être fusionnée.
