# Nihongo Quest

A practice notebook for getting by in Japanese: reading hiragana and katakana,
reading the signs, menus and short messages you would actually meet, and
holding a simple conversation. It starts from nothing and runs to JLPT N5,
then on towards N4. Writing is there if you want it and never in the way if
you don't.

> **Status: the kana stage and word stages 2–6 are built (0.5.0).** An
> introduction to the three scripts, hiragana five a day, the hiragana check,
> katakana, look-alikes, the pauses and long vowels, and writing practice.
> Then 127 words in five stages (phrases, numbers and money, me and you,
> food, getting around), with furigana, typed answers and polite verb forms.
> There's a Words library, the Read a Menu side quest (a café and a diner),
> Sprint, Record and Settings, and the celebrations: the cat, the hanamaru,
> the teacher's stamps and falling petals. Words, kanji and grammar (stage 2
> onward) are still spec only — this README describes them so they can be
> built against it. Much of the reasoning is lifted from Hanzi Quest, where
> most of it was learned the hard way; where a decision came from there, it
> says so, so the original write-up can be looked up.

**Live at:** https://jkw2lo.github.io/learn_japanese_nihongo_quest/
**Repo:** https://github.com/jkw2lo/learn_japanese_nihongo_quest (`main`, over
SSH). GitHub Pages serves `main` directly: there's no build step and no CI,
so pushing is deploying. Bump the version on every push (see **Shipping a
change**), then check **Settings → Version** on the live site.

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

- **Five a day, a row at a time.** A lesson is one row (か き く け こ),
  learned together, because the row is what makes the pattern visible. No
  lesson is bigger than five: the voiced sounds are a row each, and the
  combined sounds are three-kana rows (きゃ きゅ きょ). A day's allowance is
  counted in kana (Settings → New kana a day, 5 by default, up to 20).
  Rows are never split, with one kana of slack so two three-kana rows can
  share a day. At five a day, hiragana takes 21 days and katakana about the
  same again.
- **Meet it, hear it, trace it.** Each new kana gets a card (the glyph, its
  sound, a picture story), then a tracing step with the shape faint in the
  box, and then reading and listening questions. Writing it from memory is
  one of the day's practice tasks. See **Writing**.
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
- **Kana leave the queue once words are open.** A kana that's solid in
  reading and hearing (three quick passes each) stops being scheduled on its
  own, and the words you read keep it fresh instead. One that isn't solid
  yet keeps coming up. (Still to do: dropping a review onto the kana behind a
  missed word.)
- **っ, ッ and ー are drilled by ear.** They have no sound of their own, so
  their lessons are an explanation card plus word pairs: hear きって or きて,
  pick the spelling (`KANA_PAIRS_WORDS`). びょういん (hospital) against
  びよういん (hair salon) is in there too, because it's a real trap.
- **Katakana through loanwords.** You learn コ, ー and ヒ, and the reward is
  コーヒー straight away. Guessing the English word is the fun bit (パソコン,
  アイスクリーム, コンビニ), and it's how katakana actually turns up in real life.
- **Real words from the first day.** `KANA_WORDS` is ~190 words spelled only in
  kana. A word shows up in *Words you can read* the moment every kana in it
  is learned — いえ (house) after the first row. Katakana words are mostly
  loanwords, so reading one is guessing the English, which is the fun part.

### The introduction

A brand-new learner doesn't know Japanese has three scripts, never mind why
a chart of kana looks the way it does. So before the very first lesson,
seven short cards (`js/guide.js`) explain:

1. **Three scripts, one sentence.** 私はコーヒーを飲みます, coloured by script:
   hiragana indigo, katakana plum, kanji ink.
2. **Hiragana**: the core sounds, used for grammar and words without kanji.
3. **Katakana**: the same sounds, for borrowed words, names and emphasis.
4. **Kanji**: characters with meanings, met later through words, with
   furigana until then.
5. **How the chart is laid out**: a consonant plus a vowel; vowels across,
   consonants down; a row shares a consonant, a column shares a vowel.
6. **Why that order**: it's Japanese alphabetical order (五十音, "the fifty
   sounds"), usually traced to Sanskrit phonetics. Vowels first, then
   consonants from the back of the mouth to the lips (h was once p); the
   gaps are sounds modern Japanese lacks.
