#!/usr/bin/env bash
# Full build: footage frames -> rendered video -> SFX -> final mix.
set -euo pipefail
cd "$(dirname "$0")"
[ -d media ] || python3 prep_media.py
node render.js video 30 4
python3 sfx.py out/sfx.json out/sfx.wav 63.41
ffmpeg -hide_banner -loglevel error -y -i out/video_noaudio.mp4 -i assets/voiceover.mp3 -i out/sfx.wav -filter_complex \
  "[1:a]aresample=48000[v];[2:a]volume=0.45[s];[v][s]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aformat=channel_layouts=stereo[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 256k -ar 48000 -movflags +faststart hailuo_ai_motion_graphics.mp4
echo "built hailuo_ai_motion_graphics.mp4"
