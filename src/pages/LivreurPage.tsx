import { useEffect, useMemo, useState } from 'react';
import { Package, Wallet, Route as RouteIcon, MapPin, Phone, Delete, Check, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import TrackingMap from '../components/TrackingMap';
import { formatXAF } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useI18n, TKey } from '../i18n';
import { listMissions, advanceMission, nextMissionStatus } from '../services/operations';
import { DemoMission, MissionStatus } from '../data/orders';

const ACTION_LABEL: Record<MissionStatus, TKey> = {
  pending: 'courier.accept',
  accepted: 'courier.confirmPickup',
  picked_up: 'courier.confirmDelivery',
  delivered: 'courier.done',
};

export default function LivreurPage() {
  const { t } = useI18n();
  const toast = useToast();

  const [available, setAvailable] = useState(true);
  const [missions, setMissions] = useState<DemoMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    listMissions(controller.signal)
      .then(rows => {
        setMissions(rows);
        setSelectedId(rows.find(m => m.status !== 'delivered')?.id ?? rows[0]?.id ?? null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const selected = useMemo(
    () => missions.find(m => m.id === selectedId) ?? null,
    [missions, selectedId],
  );

  const today = useMemo(() => {
    const done = missions.filter(m => m.status === 'delivered');
    return {
      count: done.length,
      earnings: done.reduce((sum, m) => sum + m.earnings, 0),
      distance: done.reduce((sum, m) => sum + m.distanceKm, 0),
    };
  }, [missions]);

  const pressKey = (key: string) => {
    setPinError(false);
    if (key === 'del') { setPin(p => p.slice(0, -1)); return; }
    if (pin.length >= 4) return;
    setPin(p => p + key);
  };

  const advance = () => {
    if (!selected) return;

    // La livraison finale exige le PIN remis au client.
    if (selected.status === 'picked_up') {
      if (pin !== selected.pin) { setPinError(true); return; }
    }

    setWorking(true);
    advanceMission(selected.id)
      .then(status => {
        setMissions(prev => prev.map(m => (m.id === selected.id ? { ...m, status } : m)));
        setPin('');
        toast.show(t(status === 'delivered' ? 'courier.delivered' : 'courier.updated'), 'success');
      })
      .catch(() => toast.show(t('error.text'), 'error'))
      .finally(() => setWorking(false));
  };

  const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <>
      <Navbar variant="courier" />

      <main className="page-body no-bottomnav">
        <section className="dash-hero">
          <div className="container">
            <div className="dash-hero-inner">
              <div>
                <h1 className="dash-title">Serge Etoa</h1>
                <p className="dash-sub">Yaoundé · Moto YAO 4821 B</p>
              </div>
              <label className="toggle courier-toggle">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={e => setAvailable(e.target.checked)}
                />
                <span className="toggle-track" />
                <span className="toggle-label">
                  {t(available ? 'courier.available' : 'courier.unavailable')}
                </span>
              </label>
            </div>
          </div>
        </section>

        <div className="container dash-body">
          <div className="kpi-grid kpi-grid-3">
            <div className="kpi-card">
              <span className="kpi-ico"><Package size={17} strokeWidth={1.9} /></span>
              <p className="kpi-val">{today.count}</p>
              <p className="kpi-label">{t('courier.kpiDone')}</p>
            </div>
            <div className="kpi-card">
              <span className="kpi-ico"><Wallet size={17} strokeWidth={1.9} /></span>
              <p className="kpi-val">{new Intl.NumberFormat('fr-FR').format(today.earnings)}</p>
              <p className="kpi-label">{t('courier.kpiEarnings')}</p>
            </div>
            <div className="kpi-card">
              <span className="kpi-ico"><RouteIcon size={17} strokeWidth={1.9} /></span>
              <p className="kpi-val">{today.distance.toFixed(1)}</p>
              <p className="kpi-label">{t('courier.kpiDistance')}</p>
            </div>
          </div>

          <div className="courier-layout">
            <div className="stack">
              <p className="panel-title">{t('courier.missions')}</p>

              {loading && Array.from({ length: 3 }).map((_, i) => (
                <span className="skeleton sk-row sk-row-tall" key={i} />
              ))}

              {!loading && missions.length === 0 && (
                <div className="state-block">
                  <span className="state-icon"><Package size={28} strokeWidth={1.7} /></span>
                  <p className="state-title">{t('courier.noMission')}</p>
                  <p className="state-text">{t('courier.noMissionText')}</p>
                </div>
              )}

              {!loading && missions.map(mission => (
                <button
                  type="button"
                  key={mission.id}
                  className={`mission-card${mission.id === selectedId ? ' is-selected' : ''}`}
                  onClick={() => { setSelectedId(mission.id); setPin(''); setPinError(false); }}
                >
                  <span className="mission-top">
                    <span className="mission-id">{mission.id}</span>
                    <span className={`pill pill-${mission.status}`}>{t(`status.${mission.status}` as TKey)}</span>
                  </span>
                  <span className="mission-route">{mission.pickup}</span>
                  <span className="mission-route">→ {mission.dropoff}</span>
                  <span className="mission-bottom">
                    <span>{mission.distanceKm} km</span>
                    <span className="mission-earn">{formatXAF(mission.earnings)}</span>
                  </span>
                </button>
              ))}
            </div>

            {selected && (
              <div className="stack courier-detail">
                <div className="panel">
                  <div className="panel-head">
                    <p className="panel-title">{selected.id}</p>
                    <span className={`pill pill-${selected.status}`}>{t(`status.${selected.status}` as TKey)}</span>
                  </div>
                  <div className="panel-body">
                    <div className="route-viz">
                      <span className="route-stop">
                        <span className="route-dot route-dot-pickup"><MapPin size={14} strokeWidth={2.2} /></span>
                        <span>
                          <span className="route-label">{t('track.pickup')}</span>
                          <span className="route-addr">{selected.pickup}</span>
                        </span>
                      </span>
                      <span className="route-line" />
                      <span className="route-stop">
                        <span className="route-dot route-dot-drop"><MapPin size={14} strokeWidth={2.2} /></span>
                        <span>
                          <span className="route-label">{t('track.dropoff')}</span>
                          <span className="route-addr">{selected.dropoff}</span>
                        </span>
                      </span>
                    </div>

                    <div className="spec-list courier-specs">
                      <span className="spec-row">
                        <span className="spec-key">{t('admin.colCustomer')}</span>
                        <span className="spec-val">{selected.customer}</span>
                      </span>
                      <span className="spec-row">
                        <span className="spec-key">{t('courier.earning')}</span>
                        <span className="spec-val price">{formatXAF(selected.earnings)}</span>
                      </span>
                    </div>

                    <a className="btn btn-outline btn-block" href={`tel:${selected.phone.replace(/\s/g, '')}`}>
                      <Phone size={16} strokeWidth={1.9} /> {selected.phone}
                    </a>
                  </div>
                </div>

                <div className="map-wrap map-wrap-inline">
                  <TrackingMap
                    track={[selected.coords.pickup]}
                    destination={selected.coords.dropoff}
                  />
                </div>

                {selected.status === 'picked_up' && (
                  <div className="panel">
                    <div className="panel-head">
                      <p className="panel-title">{t('courier.pinTitle')}</p>
                    </div>
                    <div className="panel-body">
                      <p className="state-text pin-instruction">{t('courier.pinText')}</p>

                      <div className="pin-display">
                        {[0, 1, 2, 3].map(i => (
                          <span
                            key={i}
                            className={`pin-cell${pin[i] ? ' is-filled' : ''}${pinError ? ' is-error' : ''}`}
                          >
                            {pin[i] ?? ''}
                          </span>
                        ))}
                      </div>

                      {pinError && (
                        <p className="field-error pin-error">
                          <AlertCircle size={14} strokeWidth={2} />{t('courier.pinWrong')}
                        </p>
                      )}

                      <div className="pin-pad">
                        {KEYS.map(key => (
                          <button type="button" className="pin-key" key={key} onClick={() => pressKey(key)}>
                            {key}
                          </button>
                        ))}
                        <span />
                        <button type="button" className="pin-key" onClick={() => pressKey('0')}>0</button>
                        <button
                          type="button"
                          className="pin-key pin-key-action"
                          onClick={() => pressKey('del')}
                          aria-label={t('courier.pinDelete')}
                        >
                          <Delete size={20} strokeWidth={1.9} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {selected.status !== 'delivered' && (
                  <button
                    type="button"
                    className={`btn btn-primary btn-lg btn-block${working ? ' btn-loading' : ''}`}
                    onClick={advance}
                    disabled={working || (selected.status === 'picked_up' && pin.length < 4)}
                  >
                    {t(ACTION_LABEL[selected.status])}
                  </button>
                )}

                {selected.status === 'delivered' && (
                  <p className="eco-note">
                    <Check size={16} strokeWidth={2.2} /> {t('courier.deliveredNote')}
                  </p>
                )}

                <p className="field-hint">
                  {t('courier.nextStep', { step: t(ACTION_LABEL[nextMissionStatus(selected.status)]) })}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
