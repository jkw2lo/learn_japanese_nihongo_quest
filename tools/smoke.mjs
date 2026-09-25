/* Run after touching js/:   node tools/smoke.mjs

   Loads the data and srs.js without a browser and checks what the app relies
   on: the names that cross file boundaries, the kana data, the romaji
   converter, the scheduling rules, the hiragana check, sprint bests, audio
   coverage and the version stamps. Exits non-zero on any failure. */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { join } from 'path';
import vm from 'vm';
import { speakable } from './make-audio.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = p => readFileSync(join(root, p), 'utf8');

let fails = 0, passes = 0;
const ok = (cond, msg) => { if (cond) passes++; else { fails++; console.log('  ✗ ' + msg); } };
const section = t => console.log(t);

/* ---------- a sandbox with the data and srs.js, and a fake localStorage ---------- */

function sandbox() {
  const store = {};
  const ctx = {
    console, Math, JSON, Date, Object, Array, Set, Map, String, Number, Error,
    localStorage: {
      getItem: k => (k in store ? store[k] : null),
      setItem: (k, v) => { store[k] = String(v); },
      removeItem: k => { delete store[k]; },
    },
  };
  vm.createContext(ctx);
  vm.runInContext(read('js/data/kana.js') + '\n' + read('js/srs.js') + `
    ;globalThis.__ = { get state() { return state; }, set state(v) { state = v; },
       setShift: n => { clockShift = n; } };`, ctx);
  return ctx;
}

/* ---------- 1. the contract: names one file uses from another ---------- */

section('contract');
/* Four classic scripts share one global scope, so a name removed from one
   file while another still calls it fails only at runtime, on a click. */
const CONTRACT = {
  'js/data/kana.js': ['LESSONS', 'KANA', 'KANA_BY', 'KANA_ALIKE', 'KANA_WORDS', 'KANA_PAIRS_WORDS',
    'KANA_CONCEPT', 'ROMAJI_ALT', 'kanaUnits', 'toRomaji', 'toHira', 'toKata'],
  'js/srs.js': ['state', 'load', 'save', 'today', 'addDays', 'daysBetween', 'pad2', 'asList', 'day', 'dayOkList',
    'item', 'isLearned', 'learnedKana', 'isDue', 'skill', 'skillsFor', 'learn', 'grade', 'solidness', 'standing',
    'shakiest', 'dueKeys', 'lessonLearned', 'allHiraLearned', 'hiraDoneDay', 'hiraCheckDays', 'kataOpen', 'phase',
    'lessonsLearnedToday', 'nextLessons', 'checkPassedToday', 'recordCheck', 'canRead', 'readableWords',
    'wordsByNewest', 'streak', 'practisedDays', 'recordSprint', 'exportState', 'parseBackup', 'freshState',
    'QUICK_MS', 'HIRA_CHECK', 'PASSES_FOR_SOLID'],
  'js/sound.js': ['say', 'sayKana', 'hasAudio', 'clipCount', 'unlockAudio', 'loadAudioBundle', 'soundBlocked'],
  'js/app.js': ['ACTS', 'render', 'go', 'view', 'S', 'askConfirm', 'crumb', 'shuffle', 'esc', '$', '$$',
    'distractors', 'renderSoundBar', 'onAudioLoaded', 'toast'],
  'js/sprint.js': ['renderSprint', 'sprintKey', 'sprintLabel'],
};
const declares = (src, name) => {
  const n = name.replace(/\$/g, '\\$');
  const edge = '(?<![\\w$])';            /* \b doesn't see $ as part of a name */
  return new RegExp(`${edge}function\\s+${n}\\s*\\(`).test(src)
    || new RegExp(`(?:const|let|var)\\s+(?:[^;\\n]*,\\s*)?${n}(?![\\w$])\\s*[=,;]`).test(src);
};
for (const [file, names] of Object.entries(CONTRACT)) {
  const src = read(file);
  names.forEach(n => ok(declares(src, n), `${file} no longer declares ${n}`));
}
/* and each file index.html loads is one that exists */
const html = read('index.html');
[...html.matchAll(/src="(js\/[^"?]+)/g)].forEach(m => ok(existsSync(join(root, m[1])), `index.html loads missing ${m[1]}`));

/* ---------- 2. the kana data ---------- */

section('data');
const c = sandbox();
const { KANA, KANA_BY, LESSONS, KANA_WORDS, KANA_PAIRS_WORDS, KANA_ALIKE, ROMAJI_ALT, toRomaji } = vm.runInContext(
  '({KANA, KANA_BY, LESSONS, KANA_WORDS, KANA_PAIRS_WORDS, KANA_ALIKE, ROMAJI_ALT, toRomaji})', c);
