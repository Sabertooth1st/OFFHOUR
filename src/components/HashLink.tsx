import type { MouseEvent, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Props {
  hash: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
}

/** Link to a homepage section. Re-clicking the current hash still scrolls to it. */
export function HashLink({ hash, children, className, onNavigate }: Props) {
  const loc = useLocation();
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onNavigate?.();
    if (loc.pathname === '/' && loc.hash === `#${hash}`) {
      e.preventDefault();
      requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
    }
  };
  return (
    <Link className={className} to={{ pathname: '/', hash: `#${hash}` }} onClick={onClick}>
      {children}
    </Link>
  );
}
