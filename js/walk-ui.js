/* Nihongo Quest — places you walk round: the engine.

   A walk is a place in Out and about drawn as somewhere you move along —
   the konbini's wall of cabinets (js/konbini-ui.js), the sushi counter's
   belt and the festival's street of stalls (js/stalls-ui.js) — with things
   on it to pick up and read. Each place registers itself in WALKS with
   what it has and how it draws it; this file is everything they share:

     見る Browse   pick anything up, turn it over, tap a word to hear it
     読む Read     putting something back asks one question about it, side
                  by side (a konbini packet has three: 名 its name, 表 its
                  front, 裏 its back; a sushi plate or a festival dish has
                  its name), each once you can sound it out
     お使い Errand  a friend's list, in Japanese, of three things you can
                  read; find them, then the bill

   What's been read is kept in state.scenes[place]: got (names — the
   place's levels count these, as every place's do), and copy and back for
   places with those sides. Like every place, it never touches the review
   schedule.

   The desktop and the phone are drawn separately, by each place's desk()
   and phone(). A desktop walks along with the arrows (or ← →) and keeps
   what's in your hands beside it; a phone gets one long strip, a thing a
   screen, and what you pick up comes up as a sheet. Phone styles live only
   in the PHONE LAYER of css/app.css. The classes are kb-* because the
   konbini came first.

   A place's adapter, WALKS[id]:
     id, jp, title, eyebrow, lede      the header
     bundle                            the audio bundle to load
     things, by                        what can be picked up: { id, i, name, kana, en, price }
     sides                             e.g. ["name"] or ["name", "copy", "back"]
     stamps                            [[side, kanji, "its name"], …]
     readable(t, side)                 can this side be asked about yet?
     quiz(t, side)                     { side, ask, opts: [{ label, right }], ja?, value? }
     terms(t, view)                    [[markup, English, label], …] for "front" or "back"
     back(t)                           the back, if it turns over (else null)
     pack(t), big(t)                   the drawing; the class that sizes it in the hand
     desk(), phone()                   the place, drawn
     peers(t)                          the others a name question chooses from
     words: { noun, empty, browse, read, phoneHint, dot, basket, list, find, foundTitle }
     receipt(things)                   the bill when an errand is done
     foot()                            anything under the walk (the scenes' Test yourself) */

const WALKS = {};
const KB_PHONE = "(max-width: 720px)";
const kbPhone = () => typeof matchMedia === "function" && matchMedia(KB_PHONE).matches;
const kb = { mode: "browse", held: null, side: "front", open: new Set(), quiz: null, errand: null, flash: null, list: false, at: null };
/* the place you're in, if it's a walk */
const W = () => (typeof menuId !== "undefined" && WALKS[menuId]) || null;

/* ---------- what's been read, and what can be ---------- */

const kbRec = id => state.scenes[id] || (state.scenes[id] = { got: [] });
const kbHas = (t, side, w = W()) => asList(kbRec(w.id)[side === "name" ? "got" : side]).includes(t.i);
const kbSound = s => soundable(furiKana(s));
const kbNext = (t, w = W()) => w.sides.find(s => !kbHas(t, s, w) && w.readable(t, s));
const kbTicks = (t, w = W()) => w.sides.filter(s => kbHas(t, s, w)).length;
function kbMark(t, side, w = W()) {
  const r = kbRec(w.id), k = side === "name" ? "got" : side;
  r[k] = asList(r[k]);
  if (!r[k].includes(t.i)) r[k].push(t.i);
  save();
}

