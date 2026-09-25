/* Nihongo Quest — grammar patterns.

   A pattern is taught through the sentences it makes (README → Patterns).
   Each has:
     id    stable key; the item is "g:" + id
     st    the word stage it belongs to — its lesson comes after that
           stage's last word lesson, and its examples use only words from
           that stage or before (smoke.mjs checks every kanji)
     pat   the pattern itself, in furigana markup
     m     what it means
     note  how it's built (markup allowed)
     alts  the choices for its gap, if the gap isn't a particle
     ex    [sentence, english] — the sentence marks its gap with «»:
           {私|わたし}«は»{学生|がくせい}です。 The fill-the-gap drill blanks it;
           everywhere else the marks are simply dropped. */

const PARTICLES = ["は", "が", "を", "に", "で", "へ", "の", "も", "か", "と"];
/* The wrong answers people actually give — dealt before random ones. */
const PARTICLE_CONFUSIONS = {
  は: ["が", "も"], が: ["は", "を"], を: ["が", "に"], に: ["で", "へ"], で: ["に", "を"],
  へ: ["に", "で"], の: ["は", "が"], も: ["は", "が"], か: ["は", "の"],
};

const PATTERNS = [
  /* ---- stage 3 ---- */
  { id: "ikura", st: 3, pat: "〜はいくらですか", m: "How much is ~?",
    note: "は marks what you're asking about, いくら is how much, and か makes it a question.",
    ex: [["これ«は»いくらですか。", "How much is this?"], ["コーヒー«は»いくらですか。", "How much is the coffee?"]] },
  { id: "ji", st: 3, pat: "〜{時|じ}です", m: "It's ~ o'clock.",
    note: "A number, then {時|じ}. Half past is {半|はん}: {三時半|さんじはん}.",
    ex: [["{今|いま}、{三時|さんじ}です。", "It's three o'clock now."], ["{七時半|しちじはん}です。", "It's half past seven."]] },

  /* ---- stage 4 ---- */
  { id: "wa-desu", st: 4, pat: "〜は〜です", m: "X is Y.",
    note: "は (read wa) marks what you're talking about; です ends a polite sentence. The verb — here です — always comes last.",
    ex: [["{私|わたし}«は»{学生|がくせい}です。", "I'm a student."], ["スミスさん«は»{先生|せんせい}です。", "Mr Smith is a teacher."],
         ["これ«は»{日本|にほん}の{本|ほん}です。", "This is a Japanese book."]] },
  { id: "janai", st: 4, pat: "〜じゃないです", m: "X is not Y.",
    note: "The negative of です. You'll also see ではありません — the same, more formal.",
    alts: ["です", "じゃないです", "ですか"],
    ex: [["{私|わたし}は{先生|せんせい}«じゃないです»。", "I'm not a teacher."], ["これはペン«じゃないです»。", "This isn't a pen."]] },
  { id: "desuka", st: 4, pat: "〜ですか", m: "Is it ~? (a question)",
    note: "Add か to the end of a sentence and it becomes a question. Word order doesn't change.",
    ex: [["{学生|がくせい}です«か»。", "Are you a student?"], ["あの{人|ひと}はだれです«か»。", "Who is that person?"]] },
  { id: "no", st: 4, pat: "AのB", m: "A's B; B of A",
    note: "の joins two nouns, the owner or kind first: {私|わたし}の{友達|ともだち}, my friend; {日本語|にほんご}の{先生|せんせい}, a Japanese teacher.",
    ex: [["{私|わたし}«の»{友達|ともだち}です。", "This is my friend."], ["{日本語|にほんご}«の»{先生|せんせい}です。", "I'm a Japanese teacher."]] },
  { id: "kono", st: 4, pat: "この / その / あの + noun", m: "this / that + something",
    note: "この, その, あの come right before a noun. これ, それ, あれ stand on their own.",
    alts: ["この", "その", "あの", "これ"],
    ex: [["«この»{人|ひと}は{友達|ともだち}です。", "This person is my friend."], ["«あの»{人|ひと}はだれですか。", "Who is that person over there?"]] },
  { id: "mo", st: 4, pat: "〜も", m: "~ too; also",
    note: "も takes the place of は: {私|わたし}も, me too.",
    ex: [["{私|わたし}«も»{学生|がくせい}です。", "I'm a student too."], ["スミスさん«も»{先生|せんせい}です。", "Mr Smith is a teacher too."]] },
  { id: "suki", st: 4, pat: "〜が{好|す}きです", m: "I like ~.",
    note: "The thing you like takes が, not を.",
    ex: [["ねこ«が»{好|す}きです。", "I like cats."], ["{日本語|にほんご}«が»{好|す}きです。", "I like Japanese."]] },

  /* ---- stage 5 ---- */
  { id: "o-kudasai", st: 5, pat: "〜をください", m: "~, please.",
    note: "を marks the thing you want; ください is please give me.",
    ex: [["コーヒー«を»ください。", "A coffee, please."], ["{水|みず}«を»ください。", "Water, please."], ["ビール«を»{二|ふた}つください。", "Two beers, please."]] },
  { id: "o-masu", st: 5, pat: "〜を〜ます", m: "do ~ (to something)",
    note: "The thing acted on takes を, and the verb comes last.",
    ex: [["パン«を»{食|た}べます。", "I eat bread."], ["お{茶|ちゃ}«を»{飲|の}みます。", "I drink tea."]] },
  { id: "masen", st: 5, pat: "〜ません", m: "don't ~ (polite)",
    note: "Swap ます for ません.",
    alts: ["ます", "ません", "ました", "ませんでした"],
    ex: [["{肉|にく}を{食|た}べ«ません»。", "I don't eat meat."], ["ビールを{飲|の}み«ません»。", "I don't drink beer."]] },
  { id: "mashita", st: 5, pat: "〜ました", m: "did ~ (polite past)",
    note: "ました is the past; ませんでした is the past not.",
    alts: ["ます", "ません", "ました", "ませんでした"],
    ex: [["{昨日|きのう}、{魚|さかな}を{食|た}べ«ました»。", "I ate fish yesterday."], ["{朝|あさ}ご{飯|はん}を{食|た}べ«ませんでした»。", "I didn't eat breakfast."]] },

  /* ---- stage 6 ---- */
  { id: "ni-iku", st: 6, pat: "〜に{行|い}きます", m: "go to ~",
    note: "に marks where you're going. へ does the same, a little more about the direction.",
    ex: [["{駅|えき}«に»{行|い}きます。", "I'm going to the station."], ["{日本|にほん}«に»{行|い}きました。", "I went to Japan."]] },
  { id: "de-means", st: 6, pat: "〜で", m: "by ~ (how)",
    note: "で marks the way you do something: {電車|でんしゃ}で, by train.",
    ex: [["{電車|でんしゃ}«で»{行|い}きます。", "I'll go by train."], ["バス«で»{帰|かえ}ります。", "I'll go home by bus."]] },
  { id: "de-place", st: 6, pat: "〜で〜ます", m: "do ~ at (a place)",
    note: "で also marks where something happens. Where something just is takes に — but that's for later.",
    ex: [["{駅|えき}«で»{待|ま}ちます。", "I'll wait at the station."], ["{店|みせ}«で»ご{飯|はん}を{食|た}べます。", "I'll eat at a restaurant."]] },
  { id: "doko", st: 6, pat: "〜はどこですか", m: "Where is ~?",
    note: "Probably the most useful sentence in this app.",
    ex: [["{出口|でぐち}«は»どこですか。", "Where's the exit?"], ["トイレ«は»どこですか。", "Where's the toilet?"]] },
  { id: "ni-noru", st: 6, pat: "〜に{乗|の}ります", m: "get on / ride ~",
    note: "What you get on takes に, not を.",
    ex: [["{電車|でんしゃ}«に»{乗|の}ります。", "I get on the train."], ["タクシー«に»{乗|の}りました。", "I took a taxi."]] },
  { id: "ni-time", st: 6, pat: "(time) に", m: "at (a time)",
    note: "A clock time takes に. Words like {今日|きょう} and {明日|あした} don't.",
    ex: [["{三時|さんじ}«に»{行|い}きます。", "I'll go at three."], ["{七時|しちじ}«に»{帰|かえ}ります。", "I'll go home at seven."]] },
];

