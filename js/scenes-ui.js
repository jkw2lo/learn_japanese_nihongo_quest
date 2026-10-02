/* Nihongo Quest — out and about: drawing the scenes, and their quizzes.

   The Menu section is now "Out & about": the café and the diner, then the
   scenes in js/data/scenes.js. Tap anything to hear it and see what it
   means; "Test yourself" runs a quiz through the usual session screen. It's
   recognition practice, so like the menu it never touches the review
   schedule — it keeps its own tally of what you've recognised. */

const sceneOpen = new Set();                   /* items revealed, "id:i" */
const sceneList = new Set();                   /* scenes showing their word list */
const sceneGot = id => new Set(asList(state.scenes[id]?.got));

/* ---------- places: what's open, and when the rest will be ----------

   Every menu and scene is a place. A place opens when you can sound out
   half its words — every kana in them learned; kanji come with furigana,
   so kana is enough to sound them out. Words, not characters: five lessons
   in, half the characters on a station sign are yours but not one whole
   word is. A place that isn't open can still be looked round and listened
   to — only its quiz waits. */
const PLACE_OPEN = 0.5;
const kanaOnly = s => s.replace(/[^ぁ-ゖァ-ヺー]/g, "");
const soundable = (kana, known = isLearned) => kanaUnits(kanaOnly(kana)).every(u => typeof known === "function" ? known(u) : known.has(u));
const kanaCourse = () => [...LESSONS.filter(L => L.set === "h"), ...LESSONS.filter(L => L.set === "k")];

let placesCache = null;
function places() {
  if (placesCache) return placesCache;
  const course = kanaCourse();
  placesCache = [
    ...MENUS.map(M => ({ id: M.id, M, jp: furiPlain(M.name).split(" ").pop(), en: M.en, items: menuItems(M) })),
    ...SCENES.map(sc => ({ id: sc.id, sc, jp: sc.jp, en: sc.en, items: sc.all })),
    /* the convenience store: its words are its products' names (js/konbini-ui.js) */
    ...(typeof KONBINI !== "undefined" ? [{ id: "konbini", jp: "コンビニ", en: "Convenience store", items: konbiniItems() }] : []),
  ];
  /* the lesson that opens each one, if lessons go in order: the order they're shown in */
  placesCache.forEach(p => {
    p.words = p.items.map(it => it.kana);
    p.kanji = [...new Set(p.items.flatMap(it => furiKanji(it.w)))];
    const need = Math.ceil(p.words.length * PLACE_OPEN), known = new Set();
    p.opensAt = course.findIndex(L => { L.items.forEach(k => known.add(k)); return p.words.filter(w => soundable(w, known)).length >= need; });
    p.opensWith = course[p.opensAt]?.title || "";
  });
  placesCache.sort((a, b) => a.opensAt - b.opensAt);
  return placesCache;
}
const placeBy = id => places().find(p => p.id === id);

function placeProgress(p) {
  const ok = p.words.filter(w => soundable(w)).length, n = p.words.length, need = Math.ceil(n * PLACE_OPEN);
  return { ok, n, need, open: ok >= need, more: Math.max(0, need - ok) };
}
const placeOpen = id => placeProgress(placeBy(id)).open;
/* What's been recognised: a scene's quiz, or a menu's ordering game — both
   kept in state.scenes, by item index. */
const placeGot = p => sceneGot(p.id).size;
const placeNew = p => placeProgress(p).open && !asList(state.outSeen).includes(p.id);

/* ---------- levels: the same place, deeper ----------

   Opening a place is the start, not the end. Three levels, each its own
   thing to work towards, earned in any order:
     1 読 Sound it out — every word in it, not just half
     2 分 Know what it says — most of it recognised (LEVEL_KNOW): a scene's
          quiz, a menu's orders
     3 字 Read it as written — every kanji in it learned, so the furigana
          has gone. A place in kana alone is read as written already. */
