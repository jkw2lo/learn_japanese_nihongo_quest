/* Nihongo Quest — 読む Read: reading words as words, faster.

   The kana stage teaches turning a shape into a sound, and the sprint makes
   that quick. Reading is the next thing: seeing たべます as one word rather
   than five kana, and finding the words in a line that has no spaces
   between them. This tab is a ladder of rungs, each opening when you know
   enough for it, and every rung built only from words you already know
   (README → Read):

   1. 字幕 Subtitles — a line shows at the foot of a screen, with its sound,
      for as long as your pace allows; then say what it meant. Single words
      first; longer phrases and whole sentences join as you learn them, and
      the lines grow as you keep up. The pace is kept, in characters a
      second (subtitles run at about four). (Until 0.36.0 a separate rung,
      一瞬 Flash, did the single words; it was the same thing, smaller.)
   2. 区切り Word chains — two to five words you know run together with no
      spaces; drag across each word to find it. The chains grow as you find
      them cleanly.
   3. 句 Phrases — word chains with the grammar in: a sentence you've
      learned, run together, to find every piece of — words, particles,
      endings. Its pieces are the Build-it tiles of each pattern you know
      (phrasePool), so it grows as the grammar does.
   4. 文章 Short texts — a message, a sign, a menu, a receipt, a diary page
      (js/data/texts.js), read in one go; then two questions with the text
      out of sight. Each opens when its words and patterns are learned.
   Later: phrases with particles, and short texts read in one go.

   And beside the ladder, a game: 探す Word search, a grid of kana you know
   with words you know hidden in it, across, down and diagonally.

   Words come from the same pool as the words sprint (sprintWords): every
   word learned in the word lessons and every word spelled only in kana
   you've learned. Kanji you know are shown as kanji, the rest in kana —
   there's no furigana here, because there's none on a sign. */

/* ---------- the words, as you'd read them ---------- */

/* A word's written form with kanji you know as kanji, and kanji you don't
   yet in their kana. */
const readText = markup => furiParse(markup).map(x => x.t ?? ([...x.k].every(c => knowsKanji(c)) ? x.k : x.r)).join("");

/* Everything readable, once per spelling: { key, text, kana, m, say }. */
function readPool() {
  return sprintWords().map(x => ({ key: x.key, text: readText(x.w), kana: x.kana, m: x.m, say: WORD_BY[x.key]?.say || x.kana }));
}

/* A chain is made of whole kana/kanji words — nothing with a space, a
   comma or a 〜 in it, and nothing so long it fills a line on its own. */
const CHAIN_CHARS = /^[぀-ヿ一-鿿々]+$/;
const chainable = w => CHAIN_CHARS.test(w.text) && [...w.text].length <= 7;

/* How many ways a run of characters splits into words from the list
   (counting stops at cap): a chain only counts if there's exactly one, so
   there's never a second right answer to argue with. */
function splits(text, words, cap = 2) {
  const chars = [...text], n = chars.length, ways = new Array(n + 1).fill(0);
  const byLen = words.map(w => [...w]);
  ways[n] = 1;
  for (let i = n - 1; i >= 0; i--) {
    let c = 0;
    for (const w of byLen) {
      if (w.length && i + w.length <= n && w.every((ch, j) => chars[i + j] === ch)) c += ways[i + w.length];
      if (c >= cap) break;
    }
    ways[i] = Math.min(c, cap);
  }
  return ways[0];
}

/* n different words that read one way only when run together. Returns
   { words, text, spans: [[from, to)…] } or null if the pool won't make one. */
function makeChain(pool, n, pick = (a, k) => sample(a, k)) {
  const ok = pool.filter(chainable);
  if (ok.length < n) return null;
  const texts = [...new Set(ok.map(w => w.text))];
  for (let t = 0; t < 80; t++) {
    const words = pick(ok, n);
    if (new Set(words.map(w => w.text)).size < n) continue;
    const text = words.map(w => w.text).join("");
    if (splits(text, texts) !== 1) continue;
    let at = 0;
    const spans = words.map(w => { const len = [...w.text].length; const s = [at, at + len]; at += len; return s; });
    return { words, text, spans };
  }
  return null;
}

/* ---------- 探す Word search: the grid ---------- */

/* A word is hidden → across, ↓ down (Japanese is often written in columns)
   or ↘ diagonally — never backwards: reading a word backwards teaches
   nothing about reading it. Dragging from either end finds it. */
const SEARCH_DIRS = [[0, 1], [1, 0], [1, 1]];
const ALL_DIRS = [[0, 1], [1, 0], [1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1], [-1, 1]];
const cellKey = (r, c) => r * 100 + c;

/* Every place a word can be read in the grid, in any of the eight
   directions, each as the set of its cells (so みみ, read both ways over the
   same two cells, is one place). */
function searchPlaces(grid, word) {
  const size = grid.length, w = [...word], out = new Map();
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) for (const [dr, dc] of ALL_DIRS) {
    let ok = true;
    for (let i = 0; i < w.length && ok; i++) {
      const rr = r + dr * i, cc = c + dc * i;
      ok = rr >= 0 && cc >= 0 && rr < size && cc < size && grid[rr][cc] === w[i];
    }
    if (ok) { const cells = w.map((_, i) => cellKey(r + dr * i, c + dc * i)).sort((a, b) => a - b); out.set(cells.join(), cells); }
  }
  return [...out.values()];
}

/* Hide up to n of the words (two characters or more, each meaning once) in
   a size×size grid and fill the rest from filler, so that each hidden word
   can be read in exactly one place. Returns { grid, placed: [{ w, cells,
   from, to }] } or null. */
function makeSearch(words, size, n, filler) {
  const rand = k => Math.floor(Math.random() * k);
  for (let attempt = 0; attempt < 40; attempt++) {
    const grid = Array.from({ length: size }, () => new Array(size).fill(null));
    const seenM = new Set(), seenT = new Set();
    const cands = shuffle(words.filter(w => { const L = [...w.text].length; return L >= 2 && L <= size; }))
      .filter(w => !seenM.has(w.m) && !seenT.has(w.text) && seenM.add(w.m) && seenT.add(w.text))
      .slice(0, n * 3).sort((a, b) => [...b.text].length - [...a.text].length);
    const placed = [];
    for (const w of cands) {
      if (placed.length >= n) break;
      const ch = [...w.text], L = ch.length;
      for (let t = 0; t < 80; t++) {
        const [dr, dc] = SEARCH_DIRS[rand(SEARCH_DIRS.length)];
        const r0 = rand(size - dr * (L - 1)), c0 = rand(size - dc * (L - 1));
        if (!ch.every((x, i) => { const g = grid[r0 + dr * i][c0 + dc * i]; return g === null || g === x; })) continue;
        ch.forEach((x, i) => { grid[r0 + dr * i][c0 + dc * i] = x; });
        placed.push({ w, cells: ch.map((_, i) => cellKey(r0 + dr * i, c0 + dc * i)).sort((a, b) => a - b), from: [r0, c0], to: [r0 + dr * (L - 1), c0 + dc * (L - 1)] });
        break;
      }
    }
    if (placed.length < Math.min(n, 3)) continue;
    for (const row of grid) for (let c = 0; c < size; c++) if (row[c] === null) row[c] = filler[rand(filler.length)];
    if (placed.every(p => searchPlaces(grid, p.w.text).length === 1)) return { grid, placed };
  }
  return null;
}

/* ---------- the rungs ---------- */

const READ_RUNGS = [
  { id: "subs", jp: "字幕", en: "Subtitles", what: "A line flashes up at the foot of a screen with its sound, like a subtitle, and goes. Read it in time, then say what it meant. Words first — phrases and whole sentences join as you learn them, and the lines grow as you keep up.", min: 6 },
  { id: "chains", jp: "区切り", en: "Word chains", what: "Words you know, run together with no spaces, the way Japanese is written. Drag across each word to find it.", min: 6 },
  { id: "phrases", jp: "句", en: "Phrases", what: "A sentence you've learned, run together. Find every piece — the words and the little words between them: は, を, に, です. It grows with the grammar you learn.", min: 3 },
];
const READ_LATER = [];
const CHAIN_N = 8;
const SUBTITLE_CPS = 4;