7. **How this goes**: five a day, the check, then katakana, and romaji only
   while learning.

It can be read again from **Settings → Japanese writing**, and the Kana tab
opens with a short **How this chart works** card, open by default until ten
kana are learned. The first lesson of each new kind opens with its own card
(`KIND_INTRO`): the voiced marks ゛ and ゜, small ゃ ゅ ょ, katakana itself,
and the loanword sounds.

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
word lists, the romaji under each kana on the chart, and word cards.

The chart's **axes** are always labelled, whatever the setting: a i u e o
across the top, and the consonant at the start of each row (k, s, t… and
ky, sh, ch… for the combined sounds). They're how the chart is read, and a
new learner needs them most.

---

## Words

The scheduled core, from stage 2. Each word (`js/data/words.js`) has a
written form in furigana markup, a meaning, a part of speech, a stage, often
a note, and example sentences for many.

- **Words open when every kana is learned.** README's tiers open at 80%,
  but the kana stage is gated the whole way through (hiragana cemented
  before katakana), so words wait for the last kana too.
- **Five a day**, under the same **New kana a day** allowance, which counts
  words once kana are done. There are 127 words in five stages, in lessons of five:
  - **2 · あいさつ** survival phrases (24)
  - **3 · 数** numbers, time and money (29)
  - **4 · 私** me and you (25)
  - **5 · 食べる** food and ordering (25)
  - **6 · 行く** getting around (24): trains, stations, directions, eight
    verbs, and the particles に, で and へ

  Each stage opens with a card saying what it's for. The very first word
  lesson opens with one explaining furigana.
- **Meet it, then three drills.** A word card shows the word with furigana,
  its meaning, a note and any examples, all tappable to hear. Then:
  - `r` **read it**: see the word, pick the meaning
  - `p` **hear it**: hear it, pick the word
  - `c` **type it**: see the meaning, type it in romaji. It turns into kana
    as you type (`romajiToKana`), the way a Japanese keyboard does. Kanji
    conversion is left out on purpose: typing the kana spelling proves you
    know the word.

  Each is a separate skill, as in Hanzi Quest: you'll recognise 大丈夫 long
  before you can produce it. Today's practice for a word day is 学ぶ, 読む,
  聞く and 打つ; Go deeper gets three word tiles.
- **Typing is marked kindly.** It's right if the kana say the same thing
  (`kanaSame`). Script doesn't matter, so typing コーヒー as koohii is fine,
  and nor do ー against a doubled vowel or おお against おう. It's also right
  if the romaji matches the word's own, so こんにちは can be typed
  konnichiwa. **Hint** shows the first kana and the length, and turns the
  answer into practice, not credit.
- **Stored apart from kana.** Word items live in `state.words`, keyed
  `w:` + the written form, so nothing that walks the kana ever meets a word.
  They go through the same `grade()` and `dueKeys()`.
- **Spoken from kana.** Every word and example is recorded from its kana
  (`js/audio-n5.js`, loaded once words are open), so the voice never guesses
  a kanji's reading. A word can set `say` where its spelling misleads: the
  particle は is said わ.

Verbs get a fourth skill, `j` **conjugate it**: see the verb and a form,
and type the form. A verb's card shows its four polite forms, each tappable.
Every form is generated (`js/conj.js`), never typed into the data. See
**Conjugation**.

`s` (say it aloud and mark yourself) and `w` (write kanji) aren't built. See
**Open questions** and **Kanji**.

### Conjugation

`conj(markup, pos, form)` works a form out from the dictionary form and the
verb's class, and returns markup, so the result renders with furigana like
any word. The classes are:

- `v1` (ichidan)
- `v5` + the last kana (godan: `v5u` `v5k` `v5g` `v5s` `v5t` `v5n` `v5b` `v5m` `v5r`)
- `v5k-s` (行く, whose て-form is 行って)
- `vs` (する, and noun + する)
- `vk` (来る, whose kanji reading changes: 来ます is きます, 来ない is こない)

The forms are ます, ません, ました, ませんでした, て, た and ない. Only the four
polite ones are taught so far (`CONJ_TAUGHT`), because they're what a
visitor says. The smoke test pins every form of a verb for each godan
ending and each exception, and runs every verb in the data through every
form.

