import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChevronRight, Plus, Star, Check, RotateCw, MessageSquare, Heart, Share2, ThumbsUp, Truck,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard, { ProductCardSkeleton, ProductVM } from '../components/ProductCard';
import { useCart, formatXAF } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useI18n, TKey } from '../i18n';
import { useReveal } from '../hooks/useReveal';
import { ROUTES } from '../routes';
import { getProduct, getSimilar } from '../services/catalogue';
import { DemoProduct, COLOR_OPTIONS } from '../data/products';

type Tab = 'details' | 'reviews' | 'shipping';

export default function ProductPage() {
  const { id = '' } = useParams();
  const { t } = useI18n();
  const { addToCart } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState<DemoProduct | null>(null);
  const [similar, setSimilar] = useState<ProductVM[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [shot, setShot] = useState(0);
  const [tab, setTab] = useState<Tab>('details');
  const [reloadKey, setReloadKey] = useState(0);

  useReveal([product, similar, tab]);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    setSize('');
    setShot(0);
    setTab('details');

    Promise.all([getProduct(id, controller.signal), getSimilar(id, controller.signal)])
      .then(([found, rest]) => {
        setProduct(found);
        setSimilar(rest);
        setColor(found?.colors[0] ?? '');
        setStatus(found ? 'ready' : 'error');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setStatus('error');
      });

    return () => controller.abort();
  }, [id, reloadKey]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [id]);

  const handleAdd = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !size) {
      toast.show(t('product.pickSize'), 'warn');
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: size || undefined,
      color: color || undefined,
      imageUrl: product.imageUrl,
      sellerName: product.sellerName,
    });
    toast.show(t('shop.added', { name: product.name }), 'success');
  };

  const discount = product?.oldPrice && product.oldPrice > product.price
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : 0;

  const conditionLabel = product?.condition === 'friperie'
    ? t('badge.friperie')
    : product?.condition === 'marque'
      ? t('badge.marque')
      : t('badge.neuf');

  const selectedColor = COLOR_OPTIONS.find(c => c.id === color);
  const shots = product ? [product.imageUrl ?? '', ...product.gallery].filter(Boolean) : [];

  /** Répartition des notes, dérivée du total d'avis. */
  const buckets = product
    ? [5, 4, 3, 2, 1].map((stars, i) => ({
        stars,
        count: Math.max(1, Math.round(product.reviewCount * [0.68, 0.19, 0.08, 0.03, 0.02][i])),
      }))
    : [];
  const bucketMax = Math.max(1, ...buckets.map(b => b.count));

  const TABS: { id: Tab; label: TKey }[] = [
    { id: 'details', label: 'product.tabDetails' },
    { id: 'reviews', label: 'product.tabReviews' },
    { id: 'shipping', label: 'product.tabShipping' },
  ];

  return (
    <>
      <Navbar variant="client" showCategories={false} />

      <main className="page-body no-cats">
        <div className="container">
          {status === 'error' && (
            <div className="state-block">
              <span className="state-icon state-icon-error"><RotateCw size={28} strokeWidth={1.7} /></span>
              <p className="state-title">{t('product.notFound')}</p>
              <p className="state-text">{t('product.notFoundText')}</p>
              <div className="state-actions">
                <Link className="btn btn-primary" to={ROUTES.catalogue}>{t('common.seeCatalogue')}</Link>
                <button type="button" className="btn btn-outline" onClick={() => setReloadKey(k => k + 1)}>
                  {t('common.retry')}
                </button>
              </div>
            </div>
          )}

          {status === 'loading' && (
            <div className="pdp-grid">
              <div className="skeleton pdp-main-img" />
              <div className="sk-line-stack">
                <div className="skeleton sk-title sk-w-80" />
                <div className="skeleton sk-text sk-w-60" />
                <div className="skeleton sk-title sk-w-40" />
                <div className="skeleton sk-row" />
              </div>
            </div>
          )}

          {status === 'ready' && product && (
            <>
              <nav className="breadcrumb pdp-crumb" aria-label="Fil d'Ariane">
                <Link to={ROUTES.home} className="breadcrumb-link">{t('bottom.home')}</Link>
                <span className="breadcrumb-sep"><ChevronRight size={13} strokeWidth={2} /></span>
                <Link to={ROUTES.catalogue} className="breadcrumb-link">{t('nav.catalogue')}</Link>
                <span className="breadcrumb-sep"><ChevronRight size={13} strokeWidth={2} /></span>
                <span className="breadcrumb-current">{product.name}</span>
              </nav>

              <div className="pdp-grid">
                <div className="pdp-gallery">
                  <div className="pdp-main-img">
                    {shots[shot]
                      ? <img src={shots[shot]} alt={product.name} />
                      : <span className="product-media-empty" />}
                    {discount > 0 && <span className="badge badge-sale pdp-badge">-{discount}%</span>}
                  </div>
                  <div className="pdp-thumbs">
                    {shots.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`pdp-thumb${i === shot ? ' is-active' : ''}`}
                        onClick={() => setShot(i)}
                        aria-label={`${t('product.view')} ${i + 1}`}
                        aria-pressed={i === shot}
                      >
                        <img src={src} alt="" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pdp-buy">
                  {product.sellerName && (
                    <p className="buy-seller">{product.sellerName}</p>
                  )}
                  <h1 className="pdp-title">{product.name}</h1>

                  <p className="pdp-lede">{product.description}</p>

                  <div className="pdp-meta">
                    <span className="pdp-sold">{t('product.sold', { n: product.sold })}</span>
                    <span className="pdp-dot" aria-hidden="true">·</span>
                    <span className="pdp-rating">
                      <Star size={14} strokeWidth={2} fill="currentColor" />
                      {product.rating}
                    </span>
                    <button type="button" className="pdp-reviews-link" onClick={() => setTab('reviews')}>
                      {t('product.reviewCount', { n: product.reviewCount })}
                    </button>
                  </div>

                  <div className="pdp-price-row">
                    <span className="pdp-price">{formatXAF(product.price)}</span>
                    {discount > 0 && product.oldPrice && (
                      <span className="price-old pdp-price-old">{formatXAF(product.oldPrice)}</span>
                    )}
                  </div>

                  {product.colors.length > 0 && (
                    <div className="pdp-option">
                      <p className="pdp-option-label">
                        {t('shop.color')}<span className="pdp-option-value">{selectedColor?.name ?? '—'}</span>
                      </p>
                      <div className="swatch-row">
                        {product.colors.map(cid => {
                          const option = COLOR_OPTIONS.find(c => c.id === cid);
                          if (!option) return null;
                          return (
                            <button
                              key={cid}
                              type="button"
                              className="swatch swatch-lg"
                              style={{ background: option.hex }}
                              aria-pressed={color === cid}
                              aria-label={option.name}
                              title={option.name}
                              onClick={() => setColor(cid)}
                            >
                              {color === cid && <Check size={15} strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {product.sizes.length > 0 && (
                    <div className="pdp-option">
                      <p className="pdp-option-label">
                        {t('product.size')}<span className="pdp-option-value">{size || t('product.pickOne')}</span>
                      </p>
                      <div className="size-grid">
                        {product.sizes.map(option => (
                          <button
                            key={option}
                            type="button"
                            className="size-btn"
                            aria-pressed={size === option}
                            onClick={() => setSize(option)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pdp-actions">
                    <button type="button" className="btn btn-primary btn-lg btn-block" onClick={handleAdd}>
                      <Plus size={17} strokeWidth={2.2} />
                      {t('shop.addToCart')}
                    </button>
                    <Link to={ROUTES.cart} className="btn btn-outline btn-lg btn-block" onClick={handleAdd}>
                      {t('product.buyNow')}
                    </Link>
                  </div>

                  <div className="pdp-mini-actions">
                    <button type="button" className="pdp-mini">
                      <MessageSquare size={15} strokeWidth={1.9} />{t('product.chat')}
                    </button>
                    <button type="button" className="pdp-mini">
                      <Heart size={15} strokeWidth={1.9} />{t('product.wishlist')}
                    </button>
                    <button type="button" className="pdp-mini">
                      <Share2 size={15} strokeWidth={1.9} />{t('product.share')}
                    </button>
                  </div>

                  <p className="eco-note">
                    <Truck size={16} strokeWidth={1.8} />
                    {t('product.deliveryNote')}
                  </p>
                </div>
              </div>

              <section className="pdp-tabs-section">
                <div className="tabs" role="tablist">
                  {TABS.map(entry => (
                    <button
                      key={entry.id}
                      type="button"
                      role="tab"
                      className="tab"
                      aria-selected={tab === entry.id}
                      onClick={() => setTab(entry.id)}
                    >
                      {t(entry.label)}
                    </button>
                  ))}
                </div>

                {tab === 'details' && (
                  <div className="pdp-panel">
                    <p className="prose">{product.description}</p>
                    <div className="spec-list pdp-specs">
                      <span className="spec-row">
                        <span className="spec-key">{t('product.condition')}</span>
                        <span className="spec-val">{conditionLabel}</span>
                      </span>
                      <span className="spec-row">
                        <span className="spec-key">{t('product.seller')}</span>
                        <span className="spec-val">{product.sellerName ?? '—'}</span>
                      </span>
                      <span className="spec-row">
                        <span className="spec-key">{t('product.size')}</span>
                        <span className="spec-val">{product.sizes.join(' · ') || '—'}</span>
                      </span>
                      <span className="spec-row">
                        <span className="spec-key">{t('product.payment')}</span>
                        <span className="spec-val">Orange Money · MTN MoMo · {t('pay.cashDesc')}</span>
                      </span>
                    </div>
                  </div>
                )}

                {tab === 'reviews' && (
                  <div className="pdp-panel pdp-reviews">
                    <div className="review-list">
                      <p className="pagination-info">
                        {t('product.showingReviews', { n: product.reviews.length, total: product.reviewCount })}
                      </p>
                      {product.reviews.map(review => (
                        <article className="review" key={`${review.author}-${review.date}`}>
                          <span className="avatar" aria-hidden="true">
                            {review.author.split(' ').map(w => w[0]).join('')}
                          </span>
                          <div className="review-body">
                            <p className="review-author">{review.author}</p>
                            <span className="stars" aria-label={`${review.rating}/5`}>
                              {[1, 2, 3, 4, 5].map(n => (
                                <Star
                                  key={n}
                                  size={13}
                                  strokeWidth={2}
                                  fill={n <= review.rating ? 'currentColor' : 'none'}
                                />
                              ))}
                            </span>
                            <p className="review-text">{review.text}</p>
                            <span className="review-foot">
                              <ThumbsUp size={13} strokeWidth={1.9} /> {review.helpful}
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>

                    <aside className="rating-card">
                      <span className="stars stars-lg" aria-hidden="true">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} size={20} strokeWidth={2} fill={n <= Math.round(product.rating) ? 'currentColor' : 'none'} />
                        ))}
                      </span>
                      <p className="rating-score">{product.rating}</p>
                      <p className="field-hint">{t('product.reviewCount', { n: product.reviewCount })}</p>

                      <div className="rating-bars">
                        {buckets.map(bucket => (
                          <span className="rating-bar-row" key={bucket.stars}>
                            <span className="rating-bar-star">{bucket.stars}</span>
                            <span className="rating-bar-track">
                              <span
                                className="rating-bar-fill"
                                style={{ width: `${(bucket.count / bucketMax) * 100}%` }}
                              />
                            </span>
                            <span className="rating-bar-count">{bucket.count}</span>
                          </span>
                        ))}
                      </div>
                    </aside>
                  </div>
                )}

                {tab === 'shipping' && (
                  <div className="pdp-panel">
                    <div className="confirm-steps">
                      <span className="confirm-step">
                        <span className="confirm-step-num">1</span>{t('checkout.next1')}
                      </span>
                      <span className="confirm-step">
                        <span className="confirm-step-num">2</span>{t('checkout.next2')}
                      </span>
                      <span className="confirm-step">
                        <span className="confirm-step-num">3</span>{t('checkout.next3')}
                      </span>
                    </div>
                    <p className="prose">{t('product.pinNote')}</p>
                  </div>
                )}
              </section>

              {similar.length > 0 && (
                <section className="section-sm">
                  <div className="section-head">
                    <h2 className="section-title">{t('product.similar')}</h2>
                  </div>
                  <div className="products-grid">
                    {similar.map((item, i) => (
                      <ProductCard key={item.id} product={item} index={i} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {status === 'loading' && (
            <section className="section-sm">
              <div className="products-grid">
                {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
