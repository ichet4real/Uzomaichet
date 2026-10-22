import React from 'react';
import {Img} from 'remotion';
import {T} from '../timing';
import {C, FONT, ORDER, TOOLS, rgba} from '../theme';
import {calm, io, lerp, spr} from '../lib/anim';

export const INTRO_COLLAPSE = T.rank5 - 16;
const BRAND = [T.pixverse, T.pika, T.vidu, T.hailuo, T.kling];
export const INTRO_SIZE = 190;
export const DOCK_SIZE = 76;

/** Where the dock sits: under the demo stage, then centred for the #1 reveal, then away. */
export const dockCenter = (frame: number) => {
  const toCenter = spr(frame, T.myNumber, calm);
  const exit = spr(frame, T.especially, calm);
  return {x: lerp(1260, 960, toCenter), y: 942 + exit * 240, exit};
};

/** Intro card layout morphs into dock tiles (shape-match). */
export const tileGeom = (i: number, frame: number) => {
  const m = spr(frame, INTRO_COLLAPSE + i * 1.5, {damping: 24, stiffness: 120});
  const d = dockCenter(frame);
  const intro = {x: 960 + (i - 2) * 250, y: 640, s: INTRO_SIZE};
  const dock = {x: d.x + (i - 2) * 92, y: d.y, s: DOCK_SIZE};
  return {x: lerp(intro.x, dock.x, m), y: lerp(intro.y, dock.y, m), s: lerp(intro.s, dock.s, m), m};
};

const Mystery: React.FC<{s: number}> = ({s}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: s * 0.24,
      background: 'linear-gradient(160deg, #FBFAFF, #F1EEFF)',
      border: `${Math.max(1.5, s * 0.012)}px dashed ${rgba(C.violet, 0.55)}`,
      boxShadow: `0 ${s * 0.08}px ${s * 0.25}px rgba(28,32,52,0.12), 0 0 ${s * 0.3}px ${rgba(C.violet, 0.18)}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONT.display,
      fontWeight: 900,
      fontSize: s * 0.5,
      backgroundClip: 'padding-box',
      backfaceVisibility: 'hidden',
    }}
  >
    <span style={{backgroundImage: `linear-gradient(160deg, ${C.violet}, ${C.cyan})`, WebkitBackgroundClip: 'text', color: 'transparent'}}>?</span>
  </div>
);

export const Dock: React.FC<{frame: number}> = ({frame}) => {
  if (frame > T.especially + 30) return null;
  const d = dockCenter(frame);
  const barIn = spr(frame, INTRO_COLLAPSE + 6, calm);
  const fadeOut = 1 - io(frame, T.especially, T.especially + 14);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: fadeOut}}>
      {/* glass dock bar */}
      <div
        style={{
          position: 'absolute',
          left: d.x - 250,
          top: d.y - 52,
          width: 500,
          height: 104,
          borderRadius: 34,
          background: 'rgba(255,255,255,0.72)',
          border: `1px solid ${C.line}`,
          boxShadow: C.shadow,
          opacity: barIn,
          transform: `scale(${0.9 + 0.1 * barIn})`,
        }}
      />
      {ORDER.map((id, i) => {
        const g = tileGeom(i, frame);
        const pop = spr(frame, 2 + i * 3, {damping: 14, stiffness: 160});
        const on = spr(frame, BRAND[i], {damping: 13, stiffness: 180}) - (i < 4 ? spr(frame, BRAND[i + 1], calm) : spr(frame, T.especially, calm));
        const done = frame >= BRAND[i] ? 1 : 0;
        const lift = on * -18;
        const sc = 1 + on * 0.2;
        const isKling = id === 'kling';
        const flip = isKling ? spr(frame, T.kling, {damping: 16, stiffness: 140}) : 1;
        const accent = TOOLS[id].accent[0];
        // ripple on click
        const rp = frame >= BRAND[i] && frame < BRAND[i] + 18 ? (frame - BRAND[i]) / 18 : -1;
        return (
          <div
            key={id}
            style={{
              position: 'absolute',
              left: g.x - g.s / 2,
              top: g.y - g.s / 2 + lift,
              width: g.s,
              height: g.s,
              transform: `scale(${pop * sc})`,
              opacity: Math.min(1, pop * 1.5),
              perspective: 800,
            }}
          >
            {on > 0.02 ? (
              <div style={{position: 'absolute', inset: -g.s * 0.6, borderRadius: '50%', background: `radial-gradient(circle, ${rgba(accent, 0.45 * on)} 0%, transparent 65%)`}} />
            ) : null}
            {rp >= 0 ? (
              <div
                style={{
                  position: 'absolute',
                  inset: -g.s * 0.5 * rp,
                  borderRadius: g.s * 0.3 + g.s * 0.5 * rp,
                  border: `2px solid ${rgba(accent, 0.8 * (1 - rp))}`,
                }}
              />
            ) : null}
            <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${(1 - flip) * 180}deg)`}}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: g.s * 0.24,
                  background: '#FFFFFF',
                  border: '1px solid rgba(14,16,20,0.06)',
                  boxShadow: `0 ${g.s * 0.08}px ${g.s * 0.24}px rgba(28,32,52,${0.12 + 0.1 * on}), 0 2px 6px rgba(28,32,52,0.06)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backfaceVisibility: 'hidden',
                }}
              >
                <Img src={TOOLS[id].logo} style={{width: g.s * 0.68, height: g.s * 0.68, objectFit: 'contain'}} />
              </div>
              {isKling ? (
                <div style={{position: 'absolute', inset: 0, transform: 'rotateY(180deg)', backfaceVisibility: 'hidden'}}>
                  <Mystery s={g.s} />
                </div>
              ) : null}
            </div>
            {/* ranked indicator dot */}
            <div
              style={{
                position: 'absolute',
                left: g.s / 2 - 4,
                top: g.s + 10 - lift * 0.4,
                width: 8,
                height: 8,
                borderRadius: 4,
                background: accent,
                opacity: done * g.m * (1 - on * 0.5),
                boxShadow: `0 0 10px ${accent}`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

/** Pointer that "selects" each tool in the dock exactly on the spoken brand name. */
export const Cursor: React.FC<{frame: number}> = ({frame}) => {
  if (frame < T.rank5 - 4 || frame > T.kling + 40) return null;
  const target = (i: number) => {
    const g = tileGeom(i, frame);
    return {x: g.x + 10, y: g.y + 8};
  };
  let pos = {x: 1640, y: 1010};
  for (let i = 0; i < BRAND.length; i++) {
    const t = io(frame, BRAND[i] - 16, BRAND[i] - 2, 0, 1);
    const p = target(i);
    pos = {x: lerp(pos.x, p.x, t), y: lerp(pos.y, p.y, t)};
  }
  const appear = io(frame, T.rank5 - 4, T.rank5 + 8);
  const gone = io(frame, T.kling + 18, T.kling + 34);
  const press = BRAND.reduce((acc, b) => acc + (frame >= b - 2 && frame <= b + 4 ? Math.sin(((frame - b + 2) / 6) * Math.PI) : 0), 0);
  return (
    <svg
      width={46}
      height={46}
      viewBox="0 0 24 24"
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        opacity: appear * (1 - gone),
        transform: `scale(${1 - press * 0.18})`,
        transformOrigin: '0 0',
        filter: 'drop-shadow(0 4px 8px rgba(28,32,52,0.35))',
      }}
    >
      <path d="M3 2 L3 19 L7.6 14.8 L10.6 21.4 L13.6 20.1 L10.7 13.6 L17 13.4 Z" fill="#0E1014" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
};
