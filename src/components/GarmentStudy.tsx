import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'motion/react';
import { bySlug } from '../data/catalogue';
import type { ImageRef } from '../data/images';
import { useMediaQuery, useReducedMotion } from '../state/hooks';
import { Img } from './Img';
import { HEADER_H } from './Header';
import { ArrowLeft } from '@phosphor-icons/react/dist/csr/ArrowLeft';
import { ArrowRight } from '@phosphor-icons/react/dist/csr/ArrowRight';

interface StudyView {
  id: 'fabric' | 'garment' | 'body';
  label: string;
  note: string;
  title: string;
  image: ImageRef;
  /** Scroll-progress keyframes and matching opacities (pinned mode), plus where a click jumps to. */
  keys: number[];
  values: number[];
  /** Notes change in sequence rather than cross-fading, so two sentences never overlap. */
  noteKeys: number[];
  noteValues: number[];
  jump: number;
}

function useStudyViews(): StudyView[] {
  const jacket = bySlug('form-shell-jacket')!;
  return [
    {
      id: 'fabric',
      label: 'Fabric',
      title: 'Surface',
      note: 'A dense, matte weave in muted oxblood with a soft sheen where the light lands.',
      image: jacket.fabric ?? jacket.detail,
      keys: [0, 0.26, 0.4],
      values: [1, 1, 0],
      noteKeys: [0, 0.24, 0.32],
      noteValues: [1, 1, 0],
      jump: 0.12,
    },
    {
      id: 'garment',
      label: 'Garment',
      title: 'Construction',
      note: 'A cropped shell with a stand collar, a central zip and two large front pockets.',
      image: jacket.garment,
      keys: [0.26, 0.4, 0.6, 0.74],
      values: [0, 1, 1, 0],
      noteKeys: [0.34, 0.42, 0.58, 0.66],
      noteValues: [0, 1, 1, 0],
      jump: 0.5,
    },
    {
      id: 'body',
      label: 'On body',
      title: 'Fit',
      note: 'Boxy through the body with room in the shoulder, cut to sit over a knit.',
      image: jacket.onBody,
      keys: [0.6, 0.74, 1],
      values: [0, 1, 1],
      noteKeys: [0.68, 0.76, 1],
      noteValues: [0, 1, 1],
      jump: 0.9,
    },
  ];
}

function Controls({ views, active, onPick }: { views: StudyView[]; active: number; onPick: (i: number) => void }) {
  return (
    <div className="seg seg--dark" role="group" aria-label="Garment study views">
      {views.map((v, i) => (
        <button key={v.id} type="button" aria-pressed={active === i} onClick={() => onPick(i)}>
          {v.label}
        </button>
      ))}
    </div>
  );
}

function Layer({ progress, view, children }: { progress: MotionValue<number>; view: StudyView; children: React.ReactNode }) {
  const opacity = useTransform(progress, view.keys, view.values);
  const scale = useTransform(progress, [view.keys[0], view.keys[1]], [1.035, 1]);
  return (
    <motion.div className="study__layer" style={{ opacity, scale }}>
      {children}
    </motion.div>
  );
}

function NoteLayer({ progress, view }: { progress: MotionValue<number>; view: StudyView }) {
  const ys = view.noteValues.map((v, i) => (v === 0 ? (i === 0 ? 12 : -12) : 0));
  const opacity = useTransform(progress, view.noteKeys, view.noteValues);
  const y = useTransform(progress, view.noteKeys, ys);
  return (
    <motion.div className="study__note" style={{ opacity, y }}>
      <h3>{view.title}</h3>
      <p>{view.note}</p>
    </motion.div>
  );
}

/** Desktop: one short pinned section, view driven by scroll position in both directions. */
function Pinned({ views }: { views: StudyView[] }) {
  const outer = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollYProgress: p } = useScroll({ target: outer, offset: [`start ${HEADER_H}px`, 'end end'] });

  useMotionValueEvent(p, 'change', (v) => {
    const i = v < 0.33 ? 0 : v < 0.67 ? 1 : 2;
    setActive((a) => (a === i ? a : i));
  });

  const goTo = (i: number) => {
    const el = outer.current;
    if (!el) return;
    const start = window.scrollY + el.getBoundingClientRect().top - HEADER_H;
    const dist = el.offsetHeight - (window.innerHeight - HEADER_H);
    window.scrollTo({ top: start + dist * views[i].jump, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <div ref={outer} className="study__track">
      <div className="study__sticky">
        <div className="shell study__grid">
          <div className="study__copy">
            <h2 className="display display--md">Inside the garment.</h2>
            <Controls views={views} active={active} onPick={goTo} />
            <motion.span className="study__bar" style={{ scaleX: p }} aria-hidden="true" />
            <div className="study__notes" aria-live="polite">
              {views.map((v) => (
                <NoteLayer key={v.id} progress={p} view={v} />
              ))}
            </div>
          </div>
          <div className="study__stage">
            {views.map((v) => (
              <Layer key={v.id} progress={p} view={v}>
                <Img image={v.image} sizes="(min-width: 1100px) 40vw, 50vw" />
              </Layer>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Touch, narrow and reduced-motion: no pinning, an explicit gallery with previous and next. */
function Gallery({ views }: { views: StudyView[] }) {
  const [active, setActive] = useState(0);
  const go = (n: number) => setActive((n + views.length) % views.length);
  const v = views[active];
  return (
    <div className="shell study__gallery">
      <h2 className="display display--md">Inside the garment.</h2>
      <div className="study__stage study__stage--static">
        {views.map((view, i) => (
          <div key={view.id} className={`study__layer study__layer--fade${i === active ? ' is-active' : ''}`} aria-hidden={i !== active}>
            <Img image={view.image} sizes="(min-width: 700px) 60vw, 100vw" />
          </div>
        ))}
      </div>
      <div className="study__gallery-ui">
        <Controls views={views} active={active} onPick={setActive} />
        <div className="study__arrows">
          <button type="button" className="icon-btn icon-btn--on-dark" onClick={() => go(active - 1)} aria-label="Previous view">
            <ArrowLeft size={22} aria-hidden="true" />
          </button>
          <button type="button" className="icon-btn icon-btn--on-dark" onClick={() => go(active + 1)} aria-label="Next view">
            <ArrowRight size={22} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="study__note study__note--static" aria-live="polite">
        <h3>{v.title}</h3>
        <p>{v.note}</p>
      </div>
    </div>
  );
}

export function GarmentStudy() {
  const views = useStudyViews();
  const wide = useMediaQuery('(min-width: 900px) and (min-height: 560px)');
  const reduced = useReducedMotion();
  return (
    <section className="study" id="study" aria-label="Garment study">
      {wide && !reduced ? <Pinned views={views} /> : <Gallery views={views} />}
    </section>
  );
}
