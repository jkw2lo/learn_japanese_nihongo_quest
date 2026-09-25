/* Nihongo Quest — words, stages 2 to 5.

   Each entry:
     w    the word as it's usually written, in furigana markup ({食|た}べる)
     m    meaning
     pos  part of speech: exp (a set phrase), n, num, pron, v1 (ichidan verb),
          v5<ending> (godan verb, e.g. v5m for 飲む), adj-i, adj-na, adv,
          part (particle), cop (です)
     st   stage
     r    romaji, only where spelling and sound part ways (こんにちは → konnichiwa)
     say  what the voice should read, where it isn't the spelling: the particle
          は is said わ, and its spelling alone would play the kana は, "ha"
     note something worth knowing (furigana markup allowed)
     ex   example sentences: [markup, english]

   Kanji appear as they're really written, with furigana until the learner
   knows them (README → Reading never outruns you). Kanji aren't taught
   until step 8, so for now every kanji comes with its reading.

   A word's key is "w:" + its plain written form; smoke.mjs checks they're
   unique and that every string's markup is sound. */

const WORD_STAGES = [
  { st: 2, jp: "あいさつ", en: "Survival phrases", about: "The phrases you'd use on your first day: hello, thank you, sorry, I don't understand. Learn them as whole chunks — there's grammar inside, but you don't need it yet." },
  { st: 3, jp: "数", en: "Numbers, time and money", about: "Counting to ten thousand, telling the time, and asking how much. Japanese numbers are regular: 11 is ten-one, 20 is two-ten." },
  { st: 4, jp: "私", en: "Me and you", about: "Saying who you are and asking about others: X は Y です — “X is Y”. は (read wa) marks what you're talking about." },
  { st: 5, jp: "食べる", en: "Food and ordering", about: "Food, drink, and how to order it. 〜をください — “~, please” — gets you a long way." },
];

