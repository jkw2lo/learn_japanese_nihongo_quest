/* The trailer's camera: drives the real app in a fresh, throwaway browser
   (never your own progress) and films it.

   Frames come from Chrome's screencast, so they're the page itself at 2×,
   not a screen grab; ffmpeg turns them into an H.264 clip at a steady 30fps.
   Every say() is logged with its time, and its recording is laid under the
   clip, so a clip carries the app's own voice. A finger dot is drawn where
   the pointer goes down, since nobody watching can see a tap.

   Playwright isn't a dependency of the app: install it once into the
   ignored cache with  npm i --prefix tools/.cache/pw playwright  */

import { createRequire } from 'module';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(join(ROOT, 'tools/.cache/pw/'));
const { chromium } = require('playwright');

export const URL_APP = process.env.APP_URL || 'http://localhost:8732/';
export const sleep = ms => new Promise(r => setTimeout(r, ms));

/* The finger: a soft dot while the pointer is down, a ring where it lifts. */
const FINGER = () => {
  addEventListener('DOMContentLoaded', () => {
    const st = document.createElement('style');
    st.textContent = `.tr-f{position:fixed;z-index:2147483647;width:38px;height:38px;margin:-19px 0 0 -19px;border-radius:50%;
      background:rgba(255,255,255,.55);box-shadow:0 0 0 2px rgba(0,0,0,.18),0 2px 10px rgba(0,0,0,.25);pointer-events:none;
      transition:opacity .25s,transform .25s;opacity:0;transform:scale(.6)}
      .tr-f.on{opacity:1;transform:scale(1)}
      .tr-r{position:fixed;z-index:2147483647;width:38px;height:38px;margin:-19px 0 0 -19px;border-radius:50%;pointer-events:none;
      border:2px solid rgba(255,255,255,.9);box-shadow:0 0 0 1px rgba(0,0,0,.15);animation:trR .45s ease-out forwards}
      @keyframes trR{to{transform:scale(1.9);opacity:0}}`;
    document.head.appendChild(st);
    const f = document.createElement('div'); f.className = 'tr-f'; document.body.appendChild(f);
    const at = e => { f.style.left = e.clientX + 'px'; f.style.top = e.clientY + 'px'; };
    addEventListener('pointerdown', e => { at(e); f.classList.add('on'); }, true);
    addEventListener('pointermove', e => at(e), true);
    addEventListener('pointerup', e => {
      f.classList.remove('on');
      const r = document.createElement('div'); r.className = 'tr-r';
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
      document.body.appendChild(r); setTimeout(() => r.remove(), 500);
    }, true);
  });
};

/* A learner a few weeks in: every kana, about half the words, most of the
   grammar, a shelf and a half of toys and some coins. */
export function seed() {
  const t = today();
  KANA.forEach(e => learn(e.k));
  const ws = Object.keys(WORD_BY); ws.slice(0, Math.floor(ws.length * 0.55)).forEach(k => learn(k));
  Object.keys(KANJI_BY).slice(0, 60).forEach(k => learn(k));
  Object.keys(PATTERN_BY).slice(0, 28).forEach(k => learn(k));
  state.gacha.earned = 520; state.gacha.spent = 300;
  TOY_SETS[0].toys.forEach(x => state.gacha.owned[x.id] = 1);
  TOY_SETS[1].toys.slice(0, 7).forEach(x => state.gacha.owned[x.id] = 1);
  for (let i = 1; i < 45; i++) {
    const k = addDays(t, -i);
    if (i > 41 || i % 13 !== 6) state.days[k] = { n: 20 + (i * 7) % 30, ok: { r: [], p: [] }, learned: [], rev: [], ms: 600000 + (i * 37 % 11) * 90000 };
  }
  MILESTONES.forEach(m => { if (m.test()) state.milestones[m.id] = addDays(t, -3); });
  save();
}

export async function open({ scheme = 'light', w = 390, h = 844, mobile = w < 700, seeded = seed, settings = {} } = {}) {
  const browser = await chromium.launch({ args: ['--force-device-scale-factor=2'] });
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile, colorScheme: scheme });
  await ctx.addInitScript(FINGER);
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('  page error:', e.message));
  await page.goto(URL_APP);
  await page.waitForFunction(() => typeof state !== 'undefined' && typeof go === 'function');
  if (seeded) await page.evaluate(seeded);
  await page.evaluate(s => { Object.assign(state.settings, s); save(); }, settings);
  await page.reload();
  await page.waitForFunction(() => typeof state !== 'undefined' && typeof go === 'function');
  await page.evaluate(() => document.fonts.ready);
  /* log every clip the app plays, for the soundtrack */
  await page.evaluate(() => {
    window.__said = [];
    const real = window.say;
    window.say = text => { const b64 = window.NQ_AUDIO && window.NQ_AUDIO[text]; if (b64) window.__said.push({ at: Date.now() / 1000, text, b64 }); return real(text); };
  });
  await sleep(400);
  return { browser, page };
}

