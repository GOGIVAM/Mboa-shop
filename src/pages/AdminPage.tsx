import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, ShoppingBag, Store, Bike, ChevronLeft, ChevronRight, Check, Ban } from 'lucide-react';
import Navbar from '../components/Navbar';
import { ProductVM } from '../components/ProductCard';
import { formatXAF } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useI18n, TKey } from '../i18n';
import { useReveal } from '../hooks/useReveal';
import { listProducts } from '../services/catalogue';
import { listOrders, listSellers } from '../services/operations';
import { DemoOrder, DemoSeller, DemoMission, MISSIONS } from '../data/orders';

type Tab = 'products' | 'orders' | 'sellers' | 'deliveries';

const PER_PAGE = 5;

export default function AdminPage() {
  const { t } = useI18n();
  const toast = useToast();

  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts] = useState<ProductVM[]>([]);
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [sellers, setSellers] = useState<DemoSeller[]>([]);
  const [deliveries, setDeliveries] = useState<DemoMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('all');

  useReveal([tab, loading]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      listProducts({ page: 1, limit: 20, sort: 'newest' }, controller.signal),
      listOrders(controller.signal),
      listSellers(controller.signal),
    ])
      .then(([p, o, s]) => {
        setProducts(p.items);
        setOrders(o);
        setSellers(s);
        setDeliveries(MISSIONS);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => { setPage(1); setFilter('all'); }, [tab]);

  const kpis = useMemo(() => {
    const gmv = orders.reduce((sum, o) => sum + o.total, 0);
    return [
      { icon: TrendingUp, label: 'admin.kpiGmv' as const, value: new Intl.NumberFormat('fr-FR').format(gmv) },
      { icon: ShoppingBag, label: 'admin.kpiOrders' as const, value: String(orders.length) },
      { icon: Store, label: 'admin.kpiSellers' as const, value: String(sellers.filter(s => s.status === 'active').length) },
      { icon: Bike, label: 'admin.kpiCouriers' as const, value: String(new Set(deliveries.map(d => d.id)).size) },
    ];
  }, [orders, sellers, deliveries]);

  const TABS: { id: Tab; label: TKey }[] = [
    { id: 'products', label: 'admin.tabProducts' },
    { id: 'orders', label: 'admin.tabOrders' },
    { id: 'sellers', label: 'admin.tabSellers' },
    { id: 'deliveries', label: 'admin.tabDeliveries' },
  ];

  /** Lignes du tableau courant, après filtre. */
  const rows: unknown[] = useMemo(() => {
    if (tab === 'products') return products;
    if (tab === 'orders') return filter === 'all' ? orders : orders.filter(o => o.status === filter);
    if (tab === 'sellers') return filter === 'all' ? sellers : sellers.filter(s => s.status === filter);
    return filter === 'all' ? deliveries : deliveries.filter(d => d.status === filter);
  }, [tab, filter, products, orders, sellers, deliveries]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const slice = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const FILTERS: Record<Tab, { id: string; label: TKey }[]> = {
    products: [],
    orders: [
      { id: 'all', label: 'cat.all' },
      { id: 'pending', label: 'status.pending' },
      { id: 'preparing', label: 'status.preparing' },
      { id: 'in_transit', label: 'status.in_transit' },
      { id: 'delivered', label: 'status.delivered' },
    ],
    sellers: [
      { id: 'all', label: 'cat.all' },
      { id: 'active', label: 'admin.statusActive' },
      { id: 'pending', label: 'status.pending' },
      { id: 'cancelled', label: 'admin.statusSuspended' },
    ],
    deliveries: [
      { id: 'all', label: 'cat.all' },
      { id: 'pending', label: 'status.pending' },
      { id: 'accepted', label: 'status.accepted' },
      { id: 'picked_up', label: 'status.picked_up' },
      { id: 'delivered', label: 'status.delivered' },
    ],
  };

  const act = (label: string) => toast.show(label, 'info');

  return (
    <>
      <Navbar variant="admin" />

      <main className="page-body no-bottomnav">
        <section className="dash-hero">
          <div className="container">
            <div className="dash-hero-inner">
              <div>
                <h1 className="dash-title">{t('admin.title')}</h1>
                <p className="dash-sub">{t('admin.sub')}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="container dash-body">
          <div className="kpi-grid">
            {kpis.map((kpi, i) => {
              const Icon = kpi.icon;
              return (
                <div className="kpi-card" key={kpi.label} data-reveal style={{ ['--i' as string]: i }}>
                  <span className="kpi-ico"><Icon size={17} strokeWidth={1.9} /></span>
                  <p className="kpi-val">{kpi.value}</p>
                  <p className="kpi-label">{t(kpi.label)}</p>
                </div>
              );
            })}
          </div>

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

          {FILTERS[tab].length > 0 && (
            <div className="scroll-x filter-row">
              {FILTERS[tab].map(entry => (
                <button
                  key={entry.id}
                  type="button"
                  className="chip"
                  aria-pressed={filter === entry.id}
                  onClick={() => { setFilter(entry.id); setPage(1); }}
                >
                  {t(entry.label)}
                </button>
              ))}
            </div>
          )}

          <div className="panel">
            <div className="table-scroll">
              {loading ? (
                <div className="panel-body sk-line-stack">
                  {Array.from({ length: 5 }).map((_, i) => <span className="skeleton sk-row" key={i} />)}
                </div>
              ) : (
                <table className="table">
                  {tab === 'products' && (
                    <>
                      <thead>
                        <tr>
                          <th>{t('seller.colItem')}</th>
                          <th>{t('product.seller')}</th>
                          <th>{t('seller.colPrice')}</th>
                          <th className="table-num">{t('seller.colActions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(slice as ProductVM[]).map(item => (
                          <tr key={item.id}>
                            <td>
                              <span className="table-cell-item">
                                {item.imageUrl
                                  ? <img className="table-img" src={item.imageUrl} alt="" loading="lazy" />
                                  : <span className="table-img" />}
                                <span className="table-cell-name">{item.name}</span>
                              </span>
                            </td>
                            <td>{item.sellerName ?? '—'}</td>
                            <td className="price">{formatXAF(item.price)}</td>
                            <td>
                              <span className="table-actions">
                                <button type="button" className="btn btn-icon-sm btn-outline" onClick={() => act(t('admin.approved'))} aria-label={t('admin.approve')}>
                                  <Check size={14} strokeWidth={2.2} />
                                </button>
                                <button type="button" className="btn btn-icon-sm btn-outline" onClick={() => act(t('admin.rejected'))} aria-label={t('admin.reject')}>
                                  <Ban size={14} strokeWidth={2} />
                                </button>
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}

                  {tab === 'orders' && (
                    <>
                      <thead>
                        <tr>
                          <th>{t('checkout.orderRef')}</th>
                          <th>{t('admin.colCustomer')}</th>
                          <th>{t('checkout.city')}</th>
                          <th>{t('seller.colStatus')}</th>
                          <th className="table-num">{t('cart.total')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(slice as DemoOrder[]).map(order => (
                          <tr key={order.ref}>
                            <td className="record-id">{order.ref}</td>
                            <td>{order.customer}</td>
                            <td>{order.city}</td>
                            <td><span className={`pill pill-${order.status}`}>{t(`status.${order.status}` as TKey)}</span></td>
                            <td className="table-num price">{formatXAF(order.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}

                  {tab === 'sellers' && (
                    <>
                      <thead>
                        <tr>
                          <th>{t('signup.shopName')}</th>
                          <th>{t('signup.owner')}</th>
                          <th>{t('checkout.city')}</th>
                          <th>{t('seller.colStatus')}</th>
                          <th className="table-num">{t('admin.colSales')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(slice as DemoSeller[]).map(seller => (
                          <tr key={seller.id}>
                            <td className="table-cell-name">{seller.shopName}</td>
                            <td>{seller.owner}</td>
                            <td>{seller.city}</td>
                            <td>
                              <span className={`pill pill-${seller.status === 'active' ? 'active' : seller.status}`}>
                                {t(seller.status === 'active' ? 'admin.statusActive' : seller.status === 'pending' ? 'status.pending' : 'admin.statusSuspended')}
                              </span>
                            </td>
                            <td className="table-num price">{formatXAF(seller.sales)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}

                  {tab === 'deliveries' && (
                    <>
                      <thead>
                        <tr>
                          <th>{t('admin.colMission')}</th>
                          <th>{t('checkout.orderRef')}</th>
                          <th>{t('admin.colRoute')}</th>
                          <th>{t('seller.colStatus')}</th>
                          <th className="table-num">{t('courier.earning')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(slice as DemoMission[]).map(mission => (
                          <tr key={mission.id}>
                            <td className="record-id">{mission.id}</td>
                            <td>{mission.orderRef}</td>
                            <td className="table-cell-name">{mission.city} · {mission.distanceKm} km</td>
                            <td><span className={`pill pill-${mission.status}`}>{t(`status.${mission.status}` as TKey)}</span></td>
                            <td className="table-num price">{formatXAF(mission.earnings)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}
                </table>
              )}
            </div>

            {!loading && pageCount > 1 && (
              <div className="pagination">
                <p className="pagination-info">
                  {t('shop.showing', {
                    first: (page - 1) * PER_PAGE + 1,
                    last: Math.min(page * PER_PAGE, rows.length),
                    total: rows.length,
                  })}
                </p>
                <span className="pagination-ctrl">
                  <button
                    type="button" className="page-btn"
                    onClick={() => setPage(p => p - 1)} disabled={page === 1}
                    aria-label={t('shop.prevPage')}
                  >
                    <ChevronLeft size={16} strokeWidth={2} />
                  </button>
                  <button
                    type="button" className="page-btn"
                    onClick={() => setPage(p => p + 1)} disabled={page === pageCount}
                    aria-label={t('shop.nextPage')}
                  >
                    <ChevronRight size={16} strokeWidth={2} />
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
