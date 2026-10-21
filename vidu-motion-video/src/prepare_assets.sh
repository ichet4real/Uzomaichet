#!/usr/bin/env bash
# Turns the Vidu recordings, demos and screenshots into the frame folders and stills scene.html reads.
# The recordings in assets/vidu/recordings are already trimmed (OBS window cut from start and end).
set -euo pipefail
cd "$(dirname "$0")/../assets/vidu"
rm -rf *_frames stills && mkdir -p stills
seq() { # name, input, fps, filter
  mkdir -p "$1_frames"
  ffmpeg -v error -y -i "$2" -vf "fps=$3,$4" -q:v 2 "$1_frames/f%04d.jpg"
  echo "$1: $(ls "$1_frames" | wc -l) frames"
}
UP="scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:0.8"
PAGE="crop=636:302:2:38,$UP"                       # browser page area, no tabs / taskbar
seq desk    demos/demo-desk-adventure.mp4 24 "scale=1280:720"
seq storm   demos/demo-storm-cliff.mp4    24 "scale=1280:720"
seq remix   recordings/vidu-remix-cowboy.mp4 30 "$PAGE"
seq cowboy  recordings/vidu-remix-cowboy.mp4 30 "crop=150:250:139:53,scale=450:750:flags=lanczos,unsharp=5:5:0.9"
seq pricing recordings/vidu-pricing.mp4 30 "$PAGE"
seq create  recordings/vidu-create-prompt.mp4 4 "$PAGE"
# stills
ffmpeg -v error -y -i screenshots/home-hero.webp -q:v 2 stills/hero.jpg
ffmpeg -v error -y -i screenshots/create-menu.webp -vf "crop=1358:642:4:80" -q:v 2 stills/create.jpg
ffmpeg -v error -y -ss 17.5 -i recordings/vidu-remix-cowboy.mp4 -frames:v 1 -vf "crop=152:152:138:70,scale=456:456:flags=lanczos,unsharp=5:5:0.9" -q:v 2 stills/cowboy-face.jpg
ffmpeg -v error -y -i demos/demo-desk-adventure.mp4 -frames:v 1 -vf "scale=1280:720" -q:v 2 stills/desk-first.jpg
ffmpeg -v error -y -ss 3.5 -i recordings/vidu-pricing.mp4 -frames:v 1 -vf "crop=300:150:322:145,scale=900:450:flags=lanczos,unsharp=5:5:0.8" -q:v 2 stills/credits.jpg
ffmpeg -v error -y -ss 5 -i recordings/vidu-remix-cowboy.mp4 -frames:v 1 -vf "crop=150:150:432:160,scale=600:600:flags=lanczos,unsharp=5:5:0.8" -q:v 2 stills/prompt.jpg
echo done
