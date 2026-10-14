/* The trailer as an MP4:  node tools/trailer/render.mjs [out.mp4]
   Opens trailer.html?render in Chrome at 1920×1080 and steps its clock one
   frame at a time (window.__seek), so every frame is exact however slow the
   machine; the soundtrack is cut from the clips by the same timeline, over
   the score (trailer/score.m4a, from music.mjs).
   Needs the dev server, Playwright (see cam.mjs), ffmpeg, and Google Chrome
   (Playwright's own Chromium can't play H.264).

     --stills 3.5,20,41   just those moments, as JPEGs, for checking
     --fps 30             frames a second
     --from 10 --to 20    part of it
     --remix              only the sound again, over the last render's picture */

import { createRequire } from 'module';
import { spawn, execFileSync } from 'child_process';
import { mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { URL_APP } from './cam.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(join(ROOT, 'tools/.cache/pw/'));
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i < 0 ? d : args.splice(i, 2)[1]; };
const remix = args.includes('--remix'); if (remix) args.splice(args.indexOf('--remix'), 1);
const FPS = +opt('--fps', 30), stills = opt('--stills', null), from = +opt('--from', 0), to = opt('--to', null);
const OUT = args[0] || join(ROOT, 'tools/.cache/nihongo-quest-trailer.mp4');

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', e => console.log('  page error:', e.message));
await page.goto(new URL('trailer.html?render', URL_APP).href);
await page.waitForFunction(() => window.__ready);
await page.evaluate(() => window.__ready());
const total = await page.evaluate(() => window.__total);
const end = Math.min(total, to ? +to : total);
const beats = await page.evaluate(() => window.__timeline());
const scoreVol = await page.evaluate(() => window.__scoreVol);

if (stills) {
  const dir = join(dirname(OUT), 'stills'); mkdirSync(dir, { recursive: true });
  for (const t of stills.split(',').map(Number)) {
    await page.evaluate(t => window.__seek(t), t);
    await page.screenshot({ path: join(dir, `t${t.toFixed(1)}.jpg`), type: 'jpeg', quality: 85 });
  }
  console.log(`stills in ${dir}`);
  await browser.close();
  process.exit(0);
}

/* the picture: frames piped straight into the encoder */
const silent = OUT.replace(/\.mp4$/, '.video.mp4');
if (!remix) {
const enc = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent], { stdio: ['pipe', 'inherit', 'inherit'] });
const n = Math.round((end - from) * FPS);
const t0 = Date.now();
for (let f = 0; f < n; f++) {
  await page.evaluate(t => window.__seek(t), from + f / FPS);
  const jpg = await page.screenshot({ type: 'jpeg', quality: 92 });
  if (!enc.stdin.write(jpg)) await new Promise(r => enc.stdin.once('drain', r));
  if (f % 150 === 0) process.stdout.write(`\r  frame ${f}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
enc.stdin.end();
await new Promise(r => enc.on('close', r));
console.log(`\r  ${n} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();

/* the sound: each clip's own voice, cut and laid at its beat. Of a pair of
   phones only the first is heard, as in the page. */
const parts = [];
for (const b of beats) {
  const m = b.media[0];
  if (!m) continue;
  const s = Math.max(b.start, from), e = Math.min(b.start + b.dur, end);
  if (e <= s) continue;
  parts.push({ clip: m.clip, ss: m.from + (s - b.start), len: e - s, at: s - from });
}
const ins = [...parts.flatMap(p => ['-i', join(ROOT, 'trailer/clips', p.clip + '.mp4')]), '-i', join(ROOT, 'trailer/score.m4a')];
const music = parts.length + 1;
const fx = parts.map((p, i) => `[${i + 1}:a]atrim=${p.ss.toFixed(3)}:${(p.ss + p.len).toFixed(3)},asetpts=PTS-STARTPTS,afade=t=out:st=${Math.max(0, p.len - 0.25).toFixed(3)}:d=0.25,adelay=${Math.round(p.at * 1000)}:all=1[a${i}]`);
/* the score (tools/trailer/music.mjs) under it all, as the page plays it */
fx.push(`[${music}:a]atrim=${from.toFixed(3)}:${end.toFixed(3)},asetpts=PTS-STARTPTS,volume=${scoreVol}[m]`);
const mix = `${parts.map((_, i) => `[a${i}]`).join('')}[m]amix=inputs=${parts.length + 1}:normalize=0:duration=longest,atrim=0:${(end - from).toFixed(3)},loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]`;
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', silent, ...ins, '-filter_complex', [...fx, mix].join(';'),
  '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', '-t', (end - from).toFixed(3), OUT]);
/* the picture alone is kept, for --remix */
console.log(`  ${OUT}`);
