# PixVerse motion graphics video

A 43.7s, 1920×1080 motion graphics video for the "#5 PixVerse" voiceover, timed to `assets/transcript.srt`.

- `assets/voiceover.mp3`, `assets/transcript.srt` — the supplied audio and transcript
- `src/scene.html` — all animation (8 scenes + word-by-word captions), driven by `render(t)`
- `src/render.mjs` — renders every frame with headless Chromium and muxes the audio with ffmpeg
- `src/prepare_assets.sh` — cuts the PixVerse recordings/screenshots into stills and frame sequences
- `out/pixverse-motion-v2.mp4` — current render (with real PixVerse footage)

## Render

```
src/prepare_assets.sh                                    # once, after changing recordings/crops
node src/render.mjs --out out/pixverse-motion-v2.mp4      # full video (~2 min)
node src/render.mjs --stills 2.6,13.8,33                   # preview stills in out/stills/
```

## Scenes

| Time | Line | Visual |
|---|---|---|
| 0.0–2.9 | "number five, Pixverse" | #5 reveal + PixVerse wordmark |
| 2.9–7.3 | "short-form content" | three phone frames rise in |
| 7.3–14.4 | TikTok / Shorts / Reels / promo → "worth testing" | platform cards pop on each word, stamp |
| 14.4–24.2 | "without paying for a subscription" / "first time" | price counts down to $0, FREE TO START, checklist |
| 24.2–32.4 | styles, effects, idea → video, no complicated software | style tiles, prompt typing → phone, editor crossed out |
| 32.4–33.8 | "But there's a catch" | red glitch title |
| 33.8–40.4 | realism / cinematic / "top of my list" | rating bars, realism scan, PixVerse knocked off the #1 podium |
| 40.4–43.7 | "next AI tools" | #4 teaser |

## Adding real PixVerse visuals

Put screenshots (or clips exported as frame folders) in `assets/pixverse/` and list them in
`assets/pixverse/manifest.json`. Every key is optional; anything missing falls back to the built-in graphics.
(The comments below are explanations only — remove them in the real file.)

```json
{
  "hero": "home.jpg",                          // blurred backdrop behind the #5 intro
  "gallery": ["clip1.jpg", "clip2.jpg", "clip3.jpg"], // inside the three phones (scene 2)
  "pricing": "pricing.jpg",                    // browser frame in scene 4
  "styles": ["s1.jpg", "s2.jpg", "s3.jpg", "s4.jpg", "s5.jpg", "s6.jpg"], // style tiles (scene 5)
  "generator": "create.jpg",                   // replaces the prompt box (scene 5)
  "result": {"dir": "result_frames", "count": 120, "fps": 30}, // generated clip in the phone (scene 5)
  "human": {"dir": "human_frames", "count": 150, "fps": 30}    // realism-check panel (scene 7)
}
```

Turn a clip into a frame folder with:
`ffmpeg -i clip.mp4 -vf "fps=30,scale=-2:1080" -q:v 3 assets/pixverse/result_frames/f%04d.jpg`
