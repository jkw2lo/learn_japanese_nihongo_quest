/* Nihongo Quest — the phone's way round.

   On a phone the tab row doesn't fit, and a phone is held from the bottom,
   so the sections live behind a round button at the bottom right — a
   thumb's reach — and open as a rolodex: a rounded capsule at the foot of
   the screen, one row, each section snapping to the centre, looping so it
   never runs out. The sections come in coloured groups (app.js NAV_GROUPS),
   and the group of the one in the middle is named above the wheel. Games
   and Out & about don't go straight to their page: they open a panel of
   squares above the wheel, a game or a place each. Everything here is inert
   on a desktop: the button and the drawer are display: none outside the
   phone layer of the stylesheet.

   The loop is Hanzi Quest's (porting.md C4), with five copies of the row
   rather than three, so a hard flick never reaches an end: once scrolling
   has settled, a silent jump of a whole number of copies lands on the
   identical spot in the middle one. A copy's width is measured from one
   copy's first chip to the next's — not the scroll width over the number
   of copies, which counts the padding at both ends and made every jump
   land a chip off. Taps are delegated by data-act, so the clones work
   without any rebinding — the trap that note warns about. */

const PHONE_MQ = matchMedia("(max-width: 720px)");
const isPhone = () => PHONE_MQ.matches;
const WHEEL_COPIES = 5;

function initDrawerLoop() {
  const nav = $("#drawerNav");
  if (!nav || nav._len) return;
  if (typeof orderNav === "function") orderNav();     /* the stage's order, before the copies are made */
  const original = [...nav.children];
  nav._len = original.length;
  const copy = () => { const f = document.createDocumentFragment(); original.forEach(el => f.appendChild(el.cloneNode(true))); return f; };
  for (let i = 0; i < (WHEEL_COPIES - 1) / 2; i++) { nav.insertBefore(copy(), nav.firstChild); nav.appendChild(copy()); }
  nav._items = [...nav.children];
  markGroups(nav);
  let settle = null, ticking = false;
  const wrap = () => {
    const n = Math.round((nav.scrollLeft - nav._home) / nav._w);
    if (!n) return;
    nav.scrollLeft -= n * nav._w;
    if (sub) sub.x -= n * nav._w;
  };
  nav.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; drawerTick(); }); }
    /* a finger moving the wheel away from Games or Out puts their panel away */
    if (sub && nav._touched && Math.abs(nav.scrollLeft - sub.x) > 40) closeSub();
    /* without scrollend (older Safari), settled means quiet for a moment */
    if (!("onscrollend" in window)) { clearTimeout(settle); settle = setTimeout(() => { if (!nav._down) wrap(); }, 160); }
  }, { passive: true });
  nav.addEventListener("scrollend", wrap);
  const down = () => { nav._down = nav._touched = true; }, up = () => { nav._down = false; };
  nav.addEventListener("touchstart", down, { passive: true });
  nav.addEventListener("touchend", up, { passive: true });
  nav.addEventListener("touchcancel", up, { passive: true });
  nav.addEventListener("wheel", () => { nav._touched = true; }, { passive: true });
}

/* Where every chip's centre is along the row, measured once the drawer is
   showing, so each frame of a scroll only reads scrollLeft. */
function measureDrawer() {
  const nav = $("#drawerNav");
  const it = nav._items;
  nav._c = it.map(b => b.offsetLeft + b.offsetWidth / 2);
  nav._w = it[nav._len].offsetLeft - it[0].offsetLeft;
  /* the middle copy's first chip, centred */
  nav._home = nav._c[nav._len * (WHEEL_COPIES - 1) / 2] - nav.clientWidth / 2;
}

/* Put the current section in the middle of the middle copy. */
function centerDrawer() {
  const nav = $("#drawerNav");
  if (!nav || !nav._len) return;
  const base = nav._len * (WHEEL_COPIES - 1) / 2;
  const idx = nav._items.slice(base, base + nav._len).findIndex(el => el.dataset.nav === view);
  nav.scrollLeft = nav._c[base + Math.max(0, idx)] - nav.clientWidth / 2;
}

/* The wheel look: a chip scales and fades as it moves away from centre.
   The one in the middle is marked, its group named above the wheel, and a
   phone that can buzz gives the faintest tick as each new section lands
   there — what makes a wheel feel like it clicks into place. */
