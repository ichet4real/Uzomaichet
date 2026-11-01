import React from 'react';
import {Easing, interpolate, spring} from 'remotion';

export const FPS = 30;
export const C = {
  bg: '#F7F7F9',
  ink: '#0E0E12',
  sub: '#6B6F7B',
  faint: '#A3A7B3',
  card: '#FFFFFF',
  line: 'rgba(14,14,18,0.07)',
  pink: '#FFB3C7',
  pinkDeep: '#FF5C8A',
  red: '#F0505A',
  green: '#22C55E',
  greenSoft: '#D9F7E3',
  blue: '#2F7BF5',
  blueSoft: '#DCE9FF',
  purple: '#8B7CF6',
  purpleSoft: '#ECE8FF',
  yellow: '#FFC93C',
  yellowSoft: '#FFF3C9',
  peach: '#FFB089',
  navy: '#0D1630',
  // kept for compatibility with older references
  white: '#FFFFFF',
  dim: '#6B6F7B',
  stroke: 'rgba(14,14,18,0.07)',
  orange: '#FF8A5C',
  amber: '#FFC93C',
  cyan: '#2EC5D6',
  bg2: '#0E0E12',
};
export const FONT = "'Inter', 'Inter Display', sans-serif";
export const SHADOW = '0 24px 60px rgba(30,30,60,0.10), 0 4px 14px rgba(30,30,60,0.06)';
export const GRAD = `linear-gradient(90deg, ${C.purple}, ${C.pinkDeep} 55%, ${C.peach})`;

export const ease = Easing.bezier(0.65, 0, 0.35, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

export const prog = (t: number, a: number, b: number, e = easeOut) =>
  interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

export const pop = (t: number, a: number, damping = 14, mass = 0.6) =>
  t < a ? 0 : spring({frame: (t - a) * FPS, fps: FPS, config: {damping, mass, stiffness: 140}});

export const win = (t: number, a: number, b: number, fade = 0.25) =>
  Math.min(prog(t, a, a + fade), 1 - prog(t, b - fade, b, ease));

export const Card: React.FC<{style?: React.CSSProperties; children?: React.ReactNode}> = ({style, children}) => (
  <div style={{background: C.card, borderRadius: 26, boxShadow: SHADOW, border: `1px solid ${C.line}`, ...style}}>
    {children}
  </div>
);

/** black "STEP 08" chip like the series */
export const StepChip: React.FC<{n?: string; scale?: number; suffix?: React.ReactNode}> = ({n = '08', scale = 1, suffix}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 14 * scale, padding: `${8 * scale}px ${10 * scale}px ${8 * scale}px ${26 * scale}px`,
    borderRadius: 999, background: C.ink, fontFamily: FONT}}>
    <div style={{color: '#fff', fontWeight: 600, letterSpacing: 4 * scale, fontSize: 26 * scale}}>STEP</div>
    <div style={{background: C.pink, color: C.ink, fontWeight: 800, fontSize: 26 * scale, padding: `${4 * scale}px ${16 * scale}px`,
      borderRadius: 999}}>{n}</div>
    {suffix}
  </div>
);

/** white pill with a small pastel icon square */
export const Pill: React.FC<{icon?: React.ReactNode; iconBg?: string; children: React.ReactNode; dark?: boolean; size?: number; style?: React.CSSProperties}> = ({icon, iconBg = C.yellowSoft, children, dark, size = 30, style}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.45, padding: `${size * 0.33}px ${size * 0.8}px ${size * 0.33}px ${icon ? size * 0.33 : size * 0.8}px`,
    borderRadius: 999, background: dark ? C.ink : '#fff', color: dark ? '#fff' : C.ink, boxShadow: SHADOW,
    border: `1px solid ${C.line}`, fontFamily: FONT, fontWeight: 600, fontSize: size, whiteSpace: 'nowrap', ...style}}>
    {icon ? (
      <div style={{width: size * 1.35, height: size * 1.35, borderRadius: size * 0.4, background: iconBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.75, fontWeight: 800}}>{icon}</div>
    ) : null}
    {children}
  </div>
);

/** green status pill ("Original approved" style) */
export const GreenPill: React.FC<{children: React.ReactNode; size?: number}> = ({children, size = 34}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: size * 0.4, padding: `${size * 0.35}px ${size * 0.8}px ${size * 0.35}px ${size * 0.4}px`,
    borderRadius: 999, background: C.green, color: '#fff', fontFamily: FONT, fontWeight: 700, fontSize: size,
    boxShadow: `0 14px 40px ${C.green}55`, whiteSpace: 'nowrap'}}>
    <Check size={size * 1.25} p={1} color="#fff" mark={C.green} />
    {children}
  </div>
);

export const Check: React.FC<{size?: number; p?: number; color?: string; mark?: string}> = ({size = 60, p = 1, color = C.green, mark = '#fff'}) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    <circle cx="30" cy="30" r="28" fill={color} opacity={0.25 + 0.75 * Math.min(1, p * 1.4)} />
    <path d="M17 31 L26 40 L44 21" fill="none" stroke={mark} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
      strokeDasharray="44" strokeDashoffset={44 * (1 - p)} />
  </svg>
);

/**
 * Headline whose words blur into focus one by one (series style).
 * words: [text, startTime, highlightColors?]
 */
