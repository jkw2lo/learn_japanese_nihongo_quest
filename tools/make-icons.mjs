/* Draw the app icons: the 日 seal from the top bar, full bleed, as PNGs.

   For manifest.webmanifest (Android's "Install app") and the
   apple-touch-icon. One drawing serves as both "any" and "maskable": the
   glyph sits inside the middle 60%, which is all an Android mask is
   guaranteed to keep, and the red runs to the edges so no shape of mask
   shows a corner of paper.

   Renders with headless Google Chrome (macOS path below), so Noto Serif JP
   is the same font the app uses.
     node tools/make-icons.mjs */

import { execFileSync } from 'child_process';
import { writeFileSync, mkdtempSync, rmSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';
import { tmpdir } from 'os';

const root = fileURLToPath(new URL('../', import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SEAL = '#C2402F';           /* --seal in css/app.css */
const SIZES = { 'icon-192.png': 192, 'icon-512.png': 512, 'apple-touch-icon.png': 180, 'favicon-32.png': 32 };

const work = mkdtempSync(join(tmpdir(), 'nq-icons-'));
mkdirSync(join(root, 'icons'), { recursive: true });
for (const [file, px] of Object.entries(SIZES)) {
  const html = join(work, 'i.html');
  writeFileSync(html, `<!doctype html><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@700&text=日&display=block">
<style>html,body{margin:0;width:${px}px;height:${px}px;overflow:hidden;background:${SEAL}}
body{display:grid;place-items:center;color:#fff;font:700 ${Math.round(px * (px <= 32 ? .78 : .5))}px/1 "Noto Serif JP",serif}</style>日`);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--window-size=${px},${px}`, '--virtual-time-budget=8000', `--screenshot=${join(root, 'icons', file)}`, `file://${html}`], { stdio: 'ignore' });
  console.log(`icons/${file}  ${px}×${px}`);
}
rmSync(work, { recursive: true, force: true });
