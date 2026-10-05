import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { useReducedMotion } from '../state/hooks';
import { CHAPTERS, chapterTime, clockAt, FADE, FilmContext, filmPoint, scrollFilm, STARTS, TOTAL, useChapter, useFilm } from './chapters';
import { SceneAngles } from './SceneAngles';
import { SceneClose } from './SceneClose';
import { SceneDive } from './SceneDive';
import { SceneLabel } from './SceneLabel';
import { SceneOpen } from './SceneOpen';
import { ScenePieces } from './ScenePieces';

const SCENES = [SceneOpen, ScenePieces, SceneAngles, SceneLabel, SceneDive, SceneClose];

/** One chapter layer on the stage. Focus landing inside a chapter that is not on screen scrolls the film to it. */
function Layer({ i, children }: { i: number; children: ReactNode }) {
  const { current, jump } = useFilm();
  const { opacity, copy } = useChapter(i);
  const c = CHAPTERS[i];
  return (
    <motion.section
      className={`film__layer film__layer--${c.id}${current === i ? ' is-current' : ''}`}
      style={{ opacity, '--copy': copy } as never}
      aria-labelledby={`${c.id}-title`}
      onFocusCapture={() => {
        if (current !== i) jump(filmPoint(i, 0) + (i === 0 ? 0 : (FADE * 1.2) / TOTAL), true);
      }}
    >
      {children}
    </motion.section>
  );
}

function Clock() {
  const { progress } = useFilm();
  const time = useTransform(progress, clockAt);
  return (
    <p className="film__clock">
      <span className="film__clock-label">Off hours</span>
      <motion.span className="film__clock-time">{time}</motion.span>
    </p>
  );
}

function Index() {
  const { current, jump } = useFilm();
  return (
    <nav className="film__index" aria-label="Chapters">
      <ol>
        {CHAPTERS.map((c, i) => (
          <li key={c.id}>
            <button
              type="button"
              aria-current={current === i ? 'step' : undefined}
              onClick={() => jump(i === 0 ? 0 : filmPoint(i, 0) + (FADE * 1.2) / TOTAL)}
            >
              <span className="film__index-time">{chapterTime(i)}</span>
              <span className="film__index-name">{c.name}</span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Scroll-driven film: a pinned stage whose chapters dissolve into each other, with a running clock. */
export function Film() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress: progress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [current, setCurrent] = useState(0);
  const [ink, setInk] = useState<'light' | 'dark'>('light');

  useMotionValueEvent(progress, 'change', (v) => {
    const at = v * TOTAL;
    let i = 0;
    STARTS.forEach((s, k) => {
      if (at >= s) i = k;
    });
    setCurrent((c) => (c === i ? c : i));
  });

  // The fixed header and the clock switch to dark type over the light colour fields.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.ink = ink;
    return () => {
      delete root.dataset.ink;
    };
  }, [ink]);

  const jump = useCallback((point: number, instant?: boolean) => scrollFilm(ref.current, point, instant), []);
  const state = useMemo(() => ({ progress, current, jump, setInk }), [progress, current, jump]);

  if (reduced) {
    return (
      <div id="film" className="film film--static">
        {SCENES.map((Scene, i) => (
          <section key={CHAPTERS[i].id} id={CHAPTERS[i].id} className={`still still--${CHAPTERS[i].id}`} aria-labelledby={`${CHAPTERS[i].id}-title`}>
            <Scene still />
          </section>
        ))}
      </div>
    );
  }

  return (
    <FilmContext.Provider value={state}>
      <div id="film" ref={ref} className="film" data-ink={ink} style={{ '--film-len': TOTAL } as CSSProperties}>
        {CHAPTERS.map((c, i) => (
          // Anchors for the header links and the chapter index, placed just after each dissolve.
          <span
            key={c.id}
            id={c.id}
            className="film__mark"
            data-start={STARTS[i]}
            data-len={c.len}
            style={{ '--at': i === 0 ? 0 : STARTS[i] + FADE * 1.2 } as CSSProperties}
            aria-hidden="true"
          />
        ))}
        <div className="film__stage">
          {SCENES.map((Scene, i) => (
            <Layer key={CHAPTERS[i].id} i={i}>
              <Scene />
            </Layer>
          ))}
          <div className="film__grain" aria-hidden="true" />
          <div className="film__hud">
            <Clock />
            <Index />
          </div>
        </div>
      </div>
    </FilmContext.Provider>
  );
}
