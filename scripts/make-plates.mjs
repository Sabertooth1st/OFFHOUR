// Generates OFFHOUR placeholder "plates": procedural concrete, plaster and fabric textures.
// They are NOT photographs of the garments. Each plate carries a baked label naming the real
// asset it stands in for. Replace any file in public/img with a real photograph of the same
// id and aspect ratio (keep the -640/-960/-1280 style width suffixes, or edit src/data/images.ts).
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'img');
await mkdir(outDir, { recursive: true });

/* ---------- maths ---------- */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const mix = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const ih = (x, y, s) => {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
};
const vnoise = (x, y, s) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  return mix(
    mix(ih(xi, yi, s), ih(xi + 1, yi, s), u),
    mix(ih(xi, yi + 1, s), ih(xi + 1, yi + 1, s), u),
    v,
  );
};
const fbm = (x, y, s, oct = 4) => {
  let amp = 0.5;
  let f = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < oct; i++) {
    sum += amp * vnoise(x * f, y * f, s + i * 17);
    norm += amp;
    amp *= 0.5;
    f *= 2;
  }
  return sum / norm;
};

/* ---------- palette (matches the brief tokens) ---------- */
const CONCRETE = [182, 183, 176]; // #B6B7B0
const CHALK = [238, 236, 229]; // #EEECE5
const CHARCOAL = [32, 33, 31]; // #20211F
const OXBLOOD = [116, 51, 61]; // #74333D

const scale = (rgb, k, tint = [1, 1, 1]) => [rgb[0] * k * tint[0], rgb[1] * k * tint[1], rgb[2] * k * tint[2]];
const lerpRgb = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

const WARM = [1.07, 1.0, 0.88];
const COOL = [0.9, 0.96, 1.05];

/* ---------- weaves ---------- */
const TAU = Math.PI * 2;
function weave(kind, x, y, p, seed) {
  const fibre = fbm(x / 1.6, y / 1.6, seed + 3, 3) - 0.5;
  if (kind === 'twill') {
    const t = 0.5 + 0.5 * Math.cos(((x + y) / p) * TAU);
    const t2 = 0.5 + 0.5 * Math.cos(((x - y) / (p * 3.1)) * TAU);
    return 0.78 + 0.24 * t + 0.08 * t2 + 0.22 * fibre;
  }
  if (kind === 'rib') {
    const c = 0.5 + 0.5 * Math.cos((x / p) * TAU);
    const r = 0.5 + 0.5 * Math.cos((y / (p * 0.55)) * TAU);
    return 0.62 + 0.42 * Math.pow(c, 1.3) + 0.08 * r * c + 0.2 * fibre;
  }
  // jersey
  const c = Math.cos((x / p) * TAU);
  const r = Math.cos((y / (p * 0.8)) * TAU + (x / p) * 0.9);
  return 0.84 + 0.12 * c * r + 0.08 * c + 0.22 * fibre;
}

/* ---------- renderer ---------- */
function render(W, H, fn, seed, grain = 3.2) {
  const buf = Buffer.alloc(W * H * 3);
  let i = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = fn(x / W, y / H, x, y);
      const g = (ih(x, y, seed + 99) - 0.5) * 2 * grain;
      buf[i++] = clamp(c[0] + g, 0, 255);
      buf[i++] = clamp(c[1] + g, 0, 255);
      buf[i++] = clamp(c[2] + g, 0, 255);
    }
  }
  return buf;
}

const sdBox = (px, py, hw, hh) => {
  const dx = Math.abs(px) - hw;
  const dy = Math.abs(py) - hh;
  return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0);
};

/* ---------- plate painters ---------- */
function concreteAlbedo(u, v, ar, seed, base = CONCRETE) {
  const n = fbm(u * 6 * ar, v * 6, seed, 5);
  const m = fbm(u * 1.3 * ar + 7, v * 1.3, seed + 1, 3);
  const pores = ih(Math.floor(u * 900 * ar), Math.floor(v * 900), seed + 5) > 0.992 ? 0.82 : 1;
  return scale(base, (0.86 + 0.3 * (n - 0.5) + 0.2 * (m - 0.5)) * pores);
}

