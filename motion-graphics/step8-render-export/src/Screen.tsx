import React from 'react';
import {OffthreadVideo, Sequence, interpolate, staticFile} from 'remotion';
import {C, FONT, FPS, ease, easeOut, pop, prog, win} from './lib';

export type Clip = {a: number; b: number; src: number; rate: number};
export type Cam = {t: number; x: number; y: number; z: number};
export type Ring = {a: number; b: number; x: number; y: number; w: number; h: number; circle?: boolean; color?: string; label?: string; labelSide?: 'top' | 'bottom' | 'right' | 'left'};
export type Click = {t: number; x: number; y: number};
export type Headline = {a: number; b: number; text: React.ReactNode; tag: string; color?: string};

export type ScreenCfg = {
  a: number; b: number; clips: Clip[]; cams: Cam[]; rings: Ring[]; clicks: Click[]; headlines: Headline[];
  extra?: (t: number) => React.ReactNode;
};

const PS = 0.76;
const PW = 1920 * PS;
const PH = 1080 * PS;
const PL = (1920 - PW) / 2;
const PT = 220;
const XF = 0.15; // crossfade between clips (s)

const camAt = (cams: Cam[], t: number): Cam => {
  if (t <= cams[0].t) return cams[0];
  for (let i = 0; i < cams.length - 1; i++) {
    const c0 = cams[i];
    const c1 = cams[i + 1];
    if (t >= c0.t && t <= c1.t) {
      const p = interpolate(t, [c0.t, c1.t], [0, 1], {easing: ease});
      // interpolate zoom in log space for smooth feel
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
  const pulse = 1 + Math.sin((t - r.a) * 7) * 0.04;
  const color = r.color ?? C.orange;
  const pad = 10;
  const sw = 5 / z;
  const w = r.w + pad * 2;
  const h = r.h + pad * 2;
  const per = r.circle ? Math.PI * w : 2 * (w + h);
  const side = r.labelSide ?? 'top';
  const lp = pop(t, r.a + 0.25, 12);
  const labelPos: React.CSSProperties =
    side === 'top' ? {left: '50%', bottom: h + 14 / z, transform: `translateX(-50%) scale(${lp / z})`, transformOrigin: 'bottom center'}
      : side === 'bottom' ? {left: '50%', top: h + 14 / z, transform: `translateX(-50%) scale(${lp / z})`, transformOrigin: 'top center'}
        : side === 'right' ? {left: w + 14 / z, top: '50%', transform: `translateY(-50%) scale(${lp / z})`, transformOrigin: 'left center'}
          : {right: w + 14 / z, top: '50%', transform: `translateY(-50%) scale(${lp / z})`, transformOrigin: 'right center'};
  return (
    <div style={{position: 'absolute', left: r.x - pad, top: r.y - pad, width: w, height: h, opacity: vis,
      transform: `scale(${pulse})`}}>
      <svg width={w} height={h} style={{position: 'absolute', overflow: 'visible'}}>
        {r.circle ? (
          <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill={`${color}18`} stroke={color} strokeWidth={sw}
            strokeDasharray={per} strokeDashoffset={per * (1 - draw)} style={{filter: `drop-shadow(0 0 ${8 / z}px ${color})`}} />
        ) : (
          <rect x={0} y={0} width={w} height={h} rx={12 / Math.sqrt(z)} fill={`${color}14`} stroke={color} strokeWidth={sw}
            strokeDasharray={per} strokeDashoffset={per * (1 - draw)} style={{filter: `drop-shadow(0 0 ${8 / z}px ${color})`}} />
        )}
      </svg>
      {r.label ? (
        <div style={{position: 'absolute', ...labelPos, whiteSpace: 'nowrap', padding: '10px 22px', borderRadius: 14,
          background: color, color: '#0B0F1E', fontFamily: FONT, fontWeight: 900, fontSize: 46, opacity: lp,
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)'}}>{r.label}</div>
      ) : null}
    </div>
  );
};

const ClickView: React.FC<{c: Click; t: number; z: number}> = ({c, t, z}) => {
  const p = prog(t, c.t, c.t + 0.55, easeOut);
  if (t < c.t || p >= 1) return null;
  return (
    <>
      {[0, 0.12].map((d) => {
        const q = prog(t, c.t + d, c.t + d + 0.5, easeOut);
        return (
          <div key={d} style={{position: 'absolute', left: c.x, top: c.y, width: 0, height: 0}}>
            <div style={{position: 'absolute', left: -60 * q / z * 1.4, top: -60 * q / z * 1.4,
              width: 120 * q / z * 1.4, height: 120 * q / z * 1.4, borderRadius: '50%',
              border: `${4 / z}px solid ${C.white}`, opacity: 1 - q, boxShadow: `0 0 20px ${C.cyan}`}} />
          </div>
        );
      })}
    </>
  );
};

const HeadlineView: React.FC<{h: Headline; t: number}> = ({h, t}) => {
  const vis = win(t, h.a, h.b, 0.2);
  if (vis <= 0) return null;
  const p = pop(t, h.a, 13);
  const color = h.color ?? C.orange;
  return (
    <div style={{position: 'absolute', top: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center',
      opacity: vis, fontFamily: FONT}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, transform: `translateY(${(1 - p) * 40}px)`}}>
        <div style={{padding: '8px 18px', borderRadius: 12, background: color, color: '#0B0F1E', fontWeight: 900,
          fontSize: 26, letterSpacing: 2, transform: `scale(${p})`}}>{h.tag}</div>
        <div style={{fontSize: 56, fontWeight: 800, color: C.white, letterSpacing: -1}}>{h.text}</div>
      </div>
    </div>
  );
};

export const ScreenBlock: React.FC<{cfg: ScreenCfg; t: number}> = ({cfg, t}) => {
  const enter = prog(t, cfg.a, cfg.a + 0.55, easeOut);
  const exit = prog(t, cfg.b - 0.35, cfg.b, ease);
  const cam = clampCam(camAt(cfg.cams, t));
  return (
    <div style={{position: 'absolute', inset: 0, opacity: Math.min(enter * 1.5, 1) * (1 - exit), perspective: 1600}}>
      {cfg.headlines.map((h, i) => <HeadlineView key={i} h={h} t={t} />)}
      <div style={{
        position: 'absolute', left: PL, top: PT, width: PW, height: PH, borderRadius: 22, overflow: 'hidden',
        border: `2px solid ${C.stroke}`,
        boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 80px ${C.orange}22`,
        transform: `translateY(${(1 - enter) * 140 + exit * -40}px) rotateX(${(1 - enter) * 22}deg) scale(${0.9 + 0.1 * enter - exit * 0.05})`,
        background: '#fff',
      }}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transformOrigin: '0 0',
          transform: `scale(${PS})`}}>
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
        {/* subtle vignette inside panel */}
        <div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 80px rgba(0,0,0,0.25)'}} />
      </div>
      {cfg.extra ? cfg.extra(t) : null}
    </div>
  );
};

export const PANEL = {PS, PW, PH, PL, PT};
