/* Nihongo Quest — keeping score, and making a fuss about it.

   - milestones: a badge for every step worth marking, a celebration the
     moment one is reached, and the collection in Record
   - the dashboard in Record: streaks, time spent, accuracy, two small charts
     and when N5 will be done at this pace
   - encouragement: a line on every finish screen, and a pill in a session
     for every run of right answers

   Charts follow the dataviz rules: one series each, so one hue (jade) and
   no legend; thin marks with rounded data-ends; a tooltip on hover; the
   title says what it is. */

/* ---------- milestones ---------- */

const allWordsLearned = () => WORDS.every(x => isLearned(x.key));
const kanjiN = () => Object.keys(state.kanji).length;
const wordsN = () => Object.keys(state.words).length;
const hours = () => totalMs() / 3600000;

/* [id, badge text, name, what it took, test, progress-for-locked] */
const MILESTONES = [
  ["kana-1", "あ", "First step", "Your very first kana.", () => Object.keys(state.items).length >= 1],
  ["kana-25", "25", "Getting the shapes", "25 kana learned.", () => Object.keys(state.items).length >= 25, () => [Object.keys(state.items).length, 25]],
  ["hira-all", "ひ", "Hiragana, all of it", "Every hiragana learned.", allHiraLearned],
  ["check", "合", "Passed the check", "Hiragana stuck — katakana opened.", () => !!state.kataOpen],
  ["kana-all", "カ", "Every kana", "All of hiragana and katakana.", allKanaLearned],
  ["words-10", "10", "First words", "10 words learned.", () => wordsN() >= 10, () => [wordsN(), 10]],
  ["words-50", "50", "Fifty words", "50 words learned.", () => wordsN() >= 50, () => [wordsN(), 50]],
  ["words-100", "百", "A hundred words", "100 words learned.", () => wordsN() >= 100, () => [wordsN(), 100]],
  ["words-200", "200", "Two hundred words", "200 words learned.", () => wordsN() >= 200, () => [wordsN(), 200]],
  ["kanji-1", "字", "First kanji", "Your first kanji.", () => kanjiN() >= 1],
  ["kanji-25", "25", "Twenty-five kanji", "25 kanji learned.", () => kanjiN() >= 25, () => [kanjiN(), 25]],
  ["kanji-50", "50", "Fifty kanji", "50 kanji learned.", () => kanjiN() >= 50, () => [kanjiN(), 50]],
  ["kanji-100", "百", "A hundred kanji", "100 kanji learned.", () => kanjiN() >= 100, () => [kanjiN(), 100]],
  ["patterns-10", "文", "Ten patterns", "10 grammar patterns.", () => Object.keys(state.patterns).length >= 10, () => [Object.keys(state.patterns).length, 10]],
  ["streak-3", "3", "Three days running", "A 3-day streak.", () => bestStreak() >= 3, () => [bestStreak(), 3]],
  ["streak-7", "7", "A whole week", "A 7-day streak.", () => bestStreak() >= 7, () => [bestStreak(), 7]],
  ["streak-14", "14", "Two weeks", "A 14-day streak.", () => bestStreak() >= 14, () => [bestStreak(), 14]],
  ["streak-30", "30", "A month of it", "A 30-day streak.", () => bestStreak() >= 30, () => [bestStreak(), 30]],
  ["streak-50", "50", "Fifty days", "A 50-day streak.", () => bestStreak() >= 50, () => [bestStreak(), 50]],
  ["streak-100", "百", "A hundred days", "A 100-day streak.", () => bestStreak() >= 100, () => [bestStreak(), 100]],
  ["time-1", "1h", "An hour in", "One hour of study.", () => hours() >= 1, () => [Math.floor(hours() * 60), 60]],
  ["time-5", "5h", "Five hours", "Five hours of study.", () => hours() >= 5, () => [Math.floor(hours()), 5]],
  ["time-10", "10h", "Ten hours", "Ten hours of study.", () => hours() >= 10, () => [Math.floor(hours()), 10]],
  ["time-25", "25h", "Twenty-five hours", "25 hours of study.", () => hours() >= 25, () => [Math.floor(hours()), 25]],
  ["answers-500", "500", "Five hundred answers", "500 questions answered.", () => totalAnswers() >= 500, () => [totalAnswers(), 500]],
  ["answers-2000", "2k", "Two thousand answers", "2,000 questions answered.", () => totalAnswers() >= 2000, () => [totalAnswers(), 2000]],
  ["answers-5000", "5k", "Five thousand answers", "5,000 questions answered.", () => totalAnswers() >= 5000, () => [totalAnswers(), 5000]],
  ["order-1", "注", "First order", "Took your first order at the café.", () => state.menu.orders >= 1],
  ["order-10", "10", "Regular", "Ten orders taken.", () => state.menu.orders >= 10, () => [state.menu.orders, 10]],
  ["sprint-1", "速", "Off the blocks", "Finished your first sprint.", () => Object.keys(state.sprint.best).length >= 1],
  ["perfect", "満", "Flawless", "A round of 15 or more, every answer right first time.", () => !!state.perfectRound],
  ["n5-words", "全", "Every N5 word", "All the words in the course.", allWordsLearned],
  ["n5-done", "N5", "N5 complete", "Every kana, word, pattern and kanji.", () => phase() === "done" && KANJI.every(k => isLearned(k.key))],
].map(([id, badge, name, took, test, prog]) => ({ id, badge, name, took, test, prog }));

