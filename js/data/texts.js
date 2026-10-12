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

  { id: "menu-sakura", st: 5, pats: ["o-kudasai"], kind: "menu", title: "A café's menu board",
    lines: ["コーヒー　{三百円|さんびゃくえん}", "お{茶|ちゃ}　{二百円|にひゃくえん}", "ケーキ　{四百円|よんひゃくえん}", "おすすめ：ケーキ"],
    en: ["Coffee: 300 yen", "Tea: 200 yen", "Cake: 400 yen", "Recommended: the cake"],
    q: [["What's recommended?", "The cake", "The coffee", "The tea", "Nothing"],
        ["How much is the tea?", "200 yen", "300 yen", "400 yen", "100 yen"]] },

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
];

const TEXT_BY = Object.fromEntries(TEXTS.map(t => [t.id, t]));

/* What a line is said as (and recorded under): the arrows, colons and wide
   spaces of a sign or a menu become pauses, so the voice doesn't read them
   out — 「でぐち、みぎ」, not 「でぐちやじるしみぎ」. */
const textSay = line => furiKana(line).replace(/[\s　]*[→：:][\s　]*/g, "、").replace(/[\s　]+/g, "、");
