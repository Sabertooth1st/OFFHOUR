import type { CSSProperties } from 'react';
import { plateMeta, plateSrc, plateSrcSet, type ImageRef } from '../data/images';

interface Props {
  image: ImageRef;
  sizes: string;
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Decorative when an adjacent text label already names the picture. */
  decorative?: boolean;
}

/** Responsive image with reserved dimensions so nothing shifts while it loads. */
export function Img({ image, sizes, priority, className, style, decorative }: Props) {
  const meta = plateMeta(image.id);
  return (
    <img
      className={className}
      style={style}
      src={plateSrc(image.id, meta.widths[Math.min(1, meta.widths.length - 1)])}
      srcSet={plateSrcSet(image.id)}
      sizes={sizes}
      width={meta.w}
      height={meta.h}
      alt={decorative ? '' : image.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
    />
  );
}