const cpsText = c => `${c.toFixed(1)} characters a second`;

function renderRead() {
  const el = $("#v-read");
  const pool = readPool();
  const r = state.read;
  const rung = (R, body) => {
    const open = pool.length >= R.min && (R.id !== "chains" || pool.filter(chainable).length >= R.min);
    return `<section class="card rd-rung ${open ? "" : "locked"}">
      <div class="rd-rung-head"><span class="rd-n">${READ_RUNGS.indexOf(R) + 1}</span>
        <h2><span lang="ja">${R.jp}</span> ${R.en}</h2></div>
      <p>${esc(R.what)}</p>
      ${open ? body : `<p class="muted small">Learn a few more words first — this needs ${R.min} you can read.</p>`}
    </section>`;
  };
  el.innerHTML = `<div class="rd-grid">
    <section class="card rd-intro">
      <div class="eyebrow">読む · Read</div>
      <h1>Words, not kana.</h1>
      <p class="lede">Knowing every kana is the start. Reading is seeing <span lang="ja">たべます</span> as one word, not five
        sounds — and finding the words in a line with no spaces between them. Everything here is made of words you
        already know: ${pool.length} so far.</p>
    </section>
    ${rung(READ_RUNGS[0], `<div class="rd-stat">${r.subs.rounds ? `Pace <b>${cpsText(r.subs.cps)}</b> · lines up to ${r.subs.len} characters${r.subs.best ? ` · best ${r.subs.best.toFixed(1)}` : ""}` : `Starts with single words at ${cpsText(r.subs.cps)}.`}
        <small class="muted">${r.subs.cps >= SUBTITLE_CPS ? "— subtitle speed" : `— subtitles run at about ${SUBTITLE_CPS}`}${subsPool().some(x => x.kind === "sentence") ? ` · ${subsPool().filter(x => x.kind === "sentence").length} sentences you can read are in it` : " · sentences join once you've learned some patterns"}</small></div>
      <button class="btn rd-go" data-act="rd-start" data-r="subs">Watch ${SUBS_N} lines</button>`)}
    ${rung(READ_RUNGS[1], `<div class="rd-stat">${r.chains.rounds ? `Best: <b>${cpsText(r.chains.best)}</b> · up to ${r.chains.n} words a chain` : "Starts with two words a chain."}</div>
      <button class="btn rd-go" data-act="rd-start" data-r="chains">Find the words in ${CHAIN_N} chains</button>`)}
    ${phraseCard()}
    ${textCard()}
    ${searchCard(pool)}
    ${matchCard(pool)}
    ${READ_LATER.length ? `<section class="card rd-later">
      <div class="card-head"><h2>Further up</h2><span class="count">as you learn more</span></div>
      <ol class="rd-later-list" start="5">${READ_LATER.map(x => `<li><b><span lang="ja">${x.jp}</span> ${x.en}</b><br><span class="muted small">${esc(x.what)}</span></li>`).join("")}</ol>
    </section>` : ""}
  </div>`;
}

/* ---------- the overlay ---------- */

let RD = null;           /* the round being played */

function openRead(rung) {
  const pool = readPool();
  if (pool.length < 6) return;
  RD = { rung, pool, i: 0, res: [], t0: performance.now(), done: false };
  crumb(`read ${rung}`);
  $("#read").classList.add("on");
  document.body.style.overflow = "hidden";
  if (rung === "search") return searchOpen();
  if (rung === "match") return matchOpen();
  if (rung === "subs") {
    const s = state.read.subs;
    Object.assign(RD, { cps: s.cps, cps0: s.cps, len: s.len, n: SUBS_N, streak: 0, lines: subsPool(), seen: new Set() });
    /* the sound for every line it can show: each stage you have words from,
       and the grammar bundle, which holds every pattern's examples */
    new Set(learnedWords().map(x => x.st)).forEach(st => loadBundle("s" + st));
    loadBundle("grammar");
  } else if (rung === "texts") {
    /* ones not read yet first */
    const open = TEXTS.filter(textOpen), read = new Set(state.read.texts.read);
    RD.lines = [...shuffle(open.filter(t => !read.has(t.id))), ...shuffle(open.filter(t => read.has(t.id)))].slice(0, TEXT_N);
    RD.n = RD.lines.length * 2;
    RD.ti = 0; RD.ms = 0; RD.chars = 0; RD.right = 0;
    new Set(RD.lines.map(t => t.st)).forEach(st => loadBundle("s" + st));
  } else if (rung === "phrases") {
    RD.lines = shuffle(phrasePool());
    RD.n = Math.min(PHRASE_N, RD.lines.length);
    RD.ms = 0; RD.chars = 0; RD.clean = 0; RD.streak = 0; RD.len = 0;
    new Set(learnedWords().map(x => x.st)).forEach(st => loadBundle("s" + st));
  } else {
    RD.len = state.read.chains.n;
    RD.n = CHAIN_N;
    RD.ms = 0; RD.chars = 0; RD.clean = 0; RD.streak = 0;
  }
  $("#rdStrip").innerHTML = Array.from({ length: RD.n }, (_, i) => `<i data-i="${i}"></i>`).join("");
  rdStep();
}

function rdStrip() {
  $$("#rdStrip i").forEach((el, i) => { el.className = RD.res[i] ? RD.res[i] : i === RD.i ? "now" : ""; });
}

function rdStep() {
  rdStrip();
  $("#rdFoot").innerHTML = "";
  if (RD.i >= RD.n) return rdFinish();
  if (RD.rung === "subs") subsShow(); else if (RD.rung === "phrases") phraseShow(); else if (RD.rung === "texts") textShow(); else chainShow();
}

function closeRead() {
  if (!RD) return;
  clearTimeout(RD.hide); clearTimeout(RD.next); clearInterval(RD.timer);
  RD = null;
  $("#read").classList.remove("on");
  $("#rdBody").innerHTML = ""; $("#rdFoot").innerHTML = "";
  document.body.style.overflow = "";
  render();
  milestoneCheckpoint();
}

/* ---------- 4 · Short texts ---------- */

const TEXT_N = 3;
/* open once its words' stage is reached and its patterns are learned */
/* A text opens once you've reached its stage and learned its patterns —
   and the words of its own stage that it uses, since a stage's words now
   run to eighty or more: a text with {曲|ま}がる waits for {曲|ま}がる. */
const textStem = w => isVerb(w.pos) || w.pos === "adj-i" ? w.plain.slice(0, -1) : w.plain;   /* 曲が finds 曲がって */
const textNeeds = t => t.needs || (t.needs = WORDS.filter(w => { const x = textStem(w);
  return w.st === t.st && (KANJI_RE.test(x) || [...x].length >= 3) && t.lines.some(l => furiPlain(l).includes(x)); }));
const textOpen = t => learnedWords().some(w => w.st >= t.st) && t.pats.every(id => isLearned("g:" + id)) && textNeeds(t).every(w => isLearned(w.key));

function textCard() {
  const r = state.read.texts, open = TEXTS.filter(textOpen), next = TEXTS.find(t => !textOpen(t));
  return `<section class="card rd-rung ${open.length ? "" : "locked"}">
    <div class="rd-rung-head"><span class="rd-n">4</span><h2><span lang="ja">文章</span> Short texts</h2></div>
    <p>A message, a sign, a menu, a receipt, a page of a diary — read it in one go, then answer two questions with it out of sight.</p>
    ${open.length ? `<div class="rd-stat">${open.length} of ${TEXTS.length} open${r.read.length ? ` · ${r.read.length} read` : ""}${r.best ? ` · best ${cpsText(r.best)}` : ""}</div>
      <button class="btn rd-go" data-act="rd-start" data-r="texts">Read ${Math.min(TEXT_N, open.length)} text${Math.min(TEXT_N, open.length) > 1 ? "s" : ""}</button>`
      : `<p class="muted small">The first opens with stage 3's words (numbers and money).</p>`}
    ${open.length && next ? `<p class="muted small">Next to open: ${esc(next.title.toLowerCase())}, with stage ${next.st}.</p>` : ""}
  </section>`;
}

/* the text, drawn as what it is — the reading has no furigana, as a real
   one wouldn't; after the questions it can show its English */
function textHtml(t, after = false) {
  return `<div class="tx-card tx-${t.kind}" lang="ja">${t.lines.map((l, i) => after
    ? `<button class="tx-line" data-act="say" data-say="${esc(textSay(l))}"><span>${esc(readText(l))}</span><small lang="en">${esc(t.en[i])}</small></button>`
    : `<div class="tx-line">${esc(readText(l))}</div>`).join("")}</div>`;
}

function textShow() {
  const t = RD.lines[RD.ti];
  RD.t = { t, qi: 0, t0: performance.now(), peeked: false };
  $("#rdPace").textContent = `${RD.ti + 1} of ${RD.lines.length}`;
  $("#rdBody").innerHTML = `<div class="tx-play">
    <div class="eyebrow">${esc(t.title)}</div>
    ${textHtml(t)}
    <p class="muted small">Read it through — the questions come with it out of sight.</p>
  </div>`;
  $("#rdFoot").innerHTML = `<span></span><button class="btn" data-act="tx-read" id="rdNext">I've read it <kbd>↵</kbd></button>`;
}

