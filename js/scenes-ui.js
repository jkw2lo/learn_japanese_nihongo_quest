/* Nihongo Quest — out and about: drawing the scenes, and their quizzes.

   The Menu section is now "Out & about": the café and the diner, then the
   scenes in js/data/scenes.js. Tap anything to hear it and see what it
   means; "Test yourself" runs a quiz through the usual session screen. It's
   recognition practice, so like the menu it never touches the review
   schedule — it keeps its own tally of what you've recognised. */

const sceneOpen = new Set();                   /* items revealed, "id:i" */
const sceneGot = id => new Set(asList(state.scenes[id]?.got));

function sceneTileHtml(id, jp, en, on, extra = "") {
  return `<button class="scene-tile ${on ? "on" : ""}" data-act="menu-pick" data-id="${id}">
    <span class="st-jp" lang="ja">${esc(jp)}</span><span class="st-en">${esc(en)}</span>${extra}</button>`;
}

/* The strip of places at the top: two menus, then the scenes. */
function scenePickerHtml() {
  const menus = MENUS.map(m => sceneTileHtml(m.id, furiPlain(m.name).split(" ").pop(), m.en, menuId === m.id, menuOpen(m) ? "" : `<span class="st-lock">${icon("lock")}</span>`));
  const scenes = SCENES.map(sc => {
    const got = sceneGot(sc.id).size, n = sc.all.length;
    return sceneTileHtml(sc.id, sc.jp, sc.en, menuId === sc.id, `<span class="st-n">${got ? `${got}/${n}` : `${n}`}</span>`);
  });
  return `<div class="scene-strip">${[...menus, ...scenes].join("")}</div>`;
}

function itemHtml(sc, it, cls = "") {
  const key = `${sc.id}:${it.i}`;
  const open = sceneOpen.has(key);
  const known = sceneGot(sc.id).has(it.i);
  return `<button class="${cls} ${open ? "open" : ""} ${known ? "known" : ""}" data-act="scene-item" data-k="${esc(key)}">
    <span class="si-jp" lang="ja">${wordHtml(it.w)}</span>
    <span class="si-m">${open ? esc(it.m) : "tap to hear · see"}</span>
  </button>`;
}

function renderScene(sc) {
  loadBundle("scenes");
  const n = sc.all.length, got = sceneGot(sc.id).size;
  let body = "";
  if (sc.look === "sign" || sc.look === "road") {
    const plates = sc.items.map((_, i) => sc.all[i]);
    body = `<div class="plates plates-${sc.style || sc.look}">${plates.map(it =>
      itemHtml(sc, it, `plate ${sc.look === "road" && furiPlain(it.w) === "止まれ" ? "tri" : ""}`)).join("")}</div>`;
    if (sc.voice) body += `<h3 class="scene-sub">${icon("speaker")} Announcements</h3>
      <div class="voices">${sc.all.slice(sc.items.length).map(it => itemHtml(sc, it, "voice")).join("")}</div>`;
  } else if (sc.look === "voice") {
    body = `<div class="voices">${sc.all.map(it => itemHtml(sc, it, "voice")).join("")}</div>`;
  } else if (sc.look === "chat") {
    body = `<div class="chat">${sc.all.map(it => `<div class="bubble-row ${it.who}">
      ${it.who === "them" ? neko("happy", "avatar") : ""}${itemHtml(sc, it, `bubble ${it.who}`)}</div>`).join("")}</div>
      <p class="muted tiny chat-key"><span class="key-you"></span> you say · <span class="key-them"></span> you'll hear</p>`;
  } else if (sc.look === "receipt") {
    const r = receiptSums(sc);
    const term = (w, extra = "") => {
      const it = sc.all.find(x => x.w === w);
      return `<button class="rc-term ${sceneOpen.has(`${sc.id}:${it.i}`) ? "open" : ""}" data-act="scene-item" data-k="${sc.id}:${it.i}" lang="ja">${wordHtml(w)}${extra}</button>`;
    };
    body = `<div class="receipt-wrap"><div class="paper-receipt" lang="ja">
      <div class="pr-store">${esc(sc.store)}</div>
      <div class="pr-meta">2026年9月25日 18:42　レジ 2</div>
      ${sc.lines.map(([w, p]) => `<div class="pr-row"><span>${wordHtml(w)}</span><span>¥${p}</span></div>`).join("")}
      <div class="pr-rule"></div>
      <div class="pr-row">${term("{小計|しょうけい}")}<span>¥${r.sub}</span></div>
      <div class="pr-row">${term("{消費税|しょうひぜい}", "（8%）")}<span>¥${r.tax}</span></div>
      <div class="pr-row big">${term("{合計|ごうけい}")}<span>¥${r.total}</span></div>
      <div class="pr-row small">（${term("{税込|ぜいこ}み")}）<span></span></div>
      <div class="pr-row">${term("お{預|あず}かり")}　${term("{現金|げんきん}")}<span>¥${r.paid.toLocaleString("en-US")}</span></div>
      <div class="pr-row big">${term("お{釣|つ}り")}<span>¥${r.change}</span></div>
      <div class="pr-row small">${term("{点数|てんすう}")}<span>${r.count}点</span></div>
      <div class="pr-foot">ありがとうございました</div>
    </div>
    <div class="rc-gloss">${sc.all.map(it => sceneOpen.has(`${sc.id}:${it.i}`) ? `<div><b lang="ja">${wordHtml(it.w)}</b> ${esc(it.m)}</div>` : "").join("") || `<p class="muted small">Tap a word on the receipt.</p>`}
      <div class="eyebrow">More you'll see</div>
      <div class="chips">${sc.all.filter(it => !/小計|消費税|合計|税込|預|現金|釣|点数/.test(it.w)).map(it => itemHtml(sc, it, "chip-item")).join("")}</div>
    </div></div>`;
  }
  return `<section class="card scene">
    <div class="scene-head"><div>
      <div class="eyebrow">${esc(sc.jp)} · Out and about</div>
      <h1>${esc(sc.en)}</h1>
      <p class="lede">${esc(sc.intro)}</p>
    </div>
    <div class="scene-score">${ring(got / n, 56, 6)}<span>${got}<small>/${n}</small></span><small>recognised</small></div></div>
    ${body}
    <div class="scene-actions"><button class="btn cta" data-act="scene-quiz" data-id="${sc.id}">Test yourself</button>
      <button class="btn btn-ghost" data-act="scene-reveal" data-id="${sc.id}">Show every meaning</button></div>
  </section>`;
}

