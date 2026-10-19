/* Nihongo Quest — 何回 Trails, for 遊ぶ Games (README → Games).

   One word, hidden again and again in a grid of kana: find it every time
   it's there. A word can run in a straight line, on a diagonal, round a
   corner or wind through the grid like a snake — each kana next to the one
   before it, any of the eight ways. Finding the same word four times over
   means following every trail that starts with its first kana, and from
   level 3 some of them are near misses, a kana off (こんにらは, こにんちは)
   or a look-alike swapped in (シ for ツ), so each has to be read to the end.

   Five grids a round. The level sets the grid, the shapes and the near
   misses (TRAIL_LEVELS); a round with no more than one slip and no hint
   opens the next. The grid is made so the word can be traced in exactly as
   many places as it says, and no more (makeTrail, trailPlaces). Plays in
   the Read tab's overlay (RD) and pays coins at the end (earnCoins). */

const TRAIL_GRIDS = 5;
const TRAIL_LEVELS = [
  { en: "Straight lines", what: "across and down, nothing else.", size: 6, n: 3, maxL: 5, shapes: ["line"], decoys: 0, own: .35 },
  { en: "Diagonals too", what: "across, down and on both diagonals.", size: 6, n: 4, maxL: 5, shapes: ["line", "diag"], decoys: 0, own: .4 },
  { en: "Round corners", what: "and words that turn a corner. Some trails are near misses, a kana off.", size: 7, n: 4, maxL: 6, shapes: ["line", "diag", "bend"], decoys: 2, own: .45 },
  { en: "Snakes", what: "words wind through the grid a kana at a time, any way at all — with near misses among them.", size: 7, n: 4, maxL: 6, shapes: ["diag", "bend", "snake", "snake"], decoys: 3, own: .5 },
  { en: "Snakes and look-alikes", what: "more snakes, more near misses, and look-alikes swapped in.", size: 7, n: 5, maxL: 6, shapes: ["bend", "snake", "snake"], decoys: 4, own: .55 },
];

/* ---------- the grid ---------- */

const TRAIL_STEPS = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
const TRAIL_FWD = { line: [[0, 1], [1, 0]], diag: [[1, 1], [-1, 1]], bend: [[0, 1], [1, 0], [1, 1], [-1, 1]] };
const TRAIL_SMALL = /[ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮー]/;
const TRAIL_KANA = /^[ぁ-ゖァ-ヺー]+$/;
const tKey = (r, c) => r * 100 + c;
const tSet = cells => [...cells].sort((a, b) => a - b).join();

/* Every place the word can be traced: a run of cells, each next to the one
   before in any of the eight directions, none used twice, spelling it in
   order. Places over the same cells count once. Stops past cap. */
function trailPlaces(grid, word, cap = Infinity) {
  const size = grid.length, w = [...word], out = new Map(), path = [], on = new Set();
  const go = (r, c, i) => {
    if (out.size > cap || r < 0 || c < 0 || r >= size || c >= size || grid[r][c] !== w[i]) return;
    const k = tKey(r, c);
    if (on.has(k)) return;
    on.add(k); path.push(k);
    if (i === w.length - 1) out.set(tSet(path), [...path]);
    else for (const [dr, dc] of TRAIL_STEPS) go(r + dr, c + dc, i + 1);
    on.delete(k); path.pop();
  };
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) go(r, c, 0);
  return [...out.values()];
}

/* L free cells in the given shape, or null. A line keeps one direction, a
   bend turns once, a snake turns as it likes (and at least twice). which,
   if given, picks the line's direction, so the copies take turns. */
