// Tiles screenshots into one contact sheet: node scripts/sheet.mjs <prefix> <out.png> [cols] [tileWidth]
import sharp from 'sharp';
import { readdirSync } from 'node:fs';
const [prefix, out, cols = '4', tw = '480'] = process.argv.slice(2);
const files = readdirSync('verify-out').filter((f) => f.startsWith(`${prefix}-`) && f.endsWith('.png')).sort();
const first = await sharp(`verify-out/${files[0]}`).metadata();
const W = +tw;
const H = Math.round((W * first.height) / first.width);
const tiles = await Promise.all(files.map((f) => sharp(`verify-out/${f}`).resize(W, H, { fit: 'cover', position: 'top' }).toBuffer()));
const c = +cols;
const rows = Math.ceil(tiles.length / c);
await sharp({ create: { width: W * c + (c - 1) * 6, height: H * rows + (rows - 1) * 6, channels: 3, background: '#ff00ff' } })
  .composite(tiles.map((input, i) => ({ input, left: (i % c) * (W + 6), top: Math.floor(i / c) * (H + 6) })))
  .png()
  .toFile(out);
console.log(files.join(' '));
