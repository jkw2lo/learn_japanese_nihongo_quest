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
import { wanted as strokeWanted } from './fetch-strokes.mjs';

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
    'lessonsLearnedToday', 'learnedTodayCount', 'nextLessons', 'checkPassedToday', 'recordCheck', 'canRead', 'readableWords',
    'wordsByNewest', 'streak', 'practisedDays', 'recordSprint', 'exportState', 'parseBackup', 'freshState',
    'QUICK_MS', 'HIRA_CHECK', 'PASSES_FOR_SOLID'],
  'js/sound.js': ['say', 'sayKana', 'hasAudio', 'clipCount', 'unlockAudio', 'loadAudioBundle', 'soundBlocked'],
  'js/write.js': ['strokesFor', 'canWrite', 'markWriting', 'modelSvg', 'modelAnimMs', 'padHtml', 'bindPad', 'drawInk',
    'padUndo', 'padClear', 'pad', 'WRITE_TOL'],
  'js/furi.js': ['furiParse', 'furiKana', 'furiPlain', 'furiKanji', 'furiProblems', 'furiHtml'],
  'js/guide.js': ['GUIDE', 'KIND_INTRO', 'infoCard', 'guideCards', 'infoHtml', 'startGuide'],
  'js/app.js': ['ACTS', 'render', 'go', 'view', 'S', 'askConfirm', 'crumb', 'shuffle', 'esc', '$', '$$',
    'distractors', 'renderSoundBar', 'onAudioLoaded', 'toast', 'openSession', 'closeSheet', 'SET_NAME',
    'qWrite', 'showWrite', 'checkWrite', 'showStrokes', 'loadStrokes'],
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

/* ---------- the daily allowance ---------- */

section('the daily allowance');
{
  const s = sandbox();
  const run = code => vm.runInContext(code, s);
  run('load()');
  /* walk every day of hiragana at the default of five */
  const days = [];
  for (let d = 0; d < 60 && run('phase()') === 'hira'; d++) {
    run(`__.setShift(${d})`);
    const ls = run('nextLessons().map(L => L.id + ":" + L.items.length)');
    ok(ls.length > 0, `day ${d} offers nothing to learn`);
    const n = ls.reduce((t, x) => t + +x.split(':')[1], 0);
    ok(n <= 6, `day ${d} teaches ${n} kana (${ls.join(' ')}) — more than five and one of slack`);
    run('nextLessons().forEach(L => L.items.forEach(learn))');
    days.push(ls.length);
  }
  ok(days.length >= 18 && days.length <= 24, `hiragana should take about three weeks at five a day (took ${days.length})`);
  ok(run('nextLessons().length') === 0, 'once today\'s five are learned, nothing more is offered');
  const s2 = sandbox(); const run2 = code => vm.runInContext(code, s2);
  run2('load(); state.settings.newPerDay = 10');
  ok(run2('nextLessons().map(L => L.id).join()') === 'h-a,h-k', 'ten a day is two rows');
  /* lessons never exceed five, so a day's size is always close to the setting */
  ok(run('LESSONS.every(L => L.items.length <= 5)'), 'a lesson has more than five kana');
  /* an old save with lessonsPerDay drops it */
  run(`localStorage.setItem("nihongo-quest", JSON.stringify({ app: "nihongo-quest", settings: { lessonsPerDay: 2 } }))`);
  run('load()');
  ok(run('state.settings.lessonsPerDay') === undefined && run('state.settings.newPerDay') === 5, 'lessonsPerDay should migrate to newPerDay');
}

/* ---------- 4. the hiragana check ---------- */

