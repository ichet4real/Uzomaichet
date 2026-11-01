import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {C, FONT, FPS, ease, pop, prog} from './lib';
import {SceneEditor, SceneHow, SceneReady, SceneRenderTime, SceneTitle} from './Scenes';
import {ScreenBlock, ScreenCfg} from './Screen';

export const TOTAL_FRAMES = 52 * FPS;

/* -------- background -------- */
const Background: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${C.bg1}, ${C.bg2} 75%)`, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 300 + Math.sin(t * 0.4) * 250, top: 120 + Math.cos(t * 0.3) * 120,
      width: 900, height: 900, borderRadius: '50%', background: C.orange, opacity: 0.16, filter: 'blur(180px)'}} />
    <div style={{position: 'absolute', left: 1000 + Math.cos(t * 0.35) * 260, top: 380 + Math.sin(t * 0.45) * 140,
      width: 900, height: 900, borderRadius: '50%', background: C.cyan, opacity: 0.12, filter: 'blur(180px)'}} />
    <div style={{position: 'absolute', inset: -100,
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
      backgroundSize: '80px 80px', transform: `translate(${(t * 12) % 80}px, ${(t * 8) % 80}px)`,
      maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
      WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)'}} />
  </AbsoluteFill>
);

/* -------- MG scene wrapper with crossfade/zoom-blur -------- */
const Mg: React.FC<{t: number; a: number; b: number; children: React.ReactNode}> = ({t, a, b, children}) => {
  if (t < a - 0.05 || t > b + 0.05) return null;
  const i = prog(t, a, a + 0.35);
  const o = prog(t, b - 0.3, b, ease);
  return (
    <AbsoluteFill style={{opacity: Math.min(i * 1.3, 1) * (1 - o),
      transform: `scale(${1.06 - 0.06 * i - o * 0.06})`, filter: `blur(${(1 - i) * 10 + o * 10}px)`}}>
      {children}
    </AbsoluteFill>
  );
};

/* light streak at scene changes */
const Streak: React.FC<{t: number; at: number}> = ({t, at}) => {
  const p = prog(t, at - 0.2, at + 0.25, (x) => x);
  if (p <= 0 || p >= 1) return null;
  return (
    <div style={{position: 'absolute', top: -300, bottom: -300, width: 260, left: -400 + p * 2800,
      transform: 'rotate(18deg)', background: `linear-gradient(90deg, transparent, ${C.white}30, transparent)`}} />
  );
};

/* -------- screen block 1: Claude asks -> type render MP4 -> MP4 appears (12.1–25.9) -------- */
const screen1: ScreenCfg = {
  a: 12.1, b: 25.9,
  clips: [
    {a: 12.1, b: 18.1, src: 3.0, rate: 1},
    {a: 18.1, b: 20.5, src: 13.8, rate: 3.33},
    {a: 20.5, b: 25.9, src: 27.0, rate: 1},
  ],
  cams: [
    {t: 12.1, x: 960, y: 540, z: 1}, {t: 12.6, x: 960, y: 540, z: 1}, {t: 13.3, x: 830, y: 575, z: 1.6},
    {t: 17.9, x: 830, y: 575, z: 1.6}, {t: 18.4, x: 940, y: 880, z: 2.0}, {t: 20.3, x: 940, y: 880, z: 2.0},
    {t: 20.8, x: 960, y: 540, z: 1}, {t: 22.7, x: 960, y: 540, z: 1}, {t: 23.3, x: 823, y: 500, z: 1.35},
    {t: 25.9, x: 823, y: 500, z: 1.35},
  ],
  rings: [
    {a: 17.15, b: 18.2, x: 505, y: 578, w: 228, h: 64, label: 'As you can see here', labelSide: 'bottom'},
    {a: 18.3, b: 20.4, x: 452, y: 908, w: 970, h: 58, color: C.cyan},
    {a: 23.4, b: 25.9, x: 488, y: 310, w: 672, h: 377, color: C.cyan},
  ],
  clicks: [],
  headlines: [
    {a: 12.1, b: 18.1, tag: 'CLAUDE', text: <>asks: <span style={{color: C.amber}}>Render it to MP4 now?</span></>},
    {a: 18.1, b: 20.55, tag: 'YOU', color: C.cyan, text: <>just type <span style={{color: C.cyan}}>render MP4</span></>},
    {a: 20.55, b: 25.9, tag: 'RESULT', color: C.green, text: <>Your <span style={{color: C.green}}>MP4 video</span> is ready</>},
  ],
  extra: (t) => {
    const typed = 'render MP4';
    const n = Math.floor(Math.max(0, Math.min(1, (t - 18.3) / 1.2)) * typed.length);
    const cardIn = pop(t, 18.2, 13);
    const cardVis = 1 - prog(t, 20.3, 20.55);
    const enter = pop(t, 19.95, 10);
    const badges = [
      {t: 21.7, label: 'MP4 video', c: C.orange, icon: '🎬'},
      {t: 22.9, label: 'Viewable', c: C.cyan, icon: '▶'},
      {t: 23.6, label: 'Downloadable', c: C.green, icon: '⬇'},
    ];
    const allIn = pop(t, 25.0, 9);
    return (
      <>
        {t > 18.1 && t < 20.6 ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: 420, display: 'flex', justifyContent: 'center',
            opacity: cardVis * cardIn, transform: `scale(${0.7 + 0.3 * cardIn})`}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 26, padding: '34px 50px', borderRadius: 26,
              background: 'rgba(8,12,26,0.92)', border: `2px solid ${C.cyan}`, boxShadow: `0 0 60px ${C.cyan}55`,
              fontFamily: FONT}}>
              <div style={{fontSize: 70, fontWeight: 800, color: C.cyan}}>&gt;</div>
              <div style={{fontSize: 84, fontWeight: 800, color: C.white, minWidth: 470, fontFamily: "'DejaVu Sans Mono', monospace"}}>
                {typed.slice(0, n)}
                <span style={{opacity: Math.floor(t * 4) % 2 ? 1 : 0, color: C.cyan}}>|</span>
              </div>
              <div style={{padding: '14px 24px', borderRadius: 14, fontSize: 40, fontWeight: 900,
                background: enter > 0 ? C.cyan : 'rgba(255,255,255,0.1)', color: enter > 0 ? C.bg2 : C.dim,
                transform: `translateY(${enter > 0 && enter < 0.9 ? 6 : 0}px)`}}>⏎ Enter</div>
            </div>
          </div>
        ) : null}
        {t > 21.6 ? (
          <div style={{position: 'absolute', right: 120, top: 330, display: 'flex', flexDirection: 'column', gap: 24,
            fontFamily: FONT, opacity: 1 - prog(t, 25.55, 25.9)}}>
            {badges.map((b) => {
              const p = pop(t, b.t, 12);
              return (
                <div key={b.label} style={{display: 'flex', alignItems: 'center', gap: 16, padding: '18px 30px',
                  borderRadius: 18, background: 'rgba(8,12,26,0.9)', border: `2px solid ${b.c}`,
                  boxShadow: `0 0 40px ${b.c}44`, transform: `translateX(${(1 - p) * 200}px)`, opacity: p}}>
                  <div style={{width: 46, height: 46, borderRadius: 23, background: b.c, color: C.bg2,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900}}>{b.icon}</div>
                  <div style={{fontSize: 38, fontWeight: 800, color: C.white}}>{b.label}</div>
                </div>
              );
            })}
          </div>
        ) : null}
        {t > 25.0 ? (
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 110, display: 'flex', justifyContent: 'center',
            fontFamily: FONT}}>
            <div style={{padding: '18px 44px', borderRadius: 999, background: C.green, color: C.bg2, fontSize: 52,
              fontWeight: 900, transform: `scale(${allIn}) rotate(${(1 - allIn) * -8}deg)`,
              boxShadow: `0 0 60px ${C.green}88`}}>That is all ✓</div>
          </div>
        ) : null}
      </>
    );
  },
};

/* -------- screen block 2: three dots -> download -> save box -> name -> save (31.2–45.4) -------- */
const screen2: ScreenCfg = {
  a: 31.2, b: 45.4,
  clips: [
    {a: 31.2, b: 38.4, src: 33.4, rate: 1},
    {a: 38.4, b: 40.6, src: 53.1, rate: 2.05},
    {a: 40.6, b: 42.7, src: 59.3, rate: 2.48},
    {a: 42.7, b: 45.4, src: 72.5, rate: 2.15},
  ],
  cams: [
    {t: 31.2, x: 960, y: 540, z: 1}, {t: 31.9, x: 960, y: 540, z: 1}, {t: 32.6, x: 823, y: 500, z: 1.4},
    {t: 33.0, x: 823, y: 500, z: 1.4}, {t: 33.6, x: 1010, y: 560, z: 2.0}, {t: 38.25, x: 1010, y: 560, z: 2.0},
    {t: 38.7, x: 960, y: 540, z: 1}, {t: 39.0, x: 960, y: 540, z: 1}, {t: 39.5, x: 685, y: 385, z: 1.4},
    {t: 40.6, x: 685, y: 385, z: 1.4}, {t: 41.0, x: 560, y: 545, z: 2.1}, {t: 42.6, x: 560, y: 545, z: 2.1},
    {t: 43.0, x: 685, y: 385, z: 1.4}, {t: 45.4, x: 685, y: 385, z: 1.4},
  ],
  rings: [
    {a: 33.3, b: 35.6, x: 1107, y: 600, w: 40, h: 40, circle: true, label: 'Three dots', labelSide: 'right'},
    {a: 35.6, b: 38.35, x: 880, y: 458, w: 272, h: 60, color: C.cyan, label: 'Download', labelSide: 'top'},
    {a: 39.4, b: 40.65, x: 12, y: 4, w: 935, h: 656, color: C.amber, label: 'Save box', labelSide: 'right'},
    {a: 40.95, b: 42.7, x: 188, y: 515, w: 752, h: 32, color: C.cyan, label: 'Name your MP4', labelSide: 'bottom'},
    {a: 43.0, b: 44.4, x: 20, y: 150, w: 195, h: 340, color: C.amber, label: 'Any location', labelSide: 'right'},
    {a: 44.2, b: 45.4, x: 662, y: 612, w: 120, h: 34, color: C.green, label: 'Save', labelSide: 'bottom'},
  ],
  clicks: [
    {t: 35.4, x: 1127, y: 620},
    {t: 37.55, x: 990, y: 490},
    {t: 44.79, x: 722, y: 628},
  ],
  headlines: [
    {a: 31.2, b: 35.55, tag: 'EXPORT', text: <>Click the <span style={{color: C.orange}}>three dots ⋮</span></>},
    {a: 35.55, b: 38.4, tag: 'EXPORT', color: C.cyan, text: <>Hit <span style={{color: C.cyan}}>Download</span></>},
    {a: 38.4, b: 40.75, tag: 'SAVE', color: C.amber, text: <>The <span style={{color: C.amber}}>save box</span> pops up</>},
    {a: 40.75, b: 42.8, tag: 'SAVE', color: C.cyan, text: <><span style={{color: C.cyan}}>Name</span> your MP4 video</>},
    {a: 42.8, b: 45.4, tag: 'SAVE', color: C.green, text: <>Save it <span style={{color: C.green}}>anywhere</span> on your computer</>},
  ],
};

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const tagIn = prog(t, 3.0, 3.5) * (1 - prog(t, 50.3, 50.6));
  const fadeEnd = prog(t, 51.4, 52.0, (x) => x);
  return (
    <AbsoluteFill style={{fontFamily: FONT, background: C.bg2}}>
      <Background t={t} />
      <Mg t={t} a={0} b={3.2}><SceneTitle t={t} /></Mg>
      <Mg t={t} a={3.2} b={9.3}><SceneReady t={t} /></Mg>
      <Mg t={t} a={9.3} b={12.1}><SceneHow t={t} /></Mg>
      {t >= 12.0 && t <= 26.0 ? <ScreenBlock cfg={screen1} t={t} /> : null}
      <Mg t={t} a={25.9} b={31.2}><SceneRenderTime t={t} /></Mg>
      {t >= 31.1 && t <= 45.5 ? <ScreenBlock cfg={screen2} t={t} /> : null}
      <Mg t={t} a={45.4} b={52.2}><SceneEditor t={t} /></Mg>

      {[3.2, 9.3, 12.1, 25.9, 31.2, 45.4].map((at) => <Streak key={at} t={t} at={at} />)}

      {/* persistent corner tag */}
      <div style={{position: 'absolute', left: 50, top: 46, display: 'flex', alignItems: 'center', gap: 12,
        opacity: tagIn, transform: `translateX(${(1 - tagIn) * -40}px)`}}>
        <div style={{width: 12, height: 12, borderRadius: 6, background: C.orange, boxShadow: `0 0 12px ${C.orange}`}} />
        <div style={{fontSize: 22, fontWeight: 800, letterSpacing: 3, color: C.dim}}>
          STEP 08 <span style={{color: C.white}}>· RENDER &amp; EXPORT</span>
        </div>
      </div>

      <AbsoluteFill style={{background: '#000', opacity: fadeEnd}} />
      <Audio src={staticFile('voice.mp3')} />
    </AbsoluteFill>
  );
};
