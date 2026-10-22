import timing from './timing.json';

// All cue values are frame numbers (30 fps) derived from forced alignment of the voiceover.
export const T = timing.cues;
export const FPS = timing.fps;
export const DURATION = timing.durationInFrames;
export const NEVER = 1e9;
