import React from 'react';
import {interpolate} from 'remotion';
import {
  C, FONT, Card, Check, Chip, IconDownload, IconFilm, IconGear, IconLaptop, IconScissors, Mp4File,
  ease, easeOut, pop, prog, win,
} from './lib';

const center: React.CSSProperties = {
  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT,
};

/* ================= A: Title  (0 – 3.2s) ================= */
export const SceneTitle: React.FC<{t: number}> = ({t}) => {
  const stepIn = pop(t, 0.3, 11);
  const numIn = pop(t, 0.45, 9);
  const words = ['Render', '&', 'Export', 'the Video'];
  const wordStarts = [1.4, 1.62, 1.8, 2.15];
  const line = prog(t, 2.2, 2.9);
  const ringRot = t * 40;
  return (
    <div style={center}>
      {/* rotating dashed ring behind the number */}
      <svg width={900} height={900} style={{position: 'absolute', opacity: 0.5 * numIn}}>
        <circle cx={450} cy={450} r={380} fill="none" stroke={C.orange} strokeWidth={3} strokeDasharray="6 22"
          transform={`rotate(${ringRot} 450 450)`} />
        <circle cx={450} cy={450} r={330} fill="none" stroke={C.cyan} strokeWidth={2} strokeDasharray="120 40"
          transform={`rotate(${-ringRot * 1.4} 450 450)`} opacity={0.6} />
      </svg>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{transform: `translateY(${(1 - stepIn) * 40}px)`, opacity: stepIn}}>
          <Chip>Step</Chip>
        </div>
        <div
          style={{
            fontSize: 300, fontWeight: 900, lineHeight: 1, marginTop: 6, letterSpacing: -10,
            background: `linear-gradient(135deg, ${C.amber}, ${C.orange} 55%, #FF4D6D)`,
            WebkitBackgroundClip: 'text', color: 'transparent',
            transform: `scale(${0.3 + 0.7 * numIn})`, opacity: Math.min(1, numIn * 1.5),
            filter: `drop-shadow(0 20px 60px ${C.orange}55)`,
          }}
        >
          08
        </div>
        <div style={{display: 'flex', gap: 26, marginTop: 10}}>
          {words.map((w, i) => {
            const p = pop(t, wordStarts[i], 12);
            return (
              <div key={w} style={{
                fontSize: 92, fontWeight: 800, color: w === 'Export' || w === 'Render' ? C.white : C.dim,
                transform: `translateY(${(1 - p) * 60}px) rotate(${(1 - p) * 6}deg)`, opacity: p,
              }}>{w}</div>
            );
          })}
        </div>
        <div style={{height: 8, width: 900 * line, marginTop: 22, borderRadius: 8,
          background: `linear-gradient(90deg, ${C.orange}, ${C.cyan})`}} />
      </div>
    </div>
  );
};

