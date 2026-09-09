import { useEffect, useMemo, useState } from 'react';
import {
  LayoutGrid, Package, ShoppingBag, Sparkles, Wallet, Download,
  Plus, Pencil, EyeOff, Send, CreditCard, Activity,
} from 'lucide-react';
import DashboardShell, { DashGroup } from '../components/DashboardShell';
import { formatXAF } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useI18n, TKey } from '../i18n';
import { listProducts } from '../services/catalogue';
import { listOrders } from '../services/operations';
import { ProductVM } from '../components/ProductCard';
import { DemoOrder, OrderStatus } from '../data/orders';

type Section = 'overview' | 'items' | 'orders' | 'ai';
type Range = 'overview' | 'analytics' | 'reports';

const GROUPS: DashGroup[] = [
  {
    title: 'dash.general',
    items: [
      { id: 'overview', label: 'dash.overview', icon: LayoutGrid },
      { id: 'items', label: 'seller.tabItems', icon: Package },
      { id: 'orders', label: 'seller.tabOrders', icon: ShoppingBag, badge: 4 },
      { id: 'ai', label: 'seller.tabAi', icon: Sparkles },
    ],
  },
];

/** Revenus mensuels de démonstration, en milliers de XAF. */
const MONTHS = [
  { label: 'Jan', value: 620 }, { label: 'Fév', value: 810 }, { label: 'Mar', value: 540 },
  { label: 'Avr', value: 980 }, { label: 'Mai', value: 720 }, { label: 'Jun', value: 1140 },
  { label: 'Jul', value: 890 }, { label: 'Aoû', value: 1320 }, { label: 'Sep', value: 1204 },
];

const RECENT = [
  { name: 'Awa Mbarga', email: 'awa.mbarga@email.cm', amount: 31900 },
  { name: 'Jean-Paul Nkoulou', email: 'jp.nkoulou@email.cm', amount: 45000 },
  { name: 'Chantal Fotso', email: 'c.fotso@email.cm', amount: 12500 },
  { name: 'Félix Owona', email: 'f.owona@email.cm', amount: 18400 },
  { name: 'Nadine Bikoï', email: 'n.bikoi@email.cm', amount: 21000 },
];

const STATUS_FILTERS: { id: OrderStatus | 'all'; label: TKey }[] = [
  { id: 'all', label: 'cat.all' },
  { id: 'pending', label: 'status.pending' },
  { id: 'preparing', label: 'status.preparing' },
  { id: 'in_transit', label: 'status.in_transit' },
  { id: 'delivered', label: 'status.delivered' },
];

interface AiMessage { role: 'user' | 'bot'; text: string; }

