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
     ex    [sentence, english, alts?] — the sentence marks its gap with «»,
           and may carry its own choices (a て-form gap differs per verb):
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

  /* ---- stage 7 ---- */
  { id: "arimasuka", st: 7, pat: "〜はありますか", m: "Do you have ~? / Is there ~?",
    note: "ある is for things. In a shop it's how you ask if they sell something.",
    ex: [["かばん«は»ありますか。", "Do you have bags?"], ["{赤|あか}い{靴|くつ}«は»ありますか。", "Do you have red shoes?"]] },
  { id: "ga-aru", st: 7, pat: "〜があります / います", m: "There is ~.",
    note: "What's there takes が. Things: あります. People and animals: います.",
    ex: [["{駅|えき}の{前|まえ}に{店|みせ}«が»あります。", "There's a shop in front of the station."], ["ねこ«が»います。", "There's a cat."]] },
  { id: "na-noun", st: 7, pat: "な-adjective + な + noun", m: "a ~ something",
    note: "い-adjectives go straight before a noun ({新|あたら}しい{服|ふく}); な-adjectives need な (きれいなかばん).",
    alts: ["な", "の", "い", "に"],
    ex: [["きれい«な»かばんです。", "It's a pretty bag."], ["{有名|ゆうめい}«な»{店|みせ}です。", "It's a famous shop."]] },
  { id: "kunai", st: 7, pat: "〜くないです", m: "isn't ~ (い-adjectives)",
    note: "Swap the final い for くないです. いい becomes よくないです.",
    alts: ["いです", "くないです", "かったです"],
    ex: [["この{服|ふく}は{高|たか}«くないです»。", "These clothes aren't expensive."], ["この{靴|くつ}は{新|あたら}し«くないです»。", "These shoes aren't new."]] },
  { id: "katta", st: 7, pat: "〜かったです", m: "was ~ (い-adjectives)",
    note: "Swap the final い for かったです. な-adjectives use でした: きれいでした.",
    alts: ["いです", "くないです", "かったです"],
    ex: [["おいし«かったです»。", "It was delicious."], ["{高|たか}«かったです»。", "It was expensive."]] },
  { id: "ni-shimasu", st: 7, pat: "〜にします", m: "I'll have ~ / I'll take ~",
    note: "For deciding, in a shop or at a table.",
    ex: [["これ«に»します。", "I'll take this one."], ["コーヒー«に»します。", "I'll have a coffee."]] },

  /* ---- stage 8 ---- */
  { id: "to", st: 8, pat: "AとB", m: "A and B; with A",
    note: "と joins nouns — not sentences — and says who you do something with.",
    ex: [["コーヒー«と»ケーキをください。", "Coffee and cake, please."], ["{友達|ともだち}«と»{話|はな}します。", "I talk with a friend."]] },
  { id: "kara-made", st: 8, pat: "〜から〜まで", m: "from ~ to ~",
    note: "For times and places alike.",
    alts: ["から", "まで", "に", "で"],
    ex: [["{九時|くじ}«から»{五時|ごじ}まで{働|はたら}きます。", "I work from nine to five."], ["{駅|えき}から{家|いえ}«まで»{歩|ある}きます。", "I walk from the station to my house."]] },
  { id: "amari", st: 8, pat: "あまり〜ません", m: "not ~ much",
    note: "あまり only goes with a negative.",
    alts: ["あまり", "いつも", "よく", "ときどき"],
    ex: [["{肉|にく}は«あまり»{食|た}べません。", "I don't eat much meat."], ["テレビは«あまり»{見|み}ません。", "I don't watch much TV."]] },
  { id: "mashou", st: 8, pat: "〜ましょう", m: "Let's ~",
    note: "Swap ます for ましょう.",
    alts: ["ます", "ません", "ましょう", "ました"],
    ex: [["{行|い}き«ましょう»。", "Let's go."], ["{休|やす}み«ましょう»。", "Let's take a break."]] },
  { id: "masenka", st: 8, pat: "〜ませんか", m: "Won't you ~? / Would you like to ~?",
    note: "A polite invitation: literally, won't you?",
    alts: ["ませんか", "ましょう", "ました", "ます"],
    ex: [["コーヒーを{飲|の}み«ませんか»。", "Would you like a coffee?"], ["{明日|あした}、{会|あ}い«ませんか»。", "Shall we meet tomorrow?"]] },

  /* ---- stage 9 ---- */
  { id: "te-kudasai", st: 9, pat: "〜てください", m: "Please ~",
    note: "The て-form, then ください. The て-form is made like the past, with て for た: {待|ま}った → {待|ま}って.",
    ex: [["ゆっくり{話|はな}«して»ください。", "Please speak slowly.", ["して", "した", "します", "さない"]],
         ["ちょっと{待|ま}«って»ください。", "Please wait a moment.", ["って", "った", "ちます", "たない"]],
         ["{名前|なまえ}を{書|か}«いて»ください。", "Please write your name.", ["いて", "いた", "きます", "って"]]] },
  { id: "te-imasu", st: 9, pat: "〜ています", m: "is ~ing; lives, knows (a state)",
    note: "What's going on now ({勉強|べんきょう}しています), or a state that lasts ({住|す}んでいます, {知|し}っています).",
    ex: [["{今|いま}、{勉強|べんきょう}«して»います。", "I'm studying now.", ["して", "した", "します", "しない"]],
         ["{日本|にほん}に{住|す}«んで»います。", "I live in Japan.", ["んで", "んだ", "みます", "まない"]]] },
  { id: "te-mo-ii", st: 9, pat: "〜てもいいですか", m: "May I ~?",
    note: "The て-form, then もいいですか — literally, is it all right even if I ~?",
    alts: ["てもいいですか", "てください", "ています"],
    ex: [["{写真|しゃしん}を{撮|と}っ«てもいいですか»。", "May I take a photo?"], ["ここに{座|すわ}っ«てもいいですか»。", "May I sit here?"]] },
  { id: "te-kara", st: 9, pat: "〜てから", m: "after ~ing",
    note: "The first thing in the て-form, then から, then what comes next.",
    alts: ["てから", "てください", "ています"],
    ex: [["ご{飯|はん}を{食|た}べ«てから»、{寝|ね}ます。", "After eating, I go to bed."], ["{家|いえ}に{帰|かえ}っ«てから»、{勉強|べんきょう}します。", "After I get home, I study."]] },
  { id: "naide", st: 9, pat: "〜ないでください", m: "Please don't ~",
    note: "The ない form, then でください: {撮|と}らない → {撮|と}らないでください.",
    alts: ["ないでください", "てください", "ません"],
    ex: [["ここで{写真|しゃしん}を{撮|と}ら«ないでください»。", "Please don't take photos here."], ["{窓|まど}を{開|あ}け«ないでください»。", "Please don't open the window."]] },

  /* ---- stage 10 ---- */
  { id: "tai", st: 10, pat: "〜たいです", m: "I want to ~",
    note: "The ます-stem, then たいです: {行|い}きます → {行|い}きたいです.",
    alts: ["たいです", "ます", "ましょう", "ません"],
    ex: [["{日本|にほん}に{行|い}き«たいです»。", "I want to go to Japan."], ["{映画|えいが}を{見|み}«たいです»。", "I want to see a movie."]] },
  { id: "kara-because", st: 10, pat: "〜から、〜", m: "because ~, …",
    note: "The reason first, then から, then what follows from it.",
    alts: ["から", "まで", "が", "と"],
    ex: [["{暑|あつ}いです«から»、{水|みず}を{飲|の}みます。", "It's hot, so I'll drink some water."], ["{忙|いそが}しいです«から»、{行|い}きません。", "I'm busy, so I won't go."]] },
  { id: "ga-but", st: 10, pat: "〜が、〜", m: "~, but …",
    note: "A polite but. でも starts a new sentence instead: でも、…",
    alts: ["が", "から", "と", "を"],
    ex: [["{高|たか}いです«が»、おいしいです。", "It's expensive, but it's good."], ["{少|すこ}し{寒|さむ}いです«が»、{大丈夫|だいじょうぶ}です。", "It's a bit cold, but I'm fine."]] },
  { id: "ne-yo", st: 10, pat: "〜ね / 〜よ", m: "…, isn't it? / …, you know.",
    note: "ね looks for agreement; よ tells someone something they may not know.",
    alts: ["ね", "よ", "か", "が"],
    ex: [["いい{天気|てんき}です«ね»。", "Nice weather, isn't it?"], ["この{店|みせ}はおいしいです«よ»。", "This place is good, you know."]] },
  { id: "plain", st: 10, pat: "Casual forms", m: "the plain forms friends use",
    note: "Among friends, ます and です drop away: {行|い}きます → {行|い}く, {行|い}きません → {行|い}かない, {行|い}きました → {行|い}った. You'll hear them long before you need to use them.",
    ex: [["{明日|あした}{行|い}く。", "I'll go tomorrow. (casual)"], ["{昨日|きのう}{見|み}た。", "I saw it yesterday. (casual)"], ["{今日|きょう}は{行|い}かない。", "I'm not going today. (casual)"]] },
];

/* ---- derived ---- */

const dropGap = s => s.replace(/[«»]/g, "");
PATTERNS.forEach(p => {
  p.key = "g:" + p.id;
  p.ex = p.ex.map(([jp, en, alts]) => {
    const gap = (jp.match(/«([^»]+)»/) || [])[1] || null;
    return { jp: dropGap(jp), en, gap, gapped: jp, kana: furiKana(dropGap(jp)), alts: alts || null };
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
