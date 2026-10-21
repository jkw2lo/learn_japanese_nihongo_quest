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
   collected; later sets cost more (spinCost). 
   The drawings are in js/toys-art.js, one per id. */

const TOY_SETS = [
  { id: "lucky", jp: "{縁起物|えんぎもの}", en: "Lucky charms", cost: 20, toys: [
    { id: "maneki", w: "{招|まね}き{猫|ねこ}", m: "beckoning cat", rare: true },
    { id: "daruma", w: "だるま", m: "daruma doll" },
    { id: "kokeshi", w: "こけし", m: "kokeshi doll" },
    { id: "koinobori", w: "こいのぼり", m: "carp streamer" },
    { id: "furin", w: "{風鈴|ふうりん}", m: "wind chime" },
    { id: "chochin", w: "ちょうちん", m: "paper lantern" },
    { id: "sensu", w: "{扇子|せんす}", m: "folding fan" },
    { id: "torii", w: "{鳥居|とりい}", m: "shrine gate" },
    { id: "omamori", w: "お{守|まも}り", m: "good-luck charm" },
    { id: "fuji", w: "{富士山|ふじさん}", m: "Mount Fuji", rare: true },
    { id: "sakura", w: "{桜|さくら}", m: "cherry blossom" },
    { id: "tsuru", w: "{折|お}り{鶴|づる}", m: "paper crane" },
    { id: "geta", w: "{下駄|げた}", m: "wooden sandals" },
    { id: "wagasa", w: "{和傘|わがさ}", m: "paper umbrella" },
    { id: "kendama", w: "けん{玉|だま}", m: "cup-and-ball toy" },
    { id: "tanuki", w: "たぬき", m: "raccoon dog" },
    { id: "kitsune", w: "きつねのお{面|めん}", m: "fox mask" },
    { id: "kingyo", w: "{金魚|きんぎょ}", m: "goldfish", rare: true },
    { id: "uchiwa", w: "うちわ", m: "round fan" },
    { id: "taiko", w: "{太鼓|たいこ}", m: "drum" },
  ] },
  { id: "food", jp: "{食|た}べ{物|もの}", en: "Food", cost: 20, toys: [
    { id: "onigiri", w: "おにぎり", m: "rice ball" },
    { id: "sushi", w: "すし", m: "sushi" },
    { id: "ramen", w: "ラーメン", m: "ramen", rare: true },
    { id: "dango", w: "だんご", m: "dumplings on a stick" },
    { id: "taiyaki", w: "たいやき", m: "fish-shaped cake", rare: true },
    { id: "tempura", w: "{天|てん}ぷら", m: "tempura" },
    { id: "bento", w: "お{弁当|べんとう}", m: "boxed lunch" },
    { id: "misoshiru", w: "みそしる", m: "miso soup" },
    { id: "takoyaki", w: "たこやき", m: "octopus balls" },
    { id: "gyoza", w: "ぎょうざ", m: "dumplings" },
    { id: "kakigori", w: "かき{氷|ごおり}", m: "shaved ice" },
    { id: "oden", w: "おでん", m: "oden stew" },
    { id: "senbei", w: "せんべい", m: "rice cracker" },
    { id: "mochi", w: "{鏡|かがみ}もち", m: "New Year rice cakes", rare: true },
    { id: "curry", w: "カレー", m: "curry" },
    { id: "matcha", w: "{抹茶|まっちゃ}", m: "matcha tea" },
    { id: "ramune", w: "ラムネ", m: "marble soda" },
    { id: "melonpan", w: "メロンパン", m: "melon bun" },
    { id: "purin", w: "プリン", m: "custard pudding" },
    { id: "yakitori", w: "やきとり", m: "grilled chicken" },
  ] },
  { id: "town", jp: "{町|まち}", en: "Around town", cost: 25, toys: [
    { id: "jihanki", w: "{自販機|じはんき}", m: "vending machine" },
    { id: "posuto", w: "ポスト", m: "postbox" },
    { id: "densha", w: "{電車|でんしゃ}", m: "train" },
    { id: "shinkansen", w: "{新幹線|しんかんせん}", m: "bullet train", rare: true },
    { id: "basu", w: "バス", m: "bus" },
    { id: "takushi", w: "タクシー", m: "taxi" },
    { id: "jitensha", w: "{自転車|じてんしゃ}", m: "bicycle" },
    { id: "shingo", w: "{信号|しんごう}", m: "traffic light" },
    { id: "fumikiri", w: "{踏切|ふみきり}", m: "level crossing" },
    { id: "kon", w: "コーン", m: "traffic cone" },
    { id: "manhoru", w: "マンホール", m: "manhole cover" },
    { id: "denchu", w: "{電柱|でんちゅう}", m: "utility pole" },
    { id: "kippu", w: "{切符|きっぷ}", m: "ticket" },
    { id: "randoseru", w: "ランドセル", m: "school backpack" },
    { id: "denwa", w: "{公衆電話|こうしゅうでんわ}", m: "payphone" },
    { id: "noren", w: "のれん", m: "shop curtain" },
    { id: "robotto", w: "ロボット", m: "robot" },
    { id: "gacha", w: "ガチャガチャ", m: "capsule machine", rare: true },
    { id: "ie", w: "{家|いえ}", m: "house" },
    { id: "tower", w: "{東京|とうきょう}タワー", m: "Tokyo Tower", rare: true },
  ] },
  { id: "home", jp: "{家|いえ}", en: "At home", cost: 30, toys: [
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
    { id: "hashi", w: "お{箸|はし}", m: "chopsticks" },
    { id: "chawan", w: "{茶碗|ちゃわん}", m: "rice bowl" },
    { id: "yakan", w: "やかん", m: "kettle" },
    { id: "ofuro", w: "お{風呂|ふろ}", m: "bath", rare: true },
    { id: "hon", w: "{本|ほん}", m: "book" },
    { id: "mado", w: "{窓|まど}", m: "window" },
    { id: "neko", w: "{猫|ねこ}", m: "cat", rare: true },
  ] },
];

const TOY_BY = {};
TOY_SETS.forEach((S, si) => S.toys.forEach(t => { TOY_BY[t.id] = { ...t, set: S.id, si }; }));

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
