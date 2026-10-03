# Nihongo Quest

A practice notebook for getting by in Japanese: reading hiragana and katakana,
reading the signs, menus and short messages you would actually meet, and
holding a simple conversation. It starts from nothing and runs to JLPT N5,
then on towards N4. Writing is there if you want it and never in the way if
you don't.

> **Status: all of N5 is built (0.13.0).** The kana stage, then 219 words
> in nine stages (phrases, numbers and money, me and you, food, getting
> around, shopping, daily life, the て-form, and an N5 wrap-up), 40 grammar
> patterns, 131 kanji (74 N5, 57 N4) taught through the words, verbs and
> adjectives conjugated, a Grammar reference tab, flashcards, Out and about
> (menus, station signs and announcements, shop, door and road signs, a
> receipt, shop talk, asking for things and the way, casual Japanese,
> compliments), a 練習帳 Notebook for free writing, Sprint, Record with milestones, and optional sync across
> devices through Firebase.

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
- **Words are part of every kana lesson, not just Go deeper.** A lesson
  ends with *Now you can read*: up to six words its kana have just made
  readable (`SPELL_MAX`), as tiles side by side, each taken apart
  (い i + え e = いえ ie, house), each kana tappable — then every one of
  them read in a question, so none is left to find on the Words tab. Words already sounded out in an earlier lesson come last
  (`state.spelled`). Today's practice on a kana day adds 言葉 *Read the
  words they spell*.
- **Why あい is spelled あい: it isn't, beyond its sound.** Kana are letters.
  Nothing in あ or い means love, any more than c, a and t mean cat. The
  first *Now you can read* card says so, and so does the introduction's
  hiragana card. Two things help instead (`KANA_WORD_EXTRA`): `kj`, the
  kanji a native word is usually written in, shown small as the place its
  meaning actually lives (あい → 愛), and `hook`, a sound-alike to tie sound
  to meaning (ねこ: a cat curled round your neck), only where there's a
  good one.

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
  words once kana are done. There are 219 words in nine stages, in lessons of five:
  - **2 · あいさつ** survival phrases (24)
  - **3 · 数** numbers, time and money (29)
  - **4 · 私** me and you (25)
  - **5 · 食べる** food and ordering (25)
  - **6 · 行く** getting around (24): trains, stations, directions, eight
    verbs, and the particles に, で and へ
  - **7 · 買う** shopping (26): い- and な-adjectives, colours, ある and いる
  - **8 · 毎日** daily life (26): everyday verbs, how often, と, から, まで
  - **9 · て形** the て-form (20): the verbs you ask people to do
  - **10 · まとめ** wrapping up N5 (20): weather, feelings, the calendar

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
  (`js/audio-s2.js` … `audio-s10.js`, one per stage), so the voice never guesses
  a kanji's reading. A word can set `say` where its spelling misleads: the
  particle は is said わ.

Verbs and adjectives get a fourth skill, `j` **conjugate it**: see the
word and a form, and type the form. The forms drilled grow as you go: the
four polite ones from the start (〜ます… or 〜いです, 〜くないです…), the
て-form once 〜てください is learned, and the casual た and ない forms after
stage 10's casual-forms pattern. A verb's card shows its four polite forms, each tappable.
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

Words are **tiles**, as many across as fit (two on a phone), not a line
each, so the list stays short as it grows. A word of six or seven kana is
set smaller; a phrase of eight or more (おはようございます) gets a
double-width tile so it reads in one line. Tapping a word **just says it**.
The › in its corner opens its card. Today's rail works the same way: it shows the newest, scrolling in
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

Kanji are a layer over words, never the way in. Built (`js/data/kanji.js`,
generated; `js/data/kanji-lessons.js`; `js/kanji-ui.js`).

- **Which kanji:** the 131 in the stage words that are N5 (74) or N4 (57).
  KANJIDIC's `jlpt` field is the old four-level test, where 4 ≈ N5 and 3 ≈ N4.
  Rarer ones (丈夫, 全部, 卵, 昨…) keep their furigana for good.
- **Each is taught through a word you know.** A stage's kanji, the ones its
  words are first to use, get lessons of five placed after that stage's
  words and patterns, in the order those words are taught (so the numbers
  come out 一 二 三). The smoke test checks that every kanji has a word by
  its stage to be taught through. The first kanji lesson opens with a card
  on on and kun readings.
- **The card:** the kanji, its meaning, its readings (on in katakana, kun in
  hiragana with the okurigana in brackets: た(べる)), its strokes (tap to
  animate), and **the words you know that use it**, each tappable.
- **Once learned, its furigana goes, everywhere.** `knowsKanji()` is what
  `furiHtml()` asks, so words, sentences, patterns, the Words tab and the
  diner menu all drop the reading for a kanji you know. A run keeps its
  furigana until every kanji in it is known (今日 needs both).
- **Readings are shown, never drilled as a list.** Reciting "ショク, た.べる"
  helps nobody get by. There are two skills:
  - `m` **what it means**: pick from other kanji's meanings.
  - `y` **read it in a word**: a word you know, with this kanji's part of
    it bare and highlighted ("How is 高 read here?" → たか). The wrong
    answers are the kanji's own other readings first (こう), then other
    words' kanji readings of the same length that share the most kana.
    Asking about the kanji's part, not the whole word, means a set phrase
    can't give itself away by length.
