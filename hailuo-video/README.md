# Hailuo AI: motion graphics video

A 63-second, 1920×1080, 30 fps YouTube video for the "Number 2 is Hailuo AI" voiceover.
It mixes motion graphics with real footage of hailuoai.video, and every animation is timed to the words in the voiceover.

**Final video:** `hailuo_ai_motion_graphics.mp4`

## Scenes

| Time | Voiceover | On screen |
|---|---|---|
| 0:00 | "Number 2 is Hailuo AI" | `#2` slams in, Hailuo AI wordmark |
| 0:02 | "…where AI video starts…" | Generator recording in a browser frame, zooming in on the prompt |
| 0:04 | "…seriously impressive" | Hailuo sample clip (hand-frame effect) plays big |
| 0:06 | "…particularly good…" | Homepage gallery recording scrolling |
| 0:09 | "people, movement, realistic scenes" | Three cards with real sample clips, each landing on its word |
| 0:12 | "…free option… one-time free credits" | Pricing page zooms to the Free plan and highlights "One-time free trial credits"; FREE ticket |
| 0:15 | "…try before going for paid plans" | Free trial → Paid plans flow |
| 0:18 | "…$10.50 per month with 1,000 credits" | Pricing page zooms to Standard and highlights $10.50 and 1000 credits; counter card |
| 0:23 | "…yearly plan… 47% discount" | Pricing page zooms to the Yearly −47% toggle; "47% OFF YEARLY" stamp |
| 0:29 | "But as usual, here is the downside" | Red tint, warning sign, glitching "THE DOWNSIDE" |
| 0:32 | "Like almost every AI video platform" | Platform tiles with Hailuo highlighted |
| 0:35 | "…credits depend on the plan" | Pricing page with 0 / 1000 / 4500 monthly credits highlighted in turn |
| 0:39 | "…credit efficiency" | Grid of sample-video thumbnails fills while the credit battery drains |
| 0:44 | "…the interesting part" | Flash, rays, gift box |
| 0:46 | "…new user… MiniMax Design… 3,000 credits for free" | Site banner screenshot with highlights on "Download MiniMax Design" and "Get 3,000 Free Credits"; download card; 3,000 counter |
| 0:53 | "…absolutely worth trying" | Checklist, summary chips, "Worth trying" seal |
| 1:00 | "So let's reveal our number one" | Gold `#1` teaser |

There are also word-by-word captions, a top progress bar, a "#2 Hailuo AI" badge and synthesized sound effects. There is no background music.

## Files

- `assets/voiceover.mp3`, `assets/transcript.srt`: the voiceover and its transcript.
- `assets/footage/`: screen recordings of hailuoai.video (homepage, pricing, generator), two Hailuo sample videos and the banner screenshot.
- `prep_media.py` cuts the footage into cropped, sharpened JPEG frame sequences in `media/`. This folder is generated and not committed.
- `src/`: the animation, built with HTML/CSS, canvas and GSAP. `window.__seek(t)` draws the exact frame for time `t`, including the matching footage frame.
- `src/timing.js` holds the speech timing. Phrase windows come from the SRT and from pauses measured in the audio.
- `render.js` steps headless Chromium through every frame and pipes the frames to ffmpeg.
- `sfx.py` synthesizes the sound effects with numpy. No third-party audio is used.

## Rebuild

```bash
npm install
./build.sh                                  # media frames -> video -> SFX -> final mix (~10 min)
node render.js stills 5.3 20.9              # preview single frames -> out/stills/
```

Chromium is expected at `/opt/pw-browsers/chromium`. Set `CHROME=/path/to/chrome` to use another.
