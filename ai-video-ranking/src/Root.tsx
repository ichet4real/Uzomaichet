import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {DURATION, FPS} from './timing';

export const RemotionRoot: React.FC = () => (
  <Composition id="Ranking" component={Video} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
);
