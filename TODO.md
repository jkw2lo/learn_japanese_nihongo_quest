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

## Next

4. **Furigana**: `js/furi.js` and its smoke checks, before any word data
   exists to get wrong.
5. **Words, stages 2–5**: word data, srs for words, Today, words audio,
   romaji→kana typing. Kana leave the review queue here (README → Kana).
6. **Menu side quest, tier 1** (katakana café).
7. **Conjugation**: `js/conj.js`, fixtures, the conjugate Sprint mode.
8. **Patterns, then kanji** (kanji stroke data from AnimCJK's graphicsJa),
   then the rest of N5 (stages 6–10).
9. Sync, N4.

## Later, maybe

- Placement, for someone who already reads kana (README → Placement).
- Sticky writing drills (Hanzi Quest's: once a kana has had one, keep
  giving it one until three land).
