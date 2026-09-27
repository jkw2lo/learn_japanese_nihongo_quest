/* Nihongo Quest — kana.

   KANA is built from LESSONS rather than typed out glyph by glyph: the lesson
   table below is the teaching order, and the katakana half is the hiragana
   half shifted by 0x60, which is how Unicode lays them out. Typing 200 entries
   by hand is how a ぢ ends up labelled "di" in one place and "ji" in another.

   Each entry:
     k      the glyph (one or two characters — きゃ is one unit)
     r      romaji (Hepburn), what a reading drill asks for
     set    "h" hiragana | "k" katakana
     lesson the lesson id it is taught in
     say    the text recorded for it — the same clip for か and カ, and one
            clip for じ and ぢ, which sound identical
     concept true for っ ッ ー: they have no sound of their own, so they are
            taught and drilled through word pairs instead (KANA_PAIRS_WORDS)
     story  an optional picture to hang the shape on (base glyphs only;
            voiced and combined forms follow a rule, not a picture) */

const LESSONS = [
  /* ---- hiragana: one row a lesson, so a day is about five kana ---- */
  { id: "h-a",  set: "h", title: "あ row",  kind: "base",   g: "あ い う え お",  r: "a i u e o" },
  { id: "h-k",  set: "h", title: "か row",  kind: "base",   g: "か き く け こ",  r: "ka ki ku ke ko" },
  { id: "h-s",  set: "h", title: "さ row",  kind: "base",   g: "さ し す せ そ",  r: "sa shi su se so" },
  { id: "h-t",  set: "h", title: "た row",  kind: "base",   g: "た ち つ て と",  r: "ta chi tsu te to" },
  { id: "h-n",  set: "h", title: "な row",  kind: "base",   g: "な に ぬ ね の",  r: "na ni nu ne no" },
  { id: "h-h",  set: "h", title: "は row",  kind: "base",   g: "は ひ ふ へ ほ",  r: "ha hi fu he ho" },
  { id: "h-m",  set: "h", title: "ま row",  kind: "base",   g: "ま み む め も",  r: "ma mi mu me mo" },
  { id: "h-y",  set: "h", title: "や row",  kind: "base",   g: "や ゆ よ",      r: "ya yu yo" },
  { id: "h-r",  set: "h", title: "ら row",  kind: "base",   g: "ら り る れ ろ",  r: "ra ri ru re ro" },
  { id: "h-w",  set: "h", title: "わ, を and ん", kind: "base", g: "わ を ん",  r: "wa wo n" },
  { id: "h-g",  set: "h", title: "が row",  kind: "voiced", g: "が ぎ ぐ げ ご",  r: "ga gi gu ge go" },
  { id: "h-z",  set: "h", title: "ざ row",  kind: "voiced", g: "ざ じ ず ぜ ぞ",  r: "za ji zu ze zo" },
  { id: "h-d",  set: "h", title: "だ row",  kind: "voiced", g: "だ ぢ づ で ど",  r: "da ji zu de do" },
  { id: "h-b",  set: "h", title: "ば row",  kind: "voiced", g: "ば び ぶ べ ぼ",  r: "ba bi bu be bo" },
  { id: "h-p",  set: "h", title: "ぱ row",  kind: "voiced", g: "ぱ ぴ ぷ ぺ ぽ",  r: "pa pi pu pe po" },
  { id: "h-ky", set: "h", title: "きゃ きゅ きょ", kind: "combo", g: "きゃ きゅ きょ", r: "kya kyu kyo" },
  { id: "h-sh", set: "h", title: "しゃ しゅ しょ", kind: "combo", g: "しゃ しゅ しょ", r: "sha shu sho" },
  { id: "h-ch", set: "h", title: "ちゃ ちゅ ちょ", kind: "combo", g: "ちゃ ちゅ ちょ", r: "cha chu cho" },
  { id: "h-ny", set: "h", title: "にゃ にゅ にょ", kind: "combo", g: "にゃ にゅ にょ", r: "nya nyu nyo" },
  { id: "h-hy", set: "h", title: "ひゃ ひゅ ひょ", kind: "combo", g: "ひゃ ひゅ ひょ", r: "hya hyu hyo" },
  { id: "h-my", set: "h", title: "みゃ みゅ みょ", kind: "combo", g: "みゃ みゅ みょ", r: "mya myu myo" },
  { id: "h-ry", set: "h", title: "りゃ りゅ りょ", kind: "combo", g: "りゃ りゅ りょ", r: "rya ryu ryo" },
  { id: "h-gy", set: "h", title: "ぎゃ ぎゅ ぎょ", kind: "combo", g: "ぎゃ ぎゅ ぎょ", r: "gya gyu gyo" },
  { id: "h-j",  set: "h", title: "じゃ じゅ じょ", kind: "combo", g: "じゃ じゅ じょ", r: "ja ju jo" },
  { id: "h-by", set: "h", title: "びゃ びゅ びょ", kind: "combo", g: "びゃ びゅ びょ", r: "bya byu byo" },
  { id: "h-py", set: "h", title: "ぴゃ ぴゅ ぴょ", kind: "combo", g: "ぴゃ ぴゅ ぴょ", r: "pya pyu pyo" },
  { id: "h-x",  set: "h", title: "Small っ and long vowels", kind: "concept", g: "っ", r: "(pause)" },

  /* ---- katakana: the same order, then the sounds only loanwords need ---- */
  ...["a", "k", "s", "t", "n", "h", "m", "y", "r", "w", "g", "z", "d", "b", "p",
      "ky", "sh", "ch", "ny", "hy", "my", "ry", "gy", "j", "by", "py"].map(id => ({ id: "k-" + id, set: "k", from: "h-" + id })),
  { id: "k-x",  set: "k", title: "Small ッ and the long bar ー", kind: "concept", g: "ッ ー", r: "(pause) (long)" },
  { id: "k-l1", set: "k", title: "ティ ディ ヴ", kind: "loan", g: "ティ ディ ヴ", r: "ti di vu" },
  { id: "k-l2", set: "k", title: "ファ フィ フェ フォ", kind: "loan", g: "ファ フィ フェ フォ", r: "fa fi fe fo" },
  { id: "k-l3", set: "k", title: "ウィ ウェ ウォ", kind: "loan", g: "ウィ ウェ ウォ", r: "wi we wo" },
  { id: "k-l4", set: "k", title: "シェ ジェ チェ", kind: "loan", g: "シェ ジェ チェ", r: "she je che" },
];

