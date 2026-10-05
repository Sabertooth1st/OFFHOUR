import { createContext, useContext } from 'react';
import { useTransform, type MotionValue } from 'motion/react';

/**
 * The home page is one film that runs from clocking off at 18:00 to midnight.
 * Each chapter owns a stretch of scroll (in viewport heights); the clock and the
 * chapter index are both read from the same numbers, so they always agree.
 */
export const CHAPTERS = [
  { id: 'hero', name: 'Clocked off', len: 2.4 },
  { id: 'collection', name: 'The pieces', len: 6.6 },
  { id: 'angles', name: 'Turnaround', len: 4 },
  { id: 'about', name: 'The label', len: 2.6 },
  { id: 'details', name: 'Up close', len: 4.6 },
  { id: 'last-light', name: 'Last light', len: 2.2 },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]['id'];

export const TOTAL = CHAPTERS.reduce((n, c) => n + c.len, 0);
/** Scroll position (in viewports) where each chapter starts. */
export const STARTS = CHAPTERS.map((_, i) => CHAPTERS.slice(0, i).reduce((n, c) => n + c.len, 0));
/** Half the length of a cross-dissolve between chapters, in viewports. */
export const FADE = 0.32;

const FROM = 18 * 60;
const TO = 24 * 60;

/** Clock reading for a point in the film, 0..1. */
export function clockAt(p: number) {
  const m = Math.round(FROM + Math.min(1, Math.max(0, p)) * (TO - FROM)) % (24 * 60);
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export const chapterTime = (i: number) => clockAt(STARTS[i] / TOTAL);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Film progress (0..1) for a point inside chapter `i`, as a fraction of that chapter. */
export const filmPoint = (i: number, fraction: number) => (STARTS[i] + fraction * CHAPTERS[i].len) / TOTAL;

/** Scroll the window to a point in the film. */
export function scrollFilm(el: HTMLElement | null, point: number, instant = false) {
  if (!el) return;
  const top = window.scrollY + el.getBoundingClientRect().top;
  const travel = el.offsetHeight - window.innerHeight;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: top + travel * point, behavior: instant || reduced ? 'auto' : 'smooth' });
}

interface FilmState {
  progress: MotionValue<number>;
  current: number;
  jump: (point: number, instant?: boolean) => void;
  setInk: (ink: 'light' | 'dark') => void;
}

/** Props every scene takes: `still` renders the static, reduced-motion version. */
export interface SceneProps {
  still?: boolean;
}

export const FilmContext = createContext<FilmState | null>(null);

export function useFilm() {
  const ctx = useContext(FilmContext);
  if (!ctx) throw new Error('useFilm outside <Film>');
  return ctx;
}

/**
 * Local progress (0..1 across the chapter) and the chapter's opacity, which dissolves
 * into its neighbours at both ends.
 */
export function useChapter(i: number) {
  const { progress } = useFilm();
  const s = STARTS[i] / TOTAL;
  const e = (STARTS[i] + CHAPTERS[i].len) / TOTAL;
  const f = FADE / TOTAL;
  const first = i === 0;
  const last = i === CHAPTERS.length - 1;
  const local = useTransform(progress, [s, e], [0, 1]);
  // Motion runs these on the browser's scroll timeline, which only accepts offsets inside 0..1.
  const keys = [first ? 0 : s - f, first ? 0 : s + f, last ? 1 : e - f, last ? 1 : e + f].map(clamp01);
  const opacity = useTransform(progress, keys, [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  // Words clear out faster than pictures, so two chapters' captions never sit on top of each other.
  const copyKeys = [first ? 0 : s, first ? 0 : s + f, last ? 1 : e - f, last ? 1 : e].map(clamp01);
  const copy = useTransform(progress, copyKeys, [first ? 1 : 0, 1, 1, last ? 1 : 0]);
  return { local, opacity, copy };
}

/**
 * Zoom towards a focal point of a layer. `focusX`/`focusY` are 0..1 across the layer; the point
 * is pulled to the layer centre as it scales.
 */
export function useZoom(progress: MotionValue<number>, keys: number[], scale: number[], focusX: number[], focusY: number[]) {
  const s = useTransform(progress, keys, scale);
  const fx = useTransform(progress, keys, focusX);
  const fy = useTransform(progress, keys, focusY);
  const x = useTransform([s, fx], ([sv, v]: number[]) => `${-(v - 0.5) * 100 * (sv - 1)}%`);
  const y = useTransform([s, fy], ([sv, v]: number[]) => `${-(v - 0.5) * 100 * (sv - 1)}%`);
  return { scale: s, x, y };
}

/** Index of the band `v` (0..1) falls in, out of `n` equal bands. */
export const bandOf = (v: number, n: number) => Math.max(0, Math.min(n - 1, Math.floor(v * n)));
