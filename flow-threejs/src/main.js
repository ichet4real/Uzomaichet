import { createFlowScene } from './scene.js';
import { FPS, DURATION, FRAME_COUNT } from './timeline.js';

const params = new URLSearchParams(location.search);
const captureMode = params.has('capture');
if (captureMode) document.body.classList.add('capture');

const canvas = document.getElementById('scene');
const title = document.getElementById('title');
const tagline = document.getElementById('tagline');

// In capture mode the browser's deviceScaleFactor decides output resolution
// (1 = 1920×1080 final, 0.5 = 960×540 draft) with identical composition.
const flow = createFlowScene(canvas, { pixelRatio: window.devicePixelRatio || 1 });

function applyOverlay(s) {
  title.style.opacity = s.title.opacity.toFixed(4);
  title.style.transform = `translateY(${s.title.offsetY.toFixed(3)}px)`;
  tagline.style.opacity = s.tagline.opacity.toFixed(4);
  tagline.style.transform = `translateY(${s.tagline.offsetY.toFixed(3)}px)`;
}

/** Sets all 3D and 2D state for `seconds` and renders. Deterministic. */
function renderAtTime(seconds) {
  const s = flow.renderAtTime(seconds);
  applyOverlay(s);
  return s.t;
}

// Fonts are local files; wait for both weights before declaring ready.
const ready = Promise.all([
  document.fonts.load('600 176px "Inter Flow"', 'Flow'),
  document.fonts.load('400 46px "Inter Flow"', 'Bring ideas to life.'),
]).then(() => document.fonts.ready).then(() => {
  const ok = document.fonts.check('600 176px "Inter Flow"') && document.fonts.check('400 46px "Inter Flow"');
  if (!ok) throw new Error('Inter Flow font failed to load');
  renderAtTime(0);
  return true;
});

window.flow = { renderAtTime, ready, FPS, DURATION, FRAME_COUNT };

/* ---------------- Preview controls (not part of the capture) ---------------- */
if (!captureMode) {
  const playBtn = document.getElementById('play');
  const restartBtn = document.getElementById('restart');
  const scrub = document.getElementById('scrub');
  const readout = document.getElementById('readout');

  let playing = false;
  let time = 0;
  let lastNow = 0;

  const fit = () => {
    const scale = Math.min(1, (window.innerWidth - 32) / 1920, (window.innerHeight - 120) / 1080);
    document.documentElement.style.setProperty('--scale', Math.max(0.15, scale).toFixed(4));
  };
  window.addEventListener('resize', fit);
  fit();

  const show = (t) => {
    renderAtTime(t);
    const frame = Math.min(FRAME_COUNT - 1, Math.floor(t * FPS + 1e-6));
    scrub.value = String(frame);
    readout.textContent = `${t.toFixed(2)} s · frame ${frame}`;
  };

  const setPlaying = (p) => {
    playing = p;
    playBtn.textContent = p ? 'Pause' : 'Play';
    if (p) {
      if (time >= DURATION) time = 0;
      lastNow = performance.now();
      requestAnimationFrame(tick);
    }
  };

  // Preview playback only advances the clock; the frame itself is still renderAtTime(t).
  function tick(now) {
    if (!playing) return;
    time = Math.min(DURATION, time + Math.max(0, now - lastNow) / 1000);
    lastNow = now;
    show(time);
    if (time >= DURATION) setPlaying(false);
    else requestAnimationFrame(tick);
  }

  playBtn.addEventListener('click', () => setPlaying(!playing));
  restartBtn.addEventListener('click', () => { time = 0; show(0); setPlaying(true); });
  scrub.addEventListener('input', () => {
    setPlaying(false);
    time = Number(scrub.value) / FPS;
    show(time);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); setPlaying(!playing); }
  });

  ready.then(() => show(0));
}