function textRead() {
  const T = RD.t;
  if (!T || T.phase) return;
  T.phase = "q";
  RD.ms += performance.now() - T.t0;
  RD.chars += T.t.lines.reduce((n, l) => n + [...readText(l)].length, 0);
  textQuestion();
}

function textQuestion() {
  const T = RD.t, [q, right, ...wrong] = T.t.q[T.qi];
  T.opts = shuffle([right, ...wrong]);
  T.right = right;
  T.answered = false;
  rdStrip();
  $("#rdBody").innerHTML = `<div class="q tx-play">
    <div class="eyebrow">${esc(T.t.title)} · question ${T.qi + 1} of ${T.t.q.length}</div>
    <div class="q-ask tx-q">${esc(q)}</div>
    <div class="tx-peek" id="txPeek" hidden>${textHtml(T.t)}</div>
    <div class="opts n4 sents">${T.opts.map((o, i) => `<button class="opt" data-act="tx-opt" data-i="${i}"><kbd>${i + 1}</kbd><span>${esc(o)}</span></button>`).join("")}</div>
    <div class="verdict" id="rdVerdict" aria-live="polite"></div>
  </div>`;
  $("#rdFoot").innerHTML = `<button class="btn btn-ghost" data-act="tx-peek">Look again</button><span></span>`;
}

function textAnswer(i) {
  const T = RD?.t;
  if (!T || T.answered || T.phase !== "q") return;
  T.answered = true;
  const ok = T.opts[i] === T.right;
  /* a look back costs the mark, not the answer */
  RD.res[RD.i] = ok ? (T.peeked ? "near" : "ok") : "miss";
  if (ok && !T.peeked) RD.right++;
  $$("#rdBody .opt").forEach((b, j) => { b.disabled = true; if (T.opts[j] === T.right) b.classList.add("right"); else if (j === i) b.classList.add("wrong"); });
  const v = $("#rdVerdict");
  v.className = "verdict " + (ok ? "ok" : "miss");
  v.innerHTML = `${icon(ok ? "check" : "close", "v-ico")} ${esc(T.right)}`;
  rdStrip();
  const go = () => { RD.i++; T.qi++; if (T.qi < T.t.q.length) { T.peeked = false; textQuestion(); } else textAfter(); };
  if (ok) RD.next = setTimeout(go, 900);
  else $("#rdFoot").innerHTML = `<span></span><button class="btn" data-act="tx-go" id="rdNext">Next <kbd>↵</kbd></button>`;
  RD.t.go = go;
}

/* afterwards: the text again, every line to tap and hear, with its English */
function textAfter() {
  const T = RD.t;
  T.phase = "after";
  if (!state.read.texts.read.includes(T.t.id)) state.read.texts.read.push(T.t.id);
  save();
  $("#rdBody").innerHTML = `<div class="tx-play">
    <div class="eyebrow">${esc(T.t.title)} · tap a line to hear it</div>
    ${textHtml(T.t, true)}
  </div>`;
  const last = RD.ti >= RD.lines.length - 1;
  $("#rdFoot").innerHTML = `<span></span><button class="btn" data-act="tx-next" id="rdNext">${last ? "Finish" : "Next text"} <kbd>↵</kbd></button>`;
}

/* ---------- 3 · Phrases ---------- */

const PHRASE_N = 6;

/* A word's meaning, if a piece is a word — a particle is too ("(marks the
   topic)"); a form like {食|た}べます isn't, and goes without. */
function pieceMeaning(text) {
  const w = WORDS.find(x => readText(x.w) === text || x.kana === text) || KANA_WORDS.find(x => x.w === text);
  return w ? w.m : "";
}

const phraseOpen = x => x.pats.every(id => isLearned("g:" + id)) && x.words.every(w => !w || isLearned(w.key));

/* Every sentence learned in pieces: each known pattern's Build-it tiles and
   its sentence in parts, and the everyday sentences of READ_PHRASES, as { words: [{ text, m, say }], text, spans, en,
   say } — the shape a word chain has, so the chain game plays it. */
function phrasePool() {
  const out = new Map();
  const add = (raw, en, ws = []) => {
    const pieces = raw.map(u => u.replace(/[。、？！]/g, "")).filter(Boolean);
    if (pieces.length < 3) return;
    const words = pieces.map((u, i) => { const text = readText(u); return { text, m: ws[i]?.m || pieceMeaning(text), say: furiKana(u) }; });
    const text = words.map(w => w.text).join("");
    if (out.has(text)) return;
    let at = 0;
    const spans = words.map(w => { const n = [...w.text].length; const sp = [at, at + n]; at += n; return sp; });
    out.set(text, { words, text, spans, en, say: furiKana(pieces.join("")) });
  };
  PATTERNS.filter(p => p.teach && isLearned(p.key)).forEach(p => {
    (p.teach.tiles || []).forEach(([tiles, en]) => add(tiles, en));
    add(p.teach.built.parts.map(x => x[0]), p.teach.built.en);
  });
  /* and the bank of everyday sentences, each once its words are learned */
  READ_PHRASES.filter(phraseOpen).forEach(x => add(x.parts, x.en, x.words));
  return [...out.values()];
}

function phraseCard() {
  const R = READ_RUNGS.find(x => x.id === "phrases"), r = state.read.phrases, n = phrasePool().length;
  return `<section class="card rd-rung ${n >= R.min ? "" : "locked"}">
    <div class="rd-rung-head"><span class="rd-n">${READ_RUNGS.indexOf(R) + 1}</span><h2><span lang="ja">${R.jp}</span> ${R.en}</h2></div>
    <p>${esc(R.what)}</p>
    ${n >= R.min ? `<div class="rd-stat">${r.rounds ? `Best: <b>${cpsText(r.best)}</b>` : `${n} sentences to split so far.`}</div>
      <button class="btn rd-go" data-act="rd-start" data-r="phrases">Split ${Math.min(PHRASE_N, n)} sentences</button>`
      : `<p class="muted small">Opens with the first grammar lessons (stage 3) — every pattern you learn adds its sentences.</p>`}
  </section>`;
}

function phraseShow() {
  const x = RD.lines[RD.i % RD.lines.length];
  chainShow({ ...x, words: x.words });
}

/* ---------- 1 · Subtitles ---------- */

const SUBS_N = 10;
const SUBS_CPS = [0.8, 10];

/* Everything you could be shown: the words, and sentences made of what
   you've learned — every example of a pattern you know, and every example
   of a word you know — each as you'd read it, with what it means and the
   text its recording is under. */
function subsPool() {
  const out = new Map();
  /* kana: what otherMeanings tells spellings apart by */
  const add = (text, m, sayText, kind) => { const t = text.trim(); if (t && !out.has(t)) out.set(t, { text: t, kana: sayText, m, say: sayText, kind, len: [...t].length }); };
  readPool().forEach(w => add(w.text, w.m, w.say, "word"));
  PATTERNS.filter(p => isLearned(p.key)).forEach(p => p.ex.forEach(e => add(readText(e.jp), e.en, e.kana, "sentence")));
  learnedWords().forEach(x => (x.ex || []).forEach(([jp, en]) => add(readText(jp), en, furiKana(jp), "sentence")));
  return [...out.values()];
}

