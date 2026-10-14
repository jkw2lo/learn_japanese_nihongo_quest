/* The trailer's score, synthesised — nobody's music but the code's:
     node tools/trailer/music.mjs        → trailer/score.m4a

   Plucked strings (Karplus–Strong, something like a koto) on the yo scale
   (D E G A B — no semitones, so any two notes sit well together), a soft
   pad under them, and a taiko hit at each act. It follows the trailer's
   own timeline (BEATS in trailer.html): sparse in the cold open, an
   arpeggio for the basics, fuller out in town, quicker for play, and one
   chord left ringing at the end. */

import { readFileSync, writeFileSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { join } from 'path';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SR = 44100;

/* the beats, read from the page so the music can't drift from it */
const html = readFileSync(join(ROOT, 'trailer.html'), 'utf8');
const beats = []; let t = 0;
for (const [, kind, dur] of html.matchAll(/\{ kind: "(\w+)", dur: ([\d.]+)/g)) { beats.push({ kind, start: t, dur: +dur }); t += +dur; }
const TOTAL = t;
const at = kind => beats.filter(b => b.kind === kind).map(b => b.start);
const acts = at('act'), logo = at('logo')[0], stats = at('stats')[0], end = at('end')[0];

const N = Math.ceil((TOTAL + 0.1) * SR);
const L = new Float32Array(N), R = new Float32Array(N);

/* seeded, so the score is the same every time */
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const hz = m => 440 * Math.pow(2, (m - 69) / 12);

function pluck(time, midi, vel = 0.5, pan = 0, decay = 0.996) {
  const f = hz(midi), period = Math.round(SR / f), buf = new Float32Array(period);
  for (let i = 0; i < period; i++) buf[i] = rnd() * 2 - 1;
  const s0 = Math.round(time * SR), len = Math.min(N - s0, SR * 4);
  let idx = 0, prev = 0;
  const gl = vel * Math.cos((pan + 1) * Math.PI / 4), gr = vel * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < len; i++) {
    const cur = buf[idx];
    const next = decay * 0.5 * (cur + prev);       /* the averaging that makes it a string */
    prev = cur; buf[idx] = next; idx = (idx + 1) % period;
    const env = i < 40 ? i / 40 : 1;
    L[s0 + i] += cur * gl * env; R[s0 + i] += cur * gr * env;
  }
}

function pad(from, to, midis, vel = 0.05) {
  const s0 = Math.round(from * SR), s1 = Math.min(N, Math.round(to * SR)), fade = SR * 1.2;
  for (let i = s0; i < s1; i++) {
    const k = i - s0, env = Math.min(1, k / fade, (s1 - i) / fade);
    let v = 0;
    for (const m of midis) { const f = hz(m); v += Math.sin(2 * Math.PI * f * i / SR) + 0.25 * Math.sin(2 * Math.PI * f * 2.001 * i / SR + 1); }
    v *= vel * env / midis.length;
    L[i] += v; R[i] += v * 0.96;
  }
}

function taiko(time, vel = 0.9) {
  vel *= 0.4;
  const s0 = Math.round(time * SR), len = Math.min(N - s0, SR * 1.4);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const u = i / SR, f = 48 + 70 * Math.exp(-u * 18);   /* the skin's pitch falls */
    ph += 2 * Math.PI * f / SR;
    const v = vel * (Math.sin(ph) * Math.exp(-u * 4.5) + (rnd() * 2 - 1) * 0.35 * Math.exp(-u * 40));
    L[s0 + i] += v; R[s0 + i] += v;
  }
}

/* D yo scale, a few octaves */
const SCALE = [2, 4, 7, 9, 11];
const note = (deg, oct) => 12 * (oct + 1) + SCALE[((deg % 5) + 5) % 5] + 12 * Math.floor(deg / 5);
/* four chords round and round, as scale degrees: D, Em, G, A-ish */
const CHORDS = [[0, 3, 6], [1, 4, 6], [2, 5, 7], [3, 6, 8]];
const BEAT = 60 / 100;

function arpeggio(from, to, { step = BEAT / 2, oct = 4, vel = 0.32, every = 1, spread = 0.6 } = {}) {
  let k = 0;
  for (let time = from; time < to - 0.05; time += step, k++) {
    if (k % every) continue;
    const bar = Math.floor((time - from) / (BEAT * 4));
    const ch = CHORDS[bar % 4], d = ch[k % 3] + (k % 6 >= 3 ? 2 : 0);
    pluck(time, note(d, oct), vel * (k % 4 === 0 ? 1 : 0.7), ((k % 5) / 4 - 0.5) * spread);
  }
}
function bass(from, to, vel = 0.28) {
  for (let time = from, k = 0; time < to - 0.05; time += BEAT * 2, k++) {
    const bar = Math.floor((time - from) / (BEAT * 4));
    pluck(time, note(CHORDS[bar % 4][0], 2), vel, 0, 0.998);
  }
}

