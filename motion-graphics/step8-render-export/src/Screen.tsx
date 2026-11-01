import React from 'react';
import {OffthreadVideo, Sequence, interpolate, staticFile} from 'remotion';
import {C, FONT, FPS, SHADOW, ease, easeOut, pop, prog, win} from './lib';

export type Clip = {a: number; b: number; src: number; rate: number};
export type Cam = {t: number; x: number; y: number; z: number};
export type Ring = {a: number; b: number; x: number; y: number; w: number; h: number; circle?: boolean; color?: string; label?: string; labelSide?: 'top' | 'bottom' | 'right' | 'left'};
export type Click = {t: number; x: number; y: number};
export type Headline = {a: number; b: number; text: React.ReactNode; tag: string; color?: string};

export type ScreenCfg = {
  a: number; b: number; clips: Clip[]; cams: Cam[]; rings: Ring[]; clicks: Click[]; headlines: Headline[];
  extra?: (t: number) => React.ReactNode;
};

const PS = 0.74;
const PW = 1920 * PS;
const PH = 1080 * PS;
const PL = (1920 - PW) / 2;
const PT = 225;
const BEZEL = 12;
const XF = 0.15;

/** highlighter span for headlines */
export const Hl: React.FC<{c: [string, string]; children: React.ReactNode}> = ({c, children}) => (
  <span style={{position: 'relative', display: 'inline-block'}}>
    <span style={{position: 'absolute', left: -6, right: -6, top: '20%', bottom: '2%', borderRadius: 8,
      background: `linear-gradient(90deg, ${c[0]}, ${c[1]})`}} />
    <span style={{position: 'relative'}}>{children}</span>
  </span>
);

const camAt = (cams: Cam[], t: number): Cam => {
  if (t <= cams[0].t) return cams[0];
  for (let i = 0; i < cams.length - 1; i++) {
    const c0 = cams[i];
    const c1 = cams[i + 1];
    if (t >= c0.t && t <= c1.t) {
      const p = interpolate(t, [c0.t, c1.t], [0, 1], {easing: ease});
      const z = Math.exp(Math.log(c0.z) + (Math.log(c1.z) - Math.log(c0.z)) * p);
      return {t, x: c0.x + (c1.x - c0.x) * p, y: c0.y + (c1.y - c0.y) * p, z};
    }
  }
  return cams[cams.length - 1];
};

const clampCam = (c: Cam) => {
  const hw = 960 / c.z;
  const hh = 540 / c.z;
  return {...c, x: Math.min(1920 - hw, Math.max(hw, c.x)), y: Math.min(1080 - hh, Math.max(hh, c.y))};
};

const RingView: React.FC<{r: Ring; t: number; z: number}> = ({r, t, z}) => {
  const vis = win(t, r.a, r.b, 0.2);
  if (vis <= 0) return null;
  const draw = prog(t, r.a, r.a + 0.45);
  const color = r.color ?? C.pinkDeep;
  const pad = 10;
  const sw = 5 / z;
  const w = r.w + pad * 2;
  const h = r.h + pad * 2;
  const per = r.circle ? Math.PI * w : 2 * (w + h);
  const side = r.labelSide ?? 'top';
  const lp = pop(t, r.a + 0.25, 13);
  const k = (lp * 0.95 + 0.05) / z;
  const labelPos: React.CSSProperties =
    side === 'top' ? {left: '50%', bottom: h + 16 / z, transform: `translateX(-50%) scale(${k})`, transformOrigin: 'bottom center'}
      : side === 'bottom' ? {left: '50%', top: h + 16 / z, transform: `translateX(-50%) scale(${k})`, transformOrigin: 'top center'}
        : side === 'right' ? {left: w + 16 / z, top: '50%', transform: `translateY(-50%) scale(${k})`, transformOrigin: 'left center'}
          : {right: w + 16 / z, top: '50%', transform: `translateY(-50%) scale(${k})`, transformOrigin: 'right center'};
  return (
    <div style={{position: 'absolute', left: r.x - pad, top: r.y - pad, width: w, height: h, opacity: vis}}>
      <svg width={w} height={h} style={{position: 'absolute', overflow: 'visible'}}>
        {r.circle ? (
          <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill={`${color}14`} stroke={color} strokeWidth={sw}
            strokeDasharray={per} strokeDashoffset={per * (1 - draw)} />
        ) : (
          <rect x={0} y={0} width={w} height={h} rx={12 / Math.sqrt(z)} fill={`${color}10`} stroke={color} strokeWidth={sw}
            strokeDasharray={per} strokeDashoffset={per * (1 - draw)} />
        )}
      </svg>
      {r.label ? (
        <div style={{position: 'absolute', ...labelPos, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 14,
          padding: '12px 26px 12px 18px', borderRadius: 999, background: C.ink, color: '#fff', fontFamily: FONT,
          fontWeight: 700, fontSize: 50, opacity: lp, boxShadow: SHADOW}}>
          <div style={{width: 18, height: 18, borderRadius: 9, background: color}} />
          {r.label}
        </div>
      ) : null}
    </div>
  );
};

