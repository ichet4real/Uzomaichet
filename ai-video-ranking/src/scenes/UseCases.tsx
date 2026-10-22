import React from 'react';
import {T} from '../timing';
import {C, FONT, rgba} from '../theme';
import {bell, calm, io, lerp, spr} from '../lib/anim';

const CARDS = [
  {label: 'PRODUCT ADS', cue: () => T.productAds, accent: '#22D3EE'},
  {label: 'IMAGE GENERATION', cue: () => T.imageGeneration, accent: '#8B5CF6'},
  {label: 'CINEMATIC MOVIES', cue: () => T.cinematicMovies, accent: '#FF9A5A'},
];
const CW = 530;
const CH = 600;
const GAP = 55;
const X0 = (1920 - (CW * 3 + GAP * 2)) / 2;
const Y0 = 200;

/** Narrator's example use cases, each revealed on its spoken phrase. */
export const UseCases: React.FC<{frame: number}> = ({frame}) => {
  if (frame < T.useCases - 4 || frame > T.finalBoard + 20) return null;
  const leave = io(frame, T.finalBoard + 2, T.finalBoard + 16);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - leave, transform: `scale(${1 - 0.08 * leave}) translateY(${-leave * 30}px)`}}>
      {CARDS.map((c, i) => {
        const ghost = spr(frame, T.useCases + i * 4, calm);
        const p = spr(frame, c.cue(), {damping: 17, stiffness: 150});
        const local = frame - c.cue();
        return (
          <div key={c.label} style={{position: 'absolute', left: X0 + i * (CW + GAP), top: Y0, width: CW, height: CH, opacity: ghost, transform: `translateY(${(1 - ghost) * 40 - p * 10}px)`}}>
            <div style={{position: 'absolute', inset: -60, borderRadius: '50%', background: `radial-gradient(circle, ${rgba(c.accent, 0.3 * p)} 0%, transparent 65%)`}} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 34,
                overflow: 'hidden',
                background: p > 0.05 ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
                border: `1px ${p > 0.05 ? 'solid' : 'dashed'} ${p > 0.05 ? 'rgba(14,16,20,0.06)' : 'rgba(14,16,20,0.16)'}`,
                boxShadow: C.shadow,
              }}
            >
              {/* skeleton shimmer while waiting for the cue */}
              <div style={{position: 'absolute', left: 40, right: 40, top: 40, height: 380, borderRadius: 22, background: C.skel, opacity: 1 - p}} />
              <div style={{position: 'absolute', left: 40, top: 470, width: 260, height: 22, borderRadius: 11, background: C.skel, opacity: 1 - p}} />
              {p > 0 ? (
                <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 460, opacity: Math.min(1, p * 1.4)}}>
                  {i === 0 ? <ProductAd t={local} p={p} /> : i === 1 ? <ImageGen t={local} /> : <FilmFrame t={local} frame={frame} />}
                </div>
              ) : null}
              <div style={{position: 'absolute', left: 40, bottom: 48, display: 'flex', alignItems: 'center', gap: 16, opacity: p, transform: `translateY(${(1 - p) * 16}px)`}}>
                <div style={{width: 7, height: 38, borderRadius: 4, background: c.accent, boxShadow: `0 0 14px ${c.accent}`}} />
                <div style={{fontFamily: FONT.label, fontWeight: 800, fontSize: 38, letterSpacing: '0.1em', color: C.ink, whiteSpace: 'nowrap'}}>{c.label}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ProductAd: React.FC<{t: number; p: number}> = ({t}) => {
  const drop = spr(t, 2, {damping: 12, stiffness: 180});
  const guides = io(t, 4, 20);
  const g = lerp(1.35, 1, guides);
  return (
    <svg width={CW} height={460} viewBox={`0 0 ${CW} 460`}>
      <defs>
        <linearGradient id="ped" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#D9DEE6" />
          <stop offset="0.5" stopColor="#F7F8FA" />
          <stop offset="1" stopColor="#D2D7E0" />
        </linearGradient>
        <linearGradient id="bottle" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0F8FA6" />
          <stop offset="0.45" stopColor="#7FF3FF" />
          <stop offset="1" stopColor="#0E6E82" />
        </linearGradient>
        <radialGradient id="spot" cx="0.5" cy="0" r="1">
          <stop offset="0" stopColor="#22D3EE" stopOpacity="0.22" />
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0" />
        </radialGradient>
      </defs>
      <polygon points={`${CW / 2 - 40},0 ${CW / 2 + 40},0 ${CW / 2 + 170},400 ${CW / 2 - 170},400`} fill="url(#spot)" />
      <rect x={CW / 2 - 130} y={330} width={260} height={90} fill="url(#ped)" />
      <ellipse cx={CW / 2} cy={420} rx={130} ry={22} fill="#C9CFD9" />
      <ellipse cx={CW / 2} cy={330} rx={130} ry={22} fill="#FFFFFF" stroke="#DDE1E8" />
      <g transform={`translate(0 ${(1 - drop) * -220})`}>
        <rect x={CW / 2 - 46} y={170} width={92} height={160} rx={26} fill="url(#bottle)" />
        <rect x={CW / 2 - 22} y={136} width={44} height={40} rx={8} fill="#E9F7FA" />
        <rect x={CW / 2 - 30} y={220} width={60} height={50} rx={8} fill="#FFFFFF" opacity={0.85} />
      </g>
      <g stroke="#06B6D4" strokeWidth={4} fill="none" strokeLinecap="round" transform={`translate(${CW / 2} 250) scale(${g}) translate(${-CW / 2} -250)`} opacity={guides}>
        <path d={`M${CW / 2 - 150} 120 v-30 h30`} />
        <path d={`M${CW / 2 + 150} 120 v-30 h-30`} />
        <path d={`M${CW / 2 - 150} 380 v30 h30`} />
        <path d={`M${CW / 2 + 150} 380 v30 h-30`} />
      </g>
      <g stroke="rgba(14,16,20,0.14)" strokeWidth={1.5} opacity={guides}>
        <line x1={CW / 3} y1={40} x2={CW / 3} y2={40 + 400 * guides} />
        <line x1={(CW * 2) / 3} y1={40} x2={(CW * 2) / 3} y2={40 + 400 * guides} />
        <line x1={40} y1={160} x2={40 + (CW - 80) * guides} y2={160} />
      </g>
    </svg>
  );
};

