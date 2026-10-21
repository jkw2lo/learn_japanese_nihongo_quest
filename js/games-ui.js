/* Nihongo Quest — 遊ぶ Games: the games, the coins they pay, and the
   capsule machine those coins turn (README → Games).

   The games — Ninja slice and the Swipe deck (arcade-ui.js), Word search
   and Match (read-ui.js), Trails (trail-ui.js) — play in the Read tab's overlay; they only live
   here. Each pays coins as it ends (earnCoins), and so do the Read tab's
   rounds and every sprint, a little less; a turn of the
   machine costs spinCost of the set being collected and drops a capsule from it
   (js/data/toys.js); the toy goes on the shelf, under its name. A full shelf
   opens the next set. state.gacha:
     earned  coins ever earned      spent  coins ever spent
     owned   toy id -> how many     dry    turns in a row with nothing new
     quiz    set id -> { l, r }: the best Quiz me round, by ear and by sight
   Coins are earned − spent, so two devices merge by taking the larger of
   each (srs.js mergeState). */

const coins = () => Math.max(0, (state.gacha.earned || 0) - (state.gacha.spent || 0));
const spinFree = () => !(state.gacha.spent || 0) && !Object.keys(state.gacha.owned).length;
/* what a turn costs now: the price of the set being collected */
const turnCost = () => spinCost(currentSet(state.gacha.owned));
const canSpin = () => spinFree() || coins() >= turnCost();
/* how many turns the purse buys at once (a free first turn isn't one of
   them) — at this set's price; a set filled on the way may cost more, and
   the turns stop when the purse runs out (gachaSpinAll) */
const spinsAll = () => spinFree() ? 0 : Math.floor(coins() / turnCost());

/* Pay for a game. Returns the html that says so, for the game's last screen. */
function earnCoins(n) {
  n = Math.max(0, Math.round(n));
  if (!n) return "";
  state.gacha.earned = (state.gacha.earned || 0) + n;
  save();
  crumb(`coins +${n}`);
  return `<div class="coin-gain">${coinArt()}<b>+${n}</b> coins <button class="link" data-act="ga-go">to the capsule machine ›</button></div>`;
}

let gaShelf = null;          /* which set the shelf shows; null: the one being collected */
let gaBusy = false;          /* a capsule on its way */

/* The collection sits right under the machine, so a toy lands where you can
   see it. On a phone it starts folded to one line of dots, one per toy, so
   the machine and the games stay close; open or shut, this device remembers. */
let gaShelfOpen = (() => { try { const v = localStorage.getItem("nq-shelf"); return v === null ? null : v === "1"; } catch { return null; } })();
const shelfOpen = () => gaShelfOpen ?? !(typeof isPhone === "function" && isPhone());

function renderGames() {
  loadBundle("gacha");
  const el = $("#v-games");
  const pool = readPool();
  const owned = state.gacha.owned;
  const S = currentSet(owned), have = S.toys.filter(t => owned[t.id]).length;
  const allDone = TOY_SETS.every(x => setDone(x, owned));
  el.innerHTML = `<div class="rd-grid gm-grid">
    <section class="card gm-intro">
      <div class="eyebrow">遊ぶ · Games</div>
      <h1>Play, earn, collect.</h1>
      <p class="lede">Every game pays coins. Coins turn the capsule machine, and every capsule holds a toy for your
        shelf — twenty to a set, each with its name in Japanese. Fill a shelf and the next set opens.</p>
    </section>
    <section class="card gm-machine">
      <div class="gm-purse" aria-label="${coins()} coins">${coinArt()}<b id="gmCoins">${coins()}</b><span>coins</span></div>
      <div class="gm-stage" id="gmStage">${gachaMachine()}</div>
      <div class="gm-set"><span lang="ja">${wordHtml(S.jp)}</span> ${esc(S.en)} · <b>${have}</b> of ${S.toys.length}${allDone ? " · every set complete" : ""}</div>
      <button class="btn gm-turn" data-act="ga-spin" ${canSpin() && !gaBusy ? "" : "disabled"}>${spinFree() ? "Turn the handle — the first one's free" : `Turn the handle · ${coinArt()} ${turnCost()}`}</button>
      ${!canSpin() ? `<p class="muted small">${turnCost() - coins()} more coins for a turn — a game pays about twenty.</p>` : ""}
      ${spinsAll() >= 2 ? `<button class="btn btn-ghost gm-turn-all" data-act="ga-spin-all" ${gaBusy ? "disabled" : ""}>Turn them all · ${spinsAll()} capsules</button>` : ""}
    </section>
    ${shelfHtml()}
    ${ninjaCard()}
    ${deckCard()}
    ${searchCard(pool)}
    ${trailCard(pool)}
    ${matchCard(pool)}
  </div>`;
}

