/* Nihongo Quest — コンビニ, the convenience store.

   A place in Out and about you walk round, picking packages up to read
   (js/konbini-ui.js). The brands are made up; the words are the ones on
   real packets. Every string is furigana markup, so it takes the ink and
   the readings drop away as kanji are learned.

   Each product:
     id, shape     how it's drawn (KONBINI_SHAPES; see js/konbini-ui.js)
     shelf         which shelf of its aisle it's stocked on, from the top. Like
                   a real shop, a shelf holds things of a height: cans and
                   cups up top, cartons in the middle, tall bottles below. A
                   shelf's products are shared out across the cabinet's doors
     c             the package's colour; cap / liquid for bottles
     brand         a made-up maker, in capitals, small at the top of the label
     vert          the name is set top to bottom (tea and water bottles)
     nori: false   an onigiri with no seaweed (the plain salt one)
     name, lines   the product's name; lines, where it breaks on the package
                   (joined, they must be the name)
     say           its reading, for the voice and "how is it read?"
     en            what it is
     copy, copyEn  the slogan on the front
     tags, tagsEn  the small red flashes: 無糖, あたたかい, 新発売
     price         yen, tax included
     back          the label on the back: [term, value, English, what this line tells you]
     cq            a question about the slogan: [ask, right, wrong, wrong, wrong]

   The aisles run in the order you walk them: the cold drinks, the hot
   drinks warmer, the onigiri chiller, the sweets shelf, then the register. */

const KONBINI_SHAPES = ["bottle", "can", "carton", "cup", "onigiri", "bag", "pouch", "box", "pack", "tub"];

const KONBINI_AISLES = [
  { id: "cold", jp: "{飲|の}み{物|もの}", en: "Cold drinks", look: "cooler", doors: 2, shelves: 3 },
  { id: "hot", jp: "ホット", en: "Hot drinks", look: "warmer", doors: 1, shelves: 2 },
  { id: "rice", jp: "おにぎり", en: "Rice balls", look: "chiller", shelves: 3 },
  { id: "sweets", jp: "お{菓子|かし}", en: "Sweets and snacks", look: "gondola", shelves: 2 },
];

/* The back labels, by kind of product. A drink keeps for months (賞味期限,
   best before); an onigiri or a pudding for a day (消費期限, use by, with
   the hour). */
const kbDrink = (kind, ingr, amount, kcal) => [
  ["{名称|めいしょう}", kind, "Product type", "what kind of product it is"],
  ["{原材料名|げんざいりょうめい}", ingr, "Ingredients", "what's in it"],
  ["{内容量|ないようりょう}", amount, "Contents (amount)", "how much is inside"],
  ["{賞味期限|しょうみきげん}", "27.03.15", "Best before (year.month.day)", "when it's best before"],
  ["エネルギー", kcal, "Energy (calories)", "how many calories it has"],
];
const kbRice = (ingr, kcal) => [
  ["{名称|めいしょう}", "おにぎり", "Product type", "what kind of product it is"],
  ["{原材料名|げんざいりょうめい}", ingr, "Ingredients", "what's in it"],
  ["{消費期限|しょうひきげん}", "26.10.03 {午前|ごぜん}5{時|じ}", "Use by (date and hour)", "when you must eat it by"],
  ["エネルギー", kcal, "Energy (calories)", "how many calories it has"],
];
const kbSweet = (kind, ingr, amount, kcal, useBy) => [
  ["{名称|めいしょう}", kind, "Product type", "what kind of product it is"],
  ["{原材料名|げんざいりょうめい}", ingr, "Ingredients", "what's in it"],
  ["{内容量|ないようりょう}", amount, "Contents (amount)", "how much is inside"],
  useBy ? ["{消費期限|しょうひきげん}", "26.10.04", "Use by", "when you must eat it by"]
        : ["{賞味期限|しょうみきげん}", "27.04.30", "Best before (year.month.day)", "when it's best before"],
  ["エネルギー", kcal, "Energy (calories)", "how many calories it has"],
];