/* A name question: what it is, or (for a name with kanji) how it's read. */
function kbNameQuiz(t, peers) {
  const others = shuffle(peers.filter(x => x.id !== t.id && x.en !== t.en)).slice(0, 3);
  return Math.random() < .5 || !/\{/.test(t.name)
    ? { side: "name", ask: `What is <span class="jp" lang="ja">${inkHtml(t.name)}</span>?`, opts: shuffle([t, ...others]).map(x => ({ label: esc(x.en), right: x === t })) }
    : { side: "name", ask: `How is <span class="jp" lang="ja">${esc(furiPlain(t.name))}</span> read?`, ja: true,
        opts: shuffle([t, ...others]).map(x => ({ label: esc(x.kana), right: x === t })) };
}

/* ---------- shared pieces of a place ---------- */

/* Something you can pick up. inner is its drawing; the place's own by default. */
function kbProd(t, inner, w = W()) {
  const cls = [kb.held === t.id ? "gone" : "", w.readable(t, "name") ? "readable" : "", kb.flash === t.id ? "wrong" : ""].join(" ");
  return `<button class="kb-prod ${cls}" data-act="kb-pick" data-id="${esc(t.id)}" aria-label="${esc(t.en)}">${inner || w.pack(t)}</button>`;
}
const kbTicksHtml = (t, w = W()) => kbTicks(t, w) ? `<span class="kb-ok" title="${kbTicks(t, w)} of ${w.sides.length} read">${"✓".repeat(kbTicks(t, w))}</span>` : "";

/* A word on a sign, a lantern or a slip of paper: tap to hear it and see what
   it means. It's one of the scene's words, so the scene's quiz covers it. */
function kbSign(sc, word, cls = "", inner) {
  const it = sc.all.find(x => x.w === word), key = `${sc.id}:${it.i}`;
  const open = sceneOpen.has(key);
  return `<button class="kb-signword ${cls} ${open ? "open" : ""} ${sceneGot(sc.id).has(it.i) ? "known" : ""}" data-act="kb-sign" data-k="${esc(key)}" lang="ja">${inner || inkHtml(it.w)}${
    open ? `<span class="kb-gloss" lang="en">${esc(it.m)}</span>` : ""}</button>`;
}

/* ---------- in your hands ---------- */

function kbTerms(t, w) {
  return w.terms(t, kb.side).map(([word, en, label], i) => {
    const k = `${w.id}:${t.id}:${kb.side}:${i}`;
    return `<button class="kb-term ${kb.open.has(k) ? "open" : ""}" data-act="kb-term" data-k="${esc(k)}" data-say="${esc(furiKana(word))}">
      <span class="jp" lang="ja">${inkHtml(word)}</span><span class="side">${label}</span><span class="en">${esc(en)}</span></button>`;
  }).join("");
}

function kbHands(w) {
  const grab = `<div class="kb-grab"></div>`, words = w.words;
  if (!kb.held && kb.mode === "errand") return grab + kbErrandHtml(w);
  if (!kb.held) return `${grab}<h3>In your hands</h3><p class="kb-empty">${kb.mode === "read" ? words.read : words.browse}</p>`;
  const t = w.by[kb.held], q = kb.quiz, back = w.back(t);
  const kana = [...kanaUnits(kanaOnly(t.kana))], have = kana.filter(isLearned).length;
  const stamps = w.stamps.map(([s, j, en]) => `<span class="kb-st ${kbHas(t, s, w) ? "done" : ""}" lang="ja" title="${kbHas(t, s, w) ? "Read" : "Not yet"}: ${en}">${j}</span>`).join("");
  let foot;
  if (q) {
    const right = q.opts.find(o => o.right);
    foot = `<div class="kb-q"><div class="q-ask">${q.ask}</div>
      <div class="opts kb-opts">${q.opts.map((o, i) => `<button class="opt ${q.picked == null ? "" : o.right ? "right" : i === q.picked ? "wrong" : ""}" data-act="kb-ans" data-i="${i}" ${q.ja ? 'lang="ja"' : ""} ${q.picked == null ? "" : "disabled"}>${o.label}</button>`).join("")}</div>
      ${q.picked == null ? "" : `<div class="verdict ${q.opts[q.picked].right ? "ok" : ""}">${q.opts[q.picked].right ? "Yes!" : `It's <span ${q.ja ? 'lang="ja"' : ""}>${right.label}</span>.`}${q.value ? ` <span lang="ja">${inkHtml(q.value)}</span>` : ""}</div>
        <button class="btn kb-main" data-act="kb-done">Put it back</button>`}</div>`;
  } else {
    const side = kbNext(t, w), last = w.stamps[w.stamps.length - 1];
    const note = kb.mode === "errand" ? `<p class="kb-note">On the list? ${esc(words.basket)}.</p>`
      : kb.mode === "browse" ? ""
      : !w.readable(t, "name") ? `<p class="kb-note">Just looking: you can sound out ${have} of ${kana.length} kana in its name. Its questions wait until you can read it all.</p>`
      : side ? `<p class="kb-note good">You can read this. Putting it back asks about <b>${w.stamps.find(x => x[0] === side)[2]}</b>.</p>`
      : `<p class="kb-note good">You've read all you can on this one${kbHas(t, last[0], w) ? "." : `. ${esc(words.later || "")}`}</p>`;
    foot = `${note}<div class="kb-row">${kb.mode === "errand"
      ? `<button class="btn kb-main" data-act="kb-basket">${esc(words.basket)}</button><button class="btn btn-ghost" data-act="kb-put">Put it back</button>`
      : `<button class="btn kb-main" data-act="kb-put">Put it back</button>`}</div>`;
  }
  return `${grab}<div class="kb-hhead"><h3>In your hands</h3><div class="kb-stamps">${stamps}</div></div>
    <div class="kb-hold">${kb.side === "back" && back ? back : `<div class="kb-big ${w.big(t)}">${w.pack(t)}</div>`}</div>
    <div class="kb-sides">${back ? `<div class="seg seg-sm">
      <button data-act="kb-side" data-s="front" class="${kb.side === "front" ? "on" : ""}" ${q ? "disabled" : ""}><span lang="ja">表</span> Front</button>
      <button data-act="kb-side" data-s="back" class="${kb.side === "back" ? "on" : ""}" ${q ? "disabled" : ""}><span lang="ja">裏</span> Back</button></div>` : ""}
      <button class="btn btn-ghost btn-sm" data-act="say" data-say="${esc(t.kana)}">${icon("speaker")} Hear it</button></div>
    ${q ? "" : `<div class="kb-terms">${kbTerms(t, w)}</div>`}
    ${foot}`;
}

/* ---------- お使い: the errand ---------- */

function kbNewErrand(w = W()) {
  const pool = shuffle(w.things.filter(t => w.readable(t, "name")));
  kb.errand = pool.length < 3 ? { at: w.id, shut: pool.length } : { at: w.id, list: pool.slice(0, 3).map(t => t.id), got: [], msg: "" };
}
function kbErrandHtml(w) {
  const e = kb.errand, words = w.words;
  if (e.shut != null) return `<h3>お使い · Errand</h3><p class="kb-empty">Errands only ask for things you can read. You can read ${e.shut} name${e.shut === 1 ? "" : "s"} here so far; a list needs three. Keep going with kana and come back.</p>`;
  if (e.got.length === e.list.length) {
    const things = e.list.map(id => w.by[id]), total = things.reduce((n, t) => n + t.price, 0);
    return `<h3>${esc(words.foundTitle)}</h3>${w.receipt(things, total)}
      ${numbersKnown() ? `<p class="rc-say" lang="ja">${esc(numberKana(total))}えん</p>` : ""}
      <p class="kb-note good">All three found.</p>
      <button class="btn kb-main" data-act="kb-errand">Another list</button>`;
  }
  return `<h3>お使い · Errand</h3>
    <div class="kb-list"><div class="eyebrow">${esc(words.list)}</div><ul>${e.list.map(id =>
      `<li class="${e.got.includes(id) ? "got" : ""}" lang="ja">${inkHtml(w.by[id].name)}</li>`).join("")}</ul></div>
    <p class="kb-empty">${esc(words.find)} The list is in Japanese: reading it is the game.</p>
    ${e.msg ? `<p class="kb-note">${e.msg}</p>` : ""}`;
}

/* ---------- the page ---------- */

const KB_HINT = { browse: "Just look. Nothing is tested.", read: "Putting something back asks you about it.", errand: "Find what's on the list." };
function renderWalk(id) {
  const w = WALKS[id];
  loadBundle(w.bundle);
  if (kb.at !== id) { kbReset(); kb.at = id; }
  if (kb.mode === "errand" && (!kb.errand || kb.errand.at !== id)) kbNewErrand(w);
  const pl = placeBy(id), open = placeOpen(id), phone = kbPhone(), got = placeGot(pl);
  const up = kb.held || (phone && kb.mode === "errand" && kb.list);
  return `${typeof KB_DEFS !== "undefined" ? KB_DEFS : ""}<section class="card scene kb kb-${id}">
    <div class="scene-head"><div>
      <div class="eyebrow">${esc(w.eyebrow)} · Out and about</div>
      <h1>${esc(w.title)}</h1>
      <p class="lede">${w.lede}</p>
      ${inkKeyHtml(pl.items.map(x => x.w))}
    </div>
    <div class="scene-score">${ring(got / pl.items.length, 56, 6)}<span>${got}<small>/${pl.items.length}</small></span><small>${esc(w.words.score || "read")}</small></div></div>
    ${open ? levelsHtml(pl) : placeShutHtml(pl)}
    <div class="kb-modes"><div class="seg">
      <button data-act="kb-mode" data-m="browse" class="${kb.mode === "browse" ? "on" : ""}"><span lang="ja">見る</span> Browse</button>
      <button data-act="kb-mode" data-m="read" class="${kb.mode === "read" ? "on" : ""}"><span lang="ja">読む</span> Read</button>
      <button data-act="kb-mode" data-m="errand" class="${kb.mode === "errand" ? "on" : ""}"><span lang="ja">お使い</span> Errand</button></div>
      <span class="muted small">${KB_HINT[kb.mode]}</span>
      <span class="muted tiny kb-dotkey"><i></i> ${esc(w.words.dot)}</span></div>
    <div class="kb-body">${phone ? w.phone() : w.desk()}
      <aside class="kb-hands ${up ? "up" : ""}">${kbHands(w)}</aside></div>
    ${w.foot ? w.foot() : ""}
    ${phone && kb.mode === "errand" && !kb.held ? `<button class="btn cta" data-act="kb-list">${kb.list ? "Back to it" : "Show the list"}</button>` : ""}
  </section>`;
}

/* Re-render where you stand: the strip keeps its place. */
function kbDraw() {
  const x = $("#kbStrip")?.scrollLeft || 0;
  renderMenu();
  const s = $("#kbStrip");
  if (s) { s.style.scrollBehavior = "auto"; s.scrollLeft = x; s.style.scrollBehavior = ""; }
}

/* Leaving a place puts down whatever you were holding. */
function kbReset() { kb.held = null; kb.quiz = null; kb.list = false; kb.flash = null; kb.side = "front"; }

/* The arrow keys walk on a desktop; Escape puts a thing back. */
function walkKey(e) {
  if (view !== "menu" || !W() || kbPhone() || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return false;
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    $("#kbStrip")?.scrollBy({ left: (e.key === "ArrowLeft" ? -1 : 1) * 280, behavior: "smooth" });
    e.preventDefault();
    return true;
  }
  if (e.key === "Escape" && kb.held && !kb.quiz) { kbReset(); kbDraw(); return true; }
  return false;
}

/* A desktop window narrowed to a phone's width (or the other way) gets the other layout. */
if (typeof matchMedia === "function") matchMedia(KB_PHONE).addEventListener?.("change", () => { if (view === "menu" && W()) kbDraw(); });

Object.assign(ACTS, {
  "kb-pick": el => {
    if (kb.quiz && kb.quiz.picked == null) return;          /* answer first */
    kb.held = el.dataset.id; kb.side = "front"; kb.quiz = null; kb.flash = null;
    say(W().by[kb.held].kana);
    noteActivity();
    kbDraw();
  },
  "kb-side": el => { kb.side = el.dataset.s; kbDraw(); },
  "kb-term": el => { const k = el.dataset.k; kb.open.has(k) ? kb.open.delete(k) : kb.open.add(k); say(el.dataset.say); noteActivity(); kbDraw(); },
  "kb-sign": el => {
    const [id, i] = el.dataset.k.split(":");
    say(SCENE_BY[id].all[+i].kana);
    sceneOpen.has(el.dataset.k) ? sceneOpen.delete(el.dataset.k) : sceneOpen.add(el.dataset.k);
    noteActivity();
    kbDraw();
  },
  "kb-put": () => {
    const w = W(), t = w.by[kb.held], side = kb.mode === "read" && kbNext(t, w);
    if (side) { kb.quiz = w.quiz(t, side); kb.side = side === "back" ? "back" : "front"; }
    else kbReset();
    kbDraw();
  },
  "kb-ans": el => {
    const q = kb.quiz;
    if (!q || q.picked != null) return;
    q.picked = +el.dataset.i;
    if (q.opts[q.picked].right) kbMark(W().by[kb.held], q.side);
    noteActivity();
    kbDraw();
  },
  "kb-done": () => { kbReset(); kbDraw(); },
  "kb-mode": el => { kb.mode = el.dataset.m; kbReset(); if (kb.mode === "errand") kbNewErrand(); kbDraw(); },
  "kb-basket": () => {
    const e = kb.errand, t = W().by[kb.held];
    if (e.list.includes(t.id) && !e.got.includes(t.id)) { e.got.push(t.id); e.msg = ""; if (e.got.length === e.list.length) kb.list = true; }
    else { e.msg = `That's <span lang="ja">${inkHtml(t.name)}</span>, ${esc(t.en.toLowerCase())}. It isn't on the list.`; kb.flash = t.id; kb.list = true; }
    kb.held = null;
    noteActivity();
    kbDraw();
  },
  "kb-errand": () => { kbNewErrand(); kb.list = false; kbDraw(); },
  "kb-list": () => { kb.list = !kb.list; kbDraw(); },
  "kb-jump": el => { $("#" + el.dataset.to)?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" }); },
  "kb-walk": el => { const s = $("#kbStrip"); s?.scrollBy({ left: el.dataset.d * s.clientWidth * .6, behavior: "smooth" }); },
});
