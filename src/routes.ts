/**
 * Table de routage unique — toute navigation passe par ces constantes.
 * Les alias anglais existent pour le bilingue (le composant rendu est le même).
 */
export const ROUTES = {
  home: '/',
  catalogue: '/catalogue',
  cart: '/panier',
  contact: '/contact',
  login: '/connexion',
  signup: '/inscription',
  category: (slug: string) => `/catalogue?cat=${encodeURIComponent(slug)}`,
  product: (id: string) => `/produit/${id}`,
  tracking: '/suivi',
  trackingOrder: (ref: string) => `/suivi?id=${encodeURIComponent(ref)}`,
  paymentReturn: '/paiement/retour',
  sellerSignup: '/inscription-vendeur',
  seller: '/vendeur',
  courier: '/livreur',
  admin: '/admin',
} as const;

export const CATEGORY_SLUGS = {
  friperie: 'friperie',
  pretAPorter: 'pret_a_porter',
  marques: 'marques',
} as const;
