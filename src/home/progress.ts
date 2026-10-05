import { useScroll, useTransform, type MotionValue } from 'motion/react';
import type { RefObject } from 'react';

/** 0 when a pinned section's top reaches the viewport top, 1 when its bottom reaches the viewport bottom. */
export function useSectionProgress(ref: RefObject<HTMLElement | null>) {
  return useScroll({ target: ref, offset: ['start start', 'end end'] }).scrollYProgress;
}

/** Scroll to a point inside a pinned section, as a fraction of its scroll travel. */
export function scrollToProgress(el: HTMLElement | null, fraction: number) {
  if (!el) return;
  const top = window.scrollY + el.getBoundingClientRect().top;
  const travel = el.offsetHeight - window.innerHeight;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: top + travel * fraction, behavior: reduced ? 'auto' : 'smooth' });
}

/**
 * Zoom towards a focal point of an image inside a fixed frame.
 * `focusX`/`focusY` are 0..1 across the image; the point is pulled to the frame centre as it scales.
 */
export function useZoom(progress: MotionValue<number>, keys: number[], scale: number[], focusX: number[], focusY: number[]) {
  const s = useTransform(progress, keys, scale);
  const fx = useTransform(progress, keys, focusX);
  const fy = useTransform(progress, keys, focusY);
  const x = useTransform([s, fx], ([sv, f]: number[]) => `${-(f - 0.5) * 100 * (sv - 1)}%`);
  const y = useTransform([s, fy], ([sv, f]: number[]) => `${-(f - 0.5) * 100 * (sv - 1)}%`);
  return { scale: s, x, y };
}

/** Opacity keyframes for item `i` of `n` sharing one progress value, holding fully visible at the ends. */
export function bandKeys(i: number, n: number, edge = 0.035) {
  const a = i / n;
  const b = (i + 1) / n;
  const first = i === 0;
  const last = i === n - 1;
  return {
    // Motion runs these on the browser's scroll timeline, which only accepts offsets inside 0..1.
    keys: [a - edge, a + edge, b - edge, b + edge].map((k) => Math.min(1, Math.max(0, k))),
    opacity: [first ? 1 : 0, 1, 1, last ? 1 : 0],
  };
}
