import React from 'react';
import {T} from '../timing';
import {C, FONT, rgba} from '../theme';
import {io, spr} from '../lib/anim';
import {INTRO_COLLAPSE} from '../components/Dock';

/** 0 → ~2.2 s: title + five cards (winner concealed) + countdown bar. Cards themselves live in <Dock/>. */
export const Intro: React.FC<{frame: number}> = ({frame}) => {
  if (frame > T.rank5 + 6) return null;
  const a = spr(frame, 0, {damping: 18, stiffness: 200});
  const b = spr(frame, 4, {damping: 18, stiffness: 180});
  const out = io(frame, INTRO_COLLAPSE - 2, INTRO_COLLAPSE + 12);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - out, transform: `translateY(${-out * 60}px)`}}>
      <div
        style={{
          position: 'absolute',
          top: 150,
          width: '100%',
          textAlign: 'center',
          fontFamily: FONT.display,
          fontWeight: 900,
          fontSize: 132,
          letterSpacing: '-0.035em',
          color: C.white,
          opacity: 0.35 + 0.65 * a,
          transform: `translateY(${(1 - a) * 30}px) scale(${0.94 + 0.06 * a})`,
          textShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        <span style={{backgroundImage: `linear-gradient(160deg, #FFFFFF 30%, ${C.cyan} 70%, ${C.violet})`, WebkitBackgroundClip: 'text', color: 'transparent'}}>5</span> AI VIDEO TOOLS
      </div>
      <div
        style={{
          position: 'absolute',
          top: 318,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 26,
          opacity: b,
          transform: `translateY(${(1 - b) * 20}px)`,
        }}
      >
        <div style={{width: 70, height: 2, background: `linear-gradient(90deg, transparent, ${C.cyan})`}} />
        <div style={{fontFamily: FONT.label, fontWeight: 800, fontSize: 44, letterSpacing: '0.38em', color: C.cyan, paddingLeft: '0.38em'}}>MY RANKING</div>
        <div style={{width: 70, height: 2, background: `linear-gradient(90deg, ${C.cyan}, transparent)`}} />
      </div>
      {/* countdown motif: five segments that tick from 5 down to 1, last one left dark (winner concealed) */}
      <div style={{position: 'absolute', top: 410, width: '100%', display: 'flex', justifyContent: 'center', gap: 12}}>
        {[0, 1, 2, 3, 4].map((i) => {
          const lit = io(frame, 8 + i * 6, 14 + i * 6);
          const last = i === 4;
          return (
            <div
              key={i}
              style={{
                width: 64,
                height: 8,
                borderRadius: 4,
                background: last ? 'rgba(255,255,255,0.08)' : rgba(C.cyan, 0.15 + 0.85 * lit),
                border: last ? `1px dashed ${rgba(C.cyan, 0.6)}` : 'none',
                boxShadow: last ? 'none' : `0 0 ${12 * lit}px ${rgba(C.cyan, 0.7)}`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
