import React from 'react';
import {interpolate} from 'remotion';
import {
  BlurWords, C, Card, Check, FONT, GRAD, GreenPill, HL_BLUE, HL_GREEN, HL_PINK, HL_YELLOW, IconBox, IconDownload,
  IconFilm, IconGear, IconLaptop, IconScissors, Mp4File, Pill, SHADOW, StepChip, ease, pop, prog,
} from './lib';

const center: React.CSSProperties = {
  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT,
};

/* ================= A: Title (0 – 3.2s) ================= */
export const SceneTitle: React.FC<{t: number}> = ({t}) => {
  const chip = pop(t, 0.3, 13);
  const tiles = [
    {bg: C.purpleSoft, el: <IconGear s={34} c={C.purple} rot={t * 90} />},
    {bg: '#FFE3EA', el: <IconFilm s={40} c={C.pinkDeep} />},
    {bg: C.greenSoft, el: <IconDownload s={36} c={C.green} />},
    {bg: C.yellowSoft, el: <Check size={36} p={1} color={C.yellow} />},
  ];
  return (
    <div style={{...center, flexDirection: 'column', gap: 46}}>
      <div style={{transform: `scale(${0.6 + 0.4 * chip}) translateY(${(1 - chip) * 30}px)`, opacity: chip}}>
        <StepChip n="08" scale={1.25} />
      </div>
      <BlurWords t={t} size={128} words={[
        {w: 'Render', t: 1.4}, {w: '&', t: 1.6}, {w: 'export', t: 1.78, hl: HL_PINK}, {w: 'the', t: 2.1}, {w: 'video.', t: 2.25},
      ]} />
      <div style={{display: 'flex', gap: 26}}>
        {tiles.map((x, i) => {
          const p = pop(t, 2.35 + i * 0.08, 11);
          return (
            <div key={i} style={{width: 78, height: 78, borderRadius: 22, background: '#fff', boxShadow: SHADOW,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p}) translateY(${(1 - p) * 30}px)`}}>
              <div style={{width: 58, height: 58, borderRadius: 16, background: x.bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center'}}>{x.el}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ================= B: Ready check (3.2 – 9.3s) ================= */
export const SceneReady: React.FC<{t: number}> = ({t}) => {
  const p1Out = prog(t, 7.3, 7.7, ease);
  const editIn = pop(t, 3.55, 15);
  const bars = ['#C9BFFF', '#FFC6D6', '#BFDBFF', '#BDF0CF', '#FFE29A'];
  const rows = [[260, 150, 190], [180, 90, 240], [220, 170, 120]];
  const cut = prog(t, 4.0, 4.6);
  const checkP = prog(t, 4.5, 5.0);
  const ifAny = pop(t, 5.0, 12);
  const ringIn = pop(t, 5.4, 14);
  const pct = prog(t, 5.7, 6.9, ease);
  const satisfied = pop(t, 6.75, 11);

  const renderIn = pop(t, 8.0, 13);
  const arrow = prog(t, 8.35, 8.75);
  const exportIn = pop(t, 8.6, 13);
  const R = 165;
  return (
    <div style={center}>
      <div style={{display: 'flex', gap: 70, alignItems: 'center', opacity: 1 - p1Out,
        filter: `blur(${p1Out * 16}px)`, transform: `translateY(${-p1Out * 80}px) scale(${1 - p1Out * 0.08})`}}>
        <Card style={{width: 700, height: 470, padding: 44, boxSizing: 'border-box', opacity: editIn,
          transform: `translateY(${(1 - editIn) * 80}px)`, filter: `blur(${(1 - editIn) * 12}px)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
            <IconBox bg={C.yellowSoft} size={70}><IconScissors s={44} open={Math.sin(t * 10) * 0.5 + 0.5} /></IconBox>
            <div>
              <div style={{fontSize: 40, fontWeight: 800, color: C.ink, letterSpacing: -1}}>Your edits</div>
              <div style={{fontSize: 22, fontWeight: 500, color: C.sub}}>timeline</div>
            </div>
          </div>
          <div style={{marginTop: 38, display: 'flex', flexDirection: 'column', gap: 16}}>
            {rows.map((r, ri) => (
              <div key={ri} style={{display: 'flex', gap: 10, height: 40}}>
                {r.map((w, i) => (
                  <div key={i} style={{width: ri === 1 && i === 1 ? w * (1 - cut * 0.6) : w, borderRadius: 10,
                    background: bars[(ri * 2 + i) % bars.length]}} />
                ))}
              </div>
            ))}
          </div>
          <div style={{marginTop: 40, display: 'flex', alignItems: 'center', gap: 16}}>
            <Check size={50} p={checkP} />
            <div style={{fontSize: 34, fontWeight: 700, color: C.ink, opacity: 0.35 + 0.65 * checkP}}>Edits done</div>
            <div style={{marginLeft: 8, padding: '8px 20px', borderRadius: 999, background: '#F1F1F4', color: C.sub,
              fontSize: 26, fontWeight: 600, opacity: ifAny, transform: `scale(${0.6 + 0.4 * ifAny})`}}>if any</div>
          </div>
        </Card>

        <Card style={{width: 470, height: 470, position: 'relative', opacity: ringIn,
          transform: `scale(${0.7 + 0.3 * ringIn})`, filter: `blur(${(1 - ringIn) * 12}px)`}}>
          <svg width={470} height={470} style={{position: 'absolute'}}>
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={C.purple} />
                <stop offset="0.55" stopColor={C.pinkDeep} />
                <stop offset="1" stopColor={C.peach} />
              </linearGradient>
            </defs>
            <circle cx={235} cy={225} r={R} fill="none" stroke="#F0F0F3" strokeWidth={26} />
            <circle cx={235} cy={225} r={R} fill="none" stroke={pct >= 1 ? C.green : 'url(#rg)'} strokeWidth={26}
              strokeLinecap="round" strokeDasharray={2 * Math.PI * R} strokeDashoffset={2 * Math.PI * R * (1 - pct)}
              transform="rotate(-90 235 225)" />
          </svg>
          <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontSize: 120, fontWeight: 800,
            color: C.ink, letterSpacing: -5}}>
            {Math.round(pct * 100)}<span style={{fontSize: 60}}>%</span>
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, bottom: -30, display: 'flex', justifyContent: 'center',
            opacity: satisfied, transform: `translateY(${(1 - satisfied) * 20}px) scale(${0.7 + 0.3 * satisfied})`}}>
            <GreenPill size={32}>Satisfied</GreenPill>
          </div>
        </Card>
      </div>

      <div style={{...center, flexDirection: 'column', gap: 60}}>
        <BlurWords t={t} size={64} color={C.sub} words={[{w: "It's", t: 7.62}, {w: 'time', t: 7.72}, {w: 'to…', t: 7.82}]} />
        <div style={{display: 'flex', alignItems: 'center', gap: 36}}>
          <Card style={{width: 500, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30,
            transform: `scale(${0.7 + 0.3 * renderIn})`, opacity: renderIn, filter: `blur(${(1 - renderIn) * 12}px)`}}>
            <IconBox bg={C.yellowSoft} size={110}><IconGear s={70} rot={t * 120} /></IconBox>
            <div style={{fontSize: 72, fontWeight: 800, color: C.ink, letterSpacing: -2}}>Render</div>
          </Card>
          <svg width={150} height={60}>
            <path d="M5 30 H132" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeDasharray={130}
              strokeDashoffset={130 * (1 - arrow)} />
            <path d="M112 10 L140 30 L112 50" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round"
              strokeLinejoin="round" opacity={arrow} />
          </svg>
          <Card style={{width: 500, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 30,
            transform: `scale(${0.7 + 0.3 * exportIn})`, opacity: exportIn, filter: `blur(${(1 - exportIn) * 12}px)`}}>
            <IconBox bg={C.blueSoft} size={110}><IconDownload s={66} c={C.blue} dy={Math.sin(t * 8) * 4} /></IconBox>
            <div style={{fontSize: 72, fontWeight: 800, color: C.ink, letterSpacing: -2}}>Export</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

/* ================= C: How? Very simple (9.3 – 12.1s) ================= */
export const SceneHow: React.FC<{t: number}> = ({t}) => {
  const out = prog(t, 10.75, 11.1, ease);
  const chk = pop(t, 11.1, 11);
  return (
    <div style={center}>
      <div style={{position: 'absolute', opacity: 1 - out, filter: `blur(${out * 20}px)`, transform: `scale(${1 - out * 0.1})`, width: 1600}}>
        <BlurWords t={t} size={140} words={[
          {w: 'How', t: 9.57}, {w: 'do', t: 9.75}, {w: 'we', t: 9.85}, {w: 'go', t: 9.98}, {w: 'about', t: 10.1}, {w: 'it?', t: 10.32, hl: HL_PINK},
        ]} />
      </div>
      <div style={{...center, flexDirection: 'column', gap: 40}}>
        <div style={{transform: `scale(${chk})`, opacity: chk}}>
          <GreenPill size={40}>Easy</GreenPill>
        </div>
        <BlurWords t={t} size={190} words={[{w: 'Very', t: 11.09}, {w: 'simple.', t: 11.3, hl: HL_GREEN}]} />
      </div>
    </div>
  );
};

/* ================= G: Rendering time (25.9 – 31.2s) ================= */
export const SceneRenderTime: React.FC<{t: number}> = ({t}) => {
  const comp = pop(t, 26.95, 13);
  const plus = pop(t, 27.85, 11);
  const proj = pop(t, 28.1, 13);
  const up = prog(t, 28.95, 29.5, ease);
  const rc = pop(t, 29.15, 15);
  const fill = prog(t, 29.4, 30.75, ease);
  const done = t >= 30.75;
  const ok = pop(t, 30.8, 11);
  const headOut = prog(t, 28.95, 29.35, ease);
  return (
    <div style={center}>
      <div style={{position: 'absolute', top: 150, left: 0, right: 0, opacity: 1 - headOut, filter: `blur(${headOut * 14}px)`}}>
        <BlurWords t={t} size={84} words={[
          {w: 'Rendering', t: 26.17}, {w: 'time', t: 26.35}, {w: 'depends', t: 26.5, hl: HL_YELLOW}, {w: 'on…', t: 26.75},
        ]} />
      </div>

      <div style={{display: 'flex', alignItems: 'center', gap: 50, marginTop: 120,
        transform: `translateY(${-up * 330}px) scale(${1 - up * 0.42})`}}>
        <Card style={{width: 460, height: 340, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 26, opacity: comp, transform: `translateY(${(1 - comp) * 80}px)`,
          filter: `blur(${(1 - comp) * 12}px)`}}>
          <IconBox bg={C.blueSoft} size={150}><IconLaptop s={110} c={C.blue} /></IconBox>
          <div style={{fontSize: 44, fontWeight: 800, color: C.ink, letterSpacing: -1}}>Your computer</div>
        </Card>
        <div style={{fontSize: 100, fontWeight: 300, color: C.faint, transform: `scale(${plus})`}}>+</div>
        <Card style={{width: 460, height: 340, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 26, opacity: proj, transform: `translateY(${(1 - proj) * 80}px)`,
          filter: `blur(${(1 - proj) * 12}px)`}}>
          <IconBox bg="#FFE3EA" size={150}><IconFilm s={110} c={C.pinkDeep} /></IconBox>
          <div style={{fontSize: 44, fontWeight: 800, color: C.ink, letterSpacing: -1}}>The project</div>
        </Card>
      </div>

      {/* series-style render card */}
      <Card style={{position: 'absolute', top: 470, width: 820, padding: '40px 46px', boxSizing: 'border-box',
        opacity: rc, transform: `translateY(${(1 - rc) * 80}px)`, filter: `blur(${(1 - rc) * 12}px)`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <IconBox bg={C.yellowSoft} size={62}><IconDownload s={38} c="#D9A400" /></IconBox>
          <div>
            <div style={{fontSize: 36, fontWeight: 800, color: C.ink, letterSpacing: -1}}>Render &amp; Export</div>
            <div style={{fontSize: 22, color: C.sub, fontWeight: 500}}>your_video.mp4</div>
          </div>
        </div>
        <div style={{display: 'flex', gap: 12, marginTop: 24}}>
          {['MP4', '1920×1080', '16:9', '30 fps'].map((x) => (
            <div key={x} style={{padding: '6px 16px', borderRadius: 999, background: '#F1F1F4', fontSize: 22, fontWeight: 600,
              color: C.ink}}>{x}</div>
          ))}
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 30, fontSize: 28, fontWeight: 600,
          color: done ? C.green : C.ink}}>
          <div>{done ? 'Process finished' : 'Rendering…'}</div>
          <div style={{color: C.ink}}>{Math.round(fill * 100)}%</div>
        </div>
        <div style={{height: 14, borderRadius: 7, background: '#EEEEF2', marginTop: 14, overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${fill * 100}%`, borderRadius: 7, background: done ? C.green : GRAD}} />
        </div>
      </Card>
      <div style={{position: 'absolute', top: 880, opacity: ok, transform: `scale(${0.6 + 0.4 * ok})`}}>
        <GreenPill size={38}>Let it finish</GreenPill>
      </div>
    </div>
  );
};

/* ================= J: Use it in your editor (45.4 – 52s) ================= */
export const SceneEditor: React.FC<{t: number}> = ({t}) => {
  const note = pop(t, 45.6, 12);
  const file = pop(t, 45.85, 14);
  const editor = pop(t, 47.35, 15);
  const fly = prog(t, 48.2, 49.0, ease);
  const landed = pop(t, 48.95, 12);
  const ifNec = pop(t, 49.75, 12);
  const endOut = prog(t, 50.3, 50.7, ease);
  const end = pop(t, 50.55, 13);

  const baseX = interpolate(prog(t, 47.3, 47.9, ease), [0, 1], [960, 470]);
  const cx = interpolate(fly, [0, 1], [baseX, 1190]);
  const cy = interpolate(fly, [0, 1], [560, 760]) - Math.sin(fly * Math.PI) * 180;
  const fs = interpolate(fly, [0, 1], [1, 0.3]);
  const playhead = prog(t, 49.0, 50.4, (x) => x);
  const bars = Array.from({length: 60}).map((_, i) => 6 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)) * 30);
  return (
    <div style={center}>
      <div style={{...center, opacity: 1 - endOut, filter: `blur(${endOut * 16}px)`, transform: `scale(${1 - endOut * 0.06})`}}>
        <div style={{position: 'absolute', top: 120, transform: `scale(${note})`, opacity: note}}>
          <Pill icon="✎" iconBg={C.yellowSoft} size={32}>Note</Pill>
        </div>

        {/* editor mock */}
        <Card style={{position: 'absolute', left: 820, top: 250, width: 920, height: 620, overflow: 'hidden',
          opacity: editor, transform: `translateX(${(1 - editor) * 200}px)`, filter: `blur(${(1 - editor) * 12}px)`}}>
          <div style={{height: 60, display: 'flex', alignItems: 'center', gap: 10, padding: '0 24px', borderBottom: `1px solid ${C.line}`}}>
            {['#FF6B6B', '#FFC93C', '#22C55E'].map((c) => <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c}} />)}
            <div style={{marginLeft: 14, color: C.ink, fontSize: 24, fontWeight: 700}}>Video editor</div>
          </div>
          <div style={{height: 300, margin: 22, borderRadius: 16, background: `radial-gradient(ellipse at 50% 40%, #1A2650, ${C.navy})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg width={80} height={80} viewBox="0 0 90 90" style={{opacity: 0.35 + 0.65 * landed}}>
              <circle cx={45} cy={45} r={40} fill="none" stroke="#5BE3F0" strokeWidth={3} />
              <path d="M37 29 L61 45 L37 61 Z" fill="#5BE3F0" />
            </svg>
          </div>
          <div style={{position: 'relative', margin: '0 22px'}}>
            {['VIDEO', 'VOICE'].map((tr) => (
              <div key={tr} style={{display: 'flex', alignItems: 'center', gap: 16, height: 70}}>
                <div style={{width: 80, color: C.sub, fontSize: 18, fontWeight: 700, letterSpacing: 1}}>{tr}</div>
                <div style={{flex: 1, height: 46, borderRadius: 10, background: '#F4F4F7', position: 'relative', overflow: 'hidden'}}>
                  {tr === 'VIDEO' ? (
                    <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${78 * landed}%`, borderRadius: 10,
                      background: '#FFB3C7', display: 'flex', alignItems: 'center', paddingLeft: 16, color: C.ink, fontWeight: 700,
                      fontSize: 20, whiteSpace: 'nowrap', overflow: 'hidden'}}>video sample1.mp4</div>
                  ) : (
                    <div style={{position: 'absolute', left: 8, top: 0, bottom: 0, display: 'flex', alignItems: 'center', gap: 4,
                      width: `${78 * landed}%`, overflow: 'hidden'}}>
                      {bars.map((h, i) => <div key={i} style={{width: 6, height: h, borderRadius: 2, background: C.ink, flex: 'none'}} />)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div style={{position: 'absolute', top: 6, bottom: 6, left: 96 + playhead * 640, width: 3, background: C.ink, opacity: landed}} />
          </div>
        </Card>

        {/* the MP4 file */}
        <div style={{position: 'absolute', left: cx - 200, top: cy - 245, width: 400, display: 'flex', justifyContent: 'center',
          transform: `scale(${file * fs})`, opacity: fly >= 1 ? 1 - landed : file, filter: `blur(${(1 - file) * 10}px)`}}>
          <Card style={{padding: '40px 50px 34px'}}>
            <Mp4File w={300} />
            <div style={{display: 'flex', justifyContent: 'center', marginTop: 16}}>
              <div style={{padding: '6px 18px', borderRadius: 999, background: C.greenSoft, color: '#15803D', fontWeight: 700,
                fontSize: 22}}>Exported</div>
            </div>
          </Card>
        </div>

        <div style={{position: 'absolute', left: 1330, top: 900, opacity: ifNec, transform: `translateY(${(1 - ifNec) * 30}px)`}}>
          <Pill size={30}>…if necessary</Pill>
        </div>
      </div>

      {/* end card */}
      <div style={{...center, flexDirection: 'column', gap: 46}}>
        <div style={{transform: `scale(${0.6 + 0.4 * end})`, opacity: end}}>
          <StepChip n="08" scale={1.25} suffix={<div style={{paddingRight: 10}}><Check size={36} p={prog(t, 50.8, 51.2)} /></div>} />
        </div>
        <BlurWords t={t} size={170} words={[{w: 'Video', t: 50.6}, {w: 'exported.', t: 50.8, hl: HL_GREEN}]} />
      </div>
    </div>
  );
};

export {HL_BLUE};
