/* Nihongo Quest — views, sessions, settings.

   Everything clickable carries data-act, and one listener dispatches it
   through guard(), so a handler that throws shows the crash panel and leaves
   a trail in NQDIAG instead of freezing the page silently. */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, n) => shuffle([...a]).slice(0, n);
const crumb = t => window.NQDIAG && NQDIAG.note("ui", t);

const AUTO_ADVANCE_MS = 1100;
const SET_NAME = { h: "hiragana", k: "katakana" };

let view = "today";
let deeperSet = "words";     /* Go deeper shows words or kana, once there are words */
let chartSet = "h";

/* ============================================================
   Small pieces
   ============================================================ */

function ring(pct, size = 44, stroke = 5) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, pct)));
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-bg" stroke-width="${stroke}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fg" stroke-width="${stroke}"
      stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>
  </svg>`;
}

/* Solid / two / one / none, as one bar. */
function spread(st) {
  if (!st.total) return `<div class="spread empty"></div>`;
  const seg = (n, cls) => n ? `<i class="${cls}" style="flex:${n}"></i>` : "";
  return `<div class="spread" title="${st.buckets[3]} solid · ${st.buckets[2]} at two · ${st.buckets[1]} at one · ${st.buckets[0]} not yet">
    ${seg(st.buckets[3], "s3")}${seg(st.buckets[2], "s2")}${seg(st.buckets[1], "s1")}${seg(st.buckets[0], "s0")}</div>`;
}

const romaji = t => state.settings.showRomaji ? `<span class="rom">${esc(t)}</span>` : "";

function toast(msg, ms = 2600) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("on");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove("on"), ms);
}

function renderSoundBar() {
  $("#soundBar").classList.toggle("on", soundBlocked);
}

/* ============================================================
   Navigation
   ============================================================ */

function go(v) {
  view = v;
  crumb("view " + v);
  $$("[data-nav]").forEach(b => b.classList.toggle("on", b.dataset.nav === v));
  $$(".view").forEach(s => s.classList.toggle("on", s.id === "v-" + v));
  render();
  scrollTo(0, 0);
}

function render() {
  if (view === "today") renderToday();
  else if (view === "kana") renderKana();
  else if (view === "words") renderWords();
  else if (view === "menu") renderMenu();
  else if (view === "grammar") renderGrammar();
  else if (view === "cards") renderCards();
  else if (view === "sprint") renderSprint();
  else if (view === "record") renderRecord();
  renderSaveDot();
  loadAudioN5();
  if (typeof phoneAfterRender === "function") phoneAfterRender();
}

/* ============================================================
   Today
   ============================================================ */

function todaysGlyphs() {
  return (state.days[today()]?.learned || []).filter(k => KANA_BY[k]);
}

/* The look-alikes of k that are also learned. */
function alikeOf(k) {
  const out = new Set();
  KANA_ALIKE.forEach(g => { if (g.includes(k)) g.forEach(x => { if (x !== k && isLearned(x)) out.add(x); }); });
  return [...out];
}

/* Today's practice: each task scoped to today's kana, ticked on evidence —
   every one of them answered correctly in that drill kind today. */
/* Two lesson names and a count, not a list that runs down the tile. */
const lessonNames = ls => ls.slice(0, 2).map(L => L.title).join(" · ") + (ls.length > 2 ? ` +${ls.length - 2} more` : "");

const todaysWords = () => (state.days[today()]?.learned || []).filter(isWordKey);
const todaysPatterns = () => (state.days[today()]?.learned || []).filter(isPatternKey);
const todaysKanji = () => (state.days[today()]?.learned || []).filter(isKanjiKey);
/* A day of words rather than kana: words were learned today, or it's the
   words stage and no kana were. */
const wordDay = () => todaysWords().length > 0 || todaysPatterns().length > 0 || todaysKanji().length > 0 || (phase() === "words" || phase() === "done") && !todaysGlyphs().length;

function wordTasks() {
  const ks = todaysWords();
  const gs = todaysPatterns();
  const js = todaysKanji();
  const planned = nextLessons();
  const learnedAny = ks.length > 0 || gs.length > 0 || js.length > 0;
  const tasks = [{
    kind: "learn", jp: "学ぶ", en: "Learn today's words",
    sub: lessonNames(planned.length ? planned : lessonsLearnedToday()),
    done: learnedAny && !planned.length,
    locked: !learnedAny && !planned.length ? "Nothing new to learn today" : null,
  }];
  const drill = (kind, jp, en, keys) => {
    const sk = kind === "gr" ? "r" : /^k[myw]$/.test(kind) ? kind[1] : kind;
    const n = keys.filter(k => dayOkList(sk).includes(k)).length;
    tasks.push({ kind, jp, en, keys, sub: keys.length ? `${n} of ${keys.length}` : "",
      done: keys.length > 0 && n === keys.length, locked: !learnedAny ? "Learn today's words first" : null });
  };
  /* a day whose lesson is patterns gets the pattern tasks, before and after it's learned */
  const patDay = gs.length > 0 || planned.some(L => L.kind === "patterns");
  const kanjiDay = js.length > 0 || planned.some(L => L.kind === "kanji");
  if (ks.length || (!patDay && !kanjiDay)) {
    drill("r", "読む", "Read them", ks);
    if (hasAudio()) drill("p", "聞く", "Hear them", ks.filter(k => clipFor(WORD_BY[k].say)));
    drill("c", "打つ", "Type them in kana", ks);
    const verbs = ks.filter(k => isConjugable(WORD_BY[k].pos));
    if (verbs.length) drill("j", "活用", "Conjugate the verbs", verbs);
  }
  if (patDay) {
    const gapped = gs.filter(k => hasGaps(PATTERN_BY[k]));
    if (gapped.length || !gs.length) drill("f", "文型", "Fill the gaps", gapped);
    drill("gr", "文", "Understand them", gs);
  }
  if (kanjiDay) {
    drill("km", "意味", "What they mean", js);
    drill("ky", "読み", "Read them in words", js);
    if (state.settings.writing && state.settings.writeKanji) drill("kw", "書く", "Write them", js.filter(k => canWrite(k.slice(2))));
  }
  return tasks;
}

function todayTasks() {
  if (wordDay()) return wordTasks();
  const ks = todaysGlyphs();
  const plain = ks.filter(k => !KANA_BY[k].concept);
  const concepts = ks.filter(k => KANA_BY[k].concept);
  const planned = nextLessons();
  const tasks = [];
  const learnedAny = ks.length > 0;
  tasks.push({
    kind: "learn", jp: "学ぶ", en: "Learn today's kana",
    sub: lessonNames(planned.length ? planned : lessonsLearnedToday()),
    done: learnedAny && !planned.length,
    locked: !learnedAny && !planned.length ? "Nothing new to learn today" : null,
  });
  const drill = (kind, jp, en, keys, why) => {
    const okList = dayOkList(kind);
    const n = keys.filter(k => okList.includes(k)).length;
    tasks.push({
      kind, jp, en, keys, sub: keys.length ? `${n} of ${keys.length}` : "",
      done: keys.length > 0 && n === keys.length,
      locked: !learnedAny ? "Learn today's kana first" : !keys.length ? why : null,
    });
  };
  drill("r", "読む", "Read them", plain, "No new sounds today");
  if (hasAudio()) drill("p", "聞く", "Hear them", plain, "No new sounds today");
  if (state.settings.writing) drill("w", "書く", "Write from memory", plain.filter(canWrite), "Nothing today has a shape to write");
  drill("a", "似てる", "Spot the look-alikes", plain.filter(k => alikeOf(k).length), "None of today's kana has a look-alike you know yet");
  if (concepts.length) drill("x", "っ", "Hear the pause", concepts, "");
  return tasks;
}

function renderToday() {
  const p = phase();
  const due = dueKeys();
  const planned = nextLessons();
  const el = $("#v-today");
  const first = !Object.keys(state.items).length;

  let hero = "";
  if (first) {
    hero = `<section class="card hero hero-first">
      <div class="hero-art">${neko("happy", "bob")}<div class="hero-seal" aria-hidden="true">あ</div></div>
      <h1>Start with five sounds.</h1>
      <p class="lede">Japanese is written with two alphabets of sounds — hiragana and katakana — plus kanji. Everything
      starts with hiragana, one row at a time. The first row is <b lang="ja">あ い う え お</b>: a, i, u, e, o${planned.length > 1 ? `, and today's second is the <span lang="ja">${esc(planned[1].title)}</span>` : ""}.</p>
      <p class="muted">About ten minutes a day, five new kana at a time. Hiragana takes about three weeks; then a check on
      two separate days to make sure it stuck; then katakana. First, a two-minute tour of how Japanese is written.</p>
      <button class="btn btn-lg cta" data-act="start-today">Start learning <kbd>↵</kbd></button>
    </section>`;
  } else if (p === "check") {
    hero = heroCheck(due);
  } else {
    const bits = [];
    if (due.length) bits.push(`${due.length} to review`);
    planned.forEach(L => bits.push(L.title));
    const ahead = aheadLesson();
    if (bits.length) {
      hero = `<section class="card hero">
        <div class="hero-row">
          <div>
            <div class="eyebrow">今日 · Today</div>
            <h1>${p === "done" ? "Keep it fresh." : planned.length ? `Today: <span lang="ja">${esc(planned.map(L => L.title).join(" · "))}</span>` : "Reviews are waiting."}</h1>
            <p class="lede">${esc(bits.join(" · "))}</p>
          </div>
          ${heroRing()}
        </div>
        <button class="btn btn-lg cta" data-act="start-today">Start today's session <kbd>↵</kbd></button>
      </section>`;
    } else {
      hero = `<section class="card hero done">
        <div class="hero-row">
          ${neko(p === "done" ? "cheer" : "sleepy", "bob hero-neko")}
          <div class="hero-text">
            <div class="eyebrow">今日 · Today</div>
            <h1>${p === "done" ? "Every word so far is yours." : "Done for today."}</h1>
            <p class="lede">${p === "done"
              ? `All the kana and every word in stages 2 to ${WORD_STAGES[WORD_STAGES.length - 1].st}. The next stages aren't built yet — keep reviews ticking over, and take an order at the café.`
              : "Nothing due and today's lessons are learned. Practise below, or run a sprint."}</p>
          </div>
          ${heroRing()}
        </div>
        ${ahead ? `<button class="btn btn-ghost" data-act="start-ahead">Learn the next one anyway: <span lang="ja">${esc(ahead.title)}</span></button>` : ""}
      </section>`;
    }
  }

  const tasks = first ? [] : todayTasks();
  const shown = tasks.filter(t => t.kind !== "learn" || !t.locked);
  const countable = shown.filter(t => !t.locked);
  const locked = shown.length - countable.length;
  const doneN = countable.filter(t => t.done).length;
  const taskHtml = first || p === "check" || !todaysGlyphs().length && !todaysWords().length && !planned.length ? "" : `
    <section class="card">
      <div class="card-head"><h2>Today's practice</h2>
        <span class="count">${doneN} of ${countable.length} done${locked ? ` · ${locked} locked` : ""}</span></div>
      <ul class="tasks grid">${shown.map(t => `
        <li><button class="task ${t.done ? "done" : ""} ${t.locked ? "locked" : ""}" ${t.locked ? "disabled" : ""}
             data-act="${t.kind === "learn" ? "start-today" : "task"}" data-kind="${t.kind}">
          <span class="tick">${t.done ? icon("check") : t.locked ? icon("lock") : ""}</span>
          <span class="task-jp" lang="ja">${t.jp}</span>
          <span class="task-en">${esc(t.en)}<small>${esc(t.locked || t.sub)}</small></span>
        </button></li>`).join("")}
      </ul>
    </section>`;

  el.innerHTML = `<div class="today-grid">
    <div class="col-main">
      ${hero}
      ${taskHtml}
      ${first ? "" : deeperHtml()}
      ${first ? "" : menuCardHtml()}
    </div>
    <aside class="col-rail">${first ? "" : kanaProgressHtml()}${first ? "" : wordsDeckHtml()}</aside>
  </div>`;
}

function heroRing() {
  if (wordsOpen()) {
    const n = learnedWords().length;
    return `<div class="hero-ring" title="${n} of ${WORDS.length} words learned">${ring(n / WORDS.length, 64, 6)}
      <span>${n}<small>/${WORDS.length}</small></span></div>`;
  }
  const all = Object.keys(state.items);
  const pct = all.length / KANA.length;
  return `<div class="hero-ring" title="${all.length} of ${KANA.length} kana learned">${ring(pct, 64, 6)}
    <span>${all.length}<small>/${KANA.length}</small></span></div>`;
}

function heroCheck(due) {
  /* The check's days are counted after the last hiragana was learned, so on
     that day itself there's nothing to take — say so, rather than offer a
     check that couldn't count. */
  if (hiraDoneDay() === today()) {
    return `<section class="card hero done">
      <div class="eyebrow">ひらがな · All learned</div>
      <h1>That's every hiragana.</h1>
      <p class="lede">Before katakana, hiragana has to stick. From tomorrow, on ${HIRA_CHECK.days} separate days, you'll go
        through all of it once and need ${Math.round(HIRA_CHECK.pass * 100)}% right first time.</p>
      <p class="muted">For today: Go deeper on the shakiest ones, or run a hiragana sprint.</p>
    </section>`;
  }
  const days = hiraCheckDays();
  const d = state.days[today()]?.check;
  const passedToday = checkPassedToday();
  const n = days.length + (passedToday ? 0 : 1);
  const tried = d && !d.passed;
  return `<section class="card hero check">
    ${neko(passedToday ? "happy" : "gambaru", "hero-corner")}
    <div class="eyebrow">ひらがな · The hiragana check</div>
    <h1>${passedToday ? `Day ${days.length} of ${HIRA_CHECK.days} — passed.` : `Day ${n} of ${HIRA_CHECK.days}.`}</h1>
    <p class="lede">Every hiragana is learned. Before katakana, hiragana has to stick: on ${HIRA_CHECK.days} separate days,
      go through all of it once — every kana to read, twenty to hear, the pauses and some real words — and get
      ${Math.round(HIRA_CHECK.pass * 100)}% right first time.</p>
    <div class="check-days">${Array.from({ length: HIRA_CHECK.days }, (_, i) =>
      `<span class="${i < days.length ? "on" : ""}">${i < days.length ? icon("check") : i + 1}</span>`).join("")}</div>
    ${passedToday
      ? `<p class="muted">Come back tomorrow for the next one. A day between is the point — it's what shows it stuck.</p>`
      : `${tried ? `<p class="warn">Best today: ${Math.round(d.best * 100)}%. ${Math.round(HIRA_CHECK.pass * 100)}% is needed — have another go whenever you like.</p>` : ""}
         <button class="btn btn-lg cta" data-act="start-check">Start today's check <kbd>↵</kbd></button>`}
    ${due.length ? `<p class="muted small">${due.length} due for review — the check covers them.</p>` : ""}
  </section>`;
}

function deeperHtml() {
  const keys = Object.keys(state.items);
  if (!keys.length) return "";
  const tile = (kind, jp, en, st, extra = "") => `
    <button class="tile" data-act="deeper" data-kind="${kind}" ${st.total ? "" : "disabled"}>
      <div class="tile-top">${ring(st.pct, 44, 5)}<div><span class="tile-jp" lang="ja">${jp}</span><span class="tile-en">${esc(en)}</span></div></div>
      ${spread(st)}
      <small>${st.total ? `${st.solid} of ${st.total} solid` : esc(extra)}</small>
    </button>`;
  const alikeKeys = keys.filter(k => alikeOf(k).length);
  const words = readableWords();
  const wordSt = { total: words.length, solid: 0, buckets: [words.length, 0, 0, 0], pct: 0 };
  const wk = Object.keys(state.words);
  /* Once there are words, one row at a time: words or kana. */
  const showWords = wk.length && deeperSet === "words";
  const toggle = wk.length ? `<div class="seg seg-sm">
      <button class="${showWords ? "on" : ""}" data-act="deeper-set" data-set="words"><span lang="ja">言葉</span> Words</button>
      <button class="${showWords ? "" : "on"}" data-act="deeper-set" data-set="kana"><span lang="ja">かな</span> Kana</button></div>` : `<span class="count">everything you've learned, shakiest first</span>`;
  if (showWords) return `<section class="card">
    <div class="card-head"><h2>Go deeper</h2>${toggle}</div>
    <div class="tiles">
      ${tile("wr", "読む", "Read words", standing(wk, "r"))}
      ${hasAudio() ? tile("wp", "聞く", "Hear words", standing(wk, "p")) : ""}
      ${tile("wc", "打つ", "Type words", standing(wk, "c"))}
      ${wk.some(k => isConjugable(WORD_BY[k].pos)) ? tile("wj", "活用", "Conjugate", standing(wk.filter(k => isConjugable(WORD_BY[k].pos)), "j")) : ""}
      ${Object.keys(state.patterns).length ? tile("g", "文型", "Patterns", standing(Object.keys(state.patterns), "f")) : ""}
      ${Object.keys(state.kanji).length ? tile("kj", "漢字", "Kanji", standing(Object.keys(state.kanji), "y")) : ""}
    </div></section>`;
  return `<section class="card">
    <div class="card-head"><h2>Go deeper</h2>${toggle}</div>
    <div class="tiles">
      ${tile("r", "読む", "Read", standing(keys, "r"))}
      ${hasAudio() ? tile("p", "聞く", "Hear", standing(keys, "p")) : ""}
      ${state.settings.writing ? tile("w", "書く", "Write", standing(keys.filter(canWrite), "w"), "Loading…") : ""}
      ${tile("a", "似てる", "Look-alikes", standing(alikeKeys, "a"), "None yet")}
      <button class="tile" data-act="deeper" data-kind="word" ${words.length >= 4 ? "" : "disabled"}>
        <div class="tile-top"><span class="tile-big" lang="ja">言葉</span><div><span class="tile-en">Real words</span></div></div>
        ${spread(wordSt)}
        <small>${words.length} you can read</small>
      </button>
    </div>
  </section>`;
}

