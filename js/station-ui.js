/* Nihongo Quest — 駅, the station, as a trip (the engine: js/walk-ui.js;
   the words: js/data/scenes.js → station; the trip's data: station.walk).

   You start in the street, at the stairs down into the subway (入口, and
   the 東口 they are). Down the stairs is the lobby, three walls you turn
   between with the buttons at the sides: the ticket machines (切符売り場),
   the departures board with the exit signs pointing where they go (西口 to
   the left, 北口 ahead, 南口 to the right), and the gates (改札). A machine
   opens its screen: pick where you're going, adult or child, put your money
   in, take your ticket and change. The ticket sits at the bottom right.

   The gates only open with a ticket. Behind them, two flights of stairs,
   each under the sign that says which platforms and which way (方面); the
   orange sign is for changing lines (乗り換え), and the speakers here have
   their own announcements. Up the stairs, a platform: a train each side,
   each saying on its side what it is and where it goes. Get on the right one
   and you can go: take a seat, the doors close, the city goes by, and you
   get off somewhere with the same layout and a different name — your
   ticket used up. Get on the wrong one and it says so, and no more.

   Every sign is one of the scene's words, and stays where it is: tap one to
   look closer. Every other piece of Japanese here — the names, the machine,
   the board, the ticket, the announcements — can be tapped to hear it and
   see for a moment what it is. */

const stationSc = () => SCENE_BY.station;
const tripData = () => stationSc().walk;
const trip = { at: null, stage: "out", view: 0, slide: "", modal: null, step: "dest", dest: null, who: "adult", paid: 0, ticket: null, ride: null, msg: null };
function stationThings() {
  const sc = stationSc();
  if (sc._things) return sc._things;
  sc._things = sc.items.map((_, i) => sc.all[i]).map(it => ({ id: "station" + it.i, i: it.i, name: it.w, kana: it.kana, en: it.m, price: 0 }));
  sc._by = Object.fromEntries(sc._things.map(t => [t.id, t]));
  return sc._things;
}

/* ---------- where you are, and where you can go from here ---------- */

const homeSt = () => tripData().home;
const hereSt = () => trip.at || homeSt().to;
const stEn = to => to === homeSt().to ? homeSt().en : (tripData().dests.find(d => d.to === to) || {}).en || "";
/* From here: the four trains, one a platform. Away from さくら, the train
   that would have gone to where you now are goes back to さくら instead. */
const routes = () => tripData().dests.map(d => d.to === hereSt() ? { ...d, to: homeSt().to, en: homeSt().en } : d);
const destBy = to => routes().find(d => d.to === to);
const fareFor = (d, who) => who === "child" ? Math.ceil(d.fare / 2 / 10) * 10 : d.fare;
const pairOf = n => n <= 2 ? "p12" : "p34";

/* ---------- words on things ---------- */

const SN_LOOK = {
  "出口": { k: "exit" }, "入口": { k: "enter" }, "改札": { k: "navy" },
  "乗り換え": { k: "orange", after: `<span class="sn-lines"><i style="background:#3E9A4A"></i><i style="background:#E2554B"></i><i style="background:#2F6FC4"></i></span><span class="sn-arrow">→</span>` },
  "切符売り場": { k: "navy", before: `<svg viewBox="0 0 30 20" class="sn-picto" aria-hidden="true"><rect x="2" y="3" width="26" height="14" rx="2" fill="#fff"/><path d="M8 3 V17" stroke="#1F3B66" stroke-dasharray="2 2"/></svg>` },
  "東口": { k: "exit" }, "西口": { k: "exit", before: `<span class="sn-arrow">←</span>` },
  "北口": { k: "exit", before: `<span class="sn-arrow">↑</span>` }, "南口": { k: "exit", after: `<span class="sn-arrow">→</span>` },
  "三番線": { k: "platform", before: `<b class="sn-num">3</b>` },
  "各駅停車": { k: "type green" }, "快速": { k: "type orange" }, "急行": { k: "type red" },
  "女性専用車": { k: "pink", before: `<svg viewBox="0 0 20 34" class="sn-picto" aria-hidden="true"><circle cx="10" cy="5" r="4" fill="#fff"/><path d="M10 10 L3 24 H17Z" fill="#fff"/><rect x="6" y="23" width="3" height="10" rx="1" fill="#fff"/><rect x="11" y="23" width="3" height="10" rx="1" fill="#fff"/></svg>` },
};
function snPack(t) {
  const L = SN_LOOK[furiPlain(t.name)] || { k: "navy" };
  return `<div class="sn-sign printed ${L.k}">${L.before || ""}<span class="sn-w" lang="ja">${inkHtml(t.name)}</span>${L.after || ""}</div>`;
}
const snBy = word => stationThings().find(t => furiPlain(t.name) === word);
const snAt = (word, cls = "") => { const t = snBy(word); return `<div class="st-at sn-at ${cls}">${kbProd(t, snPack(t))}${kbTicksHtml(t)}</div>`; };
/* a term from the trip's list, or a name: tap to hear it, and see for a moment what it is */
const snTerm = (markup, cls = "") => { const T = tripData().terms.find(x => x[0] === markup); return kbNameplate(markup, T ? T[1] : "", "sn-term " + cls); };
const snStation = (to, cls = "") => kbNameplate(to, stEn(to), "sn-term " + cls);
const snEki = (to, cls = "") => kbNameplate(to + "{駅|えき}", `${stEn(to)} Station`, "sn-term " + cls);
const PLAT_TERM = { 1: "{一番線|いちばんせん}", 2: "{二番線|にばんせん}", 4: "{四番線|よんばんせん}" };
const snPlatName = n => n === 3 ? snAt("三番線") : `<div class="sn-sign printed platform"><b class="sn-num">${n}</b>${snTerm(PLAT_TERM[n])}</div>`;
const snSpeaker = (markup, en) => `<button class="sn-ann kb-signword" data-act="kb-gloss" data-say="${esc(furiKana(markup))}" data-en="${esc(en)}"><span class="sn-cone">${icon("speaker")}</span><span class="sn-ann-jp" lang="ja">${inkHtml(markup)}</span></button>`;

