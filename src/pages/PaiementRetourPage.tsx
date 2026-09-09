import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useI18n } from '../i18n';
import { ROUTES } from '../routes';

/**
 * Page de retour NotchPay (agrégateur Orange Money / MTN MoMo).
 * NotchPay renvoie l'utilisateur avec ?reference=…&status=complete|failed|canceled|pending
 * Aucun appel réseau ici : l'état affiché vient de l'URL, la confirmation
 * définitive reste celle du webhook côté serveur.
 */
export default function PaiementRetourPage() {
  const [params] = useSearchParams();
  const { t } = useI18n();

  const reference = params.get('reference') ?? params.get('trxref') ?? '';
  const orderRef = params.get('order') ?? '';
  const pin = params.get('pin') ?? '';
  const status = (params.get('status') ?? 'pending').toLowerCase();

  const isSuccess = status === 'complete' || status === 'completed' || status === 'success';
  const isFailed = status === 'failed' || status === 'error';
  const isCanceled = status === 'canceled' || status === 'cancelled';

  return (
    <>
      <Navbar variant="client" />
      <main className="page-body">
        <div className="container-xs">
          <div className="confirm-block">
            {isSuccess && (
              <span className="confirm-check"><CheckCircle2 size={38} strokeWidth={1.8} /></span>
            )}
            {(isFailed || isCanceled) && (
              <span className="state-icon state-icon-error"><XCircle size={30} strokeWidth={1.8} /></span>
            )}
            {!isSuccess && !isFailed && !isCanceled && (
              <span className="state-icon"><Loader2 size={30} strokeWidth={1.8} className="anim-fade" /></span>
            )}

            <h1 className="confirm-title">
              {isSuccess ? t('pay.successTitle')
                : isFailed ? t('pay.failedTitle')
                : isCanceled ? t('pay.canceledTitle')
                : t('pay.returnTitle')}
            </h1>

            <p className="state-text">
              {isSuccess ? t('pay.successText')
                : (isFailed || isCanceled) ? t('pay.failedText')
                : t('pay.pendingText')}
            </p>

            {reference && (
              <p className="confirm-ref">{t('pay.reference')} · {reference}</p>
            )}

            {isSuccess && pin && (
              <div className="pin-box">
                <p className="pin-box-label">PIN</p>
                <p className="pin-code">{pin}</p>
              </div>
            )}

            <div className="state-actions">
              {isSuccess ? (
                <Link className="btn btn-primary" to={orderRef ? ROUTES.trackingOrder(orderRef) : ROUTES.tracking}>
                  {t('pay.trackOrder')}
                </Link>
              ) : (
                <Link className="btn btn-primary" to={ROUTES.catalogue}>{t('common.seeCatalogue')}</Link>
              )}
              <Link className="btn btn-outline" to={ROUTES.home}>{t('common.back')}</Link>
            </div>

            <p className="pay-provider-note">
              <ShieldCheck size={14} strokeWidth={1.8} /> NotchPay · Orange Money · MTN MoMo
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
