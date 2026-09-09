import { CSSProperties, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Heart } from 'lucide-react';
import { useI18n } from '../i18n';
import { formatXAF } from '../context/CartContext';
import { ROUTES } from '../routes';

export interface ProductVM {
  id: string;
  name: string;
  sellerName?: string;
  price: number;
  oldPrice?: number | null;
  imageUrl?: string | null;
  /** 'neuf' | 'friperie' | 'marque' — pilote le badge de gauche. */
  condition?: string | null;
  outOfStock?: boolean;
}

interface ProductCardProps {
  product: ProductVM;
  index?: number;
  onAdd?: (product: ProductVM) => void;
  onToggleFav?: (product: ProductVM) => void;
  isFav?: boolean;
}

export { formatXAF };


function ConditionBadge({ condition }: { condition?: string | null }) {
  const { t } = useI18n();
  const key = (condition ?? '').toLowerCase();
  if (key.includes('friperie') || key.includes('thrift') || key.includes('used')) {
    return <span className="badge badge-friperie">{t('badge.friperie')}</span>;
  }
  if (key.includes('marque') || key.includes('brand')) {
    return <span className="badge badge-marque">{t('badge.marque')}</span>;
  }
  return <span className="badge badge-new">{t('badge.neuf')}</span>;
}

export default function ProductCard({ product, index = 0, onAdd, onToggleFav, isFav }: ProductCardProps) {
  const { t } = useI18n();
  const [broken, setBroken] = useState(false);
  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  return (
    <article className="product-card tilt-3d" style={{ '--i': index } as CSSProperties}>
      <Link to={ROUTES.product(product.id)} className="product-media" aria-label={product.name}>
        {product.imageUrl && !broken ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
          />
        ) : (
          <span className="product-media-empty" aria-hidden="true" />
        )}
        <span className="product-badges">
          <ConditionBadge condition={product.condition} />
          {discount > 0 && <span className="badge badge-sale">-{discount}%</span>}
        </span>
      </Link>

      {onToggleFav && (
        <button
          type="button"
          className={`product-fav${isFav ? ' is-on' : ''}`}
          onClick={() => onToggleFav(product)}
          aria-label={t(isFav ? 'shop.unfav' : 'shop.fav')}
          aria-pressed={!!isFav}
        >
          <Heart size={17} strokeWidth={1.8} fill={isFav ? 'currentColor' : 'none'} />
        </button>
      )}

      <div className="product-info">
        {product.sellerName && <p className="product-seller">{product.sellerName}</p>}
        <Link to={ROUTES.product(product.id)} className="product-name">{product.name}</Link>
        <div className="product-price-row">
          <span className="price product-price">{formatXAF(product.price)}</span>
          {discount > 0 && product.oldPrice && (
            <span className="price-old product-price-old">{formatXAF(product.oldPrice)}</span>
          )}
        </div>
      </div>

      {onAdd && (
        <button
          type="button"
          className="product-add"
          onClick={() => onAdd(product)}
          disabled={product.outOfStock}
        >
          <Plus size={15} strokeWidth={2.2} />
          {t(product.outOfStock ? 'shop.outOfStock' : 'shop.addToCart')}
        </button>
      )}
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card sk-product">
      <div className="skeleton sk-product-img" />
      <div className="sk-product-body">
        <div className="skeleton sk-text-sm sk-w-40" />
        <div className="skeleton sk-text sk-w-80" />
        <div className="skeleton sk-title sk-w-60" />
      </div>
    </div>
  );
}
