/* Nihongo Quest — grammar patterns: the lesson card, the two drills, and
   the patterns section of the Words tab.

   Skills: f — fill the gap (the particle, or the form, a sentence is
   missing); r — understand it (pick what a sentence means). */

const learnedPatterns = () => PATTERNS.filter(p => isLearned(p.key));
const hasGaps = p => p.ex.some(e => e.gap);

function patternLessonCards(L) {
  const cards = [];
  if (L.id === WORD_LESSONS.find(x => x.kind === "patterns").id) cards.push(infoCard(PATTERNS_INTRO));
  L.items.forEach((key, i) => cards.push({ t: "gintro", k: key, L, n: i + 1 }));
  const drill = [];
  L.items.forEach(key => {
    if (hasGaps(PATTERN_BY[key])) drill.push(() => qPatFill(key, "learn"));
    drill.push(() => qPatMean(key, "learn"));
  });
  return [...cards, ...shuffle(drill)];
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
  if (c.kind === "f") return `<div class="q-ask">Fill the gap:</div>
    <div class="pat-sent" lang="ja">${gapHtml(c.ex)}</div><div class="muted pat-en">${esc(c.ex.en)}</div>`;
  return `<div class="q-ask">What does this mean?</div><div class="pat-sent" lang="ja">${wordHtml(c.ex.jp)}</div>`;
}

function patVerdict(c) {
  return `<span lang="ja">${c.ex.gap ? gapHtml(c.ex, c.ex.gap) : wordHtml(c.ex.jp)}</span> · ${esc(c.ex.en)}`;
}
