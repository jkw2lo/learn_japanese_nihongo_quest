/* Nihongo Quest — 看板, shop and door signs, as a street you walk along
   (the engine: js/walk-ui.js; the words: js/data/scenes.js → signs.walk).

   Every sign is where you'd meet it: the café's door with its 営業中 tag
   and 押す plate, its hours on the wall; the ramen shop not open yet; the
   drugstore's automatic door, window posters and till; a shutter down for
   the day; a hallway with the toilets, the exit and the no-entry tape.
   Signs aren't picked up, so "in your hands" is "up close": tap one to look
   at it, and in 読む Read putting it back asks what it means.

   Each sign word is one of the scene's own words, so reading it here is that
   word recognised, as the scene's quiz counts it. The signs are HTML (so
   they take the ink) with small SVG pictograms; the shops are CSS. */

const signsSc = () => SCENE_BY.signs;
function streetThings() {
  const sc = signsSc();
  if (sc._things) return sc._things;
  sc._things = sc.walk.shops.flatMap(([shop, words]) => words.map(w => {
    const it = sc.all.find(a => a.w === w);
    return { id: "signs" + it.i, i: it.i, name: it.w, kana: it.kana, en: it.m, price: 0, shop };
  }));
  sc._by = Object.fromEntries(sc._things.map(t => [t.id, t]));
  return sc._things;
}

/* ---------- the signs ---------- */

