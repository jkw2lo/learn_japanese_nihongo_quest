/* Nihongo Quest — the Grammar tab's reference: how a sentence is built,
   what each particle does, and the endings at a glance. The patterns
   themselves are in patterns.js; this is the map they sit on.
   Every Japanese string is furigana markup, and every sentence is recorded
   (tools/make-audio.mjs reads GRAMMAR_SAY). */

/* 私は 毎日 電車で 駅に 行きます — each chunk and the job it does. */
const SENTENCE_SHAPE = {
  chunks: [
    ["{私|わたし}は", "topic", "who it's about"],
    ["{毎日|まいにち}", "when", ""],
    ["{電車|でんしゃ}で", "how", ""],
    ["{駅|えき}に", "where to", ""],
    ["{行|い}きます", "verb", "always last"],
  ],
  en: "I go to the station by train every day.",
  points: [
    "The verb (or です) comes <b>last</b>. Everything else comes before it.",
    "Little words called <b>particles</b> come <i>after</i> the word they mark, and say what it's doing: は the topic, を the object, に where to, で how.",
    "Because the particles carry the meaning, the order of the middle chunks is loose — {電車|でんしゃ}で{毎日|まいにち} works too.",
    "Anything obvious gets dropped. {行|い}きます on its own is a whole sentence: (I'm) going.",
  ],
};

/* particle, reading, what it does, example, english */
const PARTICLE_GUIDE = [
  ["は", "wa", "the topic — what the sentence is about", "{私|わたし}は{学生|がくせい}です。", "I'm a student."],
  ["が", "ga", "the subject, especially new information; also what you like, and what there is", "ねこがいます。", "There's a cat."],
  ["を", "o", "the object — what's acted on", "パンを{食|た}べます。", "I eat bread."],
  ["に", "ni", "to (where you're going), at (a clock time), and where something is", "{駅|えき}に{行|い}きます。", "I'm going to the station."],
  ["で", "de", "at (where something happens), and by (how)", "{電車|でんしゃ}で{行|い}きます。", "I'll go by train."],
  ["へ", "e", "towards — like に for a destination", "{日本|にほん}へ{行|い}きます。", "I'm going to Japan."],
  ["の", "no", "'s; of — joins two nouns", "{私|わたし}の{友達|ともだち}です。", "This is my friend."],
  ["も", "mo", "too; also — takes the place of は or が", "{私|わたし}も{学生|がくせい}です。", "I'm a student too."],
  ["と", "to", "and (between nouns); with (someone)", "{友達|ともだち}と{話|はな}します。", "I talk with a friend."],
  ["か", "ka", "at the end: turns a sentence into a question", "{学生|がくせい}ですか。", "Are you a student?"],
  ["ね", "ne", "at the end: isn't it? — looking for agreement", "いい{天気|てんき}ですね。", "Nice weather, isn't it?"],
  ["よ", "yo", "at the end: you know — telling someone something", "おいしいですよ。", "It's good, you know."],
];

/* The polite endings on one table: [kind, now, not, past, past-not, example word]. */
const ENDINGS = [
  ["Verbs", "〜ます", "〜ません", "〜ました", "〜ませんでした", "{行|い}きます"],
  ["い-adjectives", "〜いです", "〜くないです", "〜かったです", "〜くなかったです", "{高|たか}いです"],
  ["な-adjectives", "〜です", "〜じゃないです", "〜でした", "〜じゃなかったです", "きれいです"],
  ["Nouns", "〜です", "〜じゃないです", "〜でした", "〜じゃなかったです", "{学生|がくせい}です"],
];

/* Every sentence the tab can play, as markup. */
const SHAPE_SENTENCE = SENTENCE_SHAPE.chunks.map(c => c[0]).join("") + "。";
const GRAMMAR_SAY = [SHAPE_SENTENCE, ...PARTICLE_GUIDE.map(p => p[3])];
