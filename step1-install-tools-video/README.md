# Step 1 – Install the tools (motion graphics video)

16:9 (1920×1080, 30 fps) motion graphics video, with animations timed to the voiceover (`assets/audio.mp3`) and `subtitles.srt`.

- `index.html` – the animated scene. Open it with `?t=12.5` to view any moment, or `?cc=1` to show burned-in captions.
- `render.js` – renders every frame in headless Chromium (Playwright) and encodes the MP4 with ffmpeg.
- `output/` – finished videos (with and without captions).

## Re-render

```bash
node render.js . video output/step1_install_tools.mp4 0
```

Pass `1` instead of `0` as the last argument to burn in captions.
