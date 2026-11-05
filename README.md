# Flow — GSAP motion graphic

An 8-second, 1920×1080, 30 fps promo for a fictional AI video app, **Flow**, built
with HTML, CSS, inline SVG and GSAP 3.15.1. It renders frame by frame in headless
Chromium and is encoded with FFmpeg as a silent H.264 (yuv420p) MP4.

**Deliverables:** `output/flow-gsap.mp4` · `output/flow-gsap-poster.png` (frame 225, 7.5 s)

## Commands

Install once (Node 18+, FFmpeg with libx264 on PATH):

```bash
npm install
```

Only needed if Playwright's Chromium isn't installed yet:

```bash
npx playwright install chromium
```

Preview at http://127.0.0.1:5173/ (play / pause / restart / scrubber, space toggles play):

```bash
npm run preview
```

Render the MP4 and poster (exactly 240 frames, 0–239):

```bash
npm run render
```

Run the quality checks (timing, safe area, overlaps, seek determinism):

```bash
npm run verify
```

Check the toolchain:

```bash
npm run check
```

## Files

| File | Purpose |
|---|---|
| `src/index.html` | Markup: wordmark, masked headline, cards, SVG icons and connectors |
| `src/styles.css` | Layout, colours (#FFFFFF / #171717 / #7C3AED), cards, bundled font |
| `src/animation.js` | The single paused master timeline and `renderAt(seconds)` |
| `src/harness.js` | Preview controls / fit-to-window, and capture mode (`?capture=1`) |
| `src/fonts/` | Inter 500/600/700 woff2 (SIL OFL 1.1), loaded as "Flow Sans" |
| `scripts/serve.mjs` | Local static server (serves GSAP from `node_modules`) |
| `scripts/capture.mjs` | Frame capture → FFmpeg → MP4, plus poster and frame-count check |
| `scripts/verify.mjs` | Automated QA checks |

## Timeline

| Time (s) | Beat |
|---|---|
| 0.00–0.40 | Wordmark fades in |
| 0.40–1.70 | Headline rises word by word through clipping masks; "videos" in violet |
| 2.00–3.65 | Cards rise with a 0.15 s stagger and settle from 95.5 % scale (no overshoot); icons and labels follow |
| 4.20–5.00 | Card details, left → right: the violet line writes itself, the square turns into a diamond while the circle pulses, the download arrow drops into the tray |
| 5.00–6.45 | Violet connectors draw behind the cards; nodes pop in |
| 6.50–7.00 | Soft halos settle around the nodes |
| 7.00–8.00 | Still hold |

## How the capture works

1. Loads `index.html?capture=1`: the controls are hidden, the stage sits at 1:1 at the top left, and GSAP's ticker is stopped.
2. Waits until every font weight has loaded (it fails loudly if one is missing) and checks for page errors.
3. For frame `i` = 0…239: calls `renderAt(i / 30)`, waits two animation frames, and screenshots the 1920×1080 stage.
4. Pipes each PNG to FFmpeg: `libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -movflags +faststart`, with no audio stream.
5. Counts the frames in the finished MP4 with ffprobe and fails unless there are 240.

Every tween is a `fromTo()` with exact start values, so seeking forward, backward or
at random gives pixel-identical frames (`npm run verify` checks this). Capture mode also forces a
full-frame repaint each frame so Chrome's partial repaints can't add tiny anti-aliasing differences.

Extra options: `npm run capture -- --keep-frames` saves the PNG frames to `output/frames/`.
Other options are listed at the top of `scripts/capture.mjs`.

## Notes

- gsap.com isn't reachable from the build sandbox, so the API was checked against the
  official docs and type definitions bundled in the `gsap` 3.15.1 package. GSAP and all its
  plugins are free under GreenSock's standard "no charge" license.
- Installing Node.js and FFmpeg on your own machine: macOS `brew install node ffmpeg`;
  Windows `winget install OpenJS.NodeJS.LTS` and `winget install Gyan.FFmpeg`;
  Ubuntu `sudo apt install -y ffmpeg` and Node from https://nodejs.org/en/download.
