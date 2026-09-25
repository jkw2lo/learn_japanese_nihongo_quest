/* Nihongo Quest — sound.

   Clips, not speechSynthesis. Hanzi Quest found the browser's engine blocked
   inside an embedded frame, and several macOS voices listed with no voice
   data at all — speak() queues, nothing plays, and nothing errors. So every
   kana and every word is recorded ahead of time by tools/make-audio.mjs and
   played through one shared <audio> element.

   Clips are keyed by the text that was spoken. A katakana glyph plays its
   hiragana twin's clip (KANA entries carry `say`), and words are always
   recorded from kana, so the voice never has to guess a reading. */

let audioEl = null, audioUnlocked = false, soundBlocked = false;
/* Which playback owns the element. The unlock primes the element with a
   muted play and tidies up afterwards; without this counter, a clip started
   before that tidy-up settled got paused by it (Hanzi Quest, "The audio
   unlock, and the first character you write"). */
let audioOwner = 0;

const clipFor = t => (window.NQ_AUDIO && window.NQ_AUDIO[t]) || null;
const clipCount = () => (window.NQ_AUDIO && Object.keys(window.NQ_AUDIO).length) || 0;
const hasAudio = () => clipCount() > 0;

function ensureAudioEl() {
  if (!audioEl) { audioEl = new Audio(); audioEl.preload = "auto"; }
  return audioEl;
}

function unlockAudio() {
  if (audioUnlocked) return;
  const first = window.NQ_AUDIO && Object.values(window.NQ_AUDIO)[0];
  if (!first) return;                  /* bundle still in flight — stay armed */
  audioUnlocked = true;
  const a = ensureAudioEl();
  const mine = ++audioOwner;
  try {
    a.muted = true;
    a.src = "data:audio/mp4;base64," + first;
    const p = a.play();
    const done = () => {
      if (audioOwner === mine) { try { a.pause(); a.currentTime = 0; } catch {} }
      a.muted = false;
    };
    if (p && p.then) p.then(done, done); else done();
  } catch { a.muted = false; }
}

/* Not { once: true }: a once-listener is spent even when it returns early,
   so a click before the bundle arrived would burn the only unlock. */
addEventListener("pointerdown", unlockAudio, { capture: true });
addEventListener("keydown", unlockAudio, { capture: true });

/* Play `text`. Returns false if there's no clip for it (or sound is off), so
   a caller can say so rather than leave someone waiting on silence. */
function say(text) {
  if (!state.settings.sound) return false;
  const b64 = clipFor(text);
  if (!b64) return sayFallback(text);
  const a = ensureAudioEl();
  try {
    audioOwner++;
    a.pause();
    a.muted = false;
    a.src = "data:audio/mp4;base64," + b64;
    a.currentTime = 0;
    const p = a.play();
    if (p && p.catch) p.catch(e => {
      if (e && e.name === "AbortError") return;   /* we interrupted ourselves */
      soundBlocked = true;
      if (typeof renderSoundBar === "function") renderSoundBar();
    });
    if (soundBlocked) { soundBlocked = false; if (typeof renderSoundBar === "function") renderSoundBar(); }
    return true;
  } catch { return false; }
}

/* The system voice, only where there's no clip — and only if it has a
   Japanese voice that exists. It may still be silent; Settings says so. */
function sayFallback(text) {
  if (!("speechSynthesis" in window)) return false;
  const v = speechSynthesis.getVoices().find(v => /^ja/i.test(v.lang));
  if (!v) return false;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = v; u.lang = v.lang; u.rate = 0.9;
    speechSynthesis.speak(u);
    return true;
  } catch { return false; }
}

const sayKana = k => say(KANA_BY[k]?.say || k);

/* Fetched after the first render, not as a blocking <script>: nothing on the
   first screen needs sound, and a megabyte of base64 in front of it would
   hold the whole page up. */
function loadAudioBundle() {
  if (window.NQ_AUDIO) return;
  const el = document.createElement("script");
  el.src = `js/audio-kana.js?v=${APP_VERSION}`;
  el.async = true;
  el.onload = () => { if (typeof onAudioLoaded === "function") onAudioLoaded(); };
  el.onerror = () => console.warn("audio bundle missing — run node tools/make-audio.mjs");
  document.head.appendChild(el);
}
