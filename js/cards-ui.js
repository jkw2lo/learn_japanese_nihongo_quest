/* Nihongo Quest — flashcards.

   A deck of what you've learned, one card at a time: look, think, flip,
   say whether you had it. "Again" sends the card to the back of the deck;
   "Got it" moves on. It's for going over things at your own pace, so —
   like Go deeper — it never touches the review schedule, and a self-marked
   card isn't evidence for "solid" either. */

const DECKS = {
  today:    { jp: "今日", en: "Today's" },
  hira:     { jp: "ひらがな", en: "Hiragana" },
  kata:     { jp: "カタカナ", en: "Katakana" },
  words:    { jp: "言葉", en: "Words" },
  kanji:    { jp: "漢字", en: "Kanji" },
  patterns: { jp: "文型", en: "Patterns" },
};

let CD = { deck: null, dir: "jp", order: "shaky", keys: [], i: 0, flipped: false, got: 0, again: 0, done: false };

function deckKeys(deck) {
  const learnedToday = state.days[today()]?.learned || [];
  switch (deck) {
    case "today": {
      const due = dueKeys().slice(0, 40);
      return [...new Set([...learnedToday.filter(k => !KANA_BY[k]?.concept), ...due.filter(k => !KANA_BY[k]?.concept)])];
    }
    case "hira": return learnedKana("h").filter(e => !e.concept).map(e => e.k);
    case "kata": return learnedKana("k").filter(e => !e.concept).map(e => e.k);
    case "words": {
      const stage = learnedWords().map(x => x.key);
      return stage.length ? stage : readableWords().map(w => "kw:" + w.w);
    }
    case "kanji": return learnedKanji().map(e => e.key);
    case "patterns": return learnedPatterns().map(p => p.key);
  }
  return [];
}

/* The shakier something is, the sooner it comes up. */
function orderKeys(keys) {
  if (CD.order === "shuffle") return shuffle([...keys]);
  const weak = k => {
    const sks = skillsFor(k.startsWith("kw:") ? "w:" : k).filter(s => s !== "w" && s !== "a");
    return sks.reduce((t, s) => t + solidness(k, s), 0) / (sks.length || 1);
  };
  return shuffle([...keys]).sort((a, b) => weak(a) - weak(b));
}

/* What each side of a card shows. */
function cardFaces(key) {
  if (key.startsWith("kw:")) {
    const w = KANA_WORDS.find(x => x.w === key.slice(3));
    return { jp: `<span class="cf-word" lang="ja">${esc(w.w)}</span>`, en: esc(w.m),
      back: `<div class="cf-rom">${esc(w.r)}</div>${w.note ? `<p class="cf-note">${esc(w.note)}</p>` : ""}`, say: w.w };
  }
  if (isWordKey(key)) {
    const x = WORD_BY[key];
    return { jp: `<span class="cf-word" lang="ja">${wordHtml(x.w)}</span>`, en: esc(x.m),
      back: `<div class="cf-kana" lang="ja">${furiHtml(x.w, () => false, "always")}</div><div class="cf-rom">${esc(x.r)}</div>${x.note ? `<p class="cf-note">${wordHtml(x.note)}</p>` : ""}`,
      say: x.say };
  }
  if (isKanjiKey(key)) {
    const K = KANJI_BY[key.slice(2)];
    const ws = wordsWith(K.k, true).slice(0, 3);
    return { jp: `<span class="cf-glyph kanji" lang="ja">${esc(K.k)}</span>`, en: esc(K.m),
      back: `${readingsHtml(K)}<div class="cf-ex" lang="ja">${ws.map(w => furiHtml(w.w, () => false, "always")).join("　")}</div>`, say: kanjiSay(K.k) };
  }
  if (isPatternKey(key)) {
    const p = PATTERN_BY[key];
    const e = p.ex[0];
    return { jp: `<span class="cf-pat" lang="ja">${wordHtml(p.pat)}</span><div class="cf-ex" lang="ja">${wordHtml(e.jp)}</div>`, en: esc(p.m),
      back: `<div class="cf-ex-en">${esc(e.en)}</div><p class="cf-note">${wordHtml(p.note)}</p>`, say: e.kana };
  }
  const e = KANA_BY[key];
  return { jp: `<span class="cf-glyph" lang="ja">${esc(e.k)}</span>`, en: `<span class="cf-bigrom">${esc(e.r)}</span>`,
    back: e.story ? `<p class="cf-note">${esc(e.story)}</p>` : "", say: e.say };
}

function startDeck(deck) {
  const keys = orderKeys(deckKeys(deck));
  CD = { ...CD, deck, keys, i: 0, flipped: false, got: 0, again: 0, done: !keys.length };
  crumb(`cards ${deck} (${keys.length})`);
  renderCards();
}

