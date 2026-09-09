import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PackageSearch, Check, Truck, Store, MapPin, Phone, Star, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TrackingMap from '../components/TrackingMap';
import { formatXAF } from '../context/CartContext';
import { useI18n, TKey } from '../i18n';
import { findOrderByPin } from '../services/operations';
import { DemoOrder, OrderStatus } from '../data/orders';

const TIMELINE: { status: OrderStatus; label: TKey; icon: typeof Check }[] = [
  { status: 'pending', label: 'track.step1', icon: Check },
  { status: 'preparing', label: 'track.step2', icon: Store },
  { status: 'in_transit', label: 'track.step3', icon: Truck },
  { status: 'delivered', label: 'track.step4', icon: MapPin },
];

const ORDER: OrderStatus[] = ['pending', 'preparing', 'in_transit', 'delivered'];

export default function SuiviClientPage() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();

  const [pin, setPin] = useState('');
  const [order, setOrder] = useState<DemoOrder | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [track, setTrack] = useState<{ lat: number; lng: number }[]>([]);

  const lookup = (value: string) => {
    setStatus('loading');
    findOrderByPin(value)
      .then(found => {
        if (!found) { setStatus('error'); setOrder(null); return; }
        setOrder(found);
        setTrack(found.track.slice(0, Math.max(1, found.track.length - 1)));
        setStatus('idle');
        setParams(new URLSearchParams({ pin: value }), { replace: true });
      })
      .catch(() => setStatus('error'));
  };

  // Reprise depuis l'URL : /suivi?pin=4271
  useEffect(() => {
    const fromUrl = params.get('pin');
    if (fromUrl && !order) { setPin(fromUrl); lookup(fromUrl); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Position du livreur en temps réel. Ici le trajet est rejoué point par
   * point ; branchez le socket existant à la place :
   *   socket.on('courier:position', p => setTrack(prev => [...prev, p]))
   */
  useEffect(() => {
    if (!order || order.status !== 'in_transit') return;
    if (track.length >= order.track.length) return;
    const id = window.setTimeout(() => {
      setTrack(order.track.slice(0, track.length + 1));
    }, 3500);
    return () => window.clearTimeout(id);
  }, [order, track]);

  const currentIndex = order ? ORDER.indexOf(order.status) : -1;
  const isLive = order?.status === 'in_transit';

  if (!order) {
    return (
      <>
        <Navbar variant="client" />
        <main className="page-body">
          <div className="container-xs">
            <div className="track-gate">
              <div className="state-block">
                <span className="state-icon"><PackageSearch size={28} strokeWidth={1.7} /></span>
                <h1 className="state-title">{t('track.gateTitle')}</h1>
                <p className="state-text">{t('track.gateText')}</p>
              </div>

              <form
                className="stack"
                onSubmit={e => { e.preventDefault(); if (pin.trim().length >= 4) lookup(pin.trim()); }}
              >
                <div className={`field${status === 'error' ? ' is-invalid' : ''}`}>
                  <label className="field-label" htmlFor="track-pin">{t('track.pinLabel')}</label>
                  <input
                    id="track-pin"
                    className="input input-pin"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    placeholder="0000"
                    onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setStatus('idle'); }}
                  />
                  {status === 'error'
                    ? <span className="field-error"><AlertCircle size={13} strokeWidth={2} />{t('track.notFound')}</span>
                    : <span className="field-hint">{t('track.pinHint')}</span>}
                </div>
                <button
                  type="submit"
                  className={`btn btn-primary btn-lg btn-block${status === 'loading' ? ' btn-loading' : ''}`}
                  disabled={pin.trim().length < 4 || status === 'loading'}
                >
                  {t('track.submit')}
                </button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar variant="client" />
      <main className="page-body no-bottomnav">
        <div className="track-layout">
          <div className="track-info">
            <div className="track-head">
              <p className="label-caps">{t('checkout.orderRef')}</p>
              <p className="track-ref">{order.ref}</p>
              <span className={`pill pill-${order.status}`}>{t(TIMELINE[currentIndex].label)}</span>
            </div>

            <div className="courier-card">
              <span className="avatar avatar-lg" aria-hidden="true">
                {order.courier.name.split(' ').map(w => w[0]).join('')}
              </span>
              <span className="courier-meta">
                <span className="courier-name">{order.courier.name}</span>
                <span className="courier-sub">{order.courier.vehicle}</span>
                <span className="courier-sub courier-rating">
                  <Star size={12} strokeWidth={2} fill="currentColor" /> {order.courier.rating}
                </span>
              </span>
              {isLive && (
                <span className="courier-eta">
                  <span className="courier-eta-val">{order.courier.etaMinutes}′</span>
                  <span className="courier-eta-label">{t('track.eta')}</span>
                </span>
              )}
            </div>

            <a className="btn btn-outline btn-block" href={`tel:${order.phone.replace(/\s/g, '')}`}>
              <Phone size={16} strokeWidth={1.9} /> {t('track.call')}
            </a>

            <div className="timeline">
              {TIMELINE.map((entry, i) => {
                const Icon = entry.icon;
                const state = i < currentIndex ? 'is-done' : i === currentIndex ? 'is-current' : '';
                return (
                  <div className={`tl-step ${state}`.trim()} key={entry.status}>
                    <span className="tl-mark">
                      <span className="tl-dot"><Icon size={13} strokeWidth={2.4} /></span>
                      {i < TIMELINE.length - 1 && <span className="tl-line" />}
                    </span>
                    <span className="tl-body">
                      <span className="tl-title">{t(entry.label)}</span>
                      {i === currentIndex && isLive && (
                        <span className="tl-time"><span className="live-dot" /> {t('track.liveNow')}</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="track-block">
              <p className="label-caps">{t('track.deliverTo')}</p>
              <p className="track-address">{order.customer}</p>
              <p className="text-muted">{order.address}</p>
              <p className="text-muted">{order.city}</p>
            </div>

            <div className="track-block">
              <p className="label-caps">{t('track.items')}</p>
              <div className="cart-totals">
                {order.lines.map(line => (
                  <span className="cart-row" key={line.name}>
                    <span>{line.quantity} × {line.name}{line.size ? ` · ${line.size}` : ''}</span>
                    <span>{formatXAF(line.price * line.quantity)}</span>
                  </span>
                ))}
                <span className="cart-row cart-row-final">
                  <span>{t('cart.total')}</span>
                  <span>{formatXAF(order.total)}</span>
                </span>
              </div>
            </div>

            <div className="pin-box">
              <p className="pin-box-label">{t('checkout.pinLabel')}</p>
              <p className="pin-code">{order.pin}</p>
            </div>
            <p className="field-hint">{t('track.pinWarning')}</p>
          </div>

          <div className="map-wrap">
            <TrackingMap track={track} destination={order.track[order.track.length - 1]} />
            <div className="map-legend">
              <span className="legend-row">
                <span className="legend-dot legend-pickup" /> {t('track.pickup')}
              </span>
              <span className="legend-row">
                <span className="legend-dot legend-courier" /> {t('track.courier')}
              </span>
              <span className="legend-row">
                <span className="legend-dot legend-drop" /> {t('track.dropoff')}
              </span>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
