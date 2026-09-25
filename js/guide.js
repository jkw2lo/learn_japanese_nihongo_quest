/* Nihongo Quest — the explanations.

   A learner who has never seen Japanese doesn't know there are three
   scripts, why a chart of kana looks the way it does, or what a small ゃ is
   for. These cards say so, at the moment it matters: the whole introduction
   before the very first lesson (and again from the Kana tab or Settings),
   and one short card before the first lesson of each new kind. */

/* A sentence, coloured by script. Each run: [text, "h"|"k"|"j"|"p"]. */
function scriptRuns(runs) {
  return runs.map(([t, c]) => `<span class="sc sc-${c}" lang="ja">${esc(t)}</span>`).join("");
}

const legend = `<div class="sc-legend">
  <span><i class="sc-dot sc-h"></i>hiragana</span><span><i class="sc-dot sc-k"></i>katakana</span><span><i class="sc-dot sc-j"></i>kanji</span>
</div>`;

const exWords = ws => `<div class="ex-row">${ws.map(([w, m, sayIt]) =>
  `<button class="ex" data-act="say" data-say="${esc(sayIt || w)}"><span lang="ja">${w}</span><small>${esc(m)}</small></button>`).join("")}</div>`;

/* The first rows of the fifty-sounds chart, with one row and one column lit
   up to show that a row shares a consonant and a column shares a vowel. */
function miniChart() {
  const rows = [["", "あ", "い", "う", "え", "お"], ["k", "か", "き", "く", "け", "こ"], ["s", "さ", "し", "す", "せ", "そ"],
    ["t", "た", "ち", "つ", "て", "と"], ["n", "な", "に", "ぬ", "ね", "の"]];
  const head = ["", "a", "i", "u", "e", "o"];
  return `<div class="mini-chart" lang="ja">
    ${head.map(h => `<span class="mc-h">${h}</span>`).join("")}
    ${rows.map((r, i) => r.map((c, j) => j === 0
      ? `<span class="mc-h">${c}</span>`
      : `<span class="${i === 1 ? "mc-row" : ""} ${j === 1 ? "mc-col" : ""}">${c}</span>`).join("")).join("")}
    <span class="mc-h"></span><span class="mc-more" style="grid-column: span 5">… h m y r w</span>
  </div>`;
}

const GUIDE = [
  {
    eyebrow: "日本語 · Japanese writing",
    head: "Japanese mixes three scripts.",
    body: `<p class="sc-sentence">${scriptRuns([["私", "j"], ["は", "h"], ["コーヒー", "k"], ["を", "h"], ["飲", "j"], ["みます", "h"], ["。", "p"]])}</p>
      <p class="muted">watashi wa koohii o nomimasu — “I drink coffee.”</p>
      ${legend}
      <p>Nearly every sentence uses all three, and each does a different job. You'll learn them in this order:
      <b>hiragana</b>, then <b>katakana</b>, then <b>kanji</b>.</p>`,
    say: "わたしはコーヒーをのみます",
  },
  {
    eyebrow: "ひらがな · Hiragana",
    head: "Hiragana: the core sounds.",
    body: `<p>46 basic characters, each one a syllable: <span lang="ja">か</span> is ka, <span lang="ja">さ</span> is sa.
      Hiragana writes the grammar — verb endings like <span lang="ja">飲<b class="sc-h">みます</b></span>, and the little
      markers <span lang="ja">は</span> and <span lang="ja">を</span> — plus any word that has no kanji.</p>
      ${exWords([["ありがとう", "thank you"], ["すし", "sushi"], ["ねこ", "cat"]])}
      <p class="muted">It's what Japanese children learn first, and anything at all can be written in it. You start here too.</p>`,
  },
  {
    eyebrow: "カタカナ · Katakana",
    head: "Katakana: the same sounds, sharper.",
    body: `<p>The same 46 sounds again in angular shapes: <span lang="ja">カ</span> is ka, just as <span lang="ja">か</span> is.
      Katakana writes words borrowed from other languages, foreign names, and emphasis — a little like italics.</p>
      ${exWords([["コーヒー", "coffee"], ["テレビ", "TV"], ["パン", "bread"]])}
      <p class="muted">Reading katakana is often guessing the English word in disguise. A few are near twins of their hiragana:
      <span lang="ja">か/カ, へ/ヘ, り/リ</span>.</p>`,
  },
  {
    eyebrow: "漢字 · Kanji",
    head: "Kanji: characters with meanings.",
    body: `<p>Borrowed from Chinese, each kanji means something: <span lang="ja">日</span> sun or day, <span lang="ja">本</span> origin —
      so <ruby lang="ja">日本<rt>にほん</rt></ruby> (nihon) is Japan, “the sun's origin”. Nouns and the stems of verbs and
      adjectives are usually kanji.</p>
      <p>There are thousands; everyday reading takes about two thousand, and JLPT N5 about a hundred. You'll meet them
      later, through words you already know — and until you know one, it comes with small hiragana over it, called
      <b>furigana</b>, telling you how to read it.</p>`,
  },
  {
    eyebrow: "五十音 · The fifty sounds",
    head: "How the kana are laid out.",
    body: `${miniChart()}
      <p>Almost every kana is a consonant plus a vowel. The chart runs the vowels across — a i u e o — and the consonants
      down — k s t n h m y r w. So a <b>row</b> shares a consonant (<span lang="ja">か き く け こ</span>: ka ki ku ke ko)
      and a <b>column</b> shares a vowel (<span lang="ja">あ か さ た な</span> all end in a).</p>
      <p class="muted">That's why you learn a row at a time: after the first, each new row is one new consonant on vowels you already know.</p>`,
  },
  {
    eyebrow: "Why that order?",
    head: "It's the Japanese A to Z.",
    body: `<p>The chart's order — あ か さ た な は ま や ら わ — is Japanese alphabetical order, used in dictionaries and
      phone books the way English uses A to Z. It's called <span lang="ja">五十音</span>, “the fifty sounds”.</p>
      <p>It's usually traced to <b>Sanskrit</b>, which Buddhist scholars in Japan studied over a thousand years ago.
      Sanskrit grammarians listed vowels first, then consonants from the back of the mouth to the front. Say
      k, s, t, n and feel the tongue move forward; <b>h</b> was once <b>p</b>, said with the lips like the m after it;
      the half-vowels y, r and w come last.</p>
      <p class="muted">The gaps in the chart — no yi, ye or wu — are sounds modern Japanese simply doesn't have.</p>`,
  },
  {
    eyebrow: "How this goes",
    head: "Five kana a day.",
    body: `<ol class="how">
        <li><b>Meet each one:</b> see it, hear it, trace it.</li>
        <li><b>Practise:</b> read it, hear it, then write it from memory.</li>
        <li><b>All of hiragana</b> takes about three weeks. Then a check on two separate days makes sure it stuck.</li>
        <li><b>Then katakana</b>, the same way. Real words to read arrive almost at once.</li>
      </ol>
      <p class="muted">Romaji — Japanese in English letters — is shown only while you're learning each kana. After that
      you read the kana itself. (You can turn romaji back on in Settings.)</p>`,
  },
];

