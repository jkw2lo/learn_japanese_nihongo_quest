/* Record every kana sound, every kana-stage word, every stage word and
   every example sentence, and bundle them as base64 AAC:
     js/audio-kana.js   the kana stage — loaded after the first screen
     js/audio-n5.js     stages 2 onward — loaded once words are open
   Both add to window.NQ_AUDIO rather than replace it, so they load in any order.

   Why bundle at all: see js/sound.js. Why record words whole, from kana:
   see README → Audio — a kanji's sound depends on its word, and kana
   stitched together sounds robotic.

   Needs macOS `say` and `afconvert`.
     node tools/make-audio.mjs            record what's missing, voice Kyoko
     node tools/make-audio.mjs --all      record everything again
     node tools/make-audio.mjs Kyoko      or name another ja_JP voice (implies --all) */

import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from 'fs';
import vm from 'vm';
import { fileURLToPath } from 'url';
import { join } from 'path';
import { tmpdir } from 'os';

const ARGS = process.argv.slice(2);
const VOICE = ARGS.find(a => !a.startsWith('--')) || 'Kyoko';
const ALL = ARGS.includes('--all') || ARGS.some(a => !a.startsWith('--'));
const BITRATE = '32000';
/* A single kana is short — を is about 0.11s — so the floor for "the voice
   is mute" is lower than Hanzi Quest's. */
const MIN_SECONDS = 0.06;

const root = fileURLToPath(new URL('../', import.meta.url));
const { KANA, KANA_WORDS, KANA_PAIRS_WORDS, KANA_CONCEPT, WORDS, furiKana, MENUS, MENU_PHRASES, menuItems, conj, isVerb, CONJ_TAUGHT } = new Function(
  ['js/data/kana.js', 'js/furi.js', 'js/conj.js', 'js/data/words.js', 'js/data/menu.js'].map(f => readFileSync(join(root, f), 'utf8')).join('\n') +
  '\nreturn {KANA, KANA_WORDS, KANA_PAIRS_WORDS, KANA_CONCEPT, WORDS, furiKana, MENUS, MENU_PHRASES, menuItems, conj, isVerb, CONJ_TAUGHT};')();

/* The text actually handed to `say` for a clip key, for any key the voice
   misreads on its own. A lone は or へ could be taken as the particles "wa"
   and "e". Checked by ear with Kyoko (2026-09-25): は says ha, へ says he,
   を says o — all fine, so nothing is needed yet. If a voice change breaks
   one, add a spelling that forces the sound, e.g. "は": "ハ". */
const SPEAK_AS = {};

/* Spoken by the introduction in js/guide.js (which needs the page to load). */
const GUIDE_SAY = ["わたしはコーヒーをのみます"];

function speakableKana() {
  const out = new Set();
  KANA.forEach(e => { if (!e.concept) out.add(e.say); });
  KANA_WORDS.forEach(w => out.add(w.w));
  KANA_PAIRS_WORDS.forEach(p => out.add(p.w));
  Object.values(KANA_CONCEPT).forEach(c => c.ex.forEach(x => out.add(x)));
  GUIDE_SAY.forEach(x => out.add(x));
  /* the café opens with katakana, so its dishes ship with the kana */
  menuItems(MENUS[0]).forEach(it => out.add(it.kana));
  return [...out];
}

/* Always from kana: the voice never has to guess a kanji's reading. */
function speakableN5() {
  const kana = new Set(speakableKana());
  const out = new Set();
  WORDS.forEach(w => { out.add(w.say); w.ex.forEach(([jp]) => out.add(furiKana(jp))); });
  menuItems(MENUS[1]).forEach(it => out.add(it.kana));
  /* every taught form of every verb */
  WORDS.filter(w => isVerb(w.pos)).forEach(w => CONJ_TAUGHT.forEach(f => out.add(furiKana(conj(w.w, w.pos, f)))));
  MENU_PHRASES.forEach(([jp]) => out.add(furiKana(jp).replace('〜', '')));
  return [...out].filter(t => !kana.has(t));
}

export const BUNDLES = { 'js/audio-kana.js': speakableKana, 'js/audio-n5.js': speakableN5 };
export const speakable = () => [...speakableKana(), ...speakableN5()];

function readBundle(file) {
  if (!existsSync(file)) return {};
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(readFileSync(file, 'utf8'), ctx);
  return ctx.window.NQ_AUDIO || {};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const work = mkdtempSync(join(tmpdir(), 'nq-audio-'));
  for (const [rel, list] of Object.entries(BUNDLES)) {
    const file = join(root, rel);
    const WANTED = list();
    /* Keep what's already recorded (and still wanted) unless asked for --all:
       adding one word shouldn't mean minutes of re-recording. */
    const old = ALL ? {} : readBundle(file);
    const clips = {}, silent = [];
    WANTED.forEach(t => { if (old[t]) clips[t] = old[t]; });
    const todo = WANTED.filter(t => !clips[t]);
    console.log(`${rel}: ${WANTED.length - todo.length} kept, speaking ${todo.length} as ${VOICE}`);
    todo.forEach((t, i) => {
      const aiff = join(work, 'c.aiff'), m4a = join(work, 'c.m4a');
      execFileSync('say', ['-v', VOICE, '-o', aiff, SPEAK_AS[t] || t]);
      const info = execFileSync('afinfo', [aiff]).toString();
      const dur = parseFloat((info.match(/estimated duration: ([\d.]+)/) || [])[1] || '0');
      if (dur < MIN_SECONDS) { silent.push(t); return; }
      execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', BITRATE, aiff, m4a]);
      clips[t] = readFileSync(m4a).toString('base64');
      if ((i + 1) % 50 === 0) console.log(`  ${i + 1}/${todo.length}`);
    });
    const out = `/* Spoken audio, generated by tools/make-audio.mjs (voice: ${VOICE}).
   Do not hand-edit. Regenerate after adding words. */
window.NQ_AUDIO = Object.assign(window.NQ_AUDIO || {}, ${JSON.stringify(clips)});
`;
    writeFileSync(file, out);
    console.log(`  ${Object.keys(clips).length} clips → ${rel} (${(out.length / 1024).toFixed(0)} KB)`);
    if (silent.length) console.log(`  no audio for: ${silent.join(' ')}`);
  }
  rmSync(work, { recursive: true, force: true });
}