/* ---------- the views ---------- */

/* Each stage is a row of views you turn between with the side buttons. */
const SN_VIEWS = { out: ["street"], lobby: ["tix", "board", "gates"], paid: ["c12", "c34"], p12: ["t1", "t2"], p34: ["t3", "t4"], ride: ["ride"] };
const snView = () => SN_VIEWS[trip.stage][trip.view];
/* the signs you can see from each view, so an errand only asks for those */
const SN_SEE = {
  street: ["入口", "東口"], tix: ["切符売り場"], board: ["出口", "西口", "北口", "南口", "各駅停車", "快速", "急行", "三番線"], gates: ["改札"],
  c12: ["出口"], c34: ["乗り換え", "出口"], t1: ["急行"], t2: ["各駅停車", "女性専用車"], t3: ["三番線", "快速", "女性専用車"], t4: ["各駅停車"], ride: [],
};
/* the buttons at the sides: [label, stage, view] */
function snNav() {
  return {
    tix: { l: ["Up to the street", "out", 0], r: ["The departures board", "lobby", 1] },
    board: { l: ["Ticket machines", "lobby", 0], r: ["The gates", "lobby", 2] },
    gates: { l: ["The departures board", "lobby", 1] },
    c12: { l: ["Back through the gates", "lobby", 2], r: ["Stairs to 3・4", "paid", 1] },
    c34: { l: ["Stairs to 1・2", "paid", 0] },
    t1: { r: ["Platform 2", "p12", 1] }, t2: { l: ["Platform 1", "p12", 0] },
    t3: { r: ["Platform 4", "p34", 1] }, t4: { l: ["Platform 3", "p34", 0] },
  }[snView()] || {};
}
const snNavHtml = () => { const n = snNav(); return ["l", "r"].map(s => n[s] ? `<button class="sn-nav ${s}" data-act="sn-nav" data-stage="${n[s][1]}" data-view="${n[s][2]}" data-dir="${s}" aria-label="${esc(n[s][0])}" title="${esc(n[s][0])}">
  <span class="sn-nav-ico">${icon(s === "l" ? "back" : "chevron")}</span></button>` : "").join(""); };

/* Stairs, drawn in perspective. Down (from the street): treads seen from
   above, getting smaller and darker as they go, the walls closing in, the
   rails following them down, light from the landing below. Up (to the
   platforms): the risers facing you, each with its yellow edge, narrowing
   to the light at the top. */
