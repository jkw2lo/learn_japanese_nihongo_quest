/* Nihongo Quest — the phone's way round.

   On a phone the tab row doesn't fit, and a phone is held from the bottom,
   so the sections live behind a round button at the bottom right — a
   thumb's reach — and open in two tiers. At the foot of the screen is a
   wheel of the five groups (app.js NAV_GROUPS): a rounded capsule, one
   row, each group snapping to the centre, looping so it never runs out.
   Above it, the group in the middle shows what's in it as squares, all at
   once: Study's four sections, Practise's four, Play's games and the
   capsule machine, Out & about's places, Record. Spinning the wheel is
   choosing a group; tapping a square is going there. Everything here is
   inert on a desktop: the button and the drawer are display: none outside
   the phone layer of the stylesheet.

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
  const original = [...nav.children];
  nav._len = original.length;
  const copy = () => { const f = document.createDocumentFragment(); original.forEach(el => f.appendChild(el.cloneNode(true))); return f; };
  for (let i = 0; i < (WHEEL_COPIES - 1) / 2; i++) { nav.insertBefore(copy(), nav.firstChild); nav.appendChild(copy()); }
  nav._items = [...nav.children];
  let settle = null, ticking = false;
  const wrap = () => {
    const n = Math.round((nav.scrollLeft - nav._home) / nav._w);
    if (n) nav.scrollLeft -= n * nav._w;
  };
  nav.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; drawerTick(); }); }
    /* without scrollend (older Safari), settled means quiet for a moment */
    if (!("onscrollend" in window)) { clearTimeout(settle); settle = setTimeout(() => { if (!nav._down) wrap(); }, 160); }
  }, { passive: true });
  nav.addEventListener("scrollend", wrap);
  const down = () => { nav._down = true; }, up = () => { nav._down = false; };
  nav.addEventListener("touchstart", down, { passive: true });
  nav.addEventListener("touchend", up, { passive: true });
  nav.addEventListener("touchcancel", up, { passive: true });
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

/* Put the current section's group in the middle of the middle copy. */
function centerDrawer() {
  const nav = $("#drawerNav");
  if (!nav || !nav._len) return;
  const base = nav._len * (WHEEL_COPIES - 1) / 2, g = navGroup(view);
  const idx = nav._items.slice(base, base + nav._len).findIndex(el => el.dataset.g === g);
  nav.scrollLeft = nav._c[base + Math.max(0, idx)] - nav.clientWidth / 2;
}

/* The wheel look: a chip scales and fades as it moves away from centre.
   The one in the middle is marked and its squares shown, and a phone that
   can buzz gives the faintest tick as each new group lands there — what
   makes a wheel feel like it clicks into place. */
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
    showGroup(best.dataset.g);
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
  drawerMid = null;
  $("#drawerSub").dataset.g = "";
  drawerTick();
}

function closeDrawer() {
  const d = $("#drawer");
  if (!d.classList.contains("on")) return;
  d.classList.remove("on");
  d.hidden = true;
  $("#burger").setAttribute("aria-expanded", "false");
}

const drawerOpen = () => $("#drawer").classList.contains("on");

/* ---------- the squares above the wheel ---------- */

function subTile({ jp, en, act, note = "", shut = false, on = false, isNew = false }) {
  return `<button class="ds-tile ${shut ? "shut" : ""} ${on ? "on" : ""}" ${act}>
    ${isNew ? `<span class="ds-new">new</span>` : ""}
    <span class="ds-jp ${[...jp].length > 3 ? "long" : ""}" lang="ja">${jp}</span><span class="ds-en">${esc(en)}</span>${shut ? `<span class="ds-note">${icon("lock")}</span>` : note ? `<span class="ds-note">${note}</span>` : ""}</button>`;
}

/* a section of the app, in the order the stage puts it */
const sectionTile = v => subTile({ jp: SECTION_NAME[v][0], en: SECTION_NAME[v][1].replace("&amp;", "&"), on: view === v, act: `data-act="nav" data-nav="${v}"` });
const groupSections = g => navOrder().filter(v => navGroup(v) === g);

function subGamesHtml() {
  const pool = readPool();
  /* a game that isn't open yet goes to its card, which says what it waits for */
  const game = (jp, en, r, open, card) => subTile({ jp, en, shut: !open,
    act: open ? `data-act="rd-start" data-r="${r}"` : `data-act="nav-card" data-nav="games" data-card="${card}"` });
  return `
    ${subTile({ jp: "遊ぶ", en: "All games", on: view === "games", act: `data-act="nav" data-nav="games"` })}
    ${subTile({ jp: "ガチャ", en: "Capsule machine", act: `data-act="nav-card" data-nav="games" data-card="gm-machine"`,
      note: spinFree() ? "a free turn" : "" })}
    ${game("忍者", "Ninja slice", "ninja", ninjaKinds().length > 0, "gm-ninja")}
    ${game("めくる", "Swipe deck", "deck", deckModesOpen().length > 0, "gm-deck")}
    ${game("探す", "Word search", "search", searchable(pool).length >= 6, "rd-search")}
    ${game("結ぶ", "Match", "match", pool.length >= 8, "rd-match")}`;
}

function subOutHtml() {
  return subTile({ jp: "街", en: "All places", on: view === "menu" && !menuId, act: `data-act="out-home"` }) + places().map(p => {
    const pr = placeProgress(p);
    return subTile({ jp: esc(p.jp), en: p.en, shut: !pr.open, isNew: placeNew(p), on: view === "menu" && menuId === p.id,
      note: pr.open ? `${pr.ok}/${pr.n}` : "", act: `data-act="nav-place" data-id="${p.id}"` });
  }).join("");
}

function showGroup(g) {
  const box = $("#drawerSub");
  if (!box || box.dataset.g === g) return;
  const name = NAV_GROUPS[g];
  const tiles = g === "play" ? subGamesHtml() : g === "out" ? subOutHtml() : groupSections(g).map(sectionTile).join("");
  const note = g === "play" ? `<span class="ds-go">${coinArt()} ${coins()} coins</span>`
    : g === "out" ? `<span class="ds-go">${places().filter(p => placeProgress(p).open).length} of ${places().length} open</span>` : "";
  box.dataset.g = g;
  box.innerHTML = `<div class="ds-head"><i></i><span lang="ja">${name[0]}</span> ${esc(name[1])}${note}</div>
    <div class="ds-grid">${tiles}</div>`;
  box.scrollTop = 0;
}

/* A tap on a group brings it to the middle, which shows its squares. */
function pickGroup(chip) {
  const nav = $("#drawerNav");
  nav.scrollTo({ left: nav._c[nav._items.indexOf(chip)] - nav.clientWidth / 2, behavior: "smooth" });
}

/* Anything tapped inside the drawer closes it first; the tap then does its
   own job (going to a section, opening Settings). Capture phase, so it runs
   before the delegated handler in app.js. A group on the wheel only turns
   it, so the drawer stays. */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (!el || el.dataset.act === "drawer-group") return;
  if (el.closest(".drawer-sub, .d-settings")) closeDrawer();
}, true);

addEventListener("keydown", e => { if (e.key === "Escape" && drawerOpen()) { closeDrawer(); e.stopPropagation(); } }, true);

/* Upright on a phone: the manifest says "portrait" (0.57.0). An installed
   app keeps the manifest it was installed with until Chrome refreshes it,
   so a change there can take days to arrive, or a reinstall. Locking from
   here was tried and can't work: Chrome only allows screen.orientation.lock()
   in fullscreen, not in an installed app's standalone window. */

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
  "drawer-group": el => pickGroup(el),
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
