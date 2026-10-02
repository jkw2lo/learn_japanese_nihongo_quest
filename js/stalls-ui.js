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
function sushiDesk() {
  const sc = sushiSc(), things = stallThings(sc);
  return `<div class="kb-store ws-sushi">
    <div class="kb-walk">
      <button class="kb-walkbtn l" data-act="kb-walk" data-d="-1" aria-label="Walk left">${icon("back")}</button>
      <button class="kb-walkbtn r" data-act="kb-walk" data-d="1" aria-label="Walk right">${icon("chevron")}</button>
      <div class="kb-strip" id="kbStrip">
        <div class="kb-sec ws-door">${sushiNoren()}<div class="ws-doorway"></div></div>
        <div class="kb-sec ws-counter">
          <div class="ws-wall">${sushiBoard()}
            ${kbSign(sc, "ねた", "ws-case", `<span class="ws-case-glass">${["#F08A4B", "#C8283A", "#F2EFE8", "#EC97A7", "#F2C94C"].map(c => `<i style="background:${c}"></i>`).join("")}</span><span class="ws-case-label">${inkHtml("ねた")}</span>`)}
          </div>
          <div class="ws-belt">${things.map(t => `<div class="ws-slot">${kbProd(t)}${kbTicksHtml(t) ? `<span class="ws-tick">${kbTicksHtml(t)}</span>` : ""}</div>`).join("")}</div>
          <div class="ws-bench">
            ${kbSign(sc, "わさび", "ws-wasabi", `<span class="ws-dish"><i></i></span><span class="ws-tag">${inkHtml("わさび")}</span>`)}
            <span class="ws-tea"></span>
            ${kbSign(sc, "おあいそ", "ws-slipsign", `<span class="ws-tag">${inkHtml("おあいそ")}</span><small>what you say at the end</small>`)}
          </div>
        </div>
      </div>
    </div>
  </div>`;
}
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
  </div>`;
}

/* ---------- the festival ---------- */

const festSc = () => SCENE_BY.festival;
const FEST_AWNINGS = ["#C8323A", "#2F5F9E", "#D9822B", "#3E8A5A", "#8E3E8C"];
const festLanterns = () => kbSign(festSc(), "おまつり", "ws-lanterns", [...furiKana("おまつり")].map(c => `<span class="ws-lantern">${inkKana(c)}</span>`).join(""));
function festStall(t, k) {
  const sc = festSc(), n = [...t.kana].length;
  return `<div class="ws-stall" style="--awn:${FEST_AWNINGS[k % FEST_AWNINGS.length]}">
    <div class="ws-awning"></div>
    <div class="ws-banner printed" lang="ja" style="font-size:${Math.min(24, 118 / n).toFixed(1)}px">${inkHtml(t.name)}</div>
    <div class="ws-booth">
      ${t.flag ? kbSign(sc, t.flag, "ws-flag") : ""}
      ${kbProd(t, festPack(t, true))}
      <div class="ws-price printed">${kbSign(sc, "ひとつ", "ws-hitotsu")}<b>¥${t.price}</b>${kbTicksHtml(t)}</div>
    </div>
  </div>`;
}
function festDesk() {
  const things = stallThings(festSc());
  return `<div class="kb-store ws-night">
    <div class="kb-walk">
      <button class="kb-walkbtn l" data-act="kb-walk" data-d="-1" aria-label="Walk left">${icon("back")}</button>
      <button class="kb-walkbtn r" data-act="kb-walk" data-d="1" aria-label="Walk right">${icon("chevron")}</button>
      <div class="kb-strip ws-street" id="kbStrip">
        <div class="kb-sec ws-gate">${festLanterns()}</div>
        ${things.map((t, k) => `<div class="kb-sec">${festStall(t, k)}</div>`).join("")}
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
      ${things.map((t, k) => `<div class="kb-slot ws-stall-slot"><div class="kb-zoom" style="transform:scale(1.32)">${festStall(t, k)}</div></div>`).join("")}
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
const stallPlace = (id, extra) => ({
  id, bundle: "scenes", sides: ["name"], stamps: [["name", "名", "its name"]],
  get things() { return stallThings(SCENE_BY[id]); }, get by() { stallThings(SCENE_BY[id]); return SCENE_BY[id]._by; },
  readable: (t, side) => side === "name" && soundable(t.kana),
  peers() { return this.things; },
  quiz(t) { return kbNameQuiz(t, this.things); },
  back: () => null,
  foot: () => stallFoot(id),
  ...extra,
});

WALKS.sushi = stallPlace("sushi", {
  eyebrow: "すし", title: "At the sushi counter",
  lede: "The plates come round on the belt, each with its card. The colour of the plate is its price: the board on the wall says which. Take one, read it, put it back.",
  terms: t => [[t.name, t.en, "Card"]],
  pack: sushiPack, big: () => "s-plate",
  desk: sushiDesk, phone: sushiPhone,
  receipt: (things, total) => `<div class="paper-receipt kb-receipt" lang="ja"><div class="pr-store">${inkHtml("すし")}</div>
    ${things.map(t => `<div class="pr-row"><span><i class="ws-dot" style="background:${SUSHI_PLATES[t.plate][0]}"></i> ${inkHtml(t.name)}</span><span>¥${t.price}</span></div>`).join("")}
    <div class="pr-rule"></div><div class="pr-row big"><span>${things.length} plates</span><span>¥${total}</span></div></div>
    <p class="kb-note">To ask for the bill, say <b lang="ja">${inkHtml("おあいそ")}</b>.</p>`,
  words: { ...stallWords("plate", "the belt"), basket: "Take this plate", find: "Take each one off the belt.", foundTitle: "The bill" },
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
