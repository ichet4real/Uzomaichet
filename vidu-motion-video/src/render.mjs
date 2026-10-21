// Renders scene.html frame by frame with headless Chromium, then muxes the voiceover with ffmpeg.
// Usage: node src/render.mjs [--fps 30] [--out out/vidu.mp4] [--stills 1.5,9,20]
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(execFileSync('npm', ['root', '-g']).toString().trim(), 'playwright'))); }

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const FPS = +arg('--fps', 30);
const OUT = path.resolve(ROOT, arg('--out', 'out/vidu-motion.mp4'));
const STILLS = arg('--stills', null);
const WORKERS = +arg('--workers', 4);

// --- transcript ---
const ts = s => { const [h, m, r] = s.split(':'); const [sec, ms] = r.split(','); return +h * 3600 + +m * 60 + +sec + +ms / 1000; };
const srt = fs.readFileSync(path.join(ROOT, 'assets/transcript.srt'), 'utf8').replace(/\r/g, '');
const SEG = srt.trim().split(/\n\n+/).map(b => {
  const l = b.split('\n'); const [a, z] = l[1].split(' --> ');
  return { start: ts(a), end: ts(z), text: l.slice(2).join(' ') };
});

const ASSETS = {};  // Vidu media paths live in scene.html (run src/prepare_assets.sh first)

const audio = path.join(ROOT, 'assets/voiceover.mp3');
const DURATION = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio]).toString().trim();
const N = Math.ceil(DURATION * FPS);

const browser = await chromium.launch();
async function page() {
  const p = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.join(ROOT, 'src/scene.html'));
  await p.evaluate(([s, a, f, d]) => { window.DURATION = d; window.init(s, a, f); }, [SEG, ASSETS, FPS, DURATION]);
  return p;
}

if (STILLS) {
  const p = await page();
  fs.mkdirSync(path.join(ROOT, 'out/stills'), { recursive: true });
  for (const s of STILLS.split(',').map(Number)) {
    await p.evaluate(t => window.render(t), s);
    await p.screenshot({ path: path.join(ROOT, `out/stills/t${s.toFixed(2)}.jpg`), type: 'jpeg', quality: 85 });
  }
  console.log('stills written');
} else {
  const frames = path.join(ROOT, 'out/frames');
  fs.rmSync(frames, { recursive: true, force: true });
  fs.mkdirSync(frames, { recursive: true });
  let done = 0;
  await Promise.all([...Array(WORKERS).keys()].map(async w => {
    const p = await page();
    for (let i = w; i < N; i += WORKERS) {
      await p.evaluate(t => window.render(t), i / FPS);
      await p.screenshot({ path: path.join(frames, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 93 });
      if (++done % 150 === 0) console.log(`${done}/${N}`);
    }
  }));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(frames, 'f%05d.jpg'), '-i', audio,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
    '-af', 'adelay=0', '-shortest', '-movflags', '+faststart', OUT], { stdio: 'inherit' });
  console.log('wrote', OUT);
}
await browser.close();
