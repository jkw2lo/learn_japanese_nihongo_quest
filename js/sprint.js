/* Nihongo Quest — スプリント Sprint: timed sheets.

   Lifted from Hanzi Quest's 速练 ("minute math, for characters"):
   - a fixed number of questions in a fixed number of minutes
   - nothing is marked while you work; the colours arrive when you hand in
   - the sheet is built before the clock starts
   - a miss never touches the review schedule — grade(..., "speed") gives
     credit for a right answer and sends a wrong one to the mistake notebook
   - kana are dealt from a shuffled deck, not drawn at random */

const SPRINT_MODES = {
  read:   { jp: "読む", en: "Read",   sk: "r", par: 1.5, what: "See a kana, pick its sound." },
  listen: { jp: "聞く", en: "Listen", sk: "p", par: 2.5, what: "Hear a sound, pick its kana." },
  type:   { jp: "打つ", en: "Type",   sk: "r", par: 2.5, what: "See a kana, type its romaji." },
};
const SPRINT_COUNTS = [20, 40, 60, 100];
const SPRINT_MINS = [1, 2, 3, 5];
const SPRINT_SETS = { h: "ひらがな", k: "カタカナ", hk: "both" };
/* A sheet that would loop through the pool more than this many times is
   offered disabled rather than run: it would be the same five kana forever. */
const SPRINT_MAX_LOOPS = 6;

const GRADES = [
  [0.6, "神", "Blazing"], [0.8, "疾", "Fast"], [1.0, "速", "Quick"], [1.3, "並", "Even"], [Infinity, "緩", "Steady"],
];

let pick = null;        /* the sheet being set up */
let SP = null;          /* the sheet being run */

function sprintPick() {
  if (!pick) pick = { mode: "read", set: "h", count: 40, mins: 2, ...(state.sprint.pick || {}) };
  return pick;
}

const sprintKeyOf = p => `${p.mode}-${p.set}-${p.count}-${p.mins}`;
function sprintLabel(key) {
  const [mode, set, count, mins] = key.split("-");
  const m = SPRINT_MODES[mode];
  return `${m ? m.jp + " " + m.en : mode} · ${SPRINT_SETS[set] || set} · ${count} in ${mins} min`;
}

function sprintPool(set) {
  return KANA.filter(e => !e.concept && set.includes(e.set) && isLearned(e.k)).map(e => e.k);
}

