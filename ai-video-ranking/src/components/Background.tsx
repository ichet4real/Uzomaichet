import React from 'react';
import {AbsoluteFill, interpolateColors} from 'remotion';
import {T} from '../timing';

// Scene accent pairs drive the soft glow blooms (Klarna-style colour halos, on charcoal).
const KEYS = [0, T.rank5, T.rank4, T.rank3, T.rank2, T.myNumber, T.useCases, T.finalBoard];
const A = ['#22D3EE', '#C85CF0', '#9D8CFF', '#2E8BFF', '#FF7A3D', '#14E6F0', '#8B5CF6', '#14E6F0'];
const B = ['#8B5CF6', '#FF9A5A', '#FF8FB1', '#36D6FF', '#E8445F', '#B6F24A', '#22D3EE', '#8B5CF6'];

const track = (frame: number, cols: string[]) => {
  const input: number[] = [0];
  const output: string[] = [cols[0]];
  for (let i = 1; i < KEYS.length; i++) {
    input.push(KEYS[i], KEYS[i] + 24);
    output.push(cols[i - 1], cols[i]);
  }
  return interpolateColors(frame, input, output);
};

export const Background: React.FC<{frame: number}> = ({frame}) => {
  const a = track(frame, A);
  const b = track(frame, B);
  const dx = Math.sin(frame / 70) * 60;
  const dy = Math.cos(frame / 90) * 40;
  return (
    <AbsoluteFill style={{background: '#0A0C11', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 50% 40%, #151924 0%, #0A0C11 70%)'}} />
      <div style={{position: 'absolute', left: 1200 + dx, top: -260 + dy, width: 1100, height: 1100, borderRadius: '50%', background: `radial-gradient(circle, ${a} 0%, transparent 62%)`, opacity: 0.22}} />
      <div style={{position: 'absolute', left: -420 - dx, top: 380 - dy, width: 1100, height: 1100, borderRadius: '50%', background: `radial-gradient(circle, ${b} 0%, transparent 62%)`, opacity: 0.16}} />
      {/* fine grid, faded toward edges */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          backgroundPosition: '0 0',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 50% 50%, black 20%, transparent 80%)',
        }}
      />
      {/* static film grain (deterministic SVG noise) */}
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1920" height="1080" filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 75% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};