function stairsSvg(dir) {
  const W = 300, H = dir === "down" ? 190 : 300, n = dir === "down" ? 11 : 14;
  const top = dir === "down" ? [0, 300] : [96, 204], bot = dir === "down" ? [70, 230] : [0, 300];
  const lerp = (a, b, t) => a + (b - a) * t;
  let steps = "";
  for (let i = 0; i < n; i++) {
    /* t from the near end (0) to the far end (1); far steps are thinner (perspective) */
    const t0 = i / n, t1 = (i + 1) / n, ease = t => dir === "down" ? 1 - Math.pow(1 - t, 1.6) : Math.pow(t, 1.35);
    const near = dir === "down" ? top : bot, far = dir === "down" ? bot : top;
    const y0 = dir === "down" ? ease(t0) * H : H - ease(t0) * H, y1 = dir === "down" ? ease(t1) * H : H - ease(t1) * H;
    const l0 = lerp(near[0], far[0], t0), r0 = lerp(near[1], far[1], t0), l1 = lerp(near[0], far[0], t1), r1 = lerp(near[1], far[1], t1);
    const shade = dir === "down" ? Math.round(205 - t0 * 150) : Math.round(214 - (1 - t0) * 40);
    const tread = `rgb(${shade},${shade + 4},${shade + 8})`, riser = `rgb(${shade - 38},${shade - 34},${shade - 30})`;
    const mid = lerp(y0, y1, dir === "down" ? .62 : .3);
    steps += dir === "down"
      ? `<path d="M${l0} ${y0} H${r0} L${lerp(r0, r1, .62)} ${mid} H${lerp(l0, l1, .62)}Z" fill="${tread}"/><path d="M${lerp(l0, l1, .62)} ${mid} H${lerp(r0, r1, .62)} L${r1} ${y1} H${l1}Z" fill="${riser}"/><path d="M${l0} ${y0} H${r0}" stroke="#E9C445" stroke-width="${2.4 - t0 * 1.6}"/>`
      : `<path d="M${l0} ${y0} H${r0} L${lerp(r0, r1, .3)} ${mid} H${lerp(l0, l1, .3)}Z" fill="${riser}"/><path d="M${lerp(l0, l1, .3)} ${mid} H${lerp(r0, r1, .3)} L${r1} ${y1} H${l1}Z" fill="${tread}"/><path d="M${lerp(l0, l1, .3)} ${mid} H${lerp(r0, r1, .3)}" stroke="#E9C445" stroke-width="${1 + t0 * 1.6}"/>`;
  }
  const far = dir === "down" ? bot : top, near = dir === "down" ? top : bot, yFar = dir === "down" ? H : 0, yNear = dir === "down" ? 0 : H;
  const glow = dir === "down"
    ? `<rect x="${bot[0]}" y="${H - 8}" width="${bot[1] - bot[0]}" height="8" fill="#FFF3C4" opacity=".7"/><defs><linearGradient id="sv-dn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#0A0C10" stop-opacity=".55"/><stop offset="1" stop-color="#FFE9A8" stop-opacity=".35"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sv-dn)"/>`
    : `<rect x="${top[0]}" y="0" width="${top[1] - top[0]}" height="10" fill="#FFFFFF"/><defs><linearGradient id="sv-up" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".45"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sv-up)"/>`;
  const rails = `<path d="M${near[0] + 8} ${yNear} L${far[0] + 6} ${yFar}" stroke="#8E959B" stroke-width="5" stroke-linecap="round"/><path d="M${near[1] - 8} ${yNear} L${far[1] - 6} ${yFar}" stroke="#8E959B" stroke-width="5" stroke-linecap="round"/>
    <path d="M${near[0] + 8} ${yNear} L${far[0] + 6} ${yFar}" stroke="#E9ECEE" stroke-width="1.5" stroke-linecap="round"/><path d="M${near[1] - 8} ${yNear} L${far[1] - 6} ${yFar}" stroke="#E9ECEE" stroke-width="1.5" stroke-linecap="round"/>`;
  const sidewalls = dir === "down"
    ? `<path d="M0 0 L${bot[0]} ${H} H0Z" fill="#6E767D"/><path d="M${W} 0 L${bot[1]} ${H} H${W}Z" fill="#5E656B"/>`
    : `<path d="M0 ${H} L${top[0]} 0 H0Z" fill="#B9C0C5"/><path d="M${W} ${H} L${top[1]} 0 H${W}Z" fill="#A8AFB5"/>`;
  return `<svg class="sv-stairs-svg ${dir}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${steps}${sidewalls}${glow}${rails}</svg>`;
}

/* the street: the stairs down into the subway */
const snStreet = () => `<div class="sv sv-street">
  <div class="sv-skyline">${[[70, 150, "#C9CED6"], [110, 220, "#B9C2CC"], [90, 180, "#D2D6DC"], [130, 260, "#AEB8C3"], [80, 170, "#C6CCD3"]].map(([w, h, c]) => `<i style="width:${w}px;height:${h}px;background:${c}"></i>`).join("")}</div>
  <div class="sv-tree"><i></i><b></b></div>
  <div class="sv-pole">${snAt("東口", "pole")}<button class="sv-map" data-act="sn-map" aria-label="The route map"><span lang="ja">${inkHtml("{路線図|ろせんず}")}</span>${mapLines()}</button></div>
  <div class="sv-entrance">
    <div class="sv-ent-sign"><span class="sv-logo">M</span>${snTerm("{地下鉄|ちかてつ}")}${snEki(hereSt(), "sv-ent-name")}</div>
    <div class="sv-canopy"><i></i><i></i>${snAt("入口", "on-canopy")}</div>
    <button class="sv-down" data-act="sn-nav" data-stage="lobby" data-view="0" data-dir="d" aria-label="Go down the stairs">${stairsSvg("down")}</button>
  </div>
  <div class="sv-bikes">${STREET_ART.bike}${STREET_ART.bike}</div>
  <div class="sv-pavement"></div>
  <p class="sn-hint">Tap the stairs to go down.</p></div>`;

/* the lobby: three walls */
const snTix = () => `<div class="sv sv-lobby sv-tix">
  <div class="sn-ceiling-lights"><i></i><i></i><i></i></div>
  <div class="sv-wallsign">${snAt("切符売り場", "hang")}</div>
  <div class="sv-machines">${[0, 1, 2, 3].map(k => `<button class="sv-machine ${k === 3 ? "ic" : ""}" data-act="sn-machine" aria-label="A ticket machine"><i class="sv-scr"><b></b><b></b><b></b></i><i class="sv-slots"></i><i class="sv-tray"></i></button>`).join("")}</div>
  <p class="sn-hint dark">Tap a machine to buy a ticket.</p></div>`;
