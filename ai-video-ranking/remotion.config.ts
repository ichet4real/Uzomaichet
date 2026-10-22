import {Config} from '@remotion/cli/config';
import fs from 'fs';

// PNG frames keep the H.264 output in standard (TV-range) yuv420p for web players.
Config.setVideoImageFormat('png');
Config.setConcurrency(4);
// Sandbox without access to Remotion's browser CDN: use a locally installed headless shell if present.
const local = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (fs.existsSync(local)) Config.setBrowserExecutable(local);
