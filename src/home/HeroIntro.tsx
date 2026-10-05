import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useTransform } from 'motion/react';
import { plateMeta, plateSrc, plateSrcSet } from '../data/images';
import { useReducedMotion } from '../state/hooks';
import { useSectionProgress } from './progress';

const LETTERS = 'OFFHOUR'.split('');

/**
 * Opening: the wordmark rises, the campaign photograph pops up as a small frame and then
 * opens to full bleed. Scrolling deepens it before the collection takes over.
 */
export function HeroIntro() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const p = useSectionProgress(ref);
  const scale = useTransform(p, [0, 1], [1, 1.14]);
  const dim = useTransform(p, [0, 1], [0, 0.72]);
  const markY = useTransform(p, [0, 1], ['0%', '-42%']);
  const copyOpacity = useTransform(p, [0, 0.45], [1, 0]);
  const d = plateMeta('hero');

  return (
    <section ref={ref} id="hero" className="cine-hero" aria-label="Campaign">
      <div className="cine-hero__sticky">
        <div className="cine-hero__photo">
          <motion.div className="cine-hero__zoom" style={reduced ? undefined : { scale }}>
            <picture>
              <source media="(max-aspect-ratio: 1/1)" srcSet={plateSrcSet('hero-m')} sizes="100vw" />
              <img
                className="cine-hero__img"
                src={plateSrc('hero', 1536)}
                srcSet={plateSrcSet('hero')}
                sizes="100vw"
                width={d.w}
                height={d.h}
                alt="Model in the oxblood Form Shell Jacket, chalk tee and charcoal trousers under a concrete overhang in late light"
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          </motion.div>
          <motion.div className="cine-hero__dim" style={reduced ? { opacity: 0 } : { opacity: dim }} aria-hidden="true" />
        </div>

        <motion.div className="cine-hero__copy shell" style={reduced ? undefined : { opacity: copyOpacity }}>
          <p className="cine-hero__collection">Volume 01 / Autumn Collection</p>
          <p className="cine-hero__tagline">Clothes for the hours in between.</p>
          <Link className="btn btn--light" to="/shop">
            Shop Volume 01
          </Link>
        </motion.div>

        <motion.h1 className="cine-hero__wordmark" style={reduced ? undefined : { y: markY }} aria-label="OFFHOUR">
          {LETTERS.map((l, i) => (
            <span key={i} style={{ '--i': i } as React.CSSProperties} aria-hidden="true">
              {l}
            </span>
          ))}
        </motion.h1>
      </div>
    </section>
  );
}
