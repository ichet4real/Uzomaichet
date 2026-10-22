import React from 'react';
import {T} from '../timing';
import {bell, calm, io, lerp, spr} from '../lib/anim';

const FW = 280;
const FH = 498;

/** Illustrative vertical-video scenes (flat graphics; not real tool output). fx = "effect" restyle. */
const Scene: React.FC<{kind: number; fx: boolean; frame: number}> = ({kind, fx, frame}) => {
  const id = `s${kind}${fx ? 'f' : 'b'}`;
  const drift = Math.sin(frame / 20) * 6;
  if (kind === 0) {
    return (
      <g>
        <defs>
          <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={fx ? '#04121F' : '#2B1055'} />
            <stop offset="0.55" stopColor={fx ? '#0B2F4A' : '#C85CF0'} />
            <stop offset="1" stopColor={fx ? '#0E5866' : '#FF9A5A'} />
          </linearGradient>
        </defs>
        <rect width={FW} height={FH} fill={`url(#${id}sky)`} />
        {fx ? (
          <>
            <circle cx={140} cy={290} r={70} fill="none" stroke="#22D3EE" strokeWidth={6} />
            <circle cx={140} cy={290} r={92} fill="none" stroke="#FF5FD2" strokeWidth={2} opacity={0.7} />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <path key={i} d={`M${140 + Math.cos(i * 0.785) * 110} ${290 + Math.sin(i * 0.785) * 110} l${Math.cos(i * 0.785) * 24} ${Math.sin(i * 0.785) * 24}`} stroke="#B6F24A" strokeWidth={4} strokeLinecap="round" />
            ))}
          </>
        ) : (
          <circle cx={140} cy={300} r={70} fill="#FFD27A" />
        )}
        <rect y={330} width={FW} height={FH - 330} fill={fx ? '#031019' : '#1A0D3D'} />
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M-20 ${360 + i * 32} q 40 ${-12 + drift} 80 0 t 80 0 t 80 0 t 80 0`}
            stroke={fx ? (i % 2 ? '#FF5FD2' : '#22D3EE') : '#FFFFFF'}
            strokeOpacity={fx ? 0.9 : 0.35}
            strokeWidth={fx ? 3 : 2}
            fill="none"
          />
        ))}
      </g>
    );
  }
  if (kind === 1) {
    return (
      <g>
        <defs>
          <linearGradient id={`${id}sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={fx ? '#3A0B2E' : '#0B1A3A'} />
            <stop offset="1" stopColor={fx ? '#FF7A3D' : '#2E4A9E'} />
          </linearGradient>
        </defs>
        <rect width={FW} height={FH} fill={`url(#${id}sky)`} />
        <circle cx={200} cy={120} r={34} fill={fx ? '#FFE27A' : '#F2F4FF'} />
        {[30, 80, 120, 240, 60, 160].map((x, i) => (
          <circle key={i} cx={x} cy={40 + ((i * 53) % 160)} r={1.8} fill="#FFFFFF" opacity={0.8} />
        ))}
        <polygon points={`-10,${FH} 90,250 170,360 230,280 300,${FH}`} fill={fx ? '#8E1F5A' : '#1A2A5C'} />
        <polygon points={`-10,${FH} 60,380 150,320 240,400 300,${FH}`} fill={fx ? '#C2337A' : '#24387A'} />
      </g>
    );
  }
  return (
    <g>
      <rect width={FW} height={FH} fill={fx ? '#F2F0FF' : '#1C0F2E'} />
      <circle cx={100} cy={180} r={90} fill={fx ? '#6C4DFF' : '#FF6FA8'} />
      <rect x={130} y={250} width={110} height={110} rx={18} fill={fx ? '#FF5FD2' : '#2EE6C5'} transform={`rotate(${18 + drift} 185 305)`} />
      <polygon points="60,440 130,330 200,440" fill={fx ? '#22D3EE' : '#FFC857'} />
    </g>
  );
};

/** Short-form UI hints (no text): side actions, avatar + caption skeleton, progress bar. */
const ShortUI: React.FC<{frame: number; o: number}> = ({frame, o}) => {
  const prog = ((frame % 120) / 120) * 236;
  return (
    <g opacity={o}>
      <path d="M248 292 c-6-8-20-4-16 6 l16 14 l16-14 c4-10-10-14-16-6z" fill="#FFFFFF" opacity={0.92} />
      <circle cx={248} cy={346} r={13} fill="#FFFFFF" opacity={0.85} />
      <circle cx={248} cy={392} r={13} fill="#FFFFFF" opacity={0.85} />
      <circle cx={30} cy={430} r={13} fill="#FFFFFF" opacity={0.9} />
      <rect x={52} y={422} width={110} height={8} rx={4} fill="#FFFFFF" opacity={0.75} />
      <rect x={20} y={450} width={170} height={6} rx={3} fill="#FFFFFF" opacity={0.45} />
      <rect x={22} y={476} width={236} height={4} rx={2} fill="#FFFFFF" opacity={0.25} />
      <rect x={22} y={476} width={prog} height={4} rx={2} fill="#FFFFFF" opacity={0.95} />
    </g>
  );
};

