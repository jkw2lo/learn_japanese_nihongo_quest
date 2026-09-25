/* Nihongo Quest — scheduling, skills, days, the hiragana check, storage.

   No DOM in here: tools/smoke.mjs loads this file with the data and nothing
   else, and exercises it directly. */

const STORE_KEY = "nihongo-quest";
const INTERVALS = [0, 1, 2, 4, 7, 14, 30, 60, 120];   /* days, by level */
const PASSES_FOR_SOLID = 3;
/* A pass only counts towards "solid" if it was quick. Reading kana slowly is
   still slow reading — see README → Kana. */
const QUICK_MS = { r: 3000, p: 4000, a: 4000, w: 5000 };
/* Words are longer than a kana, and typing one takes a while. */
const QUICK_WORD_MS = { r: 5000, p: 5000, c: 12000, j: 15000 };
/* A pattern question is a whole sentence to read. */
const QUICK_PATTERN_MS = { f: 8000, r: 9000 };
/* The consolidation gate between hiragana and katakana: this many separate
   days, each after the last hiragana was learned, on which a full hiragana
   sweep was finished at this first-try accuracy. */
const HIRA_CHECK = { days: 2, pass: 0.9 };
const TIER_ORDER = ["h", "k"];

const DEFAULT_SETTINGS = {
  showRomaji: false,     /* outside kana lessons — see README → Open questions */
  sound: true,
  autoplay: true,
  timer: true,
  newPerDay: 5,          /* new kana a day — about one row */
  writing: true,         /* writing drills as reinforcement */
  strokeOrder: false,    /* also check stroke order and direction */
  furigana: "auto",      /* over kanji you don't know | always | never */
  theme: "auto",
};

/* ---------- dates, in local time ---------- */

const pad2 = n => String(n).padStart(2, "0");
const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
/* A test hook: smoke.mjs moves the clock without touching Date. */
let clockShift = 0;
const today = () => { const d = new Date(); d.setDate(d.getDate() + clockShift); return dayKey(d); };
function addDays(key, n) {
  const [y, m, d] = key.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}
const daysBetween = (a, b) => Math.round((new Date(b + "T12:00") - new Date(a + "T12:00")) / 864e5);

/* Lists come back from JSON — and from any future merge — as lists. Hanzi
   Quest once merged a list as if it were a map and returned {"0":"菜"},
   which took most of the app down on sign-in (its porting.md, B1). Everything
   that reads a list reads it through this. */
const asList = v => Array.isArray(v) ? v : (v && typeof v === "object" ? Object.values(v) : []);

/* ---------- state ---------- */

const freshState = () => ({
  app: "nihongo-quest", v: 1,
  created: today(),
  items: {},          /* glyph -> { at, lvl, due, sk: { r: {n, ok, fast, miss}, p: … } } */
  words: {},          /* "w:食べる" -> the same shape. Kept apart so everything
                         that walks the kana never trips over a word. */
  patterns: {},       /* "g:wa-desu" -> the same shape, for grammar patterns */
  days: {},           /* date  -> { n, ok: {r:[],p:[],a:[],x:[]}, learned:[], rev:[], check } */
  settings: { ...DEFAULT_SETTINGS },
  sprint: { best: {}, recent: [] },
  mistakes: {},       /* glyph -> count, from drills and sprints */
  kataOpen: null,     /* the day katakana unlocked; never relocks */
  menu: { orders: 0, days: {} },   /* the side quest: orders taken, per day */
  backupAt: null,
});

let state = freshState();

