/* Hailuo AI motion graphics: one paused GSAP timeline plus per-frame
   canvas drawing. window.__seek(t) renders the exact frame for time t,
   so the renderer can step through the video deterministically. */

const DUR = 63.4;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, p) => a + (b - a) * p;
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const prog = (t, start, dur) => clamp((t - start) / dur);

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

gsap.config({ force3D: false });
const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });

const NEUTRAL = { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, rotation: 0, rotationX: 0, rotationY: 0, skewX: 0, filter: "blur(0px)" };
const primed = new Set();

// Animate targets in from a hidden state at time t.
function inn(sel, t, from = {}, d = 0.6, ease = "power3.out", extra = {}) {
  const els = gsap.utils.toArray(sel);
  els.forEach((el) => { if (!primed.has(el)) { gsap.set(el, { autoAlpha: 0, ...from }); primed.add(el); } });
  const to = { autoAlpha: 1, duration: d, ease, immediateRender: false };
  for (const k in from) if (k in NEUTRAL) to[k] = NEUTRAL[k];
  tl.fromTo(els, { autoAlpha: 0, ...from }, { ...to, ...extra }, t);
}
function out(sel, t, to = {}, d = 0.4, ease = "power2.in") {
  tl.to(sel, { autoAlpha: 0, duration: d, ease, ...to }, t);
}
function scene(id, t0, t1, outVars = { scale: 1.06, filter: "blur(14px)" }) {
  tl.set(id, { autoAlpha: 1 }, t0);
  tl.to(id, { autoAlpha: 0, duration: 0.35, ease: "power2.in", ...outVars }, t1 - 0.35);
}

// Effects scheduled at absolute times.
const SFX = [];
const sfx = (t, type, gain = 1) => SFX.push({ t: +t.toFixed(3), type, gain });
const BURSTS = [];
const burst = (t, x, y, o = {}) => BURSTS.push({ t, x, y, n: 60, speed: 900, life: 1.3, g: 900, kind: "confetti", seed: BURSTS.length + 7, ...o });
const RINGS = [];
const ring = (t, x, y, o = {}) => RINGS.push({ t, x, y, r: 520, life: 0.7, color: "129,140,248", width: 10, ...o });
const SHAKES = [];
const shake = (t, amp = 14, dur = 0.45) => SHAKES.push({ t, amp, dur });
function flash(t, a = 0.65, d = 0.45) {
  tl.fromTo("#flash", { opacity: a }, { opacity: 0, duration: d, ease: "power2.out", immediateRender: false }, t);
}
// Camera inside a browser frame: content is a 1280x604 page image.
function focusRect(br, rect, pad = 0.9) {
  const el = $(br), W = +el.dataset.w, H = +el.dataset.h;
  if (!rect) return { x: 0, y: 0, scale: W / 1280 };
  const [rx, ry, rw, rh] = rect;
  const s = Math.max(W / 1280, Math.min(W / rw, H / rh) * pad);
  const x = clamp(W / 2 - (rx + rw / 2) * s, W - 1280 * s, 0);
  const y = clamp(H / 2 - (ry + rh / 2) * s, H - 604 * s, 0);
  return { x, y, scale: s };
}
const camInit = (br, rect) => gsap.set(`${br} .content`, focusRect(br, rect));
const cam = (br, t, rect, d = 0.9, ease = "power3.inOut") => tl.to(`${br} .content`, { ...focusRect(br, rect), duration: d, ease }, t);
const seqAt = (sel, t0) => $$(sel).forEach((el) => (el.dataset.t0 = t0));
const hlIn = (sel, t) => inn(sel, t, { scale: 1.3 }, 0.4, "back.out(2)");

const SPARK = ["94,234,212", "129,140,248", "244,114,182", "255,255,255"];
const GOLD = ["251,191,36", "253,230,138", "245,158,11", "255,255,255"];
const CONF = ["94,234,212", "129,140,248", "244,114,182", "251,191,36", "52,211,153"];

/* ---------------- HUD ---------------- */
inn("#badge", 2.55, { x: -40 }, 0.6);
out("#badge", 60.75, { x: -40 }, 0.35);

