/* Nihongo Quest — 練習帳, the notebook: a place to just write.

   Lifted from Hanzi Quest's exercise book, in the shape its phone version
   proved out: one big box to write a character in, and Add to page, which
   sets it in the next square of today's page and wipes the box for the
   next one. You never zoom in on a page to fill a square — the box is
   always big, and the page fills itself. Here that's the layout on a
   desktop as well as a phone.

   Nothing is marked. Kept from Hanzi Quest:
   - guides: the squared-paper lines (十字 cross, 米字 star, or none), and a
     faint character to trace, copybook style, with its stroke order
     playing beside the box
   - pens (pen, brush, pencil, marker) and nibs (fine, medium, broad); each
     square keeps the pen it was written with
   - dated pages: today's page fills 36 squares, then a new one starts.
     Every page is kept, by date, and can be opened again.

   Pages are ink as vectors — each square's strokes in the same 1024 box the
   writing drills use — so they redraw crisply at any size and re-ink with
   the theme. They live in IndexedDB (room for years of them), not in the
   progress record, and ride along in the backup file. */

const BOOK_COLS = 6, BOOK_ROWS = 6, BOOK_CAP = BOOK_COLS * BOOK_ROWS;

/* A nib picks the base width; the pen draws with it. `mul` scales the nib
   rather than replacing it, so a fine brush and a broad brush still differ. */
const BOOK_PENS = {
  pen:    { jp: "ペン",    name: "Pen",    alpha: 1,   mul: 1,    cap: "round" },
  brush:  { jp: "筆",      name: "Brush",  alpha: .92, mul: 1.7,  cap: "round" },
  pencil: { jp: "鉛筆",    name: "Pencil", alpha: .62, mul: .65,  cap: "round" },
  marker: { jp: "マーカー", name: "Marker", alpha: .4,  mul: 2.4,  cap: "square" },
};
const BOOK_NIBS = { fine: 20, medium: 32, broad: 50 };        /* in the 1024 box */
const BOOK_GRIDS = { cross: ["十字", "Cross"], star: ["米字", "Star"], none: ["なし", "None"] };

const bk = {
  strokes: [], cur: null,      /* the box's ink */
  guide: null,                 /* the character to trace */
  tab: "h",                    /* the picker: h, k, kanji */
  viewing: null,               /* id of an older page open on the right, or null for today's */
  pages: [], loaded: false,    /* every page — this is the copy the screen reads */
  just: -1,                    /* the square just added, for its little pop */
};

/* ---------- storage ---------- */

function bookDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open("nihongo-quest-book", 1);
    r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains("pages")) r.result.createObjectStore("pages", { keyPath: "id" }); };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
/* A browser with no IndexedDB (some private windows) still gets a working
   notebook for the visit — the pages just aren't kept. */
function bookTx(mode, fn) {
  if (!("indexedDB" in window)) return Promise.resolve(null);
  return bookDB().then(d => new Promise((res, rej) => {
    const tx = d.transaction("pages", mode);
    const req = fn(tx.objectStore("pages"));
    tx.oncomplete = () => res(req && "result" in req ? req.result : null);
    tx.onerror = () => rej(tx.error);
  })).catch(e => { console.warn("notebook storage", e); return null; });
}
const bookAll = () => bookTx("readonly", st => st.getAll()).then(r => asList(r));
const bookPut = p => bookTx("readwrite", st => st.put(p));
const bookDel = id => bookTx("readwrite", st => st.delete(id));
async function bookReplaceAll(pages) {
  await bookTx("readwrite", st => st.clear());
  for (const p of asList(pages)) if (p && p.id && Array.isArray(p.cells)) await bookPut(p);
}

async function bookLoad() {
  if (bk.loaded) return;
  bk.pages = (await bookAll()).filter(p => p && Array.isArray(p.cells));
  bk.loaded = true;
}

/* Today's page with room: the newest one, never another day's, never full.
   None means the next square starts a new page. */
const todaysPages = () => bk.pages.filter(p => p.date === today()).sort((a, b) => a.id - b.id);
const openPage = () => [...todaysPages()].reverse().find(p => p.cells.length < BOOK_CAP) || null;
const pageNo = p => todaysPagesOn(p.date).indexOf(p) + 1;
const todaysPagesOn = date => bk.pages.filter(p => p.date === date).sort((a, b) => a.id - b.id);

function newPage() {
  const p = { id: Date.now(), date: today(), cols: BOOK_COLS, rows: BOOK_ROWS, cells: [] };
  bk.pages.push(p);
  return p;
}

/* ---------- drawing ---------- */

