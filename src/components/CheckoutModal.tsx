import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowLeft, Check, CheckCircle2, ShieldCheck, Copy, AlertCircle } from 'lucide-react';
import { useCart, formatXAF, lineKey } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useScrollLock } from '../hooks/useReveal';
import { useI18n, TKey } from '../i18n';
import { ROUTES } from '../routes';
import { placeOrder, PlacedOrder } from '../services/operations';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

type PaymentMethod = 'om' | 'momo' | 'card' | 'cash';

const CITIES = ['Yaoundé', 'Douala', 'Bafoussam'];

const PAYMENTS: { id: PaymentMethod; name: string; desc: TKey; needsNumber: boolean }[] = [
  { id: 'om', name: 'Orange Money', desc: 'pay.omDesc', needsNumber: true },
  { id: 'momo', name: 'MTN MoMo', desc: 'pay.momoDesc', needsNumber: true },
  { id: 'card', name: 'Visa / Mastercard', desc: 'pay.cardDesc', needsNumber: false },
  { id: 'cash', name: 'Espèces', desc: 'pay.cashDesc', needsNumber: false },
];

function PayLogo({ id }: { id: PaymentMethod }) {
  if (id === 'om') {
    return (
      <svg width="40" height="28" viewBox="0 0 34 24" role="img" aria-label="Orange Money">
        <rect width="34" height="24" fill="#FF6600" />
        <rect x="12" y="6" width="12" height="12" fill="#FFFFFF" />
        <rect x="16" y="10" width="4" height="4" fill="#FF6600" />
      </svg>
    );
  }
  if (id === 'momo') {
    return (
      <svg width="40" height="28" viewBox="0 0 34 24" role="img" aria-label="MTN MoMo">
        <rect width="34" height="24" fill="#FFCC00" />
        <text x="17" y="16" textAnchor="middle" fill="#000000" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="9">MoMo</text>
      </svg>
    );
  }
  if (id === 'card') {
    return (
      <svg width="40" height="28" viewBox="0 0 34 24" role="img" aria-label="Carte bancaire">
        <rect width="34" height="24" fill="#1A1F71" />
        <text x="17" y="16" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, sans-serif" fontStyle="italic" fontWeight="800" fontSize="9">VISA</text>
      </svg>
    );
  }
  return (
    <svg width="40" height="28" viewBox="0 0 34 24" role="img" aria-label="Espèces">
      <rect width="34" height="24" fill="#2E7D45" />
      <rect x="6" y="7" width="22" height="10" rx="1.5" stroke="#FFFFFF" strokeWidth="1.4" fill="none" />
      <circle cx="17" cy="12" r="2.6" fill="#FFFFFF" />
    </svg>
  );
}

interface FormState {
  fullName: string; phone: string; city: string; address: string; momoNumber: string;
}

const EMPTY: FormState = { fullName: '', phone: '', city: CITIES[0], address: '', momoNumber: '' };

/** Validation champ par champ — renvoie une clé de message ou null. */
function validate(field: keyof FormState, value: string, payment: PaymentMethod): TKey | null {
  const v = value.trim();
  if (field === 'fullName') {
    if (!v) return 'valid.required';
    return v.length < 3 ? 'valid.nameShort' : null;
  }
  if (field === 'phone' || field === 'momoNumber') {
    if (field === 'momoNumber' && payment !== 'om' && payment !== 'momo') return null;
    if (!v) return 'valid.required';
    return /^(\+237\s?)?6\d(\s?\d{2}){4}$/.test(v.replace(/\s+/g, ' ')) ? null : 'valid.phone';
  }
  if (field === 'address') {
    if (!v) return 'valid.required';
    return v.length < 8 ? 'valid.addressShort' : null;
  }
  return null;
}

