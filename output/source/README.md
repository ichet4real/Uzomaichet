# Hyperframes intro video — source

- `index.html` — the animated composition. `seek(t)` draws the frame at time `t` (seconds). All timings come from `h1_subtitles.srt`.
- `render.js` — renders frames with Playwright + ffmpeg.

Rebuild:
1. Put `video_example1.mp4` frames in `ex/`: `ffmpeg -i video_example1.mp4 -vf "setpts=PTS/1.5,fps=30,scale=1060:596" -t 6.3 ex/f%04d.jpg`
2. Stills: `thumb_end.jpg` (source at 12.5s, 1060 wide) and `thumb_a.jpg` (source at 2.0s, 640 wide).
3. `node render.js . video silent.mp4 23`
4. `ffmpeg -i silent.mp4 -i h1.mp3 -map 0:v -map 1:a -c:v copy -c:a aac -af apad -t 23 final.mp4`
