/* Record every kana sound, every kana-stage word, every stage word and
   every example sentence, and bundle them as base64 AAC:
     js/audio-kana.js     the kana stage — loaded after the first screen
     js/audio-s<N>.js     one per word stage — loaded as the learner reaches it
     js/audio-grammar.js  the Grammar tab's sentences — loaded when it opens
     js/audio-place-<id>.js  one per place out and about (menus, signs, the station,
                          shop talk…) — loaded when that place opens
     js/audio-konbini.js  the convenience store: every name, slogan, tag and label
   All add to window.NQ_AUDIO rather than replace it, so they load in any order.

   Why bundle at all: see js/sound.js. Why record words whole, from kana:
   see README → Audio — a kanji's sound depends on its word, and kana
   stitched together sounds robotic.

   Needs macOS `say` and `afconvert`.
     node tools/make-audio.mjs            record what's missing, voice Kyoko
     node tools/make-audio.mjs --all      record everything again
     node tools/make-audio.mjs Kyoko      or name another ja_JP voice (implies --all) */

import { execFileSync } from 'child_process';
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, readdirSync, unlinkSync } from 'fs';
import vm from 'vm';
import { fileURLToPath } from 'url';
import { join } from 'path';
import { tmpdir } from 'os';
import { writeHashes } from './hashes.mjs';

const ARGS = process.argv.slice(2);
const VOICE = ARGS.find(a => !a.startsWith('--')) || 'Kyoko';
const ALL = ARGS.includes('--all') || ARGS.some(a => !a.startsWith('--'));
const BITRATE = '24000';     /* speech is clear at 24k; 32k was a quarter bigger */
/* A single kana is short — を is about 0.11s — so the floor for "the voice
   is mute" is lower than Hanzi Quest's. */
const MIN_SECONDS = 0.06;

const root = fileURLToPath(new URL('../', import.meta.url));
const { KANA, KANA_WORDS, KANA_PAIRS_WORDS, KANA_CONCEPT, WORDS, furiKana, MENUS, MENU_PHRASES, menuItems, conj, isVerb, isConjugable, formsFor, CONJ_TAUGHT, PATTERNS, GRAMMAR_SAY, SCENES, KONBINI } = new Function(
  ['js/data/kana.js', 'js/furi.js', 'js/conj.js', 'js/data/words.js', 'js/data/patterns.js', 'js/data/menu.js', 'js/data/grammar.js', 'js/data/scenes.js', 'js/data/konbini.js'].map(f => readFileSync(join(root, f), 'utf8')).join('\n') +
  '\nreturn {KANA, KANA_WORDS, KANA_PAIRS_WORDS, KANA_CONCEPT, WORDS, furiKana, MENUS, MENU_PHRASES, menuItems, conj, isVerb, isConjugable, formsFor, CONJ_TAUGHT, PATTERNS, GRAMMAR_SAY, SCENES, KONBINI};')();

/* The text actually handed to `say` for a clip key, for any key the voice
   misreads on its own. A lone は or へ could be taken as the particles "wa"
   and "e". Checked by ear with Kyoko (2026-09-25): は says ha, へ says he,
   を says o — all fine, so nothing is needed yet. If a voice change breaks
   one, add a spelling that forces the sound, e.g. "は": "ハ". */
const SPEAK_AS = {
  /* the konbini's 人気No.1: "No." alone could come out as "no" */
  "にんきNo.1": "にんきナンバーワン",
};

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

/* Always from kana: the voice never has to guess a kanji's reading.

   One bundle per word stage, so a learner downloads what they've reached
   rather than everything at once: a stage's words, their examples and
   forms, and its patterns' sentences (the diner menu rides with stage 5).
   A clip already in the kana bundle or an earlier stage isn't repeated. */
function stageClips(st) {
  const out = new Set();
  WORDS.filter(w => w.st === st).forEach(w => {
    out.add(w.say);
    w.ex.forEach(([jp]) => out.add(furiKana(jp)));
    if (isConjugable(w.pos)) [...formsFor(w.pos), ...(isVerb(w.pos) ? ['te', 'ta', 'nai'] : [])].forEach(f => out.add(furiKana(conj(w.w, w.pos, f))));
  });
  PATTERNS.filter(p => p.st === st).forEach(p => p.ex.forEach(e => out.add(e.kana)));
  if (st === 5) {
    menuItems(MENUS[1]).forEach(it => out.add(it.kana));
    MENU_PHRASES.forEach(([jp]) => out.add(furiKana(jp).replace('〜', '')));
  }
  return [...out];
}