const VFrame: React.FC<{kind: number; frame: number; w: number; h: number; content: number; portal: number; split: number}> = ({kind, frame, w, h, content, portal, split}) => {
  const r = portal * 620;
  const cx = FW / 2;
  const cy = FH * 0.45;
  return (
    <div
      style={{
        position: 'relative',
        width: w,
        height: h,
        borderRadius: 26,
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #1D2230, #141822)',
        border: '1px solid rgba(255,255,255,0.14)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.55)',
      }}
    >
      {/* loading shimmer (before content) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.07) 50%, transparent 70%)`,
          backgroundSize: '250% 100%',
          backgroundPosition: `${100 - ((frame * 2.2) % 100)}% 0`,
          opacity: 1 - content,
        }}
      />
      <svg width={w} height={h} viewBox={`0 0 ${FW} ${FH}`} preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0, opacity: content}}>
        <Scene kind={kind} fx={false} frame={frame} />
        {portal > 0 ? (
          <>
            <defs>
              <clipPath id={`portal${kind}`}>
                <circle cx={cx} cy={cy} r={r} />
              </clipPath>
            </defs>
            <g clipPath={`url(#portal${kind})`}>
              <Scene kind={kind} fx frame={frame} />
            </g>
            {/* portal rim with a restrained RGB colour split */}
            <circle cx={cx - 5 * split} cy={cy} r={r} fill="none" stroke="#FF3D7F" strokeWidth={5} opacity={0.75 * (1 - portal)} />
            <circle cx={cx + 5 * split} cy={cy} r={r} fill="none" stroke="#22D3EE" strokeWidth={5} opacity={0.75 * (1 - portal)} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={0.9 * (1 - portal)} />
          </>
        ) : null}
        <ShortUI frame={frame} o={content} />
      </svg>
    </div>
  );
};

export const PixverseDemo: React.FC<{frame: number; w: number; h: number}> = ({frame, w, h}) => {
  const s = spr(frame, T.shortForm, {damping: 18, stiffness: 120});
  const s2 = spr(frame, T.shortForm + 4, {damping: 18, stiffness: 110});
  const ghostIn = spr(frame, T.pixverse - 6, calm);
  // horizontal 16:9 placeholder → vertical 9:16 frame on "short form"
  const cw = lerp(600, FW, s);
  const ch = lerp(338, FH, s);
  const portal = (d: number) => io(frame, T.creativeEffects + d, T.creativeEffects + d + 26);
  const split = bell(frame, T.creativeEffects, T.creativeEffects + 16);
  const sides = [
    {kind: 1, dx: -300, rot: -9, d: 5},
    {kind: 2, dx: 300, rot: 9, d: 9},
  ];
  return (
    <div style={{position: 'absolute', left: w / 2, top: h / 2}}>
      {sides.map((sd) => (
        <div
          key={sd.kind}
          style={{
            position: 'absolute',
            left: -FW / 2 + sd.dx * s2,
            top: -FH / 2 + 20 * s2,
            transform: `rotate(${sd.rot * s2}deg) scale(${0.86})`,
            opacity: s2,
          }}
        >
          <VFrame kind={sd.kind} frame={frame} w={FW} h={FH} content={io(frame, T.shortForm + 6, T.shortForm + 20)} portal={portal(sd.d)} split={0} />
        </div>
      ))}
      <div style={{position: 'absolute', left: -cw / 2, top: -ch / 2, opacity: ghostIn, transform: `scale(${0.92 + 0.08 * ghostIn})`}}>
        <VFrame kind={0} frame={frame} w={cw} h={ch} content={io(frame, T.shortForm + 2, T.shortForm + 16)} portal={portal(0)} split={split} />
        {/* play glyph on the placeholder */}
        <svg width={64} height={64} viewBox="0 0 64 64" style={{position: 'absolute', left: cw / 2 - 32, top: ch / 2 - 32, opacity: (1 - s) * 0.8}}>
          <circle cx={32} cy={32} r={30} fill="rgba(255,255,255,0.12)" />
          <path d="M26 20 L46 32 L26 44 Z" fill="#FFFFFF" />
        </svg>
      </div>
    </div>
  );
};