let drawerMid = null;
function drawerTick() {
  const nav = $("#drawerNav");
  if (!nav || !nav._c) return;
  const half = nav.clientWidth / 2 || 1, mid = nav.scrollLeft + half;
  let best = null, bestD = 2;
  nav._items.forEach((b, i) => {
    const d = Math.min(1, Math.abs(nav._c[i] - mid) / half);
    if (d < bestD) { bestD = d; best = b; }
    if (d === 1 && b._d === 1) return;     /* off to the side, and already drawn there */
    b._d = d;
    b.style.transform = `scale(${(1 - d * 0.3).toFixed(3)})`;
    b.style.opacity = (1 - d * 0.7).toFixed(3);
  });
  if (best && best !== drawerMid) {
    drawerMid?.classList.remove("mid");
    best.classList.add("mid");
    if (drawerMid && navigator.vibrate) { try { navigator.vibrate(6); } catch {} }
    drawerMid = best;
    const g = $("#drawerGroup"), name = NAV_GROUPS[best.dataset.g];
    if (g && name && g.dataset.g !== best.dataset.g) { g.dataset.g = best.dataset.g; g.innerHTML = `<i></i><span lang="ja">${name[0]}</span> ${name[1]}`; }
  }
}

function openDrawer() {
  initDrawerLoop();
  const d = $("#drawer");
  d.hidden = false;
  d.classList.add("on");
  $("#burger").setAttribute("aria-expanded", "true");
  /* reading offsetLeft forces the layout, so this can run straight away —
     no waiting on a frame, which a backgrounded tab never gets */
  measureDrawer();
  centerDrawer();
  $("#drawerNav")._touched = false;
  drawerTick();
}

function closeDrawer() {
  const d = $("#drawer");
  if (!d.classList.contains("on")) return;
  closeSub();
  d.classList.remove("on");
  d.hidden = true;
  $("#burger").setAttribute("aria-expanded", "false");
}

const drawerOpen = () => $("#drawer").classList.contains("on");

/* ---------- the panel of squares over the wheel ---------- */

let sub = null;              /* { name, x }: which panel, and where the wheel was when it opened */

function subTile({ jp, en, act, note = "", shut = false, on = false, isNew = false }) {
  return `<button class="ds-tile ${shut ? "shut" : ""} ${on ? "on" : ""}" ${act}>
    ${isNew ? `<span class="ds-new">new</span>` : ""}
    <span class="ds-jp" lang="ja">${jp}</span><span class="ds-en">${esc(en)}</span>${shut ? `<span class="ds-note">${icon("lock")}</span>` : note ? `<span class="ds-note">${note}</span>` : ""}</button>`;
}

function subGamesHtml() {
  const pool = readPool();
  /* a game that isn't open yet goes to its card, which says what it waits for */
  const game = (jp, en, r, open, card) => subTile({ jp, en, shut: !open,
    act: open ? `data-act="rd-start" data-r="${r}"` : `data-act="nav-card" data-nav="games" data-card="${card}"` });
  return `<button class="ds-head" data-act="nav" data-nav="games" data-g="play"><span lang="ja">遊ぶ</span> Games<span class="ds-go">the page ›</span></button>
    <div class="ds-grid">
      ${subTile({ jp: "ガチャ", en: "Capsule machine", act: `data-act="nav-card" data-nav="games" data-card="gm-machine"`,
        note: spinFree() ? "a free turn" : `${coinArt()} ${coins()}${canSpin() ? " · turn it" : ""}` })}
      ${game("忍者", "Ninja slice", "ninja", ninjaKinds().length > 0, "gm-ninja")}
      ${game("めくる", "Swipe deck", "deck", deckModesOpen().length > 0, "gm-deck")}
      ${game("探す", "Word search", "search", searchable(pool).length >= 6, "rd-search")}
      ${game("結ぶ", "Match", "match", pool.length >= 8, "rd-match")}
    </div>`;
}

function subOutHtml() {
  return `<button class="ds-head" data-act="out-home" data-g="out"><span lang="ja">街</span> Out &amp; about<span class="ds-go">every place ›</span></button>
    <div class="ds-grid ds-places">${places().map(p => {
      const pr = placeProgress(p);
      return subTile({ jp: esc(p.jp), en: p.en, shut: !pr.open, isNew: placeNew(p), on: view === "menu" && menuId === p.id,
        note: pr.open ? `${pr.ok}/${pr.n}` : "", act: `data-act="nav-place" data-id="${p.id}"` });
    }).join("")}</div>`;
}