/* Mark anything newly reached and return it — the caller celebrates. */
function checkMilestones() {
  const fresh = MILESTONES.filter(m => !state.milestones[m.id] && m.test());
  fresh.forEach(m => { state.milestones[m.id] = today(); });
  if (fresh.length) { save(); crumb(`milestones ${fresh.map(m => m.id).join(",")}`); }
  return fresh;
}

/* A round medal on a ribbon: the badge text in the middle. */
function medal(text, earned = true, cls = "") {
  const long = [...text].length > 2;
  return `<svg class="medal ${earned ? "" : "locked"} ${cls}" viewBox="0 0 80 96" aria-hidden="true">
    <path class="md-rib a" d="M26 52 L16 92 L28 84 L36 94 L42 56z"/>
    <path class="md-rib b" d="M54 52 L64 92 L52 84 L44 94 L38 56z"/>
    <circle class="md-ring" cx="40" cy="36" r="31"/>
    <circle class="md-face" cx="40" cy="36" r="24"/>
    <text class="md-text ${long ? "long" : ""}" x="40" y="${long ? 42 : 45}" text-anchor="middle" lang="ja">${esc(text)}</text>
  </svg>`;
}

/* The celebration: a card over everything, the cat, the medals, petals. */
function celebrate(ms) {
  if (!ms.length) return;
  const el = document.createElement("div");
  el.className = "ms-pop";
  /* the headline is the biggest thing reached, the rest ride along */
  const RANK = ["n5-done", "n5-words", "kana-all", "check", "hira-all", "kanji-100", "words-200", "streak-100", "words-100",
    "streak-50", "kanji-50", "streak-30", "words-50", "time-25", "kanji-25", "streak-14", "time-10", "perfect", "streak-7"];
  const big = RANK.map(id => ms.find(m => m.id === id)).find(Boolean) || ms[ms.length - 1];
  el.innerHTML = `<div class="ms-veil" data-act="ms-close"></div>
    <div class="ms-card" role="dialog" aria-modal="true" aria-label="Milestone">
      <div class="eyebrow">記念 · Milestone${ms.length > 1 ? "s" : ""}!</div>
      <div class="ms-top">${neko("cheer", "hop")}${medal(big.badge, true, "ms-big")}</div>
      <h2>${esc(big.name)}</h2>
      <p class="lede">${esc(big.took)}</p>
      ${ms.length > 1 ? `<div class="ms-more">${ms.filter(m => m !== big).map(m => `<div>${medal(m.badge, true, "mini")}<span>${esc(m.name)}</span></div>`).join("")}</div>` : ""}
      <p class="ms-cheer" lang="ja">${esc(sample(["おめでとう！ Congratulations!", "すごい！ Amazing!", "やったね！ You did it!"], 1)[0])}</p>
      <button class="btn" data-act="ms-close">Keep going</button>
    </div>`;
  document.body.appendChild(el);
  petals(el, 36);
  el.querySelector(".btn").focus();
}

/* Check, and celebrate what's new — at a natural pause, never mid-question. */
function milestoneCheckpoint() {
  const fresh = checkMilestones();
  if (fresh.length) setTimeout(() => celebrate(fresh), 250);
}

/* ---------- encouragement ---------- */

const CHEERS = {
  perfect: [["完璧！", "Flawless."], ["天才！", "Genius."], ["すごすぎ！", "That was something."]],
  high: [["すごい！", "Brilliant."], ["いいね！", "Nicely done."], ["その調子！", "Keep that up."], ["上手！", "You're getting good at this."]],
  mid: [["いいね！", "Good work."], ["がんばったね！", "You put the work in."], ["もう少し！", "Nearly there."]],
  low: [["大丈夫！", "Every miss is one you'll remember."], ["がんばって！", "You've got this."], ["ドンマイ！", "Don't mind it — go again."]],
};
function cheerLine(acc, n) {
  const pool = n >= 5 && acc === 1 ? CHEERS.perfect : acc >= 0.9 ? CHEERS.high : acc >= 0.6 ? CHEERS.mid : CHEERS.low;
  const [jp, en] = sample(pool, 1)[0];
  return `<div class="cheer"><b lang="ja">${esc(jp)}</b> ${esc(en)}</div>`;
}

