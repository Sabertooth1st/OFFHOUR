import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import { bySlug, COLOURS, type ColourId, type Size } from '../data/catalogue';
import { safeStorage } from './storage';

export interface BagLine {
  slug: string;
  colour: ColourId;
  size: Size;
  qty: number;
}

const KEY = 'offhour.bag.v1';
const MAX_QTY = 9;

type Action =
  | { type: 'add'; line: Omit<BagLine, 'qty'> }
  | { type: 'qty'; key: string; qty: number }
  | { type: 'remove'; key: string }
  | { type: 'replace'; lines: BagLine[] };

export const lineKey = (l: Pick<BagLine, 'slug' | 'colour' | 'size'>) => `${l.slug}|${l.colour}|${l.size}`;

/** Drop anything that no longer matches the catalogue, so a stale bag can never break totals. */
function sanitise(raw: unknown): BagLine[] {
  if (!Array.isArray(raw)) return [];
  const out: BagLine[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const { slug, colour, size, qty } = item as Record<string, unknown>;
    const product = bySlug(typeof slug === 'string' ? slug : undefined);
    if (!product) continue;
    if (typeof colour !== 'string' || !(colour in COLOURS) || !product.colours.includes(colour as ColourId)) continue;
    if (typeof size !== 'string' || !product.sizes.includes(size as Size)) continue;
    const q = Math.round(Number(qty));
    if (!Number.isFinite(q) || q < 1) continue;
    const line = { slug: product.slug, colour: colour as ColourId, size: size as Size, qty: Math.min(q, MAX_QTY) };
    const existing = out.find((l) => lineKey(l) === lineKey(line));
    if (existing) existing.qty = Math.min(existing.qty + line.qty, MAX_QTY);
    else out.push(line);
  }
  return out;
}

function load(): BagLine[] {
  const raw = safeStorage.get(KEY);
  if (!raw) return [];
  try {
    return sanitise(JSON.parse(raw));
  } catch {
    return [];
  }
}

function reducer(state: BagLine[], action: Action): BagLine[] {
  switch (action.type) {
    case 'add': {
      const key = lineKey(action.line);
      const found = state.find((l) => lineKey(l) === key);
      if (found) return state.map((l) => (l === found ? { ...l, qty: Math.min(l.qty + 1, MAX_QTY) } : l));
      return [...state, { ...action.line, qty: 1 }];
    }
    case 'qty':
      return state.map((l) => (lineKey(l) === action.key ? { ...l, qty: Math.max(1, Math.min(action.qty, MAX_QTY)) } : l));
    case 'remove':
      return state.filter((l) => lineKey(l) !== action.key);
    case 'replace':
      return action.lines;
  }
}

interface BagApi {
  lines: BagLine[];
  count: number;
  subtotal: number;
  add: (line: Omit<BagLine, 'qty'>) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
}

const BagContext = createContext<BagApi | null>(null);

export function BagProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    safeStorage.set(KEY, JSON.stringify(lines));
  }, [lines]);

  // Keep several tabs in step.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) dispatch({ type: 'replace', lines: load() });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((line: Omit<BagLine, 'qty'>) => dispatch({ type: 'add', line }), []);
  const setQty = useCallback((key: string, qty: number) => dispatch({ type: 'qty', key, qty }), []);
  const remove = useCallback((key: string) => dispatch({ type: 'remove', key }), []);

  const api = useMemo<BagApi>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.qty * (bySlug(l.slug)?.price ?? 0), 0);
    return { lines, count, subtotal, add, setQty, remove };
  }, [lines, add, setQty, remove]);

  return <BagContext.Provider value={api}>{children}</BagContext.Provider>;
}

export function useBag(): BagApi {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error('useBag outside BagProvider');
  return ctx;
}

export { MAX_QTY };
