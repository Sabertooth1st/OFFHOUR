import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'motion/react';
import { Img } from '../components/Img';
import { COLOURS, formatPrice, PRODUCTS, type Product } from '../data/catalogue';
import { bandOf, filmPoint, useChapter, useFilm, type SceneProps } from './chapters';

const N = PRODUCTS.length;
const LIGHT = new Set(['chalk', 'oat', 'concrete']);

// Surface of each cloth, drawn over its colour field until photography arrives.
const WEAVE: Record<string, string> = {
  'form-shell-jacket': 'twill',
  'field-wool-overshirt': 'brushed',
  'heavyweight-tee': 'jersey',
  'relaxed-pleat-trouser': 'twill',
  'volume-hoodie': 'jersey',
  'rib-knit': 'rib',
};

const fieldStyle = (p: Product) => {
  const c = COLOURS[p.colours[0]];
  return { '--field': c.hex } as CSSProperties;
};

function Info({ product, onFocus }: { product: Product; onFocus?: () => void }) {
  const colour = COLOURS[product.colours[0]];
  return (
    <div className="piece__info" onFocus={onFocus}>
      <h3 className="piece__name">{product.name}</h3>
      <p className="piece__meta">
        {formatPrice(product.price)}
        <span aria-hidden="true"> · </span>
        {colour.name}
      </p>
      <p className="piece__summary">{product.summary}</p>
      {!product.cutout && <p className="piece__note">Photography to follow. Shown as the cloth colour.</p>}
      <Link className="btn piece__btn" to={`/shop/${product.slug}`}>
        View piece<span className="sr-only">: {product.name}</span>
      </Link>
    </div>
  );
}

function Figure({ product }: { product: Product }) {
  return (
    <>
      <p className="piece__word" aria-hidden="true">
        {product.type}
      </p>
      {product.cutout && (
        <div className="piece__garment">
          <Img image={product.cutout} sizes="(min-width: 900px) 46vh, 70vw" decorative />
        </div>
      )}
    </>
  );
}

function Panel({ local, k, product }: { local: MotionValue<number>; k: number; product: Product }) {
  const { jump } = useFilm();
  const a = k / N;
  // Each piece wipes up over the last, then its type drifts across while it holds.
  const reveal = useTransform(local, [a - 0.075, a], [100, 0]);
  const clipPath = useTransform(reveal, (v) => (k === 0 ? 'none' : `inset(${v}% 0 0 0)`));
  const wordX = useTransform(local, [a - 0.08, a + 1 / N], ['12%', '-14%']);
  const garmentY = useTransform(local, [a - 0.08, a + 1 / N], ['9%', '-3%']);
  return (
    <motion.article
      className={`piece piece--${WEAVE[product.slug]}${LIGHT.has(product.colours[0]) ? ' piece--light' : ''}`}
      style={{ ...fieldStyle(product), clipPath }}
      aria-label={product.name}
    >
      <div className="piece__cloth" aria-hidden="true" />
      <motion.div className="piece__figure" style={{ x: wordX }}>
        <p className="piece__word" aria-hidden="true">
          {product.type}
        </p>
      </motion.div>
      {product.cutout && (
        <motion.div className="piece__garment" style={{ y: garmentY }}>
          <Img image={product.cutout} sizes="(min-width: 900px) 46vh, 70vw" decorative />
        </motion.div>
      )}
      <Info product={product} onFocus={() => jump(filmPoint(1, (k + 0.5) / N), true)} />
    </motion.article>
  );
}

function Moving() {
  const { local } = useChapter(1);
  const { current, jump, setInk } = useFilm();
  const [active, setActive] = useState(0);
  useMotionValueEvent(local, 'change', (v) => {
    const k = bandOf(v + 0.035, N);
    setActive((a) => (a === k ? a : k));
  });
  const light = current === 1 && LIGHT.has(PRODUCTS[active].colours[0]);
  // Keeps the header and clock legible over the light fields.
  useEffect(() => setInk(light ? 'dark' : 'light'), [light, setInk]);

  return (
    <>
      <h2 className="sr-only" id="collection-title">
        Volume 01: the six pieces
      </h2>
      {PRODUCTS.map((p, k) => (
        <Panel key={p.slug} local={local} k={k} product={p} />
      ))}
      <nav className={`pieces__nav${LIGHT.has(PRODUCTS[active].colours[0]) ? ' is-light' : ''}`} aria-label="Pieces in Volume 01">
        <ol>
          {PRODUCTS.map((p, k) => (
            <li key={p.slug}>
              <button type="button" aria-current={active === k ? 'true' : undefined} onClick={() => jump(filmPoint(1, (k + 0.5) / N))}>
                {p.name}
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

export function ScenePieces({ still }: SceneProps) {
  if (!still) return <Moving />;
  return (
    <>
      <h2 className="sr-only" id="collection-title">
        Volume 01: the six pieces
      </h2>
      {PRODUCTS.map((p) => (
        <article
          key={p.slug}
          className={`piece piece--still piece--${WEAVE[p.slug]}${LIGHT.has(p.colours[0]) ? ' piece--light' : ''}`}
          style={fieldStyle(p)}
          aria-label={p.name}
        >
          <div className="piece__cloth" aria-hidden="true" />
          <div className="piece__figure">
            <Figure product={p} />
          </div>
          <Info product={p} />
        </article>
      ))}
    </>
  );
}
