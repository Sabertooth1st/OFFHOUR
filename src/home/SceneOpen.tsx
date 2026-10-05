import { Link } from 'react-router-dom';
import { motion, useTransform } from 'motion/react';
import { plateMeta, plateSrc, plateSrcSet } from '../data/images';
import { useChapter, type SceneProps } from './chapters';

const LETTERS = 'OFFHOUR'.split('');
const ALT = 'Model in the oxblood Form Shell Jacket, chalk tee and charcoal trousers under a concrete overhang in late light';

function Photo() {
  const d = plateMeta('hero');
  return (
    <picture>
      <source media="(max-aspect-ratio: 1/1)" srcSet={plateSrcSet('hero-m')} sizes="100vw" />
      <img
        className="open__img"
        src={plateSrc('hero', 1536)}
        srcSet={plateSrcSet('hero')}
        sizes="100vw"
        width={d.w}
        height={d.h}
        alt={ALT}
        fetchPriority="high"
        decoding="async"
      />
    </picture>
  );
}

function Copy() {
  return (
    <div className="open__copy">
      <p className="cap" id="hero-sub">
        Clothes for the hours <em>in&nbsp;between.</em>
      </p>
      <Link className="btn btn--solid-light" to="/shop">
        Shop Volume 01
      </Link>
    </div>
  );
}

const Wordmark = ({ style }: { style?: object }) => (
  <motion.h1 className="open__mark" id="hero-title" style={style} aria-label="OFFHOUR">
    {LETTERS.map((l, i) => (
      <span key={i} style={{ '--i': i } as React.CSSProperties} aria-hidden="true">
        {l}
      </span>
    ))}
  </motion.h1>
);

/**
 * 18:00. The frame opens from a slit to full bleed while the wordmark rises letter by letter;
 * scrolling pushes in on the jacket and lifts the wordmark away.
 */
function Moving() {
  const { local } = useChapter(0);
  const scale = useTransform(local, [0, 1], [1, 1.22]);
  const markY = useTransform(local, [0, 0.8], ['0%', '-60%']);
  const markOpacity = useTransform(local, [0.35, 0.8], [1, 0]);
  const copyOpacity = useTransform(local, [0, 0.4], [1, 0]);
  const dim = useTransform(local, [0.2, 1], [0, 0.55]);
  return (
    <>
      <div className="open__photo">
        <motion.div className="open__push" style={{ scale }}>
          <Photo />
        </motion.div>
        <motion.div className="scrim" style={{ opacity: dim }} aria-hidden="true" />
      </div>
      <motion.div className="open__copy-wrap" style={{ opacity: copyOpacity }}>
        <Copy />
      </motion.div>
      <Wordmark style={{ y: markY, opacity: markOpacity }} />
    </>
  );
}

export function SceneOpen({ still }: SceneProps) {
  if (!still) return <Moving />;
  return (
    <>
      <div className="open__photo">
        <Photo />
      </div>
      <div className="open__copy-wrap">
        <Copy />
      </div>
      <Wordmark />
    </>
  );
}