/* ---------- the shelves ---------- */

function shelfHtml() {
  const owned = state.gacha.owned;
  const cur = currentSet(owned);
  const S = TOY_SETS.find(x => x.id === gaShelf) || cur;
  const open = x => TOY_SETS.indexOf(x) <= TOY_SETS.indexOf(cur);
  const have = S.toys.filter(t => owned[t.id]).length;
  const shown = shelfOpen();
  const head = `<button class="gm-shelf-head" data-act="ga-shelf-fold" aria-expanded="${shown}">
      <h2>Collection</h2><span class="count">${have} of ${S.toys.length}</span>${icon("chevron", "gm-fold")}</button>`;
  if (!shown) return `<section class="card gm-shelves shut" id="gmShelves">${head}
    <button class="gm-dots" data-act="ga-shelf-fold" aria-label="Show the collection">${S.toys.map((t, i) =>
      `<i class="${owned[t.id] ? "on" : ""} ${t.rare ? "rare" : ""}" data-t="${t.id}" style="--h:${GACHA_HUES[i % GACHA_HUES.length]}"></i>`).join("")}</button>
    ${toyQuizHtml(S, false)}
  </section>`;
  const rows = [];
  for (let i = 0; i < S.toys.length; i += 5) rows.push(S.toys.slice(i, i + 5));
  return `<section class="card gm-shelves" id="gmShelves">${head}
    <div class="seg gm-tabs">${TOY_SETS.map((x, i) => `<button class="${x === S ? "on" : ""}" data-act="ga-shelf" data-s="${x.id}" ${open(x) ? "" : "disabled"}>
      ${open(x) ? "" : icon("lock")}<span lang="ja">${furiPlain(x.jp)}</span> ${i + 1}</button>`).join("")}</div>
    <p class="muted small">${setDone(S, owned) ? `<b>${esc(S.en)}</b> — complete. Tap a toy to hear its name.` : `<b>${esc(S.en)}</b> — ${S.toys.length - have} still to find. Tap a toy to hear its name.`}</p>
    <div class="gm-shelf">${rows.map(r => `<div class="gm-row">${r.map(t => toySlot(t, owned[t.id])).join("")}</div>`).join("")}</div>
    ${toyQuizHtml(S, true)}
  </section>`;
}

function toySlot(t, n) {
  if (!n) return `<div class="gm-slot empty" aria-label="not found yet"><span class="gm-box">?</span><span class="gm-name">？</span></div>`;
  return `<button class="gm-slot ${t.rare ? "rare" : ""}" data-act="ga-hear" data-t="${t.id}" title="${esc(furiPlain(t.w))} — ${esc(t.m)}">
    <span class="gm-fig">${toyArt(t.id)}${n > 1 ? `<i class="gm-x">×${n}</i>` : ""}</span>
    <span class="gm-name" lang="ja">${wordHtml(t.w)}</span><small>${esc(t.m)}</small></button>`;
}

/* ---------- a turn of the handle ---------- */

function gachaSpin() {
  if (gaBusy || !canSpin()) return;
  const g = state.gacha;
  const free = spinFree();
  const S = currentSet(g.owned);
  const toy = gachaPick(S, g.owned, g.dry || 0);
  const isNew = !g.owned[toy.id];
  if (!free) g.spent = (g.spent || 0) + spinCost(S);
  g.owned[toy.id] = (g.owned[toy.id] || 0) + 1;
  g.dry = isNew ? 0 : (g.dry || 0) + 1;
  if (!isNew) g.earned = (g.earned || 0) + DUP_BACK;
  const done = isNew && setDone(S, g.owned);
  save();
  crumb(`gacha ${toy.id}${isNew ? " new" : ""}`);
  gaBusy = true;
  const stage = $("#gmStage");
  stage.classList.add("turning");
  $(".gm-turn").disabled = true;
  if (state.settings.sound && navigator.vibrate) { try { navigator.vibrate([8, 60, 8, 60, 14]); } catch {} }
  setTimeout(() => { stage.classList.remove("turning"); gachaOpen(toy, isNew, done, S); }, 1300);
}

