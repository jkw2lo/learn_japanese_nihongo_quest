/* Nihongo Quest — grammar patterns: the lesson card, the two drills, and
   the patterns section of the Words tab.

   Skills: f — fill the gap (the particle, or the form, a sentence is
   missing); r — understand it (pick what a sentence means). */

const learnedPatterns = () => PATTERNS.filter(p => isLearned(p.key));
const hasGaps = p => p.ex.some(e => e.gap);

/* A pattern with teaching (PATTERN_TEACH) is walked through: the
   conversation it lives in, one sentence cut into its parts, the mix-up
   it's mistaken for, then its examples — and drilled by building
   sentences from tiles and changing one sentence into another, as well as
   filling the gap and saying what it means. One without is the single card
   it always was. */
function patternLessonCards(L) {
  const cards = [];
  if (L.id === WORD_LESSONS.find(x => x.kind === "patterns").id) cards.push(infoCard(PATTERNS_INTRO));
  L.items.forEach((key, i) => {
    const t = PATTERN_BY[key].teach;
    if (t) {
      cards.push({ t: "gteach", step: "talk", k: key, L, n: i + 1 });
      cards.push({ t: "gteach", step: "built", k: key, L, n: i + 1 });
      if (t.vs) cards.push({ t: "gteach", step: "vs", k: key, L, n: i + 1 });
    }
    cards.push({ t: "gintro", k: key, L, n: i + 1 });
  });
  const drill = [];
  L.items.forEach(key => {
    const t = PATTERN_BY[key].teach;
    (t?.tiles || []).forEach((_, j) => drill.push(() => qPatBuild(key, "learn", j)));
    (t?.change || []).forEach((_, j) => drill.push(() => qPatChange(key, "learn", j)));
    if (hasGaps(PATTERN_BY[key])) drill.push(() => qPatFill(key, "learn"));
    drill.push(() => qPatMean(key, "learn"));
  });
  return [...cards, ...shuffle(drill)];
}

/* ---------- teaching cards ---------- */

const builtSentence = t => t.built.parts.map(x => x[0]).join("") + "。";

/* What a teaching card says when it's played */
function teachSound(c) {
  const t = PATTERN_BY[c.k].teach;
  if (c.step === "talk") return furiKana(t.talk[0][1]);
  if (c.step === "built") return furiKana(builtSentence(t));
  return furiKana(t.vs.a[0]);
}

function patTeachHtml(c) {
  const p = PATTERN_BY[c.k], t = p.teach;
  const head = `<div class="eyebrow"><span lang="ja">${esc(c.L.title)}</span> · ${c.n} of ${c.L.items.length} ·
    ${c.step === "talk" ? "Hear it used" : c.step === "built" ? "How it's built" : "Don't mix it up"}</div>
    <div class="pat-big small" lang="ja">${wordHtml(p.pat)}</div><div class="word-m">${esc(p.m)}</div>`;
  const line = (jp, en, cls = "") => `<button class="ex-sent ${cls}" data-act="say" data-say="${esc(furiKana(jp))}"><span lang="ja">${wordHtml(jp)}</span><small>${esc(en)}</small></button>`;
  if (c.step === "talk") return `<div class="intro pat-intro tc-talk">${head}
    <div class="tc-lines">${t.talk.map(([who, jp, en]) => `<div class="tc-line ${who === "A" ? "a" : "b"}"><span class="tc-who">${esc(who)}</span>${line(jp, en)}</div>`).join("")}</div>
    <p class="muted small">Tap a line to hear it again.</p></div>`;
  if (c.step === "built") return `<div class="intro pat-intro tc-built">${head}
    <div class="g-chunks tc-parts" lang="ja">${t.built.parts.map(([jp, job], i) => `<button class="g-chunk ${t.built.hl.includes(i) ? "hl" : ""}" data-act="say" data-say="${esc(furiKana(jp))}">
      <span class="g-jp">${wordHtml(jp)}</span><span class="g-role">${esc(job)}</span></button>`).join("")}</div>
    <p class="g-en">${esc(t.built.en)}</p>
    <p class="rule">${richHtml(t.rule)}</p></div>`;
  return `<div class="intro pat-intro tc-vs">${head}
    <div class="tc-pair">${line(t.vs.a[0], t.vs.a[1])}${line(t.vs.b[0], t.vs.b[1])}</div>
    <p class="rule">${richHtml(t.vs.why)}</p></div>`;
}

