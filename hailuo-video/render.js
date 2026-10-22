// Renders src/index.html to video frames with headless Chromium.
// Usage:
//   node render.js stills 1.5 4.8 ...      -> out/stills/t_<time>.png
//   node render.js video [fps] [workers]   -> out/video_noaudio.mp4 + out/sfx.json
const { chromium } = require("playwright-core");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "out");
const PAGE = "file://" + path.join(__dirname, "src", "index.html");
const EXE = process.env.CHROME || "/opt/pw-browsers/chromium";

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.error("PAGE ERROR:", e.message));
  page.on("console", (m) => { if (m.type() === "error") console.error("console:", m.text()); });
  await page.goto(PAGE);
  await page.evaluate(() => window.__ready);
  return page;
}

async function stills(times) {
  const browser = await chromium.launch({ executablePath: EXE });
  const page = await openPage(browser);
  fs.mkdirSync(path.join(OUT, "stills"), { recursive: true });
  for (const t of times) {
    await page.evaluate((t) => window.__seek(t), t);
    const f = path.join(OUT, "stills", `t_${String(t).padStart(5, "0")}.png`);
    await page.screenshot({ path: f });
    console.log(f);
  }
  await browser.close();
}

async function segment(browser, fps, from, to, file) {
  const page = await openPage(browser);
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-r", String(fps), file], { stdio: ["pipe", "inherit", "inherit"] });
  // warm up tween state before the first frame of this segment
  await page.evaluate((t) => window.__seek(t), Math.max(0, from / fps - 0.001));
  for (let i = from; i < to; i++) {
    await page.evaluate((t) => window.__seek(t), i / fps);
    const buf = await page.screenshot({ type: "jpeg", quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if ((i - from) % 150 === 0) console.log(`${path.basename(file)}: frame ${i}/${to}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  await page.close();
}

async function video(fps = 30, workers = 3) {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXE });
  const probe = await openPage(browser);
  const dur = await probe.evaluate(() => window.__dur);
  const sfx = await probe.evaluate(() => window.__sfx);
  await probe.close();
  fs.writeFileSync(path.join(OUT, "sfx.json"), JSON.stringify(sfx, null, 1));
  const total = Math.ceil(dur * fps), per = Math.ceil(total / workers);
  const parts = [];
  const jobs = [];
  for (let k = 0; k < workers; k++) {
    const a = k * per, b = Math.min(total, a + per);
    const f = path.join(OUT, `part${k}.mp4`);
    parts.push(f);
    jobs.push(segment(browser, fps, a, b, f));
  }
  await Promise.all(jobs);
  await browser.close();
  fs.writeFileSync(path.join(OUT, "parts.txt"), parts.map((p) => `file '${p}'`).join("\n"));
  await new Promise((r) => spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", path.join(OUT, "parts.txt"), "-c", "copy", path.join(OUT, "video_noaudio.mp4")], { stdio: "inherit" }).on("close", r));
  console.log("done:", path.join(OUT, "video_noaudio.mp4"), total, "frames");
}

const [mode, ...args] = process.argv.slice(2);
if (mode === "stills") stills(args.map(Number));
else video(Number(args[0] || 30), Number(args[1] || 3));