function wordsDeckHtml() {
  const ws = wordsByNewest();
  const learnedW = learnedWords().slice().reverse();
  const items = [
    ...learnedW.map(x => ({ w: x.w, say: x.say, r: x.r, m: x.m, src: "stage", id: x.key })),
    ...ws.map(x => ({ w: x.w, say: x.w, r: x.r, m: x.m, src: "kana", id: x.w })),
  ];
  return `<section class="card deck">
    <div class="card-head"><h2>Words you can read</h2><button class="link" data-act="nav" data-nav="words">All ${libraryEntries().length} ›</button></div>
    ${items.length ? `<div class="wgrid">${items.slice(0, 60).map(x => `
      <div class="wtile"><button class="wt-say" data-act="say" data-say="${esc(x.say)}" title="Hear it">
        <span class="wt-jp" lang="ja">${wordHtml(x.w)}</span>${romaji(x.r)}<span class="wt-en">${esc(x.m)}</span>
      </button><button class="wt-more" data-act="lib-open" data-src="${x.src}" data-w="${esc(x.id)}" aria-label="Details">${icon("chevron")}</button></div>`).join("")}</div>`
    : `<div class="empty">${neko("think", "mini")}<p class="muted small">Real words appear here as soon as you know every kana in one — <span lang="ja">いえ</span> (house) needs just two.</p></div>`}
  </section>`;
}

/* Progress, as a small metric above the words: a thin bar a row. */
function kanaProgressHtml() {
  const row = (label, n, total) => `<div class="prog-row"><span lang="ja">${label}</span>
    <div class="bar"><i style="width:${(n / total * 100).toFixed(1)}%"></i></div><small>${n}/${total}</small></div>`;
  const count = set => KANA.filter(e => e.set === set && isLearned(e.k)).length;
  return `<section class="card prog">
    <div class="prog-head"><span class="eyebrow">Progress</span><button class="link" data-act="nav" data-nav="kana">Chart ›</button></div>
    ${row("ひらがな", count("h"), KANA.filter(e => e.set === "h").length)}
    ${row("カタカナ", count("k"), KANA.filter(e => e.set === "k").length)}
    ${wordsOpen() ? row("言葉", learnedWords().length, WORDS.length) : ""}
    ${phase() === "hira" || phase() === "check" ? `<p class="muted tiny">Katakana opens after the hiragana check.</p>` : ""}
  </section>`;
}

function aheadLesson() {
  const p = phase();
  if (p !== "hira" && p !== "kata" && p !== "words") return null;
  if (nextLessons().length) return null;
  if (p === "words") return WORD_LESSONS.find(L => !lessonLearned(L)) || null;
  return LESSONS.find(L => L.set === (p === "hira" ? "h" : "k") && !lessonLearned(L)) || null;
}

/* ============================================================
   Building questions
   ============================================================ */

/* Other kana to offer as wrong answers: look-alikes first, then the same
   lesson, then anything learned in the same script. Never one that shares
   the answer's romaji or sound — じ and ぢ can't be told apart by ear. */
function distractors(k, n, key) {
  const e = KANA_BY[k];
  const clash = x => x === k || KANA_BY[x].concept || KANA_BY[x][key] === e[key];
  const pools = [
    alikeOf(k),
    LESSONS.find(L => L.id === e.lesson).items,
    learnedKana(e.set).map(x => x.k),
    KANA.filter(x => x.set === e.set).map(x => x.k),
  ];
  const out = [];
  const seen = new Set([e[key]]);
  for (const pool of pools) {
    for (const x of shuffle([...pool])) {
      if (out.length >= n) break;
      if (clash(x) || seen.has(KANA_BY[x][key])) continue;
      seen.add(KANA_BY[x][key]);
      out.push(x);
    }
    /* take at most one look-alike, so the options aren't all traps */
    if (pool === pools[0] && out.length > 1) out.length = 1;
  }
  return out.slice(0, n);
}

