/* Vocabulary — the core. w=written form in furigana markup, m=meaning,
   pos=part of speech (drives js/conj.js), st=stage, ex=[[japanese, english]].
   The kana spelling is derived from w, never stored. */
const WORDS = [
{w:"ありがとう", m:"thank you", pos:"exp", st:2},
{w:"コーヒー", m:"coffee", pos:"n", st:1, from:"coffee"},
{w:"{食|た}べる", m:"to eat", pos:"v1", st:5, ex:[["パンを{食|た}べます。", "I eat bread."]]},
];
