import { useEffect, useRef } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { OverlayHost } from './components/OverlayHost';
import { BagProvider } from './state/bag';
import { UiProvider, useUi } from './state/ui';

function Shell() {
  const { pathname, key, state } = useLocation();
  const { message } = useUi();
  const first = useRef(true);
  const isHome = pathname === '/';

  // Move focus to the new page on client-side navigation, without scrolling.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname]);

  // Section links under the hash router pass their target in location state.
  useEffect(() => {
    const target = (state as { scrollTo?: string } | null)?.scrollTo;
    if (!target) return;
    const id = requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView());
    return () => cancelAnimationFrame(id);
  }, [key, state]);

  return (
    <>
      <div id="root-inner" className={isHome ? 'is-home' : 'is-inner'}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1} key={pathname} className="page">
          <Outlet />
        </main>
        <Footer />
      </div>
      <OverlayHost />
      <div className="sr-only" role="status" aria-live="polite">
        {message}
      </div>
      <ScrollRestoration />
    </>
  );
}

export default function Layout() {
  return (
    <BagProvider>
      <UiProvider>
        <Shell />
      </UiProvider>
    </BagProvider>
  );
}
