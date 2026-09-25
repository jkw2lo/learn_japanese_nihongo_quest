/* Nihongo Quest — the drawings.

   Everything here is inline SVG drawn with the colour tokens, so it follows
   light and dark mode, and nothing is an emoji: emoji look different on
   every device and can't be themed.

   - icon(name)        small line icons for buttons
   - neko(mood)        the mascot, a round white cat
   - hanamaru()        花丸: the spiral flower a Japanese teacher draws in red
                       pen round good work; it draws itself
   - stamp(text)       a teacher's red hanko: よくできました, 合格, 新記録
   - petals(el)        sakura petals drifting down over a moment worth it

   Red here is the seal family — the teacher's pen and stamp are seals —
   which is the one place the colour rules allow it. */

const ICONS = {
  speaker: '<path d="M3.5 8h3l4.5-3.5v11L6.5 12h-3z"/><path d="M14 7.5a3.5 3.5 0 0 1 0 5"/><path d="M16.3 5.2a6.8 6.8 0 0 1 0 9.6"/>',
  muted: '<path d="M3.5 8h3l4.5-3.5v11L6.5 12h-3z"/><path d="M14.5 8l4 4M18.5 8l-4 4"/>',
  lock: '<rect x="5" y="9" width="10" height="8" rx="2"/><path d="M7.5 9V6.8a2.5 2.5 0 0 1 5 0V9"/>',
  save: '<path d="M10 3.5v9"/><path d="M6.2 9l3.8 3.8L13.8 9"/><path d="M4 13.5v2.5h12v-2.5"/>',
  sliders: '<path d="M4 6h8M15 6h1M4 14h1M8 14h8"/><circle cx="13.5" cy="6" r="1.8"/><circle cx="6.5" cy="14" r="1.8"/>',
  close: '<path d="M5.5 5.5l9 9M14.5 5.5l-9 9"/>',
  check: '<path d="M4.5 10.5l3.8 3.8L15.5 6.5"/>',
  chevron: '<path d="M8 5l5 5-5 5"/>',
  back: '<path d="M12 5l-5 5 5 5"/>',
  sparkle: '<path d="M10 3v4M10 13v4M3 10h4M13 10h4"/>',
};

