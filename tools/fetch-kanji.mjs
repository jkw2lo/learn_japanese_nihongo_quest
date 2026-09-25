/* Build js/data/kanji.js: the kanji the app teaches, with their readings
   and stroke counts from KANJIDIC2.

   Which kanji: every kanji in the stage words that KANJIDIC places at old
   JLPT level 4 (≈ N5) or 3 (≈ N4). Rarer ones (丈夫, 全部, 卵…) keep their
   furigana for good.

   Order: by the stage whose words first use the kanji, then in the order
   those words are taught — so each is taught soon after a word that uses
   it, and the numbers come out 一 二 三.

   Meanings are written here (KANJI_MEANING), short and for a beginner;
   KANJIDIC's list reads 行 as "going, journey, carry out". Readings and
   stroke counts are KANJIDIC's.

   Source:  KANJIDIC2, © EDRDG, CC BY-SA 4.0 — http://www.edrdg.org/edrdg/licence.html
     node tools/fetch-kanji.mjs            uses tools/.cache/kanjidic2.xml, downloading it if missing */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { join } from 'path';

const root = fileURLToPath(new URL('../', import.meta.url));
const cache = join(root, 'tools/.cache');
const xmlPath = join(cache, 'kanjidic2.xml');

const KANJI_MEANING = {
  大: "big", 一: "one", 語: "word; language", 二: "two", 三: "three", 四: "four", 五: "five", 六: "six",
  七: "seven", 八: "eight", 九: "nine", 十: "ten", 百: "hundred", 千: "thousand", 万: "ten thousand",
  円: "yen; circle", 高: "tall; expensive", 安: "cheap; calm", 今: "now", 何: "what", 時: "time; o'clock",
  半: "half", 分: "minute; part", 日: "day; sun", 毎: "every", 午: "noon", 前: "before; in front",
  後: "after; behind", 名: "name", 人: "person", 本: "book; origin", 学: "study", 生: "life; birth",
  先: "ahead; earlier", 会: "meet", 社: "company", 友: "friend", 食: "eat; food", 飲: "drink",
  水: "water", 魚: "fish", 店: "shop", 行: "go", 来: "come", 駅: "station", 電: "electricity",
  車: "car; vehicle", 下: "below; down", 出: "go out", 口: "mouth; opening", 入: "enter", 右: "right",
  左: "left", 度: "time(s); degree", 英: "England; English", 待: "wait", 明: "bright", 私: "I; private",
  員: "member", 家: "house; family", 族: "family; clan", 好: "like", 茶: "tea", 飯: "cooked rice; meal",
  肉: "meat", 野: "field", 菜: "vegetable", 朝: "morning", 昼: "noon; daytime", 注: "pour; note",
  文: "writing; sentence", 計: "measure", 帰: "return", 乗: "ride", 歩: "walk", 地: "ground",
  切: "cut", 近: "near", 遠: "far", 月: "moon; month", 火: "fire", 木: "tree", 金: "gold; money",
  土: "earth", 年: "year", 中: "middle", 小: "small", 上: "above; up", 見: "see", 聞: "hear",
  書: "write", 話: "talk", 読: "read", 買: "buy", 休: "rest", 外: "outside", 国: "country",
  北: "north", 南: "south", 東: "east", 西: "west", 気: "spirit; air", 天: "heaven; sky",
  雨: "rain", 花: "flower", 山: "mountain", 川: "river", 田: "rice field", 男: "man", 女: "woman",
  子: "child", 父: "father", 母: "mother", 白: "white", 長: "long", 新: "new", 古: "old",
  少: "a little", 多: "many", 週: "week", 間: "between; interval", 道: "road", 校: "school",
  言: "say", 立: "stand", 足: "foot; enough", 手: "hand", 目: "eye", 耳: "ear",
};

function parseKanjidic(xml) {
  const info = {};
  for (const m of xml.matchAll(/<character>([\s\S]*?)<\/character>/g)) {
    const b = m[1];
    const lm = b.match(/<literal>([^<]+)<\/literal>/);
    if (!lm) continue;
    info[lm[1]] = {
      jlpt: +(b.match(/<jlpt>(\d)<\/jlpt>/) || [])[1] || 0,
      sc: +(b.match(/<stroke_count>(\d+)<\/stroke_count>/) || [])[1] || 0,
      on: [...b.matchAll(/<reading r_type="ja_on">([^<]+)</g)].map(x => x[1]),
      kun: [...b.matchAll(/<reading r_type="ja_kun">([^<]+)</g)].map(x => x[1]).filter(r => !r.startsWith('-') && !r.endsWith('-')),
      meanings: [...b.matchAll(/<meaning>([^<]+)</g)].map(x => x[1]),
    };
  }
  return info;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (!existsSync(xmlPath)) {
    mkdirSync(cache, { recursive: true });
    const gz = join(cache, 'kanjidic2.xml.gz');
    execFileSync('curl', ['-sL', '-o', gz, 'http://www.edrdg.org/kanjidic/kanjidic2.xml.gz']);
    execFileSync('gunzip', ['-kf', gz]);
  }
  const info = parseKanjidic(readFileSync(xmlPath, 'utf8'));
  const R = f => readFileSync(join(root, f), 'utf8');
  const { WORDS, furiKanji } = new Function(['js/data/kana.js', 'js/furi.js', 'js/conj.js', 'js/data/words.js'].map(R).join('\n') + ';return {WORDS, furiKanji};')();

  const first = {}, firstWord = {};
  WORDS.forEach((w, i) => furiKanji(w.w).forEach(k => {
    if (!(k in first) || w.st < first[k]) { first[k] = w.st; firstWord[k] = i; }
  }));
  const taught = Object.keys(first).filter(k => [3, 4].includes(info[k]?.jlpt));
  taught.sort((a, b) => first[a] - first[b] || firstWord[a] - firstWord[b] || info[a].sc - info[b].sc);

  const missing = taught.filter(k => !KANJI_MEANING[k]);
  if (missing.length) { console.error(`no meaning written for: ${missing.join(' ')}`); process.exit(1); }

  const rows = taught.map(k => ({
    k, m: KANJI_MEANING[k], on: info[k].on.slice(0, 3), kun: info[k].kun.slice(0, 3),
    sc: info[k].sc, n: info[k].jlpt === 4 ? 5 : 4, st: first[k],
  }));
  const out = `/* Kanji the app teaches — generated by tools/fetch-kanji.mjs, do not hand-edit.
   Readings and stroke counts: KANJIDIC2, © EDRDG, CC BY-SA 4.0
   (http://www.edrdg.org/edrdg/licence.html). Meanings written for this app.
   Each: k kanji, m meaning, on / kun readings (kun: okurigana after the dot),
   sc strokes, n JLPT level (5 = N5, 4 = N4), st the stage whose words first use it. */
const KANJI = ${JSON.stringify(rows).replace(/\},\{/g, '},\n{')};
`;
  writeFileSync(join(root, 'js/data/kanji.js'), out);
  console.log(`${rows.length} kanji → js/data/kanji.js (N5 ${rows.filter(r => r.n === 5).length}, N4 ${rows.filter(r => r.n === 4).length})`);
}
