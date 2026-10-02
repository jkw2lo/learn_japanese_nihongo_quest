/* Nihongo Quest — 駅, the station, as a trip (the engine: js/walk-ui.js;
   the words: js/data/scenes.js → station; the trip's data: station.walk).

   The line is a loop of five stations (さくら, 新宿, 上野, 品川, 渋谷).
   Platforms 3・4 go one way round, 1・2 the other; every train stops
   everywhere.

   You start in the street, at the stairs down into the subway (入口, and the
   東口 they are; the route map on the pole). Down the stairs is the lobby,
   three walls you turn between with the side buttons: the ticket machines
   (切符売り場), the departures board with the exits pointing where they go,
   and the gates (改札). A machine sells you a ticket to any other station,
   priced by how many stops it is. The gates let you in with it.

   On the paid side, two flights of stairs, each under the sign saying which
   platforms and which way round (方面). Each platform has a train each side.
   Get on one going your way and it's celebrated; the other way round, you're
   warned (it gets there, the long way). On the train, every announcement
   comes up in a box that stops everything until you've read it. At each
   station the doors open and you choose: get off, or stay on. Get off at the
   wrong station and the gates won't let you out: back up to the platform,
   and on again, either way round. Out at the right one, your ticket goes
   into the gate, and you're there — the same layout, under its own name.

   Every sign is one of the scene's words, and stays where it is: tap one to
   look closer. Everything else in Japanese can be tapped to hear it and see
   for a moment what it is. */

const stationSc = () => SCENE_BY.station;
const tripData = () => stationSc().walk;
const trip = { at: null, stage: "out", view: 0, slide: "", modal: null, step: "dest", dest: null, who: "adult", paid: 0, ticket: null, ride: null, msg: null, pop: null, fresh: false };
function stationThings() {
  const sc = stationSc();
  if (sc._things) return sc._things;
  sc._things = sc.items.map((_, i) => sc.all[i]).map(it => ({ id: "station" + it.i, i: it.i, name: it.w, kana: it.kana, en: it.m, price: 0 }));
  sc._by = Object.fromEntries(sc._things.map(t => [t.id, t]));
  return sc._things;
}

/* ---------- the loop ---------- */

const homeSt = () => tripData().home;
const LOOP = () => tripData().loop;
const hereSt = () => trip.at || homeSt().to;
const stEn = to => (LOOP().find(d => d.to === to) || {}).en || "";
const loopIdx = to => LOOP().findIndex(d => d.to === to);
const stepFrom = (to, dir, k = 1) => { const n = LOOP().length; return LOOP()[((loopIdx(to) + dir * k) % n + n) % n].to; };
const hopsTo = (a, b, dir) => { const n = LOOP().length; return ((loopIdx(b) - loopIdx(a)) * dir % n + n) % n; };
const bestDir = (a, b) => hopsTo(a, b, 1) <= hopsTo(a, b, -1) ? 1 : -1;
const fareTo = (a, b) => tripData().fares[Math.min(hopsTo(a, b, 1), hopsTo(a, b, -1))];
const fareFor = (to, who) => { const f = fareTo(hereSt(), to); return who === "child" ? Math.ceil(f / 2 / 10) * 10 : f; };
const others = () => LOOP().map(d => d.to).filter(to => to !== hereSt());
/* the trains here: each platform's, and the next two stations it goes to */
const trains = () => tripData().tracks.map(t => ({ ...t, toward: [stepFrom(hereSt(), t.dir), stepFrom(hereSt(), t.dir, 2)] }));
const trainAt = n => trains().find(t => t.track === n);
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
const snTerm = (markup, cls = "") => { const T = tripData().terms.find(x => x[0] === markup); return kbNameplate(markup, T ? T[1] : "", "sn-term " + cls); };
const snStation = (to, cls = "") => kbNameplate(to, stEn(to), "sn-term " + cls);
const snEki = (to, cls = "") => kbNameplate(to + "{駅|えき}", `${stEn(to)} Station`, "sn-term " + cls);
const snToward = t => `${t.toward.map(to => snStation(to)).join("<i>・</i>")}${snTerm("{方面|ほうめん}")}`;
const PLAT_TERM = { 1: "{一番線|いちばんせん}", 2: "{二番線|にばんせん}", 4: "{四番線|よんばんせん}" };
const snPlatName = n => n === 3 ? snAt("三番線") : `<div class="sn-sign printed platform"><b class="sn-num">${n}</b>${snTerm(PLAT_TERM[n])}</div>`;
const snSpeaker = (markup, en) => `<button class="sn-ann kb-signword" data-act="kb-gloss" data-say="${esc(furiKana(markup))}" data-en="${esc(en)}"><span class="sn-cone">${icon("speaker")}</span><span class="sn-ann-jp" lang="ja">${inkHtml(markup)}</span></button>`;

/* ---------- the views ---------- */

const SN_VIEWS = { out: ["street"], lobby: ["tix", "board", "gates"], paid: ["c12", "c34"], p12: ["t1", "t2"], p34: ["t3", "t4"], ride: ["ride"] };
const snView = () => SN_VIEWS[trip.stage][trip.view];
const SN_SEE = {
  street: ["入口", "東口"], tix: ["切符売り場"], board: ["出口", "西口", "北口", "南口", "各駅停車", "快速", "急行", "三番線"], gates: ["改札"],
  c12: ["出口"], c34: ["乗り換え", "出口"], t1: ["急行"], t2: ["各駅停車", "女性専用車"], t3: ["三番線", "快速", "女性専用車"], t4: ["各駅停車"], ride: [],
};
function snNav() {
  return {
    tix: { l: ["Up to the street", "out", 0], r: ["The departures board", "lobby", 1] },
    board: { l: ["Ticket machines", "lobby", 0], r: ["The gates", "lobby", 2] },
    gates: { l: ["The departures board", "lobby", 1] },
    c12: { l: ["Out through the gates", "exit", 0], r: ["Stairs to 3・4", "paid", 1] },
    c34: { l: ["Stairs to 1・2", "paid", 0] },
    t1: { r: ["Platform 2", "p12", 1] }, t2: { l: ["Platform 1", "p12", 0] },
    t3: { r: ["Platform 4", "p34", 1] }, t4: { l: ["Platform 3", "p34", 0] },
  }[snView()] || {};
}
const snNavHtml = () => { const n = snNav(); return ["l", "r"].map(s => n[s] ? `<button class="sn-nav ${s}" data-act="sn-nav" data-stage="${n[s][1]}" data-view="${n[s][2]}" data-dir="${s}" aria-label="${esc(n[s][0])}" title="${esc(n[s][0])}">
  <span class="sn-nav-ico">${icon(s === "l" ? "back" : "chevron")}</span></button>` : "").join(""); };

