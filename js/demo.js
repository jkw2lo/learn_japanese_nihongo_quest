/* Nihongo Quest — the demo, for visitors from Jen's portfolio (js/demo-welcome.js).

   The demo is the trailer's learner a few weeks in (tools/trailer/cam.mjs): every kana, about
   half the words, 60 kanji, most of the grammar, a shelf and a half of toys and six weeks of
   days, with katakana open and the introduction already read. So the games, the street and
   the café are all open, and nothing asks for setup. Start fresh puts the store back to empty. */

function demoLearner() {
  const t = today();
  KANA.forEach(e => learn(e.k));
  const ws = Object.keys(WORD_BY); ws.slice(0, Math.floor(ws.length * 0.55)).forEach(k => learn(k));
  Object.keys(KANJI_BY).slice(0, 60).forEach(k => learn(k));
  Object.keys(PATTERN_BY).slice(0, 28).forEach(k => learn(k));
  state.gacha.earned = 520; state.gacha.spent = 300;
  TOY_SETS[0].toys.forEach(x => state.gacha.owned[x.id] = 1);
  TOY_SETS[1].toys.slice(0, 7).forEach(x => state.gacha.owned[x.id] = 1);
  for (let i = 1; i < 45; i++) {
    const k = addDays(t, -i);
    if (i > 41 || i % 13 !== 6) state.days[k] = { n: 20 + (i * 7) % 30, ok: { r: [], p: [] }, learned: [], rev: [], ms: 600000 + (i * 37 % 11) * 90000 };
  }
  state.kataOpen = addDays(t, -30);
  state.seenGuide = true; state.seenSpell = true;
  MILESTONES.forEach(m => { if (m.test()) state.milestones[m.id] = addDays(t, -3); });
  save();
}

/* After the app's own boot, which loads the store (both wait for DOMContentLoaded). */
addEventListener("DOMContentLoaded", () => {
  if (!window.DemoWelcome) return;
  DemoWelcome.init({
    id: "nihongo-quest",
    name: "Nihongo Quest",
    accent: "#b83a2e",
    demo: "A learner a few weeks in: all the kana, half the words, the games and the street open.",
    fresh: "Begin at the very first lesson, with the introduction to the three scripts.",
    isEmpty: () => !localStorage.getItem("nihongo-quest") ||
      !(Object.keys(state.items).length || Object.keys(state.words).length),
    loadDemo: () => { demoLearner(); location.reload(); return new Promise(() => {}); },
    clear: () => { state = freshState(); save(); location.reload(); },
    /* a walk round what the demo learner has open, so a visitor isn't just dropped in */
    tour: [
      { go: () => go("today"), el: ["#v-today .hero", "#v-today .col-main"], title: "今日 Today",
        text: "Each day is one short list: a few new things to learn, then read, listen, say and write them. A task ticks only when every item in it is right." },
      { el: ["#v-today .col-rail"], title: "How far you've come",
        text: "Hiragana, katakana, words, kanji and grammar, counted up toward JLPT N5. This learner has every kana and about half the words." },
      { go: () => go("grammar"), el: ["#v-grammar .g-grid > :first-child", "#v-grammar"], title: "文法 Grammar you can see",
        text: "Each pattern is built only from words you already know, split into its parts. Tap any part to hear it." },
      { go: () => go("read"), el: ["#v-read .rd-rung", "#v-read"], title: "読む Reading that keeps up",
        text: "A ladder from words run together to subtitles at real speed, every rung made of words you know." },
      { go: () => go("games"), el: ["#v-games .gm-machine", "#v-games"], title: "遊ぶ Play, earn, collect",
        text: "Games like Ninja slice and Word search pay coins for the capsule machine, and every toy is named in Japanese. There are 220 coins here to spend." },
      { go: () => go("menu"), el: ["#v-menu .places", "#v-menu"], title: "街 Japanese in the wild",
        text: "Sushi counters, station signs, menus and shop talk, inked in as you learn. A place opens once you can sound out half its words." },
      { go: () => go("today"), el: [".top-nav", "#burger"], title: "Every section",
        text: "Kana, Words, Sprint, Cards, the Notebook and your Record are all here too." },
      { title: "Over to you",
        text: "Everything works: take a lesson, play a game, spend the coins. When you'd rather start as a new learner, Start fresh is at the bottom left." },
    ],
  });
});
