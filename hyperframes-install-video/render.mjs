// Renders composition.html frame-by-frame with headless Chromium.
// Usage: node render.mjs <workDir> <outDir> [fps] [workers] [times...]
//   workDir must contain composition.html and a frames/ folder of source-video JPGs.
//   If times are given, only those timestamps (seconds) are rendered (for previews).
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const [workDir, outDir, fpsArg = '30', workersArg = '4', ...times] = process.argv.slice(2);
const fps = Number(fpsArg), workers = Number(workersArg);
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const url = 'file://' + path.resolve(workDir, 'composition.html');

async function makePage() {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  return page;
}

let jobs;
if (times.length) jobs = times.map((t, i) => ({ t: Number(t), name: `preview_${String(i).padStart(2, '0')}_${t}s.jpg` }));
else {
  const dur = await (await makePage()).evaluate(() => window.DUR);
  const n = Math.round(dur * fps);
  jobs = Array.from({ length: n }, (_, f) => ({ t: f / fps, name: `${String(f + 1).padStart(5, '0')}.jpg` }));
}

// Each worker renders a contiguous slice so image swaps stay sequential.
const per = Math.ceil(jobs.length / workers);
let done = 0;
await Promise.all(Array.from({ length: workers }, async (_, w) => {
  const slice = jobs.slice(w * per, (w + 1) * per);
  if (!slice.length) return;
  const page = await makePage();
  for (const j of slice) {
    await page.evaluate(t => window.renderAt(t), j.t);
    await page.screenshot({ path: path.join(outDir, j.name), type: 'jpeg', quality: 93 });
    if (++done % 100 === 0) console.log(`${done}/${jobs.length}`);
  }
}));
await browser.close();
console.log('done', jobs.length);
