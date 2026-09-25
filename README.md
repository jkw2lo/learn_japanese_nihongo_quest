# Nihongo Quest

A practice notebook for getting by in Japanese: reading hiragana and katakana,
reading the signs, menus and short messages you would actually meet, and
holding a simple conversation. It starts from nothing and runs to JLPT N5,
then on towards N4. Writing is there if you want it and never in the way if
you don't.

> **Status: the kana stage is built (0.2.0).** Hiragana, the hiragana check,
> katakana, look-alikes, the pauses and long vowels, real words to read,
> Sprint, Record and Settings all work. Words, kanji and grammar (stage 2
> onward) are still spec only — this README describes them so they can be
> built against it. Much of the reasoning is lifted from Hanzi Quest, where
> most of it was learned the hard way; where a decision came from there, it
> says so, so the original write-up can be looked up.

---

## What "getting by" means

It's worth pinning down, because it decides what gets left out.

**In scope**
- Read all of hiragana and katakana fluently, not just recognise them slowly.
- Read everyday things: a menu, a station sign, a price, a shop's opening
  hours, a short text message. That means the ~100 N5 kanji in the words they
  actually appear in, and a good part of N4's ~200 more.
- Say and understand survival phrases, then build simple sentences of your
  own: introduce yourself, order, ask the way, ask the price, talk about
  yesterday and tomorrow.
- Hear it. Every word and every sentence in the app can be played.
- Polite speech (です / ます) first, because it's what a visitor says to
  strangers. Plain forms come later, mostly so you can recognise them.

**Out of scope, deliberately**
- Keigo beyond set phrases (いらっしゃいませ gets explained, not drilled).
- Pitch accent as a drilled skill. It can be shown, but getting it wrong
  won't stop anyone understanding you, and drilling it costs a lot of time.
- Writing kanji from memory is **opt-in**. Writing kana is a real stage,
  because it's the fastest way to stop mixing up シ and ツ.
- Formal grammar vocabulary. A pattern is taught through the sentences
  it makes, and the grammar terms are only a note underneath.

---

## The unit you learn is the word

Hanzi Quest is built around one character per entry, and it works there
because in Chinese a character is a syllable with a meaning. None of that
holds in Japanese:

- A kana has a sound and no meaning. You learn it once and then use it.
- A kanji's sound depends on the word it's in. 生 is read せい in 学生, う in
  生まれる and なま in 生ビール. Learning 生 on its own gives you a list of
  readings to guess from.
- Most of what you need to get by is written wholly or partly in kana anyway:
  です, ありがとう, コーヒー, the endings on every verb.

So there are four kinds of thing to learn, and **the word sits in the middle**:

| | what it is | how many (to N4) | how it's learned |
|---|---|---|---|
| **かな Kana** | 46 + 46 base glyphs, plus voiced (が) and combined (きゃ) forms | ~210 | sound ↔ shape, fast, until automatic; then done |
| **言葉 Words** | vocabulary, each with its kana spelling and usual written form | ~1,500 | the scheduled core, like characters in Hanzi Quest |
| **漢字 Kanji** | a character learned through words you already know | ~300 | a step up from a word, never taught before one |
| **文型 Patterns** | grammar: 〜は〜です, 〜てください, 〜たことがある | ~150 | through example sentences made only of words you know |

The ordering rule that follows from this: **kana first, then words in kana,
then kanji as an upgrade to words you already have.** You learn たべる as a
word you can say and hear. Later 食 shows up as the way it's usually written,
with 食べ物 and 食堂 as the payoff. You never meet a kanji before a word that
uses it.

---

## Stages

A teaching order, as in Hanzi Quest: each stage should make the next one
easier. The contents will change, but the shape shouldn't.