/* ---------------- Scene 1: Number 2 is Hailuo AI ---------------- */
{
  gsap.set("#s1-rank", { xPercent: -50, yPercent: -50 });
  gsap.set("#s1-brand", { yPercent: -50 });
  // spiral logo path
  let d = "";
  for (let i = 0; i <= 140; i++) {
    const a = i * 0.11, r = 3 + i * 0.36;
    d += (i ? "L" : "M") + (Math.cos(a) * r).toFixed(2) + " " + (Math.sin(a) * r).toFixed(2);
  }
  $("#s1-spiral").setAttribute("d", d);
  $("#s11-spiral").setAttribute("d", d);
  const len = $("#s1-spiral").getTotalLength();
  gsap.set("#s1-spiral", { strokeDasharray: len, strokeDashoffset: len });

  gsap.set("#s1", { autoAlpha: 1 });
  scene("#s1", 0, 2.55, { scale: 1.3, filter: "blur(24px)" });
  const tRank = w("2") - 0.22;
  inn("#s1-rank", tRank, { scale: 2.8, filter: "blur(30px)" }, 0.5, "expo.out");
  sfx(tRank, "riser_short", 0.6); sfx(tRank + 0.22, "impact", 1);
  ring(tRank + 0.22, 960, 540, { r: 700 }); shake(tRank + 0.22, 18);
  burst(tRank + 0.25, 960, 540, { kind: "spark", n: 70, colors: SPARK, g: 0, speed: 1300, life: 0.8 });

  const tBrand = w("Hailuo") - 0.12;
  tl.to("#s1-rank", { x: -500, scale: 0.6, duration: 0.6, ease: "power3.inOut" }, tBrand);
  tl.set("#s1-brand", { autoAlpha: 1 }, tBrand);
  primed.add($("#s1-brand"));
  gsap.set("#s1-brand", { autoAlpha: 0 });
  tl.to("#s1-spiral", { strokeDashoffset: 0, duration: 0.7, ease: "power2.out" }, tBrand + 0.1);
  inn("#s1-logo", tBrand + 0.1, { scale: 0.4, rotation: -120 }, 0.7, "back.out(1.6)");
  inn("#s1-brand .wm span:not(.ai)", tBrand + 0.15, { y: 110, rotationX: -80 }, 0.5, "back.out(1.7)", { stagger: 0.045 });
  inn("#s1-brand .wm .ai", w("AI.") - 0.05, { scale: 1.8, filter: "blur(16px)" }, 0.4, "back.out(2)");
  inn("#s1-brand .tag", w("AI.") + 0.2, { y: 20 }, 0.5);
  sfx(tBrand, "whoosh", 0.7); sfx(w("AI.") + 0.05, "pop", 0.8);
  burst(w("AI.") + 0.1, 1560, 520, { kind: "spark", n: 40, colors: SPARK, g: 0, speed: 700, life: 0.7 });
}

/* ---------------- Scene 2: generator recording -> seriously impressive ---------------- */
{
  scene("#s2", 2.42, 6.15);
  seqAt("#s2-br .seq", 2.45);
  camInit("#s2-br", null);
  inn("#s2-br", 2.45, { y: 90, scale: 0.92, filter: "blur(12px)" }, 0.7);
  inn("#s2-kick", 2.6, { y: 20 }, 0.5);
  sfx(2.45, "whoosh", 0.8);
  cam("#s2-br", 2.95, [120, 230, 900, 260], 1.1);
  sfx(3.0, "swoosh", 0.4);
  const tSer = w("seriously") - 0.18;
  out("#s2-kick", tSer - 0.15, { y: -20 }, 0.25);
  out("#s2-br", tSer - 0.05, { scale: 0.9, filter: "blur(10px)" }, 0.35);
  seqAt("#s2-hero .seq", tSer);
  inn("#s2-hero", tSer + 0.05, { scale: 1.12, filter: "blur(18px)" }, 0.55, "expo.out");
  flash(tSer + 0.08, 0.3, 0.4);
  inn("#s2-head", tSer + 0.08, { y: 40, scale: 0.86, filter: "blur(14px)" }, 0.55, "back.out(1.6)");
  inn("#s2-hero .made", tSer + 0.5, { x: 20 }, 0.4);
  sfx(tSer + 0.05, "whoosh", 0.7);
  sfx(w("impressive") + 0.05, "sparkle", 0.8);
  burst(w("impressive") + 0.05, 1180, 118, { kind: "spark", n: 55, colors: SPARK, g: 0, speed: 800, life: 0.9 });
}

/* ---------------- Scene 3: gallery -> people, movement, realistic scenes ---------------- */
{
  scene("#s3", 6.1, 12.25);
  inn("#s3-kick", 6.2, { y: 20 }, 0.5);
  inn("#s3-title", w("particularly") - 0.1, { y: 40, filter: "blur(12px)" }, 0.6);
  sfx(6.15, "whoosh", 0.7);
  seqAt("#s3-br .seq", 6.2);
  camInit("#s3-br", null);
  inn("#s3-br", 6.2, { y: 90, scale: 0.92, filter: "blur(12px)" }, 0.7);
  out("#s3-br", w("people,") - 0.4, { scale: 0.9, y: 40, filter: "blur(10px)" }, 0.3);
  [["#s3-c1", w("people,"), 442], ["#s3-c2", w("movement,"), 960], ["#s3-c3", w("realistic"), 1478]].forEach(([c, t, x], i) => {
    seqAt(`${c} .seq`, t - 0.12);
    inn(c, t - 0.12, { y: 80, scale: 0.8, rotationX: 30 }, 0.6, "back.out(1.5)");
    sfx(t - 0.05, "pop", 0.9);
    burst(t + 0.1, x, 555, { kind: "spark", n: 30, colors: SPARK, g: 0, speed: 600, life: 0.6, seed: 40 + i });
  });
}

