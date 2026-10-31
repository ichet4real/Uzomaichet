// Renders index.html frame-by-frame with Playwright.
// Usage: node render.js <buildDir> <outDir> [frame,frame,...]
// buildDir must contain index.html and scr/ (screen-recording frames).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const [buildDir, outDir, only] = process.argv.slice(2);
const FPS = 30, DURATION = 35.136;
const total = Math.ceil(DURATION * FPS);
const frames = only ? only.split(',').map(Number) : [...Array(total).keys()];
const WORKERS = only ? 1 : 4;

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const url = 'file://' + path.resolve(buildDir, 'index.html');
  let next = 0, done = 0;
  async function worker() {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    while (next < frames.length) {
      const f = frames[next++];
      await page.evaluate(t => window.render(t), f / FPS);
      await page.screenshot({ path: path.join(outDir, `f${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
      if (++done % 100 === 0) console.log(`${done}/${frames.length}`);
    }
    await page.close();
  }
  await Promise.all([...Array(WORKERS)].map(worker));
  await browser.close();
  console.log('done', done);
})();
