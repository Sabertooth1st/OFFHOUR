// Screenshots the home film at set points: node scripts/chapters.mjs <width> <height> [prefix] [reduce]
import { chromium } from 'playwright-core';
const [w = '1440', h = '900', prefix = 'c', reduce] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({
  viewport: { width: +w, height: +h },
  hasTouch: +w < 700,
  isMobile: +w < 700,
  reducedMotion: reduce ? 'reduce' : 'no-preference',
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.screenshot({ path: `verify-out/${prefix}-00-load.png` });
await page.waitForTimeout(2800);
await page.screenshot({ path: `verify-out/${prefix}-01-hero.png` });
// Points through the film, 0..1 of its scroll travel.
const points = reduce ? [] : [0.05, 0.12, 0.17, 0.24, 0.3, 0.36, 0.41, 0.46, 0.5, 0.53, 0.58, 0.62, 0.66, 0.71, 0.75, 0.79, 0.84, 0.9, 0.97];
for (const f of points) {
  await page.evaluate((f) => {
    const el = document.getElementById('film');
    const top = window.scrollY + el.getBoundingClientRect().top;
    window.scrollTo(0, top + (el.offsetHeight - window.innerHeight) * f);
  }, f);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `verify-out/${prefix}-f${String(Math.round(f * 100)).padStart(2, '0')}.png` });
}
if (reduce) {
  for (const id of ['collection', 'angles', 'about', 'details', 'last-light']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    await page.evaluate((id) => document.getElementById(id).scrollIntoView(), id);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `verify-out/${prefix}-s-${id}.png` });
  }
}
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(700);
await page.screenshot({ path: `verify-out/${prefix}-zz-end.png` });
console.log(JSON.stringify({ errors, sw: await page.evaluate(() => document.documentElement.scrollWidth) }));
await browser.close();
