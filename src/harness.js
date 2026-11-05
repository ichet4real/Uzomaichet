// Preview & capture glue.
(function () {
  const capture = new URLSearchParams(location.search).has('capture');
  const stage = document.getElementById('stage');
  const { tl, renderAt, MOTION } = window;
  const fps = MOTION.fps;

  // Resolves when every font face is loaded (fails loudly if a file is missing).
  const fontsReady = Promise.all([500, 600, 700].map((w) => document.fonts.load(`${w} 100px "Flow Sans"`)))
    .then(() => document.fonts.ready)
    .then(() => {
      const missing = [500, 600, 700].filter((w) => !document.fonts.check(`${w} 100px "Flow Sans"`));
      if (missing.length) throw new Error('Font weights failed to load: ' + missing.join(', '));
    });

  if (capture) {
    document.body.classList.add('capture');
    gsap.ticker.sleep();          // the clock never advances; only renderAt() changes the frame
    renderAt(0);
    // Render a frame for capture. Toggling the stage background (white <-> white)
    // forces Chrome to repaint the whole frame, so the pixels never depend on
    // which frame was rendered before (partial repaints can differ by ±2 levels).
    let flip = false;
    const renderForCapture = (t) => {
      renderAt(t);
      flip = !flip;
      stage.style.backgroundColor = flip ? 'rgb(255, 255, 255)' : '#ffffff';
      stage.style.outline = flip ? '0px solid transparent' : 'none';
    };
    window.__motion = { duration: tl.duration(), fps, renderAt: renderForCapture };
    fontsReady.then(() => { window.__ready = true; }, (e) => { window.__error = e.message; });
    return;
  }

  // ----- Preview -----
  function fit() {
    const box = document.getElementById('viewport');
    const s = Math.min((box.clientWidth - 48) / 1920, (box.clientHeight - 48) / 1080);
    stage.style.transform = `scale(${s})`;
    stage.style.margin = `${(1080 * s - 1080) / 2}px ${(1920 * s - 1920) / 2}px`;
  }
  addEventListener('resize', fit); fit();

  const scrub = document.getElementById('scrub');
  const time = document.getElementById('time');
  scrub.max = Math.round(tl.duration() * fps);
  const update = () => {
    const t = tl.time();
    scrub.value = Math.round(t * fps);
    time.textContent = `${t.toFixed(2)}s · f${Math.min(Math.round(t * fps), scrub.max - 1)}`;
  };
  tl.eventCallback('onUpdate', update);

  document.getElementById('btn-play').onclick = () => { if (tl.progress() === 1) tl.restart(); else tl.play(); };
  document.getElementById('btn-pause').onclick = () => tl.pause();
  document.getElementById('btn-restart').onclick = () => tl.restart();
  scrub.oninput = () => { renderAt(+scrub.value / fps); update(); };
  addEventListener('keydown', (e) => {
    if (e.code === 'Space') { e.preventDefault(); tl.paused() ? document.getElementById('btn-play').click() : tl.pause(); }
  });

  renderAt(0); update();
  fontsReady.then(() => tl.play());
})();
