import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, ChevronRight, X, RotateCw, PackageSearch } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import HeroImage from '../components/HeroImage';
import SplitText from '../components/SplitText';import Pagination from '../components/Pagination';
import ProductCard, { ProductCardSkeleton, ProductVM } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n';
import { useReveal, useParallax, useStuck, useScrollLock } from '../hooks/useReveal';
import { CATEGORY_SLUGS, ROUTES } from '../routes';
import { listProducts } from '../services/catalogue';
import { COLOR_OPTIONS, SIZE_OPTIONS } from '../data/products';
import { HERO } from '../data/images';

const PER_PAGE = 12;

const SORTS = ['sort.newest', 'sort.priceAsc', 'sort.priceDesc', 'sort.nameAsc'] as const;
const SORT_VALUES: Record<string, string> = {
  'sort.newest': 'newest',
  'sort.priceAsc': 'price_asc',
  'sort.priceDesc': 'price_desc',
  'sort.nameAsc': 'name_asc',
};

const CATEGORIES = [
  { slug: '', label: 'cat.all' as const, hero: HERO.catalogue },
  { slug: CATEGORY_SLUGS.friperie, label: 'cat.friperie' as const, hero: HERO.friperie },
  { slug: CATEGORY_SLUGS.pretAPorter, label: 'cat.pret' as const, hero: HERO.pretAPorter },
  { slug: CATEGORY_SLUGS.marques, label: 'cat.marques' as const, hero: HERO.marques },
  { slug: 'enfants', label: 'cat.kids' as const, hero: HERO.enfants },
  { slug: 'chaussures', label: 'cat.shoes' as const, hero: HERO.chaussures },
  { slug: 'accessoires', label: 'cat.accessories' as const, hero: HERO.accessoires },
];

