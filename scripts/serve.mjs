// Small static server for the animation.
//   /              -> src/
//   /vendor/gsap/  -> node_modules/gsap/dist/  (core + all plugins)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mounts = [
  ['/vendor/gsap/', path.join(root, 'node_modules/gsap/dist')],
  ['/', path.join(root, 'src')],
];
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.map': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.webm': 'video/webm',
};

function resolveFile(urlPath) {
  for (const [prefix, dir] of mounts) {
    if (!urlPath.startsWith(prefix)) continue;
    const file = path.normalize(path.join(dir, urlPath.slice(prefix.length)));
    if (!file.startsWith(dir)) return null; // block ../ escapes
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) return path.join(file, 'index.html');
    return file;
  }
  return null;
}

export function startServer(port = 0, host = '127.0.0.1') {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = resolveFile(urlPath);
    if (!file || !fs.existsSync(file)) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, {
      'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, host, () => resolve(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 5173);
  const host = process.env.HOST || '127.0.0.1';
  const server = await startServer(port, host);
  console.log(`Preview running at http://${host}:${server.address().port}/`);
  console.log('Press Ctrl+C to stop.');
}