export default function VendeurPage() {
  const { t } = useI18n();
  const toast = useToast();

  const [section, setSection] = useState<Section>('overview');
  const [range, setRange] = useState<Range>('overview');
  const [items, setItems] = useState<ProductVM[]>([]);
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [thread, setThread] = useState<AiMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      listProducts({ page: 1, limit: 12, sort: 'newest' }, controller.signal),
      listOrders(controller.signal),
    ])
      .then(([products, orderList]) => {
        setItems(products.items);
        setOrders(orderList);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const barMax = useMemo(() => Math.max(...MONTHS.map(m => m.value)), []);
  const visibleOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const askAi = (e: React.FormEvent) => {
    e.preventDefault();
    const question = draft.trim();
    if (!question) return;
    setThread(prev => [...prev, { role: 'user', text: question }]);
    setDraft('');
    setThinking(true);
    // Branchez ici la route /api/ai existante du backend.
    window.setTimeout(() => {
      setThread(prev => [...prev, { role: 'bot', text: t('seller.aiSample') }]);
      setThinking(false);
    }, 1100);
  };

  const STATS = [
    { key: 'revenue', label: 'dash.revenue' as const, value: formatXAF(1_204_000), icon: Wallet, delta: '+8,2 %', dir: 'is-up' as const, note: 'dash.vsLastMonth' as const },
    { key: 'orders', label: 'dash.orders' as const, value: '+38', icon: CreditCard, delta: '+12 %', dir: 'is-up' as const, note: 'dash.vsLastMonth' as const },
    { key: 'items', label: 'dash.items' as const, value: '61', icon: Package, delta: '+4', dir: 'is-up' as const, note: 'dash.vsLastMonth' as const },
    { key: 'visitors', label: 'dash.visitors' as const, value: '+142', icon: Activity, delta: '+19', dir: 'is-up' as const, note: 'dash.sinceLastHour' as const },
  ];

  const sectionTitle = section === 'overview' ? t('dash.overview')
    : section === 'items' ? t('seller.tabItems')
    : section === 'orders' ? t('seller.tabOrders')
    : t('seller.tabAi');

  return (
    <DashboardShell
      workspace="Bantu Denim"
      workspaceSub={t('nav.sellerScope')}
      groups={GROUPS}
      active={section}
      onNavigate={id => setSection(id as Section)}
      user={{ name: 'Sandra Njoya', email: 'sandra@bantudenim.cm' }}
      title={sectionTitle}
      action={
        section === 'overview' ? (
          <button type="button" className="btn btn-dark" onClick={() => toast.show(t('dash.export'), 'info')}>
            <Download size={16} strokeWidth={2} />{t('dash.export')}
          </button>
        ) : (
          <button type="button" className="btn btn-dark" onClick={() => toast.show(t('seller.publishSoon'), 'info')}>
            <Plus size={16} strokeWidth={2.2} />{t('nav.publish')}
          </button>
        )
      }
    >
      {section === 'overview' && (
        <>
          <div className="seg-tabs" role="tablist">
            {(['overview', 'analytics', 'reports'] as Range[]).map(id => (
              <button
                key={id}
                type="button"
                role="tab"
                className="seg-tab"
                aria-selected={range === id}
                onClick={() => setRange(id)}
              >
                {t(`dash.${id}` as TKey)}
              </button>
            ))}
          </div>

          <div className="stat-grid">
            {STATS.map(stat => {
              const Icon = stat.icon;
              return (
                <div className="stat-card" key={stat.key}>
                  <span className="stat-top">
                    <span className="stat-label">{t(stat.label)}</span>
                    <span className="stat-ico"><Icon size={16} strokeWidth={1.9} /></span>
                  </span>
                  <span className="stat-val">{stat.value}</span>
                  <span className={`stat-delta ${stat.dir}`}>{t(stat.note, { delta: stat.delta })}</span>
                </div>
              );
            })}
          </div>

          <div className="chart-grid">
            <section className="chart-card">
              <div>
                <h2 className="chart-title">{t('dash.chartTitle')}</h2>
                <p className="chart-sub">{t('dash.chartSub')}</p>
              </div>
              <div className="bars">
                {MONTHS.map((month, i) => (
                  <span className="bar-col" key={month.label}>
                    <span className="bar-track">
                      <span
                        className="bar"
                        style={{ height: `${(month.value / barMax) * 100}%`, ['--i' as string]: i }}
                        title={`${month.label} · ${month.value} k XAF`}
                      />
                    </span>
                    <span className="bar-label">{month.label}</span>
                  </span>
                ))}
              </div>
            </section>

            <section className="chart-card">
              <div>
                <h2 className="chart-title">{t('dash.recentSales')}</h2>
                <p className="chart-sub">{t('dash.recentSalesSub', { n: 38 })}</p>
              </div>
              <div className="sale-list">
                {RECENT.map(sale => (
                  <div className="sale-row" key={sale.email}>
                    <span className="avatar sale-avatar" aria-hidden="true">
                      {sale.name.split(' ').map(w => w[0]).join('')}
                    </span>
                    <span className="sale-text">
                      <span className="sale-name">{sale.name}</span>
                      <span className="sale-mail">{sale.email}</span>
                    </span>
                    <span className="sale-amount">+{formatXAF(sale.amount)}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}

      {section === 'items' && (
        <div className="panel">
          <div className="panel-head">
            <p className="panel-title">{t('seller.tabItems')}</p>
            <p className="pagination-info">{items.length} {t('seller.itemsCount')}</p>
          </div>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>{t('seller.colItem')}</th>
                  <th>{t('seller.colPrice')}</th>
                  <th>{t('seller.colStock')}</th>
                  <th>{t('seller.colStatus')}</th>
                  <th className="table-num">{t('seller.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={5}><span className="skeleton sk-row" /></td></tr>
                    ))
                  : items.map(item => (
                      <tr key={item.id}>
                        <td>
                          <span className="table-cell-item">
                            {item.imageUrl
                              ? <img className="table-img" src={item.imageUrl} alt="" loading="lazy" />
                              : <span className="table-img" />}
                            <span className="table-cell-name">{item.name}</span>
                          </span>
                        </td>
                        <td className="price">{formatXAF(item.price)}</td>
                        <td>{item.outOfStock ? 0 : 3}</td>
                        <td>
                          <span className={`pill ${item.outOfStock ? 'pill-cancelled' : 'pill-active'}`}>
                            {t(item.outOfStock ? 'shop.outOfStock' : 'seller.online')}
                          </span>
                        </td>
                        <td>
                          <span className="table-actions">
                            <button type="button" className="btn btn-icon-sm btn-outline" aria-label={t('seller.edit')}>
                              <Pencil size={14} strokeWidth={1.9} />
                            </button>
                            <button type="button" className="btn btn-icon-sm btn-outline" aria-label={t('seller.disable')}>
                              <EyeOff size={14} strokeWidth={1.9} />
                            </button>
                          </span>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === 'orders' && (
        <>
          <div className="scroll-x filter-row">
            {STATUS_FILTERS.map(entry => (
              <button
                key={entry.id}
                type="button"
                className="chip"
                aria-pressed={filter === entry.id}
                onClick={() => setFilter(entry.id)}
              >
                {t(entry.label)}
              </button>
            ))}
          </div>

          {visibleOrders.length === 0 ? (
            <div className="state-block">
              <span className="state-icon"><Package size={28} strokeWidth={1.7} /></span>
              <p className="state-title">{t('seller.noOrders')}</p>
              <p className="state-text">{t('seller.noOrdersText')}</p>
            </div>
          ) : (
            <>
              <div className="panel desktop-only">
                <div className="table-scroll">
                  <table className="table">
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
                      {visibleOrders.map(order => (
                        <tr key={order.ref}>
                          <td className="record-id">{order.ref}</td>
                          <td>{order.customer}</td>
                          <td>{order.city}</td>
                          <td><span className={`pill pill-${order.status}`}>{t(`status.${order.status}` as TKey)}</span></td>
                          <td className="table-num price">{formatXAF(order.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="record-list">
                {visibleOrders.map(order => (
                  <div className="record" key={order.ref}>
                    <span className="record-head">
                      <span className="record-id">{order.ref}</span>
                      <span className={`pill pill-${order.status}`}>{t(`status.${order.status}` as TKey)}</span>
                    </span>
                    <span className="record-meta">{order.customer} · {order.city}</span>
                    <span className="record-total">{formatXAF(order.total)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {section === 'ai' && (
        <div className="panel">
          <div className="panel-head">
            <p className="panel-title">{t('seller.tabAi')}</p>
          </div>
          <div className="panel-body">
            {thread.length === 0 && (
              <div className="state-block">
                <span className="state-icon"><Sparkles size={28} strokeWidth={1.7} /></span>
                <p className="state-title">{t('seller.aiTitle')}</p>
                <p className="state-text">{t('seller.aiText')}</p>
                <div className="state-actions">
                  {[t('seller.aiChip1'), t('seller.aiChip2')].map(chip => (
                    <button key={chip} type="button" className="chip" onClick={() => setDraft(chip)}>
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {thread.length > 0 && (
              <div className="ai-thread">
                {thread.map((message, i) => (
                  <p className={`ai-msg ai-msg-${message.role}`} key={i}>{message.text}</p>
                ))}
                {thinking && (
                  <p className="ai-msg ai-msg-bot">
                    <span className="ai-typing"><i /><i /><i /></span>
                  </p>
                )}
              </div>
            )}

            <form className="ai-composer" onSubmit={askAi}>
              <input
                className="input"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder={t('seller.aiPlaceholder')}
                aria-label={t('seller.aiPlaceholder')}
              />
              <button type="submit" className="btn btn-primary" disabled={!draft.trim() || thinking}>
                <Send size={16} strokeWidth={2} />
                <span className="sr-only">{t('seller.aiSend')}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