/* Pictures for the base glyphs. Written for this app; kept short, because a
   story is a crutch you should be able to drop by the third meeting. */
const KANA_STORY = {
  "あ": "A cross with a big loop swinging round it — an acrobat on a bar going “Aah!”",
  "い": "Two eels side by side: ee.",
  "う": "A little tick over a hunched back — someone winded, going “oof”.",
  "え": "A dash over a zigzag that kicks out — an exotic bird's tail feather: eh.",
  "お": "Like あ, with a spark flying off to the right — “Oh!”",
  "か": "A karate chop with a spark flying off it: ka!",
  "き": "A key: two bars on a shaft, with the bit hooked at the bottom.",
  "く": "A beak opening — a cuckoo: ku.",
  "け": "A keg standing next to its tap.",
  "こ": "Two worms coiled apart: co-ils.",
  "さ": "A signpost with a curve hanging under it — a saddle on a rail.",
  "し": "A fish hook. She went fishing.",
  "す": "A bar with a loop swinging under it — a swing: su.",
  "せ": "A tall sail and a short mast. Set sail.",
  "そ": "A zigzag stitch pulled tight: sew.",
  "た": "A t and an a squeezed side by side: ta.",
  "ち": "A cheerleader leaning back on one leg: chi.",
  "つ": "A single wave curling over — tsunami.",
  "て": "A hand held out flat. て is the word for hand, too.",
  "と": "A toe with a splinter in it.",
  "な": "A cross, a dot, and a knot below — a nun kneeling by a cross.",
  "に": "A knee (the tall line) beside two short ones.",
  "ぬ": "Noodles twirled on chopsticks, a loop at the end.",
  "ね": "A cat's tail curled round at the end — ねこ is cat.",
  "の": "One round stroke, like a no-entry sign.",
  "は": "A post, and a little figure with a loop — laughing: ha!",
  "ひ": "A wide grin: hee.",
  "ふ": "Mount Fuji, with a puff of cloud on each side.",
  "へ": "A single low hill. Heave yourself over it.",
  "ほ": "は with a hat on — ho ho.",
  "ま": "Two bars and a line ending in a loop — a mama with a baby on her hip.",
  "み": "The number 21, scribbled: me at 21.",
  "む": "A cow with a horn out to the right: moo.",
  "め": "An eye with a line through it — め is the word for eye. No loop at the end, unlike ぬ.",
  "も": "A fish hook with two bars across it — catch more.",
  "や": "A yak's head with its horns up.",
  "ゆ": "A U-turn with a line through it: yu.",
  "よ": "A yo-yo hanging off a bar.",
  "ら": "A rabbit's ear flopped over.",
  "り": "Two reeds, the right one taller.",
  "る": "A road that ends in a loop — a roundabout: ru.",
  "れ": "Like ね, but the end kicks out instead of curling — a leg kicking: re.",
  "ろ": "る without the loop — a road with no roundabout: ro.",
  "わ": "Like ね and れ, but the end curls back round: a waddle.",
  "を": "Someone bent forward over their work. Said just “o”, and used only as a grammar marker.",
  "ん": "A lower-case n with a tail.",

  "ア": "An axe, head down.",
  "イ": "An easel leaning on its stand: ee.",
  "ウ": "う with a lid on.",
  "エ": "A steel girder, end on — an elevator shaft.",
  "オ": "A cross with a flung-out arm — an opera singer: oh!",
  "カ": "か without the spark.",
  "キ": "キ is き straightened out — the same key.",
  "ク": "A cook's knife, blade down.",
  "ケ": "A K, leaning.",
  "コ": "A corner — two sides of a box.",
  "サ": "A saddle across two posts.",
  "シ": "Two drops of rain and a sweep UP from the bottom — she looks up at the sky. (ツ sweeps down.)",
  "ス": "A person running, legs apart — swoosh.",
  "セ": "せ with the loop cut off.",
  "ソ": "One drop and a sweep DOWN from the top — sewing down the seam. (ン sweeps up.)",
  "タ": "ク with an extra stroke inside: ta.",
  "チ": "A cheerleader holding a pole overhead: chi.",
  "ツ": "Two drops across the top and a sweep DOWN — a tsunami coming down. (シ sweeps up.)",
  "テ": "A telephone pole with its crossbars.",
  "ト": "A totem pole with one branch.",
  "ナ": "A knife across a cross.",
  "ニ": "Two lines — ni is two.",
  "ヌ": "Noodles on chopsticks: nu.",
  "ネ": "A necktie with a knot.",
  "ノ": "A single slash. No.",
  "ハ": "Two strokes spreading apart — ha ha.",
  "ヒ": "A heel, seen from the side.",
  "フ": "A hood, from the side: fu.",
  "ヘ": "The same low hill as へ.",
  "ホ": "A holy cross with two dots.",
  "マ": "A martini glass on its side.",
  "ミ": "Three lines — me, me, me.",
  "ム": "A cow's muzzle: moo.",
  "メ": "An X marks the spot. Me!",
  "モ": "も without the hook — more bars.",
  "ヤ": "A yacht's sail.",
  "ユ": "A U-bend pipe on its side: you.",
  "ヨ": "A yo-yo stacked in three.",
  "ラ": "A rabbit's ear under a lid.",
  "リ": "り, straightened.",
  "ル": "Two roots.",
  "レ": "A leg kicking: re.",
  "ロ": "A square road sign: ro.",
  "ワ": "A wine glass, tipped — ウ without the dot.",
  "ヲ": "Almost never seen. The katakana form of を.",
  "ン": "One drop and a sweep UP from the bottom: n. (ソ sweeps down.)",
};

