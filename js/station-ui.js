/* Nihongo Quest — 駅, the station, as somewhere you walk through (the
   engine: js/walk-ui.js; the words: js/data/scenes.js → station).

   In at the entrance (入口, and the 東口 it is), across the concourse past
   the ticket machines (切符売り場) to the gates (改札), along the corridor
   under the yellow exit signs (出口: 西口, 北口, 南口) and the orange one for
   changing lines (乗り換え), and out onto platform three (三番線), with its
   departures board (各駅停車, 快速, 急行), the pink sign for the women-only
   carriage (女性専用車), and the speakers overhead with the announcements.

   Signs stay where they are: tap one to look closer, as on the street of
   shops. The announcements are heard, not read off a sign, so they're
   speakers: tap to hear one and see what it says. Every sign and
   announcement is one of the scene's own words. */

const stationSc = () => SCENE_BY.station;
function stationThings() {
  const sc = stationSc();
  if (sc._things) return sc._things;
  sc._things = sc.items.map((_, i) => sc.all[i]).map(it => ({ id: "station" + it.i, i: it.i, name: it.w, kana: it.kana, en: it.m, price: 0 }));
  sc._by = Object.fromEntries(sc._things.map(t => [t.id, t]));
  return sc._things;
}

/* How each sign looks, by its plain text. */
const SN_LOOK = {
  "出口": { k: "exit" }, "入口": { k: "enter" }, "改札": { k: "navy" }, "乗り換え": { k: "orange", after: `<span class="sn-lines"><i style="background:#3E9A4A"></i><i style="background:#E2554B"></i><i style="background:#2F6FC4"></i></span>` },
  "切符売り場": { k: "navy", before: `<svg viewBox="0 0 30 20" class="sn-picto" aria-hidden="true"><rect x="2" y="3" width="26" height="14" rx="2" fill="#fff"/><path d="M8 3 V17" stroke="#1F3B66" stroke-dasharray="2 2"/></svg>` },
  "東口": { k: "exit", after: `<span class="sn-arrow">→</span>` }, "西口": { k: "exit", before: `<span class="sn-arrow">←</span>` },
  "北口": { k: "exit", before: `<span class="sn-arrow">↑</span>` }, "南口": { k: "exit", after: `<span class="sn-arrow">→</span>` },
  "三番線": { k: "platform", before: `<b class="sn-num">3</b>` },
  "各駅停車": { k: "train green", after: `<span class="sn-dest">10:24</span>` }, "快速": { k: "train orange", after: `<span class="sn-dest">10:31</span>` }, "急行": { k: "train red", after: `<span class="sn-dest">10:38</span>` },
  "女性専用車": { k: "pink", before: `<svg viewBox="0 0 20 34" class="sn-picto" aria-hidden="true"><circle cx="10" cy="5" r="4" fill="#fff"/><path d="M10 10 L3 24 H17Z" fill="#fff"/><rect x="6" y="23" width="3" height="10" rx="1" fill="#fff"/><rect x="11" y="23" width="3" height="10" rx="1" fill="#fff"/></svg>` },
};
function snPack(t) {
  const L = SN_LOOK[furiPlain(t.name)] || { k: "navy" };
  return `<div class="sn-sign printed ${L.k}">${L.before || ""}<span class="sn-w" lang="ja">${inkHtml(t.name)}</span>${L.after || ""}</div>`;
}
const snBy = word => stationThings().find(t => furiPlain(t.name) === word);
const snAt = (word, cls = "") => { const t = snBy(word); return `<div class="st-at sn-at ${cls}">${kbProd(t, snPack(t))}${kbTicksHtml(t)}</div>`; };

/* The announcements: speakers you tap. */
function snSpeakers() {
  const sc = stationSc();
  return `<div class="sn-speakers"><div class="sn-speaker-head">${icon("speaker")} Announcements</div>${sc.all.slice(sc.items.length).map(it =>
    kbSign(sc, it.w, "sn-ann", `<span class="sn-cone">${icon("speaker")}</span><span class="sn-ann-jp">${inkHtml(it.w)}</span>`)).join("")}</div>`;
}