| # | Stage | What unlocks |
|---|---|---|
| 0 | **ひらがな Hiragana**: vowels → k s t n → h m y r w → ん → voiced (が ぱ) → combined (きゃ) → small っ and long vowels | the hiragana check |
| — | **The hiragana check**: two separate days of proving it stuck (see below) | katakana |
| 1 | **カタカナ Katakana**, same order, then the loanword sounds (ティ, ファ) | **the Menu side quest** |
| 2 | **あいさつ Survival phrases**: hello, thanks, sorry, excuse me, please, I don't understand. All in kana, learned as whole chunks | |
| 3 | **数 Numbers, time, money**: いち→まん, 〜時, 〜円, いくらですか | prices on the menu |
| 4 | **私 Me and you**: は〜です, の, questions with か, この/その/あの | |
| 5 | **食べる Food and ordering**: を, 〜をください, 〜がいいです, the first verbs in ます form | first kanji: 日 月 人 口 |
| 6 | **行く Getting around**: に/へ/で, 〜はどこですか, directions, stations | 駅 出口 入口 on signs |
| 7 | **買う Shopping**: adjectives (い/な), これ/それ/あれ, 〜はありますか | |
| 8 | **毎日 Daily life**: time words, ます-form past and negative, frequency | |
| 9 | **て-form**: 〜てください, 〜ています, 〜てもいいですか | the second big grammar step |
| 10 | **N5 wrap-up**: plain forms (for recognition), 〜たい, 〜ましょう | tier 2 |
| 11+ | **N4 topics**: 〜たことがある, 〜と思う, potential, 〜たら/〜ば, giving and receiving | |

Stages 0–1 work differently from everything after them. See **Kana** below.

### Tiers

As in Hanzi Quest (*Tiers — the gates on the library*), tiers are doors
across the teaching order, set at points that mean something:

- **Tier 1 · Kana**: stages 0–1.
- **Tier 2 · N5**: stages 2–10.
- **Tier 3 · N4**: stages 11 on.

A tier opens at `TIER_UNLOCK` (80%) of the one before it. Placement credits
past the gate, and the unlock is worked out from what you know, so proving
you can read kana opens N5 without any special case. Locked stages collapse
to one card saying what opens them, rather than hundreds of grey squares.

---

## Kana

Kana is a set list you get through. It isn't a library you live in, so it
gets its own flow and doesn't go into the review queue:

- **Rows, not single glyphs.** A lesson is a row of five (か き く け こ),
  learned together, because the row is what makes the pattern visible.
- **Mnemonics are optional.** Each glyph has a short picture story (`story`,
  as in Hanzi Quest), shown on the first meeting and on a miss, and hidden
  otherwise.
- **Look-alikes are taught on purpose.** シ/ツ, ソ/ン, ぬ/め, わ/れ/ね, る/ろ,
  and は vs ほ. Each pair has a side-by-side card and its own drill, dealt
  after both halves are known. Hanzi Quest's 辨形 Spot-it mode, which deals
  look-alikes first, is the model.
- **Speed is the goal, and it's measured.** A glyph counts as known when it's
  recognised correctly *and* quickly, several times over. Being right slowly
  isn't enough, because reading slowly is still slow reading. This is where
  Sprint earns its place from day one.
- **Kana will leave the queue early, once words exist.** Today every kana
  stays on the review schedule. When stage 2 lands, a kana that's solid in
  reading and hearing stops being scheduled on its own, and every word you
  read keeps it fresh instead. A miss on a word will still drop a review onto
  the kana you got wrong.
- **っ, ッ and ー are drilled by ear.** They have no sound of their own, so
  their lessons are an explanation card plus word pairs: hear きって or きて,
  pick the spelling (`KANA_PAIRS_WORDS`). びょういん (hospital) against
  びよういん (hair salon) is in there too, because it's a real trap.
- **Real words from the first day.** `KANA_WORDS` is ~190 words spelled only in
  kana. A word shows up in *Words you can read* the moment every kana in it
  is learned — いえ (house) after the first row. Katakana words are mostly
  loanwords, so reading one is guessing the English, which is the fun part.

### The hiragana check

Katakana doesn't open when the last hiragana is learned. Hiragana has to be
**cemented** first, and the evidence for that is time:

- From the day *after* the last hiragana is learned, a **check** is offered:
  every hiragana once to read, the twenty shakiest to hear, four pause pairs
  and eight real words, about 136 questions and six or seven minutes.
