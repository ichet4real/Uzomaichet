#!/usr/bin/env bash
# Extracts footage frames used by index.html into assets/clips/.
# Usage: ./make_clips.sh <folder with the source videos>
# Screen recordings are trimmed to skip the OBS screens at the start and end,
# and cropped to remove the browser tab/address bar and the Windows taskbar.
set -e
U=${1:?source folder}
cd "$(dirname "$0")"
mkdir -p assets/clips
SCR="crop=634:302:3:38,scale=1400:-2:flags=lanczos,unsharp=5:5:0.6"
PV="scale=1280:-2:flags=lanczos"
ex(){ mkdir -p "assets/clips/$1"; ffmpeg -v error -y -ss $3 -t $4 -i "$2" -vf "fps=$5,$6" -q:v 3 "assets/clips/$1/%04d.jpg"; }
ex home  "$U/kling_homepage.mp4"     1.9 16.3 30 "$SCR"
ex price "$U/kling_pricing_page.mp4" 1.7 24.7 30 "$SCR"
ex gen   "$U/kling_video_generator.mp4" 9.6 93.2 3 "$SCR"
P="$U/Kling_AI-_Next-Gen_AI_Video__Image_Generator.mp4"
ex p_street "$P" 0 3.5 30 "$PV";  ex p_point "$P" 7.6 2.1 30 "$PV";  ex p_write "$P" 18 4 30 "$PV"
ex p_selfie "$P" 25 3.5 30 "$PV"; ex p_water "$P" 49 4 30 "$PV";    ex p_hug "$P" 55 4 30 "$PV"
ex p_run "$P" 78.5 4 30 "$PV";    ex p_truck "$P" 84 4.5 30 "$PV";  ex p_bag "$P" 103.5 2.4 30 "$PV"
ex p_pottery "$P" 39 4 30 "$PV"
ex elem "$U/Kling_Element_Library_User_Guide.mp4" 0 5.04 30 "$PV"
python3 - <<'PY'
import os,json
d='assets/clips';o={n:{'fps':3 if n=='gen' else 30,'n':len(os.listdir(f'{d}/{n}'))} for n in sorted(os.listdir(d))}
open('assets/clips.js','w').write('window.CLIPS='+json.dumps(o)+';')
PY
