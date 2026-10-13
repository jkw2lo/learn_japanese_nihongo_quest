/* Check the words against JMdict — what smoke.mjs can't know on its own:
   that a reading is really the word's reading, that a verb conjugates the
   way its pos says, that a meaning is the word's meaning.

   For each word in js/data/words.js, find the JMdict entries written that way
   (by kanji, or by kana for a kana word), then:
     reading  the word's kana is one of the entry's readings
     pos      a verb's or adjective's class is one JMdict gives it
     meaning  the English shares a word with JMdict's glosses (a hint only:
              "to be stuck" and "to be troubled" mean the same; read the list)
   Words JMdict doesn't have (set phrases, counters written alone) are listed
   apart, not as errors. ACCEPT records the ones checked by hand and found
   right, with why, so a run only shows what's new.

   Source: JMdict, © EDRDG, CC BY-SA 4.0 — http://www.edrdg.org/edrdg/licence.html
     node tools/check-words.mjs          uses tools/.cache/JMdict_e, downloading it if missing
     node tools/check-words.mjs --all    also lists the accepted ones */

import { readFileSync, existsSync, mkdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { join } from 'path';

const root = fileURLToPath(new URL('../', import.meta.url));
const cache = join(root, 'tools/.cache');
const dictPath = join(cache, 'JMdict_e');
const ALL = process.argv.includes('--all');

/* Checked by hand: "plain|check" → why it's right. */
export const ACCEPT = {
  "出身|meaning": "one's origin — where you're from, as a learner would say it",
  "個|meaning": "JMdict's “counter for (small) things or pieces”",
  "大好き|meaning": "JMdict's “loving; liking very much”",
  "付ける|meaning": "JMdict lists “to turn on (a light)” among 付ける's senses",
  "大変|meaning": "the な-adjective sense, JMdict's “serious; hard; terrible”",
  "下手|meaning": "JMdict's “unskillful; poor” — bad at",
  "ううん|meaning": "JMdict's “no; nuh-uh”",
};

const kata2hira = s => s.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));

function parse(xml) {
  const byK = new Map(), byR = new Map();
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const b = m[1];
    const kebs = [...b.matchAll(/<keb>([^<]+)<\/keb>/g)].map(x => x[1]);
    const rebs = [...b.matchAll(/<r_ele>([\s\S]*?)<\/r_ele>/g)].map(x => ({
      reb: x[1].match(/<reb>([^<]+)<\/reb>/)[1],
      restr: [...x[1].matchAll(/<re_restr>([^<]+)<\/re_restr>/g)].map(y => y[1]),
    }));
    const pos = new Set([...b.matchAll(/<pos>&([^;]+);<\/pos>/g)].map(x => x[1]));
    const glosses = [...b.matchAll(/<gloss[^>]*>([^<]+)<\/gloss>/g)].map(x => x[1].toLowerCase());
    const e = { kebs, rebs, pos, glosses };
    kebs.forEach(k => { if (!byK.has(k)) byK.set(k, []); byK.get(k).push(e); });
    rebs.forEach(r => { if (!byR.has(r.reb)) byR.set(r.reb, []); byR.get(r.reb).push(e); });
  }
  return { byK, byR };
}

