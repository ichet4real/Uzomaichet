# AI Video Tools Ranking — YouTube motion graphics (Remotion)

1920×1080 · 30 fps · 36.1 s · H.264 (yuv420p, faststart) + AAC 192k · no captions or subtitle track.

## Deliverables (`out/`)
- `ai-video-tools-ranking-youtube.mp4`: the final render
- `ai-video-tools-ranking-contact-sheet.png`: 20 labelled frames from the final render
- `ai-video-tools-ranking-timing.json`: word timings and visual cues used for sync (same file as `src/timing.json`)

## Sync pipeline
1. `scripts/align.py`: forced alignment of the known transcript against the voiceover with **PocketSphinx**
   (CMU en-US acoustic model). It aligns each SRT phrase window separately, so errors can't carry over from one phrase to the next.
   Brand-name pronunciations are added by hand (`pixverse`, `pika`, `vidu`, `hailuo`; `kling` is already in CMUdict).
   Output: `data/alignment-raw.json` (all 11 phrases aligned, all words matched).
2. `scripts/build_timing.py`: moves each word start that falls in a pause or plosive closure forward to the measured
   acoustic onset (RMS rise). It then converts times to frames and names the cue events (`rank5`, `pixverse`, `shortForm`, …).
   Graphics land 2 frames (~67 ms) ahead of the syllable, which reads as "on the word".
3. Every animation in `src/` is driven by `useCurrentFrame()` plus these cues. There is no randomness and nothing is loaded from the network.

```bash
python3 -I scripts/align.py audio16k.wav data/ai-video1.srt data/alignment-raw.json   # audio16k: ffmpeg -i public/audio/ai-video1.mp3 -ar 16000 -ac 1 audio16k.wav
python3 -I scripts/build_timing.py audio16k.wav data/alignment-raw.json src/timing.json
```

## Render / edit
```bash
npm install
npm run studio      # live preview / editing
npm run render      # → out/ai-video-tools-ranking-youtube.mp4 (then optionally: ffmpeg -i in.mp4 -c copy -movflags +faststart out.mp4)
```
`remotion.config.ts` uses `/opt/pw-browsers/.../headless_shell` when it exists (this sandbox couldn't download
Remotion's browser). On a normal machine Remotion downloads its own browser automatically.

## Structure
- `src/timing.json`: cue frames, scene ranges, word list
- `src/theme.ts`: palette, tool data (logos, accents, labels)
- `src/components/`: `DimText` (extruded rank numbers + light sweep), `LogoCard`, `BenefitLabel`/`Pill`, `Dock` + `Cursor`, `Background`
- `src/scenes/`: `Intro`, `RankSection` (rank odometer, logo/name/labels, demo stage whose shape changes between tools), `KlingSection` (#1 hero → REALISM/BUDGET), `UseCases`, `Final` (leaderboard)
- `src/demos/`: illustrative demos for PixVerse, Pika, Vidu, Hailuo (flat graphics, not tool output)

Style: light, airy page with pastel glows, white floating cards, a black cursor and Klarna-style highlight chips,
modelled on the Klarna "App Page" reference. Motion language: an icon dock where the cursor selects each tool, a demo card
that changes shape from tool to tool, and camera push-ins/pull-backs. (v1 used a dark charcoal theme; see git history.)
