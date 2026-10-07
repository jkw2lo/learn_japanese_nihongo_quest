/* Nihongo Quest — writing as reinforcement.

   Stroke data (js/strokes.js, from AnimCJK) uses Make Me a Hanzi's frame: a
   1024 box, y pointing up, baseline at 900. Each kana has s (a list of
   outlines per stroke — a looped stroke has several) and m (one median line
   per stroke). Everything here works in screen
   space instead — the same 1024 box with y pointing down — so a model point
   (x, y) becomes (x, 900 − y), and what the learner draws needs no
   conversion beyond the pad's size.

   Three ways of marking, chosen in Settings → How writing is marked:

   - shape (the default): the SHAPE is marked, not the order. Each stroke of
     the model has to be matched by one of yours, in any order and either
     direction. Writing here is reinforcement — the aim is that your hand
     knows the shape — so a learner who draws し from the bottom up still
     gets the credit for knowing し.
   - in order: stroke i has to be the model's stroke i, drawn the right way
     round.
   - read: what you wrote is read like a handwriting keyboard reads it — see
     readWriting. For later on, when the shapes are in your hand and being
     marked stroke by stroke starts to get in the way.

   The markers are pure (no DOM), so tools/smoke.mjs can run them on the real
   stroke data: every kana's own medians must pass, and look-alikes must fail. */

const WRITE_N = 24;                 /* points a stroke is resampled to */
const WRITE_TOL = 150;               /* mean distance, in 1024 units, for a stroke to match */

const strokesFor = k => (window.NQ_STROKES && window.NQ_STROKES[k]) || null;
const canWrite = k => !!strokesFor(k);

/* ---------- geometry ---------- */

const modelMedians = k => strokesFor(k).m.map(st => st.map(([x, y]) => [x, 900 - y]));

function strokeLen(pts) {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return d;
}

function resample(pts, n = WRITE_N) {
  if (pts.length === 1) return Array.from({ length: n }, () => pts[0]);
  const total = strokeLen(pts) || 1;
  const step = total / (n - 1);
  const out = [pts[0]];
  let acc = 0, i = 1, prev = pts[0];
  while (out.length < n - 1 && i < pts.length) {
    const cur = pts[i];
    const seg = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
    if (acc + seg >= step && seg > 0) {
      const t = (step - acc) / seg;
      const p = [prev[0] + t * (cur[0] - prev[0]), prev[1] + t * (cur[1] - prev[1])];
      out.push(p);
      prev = p; acc = 0;
    } else { acc += seg; prev = cur; i++; }
  }
  while (out.length < n) out.push(pts[pts.length - 1]);
  return out;
}

/* How far apart two resampled strokes are: the mean distance between
   matching points, plus two penalties for the local details a mean washes
   out —
   - either END far off: the end is often all that separates two kana (わ
     curls back where れ kicks out);
   - the worst STRETCH of four points far off: a small loop (る against ろ)
     or a kink (そ against る) is a short stretch of a long stroke. */
const WRITE_END_TOL = 190;
const WRITE_WIN_TOL = 200;
function meanDist(a, b) {
  const dd = a.map((p, i) => Math.hypot(p[0] - b[i][0], p[1] - b[i][1]));
  const mean = dd.reduce((s, d) => s + d, 0) / dd.length;
  const n = dd.length - 1;
  const ends = Math.max(dd[0], dd[n]);
  let worst = 0;
  for (let i = 0; i + 4 <= dd.length; i++) worst = Math.max(worst, (dd[i] + dd[i + 1] + dd[i + 2] + dd[i + 3]) / 4);
  return mean + Math.max(0, ends - WRITE_END_TOL) + Math.max(0, worst - WRITE_WIN_TOL);
}

function bbox(strokes) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  strokes.forEach(st => st.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }));
  return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, size: Math.max(x1 - x0, y1 - y0, 1) };
}

/* People write off-centre and a little big or small. Line the drawing up
   with the model by its box — centre, and size within reason — before any
   stroke is compared. */
function align(user, model) {
  const a = bbox(user), b = bbox(model);
  const k = Math.max(0.7, Math.min(1.45, b.size / a.size));
  return user.map(st => st.map(([x, y]) => [b.cx + (x - a.cx) * k, b.cy + (y - a.cy) * k]));
}

