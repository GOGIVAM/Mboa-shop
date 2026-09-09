import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  /** Valeur finale. */
  to: number;
  /** Décimales conservées (0 pour un entier). */
  decimals?: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
}

/**
 * Compteur qui s'incrémente quand l'élément entre dans le viewport.
 * Inerte si l'utilisateur a demandé une réduction des animations.
 */
export default function CountUp({
  to, decimals = 0, suffix = '', prefix = '', durationMs = 1400,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [value, setValue] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to);
      return;
    }

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / durationMs);
        // Sortie douce : rapide au début, freine à l'arrivée.
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(to * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !done.current) {
          done.current = true;
          run();
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });

    io.observe(el);
    return () => io.disconnect();
  }, [to, durationMs]);

  const shown = decimals > 0
    ? value.toFixed(decimals)
    : new Intl.NumberFormat('fr-FR').format(Math.round(value));

  return <span ref={ref}>{prefix}{shown}{suffix}</span>;
}
