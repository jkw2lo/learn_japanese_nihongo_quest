/* Nihongo Quest — 遊ぶ Games: the games, the coins they pay, and the
   capsule machine those coins turn (README → Games).

   The games — Ninja slice and the Swipe deck (arcade-ui.js), Word search
   and Match (read-ui.js) — play in the Read tab's overlay; they only live
   here. Each pays coins as it ends (earnCoins), and so do the Read tab's
   rounds and every sprint, a little less; a turn of the
   machine costs SPIN_COST and drops a capsule from the set being collected
   (js/data/toys.js); the toy goes on the shelf, under its name. A full shelf
   opens the next set. state.gacha:
     earned  coins ever earned      spent  coins ever spent
     owned   toy id -> how many     dry    turns in a row with nothing new
   Coins are earned − spent, so two devices merge by taking the larger of
   each (srs.js mergeState). */

const coins = () => Math.max(0, (state.gacha.earned || 0) - (state.gacha.spent || 0));
const spinFree = () => !(state.gacha.spent || 0) && !Object.keys(state.gacha.owned).length;
const canSpin = () => spinFree() || coins() >= SPIN_COST;

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
      <button class="btn gm-turn" data-act="ga-spin" ${canSpin() && !gaBusy ? "" : "disabled"}>${spinFree() ? "Turn the handle — the first one's free" : `Turn the handle · ${coinArt()} ${SPIN_COST}`}</button>
      ${!canSpin() ? `<p class="muted small">${SPIN_COST - coins()} more coins for a turn — a game pays about twenty.</p>` : ""}
    </section>
    ${shelfHtml()}
    ${ninjaCard()}
    ${deckCard()}
    ${searchCard(pool)}
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
  </section>`;
  const rows = [];
  for (let i = 0; i < S.toys.length; i += 5) rows.push(S.toys.slice(i, i + 5));
  return `<section class="card gm-shelves" id="gmShelves">${head}
    <div class="seg gm-tabs">${TOY_SETS.map((x, i) => `<button class="${x === S ? "on" : ""}" data-act="ga-shelf" data-s="${x.id}" ${open(x) ? "" : "disabled"}>
      ${open(x) ? "" : icon("lock")}<span lang="ja">${furiPlain(x.jp)}</span> ${i + 1}</button>`).join("")}</div>
    <p class="muted small">${setDone(S, owned) ? `<b>${esc(S.en)}</b> — complete. Tap a toy to hear its name.` : `<b>${esc(S.en)}</b> — ${S.toys.length - have} still to find. Tap a toy to hear its name.`}</p>
    <div class="gm-shelf">${rows.map(r => `<div class="gm-row">${r.map(t => toySlot(t, owned[t.id])).join("")}</div>`).join("")}</div>
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
  if (!free) g.spent = (g.spent || 0) + SPIN_COST;
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
    if (state.settings.sound) say(furiKana(box._toy.w));
    if (box._toy.rare || box._done) petals(box, 20);
  }, 380);
}

function gachaKeep() {
  const box = $("#gaOpen");
  if (!box) return;
  if (!box.classList.contains("cracked")) return gachaCrack();
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

function showSetDone(S, next) {
  const box = document.createElement("div");
  box.className = "ga-open on";
  box.id = "gaDone";
  box.innerHTML = `<div class="ga-card ga-complete" role="dialog" aria-modal="true" aria-label="Set complete">
    <div class="celebrate">${neko("cheer", "hop")}${stamp("全部")}</div>
    <h2>${esc(S.en)} — complete!</h2>
    <p>All ${S.toys.length} on the shelf.${next ? ` The next set is open: <b><span lang="ja">${wordHtml(next.jp)}</span> ${esc(next.en)}</b>.` : " That's every set there is — for now."}</p>
    <div class="ga-acts"><button class="btn" data-act="ga-done-close">${next ? "On to the next set" : "Lovely"} <kbd>↵</kbd></button></div>
  </div>`;
  document.body.appendChild(box);
  petals(box, 30);
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
  "ga-done-close": () => { $("#gaDone")?.remove(); gaShelf = null; render(); },
  "ga-go": () => { closeRead(); if (typeof SP !== "undefined" && SP) ACTS["sp-close"](); go("games"); },
});
