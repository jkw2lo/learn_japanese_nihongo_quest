/* Nihongo Quest — 読む Read: reading words as words, faster.

   The kana stage teaches turning a shape into a sound, and the sprint makes
   that quick. Reading is the next thing: seeing たべます as one word rather
   than five kana, and finding the words in a line that has no spaces
   between them. This tab is a ladder of rungs, each opening when you know
   enough for it, and every rung built only from words you already know
   (README → Read):

   1. 一瞬 Flash — a word you know shows for a moment; pick its meaning. The
      moment shrinks as you get them right, and the pace is kept, in
      characters a second (subtitles run at about four).
   2. 区切り Word chains — two to five words you know run together with no
      spaces; drag across each word to find it. The chains grow as you find
      them cleanly.
   3–5. Phrases with particles, timed sentences, subtitles — later, as the
      words and grammar to build them arrive.

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
  { id: "flash", jp: "一瞬", en: "Flash", what: "A word you know shows for a moment. Pick what it means before it's gone — the moment shrinks as you get them right.", min: 6 },
  { id: "chains", jp: "区切り", en: "Word chains", what: "Words you know, run together with no spaces, the way Japanese is written. Drag across each word to find it.", min: 6 },
];
const READ_LATER = [
  { jp: "句", en: "Phrases", what: "Words joined by particles — わたしのかさ, えきはどこ. Opens once you've learned は and の (stage 4)." },
  { jp: "文", en: "Sentences", what: "Whole sentences against the clock, then a question. Opens once there are enough sentences you can read." },
  { jp: "字幕", en: "Subtitles", what: "Short scenes with sound, the lines timing out like subtitles do." },
];
const FLASH_N = 12, CHAIN_N = 8;
const FLASH_CPS = [0.8, 8];        /* the pace stays in here, characters a second */
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
    ${rung(READ_RUNGS[0], `<div class="rd-stat">Your pace: <b>${cpsText(r.flash.cps)}</b>${r.flash.best ? ` · best ${r.flash.best.toFixed(1)}` : ""}
        <small class="muted">${r.flash.cps >= SUBTITLE_CPS ? "— subtitle speed" : `— subtitles run at about ${SUBTITLE_CPS}`}</small></div>
      <button class="btn cta" data-act="rd-start" data-r="flash">Flash ${FLASH_N} words</button>`)}
    ${rung(READ_RUNGS[1], `<div class="rd-stat">${r.chains.rounds ? `Best: <b>${cpsText(r.chains.best)}</b> · up to ${r.chains.n} words a chain` : "Starts with two words a chain."}</div>
      <button class="btn cta" data-act="rd-start" data-r="chains">Find the words in ${CHAIN_N} chains</button>`)}
    ${searchCard(pool)}
    <section class="card rd-later">
      <div class="card-head"><h2>Further up</h2><span class="count">as you learn more</span></div>
      <ol class="rd-later-list" start="3">${READ_LATER.map(x => `<li><b><span lang="ja">${x.jp}</span> ${x.en}</b><br><span class="muted small">${esc(x.what)}</span></li>`).join("")}</ol>
    </section>
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
  if (rung === "flash") {
    RD.cps = state.read.flash.cps;
    RD.cps0 = RD.cps;
    RD.words = sample(pool, Math.min(FLASH_N, pool.length));
    while (RD.words.length < FLASH_N) RD.words.push(sample(pool, 1)[0]);
    RD.n = FLASH_N;
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
  if (RD.rung === "flash") flashShow(); else chainShow();
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

/* ---------- 1 · Flash ---------- */

function flashShow() {
  const x = RD.words[RD.i];
  const opts = shuffle([x, ...otherMeanings(x, RD.pool, 3)]);
  RD.q = { x, opts, answered: false, t0: performance.now() };
  const ms = Math.max(300, [...x.text].length * 1000 / RD.cps);
  $("#rdPace").textContent = `${RD.cps.toFixed(1)}/s`;
  $("#rdBody").innerHTML = `<div class="q rd-flash">
    <div class="rd-word-wrap"><div class="glyph-l word rd-word" lang="ja" id="rdWord">${esc(x.text)}</div></div>
    <div class="opts n4 words">${opts.map((o, i) => `<button class="opt" data-act="rd-opt" data-i="${i}"><kbd>${i + 1}</kbd><span>${esc(o.m)}</span></button>`).join("")}</div>
    <div class="verdict" id="rdVerdict" aria-live="polite"></div>
  </div>`;
  RD.hide = setTimeout(() => { const w = $("#rdWord"); if (w && !RD.q.answered) w.classList.add("gone"); }, ms);
}

function flashAnswer(i) {
  const q = RD?.q;
  if (!q || q.answered) return;
  q.answered = true;
  clearTimeout(RD.hide);
  const ok = q.opts[i] === q.x;
  const ms = performance.now() - q.t0;
  RD.res[RD.i] = ok ? "ok" : "miss";
  /* a lesson word is graded like a sprint answer; a kana word has no record */
  grade(q.x.key, "r", ok, ms, "speed");
  RD.cps = Math.min(FLASH_CPS[1], Math.max(FLASH_CPS[0], RD.cps * (ok ? 1.08 : 0.88)));
  $$("#rdBody .opt").forEach((b, j) => {
    b.disabled = true;
    if (q.opts[j] === q.x) b.classList.add("right");
    else if (j === i) b.classList.add("wrong");
  });
  $("#rdWord").classList.remove("gone");
  const v = $("#rdVerdict");
  v.className = "verdict " + (ok ? "ok" : "miss");
  v.innerHTML = `${icon(ok ? "check" : "close", "v-ico")} <span lang="ja">${esc(q.x.text)}</span> <span class="rom-always">${esc(q.x.m)}</span>`;
  if (state.settings.autoplay) say(q.x.say);
  rdStrip();
  if (ok) RD.next = setTimeout(() => { RD.i++; rdStep(); }, 650);
  else $("#rdFoot").innerHTML = `<span></span><button class="btn" data-act="rd-next" id="rdNext">Next <kbd>↵</kbd></button>`;
}

/* ---------- 2 · Word chains ---------- */

const CHAIN_MAX = 5;

function chainShow() {
  let ch = null;
  for (let n = RD.len; n >= 2 && !ch; n--) ch = makeChain(RD.pool, n);
  if (!ch) { RD.n = RD.i; return rdFinish(); }
  RD.ch = { ...ch, found: new Set(), wrong: 0, helped: false, t0: performance.now() };
  const chars = [...ch.text];
  $("#rdPace").textContent = `${ch.words.length} words`;
  $("#rdBody").innerHTML = `<div class="rd-chains">
    <div class="q-ask">Find the ${ch.words.length} words. Drag across each one.</div>
    <div class="rd-chain" id="rdChain" lang="ja">${chars.map((c, i) => `<span class="rd-ch" data-i="${i}">${esc(c)}</span>`).join("")}</div>
    <div class="rd-found" id="rdFound"></div>
  </div>`;
  $("#rdFoot").innerHTML = `<button class="btn btn-ghost" data-act="rd-help">Show one</button><span></span>`;
  bindChain();
}

function bindChain() {
  const box = $("#rdChain");
  let from = null, to = null;
  const at = e => {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest?.(".rd-ch");
    return el && box.contains(el) ? +el.dataset.i : null;
  };
  const paint = () => {
    const [a, b] = from == null ? [-1, -2] : [Math.min(from, to), Math.max(from, to)];
    $$(".rd-ch", box).forEach((el, i) => {
      el.classList.toggle("sel", i >= a && i <= b);
      el.classList.toggle("s0", i === a);
      el.classList.toggle("s1", i === b);
    });
  };
  box.addEventListener("pointerdown", e => {
    const i = at(e);
    if (i == null || !RD?.ch) return;
    e.preventDefault();
    try { box.setPointerCapture(e.pointerId); } catch {}
    from = to = i; paint();
  });
  box.addEventListener("pointermove", e => {
    if (from == null) return;
    const i = at(e);
    if (i != null && i !== to) { to = i; paint(); }
  });
  const up = () => {
    if (from == null) return;
    const a = Math.min(from, to), b = Math.max(from, to) + 1;
    from = to = null; paint();
    chainPick(a, b);
  };
  box.addEventListener("pointerup", up);
  box.addEventListener("pointercancel", () => { from = to = null; paint(); });
}

const CHAIN_HUES = 5;

function chainPick(a, b) {
  const ch = RD?.ch;
  if (!ch) return;
  const w = ch.spans.findIndex(([s, e], i) => s === a && e === b && !ch.found.has(i));
  if (w < 0) {
    /* a stretch that isn't one of the words: it wobbles and lets go */
    ch.wrong++;
    $$(".rd-ch", $("#rdChain")).forEach((el, i) => { if (i >= a && i < b && !el.classList.contains("found")) { el.classList.remove("nope"); void el.offsetWidth; el.classList.add("nope"); } });
    return;
  }
  chainFound(w);
}

function chainFound(w) {
  const ch = RD.ch;
  ch.found.add(w);
  const [s, e] = ch.spans[w];
  const hue = ch.found.size % CHAIN_HUES;
  /* the word becomes one band, and steps a little apart from its
     neighbours: the spaces appear as you find the words */
  $$(".rd-ch", $("#rdChain")).forEach((el, i) => {
    if (i < s || i >= e) return;
    el.classList.add("found", "h" + hue);
    if (i === s) el.classList.add("ws");
    if (i === e - 1) el.classList.add("we");
  });
  const x = ch.words[w];
  $("#rdFound").insertAdjacentHTML("beforeend", `<span class="rd-chip h${hue}"><b lang="ja">${esc(x.text)}</b> ${esc(x.m)}</span>`);
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
  $("#rdChain").classList.add("done");
  RD.ch = null;
  rdStrip();
  RD.next = setTimeout(() => { RD.i++; rdStep(); }, 700);
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
      <button class="btn cta" data-act="rd-start" data-r="search">Find ${Math.min(SEARCH_SIZES[s.size], words.length)} words</button>`
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
  if (clue) { clue.className = `srch-clue rd-chip h${hue} got`; clue.innerHTML = chip; }
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

/* ---------- the end of a round ---------- */

function rdFinish() {
  if (RD.done) return;
  RD.done = true;
  clearTimeout(RD.hide); clearTimeout(RD.next);
  addStudyTime(performance.now() - RD.t0);
  const r = state.read[RD.rung];
  const total = RD.n;
  const right = RD.res.filter(x => x === "ok").length;
  let line, best = false;
  r.rounds = (r.rounds || 0) + 1;
  if (RD.rung === "flash") {
    /* the pace carries over; a round of nine in twelve or better can set a best */
    r.cps = RD.cps;
    if (right / total >= 0.75 && RD.cps > (r.best || 0)) { r.best = RD.cps; best = true; }
    const d = RD.cps - RD.cps0;
    line = `Pace now <b>${cpsText(RD.cps)}</b> <small class="muted">(${d >= 0 ? "+" : ""}${d.toFixed(1)} this round)</small>`;
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
  if (RD.rung === "flash") {
    if (/^[1-4]$/.test(e.key)) { e.preventDefault(); flashAnswer(+e.key - 1); }
    else if ((e.key === "Enter" || e.key === " ") && $("#rdNext")) { e.preventDefault(); ACTS["rd-next"](); }
  }
  return true;
}

Object.assign(ACTS, {
  "rd-start": el => openRead(el.dataset.r),
  "rd-opt": el => flashAnswer(+el.dataset.i),
  "rd-next": () => { if (RD && !RD.done) { RD.i++; rdStep(); } },
  "rd-help": () => chainHelp(),
  "srch-hint": () => searchHint(),
  "srch-pick": el => {
    const s = state.read.search;
    s[el.dataset.f] = el.dataset.f === "size" ? +el.dataset.v : el.dataset.v;
    save();
    renderRead();
  },
  "rd-close": () => closeRead(),
  "rd-again": () => { const r = RD?.rung; closeRead(); if (r) openRead(r); },
});
