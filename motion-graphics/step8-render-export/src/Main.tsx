import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {C, Card, FONT, FPS, GreenPill, HL_BLUE, HL_GREEN, HL_PINK, HL_YELLOW, Pill, SHADOW, ease, pop, prog} from './lib';
import {SceneEditor, SceneHow, SceneReady, SceneRenderTime, SceneTitle} from './Scenes';
import {Hl, ScreenBlock, ScreenCfg} from './Screen';

export const TOTAL_FRAMES = 52 * FPS;

/* -------- white background with soft drifting pastel blobs (series style) -------- */
const Blob: React.FC<{x: number; y: number; s: number; c: string; o?: number}> = ({x, y, s, c, o = 0.5}) => (
  <div style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%',
    background: `radial-gradient(circle, ${c} 0%, ${c}00 68%)`, opacity: o}} />
);
const Background: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
    <Blob x={560 + Math.sin(t * 0.35) * 220} y={420 + Math.cos(t * 0.3) * 120} s={1100} c="#C7B8FF" o={0.55} />
    <Blob x={1350 + Math.cos(t * 0.28) * 200} y={330 + Math.sin(t * 0.4) * 110} s={900} c="#FFE08A" o={0.5} />
    <Blob x={1250 + Math.sin(t * 0.32) * 240} y={760 + Math.cos(t * 0.36) * 90} s={1000} c="#FFB8CC" o={0.45} />
    <Blob x={480 + Math.cos(t * 0.3) * 180} y={860 + Math.sin(t * 0.33) * 80} s={1000} c="#A9D2FF" o={0.5} />
    <Blob x={900 + Math.sin(t * 0.25) * 200} y={960 + Math.cos(t * 0.27) * 60} s={850} c="#B4F0C6" o={0.5} />
    {/* white wash keeps the overall look white */}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, rgba(255,255,255,0.55), rgba(255,255,255,0.25) 70%)'}} />
  </AbsoluteFill>
);

const Mg: React.FC<{t: number; a: number; b: number; children: React.ReactNode}> = ({t, a, b, children}) => {
  if (t < a - 0.05 || t > b + 0.05) return null;
  const i = prog(t, a, a + 0.35);
  const o = prog(t, b - 0.3, b, ease);
  return (
    <AbsoluteFill style={{opacity: Math.min(i * 1.3, 1) * (1 - o), filter: `blur(${(1 - i) * 10 + o * 14}px)`,
      transform: `scale(${1.03 - 0.03 * i - o * 0.03})`}}>
      {children}
    </AbsoluteFill>
  );
};

/* -------- screen block 1 (12.1–25.9) -------- */
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
    {a: 18.3, b: 20.4, x: 452, y: 908, w: 970, h: 58, color: C.blue},
    {a: 23.4, b: 25.9, x: 488, y: 310, w: 672, h: 377, color: C.green},
  ],
  clicks: [],
  headlines: [
    {a: 12.1, b: 18.1, tag: 'Claude asks', text: <>Render it to <Hl c={HL_PINK}>MP4</Hl> now?</>},
    {a: 18.1, b: 20.55, tag: 'You type', color: '#9CC2FF', text: <>Just type <Hl c={HL_BLUE}>render MP4</Hl></>},
    {a: 20.55, b: 25.9, tag: 'Result', color: '#8CE6AE', text: <>Your <Hl c={HL_GREEN}>MP4 video</Hl> is ready</>},
  ],
  extra: (t) => {
    const typed = 'render MP4';
    const n = Math.floor(Math.max(0, Math.min(1, (t - 18.3) / 1.2)) * typed.length);
    const cardIn = pop(t, 18.2, 14);
    const cardVis = 1 - prog(t, 20.3, 20.55);
    const enter = t >= 19.95;
    const badges = [
      {t: 21.7, label: 'MP4 video', icon: '▶', bg: '#FFE3EA'},
      {t: 22.9, label: 'Viewable', icon: '👁', bg: C.blueSoft},
      {t: 23.6, label: 'Downloadable', icon: '⬇', bg: C.greenSoft},
    ];
    const allIn = pop(t, 25.0, 11);
    return (
      <>
        {t > 18.1 && t < 20.6 ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: 380, display: 'flex', justifyContent: 'center',
            opacity: cardVis * cardIn, transform: `scale(${0.8 + 0.2 * cardIn})`, filter: `blur(${(1 - cardIn) * 10}px)`}}>
            <Card style={{padding: '30px 34px', width: 900, boxSizing: 'border-box', fontFamily: FONT}}>
              <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 24, fontWeight: 700, color: C.ink}}>
                <div style={{width: 18, height: 18, borderRadius: 9, background: C.purple}} />
                Type in the chat
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: 18, marginTop: 20}}>
                <div style={{flex: 1, background: C.ink, color: '#fff', borderRadius: 16, padding: '18px 26px', fontSize: 64,
                  fontWeight: 700, letterSpacing: -1}}>
                  {typed.slice(0, n)}<span style={{opacity: Math.floor(t * 4) % 2 ? 1 : 0}}>|</span>
                </div>
                <div style={{width: 96, height: 96, borderRadius: 48, background: enter ? C.green : '#EEEEF2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, color: enter ? '#fff' : C.sub,
                  fontWeight: 800, transform: `scale(${enter ? 0.92 + 0.08 * pop(t, 19.95, 9) : 1})`}}>↑</div>
              </div>
            </Card>
          </div>
        ) : null}
        {t > 21.6 ? (
          <div style={{position: 'absolute', right: 90, top: 360, display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
            gap: 22, opacity: 1 - prog(t, 25.55, 25.9)}}>
            {badges.map((b) => {
              const p = pop(t, b.t, 13);
              return (
                <div key={b.label} style={{transform: `translateX(${(1 - p) * 160}px)`, opacity: p, filter: `blur(${(1 - p) * 8}px)`}}>
                  <Pill icon={b.icon} iconBg={b.bg} size={36}>{b.label}</Pill>
                </div>
              );
            })}
          </div>
        ) : null}
        {t > 25.0 ? (
          <div style={{position: 'absolute', left: 0, right: 0, bottom: 90, display: 'flex', justifyContent: 'center',
            transform: `scale(${allIn})`}}>
            <GreenPill size={46}>That is all</GreenPill>
          </div>
        ) : null}
      </>
    );
  },
};

