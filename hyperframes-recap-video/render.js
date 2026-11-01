// Renders index.html frame-by-frame with Playwright.
// Usage:
//   node render.js frames <outDir>            -> all frames (parallel workers)
//   node render.js stills <outDir> t1 t2 ...  -> PNG stills at given seconds
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FPS = 30, DURATION = 88.44, WORKERS = 4;
const url = 'file://' + path.join(__dirname, 'index.html');

async function newPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  return page;
}

(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  if (mode === 'stills') {
    const page = await newPage(browser);
    for (const s of rest) {
      await page.evaluate(t => window.render(t), parseFloat(s));
      await page.screenshot({ path: path.join(out, `still_${s}.png`) });
    }
  } else {
    const total = Math.ceil(DURATION * FPS);
    let next = 0, done = 0;
    await Promise.all(Array.from({ length: WORKERS }, async () => {
      const page = await newPage(browser);
      while (next < total) {
        const f = next++;
        await page.evaluate(t => window.render(t), f / FPS);
        await page.screenshot({ path: path.join(out, String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
        if (++done % 150 === 0) console.log(`${done}/${total}`);
      }
    }));
  }
  await browser.close();
})();