const STATION = {
  entrance: () => `<div class="sn-sec sn-entrance">
    <div class="sn-roof"><span class="sn-stname" lang="ja">${inkHtml("さくら{駅|えき}")}</span><i class="sn-clock"></i></div>
    <div class="sn-facade">
      <div class="sn-sidewall">${snAt("東口", "hang-top")}</div>
      <div class="sn-doors">${snAt("入口", "over")}<div class="sn-glassdoors"><i></i><i></i><i></i></div></div>
    </div></div>`,
  concourse: () => `<div class="sn-sec sn-concourse">
    <div class="sn-ceiling">${snAt("切符売り場", "hang")}${snAt("改札", "hang")}</div>
    <div class="sn-floor-row">
      <div class="sn-farechart"><i></i><i></i><i></i><i></i></div>
      <div class="sn-machines">${[0, 1, 2].map(() => `<div class="sn-machine"><i></i><b></b></div>`).join("")}</div>
      <div class="sn-gates">${[0, 1, 2, 3].map(k => `<div class="sn-gate"><i class="${k === 1 ? "no" : "go"}"></i></div>`).join("")}</div>
    </div></div>`,
  corridor: () => `<div class="sn-sec sn-corridor">
    <div class="sn-ceiling">${snAt("出口", "hang")}${snAt("乗り換え", "hang")}</div>
    <div class="sn-exitboard">${snAt("西口")}${snAt("北口")}${snAt("南口")}</div>
    <div class="sn-stairs"><i></i><i></i><i></i><i></i><i></i></div></div>`,
  platform: () => `<div class="sn-sec sn-platform">
    <div class="sn-ceiling">${snAt("女性専用車", "hang")}</div>
    <div class="sn-plat-row">
      <div class="sn-pillar">${snAt("三番線")}</div>
      <div class="sn-board"><div class="sn-board-head" lang="ja">${inkHtml("{発車|はっしゃ}")}</div>${snAt("各駅停車", "row")}${snAt("快速", "row")}${snAt("急行", "row")}</div>
      ${snSpeakers()}
    </div>
    <div class="sn-train"><i></i><i></i><i></i></div>
    <div class="sn-edge"><b class="sn-pinkmark"></b></div></div>`,
};
const SN_ORDER = ["entrance", "concourse", "corridor", "platform"];
function stationDesk() {
  stationThings();
  return `<div class="kb-store sn-station">
    <div class="kb-walk">
      <button class="kb-walkbtn l" data-act="kb-walk" data-d="-1" aria-label="Walk left">${icon("back")}</button>
      <button class="kb-walkbtn r" data-act="kb-walk" data-d="1" aria-label="Walk right">${icon("chevron")}</button>
      <div class="kb-strip sn-strip" id="kbStrip">${SN_ORDER.map(k => `<div class="kb-sec">${STATION[k]()}</div>`).join("")}</div>
    </div>
  </div>`;
}
function stationPhone() {
  stationThings();
  return `<div class="kb-store sn-station">
    <div class="kb-ps sn-ps" id="kbStrip">${SN_ORDER.map(k => `<div class="kb-slot st-slot sn-slot">${STATION[k]()}</div>`).join("")}<div class="kb-slot end"></div></div>
    <p class="muted tiny kb-hint">Swipe through the station · tap a sign to look closer</p>
  </div>`;
}

WALKS.station = {
  id: "station", eyebrow: "駅", title: "At the station", bundle: "scenes", stays: true,
  lede: "In through the entrance, past the ticket machines and the gates, under the exit signs, and out onto platform three. Tap a sign to look closer, and a speaker to hear the announcement.",
  get things() { return stationThings(); }, get by() { stationThings(); return stationSc()._by; },
  sides: ["name"], stamps: [["name", "読", "what it says"]],
  readable: (t, side) => side === "name" && soundable(t.kana),
  peers() { return this.things; },
  quiz(t) { return kbNameQuiz(t, this.things, "What does"); },
  terms: t => [[t.name, t.en, "Sign"]],
  back: () => null,
  pack: snPack, big: () => "s-sign",
  desk: stationDesk, phone: stationPhone,
  receipt: () => "",
  foot: () => stallFoot("station"),
  words: {
    hands: "Up close", put: "Done looking",
    hints: { browse: "Just look. Nothing is tested.", read: "Looking at a sign asks you what it means.", errand: "Find the signs on the list." },
    read: "Tap a sign to look closer. When you're done looking, you'll be asked what it means.",
    browse: "Walk through the station and tap any sign to look closer, hear it, and see what it means. The speakers are the announcements.",
    dot: "under a sign: you can read it", basket: "That's the one", list: "Find the signs that say",
    find: "Find each one in the station.", foundTitle: "Found them all", later: "", score: "recognised",
  },
};