function qRead(k, mode) {
  const opts = shuffle([k, ...distractors(k, 3, "r")]);
  return { t: "q", kind: "r", k, mode, opts: opts.map(x => ({ label: KANA_BY[x].r, val: x })), answer: k };
}

function qHear(k, mode) {
  const opts = shuffle([k, ...distractors(k, 3, "say")]);
  return { t: "q", kind: "p", k, mode, opts: opts.map(x => ({ label: x, val: x, jp: true })), answer: k, sound: KANA_BY[k].say };
}

function qAlike(k, mode) {
  const others = alikeOf(k).filter(x => KANA_BY[x].r !== KANA_BY[k].r);
  if (!others.length) return null;
  const opts = shuffle([k, ...sample(others, 3)]);
  return { t: "q", kind: "a", k, mode, opts: opts.map(x => ({ label: x, val: x, jp: true })), answer: k, sound: KANA_BY[k].say };
}

function qPair(c, mode) {
  const p = sample(KANA_PAIRS_WORDS.filter(x => x.c === c), 1)[0];
  if (!p) return null;
  const opts = shuffle([p.w, ...p.alt]);
  return { t: "q", kind: "x", k: c, mode, opts: opts.map(x => ({ label: x, val: x, jp: true })), answer: p.w, sound: p.w, word: p };
}

function qWord(w) {
  const pool = KANA_WORDS.filter(x => x.m !== w.m && x.set === w.set);
  const known = pool.filter(canRead);
  const picks = [];
  const seen = new Set([w.m]);
  for (const x of [...shuffle(known), ...shuffle(pool)]) {
    if (picks.length >= 3) break;
    if (seen.has(x.m)) continue;
    seen.add(x.m); picks.push(x);
  }
  const opts = shuffle([w, ...picks]);
  return { t: "q", kind: "word", k: null, mode: "none", opts: opts.map(x => ({ label: x.m, val: x.w })), answer: w.w, word: w, sound: w.w };
}

/* A writing question. `trace` puts the model faintly in the box — the
   first meeting with a kana — and is practice, not a test. Only single
   glyphs with stroke data: きゃ is two kana you already write. */
function qWrite(k, mode, trace = false) {
  /* k is the item key: a kana glyph, or "k:食" for a kanji; ch is what's drawn */
  const kanji = isKanjiKey(k);
  const ch = kanji ? k.slice(2) : k;
  if (!state.settings.writing || (kanji && !state.settings.writeKanji) || !canWrite(ch)) return null;
  return { t: "q", kind: "w", k, ch, mode, trace, sound: kanji ? kanjiSay(ch) : KANA_BY[k].say };
}

function qFor(k, kind, mode) {
  if (isKanjiKey(k)) return kind === "m" ? qKanjiMean(k, mode) : kind === "y" ? qKanjiRead(k, mode) : kind === "w" ? qWrite(k, mode) : null;
  if (isPatternKey(k)) return kind === "f" ? qPatFill(k, mode) : kind === "r" ? qPatMean(k, mode) : null;
  if (isWordKey(k)) {
    if (kind === "r") return qWordRead(k, mode);
    if (kind === "p") return qWordHear(k, mode);
    if (kind === "c") return qWordType(k, mode);
    if (kind === "j") return qWordConj(k, mode);
    return null;
  }
  if (kind === "w") return qWrite(k, mode);
  if (kind === "r") return qRead(k, mode);
  if (kind === "p") return hasAudio() ? qHear(k, mode) : null;
  if (kind === "a") return qAlike(k, mode);
  if (kind === "x") return qPair(k, mode);
  return null;
}

/* The weaker of reading and hearing, for a review. */
function reviewKind(k) {
  if (isKanjiKey(k)) return solidness(k, "y") <= solidness(k, "m") ? "y" : "m";
  if (isPatternKey(k)) return hasGaps(PATTERN_BY[k]) && solidness(k, "f") <= solidness(k, "r") ? "f" : "r";
  if (isWordKey(k)) {
    const ks = hasAudio() ? ["r", "p", "c"] : ["r", "c"];
    return ks.sort((a, b) => solidness(k, a) - solidness(k, b))[0];
  }
  if (KANA_BY[k].concept) return "x";
  if (!hasAudio()) return "r";
  return solidness(k, "p") < solidness(k, "r") ? "p" : "r";
}

/* ============================================================
   Starting sessions
   ============================================================ */

function lessonCards(L) {
  if (L.kind === "kanji") return kanjiLessonCards(L);
  if (L.kind === "patterns") return patternLessonCards(L);
  if (L.set === "w") return wordLessonCards(L);
  /* the first lesson of a new kind opens with a card saying what's new */
  const cards = KIND_INTRO[L.id] ? [infoCard(KIND_INTRO[L.id])] : [];
  /* meet it, hear it, trace it — then the drill */
  L.items.forEach((k, i) => {
    cards.push({ t: KANA_BY[k].concept ? "concept" : "intro", k, L, n: i + 1 });
    if (!KANA_BY[k].concept) cards.push(() => qWrite(k, "learn", true));
  });
  const drill = [];
  L.items.forEach(k => {
    if (KANA_BY[k].concept) {
      for (let i = 0; i < 3; i++) { const q = qPair(k, "learn"); if (q) drill.push(q); }
    } else {
      drill.push(() => qRead(k, "learn"));
      drill.push(() => qFor(k, "p", "learn"));       /* null, and skipped, without audio */
    }
  });
  return [...cards, ...shuffle(drill)];
}

function startToday() {
  const p = phase();
  if (p === "check") return startCheck();
  const due = dueKeys().slice(0, 60);
  const lessons = nextLessons();
  const queue = [];
  shuffle(due).forEach(k => queue.push(() => qFor(k, reviewKind(k), "review")));
  lessons.forEach(L => queue.push(...lessonCards(L)));
  /* someone brand new sees what they're about to learn, and why it looks the way it does */
  if (!state.seenGuide && !Object.keys(state.items).length) queue.unshift(...guideCards());
  if (!queue.length) { toast("Nothing due — try Go deeper, or a sprint."); return; }
  openSession({
    kind: "today", title: lessons.length ? lessons.map(L => L.title).join(" · ") : "Review",
    queue, lessons,
  });
}

function startAhead() {
  const L = aheadLesson();
  if (!L) return;
  openSession({ kind: "today", title: L.title, queue: lessonCards(L), lessons: [L] });
}

function startTask(kind) {
  if (/^k[myw]$/.test(kind)) {
    const keys = todaysKanji().filter(k => kind !== "kw" || canWrite(k.slice(2)));
    openSession({ kind: "practice", title: { km: "意味 · Meanings", ky: "読み · Readings", kw: "書く · Write" }[kind], queue: shuffle(keys).map(k => () => qFor(k, kind[1], "practice")) });
    return;
  }
  if (wordDay() && (kind === "f" || kind === "gr")) {
    const keys = todaysPatterns().filter(k => kind !== "f" || hasGaps(PATTERN_BY[k]));
    openSession({ kind: "practice", title: kind === "f" ? "文型 · Fill the gaps" : "文 · Understand", queue: shuffle(keys).map(k => () => qFor(k, kind === "gr" ? "r" : "f", "practice")) });
    return;
  }
  if (wordDay()) {
    const keys = todaysWords().filter(k => (kind !== "p" || clipFor(WORD_BY[k].say)) && (kind !== "j" || isConjugable(WORD_BY[k].pos)));
    openSession({ kind: "practice", title: TASK_TITLES[kind] || "言葉", queue: shuffle(keys).map(k => () => qFor(k, kind, "practice")) });
    return;
  }
  const ks = todaysGlyphs().filter(k => kind === "x" ? KANA_BY[k].concept : !KANA_BY[k].concept);
  const keys = kind === "a" ? ks.filter(k => alikeOf(k).length) : kind === "w" ? ks.filter(canWrite) : ks;
  const queue = shuffle(keys).map(k => () => qFor(k, kind, "practice"));
  if (kind === "x") keys.forEach(k => { queue.push(() => qPair(k, "practice"), () => qPair(k, "practice")); });
  openSession({ kind: "practice", title: TASK_TITLES[kind], queue });
}

const TASK_TITLES = { r: "読む · Read", p: "聞く · Hear", a: "似てる · Look-alikes", x: "っ · The pause", w: "書く · Write", c: "打つ · Type",
  j: "活用 · Conjugate", word: "言葉 · Real words", wr: "言葉 · Read", wp: "言葉 · Hear", wc: "言葉 · Type", wj: "活用 · Conjugate" };

function startDeeper(kind) {
  const keys = Object.keys(state.items);
  let queue;
  if (kind === "kj") {
    const ks = shakiest(Object.keys(state.kanji), "y").slice(0, 12);
    queue = shuffle(ks.flatMap(k => [() => qFor(k, "y", "practice"), () => qFor(k, "m", "practice")]));
    openSession({ kind: "practice", title: "漢字 · Kanji", queue });
    return;
  }
  if (kind === "g") {
    const ps = Object.keys(state.patterns);
    queue = shuffle(ps).slice(0, 12).flatMap(k => [() => qFor(k, hasGaps(PATTERN_BY[k]) ? "f" : "r", "practice"), () => qFor(k, "r", "practice")]);
    openSession({ kind: "practice", title: "文型 · Patterns", queue: shuffle(queue) });
    return;
  }
  if (/^w[rpcj]$/.test(kind)) {
    const sk = kind[1];
    const ws = Object.keys(state.words).filter(k => (sk !== "p" || clipFor(WORD_BY[k].say)) && (sk !== "j" || isConjugable(WORD_BY[k].pos)));
    queue = shuffle(shakiest(ws, sk).slice(0, 15)).map(k => () => qFor(k, sk, "practice"));
  } else if (kind === "word") {
    queue = sample(readableWords(), 15).map(w => () => qWord(w));
  } else if (kind === "a") {
    queue = shakiest(keys.filter(k => alikeOf(k).length), "a").slice(0, 20).map(k => () => qAlike(k, "practice"));
  } else {
    const plain = keys.filter(k => !KANA_BY[k].concept && (kind !== "w" || canWrite(k)));
    queue = shuffle(shakiest(plain, kind).slice(0, kind === "w" ? 10 : 20)).map(k => () => qFor(k, kind, "practice"));
  }
  openSession({ kind: "practice", title: TASK_TITLES[kind], queue });
}

function startMistakes() {
  const top = Object.entries(state.mistakes).filter(([k]) => isLearned(k) && !KANA_BY[k]?.concept)
    .sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k]) => k);
  if (!top.length) return;
  const queue = [];
  shuffle(top).forEach(k => { queue.push(() => qRead(k, "practice"), () => qFor(k, "p", "practice")); });
  openSession({ kind: "practice", title: "間違いノート · Mistakes", queue: shuffle(queue) });
}

/* The hiragana check: every hiragana to read, the twenty shakiest to hear,
   the pauses, and some real words. Graded "auto": it counts as a review for
   anything due. First-try accuracy decides the day. */