/* Stairs, as a camera sees them. Everything is placed in metres (x across,
   y up, z straight ahead, the eye 1.6 m up and a little left of centre, as
   if you're keeping left) and projected, so the treads, the tiled walls,
   the ceiling and its lights, and the rails all close in on one vanishing
   point.
   Down from the street: you stand at the top, by the yellow warning blocks,
   and see the treads drop away, darker as they go, to a lit landing.
   Up to the platforms: you stand at the foot and see the risers climb, each
   with its edge, to the light of the platform. Rails on both walls at two
   heights, and one down the middle, as at a Japanese station. */
function stairsSvg(dir) {
  const up = dir === "up";
  const V = up
    ? { W: 260, tall: 290 / 260, fov: 94, mid: .45, pitch: 0, hw: 1.3, z0: 1.9, n: 24, top: 2.7, head: 2.7, land: 2.4 }
    : { W: 300, tall: 1, fov: 75, mid: .42, pitch: .5, hw: 1.2, z0: 1.0, n: 15, top: 2.4, head: 2.5, land: 2.6 };
  const EYE = 1.6, EX = -.35, RUN = .3, RISE = up ? .17 : -.17;
  /* the camera: level going up; tipped to look down the stairs going down */
  const cs = Math.cos(V.pitch), sn = Math.sin(V.pitch);
  const cam = (y, z) => { const d = y - EYE; return [d * cs + z * sn, z * cs - d * sn]; };
  const f = V.W / 2 / Math.tan(V.fov * Math.PI / 360), H = V.W * V.tall, cx = V.W / 2, cy = H * V.mid;
  const zEnd = V.z0 + V.n * RUN, yEnd = V.n * RISE, zBack = zEnd + V.land;
  /* the line of the steps, and the ceiling over it */
  const line = z => z <= V.z0 ? 0 : z >= zEnd ? yEnd : (z - V.z0) / RUN * RISE;
  const ceil = z => up ? Math.max(V.top, line(z) + V.head) : Math.min(V.top, line(z) + V.head);
  const zc = V.z0 + (V.top - V.head) / RISE * RUN;
  /* projecting */
  const P = (x, y, z) => { const [a, b] = cam(y, z); return [cx + f * (x - EX) / b, cy - f * a / b]; };
  const pt = ([x, y, z]) => P(x, y, z).map(n => n.toFixed(1)).join(",");
  const poly = (pts, fill, more = "") => `<polygon points="${pts.map(pt).join(" ")}" fill="${fill}"${more}/>`;
  const seg = (a, b, stroke, w) => { const [x1, y1] = P(...a), [x2, y2] = P(...b); return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${stroke}" stroke-width="${w}"/>`; };
  /* light: darker as it goes down into the ground, brighter as it climbs to the platform */
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const FOG = rgb(up ? "#FFFFFF" : "#2B3035"), K = up ? .5 : .62;
  const tint = (c, z) => { const t = Math.min(1, Math.max(0, (z - V.z0 + .5) / (zEnd - V.z0 + .5))) * K; return `rgb(${rgb(c).map((v, i) => Math.round(v + (FOG[i] - v) * t)).join(",")})`; };
  /* depths to cut the walls and ceiling at: every quarter metre, and every corner */
  /* the nearest anything is drawn: never behind the eye, whatever the tilt */
  const zn = Math.max(.3, (.3 + (Math.max(V.top, yEnd + V.head) - EYE) * Math.max(0, sn)) / cs, (.3 - EYE * Math.max(0, -sn)) / cs);
  const zs = [...new Set([...Array(Math.ceil((zBack - zn) / .25)).keys()].map(k => zn + k * .25).concat([V.z0, zc, zEnd, zBack]).filter(z => z >= zn && z <= zBack).map(z => +z.toFixed(3)))].sort((a, b) => a - b);
  /* the floor and the lower walls can come right to your feet */
  const zl = .12, zsLow = [...[...Array(Math.ceil((zn - zl) / .25)).keys()].map(k => +(zl + k * .25).toFixed(3)), ...zs];
  const C = up
    ? { back: "#FFFFFF", landing: "#E4E4DE", ceil: "#DCE0E1", wall: "#E8E4DA", dado: "#AEB6B9", skirt: "#7B8388", tread: "#DADAD4", riser: "#B3B8B7", floor: "#C9CBC6" }
    : { back: "#F4E6C6", landing: "#D8CDB6", ceil: "#E2E4E2", wall: "#E8E4DA", dado: "#AFB6B8", skirt: "#7B8388", tread: "#D2D0C8", riser: "#A9ADAC", floor: "#C9C6BE" };
  let out = "";

  /* the far end: the platform's light up there, a lit landing and a sign down there */
  out += poly([[-V.hw, yEnd, zBack], [V.hw, yEnd, zBack], [V.hw, ceil(zBack), zBack], [-V.hw, ceil(zBack), zBack]], C.back);
  if (up) out += poly([[-.55, yEnd + 2.25, zBack - .2], [.55, yEnd + 2.25, zBack - .2], [.55, yEnd + 2.5, zBack - .2], [-.55, yEnd + 2.5, zBack - .2]], "#FFFFFF", ` stroke="#9AA1A7" stroke-width=".6"`)
    + poly([[-.55, yEnd + 2.25, zBack - .2], [.55, yEnd + 2.25, zBack - .2], [.55, yEnd + 2.3, zBack - .2], [-.55, yEnd + 2.3, zBack - .2]], "#3E9A4A");
  else out += poly([[-.7, yEnd + 1.65, zBack - .01], [.7, yEnd + 1.65, zBack - .01], [.7, yEnd + 2.0, zBack - .01], [-.7, yEnd + 2.0, zBack - .01]], "#1F3B66")
    + poly([[-.45, yEnd + 1.78, zBack - .02], [.3, yEnd + 1.78, zBack - .02], [.3, yEnd + 1.86, zBack - .02], [-.45, yEnd + 1.86, zBack - .02]], "#FFFFFF")
    + poly([[-V.hw, yEnd, zEnd], [V.hw, yEnd, zEnd], [V.hw, yEnd, zBack], [-V.hw, yEnd, zBack]], C.landing)
    + poly([[-V.hw + .1, yEnd, zEnd + .3], [V.hw - .1, yEnd, zEnd + .3], [V.hw - .1, yEnd, zEnd + .6], [-V.hw + .1, yEnd, zEnd + .6]], "#D9B43C");

  /* the ceiling, a slice at a time, with its lights */
  for (let k = 0; k < zs.length - 1; k++) {
    const a = zs[k], b = zs[k + 1];
    out += poly([[-V.hw, ceil(a), a], [V.hw, ceil(a), a], [V.hw, ceil(b), b], [-V.hw, ceil(b), b]], tint(C.ceil, a), ` stroke="${tint(C.ceil, a)}" stroke-width=".5"`);
  }
  for (let z = V.z0 + .5; z < zBack - .3; z += 1.4) {
    const b = z + .2;
    out += poly([[-.75, ceil(z) - .01, z - .12], [.75, ceil(z) - .01, z - .12], [.75, ceil(b) - .01, b + .12], [-.75, ceil(b) - .01, b + .12]], "#FFFFFF", ` opacity=".35"`)
      + poly([[-.5, ceil(z) - .02, z], [.5, ceil(z) - .02, z], [.5, ceil(b) - .02, b], [-.5, ceil(b) - .02, b]], "#FFFFFF");
  }

  /* the walls: tiles above, a darker band below with a skirting along the steps */
  const clips = [];
  for (const s of [-1, 1]) {
    const x = s * V.hw, id = `sv-${dir}-w${s < 0 ? "l" : "r"}`;
    clips.push(`<clipPath id="${id}"><polygon points="${[...zsLow.map(z => [x, line(z) - .4, z]), ...zs.slice().reverse().map(z => [x, ceil(z), z]), [x, 1.05, zl]].map(pt).join(" ")}"/></clipPath>`);
    for (let k = 0; k < zsLow.length - 1; k++) {
      const a = zsLow[k], b = zsLow[k + 1], q = (y1, y2) => [[x, y1(a), a], [x, y1(b), b], [x, y2(b), b], [x, y2(a), a]];
      if (a >= zn) out += poly(q(z => line(z) + 1.05, ceil), tint(s < 0 ? C.wall : "#DEDAD0", a), ` stroke="${tint(s < 0 ? C.wall : "#DEDAD0", a)}" stroke-width=".5"`);
      out += poly(q(z => line(z) + .12, z => line(z) + 1.05), tint(C.dado, a), ` stroke="${tint(C.dado, a)}" stroke-width=".5"`)
        + poly(q(z => line(z) - .4, z => line(z) + .12), tint(C.skirt, a), ` stroke="${tint(C.skirt, a)}" stroke-width=".5"`);
    }
    let g = "";
    for (let y = Math.min(0, yEnd) - .5; y < Math.max(V.top, yEnd + V.head) + .5; y += .2) g += seg([x, y, Math.max(zl, (.3 + (y - EYE) * sn) / cs)], [x, y, zBack], "rgba(0,0,0,.09)", ".5");
    for (let z = zn; z < zBack; z += .3) g += seg([x, -6, z], [x, 9, z], "rgba(0,0,0,.07)", ".5");
    out += `<g clip-path="url(#${id})">${g}</g>`;
  }

  /* the steps, the furthest first so the nearer ones cover them */
  for (let i = V.n - 1; i >= 0; i--) {
    const a = V.z0 + i * RUN, b = a + RUN, y = (i + 1) * RISE, w = V.hw;
    if (up) {
      if (y < EYE) out += poly([[-w, y, a], [w, y, a], [w, y, b], [-w, y, b]], tint(C.tread, a));
      out += poly([[-w, y - RISE, a], [w, y - RISE, a], [w, y, a], [-w, y, a]], tint(C.riser, a))
        + poly([[-w, y - .035, a], [w, y - .035, a], [w, y, a], [-w, y, a]], tint("#4A5055", a))
        + (y < EYE ? poly([[-w, y, a], [w, y, a], [w, y, a + .04], [-w, y, a + .04]], tint("#D9B43C", a)) : "");
    } else {
      out += poly([[-w, y, a], [w, y, a], [w, y, b], [-w, y, b]], tint(C.tread, a))
        + poly([[-w, y, b - .05], [w, y, b - .05], [w, y, b], [-w, y, b]], tint("#4A5055", a))
        + poly([[-w, y, b - .015], [w, y, b - .015], [w, y, b], [-w, y, b]], tint("#D9B43C", a));
    }
  }

  /* where you stand: the floor, and the yellow warning blocks before the first step */
  const t0 = up ? V.z0 - .6 : V.z0 - .35, t1 = up ? V.z0 - .3 : V.z0 - .05;
  out += poly([[-V.hw, 0, zl], [V.hw, 0, zl], [V.hw, 0, V.z0], [-V.hw, 0, V.z0]], C.floor)
    + poly([[-V.hw + .08, 0, t0], [V.hw - .08, 0, t0], [V.hw - .08, 0, t1], [-V.hw + .08, 0, t1]], "#E8BE2E");
  if (!up) out += poly([[-V.hw, 0, V.z0 - .05], [V.hw, 0, V.z0 - .05], [V.hw, 0, V.z0], [-V.hw, 0, V.z0]], "#4A5055");
  for (let z = t0 + .05; z < t1 - .02; z += .075)
    for (let x = -V.hw + .14; x < V.hw - .1; x += .075)
      { const [ex, ey] = P(x, 0, z), r = f * .012 / cam(0, z)[1]; out += `<ellipse cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" rx="${r.toFixed(2)}" ry="${(r * .55).toFixed(2)}" fill="#C99E1E"/>`; }

  /* the rails: a tube on each wall at two heights, and one down the middle on its posts */
  const base = z => z <= V.z0 ? 0 : up ? Math.min(yEnd, line(z) + RISE) : line(z);
  const rz = [Math.max(zn, V.z0 - 1.2), V.z0 - .2, V.z0 + .1, zEnd - (up ? .2 : -.1), zEnd + .4];
  const tube = (x, h, r, from = rz) => {
    const p = from.map(z => [x, base(z) + h, z]);
    return poly([...p.map(([x, y, z]) => [x, y + r, z]), ...p.slice().reverse().map(([x, y, z]) => [x, y - r, z])], "#9EA6AC")
      + `<polyline points="${p.map(([x, y, z]) => pt([x, y + r * .45, z])).join(" ")}" fill="none" stroke="#F4F6F7" stroke-width=".9" opacity=".9"/>`;
  };
  for (const s of [-1, 1]) {
    const x = s * (V.hw - .08);
    for (let z = V.z0 + .2; z < zEnd; z += 1.1) out += seg([x, base(z) + .82, z], [s * V.hw, base(z) + .82, z], "#7D858C", Math.max(.6, f * .02 / z).toFixed(2));
    out += tube(x, .85, .025) + tube(x, .65, .02);
  }
  for (let z = V.z0 + .15; z < zEnd; z += 1.5)
    out += poly([[-.022, base(z), z], [.022, base(z), z], [.022, base(z) + .85, z], [-.022, base(z) + .85, z]], "#8E969C");
  out += tube(0, .85, .025, [V.z0 + .15, V.z0 + .3, zEnd - .1]);

  /* the light at the far end, spilling */
  const [gx, gy] = P(0, (yEnd + ceil(zBack)) / 2, zBack);
  const glow = `<radialGradient id="sv-${dir}-glow" cx="${(gx / V.W).toFixed(3)}" cy="${(gy / H).toFixed(3)}" r="${up ? .5 : .32}"><stop offset="0" stop-color="${up ? "#FFFFFF" : "#FFE6A8"}" stop-opacity="${up ? .85 : .45}"/><stop offset="1" stop-color="${up ? "#FFFFFF" : "#FFE6A8"}" stop-opacity="0"/></radialGradient>`;
  const shade = up ? "" : `<linearGradient id="sv-down-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".45" stop-color="#000" stop-opacity="0"/></linearGradient>`;
  out += `<rect width="${V.W}" height="${H.toFixed(1)}" fill="url(#sv-${dir}-glow)"/>` + (up ? "" : `<rect width="${V.W}" height="${H.toFixed(1)}" fill="url(#sv-down-shade)"/>`);

  return `<svg class="sv-stairs-svg ${dir}" viewBox="0 0 ${V.W} ${H.toFixed(1)}" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs>${clips.join("")}${glow}${shade}</defs>${out}</svg>`;
}

/* the route map: the loop, where you are, the fare to each */
const mapLines = () => `<svg viewBox="0 0 100 40" class="sv-map-mini" aria-hidden="true"><ellipse cx="50" cy="20" rx="40" ry="14" fill="none" stroke="#3E9A4A" stroke-width="5"/>${[[50, 6], [88, 16], [74, 32], [26, 32], [12, 16]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#fff" stroke="#1E1D1A" stroke-width="1.4"/>`).join("")}</svg>`;
function snMapWin() {
  const L = LOOP(), here = hereSt(), n = L.length;
  return `<div class="sn-map"><div class="sn-map-head">${snTerm("{路線図|ろせんず}")}<small>Tap a station to hear it</small></div>
    <div class="sn-ring">${L.map((d, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n, x = 50 + 40 * Math.cos(a), y = 50 + 38 * Math.sin(a);
      return `<div class="sn-map-st ${d.to === here ? "here" : ""}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%"><i></i>${d.to === here ? `<span class="sn-map-you">${snTerm("{現在地|げんざいち}")}</span>` : ""}${snStation(d.to, "sn-map-name")}<small>${d.to === here ? "" : "¥" + fareTo(here, d.to)}</small></div>`; }).join("")}
      <span class="sn-ring-note">${snTerm("{三|さん}・{四番線|よんばんせん}")} ↻ &nbsp; ${snTerm("{一|いち}・{二番線|にばんせん}")} ↺</span></div>
    <p class="muted tiny">A loop: platforms 3・4 go round one way, 1・2 the other. Fares are from here, for an adult.</p></div>`;
}

/* the street */
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
  const rows = [...trains()].sort((a, b) => a.time.localeCompare(b.time));
  return `<div class="sv sv-lobby sv-board">
    <div class="sn-ceiling-lights"><i></i><i></i><i></i></div>
    <div class="sv-exits">
      <div class="sv-exit l">${snAt("西口", "hang")}</div>
      <div class="sv-exit c">${snAt("出口", "hang")}${snAt("北口")}</div>
      <div class="sv-exit r">${snAt("南口", "hang")}</div>
    </div>
    <div class="sv-dboard">
      <div class="sv-db-title">${snTerm("{発車|はっしゃ}")}<span class="sv-db-clock">10:20</span></div>
      <div class="sv-db-head">${snTerm("{時刻|じこく}")}${snTerm("{種別|しゅべつ}")}${snTerm("{方面|ほうめん}")}${snTerm("{番線|ばんせん}")}</div>
      ${rows.map(t => { const k = snBy(furiPlain(t.kind)); return `<div class="sv-db-row"><b>${t.time}</b><span>${kbProd(k, snPack(k))}</span><span class="sv-db-to">${snToward(t)}</span><span class="sv-db-n">${t.track === 3 ? snAt("三番線", "tiny") : snTerm(PLAT_TERM[t.track])}</span></div>`; }).join("")}
    </div></div>`;
}
const snGates = () => `<div class="sv sv-lobby sv-gates">
  <div class="sn-ceiling-lights"><i></i><i></i><i></i></div>
  <div class="sv-wallsign">${snAt("改札", "hang")}</div>
  <div class="sv-gaterow"><div class="sv-office"><i></i></div>
    <button class="sv-gatebank" data-act="sn-gate" aria-label="Go through the gates">${[0, 1, 2, 3, 4].map(k => `<span class="sv-gate"><i class="sv-ic"></i><b class="${k === 2 ? "no" : "go"}"></b><u></u></span>`).join("")}</button></div>
  <p class="sn-hint dark">${trip.ticket ? "Tap the gates to go through." : "You'll need a ticket for the gates."}</p></div>`;

/* the paid side: two flights of stairs */
function snStairs(pair) {
  const t = trains().find(x => pairOf(x.track) === pair);
  return `<div class="sv sv-paid">
    <div class="sn-ceiling-lights"><i></i><i></i><i></i></div>
    <div class="sv-paid-signs">
      <div class="sv-backexit">${snAt("出口", "hang")}<span class="sn-arrow dark">←</span></div>
      <div class="sv-dirsign"><span class="sv-dir-pl">${snTerm(pair === "p12" ? "{一|いち}・{二番線|にばんせん}" : "{三|さん}・{四番線|よんばんせん}")}</span>
        <span class="sv-dir-to">${snToward(t)}</span><span class="sn-arrow">↑</span></div>
      <div class="sv-transfer">${pair === "p34" ? snAt("乗り換え", "hang") : ""}</div>
    </div>
    <div class="sv-stairhall">
      <button class="sv-up" data-act="sn-nav" data-stage="${pair}" data-view="0" data-dir="u" aria-label="Up the stairs to the platforms">${stairsSvg("up")}</button>
      <div class="sn-speakers"><div class="sn-speaker-head">${icon("speaker")} Announcements</div>${tripData().ann.map(([w, en]) => snSpeaker(w, en)).join("")}</div>
    </div>
    <p class="sn-hint dark">Tap the stairs to go up to the platforms.</p></div>`;
}

/* a platform: one track a view */
function snTrack(n) {
  const t = trainAt(n), k = snBy(furiPlain(t.kind)), sc = stationSc();
  const voice = sc.all.slice(sc.items.length).filter((_, i) => i !== 0 || n === 3);
  const women = SN_SEE["t" + n].includes("女性専用車");
  return `<div class="sv sv-plat">
    <div class="sv-canopy-in"><i></i><i></i><i></i></div>
    <div class="sv-ekimei"><span>← ${snStation(stepFrom(hereSt(), -1))}</span>${kbNameplate(hereSt(), stEn(hereSt()), "sv-ek-name")}<span>${snStation(stepFrom(hereSt(), 1))} →</span></div>
    <div class="sv-platrow">
      <div class="sv-platsign">${snPlatName(n)}</div>
      <div class="sv-train">
        <div class="sv-led">${kbProd(k, snPack(k))}<span class="sv-led-to">${snToward(t)}</span></div>
        <div class="sv-car"><i class="sv-win"></i>
          <button class="sv-tdoor" data-act="sn-board-ask" data-track="${n}" aria-label="Get on"><i></i><i></i></button>
          <i class="sv-win"></i>
          <button class="sv-tdoor" data-act="sn-board-ask" data-track="${n}" aria-label="Get on"><i></i><i></i></button><i class="sv-win"></i>
          ${women ? `<div class="sv-women">${snAt("女性専用車", "hang")}</div>` : ""}</div>
      </div>
    </div>
    <div class="sv-edge"><i class="${women ? "pink" : ""}"></i></div>
    <div class="sn-speakers sv-anns"><div class="sn-speaker-head">${icon("speaker")} Announcements</div>${voice.map(it => kbSign(sc, it.w, "sn-ann", `<span class="sn-cone">${icon("speaker")}</span><span class="sn-ann-jp">${inkHtml(it.w)}</span>`)).join("")}</div>
    <button class="btn btn-ghost btn-sm sv-downbtn" data-act="sn-nav" data-stage="paid" data-view="${pairOf(n) === "p12" ? 0 : 1}" data-dir="d">↓ Back down the stairs</button></div>`;
}

/* ---------- the train ---------- */

/* The ads: posters with pictures. Three a ride, picked at random. */
const AD_ART = {
  chat: `<svg viewBox="0 0 80 56"><rect width="80" height="56" fill="#DDEBFA"/><circle cx="56" cy="34" r="16" fill="#7FB5E6"/><path d="M44 30 q12 -8 24 0 M44 38 q12 8 24 0 M56 18 V50" stroke="#fff" stroke-width="1.6" fill="none"/>
    <path d="M6 8 H38 V26 H18 L10 33 V26 H6Z" fill="#fff"/><text x="22" y="20" font-size="9" font-weight="700" fill="#2F6FC4" text-anchor="middle" font-family="sans-serif">Hello!</text>
    <path d="M30 34 H46 V46 H40 L36 51 V46 H30Z" fill="#FFE14D"/></svg>`,
  can: `<svg viewBox="0 0 80 56"><rect width="80" height="56" fill="#D9F2DE"/><path d="M14 14 H34 L31 50 H17Z" fill="#fff" opacity=".7"/><path d="M15.5 26 H32.5 L31 50 H17Z" fill="#5CC46E"/><circle cx="24" cy="18" r="7" fill="#FFF8EC"/><circle cx="27" cy="12" r="3" fill="#E2283C"/>
    ${[[20, 40], [26, 34], [22, 30], [28, 44]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="#fff"/>`).join("")}
    <rect x="46" y="12" width="20" height="38" rx="4" fill="#2F9E4A"/><rect x="46" y="22" width="20" height="14" fill="#fff"/><path d="M50 29 h12" stroke="#2F9E4A" stroke-width="3"/><rect x="48" y="9" width="16" height="4" rx="2" fill="#C9CED2"/></svg>`,
  onsen: `<svg viewBox="0 0 80 56"><rect width="80" height="56" fill="#2C3E5C"/><circle cx="62" cy="12" r="6" fill="#FFF4CF"/><path d="M0 34 L18 18 L30 28 L44 14 L62 30 L80 22 V56 H0Z" fill="#1E2C44"/>
    <ellipse cx="40" cy="44" rx="30" ry="9" fill="#7FB5E6"/><ellipse cx="40" cy="44" rx="30" ry="9" fill="none" stroke="#8C8478" stroke-width="4" stroke-dasharray="6 3"/>
    <path d="M28 36 q-4 -6 0 -11 q4 -5 0 -10 M40 34 q-4 -6 0 -11 q4 -5 0 -10 M52 36 q-4 -6 0 -11 q4 -5 0 -10" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/></svg>`,
  bowl: `<svg viewBox="0 0 80 56"><rect width="80" height="56" fill="#F7E3C8"/><path d="M8 26 H72 Q70 52 40 52 Q10 52 8 26Z" fill="#C8323A"/><path d="M12 26 H68 Q66 34 40 34 Q14 34 12 26Z" fill="#E9B56A"/>
    <circle cx="30" cy="28" r="5" fill="#fff"/><circle cx="30" cy="28" r="2.5" fill="#F2B33C"/><rect x="42" y="24" width="12" height="7" rx="2" fill="#B07A4E"/><circle cx="58" cy="28" r="3.5" fill="#fff" stroke="#E46A7A" stroke-width="1.2"/>
    <path d="M18 27 q4 -3 8 0 t8 0" stroke="#F3D9A2" stroke-width="1.5" fill="none"/><path d="M50 6 L64 26 M56 4 L68 24" stroke="#8C6239" stroke-width="2.5"/>
    <path d="M26 20 q-3 -5 0 -9 M36 18 q-3 -5 0 -9" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/></svg>`,
  cross: `<svg viewBox="0 0 80 56"><rect width="80" height="56" fill="#E1F3F1"/><path d="M10 24 H50 L46 50 H14Z" fill="#E2554B"/><path d="M14 24 q16 -16 32 0" stroke="#B8302F" stroke-width="3" fill="none"/>
    ${[["#F2B33C", 16], ["#5FA7D8", 26], ["#7FB15A", 36]].map(([c, x]) => `<rect x="${x}" y="14" width="8" height="12" rx="1" fill="${c}"/>`).join("")}
    <circle cx="62" cy="28" r="14" fill="#F2C94C" stroke="#C9A24A" stroke-width="2"/><text x="62" y="33" font-size="13" font-weight="800" fill="#8E5A10" text-anchor="middle" font-family="sans-serif">×2</text></svg>`,
  mountain: `<svg viewBox="0 0 80 56"><rect width="80" height="56" fill="#9FD0F0"/><path d="M0 34 L22 10 L36 24 L50 12 L80 34Z" fill="#6B8CA8"/><path d="M18 14 L22 10 L26 14 L24 16Z M46 16 L50 12 L54 16Z" fill="#fff"/>
    ${[0, 1, 2, 3, 4].map(i => `<path d="M0 ${38 + i * 4} H80" stroke="${i % 2 ? "#B48CD6" : "#8E5FC0"}" stroke-width="4"/>`).join("")}<rect y="54" width="80" height="2" fill="#5E8C4F"/></svg>`,
  cat: `<svg viewBox="0 0 80 56"><rect width="80" height="56" fill="#1A1C24"/><circle cx="60" cy="14" r="8" fill="#FFF4CF"/><rect y="40" width="80" height="16" fill="#3A3E44"/><path d="M0 40 H80" stroke="#F7D046" stroke-width="2"/>
    <path d="M24 40 Q22 26 27 20 L29 24 Q32 22 35 24 L37 20 Q42 26 40 40Z" fill="#FBF8F0"/><path d="M40 36 q10 0 8 -10" stroke="#FBF8F0" stroke-width="3" fill="none"/>
    ${[6, 16, 66, 74].map(x => `<rect x="${x}" y="2" width="4" height="4" fill="#F2F2F2" opacity=".5"/><rect x="${x}" y="50" width="4" height="4" fill="#F2F2F2" opacity=".5"/>`).join("")}</svg>`,
  truck: `<svg viewBox="0 0 80 56"><rect width="80" height="56" fill="#FFF3D2"/><rect x="6" y="18" width="40" height="24" fill="#fff" stroke="#E9B43B" stroke-width="2"/><path d="M46 24 H60 L70 34 V42 H46Z" fill="#E9B43B"/><rect x="52" y="27" width="8" height="6" fill="#DDEBFA"/>
    <circle cx="16" cy="44" r="5" fill="#2A2E33"/><circle cx="58" cy="44" r="5" fill="#2A2E33"/><path d="M16 26 l3 4 l-3 4 l-3 -4Z M22 30 h12" fill="#F28AB2" stroke="#F28AB2"/>
    <rect x="56" y="8" width="10" height="8" fill="#C98B3E"/><rect x="66" y="10" width="8" height="6" fill="#B07A4E"/></svg>`,
};
const adHtml = (a, cls) => `<button class="sv-ad kb-signword ${cls}" style="--ad:${a.bg}" data-act="kb-gloss" data-say="${esc(furiKana(a.head) + "、" + furiKana(a.sub))}" data-en="${esc(a.en)}">
  <span class="sv-ad-art">${AD_ART[a.art] || ""}</span><span class="sv-ad-text"><span class="sv-ad-head" lang="ja">${inkHtml(a.head)}</span><span class="sv-ad-sub" lang="ja">${inkHtml(a.sub)}</span></span></button>`;

/* The carriage. The outside (a platform, the tunnel, the next platform) is one
   scene behind the whole wall, seen through its windows and its door, so they
   always agree. In front: the wall itself (an ad above the windows, the
   window frames, the door with its screen), the long seat with its padding
   and its priority end, the poles, the straps, the ads hanging overhead. */
function snRide() {
  const r = trip.ride, ads = r.ads.map(i => tripData().ads[i]);
  const lcd = r.phase === "slowing" || r.phase === "there"
    ? kbNameplate("まもなく、" + r.next + "です。", `Arriving: ${stEn(r.next)}`, "sv-lcd-t")
    : kbNameplate("{次|つぎ}は、" + r.next + "です。", `Next: ${stEn(r.next)}`, "sv-lcd-t");
  const mine = trip.ticket && r.next === trip.ticket.to;
  return `<div class="sv sv-ride ${r.phase} ${r.done ? "done" : ""} ${r.pop ? "paused" : ""}">
    <div class="sv-ceil"><i></i><i></i><i></i></div>
    <div class="sv-carwall">
      <div class="sv-outside"><b class="sv-tunnel"></b>
        <b class="sv-pform from">${kbNameplate(r.at, stEn(r.at), "sv-pf-name")}<i class="sv-pf-people"></i></b>
        <b class="sv-pform to">${kbNameplate(r.next, stEn(r.next), "sv-pf-name")}<i class="sv-pf-people"></i></b></div>
      <div class="sv-wallface">
        <div class="sv-band top">${adHtml(ads[2], "top")}<div class="sv-lcd">${lcd}</div></div>
        <div class="sv-row"><i class="sv-pier"></i><i class="sv-glass"></i><i class="sv-pier"></i><i class="sv-glass"></i><i class="sv-pier"></i>
          <div class="sv-dooropen"><i class="sv-leaf l"><b></b><u></u></i><i class="sv-leaf r"><b></b><u></u></i><i class="sv-chime"></i></div><i class="sv-pier end"></i></div>
        <div class="sv-band low"></div>
      </div>
      <div class="sv-seat"><div class="sv-seatback"></div><div class="sv-cushion">${[0, 1, 2, 3, 4, 5, 6].map(i => `<i class="${i > 4 ? "yu" : ""}"></i>`).join("")}</div><div class="sv-seatbase"><i></i><i></i></div>
        <div class="sv-partition"></div><div class="sv-yusen">${snTerm("{優先席|ゆうせんせき}")}</div></div>
      <i class="sv-stanchion" style="left:34%"></i><i class="sv-stanchion" style="left:58%"></i>
    </div>
    <div class="sv-hangads">${adHtml(ads[0], "hang")}${adHtml(ads[1], "hang")}</div>
    <div class="sv-straps">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<i style="--i:${i}"></i>`).join("")}</div>
    <div class="sv-carfloor"></div>
    ${r.pop ? `<div class="sv-annpop"><div class="sv-annpop-box"><span class="sv-annpop-ico">${icon("speaker")}</span>
        <div class="sv-annpop-jp" lang="ja">${kbNameplate(r.pop[0], r.pop[1], "sv-annpop-t")}</div><p>${esc(r.pop[1])}</p>
        <div class="kb-row"><button class="btn btn-ghost btn-sm" data-act="say" data-say="${esc(furiKana(r.pop[0]))}">${icon("speaker")} Again</button><button class="btn btn-sm" data-act="sn-pop-ok">OK</button></div></div></div>` : ""}
    <div class="sv-ctl">${r.phase === "board" ? `<span class="sv-riding">You're on the train.</span><button class="btn kb-main" data-act="sn-sit">Take a seat</button>`
      : r.phase === "there" ? `<span class="sv-riding ${mine ? "mine" : ""}">${mine ? "This is your stop!" : `Your ticket is for <span lang="ja">${inkHtml(trip.ticket.to)}</span>.`}</span>
        <button class="btn btn-ghost" data-act="sn-stay">Stay on</button><button class="btn kb-main" data-act="sn-off">Get off at <span lang="ja">${inkHtml(r.next)}</span></button>`
      : `<span class="sv-riding">${r.phase === "slowing" ? "Slowing down…" : "On the way…"}</span>`}</div></div>`;
}

/* ---------- the windows: the machine, the ticket, a note ---------- */

function snMachine() {
  const step = trip.step, to = trip.dest, fare = to ? fareFor(to, trip.who) : 0;
  let screen;
  if (step === "dest") screen = `<div class="sn-scr-head">${snTerm("きっぷ")}${snTerm("{運賃|うんちん}")}</div>
    <div class="sn-routemap"><span class="sn-here">${snStation(hereSt())}</span>${others().map(x => `<button class="sn-fare" data-act="sn-dest" data-to="${esc(x)}"><span lang="ja">${inkHtml(x)}</span><b>¥${fareTo(hereSt(), x)}</b></button>`).join("")}</div>
    <p class="sn-scr-note">Where are you going? Tap a station.</p>`;
  else if (step === "who") screen = `<div class="sn-scr-head">${snStation(to)}<b>¥${fareFor(to, "adult")}</b></div>
    <div class="sn-who">${snTerm("{大人|おとな}")}<button class="sn-big" data-act="sn-who" data-who="adult">¥${fareFor(to, "adult")}</button>${snTerm("{子供|こども}")}<button class="sn-big" data-act="sn-who" data-who="child">¥${fareFor(to, "child")}</button></div>
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
/* an announcement on a platform: the same box, nothing to pause */
const snPlatPop = () => trip.pop ? `<div class="sv-annpop"><div class="sv-annpop-box"><span class="sv-annpop-ico">${icon("speaker")}</span>
  <div class="sv-annpop-jp" lang="ja">${kbNameplate(trip.pop[0], trip.pop[1], "sv-annpop-t")}</div><p>${esc(trip.pop[1])}</p>
  <div class="kb-row"><button class="btn btn-ghost btn-sm" data-act="say" data-say="${esc(furiKana(trip.pop[0]))}">${icon("speaker")} Again</button><button class="btn btn-sm" data-act="sn-pop-ok">OK</button></div></div></div>` : "";

