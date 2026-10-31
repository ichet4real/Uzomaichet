# Step 6 – Generate the motion graphics (16:9 YouTube)

- `step6_generate_motion_graphics_16x9.mp4` – final 1920×1080, 30 fps, 35 s video with the h7 voiceover.
- `index.html` – the motion-graphics timeline; `render(t)` draws any moment in time.
- `render.js` – renders `index.html` frame by frame with Playwright (`node render.js <buildDir> <outDir>`; buildDir needs `index.html` and `scr/` screen frames).

The screen recordings had their OBS start/end parts removed (clip A kept 1.3–23.8 s, clip B kept 11.5–152.3 s) and were speed-ramped to match the narration.
