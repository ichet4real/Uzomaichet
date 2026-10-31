# Step 6 – Generate the motion graphics (16:9 YouTube)

- `step6_generate_motion_graphics_16x9.mp4` – final 1920×1080, 30 fps, 35 s video with the h7 voiceover.
- `index.html` – the motion-graphics timeline; `render(t)` draws any moment in time.
- `render.js` – renders `index.html` frame by frame with Playwright (`node render.js <buildDir> <outDir>`; buildDir needs `index.html` and `scr/` screen frames).

White background, no captions. OBS start/end parts removed from every recording and speed-ramped to the narration:
- hyperframes_start_prompt.mp4: 1.3–23.8 s (typing /hyperframes, pasting the prompt)
- creating_video_hyperframes1.mp4: 11.5–17.8 s (only the send-arrow click; it's the only recording that shows it)
- creating_videos_hyperframes2.mp4 (HD): 1.75–50.0 s (Claude processing the prompt, ~4x)
