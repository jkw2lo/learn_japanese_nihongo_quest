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
  clearTimeout(RD.hide); clearTimeout(RD.next);
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
  "rd-close": () => closeRead(),
  "rd-again": () => { const r = RD?.rung; closeRead(); if (r) openRead(r); },
});
