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
  const picker = `<div class="cards-pick">
    <div class="seg cd-decks">${Object.entries(DECKS).map(([id, d]) => {
      const n = deckKeys(id).length;
      return `<button class="${CD.deck === id ? "on" : ""}" data-act="cd-deck" data-id="${id}" ${n ? "" : "disabled"}><span lang="ja">${d.jp}</span> ${d.en}<small>${n}</small></button>`;
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
      <button class="flashcard ${CD.flipped ? "flipped" : ""}" data-act="cd-flip" aria-label="Flip the card">
        <div class="fc-inner">
          <div class="fc-face fc-front">${front}<span class="fc-hint">tap to flip</span></div>
          <div class="fc-face fc-back">${back}</div>
        </div>
      </button>
      <div class="cd-btns">
        <button class="btn btn-ghost" data-act="cd-prev" ${CD.i ? "" : "disabled"} aria-label="Previous">${icon("back")}</button>
        ${CD.flipped
          ? `<button class="btn btn-ghost cd-again" data-act="cd-rate" data-v="again">Again <kbd>1</kbd></button>
             <button class="btn cd-got" data-act="cd-rate" data-v="got">Got it <kbd>2</kbd></button>`
          : `<button class="btn cd-flip" data-act="cd-flip">Flip <kbd>␣</kbd></button>`}
        <button class="btn btn-ghost" data-act="say" data-say="${esc(f.say)}" aria-label="Hear it">${icon("speaker")}</button>
      </div>
    </div>`;
  /* the deck strip scrolls on a phone — keep the chosen deck in sight */
  $(".cd-decks .on")?.scrollIntoView({ inline: "center", block: "nearest" });
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

/* Keys while the Cards tab is up. Returns true if it took the key. */
function cardsKey(e) {
  if (view !== "cards" || S || !CD.deck || CD.done || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return false;
  if (e.key === " " || e.key === "Enter") { e.preventDefault(); flipCard(); return true; }
  if (e.key === "1" && CD.flipped) { rateCard("again"); return true; }
  if (e.key === "2" && CD.flipped) { rateCard("got"); return true; }
  if (e.key === "ArrowRight") { if (CD.i < CD.keys.length - 1) { CD.i++; CD.flipped = false; renderCards(); } return true; }
  if (e.key === "ArrowLeft") { if (CD.i) { CD.i--; CD.flipped = false; renderCards(); } return true; }
  if (e.key === "r" || e.key === "R") { say(cardFaces(CD.keys[CD.i]).say); return true; }
  return false;
}

Object.assign(ACTS, {
  "cd-deck": el => startDeck(el.dataset.id),
  "cd-dir": el => { CD.dir = el.dataset.v; CD.flipped = false; renderCards(); },
  "cd-order": el => { CD.order = el.dataset.v; if (CD.deck) startDeck(CD.deck); else renderCards(); },
  "cd-flip": () => flipCard(),
  "cd-rate": el => rateCard(el.dataset.v),
  "cd-prev": () => { if (CD.i) { CD.i--; CD.flipped = false; renderCards(); } },
});
