import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useI18n, TKey } from '../i18n';
import { useReveal } from '../hooks/useReveal';

interface Form { name: string; email: string; subject: string; message: string; }

const EMPTY: Form = { name: '', email: '', subject: '', message: '' };

function validate(field: keyof Form, value: string): TKey | null {
  const v = value.trim();
  if (!v) return 'valid.required';
  if (field === 'name') return v.length < 3 ? 'valid.nameShort' : null;
  if (field === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : 'valid.email';
  if (field === 'message') return v.length < 20 ? 'valid.descShort' : null;
  return null;
}

export default function ContactPage() {
  const { t } = useI18n();
  const [form, setForm] = useState<Form>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof Form, true>>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useReveal([sent]);

  const errorFor = (field: keyof Form) => (touched[field] ? validate(field, form[field]) : null);
  const set = (field: keyof Form) => (value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });
    const valid = (Object.keys(form) as (keyof Form)[]).every(f => !validate(f, form[f]));
    if (!valid) return;

    setSending(true);
    // Branchez ici votre route de contact : POST /api/contact
    window.setTimeout(() => { setSending(false); setSent(true); }, 900);
  };

  const field = (
    name: keyof Form,
    label: TKey,
    extra?: { type?: string; area?: boolean; placeholder?: string; full?: boolean },
  ) => (
    <div className={`ul-field${extra?.full ? ' form-col-full' : ''}${errorFor(name) ? ' is-invalid' : ''}`}>
      <label className="ul-label" htmlFor={`ct-${name}`}>{t(label)}</label>
      {extra?.area ? (
        <textarea
          id={`ct-${name}`} className="ul-input ul-textarea" value={form[name]}
          placeholder={extra.placeholder}
          onChange={e => set(name)(e.target.value)}
          onBlur={() => setTouched(p => ({ ...p, [name]: true }))}
        />
      ) : (
        <input
          id={`ct-${name}`} className="ul-input" type={extra?.type ?? 'text'} value={form[name]}
          placeholder={extra?.placeholder}
          onChange={e => set(name)(e.target.value)}
          onBlur={() => setTouched(p => ({ ...p, [name]: true }))}
        />
      )}
      {errorFor(name) && (
        <span className="field-error"><AlertCircle size={13} strokeWidth={2} />{t(errorFor(name)!)}</span>
      )}
    </div>
  );

  return (
    <>
      <Navbar variant="client" showCategories={false} />

      <main className="page-body no-cats">
        <section className="contact-head">
          <div className="container-sm">
            <h1 className="contact-title">{t('contact.title')}</h1>
            <p className="contact-sub">{t('contact.sub')}</p>
          </div>
        </section>

        <div className="container contact-wrap">
          <div className="contact-card" data-reveal>
            <aside className="contact-info">
              <h2 className="contact-info-title">{t('contact.infoTitle')}</h2>
              <p className="contact-info-text">{t('contact.infoText')}</p>

              <ul className="contact-list">
                <li className="contact-item">
                  <span className="contact-item-ico"><Phone size={17} strokeWidth={1.9} /></span>
                  <span className="contact-item-body">
                    <a href="tel:+237677000000">+237 6 77 00 00 00</a>
                    <a href="tel:+237699000000">+237 6 99 00 00 00</a>
                  </span>
                </li>
                <li className="contact-item">
                  <span className="contact-item-ico"><Mail size={17} strokeWidth={1.9} /></span>
                  <span className="contact-item-body">
                    <a href="mailto:contact@mboa.shop">contact@mboa.shop</a>
                  </span>
                </li>
                <li className="contact-item">
                  <span className="contact-item-ico"><MapPin size={17} strokeWidth={1.9} /></span>
                  <span className="contact-item-body">
                    <span>{t('contact.address')}</span>
                  </span>
                </li>
                <li className="contact-item">
                  <span className="contact-item-ico"><Clock size={17} strokeWidth={1.9} /></span>
                  <span className="contact-item-body">
                    <span>{t('contact.hours')}</span>
                    <span>{t('contact.hoursSat')}</span>
                  </span>
                </li>
              </ul>

              <span className="contact-orb" aria-hidden="true" />
            </aside>

            <div className="contact-form-side">
              {sent ? (
                <div className="confirm-block">
                  <span className="confirm-check"><CheckCircle2 size={38} strokeWidth={1.8} /></span>
                  <p className="confirm-title">{t('contact.sentTitle')}</p>
                  <p className="state-text">{t('contact.sentText')}</p>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => { setSent(false); setForm(EMPTY); setTouched({}); }}
                  >
                    {t('contact.sendAnother')}
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={submit} noValidate>
                  <div className="form-grid">
                    {field('name', 'contact.name', { placeholder: 'Awa Mbarga' })}
                    {field('email', 'contact.email', { type: 'email', placeholder: 'awa@exemple.cm' })}
                    {field('subject', 'contact.subject', { full: true, placeholder: t('contact.subjectHint') })}
                    {field('message', 'contact.message', { area: true, full: true, placeholder: t('contact.messageHint') })}
                  </div>

                  <button type="submit" className={`btn btn-primary${sending ? ' btn-loading' : ''}`} disabled={sending}>
                    <Send size={16} strokeWidth={2} />
                    {t('contact.send')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
