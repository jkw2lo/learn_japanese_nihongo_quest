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

## Next

8. **The rest of N5**:
   stages 7 買う shopping (adjectives), 8 毎日 daily life, 9 て-form, and
   10 the wrap-up. The て-form and plain forms are already generated.
9. Sync, N4.

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
