// Reports whether every tool the workflow needs is available.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let ok = true;
const row = (name, pass, detail) => { if (!pass) ok = false; console.log(`${pass ? 'OK  ' : 'MISS'} ${name.padEnd(12)} ${detail}`); };
const run = (cmd, args) => { try { return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); } catch { return null; } };

row('Node.js', true, process.version);
const npmV = run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['-v']);
row('npm', !!npmV, npmV ? npmV.trim() : 'not found');

const ffBin = process.env.FFMPEG_PATH || 'ffmpeg';
const ffV = run(ffBin, ['-hide_banner', '-version']);
row('FFmpeg', !!ffV, ffV ? ffV.split('\n')[0] : 'not found on PATH (see README)');
const enc = ffV && run(ffBin, ['-hide_banner', '-encoders']);
row('libx264', !!enc && /libx264/.test(enc), enc && /libx264/.test(enc) ? 'H.264 encoder available' : 'FFmpeg build lacks libx264');

try { row('GSAP', true, require('gsap/package.json').version); } catch { row('GSAP', false, 'run npm install'); }

let pwVersion = null;
try { pwVersion = require('playwright/package.json').version; row('Playwright', true, pwVersion); }
catch { row('Playwright', false, 'run npm install'); }

if (pwVersion) {
  const { chromium } = await import('playwright');
  const exe = process.env.CHROMIUM_PATH || chromium.executablePath();
  const found = fs.existsSync(exe);
  let detail = found ? exe : `missing at ${exe} (run: npx playwright install chromium)`;
  if (found) {
    try {
      const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: exe } : {});
      detail = `Chromium ${b.version()} launches OK`;
      await b.close();
    } catch (e) { detail = `found but failed to launch: ${e.message.split('\n')[0]}`; ok = false; }
  }
  row('Chromium', found, detail);
}

console.log(ok ? '\nEnvironment ready.' : '\nSome items are missing — see README.md.');
process.exit(ok ? 0 : 1);