const STAGES = [...new Set(WORDS.map(w => w.st))].sort((a, b) => a - b);
function stageBundles() {
  const seen = new Set(speakableKana());
  const out = {};
  STAGES.forEach(st => {
    out[`js/audio-s${st}.js`] = stageClips(st).filter(t => !seen.has(t));
    out[`js/audio-s${st}.js`].forEach(t => seen.add(t));
  });
  out['js/audio-grammar.js'] = GRAMMAR_SAY.map(s => furiKana(s)).filter(t => !seen.has(t));
  out['js/audio-grammar.js'].forEach(t => seen.add(t));
  /* Out and about: one bundle per place, fetched when you go there, so a
     visit downloads that place's sound and not every place's. Each loads
     only itself (and the kana one, which is always there), so they repeat
     what the stage bundles have rather than leave a word silent for someone
     who hasn't reached that stage — ねた was, until 0.18.0, because stage 8
     had it, and the diner's dishes were, until 0.24.0, because stage 5 did. */
  const kana = new Set(speakableKana());
  const talk = sc => {
    const t = sc.walk?.talk, out = t ? [t.party, ...t.parties, t.seat, ...t.seats, t.go, ...t.more].map(([w]) => furiKana(w)) : [];
    (sc.walk?.terms || []).forEach(([w]) => out.push(furiKana(w)));
    (sc.walk?.loop || []).forEach(d => out.push(furiKana(d.to)));
    (sc.walk?.ann || []).forEach(([w]) => out.push(furiKana(w)));
    (sc.walk?.onboard || []).forEach(([w]) => out.push(furiKana(w)));
    (sc.walk?.ads || []).forEach(a => out.push(furiKana(a.head), furiKana(a.sub)));
    /* every station, by name and as the next stop */
    if (sc.walk?.loop) sc.walk.loop.forEach(d => out.push(furiKana(d.to + "{駅|えき}"), furiKana("{次|つぎ}は、" + d.to + "です。"), furiKana("まもなく、" + d.to + "です。")));
    return out;
  };
  const own = list => [...new Set(list)].filter(t => !kana.has(t));
  MENUS.forEach(M => { out[`js/audio-place-${M.id}.js`] = own([...menuItems(M).map(it => it.kana), ...MENU_PHRASES.map(([jp]) => furiKana(jp).replace('〜', ''))]); });
  SCENES.forEach(sc => { out[`js/audio-place-${sc.id}.js`] = own([...sc.all.map(x => x.kana), ...(sc.lines || []).map(([w]) => furiKana(w)), ...talk(sc)]); });
  out['js/audio-konbini.js'] = [...new Set(KONBINI.flatMap(p => [p.name, p.copy, ...p.tags, ...p.back.map(r => r[0])].map(furiKana)))].filter(t => !kana.has(t));
  return out;
}

export const BUNDLES = { 'js/audio-kana.js': speakableKana, ...Object.fromEntries(Object.entries(stageBundles()).map(([f, list]) => [f, () => list])) };

export const speakable = () => Object.values(BUNDLES).flatMap(f => f());

function readBundle(file) {
  if (!existsSync(file)) return {};
  const ctx = { window: {} };
  vm.createContext(ctx);
  vm.runInContext(readFileSync(file, 'utf8'), ctx);
  return ctx.window.NQ_AUDIO || {};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const work = mkdtempSync(join(tmpdir(), 'nq-audio-'));
  /* every clip already recorded, whichever bundle it's in */
  const OLD = {};
  readdirSync(join(root, 'js')).filter(f => /^audio-.*\.js$/.test(f)).forEach(f => Object.assign(OLD, readBundle(join(root, 'js', f))));
  for (const [rel, list] of Object.entries(BUNDLES)) {
    const file = join(root, rel);
    const WANTED = list();
    /* Keep what's already recorded (and still wanted) unless asked for --all:
       adding one word shouldn't mean minutes of re-recording. */
    const old = ALL ? {} : OLD;
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
  /* bundles no longer made (audio-n5.js, from before the split) go */
  readdirSync(join(root, 'js')).filter(f => /^audio-.*\.js$/.test(f) && !BUNDLES['js/' + f]).forEach(f => { unlinkSync(join(root, 'js', f)); console.log(`removed js/${f}`); });
  writeHashes();
  console.log('re-hashed → js/assets.js');
}
