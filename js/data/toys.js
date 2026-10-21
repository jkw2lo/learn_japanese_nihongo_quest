/* Nihongo Quest — the capsule toys (遊ぶ Games → ガチャ).

   Every game in the Games tab pays coins; coins turn the capsule machine;
   each capsule holds a toy from the set you're collecting. Twenty to a set,
   on shelves of question-mark boxes that fill as you go — and a full set
   opens the next. Each toy is a word: its name in Japanese, to hear.

     id    stable key (state.gacha.owned uses it)
     w     its name, in furigana markup
     m     in English
     rare  a gold capsule: a fifth as likely as the rest (RARE_WEIGHT)

   A set may carry `cost`, what a turn costs while it's the one being
   collected; later sets cost more (spinCost). And `use`, a line to say
   its words in (toyUse), and `ask: "dore"` where the neko should ask
   "which one is it?" rather than for it (Quiz me). A toy may carry `a`,
   its English as that line wants it, or its own `use`.

   The drawings are in js/toys-art.js, one per id. */

const TOY_SETS = [
  { id: "lucky", jp: "{縁起物|えんぎもの}", en: "Lucky charms", cost: 20, use: ["{w}が{好|す}きです", "I like {a}."], toys: [
    { id: "maneki", w: "{招|まね}き{猫|ねこ}", m: "beckoning cat", a: "beckoning cats", rare: true },
    { id: "daruma", w: "だるま", m: "daruma doll", a: "daruma dolls" },
    { id: "kokeshi", w: "こけし", m: "kokeshi doll", a: "kokeshi dolls" },
    { id: "koinobori", w: "こいのぼり", m: "carp streamer", a: "carp streamers" },
    { id: "furin", w: "{風鈴|ふうりん}", m: "wind chime", a: "wind chimes" },
    { id: "chochin", w: "ちょうちん", m: "paper lantern", a: "paper lanterns" },
    { id: "sensu", w: "{扇子|せんす}", m: "folding fan", a: "folding fans" },
    { id: "torii", w: "{鳥居|とりい}", m: "shrine gate", a: "shrine gates" },
    { id: "omamori", w: "お{守|まも}り", m: "good-luck charm", a: "good-luck charms" },
    { id: "fuji", w: "{富士山|ふじさん}", m: "Mount Fuji", a: "Mount Fuji", rare: true },
    { id: "sakura", w: "{桜|さくら}", m: "cherry blossom", a: "cherry blossoms" },
    { id: "tsuru", w: "{折|お}り{鶴|づる}", m: "paper crane", a: "paper cranes" },
    { id: "geta", w: "{下駄|げた}", m: "wooden sandals", a: "wooden sandals" },
    { id: "wagasa", w: "{和傘|わがさ}", m: "paper umbrella", a: "paper umbrellas" },
    { id: "kendama", w: "けん{玉|だま}", m: "cup-and-ball toy", a: "kendama" },
    { id: "tanuki", w: "たぬき", m: "raccoon dog", a: "raccoon dogs" },
    { id: "kitsune", w: "きつねのお{面|めん}", m: "fox mask", a: "fox masks" },
    { id: "kingyo", w: "{金魚|きんぎょ}", m: "goldfish", a: "goldfish", rare: true },
    { id: "uchiwa", w: "うちわ", m: "round fan", a: "round fans" },
    { id: "taiko", w: "{太鼓|たいこ}", m: "drum", a: "taiko drums" },
  ] },
  { id: "food", jp: "{食|た}べ{物|もの}", en: "Food", cost: 20, use: ["{w}をください", "{A}, please."], toys: [
    { id: "onigiri", w: "おにぎり", m: "rice ball", a: "a rice ball" },
    { id: "sushi", w: "すし", m: "sushi", a: "sushi" },
    { id: "ramen", w: "ラーメン", m: "ramen", a: "ramen", rare: true },
    { id: "dango", w: "だんご", m: "dumplings on a stick", a: "dango" },
    { id: "taiyaki", w: "たいやき", m: "fish-shaped cake", a: "a taiyaki", rare: true },
    { id: "tempura", w: "{天|てん}ぷら", m: "tempura", a: "tempura" },
    { id: "bento", w: "お{弁当|べんとう}", m: "boxed lunch", a: "a boxed lunch" },
    { id: "misoshiru", w: "みそしる", m: "miso soup", a: "miso soup" },
    { id: "takoyaki", w: "たこやき", m: "octopus balls", a: "takoyaki" },
    { id: "gyoza", w: "ぎょうざ", m: "dumplings", a: "gyoza" },
    { id: "kakigori", w: "かき{氷|ごおり}", m: "shaved ice", a: "shaved ice" },
    { id: "oden", w: "おでん", m: "oden stew", a: "oden" },
    { id: "senbei", w: "せんべい", m: "rice cracker", a: "a rice cracker" },
    { id: "mochi", w: "{鏡|かがみ}もち", m: "New Year rice cakes", a: "New Year rice cakes", rare: true },
    { id: "curry", w: "カレー", m: "curry", a: "curry" },
    { id: "matcha", w: "{抹茶|まっちゃ}", m: "matcha tea", a: "matcha" },
    { id: "ramune", w: "ラムネ", m: "marble soda", a: "a marble soda" },
    { id: "melonpan", w: "メロンパン", m: "melon bun", a: "a melon bun" },
    { id: "purin", w: "プリン", m: "custard pudding", a: "a pudding" },
    { id: "yakitori", w: "やきとり", m: "grilled chicken", a: "yakitori" },
  ] },
  { id: "town", jp: "{町|まち}", en: "Around town", cost: 25, use: ["{w}はどこですか", "Where's {a}?"], ask: "dore", toys: [
    { id: "jihanki", w: "{自販機|じはんき}", m: "vending machine", a: "a vending machine" },
    { id: "posuto", w: "ポスト", m: "postbox", a: "a postbox" },
    { id: "densha", w: "{電車|でんしゃ}", m: "train", a: "the train" },
    { id: "shinkansen", w: "{新幹線|しんかんせん}", m: "bullet train", a: "the bullet train", rare: true },
    { id: "basu", w: "バス", m: "bus", a: "the bus" },
    { id: "takushi", w: "タクシー", m: "taxi", a: "a taxi" },
    { id: "jitensha", w: "{自転車|じてんしゃ}", m: "bicycle", a: "my bicycle" },
    { id: "shingo", w: "{信号|しんごう}", m: "traffic light", a: "the traffic light" },
    { id: "fumikiri", w: "{踏切|ふみきり}", m: "level crossing", a: "the level crossing" },
    { id: "kon", w: "コーン", m: "traffic cone", a: "the traffic cone" },
    { id: "manhoru", w: "マンホール", m: "manhole cover", a: "the manhole cover" },
    { id: "denchu", w: "{電柱|でんちゅう}", m: "utility pole", a: "the utility pole" },
    { id: "kippu", w: "{切符|きっぷ}", m: "ticket", a: "my ticket" },
    { id: "randoseru", w: "ランドセル", m: "school backpack", a: "my school backpack" },
    { id: "denwa", w: "{公衆電話|こうしゅうでんわ}", m: "payphone", a: "a payphone" },
    { id: "noren", w: "のれん", m: "shop curtain", a: "the shop with the curtain" },
    { id: "robotto", w: "ロボット", m: "robot", a: "the robot" },
    { id: "gacha", w: "ガチャガチャ", m: "capsule machine", a: "the capsule machine", rare: true },
    { id: "ie", w: "{家|いえ}", m: "house", a: "your house" },
    { id: "tower", w: "{東京|とうきょう}タワー", m: "Tokyo Tower", a: "Tokyo Tower", rare: true },
  ] },
  { id: "home", jp: "{家|いえ}", en: "At home", cost: 30, use: ["{w}はどこですか", "Where's the {m}?"], toys: [
    { id: "tsukue", w: "{机|つくえ}", m: "desk" },
    { id: "isu", w: "いす", m: "chair" },
    { id: "beddo", w: "ベッド", m: "bed" },
    { id: "terebi", w: "テレビ", m: "TV" },
    { id: "reizoko", w: "{冷蔵庫|れいぞうこ}", m: "fridge" },
    { id: "sumaho", w: "スマホ", m: "smartphone" },
    { id: "tokei", w: "{時計|とけい}", m: "clock" },
    { id: "kasa", w: "{傘|かさ}", m: "umbrella" },
    { id: "kagi", w: "{鍵|かぎ}", m: "key" },
    { id: "kotatsu", w: "こたつ", m: "heated table", rare: true },
    { id: "futon", w: "{布団|ふとん}", m: "futon" },
    { id: "makura", w: "{枕|まくら}", m: "pillow" },
    { id: "koppu", w: "コップ", m: "glass" },
    { id: "hashi", w: "お{箸|はし}", m: "chopsticks", use: ["お{箸|はし}はどこですか", "Where are the chopsticks?"] },
    { id: "chawan", w: "{茶碗|ちゃわん}", m: "rice bowl" },
    { id: "yakan", w: "やかん", m: "kettle" },
    { id: "ofuro", w: "お{風呂|ふろ}", m: "bath", rare: true },
    { id: "hon", w: "{本|ほん}", m: "book" },
    { id: "mado", w: "{窓|まど}", m: "window" },
    { id: "neko", w: "{猫|ねこ}", m: "cat", rare: true },
  ] },
  /* ---- from 0.65.0: words to say things with. Each set has a line to
     use its words in (use), and the neko asks for one in the way that
     fits (ask: "dore" — which one is it? — where をください doesn't). */
  { id: "feel", jp: "{気持|きも}ち", en: "Feelings", cost: 30, use: ["{w}です", "I'm {a}."], ask: "dore", toys: [
    { id: "ureshii", w: "うれしい", m: "happy" },
    { id: "kanashii", w: "かなしい", m: "sad" },
    { id: "tanoshii", w: "たのしい", m: "having fun", use: ["たのしいです", "This is fun!"] },
    { id: "kowai", w: "こわい", m: "scared" },
    { id: "okotte", w: "{怒|おこ}っている", m: "angry", use: ["{怒|おこ}っています", "I'm angry."] },
    { id: "tsukareta", w: "つかれた", m: "tired", use: ["つかれました", "I'm tired."] },
    { id: "nemui", w: "ねむい", m: "sleepy" },
    { id: "onaka", w: "おなかがすいた", m: "hungry", use: ["おなかがすきました", "I'm hungry."] },
    { id: "nodo", w: "のどがかわいた", m: "thirsty", use: ["のどがかわきました", "I'm thirsty."] },
    { id: "bikkuri", w: "びっくり", m: "surprised", rare: true, use: ["びっくりしました", "What a surprise!"] },
    { id: "hazukashii", w: "はずかしい", m: "embarrassed" },
    { id: "sabishii", w: "さびしい", m: "lonely" },
    { id: "shiawase", w: "しあわせ", m: "blissful", rare: true, use: ["しあわせです", "I'm so happy (content)."] },
    { id: "genki", w: "{元気|げんき}", m: "well", use: ["{元気|げんき}です", "I'm well."] },
    { id: "isogashii", w: "いそがしい", m: "busy" },
    { id: "hima", w: "ひま", m: "free (not busy)", a: "free" },
    { id: "itai", w: "いたい", m: "in pain", use: ["いたいです", "It hurts."] },
    { id: "shinpai", w: "{心配|しんぱい}", m: "worried", use: ["{心配|しんぱい}です", "I'm worried."] },
    { id: "dokidoki", w: "どきどき", m: "nervous", use: ["どきどきします", "I'm nervous."] },
    { id: "daisuki", w: "{大好|だいす}き", m: "love it", rare: true, use: ["{大好|だいす}きです", "I love it!"] },
  ] },
  { id: "fuku", jp: "{服|ふく}", en: "Clothes", cost: 30, use: ["{w}がほしいです", "I want {a}."], toys: [
    { id: "shatsu", w: "シャツ", m: "shirt", a: "a shirt" },
    { id: "tshatsu", w: "{T|ティー}シャツ", m: "T-shirt", a: "a T-shirt" },
    { id: "zubon", w: "ズボン", m: "trousers" },
    { id: "sukato", w: "スカート", m: "skirt", a: "a skirt" },
    { id: "wanpisu", w: "ワンピース", m: "dress", a: "a dress" },
    { id: "kutsu", w: "{靴|くつ}", m: "shoes" },
    { id: "kutsushita", w: "{靴下|くつした}", m: "socks" },
    { id: "boshi", w: "{帽子|ぼうし}", m: "hat", a: "a hat" },
    { id: "megane", w: "めがね", m: "glasses" },
    { id: "koto", w: "コート", m: "coat", a: "a coat" },
    { id: "seta", w: "セーター", m: "sweater", a: "a sweater" },
    { id: "jinzu", w: "ジーンズ", m: "jeans" },
    { id: "mafura", w: "マフラー", m: "scarf", a: "a scarf" },
    { id: "tebukuro", w: "{手袋|てぶくろ}", m: "gloves" },
    { id: "nekutai", w: "ネクタイ", m: "tie", a: "a tie" },
    { id: "pajama", w: "パジャマ", m: "pyjamas" },
    { id: "kaban", w: "かばん", m: "bag", a: "a bag" },
    { id: "sunika", w: "スニーカー", m: "trainers" },
    { id: "udedokei", w: "{腕時計|うでどけい}", m: "watch", a: "a watch", rare: true },
    { id: "kimono", w: "{着物|きもの}", m: "kimono", a: "a kimono", rare: true },
  ] },
  { id: "nomi", jp: "{飲|の}み{物|もの}", en: "Drinks", cost: 30, use: ["{w}をください", "{A}, please."], toys: [
    { id: "mizu", w: "{水|みず}", m: "water" },
    { id: "oyu", w: "お{湯|ゆ}", m: "hot water" },
    { id: "kori", w: "{氷|こおり}", m: "ice" },
    { id: "ocha", w: "お{茶|ちゃ}", m: "green tea" },
    { id: "gyunyu", w: "{牛乳|ぎゅうにゅう}", m: "milk" },
    { id: "tonyu", w: "{豆乳|とうにゅう}", m: "soy milk" },
    { id: "orenji", w: "オレンジジュース", m: "orange juice", a: "an orange juice" },
    { id: "ringo", w: "りんごジュース", m: "apple juice", a: "an apple juice" },
    { id: "kora", w: "コーラ", m: "cola", a: "a cola" },
    { id: "saida", w: "サイダー", m: "clear soda", a: "a soda" },
    { id: "supotsu", w: "スポーツドリンク", m: "sports drink", a: "a sports drink" },
    { id: "biru", w: "ビール", m: "beer", a: "a beer" },
    { id: "nihonshu", w: "{日本酒|にほんしゅ}", m: "sake", rare: true },
    { id: "shochu", w: "{焼酎|しょうちゅう}", m: "shochu" },
    { id: "umeshu", w: "{梅酒|うめしゅ}", m: "plum wine", rare: true },
    { id: "wain", w: "ワイン", m: "wine", a: "a glass of wine" },
    { id: "haiboru", w: "ハイボール", m: "highball", a: "a highball" },
    { id: "sawa", w: "レモンサワー", m: "lemon sour", a: "a lemon sour" },
    { id: "kakuteru", w: "カクテル", m: "cocktail", a: "a cocktail" },
    { id: "shanpan", w: "シャンパン", m: "champagne", rare: true },
  ] },
  { id: "konbini", jp: "コンビニ", en: "Convenience store", cost: 30, use: ["{w}はありますか", "Do you have {a}?"], toys: [
    { id: "sando", w: "サンドイッチ", m: "sandwich", a: "sandwiches" },
    { id: "karaage", w: "からあげ", m: "fried chicken" },
    { id: "nikuman", w: "{肉|にく}まん", m: "steamed bun", a: "steamed buns" },
    { id: "aisu", w: "アイス", m: "ice cream" },
    { id: "chippusu", w: "ポテトチップス", m: "crisps" },
    { id: "choko", w: "チョコレート", m: "chocolate" },
    { id: "kappumen", w: "カップラーメン", m: "cup noodles" },
    { id: "shinbun", w: "{新聞|しんぶん}", m: "newspaper", a: "a newspaper" },
    { id: "zasshi", w: "{雑誌|ざっし}", m: "magazine", a: "magazines" },
    { id: "denchi", w: "{電池|でんち}", m: "batteries" },
    { id: "haburashi", w: "{歯|は}ブラシ", m: "toothbrush", a: "a toothbrush" },
    { id: "masuku", w: "マスク", m: "face mask", a: "face masks" },
    { id: "waribashi", w: "{割|わ}りばし", m: "disposable chopsticks" },
    { id: "kitte", w: "{切手|きって}", m: "stamp", a: "stamps" },
    { id: "judenki", w: "{充電器|じゅうでんき}", m: "phone charger", a: "a phone charger" },
    { id: "gomibako", w: "ゴミ{箱|ばこ}", m: "rubbish bin", a: "a rubbish bin" },
    { id: "rejibukuro", w: "レジ{袋|ぶくろ}", m: "carrier bag", a: "a bag", use: ["レジ{袋|ぶくろ}をください", "A bag, please."] },
    { id: "renji", w: "{電子|でんし}レンジ", m: "microwave", a: "a microwave", rare: true, use: ["{温|あたた}めてください", "Can you heat it up, please?"] },
    { id: "atm", w: "{ATM|エーティーエム}", m: "cash machine", a: "an ATM", rare: true },
    { id: "kopiki", w: "コピー{機|き}", m: "photocopier", a: "a photocopier", rare: true },
  ] },
  { id: "shigoto", jp: "{仕事|しごと}", en: "Jobs", cost: 30, use: ["{w}です", "I'm {a}."], ask: "dore", toys: [
    { id: "isha", w: "{医者|いしゃ}", m: "doctor", a: "a doctor" },
    { id: "kangoshi", w: "{看護師|かんごし}", m: "nurse", a: "a nurse" },
    { id: "sensei", w: "{先生|せんせい}", m: "teacher", use: ["{教師|きょうし}です", "I'm a teacher. (Of yourself say 教師; 先生 is what others call you.)"] },
    { id: "gakusei", w: "{学生|がくせい}", m: "student", a: "a student" },
    { id: "kaishain", w: "{会社員|かいしゃいん}", m: "office worker", a: "an office worker" },
    { id: "keisatsu", w: "{警察官|けいさつかん}", m: "police officer", a: "a police officer" },
    { id: "shobo", w: "{消防士|しょうぼうし}", m: "firefighter", a: "a firefighter" },
    { id: "shefu", w: "シェフ", m: "chef", a: "a chef" },
    { id: "tenin", w: "{店員|てんいん}", m: "shop assistant", a: "a shop assistant" },
    { id: "enjinia", w: "エンジニア", m: "engineer", a: "an engineer" },
    { id: "kashu", w: "{歌手|かしゅ}", m: "singer", a: "a singer", rare: true },
    { id: "untenshu", w: "{運転手|うんてんしゅ}", m: "driver", a: "a driver" },
    { id: "pairotto", w: "パイロット", m: "pilot", a: "a pilot", rare: true },
    { id: "noka", w: "{農家|のうか}", m: "farmer", a: "a farmer" },
    { id: "daiku", w: "{大工|だいく}", m: "carpenter", a: "a carpenter" },
    { id: "biyoshi", w: "{美容師|びようし}", m: "hairdresser", a: "a hairdresser" },
    { id: "haisha", w: "{歯医者|はいしゃ}", m: "dentist", a: "a dentist" },
    { id: "bengoshi", w: "{弁護士|べんごし}", m: "lawyer", a: "a lawyer" },
    { id: "gaka", w: "{画家|がか}", m: "painter", a: "a painter" },
    { id: "uchu", w: "{宇宙飛行士|うちゅうひこうし}", m: "astronaut", a: "an astronaut", rare: true },
  ] },
];

