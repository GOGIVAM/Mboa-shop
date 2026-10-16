import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Phone, ShieldCheck, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { useI18n, TKey } from '../i18n';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../routes';

type Mode = 'login' | 'signup';

interface Form { name: string; phone: string; email: string; password: string; confirm: string; }

const EMPTY: Form = { name: '', phone: '', email: '', password: '', confirm: '' };

/** Champs par étape d'inscription : identité, puis sécurité. */
const SIGNUP_STEPS: (keyof Form)[][] = [
  ['name', 'phone', 'email'],
  ['password', 'confirm'],
];

function validate(field: keyof Form, form: Form, mode: Mode): TKey | null {
  const v = form[field].trim();
  if (mode === 'login' && (field === 'name' || field === 'phone' || field === 'confirm')) return null;
  if (!v) return 'valid.required';
  if (field === 'name') return v.length < 3 ? 'valid.nameShort' : null;
  if (field === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : 'valid.email';
  if (field === 'phone') return /^(\+?237)?6\d{8}$/.test(v.replace(/[\s.-]+/g, '')) ? null : 'valid.phone';
  if (field === 'password') return v.length < 8 ? 'valid.passwordShort' : null;
  if (field === 'confirm') return v === form.password ? null : 'valid.confirmMismatch';
  return null;
}

export default function AuthPage({ initialMode = 'login' }: { initialMode?: Mode }) {
  const { t } = useI18n();
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [params] = useSearchParams();

  /** Destination après authentification, ex. /connexion?next=/vendeur */
  const next = params.get('next') ?? ROUTES.home;

  const [mode, setMode] = useState<Mode>(initialMode);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof Form, true>>>({});
  const [busy, setBusy] = useState(false);

  const set = (field: keyof Form) => (value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const errorFor = (field: keyof Form) => (touched[field] ? validate(field, form, mode) : null);

  const switchTo = (nextMode: Mode) => {
    setMode(nextMode);
    setStep(0);
    setTouched({});
  };

  const finish = () => {
    setBusy(true);
    // Branchez ici votre authentification : POST /api/auth/login | /api/auth/register
    window.setTimeout(() => {
      setBusy(false);
      login({
        name: form.name.trim() || form.email.split('@')[0],
        email: form.email.trim(),
      });
      toast.show(t(mode === 'login' ? 'auth.loggedIn' : 'auth.registered'), 'success');
      navigate(next);
    }, 900);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    const fields = mode === 'login' ? (['email', 'password'] as (keyof Form)[]) : SIGNUP_STEPS[step];
    setTouched(prev => {
      const merged = { ...prev };
      fields.forEach(f => { merged[f] = true; });
      return merged;
    });
    if (fields.some(f => validate(f, form, mode))) return;

    if (mode === 'signup' && step < SIGNUP_STEPS.length - 1) {
      setStep(s => s + 1);
      return;
    }
    finish();
  };

  const field = (
    name: keyof Form,
    label: TKey,
    Icon: typeof Mail,
    extra?: { type?: string; placeholder?: string },
  ) => (
    <div className={`auth-field${errorFor(name) ? ' is-invalid' : ''}`}>
      <label className="sr-only" htmlFor={`au-${name}`}>{t(label)}</label>
      <span className="auth-field-ico"><Icon size={16} strokeWidth={1.9} /></span>
      <input
        id={`au-${name}`}
        className="auth-input"
        type={extra?.type ?? 'text'}
        value={form[name]}
        placeholder={extra?.placeholder ?? t(label)}
        onChange={e => set(name)(e.target.value)}
        onBlur={() => setTouched(p => ({ ...p, [name]: true }))}
      />
      {errorFor(name) && (
        <span className="auth-field-error"><AlertCircle size={12} strokeWidth={2} />{t(errorFor(name)!)}</span>
      )}
    </div>
  );

  const isLastStep = mode === 'login' || step === SIGNUP_STEPS.length - 1;

  return (
    <main className="auth-page">
      <span className="auth-shape auth-shape-1" aria-hidden="true" />
      <span className="auth-shape auth-shape-2" aria-hidden="true" />

      <Link to={ROUTES.home} className="auth-back">
        <ArrowLeft size={16} strokeWidth={2} />{t('auth.backHome')}
      </Link>

      <div className={`auth-card${mode === 'signup' ? ' is-signup' : ''}`}>
        <aside className="auth-aside">
          <div className="auth-aside-brand">
            <BrandLogo onDark />
          </div>

          <div className="auth-aside-body">
            <h2 className="auth-aside-title">
              {t(mode === 'login' ? 'auth.asideLoginTitle' : 'auth.asideSignupTitle')}
            </h2>
            <p className="auth-aside-text">
              {t(mode === 'login' ? 'auth.asideLoginText' : 'auth.asideSignupText')}
            </p>
            <button
              type="button"
              className="btn btn-outline-inv btn-lg auth-switch"
              onClick={() => switchTo(mode === 'login' ? 'signup' : 'login')}
            >
              {t(mode === 'login' ? 'auth.toSignup' : 'auth.toLogin')}
            </button>
          </div>

          <span className="auth-aside-orb auth-aside-orb-1" aria-hidden="true" />
          <span className="auth-aside-orb auth-aside-orb-2" aria-hidden="true" />
          <span className="auth-aside-diamond" aria-hidden="true" />
        </aside>

        <section className="auth-form-side">
          <h1 className="auth-title">
            {t(mode === 'login' ? 'auth.loginTitle' : 'auth.signupTitle')}
          </h1>

          {mode === 'signup' && (
            <div className="auth-steps" aria-label={t('auth.stepOf', { n: step + 1, total: SIGNUP_STEPS.length })}>
              {SIGNUP_STEPS.map((_, i) => (
                <span className={`auth-step${i === step ? ' is-current' : i < step ? ' is-done' : ''}`} key={i}>
                  <span className="auth-step-dot">
                    {i < step ? <Check size={12} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="auth-step-label">
                    {t(i === 0 ? 'auth.stepIdentity' : 'auth.stepSecurity')}
                  </span>
                </span>
              ))}
            </div>
          )}

          {mode === 'login' && (
            <>
              <div className="auth-socials" role="group" aria-label={t('auth.socialLabel')}>
                <button type="button" className="auth-social" aria-label="Google">
                  <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M21.6 12.2c0-.7-.06-1.35-.18-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.75 3-4.3 3-7.3z" />
                    <path fill="currentColor" d="M12 22c2.7 0 4.96-.9 6.6-2.4l-3.2-2.5c-.9.6-2.05.95-3.4.95a5.95 5.95 0 0 1-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" />
                    <path fill="currentColor" d="M6.4 13.95a6 6 0 0 1 0-3.8V7.55H3.1a10 10 0 0 0 0 8.9l3.3-2.5z" />
                    <path fill="currentColor" d="M12 6.05c1.47 0 2.8.5 3.84 1.5l2.84-2.84A9.98 9.98 0 0 0 3.1 7.55l3.3 2.6A5.95 5.95 0 0 1 12 6.05z" />
                  </svg>
                </button>
                <button type="button" className="auth-social" aria-label="Facebook">
                  <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.55.45-1 1-1z" />
                  </svg>
                </button>
                <button type="button" className="auth-social" aria-label="WhatsApp">
                  <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3zm4.5 12.3c-.2.55-1.1 1.05-1.55 1.1-.45.05-1 .05-2.5-.6a9.3 9.3 0 0 1-3.9-3.6c-.6-1.05-.6-1.9-.4-2.35.2-.45.7-.9 1-1 .3-.1.6-.05.8.35l.6 1.3c.1.25.05.4-.1.6l-.3.4c-.15.2-.15.35 0 .6.5.85 1.3 1.55 2.2 1.95.25.1.4.05.55-.1l.45-.45c.2-.2.4-.2.6-.1l1.25.65c.35.2.4.45.35.75z" />
                  </svg>
                </button>
              </div>
              <p className="auth-divider">{t('auth.orEmailLogin')}</p>
            </>
          )}

          <form className="auth-form" onSubmit={submit} noValidate>
            {mode === 'login' && (
              <>
                {field('email', 'auth.email', Mail, { type: 'email' })}
                {field('password', 'auth.password', Lock, { type: 'password' })}
                <button type="button" className="auth-forgot">{t('auth.forgot')}</button>
              </>
            )}

            {mode === 'signup' && step === 0 && (
              <>
                {field('name', 'auth.name', User)}
                {field('phone', 'auth.phone', Phone, { type: 'tel', placeholder: '+237 6 78 45 12 09' })}
                {field('email', 'auth.email', Mail, { type: 'email' })}
              </>
            )}

            {mode === 'signup' && step === 1 && (
              <>
                {field('password', 'auth.password', Lock, { type: 'password' })}
                {field('confirm', 'auth.confirm', ShieldCheck, { type: 'password' })}
                <p className="auth-hint">{t('auth.passwordHint')}</p>
              </>
            )}

            <div className="auth-cta-row">
              {mode === 'signup' && step > 0 && (
                <button type="button" className="btn btn-outline btn-lg auth-back-step" onClick={() => setStep(s => s - 1)}>
                  {t('common.back')}
                </button>
              )}
              <button type="submit" className={`btn btn-primary btn-lg auth-submit${busy ? ' btn-loading' : ''}`} disabled={busy}>
                {mode === 'login'
                  ? t('auth.loginCta')
                  : isLastStep ? t('auth.signupCta') : t('common.next')}
              </button>
            </div>
          </form>

          <p className="auth-alt">
            {t(mode === 'login' ? 'auth.noAccount' : 'auth.hasAccount')}
            <button type="button" className="auth-alt-link" onClick={() => switchTo(mode === 'login' ? 'signup' : 'login')}>
              {t(mode === 'login' ? 'auth.toSignup' : 'auth.toLogin')}
            </button>
          </p>

          <p className="auth-legal">{t('auth.legal')}</p>
        </section>
      </div>
    </main>
  );
}
