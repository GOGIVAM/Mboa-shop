import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Store } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroImage from '../components/HeroImage';
import SplitText from '../components/SplitText';
import ProductCard, { ProductCardSkeleton, ProductVM } from '../components/ProductCard';
import CountUp from '../components/CountUp';
import { OrangeMoneyMark, MtnMomoMark } from '../components/PaymentLogos';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n';
import { useReveal, useParallax } from '../hooks/useReveal';
import { ROUTES, CATEGORY_SLUGS } from '../routes';
import { listProducts } from '../services/catalogue';
import { HERO, TILE } from '../data/images';

const TILES = [
  { slug: CATEGORY_SLUGS.friperie, label: 'cat.friperie' as const, sub: 'home.tileSub1' as const, image: TILE.friperie },
  { slug: CATEGORY_SLUGS.pretAPorter, label: 'cat.pret' as const, sub: 'home.tileSub2' as const, image: TILE.pretAPorter },
  { slug: CATEGORY_SLUGS.marques, label: 'cat.marques' as const, sub: 'home.tileSub3' as const, image: TILE.marques },
];

/** Bandeau de confiance : deux opérateurs mobile money, puis deux garanties. */
const TRUST = [
  { key: 'om', mark: OrangeMoneyMark, title: 'home.trustOm' as const, text: 'home.trustOmText' as const },
  { key: 'mtn', mark: MtnMomoMark, title: 'home.trustMtn' as const, text: 'home.trustMtnText' as const },
  { key: 'ship', png: '/assets/livraison-de-colis.png', title: 'home.trust2Title' as const, text: 'home.trust2Text' as const },
  { key: 'swap', png: '/assets/echange.png', title: 'home.trust4Title' as const, text: 'home.trust4Text' as const },
];

export default function HomePage() {
  const { t } = useI18n();
  const { addToCart } = useCart();
  const toast = useToast();

  const [fresh, setFresh] = useState<ProductVM[]>([]);
  const [deals, setDeals] = useState<ProductVM[]>([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useParallax<HTMLDivElement>(0.22);
  useReveal([fresh, deals, loading]);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      listProducts({ page: 1, limit: 8, sort: 'newest' }, controller.signal),
      listProducts({ page: 1, limit: 4, sort: 'price_asc' }, controller.signal),
    ])
      .then(([newest, cheap]) => {
        setFresh(newest.items);
        setDeals(cheap.items);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

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

  return (
    <>
      <Navbar variant="client" />

      <main className="page-body">
        <section className="home-hero">
          <div className="home-hero-media parallax" ref={heroRef}>
            <HeroImage src={HERO.home} />
          </div>
          <div className="container">
            <div className="home-hero-card">
              <SplitText as="h1" text={t('home.heroTitle')} className="home-hero-title" />
              <p className="home-hero-desc">{t('home.heroSub')}</p>
              <div className="home-hero-actions">
                <Link to={ROUTES.catalogue} className="btn btn-primary btn-lg">
                  {t('home.ctaShop')}
                </Link>
                <Link to={ROUTES.sellerSignup} className="btn btn-outline btn-lg">
                  {t('home.ctaSell')}
                </Link>
              </div>
              <p className="home-hero-note">{t('home.heroNote')}</p>
            </div>
          </div>
        </section>

        <section className="trust-strip">
          <div className="container">
            <div className="trust-grid">
              {TRUST.map((entry, i) => {
                const Mark = entry.mark;
                return (
                  <div className="trust-item" key={entry.key} data-reveal style={{ ['--i' as string]: i }}>
                    {Mark && <span className="trust-mark"><Mark size={56} /></span>}
                    {entry.png && (
                      <img className="trust-png" src={entry.png} alt="" aria-hidden="true" loading="lazy" />
                    )}
                    <span className="trust-text">
                      <span className="trust-title">{t(entry.title)}</span>
                      <span className="trust-sub">{t(entry.text)}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section container">
          

          <div className="tile-grid">
            {TILES.map(tile => (
              <Link key={tile.slug} to={ROUTES.category(tile.slug)} className="tile">
                <span className="tile-media">
                  <HeroImage src={tile.image} className="tile-img" />
                </span>
                <span className="tile-text">
                  <span className="tile-name">{t(tile.label)}</span>
                  <span className="tile-sub">{t(tile.sub)}</span>
                  <span className="tile-link">
                    {t('home.tileShop')}
                    <ArrowRight size={14} strokeWidth={2.2} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="section-sm container">
          <div className="section-head">
            <div>
              <h2 className="section-title">{t('home.newInTitle')}</h2>
            </div>
            <div className="section-head-actions">
              <Link to={ROUTES.catalogue} className="btn btn-outline btn-sm">
                {t('home.seeAll')}
              </Link>
            </div>
          </div>

          <div className="products-grid">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : fresh.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} onAdd={handleAdd} />
                ))}
          </div>
        </section>

        <section className="promo-band">
          <div className="promo-band-media">
            <HeroImage src={HERO.friperie} />
          </div>
          <div className="container">
            <div className="promo-band-inner" data-reveal>
              <p className="eyebrow promo-band-eyebrow">{t('home.promoEyebrow')}</p>
              <h2 className="promo-band-title">{t('home.promoTitle')}</h2>
              <p className="promo-band-desc">{t('home.promoDesc')}</p>
              <Link to={ROUTES.category(CATEGORY_SLUGS.friperie)} className="btn btn-gold btn-lg">
                {t('home.promoCta')}
              </Link>
            </div>
          </div>
        </section>

        <section className="section-sm container">
          <div className="section-head">
            <div>
              <p className="eyebrow">{t('home.deals')}</p>
              <h2 className="section-title">{t('home.dealsTitle')}</h2>
            </div>
          </div>

          <div className="products-grid">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : deals.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} onAdd={handleAdd} />
                ))}
          </div>
        </section>

        <section className="seller-band container">
          <div className="seller-band-inner" data-reveal>
            <div className="seller-band-text">
              <span className="seller-band-ico"><Store size={22} strokeWidth={1.7} /></span>
              <h2 className="seller-band-title">{t('home.sellerTitle')}</h2>
              <p className="seller-band-desc">{t('home.sellerDesc')}</p>
            </div>

            <div className="seller-band-figures">
              <div className="seller-figure">
                <p className="seller-figure-val"><CountUp to={0} suffix=" %" /></p>
                <p className="seller-figure-label">{t('home.sellerFee')}</p>
              </div>
              <div className="seller-figure">
                <p className="seller-figure-val"><CountUp to={48} suffix=" h" /></p>
                <p className="seller-figure-label">{t('home.sellerPayout')}</p>
              </div>
              <div className="seller-figure">
                <p className="seller-figure-val"><CountUp to={86} /></p>
                <p className="seller-figure-label">{t('home.sellerCount')}</p>
              </div>
            </div>

            <Link to={ROUTES.sellerSignup} className="btn btn-on-black btn-lg seller-band-cta">
              {t('nav.becomeSeller')}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