/* ---- derived ---- */

const dropGap = s => s.replace(/[«»]/g, "");
PATTERNS.forEach(p => {
  p.key = "g:" + p.id;
  p.ex = p.ex.map(([jp, en]) => {
    const gap = (jp.match(/«([^»]+)»/) || [])[1] || null;
    return { jp: dropGap(jp), en, gap, gapped: jp, kana: furiKana(dropGap(jp)) };
  });
});
const PATTERN_BY = {};
PATTERNS.forEach(p => { PATTERN_BY[p.key] = p; });

/* Pattern lessons go in after the last word lesson of their stage. */
(function placePatternLessons() {
  WORD_STAGES.forEach(S => {
    const ps = PATTERNS.filter(p => p.st === S.st);
    if (!ps.length) return;
    const lessons = [];
    for (let i = 0; i < ps.length; i += 4) {
      const n = i / 4 + 1;
      lessons.push({ id: `g${S.st}-${n}`, set: "w", st: S.st, kind: "patterns",
        title: `文型 · ${S.jp}${ps.length > 4 ? " " + n : ""}`, items: ps.slice(i, i + 4).map(p => p.key) });
    }
    let at = -1;
    WORD_LESSONS.forEach((L, i) => { if (L.st === S.st) at = i; });
    WORD_LESSONS.splice(at + 1, 0, ...lessons);
  });
})();