function trailWalk(L, shape, used, size, rand, which) {
  const pick = a => a[Math.floor(rand() * a.length)];
  const free = (r, c, path) => r >= 0 && c >= 0 && r < size && c < size && !used.has(tKey(r, c)) && !path.includes(tKey(r, c));
  for (let t = 0; t < 60; t++) {
    let r = Math.floor(rand() * size), c = Math.floor(rand() * size);
    if (!free(r, c, [])) continue;
    const path = [tKey(r, c)];
    const dirs = TRAIL_FWD[shape] || TRAIL_STEPS;
    let d = which == null || t > 30 ? pick(dirs) : dirs[which % dirs.length], turns = 0;
    const turnAt = shape === "bend" ? 1 + Math.floor(rand() * (L - 2)) : -1;
    for (let i = 1; i < L && path; i++) {
      if (shape === "bend" && i === turnAt + 1) {
        const opts = TRAIL_STEPS.filter(([a, b]) => !(a === d[0] && b === d[1]) && !(a === -d[0] && b === -d[1]) && free(r + a, c + b, path));
        if (!opts.length) { path.length = 0; break; }
        d = pick(opts);
      } else if (shape === "snake") {
        const opts = TRAIL_STEPS.filter(([a, b]) => free(r + a, c + b, path));
        if (!opts.length) { path.length = 0; break; }
        const bent = opts.filter(([a, b]) => a !== d[0] || b !== d[1]);
        const nd = bent.length && (i === 1 || rand() < .65) ? pick(bent) : opts.find(([a, b]) => a === d[0] && b === d[1]) || pick(opts);
        if (i > 1 && (nd[0] !== d[0] || nd[1] !== d[1])) turns++;
        d = nd;
      }
      r += d[0]; c += d[1];
      if (!free(r, c, path)) { path.length = 0; break; }
      path.push(tKey(r, c));
    }
    if (path.length === L && (shape !== "snake" || L < 4 || turns >= 2)) return path;
  }
  return null;
}

/* A near miss: the word with one thing wrong after its first kana, so the
   trail starts right and has to be read to the end — a look-alike swapped
   in, another kana swapped in, two kana the wrong way round, or one left
   out. Returns its characters, or null. */
function trailNearMiss(chars, kana, alike, rand) {
  const pick = a => a[Math.floor(rand() * a.length)];
  const L = chars.length, word = chars.join(""), opts = [];
  for (let i = 1; i < L; i++) {
    const c = chars[i], small = TRAIL_SMALL.test(c);
    (alike[c] || []).forEach(x => { opts.push(() => chars.map((y, j) => j === i ? x : y)); opts.push(opts.at(-1)); });
    const same = kana.filter(x => x !== c && TRAIL_SMALL.test(x) === small);
    if (same.length && !small) opts.push(() => chars.map((y, j) => j === i ? pick(same) : y));
    if (i < L - 1 && chars[i + 1] !== c) opts.push(() => chars.map((y, j) => j === i ? chars[i + 1] : j === i + 1 ? c : y));
    if (i < L - 1 && L >= 4) opts.push(() => chars.filter((_, j) => j !== i));
  }
  for (let t = 0; t < 10 && opts.length; t++) {
    const x = pick(opts)();
    if (x.join("") !== word && !TRAIL_SMALL.test(x[0])) return x;
  }
  return null;
}

/* Hide the word n times (fewer if it's long), and the level's near misses,
   in a size×size grid; fill the rest so its own kana are everywhere; then
   mend every place the filler spelled it by accident, so it can be traced
   in exactly n places. kana: the kana you know in its script; alike: a kana
   -> its look-alikes you know. Returns { grid, paths, decoys } or null. */
