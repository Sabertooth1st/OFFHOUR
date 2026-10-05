// End-to-end checks against a running preview (npm run build && npm run preview).
// Usage: node scripts/verify.mjs [baseUrl]
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';

const BASE = process.argv[2] ?? 'http://127.0.0.1:4173';
const CHROME = process.env.CHROME_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
await mkdir('verify-out', { recursive: true });

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`);
};

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function newPage(width, height, opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    hasTouch: width < 700,
    isMobile: width < 700,
    ...opts,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  // Lazy images cancelled by a navigation are not errors.
  page.on('requestfailed', (r) => r.failure()?.errorText !== 'net::ERR_ABORTED' && errors.push('requestfailed ' + r.url()));
  page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  return { page, ctx, errors };
}

const go = async (page, path) => {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
};
const scrollY = (page) => page.evaluate(() => window.scrollY);
const bagLabel = (page) => page.locator('.site-header .hdr-btn', { hasText: /^Bag/ }).first().innerText();

/* ---------- 1. Layout at four widths ---------- */
for (const [w, h] of [
  [360, 740],
  [390, 844],
  [768, 1024],
  [1440, 900],
]) {
  const { page, ctx, errors } = await newPage(w, h);
  for (const path of ['/', '/shop', '/shop/form-shell-jacket', '/shop/rib-knit']) {
    await go(page, path);
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
    check(`no horizontal overflow ${w}px ${path}`, m.sw <= m.cw, `${m.sw}/${m.cw}`);
    // scroll to the end to trigger lazy images and reveals
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
    });
    await page.waitForTimeout(400);
    const broken = await page.evaluate(() =>
      [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
    );
    check(`no broken images ${w}px ${path}`, broken.length === 0, broken.join(','));
  }
  check(`no console errors ${w}px`, errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

/* ---------- 2. Desktop flows ---------- */
{
  const { page, ctx, errors } = await newPage(1440, 900);
  await go(page, '/');

  // Navigation
  await page.getByRole('link', { name: 'Shop', exact: true }).first().click();
  await page.waitForURL('**/shop');
  check('nav Shop opens collection', page.url().endsWith('/shop'));
  await page.getByRole('link', { name: 'Details', exact: true }).first().click();
  await page.waitForTimeout(700);
  const detTop = await page.evaluate(() => document.getElementById('details')?.getBoundingClientRect().top ?? 9999);
  check('Details link lands on section', page.url().includes('#details') && detTop < 140 && detTop > -40, `top=${Math.round(detTop)}`);
  await page.getByRole('link', { name: 'About', exact: true }).first().click();
  await page.waitForTimeout(700);
  const aboutTop = await page.evaluate(() => document.getElementById('about')?.getBoundingClientRect().top ?? 9999);
  check('About link lands on section', page.url().includes('#about') && aboutTop < 140 && aboutTop > -40, `top=${Math.round(aboutTop)}`);
  await page.getByRole('link', { name: 'OFFHOUR, home' }).click();
  await page.waitForTimeout(400);
  check('logo returns home', new URL(page.url()).pathname === '/');

  // Header state
  await go(page, '/');
  const overAtTop = await page.locator('.site-header').evaluate((el) => el.classList.contains('is-over'));
  await page.evaluate(() => window.scrollTo(0, document.getElementById('hero').offsetHeight + 50));
  await page.waitForTimeout(500);
  const solidAfter = await page.locator('.site-header').evaluate((el) => el.classList.contains('is-solid'));
  check('header over hero then solid after it', overAtTop && solidAfter);

  // Search
  const searchBtn = page.getByRole('button', { name: 'Search', exact: true });
  await searchBtn.click();
  await page.waitForTimeout(500);
  check('search focuses input', await page.evaluate(() => document.activeElement?.id === 'search-input'));
  await page.keyboard.type('knit');
  await page.waitForTimeout(200);
  const hits = await page.locator('.search-item').allInnerTexts();
  check('search finds Rib Knit only', hits.length === 1 && hits[0].includes('Rib Knit') && hits[0].includes('CHF 165'), hits.join('|'));
  await page.fill('#search-input', 'zzzz');
  check('search empty state', (await page.locator('.search-empty').count()) === 1);
  await page.fill('#search-input', 'jacket');
  check('search by type finds jacket', (await page.locator('.search-item').count()) === 1);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(450);
  check('Escape closes search and returns focus', await page.evaluate(() => document.activeElement?.textContent?.trim() === 'Search'));
  check('page inert released', await page.evaluate(() => !document.getElementById('root')?.hasAttribute('inert')));

  // Collection filter / sort / state across navigation
  await go(page, '/shop');
  await page.getByRole('button', { name: 'Outerwear' }).click();
  await page.waitForTimeout(200);
  check('filter outerwear shows 2', (await page.locator('.card').count()) === 2);
  await page.selectOption('#sort', 'price-desc');
  const names = await page.locator('.card__name').allInnerTexts();
  check('sort price high to low', names[0] === 'Form Shell Jacket' && names[1] === 'Field Wool Overshirt', names.join(','));
  await page.getByRole('button', { name: 'On body' }).click();
  await page.locator('.card__name a').first().click();
  await page.waitForURL('**/shop/form-shell-jacket');
  await page.goBack();
  await page.waitForTimeout(500);
  const url = new URL(page.url());
  check('Back preserves filter, sort and view', url.searchParams.get('cat') === 'outerwear' && url.searchParams.get('sort') === 'price-desc' && url.searchParams.get('view') === 'body' && (await page.locator('.card').count()) === 2, url.search);
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.waitForTimeout(250);
  check('All shows 6', (await page.locator('.card').count()) === 6);

  // View toggle swaps primary image
  await go(page, '/shop');
  const before = await page.locator('.card__img').first().getAttribute('srcset');
  await page.getByRole('button', { name: 'On body' }).click();
  await page.waitForTimeout(200);
  const after = await page.locator('.card__img').first().getAttribute('srcset');
  check('Garment / On body toggle changes image', before !== after && after.includes('-body-'), after?.slice(0, 50));

  // Hover crossfade without layout shift
  await go(page, '/shop');
  const card = page.locator('.card').first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const boxBefore = await card.boundingBox();
  await card.hover();
  await page.waitForTimeout(350);
  const boxAfter = await card.boundingBox();
  const altOpacity = await card.locator('.card__img--alt').evaluate((e) => getComputedStyle(e).opacity);
  check('hover crossfades alt image, no layout shift', altOpacity === '1' && boxBefore.height === boxAfter.height && boxBefore.y === boxAfter.y, `opacity=${altOpacity}`);

  // Product page + bag
  await go(page, '/shop/form-shell-jacket');
  await page.getByRole('button', { name: 'Add to Bag' }).first().click();
  await page.waitForTimeout(300);
  const err = await page.locator('#size-error').innerText();
  check('size required before adding', err.includes('Select a size') && (await bagLabel(page)).includes('(0)'), err);
  check('focus moves to size group on error', await page.evaluate(() => document.activeElement?.getAttribute('name') === 'size'));
  await page.locator('.size-opt', { hasText: /^M$/ }).click();
  await page.getByRole('button', { name: 'Add to Bag' }).first().click();
  await page.waitForTimeout(600);
  check('drawer opens after add', (await page.locator('.overlay--drawer.is-shown').count()) === 1);
  check('bag count 1', (await bagLabel(page)).includes('(1)'), await bagLabel(page));
  let line = await page.locator('.bag-line').first().innerText();
  check('bag line shows product, colour, size, price', line.includes('Form Shell Jacket') && line.includes('Oxblood') && line.includes('size M') && line.includes('CHF 240'), line.replace(/\n/g, ' / '));
  await page.getByRole('button', { name: 'Increase quantity of Form Shell Jacket' }).click();
  await page.waitForTimeout(150);
  const sub = await page.locator('.bag-subtotal').innerText();
  check('quantity 2 gives subtotal CHF 480', sub.includes('CHF 480'), sub.replace(/\n/g, ' '));
  check('header count follows quantity', (await bagLabel(page)).includes('(2)'));
  check('demo disclosure in bag', (await page.locator('.panel__foot').innerText()).includes('No purchase or payment will be processed'));
  check('final action is Continue demo', (await page.getByRole('button', { name: 'Continue demo' }).count()) === 1);

  // Focus trap
  for (let i = 0; i < 14; i++) await page.keyboard.press('Tab');
  check('focus stays inside drawer', await page.evaluate(() => !!document.activeElement?.closest('.overlay__panel')));
  await page.getByRole('button', { name: 'Continue demo' }).click();
  check('Continue demo explains nothing is processed', (await page.locator('.panel__body').innerText()).includes('nothing is ordered, charged or sent'));
  await page.getByRole('button', { name: 'Back to bag' }).click();

  // Persistence
  await page.reload({ waitUntil: 'networkidle' });
  check('bag persists across reload', (await bagLabel(page)).includes('(2)'), await bagLabel(page));
  await page.getByRole('button', { name: /^Bag/ }).first().click();
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Remove' }).click();
  await page.waitForTimeout(200);
  check('empty bag state', (await page.locator('.panel__body--empty').innerText()).includes('Your bag is empty'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(450);
  check('bag count back to 0', (await bagLabel(page)).includes('(0)'));
  check('Escape from bag returns focus to Bag button', await page.evaluate(() => document.activeElement?.textContent?.includes('Bag')));

  // Totals across two different pieces
  await go(page, '/shop/rib-knit');
  await page.locator('.size-opt', { hasText: /^S$/ }).click();
  await page.getByRole('button', { name: 'Add to Bag' }).first().click();
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  await go(page, '/shop/heavyweight-tee');
  await page.locator('.size-opt', { hasText: /^L$/ }).click();
  await page.getByRole('button', { name: 'Add to Bag' }).first().click();
  await page.waitForTimeout(500);
  const sub2 = await page.locator('.bag-subtotal').innerText();
  check('two pieces total CHF 230', sub2.includes('CHF 230'), sub2.replace(/\n/g, ' '));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // Size guide + care dialogs
  await page.locator('.buy').getByRole('button', { name: 'Size guide' }).click();
  await page.waitForTimeout(400);
  check('size guide dialog open with table', (await page.locator('.size-table').count()) === 1);
  await page.locator('.info-tabs').getByRole('button', { name: 'Garment care' }).click();
  check('info dialog switches topic', (await page.locator('.info-list').count()) === 1);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // Fabric close-up
  await go(page, '/shop/form-shell-jacket');
  await page.getByRole('button', { name: 'View fabric' }).click();
  await page.waitForTimeout(500);
  check('fabric close-up opens with close focus', await page.evaluate(() => document.activeElement?.textContent?.includes('Close')));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  check('fabric closes, focus returns', await page.evaluate(() => document.activeElement?.textContent?.trim() === 'View fabric'));
  check('only the featured jacket has View fabric', (await (async () => { await go(page, '/shop/rib-knit'); return page.getByRole('button', { name: 'View fabric' }).count(); })()) === 0);

  // Unknown product
  await go(page, '/shop/does-not-exist');
  check('unknown product shows not found', (await page.locator('.notfound').count()) === 1);

  // Pinned chapters follow scroll in both directions
  await go(page, '/');
  const at = (id, f) =>
    page.evaluate(
      ([id, f]) => {
        const el = document.getElementById(id);
        const top = window.scrollY + el.getBoundingClientRect().top;
        window.scrollTo(0, top + (el.offsetHeight - window.innerHeight) * f);
      },
      [id, f],
    );
  const current = (sel) => page.evaluate((sel) => document.querySelector(`${sel} [aria-current="true"]`)?.textContent?.trim(), sel);
  const runSeq = [];
  for (const f of [0.05, 0.25, 0.45, 0.62, 0.78, 0.97, 0.45, 0.05]) {
    await at('collection', f);
    await page.waitForTimeout(350);
    runSeq.push(await current('.run__nav'));
  }
  check(
    'collection run steps through all six pieces and back',
    JSON.stringify(runSeq) ===
      JSON.stringify(['Form Shell Jacket', 'Field Wool Overshirt', 'Heavyweight Tee', 'Relaxed Pleat Trouser', 'Volume Hoodie', 'Rib Knit', 'Heavyweight Tee', 'Form Shell Jacket']),
    runSeq.join(' > '),
  );
  await at('collection', 0.6);
  await page.waitForTimeout(400);
  check('run panel links to the active piece', (await page.locator('.run__info a').getAttribute('href')) === '/shop/relaxed-pleat-trouser');
  await page.locator('.run__nav').getByRole('button', { name: 'Rib Knit' }).click();
  await page.waitForTimeout(1600);
  check('run list button jumps to that piece', (await current('.run__nav')) === 'Rib Knit');

  const angSeq = [];
  for (const f of [0.1, 0.37, 0.63, 0.9, 0.37]) {
    await at('angles', f);
    await page.waitForTimeout(350);
    angSeq.push(await current('.angles__list'));
  }
  check('angles step Front, Worn, Draped, Close and back', angSeq.join(',') === 'Front,Worn,Draped,Close,Worn', angSeq.join(','));

  const diveSeq = [];
  for (const f of [0.05, 0.3, 0.48, 0.64, 0.92, 0.3]) {
    await at('details', f);
    await page.waitForTimeout(350);
    diveSeq.push(await current('.dive__steps'));
  }
  check('detail dive goes jacket, collar, zip pull, zip, weave and back', diveSeq.join(',') === 'Jacket,Collar,Zip pull,Zip,Weave,Collar', diveSeq.join(','));
  await at('details', 0.92);
  await page.waitForTimeout(300);
  const layers = await page.evaluate(() => [...document.querySelectorAll('.dive__layer')].map((l) => +(+getComputedStyle(l).opacity).toFixed(2)));
  check('only the weave layer shows at the end of the dive', layers[2] === 1 && layers[0] === 0 && layers[1] === 0, JSON.stringify(layers));

  // Identity facts come from the catalogue
  const facts = await page.locator('.fact dt').allInnerTexts();
  check('identity facts read from the catalogue', facts.join('|') === '6|XS TO XL|6|CHF 65 TO 240', facts.join('|'));

  // Signup
  await page.locator('.signup').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Notify me' }).click();
  check('signup empty error', (await page.locator('.field__error').innerText()).includes('Enter your email'));
  await page.fill('.signup input', 'nope');
  await page.getByRole('button', { name: 'Notify me' }).click();
  check('signup invalid error', (await page.locator('.field__error').innerText()).includes('Check the address'));
  let leaked = false;
  page.on('request', (r) => {
    if (r.method() === 'POST') leaked = true;
  });
  await page.fill('.signup input', 'name@example.com');
  await page.getByRole('button', { name: 'Notify me' }).click();
  check('signup success is honest about being a demo', (await page.locator('.signup__done').innerText()).includes('demo') && !leaked);

  // Fast scroll: nothing left hidden above the viewport
  await go(page, '/');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  const hiddenAbove = await page.evaluate(() =>
    [...document.querySelectorAll('.reveal:not(.is-in)')].filter((e) => e.getBoundingClientRect().bottom < 0).length,
  );
  check('fast jump to bottom leaves no hidden content above', hiddenAbove === 0, `hidden=${hiddenAbove}`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);

  // Keyboard: skip link and visible focus
  await go(page, '/');
  await page.keyboard.press('Tab');
  check('skip link is first tab stop', await page.evaluate(() => document.activeElement?.classList.contains('skip-link')));

  check('no console errors on desktop flows', errors.length === 0, errors.slice(0, 4).join(' | '));
  await ctx.close();
}

/* ---------- 3. Mobile flows ---------- */
{
  const { page, ctx, errors } = await newPage(390, 844);
  await go(page, '/');
  check('mobile hero fills viewport', await page.evaluate(() => document.querySelector('.cine-hero__sticky').offsetHeight >= window.innerHeight - 2));
  await page.screenshot({ path: 'verify-out/m390-hero.png' });
  check('desktop nav hidden, menu button visible', !(await page.locator('.site-header__nav').isVisible()) && (await page.getByRole('button', { name: 'Menu' }).isVisible()));
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.waitForTimeout(500);
  check('menu opens with links', (await page.locator('.menu-list a').count()) === 3);
  await page.screenshot({ path: 'verify-out/m390-menu.png' });
  await page.locator('.menu-list a', { hasText: 'Shop' }).click();
  await page.waitForURL('**/shop');
  check('menu link navigates and closes', (await page.locator('.overlay.is-shown').count()) === 0);

  // Pinned chapters on a phone
  await go(page, '/');
  await page.locator('#collection').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  check('mobile run shows the active piece', (await page.locator('.run__name').innerText()).length > 0);
  await page.locator('#details').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  check('mobile dive shows a step note', (await page.locator('.dive__note h3').count()) === 1);

  // PDP mobile: gallery nav, buy bar
  await go(page, '/shop/form-shell-jacket');
  await page.getByRole('button', { name: 'Next image' }).click();
  await page.waitForTimeout(700);
  check('gallery next shows 2 / 3', (await page.locator('.gallery__count').innerText()).includes('2 / 3'));
  await page.locator('.gallery').focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(700);
  check('gallery arrow key shows 3 / 3', (await page.locator('.gallery__count').innerText()).includes('3 / 3'));
  await page.screenshot({ path: 'verify-out/m390-pdp.png' });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  check('mobile buy bar appears when inline CTA is off screen', await page.locator('.buybar').evaluate((e) => e.classList.contains('is-visible')));
  await page.locator('.buy .btn--solid').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -200));
  await page.waitForTimeout(500);
  check('buy bar hides while the inline CTA is on screen', !(await page.locator('.buybar').evaluate((e) => e.classList.contains('is-visible'))));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.locator('.buybar').getByRole('button', { name: 'Add to Bag' }).click();
  await page.waitForTimeout(400);
  check('buy bar requires size too', (await page.locator('#size-error').innerText()).includes('Select a size'));
  await page.locator('.size-opt', { hasText: /^S$/ }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'verify-out/m390-pdp-size.png' });
  await ctx.close();
  check('no console errors on mobile', errors.length === 0, errors.slice(0, 3).join(' | '));
}

/* ---------- 4. Reduced motion ---------- */
{
  const { page, ctx, errors } = await newPage(1440, 900, { reducedMotion: 'reduce' });
  await go(page, '/');
  check(
    'reduced motion replaces pinned chapters with static layouts',
    (await page.locator('.run--static').count()) === 1 && (await page.locator('.angles--static').count()) === 1 && (await page.locator('.dive--static').count()) === 1,
  );
  const hidden = await page.evaluate(() => [...document.querySelectorAll('.reveal')].filter((e) => getComputedStyle(e).opacity !== '1').length);
  check('reduced motion shows all content', hidden === 0, `hidden=${hidden}`);
  const wm = await page.locator('.cine-hero__photo').evaluate((e) => getComputedStyle(e).animationName);
  check('reduced motion has no hero opening animation', wm === 'none', wm);
  const zoom = await page.locator('.cine-hero__zoom').evaluate((e) => getComputedStyle(e).transform);
  check('reduced motion has no hero scale', zoom === 'none' || zoom === 'matrix(1, 0, 0, 1, 0, 0)', zoom);
  await ctx.close();
  check('no console errors reduced motion', errors.length === 0, errors.slice(0, 3).join(' | '));
}

/* ---------- 5. Storage unavailable ---------- */
{
  const { page, ctx } = await newPage(1440, 900);
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('blocked');
      },
    });
  });
  await go(page, '/shop/rib-knit');
  await page.locator('.size-opt', { hasText: /^M$/ }).click();
  await page.getByRole('button', { name: 'Add to Bag' }).first().click();
  await page.waitForTimeout(500);
  check('bag still works with storage blocked', (await bagLabel(page)).includes('(1)'));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('FAILED:\n' + failed.map((f) => ` - ${f.name} ${f.detail}`).join('\n'));
  process.exit(1);
}
