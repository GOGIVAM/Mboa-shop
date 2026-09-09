import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useI18n } from '../i18n';
import { ROUTES } from '../routes';

export default function NotFoundPage() {
  const { t } = useI18n();
  return (
    <>
      <Navbar variant="client" />
      <main className="page-body">
        <div className="container-xs">
          <div className="state-block">
            <span className="state-icon"><SearchX size={30} strokeWidth={1.8} /></span>
            <h1 className="state-title">{t('notfound.title')}</h1>
            <p className="state-text">{t('notfound.text')}</p>
            <div className="state-actions">
              <Link className="btn btn-primary" to={ROUTES.catalogue}>{t('common.seeCatalogue')}</Link>
              <Link className="btn btn-outline" to={ROUTES.home}>{t('common.back')}</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
