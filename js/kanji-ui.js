/* Nihongo Quest — kanji: the card, the drills, the chart.

   Kanji are a layer over words, never the way in (README → Kanji). A
   kanji's card shows the words you already know that use it; the drill
   that matters is reading it inside one of those words, with the furigana
   gone. Once a kanji is learned, its furigana drops away everywhere — in
   words, sentences, patterns and the menu — because knowsKanji() is what
   furiHtml() asks.

   Skills: m — what it means; y — reading it in a word; w — writing it
   (only with Settings → Write kanji on). */

const learnedKanji = () => KANJI.filter(e => isLearned(e.key));

/* The words that use a kanji: learned ones first. */
function wordsWith(ch, learnedOnly = false) {
  const ws = WORDS.filter(w => w.plain.includes(ch));
  const got = ws.filter(w => isLearned(w.key));
  return learnedOnly ? got : [...got, ...ws.filter(w => !isLearned(w.key))];
}

/* What the voice says for a kanji on its own: its first word's reading. */
const kanjiSay = ch => (wordsWith(ch)[0] || {}).say || ch;

/* Readings for show: on in katakana, kun with its okurigana in brackets. */
const kunShow = r => r.includes(".") ? r.replace(".", "(") + ")" : r;
function readingsHtml(K) {
  return `<div class="k-read">
    ${K.on.length ? `<div><span class="k-rl">on</span> <span lang="ja">${K.on.map(esc).join("・")}</span></div>` : ""}
    ${K.kun.length ? `<div><span class="k-rl">kun</span> <span lang="ja">${K.kun.map(r => esc(kunShow(r))).join("・")}</span></div>` : ""}
  </div>`;
}

const KANJI_INTRO = {
  eyebrow: "漢字 · Kanji",
  head: "Now the kanji themselves.",
  body: `<p>You've been reading kanji all along, with furigana over them. From here you learn them — each one through
    words you already know. Learn 食 and たべる stops needing its little kana: it's just 食べる.</p>
    <p>Most kanji have two kinds of reading: an <b>on</b> reading, from Chinese (shown in katakana — ショク), and a
    <b>kun</b> reading, native Japanese (in hiragana — た(べる)). Which one a word uses you learn with the word, so
    the drill that matters is reading a kanji <i>inside</i> a word.</p>
    <p class="muted">Writing kanji is off by default. Turn it on in Settings when you want it.</p>`,
};

function kanjiLessonCards(L) {
  const cards = [];
  if (L.id === WORD_LESSONS.find(x => x.kind === "kanji").id) cards.push(infoCard(KANJI_INTRO));
  L.items.forEach((key, i) => {
    cards.push({ t: "kintro", k: key, L, n: i + 1 });
    cards.push(() => qWrite(key, "learn", true));   /* null unless kanji writing is on */
  });
  const drill = [];
  L.items.forEach(key => {
    drill.push(() => qKanjiMean(key, "learn"));
    drill.push(() => qKanjiRead(key, "learn"));
  });
  return [...cards, ...shuffle(drill)];
}

function kanjiIntroHtml(c) {
  const K = KANJI_BY[c.k.slice(2)];
  const ws = wordsWith(K.k, true).slice(0, 5);
  return `<div class="intro kanji-intro">
    <div class="eyebrow">${esc(c.L.title)} · ${c.n} of ${c.L.items.length}</div>
    <div class="kanji-top">
      <button class="glyph-xl kanji" lang="ja" data-act="say" data-say="${esc(kanjiSay(K.k))}">${esc(K.k)}</button>
      ${canWrite(K.k) ? `<button class="k-strokes" data-act="kd-strokes" data-k="${esc(K.k)}" title="Show the strokes"><div id="kdStrokes">${modelSvg(K.k)}</div><small>${K.sc} stroke${K.sc > 1 ? "s" : ""}</small></button>` : ""}
    </div>
    <div class="word-m">${esc(K.m)}</div>
    ${readingsHtml(K)}
    ${ws.length ? `<div class="eyebrow">In words you know</div>
      ${ws.map(w => `<button class="ex-sent" data-act="say" data-say="${esc(w.say)}"><span lang="ja">${furiHtml(w.w, () => false, "always")}</span><small>${esc(w.m)}</small></button>`).join("")}` : ""}
  </div>`;
}

/* What does it mean? */
function qKanjiMean(key, mode) {
  const K = KANJI_BY[key.slice(2)];
  const others = shuffle(KANJI.filter(e => e !== K && e.m !== K.m))
    .sort((a, b) => isLearned(b.key) - isLearned(a.key)).slice(0, 3);
  const opts = shuffle([K, ...others]);
  return { t: "q", kind: "m", kk: true, k: key, mode, opts: opts.map(e => ({ label: e.m, val: e.k })), answer: K.k, sound: kanjiSay(K.k) };
}

/* Read it in a word: a word you know, with this kanji's part of it bare
   and highlighted — "how is 高 read here?" → たか. It's the kanji inside
   the word that's asked, so a set phrase works as well as a word, and the
   wrong answers can be the kanji's own other readings (こう for 高), which
   is exactly the confusion worth practising. Then the readings of other
   words' kanji, about the same length, sharing the most kana. */
const kataToHira = s => s.replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));

