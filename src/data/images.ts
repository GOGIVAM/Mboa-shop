/**
 * Visuels Unsplash — photos libres d'utilisation, servies par leur CDN.
 * Chaque identifiant est choisi pour son contexte (mode, friperie, chaussures…).
 * Si une image ne charge pas, ProductCard et le hero retombent sur l'aplat
 * de la charte (voir .product-media-empty / .hero-media-placeholder).
 */

const BASE = 'https://images.unsplash.com/photo-';

export function unsplash(id: string, w = 800, h?: number): string {
  const crop = h ? `&h=${h}&fit=crop&crop=entropy` : '&fit=crop';
  return `${BASE}${id}?auto=format&q=75&w=${w}${crop}`;
}

/** Bandeaux — un par contexte de page ou de catégorie. */
export const HERO = {
  home:        unsplash('1441984904996-e0b6ba687e04', 1920, 900),
  catalogue:   unsplash('1483985988355-763728e1935b', 1920, 620),
  friperie:    unsplash('1495121605193-b116b5b9c5fe', 1920, 620),
  pretAPorter: unsplash('1469334031218-e382a71b716b', 1920, 620),
  marques:     unsplash('1490481651871-ab68de25d43d', 1920, 620),
  chaussures:  unsplash('1549298916-b41d501d3772', 1920, 620),
  accessoires: unsplash('1553062407-98eeb64c6a62', 1920, 620),
  enfants:     unsplash('1519238263530-99bdd11df2ea', 1920, 620),
  seller:      unsplash('1556742049-0cfed4f6a45d', 1600, 900),
} as const;

/** Tuiles de catégorie de la page d'accueil. */
export const TILE = {
  friperie:    unsplash('1523381210434-271e8be1f52b', 720, 900),
  pretAPorter: unsplash('1445205170230-053b83016050', 720, 900),
  marques:     unsplash('1539533018447-63fcce2678e3', 720, 900),
  chaussures:  unsplash('1560769629-975ec94e6a86', 720, 900),
  accessoires: unsplash('1584917865442-de89df76afd3', 720, 900),
  enfants:     unsplash('1487222477894-8943e31ef7b2', 720, 900),
} as const;
