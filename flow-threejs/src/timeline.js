// Pure timing helpers. Every animated value is a function of `t` (seconds) only.

export const FPS = 30;
export const DURATION = 6;
export const FRAME_COUNT = FPS * DURATION; // 180 frames, indices 0–179

export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const lerp = (a, b, k) => a + (b - a) * k;

/** Normalised progress of t inside [start, end], clamped to 0–1. */
export const progress = (t, start, end) => clamp01((t - start) / (end - start));

export const easeInOutCubic = (x) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

/**
 * Rotation curve: starts from rest, reaches ~45% by mid-move and ~97% by 2.80 s,
 * then settles with zero velocity at 3.50 s.
 */
export const easeRotation = (x) => easeInOutCubic(Math.pow(x, 0.75));

export const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

/** Quintic smootherstep: zero velocity and acceleration at both ends. */
export const smootherstep = (x) => x * x * x * (x * (x * 6 - 15) + 10);

const deg = (d) => (d * Math.PI) / 180;

/**
 * Timeline keys.
 *  0.00–0.80  small forward camera move (camera eases in from rest)
 *  0.80–2.80  tile rotates gently toward its final pose
 *  2.80–3.50  tile settles; camera eases to a stop at 3.50
 *  3.00–4.00  2D overlay entrance
 *  4.00–6.00  everything holds completely still
 */
export const KEYS = {
  camera: { start: 0.0, end: 3.5 },
  rotation: { start: 0.8, end: 3.5 }, // ~97% complete by 2.80, settles to 3.50
  title: { start: 3.0, end: 3.75 },
  tagline: { start: 3.2, end: 4.0 },
};

export const POSE = {
  // Camera orbit around the tile (spherical, relative to the look target).
  cameraStart: { radius: 11.6, azimuth: deg(-9), elevation: deg(11.5) },
  cameraEnd: { radius: 10.6, azimuth: deg(-4), elevation: deg(9.5) },
  // Tile orientation (Euler, radians).
  tileStart: { yaw: deg(62), pitch: deg(-3), roll: deg(2.5) },
  tileEnd: { yaw: deg(29), pitch: deg(-5), roll: deg(0) },
};

/** All animated state for a given time. Same t -> same state. */
export function stateAtTime(seconds) {
  const t = Math.min(DURATION, Math.max(0, seconds));

  const kc = smootherstep(progress(t, KEYS.camera.start, KEYS.camera.end));
  const kr = easeRotation(progress(t, KEYS.rotation.start, KEYS.rotation.end));
  const kt = easeOutCubic(progress(t, KEYS.title.start, KEYS.title.end));
  const kg = easeOutCubic(progress(t, KEYS.tagline.start, KEYS.tagline.end));

  const c0 = POSE.cameraStart, c1 = POSE.cameraEnd;
  const r0 = POSE.tileStart, r1 = POSE.tileEnd;

  return {
    t,
    camera: {
      radius: lerp(c0.radius, c1.radius, kc),
      azimuth: lerp(c0.azimuth, c1.azimuth, kc),
      elevation: lerp(c0.elevation, c1.elevation, kc),
    },
    tile: {
      yaw: lerp(r0.yaw, r1.yaw, kr),
      pitch: lerp(r0.pitch, r1.pitch, kr),
      roll: lerp(r0.roll, r1.roll, kr),
    },
    title: { opacity: kt, offsetY: lerp(28, 0, kt) },
    tagline: { opacity: kg, offsetY: lerp(22, 0, kg) },
  };
}
