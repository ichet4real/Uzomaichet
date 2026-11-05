/* Flow — 8 s promo. One paused master timeline; every tween is a fromTo()
   (or has explicit start values), so the state at any time is fully
   defined and seeking in either direction gives identical frames. */
gsap.config({ force3D: false }); // 2D transforms keep text crisp in captures

window.MOTION = { fps: 30, duration: 8 };

/* Line drawing with an explicit dash pattern (dash = L, gap = L + 10).
   Offset L + 5 hides the line completely (no round-cap dot); offset 0 shows it all.
   Exact values mean identical pixels whichever direction we seek from. */
function drawLine(target, vars, position) {
  const els = gsap.utils.toArray(target);
  els.forEach((el) => {
    const L = Math.ceil(el.getTotalLength());
    el.style.strokeDasharray = `${L} ${L + 10}`;
    el.dataset.len = L;
  });
  return tl.fromTo(els,
    { strokeDashoffset: (i, el) => +el.dataset.len + 5 },
    { strokeDashoffset: 0, ...vars }, position);
}

const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });

/* 0.00–0.40  Wordmark: gentle opacity entrance */
tl.fromTo('.wordmark', { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power1.out' }, 0);

/* 0.40–1.70  Headline: word-by-word reveal through clipping masks */
tl.fromTo('.headline .word',
  { yPercent: 125 },
  { yPercent: 0, duration: 0.7, stagger: 0.2, ease: 'power4.out' }, 0.4); // last word ends 1.70

/* 2.00–4.20  Cards: 0.15 s stagger, short rise, scale settles to 1 (no overshoot) */
tl.fromTo('.card',
  { opacity: 0, y: 56, scale: 0.955, transformOrigin: '50% 100%' },
  { opacity: 1, y: 0, scale: 1, duration: 1.1, stagger: 0.15, ease: 'expo.out' }, 2.0);
tl.fromTo('.card__icon',
  { opacity: 0, scale: 0.86, transformOrigin: '50% 50%' },
  { opacity: 1, scale: 1, duration: 0.9, stagger: 0.15, ease: 'power3.out' }, 2.3);
tl.fromTo('.card__label',
  { opacity: 0, y: 18 },
  { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out' }, 2.45); // ends 3.65

/* 4.20–5.00  One detail per card, left → right */
drawLine('#write-line', { duration: 0.4, ease: 'power2.inOut' }, 4.2);
tl.fromTo('#anim-square', { rotation: 0, svgOrigin: '55 27' }, { rotation: 45, svgOrigin: '55 27', duration: 0.45, ease: 'power2.inOut' }, 4.38);
tl.fromTo('#anim-circle', { scale: 1, svgOrigin: '27 27' }, { scale: 1.18, svgOrigin: '27 27', duration: 0.2, ease: 'sine.out', yoyo: true, repeat: 1 }, 4.38);
tl.fromTo('#export-arrow', { y: -14 }, { y: 0, duration: 0.4, ease: 'power2.out' }, 4.6); // ends 5.00

/* 5.00–6.50  Connectors draw behind the cards, then nodes appear */
drawLine('.connector__line', { duration: 0.75, stagger: 0.55, ease: 'power2.inOut' }, 5.0); // ends 6.30
tl.fromTo('.connector__node',
  { scale: 0, transformOrigin: '50% 50%' },
  { scale: 1, duration: 0.4, stagger: 0.55, ease: 'power2.out' }, 5.5);                            // ends 6.45

/* 6.50–7.00  Settle: soft halos fade in around the nodes */
tl.fromTo('.connector__halo',
  { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' },
  { opacity: 0.12, scale: 1, duration: 0.5, ease: 'power2.out' }, 6.5);                           // ends 7.00

/* 7.00–8.00  Hold. Pin total duration to exactly 8 s. */
tl.set({}, {}, window.MOTION.duration);

window.tl = tl;

/* Render the composition at an exact time in seconds. */
window.renderAt = function renderAt(seconds) {
  tl.pause();
  tl.seek(Math.min(Math.max(seconds, 0), tl.duration()), true);
};
