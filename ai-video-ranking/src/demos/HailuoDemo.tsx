import React from 'react';
import {T} from '../timing';
import {bell, calm, io, lerp, spr} from '../lib/anim';

/** Abstract cinematic illustration (silhouette + window light). Not presented as tool output. */
export const HailuoDemo: React.FC<{frame: number; w: number; h: number}> = ({frame, w, h}) => {
  const VW = 1160;
  const VH = 560;
  const expo = io(frame, T.hailuo - 4, T.hailuo + 22);
  const rim = spr(frame, T.realisticPeople, calm);
  const cine = spr(frame, T.cinematicScenes, calm);
  const p = io(frame, T.hailuo, T.myNumber + 10, 0, 1, (x) => x);
  const cam = `translate(${VW / 2} ${VH / 2}) scale(${1.02 + 0.08 * p}) translate(${-VW / 2 - 30 * p} ${-VH / 2})`;
  const bar = 38 * cine;
  const flareX = lerp(-300, VW + 300, io(frame, T.cinematicScenes + 2, T.cinematicScenes + 40, 0, 1, (x) => x));
  const flare = bell(frame, T.cinematicScenes + 2, T.cinematicScenes + 40) * 0.55;
  const dust = Array.from({length: 16}, (_, i) => ({
    x: 560 + ((i * 97) % 520),
    y: 120 + ((i * 61) % 340),
    r: 1.4 + (i % 3) * 0.8,
    s: 0.3 + (i % 4) * 0.12,
  }));
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#120C14'}}>
      <svg width={w} height={h} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0, filter: `brightness(${lerp(0.12, 1, expo)})`}}>
        <defs>
          <linearGradient id="hsun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5A2466" />
            <stop offset="0.45" stopColor="#E8445F" />
            <stop offset="0.8" stopColor="#FF8A1F" />
            <stop offset="1" stopColor="#FFD08A" />
          </linearGradient>
          <linearGradient id="hray" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FF9A5A" stopOpacity="0.38" />
            <stop offset="1" stopColor="#FF9A5A" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hrim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFD08A" />
            <stop offset="1" stopColor="#FF6A3D" />
          </linearGradient>
          <radialGradient id="hkey" cx="0.3" cy="0.45" r="0.6">
            <stop offset="0" stopColor="#FFB27A" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFB27A" stopOpacity="0" />
          </radialGradient>
          <filter id="hblur"><feGaussianBlur stdDeviation="4" /></filter>
          <filter id="hsoft"><feGaussianBlur stdDeviation={lerp(0, 2.5, rim)} /></filter>
          <clipPath id="hface"><rect x={0} y={0} width={846} height={VH} /></clipPath>
        </defs>
        <g transform={cam}>
          <rect x={-100} y={-50} width={VW + 200} height={VH + 100} fill="#120C14" />
          <g filter="url(#hsoft)">
            {/* window with sunset + skyline */}
            <rect x={90} y={50} width={430} height={420} fill="url(#hsun)" />
            <circle cx={300} cy={330} r={56} fill="#FFE0A8" opacity={0.95} />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <rect key={i} x={95 + i * 54} y={380 - ((i * 37) % 90)} width={46} height={120} fill="#2A1020" />
            ))}
            <rect x={90} y={50} width={430} height={420} fill="none" stroke="#0B070C" strokeWidth={18} />
            <rect x={297} y={50} width={14} height={420} fill="#0B070C" />
            <rect x={90} y={252} width={430} height={14} fill="#0B070C" />
            {/* light shafts */}
            <polygon points={`520,60 520,470 ${VW + 100},${VH + 40} ${VW + 100},210`} fill="url(#hray)" />
            <polygon points={`520,140 520,420 ${VW + 100},440 ${VW + 100},300`} fill="url(#hray)" opacity={0.7} />
            <rect x={-100} y={470} width={VW + 200} height={140} fill="#0D080E" />
          </g>
          {dust.map((d, i) => (
            <circle key={i} cx={d.x + Math.sin((frame + i * 13) / 30) * 8} cy={d.y - ((frame * d.s) % 60)} r={d.r} fill="#FFD9A8" opacity={0.45} />
          ))}
          {/* person silhouette facing the window */}
          <g>
            <path d="M690 600 C695 480 760 446 818 436 L880 436 C950 446 1000 480 1010 600 Z" fill="#0A0709" />
            <rect x={822} y={370} width={46} height={80} fill="#0A0709" />
            <path d="M846 250 C 800 250 776 285 780 322 L 768 346 L 784 352 L 782 372 C 786 392 808 404 832 404 L 860 400 C 900 392 912 350 910 314 C 908 278 888 250 846 250 Z" fill="#0A0709" />
            <ellipse cx={850} cy={344} rx={60} ry={70} fill="url(#hkey)" opacity={rim} />
            <g clipPath="url(#hface)" opacity={0.25 + 0.75 * rim}>
              <path d="M846 250 C 800 250 776 285 780 322 L 768 346 L 784 352 L 782 372 C 786 392 808 404 832 404" fill="none" stroke="url(#hrim)" strokeWidth={5} filter="url(#hblur)" />
              <path d="M846 250 C 800 250 776 285 780 322 L 768 346 L 784 352 L 782 372 C 786 392 808 404 832 404" fill="none" stroke="url(#hrim)" strokeWidth={2.5} />
              <path d="M690 600 C695 480 760 446 818 436" fill="none" stroke="url(#hrim)" strokeWidth={3} />
            </g>
          </g>
        </g>
      </svg>
      {/* colour grade (teal/orange) */}
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,140,60,0.5), rgba(15,163,177,0.55))', mixBlendMode: 'soft-light', opacity: cine}} />
      {/* anamorphic streak, one soft pass */}
      <div
        style={{
          position: 'absolute',
          left: (flareX / VW) * w - 450,
          top: h * 0.6 - 3,
          width: 900,
          height: 6,
          borderRadius: 3,
          background: 'linear-gradient(90deg, transparent, rgba(150,220,255,0.9), transparent)',
          filter: 'blur(2px)',
          opacity: flare,
        }}
      />
      {/* letterbox bars */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: (bar / VH) * h, background: '#000'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: (bar / VH) * h, background: '#000'}} />
    </div>
  );
};
