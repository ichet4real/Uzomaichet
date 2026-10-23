const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path'), fs = require('fs');
const [,, mode, outDir, ...rest] = process.argv;
const FPS = 30, DUR = 27.3;
(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const url = 'file://' + path.resolve(__dirname, 'scene.html');
  fs.mkdirSync(outDir, { recursive: true });
  const mk = async () => { const pg = await browser.newPage({ viewport: { width: 1920, height: 1080 } }); await pg.goto(url); await pg.evaluate(() => window.ready); return pg; };
  if (mode === 'stills') {
    const pg = await mk();
    for (const t of rest) { await pg.evaluate(t => renderAt(t), +t); await pg.screenshot({ path: `${outDir}/t_${t}.png` }); }
  } else {
    const N = Math.round(DUR * FPS), W = 4;
    await Promise.all([...Array(W)].map(async (_, w) => {
      const pg = await mk();
      for (let i = w; i < N; i += W) {
        await pg.evaluate(t => renderAt(t), i / FPS);
        await pg.screenshot({ path: `${outDir}/f_${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 95 });
      }
    }));
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
