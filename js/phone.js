/* Nihongo Quest — the phone's way round.

   On a phone the tab row doesn't fit, and a phone is held from the bottom,
   so the sections live behind a round button at the bottom right — a
   thumb's reach — and open as a rolodex: a rounded capsule at the foot of
   the screen, one row, each section snapping to the centre, looping so it
   never runs out. Everything here is inert on a desktop: the button and the
   drawer are display: none outside the phone layer of the stylesheet.

   The loop is Hanzi Quest's (porting.md C4): three copies of the row back
   to back; scroll into either outer copy and, once scrolling has settled,
   a silent jump of exactly one copy's width lands on the identical spot in
   the middle one. Taps are delegated by data-act, so the clones work
   without any rebinding — the trap that note warns about. */

const PHONE_MQ = matchMedia("(max-width: 720px)");
const isPhone = () => PHONE_MQ.matches;

function initDrawerLoop() {
  const nav = $("#drawerNav");
  if (!nav || nav._len) return;
  const original = [...nav.children];
  nav._len = original.length;
  original.forEach(el => nav.appendChild(el.cloneNode(true)));
  /* the copy in front has to keep the same order — inserting each clone at
     the very start, one by one, reversed it, and scrolling left from Today
     met Today again */
  const before = document.createDocumentFragment();
  original.forEach(el => before.appendChild(el.cloneNode(true)));
  nav.insertBefore(before, nav.firstChild);
  let settle = null, ticking = false;
  nav.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; drawerTick(); }); }
    clearTimeout(settle);
    settle = setTimeout(() => {
      const third = nav.scrollWidth / 3;
      if (nav.scrollLeft < third * 0.5) nav.scrollLeft += third;
      else if (nav.scrollLeft > third * 1.5) nav.scrollLeft -= third;
    }, 90);
  }, { passive: true });
}

/* Put the current section in the middle of the middle copy. */
function centerDrawer() {
  const nav = $("#drawerNav");
  if (!nav || !nav._len) return;
  const items = [...nav.children];
  const idx = items.slice(nav._len, nav._len * 2).findIndex(el => el.dataset.nav === view);
  const el = items[nav._len + Math.max(0, idx)];
  const navBox = nav.getBoundingClientRect(), elBox = el.getBoundingClientRect();
  nav.scrollLeft += (elBox.left + elBox.width / 2) - (navBox.left + navBox.width / 2);
}

/* The wheel look: a chip scales and fades as it moves away from centre.
   The one in the middle is marked, and a phone that can buzz gives the
   faintest tick as each new section lands there — what makes a wheel feel
   like it clicks into place. */
let drawerMid = null;
function drawerTick() {
  const nav = $("#drawerNav");
  if (!nav) return;
  const box = nav.getBoundingClientRect();
  const mid = box.left + box.width / 2;
  let best = null, bestD = 2;
  [...nav.children].forEach(b => {
    const r = b.getBoundingClientRect();
    const d = Math.min(1, Math.abs(r.left + r.width / 2 - mid) / (box.width / 2 || 1));
    b.style.transform = `scale(${(1 - d * 0.3).toFixed(3)})`;
    b.style.opacity = (1 - d * 0.7).toFixed(3);
    if (d < bestD) { bestD = d; best = b; }
  });
  if (best && best !== drawerMid) {
    drawerMid?.classList.remove("mid");
    best.classList.add("mid");
    if (drawerMid && navigator.vibrate) { try { navigator.vibrate(6); } catch {} }
    drawerMid = best;
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
  centerDrawer();
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

/* Anything tapped inside the drawer closes it first; the tap then does its
   own job (going to a section, opening Settings). Capture phase, so it runs
   before the delegated handler in app.js. */
document.addEventListener("click", e => {
  const el = e.target.closest("[data-act]");
  if (el && (el.closest(".drawer-nav") || el.closest(".drawer-tools"))) closeDrawer();
}, true);

addEventListener("keydown", e => { if (e.key === "Escape" && drawerOpen()) { closeDrawer(); e.stopPropagation(); } }, true);

/* The section's name in the top bar, since there's no tab row to show it. */
const SECTION_NAME = { today: ["今日", "Today"], kana: ["かな", "Kana"], words: ["言葉", "Words"], grammar: ["文法", "Grammar"], cards: ["札", "Cards"], menu: ["街", "Out &amp; about"], sprint: ["速", "Sprint"], record: ["記録", "Record"] };
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
});
