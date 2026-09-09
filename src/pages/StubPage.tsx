import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';
import Navbar, { NavVariant } from '../components/Navbar';
import Footer from '../components/Footer';
import { useI18n } from '../i18n';
import { ROUTES } from '../routes';

interface StubPageProps {
  variant: NavVariant;
  title: string;
  note: string;
}

/**
 * Écran d'attente pour les pages non encore refondues (vendeur, livreur,
 * admin, suivi, inscription vendeur). Le CSS de ces pages est déjà présent
 * dans main.css, sections 11 à 15 — seuls les composants restent à écrire.
 */
export default function StubPage({ variant, title, note }: StubPageProps) {
  const { t } = useI18n();
  return (
    <>
      <Navbar variant={variant} />
      <main className="page-body">
        <div className="container-xs">
          <div className="state-block">
            <span className="state-icon"><Construction size={28} strokeWidth={1.7} /></span>
            <h1 className="state-title">{title}</h1>
            <p className="state-text">{note}</p>
            <div className="state-actions">
              <Link className="btn btn-primary" to={ROUTES.catalogue}>{t('common.seeCatalogue')}</Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
