// Frame-by-frame capture of src/index.html to an H.264 MP4.
// Each frame: seek the GSAP timeline to an exact time -> screenshot -> pipe PNG to FFmpeg.
//
//   npm run render                     -> output/flow-gsap.mp4 + output/flow-gsap-poster.png
//   npm run capture -- --keep-frames   (custom options)
//
// Options:
//   --fps <n>          frames per second (default: window.MOTION.fps, else 30)
//   --duration <s>     override timeline length in seconds
//   --out <file>       output path (default: output/animation.mp4)
//   --crf <n>          H.264 quality, lower = better (default 18)
//   --preset <name>    x264 preset (default: slow)
//   --scale <n>        device pixel ratio, e.g. 2 for 2x supersampled (default 1)
//   --keep-frames      also save PNG frames to output/frames/
//   --poster <file>    also save one frame as a PNG poster
//   --poster-time <s>  time of the poster frame (default: 7.5)
//   --page <path>      page to capture (default: /index.html)
// Env: FFMPEG_PATH, CHROMIUM_PATH to override binaries.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import { startServer } from './serve.mjs';

const { values: opt } = parseArgs({
  options: {
    fps: { type: 'string' },
    duration: { type: 'string' },
    out: { type: 'string', default: 'output/flow-gsap.mp4' },
    poster: { type: 'string' },
    'poster-time': { type: 'string', default: '7.5' },
    crf: { type: 'string', default: '18' },
    preset: { type: 'string', default: 'slow' },
    scale: { type: 'string', default: '1' },
    'keep-frames': { type: 'boolean', default: false },
    page: { type: 'string', default: '/index.html' },
  },
});

const ffmpegBin = process.env.FFMPEG_PATH || 'ffmpeg';
const server = await startServer(0);
const url = `http://127.0.0.1:${server.address().port}${opt.page}?capture=1`;

const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  args: ['--hide-scrollbars', '--force-color-profile=srgb', '--disable-lcd-text', '--font-render-hinting=none'],
});

try {
  // Load once to measure the stage, then size the viewport to match exactly.
  const scale = Number(opt.scale);
  let page = await browser.newPage();
  await page.goto(url);
  const { width, height } = await page.evaluate(() => {
    const r = document.getElementById('stage').getBoundingClientRect();
    return { width: Math.round(r.width), height: Math.round(r.height) };
  });
  await page.close();

  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale });
  page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('Page error:', e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.__ready === true || !!window.__error, null, { timeout: 30000 });
  const loadError = await page.evaluate(() => window.__error);
  if (loadError) throw new Error(loadError);

  const info = await page.evaluate(() => ({ duration: window.__motion.duration, fps: window.__motion.fps }));
  const fps = Number(opt.fps || info.fps);
  const duration = Number(opt.duration || info.duration);
  const total = Math.max(1, Math.round(duration * fps));
  const outW = width * scale, outH = height * scale;

  fs.mkdirSync(path.dirname(path.resolve(opt.out)), { recursive: true });
  const framesDir = path.resolve('output/frames');
  if (opt['keep-frames']) { fs.rmSync(framesDir, { recursive: true, force: true }); fs.mkdirSync(framesDir, { recursive: true }); }

  console.log(`Capturing ${total} frames (${duration}s @ ${fps}fps, ${outW}x${outH}) -> ${opt.out}`);

  const ff = spawn(ffmpegBin, [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-vf', 'pad=ceil(iw/2)*2:ceil(ih/2)*2',   // H.264 yuv420p needs even dimensions
    '-c:v', 'libx264', '-preset', opt.preset, '-crf', opt.crf,
    '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-r', String(fps), '-movflags', '+faststart',
    opt.out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });
  const ffDone = new Promise((res, rej) => {
    ff.on('error', rej);
    ff.on('close', (code) => (code === 0 ? res() : rej(new Error(`ffmpeg exited with code ${code}`))));
  });

  const posterFrame = opt.poster ? Math.min(total - 1, Math.round(Number(opt['poster-time']) * fps)) : -1;
  const started = Date.now();
  for (let i = 0; i < total; i++) {
    await page.evaluate((t) => window.__motion.renderAt(t), i / fps);
    // Let the browser commit the new styles before taking the shot
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width, height } });
    if (i === posterFrame) { fs.mkdirSync(path.dirname(path.resolve(opt.poster)), { recursive: true }); fs.writeFileSync(opt.poster, png); }
    if (opt['keep-frames']) fs.writeFileSync(path.join(framesDir, `frame_${String(i).padStart(5, '0')}.png`), png);
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % fps === 0 || i === total - 1) process.stdout.write(`\r  frame ${i + 1}/${total}`);
  }
  ff.stdin.end();
  await ffDone;
  // Verify the file exists and holds the expected number of frames
  const probe = spawn(ffmpegBin.replace(/ffmpeg(\.exe)?$/, 'ffprobe$1'), ['-v', 'error', '-count_frames', '-select_streams', 'v:0',
    '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', opt.out]);
  let probed = ''; probe.stdout.on('data', (d) => (probed += d));
  await new Promise((r) => probe.on('close', r));
  if (!fs.existsSync(opt.out)) throw new Error('Encoding finished but the MP4 was not written');
  if (probed.trim() && Number(probed) !== total) throw new Error(`Expected ${total} frames, MP4 has ${probed.trim()}`);
  console.log(`\nVerified ${probed.trim() || '?'} frames in MP4${opt.poster ? `; poster = frame ${posterFrame} -> ${opt.poster}` : ''}`);
  console.log(`\nDone in ${((Date.now() - started) / 1000).toFixed(1)}s: ${path.resolve(opt.out)}`);
} finally {
  await browser.close();
  server.close();
}
