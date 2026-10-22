import React from 'react';
import {T} from '../timing';
import {C, FONT, TOOLS, rgba} from '../theme';
import {bell, calm, io, lerp, spr} from '../lib/anim';
import {Img} from 'remotion';
import {DimText} from '../components/DimText';
import {LogoCard} from '../components/LogoCard';
import {Pill} from '../components/BenefitLabel';
import {tileGeom} from '../components/Dock';

const K = TOOLS.kling.accent; // cyan → lime
const P = (a: {x: number; y: number}, b: {x: number; y: number}, t: number) => ({x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t)});

/** #1 reveal (hero) → compact header while the two advantage panels play. */
export const KlingSection: React.FC<{frame: number}> = ({frame}) => {
  if (frame < T.myNumber || frame > T.useCases + 20) return null;
  const a = spr(frame, T.rank1, {damping: 13, stiffness: 140});
  const sweep = io(frame, T.rank1 + 4, T.rank1 + 30, 0, 1, (x) => x);
  const hero = spr(frame, T.kling + 2, {damping: 18, stiffness: 120});
  const head = spr(frame, T.especially, {damping: 22, stiffness: 110});
  const leave = io(frame, T.useCases, T.useCases + 14);

  // "#1" position / size: big centre → upper hero → header
  const numPos = P(P({x: 960, y: 470}, {x: 960, y: 330}, hero), {x: 600, y: 170}, head);
  const numSize = lerp(lerp(400, 290, hero), 116, head);

  // logo card: flies from its dock tile → hero → header
  const tile = tileGeom(4, Math.min(frame, T.kling + 2));
  const cardPos = P(P({x: tile.x, y: tile.y}, {x: 790, y: 700}, hero), {x: 770, y: 170}, head);
  const cardSize = lerp(lerp(tile.s, 210, hero), 112, head);

  const nameIn = spr(frame, T.kling + 2, {damping: 18, stiffness: 150});
  const namePos = P({x: 930, y: 655}, {x: 860, y: 170}, head);
  const nameSize = lerp(112, 80, head);
  const pillIn = io(frame, T.kling + 10, T.kling + 24);
  const pillPos = P({x: 934, y: 770}, {x: 1130, y: 170}, head);
  const ring = io(frame, T.rank1, T.rank1 + 34, 0, 1, (x) => x);
  const antic = io(frame, T.myNumber + 2, T.rank1 + 4);

  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - leave, transform: `translateY(${-leave * 40}px)`}}>
      {/* soft halo ring on the #1 reveal */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 100 - ring * 520,
          top: 470 - 100 - ring * 520,
          width: 200 + ring * 1040,
          height: 200 + ring * 1040,
          borderRadius: '50%',
          border: `2px solid ${rgba(K[0], 0.55 * (1 - ring))}`,
          boxShadow: `0 0 40px ${rgba(K[0], 0.25 * (1 - ring))}`,
          opacity: frame < T.rank1 ? 0 : 1,
        }}
      />
      <div style={{position: 'absolute', left: 960 - 520, top: 470 - 420, width: 1040, height: 840, borderRadius: '50%', transform: `scale(${0.6 + 0.4 * antic})`, background: `radial-gradient(circle, ${rgba(K[0], (0.1 * antic + 0.1 * a) * (1 - head))} 0%, ${rgba(K[1], (0.04 * antic + 0.05 * a) * (1 - head))} 40%, transparent 70%)`}} />

      <div style={{position: 'absolute', left: numPos.x, top: numPos.y, transform: `translate(-50%, -52%) scale(${0.7 + 0.3 * a})`, opacity: Math.min(1, a * 1.6)}}>
        <DimText text="#1" size={numSize} colors={[K[0], K[1]]} depth={Math.round(lerp(18, 8, head))} sweep={sweep} />
      </div>

      {frame >= T.kling ? (
        <>
          <div style={{position: 'absolute', left: cardPos.x - cardSize / 2, top: cardPos.y - cardSize / 2}}>
            <LogoCard tool="kling" size={cardSize} glow={0.8} />
          </div>
          <div style={{position: 'absolute', left: namePos.x, top: namePos.y - nameSize * 0.6, height: nameSize * 1.2, overflow: 'hidden'}}>
            <div
              style={{
                fontFamily: FONT.display,
                fontWeight: 800,
                fontSize: nameSize,
                lineHeight: `${nameSize * 1.2}px`,
                letterSpacing: '-0.03em',
                color: C.ink,
                transform: `translateY(${(1 - nameIn) * 100}%)`,
              }}
            >
              Kling
            </div>
          </div>
          <div style={{position: 'absolute', left: pillPos.x, top: pillPos.y, transform: 'translateY(-50%)'}}>
            <Pill text="MY #1 PICK" p={pillIn} accent={K[0]} size={lerp(32, 28, head)} />
          </div>
        </>
      ) : null}

      <Advantages frame={frame} />
    </div>
  );
};

