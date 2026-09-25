/* Nihongo Quest — words: the lessons, the questions, and the Words tab.

   Word items live in state.words, keyed "w:" + the written form, and go
   through the same grade() / dueKeys() as kana. Skills: r (read it, pick
   the meaning), p (hear it, pick the word), c (see the meaning, type it). */

/* Which kanji the learner knows. None yet — kanji are taught in step 8 —
   so every kanji shows its furigana. */
const knowsKanji = () => false;

const wordHtml = (markup, mode = state.settings.furigana) => furiHtml(markup, knowsKanji, mode);
const learnedWords = () => WORDS.filter(x => isLearned(x.key));
const sayWord = x => say(x.say);

/* ---------- lesson cards ---------- */

function wordLessonCards(L) {
  const cards = [];
  if (L.id === WORD_LESSONS[0].id) cards.push(infoCard(WORDS_INTRO));
  if (L.id.endsWith("-1")) cards.push(infoCard(stageIntro(L.st)));
  L.items.forEach((key, i) => cards.push({ t: "wintro", k: key, L, n: i + 1 }));
  const drill = [];
  L.items.forEach(key => {
    drill.push(() => qWordRead(key, "learn"));
    drill.push(() => qWordHear(key, "learn"));
    drill.push(() => qWordType(key, "learn"));
    if (isVerb(WORD_BY[key].pos)) drill.push(() => qWordConj(key, "learn", "masu"));
  });
  return [...cards, ...shuffle(drill)];
}

function stageIntro(st) {
  const S = WORD_STAGES.find(x => x.st === st);
  const n = WORDS.filter(x => x.st === st).length;
  return {
    eyebrow: `Stage ${st} · ${S.jp}`,
    head: S.en + ".",
    body: `<p>${wordHtml(S.about)}</p><p class="muted">${n} words, five at a time.</p>`,
  };
}

function wordIntroHtml(c) {
  const x = WORD_BY[c.k];
  return `<div class="intro word-intro">
    <div class="eyebrow"><span lang="ja">${esc(c.L.title)}</span> · ${c.n} of ${c.L.items.length}</div>
    <button class="word-xl" lang="ja" data-act="say" data-say="${esc(x.say)}" title="Hear it">${wordHtml(x.w)}</button>
    ${state.settings.showRomaji ? `<div class="intro-rom">${esc(x.r)}</div>` : ""}
    <div class="word-m">${esc(x.m)}</div>
    ${x.note ? `<p class="rule">${wordHtml(x.note)}</p>` : ""}
    ${isVerb(x.pos) ? formsTable(x) : ""}
    ${x.ex.map(([jp, en]) => `<button class="ex-sent" data-act="say" data-say="${esc(furiKana(jp))}">
      <span lang="ja">${wordHtml(jp)}</span><small>${esc(en)}</small></button>`).join("")}
  </div>`;
}

/* A verb's polite forms, each one tappable. */
function formsTable(x) {
  return `<div class="forms">${CONJ_TAUGHT.map(f => {
    const m = conj(x.w, x.pos, f);
    return `<button class="form" data-act="say" data-say="${esc(furiKana(m))}"><span lang="ja">${wordHtml(m)}</span><small>${esc(CONJ_FORMS[f].en)}</small></button>`;
  }).join("")}</div>`;
}

/* ---------- questions ---------- */

/* Three other words as wrong answers: learned ones from the same stage
   first, then learned, then anything — never one with the same meaning or
   the same spelling. */
function otherWords(x, n) {
  const pools = [
    WORDS.filter(y => y.st === x.st && isLearned(y.key)),
    learnedWords(),
    WORDS.filter(y => y.st === x.st),
    WORDS,
  ];
  const out = [], seenM = new Set([x.m]), seenK = new Set([x.kana]);
  for (const pool of pools) for (const y of shuffle([...pool])) {
    if (out.length >= n) return out;
    if (seenM.has(y.m) || seenK.has(y.kana)) continue;
    seenM.add(y.m); seenK.add(y.kana); out.push(y);
  }
  return out;
}

function qWordRead(key, mode) {
  const x = WORD_BY[key];
  const opts = shuffle([x, ...otherWords(x, 3)]);
  return { t: "q", kind: "r", wk: true, k: key, mode, opts: opts.map(y => ({ label: y.m, val: y.key })), answer: key, sound: x.say };
}

function qWordHear(key, mode) {
  if (!hasAudio() || !clipFor(WORD_BY[key].say)) return null;
  const x = WORD_BY[key];
  const opts = shuffle([x, ...otherWords(x, 3)]);
  return { t: "q", kind: "p", wk: true, k: key, mode, opts: opts.map(y => ({ label: y.w, val: y.key, jp: true, furi: true })), answer: key, sound: x.say };
}

