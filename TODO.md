# Still to do

Build order. Each step should run end to end before the next one starts.

## Done

1. ~~Settle the open questions~~: see **Decided** in README.md.
2. ~~Shell~~: design system, diag.js, askConfirm, crash panel, top bar and
   bottom nav, Settings → Version, backup, smoke.mjs with its CONTRACT list.
3. ~~Kana stage~~: hiragana and katakana, recognition and listening,
   look-alikes, っ/ッ/ー by word pairs, kana words, the hiragana check,
   Sprint, the kana chart, Record, audio.
   - ~~0.3.0~~: five new kana a day (lessons split to ≤ 5); the introduction
     to the three scripts and the chart; cards before each new kind of
     lesson; writing practice (trace → write from memory), marked on shape,
     with stroke order as an opt-in; AnimCJK stroke data. は / へ / を
     checked by ear.

4. ~~Furigana~~: `js/furi.js` (parse, check, render, derive kana) and its
   smoke checks, run over every string in the word and pattern data.

5. ~~Words, stages 2–5~~ (0.4.0): 103 words in lessons of five,
   read / hear / type drills, romaji→kana typing, furigana, the N5 audio
   bundle, solid kana retiring from reviews. Plus the Words library tab, and
   a–o / consonant labels on the kana charts.

6. ~~Menu side quest~~ (0.5.0): カフェ さくら (katakana, opens with
   katakana) and 食堂 まるや (kanji with furigana, after stage 5), the ordering
   game, the receipt with the total said in Japanese.
7. ~~Conjugation~~ (0.5.0): `js/conj.js` with fixtures for every class; the
   polite forms taught; a conjugate skill and drill; stage 6 (getting
   around) with eight verbs. Also 0.5.0: Today fits one desktop screen,
   tap-to-hear words, SVG icons in place of emoji, and the cat, hanamaru,
   stamps and petals.

8a. ~~Mobile, one-handed~~ (0.6.0): the round sections button and looping
   rolodex, the main button pinned bottom-left, answers at the foot, larger
   type and targets. Desktop checked identical before and after.

8b. ~~Patterns~~ (0.7.0) and ~~kanji~~ (0.8.0): 19 patterns with fill-the-gap
   and understand drills; 79 N5/N4 kanji taught through known words, read
   in a word, furigana dropping away as they're learned; the 漢字 chart;
   KANJIDIC2 readings, AnimCJK strokes.

8d. ~~Metrics and milestones~~ (0.10.0).

8c. ~~The rest of N5~~ (0.9.0): stages 7 買う, 8 毎日, 9 て形, 10 まとめ (92
   more words, 21 more patterns, 52 more kanji); adjectives conjugate; the
   て-form and casual forms join the drill as their patterns are learned.
   Also: the Grammar tab, flashcards, squarish word tiles on Today, audio
   split per stage at 24 kbps, dead CSS and code removed.

## Next

9. ~~Sync~~ (0.11.0): Firebase, lifted from Hanzi Quest, with a merge that
   loses nothing. ~~Out and about~~: nine real-life scenes beside the
   menus.
9b. ~~Notebook~~ (0.12.0): the 練習帳 writing workspace (box → Add to
   page, dated pages, pens, nibs, guides, tracing with stroke order).
   Pages could sync too (they're in IndexedDB, not the record).
10. **More recognition practice at N5**: more scenes (a train ticket, a
   bento label, a konbini's shelf tags, a clinic), a "spot the kanji you
   know" mode over the scenes, and scenes in Sprint.
11. **N4**: on hold. Staying at N5 for now.

## Smaller, from 0.4.0

- Sprint modes for words and conjugation: 言葉 read, 書く type, 活用 conjugate
  (README → Sprint).
- The menu's third tier: an izakaya board (本日のおすすめ).
- A missed word should drop a review onto the kana you got wrong.
- Word mistakes in Record's mistake notebook (it lists kana only).

## Later, maybe

- Placement, for someone who already reads kana (README → Placement).
- Sticky writing drills (Hanzi Quest's: once a kana has had one, keep
  giving it one until three land).