/* One row of look-alikes each. Drilled once at least two in a group are yours:
   you hear it, see the romaji, and pick which shape it was. */
const KANA_ALIKE = [
  ["さ", "ち"], ["き", "さ"], ["ぬ", "め"], ["わ", "れ", "ね"], ["る", "ろ"],
  ["は", "ほ", "け"], ["い", "り"], ["あ", "お"], ["う", "ら"], ["た", "な"],
  ["シ", "ツ"], ["ソ", "ン"], ["シ", "ン"], ["ツ", "ソ"], ["ク", "ケ", "タ"], ["ウ", "ワ", "フ"],
  ["コ", "ユ", "ロ"], ["チ", "テ"], ["ス", "ヌ"], ["マ", "ム"], ["ア", "マ"],
  ["ノ", "メ"], ["ル", "レ"], ["ヲ", "ヨ"],
];

/* Words that turn a string of glyphs into something you can read. A word is
   only shown once every unit in it is one you have learned. `r` overrides
   the romaji where spelling and sound part ways (こんにちは ends in wa). */
const KANA_WORDS = [
  /* hiragana — native words */
  { w: "いえ", m: "house" }, { w: "あい", m: "love" }, { w: "うえ", m: "above; top" },
  { w: "あお", m: "blue" }, { w: "いいえ", m: "no" }, { w: "え", m: "picture" },
  { w: "かお", m: "face" }, { w: "あき", m: "autumn" }, { w: "いけ", m: "pond" },
  { w: "ここ", m: "here" }, { w: "こえ", m: "voice" }, { w: "き", m: "tree" },
  { w: "すし", m: "sushi" }, { w: "あさ", m: "morning" }, { w: "かさ", m: "umbrella" },
  { w: "しお", m: "salt" }, { w: "せかい", m: "world" }, { w: "おかし", m: "sweets" },
  { w: "て", m: "hand" }, { w: "くち", m: "mouth" }, { w: "した", m: "below; under" },
  { w: "つくえ", m: "desk" }, { w: "そと", m: "outside" }, { w: "ちかてつ", m: "subway" },
  { w: "いぬ", m: "dog" }, { w: "ねこ", m: "cat" }, { w: "なつ", m: "summer" },
  { w: "さかな", m: "fish" }, { w: "なに", m: "what" }, { w: "おかね", m: "money" },
  { w: "はな", m: "flower; nose" }, { w: "ひと", m: "person" }, { w: "ふね", m: "boat" },
  { w: "ほし", m: "star" }, { w: "へそ", m: "belly button" }, { w: "ふたつ", m: "two (things)" },
  { w: "め", m: "eye" }, { w: "みみ", m: "ear" }, { w: "うみ", m: "sea" }, { w: "あめ", m: "rain" },
  { w: "むし", m: "insect" }, { w: "もも", m: "peach" }, { w: "みせ", m: "shop" },
  { w: "やま", m: "mountain" }, { w: "ゆき", m: "snow" }, { w: "よる", m: "night" },
  { w: "やさい", m: "vegetables" }, { w: "ゆめ", m: "dream" }, { w: "ひよこ", m: "chick" },
  { w: "そら", m: "sky" }, { w: "くるま", m: "car" }, { w: "さくら", m: "cherry blossom" },
  { w: "これ", m: "this" }, { w: "それ", m: "that" }, { w: "あれ", m: "that (over there)" },
  { w: "ひる", m: "noon" }, { w: "くすり", m: "medicine" }, { w: "とり", m: "bird" },
  { w: "かわ", m: "river" }, { w: "わたし", m: "I; me" }, { w: "ほん", m: "book" },
  { w: "みかん", m: "mandarin orange" }, { w: "せんせい", m: "teacher" }, { w: "にほん", m: "Japan" },
  { w: "ひらがな", m: "hiragana" }, { w: "でんわ", m: "telephone" },
  { w: "こんにちは", m: "hello", r: "konnichiwa", note: "The last は is read wa — it's a grammar marker here." },
  { w: "こんばんは", m: "good evening", r: "konbanwa", note: "は read wa, as in こんにちは." },
  { w: "すみません", m: "excuse me; sorry" }, { w: "ありがとう", m: "thank you" },
  { w: "さようなら", m: "goodbye" }, { w: "はい", m: "yes" }, { w: "おいしい", m: "delicious" },
  { w: "かわいい", m: "cute" }, { w: "たかい", m: "expensive; tall" }, { w: "やすい", m: "cheap" },
  { w: "たまご", m: "egg" }, { w: "ごはん", m: "rice; a meal" }, { w: "かぎ", m: "key" },
  { w: "ぎんこう", m: "bank" }, { w: "かぜ", m: "wind; a cold" }, { w: "みず", m: "water" },
  { w: "かぞく", m: "family" }, { w: "ともだち", m: "friend" }, { w: "でぐち", m: "exit" },
  { w: "いりぐち", m: "entrance" }, { w: "ください", m: "please (give me)" },
  { w: "でんき", m: "electricity; light" }, { w: "だいがく", m: "university" }, { w: "ぶた", m: "pig" },
  { w: "えんぴつ", m: "pencil" }, { w: "てんぷら", m: "tempura" }, { w: "さんぽ", m: "a walk" },
  { w: "ぺこぺこ", m: "starving (my stomach is…)" }, { w: "ぴかぴか", m: "sparkling" },
  { w: "おちゃ", m: "tea" }, { w: "きょう", m: "today" }, { w: "しゃしん", m: "photo" },
  { w: "いしゃ", m: "doctor" }, { w: "でんしゃ", m: "train" }, { w: "しょうゆ", m: "soy sauce" },
  { w: "ひゃく", m: "hundred" }, { w: "りょこう", m: "travel" }, { w: "びょういん", m: "hospital" },
  { w: "ぎゅうにゅう", m: "milk" }, { w: "じゃあね", m: "see you" }, { w: "じゅぎょう", m: "class; lesson" },
  { w: "きって", m: "stamp" }, { w: "ざっし", m: "magazine" }, { w: "がっこう", m: "school" },
  { w: "ちょっと", m: "a little" }, { w: "いっしょ", m: "together" },
  { w: "おかあさん", m: "mother" }, { w: "おとうさん", m: "father" }, { w: "おばあさん", m: "grandmother" },

  /* katakana — mostly borrowed, so the meaning is usually the word itself */
  { w: "アイス", m: "ice cream" }, { w: "ケーキ", m: "cake" }, { w: "コーヒー", m: "coffee" },
  { w: "タクシー", m: "taxi" }, { w: "テスト", m: "test" }, { w: "トイレ", m: "toilet" },
  { w: "テニス", m: "tennis" }, { w: "ノート", m: "notebook" }, { w: "ホテル", m: "hotel" },
  { w: "カメラ", m: "camera" }, { w: "メニュー", m: "menu" }, { w: "ミルク", m: "milk" },
  { w: "ラーメン", m: "ramen" }, { w: "カレー", m: "curry" }, { w: "スマホ", m: "smartphone" },
  { w: "レストラン", m: "restaurant" }, { w: "ワイン", m: "wine" }, { w: "パン", m: "bread" },
  { w: "テレビ", m: "TV" }, { w: "バス", m: "bus" }, { w: "ビール", m: "beer" }, { w: "ビル", m: "building" },
  { w: "ゲーム", m: "game" }, { w: "サラダ", m: "salad" }, { w: "スープ", m: "soup" },
  { w: "ピザ", m: "pizza" }, { w: "ジュース", m: "juice" }, { w: "チーズ", m: "cheese" },
  { w: "ペン", m: "pen" }, { w: "パソコン", m: "computer", note: "From パーソナル・コンピューター, personal computer." },
  { w: "コンビニ", m: "convenience store" }, { w: "デパート", m: "department store" },
  { w: "スーパー", m: "supermarket" }, { w: "エアコン", m: "air conditioner" },
  { w: "エレベーター", m: "elevator" }, { w: "ハンバーガー", m: "hamburger" },
  { w: "アイスクリーム", m: "ice cream" }, { w: "アメリカ", m: "America" }, { w: "カナダ", m: "Canada" },
  { w: "イギリス", m: "the UK" }, { w: "ドア", m: "door" }, { w: "メール", m: "email" },
  { w: "ニュース", m: "news" }, { w: "ギター", m: "guitar" }, { w: "ピアノ", m: "piano" },
  { w: "バナナ", m: "banana" }, { w: "トマト", m: "tomato" }, { w: "オレンジ", m: "orange" },
  { w: "ベッド", m: "bed" }, { w: "カップ", m: "cup" }, { w: "チケット", m: "ticket" },
  { w: "ネット", m: "the internet" }, { w: "ロボット", m: "robot" }, { w: "サッカー", m: "soccer" },
  { w: "キャベツ", m: "cabbage" }, { w: "シャツ", m: "shirt" }, { w: "ジャム", m: "jam" },
  { w: "チョコレート", m: "chocolate" }, { w: "ヨーグルト", m: "yogurt" }, { w: "キッチン", m: "kitchen" },
  { w: "マンション", m: "apartment block", note: "Not a mansion — an ordinary block of flats." },
  { w: "パーティー", m: "party" }, { w: "ティッシュ", m: "tissue" }, { w: "フォーク", m: "fork" },
  { w: "ソファ", m: "sofa" }, { w: "カフェ", m: "café" }, { w: "ウィンドウ", m: "window (on a screen)" },
  { w: "ディズニー", m: "Disney" }, { w: "シェフ", m: "chef" }, { w: "チェック", m: "check" },
];

