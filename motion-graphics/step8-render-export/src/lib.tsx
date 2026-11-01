import React from 'react';
import {Easing, interpolate, spring} from 'remotion';

export const FPS = 30;
export const C = {
  bg1: '#0B1022',
  bg2: '#04060D',
  orange: '#FF7A45',
  amber: '#FFB547',
  cyan: '#3DD6F5',
  green: '#3BE38B',
  white: '#F5F7FF',
  dim: '#8E97B8',
  card: 'rgba(255,255,255,0.06)',
  stroke: 'rgba(255,255,255,0.14)',
};
export const FONT = "'Inter', 'Inter Display', sans-serif";

export const ease = Easing.bezier(0.65, 0, 0.35, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

/** 0..1 progress between two times (seconds) */
export const prog = (t: number, a: number, b: number, e = easeOut) =>
  interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

/** spring that starts at time a (seconds) */
export const pop = (t: number, a: number, damping = 12, mass = 0.6) =>
  t < a ? 0 : spring({frame: (t - a) * FPS, fps: FPS, config: {damping, mass, stiffness: 140}});

/** in/out visibility window with fade */
export const win = (t: number, a: number, b: number, fade = 0.25) =>
  Math.min(prog(t, a, a + fade), 1 - prog(t, b - fade, b, ease));

export const Card: React.FC<{style?: React.CSSProperties; children?: React.ReactNode; glow?: string}> = ({style, children, glow}) => (
  <div
    style={{
      background: 'linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))',
      border: `1.5px solid ${C.stroke}`,
      borderRadius: 28,
      boxShadow: `0 30px 80px rgba(0,0,0,0.45)${glow ? `, 0 0 60px ${glow}` : ''}`,
      backdropFilter: 'blur(10px)',
      ...style,
    }}
  >
    {children}
  </div>
);

export const Check: React.FC<{size?: number; p?: number; color?: string}> = ({size = 60, p = 1, color = C.green}) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    <circle cx="30" cy="30" r="27" fill={color} opacity={0.18 + 0.82 * Math.min(1, p * 1.4)} />
    <path
      d="M17 31 L26 40 L44 21"
      fill="none"
      stroke={C.bg2}
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="44"
      strokeDashoffset={44 * (1 - p)}
    />
  </svg>
);

export const Chip: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({children, color = C.orange, style}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '10px 22px',
      borderRadius: 999,
      background: `${color}22`,
      border: `2px solid ${color}`,
      color,
      fontWeight: 800,
      letterSpacing: 3,
      fontSize: 26,
      textTransform: 'uppercase',
      ...style,
    }}
  >
    {children}
  </div>
);

/* ---------- icons ---------- */
export const IconLaptop: React.FC<{s?: number; c?: string}> = ({s = 120, c = C.cyan}) => (
  <svg width={s} height={s} viewBox="0 0 120 120" fill="none" stroke={c} strokeWidth="6" strokeLinejoin="round">
    <rect x="20" y="22" width="80" height="54" rx="8" />
    <path d="M8 92 H112 L102 80 H18 Z" fill={`${c}33`} />
    <path d="M40 50 l10 8 l20-18" strokeLinecap="round" />
  </svg>
);
export const IconFilm: React.FC<{s?: number; c?: string}> = ({s = 120, c = C.amber}) => (
  <svg width={s} height={s} viewBox="0 0 120 120" fill="none" stroke={c} strokeWidth="6" strokeLinejoin="round">
    <rect x="14" y="24" width="92" height="72" rx="10" />
    <path d="M14 42 H106 M14 78 H106" />
    {[26, 46, 66, 86].map((x) => (
      <rect key={x} x={x - 4} y={29} width={8} height={8} rx={2} fill={c} stroke="none" />
    ))}
    {[26, 46, 66, 86].map((x) => (
      <rect key={'b' + x} x={x - 4} y={83} width={8} height={8} rx={2} fill={c} stroke="none" />
    ))}
    <path d="M52 50 L70 60 L52 70 Z" fill={c} stroke="none" />
  </svg>
);
export const IconGear: React.FC<{s?: number; c?: string; rot?: number}> = ({s = 80, c = C.orange, rot = 0}) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{transform: `rotate(${rot}deg)`}}>
    <g fill={c}>
      {Array.from({length: 8}).map((_, i) => (
        <rect key={i} x="44" y="4" width="12" height="20" rx="3" transform={`rotate(${i * 45} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="30" />
    </g>
    <circle cx="50" cy="50" r="12" fill={C.bg2} />
  </svg>
);
export const IconDownload: React.FC<{s?: number; c?: string; dy?: number}> = ({s = 80, c = C.cyan, dy = 0}) => (
  <svg width={s} height={s} viewBox="0 0 100 100" fill="none" stroke={c} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
    <g transform={`translate(0 ${dy})`}>
      <path d="M50 12 V60" />
      <path d="M28 40 L50 62 L72 40" />
    </g>
    <path d="M16 72 V86 H84 V72" />
  </svg>
);
export const IconScissors: React.FC<{s?: number; c?: string; open?: number}> = ({s = 70, c = C.amber, open = 0}) => (
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

export const Mp4File: React.FC<{w?: number; name?: string}> = ({w = 260, name = 'video sample1.mp4'}) => (
  <div style={{width: w, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
    <svg width={w * 0.7} height={w * 0.86} viewBox="0 0 140 172">
      <defs>
        <linearGradient id="fg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2A3358" />
          <stop offset="1" stopColor="#151B33" />
        </linearGradient>
      </defs>
      <path d="M10 8 H96 L130 42 V162 a6 6 0 0 1 -6 6 H16 a6 6 0 0 1 -6 -6 Z" fill="url(#fg)" stroke={C.stroke} strokeWidth="3" />
      <path d="M96 8 V42 H130" fill="#3A4570" />
      <path d="M56 70 L90 90 L56 110 Z" fill={C.cyan} />
      <rect x="22" y="128" width="96" height="30" rx="8" fill={C.orange} />
      <text x="70" y="150" textAnchor="middle" fontFamily="Inter" fontWeight="900" fontSize="22" fill="#fff">
        MP4
      </text>
    </svg>
    {name ? (
      <div style={{color: C.white, fontSize: 28, fontWeight: 700, fontFamily: FONT, whiteSpace: 'nowrap'}}>{name}</div>
    ) : null}
  </div>
);
