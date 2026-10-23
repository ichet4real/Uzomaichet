// Usage: node render.js frames_dir [workers]   |   node render.js --stills out_dir t1 t2 ...
const { chromium } = require(process.env.PW_PATH || '/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs');
const url = 'file://' + path.resolve(__dirname, 'index.html');
async function page(browser) {
  const p = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await p.goto(url); await p.evaluate(() => document.fonts.ready); return p;
}
(async () => {
  const browser = await chromium.launch();
  const args = process.argv.slice(2);
  if (args[0] === '--stills') {
    const out = args[1]; fs.mkdirSync(out, { recursive: true }); const p = await page(browser);
    for (const t of args.slice(2)) { await p.evaluate(t => render(+t), t); await p.screenshot({ path: `${out}/t${t}.jpg`, type: 'jpeg', quality: 85 }); }
  } else {
    const out = args[0], workers = +(args[1] || 4); fs.mkdirSync(out, { recursive: true });
    const { DUR, FPS } = await (await page(browser)).evaluate(() => ({ DUR, FPS }));
    const N = Math.round(DUR * FPS); let next = 0, done = 0;
    await Promise.all(Array.from({ length: workers }, async () => {
      const p = await page(browser);
      while (next < N) { const f = next++; await p.evaluate(t => render(t), f / FPS);
        await p.screenshot({ path: `${out}/f${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 94 });
        if (++done % 100 === 0) console.log(done, '/', N); }
    }));
  }
  await browser.close();
})();
