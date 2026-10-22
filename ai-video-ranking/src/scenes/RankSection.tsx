import React from 'react';
import {T} from '../timing';
import {C, FONT, TOOLS, ToolId, rgba} from '../theme';
import {io, lerp, mix, spr} from '../lib/anim';
import {DimText} from '../components/DimText';
import {LogoCard} from '../components/LogoCard';
import {BenefitLabel} from '../components/BenefitLabel';
import {PixverseDemo} from '../demos/PixverseDemo';
import {PikaDemo} from '../demos/PikaDemo';
import {ViduDemo} from '../demos/ViduDemo';
import {HailuoDemo} from '../demos/HailuoDemo';

const IDS: ToolId[] = ['pixverse', 'pika', 'vidu', 'hailuo'];
const RANK = [T.rank5, T.rank4, T.rank3, T.rank2];
const BRAND = [T.pixverse, T.pika, T.vidu, T.hailuo];
const LABEL: [number, number][] = [
  [T.shortForm, T.creativeEffects],
  [T.creativeUnusual, T.unusual],
  [T.characters, T.imageToVideo],
  [T.realisticPeople, T.cinematicScenes],
];
const END = T.myNumber;
const DEMOS = [PixverseDemo, PikaDemo, ViduDemo, HailuoDemo];

// Stage geometry per tool: [left, top, width, height, radius, topBar]
const GEOM = [
  [700, 110, 1100, 730, 40, 56],
  [740, 130, 1040, 690, 64, 56],
  [700, 110, 1100, 730, 32, 56],
  [680, 200, 1160, 560, 20, 0],
];

const NUM_SIZE = 280;
const NUM_H = NUM_SIZE * 1.18;

const exitAt = (i: number) => (i < 3 ? RANK[i + 1] : END);

