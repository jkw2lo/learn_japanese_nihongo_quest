/* Nihongo Quest — two arcade games for 遊ぶ Games (README → Games):

   忍者 Ninja slice — kana (and later words) fly up; slice the ones the wave
   asks for and spare the rest. The bombs are look-alikes.
   めくる Swipe deck — a word in the middle, a looping deck of meanings
   under it: swipe left or right to pass, up to say “this one”.

   Both play in the Read tab's overlay (RD, #rdBody, #rdFoot, #rdStrip) and
   pay coins at the end (earnCoins, games-ui.js). */

/* ---------- what you know ---------- */

const knownKana = () => KANA.filter(e => !e.concept && isLearned(e.k));
const kanaRows = () => LESSONS.filter(L => L.kind === "base").map(L => ({ L, ks: L.g.split(" ") }));

/* ---------- 忍者 Ninja slice ---------- */

const NINJA_WAVES = 5;
const NINJA_LIVES = 3;

/* One wave: what to slice, and what flies. Pure, so smoke can check it.
   known: learned kana entries; pool: readable words; kinds: allowed kinds */
function ninjaWave(known, pool, kind, n = 12) {
  const pickOne = a => a[Math.floor(Math.random() * a.length)];
  const byK = Object.fromEntries(known.map(e => [e.k, e]));
  const fill = (targets, decoys) => {
    const t = Math.max(3, Math.round(n * 0.42));
    const items = [];
    for (let i = 0; i < t; i++) items.push({ text: pickOne(targets), target: true });
    for (let i = items.length; i < n; i++) items.push({ text: pickOne(decoys), target: false });
    return shuffle(items);
  };
  if (kind === "sound") {
    const T = pickOne(known);
    const alike = KANA_ALIKE.filter(g => g.includes(T.k)).flat().filter(k => k !== T.k && byK[k]);
    const same = known.filter(e => e.set === T.set && e.k !== T.k).map(e => e.k);
    const decoys = [...alike, ...alike, ...sample(same, 6)];
    if (!decoys.length) return null;
    return { kind, prompt: `Slice every <b>${esc(kanaAsked(T))}</b>`, say: T.say, show: T.k, items: fill([T.k], decoys), alike: new Set(alike) };
  }
  if (kind === "row") {
    const rows = kanaRows().filter(R => R.ks.every(k => byK[k]));
    if (!rows.length) return null;
    const R = pickOne(rows);
    const decoys = known.filter(e => e.set === R.L.set && !R.ks.includes(e.k)).map(e => e.k);
    if (decoys.length < 4) return null;
    return { kind, prompt: `Slice the <b lang="ja">${esc(R.L.title.replace(" row", ""))}</b> row`, show: R.ks.join(""), items: fill(R.ks, decoys) };
  }
  if (kind === "script") {
    const h = known.filter(e => e.set === "h").map(e => e.k), k = known.filter(e => e.set === "k").map(e => e.k);
    if (h.length < 6 || k.length < 6) return null;
    const kata = Math.random() < 0.5;
    return { kind, prompt: `Slice only <b>${kata ? "katakana" : "hiragana"}</b>`, show: kata ? "カ" : "か", items: fill(kata ? k : h, kata ? h : k) };
  }
  if (kind === "meaning") {
    const words = pool.filter(w => [...w.text].length <= 4);
    if (words.length < 8) return null;
    const W = pickOne(words);
    const decoys = otherMeanings(W, words, 8).map(w => w.text);
    return { kind, prompt: `Slice <b>${esc(W.m)}</b>`, say: null, show: "", items: fill([W.text], decoys), word: W };
  }
  return null;
}

function ninjaKinds() {
  const known = knownKana(), pool = readPool();
  return ["sound", "row", "script", "meaning"].filter(k => ninjaWave(known, pool, k));
}