/* Hear it, pick the spelling. っ, ッ and ー have no sound of their own — what
   you hear is a pause, or a vowel held longer — so this is how they are
   drilled. `alt` are the spellings it could be mistaken for; they need not be
   real words. `c` is the concept item the answer credits. */
const KANA_PAIRS_WORDS = [
  { w: "きって", m: "stamp", alt: ["きて"], c: "っ" },
  { w: "きて", m: "come (please)", alt: ["きって"], c: "っ" },
  { w: "おっと", m: "husband", alt: ["おと"], c: "っ" },
  { w: "おと", m: "sound", alt: ["おっと"], c: "っ" },
  { w: "さっか", m: "writer", alt: ["さか"], c: "っ" },
  { w: "いっしょ", m: "together", alt: ["いしょ"], c: "っ" },
  { w: "ざっし", m: "magazine", alt: ["ざし"], c: "っ" },
  { w: "おばあさん", m: "grandmother", alt: ["おばさん"], c: "っ" },
  { w: "おばさん", m: "aunt", alt: ["おばあさん"], c: "っ" },
  { w: "おじいさん", m: "grandfather", alt: ["おじさん"], c: "っ" },
  { w: "おじさん", m: "uncle", alt: ["おじいさん"], c: "っ" },
  { w: "ゆうき", m: "courage", alt: ["ゆき"], c: "っ" },
  { w: "ゆき", m: "snow", alt: ["ゆうき"], c: "っ" },
  { w: "びょういん", m: "hospital", alt: ["びよういん"], c: "っ" },
  { w: "びよういん", m: "hair salon", alt: ["びょういん"], c: "っ" },
  { w: "ベッド", m: "bed", alt: ["ベド"], c: "ッ" },
  { w: "カップ", m: "cup", alt: ["カプ"], c: "ッ" },
  { w: "チケット", m: "ticket", alt: ["チケト"], c: "ッ" },
  { w: "ネット", m: "the internet", alt: ["ネト"], c: "ッ" },
  { w: "キッチン", m: "kitchen", alt: ["キチン"], c: "ッ" },
  { w: "ビール", m: "beer", alt: ["ビル"], c: "ー" },
  { w: "ビル", m: "building", alt: ["ビール"], c: "ー" },
  { w: "ケーキ", m: "cake", alt: ["ケキ", "ケーキー"], c: "ー" },
  { w: "コーヒー", m: "coffee", alt: ["コヒー", "コーヒ"], c: "ー" },
  { w: "スーパー", m: "supermarket", alt: ["スパー", "スーパ"], c: "ー" },
  { w: "ノート", m: "notebook", alt: ["ノト"], c: "ー" },
];

