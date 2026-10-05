// Screenshots each pinned chapter at set points: node scripts/chapters.mjs <width> <height> [prefix]
import { chromium } from 'playwright-core';
const [w = '1440', h = '900', prefix = 'c'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: +w, height: +h }, hasTouch: +w < 700, isMobile: +w < 700 });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2800);
await page.screenshot({ path: `verify-out/${prefix}-hero.png` });
const plan = { collection: [0.1, 0.55], angles: [0.12, 0.38, 0.62, 0.88], about: [0.5, 1.2], details: [0.05, 0.3, 0.48, 0.64, 0.92] };
for (const [id, fr] of Object.entries(plan)) {
  for (const f of fr) {
    await page.evaluate(([id, f]) => {
      const el = document.getElementById(id);
      const top = window.scrollY + el.getBoundingClientRect().top;
      const travel = Math.max(el.offsetHeight - window.innerHeight, window.innerHeight);
      window.scrollTo(0, top + travel * f);
    }, [id, f]);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `verify-out/${prefix}-${id}-${f}.png` });
  }
}
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight - window.innerHeight * 1.6));
await page.waitForTimeout(800);
await page.screenshot({ path: `verify-out/${prefix}-finale.png` });
console.log(JSON.stringify({ errors, sw: await page.evaluate(() => document.documentElement.scrollWidth) }));
await browser.close();