/* Every coin at once: as many turns as the purse buys, drawn one after
   another exactly as single turns are (a set filling up mid-way moves the
   rest on to the next set), and opened together from one big rainbow
   capsule. Coins a double gives back stay in the purse for later. */
function gachaSpinAll() {
  const n = spinsAll();
  if (gaBusy || n < 2) return;
  const g = state.gacha, got = [], sets = [];
  for (let i = 0; i < n; i++) {
    const S = currentSet(g.owned);
    if (coins() < spinCost(S)) break;
    const toy = gachaPick(S, g.owned, g.dry || 0);
    const isNew = !g.owned[toy.id];
    g.spent = (g.spent || 0) + spinCost(S);
    g.owned[toy.id] = (g.owned[toy.id] || 0) + 1;
    g.dry = isNew ? 0 : (g.dry || 0) + 1;
    if (!isNew) g.earned = (g.earned || 0) + DUP_BACK;
    got.push({ toy, isNew });
    if (isNew && setDone(S, g.owned)) sets.push(S);
  }
  save();
  crumb(`gacha all ×${n}, ${got.filter(x => x.isNew).length} new`);
  gaBusy = true;
  const stage = $("#gmStage");
  stage.classList.add("turning", "many");
  $$(".gm-turn, .gm-turn-all").forEach(b => { b.disabled = true; });
  if (state.settings.sound && navigator.vibrate) { try { navigator.vibrate([8, 40, 8, 40, 8, 40, 8, 40, 20]); } catch {} }
  setTimeout(() => { stage.classList.remove("turning", "many"); gachaOpenAll(got, sets); }, 1500);
}

function gachaOpenAll(got, sets) {
  /* one tile per toy, new ones first, then rare, then the doubles */
  const by = new Map();
  got.forEach(({ toy, isNew }) => {
    const x = by.get(toy.id) || by.set(toy.id, { toy, isNew: false, n: 0 }).get(toy.id);
    x.n++;
    if (isNew) x.isNew = true;
  });
  const tiles = [...by.values()].sort((a, b) => b.isNew - a.isNew || !!b.toy.rare - !!a.toy.rare);
  const fresh = got.filter(x => x.isNew).length, dups = got.length - fresh;
  const box = document.createElement("div");
  box.className = "ga-open";
  box.id = "gaOpen";
  box.innerHTML = `<div class="ga-card ga-many" role="dialog" aria-modal="true" aria-label="${got.length} capsules">
    <button class="ga-cap" data-act="ga-crack" aria-label="Open the capsule">${capsuleArt("rainbow", false, "big")}<span class="ga-hint">${got.length} capsules in one — tap to open</span></button>
    <div class="ga-toy" hidden>
      <div class="ga-sum"><b>${got.length}</b> capsules · <b>${fresh}</b> new${dups ? ` · ${dups} double${dups > 1 ? "s" : ""}, ${coinArt()} +${dups * DUP_BACK} back` : ""}</div>
      <div class="ga-haul">${tiles.map((x, i) => `<button class="ga-got ${x.isNew ? "new" : ""} ${x.toy.rare ? "rare" : ""}" data-act="ga-hear" data-t="${x.toy.id}" style="--d:${Math.min(i, 24) * 60}ms">
        <span class="gm-fig">${toyArt(x.toy.id)}${x.n > 1 ? `<i class="gm-x">×${x.n}</i>` : ""}</span>
        <span class="gm-name" lang="ja">${wordHtml(x.toy.w)}</span><small>${esc(x.toy.m)}</small>${x.isNew ? `<em>${x.toy.rare ? "Rare!" : "New"}</em>` : ""}</button>`).join("")}</div>
      <p class="muted small">Tap a toy to hear its name.</p>
      <div class="ga-acts"><button class="btn" data-act="ga-keep">Put them on the shelf <kbd>↵</kbd></button></div>
    </div>
  </div>`;
  box._many = got; box._sets = sets;
  document.body.appendChild(box);
  requestAnimationFrame(() => box.classList.add("on"));
}

