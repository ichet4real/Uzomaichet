# Flow — Three.js brand reveal

A 6-second procedural 3D brand reveal for **Flow**, a fictional AI app. The tile, the raised mark, the lighting and the shadow are all built in Three.js. No models or image textures are used. The text is a crisp HTML overlay that sits on top of the WebGL canvas, and the capture records both together.

| | |
|---|---|
| Output | `output/flow-threejs.mp4`: 1920×1080, 30 fps, 180 frames, 6.000 s, H.264 High, yuv420p, BT.709, no audio |
| Poster | `output/flow-threejs-poster.png` (final frame, 1920×1080) |
| Three.js | `three@0.187.0` (latest on npm at build time) |
| Colours | background `#FFFFFF`, tile `#7C3AED`, type `#171717` |

## Requirements

- Node 18+ (tested on Node 22)
- FFmpeg with libx264 on your `PATH` (tested with 6.1)
- A Chromium build that Playwright can launch. If you don't have one, run `npx playwright install chromium` once. To use your own build, set `CHROMIUM_PATH=/path/to/chrome`.

```bash
npm install
```

## Preview

```bash
npm run dev
```

Open http://localhost:5173. The controls sit below the 1920×1080 stage:

- **Play / Pause** (or the space bar)
- **Restart**
- **Timeline scrubber**, which steps one frame at a time (0–179)

Add `?capture` to the URL to see exactly what the renderer records: the stage at 1:1 with the controls hidden.

## Render

Fast half-resolution review draft (960×540). The composition and timing are the same as the final render.

```bash
npm run draft
```

Final 1920×1080 render. This writes the MP4 and the poster, then verifies the MP4.

```bash
npm run render
```

To render a few stills only, for example the opening, mid-rotation and final frames:

```bash
node scripts/render.mjs --frames 0,54,179
```

To re-check an existing file:

```bash
npm run verify
```

The render takes about 0.5 s per frame on CPU-only SwiftShader WebGL, so the full render is about 1.5 minutes. A GPU will be faster.

### How the capture works (`scripts/render.mjs`)

1. Starts a Vite server and opens `/?capture` in headless Chromium with a 1920×1080 viewport. `deviceScaleFactor` sets the output size: 1 for the final, 0.5 for the draft.
2. Waits for `window.flow.ready`. This resolves only after both local Inter weights have loaded (`document.fonts.load`, then a `check`).
3. For each frame index `0…179`, it calls `flow.renderAtTime(i / 30)` and waits two animation frames for compositing. It then screenshots the stage, so the WebGL canvas and the HTML text are captured in one image. The controls are not rendered in capture mode.
4. It encodes `output/frames/final/frame_%03d.png` with FFmpeg: `libx264`, `-crf 14`, `yuv420p`, BT.709 tags and `+faststart`.
5. It runs `scripts/verify.mjs`, which uses ffprobe to check the codec, pixel format, 1920×1080, 30/1 fps, 180 decoded frames, a 6.000 s duration and that there is no audio.

It also runs two determinism checks:

- Frame 179 is rendered **cold**, before any other frame, and compared byte for byte with frame 179 from the sequence.
- Frame 0 is rendered again after the sequence and compared with the first pass.

## Project layout

```
index.html          stage (canvas + text overlay) and preview controls
src/timeline.js     timing keys, poses, easing; stateAtTime(t) is pure
src/scene.js        Three.js scene: geometry, materials, lights, contact shadow, renderAtTime(t)
src/main.js         wires the 2D overlay to the same state; preview playback UI
src/style.css       layout, local @font-face, capture mode
public/fonts/       Inter SemiBold / Regular (OFL, licence included)
scripts/render.mjs  frame capture and FFmpeg encode
scripts/verify.mjs  ffprobe checks
```

## Timeline

| Time | What happens |
|---|---|
| 0.00–0.80 | The tile is already in a three-quarter view. The camera begins a small forward dolly from rest. |
| 0.80–2.80 | The tile turns gently from 62° to 29° yaw. About 97% of the turn is done by 2.80 s. |
| 2.80–3.50 | The tile settles into its final three-quarter angle. The camera eases to a stop at 3.50 s. |
| 3.00–4.00 | "Flow" fades and rises into place (3.00–3.75). "Bring ideas to life." follows (3.20–4.00). |
| 4.00–6.00 | Full hold. Frames 118–179 are pixel-identical. |

Every value comes from `stateAtTime(t)`, which uses clamped progress and easing curves. No state carries over from one frame to the next, so any time, including the final pose, can be rendered directly. The preview's play button only advances a clock. Each frame on screen is still `renderAtTime(t)`.

## Look development notes

- **Tile:** a superellipse ("squircle") outline, extruded with `ExtrudeGeometry` and a 10-segment bevel. Its finished size is 2.4 × 2.4 units and 0.42 deep.
- **Mark:** two parallel sine strokes with round caps. Each stroke is built as a procedural outline, then extruded and bevelled so it stands proud of the front face.
- **Material:** `MeshPhysicalMaterial`. Roughness is 0.42 and specular intensity 0.55, with a light clearcoat and a soft sheen, which gives a satin finish without hot spots.
- **Lighting:** an image-free `RoomEnvironment` (through PMREM) at an intensity of 0.5, a warm key light, a hemisphere fill, and a rim light that picks out the bevels.
- **Shadow:** a blurred contact shadow. It is re-rendered from below the tile every frame, so it follows the rotation and stays deterministic. r187 removed `PCFSoftShadowMap`, and the remaining PCF filter adds per-pixel noise, which would make a wide, soft shadow look grainy.
- **Colour management:**
  - `outputColorSpace = SRGBColorSpace`. Hex colours are converted to the linear working space by `ColorManagement`.
  - `NeutralToneMapping` (Khronos PBR Neutral) at exposure 1.0. This keeps the violet's hue and saturation and rolls off highlights. AgX would desaturate the violet.
  - The `Color` background is drawn as the clear colour, which is not tone mapped, so it stays exactly `#FFFFFF`. The final MP4 decodes to 255,255,255.
- **Framing:** `camera.filmOffset` (a lens shift) moves the tile left of centre without skewing it. All content falls between 367–1456 px horizontally and 269–887 px vertically, so it stays well inside the 100 px safe margins.
