import { X, Minus, Plus, Trash2, ShoppingBag, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, formatXAF, lineKey, FREE_SHIPPING_FROM } from '../context/CartContext';
import { useScrollLock } from '../hooks/useReveal';
import { useI18n } from '../i18n';
import { ROUTES } from '../routes';

export default function CartDrawer() {
  const { items, isOpen, closeCart, setQuantity, removeItem, subtotal, shipping, total } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();
  useScrollLock(isOpen);

  const missing = Math.max(0, FREE_SHIPPING_FROM - subtotal);
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_FROM) * 100));

  return (
    <>
      <div
        className={`drawer-scrim${isOpen ? ' is-open' : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside className={`cart-drawer${isOpen ? ' is-open' : ''}`} aria-hidden={!isOpen} aria-label={t('cart.title')}>
        <div className="cart-head">
          <p className="cart-title">{t('cart.title')}</p>
          <button type="button" className="btn btn-icon" onClick={closeCart} aria-label={t('common.close')}>
            <X size={22} strokeWidth={1.8} />
          </button>
        </div>

        <div className="cart-body">
          {items.length === 0 ? (
            <div className="state-block">
              <span className="state-icon"><ShoppingBag size={28} strokeWidth={1.7} /></span>
              <p className="state-title">{t('cart.emptyTitle')}</p>
              <p className="state-text">{t('cart.emptyText')}</p>
              <div className="state-actions">
                <Link className="btn btn-primary" to={ROUTES.catalogue} onClick={closeCart}>
                  {t('common.seeCatalogue')}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="cart-upsell">
                {missing > 0 ? (
                  <span><Truck size={15} strokeWidth={1.8} /> {t('cart.upsell', { amount: formatXAF(missing) })}</span>
                ) : (
                  <span><Truck size={15} strokeWidth={1.8} /> {t('cart.upsellDone')}</span>
                )}
                <span className="progress">
                  <span className="progress-bar" style={{ width: `${progress}%` }} />
                </span>
              </div>

              <div className="cart-items">
                {items.map(item => {
                  const key = lineKey(item);
                  return (
                    <div className="cart-item" key={key}>
                      {item.imageUrl
                        ? <img className="cart-item-img" src={item.imageUrl} alt="" />
                        : <span className="cart-item-img" aria-hidden="true" />}
                      <div className="cart-item-main">
                        {item.sellerName && <p className="cart-item-seller">{item.sellerName}</p>}
                        <p className="cart-item-name">{item.name}</p>
                        {item.size && <p className="cart-item-meta">{t('cart.size')} {item.size}</p>}
                        <p className="cart-item-meta price">{formatXAF(item.price)}</p>
                        <div className="cart-item-foot">
                          <span className="qty-ctrl">
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => setQuantity(key, item.quantity - 1)}
                              aria-label={t('cart.decrease')}
                            >
                              <Minus size={15} strokeWidth={2.2} />
                            </button>
                            <span className="qty-num">{item.quantity}</span>
                            <button
                              type="button"
                              className="qty-btn"
                              onClick={() => setQuantity(key, item.quantity + 1)}
                              aria-label={t('cart.increase')}
                            >
                              <Plus size={15} strokeWidth={2.2} />
                            </button>
                          </span>
                          <button
                            type="button"
                            className="cart-item-remove"
                            onClick={() => removeItem(key)}
                            aria-label={t('cart.remove')}
                          >
                            <Trash2 size={16} strokeWidth={1.8} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-foot">
            <div className="cart-totals">
              <span className="cart-row">
                <span>{t('cart.subtotal')}</span>
                <span>{formatXAF(subtotal)}</span>
              </span>
              <span className="cart-row">
                <span>{t('cart.shipping')}</span>
                <span>{shipping === 0 ? t('cart.free') : formatXAF(shipping)}</span>
              </span>
              <span className="cart-row cart-row-final">
                <span>{t('cart.total')}</span>
                <span>{formatXAF(total)}</span>
              </span>
            </div>
            <button
              type="button"
              className="btn btn-dark btn-lg btn-block"
              onClick={() => { closeCart(); navigate(ROUTES.cart); }}
            >
              {t('cart.checkout')}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
