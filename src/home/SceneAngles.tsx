import { useState } from 'react';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'motion/react';
import { Img } from '../components/Img';
import { plate, type ImageRef } from '../data/images';
import { filmPoint, useChapter, useFilm, type SceneProps } from './chapters';

interface View {
  label: string;
  note: string;
  image: ImageRef;
}

// The views we have photographs for, hung on a ring the camera travels around.
// A frame-by-frame turntable of each garment replaces this once those frames exist.
const VIEWS: View[] = [
  { label: 'Front', note: 'Stand collar, one zip, two large pockets.', image: plate('jacket-front', 'Form Shell Jacket in oxblood, front view') },
  { label: 'Worn', note: 'Open over a chalk tee, cut to sit at the hip.', image: plate('jacket-body', 'Model wearing the Form Shell Jacket open over a chalk tee') },
  { label: 'Draped', note: 'The shell holds its shape off the body.', image: plate('jacket-chair', 'Form Shell Jacket draped over a wooden chair in window light') },
  { label: 'Close', note: 'Stitching, zip pull and the weave of the shell.', image: plate('jacket-collar', 'Close view of the stand collar and zip pull') },
];
const N = VIEWS.length;

function Plate({ turn, k, view }: { turn: MotionValue<number>; k: number; view: View }) {
  // How squarely this plate faces the camera: 1 head on, 0 edge on.
  const facing = useTransform(turn, (t) => Math.max(0, Math.cos(((k * 360) / N + t) * (Math.PI / 180))));
  const filter = useTransform(facing, (f) => `brightness(${0.32 + 0.68 * f ** 1.6})`);
  return (
    <motion.figure className="ring__plate" style={{ '--a': `${(k * 360) / N}deg`, filter } as never}>
      <Img image={view.image} sizes="(min-width: 900px) 40vh, 60vw" />
    </motion.figure>
  );
}

function Moving() {
  const { local } = useChapter(2);
  const { jump } = useFilm();
  // Hold on the front briefly, travel all the way round, and settle on the front again.
  const turn = useTransform(local, [0.06, 0.94], [0, -360]);
  const degrees = useTransform(turn, (t) => `${String(Math.round(-t)).padStart(3, '0')}°`);
  const [active, setActive] = useState(0);
  useMotionValueEvent(turn, 'change', (t) => {
    const k = Math.round(-t / (360 / N)) % N;
    setActive((a) => (a === k ? a : k));
  });
  const v = VIEWS[active];

  return (
    <>
      <motion.p className="ring__deg" aria-hidden="true">
        {degrees}
      </motion.p>
      <div className="ring">
        <div className="ring__orbit">
          <motion.div className="ring__spin" style={{ rotateY: turn }}>
            {VIEWS.map((view, k) => (
              <Plate key={view.label} turn={turn} k={k} view={view} />
            ))}
          </motion.div>
        </div>
      </div>
      <h2 className="cap ring__title" id="angles-title">
        Turn it <em>around.</em>
      </h2>
      <div className="ring__foot">
        <div className="ring__note" aria-live="polite">
          <h3>{v.label}</h3>
          <p>{v.note}</p>
        </div>
        <ol className="ring__views" aria-label="Views of the Form Shell Jacket">
          {VIEWS.map((view, k) => (
            <li key={view.label}>
              <button
                type="button"
                aria-current={active === k ? 'true' : undefined}
                onClick={() => jump(filmPoint(2, 0.06 + (0.88 * k) / N))}
              >
                {view.label}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

export function SceneAngles({ still }: SceneProps) {
  if (!still) return <Moving />;
  return (
    <div className="still__inner">
      <h2 className="cap" id="angles-title">
        Turn it <em>around.</em>
      </h2>
      <div className="ring-still">
        {VIEWS.map((v) => (
          <figure key={v.label}>
            <Img image={v.image} sizes="(min-width: 900px) 22vw, 90vw" />
            <figcaption>
              <strong>{v.label}.</strong> {v.note}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