function startCheck() {
  const hira = KANA.filter(e => e.set === "h" && !e.concept).map(e => e.k);
  const queue = [];
  shuffle([...hira]).forEach(k => queue.push(() => qRead(k, "auto")));
  if (hasAudio()) {
    shuffle(shakiest(hira, "p").slice(0, 20)).forEach(k => queue.push(() => qHear(k, "auto")));
    for (let i = 0; i < 4; i++) queue.push(() => qPair("っ", "auto"));
  }
  sample(readableWords("h"), 8).forEach(w => queue.push(() => qWord(w)));
  openSession({ kind: "check", title: "ひらがな · The hiragana check", queue, confirmLeave: true });
}

/* ============================================================
   The session
   ============================================================ */

let S = null;           /* the running session, or null */
let advanceTimer = null;

function openSession(o) {
  S = {
    ...o, i: 0, card: null, answered: false, t0: 0,
    first: 0, firstRight: 0, quick: 0, missed: new Set(), tries: new Map(), learned: [],
  };
  S.tasksDoneAtStart = allTasksDone();
  crumb(`session ${o.kind} (${o.queue.length})`);
  $("#session").classList.add("on");
  $("#sTitle").innerHTML = `<span lang="ja">${esc(o.title)}</span>`;
  document.body.style.overflow = "hidden";
  showCard();
}

/* Cards may be queued as functions, so a question's options are drawn when it
   comes up — against what's learned by then, not what was learned when the
   session was built. A builder returning null (no audio, no look-alike) is
   skipped. */
function currentCard() {
  while (S.i < S.queue.length) {
    let c = S.queue[S.i];
    if (typeof c === "function") c = S.queue[S.i] = c();
    if (c) return c;
    S.queue.splice(S.i, 1);
  }
  return null;
}

function showCard() {
  clearTimeout(advanceTimer);
  const c = currentCard();
  S.card = c;
  S.answered = false;
  updateProgress();
  if (!c) return finishSession();
  const body = $("#sBody"), foot = $("#sFoot");
  stopTimer();

  if (c.t === "intro") {
    learn(c.k); save();
    if (!S.learned.includes(c.k)) S.learned.push(c.k);
    const e = KANA_BY[c.k];
    body.innerHTML = `<div class="intro">
      <div class="eyebrow"><span lang="ja">${esc(c.L.title)}</span> · ${c.n} of ${c.L.items.length}</div>
      <button class="glyph-xl" lang="ja" data-act="say" data-say="${esc(e.say)}" title="Hear it">${esc(e.k)}</button>
      <div class="intro-rom">${esc(e.r)}</div>
      ${introNote(e)}
    </div>`;
    foot.innerHTML = `<button class="btn btn-ghost" data-act="say" data-say="${esc(e.say)}">${icon("speaker")} Hear it <kbd>R</kbd></button>
      <button class="btn" data-act="next" id="nextBtn">Next <kbd>␣</kbd></button>`;
    if (state.settings.autoplay) sayKana(c.k);
    return;
  }

  if (c.t === "concept") {
    learn(c.k); save();
    if (!S.learned.includes(c.k)) S.learned.push(c.k);
    const cc = KANA_CONCEPT[c.k];
    body.innerHTML = `<div class="intro concept">
      <div class="eyebrow"><span lang="ja">${esc(c.L.title)}</span></div>
      <div class="glyph-xl static" lang="ja">${esc(c.k)}</div>
      <h2>${esc(cc.head)}</h2>
      <p>${esc(cc.body)}</p>
      <div class="ex-row">${cc.ex.map(w => {
        const word = KANA_WORDS.find(x => x.w === w) || KANA_PAIRS_WORDS.find(x => x.w === w);
        return `<button class="ex" data-act="say" data-say="${esc(w)}"><span lang="ja">${esc(w)}</span><small>${esc(word?.m || "")}</small></button>`;
      }).join("")}</div>
    </div>`;
    foot.innerHTML = `<button class="btn" data-act="next" id="nextBtn">Next <kbd>␣</kbd></button>`;
    return;
  }

  if (c.t === "info") {
    body.innerHTML = infoHtml(c);
    foot.innerHTML = `<span></span><button class="btn" data-act="next" id="nextBtn">${c.last && S.kind === "today" ? "Start the first lesson" : "Next"} <kbd>␣</kbd></button>`;
    if (c.last) { state.seenGuide = true; save(); }
    return;
  }

  if (c.t === "kintro") {
    learn(c.k); save();
    if (!S.learned.includes(c.k)) S.learned.push(c.k);
    body.innerHTML = kanjiIntroHtml(c);
    foot.innerHTML = `<button class="btn btn-ghost" data-act="replay">${icon("speaker")} Hear it <kbd>R</kbd></button>
      <button class="btn" data-act="next" id="nextBtn">Next <kbd>␣</kbd></button>`;
    if (state.settings.autoplay) say(kanjiSay(c.k.slice(2)));
    return;
  }

  if (c.t === "gintro") {
    learn(c.k); save();
    if (!S.learned.includes(c.k)) S.learned.push(c.k);
    body.innerHTML = patIntroHtml(c);
    foot.innerHTML = `<button class="btn btn-ghost" data-act="replay">${icon("speaker")} Hear it <kbd>R</kbd></button>
      <button class="btn" data-act="next" id="nextBtn">Next <kbd>␣</kbd></button>`;
    if (state.settings.autoplay) say(PATTERN_BY[c.k].ex[0].kana);
    return;
  }

  if (c.t === "wintro") {
    learn(c.k); save();
    if (!S.learned.includes(c.k)) S.learned.push(c.k);
    body.innerHTML = wordIntroHtml(c);
    foot.innerHTML = `<button class="btn btn-ghost" data-act="replay">${icon("speaker")} Hear it <kbd>R</kbd></button>
      <button class="btn" data-act="next" id="nextBtn">Next <kbd>␣</kbd></button>`;
    if (state.settings.autoplay) sayWord(WORD_BY[c.k]);
    return;
  }

  if (c.kind === "w") return showWrite(c);
  if (c.kind === "c" || c.kind === "j") return showType(c);

  /* a question */
  const prompts = {
    r: () => `<div class="q-ask">How is this read?</div><div class="glyph-l" lang="ja">${esc(c.k)}</div>`,
    p: () => `<div class="q-ask">Which one did you hear?</div><button class="play" data-act="replay" aria-label="Play again">${icon("speaker")}</button>`,
    a: () => `<div class="q-ask">Which one is <b>${esc(KANA_BY[c.k].r)}</b>?</div><button class="play small" data-act="replay" aria-label="Play again">${icon("speaker")}</button>`,
    x: () => `<div class="q-ask">Which spelling did you hear?</div><button class="play" data-act="replay" aria-label="Play again">${icon("speaker")}</button>
              <div class="muted small">${esc(c.word.m)}</div>`,
    word: () => `<div class="q-ask">What does this mean?</div><div class="glyph-l word" lang="ja">${esc(c.word.w)}</div>`,
  };
  const n = c.opts.length;
  body.innerHTML = `<div class="q q-${c.kind}">
    ${c.kk ? kanjiPrompt(c) : c.gk ? patPrompt(c) : c.wk ? wordPrompt(c) : prompts[c.kind]()}
    <div class="opts n${n} ${c.wk ? "words" : ""}">${c.opts.map((o, i) => `
      <button class="opt ${o.jp ? "jp" : ""} ${o.furi ? "furi" : ""}" data-act="opt" data-i="${i}" ${o.jp ? 'lang="ja"' : ""}><kbd>${i + 1}</kbd><span>${o.furi ? wordHtml(o.label) : esc(o.label)}</span></button>`).join("")}
    </div>
    <div class="verdict" id="verdict" aria-live="polite"></div>
  </div>`;
  /* a fill-the-gap sentence can't be played before it's answered — the sound gives the gap away */
  foot.innerHTML = `${c.sound && c.kind !== "f" && !c.kk ? `<button class="btn btn-ghost" data-act="replay">${icon("speaker")} Again <kbd>R</kbd></button>` : "<span></span>"}
    <button class="btn" data-act="next" id="nextBtn" disabled>Next <kbd>␣</kbd></button>`;
  if (c.kind !== "r" && c.kind !== "word" && c.kind !== "f" && !c.kk && c.sound) say(c.sound);
  S.t0 = performance.now();
  startTimer(quickMs(c));
}

/* ---------- writing ---------- */

function showWrite(c) {
  const n = strokesFor(c.ch).s.length;
  const ordered = state.settings.strokeOrder;
  let what;
  if (isKanjiKey(c.k)) {
    const K = KANJI_BY[c.ch];
    what = `${c.trace ? `<b lang="ja">${esc(c.ch)}</b> ` : "the kanji for "}<b>${esc(K.m)}</b>`;
  } else {
    const e = KANA_BY[c.k];
    what = `${c.trace ? `<b lang="ja">${esc(e.k)}</b> ` : ""}<b>${esc(e.r)}</b> in ${SET_NAME[e.set]}`;
  }
  $("#sBody").innerHTML = `<div class="q q-w">
    <div class="q-ask">${c.trace ? "Trace it" : "Write it from memory"}: ${what}
      <span class="muted small">· ${n} stroke${n > 1 ? "s" : ""}${ordered ? ", in order" : ""}</span></div>
    ${padHtml(c.ch, { trace: c.trace })}
    <div class="pad-tools">
      <button class="btn btn-ghost btn-sm" data-act="w-undo">Undo <kbd>Z</kbd></button>
      <button class="btn btn-ghost btn-sm" data-act="w-clear">Clear</button>
      <button class="btn btn-ghost btn-sm" data-act="w-show">Show me <kbd>S</kbd></button>
      <button class="btn btn-ghost btn-sm" data-act="replay" aria-label="Hear it">${icon("speaker")} <kbd>R</kbd></button>
    </div>
    <div class="verdict" id="verdict" aria-live="polite"></div>
  </div>`;
  $("#sFoot").innerHTML = `<span></span><button class="btn" data-act="w-check" id="nextBtn">Check <kbd>↵</kbd></button>`;
  $("#sTimer").classList.remove("run");
  S.peeked = false;
  bindPad();
  if (state.settings.autoplay) say(c.sound);
}

/* The stroke animation, played into the box. Afterwards the model stays
   there faintly, so you can write over it. */
function showStrokes() {
  const c = S?.card;
  if (!c || c.kind !== "w") return;
  if (!c.trace && !S.answered) S.peeked = true;
  const box = $("#padModel");
  box.innerHTML = modelSvg(c.ch, { animate: true });
  clearTimeout(showStrokes.t);
  showStrokes.t = setTimeout(() => { if (S?.card === c && box.isConnected) box.innerHTML = modelSvg(c.ch, { faint: true }); }, modelAnimMs(c.ch) + 500);
}

