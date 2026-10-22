# Hailuo AI: motion graphics video

A 63-second, 1920×1080, 30 fps motion graphics video for the "Number 2 is Hailuo AI" voiceover.
Every animation is timed to the words in the voiceover.

**Final video:** `hailuo_ai_motion_graphics.mp4`

## Scenes

| Time | Voiceover | On screen |
|---|---|---|
| 0:00 | "Number 2 is Hailuo AI" | `#2` slams in, Hailuo AI wordmark and spiral logo |
| 0:02 | "…seriously impressive" | Text-to-video app mock-up: prompt types, Generate is clicked, a rainy neon-city clip plays |
| 0:06 | "…people, movement, and realistic scenes" | Three animated cards appear on each word |
| 0:12 | "…one-time free credits" | FREE ticket, falling coins, "One-time" tag |
| 0:15 | "…try before going for paid plans" | Free trial → Paid plans flow |
| 0:18 | "…$10.50 per month with 1,000 credits" | Price card counts up to $10.50 and 1,000 credits |
| 0:23 | "…yearly plan… 47% discount" | Monthly/Yearly toggle flips, "47% OFF" stamp, savings bars |
| 0:29 | "But as usual, here is the downside" | Red tint, warning sign, glitching "THE DOWNSIDE" |
| 0:32 | "…credits depend on the plan" | Platform tiles, then Free / Paid / Higher tier bars |
| 0:39 | "…credit efficiency" | Video grid fills up while the credit battery drains |
| 0:44 | "…the interesting part" | Flash, rays, gift box |
| 0:46 | "…new user… 3,000 credits for free" | Phone with MiniMax app downloading; 3,000 counter and confetti |
| 0:53 | "…absolutely worth trying" | Checklist, summary chips, "Worth trying" seal |
| 1:00 | "So let's reveal our number one" | Gold `#1` teaser |

There are also word-by-word captions, a top progress bar, a "#2 Hailuo AI" badge and synthesized sound effects.

## How it is built

- `src/index.html`, `src/style.css` and `src/main.js` hold the animation, built with HTML/CSS, canvas and GSAP. `window.__seek(t)` draws the exact frame for time `t`.
- `src/timing.js` holds the speech timing. Phrase windows come from the SRT and from pauses measured in the audio. Word times are estimated inside each phrase.
- `render.js` steps headless Chromium through every frame and pipes the frames to ffmpeg.
- `sfx.py` synthesizes the sound effects with numpy. No third-party audio is used.
- The voiceover and the SFX track are mixed and normalized to −14 LUFS.

## Rebuild

```bash
npm install
node render.js stills 5.3 26.9          # preview single frames -> out/stills/
node render.js video 30 4               # frames -> out/video_noaudio.mp4 + out/sfx.json
python3 sfx.py out/sfx.json out/sfx.wav 63.41
ffmpeg -i out/video_noaudio.mp4 -i assets/voiceover.mp3 -i out/sfx.wav -filter_complex \
  "[1:a]aresample=48000[v];[2:a]volume=0.45[s];[v][s]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11,aformat=channel_layouts=stereo[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 256k hailuo_ai_motion_graphics.mp4
```

Chromium is expected at `/opt/pw-browsers/chromium`. Set `CHROME=/path/to/chrome` to use another.

## Notes

- hailuoai.video could not be reached from the build environment, so no real screenshots or footage from the site are used. All visuals are original illustrations. The colors and logo are stand-ins, not Hailuo's official branding.
- To use real screen recordings from Hailuo, swap them into the scene-2 preview (`#s2-preview`) or the scene-3 cards.