- It passes at **90% right first time** (`HIRA_CHECK.pass`). Misses come back
  at the end of the check for practice, but only first tries count.
- It has to pass on **two separate days** (`HIRA_CHECK.days`). Two passes on
  one day count once. The day hiragana finished never counts, so there is
  always at least one night's sleep in between.
- There's no limit on tries. A failed try shows the best score so far.
- It's graded "auto": anything due for review is reviewed by the check, so
  check days don't also carry a separate review pile.
- Once katakana opens it stays open (`state.kataOpen`), even if the rules change.

On the day the last hiragana is learned, Today says the check starts
tomorrow and suggests Go deeper or a hiragana sprint instead. It doesn't
offer a check that couldn't count.

### Romaji

Romaji is **hidden by default** and switched on in **Settings → Show romaji**.
It's hidden so your eyes learn to read the kana, not the letters under
them. Kana lessons always show it, because that's what they teach, and so do
a question's answers and verdicts. The setting governs everything else: the
word deck, the chart and (later) word cards.
- **Katakana through loanwords.** You learn コ, ー and ヒ, and the reward is
  コーヒー straight away. Guessing the English word is the fun bit (パソコン,
  アイスクリーム, コンビニ), and it's how katakana actually turns up in real life.

---

## Words

The scheduled core. Each word has a written form, its kana spelling, a
meaning, a part of speech, a stage, and one example sentence or more.

- **Skills are tracked separately**, as in Hanzi Quest:
  - `r` read it: see the written form, pick the meaning
  - `p` hear it: hear it, pick the word
  - `s` say it: see the meaning, say it aloud, reveal, mark yourself honestly
  - `c` recall it: see the meaning, type it
  - `w` write it, for kana, and for kanji only if you've opted in

  They're separate knowledge: you'll recognise 大丈夫 long before you can
  produce it.
- **Typing is in kana, from romaji.** You type `taberu` and get たべる, the way a
  Japanese keyboard on a phone or laptop works. It's the direct counterpart of
  Hanzi Quest's pinyin 打字 input (probably via wanakana, MIT). Kanji
  conversion is left out on purpose: at this level, typing the kana spelling
  proves you know the word.
- **"Words you can read"** carries over directly: every word whose kana and
  kanji are all already yours, newest first.

### Reading never outruns you, now with furigana

Hanzi Quest's rule is *never show a sentence with a character you haven't
met* (`readingMaterial()`). Japanese has a better tool for this, and real
children's books use it: **furigana**, small kana printed over a kanji.

When the app draws any Japanese text:

- A kanji you **know** is shown bare.
- A kanji you **don't know yet** gets furigana, so you can still read the
  word and start seeing the kanji before it's taught.
- A **word** you don't know yet is never in a drill sentence. Sentences for a
  drill are picked so that every word in them is known. That's the part of
  the Hanzi Quest rule that still applies.

So the same sentence gets lighter as you go. The menu uses the same rendering.
Settings has "always show furigana" and "never show furigana" for anyone who
wants them.

This depends on how readings are stored. See **Furigana markup** under Data.

---

## Kanji

Kanji are a layer over words, never the way in.

- **A kanji unlocks when a word that uses it is known.** It's taught through
  that word: "you know たべる; this is how it's written: 食べる." The card
  then shows the kanji's other words that are already known or coming soon.
- **Readings are shown, never drilled as a list.** Reciting "ショク, た.べる"
  helps nobody get by. What gets drilled is reading the kanji *in a word*:
  食堂 → しょくどう. The on and kun lists sit on the card as reference.
- **Parts and stories carry over from Hanzi Quest** (`comp`, `story`, and the
  character pictures), but lightly. There are ~300 kanji, not 1,000, and
  this app doesn't need a Radicals tab. The Kanji tab shows the parts inline.
- **Writing is opt-in** (Settings → Writing → Kanji). Kana writing is on by
  default, but only in the kana stages.

---

## Patterns (grammar)

This is the new part. Chinese barely needed a grammar track; Japanese does.