function qWordType(key, mode) {
  const x = WORD_BY[key];
  return { t: "q", kind: "c", wk: true, k: key, mode, answer: key, sound: x.say };
}

/* Conjugate: see the verb and a form, type the form. */
function qWordConj(key, mode, form) {
  const x = WORD_BY[key];
  if (!isVerb(x.pos)) return null;
  const f = form || sample(CONJ_TAUGHT, 1)[0];
  const m = conj(x.w, x.pos, f);
  return { t: "q", kind: "j", wk: true, k: key, mode, answer: key, form: f, target: m, sound: furiKana(m) };
}

function wordPrompt(c) {
  const x = WORD_BY[c.k];
  if (c.kind === "r") return `<div class="q-ask">What does this mean?</div><div class="glyph-l word" lang="ja">${wordHtml(x.w)}</div>`;
  if (c.kind === "p") return `<div class="q-ask">Which one did you hear?</div><button class="play" data-act="replay" aria-label="Play again">${icon("speaker")}</button>`;
  return "";
}

/* ---------- typing a word ---------- */

const isKataWord = x => /^[゠-ヿ]+$/.test(x.kana);

function showType(c) {
  const x = WORD_BY[c.k];
  const F = c.kind === "j" ? CONJ_FORMS[c.form] : null;
  $("#sBody").innerHTML = `<div class="q q-c">
    ${F ? `<div class="q-ask">Make it <b>${esc(F.en)}</b> <span lang="ja">(${esc(F.jp)})</span>:</div>
      <div class="type-m conj-verb"><span lang="ja">${wordHtml(x.w)}</span> <small>${esc(x.m)}</small></div>`
    : `<div class="q-ask">Type it in ${isKataWord(x) ? "katakana" : "kana"}:</div>
    <div class="type-m">${esc(x.m)}</div>`}
    <input class="sp-input type-in" id="typeIn" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="romaji — it turns into kana">
    <div class="type-preview" lang="ja" id="typePreview">&nbsp;</div>
    <div class="verdict" id="verdict" aria-live="polite"></div>
  </div>`;
  $("#sFoot").innerHTML = `<button class="btn btn-ghost" data-act="type-hint">Hint</button>
    <button class="btn" data-act="type-check" id="nextBtn">Check <kbd>↵</kbd></button>`;
  const inp = $("#typeIn");
  inp.addEventListener("input", () => {
    $("#typePreview").textContent = romajiToKana(inp.value, c.kind !== "j" && isKataWord(x)) || "\u00a0";
  });
  inp.focus();
  S.hinted = false;
  S.t0 = performance.now();
  startTimer("c");
}

/* Right if the kana match (script and long-vowel spelling don't matter), or
   if the romaji matches the word's own — こんにちは typed konnichiwa. */
