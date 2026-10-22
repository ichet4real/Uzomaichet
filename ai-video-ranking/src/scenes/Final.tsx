import React from 'react';
import {T} from '../timing';
import {C, FONT, TOOLS, ToolId, rgba} from '../theme';
import {io, lerp, spr} from '../lib/anim';
import {LogoCard} from '../components/LogoCard';
import {DimText} from '../components/DimText';

const BOARD: ToolId[] = ['kling', 'hailuo', 'vidu', 'pika', 'pixverse'];
const HEIGHTS = [380, 315, 260, 215, 175];
const COLW = 300;
const GAP = 28;
const X0 = (1920 - (COLW * 5 + GAP * 4)) / 2;
const BASE = 985;

/** Final leaderboard: horizontal podium staircase, Kling emphasised + engagement question. */
export const Final: React.FC<{frame: number}> = ({frame}) => {
  const start = T.finalBoard + 8;
  if (frame < start) return null;
  const pull = io(frame, start, start + 50);
  const q = spr(frame, start + 14, {damping: 18, stiffness: 150});
  return (
    <div style={{position: 'absolute', inset: 0, transform: `scale(${lerp(1.06, 1, pull)})`}}>
      <div
        style={{
          position: 'absolute',
          top: 96,
          width: '100%',
          textAlign: 'center',
          fontFamily: FONT.display,
          fontWeight: 900,
          fontSize: 88,
          letterSpacing: '-0.02em',
          color: C.white,
          opacity: q,
          transform: `translateY(${(1 - q) * 30}px)`,
        }}
      >
        WHICH WOULD YOU{' '}
        <span style={{backgroundImage: `linear-gradient(120deg, ${C.cyan}, ${C.violet})`, WebkitBackgroundClip: 'text', color: 'transparent'}}>CHOOSE?</span>
      </div>
      {BOARD.map((id, i) => {
        const t = TOOLS[id];
        const k = spr(frame, start + 2 + i * 3, {damping: 17, stiffness: 140});
        const top = id === 'kling';
        const hgt = HEIGHTS[i] * k;
        const x = X0 + i * (COLW + GAP);
        const card = top ? 176 : 140;
        return (
          <div key={id} style={{position: 'absolute', left: x, top: 0, width: COLW, height: 1080, opacity: Math.min(1, k * 1.5)}}>
            {/* bar */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                width: COLW,
                top: BASE - hgt,
                height: hgt,
                borderRadius: '28px 28px 10px 10px',
                background: top
                  ? `linear-gradient(180deg, ${rgba(t.accent[0], 0.35)}, ${rgba(t.accent[1], 0.08)})`
                  : 'linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))',
                border: `1.5px solid ${top ? rgba(t.accent[0], 0.85) : 'rgba(255,255,255,0.14)'}`,
                boxShadow: top ? `0 0 70px ${rgba(t.accent[0], 0.35)}, inset 0 1px 0 rgba(255,255,255,0.2)` : 'inset 0 1px 0 rgba(255,255,255,0.08)',
                display: 'flex',
                justifyContent: 'center',
                paddingTop: 18,
                overflow: 'hidden',
              }}
            >
              <DimText text={`#${t.rank}`} size={top ? 104 : 80} colors={t.accent} depth={top ? 8 : 5} />
            </div>
            {/* name + logo above the bar */}
            <div style={{position: 'absolute', left: 0, width: COLW, top: BASE - hgt - 72, textAlign: 'center', fontFamily: FONT.display, fontWeight: 800, fontSize: top ? 58 : 48, color: C.white, letterSpacing: '-0.02em'}}>
              {t.name}
            </div>
            <div style={{position: 'absolute', left: COLW / 2 - card / 2, top: BASE - hgt - 92 - card}}>
              <LogoCard tool={id} size={card} glow={top ? 0.9 : 0.35} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