function openSub(name, chip) {
  if (sub && sub.name === name) return closeSub();
  const nav = $("#drawerNav"), box = $("#drawerSub");
  box.innerHTML = name === "games" ? subGamesHtml() : subOutHtml();
  box.dataset.g = chip.dataset.g;
  box.hidden = false;
  box.scrollTop = 0;
  $("#drawer").classList.add("sub-on");
  $$(".drawer-nav [data-sub]").forEach(b => b.classList.toggle("sub", b.dataset.sub === name));
  /* bring the chip to the middle; only a finger moving the wheel after this
     puts the panel away */
  const i = nav._items.indexOf(chip);
  const x = nav._c[i] - nav.clientWidth / 2;
  sub = { name, x };
  nav._touched = false;
  nav.scrollTo({ left: x, behavior: "smooth" });
}

function closeSub() {
  if (!sub) return;
  sub = null;
  const box = $("#drawerSub");
  box.hidden = true;
  box.innerHTML = "";
  $("#drawer").classList.remove("sub-on");
  $$(".drawer-nav .sub").forEach(b => b.classList.remove("sub"));
}

/* Anything tapped inside the drawer closes it first; the tap then does its
   own job (going to a section, opening Settings). Capture phase, so it runs
   before the delegated handler in app.js. Games and Out & about only open
   their panel, so the drawer stays. */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el || el.dataset.act === "drawer-sub") return;
  if (el.closest(".drawer-nav, .drawer-tools, .drawer-sub")) closeDrawer();
}, true);

addEventListener("keydown", e => {
  if (e.key === "Escape" && drawerOpen()) { sub ? closeSub() : closeDrawer(); e.stopPropagation(); }
}, true);

/* Upright, always, on a phone. 0.47 took "orientation": "any" out of the
   manifest so the system's rotation lock would decide, but an installed app
   keeps the manifest it was installed with until Chrome gets round to
   refreshing it, and it went on turning sideways. An installed app can lock
   itself, and does, every time it comes back to the front. A browser tab
   can't (the promise rejects), and needs nothing: it follows the system.
   Tablets, wider than 600px either way, are left to turn. */
function holdPortrait() {
  if (!matchMedia("(display-mode: standalone), (display-mode: fullscreen)").matches) return;
  if (Math.min(screen.width, screen.height) >= 600) return;
  try { screen.orientation?.lock?.("portrait")?.catch(() => {}); } catch {}
}
holdPortrait();
document.addEventListener("visibilitychange", () => { if (!document.hidden) holdPortrait(); });

/* The section's name in the top bar, since there's no tab row to show it. */
const SECTION_NAME = { today: ["今日", "Today"], kana: ["かな", "Kana"], words: ["言葉", "Words"], grammar: ["文法", "Grammar"], read: ["読む", "Read"], games: ["遊ぶ", "Games"], cards: ["札", "Cards"], book: ["帳", "Notebook"], menu: ["街", "Out &amp; about"], sprint: ["速", "Sprint"], record: ["記録", "Record"] };
function phoneTitle() {
  const t = $("#mTitle");
  const n = SECTION_NAME[view];
  if (t && n) t.innerHTML = `<span lang="ja">${n[0]}</span> ${n[1]}`;
}

/* On a phone the order card rides along at the top while you scroll the
   menu, and a finished order scrolls its receipt into view. */
function phoneAfterRender() {
  phoneTitle();
  if (!isPhone()) return;
  if (view === "menu" && typeof game !== "undefined" && game && game.done) {
    $(".receipt")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

Object.assign(ACTS, {
  drawer: () => drawerOpen() ? closeDrawer() : openDrawer(),
  "drawer-close": () => closeDrawer(),
  "drawer-sub": el => openSub(el.dataset.sub, el),
  /* a section, scrolled to one of its cards */
  "nav-card": el => {
    go(el.dataset.nav);
    const card = $("." + el.dataset.card);
    /* clear of the top bar, which stays put over the page */
    if (card) scrollTo(0, card.getBoundingClientRect().top + scrollY - ($(".topbar")?.offsetHeight || 0) - 12);
  },
  /* a place, straight from the panel */
  "nav-place": el => {
    ACTS["menu-pick"](el);
    if (view !== "menu") { go("menu"); if (typeof WALKS !== "undefined" && WALKS[menuId]) kbFitScroll(); }
  },
});