- **One pattern, one card.** `〜てください` is "please do ~": a meaning, a
  short note on how it's built, and three to five example sentences.
- **Example sentences follow the reading rule.** A pattern's examples are
  filtered to words you know, and the pattern isn't offered until at least
  two examples qualify. That's `readingMaterial()` again, applied to grammar.
- **Particles get a fill-in-the-gap drill.** 私＿学生です → は. This is where
  most real beginner mistakes happen (は/が, に/で, を), so the particle
  drill is its own practice row.
- **Conjugations are generated in code, never typed into the data.** Each
  verb is tagged `v1` (ichidan), `v5` (godan, with the ending) or `irr`
  (する, くる, and 行く's て-form). `js/conj.js` produces ます, ません,
  ました, ませんでした, て, た, ない, and later potential, volitional,
  ば and たら.
  A fixture table in `tools/smoke.mjs` pins the output for a set of verbs
  chosen to cover every godan ending and every exception. Typing 1,500 forms
  by hand is how data drifts. Hanzi Quest's component checker found 32 of 302
  hand-written claims wrong, and this is the same risk.
- **Conjugation is a Sprint mode.** Verb + target form → type it. It's minute
  math in its purest form.

---

## Today

The daily loop, lifted almost whole from Hanzi Quest (*The blocks on Today*,
*What the numbers count*, *Go deeper is not part of the list*).

1. **The invitation**: the session, and what you've picked up today.
2. **Today's practice**: a to-do list scoped to *today's* items, so it's
   short and can be finished:
   学ぶ learn · 読む read · 聞く listen · 話す say · 文型 today's pattern ·
   書く write (kana stages, or if opted in).
   A tick needs evidence: a task ticks when every one of today's items has
   been answered correctly in that task's drill. Each task declares which
   drill kinds prove it (`proves`). A task that can't be done yet shows a
   lock and a reason, and the count reads `2 of 4 done · 1 locked`. The locked
   task stays in the total rather than being dropped from it.
3. **Go deeper**: the same skills over everything you know, shakiest first,
   with rings that fill on every clean pass (`PASSES_FOR_SOLID` = 3). It's
   extra practice, so it can never make tomorrow's reviews worse: a right
   answer doesn't push the next review back, and a miss still brings one
   forward (`grade(..., {practice: true})`).
4. **Read a Menu**: the side quest.

Every number on Today counts items, never answers, for the reason Hanzi
Quest's *What the numbers count* gives.

---

## The side quest: Read a Menu

Hanzi Quest's menu teaches one character a day from a real restaurant menu,
with the glyphs you know inked in. It carries over well, because **Japanese
menus are mostly katakana**: カレーライス, ハンバーグ, オムライス, ビール.

- It **opens after the katakana stage**, and on day one you can already read
  half of it. No other part of the app pays off that quickly.
- **Items are words, not glyphs.** A dish is readable when every word in it
  is. Kanji dishes (焼き鳥, 生ビール, 定食) show with furigana until their
  kanji are known, following the same furigana rule.
- **Tiers:** a café menu (katakana plus prices) → a 定食 diner (kanji dish
  names) → an izakaya board (handwritten-style specials, 本日のおすすめ).
- **Ordering phrases come with it**: すみません, 〜をください, 〜をひとつ,
  お会計お願いします. Reading the menu and ordering from it are one skill.
- As in Hanzi Quest, a smoke check makes sure every word on every menu tier
  is one the library teaches.

---

## スプリント Sprint

Lifted as a whole from Hanzi Quest's 速练 (*minute math, for characters*):
a fixed number of questions in a fixed number of minutes. Nothing is marked
until you hand in, the sheet is built before the clock starts, a miss never
touches your review schedule (`grade(..., {speed: true})`), and cards are
dealt from a shuffled deck, not drawn at random.

| mode | given | you do | par (s/q) | credits | built |
|---|---|---|---|---|---|
| **読む Read** | a kana | pick its romaji | 1.5 | kana `r` | ✓ |
| **聞く Listen** | a sound | pick the kana | 2.5 | kana `p` | ✓ |
| **打つ Type** | a kana | type its romaji (`si` for し is fine) | 2.5 | kana `r` | ✓ |
| **言葉 Words** | a word | pick the meaning | 2.4 | `r` | stage 2 |
| **書く Type words** | a meaning | type it in kana | 4.5 | `c` | stage 2 |
| **活用 Conjugate** | 食べる + て-form | type 食べて | 4.0 | pattern | stage 2 |

Each sheet can be hiragana, katakana or both, 20–100 questions, 1–5
minutes. Only a **finished** sheet can set a best: finishing comes first,
then accuracy, then time. A sheet that would loop through its kana more
than six times is offered disabled.

It keeps the boards (a best score per sheet: the mode, the count and the
minutes), the speed grades from the ratio to par, and the mistake notebook
(間違いノート), which collects what you keep missing.

---

## Audio

Hanzi Quest's lessons apply (*Audio*): don't trust `speechSynthesis`, bundle
real clips, load the bundle after the first render, prime one shared
`<audio>` element on the first click, and keep the `audioOwner` guard. The
change:

**Words and sentences are recorded whole.** Hanzi Quest says a word by
playing its characters' clips one after another. That works because each
character has one sound, and it can't work here: a kanji's sound depends on
the word, and kana stitched together sounds robotic and gets the pitch wrong.
So `tools/make-audio.mjs` records, with macOS `say -v Kyoko`:

- every kana on its own (`あ`, `きゃ`), for the kana stages
- every word, from its **kana** spelling, so the voice can't pick the wrong
  reading for a kanji
- every example sentence, also from kana

The kana rule matters most for sentences, because a text-to-speech voice
reading 今日 has to guess between きょう and こんにち, and sometimes guesses
wrong. Rough size at N4: 1,500 words and about 1,500 sentences, a few
seconds each. That's several times the Hanzi Quest bundle, so it's **split
per tier** (`audio-kana.js`, `audio-n5.js`, `audio-n4.js`), each fetched only
when that tier opens.

Built so far: `js/audio-kana.js`, 304 clips (every kana sound, every kana
word and pair), 2.4 MB, fetched after the first screen draws. Katakana plays
its hiragana twin's clip, and じ/ぢ and ず/づ share one, since they sound the
same. A lone kana is sometimes read as something else: は and へ on their
own could come out as the particles "wa" and "e". **Listen to は, へ and を
after a regenerate.** If one is wrong, `SPEAK_AS` in the script forces a
spelling for that clip.

A smoke check walks every string the app can speak and fails if one has no
clip, the same check that caught 225 silent characters in Hanzi Quest.

---

## Writing

Hanzi Quest's handwriting design carries over: sticky writing drills (three
landed in a short window beats one a month), the trackpad mode, "show me the
strokes", and the notebook page. So does the rule that no sprint gives
handwriting credit.

