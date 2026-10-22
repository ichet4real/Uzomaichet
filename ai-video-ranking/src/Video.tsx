import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {Background} from './components/Background';
import {Dock, Cursor} from './components/Dock';
import {Intro} from './scenes/Intro';
import {RankSection} from './scenes/RankSection';
import {KlingSection} from './scenes/KlingSection';
import {UseCases} from './scenes/UseCases';
import {Final} from './scenes/Final';

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
    <AbsoluteFill style={{background: '#0A0C11'}}>
      {/* Original voiceover, untouched speed. No subtitle track, no captions. */}
      <Audio src={staticFile('audio/ai-video1.mp3')} />
      <Background frame={frame} />
      <Intro frame={frame} />
      <RankSection frame={frame} />
      <KlingSection frame={frame} />
      <UseCases frame={frame} />
      <Final frame={frame} />
      <Dock frame={frame} />
      <Cursor frame={frame} />
    </AbsoluteFill>
  );
};