function snBoardView() {
  const rows = [...routes()].sort((a, b) => a.time.localeCompare(b.time));
  return `<div class="sv sv-lobby sv-board">
    <div class="sn-ceiling-lights"><i></i><i></i><i></i></div>
    <div class="sv-exits">
      <div class="sv-exit l">${snAt("西口", "hang")}</div>
      <div class="sv-exit c">${snAt("出口", "hang")}${snAt("北口")}</div>
      <div class="sv-exit r">${snAt("南口", "hang")}</div>
    </div>
    <div class="sv-dboard">
      <div class="sv-db-title">${snTerm("{発車|はっしゃ}")}<span class="sv-db-clock">10:20</span></div>
      <div class="sv-db-head">${snTerm("{時刻|じこく}")}${snTerm("{種別|しゅべつ}")}${snTerm("{行先|ゆきさき}")}${snTerm("{番線|ばんせん}")}</div>
      ${rows.map(d => { const k = snBy(furiPlain(d.kind)); return `<div class="sv-db-row"><b>${d.time}</b><span>${kbProd(k, snPack(k))}</span><span class="sv-db-to">${snStation(d.to)}</span><span class="sv-db-n">${d.track === 3 ? snAt("三番線", "tiny") : snTerm(PLAT_TERM[d.track])}</span></div>`; }).join("")}
    </div></div>`;
}
const snGates = () => `<div class="sv sv-lobby sv-gates">
  <div class="sn-ceiling-lights"><i></i><i></i><i></i></div>
  <div class="sv-wallsign">${snAt("改札", "hang")}</div>
  <div class="sv-gaterow"><div class="sv-office"><i></i></div>
    <button class="sv-gatebank" data-act="sn-gate" aria-label="Go through the gates">${[0, 1, 2, 3, 4].map(k => `<span class="sv-gate"><i class="sv-ic"></i><b class="${k === 2 ? "no" : "go"}"></b><u></u></span>`).join("")}</button></div>
  <p class="sn-hint dark">${trip.ticket ? "Tap the gates to go through." : "You'll need a ticket for the gates."}</p></div>`;

/* the paid side: two flights of stairs, each under its sign */
function snStairs(pair) {
  const ds = routes().filter(d => pairOf(d.track) === pair).sort((a, b) => a.track - b.track);
  return `<div class="sv sv-paid">
    <div class="sn-ceiling-lights"><i></i><i></i><i></i></div>
    <div class="sv-paid-signs">
      <div class="sv-backexit">${snAt("出口", "hang")}<span class="sn-arrow dark">←</span></div>
      <div class="sv-dirsign"><span class="sv-dir-pl">${snTerm(pair === "p12" ? "{一|いち}・{二番線|にばんせん}" : "{三|さん}・{四番線|よんばんせん}")}</span>
        <span class="sv-dir-to">${ds.map(d => snStation(d.to)).join("<i>・</i>")}${snTerm("{方面|ほうめん}")}</span><span class="sn-arrow">↑</span></div>
      <div class="sv-transfer">${pair === "p34" ? snAt("乗り換え", "hang") : ""}</div>
    </div>
    <div class="sv-stairhall">
      <button class="sv-up" data-act="sn-nav" data-stage="${pair}" data-view="0" data-dir="u" aria-label="Up the stairs to the platforms">${stairsSvg("up")}</button>
      <div class="sn-speakers"><div class="sn-speaker-head">${icon("speaker")} Announcements</div>${tripData().ann.map(([w, en]) => snSpeaker(w, en)).join("")}</div>
    </div>
    <p class="sn-hint dark">Tap the stairs to go up to the platforms.</p></div>`;
}

/* a platform, one track a view */
function snTrack(n) {
  const d = routes().find(x => x.track === n), k = snBy(furiPlain(d.kind)), sc = stationSc();
  const others = routes().filter(x => pairOf(x.track) === pairOf(n)).sort((a, b) => a.track - b.track);
  const voice = sc.all.slice(sc.items.length).filter((_, i) => i !== 0 || n === 3);
  const women = SN_SEE["t" + n].includes("女性専用車");
  return `<div class="sv sv-plat">
    <div class="sv-canopy-in"><i></i><i></i><i></i></div>
    <div class="sv-ekimei"><span>← ${snStation(others[0].to)}</span>${kbNameplate(hereSt(), stEn(hereSt()), "sv-ek-name")}<span>${snStation(others[1].to)} →</span></div>
    <div class="sv-platrow">
      <div class="sv-platsign">${snPlatName(n)}</div>
      <div class="sv-train">
        <div class="sv-led">${kbProd(k, snPack(k))}<span class="sv-led-to">${snStation(d.to)}</span></div>
        <div class="sv-car"><i class="sv-win"></i>
          <button class="sv-tdoor" data-act="sn-ride" data-track="${n}" aria-label="Get on"><i></i><i></i></button>
          <i class="sv-win"></i>
          <button class="sv-tdoor" data-act="sn-ride" data-track="${n}" aria-label="Get on"><i></i><i></i></button><i class="sv-win"></i>
          ${women ? `<div class="sv-women">${snAt("女性専用車", "hang")}</div>` : ""}</div>
      </div>
    </div>
    <div class="sv-edge"><i class="${women ? "pink" : ""}"></i></div>
    <div class="sn-speakers sv-anns"><div class="sn-speaker-head">${icon("speaker")} Announcements</div>${voice.map(it => kbSign(sc, it.w, "sn-ann", `<span class="sn-cone">${icon("speaker")}</span><span class="sn-ann-jp">${inkHtml(it.w)}</span>`)).join("")}</div>
    <button class="btn btn-ghost btn-sm sv-downbtn" data-act="sn-nav" data-stage="paid" data-view="${pairOf(n) === "p12" ? 0 : 1}" data-dir="d">↓ Back down the stairs</button></div>`;
}

