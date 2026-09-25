# Still to do

Build order. Each step should run end to end before the next one starts.

## Done

1. ~~Settle the open questions~~: Nihongo Quest; romaji hidden with a
   Settings switch; katakana only after the hiragana check (two separate
   days at 90%). Recorded under **Decided** in README.md.
2. ~~Shell~~: design system, diag.js, askConfirm, crash panel, top bar and
   bottom nav, Settings → Version, backup, smoke.mjs with its CONTRACT list.
3. ~~Kana stage~~: all hiragana and katakana lessons, recognition and
   listening, look-alikes, っ/ッ/ー by word pairs, kana words, the hiragana
   check, Sprint (read / listen / type), the kana chart, Record, audio.

## Loose ends from the kana stage

- **Listen to は, へ and を** in the bundled audio (Kana chart → tap them).
  A lone kana can be read as the particle; `SPEAK_AS` in
  tools/make-audio.mjs forces a spelling if one is wrong.
- **Kana writing**: needs stroke data. Verify AnimCJK's kana and N5/N4
  kanji coverage and licence (README → Writing), then fetch-strokes.mjs,
  check-strokes.mjs, and a 書く task on Today for the kana stages.
- **Placement** for someone who already reads kana (README → Placement).
- The combined-sound lessons are big (9–12 kana). Decide whether to split
  them (README → Open questions).

## Next

4. **Furigana**: `js/furi.js` and its smoke checks, before any word data
   exists to get wrong.
5. **Words, stages 2–5**: word data, srs for words, Today, words audio,
   romaji→kana typing. Kana leave the review queue here (README → Kana).
6. **Menu side quest, tier 1** (katakana café).
7. **Conjugation**: `js/conj.js`, fixtures, the conjugate Sprint mode.
8. **Patterns, then kanji**, then the rest of N5 (stages 6–10).
9. Sync, N4.