function normalise(s) {
  const out = { ...freshState(), ...s };
  out.settings = { ...DEFAULT_SETTINGS, ...(s.settings || {}) };
  delete out.settings.lessonsPerDay;      /* replaced by newPerDay in 0.3 */
  out.items = s.items && typeof s.items === "object" ? s.items : {};
  out.words = s.words && typeof s.words === "object" ? s.words : {};
  out.patterns = s.patterns && typeof s.patterns === "object" ? s.patterns : {};
  out.days = s.days && typeof s.days === "object" ? s.days : {};
  Object.values(out.days).forEach(d => {
    d.learned = asList(d.learned);
    d.rev = asList(d.rev);
    d.ok = d.ok || {};
    Object.keys(d.ok).forEach(k => { d.ok[k] = asList(d.ok[k]); });
  });
  out.sprint = { best: {}, ...(s.sprint || {}) };
  out.sprint.recent = asList(out.sprint.recent);
  out.mistakes = s.mistakes && typeof s.mistakes === "object" ? s.mistakes : {};
  out.menu = { orders: 0, days: {}, ...(s.menu || {}) };
  return out;
}

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    state = raw ? normalise(JSON.parse(raw)) : freshState();
  } catch (e) {
    console.warn("load failed, starting fresh", e);
    state = freshState();
  }
  return state;
}

let saveFailed = false;
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); saveFailed = false; }
  catch (e) { saveFailed = true; console.warn("save failed", e); }
}

/* ---------- days ---------- */

function day(k = today()) {
  if (!state.days[k]) state.days[k] = { n: 0, ok: {}, learned: [], rev: [] };
  const d = state.days[k];
  d.ok = d.ok || {};
  return d;
}
const dayOkList = (kind, k = today()) => (state.days[k]?.ok?.[kind]) || [];

/* ---------- items ---------- */

const isWordKey = k => typeof k === "string" && k.startsWith("w:");
const isPatternKey = k => typeof k === "string" && k.startsWith("g:");
const storeOf = k => isWordKey(k) ? state.words : isPatternKey(k) ? state.patterns : state.items;
const item = k => storeOf(k)[k] || null;
const isLearned = k => !!storeOf(k)[k];
const learnedKana = set => KANA.filter(e => (!set || e.set === set) && isLearned(e.k));
const isDue = k => { const it = item(k); return !!it && it.due <= today(); };

function skill(k, sk) {
  const it = item(k);
  return (it && it.sk && it.sk[sk]) || { n: 0, ok: 0, fast: 0, miss: 0 };
}

/* The skills an item can be asked about. A concept (っ, ー) has no sound or
   shape to name on its own, so it only ever comes up as a word pair. "a",
   telling look-alikes apart, only applies to kana that have one — callers
   narrow the keys for that. */
/* Verbs have one more: j, conjugate it. */
const skillsFor = k => isPatternKey(k) ? ["f", "r"] : isWordKey(k) ? (isVerb(WORD_BY[k]?.pos) ? ["r", "p", "c", "j"] : ["r", "p", "c"])
  : KANA_BY[k]?.concept ? ["x"] : ["r", "p", "a", "w"];

function learn(k) {
  if (isLearned(k)) return;
  const t = today();
  storeOf(k)[k] = { at: t, lvl: 1, due: addDays(t, INTERVALS[1]), sk: {} };
  const d = day();
  if (!d.learned.includes(k)) d.learned.push(k);
}

/* Record one answer.

   mode:
     "learn"    — during a lesson: skill credit only
     "review"   — the item was due: move it along the ladder, or back down
     "practice" — extra, chosen practice: a right answer never pushes the
                  review out, a wrong one still pulls it forward
     "speed"    — a sprint: skill credit for a right answer, nothing else
                  (misses go to the mistake notebook, not the schedule)
     "auto"     — review if it is due, practice if not */
function grade(k, sk, ok, ms, mode = "practice") {
  const it = item(k);
  if (!it) return;
  if (mode === "auto") mode = isDue(k) ? "review" : "practice";
  it.sk = it.sk || {};
  const s = it.sk[sk] || (it.sk[sk] = { n: 0, ok: 0, fast: 0, miss: 0 });
  s.n++;
  if (ok) {
    s.ok++;
    if (ms != null && ms <= ((isPatternKey(k) ? QUICK_PATTERN_MS : isWordKey(k) ? QUICK_WORD_MS : QUICK_MS)[sk] || 4000)) s.fast++;
  } else {
    s.miss++;
    state.mistakes[k] = (state.mistakes[k] || 0) + 1;
  }
  const t = today();
  if (mode === "review") {
    if (ok) it.lvl = Math.min(INTERVALS.length - 1, it.lvl + 1);
    else it.lvl = Math.max(1, it.lvl - 2);
    it.due = ok ? addDays(t, INTERVALS[it.lvl]) : t;
    const d = day();
    if (!d.rev.includes(k)) d.rev.push(k);
  } else if (mode === "practice" && !ok) {
    if (it.due > t) it.due = t;
  }
  const d = day();
  d.n++;
  if (ok && mode !== "speed") {
    const list = d.ok[sk] || (d.ok[sk] = []);
    if (!list.includes(k)) list.push(k);
  }
}

