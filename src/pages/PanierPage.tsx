import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Minus, Plus, Trash2, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CheckoutModal from '../components/CheckoutModal';
import { useCart, formatXAF, lineKey } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n';
import { ROUTES } from '../routes';
import { COLOR_OPTIONS } from '../data/products';

/** Codes promo de démonstration — remplacez par un appel à votre backend. */
const PROMOS: Record<string, number> = { MBOA10: 0.1, RENTREE20: 0.2 };

export default function PanierPage() {
  const { t } = useI18n();
  const toast = useToast();
  const { items, count, subtotal, shipping, setQuantity, removeItem } = useCart();

  const [promoDraft, setPromoDraft] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const discount = Math.round(subtotal * discountRate);
  const total = subtotal - discount + shipping;

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoDraft.trim().toUpperCase();
    const rate = PROMOS[code];
    if (!rate) { toast.show(t('cart.promoInvalid'), 'error'); return; }
    setDiscountRate(rate);
    toast.show(t('cart.promoApplied', { percent: rate * 100 }), 'success');
  };

  const colorName = (id?: string) =>
    COLOR_OPTIONS.find(c => c.id === id)?.name ?? id;

  return (
    <>
      <Navbar variant="client" showCategories={false} />

      <main className="page-body no-cats">
        <div className="container cart-page">
          <nav className="breadcrumb" aria-label="Fil d'Ariane">
            <Link to={ROUTES.home} className="breadcrumb-link">{t('bottom.home')}</Link>
            <span className="breadcrumb-sep"><ChevronRight size={13} strokeWidth={2} /></span>
            <span className="breadcrumb-current">{t('cart.title')}</span>
          </nav>

          <h1 className="cart-page-title">{t('cart.pageTitle')}</h1>

          {items.length === 0 ? (
            <div className="state-block">
              <span className="state-icon"><ShoppingBag size={28} strokeWidth={1.7} /></span>
              <p className="state-title">{t('cart.emptyTitle')}</p>
              <p className="state-text">{t('cart.emptyText')}</p>
              <div className="state-actions">
                <Link className="btn btn-primary" to={ROUTES.catalogue}>{t('common.seeCatalogue')}</Link>
              </div>
            </div>
          ) : (
            <div className="cart-grid">
              <section className="cart-lines" aria-label={t('track.items')}>
                {items.map(item => {
                  const key = lineKey(item);
                  return (
                    <article className="cart-line" key={key}>
                      <Link to={ROUTES.product(item.id)} className="cart-line-media">
                        {item.imageUrl
                          ? <img src={item.imageUrl} alt="" loading="lazy" />
                          : <span className="product-media-empty" />}
                      </Link>

                      <div className="cart-line-body">
                        <div className="cart-line-top">
                          <Link to={ROUTES.product(item.id)} className="cart-line-name">{item.name}</Link>
                          <button
                            type="button"
                            className="cart-line-remove"
                            onClick={() => removeItem(key)}
                            aria-label={t('cart.remove')}
                          >
                            <Trash2 size={17} strokeWidth={1.9} />
                          </button>
                        </div>

                        <dl className="cart-line-attrs">
                          {item.size && (
                            <>
                              <dt>{t('cart.size')}</dt>
                              <dd>{item.size}</dd>
                            </>
                          )}
                          {item.color && (
                            <>
                              <dt>{t('shop.color')}</dt>
                              <dd>{colorName(item.color)}</dd>
                            </>
                          )}
                          {item.sellerName && (
                            <>
                              <dt>{t('product.seller')}</dt>
                              <dd>{item.sellerName}</dd>
                            </>
                          )}
                        </dl>

                        <div className="cart-line-foot">
                          <span className="cart-line-price">{formatXAF(item.price * item.quantity)}</span>
                          <span className="qty-ctrl">
                            <button
                              type="button" className="qty-btn"
                              onClick={() => setQuantity(key, item.quantity - 1)}
                              aria-label={t('cart.decrease')}
                            >
                              <Minus size={15} strokeWidth={2.2} />
                            </button>
                            <span className="qty-num">{item.quantity}</span>
                            <button
                              type="button" className="qty-btn"
                              onClick={() => setQuantity(key, item.quantity + 1)}
                              aria-label={t('cart.increase')}
                            >
                              <Plus size={15} strokeWidth={2.2} />
                            </button>
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>

              <aside className="cart-summary" aria-label={t('cart.summary')}>
                <h2 className="cart-summary-title">{t('cart.summary')}</h2>

                <dl className="cart-summary-rows">
                  <div className="cart-summary-row">
                    <dt>{t('cart.subtotal')} · {t('cart.itemCount', { n: count })}</dt>
                    <dd>{formatXAF(subtotal)}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="cart-summary-row is-discount">
                      <dt>{t('cart.discount', { percent: discountRate * 100 })}</dt>
                      <dd>−{formatXAF(discount)}</dd>
                    </div>
                  )}
                  <div className="cart-summary-row">
                    <dt>{t('cart.shipping')}</dt>
                    <dd>{shipping === 0 ? t('cart.free') : formatXAF(shipping)}</dd>
                  </div>
                  <div className="cart-summary-row is-total">
                    <dt>{t('cart.total')}</dt>
                    <dd>{formatXAF(total)}</dd>
                  </div>
                </dl>

                <form className="promo-row" onSubmit={applyPromo}>
                  <span className="input-wrap promo-field">
                    <span className="input-icon"><Tag size={16} strokeWidth={1.9} /></span>
                    <input
                      className="input"
                      value={promoDraft}
                      onChange={e => setPromoDraft(e.target.value)}
                      placeholder={t('cart.promoPlaceholder')}
                      aria-label={t('cart.promoPlaceholder')}
                    />
                  </span>
                  <button type="submit" className="btn btn-dark" disabled={!promoDraft.trim()}>
                    {t('cart.promoApply')}
                  </button>
                </form>

                <button
                  type="button"
                  className="btn btn-dark btn-lg btn-block"
                  onClick={() => setCheckoutOpen(true)}
                >
                  {t('cart.checkout')}
                  <ArrowRight size={17} strokeWidth={2.2} />
                </button>

                <Link to={ROUTES.catalogue} className="btn btn-ghost btn-block">
                  {t('cart.keepShopping')}
                </Link>
              </aside>
            </div>
          )}
        </div>
      </main>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <Footer />
    </>
  );
}