/* What a concept item's lesson card says, in place of a picture. */
const KANA_CONCEPT = {
  "っ": {
    head: "A small っ is a pause, not a sound",
    body: "Written half size, っ doubles the consonant after it: you stop for a beat, then go on. きて is “kite”; きって is “kit-te”. A vowel written twice is held twice as long: おばさん is aunt, おばあさん is grandmother. Neither has a sound of its own — you learn them by ear.",
    ex: ["きて", "きって", "おばさん", "おばあさん"],
  },
  "ッ": {
    head: "Small ッ works exactly like っ",
    body: "A beat of silence before the next consonant: ベッド is “bed-do”, カップ is “kap-pu”.",
    ex: ["カップ", "ベッド", "チケット"],
  },
  "ー": {
    head: "The bar ー holds the vowel before it",
    body: "Katakana doesn't double a vowel to lengthen it — it draws a line. ビル is a building; ビール is beer. Get it wrong in a bar and you'll know.",
    ex: ["ビル", "ビール", "コーヒー"],
  },
};

/* ------------------------------------------------------------------ */

const toKata = s => s.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));
const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));

/* Sound identity: glyphs that are said the same share one clip, and are never
   offered as each other's wrong answer in a listening drill. */
const SAY_SAME = { "ぢ": "じ", "づ": "ず", "を": "お" };

