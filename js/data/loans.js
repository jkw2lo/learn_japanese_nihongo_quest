/* Nihongo Quest — 外来語, loanwords: English in katakana (Read → 外来語).

   A great deal of katakana is English that came over and changed to fit
   Japanese sounds — by a handful of regular rules. Learn the rules and you
   can sound out words you were never taught: テレビ, コンビニ, パスワード.
   These aren't scheduled like the stage words; they're worked out.

   LOAN_RULES  the rules, each with a few examples (katakana, English)
   LOAN_WORDS  "カタカナ|english|rule rule" — the rules it shows — under
               "# Group" lines (food, home, … and Made in Japan: the ones
               that look like English and aren't). All in katakana the app
               teaches; every English answer different. */

const LOAN_RULES = [
  { id: "vowel", jp: "母音", title: "A vowel on the end",
    say: "Japanese syllables end in a vowel (or ん), so an English word ending in a consonant gets one: usually う, but お after t and d, and い after ch and j.",
    ex: [["バス", "bus"], ["テスト", "test"], ["ベッド", "bed"], ["オレンジ", "orange"]] },
  { id: "long", jp: "ー", title: "Long sounds become ー",
    say: "An English ending like -er, -ar or -or, and any long vowel, becomes the long bar ー. コーヒー is coffee; カー is car.",
    ex: [["コンピューター", "computer"], ["カー", "car"], ["ドア", "door"], ["ケーキ", "cake"]] },
  { id: "lr", jp: "ラ行", title: "L and R are the same",
    say: "Japanese has one sound where English has two: L and R both come out as ら り る れ ろ. So ホテル is hotel, and ラジオ radio.",
    ex: [["ラジオ", "radio"], ["レモン", "lemon"], ["ホテル", "hotel"], ["ルール", "rule"]] },
  { id: "v", jp: "バ行", title: "V becomes B",
    say: "There's no V sound in Japanese, so V comes out as ば び ぶ べ ぼ (sometimes written ヴ). ビデオ is video — and ベスト is both best and vest.",
    ex: [["ビデオ", "video"], ["テレビ", "television"], ["バイオリン", "violin"], ["サービス", "service"]] },
  { id: "th", jp: "サ・ザ", title: "TH becomes S or Z",
    say: "TH isn't a Japanese sound either: it comes out as さ し す せ そ (or ざ…). Thank you is サンキュー; three, スリー.",
    ex: [["サンキュー", "thank you"], ["スリー", "three"], ["スムージー", "smoothie"]] },
  { id: "small", jp: "小さい字", title: "Small kana for new sounds",
    say: "For sounds Japanese didn't have, a small vowel joins the kana before it: ティ tea, ディ, ファ fa, フォ fo, ウィ wi, シェ she, チェ che, ジェ je.",
    ex: [["パーティー", "party"], ["ファン", "fan"], ["フォーク", "fork"], ["チェック", "check"]] },
  { id: "double", jp: "ッ", title: "A short vowel doubles the next sound",
    say: "After a short, stressed vowel, a hard consonant (k, t, p, g, d) is doubled with small ッ: bed is ベッド, cup カップ, ticket チケット.",
    ex: [["カップ", "cup"], ["バッグ", "bag"], ["チケット", "ticket"], ["ポケット", "pocket"]] },
  { id: "tion", jp: "ション", title: "-tion becomes ション",
    say: "-tion and -sion come out as ション: station is ステーション, fashion ファッション.",
    ex: [["ステーション", "station"], ["インフォメーション", "information"], ["ファッション", "fashion"]] },
  { id: "short", jp: "略語", title: "Long words get shortened",
    say: "Long borrowings are cut to their first few sounds — スマホ is smart(phone), エアコン air con(ditioner) — and a few were made in Japan from English parts: マンション is a block of flats, not a mansion.",
    ex: [["スマホ", "smartphone"], ["エアコン", "air conditioner"], ["コンビニ", "convenience store"], ["パソコン", "personal computer"]] },
  { id: "other", jp: "英語じゃない", title: "Not all from English",
    say: "Some came from other languages, centuries ago or recently: パン, bread, from Portuguese; アルバイト, a part-time job, and エネルギー, energy, from German; ランドセル, a school backpack, from Dutch.",
    ex: [["パン", "bread"], ["アルバイト", "part-time job"], ["エネルギー", "energy"], ["ランドセル", "school backpack"]] },
];

