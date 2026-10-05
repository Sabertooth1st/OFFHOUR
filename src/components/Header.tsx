import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useBag } from '../state/bag';
import { useUi } from '../state/ui';
import { HashLink } from './HashLink';

export const HEADER_H = 60;

export function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const { count } = useBag();
  const { open } = useUi();
  const [solid, setSolid] = useState(!isHome);

  // Over the campaign image until the hero leaves, then a compact chalk bar.
  useEffect(() => {
    if (!isHome) {
      setSolid(true);
      return;
    }
    const hero = document.getElementById('hero');
    if (!hero || typeof IntersectionObserver === 'undefined') {
      setSolid(true);
      return;
    }
    setSolid(false);
    const io = new IntersectionObserver(([entry]) => setSolid(!entry.isIntersecting), {
      rootMargin: `-${HEADER_H}px 0px 0px 0px`,
    });
    io.observe(hero);
    return () => io.disconnect();
  }, [isHome]);

  return (
    <header className={`site-header ${solid ? 'is-solid' : 'is-over'}`}>
      <div className="site-header__inner">
        <Link to="/" className="site-header__logo" aria-label="OFFHOUR, home">
          OFFHOUR
        </Link>

        <nav className="site-header__nav" aria-label="Primary">
          <NavLink to="/shop" end={false}>
            Shop
          </NavLink>
          <HashLink hash="lookbook">Lookbook</HashLink>
          <HashLink hash="about">About</HashLink>
        </nav>

        <div className="site-header__actions">
          <button type="button" className="hdr-btn hdr-btn--search" onClick={() => open({ kind: 'search' })}>
            Search
          </button>
          <button type="button" className="hdr-btn" onClick={() => open({ kind: 'bag' })} aria-label={`Bag, ${count} items`}>
            Bag ({count})
          </button>
          <button type="button" className="hdr-btn hdr-btn--menu" onClick={() => open({ kind: 'menu' })}>
            Menu
          </button>
        </div>
      </div>
    </header>
  );
}