/* the next line: as long as you're up to, if there is one, and not one
   seen already this round */
function subsNext() {
  const fits = RD.lines.filter(x => x.len <= RD.len && !RD.seen.has(x.text));
  const pool = fits.length ? fits : RD.lines.filter(x => !RD.seen.has(x.text));
  const top = Math.max(...pool.map(x => x.len));
  const near = pool.filter(x => x.len >= Math.max(1, Math.min(top, RD.len) - 2));
  return sample(near.length ? near : pool, 1)[0];
}

function subsShow() {
  const x = subsNext();
  RD.seen.add(x.text);
  /* three other meanings from lines of about the same length, so a long
     line's meaning doesn't give itself away by being long */
  const like = RD.lines.filter(y => y !== x && Math.abs(y.len - x.len) <= Math.max(2, x.len * .4));
  const opts = shuffle([x, ...otherMeanings(x, like.length >= 6 ? like : RD.lines, 3)]);
  RD.q = { x, opts, answered: false, shown: false };
  const ms = Math.max(400, x.len * 1000 / RD.cps);
  $("#rdPace").textContent = `${RD.cps.toFixed(1)}/s`;
  $("#rdBody").innerHTML = `<div class="sb-play">
    <div class="sb-screen" id="sbScreen">
      <div class="sb-line" lang="ja" id="sbLine">${esc(x.text)}</div>
      <div class="sb-time"><i style="animation-duration:${ms}ms"></i></div>
    </div>
    <div class="opts n4 words sb-opts" id="sbOpts" hidden>${opts.map((o, i) => `<button class="opt" data-act="sb-opt" data-i="${i}"><kbd>${i + 1}</kbd><span>${esc(o.m)}</span></button>`).join("")}</div>
    <div class="verdict" id="sbVerdict" aria-live="polite"></div>
  </div>`;
  if (state.settings.sound) say(x.say);
  RD.hide = setTimeout(() => {
    if (!RD?.q || RD.q.x !== x) return;
    $("#sbLine").classList.add("gone");
    $("#sbOpts").hidden = false;
    RD.q.shown = true;
    RD.q.t0 = performance.now();
  }, ms);
}

function subsAnswer(i) {
  const q = RD?.q;
  if (!q || q.answered || !q.shown) return;
  q.answered = true;
  const ok = q.opts[i] === q.x;
  RD.res[RD.i] = ok ? "ok" : "miss";
  /* keeping up: faster, and every third right in a row, longer lines */
  RD.cps = Math.min(SUBS_CPS[1], Math.max(SUBS_CPS[0], RD.cps * (ok ? 1.06 : 0.9)));
  RD.streak = ok ? RD.streak + 1 : 0;
  const longest = Math.max(...RD.lines.map(x => x.len));
  if (RD.streak >= 3 && RD.len < longest) { RD.len = Math.min(longest, RD.len + 2); RD.streak = 0; }
  $$("#sbOpts .opt").forEach((b, j) => {
    b.disabled = true;
    if (q.opts[j] === q.x) b.classList.add("right");
    else if (j === i) b.classList.add("wrong");
  });
  $("#sbLine").classList.remove("gone");
  const v = $("#sbVerdict");
  v.className = "verdict " + (ok ? "ok" : "miss");
  v.innerHTML = `${icon(ok ? "check" : "close", "v-ico")} ${esc(q.x.m)}`;
  rdStrip();
  if (ok) RD.next = setTimeout(() => { RD.i++; rdStep(); }, 900);
  else $("#rdFoot").innerHTML = `<button class="btn btn-ghost" data-act="sb-again">${icon("speaker")} Again</button><button class="btn" data-act="rd-next" id="rdNext">Next <kbd>↵</kbd></button>`;
}

/* ---------- 2 · Word chains ---------- */

const CHAIN_MAX = 5;

function chainShow(given = null) {
  let ch = given;
  for (let n = RD.len; n >= 2 && !ch; n--) ch = makeChain(RD.pool, n);
  if (!ch) { RD.n = RD.i; return rdFinish(); }
  RD.ch = { ...ch, found: new Set(), wrong: 0, helped: false, t0: performance.now() };
  const chars = [...ch.text];
  const what = given ? "pieces" : "words";
  $("#rdPace").textContent = `${ch.words.length} ${what}`;
  $("#rdBody").innerHTML = `<div class="rd-chains">
    <div class="q-ask">${given ? `Find the ${ch.words.length} pieces — words, and the little words between them.` : `Find the ${ch.words.length} words. Drag across each one.`}</div>
    <div class="rd-chain" id="rdChain" lang="ja">${chars.map((c, i) => `<span class="rd-ch" data-i="${i}">${esc(c)}</span>`).join("")}</div>
    <div class="rd-found" id="rdFound"></div>
  </div>`;
  $("#rdFoot").innerHTML = `<button class="btn btn-ghost" data-act="rd-help">Show one</button><span></span>`;
  bindChain();
}

/* A drag picks a run of the characters still showing; each knows where it
   sat in the chain (data-i), since found words leave it. */
function bindChain() {
  const box = $("#rdChain");
  let from = null, to = null;
  const tiles = () => $$(".rd-ch:not(.leaving)", box);
  const at = e => {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.(".rd-ch");
    return el && box.contains(el) && !el.classList.contains("leaving") ? tiles().indexOf(el) : null;
  };
  const paint = () => {
    const [a, b] = from == null ? [-1, -2] : [Math.min(from, to), Math.max(from, to)];
    tiles().forEach((el, i) => {
      el.classList.toggle("sel", i >= a && i <= b);
      el.classList.toggle("s0", i === a);
      el.classList.toggle("s1", i === b);
    });
  };
  box.addEventListener("pointerdown", e => {
    const i = at(e);
    if (i == null || i < 0 || !RD?.ch) return;
    e.preventDefault();
    try { box.setPointerCapture(e.pointerId); } catch {}
    from = to = i; paint();
  });
  box.addEventListener("pointermove", e => {
    if (from == null) return;
    const i = at(e);
    if (i != null && i >= 0 && i !== to) { to = i; paint(); }
  });
  const up = () => {
    if (from == null) return;
    const picked = tiles().slice(Math.min(from, to), Math.max(from, to) + 1);
    from = to = null; paint();
    chainPick(picked);
  };
  box.addEventListener("pointerup", up);
  box.addEventListener("pointercancel", () => { from = to = null; paint(); });
}

const CHAIN_HUES = 5;

function chainPick(picked) {
  const ch = RD?.ch;
  if (!ch || !picked.length) return;
  const idx = picked.map(el => +el.dataset.i);
  const a = idx[0], b = idx[idx.length - 1] + 1;
  const run = idx.every((x, j) => x === a + j);
  const w = run ? ch.spans.findIndex(([s, e], i) => s === a && e === b && !ch.found.has(i)) : -1;
  if (w < 0) {
    /* a stretch that isn't one of the words: it wobbles and lets go */
    ch.wrong++;
    picked.forEach(el => { el.classList.remove("nope"); void el.offsetWidth; el.classList.add("nope"); });
    return;
  }
  chainFound(w);
}

/* A found word lifts out of the line — what's left is easier to read and to
   drag across — and drops into its place in the line below, which builds
   the chain back up with the spaces in. */
function chainFound(w) {
  const ch = RD.ch;
  ch.found.add(w);
  const [s, e] = ch.spans[w];
  const hue = ch.found.size % CHAIN_HUES;
  $$(".rd-ch", $("#rdChain")).forEach(el => {
    const i = +el.dataset.i;
    if (i < s || i >= e) return;
    el.classList.add("found", "leaving", "h" + hue);
    setTimeout(() => el.remove(), 260);
  });
  const x = ch.words[w];
  const chip = `<span class="rd-chip h${hue}" data-s="${s}"><b lang="ja">${esc(x.text)}</b>${x.m ? " " + esc(x.m) : ""}</span>`;
  const after = $$("#rdFound .rd-chip").find(c => +c.dataset.s > s);
  if (after) after.insertAdjacentHTML("beforebegin", chip); else $("#rdFound").insertAdjacentHTML("beforeend", chip);
  if (state.settings.sound) say(x.say);
  if (ch.found.size === ch.words.length) chainDone();
}

