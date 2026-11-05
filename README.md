# Uzomaichet — HTML, CSS & GSAP motion graphics

Build an animation with HTML, CSS and GSAP, preview it live in a browser, then
export it frame by frame to an H.264 MP4.

## Requirements

| Tool | Version used | How it's provided |
|---|---|---|
| Node.js | 18+ (tested on 22) | system install |
| npm | ships with Node | system install |
| FFmpeg with libx264 | 6.x+ | system install |
| GSAP | 3.15.1 | `npm install` |
| Playwright | 1.63.0 (pinned) | `npm install` |
| Chromium | the build matching Playwright | `npx playwright install chromium` |

Check everything at once:

```bash
npm run check
```

## First-time setup

```bash
npm install
```

```bash
npx playwright install chromium
```

### Installing Node.js and FFmpeg on your own machine

**macOS** (with [Homebrew](https://brew.sh)):

```bash
brew install node ffmpeg
```

**Windows** (PowerShell, with winget):

```powershell
winget install OpenJS.NodeJS.LTS
winget install Gyan.FFmpeg
```

Close and reopen the terminal afterwards so `node` and `ffmpeg` are on PATH.

**Ubuntu / Debian:**

```bash
sudo apt update && sudo apt install -y ffmpeg
```

For Node.js on Linux, use the instructions at https://nodejs.org/en/download
(the version in the default apt repository is often too old).

If FFmpeg is installed somewhere not on PATH, set `FFMPEG_PATH` to its full path.
To use a different Chromium/Chrome, set `CHROMIUM_PATH`.

## Project layout

```
src/
  index.html     the stage (#stage = the video frame)
  styles.css     video size (--w / --h) and styles
  animation.js   the GSAP timeline + fps   <- write the animation here
  harness.js     preview/capture glue (no need to edit)
scripts/
  serve.mjs      local preview server (GSAP served from node_modules)
  capture.mjs    frame-by-frame capture -> H.264 MP4
  check-env.mjs  environment check
output/          rendered videos (git-ignored)
```

## Preview

```bash
npm run preview
```

Open http://127.0.0.1:5173/. The animation loops and has play/pause and a scrubber.
Use `PORT=8080 npm run preview` for another port.

## Export to MP4

```bash
npm run capture
```

Writes `output/animation.mp4` (1920×1080, 30 fps by default, H.264 High, yuv420p, `+faststart`).

How it works: the page loads with `?capture=1`, GSAP's clock is stopped, and for
every frame the script seeks the timeline to exactly `frame / fps`, takes a
screenshot in headless Chromium, and pipes the PNG into FFmpeg. Output is
deterministic and never drops frames, however slow the page is.

Options (pass after `--`):

```bash
npm run capture -- --fps 60 --out output/final.mp4 --crf 16 --keep-frames
```

| Option | Default | Meaning |
|---|---|---|
| `--fps` | `window.MOTION.fps` (30) | frame rate |
| `--duration` | timeline length | seconds to render |
| `--out` | `output/animation.mp4` | output file |
| `--crf` | 18 | quality (lower = better, bigger) |
| `--preset` | slow | x264 speed/size trade-off |
| `--scale` | 1 | device pixel ratio (2 = 2× resolution) |
| `--keep-frames` | off | also save PNGs to `output/frames/` |

## Rules for frame-accurate animations

- Put **all** motion on the single paused GSAP timeline `tl` in `src/animation.js`.
- Don't use CSS `@keyframes`/`transition`, `setTimeout`/`setInterval`, or unseeded
  `Math.random()` — they aren't driven by the timeline and won't export correctly.
- Change the video size with `--w` / `--h` in `src/styles.css` (e.g. 1080×1920 for vertical).
- GSAP plugins are available at `/vendor/gsap/<Plugin>.min.js`
  (e.g. SplitText, MotionPathPlugin, DrawSVGPlugin, MorphSVGPlugin). Load them with a
  `<script>` tag in `index.html` and call `gsap.registerPlugin(...)`.
