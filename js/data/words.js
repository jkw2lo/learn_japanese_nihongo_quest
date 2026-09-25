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
  { st: 6, jp: "行く", en: "Getting around", about: "Trains, stations and directions. に marks where you're going and で how you get there: {電車|でんしゃ}で{行|い}きます, I'll go by train. Verbs get their polite forms here — {行|い}きます, {行|い}きません, {行|い}きました." },
  { st: 7, jp: "買う", en: "Shopping", about: "Buying things and describing them. い-adjectives change their ending — {高|たか}くないです, {高|たか}かったです; な-adjectives take な before a noun: きれいなかばん. ある is there is, for things; いる is for people and animals." },
  { st: 8, jp: "毎日", en: "Daily life", about: "The verbs of an ordinary day — getting up, working, reading, meeting people — and how often you do them. Plus two handy endings: 〜ましょう, let's, and 〜ませんか, won't you?" },
  { st: 9, jp: "て形", en: "The て-form", about: "One verb form that does a lot: ask someone to do something (〜てください), say what's going on (〜ています), ask permission (〜てもいいですか). It's built the same way as the past — {待|ま}って, {待|ま}った." },
  { st: 10, jp: "まとめ", en: "Wrapping up N5", about: "Wanting (〜たい), because and but, the casual forms you'll hear from friends, and words for weather, feelings and the calendar." },
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

  /* ---- stage 6 · getting around ---- */
  { w: "{行|い}く", m: "to go", pos: "v5k-s", st: 6, note: "Its て-form is {行|い}って — the one exception among く verbs.",
    ex: [["{駅|えき}に{行|い}きます。", "I'm going to the station."]] },
  { w: "{来|く}る", m: "to come", pos: "vk", st: 6, note: "Irregular: {来|き}ます, {来|こ}ない — even the kanji's reading changes.",
    ex: [["{明日|あした}また{来|き}ます。", "I'll come again tomorrow."]] },
  { w: "{帰|かえ}る", m: "to go home; to return", pos: "v5r", st: 6, note: "Looks like {食|た}べる but conjugates like {乗|の}る: {帰|かえ}ります.",
    ex: [["{家|うち}に{帰|かえ}ります。", "I'm going home."]] },
  { w: "{乗|の}る", m: "to ride; to get on", pos: "v5r", st: 6, note: "What you get on takes に: {電車|でんしゃ}に{乗|の}ります.",
    ex: [["バスに{乗|の}ります。", "I get on the bus."]] },
  { w: "{降|お}りる", m: "to get off", pos: "v1", st: 6, ex: [["{次|つぎ}の{駅|えき}で{降|お}ります。", "I get off at the next station."]] },
  { w: "{歩|ある}く", m: "to walk", pos: "v5k", st: 6 },
  { w: "{待|ま}つ", m: "to wait", pos: "v5t", st: 6, ex: [["バスを{待|ま}ちます。", "I'm waiting for the bus."]] },
  { w: "わかる", m: "to understand", pos: "v5r", st: 6, note: "You met わかりました and わかりません as phrases — here's the verb they come from." },
  { w: "{駅|えき}", m: "station", pos: "n", st: 6, ex: [["{駅|えき}は{近|ちか}いですか。", "Is the station near?"]] },
  { w: "{電車|でんしゃ}", m: "train", pos: "n", st: 6, ex: [["{電車|でんしゃ}で{行|い}きます。", "I'll go by train."]] },
  { w: "{地下鉄|ちかてつ}", m: "subway", pos: "n", st: 6 },
  { w: "{切符|きっぷ}", m: "ticket", pos: "n", st: 6 },
  { w: "{出口|でぐち}", m: "exit", pos: "n", st: 6, ex: [["{出口|でぐち}はどこですか。", "Where's the exit?"]] },
  { w: "{入口|いりぐち}", m: "entrance", pos: "n", st: 6 },
  { w: "{右|みぎ}", m: "right", pos: "n", st: 6 },
  { w: "{左|ひだり}", m: "left", pos: "n", st: 6 },
  { w: "まっすぐ", m: "straight ahead", pos: "adv", st: 6 },
  { w: "そこ", m: "there (near you)", pos: "pron", st: 6, note: "ここ here, そこ there, あそこ over there — like これ, それ, あれ." },
  { w: "あそこ", m: "over there", pos: "pron", st: 6 },
  { w: "{近|ちか}い", m: "near", pos: "adj-i", st: 6 },
  { w: "{遠|とお}い", m: "far", pos: "adj-i", st: 6 },
  { w: "に", m: "to; at (where you're going; a time)", pos: "part", st: 6, ex: [["{三時|さんじ}に{行|い}きます。", "I'll go at three."]] },
  { w: "で", m: "by; at (how; where something happens)", pos: "part", st: 6, ex: [["{駅|えき}で{待|ま}ちます。", "I'll wait at the station."]] },
  { w: "へ", m: "towards", pos: "part", st: 6, r: "e", say: "え", note: "Written へ, read e — like は read wa.", ex: [["{日本|にほん}へ{行|い}きます。", "I'm going to Japan."]] },

  /* ---- stage 7 · shopping ---- */
  { w: "{買|か}う", m: "to buy", pos: "v5u", st: 7, ex: [["お{土産|みやげ}を{買|か}います。", "I'll buy souvenirs."]] },
  { w: "{見|み}る", m: "to see; to look at; to watch", pos: "v1", st: 7, ex: [["メニューを{見|み}ます。", "I'll look at the menu."]] },
  { w: "ある", m: "to be; to have (things)", pos: "v5r-i", st: 7, note: "For things. For people and animals, it's いる. Its plain negative is just ない.",
    ex: [["トイレはありますか。", "Is there a toilet?"]] },
  { w: "いる", m: "to be (people, animals)", pos: "v1", st: 7, ex: [["ねこがいます。", "There's a cat."]] },
  { w: "{大|おお}きい", m: "big", pos: "adj-i", st: 7 },
  { w: "{小|ちい}さい", m: "small", pos: "adj-i", st: 7 },
  { w: "{新|あたら}しい", m: "new", pos: "adj-i", st: 7 },
  { w: "{古|ふる}い", m: "old (things)", pos: "adj-i", st: 7, note: "For things. An old person is {年|とし}を{取|と}った{人|ひと} — not ふるい." },
  { w: "いい", m: "good", pos: "adj-i", st: 7, note: "The one irregular い-adjective: よくないです, not good; よかったです, it was good." },
  { w: "{悪|わる}い", m: "bad", pos: "adj-i", st: 7 },
  { w: "{赤|あか}い", m: "red", pos: "adj-i", st: 7 },
  { w: "{白|しろ}い", m: "white", pos: "adj-i", st: 7 },
  { w: "{黒|くろ}い", m: "black", pos: "adj-i", st: 7 },
  { w: "{青|あお}い", m: "blue", pos: "adj-i", st: 7, note: "Traffic lights' green is also あお." },
  { w: "きれい", m: "pretty; clean", pos: "adj-na", st: 7, note: "Ends in い but it's a な-adjective: きれいなかばん." },
  { w: "{有名|ゆうめい}", m: "famous", pos: "adj-na", st: 7 },
  { w: "{服|ふく}", m: "clothes", pos: "n", st: 7 },
  { w: "{靴|くつ}", m: "shoes", pos: "n", st: 7 },
  { w: "かばん", m: "bag", pos: "n", st: 7 },
  { w: "{財布|さいふ}", m: "wallet", pos: "n", st: 7 },
  { w: "お{土産|みやげ}", m: "souvenir", pos: "n", st: 7 },
  { w: "カード", m: "(credit) card", pos: "n", st: 7, ex: [["カードでいいですか。", "Can I pay by card?"]] },
  { w: "どれ", m: "which one", pos: "pron", st: 7, ex: [["どれがいいですか。", "Which one is good?"]] },
  { w: "もっと", m: "more", pos: "adv", st: 7, ex: [["もっと{安|やす}いのはありますか。", "Do you have a cheaper one?"]] },
  { w: "これにします", m: "I'll take this one", pos: "exp", st: 7 },
  { w: "{見|み}ているだけです", m: "I'm just looking", pos: "exp", st: 7 },

  /* ---- stage 8 · daily life ---- */
  { w: "{起|お}きる", m: "to get up; to wake up", pos: "v1", st: 8, ex: [["{毎朝|まいあさ}{七時|しちじ}に{起|お}きます。", "I get up at seven every morning."]] },
  { w: "{寝|ね}る", m: "to sleep; to go to bed", pos: "v1", st: 8 },
  { w: "{働|はたら}く", m: "to work", pos: "v5k", st: 8 },
  { w: "する", m: "to do", pos: "vs", st: 8, note: "Turns nouns into verbs: {勉強|べんきょう}する, to study." },
  { w: "{勉強|べんきょう}する", m: "to study", pos: "vs", st: 8, ex: [["{毎日|まいにち}{日本語|にほんご}を{勉強|べんきょう}します。", "I study Japanese every day."]] },
  { w: "{読|よ}む", m: "to read", pos: "v5m", st: 8 },
  { w: "{書|か}く", m: "to write", pos: "v5k", st: 8 },
  { w: "{聞|き}く", m: "to listen; to ask", pos: "v5k", st: 8, note: "Both: {音楽|おんがく}を{聞|き}く, listen to music; {先生|せんせい}に{聞|き}く, ask the teacher." },
  { w: "{話|はな}す", m: "to speak; to talk", pos: "v5s", st: 8 },
  { w: "{会|あ}う", m: "to meet", pos: "v5u", st: 8, note: "Who you meet takes に: {友達|ともだち}に{会|あ}う." },
  { w: "{休|やす}む", m: "to rest; to take a day off", pos: "v5m", st: 8 },
  { w: "{毎朝|まいあさ}", m: "every morning", pos: "n", st: 8 },
  { w: "{毎晩|まいばん}", m: "every night", pos: "n", st: 8 },
  { w: "{週末|しゅうまつ}", m: "weekend", pos: "n", st: 8 },
  { w: "{今晩|こんばん}", m: "tonight", pos: "n", st: 8 },
  { w: "{夜|よる}", m: "night", pos: "n", st: 8 },
  { w: "{家|いえ}", m: "house; home", pos: "n", st: 8, note: "Also read うち, which means home more warmly: うちに{帰|かえ}る." },
  { w: "{仕事|しごと}", m: "work; job", pos: "n", st: 8 },
  { w: "{学校|がっこう}", m: "school", pos: "n", st: 8 },
  { w: "いつも", m: "always", pos: "adv", st: 8 },
  { w: "よく", m: "often; well", pos: "adv", st: 8 },
  { w: "{時々|ときどき}", m: "sometimes", pos: "adv", st: 8, note: "The second mark just repeats the kanji before it: {時々|ときどき}, {人々|ひとびと}." },
  { w: "あまり", m: "not much (with a negative)", pos: "adv", st: 8, ex: [["{肉|にく}はあまり{食|た}べません。", "I don't eat much meat."]] },
  { w: "と", m: "and; with", pos: "part", st: 8, note: "Joins nouns (コーヒーとケーキ) and says who you're with ({友達|ともだち}と). It doesn't join sentences." },
  { w: "から", m: "from; because", pos: "part", st: 8, ex: [["{九時|くじ}から{働|はたら}きます。", "I work from nine."]] },
  { w: "まで", m: "until; as far as", pos: "part", st: 8, ex: [["{駅|えき}まで{歩|ある}きます。", "I'll walk to the station."]] },

  /* ---- stage 9 · the て-form ---- */
  { w: "{入|はい}る", m: "to enter; to go in", pos: "v5r", st: 9, note: "Looks like {見|み}る but conjugates like {帰|かえ}る: {入|はい}ります, {入|はい}って." },
  { w: "{出|で}る", m: "to leave; to go out", pos: "v1", st: 9 },
  { w: "{開|あ}ける", m: "to open (something)", pos: "v1", st: 9 },
  { w: "{閉|し}める", m: "to close (something)", pos: "v1", st: 9 },
  { w: "{使|つか}う", m: "to use", pos: "v5u", st: 9 },
  { w: "{作|つく}る", m: "to make", pos: "v5r", st: 9 },
  { w: "{教|おし}える", m: "to teach; to tell", pos: "v1", st: 9, ex: [["{名前|なまえ}を{教|おし}えてください。", "Please tell me your name."]] },
  { w: "{手伝|てつだ}う", m: "to help", pos: "v5u", st: 9 },
  { w: "{撮|と}る", m: "to take (a photo)", pos: "v5r", st: 9 },
  { w: "{住|す}む", m: "to live (somewhere)", pos: "v5m", st: 9, note: "Almost always as {住|す}んでいます — see 〜ています." },
  { w: "{知|し}る", m: "to know", pos: "v5r", st: 9, note: "I know is {知|し}っています; I don't know is {知|し}りません." },
  { w: "{持|も}つ", m: "to hold; to have", pos: "v5t", st: 9 },
  { w: "{座|すわ}る", m: "to sit", pos: "v5r", st: 9 },
  { w: "{立|た}つ", m: "to stand", pos: "v5t", st: 9 },
  { w: "{写真|しゃしん}", m: "photo", pos: "n", st: 9 },
  { w: "{窓|まど}", m: "window", pos: "n", st: 9 },
  { w: "{電話|でんわ}", m: "telephone; a call", pos: "n", st: 9 },
  { w: "{少|すこ}し", m: "a little", pos: "adv", st: 9 },
  { w: "ゆっくり", m: "slowly", pos: "adv", st: 9, ex: [["ゆっくり{話|はな}してください。", "Please speak slowly."]] },
  { w: "もう{一度|いちど}", m: "once more", pos: "adv", st: 9 },

  /* ---- stage 10 · wrapping up N5 ---- */
  { w: "{映画|えいが}", m: "movie", pos: "n", st: 10 },
  { w: "{音楽|おんがく}", m: "music", pos: "n", st: 10 },
  { w: "{本|ほん}", m: "book", pos: "n", st: 10 },
  { w: "{天気|てんき}", m: "weather", pos: "n", st: 10, ex: [["いい{天気|てんき}ですね。", "Nice weather, isn't it?"]] },
  { w: "{雨|あめ}", m: "rain", pos: "n", st: 10 },
  { w: "{暑|あつ}い", m: "hot (weather)", pos: "adj-i", st: 10 },
  { w: "{寒|さむ}い", m: "cold (weather)", pos: "adj-i", st: 10 },
  { w: "{楽|たの}しい", m: "fun", pos: "adj-i", st: 10 },
  { w: "{忙|いそが}しい", m: "busy", pos: "adj-i", st: 10 },
  { w: "{難|むずか}しい", m: "difficult", pos: "adj-i", st: 10 },
  { w: "{元気|げんき}", m: "well; healthy; lively", pos: "adj-na", st: 10, ex: [["お{元気|げんき}ですか。", "How are you?"]] },
  { w: "{大変|たいへん}", m: "tough; a lot of work", pos: "adj-na", st: 10 },
  { w: "{一緒|いっしょ}に", m: "together", pos: "adv", st: 10, ex: [["{一緒|いっしょ}に{行|い}きませんか。", "Shall we go together?"]] },
  { w: "{何|なに}か", m: "something", pos: "pron", st: 10 },
  { w: "どうして", m: "why", pos: "pron", st: 10 },
  { w: "{来週|らいしゅう}", m: "next week", pos: "n", st: 10 },
  { w: "{先週|せんしゅう}", m: "last week", pos: "n", st: 10 },
  { w: "{今年|ことし}", m: "this year", pos: "n", st: 10 },
  { w: "{休|やす}み", m: "a holiday; a break", pos: "n", st: 10 },
  { w: "{旅行|りょこう}", m: "travel; a trip", pos: "n", st: 10 },
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