/* -------- screen block 2 (31.2–45.4) -------- */
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
    {a: 35.6, b: 38.35, x: 880, y: 458, w: 272, h: 60, color: C.blue, label: 'Download', labelSide: 'top'},
    {a: 39.4, b: 40.65, x: 12, y: 4, w: 935, h: 656, color: C.purple, label: 'Save box', labelSide: 'right'},
    {a: 40.95, b: 42.7, x: 188, y: 515, w: 752, h: 32, color: C.blue, label: 'Name your MP4', labelSide: 'bottom'},
    {a: 43.0, b: 44.4, x: 20, y: 150, w: 195, h: 340, color: C.purple, label: 'Any location', labelSide: 'right'},
    {a: 44.2, b: 45.4, x: 662, y: 612, w: 120, h: 34, color: C.green, label: 'Save', labelSide: 'bottom'},
  ],
  clicks: [
    {t: 35.4, x: 1127, y: 620},
    {t: 37.55, x: 990, y: 490},
    {t: 44.79, x: 722, y: 628},
  ],
  headlines: [
    {a: 31.2, b: 35.55, tag: 'Export', text: <>Click the <Hl c={HL_PINK}>three dots</Hl></>},
    {a: 35.55, b: 38.4, tag: 'Export', color: '#9CC2FF', text: <>Hit <Hl c={HL_BLUE}>Download</Hl></>},
    {a: 38.4, b: 40.75, tag: 'Save', color: '#C7B8FF', text: <>The <Hl c={HL_YELLOW}>save box</Hl> pops up</>},
    {a: 40.75, b: 42.8, tag: 'Save', color: '#9CC2FF', text: <><Hl c={HL_BLUE}>Name</Hl> your MP4 video</>},
    {a: 42.8, b: 45.4, tag: 'Save', color: '#8CE6AE', text: <>Save it <Hl c={HL_GREEN}>anywhere</Hl> on your computer</>},
  ],
};

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const fadeEnd = prog(t, 51.4, 52.0, (x) => x);
  return (
    <AbsoluteFill style={{fontFamily: FONT, background: C.bg}}>
      <Background t={t} />
      <Mg t={t} a={0} b={3.2}><SceneTitle t={t} /></Mg>
      <Mg t={t} a={3.2} b={9.3}><SceneReady t={t} /></Mg>
      <Mg t={t} a={9.3} b={12.1}><SceneHow t={t} /></Mg>
      {t >= 12.0 && t <= 26.0 ? <ScreenBlock cfg={screen1} t={t} /> : null}
      <Mg t={t} a={25.9} b={31.2}><SceneRenderTime t={t} /></Mg>
      {t >= 31.1 && t <= 45.5 ? <ScreenBlock cfg={screen2} t={t} /> : null}
      <Mg t={t} a={45.4} b={52.2}><SceneEditor t={t} /></Mg>
      <AbsoluteFill style={{background: '#fff', opacity: fadeEnd}} />
      <Audio src={staticFile('voice.mp3')} />
    </AbsoluteFill>
  );
};

export {SHADOW};
