import React from 'react';
import {C, FONT, rgba} from '../theme';

const Arrow: React.FC<{size: number}> = ({size}) => (
  <svg width={size * 1.1} height={size * 0.7} viewBox="0 0 22 14" style={{margin: '0 0.28em', verticalAlign: 'middle', position: 'relative', top: -2}}>
    <path d="M1 7 H19 M13 1.5 L19.5 7 L13 12.5" stroke="currentColor" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const renderText = (s: string, size: number) => {
  const parts = s.split('→');
  return parts.flatMap((p, i) => (i === 0 ? [p.trim()] : [<Arrow key={i} size={size} />, p.trim()]));
};

/** Short benefit pill. `p` is 0..1 reveal (wipe + slide). */
export const Pill: React.FC<{text: string; p: number; accent: string; size?: number; style?: React.CSSProperties}> = ({text, p, accent, size = 30, style}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${size * 0.42}px ${size * 0.8}px`,
      borderRadius: 999,
      border: `1.5px solid ${rgba(accent, 0.35)}`,
      background: `linear-gradient(90deg, ${rgba(accent, 0.16)}, ${rgba(accent, 0.07)}), #FFFFFF`,
      boxShadow: `0 10px 24px rgba(28,32,52,0.08), 0 0 24px ${rgba(accent, 0.14)}`,
      color: C.ink,
      fontFamily: FONT.label,
      fontWeight: 800,
      fontSize: size,
      letterSpacing: '0.09em',
      whiteSpace: 'nowrap',
      clipPath: `inset(-20px ${(1 - p) * 100}% -20px -20px round 999px)`,
      transform: `translateX(${(1 - p) * -24}px)`,
      opacity: Math.min(1, p * 2),
      ...style,
    }}
  >
    {renderText(text, size)}
  </div>
);

export const BenefitLabel: React.FC<{parts: [string, string]; p1: number; p2: number; accent: string; size?: number}> = ({parts, p1, p2, accent, size}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12}}>
    {p1 > 0 ? <Pill text={parts[0]} p={p1} accent={accent} size={size} /> : null}
    {parts[1] && p2 > 0 ? <Pill text={parts[1]} p={p2} accent={accent} size={size} /> : null}
  </div>
);
