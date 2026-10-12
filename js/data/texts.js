/* Nihongo Quest — short texts to read in one go (Read → 文章 Short texts).

   The kind of thing you'd actually meet: a friend's message, a sign, a
   menu board, a receipt, a page of a diary. Each one is read whole, then
   asked about with the text out of sight — reading, not hunting.

     id     stable key
     st     the word stage it needs: every word in it is from that stage or
            before (or a kana word), and smoke.mjs checks every kanji
     pats   the patterns it uses — it opens once they're all learned
     kind   message | sign | menu | receipt | diary — how it's drawn
     title  what it is, in a few words
     lines  the text, a line each, in furigana markup (shown without
            furigana: kanji you know as kanji, the rest in kana)
     en     the lines in English, shown after
     q      [question, the right answer, three wrong ones] */

const TEXTS = [
  { id: "receipt-cafe", st: 3, pats: [], kind: "receipt", title: "A café receipt",
    lines: ["コーヒー　{三百円|さんびゃくえん}", "パン　{二百円|にひゃくえん}", "{全部|ぜんぶ}で　{五百円|ごひゃくえん}"],
    en: ["Coffee: 300 yen", "Bread: 200 yen", "Altogether: 500 yen"],
    q: [["How much was it altogether?", "500 yen", "300 yen", "200 yen", "700 yen"],
        ["What did the bread cost?", "200 yen", "300 yen", "500 yen", "100 yen"]] },

  { id: "intro-kim", st: 4, pats: ["wa-desu", "no"], kind: "message", title: "Kim says hello",
    lines: ["はじめまして。", "{私|わたし}はキムです。", "{学生|がくせい}です。{日本語|にほんご}の{学生|がくせい}です。", "よろしくおねがいします。"],
    en: ["Nice to meet you.", "I'm Kim.", "I'm a student — a student of Japanese.", "Pleased to meet you."],
    q: [["What is Kim?", "A student", "A teacher", "An office worker", "A shop owner"],
        ["What does Kim study?", "Japanese", "English", "Cooking", "Nothing — Kim works"]] },

  { id: "shop-hours", st: 4, pats: ["wa-desu"], kind: "sign", title: "A shop's opening hours",
    lines: ["{月曜日|げつようび}〜{金曜日|きんようび}　{午前|ごぜん}{十時|じゅうじ}〜{午後|ごご}{八時|はちじ}", "{土曜日|どようび}　{午前|ごぜん}{十時|じゅうじ}〜{午後|ごご}{五時|ごじ}", "{日曜日|にちようび}はやすみです。"],
    en: ["Monday to Friday: 10 a.m. to 8 p.m.", "Saturday: 10 a.m. to 5 p.m.", "Closed on Sundays."],
    q: [["When is it closed?", "Sunday", "Saturday", "Monday", "Never"],
        ["When does it close on Saturday?", "5 p.m.", "8 p.m.", "10 a.m.", "Noon"]] },

  { id: "mum-birthday", st: 4, pats: ["wa-desu", "no"], kind: "diary", title: "A birthday tomorrow",
    lines: ["{明日|あした}は{母|はは}の{誕生日|たんじょうび}です。", "{母|はは}は{六十歳|ろくじゅっさい}です。", "{父|ちち}は{六十二歳|ろくじゅうにさい}です。"],
    en: ["Tomorrow is my mother's birthday.", "My mother is sixty.", "My father is sixty-two."],
    q: [["Whose birthday is it tomorrow?", "Their mother's", "Their father's", "Their sister's", "Their own"],
        ["How old is the mother?", "60", "62", "16", "70"]] },

  { id: "lisa-intro", st: 4, pats: ["wa-desu"], kind: "message", title: "Lisa introduces herself",
    lines: ["はじめまして。リサです。", "カナダ{人|じん}です。{出身|しゅっしん}はトロントです。", "{大学生|だいがくせい}です。{趣味|しゅみ}はサッカーです。"],
    en: ["Nice to meet you. I'm Lisa.", "I'm Canadian. I'm from Toronto.", "I'm a university student. My hobby is football."],
    q: [["Where is Lisa from?", "Canada", "America", "Australia", "Britain"],
        ["What does Lisa do?", "Studies at university", "Teaches", "Works as an engineer", "Works in an office"]] },

  { id: "menu-sakura", st: 5, pats: ["o-kudasai"], kind: "menu", title: "A café's menu board",
    lines: ["コーヒー　{三百円|さんびゃくえん}", "お{茶|ちゃ}　{二百円|にひゃくえん}", "ケーキ　{四百円|よんひゃくえん}", "おすすめ：ケーキ"],
    en: ["Coffee: 300 yen", "Tea: 200 yen", "Cake: 400 yen", "Recommended: the cake"],
    q: [["What's recommended?", "The cake", "The coffee", "The tea", "Nothing"],
        ["How much is the tea?", "200 yen", "300 yen", "400 yen", "100 yen"]] },

  { id: "lunch-board", st: 5, pats: ["no"], kind: "menu", title: "A lunch board",
    lines: ["カレー　{七百円|ななひゃくえん}", "ラーメン　{八百円|はっぴゃくえん}", "お{持|も}ち{帰|かえ}りのお{弁当|べんとう}　{五百円|ごひゃくえん}", "{飲|の}み{物|もの}　{百円|ひゃくえん}"],
    en: ["Curry: 700 yen", "Ramen: 800 yen", "Bento to take away: 500 yen", "Drinks: 100 yen"],
    q: [["What can you take away?", "A bento", "The curry", "The ramen", "Nothing"],
        ["How much is the ramen?", "800 yen", "700 yen", "500 yen", "100 yen"]] },

  { id: "new-diet", st: 5, pats: ["o-masu", "masen"], kind: "diary", title: "Eating better",
    lines: ["{今日|きょう}から{肉|にく}を{食|た}べません。", "{魚|さかな}と{野菜|やさい}を{食|た}べます。", "コーヒーに{砂糖|さとう}は{入|い}れません。"],
    en: ["From today, I won't eat meat.", "I'll eat fish and vegetables.", "I won't put sugar in my coffee."],
    q: [["What won't they eat?", "Meat", "Fish", "Vegetables", "Bread"],
        ["What about sugar?", "None in their coffee", "Lots of it", "Only in tea", "It doesn't say"]] },

  { id: "meet-station", st: 6, pats: ["ni-time", "de-place", "de-means", "desuka"], kind: "message", title: "A message about tomorrow",
    lines: ["{明日|あした}、{九時|くじ}に{駅|えき}で{待|ま}ちます。", "{地下鉄|ちかてつ}で{来|き}ますか。"],
    en: ["Tomorrow, I'll wait at the station at nine.", "Are you coming by subway?"],
    q: [["When are they meeting?", "Tomorrow at nine", "Today at nine", "Tomorrow at three", "Tomorrow at seven"],
        ["Where will they wait?", "At the station", "At the hotel", "At a café", "On the subway"]] },

  { id: "sign-exit", st: 6, pats: ["doko"], kind: "sign", title: "A sign in the station",
    lines: ["{出口|でぐち}　→　{右|みぎ}", "{入口|いりぐち}　→　{左|ひだり}", "トイレ　→　まっすぐ"],
    en: ["Exit: to the right", "Entrance: to the left", "Toilets: straight ahead"],
    q: [["Which way is the exit?", "Right", "Left", "Straight ahead", "Back the way you came"],
        ["Where are the toilets?", "Straight ahead", "To the right", "To the left", "There aren't any"]] },

  { id: "east-exit", st: 6, pats: ["de-place", "de-means", "desuka", "no"], kind: "message", title: "Where to meet",
    lines: ["{駅|えき}の{東口|ひがしぐち}で{待|ま}ちます。", "{銀行|ぎんこう}の{隣|となり}です。", "{空港|くうこう}からバスで{来|き}ますか。"],
    en: ["I'll wait at the station's east exit.", "It's next to the bank.", "Are you coming from the airport by bus?"],
    q: [["Where will they wait?", "At the east exit", "At the west exit", "Inside the bank", "At the airport"],
        ["What is it next to?", "A bank", "The airport", "A police box", "A hotel"]] },

  { id: "platforms", st: 6, pats: [], kind: "sign", title: "A board on the platform",
    lines: ["{一番線|いちばんせん}　{急行|きゅうこう}　{空港|くうこう}{行|ゆ}き", "{二番線|にばんせん}　{新幹線|しんかんせん}", "{乗|の}り{換|か}え　→　{地下鉄|ちかてつ}"],
    en: ["Platform 1: express for the airport", "Platform 2: bullet train", "Change here → subway"],
    q: [["Which platform for the airport?", "Platform 1", "Platform 2", "Platform 3", "None of them"],
        ["What can you change to?", "The subway", "A bus", "A taxi", "A boat"]] },

  { id: "new-bag", st: 7, pats: ["mashita", "katta"], kind: "message", title: "A friend's news",
    lines: ["{昨日|きのう}、{新|あたら}しいかばんを{買|か}いました。", "{赤|あか}いかばんです。", "{安|やす}かったです！"],
    en: ["I bought a new bag yesterday.", "It's a red bag.", "It was cheap!"],
    q: [["What did your friend buy?", "A bag", "Shoes", "Clothes", "A wallet"],
        ["What was it like?", "Red, and cheap", "Black, and cheap", "Red, and expensive", "Old, and cheap"]] },

  { id: "shop-sign", st: 7, pats: ["ga-aru", "mo"], kind: "sign", title: "A notice in a shop",
    lines: ["{服|ふく}と{靴|くつ}はあそこにあります。", "お{土産|みやげ}はここにあります。", "カードもいいです。"],
    en: ["Clothes and shoes are over there.", "Souvenirs are here.", "Cards are fine too."],
    q: [["Where are the shoes?", "Over there, with the clothes", "Here, with the souvenirs", "There aren't any", "Outside"],
        ["Can you pay by card?", "Yes", "No, cash only", "Only for souvenirs", "It doesn't say"]] },

  { id: "sale-sign", st: 7, pats: ["wa-desu"], kind: "sign", title: "A sale in a shop window",
    lines: ["セール！", "{靴|くつ}　{三割引|さんわりびき}", "シャツ　{二枚|にまい}で{三千円|さんぜんえん}", "{袋|ふくろ}は{五円|ごえん}です。"],
    en: ["Sale!", "Shoes: 30% off", "Shirts: two for 3,000 yen", "Bags are 5 yen."],
    q: [["How much are two shirts?", "3,000 yen", "2,000 yen", "1,500 yen", "300 yen"],
        ["What's 30% off?", "Shoes", "Shirts", "Bags", "Everything"]] },

  { id: "new-coat", st: 7, pats: ["mashita", "kunai", "na-noun", "ga-aru", "de-place"], kind: "message", title: "A new coat",
    lines: ["{昨日|きのう}、デパートでコートを{買|か}いました。", "{茶色|ちゃいろ}のコートです。", "{高|たか}くなかったです。{便利|べんり}なポケットもあります。"],
    en: ["Yesterday I bought a coat at a department store.", "It's a brown coat.", "It wasn't expensive. It's got handy pockets, too."],
    q: [["What did they buy?", "A coat", "A bag", "Shoes", "A hat"],
        ["What colour is it?", "Brown", "Black", "Red", "White"]] },

  { id: "my-day", st: 8, pats: ["ni-time", "kara-made", "to"], kind: "diary", title: "A page of a diary",
    lines: ["{私|わたし}は{毎朝|まいあさ}{七時|しちじ}に{起|お}きます。", "{九時|くじ}から{五時|ごじ}まで{働|はたら}きます。", "{週末|しゅうまつ}は{友達|ともだち}と{会|あ}います。"],
    en: ["I get up at seven every morning.", "I work from nine to five.", "At weekends I meet my friends."],
    q: [["What time do they get up?", "Seven", "Nine", "Five", "Eleven"],
        ["What do they do at weekends?", "Meet friends", "Work", "Study", "Sleep all day"]] },

  { id: "dinner-invite", st: 8, pats: ["masenka", "mashou", "ni-time", "de-place"], kind: "message", title: "An invitation",
    lines: ["{今晩|こんばん}、いっしょに{晩|ばん}ご{飯|はん}を{食|た}べませんか。", "{七時|しちじ}に{駅|えき}で{会|あ}いましょう。"],
    en: ["Would you like to have dinner together tonight?", "Let's meet at the station at seven."],
    q: [["What is the message?", "An invitation to dinner", "An invitation to lunch", "A request to wait", "An apology"],
        ["Where will they meet?", "At the station", "At a restaurant", "At home", "At work"]] },

  { id: "chores", st: 8, pats: ["ni-time", "to", "o-masu"], kind: "diary", title: "My week",
    lines: ["{毎朝|まいあさ}シャワーを{浴|あ}びます。", "{土曜日|どようび}に{掃除|そうじ}と{洗濯|せんたく}をします。", "{日曜日|にちようび}は{友達|ともだち}とサッカーをします。"],
    en: ["I take a shower every morning.", "On Saturday I clean and do the laundry.", "On Sunday I play football with friends."],
    q: [["When do they clean?", "Saturday", "Sunday", "Every morning", "Friday"],
        ["What do they do on Sunday?", "Play football with friends", "Clean the house", "Do the laundry", "Go to work"]] },

  { id: "class-notice", st: 8, pats: ["ni-time", "kara-made"], kind: "sign", title: "A notice in class",
    lines: ["{授業|じゅぎょう}は{九時|くじ}に{始|はじ}まります。", "{昼休|ひるやす}みは{十二時|じゅうにじ}から{一時|いちじ}までです。", "{宿題|しゅくだい}は{金曜日|きんようび}までです。"],
    en: ["Class begins at nine.", "Lunch break is from twelve to one.", "Homework is due by Friday."],
    q: [["When does class begin?", "Nine", "Twelve", "One", "Eight"],
        ["When is the homework due?", "By Friday", "By Monday", "Tomorrow", "There isn't any"]] },

  { id: "temple-sign", st: 9, pats: ["naide"], kind: "sign", title: "A notice by a door",
    lines: ["ここで{写真|しゃしん}を{撮|と}らないでください。", "{窓|まど}を{開|あ}けないでください。"],
    en: ["Please don't take photos here.", "Please don't open the windows."],
    q: [["What does the notice ask?", "No photos", "No talking", "No phones", "No shoes"],
        ["And what else?", "Don't open the windows", "Don't close the door", "Don't sit down", "Don't eat here"]] },

  { id: "on-the-train", st: 9, pats: ["te-kudasai", "te-imasu", "ni-noru"], kind: "message", title: "A message from a friend",
    lines: ["すみません、{少|すこ}し{待|ま}ってください。", "{今|いま}、{電車|でんしゃ}に{乗|の}っています。", "{三時|さんじ}に{駅|えき}に{来|き}ます。"],
    en: ["Sorry, please wait a little.", "I'm on the train now.", "I'll be at the station at three."],
    q: [["Where is your friend now?", "On the train", "At the station", "At home", "On a bus"],
        ["What are they asking?", "For you to wait a little", "For you to come to the station now", "For you to call them", "To meet tomorrow instead"]] },

  { id: "house-rules", st: 9, pats: ["te-kudasai", "naide"], kind: "sign", title: "A notice at the door",
    lines: ["{入口|いりぐち}で{靴|くつ}を{脱|ぬ}いでください。", "ここに{並|なら}んでください。", "たばこを{吸|す}わないでください。"],
    en: ["Please take your shoes off at the entrance.", "Please queue here.", "Please don't smoke."],
    q: [["Where do your shoes come off?", "At the entrance", "In the queue", "Outside", "Nowhere — keep them on"],
        ["What isn't allowed?", "Smoking", "Queuing", "Photos", "Talking"]] },

  { id: "bring-umbrella", st: 9, pats: ["te-imasu", "te-kudasai"], kind: "message", title: "A message from Mum",
    lines: ["もしもし、{母|はは}です。", "{今|いま}、{駅|えき}で{待|ま}っています。", "{傘|かさ}を{持|も}って{来|き}てください。"],
    en: ["Hello, it's Mum.", "I'm waiting at the station now.", "Please bring an umbrella."],
    q: [["Who is it from?", "Their mother", "Their father", "A friend", "A shop"],
        ["What should they bring?", "An umbrella", "A coat", "Some food", "Nothing"]] },

  { id: "rainy-day", st: 10, pats: ["ne-yo", "kara-because", "tai"], kind: "diary", title: "A rainy weekend",
    lines: ["{今日|きょう}は{寒|さむ}いですね。", "{明日|あした}は{雨|あめ}ですから、{家|いえ}にいます。", "{映画|えいが}を{見|み}たいです。"],
    en: ["It's cold today, isn't it?", "It's going to rain tomorrow, so I'll stay home.", "I want to watch a movie."],
    q: [["What's the weather tomorrow?", "Rain", "Hot and sunny", "Snow", "Cold but clear"],
        ["What do they want to do?", "Watch a movie", "Go out with friends", "Go to work", "Read a book"]] },

  { id: "casual-plan", st: 10, pats: ["plain"], kind: "message", title: "A text from a friend",
    lines: ["{明日|あした}、{映画|えいが}を{見|み}る？", "{忙|いそが}しい？"],
    en: ["Want to see a movie tomorrow?", "Are you busy?"],
    q: [["How is your friend writing?", "Casually, as friends do", "Politely, as to a stranger", "Formally, as at work", "In English"],
        ["What are they asking?", "If you'll see a movie tomorrow", "If you saw a movie yesterday", "If you like movies", "If you're tired"]] },

  { id: "forecast", st: 10, pats: ["te-kudasai"], kind: "sign", title: "Tomorrow's weather",
    lines: ["{明日|あした}の{天気|てんき}", "{午前|ごぜん}　{晴|は}れ", "{午後|ごご}　{曇|くも}り　{夜|よる}は{雨|あめ}", "{傘|かさ}を{持|も}って{行|い}ってください。"],
    en: ["Tomorrow's weather", "Morning: sunny", "Afternoon: cloudy; rain at night", "Take an umbrella with you."],
    q: [["What's the afternoon like?", "Cloudy", "Sunny", "Snowy", "Rainy"],
        ["When will it rain?", "At night", "In the morning", "All day", "It won't"]] },

  { id: "off-sick", st: 10, pats: ["ga-aru", "mo", "tai"], kind: "message", title: "Off sick",
    lines: ["すみません、{今日|きょう}は{休|やす}みます。", "{熱|ねつ}があります。{頭|あたま}も{痛|いた}いです。", "{明日|あした}は{行|い}きたいです。"],
    en: ["Sorry, I'm taking today off.", "I have a fever. My head hurts, too.", "I want to come in tomorrow."],
    q: [["Why are they off?", "A fever and a headache", "A holiday", "A broken train", "They're too busy"],
        ["What about tomorrow?", "They hope to come in", "They'll be off too", "They're going to hospital", "It doesn't say"]] },

  { id: "summer-trip", st: 10, pats: ["ni-iku", "to", "mashita", "katta", "tai"], kind: "diary", title: "A summer trip",
    lines: ["{夏休|なつやす}みに{家族|かぞく}と{海|うみ}に{行|い}きました。", "{毎日|まいにち}{泳|およ}ぎました。{楽|たの}しかったです！", "{来年|らいねん}もまた{行|い}きたいです。"],
    en: ["In the summer holidays I went to the sea with my family.", "I swam every day. It was fun!", "I want to go again next year."],
    q: [["Where did they go?", "The sea", "The mountains", "A river", "Abroad"],
        ["Who did they go with?", "Their family", "Friends", "Nobody", "Their class"]] },
];