function renderSprint() {
  const el = $("#v-sprint");
  const p = sprintPick();
  if (p.mode === "listen" && !hasAudio()) p.mode = "read";
  const pool = sprintPool(p.set);
  const seg = (field, opts, label = x => x, disabled = () => false) =>
    `<div class="seg">${opts.map(o => `<button class="${p[field] === o ? "on" : ""}" data-act="sp-pick" data-f="${field}" data-v="${o}" ${disabled(o) ? "disabled" : ""}>${label(o)}</button>`).join("")}</div>`;
  const best = state.sprint.best[sprintKeyOf(p)];
  const bests = Object.entries(state.sprint.best).sort((a, b) => b[1].at.localeCompare(a[1].at)).slice(0, 6);
  const recent = asList(state.sprint.recent).slice(0, 10);
  const tooFew = pool.length < 4;
  const par = SPRINT_MODES[p.mode].par;

  el.innerHTML = `<div class="sprint-grid">
    <section class="card">
      <div class="eyebrow">スプリント · Sprint</div>
      <h1>Minute math, for kana.</h1>
      <p class="lede">A fixed number in a fixed time. Nothing is marked until you hand in. First: did you finish? Then: how many were right?
        Misses never change your reviews — they go to the mistake notebook.</p>
      <div class="pick"><span class="pick-l">Mode</span>${seg("mode", Object.keys(SPRINT_MODES), m => `<span lang="ja">${SPRINT_MODES[m].jp}</span> ${SPRINT_MODES[m].en}`, m => m === "listen" && !hasAudio())}</div>
      <p class="muted small">${esc(SPRINT_MODES[p.mode].what)} Par is ${par}s a question.</p>
      <div class="pick"><span class="pick-l">Kana</span>${seg("set", Object.keys(SPRINT_SETS), s => `<span lang="ja">${SPRINT_SETS[s]}</span>`, s => sprintPool(s).length < 4)}</div>
      <div class="pick"><span class="pick-l">Questions</span>${seg("count", SPRINT_COUNTS, x => x, c => c > pool.length * SPRINT_MAX_LOOPS)}</div>
      <div class="pick"><span class="pick-l">Minutes</span>${seg("mins", SPRINT_MINS)}</div>
      ${tooFew ? `<p class="warn">Learn a few more kana first — a sheet needs at least four to choose from.</p>`
        : p.count > pool.length * SPRINT_MAX_LOOPS ? `<p class="warn">That's more questions than ${pool.length} kana can fill sensibly — pick fewer.</p>`
        : `<button class="btn btn-lg cta" data-act="sp-start">Start the sheet <kbd>↵</kbd></button>`}
      <p class="muted small">${best ? `Best on this sheet: <b>${best.right}/${best.total}</b> in ${(best.ms / 1000).toFixed(1)}s (${esc(best.at)}).` : "No run on this sheet yet."}</p>
    </section>
    <aside>
      <section class="card">
        <div class="card-head"><h2>Bests</h2><span class="count">one per sheet</span></div>
        ${bests.length ? `<ul class="plain">${bests.map(([k, b]) => `<li>${esc(sprintLabel(k))}<br><b>${b.right}/${b.total}</b> · ${(b.ms / 1000).toFixed(1)}s <small class="muted">${esc(b.at)}</small></li>`).join("")}</ul>`
          : `<p class="muted small">Every sheet — mode, kana, count and minutes — keeps its own best. 40 in two minutes and 100 in two minutes aren't the same test.</p>`}
      </section>
      ${recent.length ? `<section class="card"><div class="card-head"><h2>Latest</h2></div>
        <ul class="plain">${recent.map(r => `<li>${esc(sprintLabel(r.key))} — ${r.right}/${r.total}${r.finished ? "" : " (time ran out)"}</li>`).join("")}</ul></section>` : ""}
    </aside>
  </div>`;
}

/* ---------- building the sheet ---------- */

function dealSheet(pool, n) {
  const out = [];
  let deck = [];
  while (out.length < n) {
    if (!deck.length) {
      deck = shuffle([...pool]);
      /* don't let the seam repeat the last one */
      if (out.length && deck[0] === out[out.length - 1] && deck.length > 1) [deck[0], deck[1]] = [deck[1], deck[0]];
    }
    out.push(deck.shift());
  }
  return out;
}

function buildSprintQ(k, mode) {
  if (mode === "read") return { k, opts: shuffle([k, ...distractors(k, 3, "r")]).map(x => ({ label: KANA_BY[x].r, val: x })) };
  if (mode === "listen") return { k, opts: shuffle([k, ...distractors(k, 3, "say")]).map(x => ({ label: x, val: x, jp: true })) };
  return { k };
}

function startSprint() {
  const p = sprintPick();
  state.sprint.pick = { ...p }; save();
  const pool = sprintPool(p.set);
  if (pool.length < 4) return;
  const qs = dealSheet(pool, p.count).map(k => buildSprintQ(k, p.mode));
  SP = { ...p, key: sprintKeyOf(p), qs, i: 0, ans: [], t0: 0, tq: 0, limit: p.mins * 60000, timer: null, done: false };
  crumb(`sprint ${SP.key}`);
  $("#sprint").classList.add("on");
  document.body.style.overflow = "hidden";
  countdown(3);
}

function countdown(n) {
  $("#spStrip").innerHTML = "";
  $("#spClock").textContent = fmtClock(SP.limit);
  $("#spBody").innerHTML = `<div class="sp-ready"><div class="eyebrow">用意 · Ready</div><div class="sp-count">${n}</div>
    <div class="muted">${esc(sprintLabel(SP.key))}</div></div>`;
  if (n > 1) SP.cd = setTimeout(() => countdown(n - 1), 800);
  else SP.cd = setTimeout(beginSprint, 800);
}

function beginSprint() {
  if (!SP) return;
  SP.t0 = performance.now();
  $("#spStrip").innerHTML = SP.qs.map((_, i) => `<i data-i="${i}"></i>`).join("");
  SP.timer = setInterval(tickSprint, 200);
  showSprintQ();
}

const fmtClock = ms => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${pad2(s % 60)}`; };