section('the hiragana check');
{
  const s = sandbox();
  const run = code => vm.runInContext(code, s);
  run('load()');
  ok(run('phase()') === 'hira', 'a new learner starts on hiragana');
  ok(run('nextLessons().every(L => L.set === "h")'), 'no katakana before the gate');
  ok(run('state.settings.newPerDay') === 5, 'five new kana a day by default');
  ok(run('nextLessons().map(L => L.id).join()') === 'h-a', 'day one is the あ row alone');
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

/* ---------- writing ---------- */

section('writing');
{
  const w = { window: {}, Math, console };
  vm.createContext(w);
  vm.runInContext(read('js/strokes.js') + read('js/write.js') + ';globalThis.W = { markWriting, modelMedians };', w);
  const { markWriting, modelMedians } = w.W;
  const strokes = w.window.NQ_STROKES;
  const missing = strokeWanted().filter(k => !strokes[k]);
  ok(!missing.length, `no stroke data for: ${missing.join(' ')} — run node tools/fetch-strokes.mjs`);

  /* The standard stroke counts for the base kana. AnimCJK splits looped
     strokes into pieces; fetch-strokes.mjs merges them back, and the marking
     depends on the count being right. */
  const STD = { あ:3,い:2,う:2,え:2,お:3,か:3,き:4,く:1,け:3,こ:2,さ:3,し:1,す:2,せ:3,そ:1,た:4,ち:2,つ:1,て:1,と:2,
    な:4,に:3,ぬ:2,ね:2,の:1,は:3,ひ:1,ふ:4,へ:1,ほ:4,ま:3,み:2,む:3,め:2,も:3,や:3,ゆ:2,よ:2,ら:2,り:2,る:1,れ:2,ろ:1,
    わ:2,を:3,ん:1,ア:2,イ:2,ウ:3,エ:3,オ:3,カ:2,キ:3,ク:2,ケ:3,コ:2,サ:3,シ:3,ス:2,セ:2,ソ:2,タ:3,チ:3,ツ:3,テ:3,ト:2,
    ナ:2,ニ:2,ヌ:2,ネ:4,ノ:1,ハ:2,ヒ:2,フ:1,ヘ:1,ホ:4,マ:2,ミ:3,ム:2,メ:2,モ:3,ヤ:2,ユ:2,ヨ:3,ラ:2,リ:2,ル:2,レ:1,ロ:3,
    ワ:2,ヲ:3,ン:2 };
  Object.entries(STD).forEach(([k, n]) => ok(strokes[k]?.m.length === n, `${k} has ${strokes[k]?.m.length} strokes, should be ${n}`));
  Object.entries(strokes).forEach(([k, d]) => ok(d.s.length === d.m.length, `${k}: outlines and medians disagree`));

  /* seeded, so a failure reproduces */
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - 0.5; };
  const sloppy = st => {
    const sc = 1 + rnd() * 0.3, dx = rnd() * 200, dy = rnd() * 200;
    return st.map(s => { const ox = rnd() * 50, oy = rnd() * 50;
      return s.map(([x, y], i) => [512 + (x - 512) * sc + dx + ox + Math.sin(i) * 12, 512 + (y - 512) * sc + dy + oy + Math.cos(i) * 12]); });
  };
  const K = Object.keys(strokes);
  let pass = 0, n = 0;
  K.forEach(k => {
    ok(markWriting(k, modelMedians(k), false).ok, `${k}: its own strokes don't pass`);
    ok(markWriting(k, modelMedians(k), true).ok, `${k}: its own strokes don't pass in order`);
    for (let t = 0; t < 4; t++) { n++; if (markWriting(k, sloppy(modelMedians(k)), false).ok) pass++; }
  });
  ok(pass / n >= 0.93, `sloppy but right handwriting passes only ${(pass / n * 100).toFixed(1)}%`);
  /* look-alikes the marking must tell apart, even with order not checked */
  [['ソ', 'ン'], ['ン', 'ソ'], ['シ', 'ツ'], ['ツ', 'シ'], ['れ', 'わ'], ['わ', 'れ'], ['ね', 'れ'], ['は', 'ほ'], ['ほ', 'は'],
   ['さ', 'ち'], ['き', 'さ'], ['ぬ', 'め'], ['め', 'ぬ'], ['る', 'ろ'], ['ろ', 'る'], ['ば', 'ぱ'], ['ぱ', 'ば'], ['い', 'り']]
    .forEach(([asked, drawn]) => ok(!markWriting(asked, modelMedians(drawn), false).ok, `writing ${drawn} passes for ${asked}`));
  /* order: free ignores it, ordered doesn't */
  const shuffled = [...modelMedians('あ')].reverse();
  ok(markWriting('あ', shuffled, false).ok, 'free marking should accept any stroke order');
  ok(!markWriting('あ', shuffled, true).ok, 'stroke-order marking should refuse the wrong order');
  const backwards = modelMedians('し').map(st => [...st].reverse());
  ok(!markWriting('し', backwards, true).ok, 'stroke-order marking should refuse a backwards stroke');
  ok(!markWriting('は', modelMedians('は').slice(0, 2), false).ok, 'a missing stroke should fail');
}

/* ---------- furigana ---------- */

section('furigana');
{
  const f = {};
  vm.createContext(f);
  vm.runInContext(read('js/furi.js') + `;globalThis.F = { furiParse, furiKana, furiPlain, furiKanji, furiProblems, furiHtml };
    ${read('js/data/words.js')};globalThis.WORDS = WORDS;
    ${read('js/data/patterns.js')};globalThis.PATTERNS = PATTERNS;`, f);
  const { furiKana, furiPlain, furiKanji, furiProblems, furiHtml } = f.F;
  ok(furiKana('{食|た}べ{物|もの}') === 'たべもの', 'furiKana should take the reading side');
  ok(furiPlain('{食|た}べ{物|もの}') === '食べ物', 'furiPlain should take the kanji side');
  ok(furiKanji('{今日|きょう}は{日本|にほん}') .join('') === '今日本', 'furiKanji should list each kanji once');
  ok(furiKana('パンを{食|た}べます。') === 'パンをたべます。', 'kana and punctuation pass through');
  /* the checker catches what hand-typed data gets wrong */
  ok(furiProblems('{食|た}べる').length === 0, 'good markup should have no problems');
  ok(furiProblems('食べる').length === 1, 'a kanji with no reading should be caught');
  ok(furiProblems('{食|た べる').length === 1, 'an unclosed brace should be caught');
  ok(furiProblems('{食べ|たべ}る').length === 1, 'okurigana inside the braces should be caught');
  ok(furiProblems('{食|ta}べる').length === 1, 'a romaji reading should be caught');
  ok(furiProblems('{食|}べる').length === 1, 'an empty reading should be caught');
  /* rendering: bare only when every kanji in the run is known */
  const knows = k => k === '今';
  ok(furiHtml('{今日|きょう}', knows) === '<ruby>今日<rt>きょう</rt></ruby>', '今日 needs both kanji known to go bare');
  ok(furiHtml('{今|いま}', knows) === '今', 'a known kanji is shown bare');
  ok(furiHtml('{今|いま}', knows, 'always').includes('<ruby>'), '"always" shows furigana on known kanji');
  ok(!furiHtml('{日|ひ}', knows, 'never').includes('<ruby>'), '"never" hides furigana everywhere');
  ok(furiHtml('<b>', knows) === '&lt;b&gt;', 'text is escaped');
  /* and every string in the data that exists so far */
  const strings = [];
  f.WORDS.forEach(w => { strings.push(w.w); (w.ex || []).forEach(x => strings.push(x[0])); });
  f.PATTERNS.forEach(p => (p.ex || []).forEach(x => strings.push(x[0])));
  strings.forEach(x => furiProblems(x).forEach(pr => ok(false, pr)));
  ok(strings.length > 0, 'no word data found to check');
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