/* ---------- marking ---------- */

/* Returns { ok, strokes: [{ model, user, d, ok }], reason } */
function markWriting(k, userStrokes, ordered = false) {
  const model = modelMedians(k);
  const user = userStrokes.filter(st => st.length > 0);
  if (!user.length) return { ok: false, strokes: [], reason: "Nothing written yet." };
  const aligned = align(user, model).map(st => resample(st));
  const models = model.map(st => resample(st));
  const tol = WRITE_TOL;

  if (ordered) {
    const out = [];
    let ok = user.length === model.length;
    models.forEach((m, i) => {
      const u = aligned[i];
      const d = u ? meanDist(u, m) : Infinity;
      const good = d <= tol;
      if (!good) ok = false;
      out.push({ model: i, user: u ? i : null, d, ok: good });
    });
    const first = out.find(s => !s.ok);
    return {
      ok, strokes: out,
      reason: ok ? "" : user.length !== model.length
        ? `${model.length} stroke${model.length > 1 ? "s" : ""}, and you drew ${user.length}.`
        : `Stroke ${first.model + 1} isn't right — its place, shape or direction.`,
    };
  }

  /* Any order: pair each model stroke with its closest unused stroke of
     yours, closest pairs first. Direction still counts — a stroke drawn the
     wrong way round is what turns ソ into ン and シ into ツ. */
  const pairs = [];
  models.forEach((m, i) => aligned.forEach((u, j) => {
    pairs.push({ i, j, d: meanDist(u, m) });
  }));
  pairs.sort((a, b) => a.d - b.d);
  const usedM = new Set(), usedU = new Set(), out = [];
  for (const p of pairs) {
    if (usedM.has(p.i) || usedU.has(p.j)) continue;
    usedM.add(p.i); usedU.add(p.j);
    out.push({ model: p.i, user: p.j, d: p.d, ok: p.d <= tol });
  }
  models.forEach((_, i) => { if (!usedM.has(i)) out.push({ model: i, user: null, d: Infinity, ok: false }); });
  out.sort((a, b) => a.model - b.model);

  /* The count has to be exact. Allowing one stroke more or fewer let は pass
     for ほ, ば for ぼ and き for さ — the stroke count is part of the shape. */
  const countOk = user.length === model.length;
  const unmatched = out.filter(s => !s.ok);
  const ok = countOk && unmatched.length === 0;
  return {
    ok, strokes: out,
    reason: ok ? "" : !countOk
      ? `${model.length} stroke${model.length > 1 ? "s" : ""}, and you drew ${user.length}.`
      : "The shape isn't quite there — compare it with the model.",
  };
}

/* ---------- reading it, like a handwriting keyboard ---------- */

/* The other way of marking, chosen in Settings → How writing is marked. A
   phone's handwriting keyboard doesn't count your strokes: it reads what
   you wrote against every character it knows and offers the closest. This
   does the same, against every kana (or every kanji) with stroke data, and
   it's right when what you wrote reads as the one asked for.

   So strokes may be joined up (き's last two in one go), split, or come in
   any order, and anything the stroke-by-stroke marking would pass passes
   here too. Direction still counts: it's most of what tells ソ from ン, so
   a stroke the wrong way round is a miss, and the miss says so.

   Each drawing becomes a cloud of points, spread along its strokes, each
   carrying the way its stroke was heading. Two clouds are as far apart as
   the mean distance from each point to the nearest in the other, both ways
   round (a missing stroke and an extra one both cost). That mean is taken
   twice, over every point and stroke by stroke, and the two averaged: by
   points alone, a dakuten is a few dots in a big shape and ど reads as と. */

const READ_N = 64;          /* points a drawing is spread over */
const READ_MIN = 4;         /* …but never fewer than this on one stroke */
const READ_DIR = 60;        /* what heading the opposite way costs, in 1024 units */
const READ_CAP = 90;        /* closer than this, or it can't be read at all; scribbles start about here */
/* Drawn alike, so read alike: neither can be told from the other written
   on its own, and asking for one, the other is right. */
