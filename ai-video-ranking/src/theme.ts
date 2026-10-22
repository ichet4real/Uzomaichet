import {staticFile} from 'remotion';

export const C = {
  bg: '#0A0C11',
  white: '#F5F7FB',
  mute: '#8C95A8',
  cyan: '#22D3EE',
  violet: '#8B5CF6',
  lime: '#B6F24A',
  stroke: 'rgba(255,255,255,0.12)',
};

export const FONT = {
  display: 'Inter, sans-serif',
  label: 'Manrope, Inter, sans-serif',
};

export type ToolId = 'pixverse' | 'pika' | 'vidu' | 'hailuo' | 'kling';

export type Tool = {
  id: ToolId;
  name: string;
  rank: number;
  logo: string;
  accent: [string, string];
  label: [string, string];
};

// Accents sampled from each supplied logo (Pika's logo is near-black, so it gets a neutral lavender).
export const TOOLS: Record<ToolId, Tool> = {
  pixverse: {id: 'pixverse', name: 'PixVerse', rank: 5, logo: staticFile('logos/pixverselogo.png'), accent: ['#C85CF0', '#FF9A5A'], label: ['SHORT-FORM', '+ EFFECTS']},
  pika: {id: 'pika', name: 'Pika', rank: 4, logo: staticFile('logos/pika.png'), accent: ['#A99BFF', '#FF8FB1'], label: ['CREATIVE', '+ UNUSUAL']},
  vidu: {id: 'vidu', name: 'Vidu', rank: 3, logo: staticFile('logos/vidu-ai-video-logo-256.png'), accent: ['#36D6FF', '#2E6BFF'], label: ['CHARACTERS', '+ IMAGE → VIDEO']},
  hailuo: {id: 'hailuo', name: 'Hailuo', rank: 2, logo: staticFile('logos/hailuo-color.png'), accent: ['#FF9A1F', '#E8445F'], label: ['PEOPLE', '+ CINEMATIC SCENES']},
  kling: {id: 'kling', name: 'Kling', rank: 1, logo: staticFile('logos/kling-color.png'), accent: ['#14E6F0', '#B6F24A'], label: ['MY #1 PICK', '']},
};

// Dock / countdown order: #5 → #1
export const ORDER: ToolId[] = ['pixverse', 'pika', 'vidu', 'hailuo', 'kling'];

export const rgba = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
