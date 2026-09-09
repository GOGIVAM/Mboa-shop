import { ProductVM } from '../components/ProductCard';
import { unsplash } from './images';

export interface ColorOption { id: string; name: string; hex: string; }

/** Palette de coloris proposés par les vendeurs. */
export const COLOR_OPTIONS: ColorOption[] = [
  { id: 'noir', name: 'Noir', hex: '#121212' },
  { id: 'blanc', name: 'Blanc', hex: '#F4F4F4' },
  { id: 'indigo', name: 'Indigo', hex: '#3B698F' },
  { id: 'sable', name: 'Sable', hex: '#D9C7A3' },
  { id: 'terre', name: 'Terre', hex: '#8B4513' },
  { id: 'olive', name: 'Olive', hex: '#6B7350' },
];

export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export interface Review {
  author: string; rating: number; date: string; text: string; helpful: number;
}

export interface DemoProduct extends ProductVM {
  category: string;
  sizes: string[];
  description: string;
  createdAt: string;
  /** Vues supplémentaires de la galerie. */
  gallery: string[];
  colors: string[];
  rating: number;
  reviewCount: number;
  sold: number;
  reviews: Review[];
}

const REVIEW_POOL: Review[] = [
  { author: 'Awa Mbarga', rating: 5, date: '2026-09-02', helpful: 6, text: 'Tissu épais, coutures nettes. La taille correspond bien à la description, je porte du M habituellement et ça tombe juste.' },
  { author: 'Jean-Paul Nkoulou', rating: 5, date: '2026-08-28', helpful: 4, text: 'Livré en deux jours à Douala. Le livreur a demandé le PIN, tout s\u2019est passé sans accroc.' },
  { author: 'Chantal Fotso', rating: 4, date: '2026-08-21', helpful: 2, text: 'Très bonne qualité pour le prix. Une étoile en moins parce que la couleur est un peu plus foncée que sur la photo.' },
  { author: 'Félix Owona', rating: 5, date: '2026-08-14', helpful: 3, text: 'Deuxième commande chez ce vendeur, toujours impeccable. Emballage soigné.' },
];

/** Ajoute coloris, note et avis de façon déterministe (données de démo). */
function enrich(p: Omit<DemoProduct, 'colors' | 'rating' | 'reviewCount' | 'sold' | 'reviews'>, i: number): DemoProduct {
  const palette = COLOR_OPTIONS.map(c => c.id);
  const colors = [
    palette[i % palette.length],
    palette[(i + 2) % palette.length],
    palette[(i + 4) % palette.length],
  ];
  const rating = Number((4.2 + ((i * 7) % 8) / 10).toFixed(1));
  const reviewCount = 18 + ((i * 37) % 210);

  return {
    ...p,
    colors,
    rating,
    reviewCount,
    sold: 40 + ((i * 53) % 900),
    reviews: REVIEW_POOL.slice(i % 2, (i % 2) + 3),
  };
}

const img = (id: string) => unsplash(id, 800, 1000);
const thumb = (id: string) => unsplash(id, 300, 375);

/**
 * Jeu de données de démonstration — remplace le backend le temps du design.
 * Photos Unsplash, à substituer par vos visuels produits.
 */
