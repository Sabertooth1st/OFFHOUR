import { createElement, useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import { useReducedMotion } from '../state/hooks';

interface Props {
  as?: ElementType;
  className?: string;
  delay?: number;
  children: ReactNode;
  id?: string;
}

/**
 * One-shot entrance (12-20px rise + fade). Anything already above the viewport is revealed
 * immediately, so fast scrolling or anchor jumps never leave content hidden.
 */
export function Reveal({ as = 'div', className = '', delay = 0, children, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -4% 0px', threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return createElement(
    as,
    {
      ref,
      className: `reveal${seen || reduced ? ' is-in' : ''} ${className}`.trim(),
      style: delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined,
      ...rest,
    },
    children,
  );
}
