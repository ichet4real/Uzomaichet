import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Background} from './components/Background';
import {Dock, Cursor} from './components/Dock';
import {Intro} from './scenes/Intro';
import {RankSection} from './scenes/RankSection';
import {KlingSection} from './scenes/KlingSection';
import {UseCases} from './scenes/UseCases';
import {Final} from './scenes/Final';
import {T} from './timing';
import {EIO, bell, io} from './lib/anim';
import {INTRO_COLLAPSE} from './components/Dock';

/** Camera: push in as the intro cards dock, pull back to reveal the ranking layout,
 * a gentle breath on each new rank, a push toward the #1 reveal, then ease out. */
const camera = (f: number) => {
  const pushIn = io(f, INTRO_COLLAPSE - 4, T.rank5 - 12, 0, 1, EIO);
  const pullBack = io(f, T.rank5 - 12, T.rank5 + 20, 0, 1, EIO);
  let s = 1 + 0.12 * pushIn - 0.12 * pullBack;
  for (const r of [T.rank4, T.rank3, T.rank2]) s += 0.018 * bell(f, r - 6, r + 24);
  s += 0.05 * io(f, T.myNumber, T.kling, 0, 1, EIO) - 0.05 * io(f, T.especially, T.especially + 24, 0, 1, EIO);
  s += 0.03 * bell(f, T.useCases - 6, T.useCases + 40);
  return s;
};

const FONTS: [string, number, string][] = [
  ['Inter', 400, 'inter-latin-400-normal.woff2'],
  ['Inter', 500, 'inter-latin-500-normal.woff2'],
  ['Inter', 600, 'inter-latin-600-normal.woff2'],
  ['Inter', 700, 'inter-latin-700-normal.woff2'],
  ['Inter', 800, 'inter-latin-800-normal.woff2'],
  ['Inter', 900, 'inter-latin-900-normal.woff2'],
  ['Manrope', 600, 'manrope-latin-600-normal.woff2'],
  ['Manrope', 700, 'manrope-latin-700-normal.woff2'],
  ['Manrope', 800, 'manrope-latin-800-normal.woff2'],
];

const useLocalFonts = () => {
  const [handle] = useState(() => delayRender('Loading local fonts'));
  useEffect(() => {
    Promise.all(
      FONTS.map(([family, weight, file]) =>
        new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('woff2')`, {weight: String(weight)}).load().then((f) => {
          (document.fonts as unknown as {add: (f: FontFace) => void}).add(f);
        }),
      ),
    )
      .then(() => continueRender(handle))
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [handle]);
};

export const Video: React.FC = () => {
  useLocalFonts();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#F5F6F8'}}>
      {/* Original voiceover, untouched speed. No subtitle track, no captions. */}
      <Audio src={staticFile('audio/ai-video1.mp3')} />
      <Background frame={frame} />
      <AbsoluteFill style={{transform: `scale(${camera(frame)})`, transformOrigin: '1080px 520px'}}>
        <Intro frame={frame} />
        <RankSection frame={frame} />
        <KlingSection frame={frame} />
        <UseCases frame={frame} />
        <Final frame={frame} />
        <Dock frame={frame} />
        <Cursor frame={frame} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