/* the cold open: a note at a time, a held drone */
const open1 = acts[0];
pad(0, logo + 2.5, [note(0, 2), note(3, 3)], 0.06);
[[0.2, 3, 5], [1.2, 5, 4], [2.85, 0, 5], [4.6, 3, 4], [6.4, 1, 5], [9.1, 2, 5], [10.8, 4, 4]].forEach(([tm, d, o]) => pluck(tm, note(d, o), 0.42, (rnd() - .5) * .6));
/* the title: a strum and a drum */
taiko(logo, 0.8);
[0, 3, 6, 8, 10].forEach((d, i) => pluck(logo + i * 0.045, note(d, 3), 0.42, (i / 4 - .5) * .8, 0.998));

/* act one, the basics: an arpeggio */
taiko(open1, 0.7);
arpeggio(open1 + 0.4, acts[1], { oct: 4, vel: 0.26 });
pad(open1, acts[1], [note(0, 3), note(2, 3)], 0.035);

/* act two, out in town: fuller, with a bass under it */
taiko(acts[1], 0.85);
arpeggio(acts[1] + 0.4, acts[2], { oct: 4, vel: 0.24 });
arpeggio(acts[1] + 0.4 + BEAT * 8, acts[2], { oct: 5, vel: 0.12, every: 3 });
bass(acts[1] + 0.4, acts[2]);
pad(acts[1], acts[2], [note(0, 3), note(3, 3), note(5, 3)], 0.03);

/* act three, play: quicker and higher */
taiko(acts[2], 0.9);
taiko(acts[2] + BEAT * 0.75, 0.45);
arpeggio(acts[2] + 0.3, stats, { step: BEAT / 4, oct: 5, vel: 0.17 });
bass(acts[2] + 0.3, stats, 0.3);

/* the numbers, and the end: settle, and one chord left ringing */
arpeggio(stats, end, { oct: 4, vel: 0.22 });
pad(stats, TOTAL, [note(0, 3), note(2, 3), note(4, 3)], 0.04);
taiko(end, 0.75);
[0, 2, 3, 5, 7, 10].forEach((d, i) => pluck(end + i * 0.06, note(d, 3), 0.42, (i / 5 - .5) * .9, 0.9985));

/* a little room: two echoes, crossing sides */
const D = Math.round(SR * BEAT * 0.75);
for (let i = D; i < N; i++) { L[i] += R[i - D] * 0.22; R[i] += L[i - D] * 0.22; }

/* level it by the body of the music, not its loudest drum: the odd peak
   over that is rounded off by the tanh below, the way tape would */
const mags = new Float32Array(N); for (let i = 0; i < N; i++) mags[i] = Math.max(Math.abs(L[i]), Math.abs(R[i]));
mags.sort();
const g = 0.7 / mags[Math.floor(N * 0.999)], fadeFrom = N - SR * 1.2;
const pcm = Buffer.alloc(N * 4);
for (let i = 0; i < N; i++) {
  const f = i > fadeFrom ? (N - i) / (N - fadeFrom) : 1;
  pcm.writeInt16LE(Math.round(Math.tanh(L[i] * g) * f * 32767), i * 4);
  pcm.writeInt16LE(Math.round(Math.tanh(R[i] * g) * f * 32767), i * 4 + 2);
}
const head = Buffer.alloc(44);
head.write('RIFF', 0); head.writeUInt32LE(36 + pcm.length, 4); head.write('WAVE', 8); head.write('fmt ', 12);
head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(2, 22); head.writeUInt32LE(SR, 24);
head.writeUInt32LE(SR * 4, 28); head.writeUInt16LE(4, 32); head.writeUInt16LE(16, 34); head.write('data', 36); head.writeUInt32LE(pcm.length, 40);
const wav = join(ROOT, 'tools/.cache/score.wav');
writeFileSync(wav, Buffer.concat([head, pcm]));
const out = join(ROOT, 'trailer/score.m4a');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out]);
rmSync(wav);
console.log(`  score: ${TOTAL.toFixed(1)}s → ${out}`);
