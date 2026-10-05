import type { MouseEvent, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Props {
  hash: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
}

const HASH_ROUTER = import.meta.env.VITE_ROUTER === 'hash';

/**
 * Link to a homepage section. With a hash router the URL hash belongs to the route, so the
 * target travels in location state and Layout scrolls to it after the page renders.
 */
export function HashLink({ hash, children, className, onNavigate }: Props) {
  const loc = useLocation();
  const onHome = loc.pathname === '/';
  const same = HASH_ROUTER ? false : onHome && loc.hash === `#${hash}`;
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.();
    if (same || (HASH_ROUTER && onHome)) {
      requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
      if (same) e.preventDefault();
    }
  };
  return (
    <Link
      className={className}
      to={HASH_ROUTER ? '/' : { pathname: '/', hash: `#${hash}` }}
      state={HASH_ROUTER ? { scrollTo: hash } : undefined}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
