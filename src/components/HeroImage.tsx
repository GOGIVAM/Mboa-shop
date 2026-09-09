import { useState } from 'react';

interface HeroImageProps {
  src: string;
  className?: string;
}

/**
 * Image de bandeau avec repli sur l'aplat de la charte si le CDN ne répond pas.
 */
export default function HeroImage({ src, className = '' }: HeroImageProps) {
  const [broken, setBroken] = useState(false);

  if (broken) return <span className="hero-media-placeholder" aria-hidden="true" />;

  return (
    <img
      className={className}
      src={src}
      alt=""
      aria-hidden="true"
      onError={() => setBroken(true)}
    />
  );
}
