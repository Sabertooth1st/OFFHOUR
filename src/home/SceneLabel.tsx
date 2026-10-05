import { motion, useTransform, type MotionValue } from 'motion/react';
import { Img } from '../components/Img';
import { COLOURS, PRODUCTS } from '../data/catalogue';
import { plate } from '../data/images';
import { useChapter, type SceneProps } from './chapters';

const WORDS: { w: string; em?: boolean }[] = [
  { w: 'Six' },
  { w: 'pieces.' },
  { w: 'One' },
  { w: 'palette.' },
  { w: 'Worn', em: true },
  { w: 'together.', em: true },
];

const prices = PRODUCTS.map((p) => p.price);
const sizes = [...new Set(PRODUCTS.flatMap((p) => p.sizes))];
// Every figure is read from the demo catalogue, so it stays true if the catalogue changes.
const FACTS = [
  { value: String(PRODUCTS.length), label: 'pieces in Volume 01' },
  { value: `${sizes[0]} to ${sizes.at(-1)}`, label: 'unisex sizes, cut relaxed' },
  { value: String(Object.keys(COLOURS).length), label: 'colours, chalk to oxblood' },
  { value: `CHF ${Math.min(...prices)} to ${Math.max(...prices)}`, label: 'tee to shell jacket' },
];

const CHAIR = plate('jacket-chair', 'Form Shell Jacket draped over a wooden chair against a plaster wall');
const LEAD =
  'OFFHOUR is a concept label by UZICE STUDIO: sculptural outerwear, heavyweight basics, relaxed tailoring and textured knitwear for the walk between one place and the next.';

function Word({ local, i, w, em }: { local: MotionValue<number>; i: number; w: string; em?: boolean }) {
  const start = 0.08 + i * 0.07;
  const opacity = useTransform(local, [start, start + 0.08], [0.14, 1]);
  const y = useTransform(local, [start, start + 0.1], ['0.25em', '0em']);
  const word = <motion.span style={{ opacity, y, display: 'inline-block' }}>{w}</motion.span>;
  return (
    <>
      {em ? <em>{word}</em> : word}{' '}
    </>
  );
}

function Fact({ local, i, f }: { local: MotionValue<number>; i: number; f: (typeof FACTS)[number] }) {
  const start = 0.5 + i * 0.06;
  const opacity = useTransform(local, [start, start + 0.1], [0, 1]);
  const y = useTransform(local, [start, start + 0.12], [24, 0]);
  return (
    <motion.div className="fact" style={{ opacity, y }}>
      <dt>{f.value}</dt>
      <dd>{f.label}</dd>
    </motion.div>
  );
}

function Moving() {
  const { local } = useChapter(3);
  const scale = useTransform(local, [0, 1], [1.12, 1]);
  const x = useTransform(local, [0, 1], ['2%', '-2%']);
  const leadOpacity = useTransform(local, [0.42, 0.52], [0, 1]);
  return (
    <>
      <div className="label__photo">
        <motion.div className="label__drift" style={{ scale, x }}>
          <Img image={CHAIR} sizes="100vw" />
        </motion.div>
      </div>
      <div className="label__copy">
        <h2 className="cap cap--xl" id="about-title">
          {WORDS.map((w, i) => (
            <Word key={i} local={local} i={i} {...w} />
          ))}
        </h2>
        <motion.p className="label__lead" style={{ opacity: leadOpacity }}>
          {LEAD}
        </motion.p>
        <dl className="facts">
          {FACTS.map((f, i) => (
            <Fact key={f.label} local={local} i={i} f={f} />
          ))}
        </dl>
      </div>
    </>
  );
}

export function SceneLabel({ still }: SceneProps) {
  if (!still) return <Moving />;
  return (
    <>
      <div className="label__photo">
        <Img image={CHAIR} sizes="100vw" />
      </div>
      <div className="label__copy">
        <h2 className="cap cap--xl" id="about-title">
          {WORDS.map((w, i) => (
            <span key={i}>{w.em ? <em>{w.w}</em> : w.w} </span>
          ))}
        </h2>
        <p className="label__lead">{LEAD}</p>
        <dl className="facts">
          {FACTS.map((f) => (
            <div className="fact" key={f.label}>
              <dt>{f.value}</dt>
              <dd>{f.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );
}
