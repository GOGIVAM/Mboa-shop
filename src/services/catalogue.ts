import { PRODUCTS, DemoProduct } from '../data/products';
import { ProductVM } from '../components/ProductCard';

/**
 * Couche d'accès aux données. Aujourd'hui elle lit le jeu de démonstration ;
 * pour brancher le vrai backend, remplacez le corps de chaque fonction par
 * l'appel HTTP correspondant — les signatures n'ont pas à changer.
 *
 *   listProducts  ->  GET /api/products?page&limit&search&category&sort&minPrice&maxPrice
 *   getProduct    ->  GET /api/products/:id
 *   getSimilar    ->  GET /api/products/:id/similar
 */

const LATENCY_MS = 420;

function delay<T>(value: T, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(() => resolve(value), LATENCY_MS);
    signal?.addEventListener('abort', () => {
      window.clearTimeout(id);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export interface ListArgs {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  size?: string;
  color?: string;
}

export interface ListResult { items: ProductVM[]; total: number; }

export async function listProducts(args: ListArgs, signal?: AbortSignal): Promise<ListResult> {
  let rows = [...PRODUCTS];

  if (args.category) rows = rows.filter(p => p.category === args.category);

  if (args.search) {
    const q = args.search.toLowerCase().trim();
    rows = rows.filter(p =>
      p.name.toLowerCase().includes(q) || (p.sellerName ?? '').toLowerCase().includes(q));
  }

  const min = Number(args.minPrice);
  const max = Number(args.maxPrice);
  if (args.minPrice && !Number.isNaN(min)) rows = rows.filter(p => p.price >= min);
  if (args.maxPrice && !Number.isNaN(max)) rows = rows.filter(p => p.price <= max);

  if (args.size) rows = rows.filter(p => p.sizes.includes(args.size!));
  if (args.color) rows = rows.filter(p => p.colors.includes(args.color!));

  switch (args.sort) {
    case 'price_asc':  rows.sort((a, b) => a.price - b.price); break;
    case 'price_desc': rows.sort((a, b) => b.price - a.price); break;
    case 'name_asc':   rows.sort((a, b) => a.name.localeCompare(b.name, 'fr')); break;
    default:           rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const total = rows.length;
  const start = (args.page - 1) * args.limit;
  return delay({ items: rows.slice(start, start + args.limit), total }, signal);
}

export async function getProduct(id: string, signal?: AbortSignal): Promise<DemoProduct | null> {
  return delay(PRODUCTS.find(p => p.id === id) ?? null, signal);
}

export async function getSimilar(id: string, signal?: AbortSignal): Promise<ProductVM[]> {
  const ref = PRODUCTS.find(p => p.id === id);
  const rows = PRODUCTS
    .filter(p => p.id !== id && (!ref || p.category === ref.category))
    .slice(0, 4);
  return delay(rows.length ? rows : PRODUCTS.filter(p => p.id !== id).slice(0, 4), signal);
}