/* ================= B: Ready check (3.2 – 9.3s) ================= */
export const SceneReady: React.FC<{t: number}> = ({t}) => {
  // phase 1: edits done + 100% satisfied ; phase 2: render -> export
  const p1Out = prog(t, 7.35, 7.75, ease);
  const editIn = pop(t, 3.55, 13);
  const clips = [
    {w: 260, c: C.cyan}, {w: 170, c: C.orange}, {w: 210, c: C.amber},
  ];
  const cut = prog(t, 4.0, 4.6);
  const checkP = prog(t, 4.5, 5.0);
  const ifAny = pop(t, 5.0, 12);
  const ringIn = pop(t, 5.4, 12);
  const pct = prog(t, 5.7, 6.9, ease);
  const satisfied = pop(t, 6.6, 10);

  const p2 = pop(t, 7.6, 12);
  const renderIn = pop(t, 8.0, 11);
  const arrow = prog(t, 8.35, 8.75);
  const exportIn = pop(t, 8.6, 11);
  const gearRot = t * 120;

  return (
    <div style={center}>
      {/* Phase 1 */}
      <div style={{
        display: 'flex', gap: 90, alignItems: 'center',
        opacity: 1 - p1Out, transform: `translateY(${-p1Out * 120}px) scale(${1 - p1Out * 0.15})`,
      }}>
        <Card style={{width: 720, height: 460, padding: 40, boxSizing: 'border-box',
          transform: `translateX(${(1 - editIn) * -200}px)`, opacity: editIn}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <IconScissors open={Math.sin(t * 10) * 0.5 + 0.5} />
            <div style={{fontSize: 46, fontWeight: 800, color: C.white}}>Your edits</div>
          </div>
          <div style={{marginTop: 40, display: 'flex', flexDirection: 'column', gap: 22}}>
            {[0, 1, 2].map((row) => (
              <div key={row} style={{display: 'flex', gap: 10, height: 44}}>
                {clips.map((cl, i) => {
                  const shrink = row === 1 && i === 1 ? 1 - cut * 0.55 : 1;
                  return (
                    <div key={i} style={{
                      width: (cl.w - row * 30 + (i === 2 ? row * 40 : 0)) * shrink, borderRadius: 10,
                      background: `${[cl.c, clips[(i + 1) % 3].c, clips[(i + 2) % 3].c][row]}`,
                      opacity: 0.85,
                    }} />
                  );
                })}
              </div>
            ))}
          </div>
          <div style={{marginTop: 46, display: 'flex', alignItems: 'center', gap: 18}}>
            <Check size={64} p={checkP} />
            <div style={{fontSize: 40, fontWeight: 700, color: C.white, opacity: 0.4 + 0.6 * checkP}}>Done</div>
            <div style={{
              marginLeft: 10, fontSize: 30, fontStyle: 'italic', color: C.amber, fontWeight: 600,
              opacity: ifAny, transform: `scale(${0.6 + 0.4 * ifAny})`,
            }}>(if any)</div>
          </div>
        </Card>

        <div style={{position: 'relative', width: 420, height: 420, opacity: ringIn,
          transform: `scale(${0.5 + 0.5 * ringIn})`}}>
          <svg width={420} height={420} style={{position: 'absolute'}}>
            <circle cx={210} cy={210} r={180} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={28} />
            <circle cx={210} cy={210} r={180} fill="none" stroke={pct >= 1 ? C.green : C.orange} strokeWidth={28}
              strokeLinecap="round" strokeDasharray={2 * Math.PI * 180}
              strokeDashoffset={2 * Math.PI * 180 * (1 - pct)} transform="rotate(-90 210 210)"
              style={{filter: `drop-shadow(0 0 18px ${pct >= 1 ? C.green : C.orange})`}} />
          </svg>
          <div style={{...center, flexDirection: 'column'}}>
            <div style={{fontSize: 120, fontWeight: 900, color: C.white, letterSpacing: -4}}>
              {Math.round(pct * 100)}<span style={{fontSize: 64}}>%</span>
            </div>
            <div style={{fontSize: 34, fontWeight: 800, color: C.green, letterSpacing: 4,
              opacity: satisfied, transform: `translateY(${(1 - satisfied) * 20}px)`}}>SATISFIED</div>
          </div>
        </div>
      </div>

      {/* Phase 2 */}
      <div style={{...center, flexDirection: 'column', opacity: p2, pointerEvents: 'none'}}>
        <div style={{fontSize: 48, fontWeight: 700, color: C.dim, marginBottom: 50,
          transform: `translateY(${(1 - p2) * 40}px)`}}>It&apos;s time to&hellip;</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 40}}>
          <Card glow={`${C.orange}55`} style={{width: 520, height: 230, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 30, transform: `scale(${renderIn})`, opacity: renderIn,
            borderColor: C.orange}}>
            <IconGear s={110} rot={gearRot} />
            <div style={{fontSize: 76, fontWeight: 900, color: C.white}}>RENDER</div>
          </Card>
          <svg width={160} height={60}>
            <path d="M5 30 H140" stroke={C.white} strokeWidth={8} strokeLinecap="round"
              strokeDasharray={140} strokeDashoffset={140 * (1 - arrow)} />
            <path d="M118 8 L148 30 L118 52" fill="none" stroke={C.white} strokeWidth={8} strokeLinecap="round"
              strokeLinejoin="round" opacity={arrow} />
          </svg>
          <Card glow={`${C.cyan}55`} style={{width: 520, height: 230, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 30, transform: `scale(${exportIn})`, opacity: exportIn,
            borderColor: C.cyan}}>
            <IconDownload s={100} dy={Math.sin(t * 8) * 5} />
            <div style={{fontSize: 76, fontWeight: 900, color: C.white}}>EXPORT</div>
          </Card>
        </div>
      </div>
    </div>
  );
};