function qKanjiRead(key, mode) {
  const ch = key.slice(2);
  const K = KANJI_BY[ch];
  const ws = wordsWith(ch, true);
  if (!ws.length) return null;
  const words = ws.filter(x => x.pos !== "exp");
  const w = sample(words.length ? words : ws, 1)[0];
  const run = furiParse(w.w).find(x => x.k !== undefined && x.k.includes(ch));
  if (!run) return null;
  const answer = run.r;
  const cands = [];
  if (run.k.length === 1) {
    K.on.forEach(r => cands.push(kataToHira(r)));
    K.kun.forEach(r => cands.push(r.split(".")[0]));
  }
  const len = [...answer].length;
  const shared = x => [...new Set(x)].filter(c => answer.includes(c)).length;
  const runs = shuffle(WORDS.flatMap(x => furiParse(x.w).filter(y => y.k !== undefined).map(y => y.r)))
    .filter(r => Math.abs([...r].length - len) <= 1)
    .sort((a, b) => shared(b) - shared(a));
  const seen = new Set([answer]), picks = [];
  for (const r of [...cands, ...runs]) { if (picks.length >= 3) break; if (!r || seen.has(r)) continue; seen.add(r); picks.push(r); }
  const opts = shuffle([answer, ...picks]);
  return { t: "q", kind: "y", kk: true, k: key, mode, word: w, run: run.k,
    opts: opts.map(x => ({ label: x, val: x, jp: true })), answer, sound: w.say };
}

/* The word with the target kanji's run bare and everything else as usual. */
function bareRun(w, ch) {
  return furiParse(w.w).map(x => x.t !== undefined ? esc(x.t)
    : x.k.includes(ch) ? `<span class="k-target">${esc(x.k)}</span>`
    : furiHtml(`{${x.k}|${x.r}}`, knowsKanji, state.settings.furigana)).join("");
}

function kanjiPrompt(c) {
  const ch = c.k.slice(2);
  if (c.kind === "m") return `<div class="q-ask">What does this kanji mean?</div><div class="glyph-l kanji" lang="ja">${esc(ch)}</div>`;
  return `<div class="q-ask">How is <b lang="ja">${esc(c.run)}</b> read here?</div><div class="glyph-l word" lang="ja">${bareRun(c.word, ch)}</div>
    <div class="muted small">${esc(c.word.m)}</div>`;
}

function kanjiVerdict(c) {
  const K = KANJI_BY[c.k.slice(2)];
  if (c.kind === "y") return `<span lang="ja">${furiHtml(c.word.w, () => false, "always")}</span> <span class="rom-always">${esc(c.word.r)}</span> · ${esc(c.word.m)}`;
  return `<span lang="ja">${esc(K.k)}</span> · ${esc(K.m)}`;
}

/* ---------- the chart: a third tab on the Kana page ---------- */

function kanjiChartHtml() {
  const got = learnedKanji().length;
  const cell = K => {
    const on = isLearned(K.key);
    const d = on ? Math.min(solidness(K.key, "m"), solidness(K.key, "y")) : 0;
    return `<button class="kc ${on ? "got" : "not"}" data-act="kanji-cell" data-k="${esc(K.k)}" lang="ja" aria-label="${esc(K.k)}">
      <span class="kg kanji">${esc(K.k)}</span>${on ? `<span class="kr">${esc(K.m.split(";")[0])}</span><i class="dots d${d}"></i>` : ""}</button>`;
  };
  return `
    <p class="muted small">${got} of ${KANJI.length} learned. Each opens once you know a word that uses it — they come in lessons after each stage's words.</p>
    ${WORD_STAGES.filter(S => KANJI.some(K => K.st === S.st)).map(S => `<section class="card chart-sec">
      <div class="card-head"><h2><span lang="ja">${esc(S.jp)}</span> Stage ${S.st}</h2><span class="count">${esc(S.en)}</span></div>
      <div class="kgrid c6">${KANJI.filter(K => K.st === S.st).map(cell).join("")}</div>
    </section>`).join("")}`;
}

function openKanji(ch) {
  const K = KANJI_BY[ch];
  if (!K) return;
  say(kanjiSay(ch));
  const on = isLearned(K.key);
  const ws = wordsWith(ch).slice(0, 8);
  const sk = s => { const v = skill(K.key, s); return `${Math.min(3, s === "w" ? v.ok : v.fast)}/3 · ${v.ok} of ${v.n} right`; };
  openSheet(`<div class="kana-detail">
    <div class="glyph-xl static kanji" lang="ja">${esc(ch)}</div>
    <div class="word-m">${esc(K.m)}</div>
    ${readingsHtml(K)}
    ${canWrite(ch) ? `<div class="kd-strokes"><div id="kdStrokes">${modelSvg(ch)}</div>
      <button class="btn btn-ghost btn-sm" data-act="kd-strokes" data-k="${esc(ch)}">Show the strokes · ${K.sc}</button></div>` : ""}
    <p class="muted small">JLPT N${K.n} · stage ${K.st}${on ? ` · learned ${esc(item(K.key).at)} · next review ${esc(item(K.key).due)}` : " · not learned yet"}</p>
    ${on ? `<div class="sk-rows"><div><span lang="ja">意味</span> ${sk("m")}</div><div><span lang="ja">読み</span> ${sk("y")}</div>${state.settings.writeKanji ? `<div><span lang="ja">書く</span> ${sk("w")}</div>` : ""}</div>` : ""}
    ${ws.length ? `<div class="eyebrow">Words with it</div><div class="ex-row">${ws.map(w => `
      <button class="ex ${isLearned(w.key) ? "" : "dim"}" data-act="say" data-say="${esc(w.say)}"><span lang="ja">${furiHtml(w.w, () => false, "always")}</span><small>${esc(isLearned(w.key) ? w.m : "not yet")}</small></button>`).join("")}</div>` : ""}
  </div>`);
}

Object.assign(ACTS, {
  "kanji-cell": el => openKanji(el.dataset.k),
});
