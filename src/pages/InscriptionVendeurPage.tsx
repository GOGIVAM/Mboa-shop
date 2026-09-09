import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, AlertCircle, CheckCircle2, Store } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useI18n, TKey } from '../i18n';
import { ROUTES } from '../routes';
import { submitSellerApplication } from '../services/operations';

const CITIES = ['Yaoundé', 'Douala', 'Bafoussam'];
const SEGMENTS: { id: string; label: TKey }[] = [
  { id: 'friperie', label: 'cat.friperie' },
  { id: 'pret_a_porter', label: 'cat.pret' },
  { id: 'marques', label: 'cat.marques' },
  { id: 'chaussures', label: 'cat.shoes' },
  { id: 'accessoires', label: 'cat.accessories' },
  { id: 'enfants', label: 'cat.kids' },
];

interface Form {
  shopName: string; owner: string; email: string; phone: string;
  city: string; address: string; payoutNumber: string; description: string;
  segments: string[];
}

const EMPTY: Form = {
  shopName: '', owner: '', email: '', phone: '',
  city: CITIES[0], address: '', payoutNumber: '', description: '', segments: [],
};

type Field = Exclude<keyof Form, 'segments' | 'city'>;

function validate(field: Field, value: string): TKey | null {
  const v = value.trim();
  if (!v) return 'valid.required';
  if (field === 'shopName') return v.length < 3 ? 'valid.nameShort' : null;
  if (field === 'owner') return v.length < 3 ? 'valid.nameShort' : null;
  if (field === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : 'valid.email';
  if (field === 'phone' || field === 'payoutNumber') {
    return /^(\+237\s?)?6\d(\s?\d{2}){4}$/.test(v.replace(/\s+/g, ' ')) ? null : 'valid.phone';
  }
  if (field === 'address') return v.length < 8 ? 'valid.addressShort' : null;
  if (field === 'description') return v.length < 20 ? 'valid.descShort' : null;
  return null;
}

const SECTIONS: Field[][] = [
  ['shopName', 'owner', 'email', 'phone'],
  ['address', 'description'],
  ['payoutNumber'],
];

export default function InscriptionVendeurPage() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<Field, true>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const set = (field: Field) => (value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const errorFor = (field: Field) => (touched[field] ? validate(field, form[field]) : null);

  const toggleSegment = (id: string) =>
    setForm(prev => ({
      ...prev,
      segments: prev.segments.includes(id)
        ? prev.segments.filter(s => s !== id)
        : [...prev.segments, id],
    }));

  const sectionValid = (index: number) => {
    const fields = SECTIONS[index];
    const ok = fields.every(field => !validate(field, form[field]));
    if (index === 1) return ok && form.segments.length > 0;
    return ok;
  };

  const next = () => {
    const fields = SECTIONS[step];
    setTouched(prev => {
      const merged = { ...prev };
      fields.forEach(field => { merged[field] = true; });
      return merged;
    });
    if (!sectionValid(step)) return;
    if (step < SECTIONS.length - 1) { setStep(s => s + 1); return; }
    submit();
  };

  const submit = () => {
    setSubmitting(true);
    setFailed(false);
    submitSellerApplication()
      .then(result => setDone(result.id))
      .catch(() => setFailed(true))
      .finally(() => setSubmitting(false));
  };

  const field = (name: Field, label: TKey, extra?: { type?: string; area?: boolean; hint?: TKey; placeholder?: string }) => (
    <div className={`field${extra?.area ? ' form-col-full' : ''}${errorFor(name) ? ' is-invalid' : form[name].trim() && !validate(name, form[name]) ? ' is-valid' : ''}`}>
      <label className="field-label" htmlFor={`sv-${name}`}>{t(label)}</label>
      {extra?.area ? (
        <textarea
          id={`sv-${name}`} className="input" value={form[name]}
          placeholder={extra.placeholder}
          onChange={e => set(name)(e.target.value)}
          onBlur={() => setTouched(p => ({ ...p, [name]: true }))}
        />
      ) : (
        <input
          id={`sv-${name}`} className="input" type={extra?.type ?? 'text'} value={form[name]}
          placeholder={extra?.placeholder}
          onChange={e => set(name)(e.target.value)}
          onBlur={() => setTouched(p => ({ ...p, [name]: true }))}
        />
      )}
      {errorFor(name)
        ? <span className="field-error"><AlertCircle size={13} strokeWidth={2} />{t(errorFor(name)!)}</span>
        : extra?.hint && <span className="field-hint">{t(extra.hint)}</span>}
    </div>
  );

  if (done) {
    return (
      <>
        <Navbar variant="client" />
        <main className="page-body">
          <div className="container-xs">
            <div className="confirm-block">
              <span className="confirm-check"><CheckCircle2 size={38} strokeWidth={1.8} /></span>
              <h1 className="confirm-title">{t('signup.doneTitle')}</h1>
              <p className="state-text">{t('signup.doneText')}</p>
              <p className="confirm-ref">{t('signup.fileRef')} · {done}</p>
              <div className="state-actions">
                <Link className="btn btn-primary" to={ROUTES.seller}>{t('footer.seller')}</Link>
                <Link className="btn btn-outline" to={ROUTES.catalogue}>{t('common.seeCatalogue')}</Link>
              </div>
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
      <main className="page-body">
        <div className="container-sm signup-page">
          <div className="signup-head">
            <span className="state-icon"><Store size={26} strokeWidth={1.7} /></span>
            <h1 className="section-title">{t('signup.title')}</h1>
            <p className="lede">{t('signup.sub')}</p>
          </div>

          <div className="progress-inline signup-progress">
            <span className="progress">
              <span className="progress-bar" style={{ width: `${((step + 1) / SECTIONS.length) * 100}%` }} />
            </span>
            <span className="progress-value">{t('signup.stepOf', { n: step + 1, total: SECTIONS.length })}</span>
          </div>

          <div className="stepper">
            {[t('signup.sec1'), t('signup.sec2'), t('signup.sec3')].map((label, i) => (
              <div className="step-wrap" key={label}>
                {i > 0 && <span className={`step-line${i <= step ? ' is-done' : ''}`} />}
                <div className={`step${i === step ? ' is-current' : i < step ? ' is-done' : ''}`}>
                  <span className="step-dot">{i < step ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
                  <span className="step-label">{label}</span>
                </div>
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="form-grid">
              {field('shopName', 'signup.shopName', { placeholder: 'Bantu Denim' })}
              {field('owner', 'signup.owner')}
              {field('email', 'signup.email', { type: 'email' })}
              {field('phone', 'signup.phone', { type: 'tel', placeholder: '+237 6 78 45 12 09' })}
            </div>
          )}

          {step === 1 && (
            <div className="form-grid">
              <div className="field">
                <label className="field-label" htmlFor="sv-city">{t('checkout.city')}</label>
                <select id="sv-city" className="input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))}>
                  {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
              </div>
              {field('address', 'signup.address', { hint: 'signup.addressHint' })}
              <div className="field form-col-full">
                <span className="field-label">{t('signup.segments')}</span>
                <div className="row-wrap">
                  {SEGMENTS.map(segment => (
                    <button
                      key={segment.id}
                      type="button"
                      className="chip"
                      aria-pressed={form.segments.includes(segment.id)}
                      onClick={() => toggleSegment(segment.id)}
                    >
                      {t(segment.label)}
                    </button>
                  ))}
                </div>
                {form.segments.length === 0 && touched.description && (
                  <span className="field-error"><AlertCircle size={13} strokeWidth={2} />{t('signup.pickSegment')}</span>
                )}
              </div>
              {field('description', 'signup.description', { area: true, hint: 'signup.descHint' })}
            </div>
          )}

          {step === 2 && (
            <div className="form-grid">
              {field('payoutNumber', 'signup.payout', { type: 'tel', hint: 'signup.payoutHint', placeholder: '+237 6 78 45 12 09' })}
              <div className="checkout-summary form-col-full">
                <span className="cart-row"><span>{t('signup.shopName')}</span><span>{form.shopName}</span></span>
                <span className="cart-row"><span>{t('signup.owner')}</span><span>{form.owner}</span></span>
                <span className="cart-row"><span>{t('checkout.city')}</span><span>{form.city}</span></span>
                <span className="cart-row">
                  <span>{t('signup.segments')}</span>
                  <span>{form.segments.length}</span>
                </span>
              </div>
              {failed && (
                <p className="field-error form-col-full">
                  <AlertCircle size={14} strokeWidth={2} />{t('signup.failed')}
                </p>
              )}
            </div>
          )}

          <div className="signup-foot">
            {step > 0 && (
              <button type="button" className="btn btn-outline" onClick={() => setStep(s => s - 1)}>
                {t('common.back')}
              </button>
            )}
            <button
              type="button"
              className={`btn btn-primary btn-lg${submitting ? ' btn-loading' : ''}`}
              onClick={next}
              disabled={submitting}
            >
              {step === SECTIONS.length - 1 ? t('signup.submit') : t('common.next')}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