const PICTO = {
  person: (c, skirt) => `<svg viewBox="0 0 20 34" class="st-picto" aria-hidden="true"><circle cx="10" cy="5" r="4" fill="${c}"/>${skirt
    ? `<path d="M10 10 L3 24 H17Z" fill="${c}"/><rect x="6" y="23" width="3" height="10" rx="1" fill="${c}"/><rect x="11" y="23" width="3" height="10" rx="1" fill="${c}"/>`
    : `<rect x="4" y="10" width="12" height="13" rx="3" fill="${c}"/><rect x="5" y="22" width="4" height="11" rx="1.5" fill="${c}"/><rect x="11" y="22" width="4" height="11" rx="1.5" fill="${c}"/>`}</svg>`,
  cig: c => `<svg viewBox="0 0 30 30" class="st-picto" aria-hidden="true"><rect x="4" y="15" width="18" height="5" fill="${c}"/><rect x="22" y="15" width="4" height="5" fill="#E06A3A"/><path d="M24 12 q-2 -4 1 -7" stroke="${c}" stroke-width="1.6" fill="none"/></svg>`,
  cam: c => `<svg viewBox="0 0 30 30" class="st-picto" aria-hidden="true"><rect x="4" y="9" width="22" height="15" rx="3" fill="${c}"/><rect x="10" y="6" width="8" height="4" rx="1" fill="${c}"/><circle cx="15" cy="16.5" r="4.5" fill="#fff"/><circle cx="15" cy="16.5" r="2.5" fill="${c}"/></svg>`,
  ban: inner => `<span class="st-ban">${inner}<svg viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="12.5" fill="none" stroke="#D2232A" stroke-width="3"/><path d="M6 6 L24 24" stroke="#D2232A" stroke-width="3"/></svg></span>`,
  run: `<svg viewBox="0 0 34 30" class="st-picto" aria-hidden="true"><circle cx="20" cy="5" r="3.6" fill="#fff"/><path d="M18 10 L12 18 L5 17 M17 11 L20 20 L14 28 M20 20 L27 24 M18 12 L25 13 L28 9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  door: `<svg viewBox="0 0 22 30" class="st-picto" aria-hidden="true"><rect x="2" y="2" width="16" height="26" fill="none" stroke="#fff" stroke-width="2.4"/><path d="M18 28 V2" stroke="#fff" stroke-width="2.4"/></svg>`,
  arrow: dir => `<span class="st-arrow">${dir === "l" ? "←" : "→"}</span>`,
};
/* How each sign looks: its kind (the style) and anything drawn with it. */
const SIGN_LOOK = {
  "営業中": { k: "hang open" }, "準備中": { k: "hang shut" },
  "押す": { k: "doorplate" }, "引く": { k: "doorplate" },  /* small, at hand height */
  "営業時間": { k: "board", after: `<span class="st-hours">11:00 – 20:00</span>` }, "定休日": { k: "board small" },
  "自動ドア": { k: "band" },
  "割引": { k: "pop red", before: `<b class="st-big">20%</b>` }, "半額": { k: "dot" }, "無料": { k: "pop bubble", before: `<b class="st-wifi">Wi-Fi</b>` },
  "売り切れ": { k: "card red" }, "お会計": { k: "ceiling" },
  "本日休業": { k: "paper" },
  "お手洗い": { k: "wc", before: PICTO.person("#fff") + PICTO.person("#fff", true), after: PICTO.arrow("r") },
  "男": { k: "door-m", before: PICTO.person("#fff") }, "女": { k: "door-f", before: PICTO.person("#fff", true) },
  "禁煙": { k: "rule", before: PICTO.ban(PICTO.cig("#222")) }, "撮影禁止": { k: "rule", before: PICTO.ban(PICTO.cam("#222")) },
  "喫煙所": { k: "smoke", before: PICTO.cig("#fff"), after: PICTO.arrow("l") },
  "非常口": { k: "exit", before: PICTO.run + PICTO.door },
  "立入禁止": { k: "tape" },
};
function signPack(t) {
  const L = SIGN_LOOK[furiPlain(t.name)] || { k: "doorplate" };
  return `<div class="st-sign printed ${L.k}">${L.before || ""}<span class="st-w" lang="ja">${inkHtml(t.name)}</span>${L.after || ""}</div>`;
}

/* ---------- the shops ---------- */

const stBy = word => streetThings().find(t => furiPlain(t.name) === word);
const stAt = (word, cls = "") => { const t = stBy(word); return `<div class="st-at ${cls}">${kbProd(t, signPack(t))}${kbTicksHtml(t)}</div>`; };
/* Each shopfront: an upper floor, a fascia with the shop's (made-up) name,
   the ground floor, and what's out on the pavement. The names are inked like
   everything else, but they're names, not words to learn. */
const shopName = (markup, en, cls = "") => `<div class="st-name ${cls}">${kbNameplate(markup, en)}</div>`;
/* A floor above the shop: its windows (curtained, some lit), maybe a
   balcony rail or an air-conditioner box. */
const floor = (cls, n = 2, extra = "") => `<div class="st-floor ${cls}">${[...Array(n)].map((_, i) => `<i class="st-win ${i % 2 ? "lit" : ""}"><b></b></i>`).join("")}${extra}</div>`;
const STREET_ART = {
  cup: `<svg viewBox="0 0 40 30" class="st-decal" aria-hidden="true"><path d="M6 10 H28 V20 Q28 27 17 27 Q6 27 6 20Z" fill="#F6EEDC"/><path d="M28 13 Q35 13 34 18 Q33 22 28 21" stroke="#F6EEDC" stroke-width="2.4" fill="none"/><path d="M12 7 q2 -3 0 -6 M18 7 q2 -3 0 -6" stroke="#F6EEDC" stroke-width="1.6" fill="none"/></svg>`,
  cross: `<svg viewBox="0 0 30 30" class="st-logo" aria-hidden="true"><circle cx="15" cy="15" r="14" fill="#fff"/><path d="M12 6 H18 V12 H24 V18 H18 V24 H12 V18 H6 V12 H12Z" fill="#E2554B"/></svg>`,
  tanuki: `<svg viewBox="0 0 40 56" class="st-tanuki" aria-hidden="true"><ellipse cx="20" cy="40" rx="15" ry="15" fill="#8C6239"/><ellipse cx="20" cy="43" rx="9" ry="10" fill="#E8D2AE"/><circle cx="20" cy="17" r="12" fill="#8C6239"/><path d="M9 9 l3 -6 l4 5 M31 9 l-3 -6 l-4 5" fill="#6B4226"/><ellipse cx="15" cy="17" rx="4" ry="3" fill="#3A2416"/><ellipse cx="25" cy="17" rx="4" ry="3" fill="#3A2416"/><circle cx="15" cy="16.5" r="1" fill="#fff"/><circle cx="25" cy="16.5" r="1" fill="#fff"/><ellipse cx="20" cy="22" rx="3" ry="2" fill="#3A2416"/><path d="M3 30 q-3 8 4 10" stroke="#5A3A20" stroke-width="3" fill="none"/></svg>`,
  bike: `<svg viewBox="0 0 90 54" class="st-bike" aria-hidden="true"><circle cx="18" cy="38" r="14" fill="none" stroke="#3E4247" stroke-width="3"/><circle cx="72" cy="38" r="14" fill="none" stroke="#3E4247" stroke-width="3"/><path d="M18 38 L36 18 H62 L72 38 M36 18 L46 38 L62 18 M32 12 H42 M62 18 L58 8 H68" stroke="#B5352B" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="58" y="20" width="20" height="10" rx="2" fill="none" stroke="#3E4247" stroke-width="2"/></svg>`,
  plant: `<svg viewBox="0 0 40 60" class="st-plant" aria-hidden="true"><path d="M20 34 q-14 -10 -10 -26 q6 8 10 26 q2 -22 12 -30 q2 16 -12 30 q10 -10 18 -6 q-6 10 -18 6" fill="#5E8C4F"/><path d="M8 34 H32 L28 58 H12Z" fill="#B5694A"/><path d="M8 34 H32 V38 H8Z" fill="#9C5638"/></svg>`,
  vend: `<div class="st-vend"><div class="st-vend-cans">${["#C8323A", "#2F6FC4", "#3E9A4A", "#F2B33C", "#7A4A2A", "#E8E3D8", "#C8323A", "#2F6FC4"].map(c => `<i style="background:${c}"></i>`).join("")}</div><b></b></div>`,
  menu: `<div class="st-menuboard">${["#E9C46A", "#D9822B", "#C8323A", "#E9C46A"].map(c => `<i style="--c:${c}"></i>`).join("")}</div>`,
  ticket: `<div class="st-ticketmachine"><i></i><b></b></div>`,
  table: `<i class="st-table"></i>`,
};
const STREET = {
  /* a two-storey brick corner café: a green awning, a big window onto the tables, a wide glass door */
  cafe: () => `<div class="st-shop st-cafe" style="--bh:440px">
    ${floor("brick", 2, `<i class="st-rail"></i>`)}
    <div class="st-fascia green">${shopName("{喫茶|きっさ} こもれび", "Kissa Komorebi — a café (komorebi: sunlight through leaves)", "gold")}</div>
    <div class="st-front">
      <div class="st-canvas"></div>
      <div class="st-window lace">${STREET_ART.table}${STREET_ART.table}${STREET_ART.cup}<span class="st-glass-text">COFFEE · CAKE</span></div>
      <div class="st-door double">${stAt("営業中", "on-door")}<i class="st-pane"></i><i class="st-pane"></i>${stAt("押す", "on-handle")}</div>
      <div class="st-wallside">${stAt("定休日")}<i class="st-lamp"></i></div>
    </div>
    <div class="st-curb wide">${STREET_ART.plant}<div class="st-easel">${stAt("営業時間")}<i></i></div></div></div>`,
  /* a low wooden ramen shop under a tiled roof: noren, lantern, ticket machine, photo menu */
  ramen: () => `<div class="st-shop st-ramen" style="--bh:330px">
    <div class="st-tileroof"></div>
    <div class="st-fascia wood">${shopName("らーめん たぬき", "Rāmen Tanuki — a ramen shop (a tanuki is a raccoon dog)")}</div>
    <div class="st-front">
      ${STREET_ART.menu}
      <div class="st-door slide"><div class="st-noren red"><span lang="ja">${inkHtml("らーめん")}</span></div>${stAt("準備中", "on-door low")}${stAt("引く", "on-handle")}</div>
      <div class="st-sidecol"><div class="st-lantern"><span lang="ja">${inkHtml("らーめん")}</span></div>${STREET_ART.ticket}</div>
    </div>
    <div class="st-curb">${STREET_ART.tanuki}</div></div>`,
  /* a three-storey drugstore: a sign sticking out, packed shelves, sale wagons out front */
  drug: () => `<div class="st-shop st-drug" style="--bh:560px">
    <div class="st-sode" lang="ja">${[...furiKana("くすり")].map(c => `<b>${inkKana(c)}</b>`).join("")}</div>
    ${floor("panel", 3, `<i class="st-ac"></i>`)}${floor("panel", 3, `<i class="st-ac left"></i>`)}
    <div class="st-fascia led">${STREET_ART.cross}${shopName("ドラッグ はなまる", "Drug Hanamaru — a drugstore (hanamaru: a teacher's flower mark)")}</div>
    <div class="st-front glass">
      <div class="st-shopwin">
        <div class="st-stock">${[...Array(4)].map(() => `<div class="st-row">${["#E2554B", "#F2B33C", "#5FA7D8", "#7FB15A", "#F2F2F2", "#C46FB0", "#F2B33C", "#5FA7D8", "#E2554B", "#7FB15A"].map(c => `<i style="background:${c}"></i>`).join("")}</div>`).join("")}</div>
        <div class="st-pop-top">${stAt("割引", "pop-hang")}</div>
        <div class="st-till">${stAt("お会計", "hang-top")}<i></i></div>
      </div>
      <div class="st-door auto">${stAt("自動ドア", "on-glass")}${stAt("無料", "on-glass-low")}</div>
    </div>
    <div class="st-curb wide">
      <i class="st-nobori"><b>SALE</b></i>
      <div class="st-wagon">${stAt("半額", "on-wagon")}<i></i><i></i><i></i></div>
      <div class="st-tp"><i></i><i></i><i></i></div>
      <div class="st-standshelf">${stAt("売り切れ", "on-shelf")}<i></i></div>
      <div class="st-baskets"></div>
    </div></div>`,
  /* an old two-storey bookshop, shutter down for the day; a vending machine beside it */
  shut: () => `<div class="st-shop st-shut" style="--bh:400px">
    ${floor("old", 2, `<i class="st-ac"></i><i class="st-rail wood"></i>`)}
    <div class="st-fascia old">${shopName("{山田|やまだ}{書店|しょてん}", "Yamada Shoten — Yamada's bookshop")}</div>
    <div class="st-front"><div class="st-shutter">${stAt("本日休業", "taped")}</div>${STREET_ART.vend}</div>
    <div class="st-curb left">${STREET_ART.bike}</div></div>`,
  /* a four-storey office block: glass all the way up, the lobby through the doors */
  hall: () => `<div class="st-shop st-bldg" style="--bh:620px">
    ${floor("glass", 4)}${floor("glass", 4)}${floor("glass", 4)}
    <div class="st-fascia plate">${shopName("さくらビル", "Sakura Building — an office building")}</div>
    <div class="st-front lobby">
      <div class="st-lobby-ceiling">${stAt("お手洗い", "hang-top")}</div>
      <div class="st-wcdoor">${stAt("男", "on-wc")}</div><div class="st-wcdoor">${stAt("女", "on-wc")}</div>
      <div class="st-wallbits">${stAt("禁煙")}${stAt("撮影禁止")}</div>
    </div></div>`,
  /* down the side of it: the smoking area outside, the emergency exit, the stairs down taped off */
  exit: () => `<div class="st-shop st-alley" style="--bh:360px">
    ${floor("tile", 1)}
    <div class="st-front alley">
      <div class="st-booth">${stAt("喫煙所", "on-booth")}<i></i><b></b></div>
      <div class="st-exit">${stAt("非常口", "over-door")}<div class="st-door metal"></div></div>
      <div class="st-stairs down"><i></i><i></i><i></i><i></i>${stAt("立入禁止", "on-rope")}</div>
    </div></div>`,
};
function streetDesk() {
  streetThings();
  return `<div class="kb-store st-street">
    <div class="kb-walk">
      <button class="kb-walkbtn l" data-act="kb-walk" data-d="-1" aria-label="Walk left">${icon("back")}</button>
      <button class="kb-walkbtn r" data-act="kb-walk" data-d="1" aria-label="Walk right">${icon("chevron")}</button>
      <div class="kb-strip st-strip" id="kbStrip">${signsSc().walk.shops.map(([shop], i) => `<div class="kb-sec">${i ? `<i class="st-pole"></i>` : ""}${STREET[shop]()}</div>`).join("")}</div>
    </div>
    <div class="st-pavement"></div>
  </div>`;
}
function streetPhone() {
  streetThings();
  return `<div class="kb-store st-street">
    <div class="kb-ps st-ps" id="kbStrip">${signsSc().walk.shops.map(([shop]) => `<div class="kb-slot st-slot">${STREET[shop]()}</div>`).join("")}<div class="kb-slot end"></div></div>
    <p class="muted tiny kb-hint">Swipe along the street · tap a sign to look closer</p>
  </div>`;
}

WALKS.signs = {
  id: "signs", eyebrow: "看板", title: "Shop and door signs", bundle: "scenes", stays: true,
  lede: "A short street of shops. Is it open? Push or pull? Where's the toilet, and what's half price? Every sign is where you'd meet it: tap one to look closer.",
  get things() { return streetThings(); }, get by() { streetThings(); return signsSc()._by; },
  sides: ["name"], stamps: [["name", "読", "what it says"]],
  readable: (t, side) => side === "name" && soundable(t.kana),
  peers() { return this.things; },
  quiz(t) { return kbNameQuiz(t, this.things, "What does"); },
  terms: t => [[t.name, t.en, "Sign"]],
  back: () => null,
  pack: signPack, big: () => "s-sign",
  desk: streetDesk, phone: streetPhone,
  receipt: () => "",
  foot: () => stallFoot("signs"),
  words: {
    hands: "Up close", put: "Done looking",
    hints: { browse: "Just look. Nothing is tested.", read: "Looking at a sign asks you what it means.", errand: "Find the signs on the list." },
    read: "Tap a sign to look closer. When you're done looking, you'll be asked what it means.",
    browse: "Walk along the street and tap any sign to look closer, hear it, and see what it means.",
    dot: "under a sign: you can read it", basket: "That's the one", list: "Find the signs that say",
    find: "Find each one along the street.", foundTitle: "Found them all", later: "", score: "recognised",
  },
};
