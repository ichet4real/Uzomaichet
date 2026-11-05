// Preview / capture glue. Normally no need to edit this file.
(function () {
  const capture = new URLSearchParams(location.search).has('capture');
  const stage = document.getElementById('stage');
  const tl = window.tl;

  if (capture) {
    document.body.classList.add('capture');
    gsap.ticker.sleep(); // nothing moves unless the capture script seeks
    window.__motion = {
      duration: tl.duration(),
      fps: (window.MOTION && window.MOTION.fps) || 30,
      seek(t) { tl.pause(); tl.seek(t, false); },
    };
    // Wait for fonts and images before signalling ready
    const imgs = [...document.images].map((i) => i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }));
    Promise.all([document.fonts.ready, ...imgs]).then(() => { window.__ready = true; });
    return;
  }

  // Preview: scale the stage to fit the window and loop playback
  function fit() {
    const s = Math.min(innerWidth / stage.offsetWidth, (innerHeight - 50) / stage.offsetHeight, 1);
    stage.style.transform = `scale(${s})`;
  }
  addEventListener('resize', fit); fit();

  const play = document.getElementById('play');
  const scrub = document.getElementById('scrub');
  const time = document.getElementById('time');
  tl.repeat(-1).repeatDelay(0.5).play();
  play.onclick = () => { tl.paused(!tl.paused()); play.textContent = tl.paused() ? 'Play' : 'Pause'; };
  scrub.oninput = () => { tl.pause(); play.textContent = 'Play'; tl.progress(+scrub.value); };
  gsap.ticker.add(() => {
    const t = tl.time();
    scrub.value = t / tl.duration();
    time.textContent = `${t.toFixed(2)}s / ${tl.duration().toFixed(2)}s`;
  });
})();
