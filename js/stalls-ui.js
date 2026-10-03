/* Nihongo Quest — the sushi counter and the festival stalls, as places you
   walk round (the engine: js/walk-ui.js; the words: js/data/scenes.js).

   すし: a conveyor-belt counter. The plates come round labelled, and a
   plate's colour is its price — the board on the wall says which. The
   curtain over the door, the topping case, the wasabi by your seat and what
   you say at the end (おあいそ) are the signs.

   屋台: a summer-night street of stalls, each under its hand-painted banner:
   the dish on the counter, a card with its price for one (ひとつ), a flag
   where it's sweet or spicy, and lanterns overhead that spell おまつり.

   The words are the scene's own, so what's been read here is the same
   state.scenes record its quiz has always kept: a plate or a dish read is
   that word recognised. Everything is drawn in SVG; the words on it are
   HTML, so they take the ink. */

/* ---------- the things on them ---------- */

function stallThings(sc) {
  if (sc._things) return sc._things;
  sc._things = sc.walk.things.map(([word, x, flag]) => {
    const it = sc.all.find(a => a.w === word);
    const plate = typeof x === "string" ? x : null;
    return { id: sc.id + it.i, i: it.i, name: it.w, kana: it.kana, en: it.m, plate, flag: flag || null,
             price: plate ? sc.walk.plates[plate] : x };
  });
  sc._by = Object.fromEntries(sc._things.map(t => [t.id, t]));
  return sc._things;
}

/* ---------- drawing sushi ---------- */

