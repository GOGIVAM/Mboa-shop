import { useState } from 'react';

/**
 * Marques de paiement.
 *
 * Les fichiers officiels sont attendus dans `public/assets/`. Si un nom ne
 * correspond pas au vôtre, changez-le UNIQUEMENT dans la table FILES ci-dessous.
 * Tant qu'un fichier est absent, le repère SVG aux couleurs de l'opérateur
 * s'affiche à la place — aucune case vide.
 */
const FILES = {
  om: '/assets/orange-money.png',
  mtn: '/assets/mtn-momo.png',
  card: '/assets/echange.png',
  cash: '/assets/livraison-de-colis.png',
} as const;

interface MarkProps { size?: number; }

/** Image de marque avec repli sur le SVG si le fichier manque. */
function BrandImage({ src, alt, size, fallback }: { src: string; alt: string; size: number; fallback: JSX.Element }) {
  const [broken, setBroken] = useState(!src);
  if (broken) return fallback;
  return (
    <img
      className="pay-img"
      src={src}
      alt={alt}
      height={Math.round((size / 40) * 28)}
      onError={() => setBroken(true)}
    />
  );
}

export function OrangeMoneyMark({ size = 40 }: MarkProps) {
  const h = Math.round((size / 40) * 28);
  return (
    <BrandImage
      src={FILES.om}
      alt="Orange Money"
      size={size}
      fallback={(
        <svg width={size} height={h} viewBox="0 0 40 28" role="img" aria-label="Orange Money">
          <rect width="40" height="28" rx="2" fill="#FF6600" />
          <path d="M11 17.5V11h6.5" stroke="#0F0F0F" strokeWidth="2.6" strokeLinecap="square" fill="none" />
          <path d="M29 10.5V17h-6.5" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="square" fill="none" />
        </svg>
      )}
    />
  );
}

export function MtnMomoMark({ size = 40 }: MarkProps) {
  const h = Math.round((size / 40) * 28);
  return (
    <BrandImage
      src={FILES.mtn}
      alt="MTN Mobile Money"
      size={size}
      fallback={(
        <svg width={size} height={h} viewBox="0 0 40 28" role="img" aria-label="MTN Mobile Money">
          <rect width="40" height="28" rx="2" fill="#FFCC00" />
          <ellipse cx="20" cy="11" rx="11" ry="5.4" fill="#FFFFFF" stroke="#0B4DA2" strokeWidth="1.2" />
          <text x="20" y="13.4" textAnchor="middle" fill="#0B4DA2" fontFamily="Inter, Arial, sans-serif" fontWeight="800" fontSize="6.4">MTN</text>
          <text x="20" y="24" textAnchor="middle" fill="#0F0F0F" fontFamily="Inter, Arial, sans-serif" fontWeight="700" fontSize="5.6">MoMo</text>
        </svg>
      )}
    />
  );
}

export function CardMark({ size = 40 }: MarkProps) {
  const h = Math.round((size / 40) * 28);
  return (
    <BrandImage
      src={FILES.card}
      alt="Visa / Mastercard"
      size={size}
      fallback={(
        <svg width={size} height={h} viewBox="0 0 40 28" role="img" aria-label="Visa / Mastercard">
          <rect width="40" height="28" rx="2" fill="#1A1F71" />
          <text x="20" y="18.5" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, Arial, sans-serif" fontStyle="italic" fontWeight="800" fontSize="10">VISA</text>
        </svg>
      )}
    />
  );
}

export function CashMark({ size = 40 }: MarkProps) {
  const h = Math.round((size / 40) * 28);
  return (
    <BrandImage
      src={FILES.cash}
      alt="Espèces à la livraison"
      size={size}
      fallback={(
        <svg width={size} height={h} viewBox="0 0 40 28" role="img" aria-label="Espèces à la livraison">
          <rect width="40" height="28" rx="2" fill="#2E7D45" />
          <text x="20" y="18.5" textAnchor="middle" fill="#FFFFFF" fontFamily="Inter, Arial, sans-serif" fontStyle="italic" fontWeight="800" fontSize="10">VISA</text>
        </svg>
      )}
    />
  );
}
