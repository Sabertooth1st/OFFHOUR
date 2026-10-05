import { useRef } from 'react';
import { motion, useTransform, type MotionValue } from 'motion/react';
import { Img } from '../components/Img';
import { Reveal } from '../components/Reveal';
import { COLOURS, PRODUCTS } from '../data/catalogue';
import { plate } from '../data/images';
import { useReducedMotion } from '../state/hooks';
import { useSectionProgress } from './progress';

const STATEMENT = 'Clothes for the hours in between. Room to move. Shape to keep.';
const WORDS = STATEMENT.split(' ');

function Word({ progress, i, children }: { progress: MotionValue<number>; i: number; children: string }) {
  const start = (i / WORDS.length) * 0.85;
  const opacity = useTransform(progress, [start, start + 0.08], [0.16, 1]);
  return <motion.span style={{ opacity }}>{children} </motion.span>;
}

const prices = PRODUCTS.map((p) => p.price);
const sizes = new Set(PRODUCTS.flatMap((p) => p.sizes));
// Every figure below is read from the demo catalogue, so it stays true if the catalogue changes.
const FACTS = [
  { value: String(PRODUCTS.length), label: 'pieces in Volume 01, built to wear together' },
  { value: `${[...sizes][0]} to ${[...sizes].at(-1)}`, label: 'unisex sizes, all cut relaxed' },
  { value: String(Object.keys(COLOURS).length), label: 'tonal colours, from chalk to oxblood' },
  { value: `CHF ${Math.min(...prices)} to ${Math.max(...prices)}`, label: 'from heavyweight tee to shell jacket' },
];

const chair = plate('jacket-chair', 'Form Shell Jacket draped over a wooden chair against a plaster wall');

export function Identity() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const p = useScroll(ref);

  return (
    <section id="about" className="identity" aria-labelledby="identity-title">
      <div ref={ref} className={`identity__words${reduced ? ' identity__words--static' : ''}`}>
        <div className="identity__sticky shell">
          <h2 id="identity-title" className="identity__statement">
            {reduced ? STATEMENT : WORDS.map((w, i) => <Word key={i} progress={p} i={i}>{w}</Word>)}
          </h2>
        </div>
      </div>

      <div className="identity__proof shell">
        <Reveal className="identity__media">
          <div className="frame frame--portrait">
            <Img image={chair} sizes="(min-width: 900px) 34vw, 90vw" />
          </div>
        </Reveal>
        <div className="identity__facts">
          <Reveal as="p" className="lead identity__lead">
            OFFHOUR is a concept label by UZICE STUDIO: sculptural outerwear, heavyweight basics, relaxed tailoring and
            textured knitwear, made for the walk between one place and the next.
          </Reveal>
          <dl className="facts">
            {FACTS.map((f, i) => (
              <Reveal key={f.label} className="fact" delay={i * 60}>
                <dt>{f.value}</dt>
                <dd>{f.label}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function useScroll(ref: React.RefObject<HTMLDivElement | null>) {
  return useSectionProgress(ref as React.RefObject<HTMLElement | null>);
}