function renderCards() {
  const el = $("#v-cards");
  /* each deck its own little stack of cards, not a segment of one bar */
  const picker = `<div class="cards-pick">
    <div class="cd-decks">${Object.entries(DECKS).map(([id, d]) => {
      const n = deckKeys(id).length;
      return `<button class="deck-tile ${CD.deck === id ? "on" : ""}" data-act="cd-deck" data-id="${id}" ${n ? "" : "disabled"}>
        <span class="dt-card"><span class="dt-jp" lang="ja">${d.jp}</span><span class="dt-en">${d.en}</span><span class="dt-n">${n} card${n === 1 ? "" : "s"}</span></span></button>`;
    }).join("")}</div>
    <div class="cd-opts">
      <div class="seg seg-sm">
        <button class="${CD.dir === "jp" ? "on" : ""}" data-act="cd-dir" data-v="jp">日本語 → English</button>
        <button class="${CD.dir === "en" ? "on" : ""}" data-act="cd-dir" data-v="en">English → 日本語</button>
      </div>
      <div class="seg seg-sm">
        <button class="${CD.order === "shaky" ? "on" : ""}" data-act="cd-order" data-v="shaky">Shakiest first</button>
        <button class="${CD.order === "shuffle" ? "on" : ""}" data-act="cd-order" data-v="shuffle">Shuffled</button>
      </div>
    </div>
  </div>`;

  if (!CD.deck) {
    el.innerHTML = `<div class="eyebrow">札 · Flashcards</div><h1>Go over what you know.</h1>
      <p class="lede">Pick a deck. Look, think, flip — then say whether you had it. “Again” sends a card to the back of the deck.
        It's your own pace, so it doesn't touch your reviews.</p>${picker}
      <div class="card empty">${neko("happy", "mini bob")}<p class="muted">Each deck holds what you've learned so far.</p></div>`;
    return;
  }
  if (CD.done) {
    const total = CD.got + CD.again;
    el.innerHTML = `${picker}<div class="card cd-end">
      <div class="celebrate">${neko(CD.again ? "happy" : "cheer", "hop")}${total && !CD.again ? stamp("よくできました") : ""}</div>
      <h2>${CD.keys.length ? "That's the deck." : "Nothing in this deck yet."}</h2>
      ${total ? `<p class="lede">${CD.got} straight away${CD.again ? `, ${CD.again} needed another look` : " — every one"}.</p>` : ""}
      <button class="btn cta" data-act="cd-deck" data-id="${CD.deck}">Go through it again</button>
    </div>`;
    if (total && !CD.again) petals($("#v-cards").closest("main") || document.body, 16);
    return;
  }
  const key = CD.keys[CD.i];
  const f = cardFaces(key);
  const front = CD.dir === "jp" ? f.jp : `<span class="cf-en">${f.en}</span>`;
  const back = CD.dir === "jp" ? `<span class="cf-en">${f.en}</span>${f.back}` : `${f.jp}${f.back}`;
  el.innerHTML = `${picker}
    <div class="cd-stage">
      <div class="cd-count">${CD.i + 1} / ${CD.keys.length}${CD.again ? ` · ${CD.again} again` : ""}</div>
      <div class="flashcard ${CD.flipped ? "flipped" : ""}" id="flashcard" role="button" tabindex="0" aria-label="Flashcard — tap to hear, hold to flip">
        <div class="fc-inner">
          <div class="fc-face fc-front">${front}<span class="fc-hint">${isPhone() ? "tap to hear · hold to flip · swipe for the next" : "click to hear · hold Space to flip · double-click for the next"}</span></div>
          <div class="fc-face fc-back">${back}</div>
        </div>
      </div>
      <div class="cd-btns">
        <button class="btn btn-ghost" data-act="cd-prev" ${CD.i ? "" : "disabled"} aria-label="Previous">${icon("back")}</button>
        ${CD.flipped
          ? `<button class="btn btn-ghost cd-again" data-act="cd-rate" data-v="again">Again <kbd>1</kbd></button>
             <button class="btn cd-got" data-act="cd-rate" data-v="got">Got it <kbd>2</kbd></button>`
          : `<button class="btn cd-flip" data-act="cd-flip">Flip <kbd>hold ␣</kbd></button>`}
        <button class="btn btn-ghost" data-act="cd-next" ${CD.i < CD.keys.length - 1 ? "" : "disabled"} aria-label="Next">${icon("chevron")}</button>
        <button class="btn btn-ghost" data-act="say" data-say="${esc(f.say)}" aria-label="Hear it">${icon("speaker")}</button>
      </div>
    </div>`;
  /* the deck strip scrolls on a phone — keep the chosen deck in sight */
  $(".cd-decks .on")?.scrollIntoView({ inline: "center", block: "nearest" });
  bindCardGestures();
}

/* ---------- touching the card ----------

   Tap (or click): hear it. Double-tap: the next card. Long-press: flip.
   Swipe left / right on a phone: next / previous. A tap waits a moment to
   see whether a second one follows, so a double-tap never plays the sound. */
