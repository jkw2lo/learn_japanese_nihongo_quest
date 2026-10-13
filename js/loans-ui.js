/* Nihongo Quest — 外来語 Loanwords on the Read tab (README → Read → 外来語).

   A card with the rules English follows into katakana (a sheet, each example
   to hear), and a round in the Read overlay: a katakana word you were never
   taught, four English words to choose from — sound it out and pick. After
   each, the rule that explains it. The words come from js/data/loans.js and
   open as their kana are learned; they're worked out, not scheduled. */

const LOAN_N = 10;
const LOAN_MIN = 12;

/* the loanwords whose every kana is learned */
const loanPool = () => LOAN_WORDS.filter(x => kanaUnits(x.k).every(u => isLearned(u)));

function loanCard() {
  const pool = loanPool(), open = pool.length >= LOAN_MIN, r = state.read.loans;
  return `<section class="card rd-rung rd-loans ${open ? "" : "locked"}">
    <div class="rd-rung-head"><span class="rd-n rd-game" lang="ja">外</span><h2><span lang="ja">外来語</span> Loanwords</h2></div>
    <p>A lot of katakana is English in disguise — <span lang="ja">テレビ</span>, <span lang="ja">コンビニ</span>, <span lang="ja">パスワード</span>.
      Ten rules turn it back into English, so you can sound out words nobody taught you.</p>
    ${open ? `<div class="rd-stat">${pool.length} of ${LOAN_WORDS.length} you can sound out${r.best ? ` · best <b>${r.best}</b> of ${LOAN_N}` : ""}</div>` : ""}
    <div class="rd-btns">
      <button class="btn btn-ghost" data-act="ln-rules">The rules</button>
      <button class="btn btn-ghost" data-act="ln-list">All ${LOAN_WORDS.length}</button>
      ${open ? `<button class="btn rd-go" data-act="rd-start" data-r="loans">Work out ${LOAN_N}</button>` : ""}
    </div>
    ${open ? "" : `<p class="muted small">Opens with katakana — then any katakana word is yours to work out.</p>`}
  </section>`;
}

/* The rules, in a sheet: each with its examples, to hear. */
function openLoanRules() {
  loadBundle("loans");
  openSheet(`<div class="ln-rules">
    <div class="eyebrow">外来語 · Loanwords</div>
    <h2>How English becomes katakana</h2>
    <p class="muted">Sound the word out, then think what English it could be. These ten rules are nearly all there is.</p>
    ${LOAN_RULES.map((R, i) => `<section class="ln-rule">
      <h3><span class="ln-n">${i + 1}</span> ${esc(R.title)} <span lang="ja" class="muted">${esc(R.jp)}</span></h3>
      <p>${esc(R.say).replace(/([゠-ヿ]+|[぀-ゟ]+)/g, '<span lang="ja">$1</span>')}</p>
      <div class="chips">${R.ex.map(([k, en]) => `<button class="chip" data-act="say" data-say="${esc(k)}"><b lang="ja">${esc(k)}</b> <small>${esc(en)}</small></button>`).join("")}</div>
    </section>`).join("")}
  </div>`);
}

/* Every loanword, by group, to read down: katakana, romaji, the English (or
   hidden, to test yourself — a tap says the word and shows it). The last
   group is the tricky one: Made in Japan, and not from English at all. */
let loanHide = false;
function openLoanList() {
  loadBundle("loans");
  const item = x => `<button class="ln-item ${loanHide ? "hid" : ""}" data-act="ln-item" data-k="${esc(x.k)}">
    <b lang="ja" ${[...x.k].length >= 7 ? 'class="lg"' : ""}>${esc(x.k)}</b><small class="ln-rom">${esc(toRomaji(x.k))}</small><span class="ln-en">${esc(x.en)}</span></button>`;
  openSheet(`<div class="ln-list">
    <div class="eyebrow">外来語 · Loanwords</div>
    <h2>All ${LOAN_WORDS.length}</h2>
    <p class="muted">Tap one to hear it. Hide the English to test yourself — sound each out, guess, then tap.</p>
    <div class="seg ln-hide"><button class="${loanHide ? "" : "on"}" data-act="ln-hide" data-v="0">Show English</button><button class="${loanHide ? "on" : ""}" data-act="ln-hide" data-v="1">Hide English</button></div>
    ${LOAN_GROUPS.map(g => `<section class="ln-group ${g === "Made in Japan" ? "tricky" : ""}">
      <h3>${esc(g)} <small class="muted">${LOAN_WORDS.filter(x => x.group === g).length}</small></h3>
      ${g === "Made in Japan" ? `<p class="muted small">The tricky ones: they look like English but mean something else, were put together in Japan, or came from another language.</p>` : ""}
      <div class="ln-grid">${LOAN_WORDS.filter(x => x.group === g).map(item).join("")}</div>
    </section>`).join("")}
  </div>`);
}

