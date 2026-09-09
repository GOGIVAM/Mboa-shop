import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  imageUrl?: string | null;
  sellerName?: string;
}

export interface AddToCartInput {
  id: string;
  name: string;
  price: number;
  size?: string;
  color?: string;
  imageUrl?: string | null;
  sellerName?: string;
  quantity?: number;
}

export function formatXAF(value: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(Math.round(value))} XAF`;
}

/** Seuil de livraison offerte, utilisé par l'upsell du panier. */
export const FREE_SHIPPING_FROM = 25000;
export const SHIPPING_FEE = 1500;

interface CartCtx {
  items: CartItem[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (input: AddToCartInput) => void;
  setQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

const STORAGE_KEY = 'mboa_cart';

/** Un article est identifié par id + taille + coloris : chaque variante est une ligne. */
export const lineKey = (item: { id: string; size?: string; color?: string }) =>
  `${item.id}::${item.size ?? ''}::${item.color ?? ''}`;

function readStored(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStored);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* stockage plein */ }
  }, [items]);

  const addToCart = useCallback((input: AddToCartInput) => {
    const qty = input.quantity ?? 1;
    setItems(prev => {
      const key = lineKey(input);
      const existing = prev.find(item => lineKey(item) === key);
      if (existing) {
        return prev.map(item => lineKey(item) === key
          ? { ...item, quantity: item.quantity + qty }
          : item);
      }
      return [...prev, {
        id: input.id,
        name: input.name,
        price: input.price,
        quantity: qty,
        size: input.size,
        color: input.color,
        imageUrl: input.imageUrl,
        sellerName: input.sellerName,
      }];
    });
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setItems(prev => quantity <= 0
      ? prev.filter(item => lineKey(item) !== key)
      : prev.map(item => lineKey(item) === key ? { ...item, quantity } : item));
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems(prev => prev.filter(item => lineKey(item) !== key));
  }, []);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
    return {
      items, count, subtotal, shipping, total: subtotal + shipping, isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen(o => !o),
      addToCart, setQuantity, removeItem,
      clearCart: () => setItems([]),
    };
  }, [items, isOpen, addToCart, setQuantity, removeItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être appelé dans un CartProvider');
  return ctx;
}