function makeTrail(word, lv, kana, alike, rand = Math.random) {
  const pick = a => a[Math.floor(rand() * a.length)];
  const chars = [...word], L = chars.length, size = lv.size, area = size * size;
  if (L < 2 || L > size) return null;
  const n = Math.max(2, Math.min(lv.n, Math.floor(area * .5 / L)));
  const decoys = Math.max(0, Math.min(lv.decoys, Math.floor((area * .72 - n * L) / L)));
  const own = [...new Set(chars)];
  const looks = [...new Set(own.flatMap(c => alike[c] || []))].filter(x => !own.includes(x));
  const other = kana.filter(x => !own.includes(x) && !TRAIL_SMALL.test(x));
  if (!other.length) return null;
  const fill = () => { const x = rand(); return x < lv.own ? pick(own) : looks.length && x < lv.own + .15 ? pick(looks) : pick(other); };
  const at = k => [Math.floor(k / 100), k % 100];
  for (let attempt = 0; attempt < 40; attempt++) {
    const grid = Array.from({ length: size }, () => new Array(size).fill(null));
    const used = new Set(), paths = [], dec = [];
    /* lay a trail down, and take it up again if it and the ones already
       down spell the word somewhere new between them — no filler could
       mend that */
    const lay = (x, shape, which) => {
      for (let t = 0; t < 12; t++) {
        const p = trailWalk(x.length, shape, used, size, rand, which);
        if (!p) return null;
        p.forEach((k, j) => { const [r, c] = at(k); grid[r][c] = x[j]; });
        if (trailPlaces(grid, word, paths.length + 1).length <= paths.length + (x.join("") === word ? 1 : 0)) { p.forEach(k => used.add(k)); return p; }
        p.forEach(k => { const [r, c] = at(k); grid[r][c] = null; });
      }
      return null;
    };
    /* the copies take turns at the level's shapes and directions, so a
       grid has some of each */
    const off = Math.floor(rand() * 8);
    for (let i = 0; i < n; i++) {
      const p = lay(chars, lv.shapes[(i + off) % lv.shapes.length], Math.floor((i + off) / lv.shapes.length));
      if (!p) break;
      paths.push(p);
    }
    if (paths.length < n) continue;
    /* each near miss a different one */
    const seen = new Set();
    for (let i = 0, t = 0; dec.length < decoys && t < decoys * 4; t++) {
      const x = trailNearMiss(chars, kana, alike, rand);
      if (!x || seen.has(x.join(""))) continue;
      const p = lay(x, lv.shapes[i++ % lv.shapes.length]);
      if (p) { dec.push(p); seen.add(x.join("")); }
    }
    for (const row of grid) for (let c = 0; c < size; c++) if (row[c] === null) row[c] = fill();
    const planted = new Set(paths.map(tSet)), mine = new Set(paths.flat()), near = new Set(dec.flat());
    for (let mend = 0; mend < 80; mend++) {
      const extra = trailPlaces(grid, word, n + 12).filter(p => !planted.has(tSet(p)));
      if (!extra.length) return { grid, paths, decoys: dec };
      /* a filler cell if there is one, else a near miss's; never the word's own */
      const e = extra[0], can = e.filter(k => !mine.has(k));
      if (!can.length) break;
      const k = pick(can.filter(k => !near.has(k)).length ? can.filter(k => !near.has(k)) : can);
      const [r, c] = at(k);
      grid[r][c] = pick(other);
    }
  }
  /* a word that won't go in that many times (しんぶん's two ん in a small
     grid) goes in once less */
  return n > 2 ? makeTrail(word, { ...lv, n: n - 1 }, kana, alike, rand) : null;
}

/* ---------- the card ---------- */

/* Words of three to six kana, once each, in the kana they're read with. */
const trailWords = pool => {
  const seen = new Set();
  return pool.filter(w => TRAIL_KANA.test(w.kana) && [...w.kana].length >= 3 && [...w.kana].length <= 6 && !seen.has(w.kana) && seen.add(w.kana));
};

function trailCard(pool) {
  const t = state.read.trail, words = trailWords(pool), open = words.length >= TRAIL_GRIDS;
  const lv = TRAIL_LEVELS[t.level - 1], best = t.best[t.level];
  return `<section class="card rd-rung gm-trail ${open ? "" : "locked"}">
    <div class="rd-rung-head"><span class="rd-n rd-game" lang="ja">回</span><h2><span lang="ja">何回</span> Trails</h2></div>
    <p>One word, hidden again and again — in lines, on diagonals, round corners, winding like a snake. Find it every time: trace it from its first kana to its last.</p>
    ${open ? `<div class="pick"><span class="pick-l">Level</span><div class="seg">${TRAIL_LEVELS.map((L, i) => `<button class="${t.level === i + 1 ? "on" : ""}" data-act="tl-pick" data-v="${i + 1}" ${i + 1 > t.top ? "disabled" : ""} title="${esc(L.en)}">${i + 1 > t.top ? icon("lock") : ""}${i + 1}</button>`).join("")}</div></div>
      <p class="muted small"><b>${esc(lv.en)}</b> — ${esc(lv.what)}${best ? ` Best: <b>${fmtTime(best)}</b>.` : ""}${t.top < TRAIL_LEVELS.length && t.level === t.top ? " A round with no more than one slip opens the next level." : ""}</p>
      <button class="btn rd-go" data-act="rd-start" data-r="trail">Five grids</button>`
      : `<p class="muted small">Learn a few more words first — this needs ${TRAIL_GRIDS} of three kana or more.</p>`}
  </section>`;
}