export const PRODUCTS: DemoProduct[] = [
  {
    id: '1', name: 'Chemise en wax coupe droite, manches longues', sellerName: 'Atelier Ngoa',
    price: 12500, oldPrice: null, condition: 'friperie', category: 'friperie',
    sizes: ['S', 'M', 'L'], createdAt: '2026-09-01',
    imageUrl: img('1596755094514-f87e34085b2c'),
    gallery: [thumb('1596755094514-f87e34085b2c'), thumb('1523381210434-271e8be1f52b'), thumb('1495121605193-b116b5b9c5fe')],
    description: 'Chemise en tissu wax, coupe droite, col italien. Pièce unique chinée et repassée avant expédition.',
  },
  {
    id: '2', name: 'Robe longue coton imprimé, ceinture nouée', sellerName: 'Maison Kribi',
    price: 17900, oldPrice: 25500, condition: 'neuf', category: 'pret_a_porter',
    sizes: ['S', 'M', 'L', 'XL'], createdAt: '2026-09-02',
    imageUrl: img('1503342217505-b0a15ec3261c'),
    gallery: [thumb('1503342217505-b0a15ec3261c'), thumb('1515886657613-9f3515b0c78f'), thumb('1469334031218-e382a71b716b')],
    description: 'Robe longue en coton imprimé, ceinture à nouer, doublure légère. Coupe fluide adaptée à la saison sèche.',
  },
  {
    id: '3', name: 'Veste en jean brut, doublure imprimée', sellerName: 'Bantu Denim',
    price: 34000, oldPrice: null, condition: 'marque', category: 'marques',
    sizes: ['M', 'L', 'XL'], createdAt: '2026-08-28',
    imageUrl: img('1434389677669-e08b4cac3105'),
    gallery: [thumb('1434389677669-e08b4cac3105'), thumb('1516257984-b1b4d707412e'), thumb('1543076447-215ad9ba6923')],
    description: 'Denim brut 13 oz, doublure imprimée à la main. Se patine avec le temps.',
  },
  {
    id: '4', name: 'Ensemble deux pièces lin, pantalon large', sellerName: 'Maison Kribi',
    price: 28900, oldPrice: null, condition: 'neuf', category: 'pret_a_porter',
    sizes: ['S', 'M', 'L'], createdAt: '2026-08-30',
    imageUrl: img('1490481651871-ab68de25d43d'),
    gallery: [thumb('1490481651871-ab68de25d43d'), thumb('1479064555552-3ef4979f8908')],
    description: 'Chemise et pantalon large en lin lavé. Se porte séparément.',
  },
  {
    id: '5', name: 'Blazer croisé laine mélangée', sellerName: 'Douala Tailoring',
    price: 45000, oldPrice: 58000, condition: 'marque', category: 'marques',
    sizes: ['M', 'L'], createdAt: '2026-08-25',
    imageUrl: img('1539533018447-63fcce2678e3'),
    gallery: [thumb('1539533018447-63fcce2678e3'), thumb('1571945153237-4929e783af4a')],
    description: 'Blazer croisé, épaules structurées, doublure viscose. Retouches offertes à Douala.',
  },
  {
    id: '6', name: 'T-shirt coton bio sérigraphié', sellerName: 'Mboa Print',
    price: 6500, oldPrice: null, condition: 'neuf', category: 'pret_a_porter',
    sizes: ['S', 'M', 'L', 'XL'], createdAt: '2026-09-04',
    imageUrl: img('1521572163474-6864f9cf17ab'),
    gallery: [thumb('1521572163474-6864f9cf17ab'), thumb('1503341504253-dff4815485f1')],
    description: 'Coton bio 180 g, sérigraphie à l’eau, imprimé à Yaoundé.',
  },
  {
    id: '7', name: 'Jupe midi plissée, taille haute', sellerName: 'Atelier Ngoa',
    price: 14200, oldPrice: null, condition: 'friperie', category: 'friperie',
    sizes: ['S', 'M'], createdAt: '2026-08-22',
    imageUrl: img('1515886657613-9f3515b0c78f'),
    gallery: [thumb('1515886657613-9f3515b0c78f'), thumb('1445205170230-053b83016050')],
    description: 'Jupe midi plissée, taille haute élastiquée. Très bon état, aucun défaut visible.',
  },
  {
    id: '8', name: 'Sneakers cuir blanc, semelle gomme', sellerName: 'Kmer Kicks',
    price: 39900, oldPrice: 49900, condition: 'marque', category: 'chaussures',
    sizes: ['40', '41', '42', '43', '44'], createdAt: '2026-09-03',
    imageUrl: img('1549298916-b41d501d3772'),
    gallery: [thumb('1549298916-b41d501d3772'), thumb('1560769629-975ec94e6a86'), thumb('1594633312681-425c7b97ccd1')],
    description: 'Cuir pleine fleur, semelle gomme cousue. Livrées avec boîte et lacets de rechange.',
  },
  {
    id: '9', name: 'Boubou brodé col rond, coton épais', sellerName: 'Sahel Couture',
    price: 32500, oldPrice: null, condition: 'neuf', category: 'pret_a_porter',
    sizes: ['L', 'XL', 'XXL'], createdAt: '2026-08-19',
    imageUrl: img('1552374196-c4e7ffc6e126'),
    gallery: [thumb('1552374196-c4e7ffc6e126'), thumb('1509319117193-57bab727e09d')],
    description: 'Boubou en coton épais, broderie main au col et aux poignets.',
  },
  {
    id: '10', name: 'Sac cabas toile et cuir', sellerName: 'Bantu Denim',
    price: 21000, oldPrice: null, condition: 'marque', category: 'accessoires',
    sizes: [], createdAt: '2026-08-31',
    imageUrl: img('1584917865442-de89df76afd3'),
    gallery: [thumb('1584917865442-de89df76afd3'), thumb('1553062407-98eeb64c6a62')],
    description: 'Toile coton épaisse, anses cuir, doublure intérieure et poche zippée.',
  },
  {
    id: '11', name: 'Chemisier soie imprimé, manches bouffantes', sellerName: 'Maison Kribi',
    price: 19500, oldPrice: null, condition: 'neuf', category: 'pret_a_porter',
    sizes: ['S', 'M', 'L'], createdAt: '2026-09-05',
    imageUrl: img('1479064555552-3ef4979f8908'),
    gallery: [thumb('1479064555552-3ef4979f8908'), thumb('1490481651871-ab68de25d43d')],
    description: 'Soie imprimée, manches bouffantes resserrées au poignet.',
  },
  {
    id: '12', name: 'Pantalon chino coupe ajustée', sellerName: 'Douala Tailoring',
    price: 16800, oldPrice: 22000, condition: 'neuf', category: 'pret_a_porter',
    sizes: ['38', '40', '42', '44'], createdAt: '2026-08-27',
    imageUrl: img('1473966968600-fa801b869a1a'),
    gallery: [thumb('1473966968600-fa801b869a1a'), thumb('1594633312681-425c7b97ccd1')],
    description: 'Chino coton stretch, coupe ajustée, ourlet ajustable.',
  },
  {
    id: '13', name: 'Sweat capuche molleton gratté', sellerName: 'Mboa Print',
    price: 15900, oldPrice: null, condition: 'neuf', category: 'pret_a_porter',
    sizes: ['M', 'L', 'XL'], createdAt: '2026-09-06',
    imageUrl: img('1556821840-3a63f95609a7'),
    gallery: [thumb('1556821840-3a63f95609a7'), thumb('1521572163474-6864f9cf17ab')],
    description: 'Molleton gratté 320 g, capuche doublée, poche kangourou.',
  },
  {
    id: '14', name: 'Salopette denim délavé', sellerName: 'Atelier Ngoa',
    price: 18400, oldPrice: null, condition: 'friperie', category: 'friperie',
    sizes: ['S', 'M', 'L'], createdAt: '2026-08-15',
    imageUrl: img('1543076447-215ad9ba6923'),
    gallery: [thumb('1543076447-215ad9ba6923'), thumb('1434389677669-e08b4cac3105')],
    description: 'Denim délavé, bretelles réglables, quatre poches. Pièce chinée en très bon état.',
  },
  {
    id: '15', name: 'Ceinture cuir tressé, boucle laiton', sellerName: 'Kmer Kicks',
    price: 9800, oldPrice: null, condition: 'marque', category: 'accessoires',
    sizes: ['85', '90', '95', '100'], createdAt: '2026-08-20',
    imageUrl: img('1553062407-98eeb64c6a62'),
    gallery: [thumb('1553062407-98eeb64c6a62'), thumb('1584917865442-de89df76afd3')],
    description: 'Cuir tressé main, boucle laiton massif non traitée.',
  },
  {
    id: '16', name: 'Ensemble enfant short et chemise', sellerName: 'Mboa Print',
    price: 11500, oldPrice: 14500, condition: 'neuf', category: 'enfants',
    sizes: ['4A', '6A', '8A', '10A'], createdAt: '2026-09-07',
    imageUrl: img('1519238263530-99bdd11df2ea'),
    gallery: [thumb('1519238263530-99bdd11df2ea'), thumb('1487222477894-8943e31ef7b2')],
    description: 'Coton léger, short à taille élastiquée et chemise à manches courtes.',
  },
  {
    id: '17', name: 'Sandales cuir tressé, semelle cuir', sellerName: 'Kmer Kicks',
    price: 17500, oldPrice: null, condition: 'marque', category: 'chaussures',
    sizes: ['39', '40', '41', '42'], createdAt: '2026-08-18',
    imageUrl: img('1560769629-975ec94e6a86'),
    gallery: [thumb('1560769629-975ec94e6a86'), thumb('1549298916-b41d501d3772')],
    description: 'Cuir tressé main, semelle cuir cousue, fabriquées à Bafoussam.',
  },
  {
    id: '18', name: 'Foulard coton imprimé, grand format', sellerName: 'Sahel Couture',
    price: 7200, oldPrice: null, condition: 'neuf', category: 'accessoires',
    sizes: [], createdAt: '2026-08-12',
    imageUrl: img('1521369909029-2afed882baee'),
    gallery: [thumb('1521369909029-2afed882baee'), thumb('1553062407-98eeb64c6a62')],
    description: 'Coton imprimé, 120 × 120 cm, bords roulottés main.',
  },
  {
    id: '19', name: 'Manteau laine chinée, col montant', sellerName: 'Douala Tailoring',
    price: 52000, oldPrice: null, condition: 'friperie', category: 'friperie',
    sizes: ['M', 'L'], createdAt: '2026-08-10',
    imageUrl: img('1571945153237-4929e783af4a'),
    gallery: [thumb('1571945153237-4929e783af4a'), thumb('1539533018447-63fcce2678e3')],
    description: 'Laine chinée, col montant, doublure satin. Pièce vintage nettoyée à sec.',
  },
  {
    id: '20', name: 'Casquette coton brodée', sellerName: 'Mboa Print',
    price: 5900, oldPrice: null, condition: 'neuf', category: 'accessoires',
    sizes: [], createdAt: '2026-09-08',
    imageUrl: img('1503342217505-b0a15ec3261c'),
    gallery: [thumb('1503342217505-b0a15ec3261c')],
    description: 'Coton lavé, broderie frontale, sangle métal réglable.',
  },
].map((p, i) => enrich(p, i));