const LEVEL_KNOW = 0.8;
function placeLevels(p) {
  const pr = placeProgress(p);
  const got = placeGot(p), need = Math.ceil(pr.n * LEVEL_KNOW);
  const kj = p.kanji.filter(knowsKanji).length;
  const L = [
    { jp: "読", en: "Sound it out", done: pr.ok === pr.n, note: pr.ok === pr.n ? "every word" : `${pr.ok} of ${pr.n} words` },
    { jp: "分", en: "Know what it says", done: got >= need, note: got >= need ? `${got} of ${pr.n} recognised` : `${got} of ${need} recognised` },
    { jp: "字", en: "Read it as written", done: kj === p.kanji.length,
      note: !p.kanji.length ? "all kana — nothing hidden" : `${kj} of ${p.kanji.length} kanji` },
  ];
  return { list: L, stars: L.filter(x => x.done).length, next: L.find(x => !x.done) || null };
}

const starsHtml = n => `<span class="pl-stars" aria-label="${n} of 3 levels">${[0, 1, 2].map(i => `<i class="${i < n ? "on" : ""}"></i>`).join("")}</span>`;

function levelsHtml(p) {
  const lv = placeLevels(p);
  return `<ol class="levels">${lv.list.map((x, i) => `<li class="${x.done ? "done" : x === lv.next ? "next" : ""}">
    <span class="lv-jp" lang="ja">${x.jp}</span><span><b>${i + 1} · ${x.en}</b><small>${x.note}</small></span></li>`).join("")}</ol>`;
}

/* ---------- a word a day from the street ----------

   One word a day from the place nearest to opening (or, once they're all
   open, the one furthest from its levels), for a look at what's coming.
   It's only shown: nothing here learns, grades, counts towards the day or
   touches lessons, reviews or the streak. Kept for the day (state.outWord)
   so it doesn't change when a lesson opens a place. */
function outWord() {
  const t = today();
  const w = state.outWord;
  if (w && w.date === t && placeBy(w.id)?.items[w.i]) return { p: placeBy(w.id), it: placeBy(w.id).items[w.i] };
  const ps = places();
  const p = ps.find(x => !placeProgress(x).open)
    || [...ps].sort((a, b) => placeLevels(a).stars - placeLevels(b).stars)[0];
  /* a word with something new in it — a kana or kanji not yet known — if there is one */
  const fresh = p.items.map((it, i) => i).filter(i => !soundable(p.items[i].kana) || furiKanji(p.items[i].w).some(k => !knowsKanji(k)));
  const pool = fresh.length ? fresh : p.items.map((_, i) => i);
  const seed = [...t].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const i = pool[seed % pool.length];
  state.outWord = { date: t, id: p.id, i };
  save();
  return { p, it: p.items[i] };
}

function outWordHtml() {
  const { p, it } = outWord();
  return `<section class="card out-word">
    <div class="eyebrow">今日の言葉 · A word from the street</div>
    <div class="ow-row">
      <button class="ow-jp" lang="ja" data-act="say" data-say="${esc(it.kana)}" title="Hear it">${inkHtml(it.w)}</button>
      <div class="ow-text">
        <div class="ow-rom">${esc(toRomaji(it.kana))}</div>
        <div class="ow-m">${esc(it.m)}</div>
        <div class="muted tiny">from <span lang="ja">${esc(p.jp)}</span> ${esc(p.en)}</div>
      </div>
    </div>
    <p class="muted tiny">Just for looking. It isn't added to your lessons or reviews — grey is what you haven't learned yet.</p>
  </section>`;
}

/* ---------- ink: what you know, dark; what you don't, grey ----------

   Each kana is inked on its own, so a word fills in as its kana are
   learned. A kanji you haven't learned stays grey — a softer grey when the
   kana above it are all yours, since you can at least sound it out. */
function inkKana(t) {
  return t.split(/([ぁ-ゖァ-ヺー]+)/).map((run, i) => i % 2
    ? kanaUnits(run).map(u => isLearned(u) ? esc(u) : `<span class="ink-no">${esc(u)}</span>`).join("")
    : esc(run)).join("");
}
function inkHtml(s, mode = state.settings.furigana) {
  return furiParse(s).map(x => {
    if (x.t !== undefined) return inkKana(x.t);
    const known = [...x.k].every(knowsKanji);
    const bare = mode === "never" || (mode === "auto" && known);
    const base = known ? esc(x.k) : `<span class="${soundable(x.r) ? "ink-sound" : "ink-no"}">${esc(x.k)}</span>`;
    return bare ? base : `<ruby>${base}<rt>${inkKana(x.r)}</rt></ruby>`;
  }).join("");
}