const WORDS = [
  /* ---- stage 2 · survival phrases ---- */
  { w: "おはようございます", m: "good morning", pos: "exp", st: 2, note: "Polite. With friends, just おはよう." },
  { w: "こんにちは", m: "hello; good afternoon", pos: "exp", st: 2, r: "konnichiwa", note: "The last は is read wa." },
  { w: "こんばんは", m: "good evening", pos: "exp", st: 2, r: "konbanwa", note: "The last は is read wa." },
  { w: "さようなら", m: "goodbye", pos: "exp", st: 2, note: "Quite final — for a long parting. Day to day, people say じゃあね or またね." },
  { w: "ありがとうございます", m: "thank you (polite)", pos: "exp", st: 2 },
  { w: "どうも", m: "thanks", pos: "exp", st: 2, note: "Short and handy — to a shop assistant, say." },
  { w: "すみません", m: "excuse me; sorry", pos: "exp", st: 2, note: "Gets a waiter's attention, says sorry, and even says thanks for the trouble." },
  { w: "ごめんなさい", m: "I'm sorry", pos: "exp", st: 2 },
  { w: "はい", m: "yes", pos: "exp", st: 2 },
  { w: "いいえ", m: "no", pos: "exp", st: 2 },
  { w: "おねがいします", m: "please", pos: "exp", st: 2, note: "When asking for something: コーヒー、おねがいします.",
    ex: [["コーヒー、おねがいします。", "A coffee, please."]] },
  { w: "どうぞ", m: "please, go ahead; here you are", pos: "exp", st: 2 },
  { w: "わかりました", m: "I understand; OK", pos: "exp", st: 2 },
  { w: "わかりません", m: "I don't understand", pos: "exp", st: 2 },
  { w: "{大丈夫|だいじょうぶ}です", m: "it's OK; I'm fine", pos: "exp", st: 2 },
  { w: "はじめまして", m: "nice to meet you", pos: "exp", st: 2, note: "Only the first time you meet someone." },
  { w: "よろしくおねがいします", m: "pleased to meet you", pos: "exp", st: 2, note: "Literally “please treat me well”. Said after introducing yourself, and in many other places." },
  { w: "おやすみなさい", m: "good night", pos: "exp", st: 2 },
  { w: "いただきます", m: "(said before eating)", pos: "exp", st: 2, note: "Roughly “I humbly receive”. Everyone says it, hands together, before a meal." },
  { w: "ごちそうさまでした", m: "(said after eating)", pos: "exp", st: 2, note: "Thanks for the meal — to the cook, or the restaurant as you leave." },
  { w: "トイレはどこですか", m: "where is the toilet?", pos: "exp", st: 2, r: "toire wa doko desu ka", note: "は here is read wa." },
  { w: "もう{一度|いちど}おねがいします", m: "once more, please", pos: "exp", st: 2 },
  { w: "{英語|えいご}でいいですか", m: "is English OK?", pos: "exp", st: 2 },
  { w: "ちょっと{待|ま}ってください", m: "wait a moment, please", pos: "exp", st: 2 },

  /* ---- stage 3 · numbers, time, money ---- */
  { w: "{一|いち}", m: "one", pos: "num", st: 3 },
  { w: "{二|に}", m: "two", pos: "num", st: 3 },
  { w: "{三|さん}", m: "three", pos: "num", st: 3 },
  { w: "{四|よん}", m: "four", pos: "num", st: 3, note: "Also し, but し sounds like death ({死|し}), so よん is usual." },
  { w: "{五|ご}", m: "five", pos: "num", st: 3 },
  { w: "{六|ろく}", m: "six", pos: "num", st: 3 },
  { w: "{七|なな}", m: "seven", pos: "num", st: 3, note: "Also しち." },
  { w: "{八|はち}", m: "eight", pos: "num", st: 3 },
  { w: "{九|きゅう}", m: "nine", pos: "num", st: 3, note: "Also く, which is avoided for the same reason as し." },
  { w: "{十|じゅう}", m: "ten", pos: "num", st: 3, note: "Eleven is じゅういち (ten-one); twenty is にじゅう (two-ten)." },
  { w: "{百|ひゃく}", m: "hundred", pos: "num", st: 3, note: "300 is さんびゃく, 600 ろっぴゃく, 800 はっぴゃく — the sound shifts." },
  { w: "{千|せん}", m: "thousand", pos: "num", st: 3, note: "3000 is さんぜん, 8000 はっせん." },
  { w: "{一万|いちまん}", m: "ten thousand", pos: "num", st: 3, note: "Japanese counts in ten-thousands: 100,000 is じゅうまん, “ten ten-thousands”." },
  { w: "{円|えん}", m: "yen", pos: "n", st: 3, ex: [["{三百|さんびゃく}{円|えん}です。", "It's 300 yen."]] },
  { w: "いくら", m: "how much", pos: "pron", st: 3, ex: [["これはいくらですか。", "How much is this?"]] },
  { w: "{全部|ぜんぶ}で", m: "in total; altogether", pos: "exp", st: 3, ex: [["{全部|ぜんぶ}でいくらですか。", "How much is it altogether?"]] },
  { w: "{高|たか}い", m: "expensive; tall", pos: "adj-i", st: 3 },
  { w: "{安|やす}い", m: "cheap", pos: "adj-i", st: 3 },
  { w: "{今|いま}", m: "now", pos: "n", st: 3 },
  { w: "{何時|なんじ}", m: "what time", pos: "pron", st: 3, ex: [["{今|いま}{何時|なんじ}ですか。", "What time is it now?"]] },
  { w: "{時|じ}", m: "o'clock (〜時)", pos: "n", st: 3, note: "After a number: {三時|さんじ} is three o'clock. Four o'clock is よじ, nine is くじ.",
    ex: [["{三時|さんじ}です。", "It's three o'clock."]] },
  { w: "{半|はん}", m: "half past", pos: "n", st: 3, ex: [["{七時|しちじ}{半|はん}です。", "It's half past seven."]] },
  { w: "{分|ふん}", m: "minute(s)", pos: "n", st: 3, note: "The sound shifts after some numbers: いっぷん, さんぷん, じゅっぷん." },
  { w: "{今日|きょう}", m: "today", pos: "n", st: 3 },
  { w: "{明日|あした}", m: "tomorrow", pos: "n", st: 3 },
  { w: "{昨日|きのう}", m: "yesterday", pos: "n", st: 3 },
  { w: "{毎日|まいにち}", m: "every day", pos: "n", st: 3 },
  { w: "{午前|ごぜん}", m: "a.m.; morning", pos: "n", st: 3 },
  { w: "{午後|ごご}", m: "p.m.; afternoon", pos: "n", st: 3, ex: [["{午後|ごご}{二時|にじ}です。", "It's 2 p.m."]] },

  /* ---- stage 4 · me and you ---- */
  { w: "{私|わたし}", m: "I; me", pos: "pron", st: 4, ex: [["{私|わたし}は{学生|がくせい}です。", "I'm a student."]] },
  { w: "あなた", m: "you", pos: "pron", st: 4, note: "Used much less than “you” — people use names instead: {田中|たなか}さんは…" },
  { w: "です", m: "is; am; are", pos: "cop", st: 4, note: "Polite, and ends the sentence: X は Y です, “X is Y”." },
  { w: "じゃないです", m: "is not", pos: "cop", st: 4, ex: [["{私|わたし}は{先生|せんせい}じゃないです。", "I'm not a teacher."]] },
  { w: "は", m: "(marks the topic)", pos: "part", st: 4, r: "wa", say: "わ", note: "Written は, read wa: {私|わたし}は… “As for me…”." },
  { w: "か", m: "(makes a question)", pos: "part", st: 4, note: "Put it at the end: です → ですか. No question mark needed, though you'll see one.",
    ex: [["{学生|がくせい}ですか。", "Are you a student?"]] },
  { w: "の", m: "'s; of", pos: "part", st: 4, ex: [["これは{私|わたし}の{本|ほん}です。", "This is my book."]] },
  { w: "{名前|なまえ}", m: "name", pos: "n", st: 4, ex: [["お{名前|なまえ}は{何|なん}ですか。", "What's your name?"]] },
  { w: "{何|なん}", m: "what", pos: "pron", st: 4, note: "なん before です; なに elsewhere." },
  { w: "だれ", m: "who", pos: "pron", st: 4, ex: [["あの{人|ひと}はだれですか。", "Who is that person?"]] },
  { w: "{人|ひと}", m: "person", pos: "n", st: 4 },
  { w: "{日本|にほん}", m: "Japan", pos: "n", st: 4 },
  { w: "{日本人|にほんじん}", m: "Japanese person", pos: "n", st: 4, note: "Country + じん: アメリカじん, イギリスじん." },
  { w: "{日本語|にほんご}", m: "Japanese (language)", pos: "n", st: 4, note: "Country + ご is its language." },
  { w: "{英語|えいご}", m: "English (language)", pos: "n", st: 4 },
  { w: "{学生|がくせい}", m: "student", pos: "n", st: 4 },
  { w: "{先生|せんせい}", m: "teacher", pos: "n", st: 4, note: "Also a title for doctors and other experts." },
  { w: "{会社員|かいしゃいん}", m: "office worker", pos: "n", st: 4 },
  { w: "{友達|ともだち}", m: "friend", pos: "n", st: 4 },
  { w: "{家族|かぞく}", m: "family", pos: "n", st: 4 },
  { w: "この", m: "this (+ noun)", pos: "pron", st: 4, note: "この / その / あの come before a noun; これ / それ / あれ stand alone." },
  { w: "その", m: "that (+ noun, near you)", pos: "pron", st: 4 },
  { w: "あの", m: "that (+ noun, over there)", pos: "pron", st: 4 },
  { w: "どこ", m: "where", pos: "pron", st: 4, ex: [["{駅|えき}はどこですか。", "Where's the station?"]] },
  { w: "{好|す}き", m: "liked; to like", pos: "adj-na", st: 4, note: "The thing you like takes が: ねこが{好|す}きです, I like cats.",
    ex: [["ねこが{好|す}きです。", "I like cats."]] },

  /* ---- stage 5 · food and ordering ---- */
  { w: "{食|た}べる", m: "to eat", pos: "v1", st: 5, note: "Polite form: {食|た}べます.", ex: [["パンを{食|た}べます。", "I eat bread."]] },
  { w: "{飲|の}む", m: "to drink", pos: "v5m", st: 5, note: "Polite form: {飲|の}みます.", ex: [["{水|みず}を{飲|の}みます。", "I drink water."]] },
  { w: "を", m: "(marks what's acted on)", pos: "part", st: 5, r: "o", note: "Written を, read o: パンを{食|た}べます." },
  { w: "ください", m: "please give me", pos: "exp", st: 5, ex: [["コーヒーをください。", "A coffee, please."]] },
  { w: "{水|みず}", m: "water", pos: "n", st: 5, note: "In a restaurant, politely: お{水|みず}." },
  { w: "お{茶|ちゃ}", m: "(green) tea", pos: "n", st: 5 },
  { w: "ご{飯|はん}", m: "rice; a meal", pos: "n", st: 5 },
  { w: "{肉|にく}", m: "meat", pos: "n", st: 5 },
  { w: "{魚|さかな}", m: "fish", pos: "n", st: 5, ex: [["{魚|さかな}が{好|す}きです。", "I like fish."]] },
  { w: "{野菜|やさい}", m: "vegetables", pos: "n", st: 5 },
  { w: "{卵|たまご}", m: "egg", pos: "n", st: 5 },
  { w: "{朝|あさ}ご{飯|はん}", m: "breakfast", pos: "n", st: 5 },
  { w: "{昼|ひる}ご{飯|はん}", m: "lunch", pos: "n", st: 5 },
  { w: "{晩|ばん}ご{飯|はん}", m: "dinner", pos: "n", st: 5 },
  { w: "おいしい", m: "delicious", pos: "adj-i", st: 5 },
  { w: "{甘|あま}い", m: "sweet", pos: "adj-i", st: 5 },
  { w: "{辛|から}い", m: "spicy; hot", pos: "adj-i", st: 5 },
  { w: "{一|ひと}つ", m: "one (thing)", pos: "num", st: 5, note: "Counting things: ひとつ, ふたつ, みっつ… A different set from いち, に, さん.",
    ex: [["ビールを{一|ひと}つください。", "One beer, please."]] },
  { w: "{二|ふた}つ", m: "two (things)", pos: "num", st: 5 },
  { w: "{三|みっ}つ", m: "three (things)", pos: "num", st: 5 },
  { w: "おすすめ", m: "recommendation", pos: "n", st: 5, ex: [["おすすめは{何|なん}ですか。", "What do you recommend?"]] },
  { w: "{注文|ちゅうもん}", m: "an order", pos: "n", st: 5 },
  { w: "お{会計|かいけい}", m: "the bill", pos: "n", st: 5, ex: [["お{会計|かいけい}をおねがいします。", "The bill, please."]] },
  { w: "{店|みせ}", m: "shop; restaurant", pos: "n", st: 5 },
  { w: "{一人|ひとり}", m: "one person", pos: "n", st: 5, note: "Two people is {二人|ふたり}; after that, さんにん, よにん…",
    ex: [["{二人|ふたり}です。", "Two of us. (at the door)"]] },
];

/* ---- derived: keys, kana, lessons of five ---- */

WORDS.forEach(x => {
  x.key = "w:" + furiPlain(x.w);
  x.kana = furiKana(x.w);
  x.say = x.say || x.kana;
  x.plain = furiPlain(x.w);
  x.units = kanaUnits(x.kana);
  if (!x.r) x.r = toRomaji(x.kana);
  x.ex = x.ex || [];
});
const WORD_BY = {};
WORDS.forEach(x => { WORD_BY[x.key] = x; });

const WORD_LESSON_SIZE = 5;
const WORD_LESSONS = [];
WORD_STAGES.forEach(S => {
  const ws = WORDS.filter(x => x.st === S.st);
  for (let i = 0; i < ws.length; i += WORD_LESSON_SIZE) {
    const n = i / WORD_LESSON_SIZE + 1;
    WORD_LESSONS.push({
      id: `w${S.st}-${n}`, set: "w", st: S.st, kind: "words", title: `${S.jp} ${n}`,
      items: ws.slice(i, i + WORD_LESSON_SIZE).map(x => x.key),
    });
  }
});
