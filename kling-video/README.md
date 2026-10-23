# Kling motion graphics video

An 80-second 1920x1080 (16:9) motion graphics video for YouTube, timed to `assets/kling.mp3` and `assets/kling.srt`. No background music.

- `index.html`: the animated composition. `render(t)` draws the frame at time `t` seconds.
- `assets/subs.js`: subtitles converted from the SRT. `assets/env.js`: audio loudness per frame (drives the equalizer and background pulse).
- `assets/kling_logo.png`, `assets/pricing_banner.png`: logo and pricing-page screenshot.
- `make_clips.sh`: extracts the footage frames into `assets/clips/` (not committed; regenerate from the source videos). Screen recordings are trimmed past the OBS screens and cropped to remove the browser bar and taskbar.
- `render.js`: renders frames with headless Chromium and encodes them with ffmpeg.

```
npm install
./make_clips.sh /path/to/source/videos
node render.js out.mp4                 # full video
node render.js --stills 5,30,60        # preview stills into stills/
```
