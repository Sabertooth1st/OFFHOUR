// Turns the supplied photographs in media-src/ into responsive WebP files in public/media/
// and writes src/data/media.json. Re-run after adding or replacing a photograph.
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (p) => path.join(root, 'media-src', p);
const out = path.join(root, 'public', 'media');
await mkdir(out, { recursive: true });

const manifest = {};

/** Writes `id-<w>.webp` for each width (never upscaling) and records it in the manifest. */
async function emit(id, input, { widths, extract, flatten, quality = 80 } = {}) {
  let base = sharp(input);
  if (extract) base = base.extract(extract);
  if (flatten) base = base.flatten({ background: flatten });
  const buf = await base.toBuffer();
  const meta = await sharp(buf).metadata();
  const ws = [...new Set(widths.map((w) => Math.min(w, meta.width)))];
  for (const w of ws) {
    await sharp(buf).resize({ width: w }).webp({ quality, alphaQuality: 90, effort: 5 }).toFile(path.join(out, `${id}-${w}.webp`));
  }
  manifest[id] = { w: meta.width, h: meta.height, widths: ws };
  console.log('media', id, `${meta.width}x${meta.height}`, ws.join('/'));
}

// Form Shell Jacket
await emit('jacket-cutout', src('jacket/front-cutout.webp'), { widths: [480, 800, 1122], quality: 84 });
// Same cutout on the chalk card colour, for grids, search and the bag.
await emit('jacket-front', src('jacket/front-cutout.webp'), { widths: [480, 800, 1122], flatten: '#e4e2da' });
await emit('hero', src('jacket/hero.webp'), { widths: [960, 1536], quality: 82 });
// Portrait crop of the campaign frame, centred on the model, for phones and the on-body view.
await emit('hero-m', src('jacket/hero.webp'), { widths: [683], extract: { left: 668, top: 0, width: 683, height: 1024 } });
await emit('jacket-body', src('jacket/hero.webp'), { widths: [640, 819], extract: { left: 600, top: 0, width: 819, height: 1024 } });
await emit('jacket-chair', src('jacket/chair.webp'), { widths: [640, 960, 1122] });
await emit('jacket-collar', src('jacket/collar.webp'), { widths: [640, 960, 1122] });
// Fabric close-up: plain weave from the lower left of the collar photograph, away from the zip.
await emit('jacket-fabric', src('jacket/collar.webp'), { widths: [466], extract: { left: 0, top: 820, width: 466, height: 582 } });

await writeFile(path.join(root, 'src', 'data', 'media.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('manifest written');