ok(new Set(KANA.map(e => e.k)).size === KANA.length, 'a kana appears twice');
ok(KANA.filter(e => e.set === 'h' && !e.concept).length === 104, 'hiragana should be 104 units plus っ');
LESSONS.forEach(L => ok(L.items.length === L.r.split(' ').length, `${L.id}: glyphs and romaji don't line up`));
KANA.forEach(e => {
  ok(!!e.r && !/[^a-z()' ]/.test(e.r), `${e.k} has odd romaji "${e.r}"`);
  const L = LESSONS.find(x => x.id === e.lesson);
  if (L.kind === 'base') ok(!!e.story, `${e.k} has no story`);
});
KANA_WORDS.forEach(w => w.units.forEach(u => ok(!!KANA_BY[u], `word ${w.w} uses ${u}, which no lesson teaches`)));
KANA_PAIRS_WORDS.forEach(p => {
  ok(!p.alt.includes(p.w), `pair ${p.w} lists itself as an alternative`);
  ok(!!KANA_BY[p.c]?.concept, `pair ${p.w} credits ${p.c}, which isn't a concept`);
});
KANA_ALIKE.flat().forEach(k => ok(!!KANA_BY[k], `look-alike ${k} isn't a kana`));
Object.keys(ROMAJI_ALT).forEach(r => ok(KANA.some(e => e.r === r), `ROMAJI_ALT has ${r}, which no kana reads as`));
/* a word shown in two places must agree with itself */
const seenM = {};
KANA_WORDS.forEach(w => { if (seenM[w.w]) ok(seenM[w.w] === w.m, `${w.w} means two things`); seenM[w.w] = w.m; });
KANA_PAIRS_WORDS.forEach(p => { if (seenM[p.w]) ok(seenM[p.w] === p.m, `${p.w}: "${p.m}" in pairs, "${seenM[p.w]}" in words`); });

section('romaji');
const R = { 'きって': 'kitte', 'ちょっと': 'chotto', 'コーヒー': 'koohii', 'ほんや': "hon'ya", 'きんえん': "kin'en",
  'こんにちは': 'konnichiha', 'マッチ': 'matchi', 'ティッシュ': 'tisshu', 'ぎゅうにゅう': 'gyuunyuu', 'を': 'o' };
Object.entries(R).forEach(([k, v]) => ok(toRomaji(k) === v, `toRomaji(${k}) = ${toRomaji(k)}, want ${v}`));
ok(KANA_WORDS.find(w => w.w === 'こんにちは').r === 'konnichiwa', 'こんにちは should override to konnichiwa');

/* ---------- 3. scheduling ---------- */

section('scheduling');
{
  const s = sandbox();
  const run = code => vm.runInContext(code, s);
  run('load()');
  run('learn("あ")');
  const t0 = run('today()');
  ok(run('item("あ").due') === run(`addDays("${t0}", 1)`), 'a new kana should be due tomorrow');
  run('grade("あ", "r", true, 500, "practice")');
  ok(run('item("あ").due') === run(`addDays("${t0}", 1)`), 'a right practice answer must not push the review out');
  ok(run('skill("あ","r").fast') === 1, 'a quick right answer should count as fast');
  run('grade("あ", "r", true, 9000, "practice")');
  ok(run('skill("あ","r").fast') === 1, 'a slow right answer must not count as fast');
  run('grade("あ", "r", false, 500, "practice")');
  ok(run('item("あ").due') === t0, 'a practice miss should pull the review to today');
  ok(run('state.mistakes["あ"]') === 1, 'a miss should reach the mistake notebook');
  const lvl = run('item("あ").lvl'), due = run('item("あ").due');
  run('grade("あ", "r", false, 500, "speed")');
  ok(run('item("あ").lvl') === lvl && run('item("あ").due') === due, 'a sprint miss must not touch the schedule');
  run('grade("あ", "r", true, 500, "review")');
  ok(run('item("あ").lvl') === lvl + 1, 'a right review should move the level up');
  ok(run('item("あ").due') > t0, 'a right review should push the due date out');
  ok(!run('dayOkList("r").includes("い")'), 'dayOkList should hold only what was answered');
}

section('storage');
{
  const s = sandbox();
  const run = code => vm.runInContext(code, s);
  /* a list that came back from JSON as an object is repaired, not reset */
  run(`localStorage.setItem("nihongo-quest", JSON.stringify({ app: "nihongo-quest", items: {},
        days: { "2026-01-01": { n: 3, learned: {"0":"あ","1":"い"}, rev: {}, ok: { r: {"0":"あ"} } } },
        sprint: { recent: {"0": {key: "read-h-20-1"}} } }))`);
  run('load()');
  ok(run('Array.isArray(state.days["2026-01-01"].learned) && state.days["2026-01-01"].learned.length === 2'), 'load() should repair a list stored as a map');
  ok(run('Array.isArray(state.days["2026-01-01"].ok.r)'), 'load() should repair ok lists');
  ok(run('Array.isArray(state.sprint.recent)'), 'load() should repair sprint.recent');
  ok(run('state.settings.showRomaji === false'), 'romaji should be hidden by default');
  let threw = false;
  try { run('parseBackup(\'{"state":{"app":"other"}}\')'); } catch { threw = true; }
  ok(threw, 'parseBackup should refuse another app\'s file');
  ok(run('parseBackup(exportState()).app') === 'nihongo-quest', 'a backup should round-trip');
}

/* ---------- 4. the hiragana check ---------- */

section('the hiragana check');
{
  const s = sandbox();
  const run = code => vm.runInContext(code, s);
  run('load()');
  ok(run('phase()') === 'hira', 'a new learner starts on hiragana');
  ok(run('nextLessons().every(L => L.set === "h")'), 'no katakana before the gate');
  ok(run('nextLessons().length') === 2, 'two lessons a day by default');
  /* learn every hiragana on day 0 */
  run('KANA.filter(e => e.set === "h").forEach(e => learn(e.k))');
  ok(run('phase()') === 'check', 'all hiragana learned → the check');
  ok(run('nextLessons().length') === 0, 'nothing new to learn during the check');
  run('recordCheck(100, 100)');
  ok(run('hiraCheckDays().length') === 0, 'a pass on the day hiragana finished must not count');
  run('__.setShift(1)');
  run('recordCheck(80, 100)');
  ok(run('hiraCheckDays().length') === 0, '80% must not pass');
  run('recordCheck(95, 100)');
  ok(run('hiraCheckDays().length') === 1, '95% the next day should count as day 1');
  run('recordCheck(80, 100)');
  ok(run('hiraCheckDays().length') === 1, 'a later fail the same day must not undo a pass');
  run('recordCheck(100, 100)');
  ok(run('hiraCheckDays().length') === 1, 'two passes on one day are still one day');
  ok(run('phase()') === 'check', 'one day is not enough');
  run('__.setShift(3)');
  run('recordCheck(90, 100)');
  ok(run('phase()') === 'kata', `two separate days should open katakana (got ${run('phase()')})`);
  ok(run('nextLessons()[0].id') === 'k-a', 'katakana starts with the ア row');
  run('state.kataOpen = null; __.setShift(3)');
  ok(run('kataOpen()'), 'katakana stays open once opened');
}

/* ---------- 5. sprint bests ---------- */

section('sprint');
{
  const s = sandbox();
  const run = code => vm.runInContext(code, s);
  run('load()');
  ok(!run('recordSprint("read-h-20-1", {right: 20, total: 20, ms: 60000, finished: false})'), 'an unfinished sheet must not set a best');
  ok(run('recordSprint("read-h-20-1", {right: 15, total: 20, ms: 50000, finished: true})'), 'a finished sheet sets a best');
  ok(!run('recordSprint("read-h-20-1", {right: 14, total: 20, ms: 20000, finished: true})'), 'fewer right is never better, however fast');
  ok(run('recordSprint("read-h-20-1", {right: 15, total: 20, ms: 40000, finished: true})'), 'same right and faster is better');
  ok(run('state.sprint.recent.length') === 4, 'every run goes into recent');
}

/* ---------- 6. audio coverage ---------- */

section('audio');
if (existsSync(join(root, 'js/audio-kana.js'))) {
  const a = { window: {} };
  vm.createContext(a);
  vm.runInContext(read('js/audio-kana.js'), a);
  const clips = a.window.NQ_AUDIO || {};
  const missing = speakable().filter(t => !clips[t]);
  ok(!missing.length, `no clip for: ${missing.slice(0, 20).join(' ')}${missing.length > 20 ? ' …' : ''} — run node tools/make-audio.mjs`);
} else {
  console.log('  (js/audio-kana.js not built — skipped; run node tools/make-audio.mjs)');
}

/* ---------- 7. version stamps ---------- */

section('version');
const ver = (html.match(/const APP_VERSION = "([^"]+)"/) || [])[1];
ok(!!ver, 'index.html has no APP_VERSION');
const local = [...html.matchAll(/(?:src|href)="((?:js|css)\/[^"]+)"/g)].map(m => m[1]);
local.forEach(u => ok(u.includes(`?v=${ver}`), `${u} isn't stamped with ?v=${ver}`));
ok(read('js/sound.js').includes('?v=${APP_VERSION}'), 'the audio bundle URL should carry the version');

console.log(`\n${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