const KONBINI = [
  /* ---- 飲み物: the cooler, three glass doors ---- */
  { id: "ocha", aisle: "cold", shelf: 2, shape: "bottle", vert: true, c: "#3E7B3A", cap: "#2B5A26", liquid: "#B5C46F", brand: "SAKURA",
    name: "お{茶|ちゃ}", say: "おちゃ", en: "Green tea", copy: "すっきり", copyEn: "Clean, refreshing taste",
    tags: ["{無糖|むとう}"], tagsEn: ["Unsweetened"], price: 140,
    back: kbDrink("{緑茶|りょくちゃ}", "{緑茶|りょくちゃ}、ビタミンC", "500ml", "0kcal"),
    cq: ["The bottle says すっきり. What does it tell you?", "It tastes clean and refreshing", "It's very sweet", "It's hot", "It's on sale"] },
  { id: "mugicha", aisle: "cold", shelf: 2, shape: "bottle", vert: true, c: "#9A6B2E", cap: "#5E3D17", liquid: "#C9935A", brand: "SAKURA",
    name: "{麦茶|むぎちゃ}", say: "むぎちゃ", en: "Barley tea", copy: "カフェインゼロ", copyEn: "Caffeine-free",
    tags: [], tagsEn: [], price: 130,
    back: kbDrink("{麦茶|むぎちゃ}", "{大麦|おおむぎ}、ビタミンC", "600ml", "0kcal"),
    cq: ["What does カフェインゼロ tell you?", "It has no caffeine", "It's extra strong", "It's hot", "It's a small bottle"] },
  { id: "oolong", aisle: "cold", shelf: 2, shape: "bottle", vert: true, c: "#8A3B22", cap: "#5A2414", liquid: "#B9764A", brand: "SAKURA",
    name: "ウーロン{茶|ちゃ}", lines: ["ウーロン", "{茶|ちゃ}"], say: "ウーロンちゃ", en: "Oolong tea", copy: "{香|かお}り{高|たか}い", copyEn: "Rich aroma",
    tags: [], tagsEn: [], price: 140,
    back: kbDrink("ウーロン{茶|ちゃ}", "ウーロン{茶|ちゃ}", "500ml", "0kcal"),
    cq: ["What does 香り高い promise?", "A rich aroma", "A high price", "A tall bottle", "Extra caffeine"] },
  { id: "mizu", aisle: "cold", shelf: 2, shape: "bottle", vert: true, c: "#2F7FB5", cap: "#EAF0F4", liquid: "#DCEEF7", brand: "ALPS",
    name: "おいしい{水|みず}", lines: ["おいしい", "{水|みず}"], say: "おいしいみず", en: "Tasty water", copy: "{天然水|てんねんすい}", copyEn: "Natural spring water",
    tags: [], tagsEn: [], price: 110,
    back: kbDrink("ナチュラルミネラルウォーター", "{水|みず}（{鉱水|こうすい}）", "550ml", "0kcal"),
    cq: ["What kind of water does it say it is?", "Natural spring water", "Sparkling water", "Hot water", "Tap water"] },
  { id: "tansan", aisle: "cold", shelf: 2, shape: "bottle", c: "#1F8F8A", cap: "#E8F2F1", liquid: "#E2F3F2", brand: "SPARK",
    name: "{炭酸水|たんさんすい}", say: "たんさんすい", en: "Sparkling water", copy: "{強炭酸|きょうたんさん}", copyEn: "Extra fizzy",
    tags: [], tagsEn: [], price: 120,
    back: kbDrink("{炭酸水|たんさんすい}", "{水|みず}、{炭酸|たんさん}", "500ml", "0kcal"),
    cq: ["What does 強炭酸 promise?", "Extra fizzy", "Extra cold", "Extra sweet", "Lemon flavour"] },
  { id: "cola", aisle: "cold", shelf: 0, shape: "can", c: "#B3271F", brand: "FIZZ",
    name: "コーラ", say: "コーラ", en: "Cola", copy: "ゼロカロリー", copyEn: "Zero calories",
    tags: [], tagsEn: [], price: 160,
    back: kbDrink("{炭酸飲料|たんさんいんりょう}", "{炭酸|たんさん}、{甘味料|かんみりょう}、{香料|こうりょう}", "350ml", "0kcal"),
    cq: ["What does ゼロカロリー promise?", "Zero calories", "Extra caffeine", "Lemon flavour", "A large size"] },
  { id: "coffee", aisle: "cold", shelf: 0, shape: "can", c: "#2A2420", brand: "BLACK",
    name: "ブラックコーヒー", lines: ["ブラック", "コーヒー"], say: "ブラックコーヒー", en: "Black coffee", copy: "{無糖|むとう}", copyEn: "Unsweetened",
    tags: [], tagsEn: [], price: 130,
    back: kbDrink("コーヒー", "コーヒー", "185g", "0kcal"),
    cq: ["The can says 無糖. What does that mean?", "No sugar", "No caffeine", "Low fat", "Not hot"] },
  { id: "melon", aisle: "cold", shelf: 0, shape: "can", c: "#2F9E4A", brand: "FIZZ",
    name: "メロンソーダ", lines: ["メロン", "ソーダ"], say: "メロンソーダ", en: "Melon soda", copy: "しゅわしゅわ", copyEn: "Fizzy!",
    tags: [], tagsEn: [], price: 140,
    back: kbDrink("{炭酸飲料|たんさんいんりょう}", "{砂糖|さとう}、{炭酸|たんさん}、{香料|こうりょう}", "350ml", "160kcal"),
    cq: ["What does しゅわしゅわ describe?", "Fizzy bubbles", "A sour taste", "Crunchy ice", "A hot drink"] },
  { id: "sports", aisle: "cold", shelf: 2, shape: "bottle", c: "#2C62B8", cap: "#F2F4F7", liquid: "#E8EEF6", brand: "AQUA",
    name: "スポーツドリンク", lines: ["スポーツ", "ドリンク"], say: "スポーツドリンク", en: "Sports drink", copy: "{水分補給|すいぶんほきゅう}", copyEn: "For rehydrating",
    tags: [], tagsEn: [], price: 150,
    back: kbDrink("{清涼飲料水|せいりょういんりょうすい}", "{砂糖|さとう}、{食塩|しょくえん}、{香料|こうりょう}", "500ml", "125kcal"),
    cq: ["What is 水分補給 for?", "Rehydrating", "Losing weight", "Waking up", "Falling asleep"] },
  { id: "latte", aisle: "cold", shelf: 0, shape: "cup", c: "#9C6A43", brand: "CAFE",
    name: "カフェラテ", lines: ["カフェ", "ラテ"], say: "カフェラテ", en: "Caffè latte", copy: "ミルクたっぷり", copyEn: "Lots of milk",
    tags: ["{新発売|しんはつばい}"], tagsEn: ["New"], price: 198,
    back: kbDrink("{乳飲料|にゅういんりょう}", "{牛乳|ぎゅうにゅう}、コーヒー、{砂糖|さとう}", "240ml", "130kcal"),
    cq: ["What does ミルクたっぷり tell you?", "There's plenty of milk", "It's milk-free", "It's a small cup", "It's iced"] },
  { id: "oj", aisle: "cold", shelf: 1, shape: "carton", c: "#E5862F", brand: "SUN",
    name: "オレンジジュース", lines: ["オレンジ", "ジュース"], say: "オレンジジュース", en: "Orange juice", copy: "{果汁|かじゅう}100%", copyEn: "100% fruit juice",
    tags: [], tagsEn: [], price: 120,
    back: kbDrink("オレンジジュース", "オレンジ", "200ml", "90kcal"),
    cq: ["What does 果汁100% mean?", "100% fruit juice", "100 yen", "100 ml", "100 calories"] },
  { id: "apple", aisle: "cold", shelf: 1, shape: "carton", c: "#C23B3B", brand: "SUN",
    name: "りんごジュース", lines: ["りんご", "ジュース"], say: "りんごジュース", en: "Apple juice", copy: "あおもりのりんご", copyEn: "Apples from Aomori",
    tags: [], tagsEn: [], price: 120,
    back: kbDrink("りんごジュース", "りんご", "200ml", "88kcal"),
    cq: ["Where does it say the apples are from?", "Aomori", "Hokkaido", "Okinawa", "Kyoto"] },
  { id: "ichigo", aisle: "cold", shelf: 1, shape: "carton", c: "#E07A97", brand: "FARM",
    name: "いちごミルク", lines: ["いちご", "ミルク"], say: "いちごミルク", en: "Strawberry milk", copy: "あまずっぱい", copyEn: "Sweet and tangy",
    tags: [], tagsEn: [], price: 158,
    back: kbDrink("{乳飲料|にゅういんりょう}", "{牛乳|ぎゅうにゅう}、いちご、{砂糖|さとう}", "500ml", "310kcal"),
    cq: ["What does あまずっぱい describe?", "Sweet and tangy", "Very bitter", "Salty", "Spicy"] },
  { id: "milk", aisle: "cold", shelf: 1, shape: "carton", c: "#3D6EA8", brand: "FARM",
    name: "{牛乳|ぎゅうにゅう}", say: "ぎゅうにゅう", en: "Milk", copy: "まいにち、カルシウム", copyEn: "Calcium, every day",
    tags: [], tagsEn: [], price: 168,
    back: kbDrink("{牛乳|ぎゅうにゅう}", "{生乳|せいにゅう}100%", "500ml", "335kcal"),
    cq: ["What's the slogan selling?", "Calcium, every day", "Morning coffee", "Low fat", "A free gift"] },

  /* ---- ホット: the hot drinks warmer ---- */
  { id: "oshiruko", aisle: "hot", shelf: 0, shape: "can", c: "#7A2E2E", brand: "AZUKI",
    name: "おしるこ", say: "おしるこ", en: "Sweet red bean soup", copy: "つぶあん", copyEn: "Chunky red bean paste",
    tags: ["あたたかい"], tagsEn: ["Hot (from the warmer)"], price: 140,
    back: kbDrink("しるこ", "{砂糖|さとう}、あずき", "190g", "150kcal"),
    cq: ["What does つぶあん tell you?", "It has chunky red bean paste in it", "It's smooth", "It's spicy", "It's cold"] },
  { id: "milktea", aisle: "hot", shelf: 1, shape: "bottle", c: "#A9402B", cap: "#E3A034", liquid: "#D6B086", brand: "HOT",
    name: "ミルクティー", lines: ["ミルク", "ティー"], say: "ミルクティー", en: "Milk tea", copy: "あまさひかえめ", copyEn: "Not too sweet",
    tags: ["あたたかい"], tagsEn: ["Hot (from the warmer)"], price: 150,
    back: kbDrink("{紅茶|こうちゃ}{飲料|いんりょう}", "{牛乳|ぎゅうにゅう}、{砂糖|さとう}、{紅茶|こうちゃ}", "345ml", "120kcal"),
    cq: ["What does あまさひかえめ tell you?", "It's not too sweet", "It's extra sweet", "It's sugar-free", "It's sour"] },
  { id: "hojicha", aisle: "hot", shelf: 1, shape: "bottle", vert: true, c: "#7A4A2A", cap: "#E3A034", liquid: "#B07A4E", brand: "SAKURA",
    name: "ほうじ{茶|ちゃ}", say: "ほうじちゃ", en: "Roasted green tea", copy: "こうばしい", copyEn: "Toasty, roasted aroma",
    tags: ["あたたかい"], tagsEn: ["Hot (from the warmer)"], price: 140,
    back: kbDrink("ほうじ{茶|ちゃ}", "{緑茶|りょくちゃ}", "345ml", "0kcal"),
    cq: ["What does こうばしい describe?", "A toasty, roasted aroma", "A sour taste", "Fizzy bubbles", "A cold drink"] },
  { id: "cornsoup", aisle: "hot", shelf: 0, shape: "can", c: "#E3B23C", brand: "SOUP",
    name: "コーンスープ", lines: ["コーン", "スープ"], say: "コーンスープ", en: "Corn soup", copy: "つぶ{入|い}り", copyEn: "With whole kernels",
    tags: ["あたたかい"], tagsEn: ["Hot (from the warmer)"], price: 130,
    back: kbDrink("スープ", "スイートコーン、{牛乳|ぎゅうにゅう}、{砂糖|さとう}", "185g", "80kcal"),
    cq: ["What does つぶ入り tell you?", "There are whole corn kernels in it", "It's smooth", "It's spicy", "It's cold"] },
  { id: "lemon", aisle: "hot", shelf: 1, shape: "bottle", c: "#E2C232", cap: "#F2F0E8", liquid: "#F3E7A2", brand: "HOT",
    name: "ホットレモン", lines: ["ホット", "レモン"], say: "ホットレモン", en: "Hot lemon", copy: "ビタミンCたっぷり", copyEn: "Full of vitamin C",
    tags: ["あたたかい"], tagsEn: ["Hot (from the warmer)"], price: 140,
    back: kbDrink("{清涼飲料水|せいりょういんりょうすい}", "{砂糖|さとう}、レモン{果汁|かじゅう}", "280ml", "120kcal"),
    cq: ["What is it full of?", "Vitamin C", "Caffeine", "Milk", "Sugar-free sweetener"] },

  /* ---- おにぎり: the open chiller ---- */
  { id: "tuna", aisle: "rice", shelf: 0, shape: "onigiri", c: "#E2B33C",
    name: "ツナマヨ", say: "ツナマヨ", en: "Tuna mayo", copy: "まろやか", copyEn: "Mild and creamy",
    tags: [], tagsEn: [], price: 150, back: kbRice("ごはん、ツナ、マヨネーズ、のり", "230kcal"),
    cq: ["How does it say it tastes?", "Mild and creamy", "Spicy", "Sour", "Salty"] },
  { id: "sake", aisle: "rice", shelf: 0, shape: "onigiri", c: "#E07A4F",
    name: "{鮭|さけ}", say: "さけ", en: "Salmon", copy: "{人気|にんき}No.1", copyEn: "Most popular",
    tags: [], tagsEn: [], price: 160, back: kbRice("ごはん、{鮭|さけ}、のり、{塩|しお}", "180kcal"),
    cq: ["What does 人気No.1 say?", "It's the most popular", "It's the first one made", "It's the biggest", "It's the last one left"] },
  { id: "ume", aisle: "rice", shelf: 0, shape: "onigiri", c: "#B83A55",
    name: "{梅|うめ}", say: "うめ", en: "Pickled plum", copy: "すっぱい", copyEn: "Sour!",
    tags: [], tagsEn: [], price: 130, back: kbRice("ごはん、{梅|うめ}、のり", "170kcal"),
    cq: ["What does すっぱい warn you about?", "It's sour", "It's spicy", "It's sweet", "It's hot"] },
  { id: "kombu", aisle: "rice", shelf: 1, shape: "onigiri", c: "#4E7A45",
    name: "こんぶ", say: "こんぶ", en: "Kelp", copy: "あまから", copyEn: "Sweet and savoury",
    tags: [], tagsEn: [], price: 130, back: kbRice("ごはん、こんぶ、のり、しょうゆ", "170kcal"),
    cq: ["What does あまから mean?", "Sweet and savoury", "Very spicy", "Plain, no filling", "Extra large"] },
  { id: "okaka", aisle: "rice", shelf: 1, shape: "onigiri", c: "#A4673A",
    name: "おかか", say: "おかか", en: "Bonito flakes", copy: "しょうゆ{味|あじ}", copyEn: "Soy sauce flavour",
    tags: [], tagsEn: [], price: 130, back: kbRice("ごはん、かつおぶし、しょうゆ、のり", "175kcal"),
    cq: ["What flavour does it say?", "Soy sauce", "Salt", "Miso", "Curry"] },
  { id: "mentai", aisle: "rice", shelf: 1, shape: "onigiri", c: "#C8332B",
    name: "{明太子|めんたいこ}", say: "めんたいこ", en: "Spicy cod roe (mentaiko)", copy: "ピリッと{辛|から}い", copyEn: "With a spicy kick",
    tags: [], tagsEn: [], price: 170, back: kbRice("ごはん、{明太子|めんたいこ}、のり", "175kcal"),
    cq: ["What does ピリッと辛い tell you?", "It has a spicy kick", "It's mild", "It's sour", "It's sweet"] },
  { id: "niku", aisle: "rice", shelf: 2, shape: "onigiri", c: "#8A5A34",
    name: "{肉|にく}みそ", say: "にくみそ", en: "Meat miso", copy: "ごはんがすすむ", copyEn: "Makes you want more rice",
    tags: [], tagsEn: [], price: 160, back: kbRice("ごはん、{豚肉|ぶたにく}、みそ、のり", "210kcal"),
    cq: ["What does ごはんがすすむ mean?", "It makes you want more rice", "It has no rice", "It's for breakfast", "It's a big portion"] },
  { id: "ikura", aisle: "rice", shelf: 2, shape: "onigiri", c: "#E2552E",
    name: "いくら", say: "いくら", en: "Salmon roe", copy: "ぷちぷち", copyEn: "Popping texture",
    tags: [], tagsEn: [], price: 250, back: kbRice("ごはん、いくら、のり", "170kcal"),
    cq: ["What does ぷちぷち describe?", "Little beads that pop", "A sour taste", "A crunchy coating", "A hot filling"] },
  { id: "shio", aisle: "rice", shelf: 2, shape: "onigiri", nori: false, c: "#7F8C93",
    name: "{塩|しお}むすび", say: "しおむすび", en: "Salted rice ball (plain)", copy: "シンプル", copyEn: "Simple",
    tags: [], tagsEn: [], price: 120, back: kbRice("ごはん、{塩|しお}", "160kcal"),
    cq: ["What does シンプル tell you?", "It's plain: rice and salt", "It's spicy", "It's extra large", "It's new"] },

  /* ---- お菓子: the sweets shelf ---- */
  { id: "chips", aisle: "sweets", shelf: 1, shape: "bag", c: "#E2AE2E", brand: "CRISP",
    name: "ポテトチップス", lines: ["ポテト", "チップス"], say: "ポテトチップス", en: "Potato chips", copy: "うすしお{味|あじ}", copyEn: "Lightly salted",
    tags: [], tagsEn: [], price: 150,
    back: kbSweet("ポテトチップス", "じゃがいも、{植物油|しょくぶつゆ}、{食塩|しょくえん}", "60g", "336kcal"),
    cq: ["What flavour is it?", "Lightly salted", "Seaweed", "Consommé", "Spicy"] },
  { id: "senbei", aisle: "sweets", shelf: 1, shape: "bag", c: "#8C5A2B", brand: "KOME",
    name: "おせんべい", say: "おせんべい", en: "Rice crackers", copy: "パリッと", copyEn: "Crisp!",
    tags: [], tagsEn: [], price: 200,
    back: kbSweet("{米菓|べいか}", "うるち{米|まい}、しょうゆ", "10{枚|まい}", "380kcal"),
    cq: ["What does パリッと describe?", "A crisp snap", "A soft chew", "A sour taste", "A hot filling"] },
  { id: "gummy", aisle: "sweets", shelf: 0, shape: "pouch", c: "#7B3F8F", brand: "CHEW",
    name: "グミ", say: "グミ", en: "Gummy sweets", copy: "ぶどう{味|あじ}", copyEn: "Grape flavour",
    tags: [], tagsEn: [], price: 120,
    back: kbSweet("グミキャンデー", "{水|みず}あめ、{砂糖|さとう}、ゼラチン、ぶどう{果汁|かじゅう}", "50g", "165kcal"),
    cq: ["What flavour is it?", "Grape", "Strawberry", "Lemon", "Peach"] },
  { id: "nodoame", aisle: "sweets", shelf: 0, shape: "pouch", c: "#E3A72F", brand: "HONEY",
    name: "のどあめ", say: "のどあめ", en: "Throat drops (sweets)", copy: "はちみつレモン", copyEn: "Honey lemon",
    tags: [], tagsEn: [], price: 180,
    back: kbSweet("キャンデー", "{砂糖|さとう}、{水|みず}あめ、はちみつ", "70g", "270kcal"),
    cq: ["What flavour is it?", "Honey lemon", "Mint", "Grape", "Cola"] },
  { id: "choco", aisle: "sweets", shelf: 1, shape: "box", c: "#5A2E1C", brand: "CACAO",
    name: "チョコレート", lines: ["チョコ", "レート"], say: "チョコレート", en: "Chocolate", copy: "カカオ70%", copyEn: "70% cacao (dark)",
    tags: [], tagsEn: [], price: 220,
    back: kbSweet("チョコレート", "カカオマス、{砂糖|さとう}、ココアバター", "50g", "290kcal"),
    cq: ["What does カカオ70% tell you?", "It's 70% cacao: dark chocolate", "It's 70% off", "There are 70 pieces", "It has 70 calories"] },
  { id: "cookie", aisle: "sweets", shelf: 1, shape: "box", c: "#C98B3E", brand: "BAKE",
    name: "クッキー", say: "クッキー", en: "Cookies", copy: "バターたっぷり", copyEn: "Lots of butter",
    tags: [], tagsEn: [], price: 250,
    back: kbSweet("ビスケット", "{小麦粉|こむぎこ}、バター、{砂糖|さとう}", "88g", "460kcal"),
    cq: ["What does it say there's lots of?", "Butter", "Chocolate", "Salt", "Nuts"] },
  { id: "gum", aisle: "sweets", shelf: 0, shape: "pack", c: "#2E9C78", brand: "FRESH",
    name: "ガム", say: "ガム", en: "Chewing gum", copy: "すっきりミント", copyEn: "Fresh mint",
    tags: [], tagsEn: [], price: 150,
    back: kbSweet("ガム", "{甘味料|かんみりょう}、ガムベース、{香料|こうりょう}", "14{粒|つぶ}", "29kcal"),
    cq: ["What taste is it promising?", "A fresh mint", "Sweet strawberry", "Sour lemon", "Spicy cinnamon"] },
  { id: "purin", aisle: "sweets", shelf: 0, shape: "tub", c: "#E8B94A", brand: "PURIN",
    name: "プリン", say: "プリン", en: "Custard pudding", copy: "とろける", copyEn: "Melts in your mouth",
    tags: ["{期間限定|きかんげんてい}"], tagsEn: ["Limited time only"], price: 180,
    back: kbSweet("{洋生菓子|ようなまがし}", "{牛乳|ぎゅうにゅう}、{卵|たまご}、{砂糖|さとう}", "1{個|こ}", "190kcal", true),
    cq: ["What does とろける promise?", "It melts in your mouth", "It's crunchy", "It's spicy", "It's frozen"] },
];

/* ---- derived ---- */
KONBINI.forEach((p, i) => {
  p.i = i;
  p.kana = furiKana(p.name);
});
const KONBINI_BY = {};
KONBINI.forEach(p => { KONBINI_BY[p.id] = p; });
/* As a place (js/scenes-ui.js → places()): its words are the product names. */
const konbiniItems = () => KONBINI.map(p => ({ w: p.name, m: p.en, kana: p.kana, i: p.i }));