function tickSprint() {
  const left = SP.limit - (performance.now() - SP.t0);
  $("#spClock").textContent = fmtClock(left);
  $("#spClock").classList.toggle("low", left < 10000);
  if (left <= 0) handIn(false);
}

function showSprintQ() {
  const q = SP.qs[SP.i];
  $$("#spStrip i").forEach((el, i) => { el.className = i < SP.i ? "done" : i === SP.i ? "now" : ""; });
  SP.tq = performance.now();
  const body = $("#spBody");
  if (SP.mode === "type") {
    body.innerHTML = `<div class="q sp-q"><div class="glyph-l" lang="ja">${esc(q.k)}</div>
      <input class="sp-input" id="spInput" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" placeholder="romaji, then Enter">
      <div class="muted small">Enter hands it in · an empty Enter skips</div></div>`;
    $("#spInput").focus();
    return;
  }
  body.innerHTML = `<div class="q sp-q">
    ${SP.mode === "read" ? `<div class="glyph-l" lang="ja">${esc(q.k)}</div>` : `<button class="play" data-act="sp-replay" aria-label="Play again">${icon("speaker")}</button>`}
    <div class="opts n${q.opts.length}">${q.opts.map((o, i) => `<button class="opt ${o.jp ? "jp" : ""}" data-act="sp-opt" data-i="${i}" ${o.jp ? 'lang="ja"' : ""}><kbd>${i + 1}</kbd><span>${esc(o.label)}</span></button>`).join("")}</div>
  </div>`;
  if (SP.mode === "listen") sayKana(q.k);
}