const TOY_BY = {};
TOY_SETS.forEach((S, si) => S.toys.forEach(t => { TOY_BY[t.id] = { ...t, set: S.id, si }; }));

/* A toy's word in a line you'd say — [Japanese in furigana markup, English]:
   its own `use`, or its set's, with {w} the word, {m} its English, {a} the
   English as the line needs it (t.a, else m) and {A} that capitalised. */
function toyUse(t) {
  const S = TOY_SETS.find(x => x.toys.some(y => y.id === t.id));
  const u = t.use || S?.use;
  if (!u) return null;
  const a = t.a || t.m;
  return [u[0].replace("{w}", t.w), u[1].replace("{m}", t.m).replace("{a}", a).replace("{A}", a[0].toUpperCase() + a.slice(1))];
}

/* A turn costs SPIN_COST, or the set's own `cost` — 20 for the first two
   sets, 25 for the third, 30 from the fourth, so later sets take longer
   to fill without making the early ones a grind; a toy you already have
   gives DUP_BACK back. The first turn is free, so the machine shows what
   it does before it asks. */
const SPIN_COST = 20;
const spinCost = S => S.cost || SPIN_COST;
const DUP_BACK = 5;

/* Which toy a capsule holds. A toy you haven't got is four times as likely
   as one you have, a rare one a fifth as likely as the rest (RARE_WEIGHT;
   it was a half until 0.64.0): about one turn in thirty is gold at the
   start of a set, the first rare comes after about sixteen turns. And
   never more than PITY repeats in a row: after that, a new one — so even
   the rares can't hold a set up for long. A set takes about 37 turns,
   nine in ten done by 44, never more than about 60 (by simulation, 20,000
   sets). */
const PITY = 6;
const RARE_WEIGHT = 0.2;
function gachaPick(set, owned, dryRun = 0, rnd = Math.random) {
  const fresh = set.toys.filter(t => !owned[t.id]);
  const pool = dryRun >= PITY && fresh.length ? fresh : set.toys;
  const w = pool.map(t => (t.rare ? RARE_WEIGHT : 1) * (owned[t.id] ? 1 : 4));
  let r = rnd() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) if ((r -= w[i]) < 0) return pool[i];
  return pool[pool.length - 1];
}

/* The set you're on: the first not yet full. Past the last, the last. */
const setDone = (S, owned) => S.toys.every(t => owned[t.id]);
const currentSet = owned => TOY_SETS.find(S => !setDone(S, owned)) || TOY_SETS[TOY_SETS.length - 1];