const KANA = [];
const KANA_BY = {};
LESSONS.forEach(L => {
  if (L.from) {
    const src = LESSONS.find(x => x.id === L.from);
    L.g = toKata(src.g);
    L.r = src.r;
    L.kind = src.kind;
    L.title = toKata(src.title);
  }
  const gs = L.g.split(" "), rs = L.r.split(" ");
  L.items = gs;
  gs.forEach((k, i) => {
    const hira = toHira(k);
    const e = {
      k, r: rs[i], set: L.set, lesson: L.id,
      say: L.kind === "loan" ? k : (SAY_SAME[hira] || hira),
    };
    if (L.kind === "concept") e.concept = true;
    if (KANA_STORY[k]) e.story = KANA_STORY[k];
    KANA.push(e);
    KANA_BY[k] = e;
  });
});

/* Romaji a typed answer may also use. */
const ROMAJI_ALT = {
  shi: ["si"], chi: ["ti"], tsu: ["tu"], fu: ["hu"], ji: ["zi", "di"], zu: ["du"],
  wo: ["o"], n: ["nn"], sha: ["sya"], shu: ["syu"], sho: ["syo"], cha: ["tya", "cya"],
  chu: ["tyu", "cyu"], cho: ["tyo", "cyo"], ja: ["zya", "jya"], ju: ["zyu", "jyu"], jo: ["zyo", "jyo"],
};

/* Split a kana string into the units lessons teach: きゃ is one, っ is one. */
function kanaUnits(s) {
  const out = [];
  const chars = [...s];
  for (let i = 0; i < chars.length; i++) {
    const two = chars[i] + (chars[i + 1] || "");
    if (chars[i + 1] && KANA_BY[two]) { out.push(two); i++; }
    else out.push(chars[i]);
  }
  return out;
}

/* Hepburn-ish romaji for a kana string: っ doubles what follows, ー repeats the
   vowel before it, ん before a vowel or y takes an apostrophe. */
