import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@phosphor-icons/react/dist/csr/X';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';

export type OverlayVariant = 'drawer' | 'sheet' | 'dialog' | 'lightbox' | 'menu';

interface Props {
  variant: OverlayVariant;
  label: string;
  shown: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Shared frame for the bag, menu, search, info, look and fabric overlays.
 * The page behind is made inert by UiProvider; this handles focus entry, the Tab loop and Escape.
 */
export function Overlay({ variant, label, shown, onClose, children }: Props) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shown) return;
    const el = panel.current;
    if (!el) return;
    const target = el.querySelector<HTMLElement>('[data-autofocus]') ?? el.querySelector<HTMLElement>(FOCUSABLE) ?? el;
    target.focus({ preventScroll: true });
  }, [shown]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;
    const nodes = Array.from(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
      (n) => n.offsetParent !== null || n === document.activeElement,
    );
    if (!nodes.length) {
      e.preventDefault();
      return;
    }
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panel.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return createPortal(
    <div className={`overlay overlay--${variant}${shown ? ' is-shown' : ''}`} onKeyDown={onKeyDown}>
      <div className="overlay__scrim" onClick={onClose} aria-hidden="true" />
      <div ref={panel} className="overlay__panel" role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function PanelHeader({ title, onClose, count }: { title: string; onClose: () => void; count?: string }) {
  return (
    <header className="panel__head">
      <h2 className="panel__title">
        {title}
        {count ? <span className="panel__count">{count}</span> : null}
      </h2>
      <button type="button" className="icon-btn" onClick={onClose} aria-label={`Close ${title.toLowerCase()}`}>
        <X size={22} weight="regular" aria-hidden="true" />
      </button>
    </header>
  );
}