Every taught form of every verb is recorded, so the forms on a verb's card
and the answers to a conjugation question can all be played.

### The Words library

The **Words** tab lists **every word you can read**. It only grows: nothing
drops off the end the way Today's short list does.

- **Learned words**, grouped by stage, each opening a card with its note,
  examples and how it's doing in each skill.
- **Spelled in kana**: every word in `KANA_WORDS` whose kana are all yours,
  newest first. There are ~190, and the first arrives with the first row.
- **Filters** (All, Learned, ひらがな, カタカナ) and a **search** across kana,
  romaji and English.
- **Coming up**: how many kana words are still out of reach, and which
  single kana would unlock the most of them.

Tapping a word **just says it**. The › at the end of the row opens its
card. Today's rail works the same way: it shows the newest, scrolling in
place, with a link to the whole list.

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

Chinese barely needed a grammar track; Japanese does. Built
(`js/data/patterns.js`, `js/patterns-ui.js`), with 19 patterns for stages
3 to 6: 〜はいくらですか, 〜は〜です, じゃないです, か, の, この/その/あの, も,
〜が好きです, 〜をください, 〜を〜ます, ません, ました, に (going), で (by and at),
〜はどこですか, 〜に乗ります, and に for a time.

- **One pattern, one card**: the pattern, what it means, how it's built,
  and two or three example sentences, each tappable to hear.
- **Lessons come after the stage's words.** A stage's patterns get a lesson
  (four at most) placed right after its last word lesson, under the same
  daily allowance. Someone already past a stage meets its patterns next.
  The very first pattern lesson opens with a card on what particles are.
- **Examples only use what you know.** Every kanji in a pattern's examples
  must appear in a word from that stage or earlier, and the smoke test
  checks every one. Names are in katakana (スミスさん) for the same reason.
- **Two skills**, `f` and `r`:
  - **Fill the gap** (`f`). Each example marks its gap in the data
    (`{私|わたし}«は»{学生|がくせい}です。`), and the drill blanks it. For a
    particle, the wrong answers are the confusions people actually make
    first (は/が/も, に/で/へ, を/が), then others. For a form (ません/ました)
    or a word (この/これ), the pattern lists its own choices. The sentence
    can't be played until it's answered, because the sound gives the gap away.
  - **Understand it** (`r`): pick what a sentence means from other
    patterns' sentences.
- Patterns live in `state.patterns` (key `g:` + id) and go through the same
  scheduling as everything else. Today's list on a pattern day is 学ぶ,
  文型 fill the gaps and 文 understand them. Go deeper has a 文型 tile, and
  the Words tab lists **Patterns you know**, each opening to its examples.
- **Conjugations are generated in code**, never typed into the data. See
  **Conjugation** under Words.

Still to come: patterns for stages 7 and on (adjectives, the て-form and
more), and Sprint modes for conjugation and particles.

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
menus are mostly katakana**. Built (`js/data/menu.js`, `js/menu-ui.js`):

- **カフェ さくら**, a café, all katakana: 26 drinks, dishes and desserts.
  It **opens with katakana**, and each item inks itself in kana by kana as
  you learn them. Kana you don't know yet stay faint, so you can watch it
  fill up. Tapping something you can read says it and shows what it is;
  tapping something you can't says which kana you still need.
- **食堂 まるや**, a diner, is the real thing: 定食 set meals, bowls,
  noodles, sides and drinks, with kanji dish names and furigana. It opens
  once the food words (stage 5) are learned.
- **Ordering for a friend.** They say what they want in English, and you
  find it on the menu: three things, then the bill. A wrong tap tells you
  what you actually picked. The **receipt** shows each item, the total in
  yen, and, once the numbers stage is learned, the total **said in
  Japanese** (`numberKana`: 1250 → せんにひゃくごじゅう, with the sound changes
  a price meets). Then how you'd order each item: 〜をください.
- **Useful at the table**: すみません, 〜をください, お会計をおねがいします.
- It's practice: nothing here touches the review schedule. Orders are
  counted (`state.menu`), and Today shows them on the menu card.
- Each menu hangs a **noren**, the shop curtain over a Japanese doorway,
  drawn in SVG with the shop's name.
