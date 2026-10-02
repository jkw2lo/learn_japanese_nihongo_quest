/* Nihongo Quest — コンビニ, the convenience store (data: js/data/konbini.js).

   A place in Out and about you walk round. Every package is drawn here,
   in SVG, with the words on it in HTML on top so they take the ink: a
   product's name fills in as its kana are learned.

   Three modes:
     見る Browse   pick anything up, turn it over, tap a word to hear it
     読む Read     putting something back asks one question about it, and
                  each package goes deeper: 名 its name, then 表 the
                  slogan on the front, then 裏 the label on the back —
                  each once you can sound it out
     お使い Errand  a friend's list, in Japanese, of three things you can
                  read; find them, then the receipt

   What's been read is kept in state.scenes.konbini: got (names, which the
   place's levels count, as every place's do), copy and back. Like every
   place it never touches the review schedule.

   The desktop and the phone are drawn separately. A desktop walks along a
   wall of cabinets — the cooler, the warmer, the chiller, the sweets
   shelf, the register — with what's in your hands beside it. A phone gets
   one long shelf, a product a screen, big enough to read the packet, and
   what's in your hands comes up as a sheet. The phone's styles live only
   in the PHONE LAYER of css/app.css. */

const KB_PHONE = "(max-width: 720px)";
const kbPhone = () => matchMedia(KB_PHONE).matches;
const kb = { mode: "browse", held: null, side: "front", open: new Set(), quiz: null, errand: null, flash: null, list: false };

/* ---------- what's been read, and what can be ---------- */

const kbRec = () => state.scenes.konbini || (state.scenes.konbini = { got: [], copy: [], back: [] });
const kbHas = (p, side) => asList(kbRec()[side === "name" ? "got" : side]).includes(p.i);
const kbSound = s => soundable(furiKana(s));
/* Each side quizzes once it can be sounded out, and never before the name. */
function kbReadable(p, side) {
  if (!kbSound(p.name)) return false;
  if (side === "copy") return kbSound(p.copy);
  if (side === "back") return p.back.every(r => kbSound(r[0]));
  return true;
}
const kbNext = p => ["name", "copy", "back"].find(s => !kbHas(p, s) && kbReadable(p, s));
const kbTicks = p => ["name", "copy", "back"].filter(s => kbHas(p, s)).length;
function kbMark(p, side) {
  const r = kbRec(), k = side === "name" ? "got" : side;
  r[k] = asList(r[k]);
  if (!r[k].includes(p.i)) r[k].push(p.i);
  save();
}

/* ---------- drawing the packages ----------

   One light, from the upper left, for everything. Each package is shaded
   in its own colour (darker and a touch cooler in shadow, lighter where the
   light falls), stands in a soft contact shadow, and carries a gloss over
   its print so the label sits on a lit, curved surface. All front-on. */

