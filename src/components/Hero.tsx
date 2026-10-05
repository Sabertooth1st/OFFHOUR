import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { plateMeta, plateSrc, plateSrcSet } from '../data/images';
import { useReducedMotion } from '../state/hooks';

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  // Depth: the picture settles from 1.03 to 1.00 inside a fixed frame as the hero exits.
  const scale = useTransform(scrollYProgress, [0, 1], [1.03, 1]);
  const d = plateMeta('hero');

  return (
    <section id="hero" ref={ref} className="hero" aria-label="Campaign">
      <div className="hero__frame">
        <motion.div className="hero__zoom" style={reduced ? undefined : { scale }}>
          <picture>
            <source media="(max-aspect-ratio: 1/1)" srcSet={plateSrcSet('hero-m')} sizes="100vw" />
            <img
              className="hero__img"
              src={plateSrc('hero', 1920)}
              srcSet={plateSrcSet('hero')}
              sizes="100vw"
              width={d.w}
              height={d.h}
              alt="Campaign plate: concrete overhang in late light (placeholder for the Form Shell Jacket photograph)"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
        </motion.div>
      </div>

      <div className="hero__content">
        <div className="hero__meta">
          <p className="hero__collection">Volume 01 / Autumn Collection</p>
          <p className="hero__tagline">Clothes for the hours in between.</p>
          <Link className="btn btn--light" to="/shop">
            Shop Volume 01
          </Link>
        </div>
        <h1 className="hero__wordmark">OFFHOUR</h1>
      </div>
    </section>
  );
}