const LONG_MS = 420, DOUBLE_MS = 260, SWIPE_PX = 56;

function stepCard(dir, how = "") {
  const n = CD.i + dir;
  if (n < 0 || n >= CD.keys.length) return;
  const card = $("#flashcard");
  if (card && how) {
    card.classList.add(dir > 0 ? "out-left" : "out-right");
    setTimeout(() => { CD.i = n; CD.flipped = false; renderCards(); }, 140);
    return;
  }
  CD.i = n; CD.flipped = false; renderCards();
}

function bindCardGestures() {
  const card = $("#flashcard");
  if (!card) return;
  let x0 = 0, y0 = 0, pressT = null, held = false, down = false;
  card.addEventListener("pointerdown", e => {
    down = true; held = false; x0 = e.clientX; y0 = e.clientY;
    clearTimeout(pressT);
    pressT = setTimeout(() => { held = true; flipCard(); }, LONG_MS);
  });
  card.addEventListener("pointermove", e => {
    if (!down) return;
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 12 || Math.abs(e.clientY - y0) > 12) clearTimeout(pressT);
    if (Math.abs(dx) > 12) card.style.transform = `translateX(${dx * .6}px) rotate(${dx / 40}deg)`;
  });
  const up = e => {
    if (!down) return;
    down = false;
    clearTimeout(pressT);
    card.style.transform = "";
    const dx = e.clientX - x0, dy = e.clientY - y0;
    if (held) return;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) { stepCard(dx < 0 ? 1 : -1, "swipe"); return; }
    if (Math.abs(dx) > 12 || Math.abs(dy) > 12) return;
    const now = Date.now();
    if (now - (bindCardGestures.lastTap || 0) < DOUBLE_MS) {
      clearTimeout(bindCardGestures.hearT);
      bindCardGestures.lastTap = 0;
      stepCard(1, "double");
      return;
    }
    bindCardGestures.lastTap = now;
    clearTimeout(bindCardGestures.hearT);
    bindCardGestures.hearT = setTimeout(() => say(cardFaces(CD.keys[CD.i]).say), DOUBLE_MS);
  };
  card.addEventListener("pointerup", up);
  card.addEventListener("pointercancel", () => { down = false; clearTimeout(pressT); card.style.transform = ""; });
  card.addEventListener("contextmenu", e => e.preventDefault());
}

function flipCard() {
  if (!CD.deck || CD.done) return;
  CD.flipped = !CD.flipped;
  if (CD.flipped && state.settings.autoplay) say(cardFaces(CD.keys[CD.i]).say);
  renderCards();
}

function rateCard(v) {
  if (!CD.flipped) return;
  if (v === "again") { CD.again++; CD.keys.push(CD.keys[CD.i]); } else CD.got++;
  day().n++;
  save();
  CD.i++;
  CD.flipped = false;
  if (CD.i >= CD.keys.length) CD.done = true;
  renderCards();
}

/* Keys while the Cards tab is up. Returns true if it took the key.
   Space held flips the card; a quick Space just says it. Enter is next. */
let spaceT = null, spaceHeld = false;
addEventListener("keyup", e => {
  if (e.key !== " " || view !== "cards" || !spaceT) return;
  clearTimeout(spaceT); spaceT = null;
  if (!spaceHeld && CD.deck && !CD.done) say(cardFaces(CD.keys[CD.i]).say);
});
function cardsKey(e) {
  if (view !== "cards" || S || !CD.deck || CD.done || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return false;
  if (e.key === " ") {
    e.preventDefault();
    if (e.repeat || spaceT) return true;
    spaceHeld = false;
    spaceT = setTimeout(() => { spaceHeld = true; flipCard(); }, 300);
    return true;
  }
  if (e.key === "Enter") { e.preventDefault(); stepCard(1); return true; }
  if (e.key === "1" && CD.flipped) { rateCard("again"); return true; }
  if (e.key === "2" && CD.flipped) { rateCard("got"); return true; }
  if (e.key === "ArrowRight") { stepCard(1); return true; }
  if (e.key === "ArrowLeft") { stepCard(-1); return true; }
  if (e.key === "r" || e.key === "R") { say(cardFaces(CD.keys[CD.i]).say); return true; }
  return false;
}

Object.assign(ACTS, {
  "cd-deck": el => startDeck(el.dataset.id),
  "cd-dir": el => { CD.dir = el.dataset.v; CD.flipped = false; renderCards(); },
  "cd-order": el => { CD.order = el.dataset.v; if (CD.deck) startDeck(CD.deck); else renderCards(); },
  "cd-flip": () => flipCard(),
  "cd-rate": el => rateCard(el.dataset.v),
  "cd-prev": () => stepCard(-1),
  "cd-next": () => stepCard(1),
});
