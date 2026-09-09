import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, ShoppingBag, User, Plus, ArrowLeft, Store, Bike, Shield,
  Search, ChevronDown, HelpCircle, Globe,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useI18n, TKey, Lang } from '../i18n';
import { useScrollLock, useStuck } from '../hooks/useReveal';
import { ROUTES, CATEGORY_SLUGS } from '../routes';
import BottomNav from './BottomNav';
import BrandLogo from './BrandLogo';

export type NavVariant = 'client' | 'seller' | 'courier' | 'admin';

interface NavbarProps {
  variant?: NavVariant;
  onAddProduct?: () => void;
  /** Rangée de catégories sous la barre. Inutile là où des filtres existent déjà. */
  showCategories?: boolean;
}

interface NavItem { to: string; label: TKey; }

const CLIENT_LINKS: NavItem[] = [
  { to: ROUTES.catalogue, label: 'cat.all' },
  { to: ROUTES.category(CATEGORY_SLUGS.friperie), label: 'cat.friperie' },
  { to: ROUTES.category(CATEGORY_SLUGS.pretAPorter), label: 'cat.pret' },
  { to: ROUTES.category(CATEGORY_SLUGS.marques), label: 'cat.marques' },
  { to: ROUTES.category('chaussures'), label: 'cat.shoes' },
  { to: ROUTES.category('accessoires'), label: 'cat.accessories' },
  { to: ROUTES.contact, label: 'nav.contact' },
];

const SELLER_LINKS: NavItem[] = [
  { to: ROUTES.seller, label: 'nav.sellerProducts' },
  { to: `${ROUTES.seller}#commandes`, label: 'nav.sellerOrders' },
  { to: `${ROUTES.seller}#assistant-ia`, label: 'nav.sellerAi' },
];

const VARIANTS: Record<NavVariant, {
  className: string; home: string; suffix: string; scope: TKey; links: NavItem[];
}> = {
  client:  { className: '', home: ROUTES.home, suffix: 'SHOP', scope: 'brand.tagline', links: CLIENT_LINKS },
  seller:  { className: 'navbar-seller', home: ROUTES.seller, suffix: 'VENDEUR', scope: 'nav.sellerScope', links: SELLER_LINKS },
  courier: { className: 'navbar-courier', home: ROUTES.courier, suffix: 'LIVREUR', scope: 'nav.courierScope', links: [] },
  admin:   { className: 'navbar-admin', home: ROUTES.admin, suffix: 'ADMIN', scope: 'nav.adminScope', links: [] },
};

function LangSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const options: Lang[] = ['fr', 'en'];

  if (compact) {
    return (
      <button
        type="button"
        className="nav-plain-btn"
        onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
        aria-label={t('nav.language')}
      >
        <Globe size={15} strokeWidth={1.9} />
        {lang.toUpperCase()}
        <ChevronDown size={13} strokeWidth={2.2} />
      </button>
    );
  }

  return (
    <div className="lang-switch" role="group" aria-label={t('nav.language')}>
      {options.map(code => (
        <button
          key={code}
          type="button"
          className="lang-opt"
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function Navbar({ variant = 'client', onAddProduct, showCategories = true }: NavbarProps) {
  const { count } = useCart();
  const { isLoggedIn } = useAuth();
  const { t } = useI18n();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const scrolled = useStuck(48);

  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [bumping, setBumping] = useState(false);

  const config = VARIANTS[variant];
  const isClient = variant === 'client';
  const current = `${pathname}${search}`;

  useScrollLock(menuOpen);

  useEffect(() => { setMenuOpen(false); setCatOpen(false); }, [pathname, search]);

  useEffect(() => {
    if (count === 0) return;
    setBumping(true);
    const id = window.setTimeout(() => setBumping(false), 460);
    return () => window.clearTimeout(id);
  }, [count]);

  useEffect(() => {
    if (!menuOpen && !catOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenuOpen(false);
      setCatOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen, catOpen]);

  const isActive = (to: string) => to === current || (to !== ROUTES.home && current.startsWith(to));

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(query.trim() ? `${ROUTES.catalogue}?q=${encodeURIComponent(query.trim())}` : ROUTES.catalogue);
  };

  const cats = showCategories ? config.links : [];

  return (
    <>
      <header
        className={`navbar ${config.className}${scrolled ? ' is-scrolled' : ''}`.trim()}
        role="banner"
      >
        <div className="navbar-main">
          <button
            type="button"
            className="nav-icon-btn nav-burger"
            aria-label={t('nav.menu')}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} strokeWidth={1.8} />
          </button>

          <Link to={config.home} className="nav-brand">
            <BrandLogo scope={config.suffix} onDark={!isClient} />
          </Link>

          {isClient ? (
            <form className="nav-search" onSubmit={submitSearch} role="search">
              <span className="nav-search-scope">
                <button
                  type="button"
                  className="nav-search-scope-btn"
                  onClick={() => setCatOpen(o => !o)}
                  aria-expanded={catOpen}
                >
                  {t('nav.itemsScope')}
                  <ChevronDown size={14} strokeWidth={2.2} />
                </button>
                {catOpen && (
                  <div className="nav-dropdown" role="menu">
                    {CLIENT_LINKS.map(link => (
                      <Link key={link.to} to={link.to} className="nav-dropdown-item" role="menuitem">
                        {t(link.label)}
                      </Link>
                    ))}
                  </div>
                )}
              </span>

              <span className="nav-search-field">
                <span className="nav-search-ico"><Search size={18} strokeWidth={1.9} /></span>
                <input
                  className="nav-search-input"
                  type="search"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={t('nav.searchPlaceholder')}
                  aria-label={t('common.search')}
                />
              </span>
            </form>
          ) : (
            <span className="nav-context">{t(config.scope)}</span>
          )}

          <div className="nav-actions">
            {isClient && (
              <>
                <Link to={ROUTES.login} className="nav-auth desktop-only">
                  {t('nav.signup')} <span className="nav-auth-sep">|</span> {t('nav.login')}
                </Link>
                <Link
                  to={isLoggedIn ? ROUTES.seller : `${ROUTES.login}?next=${ROUTES.seller}`}
                  className="btn btn-primary btn-sm nav-cta"
                >
                  {t('nav.sellCta')}
                </Link>
                <Link to={ROUTES.tracking} className="nav-icon-btn desktop-only" aria-label={t('nav.suivi')}>
                  <HelpCircle size={20} strokeWidth={1.8} />
                </Link>
                <LangSwitch compact />
                <Link to={ROUTES.login} className="nav-icon-btn mobile-only" aria-label={t('nav.signup')}>
                  <User size={20} strokeWidth={1.8} />
                </Link>
                <Link to={ROUTES.cart} className="nav-icon-btn" aria-label={t('nav.cart')}>
                  <span className="notif-anchor">
                    <ShoppingBag size={20} strokeWidth={1.8} />
                    {count > 0 && (
                      <span className={`notif-badge${bumping ? ' is-bumping' : ''}`}>{count}</span>
                    )}
                  </span>
                </Link>
              </>
            )}

            {!isClient && (
              <>
                <LangSwitch />
                {variant === 'seller' && onAddProduct && (
                  <button type="button" className="btn btn-primary btn-sm nav-cta" onClick={onAddProduct}>
                    <Plus size={16} strokeWidth={2.2} />
                    {t('nav.publish')}
                  </button>
                )}
                <Link to={ROUTES.home} className="btn btn-outline-inv btn-sm nav-cta">
                  <ArrowLeft size={16} strokeWidth={2} />
                  {t('nav.backToShop')}
                </Link>
              </>
            )}
          </div>
        </div>

        {cats.length > 0 && (
          <nav className="nav-cats" aria-label={t(config.scope)}>
            <div className="nav-cats-inner">
              {cats.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-cat${isActive(link.to) ? ' is-active' : ''}`}
                >
                  {t(link.label)}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>

      <div
        className={`nav-scrim${menuOpen ? ' is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`nav-drawer${menuOpen ? ' is-open' : ''}`}
        aria-hidden={!menuOpen}
        aria-label={t('nav.menu')}
      >
        <div className="nav-drawer-head">
          <BrandLogo scope={config.suffix} />
          <button type="button" className="nav-icon-btn" onClick={() => setMenuOpen(false)} aria-label={t('nav.close')}>
            <X size={22} strokeWidth={1.8} />
          </button>
        </div>

        <div className="nav-drawer-body">
          {config.links.length > 0 && (
            <div className="nav-drawer-group">
              <p className="nav-drawer-group-title">{t(isClient ? 'nav.shop' : config.scope)}</p>
              {config.links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-drawer-link${isActive(link.to) ? ' is-active' : ''}`}
                >
                  {t(link.label)}
                </Link>
              ))}
            </div>
          )}

          {isClient && (
            <div className="nav-drawer-group">
              <p className="nav-drawer-group-title">{t('nav.myAccount')}</p>
              <Link to={ROUTES.cart} className="nav-drawer-link">{t('cart.title')}</Link>
              <Link to={ROUTES.tracking} className="nav-drawer-link">{t('nav.suivi')}</Link>
              <Link to={ROUTES.contact} className="nav-drawer-link">{t('nav.contact')}</Link>
              <Link to={ROUTES.login} className="nav-drawer-link">{t('nav.login')}</Link>
              <Link to={ROUTES.signup} className="nav-drawer-link">{t('nav.signup')}</Link>
            </div>
          )}

          <div className="nav-drawer-group">
            <p className="nav-drawer-group-title">{t('nav.pro')}</p>
            <Link to={ROUTES.seller} className="nav-drawer-link">
              <Store size={18} strokeWidth={1.8} />{t('footer.seller')}
            </Link>
            <Link to={ROUTES.courier} className="nav-drawer-link">
              <Bike size={18} strokeWidth={1.8} />{t('footer.courier')}
            </Link>
            <Link to={ROUTES.admin} className="nav-drawer-link">
              <Shield size={18} strokeWidth={1.8} />{t('footer.admin')}
            </Link>
          </div>
        </div>

        <div className="nav-drawer-foot">
          <LangSwitch />
          {isClient ? (
            <Link
              to={isLoggedIn ? ROUTES.seller : `${ROUTES.login}?next=${ROUTES.seller}`}
              className="btn btn-primary btn-block"
            >
              {t('nav.sellCta')}
            </Link>
          ) : (
            <Link to={ROUTES.home} className="btn btn-outline btn-block">
              <ArrowLeft size={16} strokeWidth={2} />{t('nav.backToShop')}
            </Link>
          )}
        </div>
      </aside>

      {isClient && <BottomNav />}
    </>
  );
}