**Stroke data** needs a new source. Make Me a Hanzi is Chinese forms only.

- **AnimCJK** has Japanese kanji and kana in a format like Make Me a Hanzi's,
  which hanzi-writer can load as custom data. *To verify: coverage of the N5
  and N4 kanji, the kana, and the licence terms.*
- **KanjiVG** (CC BY-SA 3.0) is the standard source for Japanese stroke
  order, but it's SVG paths without the median lines hanzi-writer needs to
  grade a stroke. It's the fallback, or a source to check the other against.

`tools/check-strokes.mjs` is carried over in spirit: every bundled glyph is
checked against its source.

---

## Placement

As in Hanzi Quest (*Placement*): go through the list **in order** and stop
after `PLACE_MISS_LIMIT` misses. Nothing is sampled or inferred, and an item
is credited only if it was answered correctly. The quiz goes kana first, then
the N5 words stage by stage, so someone who already reads kana skips two
stages in about three minutes.

---

## Carried over from Hanzi Quest

Each of these has a section in the Hanzi Quest README explaining where it
came from, and each should be reused as it is unless it's listed under
**Changed** below.

**As is**
- One-page static app, no build step, served by GitHub Pages. Pushing is
  deploying.
- `?v=` version stamps and `tools/version.mjs`. Bump on every push, and
  check Settings → Version on the live site.