const bookSet = () => ({
  pen: BOOK_PENS[state.settings.bookPen] ? state.settings.bookPen : "pen",
  nib: BOOK_NIBS[state.settings.bookNib] ? state.settings.bookNib : "medium",
  grid: BOOK_GRIDS[state.settings.bookGrid] ? state.settings.bookGrid : "cross",
});

function strokePath(st) {
  if (!st.length) return "";
  /* a dot is a zero-length line — round caps draw it as a dot */
  if (st.length === 1) return `M${st[0][0]} ${st[0][1]}h.1`;
  return "M" + st.map(p => p.join(" ")).join("L");
}
/* One square's ink, in its pen. The opacity is on the group so a marker's
   strokes don't darken where they cross, the way one pass of ink wouldn't. */
function inkG(strokes, pen, nib, extra = "") {
  const P = BOOK_PENS[pen] || BOOK_PENS.pen;
  const w = Math.round((BOOK_NIBS[nib] || BOOK_NIBS.medium) * P.mul);
  return `<g class="bk-stroke pen-${pen}" ${extra} opacity="${P.alpha}" stroke-width="${w}" stroke-linecap="${P.cap}" stroke-linejoin="${P.cap === "square" ? "miter" : "round"}">
    ${strokes.map(st => `<path d="${strokePath(st)}"/>`).join("")}</g>`;
}

function gridLines(kind) {
  if (kind === "none") return "";
  const cross = `<line x1="512" y1="0" x2="512" y2="1024"/><line x1="0" y1="512" x2="1024" y2="512"/>`;
  return kind === "star" ? cross + `<line x1="0" y1="0" x2="1024" y2="1024"/><line x1="1024" y1="0" x2="0" y2="1024"/>` : cross;
}

/* A whole page as one drawing: its squares, their guides, their ink. */
function pageSvg(p, { grid, next = -1, just = -1, cls = "" } = {}) {
  const cols = p.cols || BOOK_COLS, rows = p.rows || BOOK_ROWS, S = 1024;
  let out = "";
  for (let i = 0; i < cols * rows; i++) {
    const x = (i % cols) * S, y = Math.floor(i / cols) * S, c = p.cells[i];
    out += `<g transform="translate(${x} ${y})" class="bk-sq ${i === next ? "next" : ""} ${i === just ? "just" : ""}">
      <rect class="bk-sq-bg" x="0" y="0" width="${S}" height="${S}"/>
      ${grid ? `<g class="bk-guide">${gridLines(grid)}</g>` : ""}
      ${c ? inkG(c.s, c.pen, c.nib) : ""}
    </g>`;
  }
  return `<svg class="bk-page-svg ${cls}" viewBox="0 0 ${cols * S} ${rows * S}" role="img" aria-label="${p.cells.length} squares written">${out}</svg>`;
}

/* ---------- the view ---------- */

function renderBook() {
  const el = $("#v-book");
  if (bk.cur) return;                      /* mid-stroke: a repaint would drop it */
  if (!bk.loaded) { bookLoad().then(() => { if (view === "book") renderBook(); }); }
  el.innerHTML = `
    <div class="bk-head">
      <div><div class="eyebrow">練習帳 · Notebook</div>
        <h1>Just write.</h1>
        <p class="lede">Write a character in the box, then add it to the page — the next square along, and the box wipes for the next one. Nothing here is marked.</p></div>
    </div>
    <div class="bk-layout">
      <div class="bk-left">
        <section class="card bk-desk" id="bkDesk"></section>
        <section class="card bk-picker" id="bkPicker"></section>
      </div>
      <div class="bk-right">
        <section class="card bk-page-card" id="bkPage"></section>
        <section class="card bk-diary" id="bkDiary"></section>
      </div>
    </div>`;
  renderBookDesk();
  renderBookPicker();
  renderBookPage();
  renderBookDiary();
}

function penSample(id) {
  const P = BOOK_PENS[id];
  return `<svg class="pen-sample pen-${id}" viewBox="0 0 64 24" aria-hidden="true"><path d="M6 17C18 3 30 21 58 7" opacity="${P.alpha}"
    stroke-width="${(P.mul * 3.2).toFixed(1)}" stroke-linecap="${P.cap}"/></svg>`;
}