function sprintAnswer(val) {
  if (!SP || SP.done || !SP.t0) return;
  const q = SP.qs[SP.i];
  const e = KANA_BY[q.k];
  let ok;
  if (SP.mode === "type") {
    const t = String(val).trim().toLowerCase().replace(/[^a-z']/g, "");
    ok = t === e.r || (ROMAJI_ALT[e.r] || []).includes(t);
    val = t;
  } else ok = val === q.k;
  SP.ans[SP.i] = { val, ok, ms: performance.now() - SP.tq };
  SP.i++;
  if (SP.i >= SP.qs.length) handIn(true); else showSprintQ();
}

function handIn(finished) {
  if (!SP || SP.done) return;
  SP.done = true;
  clearInterval(SP.timer);
  const ms = Math.min(SP.limit, performance.now() - SP.t0);
  const sk = SPRINT_MODES[SP.mode].sk;
  SP.ans.forEach((a, i) => { if (a) grade(SP.qs[i].k, sk, a.ok, a.ms, "speed"); });
  const right = SP.ans.filter(a => a && a.ok).length;
  const total = SP.qs.length;
  const res = { right, total, ms: Math.round(ms), finished };
  const newBest = recordSprint(SP.key, res);
  save();
  crumb(`sprint done ${right}/${total}${finished ? "" : " timeout"}`);

  const perQ = ms / 1000 / total / SPRINT_MODES[SP.mode].par;
  const g = GRADES.find(([lim]) => perQ <= lim);
  $$("#spStrip i").forEach((el, i) => { el.className = SP.ans[i] ? (SP.ans[i].ok ? "ok" : "miss") : "skip"; });
  $("#spBody").innerHTML = `<div class="finish sp-finish">
    <div class="celebrate">${neko(!finished ? "think" : newBest ? "cheer" : "happy", "hop")}${newBest ? stamp("新記録") : ""}</div>
    ${finished
      ? `<div class="grade"><span lang="ja">${g[1]}</span><small>${g[2]}</small></div>
         <div class="muted">Finished in ${(ms / 1000).toFixed(1)}s of ${SP.mins * 60} · ${(ms / 1000 / total).toFixed(2)}s a question (par ${SPRINT_MODES[SP.mode].par})</div>`
      : `<div class="grade miss"><span lang="ja">時間</span><small>Time ran out</small></div>
         <div class="muted">${SP.ans.filter(Boolean).length} of ${total} answered. Fewer questions or more minutes next time — finishing comes first.</div>`}
    <div class="finish-big">${right}<small>/${total}</small></div>
    ${newBest ? `<div class="badge-best">New best on this sheet</div>` : ""}
    <div class="sp-review">${SP.qs.map((q, i) => {
      const a = SP.ans[i];
      const cls = a ? (a.ok ? "ok" : "miss") : "skip";
      return `<span class="${cls}" title="${a && !a.ok ? "you: " + esc(SP.mode === "listen" ? a.val : a.val || "(blank)") : ""}"><b lang="ja">${esc(q.k)}</b><small>${esc(KANA_BY[q.k].r)}</small></span>`;
    }).join("")}</div>
  </div>`;
  if (newBest) petals($("#sprint"), 24);
  $("#spFoot").innerHTML = `<button class="btn btn-ghost" data-act="sp-close">Done <kbd>Esc</kbd></button>
    <button class="btn" data-act="sp-again">Same sheet again <kbd>↵</kbd></button>`;
}

async function closeSprint() {
  if (!SP) return;
  if (!SP.done && SP.t0 && SP.i > 0) {
    const yes = await askConfirm({ k: "やめる", title: "Give up this sheet?", body: "It won't be marked or recorded.", yes: "Give up", no: "Keep going" });
    if (!yes) { if (SP.mode === "type") $("#spInput")?.focus(); return; }
  }
  clearTimeout(SP.cd); clearInterval(SP.timer);
  SP = null;
  $("#sprint").classList.remove("on");
  $("#spFoot").innerHTML = "";
  document.body.style.overflow = "";
  render();
}

/* Keys while a sheet is up. Returns true if it took the key. */
function sprintKey(e) {
  if (!SP) {
    if (view === "sprint" && !S && e.key === "Enter" && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)
        && !$("#sheet").classList.contains("on")) {
      const b = $('[data-act="sp-start"]'); if (b) { e.preventDefault(); b.click(); return true; }
    }
    return false;
  }
  if (e.key === "Escape") { e.preventDefault(); closeSprint(); return true; }
  if (SP.done) {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); againSprint(); }
    return true;
  }
  if (SP.mode === "type") {
    if (e.key === "Enter" && e.target.id === "spInput") { e.preventDefault(); sprintAnswer(e.target.value); }
    return true;
  }
  if (/^[1-9]$/.test(e.key)) {
    const q = SP.qs[SP.i];
    const o = q?.opts?.[+e.key - 1];
    if (o) sprintAnswer(o.val);
    e.preventDefault();
    return true;
  }
  if ((e.key === "r" || e.key === "R") && SP.mode === "listen") { sayKana(SP.qs[SP.i].k); return true; }
  return true;
}

function againSprint() {
  clearTimeout(SP?.cd); clearInterval(SP?.timer);
  SP = null;
  $("#spFoot").innerHTML = "";
  startSprint();
}

Object.assign(ACTS, {
  "sp-pick": el => {
    const p = sprintPick();
    const f = el.dataset.f;
    p[f] = f === "count" || f === "mins" ? +el.dataset.v : el.dataset.v;
    const pool = sprintPool(p.set);
    if (p.count > pool.length * SPRINT_MAX_LOOPS) p.count = SPRINT_COUNTS.filter(c => c <= pool.length * SPRINT_MAX_LOOPS).pop() || 20;
    state.sprint.pick = { ...p }; save();
    renderSprint();
  },
  "sp-start": () => startSprint(),
  "sp-opt": el => { const q = SP?.qs[SP.i]; if (q) sprintAnswer(q.opts[+el.dataset.i].val); },
  "sp-replay": () => { if (SP) sayKana(SP.qs[SP.i].k); },
  "sp-close": () => closeSprint(),
  "sp-again": () => againSprint(),
});
