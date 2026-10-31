const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  const [,, dir, mode, out, cc] = process.argv;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await page.goto('file://' + path.resolve(dir, 'index.html') + (cc === '1' ? '?cc=1' : ''));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  if (mode === 'stills') {
    const times = out.split(',').map(Number);
    for (const t of times) {
      await page.evaluate(t => window.render(t), t);
      await page.screenshot({ path: path.resolve(dir, `still_${t}.jpg`), type: 'jpeg', quality: 80 });
    }
  } else {
    const fps = 30, dur = 48.624, n = Math.ceil(dur * fps);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-i', path.resolve(dir, 'assets/audio.mp3'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17',
      '-pix_fmt', 'yuv420p', '-r', String(fps), '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', '-shortest', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) {
      await page.evaluate(t => window.render(t), i / fps);
      const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 150 === 0) console.log(`frame ${i}/${n}`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