/** REALISM + BUDGET panels joined to a Kling node. */
const Advantages: React.FC<{frame: number}> = ({frame}) => {
  if (frame < T.especially) return null;
  const ghost = spr(frame, T.especially + 6, calm);
  const r = spr(frame, T.realisticVideo, {damping: 18, stiffness: 140});
  const b = spr(frame, T.budgetLow, {damping: 18, stiffness: 140});
  const join = io(frame, T.budgetLow + 4, T.budgetLow + 22);
  const top = 290;
  const ph = 540;
  return (
    <>
      {/* shared frame that joins both panels */}
      <div
        style={{
          position: 'absolute',
          left: 100,
          top: top - 20,
          width: 1720,
          height: ph + 40,
          borderRadius: 44,
          border: `1.5px solid ${rgba(K[0], 0.45 * join)}`,
          background: `linear-gradient(90deg, ${rgba(K[0], 0.06 * join)}, ${rgba(K[1], 0.06 * join)})`,
          boxShadow: `0 0 60px ${rgba(K[0], 0.12 * join)}`,
        }}
      />
      <Panel x={130} y={top} w={760} h={ph} ghost={ghost} p={r} label="REALISM" accent={K[0]}>
        <RealismVisual frame={frame} p={r} />
      </Panel>
      <Panel x={1030} y={top} w={760} h={ph} ghost={ghost} p={b} label="BUDGET" accent={K[1]}>
        <BudgetVisual frame={frame} p={b} />
      </Panel>
      {/* connector + node */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <line x1={890} y1={top + ph / 2} x2={890 + 70 * Math.min(1, r * 1.3)} y2={top + ph / 2} stroke={K[0]} strokeWidth={3} opacity={r} />
        <line x1={1030} y1={top + ph / 2} x2={1030 - 70 * Math.min(1, b * 1.3)} y2={top + ph / 2} stroke={K[1]} strokeWidth={3} opacity={b} />
        <line x1={960} y1={228} x2={960} y2={228 + (top + ph / 2 - 50 - 228) * ghost} stroke="rgba(14,16,20,0.2)" strokeWidth={2} strokeDasharray="6 8" />
      </svg>
      <div style={{position: 'absolute', left: 960 - 46, top: top + ph / 2 - 46, transform: `scale(${ghost})`}}>
        <div style={{width: 92, height: 92, borderRadius: 46, background: '#FFFFFF', boxShadow: `0 0 0 ${4 + 6 * join}px ${rgba(K[0], 0.2)}, 0 20px 40px rgba(28,32,52,0.18)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <Img src={TOOLS.kling.logo} style={{width: 60, height: 60, objectFit: 'contain'}} />
        </div>
      </div>
    </>
  );
};

const Panel: React.FC<{x: number; y: number; w: number; h: number; ghost: number; p: number; label: string; accent: string; children: React.ReactNode}> = ({x, y, w, h, ghost, p, label, accent, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity: ghost, transform: `translateY(${(1 - ghost) * 30}px)`}}>
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: 32,
        overflow: 'hidden',
        background: p > 0.05 ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
        border: `1px ${p > 0.05 ? 'solid' : 'dashed'} ${p > 0.05 ? 'rgba(14,16,20,0.06)' : 'rgba(14,16,20,0.18)'}`,
        boxShadow: `${C.shadow}, 0 0 ${60 * p}px ${rgba(accent, 0.22)}`,
      }}
    >
      {p > 0 ? children : null}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 140, background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.97) 70%)'}} />
      <div style={{position: 'absolute', left: 44, bottom: 40, display: 'flex', alignItems: 'center', gap: 18, opacity: p, transform: `translateY(${(1 - p) * 20}px)`}}>
        <div style={{width: 8, height: 46, borderRadius: 4, background: accent, boxShadow: `0 0 16px ${accent}`}} />
        <div style={{fontFamily: FONT.label, fontWeight: 800, fontSize: 54, letterSpacing: '0.14em', color: C.ink}}>{label}</div>
      </div>
    </div>
  </div>
);

/** Iris opens on a layered landscape with a focus pull + one light sweep. */
const RealismVisual: React.FC<{frame: number; p: number}> = ({frame, p}) => {
  const open = io(frame, T.realisticVideo, T.realisticVideo + 18);
  const focus = io(frame, T.realisticVideo + 4, T.realisticVideo + 26);
  const sw = bell(frame, T.realisticVideo + 10, T.realisticVideo + 40);
  const swx = io(frame, T.realisticVideo + 10, T.realisticVideo + 40, -40, 140, (x) => x);
  const drift = (frame - T.realisticVideo) * 0.25;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={760} height={540} viewBox="0 0 760 540" style={{position: 'absolute', inset: 0, filter: `blur(${(1 - focus) * 8}px)`, transform: `scale(${1.12 - 0.08 * p})`}}>
        <defs>
          <linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0B2540" />
            <stop offset="0.55" stopColor="#2F7FA8" />
            <stop offset="1" stopColor="#F2C48D" />
          </linearGradient>
          <linearGradient id="rlake" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F2C48D" stopOpacity="0.9" />
            <stop offset="0.12" stopColor="#3B8DB5" />
            <stop offset="1" stopColor="#06182A" />
          </linearGradient>
        </defs>
        <rect width={760} height={540} fill="url(#rsky)" />
        <circle cx={480} cy={300} r={40} fill="#FFE7BF" />
        <path d={`M${-40 - drift} 330 L 120 190 L 220 270 L 340 150 L 470 290 L 580 210 L ${800 - drift} 330 Z`} fill="#24445E" />
        <path d={`M${-40 - drift * 1.6} 340 L 90 260 L 200 320 L 330 240 L 450 330 L 600 270 L ${820 - drift * 1.6} 340 Z`} fill="#16314A" />
        <rect y={330} width={760} height={210} fill="url(#rlake)" />
        <path d="M0 330 H760" stroke="#FFE7BF" strokeOpacity={0.5} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={430 + Math.sin((frame + i * 9) / 10) * 10} y={350 + i * 16} width={100 - i * 14} height={2.5} fill="#FFE7BF" opacity={0.5 - i * 0.08} />
        ))}
        <path d="M0 540 L 0 450 C 120 430 200 470 300 460 L 260 540 Z" fill="#081521" />
      </svg>
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(110deg, transparent ${swx - 12}%, rgba(255,255,255,${0.35 * sw}) ${swx}%, transparent ${swx + 12}%)`}} />
      {/* aperture iris */}
      <svg width={760} height={540} viewBox="-380 -270 760 540" style={{position: 'absolute', inset: 0, opacity: 1 - open}}>
        {Array.from({length: 6}, (_, i) => (
          <g key={i} transform={`rotate(${i * 60 + open * 40})`}>
            <path d={`M ${30 + open * 500} -600 L 900 -600 L 900 600 L ${-60 + open * 520} 600 Z`} fill="#F3F4F7" stroke="#DADEE6" strokeWidth={2} />
          </g>
        ))}
      </svg>
    </div>
  );
};

/** Restrained wallet + coin motif (no currency, no numbers). */
const BudgetVisual: React.FC<{frame: number; p: number}> = ({frame, p}) => {
  const drop = io(frame, T.budgetLow + 2, T.budgetLow + 16, 0, 1, (x) => x * x);
  const land = spr(frame, T.budgetLow + 16, {damping: 10, stiffness: 220});
  const settle = Math.sin(land * Math.PI) * 6;
  const coinY = lerp(-60, 196, drop);
  return (
    <svg width={760} height={540} viewBox="0 0 760 540" style={{position: 'absolute', inset: 0, opacity: Math.min(1, p * 1.5)}}>
      <defs>
        <linearGradient id="wbody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E6F8C9" />
          <stop offset="1" stopColor="#B9E383" />
        </linearGradient>
        <linearGradient id="coin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E9FFC2" />
          <stop offset="1" stopColor="#8BCF2E" />
        </linearGradient>
        <radialGradient id="wglow">
          <stop offset="0" stopColor="#B6F24A" stopOpacity="0.28" />
          <stop offset="1" stopColor="#B6F24A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={380} cy={300} rx={300} ry={200} fill="url(#wglow)" />
      {drop < 1 ? (
        <g transform={`translate(380 ${coinY})`}>
          <circle r={44} fill="url(#coin)" />
          <circle r={32} fill="none" stroke="#5E8F1C" strokeWidth={4} opacity={0.6} />
        </g>
      ) : null}
      <g transform={`translate(0 ${settle})`}>
        <rect x={210} y={200} width={340} height={210} rx={34} fill="url(#wbody)" stroke="#6DA51E" strokeOpacity={0.55} strokeWidth={2} />
        <rect x={226} y={216} width={308} height={178} rx={24} fill="none" stroke="#6DA51E" strokeOpacity={0.4} strokeWidth={2} strokeDasharray="8 8" />
        <path d="M210 250 Q 380 290 550 250 L 550 234 Q 550 200 516 200 L 244 200 Q 210 200 210 234 Z" fill="#CDEEA0" />
        <rect x={470} y={280} width={100} height={64} rx={18} fill="#FFFFFF" stroke="#6DA51E" strokeOpacity={0.5} strokeWidth={2} />
        <circle cx={505} cy={312} r={10} fill="#6DC51E" />
      </g>
    </svg>
  );
};
