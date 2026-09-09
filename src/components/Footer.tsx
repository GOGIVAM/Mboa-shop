import { Link } from 'react-router-dom';
import { Store, Bike, Shield, Mail, MapPin } from 'lucide-react';
import { useI18n } from '../i18n';
import { ROUTES, CATEGORY_SLUGS } from '../routes';
import BrandLogo from './BrandLogo';
import { OrangeMoneyMark, MtnMomoMark, CardMark, CashMark } from './PaymentLogos';

export default function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <BrandLogo size={40} />            <p className="footer-brand-desc">{t('footer.desc')}</p>
          </div>

          <div>
            <p className="footer-col-title">{t('footer.buyers')}</p>
            <div className="footer-links">
              <Link to={ROUTES.catalogue} className="footer-link">{t('nav.catalogue')}</Link>
              <Link to={ROUTES.category(CATEGORY_SLUGS.friperie)} className="footer-link">{t('nav.friperie')}</Link>
              <Link to={ROUTES.category(CATEGORY_SLUGS.marques)} className="footer-link">{t('nav.marques')}</Link>
              <Link to={ROUTES.tracking} className="footer-link">{t('nav.suivi')}</Link>
              <Link to={ROUTES.contact} className="footer-link">{t('nav.contact')}</Link>
              <Link to={ROUTES.sellerSignup} className="footer-link">{t('nav.becomeSeller')}</Link>
            </div>
          </div>

          <div>
            <p className="footer-col-title">{t('footer.pro')}</p>
            <div className="footer-links">
              <Link to={ROUTES.seller} className="footer-link"><Store size={16} strokeWidth={1.8} />{t('footer.seller')}</Link>
              <Link to={ROUTES.courier} className="footer-link"><Bike size={16} strokeWidth={1.8} />{t('footer.courier')}</Link>
              <Link to={ROUTES.admin} className="footer-link"><Shield size={16} strokeWidth={1.8} />{t('footer.admin')}</Link>
            </div>
          </div>

          <div>
            <p className="footer-col-title">{t('footer.contact')}</p>
            <div className="footer-contact">
              <span><Mail size={15} strokeWidth={1.8} /> contact@mboa.shop</span>
              <span><MapPin size={15} strokeWidth={1.8} /> {t('footer.cities')}</span>
            </div>
            <p className="footer-col-title footer-col-title-spaced">{t('footer.payment')}</p>
            <div className="footer-pay">
              <span className="pay-icon"><OrangeMoneyMark size={34} /></span>
              <span className="pay-icon"><MtnMomoMark size={34} /></span>
              <span className="pay-icon"><CardMark size={34} /></span>
              <span className="pay-icon"><CashMark size={34} /></span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>{t('footer.rights', { year })}</span>
          <span className="footer-legal">
            <a href="#legal">{t('footer.legal')}</a>
            <a href="#cgv">{t('footer.cgv')}</a>
            <a href="#privacy">{t('footer.privacy')}</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