/* ================= C: How? Very simple (9.3 – 12.1s) ================= */
export const SceneHow: React.FC<{t: number}> = ({t}) => {
  const letters = 'HOW?'.split('');
  const out = prog(t, 10.85, 11.15, ease);
  const simple = pop(t, 11.05, 10);
  const wiggle = Math.sin(t * 9) * 8 * (1 - out);
  return (
    <div style={center}>
      <div style={{display: 'flex', gap: 10, opacity: 1 - out, transform: `scale(${1 + out * 0.6})`,
        filter: `blur(${out * 20}px)`}}>
        {letters.map((l, i) => {
          const p = pop(t, 9.55 + i * 0.12, 9);
          return (
            <div key={i} style={{
              fontSize: 330, fontWeight: 900, lineHeight: 1,
              color: l === '?' ? C.orange : C.white,
              transform: `translateY(${(1 - p) * 200}px) rotate(${l === '?' ? wiggle : 0}deg) scale(${p})`,
              opacity: Math.min(1, p * 1.5),
              textShadow: l === '?' ? `0 0 60px ${C.orange}` : 'none',
            }}>{l}</div>
          );
        })}
      </div>
      <div style={{...center, flexDirection: 'column', gap: 30}}>
        <div style={{transform: `scale(${simple})`, opacity: simple}}>
          <Check size={150} p={prog(t, 11.2, 11.6)} />
        </div>
        <div style={{fontSize: 150, fontWeight: 900, color: C.white, letterSpacing: -3,
          transform: `translateY(${(1 - simple) * 80}px)`, opacity: simple}}>
          Very <span style={{color: C.green}}>simple.</span>
        </div>
      </div>
      {/* sparkles */}
      {Array.from({length: 14}).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const p = prog(t, 11.1, 11.9);
        const r = 200 + p * 520;
        return (
          <div key={i} style={{
            position: 'absolute', left: 960 + Math.cos(a) * r, top: 540 + Math.sin(a) * r * 0.6,
            width: 14, height: 14, borderRadius: 7, background: [C.orange, C.cyan, C.amber, C.green][i % 4],
            opacity: t > 11.1 ? 1 - p : 0, transform: `scale(${1 - p * 0.5})`,
          }} />
        );
      })}
    </div>
  );
};

