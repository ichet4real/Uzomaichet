// Verifies an encoded file: dimensions, codec, pixel format, frame rate,
// frame count, duration and absence of audio. Exits non-zero on any failure.
import { execFileSync } from 'node:child_process';

const [file = 'output/flow-threejs.mp4', w = '1920', h = '1080'] = process.argv.slice(2);
const probe = JSON.parse(execFileSync('ffprobe', [
  '-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', file,
]).toString());

const video = probe.streams.filter((s) => s.codec_type === 'video');
const audio = probe.streams.filter((s) => s.codec_type === 'audio');
const v = video[0];
const checks = [
  ['one video stream', video.length === 1, video.length],
  ['no audio stream', audio.length === 0, audio.length],
  ['codec h264', v.codec_name === 'h264', v.codec_name],
  ['pix_fmt yuv420p', v.pix_fmt === 'yuv420p', v.pix_fmt],
  [`width ${w}`, v.width === Number(w), v.width],
  [`height ${h}`, v.height === Number(h), v.height],
  ['frame rate 30/1', v.r_frame_rate === '30/1' && v.avg_frame_rate === '30/1', `${v.r_frame_rate} (avg ${v.avg_frame_rate})`],
  ['180 frames', Number(v.nb_read_frames) === 180, v.nb_read_frames],
  ['duration 6.000 s', Math.abs(Number(v.duration) - 6) < 1e-3, v.duration],
];

let ok = true;
for (const [name, pass, actual] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name.padEnd(18)} ${actual}`);
  ok &&= pass;
}
console.log(ok ? `\n${file}: all checks passed` : `\n${file}: CHECKS FAILED`);
process.exit(ok ? 0 : 1);