const ImageGen: React.FC<{t: number}> = ({t}) => {
  const L = (d: number) => spr(t, d, {damping: 16, stiffness: 160});
  const layers = [L(0), L(4), L(8), L(12)];
  const lift = (k: number) => (1 - layers[k]) * -70;
  const x = 60;
  const y = 50;
  const w = CW - 120;
  const h = 360;
  return (
    <svg width={CW} height={460} viewBox={`0 0 ${CW} 460`}>
      <defs>
        <pattern id="checker" width="24" height="24" patternUnits="userSpaceOnUse">
          <rect width="24" height="24" fill="#F4F5F8" />
          <rect width="12" height="12" fill="#E6E9EE" />
          <rect x="12" y="12" width="12" height="12" fill="#E6E9EE" />
        </pattern>
        <linearGradient id="igsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3B1E7A" />
          <stop offset="1" stopColor="#C85CF0" />
        </linearGradient>
        <clipPath id="igclip"><rect x={x} y={y} width={w} height={h} rx={18} /></clipPath>
      </defs>
      <rect x={x} y={y} width={w} height={h} rx={18} fill="url(#checker)" />
      <g clipPath="url(#igclip)">
        <rect x={x} y={y + lift(0)} width={w} height={h} fill="url(#igsky)" opacity={layers[0]} />
        <circle cx={x + w * 0.7} cy={y + 120 + lift(1)} r={46} fill="#FFD27A" opacity={layers[1]} />
        <path d={`M${x} ${y + h} L ${x + 90} ${y + 190 + lift(2)} L ${x + 180} ${y + 260 + lift(2)} L ${x + 290} ${y + 170 + lift(2)} L ${x + w} ${y + 280 + lift(2)} L ${x + w} ${y + h} Z`} fill="#5B2BA8" opacity={layers[2]} />
        <path d={`M${x} ${y + h} L ${x} ${y + 300 + lift(3)} Q ${x + w / 2} ${y + 250 + lift(3)} ${x + w} ${y + 310 + lift(3)} L ${x + w} ${y + h} Z`} fill="#22113F" opacity={layers[3]} />
      </g>
      <rect x={x} y={y} width={w} height={h} rx={18} fill="none" stroke="rgba(14,16,20,0.12)" />
      {/* layer stack indicator */}
      {[0, 1, 2, 3].map((k) => (
        <rect key={k} x={x + w - 70} y={y + h - 30 - k * 14} width={56} height={8} rx={4} fill={layers[3 - k] > 0.5 ? '#8B5CF6' : 'rgba(14,16,20,0.12)'} />
      ))}
    </svg>
  );
};