/* ---------- the game ---------- */

/* the kana you know in the word's script(s), and their look-alikes */
function trailKana(word) {
  const h = /[ぁ-ゖ]/.test(word), k = /[ァ-ヺ]/.test(word);
  return learnedKana().filter(e => [...e.k].length === 1 && !e.concept && ((e.set === "h" && h) || (e.set === "k" && k))).map(e => e.k);
}
function trailAlike(kana) {
  const known = new Set(kana), out = {};
  KANA_ALIKE.forEach(g => g.forEach(c => { out[c] = [...new Set([...(out[c] || []), ...g.filter(x => x !== c && known.has(x))])]; }));
  return out;
}

function trailOpen() {
  const t = state.read.trail, lv = TRAIL_LEVELS[t.level - 1];
  const words = shuffle(trailWords(RD.pool).filter(w => [...w.kana].length <= lv.maxL));
  if (words.length < TRAIL_GRIDS) { closeRead(); toast("Learn a few more words first."); return; }
  Object.assign(RD, { level: t.level, lv, words, n: TRAIL_GRIDS, i: 0, slips: 0, finds: 0, helped: false, t0: performance.now() });
  $("#rdStrip").innerHTML = Array.from({ length: RD.n }, (_, i) => `<i data-i="${i}"></i>`).join("");
  $("#rdPace").textContent = "0:00";
  RD.timer = setInterval(() => { if (RD && !RD.done) $("#rdPace").textContent = fmtTime(performance.now() - RD.t0); }, 500);
  trailShow();
}

function trailShow() {
  rdStrip();
  /* the next word that makes a grid (nearly all do) */
  let g = null, w = null;
  while (!g && RD.words.length) {
    w = RD.words.shift();
    const kana = trailKana(w.kana);
    g = makeTrail(w.kana, RD.lv, kana, trailAlike(kana));
  }
  if (!g) { RD.n = RD.i; return trailDone(); }
  Object.assign(RD, { g, w, found: new Set(), gSlips: 0, busy: false });
  const size = g.grid.length, n = g.paths.length;
  $("#rdBody").innerHTML = `<div class="tl-play">
    <div class="tl-head">
      <div class="tl-ask">Find it <b>${n}</b> times</div>
      <div class="tl-word" lang="ja">${esc(w.kana)}</div>
      <div class="tl-m">${w.text !== w.kana ? `<span lang="ja">${esc(w.text)}</span> · ` : ""}${esc(w.m)}</div>
      <div class="tl-dots" id="trDots">${g.paths.map(() => "<i></i>").join("")}</div>
    </div>
    <div class="srch-grid tl-grid" id="trGrid" lang="ja" style="--n:${size}">
      <svg class="tl-lines" id="trLines" viewBox="0 0 ${size} ${size}" aria-hidden="true"><polyline class="sel" points=""/></svg>
      ${g.grid.map((row, r) => row.map((ch, c) => `<span class="srch-c" data-r="${r}" data-c="${c}">${esc(ch)}</span>`).join("")).join("")}
    </div>
    <div class="tl-read" id="trRead" aria-live="polite"></div>
  </div>`;
  $("#rdFoot").innerHTML = `<button class="btn btn-ghost" data-act="tl-hint">Show me one</button>
    <button class="btn btn-ghost" data-act="tl-hear">${icon("speaker")} Hear it</button>`;
  bindTrail();
  if (state.settings.sound) say(w.say);
}

const trCell = k => $(`#trGrid .srch-c[data-r="${Math.floor(k / 100)}"][data-c="${k % 100}"]`);
const trPoints = keys => keys.map(k => `${k % 100 + .5},${Math.floor(k / 100) + .5}`).join(" ");

/* A drag is a trail: a cell joins it when the finger is near its middle,
   so cutting a corner on a diagonal doesn't catch the cell beside it; a
   jump along a straight line fills the cells between; going back onto the
   last cell but one takes the last off. */
