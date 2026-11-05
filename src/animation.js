// Build the animation here.
// Rules for frame-accurate export:
//  - Put ALL motion on the single paused timeline `tl` (no CSS animations/transitions,
//    no setTimeout, no Math.random() without a fixed seed).
//  - Set the video size in styles.css (--w / --h) and the fps in window.MOTION below.
window.MOTION = { fps: 30 };

const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

// PLACEHOLDER animation (3 seconds) — will be replaced.
tl.from('.box', { scale: 0, rotation: -180, duration: 1 })
  .from('.title', { y: 60, opacity: 0, duration: 0.8 }, '-=0.4')
  .to('.box', { rotation: 90, borderRadius: '50%', duration: 1, ease: 'power2.inOut' })
  .to({}, { duration: 0.6 }); // hold at the end

window.tl = tl;