const SUSHI_PLATES = { white: ["#ECE7DC", "#CFC7B6"], blue: ["#3A6EA5", "#28507D"], red: ["#C0392B", "#8E2A20"], gold: ["#D2A63E", "#9C7A26"] };
const SUSHI = {
  たまご: { kind: "tamago" }, いか: { kind: "nigiri", c: "#F2EFE8", ika: true }, たこ: { kind: "nigiri", c: "#F1E6E2", tako: true },
  いなり: { kind: "inari" }, さけ: { kind: "nigiri", c: "#F08A4B", stripes: "#FCE2CF" }, まぐろ: { kind: "nigiri", c: "#C8283A" },
  ほたて: { kind: "hotate" }, あかみ: { kind: "nigiri", c: "#9E1B2C" }, かに: { kind: "nigiri", c: "#F6F1EA", kani: true },
  いくら: { kind: "gunkan", roe: true }, うに: { kind: "gunkan" }, とろ: { kind: "nigiri", c: "#EC97A7", stripes: "#FFF3F2" },
};
function sushiPiece(cx, s) {
  const rice = `<path d="M${cx - 14} 41 Q${cx - 15} 33 ${cx - 10} 31 H${cx + 10} Q${cx + 15} 33 ${cx + 14} 41 Q${cx} 43.5 ${cx - 14} 41Z" fill="#FBF8EF" stroke="#DCD3BF" stroke-width=".6"/>
    <path d="M${cx - 8} 38 h1 M${cx - 2} 40 h1 M${cx + 5} 37.5 h1 M${cx + 9} 39.5 h1" stroke="#E6DECB" stroke-width="1"/>`;
  const slab = `M${cx - 16} 33 Q${cx - 15} 25 ${cx - 4} 24 Q${cx + 12} 23.5 ${cx + 16} 31 Q${cx + 15} 35 ${cx + 8} 35 L${cx - 12} 36 Q${cx - 16} 36 ${cx - 16} 33Z`;
  const shine = `<path d="M${cx - 11} 27 Q${cx - 2} 24.5 ${cx + 9} 26" stroke="#fff" stroke-opacity=".5" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
  if (s.kind === "nigiri") {
    let deco = "";
    if (s.stripes) deco = [-9, -3, 3, 9].map(d => `<path d="M${cx + d - 3} 35 L${cx + d + 3} 24.5" stroke="${s.stripes}" stroke-width="1.3" opacity=".9"/>`).join("");
    if (s.ika) deco = [-8, -3, 2, 7].map(d => `<path d="M${cx + d} 34 L${cx + d + 4} 25" stroke="#DCD6CA" stroke-width=".6"/>`).join("");
    if (s.tako) deco = `<path d="M${cx - 15} 31 Q${cx - 14} 25 ${cx - 4} 24.3 Q${cx + 11} 23.8 ${cx + 15.5} 30" stroke="#8E2D3C" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      ${[-9, -2, 5].map(d => `<circle cx="${cx + d}" cy="${25.5}" r="1" fill="#F3D9DD"/>`).join("")}`;
    if (s.kani) deco = `<path d="M${cx - 15.5} 30 Q${cx - 14} 25 ${cx - 4} 24.3 Q${cx + 11} 23.8 ${cx + 15.5} 30 Q${cx} 28 ${cx - 15.5} 30Z" fill="#D64B3A"/>`;
    return rice + `<path d="${slab}" fill="${s.c}"/>` + deco + shine;
  }
  if (s.kind === "hotate") return rice + `<ellipse cx="${cx}" cy="29.5" rx="13" ry="6.5" fill="#F3E3C6"/><ellipse cx="${cx}" cy="28.5" rx="10" ry="4" fill="#F8EDD9"/>` +
    `<path d="M${cx - 6} 28 Q${cx} 26 ${cx + 6} 28" stroke="#fff" stroke-opacity=".6" stroke-width="1" fill="none"/>`;
  if (s.kind === "tamago") return rice + `<rect x="${cx - 15}" y="24" width="30" height="10" rx="2" fill="#F2C94C"/><path d="M${cx - 15} 26.5 H${cx + 15}" stroke="#E0B23A" stroke-width=".8"/>` +
    `<rect x="${cx - 4}" y="23" width="8" height="20" rx="1" fill="#1C2A21"/>` + shine;
  if (s.kind === "inari") return `<path d="M${cx - 15} 42 Q${cx - 16} 27 ${cx - 7} 24 Q${cx} 22 ${cx + 7} 24 Q${cx + 16} 27 ${cx + 15} 42 Q${cx} 44.5 ${cx - 15} 42Z" fill="#B9772F"/>
    <path d="M${cx - 9} 29 q3 2 6 0 M${cx + 1} 32 q3 2 6 0 M${cx - 6} 37 q3 2 6 0" stroke="#94591D" stroke-width=".8" fill="none"/>
    <path d="M${cx - 10} 27 Q${cx - 2} 24 ${cx + 6} 25.5" stroke="#fff" stroke-opacity=".3" stroke-width="1.2" fill="none"/>`;
  /* gunkan: a wall of nori with the roe or the urchin heaped on top */
  const top = s.roe
    ? [-8, -3.5, 1, 5.5, 9, -6, -1, 4, 8].map((d, k) => `<circle cx="${cx + d}" cy="${k < 5 ? 27.5 : 25}" r="2.5" fill="#E8501F"/><circle cx="${cx + d - .8}" cy="${(k < 5 ? 27.5 : 25) - .8}" r=".7" fill="#fff" opacity=".8"/>`).join("")
    : [-7, -2, 3, 8].map(d => `<ellipse cx="${cx + d}" cy="26.5" rx="3.6" ry="2.6" fill="#E8A23A"/><ellipse cx="${cx + d - 1}" cy="25.8" rx="1.4" ry=".8" fill="#F6CF7E"/>`).join("");
  return `<rect x="${cx - 13}" y="27" width="26" height="15" rx="4" fill="#1C2A21"/><path d="M${cx - 13} 32 H${cx + 13} M${cx - 13} 37 H${cx + 13}" stroke="#2C3D32" stroke-width=".6"/>
    <ellipse cx="${cx}" cy="27.5" rx="12.5" ry="3.5" fill="#24342A"/>${top}`;
}
/* A plate: the colour that prices it, two pieces on it, and the card in front with its name. */
function sushiPack(t) {
  const [rim, deep] = SUSHI_PLATES[t.plate], s = SUSHI[t.name] || SUSHI.まぐろ;
  return `<div class="ws-plate printed">
    <svg viewBox="0 0 96 60" aria-hidden="true">
      <ellipse cx="48" cy="50" rx="46" ry="8" fill="url(#kb-ground)"/>
      <ellipse cx="48" cy="44.5" rx="44" ry="13" fill="${deep}"/>
      <ellipse cx="48" cy="42" rx="44" ry="13" fill="${rim}"/>
      <ellipse cx="48" cy="41.2" rx="35" ry="9.2" fill="#FBFAF5"/>
      <path d="M12 36 Q30 30 48 29.5" stroke="#fff" stroke-opacity=".55" stroke-width="1.4" fill="none"/>
      ${t.plate === "gold" ? `<ellipse cx="48" cy="42" rx="40" ry="11.4" fill="none" stroke="#F4D78A" stroke-width=".8" stroke-dasharray="2 2"/>` : ""}
      ${sushiPiece(34, s)}${sushiPiece(62, s)}
    </svg>
    <span class="ws-card" lang="ja">${inkHtml(t.name)}</span></div>`;
}

/* ---------- drawing festival food ---------- */

const FEST = {
  たこやき: () => `<path d="M8 40 H64 L58 51 H14Z" fill="#E7D2A8" stroke="#C9B080" stroke-width=".8"/>
    ${[[22, 32], [36, 31], [50, 32], [17, 38], [31, 39], [45, 39], [57, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#B8742F"/><path d="M${x - 5} ${y - 2} q5 -5 10 0" fill="#4A2614"/><circle cx="${x - 2.5}" cy="${y - 3.2}" r="1.6" fill="#fff" opacity=".25"/>`).join("")}
    <path d="M14 33 l4 4 l4 -5 l4 5 l4 -5 l4 5 l4 -5 l4 5 l4 -5 l4 5 l4 -4" stroke="#FFFBEF" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    ${[[20, 30], [34, 36], [48, 30], [26, 40], [42, 41], [54, 35]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#4F8A3A"/>`).join("")}`,
  いかやき: () => `<path d="M36 40 V55" stroke="#C9A877" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M30 32 q-6 8 -4 18 M34 33 q-2 9 0 17 M38 33 q2 9 0 17 M42 32 q6 8 4 18" stroke="#A84F20" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M36 3 Q51 17 46 33 Q36 37 26 33 Q21 17 36 3Z" fill="#C6672E"/>
    <path d="M30 10 Q36 6 40 9" stroke="#fff" stroke-opacity=".4" stroke-width="1.6" fill="none"/>
    <path d="M28 22 Q36 25 44 22" stroke="#8E3E16" stroke-width=".8" fill="none"/>`,
  やきとり: () => `<path d="M4 31 H68" stroke="#C9A877" stroke-width="2.4" stroke-linecap="round"/>
    ${[12, 26, 40, 54].map((x, k) => k === 2
      ? `<rect x="${x - 5}" y="24" width="10" height="14" rx="3" fill="#E9EFD9"/><rect x="${x - 5}" y="24" width="10" height="5" rx="2" fill="#6E9A45"/>`
      : `<rect x="${x - 6}" y="23" width="12" height="16" rx="4" fill="#8E4B1E"/><path d="M${x - 4} 26 q4 -2 8 0" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" fill="none"/><rect x="${x - 6}" y="33" width="12" height="3" fill="#6B3412" opacity=".5"/>`).join("")}`,
  おこのみやき: () => `<ellipse cx="36" cy="42" rx="31" ry="10" fill="#F3EFE6" stroke="#D8D0BF" stroke-width=".8"/>
    <ellipse cx="36" cy="37" rx="25" ry="9.5" fill="#C98A3E"/><ellipse cx="36" cy="35.5" rx="21" ry="7.2" fill="#5A2E14"/>
    <path d="M18 34 l5 -3 l4 4 l5 -4 l4 4 l5 -4 l4 4 l5 -4 l4 3" stroke="#FFFBEF" stroke-width="1.2" fill="none" stroke-linecap="round"/>
    ${[[24, 37], [30, 33], [40, 38], [46, 33], [36, 36], [50, 37]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#4F8A3A"/>`).join("")}
    <path d="M28 36 q2 -3 4 0 M42 35 q2 -3 4 0" stroke="#E6C79C" stroke-width="1" fill="none"/>`,
  やきそば: () => `<rect x="7" y="25" width="58" height="24" rx="4" fill="#F7F4EE" stroke="#CFC8B8" stroke-width=".8"/>
    ${[29, 33, 37, 41, 45].map(y => `<path d="M11 ${y} q5 -3 10 0 t10 0 t10 0 t10 0 t10 0" stroke="#C98A3E" stroke-width="1.8" fill="none"/>`).join("")}
    ${[[18, 31], [33, 38], [48, 30], [55, 42], [24, 43]].map(([x, y]) => `<rect x="${x}" y="${y}" width="4" height="2.5" rx=".8" fill="#7FA650"/>`).join("")}
    ${[[28, 30], [42, 43], [52, 35]].map(([x, y]) => `<rect x="${x}" y="${y}" width="3" height="1.6" fill="#D23B3B"/>`).join("")}
    <path d="M12 27 L22 47" stroke="#fff" stroke-opacity=".55" stroke-width="2.2"/>`,
  おでん: () => `<path d="M30 30 L46 6" stroke="#C9A877" stroke-width="1.8" stroke-linecap="round"/><rect x="38" y="8" width="7" height="16" rx="3.5" fill="#E2B97A" transform="rotate(34 41 16)"/>
    <path d="M9 30 Q36 58 63 30Z" fill="#F3EFE6" stroke="#D8D0BF" stroke-width=".8"/><ellipse cx="36" cy="30.5" rx="27" ry="5" fill="#D9A55A"/>
    <ellipse cx="25" cy="29" rx="8" ry="4" fill="#F2E6C4"/><ellipse cx="42" cy="28.5" rx="6" ry="4.4" fill="#E9CFA0"/>
    <path d="M48 31 L56 24 L58 32Z" fill="#8E8B86"/><circle cx="54" cy="29" r=".6" fill="#5E5B56"/>`,
  わたあめ: () => `<path d="M36 30 V55" stroke="#E9DCC4" stroke-width="2.4" stroke-linecap="round"/>
    ${[[27, 20, 10], [45, 20, 10], [36, 12, 10], [36, 25, 10], [29, 11, 7], [43, 11, 7]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#F7B7D2"/>`).join("")}
    ${[[30, 14, 5], [40, 10, 4], [33, 23, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FCD9E7"/>`).join("")}`,
  りんごあめ: () => `<path d="M36 34 V55" stroke="#E9DCC4" stroke-width="2.4" stroke-linecap="round"/>
    <circle cx="36" cy="22" r="15" fill="#C8102E"/><circle cx="36" cy="22" r="15" fill="url(#kb-gloss)" opacity=".7"/>
    <ellipse cx="30" cy="15" rx="4.5" ry="2.6" fill="#fff" opacity=".65" transform="rotate(-30 30 15)"/>
    <path d="M36 8 q1 -4 4 -5" stroke="#5A3A1E" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
  かきごおり: () => `<path d="M20 31 H52 L48 53 H24Z" fill="#FFFFFF" stroke="#CFC8B8" stroke-width=".8"/>
    <path d="M21.5 40 q4 -3 7 0 t7 0 t7 0 t7 0" stroke="#3A6EA5" stroke-width="1.6" fill="none"/>
    <path d="M17 32 Q36 0 55 32Z" fill="#F4F8FB"/><path d="M22 23 Q36 2 50 23 Q46 26 43 23 Q40 29 36 24 Q32 28 29 24 Q25 27 22 23Z" fill="#D7263D"/>
    <path d="M27 14 Q32 9 37 9" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" fill="none"/><path d="M50 8 L44 30" stroke="#E5532E" stroke-width="2" stroke-linecap="round"/>`,
  だんご: () => `<path d="M14 54 L58 6" stroke="#C9A877" stroke-width="2.2" stroke-linecap="round"/>
    ${[[24, 40, "#F4A7B9"], [36, 28, "#FBF8F0"], [48, 15, "#9BC27B"]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="9" fill="${c}" stroke="rgba(0,0,0,.08)"/><circle cx="${x - 3}" cy="${y - 3}" r="2.2" fill="#fff" opacity=".5"/>`).join("")}`,
};
/* A dish. bare: on its stall, under its banner; otherwise it carries a slip with its name, for the hand. */
function festPack(t, bare) {
  return `<div class="ws-food printed ${bare ? "bare" : ""}">
    <svg viewBox="0 0 72 56" aria-hidden="true"><ellipse cx="36" cy="54" rx="30" ry="3" fill="url(#kb-ground)"/>${(FEST[t.name] || FEST.だんご)()}</svg>
    ${bare ? "" : `<span class="ws-slip" lang="ja">${inkHtml(t.name)}</span>`}</div>`;
}

/* ---------- the sushi counter ---------- */

const sushiSc = () => SCENE_BY.sushi;
function sushiBoard() {
  const sc = sushiSc();
  return `<div class="ws-board printed">${Object.entries(sc.walk.plates).map(([k, yen]) =>
    `<span><i style="background:${SUSHI_PLATES[k][0]};border-color:${SUSHI_PLATES[k][1]}"></i>¥${yen}</span>`).join("")}</div>`;
}
const sushiNoren = () => kbSign(sushiSc(), "すし", "ws-noren", `<span class="ws-noren-cloth">${[...furiKana("すし")].map(c => `<b>${inkKana(c)}</b>`).join("")}</span>`);
/* The way in: a tiled eave, the curtain hanging from the lintel over a
   lattice sliding door, a paper lantern beside it. */
const sushiFront = () => `<div class="ws-front">
  <div class="ws-eave"></div>
  <div class="ws-facade">
    <span class="ws-chochin"></span>
    <div class="ws-doorframe"><div class="ws-lattice"></div>${sushiNoren()}</div>
  </div></div>`;
/* The chef: the cat, in a white cap, behind the topping case. */
const sushiChef = () => `<div class="ws-chef">${neko("happy", "ws-cat")}<i class="ws-cap"></i><i class="ws-coat"></i></div>`;
/* ---------- a visit: the door, being seated, then in ----------

   You arrive at the door and see only that. Go in, and the cat at the
   front asks how many you are and whether you'd like the counter or a
   table; answer, and she shows you in. On a desktop the counter is the
   belt, four plates at a time, and a table is a place setting and a menu to
   leaf through. On a phone either is the long belt. Leaving the place, or
   the Leave button, brings you back to the door. */
const visit = { stage: "door", step: 0, party: null, seat: null, page: 0, from: 0, menu: false, leaf: 0, turn: 0 };
const sushiTalk = () => sushiSc().walk.talk;
const talkLine = ([w, en], cls = "") => `<button class="ws-line ${cls}" data-act="say" data-say="${esc(furiKana(w))}">
  <span class="jp" lang="ja">${inkHtml(w)}</span><small>${esc(en)}</small><span class="ws-hear">${icon("speaker")}</span></button>`;
function sushiDoor() {
  return `<div class="ws-street-door">
    <div class="ws-door-scene">${sushiFront()}</div>
    <div class="ws-door-side">
      <p class="lede">A curtain over a sliding door, and on it, <b lang="ja">${inkHtml("すし")}</b>.</p>
      <p class="muted small">Tap the curtain to hear what it says. When you're ready, slide the door open.</p>
      <button class="btn kb-main" data-act="sushi-in">Go in</button>
    </div></div>`;
}
const sushiHostess = () => `<div class="ws-hostess">${neko("happy", "ws-cat")}<i class="ws-kimono"></i><i class="ws-obi"></i></div>`;
function sushiHost() {
  const T = sushiTalk(), v = visit;
  const said = [`<div class="ws-bubble them">${talkLine(T.party)}</div>`];
  if (v.party) said.push(`<div class="ws-bubble you">${talkLine(T.parties.find(x => x[2] === v.party))}</div>`, `<div class="ws-bubble them">${talkLine(T.seat)}</div>`);
  if (v.seat) said.push(`<div class="ws-bubble you">${talkLine(T.seats.find(x => x[2] === v.seat))}</div>`, `<div class="ws-bubble them">${talkLine(T.go)}</div>`);
  const answers = !v.party ? T.parties.map(([w, en, n]) => `<button class="ws-answer" data-act="sushi-party" data-n="${n}"><span lang="ja">${inkHtml(w)}</span><small>${esc(en)}</small></button>`)
    : !v.seat ? T.seats.map(([w, en, k]) => `<button class="ws-answer" data-act="sushi-seat" data-k="${k}"><span lang="ja">${inkHtml(w)}</span><small>${esc(en)}</small></button>`)
    : [`<button class="btn kb-main" data-act="sushi-follow">Follow her in</button>`];
  return `<div class="ws-entry">
    <div class="ws-entry-scene">
      <div class="ws-foyer"><div class="ws-foyer-wall"></div>${sushiHostess()}<div class="ws-podium"></div></div>
      <div class="ws-chat">${said.join("")}</div>
      <div class="ws-answers">${!v.party || !v.seat ? `<div class="eyebrow">Your answer</div>` : ""}${answers.join("")}</div>
    </div>
    <aside class="ws-phrasebook">
      <div class="eyebrow">You might also hear or say</div>
      ${T.more.map(l => talkLine(l, l[2])).join("")}
      <p class="muted tiny">Tap one to hear it. They're here for reference: they don't count towards the place.</p>
    </aside></div>`;
}

/* The counter, on a desktop: the room stays put and the belt brings the
   plates by, four at a time; the arrows move it on. It goes round. */
const BELT_PAGE = 4, BELT_SLOT = 112;
function sushiBar() {
  const sc = sushiSc(), things = stallThings(sc), pages = Math.ceil(things.length / BELT_PAGE);
  const loop = [...things, ...things.slice(0, BELT_PAGE)];        /* so the last page runs on into the first */
  return `<div class="kb-store ws-sushi ws-room">
    ${sushiWall(sc, things)}
    <div class="ws-kitchen">
      ${kbSign(sc, "ねた", "ws-case", `<span class="ws-case-glass">${["#F08A4B", "#C8283A", "#F2EFE8", "#EC97A7", "#F2C94C", "#E8501F", "#F3E3C6"].map(c => `<i style="background:${c}"></i>`).join("")}</span><span class="ws-case-label">${inkHtml("ねた")}</span>`)}
      ${sushiChef()}
      <span class="ws-board-cut"><i></i></span>
    </div>
    <div class="ws-beltrow">
      <button class="kb-walkbtn l" data-act="sushi-page" data-d="-1" aria-label="The belt, back">${icon("back")}</button>
      <div class="ws-beltwin"><div class="ws-track" style="transform:translateX(-${visit.from * BELT_PAGE * BELT_SLOT}px)">${loop.map(t => `<div class="ws-slot">${kbProd(t)}${kbTicksHtml(t) ? `<span class="ws-tick">${kbTicksHtml(t)}</span>` : ""}</div>`).join("")}</div></div>
      <button class="kb-walkbtn r" data-act="sushi-page" data-d="1" aria-label="The belt, on">${icon("chevron")}</button>
    </div>
    <div class="ws-pager">${[...Array(pages)].map((_, k) => `<i class="${k === visit.page % pages ? "on" : ""}"></i>`).join("")}</div>
    ${sushiBench(sc)}
    ${sushiLeave()}
  </div>`;
}
const sushiWall = (sc, things) => `<div class="ws-wall">
  <div class="ws-lamps">${[0, 1, 2, 3, 4].map(() => `<i></i>`).join("")}</div>
  <div class="ws-plaques">${things.map(t => kbSign(sc, t.name, "ws-plaque", `<span class="ws-plaque-jp">${inkHtml(t.name)}</span><i class="ws-dot" style="background:${SUSHI_PLATES[t.plate][0]}"></i>`)).join("")}</div>
  ${sushiBoard()}
</div>`;
const sushiBench = sc => `<div class="ws-bench">
  ${kbSign(sc, "わさび", "ws-wasabi", `<span class="ws-dish"><i></i></span><span class="ws-tag">${inkHtml("わさび")}</span>`)}
  <span class="ws-gari"><i></i></span><span class="ws-shoyu"></span><span class="ws-tea"></span><span class="ws-hashi"></span>
  ${kbSign(sc, "おあいそ", "ws-slipsign", `<span class="ws-tag">${inkHtml("おあいそ")}</span><small>what you say at the end</small>`)}
</div>`;
const sushiLeave = () => `<div class="ws-seatbar"><span>${visit.seat === "table" ? "At a table" : "At the counter"}${visit.party > 1 ? `, ${visit.party} of you` : ""}</span>
  <button class="btn btn-ghost btn-sm" data-act="sushi-leave">Leave</button></div>`;

/* A table, on a desktop: your place set, and the menu in the middle. Open it
   and leaf through: a spread a price, two dishes a page. */
function sushiMenuBook() {
  const sc = sushiSc(), things = stallThings(sc);
  const tiers = Object.keys(sc.walk.plates), spreads = [];
  tiers.forEach(k => { const row = things.filter(t => t.plate === k); if (spreads.length && spreads[spreads.length - 1].length + row.length <= 4) spreads[spreads.length - 1].push(...row); else spreads.push(row); });
  const leaf = Math.min(visit.leaf, spreads.length - 1), items = spreads[leaf];
  const page = list => `<div class="ws-mpage">${list.map(t => `<div class="ws-mitem">
    ${kbProd(t, `<div class="ws-mpic">${sushiPack(t)}</div>`)}
    <div class="ws-mtext"><i class="ws-dot" style="background:${SUSHI_PLATES[t.plate][0]}"></i> <b>¥${t.price}</b>${kbTicksHtml(t)}</div></div>`).join("")}</div>`;
  return `<div class="ws-menu open ${visit.turn ? (visit.turn > 0 ? "turn-on" : "turn-back") : ""}">
    <div class="ws-mhead"><span lang="ja">${inkHtml("すし")}</span><small>${leaf + 1} / ${spreads.length}</small></div>
    <div class="ws-spread">${page(items.slice(0, 2))}${page(items.slice(2, 4))}</div>
    <div class="ws-mfoot">
      <button class="btn btn-ghost btn-sm" data-act="sushi-leaf" data-d="-1" ${leaf === 0 ? "disabled" : ""}>${icon("back")} Back a page</button>
      <button class="btn btn-ghost btn-sm" data-act="sushi-menu">Close the menu</button>
      <button class="btn btn-ghost btn-sm" data-act="sushi-leaf" data-d="1" ${leaf === spreads.length - 1 ? "disabled" : ""}>Next page ${icon("chevron")}</button>
    </div></div>`;
}
function sushiTable() {
  const sc = sushiSc(), things = stallThings(sc), others = Math.max(0, (visit.party || 1) - 1);
  const setting = (cls = "") => `<div class="ws-setting ${cls}"><span class="ws-tea"></span><span class="ws-sdish"></span><span class="ws-hashi"></span></div>`;
  return `<div class="kb-store ws-sushi ws-room ws-tableroom">
    ${sushiWall(sc, things)}
    <div class="ws-table">
      <div class="ws-far">${[...Array(Math.min(others, 2))].map(() => setting("far")).join("")}</div>
      <div class="ws-center">${visit.menu ? sushiMenuBook() : `<button class="ws-menu shut" data-act="sushi-menu" aria-label="Open the menu"><span lang="ja">${inkHtml("すし")}</span><small>MENU</small></button>`}</div>
      <div class="ws-near">
        ${kbSign(sc, "わさび", "ws-wasabi", `<span class="ws-dish"><i></i></span><span class="ws-tag">${inkHtml("わさび")}</span>`)}
        <span class="ws-shoyu"></span><span class="ws-gari"><i></i></span>
        ${setting("mine")}
        ${kbSign(sc, "おあいそ", "ws-slipsign", `<span class="ws-tag">${inkHtml("おあいそ")}</span><small>for the bill</small>`)}
      </div>
    </div>
    ${others > 2 ? `<p class="muted tiny">…and one more at the end of the table.</p>` : ""}
    ${sushiLeave()}
  </div>`;
}
function sushiDesk() { return visit.seat === "table" ? sushiTable() : sushiBar(); }
function sushiPhone() {
  const sc = sushiSc(), things = stallThings(sc);
  return `<div class="kb-store ws-sushi">
    <div class="kb-aisles ws-signs">${sushiNoren()}${kbSign(sc, "ねた", "kb-chip")}${kbSign(sc, "わさび", "kb-chip")}${kbSign(sc, "おあいそ", "kb-chip")}</div>
    ${sushiBoard()}
    <div class="kb-ps ws-belt-ps" id="kbStrip">
      ${things.map(t => `<div class="kb-slot">${kbProd(t, `<div class="kb-zoom" style="transform:scale(2.05)">${sushiPack(t)}</div>`)}
        <div class="kb-ptag printed"><span class="n" lang="ja">${inkHtml(t.name)}</span>
          <span class="pr"><span><i class="ws-dot" style="background:${SUSHI_PLATES[t.plate][0]}"></i>¥${t.price}</span>${kbTicksHtml(t)}</span></div></div>`).join("")}
      <div class="kb-slot end"></div>
    </div>
    <p class="muted tiny kb-hint">Swipe along the belt · tap a plate to take it</p>
    ${sushiLeave()}
  </div>`;
}

/* ---------- the festival ---------- */

const festSc = () => SCENE_BY.festival;
/* Each stall its own, the way a festival street has them: what it's built
   as (a striped awning, a plain tent, a wooden cart, a tall stall under a
   painted signboard), its colour, how tall, what it cooks on, and whether
   there's someone behind the counter. */
const FEST_STALLS = {
  たこやき: { type: "awning", c: "#C8323A", h: 250, rig: "griddle", cook: "back" },
  やきそば: { type: "tent", c: "#2F5F9E", h: 236, rig: "teppan", cook: "back" },
  いかやき: { type: "cart", c: "#6B4226", h: 214, rig: "grill" },
  やきとり: { type: "board", c: "#D9822B", h: 262, rig: "grill", cook: "back" },
  おこのみやき: { type: "tent", c: "#3E8A5A", h: 244, rig: "teppan" },
  おでん: { type: "cart", c: "#5B3A21", h: 220, rig: "pot", cook: "back" },
  わたあめ: { type: "board", c: "#D46AA0", h: 270, rig: "floss" },
  りんごあめ: { type: "awning", c: "#B5352B", h: 240, rig: "apples" },
  かきごおり: { type: "tent", c: "#2F8FC4", h: 232, rig: "ice", cook: "back" },
  だんご: { type: "awning", c: "#3E8A5A", h: 226, rig: "grill" },
};
/* What it cooks on, standing on the counter (it's drawn to sit on y = 60). */
const steam = (x, y) => `<path class="ws-steam" d="M${x} ${y} q-5 -8 0 -15 q5 -7 0 -15" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
const RIGS = {
  griddle: `<rect x="10" y="34" width="120" height="16" rx="3" fill="#2A2A2E"/><rect x="14" y="30" width="112" height="8" rx="2" fill="#3A3A40"/><rect x="18" y="50" width="8" height="10" fill="#555"/><rect x="114" y="50" width="8" height="10" fill="#555"/>
    ${[0, 1, 2, 3, 4, 5, 6].map(i => `<circle cx="${26 + i * 15}" cy="34" r="5.6" fill="#B8742F"/><circle cx="${24.5 + i * 15}" cy="32.5" r="1.4" fill="#fff" opacity=".3"/>`).join("")}${steam(42, 24)}${steam(94, 24)}`,
  teppan: `<rect x="6" y="40" width="128" height="10" rx="2" fill="#9AA1A7"/><rect x="6" y="50" width="128" height="10" fill="#4E555B"/>
    ${[18, 32, 46, 60, 74].map(x => `<path d="M${x} 40 q5 -5 10 0 t10 0 t10 0" stroke="#C98A3E" stroke-width="2.2" fill="none"/>`).join("")}
    <rect x="96" y="24" width="4" height="18" fill="#8C6239" transform="rotate(20 98 33)"/><rect x="102" y="34" width="18" height="4" fill="#C9CED2" transform="rotate(20 111 36)"/>${steam(30, 34)}${steam(62, 32)}`,
  grill: `<rect x="8" y="42" width="124" height="18" rx="2" fill="#3A3A40"/><rect x="12" y="42" width="116" height="6" fill="#E8692C"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<circle cx="${18 + i * 13}" cy="45" r="2.4" fill="#FFB347"/>`).join("")}
    ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${14 + i * 19} 42 L${28 + i * 19} 38" stroke="#C9A877" stroke-width="1.8"/><rect x="${16 + i * 19}" y="35" width="9" height="5" rx="1.5" fill="#8E4B1E" transform="rotate(-14 ${20 + i * 19} 38)"/>`).join("")}
    <path class="ws-smoke" d="M40 32 q-8 -10 2 -18 q10 -6 2 -14" stroke="#E4DFEE" stroke-width="5" opacity=".35" fill="none" stroke-linecap="round"/>
    <path class="ws-smoke" d="M98 32 q-8 -10 2 -18 q10 -6 2 -14" stroke="#E4DFEE" stroke-width="5" opacity=".3" fill="none" stroke-linecap="round"/>`,
  pot: `<rect x="20" y="30" width="100" height="30" rx="3" fill="#B9BEC3"/><rect x="24" y="32" width="92" height="10" fill="#D9A55A"/>
    <path d="M54 32 V42 M86 32 V42" stroke="#9AA1A7" stroke-width="2"/>
    <ellipse cx="38" cy="35" rx="7" ry="3.5" fill="#F2E6C4"/><ellipse cx="70" cy="35" rx="5" ry="4" fill="#E9CFA0"/><path d="M92 38 L100 31 L106 38Z" fill="#8E8B86"/>${steam(46, 28)}${steam(78, 26)}${steam(102, 28)}`,
  floss: `<rect x="56" y="44" width="28" height="16" fill="#9AA1A7"/><ellipse cx="70" cy="44" rx="40" ry="10" fill="#C9CED2"/><ellipse cx="70" cy="41" rx="33" ry="7" fill="#F2F4F5"/>
    <circle cx="62" cy="34" r="9" fill="#F7B7D2"/><circle cx="74" cy="31" r="10" fill="#F7B7D2"/><circle cx="84" cy="36" r="7" fill="#FCD9E7"/>`,
  ice: `<rect x="14" y="16" width="44" height="44" rx="3" fill="#2F8FC4"/><circle cx="36" cy="24" r="8" fill="none" stroke="#E4E8EB" stroke-width="3"/><path d="M44 24 H56" stroke="#E4E8EB" stroke-width="3"/>
    <rect x="24" y="40" width="24" height="10" fill="#E4F2FA"/>
    ${[["#D7263D", 76], ["#3E9A4A", 92], ["#2F6FC4", 108], ["#E9B43B", 124]].map(([c, x]) => `<rect x="${x - 6}" y="32" width="12" height="28" rx="2" fill="${c}"/><rect x="${x - 2}" y="25" width="4" height="8" fill="#F2F2F2"/>`).join("")}`,
  apples: `<rect x="10" y="46" width="120" height="14" rx="2" fill="#F2F4F5" stroke="#D2D7DB"/>
    ${[0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${22 + i * 16} 46 V36" stroke="#E9DCC4" stroke-width="1.6"/><circle cx="${22 + i * 16}" cy="30" r="7" fill="#C8102E"/><circle cx="${20 + i * 16}" cy="27.5" r="2" fill="#fff" opacity=".7"/>`).join("")}`,
};
/* Lanterns on a string: over the street, along a stall's roof. */
const lanternString = (n, cls = "") => `<div class="ws-lstring ${cls}">${[...Array(n)].map((_, i) => `<i style="--d:${(i % 3) * .4}s"></i>`).join("")}</div>`;
const festLanterns = () => kbSign(festSc(), "おまつり", "ws-lanterns", [...furiKana("おまつり")].map(c => `<span class="ws-lantern">${inkKana(c)}</span>`).join(""));
/* Someone behind the counter: a shape in the light. */
const festCook = k => k ? `<div class="fs-cook person"><i></i></div>` : "";
function festStall(t) {
  const sc = festSc(), S = FEST_STALLS[t.name] || { type: "awning", c: "#C8323A", h: 240, rig: "grill" };
  /* the banner says its name when tapped, like a shop's, and shows what it is for a moment */
  const name = kbNameplate(t.name, t.en, "fs-name");
  const noren = `<button class="kb-signword fs-noren" data-act="kb-gloss" data-say="${esc(t.kana)}" data-en="${esc(t.en)}" lang="ja">${[...t.kana].map(c => `<b>${inkKana(c)}</b>`).join("")}</button>`;
  const head = {
    awning: `<div class="fs-roof stripes"></div><div class="fs-valance">${name}</div>`,
    tent: `<div class="fs-roof tent"></div><div class="fs-valance solid">${name}</div>`,
    cart: `<div class="fs-roof tiles"></div>${noren}`,
    board: `<div class="fs-board">${name}</div><div class="fs-roof stripes thin"></div>`,
  }[S.type];
  return `<div class="fs-stall t-${S.type}" style="--c:${S.c};--h:${S.h}px">
    ${head}
    <div class="fs-body">
      ${lanternString(S.type === "cart" ? 4 : 5, "eaves")}
      <i class="fs-bulb" style="left:30%"></i><i class="fs-bulb" style="left:70%"></i>
      ${festCook(S.cook)}
      ${t.flag ? kbSign(sc, t.flag, "ws-flag") : ""}
      <div class="fs-counter">
        <svg class="fs-rig" viewBox="0 0 140 60" aria-hidden="true">${RIGS[S.rig]}</svg>
        ${kbProd(t, festPack(t, true))}
      </div>
      <div class="fs-front">
        <div class="ws-price printed">${kbSign(sc, "ひとつ", "ws-hitotsu")}<b>¥${t.price}</b>${kbTicksHtml(t)}</div>
        ${S.type === "cart" ? `<div class="fs-wheels"><i></i><i></i></div>` : ""}
      </div>
    </div>
  </div>`;
}
function festDesk() {
  const things = stallThings(festSc());
  return `<div class="kb-store ws-night">
    <div class="ws-sky"><i class="ws-moon"></i><div class="ws-trees"></div></div>
    ${lanternString(30, "over")}
    <div class="kb-walk">
      <button class="kb-walkbtn l" data-act="kb-walk" data-d="-1" aria-label="Walk left">${icon("back")}</button>
      <button class="kb-walkbtn r" data-act="kb-walk" data-d="1" aria-label="Walk right">${icon("chevron")}</button>
      <div class="kb-strip ws-street" id="kbStrip">
        <div class="kb-sec ws-gate"><div class="ws-torii"><i></i><i></i><div class="ws-torii-lanterns">${festLanterns()}</div></div></div>
        ${things.map(t => `<div class="kb-sec">${festStall(t)}</div>`).join("")}
      </div>
    </div>
    <div class="ws-ground"></div>
  </div>`;
}
function festPhone() {
  const things = stallThings(festSc());
  return `<div class="kb-store ws-night">
    <div class="ws-phone-lanterns">${festLanterns()}</div>
    <div class="kb-ps ws-street-ps" id="kbStrip">
      ${things.map(t => `<div class="kb-slot ws-stall-slot"><div class="kb-zoom" style="transform:scale(1.2)">${festStall(t)}</div></div>`).join("")}
      <div class="kb-slot end"></div>
    </div>
    <p class="muted tiny kb-hint">Swipe down the street · tap a dish to pick it up</p>
  </div>`;
}

/* ---------- the two places ---------- */

/* Under either: the scene's own quiz, which covers its signs too. */
function stallFoot(id) {
  const pl = placeBy(id), more = placeProgress(pl).more;
  return `<div class="scene-actions">${placeOpen(id)
    ? `<button class="btn btn-ghost" data-act="scene-quiz" data-id="${id}">Test yourself on every word here</button>`
    : `<button class="btn btn-ghost" disabled>${icon("lock")} Quiz: ${more} more word${more === 1 ? "" : "s"}</button>`}</div>`;
}
const stallWords = (noun, place) => ({
  read: `Pick a ${noun} up. Putting it back asks you what it is.`,
  browse: `Walk along ${place} and pick anything up. Tap a word to hear it and see what it means; the signs are words too.`,
  dot: `under a ${noun}: you can read its name`, list: "Your friend wants",
  later: "", score: "recognised",
});
/* extra's getters stay getters (the sushi counter's words follow where you sat) */
const stallPlace = (id, extra) => Object.defineProperties({
  id, sides: ["name"], stamps: [["name", "名", "its name"]],
  get things() { return stallThings(SCENE_BY[id]); }, get by() { stallThings(SCENE_BY[id]); return SCENE_BY[id]._by; },
  readable: (t, side) => side === "name" && soundable(t.kana),
  peers() { return this.things; },
  quiz(t) { return kbNameQuiz(t, this.things); },
  back: () => null,
  foot: () => stallFoot(id),
}, Object.getOwnPropertyDescriptors(extra));

WALKS.sushi = stallPlace("sushi", {
  eyebrow: "すし", title: "At the sushi counter",
  lede: "Find the door, get yourself seated, then read what comes round. A plate's colour is its price: the board on the wall says which.",
  enter() { Object.assign(visit, { stage: "door", step: 0, party: null, seat: null, page: 0, from: 0, menu: false, leaf: 0, turn: 0 }); },
  gate: () => visit.stage === "door" ? sushiDoor() : visit.stage === "host" ? sushiHost() : "",
  terms: t => [[t.name, t.en, "Card"]],
  pack: sushiPack, big: () => "s-plate",
  desk: sushiDesk, phone: sushiPhone,
  receipt: (things, total) => `<div class="paper-receipt kb-receipt" lang="ja"><div class="pr-store">${inkHtml("すし")}</div>
    ${things.map(t => `<div class="pr-row"><span><i class="ws-dot" style="background:${SUSHI_PLATES[t.plate][0]}"></i> ${inkHtml(t.name)}</span><span>¥${t.price}</span></div>`).join("")}
    <div class="pr-rule"></div><div class="pr-row big"><span>${things.length} plates</span><span>¥${total}</span></div></div>
    <p class="kb-note">To ask for the bill, say <b lang="ja">${inkHtml("おあいそ")}</b>.</p>`,
  get words() {
    const table = visit.seat === "table" && !kbPhone();
    return { ...stallWords("plate", table ? "the menu" : "the belt"),
      basket: table ? "Order this" : "Take this plate", find: table ? "Find each one in the menu." : "Take each one off the belt.", foundTitle: "The bill",
      browse: table ? "Open the menu and leaf through it. Tap a dish to look at it, and tap a word to hear it." : "Watch the belt and take any plate. Tap a word to hear it and see what it means; the signs are words too." };
  },
});

Object.assign(ACTS, {
  "sushi-in": () => { visit.stage = "host"; say(furiKana(sushiTalk().party[0])); noteActivity(); kbDraw(); },
  "sushi-party": el => { visit.party = +el.dataset.n; say(furiKana(sushiTalk().seat[0])); noteActivity(); kbDraw(); },
  "sushi-seat": el => { visit.seat = el.dataset.k; say(furiKana(sushiTalk().go[0])); noteActivity(); kbDraw(); },
  "sushi-follow": () => { visit.stage = "in"; kbReset(); kbDraw(); scrollTo({ top: $(".kb-modes")?.getBoundingClientRect().top + scrollY - 80, behavior: "smooth" }); },
  "sushi-leave": () => { WALKS.sushi.enter(); kbReset(); kbDraw(); },
  "sushi-page": el => {
    /* The belt holds the plates and, after them, the first page again, so
       going on from the last page runs on round; back from the first jumps
       to that copy and runs back. */
    const n = Math.ceil(stallThings(sushiSc()).length / BELT_PAGE), d = +el.dataset.d;
    let from = visit.page, to = from + d;
    if (to < 0) { from = n; to = n - 1; }
    visit.from = from;
    visit.page = to % n;
    kbDraw();
    const slide = x => { const tr = $(".ws-track"); if (tr) tr.style.transform = `translateX(-${x * BELT_PAGE * BELT_SLOT}px)`; };
    $(".ws-track")?.offsetWidth;          /* lay it out where it was, so the move animates */
    slide(to);
    visit.from = visit.page;
    if (to === n) setTimeout(() => { const tr = $(".ws-track"); if (tr) { tr.style.transition = "none"; slide(0); tr.offsetWidth; tr.style.transition = ""; } }, 520);
    noteActivity();
  },
  "sushi-menu": () => { visit.menu = !visit.menu; visit.turn = 0; noteActivity(); kbDraw(); },
  "sushi-leaf": el => { visit.leaf = Math.max(0, visit.leaf + +el.dataset.d); visit.turn = +el.dataset.d; kbDraw(); setTimeout(() => { visit.turn = 0; }, 0); },
});

WALKS.festival = stallPlace("festival", {
  eyebrow: "屋台", title: "Festival stalls",
  lede: "A summer night, a street of stalls. Read the hand-painted banners, pick up what's on the counter, and see what it costs for one (ひとつ).",
  terms: t => [[t.name, t.en, "Banner"], ["ひとつ", `One (of them): ¥${t.price}`, "Price"], ...(t.flag ? [[t.flag, festSc().all.find(x => x.w === t.flag).m, "Flag"]] : [])],
  pack: t => festPack(t), big: () => "s-food",
  desk: festDesk, phone: festPhone,
  receipt: (things, total) => `<div class="paper-receipt kb-receipt" lang="ja"><div class="pr-store">${inkHtml("おまつり")}</div>
    ${things.map(t => `<div class="pr-row"><span>${inkHtml(t.name)} ${inkHtml("ひとつ")}</span><span>¥${t.price}</span></div>`).join("")}
    <div class="pr-rule"></div><div class="pr-row big"><span>Spent</span><span>¥${total}</span></div></div>`,
  words: { ...stallWords("dish", "the stalls"), basket: "Buy one", find: "Find each one along the stalls.", foundTitle: "What you bought" },
});