/* ---------- build it: tiles into a sentence ---------- */

function qPatBuild(key, mode, j) {
  const t = PATTERN_BY[key].teach;
  const item = t?.tiles?.[j ?? Math.floor(Math.random() * (t?.tiles?.length || 0))];
  if (!item) return null;
  const [answer, en, decoys = []] = item;
  const tiles = shuffle([...answer, ...decoys].map((jp, i) => ({ jp, i })));
  return { t: "q", kind: "o", sk: "f", gk: true, k: key, mode, en, answer, tiles, sound: furiKana(answer.join("")) };
}

function showBuild(c) {
  S.bd = [];
  $("#sBody").innerHTML = `<div class="q q-o">
    <div class="q-ask">Put it together:</div>
    <div class="type-m">${esc(c.en)}</div>
    <div class="bd-line" id="bdLine" lang="ja"><span class="bd-hint muted small">tap the pieces in order</span></div>
    <div class="bd-tray" id="bdTray" lang="ja">${c.tiles.map((x, i) => `<button class="bd-tile" data-act="bd-tile" data-i="${i}">${wordHtml(x.jp)}</button>`).join("")}</div>
    <div class="verdict" id="verdict" aria-live="polite"></div>
  </div>`;
  $("#sFoot").innerHTML = `<button class="btn btn-ghost" data-act="bd-back">Take one back <kbd>⌫</kbd></button>
    <button class="btn" data-act="bd-check" id="nextBtn" disabled>Check <kbd>↵</kbd></button>`;
  S.t0 = performance.now();
  startTimer(quickMs(c));
}

function buildPaint() {
  const c = S.card;
  $("#bdLine").innerHTML = S.bd.length ? S.bd.map(i => `<button class="bd-tile in" data-act="bd-out" data-i="${i}">${wordHtml(c.tiles[i].jp)}</button>`).join("")
    : `<span class="bd-hint muted small">tap the pieces in order</span>`;
  $$("#bdTray .bd-tile").forEach(b => b.classList.toggle("used", S.bd.includes(+b.dataset.i)));
  $("#nextBtn").disabled = S.bd.length !== c.answer.length;
}

function buildTap(i, out = false) {
  const c = S?.card;
  if (!c || c.kind !== "o" || S.answered) return;
  if (out) S.bd = S.bd.filter(x => x !== i);
  else if (!S.bd.includes(i) && S.bd.length < c.answer.length) S.bd.push(i);
  buildPaint();
}

function buildCheck() {
  const c = S?.card;
  if (!c || c.kind !== "o" || S.answered || S.bd.length !== c.answer.length) return;
  /* the same piece twice (two は) is interchangeable, so compare the words */
  const ok = S.bd.map(i => c.tiles[i].jp).join("|") === c.answer.join("|");
  settle(c, ok, performance.now() - S.t0);
  $$(".bd-tile").forEach(b => { b.disabled = true; });
  $("#bdLine").classList.add(ok ? "ok" : "miss");
  const v = $("#verdict");
  v.className = "verdict " + (ok ? "ok" : "miss");
  v.innerHTML = `${ok ? icon("check", "v-ico") + " " : "It's "}<span lang="ja">${wordHtml(c.answer.join(""), "always")}</span>`;
  if (state.settings.autoplay) say(c.sound);
  afterAnswer(ok);
}

/* ---------- change it: one sentence into another ---------- */

function qPatChange(key, mode, j) {
  const t = PATTERN_BY[key].teach;
  const x = t?.change?.[j ?? Math.floor(Math.random() * (t?.change?.length || 0))];
  if (!x) return null;
  const opts = shuffle([x.to, ...x.wrong]);
  return { t: "q", kind: "t", sk: "f", gk: true, k: key, mode, from: x.from, do: x.do, answer: x.to,
    opts: opts.map(o => ({ label: o, val: o, jp: true, furi: true })), sound: furiKana(x.to) };
}

const PATTERNS_INTRO = {
  eyebrow: "文型 · Patterns",
  head: "The shapes sentences come in.",
  body: `<p>You've been using these already — 私は学生です, コーヒーをください. Now each gets a card:
    what it means, how it's built, and sentences made only from words you know.</p>
    <p>The little words between the nouns — は, を, に, で — are <b>particles</b>. They say what each word is doing in the
    sentence, and they're where most beginner mistakes live, so the main drill is filling one in.</p>`,
};