/* The ride. Inside the carriage: lights along the ceiling, ads hanging and
   above the windows (three a ride, picked at random), grab poles and straps,
   the long blue seat with the priority seats at its end, the door with its
   screen above. Take a seat: the doors close, the platform slides away, the
   tunnel's lights stream past, the announcements come, and the next
   station's platform slides in and stops. The doors open. */
const AD_ART = {
  chat: `<svg viewBox="0 0 40 30"><path d="M4 4 H26 V18 H12 L6 24 V18 H4Z" fill="#fff"/><path d="M18 10 H36 V24 H34 V28 L29 24 H18Z" fill="#FFE14D"/></svg>`,
  can: `<svg viewBox="0 0 40 30"><rect x="12" y="3" width="16" height="25" rx="3" fill="#BFF0C8"/><rect x="12" y="10" width="16" height="10" fill="#fff"/></svg>`,
  onsen: `<svg viewBox="0 0 40 30"><path d="M6 22 Q20 30 34 22 V26 Q20 32 6 26Z" fill="#fff"/><path d="M14 18 q-3 -5 0 -9 q3 -4 0 -8 M20 18 q-3 -5 0 -9 q3 -4 0 -8 M26 18 q-3 -5 0 -9 q3 -4 0 -8" stroke="#fff" stroke-width="2" fill="none"/></svg>`,
  bowl: `<svg viewBox="0 0 40 30"><path d="M4 12 H36 Q34 28 20 28 Q6 28 4 12Z" fill="#fff"/><path d="M8 12 q4 -4 8 0 t8 0 t8 0" stroke="#F2C94C" stroke-width="2" fill="none"/></svg>`,
  cross: `<svg viewBox="0 0 40 30"><circle cx="20" cy="15" r="12" fill="#fff"/><path d="M17 7 H23 V12 H28 V18 H23 V23 H17 V18 H12 V12 H17Z" fill="#E2554B"/></svg>`,
  mountain: `<svg viewBox="0 0 40 30"><path d="M2 28 L14 8 L22 18 L28 10 L38 28Z" fill="#fff"/><circle cx="32" cy="6" r="3" fill="#FFE14D"/></svg>`,
  cat: `<svg viewBox="0 0 40 30"><path d="M10 26 Q8 12 13 6 L16 10 Q20 8 24 10 L27 6 Q32 12 30 26Z" fill="#fff"/></svg>`,
  truck: `<svg viewBox="0 0 40 30"><rect x="3" y="8" width="22" height="14" fill="#fff"/><path d="M25 12 H32 L37 17 V22 H25Z" fill="#fff"/><circle cx="10" cy="24" r="3" fill="#2A2E33"/><circle cx="30" cy="24" r="3" fill="#2A2E33"/></svg>`,
};
const adHtml = (a, cls) => `<button class="sv-ad ${cls}" style="--ad:${a.bg}" data-act="kb-gloss" data-say="${esc(furiKana(a.head) + "、" + furiKana(a.sub))}" data-en="${esc(a.en)}">
  <span class="sv-ad-art">${AD_ART[a.art] || ""}</span><span class="sv-ad-head" lang="ja">${inkHtml(a.head)}</span><span class="sv-ad-sub" lang="ja">${inkHtml(a.sub)}</span></button>`;