- **Writing is opt-in**: Settings → Write kanji too, off by default. With it
  on, each new kanji gets a trace and Today gets a 書く task. The writing
  marker is the same as for kana; the stroke data is AnimCJK's
  `graphicsJa.txt`, and every kanji's stroke count matches KANJIDIC's
  (checked by the smoke test).
- **Where they show up:** Today's list on a kanji day (学ぶ, 意味, 読み, and
  書く if on), a 漢字 tile in Go deeper, rows in Record, and a **漢字 chart**
  as the third tab on the Kana page, grouped by stage, each opening its card.
- **Meanings are written for the app** (`KANJI_MEANING` in
  `tools/fetch-kanji.mjs`); KANJIDIC's first meanings read 行 as "going,
  journey, carry out". **Readings and stroke counts are KANJIDIC2's.**

---

## Patterns (grammar)

Chinese barely needed a grammar track; Japanese does. Built
(`js/data/patterns.js`, `js/patterns-ui.js`), with 40 patterns across
stages 3 to 10, the everyday structures N5 covers:

- **Stages 3–6:** は〜です, じゃないです, か, の, この/その/あの, も, が好きです,
  をください, を〜ます, ません/ました, に (going and time), で (by and at),
  はどこですか and に乗ります.
- **Stage 7:** はありますか, があります/います, な + noun, くないです,
  かったです and にします.
- **Stage 8:** と, から〜まで, あまり〜ません, ましょう and ませんか.
- **Stage 9:** てください, ています, てもいいですか, てから and ないでください.
- **Stage 10:** たいです, から (because), が (but), ね/よ, and the casual
  forms (for recognising).

A gap can carry its own choices per sentence, since a て-form question
offers 待って / 待った / 待ちます.

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
  the **Grammar tab** lists every pattern.

### The Grammar tab

A reference to come back to (`js/data/grammar.js`, `js/grammar-ui.js`):

- **How a sentence is built:** 私は 毎日 電車で 駅に 行きます, cut into its
  chunks (topic, when, how, where to, verb), with the points that matter.
  The verb comes last, particles come after what they mark, the middle
  order is loose, and obvious things get dropped.
- **Particles:** は が を に で へ の も と か ね よ, each with its job in one
  line and an example to hear.
- **Endings at a glance:** now / not / past / past-not for verbs, both
  kinds of adjective, and nouns.
- **Every pattern**, by stage. Learned ones open to their examples;
  upcoming ones are there to look ahead at, marked with the stage that
  teaches them. There's a button to practise the ones you know.

### 練習帳 The Notebook

A place to just write, lifted from Hanzi Quest's exercise book
(`js/book-ui.js`). It keeps the shape Hanzi Quest's phone version proved
out, on the desktop too. There's **one big box** to write a character in,
and **Add to page** (Enter) sets it in the next square of today's page and
wipes the box for the next one. You never zoom in on a page to fill one
square: the box stays big and the page fills itself.

- **Guides.** The squares' lines can be 十字 (a cross), 米字 (a star) or
  none. You can also pick a character to trace: hiragana, katakana or
  kanji, including ones not learned yet, which show faintly. It appears
  faintly in the box, copybook style, and its stroke order plays beside
  the box, with Again and Hear it.
- **Pens and nibs.** Pen, brush, pencil and marker; fine, medium and broad.
  The nib sets the width and the pen scales it, so a fine brush and a
  broad brush still differ. Each square keeps the pen it was written with.
- **Dated pages.** A page has 36 squares (6 × 6). When it's full, the next
  square starts a new page. You can also start a new page yourself, or
  take back the last square (it goes back into the box). Every page is
  kept under its date in **Your pages**, and any page can be opened again
  or deleted.
- **Keys:** Enter adds to the page; Z or Backspace undoes a stroke.
- **Storage.** Pages are vectors: each square's strokes in the same 1024
  box the writing drills use, so they redraw crisply and re-ink with the
  theme. They're kept in IndexedDB (`nihongo-quest-book`), outside the
  progress record, so they don't sync. They do go into the backup file
  (`pages`), and loading a backup that has them restores them. Characters
  written count towards the day's study time and are tallied per day
  (`days[d].bk`).

### Flashcards

The **Cards** tab (`js/cards-ui.js`): decks for today's items, hiragana,
katakana, words, kanji and patterns, built from what you've learned.
- Japanese → English or the other way round, shakiest first or shuffled.
- Look, think, flip (it turns over, and says the word), then **Again**,
  which sends the card to the back of the deck, or **Got it**.
- Keys: Space flips, 1 is Again, 2 is Got it, and the arrows move.
- On a phone the card fills the screen and the buttons sit at the bottom.
- It's self-paced, so like Go deeper it never moves a review, and a
  self-marked card isn't evidence for "solid".
- **Conjugations are generated in code**, never typed into the data. See
  **Conjugation** under Words.

Still to come: patterns for stages 7 and on (adjectives, the て-form and
more), and Sprint modes for conjugation and particles.

---

## Review days

A part-time learner forgets yesterday's row far more often than a full-time
one, so new lessons pause now and then (`reviewDay()` in `js/srs.js`):

- **After three days of new lessons in a row**, a day with none
  (Settings → Review days: every 4th day by default, 3rd, 5th or never).
- **After a break of three days or more**, whatever the rhythm.