/* The capsule, big, in the middle of the screen: tap it and it opens. */
function gachaOpen(toy, isNew, done, S) {
  const hue = GACHA_HUES[Math.floor(Math.random() * GACHA_HUES.length)];
  const box = document.createElement("div");
  box.className = "ga-open";
  box.id = "gaOpen";
  box.innerHTML = `<div class="ga-card" role="dialog" aria-modal="true" aria-label="A capsule">
    <button class="ga-cap" data-act="ga-crack" aria-label="Open the capsule">${capsuleArt(hue, toy.rare)}<span class="ga-hint">Tap to open</span></button>
    <div class="ga-toy" hidden>
      <div class="ga-fig">${toyArt(toy.id)}</div>
      ${isNew ? `<div class="ga-new">${toy.rare ? "Rare! " : ""}New</div>` : `<div class="ga-dup">Got this one already · ${coinArt()} +${DUP_BACK} back</div>`}
      <div class="ga-name" lang="ja">${wordHtml(toy.w)}</div>
      <div class="ga-m">${esc(toy.m)}</div>
      <div class="ga-acts">
        <button class="btn btn-ghost" data-act="ga-hear" data-t="${toy.id}">${icon("speaker")} Hear it</button>
        <button class="btn" data-act="ga-keep">${done ? "Finish the set" : "Put it on the shelf"} <kbd>↵</kbd></button>
      </div>
    </div>
  </div>`;
  box._toy = toy; box._done = done; box._set = S;
  document.body.appendChild(box);
  requestAnimationFrame(() => box.classList.add("on"));
}

function gachaCrack() {
  const box = $("#gaOpen");
  if (!box || box.classList.contains("cracked")) return;
  box.classList.add("cracked");
  setTimeout(() => {
    $(".ga-cap", box).hidden = true;
    $(".ga-toy", box).hidden = false;
    if (box._many) { if (box._many.some(x => x.isNew)) petals(box, 30); return; }
    if (state.settings.sound) say(furiKana(box._toy.w));
    if (box._toy.rare || box._done) petals(box, 20);
  }, 380);
}