function heroPainter(W, H, seed) {
  const ar = W / H;
  return (u, v) => {
    let c = concreteAlbedo(u, v, ar, seed, [170, 171, 164]);
    const seam = Math.exp(-Math.pow(((u * ar * 5) % 1) / 0.01, 2));
    c = scale(c, 1 - 0.1 * seam);
    const slabEdge = 0.27 + 0.02 * Math.sin(u * 3.1);
    const slab = 1 - sstep(slabEdge - 0.008, slabEdge + 0.01, v);
    const lit = sstep(0.55, 0.64, u * 0.95 + (v - slabEdge) * 0.7 - 0.1);
    let k = mix(0.4, 1.12, lit);
    k *= 1 - 0.28 * (1 - sstep(slabEdge, slabEdge + 0.16, v)) * lit;
    k *= 1 - 0.78 * slab;
    // keep the left third dark enough for cream type, floor reads lighter
    k *= 0.62 + 0.38 * sstep(0.0, 0.7, u);
    const floor = sstep(0.82, 0.835, v);
    c = scale(c, k * mix(1, 1.12, floor), lerpRgb(COOL, WARM, lit));
    c = scale(c, 1 - 0.35 * Math.exp(-Math.pow((v - 0.826) / 0.003, 2)));
    return c;
  };
}

function plasterPainter(W, H, seed) {
  const ar = W / H;
  return (u, v) => {
    let c = concreteAlbedo(u, v, ar, seed, [196, 192, 182]);
    const win = sstep(0.38, 0.55, u * 0.8 + (1 - v) * 0.45 - 0.1);
    const k = mix(0.62, 1.1, win) * (0.9 + 0.1 * sstep(0.2, 0.9, v));
    const floor = sstep(0.7, 0.72, v);
    c = scale(c, k * mix(1, 0.88, floor), lerpRgb(COOL, WARM, win));
    return c;
  };
}

function productBgPainter(W, H, seed, variant) {
  const ar = W / H;
  const base = variant === 'body' ? [112, 113, 107] : [206, 206, 200];
  return (u, v) => {
    let c = concreteAlbedo(u, v, ar, seed, base);
    if (variant === 'body') {
      const shaft = sstep(0.12, 0.0, Math.abs(u * 1.0 + v * 0.42 - 0.95) - 0.17);
      c = scale(c, mix(0.55, 1.2, shaft), lerpRgb(COOL, WARM, shaft));
      const floor = sstep(0.86, 0.87, v);
      c = scale(c, mix(1, 0.8, floor));
    } else {
      const k = 1.06 - 0.22 * (u * 0.7 + v * 0.5) + 0.1 * (1 - v);
      c = scale(c, k, [1.02, 1.0, 0.96]);
    }
    return c;
  };
}

function swatchPainter(W, H, seed, bg, opts) {
  const { colour, kind, p, cx, cy, hw, hh, rot, shadowDx, shadowDy, shadowBlur } = opts;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  return (u, v, x, y) => {
    let c = bg(u, v, x, y);
    const px = (u - cx) * W;
    const py = (v - cy) * H;
    const lx = px * cos + py * sin;
    const ly = -px * sin + py * cos;
    const sd = sdBox(lx, ly, hw * W, hh * H);
    const sh = sdBox(lx - shadowDx * W, ly - shadowDy * W, hw * W, hh * H);
    const shadow = Math.exp(-Math.max(sh, 0) / (shadowBlur * W)) * 0.55;
    c = scale(c, 1 - shadow, [0.98, 0.98, 1.0]);
    if (sd < 0) {
      const w = weave(kind, x, y, p, seed);
      const fold = 0.93 + 0.1 * Math.sin((lx / (hw * W)) * 2.2 + 0.6) + 0.06 * (ly / (hh * H));
      const edge = 1 - 0.3 * Math.exp(sd / 3);
      c = scale(colour, w * fold * edge, [1.03, 1.0, 0.96]);
    }
    return c;
  };
}

function macroPainter(W, H, seed, colour, kind, p, angle) {
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  return (u, v, x, y) => {
    const rx = x * ca + y * sa;
    const ry = -x * sa + y * ca;
    const w = weave(kind, rx, ry, p, seed);
    const fold = 0.78 + 0.34 * sstep(0.0, 1.0, 0.5 + 0.5 * Math.sin(u * 3.1 + v * 2.2 + 0.4));
    const rake = 0.8 + 0.3 * (1 - v) * (0.7 + 0.5 * u);
    return scale(colour, w * fold * rake, lerpRgb(COOL, WARM, u * 0.7));
  };
}