export const RankSection: React.FC<{frame: number}> = ({frame}) => {
  if (frame < T.rank5 - 14 || frame > END + 20) return null;
  const leave = io(frame, END + 2, END + 16);

  // ----- stage geometry (shape-matched morph between tools)
  let g = GEOM[0].slice();
  for (let i = 1; i < 4; i++) {
    const m = spr(frame, RANK[i], {damping: 22, stiffness: 110});
    g = g.map((v, k) => lerp(v, GEOM[i][k], m));
  }
  const [gx, gy, gw, gh, gr, bar] = g;
  const stageIn = spr(frame, T.rank5 - 12, {damping: 20, stiffness: 120});
  let accA = TOOLS.pixverse.accent[0];
  let accB = TOOLS.pixverse.accent[1];
  for (let i = 1; i < 4; i++) {
    const m = io(frame, RANK[i], RANK[i] + 16);
    accA = mix(accA, TOOLS[IDS[i]].accent[0], m);
    accB = mix(accB, TOOLS[IDS[i]].accent[1], m);
  }

  // ----- rank odometer
  const numIn = spr(frame, T.rank5, {damping: 15, stiffness: 160});
  let roll = 0;
  for (let i = 1; i < 4; i++) roll += spr(frame, RANK[i], {damping: 16, stiffness: 150});

  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - leave, transform: `scale(${1 - 0.06 * leave})`}}>
      {/* ===== left column ===== */}
      <div style={{position: 'absolute', left: 120, top: 96, display: 'flex', alignItems: 'flex-start'}}>
        <div style={{opacity: numIn, transform: `translateY(${(1 - numIn) * 40}px)`}}>
          <DimText text="#" size={NUM_SIZE * 0.5} colors={[accA, accB]} depth={8} style={{marginTop: NUM_SIZE * 0.12, marginRight: 6}} />
        </div>
        <div style={{height: NUM_H, overflow: 'hidden', paddingRight: 30, paddingBottom: 10}}>
          <div style={{transform: `translateY(${-roll * NUM_H + (1 - numIn) * NUM_H}px)`}}>
            {IDS.map((id) => (
              <div key={id} style={{height: NUM_H}}>
                <DimText text={String(TOOLS[id].rank)} size={NUM_SIZE} colors={TOOLS[id].accent} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {IDS.map((id, i) => {
        const t = TOOLS[id];
        if (frame < BRAND[i] - 2 || frame > exitAt(i) + 12) return null;
        const e = spr(frame, BRAND[i], {damping: 15, stiffness: 170});
        const x = io(frame, exitAt(i), exitAt(i) + 9);
        const nameIn = spr(frame, BRAND[i] + 1, {damping: 20, stiffness: 160});
        const p1 = io(frame, LABEL[i][0] - 1, LABEL[i][0] + 11);
        const p2 = io(frame, LABEL[i][1] - 1, LABEL[i][1] + 11);
        return (
          <div key={id} style={{position: 'absolute', left: 120, top: 0, opacity: 1 - x}}>
            <div style={{position: 'absolute', top: 440, perspective: 900}}>
              <div style={{transform: `rotateY(${(1 - e) * -75}deg) scale(${0.55 + 0.45 * e}) translateY(${-x * 40}px)`, opacity: Math.min(1, e * 2), transformOrigin: 'left center'}}>
                <LogoCard tool={id} size={190} glow={0.6} />
              </div>
            </div>
            <div style={{position: 'absolute', top: 650, height: 112, overflow: 'hidden', width: 540}}>
              <div
                style={{
                  transform: `translateY(${(1 - nameIn) * 110 - x * 110}%)`,
                  fontFamily: FONT.display,
                  fontWeight: 800,
                  fontSize: 92,
                  letterSpacing: '-0.03em',
                  color: C.ink,
                  lineHeight: '112px',
                }}
              >
                {t.name}
              </div>
            </div>
            <div style={{position: 'absolute', top: 782}}>
              <BenefitLabel parts={t.label} p1={p1} p2={p2} accent={t.accent[0]} size={34} />
            </div>
          </div>
        );
      })}

      {/* ===== demo stage ===== */}
      <div style={{position: 'absolute', left: gx, top: gy, width: gw, height: gh, opacity: stageIn, transform: `scale(${0.9 + 0.1 * stageIn})`}}>
        {/* multicolour halo */}
        {/* Klarna-style rainbow halo behind the card */}
        <div style={{position: 'absolute', left: -160, top: -140, width: gw * 0.75, height: gh * 1.0, borderRadius: '50%', background: `radial-gradient(circle, ${rgba(accA, 0.38)} 0%, transparent 64%)`}} />
        <div style={{position: 'absolute', right: -160, bottom: -170, width: gw * 0.75, height: gh * 1.0, borderRadius: '50%', background: `radial-gradient(circle, ${rgba(accB, 0.34)} 0%, transparent 64%)`}} />
        <div style={{position: 'absolute', left: gw * 0.3, bottom: -200, width: gw * 0.5, height: gh * 0.7, borderRadius: '50%', background: 'radial-gradient(circle, rgba(120,230,170,0.28) 0%, transparent 64%)'}} />
        <div style={{position: 'absolute', right: gw * 0.05, top: -170, width: gw * 0.4, height: gh * 0.6, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,214,102,0.24) 0%, transparent 64%)'}} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: gr,
            overflow: 'hidden',
            background: '#FFFFFF',
            border: `1px solid ${C.line}`,
            boxShadow: C.shadow,
          }}
        >
          {/* window chrome */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: bar, borderBottom: bar > 2 ? `1px solid ${C.line}` : 'none', opacity: bar / 56, display: 'flex', alignItems: 'center', paddingLeft: 30 + Math.max(0, gr - 40) * 0.5, gap: 10}}>
            {[0, 1, 2].map((c) => (
              <div key={c} style={{width: 12, height: 12, borderRadius: 6, background: C.skel2}} />
            ))}
            <div style={{marginLeft: 22, width: 220, height: 10, borderRadius: 5, background: C.skel}} />
            <div style={{marginLeft: 'auto', marginRight: 26, width: 34, height: 34, borderRadius: 17, background: C.skel}} />
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: bar, bottom: 0, overflow: 'hidden'}}>
            {DEMOS.map((Demo, i) => {
              const from = i === 0 ? T.rank5 - 14 : RANK[i];
              const to = exitAt(i);
              if (frame < from || frame > to + 12) return null;
              const o = (i === 0 ? 1 : io(frame, RANK[i] + 2, RANK[i] + 14)) * (1 - io(frame, to - 2, to + 8));
              const cw = gw;
              const ch = gh - bar;
              return (
                <div key={i} style={{position: 'absolute', inset: 0, opacity: o, transform: `scale(${lerp(0.96, 1, o)})`}}>
                  <Demo frame={frame} w={cw} h={ch} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

