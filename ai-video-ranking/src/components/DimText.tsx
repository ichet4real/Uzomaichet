import React from 'react';
import {FONT, rgba} from '../theme';
import {mix} from '../lib/anim';

/** Large dimensional text for a light page: tinted extrusion + gradient face + optional light sweep (0..1). */
export const DimText: React.FC<{
  text: string;
  size: number;
  colors: [string, string];
  depth?: number;
  sweep?: number;
  style?: React.CSSProperties;
}> = ({text, size, colors, depth = 12, sweep, style}) => {
  const shade = mix(colors[1], '#1A1030', 0.45);
  const ext = Array.from({length: depth}, (_, i) => `${(i + 1) * 0.5}px ${i + 1}px 0 ${shade}`).join(',');
  const base: React.CSSProperties = {
    fontFamily: FONT.display,
    fontWeight: 900,
    fontSize: size,
    lineHeight: 1,
    letterSpacing: '-0.04em',
    whiteSpace: 'nowrap',
  };
  return (
    <div style={{position: 'relative', display: 'inline-block', ...style}}>
      <div style={{...base, color: shade, textShadow: `${ext}, ${depth * 0.6}px ${depth + 24}px 40px ${rgba('#1C2034', 0.2)}, 0 0 70px ${rgba(colors[0], 0.25)}`}}>{text}</div>
      <div
        style={{
          ...base,
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(165deg, ${mix(colors[0], '#FFFFFF', 0.35)} 0%, ${colors[0]} 40%, ${colors[1]} 100%)`,
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {text}
      </div>
      {sweep !== undefined && sweep > 0 && sweep < 1 ? (
        <div
          style={{
            ...base,
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.95) 50%, transparent 65%)',
            backgroundSize: '300% 100%',
            backgroundPosition: `${100 - sweep * 100}% 0`,
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {text}
        </div>
      ) : null}
    </div>
  );
};