function checkWrite() {
  const c = S?.card;
  if (!c || c.kind !== "w" || S.answered) return;
  if (!pad || !pad.strokes.length) { toast("Write it in the box first."); return; }
  pad.locked = true;
  const res = markWriting(c.ch, pad.strokes, state.settings.strokeOrder);
  const ok = res.ok;
  /* A trace is practice, and a peek withholds the credit (Hanzi Quest's
     writing drill works the same way): the answer counts for the day, but
     not towards "solid" in writing. Traces stay out of the first-try score. */
  if (c.trace) {
    S.answered = true;
    day().n++;
    if (!ok && (S.tries.get("trace:" + c.k) || 0) < 2) {
      S.tries.set("trace:" + c.k, (S.tries.get("trace:" + c.k) || 0) + 1);
      S.queue.push(() => qWrite(c.k, c.mode, true));
    }
    save();
  } else settle(c, ok, null, !S.peeked);

  drawInk(res.strokes);
  const label = isKanjiKey(c.k) ? `<span lang="ja">${esc(c.ch)}</span> <span class="rom-always">${esc(KANJI_BY[c.ch].m)}</span>`
    : `<span lang="ja">${esc(KANA_BY[c.k].k)}</span> <span class="rom-always">${esc(KANA_BY[c.k].r)}</span>`;
  const v = $("#verdict");
  if (ok) {
    v.className = "verdict ok";
    v.innerHTML = `${icon("check", "v-ico")} ${label}${S.peeked && !c.trace ? ` <span class="muted small">— after a peek, so it's practice this time</span>` : ""}`;
  } else {
    v.className = "verdict miss";
    v.innerHTML = `${esc(res.reason)} <span class="muted small">Here's how it goes.</span>`;
    $("#padModel").innerHTML = modelSvg(c.ch, { animate: true });
  }
  afterAnswer(ok);
}

function introNote(e) {
  const L = LESSONS.find(x => x.id === e.lesson);
  const twin = e.set === "k" && L.kind !== "loan" ? toHira(e.k) : null;
  let rule = "";
  if (L.kind === "voiced") {
    const plain = String.fromCharCode(e.k.charCodeAt(0) - (/[ぱぴぷぺぽパピプペポ]/.test(e.k) ? 2 : 1));
    rule = /[ぱぴぷぺぽパピプペポ]/.test(e.k)
      ? `A small circle turns ${plain} (${KANA_BY[plain]?.r}) into ${e.r}.`
      : `Two small ticks voice the sound: ${plain} ${KANA_BY[plain]?.r} → ${e.k} ${e.r}.`;
    if (["ぢ", "づ", "ヂ", "ヅ"].includes(e.k)) rule += ` It sounds the same as ${e.k.match(/[ぢヂ]/) ? (e.set === "h" ? "じ" : "ジ") : (e.set === "h" ? "ず" : "ズ")} and is much rarer — you'll mostly see that one.`;
  } else if (L.kind === "combo") {
    const [a, b] = [...e.k];
    rule = `${a} with a small ${b} after it, said as one beat: ${e.r}. (Full-size ${a}${String.fromCharCode(b.charCodeAt(0) + 1)} would be two.)`;
  } else if (L.kind === "loan") {
    rule = `A pairing made for sounds Japanese didn't have, so borrowed words can be written: ${e.r}.`;
  }
  if (e.k === "を" || e.k === "ヲ") rule = "Said just like お. It only ever marks the object of a verb — you'll meet it in grammar.";
  if (e.k === "ん" || e.k === "ン") rule = "The only kana that's a consonant on its own. It never starts a word.";
  return `${e.story ? `<p class="story">${esc(e.story)}</p>` : ""}
    ${rule ? `<p class="rule">${esc(rule)}</p>` : ""}
    ${twin ? `<p class="twin">Same sound as <span lang="ja">${esc(twin)}</span> in hiragana.</p>` : ""}`;
}

function startTimer(ms) {
  const el = $("#sTimer");
  if (!state.settings.timer || !ms) { el.classList.remove("run"); return; }
  el.style.setProperty("--dur", ms + "ms");
  el.classList.remove("run", "stop");
  void el.offsetWidth;               /* restart the animation */
  el.classList.add("run");
}
function stopTimer() { $("#sTimer").classList.add("stop"); }

function updateProgress() {
  const total = S.queue.length, i = Math.min(S.i, total);
  $("#sProg").style.width = total ? (i / total * 100).toFixed(1) + "%" : "0";
  $("#sCount").textContent = total ? `${Math.min(i + 1, total)} / ${total}` : "";
}

const quickMs = c => (c.kk ? QUICK_KANJI_MS : c.gk ? QUICK_PATTERN_MS : c.wk ? QUICK_WORD_MS : QUICK_MS)[c.kind];

/* A fresh copy of a question, for when a miss comes back at the end. */
function rebuild(c) {
  const mode = c.mode === "review" || c.mode === "auto" ? "practice" : c.mode;
  if (c.kind === "word") return () => qWord(c.word);
  if (c.kind === "x") return () => qPair(c.k, mode);
  return () => qFor(c.k, c.kind, mode);
}

/* Everything an answer does to the record, whatever kind of question it
   was: first-try tally, the grade (or just the day's count, when the
   answer came after a hint or peek), the mistake list, and the retry. */
function settle(c, ok, ms, credit = true) {
  S.answered = true;
  stopTimer();
  const quick = ok && ms != null && quickMs(c) && ms <= quickMs(c);
  const key = c.kind + ":" + (c.k || c.answer);
  const tries = (S.tries.get(key) || 0) + 1;
  S.tries.set(key, tries);
  if (tries === 1) { S.first++; if (ok) S.firstRight++; }
  if (quick) S.quick++;
  if (c.kind === "word" || !credit) day().n++;
  else grade(c.k, c.kind, ok, ms, c.mode);
  if (!ok && c.k) S.missed.add(c.k);
  /* a miss comes back at the end of the session, freshly shuffled */
  if (!ok && tries < 3) S.queue.push(rebuild(c));
  save();
  crumb(`answer ${c.kind}${c.wk ? " word" : ""} ${ok ? "ok" : "miss"}`);
  return { quick };
}

/* The Next button: counts down after a right answer, waits after a wrong one. */
function afterAnswer(ok) {
  const nb = $("#nextBtn");
  nb.disabled = false;
  nb.dataset.act = "next";
  nb.innerHTML = `Next <kbd>␣</kbd>`;
  if (ok) {
    nb.classList.add("counting");
    nb.style.setProperty("--adv", AUTO_ADVANCE_MS + "ms");
    advanceTimer = setTimeout(next, AUTO_ADVANCE_MS);
  } else nb.focus();
  updateProgress();
}

function answer(idx) {
  const c = S?.card;
  if (!c || c.t !== "q" || S.answered || !c.opts) return;
  const o = c.opts[idx];
  if (!o) return;
  const ms = performance.now() - S.t0;
  const ok = o.val === c.answer;
  const { quick } = settle(c, ok, ms);

  $$(".opt").forEach((b, i) => {
    b.disabled = true;
    if (c.opts[i].val === c.answer) b.classList.add("right");
    else if (i === idx) b.classList.add("wrong");
  });
  const v = $("#verdict");
  if (ok) {
    v.className = "verdict ok";
    v.innerHTML = `${icon("check", "v-ico")} ${verdictDetail(c)}${quick ? ` <span class="badge-quick">速 ${(ms / 1000).toFixed(1)}s</span>` : ""}`;
  } else {
    v.className = "verdict miss";
    v.innerHTML = `It was ${verdictDetail(c)}`;
  }
  if (state.settings.autoplay && c.sound && (c.kind === "r" || c.kind === "word" || c.kind === "f" || c.kk)) say(c.sound);
  else if (c.kind === "r" && state.settings.autoplay && !c.wk) sayKana(c.k);
  afterAnswer(ok);
}

function verdictDetail(c) {
  if (c.kk) return kanjiVerdict(c);
  if (c.gk) return patVerdict(c);
  if (c.wk) return wordVerdict(WORD_BY[c.k]);
  if (c.kind === "word") {
    return `<span lang="ja">${esc(c.word.w)}</span> <span class="rom-always">${esc(c.word.r)}</span> · ${esc(c.word.m)}${c.word.note ? `<div class="note">${esc(c.word.note)}</div>` : ""}`;
  }
  if (c.kind === "x") return `<span lang="ja">${esc(c.word.w)}</span> <span class="rom-always">${esc(toRomaji(c.word.w))}</span> · ${esc(c.word.m)}`;
  const e = KANA_BY[c.k];
  return `<span lang="ja">${esc(e.k)}</span> <span class="rom-always">${esc(e.r)}</span>`;
}

function next() {
  if (!S) return;
  clearTimeout(advanceTimer);
  const c = S.card;
  if (c && c.t === "q" && !S.answered) return;
  if (S.i >= S.queue.length) return closeSession();   /* on the finish screen */
  S.i++;
  showCard();
}

function replay() {
  const c = S?.card;
  if (!c) return;
  if (c.t === "intro") return sayKana(c.k);
  if (c.t === "wintro") return sayWord(WORD_BY[c.k]);
  if (c.t === "gintro") return say(PATTERN_BY[c.k].ex[0].kana);
  if ((c.kind === "f" || c.kk) && !S.answered) return;
  if (c.t === "kintro") return say(kanjiSay(c.k.slice(2)));
  if (c.sound) say(c.sound);
}

/* Is everything on today's practice list ticked? */
function allTasksDone() {
  if (!todaysGlyphs().length && !todaysWords().length) return false;
  const ts = todayTasks().filter(t => !t.locked);
  return ts.length > 0 && ts.every(t => t.done);
}

/* The word stages this session finished. */
function stagesFinished() {
  const sts = new Set(S.learned.filter(isWordKey).map(k => WORD_BY[k].st));
  return [...sts].filter(st => WORDS.filter(x => x.st === st).every(x => isLearned(x.key)));
}

/* The end of a session — worth marking. The cat, a teacher's stamp, the
   hanamaru round a good score and falling petals are the celebration; how
   much of it you get depends on what just happened. */
