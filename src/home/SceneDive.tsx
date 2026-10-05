import { useState, type CSSProperties } from 'react';
import { motion, useMotionValueEvent, useTransform } from 'motion/react';
import { Img } from '../components/Img';
import { plate, plateMeta, type ImageRef } from '../data/images';
import { filmPoint, useChapter, useFilm, useZoom, type SceneProps } from './chapters';

const STEPS = [
  { at: 0, label: 'Jacket', title: 'The Form Shell Jacket.', note: 'Cropped and boxy, with room through the shoulder.' },
  { at: 0.2, label: 'Collar', title: 'Stand collar.', note: 'Stitched close to the edge so it stands on its own.' },
  { at: 0.4, label: 'Zip pull', title: 'Zip pull.', note: 'Matte metal, sized to find without looking.' },
  { at: 0.56, label: 'Zip', title: 'One central zip.', note: 'Running from collar to hem, set into the tape.' },
  { at: 0.74, label: 'Weave', title: 'The weave.', note: 'A dense oxblood twill with a soft, matte surface.' },
];

const IMG = {
  worn: plate('hero', 'Model in the Form Shell Jacket under a concrete overhang'),
  collar: plate('jacket-collar', 'Stand collar, zip pull and zip of the Form Shell Jacket'),
  fabric: plate('jacket-fabric', 'Close-up of the oxblood twill weave'),
};

/** A layer sized to its photograph's own proportions and scaled to cover the stage, so zoom focus points are image coordinates. */
const box = (image: ImageRef) => {
  const m = plateMeta(image.id);
  return { '--ar': m.w / m.h } as CSSProperties;
};

function Note({ step }: { step: number }) {
  const s = STEPS[step];
  return (
    <div className="dive__note" aria-live="polite" key={s.label}>
      <h3>{s.title}</h3>
      <p>{s.note}</p>
    </div>
  );
}

function Moving() {
  const { local } = useChapter(4);
  const { jump } = useFilm();
  const [step, setStep] = useState(0);
  useMotionValueEvent(local, 'change', (v) => {
    let i = 0;
    STEPS.forEach((s, k) => {
      if (v >= s.at) i = k;
    });
    setStep((c) => (c === i ? c : i));
  });

  // The whole look, pushing in on the collar before the collar photograph takes over.
  const wornOpacity = useTransform(local, [0.15, 0.22], [1, 0]);
  const worn = useZoom(local, [0, 0.04, 0.22], [1, 1, 3.4], [0.66, 0.66, 0.66], [0.3, 0.3, 0.28]);
  // Collar photograph: settle, then travel down to the zip pull and the teeth.
  const collarOpacity = useTransform(local, [0.15, 0.22, 0.72, 0.78], [0, 1, 1, 0]);
  const collar = useZoom(
    local,
    [0.18, 0.28, 0.44, 0.54, 0.68, 0.78],
    [1.3, 1, 2.1, 2.1, 2.6, 2.8],
    [0.5, 0.5, 0.63, 0.63, 0.62, 0.62],
    [0.4, 0.4, 0.44, 0.44, 0.84, 0.86],
  );
  // Fabric macro.
  const fabricOpacity = useTransform(local, [0.72, 0.78], [0, 1]);
  const fabric = useZoom(local, [0.72, 1], [1.08, 1.5], [0.5, 0.45], [0.5, 0.55]);
  const titleOpacity = useTransform(local, [0, 0.12], [1, 0]);

  return (
    <>
      <div className="dive__stage">
        <motion.div className="dive__layer" style={{ opacity: wornOpacity }}>
          <motion.div className="dive__box" style={{ ...box(IMG.worn), ...worn }}>
            <Img image={IMG.worn} sizes="150vw" />
          </motion.div>
        </motion.div>
        <motion.div className="dive__layer" style={{ opacity: collarOpacity }}>
          <motion.div className="dive__box" style={{ ...box(IMG.collar), ...collar }}>
            <Img image={IMG.collar} sizes="200vw" />
          </motion.div>
        </motion.div>
        <motion.div className="dive__layer" style={{ opacity: fabricOpacity }}>
          <motion.div className="dive__box" style={{ ...box(IMG.fabric), ...fabric }}>
            <Img image={IMG.fabric} sizes="100vw" />
          </motion.div>
        </motion.div>
        <div className="scrim scrim--foot" aria-hidden="true" />
      </div>
      <motion.h2 className="cap dive__title" id="details-title" style={{ opacity: titleOpacity }}>
        Get <em>closer.</em>
      </motion.h2>
      <div className="dive__foot">
        <Note step={step} />
        <ol className="dive__steps" aria-label="Details">
          {STEPS.map((st, i) => (
            <li key={st.label}>
              <button type="button" aria-current={step === i ? 'true' : undefined} onClick={() => jump(filmPoint(4, Math.min(0.97, st.at + 0.08)))}>
                {st.label}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

export function SceneDive({ still }: SceneProps) {
  if (!still) return <Moving />;
  const shown = [
    { img: IMG.collar, step: STEPS[1] },
    { img: IMG.fabric, step: STEPS[4] },
  ];
  return (
    <div className="still__inner">
      <h2 className="cap" id="details-title">
        Get <em>closer.</em>
      </h2>
      <div className="dive-still">
        {shown.map(({ img, step }) => (
          <figure key={step.label}>
            <Img image={img} sizes="(min-width: 900px) 40vw, 90vw" />
            <figcaption>
              <strong>{step.title}</strong> {step.note}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