const FilmFrame: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const run = frame * 2.2;
  const sw = bell(t, 6, 40);
  const swx = io(t, 6, 40, -30, 130, (v) => v);
  const x = 40;
  const y = 70;
  const w = CW - 80;
  const h = 300;
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <svg width={CW} height={460} viewBox={`0 0 ${CW} 460`}>
        <defs>
          <linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1A1036" />
            <stop offset="0.7" stopColor="#E8445F" />
            <stop offset="1" stopColor="#FF9A5A" />
          </linearGradient>
          <clipPath id="fclip"><rect x={x + 20} y={y + 40} width={w - 40} height={h - 80} rx={6} /></clipPath>
        </defs>
        <rect x={x} y={y} width={w} height={h} rx={14} fill="#07080C" stroke="rgba(255,255,255,0.15)" />
        {Array.from({length: 12}, (_, i) => {
          const sx = x + 10 + ((i * 40 - run) % (w + 20) + w + 20) % (w + 20) - 10;
          return (
            <g key={i}>
              <rect x={sx} y={y + 12} width={20} height={16} rx={4} fill="#2A2F3B" />
              <rect x={sx} y={y + h - 28} width={20} height={16} rx={4} fill="#2A2F3B" />
            </g>
          );
        })}
        <g clipPath="url(#fclip)">
          <rect x={x} y={y} width={w} height={h} fill="url(#fsky)" />
          <circle cx={x + w * 0.62} cy={y + 190} r={40} fill="#FFD8A0" />
          <path
            d={`M${x} ${y + h} L${x} ${y + 200} h30 v-30 h26 v18 h22 v-52 h30 v40 h24 v-24 h34 v46 h20 v-70 h28 v58 h30 v-30 h26 v44 h40 v-20 h30 V${y + h} Z`}
            fill="#2A1236"
            transform={`translate(${-(t * 0.4) % 40} 0)`}
          />
          <path d={`M${x} ${y + h} L${x} ${y + 236} Q ${x + 120} ${y + 214} ${x + 220} ${y + 232} T ${x + w} ${y + 226} V${y + h} Z`} fill="#12081A" />
          <path d={`M${x + 250} ${y + 260} c 0 -26 10 -40 24 -40 c 14 0 24 14 24 40 Z`} fill="#0A0510" />
          <circle cx={x + 274} cy={y + 206} r={12} fill="#0A0510" />
        </g>
      </svg>
      <div style={{position: 'absolute', left: x + 20, top: y + 40, width: w - 40, height: h - 80, borderRadius: 6, background: `linear-gradient(110deg, transparent ${swx - 14}%, rgba(255,230,200,${0.5 * sw}) ${swx}%, transparent ${swx + 14}%)`}} />
    </div>
  );
};
