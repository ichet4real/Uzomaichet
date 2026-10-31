// Deterministic renderer: window.renderAt(t) draws the frame at time t (seconds).
// All cue times come from the narration (assets/narration.mp3).

const $ = id => document.getElementById(id);
const $$ = sel => [...document.querySelectorAll(sel)];
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const P = (t, t0, d) => cl((t - t0) / d);
const L = (a, b, x) => a + (b - a) * x;
const eo = x => 1 - Math.pow(1 - x, 3);
const eio = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const bk = x => { const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const bump = x => Math.sin(Math.PI * cl(x));

function tf(el, { x = 0, y = 0, s = 1, r = 0, o = 1, b = 0 } = {}) {
  el.style.transform = `translate(${x}px,${y}px) scale(${s}) rotate(${r}deg)`;
  el.style.opacity = o;
  el.style.filter = b > 0.05 ? `blur(${b}px)` : 'none';
}
function win(t, a, b, fi = .3, fo = .35) {
  if (t < a || t > b) return 0;
  return Math.min(eo(P(t, a, fi)), 1 - eio(P(t, b - fo, fo)));
}
// Scene layer: fades in at a, drifts up and fades out at b.
function layer(id, t, a, b) {
  const el = $(id);
  const o = win(t, a, b);
  if (o <= 0) { el.style.display = 'none'; return false; }
  el.style.display = 'flex';
  el.style.opacity = o;
  const ex = eio(P(t, b - .35, .35));
  el.style.transform = `translateY(${-40 * ex}px) scale(${1 - .03 * ex})`;
  return true;
}
// Word reveal: rise + unblur.
function wIn(el, t, t0, d = .5, dy = 50, dx = 0) {
  const p = P(t, t0, d), e = eo(p);
  tf(el, { x: (1 - e) * dx, y: (1 - e) * dy, o: cl(p * 1.7), b: (1 - e) * 10 });
}
function words(parent, t, times) {
  [...parent.querySelectorAll('.w')].forEach((w, i) => wIn(w, t, times[Math.min(i, times.length - 1)] + (i >= times.length ? (i - times.length + 1) * .12 : 0)));
}

// ---------- one-time setup ----------
const slots = [];
(function setup() {
  const cs = $('cSlots');
  for (let i = 0; i < 4; i++) {
    const d = document.createElement('div');
    d.className = 'abs';
    d.style.cssText = `left:${195 + i * 390}px;top:498px;width:360px;height:203px;border-radius:18px;background:${i ? '#EEF2F7' : '#0B1B3A'};border:2px dashed ${i ? '#C9D3E0' : 'transparent'};display:flex;align-items:flex-start;padding:16px 20px;font-family:'DejaVu Sans Mono',monospace;font-weight:700;font-size:24px;color:${i ? '#93A3B8' : '#22D3EE'}`;
    d.textContent = 'SCENE 0' + (i + 1);
    cs.appendChild(d); slots.push(d);
  }
  const list = $('iList');
  ['Read the plan', 'Check the wording', 'Check scene order', 'Leave room to read'].forEach(txt => {
    const r = document.createElement('div');
    r.className = 'iRow';
    r.style.cssText = 'display:flex;align-items:center;gap:22px;margin-bottom:34px';
    r.innerHTML = `<div class="iChk" style="width:54px;height:54px;border-radius:50%;border:4px solid #C9D3E0;display:flex;align-items:center;justify-content:center;flex:none">
        <svg width="30" height="30" viewBox="0 0 30 30"><path class="iTick" d="M5 16 L12 23 L25 8" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="32" stroke-dashoffset="32"/></svg></div>
      <div style="font-size:40px;font-weight:700;color:#0B1B3A;letter-spacing:-.01em">${txt}</div>`;
    list.appendChild(r);
  });
})();

const TOTAL = 50.904;
const imgCache = {};

window.renderAt = async function (t) {
  // ---------- background ----------
  $('bgRing').style.transform = `rotate(${t * 4}deg)`;
  $('bgSq').style.transform = `rotate(${-t * 3}deg) translateY(${Math.sin(t * .4) * 20}px)`;
  tf($('bgDot1'), { x: 1720 + Math.sin(t * .5) * 30, y: 860 + Math.cos(t * .4) * 26, o: .5 });
  tf($('bgDot2'), { x: 170 + Math.cos(t * .45) * 24, y: 300 + Math.sin(t * .35) * 30, o: .18 });
  tf($('bgDot3'), { x: 1610 + Math.cos(t * .3) * 20, y: 180 + Math.sin(t * .5) * 18, o: .45 });
  $('prog').style.width = (cl(t / TOTAL) * 1920) + 'px';

  // ---------- persistent chips ----------
  {
    const inP = eo(P(t, 3.0, .6)), outP = eio(P(t, 49.2, .4));
    tf($('stepChip'), { x: (1 - inP) * -60 - outP * 60, o: inP * (1 - outP) });
    const sIn = eo(P(t, 7.2, .5)), sOut = eio(P(t, 26.0, .35));
    tf($('sceneTrack'), { x: (1 - sIn) * 60, o: sIn * (1 - sOut) });
    const sc = t < 11.4 ? 1 : t < 18.25 ? 2 : t < 23.4 ? 3 : 4;
    $('sceneLbl').textContent = 'SCENE 0' + sc;
    $$('.sdot').forEach((d, i) => {
      d.style.background = i < sc ? '#22D3EE' : '#D5DDE8';
      d.style.width = (i === sc - 1 ? 40 : 14) + 'px';
    });
  }

  // ---------- A: Step five (0 - 3.2) ----------
  if (layer('A', t, 0, 3.2)) {
    $('aRing').style.strokeDashoffset = 880 * (1 - eio(P(t, .15, .9)));
    const dp = P(t, .25, .6);
    tf($('aDisc'), { s: L(.3, 1, bk(dp)), o: cl(dp * 2) });
    tf($('aBadge'), { r: (1 - eo(P(t, .15, 1))) * -30 });
    wIn($('aLabel'), t, .57, .5, 0, -40);
    wIn($('aW1'), t, 1.28); wIn($('aW2'), t, 1.45); wIn($('aW3'), t, 1.62);
    $('aUnder').style.width = (eio(P(t, 2.0, .5)) * 94) + '%';
  }

  // ---------- B: decide what the viewer sees (3.15 - 7.15) ----------
  if (layer('B', t, 3.15, 7.15)) {
    wIn($('bSmall'), t, 3.27);
    words($('bL1'), t, [4.53, 4.85]);
    words($('bL2'), t, [5.5, 5.62, 5.74, 5.86, 5.98]);
    const ep = P(t, 5.8, .5);
    const blink = 1 - .9 * bump(P(t, 6.45, .22));
    $('bEye').style.transform = `scale(${L(.4, 1, bk(ep))}) scaleY(${blink})`;
    $('bEye').style.opacity = cl(ep * 2);
    $('bPupil').setAttribute('transform', `translate(${Math.sin((t - 5.8) * 3) * 14 * ep},0)`);
  }

  // ---------- C: scene one (7.15 - 11.4) ----------
  let wantImg = null;
  if (layer('C', t, 7.15, 11.4)) {
    words($('cHead'), t, [7.29, 7.45, 7.62, 7.85]);
    const grow = eio(P(t, 8.3, .75));
    slots.forEach((s, i) => {
      const p = P(t, 7.5 + i * .1, .5);
      const out = i ? eio(P(t, 8.2, .4)) : 0;
      tf(s, { y: (1 - eo(p)) * 50 + out * 40, s: 1 - out * .15, o: cl(p * 2) * (1 - out) * (i ? 1 : 0) });
    });
    // monitor grows out of slot 1
    const mon = $('cMon'), p0 = P(t, 7.5, .5);
    const x = L(195, 400, grow), y = L(498, 296, grow), w = L(360, 1120, grow), h = L(203, 630, grow);
    mon.style.left = x + 'px'; mon.style.top = y + 'px'; mon.style.width = w + 'px'; mon.style.height = h + 'px';
    mon.style.borderRadius = L(18, 26, grow) + 'px';
    tf(mon, { y: (1 - eo(p0)) * 50, o: cl(p0 * 2) });
    const exT = cl(.25 + (t - 8.75), 0, 3.43);
    wantImg = 'assets/example/f' + String(1 + Math.round(exT * 30)).padStart(4, '0') + '.jpg';
  }

  // ---------- D + E: three topics -> together (11.35 - 23.45) ----------
  if (layer('D', t, 11.35, 23.45)) {
    // header: centered, then moves up
    const mv = eio(P(t, 13.3, .6));
    const dh = $('dHead');
    dh.style.top = L(430, 112, mv) + 'px';
    dh.style.transformOrigin = '50% 0';
    const dOut = eio(P(t, 18.05, .35));
    tf(dh, { s: L(1, .7, mv), o: 1 - dOut, y: -dOut * 30 });
    wIn($('dSmall'), t, 11.46);
    [...dh.querySelectorAll('.w')].forEach((w, i) => wIn(w, t, [12.45, 12.68][i]));

    // cards
    const conv = eio(P(t, 18.9, 1.0));
    const col = eio(P(t, 20.15, .45));
    [13.92, 15.14, 16.35].forEach((T, i) => {
      const c = $('card' + (i + 1));
      const p = P(t, T, .55);
      const cx = L(960 + (i - 1) * 470, 960 + (i - 1) * 46, conv);
      const cy = L(615, 600 + (i - 1) * -16, conv);
      c.style.left = (cx - 210) + 'px'; c.style.top = (cy - 135) + 'px';
      c.style.zIndex = i === 1 ? 3 : 2;
      const pulse = 1 + .03 * bump(P(t, T + .45, .3));
      tf(c, {
        y: (1 - eo(p)) * 90,
        s: L(.5, 1, bk(p)) * L(1, .82, conv) * (1 - col) * pulse,
        r: L(0, (i - 1) * 7, conv) + col * (i - 1) * 40,
        o: cl(p * 2) * (1 - cl(col * 1.4)),
      });
    });
    // cyan dot that becomes the message
    const dIn = bk(P(t, 20.3, .35)), dO = eio(P(t, 20.95, .3));
    tf($('eDot'), { s: dIn * (1 - dO) * 1.2, o: P(t, 20.3, .05) * (1 - dO) });

    const eh = $('eHead');
    const ehOut = eio(P(t, 20.55, .35));
    eh.style.opacity = 1 - ehOut;
    words(eh, t, [18.41, 18.6, 18.8, 19.1, 19.4]);
    tf(eh, { y: -ehOut * 30, o: (t > 18.3 ? 1 : 0) * (1 - ehOut) });

    const lw = (el, T) => { const p = P(t, T, .45), e = eo(p); tf(el, { y: (1 - e) * 60, s: L(.85, 1, bk(p)), o: cl(p * 2), b: (1 - e) * 8 }); };
    lw($('eL'), 21.28); lw($('eC'), 22.03); lw($('eS'), 22.71);
    $('eUnder').style.width = (eio(P(t, 22.95, .45)) * 92) + '%';
  }

  // ---------- F: Future in Motion (23.4 - 26.25) ----------
  if (layer('F', t, 23.4, 26.25)) {
    const rp = eio(P(t, 23.5, .8));
    $('fRing').style.strokeDashoffset = 428 * (1 - rp);
    const a = (-90 + 360 * rp) * Math.PI / 180;
    const orb = $('fOrb');
    orb.style.left = (75 + 68 * Math.cos(a) - 9) + 'px'; orb.style.top = (75 + 68 * Math.sin(a) - 9) + 'px';
    orb.style.opacity = P(t, 23.5, .1) * (1 - P(t, 24.3, .25));
    orb.style.background = '#0B1B3A';
    const tp = P(t, 24.25, .45);
    tf($('fTri'), { s: L(.2, 1, bk(tp)), o: cl(tp * 2) });
    words($('F'), t, [24.98, 25.14, 25.3]);
    wIn($('fSub'), t, 25.45, .5, 30);
    const lp = eio(P(t, 25.6, .5));
    $('fLn1').style.width = $('fLn2').style.width = (90 * lp) + 'px';
  }

  // ---------- G: progression (26.15 - 33.0) ----------
  if (layer('G', t, 26.15, 33.0)) {
    words($('gHead'), t, [26.1, 26.3, 27.15]);
    $('gUnder').style.width = (eio(P(t, 27.55, .5)) * 100) + '%';
    const T = [28.51, 29.91, 31.43];
    $$('.gT').forEach((th, i) => {
      th.style.left = (960 + (i - 1) * 560 - 230) + 'px';
      const p = P(t, T[i], .55);
      tf(th, { y: (1 - eo(p)) * 70, s: L(.7, 1, bk(p)), o: cl(p * 2) });
    });
    $$('.gL').forEach((lb, i) => {
      lb.style.left = (960 + (i - 1) * 560 - 230) + 'px';
      wIn(lb, t, T[i] + .2, .5, 30);
    });
    $$('.gC').forEach((c, i) => {
      const p = eio(P(t, [29.45, 30.95][i], .45));
      c.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
    });
  }

  // ---------- H: visual style swatches (32.95 - 38.85) ----------
  if (layer('H', t, 32.95, 38.85)) {
    words($('hHead'), t, [33.25, 33.45, 33.7]);
    const T = [34.75, 36.1, 37.25];
    $$('.hS').forEach((s, i) => {
      s.style.left = (960 + (i - 1) * 430 - 170) + 'px';
      const p = P(t, T[i], .55);
      tf(s, { y: (1 - eo(p)) * 80, s: L(.4, 1, bk(p)), r: (1 - eo(p)) * -12, o: cl(p * 2) });
    });
    $$('.hL').forEach((l, i) => {
      l.style.left = (960 + (i - 1) * 430 - 200) + 'px';
      wIn(l, t, T[i] + .18, .5, 30);
    });
  }

  // ---------- K: spacing & focus (38.8 - 42.65) ----------
  if (layer('K', t, 38.8, 42.65)) {
    const h1 = $('kHead1');
    words(h1, t, [38.97, 39.55]);
    const h1o = eio(P(t, 40.2, .25));
    h1.style.opacity = 1 - h1o;
    words($('kHead2'), t, [40.4, 40.58, 40.95, 41.05, 41.15]);
    $('kHead2').style.opacity = t > 40.3 ? 1 : 0;

    const mp = P(t, 38.9, .5);
    tf($('kMock'), { s: L(.9, 1, eo(mp)), o: cl(mp * 2), y: (1 - eo(mp)) * 40 });
    const g = L(10, 72, eio(P(t, 39.5, .75)));
    const top0 = (600 - (204 + 2 * g)) / 2;
    const e1t = top0, e2t = e1t + 90 + g, e3t = e2t + 84 + g;
    $('kE1').style.top = e1t + 'px'; $('kE2').style.top = e2t + 'px'; $('kE3').style.top = e3t + 'px';
    const f = eio(P(t, 40.6, .4));
    const mo = P(t, 39.6, .3) * (1 - f);
    [['kM1', e1t + 90, g], ['kM2', e2t + 84, g]].forEach(([id, top, h]) => {
      const m = $(id);
      m.style.left = '497px'; m.style.top = (top + 8) + 'px'; m.style.height = Math.max(0, h - 16) + 'px';
      m.style.borderRadius = '3px'; m.style.opacity = mo;
    });
    $('kE1').style.opacity = 1 - .75 * f;
    $('kE3').style.opacity = 1 - .75 * f;
    const fp = P(t, 40.75, .45);
    const kf = $('kFocus');
    kf.style.top = (e2t - 30) + 'px';
    tf(kf, { s: L(1.3, 1, eo(fp)) * (1 + .02 * Math.sin((t - 41.2) * 6) * P(t, 41.2, .3)), o: cl(fp * 2) });
  }

  // ---------- I: first prompt (42.6 - 49.5) ----------
  if (layer('I', t, 42.6, 49.5)) {
    words($('iHead'), t, [42.73, 42.88, 43.02, 43.17]);
    const ep = P(t, 42.8, .6), mv = eio(P(t, 43.85, .7));
    const s = L(.95, .84, mv);
    const wn = $('iWin');
    wn.style.transformOrigin = '0 0';
    const left = L(960 - 1330 * .95 / 2, 110, mv), top = L(250, 285, mv);
    wn.style.left = left + 'px'; wn.style.top = top + 'px';
    wn.style.transform = `translateY(${(1 - eo(ep)) * 90}px) scale(${s * L(.92, 1, eo(ep))})`;
    wn.style.opacity = cl(ep * 2);

    // checklist
    const lp = P(t, 43.95, .5);
    wIn($('iListHead'), t, 43.95, .5, 0, 40);
    $('iList').style.opacity = t > 43.8 ? 1 : 0;
    const T = [44.05, 45.7, 46.35, 47.4];
    $$('.iRow').forEach((r, i) => {
      wIn(r, t, T[i], .5, 0, 50);
      const cp = eio(P(t, T[i] + .55, .35));
      const chk = r.querySelector('.iChk');
      chk.style.background = cp > 0 ? `rgba(34,211,238,${cp})` : 'transparent';
      chk.style.borderColor = cp > .5 ? '#22D3EE' : '#C9D3E0';
      chk.style.transform = `scale(${1 + .18 * bump(P(t, T[i] + .55, .35))})`;
      r.querySelector('.iTick').style.strokeDashoffset = 32 * (1 - eio(P(t, T[i] + .7, .3)));
    });

    // highlight box on the prompt image (image scale 1.6005)
    const k = 1330 / 831;
    const W = [56, 268, 714, 380], TM = [56, 268, 202, 380];
    const m2 = eio(P(t, 47.4, .5));
    const r = W.map((v, i) => L(v, TM[i], m2) * k);
    const hi = $('iHi');
    const hp = P(t, 45.7, .4);
    hi.style.left = (r[0] - 10) + 'px'; hi.style.top = (r[1] - 6) + 'px';
    hi.style.width = (r[2] - r[0] + 20) + 'px'; hi.style.height = (r[3] - r[1] + 12) + 'px';
    tf(hi, { s: L(1.08, 1, eo(hp)) * (1 + .02 * bump(P(t, 48.1, .4))), o: cl(hp * 2) * (1 - eio(P(t, 49.0, .3))) });
    // scene-order badges
    $$('.iNum').forEach((n, i) => {
      n.style.left = '6px'; n.style.top = ([285, 311, 337, 363][i] * k - 20) + 'px';
      const p = P(t, 46.35 + i * .13, .4);
      tf(n, { s: L(.2, 1, bk(p)), o: cl(p * 2) * (1 - eio(P(t, 49.0, .3))) });
    });
  }

  // ---------- J: next step (49.45 - end) ----------
  if (layer('J', t, 49.45, 60)) {
    words($('J'), t, [49.72, 49.95]);
    const bp = P(t, 50.05, .45);
    tf($('jBtn'), { s: L(.3, 1, bk(bp)), o: cl(bp * 2) });
    const x = t < 50.3 ? 0 : 16 * Math.sin((t - 50.3) * 9);
    $('jArr').style.transform = `translateX(${x}px)`;
  }

  // swap example-video frame (scene one monitor)
  if (wantImg) {
    const img = $('cImg');
    if (!img.src.endsWith(wantImg)) {
      img.src = wantImg;
      try { await img.decode(); } catch (e) {}
    }
  }
};

window.renderAt(0);