export type Word = {w: string; t: number; hl?: [string, string]};
export const BlurWords: React.FC<{t: number; words: Word[]; size?: number; gap?: number; color?: string}> = ({t, words, size = 120, gap, color = C.ink}) => (
  <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', gap: `0 ${gap ?? size * 0.26}px`,
    fontFamily: FONT, fontWeight: 800, fontSize: size, letterSpacing: -size * 0.035, color, lineHeight: 1.12}}>
    {words.map((w, i) => {
      const p = prog(t, w.t, w.t + 0.45);
      const hl = w.hl ? prog(t, w.t + 0.15, w.t + 0.6) : 0;
      return (
        <span key={i} style={{position: 'relative', display: 'inline-block', opacity: p, filter: `blur(${(1 - p) * 18}px)`,
          transform: `translateY(${(1 - p) * size * 0.18}px)`}}>
          {w.hl ? (
            <span style={{position: 'absolute', left: -size * 0.08, right: -size * 0.08, top: '18%', bottom: '4%',
              borderRadius: size * 0.12, background: `linear-gradient(90deg, ${w.hl[0]}, ${w.hl[1]})`, opacity: 0.85,
              transformOrigin: 'left center', transform: `scaleX(${hl})`, zIndex: 0}} />
          ) : null}
          <span style={{position: 'relative', zIndex: 1}}>{w.w}</span>
        </span>
      );
    })}
  </div>
);

export const HL_PINK: [string, string] = ['#FFC6D6', '#FFD9B8'];
export const HL_GREEN: [string, string] = ['#BDF3CF', '#D6F7C0'];
export const HL_BLUE: [string, string] = ['#C9DDFF', '#D5D0FF'];
export const HL_YELLOW: [string, string] = ['#FFE9A3', '#FFD6B0'];

/* ---------- icons (line icons in ink) ---------- */
export const IconLaptop: React.FC<{s?: number; c?: string}> = ({s = 120, c = C.ink}) => (
  <svg width={s} height={s} viewBox="0 0 120 120" fill="none" stroke={c} strokeWidth="6" strokeLinejoin="round">
    <rect x="20" y="24" width="80" height="52" rx="8" />
    <path d="M8 90 H112 L102 80 H18 Z" />
  </svg>
);
export const IconFilm: React.FC<{s?: number; c?: string}> = ({s = 120, c = C.ink}) => (
  <svg width={s} height={s} viewBox="0 0 120 120" fill="none" stroke={c} strokeWidth="6" strokeLinejoin="round">
    <rect x="14" y="24" width="92" height="72" rx="10" />
    <path d="M52 46 L74 60 L52 74 Z" fill={c} stroke="none" />
  </svg>
);
export const IconGear: React.FC<{s?: number; c?: string; rot?: number}> = ({s = 80, c = C.ink, rot = 0}) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{transform: `rotate(${rot}deg)`}}>
    <g fill={c}>
      {Array.from({length: 8}).map((_, i) => (
        <rect key={i} x="44" y="6" width="12" height="18" rx="3" transform={`rotate(${i * 45} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="28" />
    </g>
    <circle cx="50" cy="50" r="11" fill="#fff" />
  </svg>
);
export const IconDownload: React.FC<{s?: number; c?: string; dy?: number}> = ({s = 80, c = C.ink, dy = 0}) => (
  <svg width={s} height={s} viewBox="0 0 100 100" fill="none" stroke={c} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
    <g transform={`translate(0 ${dy})`}>
      <path d="M50 14 V60" />
      <path d="M30 42 L50 62 L70 42" />
    </g>
    <path d="M18 74 V86 H82 V74" />
  </svg>
);
export const IconScissors: React.FC<{s?: number; c?: string; open?: number}> = ({s = 70, c = C.ink, open = 0}) => (
  <svg width={s} height={s} viewBox="0 0 100 100" fill="none" stroke={c} strokeWidth="7" strokeLinecap="round">
    <g transform={`rotate(${-open * 14} 50 50)`}>
      <circle cx="24" cy="74" r="12" />
      <path d="M33 66 L86 20" />
    </g>
    <g transform={`rotate(${open * 14} 50 50)`}>
      <circle cx="24" cy="26" r="12" />
      <path d="M33 34 L86 80" />
    </g>
  </svg>
);

export const IconBox: React.FC<{bg: string; size?: number; children: React.ReactNode}> = ({bg, size = 110, children}) => (
  <div style={{width: size, height: size, borderRadius: size * 0.28, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    {children}
  </div>
);

export const Mp4File: React.FC<{w?: number; name?: string}> = ({w = 260, name = 'video sample1.mp4'}) => (
  <div style={{width: w, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
    <svg width={w * 0.62} height={w * 0.76} viewBox="0 0 140 172">
      <path d="M10 8 H96 L130 42 V162 a6 6 0 0 1 -6 6 H16 a6 6 0 0 1 -6 -6 Z" fill={C.navy} />
      <path d="M96 8 V42 H130" fill="#2B3A66" />
      <path d="M56 66 L90 86 L56 106 Z" fill="#5BE3F0" />
      <rect x="26" y="126" width="88" height="30" rx="15" fill={C.pink} />
      <text x="70" y="148" textAnchor="middle" fontFamily="Inter" fontWeight="800" fontSize="20" fill={C.ink}>MP4</text>
    </svg>
    {name ? <div style={{color: C.ink, fontSize: 28, fontWeight: 700, fontFamily: FONT, whiteSpace: 'nowrap'}}>{name}</div> : null}
  </div>
);
