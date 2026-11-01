# Step 8 – Render & Export (motion graphics video)

Final video: `step8_render_export.mp4` (1920x1080, 16:9, 30 fps, 52 s, no captions). White background, styled to match the series (Step 7).

Built with Remotion. To re-render:

1. Put the voiceover at `public/voice.mp3` and the screen recording at `public/screen.mp4`.
2. `npm install`
3. `npx remotion render src/index.ts Step8 out.mp4`

Scene timing follows the narration pauses (see `src/Main.tsx` for the screen-recording zooms/highlights and `src/Scenes.tsx` for the animated scenes).
