/* Nihongo Quest — Read a Menu.

   Two menus. The café is all katakana, and opens with katakana: its items
   ink themselves in, one kana at a time, as you learn them — you can read
   half of it on the first day of katakana. The diner is the real thing,
   kanji dish names with furigana, and opens once the food words (stage 5)
   are yours.

   items: [markup, price in yen, meaning]. Every item must spell only with
   taught kana (smoke.mjs checks), and its markup must be sound. */

const MENUS = [
  {
    tier: 1, id: "cafe", name: "カフェ さくら", en: "Café Sakura",
    sections: [
      { jp: "ドリンク", en: "Drinks", items: [
        ["コーヒー", 400, "coffee"], ["アイスコーヒー", 450, "iced coffee"], ["カフェラテ", 500, "café latte"],
        ["レモンティー", 450, "lemon tea"], ["ミルクティー", 450, "milk tea"], ["オレンジジュース", 400, "orange juice"],
        ["ココア", 450, "hot chocolate"], ["ソーダ", 350, "soda"], ["ビール", 600, "beer"], ["ワイン", 700, "wine"],
      ] },
      { jp: "フード", en: "Food", items: [
        ["サンドイッチ", 650, "sandwich"], ["トースト", 350, "toast"], ["ピザトースト", 550, "pizza toast"],
        ["カレーライス", 800, "curry and rice"], ["オムライス", 850, "omelette rice"], ["ハンバーグ", 950, "hamburg steak"],
        ["スパゲッティ", 900, "spaghetti"], ["サラダ", 500, "salad"], ["スープ", 400, "soup"], ["フライドポテト", 450, "french fries"],
      ] },
      { jp: "デザート", en: "Desserts", items: [
        ["ケーキ", 450, "cake"], ["チーズケーキ", 500, "cheesecake"], ["チョコレートケーキ", 500, "chocolate cake"],
        ["アイスクリーム", 400, "ice cream"], ["パンケーキ", 700, "pancakes"], ["プリン", 350, "custard pudding"],
      ] },
    ],
  },
  {
    tier: 2, id: "diner", name: "{食堂|しょくどう} まるや", en: "Maruya diner",
    sections: [
      { jp: "{定食|ていしょく}", en: "Set meals — with rice and miso soup", items: [
        ["{焼|や}き{魚|ざかな}{定食|ていしょく}", 980, "grilled fish set"], ["{唐揚|からあ}げ{定食|ていしょく}", 950, "fried chicken set"],
        ["{天|てん}ぷら{定食|ていしょく}", 1100, "tempura set"], ["{生姜焼|しょうがや}き{定食|ていしょく}", 980, "ginger pork set"],
      ] },
      { jp: "{丼|どんぶり}・{麺|めん}", en: "Bowls and noodles", items: [
        ["{牛丼|ぎゅうどん}", 600, "beef bowl"], ["{親子丼|おやこどん}", 750, "chicken and egg bowl"], ["{天丼|てんどん}", 850, "tempura bowl"],
        ["ラーメン", 800, "ramen"], ["うどん", 600, "udon noodles"], ["そば", 650, "soba noodles"], ["カレーうどん", 750, "curry udon"],
      ] },
      { jp: "サイド", en: "Sides", items: [
        ["{味噌汁|みそしる}", 150, "miso soup"], ["ご{飯|はん}", 200, "rice"],
      ] },
      { jp: "{飲|の}み{物|もの}", en: "Drinks", items: [
        ["{生|なま}ビール", 550, "draft beer"], ["ウーロン{茶|ちゃ}", 300, "oolong tea"], ["ラムネ", 250, "ramune soda"],
      ] },
    ],
  },
];

/* What you say to order — shown under the receipt. */
const MENU_PHRASES = [
  ["すみません", "excuse me — to call someone over"],
  ["〜をください", "~, please"],
  ["お{会計|かいけい}をおねがいします", "the bill, please"],
];

MENUS.forEach(M => M.sections.forEach(S => {
  S.items = S.items.map(([w, price, m]) => {
    const kana = furiKana(w);
    return { w, price, m, kana, units: kanaUnits(kana), plain: furiPlain(w), menu: M.id };
  });
}));
const menuItems = M => M.sections.flatMap(S => S.items);

/* Numbers as they're said, for the receipt: 1250 → せんにひゃくごじゅう.
   The sound changes are the ones a price actually meets. */
function numberKana(n) {
  if (n === 0) return "ぜろ";
  const D = ["", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"];
  const under = n => {
    let out = "";
    const th = Math.floor(n / 1000) % 10, hu = Math.floor(n / 100) % 10, te = Math.floor(n / 10) % 10, on = n % 10;
    if (th) out += { 1: "せん", 3: "さんぜん", 8: "はっせん" }[th] || D[th] + "せん";
    if (hu) out += { 1: "ひゃく", 3: "さんびゃく", 6: "ろっぴゃく", 8: "はっぴゃく" }[hu] || D[hu] + "ひゃく";
    if (te) out += te === 1 ? "じゅう" : D[te] + "じゅう";
    if (on) out += D[on];
    return out;
  };
  const man = Math.floor(n / 10000), rest = n % 10000;
  return (man ? under(man) + "まん" : "") + under(rest);
}