/* ---------- drawn ---------- */

function snScene() {
  const v = snView();
  return v === "street" ? snStreet() : v === "tix" ? snTix() : v === "board" ? snBoardView() : v === "gates" ? snGates()
    : v === "c12" ? snStairs("p12") : v === "c34" ? snStairs("p34") : v === "ride" ? snRide() : snTrack(+v.slice(1));
}
const stationView = () => `<div class="kb-store sn-station at-${trip.stage} v-${snView()}">
  <div class="sn-stage ${trip.slide}">${snScene()}</div>
  ${snNavHtml()}${snTicketChip()}${snPlatPop()}${snWin()}</div>`;

WALKS.station = {
  id: "station", eyebrow: "駅", title: "At the station", bundle: "scenes", stays: true,
  lede: "Down the stairs, buy a ticket, through the gates, up to the platform, onto the right train, and off at the right stop. Read the signs on the way: tap one to look closer.",
  enter() { Object.assign(trip, { at: null, stage: "out", view: 0, slide: "", modal: null, step: "dest", dest: null, who: "adult", paid: 0, ticket: null, ride: null, msg: null, pop: null, fresh: false }); },
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
    browse: "Go down, buy a ticket, and get where it says. Tap any sign on the way to look closer; tap any other Japanese to hear it.",
    dot: "under a sign: you can read it", basket: "That's the one", list: "Find the signs that say",
    find: "Find each one from where you're standing.", foundTitle: "Found them all", later: "", score: "recognised",
  },
};

