import React from 'react';
import {T} from '../timing';
import {calm, io, lerp, spr} from '../lib/anim';

const VW = 860;
const VH = 500;

/** Still image of a stylised character → becomes a moving shot ("image to video"). Conceptual only. */
export const ViduDemo: React.FC<{frame: number; w: number; h: number}> = ({frame, w, h}) => {
  const inP = spr(frame, T.vidu, {damping: 17, stiffness: 140});
  const dev = io(frame, T.vidu, T.vidu + 20); // photo "develops"
  const c = spr(frame, T.characters, {damping: 18, stiffness: 160});
  const cOut = io(frame, T.imageToVideo + 6, T.imageToVideo + 18);
  const focus = c * (1 - cOut);
  const v = spr(frame, T.imageToVideo, calm);
  const t = Math.max(0, frame - T.imageToVideo) * io(frame, T.imageToVideo, T.imageToVideo + 12);
  const border = lerp(12, 0, v);
  const rot = lerp(-2.5, 0, v) * inP;
  const push = 1 + 0.07 * io(frame, T.imageToVideo, T.imageToVideo + 70, 0, 1);
  // character motion (only after the still becomes video)
  const blinkPhase = (t % 46) / 46;
  const blink = t > 0 && blinkPhase > 0.9 ? 0.15 : 1;
  const bob = Math.sin(t / 9) * 4;
  const tilt = Math.sin(t / 16) * 3;
  const wave = Math.sin(t / 6) * 14 * Math.min(1, t / 10);
  const charScale = 1 + 0.05 * focus;
  const dim = 1 - 0.5 * focus;

  return (
    <div style={{position: 'absolute', left: w / 2, top: h / 2}}>
      {/* skeleton placeholder */}
      <div
        style={{
          position: 'absolute',
          left: -VW / 2,
          top: -VH / 2,
          width: VW,
          height: VH,
          borderRadius: 20,
          background: '#F1F3F6',
          border: '1px dashed rgba(14,16,20,0.15)',
          opacity: 1 - inP,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -VW / 2 - border,
          top: -VH / 2 - border,
          width: VW + border * 2,
          height: VH + border * 2,
          padding: border,
          borderRadius: 18 + border,
          background: '#FFFFFF',
          boxShadow: '0 40px 80px rgba(28,32,52,0.22), 0 4px 12px rgba(28,32,52,0.08)',
          transform: `translateY(${(1 - inP) * 80}px) rotate(${rot}deg) scale(${0.9 + 0.1 * inP})`,
          opacity: inP,
        }}
      >
        <div style={{position: 'relative', width: VW, height: VH, borderRadius: 16, overflow: 'hidden', background: '#0D1530'}}>
          <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} style={{position: 'absolute', inset: 0, filter: `brightness(${lerp(1.7, 1, dev)}) saturate(${lerp(0.2, 1, dev)})`}}>
            <defs>
              <linearGradient id="vsky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#14235C" />
                <stop offset="0.6" stopColor="#3A6BFF" />
                <stop offset="1" stopColor="#8FD8FF" />
              </linearGradient>
              <radialGradient id="vsun">
                <stop offset="0" stopColor="#FFF4D6" />
                <stop offset="1" stopColor="#FFC66B" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g transform={`translate(${VW / 2} ${VH / 2}) scale(${push}) translate(${-VW / 2} ${-VH / 2})`}>
              <g style={{filter: `brightness(${dim}) saturate(${1 - 0.4 * focus})`}}>
                <rect x={-200} y={-50} width={VW + 400} height={VH + 100} fill="url(#vsky)" />
                <circle cx={230 - t * 0.1} cy={150} r={110} fill="url(#vsun)" />
                <circle cx={230 - t * 0.1} cy={150} r={38} fill="#FFF1C9" />
                {[
                  [120, 90, 70],
                  [520, 60, 90],
                  [760, 120, 60],
                ].map(([x, y, r], i) => (
                  <g key={i} transform={`translate(${x + t * (0.6 + i * 0.2)} ${y})`} opacity={0.75}>
                    <ellipse rx={r} ry={r * 0.32} fill="#FFFFFF" />
                    <ellipse cx={r * 0.35} cy={-r * 0.18} rx={r * 0.5} ry={r * 0.3} fill="#FFFFFF" />
                  </g>
                ))}
                <path d={`M${-200 - t * 0.3} 360 C 100 250, 260 300, 420 270 S 760 240, ${1060 - t * 0.3} 320 L ${1060 - t * 0.3} 520 L ${-200 - t * 0.3} 520 Z`} fill="#2B3F8F" />
                <path d={`M${-200 - t * 0.7} 420 C 80 330, 300 400, 520 350 S 860 330, ${1100 - t * 0.7} 380 L ${1100 - t * 0.7} 520 L ${-200 - t * 0.7} 520 Z`} fill="#1E2F72" />
                <path d={`M${-200 - t * 1.2} 470 C 200 430, 500 460, ${1200 - t * 1.2} 440 L ${1200 - t * 1.2} 520 L ${-200 - t * 1.2} 520 Z`} fill="#141E4D" />
              </g>
              {/* character */}
              <g transform={`translate(560 ${500 + bob}) scale(${charScale}) rotate(${tilt * 0.3}) translate(-560 -500)`}>
                <path d="M462 520 C462 440 496 408 560 403 C624 408 658 440 658 520 Z" fill="#2563FF" />
                <path d="M462 520 C462 470 470 440 490 425 L 520 520 Z" fill="#1C4FD6" />
                <rect x={542} y={378} width={36} height={36} rx={10} fill="#E9B88E" />
                {/* waving hand */}
                <g transform={`rotate(${-20 + wave} 640 440)`}>
                  <rect x={630} y={360} width={30} height={90} rx={15} fill="#2563FF" />
                  <circle cx={645} cy={352} r={20} fill="#F4CDA5" />
                </g>
                <g transform={`rotate(${tilt} 560 330)`}>
                  <circle cx={560} cy={330} r={62} fill="#F4CDA5" />
                  <path d="M496 334 C490 270 528 250 565 250 C608 250 632 282 626 326 C612 300 588 290 562 292 C534 294 512 306 496 334 Z" fill="#2A1B3D" />
                  <ellipse cx={538} cy={338} rx={6.5} ry={8.5 * blink} fill="#2A1B3D" />
                  <ellipse cx={584} cy={338} rx={6.5} ry={8.5 * blink} fill="#2A1B3D" />
                  <circle cx={526} cy={358} r={9} fill="#FF8FA3" opacity={0.4} />
                  <circle cx={596} cy={358} r={9} fill="#FF8FA3" opacity={0.4} />
                  <path d="M546 364 Q561 376 576 364" stroke="#2A1B3D" strokeWidth={4} fill="none" strokeLinecap="round" />
                </g>
                <path d={`M512 402 Q560 428 608 402 L608 420 Q560 446 512 420 Z`} fill="#FF8A3D" />
                <path d={`M592 418 Q${612 + wave * 0.6} 456 ${604 + wave} 498 L588 498 Q594 458 576 424 Z`} fill="#FF7A2E" />
              </g>
              {/* focus brackets on "characters" */}
              <g opacity={focus} transform={`translate(560 380) scale(${lerp(1.3, 1, c)}) translate(-560 -380)`} stroke="#36D6FF" strokeWidth={5} fill="none" strokeLinecap="round">
                <path d="M450 250 v-30 h30" />
                <path d="M670 250 v-30 h-30" />
                <path d="M450 490 v30 h30" />
                <path d="M670 490 v30 h-30" />
              </g>
            </g>
          </svg>
          {/* badge: still image glyph → play glyph */}
          <div style={{position: 'absolute', left: 20, top: 20, width: 56, height: 56, borderRadius: 16, background: 'rgba(8,12,28,0.6)', border: '1px solid rgba(255,255,255,0.25)'}}>
            <svg width={56} height={56} viewBox="0 0 56 56" style={{position: 'absolute', inset: 0, opacity: 1 - v}}>
              <rect x={14} y={16} width={28} height={24} rx={4} fill="none" stroke="#FFFFFF" strokeWidth={2.5} />
              <path d="M16 37 L25 27 L31 33 L35 29 L40 37" stroke="#FFFFFF" strokeWidth={2.5} fill="none" strokeLinejoin="round" />
              <circle cx={34} cy={23} r={2.6} fill="#FFFFFF" />
            </svg>
            <svg width={56} height={56} viewBox="0 0 56 56" style={{position: 'absolute', inset: 0, opacity: v, transform: `scale(${0.6 + 0.4 * v})`}}>
              <path d="M22 17 L40 28 L22 39 Z" fill="#FFFFFF" />
            </svg>
          </div>
          {/* video timeline */}
          <div style={{position: 'absolute', left: 24, right: 24, bottom: 20, height: 34, opacity: v, transform: `translateY(${(1 - v) * 20}px)`}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 15, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.3)'}} />
            <div style={{position: 'absolute', left: 0, width: `${Math.min(100, t * 1.1)}%`, top: 15, height: 5, borderRadius: 3, background: 'linear-gradient(90deg, #36D6FF, #2E6BFF)'}} />
            <div style={{position: 'absolute', left: `calc(${Math.min(100, t * 1.1)}% - 9px)`, top: 8, width: 18, height: 18, borderRadius: 9, background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.4)'}} />
          </div>
        </div>
      </div>
    </div>
  );
};