/* What a line is said as (and recorded under): the arrows, colons and wide
   spaces of a sign or a menu become pauses, so the voice doesn't read them
   out — 「でぐち、みぎ」, not 「でぐちやじるしみぎ」 — and a sign's 〜 is
   read as what it means: {十時|じゅうじ}〜 is じゅうじから. */
const textSay = line => furiKana(line).replace(/〜/g, "から").replace(/[\s　]*[→：:][\s　]*/g, "、").replace(/[\s　]+/g, "、");

/* Sentences to split (Read → 句 Phrases), past the ones each grammar
   pattern teaches: everyday sentences made of the words in words.js.
     pats   the patterns it uses
     parts  the sentence in pieces, in furigana markup: each a word as it's
            listed, a form of one ({曲|ま}がります, {脱|ぬ}いで, {重|おも}かったです),
            or one of PHRASE_BITS — the particles and endings patterns teach
     en     the sentence in English
   Derived: words, each piece's word (null for a bit), and st, the latest
   stage among its words and patterns. It opens once all of them are
   learned, and its sound is recorded with that stage. */

const PHRASE_BITS = new Set(["が", "も", "よ", "ね", "な", "けど", "ですか", "ですね", "でした",
  "ます", "ません", "ました", "ましょう", "ませんか", "でください", "います", "もいいですか", "たいです", "ないでください"]);