/* ---------- going about it ---------- */

function snGo(stage, view, dir) {
  trip.slide = { l: "from-l", r: "from-r", u: "rise", d: "sink" }[dir] || "";
  trip.stage = stage; trip.view = view; trip.modal = null; trip.pop = null;
  kbReset();
  if (kb.mode === "errand" && (!kb.errand || !(kb.errand.got || []).length)) kbNewErrand(WALKS.station);
  if (stage === "p34" && view === 0 && dir === "u") { const it = stationSc().all[stationSc().items.length]; trip.pop = [it.w, it.m]; say(it.kana); }   /* まもなく、三番線に… */
  kbDraw();
  trip.slide = "";
}
const snNote = (html, kind = "msg") => { trip.modal = kind; trip.msg = html; kbDraw(); };
const snCheer = (title, line, buttons, word) => `<div class="sn-found"><div class="sn-found-art">${hanamaru("sn-maru")}${neko("cheer", "sn-found-cat")}${stamp(word)}</div>
  <h3>${title}</h3><p>${line}</p><div class="kb-row">${buttons}</div></div>`;

/* The ride, a stop at a time: a list of steps, each an announcement (which
   waits, everything paused, until you've read it) or a stretch of the ride
   (which runs, then goes on to the next step). */
function rideLeg(first) {
  const r = trip.ride, ob = tripData().onboard;
  r.queue = [
    { pop: ["ドアが{閉|し}まります。ご{注意|ちゅうい}ください。", "The doors are closing. Please be careful."] },
    { phase: "leaving", wait: 2600 },
    ...(first ? [{ pop: ob[0] }] : []),
    { phase: "moving", wait: 1400 },
    { pop: ["{次|つぎ}は、" + r.next + "です。", `The next stop is ${stEn(r.next)}.`] },
    { phase: "moving", wait: 1800 },
    { pop: ["まもなく、" + r.next + "です。", `We'll soon be at ${stEn(r.next)}.`] },
    { phase: "slowing", wait: 3600 },
    { pop: ob[2] },
    { phase: "there" },
  ];
  rideStep();
}
function rideStep() {
  const r = trip.ride;
  if (!r || trip.stage !== "ride" || r.pop) return;
  const s = r.queue.shift();
  if (!s) return;
  if (s.pop) { r.pop = s.pop; kbDraw(); say(furiKana(s.pop[0])); return; }
  r.phase = s.phase; r.done = false; kbDraw();
  if (s.wait) setTimeout(() => { if (trip.ride === r) { r.done = true; rideStep(); } }, s.wait);
}

