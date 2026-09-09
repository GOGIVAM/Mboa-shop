import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingBag, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useI18n } from '../i18n';
import { ROUTES } from '../routes';

/**
 * Barre de navigation basse — client uniquement, mobile uniquement
 * (masquée à partir de 768px par main.css).
 */
export default function BottomNav() {
  const { pathname } = useLocation();
  const { count } = useCart();
  const { t } = useI18n();

  const items = [
    { key: 'home', to: ROUTES.home, label: t('bottom.home'), icon: Home, active: pathname === ROUTES.home },
    { key: 'catalogue', to: ROUTES.catalogue, label: t('bottom.catalogue'), icon: LayoutGrid, active: pathname.startsWith(ROUTES.catalogue) || pathname.startsWith('/produit') },
    { key: 'tracking', to: ROUTES.tracking, label: t('bottom.tracking'), icon: MapPin, active: pathname.startsWith(ROUTES.tracking) },
    { key: 'cart', to: ROUTES.cart, label: t('bottom.cart'), icon: ShoppingBag, active: pathname.startsWith(ROUTES.cart), badge: count },
  ];

  return (
    <nav className="bottom-nav" aria-label={t('nav.menu')}>
      {items.map(item => {
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            to={item.to}
            className={`bottom-nav-item${item.active ? ' is-active' : ''}`}
            aria-current={item.active ? 'page' : undefined}
          >
            <span className="bottom-nav-ico">
              <Icon size={21} strokeWidth={1.8} />
              {!!item.badge && item.badge > 0 && <span className="notif-badge">{item.badge}</span>}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