/* A finger moving like a finger: eased, in small steps. */
export async function tap(page, sel, { hold = 90 } = {}) {
  const el = typeof sel === 'string' ? page.locator(sel).first() : sel;
  await el.scrollIntoViewIfNeeded();
  const b = await el.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down(); await sleep(hold); await page.mouse.up();
}
export async function drag(page, pts, { ms = 500 } = {}) {
  await page.mouse.move(pts[0][0], pts[0][1]);
  await page.mouse.down();
  const steps = Math.max(8, Math.round(ms / 16));
  for (let i = 1; i <= steps; i++) {
    const u = i / steps, f = u * (pts.length - 1), j = Math.min(pts.length - 2, Math.floor(f)), v = f - j;
    const e = v < .5 ? 2 * v * v : 1 - 2 * (1 - v) * (1 - v);
    await page.mouse.move(pts[j][0] + (pts[j + 1][0] - pts[j][0]) * (pts.length > 2 ? v : e), pts[j][1] + (pts[j + 1][1] - pts[j][1]) * (pts.length > 2 ? v : e));
    await sleep(ms / steps);
  }
  await page.mouse.up();
}
/* Smooth scrolling, for a camera move rather than a jump. */
export async function pan(page, toY, ms = 900) {
  await page.evaluate(([toY, ms]) => new Promise(res => {
    const y0 = scrollY, t0 = performance.now();
    const f = t => { const u = Math.min(1, (t - t0) / ms), e = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      scrollTo(0, y0 + (toY - y0) * e); u < 1 ? requestAnimationFrame(f) : res(); };
    requestAnimationFrame(f);
  }), [toY, ms]);
}

/* Film fn() into <out>/<name>.mp4 (and a poster .jpg of its first frame). */
export async function film(page, out, name, fn, { tail = 300, crop = null, pad = 0 } = {}) {
  const dir = join(out, `.frames-${name}`);
  rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', f => {
    frames.push({ at: f.metadata.timestamp, data: f.data });
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  const vp = page.viewportSize();
  /* crop: a selector, framed on its own (measured once: the camera holds still) */
  let box = null;
  if (crop) {
    /* one selector, or several framed together, with room round the edge */
    const bs = await Promise.all([].concat(crop).map(s => page.locator(s).first().boundingBox()));
    const x0 = Math.min(...bs.map(b => b.x)) - pad, y0 = Math.min(...bs.map(b => b.y)) - pad;
    const x1 = Math.max(...bs.map(b => b.x + b.width)) + pad, y1 = Math.max(...bs.map(b => b.y + b.height)) + pad;
    box = { x: Math.max(0, x0), y: Math.max(0, y0) };
    box.w = Math.min(x1, vp.width) - box.x; box.h = Math.min(y1, vp.height) - box.y;
  }
  await page.evaluate(() => { window.__said = []; });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: vp.width * 2, maxHeight: vp.height * 2, everyNthFrame: 1 });
  await sleep(250);
  const t0 = Date.now() / 1000;
  await fn();
  await sleep(tail);
  const t1 = Date.now() / 1000;
  await cdp.send('Page.stopScreencast');
  const said = await page.evaluate(() => window.__said);
  await cdp.detach();
  if (!frames.length) throw new Error(`${name}: no frames`);

  /* frames arrive only when something changes: hold each until the next */
  const start = Math.max(frames[0].at, t0 - 0.1);
  const keep = frames.filter((f, i) => i === frames.length - 1 || frames[i + 1].at > start);
  let list = '';
  keep.forEach((f, i) => {
    const p = join(dir, `${String(i).padStart(5, '0')}.jpg`);
    writeFileSync(p, Buffer.from(f.data, 'base64'));
    const from = Math.max(f.at, start), to = i < keep.length - 1 ? keep[i + 1].at : t1;
    list += `file '${p}'\nduration ${Math.max(0.001, to - from).toFixed(4)}\n`;
  });
  list += `file '${join(dir, String(keep.length - 1).padStart(5, '0') + '.jpg')}'\n`;
  writeFileSync(join(dir, 'list.txt'), list);
  const dur = t1 - start;
  if (box) {
    /* the box was measured in CSS pixels; frames come at the screencast's scale */
    const fw = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width', '-of', 'csv=p=0', join(dir, '00000.jpg')]).toString().trim();
    const k = fw / vp.width, e = v => 2 * Math.round(v * k / 2);
    box = { x: e(box.x), y: e(box.y), w: e(box.w), h: e(box.h) };
  }

  /* the voice: each clip decoded and set at its moment */
  const args = ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', join(dir, 'list.txt')];
  const voice = said.filter(s => s.at >= start - 0.05 && s.at <= t1);
  voice.forEach((s, i) => {
    const p = join(dir, `say${i}.m4a`);
    writeFileSync(p, Buffer.from(s.b64, 'base64'));
    args.push('-i', p);
  });
  let filter = `[0:v]${box ? `crop=${box.w}:${box.h}:${box.x}:${box.y},` : ''}fps=30,format=yuv420p[v]`;
  if (voice.length) {
    filter += ';' + voice.map((s, i) => `[${i + 1}:a]aresample=48000,adelay=${Math.round((s.at - start) * 1000)}:all=1[a${i}]`).join(';');
    filter += `;${voice.map((_, i) => `[a${i}]`).join('')}amix=inputs=${voice.length}:normalize=0,apad,atrim=0:${dur.toFixed(3)}[a]`;
  } else {
    filter += `;anullsrc=r=48000:cl=stereo,atrim=0:${dur.toFixed(3)}[a]`;
  }
  const mp4 = join(out, `${name}.mp4`);
  args.push('-filter_complex', filter, '-map', '[v]', '-map', '[a]', '-t', dur.toFixed(3),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-profile:v', 'high', '-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-movflags', '+faststart', mp4);
  execFileSync('ffmpeg', args);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(dir, '00000.jpg'), '-vf', `${box ? `crop=${box.w}:${box.h}:${box.x}:${box.y},` : ''}scale=iw/2:-1`, '-q:v', '4', join(out, `${name}.jpg`)]);
  rmSync(dir, { recursive: true, force: true });
  console.log(`  ${name}: ${dur.toFixed(1)}s${box ? ` ${box.w}×${box.h}` : ''}, ${keep.length} frames, ${voice.length} said`);
  return { name, dur, box, said: voice.map(s => ({ at: +(s.at - start).toFixed(2), text: s.text })) };
}
