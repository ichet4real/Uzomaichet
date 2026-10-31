# Step 3 – Create your environment (motion graphics video)

- `step3_create_environment.mp4` – final 1920x1080 (16:9) YouTube video, 30fps, voiceover only.
- `scene.html` – all motion graphics, driven by `render(t)`; timings follow `transcript.srt`.
- `render.js` – renders every frame with Playwright and muxes `voiceover.mp3` via ffmpeg (`node render.js`).
- `frames/` – trimmed screen-recording frames (OBS start/end removed):
  - `c1` – "claude code section" (source 1.6s–12.9s) at 3.43s–11.28s
  - `c2a` – "create project folder", desktop folder part (source 6.0s–22.5s, sped up) at 35.4s–39.58s
  - `c2b` – "create project folder", Claude app part (source 44.6s–49.0s) at 42.66s–48.55s
