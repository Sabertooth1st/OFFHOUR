import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export type InfoTopic = 'size' | 'care' | 'delivery' | 'contact';

export type OverlayState =
  | { kind: 'bag' }
  | { kind: 'menu' }
  | { kind: 'search' }
  | { kind: 'info'; topic: InfoTopic }
  | { kind: 'fabric'; slug: string };

export const EXIT_MS = 300;

interface UiApi {
  overlay: OverlayState | null;
  shown: boolean;
  open: (o: OverlayState) => void;
  close: (opts?: { restoreFocus?: boolean }) => void;
  message: string;
  announce: (msg: string) => void;
}

const UiContext = createContext<UiApi | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<OverlayState | null>(null);
  const [shown, setShown] = useState(false);
  const [message, setMessage] = useState('');
  const opener = useRef<HTMLElement | null>(null);
  const exitTimer = useRef<number | undefined>(undefined);
  const raf = useRef<number | undefined>(undefined);
  const active = useRef(false);

  const lockPage = useCallback((on: boolean) => {
    document.getElementById('root')?.toggleAttribute('inert', on);
    document.documentElement.classList.toggle('is-locked', on);
  }, []);

  const open = useCallback(
    (o: OverlayState) => {
      window.clearTimeout(exitTimer.current);
      if (!active.current) {
        opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        active.current = true;
        lockPage(true);
      }
      setOverlay(o);
      cancelAnimationFrame(raf.current ?? 0);
      raf.current = requestAnimationFrame(() => {
        raf.current = requestAnimationFrame(() => setShown(true));
      });
    },
    [lockPage],
  );

  const close = useCallback(
    (opts?: { restoreFocus?: boolean }) => {
      if (!active.current) return;
      active.current = false;
      cancelAnimationFrame(raf.current ?? 0);
      setShown(false);
      lockPage(false);
      const target = opener.current;
      opener.current = null;
      if (opts?.restoreFocus !== false) {
        if (target && document.contains(target)) target.focus({ preventScroll: true });
        else document.getElementById('main')?.focus({ preventScroll: true });
      }
      window.clearTimeout(exitTimer.current);
      exitTimer.current = window.setTimeout(() => setOverlay(null), EXIT_MS);
    },
    [lockPage],
  );

  const announce = useCallback((msg: string) => {
    setMessage('');
    window.setTimeout(() => setMessage(msg), 40);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(exitTimer.current);
      cancelAnimationFrame(raf.current ?? 0);
    },
    [],
  );

  const api = useMemo(() => ({ overlay, shown, open, close, message, announce }), [overlay, shown, open, close, message, announce]);
  return <UiContext.Provider value={api}>{children}</UiContext.Provider>;
}

export function useUi(): UiApi {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUi outside UiProvider');
  return ctx;
}