function bindTrail() {
  const box = $("#trGrid"), sel = $("#trLines .sel");
  let path = null;
  const cellAt = e => {
    const R = box.getBoundingClientRect(), n = RD.g.grid.length, s = R.width / n;
    const x = (e.clientX - R.left) / s, y = (e.clientY - R.top) / s, r = Math.floor(y), c = Math.floor(x);
    if (r < 0 || c < 0 || r >= n || c >= n) return null;
    return { k: tKey(r, c), r, c, near: Math.hypot(x - c - .5, y - r - .5) < .42 };
  };
  const draw = () => {
    $$("#trGrid .srch-c.on").forEach(el => el.classList.remove("on"));
    sel.setAttribute("points", path ? trPoints(path) : "");
    if (!path) return;
    path.forEach(k => trCell(k).classList.add("on"));
    $("#trRead").innerHTML = `<span lang="ja">${esc(path.map(k => RD.g.grid[Math.floor(k / 100)][k % 100]).join(""))}</span>`;
    $("#trRead").className = "tl-read";
  };
  box.addEventListener("pointerdown", e => {
    const p = cellAt(e);
    if (!p || !RD || RD.done || RD.busy) return;
    e.preventDefault();
    try { box.setPointerCapture(e.pointerId); } catch {}
    path = [p.k]; draw();
  });
  box.addEventListener("pointermove", e => {
    if (!path) return;
    const p = cellAt(e);
    if (!p || !p.near) return;
    const last = path.at(-1);
    if (p.k === last) return;
    if (p.k === path.at(-2)) { path.pop(); return draw(); }
    const lr = Math.floor(last / 100), lc = last % 100, dr = p.r - lr, dc = p.c - lc, far = Math.max(Math.abs(dr), Math.abs(dc));
    if (far > 1 && dr && dc && Math.abs(dr) !== Math.abs(dc)) return;
    const add = Array.from({ length: far }, (_, i) => tKey(lr + Math.sign(dr) * (i + 1), lc + Math.sign(dc) * (i + 1)));
    if (add.some(k => path.includes(k))) return;
    path.push(...add); draw();
  });
  const up = () => {
    if (!path) return;
    const done = path;
    path = null; draw();
    trailPick(done);
  };
  box.addEventListener("pointerup", up);
  box.addEventListener("lostpointercapture", up);
  box.addEventListener("pointercancel", () => { path = null; draw(); });
}

/* what the trail read, with the kana that aren't the word's marked */
function trailSaid(text, word) {
  const t = [...text], w = [...word];
  return t.map((c, i) => t.length === w.length && c !== w[i] ? `<mark>${esc(c)}</mark>` : esc(c)).join("");
}

function trailPick(path) {
  const read = $("#trRead");
  if (path.length < 2) { read.textContent = ""; return; }
  const g = RD.g, word = RD.w.kana, L = [...word].length;
  const text = path.map(k => g.grid[Math.floor(k / 100)][k % 100]).join("");
  const match = cells => g.paths.findIndex(p => tSet(p) === tSet(cells));
  /* a trail that ran on past the word's end still finds it */
  const cells = text.startsWith(word) && path.length > L ? path.slice(0, L) : path;
  const i = match(cells);
  const note = (html, cls = "") => { read.innerHTML = html; read.className = `tl-read ${cls}`; };
  if (i >= 0 && cells.map(k => g.grid[Math.floor(k / 100)][k % 100]).join("") === word) {
    if (RD.found.has(i)) return note("Found that one already.");
    return trailFound(i);
  }
  if (i >= 0) return note(`Read it from the start — <b lang="ja">${esc([...word][0])}</b> first.`);
  if (word.startsWith(text)) return note(`<span lang="ja">${esc(text)}</span>… not the whole word yet.`);
  RD.slips++; RD.gSlips++;
  path.forEach(k => { const el = trCell(k); el.classList.remove("nope"); void el.offsetWidth; el.classList.add("nope"); });
  note(`That reads <b lang="ja">${trailSaid(text, word)}</b>`, "no");
}

