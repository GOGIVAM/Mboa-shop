import { useEffect, useRef, useState } from 'react';

/**
 * Révélation au scroll : tout élément portant data-reveal reçoit .is-in
 * quand il entre dans le viewport. Inerte si l'utilisateur a demandé
 * une réduction des animations.
 */
export function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll<HTMLElement>('[data-reveal], .letters').forEach(el => el.classList.add('is-in'));
      return;
    }
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in), .letters:not(.is-in)'));
    if (!nodes.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    nodes.forEach(n => io.observe(n));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Verrouille le scroll pendant l'ouverture d'un drawer / modal. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [locked]);
}

/**
 * Parallaxe verticale sur l'élément référencé : alimente --py au scroll
 * via requestAnimationFrame. `factor` = fraction du défilement reportée.
 */
export function useParallax<T extends HTMLElement>(factor = 0.28) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      el.style.setProperty('--py', `${Math.round(-rect.top * factor)}px`);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [factor]);

  return ref;
}

/**
 * Passe à true dès que la page a défilé au-delà de `offset` — sert à compacter
 * la barre de filtres collante et à lui donner son ombre.
 */
export function useStuck(offset = 8) {
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    let frame = 0;
    const update = () => { frame = 0; setStuck(window.scrollY > offset); };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [offset]);
  return stuck;
}
