import {staticFile} from 'remotion';

// Light, airy palette inspired by the Klarna "App Page" reference.
export const C = {
  bg: '#F5F6F8',
  page: '#FFFFFF',
  ink: '#0E1014',
  inkSoft: '#5B6170',
  skel: '#ECEEF2',
  skel2: '#E2E5EA',
  line: 'rgba(14,16,20,0.08)',
  cyan: '#06B6D4',
  violet: '#7C3AED',
  pink: '#FFB8CC',
  lime: '#8BD12E',
  white: '#FFFFFF',
  shadow: '0 30px 70px rgba(28,32,52,0.12), 0 4px 14px rgba(28,32,52,0.06)',
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
  pixverse: {id: 'pixverse', name: 'PixVerse', rank: 5, logo: staticFile('logos/pixverselogo.png'), accent: ['#B44BEA', '#FF8A3D'], label: ['SHORT-FORM', '+ EFFECTS']},
  pika: {id: 'pika', name: 'Pika', rank: 4, logo: staticFile('logos/pika.png'), accent: ['#7B6CF6', '#FF6F9A'], label: ['CREATIVE', '+ UNUSUAL']},
  vidu: {id: 'vidu', name: 'Vidu', rank: 3, logo: staticFile('logos/vidu-ai-video-logo-256.png'), accent: ['#1DB8F0', '#2E5BFF'], label: ['CHARACTERS', '+ IMAGE → VIDEO']},
  hailuo: {id: 'hailuo', name: 'Hailuo', rank: 2, logo: staticFile('logos/hailuo-color.png'), accent: ['#FF8A1F', '#E8445F'], label: ['PEOPLE', '+ CINEMATIC SCENES']},
  kling: {id: 'kling', name: 'Kling', rank: 1, logo: staticFile('logos/kling-color.png'), accent: ['#00BFD8', '#6DC51E'], label: ['MY #1 PICK', '']},
};

// Dock / countdown order: #5 → #1
export const ORDER: ToolId[] = ['pixverse', 'pika', 'vidu', 'hailuo', 'kling'];

export const rgba = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
