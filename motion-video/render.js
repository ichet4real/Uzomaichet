// Usage:
//   node render.js stills <outDir> <t1> <t2> ...   -> PNG stills at given times (s)
//   node render.js frames <outDir> [workers]        -> all frames at 30 fps (JPEG)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const FPS = 30, DURATION = 51.0;
const [mode, outDir, ...rest] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const url = 'file://' + path.join(__dirname, 'index.html');

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState('networkidle');
  return page;
}

(async () => {
  const browser = await chromium.launch();
  if (mode === 'stills') {
    const page = await openPage(browser);
    for (const t of rest.map(Number)) {
      await page.evaluate(t => window.renderAt(t), t);
      await page.screenshot({ path: path.join(outDir, `t${t.toFixed(2)}.png`) });
    }
  } else {
    const workers = Number(rest[0] || 4);
    const total = Math.round(DURATION * FPS);
    let next = 0;
    await Promise.all(Array.from({ length: workers }, async () => {
      const page = await openPage(browser);
      while (true) {
        const i = next++;
        if (i >= total) break;
        await page.evaluate(t => window.renderAt(t), i / FPS);
        await page.screenshot({ path: path.join(outDir, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 94 });
        if (i % 150 === 0) console.log('frame', i, '/', total);
      }
    }));
  }
  await browser.close();
})();
