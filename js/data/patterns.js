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

/* ---- teaching (README → Patterns → Teaching a pattern) ----

   A pattern with a teach entry gets a guided lesson rather than one card:
     talk    a few lines of conversation where the pattern does its job
             [who, sentence, english]
     built   one sentence cut into its parts, each with its job:
             { parts: [[jp, job]…], hl: [the pattern's parts], en }
     rule    the rule in a line
     vs      a mix-up, side by side: { a: [jp, en], b: [jp, en], why }
     tiles   sentences to build from tiles: [[tiles…], english, decoys?] —
             the tiles in order are the sentence; decoys are extra tiles
             that belong nowhere in it
     change  turn one sentence into another:
             { from, do, to, wrong: [three that look close] }
   Every sentence uses only words from the pattern's stage or before (and
   kana words), and smoke.mjs checks every kanji. Stages 3 and 4 first. */
const PATTERN_TEACH = {
  ikura: {
    talk: [["A", "すみません、これはいくらですか。", "Excuse me, how much is this?"],
           ["B", "{三百円|さんびゃくえん}です。", "It's 300 yen."],
           ["A", "ありがとうございます。", "Thank you."]],
    built: { parts: [["これ", "this"], ["は", "what you're asking about"], ["いくら", "how much"], ["です", "is"], ["か", "makes it a question"]],
             hl: [1, 2, 3, 4], en: "How much is this?" },
    rule: "Say the thing first, then はいくらですか.",
    tiles: [[["コーヒー", "は", "いくら", "ですか。"], "How much is the coffee?", ["が"]],
            [["これ", "は", "いくら", "ですか。"], "How much is this?", ["を"]]],
  },
  ji: {
    talk: [["A", "すみません、{今|いま}{何時|なんじ}ですか。", "Excuse me, what time is it?"],
           ["B", "{三時|さんじ}です。", "It's three o'clock."],
           ["A", "ありがとうございます。", "Thank you."]],
    built: { parts: [["{今|いま}、", "now"], ["{三|さん}", "three"], ["{時|じ}", "o'clock"], ["{半|はん}", "half past"], ["です", "is"]],
             hl: [2, 3], en: "It's half past three now." },
    rule: "A number, then {時|じ}; add {半|はん} for half past. Watch two: {四時|よじ} is yoji and {九時|くじ} is kuji.",
    tiles: [[["{午後|ごご}", "{三時|さんじ}", "{半|はん}", "です。"], "It's half past three in the afternoon.", ["{分|ふん}"]]],
    change: [{ from: "{三時|さんじ}です。", do: "Make it half past", to: "{三時半|さんじはん}です。",
               wrong: ["{半|はん}{三時|さんじ}です。", "{三時|さんじ}{分|ふん}です。", "{三時|さんじ}ですか。"] }],
  },
  "wa-desu": {
    talk: [["A", "はじめまして。{私|わたし}はスミスです。", "Nice to meet you. I'm Smith."],
           ["B", "はじめまして。{私|わたし}はキムです。{学生|がくせい}です。", "Nice to meet you. I'm Kim. I'm a student."],
           ["A", "よろしくおねがいします。", "Pleased to meet you."]],
    built: { parts: [["{私|わたし}", "I"], ["は", "the topic: as for me"], ["{学生|がくせい}", "a student"], ["です", "am — always last"]],
             hl: [1, 3], en: "I'm a student." },
    rule: "は (said wa) marks what you're talking about; です closes the sentence, and the verb always comes last.",
    vs: { a: ["{私|わたし}は{学生|がくせい}です。", "I'm a student."], b: ["{学生|がくせい}は{私|わたし}です。", "The student is me."],
          why: "Whatever comes before は is what the sentence is about. Swap the two sides and you've said something else." },
    tiles: [[["スミスさん", "は", "{先生|せんせい}", "です。"], "Mr Smith is a teacher.", ["か"]],
            [["{私|わたし}", "は", "{会社員|かいしゃいん}", "です。"], "I'm an office worker.", ["の"]]],
  },
  janai: {
    talk: [["A", "{先生|せんせい}ですか。", "Are you a teacher?"],
           ["B", "いいえ、{先生|せんせい}じゃないです。{学生|がくせい}です。", "No, I'm not a teacher. I'm a student."]],
    built: { parts: [["これ", "this"], ["は", "the topic"], ["ペン", "a pen"], ["じゃないです", "is not"]],
             hl: [3], en: "This isn't a pen." },
    rule: "Swap です for じゃないです to say it isn't. Nothing else moves.",
    tiles: [[["{私|わたし}", "は", "{日本人|にほんじん}", "じゃないです。"], "I'm not Japanese.", ["です。"]]],
    change: [{ from: "{私|わたし}は{先生|せんせい}です。", do: "Make it not", to: "{私|わたし}は{先生|せんせい}じゃないです。",
               wrong: ["{私|わたし}は{先生|せんせい}ですか。", "{私|わたし}じゃない{先生|せんせい}です。", "{私|わたし}は{先生|せんせい}ないです。"] },
             { from: "これはペンです。", do: "Make it not", to: "これはペンじゃないです。",
               wrong: ["これはペンですか。", "これじゃないペンです。", "これはペンないです。"] }],
  },
  desuka: {
    talk: [["A", "{日本人|にほんじん}ですか。", "Are you Japanese?"],
           ["B", "いいえ、{日本人|にほんじん}じゃないです。", "No, I'm not Japanese."],
           ["A", "{学生|がくせい}ですか。", "Are you a student?"],
           ["B", "はい、{学生|がくせい}です。", "Yes, I'm a student."]],
    built: { parts: [["あの", "that"], ["{人|ひと}", "person"], ["は", "the topic"], ["だれ", "who"], ["です", "is"], ["か", "makes it a question"]],
             hl: [5], en: "Who is that person?" },
    rule: "か on the end makes a question, and the word order stays the same. A question word like だれ or {何|なん} sits where the answer will go.",
    vs: { a: ["{学生|がくせい}です。", "I'm a student."], b: ["{学生|がくせい}ですか。", "Are you a student?"],
          why: "One か is all the difference. Said aloud, the voice rises at the end too." },
    tiles: [[["あなた", "は", "{学生|がくせい}", "ですか。"], "Are you a student?"],
            [["{名前|なまえ}", "は", "{何|なん}", "ですか。"], "What's your name?", ["だれ"]]],
    change: [{ from: "スミスさんは{先生|せんせい}です。", do: "Make it a question", to: "スミスさんは{先生|せんせい}ですか。",
               wrong: ["スミスさんは{先生|せんせい}じゃないです。", "かスミスさんは{先生|せんせい}です。", "スミスさんか{先生|せんせい}です。"] }],
  },
  no: {
    talk: [["A", "これはだれのペンですか。", "Whose pen is this?"],
           ["B", "{私|わたし}のペンです。", "It's my pen."],
           ["A", "どうぞ。", "Here you are."]],
    built: { parts: [["{日本語|にほんご}", "Japanese"], ["の", "joins two nouns"], ["{先生|せんせい}", "teacher"], ["です", "is"]],
             hl: [1], en: "I'm a Japanese teacher." },
    rule: "AのB: B is the thing itself; A says whose it is or what kind.",
    vs: { a: ["{日本語|にほんご}の{先生|せんせい}です。", "I'm a Japanese teacher (I teach Japanese)."], b: ["{日本人|にほんじん}の{先生|せんせい}です。", "I'm a teacher who's Japanese."],
          why: "After の is what it is — a teacher, both times. Before の says which kind." },
    tiles: [[["{私|わたし}", "の", "{友達|ともだち}", "です。"], "This is my friend.", ["は"]],
            [["{私|わたし}", "の", "{名前|なまえ}", "は", "スミス", "です。"], "My name is Smith.", ["が"]]],
  },
  kono: {
    talk: [["A", "この{人|ひと}はだれですか。", "Who is this person?"],
           ["B", "{私|わたし}の{友達|ともだち}です。", "My friend."],
           ["A", "あの{人|ひと}は？", "And that person over there?"],
           ["B", "{私|わたし}の{先生|せんせい}です。", "My teacher."]],
    built: { parts: [["この", "this — leads into a noun"], ["{人|ひと}", "person"], ["は", "the topic"], ["{友達|ともだち}", "a friend"], ["です", "is"]],
             hl: [0], en: "This person is my friend." },
    rule: "この, その and あの always lead into a noun. Standing alone, it's これ, それ and あれ.",
    vs: { a: ["この{人|ひと}は{先生|せんせい}です。", "This person is a teacher."], b: ["これは{先生|せんせい}のペンです。", "This is the teacher's pen."],
          why: "この needs a noun after it — この{人|ひと}. これ stands on its own — これは… その/それ and あの/あれ work the same way." },
    tiles: [[["あの", "{人|ひと}", "は", "だれ", "ですか。"], "Who is that person over there?", ["あれ"]],
            [["この", "ペン", "は", "{私|わたし}", "の", "です。"], "This pen is mine.", ["これ"]]],
  },
  mo: {
    talk: [["A", "{私|わたし}は{学生|がくせい}です。", "I'm a student."],
           ["B", "{私|わたし}も{学生|がくせい}です。", "I'm a student too."]],
    built: { parts: [["{私|わたし}", "I"], ["も", "too — in は's place"], ["{学生|がくせい}", "a student"], ["です", "am"]],
             hl: [1], en: "I'm a student too." },
    rule: "も takes the place of は — never both.",
    vs: { a: ["{私|わたし}は{学生|がくせい}です。", "I'm a student."], b: ["{私|わたし}も{学生|がくせい}です。", "I'm a student too."],
          why: "The same sentence, except も says it's true of you as well as whoever was just mentioned." },
    tiles: [[["スミスさん", "も", "{先生|せんせい}", "です。"], "Mr Smith is a teacher too.", ["は"]]],
    change: [{ from: "{私|わたし}は{日本人|にほんじん}です。", do: "Say it's true of you too", to: "{私|わたし}も{日本人|にほんじん}です。",
               wrong: ["{私|わたし}はも{日本人|にほんじん}です。", "{私|わたし}は{日本人|にほんじん}もです。", "{私|わたし}の{日本人|にほんじん}です。"] }],
  },
  suki: {
    talk: [["A", "{日本語|にほんご}が{好|す}きですか。", "Do you like Japanese?"],
           ["B", "はい、{好|す}きです。", "Yes, I do."]],
    built: { parts: [["ねこ", "cats"], ["が", "the thing that's liked"], ["{好|す}き", "liked"], ["です", "is"]],
             hl: [1, 2], en: "I like cats." },
    rule: "Japanese says the thing is liked: it takes が — not を — and {好|す}き is closed with です.",
    vs: { a: ["ねこが{好|す}きです。", "I like cats."], b: ["ねこは{好|す}きです。", "Cats, I like (others maybe not)."],
          why: "が is the plain way to say what you like. は makes it the topic — often to set it against something else." },
    tiles: [[["{日本語|にほんご}", "が", "{好|す}き", "です。"], "I like Japanese.", ["を"]]],
    change: [{ from: "ねこが{好|す}きです。", do: "Make it a question", to: "ねこが{好|す}きですか。",
               wrong: ["ねこを{好|す}きですか。", "ねこが{好|す}きじゃないです。", "ねこか{好|す}きです。"] }],
  },
};

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
PATTERNS.forEach(p => { if (PATTERN_TEACH[p.id]) p.teach = PATTERN_TEACH[p.id]; });