A review day's session is what's due, then everything learned on the last
few learning days (`recentLearned()`): each once in its weaker skill, the
shakiest ten again in the other, and, in the kana stage, six of the words
those kana spell. Today's practice ticks against the same set. The hero says
why there's no lesson, and offers *Learn something new anyway*, which makes
the day a learning day again. Nothing is stored: it's worked out from the
days already recorded, counting days studied, not calendar days, so it
can't drift between devices.

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
4. **Out and about**: the menus and the real-life scenes.

Every number on Today counts items, never answers, for the reason Hanzi
Quest's *What the numbers count* gives.

---

## The side quest: Read a Menu

Hanzi Quest's menu teaches one character a day from a real restaurant menu,
with the glyphs you know inked in. It carries over well, because **Japanese
menus are mostly katakana**. Built (`js/data/menu.js`, `js/menu-ui.js`):

- **カフェ さくら**, a café, all katakana: 26 drinks, dishes and desserts.
  Each item inks itself in kana by kana as you learn them; kana you don't
  know yet stay grey, so you can watch it fill up. Tapping anything says it
  and shows what it is. It opens like every place (below): when half its
  items can be sounded out, which, with ー in most of them, is at the end of
  katakana.
- **食堂 まるや**, a diner, is the real thing: 定食 set meals, bowls,
  noodles, sides and drinks, with kanji dish names and furigana. It opens
  by the same rule, late in hiragana.
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

### Out and about: the scenes

The Menu section grew into **街 Out and about**: the two menus and twelve
scenes of the Japanese you meet off the page (`js/data/scenes.js`,
`js/scenes-ui.js`). Recognition is the point. Stay at N5, but be able to
read the sign and catch the announcement.

**The landing page.** Out and about opens on a page saying what it's for,
how it works (learn kana → a place opens → look, listen, test yourself),
how many places are open with a track of them in order, and what opens
next and roughly which lesson brings it. Then every place as a tile: how
many of its words you can read, a bar with the halfway mark on it, and
whether it's open, with a *new* badge until an opened place is visited
(`state.outSeen`). A strip of places, with *All places* first, runs above
each place.

**When a place opens: half its words.** A place is open once you can
**sound out** half its words, meaning every kana in them is learned. Kanji
come with furigana, so kana is enough to sound them out. It counts words,
not characters, on purpose: five lessons in, about half the characters on
a station sign are yours, but not one whole word is. The places are shown
in the order they open if lessons go in order (`opensAt`, worked out from
the lesson list), so the page doubles as the road ahead. A place that isn't
open can still be looked round, listened to and tapped; only its quiz (and
the menus' ordering game) waits.

**The ink.** Everywhere in Out and about, each kana you know is dark and
each one you don't is grey (`inkHtml`), so a word fills in as you learn its
kana. A kanji you haven't learned stays grey: a softer grey when the kana
above it are all yours, since you can at least sound it out. A key under
each place's title says so.

**Levels: the same place, deeper.** Opening a place is the start. Each
has three levels, earned in any order (`placeLevels`), shown as three steps
under its title and as three dots on its tile:
1. **読 Sound it out**: every word, not just half.
2. **分 Know what it says**: most of it (80%) recognised, in a scene's quiz
   or, for a menu, by finding it in an order. Both are kept in
   `state.scenes`.
3. **字 Read it as written**: every kanji in it learned, so the furigana has
   gone. A place in kana alone is read as written already. The station
   has 47 kanji and the course teaches 13 of them, so this level is
   deliberately a long way off: it's where N4 would take you.

**A word from the street.** One word a day from the place nearest to
opening (once all are open, the one with the fewest levels), preferring a
word with a kana or kanji you don't know yet, shown on the landing page and
on Today's Out and about card, inked like everything else. It is **only
shown**: `outWord()` learns nothing, grades nothing and counts nothing, so
lessons, reviews, the day's tally and the streak don't move (the smoke test
compares them before and after). It's kept for the day in `state.outWord`,
so a lesson that opens a place doesn't swap it mid-day.

**The first three are for the hiragana weeks.** Almost nothing on a real
sign is readable in the first fortnight, so three places are made of words
genuinely written in hiragana, and open during hiragana one after another:
**すし** a sushi counter (the ~5th lesson), **ゆ** a public bath (~8th), and
**屋台** festival stalls (~9th). Then shop signs, the receipt, and the rest
at the end of the plain rows; the diner and road signs with the combined
sounds; the café at the end of katakana. The smoke test checks that
order.

| Scene | Drawn as | What's in it |
|---|---|---|
| すし At the sushi counter | walked: a conveyor belt (below) | すし, いか, たこ, うに, かに, ねた, おあいそ, まぐろ, わさび |
| ゆ At the public bath | red curtain plates | ゆ, おとこ, おんな, おゆ / みず, あつい, ぬるい, おけ, ゆかた |
| 屋台 Festival stalls | walked: a night street of stalls (below) | おまつり, たこやき, やきとり, わたあめ, かきごおり, りんごあめ |
| 駅 At the station | blue station plates, then announcements | 出口, 改札, 乗り換え, the exits, 各駅停車 / 快速 / 急行; まもなく…, 黄色い線…, 次は… |
| 看板 Shop and door signs | walked: a street of shops (below) | 営業中 / 準備中, 押す / 引く, お手洗い, 禁煙, 割引, 半額, 売り切れ |
| 道路 Road signs | road signs; 止まれ is the red triangle | 止まれ, 徐行, 一方通行, 通行止め, 横断歩道 |
| レシート Reading a receipt | a paper receipt; each term on it is tappable | 小計, 消費税, 合計, 税込み, お預かり, お釣り, 点数 |
| お店 What shop staff say | a speaker line each | いらっしゃいませ, 温めますか, 袋はご利用ですか |
| 頼む, 道を聞く, 口語, ほめる | a chat: your lines on the right, what you'll hear from the cat on the left | asking for things, asking the way, casual Japanese, compliments |

- Tap anything to hear it and see what it means. **Show every meaning**
  reveals them all.
- **Test yourself** runs a quiz through the usual session screen, starting
  with what you haven't recognised yet. The receipt adds three sums (your
  change, the total, the tax), which the smoke test checks against
  `receiptSums`.