function stairwellPainter(W, H, seed) {
  const ar = W / H;
  return (u, v) => {
    let c = concreteAlbedo(u, v, ar, seed, [160, 161, 154]);
    const band = sstep(0.1, 0.0, Math.abs(u * 1.15 + v * 0.55 - 0.95) - 0.16);
    let k = mix(0.34, 1.08, band);
    // steps in the lower part
    if (v > 0.6) {
      const t = (v - 0.6) / 0.4;
      const step = (t * 7) % 1;
      const tread = step > 0.3 ? 1 : 0.78;
      k *= mix(1, tread, 0.9);
      k *= 1 - 0.22 * Math.exp(-Math.pow((step - 0.3) / 0.025, 2));
    }
    k *= 1 - 0.5 * sstep(0.0, 0.2, 1 - v) * 0; // keep ceiling soft
    return scale(c, k, lerpRgb(COOL, WARM, band));
  };
}

function passagePainter(W, H, seed) {
  const ar = W / H;
  return (u, v) => {
    let c = concreteAlbedo(u, v, ar, seed, [158, 159, 152]);
    const dx = Math.abs(u - 0.54) / 0.5;
    const dy = Math.abs(v - 0.5) / 0.5;
    const d = Math.max(dx * 1.05, dy * 1.25);
    const depth = 1 - sstep(0.05, 0.95, d);
    const opening = sstep(0.17, 0.12, Math.max(Math.abs(u - 0.54) / 0.15, Math.abs(v - 0.52) / 0.33) * 0.16);
    let k = mix(0.3, 0.92, depth) + 0.9 * opening;
    // ceiling beams
    if (v < 0.4) {
      const beam = (v * 14) % 1;
      k *= beam < 0.18 ? 0.75 : 1;
    }
    // floor sheen
    k *= 1 + 0.18 * sstep(0.62, 1, v) * depth;
    return scale(c, k, lerpRgb(COOL, WARM, depth));
  };
}

