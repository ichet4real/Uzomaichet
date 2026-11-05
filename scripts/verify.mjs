// Automated quality checks for the Flow animation.
//   npm run verify
import crypto from 'node:crypto';
import { chromium } from 'playwright';
import { startServer } from './serve.mjs';

const server = await startServer(0);
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const results = [];
const check = (name, pass, detail = '') => results.push({ name, pass, detail });

try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('requestfailed', (r) => errors.push('request failed: ' + r.url()));
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html?capture=1`);
  await page.waitForFunction(() => window.__ready || window.__error, null, { timeout: 30000 });
  check('Fonts and assets load', !(await page.evaluate(() => window.__error)) && errors.length === 0, errors.join('; '));

  const fps = 30;
  const info = await page.evaluate(() => window.__motion);
  check('Duration is exactly 8 s / 240 frames', info.duration === 8 && Math.round(info.duration * fps) === 240, `${info.duration}s`);

  const shot = async (t) => {
    await page.evaluate((t) => window.__motion.renderAt(t), t);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    return crypto.createHash('md5').update(await page.screenshot({ clip: { x: 0, y: 0, width: 1920, height: 1080 } })).digest('hex');
  };

  // 1. Determinism: forward, backward and shuffled seeks must produce identical pixels
  const frames = [0, 6, 12, 20, 35, 51, 62, 70, 90, 126, 132, 140, 148, 160, 175, 190, 196, 205, 210, 239];
  const fwd = {}; for (const f of frames) fwd[f] = await shot(f / fps);
  const bad = [];
  for (const f of [...frames].reverse()) if ((await shot(f / fps)) !== fwd[f]) bad.push(`f${f} (backward)`);
  const shuffled = [...frames].sort((a, b) => ((a * 7919) % 31) - ((b * 7919) % 31));
  for (const f of shuffled) if ((await shot(f / fps)) !== fwd[f]) bad.push(`f${f} (random)`);
  check('Seeking forward/backward/random gives identical frames', bad.length === 0, bad.join(', '));

  // 2. Hold: frames 210..239 identical
  check('7.00–8.00 s hold is perfectly still', fwd[210] === fwd[239]);
  check('Movement continues up to 6.5 s', fwd[190] !== fwd[210]);

  // 3. Timing snapshots
  const state = (t) => page.evaluate((t) => {
    window.renderAt(t);
    const g = (sel, p) => [...document.querySelectorAll(sel)].map((el) => gsap.getProperty(el, p));
    return {
      wordmark: +getComputedStyle(document.querySelector('.wordmark')).opacity,
      words: g('.headline .word', 'yPercent'),
      cardsOpacity: g('.card', 'opacity'), cardsY: g('.card', 'y'), cardsScale: g('.card', 'scale'),
      square: gsap.getProperty('#anim-square', 'rotation'), arrow: gsap.getProperty('#export-arrow', 'y'),
      lines: [...document.querySelectorAll('.connector__line')].map((l) => getComputedStyle(l).strokeDashoffset),
    };
  }, t);
  const s040 = await state(0.4), s170 = await state(1.7), s199 = await state(1.99), s420 = await state(4.2),
        s500 = await state(5.0), s499 = await state(4.99), s700 = await state(7.0);
  check('Wordmark fully visible at 0.40 s', s040.wordmark === 1);
  check('Headline hidden before 0.40 s, done at 1.70 s', s040.words.every((v) => v >= 124) && s170.words.every((v) => v === 0), JSON.stringify(s170.words));
  check('Cards not visible before 2.00 s', s199.cardsOpacity.every((v) => v === 0));
  check('Cards settled by 4.20 s (no overshoot)', s420.cardsOpacity.every((v) => v === 1) && s420.cardsY.every((v) => Math.abs(v) < 0.01) && s420.cardsScale.every((v) => v === 1));
  check('Card details start at 4.20 s, finish by 5.00 s', s420.square === 0 && s499.arrow < 0 && s500.arrow === 0 && s500.square === 45);
  check('Connectors undrawn at 5.00 s, drawn by 7.00 s', JSON.stringify(s500.lines) !== JSON.stringify(s700.lines) && s700.lines.every((v) => v === "0px"));

  // 4. Layout at the final composition
  const L = await page.evaluate(() => {
    window.renderAt(7.5);
    const r = (el) => { const b = el.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; };
    const all = (sel) => [...document.querySelectorAll(sel)].map(r);
    return {
      wordmark: r(document.querySelector('.wordmark')), headline: all('.headline .word'), masks: all('.headline .mask'),
      cards: all('.card'), labels: all('.card__label'), icons: all('.card__icon'),
      lines: all('.connector__line'), nodes: all('.connector__halo'),
      text: document.getElementById('stage').innerText.split(/\s+/).filter(Boolean),
    };
  });
  const essentials = [L.wordmark, ...L.headline, ...L.cards];
  const outside = essentials.filter((b) => b.l < 100 || b.t < 100 || b.r > 1820 || b.b > 980);
  check('All essential content ≥100 px from edges', outside.length === 0, JSON.stringify(outside));
  const words = L.headline, masks = L.masks;
  check('Headline glyph boxes sit inside their masks', words.every((w, i) => w.l >= masks[i].l && w.r <= masks[i].r && w.t >= masks[i].t && w.b <= masks[i].b));
  check('No overlap: wordmark / headline / cards', L.wordmark.b < Math.min(...words.map((w) => w.t)) && Math.max(...words.map((w) => w.b)) < Math.min(...L.cards.map((c) => c.t)));
  const lineInText = L.lines.some((ln) => [...L.labels, ...L.icons].some((t) => ln.b >= t.t && ln.t <= t.b && ln.r >= t.l && ln.l <= t.r));
  check('Connectors never cross card text or icons', !lineInText);
  const gapsOK = L.lines.every((ln, i) => ln.l < L.cards[i].r && ln.r > L.cards[i + 1].l)
    && L.nodes.every((n, i) => n.l > L.cards[i].r && n.r < L.cards[i + 1].l);
  check('Connector ends tuck behind cards; nodes sit in the gaps', gapsOK);
  const allowed = ['Flow', 'Turn', 'ideas', 'into', 'videos', 'Write', 'Animate', 'Export'];
  check('Only the approved text is visible', L.text.every((w) => allowed.includes(w)) && allowed.every((w) => L.text.includes(w)), L.text.join(' '));
} finally {
  await browser.close();
  server.close();
}

let failed = 0;
for (const r of results) { if (!r.pass) failed++; console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${!r.pass && r.detail ? '  -> ' + r.detail : ''}`); }
console.log(failed ? `\n${failed} check(s) failed.` : `\nAll ${results.length} checks passed.`);
process.exit(failed ? 1 : 0);