/* How far an item is towards solid in one skill: quick passes, capped.
   Writing is the exception — it's slow by nature, so any right answer counts. */
const solidness = (k, sk) => Math.min(PASSES_FOR_SOLID, sk === "w" ? skill(k, sk).ok : skill(k, sk).fast);
const isSolid = (k, sk) => solidness(k, sk) >= PASSES_FOR_SOLID;

/* A skill over a set of items: the ring fills with every quick pass, and the
   bar splits items by 0/1/2/3 passes (Hanzi Quest, "what solid means"). */
function standing(keys, sk) {
  const ks = keys.filter(k => skillsFor(k).includes(sk));
  const buckets = [0, 0, 0, 0];
  let sum = 0;
  ks.forEach(k => { const s = solidness(k, sk); buckets[s]++; sum += s; });
  return {
    total: ks.length,
    solid: buckets[3],
    buckets,
    pct: ks.length ? sum / (ks.length * PASSES_FOR_SOLID) : 0,
  };
}

/* Shakiest first: fewest quick passes, then most misses, then least recent. */
function shakiest(keys, sk) {
  return [...keys].sort((a, b) =>
    solidness(a, sk) - solidness(b, sk) ||
    skill(b, sk).miss - skill(a, sk).miss ||
    skill(a, sk).n - skill(b, sk).n);
}

/* Everything due, kana and words. Once words are open, a kana that's solid
   in reading and hearing stops being scheduled on its own: every word you
   read keeps it fresh (README → Kana). One that isn't solid yet stays. */
function dueKeys() {
  const t = today();
  const retired = k => wordsOpen() && (KANA_BY[k]?.concept ? isSolid(k, "x") : isSolid(k, "r") && isSolid(k, "p"));
  const kana = Object.keys(state.items).filter(k => state.items[k].due <= t && !retired(k));
  const words = Object.keys(state.words).filter(k => state.words[k].due <= t);
  const patterns = Object.keys(state.patterns).filter(k => state.patterns[k].due <= t);
  return [...kana, ...words, ...patterns].sort((a, b) => item(a).due.localeCompare(item(b).due));
}

/* ---------- lessons and the gates ---------- */

const lessonLearned = L => L.items.every(isLearned);
const hiraLessons = () => LESSONS.filter(L => L.set === "h");
const kataLessons = () => LESSONS.filter(L => L.set === "k");
const allHiraLearned = () => hiraLessons().every(lessonLearned);

/* The day the last hiragana was learned: the check's days are counted after it. */
function hiraDoneDay() {
  if (!allHiraLearned()) return null;
  return KANA.filter(e => e.set === "h").map(e => item(e.k).at).sort().pop();
}

/* Days on which a hiragana check was passed, strictly after the last
   hiragana was learned. One per calendar day, however many passes. */
function hiraCheckDays() {
  const done = hiraDoneDay();
  if (!done) return [];
  return Object.keys(state.days).filter(k => k > done && state.days[k].check?.passed).sort();
}

function kataOpen() {
  if (state.kataOpen) return true;
  if (hiraCheckDays().length >= HIRA_CHECK.days) { state.kataOpen = today(); return true; }
  return false;
}

/* Words open once every kana is learned. README's tiers open at 80%, but
   the kana stage is gated the whole way (hiragana cemented before katakana),
   so words wait for the last of it too. */
const allKanaLearned = () => LESSONS.every(lessonLearned);
const wordsOpen = () => allKanaLearned() && kataOpen();

