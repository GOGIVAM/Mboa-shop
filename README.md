# MBOA SHOP ONLINE — front

Projet React 18 + TypeScript + Vite, autonome : il tourne sans backend grâce à
un jeu de données de démonstration.

## Démarrer

```bash
npm install
npm run dev
```

Ouvre `http://localhost:5173`.

```bash
npm run build       # tsc --noEmit puis build de production
npm run typecheck   # vérification TypeScript seule
```

## Ce qui est fonctionnel

| Route | Écran |
|---|---|
| `/` | **Accueil** — hero, bandeau confiance, tuiles catégories, nouveautés, bandeau friperie, bons plans, appel vendeur |
| `/catalogue` | **Catalogue** — hero compact, filtres persistants, 12 articles, pagination |
| `/produit/:id` | **Fiche article** — galerie, tailles, barre d'achat sticky, similaires |
| `/suivi` | **Suivi client** — saisie du PIN, timeline, carte Leaflet, infos livreur |
| `/vendeur` | **Dashboard vendeur** — KPIs, articles, commandes filtrables, assistant IA |
| `/inscription-vendeur` | **Inscription vendeur** — 3 sections, validation inline, progression |
| `/livreur` | **Portail livreur** — disponibilité, missions, carte, clavier PIN |
| `/admin` | **Supervision** — KPIs, 4 onglets, tableaux paginés et filtrables |
| `/paiement/retour` | Retour de paiement NotchPay (succès / échec / annulé / attente) |

Le **panier** est réel : ajout depuis le catalogue ou la fiche, quantités,
suppression, seuil de livraison offerte, persistance dans `localStorage`.
Le **checkout** enchaîne trois étapes avec validation champ par champ et rend
un numéro de commande plus un PIN de livraison.
Bascule FR / EN dans la navbar, langue mémorisée.

Parcours de démonstration à essayer :

1. Ajoutez un article au panier, puis **Commander** — le PIN s'affiche à la fin.
2. `/suivi` avec le PIN **4271** — la position du livreur avance toutes les 3 s.
3. `/livreur` — sélectionnez la mission `LIV-8801`, saisissez **4271** au clavier.
4. `/paiement/retour?status=complete&reference=NP-8814&order=MB-2049&pin=4271`

## Images

Les visuels viennent d'**Unsplash** (photos libres), centralisés dans
`src/data/images.ts` : `HERO` pour les bandeaux, `TILE` pour les tuiles de la
page d'accueil, et `imageUrl` / `gallery` par article dans
`src/data/products.ts`. Le helper `unsplash(id, w, h)` construit les URL du CDN.

Si une image ne charge pas (réseau, identifiant obsolète), `ProductCard` et
`HeroImage` retombent automatiquement sur l'aplat de la charte — aucune case
vide à l'écran. Pour passer à vos propres photos : déposez-les dans
`public/assets/` et remplacez les valeurs dans ces deux fichiers.

## Structure

```
src/
  main.tsx                 point d'entrée, providers
  App.tsx                  table de routes (FR + alias EN)
  routes.ts                constantes de routes
  styles/main.css          feuille unique, 17 sections, mobile-first
  i18n/index.tsx           dictionnaires FR/EN + useI18n()
  hooks/useReveal.ts       useReveal, useScrollLock, useParallax, useStuck
  context/
    CartContext.tsx        panier, totaux, drawer, localStorage
    ToastContext.tsx       notifications
  data/
    products.ts            20 articles de démonstration
    orders.ts              commandes, missions livreur, vendeurs
    images.ts              URL Unsplash par contexte (hero, tuiles, articles)
  services/
    catalogue.ts           produits
    operations.ts          commandes, missions, vendeurs
  components/
    Navbar.tsx             recherche centrale + rangée catégories + 4 variantes
    BottomNav.tsx          navigation basse mobile
    Footer.tsx
    HeroImage.tsx          image de bandeau avec repli
    ProductCard.tsx        + ProductCardSkeleton
    Pagination.tsx
    CartDrawer.tsx
    CheckoutModal.tsx      stepper 3 étapes, NotchPay
    TrackingMap.tsx        carte Leaflet
    SplitText.tsx          titre animé lettre par lettre
  pages/
    HomePage.tsx
    CataloguePage.tsx
    ProductPage.tsx
    SuiviClientPage.tsx
    VendeurPage.tsx
    InscriptionVendeurPage.tsx
    LivreurPage.tsx
    AdminPage.tsx
    PaiementRetourPage.tsx
    NotFoundPage.tsx
```