function icon(name, cls = "") {
  return `<svg class="ico ${cls}" viewBox="0 0 20 20" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

/* ---------- the mascot ---------- */

/* moods: happy (^ ^), cheer (arms up, sparkles), think (looking aside),
   sleepy (done for the day), wow (big eyes), gambaru (a headband — keep going) */
function neko(mood = "happy", cls = "") {
  const eyes = {
    happy: '<path class="nk-line" d="M33 55q4.5-6 9 0M58 55q4.5-6 9 0"/>',
    cheer: '<path class="nk-line" d="M33 55q4.5-6 9 0M58 55q4.5-6 9 0"/>',
    think: '<circle class="nk-ink" cx="40" cy="53" r="3.4"/><circle class="nk-ink" cx="64" cy="53" r="3.4"/>',
    sleepy: '<path class="nk-line" d="M33 55q4.5 4 9 0M58 55q4.5 4 9 0"/>',
    wow: '<circle class="nk-ink" cx="38" cy="53" r="4.6"/><circle class="nk-ink" cx="62" cy="53" r="4.6"/><circle class="nk-shine" cx="39.6" cy="51.4" r="1.5"/><circle class="nk-shine" cx="63.6" cy="51.4" r="1.5"/>',
    gambaru: '<path class="nk-line" d="M33 52l8 3M67 52l-8 3"/><circle class="nk-ink" cx="38" cy="57" r="2.6"/><circle class="nk-ink" cx="62" cy="57" r="2.6"/>',
  }[mood] || "";
  const mouth = mood === "wow"
    ? '<ellipse class="nk-ink" cx="50" cy="66" rx="3" ry="3.6"/>'
    : mood === "think" ? '<path class="nk-line" d="M46 66h7"/>'
    : '<path class="nk-line" d="M44 64q3 4 6 0q3 4 6 0"/>';
  const arms = mood === "cheer"
    ? '<path class="nk-body" d="M19 66q-17-8-15-31q9-1 15 17z"/><path class="nk-body" d="M81 66q17-8 15-31q-9-1-15 17z"/>'
    : "";
  const extra = mood === "cheer"
    ? '<path class="nk-spark" d="M10 22v8M6 26h8M88 14v8M84 18h8M92 44v6M89 47h6"/>'
    : mood === "sleepy" ? '<text class="nk-z" x="78" y="26">z</text><text class="nk-z small" x="87" y="16">z</text>'
    : mood === "think" ? '<circle class="nk-dot" cx="80" cy="30" r="2.2"/><circle class="nk-dot" cx="86" cy="21" r="3"/>'
    : "";
  const band = mood === "gambaru"
    ? '<path class="nk-band" d="M17 45q33-12 66 0v6q-33-12-66 0z"/><path class="nk-band" d="M81 47l9-5 1 9z"/>'
    : "";
  return `<svg class="neko ${cls} mood-${mood}" viewBox="0 0 100 100" aria-hidden="true">
    ${arms}
    <path class="nk-body" d="M22 42L27 13 47 30M78 42L73 13 53 30"/>
    <path class="nk-ear" d="M27.5 20l3 12 7-5.5zM72.5 20l-3 12-7-5.5z"/>
    <ellipse class="nk-body" cx="50" cy="58" rx="36" ry="30"/>
    ${band}${eyes}
    <ellipse class="nk-cheek" cx="29" cy="64" rx="5.5" ry="3.2"/><ellipse class="nk-cheek" cx="71" cy="64" rx="5.5" ry="3.2"/>
    ${mouth}
    <path class="nk-whisk" d="M12 58l11 2M12 66l11-2M88 58l-11 2M88 66l-11-2"/>
    ${extra}
  </svg>`;
}

/* ---------- the hanamaru ---------- */

/* One loose loop of the pen round the score, carrying on into a ring of
   petals — the way the teacher draws it, in one stroke. Worked out here
   rather than drawn by hand so it closes neatly at any size. */
function hanamaruPath(cx = 100, cy = 100) {
  const f = n => n.toFixed(1);
  let d = "";
  /* the loop: a little more than once round, widening slightly */
  const loopStart = -Math.PI * 0.62;
  for (let i = 0; i <= 64; i++) {
    const t = i / 64, a = loopStart + t * 2.15 * Math.PI;
    const r = 56 + t * 8;
    const x = cx + r * 1.18 * Math.cos(a), y = cy + r * 0.74 * Math.sin(a);
    d += (i ? "L" : "M") + f(x) + " " + f(y);
  }
  /* the petals, all the way round */
  const petals = 11, rin = 66, rout = 90;
  const a0 = loopStart + 2.15 * Math.PI;
  for (let i = 0; i < petals; i++) {
    const s0 = a0 + i * 2 * Math.PI / petals, s1 = s0 + 2 * Math.PI / petals, sm = (s0 + s1) / 2;
    const pt = (a, r) => [cx + r * 1.18 * Math.cos(a), cy + r * 0.74 * Math.sin(a)];
    const [c1x, c1y] = pt(sm - 0.3, rout), [c2x, c2y] = pt(sm + 0.3, rout), [ex, ey] = pt(s1, rin);
    d += `C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(ex)} ${f(ey)}`;
  }
  return d;
}

function hanamaru(cls = "") {
  return `<svg class="hanamaru ${cls}" viewBox="0 0 200 200" aria-hidden="true"><path pathLength="1" d="${hanamaruPath()}"/></svg>`;
}

/* ---------- the stamp ---------- */

function stamp(text, cls = "") {
  const long = [...text].length > 3;
  return `<div class="stamp ${long ? "stamp-long" : ""} ${cls}" lang="ja" aria-hidden="true"><span>${esc(text)}</span></div>`;
}

/* ---------- sakura petals ---------- */

function petals(host, n = 22) {
  if (!host || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.createElement("div");
  layer.className = "petals";
  for (let i = 0; i < n; i++) {
    const p = document.createElement("i");
    p.style.setProperty("--x", (Math.random() * 100).toFixed(1) + "%");
    p.style.setProperty("--d", (Math.random() * 1.4).toFixed(2) + "s");
    p.style.setProperty("--t", (3 + Math.random() * 2.5).toFixed(2) + "s");
    p.style.setProperty("--drift", ((Math.random() - 0.5) * 160).toFixed(0) + "px");
    p.style.setProperty("--s", (0.6 + Math.random() * 0.8).toFixed(2));
    layer.appendChild(p);
  }
  host.appendChild(layer);
  setTimeout(() => layer.remove(), 7000);
}
