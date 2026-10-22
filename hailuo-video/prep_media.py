"""Cut the Hailuo footage into JPEG frame sequences the page can step through.

Writes media/<name>/0001.jpg ... plus media/manifest.js (frame counts).
Run once before rendering: python3 prep_media.py
"""
import json
import os
import shutil
import subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "assets", "footage")
OUT = os.path.join(HERE, "media")
FPS = 30
# Screen recordings are 640x360: drop the browser tab/URL bar and the Windows taskbar.
SCREEN = "crop=640:302:0:38,scale=1280:604:flags=lanczos,unsharp=5:5:0.6"

CLIPS = {
    # name: (source, start, source_seconds, speed, filter)
    "gen": ("generator.mp4", 21.0, 78.0, 30.0, SCREEN),
    "gallery": ("homepage.mp4", 6.8, 10.0, 3.0, SCREEN),
    "hero": ("sample_video2.mp4", 2.6, 2.2, 1.0, "scale=1280:720:flags=lanczos"),
    "people": ("sample_video2.mp4", 5.0, 3.4, 1.0, "crop=2084:1440:238:0,scale=868:600:flags=lanczos"),
    "movement": ("sample_video4.mp4", 0.0, 3.0, 1.0, "crop=1080:746:0:600,scale=868:600:flags=lanczos"),
    "realistic": ("sample_video4.mp4", 5.0, 2.6, 1.0, "crop=1080:746:0:400,scale=868:600:flags=lanczos"),
}


def run(args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def main():
    if os.path.isdir(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    manifest = {}
    for name, (src, ss, dur, speed, vf) in CLIPS.items():
        d = os.path.join(OUT, name)
        os.makedirs(d)
        run(["-ss", str(ss), "-t", str(dur), "-i", os.path.join(SRC, src), "-an",
             "-vf", f"setpts=PTS/{speed},fps={FPS},{vf}", "-q:v", "2", os.path.join(d, "%04d.jpg")])
        manifest[name] = len(os.listdir(d))
        print(name, manifest[name], "frames")
    # pricing page still (plans, -47% toggle and credits all visible at 4.2s)
    run(["-ss", "4.2", "-i", os.path.join(SRC, "pricing_page.mp4"), "-frames:v", "1",
         "-vf", SCREEN, "-q:v", "2", os.path.join(OUT, "pricing.jpg")])
    shutil.copy(os.path.join(SRC, "banner_screenshot.png"), os.path.join(OUT, "banner.png"))
    # thumbnails for the "lots of videos" grid
    os.makedirs(os.path.join(OUT, "thumbs"))
    picks = [("sample_video2.mp4", t, "crop=2560:1440:0:0") for t in (0.5, 2.0, 4.0, 6.0, 8.0, 10.0, 12.5)]
    picks += [("sample_video4.mp4", t, "crop=1080:608:0:300") for t in (0.4, 2.6, 4.0, 5.5, 8.5)]
    order = [0, 7, 1, 8, 2, 9, 3, 10, 4, 11, 5, 6]
    for i, k in enumerate(order):
        src, t, crop = picks[k]
        run(["-ss", str(t), "-i", os.path.join(SRC, src), "-frames:v", "1",
             "-vf", f"{crop},scale=392:224:force_original_aspect_ratio=increase,crop=392:224", "-q:v", "3",
             os.path.join(OUT, "thumbs", f"{i + 1}.jpg")])
    with open(os.path.join(OUT, "manifest.js"), "w") as f:
        f.write("window.MEDIA = " + json.dumps(manifest) + ";\n")


if __name__ == "__main__":
    main()
