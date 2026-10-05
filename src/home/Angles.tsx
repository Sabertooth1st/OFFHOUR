import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'motion/react';
import { Img } from '../components/Img';
import { plate, type ImageRef } from '../data/images';
import { useReducedMotion } from '../state/hooks';
import { bandKeys, scrollToProgress, useSectionProgress } from './progress';

interface View {
  label: string;
  note: string;
  image: ImageRef;
  cutout?: boolean;
}

// The views we have photographs for. A 360-degree turntable replaces this once those frames arrive.
const VIEWS: View[] = [
  { label: 'Front', note: 'Stand collar, one zip, two large pockets.', image: plate('jacket-cutout', 'Form Shell Jacket, front view'), cutout: true },
  { label: 'Worn', note: 'Open over a chalk tee, cut to sit at the hip.', image: plate('jacket-body', 'Model wearing the Form Shell Jacket open over a chalk tee') },
  { label: 'Draped', note: 'The shell holds its shape off the body.', image: plate('jacket-chair', 'Form Shell Jacket draped over a wooden chair in window light') },
  { label: 'Close', note: 'Stitching, zip pull and the weave of the shell.', image: plate('jacket-collar', 'Close view of the stand collar and zip pull') },
];

function Frame({ progress, i, view }: { progress: MotionValue<number>; i: number; view: View }) {
  const n = VIEWS.length;
  const { keys, opacity: o } = bandKeys(i, n, 0.05);
  const opacity = useTransform(progress, keys, o);
  // A slow turn across each view gives the flat photographs depth without inventing new angles.
  const rotateY = useTransform(progress, [i / n, (i + 1) / n], [10, -10]);
  const scale = useTransform(progress, [i / n, (i + 1) / n], [0.96, 1.03]);
  return (
    <motion.figure className={`angles__frame${view.cutout ? ' angles__frame--cutout' : ''}`} style={{ opacity, rotateY, scale }}>
      <Img image={view.image} sizes="(min-width: 900px) 42vw, 86vw" />
    </motion.figure>
  );
}

export function Angles() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const p = useSectionProgress(ref);
  const [active, setActive] = useState(0);
  useMotionValueEvent(p, 'change', (v) => {
    const i = Math.max(0, Math.min(VIEWS.length - 1, Math.floor(v * VIEWS.length)));
    setActive((a) => (a === i ? a : i));
  });

  const heading = (
    <h2 className="display display--lg angles__title" id="angles-title">
      Front, worn, draped, close.
    </h2>
  );

  if (reduced) {
    return (
      <section id="angles" className="angles angles--static shell" aria-labelledby="angles-title">
        {heading}
        <div className="angles__static">
          {VIEWS.map((v) => (
            <figure key={v.label} className={`angles__frame angles__frame--static${v.cutout ? ' angles__frame--cutout' : ''}`}>
              <Img image={v.image} sizes="(min-width: 900px) 24vw, 90vw" />
              <figcaption>
                <strong>{v.label}</strong> {v.note}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} id="angles" className="angles" aria-labelledby="angles-title">
      <div className="angles__sticky">
        <div className="angles__grid shell">
          <div className="angles__copy">
            {heading}
            <ol className="angles__list">
              {VIEWS.map((v, i) => (
                <li key={v.label}>
                  <button
                    type="button"
                    aria-current={active === i ? 'true' : undefined}
                    onClick={() => scrollToProgress(ref.current, (i + 0.5) / VIEWS.length)}
                  >
                    {v.label}
                  </button>
                </li>
              ))}
            </ol>
            <p className="angles__note" aria-live="polite">
              {VIEWS[active].note}
            </p>
          </div>
          <div className="angles__stage">
            {VIEWS.map((v, i) => (
              <Frame key={v.label} progress={p} i={i} view={v} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