- The smoke test checks every item: sound markup, only taught kana,
  sensible prices, and a café that stays kana-only.

Still to do: the izakaya tier (本日のおすすめ).

---

## Today on one screen

On a desktop screen (wider than 900px and at least 620px tall), Today fits
without scrolling:

- the hero, compact
- **Today's practice** as one row of tiles, however many tasks there are
- **Go deeper** as one row, with a Words / Kana toggle once there are words
- the **Read a Menu** card
- in the rail, **Progress** as a small metric (a thin bar each for
  hiragana, katakana and words), then **Words you can read** filling the
  rest of the height and scrolling inside its own card

On a phone it all stacks and scrolls as usual.

## On a phone

Designed for a phone held in **one hand**. The bottom third of the screen
is where the thumb lives, so that's where the doing is. The top is for
reading, and for the rare Close, out of the way of a stray tap.

- **Sections** open from a round **button at the bottom right** (with the
  backup reminder dot when it's due). It opens a **rolodex**: a rounded
  capsule of round section buttons above it, scrolling sideways, snapping to
  the centre, and **looping** so it never runs out. It's Hanzi Quest's loop
  (porting.md C4): three copies back to back, with a silent jump back to
  the middle once scrolling settles. Settings and Backup live there too, so
  the top bar is just the name and the section you're in. The button sits
  outside `.topbar` on purpose: the header's `backdrop-filter` would make it
  the containing block for a fixed child (porting.md C3).
- **The one main button** of a screen (start today's session, start the
  check, start the sheet, take an order) is pinned **bottom-left**, 60px
  tall, beside the sections button. It's marked `.cta`, which does nothing
  on a desktop.
- **Questions**: the prompt sits in the middle of the top half, the verdict
  under it, and the answers are **large tiles at the foot** (78px, a 2×2
  grid), with a full-width Next under them. Answers never move when the
  verdict appears.
- **Writing**: the pad is as big as the screen allows (the full width,
  unless the height runs out first), with its four tools spaced out beneath
  it and Check at the foot.
- **Typing**: the input sits high up, where the keyboard won't cover it,
  and Enter on the phone's keyboard checks the answer.
- **Menu orders**: while an order is on, the request sticks to the top of
  the screen as you scroll the menu, and a finished order scrolls its
  receipt into view.
- **Sheets** get a big **Done** at the foot. **Confirmations** stack their
  buttons full width, with the safe choice at the bottom and the one that
  can't be undone above it.
- **Sizes**: 16px body text, targets of at least 48px, and neighbouring
  targets spaced so a thumb can't land on the wrong one. The rail's word
  list shows ten words; the Words tab has the rest. There's no sideways
  scroll anywhere, even at 320px.

**None of it touches a desktop.** Every phone rule lives in one
`@media (max-width: 720px)` block after the `PHONE LAYER` marker at the end
of `css/app.css`. A smoke check fails if anything after the marker sits
outside that block, if the phone-only pieces aren't hidden elsewhere, or if
the button moves inside the top bar. When this was built, a layout
fingerprint (every key element's position, size and font size on nine
desktop screens, from a seeded state) was taken before and after, and came
out identical.

## The drawings

Everything is inline SVG drawn with the colour tokens (`js/art.js`), so it
follows light and dark mode. There are **no emoji anywhere**: they look
different on every device and can't be themed, so every icon is a small
line drawing.

- **The cat**, the mascot, with moods: happy, cheer (arms up, sparkles),
  think, sleepy (done for the day), wow, and gambaru (a red headband —
  keep going).
- **The hanamaru** (花丸): the spiral flower a Japanese teacher draws in red
  pen round good work. It draws itself round the score when a round is 90%
  or better.
- **The stamps**, a teacher's red hanko: よくできました (well done) for new
  kana or words, 合格 (passed) for the hiragana check, 新記録 (new record) for
  a sprint best, ごちそうさま after a menu order, and 完 for a finished stage.
- **Sakura petals** drift down over the moments worth it: a lesson learned,
  a check passed (a shower when katakana opens), a stage finished, the
  day's whole list done (きょうは おわり！), a new best, a finished order.

Red here is the seal family (the teacher's pen and stamp are seals), which
is the one place the colour rules allow it. Motion respects
`prefers-reduced-motion`.

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
| **言葉 Words** | a word | pick the meaning | 2.4 | `r` | next |
| **書く Type words** | a meaning | type it in kana | 4.5 | `c` | next |
| **活用 Conjugate** | 食べる + て-form | type 食べて | 4.0 | pattern | with conjugation |

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

Built so far: `js/audio-kana.js`, 305 clips (every kana sound, every kana
word and pair, and the introduction's example sentence), 2.4 MB, fetched
after the first screen draws. `js/audio-n5.js` has 95 more (every stage word
and example not already in the kana bundle), about 1 MB, fetched once words
are open. Both add to one table (`window.NQ_AUDIO`), so they load in any
order. `make-audio.mjs` only records what's missing,
so adding a word takes seconds; `--all` re-records everything. Katakana plays
its hiragana twin's clip, and じ/ぢ and ず/づ share one, since they sound the
same. A lone kana is sometimes read as something else: は and へ on their
own could come out as the particles "wa" and "e". Checked by ear with Kyoko:
は says ha, へ says he, を says o. If a new voice gets one wrong,
`SPEAK_AS` in the script forces a spelling for that clip.

A smoke check walks every string the app can speak and fails if one has no
clip, the same check that caught 225 silent characters in Hanzi Quest.

---

## Writing

Writing is here as **reinforcement**. Drawing a shape with your own hand
makes it stick, whether or not the strokes come in textbook order. It's on
by default (Settings → Writing practice) and appears in three places:

- **Tracing**, straight after each new kana is introduced, with the model
  faint in the box. It's practice: it counts for the day, but not towards
  "solid".
- **書く Write them from memory**, one of Today's practice tasks. You get the
  sound and the romaji, and write the kana. It ticks when every one of
  today's kana has been written right.
- **Go deeper → 書く Write**, the ten shakiest, from everything learned.

Only single glyphs are written. きゃ is two kana you already write, and the
loanword pairs likewise. No sprint gives writing credit (from Hanzi Quest),
because nothing in a sprint asks you to draw.

**Show me** (`S`) animates the strokes in order in the box, then leaves the
model there faintly. Writing it after a peek counts as practice, not credit,
as in Hanzi Quest. A miss shows why and animates the model.

### How it's marked

`js/write.js` compares your strokes with the model's **median lines**, the
centre line of each stroke. Before comparing, it lines your drawing up with
the model by its box, because everyone writes off-centre and a little big
or small. Each stroke is resampled to 24 points, and two strokes match when:

- the mean distance between their points is small,
- neither **end** is far off (わ curls back where れ kicks out), and
- no **stretch** of four points is far off (the small loop that makes る
  not ろ).

Two modes, chosen in **Settings → Check stroke order** (off by default):

- **Off:** strokes may come in **any order**. Each model stroke is paired
  with its closest stroke of yours. Strokes still have to go the usual way
  round, top to bottom and left to right, because direction is the whole
  difference between ソ and ン, and between シ and ツ.
- **On:** stroke *i* has to be the model's stroke *i*, the right way round.

In both modes the **stroke count must be exact**. Allowing one more or
fewer let は pass for ほ and ば for ぼ.

The smoke test runs this against the real data. Every kana's own strokes
pass in both modes. Deliberately sloppy but right versions (shifted, scaled,
wobbly) pass about 97% of the time with order off and 99.7% with it on. And
18 look-alike pairs (ソ/ン, シ/ツ, れ/わ, は/ほ, る/ろ, ぬ/め, ば/ぱ …) must
fail against each other. What still passes for each other is either
identical in shape (へ/ヘ, べ/ベ), different only in size (っ/つ), or a
hiragana–katakana near miss (ナ/ヤ, コ/ユ).

### Stroke data

From **AnimCJK** (`graphicsJaKana.txt`), under the **Arphic Public License**
(the same licence as Hanzi Quest's Make Me a Hanzi data). The licence text
is in `licenses/animCJK/`, as it requires. `tools/fetch-strokes.mjs` builds
`js/strokes.js` (145 kana, 156 KB, loaded after the first screen).

AnimCJK cuts a stroke that loops over itself into overlapping pieces, for
its animations: あ came out as 4 strokes, ぬ as 4, の as 2. A piece ends
exactly where the stroke before it ends, so the fetch script merges pieces
back into one stroke. All 92 base kana now match the standard stroke counts,
which the smoke test pins.

Kanji stroke data is also in AnimCJK (`graphicsJa.txt`, 21 MB for all of
it). When kanji arrive, the fetch script should take only the ones taught.

---

## Placement

**Deferred.** For now the app assumes a brand-new learner who knows no
Japanese at all. That's why it opens with the introduction. When placement
comes, it works as in Hanzi Quest (*Placement*): go through the list **in order** and stop
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
kanji outside a `{…|…}` run, or on okurigana inside the braces
(`{食べ|たべ}る` should be `{食|た}べる`), or on a reading that isn't all
kana. `furiHtml(s, knows, mode)` shows a run bare only when *every* kanji
in it is known, so 今日 keeps its furigana until both 今 and 日 are yours.
Its modes are `auto`, `always` and `never`.

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
| stroke order | AnimCJK `graphicsJaKana.txt` | Arphic Public License | licence text in `licenses/animCJK/`; see **Writing → Stroke data** |
| example sentences | Tatoeba | CC BY 2.0 FR | a starting point; most will be written for the app so they only use known words |
| JLPT levels | community lists (e.g. Jonathan Waller's) | CC BY | there has been **no official JLPT list since 2010**; levels are a guide, not a spec |
| romaji → kana | wanakana | MIT | |
| speech | macOS `say` | Apple's terms | fine for personal study; same caveat as Hanzi Quest if it's published |

The share-alike licences mean that if this is published, the data files carry
attribution and stay under CC BY-SA. The code can still be licensed however
you like.

---

## Files

    index.html              page shell; the only place the version lives
    licenses/animCJK/       the stroke data's licence
    css/app.css             the design system (lifted from Hanzi Quest, retuned)
    js/diag.js              the recorder; loads first
    js/data/kana.js         lessons, kana, stories, look-alikes, kana words, pairs, romaji
    js/srs.js               scheduling, skills, days, the hiragana check, storage — no DOM
    js/sound.js             clips, the audio unlock, the fallback voice
    js/write.js             the writing pad, the stroke animation, the marking — no DOM in the marking
    js/app.js               Today, the kana chart, Record, sessions, settings, backup
    js/guide.js             the introduction and the new-kind cards
    js/sprint.js            the Sprint tab
    js/phone.js             the sections button and the rolodex (inert on a desktop)
    js/art.js               icons, the cat, the hanamaru, stamps, petals
    js/conj.js              verb conjugation, generated, never stored
    js/data/menu.js         the café and the diner; numbers as they're said
    js/menu-ui.js           Read a Menu and the ordering game
    js/audio-kana.js        generated clips — do not hand-edit
    js/strokes.js           generated stroke data — do not hand-edit
    js/furi.js              furigana markup: parse, check, render, derive kana
    js/data/words.js        stages 2–6: 127 words, their stages, lessons of five
    js/words-ui.js          word lessons and questions, typing, the Words library
    js/audio-n5.js          generated clips for the word stages — do not hand-edit

    not built yet (stubs, not loaded):
    js/data/kanji.js        kanji, taught through words
    js/data/patterns.js     grammar patterns with example sentences
    js/sync.js              optional sync
    tools/server.mjs        dev server, http://localhost:8732
    tools/version.mjs       bump the version and re-stamp every asset
    tools/smoke.mjs         contract, data, scheduling, allowance, the check, writing, audio, versions
    tools/make-audio.mjs    records the clips that are missing (macOS)
    tools/fetch-strokes.mjs builds js/strokes.js, merging AnimCJK's stroke pieces

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
- **Pace:** five new kana a day, more in Settings. Lessons were split so
  none is bigger than five.
- **Writing:** a reinforcement, marked on shape; stroke order is an opt-in
  setting. See **Writing**.
- **Placement:** skipped for now. The learner is assumed brand new, so the
  app opens with an introduction to the three scripts and the chart.
- **Hosting:** GitHub Pages, like Hanzi Quest.

## Open questions

- **Speaking.** Is `s` (say it, reveal, mark yourself) enough, or is it worth
  trying the browser's speech recognition where it's available?
- **Sync.** The Artifact `db` sync, as Hanzi Quest has, so progress follows
  you between devices?