function renderBookDesk() {
  const host = $("#bkDesk");
  if (!host) return;
  const { pen, nib, grid } = bookSet();
  const g = bk.guide;
  const trace = g && state.settings.bookTrace !== false;
  host.innerHTML = `
    <div class="bk-tools">
      <div class="bk-tool"><span class="bk-tl">Pen</span><div class="seg seg-sm bk-seg">${Object.entries(BOOK_PENS).map(([id, P]) =>
        `<button class="${id === pen ? "on" : ""}" data-act="bk-set" data-k="bookPen" data-v="${id}" title="${P.name}">${penSample(id)}<span>${P.name}</span></button>`).join("")}</div></div>
      <div class="bk-tool"><span class="bk-tl">Nib</span><div class="seg seg-sm bk-seg">${Object.keys(BOOK_NIBS).map(id =>
        `<button class="${id === nib ? "on" : ""}" data-act="bk-set" data-k="bookNib" data-v="${id}" title="${id}"><i class="nib nib-${id}"></i><span>${id}</span></button>`).join("")}</div></div>
      <div class="bk-tool"><span class="bk-tl">Guide</span><div class="seg seg-sm bk-seg">${Object.entries(BOOK_GRIDS).map(([id, [jp, en]]) =>
        `<button class="${id === grid ? "on" : ""}" data-act="bk-set" data-k="bookGrid" data-v="${id}" title="${en}"><span lang="ja">${jp}</span></button>`).join("")}</div></div>
    </div>
    <div class="bk-box-wrap">
      <div class="bk-box" id="bkBox">
        <svg class="bk-grid" viewBox="0 0 1024 1024" aria-hidden="true">${gridLines(grid)}</svg>
        <div class="bk-trace">${trace ? (canWrite(g) ? modelSvg(g, { faint: true }) : `<span lang="ja">${esc(g)}</span>`) : ""}</div>
        <svg class="bk-ink" id="bkInk" viewBox="0 0 1024 1024"></svg>
      </div>
      ${g ? `<div class="bk-tracing"><span>Tracing <b lang="ja">${esc(g)}</b></span>
        <button class="link" data-act="bk-trace">${trace ? "Hide it" : "Show it"}</button>
        <button class="link" data-act="bk-guide" data-k="">Write freely</button></div>` : ""}
    </div>
    <div class="bk-actions">
      <button class="btn btn-ghost btn-sm" data-act="bk-undo" title="Undo a stroke (Z)">${icon("back")} Undo</button>
      <button class="btn btn-ghost btn-sm" data-act="bk-clear">Clear</button>
      <button class="btn cta bk-add" data-act="bk-add" title="Add to page (Enter)">Add to page <kbd>↵</kbd></button>
    </div>`;
  bindBookInk();
  drawBookInk();
}

function bindBookInk() {
  const el = $("#bkInk");
  if (!el) return;
  const toBox = e => {
    const r = el.getBoundingClientRect();
    return [Math.round((e.clientX - r.left) / r.width * 1024), Math.round((e.clientY - r.top) / r.height * 1024)];
  };
  el.addEventListener("pointerdown", e => {
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch {}
    bk.cur = [toBox(e)];
    bk.strokes.push(bk.cur);
    drawBookInk();
  });
  el.addEventListener("pointermove", e => {
    if (!bk.cur) return;
    /* every coalesced point, so a quick flick of a pen is still a curve */
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of (evs.length ? evs : [e])) {
      const p = toBox(ev), last = bk.cur[bk.cur.length - 1];
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) >= 5) bk.cur.push(p);
    }
    drawBookInk();
  });
  const end = () => { if (bk.cur) { bk.cur = null; drawBookInk(); noteActivity(); } };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
}

function drawBookInk() {
  const el = $("#bkInk");
  if (!el) return;
  const { pen, nib } = bookSet();
  el.innerHTML = inkG(bk.strokes, pen, nib);
  $(".bk-add")?.toggleAttribute("disabled", !bk.strokes.length);
}

function renderBookPage() {
  const host = $("#bkPage");
  if (!host) return;
  if (!bk.loaded) { host.innerHTML = `<p class="muted small">Opening your notebook…</p>`; return; }
  const { grid } = bookSet();
  const old = bk.viewing ? bk.pages.find(p => p.id === bk.viewing) : null;
  if (old) {
    host.innerHTML = `
      <div class="bk-page-head">
        <div><div class="eyebrow">練習帳 · page ${pageNo(old)} of the day</div>
          <h2>${esc(longDate(old.date))}</h2></div>
        <span class="count">${old.cells.length} / ${BOOK_CAP}</span>
      </div>
      <div class="bk-paper">${pageSvg(old, { grid })}</div>
      <div class="bk-page-tools">
        <button class="btn btn-sm" data-act="bk-today">Back to today's page</button>
        <button class="btn btn-ghost btn-sm danger" data-act="bk-del" data-id="${old.id}">Delete this page</button>
      </div>`;
    return;
  }
  const p = openPage();
  const shown = p || { id: 0, date: today(), cols: BOOK_COLS, rows: BOOK_ROWS, cells: [] };
  const n = todaysPages().length + (p ? 0 : 1);
  host.innerHTML = `
    <div class="bk-page-head">
      <div><div class="eyebrow">練習帳 · today, page ${p ? pageNo(p) : n}</div>
        <h2>${esc(longDate(today()))}</h2></div>
      <span class="count">${shown.cells.length} / ${BOOK_CAP}</span>
    </div>
    <div class="bk-paper">${pageSvg(shown, { grid, next: shown.cells.length, just: bk.just })}</div>
    <div class="bk-page-tools">
      ${shown.cells.length ? `<button class="btn btn-ghost btn-sm" data-act="bk-takeback">Take back the last square</button>
        <button class="btn btn-ghost btn-sm" data-act="bk-newpage">Start a new page</button>` : `<span class="muted small">A fresh page. The first square is waiting.</span>`}
    </div>`;
  bk.just = -1;
}