/* ---------- label overlay ---------- */
function labelSvg(W, H, lines, ink, align = 'left') {
  // 'hero' labels sit in the dark overhang at top right so the wordmark never covers them.
  const heroM = align === 'hero-m';
  const hero = align === 'hero' || heroM;
  const fs = Math.round(W * (heroM ? 0.021 : hero ? 0.0095 : 0.026));
  const padX = Math.round(W * (hero ? 0.04 : 0.075));
  const baseY = hero ? Math.round(H * 0.2) : H - Math.round(W * 0.075);
  // The portrait hero is cropped to a phone window, so its label is centred on that window.
  const anchor = heroM ? 'middle' : hero ? 'end' : 'start';
  const tx = heroM ? Math.round(W * 0.54) : hero ? W - padX : padX;
  const text = lines
    .map(
      (l, i) =>
        `<text x="${tx}" text-anchor="${anchor}" y="${baseY - (lines.length - 1 - i) * fs * 1.45}" font-family="DejaVu Sans Mono, monospace" font-size="${fs}" fill="${ink}" fill-opacity="${i === 0 ? 0.92 : 0.7}">${l
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')}</text>`,
    )
    .join('');
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${text}</svg>`);
}

/* ---------- output ---------- */
const manifest = {};

async function emit(id, W, H, painter, seed, widths, lines, ink = 'rgb(238,236,229)', align = 'left') {
  const raw = render(W, H, painter, seed);
  const png = await sharp(raw, { raw: { width: W, height: H, channels: 3 } })
    .composite([{ input: labelSvg(W, H, lines, ink, align), top: 0, left: 0 }])
    .png()
    .toBuffer();
  for (const w of widths) {
    await sharp(png)
      .resize({ width: w })
      .jpeg({ quality: 70, mozjpeg: true, chromaSubsampling: '4:2:0' })
      .toFile(path.join(outDir, `${id}-${w}.jpg`));
  }
  manifest[id] = { w: W, h: H, widths };
  console.log('plate', id, `${W}x${H}`);
}

const P4 = [640, 960, 1280];
const W45 = 1280;
const H45 = 1600;

const products = {
  'form-shell-jacket': { label: 'Form Shell Jacket', colour: OXBLOOD, kind: 'twill', p: 9 },
  'field-wool-overshirt': { label: 'Field Wool Overshirt', colour: [134, 135, 129], kind: 'twill', p: 8 },
  'heavyweight-tee': { label: 'Heavyweight Tee', colour: [228, 225, 216], kind: 'jersey', p: 7 },
  'relaxed-pleat-trouser': { label: 'Relaxed Pleat Trouser', colour: [48, 49, 47], kind: 'twill', p: 8 },
  'volume-hoodie': { label: 'Volume Hoodie', colour: [88, 89, 86], kind: 'jersey', p: 8 },
  'rib-knit': { label: 'Rib Knit', colour: [208, 194, 165], kind: 'rib', p: 10 },
};

// Campaign
await emit(
  'hero',
  2560,
  1707,
  heroPainter(2560, 1707, 11),
  11,
  [1280, 1920, 2560],
  ['PLACEHOLDER PLATE: campaign hero, landscape', 'Replace with the Form Shell Jacket under a concrete overhang'],
  'rgb(238,236,229)',
  'hero',
);
await emit(
  'hero-m',
  1280,
  1920,
  heroPainter(1280, 1920, 12),
  12,
  [640, 960, 1280],
  ['PLACEHOLDER PLATE: campaign hero, portrait crop', 'Replace with the garment-safe mobile crop'],
  'rgb(238,236,229)',
  'hero-m',
);
await emit(
  'brand-chair',
  W45,
  H45,
  swatchPainter(W45, H45, 21, plasterPainter(W45, H45, 21), {
    colour: OXBLOOD,
    kind: 'twill',
    p: 9,
    cx: 0.52,
    cy: 0.62,
    hw: 0.3,
    hh: 0.2,
    rot: -0.09,
    shadowDx: 0.02,
    shadowDy: 0.035,
    shadowBlur: 0.03,
  }),
  21,
  P4,
  ['PLACEHOLDER PLATE: garment draped over a chair', 'Fabric swatch only, not the garment'],
  'rgb(238,236,229)',
);

// Products
let seed = 40;
for (const [slug, cfg] of Object.entries(products)) {
  seed += 7;
  const garmentBg = productBgPainter(W45, H45, seed, 'garment');
  await emit(
    `${slug}-garment`,
    W45,
    H45,
    swatchPainter(W45, H45, seed, garmentBg, {
      colour: cfg.colour,
      kind: cfg.kind,
      p: cfg.p,
      cx: 0.5,
      cy: 0.5,
      hw: 0.27,
      hh: 0.22,
      rot: 0.025,
      shadowDx: 0.012,
      shadowDy: 0.028,
      shadowBlur: 0.022,
    }),
    seed,
    P4,
    [`PLACEHOLDER PLATE: ${cfg.label}, garment view`, 'Fabric colour sample, not the garment'],
    'rgb(32,33,31)',
  );
  const bodyBg = productBgPainter(W45, H45, seed + 1, 'body');
  await emit(
    `${slug}-body`,
    W45,
    H45,
    swatchPainter(W45, H45, seed + 1, bodyBg, {
      colour: cfg.colour,
      kind: cfg.kind,
      p: cfg.p,
      cx: 0.57,
      cy: 0.5,
      hw: 0.13,
      hh: 0.3,
      rot: 0,
      shadowDx: -0.03,
      shadowDy: 0.02,
      shadowBlur: 0.035,
    }),
    seed + 1,
    P4,
    [`PLACEHOLDER PLATE: ${cfg.label}, on body`, 'Fabric colour sample, not the garment'],
    'rgb(238,236,229)',
  );
  await emit(
    `${slug}-detail`,
    W45,
    H45,
    macroPainter(W45, H45, seed + 2, cfg.colour, cfg.kind, cfg.p * 2.4, 0.2),
    seed + 2,
    P4,
    [`PLACEHOLDER PLATE: ${cfg.label}, detail`, 'Procedural weave, not the real textile'],
    slugInk(cfg.colour),
  );
}

function slugInk(rgb) {
  const l = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  return l > 150 ? 'rgb(32,33,31)' : 'rgb(238,236,229)';
}

// Garment study macro (large weave of the featured jacket)
await emit(
  'jacket-fabric',
  W45,
  H45,
  macroPainter(W45, H45, 77, OXBLOOD, 'twill', 34, 0.55),
  77,
  P4,
  ['PLACEHOLDER PLATE: fabric macro, Form Shell Jacket', 'Procedural twill, not the real textile'],
);

// Lookbook
await emit(
  'look-stairwell',
  W45,
  H45,
  stairwellPainter(W45, H45, 91),
  91,
  P4,
  ['PLACEHOLDER PLATE: lookbook portrait, stairwell', 'Replace with the styled look photograph'],
);
await emit(
  'look-passage',
  1920,
  1280,
  passagePainter(1920, 1280, 93),
  93,
  [960, 1440, 1920],
  ['PLACEHOLDER PLATE: lookbook landscape, passageway', 'Replace with the styled look photograph'],
);

await writeFile(path.join(root, 'src', 'data', 'plates.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('manifest written');
