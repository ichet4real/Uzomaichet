import React from 'react';
import {T} from '../timing';
import {calm, io, lerp, mix, spr} from '../lib/anim';

const S = 132;

/** A flat net folds into a floating cube, then morphs into a new form ("creative + unusual"). */
export const PikaDemo: React.FC<{frame: number; w: number; h: number}> = ({frame, w, h}) => {
  const n = spr(frame, T.pika, {damping: 16, stiffness: 150});
  const cu = T.creativeUnusual;
  const f = (d: number) => spr(frame, cu + d, {damping: 15, stiffness: 95});
  const fold = {top: f(0), left: f(3), right: f(5), bottom: f(7), back: f(11)};
  const all = spr(frame, cu, {damping: 22, stiffness: 70});
  const u = spr(frame, T.unusual, {damping: 13, stiffness: 110});
  const spin = Math.max(0, frame - cu) * 1.25 * all;
  const float = Math.sin(frame / 13) * 10 * all;
  const radius = lerp(18, S / 2, u);
  const explode = u * 22;
  const faceScale = 1 - 0.08 * u;
  const c1 = mix('#D9CFFF', '#FFD1B8', u);
  const c2 = mix('#8E7CFF', '#FF6F91', u);

  const face = (shade: number, motif = false): React.ReactNode => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: radius,
        transform: `translateZ(${explode}px) scale(${faceScale})`,
        background: `linear-gradient(145deg, ${c1}, ${c2})`,
        filter: `brightness(${shade})`,
        boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.45), inset 0 -18px 40px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {motif ? <div style={{width: S * 0.34, height: S * 0.34, borderRadius: '50%', background: 'rgba(255,255,255,0.75)', boxShadow: '0 6px 16px rgba(0,0,0,0.15)'}} /> : null}
    </div>
  );
  const hinge = (pos: React.CSSProperties, origin: string, transform: string, children: React.ReactNode) => (
    <div style={{position: 'absolute', width: S, height: S, transformStyle: 'preserve-3d', transformOrigin: origin, transform, ...pos}}>{children}</div>
  );

  const rx = lerp(16, -24, all);
  const ry = lerp(-6, 34, all) + spin;
  const ty = -0.5 * S * (1 - all) - 30 * all + float;

  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      {/* perspective floor */}
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, opacity: 0.5}}>
        {Array.from({length: 15}, (_, i) => (
          <line key={i} x1={w / 2} y1={h * 0.48} x2={w / 2 + (i - 7) * 170} y2={h + 40} stroke="rgba(255,255,255,0.10)" />
        ))}
        {Array.from({length: 6}, (_, i) => {
          const y = h * 0.48 + Math.pow((i + 1) / 6, 2) * (h * 0.52 + 40);
          return <line key={`h${i}`} x1={0} y1={y} x2={w} y2={y} stroke="rgba(255,255,255,0.08)" />;
        })}
      </svg>
      {/* contact shadow */}
      <div
        style={{
          position: 'absolute',
          left: w / 2 - 170,
          top: h * 0.82 - 30,
          width: 340,
          height: 60,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, rgba(0,0,0,${0.55 * n}) 0%, transparent 70%)`,
          transform: `scale(${1 - 0.15 * (float / 10)})`,
        }}
      />
      {/* placeholder before the reveal */}
      <div
        style={{
          position: 'absolute',
          left: w / 2 - S / 2,
          top: h / 2 - S / 2,
          width: S,
          height: S,
          borderRadius: 18,
          border: '2px dashed rgba(255,255,255,0.25)',
          opacity: 1 - n,
        }}
      />
      {/* orbit ring for the morphed form */}
      <div style={{position: 'absolute', left: w / 2, top: h / 2 - 10, perspective: 1200, opacity: u}}>
        <div
          style={{
            position: 'absolute',
            left: -230,
            top: -230,
            width: 460,
            height: 460,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.35)',
            transform: `rotateX(74deg) rotateZ(${frame * 2}deg) scale(${0.7 + 0.3 * u})`,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div key={i} style={{position: 'absolute', left: 230 + Math.cos(i * 2.09) * 230 - 9, top: 230 + Math.sin(i * 2.09) * 230 - 9, width: 18, height: 18, borderRadius: 9, background: i === 1 ? '#FF8FB1' : '#A99BFF'}} />
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: w / 2, top: h / 2, perspective: 1400}}>
        <div
          style={{
            position: 'absolute',
            left: -S / 2,
            top: -S / 2,
            width: S,
            height: S,
            transformStyle: 'preserve-3d',
            transformOrigin: `50% 50% ${-S / 2}px`,
            transform: `translateY(${ty}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${(0.6 + 0.4 * n) * (1 + 0.12 * u)})`,
            opacity: n,
          }}
        >
          {face(1.0, true)}
          {hinge({top: -S, left: 0}, 'bottom', `rotateX(${90 * fold.top}deg)`, face(1.12))}
          {hinge({top: 0, left: -S}, 'right', `rotateY(${-90 * fold.left}deg)`, face(0.86))}
          {hinge({top: 0, left: S}, 'left', `rotateY(${90 * fold.right}deg)`, face(0.94))}
          {hinge(
            {top: S, left: 0},
            'top',
            `rotateX(${-90 * fold.bottom}deg)`,
            <>
              {face(0.78)}
              {hinge({top: S, left: 0}, 'top', `rotateX(${-90 * fold.back}deg)`, face(0.9))}
            </>,
          )}
        </div>
      </div>
    </div>
  );
};