function kbTone(c, dl, ds = 0) {
  const n = parseInt(c.slice(1), 16);
  let [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map(v => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0, l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = (mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60;
  }
  if (dl < 0) h += (h > 40 && h < 220 ? 6 : -6) * Math.min(1, -dl * 4);   /* shadows lean cool */
  const pc = v => Math.min(100, Math.max(0, v * 100)).toFixed(0);
  return `hsl(${h.toFixed(0)} ${pc(s + ds)}% ${Math.min(97, Math.max(3, (l + dl) * 100)).toFixed(0)}%)`;
}
let kbUid = 0;
const kbBody = (id, c) => `<linearGradient id="${id}" x1="0" x2="1">
  <stop offset="0" stop-color="${kbTone(c, -.14, .04)}"/><stop offset=".14" stop-color="${kbTone(c, .08)}"/><stop offset=".34" stop-color="${c}"/>
  <stop offset=".78" stop-color="${kbTone(c, -.07, .03)}"/><stop offset="1" stop-color="${kbTone(c, -.2, .05)}"/></linearGradient>`;

/* Paint every package shares, once per render. */
const KB_DEFS = `<svg width="0" height="0" class="kb-defs" aria-hidden="true"><defs>
  <linearGradient id="kb-gloss" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".14" stop-color="#fff" stop-opacity=".28"/>
    <stop offset=".22" stop-color="#fff" stop-opacity=".06"/><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".26"/></linearGradient>
  <linearGradient id="kb-flat" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".14"/></linearGradient>
  <linearGradient id="kb-metal" x1="0" x2="1"><stop offset="0" stop-color="#868D93"/><stop offset=".22" stop-color="#EEF1F3"/><stop offset=".55" stop-color="#BCC2C7"/><stop offset="1" stop-color="#737A80"/></linearGradient>
  <linearGradient id="kb-film" x1="0" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#7C8A96" stop-opacity=".16"/></linearGradient>
  <radialGradient id="kb-ground"><stop offset="0" stop-color="#1A222A" stop-opacity=".42"/><stop offset=".6" stop-color="#1A222A" stop-opacity=".14"/><stop offset="1" stop-color="#1A222A" stop-opacity="0"/></radialGradient>
</defs></svg>`;

/* Each shape: its size in shelf pixels, where the printed label goes
   [x, y, w, h], the largest the name may set, the drawing under the print
   and the gloss over it. grow: the label may grow past its box in the
   hand (the onigiri's sticker takes its slogan under the name). */
const KB_SHAPES = {
  bottle: { w: 46, h: 118, panel: [9, 44, 28, 56], max: 12,
    path: "M16.5 14 H29.5 C30 21 41 25 41 35 V108 Q41 116 33 116 H13 Q5 116 5 108 V35 C5 25 16 21 16.5 14Z",
    under: (p, g, sh) => `<defs>${kbBody(g, p.c)}${kbBody(g + "c", p.cap)}${kbBody(g + "l", p.liquid)}<clipPath id="${g}k"><path d="${sh.path}"/></clipPath></defs>
      <rect x="15" y="0" width="16" height="11" rx="2" fill="url(#${g}c)"/>
      <path d="M17 1.5v8M19.5 1.5v8M22 1.5v8M24.5 1.5v8M27 1.5v8M29.5 1.5v8" stroke="${kbTone(p.cap, -.2)}" stroke-width=".6" opacity=".7"/>
      <rect x="14" y="10.5" width="18" height="3.5" rx="1" fill="${kbTone(p.cap, -.08)}"/>
      <g clip-path="url(#${g}k)">
        <rect width="46" height="118" fill="url(#${g}l)"/>
        <rect width="46" height="25" fill="#fff" opacity=".55"/><path d="M5 25 H41" stroke="#fff" stroke-width=".8" opacity=".8"/>
        <rect y="38" width="46" height="68" fill="url(#${g})"/>
        <path d="M0 38.6 H46 M0 105.4 H46" stroke="${kbTone(p.c, -.22)}" stroke-width="1.2"/>
        <path d="M0 109 H46 M0 112 H46" stroke="#000" stroke-width=".5" opacity=".12"/>
      </g>
      <path d="${sh.path}" fill="none" stroke="${kbTone(p.liquid, -.3)}" stroke-width=".5" opacity=".5"/>`,
    gloss: (p, sh) => `<path d="${sh.path}" fill="url(#kb-gloss)"/><rect x="9.5" y="18" width="2.4" height="92" rx="1.2" fill="#fff" opacity=".45"/>` },
  can: { w: 44, h: 80, panel: [7, 16, 30, 50], max: 9.5,
    path: "M4 9 Q4 5.5 8 5.5 H36 Q40 5.5 40 9 V71 Q40 74.5 36 74.5 H8 Q4 74.5 4 71Z",
    under: (p, g, sh) => `<defs>${kbBody(g, p.c)}</defs><path d="${sh.path}" fill="url(#${g})"/>
      <path d="M4 12 H40 M4 68 H40" stroke="${kbTone(p.c, .25)}" stroke-width=".9" opacity=".8"/>
      <path d="M5.5 5.5 Q8 1 12 1 H32 Q36 1 38.5 5.5Z" fill="url(#kb-metal)"/><path d="M5.5 74.5 Q8 79 12 79 H32 Q36 79 38.5 74.5Z" fill="url(#kb-metal)"/>
      <path d="M4.5 5.6 H39.5 M4.5 74.4 H39.5" stroke="#5E656B" stroke-width=".7" opacity=".6"/>`,
    gloss: (p, sh) => `<path d="${sh.path}" fill="url(#kb-gloss)"/><rect x="8.5" y="8" width="2.2" height="64" rx="1.1" fill="#fff" opacity=".42"/>` },
  carton: { w: 44, h: 98, panel: [5, 31, 34, 58], max: 9.5,
    path: "M0 22 H44 V97 Q44 98 43 98 H1 Q0 98 0 97Z",
    under: (p, g, sh) => `<defs>${kbBody(g, p.c)}</defs>
      <rect x="7" y="0" width="30" height="5" rx=".8" fill="${kbTone(p.c, -.06)}"/><path d="M7 4.6 H37" stroke="${kbTone(p.c, -.2)}" stroke-width=".6"/>
      <path d="M4 5 H40 L44 22 H0Z" fill="${kbTone(p.c, .1)}"/><path d="M4 5 H40 L44 22 H0Z" fill="url(#kb-flat)"/>
      <path d="M22 5 V22" stroke="${kbTone(p.c, -.1)}" stroke-width=".5" opacity=".7"/>
      <path d="${sh.path}" fill="url(#${g})"/><path d="M0 22.3 H44" stroke="${kbTone(p.c, -.25)}" stroke-width=".8"/>
      <rect y="92" width="44" height="6" fill="${kbTone(p.c, -.1)}" opacity=".6"/>`,
    gloss: (p, sh) => `<path d="${sh.path}" fill="url(#kb-flat)"/><rect x="1" y="23" width="1.4" height="74" fill="#fff" opacity=".4"/>` },
  cup: { w: 52, h: 80, panel: [11, 22, 29, 44], max: 9.5,
    path: "M3 10 H49 L43.5 78 Q43.3 79.5 41.8 79.5 H10.2 Q8.7 79.5 8.5 78Z",
    under: (p, g, sh) => `<defs>${kbBody(g, p.c)}</defs><path d="${sh.path}" fill="url(#${g})"/>
      <path d="M4.2 17 H47.8 M7.6 70 H44.4" stroke="${kbTone(p.c, .22)}" stroke-width=".8"/>
      <rect x="45.5" y="13" width="3" height="56" rx="1.5" fill="#F4F2EC" opacity=".85" transform="rotate(5 47 40)"/>`,
    gloss: (p, sh) => `<path d="${sh.path}" fill="url(#kb-gloss)"/>
      <ellipse cx="26" cy="9.5" rx="24" ry="4.2" fill="#F5F3EE" stroke="#C3BDB0" stroke-width=".7"/><ellipse cx="26" cy="9" rx="19" ry="2.6" fill="none" stroke="#DCD7CC" stroke-width=".6"/>
      <path d="M45 8 Q49 4 52 4.5" stroke="#C3BDB0" stroke-width="2.6" stroke-linecap="round" fill="none"/>
      <rect x="9" y="17" width="2.2" height="56" rx="1.1" fill="#fff" opacity=".38" transform="rotate(-4.6 10 45)"/>` },
  onigiri: { w: 82, h: 72, panel: [23, 28, 36, 19], max: 9, grow: true,
    path: "M41 3 Q45 3 47.5 7.5 L79 61 Q82 69 73 69 H9 Q0 69 3 61 L34.5 7.5 Q37 3 41 3Z",
    under: (p, g, sh) => `<defs><clipPath id="${g}k"><path d="${sh.path}"/></clipPath></defs>
      <path d="${sh.path}" fill="#FBF9F2"/>
      <g clip-path="url(#${g}k)">${p.nori === false ? "" : `
        <path d="M17 70 L26 47 H56 L65 70Z" fill="#1C2A21"/><path d="M26 47 H56" stroke="#33473A" stroke-width="1"/>
        <path d="M30 50 L27 66 M36 50 L35 66 M46 50 L47 66 M52 50 L55 66" stroke="#2C3D32" stroke-width=".6"/>`}
        <path d="M0 40 H82" stroke="#E9E3D5" stroke-width="14" opacity=".35"/></g>
      <path d="${sh.path}" fill="none" stroke="#CEC6B5" stroke-width=".8"/>`,
    gloss: (p, sh) => `<path d="${sh.path}" fill="url(#kb-film)"/>
      <path d="M41 3.6 V27.5 M41 47 V69" stroke="#C2402F" stroke-width="2.2"/>
      <circle cx="41" cy="14" r="4.3" fill="#C2402F"/><text x="41" y="16.3" font-size="6.2" font-weight="700" fill="#fff" text-anchor="middle" font-family="sans-serif">1</text>
      <text x="8" y="66" font-size="5" fill="#C2402F" font-weight="700" font-family="sans-serif">2</text>
      <text x="70.5" y="66" font-size="5" fill="#C2402F" font-weight="700" font-family="sans-serif">3</text>
      <path d="M13 57 L35.5 13" stroke="#fff" stroke-width="2.2" opacity=".6" stroke-linecap="round"/>` },
  bag: { w: 64, h: 84, panel: [8, 22, 48, 42], max: 12,
    path: "M2 4 L6 1 L10 4 L14 1 L18 4 L22 1 L26 4 L30 1 L34 4 L38 1 L42 4 L46 1 L50 4 L54 1 L58 4 L62 1 V83 L58 80 L54 83 L50 80 L46 83 L42 80 L38 83 L34 80 L30 83 L26 80 L22 83 L18 80 L14 83 L10 80 L6 83 L2 80Z",
    under: (p, g, sh) => `<defs>${kbBody(g, p.c)}</defs><path d="${sh.path}" fill="url(#${g})"/>
      <path d="M2 10 H62 M2 74 H62" stroke="${kbTone(p.c, .2)}" stroke-width=".8"/>
      <path d="M2 12 Q32 6 62 12 M2 72 Q32 78 62 72" fill="none" stroke="#fff" stroke-width=".6" opacity=".25"/>`,
    gloss: (p, sh) => `<path d="${sh.path}" fill="url(#kb-gloss)"/><path d="M10 14 Q8 42 10 70" stroke="#fff" stroke-width="2.4" opacity=".35" fill="none" stroke-linecap="round"/>` },
  pouch: { w: 48, h: 64, panel: [6, 19, 36, 34], max: 10,
    path: "M3 6 H45 V54 Q45 62 38 63 H10 Q3 62 3 54Z",
    under: (p, g, sh) => `<defs>${kbBody(g, p.c)}</defs><path d="${sh.path}" fill="url(#${g})"/>
      <rect x="3" y="1" width="42" height="6" fill="${kbTone(p.c, -.08)}"/>
      <path d="M3 11.5 H45" stroke="${kbTone(p.c, -.25)}" stroke-width=".9"/><path d="M3 13 H45" stroke="#fff" stroke-width=".5" opacity=".35"/>
      <circle cx="40" cy="4" r="1.3" fill="${kbTone(p.c, -.3)}"/>`,
    gloss: (p, sh) => `<path d="${sh.path}" fill="url(#kb-gloss)"/>` },
  box: { w: 60, h: 74, panel: [7, 14, 46, 52], max: 11,
    path: "M1 4 H59 V73 Q59 74 58 74 H2 Q1 74 1 73Z",
    under: (p, g, sh) => `<defs>${kbBody(g, p.c)}</defs>
      <path d="M3 0 H57 L59 4 H1Z" fill="${kbTone(p.c, .1)}"/><path d="${sh.path}" fill="url(#${g})"/>
      <path d="M1 8 H59" stroke="${kbTone(p.c, -.22)}" stroke-width=".7"/>
      <path d="M4 70 H56" stroke="${kbTone(p.c, .2)}" stroke-width=".6"/>`,
    gloss: (p, sh) => `<path d="${sh.path}" fill="url(#kb-flat)"/><rect x="2" y="9" width="1.4" height="62" fill="#fff" opacity=".35"/>` },
  pack: { w: 32, h: 56, panel: [4, 13, 24, 34], max: 9,
    path: "M1 2 H31 V55 Q31 56 30 56 H2 Q1 56 1 55Z",
    under: (p, g, sh) => `<defs>${kbBody(g, p.c)}</defs><path d="${sh.path}" fill="url(#${g})"/>
      <path d="M1 7 H31" stroke="${kbTone(p.c, .25)}" stroke-width="1"/><path d="M1 51 H31" stroke="${kbTone(p.c, -.2)}" stroke-width=".7"/>`,
    gloss: (p, sh) => `<path d="${sh.path}" fill="url(#kb-flat)"/><rect x="2.5" y="8" width="1.4" height="42" fill="#fff" opacity=".35"/>` },
  tub: { w: 54, h: 48, panel: [10, 13, 34, 24], max: 9.5, grow: true,
    path: "M3 8 H51 L46 46 Q45.8 47.5 44.3 47.5 H9.7 Q8.2 47.5 8 46Z",
    under: (p, g, sh) => `<defs>${kbBody(g, p.c)}</defs><path d="${sh.path}" fill="url(#${g})"/>
      <path d="M8.6 42 H45.4" stroke="#6B3F1D" stroke-width="5" opacity=".75"/>`,
    gloss: (p, sh) => `<path d="${sh.path}" fill="url(#kb-gloss)"/>
      <ellipse cx="27" cy="7.5" rx="25.5" ry="4" fill="#F1EEE6" stroke="#BDB6A8" stroke-width=".7"/>
      <path d="M47 6 Q52 3 54 4" stroke="#BDB6A8" stroke-width="2.4" stroke-linecap="round" fill="none"/>` },
};

/* How wide a string sets, in ems: full-width characters 1, ASCII about half. */
const kbEms = s => [...furiPlain(s)].reduce((a, c) => a + (c.charCodeAt(0) < 0x2000 ? .56 : 1), 0);

/* The type on a package: the name as large as fits its label, line by
   line, then the slogan and tags under it, all centred. The same sizes on
   the shelf, in the hand and on the phone's shelf — only the whole package
   is scaled. */
function kbType(p, sh) {
  const [, , w, h] = sh.panel, lines = p.lines || [p.name], hasR = /\{/.test(p.name);
  const longest = Math.max(...lines.map(kbEms)), lh = hasR ? 1.5 : 1.08;
  let fs = p.vert ? Math.min(sh.max, (w - 5) / (lines.length * (hasR ? 1.6 : 1.1)), (h - 14) / longest)
                  : Math.min(sh.max, (w - 6) / longest);
  const copyFs = p.copy ? Math.min(fs * .5, (w - 6) / kbEms(p.copy)) : 0;
  const tagFs = Math.min(fs * .42, ...(p.tags || []).map(t => (w - 8) / kbEms(t)));
  const extras = sh.grow ? 0 : (p.brand ? 5.5 : 0) + (copyFs ? copyFs * 1.5 : 0) + (p.tags || []).length * tagFs * 1.7;
  if (!p.vert) fs = Math.min(fs, (h - extras - 5) / (lines.length * lh));
  /* the slogan and tags never set larger than half the name */
  return { fs, copyFs: Math.min(copyFs, fs * .5), tagFs: Math.max(3.6, Math.min(tagFs, fs * .42)), lines };
}

function kbPack(p) {
  const sh = KB_SHAPES[p.shape], g = "kb" + (++kbUid), [x, y, w, h] = sh.panel, t = kbType(p, sh);
  const px = n => n.toFixed(2) + "px";
  return `<div class="kb-pk printed ${p.shape} ${p.vert ? "vert" : ""} ${sh.grow ? "grow" : ""}" style="width:${sh.w}px;height:${sh.h}px;--c:${p.c}">
    <svg class="kb-art" viewBox="0 0 ${sh.w} ${sh.h}" aria-hidden="true">
      <ellipse class="kb-ground" cx="${sh.w / 2}" cy="${sh.h - .5}" rx="${sh.w * .52}" ry="3.2" fill="url(#kb-ground)"/>${sh.under(p, g, sh)}</svg>
    <div class="kb-lbl" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><div class="kb-lc">
      ${p.brand ? `<span class="kb-brand">${esc(p.brand)}</span>` : ""}
      <span class="kb-nm ${/\{/.test(p.name) ? "r" : ""}" lang="ja" style="font-size:${px(t.fs)}">${t.lines.map(l => `<span>${inkHtml(l)}</span>`).join("")}</span>
      ${p.copy ? `<span class="kb-copy" lang="ja" style="font-size:${px(t.copyFs)}">${inkHtml(p.copy)}</span>` : ""}
      ${(p.tags || []).map(tg => `<span class="kb-tg" lang="ja" style="font-size:${px(t.tagFs)}">${inkHtml(tg)}</span>`).join("")}
    </div></div>
    <svg class="kb-gl" viewBox="0 0 ${sh.w} ${sh.h}" aria-hidden="true">${sh.gloss(p, sh)}</svg></div>`;
}

/* ---------- the shelves ---------- */

function kbProd(p, inner) {
  const cls = [kb.held === p.id ? "gone" : "", kbSound(p.name) ? "readable" : "", kb.flash === p.id ? "wrong" : ""].join(" ");
  return `<button class="kb-prod ${cls}" data-act="kb-pick" data-id="${p.id}" aria-label="${esc(p.en)}">${inner || kbPack(p)}</button>`;
}
const kbTicksHtml = p => kbTicks(p) ? `<span class="kb-ok" title="${kbTicks(p)} of 3 read">${"✓".repeat(kbTicks(p))}</span>` : "";
/* A shelf tag: the name on its own line (two where the package breaks it), the price under it. */
function kbTag(p, width) {
  const one = kbEms(p.name) * 9.5 <= width - 6;
  const fs = one ? 9.5 : Math.min(9, (width - 6) / Math.max(...(p.lines || [p.name]).map(kbEms)));
  return `<span class="kb-tag printed ${one ? "" : "two"}" lang="ja"><span class="n" style="font-size:${fs.toFixed(1)}px">${(one ? [p.name] : p.lines || [p.name]).map(inkHtml).join("<br>")}</span>
    <span class="pr">¥${p.price}<small>${inkHtml("{税込|ぜいこみ}")}</small>${kbTicksHtml(p)}</span></span>`;
}
/* A shelf: its products spread evenly along it, each standing on the shelf
   top with its tag clipped to the rail under it. Every shelf in a row of a
   cabinet is the same height (its tallest packet and some room above), and
   every door is the same width, so the shelves line up across the doors. */
const KB_COL = 62, KB_COL_WIDE = 86, KB_HEADROOM = 22, KB_RAIL = 41;
const kbColW = p => KB_SHAPES[p.shape].w > 58 ? KB_COL_WIDE : KB_COL;
function kbShelf(items, h, w) {
  return `<div class="kb-shelf" style="height:${h + KB_HEADROOM + KB_RAIL}px;width:${w}px">${items.map(p => { const wide = kbColW(p) === KB_COL_WIDE;
    return `<div class="kb-col ${wide ? "wide" : ""}">${kbProd(p)}<div class="kb-rail">${kbTag(p, wide ? 80 : 58)}</div></div>`; }).join("")}</div>`;
}
/* An aisle stocked shelf by shelf (each product's shelf, from the top), each
   shelf's products shared out across the doors: doors[d][row] = products. */
function kbShelves(A) {
  const items = KONBINI.filter(p => p.aisle === A.id), nd = A.doors || 1;
  const rows = [...Array(A.shelves)].map((_, r) => items.filter(p => p.shelf === r));
  return [...Array(nd)].map((_, d) => rows.map(row => { const per = Math.ceil(row.length / nd); return row.slice(d * per, d * per + per); }));
}
function kbCabinet(A) {
  const doors = kbShelves(A);
  const rowH = [...Array(A.shelves)].map((_, r) => Math.max(0, ...doors.flatMap(d => d[r]).map(p => KB_SHAPES[p.shape].h)));
  const w = Math.max(...doors.flatMap(d => d.map(row => row.reduce((t, p) => t + kbColW(p), 0)))) + 12;
  const stock = rows => rows.map((row, r) => kbShelf(row, rowH[r], w)).join("");
  const inner = doors.map(rows => `<div class="kb-door">${stock(rows)}</div>`).join("");
  if (A.look === "cooler") return `<div class="kb-cooler"><div class="kb-cab-head">COLD DRINKS</div><div class="kb-doors">${inner}</div></div>`;
  if (A.look === "warmer") return `<div class="kb-cooler kb-warmer"><div class="kb-cab-head"><span>HOT · <span lang="ja">${inkHtml("あたたかい")}</span></span></div><div class="kb-doors">${inner}</div></div>`;
  if (A.look === "chiller") return `<div class="kb-chiller"><div class="kb-canopy"></div>${stock(doors[0])}</div>`;
  return `<div class="kb-gondola">${stock(doors[0])}</div>`;
}

function kbStoreDesk() {
  return `<div class="kb-store">
    <div class="kb-ceiling">${[6, 30, 54, 78].map(x => `<span class="kb-tube" style="left:${x}%"></span>`).join("")}</div>
    <div class="kb-aisles">${KONBINI_AISLES.map(A => `<button class="kb-chip" data-act="kb-jump" data-to="kb-${A.id}" lang="ja">${inkHtml(A.jp)} <small>${esc(A.en)}</small></button>`).join("")}
      <button class="kb-chip" data-act="kb-jump" data-to="kb-reg" lang="ja">${inkHtml("レジ")} <small>Register</small></button></div>
    <div class="kb-walk">
      <button class="kb-walkbtn l" data-act="kb-walk" data-d="-1" aria-label="Walk left">${icon("back")}</button>
      <button class="kb-walkbtn r" data-act="kb-walk" data-d="1" aria-label="Walk right">${icon("chevron")}</button>
      <div class="kb-strip" id="kbStrip">
        ${KONBINI_AISLES.map(A => `<div class="kb-sec" id="kb-${A.id}"><div class="kb-sign" lang="ja">${inkHtml(A.jp)}<small>${esc(A.en)}</small></div>${kbCabinet(A)}</div>`).join("")}
        <div class="kb-sec" id="kb-reg"><div class="kb-sign" lang="ja">${inkHtml("レジ")}<small>Register</small></div>
          <div class="kb-register">${neko("happy", "kb-clerk")}<div class="kb-counter"></div>
            <p class="muted tiny">The cat at the register is coming: <span lang="ja">${inkHtml("いらっしゃいませ")}</span>, <span lang="ja">${inkHtml("{温|あたた}めますか")}</span>.</p></div></div>
      </div>
    </div>
    <div class="kb-floor"></div>
  </div>`;
}

/* The phone's store: one long shelf, aisle after aisle, each product big
   enough to read. How far each shape is enlarged, so they fill about the
   same space. */
const KB_ZOOM = { bottle: 1.9, can: 2.5, carton: 2.15, cup: 2.5, onigiri: 2.3, bag: 2.3, pouch: 3, box: 2.6, pack: 3.4, tub: 3 };
function kbStorePhone() {
  return `<div class="kb-store">
    <div class="kb-aisles">${KONBINI_AISLES.map(A => `<button class="kb-chip" data-act="kb-jump" data-to="kb-${A.id}" lang="ja">${inkHtml(A.jp)}</button>`).join("")}</div>
    <div class="kb-ps" id="kbStrip">
      ${KONBINI_AISLES.map(A => `<div class="kb-ps-sign" id="kb-${A.id}"><div class="kb-sign" lang="ja">${inkHtml(A.jp)}</div></div>` +
        KONBINI.filter(p => p.aisle === A.id).sort((x, y) => x.shelf - y.shelf).map(p => `<div class="kb-slot">
          ${kbProd(p, `<div class="kb-zoom" style="transform:scale(${KB_ZOOM[p.shape]})">${kbPack(p)}</div>`)}
          <div class="kb-ptag printed"><span class="n" lang="ja">${inkHtml(p.name)}</span>
            <span class="pr"><span>¥${p.price} <small lang="ja">${inkHtml("{税込|ぜいこみ}")}</small></span>${kbTicksHtml(p)}</span></div></div>`).join("")).join("")}
      <div class="kb-slot end"></div>
    </div>
    <p class="muted tiny kb-hint">Swipe along the shelf · tap to pick it up</p>
  </div>`;
}

/* ---------- in your hands ---------- */

function kbTerms(p) {
  const front = [[p.name, p.en, "Name"], [p.copy, p.copyEn, "Front"], ...p.tags.map((t, i) => [t, p.tagsEn[i], "Tag"])];
  const back = p.back.map(r => [r[0], `${r[2]}: ${furiPlain(r[1])}`, "Back"]);
  return (kb.side === "front" ? front : back).map(([w, en, side], i) => {
    const k = `${p.id}:${kb.side}:${i}`;
    return `<button class="kb-term ${kb.open.has(k) ? "open" : ""}" data-act="kb-term" data-k="${esc(k)}" data-say="${esc(furiKana(w))}">
      <span class="jp" lang="ja">${inkHtml(w)}</span><span class="side">${side}</span><span class="en">${esc(en)}</span></button>`;
  }).join("");
}

function kbQuiz(p, side) {
  if (side === "name") {
    const others = shuffle(KONBINI.filter(x => x.id !== p.id && x.aisle === p.aisle)).slice(0, 3);
    return Math.random() < .5 || !/\{/.test(p.name)
      ? { side, ask: `What is <span class="jp" lang="ja">${inkHtml(p.name)}</span>?`, opts: shuffle([p, ...others]).map(x => ({ label: esc(x.en), right: x === p })) }
      : { side, ask: `How is <span class="jp" lang="ja">${esc(furiPlain(p.name))}</span> read?`, ja: true,
          opts: shuffle([p, ...others]).map(x => ({ label: esc(x.kana), right: x === p })) };
  }
  if (side === "copy") {
    const [ask, right, ...wrong] = p.cq;
    return { side, ask: esc(ask), opts: shuffle([right, ...wrong]).map(x => ({ label: esc(x), right: x === right })) };
  }
  const row = p.back[Math.floor(Math.random() * p.back.length)];
  const rows = shuffle([row, ...shuffle(p.back.filter(r => r !== row)).slice(0, 3)]);
  return { side, ask: `Turn it over. Which line tells you <b>${esc(row[3])}</b>?`, ja: true, value: row[1],
    opts: rows.map(r => ({ label: inkHtml(r[0]), right: r === row })) };
}

function kbHands() {
  const grab = `<div class="kb-grab"></div>`;
  if (!kb.held && kb.mode === "errand") return grab + kbErrandHtml();
  if (!kb.held) return `${grab}<h3>In your hands</h3><p class="kb-empty">${kb.mode === "read"
    ? "Pick something up. Putting it back asks you one thing about it, and each package goes deeper: its name, then what the front says, then the label on the back."
    : "Walk along the shelves and pick anything up. Turn it over, and tap a word to hear it and see what it means."}</p>`;
  const p = KONBINI_BY[kb.held], q = kb.quiz;
  const kana = [...kanaUnits(kanaOnly(p.kana))], have = kana.filter(isLearned).length;
  const stamps = [["name", "名", "its name"], ["copy", "表", "the front"], ["back", "裏", "the back"]]
    .map(([s, j, en]) => `<span class="kb-st ${kbHas(p, s) ? "done" : ""}" lang="ja" title="${kbHas(p, s) ? "Read" : "Not yet"}: ${en}">${j}</span>`).join("");
  const backside = `<div class="kb-back printed" lang="ja"><div class="bh">${inkHtml("{原材料|げんざいりょう}・{成分|せいぶん}")}</div>
    <table>${p.back.map(r => `<tr><td>${inkHtml(r[0])}</td><td>${inkHtml(r[1])}</td></tr>`).join("")}
    <tr><td>${inkHtml("{価格|かかく}（{税込|ぜいこみ}）")}</td><td>¥${p.price}</td></tr></table></div>`;
  let foot;
  if (q) {
    const right = q.opts.find(o => o.right);
    foot = `<div class="kb-q"><div class="q-ask">${q.ask}</div>
      <div class="opts kb-opts">${q.opts.map((o, i) => `<button class="opt ${q.picked == null ? "" : o.right ? "right" : i === q.picked ? "wrong" : ""}" data-act="kb-ans" data-i="${i}" ${q.ja ? 'lang="ja"' : ""} ${q.picked == null ? "" : "disabled"}>${o.label}</button>`).join("")}</div>
      ${q.picked == null ? "" : `<div class="verdict ${q.opts[q.picked].right ? "ok" : ""}">${q.opts[q.picked].right ? "Yes!" : `It's <span ${q.ja ? 'lang="ja"' : ""}>${right.label}</span>.`}${q.value ? ` <span lang="ja">${inkHtml(q.value)}</span>` : ""}</div>
        <button class="btn kb-main" data-act="kb-done">Put it back</button>`}</div>`;
  } else {
    const side = kbNext(p);
    const note = kb.mode === "errand" ? `<p class="kb-note">On the list? Put it in the basket.</p>`
      : kb.mode === "browse" ? ""
      : !kbSound(p.name) ? `<p class="kb-note">Just looking: you can sound out ${have} of ${kana.length} kana in its name. Its questions wait until you can read it all.</p>`
      : side ? `<p class="kb-note good">You can read this. Putting it back asks about <b>${{ name: "its name", copy: "what the front says", back: "the label on the back" }[side]}</b>.</p>`
      : `<p class="kb-note good">You've read all you can on this one${kbHas(p, "back") ? "." : ". The back opens once you can sound out its labels."}</p>`;
    foot = `${note}<div class="kb-row">${kb.mode === "errand"
      ? `<button class="btn kb-main" data-act="kb-basket">Put in the basket</button><button class="btn btn-ghost" data-act="kb-put">Put it back</button>`
      : `<button class="btn kb-main" data-act="kb-put">Put it back</button>`}</div>`;
  }
  return `${grab}<div class="kb-hhead"><h3>In your hands</h3><div class="kb-stamps">${stamps}</div></div>
    <div class="kb-hold">${kb.side === "back" ? backside : `<div class="kb-big s-${p.shape}">${kbPack(p)}</div>`}</div>
    <div class="kb-sides"><div class="seg seg-sm">
      <button data-act="kb-side" data-s="front" class="${kb.side === "front" ? "on" : ""}" ${q ? "disabled" : ""}><span lang="ja">表</span> Front</button>
      <button data-act="kb-side" data-s="back" class="${kb.side === "back" ? "on" : ""}" ${q ? "disabled" : ""}><span lang="ja">裏</span> Back</button></div>
      <button class="btn btn-ghost btn-sm" data-act="say" data-say="${esc(p.kana)}">${icon("speaker")} Hear it</button></div>
    ${q ? "" : `<div class="kb-terms">${kbTerms(p)}</div>`}
    ${foot}`;
}

/* ---------- お使い: the errand ---------- */

function kbNewErrand() {
  const pool = shuffle(KONBINI.filter(p => kbSound(p.name)));
  kb.errand = pool.length < 3 ? { shut: pool.length } : { list: pool.slice(0, 3).map(p => p.id), got: [], msg: "" };
}
function kbErrandHtml() {
  const e = kb.errand;
  if (e.shut != null) return `<h3>お使い · Errand</h3><p class="kb-empty">Errands only ask for things you can read. You can read ${e.shut} name${e.shut === 1 ? "" : "s"} here so far; a list needs three. Keep going with kana and come back.</p>`;
  if (e.got.length === e.list.length) {
    const items = e.list.map(id => KONBINI_BY[id]), total = items.reduce((t, p) => t + p.price, 0);
    return `<h3>At the register</h3>
      <div class="paper-receipt kb-receipt" lang="ja"><div class="pr-store">コンビニ さくら</div>
        ${items.map(p => `<div class="pr-row"><span>${inkHtml(p.name)}</span><span>¥${p.price}</span></div>`).join("")}
        <div class="pr-rule"></div><div class="pr-row big"><span>${inkHtml("{合計|ごうけい}")}（${inkHtml("{税込|ぜいこ}み")}）</span><span>¥${total}</span></div></div>
      ${numbersKnown() ? `<p class="rc-say" lang="ja">${esc(numberKana(total))}えん</p>` : ""}
      <p class="kb-note good">All three found.</p>
      <button class="btn kb-main" data-act="kb-errand">Another list</button>`;
  }
  return `<h3>お使い · Errand</h3>
    <div class="kb-list"><div class="eyebrow">Your friend's list</div><ul>${e.list.map(id =>
      `<li class="${e.got.includes(id) ? "got" : ""}" lang="ja">${inkHtml(KONBINI_BY[id].name)}</li>`).join("")}</ul></div>
    <p class="kb-empty">Find each one on the shelves. The list is in Japanese: reading it is the game.</p>
    ${e.msg ? `<p class="kb-note">${e.msg}</p>` : ""}`;
}

/* ---------- the page ---------- */

function renderKonbini() {
  loadBundle("konbini");
  const pl = placeBy("konbini"), open = placeOpen("konbini"), phone = kbPhone();
  const up = kb.held || (phone && kb.mode === "errand" && kb.list);
  const hint = { browse: "Just look. Nothing is tested.", read: "Putting something back asks you about it.", errand: "Find what's on the list." }[kb.mode];
  return `${KB_DEFS}<section class="card scene kb">
    <div class="scene-head"><div>
      <div class="eyebrow">コンビニ · Out and about</div>
      <h1>The convenience store</h1>
      <p class="lede">Walk the shelves at コンビニ さくら. Pick anything up, turn it over, tap a word to hear it. Every packet fills in as you learn its kana.</p>
      ${inkKeyHtml(KONBINI.map(p => p.name))}
    </div>
    <div class="scene-score">${ring(placeGot(pl) / pl.items.length, 56, 6)}<span>${placeGot(pl)}<small>/${pl.items.length}</small></span><small>read</small></div></div>
    ${open ? levelsHtml(pl) : placeShutHtml(pl)}
    <div class="kb-modes"><div class="seg">
      <button data-act="kb-mode" data-m="browse" class="${kb.mode === "browse" ? "on" : ""}"><span lang="ja">見る</span> Browse</button>
      <button data-act="kb-mode" data-m="read" class="${kb.mode === "read" ? "on" : ""}"><span lang="ja">読む</span> Read</button>
      <button data-act="kb-mode" data-m="errand" class="${kb.mode === "errand" ? "on" : ""}"><span lang="ja">お使い</span> Errand</button></div>
      <span class="muted small">${hint}</span>
      <span class="muted tiny kb-dotkey"><i></i> under a product: you can read its name</span></div>
    <div class="kb-body">${phone ? kbStorePhone() : kbStoreDesk()}
      <aside class="kb-hands ${up ? "up" : ""}">${kbHands()}</aside></div>
    ${phone && kb.mode === "errand" && !kb.held ? `<button class="btn cta" data-act="kb-list">${kb.list ? "Back to the shelf" : "Show the list"}</button>` : ""}
  </section>`;
}

/* Re-render where you stand: the shelf keeps its place. */
function kbDraw() {
  const x = $("#kbStrip")?.scrollLeft || 0;
  renderMenu();
  const s = $("#kbStrip");
  if (s) { s.style.scrollBehavior = "auto"; s.scrollLeft = x; s.style.scrollBehavior = ""; }
}

/* Leaving the store puts down whatever you were holding. */
function kbReset() { kb.held = null; kb.quiz = null; kb.list = false; kb.flash = null; }

/* The arrow keys walk the aisle on a desktop; Escape puts a packet back. */
function konbiniKey(e) {
  if (view !== "menu" || menuId !== "konbini" || kbPhone() || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return false;
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    $("#kbStrip")?.scrollBy({ left: (e.key === "ArrowLeft" ? -1 : 1) * 280, behavior: "smooth" });
    e.preventDefault();
    return true;
  }
  if (e.key === "Escape" && kb.held && !kb.quiz) { kbReset(); kbDraw(); return true; }
  return false;
}

/* A desktop window narrowed to a phone's width (or the other way) gets the other layout. */
if (typeof matchMedia === "function") matchMedia(KB_PHONE).addEventListener?.("change", () => { if (view === "menu" && menuId === "konbini") kbDraw(); });

Object.assign(ACTS, {
  "kb-pick": el => {
    if (kb.quiz && kb.quiz.picked == null) return;          /* answer first */
    kb.held = el.dataset.id; kb.side = "front"; kb.quiz = null; kb.flash = null;
    say(KONBINI_BY[kb.held].kana);
    noteActivity();
    kbDraw();
  },
  "kb-side": el => { kb.side = el.dataset.s; kbDraw(); },
  "kb-term": el => { const k = el.dataset.k; kb.open.has(k) ? kb.open.delete(k) : kb.open.add(k); say(el.dataset.say); noteActivity(); kbDraw(); },
  "kb-put": () => {
    const p = KONBINI_BY[kb.held], side = kb.mode === "read" && kbNext(p);
    if (side) { kb.quiz = kbQuiz(p, side); kb.side = side === "back" ? "back" : "front"; }
    else kbReset();
    kbDraw();
  },
  "kb-ans": el => {
    const q = kb.quiz;
    if (!q || q.picked != null) return;
    q.picked = +el.dataset.i;
    if (q.opts[q.picked].right) kbMark(KONBINI_BY[kb.held], q.side);
    noteActivity();
    kbDraw();
  },
  "kb-done": () => { kbReset(); kbDraw(); },
  "kb-mode": el => { kb.mode = el.dataset.m; kbReset(); if (kb.mode === "errand") kbNewErrand(); kbDraw(); },
  "kb-basket": () => {
    const e = kb.errand, p = KONBINI_BY[kb.held];
    if (e.list.includes(p.id) && !e.got.includes(p.id)) { e.got.push(p.id); e.msg = ""; if (e.got.length === e.list.length) kb.list = true; }
    else { e.msg = `That's <span lang="ja">${inkHtml(p.name)}</span>, ${esc(p.en.toLowerCase())}. It isn't on the list.`; kb.flash = p.id; kb.list = true; }
    kb.held = null;
    noteActivity();
    kbDraw();
  },
  "kb-errand": () => { kbNewErrand(); kb.list = false; kbDraw(); },
  "kb-list": () => { kb.list = !kb.list; kbDraw(); },
  "kb-jump": el => { $("#" + el.dataset.to)?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" }); },
  "kb-walk": el => { const s = $("#kbStrip"); s?.scrollBy({ left: el.dataset.d * s.clientWidth * .6, behavior: "smooth" }); },
});
