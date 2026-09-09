import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CataloguePage from './pages/CataloguePage';
import ProductPage from './pages/ProductPage';
import PanierPage from './pages/PanierPage';
import ContactPage from './pages/ContactPage';
import AuthPage from './pages/AuthPage';
import SuiviClientPage from './pages/SuiviClientPage';
import VendeurPage from './pages/VendeurPage';
import InscriptionVendeurPage from './pages/InscriptionVendeurPage';
import LivreurPage from './pages/LivreurPage';
import AdminPage from './pages/AdminPage';
import PaiementRetourPage from './pages/PaiementRetourPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      {/* Boutique */}
      <Route path="/" element={<HomePage />} />
      <Route path="/accueil" element={<Navigate to="/" replace />} />
      <Route path="/catalogue" element={<CataloguePage />} />
      <Route path="/shop" element={<Navigate to="/catalogue" replace />} />
      <Route path="/produit/:id" element={<ProductPage />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/panier" element={<PanierPage />} />
      <Route path="/cart" element={<Navigate to="/panier" replace />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Compte */}
      <Route path="/connexion" element={<AuthPage initialMode="login" />} />
      <Route path="/inscription" element={<AuthPage initialMode="signup" />} />
      <Route path="/login" element={<Navigate to="/connexion" replace />} />
      <Route path="/signup" element={<Navigate to="/inscription" replace />} />

      {/* Commande & paiement */}
      <Route path="/suivi" element={<SuiviClientPage />} />
      <Route path="/tracking" element={<Navigate to="/suivi" replace />} />
      <Route path="/paiement/retour" element={<PaiementRetourPage />} />
      <Route path="/payment/callback" element={<Navigate to="/paiement/retour" replace />} />

      {/* Vendeur */}
      <Route path="/inscription-vendeur" element={<InscriptionVendeurPage />} />
      <Route path="/vendeur" element={<VendeurPage />} />

      {/* Livreur & administration */}
      <Route path="/livreur" element={<LivreurPage />} />
      <Route path="/admin" element={<AdminPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