function gachaKeep() {
  const box = $("#gaOpen");
  if (!box) return;
  if (!box.classList.contains("cracked")) return gachaCrack();
  if (box._many) {
    const { _many: got, _sets: sets } = box;
    box.remove();
    gaBusy = false;
    gaShelf = null;
    gaDoneQueue = sets.map(S => [S, TOY_SETS[TOY_SETS.indexOf(S) + 1]]);
    if (nextSetDone()) return;
    render();
    got.filter(x => x.isNew).forEach(x => $(`.gm-slot[data-t="${x.toy.id}"], .gm-dots [data-t="${x.toy.id}"]`)?.classList.add("landed"));
    $("#gmShelves")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    return;
  }
  const { _toy: toy, _done: done, _set: S } = box;
  box.remove();
  gaBusy = false;
  gaShelf = null;
  if (done) {
    const next = TOY_SETS[TOY_SETS.indexOf(S) + 1];
    gaShelf = S.id;
    showSetDone(S, next);
  }
  render();
  /* it lands on the shelf, or on its dot when the shelf is folded */
  const slot = $(`.gm-slot[data-t="${toy.id}"], .gm-dots [data-t="${toy.id}"]`);
  if (slot) { slot.classList.add("landed"); if (!done) slot.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
}

/* sets finished by one turn of them all, shown one after another */
let gaDoneQueue = [];
function nextSetDone() {
  const x = gaDoneQueue.shift();
  if (!x) return false;
  gaShelf = x[0].id;
  render();
  showSetDone(...x);
  return true;
}

function showSetDone(S, next) {
  const box = document.createElement("div");
  box.className = "ga-open on";
  box.id = "gaDone";
  box.innerHTML = `<div class="ga-card ga-complete" role="dialog" aria-modal="true" aria-label="Set complete">
    <div class="celebrate">${neko("cheer", "hop")}${stamp("全部")}</div>
    <h2>${esc(S.en)} — complete!</h2>
    <p>All ${S.toys.length} on the shelf.${next ? ` The next set is open: <b><span lang="ja">${wordHtml(next.jp)}</span> ${esc(next.en)}</b>.` : " That's every set there is — for now."}</p>
    <div class="ga-acts"><button class="btn btn-ghost" data-act="gq-start" data-s="${S.id}" data-w="r">Quiz me on them</button>
      <button class="btn" data-act="ga-done-close">${next ? "On to the next set" : "Lovely"} <kbd>↵</kbd></button></div>
  </div>`;
  document.body.appendChild(box);
  petals(box, 30);
}

/* ---------- Quiz me: a full shelf's twenty names ---------- */

/* Every toy is a word, and a full shelf can be quizzed: ten of its toys,
   each heard (聞く Listen) or read (読む Read), and four of the shelf's toys,
   drawn and named in English, to pick from — or asked for by the neko
   (お願い Neko asks): it says a toy's name, and you hand it the right one
   from a shelf of six, drawn but not named. Reading shows furigana over
   the kanji — the name is the word to know; its kanji mostly aren't taught.
   No writing, for the same reason. It plays in the Read overlay (RD, rung
   "toys"); nothing is scheduled, and the best round per set and way is
   kept (state.gacha.quiz). */
const TOY_QUIZ_N = 10;
const TOY_QUIZ_WAYS = { l: ["聞く", "Listen"], r: ["読む", "Read"], n: ["お願い", "Neko asks"] };
const hearsIt = w => w !== "r";          /* the ways that need sound */
const TOY_NEKO_N = 6;                   /* toys on the neko's shelf */
let toyQuiz = { set: null, way: "r" };     /* the round to open: rd-again opens it again */

/* Quiz me, at the foot of the Collection card: the set on show, and only
   it — three tiles, the way in Japanese over English, and the best round
   under it. A set not yet full gets one line saying so (with the shelf
   open; folded, the card stays as it is). */
function toyQuizHtml(S, shown) {
  if (!setDone(S, state.gacha.owned)) return shown ? `<p class="muted small gq-hint">Fill this shelf and you can be quizzed on its twenty names: by ear, by sight, or by handing the neko what it asks for.</p>` : "";
  const b = (state.gacha.quiz || {})[S.id] || {};
  return `<div class="gq-set">
    <div class="gq-name">Quiz me on <span lang="ja">${wordHtml(S.jp)}</span> ${esc(S.en)}</div>
    <div class="gq-btns">${Object.entries(TOY_QUIZ_WAYS).map(([w, [jp, en]]) =>
      `<button class="gq-btn" data-act="gq-start" data-s="${S.id}" data-w="${w}" ${hearsIt(w) && !state.settings.sound ? "disabled" : ""}>
        <span class="gq-jp" lang="ja">${jp}</span><span class="gq-en">${en}</span>${b[w] != null ? `<small>best ${b[w]}/${TOY_QUIZ_N}</small>` : ""}</button>`).join("")}</div>
    ${state.settings.sound ? "" : `<p class="muted small">Listen and Neko asks need sound — it's off in Settings.</p>`}
  </div>`;
}

function toyQuizStart(setId, way) {
  const S = TOY_SETS.find(x => x.id === setId);
  if (!S || !setDone(S, state.gacha.owned)) return;
  toyQuiz = { set: S.id, way };
  openRead("toys");
}

/* called by openRead */
function toyQuizOpen() {
  const S = TOY_SETS.find(x => x.id === toyQuiz.set);
  if (!S) return closeRead();
  loadBundle("gacha");
  Object.assign(RD, { set: S, way: toyQuiz.way, lines: sample(S.toys, TOY_QUIZ_N), n: TOY_QUIZ_N });
  $("#rdStrip").innerHTML = Array.from({ length: RD.n }, (_, i) => `<i data-i="${i}"></i>`).join("");
  rdStep();
}

function toyQuizShow() {
  if (RD.way === "n") return toyNekoShow();
  const t = RD.lines[RD.i], listen = RD.way === "l";
  const opts = shuffle([t, ...sample(RD.set.toys.filter(x => x !== t), 3)]);
  RD.q = { x: t, opts, answered: false };
  $("#rdPace").textContent = `${RD.i + 1} of ${RD.n}`;
  $("#rdBody").innerHTML = `<div class="gq-play">
    <p class="muted">${listen ? "Listen. Which toy is it?" : "Read it. Which toy is it?"}</p>
    ${listen ? `<button class="play" data-act="gq-hear" aria-label="Hear it again">${icon("speaker")}</button>`
      : `<div class="gq-word" lang="ja">${wordHtml(t.w, "always")}</div>`}
    <div class="gq-opts">${opts.map((o, i) => `<button class="opt gq-opt" data-act="gq-opt" data-i="${i}"><kbd>${i + 1}</kbd>
      <span class="gm-fig">${toyArt(o.id)}</span><span class="gq-m">${esc(o.m)}</span></button>`).join("")}</div>
    <div class="verdict gq-why" id="gqWhy" aria-live="polite"></div>
  </div>`;
  if (listen) say(furiKana(t.w));
}

/* The neko asks for a toy by name — ＿＿をください, "___, please" — and you
   hand it over: a shelf of six, pictures only. Its bubble shows the word
   once you've answered. */
const nekoBubble = (t, shown) => `<div class="gq-bubble" lang="ja">${shown ? `<b>${wordHtml(t.w, "always")}</b>` : `<button class="gq-blank" data-act="gq-hear" aria-label="Hear it again">${icon("speaker")}</button>`}を ください！
  <small lang="en">${shown ? esc(t.m) : "___"}, please!</small></div>`;

function toyNekoShow() {
  const t = RD.lines[RD.i];
  const opts = shuffle([t, ...sample(RD.set.toys.filter(x => x !== t), TOY_NEKO_N - 1)]);
  RD.q = { x: t, opts, answered: false };
  $("#rdPace").textContent = `${RD.i + 1} of ${RD.n}`;
  $("#rdBody").innerHTML = `<div class="gq-play gq-neko">
    <div class="gq-ask"><span id="gqNeko">${neko("happy", "bob")}</span><span id="gqBubble">${nekoBubble(t, false)}</span></div>
    <div class="gq-shelf">${opts.map((o, i) => `<button class="gq-toy" data-act="gq-opt" data-i="${i}" aria-label="${esc(o.m)}"><kbd>${i + 1}</kbd><span class="gm-fig">${toyArt(o.id)}</span></button>`).join("")}</div>
    <div class="verdict gq-why" id="gqWhy" aria-live="polite"></div>
  </div>`;
  say(furiKana(t.w));
}

function toyQuizAnswer(i) {
  const q = RD?.q;
  if (!q || q.answered || !q.opts[i]) return;
  q.answered = true;
  const ok = q.opts[i] === q.x;
  RD.res[RD.i] = ok ? "ok" : "miss";
  if (RD.way === "n") return toyNekoAnswer(q, i, ok);
  $$(".gq-opt").forEach((b, j) => { b.disabled = true; if (q.opts[j] === q.x) b.classList.add("right"); else if (j === i) b.classList.add("wrong"); });
  /* the answer, whichever way it was asked: the word with its reading, and its meaning */
  const v = $("#gqWhy");
  v.className = "verdict gq-why " + (ok ? "ok" : "miss");
  v.innerHTML = `${icon(ok ? "check" : "close", "v-ico")} <b lang="ja">${wordHtml(q.x.w, "always")}</b> ${esc(q.x.m)}`;
  if (RD.way === "r") say(furiKana(q.x.w));
  rdStrip();
  if (ok) RD.next = setTimeout(() => { if (RD?.q === q) { RD.i++; rdStep(); } }, 1300);
  else $("#rdFoot").innerHTML = `<button class="btn btn-ghost" data-act="gq-hear">${icon("speaker")} Again</button><button class="btn" id="rdNext" data-act="rd-next">Next <kbd>↵</kbd></button>`;
}

function toyNekoAnswer(q, i, ok) {
  $$(".gq-toy").forEach((b, j) => { b.disabled = true; if (q.opts[j] === q.x) b.classList.add("right"); else if (j === i) b.classList.add("wrong"); });
  /* the right toy hops over; the neko cheers, or wonders */
  $(".gq-toy.right")?.classList.add("bounce");
  $("#gqNeko").innerHTML = neko(ok ? "cheer" : "think", "hop");
  $("#gqBubble").innerHTML = nekoBubble(q.x, true);
  const v = $("#gqWhy");
  v.className = "verdict gq-why " + (ok ? "ok" : "miss");
  v.innerHTML = ok ? `${icon("check", "v-ico")} ありがとう！ <small class="muted">Thank you!</small>`
    : `${icon("close", "v-ico")} That one's <b lang="ja">${wordHtml(q.opts[i].w, "always")}</b>, ${esc(q.opts[i].m)}.`;
  rdStrip();
  if (ok) RD.next = setTimeout(() => { if (RD?.q === q) { RD.i++; rdStep(); } }, 1500);
  else $("#rdFoot").innerHTML = `<button class="btn btn-ghost" data-act="gq-hear">${icon("speaker")} Again</button><button class="btn" id="rdNext" data-act="rd-next">Next <kbd>↵</kbd></button>`;
}

/* called by rdFinish */
function toyQuizFinish() {
  RD.done = true;
  clearTimeout(RD.next);
  addStudyTime(performance.now() - RD.t0);
  const right = RD.res.filter(x => x === "ok").length, total = RD.n;
  const quiz = state.gacha.quiz || (state.gacha.quiz = {});
  const b = quiz[RD.set.id] || (quiz[RD.set.id] = {});
  const best = right > (b[RD.way] || 0);
  if (b[RD.way] == null || best) b[RD.way] = right;
  /* coins: one a toy named, three for a best — as the Read tab's rounds pay */
  const paid = earnCoins(right + (best ? 3 : 0));
  save();
  crumb(`toy quiz ${RD.set.id} ${RD.way} ${right}/${total}`);
  rdStrip();
  const missed = RD.lines.filter((_, i) => RD.res[i] !== "ok");
  $("#rdBody").innerHTML = `<div class="finish">
    <div class="celebrate">${neko(best ? "cheer" : right >= total * 0.75 ? "happy" : "think", "hop")}${best ? stamp("新記録") : ""}</div>
    <div class="finish-big">${right}<small>/${total}</small></div>
    <p><span lang="ja">${wordHtml(RD.set.jp)}</span> ${esc(RD.set.en)} · ${TOY_QUIZ_WAYS[RD.way][1].toLowerCase()}</p>
    ${best ? `<div class="badge-best">New best</div>` : ""}
    ${missed.length ? `<div class="gq-missed"><p class="muted small">To go over — tap one to hear it:</p>
      <div class="chips">${missed.map(t => `<button class="chip" data-act="ga-hear" data-t="${t.id}"><b lang="ja">${wordHtml(t.w, "always")}</b> <small>${esc(t.m)}</small></button>`).join("")}</div></div>` : ""}
    ${paid}
  </div>`;
  if (best) petals($("#read"), 24);
  $("#rdFoot").innerHTML = `<button class="btn btn-ghost" data-act="rd-close">Done <kbd>Esc</kbd></button>
    <button class="btn" data-act="rd-again">Again <kbd>↵</kbd></button>`;
}

function toyQuizKey(e) {
  if (/^[1-6]$/.test(e.key)) { e.preventDefault(); toyQuizAnswer(+e.key - 1); }
  else if ((e.key === "Enter" || e.key === " ") && $("#rdNext")) { e.preventDefault(); ACTS["rd-next"](); }
  else if (e.key === "r" || e.key === "R") { e.preventDefault(); ACTS["gq-hear"](); }
  return true;
}

function gachaKey(e) {
  if ($("#gaDone")) { if (e.key === "Enter" || e.key === "Escape" || e.key === " ") { e.preventDefault(); ACTS["ga-done-close"](); } return true; }
  if (!$("#gaOpen")) return false;
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); gachaKeep(); }
  return true;
}