/* A run of right answers in a session: a little pill at 5, 10, 20… */
const COMBO_AT = { 5: ["いいね！", "5 in a row"], 10: ["すごい！", "10 in a row"], 20: ["天才！", "20 in a row"], 30: ["神！", "30 in a row"] };
function comboPill(n) {
  const c = COMBO_AT[n];
  if (!c) return;
  const host = $("#session");
  host.querySelector(".combo")?.remove();
  const el = document.createElement("div");
  el.className = "combo";
  el.innerHTML = `${icon("sparkle")} <b lang="ja">${esc(c[0])}</b> ${esc(c[1])}`;
  host.appendChild(el);
  setTimeout(() => el.remove(), 1900);
}

/* ---------- the dashboard ---------- */

const fmtMin = ms => { const m = Math.round(ms / 60000); return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`; };

function weekAccuracy() {
  let g = 0, r = 0;
  for (let i = 0; i < 7; i++) { const d = state.days[addDays(today(), -i)]; if (d) { g += d.g || 0; r += d.right || 0; } }
  return g ? r / g : null;
}

/* When N5 will be done at the last fortnight's pace. */
function n5Projection() {
  const total = KANA.length + WORDS.length + PATTERNS.length + KANJI.length;
  const done = learnedCount();
  let recent = 0;
  for (let i = 0; i < 14; i++) recent += (state.days[addDays(today(), -i)]?.learned || []).length;
  const perDay = recent / 14;
  const left = total - done;
  return { total, done, pct: done / total, perDay, days: perDay > 0 ? Math.ceil(left / perDay) : null };
}

function statsTilesHtml() {
  const p = n5Projection();
  const acc = weekAccuracy();
  const tile = (big, label, sub = "") => `<div class="stat"><b>${big}</b><span>${label}</span>${sub ? `<small>${sub}</small>` : ""}</div>`;
  let week = 0; for (let i = 0; i < 7; i++) week += msOn(addDays(today(), -i));
  return `<div class="stats stats-wide">
    ${tile(`${icon("flame", "st-ico")}${streak()}`, "day streak", `best ${bestStreak()}`)}
    ${tile(fmtMin(msOn(today())), "today", `${fmtMin(week)} this week`)}
    ${tile(fmtMin(totalMs()), "studied in all", `${practisedDays()} days`)}
    ${tile(totalAnswers().toLocaleString("en-US"), "answers", acc == null ? "" : `${Math.round(acc * 100)}% right this week`)}
    ${tile(`${Math.round(p.pct * 100)}%`, "of N5", p.days ? `done in ~${p.days} days at this pace` : `${p.done} of ${p.total} things`)}
  </div>`;
}

/* Minutes a day for the last fortnight: bars, jade, today outlined. */
function minutesChartHtml() {
  const days = Array.from({ length: 14 }, (_, i) => addDays(today(), i - 13));
  const vals = days.map(k => msOn(k) / 60000);
  const max = Math.max(10, ...vals);
  const W = 560, H = 150, pad = 26, bw = (W - pad) / 14;
  const bars = days.map((k, i) => {
    const h = Math.max(vals[i] > 0 ? 3 : 0, (vals[i] / max) * (H - 30));
    const x = pad + i * bw + 3, y = H - 18 - h;
    const d = new Date(k + "T12:00");
    return `<g class="bar-hit" data-tip="${esc(d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }))} · ${Math.round(vals[i])} min">
      <rect class="hit" x="${x - 2}" y="0" width="${bw - 2}" height="${H - 18}"/>
      ${h ? `<path class="bar ${k === today() ? "now" : ""}" d="M${x} ${H - 18} V${y + 4} a4 4 0 0 1 4 -4 H${x + bw - 10} a4 4 0 0 1 4 4 V${H - 18} Z"/>` : ""}
      ${i % 2 === 1 || i === 13 ? `<text class="ax" x="${x + (bw - 6) / 2}" y="${H - 4}" text-anchor="middle">${i === 13 ? "today" : d.getDate()}</text>` : ""}
    </g>`;
  }).join("");
  const grid = [0.5, 1].map(f => `<line class="grid" x1="${pad}" x2="${W}" y1="${H - 18 - f * (H - 30)}" y2="${H - 18 - f * (H - 30)}"/>
    <text class="ax" x="${pad - 4}" y="${H - 14 - f * (H - 30)}" text-anchor="end">${Math.round(max * f)}</text>`).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Minutes studied each day, last 14 days">${grid}${bars}</svg>`;
}