function chainDone() {
  const ch = RD.ch;
  const ms = performance.now() - ch.t0;
  const clean = !ch.wrong && !ch.helped;
  RD.res[RD.i] = clean ? "ok" : ch.helped ? "miss" : "near";
  if (!ch.helped) { RD.ms += ms; RD.chars += [...ch.text].length; }
  if (clean) RD.clean++;
  /* two clean in a row: one more word a chain; a messy one: one fewer */
  RD.streak = clean ? RD.streak + 1 : 0;
  if (RD.streak >= 2 && RD.len < CHAIN_MAX) { RD.len++; RD.streak = 0; }
  else if (ch.wrong >= 2 && RD.len > 2) RD.len--;
  $("#rdFound").classList.add("done");
  if (ch.en) {
    $("#rdFound").insertAdjacentHTML("afterend", `<p class="rd-en">${esc(ch.en)}</p>`);
    if (state.settings.sound) setTimeout(() => say(ch.say), 350);
  }
  RD.ch = null;
  rdStrip();
  RD.next = setTimeout(() => { RD.i++; rdStep(); }, ch.en ? 2200 : 700);
}

function chainHelp() {
  const ch = RD?.ch;
  if (!ch) return;
  const w = ch.spans.findIndex((_, i) => !ch.found.has(i));
  if (w < 0) return;
  ch.helped = true;
  chainFound(w);
}

/* ---------- 探す Word search: the game ---------- */

