#!/usr/bin/env bash
# Cuts the PixVerse recordings/screenshots into the stills and frame sequences listed in assets/pixverse/manifest.json.
# Recordings are 640x360 screen captures; crops below are in those pixel coordinates.
set -euo pipefail
cd "$(dirname "$0")/../assets/pixverse"
R=recordings
UP="scale=iw*3:ih*3:flags=lanczos,unsharp=5:5:0.6"
mkdir -p stills
still(){ ffmpeg -y -loglevel error -ss "$2" -i "$R/pixverse-home-feed.mp4" -frames:v 1 -vf "crop=$3,$UP" -q:v 2 "stills/$1.jpg"; }
# phones (scene 2)
still phone1 6    128:167:113:116
still phone2 9    127:167:243:116
still phone3 0.5  128:147:500:136
# style tiles (scene 5)
still tile1 11.9  128:131:113:116
still tile2 3     127:120:243:150
still tile3 6     127:74:371:148
still tile4 9     128:94:113:116
still tile5 11.9  127:131:243:116
still tile6 11.9  128:131:371:116
# pricing screenshot without the sidebar
ffmpeg -y -loglevel error -i screenshots/pricing.png -vf "crop=iw-205:ih:205:0" -q:v 2 stills/pricing.jpg
ffmpeg -y -loglevel error -i screenshots/home.png -q:v 2 stills/home.jpg
seq(){ rm -rf "$1"; mkdir -p "$1"; ffmpeg -y -loglevel error "${@:2}" -q:v 3 "$1/f%04d.jpg"; echo "$1: $(ls "$1" | wc -l) frames"; }
# generated video player (above its control bar)
seq result_frames -ss 0  -t 4.5 -i "$R/pixverse-generations.mp4" -vf "crop=163:125:105:90,$UP,fps=30"
seq human_frames  -ss 13 -t 12  -i "$R/pixverse-generations.mp4" -vf "crop=163:125:105:90,$UP,fps=30"
# create page while typing the prompt, sped up 8x
seq generator_frames -i "$R/pixverse-create-prompt.mp4" -vf "crop=540:258:100:80,setpts=PTS/8,scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:0.5,fps=30"