/* Where the learner is. Drives what Today offers. */
function phase() {
  if (!allHiraLearned()) return "hira";
  if (!kataOpen()) return "check";
  if (!kataLessons().every(lessonLearned)) return "kata";
  if (!WORD_LESSONS.every(lessonLearned)) return "words";
  return "done";
}

/* Lessons open to start today: the next unlearned ones in order, within the
   day's allowance of new kana, and never katakana before the gate.

   The allowance is counted in kana, not lessons (Settings → New kana a
   day, 5 by default). Whole lessons only — half a row teaches nothing about
   the row — and one kana of slack, so two three-kana rows (きゃ + しゃ) can
   share a day at the default of five. */
function lessonsLearnedToday() {
  const d = state.days[today()];
  if (!d) return [];
  return [...LESSONS, ...WORD_LESSONS].filter(L => L.items.some(k => d.learned.includes(k)) && lessonLearned(L));
}

const learnedTodayCount = () => (state.days[today()]?.learned || []).length;

function nextLessons() {
  const p = phase();
  if (p === "check" || p === "done") return [];
  const pool = p === "words" ? WORD_LESSONS.filter(L => !lessonLearned(L))
    : LESSONS.filter(L => (p === "hira" ? L.set === "h" : L.set === "k") && !lessonLearned(L));
  const left = state.settings.newPerDay - learnedTodayCount();
  const out = [];
  let n = 0;
  for (const L of pool) {
    const size = L.items.filter(k => !isLearned(k)).length;
    if (n >= left || n + size > left + 1) break;
    out.push(L);
    n += size;
  }
  return out;
}

const upcomingLesson = () => [...LESSONS, ...WORD_LESSONS].find(L => !lessonLearned(L)) || null;

/* The hiragana check passed today? */
const checkPassedToday = () => !!state.days[today()]?.check?.passed;

function recordCheck(correct, total) {
  const d = day();
  const acc = total ? correct / total : 0;
  const passed = acc >= HIRA_CHECK.pass;
  d.check = { passed: passed || !!d.check?.passed, best: Math.max(acc, d.check?.best || 0), tries: (d.check?.tries || 0) + 1 };
  return { acc, passed };
}

/* ---------- words ---------- */

/* A word you can read: every kana in it is learned. Kanji don't count
   against it — they come with furigana until you know them. */
const canRead = w => w.units.every(isLearned);
const readableWords = set => KANA_WORDS.filter(w => (!set || w.set === set) && canRead(w));

/* Newest first: ordered by the last of its glyphs to be learned. */
function wordsByNewest(set) {
  const when = w => w.units.map(u => item(u)?.at || "").sort().pop();
  return readableWords(set).sort((a, b) => when(b).localeCompare(when(a)));
}

/* ---------- streak and totals ---------- */

function streak() {
  let n = 0, k = today();
  if (!(state.days[k]?.n > 0)) k = addDays(k, -1);   /* today not started yet doesn't break it */
  while (state.days[k]?.n > 0) { n++; k = addDays(k, -1); }
  return n;
}

const practisedDays = () => Object.keys(state.days).filter(k => state.days[k].n > 0).length;

/* ---------- sprint records ---------- */

function recordSprint(key, res) {
  const best = state.sprint.best[key];
  /* Only a finished sheet can set a best: finishing comes first, then accuracy. */
  const better = res.finished && (!best || res.right > best.right || (res.right === best.right && res.ms < best.ms));
  if (better) state.sprint.best[key] = { right: res.right, total: res.total, ms: res.ms, at: today() };
  state.sprint.recent = [{ key, ...res, at: today() }, ...asList(state.sprint.recent)].slice(0, 30);
  return better;
}

/* ---------- backup ---------- */

function exportState() {
  return JSON.stringify({ app: "nihongo-quest", exported: new Date().toISOString(), state }, null, 1);
}

/* Returns the state it would install, or throws with a reason a person can read. */
function parseBackup(text) {
  let j;
  try { j = JSON.parse(text); } catch { throw new Error("That isn't a backup file — it doesn't parse as JSON."); }
  const s = j && j.state;
  if (!s || s.app !== "nihongo-quest") throw new Error("That file isn't a Nihongo Quest backup.");
  return normalise(s);
}
