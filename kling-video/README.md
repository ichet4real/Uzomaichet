# Kling motion graphics video

An 80-second 1920x1080 motion graphics video timed to `assets/kling.mp3` and `assets/kling.srt`.

- `index.html`: the animated composition. `render(t)` draws the frame at time `t` seconds.
- `assets/subs.js`: subtitles converted from the SRT. `assets/env.js`: audio loudness per frame, which drives the equalizer and background pulse.
- `render.js`: renders frames with headless Chromium and encodes them with ffmpeg.

```
npm install
node render.js kling_motion_graphics.mp4          # full video
node render.js --stills 5,30,60                   # preview stills into stills/
```