function finishSession() {
  if (S.kind === "guide") { S.finished = true; return closeSession(); }
  stopTimer();
  $("#sTimer").classList.remove("run");
  const body = $("#sBody"), foot = $("#sFoot");
  const acc = S.first ? S.firstRight / S.first : 1;
  const pct = Math.round(acc * 100);
  let head = "", extra = "", mood = acc >= 0.6 ? "happy" : "think", stampText = "", maru = S.first >= 5 && acc >= 0.9, petalN = 0;

  if (S.kind === "check") {
    const r = recordCheck(S.firstRight, S.first);
    const days = hiraCheckDays().length;
    const opened = kataOpen();
    save();
    if (r.passed) {
      mood = "cheer"; stampText = "合格"; petalN = opened ? 40 : 18;
      head = opened ? "カタカナ is open!" : "Passed.";
      extra = opened
        ? `<p>${HIRA_CHECK.days} days, ${HIRA_CHECK.days} passes. Hiragana has stuck — katakana is ready on Today.</p>`
        : `<p>That's day ${days} of ${HIRA_CHECK.days}. Come back tomorrow for the next.</p>`;
    } else {
      mood = "gambaru"; maru = false;
      head = "Not this time — がんばって!";
      extra = `<p>${Math.round(HIRA_CHECK.pass * 100)}% first time is needed. Your misses are listed below — a round of Go deeper on them, then try again. There's no limit on tries.</p>`;
    }
    crumb(`check ${Math.round(r.acc * 100)}% ${r.passed ? "pass" : "fail"}`);
  } else if (S.learned.length) {
    mood = "cheer"; stampText = "よくできました"; petalN = 16;
    head = S.learned.some(isKanjiKey) ? `${S.learned.length} new kanji.` : S.learned.some(isPatternKey) ? `${S.learned.length} new pattern${S.learned.length > 1 ? "s" : ""}.`
      : S.learned.some(isWordKey) ? `${S.learned.length} new word${S.learned.length > 1 ? "s" : ""}.` : `${S.learned.length} new kana.`;
    const label = k => isKanjiKey(k) ? esc(k.slice(2)) : isPatternKey(k) ? wordHtml(PATTERN_BY[k].pat) : isWordKey(k) ? wordHtml(WORD_BY[k].w) : esc(k);
    const long = S.learned.some(k => isWordKey(k) || isPatternKey(k));
    extra = `<p class="learned-list ${long ? "words" : ""}" lang="ja">${S.learned.map(label).join(long ? "<br>" : " ")}</p>`;
    if (phase() === "check" && S.kind === "today") {
      petalN = 36;
      extra += `<div class="banner-done">${neko("wow", "mini")}<div><b>That's all of hiragana.</b> Next: the hiragana check, on ${HIRA_CHECK.days} separate days from tomorrow, before katakana.</div></div>`;
    }
    stagesFinished().forEach(st => {
      const W = WORD_STAGES.find(x => x.st === st);
      petalN = 36;
      extra += `<div class="banner-done">${stamp("完", "mini")}<div><b>Stage ${st} · <span lang="ja">${esc(W.jp)}</span> complete.</b> Every ${esc(W.en.toLowerCase())} word is yours.</div></div>`;
    });
  } else {
    head = acc >= 0.9 ? "Nicely done." : acc >= 0.6 ? "Done." : "Worth another round.";
    if (acc >= 0.9 && S.first >= 5) petalN = 8;
  }

  if (S.kind !== "check" && S.kind !== "guide" && !S.tasksDoneAtStart && allTasksDone()) {
    petalN = Math.max(petalN, 30);
    extra += `<div class="banner-done">${neko("happy", "mini")}<div><b lang="ja">きょうは おわり！</b> Everything on today's list is done.</div></div>`;
  }

  const missed = [...S.missed];
  body.innerHTML = `<div class="finish">
    <div class="celebrate">${neko(mood, "hop")}${stampText ? stamp(stampText) : ""}</div>
    <div class="score-wrap"><div class="finish-big">${pct}<small>%</small></div>${maru ? hanamaru() : ""}</div>
    <div class="muted">${S.firstRight} of ${S.first} right first time${S.quick ? ` · ${S.quick} quick` : ""}</div>
    <h2>${esc(head)}</h2>
    ${extra}
    ${missed.length ? `<div class="missed"><div class="eyebrow">To look at again</div>${missed.map(k => isKanjiKey(k)
      ? `<button class="chip" lang="ja" data-act="kanji-cell" data-k="${esc(k.slice(2))}">${esc(k.slice(2))} <small>${esc(KANJI_BY[k.slice(2)].m)}</small></button>`
      : isPatternKey(k)
      ? `<button class="chip" lang="ja" data-act="say" data-say="${esc(PATTERN_BY[k].ex[0].kana)}">${wordHtml(PATTERN_BY[k].pat)} <small>${esc(PATTERN_BY[k].m)}</small></button>`
      : isWordKey(k)
      ? `<button class="chip" lang="ja" data-act="say" data-say="${esc(WORD_BY[k].say)}">${wordHtml(WORD_BY[k].w)} <small>${esc(WORD_BY[k].m)}</small></button>`
      : `<button class="chip" lang="ja" data-act="say" data-say="${esc(KANA_BY[k]?.say || k)}">${esc(k)} <small>${esc(KANA_BY[k]?.r || "")}</small></button>`).join("")}</div>` : ""}
  </div>`;
  foot.innerHTML = `<span></span><button class="btn" data-act="close-session" id="nextBtn">Done <kbd>␣</kbd></button>`;
  $("#sProg").style.width = "100%";
  $("#sCount").textContent = "";
  if (petalN) petals($("#session"), petalN);
  S.i = S.queue.length;
  S.card = null;
  S.finished = true;
}

async function closeSession() {
  if (!S) return;
  if (S.confirmLeave && !S.finished && S.first > 0) {
    const yes = await askConfirm({
      k: "やめる", title: "Leave the check?",
      body: "Answers so far are kept for your reviews, but this check won't count. You can start a new one any time.",
      yes: "Leave", no: "Keep going",
    });
    if (!yes) return;
  }
  clearTimeout(advanceTimer);
  crumb("session closed");
  S = null;
  $("#session").classList.remove("on");
  document.body.style.overflow = "";
  save();
  render();
}

/* ============================================================
   The kana chart
   ============================================================ */

function renderKana() {
  const el = $("#v-kana");
  const set = chartSet;
  const locked = set === "k" && !kataOpen();
  const lessons = LESSONS.filter(L => L.set === set);
  const cell = k => {
    if (!k) return `<span class="kc blank"></span>`;
    const e = KANA_BY[k];
    const got = isLearned(k);
    const dots = got ? `<i class="dots d${e.concept ? solidness(k, "x") : Math.min(solidness(k, "r"), hasAudio() ? solidness(k, "p") : 3)}"></i>` : "";
    return `<button class="kc ${got ? "got" : "not"}" data-act="kana-cell" data-k="${esc(k)}" lang="ja" aria-label="${esc(k)}">
      <span class="kg">${esc(k)}</span>${state.settings.showRomaji ? `<span class="kr">${esc(e.r)}</span>` : ""}${dots}</button>`;
  };
  /* Rows laid out on the vowel grid, gaps where a sound doesn't exist. */
  const byVowel = items => {
    const slots = ["a", "i", "u", "e", "o"];
    const row = [null, null, null, null, null];
    items.forEach(k => {
      const r = KANA_BY[k].r;
      const v = k === "ん" || k === "ン" ? null : r.slice(-1);
      const idx = slots.indexOf(v);
      if (idx >= 0 && !row[idx]) row[idx] = k; else row[row.indexOf(null, idx < 0 ? 0 : idx)] = k;
    });
    return row;
  };
  /* The chart's axes: vowels across the top, the consonant at the start of
     each row. These show whatever the romaji setting says — they're how
     the chart is read, not answers — and a new learner needs them most. */
  const consonant = k => KANA_BY[k].r.replace(/[aiueo]$/, "");
  const section = (title, jp, kinds, cols, head) => {
    const ls = lessons.filter(L => kinds.includes(L.kind));
    if (!ls.length) return "";
    const rows = [];
    ls.forEach(L => {
      if (cols === 5 && L.kind === "base") {
        if (L.id.endsWith("-w")) {
          const [wa, wo, n] = L.items;
          rows.push({ label: "w", cells: [wa, null, null, null, wo] });
          rows.push({ label: "n", cells: [n, null, null, null, null] });
        } else rows.push({ label: consonant(L.items[0]), cells: byVowel(L.items) });
      } else {
        for (let i = 0; i < L.items.length; i += cols) {
          const r = L.items.slice(i, i + cols);
          while (r.length < cols) r.push(null);
          rows.push({ label: head ? consonant(r[0]).replace(/y$/, L.kind === "combo" ? "y" : "") : "", cells: r });
        }
      }
    });
    const lab = t => `<span class="kh kh-row">${esc(t)}</span>`;
    return `<section class="card chart-sec">
      <div class="card-head"><h2><span lang="ja">${jp}</span> ${esc(title)}</h2></div>
      <div class="kgrid c${cols} ${head ? "labelled" : ""}">
        ${head ? `<span class="kh"></span>${head.map(h => `<span class="kh kh-col">${h}</span>`).join("")}` : ""}
        ${rows.map(r => (head ? lab(r.label) : "") + r.cells.map(cell).join("")).join("")}
      </div>
    </section>`;
  };
  const segs = `<div class="seg">
        <button class="${set === "h" ? "on" : ""}" data-act="chart-set" data-set="h"><span lang="ja">ひらがな</span></button>
        <button class="${set === "k" ? "on" : ""}" data-act="chart-set" data-set="k"><span lang="ja">カタカナ</span></button>
        <button class="${set === "j" ? "on" : ""}" data-act="chart-set" data-set="j"><span lang="ja">漢字</span></button>
      </div>`;
  if (set === "j") { el.innerHTML = `<div class="chart-head">${segs}</div>${kanjiChartHtml()}`; return; }
  const learnedN = KANA.filter(e => e.set === set && isLearned(e.k)).length;
  const totalN = KANA.filter(e => e.set === set).length;
  el.innerHTML = `
    <div class="chart-head">
      ${segs}
      <span class="muted">${learnedN} of ${totalN} learned · tap one to hear it${state.settings.showRomaji ? "" : " and see its romaji"}</span>
    </div>
    <details class="card how-chart" ${Object.keys(state.items).length < 10 ? "open" : ""}>
      <summary><h2>How this chart works</h2></summary>
      <p>Almost every kana is a consonant plus a vowel. Vowels run across — a i u e o — and consonants down — k s t n h m y r w.
        A row shares a consonant, a column shares a vowel. The order is Japanese alphabetical order, the “fifty sounds”
        (<span lang="ja">五十音</span>), usually traced back to Sanskrit: vowels first, then consonants from the back of the mouth to the lips.</p>
      <p>Blank squares are sounds modern Japanese doesn't have. The small bar under each kana fills with three quick
        passes reading${hasAudio() ? " and hearing" : ""} it.</p>
      <button class="btn btn-ghost btn-sm" data-act="guide">Read the full introduction</button>
    </details>
    ${locked ? `<div class="card banner">${icon("lock")} Katakana opens after the hiragana check — ${HIRA_CHECK.days} days of it, once every hiragana is learned. You can look, but not start.</div>` : ""}
    <div class="chart-cols">
      <div>${section("Basic", "清音", ["base"], 5, ["a", "i", "u", "e", "o"])}</div>
      <div>
        ${section("Voiced", "濁音", ["voiced"], 5, ["a", "i", "u", "e", "o"])}
        ${section("Combined", "拗音", ["combo"], 3, ["a", "u", "o"])}
        ${section("Pauses and long sounds", "促音", ["concept"], 3)}
        ${section("Loanword sounds", "外来音", ["loan"], 4)}
      </div>
    </div>
    <p class="muted small legend"><i class="dots d3"></i> solid — three quick passes reading ${hasAudio() ? "and hearing" : ""} · <i class="dots d1"></i> on the way</p>`;
}

