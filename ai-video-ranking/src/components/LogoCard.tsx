import React from 'react';
import {Img} from 'remotion';
import {TOOLS, ToolId, rgba} from '../theme';

/** Uploaded logo on a light backing card (keeps original colours; dark logos stay legible). */
export const LogoCard: React.FC<{tool: ToolId; size: number; glow?: number; style?: React.CSSProperties}> = ({tool, size, glow = 0.5, style}) => {
  const t = TOOLS[tool];
  return (
    <div style={{position: 'relative', width: size, height: size, ...style}}>
      <div
        style={{
          position: 'absolute',
          inset: -size * 0.45,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${rgba(t.accent[0], 0.55 * glow)} 0%, ${rgba(t.accent[1], 0.25 * glow)} 35%, transparent 68%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: size * 0.24,
          background: 'linear-gradient(160deg, #FFFFFF 0%, #EEF1F6 100%)',
          boxShadow: `0 ${size * 0.1}px ${size * 0.28}px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,1), inset 0 -2px 0 rgba(0,0,0,0.06)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Img src={t.logo} style={{width: size * 0.68, height: size * 0.68, objectFit: 'contain'}} />
      </div>
    </div>
  );
};
