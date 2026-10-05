import plates from './plates.json';
import media from './media.json';

/**
 * Picture registry. `media` holds supplied photography (public/media, WebP, from scripts/prepare-media.mjs).
 * `plates` holds procedural placeholders (public/img, from scripts/make-plates.mjs) for slots still
 * waiting on photography. Ids are unique across both.
 */
type MediaId = keyof typeof media;
type PlateOnlyId = keyof typeof plates;
export type PlateId = MediaId | PlateOnlyId;

interface Entry {
  w: number;
  h: number;
  widths: number[];
  dir: string;
  ext: string;
}

const REGISTRY: Record<string, Entry> = {};
for (const [id, m] of Object.entries(plates)) REGISTRY[id] = { ...m, dir: 'img', ext: 'jpg' };
for (const [id, m] of Object.entries(media)) REGISTRY[id] = { ...m, dir: 'media', ext: 'webp' };

export interface ImageRef {
  id: PlateId;
  alt: string;
}

export const plate = (id: PlateId, alt: string): ImageRef => ({ id, alt });

export const plateMeta = (id: PlateId) => REGISTRY[id];

/** True when the slot shows supplied photography rather than a placeholder. */
export const isPhoto = (id: PlateId) => REGISTRY[id].dir === 'media';

const BASE = import.meta.env.BASE_URL;
const file = (id: PlateId, w: number) => `${BASE}${REGISTRY[id].dir}/${id}-${w}.${REGISTRY[id].ext}`;

export const plateSrc = (id: PlateId, width?: number) => {
  const widths = REGISTRY[id].widths;
  return file(id, width && widths.includes(width) ? width : widths[widths.length - 1]);
};

export const plateSrcSet = (id: PlateId) => REGISTRY[id].widths.map((w) => `${file(id, w)} ${w}w`).join(', ');