export default function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { t } = useI18n();
  const toast = useToast();
  const { items, subtotal, shipping, total, clearCart } = useCart();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, true>>>({});
  const [payment, setPayment] = useState<PaymentMethod>('om');
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [failed, setFailed] = useState(false);

  useScrollLock(open);

  const STEPS: TKey[] = ['checkout.step1', 'checkout.step2', 'checkout.step3'];

  const errorFor = (field: keyof FormState) =>
    touched[field] ? validate(field, form[field], payment) : null;

  const set = (field: keyof FormState) => (value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const step1Valid = (['fullName', 'phone', 'address'] as const)
    .every(field => !validate(field, form[field], payment));

  const needsNumber = PAYMENTS.find(p => p.id === payment)?.needsNumber ?? false;
  const step2Valid = !needsNumber || !validate('momoNumber', form.momoNumber, payment);

  const close = () => {
    onClose();
    if (placed) {
      setStep(0);
      setForm(EMPTY);
      setTouched({});
      setPlaced(null);
    }
  };

  const goNext = () => {
    if (step === 0) {
      setTouched({ fullName: true, phone: true, address: true });
      if (!step1Valid) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      setTouched(prev => ({ ...prev, momoNumber: true }));
      if (!step2Valid) return;
      submit();
    }
  };

  const submit = () => {
    setSubmitting(true);
    setFailed(false);
    placeOrder({
      fullName: form.fullName, phone: form.phone, city: form.city, address: form.address,
      payment, momoNumber: form.momoNumber, total,
    })
      .then(result => {
        setPlaced(result);
        setStep(2);
        clearCart();
      })
      .catch(() => setFailed(true))
      .finally(() => setSubmitting(false));
  };

  const copyPin = () => {
    if (!placed) return;
    navigator.clipboard?.writeText(placed.pin)
      .then(() => toast.show(t('common.copied'), 'success'))
      .catch(() => toast.show(t('checkout.copyFailed'), 'error'));
  };

  return (
    <div className={`modal-scrim${open ? ' is-open' : ''}`} onClick={close} aria-hidden={!open}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={t('cart.checkout')}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-head">
          {step > 0 && step < 2 && (
            <button type="button" className="btn btn-icon" onClick={() => setStep(s => s - 1)} aria-label={t('common.back')}>
              <ArrowLeft size={20} strokeWidth={1.9} />
            </button>
          )}
          <p className="modal-title">{step === 2 ? t('checkout.doneTitle') : t('cart.checkout')}</p>
          <button type="button" className="btn btn-icon modal-close" onClick={close} aria-label={t('common.close')}>
            <X size={22} strokeWidth={1.8} />
          </button>
        </div>

        <div className="modal-body">
          {step < 2 && (
            <div className="stepper">
              {STEPS.map((label, i) => (
                <div className="step-wrap" key={label}>
                  {i > 0 && <span className={`step-line${i <= step ? ' is-done' : ''}`} />}
                  <div className={`step${i === step ? ' is-current' : i < step ? ' is-done' : ''}`}>
                    <span className="step-dot">{i < step ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
                    <span className="step-label">{t(label)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 0 && (
            <div className="form-grid">
              <div className={`field form-col-full${errorFor('fullName') ? ' is-invalid' : ''}`}>
                <label className="field-label" htmlFor="co-name">{t('checkout.fullName')}</label>
                <input
                  id="co-name" className="input" value={form.fullName}
                  onChange={e => set('fullName')(e.target.value)}
                  onBlur={() => setTouched(p => ({ ...p, fullName: true }))}
                  autoComplete="name"
                />
                {errorFor('fullName') && (
                  <span className="field-error"><AlertCircle size={13} strokeWidth={2} />{t(errorFor('fullName')!)}</span>
                )}
              </div>

              <div className={`field${errorFor('phone') ? ' is-invalid' : ''}`}>
                <label className="field-label" htmlFor="co-phone">{t('checkout.phone')}</label>
                <input
                  id="co-phone" className="input" type="tel" inputMode="tel"
                  placeholder="+237 6 78 45 12 09" value={form.phone}
                  onChange={e => set('phone')(e.target.value)}
                  onBlur={() => setTouched(p => ({ ...p, phone: true }))}
                  autoComplete="tel"
                />
                {errorFor('phone') && (
                  <span className="field-error"><AlertCircle size={13} strokeWidth={2} />{t(errorFor('phone')!)}</span>
                )}
              </div>

              <div className="field">
                <label className="field-label" htmlFor="co-city">{t('checkout.city')}</label>
                <select id="co-city" className="input" value={form.city} onChange={e => set('city')(e.target.value)}>
                  {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>

              <div className={`field form-col-full${errorFor('address') ? ' is-invalid' : ''}`}>
                <label className="field-label" htmlFor="co-address">{t('checkout.address')}</label>
                <textarea
                  id="co-address" className="input" value={form.address}
                  placeholder={t('checkout.addressHint')}
                  onChange={e => set('address')(e.target.value)}
                  onBlur={() => setTouched(p => ({ ...p, address: true }))}
                />
                {errorFor('address') && (
                  <span className="field-error"><AlertCircle size={13} strokeWidth={2} />{t(errorFor('address')!)}</span>
                )}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="stack">
              <div className="pay-options">
                {PAYMENTS.map(option => (
                  <label key={option.id} className={`pay-opt${payment === option.id ? ' is-selected' : ''}`}>
                    <input
                      type="radio" name="payment" value={option.id}
                      checked={payment === option.id}
                      onChange={() => setPayment(option.id)}
                    />
                    <span className="pay-logo"><PayLogo id={option.id} /></span>
                    <span className="pay-text">
                      <span className="pay-name">{option.name}</span>
                      <span className="pay-desc">{t(option.desc)}</span>
                    </span>
                    {payment === option.id && <span className="pay-check"><CheckCircle2 size={20} strokeWidth={2} /></span>}
                  </label>
                ))}
              </div>

              {needsNumber && (
                <div className={`field${errorFor('momoNumber') ? ' is-invalid' : ''}`}>
                  <label className="field-label" htmlFor="co-momo">{t('checkout.payNumber')}</label>
                  <input
                    id="co-momo" className="input" type="tel" inputMode="tel"
                    placeholder="+237 6 78 45 12 09" value={form.momoNumber}
                    onChange={e => set('momoNumber')(e.target.value)}
                    onBlur={() => setTouched(p => ({ ...p, momoNumber: true }))}
                  />
                  {errorFor('momoNumber')
                    ? <span className="field-error"><AlertCircle size={13} strokeWidth={2} />{t(errorFor('momoNumber')!)}</span>
                    : <span className="field-hint">{t('checkout.payNumberHint')}</span>}
                </div>
              )}

              <div className="checkout-summary">
                {items.map(item => (
                  <span className="cart-row" key={lineKey(item)}>
                    <span>{item.quantity} × {item.name}{item.size ? ` · ${item.size}` : ''}</span>
                    <span>{formatXAF(item.price * item.quantity)}</span>
                  </span>
                ))}
                <span className="cart-row">
                  <span>{t('cart.shipping')}</span>
                  <span>{shipping === 0 ? t('cart.free') : formatXAF(shipping)}</span>
                </span>
                <span className="checkout-total-row">
                  <span>{t('cart.total')}</span>
                  <span>{formatXAF(subtotal + shipping)}</span>
                </span>
              </div>

              {failed && (
                <p className="field-error"><AlertCircle size={14} strokeWidth={2} />{t('checkout.failed')}</p>
              )}

              <p className="pay-provider-note">
                <ShieldCheck size={14} strokeWidth={1.8} /> {t('checkout.notchpay')}
              </p>
            </div>
          )}

          {step === 2 && placed && (
            <div className="confirm-block">
              <span className="confirm-check"><CheckCircle2 size={38} strokeWidth={1.8} /></span>
              <p className="confirm-title">{t('checkout.doneTitle')}</p>
              <p className="confirm-ref">{t('checkout.orderRef')} · {placed.ref}</p>

              <div className="pin-box">
                <p className="pin-box-label">{t('checkout.pinLabel')}</p>
                <p className="pin-code">{placed.pin}</p>
                <button type="button" className="btn btn-ghost btn-sm" onClick={copyPin}>
                  <Copy size={14} strokeWidth={2} /> {t('common.copy')}
                </button>
              </div>

              <div className="confirm-steps">
                <span className="confirm-step">
                  <span className="confirm-step-num">1</span>
                  {t('checkout.next1')}
                </span>
                <span className="confirm-step">
                  <span className="confirm-step-num">2</span>
                  {t('checkout.next2')}
                </span>
                <span className="confirm-step">
                  <span className="confirm-step-num">3</span>
                  {t('checkout.next3')}
                </span>
              </div>

              {placed.paymentRef !== '—' && (
                <p className="field-hint">{t('pay.reference')} · {placed.paymentRef}</p>
              )}
            </div>
          )}
        </div>

        <div className="modal-foot">
          {step === 2 ? (
            <>
              <Link className="btn btn-outline" to={ROUTES.catalogue} onClick={close}>
                {t('common.seeCatalogue')}
              </Link>
              <Link className="btn btn-primary" to={ROUTES.tracking} onClick={close}>
                {t('pay.trackOrder')}
              </Link>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-outline" onClick={step === 0 ? close : () => setStep(s => s - 1)}>
                {step === 0 ? t('common.cancel') : t('common.back')}
              </button>
              <button
                type="button"
                className={`btn btn-primary${submitting ? ' btn-loading' : ''}`}
                onClick={goNext}
                disabled={submitting}
              >
                {step === 1 ? t('checkout.pay', { amount: formatXAF(subtotal + shipping) }) : t('common.next')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
