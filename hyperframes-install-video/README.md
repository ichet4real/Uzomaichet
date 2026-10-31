# Step 4 – Install HyperFrames Plugin (motion graphics video)

`step4-install-hyperframes.mp4` — final 16:9 YouTube video (1920×1080, 30 fps, 34.5 s).

## How it's built
- `composition.html` – the motion-graphics timeline on a white background with soft pastel glows
  (intro title, explainer diagram, screen-recording scene with zooms / click rings / callouts /
  step rail, "good to go" outro, and a "Next: Step 5" teaser). Captions are switched off. Every element is
  driven by `renderAt(t)`, so each frame is deterministic.
- `render.mjs` – renders the composition frame-by-frame with headless Chromium (Playwright).
- `build.sh` – trims the OBS parts off the screen recording, renders frames, adds light sound
  effects, and muxes with the narration.

```bash
./build.sh install_hyperframes1.mp4 h5.mp3 /tmp/work step4-install-hyperframes.mp4
```

Timing is synced to the narration's pauses; the screen recording is time-remapped (`REMAP` in
`composition.html`) so each on-screen click lands on the word that describes it.