function openKana(k) {
  const e = KANA_BY[k];
  if (!e) return;
  if (!e.concept) sayKana(k);
  const got = isLearned(k);
  const L = LESSONS.find(x => x.id === e.lesson);
  const words = KANA_WORDS.filter(w => w.units.includes(k)).sort((a, b) => canRead(b) - canRead(a)).slice(0, 8);
  const sk = s => { const v = skill(k, s); return `${Math.min(3, v.fast)}/3 quick · ${v.ok} of ${v.n} right`; };
  openSheet(`<div class="kana-detail">
    <button class="glyph-xl" lang="ja" data-act="say" data-say="${esc(e.say)}" ${e.concept ? "disabled" : ""}>${esc(k)}</button>
    <div class="intro-rom">${esc(e.concept ? "" : e.r)}</div>
    ${e.concept ? `<p>${esc(KANA_CONCEPT[k].body)}</p>` : introNote(e)}
    <p class="muted small">Taught in <span lang="ja">${esc(L.title)}</span>${got ? ` · learned ${esc(item(k).at)} · next review ${esc(item(k).due)}` : " · not learned yet"}</p>
    ${canWrite(k) ? `<div class="kd-strokes"><div id="kdStrokes">${modelSvg(k)}</div>
      <button class="btn btn-ghost btn-sm" data-act="kd-strokes" data-k="${esc(k)}">Show the strokes · ${strokesFor(k).s.length}</button></div>` : ""}
    ${got && !e.concept ? `<div class="sk-rows"><div><span lang="ja">読む</span> ${sk("r")}</div>${hasAudio() ? `<div><span lang="ja">聞く</span> ${sk("p")}</div>` : ""}${canWrite(k) ? `<div><span lang="ja">書く</span> ${Math.min(3, skill(k, "w").ok)}/3 · ${skill(k, "w").ok} of ${skill(k, "w").n} right</div>` : ""}</div>` : ""}
    ${words.length ? `<div class="eyebrow">Words with it</div><div class="ex-row">${words.map(w => `
      <button class="ex ${canRead(w) ? "" : "dim"}" data-act="say" data-say="${esc(w.w)}"><span lang="ja">${esc(w.w)}</span><small>${esc(canRead(w) ? w.m : "not yet")}</small></button>`).join("")}</div>` : ""}
  </div>`);
}

/* ============================================================
   Record
   ============================================================ */

function renderRecord() {
  const el = $("#v-record");
  const keys = Object.keys(state.items);
  const hk = keys.filter(k => KANA_BY[k]?.set === "h"), kk = keys.filter(k => KANA_BY[k]?.set === "k");
  const skillRow = (label, ks, sk) => {
    const st = standing(ks, sk);
    return `<div class="sk-line"><span>${label}</span>${spread(st)}<small>${st.solid}/${st.total}</small></div>`;
  };
  /* twelve weeks, oldest first, Monday at the top */
  const cal = [];
  let start = addDays(today(), -83);
  const dow = (new Date(start + "T12:00").getDay() + 6) % 7;
  start = addDays(start, -dow);
  for (let k = start; k <= today(); k = addDays(k, 1)) {
    const n = state.days[k]?.n || 0;
    const lv = n === 0 ? 0 : n < 20 ? 1 : n < 60 ? 2 : 3;
    cal.push(`<i class="l${lv}${k === today() ? " now" : ""}" title="${k}: ${n} answers"></i>`);
  }
  const mist = Object.entries(state.mistakes).filter(([k]) => KANA_BY[k]).sort((a, b) => b[1] - a[1]).slice(0, 16);
  const checkDays = hiraCheckDays();
  const recent = asList(state.sprint.recent).slice(0, 5);

  el.innerHTML = `
    <div class="stats">
      <div class="stat"><b>${streak()}</b><span>day streak</span></div>
      <div class="stat"><b>${practisedDays()}</b><span>days practised</span></div>
      <div class="stat"><b>${keys.length}</b><span>of ${KANA.length} kana</span></div>
      ${wordsOpen() ? `<div class="stat"><b>${learnedWords().length}</b><span>of ${WORDS.length} words</span></div>` : ""}
      <div class="stat"><b>${state.days[today()]?.n || 0}</b><span>answers today</span></div>
    </div>
    <div class="record-grid">
      <section class="card">
        <div class="card-head"><h2>Skills</h2><span class="count">solid = three quick passes</span></div>
        ${skillRow('<span lang="ja">ひらがな</span> read', hk, "r")}
        ${hasAudio() ? skillRow('<span lang="ja">ひらがな</span> hear', hk, "p") : ""}
        ${skillRow('<span lang="ja">カタカナ</span> read', kk, "r")}
        ${hasAudio() ? skillRow('<span lang="ja">カタカナ</span> hear', kk, "p") : ""}
        ${Object.keys(state.words).length ? skillRow('<span lang="ja">言葉</span> read', Object.keys(state.words), "r")
          + (hasAudio() ? skillRow('<span lang="ja">言葉</span> hear', Object.keys(state.words), "p") : "")
          + skillRow('<span lang="ja">言葉</span> type', Object.keys(state.words), "c") : ""}
        ${Object.keys(state.kanji).length ? skillRow('<span lang="ja">漢字</span> meaning', Object.keys(state.kanji), "m")
          + skillRow('<span lang="ja">漢字</span> in words', Object.keys(state.kanji), "y") : ""}
        ${Object.keys(state.patterns).length ? skillRow('<span lang="ja">文型</span> fill', Object.keys(state.patterns), "f")
          + skillRow('<span lang="ja">文型</span> understand', Object.keys(state.patterns), "r") : ""}
        ${state.settings.writing ? skillRow('<span lang="ja">ひらがな</span> write', hk.filter(canWrite), "w") + skillRow('<span lang="ja">カタカナ</span> write', kk.filter(canWrite), "w") : ""}
      </section>
      <section class="card">
        <div class="card-head"><h2>The last twelve weeks</h2></div>
        <div class="cal">${cal.join("")}</div>
      </section>
      <section class="card">
        <div class="card-head"><h2>The hiragana check</h2></div>
        ${state.kataOpen ? `<p>Passed — katakana opened on ${esc(state.kataOpen)}.</p>`
          : allHiraLearned() ? `<p>${checkDays.length} of ${HIRA_CHECK.days} days passed${checkDays.length ? ` (${checkDays.join(", ")})` : ""}.</p>`
          : `<p class="muted">Starts once every hiragana is learned: ${HIRA_CHECK.days} separate days, ${Math.round(HIRA_CHECK.pass * 100)}% first time.</p>`}
      </section>
      <section class="card">
        <div class="card-head"><h2><span lang="ja">間違いノート</span> Mistakes</h2>
          ${mist.length ? `<button class="link" data-act="mistakes">Practise these ›</button>` : ""}</div>
        ${mist.length ? `<div class="chips">${mist.map(([k, n]) => `<button class="chip" lang="ja" data-act="kana-cell" data-k="${esc(k)}">${esc(k)} <small>×${n}</small></button>`).join("")}</div>`
          : `<p class="muted small">Whatever you keep missing collects here, from lessons, practice and sprints.</p>`}
      </section>
      ${recent.length ? `<section class="card">
        <div class="card-head"><h2>Latest sprints</h2><button class="link" data-act="nav" data-nav="sprint">Sprint ›</button></div>
        <ul class="plain">${recent.map(r => `<li>${esc(sprintLabel(r.key))} — ${r.right}/${r.total} in ${(r.ms / 1000).toFixed(0)}s <small class="muted">${esc(r.at)}</small></li>`).join("")}</ul>
      </section>` : ""}
    </div>
    <p class="muted small foot-ver">Nihongo Quest ${esc(APP_VERSION)} · ${esc(APP_DATE)}</p>`;
}

/* ============================================================
   Sheets: settings, backup, report
   ============================================================ */

function openSheet(html) {
  /* the Done at the foot is for a phone, where the corner ✕ is a stretch;
     it's display: none on a desktop */
  $("#sheetBody").innerHTML = html + `<button class="btn sheet-done" data-act="sheet-close">Done</button>`;
  $("#sheet").classList.add("on");
}
function closeSheet() {
  $("#sheet").classList.remove("on");
  if (!S) document.body.style.overflow = "";
}