## Brancher le vrai backend

Deux fichiers concentrent tous les accès aux données. Remplacez le corps des
fonctions par vos appels HTTP, les signatures ne changent pas.

`src/services/catalogue.ts` :

```
listProducts  ->  GET /api/products?page&limit&search&category&sort&minPrice&maxPrice
                  réponse attendue : { items, total }
getProduct    ->  GET /api/products/:id
getSimilar    ->  GET /api/products/:id/similar
```

`src/services/operations.ts` :

```
findOrderByPin           ->  POST /api/orders/track        { pin }
placeOrder               ->  POST /api/orders              { customer, payment, items }
listOrders               ->  GET  /api/orders
listMissions             ->  GET  /api/deliveries/mine
advanceMission           ->  POST /api/deliveries/:id/status
listSellers              ->  GET  /api/admin/sellers
submitSellerApplication  ->  POST /api/sellers/apply
```

Deux autres points à rebrancher :

- **Position du livreur** — `SuiviClientPage` rejoue le trajet toutes les 3,5 s
  via un `setTimeout`. Remplacez-le par votre socket :
  `socket.on('courier:position', p => setTrack(prev => [...prev, p]))`.
- **Assistant IA vendeur** — `VendeurPage` répond avec un texte fixe après
  1,1 s. Branchez la route `/api/ai` à la place du `setTimeout` dans `askAi`.

Aucun autre fichier n'a connaissance de la source des données.

## Design

Palette et typographie MBOA : fond `#F8F9FA`, encre `#0E2A47`, accent
`#3B698F`, or `#B5944A`, friperie `#8B4513`. Barlow pour le corps, Bebas Neue
pour les titres display, Inter pour l'UI. Tous les tokens sont en haut de
`main.css` — couleurs, espacement, rayons, ombres, durées.

Mobile-first strict : toutes les media queries sont en `min-width`
(480 / 768 / 1024 / 1280). Zéro style inline dans les composants, zéro emoji
dans le JSX — les icônes sont des SVG `lucide-react`.

**Barre de navigation** — fond blanc, marque, sélecteur « Articles », champ de
recherche central, liens compte, bouton vendeur, langue et panier. En dessous,
une rangée de catégories qui **s'escamote dès que la page défile** et qui est
absente du catalogue, où les filtres tiennent déjà ce rôle. Les portails
vendeur, livreur et administration gardent un fond sombre pour signaler le
changement de contexte. Sous 1024 px : hamburger + drawer latéral, recherche
depuis la page catalogue, navigation basse.

**Filtres toujours visibles** — la barre de filtres est collante sous le chrome
et se compacte au scroll. Sur mobile : recherche + tri + bouton « Filtres » qui
ouvre une feuille par le bas. La sidebar desktop est également collante.

**12 articles par page**, puis pagination numérotée avec ellipses et
« Affichage 1–12 sur N ». Page et filtres sont dans l'URL, donc partageables et
compatibles avec le bouton retour.

**Animations** — hero en parallaxe, titre lettre par lettre, sous-titre révélé
derrière un masque montant, grille en cascade, inclinaison 3D des cartes au
survol, zoom lent des images, soulignements qui se déploient, compactage
progressif de la barre de filtres. Tout est neutralisé sous
`prefers-reduced-motion: reduce`, et le 3D au survol est coupé sur pointeur
tactile.

## Images

Centralisées dans `src/data/images.ts` (voir plus haut).

## Reste à faire

- Formulaire de publication d'article (le bouton « Publier un article » du
  dashboard vendeur affiche pour l'instant un toast).
- Authentification réelle : « S'inscrire | Se connecter » pointe vers
  l'inscription vendeur, il n'y a pas encore d'écran de connexion client.
- Câblage backend des actions inline de l'administration (approuver / rejeter).