const READ_PHRASES = [
  /* stages 3–4: the calendar, family, who's who */
  [["wa-desu"], ["{今日|きょう}", "は", "{月曜日|げつようび}", "です。"], "Today is Monday."],
  [["wa-desu"], ["{今月|こんげつ}", "は", "{七月|しちがつ}", "です。"], "This month is July."],
  [["wa-desu"], ["{誕生日|たんじょうび}", "は", "{四月|しがつ}", "です。"], "My birthday is in April."],
  [["wa-desu"], ["{父|ちち}", "は", "{医者|いしゃ}", "です。"], "My father is a doctor."],
  [["mo"], ["{母|はは}", "も", "{医者|いしゃ}", "です。"], "My mother is a doctor too."],
  [["wa-desu"], ["{兄|あに}", "は", "{会社員|かいしゃいん}", "です。"], "My older brother is an office worker."],
  [["desuka"], ["{彼女|かのじょ}", "は", "{留学生|りゅうがくせい}", "ですか。"], "Is she an international student?"],
  [["no"], ["{妹|いもうと}", "の", "{友達|ともだち}", "です。"], "She's my younger sister's friend."],
  [["desuka"], ["{弟|おとうと}", "は", "{何歳|なんさい}", "ですか。"], "How old is your younger brother?"],
  [["desuka"], ["{趣味|しゅみ}", "は", "{何|なん}", "ですか。"], "What are your hobbies?"],
  [["desuka"], ["{出身|しゅっしん}", "は", "どこ", "ですか。"], "Where are you from?"],
  /* stage 5: eating and drinking */
  [["o-kudasai"], ["{冷|つめ}たい", "{水|みず}", "を", "ください。"], "Cold water, please."],
  [["o-kudasai"], ["お{弁当|べんとう}", "を", "{二|ふた}つ", "ください。"], "Two bentos, please."],
  [["o-kudasai"], ["メニュー", "を", "ください。"], "The menu, please."],
  [["o-masu"], ["{熱|あつ}い", "コーヒー", "を", "{飲|の}みます。"], "I'll have a hot coffee."],
  [["masen"], ["{豚肉|ぶたにく}", "は", "{食|た}べません。"], "I don't eat pork."],
  [["mashita"], ["{紅茶|こうちゃ}", "を", "{頼|たの}みました。"], "I ordered black tea."],
  [["mashita"], ["{朝|あさ}", "{牛乳|ぎゅうにゅう}", "を", "{飲|の}みました。"], "I drank milk in the morning."],
  /* stage 6: finding the way */
  [["de-means"], ["{箸|はし}", "で", "{食|た}べます。"], "I eat with chopsticks."],
  [["no", "o-masu"], ["{次|つぎ}", "の", "{角|かど}", "を", "{曲|ま}がります。"], "I turn at the next corner."],
  [["o-masu"], ["{橋|はし}", "を", "{渡|わた}ります。"], "I cross the bridge."],
  [["ni-iku"], ["{空港|くうこう}", "に", "{行|い}きます。"], "I'm going to the airport."],
  [["de-means", "ni-iku"], ["タクシー", "で", "ホテル", "に", "{帰|かえ}ります。"], "I'll go back to the hotel by taxi."],
  [["doko"], ["{銀行|ぎんこう}", "は", "どこ", "ですか。"], "Where's the bank?"],
  [["no"], ["{郵便局|ゆうびんきょく}", "は", "{駅|えき}", "の", "{隣|となり}", "です。"], "The post office is next to the station."],
  [["ni-noru"], ["{新幹線|しんかんせん}", "に", "{乗|の}ります。"], "I'll take the bullet train."],
  [["de-place"], ["{次|つぎ}", "の", "{駅|えき}", "で", "{乗|の}り{換|か}えます。"], "I change at the next station."],
  [["ni-time"], ["{午後|ごご}", "に", "{着|つ}きます。"], "I'll arrive in the afternoon."],
  /* stage 7: shopping */
  [["kunai"], ["この", "シャツ", "は", "{長|なが}くないです。"], "This shirt isn't long."],
  [["katta"], ["{辞書|じしょ}", "は", "{重|おも}かったです。"], "The dictionary was heavy."],
  [["ga-aru"], ["{黄色|きいろ}い", "{傘|かさ}", "が", "あります。"], "There's a yellow umbrella."],
  [["de-means"], ["カード", "で", "{払|はら}います。"], "I'll pay by card."],
  [["masen"], ["{袋|ふくろ}", "は", "{要|い}りません。"], "I don't need a bag."],
  [["na-noun"], ["{便利|べんり}", "な", "かばん", "です。"], "It's a handy bag."],
  [["ni-shimasu"], ["その", "{帽子|ぼうし}", "に", "します。"], "I'll take that hat."],
  /* stage 8: the day */
  [["o-masu"], ["{毎朝|まいあさ}", "シャワー", "を", "{浴|あ}びます。"], "I take a shower every morning."],
  [["kara-made"], ["{授業|じゅぎょう}", "は", "{朝|あさ}", "から", "{始|はじ}まります。"], "Class starts in the morning."],
  [["mashou", "de-place"], ["{公園|こうえん}", "で", "{遊|あそ}び", "ましょう。"], "Let's play in the park."],
  [["masenka"], ["{週末|しゅうまつ}", "サッカー", "を", "しませんか。"], "Want to play football this weekend?"],
  [["mashita"], ["{宿題|しゅくだい}", "を", "{忘|わす}れました。"], "I forgot my homework."],
  [["mashita"], ["もう", "{宿題|しゅくだい}", "を", "{出|だ}しました。"], "I've already handed in my homework."],
  [["masen"], ["{私|わたし}", "は", "{全然|ぜんぜん}", "{疲|つか}れません。"], "I never get tired."],
  /* stage 9: asking and being asked */
  [["te-kudasai"], ["{電気|でんき}", "を", "{消|け}して", "ください。"], "Please turn off the light."],
  [["te-kudasai"], ["{靴|くつ}", "を", "{脱|ぬ}いで", "ください。"], "Please take your shoes off."],
  [["te-kudasai"], ["ここ", "に", "{並|なら}んで", "ください。"], "Please queue here."],
  [["te-kudasai"], ["{写真|しゃしん}", "を", "{見|み}せて", "ください。"], "Please show me the photo."],
  [["te-mo-ii"], ["エアコン", "を", "{付|つ}けて", "もいいですか。"], "May I turn on the air conditioner?"],
  [["te-imasu"], ["{荷物|にもつ}", "を", "{持|も}って", "います。"], "I'm carrying luggage."],
  [["te-imasu"], ["{財布|さいふ}", "を", "{探|さが}しています。"], "I'm looking for my wallet."],
  [["naide"], ["ここ", "で", "たばこ", "を", "{吸|す}わないでください。"], "Please don't smoke here."],
  /* stage 10: weather, feelings, wanting */
  [["te-imasu"], ["{雨|あめ}", "が", "{降|ふ}っています。"], "It's raining."],
  [["ne-yo"], ["{今日|きょう}", "は", "{暖|あたた}かいです", "ね。"], "It's warm today, isn't it?"],
  [["ne-yo"], ["{日本語|にほんご}", "が", "{上手|じょうず}", "ですね。"], "Your Japanese is good!"],
  [["suki"], ["{頭|あたま}", "が", "{痛|いた}いです。"], "I have a headache."],
  [["suki"], ["{新|あたら}しい", "{時計|とけい}", "が", "{欲|ほ}しいです。"], "I want a new watch."],
  [["suki"], ["{春|はる}", "が", "{大好|だいす}き", "です。"], "I love spring."],
  [["tai", "ni-iku"], ["{海|うみ}", "に", "{行|い}き", "たいです。"], "I want to go to the sea."],
  [["kara-because"], ["{風邪|かぜ}", "です", "から、", "{休|やす}みます。"], "I've got a cold, so I'll take the day off."],
  [["to", "ga-aru"], ["{犬|いぬ}", "と", "{猫|ねこ}", "が", "います。"], "There's a dog and a cat."],
].map(([pats, parts, en]) => ({ pats, parts, en }));