/* ================= G: Rendering time (25.9 – 31.2s) ================= */
export const SceneRenderTime: React.FC<{t: number}> = ({t}) => {
  const head = pop(t, 26.1, 13);
  const comp = pop(t, 26.95, 11);
  const plus = pop(t, 27.85, 11);
  const proj = pop(t, 28.1, 11);
  const up = prog(t, 28.95, 29.45, ease);
  const barIn = pop(t, 29.15, 13);
  const fill = prog(t, 29.4, 30.75, ease);
  const done = pop(t, 30.75, 10);
  const clock = t * 360;
  return (
    <div style={{...center, flexDirection: 'column'}}>
      <div style={{position: 'absolute', top: 200 - up * 40, display: 'flex', alignItems: 'center', gap: 20,
        opacity: head * (1 - up)}}>
        <svg width={64} height={64} viewBox="0 0 64 64">
          <circle cx={32} cy={32} r={28} fill="none" stroke={C.amber} strokeWidth={5} />
          <path d={`M32 32 L32 12`} stroke={C.amber} strokeWidth={5} strokeLinecap="round"
            transform={`rotate(${clock} 32 32)`} />
          <path d={`M32 32 L46 32`} stroke={C.white} strokeWidth={5} strokeLinecap="round"
            transform={`rotate(${clock / 12} 32 32)`} />
        </svg>
        <div style={{fontSize: 56, fontWeight: 800, color: C.white}}>
          Rendering time <span style={{color: C.amber}}>depends on</span>
        </div>
      </div>

      <div style={{display: 'flex', alignItems: 'center', gap: 60,
        transform: `translateY(${-up * 170}px) scale(${1 - up * 0.35})`}}>
        <Card glow={`${C.cyan}33`} style={{width: 460, height: 360, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 20, opacity: comp,
          transform: `translateY(${(1 - comp) * 80}px)`}}>
          <IconLaptop s={170} />
          <div style={{fontSize: 46, fontWeight: 800, color: C.white}}>Your computer</div>
        </Card>
        <div style={{fontSize: 110, fontWeight: 900, color: C.dim, transform: `scale(${plus})`}}>+</div>
        <Card glow={`${C.amber}33`} style={{width: 460, height: 360, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 20, opacity: proj,
          transform: `translateY(${(1 - proj) * 80}px)`}}>
          <IconFilm s={170} />
          <div style={{fontSize: 46, fontWeight: 800, color: C.white}}>The project</div>
        </Card>
      </div>

      <div style={{position: 'absolute', top: 690, width: 1200, opacity: barIn,
        transform: `translateY(${(1 - barIn) * 60}px)`}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20}}>
          <div style={{fontSize: 44, fontWeight: 800, color: done > 0 ? C.green : C.white}}>
            {done > 0 ? 'Process finished' : 'Rendering…'}
          </div>
          <div style={{fontSize: 52, fontWeight: 900, color: C.white}}>{Math.round(fill * 100)}%</div>
        </div>
        <div style={{height: 44, borderRadius: 22, background: 'rgba(255,255,255,0.08)', overflow: 'hidden',
          border: `1.5px solid ${C.stroke}`}}>
          <div style={{height: '100%', width: `${fill * 100}%`, borderRadius: 22,
            background: done > 0 ? C.green
              : `repeating-linear-gradient(45deg, ${C.orange}, ${C.orange} 22px, ${C.amber} 22px, ${C.amber} 44px)`,
            backgroundPosition: `${t * 120}px 0`, boxShadow: `0 0 30px ${done > 0 ? C.green : C.orange}`}} />
        </div>
        <div style={{marginTop: 34, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18,
          opacity: done, transform: `scale(${0.6 + 0.4 * done})`}}>
          <Check size={60} p={prog(t, 30.8, 31.1)} />
          <div style={{fontSize: 42, fontWeight: 700, color: C.white}}>Let it finish</div>
        </div>
      </div>
    </div>
  );
};

