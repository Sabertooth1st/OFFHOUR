import { useRef, useState } from 'react';
import { motion, useMotionValueEvent, useTransform } from 'motion/react';
import { Img } from '../components/Img';
import { plate } from '../data/images';
import { useReducedMotion } from '../state/hooks';
import { scrollToProgress, useSectionProgress, useZoom } from './progress';

const STEPS = [
  { at: 0, label: 'Jacket', title: 'The Form Shell Jacket.', note: 'Cropped and boxy, with room through the shoulder.' },
  { at: 0.2, label: 'Collar', title: 'Stand collar.', note: 'Stitched close to the edge so it stands on its own.' },
  { at: 0.4, label: 'Zip pull', title: 'Zip pull.', note: 'Matte metal, sized to find without looking.' },
  { at: 0.56, label: 'Zip', title: 'One central zip.', note: 'Running from collar to hem, set into the tape.' },
  { at: 0.74, label: 'Weave', title: 'The weave.', note: 'A dense oxblood twill with a soft, matte surface.' },
];

const IMG = {
  front: plate('jacket-cutout', 'Form Shell Jacket, front view'),
  collar: plate('jacket-collar', 'Stand collar, zip pull and zip of the Form Shell Jacket'),
  fabric: plate('jacket-fabric', 'Close-up of the oxblood twill weave'),
};

/** Pinned dive from the whole jacket into its collar, zip and weave, using real photographs only. */
export function DetailDive() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const p = useSectionProgress(ref);
  const [step, setStep] = useState(0);
  useMotionValueEvent(p, 'change', (v) => {
    let i = 0;
    STEPS.forEach((s, k) => {
      if (v >= s.at) i = k;
    });
    setStep((c) => (c === i ? c : i));
  });

  // Whole jacket, pushing in on the collar before handing over to the collar photograph.
  const frontOpacity = useTransform(p, [0, 0.17, 0.23], [1, 1, 0]);
  const front = useZoom(p, [0, 0.06, 0.23], [1, 1, 2.6], [0.5, 0.5, 0.5], [0.5, 0.5, 0.1]);
  // Collar photograph: settle, then travel down to the zip pull and the teeth.
  const collarOpacity = useTransform(p, [0.17, 0.23, 0.72, 0.78], [0, 1, 1, 0]);
  const collar = useZoom(
    p,
    [0.2, 0.3, 0.44, 0.54, 0.68, 0.78],
    [1.12, 1, 2.1, 2.1, 2.6, 2.8],
    [0.5, 0.5, 0.63, 0.63, 0.62, 0.62],
    [0.4, 0.4, 0.44, 0.44, 0.84, 0.86],
  );
  // Fabric macro.
  const fabricOpacity = useTransform(p, [0.72, 0.78], [0, 1]);
  const fabric = useZoom(p, [0.72, 1], [1.15, 1.7], [0.5, 0.45], [0.5, 0.55]);

  if (reduced) {
    return (
      <section id="details" className="dive dive--static shell" aria-labelledby="dive-title">
        <h2 id="dive-title" className="display display--lg">
          Inside the garment.
        </h2>
        <div className="dive__static">
          {[IMG.front, IMG.collar, IMG.fabric].map((img, i) => (
            <figure key={img.id} className={`dive__static-frame${i === 0 ? ' dive__static-frame--cutout' : ''}`}>
              <Img image={img} sizes="(min-width: 900px) 30vw, 90vw" />
              <figcaption>
                <strong>{STEPS[[0, 1, 4][i]].title}</strong> {STEPS[[0, 1, 4][i]].note}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  const s = STEPS[step];
  return (
    <section ref={ref} id="details" className="dive" aria-labelledby="dive-title">
      <div className="dive__sticky">
        <div className="dive__grid shell">
          <div className="dive__copy">
            <h2 id="dive-title" className="display display--md">
              Inside the garment.
            </h2>
            <ol className="dive__steps">
              {STEPS.map((st, i) => (
                <li key={st.label}>
                  <button
                    type="button"
                    aria-current={step === i ? 'true' : undefined}
                    onClick={() => scrollToProgress(ref.current, Math.min(0.99, st.at + 0.08))}
                  >
                    {st.label}
                  </button>
                </li>
              ))}
            </ol>
            <div className="dive__note" aria-live="polite" key={s.label}>
              <h3>{s.title}</h3>
              <p>{s.note}</p>
            </div>
          </div>
          <div className="dive__stage">
            <motion.div className="dive__layer dive__layer--cutout" style={{ opacity: frontOpacity }}>
              <motion.div className="dive__zoom" style={front}>
                <Img image={IMG.front} sizes="(min-width: 900px) 46vw, 90vw" />
              </motion.div>
            </motion.div>
            <motion.div className="dive__layer" style={{ opacity: collarOpacity }}>
              <motion.div className="dive__zoom" style={collar}>
                <Img image={IMG.collar} sizes="(min-width: 900px) 92vw, 180vw" />
              </motion.div>
            </motion.div>
            <motion.div className="dive__layer" style={{ opacity: fabricOpacity }}>
              <motion.div className="dive__zoom" style={fabric}>
                <Img image={IMG.fabric} sizes="(min-width: 900px) 46vw, 90vw" />
              </motion.div>
            </motion.div>
          </div>
        </div>
        <motion.span className="dive__bar" style={{ scaleY: p }} aria-hidden="true" />
      </div>
    </section>
  );
}
