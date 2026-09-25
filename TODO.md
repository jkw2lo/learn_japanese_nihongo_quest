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

## Next

6. **Menu side quest, tier 1** (katakana café): README → The side quest.
7. **Conjugation**: `js/conj.js`, fixtures, the conjugate Sprint mode, and
   the ます forms of the stage 5 verbs.
8. **Patterns, then kanji** (kanji stroke data from AnimCJK's graphicsJa;
   `knowsKanji` in words-ui.js starts returning true), then the rest of N5
   (stages 6–10).
9. Sync, N4.

## Smaller, from 0.4.0

- Sprint modes for words: 言葉 read and 書く type (README → Sprint).
- A missed word should drop a review onto the kana you got wrong.
- Word mistakes in Record's mistake notebook (it lists kana only).

## Later, maybe

- Placement, for someone who already reads kana (README → Placement).
- Sticky writing drills (Hanzi Quest's: once a kana has had one, keep
  giving it one until three land).