/* Every sentence a pattern can say — its examples and its teaching — as
   the text its recording is under (tools/make-audio.mjs records them all). */
function patternSay(p) {
  const out = p.ex.map(e => e.kana);
  const t = p.teach;
  if (t) {
    t.talk.forEach(([, jp]) => out.push(furiKana(jp)));
    out.push(furiKana(t.built.parts.map(x => x[0]).join("") + "。"));
    t.built.parts.forEach(x => out.push(furiKana(x[0])));      /* each part is tappable too */
    if (t.vs) out.push(furiKana(t.vs.a[0]), furiKana(t.vs.b[0]));
    (t.tiles || []).forEach(([tiles]) => out.push(furiKana(tiles.join(""))));
    (t.change || []).forEach(x => out.push(furiKana(x.from), furiKana(x.to)));
  }
  return [...new Set(out)];
}

/* Pattern lessons go in after the last word lesson of their stage. */
(function placePatternLessons() {
  WORD_STAGES.forEach(S => {
    const ps = PATTERNS.filter(p => p.st === S.st);
    if (!ps.length) return;
    const lessons = [];
    /* a guided lesson is longer, so three to a lesson rather than four */
    const size = ps.every(p => PATTERN_TEACH[p.id]) ? 3 : 4;
    for (let i = 0; i < ps.length; i += size) {
      const n = i / size + 1;
      lessons.push({ id: `g${S.st}-${n}`, set: "w", st: S.st, kind: "patterns",
        title: `文型 · ${S.jp}${ps.length > size ? " " + n : ""}`, items: ps.slice(i, i + size).map(p => p.key) });
    }
    let at = -1;
    WORD_LESSONS.forEach((L, i) => { if (L.st === S.st) at = i; });
    WORD_LESSONS.splice(at + 1, 0, ...lessons);
  });
})();