/* ================= J: Use it in your editor (45.4 – 52s) ================= */
export const SceneEditor: React.FC<{t: number}> = ({t}) => {
  const note = pop(t, 45.6, 11);
  const file = pop(t, 45.85, 12);
  const editor = pop(t, 47.35, 13);
  const fly = prog(t, 48.2, 49.0, ease);
  const landed = pop(t, 48.95, 10);
  const ifNec = pop(t, 49.75, 11);
  const endOut = prog(t, 50.35, 50.75, ease);
  const end = pop(t, 50.55, 12);

  // file moves from center-left to the editor timeline V1 track
  const baseX = interpolate(prog(t, 47.3, 47.9, ease), [0, 1], [960, 470]);
  const cx = interpolate(fly, [0, 1], [baseX, 1150]);
  const cy = interpolate(fly, [0, 1], [540, 732]) - Math.sin(fly * Math.PI) * 180;
  const fs = interpolate(fly, [0, 1], [1, 0.35]);
  const playhead = prog(t, 49.0, 50.5, (x) => x);
  return (
    <div style={center}>
      <div style={{...center, opacity: 1 - endOut, transform: `scale(${1 - endOut * 0.2})`,
        filter: `blur(${endOut * 14}px)`}}>
        <div style={{position: 'absolute', top: 120, transform: `scale(${note})`, opacity: note}}>
          <Chip color={C.amber}>Note</Chip>
        </div>

        {/* editor mock */}
        <Card style={{position: 'absolute', left: 820, top: 250, width: 900, height: 600, padding: 0,
          overflow: 'hidden', opacity: editor, transform: `translateX(${(1 - editor) * 300}px)`}}>
          <div style={{height: 54, display: 'flex', alignItems: 'center', gap: 12, padding: '0 22px',
            borderBottom: `1.5px solid ${C.stroke}`}}>
            {[C.orange, C.amber, C.green].map((c) => (
              <div key={c} style={{width: 16, height: 16, borderRadius: 8, background: c}} />
            ))}
            <div style={{marginLeft: 14, color: C.dim, fontSize: 24, fontWeight: 700}}>Video Editor</div>
          </div>
          <div style={{height: 290, margin: 22, borderRadius: 16, background: '#05070F',
            display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${C.stroke}`}}>
            <svg width={90} height={90} viewBox="0 0 90 90" style={{opacity: 0.3 + 0.7 * landed}}>
              <circle cx={45} cy={45} r={42} fill={`${C.cyan}22`} stroke={C.cyan} strokeWidth={3} />
              <path d="M36 28 L62 45 L36 62 Z" fill={C.cyan} />
            </svg>
          </div>
          <div style={{position: 'relative', margin: '0 22px'}}>
            {['V2', 'V1', 'A1'].map((tr, i) => (
              <div key={tr} style={{display: 'flex', alignItems: 'center', gap: 14, height: 56, marginBottom: 8}}>
                <div style={{width: 46, color: C.dim, fontSize: 22, fontWeight: 800}}>{tr}</div>
                <div style={{flex: 1, height: 46, borderRadius: 10, background: 'rgba(255,255,255,0.05)',
                  position: 'relative', overflow: 'hidden'}}>
                  {tr === 'V1' ? (
                    <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${72 * landed}%`,
                      borderRadius: 10, background: `linear-gradient(90deg, ${C.orange}, ${C.amber})`,
                      display: 'flex', alignItems: 'center', paddingLeft: 16, color: '#1a0f08', fontWeight: 800,
                      fontSize: 22, whiteSpace: 'nowrap', overflow: 'hidden'}}>video sample1.mp4</div>
                  ) : null}
                  {tr === 'A1' ? (
                    <div style={{position: 'absolute', left: 0, top: 8, bottom: 8, width: `${72 * landed}%`,
                      borderRadius: 8, background: `repeating-linear-gradient(90deg, ${C.cyan}88 0 4px, transparent 4px 9px)`}} />
                  ) : null}
                </div>
              </div>
            ))}
            <div style={{position: 'absolute', top: -6, bottom: 0, left: 60 + playhead * 700, width: 3,
              background: C.white, opacity: landed}} />
          </div>
        </Card>

        {/* the MP4 file */}
        <div style={{position: 'absolute', left: cx - 200, top: cy - 245, width: 400, display: 'flex', justifyContent: 'center',
          transform: `scale(${file * fs})`, opacity: fly >= 1 ? 1 - landed : file}}>
          <Card glow={`${C.orange}44`} style={{padding: '40px 50px'}}>
            <Mp4File w={300} />
            <div style={{textAlign: 'center', marginTop: 14, fontSize: 26, fontWeight: 800, letterSpacing: 3,
              color: C.orange}}>EXPORTED</div>
          </Card>
        </div>

        <div style={{position: 'absolute', left: 1260, top: 880, fontSize: 40, fontStyle: 'italic', fontWeight: 600,
          color: C.amber, opacity: ifNec, transform: `translateY(${(1 - ifNec) * 30}px)`}}>
          …if necessary
        </div>
      </div>

      {/* end card */}
      <div style={{...center, flexDirection: 'column', gap: 26, opacity: end}}>
        <div style={{transform: `scale(${end})`}}>
          <Check size={170} p={prog(t, 50.7, 51.2)} />
        </div>
        <div style={{fontSize: 110, fontWeight: 900, color: C.white, letterSpacing: -2,
          transform: `translateY(${(1 - end) * 60}px)`}}>
          Step 08 <span style={{color: C.green}}>Complete</span>
        </div>
        <div style={{fontSize: 44, fontWeight: 700, color: C.dim, opacity: prog(t, 50.9, 51.3)}}>
          Rendered &middot; Exported &middot; Ready to edit
        </div>
      </div>
    </div>
  );
};

export {win};