function loanOpen() {
  const pool = loanPool();
  if (pool.length < LOAN_MIN) return closeRead();
  loadBundle("loans");
  Object.assign(RD, { lines: shuffle([...pool]).slice(0, LOAN_N), n: Math.min(LOAN_N, pool.length), lpool: pool });
  $("#rdStrip").innerHTML = Array.from({ length: RD.n }, (_, i) => `<i data-i="${i}"></i>`).join("");
  rdStep();
}

/* three wrong answers that could pass at a glance: starting with the same
   kana if possible, else about as long */
function loanDecoys(x, pool) {
  const first = kanaUnits(x.k)[0];
  const same = shuffle(pool.filter(y => y !== x && kanaUnits(y.k)[0] === first));
  const near = shuffle(pool.filter(y => y !== x && !same.includes(y) && Math.abs([...y.k].length - [...x.k].length) <= 1));
  const rest = shuffle(pool.filter(y => y !== x && !same.includes(y) && !near.includes(y)));
  return [...same, ...near, ...rest].slice(0, 3);
}

function loanShow() {
  const x = RD.lines[RD.i];
  const opts = shuffle([x, ...loanDecoys(x, RD.lpool)]);
  RD.q = { x, opts, answered: false, t0: performance.now() };
  $("#rdPace").textContent = `${RD.i + 1} of ${RD.n}`;
  $("#rdBody").innerHTML = `<div class="ln-play">
    <p class="muted">Sound it out. What's the English?</p>
    <div class="ln-word" lang="ja">${esc(x.k)}</div>
    <button class="link ln-hear" data-act="ln-hear">${icon("speaker")} hear it</button>
    <div class="opts n4 words ln-opts">${opts.map((o, i) => `<button class="opt" data-act="ln-opt" data-i="${i}"><kbd>${i + 1}</kbd><span>${esc(o.en)}</span></button>`).join("")}</div>
    <div class="verdict ln-why" id="lnWhy" aria-live="polite"></div>
  </div>`;
}

function loanAnswer(i) {
  const q = RD?.q;
  if (!q || q.answered) return;
  q.answered = true;
  const pick = q.opts[i], ok = pick === q.x;
  RD.res[RD.i] = ok ? "ok" : "miss";
  $$(".ln-opts .opt").forEach((b, j) => { b.disabled = true; if (q.opts[j] === q.x) b.classList.add("right"); else if (j === i) b.classList.add("wrong"); });
  const rules = q.x.rules.map(id => LOAN_RULE_BY[id]).filter(Boolean);
  $("#lnWhy").innerHTML = `${ok ? `<span class="v-ok">${icon("check", "v-ico")} <b lang="ja">${esc(q.x.k)}</b> is ${esc(q.x.en)}</span>`
    : `<span class="v-miss">It's <b>${esc(q.x.en)}</b></span>`}
    <div class="ln-because">${rules.map(R => `<span><b>${esc(R.title)}</b></span>`).join(" · ")}</div>`;
  if (state.settings.sound) say(q.x.k);
  rdStrip();
  $("#rdFoot").innerHTML = `<span></span><button class="btn" id="rdNext" data-act="rd-next">Next <kbd>↵</kbd></button>`;
}

Object.assign(ACTS, {
  "ln-rules": () => openLoanRules(),
  "ln-list": () => openLoanList(),
  "ln-hide": el => { loanHide = el.dataset.v === "1"; const y = $("#sheetBody")?.scrollTop || 0; openLoanList(); $("#sheetBody").scrollTop = y; },
  "ln-item": el => { say(el.dataset.k); el.classList.remove("hid"); },
  "ln-opt": el => loanAnswer(+el.dataset.i),
  "ln-hear": () => { if (RD?.q) say(RD.q.x.k); },
});
