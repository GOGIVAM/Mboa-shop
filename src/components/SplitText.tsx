import { CSSProperties, ReactNode } from 'react';

interface SplitTextProps {
  text: string;
  /** Élément rendu autour des lettres. */
  as?: 'span' | 'h1' | 'h2';
  className?: string;
}

/**
 * Découpe une chaîne en <span> par caractère, chacun portant --i, pour que
 * main.css puisse animer l'entrée lettre par lettre. La classe .letters
 * reçoit .is-in via useReveal().
 */
export default function SplitText({ text, as = 'span', className = '' }: SplitTextProps) {
  const letters: ReactNode[] = Array.from(text).map((char, i) => (
    <span key={`${char}-${i}`} style={{ '--i': i } as CSSProperties} aria-hidden="true">{char}</span>
  ));
  const cls = `letters ${className}`.trim();

  if (as === 'h1') return <h1 className={cls}><span className="sr-only">{text}</span>{letters}</h1>;
  if (as === 'h2') return <h2 className={cls}><span className="sr-only">{text}</span>{letters}</h2>;
  return <span className={cls}><span className="sr-only">{text}</span>{letters}</span>;
}