function toRomaji(s) {
  const units = kanaUnits(s);
  let out = "", dbl = false;
  units.forEach((u, i) => {
    if (u === "っ" || u === "ッ") { dbl = true; return; }
    if (u === "ー") { const v = out.match(/[aeiou]$/); if (v) out += v[0]; return; }
    let r = KANA_BY[u] ? KANA_BY[u].r : u;
    if (u === "を" || u === "ヲ") r = "o";
    if (dbl) { r = r.startsWith("ch") ? "t" + r : r[0] + r; dbl = false; }
    if ((u === "ん" || u === "ン") && /^[aeiouy]/.test(KANA_BY[units[i + 1]]?.r || "")) r = "n'";
    out += r;
  });
  return out;
}

/* Why a kana word is spelled the way it is: it isn't, beyond its sound.
   あい is a + i, and that sound is the word for love; nothing in あ or い
   means love. So each native word gets the two things that do help:

   kj    how it's usually written, when that's a kanji — the part of Japanese
         writing that carries meaning. Shown small, as a preview; kanji are
         taught later, through words (README → Kanji).
   hook  a sound-alike to tie the sound to the meaning, only where there's a
         good one. A bad mnemonic is worse than none.

   Loanwords need neither: the meaning is the English word, said in kana. */
const KANA_WORD_EXTRA = {
  あい: { kj: "愛", hook: "ai — “I” love you." }, いえ: { kj: "家" }, うえ: { kj: "上" },
  あお: { kj: "青", hook: "ah-oh — “ow!”, and a blue bruise." }, いいえ: { hook: "ee-eh — said with a little shake of the head." },
  え: { kj: "絵" }, かお: { kj: "顔", hook: "ka-o — a cow's face." }, あき: { kj: "秋", hook: "a-ki — achy knees when the autumn cold sets in." },
  いけ: { kj: "池" }, ここ: { hook: "ko-ko — Coco, come here!" }, こえ: { kj: "声" }, き: { kj: "木", hook: "ki — a key hanging on a tree." },
  あさ: { kj: "朝" }, かさ: { kj: "傘", hook: "ka-sa — casa: an umbrella is a little house in the rain." },
  しお: { kj: "塩", hook: "shi-o — “She, oh!” — too much salt." }, せかい: { kj: "世界" }, おかし: { kj: "お菓子" },
  て: { kj: "手" }, くち: { kj: "口" }, した: { kj: "下" }, つくえ: { kj: "机" }, そと: { kj: "外" }, ちかてつ: { kj: "地下鉄" },
  いぬ: { kj: "犬", hook: "i-nu — “a new dog!”" }, ねこ: { kj: "猫", hook: "ne-ko — a cat curled round your neck." },
  なつ: { kj: "夏" }, さかな: { kj: "魚" }, なに: { kj: "何", hook: "na-ni — the “nani?!” of every anime: what?!" },
  おかね: { kj: "お金" }, はな: { kj: "花 · 鼻", hook: "ha-na — Hannah sniffs a flower with her nose." },
  ひと: { kj: "人" }, ふね: { kj: "船" }, ほし: { kj: "星" }, ふたつ: { kj: "二つ" },
  め: { kj: "目", hook: "me — point at your eye: “me”." }, みみ: { kj: "耳", hook: "mi-mi — shouting “me, me!” in someone's ear." },
  うみ: { kj: "海", hook: "u-mi — “ooh, me!”, jumping into the sea." }, あめ: { kj: "雨", hook: "a-me — “ah, meh”: raining again." },
  むし: { kj: "虫", hook: "mu-shi — squash it to mush." }, もも: { kj: "桃" }, みせ: { kj: "店" },
  やま: { kj: "山", hook: "ya-ma — “yah, ma!”, shouted from a mountain top." }, ゆき: { kj: "雪", hook: "yu-ki — yucky slush after the snow." },
  よる: { kj: "夜" }, やさい: { kj: "野菜" }, ゆめ: { kj: "夢", hook: "yu-me — you and me, in a dream." },
  そら: { kj: "空", hook: "so-ra — soar up into the sky." }, くるま: { kj: "車" }, さくら: { kj: "桜" },
  ひる: { kj: "昼" }, くすり: { kj: "薬" }, とり: { kj: "鳥" }, かわ: { kj: "川" }, わたし: { kj: "私" },
  ほん: { kj: "本" }, せんせい: { kj: "先生" }, にほん: { kj: "日本" }, でんわ: { kj: "電話" },
  ありがとう: { hook: "a-ri-ga-to — “alligator”, said quickly." }, たかい: { kj: "高い" }, やすい: { kj: "安い" },
  たまご: { kj: "卵" }, ごはん: { kj: "ご飯" }, かぎ: { kj: "鍵" }, ぎんこう: { kj: "銀行" }, かぜ: { kj: "風 · 風邪" },
  みず: { kj: "水" }, かぞく: { kj: "家族" }, ともだち: { kj: "友達" }, でぐち: { kj: "出口" }, いりぐち: { kj: "入口" },
  でんき: { kj: "電気" }, だいがく: { kj: "大学" }, ぶた: { kj: "豚" }, えんぴつ: { kj: "鉛筆" }, さんぽ: { kj: "散歩" },
  おちゃ: { kj: "お茶" }, きょう: { kj: "今日" }, しゃしん: { kj: "写真" }, いしゃ: { kj: "医者" }, でんしゃ: { kj: "電車" },
  しょうゆ: { kj: "醤油" }, ひゃく: { kj: "百" }, りょこう: { kj: "旅行" }, びょういん: { kj: "病院" },
  ぎゅうにゅう: { kj: "牛乳" }, じゅぎょう: { kj: "授業" }, きって: { kj: "切手" }, ざっし: { kj: "雑誌" },
  がっこう: { kj: "学校" }, いっしょ: { kj: "一緒" }, おかあさん: { kj: "お母さん" }, おとうさん: { kj: "お父さん" },
};