/* the forms a piece may take: a verb's polite forms, て, た, ない and its
   stem (for 〜ましょう, 〜たいです); an adjective's polite forms */
const phraseForms = w => {
  if (isVerb(w.pos)) {
    const f = ["masu", "masen", "mashita", "masendeshita", "te", "ta", "nai"].map(x => conj(w.w, w.pos, x));
    return [w.w, ...f, f[0].slice(0, -2)];
  }
  if (isAdj(w.pos)) return [w.w, ...["adj-desu", "adj-nai", "adj-katta", "adj-nakatta"].map(x => conj(w.w, w.pos, x))];
  return [w.w];
};
/* a piece's word: the word itself, null for a bit, or a form of a word
   (with a bit on the end: {探|さが}して + います); undefined if none */
function phraseWord(part) {
  const p = part.replace(/[。、？！]/g, "");
  const exact = WORDS.find(w => w.w === p);
  if (exact) return exact;
  if (PHRASE_BITS.has(p)) return null;
  return WORDS.find(w => phraseForms(w).some(f => p === f || (p.startsWith(f) && PHRASE_BITS.has(p.slice(f.length)))));
}
READ_PHRASES.forEach(x => {
  x.words = x.parts.map(phraseWord);
  x.st = Math.max(...x.words.filter(Boolean).map(w => w.st), ...x.pats.map(id => PATTERNS.find(p => p.id === id)?.st || 99));
});