Object.assign(ACTS, {
  "ga-spin": () => gachaSpin(),
  "ga-crack": () => gachaCrack(),
  "ga-keep": () => gachaKeep(),
  "ga-hear": el => { const t = TOY_BY[el.dataset.t]; if (t) { say(furiKana(t.w)); el.classList.remove("bounce"); void el.offsetWidth; el.classList.add("bounce"); } },
  "ga-shelf-fold": () => {
    gaShelfOpen = !shelfOpen();
    try { localStorage.setItem("nq-shelf", gaShelfOpen ? "1" : "0"); } catch {}
    const s = $("#gmShelves"); if (s) s.outerHTML = shelfHtml();
  },
  "ga-shelf": el => { gaShelf = el.dataset.s; const s = $("#gmShelves"); if (s) s.outerHTML = shelfHtml(); },
  "ga-done-close": () => { $("#gaDone")?.remove(); if (nextSetDone()) return; gaShelf = null; render(); },
  "ga-spin-all": () => gachaSpinAll(),
  "gq-start": el => {
    /* from the set-complete card too: that card goes, and any after it */
    if ($("#gaDone")) { $("#gaDone").remove(); gaDoneQueue = []; gaShelf = null; render(); }
    toyQuizStart(el.dataset.s, el.dataset.w);
  },
  "gq-opt": el => toyQuizAnswer(+el.dataset.i),
  "gq-hear": () => { if (RD?.q) say(furiKana(RD.q.x.w)); },
  "ga-go": () => { closeRead(); if (typeof SP !== "undefined" && SP) ACTS["sp-close"](); go("games"); },
});
