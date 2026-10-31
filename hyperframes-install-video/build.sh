#!/usr/bin/env bash
# Builds the final 1920x1080 / 30fps YouTube video.
# Usage: ./build.sh <screen-recording.mp4> <narration.mp3> <work-dir> <output.mp4>
set -euo pipefail
VIDEO=$1; AUDIO=$2; WORK=$3; OUT=$4
HERE=$(cd "$(dirname "$0")" && pwd)
mkdir -p "$WORK/frames" "$WORK/out" "$WORK/sfx"

# 1) Source screen recording: skip the OBS parts (OBS is visible before ~2.7s and after ~35.5s).
#    Only 6.0s-27.5s of the source is used; the composition remaps it to the narration.
ffmpeg -v error -y -ss 6.0 -t 21.5 -i "$VIDEO" \
  -vf "fps=30,scale=1920:1080:flags=lanczos,unsharp=5:5:0.9:5:5:0" -q:v 2 "$WORK/frames/%05d.jpg"
cp "$HERE/composition.html" "$WORK/"

# 2) Render every frame of the motion-graphics composition.
node "$HERE/render.mjs" "$WORK" "$WORK/out" 30 4

# 3) Sound design: soft whooshes on scene changes, clicks on UI clicks, a chime on "installed".
ffmpeg -v error -y -f lavfi -i "anoisesrc=color=pink:d=0.6:a=0.5" \
  -af "bandpass=f=900:w=1200,afade=t=in:d=0.3,afade=t=out:st=0.3:d=0.3,volume=0.35" "$WORK/sfx/whoosh.wav"
ffmpeg -v error -y -f lavfi -i "sine=f=2200:d=0.05" \
  -af "afade=t=out:st=0.005:d=0.045,volume=0.35" "$WORK/sfx/click.wav"
ffmpeg -v error -y -f lavfi -i "sine=f=880:d=1.2" -f lavfi -i "sine=f=1318.5:d=1.2" \
  -filter_complex "[0][1]amix=inputs=2,afade=t=out:st=0.02:d=1.15,volume=0.5" "$WORK/sfx/chime.wav"

# timestamps (ms) on the output timeline
WH=(2900 7250 25100); CL=(9350 10900 12600 17200 20600 21600); CH=(25900)
inputs=(-i "$AUDIO"); filters=""; n=1; labels="[0]"
add() { inputs+=(-i "$WORK/sfx/$1.wav"); filters+="[$n]adelay=$2|$2[s$n];"; labels+="[s$n]"; n=$((n+1)); }
for t in "${WH[@]}"; do add whoosh "$t"; done
for t in "${CL[@]}"; do add click "$t"; done
for t in "${CH[@]}"; do add chime "$t"; done
ffmpeg -v error -y "${inputs[@]}" \
  -filter_complex "${filters}${labels}amix=inputs=$n:normalize=0,apad=whole_dur=31,atrim=0:31[a]" \
  -map "[a]" -ar 48000 "$WORK/mix.wav"

# 4) Encode for YouTube.
ffmpeg -v error -y -framerate 30 -i "$WORK/out/%05d.jpg" -i "$WORK/mix.wav" \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -profile:v high \
  -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
echo "Wrote $OUT"