function tapSceneItem(key) {
  const [id, i] = key.split(":");
  const it = SCENE_BY[id].all[+i];
  say(it.kana);
  noteActivity();
  sceneOpen.has(key) ? sceneOpen.delete(key) : sceneOpen.add(key);
  renderMenu();
}

/* ---------- the quiz ---------- */

function qScene(sc, it) {
  const others = shuffle(sc.all.filter(x => x.m !== it.m)).slice(0, 3);
  const opts = shuffle([it, ...others]);
  return { t: "q", kind: "sc", scene: sc.id, item: it, opts: opts.map(x => ({ label: x.m, val: x.m })), answer: it.m, sound: it.kana };
}

function qSceneExtra(sc, [ask, right, ...wrong]) {
  return { t: "q", kind: "sc", scene: sc.id, item: null, ask, opts: shuffle([right, ...wrong]).map(x => ({ label: x, val: x })), answer: right };
}

function startSceneQuiz(id) {
  const sc = SCENE_BY[id];
  const got = sceneGot(id);
  /* not yet recognised first, then the rest */
  const order = [...shuffle(sc.all.filter(it => !got.has(it.i))), ...shuffle(sc.all.filter(it => got.has(it.i)))].slice(0, 12);
  const queue = order.map(it => () => qScene(sc, it));
  (sc.quiz || []).forEach(q => queue.push(() => qSceneExtra(sc, q)));
  openSession({ kind: "practice", title: `${sc.jp} · ${sc.en}`, queue });
}

function scenePrompt(c) {
  if (!c.item) return `<div class="q-ask">${esc(c.ask)}</div>${receiptMiniHtml(SCENE_BY[c.scene])}`;
  const sc = SCENE_BY[c.scene];
  const look = sc.look === "sign" || sc.look === "road" ? (c.item.i < sc.items.length ? "plate" : "voice") : sc.look === "chat" ? `bubble ${c.item.who}` : "voice";
  return `<div class="q-ask">What does this mean?</div>
    <div class="q-scene plates-${sc.style || sc.look}"><div class="${look} static ${sc.look === "road" && furiPlain(c.item.w) === "止まれ" ? "tri" : ""}"><span class="si-jp" lang="ja">${wordHtml(c.item.w)}</span></div></div>`;
}

function receiptMiniHtml(sc) {
  const r = receiptSums(sc);
  return `<div class="paper-receipt mini" lang="ja">
    ${sc.lines.map(([w, p]) => `<div class="pr-row"><span>${wordHtml(w)}</span><span>¥${p}</span></div>`).join("")}
    <div class="pr-rule"></div>
    <div class="pr-row"><span>${wordHtml("{小計|しょうけい}")}</span><span>¥${r.sub}</span></div>
    <div class="pr-row"><span>${wordHtml("{消費税|しょうひぜい}")}</span><span>¥${r.tax}</span></div>
    <div class="pr-row big"><span>${wordHtml("{合計|ごうけい}")}</span><span>¥${r.total}</span></div>
    <div class="pr-row"><span>${wordHtml("お{預|あず}かり")}</span><span>¥1,000</span></div>
    <div class="pr-row big"><span>${wordHtml("お{釣|つ}り")}</span><span>¥${r.change}</span></div>
  </div>`;
}

/* Called from settle(): a right answer is an item recognised. */
function sceneAnswered(c, ok) {
  if (!ok || !c.item) return;
  const s = state.scenes[c.scene] || (state.scenes[c.scene] = { got: [] });
  s.got = asList(s.got);
  if (!s.got.includes(c.item.i)) s.got.push(c.item.i);
}

Object.assign(ACTS, {
  "scene-item": el => tapSceneItem(el.dataset.k),
  "scene-quiz": el => startSceneQuiz(el.dataset.id),
  "scene-reveal": el => { SCENE_BY[el.dataset.id].all.forEach(it => sceneOpen.add(`${el.dataset.id}:${it.i}`)); renderMenu(); },
});