function typedRight(x, typed) {
  const kana = romajiToKana(typed, isKataWord(x));
  const flat = t => t.toLowerCase().replace(/[\s'\-]/g, "");
  return kanaSame(kana, x.kana) || flat(typed) === flat(x.r) || flat(typed).replace(/ou/g, "oo") === flat(x.r).replace(/ou/g, "oo");
}

function checkType() {
  const c = S?.card;
  if (!c || (c.kind !== "c" && c.kind !== "j") || S.answered) return;
  const inp = $("#typeIn");
  if (!inp.value.trim()) { toast("Type the romaji first — or ask for a hint."); inp.focus(); return; }
  const x = WORD_BY[c.k];
  const ok = c.kind === "j" ? kanaSame(romajiToKana(inp.value), furiKana(c.target)) : typedRight(x, inp.value);
  settle(c, ok, performance.now() - S.t0, !S.hinted);
  inp.disabled = true;
  const v = $("#verdict");
  v.className = "verdict " + (ok ? "ok" : "miss");
  const shown = c.kind === "j"
    ? `<span lang="ja">${wordHtml(c.target, "always")}</span> <span class="rom-always">${esc(toRomaji(furiKana(c.target)))}</span>`
    : wordVerdict(x);
  v.innerHTML = (ok ? icon("check", "v-ico") + " " : "It's ") + shown + (S.hinted && ok ? ` <span class="muted small">— after a hint, so it's practice this time</span>` : "");
  if (state.settings.autoplay) { if (c.kind === "j") say(furiKana(c.target)); else sayWord(x); }
  const hint = $('[data-act="type-hint"]');
  if (hint) { hint.dataset.act = "replay"; hint.innerHTML = `${icon("speaker")} Again <kbd>R</kbd>`; }
  afterAnswer(ok);
}

function typeHint() {
  const c = S?.card;
  if (!c || (c.kind !== "c" && c.kind !== "j") || S.answered) return;
  const x = WORD_BY[c.k];
  S.hinted = true;
  if (c.kind === "j") {
    $("#typePreview").innerHTML = `<span class="muted">like</span> ${esc(CONJ_FORMS[c.form].ex)} <span class="muted">· ${kanaUnits(furiKana(c.target)).length} kana</span>`;
  } else {
    const first = kanaUnits(x.kana)[0];
    $("#typePreview").innerHTML = `<span class="muted">starts with</span> ${esc(first)}… <span class="muted">· ${kanaUnits(x.kana).length} kana</span>`;
  }
  $("#typeIn").focus();
}

function wordVerdict(x) {
  return `<span lang="ja">${wordHtml(x.w, "always")}</span> <span class="rom-always">${esc(x.r)}</span> · ${esc(x.m)}`;
}

/* ---------- the Words tab ---------- */

let libFilter = "all", libQuery = "";

/* Every word you can read: the stage words you've learned, and every kana
   word whose kana are all yours. It only grows — nothing drops off the
   end the way Today's short list does. */
function libraryEntries() {
  const out = [];
  const seen = new Set();
  learnedWords().forEach(x => {
    seen.add(x.plain);
    out.push({ src: "stage", x, w: x.w, kana: x.kana, m: x.m, r: x.r, set: isKataWord(x) ? "k" : "h", st: x.st });
  });
  KANA_WORDS.filter(canRead).forEach(x => {
    if (seen.has(x.w)) return;
    seen.add(x.w);
    out.push({ src: "kana", x, w: x.w, kana: x.w, m: x.m, r: x.r, set: x.set });
  });
  return out;
}

function renderWords() {
  const el = $("#v-words");
  const all = libraryEntries();
  const q = libQuery.trim().toLowerCase();
  const match = e => !q || [e.kana, furiPlain(e.w), e.r, e.m].some(t => String(t).toLowerCase().includes(q));
  const pass = e => (libFilter === "all" || (libFilter === "learned" ? e.src === "stage" : e.set === libFilter)) && match(e);
  const shown = all.filter(pass);
  const stageN = all.filter(e => e.src === "stage").length;
  const notYet = KANA_WORDS.filter(x => !canRead(x));
  /* the kana that would unlock the most words next */
  const need = {};
  notYet.forEach(x => { const miss = [...new Set(x.units.filter(u => !isLearned(u)))]; if (miss.length === 1) need[miss[0]] = (need[miss[0]] || 0) + 1; });
  const topNeed = Object.entries(need).sort((a, b) => b[1] - a[1]).slice(0, 6);

  /* Tapping a word just says it; the chevron opens its card. */
  const row = e => `<li><button class="lib-row" data-act="say" data-say="${esc(e.src === "stage" ? e.x.say : e.w)}" title="Hear it">
    <span class="lib-jp" lang="ja">${wordHtml(e.w)}</span>
    ${state.settings.showRomaji ? `<span class="lib-rom">${esc(e.r)}</span>` : ""}
    <span class="lib-m">${esc(e.m)}</span>
    ${e.src === "stage" ? `<span class="lib-st" title="Stage ${e.st}">${e.st}</span>` : ""}
  </button><button class="more" data-act="lib-open" data-src="${e.src}" data-w="${esc(e.src === "stage" ? e.x.key : e.w)}" aria-label="Details">${icon("chevron")}</button></li>`;

  const groups = [];
  WORD_STAGES.forEach(S => {
    const es = shown.filter(e => e.src === "stage" && e.st === S.st);
    if (es.length) groups.push(`<section class="card"><div class="card-head"><h2><span lang="ja">${S.jp}</span> ${esc(S.en)}</h2>
      <span class="count">stage ${S.st} · ${es.length}</span></div><ul class="lib">${es.map(row).join("")}</ul></section>`);
  });
  const kanaEs = shown.filter(e => e.src === "kana");
  if (kanaEs.length) {
    const when = e => e.x.units.map(u => item(u)?.at || "").sort().pop();
    kanaEs.sort((a, b) => when(b).localeCompare(when(a)));
    groups.push(`<section class="card"><div class="card-head"><h2>Spelled in kana</h2>
      <span class="count">${kanaEs.length} · newest first</span></div><ul class="lib">${kanaEs.map(row).join("")}</ul></section>`);
  }

  el.innerHTML = `
    <div class="chart-head">
      <div class="seg">
        ${[["all", "All"], ["learned", "Learned"], ["h", "ひらがな"], ["k", "カタカナ"]].map(([f, t]) =>
          `<button class="${libFilter === f ? "on" : ""}" data-act="lib-filter" data-f="${f}" ${f === "learned" && !stageN ? "disabled" : ""}><span lang="ja">${t}</span></button>`).join("")}
      </div>
      <input class="lib-search" id="libSearch" type="search" placeholder="Search kana, romaji or English" value="${esc(libQuery)}">
      <span class="muted">${all.length} word${all.length === 1 ? "" : "s"} you can read${stageN ? ` · ${stageN} learned` : ""} · tap to hear, › for the card</span>
    </div>
    ${!all.length ? `<section class="card empty">${neko("think", "mini")}<p>Words appear here as soon as you know every kana in one — <span lang="ja">いえ</span> (house)
      needs just the first row. Every word stays here once it arrives; this is the whole list, not just today's.</p></section>` : ""}
    ${groups.join("") || (all.length ? `<section class="card"><p class="muted">Nothing matches that.</p></section>` : "")}
    ${notYet.length ? `<section class="card not-yet"><div class="card-head"><h2>Coming up</h2><span class="count">${notYet.length} more kana words</span></div>
      ${topNeed.length ? `<p class="small">One kana away:</p><div class="chips">${topNeed.map(([k, n]) =>
        `<button class="chip" lang="ja" data-act="kana-cell" data-k="${esc(k)}">${esc(k)} <small>+${n}</small></button>`).join("")}</div>` : ""}
    </section>` : ""}
    ${phase() === "words" || phase() === "done" ? "" : `<p class="muted small">Stage words — phrases, numbers, food and more — start once every kana is learned.</p>`}`;

  const inp = $("#libSearch");
  inp.addEventListener("input", () => {
    libQuery = inp.value;
    const pos = inp.selectionStart;
    renderWords();
    const again = $("#libSearch");
    again.focus();
    again.setSelectionRange(pos, pos);
  });
}

function openLibWord(src, w) {
  if (src === "stage") {
    const x = WORD_BY[w];
    sayWord(x);
    const sk = s => { const v = skill(x.key, s); return `${Math.min(3, v.fast)}/3 quick · ${v.ok} of ${v.n} right`; };
    openSheet(`<div class="kana-detail word-detail">
      <button class="word-xl" lang="ja" data-act="say" data-say="${esc(x.say)}">${wordHtml(x.w)}</button>
      <div class="intro-rom">${esc(x.r)}</div>
      <div class="word-m">${esc(x.m)}</div>
      ${x.note ? `<p class="rule">${wordHtml(x.note)}</p>` : ""}
      ${x.ex.map(([jp, en]) => `<button class="ex-sent" data-act="say" data-say="${esc(furiKana(jp))}"><span lang="ja">${wordHtml(jp)}</span><small>${esc(en)}</small></button>`).join("")}
      <div class="sk-rows"><div><span lang="ja">読む</span> ${sk("r")}</div>${hasAudio() ? `<div><span lang="ja">聞く</span> ${sk("p")}</div>` : ""}<div><span lang="ja">打つ</span> ${sk("c")}</div></div>
      <p class="muted small">Stage ${x.st} · learned ${esc(item(x.key).at)} · next review ${esc(item(x.key).due)}</p>
    </div>`);
    return;
  }
  const x = KANA_WORDS.find(y => y.w === w);
  if (!x) return;
  say(x.w);
  openSheet(`<div class="kana-detail word-detail">
    <button class="word-xl" lang="ja" data-act="say" data-say="${esc(x.w)}">${esc(x.w)}</button>
    <div class="intro-rom">${esc(x.r)}</div>
    <div class="word-m">${esc(x.m)}</div>
    ${x.note ? `<p class="rule">${esc(x.note)}</p>` : ""}
    <div class="ex-row">${x.units.map(u => `<button class="ex" data-act="kana-cell" data-k="${esc(u)}"><span lang="ja">${esc(u)}</span><small>${esc(KANA_BY[u]?.r || "")}</small></button>`).join("")}</div>
  </div>`);
}

/* The second audio bundle — every stage word and example sentence — is
   fetched only once words are open. */
function loadAudioN5() {
  if (loadAudioN5.done || !wordsOpen()) return;
  loadAudioN5.done = true;
  const el = document.createElement("script");
  el.src = `js/audio-n5.js?v=${APP_VERSION}`;
  el.async = true;
  el.onload = () => { if (!S) render(); };
  document.head.appendChild(el);
}

Object.assign(ACTS, {
  "lib-filter": el => { libFilter = el.dataset.f; renderWords(); },
  "lib-open": el => openLibWord(el.dataset.src, el.dataset.w),
  "type-check": () => checkType(),
  "type-hint": () => typeHint(),
});
