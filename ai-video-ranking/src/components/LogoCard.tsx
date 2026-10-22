import React from 'react';
import {Img} from 'remotion';
import {TOOLS, ToolId, rgba} from '../theme';

/** Uploaded logo on a white floating card with a pastel halo (original logo colours untouched). */
export const LogoCard: React.FC<{tool: ToolId; size: number; glow?: number; style?: React.CSSProperties}> = ({tool, size, glow = 0.5, style}) => {
  const t = TOOLS[tool];
  return (
    <div style={{position: 'relative', width: size, height: size, ...style}}>
      <div
        style={{
          position: 'absolute',
          inset: -size * 0.5,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${rgba(t.accent[0], 0.42 * glow)} 0%, ${rgba(t.accent[1], 0.2 * glow)} 38%, transparent 68%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: size * 0.26,
          background: '#FFFFFF',
          border: '1px solid rgba(14,16,20,0.06)',
          boxShadow: `0 ${size * 0.1}px ${size * 0.26}px rgba(28,32,52,0.16), 0 2px 6px rgba(28,32,52,0.06)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Img src={t.logo} style={{width: size * 0.66, height: size * 0.66, objectFit: 'contain'}} />
      </div>
    </div>
  );
};
