import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'motion/react';
import { Img } from '../components/Img';
import { COLOURS, formatPrice, PRODUCTS, type Product } from '../data/catalogue';
import { useReducedMotion } from '../state/hooks';
import { bandKeys, scrollToProgress, useSectionProgress } from './progress';

const N = PRODUCTS.length;

function Piece({ progress, i, product }: { progress: MotionValue<number>; i: number; product: Product }) {
  const { keys, opacity: o } = bandKeys(i, N);
  const opacity = useTransform(progress, keys, o);
  const y = useTransform(progress, keys, [i === 0 ? 0 : 70, 0, 0, i === N - 1 ? 0 : -70]);
  const scale = useTransform(progress, keys, [i === 0 ? 1 : 0.9, 1, 1, i === N - 1 ? 1 : 1.04]);
  const cut = Boolean(product.cutout);
  return (
    <motion.div className={`run__piece${cut ? ' run__piece--cutout' : ''}`} style={{ opacity, y, scale }}>
      <Img image={product.cutout ?? product.garment} sizes="(min-width: 900px) 40vw, 80vw" priority={i === 0} decorative />
    </motion.div>
  );
}

function Info({ product, i }: { product: Product; i: number }) {
  return (
    <div className="run__info" key={product.slug}>
      <p className="run__count">
        Piece {i + 1} of {N}
      </p>
      <h3 className="run__name">{product.name}</h3>
      <p className="run__meta">
        <span>{formatPrice(product.price)}</span>
        <span className="run__colour">
          <span className="swatch" style={{ background: COLOURS[product.colours[0]].hex }} aria-hidden="true" />
          {COLOURS[product.colours[0]].name}
        </span>
      </p>
      <p className="run__summary">{product.summary}</p>
      <Link className="btn btn--light" to={`/shop/${product.slug}`}>
        View {product.name}
      </Link>
    </div>
  );
}

/** Pinned run through all six pieces, one at a time, driven by scroll. */
export function CollectionRun() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const p = useSectionProgress(ref);
  const [active, setActive] = useState(0);
  const wordX = useTransform(p, [0, 1], ['4%', '-58%']);

  useMotionValueEvent(p, 'change', (v) => {
    const i = Math.max(0, Math.min(N - 1, Math.floor(v * N)));
    setActive((a) => (a === i ? a : i));
  });

  if (reduced) {
    return (
      <section id="collection" className="run run--static shell" aria-labelledby="run-title">
        <h2 id="run-title" className="display display--lg">
          Volume 01
        </h2>
        <div className="run__static-list">
          {PRODUCTS.map((prod, i) => (
            <article key={prod.slug} className="run__static-item">
              <div className={`run__piece run__piece--static${prod.cutout ? ' run__piece--cutout' : ''}`}>
                <Img image={prod.cutout ?? prod.garment} sizes="(min-width: 900px) 30vw, 90vw" decorative />
              </div>
              <Info product={prod} i={i} />
            </article>
          ))}
        </div>
      </section>
    );
  }

  const product = PRODUCTS[active];
  return (
    <section ref={ref} id="collection" className="run" aria-labelledby="run-title">
      <div className="run__sticky">
        <motion.p className="run__word" style={{ x: wordX }} aria-hidden="true">
          {PRODUCTS.map((p) => p.type).join(' ')}
        </motion.p>
        <div className="run__grid shell">
          <nav className="run__nav" aria-label="Pieces in Volume 01">
            <h2 id="run-title" className="run__title">
              Volume 01
            </h2>
            <ol>
              {PRODUCTS.map((prod, i) => (
                <li key={prod.slug}>
                  <button
                    type="button"
                    aria-current={active === i ? 'true' : undefined}
                    onClick={() => scrollToProgress(ref.current, (i + 0.5) / N)}
                  >
                    {prod.name}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <div className="run__stage">
            {PRODUCTS.map((prod, i) => (
              <Piece key={prod.slug} progress={p} i={i} product={prod} />
            ))}
          </div>
          <div className="run__panel" aria-live="polite">
            <Info product={product} i={active} />
          </div>
        </div>
        <motion.span className="run__bar" style={{ scaleX: p }} aria-hidden="true" />
      </div>
    </section>
  );
}