/* A sentence with its gap shown as a box, or filled and highlighted. */
function gapHtml(e, show = null) {
  const [before, after] = e.gapped.split(/«[^»]+»/);
  const mid = show === null ? `<span class="gap">　</span>` : `<span class="gap filled">${esc(show)}</span>`;
  return `${wordHtml(before)}${mid}${wordHtml(after || "")}`;
}

function patIntroHtml(c) {
  const p = PATTERN_BY[c.k];
  return `<div class="intro pat-intro">
    <div class="eyebrow"><span lang="ja">${esc(c.L.title)}</span> · ${c.n} of ${c.L.items.length}</div>
    <div class="pat-big" lang="ja">${wordHtml(p.pat)}</div>
    <div class="word-m">${esc(p.m)}</div>
    <p class="rule">${wordHtml(p.note)}</p>
    ${p.ex.map(e => `<button class="ex-sent" data-act="say" data-say="${esc(e.kana)}">
      <span lang="ja">${e.gap ? gapHtml(e, e.gap) : wordHtml(e.jp)}</span><small>${esc(e.en)}</small></button>`).join("")}
  </div>`;
}

/* Fill the gap: the sentence with its particle (or form) missing. */
function qPatFill(key, mode) {
  const p = PATTERN_BY[key];
  const withGap = p.ex.filter(e => e.gap);
  if (!withGap.length) return null;
  const e = sample(withGap, 1)[0];
  let pool;
  if (e.alts || p.alts) pool = (e.alts || p.alts).filter(a => a !== e.gap);
  else {
    const near = (PARTICLE_CONFUSIONS[e.gap] || []).filter(x => x !== e.gap);
    pool = [...near, ...shuffle(PARTICLES.filter(x => x !== e.gap && !near.includes(x)))];
  }
  const opts = shuffle([e.gap, ...pool.slice(0, 3)]);
  return { t: "q", kind: "f", gk: true, k: key, mode, ex: e,
    opts: opts.map(x => ({ label: x, val: x, jp: true })), answer: e.gap, sound: e.kana };
}

/* Understand it: what does this sentence mean? Wrong answers are other
   patterns' sentences the learner could also read. */
function qPatMean(key, mode) {
  const p = PATTERN_BY[key];
  const e = sample(p.ex, 1)[0];
  const others = shuffle(PATTERNS.filter(q => q !== p && (isLearned(q.key) || q.st <= p.st)).flatMap(q => q.ex))
    .filter((x, i, a) => x.en !== e.en && a.findIndex(y => y.en === x.en) === i).slice(0, 3);
  const opts = shuffle([e, ...others]);
  return { t: "q", kind: "r", gk: true, k: key, mode, ex: e,
    opts: opts.map(x => ({ label: x.en, val: x.en })), answer: e.en, sound: e.kana };
}

function patPrompt(c) {
  if (c.kind === "t") return `<div class="q-ask">${esc(c.do)}:</div>
    <div class="pat-sent" lang="ja">${wordHtml(c.from)}</div>`;
  if (c.kind === "f") return `<div class="q-ask">Fill the gap:</div>
    <div class="pat-sent" lang="ja">${gapHtml(c.ex)}</div><div class="muted pat-en">${esc(c.ex.en)}</div>`;
  return `<div class="q-ask">What does this mean?</div><div class="pat-sent" lang="ja">${wordHtml(c.ex.jp)}</div>`;
}

function patVerdict(c) {
  if (c.kind === "t") return `<span lang="ja">${wordHtml(c.answer)}</span>`;
  return `<span lang="ja">${c.ex.gap ? gapHtml(c.ex, c.ex.gap) : wordHtml(c.ex.jp)}</span> · ${esc(c.ex.en)}`;
}

Object.assign(ACTS, {
  "bd-tile": el => buildTap(+el.dataset.i),
  "bd-out": el => buildTap(+el.dataset.i, true),
  "bd-back": () => { if (S?.bd?.length && !S.answered) { S.bd.pop(); buildPaint(); } },
  "bd-check": () => buildCheck(),
});