const READ_SAME = ["へヘ", "べベ", "ぺペ", "つっ", "ツッ"];
const sameShape = (a, b) => a === b || READ_SAME.some(s => s.includes(a) && s.includes(b));
const isKanaChar = k => /^[぀-ヿ]+$/.test(k);

function cloud(strokes) {
  const lens = strokes.map(strokeLen), total = lens.reduce((a, b) => a + b, 0) || 1;
  const out = [];
  strokes.forEach((st, s) => {
    const n = Math.max(READ_MIN, Math.round(READ_N * lens[s] / total));
    const r = resample(st, n);
    r.forEach((p, j) => {
      const a = r[Math.max(0, j - 1)], b = r[Math.min(n - 1, j + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy);
      out.push([p[0], p[1], l ? dx / l : 0, l ? dy / l : 0, s]);
    });
  });
  return out;
}

/* From each point of A to the nearest of B: the mean over every point, and
   the mean of each stroke's mean, averaged. */
function cloudHalf(A, B, dir) {
  const { sqrt } = Math;      /* looked up once: this loop runs ~1.3M times a read */
  const per = new Map();
  let all = 0;
  for (const a of A) {
    let m = Infinity;
    for (const b of B) {
      const dx = a[0] - b[0], dy = a[1] - b[1], tx = a[2] - b[2], ty = a[3] - b[3];
      const d = sqrt(dx * dx + dy * dy) + dir * sqrt(tx * tx + ty * ty);
      if (d < m) m = d;
    }
    all += m;
    const g = per.get(a[4]) || per.set(a[4], [0, 0]).get(a[4]);
    g[0] += m; g[1]++;
  }
  let strokes = 0;
  per.forEach(([s, n]) => { strokes += s / n; });
  return (all / A.length + strokes / per.size) / 2;
}

const modelClouds = {};
function readDist(user, k, dir = READ_DIR) {
  const model = modelMedians(k);
  const M = modelClouds[k] || (modelClouds[k] = cloud(model));
  const U = cloud(align(user, model));
  return (cloudHalf(U, M, dir) + cloudHalf(M, U, dir)) / 2;
}

/* Returns markWriting's shape, plus readAs: what it read as (null if it
   couldn't be read as anything). */
function readWriting(k, userStrokes) {
  const user = userStrokes.filter(st => st.length > 0);
  if (!user.length) return { ok: false, strokes: [], reason: "Nothing written yet.", readAs: null };
  /* Whatever the stroke-by-stroke marking passes, this passes too, so
     switching to it never turns a right answer wrong. It's also quicker. */
  const shape = markWriting(k, user, false);
  if (shape.ok) return { ...shape, readAs: k };
  const kana = isKanaChar(k);
  const pool = Object.keys(window.NQ_STROKES).filter(c => isKanaChar(c) === kana);
  const closest = dir => pool.map(c => [c, readDist(user, c, dir)]).sort((a, b) => a[1] - b[1])[0];
  const [best, bestD] = closest(READ_DIR);
  const readAs = bestD <= READ_CAP ? best : null;
  const ok = !!readAs && sameShape(readAs, k);
  /* A miss that would read right if direction didn't count is the right
     shape with a stroke going the wrong way round — worth saying so. */
  const backwards = !ok && (([c, d]) => d <= READ_CAP && sameShape(c, k))(closest(0));
  return {
    ok, readAs,
    strokes: user.map((_, j) => ({ user: j, ok })),
    reason: ok ? "" : backwards ? "The shape's there, but a stroke goes the wrong way round."
      : readAs ? `That reads as ${readAs}.` : "That can't be read as anything yet — compare it with the model.",
  };
}

/* Whichever way Settings asks for. */
function markBy(settings, k, userStrokes) {
  return settings.writeCheck === "read" ? readWriting(k, userStrokes) : markWriting(k, userStrokes, settings.strokeOrder);
}

/* ---------- drawing the model ---------- */

/* The model as SVG in the 1024 screen box: outlines, optionally faint (a
   guide to trace), optionally animated stroke by stroke in order. */
function modelSvg(k, { faint = false, animate = false, cls = "" } = {}) {
  const d = strokesFor(k);
  if (!d) return "";
  const id = "m" + Math.random().toString(36).slice(2, 7);
  const g = `translate(0,900) scale(1,-1)`;
  let body;
  if (animate) {
    /* Each stroke is a thick line swept along its median, clipped to the
       stroke's outline — the way hanzi-writer draws — one after another. */
    let t = 0;
    body = d.s.map((paths, i) => {
      const med = d.m[i];
      const len = Math.round(strokeLen(med)) + 60;
      const dur = Math.max(0.25, len / 1100);
      const el = `<clipPath id="${id}c${i}">${paths.map(p => `<path d="${p}"/>`).join("")}</clipPath>
        ${paths.map(p => `<path d="${p}" class="mdl-ghost"/>`).join("")}
        <polyline points="${med.map(p => p.join(",")).join(" ")}" clip-path="url(#${id}c${i})" class="mdl-sweep"
          style="stroke-dasharray:${len};stroke-dashoffset:${len};animation:sweep ${dur.toFixed(2)}s ${t.toFixed(2)}s linear forwards"/>`;
      t += dur + 0.12;
      return el;
    }).join("");
  } else {
    body = d.s.flat().map(p => `<path d="${p}"/>`).join("");
  }
  return `<svg class="mdl ${faint ? "faint" : ""} ${cls}" viewBox="0 0 1024 1024" aria-hidden="true"><g transform="${g}">${body}</g></svg>`;
}

/* How long the stroke animation for k runs, in ms. */
function modelAnimMs(k) {
  const d = strokesFor(k);
  if (!d) return 0;
  return d.m.reduce((t, med) => t + Math.max(0.25, (strokeLen(med) + 60) / 1100) + 0.12, 0) * 1000;
}

/* ---------- the pad ---------- */

/* A square you draw in with a mouse, finger or pen. The guide is a faint
   cross, like the squared paper Japanese children practise on. */
function padHtml(k, { trace = false } = {}) {
  return `<div class="pad" id="pad">
    <svg class="pad-guide" viewBox="0 0 1024 1024" aria-hidden="true">
      <line x1="512" y1="0" x2="512" y2="1024"/><line x1="0" y1="512" x2="1024" y2="512"/>
    </svg>
    <div class="pad-model" id="padModel">${trace ? modelSvg(k, { faint: true }) : ""}</div>
    <svg class="pad-ink" id="padInk" viewBox="0 0 1024 1024"></svg>
  </div>`;
}

let pad = null;       /* { strokes: [[x,y]…], cur, el } */

function bindPad(onChange) {
  const el = $("#padInk");
  if (!el) return;
  pad = { strokes: [], cur: null, el, locked: false };
  const toBox = e => {
    const r = el.getBoundingClientRect();
    return [Math.round((e.clientX - r.left) / r.width * 1024), Math.round((e.clientY - r.top) / r.height * 1024)];
  };
  el.addEventListener("pointerdown", e => {
    if (pad.locked) return;
    e.preventDefault();
    /* capture keeps a stroke going when the pen strays outside the box; if
       the browser refuses it, the stroke should still be drawn */
    try { el.setPointerCapture(e.pointerId); } catch {}
    pad.cur = [toBox(e)];
    pad.strokes.push(pad.cur);
    drawInk();
  });
  el.addEventListener("pointermove", e => {
    if (!pad.cur) return;
    const p = toBox(e), last = pad.cur[pad.cur.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 6) return;
    pad.cur.push(p);
    drawInk();
  });
  const end = () => { if (pad.cur) { pad.cur = null; drawInk(); onChange && onChange(); } };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
}

function drawInk(marks) {
  if (!pad) return;
  pad.el.innerHTML = pad.strokes.map((st, j) => {
    const cls = marks ? (marks.find(m => m.user === j)?.ok ? "ok" : "miss") : "";
    return st.length === 1
      ? `<circle cx="${st[0][0]}" cy="${st[0][1]}" r="26" class="${cls}"/>`
      : `<polyline points="${st.map(p => p.join(",")).join(" ")}" class="${cls}"/>`;
  }).join("");
}

function padUndo() { if (pad && !pad.locked) { pad.strokes.pop(); drawInk(); } }
function padClear() { if (pad && !pad.locked) { pad.strokes = []; drawInk(); } }
