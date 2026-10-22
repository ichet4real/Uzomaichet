import {Easing, interpolate, interpolateColors, spring, SpringConfig} from 'remotion';

export const FPS = 30;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const EO = Easing.bezier(0.16, 1, 0.3, 1);
export const EIO = Easing.bezier(0.65, 0, 0.35, 1);

/** Clamped eased 0→1 (or from→to) between frames a and b. */
export const io = (f: number, a: number, b: number, from = 0, to = 1, easing = EO) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing});

/** Spring that starts at `start` (0 before it). */
export const spr = (f: number, start: number, cfg: Partial<SpringConfig> = {}) =>
  f < start ? 0 : spring({frame: f - start, fps: FPS, config: {damping: 20, stiffness: 170, mass: 0.9, ...cfg}});

export const calm = {damping: 200, stiffness: 120} as const; // no overshoot
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mix = (c1: string, c2: string, t: number) => interpolateColors(Math.min(1, Math.max(0, t)), [0, 1], [c1, c2]);
/** 0→1→0 bump over [a,b]. */
export const bell = (f: number, a: number, b: number) => {
  if (f <= a || f >= b) return 0;
  return Math.sin(((f - a) / (b - a)) * Math.PI);
};
