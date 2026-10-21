# Vidu (#3) motion video

A 67s, 1920×1080 (16:9, YouTube) video for the "#3 Vidu AI" voiceover, timed to `assets/transcript.srt`.
No captions and no background music, as requested. It uses the same style and engine as the #5 PixVerse video.

- `assets/voiceover.mp3`, `assets/transcript.srt`: the supplied audio and transcript
- `assets/vidu/recordings/`: screen recordings, trimmed so the OBS window at the start/end is gone
- `assets/vidu/demos/`, `assets/vidu/screenshots/`: Vidu-generated demo clips and site screenshots
- `src/prepare_assets.sh`: crops the recordings to the browser page and builds frame folders + stills
- `src/scene.html`: all animation (12 scenes), driven by `render(t)`
- `src/render.mjs`: renders frames with headless Chromium and adds the voiceover with ffmpeg
- `out/vidu-motion-v1.mp4`: current render

## Render

```
src/prepare_assets.sh                                  # once
node src/render.mjs --out out/vidu-motion-v1.mp4        # full video (~3 min)
node src/render.mjs --stills 2,20,35                    # preview stills in out/stills/
```

## Scenes

| Time | Line | Visual |
|---|---|---|
| 0.0–4.2 | "number three… Vidu AI" | #3 title card + Vidu AI wordmark over the vidu.com hero |
| 4.2–6.3 | "still images into moving videos" | still frame → the same frame playing |
| 6.3–13.1 | character / model / product, "without filming" | three photo cards come alive, "No filming needed" |
| 13.1–16.6 | "image to video AI… real difference" | Vidu storm-cliff demo |
| 16.6–21.5 | "animating images… text prompts" | Create page menu, Image→Video / Text→Video highlighted |
| 21.5–28.8 | "reference images… consistent look" | Vidu Remix page + prompt, then reference face → 3 scenes "Same face" |
| 28.8–38.4 | 47% / 40% off, $10 & 800 credits | pricing page recording + counting price cards |
| 38.4–45.2 | "here's a tip… demonstration videos" | PRO TIP, showcase demos, "Demos aren't enough" |
| 45.2–50.4 | "upload… prompt… compare" | sped-up Create page recording + 3 steps, VS card |
| 50.4–57.4 | movement / quality / instructions / credits | four checklist cards with real footage |
| 57.4–62.2 | "worth testing… workflow" | WORTH TESTING stamp over vidu.com |
| 62.2–67.2 | "next two tools… let's find out" | #2 / #1 teaser |
