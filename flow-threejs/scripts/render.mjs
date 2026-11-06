// Deterministic capture: renders frames 0–179 at frameIndex/30 s in headless
// Chromium, screenshots the 1920×1080 stage (WebGL canvas + 2D overlay together,
// controls excluded), then encodes the PNG sequence to H.264 / yuv420p with FFmpeg.
//
// Usage: node scripts/render.mjs [--scale 0.5] [--out output/x.mp4] [--frames 0,54,179]
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};

const FPS = 30;
const FRAME_COUNT = 180;
const scale = Number(opt('scale', '1'));
const outFile = path.resolve(root, opt('out', 'output/flow-threejs.mp4'));
const onlyFrames = opt('frames', null)?.split(',').map(Number);
const isFinal = scale === 1 && !onlyFrames;
const framesDir = path.join(root, 'output', 'frames', scale === 1 ? 'final' : `scale-${scale}`);

fs.rmSync(framesDir, { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

const server = await createServer({ root, logLevel: 'error', server: { port: 0, strictPort: false } });
await server.listen();
const url = `${server.resolvedUrls.local[0]}?capture`;

// Explicit executablePath only if the env provides one (e.g. a pinned system Chromium).
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--hide-scrollbars'],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: scale });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log(`[page] ${m.text()}`); });
page.on('pageerror', (e) => { console.error('[page error]', e); });

await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => window.flow.ready);
const gl = await page.evaluate(() => {
  const ctx = document.getElementById('scene').getContext('webgl2');
  const ext = ctx.getExtension('WEBGL_debug_renderer_info');
  return ext ? ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ctx.getParameter(ctx.RENDERER);
});
console.log(`WebGL renderer: ${gl}`);

const clip = { x: 0, y: 0, width: 1920, height: 1080 };
const shoot = async (frame, file) => {
  await page.evaluate((t) => window.flow.renderAtTime(t), frame / FPS);
  // Let the compositor present the new WebGL frame and overlay styles.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const buf = await page.screenshot({ clip, type: 'png', animations: 'disabled', caret: 'hide' });
  if (file) fs.writeFileSync(file, buf);
  return createHash('sha256').update(buf).digest('hex');
};

// Determinism check: render the final frame first, cold, before any other frame.
const coldFinalHash = await shoot(FRAME_COUNT - 1, path.join(framesDir, 'cold-final.png'));

const list = onlyFrames ?? [...Array(FRAME_COUNT).keys()];
const started = Date.now();
const hashes = {};
for (const f of list) {
  hashes[f] = await shoot(f, path.join(framesDir, `frame_${String(f).padStart(3, '0')}.png`));
  if (f % 30 === 0 || f === list.at(-1)) {
    const per = (Date.now() - started) / (list.indexOf(f) + 1);
    console.log(`frame ${f}/${FRAME_COUNT - 1}  (${per.toFixed(0)} ms/frame)`);
  }
}
// Render frame 0 again after the sequence: must match the first pass.
const repeatFirst = list.includes(0) ? await shoot(0) : null;

await browser.close();
await server.close();

if (hashes[FRAME_COUNT - 1]) {
  console.log(`Final frame direct-render match: ${coldFinalHash === hashes[FRAME_COUNT - 1] ? 'YES' : 'NO'}`);
}
if (repeatFirst) console.log(`Frame 0 re-render match: ${repeatFirst === hashes[0] ? 'YES' : 'NO'}`);

if (onlyFrames) {
  console.log(`Stills written to ${path.relative(root, framesDir)}`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
const ff = spawnSync('ffmpeg', [
  '-y', '-hide_banner', '-loglevel', 'error',
  '-framerate', String(FPS),
  '-start_number', '0',
  '-i', path.join(framesDir, 'frame_%03d.png'),
  '-frames:v', String(FRAME_COUNT),
  '-an',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-tune', 'animation',
  '-pix_fmt', 'yuv420p',
  // Tag BT.709 so players don't shift the white background or the violet.
  '-vf', 'scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv',
  '-r', String(FPS),
  '-movflags', '+faststart',
  outFile,
], { stdio: 'inherit' });
if (ff.status !== 0) {
  console.error('FFmpeg failed. Is ffmpeg (with libx264) on PATH?');
  process.exit(1);
}
console.log(`Encoded ${path.relative(root, outFile)}`);

if (isFinal) {
  fs.copyFileSync(path.join(framesDir, 'frame_179.png'), path.join(root, 'output', 'flow-threejs-poster.png'));
  console.log('Poster: output/flow-threejs-poster.png (final frame)');
}

const verify = spawnSync('node', [path.join(root, 'scripts', 'verify.mjs'), outFile, String(1920 * scale), String(1080 * scale)], { stdio: 'inherit' });
process.exit(verify.status ?? 1);
