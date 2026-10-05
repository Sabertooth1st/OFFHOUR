import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import type { ImageRef } from '../data/images';
import { useReducedMotion } from '../state/hooks';
import { Img } from './Img';

interface Props {
  image: ImageRef;
  sizes: string;
  className?: string;
  /** Total travel in px inside the frame (about 20-40). */
  travel?: number;
}

/** Image that drifts a few pixels inside a fixed sharp frame while it crosses the viewport. */
export function ParallaxImage({ image, sizes, className = '', travel = 36 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-travel / 2, travel / 2]);
  return (
    <div ref={ref} className={`frame ${className}`}>
      <motion.div className="frame__inner" style={reduced ? undefined : { y }}>
        <Img image={image} sizes={sizes} />
      </motion.div>
    </div>
  );
}