/* The key to the ink, under a place's name. */
function inkKeyHtml(strings) {
  const kanji = strings.some(w => /[{]/.test(w));
  return `<p class="ink-key">Dark: characters you know · <span class="ink-no">grey</span>: not yet.${kanji
    ? ` Kanji stay grey until you learn them — the kana above let you sound them out.` : ""}</p>`;
}

/* A place that isn't open yet: how far off it is, and that looking is fine. */
function placeShutHtml(p) {
  const pr = placeProgress(p);
  return `<div class="place-shut">${icon("lock")}<div>
    <b>Opens when you can sound out half its words</b> — ${pr.ok} of ${pr.n} so far, ${pr.more} more to go${
      p.opensWith && !kanaCourse()[p.opensAt]?.items.every(isLearned) ? `, around the <span lang="ja">${esc(p.opensWith)}</span>` : ""}.
    Look round and listen meanwhile; the quiz waits until it opens.</div></div>`;
}

/* ---------- a place's words, as a list ----------

   Every word in a place, in one table: as it's written (inked), its
   reading, what it means, a button to hear it, and a tick once it's been
   recognised. For looking things up while you're there, or going over them
   after. */
function placeListHtml(p) {
  const got = sceneGot(p.id);
  return `<div class="word-list"><table>
    <thead><tr><th>Japanese</th><th>Reading</th><th>Meaning</th><th></th></tr></thead>
    <tbody>${p.items.map(it => `<tr class="${got.has(it.i) ? "known" : ""}">
      <td class="wl-jp" lang="ja">${inkHtml(it.w)}</td>
      <td class="wl-r"><span lang="ja">${esc(it.kana)}</span><small>${esc(toRomaji(it.kana))}</small></td>
      <td class="wl-m">${esc(it.m)}</td>
      <td class="wl-act"><button class="icon-btn" data-act="say" data-say="${esc(it.kana)}" title="Hear it" aria-label="Hear it">${icon("speaker")}</button>${got.has(it.i) ? `<span class="wl-ok" title="Recognised">${icon("check")}</span>` : ""}</td>
    </tr>`).join("")}</tbody></table></div>`;
}

/* ---------- the landing page ---------- */

function renderOutHome() {
  const ps = places().map(p => ({ p, ...placeProgress(p) }));
  const open = ps.filter(x => x.open), next = ps.find(x => !x.open);
  const nextLesson = next && kanaCourse()[next.p.opensAt];
  const lead = !open.length
    ? `Nothing's open yet — that's expected on day one. ${next ? `The first place, <b lang="ja">${esc(next.p.jp)}</b> ${esc(next.p.en.toLowerCase())}, opens around the <span lang="ja">${esc(next.p.opensWith)}</span>.` : ""}`
    : next
      ? `<b>Next to open: <span lang="ja">${esc(next.p.jp)}</span> ${esc(next.p.en)}</b> — ${next.more} more word${next.more === 1 ? "" : "s"} to sound out${nextLesson && !nextLesson.items.every(isLearned) ? `, which the <span lang="ja">${esc(next.p.opensWith)}</span> should bring` : ""}.`
      : `Every place is open. What's left is the kanji — each one you learn loses its little kana, and you read the sign the way people there do.`;
  const tile = x => {
    const isNew = placeNew(x.p);
    return `<button class="place ${x.open ? "open" : "shut"}" data-act="menu-pick" data-id="${x.p.id}">
      ${isNew ? `<span class="pl-new">new</span>` : x.open ? "" : `<span class="pl-lock">${icon("lock")}</span>`}
      <span class="pl-jp" lang="ja">${esc(x.p.jp)}</span>
      <span class="pl-en">${esc(x.p.en)}</span>
      <span class="pl-bar"><i style="width:${Math.round(100 * x.ok / x.n)}%"></i><b style="left:${PLACE_OPEN * 100}%"></b></span>
      <span class="pl-n">${x.ok} of ${x.n} words you can read</span>
      <span class="pl-state">${x.open
        ? `${starsHtml(placeLevels(x.p).stars)} ${esc(placeLevels(x.p).next?.en || "Every level")}${placeLevels(x.p).next ? " next" : " done"}`
        : `${x.more} more to open`}</span>
    </button>`;
  };
  return `<div class="ob-head"><div class="eyebrow">街 · Out and about</div></div>
    <section class="card out-intro">
      <div class="out-intro-text">
        <h1>Japanese in the wild.</h1>
        <p class="lede">Sushi counters, station signs, menus, what shop staff say — the Japanese you'd meet on a trip.
          Every kana you learn inks in a little more of it. It's here for recognising, at your own pace: nothing in it touches your reviews.</p>
        <ol class="out-steps">
          <li><b>Learn kana.</b> The characters you know turn dark everywhere here; the rest stay grey.</li>
          <li><b>A place opens</b> when you can sound out half its words.</li>
          <li><b>Look, listen, test yourself.</b> Tap anything to hear it and see what it means.</li>
          <li><b>Then go deeper.</b> Each place has three levels: sound out every word, know what it says, read it with no kana above the kanji.</li>
        </ol>
      </div>
      <div class="out-journey">
        <div class="eyebrow">${open.length} of ${ps.length} places open</div>
        <div class="oj-track">${ps.map(x => `<i class="${x.open ? "on" : x === next ? "next" : ""}" title="${esc(x.p.en)}"></i>`).join("")}</div>
        <p class="small">${lead}</p>
      </div>
    </section>
    ${outWordHtml()}
    <div class="places">${ps.map(tile).join("")}</div>`;
}

/* The strip of places above a place: back to all of them, then each one. */
function scenePickerHtml() {
  const tiles = places().map(p => {
    const pr = placeProgress(p);
    return `<button class="scene-tile ${menuId === p.id ? "on" : ""} ${pr.open ? "" : "shut"}" data-act="menu-pick" data-id="${p.id}">
      <span class="st-jp" lang="ja">${esc(p.jp)}</span><span class="st-en">${esc(p.en)}</span>${pr.open
        ? `<span class="st-n">${pr.ok}/${pr.n}</span>` : `<span class="st-lock">${icon("lock")}</span>`}</button>`;
  });
  return `<div class="scene-strip"><button class="scene-tile home" data-act="out-home">${icon("back")}<span class="st-en">All places</span></button>${tiles.join("")}</div>`;
}

function itemHtml(sc, it, cls = "") {
  const key = `${sc.id}:${it.i}`;
  const open = sceneOpen.has(key);
  const known = sceneGot(sc.id).has(it.i);
  return `<button class="${cls} ${open ? "open" : ""} ${known ? "known" : ""}" data-act="scene-item" data-k="${esc(key)}">
    <span class="si-jp" lang="ja">${inkHtml(it.w)}</span>
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
      return `<button class="rc-term ${sceneOpen.has(`${sc.id}:${it.i}`) ? "open" : ""}" data-act="scene-item" data-k="${sc.id}:${it.i}" lang="ja">${inkHtml(w)}${extra}</button>`;
    };
    body = `<div class="receipt-wrap"><div class="paper-receipt" lang="ja">
      <div class="pr-store">${esc(sc.store)}</div>
      <div class="pr-meta">2026年9月25日 18:42　レジ 2</div>
      ${sc.lines.map(([w, p]) => `<div class="pr-row"><span>${inkHtml(w)}</span><span>¥${p}</span></div>`).join("")}
      <div class="pr-rule"></div>
      <div class="pr-row">${term("{小計|しょうけい}")}<span>¥${r.sub}</span></div>
      <div class="pr-row">${term("{消費税|しょうひぜい}", "（8%）")}<span>¥${r.tax}</span></div>
      <div class="pr-row big">${term("{合計|ごうけい}")}<span>¥${r.total}</span></div>
      <div class="pr-row small">（${term("{税込|ぜいこ}み")}）<span></span></div>
      <div class="pr-row">${term("お{預|あず}かり")}　${term("{現金|げんきん}")}<span>¥${r.paid.toLocaleString("en-US")}</span></div>
      <div class="pr-row big">${term("お{釣|つ}り")}<span>¥${r.change}</span></div>
      <div class="pr-row small">${term("{点数|てんすう}")}<span>${r.count}点</span></div>
      <div class="pr-foot">${inkKana("ありがとうございました")}</div>
    </div>
    <div class="rc-gloss">${sc.all.map(it => sceneOpen.has(`${sc.id}:${it.i}`) ? `<div><b lang="ja">${wordHtml(it.w)}</b> ${esc(it.m)}</div>` : "").join("") || `<p class="muted small">Tap a word on the receipt.</p>`}
      <div class="eyebrow">More you'll see</div>
      <div class="chips">${sc.all.filter(it => !/小計|消費税|合計|税込|預|現金|釣|点数/.test(it.w)).map(it => itemHtml(sc, it, "chip-item")).join("")}</div>
    </div></div>`;
  }
  const open = placeOpen(sc.id);
  return `<section class="card scene">
    <div class="scene-head"><div>
      <div class="eyebrow">${esc(sc.jp)} · Out and about</div>
      <h1>${esc(sc.en)}</h1>
      <p class="lede">${esc(sc.intro)}</p>
      ${inkKeyHtml(sc.all.map(it => it.w))}
    </div>
    <div class="scene-score">${ring(got / n, 56, 6)}<span>${got}<small>/${n}</small></span><small>recognised</small></div></div>
    ${open ? levelsHtml(placeBy(sc.id)) : placeShutHtml(placeBy(sc.id))}
    ${body}
    <div class="scene-actions">${open ? `<button class="btn cta" data-act="scene-quiz" data-id="${sc.id}">Test yourself</button>`
      : `<button class="btn cta" disabled>${icon("lock")} Quiz: ${placeProgress(placeBy(sc.id)).more} more word${placeProgress(placeBy(sc.id)).more === 1 ? "" : "s"}</button>`}
      <button class="btn btn-ghost" data-act="scene-reveal" data-id="${sc.id}">Show every meaning</button>
      <button class="btn btn-ghost" data-act="scene-list" data-id="${sc.id}"><span lang="ja">一覧</span> ${sceneList.has(sc.id) ? "Hide the word list" : "Word list"}</button></div>
    ${sceneList.has(sc.id) ? placeListHtml(placeBy(sc.id)) : ""}
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
  if (!placeOpen(id)) return;
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
    <div class="q-scene plates-${sc.style || sc.look}"><div class="${look} static ${sc.look === "road" && furiPlain(c.item.w) === "止まれ" ? "tri" : ""}"><span class="si-jp" lang="ja">${inkHtml(c.item.w)}</span></div></div>`;
}

function receiptMiniHtml(sc) {
  const r = receiptSums(sc);
  return `<div class="paper-receipt mini" lang="ja">
    ${sc.lines.map(([w, p]) => `<div class="pr-row"><span>${inkHtml(w)}</span><span>¥${p}</span></div>`).join("")}
    <div class="pr-rule"></div>
    <div class="pr-row"><span>${inkHtml("{小計|しょうけい}")}</span><span>¥${r.sub}</span></div>
    <div class="pr-row"><span>${inkHtml("{消費税|しょうひぜい}")}</span><span>¥${r.tax}</span></div>
    <div class="pr-row big"><span>${inkHtml("{合計|ごうけい}")}</span><span>¥${r.total}</span></div>
    <div class="pr-row"><span>${inkHtml("お{預|あず}かり")}</span><span>¥1,000</span></div>
    <div class="pr-row big"><span>${inkHtml("お{釣|つ}り")}</span><span>¥${r.change}</span></div>
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
  "out-home": () => { menuId = null; game = null; if (view !== "menu") go("menu"); else { renderMenu(); scrollTo(0, 0); } },
  "scene-item": el => tapSceneItem(el.dataset.k),
  "scene-quiz": el => startSceneQuiz(el.dataset.id),
  "scene-list": el => { const id = el.dataset.id; sceneList.has(id) ? sceneList.delete(id) : sceneList.add(id); renderMenu(); },
  "scene-reveal": el => { SCENE_BY[el.dataset.id].all.forEach(it => sceneOpen.add(`${el.dataset.id}:${it.i}`)); renderMenu(); },
});