/* Everything learned, added up day by day since the start. */
function learnedChartHtml() {
  const start = Object.keys(state.days).sort()[0];
  if (!start) return `<p class="muted small">Nothing yet — it starts with the first lesson.</p>`;
  const span = Math.max(1, daysBetween(start, today()));
  const step = Math.max(1, Math.ceil(span / 60));
  const pts = [];
  let total = 0;
  for (let i = 0; i <= span; i++) {
    const k = addDays(start, i);
    total += (state.days[k]?.learned || []).length;
    if (i % step === 0 || i === span) pts.push([k, total]);
  }
  const W = 560, H = 150, pad = 30;
  const max = Math.max(10, total);
  const X = i => pad + (i / Math.max(1, pts.length - 1)) * (W - pad - 6);
  const Y = v => H - 18 - (v / max) * (H - 30);
  const line = pts.map(([, v], i) => `${i ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${X(pts.length - 1).toFixed(1)} ${H - 18} L${pad} ${H - 18} Z`;
  const grid = [0.5, 1].map(f => `<line class="grid" x1="${pad}" x2="${W}" y1="${Y(max * f)}" y2="${Y(max * f)}"/>
    <text class="ax" x="${pad - 4}" y="${Y(max * f) + 4}" text-anchor="end">${Math.round(max * f)}</text>`).join("");
  const hits = pts.map(([k, v], i) => `<g class="bar-hit" data-tip="${esc(k)} · ${v} learned"><rect class="hit" x="${X(i) - (W - pad) / pts.length / 2}" y="0" width="${(W - pad) / pts.length}" height="${H - 18}"/><circle class="dot" cx="${X(i)}" cy="${Y(v)}" r="4"/></g>`).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Things learned over time">${grid}
    <path class="area" d="${area}"/><path class="line" d="${line}"/>${hits}
    <text class="ax" x="${pad}" y="${H - 4}">${esc(start)}</text><text class="ax" x="${W}" y="${H - 4}" text-anchor="end">today</text></svg>`;
}

function milestonesHtml() {
  const got = MILESTONES.filter(m => state.milestones[m.id]);
  /* the next few still to come, closest first */
  const next = MILESTONES.filter(m => !state.milestones[m.id]).map(m => {
    const p = m.prog ? m.prog() : null;
    return { m, frac: p ? Math.min(0.99, p[0] / p[1]) : 0, p };
  }).sort((a, b) => b.frac - a.frac).slice(0, 4);
  return `<section class="card">
    <div class="card-head"><h2><span lang="ja">記念</span> Milestones</h2><span class="count">${got.length} of ${MILESTONES.length}</span></div>
    ${got.length ? `<div class="ms-grid">${got.map(m => `<div class="ms-item" title="${esc(m.took)} · ${esc(state.milestones[m.id])}">${medal(m.badge)}<span>${esc(m.name)}</span></div>`).join("")}</div>`
      : `<p class="muted small">Your first one comes with your first kana.</p>`}
    ${next.length ? `<div class="eyebrow ms-next-h">Next up</div><div class="ms-next">${next.map(({ m, frac, p }) => `
      <div class="ms-n">${medal(m.badge, false, "mini")}<div><b>${esc(m.name)}</b><small>${esc(m.took)}</small>
        ${p ? `<div class="bar"><i style="width:${(frac * 100).toFixed(0)}%"></i></div><small>${p[0]} / ${p[1]}</small>` : ""}</div></div>`).join("")}</div>` : ""}
  </section>`;
}

/* Today's hero carries a small line of the numbers that matter. */
function heroStatsHtml() {
  const s = streak();
  const m = msOn(today());
  if (!s && !m) return "";
  return `<div class="hero-stats">
    ${s ? `<span>${icon("flame")}${s}-day streak${s >= bestStreak() && s > 1 ? " · your best" : ""}</span>` : ""}
    ${m ? `<span>${icon("clock")}${fmtMin(m)} today</span>` : ""}
    <span>${icon("target")}${Math.round(n5Projection().pct * 100)}% of N5</span>
  </div>`;
}

/* Chart tooltips: one floating label, following whichever bar is hovered. */
document.addEventListener("pointerover", e => {
  const g = e.target.closest?.(".bar-hit");
  let tip = $("#chartTip");
  if (!g) { if (tip) tip.hidden = true; return; }
  if (!tip) { tip = document.createElement("div"); tip.id = "chartTip"; tip.className = "chart-tip"; document.body.appendChild(tip); }
  tip.textContent = g.dataset.tip;
  tip.hidden = false;
  const r = g.getBoundingClientRect();
  tip.style.left = `${r.left + r.width / 2}px`;
  tip.style.top = `${r.top + scrollY - 8}px`;
});

Object.assign(ACTS, {
  "ms-close": () => $$(".ms-pop").forEach(el => el.remove()),
});
