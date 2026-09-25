/* Nihongo Quest — conjugation, generated, never stored.

   Typing 1,500 verb forms into the data by hand is how data drifts, so the
   forms are worked out from the dictionary form and the verb's class:

     v1        ichidan: 食べる → 食べます (drop る)
     v5<end>   godan, by its last kana: v5u v5k v5g v5s v5t v5n v5b v5m v5r
     v5k-s     行く: godan く, but its て-form is 行って, not 行いて
     vs        する, and noun + する
     vk        来る — its kanji's reading changes: 来る, 来ます (き), 来ない (こ)

   Each form comes back as furigana markup, so it renders like any word and
   its kana (for typing and audio) comes from furiKana(). Pinned by fixtures
   in tools/smoke.mjs that cover every godan ending and every exception. */

const CONJ_FORMS = {
  masu:         { jp: "〜ます",       en: "polite",               ex: "食べます" },
  masen:        { jp: "〜ません",     en: "polite, not",          ex: "食べません" },
  mashita:      { jp: "〜ました",     en: "polite, past",         ex: "食べました" },
  masendeshita: { jp: "〜ませんでした", en: "polite, past, not",   ex: "食べませんでした" },
  te:           { jp: "〜て",         en: "て-form",              ex: "食べて" },
  ta:           { jp: "〜た",         en: "plain past",           ex: "食べた" },
  nai:          { jp: "〜ない",       en: "plain, not",           ex: "食べない" },
};
/* The forms taught so far: polite ones, which is what a visitor says. */
const CONJ_TAUGHT = ["masu", "masen", "mashita", "masendeshita"];

const GODAN_I = { う: "い", く: "き", ぐ: "ぎ", す: "し", つ: "ち", ぬ: "に", ぶ: "び", む: "み", る: "り" };
const GODAN_A = { う: "わ", く: "か", ぐ: "が", す: "さ", つ: "た", ぬ: "な", ぶ: "ば", む: "ま", る: "ら" };
const GODAN_TE = { う: "って", つ: "って", る: "って", む: "んで", ぶ: "んで", ぬ: "んで", く: "いて", ぐ: "いで", す: "して" };

const isVerb = pos => /^(v1|v5|vs|vk)/.test(pos || "");

/* Split markup into what stays and the last kana, which conjugation
   changes. Regular verbs always end in kana outside the braces. */
function splitTail(markup) {
  const last = markup.slice(-1);
  return [markup.slice(0, -1), last];
}

/* The masu-stem and the other stems, as markup. */
function stems(markup, pos) {
  if (pos === "vs") {
    const head = markup.replace(/する$/, "");
    return { i: head + "し", a: head + "し", te: head + "して", ta: head + "した" };
  }
  if (pos === "vk") {
    return { i: "{来|き}", a: "{来|こ}", te: "{来|き}て", ta: "{来|き}た" };
  }
  const [head, last] = splitTail(markup);
  if (pos === "v1") return { i: head, a: head, te: head + "て", ta: head + "た" };
  if (!pos.startsWith("v5")) throw new Error(`not a verb class: ${pos}`);
  if (!GODAN_I[last]) throw new Error(`${markup} doesn't end in a godan ending`);
  const te = pos === "v5k-s" ? "って" : GODAN_TE[last];
  return { i: head + GODAN_I[last], a: head + GODAN_A[last], te: head + te, ta: head + te.replace(/て$/, "た").replace(/で$/, "だ") };
}

/* One form of a verb, as markup: conj("{飲|の}む", "v5m", "masu") → "{飲|の}みます". */
function conj(markup, pos, form) {
  const s = stems(markup, pos);
  switch (form) {
    case "masu": return s.i + "ます";
    case "masen": return s.i + "ません";
    case "mashita": return s.i + "ました";
    case "masendeshita": return s.i + "ませんでした";
    case "te": return s.te;
    case "ta": return s.ta;
    case "nai": return s.a + "ない";
    default: throw new Error(`unknown form ${form}`);
  }
}