function trailFound(i) {
  const g = RD.g, p = g.paths[i];
  RD.found.add(i);
  RD.finds++;
  const hue = (RD.found.size - 1) % CHAIN_HUES;
  $("#trLines").insertAdjacentHTML("afterbegin", `<polyline class="h${hue}" points="${trPoints(p)}"/>`);
  p.forEach(k => trCell(k).classList.add("got"));
  $$("#trDots i")[RD.found.size - 1]?.classList.add("on", "h" + hue);
  const left = g.paths.length - RD.found.size;
  $("#trRead").innerHTML = left ? `<b lang="ja">${esc(RD.w.kana)}</b> — ${left} more` : `All ${g.paths.length}!`;
  $("#trRead").className = "tl-read ok";
  if (state.settings.sound) say(RD.w.say);
  if (left) return;
  RD.busy = true;
  RD.res[RD.i] = RD.gSlips ? "near" : "ok";
  rdStrip();
  RD.next = setTimeout(() => { if (!RD) return; RD.i++; if (RD.i >= RD.n) trailDone(); else trailShow(); }, 1100);
}

/* Show me one: the first kana of one not yet found pulses. Using it means
   the time can't be a best, and the round won't open the next level. */
function trailHint() {
  if (!RD || RD.done || RD.rung !== "trail" || RD.busy) return;
  const left = RD.g.paths.filter((_, i) => !RD.found.has(i));
  if (!left.length) return;
  RD.helped = true;
  const el = trCell(sample(left, 1)[0][0]);
  el.classList.remove("hint"); void el.offsetWidth; el.classList.add("hint");
}

function trailDone() {
  RD.done = true;
  clearInterval(RD.timer);
  const ms = performance.now() - RD.t0;
  addStudyTime(ms);
  day().read = (day().read || 0) + 1;
  const t = state.read.trail;
  t.rounds = (t.rounds || 0) + 1;
  const clean = !RD.helped && RD.slips <= 1 && RD.n === TRAIL_GRIDS;
  const best = clean && (!t.best[RD.level] || ms < t.best[RD.level]);
  if (best) t.best[RD.level] = Math.round(ms);
  /* a clean round at the top level opens the next, and moves you on to it */
  const up = clean && RD.level === t.top && t.top < TRAIL_LEVELS.length;
  if (up) { t.top++; t.level = t.top; }
  /* coins: one a find, four for a clean round, four for a best */
  const paid = earnCoins(RD.finds + (clean ? 4 : 0) + (best ? 4 : 0));
  save();
  crumb(`trail done L${RD.level} ${RD.finds} finds ${RD.slips} slips ${fmtTime(ms)}`);
  rdStrip();
  $("#rdPace").textContent = fmtTime(ms);
  const next = up && TRAIL_LEVELS[t.level - 1];
  $("#rdBody").innerHTML = `<div class="finish">
    <div class="celebrate">${neko(best || up ? "cheer" : RD.slips <= 2 ? "happy" : "think", "hop")}${best ? stamp("新記録") : ""}</div>
    <div class="finish-big">${RD.finds}<small> found</small></div>
    <p>${RD.n} grid${RD.n === 1 ? "" : "s"} in ${fmtTime(ms)} · ${RD.slips ? `${RD.slips} slip${RD.slips === 1 ? "" : "s"}` : "no slips"}${RD.helped ? " · with a hint" : ""}</p>
    ${best ? `<div class="badge-best">New best on level ${RD.level}</div>` : ""}
    ${next ? `<p class="tl-up">Level ${t.level} is open: <b>${esc(next.en)}</b> — ${esc(next.what)}</p>` : ""}
    ${paid}
  </div>`;
  if (best || up) petals($("#read"), 24);
  $("#rdFoot").innerHTML = `<button class="btn btn-ghost" data-act="rd-close">Done <kbd>Esc</kbd></button>
    <button class="btn" data-act="rd-again">${up ? "Try level " + t.level : "Again"} <kbd>↵</kbd></button>`;
}

Object.assign(ACTS, {
  "tl-pick": el => { state.read.trail.level = Math.min(+el.dataset.v, state.read.trail.top); save(); render(); },
  "tl-hint": () => trailHint(),
  "tl-hear": () => { if (RD?.w) say(RD.w.say); },
});
