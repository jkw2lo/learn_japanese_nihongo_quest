/* Nihongo Quest — where the kanji lessons go.

   A kanji is taught through a word you already know (README → Kanji), so
   each stage's kanji — the ones its words are the first to use — get
   lessons of five placed after that stage's words and patterns. Someone
   already past a stage meets its kanji next. */

const KANJI_BY = {};
KANJI.forEach(e => { e.key = "k:" + e.k; KANJI_BY[e.k] = e; });

(function placeKanjiLessons() {
  WORD_STAGES.forEach(S => {
    const ks = KANJI.filter(e => e.st === S.st);
    if (!ks.length) return;
    const lessons = [];
    for (let i = 0; i < ks.length; i += 5) {
      const n = i / 5 + 1;
      lessons.push({ id: `k${S.st}-${n}`, set: "w", st: S.st, kind: "kanji",
        title: `漢字 · ${ks.slice(i, i + 5).map(e => e.k).join("")}`, items: ks.slice(i, i + 5).map(e => e.key) });
    }
    let at = -1;
    WORD_LESSONS.forEach((L, i) => { if (L.st === S.st) at = i; });
    WORD_LESSONS.splice(at + 1, 0, ...lessons);
  });
})();
