# AI Video Tools – Final Advice (motion graphics)

`ai-video-tools-advice.mp4` — 1920×1080, 30 fps, 35 s, voiceover from `assets/`.

Rebuild:
```
python3 analyze_audio.py assets/voiceover.mp3 audio.js     # loudness + spectrum per frame
node render.js /tmp/frames 4                               # render frames from index.html
ffmpeg -framerate 30 -i /tmp/frames/f%05d.jpg -i assets/voiceover.mp3 -filter_complex "[1:a]apad=whole_dur=35[a]" \
  -map 0:v -map "[a]" -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -t 35 ai-video-tools-advice.mp4
```
Timings live in the `PH` array at the top of the script in `index.html` (measured from pauses in the voiceover).
