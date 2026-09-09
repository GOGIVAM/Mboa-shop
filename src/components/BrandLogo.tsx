import { useState } from 'react';

interface BrandLogoProps {
  /** Libellé de portée affiché après le logo (SHOP, VENDEUR, LIVREUR, ADMIN). */
  scope?: string;
  /** Utilise la variante à encre blanche, pour les barres à fond sombre. */
  onDark?: boolean;
  size?: number;
}

/**
 * Marque MBOA SHOP. Deux fichiers détourés dans public/assets/ :
 * la version d'origine et une version blanche pour les fonds sombres.
 */
const LOGO_SRC = '/assets/logo-mboa-mark.png';
const LOGO_SRC_LIGHT = '/assets/logo-mboa-light.png';

export default function BrandLogo({ scope, onDark = false, size = 30 }: BrandLogoProps) {
  const [broken, setBroken] = useState(false);

  return (
    <span className={`brand${onDark ? ' brand-on-dark' : ''}`}>
      {broken ? (
        <span className="brand-fallback">MBOA</span>
      ) : (
        <img
          className="brand-img"
          src={onDark ? LOGO_SRC_LIGHT : LOGO_SRC}
          alt="MBOA SHOP"
          height={size}
          style={{ height: size }}
          onError={() => setBroken(true)}
        />
      )}
      {scope && <span className="brand-scope">{scope}</span>}
    </span>
  );
}