function longDate(k) {
  const [y, m, d] = k.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const rel = k === today() ? "Today · " : k === addDays(today(), -1) ? "Yesterday · " : "";
  return rel + dt.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

function renderBookDiary() {
  const host = $("#bkDiary");
  if (!host) return;
  const pages = bk.pages.filter(p => p.cells.length).sort((a, b) => b.id - a.id);
  if (!pages.length) {
    host.innerHTML = `<div class="card-head"><h2>Your pages</h2></div>
      <p class="muted small">Every page you write is kept here by date — a diary of your handwriting, to look back on.</p>`;
    return;
  }
  const byDate = {};
  pages.forEach(p => (byDate[p.date] = byDate[p.date] || []).push(p));
  const squares = pages.reduce((t, p) => t + p.cells.length, 0);
  const days = Object.keys(byDate).length;
  host.innerHTML = `<div class="card-head"><h2>Your pages</h2>
      <span class="count">${pages.length} page${pages.length === 1 ? "" : "s"} · ${squares} characters · ${days} day${days === 1 ? "" : "s"}</span></div>
    ${Object.keys(byDate).sort().reverse().map(d => `
      <div class="bk-day"><div class="bk-day-label">${esc(longDate(d))}</div>
        <div class="bk-thumbs">${byDate[d].sort((a, b) => a.id - b.id).map(p => `
          <button class="bk-thumb ${bk.viewing === p.id ? "on" : ""}" data-act="bk-open" data-id="${p.id}" title="Open this page">
            ${pageSvg(p, { grid: "", cls: "thumb" })}<span>${p.cells.length} / ${BOOK_CAP}</span></button>`).join("")}</div>
      </div>`).join("")}`;
}

/* ---------- the guide: a character to trace ---------- */

function pickerChars() {
  if (bk.tab === "kanji") return KANJI.map(e => ({ k: e.k, on: isLearned(e.key), tip: e.m }));
  return KANA.filter(e => e.set === bk.tab && [...e.k].length === 1 && canWrite(e.k))
    .map(e => ({ k: e.k, on: isLearned(e.k), tip: e.r }));
}

function renderBookPicker() {
  const host = $("#bkPicker");
  if (!host) return;
  const g = bk.guide;
  const chars = pickerChars();
  const known = chars.filter(c => c.on).length;
  const stage = g ? `<div class="bk-stage">
      <div class="bk-stage-box">${canWrite(g) ? modelSvg(g, { animate: true }) : `<span lang="ja">${esc(g)}</span>`}</div>
      <div class="bk-stage-side">
        <b lang="ja">${esc(g)}</b>
        <span class="muted small">${esc(KANA_BY[g]?.r || KANJI_BY[g]?.m || "")}${canWrite(g) ? ` · ${strokesFor(g).m.length} stroke${strokesFor(g).m.length === 1 ? "" : "s"}` : ""}</span>
        <div class="bk-stage-btns">
          <button class="btn btn-ghost btn-sm" data-act="bk-replay">↻ Again</button>
          <button class="btn btn-ghost btn-sm" data-act="bk-say">${icon("speaker")} Hear it</button>
        </div>
      </div></div>`
    : `<p class="muted small bk-stage-empty">Pick a character and it appears faintly in the box to trace over, with its stroke order playing here. Or just write freely.</p>`;
  host.innerHTML = `
    <div class="card-head"><h2>Trace a character</h2>
      <div class="seg seg-sm">${[["h", "ひらがな"], ["k", "カタカナ"], ["kanji", "漢字"]].map(([id, jp]) =>
        `<button class="${bk.tab === id ? "on" : ""}" data-act="bk-tab" data-v="${id}" lang="ja">${jp}</button>`).join("")}</div></div>
    ${stage}
    <div class="bk-chars" lang="ja">${chars.map(c =>
      `<button class="bk-char ${c.on ? "" : "ahead"} ${g === c.k ? "on" : ""}" data-act="bk-guide" data-k="${esc(c.k)}" title="${esc(c.tip)}${c.on ? "" : " · not learned yet"}">${esc(c.k)}</button>`).join("")}</div>
    <p class="muted tiny">${known} of ${chars.length} learned — the faint ones are still ahead of you, but you can write them anyway.</p>`;
}

/* ---------- doing things ---------- */

async function bookAdd() {
  if (!bk.strokes.length) return;
  await bookLoad();
  const fresh = !openPage();
  const p = openPage() || newPage();
  const { pen, nib } = bookSet();
  p.cells.push({ s: bk.strokes.map(st => st.map(([x, y]) => [x, y])), pen, nib, g: bk.guide || null });
  bk.just = p.cells.length - 1;
  bk.strokes = []; bk.cur = null;
  bk.viewing = null;
  await bookPut(p);
  const d = day(); d.bk = (d.bk || 0) + 1;
  noteActivity(); save();
  drawBookInk();
  renderBookPage();
  renderBookDiary();
  if (fresh && todaysPages().length > 1 && p.cells.length === 1) toast(`Page ${pageNo(p)} today — a fresh one.`);
  if (p.cells.length === BOOK_CAP) {
    toast("Page full! The next square starts a new page.", 3200);
    petals($("#bkPage"), 18);
  }
}

async function bookTakeBack() {
  const p = [...todaysPages()].reverse().find(x => x.cells.length);
  if (!p) return;
  const c = p.cells.pop();
  bk.strokes = c.s; bk.cur = null;
  if (!p.cells.length) { bk.pages = bk.pages.filter(x => x !== p); await bookDel(p.id); } else await bookPut(p);
  const d = day(); if (d.bk) d.bk--;
  save();
  drawBookInk();
  renderBookPage(); renderBookDiary();
}

async function bookDelete(id) {
  const p = bk.pages.find(x => x.id === id);
  if (!p) return;
  const yes = await askConfirm({ k: "消去", title: "Delete this page?", body: `The page from ${longDate(p.date)}, with ${p.cells.length} character${p.cells.length === 1 ? "" : "s"} on it. It can't be brought back.`, yes: "Delete page", danger: true });
  if (!yes) return;
  bk.pages = bk.pages.filter(x => x !== p);
  await bookDel(id);
  bk.viewing = null;
  renderBookPage(); renderBookDiary();
}

function bookSay() {
  const g = bk.guide;
  if (!g) return;
  if (KANA_BY[g]) sayKana(g); else say(kanjiSay(g));
}

/* Enter adds, Z or Backspace undoes a stroke. Only on this tab, and never
   while a field or a sheet has the keyboard. */
function bookKey(e) {
  if (view !== "book" || S || $("#sheet").classList.contains("on") || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return false;
  if (e.key === "Enter") { e.preventDefault(); bookAdd(); return true; }
  if (e.key === "z" || e.key === "Z" || e.key === "Backspace") { e.preventDefault(); bk.strokes.pop(); drawBookInk(); return true; }
  return false;
}

Object.assign(ACTS, {
  "bk-set": el => { state.settings[el.dataset.k] = el.dataset.v; save(); renderBookDesk(); if (el.dataset.k === "bookGrid") renderBookPage(); },
  "bk-trace": () => { state.settings.bookTrace = state.settings.bookTrace === false; save(); renderBookDesk(); },
  "bk-guide": el => { const k = el.dataset.k || null; bk.guide = bk.guide === k ? null : k; renderBookDesk(); renderBookPicker(); },
  "bk-tab": el => { bk.tab = el.dataset.v; renderBookPicker(); },
  "bk-replay": () => renderBookPicker(),
  "bk-say": () => bookSay(),
  "bk-undo": () => { bk.strokes.pop(); drawBookInk(); },
  "bk-clear": () => { bk.strokes = []; drawBookInk(); },
  "bk-add": () => bookAdd(),
  "bk-takeback": () => bookTakeBack(),
  "bk-newpage": () => { if (openPage()?.cells.length !== 0) newPage(); bk.viewing = null; renderBookPage(); },
  "bk-open": el => { const id = +el.dataset.id; const p = openPage(); bk.viewing = p && p.id === id ? null : id; renderBookPage(); renderBookDiary(); $("#bkPage")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); },
  "bk-today": () => { bk.viewing = null; renderBookPage(); renderBookDiary(); },
  "bk-del": el => bookDelete(+el.dataset.id),
});
