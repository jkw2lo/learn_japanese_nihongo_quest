/* Nihongo Quest — furigana markup.

   Every Japanese string containing kanji marks each kanji run with its
   reading, aligned when the data is written:

       {食|た}べ{物|もの}
       {今日|きょう}は{天気|てんき}がいいですね。

   A reading can't be split back across its kanji reliably after the fact —
   where does たべもの divide between 食, べ and 物? — so it's never worked
   out, only written down. See README → Data → Furigana markup.

   Pure functions, no DOM: tools/smoke.mjs checks every string in the data
   with furiProblems(), and the app renders with furiHtml(). */

const KANJI_RE = /[㐀-䶿一-鿿豈-﫿々〆ヶ]/;
const KANA_RE = /^[ぁ-ゖァ-ヺー]+$/;

/* Split markup into segments: { t: "text" } or { k: "kanji", r: "reading" }. */
function furiParse(s) {
  const out = [];
  let i = 0;
  while (i < s.length) {
    const open = s.indexOf("{", i);
    if (open < 0) { out.push({ t: s.slice(i) }); break; }
    if (open > i) out.push({ t: s.slice(i, open) });
    const close = s.indexOf("}", open);
    const bar = s.indexOf("|", open);
    if (close < 0 || bar < 0 || bar > close) throw new Error(`unbalanced furigana in "${s}"`);
    out.push({ k: s.slice(open + 1, bar), r: s.slice(bar + 1, close) });
    i = close + 1;
  }
  return out;
}

/* The kana spelling: what audio is recorded from and what typing checks. */
const furiKana = s => furiParse(s).map(x => x.t ?? x.r).join("");

/* The ordinary written form, with no readings. */
const furiPlain = s => furiParse(s).map(x => x.t ?? x.k).join("");

/* Every kanji the string uses. */
const furiKanji = s => [...new Set([...furiPlain(s)].filter(c => KANJI_RE.test(c)))];

/* Everything wrong with one string, as sentences a person can act on. */
function furiProblems(s) {
  let segs;
  try { segs = furiParse(s); } catch (e) { return [e.message]; }
  const out = [];
  segs.forEach(x => {
    if (x.t !== undefined) {
      if (/[{}|]/.test(x.t)) out.push(`stray brace or bar in "${s}"`);
      const loose = [...x.t].filter(c => KANJI_RE.test(c));
      if (loose.length) out.push(`${loose.join("")} has no reading in "${s}"`);
    } else {
      if (!x.k) out.push(`an empty kanji run in "${s}"`);
      else if (![...x.k].every(c => KANJI_RE.test(c))) out.push(`{${x.k}|…} holds more than kanji in "${s}" — okurigana goes outside the braces`);
      if (!x.r) out.push(`{${x.k}|} has no reading in "${s}"`);
      else if (!KANA_RE.test(x.r)) out.push(`{${x.k}|${x.r}}: the reading isn't all kana in "${s}"`);
    }
  });
  return out;
}

/* HTML for a string. `knows(kanji)` says whether the learner knows a kanji;
   a run is shown bare only if every kanji in it is known — 今日 needs both.
   mode: "auto" (furigana on what you don't know), "always", "never". */
function furiHtml(s, knows = () => false, mode = "auto") {
  const e = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  return furiParse(s).map(x => {
    if (x.t !== undefined) return e(x.t);
    const bare = mode === "never" || (mode === "auto" && [...x.k].every(knows));
    return bare ? e(x.k) : `<ruby>${e(x.k)}<rt>${e(x.r)}</rt></ruby>`;
  }).join("");
}