const ClickView: React.FC<{c: Click; t: number; z: number}> = ({c, t, z}) => {
  if (t < c.t || t > c.t + 0.7) return null;
  return (
    <>
      {[0, 0.12].map((d) => {
        const q = prog(t, c.t + d, c.t + d + 0.5, easeOut);
        const s = (170 * q) / z;
        return (
          <div key={d} style={{position: 'absolute', left: c.x - s / 2, top: c.y - s / 2, width: s, height: s, borderRadius: '50%',
            border: `${5 / z}px solid ${C.blue}`, background: `${C.blue}18`, opacity: 1 - q}} />
        );
      })}
    </>
  );
};

const HeadlineView: React.FC<{h: Headline; t: number}> = ({h, t}) => {
  const vis = win(t, h.a, h.b, 0.2);
  if (vis <= 0) return null;
  const p = prog(t, h.a, h.a + 0.45);
  const tp = pop(t, h.a, 14);
  return (
    <div style={{position: 'absolute', top: 72, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: vis, fontFamily: FONT}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px 10px 14px', borderRadius: 999,
          background: C.ink, color: '#fff', fontWeight: 700, fontSize: 24, letterSpacing: 1, transform: `scale(${tp})`}}>
          <div style={{width: 14, height: 14, borderRadius: 7, background: h.color ?? C.pink}} />
          {h.tag}
        </div>
        <div style={{fontSize: 62, fontWeight: 800, color: C.ink, letterSpacing: -2, opacity: p,
          filter: `blur(${(1 - p) * 14}px)`, transform: `translateY(${(1 - p) * 14}px)`}}>{h.text}</div>
      </div>
    </div>
  );
};

export const ScreenBlock: React.FC<{cfg: ScreenCfg; t: number}> = ({cfg, t}) => {
  const enter = prog(t, cfg.a, cfg.a + 0.55, easeOut);
  const exit = prog(t, cfg.b - 0.35, cfg.b, ease);
  const cam = clampCam(camAt(cfg.cams, t));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: Math.min(enter * 1.5, 1) * (1 - exit), filter: `blur(${exit * 14}px)`}}>
      {cfg.headlines.map((h, i) => <HeadlineView key={i} h={h} t={t} />)}
      <div style={{
        position: 'absolute', left: PL - BEZEL, top: PT - BEZEL, width: PW + BEZEL * 2, height: PH + BEZEL * 2, borderRadius: 30,
        background: '#fff', boxShadow: SHADOW, border: `1px solid ${C.line}`,
        transform: `translateY(${(1 - enter) * 100}px) scale(${0.94 + 0.06 * enter - exit * 0.04})`,
      }}>
        <div style={{position: 'absolute', left: BEZEL, top: BEZEL, width: PW, height: PH, borderRadius: 20, overflow: 'hidden', background: '#fff'}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0', transform: `scale(${PS})`}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0',
              transform: `translate(960px, 540px) scale(${cam.z}) translate(${-cam.x}px, ${-cam.y}px)`}}>
              {cfg.clips.map((c, i) => {
                const last = i === cfg.clips.length - 1;
                const from = Math.round(c.a * FPS);
                const dur = Math.round((c.b - c.a + (last ? 0 : XF)) * FPS);
                const fadeIn = i === 0 ? 1 : prog(t, c.a, c.a + XF, (x) => x);
                return (
                  <Sequence key={i} from={from} durationInFrames={dur} layout="none">
                    <div style={{position: 'absolute', inset: 0, opacity: fadeIn}}>
                      <OffthreadVideo src={staticFile('screen.mp4')} startFrom={Math.round(c.src * FPS)}
                        playbackRate={c.rate} muted style={{width: 1920, height: 1080}} />
                    </div>
                  </Sequence>
                );
              })}
              {cfg.rings.map((r, i) => <RingView key={i} r={r} t={t} z={cam.z} />)}
              {cfg.clicks.map((c, i) => <ClickView key={i} c={c} t={t} z={cam.z} />)}
            </div>
          </div>
        </div>
      </div>
      {cfg.extra ? cfg.extra(t) : null}
    </div>
  );
};

export const PANEL = {PS, PW, PH, PL, PT};