- Like the menu, it never touches the review schedule. What you've
  recognised is kept per scene (`state.scenes`), and the ring and the
  picker show it.
- Everything is furigana markup, so readings drop away as kanji are
  learned, and everything is recorded (`js/audio-place-<id>.js`, one per
  place, loaded when that place opens).

### コンビニ, the convenience store

A place you walk round rather than look at (`js/data/konbini.js`,
`js/konbini-ui.js`; the mockup it came from is `design/konbini-mockup.html`).
Thirty-six products along one wall: a cooler of cold drinks, a warmer of
hot ones, the onigiri chiller, the sweets shelf, then the register. Pick
anything up, turn it over, tap a word to hear it. The brands are made up;
the words are the ones on real packets.

- **The packages are drawn, the words are ink.** Each is an SVG (bottle,
  can, carton, cup, onigiri, bag, pouch, box, pack, tub) with its print in
  HTML on top, so a name fills in kana by kana like everything in Out and
  about. One light, from the upper left, for all of them: each is shaded in
  its own colour, stands in a soft contact shadow, and has a gloss over the
  print. The name sets as large as fits the package's label, breaking where
  the product's `lines` says (ブラック / コーヒー) rather than shrinking.
- **Stocked like a real shop.** Each product has a `shelf`: in the cooler,
  cans and cups up top, cartons in the middle, tall bottles below. Every
  shelf in a row is the height of its tallest packet plus room above, the
  doors share the rows, and the packets spread evenly, so the shelves line
  up across the cabinet. The phone's long shelf walks each aisle in the
  same order.
- **Three sides, in order.** 名 the name, 表 the slogan on the front, 裏 the
  label on the back. Each can be asked about once it can be sounded out,
  and never before the name. The back questions are about *finding* the
  line (which one says when to eat it by? 消費期限), since that's the skill
  in a real shop.
- **Modes.** 見る Browse: nothing is asked. 読む Read: putting a packet back
  asks about the next side you haven't read. お使い Errand: a friend's list,
  in Japanese, of three things you can already read; find them, and get a
  receipt. Under three readable names, the errand says so and waits.
- **Products open one by one.** A green dot under a packet means you can
  sound out its name, so it can ask you about it, whether or not the store
  as a whole is open yet. The store opens, as every place does, at half its
  names (around the end of katakana: the drinks and sweets are loanwords).
- **What's read** is `state.scenes.konbini`: `got` (names, which the 分
  level counts, as for every place), `copy` and `back`. Sync joins all three.
- **Desktop and phone are drawn separately.** A desktop walks along the
  wall (the arrows, or ← →) with what's in your hands beside it. A phone
  gets one long shelf, a product a screen, big enough to read the packet,
  and what you pick up comes up as a sheet. Its styles live only in the
  phone layer.
- **Sound**: every name, slogan, tag and label term, in
  `js/audio-konbini.js`, loaded when the store opens. It repeats clips other
  bundles have, so nothing is silent for someone who hasn't reached them.
- The smoke test checks every product: its lines join to its name, its
  reading matches, its slogan question has four different answers, its back
  label is whole, its name sets at a readable size and never smaller than
  its slogan, and every string is good furigana.

Still to come: the cat at the register (いらっしゃいませ, 温めますか, the
total said aloud), the hot case (おでん, 肉まん), bento.

### Walked: the sushi counter and the festival stalls

The konbini's way of looking round — walk along, pick things up, read
them — is an engine (`js/walk-ui.js`) that any place can plug into
(`WALKS[id]`: what it has, how it's drawn, which sides it has to read).
Two of the hiragana places use it too (`js/stalls-ui.js`), so the first
thing a learner can walk round is a fortnight in, not the end of katakana.

- **すし, a conveyor-belt counter.** Twelve plates come round, two pieces
  each, drawn (nigiri, gunkan, inari, tamago with its nori belt), each with
  a card in front saying what it is. A plate's colour is its price, and the
  board on the wall says which. The curtain over the door (すし), the
  topping case (ねた), the wasabi by your seat and おあいそ are signs: tap
  to hear one and see what it means.
- **屋台, a summer-night street.** Ten stalls, each under its striped
  awning and hand-painted banner, with the dish on the counter, a card with
  its price for one (ひとつ), and a flag where it's sweet or spicy (あまい,
  からい). The lanterns overhead spell おまつり.
- **The same words, the same record.** What you pick up is one of the
  scene's own words, so reading it there is that word recognised in
  `state.scenes`, exactly as the scene's quiz counts it; old progress
  carries over. A plate or a dish has one side to read, its name. The
  quiz on every word (signs included) is still there, under the walk.
- **Errands**: three plates off the belt and the bill (and how to ask for
  it: おあいそ); three things from the stalls and what you spent.