function ninjaCard() {
  const r = state.read.ninja, kinds = ninjaKinds(), open = kinds.length > 0;
  return `<section class="card rd-rung gm-ninja ${open ? "" : "locked"}">
    <div class="rd-rung-head"><span class="rd-n rd-game" lang="ja">忍</span><h2><span lang="ja">忍者</span> Ninja slice</h2></div>
    <p>Kana fly up — slice the ones each wave asks for, and leave the rest. Look-alikes are the bombs: three slips and you're out.</p>
    ${open ? `<p class="muted small">Waves: ${kinds.map(k => ({ sound: "a sound", row: "a row", script: "a script", meaning: "a meaning" })[k]).join(", ")}.${r.best ? ` Best: <b>${r.best}</b>.` : ""}</p>
      <button class="btn rd-go" data-act="rd-start" data-r="ninja">Five waves</button>`
      : `<p class="muted small">Opens once you've learned a few kana that look alike.</p>`}
  </section>`;
}

function ninjaOpen() {
  const kinds = ninjaKinds();
  Object.assign(RD, { n: NINJA_WAVES, wave: -1, lives: NINJA_LIVES, score: 0, hits: 0, targets: 0, slips: [], kinds: shuffle([...kinds]), items: [], trail: [] });
  $("#rdStrip").innerHTML = Array.from({ length: RD.n }, (_, i) => `<i data-i="${i}"></i>`).join("");
  $("#rdBody").innerHTML = `<div class="nj-play">
    <div class="nj-head"><div class="nj-prompt" id="njPrompt"></div><div class="nj-lives" id="njLives"></div></div>
    <div class="nj-field" id="njField"><svg class="nj-trail" id="njTrail"><path d=""/></svg><div class="nj-banner" id="njBanner"></div></div>
  </div>`;
  $("#rdFoot").innerHTML = `<button class="btn btn-ghost" data-act="nj-hear">${icon("speaker")} Hear the target</button><span class="nj-score" id="njScore">0</span>`;
  ninjaLives();
  bindNinja();
  RD.stop = () => cancelAnimationFrame(RD.raf);
  ninjaNextWave();
  RD.last = performance.now();
  RD.raf = requestAnimationFrame(ninjaFrame);
}

function ninjaLives() {
  $("#njLives").innerHTML = Array.from({ length: NINJA_LIVES }, (_, i) => `<i class="${i < RD.lives ? "on" : ""}"></i>`).join("");
}

function ninjaNextWave() {
  RD.wave++;
  RD.i = RD.wave;
  rdStrip();
  if (RD.wave >= RD.n) return ninjaEnd();
  /* each kind in turn, in a shuffled order */
  const kind = RD.kinds[RD.wave % RD.kinds.length];
  const W = ninjaWave(knownKana(), readPool(), kind, 10 + RD.wave * 2) || ninjaWave(knownKana(), readPool(), RD.kinds[0], 10 + RD.wave * 2);
  RD.W = W;
  RD.queue = W.items.map((it, i) => ({ ...it, at: 900 + i * Math.max(420, 760 - RD.wave * 70) + Math.random() * 200 }));
  RD.waveT = 0;
  RD.waveHit = 0; RD.waveMiss = 0; RD.waveSlip = 0;
  $("#njPrompt").innerHTML = `${W.prompt}${W.show && W.kind !== "sound" ? ` <span class="nj-show" lang="ja">${esc(W.show)}</span>` : ""}`;
  const b = $("#njBanner");
  b.innerHTML = `<small>Wave ${RD.wave + 1} of ${RD.n}</small>${W.prompt}`;
  b.classList.remove("on"); void b.offsetWidth; b.classList.add("on");
  if (W.say && state.settings.sound) say(W.say);
}

function ninjaFrame(t) {
  if (!RD || RD.rung !== "ninja" || RD.done) return;
  /* real time, even on a slow phone; only a long stall (a tab put away) is cut short */
  const dt = Math.min(0.1, (t - RD.last) / 1000);
  RD.last = t;
  RD.waveT += dt * 1000;
  const field = $("#njField");
  const W = field.clientWidth, H = field.clientHeight;
  const G = H * (1.5 + RD.wave * 0.12);
  /* launch what's due */
  while (RD.queue.length && RD.queue[0].at <= RD.waveT) ninjaLaunch(RD.queue.shift(), W, H, G);
  /* fly */
  for (const it of RD.items) {
    if (it.gone) continue;
    it.vy += G * dt; it.x += it.vx * dt; it.y += it.vy * dt; it.rot += it.vr * dt;
    if (!it.sliced) it.el.style.transform = `translate(${it.x - it.r}px, ${it.y - it.r}px) rotate(${it.rot}deg)`;
    if (it.y > H + it.r * 2 && it.vy > 0) {
      it.gone = true;
      it.el.remove();
      if (it.target) RD.waveMiss++;
    }
  }
  RD.items = RD.items.filter(it => !it.gone);
  /* the trail fades */
  const now = performance.now();
  RD.trail = RD.trail.filter(p => now - p.t < 140);
  $("#njTrail path").setAttribute("d", RD.trail.length > 1 ? "M" + RD.trail.map(p => `${p.x.toFixed(0)} ${p.y.toFixed(0)}`).join(" L") : "");
  /* the wave is over when nothing's left to come or in the air */
  if (!RD.queue.length && !RD.items.length) {
    if (!RD.waveDone) {
      RD.waveDone = true;
      RD.res[RD.wave] = RD.waveSlip ? "miss" : RD.waveMiss ? "near" : "ok";
      setTimeout(() => { if (RD && RD.rung === "ninja" && !RD.done) { RD.waveDone = false; ninjaNextWave(); } }, 700);
    }
  }
  RD.raf = requestAnimationFrame(ninjaFrame);
}

function ninjaLaunch(it, W, H, G) {
  const len = [...it.text].length;
  const r = Math.min(50, 30 + (len - 1) * 7);
  const x0 = W * (0.15 + Math.random() * 0.7);
  const apex = H * (0.12 + Math.random() * 0.33);
  const vy = -Math.sqrt(2 * G * (H + r - apex));
  const flight = 2 * -vy / G;
  const xEnd = W * (0.15 + Math.random() * 0.7);
  const el = document.createElement("div");
  el.className = `nj-it ${len > 1 ? "word" : ""}`;
  el.lang = "ja";
  el.style.width = el.style.height = r * 2 + "px";
  el.style.fontSize = (len > 1 ? Math.max(0.95, 2.1 - len * 0.25) : 2.1) + "rem";
  el.textContent = it.text;
  $("#njField").appendChild(el);
  if (it.target) RD.targets++;
  RD.items.push({ ...it, el, r, x: x0, y: H + r, vx: (xEnd - x0) / flight, vy, rot: (Math.random() - 0.5) * 24, vr: (Math.random() - 0.5) * 70 });
}

function bindNinja() {
  const field = $("#njField");
  let down = false, stroke = 0;
  const at = e => { const b = field.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top, t: performance.now() }; };
  field.addEventListener("pointerdown", e => { down = true; stroke = 0; field.setPointerCapture?.(e.pointerId); RD.trail = [at(e)]; });
  field.addEventListener("pointermove", e => {
    if (!down || !RD || RD.done) return;
    const p = at(e), q = RD.trail[RD.trail.length - 1] || p;
    RD.trail.push(p);
    for (const it of RD.items) {
      if (it.gone || it.sliced) continue;
      if (segDist(q, p, it) < it.r * 0.95) { stroke += ninjaSlice(it, Math.atan2(p.y - q.y, p.x - q.x)) ? 1 : 0; if (stroke >= 2) ninjaCombo(stroke, it); }
    }
  });
  const up = () => { down = false; stroke = 0; };
  field.addEventListener("pointerup", up);
  field.addEventListener("pointercancel", up);
}

const segDist = (a, b, c) => {
  const dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((c.x - a.x) * dx + (c.y - a.y) * dy) / L)) : 0;
  return Math.hypot(a.x + t * dx - c.x, a.y + t * dy - c.y);
};

/* Cut: the two halves fall apart along the line of the cut. Returns
   whether it was a target. */
function ninjaSlice(it, angle) {
  it.sliced = it.gone = true;
  const el = it.el;
  el.classList.add(it.target ? "hit" : "slip");
  el.style.setProperty("--a", `${(angle * 180 / Math.PI).toFixed(0)}deg`);
  el.innerHTML = `<span class="nj-half a">${esc(it.text)}</span><span class="nj-half b">${esc(it.text)}</span>`;
  setTimeout(() => el.remove(), 600);
  if (it.target) {
    RD.hits++; RD.waveHit++; RD.score += 10;
    if (navigator.vibrate) { try { navigator.vibrate(5); } catch {} }
  } else {
    RD.waveSlip++;
    RD.lives--;
    RD.slips.push({ cut: it.text, want: RD.W.show || (RD.W.word && RD.W.word.text) || "" , prompt: RD.W.prompt });
    ninjaLives();
    $("#njField").classList.remove("shake"); void $("#njField").offsetWidth; $("#njField").classList.add("shake");
    if (navigator.vibrate) { try { navigator.vibrate([30, 40, 30]); } catch {} }
    if (RD.lives <= 0) setTimeout(() => ninjaEnd(), 500);
  }
  $("#njScore").textContent = RD.score;
  return it.target;
}

function ninjaCombo(n, it) {
  RD.score += 5;
  $("#njScore").textContent = RD.score;
  const b = document.createElement("div");
  b.className = "nj-combo";
  b.textContent = `${n} at once!`;
  b.style.left = it.x + "px"; b.style.top = it.y + "px";
  $("#njField").appendChild(b);
  setTimeout(() => b.remove(), 800);
}

function ninjaEnd() {
  if (!RD || RD.done) return;
  RD.done = true;
  cancelAnimationFrame(RD.raf);
  const ms = performance.now() - RD.t0;
  addStudyTime(ms);
  const r = state.read.ninja;
  r.rounds = (r.rounds || 0) + 1;
  const best = RD.score > (r.best || 0);
  if (best) r.best = RD.score;
  const out = RD.lives <= 0;
  /* coins: most of a coin a slice, more for keeping every life, and a best */
  const paid = earnCoins(RD.hits * 0.8 + (RD.lives === NINJA_LIVES ? 5 : 0) + (best ? 4 : 0));
  save();
  crumb(`ninja done ${RD.score} ${RD.hits}/${RD.targets}`);
  $("#rdPace").textContent = fmtTime(ms);
  const slips = RD.slips.filter((s, i, a) => a.findIndex(x => x.cut === s.cut && x.want === s.want) === i);
  $("#rdBody").innerHTML = `<div class="finish">
    <div class="celebrate">${neko(best ? "cheer" : out ? "think" : "happy", "hop")}${best ? stamp("新記録") : ""}</div>
    <div class="finish-big">${RD.score}<small> points</small></div>
    <p>${RD.hits} of ${RD.targets} sliced${out ? " — out of lives" : RD.lives === NINJA_LIVES ? " — not a slip" : ` · ${NINJA_LIVES - RD.lives} slip${NINJA_LIVES - RD.lives > 1 ? "s" : ""}`}</p>
    ${slips.length ? `<div class="nj-slips"><small class="muted">Sliced by mistake</small>${slips.map(s => `<span><b lang="ja">${esc(s.cut)}</b>${s.want ? ` <small>not</small> <b lang="ja">${esc(s.want)}</b>` : ""}</span>`).join("")}</div>` : ""}
    ${best ? `<div class="badge-best">New best</div>` : ""}
    ${paid}
  </div>`;
  if (best) petals($("#read"), 24);
  $("#rdFoot").innerHTML = `<button class="btn btn-ghost" data-act="rd-close">Done <kbd>Esc</kbd></button>
    <button class="btn" data-act="rd-again">Again <kbd>↵</kbd></button>`;
}

/* ---------- めくる Swipe deck ---------- */

const DECK_N = 10;           /* prompts a round */
const DECK_CARDS = 8;        /* cards in the loop: one right, seven not */
const DECK_SWIPE = 50;       /* px before a drag counts */
const DECK_MODES = { m: "Word → meaning", w: "Meaning → word", k: "Kana → sound" };

/* The prompts for a mode, each with its looping deck. Pure, so smoke can
   check it: every deck holds its answer exactly once. */
function deckRound(mode, pool, known, n = DECK_N) {
  if (mode === "k") {
    if (known.length < 6) return [];
    return sample(known, Math.min(n, known.length)).map(T => {
      const alike = KANA_ALIKE.filter(g => g.includes(T.k)).flat().filter(k => k !== T.k);
      const near = known.filter(e => e.k !== T.k && (alike.includes(e.k) || e.lesson === T.lesson));
      const rest = known.filter(e => e.k !== T.k && !near.includes(e));
      const others = [...shuffle(near), ...shuffle(rest)].filter((e, i, a) => a.findIndex(x => kanaAsked(x) === kanaAsked(e)) === i && kanaAsked(e) !== kanaAsked(T)).slice(0, DECK_CARDS - 1);
      return { key: T.k, show: T.k, say: T.say, answer: kanaAsked(T), cards: shuffle([kanaAsked(T), ...others.map(kanaAsked)]), ja: false };
    });
  }
  const words = pool.filter(w => w.m);
  if (words.length < 6) return [];
  return sample(words, Math.min(n, words.length)).map(W => {
    const others = otherMeanings(W, words, DECK_CARDS - 1);
    return mode === "m"
      ? { key: W.key, show: W.text, say: W.say, answer: W.m, cards: shuffle([W.m, ...others.map(o => o.m)]), ja: false }
      : { key: W.key, show: W.m, say: W.say, answer: W.text, cards: shuffle([W.text, ...others.map(o => o.text)]), ja: true, flip: true };
  });
}

function deckModesOpen() {
  const known = knownKana(), pool = readPool();
  return Object.keys(DECK_MODES).filter(m => deckRound(m, pool, known, 1).length);
}

function deckCard() {
  const d = state.read.deck, modes = deckModesOpen();
  const mode = modes.includes(d.mode) ? d.mode : modes[0];
  const best = mode && d.best[mode];
  return `<section class="card rd-rung gm-deck ${modes.length ? "" : "locked"}">
    <div class="rd-rung-head"><span class="rd-n rd-game" lang="ja">捲</span><h2><span lang="ja">めくる</span> Swipe deck</h2></div>
    <p>A word on top, a deck of answers underneath, going round and round. Swipe left or right to pass, up for “this one”. A wrong one is burned from the deck.</p>
    ${modes.length ? `<div class="pick"><span class="pick-l">Deck</span><div class="seg">${Object.keys(DECK_MODES).map(m => `<button class="${m === mode ? "on" : ""}" data-act="dk-pick" data-v="${m}" ${modes.includes(m) ? "" : "disabled"}>${DECK_MODES[m]}</button>`).join("")}</div></div>
      <p class="muted small">${DECK_N} to find; fewer swipes, more points.${best ? ` Best: <b>${best}</b>.` : ""}</p>
      <button class="btn rd-go" data-act="rd-start" data-r="deck">Deal ${DECK_N}</button>`
      : `<p class="muted small">Opens once you've learned a few kana.</p>`}
  </section>`;
}

function deckOpen() {
  const modes = deckModesOpen();
  const mode = modes.includes(state.read.deck.mode) ? state.read.deck.mode : modes[0];
  const qs = deckRound(mode, readPool(), knownKana());
  if (!qs.length) return closeRead();
  Object.assign(RD, { mode, qs, n: qs.length, score: 0, swipes: 0 });
  $("#rdStrip").innerHTML = Array.from({ length: RD.n }, (_, i) => `<i data-i="${i}"></i>`).join("");
  if (mode !== "k") new Set(learnedWords().map(x => x.st)).forEach(st => loadBundle("s" + st));
  RD.stop = () => clearInterval(RD.timer);
  RD.timer = setInterval(() => { if (RD && !RD.done) $("#rdPace").textContent = fmtTime(performance.now() - RD.t0); }, 250);
  deckShow();
}

function deckShow() {
  rdStrip();
  if (RD.i >= RD.n) return deckEnd();
  const q = RD.qs[RD.i];
  RD.q = { ...q, live: q.cards.map((c, i) => i), at: 0, swipes: 0, tried: false, t0: performance.now() };
  $("#rdBody").innerHTML = `<div class="dk-play">
    <div class="dk-prompt ${q.flip ? "en" : ""}" ${q.flip ? "" : `lang="ja" style="font-size:${[...q.show].length <= 2 ? 4.4 : [...q.show].length <= 4 ? 3.2 : 2.3}rem"`}>${esc(q.show)}</div>
    ${q.flip ? "" : `<button class="link dk-hear" data-act="dk-hear">${icon("speaker")} hear it</button>`}
    <div class="dk-deck" id="dkDeck"></div>
    <div class="dk-dots" id="dkDots"></div>
    <div class="dk-btns">
      <button class="icon-btn dk-b" data-act="dk-go" data-d="-1" aria-label="Pass, back">${icon("back")}</button>
      <button class="btn dk-pick-b" data-act="dk-go" data-d="0">This one <kbd>↑</kbd></button>
      <button class="icon-btn dk-b" data-act="dk-go" data-d="1" aria-label="Pass, on">${icon("chevron")}</button>
    </div>
    <div class="verdict" id="dkVerdict" aria-live="polite"></div>
  </div>`;
  $("#rdFoot").innerHTML = `<span class="muted small">← → pass · ↑ or ↵ this one</span><span class="nj-score">${RD.score}</span>`;
  if (!q.flip && state.settings.sound && state.settings.autoplay) say(q.say);
  deckDraw();
}

/* the top card, and the next two peeking out behind it */
function deckDraw(enter = "") {
  const Q = RD.q, cards = RD.qs[RD.i].cards, L = Q.live.length;
  const at = k => cards[Q.live[(Q.at + k) % L]];
  const face = (txt, cls) => `<div class="dk-card ${cls}" ${RD.qs[RD.i].ja ? 'lang="ja"' : ""}><span>${esc(txt)}</span></div>`;
  $("#dkDeck").innerHTML = (L > 2 ? face(at(2), "back2") : "") + (L > 1 ? face(at(1), "back1") : "") + face(at(0), `top ${enter}`);
  $("#dkDots").innerHTML = cards.map((c, i) => `<i class="${!Q.live.includes(i) ? "burnt" : Q.live[Q.at] === i ? "on" : ""}"></i>`).join("");
  bindDeck();
}

function bindDeck() {
  const top = $("#dkDeck .top");
  if (!top) return;
  let s = null;
  top.addEventListener("pointerdown", e => { s = { x: e.clientX, y: e.clientY }; top.setPointerCapture?.(e.pointerId); top.classList.add("drag"); });
  top.addEventListener("pointermove", e => {
    if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    top.style.transform = `translate(${dx}px, ${Math.min(dy, 30)}px) rotate(${dx / 14}deg)`;
    top.classList.toggle("up", dy < -DECK_SWIPE && Math.abs(dy) > Math.abs(dx));
  });
  const end = e => {
    if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    s = null;
    top.classList.remove("drag", "up");
    if (dy < -DECK_SWIPE && Math.abs(dy) > Math.abs(dx)) deckGo(0);
    else if (Math.abs(dx) > DECK_SWIPE) deckGo(dx > 0 ? 1 : -1);
    else top.style.transform = "";
  };
  top.addEventListener("pointerup", end);
  top.addEventListener("pointercancel", () => { s = null; top.classList.remove("drag", "up"); top.style.transform = ""; });
}

/* d: 1 on, -1 back (both pass), 0 this one */
function deckGo(d) {
  const Q = RD?.q;
  if (!Q || Q.busy || RD.done) return;
  const top = $("#dkDeck .top");
  const L = Q.live.length;
  if (d) {
    Q.swipes++; RD.swipes++;
    $("#dkVerdict").innerHTML = "";
    Q.busy = true;
    top.classList.add(d > 0 ? "off-r" : "off-l");
    setTimeout(() => { Q.busy = false; Q.at = (Q.at + d + L) % L; deckDraw(d > 0 ? "in-r" : "in-l"); }, 170);
    return;
  }
  const card = RD.qs[RD.i].cards[Q.live[Q.at]];
  const ok = card === Q.answer;
  const first = !Q.tried;
  Q.tried = true;
  if (ok) {
    Q.busy = true;
    const pts = first ? Math.max(2, 10 - Q.swipes) : 1;
    RD.score += pts;
    RD.res[RD.i] = first ? "ok" : "miss";
    if (first) RD.right = (RD.right || 0) + 1;
    deckGrade(first);
    top.classList.add("off-u", "good");
    $("#dkVerdict").innerHTML = `<span class="v-ok">${icon("check", "v-ico")} +${pts}</span>`;
    if (RD.qs[RD.i].flip && state.settings.sound) say(Q.say);
    setTimeout(() => { if (!RD || RD.done) return; RD.i++; deckShow(); }, 520);
    return;
  }
  /* wrong: that card burns, and the next comes round */
  if (first) deckGrade(false);
  top.classList.add("burn");
  $("#dkVerdict").innerHTML = `<span class="v-miss">Not “${esc(card)}”</span>`;
  Q.busy = true;
  setTimeout(() => {
    Q.busy = false;
    Q.live.splice(Q.at, 1);
    Q.at = Q.at % Q.live.length;
    deckDraw("in-r");
  }, 380);
}

/* a word's (or a kana's) reading, graded like a sprint answer — once, on
   the first “this one” */
function deckGrade(ok) {
  const k = RD.qs[RD.i].key, ms = performance.now() - RD.q.t0;
  if (RD.mode === "k" || isWordKey(k)) grade(k, "r", ok, ms, "speed");
}

function deckEnd() {
  if (RD.done) return;
  RD.done = true;
  clearInterval(RD.timer);
  const ms = performance.now() - RD.t0;
  addStudyTime(ms);
  day().read = (day().read || 0) + 1;
  const d = state.read.deck;
  d.rounds = (d.rounds || 0) + 1;
  const best = RD.score > (d.best[RD.mode] || 0);
  if (best) d.best[RD.mode] = RD.score;
  const right = RD.right || 0;
  /* coins: two for each found on the first “this one”, and a best */
  const paid = earnCoins(right * 2 + (best ? 4 : 0));
  save();
  crumb(`deck done ${RD.mode} ${right}/${RD.n} ${RD.score}`);
  rdStrip();
  $("#rdPace").textContent = fmtTime(ms);
  $("#rdBody").innerHTML = `<div class="finish">
    <div class="celebrate">${neko(best ? "cheer" : right >= RD.n * 0.75 ? "happy" : "think", "hop")}${best ? stamp("新記録") : ""}</div>
    <div class="finish-big">${RD.score}<small> points</small></div>
    <p>${right} of ${RD.n} on the first try · ${RD.swipes} swipe${RD.swipes === 1 ? "" : "s"} in ${fmtTime(ms)}</p>
    ${best ? `<div class="badge-best">New best</div>` : ""}
    ${paid}
  </div>`;
  if (best) petals($("#read"), 24);
  $("#rdFoot").innerHTML = `<button class="btn btn-ghost" data-act="rd-close">Done <kbd>Esc</kbd></button>
    <button class="btn" data-act="rd-again">Again <kbd>↵</kbd></button>`;
}

/* keys while one of these is up; readKey hands them over */
function arcadeKey(e) {
  if (RD.rung === "deck") {
    const d = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: 0, Enter: 0, " ": 0 }[e.key];
    if (d !== undefined) { e.preventDefault(); deckGo(d); }
    return true;
  }
  if (RD.rung === "ninja") {
    if (e.key === " " && RD.W?.say) { e.preventDefault(); say(RD.W.say); }
    return true;
  }
  return false;
}

Object.assign(ACTS, {
  "nj-hear": () => { if (RD?.W?.say) say(RD.W.say); else if (RD?.W?.word) say(RD.W.word.say); },
  "dk-go": el => deckGo(+el.dataset.d),
  "dk-hear": () => { if (RD?.q) say(RD.q.say); },
  "dk-pick": el => { state.read.deck.mode = el.dataset.v; save(); render(); },
});
