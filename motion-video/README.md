# Step 5 – Plan the Animation (motion graphics video)

Output: `plan-the-animation.mp4` — 1920×1080, 30 fps, 51 s, white background, no captions.

- `index.html` + `anim.js` — the animation. `window.renderAt(t)` draws the frame at time `t`; all cue times are synced to `assets/narration.mp3`.
- `render.js` — captures frames with Playwright/Chromium.

Rebuild:

```bash
node render.js frames /tmp/frames 4
ffmpeg -framerate 30 -i /tmp/frames/f%05d.jpg -i assets/narration.mp3 -filter_complex "[1:a]apad[a]" -map 0:v -map "[a]" -t 51 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart plan-the-animation.mp4
```