/* our pos → the JMdict classes that agree with it */
const POS_OK = {
  v1: ['v1', 'v1-s'], vk: ['vk'], 'v5k-s': ['v5k-s'], 'v5r-i': ['v5r-i'],
  v5u: ['v5u', 'v5u-s'], v5k: ['v5k'], v5g: ['v5g'], v5s: ['v5s'], v5t: ['v5t'], v5n: ['v5n'], v5b: ['v5b'], v5m: ['v5m'], v5r: ['v5r'],
  'adj-i': ['adj-i', 'adj-ix'], 'adj-na': ['adj-na'], vs: ['vs', 'vs-i', 'vs-s'],
};
const STOP = new Set('a an the to of be (be) is am are and or on in at for with by it one thing things someone something (to) not some'.split(' '));
const content = s => s.toLowerCase().replace(/\([^)]*\)/g, ' ').split(/[^a-z']+/).filter(w => w.length > 2 && !STOP.has(w));
/* loose on purpose: the first five letters, so grapes ~ grape, troubled ~
   trouble, practise ~ practice */
const stem = w => w.replace(/practis/, 'practic');
const near = (a, b) => { const n = Math.min(5, a.length, b.length); return n >= 4 && a.slice(0, n) === b.slice(0, n); };

export function checkWords(WORDS, dict) {
  const issues = [], missing = [];
  for (const w of WORDS) {
    const plain = w.plain, kana = kata2hira(w.kana);
    /* a する verb is the noun it's made of, with vs */
    const suru = w.pos === 'vs' && plain.endsWith('する') && plain !== 'する';
    const look = suru ? plain.slice(0, -2) : plain;
    const lookKana = suru ? kana.slice(0, -2) : kana;
    const hasKanji = /[㐀-鿿々]/.test(look);
    let es = hasKanji ? dict.byK.get(look) || [] : (dict.byR.get(look) || dict.byR.get(kata2hira(look)) || []);
    if (!es.length) { missing.push(w); continue; }
    const say = (check, msg) => {
      const id = `${plain}|${check}`;
      issues.push({ w, check, msg, accepted: ACCEPT[id] });
    };
    if (hasKanji) {
      const ok = es.some(e => e.rebs.some(r => kata2hira(r.reb) === lookKana && (!r.restr.length || r.restr.includes(look))));
      if (!ok) say('reading', `${w.w}: read ${lookKana}, JMdict has ${[...new Set(es.flatMap(e => e.rebs.map(r => r.reb)))].join('・')}`);
      /* of several entries written alike, the ones read our way */
      const read = es.filter(e => e.rebs.some(r => kata2hira(r.reb) === lookKana));
      if (read.length) es = read;
    }
    const want = POS_OK[w.pos];
    if (want) {
      const has = new Set(es.flatMap(e => [...e.pos]));
      const okPos = suru ? [...has].some(p => p.startsWith('vs')) : want.some(p => has.has(p));
      if (!okPos) say('pos', `${plain}: ${w.pos} here, JMdict has ${[...has].filter(p => /^(v|adj)/.test(p)).join(' ') || [...has].join(' ')}`);
    }
    const ours = content(w.m).map(stem);
    const theirs = [...new Set(es.flatMap(e => e.glosses.flatMap(content)).map(stem))];
    if (ours.length && !ours.some(x => theirs.some(y => x === y || near(x, y)))) say('meaning', `${plain}: "${w.m}" — JMdict: ${es[0].glosses.slice(0, 5).join('; ')}`);
  }
  return { issues, missing };
}

/* Every {kanji|reading} in the data and the app: a run of one kanji must be
   read one of KANJIDIC's ways (on, kun, or one with the sound changes words
   make: か→が, ふ→ぷ, いち→いっ); a longer run, kanji by kanji the same way,
   or as one JMdict word (今日 きょう, 大人 おとな, 二十歳 はたち). */
const VOICE = { か: 'が', き: 'ぎ', く: 'ぐ', け: 'げ', こ: 'ご', さ: 'ざ', し: 'じ', す: 'ず', せ: 'ぜ', そ: 'ぞ', た: 'だ', ち: 'ぢ', つ: 'づ', て: 'で', と: 'ど',
  は: 'ばぱ', ひ: 'びぴ', ふ: 'ぶぷ', へ: 'べぺ', ほ: 'ぼぽ' };
function variants(r) {
  const out = new Set([r]);
  const first = VOICE[r[0]];
  if (first) [...first].forEach(v => out.add(v + r.slice(1)));
  for (const x of [...out]) if (/[つちくきう]$/.test(x) && x.length > 1) out.add(x.slice(0, -1) + 'っ');
  if (r === 'じ') out.add('ぢ');
  if (r === 'ず') out.add('づ');
  return out;
}
export function readingsOf(info, k) {
  const i = info[k];
  if (!i) return null;
  const out = new Set();
  i.on.forEach(r => variants(kata2hira(r)).forEach(v => out.add(v)));
  i.kun.forEach(r => { const [a, b = ''] = r.split('.'); variants(a).forEach(v => out.add(v)); if (b) out.add(a + b); });
  i.nanori.forEach(r => out.add(r));
  return out;
}
function fits(info, ks, r) {
  if (!ks.length) return !r.length;
  const set = readingsOf(info, ks[0]);
  if (!set) return false;
  for (const v of set) if (r.startsWith(v) && fits(info, ks.slice(1), r.slice(v.length))) return true;
  return false;
}
export function checkFurigana(files, info, dict) {
  const bad = new Map();
  for (const [file, src] of files) for (const m of src.matchAll(/\{([㐀-鿿々〆ヶ]+)\|([ぁ-ゖァ-ヺー]+)\}/g)) {
    const [, K, R0] = m, R = kata2hira(R0);
    if (fits(info, [...K], R)) continue;
    if ((dict.byK.get(K) || []).some(e => e.rebs.some(x => kata2hira(x.reb) === R))) continue;
    const id = `${K}|${R}`;
    if (!bad.has(id)) bad.set(id, new Set());
    bad.get(id).add(file);
  }
  return bad;
}
/* Checked by hand: kanji meanings that are right in other words. */
export const KANJI_OK = {
};
/* Checked by hand: readings that are right though no rule above finds them. */
export const FURI_OK = {
  "父|とう": "お父さん — the word's own reading",
  "母|かあ": "お母さん — the word's own reading",
  "腹|なか": "お腹 (おなか) — the word's own reading",
  "漢字|かな": "a comment in grammar-ui.js showing the markup, not a reading",
};

function parseKanjidic(xml) {
  const info = {};
  for (const m of xml.matchAll(/<character>([\s\S]*?)<\/character>/g)) {
    const b = m[1], lit = b.match(/<literal>([^<]+)<\/literal>/)[1];
    info[lit] = {
      on: [...b.matchAll(/<reading r_type="ja_on">([^<]+)</g)].map(x => x[1]),
      kun: [...b.matchAll(/<reading r_type="ja_kun">([^<]+)</g)].map(x => x[1].replace(/^-|-$/g, '')),
      nanori: [...b.matchAll(/<nanori>([^<]+)</g)].map(x => x[1]),
      meanings: [...b.matchAll(/<meaning>([^<]+)</g)].map(x => x[1].toLowerCase()),
    };
  }
  return info;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!existsSync(dictPath)) {
    mkdirSync(cache, { recursive: true });
    execFileSync('curl', ['-sL', '-o', dictPath + '.gz', 'http://ftp.edrdg.org/pub/Nihongo/JMdict_e.gz']);
    execFileSync('gunzip', ['-kf', dictPath + '.gz']);
  }
  const dict = parse(readFileSync(dictPath, 'utf8'));
  const R = f => readFileSync(join(root, f), 'utf8');
  const { WORDS } = new Function(['js/data/kana.js', 'js/furi.js', 'js/conj.js', 'js/data/words.js'].map(R).join('\n') + ';return {WORDS};')();
  const { issues, missing } = checkWords(WORDS, dict);
  const open = issues.filter(x => !x.accepted);
  for (const kind of ['reading', 'pos', 'meaning']) {
    const list = (ALL ? issues : open).filter(x => x.check === kind);
    if (!list.length) continue;
    console.log(`\n${kind} (${list.length})`);
    list.forEach(x => console.log(`  ${x.accepted ? '✓ ' : '  '}st${x.w.st} ${x.msg}${x.accepted ? `  — ${x.accepted}` : ''}`));
  }
  console.log(`\nnot in JMdict as written (${missing.length}): ${missing.map(w => w.plain).join(' ')}`);
  /* furigana everywhere */
  const info = parseKanjidic(readFileSync(join(cache, 'kanjidic2.xml'), 'utf8'));
  const { readdirSync } = await import('fs');
  const files = [...readdirSync(join(root, 'js/data')).map(f => 'js/data/' + f), ...readdirSync(join(root, 'js')).filter(f => f.endsWith('.js') && !f.startsWith('audio-') && f !== 'strokes.js').map(f => 'js/' + f)]
    .map(f => [f, R(f)]);
  const bad = checkFurigana(files, info, dict);
  const furiOpen = [...bad].filter(([id]) => !FURI_OK[id]);
  /* the kanji meanings written for the app, against KANJIDIC's */
  const { KANJI } = new Function(R('js/data/kanji.js') + ';return {KANJI};')();
  const kanjiOff = KANJI.filter(k => {
    const ours = content(k.m).map(stem), theirs = (info[k.k]?.meanings || []).flatMap(content).map(stem);
    return ours.length && !ours.some(x => theirs.some(y => x === y || near(x, y))) && !KANJI_OK[k.k];
  });
  console.log(`\nkanji meanings (${kanjiOff.length} to look at)`);
  kanjiOff.forEach(k => console.log(`    ${k.k} "${k.m}" — KANJIDIC: ${info[k.k].meanings.slice(0, 5).join('; ')}`));
  console.log(`\nfurigana (${furiOpen.length} to look at)`);
  furiOpen.forEach(([id, fs]) => console.log(`    {${id}}  ${[...fs].join(', ')}`));
  console.log(`\n${WORDS.length} words: ${open.length} to look at, ${issues.length - open.length} accepted.`);
  process.exitCode = open.some(x => x.check !== 'meaning') || furiOpen.length ? 1 : 0;
}