/* ---------------- Scene 4a: free option on the pricing page ---------------- */
{
  scene("#s4a", 12.2, 15.15, { x: -160, filter: "blur(10px)" });
  camInit("#s4-br", null);
  inn("#s4-br", 12.25, { x: -80, filter: "blur(12px)" }, 0.6);
  sfx(12.25, "whoosh", 0.7);
  const tFree = w("free", 12.2) - 0.12;
  cam("#s4-br", tFree - 0.2, [270, 120, 360, 480], 0.8);
  hlIn("#s4-hl1", tFree + 0.3);
  inn("#s4-ticket", tFree, { scale: 0.3, rotation: -14 }, 0.65, "back.out(1.8)");
  sfx(tFree + 0.05, "impact", 0.8); shake(tFree + 0.1, 10);
  burst(tFree + 0.15, 1500, 370, { n: 80, colors: CONF, speed: 1100 });
  const tOnce = w("one-time") - 0.15;
  cam("#s4-br", tOnce - 0.1, [240, 330, 470, 200], 0.7);
  out("#s4-hl1", tOnce - 0.1, {}, 0.2);
  hlIn("#s4-hl2", tOnce + 0.35);
  sfx(tOnce + 0.35, "pop", 0.7);
  inn("#s4-label", tOnce + 0.1, { x: 50 }, 0.5);
  tl.to("#s4-label .once", { scale: 1.15, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" }, w("free", 14) - 0.05);
}

/* ---------------- Scene 4b: try before paid plans ---------------- */
{
  scene("#s4b", 15.05, 18.05);
  inn("#s4b-title", 15.12, { y: 40, filter: "blur(12px)" }, 0.55);
  sfx(15.1, "whoosh", 0.6);
  const t1 = w("try", 16) - 0.25, t2 = w("paid", 17) - 0.15;
  inn("#s4-n1", t1, { x: -90, scale: 0.9 }, 0.5, "back.out(1.6)");
  sfx(t1 + 0.05, "pop", 0.8);
  gsap.set("#s4-arrowp", { strokeDasharray: 300, strokeDashoffset: 300 });
  tl.to("#s4-arrowp", { strokeDashoffset: 0, duration: t2 - t1 - 0.35, ease: "power2.inOut" }, t1 + 0.3);
  inn("#s4-arrowh", t2 - 0.12, { x: -30 }, 0.3);
  sfx(t1 + 0.3, "swoosh", 0.5);
  inn("#s4-n2", t2, { x: 90, scale: 0.9 }, 0.5, "back.out(1.6)");
  sfx(t2 + 0.05, "pop", 0.9);
  burst(t2 + 0.15, 1410, 510, { kind: "spark", n: 40, colors: SPARK, g: 0, speed: 700, life: 0.7 });
}

/* ---------------- Scene 5: monthly price on the pricing page ---------------- */
const S5 = { price: w("$10.50") - 0.05, cred: w("1,000") - 0.05 };
{
  scene("#s5", 18.0, 23.55);
  camInit("#s5-br", null);
  inn("#s5-br", 18.05, { x: -80, filter: "blur(12px)" }, 0.6);
  inn("#s5-main", 18.15, { x: 90, scale: 0.92, filter: "blur(12px)" }, 0.7);
  sfx(18.1, "whoosh", 0.8);
  cam("#s5-br", w("monthly") - 0.2, [600, 120, 370, 480], 0.8);
  hlIn("#s5-hl0", w("monthly") + 0.2);
  inn("#s5-main .pill", w("monthly") - 0.1, { scale: 0.6 }, 0.4, "back.out(2)");
  sfx(w("monthly"), "pop", 0.5);
  inn("#s5-from", w("starting") - 0.1, { y: 15 }, 0.4);
  cam("#s5-br", S5.price - 0.3, [600, 190, 380, 250], 0.7);
  out("#s5-hl0", S5.price - 0.3, {}, 0.2);
  hlIn("#s5-hl1", S5.price + 0.1);
  tl.to("#s5-num", { scale: 1.12, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "0% 80%" }, S5.price + 0.9);
  sfx(S5.price, "roll", 0.55); sfx(S5.price + 0.9, "chime", 0.8);
  burst(S5.price + 0.95, 1420, 420, { kind: "spark", n: 50, colors: GOLD, g: 0, speed: 800, life: 0.8 });
  inn("#s5-per", w("per") - 0.05, { x: -20 }, 0.35);
  inn("#s5-cred, #s5-cbar", S5.cred - 0.3, { y: 20 }, 0.4);
  hlIn("#s5-hl2", S5.cred);
  sfx(S5.cred, "coin", 0.8); sfx(S5.cred + 0.7, "pop", 0.6);
}

/* ---------------- Scene 6: yearly discount on the pricing page ---------------- */
const S6 = { yearly: w("yearly") - 0.1, stamp: w("47%") - 0.08, save: w("save") - 0.1 };
{
  scene("#s6", 23.5, 29.65);
  camInit("#s6-br", null);
  inn("#s6-br", 23.55, { x: -80, filter: "blur(12px)" }, 0.6);
  sfx(23.55, "whoosh", 0.6);
  cam("#s6-br", 23.9, [20, 40, 520, 240], 0.9);
  hlIn("#s6-hl1", S6.yearly);
  sfx(S6.yearly + 0.05, "click", 0.9);
  hlIn("#s6-hl2", S6.stamp - 0.1);
  inn("#s6-stamp", S6.stamp, { scale: 2.8, rotation: -28, filter: "blur(10px)" }, 0.32, "power4.in", { rotation: -7 });
  sfx(S6.stamp + 0.3, "stamp", 1); shake(S6.stamp + 0.32, 20);
  ring(S6.stamp + 0.32, 1500, 435, { color: "52,211,153", r: 600 });
  burst(S6.stamp + 0.34, 1500, 435, { n: 70, colors: ["52,211,153", "255,255,255", "94,234,212"], speed: 1000 });
  cam("#s6-br", S6.save - 0.45, null, 1.0);
  out("#s6-hl1", S6.save - 0.45, {}, 0.3);
  inn("#s6-save", S6.save, { y: 40, scale: 0.85 }, 0.5, "back.out(1.8)");
  sfx(S6.save + 0.05, "chime", 0.7);
  burst(S6.save + 0.15, 1500, 700, { kind: "spark", n: 40, colors: ["52,211,153", "255,255,255"], g: 0, speed: 700, life: 0.7 });
}

/* ---------------- Scene 7: the downside ---------------- */
const S7 = { down: w("downside") - 0.18 };
{
  scene("#s7", 29.6, 32.25);
  tl.to("#redtint", { opacity: 1, duration: 0.35, ease: "power2.out" }, 29.6);
  tl.to("#redtint", { opacity: 0, duration: 0.45, ease: "power2.in" }, 31.95);
  sfx(29.65, "drop", 0.9);
  inn("#s7-but", w("But", 29.5) - 0.08, { scale: 1.7, filter: "blur(20px)" }, 0.4, "expo.out");
  shake(w("But", 29.5) + 0.1, 10);
  const tw = w("here", 30.5) - 0.1;
  out("#s7-but", tw, { y: -60, scale: 0.8 }, 0.3);
  inn("#s7-warn", tw + 0.05, { scale: 0, rotation: -40 }, 0.5, "back.out(2.2)");
  sfx(tw + 0.05, "alert", 0.8);
  inn("#s7-down", S7.down, { y: 60, skewX: -14, filter: "blur(10px)" }, 0.4, "expo.out");
  sfx(S7.down + 0.05, "glitch", 0.9); shake(S7.down + 0.1, 16);
  ring(S7.down + 0.1, 960, 600, { color: "244,63,94", r: 800 });
}

/* ---------------- Scene 8a: every platform ---------------- */
{
  scene("#s8a", 32.2, 35.45);
  inn("#s8-title", 32.32, { y: 40, filter: "blur(12px)" }, 0.55);
  sfx(32.3, "whoosh", 0.7);
  inn("#s8-tiles .tile", 32.7, { y: 90, rotationY: 40, scale: 0.85 }, 0.55, "back.out(1.4)", { stagger: 0.13 });
  [0, 1, 2, 3, 4].forEach((i) => sfx(32.78 + i * 0.13, "tick", 0.5));
  tl.to("#s8-hero", { scale: 1.1, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, w("platform") - 0.05);
  ring(w("platform") + 0.05, 960, 490, { r: 300, life: 0.6, width: 6 });
  sfx(w("platform"), "pop", 0.6);
}

/* ---------------- Scene 8b: plan decides credits (pricing page) ---------------- */
{
  scene("#s8b", 35.3, 38.95);
  inn("#s8b-title", 35.42, { y: 40, filter: "blur(12px)" }, 0.55);
  sfx(35.4, "whoosh", 0.7);
  camInit("#s8-br", null);
  inn("#s8-br", 35.5, { y: 90, scale: 0.92, filter: "blur(12px)" }, 0.65);
  cam("#s8-br", 36.0, [270, 170, 1010, 300], 1.2);
  [["#s8-hl0", w("generations")], ["#s8-hl1", w("credits", 36)], ["#s8-hl2", w("depend") + 0.05]].forEach(([el, t]) => {
    hlIn(el, t); sfx(t + 0.05, "pop", 0.6);
  });
  tl.to("#s8-br .hl", { scale: 1.12, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" }, w("plan", 37) - 0.05);
  sfx(w("plan", 37), "chime", 0.5);
}

/* ---------------- Scene 9: credit efficiency ---------------- */
const S9 = { start: 39.2, end: 41.4, drain0: 39.5, drain1: 42.5, eff: w("credit", 42) - 0.15 };
{
  const grid = $("#s9-grid");
  const pal = [["#0f766e", "#312e81"], ["#7c2d12", "#be185d"], ["#1e3a8a", "#0e7490"], ["#4c1d95", "#9d174d"], ["#14532d", "#0f766e"], ["#713f12", "#9a3412"]];
  for (let i = 0; i < 12; i++) {
    const d = document.createElement("div");
    d.className = "thumb";
    const [a, b] = pal[i % pal.length];
    d.style.background = `#111 url(../media/thumbs/${i + 1}.jpg) center/cover`;
    grid.appendChild(d);
  }
  scene("#s9", 38.9, 44.25);
  inn("#s9-t1", 39.0, { y: 40, filter: "blur(12px)" }, 0.55);
  sfx(38.98, "whoosh", 0.7);
  inn("#s9-grid .thumb", S9.start, { scale: 0.2 }, 0.4, "back.out(2)", { stagger: (S9.end - S9.start) / 12 });
  for (let i = 0; i < 12; i++) sfx(S9.start + 0.05 + (i * (S9.end - S9.start)) / 12, "tick", 0.35);
  inn("#s9-count", 39.15, { y: 20 }, 0.4);
  inn("#s9-meter", 39.25, { x: 90 }, 0.55);
  out("#s9-t1", S9.eff - 0.1, { y: -40 }, 0.25);
  tl.set("#s9-t2", { visibility: "visible" }, 0);
  inn("#s9-t2", S9.eff + 0.05, { y: 40, filter: "blur(12px)" }, 0.5);
  sfx(S9.eff, "alert", 0.7);
  tl.to("#s9-meter", { scale: 1.05, duration: 0.25, yoyo: true, repeat: 3, ease: "sine.inOut" }, S9.eff + 0.1);
}

/* ---------------- Scene 10: the interesting part ---------------- */
{
  scene("#s10", 44.2, 46.35);
  flash(44.32, 0.6, 0.5);
  sfx(44.0, "riser_short", 0.6); sfx(44.32, "sparkle", 0.8);
  inn("#s10-rays", 44.3, { scale: 0.5 }, 0.8, "power2.out", { autoAlpha: 0.55 });
  inn("#s10-gift", 44.35, { scale: 0, rotation: -25 }, 0.6, "back.out(2)");
  tl.to("#s10-gift", { rotation: 9, duration: 0.07, yoyo: true, repeat: 7, ease: "sine.inOut" }, 45.0);
  inn("#s10-a", w("here", 44) - 0.1, { y: 30 }, 0.45);
  inn("#s10-b", w("interesting") - 0.08, { scale: 1.5, filter: "blur(20px)" }, 0.45, "expo.out");
  sfx(w("interesting"), "impact", 0.7); shake(w("interesting") + 0.1, 10);
  burst(w("interesting") + 0.1, 960, 600, { kind: "spark", n: 80, colors: SPARK, g: 0, speed: 1200, life: 0.9 });
}

/* ---------------- Scene 11: new user, MiniMax Design, 3,000 free credits ---------------- */
const S11 = { dl: w("download") - 0.05, dlDur: 1.1, num: w("3,000") - 0.1, numDur: 1.0 };
{
  scene("#s11", 46.3, 53.5);
  sfx(46.3, "whoosh", 0.6);
  inn("#s11-shot", 46.35, { y: -60, scale: 0.94, filter: "blur(12px)" }, 0.7);
  inn("#s11-new", w("new") - 0.15, { x: -70, scale: 0.9 }, 0.5, "back.out(1.7)");
  sfx(w("new"), "pop", 0.8);
  burst(w("new") + 0.1, 330, 545, { kind: "spark", n: 30, colors: SPARK, g: 0, speed: 500, life: 0.6 });
  hlIn("#s11-hl1", S11.dl - 0.15);
  sfx(S11.dl - 0.1, "pop", 0.6);
  inn("#s11-card", S11.dl - 0.35, { x: 90 }, 0.55, "back.out(1.4)");
  sfx(S11.dl - 0.35, "whoosh", 0.6);
  tl.to("#s11-get", { scale: 0.95, duration: 0.08 }, S11.dl + 0.12);
  tl.to("#s11-get", { scale: 1, duration: 0.25, ease: "back.out(3)" }, S11.dl + 0.2);
  sfx(S11.dl + 0.15, "click", 0.9); sfx(S11.dl + 0.2 + S11.dlDur, "chime", 0.8);
  burst(S11.dl + 0.2 + S11.dlDur, 1440, 690, { kind: "spark", n: 30, colors: SPARK, g: 0, speed: 500, life: 0.6 });
  hlIn("#s11-hl2", S11.num - 0.1);
  inn("#s11-num", S11.num - 0.05, { scale: 0.6, filter: "blur(16px)" }, 0.45, "back.out(1.6)");
  tl.to("#s11-num", { scale: 1.1, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "20% 60%" }, S11.num + S11.numDur);
  sfx(S11.num, "roll", 0.6); sfx(S11.num + S11.numDur, "impact", 0.9);
  shake(S11.num + S11.numDur, 16);
  burst(S11.num + S11.numDur, 520, 700, { n: 110, colors: CONF, speed: 1300, life: 1.6 });
  inn("#s11-free", w("free", 51) - 0.12, { y: 30, scale: 0.9 }, 0.45, "back.out(1.8)");
  sfx(w("free", 51), "pop", 0.7);
  inn("#s11-cta", w("start", 51.5) - 0.1, { y: 20 }, 0.5, "back.out(1.6)");
  sfx(w("start", 51.5), "swoosh", 0.5);
}

/* ---------------- Scene 12: conclusion ---------------- */
const S12 = { seal: w("absolutely") - 0.12 };
{
  scene("#s12", 53.45, 60.85);
  inn("#s12-kick", w("In", 53) - 0.05, { y: 20 }, 0.45);
  inn("#s12-title", w("conclusion") - 0.05, { y: 40, filter: "blur(12px)" }, 0.6);
  sfx(53.5, "whoosh", 0.8);
  inn("#s12-l1", w("impressive", 55) - 0.12, { x: -70 }, 0.5, "back.out(1.6)");
  sfx(w("impressive", 55), "check", 0.8);
  inn("#s12-l2", w("without") - 0.12, { x: -70 }, 0.5, "back.out(1.6)");
  sfx(w("without"), "check", 0.8);
  inn("#s12-chips .chip", w("conclusion") + 0.45, { y: 40, scale: 0.8 }, 0.45, "back.out(1.8)", { stagger: 0.09 });
  [0, 1, 2, 3, 4].forEach((i) => sfx(w("conclusion") + 0.5 + i * 0.09, "tick", 0.4));
  inn("#s12-seal", S12.seal, { scale: 2.4, rotation: -50, filter: "blur(14px)" }, 0.34, "power4.in");
  sfx(S12.seal + 0.3, "stamp", 1); shake(S12.seal + 0.34, 20);
  ring(S12.seal + 0.34, 1445, 535, { r: 700 });
  burst(S12.seal + 0.36, 1445, 535, { n: 120, colors: CONF, speed: 1300, life: 1.7 });
  sfx(w("worth") + 0.1, "chime", 0.7);
}

/* ---------------- Scene 13: reveal number one ---------------- */
const S13 = { one: w("number", 62) - 0.3 };
{
  gsap.set("#s13-one", { xPercent: -50, yPercent: -50 });
  scene("#s13", 60.75, DUR + 1);
  sfx(60.8, "whoosh", 0.7);
  inn("#s13-rays", 60.9, { scale: 0.3 }, 1.2, "power2.out");
  inn("#s13-kick", w("reveal") - 0.25, { y: 20, letterSpacing: "0.8em" }, 0.6, "power3.out", { letterSpacing: "0.32em" });
  sfx(61.2, "riser", 0.8);
  inn("#s13-one", S13.one, { scale: 0.3, filter: "blur(40px)" }, 0.7, "expo.out");
  flash(S13.one + 0.12, 0.55, 0.6);
  sfx(S13.one + 0.12, "impact", 1); shake(S13.one + 0.15, 22, 0.6);
  ring(S13.one + 0.15, 960, 500, { color: "251,191,36", r: 900 });
  burst(S13.one + 0.15, 960, 500, { kind: "spark", n: 120, colors: GOLD, g: 0, speed: 1500, life: 1.1 });
  inn("#s13-q", w("one.") - 0.05, { y: 30 }, 0.5);
}

/* ---------------- Captions ---------------- */
const KEY = /^(2|hailuo|ai|free|\$10\.50|1,000|47%|3,000|downside|impressive|worth|minimax|efficiency|yearly|monthly)/i;
const CHUNKS = [];
{
  const byPhrase = {};
  WORDS.forEach((x) => (byPhrase[x.phrase] = byPhrase[x.phrase] || []).push(x));
  Object.values(byPhrase).forEach((list) => {
    const n = Math.ceil(list.length / 5), size = Math.ceil(list.length / n);
    for (let i = 0; i < list.length; i += size) {
      const ws = list.slice(i, i + size);
      CHUNKS.push({ words: ws, start: ws[0].start, end: ws[ws.length - 1].end });
    }
  });
  CHUNKS.forEach((c, i) => {
    const next = CHUNKS[i + 1];
    c.show = c.start - 0.06;
    c.hide = next ? Math.min(next.start - 0.06, c.end + 0.7) : c.end + 0.6;
  });
}
const capEl = $("#captions .cap");
let capIdx = -2;
function drawCaptions(t) {
  const i = CHUNKS.findIndex((c) => t >= c.show && t < c.hide);
  if (i !== capIdx) {
    capIdx = i;
    capEl.innerHTML = i < 0 ? "" : CHUNKS[i].words.map((x) => `<span class="wd${KEY.test(x.text) ? " key" : ""}">${x.text}</span>`).join("");
  }
  if (i < 0) return;
  const c = CHUNKS[i];
  const p = easeOut(prog(t, c.show, 0.16));
  capEl.style.transform = `translateY(${(1 - p) * 26}px) scale(${0.94 + 0.06 * p})`;
  capEl.style.opacity = p;
  [...capEl.children].forEach((el, k) => el.classList.toggle("on", t >= c.words[k].start && t < c.words[k].end + 0.05));
}

/* ---------------- Background ---------------- */
const bg = $("#bg").getContext("2d");
const PARTS = (() => { const r = rng(11); return Array.from({ length: 110 }, () => ({ x: r() * 1920, y: r() * 1080, s: 0.3 + r() * 1.4, z: 0.6 + r() * 2.4, ph: r() * 6.28 })); })();
function drawBg(t) {
  bg.globalCompositeOperation = "source-over";
  bg.fillStyle = "#05060b";
  bg.fillRect(0, 0, 1920, 1080);
  const warm = clamp((t - 60.7) / 0.8);
  const blobs = [
    [94, 234, 212, 0], [129, 140, 248, 2.1], [244, 114, 182, 4.2],
  ];
  bg.globalCompositeOperation = "lighter";
  blobs.forEach(([r, g, b, ph], i) => {
    const cx = 960 + Math.sin(t * 0.17 + ph) * 640;
    const cy = 520 + Math.cos(t * 0.13 + ph * 1.3) * 300;
    const rr = lerp(r, 251, warm), gg = lerp(g, 191, warm), bb = lerp(b, 36, warm);
    const grd = bg.createRadialGradient(cx, cy, 0, cx, cy, 760);
    grd.addColorStop(0, `rgba(${rr | 0},${gg | 0},${bb | 0},0.17)`);
    grd.addColorStop(1, "rgba(0,0,0,0)");
    bg.fillStyle = grd;
    bg.fillRect(0, 0, 1920, 1080);
  });
  // perspective floor grid
  bg.globalCompositeOperation = "source-over";
  bg.strokeStyle = "rgba(148,163,184,0.07)";
  bg.lineWidth = 1.5;
  const hz = 700;
  for (let i = -16; i <= 16; i++) {
    const gl = bg.createLinearGradient(0, hz, 0, 1080);
    gl.addColorStop(0, "rgba(148,163,184,0)"); gl.addColorStop(1, "rgba(148,163,184,0.09)");
    bg.strokeStyle = gl;
    bg.beginPath(); bg.moveTo(960 + i * 40, hz); bg.lineTo(960 + i * 260, 1080); bg.stroke();
  }
  const off = (t * 0.6) % 1;
  for (let k = 0; k < 9; k++) {
    const z = (k + off) / 9, y = hz + Math.pow(z, 2.2) * 380;
    bg.strokeStyle = `rgba(148,163,184,${0.08 * z * z})`;
    bg.beginPath(); bg.moveTo(0, y); bg.lineTo(1920, y); bg.stroke();
  }
  // drifting particles
  PARTS.forEach((p) => {
    const y = (((p.y - t * 24 * p.z) % 1080) + 1080) % 1080;
    const x = p.x + Math.sin(t * 0.5 + p.ph) * 20;
    const a = 0.25 + 0.35 * Math.sin(t * 2 + p.ph) ** 2;
    bg.fillStyle = `rgba(226,232,240,${a * 0.6})`;
    bg.beginPath(); bg.arc(x, y, p.s * 1.3, 0, 6.283); bg.fill();
  });
}

/* ---------------- Counters and per-frame UI ---------------- */
const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
function drawUI(t) {
  $("#progress i").style.width = clamp(t / DUR) * 100 + "%";
  // scene 5
  const pp = easeOut(prog(t, S5.price, 0.9));
  $("#s5-num").textContent = "$" + (10.5 * pp).toFixed(2);
  const cp = easeOut(prog(t, S5.cred, 0.75));
  $("#s5-cnum").textContent = fmt(1000 * cp);
  $("#s5-cbar i").style.width = cp * 100 + "%";
  // scene 7 glitch
  const down = $("#s7-down");
  if (t > S7.down && t < 32.3) {
    const r = rng(Math.floor(t * 20) + 3), on = r() < 0.55, dx = on ? (r() - 0.5) * 22 : 0;
    down.style.textShadow = `${dx}px 0 rgba(34,211,238,0.85), ${-dx}px 0 rgba(244,63,94,0.9)`;
    down.style.clipPath = on && r() < 0.4 ? `inset(${r() * 60}% 0 ${r() * 30}% 0)` : "none";
  } else { down.style.textShadow = "none"; down.style.clipPath = "none"; }
  // scene 9
  const vp = prog(t, S9.start, S9.end - S9.start + 0.6);
  $("#s9-n").textContent = Math.round(easeOut(vp) * 48);
  const dp = easeInOut(prog(t, S9.drain0, S9.drain1 - S9.drain0));
  const pct = 100 - 86 * dp;
  $("#s9-pct").textContent = Math.round(pct) + "%";
  const fill = $("#s9-fill");
  fill.style.width = pct + "%";
  const col = pct > 55 ? "#34d399" : pct > 28 ? "#fbbf24" : "#f43f5e";
  fill.style.background = `linear-gradient(90deg, ${col}, ${col}cc)`;
  $("#s9-pct").style.color = col;
  const lowGlow = pct < 28 ? 0.5 + 0.5 * Math.sin(t * 12) : 0;
  $("#s9-meter").style.boxShadow = `0 30px 80px rgba(0,0,0,.45), 0 0 ${60 * lowGlow}px rgba(244,63,94,${0.7 * lowGlow})`;
  // scene 10 / 12 / 13 rotations
  $("#s10-rays").style.rotate = t * 14 + "deg";
  $("#s12-seal .ring").style.rotate = t * 24 + "deg";
  $("#s13-rays").style.rotate = -t * 10 + "deg";
  // scene 11
  $("#s11-num").textContent = fmt(3000 * easeOut(prog(t, S11.num, S11.numDur)));
  const dl = prog(t, S11.dl + 0.2, S11.dlDur), get = $("#s11-get"), ringEl = $("#s11-ring");
  if (t < S11.dl + 0.2) { $("#s11-gtxt").textContent = "GET"; ringEl.classList.add("h"); get.style.background = "#2563eb"; }
  else if (dl < 1) { $("#s11-gtxt").textContent = ""; ringEl.classList.remove("h"); $("#s11-arc").style.strokeDashoffset = 100.5 * (1 - easeInOut(dl)); get.style.background = "#1e293b"; }
  else { $("#s11-gtxt").textContent = "OPEN"; ringEl.classList.add("h"); get.style.background = "#16a34a"; }
}

/* ---------------- FX canvas: bursts, rings ---------------- */
const fx = $("#fx").getContext("2d");
const PREP = BURSTS.map((b) => {
  const r = rng(b.seed * 977);
  return Array.from({ length: b.n }, () => {
    const a = r() * 6.283, s = b.speed * (0.25 + r() * 0.75);
    return { vx: Math.cos(a) * s, vy: Math.sin(a) * s - (b.kind === "confetti" ? b.speed * 0.45 : 0), c: b.colors ? b.colors[(r() * b.colors.length) | 0] : CONF[(r() * CONF.length) | 0], w: 8 + r() * 10, h: 5 + r() * 8, spin: (r() - 0.5) * 18, life: b.life * (0.6 + r() * 0.4) };
  });
});
function drawFx(t) {
  fx.clearRect(0, 0, 1920, 1080);
  RINGS.forEach((rg) => {
    const dt = t - rg.t;
    if (dt < 0 || dt > rg.life) return;
    const p = dt / rg.life, r = easeOut(p) * rg.r;
    fx.strokeStyle = `rgba(${rg.color},${(1 - p) * 0.8})`;
    fx.lineWidth = rg.width * (1 - p) + 1;
    fx.beginPath(); fx.arc(rg.x, rg.y, r, 0, 6.283); fx.stroke();
  });
  BURSTS.forEach((b, bi) => {
    const dt = t - b.t;
    if (dt < 0 || dt > b.life * 1.05) return;
    PREP[bi].forEach((p) => {
      if (dt > p.life) return;
      const drag = Math.exp(-dt * (b.kind === "spark" ? 3.2 : 1.6));
      const k = (1 - drag) / (b.kind === "spark" ? 3.2 : 1.6);
      const x = b.x + p.vx * k, y = b.y + p.vy * k + 0.5 * b.g * dt * dt;
      const a = 1 - dt / p.life;
      if (b.kind === "spark") {
        const vx = p.vx * drag, vy = p.vy * drag, sp = Math.hypot(vx, vy) + 1, L = 6 + sp * 0.03;
        fx.strokeStyle = `rgba(${p.c},${a})`; fx.lineWidth = 3;
        fx.beginPath(); fx.moveTo(x, y); fx.lineTo(x - (vx / sp) * L, y - (vy / sp) * L); fx.stroke();
        fx.fillStyle = `rgba(${p.c},${a})`; fx.beginPath(); fx.arc(x, y, 2.4, 0, 6.283); fx.fill();
      } else {
        fx.save(); fx.translate(x, y); fx.rotate(p.spin * dt); fx.scale(1, Math.abs(Math.cos(p.spin * dt * 0.7)) + 0.2);
        fx.fillStyle = `rgba(${p.c},${a})`; fx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); fx.restore();
      }
    });
  });
}

function applyShake(t) {
  let dx = 0, dy = 0;
  SHAKES.forEach((s) => {
    const dt = t - s.t;
    if (dt < 0 || dt > s.dur) return;
    const a = s.amp * Math.pow(1 - dt / s.dur, 2);
    dx += Math.sin(dt * 90) * a; dy += Math.cos(dt * 77) * a * 0.7;
  });
  $("#world").style.transform = dx || dy ? `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)` : "";
}

/* ---------------- Footage frame sequences ---------------- */
const SEQ = $$("img.seq");
function drawMedia(t) {
  const jobs = [];
  SEQ.forEach((img) => {
    const n = MEDIA[img.dataset.seq], t0 = +(img.dataset.t0 || 0);
    if (t < t0 - 1 || t > t0 + n / 30 + 4) return;
    const idx = Math.min(n, Math.max(1, Math.floor((t - t0) * 30 + 1e-6) + 1));
    const src = `../media/${img.dataset.seq}/${String(idx).padStart(4, "0")}.jpg`;
    if (img.dataset.cur !== src) {
      img.dataset.cur = src;
      img.src = src;
      jobs.push(img.decode().catch(() => {}));
    }
  });
  return jobs;
}

/* ---------------- Entry point ---------------- */
let lastT = 0;
window.__seek = (t) => {
  // step forward in small hops so tweens initialise in order
  if (t < lastT) tl.seek(0, false);
  for (let s = Math.max(lastT, 0); s < t; s += 0.25) tl.seek(s, false);
  tl.seek(t, false);
  lastT = t;
  drawBg(t); drawUI(t); drawCaptions(t); drawFx(t); applyShake(t);
  return Promise.all(drawMedia(t));
};
window.__dur = DUR;
window.__sfx = SFX.sort((a, b) => a.t - b.t);
window.__ready = document.fonts.ready
  .then(() => Promise.all([...document.images].filter((i) => i.getAttribute("src")).map((i) => i.decode().catch(() => {}))))
  .then(() => window.__seek(0))
  .then(() => true);
