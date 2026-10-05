// Usage: node scripts/shoot.mjs <name> <width> <height> <path> [scrollY ...]
import { chromium } from 'playwright-core';
const [name, w, h, path = '/', ...ys] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, hasTouch: +w < 700, isMobile: +w < 700 });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`http://127.0.0.1:4173${path}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
const list = ys.length ? ys : ['0'];
for (const y of list) {
  await page.evaluate((yy) => window.scrollTo(0, yy === 'end' ? document.body.scrollHeight : +yy), y);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `verify-out/${name}-${y}.png` });
}
const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, sh: document.documentElement.scrollHeight }));
console.log(JSON.stringify({ name, ...m, errors }));
await browser.close();