const SEARCH_SIZES = { 6: 5, 8: 8, 10: 12 };          /* side -> words hidden */
const SEARCH_CLUES = { m: "Meanings", w: "Words", n: "Just a number" };
const searchable = pool => pool.filter(w => chainable(w) && [...w.text].length >= 2);
const fmtTime = ms => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${pad2(s % 60)}`; };

function searchCard(pool) {
  const s = state.read.search, words = searchable(pool);
  const open = words.length >= 6;
  const seg = (field, opts, label) => `<div class="seg">${Object.keys(opts).map(o => `<button class="${String(s[field]) === o ? "on" : ""}" data-act="srch-pick" data-f="${field}" data-v="${o}">${label(o)}</button>`).join("")}</div>`;
  const best = s.best[s.size];
  return `<section class="card rd-rung rd-search ${open ? "" : "locked"}">
    <div class="rd-rung-head"><span class="rd-n rd-game" lang="ja">探</span><h2><span lang="ja">探す</span> Word search</h2></div>
    <p>A grid of kana you know, with words you know hidden in it — across, down (the way Japanese is often written) and diagonally. Drag from a word's first character to its last.</p>
    ${open ? `<div class="pick"><span class="pick-l">Grid</span>${seg("size", SEARCH_SIZES, o => `${o}×${o}`)}</div>
      <div class="pick"><span class="pick-l">Clues</span>${seg("clue", SEARCH_CLUES, o => SEARCH_CLUES[o])}</div>
      <p class="muted small">${s.clue === "m" ? "You get the meanings, and find the Japanese." : s.clue === "w" ? "You get the words, and find them." : "You only get how many — finding them is the reading."}
        ${best ? ` Best on ${s.size}×${s.size}: <b>${fmtTime(best)}</b>.` : ""}</p>
      <button class="btn rd-go" data-act="rd-start" data-r="search">Find ${Math.min(SEARCH_SIZES[s.size], words.length)} words</button>`
      : `<p class="muted small">Learn a few more words first — this needs six you can read.</p>`}
  </section>`;
}

function searchOpen() {
  const s = state.read.search, size = +s.size;
  const words = searchable(RD.pool);
  /* the filler is kana you've learned, in the scripts the words use, with
     the words' own characters mixed in so they don't stand out */
  const kata = words.some(w => /[\u30a1-\u30fa]/.test(w.text)), hira = words.some(w => /[\u3041-\u3096]/.test(w.text));
  const known = learnedKana().filter(e => [...e.k].length === 1 && !e.concept && ((e.set === "k" && kata) || (e.set === "h" && hira))).map(e => e.k);
  const own = words.flatMap(w => [...w.text]);
  const g = makeSearch(words, size, SEARCH_SIZES[size], [...known, ...known, ...own]);
  if (!g) { closeRead(); toast("Couldn't hide enough words in that grid — try a bigger one."); return; }
  Object.assign(RD, { size, clue: s.clue, g, found: new Set(), bonus: new Set(), helped: false, n: g.placed.length, t0: performance.now() });
  $("#rdStrip").innerHTML = g.placed.map((_, i) => `<i data-i="${i}"></i>`).join("");
  $("#rdPace").textContent = "0:00";
  RD.timer = setInterval(() => { if (RD && !RD.done) $("#rdPace").textContent = fmtTime(performance.now() - RD.t0); }, 500);
  $("#rdBody").innerHTML = `<div class="srch-play">
    <div class="srch-board">
      <div class="q-ask">${RD.clue === "n" ? `Find <b>${RD.n}</b> words.` : "Find these words."} Drag from the first character to the last.</div>
      <div class="srch-grid" id="wsGrid" lang="ja" style="--n:${size}">
        <svg class="srch-lines" id="wsLines" viewBox="0 0 ${size} ${size}" aria-hidden="true"></svg>
        ${g.grid.map((row, r) => row.map((ch, c) => `<span class="srch-c" data-r="${r}" data-c="${c}">${esc(ch)}</span>`).join("")).join("")}
      </div>
    </div>
    <div class="srch-side">
      <div class="srch-count" id="wsCount">0 of ${RD.n}</div>
      <div class="srch-clues" id="wsClues">${RD.clue === "n" ? "" : g.placed.map((p, i) => `<span class="srch-clue" data-i="${i}">${RD.clue === "m" ? esc(p.w.m) : `<b lang="ja">${esc(p.w.text)}</b>`}</span>`).join("")}</div>
      <div class="srch-bonus" id="wsBonus"></div>
    </div>
  </div>`;
  $("#rdFoot").innerHTML = `<button class="btn btn-ghost" data-act="srch-hint">Show me where</button><span></span>`;
  bindSearch();
}

/* the line a drag makes, snapped to the nearest of the eight directions */
function searchSnap(r0, c0, r1, c1, size) {
  const dr = r1 - r0, dc = c1 - c0;
  if (!dr && !dc) return [r0, c0];
  const step = Math.round(Math.atan2(dr, dc) / (Math.PI / 4));
  const sr = Math.round(Math.sin(step * Math.PI / 4)), sc = Math.round(Math.cos(step * Math.PI / 4));
  let len = Math.max(Math.abs(dr), Math.abs(dc));
  while (len > 0 && (r0 + sr * len < 0 || r0 + sr * len >= size || c0 + sc * len < 0 || c0 + sc * len >= size)) len--;
  return [r0 + sr * len, c0 + sc * len];
}

const wsLine = (a, b, cls) => `<line x1="${a[1] + .5}" y1="${a[0] + .5}" x2="${b[1] + .5}" y2="${b[0] + .5}" class="${cls}"/>`;

function bindSearch() {
  const box = $("#wsGrid"), lines = $("#wsLines");
  let from = null, to = null;
  const at = e => {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.(".srch-c");
    return el && box.contains(el) ? [+el.dataset.r, +el.dataset.c] : null;
  };
  const drawSel = () => {
    lines.querySelector(".sel")?.remove();
    if (from) lines.insertAdjacentHTML("beforeend", wsLine(from, to, "sel"));
  };
  box.addEventListener("pointerdown", e => {
    const p = at(e);
    if (!p || !RD || RD.done) return;
    e.preventDefault();
    try { box.setPointerCapture(e.pointerId); } catch {}
    from = to = p; drawSel();
  });
  box.addEventListener("pointermove", e => {
    if (!from) return;
    const p = at(e);
    if (!p) return;
    const s = searchSnap(from[0], from[1], p[0], p[1], RD.size);
    if (s[0] !== to[0] || s[1] !== to[1]) { to = s; drawSel(); }
  });
  const up = () => {
    if (!from) return;
    const a = from, b = to;
    from = to = null; drawSel();
    searchPick(a, b);
  };
  box.addEventListener("pointerup", up);
  box.addEventListener("pointercancel", () => { from = to = null; drawSel(); });
}

function searchPick(a, b) {
  const len = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) + 1;
  const sr = Math.sign(b[0] - a[0]), sc = Math.sign(b[1] - a[1]);
  const path = Array.from({ length: len }, (_, i) => [a[0] + sr * i, a[1] + sc * i]);
  const key = path.map(([r, c]) => cellKey(r, c)).sort((x, y) => x - y).join();
  const i = RD.g.placed.findIndex((p, j) => !RD.found.has(j) && p.cells.join() === key);
  if (i >= 0) return searchFound(i);
  /* a word you know that isn't one of the hidden ones: a bonus, not a find */
  const text = path.map(([r, c]) => RD.g.grid[r][c]).join("");
  const other = len >= 2 && !RD.g.placed.some(p => p.w.text === text) && RD.pool.find(w => w.text === text);
  if (other && !RD.bonus.has(text)) {
    RD.bonus.add(text);
    $("#wsBonus").insertAdjacentHTML("beforeend", `<span class="rd-chip srch-extra"><b lang="ja">${esc(other.text)}</b> ${esc(other.m)} <small>bonus</small></span>`);
    if (state.settings.sound) say(other.say);
    return;
  }
  if (len < 2) return;
  path.forEach(([r, c]) => { const el = $(`.srch-c[data-r="${r}"][data-c="${c}"]`); el.classList.remove("nope"); void el.offsetWidth; el.classList.add("nope"); });
}

function searchFound(i) {
  const p = RD.g.placed[i];
  RD.found.add(i);
  const hue = RD.found.size % CHAIN_HUES;
  $("#wsLines").insertAdjacentHTML("afterbegin", wsLine(p.from, p.to, "h" + hue));
  p.cells.forEach(k => $(`.srch-c[data-r="${Math.floor(k / 100)}"][data-c="${k % 100}"]`).classList.add("got"));
  const chip = `<b lang="ja">${esc(p.w.text)}</b> ${esc(p.w.m)}`;
  const clue = $(`.srch-clue[data-i="${i}"]`);
  /* a found word goes to the end of the list, so the ones still to find
     stay at the top — on a phone the list sits under the grid */
  if (clue) { clue.className = `srch-clue rd-chip h${hue} got`; clue.innerHTML = chip; $("#wsClues").append(clue); }
  else $("#wsClues").insertAdjacentHTML("beforeend", `<span class="srch-clue rd-chip h${hue} got">${chip}</span>`);
  $("#wsCount").textContent = `${RD.found.size} of ${RD.n}`;
  RD.res[RD.found.size - 1] = "ok";
  rdStrip();
  if (state.settings.sound) say(p.w.say);
  if (RD.found.size === RD.n) searchDone();
}

/* Show me where: the first character of a word not yet found pulses. Using
   it means the time can't be a best. */
function searchHint() {
  if (!RD || RD.done || RD.rung !== "search") return;
  const left = RD.g.placed.map((p, i) => i).filter(i => !RD.found.has(i));
  if (!left.length) return;
  const p = RD.g.placed[sample(left, 1)[0]];
  RD.helped = true;
  const el = $(`.srch-c[data-r="${p.from[0]}"][data-c="${p.from[1]}"]`);
  el.classList.remove("hint"); void el.offsetWidth; el.classList.add("hint");
}

function searchDone() {
  RD.done = true;
  clearInterval(RD.timer);
  const ms = performance.now() - RD.t0;
  addStudyTime(ms);
  day().read = (day().read || 0) + 1;
  const s = state.read.search;
  s.rounds = (s.rounds || 0) + 1;
  const best = !RD.helped && (!s.best[RD.size] || ms < s.best[RD.size]);
  if (best) s.best[RD.size] = Math.round(ms);
  save();
  crumb(`read done search ${RD.size} ${fmtTime(ms)}`);
  $("#rdPace").textContent = fmtTime(ms);
  setTimeout(() => {
    if (!RD) return;
    $("#rdFoot").innerHTML = `<button class="btn btn-ghost" data-act="rd-close">Done <kbd>Esc</kbd></button>
      <button class="btn" data-act="rd-again">Another grid <kbd>↵</kbd></button>`;
    $(".srch-side").insertAdjacentHTML("afterbegin", `<div class="srch-done">${neko(best ? "cheer" : "happy", "hop")}${best ? stamp("新記録") : ""}
      <div><b>All ${RD.n} in ${fmtTime(ms)}</b>${RD.bonus.size ? ` · ${RD.bonus.size} bonus` : ""}${RD.helped ? ` <small class="muted">— with a hint</small>` : best ? ` <small class="muted">— a new best on ${RD.size}×${RD.size}</small>` : ""}</div></div>`);
    if (best) petals($("#read"), 24);
  }, 500);
}

/* ---------- 結ぶ Match ---------- */

/* Meanings to words. Two ways to lay it out:
   - four: four meanings beside four words; connect each pair, by tapping
     one and then the other or by drawing a line between them. Five sets.
   - one: one word above four meanings; drag it onto its meaning (or tap
     the meaning). Less on the screen, and no ruling out the others by
     elimination. Twelve words. The default on a phone.
   A word right first time counts; one that took a second go is a miss,
   and a lesson word is graded either way, like a sprint answer. */
const MATCH_SETS = 5, MATCH_ONE = 12;
const MATCH_LAYOUTS = { four: "Four and four", one: "One at a time" };

function matchCard(pool) {
  const m = state.read.match, open = pool.length >= 8;
  const layout = m.layout || (isPhone() ? "one" : "four");
  const best = m.best[layout];
  return `<section class="card rd-rung rd-match ${open ? "" : "locked"}">
    <div class="rd-rung-head"><span class="rd-n rd-game" lang="ja">結</span><h2><span lang="ja">結ぶ</span> Match</h2></div>
    <p>Meanings and words you know — put each word with what it means.</p>
    ${open ? `<div class="pick"><span class="pick-l">Layout</span><div class="seg">${Object.keys(MATCH_LAYOUTS).map(o => `<button class="${layout === o ? "on" : ""}" data-act="mt-pick" data-v="${o}">${MATCH_LAYOUTS[o]}</button>`).join("")}</div></div>
      <p class="muted small">${layout === "four" ? "Four meanings beside four words: tap one and then its partner, or draw a line between them." : "One word and four meanings: drag the word onto its meaning, or tap the meaning."}
        ${best ? ` Best without a slip: <b>${fmtTime(best)}</b>.` : ""}</p>
      <button class="btn rd-go" data-act="rd-start" data-r="match">${layout === "four" ? `Match ${MATCH_SETS * 4} words` : `Match ${MATCH_ONE} words`}</button>`
      : `<p class="muted small">Learn a few more words first — this needs eight you can read.</p>`}
  </section>`;
}

/* n words with different meanings and different spellings */
function matchPick(pool, n) {
  const seenM = new Set(), seenK = new Set();
  return shuffle([...pool]).filter(w => !seenM.has(w.m) && !seenK.has(w.kana) && seenM.add(w.m) && seenK.add(w.kana)).slice(0, n);
}

function matchOpen() {
  const m = state.read.match;
  const layout = m.layout || (isPhone() ? "one" : "four");
  Object.assign(RD, { layout, slips: 0, t0: performance.now() });
  if (layout === "four") {
    RD.n = MATCH_SETS * 4;
    RD.sets = Array.from({ length: MATCH_SETS }, () => matchPick(RD.pool, 4)).filter(s => s.length === 4);
    RD.n = RD.sets.length * 4;
  } else {
    RD.words = matchPick(RD.pool, MATCH_ONE);
    while (RD.words.length < MATCH_ONE) RD.words.push(sample(RD.pool, 1)[0]);
    RD.n = MATCH_ONE;
  }
  $("#rdStrip").innerHTML = Array.from({ length: RD.n }, (_, i) => `<i data-i="${i}"></i>`).join("");
  RD.timer = setInterval(() => { if (RD && !RD.done) $("#rdPace").textContent = fmtTime(performance.now() - RD.t0); }, 500);
  $("#rdPace").textContent = "0:00";
  if (layout === "four") { RD.set = 0; matchFourShow(); } else matchOneShow();
}

/* the strip: one mark a word, in the order they're settled */
function matchMark(ok) { RD.res[RD.i] = ok ? "ok" : "miss"; RD.i++; rdStrip(); }

function matchFirst(w, ok, ms) {
  grade(w.key, "r", ok, ms, "speed");
  matchMark(ok);
  if (!ok) RD.slips++;
}

/* --- four and four --- */

function matchFourShow() {
  const set = RD.sets[RD.set];
  const left = shuffle([...set]), right = shuffle([...set]);
  RD.four = { set, left, right, done: new Set(), tried: new Set(), sel: null, t0: performance.now() };
  $("#rdBody").innerHTML = `<div class="mt-four">
    <div class="q-ask">Set ${RD.set + 1} of ${RD.sets.length}: put each word with its meaning.</div>
    <div class="mt-board" id="mtBoard">
      <svg class="mt-lines" id="mtLines" aria-hidden="true"></svg>
      <div class="mt-col">${left.map((w, i) => `<button class="mt-card mt-m" data-side="m" data-i="${i}">${esc(w.m)}</button>`).join("")}</div>
      <div class="mt-col">${right.map((w, i) => `<button class="mt-card mt-w" data-side="w" data-i="${i}" lang="ja">${esc(w.text)}</button>`).join("")}</div>
    </div>
  </div>`;
  bindFour();
}

function bindFour() {
  const board = $("#mtBoard"), lines = $("#mtLines");
  let from = null;
  const cardAt = (x, y) => document.elementFromPoint(x, y)?.closest?.(".mt-card");
  const centre = el => { const b = board.getBoundingClientRect(), r = el.getBoundingClientRect();
    return [el.dataset.side === "m" ? r.right - b.left : r.left - b.left, r.top - b.top + r.height / 2]; };
  const drawTemp = (x, y) => {
    lines.querySelector(".tmp")?.remove();
    if (!from || x == null) return;
    const [x1, y1] = centre(from), b = board.getBoundingClientRect();
    lines.insertAdjacentHTML("beforeend", `<line class="tmp" x1="${x1}" y1="${y1}" x2="${x - b.left}" y2="${y - b.top}"/>`);
  };
  board.addEventListener("pointerdown", e => {
    const el = e.target.closest(".mt-card");
    if (!el || el.disabled || !RD?.four) return;
    e.preventDefault();
    try { board.setPointerCapture(e.pointerId); } catch {}
    const sel = RD.four.sel;
    /* a tap on the other side, with one already chosen, pairs them */
    if (sel && sel.dataset.side !== el.dataset.side) { from = null; return matchPair(sel, el); }
    from = el;
    $$(".mt-card.sel", board).forEach(c => c.classList.remove("sel"));
    el.classList.add("sel");
    RD.four.sel = el;
  });
  board.addEventListener("pointermove", e => { if (from) drawTemp(e.clientX, e.clientY); });
  board.addEventListener("pointerup", e => {
    if (!from) return;
    const el = cardAt(e.clientX, e.clientY), a = from;
    from = null; drawTemp();
    /* a line drawn to a card on the other side pairs them; letting go
       anywhere else leaves the first one chosen, for a tap */
    if (el && !el.disabled && el.dataset.side !== a.dataset.side) matchPair(a, el);
  });
  board.addEventListener("pointercancel", () => { from = null; drawTemp(); });
}

function matchPair(a, b) {
  const F = RD.four;
  const mEl = a.dataset.side === "m" ? a : b, wEl = a.dataset.side === "w" ? a : b;
  const mw = F.left[+mEl.dataset.i], ww = F.right[+wEl.dataset.i];
  F.sel = null;
  $$(".mt-card.sel").forEach(c => c.classList.remove("sel"));
  const ms = performance.now() - F.t0;
  if (mw === ww) {
    if (!F.tried.has(ww)) matchFirst(ww, true, ms);
    F.done.add(ww);
    const hue = F.done.size % CHAIN_HUES;
    [mEl, wEl].forEach(el => { el.disabled = true; el.classList.add("got", "h" + hue); });
    const board = $("#mtBoard").getBoundingClientRect(), r1 = mEl.getBoundingClientRect(), r2 = wEl.getBoundingClientRect();
    $("#mtLines").insertAdjacentHTML("beforeend", `<line class="h${hue}" x1="${r1.right - board.left}" y1="${r1.top - board.top + r1.height / 2}" x2="${r2.left - board.left}" y2="${r2.top - board.top + r2.height / 2}"/>`);
    if (state.settings.sound) say(ww.say);
    if (F.done.size === 4) {
      RD.set++;
      RD.next = setTimeout(() => RD.set < RD.sets.length ? matchFourShow() : matchDone(), 650);
    }
    return;
  }
  /* wrong: both shake; the word it should have been is now a slip */
  [mEl, wEl].forEach(el => { el.classList.remove("nope"); void el.offsetWidth; el.classList.add("nope"); });
  if (!F.tried.has(ww) && !F.done.has(ww)) { F.tried.add(ww); matchFirst(ww, false, ms); }
}

/* --- one at a time --- */

/* One at a time: the word in the middle, its four meanings round it — above,
   right, below, left. A short swipe toward a meaning answers (no need to
   carry it all the way there, so no dropping it early on the way); the
   meaning it's heading for lights up first, and a swipe too short to be
   sure of springs back. A tap on a meaning, an arrow key or 1–4 answers
   too. */
const MATCH_DIRS = ["↑", "→", "↓", "←"];
const SWIPE_AT = 40;           /* px: past this, letting go answers */

function matchOneShow() {
  if (RD.i >= RD.n) return matchDone();
  const w = RD.words[RD.i];
  const opts = shuffle([w, ...otherMeanings(w, RD.pool, 3)]);
  RD.one = { w, opts, tried: false, t0: performance.now() };
  const target = i => `<button class="mt-card mt-t d${i}" data-act="mt-tap" data-i="${i}"><span class="mt-arrow" aria-hidden="true">${MATCH_DIRS[i]}</span>${esc(opts[i].m)}</button>`;
  $("#rdBody").innerHTML = `<div class="mt-one">
    <div class="q-ask">Swipe the word toward what it means — or tap the meaning.</div>
    <div class="mt-compass">
      ${target(0)}${target(3)}
      <div class="mt-centre"><div class="mt-drag" id="mtDrag" lang="ja">${esc(w.text)}</div></div>
      ${target(1)}${target(2)}
    </div>
  </div>`;
  bindOne();
}

function bindOne() {
  const card = $("#mtDrag");
  let start = null, dir = null;
  const aim = d => $$(".mt-t").forEach(t => t.classList.toggle("over", +t.dataset.i === d));
  card.addEventListener("pointerdown", e => {
    if (!RD?.one) return;
    e.preventDefault();
    try { card.setPointerCapture(e.pointerId); } catch {}
    start = [e.clientX, e.clientY]; dir = null;
    card.classList.add("lift");
  });
  card.addEventListener("pointermove", e => {
    if (!start) return;
    const dx = e.clientX - start[0], dy = e.clientY - start[1], far = Math.hypot(dx, dy);
    dir = far < 16 ? null : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0);
    if (dir != null && $(`.mt-t[data-i="${dir}"]`).disabled) dir = null;
    /* the word leans the way it's going, a little, not all the way */
    const k = Math.min(1, 56 / (far || 1));
    card.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
    card.classList.toggle("sure", far >= SWIPE_AT && dir != null);
    aim(dir);
  });
  const done = e => {
    if (!start) return;
    const far = Math.hypot(e.clientX - start[0], e.clientY - start[1]);
    start = null;
    card.classList.remove("lift", "sure");
    aim(null);
    if (far >= SWIPE_AT && dir != null) matchOne(dir, card);
    else card.style.transform = "";
  };
  card.addEventListener("pointerup", done);
  card.addEventListener("pointercancel", () => { start = null; card.style.transform = ""; card.classList.remove("lift", "sure"); aim(null); });
}

function matchOne(i, card = $("#mtDrag")) {
  const O = RD?.one;
  if (!O) return;
  const t = $(`.mt-t[data-i="${i}"]`);
  const ok = O.opts[i] === O.w;
  if (ok) {
    /* right first time is a mark; after a slip, the slip already is one */
    if (!O.tried) { RD.res[RD.i] = "ok"; grade(O.w.key, "r", true, performance.now() - O.t0, "speed"); }
    t.classList.add("got", "h1");
    const cr = card.getBoundingClientRect(), tr = t.getBoundingClientRect();
    card.classList.add("fly");
    card.style.transform = `translate(${tr.left + tr.width / 2 - cr.left - cr.width / 2}px, ${tr.top + tr.height / 2 - cr.top - cr.height / 2}px) scale(.5)`;
    setTimeout(() => { card.style.visibility = "hidden"; t.insertAdjacentHTML("beforeend", `<b class="mt-in" lang="ja">${esc(O.w.text)}</b>`); }, 220);
    if (state.settings.sound) say(O.w.say);
    RD.one = null;
    RD.i++;
    rdStrip();
    RD.next = setTimeout(matchOneShow, 600);
    return;
  }
  card.style.transform = "";
  t.classList.remove("nope"); void t.offsetWidth; t.classList.add("nope");
  t.disabled = true;
  if (!O.tried) { O.tried = true; RD.res[RD.i] = "miss"; RD.slips++; grade(O.w.key, "r", false, performance.now() - O.t0, "speed"); rdStrip(); }
}

function matchDone() {
  RD.done = true;
  clearInterval(RD.timer);
  const ms = performance.now() - RD.t0;
  addStudyTime(ms);
  day().read = (day().read || 0) + 1;
  const m = state.read.match;
  m.rounds = (m.rounds || 0) + 1;
  const best = RD.slips === 0 && (!m.best[RD.layout] || ms < m.best[RD.layout]);
  if (best) m.best[RD.layout] = Math.round(ms);
  save();
  crumb(`read done match ${RD.layout} ${RD.slips} slips`);
  const right = RD.res.filter(x => x === "ok").length;
  $("#rdPace").textContent = fmtTime(ms);
  $("#rdBody").innerHTML = `<div class="finish">
    <div class="celebrate">${neko(best ? "cheer" : RD.slips <= 2 ? "happy" : "think", "hop")}${best ? stamp("新記録") : ""}</div>
    <div class="finish-big">${right}<small>/${RD.n}</small></div>
    <p>Right first time, in <b>${fmtTime(ms)}</b>${RD.slips ? ` · ${RD.slips} slip${RD.slips > 1 ? "s" : ""}` : " — not a slip"}</p>
    ${best ? `<div class="badge-best">New best</div>` : ""}
  </div>`;
  if (best) petals($("#read"), 24);
  $("#rdFoot").innerHTML = `<button class="btn btn-ghost" data-act="rd-close">Done <kbd>Esc</kbd></button>
    <button class="btn" data-act="rd-again">Again <kbd>↵</kbd></button>`;
}

/* ---------- the end of a round ---------- */

function rdFinish() {
  if (RD.done) return;
  RD.done = true;
  clearTimeout(RD.hide); clearTimeout(RD.next);
  addStudyTime(performance.now() - RD.t0);
  day().read = (day().read || 0) + 1;            /* Today's read ticks */
  const r = state.read[RD.rung];
  const total = RD.n;
  const right = RD.res.filter(x => x === "ok").length;
  let line, best = false;
  r.rounds = (r.rounds || 0) + 1;
  if (RD.rung === "texts") {
    const cps = RD.ms ? RD.chars / (RD.ms / 1000) : 0;
    if (cps > (r.best || 0) && right / total >= 0.75) { r.best = cps; best = true; }
    line = `${right} of ${total} answered right · read at <b>${cpsText(cps)}</b>`;
  } else if (RD.rung === "phrases") {
    const cps = RD.ms ? RD.chars / (RD.ms / 1000) : 0;
    if (cps > (r.best || 0) && RD.clean >= total / 2) { r.best = cps; best = true; }
    line = `Read at <b>${cpsText(cps)}</b> · ${RD.clean} of ${total} split clean`;
  } else if (RD.rung === "subs") {
    r.cps = RD.cps; r.len = RD.len;
    if (right / total >= 0.7 && RD.cps > (r.best || 0)) { r.best = RD.cps; best = true; }
    line = `Pace now <b>${cpsText(RD.cps)}</b>, lines up to ${RD.len} characters <small class="muted">— subtitles run at about ${SUBTITLE_CPS}</small>`;
  } else {
    const cps = RD.ms ? RD.chars / (RD.ms / 1000) : 0;
    r.n = RD.len;
    if (cps > (r.best || 0) && RD.clean >= total / 2) { r.best = cps; best = true; }
    line = `Read at <b>${cpsText(cps)}</b> · ${RD.clean} of ${total} found clean · next time ${RD.len} words a chain`;
  }
  save();
  crumb(`read done ${RD.rung} ${right}/${total}`);
  rdStrip();
  $("#rdBody").innerHTML = `<div class="finish">
    <div class="celebrate">${neko(best ? "cheer" : right >= total * 0.75 ? "happy" : "think", "hop")}${best ? stamp("新記録") : ""}</div>
    <div class="finish-big">${right}<small>/${total}</small></div>
    <p>${line}</p>
    ${best ? `<div class="badge-best">New best</div>` : ""}
  </div>`;
  if (best) petals($("#read"), 24);
  $("#rdFoot").innerHTML = `<button class="btn btn-ghost" data-act="rd-close">Done <kbd>Esc</kbd></button>
    <button class="btn" data-act="rd-again">Again <kbd>↵</kbd></button>`;
}

/* Keys while a round is up. Returns true if it took the key. */
function readKey(e) {
  if (!RD) return false;
  if (e.key === "Escape") { e.preventDefault(); closeRead(); return true; }
  if (RD.done) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ACTS["rd-again"](); } return true; }
  if (RD.rung === "match" && RD.one) {
    const d = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3 }[e.key] ?? (/^[1-4]$/.test(e.key) ? +e.key - 1 : null);
    if (d != null && !$(`.mt-t[data-i="${d}"]`)?.disabled) { e.preventDefault(); matchOne(d); }
  }
  if (RD.rung === "texts") {
    if (/^[1-4]$/.test(e.key)) { e.preventDefault(); textAnswer(+e.key - 1); }
    else if ((e.key === "Enter" || e.key === " ") && $("#rdNext")) { e.preventDefault(); $("#rdNext").click(); }
    return true;
  }
  if (RD.rung === "subs") {
    if (/^[1-4]$/.test(e.key)) { e.preventDefault(); subsAnswer(+e.key - 1); }
    else if ((e.key === "Enter" || e.key === " ") && $("#rdNext")) { e.preventDefault(); ACTS["rd-next"](); }
  }
  return true;
}

Object.assign(ACTS, {
  "rd-start": el => openRead(el.dataset.r),
  "rd-next": () => { if (RD && !RD.done) { RD.i++; rdStep(); } },
  "rd-help": () => chainHelp(),
  "tx-read": () => textRead(),
  "tx-opt": el => textAnswer(+el.dataset.i),
  "tx-peek": () => { if (RD?.t && !RD.t.answered) { RD.t.peeked = true; $("#txPeek").hidden = false; } },
  "tx-go": () => RD?.t?.go?.(),
  "tx-next": () => { if (!RD) return; RD.ti++; if (RD.ti >= RD.lines.length) rdFinish(); else textShow(); },
  "srch-hint": () => searchHint(),
  "mt-pick": el => { state.read.match.layout = el.dataset.v; save(); renderRead(); },
  "mt-tap": el => matchOne(+el.dataset.i),
  "sb-opt": el => subsAnswer(+el.dataset.i),
  "sb-again": () => { if (RD?.q) say(RD.q.x.say); },
  "srch-pick": el => {
    const s = state.read.search;
    s[el.dataset.f] = el.dataset.f === "size" ? +el.dataset.v : el.dataset.v;
    save();
    renderRead();
  },
  "rd-close": () => closeRead(),
  "rd-again": () => { const r = RD?.rung; closeRead(); if (r) openRead(r); },
});