const LOAN_WORDS = `
# Food and drink
コーヒー|coffee|long
ジュース|juice|vowel long
ミルク|milk|vowel
ビール|beer|long lr
ワイン|wine|vowel
ウイスキー|whisky|long
コーラ|cola|long lr
ソーダ|soda|long
レモンティー|lemon tea|lr small
レモン|lemon|lr
ケーキ|cake|long
バター|butter|long
チーズ|cheese|long vowel
ハム|ham|vowel
ベーコン|bacon|long
ソーセージ|sausage|long vowel
サラダ|salad|lr
スープ|soup|long vowel
カレー|curry|lr long
ステーキ|steak|long
ハンバーガー|hamburger|long
サンドイッチ|sandwich|double
ピザ|pizza|vowel
パスタ|pasta|vowel
スパゲッティ|spaghetti|small double
トースト|toast|long vowel
ドーナツ|doughnut|long
クッキー|cookie|double long
チョコレート|chocolate|lr long
アイスクリーム|ice cream|lr long
キャンディー|candy|small long
ポテト|potato|vowel
トマト|tomato|vowel
バナナ|banana|vowel
オレンジ|orange|vowel lr
メロン|melon|lr
キャベツ|cabbage|vowel
フルーツ|fruit|lr long
デザート|dessert|long
メニュー|menu|long
レストラン|restaurant|lr vowel
カフェ|café|small
ランチ|lunch|lr vowel
ディナー|dinner|small long
ナイフ|knife|vowel
フォーク|fork|small long
スプーン|spoon|long
カップ|cup|double
グラス|glass|lr vowel
ボトル|bottle|lr
ストロー|straw|long lr
レシピ|recipe|lr
ホットドッグ|hot dog|double
フライドチキン|fried chicken|lr
# Home and everyday things
テレビ|television|v short
ラジオ|radio|lr
エアコン|air conditioner|short
パソコン|personal computer|short
コンピューター|computer|long
スマホ|smartphone|short
カメラ|camera|lr
ベッド|bed|double
テーブル|table|long lr
ソファ|sofa|small
カーテン|curtain|long
ドア|door|long
キッチン|kitchen|double
トイレ|toilet|short
シャワー|shower|long
タオル|towel|lr
シャンプー|shampoo|long
ティッシュ|tissue|small double
ペン|pen|vowel
ボールペン|ballpoint pen|long lr short
キーボード|keyboard|long
マウス|mouse|vowel
メール|email|long lr
インターネット|internet|long double
パスワード|password|long
ゲーム|game|long
リモコン|remote control|short lr
エレベーター|elevator|lr v long
エスカレーター|escalator|lr long
ライト|light|lr vowel
ランプ|lamp|lr vowel
カレンダー|calendar|lr long
ポスター|poster|long
プレゼント|present|lr vowel
カード|card|long vowel
ポイントカード|points card|vowel long
レシート|receipt|lr long
# Clothes and things
バッグ|bag|double
ポケット|pocket|double
ハンカチ|handkerchief|short
ネクタイ|necktie|vowel
シャツ|shirt|vowel
スカート|skirt|long vowel
コート|coat|long vowel
セーター|sweater|long
ジャケット|jacket|double
ジーンズ|jeans|long
スニーカー|sneakers|long
サンダル|sandals|lr
ブーツ|boots|long
ドレス|dress|lr vowel
ベルト|belt|lr vowel
マスク|mask|vowel
スーツケース|suitcase|long
# Getting around
バス|bus|vowel
タクシー|taxi|long
カー|car|long
ホテル|hotel|lr
デパート|department store|short long
スーパー|supermarket|short long
コンビニ|convenience store|short v
ビル|building|short lr
アパート|apartment|long
ステーション|station|tion
ターミナル|terminal|long lr
チケット|ticket|double
パスポート|passport|long
ツアー|tour|long
ガイド|guide|vowel
マップ|map|double
センター|centre|long
ロッカー|locker|lr double long
トンネル|tunnel|lr
タワー|tower|long
ビーチ|beach|long vowel
プール|pool|long lr
# Sport and fun
スポーツ|sport|long vowel
サッカー|soccer|double long
テニス|tennis|vowel
ゴルフ|golf|lr vowel
バスケットボール|basketball|double long lr
ジム|gym|vowel
ジョギング|jogging|vowel
ダンス|dance|vowel
ピアノ|piano|vowel
ギター|guitar|long
バイオリン|violin|v lr
ドラム|drum|lr vowel
コンサート|concert|long
アニメ|anime|short
ドラマ|drama|lr
ニュース|news|long
ビデオ|video|v
# School and work
インタビュー|interview|v long
オフィス|office|small
ミーティング|meeting|long small
パーティー|party|small long
デート|date|long
ホームステイ|homestay|long
テスト|test|vowel
クラス|class|lr vowel
ファイル|file|small lr
コピー|copy|long
レポート|report|lr long
アドレス|address|lr vowel
ページ|page|long vowel
メモ|memo|short
スケジュール|schedule|lr
ルール|rule|lr long
チェック|check|small double
# Everyday words
スタート|start|long
ゴール|goal|long lr
チャンス|chance|vowel
ストレス|stress|lr vowel
ダイエット|diet|double
ボランティア|volunteer|v small
オープン|open|long
セール|sale|long lr
サービス|service|v long
サイズ|size|vowel
# Colours and numbers
カラー|colour|long lr
ピンク|pink|vowel
グレー|grey|lr long
ブルー|blue|lr long
グリーン|green|lr long
ゴールド|gold|long lr
シルバー|silver|lr v long
ナンバー|number|long
ゼロ|zero|lr
# Everyday words
サンキュー|thank you|th long
スリー|three|th lr long
スムージー|smoothie|th long
ファン|fan|small
ファッション|fashion|small tion
ウィンドウ|window|small
ウェブ|web|small vowel
チェア|chair|small
シェア|share|small
メロディー|melody|lr small long
インフォメーション|information|small tion
アクション|action|tion
ミッション|mission|tion
# Made in Japan
マンション|block of flats|short
ガソリンスタンド|petrol station|lr short
ノートパソコン|laptop|short
テレビゲーム|video game|short long
コンセント|power socket|short
サラリーマン|office worker (salaryman)|short lr
ペットボトル|plastic bottle|short double
ホッチキス|stapler|short double
シャーペン|mechanical pencil|short long
フライドポテト|chips (fries)|short lr
モーニングコール|wake-up call|short long
クレーム|complaint|short long lr
マイペース|at your own pace|short long
ベビーカー|pram; pushchair|short v long
サイン|signature; autograph|short
トランプ|playing cards|short lr
ゲームセンター|amusement arcade|short long
ジェットコースター|rollercoaster|short small double
ワンピース|one-piece dress|short long
パン|bread|other
アルバイト|part-time job|other
エネルギー|energy|other long
ランドセル|school backpack|other lr
`.trim().split("\n").reduce((out, l) => {
  if (l.startsWith("# ")) { out.group = l.slice(2); return out; }
  const [k, en, rules] = l.split("|");
  out.push({ k, en, rules: rules.split(" "), group: out.group });
  return out;
}, Object.assign([], { group: "" }));

/* the groups, in order, for the list (Read → 外来語 → All of them) */
const LOAN_GROUPS = [...new Set(LOAN_WORDS.map(x => x.group))];

const LOAN_BY = Object.fromEntries(LOAN_WORDS.map(x => [x.k, x]));
const LOAN_RULE_BY = Object.fromEntries(LOAN_RULES.map(r => [r.id, r]));