/* Before the first lesson of each kind. */
const KIND_INTRO = {
  "h-g": {
    eyebrow: "濁音 · Voiced sounds",
    head: "Two small marks, twenty-five new sounds.",
    body: `<p><b lang="ja">゛</b> — two ticks, called <i>dakuten</i> — voices a consonant: k→g, s→z, t→d, h→b.
      <b lang="ja">゜</b> — a small circle, <i>handakuten</i> — turns h into p.</p>
      <div class="pairs-row" lang="ja"><span>か→が</span><span>さ→ざ</span><span>た→だ</span><span>は→ば→ぱ</span></div>
      <p class="muted">Nothing new to memorise but the marks: the shapes underneath are ones you know.</p>`,
  },
  "h-ky": {
    eyebrow: "拗音 · Blended sounds",
    head: "Small ゃ ゅ ょ blend two kana into one beat.",
    body: `<p>An i-sound kana — <span lang="ja">き し ち に ひ み り</span> and their voiced forms — followed by a
      <b>small</b> <span lang="ja">ゃ ゅ ょ</span> makes one blended syllable: <span lang="ja">き + ゃ = きゃ</span> kya.</p>
      <p>Size matters. <span lang="ja">きゃ</span> is one beat, kya; <span lang="ja">きや</span>, with a full-size や, is two: ki-ya.</p>
      ${exWords([["きょう", "today"], ["しゃしん", "photo"], ["おちゃ", "tea"]])}`,
  },
  "k-a": {
    eyebrow: "カタカナ · Katakana",
    head: "Now the same sounds, in katakana.",
    body: `<p>Hiragana has stuck. Katakana is the same sounds in the same order, row by row — so this part goes faster.</p>
      <div class="pairs-row" lang="ja"><span>か カ</span><span>き キ</span><span>へ ヘ</span><span>り リ</span><span>も モ</span></div>
      <p>Some are near twins of their hiragana, like these. Others are new shapes, and a few katakana look like each
      other — <span lang="ja">シ ツ</span>, <span lang="ja">ソ ン</span> — which the look-alike drill is for.</p>
      <p class="muted">Katakana is mostly for borrowed words, so the words you can read will be things like
      <span lang="ja">コーヒー</span> and <span lang="ja">ホテル</span>.</p>`,
  },
  "k-g": {
    eyebrow: "濁音 · Voiced sounds",
    head: "The same two marks work in katakana.",
    body: `<div class="pairs-row" lang="ja"><span>カ→ガ</span><span>サ→ザ</span><span>タ→ダ</span><span>ハ→バ→パ</span></div>
      <p class="muted">゛ voices the consonant, ゜ makes h into p — exactly as in hiragana.</p>`,
  },
  "k-ky": {
    eyebrow: "拗音 · Blended sounds",
    head: "Small ャ ュ ョ, just like hiragana.",
    body: `<p><span lang="ja">キ + ャ = キャ</span> kya — one beat. The same rule as <span lang="ja">きゃ</span>.</p>
      ${exWords([["キャベツ", "cabbage"], ["シャツ", "shirt"], ["ジャム", "jam"]])}`,
  },
  "k-l1": {
    eyebrow: "外来音 · Loanword sounds",
    head: "Sounds Japanese borrowed.",
    body: `<p>Borrowed words brought sounds Japanese didn't have, so katakana pairs a kana with a small vowel to write them:
      <span lang="ja">テ + ィ = ティ</span> ti, <span lang="ja">フ + ァ = ファ</span> fa.</p>
      ${exWords([["パーティー", "party"], ["ソファ", "sofa"], ["カフェ", "café"]])}
      <p class="muted">These only ever turn up in katakana words.</p>`,
  },
};

function infoCard(g, last = false) {
  return { t: "info", g, last };
}

function guideCards() {
  return GUIDE.map((g, i) => infoCard(g, i === GUIDE.length - 1));
}

function infoHtml(c) {
  const g = c.g;
  return `<div class="info">
    <div class="eyebrow">${g.eyebrow}</div>
    <h2>${esc(g.head)}</h2>
    ${g.body}
    ${g.say ? `<button class="btn btn-ghost btn-sm" data-act="say" data-say="${esc(g.say)}">🔊 Hear it</button>` : ""}
  </div>`;
}

function startGuide() {
  openSession({ kind: "guide", title: "日本語 · Japanese writing", queue: guideCards() });
}