function snRide() {
  const r = trip.ride, ads = r.ads.map(i => tripData().ads[i]);
  const ob = tripData().onboard;
  const win = `<i class="sv-rwin"><b class="sv-tunnel"></b><b class="sv-pform from">${kbNameplate(r.from, stEn(r.from), "sv-pf-name")}</b><b class="sv-pform to">${kbNameplate(r.to, stEn(r.to), "sv-pf-name")}</b></i>`;
  return `<div class="sv sv-ride ${r.phase}">
    <div class="sv-ceil"><i></i><i></i><i></i></div>
    <div class="sv-hangads">${adHtml(ads[0], "hang")}${adHtml(ads[1], "hang")}</div>
    <div class="sv-straps">${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<i style="--i:${i}"></i>`).join("")}</div>
    <div class="sv-carwall">
      <div class="sv-bay">
        <div class="sv-topads">${adHtml(ads[2], "top")}</div>
        <div class="sv-rwins">${win}${win}</div>
        <div class="sv-bench"><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="sv-yusen">${snTerm("{優先席|ゆうせんせき}")}</div>
      </div>
      <i class="sv-grab"></i>
      <div class="sv-doorway">
        <div class="sv-lcd">${r.phase === "slowing" || r.phase === "there" ? kbNameplate("まもなく、" + r.to + "です。", `Arriving soon: ${stEn(r.to)}`, "sv-lcd-t") : kbNameplate("{次|つぎ}は、" + r.to + "です。", `Next: ${stEn(r.to)}`, "sv-lcd-t")}</div>
        <div class="sv-door2"><i class="sv-leaf l"><b></b></i><i class="sv-leaf r"><b></b></i>${win.replace("sv-rwin", "sv-rwin behind")}</div>
        <i class="sv-chime"></i>
      </div>
    </div>
    <div class="sv-carfloor"></div>
    <div class="sv-ctl">
      <div class="sn-speakers sv-onboard">${ob.map(([w, en]) => snSpeaker(w, en)).join("")}</div>
      ${r.phase === "board" ? `<button class="btn kb-main" data-act="sn-sit">Take a seat</button>`
        : r.phase === "there" ? `<button class="btn kb-main" data-act="sn-off">Get off at <span lang="ja">${inkHtml(r.to)}</span></button>`
        : `<span class="sv-riding">${r.phase === "slowing" ? "Slowing down…" : "On the way…"}</span>`}
    </div></div>`;
}

/* ---------- the route map ----------
   The five stations on their line: 品川 and 渋谷 one way, 新宿 and 上野 the
   other, さくら in the middle. Where you are, and what it costs from here. */
const MAP_ORDER = () => { const D = tripData().dests, by = n => D.find(d => d.track === n).to; return [by(1), by(2), homeSt().to, by(4), by(3)]; };
const mapLines = () => `<svg viewBox="0 0 100 40" class="sv-map-mini" aria-hidden="true"><path d="M6 20 H94" stroke="#3E9A4A" stroke-width="5"/><path d="M50 20 H94" stroke="#E8762C" stroke-width="5"/>${[6, 28, 50, 72, 94].map(x => `<circle cx="${x}" cy="20" r="4" fill="#fff" stroke="#1E1D1A" stroke-width="1.5"/>`).join("")}</svg>`;
function snMapWin() {
  const order = MAP_ORDER(), here = hereSt();
  return `<div class="sn-map"><div class="sn-map-head">${snTerm("{路線図|ろせんず}")}<small>Tap a station to hear it</small></div>
    <div class="sn-map-line">${order.map((to, i) => { const d = to === here ? null : destBy(to);
      return `<div class="sn-map-st ${to === here ? "here" : ""} ${i < 2 ? "w" : i > 2 ? "e" : "c"}"><i></i>${to === here ? `<span class="sn-map-you">${snTerm("{現在地|げんざいち}")}</span>` : ""}${snStation(to, "sn-map-name")}<small>${d ? "¥" + d.fare : ""}</small></div>`; }).join("")}</div>
    <p class="muted tiny">Fares are from here, for an adult.</p></div>`;
}

/* ---------- the windows: the machine, the ticket, a note ---------- */

function snMachine() {
  const step = trip.step, d = trip.dest && destBy(trip.dest), fare = d ? fareFor(d, trip.who) : 0;
  let screen;
  if (step === "dest") screen = `<div class="sn-scr-head">${snTerm("きっぷ")}${snTerm("{運賃|うんちん}")}</div>
    <div class="sn-routemap"><span class="sn-here">${snStation(hereSt())}</span>${routes().map(x => `<button class="sn-fare" data-act="sn-dest" data-to="${esc(x.to)}"><span lang="ja">${inkHtml(x.to)}</span><b>¥${x.fare}</b></button>`).join("")}</div>
    <p class="sn-scr-note">Where are you going? Tap a station.</p>`;
  else if (step === "who") screen = `<div class="sn-scr-head">${snStation(d.to)}<b>¥${d.fare}</b></div>
    <div class="sn-who">${snTerm("{大人|おとな}")}<button class="sn-big" data-act="sn-who" data-who="adult">¥${d.fare}</button>${snTerm("{子供|こども}")}<button class="sn-big" data-act="sn-who" data-who="child">¥${fareFor(d, "child")}</button></div>
    <p class="sn-scr-note">One ticket: adult or child?</p>`;
  else if (step === "pay") screen = `<div class="sn-scr-head">${snTerm("お{金|かね}を{入|い}れてください")}</div>
    <div class="sn-paybox"><span>${snTerm(trip.who === "child" ? "{子供|こども}" : "{大人|おとな}")}</span><b>¥${fare}</b><span>In: <b>¥${trip.paid}</b></span></div>
    <div class="sn-coins">${[10, 50, 100, 500, 1000].map(v => `<button class="sn-coin ${v === 1000 ? "bill" : ""}" data-act="sn-pay" data-v="${v}">¥${v}</button>`).join("")}</div>`;
  else screen = `<div class="sn-scr-head">${snTerm("きっぷとおつりをお{取|と}りください")}</div>
    <div class="sn-paybox"><span>Change</span><b>¥${trip.paid - fare}</b></div>
    <button class="btn kb-main" data-act="sn-take">Take your ticket</button>`;
  return `<div class="sn-tm"><div class="sn-tm-top">${snEki(hereSt())}</div><div class="sn-screen">${screen}</div>
    <div class="sn-tm-foot">${step !== "done" ? `<button class="sn-cancel" data-act="sn-cancel" data-say="${esc(furiKana("{取消|とりけし}"))}"><span lang="ja">${inkHtml("{取消|とりけし}")}</span> <small>Cancel</small></button>` : ""}<span class="sn-slot-ticket"></span><span class="sn-slot-coin"></span></div></div>`;
}
function snTicketWin() {
  const t = trip.ticket;
  return `<div class="sn-ticket big printed">
    <div class="sn-tk-head">${snTerm("{乗車券|じょうしゃけん}")}<small>No. 0042</small></div>
    <div class="sn-tk-route">${snStation(t.from)} <span>→</span> ${snStation(t.to)}</div>
    <div class="sn-tk-row">${snTerm(t.who === "child" ? "{子供|こども}" : "{大人|おとな}")}<b>¥${t.fare}</b></div>
    <div class="sn-tk-foot">${snTerm("{発売|はつばい}{当日|とうじつ}{限|かぎ}り{有効|ゆうこう}")}<small>2026.10.2</small></div></div>`;
}
function snWin() {
  if (!trip.modal) return "";
  const body = trip.modal === "machine" ? snMachine() : trip.modal === "ticket" ? snTicketWin() : trip.modal === "map" ? snMapWin() : trip.msg;
  return `<div class="sn-modal"><div class="sn-modal-box ${trip.modal}">${body}
    ${trip.modal === "found" ? "" : `<button class="btn btn-ghost btn-sm sn-close" data-act="sn-close">${trip.modal === "machine" ? "Step away" : "Close"}</button>`}</div></div>`;
}
const snTicketChip = () => trip.ticket && trip.stage !== "out" && trip.stage !== "ride"
  ? `<button class="sn-ticket chip printed ${trip.fresh ? "fresh" : ""}" data-act="sn-ticket" aria-label="Your ticket"><b lang="ja">${inkHtml("きっぷ")}</b><span lang="ja">${inkHtml(trip.ticket.from)} → ${inkHtml(trip.ticket.to)}</span></button>` : "";

/* ---------- drawn ---------- */

function snScene() {
  const v = snView();
  return v === "street" ? snStreet() : v === "tix" ? snTix() : v === "board" ? snBoardView() : v === "gates" ? snGates()
    : v === "c12" ? snStairs("p12") : v === "c34" ? snStairs("p34") : v === "ride" ? snRide() : snTrack(+v.slice(1));
}
const stationView = () => `<div class="kb-store sn-station at-${trip.stage} v-${snView()}">
  <div class="sn-stage ${trip.slide}">${snScene()}</div>
  ${snNavHtml()}${snTicketChip()}${snWin()}</div>`;

WALKS.station = {
  id: "station", eyebrow: "駅", title: "At the station", bundle: "scenes", stays: true,
  lede: "Down the stairs, buy a ticket, through the gates, up to the platform, and onto the right train. Read the signs on the way: tap one to look closer.",
  enter() { Object.assign(trip, { at: null, stage: "out", view: 0, slide: "", modal: null, step: "dest", dest: null, who: "adult", paid: 0, ticket: null, ride: null, msg: null }); },
  get things() { return stationThings(); }, get by() { stationThings(); return stationSc()._by; },
  visible: t => (SN_SEE[snView()] || []).includes(furiPlain(t.name)),
  sides: ["name"], stamps: [["name", "読", "what it says"]],
  readable: (t, side) => side === "name" && soundable(t.kana),
  peers() { return this.things; },
  quiz(t) { return kbNameQuiz(t, this.things, "What does"); },
  terms: t => [[t.name, t.en, "Sign"]],
  back: () => null,
  pack: snPack, big: () => "s-sign",
  desk: stationView, phone: stationView,
  receipt: () => "",
  foot: () => stallFoot("station"),
  words: {
    hands: "Up close", put: "Done looking",
    hints: { browse: "Just look. Nothing is tested.", read: "Looking at a sign asks you what it means.", errand: "Find the signs on the list, from where you are." },
    read: "Tap a sign to look closer. When you're done looking, you'll be asked what it means.",
    browse: "Go down, buy a ticket, and find your train. Tap any sign on the way to look closer; tap any other Japanese to hear it.",
    dot: "under a sign: you can read it", basket: "That's the one", list: "Find the signs that say",
    find: "Find each one from where you're standing.", foundTitle: "Found them all", later: "", score: "recognised",
  },
};

/* ---------- going about it ---------- */

function snGo(stage, view, dir) {
  trip.slide = { l: "from-l", r: "from-r", u: "rise", d: "sink" }[dir] || "";
  trip.stage = stage; trip.view = view; trip.modal = null;
  kbReset();
  if (kb.mode === "errand" && (!kb.errand || !(kb.errand.got || []).length)) kbNewErrand(WALKS.station);
  kbDraw();
  trip.slide = "";
  if (stage === "p34" && view === 0 && dir === "u") say(stationSc().all[stationSc().items.length].kana);   /* まもなく、三番線に… */
}
const snNote = (html, kind = "msg") => { trip.modal = kind; trip.msg = html; kbDraw(); };

Object.assign(ACTS, {
  "sn-nav": el => { snGo(el.dataset.stage, +el.dataset.view, el.dataset.dir); noteActivity(); },
  "sn-machine": () => { trip.modal = "machine"; trip.step = "dest"; trip.dest = null; trip.paid = 0; noteActivity(); kbDraw(); },
  "sn-dest": el => { trip.dest = el.dataset.to; trip.step = "who"; say(furiKana(trip.dest)); kbDraw(); },
  "sn-who": el => { trip.who = el.dataset.who; trip.step = "pay"; trip.paid = 0; say(furiKana("お{金|かね}を{入|い}れてください")); kbDraw(); },
  "sn-pay": el => {
    trip.paid += +el.dataset.v;
    if (trip.paid >= fareFor(destBy(trip.dest), trip.who)) { trip.step = "done"; say(furiKana("きっぷとおつりをお{取|と}りください")); }
    kbDraw();
  },
  "sn-take": () => {
    const d = destBy(trip.dest);
    trip.ticket = { from: hereSt(), to: d.to, who: trip.who, fare: fareFor(d, trip.who) };
    trip.modal = null; trip.step = "dest"; trip.fresh = true; noteActivity(); kbDraw(); trip.fresh = false;
  },
  "sn-cancel": el => { say(el.dataset.say); trip.modal = null; trip.step = "dest"; trip.paid = 0; kbDraw(); },
  "sn-ticket": () => { trip.modal = "ticket"; kbDraw(); },
  "sn-map": () => { trip.modal = "map"; noteActivity(); kbDraw(); },
  "sn-close": () => { trip.modal = null; kbDraw(); },
  "sn-gate": () => {
    if (!trip.ticket) return snNote(`<p class="sn-msg">The gate beeps and its little doors stay shut. You need a ticket first: the machines are under <b lang="ja">${inkHtml("{切符売|きっぷう}り{場|ば}")}</b>.</p>`);
    snGo("paid", 0, "r"); noteActivity();
  },
  "sn-ride": el => {
    const d = routes().find(x => x.track === +el.dataset.track);
    if (!trip.ticket) return snNote(`<p class="sn-msg">No ticket? Then you can't have come through the gates. Go back down and buy one.</p>`);
    if (d.to === trip.ticket.to) {
      snNote(`<div class="sn-found"><div class="sn-found-art">${hanamaru("sn-maru")}${neko("cheer", "sn-found-cat")}${stamp("せいかい")}</div>
        <h3>You found your train!</h3>
        <p>This <span lang="ja">${inkHtml(d.kind)}</span> goes to ${snStation(d.to)}, and so does your ticket.</p>
        <div class="kb-row"><button class="btn kb-main" data-act="sn-depart">Go to <span lang="ja">${inkHtml(d.to)}</span></button><button class="btn btn-ghost" data-act="sn-close">Not yet</button></div></div>`, "found");
      petals($(".sn-modal-box"));
    } else snNote(`<p class="sn-msg">This train goes to ${snStation(d.to)}. Your ticket says ${snStation(trip.ticket.to)}. Not this one.</p>`);
    noteActivity();
  },
  "sn-depart": () => {
    const n = tripData().ads.length, pick = shuffle([...Array(n).keys()]).slice(0, 3);
    trip.ride = { from: hereSt(), to: trip.ticket.to, phase: "board", ads: pick, track: routes().find(x => x.to === trip.ticket.to).track };
    trip.modal = null; snGo("ride", 0, "r");
  },
  "sn-sit": () => {
    const r = trip.ride, ob = tripData().onboard, still = () => trip.stage === "ride" && trip.ride === r;
    const at = (ms, f) => setTimeout(() => { if (still()) f(); }, ms);
    const phase = p => { r.phase = p; kbDraw(); };
    phase("closing");
    say(furiKana("ドアが{閉|し}まります。ご{注意|ちゅうい}ください。"));
    at(2600, () => { phase("moving"); say(furiKana(ob[0][0])); });                                   /* 本日もご乗車… */
    at(6000, () => say(furiKana("{次|つぎ}は、" + r.to + "です。")));
    at(8800, () => { phase("slowing"); say(furiKana("まもなく、" + r.to + "です。")); });
    at(11200, () => say(furiKana(ob[2][0])));                                                      /* 出口は左側です */
    at(13400, () => phase("there"));
  },
  "sn-off": () => {
    const r = trip.ride;
    trip.at = r.to; trip.ticket = null; trip.ride = null;
    snGo(pairOf(r.track), r.track % 2 ? 0 : 1, "r");
  },
});