Object.assign(ACTS, {
  "sn-nav": el => {
    if (el.dataset.stage === "exit") return ACTS["sn-exit"]();
    snGo(el.dataset.stage, +el.dataset.view, el.dataset.dir); noteActivity();
  },
  "sn-machine": () => { trip.modal = "machine"; trip.step = "dest"; trip.dest = null; trip.paid = 0; noteActivity(); kbDraw(); },
  "sn-dest": el => { trip.dest = el.dataset.to; trip.step = "who"; say(furiKana(trip.dest)); kbDraw(); },
  "sn-who": el => { trip.who = el.dataset.who; trip.step = "pay"; trip.paid = 0; say(furiKana("お{金|かね}を{入|い}れてください")); kbDraw(); },
  "sn-pay": el => {
    trip.paid += +el.dataset.v;
    if (trip.paid >= fareFor(trip.dest, trip.who)) { trip.step = "done"; say(furiKana("きっぷとおつりをお{取|と}りください")); }
    kbDraw();
  },
  "sn-take": () => {
    trip.ticket = { from: hereSt(), to: trip.dest, who: trip.who, fare: fareFor(trip.dest, trip.who) };
    trip.modal = null; trip.step = "dest"; trip.fresh = true; noteActivity(); kbDraw(); trip.fresh = false;
  },
  "sn-cancel": el => { say(el.dataset.say); trip.modal = null; trip.step = "dest"; trip.paid = 0; kbDraw(); },
  "sn-ticket": () => { trip.modal = "ticket"; kbDraw(); },
  "sn-map": () => { trip.modal = "map"; noteActivity(); kbDraw(); },
  "sn-close": () => { trip.modal = null; kbDraw(); },
  "sn-pop-ok": () => {
    if (trip.stage === "ride" && trip.ride && trip.ride.pop) { trip.ride.pop = null; kbDraw(); rideStep(); }
    else { trip.pop = null; kbDraw(); }
  },
  /* in through the gates: a ticket from here */
  "sn-gate": () => {
    if (!trip.ticket) return snNote(`<p class="sn-msg">The gate beeps and its little doors stay shut. You need a ticket first: the machines are under <b lang="ja">${inkHtml("{切符売|きっぷう}り{場|ば}")}</b>.</p>`);
    snGo("paid", 0, "r"); noteActivity();
  },
  /* out through the gates: only where your ticket's for (or back out where you started) */
  "sn-exit": () => {
    const t = trip.ticket, here = hereSt();
    if (!t || t.from === here) return snGo("lobby", 2, "l");
    if (t.to === here) {
      trip.ticket = null;
      snNote(snCheer(`You made it to <span lang="ja">${inkHtml(here)}</span>!`, `Your ticket goes into the gate, and the gate opens.`,
        `<button class="btn kb-main" data-act="sn-arrived">Into the station</button>`, "とうちゃく"), "found");
      petals($(".sn-modal-box"));
      return;
    }
    snNote(`<p class="sn-msg">The gate beeps and shuts. Your ticket goes from ${snStation(t.from)} to ${snStation(t.to)}, and this is ${snStation(here)}. Get back on a train: either way round goes there.</p>`);
  },
  "sn-arrived": () => { trip.modal = null; snGo("lobby", 2, "l"); },
  /* getting on: your way round, celebrated; the other way, warned */
  "sn-board-ask": el => {
    const n = +el.dataset.track, t = trainAt(n);
    if (!trip.ticket) return snNote(`<p class="sn-msg">No ticket? Then you can't have come through the gates. Go back down and buy one.</p>`);
    if (trip.ticket.to === hereSt()) return snNote(`<p class="sn-msg">You're already at ${snStation(hereSt())}, where your ticket goes. Out through the gates!</p>`);
    const best = bestDir(hereSt(), trip.ticket.to), stops = hopsTo(hereSt(), trip.ticket.to, t.dir);
    if (t.dir === best) {
      snNote(snCheer("You found your train!", `This <span lang="ja">${inkHtml(t.kind)}</span> goes ${snStation(t.toward[0])}, then ${snStation(t.toward[1])}: ${snStation(trip.ticket.to)} is ${stops === 1 ? "the next stop" : stops + " stops away"}.`,
        `<button class="btn kb-main" data-act="sn-board" data-track="${n}">Get on</button><button class="btn btn-ghost" data-act="sn-close">Not yet</button>`, "せいかい"), "found");
      petals($(".sn-modal-box"));
    } else snNote(`<p class="sn-msg">This one goes the other way round: ${snStation(t.toward[0])}, then ${snStation(t.toward[1])}. It would get you to ${snStation(trip.ticket.to)}, but the long way: ${stops} stops.</p>
      <div class="kb-row"><button class="btn btn-ghost" data-act="sn-board" data-track="${n}">Get on anyway</button></div>`);
    noteActivity();
  },
  "sn-board": el => {
    const t = trainAt(+el.dataset.track), n = tripData().ads.length;
    trip.ride = { dir: t.dir, track: t.track, at: hereSt(), next: t.toward[0], phase: "board", ads: shuffle([...Array(n).keys()]).slice(0, 3), queue: [], pop: null };
    trip.modal = null; snGo("ride", 0, "r");
  },
  "sn-sit": () => rideLeg(true),
  "sn-stay": () => { const r = trip.ride; r.at = r.next; r.next = stepFrom(r.at, r.dir); rideLeg(false); },
  "sn-off": () => {
    const r = trip.ride;
    trip.at = r.next; trip.ride = null;
    snGo(pairOf(r.track), r.track % 2 ? 0 : 1, "r");
  },
});
