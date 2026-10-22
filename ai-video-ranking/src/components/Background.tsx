import React from 'react';
import {AbsoluteFill, interpolateColors} from 'remotion';
import {T} from '../timing';

// Soft pastel blooms on a light page; tint follows the tool on screen.
const KEYS = [0, T.rank5, T.rank4, T.rank3, T.rank2, T.myNumber, T.useCases, T.finalBoard];
const A = ['#C4B5FD', '#E9B8FF', '#C9C2FF', '#A8E3FF', '#FFD0A8', '#A5F0F5', '#D6CCFF', '#B9F3E4'];
const B = ['#FFC8DD', '#FFD3B5', '#FFC6D9', '#BFD3FF', '#FFC2CF', '#D9F7B0', '#BDEBFF', '#FFE3A8'];

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
  const dx = Math.sin(frame / 70) * 50;
  const dy = Math.cos(frame / 90) * 30;
  return (
    <AbsoluteFill style={{background: '#F5F6F8', overflow: 'hidden'}}>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 70% 60% at 50% 45%, #FFFFFF 0%, #F5F6F8 75%)'}} />
      <div style={{position: 'absolute', left: 1150 + dx, top: -320 + dy, width: 1100, height: 1100, borderRadius: '50%', background: `radial-gradient(circle, ${a} 0%, transparent 62%)`, opacity: 0.45}} />
      <div style={{position: 'absolute', left: -460 - dx, top: 420 - dy, width: 1100, height: 1100, borderRadius: '50%', background: `radial-gradient(circle, ${b} 0%, transparent 62%)`, opacity: 0.4}} />
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0, opacity: 0.035}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1920" height="1080" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