- **Phone**: one long belt, a plate a screen; one long street, a stall a
  screen. The signs sit above.

- **The sushi counter has a way in**: a tiled eave, the すし curtain hanging
  from the lintel over a lattice sliding door, a paper lantern. Inside,
  pendant lamps over a rail of wooden menu plaques (each a word: tap to hear
  it), the price board, the topping case, the cat as chef in a white cap,
  then the belt, then your bench (wasabi, ginger, soy sauce, tea, おあいそ).

### Walked: the street of signs

看板 is a short shopping street (`js/street-ui.js`), each of its 21 signs
where you'd meet it: a café's door with its 営業中 tag and 押す plate and
its hours on the wall; a ramen shop's 準備中 and 引く; a drugstore's
automatic door, window posters (割引, 半額, 無料), 売り切れ on a shelf and
お会計 over the till; a shutter with 本日休業 taped to it; a hallway with
the toilets, no-smoking and no-photos stickers; and its far end, with the
smoking room, the green 非常口 and the stairs taped off (立入禁止). Signs
aren't picked up, so the panel is "up close", and Read asks what a sign
*means* (or how it's read). The phone gets a shop a screen.

### 0.19.0: the visit, the stalls, the shopfronts, the station, and word lists

- **A sushi visit.** You start outside, at the door, and see only that. Go
  in, and the cat at the front (in a red kimono) asks how many you are and
  whether you'd like the counter or a table; you answer by tapping a reply,
  and a phrasebook beside her has what else you might hear or say (we're
  full, one moment, write your name and wait, how long's the wait…). These
  are spoken and inked but aren't the scene's words, so they don't change
  when the place opens (`walk.talk`). On a desktop the **counter** keeps the
  room still and moves the belt, four plates at a time, round and round;
  a **table** is your place setting (wasabi, soy sauce, tea, chopsticks,
  おあいそ) and a menu in the middle that opens and leafs through, a spread
  a price. On a phone, either is the long belt. Leave puts you back outside.
- **Stalls of their own.** Striped awnings, white tents over red-and-white
  紅白幕, wooden carts on wheels with noren, booths under painted
  signboards; each with what it cooks on (a takoyaki griddle, a teppan with
  spatulas, a charcoal grill, the oden pot, a floss machine with its
  character bags, an ice shaver and syrups, a stand of candy apples), steam
  and smoke rising, lanterns strung over every booth and across the street,
  a torii at the start, trees and a moon behind. The cat cooks takoyaki.
- **Shopfronts like shopfronts**, with made-up names: 喫茶こもれび (brick,
  lace curtains, a chalkboard easel), らーめん たぬき (a narrow wooden front,
  noren, a lantern, a tanuki), ドラッグはなまる (くすり in red, shelves of
  stock, a sale wagon, toilet roll stacked outside, baskets), 山田書店 shut
  for the day, and さくらビル's lobby and back. Signs **stay where they
  are** (`stays`): tapping one highlights it and shows it up close beside.
- **The station, walked through** (`js/station-ui.js`): the entrance, the
  concourse, the exit corridor, platform three. Signs stay where they are;
  the announcements are speakers.
- **Every place has a word list** (一覧): each word inked, its reading and
  romaji, its meaning, a button to hear it, and a tick once recognised.
  Walked places have it beside the modes; the others under the scene.

### 0.20.0: a trip through the station, stalls and shops like the real thing

- **The station is a trip**, one place to stand at a time, the buttons at
  the sides to turn (no scrolling). In the street, the stairs down into the
  subway under the 地下鉄 さくら駅 sign, 入口 on the canopy, 東口 and the
  area map on a pole. Down the stairs, the lobby's three walls: the ticket
  machines (tap one for its screen: a station, adult or child, coins in,
  ticket and change out); the departures board, every word on it tappable,
  with the exit signs pointing the way they go (西口 left, 北口 ahead, 南口
  right); the gates, which only open with a ticket. The ticket waits at the
  bottom right, above the right-hand button, and opens to its front. Behind
  the gates, two flights of stairs, each under the sign that says which
  platforms and which way (方面), with their own announcements; the stairs
  and the sign are separate taps. Each platform is two views, a train each:
  its type and where it goes on its side, the station's name board, the
  announcements below. The right train gets a celebration (a hanamaru, the
  cat cheering, せいかい, petals) and **Go to …**: take a seat, the doors
  close, the city goes by, and you get off at a station laid out the same
  under its own name, your ticket used up, with a train back to さくら among
  the four. The wrong train says only where it goes. Signs stay where they
  are; errands ask only for signs you can see from where you're standing.
  Everything else in Japanese (names, the machine, the board, the ticket,
  announcements) says itself and shows for a moment what it is
  (`station.walk.terms`, `ann`, and every station's name and next-stop line).
- **0.21.0, the ride and the stairs.** Both flights of stairs are drawn
  (`stairsSvg`): treads and risers in perspective, yellow edges, rails, the
  walls closing in, light from the far end. The route map (路線図) on the
  street opens the line's five stations, 現在地 where you are, the fare to
  each. On the train: ceiling lights, two ads hanging and one above the
  windows (three of eight, picked at random each ride: `walk.ads`, every
  one tappable), straps and a grab pole, the blue seat with the priority
  seats (優先席) at its end, the door with its screen and a blinking chime.
  Take a seat and the doors slide shut, the platform slides away, the
  tunnel's lights stream past, and the announcements come in turn (ドアが
  閉まります, 本日もご乗車…, 次は…, まもなく…, 出口は左側です) until the next
  platform slides in and stops and the doors open. The buttons sit in a bar
  of their own, so nothing moves under the pointer. The ticket pops in once,
  when it's bought; the side buttons have no labels.
- **Stalls built like stalls.** A roof on poles with the name big along the
  valance (or on a signboard over the taller ones), lanterns and bare bulbs
  hanging under the eaves, someone behind the counter, the counter at
  waist height with the griddle or grill or pot standing on it beside a
  bigger display of the food, cloth or boards or wheels below. Ten stalls
  of four kinds and different heights.
- **Shopfronts like shops**, at their own heights along one pavement under
  the wires: a two-storey brick café with a green awning, a wide glass
  double door and a small brass 押す plate; a low wooden ramen shop under a
  tiled roof with its noren, lantern, photo menu and ticket machine; a
  three-storey drugstore with its くすり sign sticking out, packed shelves,
  a sale wagon and a SALE banner; an old bookshop with a vending machine
  beside it; a four-storey glass office block with its lobby; the alley
  down its side. **Every shop's name can be tapped**: it's spoken, and what
  it is shows for a moment.
- **A sign's meaning shows for a moment** when you tap it, then goes.
- **"How is it read?" is in romaji, a syllable at a time**, and the wrong
  answers are a syllable or two off (de-gu-chi against de-ru-ki, de-zu-chi,
  do-ge-chi), so it can't be got by elimination. Syllables keep っ with what
  follows and ー with what it lengthens (`kbSyllables`, `kbNearMisses`).

The rest of the places stay as they are: conversations are for listening
to, not walking round.

**Every word has its sound in Out and about.** The scenes' bundle used to
skip any clip a word stage already had, so ねた (in stage 8's) was silent
for anyone who hadn't got there. It now carries everything it needs, as
the konbini's does, and the smoke test checks both.

### 0.22.0: round the loop

- **The line is a loop**: さくら → 新宿 → 上野 → 品川 → 渋谷 → さくら
  (`walk.loop`), tracks 3 and 4 one way round, 1 and 2 the other
  (`stepFrom`, `hopsTo`, `bestDir`, `fareTo`). A ticket to 上野 stops at
  新宿 first, and at every stop you choose: **Stay on** or **Get off**.
- **The gates check your ticket.** Out through them at the wrong station
  and they beep and shut, and you're told where your ticket goes. Ride past
  your stop and either stay on round the loop or get off and take a train
  back the other way. Out at the right station, the ticket goes in and you
  get a celebration (とうちゃく). A train the long way round is allowed, with
  a warning first.
- **An announcement stays until you've read it.** Each one pops up in a
  box (the Japanese, tappable, with its English) with Again and OK, and the
  train waits: the tunnel, the straps, the platform sliding in all pause
  until OK. A phase that has finished holds its end, so nothing jumps back
  when a pop redraws.
- **A carriage that looks like one.** One outside sits behind the whole
  wall, so the windows and the open door show the same tunnel or the same
  platform, with its name plate and people. The seat has a moquette back,
  cushions, a base with heater grilles, the priority seats in orange with
  their sign, and a glass partition. Straps sway and the car rocks on the
  move. Every ad is a poster with a picture (`AD_ART`), and tapping one shows
  its meaning over it without changing its size.
- **Stairs, again**, drawn with true perspective: treads going down from
  the street, risers with yellow nosing going up to the platforms.
- **The route map is a ring**, with the fare to each station and 現在地.
- **On a phone, the platform flows**: train, platform edge, the 女性専用車
  sign, the announcements, then the way down and the ticket, with nothing
  on top of anything.
- **What the ✓ means** is now in the key under a walk: one tick for each
  side of a thing you've read in 読む Read mode.
- 終点です is gone from the platform announcements (a loop has no last
  stop); 駆け込み乗車はおやめください takes its place.

### 0.23.0: real stairs, and stalls with a word each

- **The stairs are drawn as a camera sees them** (`stairsSvg`). Every
  point is placed in metres and projected from an eye 1.6 m up and a little
  left of centre (keeping left), so the treads, the tiled walls with their
  darker lower band, the ceiling and its lights, and the rails all meet at
  one vanishing point. Going down, the camera tips to look down the flight:
  you stand by the yellow warning blocks (点字ブロック) and the treads drop
  away, each nosing dark with a yellow edge, darker as they go, to a lit
  landing with a sign. Going up, you stand at the foot and the risers
  climb to the platform's light. Rails on both walls at two heights, and
  one down the middle on its posts, as at a Japanese station.
- **The street entrance** is now a roof with the 入口 sign hanging under
  it and a tall opening onto the stairs, instead of a glass box on top.
- **A different word on every stall's flag**: あつい (たこやき), おいしい
  (やきそば), おおきい (いかやき), からい (やきとり), まるい (おこのみやき),
  あたたかい (おでん), あまい (わたあめ), あかい (りんごあめ), つめたい
  (かきごおり), やすい (だんご, now ¥200). The eight new adjectives are in
  the word list, the quiz and the audio.
- **A stall's banner says its name** when tapped, like a shop's name, and
  shows what it is for a moment; the cart's noren does too. The awning's
  scalloped edge now hangs below it (a mask was clipping the meaning).
- **No cat at the takoyaki**: someone in the light behind the counter, as
  at the other stalls.
### 0.24.0: tidying, and lighter places

- **One sound bundle per place** (`js/audio-place-<id>.js`, built by
  `tools/make-audio.mjs`; `placeAudio(id)` in `js/scenes-ui.js` fetches it
  when the place opens, when its quiz starts, or when it supplies the
  word of the day). Going out used to fetch every place's sound at once,
  2.4 MB; a place is now 20–300 KB (the station, with its announcements
  and every stop, about 900 KB). Walks no longer name a bundle.
- **The diner's dishes have sound for everyone.** Their clips were only in
  the stage 5 bundle, so anyone who hadn't reached stage 5 heard nothing on
  that menu; each menu now carries its own dishes and phrases.
- **Kana sound can't be skipped any more.** The kana bundle loaded only
  if no other bundle had arrived first, and a stage or place bundle started
  by the first screen could; then kana stayed silent all session. It has
  its own flag now, and "is there sound?" (`hasAudio`) asks for a kana's
  clip rather than any clip.
- **CSS tidied, nothing moved**: rules for things long gone (an old
  timetable, a belt, a strip, a floor bar, a ride LED, nav labels) removed;
  rules split across the file (the overview tiles, the street's first
  sketch under its rewrite, the station frame, a few more) folded into one;
  the second `@keyframes sn-pop` gone (it nudged the ticket sideways as it
  popped in). Checked by comparing every element's computed style, old
  sheet and new, across the main screens at desktop and phone widths.
- **Out & about is a section again** on a desktop's top bar (街 Out &
  about), between Notebook and Sprint as in the phone's drawer. From 1300px
  each label sits on one line; narrower, labels stack, "Out & about" is
  "Out", and under 1000px the wordmark leaves just its seal, so the bar
  never runs off the side.
- **One character per curtain panel**: the noren (Today's Out and about
  card, the café and the diner) letters each panel with its own character,
  in the middle of it, as real ones are; lettered in paper colour, so it
  reads in dark mode too.

### 0.25.0: places by night, and on one screen

- **Dark mode leaves the places alone.** The painted scenes (the sushi door,
  the hostess and the counter, the festival, the shopfronts, the konbini,
  every part of the station) keep the light theme's ink and paper inside
  them, so words on a pale wall no longer turn pale themselves ("A curtain
  over a sliding door…" was all but invisible), and the hostess's speech
  bubbles are paper, not slate, on the cream wall. What's in your hands
  beside a scene follows the theme as before.
- **A place fits the screen on a desktop.** Opening one brings its mode
  bar up under the top bar (the title and levels are a scroll above), and
  the scene with its side panel is scaled down (CSS zoom, never below
  70%) only if its bottom would still be off screen: `kbFit` in
  `js/walk-ui.js`, measured on every draw and on resize. At 1440×900
  nothing shrinks; at 1280×720 the street and the konbini go to about 87%.
- **A narrow station gets the compact layout on a desktop too.** The
  station's phone rules now live in a container query on `.sn-station`
  (under 720px wide), so a small desktop window no longer squeezes the
  wide layout: the timetable's destinations wrapped a character at a time
  and ran out of the bottom, and the concourse signs sat on top of each
  other. On a phone nothing changes (checked element by element).

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
| **書く Write** | a sound (ka, in hiragana) | write the kana in the box, by hand | 6 | kana `w` | ✓ |
| **言葉 Words** | a word | pick the meaning | 2.4 | `r` | next |
| **言葉を打つ Type words** | a meaning | type it in kana | 4.5 | `c` | next |
| **活用 Conjugate** | 食べる + て-form | type 食べて | 4.0 | pattern | with conjugation |

Each sheet can be hiragana, katakana or both, 20–100 questions, 1–5
minutes. Only a **finished** sheet can set a best: finishing comes first,
then accuracy, then time. A sheet that would loop through its kana more
than six times is offered disabled.

**Write** is the handwriting sheet. Each question gives the sound and the
script; you write it in the box (Undo, Clear, hear it again) and go on with
Next or Enter, and an empty box is a skip. Nothing is marked as you go: the
strokes are kept and marked by shape at hand-in, with the lessons' own
marker (`markWriting`, stroke order as set in Settings). The review shows
each miss with a small copy of what you wrote under it. Only kana with
stroke data are dealt (きゃ is two kana you already write), and choosing
Write turns a sheet too fast to finish at par into 20 in 3 minutes.

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
after the first screen draws. The word stages' audio, originally one `js/audio-n5.js` with 95 more (every stage word
and example not already in the kana bundle), about 1 MB, fetched once words
are open. Both add to one table (`window.NQ_AUDIO`), so they load in any
order. `make-audio.mjs` only records what's missing,
so adding a word takes seconds; `--all` re-records everything. Katakana plays
its hiragana twin's clip, and じ/ぢ and ず/づ share one, since they sound the
same. A lone kana is sometimes read as something else: は and へ on their
own could come out as the particles "wa" and "e". Checked by ear with Kyoko:
は says ha, へ says he, を says o. If a new voice gets one wrong,
`SPEAK_AS` in the script forces a spelling for that clip.

**Bundles now.** Word audio is split **per stage** (`js/audio-s2.js` …
`audio-s10.js`), and a stage's bundle is fetched only once the learner is
within one stage of it, so nobody downloads all of N5 on day one. The
Grammar tab's sentences are their own bundle, fetched when it opens. All
clips are AAC at 24 kbps (32 kbps was a quarter bigger, for speech that
sounds the same). `make-audio.mjs` reuses any clip already recorded in any
bundle, so moving clips between bundles costs nothing, and it deletes
bundles it no longer makes.

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

## Sync

Progress lives in `localStorage`, and optionally in your Google account
(`js/sync.js`, lifted from Hanzi Quest and using the same Firebase
project). **Settings → Your other devices → Sign in with Google**, once on
each device. Each device then reads and writes one Firestore document,
`progress-nihongo/<uid>`. Nobody who never signs in loads the SDK.

- **Signing in on a phone.** The site (github.io) and the sign-in handler
  (firebaseapp.com) are different domains. Phone browsers now partition
  storage between those, which breaks `signInWithRedirect`. It returns to
  the page with no user. So it's a popup, and the popup has to open
  *inside* the tap: Settings starts loading the SDK as it opens
  (`syncWarm`), and the button calls `signInWithPopup` synchronously. If the
  tap still went stale (SDK not in yet), the block asks for one more tap
  rather than redirecting. A redirect is kept only for browsers with no
  popups at all. The page that comes back from one finishes it
  (`nq-sign-in-pending`) and says plainly if the user got lost on the way.
  "Checking…" gives up after 20 seconds and says why, instead of
  leaving a greyed-out button.

- **The merge** (`mergeState` in `js/srs.js`) loses nothing learned on
  either side. Counts that only grow take the larger. Lists of things done
  are joined. Firsts take the earlier. Settings follow the device saved
  last, and an item's schedule follows whichever side touched it last (its
  `t`). It's the larger count, not the sum, so a day isn't doubled each
  time two devices meet. The smoke test checks it both ways round.
- **Writes** are debounced: a burst of answers makes one write.
- **Pulls** happen at sign-in and whenever the tab comes back into view,
  but never mid-session.
- **A reset or a restored backup** overwrites the account's copy instead
  of merging into it.
- **Firestore rules** need a block for this app's collection:
  `match /progress-nihongo/{uid} { allow read, write: if request.auth != null && request.auth.uid == uid; }`

## Sources and licensing

| what | source | licence | notes |
|---|---|---|---|
| word meanings, readings, parts of speech | JMdict (EDRDG) | CC BY-SA 4.0 | for checking and filling gaps; hand-edited glosses are shorter |
| kanji readings and stroke counts | KANJIDIC2 (EDRDG) | CC BY-SA 4.0 | used, by `tools/fetch-kanji.mjs` → `js/data/kanji.js`; meanings written for the app |
| stroke order | AnimCJK `graphicsJaKana.txt` and `graphicsJa.txt` | Arphic Public License | licence text in `licenses/animCJK/`; see **Writing → Stroke data** |
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
    js/menu-ui.js           Out and about: the menus and the ordering game
    js/data/scenes.js       out and about: station, signs, road, receipt, shop, chats
    js/scenes-ui.js         drawing the scenes, and their quizzes
    js/data/konbini.js      the convenience store: 36 products, their packets front and back
    js/walk-ui.js           places you walk round: the modes, what's in your hands, the errand, the phone sheet
    js/konbini-ui.js        the convenience store: drawing the packages and the shelves
    js/stalls-ui.js         the sushi counter and the festival stalls, walked: plates, dishes, banners
    js/street-ui.js         the street of signs, walked: shopfronts and every kind of sign
    js/station-ui.js        the station as a trip: street, machines, gates, stairs, platforms, the ride round the loop
    js/audio-konbini.js     generated clips for the convenience store
    design/                 mockups, for looking at — not loaded by the app
    js/sync.js              optional sync: Google sign-in, one Firestore document
    js/audio-place-*.js     generated clips, one bundle per place (menus and scenes)
    js/audio-kana.js        generated clips — do not hand-edit
    js/strokes.js           generated stroke data — do not hand-edit
    js/furi.js              furigana markup: parse, check, render, derive kana
    js/data/words.js        stages 2–10: 219 words, their stages, lessons of five
    js/data/patterns.js     40 grammar patterns, placed after their stage's words
    js/data/grammar.js      the Grammar tab's reference: sentence shape, particles, endings
    js/grammar-ui.js        the Grammar tab
    js/cards-ui.js          flashcards
    js/book-ui.js           練習帳 the notebook: the box, the dated pages, pens and guides
    js/patterns-ui.js       pattern cards, fill-the-gap and understand drills
    js/data/kanji.js        131 kanji with KANJIDIC readings — generated, do not hand-edit
    js/data/kanji-lessons.js where the kanji lessons go
    js/kanji-ui.js          kanji cards, meaning and read-in-a-word drills, the 漢字 chart
    js/words-ui.js          word lessons and questions, typing, the Words library
    js/audio-s<N>.js        generated clips, one bundle per word stage — do not hand-edit
    js/audio-grammar.js     generated clips for the Grammar tab

    tools/server.mjs        dev server, http://localhost:8732
    tools/version.mjs       bump the version and re-stamp every asset
    tools/smoke.mjs         contract, data, scheduling, allowance, the check, writing, audio, versions
    tools/make-audio.mjs    records the clips that are missing (macOS)
    tools/fetch-strokes.mjs builds js/strokes.js (kana and kanji), merging AnimCJK's stroke pieces
    tools/fetch-kanji.mjs   builds js/data/kanji.js from KANJIDIC2

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
