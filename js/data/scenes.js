/* Nihongo Quest — out and about: the Japanese you meet off the page.

   Station signs and announcements, shop and road signs, a receipt, what
   shop staff say, how to ask for things and for the way, casual Japanese,
   and compliments. Recognition is the point — being able to read the sign
   and catch the announcement — so each scene is something to look at and
   listen to, with a quiz at the end.

   Each scene:
     id, jp, en, look   how its items are drawn: "sign" (a plate on a wall),
                        "road", "voice" (heard — an announcement, a clerk),
                        "chat" (a conversation: who says it), "receipt"
     style              the sign plate's look, for sign scenes
     intro              one line on what you're looking at
     items              [markup, meaning, who?] — who is "you" or "them" in a chat
     quiz               extra questions: [ask, answer, wrong, wrong, wrong]

   Every string is furigana markup; readings show until their kanji are
   learned, the same as everywhere else. Everything is recorded
   (audio-scenes.js). */

const SCENES = [
  { id: "station", jp: "駅", en: "At the station", look: "sign", style: "station",
    intro: "The signs you'll follow and the announcements you'll hear on every train trip.",
    items: [
      ["{出口|でぐち}", "Exit"], ["{入口|いりぐち}", "Entrance"], ["{改札|かいさつ}", "Ticket gates"],
      ["{乗|の}り{換|か}え", "Transfer (change trains)"], ["{切符売|きっぷう}り{場|ば}", "Ticket machines"],
      ["{東口|ひがしぐち}", "East exit"], ["{西口|にしぐち}", "West exit"], ["{北口|きたぐち}", "North exit"], ["{南口|みなみぐち}", "South exit"],
      ["{三番線|さんばんせん}", "Platform 3"], ["{各駅停車|かくえきていしゃ}", "Local — stops at every station"],
      ["{快速|かいそく}", "Rapid"], ["{急行|きゅうこう}", "Express"], ["{女性専用車|じょせいせんようしゃ}", "Women-only carriage"],
    ],
    voice: [
      ["まもなく、{三番線|さんばんせん}に{電車|でんしゃ}が{参|まい}ります。", "A train will soon arrive at platform 3."],
      ["{黄色|きいろ}い{線|せん}の{内側|うちがわ}までお{下|さ}がりください。", "Please stand behind the yellow line."],
      ["{次|つぎ}は、{新宿|しんじゅく}です。", "The next stop is Shinjuku."],
      ["ドアが{閉|し}まります。ご{注意|ちゅうい}ください。", "The doors are closing. Please be careful."],
      ["お{忘|わす}れ{物|もの}のないよう、ご{注意|ちゅうい}ください。", "Please make sure you have all your belongings."],
      ["{終点|しゅうてん}です。", "This is the last stop."],
    ] },

  { id: "signs", jp: "看板", en: "Shop and door signs", look: "sign", style: "shop",
    intro: "Is it open? Push or pull? Where's the toilet? What's half price?",
    items: [
      ["{営業中|えいぎょうちゅう}", "Open"], ["{準備中|じゅんびちゅう}", "Closed — getting ready"], ["{本日休業|ほんじつきゅうぎょう}", "Closed today"],
      ["{定休日|ていきゅうび}", "Regular day off"], ["{営業時間|えいぎょうじかん}", "Opening hours"],
      ["{押|お}す", "Push"], ["{引|ひ}く", "Pull"], ["{自動|じどう}ドア", "Automatic door"],
      ["お{手洗|てあら}い", "Toilets"], ["{男|おとこ}", "Men"], ["{女|おんな}", "Women"],
      ["{禁煙|きんえん}", "No smoking"], ["{喫煙所|きつえんじょ}", "Smoking area"], ["{非常口|ひじょうぐち}", "Emergency exit"],
      ["{立入禁止|たちいりきんし}", "No entry"], ["{撮影禁止|さつえいきんし}", "No photos"],
      ["{割引|わりびき}", "Discount"], ["{半額|はんがく}", "Half price"], ["{売|う}り{切|き}れ", "Sold out"], ["{無料|むりょう}", "Free"],
      ["お{会計|かいけい}", "Pay here"],
    ] },

  { id: "road", jp: "道路", en: "Road signs", look: "road",
    intro: "Walking or cycling, these are the ones worth knowing.",
    items: [
      ["{止|と}まれ", "Stop"], ["{徐行|じょこう}", "Slow down"], ["{一方通行|いっぽうつうこう}", "One way"],
      ["{通行止|つうこうど}め", "Road closed"], ["{駐車禁止|ちゅうしゃきんし}", "No parking"], ["{横断歩道|おうだんほどう}", "Pedestrian crossing"],
      ["{工事中|こうじちゅう}", "Roadworks"], ["{歩行者|ほこうしゃ}", "Pedestrians"], ["{自転車|じてんしゃ}", "Bicycles"],
      ["{危険|きけん}", "Danger"], ["{注意|ちゅうい}", "Caution"],
    ] },

  { id: "receipt", jp: "レシート", en: "Reading a receipt", look: "receipt",
    intro: "A convenience-store receipt. Tap any line to see what it says.",
    store: "コンビニ さくら",
    lines: [["おにぎり", 150], ["お{茶|ちゃ}", 130], ["サンドイッチ", 380]],
    items: [
      ["{小計|しょうけい}", "Subtotal"], ["{消費税|しょうひぜい}", "Consumption tax"], ["{合計|ごうけい}", "Total"],
      ["{税込|ぜいこ}み", "Tax included"], ["お{預|あず}かり", "What you handed over"], ["お{釣|つ}り", "Your change"],
      ["{現金|げんきん}", "Cash"], ["クレジット", "Credit card"], ["{点数|てんすう}", "Number of items"],
      ["{領収書|りょうしゅうしょ}", "A formal receipt (for expenses)"],
    ],
    quiz: [
      ["On this receipt, how much change did you get?", "¥288", "¥712", "¥660", "¥1,000"],
      ["What was the total, tax included?", "¥712", "¥660", "¥52", "¥1,000"],
      ["How much tax was added?", "¥52", "¥288", "¥130", "¥66"],
    ] },

  { id: "shop", jp: "お店", en: "What shop staff say", look: "voice",
    intro: "You'll hear these in every shop and restaurant. You don't need to say them — just to catch them.",
    items: [
      ["いらっしゃいませ", "Welcome! (as you walk in)"], ["{何名様|なんめいさま}ですか。", "How many people?"],
      ["こちらへどうぞ。", "This way, please."], ["お{決|き}まりですか。", "Are you ready to order?"],
      ["{少々|しょうしょう}お{待|ま}ちください。", "Just a moment, please."], ["{以上|いじょう}でよろしいですか。", "Will that be everything?"],
      ["ポイントカードはお{持|も}ちですか。", "Do you have a points card?"], ["{袋|ふくろ}はご{利用|りよう}ですか。", "Would you like a bag?"],
      ["{温|あたた}めますか。", "Shall I heat it up?"], ["お{箸|はし}はお{付|つ}けしますか。", "Would you like chopsticks?"],
      ["ありがとうございました。", "Thank you very much!"], ["またお{越|こ}しくださいませ。", "Please come again."],
    ] },

  { id: "asking", jp: "頼む", en: "Asking for things", look: "chat",
    intro: "The handful of shapes that get you nearly anything, politely.",
    items: [
      ["すみません、お{水|みず}をください。", "Excuse me — some water, please.", "you"],
      ["メニューをお{願|ねが}いします。", "The menu, please.", "you"],
      ["{英語|えいご}のメニューはありますか。", "Do you have an English menu?", "you"],
      ["{袋|ふくろ}をもらえますか。", "Could I have a bag?", "you"],
      ["これはいくらですか。", "How much is this?", "you"],
      ["カードで{払|はら}えますか。", "Can I pay by card?", "you"],
      ["{袋|ふくろ}はご{利用|りよう}ですか。", "Would you like a bag?", "them"],
      ["{大丈夫|だいじょうぶ}です。", "I'm fine, thanks. (no need)", "you"],
      ["これをください。", "I'll have this, please.", "you"],
      ["{写真|しゃしん}を{撮|と}ってもらえますか。", "Could you take a photo of us?", "you"],
    ] },

  { id: "directions", jp: "道を聞く", en: "Asking the way", look: "chat",
    intro: "What to ask — and what you'll hear back.",
    items: [
      ["すみません、{駅|えき}はどこですか。", "Excuse me, where's the station?", "you"],
      ["{浅草|あさくさ}に{行|い}きたいんですが…", "I'd like to get to Asakusa…", "you"],
      ["ここから{遠|とお}いですか。", "Is it far from here?", "you"],
      ["{歩|ある}いて{何分|なんぷん}ですか。", "How many minutes on foot?", "you"],
      ["この{近|ちか}くにコンビニはありますか。", "Is there a convenience store near here?", "you"],
      ["まっすぐ{行|い}ってください。", "Go straight on.", "them"],
      ["{右|みぎ}に{曲|ま}がってください。", "Turn right.", "them"],
      ["{左|ひだり}に{曲|ま}がってください。", "Turn left.", "them"],
      ["{信号|しんごう}を{渡|わた}ってください。", "Cross at the traffic lights.", "them"],
      ["{二|ふた}つ{目|め}の{角|かど}です。", "It's at the second corner.", "them"],
      ["{駅|えき}の{向|む}かいです。", "It's across from the station.", "them"],
      ["{歩|ある}いて{五分|ごふん}ぐらいです。", "About five minutes on foot.", "them"],
    ] },

  { id: "casual", jp: "口語", en: "Everyday casual Japanese", look: "chat",
    intro: "What friends actually say to each other — you'll hear these constantly.",
    items: [
      ["うん", "Yeah.", "them"], ["ううん", "Nah. / No.", "them"], ["そうそう！", "Yes, exactly!", "them"],
      ["なるほど。", "I see. / That makes sense.", "you"], ["マジで？", "Seriously?", "them"], ["すごい！", "Wow! / Amazing!", "you"],
      ["やばい！", "Whoa! (amazing — or terrible)", "them"], ["よかった！", "Phew! / I'm so glad.", "you"],
      ["お{疲|つか}れ{様|さま}です。", "Thanks for your hard work. (a greeting)", "them"],
      ["ちょっと…", "Hmm, that's a bit… (a polite no)", "you"], ["まあまあ。", "So-so.", "you"],
      ["じゃあね！", "See you!", "them"], ["またね！", "See you later!", "you"],
    ] },

  { id: "compliments", jp: "ほめる", en: "Compliments", look: "chat",
    intro: "Japanese people are generous with these — and the polite reply is to wave them away.",
    items: [
      ["{日本語|にほんご}が{上手|じょうず}ですね！", "Your Japanese is so good!", "them"],
      ["いえいえ、まだまだです。", "Oh no — I've a long way to go.", "you"],
      ["かわいい！", "Cute!", "you"], ["かっこいい！", "Cool!", "you"],
      ["きれいですね。", "It's beautiful.", "you"], ["おいしそう！", "That looks delicious!", "you"],
      ["すてきですね。", "That's lovely.", "you"], ["さすが！", "Just what I'd expect from you!", "them"],
      ["{似合|にあ}いますね。", "It suits you.", "them"],
      ["ありがとうございます。うれしいです。", "Thank you — that makes me happy.", "you"],
    ] },
];

/* ---- derived ---- */
SCENES.forEach(sc => {
  const all = [...sc.items, ...(sc.voice || [])];
  sc.all = all.map(([w, m, who], i) => ({ w, m, who: who || null, i, kana: furiKana(w) }));
  sc.key = "scene:" + sc.id;
});
const SCENE_BY = {};
SCENES.forEach(sc => { SCENE_BY[sc.id] = sc; });

/* The receipt's sums, worked out rather than typed. */
function receiptSums(sc) {
  const sub = sc.lines.reduce((t, [, p]) => t + p, 0);
  const tax = Math.floor(sub * 0.08);
  const total = sub + tax;
  return { sub, tax, total, paid: 1000, change: 1000 - total, count: sc.lines.length };
}