- `tools/smoke.mjs` with a `CONTRACT` list of every name that crosses a file
  boundary, because four scripts sharing one global scope fail only when
  something is clicked.
- `askConfirm()`, never `window.confirm()`. It silently returns false in a
  sandboxed frame.
- The progress model: `localStorage` → optional sync → a 💾 backup button in
  the top bar that gets a dot once there's progress worth losing.
- `js/diag.js`, the recorder that loads before everything else, plus crash
  guards and Report a problem.
- When lists merge, they merge **as lists**. B1 in Hanzi Quest's porting notes
  was a list being merged like a map and corrupting saved state, so the fix
  (`asList`) goes in from the start.
- Auto-advance after a right answer and never after a wrong one. The
  question timer is advisory, and running out costs nothing.
- Keyboard: `1`–`9` answer, `space` moves on, `esc` leaves; four answer tiles
  across from 820px, two across on narrow phones.
- The design system in `css/app.css`: fonts, colour rules (completion is
  always green; red only for the seal and today's target) and the mobile
  layout.

**Changed**
- **The unit**: characters → words, with kana before them and kanji on top.
- **Audio**: stitched characters → whole-word and whole-sentence clips.
- **Readings**: one pinyin string → aligned furigana (see Data).
- **Typed input**: pinyin IME → romaji-to-kana.
- **Tone marks** → none. Pitch accent may be shown later, but it isn't drilled.
- **Radicals tab** → dropped. Parts are shown on the kanji card.
- **Component checker** → becomes a check that every word is spelled with
  kana and kanji the library actually teaches, plus the conjugation fixtures.

**Left behind, for now**
- Songs (and their copyright constraint), seasonal words, and the word of the
  week. All worth revisiting once the core works.

---

## Data

Everything the app teaches lives in `js/data/`, one file per kind, all plain
script globals like Hanzi Quest's `data.js`.

### Furigana markup

Readings are **aligned when the data is written, not worked out later.** A
word's kana spelling can't be reliably split back across its kanji: where
does 食べ物 split between た, べ and もの? So every Japanese string that
contains kanji marks each kanji run with its reading:

    {食|た}べ{物|もの}
    {今日|きょう}は{天気|てんき}がいいですね。

- `{kanji|kana}` covers the smallest run that has a single reading. Special
  readings (今日, 大人, 一人) stay as one run, because their kana belong to the
  word, not to each character.
- Kana-only text needs no markup at all.
- `js/furi.js` parses it once and renders it as `<ruby>` or as bare kanji,
  depending on what you know. That's the furigana rule above.
- The kana spelling, used for audio and typed answers, is **derived** by
  taking the kana side of each run. It's never stored separately, so it can't
  disagree with the markup.

A smoke check parses every string and fails on anything unbalanced, or on a
kanji outside a `{…|…}` run.

### Shapes

```js
// js/data/kana.js
{k:"か", r:"ka", set:"h", row:"k", story:"A blade with a cut beside it — ka!"}
{k:"カ", r:"ka", set:"k", row:"k", story:"The same blade, sharper."}
{k:"きゃ", r:"kya", set:"h", row:"ky"}

// js/data/words.js — the core
{w:"{食|た}べる", m:"to eat", pos:"v1", st:5,
 ex:[["パンを{食|た}べます。", "I eat bread."]]}
{w:"コーヒー", m:"coffee", pos:"n", st:1, from:"coffee"}
{w:"{行|い}く", m:"to go", pos:"v5k", irr:"te", st:6}   // 行って, not 行いて

// js/data/kanji.js — the layer on top
{k:"食", m:"eat; food", on:["ショク"], kun:["た.べる"], comp:["人","良"],
 story:"…"}   // the words that use it are found from words.js, never listed here

// js/data/patterns.js
{id:"te-kudasai", pat:"〜てください", m:"please do ~", st:9,
 note:"The て-form of a verb, then ください.",
 ex:[["ちょっと{待|ま}ってください。", "Please wait a moment."]]}

// js/data/menu.js
{tier:1, sec:"ドリンク", items:[["コーヒー", 400], ["ビール", 550]]}
```

Two rules from Hanzi Quest's *Auditing the data itself* carry straight over:
a word that appears in two places must agree with itself, and nothing on the
screen may give the answer away (an example sentence shown with a "what does
this mean" question must not contain the English gloss).

---

## Sources and licensing

| what | source | licence | notes |
|---|---|---|---|
| word meanings, readings, parts of speech | JMdict (EDRDG) | CC BY-SA 4.0 | for checking and filling gaps; hand-edited glosses are shorter |
| kanji readings and meanings | KANJIDIC2 (EDRDG) | CC BY-SA 4.0 | |
| stroke order | AnimCJK, or KanjiVG | to verify / CC BY-SA 3.0 | see **Writing** |
| example sentences | Tatoeba | CC BY 2.0 FR | a starting point; most will be written for the app so they only use known words |
| JLPT levels | community lists (e.g. Jonathan Waller's) | CC BY | there has been **no official JLPT list since 2010**; levels are a guide, not a spec |
| romaji → kana | wanakana | MIT | |
| speech | macOS `say` | Apple's terms | fine for personal study; same caveat as Hanzi Quest if it's published |

The share-alike licences mean that if this is published, the data files carry
attribution and stay under CC BY-SA. The code can still be licensed however
you like.

---

## Files (planned)

    index.html              page shell; the only place the version lives
    css/app.css             the design system (lifted from Hanzi Quest, retuned)
    js/diag.js              the recorder; loads first
    js/data/kana.js         lessons, kana, stories, look-alikes, kana words, pairs, romaji
    js/srs.js               scheduling, skills, days, the hiragana check, storage — no DOM
    js/sound.js             clips, the audio unlock, the fallback voice
    js/app.js               Today, the kana chart, Record, sessions, settings, backup
    js/sprint.js            the Sprint tab
    js/audio-kana.js        generated clips — do not hand-edit

    not built yet (stubs, not loaded):
    js/data/words.js        vocabulary, by stage
    js/data/kanji.js        kanji, taught through words
    js/data/patterns.js     grammar patterns with example sentences
    js/data/menu.js         the side quest's menus, by tier
    js/furi.js              furigana markup: parse, render, derive kana
    js/conj.js              verb and adjective conjugation (generated, never stored)
    js/sync.js              optional sync
    js/strokes.js           generated stroke data
    tools/server.mjs        dev server, http://localhost:8732
    tools/version.mjs       bump the version and re-stamp every asset
    tools/smoke.mjs         contract, data audits, scheduling, the check, audio, versions
    tools/make-audio.mjs    records the clips (macOS)
    tools/fetch-strokes.mjs builds js/strokes.js
    tools/check-strokes.mjs checks the bundle against its source

Port 8732, so it can run next to Hanzi Quest on 8731.

## Running it

    node tools/server.mjs         # open http://localhost:8732

No build step. `js/audio-kana.js` is generated. If it's missing, run
`node tools/make-audio.mjs` (macOS, about three minutes). Without it the app
still works, and the listening drills are hidden.

## Shipping a change

    node tools/smoke.mjs
    node tools/version.mjs patch
    git add -A && git commit && git push

Run the checks first, not last, and bump the version every time.

---

## Decided

- **Name:** Nihongo Quest, with 日 as the seal.
- **Romaji:** hidden by default, with a switch in Settings. See **Romaji** under Kana.
- **Katakana order:** after hiragana, and only once hiragana has passed the
  check on two separate days. See **The hiragana check**.

## Open questions

- **Speaking.** Is `s` (say it, reveal, mark yourself) enough, or is it worth
  trying the browser's speech recognition where it's available?
- **Sync and hosting.** GitHub Pages like Hanzi Quest (the repo name is to be
  decided), with the Artifact `db` sync as an option?
- **Lesson size.** The combined-sound lessons are 9–12 kana each, and a day
  with two of them plus reviews runs past 100 cards. Split them, or leave it
  to the lessons-per-day setting?