KANA_WORDS.forEach(w => {
  Object.assign(w, KANA_WORD_EXTRA[w.w] || {});
  w.units = kanaUnits(w.w);
  if (!w.r) w.r = toRomaji(w.w);
  w.set = /[゠-ヿ]/.test(w.w) ? "k" : "h";
});
KANA_PAIRS_WORDS.forEach(p => { p.units = kanaUnits(p.w); });

/* ---- typing: romaji in, kana out ----

   The way a Japanese keyboard on a phone or laptop works: you type `taberu`
   and get たべる. Doubled consonants become っ (kitte → きって), n before a
   consonant or at the end is ん (nn and n' work too), and - is ー. Built
   from the kana table, so it can't disagree with the romaji the app teaches;
   ROMAJI_ALT adds the other common spellings (si, tu, hu, zya…). */
const ROMAJI_TO_HIRA = {};
const ROMAJI_TO_KATA_LOAN = {};
KANA.forEach(e => {
  if (e.concept) return;
  if (e.set === "h" && !(e.r in ROMAJI_TO_HIRA)) ROMAJI_TO_HIRA[e.r] = e.k;
  if (LESSONS.find(L => L.id === e.lesson).kind === "loan") ROMAJI_TO_KATA_LOAN[e.r] = e.k;
});
Object.entries(ROMAJI_ALT).forEach(([r, alts]) => alts.forEach(a => {
  if (!(a in ROMAJI_TO_HIRA) && ROMAJI_TO_HIRA[r]) ROMAJI_TO_HIRA[a] = ROMAJI_TO_HIRA[r];
}));

function romajiToKana(input, kata = false) {
  const s = String(input).toLowerCase().replace(/\s+/g, "");
  let out = "";
  for (let i = 0; i < s.length;) {
    const c = s[i], n1 = s[i + 1];
    if (c === "-") { out += "ー"; i++; continue; }
    /* nn is ん — but in konnichiha and onna the second n starts the next
       syllable, so only swallow both when no vowel follows */
    if (c === "n" && n1 === "'") { out += "ん"; i += 2; continue; }
    if (c === "n" && n1 === "n") { out += "ん"; i += /[aiueoy]/.test(s[i + 2] || "") ? 1 : 2; continue; }
    if (c === "n" && (n1 === undefined || !/[aiueoy]/.test(n1))) { out += "ん"; i++; continue; }
    if (c === n1 && /[bcdfghjkmpqrstvwxz]/.test(c)) { out += "っ"; i++; continue; }
    if (c === "t" && n1 === "c") { out += "っ"; i++; continue; }         /* matcha */
    let hit = null;
    for (const len of [3, 2, 1]) {
      const chunk = s.slice(i, i + len);
      if (kata && ROMAJI_TO_KATA_LOAN[chunk]) { hit = [chunk, toHira(ROMAJI_TO_KATA_LOAN[chunk])]; break; }
      if (ROMAJI_TO_HIRA[chunk]) { hit = [chunk, ROMAJI_TO_HIRA[chunk]]; break; }
    }
    if (!hit) { out += c; i++; continue; }
    out += hit[1];
    i += hit[0].length;
  }
  return kata ? toKata(out) : out;
}

/* Do two kana spellings say the same thing? Compared as romaji, so script
   doesn't matter (typing コーヒー as koohii gives コオヒイ), ー is the vowel
   before it held, and おお / おう are both a long o. */
function kanaSame(a, b) {
  const norm = x => toRomaji(x).replace(/'/g, "").replace(/ou/g, "oo");
  return norm(a) === norm(b);
}
