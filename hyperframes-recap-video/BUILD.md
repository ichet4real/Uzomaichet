# Hyperframes recap video

Final render: `hyperframes-recap-1080p.mp4` (1920x1080, 30fps, 88s, voiceover from `assets/voice.mp3`).

Rebuild:
1. Extract screen-recording frames: `ffmpeg -ss 5.5 -to 58.2 -i assets/screen-recording.mp4 -vf "crop=1200:240:560:770" -q:v 3 assets/rec/%05d.jpg`
2. Render frames: `node render.js frames /tmp/frames`
3. Encode: `ffmpeg -framerate 30 -i /tmp/frames/%05d.jpg -i assets/voice.mp3 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -shortest hyperframes-recap-1080p.mp4`

All scene timings are in `index.html` and follow the transcript timestamps.