function openSettings() {
  const s = state.settings;
  const tog = (key, label, sub) => `<label class="set-row"><span>${label}<small>${sub}</small></span>
    <input type="checkbox" data-set="${key}" ${s[key] ? "checked" : ""}></label>`;
  const voices = "speechSynthesis" in window ? speechSynthesis.getVoices().filter(v => /^ja/i.test(v.lang)).length : 0;
  openSheet(`<h2>Settings</h2>
    ${tog("showRomaji", "Show romaji", "Under words, in the deck and on the chart. Kana lessons always show it — it's what they teach. Off by default, so your eyes learn to read the kana instead.")}
    ${tog("sound", "Sound", "Play kana and words.")}
    ${tog("autoplay", "Play on reveal", "Say the answer after each question, and each new kana as it's introduced.")}
    ${tog("timer", "Question timer", "A bar that drains over a few seconds. Answering before it empties counts as quick. Running out costs nothing.")}
    <label class="set-row"><span>New kana a day<small>Five is about one row. Rows are never split, so a day can run one over.</small></span>
      <select data-set="newPerDay">${[5, 8, 10, 15, 20].map(n => `<option ${s.newPerDay === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    ${tog("writing", "Writing practice", "Trace each new kana, and write today's from memory. Draw with a mouse, finger or pen.")}
    ${tog("writeKanji", "Write kanji too", "Trace each new kanji, and write today's from memory. Off by default — reading them is the part that gets you by.")}
    ${tog("strokeOrder", "Check stroke order", "Off: any order is fine — the shape is what's marked (strokes still go the usual way round, which is what tells ソ from ン). On: each stroke has to come in its proper turn too.")}
    <label class="set-row"><span>Furigana<small>The small kana over a kanji that say how to read it. “auto” shows them over kanji you haven't learned — which, until kanji arrive, is all of them.</small></span>
      <select data-set="furigana">${["auto", "always", "never"].map(t => `<option ${s.furigana === t ? "selected" : ""}>${t}</option>`).join("")}</select></label>
    <label class="set-row"><span>Theme</span>
      <select data-set="theme">${["auto", "light", "dark"].map(t => `<option ${s.theme === t ? "selected" : ""}>${t}</option>`).join("")}</select></label>
    <div class="set-block">
      <h3>Sound</h3>
      <p class="small">${hasAudio() ? `${clipCount()} recorded clips loaded.` : `<b>No recorded clips loaded.</b> Run <code>node tools/make-audio.mjs</code> (macOS) to make <code>js/audio-kana.js</code>. Listening drills are hidden until then.`}
        ${voices ? ` A Japanese system voice is also available as a fallback.` : ""}</p>
      <button class="btn btn-ghost btn-sm" data-act="say" data-say="あ">Test: あ</button>
    </div>
    <div class="set-block">
      <h3>Japanese writing</h3>
      <p class="small">Hiragana, katakana and kanji, how the kana chart is laid out, and why it's in that order.</p>
      <button class="btn btn-ghost btn-sm" data-act="guide">Read the introduction again</button>
    </div>
    <div class="set-block">
      <h3>Your data</h3>
      <p class="small">Progress lives in this browser only. Save a copy now and then — clearing site data loses it.</p>
      <button class="btn btn-ghost btn-sm" data-act="backup">${icon("save")} Save or load a backup</button>
      <button class="btn btn-ghost btn-sm" data-act="report">Report a problem</button>
      <button class="btn btn-ghost btn-sm danger" data-act="reset">Reset everything</button>
    </div>
    <p class="muted small">Version ${esc(APP_VERSION)} · ${esc(APP_DATE)}. If this doesn't match what was just published, you're looking at a cached copy.</p>`);
}

function onSetting(el) {
  const key = el.dataset.set;
  let v = el.type === "checkbox" ? el.checked : el.value;
  if (key === "newPerDay") v = +v;
  state.settings[key] = v;
  save();
  crumb(`setting ${key}=${v}`);
  if (key === "theme") applyTheme();
  render();
}

function applyTheme() {
  const t = state.settings.theme;
  if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
}

function renderSaveDot() {
  const n = Object.keys(state.items).length;
  const stale = !state.backupAt || daysBetween(state.backupAt, today()) >= 14;
  const nudge = n >= 10 && stale;
  $("#saveBtn").classList.toggle("nudge", nudge);
  $("#burger")?.classList.toggle("nudge", nudge);
  $$(".d-save").forEach(b => b.classList.toggle("nudge", nudge));
}

function openBackup() {
  openSheet(`<h2>Backup</h2>
    <p class="small">One file with all your progress. ${state.backupAt ? `Last saved ${esc(state.backupAt)}.` : "Never saved yet."}</p>
    <button class="btn" data-act="export">Save a backup file</button>
    <div id="exportFallback"></div>
    <div class="set-block">
      <h3>Load a backup</h3>
      <p class="small">Replaces everything here with what's in the file.</p>
      <input type="file" accept=".json,application/json" id="importFile">
      <details><summary class="small">…or paste it</summary>
        <textarea id="importText" rows="5" placeholder="Paste the backup's text here"></textarea>
        <button class="btn btn-ghost btn-sm" data-act="import-paste">Load pasted backup</button>
      </details>
    </div>`);
}

function doExport() {
  const text = exportState();
  const name = `nihongo-quest-${today()}.json`;
  let ok = false;
  try {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    ok = true;
  } catch { ok = false; }
  state.backupAt = today(); save(); renderSaveDot();
  /* A sandboxed frame can refuse the download without a word; the text is
     always offered too, so there's a way to keep it either way. */
  $("#exportFallback").innerHTML = `<p class="small">${ok ? "Saved to your downloads. If nothing arrived, copy this instead:" : "Couldn't save a file here — copy this and keep it somewhere:"}</p>
    <textarea rows="4" readonly>${esc(text)}</textarea>`;
}

async function doImport(text) {
  let next;
  try { next = parseBackup(text); } catch (e) { toast(e.message, 4000); return; }
  const n = Object.keys(next.items).length;
  const yes = await askConfirm({
    k: "読込", title: "Replace your progress?",
    body: `The backup has ${n} kana learned. Everything here now will be replaced by it.`,
    yes: "Replace", danger: true,
  });
  if (!yes) return;
  state = next; save();
  location.reload();
}

async function doReset() {
  const yes = await askConfirm({
    k: "消去", title: "Reset everything?",
    body: "Every kana, every review date, your streak and your sprint records — gone, with no way back unless you saved a backup.",
    yes: "Reset everything", danger: true,
  });
  if (!yes) return;
  state = freshState(); save();
  location.reload();
}

function openReport() {
  const summary = {
    version: APP_VERSION, learned: Object.keys(state.items).length, phase: phase(),
    days: Object.keys(state.days).length, audio: clipCount(), ua: navigator.userAgent,
  };
  const text = JSON.stringify({ summary, runs: window.NQDIAG ? NQDIAG.runs() : [] }, null, 1);
  openSheet(`<h2>Report a problem</h2>
    <p class="small">What the app was doing just before, from this run and the one before it — views, buttons, errors. No answers and no kana. Copy it and paste it wherever you're reporting.</p>
    <textarea rows="10" readonly id="reportText">${esc(text)}</textarea>
    <button class="btn btn-sm" data-act="copy-report">Copy</button>`);
}

/* ============================================================
   Asking before something irreversible

   Never window.confirm(): in a sandboxed frame without allow-modals it
   returns false immediately, and every guard written with it silently
   becomes "do nothing" (Hanzi Quest, "Asking before something irreversible").
   ============================================================ */

let askDone = null;
function askConfirm({ k = "確認", title, body, yes = "Confirm", no = "Cancel", danger = false }) {
  $("#askK").textContent = k;
  $("#askTitle").textContent = title;
  $("#askBody").textContent = body;
  $("#askYes").textContent = yes;
  $("#askNo").textContent = no;
  $("#askYes").className = "btn btn-sm" + (danger ? " danger-fill" : "");
  $("#ask").classList.add("on");
  $("#askNo").focus();
  return new Promise(res => { askDone = res; });
}
function closeAsk(v) {
  if (!askDone) return;
  const r = askDone; askDone = null;
  $("#ask").classList.remove("on");
  r(v);
}

/* ============================================================
   Crash guard
   ============================================================ */

function showCrash(e) {
  console.error(e);
  if (window.NQDIAG) NQDIAG.fail("crash", (e && e.stack) || String(e));
  $("#crash").classList.add("on");
}
const guard = fn => (...a) => { try { const r = fn(...a); if (r && r.catch) r.catch(showCrash); return r; } catch (e) { showCrash(e); } };

/* ============================================================
   Wiring
   ============================================================ */

const ACTS = {
  nav: el => go(el.dataset.nav),
  "start-today": () => startToday(),
  "start-ahead": () => startAhead(),
  "start-check": () => startCheck(),
  task: el => startTask(el.dataset.kind),
  deeper: el => startDeeper(el.dataset.kind),
  mistakes: () => startMistakes(),
  say: el => { if (!say(el.dataset.say)) toast(state.settings.sound ? "No recording for that yet." : "Sound is off in Settings."); },
  "kana-cell": el => openKana(el.dataset.k),
  "chart-set": el => { chartSet = el.dataset.set; renderKana(); },
  opt: el => answer(+el.dataset.i),
  next: () => { if (S && (S.card?.t === "intro" || S.card?.t === "concept" || S.card?.t === "info" || S.card?.t === "wintro" || S.card?.t === "gintro" || S.card?.t === "kintro" || S.answered || S.finished)) next(); },
  "deeper-set": el => { deeperSet = el.dataset.set; renderToday(); },
  "w-check": () => checkWrite(),
  "w-undo": () => padUndo(),
  "w-clear": () => padClear(),
  "w-show": () => showStrokes(),
  guide: () => { closeSheet(); startGuide(); },
  "kd-strokes": el => { const box = $("#kdStrokes"); if (box) box.innerHTML = modelSvg(el.dataset.k, { animate: true }); },
  replay: () => replay(),
  "close-session": () => closeSession(),
  settings: () => openSettings(),
  backup: () => openBackup(),
  "sheet-close": () => closeSheet(),
  export: () => doExport(),
  "import-paste": () => doImport($("#importText").value),
  reset: () => doReset(),
  report: () => openReport(),
  "copy-report": () => { navigator.clipboard?.writeText($("#reportText").value).then(() => toast("Copied."), () => toast("Couldn't copy — select the text instead.")); },
  "ask-yes": () => closeAsk(true),
  "ask-no": () => closeAsk(false),
  "sound-unblock": () => { soundBlocked = false; renderSoundBar(); unlockAudio(); },
  reload: () => location.reload(),
  "crash-report": () => { $("#crash").classList.remove("on"); openReport(); },
};

document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el || el.disabled) return;
  const f = ACTS[el.dataset.act];
  if (f) { crumb("act " + el.dataset.act); guard(f)(el, e); }
});

document.addEventListener("change", guard(e => {
  if (e.target.dataset.set) onSetting(e.target);
  if (e.target.id === "importFile" && e.target.files[0]) e.target.files[0].text().then(doImport);
}));

/* Backdrop clicks close sheets and cancel questions. */
$("#sheet").addEventListener("click", e => { if (e.target.id === "sheet") closeSheet(); });
$("#ask").addEventListener("click", e => { if (e.target.id === "ask") closeAsk(false); });

document.addEventListener("keydown", guard(e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const inField = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
  if (askDone) { if (e.key === "Escape") closeAsk(false); return; }
  if (typeof sprintKey === "function" && sprintKey(e)) return;
  if (typeof cardsKey === "function" && cardsKey(e)) return;
  if (S && (S.card?.kind === "c" || S.card?.kind === "j") && !S.finished) {
    if (e.key === "Enter") { e.preventDefault(); S.answered ? ACTS.next() : checkType(); return; }
    if (e.key === " " && S.answered) { e.preventDefault(); ACTS.next(); return; }
    if (e.key === "Escape") { closeSession(); return; }
    return;
  }
  if (inField) return;
  if ($("#sheet").classList.contains("on")) { if (e.key === "Escape") closeSheet(); return; }
  if (S) {
    if (S.card?.kind === "w" && !S.finished) {
      if (e.key === "Enter" || (e.key === " " && S.answered)) { e.preventDefault(); S.answered ? ACTS.next() : checkWrite(); return; }
      if (e.key === "z" || e.key === "Z" || e.key === "Backspace") { e.preventDefault(); padUndo(); return; }
      if (e.key === "s" || e.key === "S") { showStrokes(); return; }
      if (e.key === "r" || e.key === "R") { replay(); return; }
      if (e.key === "Escape") { closeSession(); return; }
      return;
    }
    if (/^[1-9]$/.test(e.key)) { answer(+e.key - 1); e.preventDefault(); return; }
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); ACTS.next(); return; }
    if (e.key === "r" || e.key === "R") { replay(); return; }
    if (e.key === "Escape") { closeSession(); return; }
    return;
  }
  if (e.key === "Enter" && view === "today") {
    const b = $("#v-today .hero .btn-lg");
    if (b) { e.preventDefault(); b.click(); }
  }
}));

/* Stroke data, like the sound, is fetched after the first screen draws. */
function loadStrokes() {
  if (window.NQ_STROKES) return;
  const el = document.createElement("script");
  el.src = `js/strokes.js?v=${APP_VERSION}`;
  el.async = true;
  el.onload = () => { crumb("strokes loaded"); if (!S) render(); };
  document.head.appendChild(el);
}

function onAudioLoaded() {
  crumb(`audio ${clipCount()} clips`);
  if (!S) render();
}

/* ============================================================
   Boot
   ============================================================ */

/* After every script has run — sprint.js adds its actions to ACTS. */
addEventListener("DOMContentLoaded", guard(() => {
  load();
  applyTheme();
  go("today");
  /* A timeout, not requestAnimationFrame: a tab opened in the background
     runs no frames, and the sound would never start loading. */
  setTimeout(loadAudioBundle, 60);
  setTimeout(loadStrokes, 90);
}));