export default function CataloguePage() {
  const { t } = useI18n();
  const { addToCart } = useCart();
  const toast = useToast();

  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page') ?? 1));
  const category = params.get('cat') ?? '';
  const search = params.get('q') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const minPrice = params.get('min') ?? '';
  const maxPrice = params.get('max') ?? '';
  const size = params.get('size') ?? '';
  const color = params.get('color') ?? '';

  const [items, setItems] = useState<ProductVM[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [favs, setFavs] = useState<Record<string, true>>({});

  const heroRef = useParallax<HTMLDivElement>(0.3);
  const stuck = useStuck(24);
  useScrollLock(filtersOpen);
  useReveal([items, status]);

  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const activeCategory = useMemo(
    () => CATEGORIES.find(c => c.slug === category) ?? CATEGORIES[0],
    [category],
  );

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');

    listProducts(
      { page, limit: PER_PAGE, search, category, sort, minPrice, maxPrice, size, color },
      controller.signal,
    )
      .then(result => {
        setItems(result.items);
        setTotal(result.total);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setStatus('error');
      });

    return () => controller.abort();
  }, [page, search, category, sort, minPrice, maxPrice, size, color, reloadKey]);

  const patch = (next: Record<string, string>, resetPage = true) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([key, value]) => {
      if (value) merged.set(key, value);
      else merged.delete(key);
    });
    if (resetPage) merged.delete('page');
    setParams(merged, { replace: true });
  };

  const goToPage = (next: number) => {
    patch({ page: String(next) }, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdd = (product: ProductVM) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      sellerName: product.sellerName,
    });
    toast.show(t('shop.added', { name: product.name }), 'success');
  };

  const toggleFav = (product: ProductVM) => {
    setFavs(prev => {
      const next = { ...prev };
      if (next[product.id]) delete next[product.id];
      else next[product.id] = true;
      return next;
    });
  };

  const hasFilters = !!(category || search || minPrice || maxPrice || size || color);
  const clearAll = () => setParams(new URLSearchParams(), { replace: true });

  const filtersPanel = (
    <>
      <div>
        <p className="aside-title">{t('shop.categories')}</p>
        <div className="cat-list">
          {CATEGORIES.map(entry => (
            <button
              key={entry.slug || 'all'}
              type="button"
              className={`cat-list-item${entry.slug === category ? ' is-active' : ''}`}
              onClick={() => { patch({ cat: entry.slug }); setFiltersOpen(false); }}
            >
              {t(entry.label)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="aside-title">{t('shop.price')}</p>
        <div className="price-inputs">
          <input
            className="input"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder={t('shop.min')}
            defaultValue={minPrice}
            onBlur={e => patch({ min: e.target.value })}
          />
          <span className="price-sep">—</span>
          <input
            className="input"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder={t('shop.max')}
            defaultValue={maxPrice}
            onBlur={e => patch({ max: e.target.value })}
          />
        </div>
        {hasFilters && (
          <button type="button" className="btn btn-ghost btn-sm clear-filters" onClick={clearAll}>
            {t('shop.clearFilters')}
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      <Navbar variant="client" showCategories={false} />

      <main className="page-body no-cats">
        <section className="hero hero-compact">
          <div className="hero-media parallax" ref={heroRef} aria-hidden="true">
            <HeroImage src={activeCategory.hero} />
          </div>
          <div className="hero-center">
            <nav className="hero-crumb" aria-label="Fil d'Ariane">
              <Link to={ROUTES.home}>{t('bottom.home')}</Link>
              <ChevronRight size={12} strokeWidth={2.4} />
              <span>{t(activeCategory.label)}</span>
            </nav>
            <SplitText as="h1" text={t(activeCategory.label).toUpperCase()} className="hero-title" />
          </div>
        </section>

        <div className={`filter-bar${stuck ? ' is-stuck' : ''}`}>
          <div className="container">
            <div className="filter-bar-inner">
              <div className="filter-bar-row">
                <p className="catalog-count">
                  {status === 'ready'
                    ? t('shop.showing', {
                        first: total === 0 ? 0 : (page - 1) * PER_PAGE + 1,
                        last: Math.min(page * PER_PAGE, total),
                        total,
                      })
                    : t('common.loading')}
                </p>

                <div className="catalog-controls">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm filter-toggle"
                    onClick={() => setFiltersOpen(true)}
                  >
                    <SlidersHorizontal size={16} strokeWidth={1.9} />
                    {t('shop.filters')}
                  </button>

                  {/* Taille et couleur sont pilotables directement depuis la barre. */}
                  <span className="select-wrap bar-select">
                    <select
                      className="input"
                      value={size}
                      onChange={e => patch({ size: e.target.value })}
                      aria-label={t('shop.size')}
                    >
                      <option value="">{t('shop.allSizes')}</option>
                      {SIZE_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <span className="input-caret"><ChevronDown size={16} strokeWidth={2} /></span>
                  </span>

                  <span className="select-wrap bar-select">
                    <select
                      className="input"
                      value={color}
                      onChange={e => patch({ color: e.target.value })}
                      aria-label={t('shop.color')}
                    >
                      <option value="">{t('shop.allColors')}</option>
                      {COLOR_OPTIONS.map(option => (
                        <option key={option.id} value={option.id}>{option.name}</option>
                      ))}
                    </select>
                    <span className="input-caret">
                      {color
                        ? <span className="select-dot" style={{ background: COLOR_OPTIONS.find(c => c.id === color)?.hex }} />
                        : <ChevronDown size={16} strokeWidth={2} />}
                    </span>
                  </span>

                  <span className="select-wrap bar-select">
                    <select
                      className="input"
                      value={sort}
                      onChange={e => patch({ sort: e.target.value })}
                      aria-label={t('shop.sortBy')}
                    >
                      {SORTS.map(key => (
                        <option key={key} value={SORT_VALUES[key]}>{t(key)}</option>
                      ))}
                    </select>
                    <span className="input-caret"><ChevronDown size={16} strokeWidth={2} /></span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="shop-layout">
            <aside className="shop-aside">
              <div className="shop-aside-inner">{filtersPanel}</div>
            </aside>

            <div>
              {status === 'error' && (
                <div className="state-block">
                  <span className="state-icon state-icon-error"><RotateCw size={28} strokeWidth={1.7} /></span>
                  <p className="state-title">{t('error.title')}</p>
                  <p className="state-text">{t('error.text')}</p>
                  <div className="state-actions">
                    <button type="button" className="btn btn-primary" onClick={() => setReloadKey(k => k + 1)}>
                      {t('common.retry')}
                    </button>
                  </div>
                </div>
              )}

              {status === 'loading' && (
                <div className="products-grid" aria-busy="true">
                  {Array.from({ length: PER_PAGE }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
              )}

              {status === 'ready' && items.length === 0 && (
                <div className="state-block">
                  <span className="state-icon"><PackageSearch size={28} strokeWidth={1.7} /></span>
                  <p className="state-title">
                    {search
                      ? t('shop.emptySearchTitle', { q: search })
                      : t('shop.emptyCatTitle', { cat: t(activeCategory.label) })}
                  </p>
                  <p className="state-text">{t('shop.emptyText')}</p>
                  <div className="state-actions">
                    <button type="button" className="btn btn-primary" onClick={clearAll}>
                      {t('shop.clearFilters')}
                    </button>
                  </div>
                </div>
              )}

              {status === 'ready' && items.length > 0 && (
                <>
                  <div className="products-grid">
                    {items.map((product, i) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={i}
                        onAdd={handleAdd}
                        onToggleFav={toggleFav}
                        isFav={!!favs[product.id]}
                      />
                    ))}
                  </div>
                  <Pagination
                    page={page}
                    pageCount={pageCount}
                    total={total}
                    perPage={PER_PAGE}
                    onChange={goToPage}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <div
        className={`nav-scrim${filtersOpen ? ' is-open' : ''}`}
        onClick={() => setFiltersOpen(false)}
        aria-hidden="true"
      />
      <aside className={`filter-sheet${filtersOpen ? ' is-open' : ''}`} aria-hidden={!filtersOpen}>
        <div className="filter-sheet-head">
          <p className="cart-title">{t('shop.filters')}</p>
          <button type="button" className="btn btn-icon" onClick={() => setFiltersOpen(false)} aria-label={t('common.close')}>
            <X size={22} strokeWidth={1.8} />
          </button>
        </div>
        <div className="filter-sheet-body">{filtersPanel}</div>
        <div className="filter-sheet-foot">
          <button type="button" className="btn btn-primary btn-block" onClick={() => setFiltersOpen(false)}>
            {t('shop.showResults', { total })}
          </button>
        </div>
      </aside>

      <CartDrawer />
      <Footer />
    </>
  );
}
