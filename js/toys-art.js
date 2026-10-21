/* Nihongo Quest — the capsule toys, drawn (see js/data/toys.js).

   Little vinyl figures: flat colour, a dark outline, a highlight. Like the
   painted places, they have their own light — the same colours by day or
   night — so the palette is fixed here (css: .toy), not theme tokens. Each
   is a 64×64 drawing standing on y≈58. Fill classes:
     w white  c cream  r red  r2 deep red  g gold  k ink  p pink  b blue
     nv navy  sk sky  gr green  dg deep green  br brown  wd wood  o orange
     y yellow  gy grey  pu purple  mt matcha  cr caramel  sl salmon
   and two modifiers: n (no outline: a detail on top) and l (a line, no fill). */

/* Shared shapes for the sets of people and feelings (0.65.0).
   feel: a round little figure in a colour, its face and whatever's around it.
   who:  a small person — skin, clothes, hair or hat, face — and what they hold. */
function feel(fill, face, extra = "") {
  const f = fill.startsWith("#") ? `class="w" style="fill:${fill}"` : `class="${fill}"`;
  return `<path ${f} d="M10 40q0-25 22-25t22 25q0 18-22 18T10 40z"/>
    <ellipse class="w n" cx="21" cy="25" rx="4" ry="2.3" opacity=".55"/>${face}${extra}`;
}
const CHEEKS = `<ellipse class="p n" cx="18.5" cy="44" rx="3.4" ry="2" opacity=".85"/><ellipse class="p n" cx="45.5" cy="44" rx="3.4" ry="2" opacity=".85"/>`;
const DOTS = `<circle class="k n" cx="24" cy="38" r="2.3"/><circle class="k n" cx="40" cy="38" r="2.3"/>`;
const SWEAT = (x = 50, y = 24) => `<path class="sk" d="M${x} ${y}q-3 5 0 6.5 3-1.5 0-6.5z" style="fill:#9CCBEB"/>`;
const HEART = (x, y, k = 1, cls = "r") => `<path class="${cls}" d="M${x} ${y + 5 * k}l${-5 * k} ${-5 * k}c${-2.6 * k} ${-2.6 * k} 0 ${-6.6 * k} ${3 * k} ${-4.8 * k}l${2 * k} ${1 * k}l${2 * k} ${-1 * k}c${3 * k} ${-1.8 * k} ${5.6 * k} ${2.2 * k} ${3 * k} ${4.8 * k}z"/>`;

function who({ skin = "#F6D5B5", body = "nv", legs = "k", hair = `<path class="k" d="M20 22q0-12 12-12t12 12q-3-6-12-6t-12 6z"/>`, face = "", over = "", hat = "", prop = "", back = "" } = {}) {
  const b = body.startsWith("#") ? `class="w" style="fill:${body}"` : `class="${body}"`;
  return `${back}<rect class="${legs}" x="24.5" y="49" width="6.5" height="9" rx="2.4"/><rect class="${legs}" x="33" y="49" width="6.5" height="9" rx="2.4"/>
    <path ${b} d="M17 53q0-19 15-19t15 19z"/>${over}
    <circle class="c" cx="32" cy="23" r="11.5" style="fill:${skin}"/>${hair}
    ${face || `<circle class="k n" cx="27.5" cy="24.5" r="1.5"/><circle class="k n" cx="36.5" cy="24.5" r="1.5"/><path class="l" d="M29.5 28.5q2.5 2 5 0"/>`}
    <ellipse class="p n" cx="25" cy="28" rx="2" ry="1.1" opacity=".75"/><ellipse class="p n" cx="39" cy="28" rx="2" ry="1.1" opacity=".75"/>${hat}${prop}`;
}

const TOY_ART = {
  /* ---------- 縁起物 lucky charms ---------- */
  maneki: `<ellipse class="w" cx="32" cy="45" rx="15" ry="12"/>
    <path class="w" d="M45 36c3-6 3-14 1-19 4-1 7 2 7 6 0 5-3 10-8 13z"/>
    <path class="w" d="M20 22l-1-11 9 6zM44 22l1-11-9 6z"/><path class="p n" d="M21 18l0-4 3 2zM43 18l0-4-3 2z"/>
    <circle class="w" cx="32" cy="27" r="13"/>
    <path class="l" d="M25 26q2.5-3 5 0M34 26q2.5-3 5 0M30 31q2 2 4 0"/><circle class="p n" cx="32" cy="29.5" r="1.3"/>
    <path class="r" d="M21 36q11 6 22 0l1 3q-12 6-24 0z"/><circle class="g" cx="32" cy="41" r="3"/>
    <ellipse class="g" cx="32" cy="50" rx="6" ry="5"/><path class="l" d="M28 50h8"/>
    <ellipse class="w n" cx="26" cy="21" rx="2.5" ry="1.5" opacity=".9"/>`,
  daruma: `<ellipse class="r" cx="32" cy="36" rx="19" ry="22"/>
    <ellipse class="c" cx="32" cy="29" rx="12" ry="10"/>
    <circle class="k" cx="27" cy="29" r="3.2"/><circle class="w" cx="37" cy="29" r="3.2"/>
    <path class="l" d="M23 23q4-3 8 0M33 23q4-3 8 0M25 35q7 4 14 0M29 35v2M35 35v2"/>
    <path class="g" d="M25 46q7 5 14 0q-3 7-7 7t-7-7z"/>
    <ellipse class="w n" cx="22" cy="24" rx="3" ry="5" opacity=".35"/>`,
  kokeshi: `<rect class="wd" x="23" y="30" width="18" height="27" rx="5"/>
    <circle class="r" cx="28" cy="40" r="3.2"/><circle class="r" cx="36" cy="48" r="3.2"/><circle class="p" cx="35" cy="37" r="2"/><circle class="p" cx="28" cy="51" r="2"/>
    <path class="l" d="M23 34h18"/>
    <circle class="c" cx="32" cy="20" r="12"/>
    <path class="k" d="M20 20q0-12 12-12t12 12q-3-5-7-6-2 4-5 4t-5-4q-4 1-7 6z"/>
    <path class="r" d="M40 10l5-3 1 6z"/>
    <path class="l" d="M26 22q1.5 1 3 0M35 22q1.5 1 3 0"/><circle class="r n" cx="32" cy="26" r="1.2"/>`,
  koinobori: `<path class="br" d="M10 6h3v52h-3z"/><circle class="g" cx="11.5" cy="5" r="3"/>
    <path class="k" d="M13 12h30q10 0 14 6-4 6-14 6H13l6-6z"/>
    <path class="l" d="M30 16q2 2 0 4M36 16q2 2 0 4" style="stroke:#fff"/><circle class="w" cx="47" cy="17" r="2.6"/><circle class="k n" cx="47.5" cy="17" r="1.2"/>
    <path class="r" d="M13 30h26q9 0 12 5-3 5-12 5H13l5-5z"/>
    <path class="l" d="M27 33q2 2 0 4M32 33q2 2 0 4"/><circle class="w" cx="42" cy="34" r="2.2"/><circle class="k n" cx="42.4" cy="34" r="1"/>
    <path class="b" d="M13 46h18q7 0 9 4-2 4-9 4H13l4-4z"/><circle class="w" cx="33" cy="49" r="1.8"/>`,
  furin: `<path class="l" d="M32 2v6"/>
    <path class="sk" d="M12 32q0-24 20-24t20 24z"/><path class="l" d="M10 32h44"/>
    <path class="o n" d="M22 22q4-4 8 0-4 4-8 0zM30 22l3-3v6z"/><path class="r n" d="M38 17q2.5-2.5 5 0-2.5 2.5-5 0z"/>
    <path class="w n" d="M18 27q1-11 8-14" style="stroke:#fff;stroke-width:1.8;fill:none;opacity:.8"/>
    <path class="l" d="M32 32v7"/><circle class="g" cx="32" cy="33" r="2.4"/>
    <rect class="p" x="26" y="39" width="12" height="19" rx="1"/><path class="l" d="M29 44h6M29 48h6M29 52h4"/>`,
  chochin: `<path class="k" d="M24 8h16v5H24zM24 51h16v5H24z"/><path class="l" d="M32 3v5"/>
    <ellipse class="r" cx="32" cy="32" rx="16" ry="20"/>
    <path class="l" d="M18 22q14 4 28 0M16.5 32h31M18 42q14-4 28 0"/>
    <ellipse class="w n" cx="25" cy="25" rx="3" ry="6" opacity=".35"/>`,
  sensu: `<path class="r" d="M32 54L7 31a33 33 0 0 1 50 0z"/>
    <path class="g n" d="M32 54L14 22a33 33 0 0 1 36 0z" opacity=".95"/>
    <path class="l" d="M32 54L7 31M32 54L14 22M32 54L23 16M32 54L32 14M32 54L41 16M32 54L50 22M32 54L57 31M7 31a33 33 0 0 1 50 0"/>
    <path class="w n" d="M23 30q9-8 18 0-9-3-18 0z"/>
    <circle class="br" cx="32" cy="54" r="3"/>`,
  torii: `<path class="k" d="M4 12q28 6 56 0l-2 6q-26 4-52 0z"/>
    <rect class="r" x="9" y="20" width="46" height="5"/><rect class="r" x="29" y="16" width="6" height="5"/>
    <rect class="r" x="14" y="17" width="6" height="40"/><rect class="r" x="44" y="17" width="6" height="40"/>
    <rect class="k" x="12" y="53" width="10" height="5"/><rect class="k" x="42" y="53" width="10" height="5"/>`,
  omamori: `<path class="l" d="M28 12q4-9 8 0" style="stroke-width:2.2"/>
    <path class="pu" d="M20 18l4-6h16l4 6v38H20z"/>
    <path class="g" d="M28 12l4 6 4-6M30 20q2 3 4 0"/>
    <rect class="w" x="26" y="28" width="12" height="22" rx="1"/>
    <path class="l" d="M29 33h6M32 33v13M29 38h6M29 43h6"/>
    <path class="g n" d="M20 52h24v4H20z"/>`,
  fuji: `<circle class="r" cx="48" cy="16" r="8"/>
    <path class="b" d="M2 56L24 18h16l22 38z"/>
    <path class="w" d="M24 18h16l7 12-5-2-4 4-4-4-4 4-4-4-5 3z"/>
    <path class="w" d="M6 46q4-5 9-2 3-4 8-1 5 0 5 5H6z"/>`,
  sakura: `<g transform="translate(32 32)">
      ${[0, 72, 144, 216, 288].map(a => `<path class="p" transform="rotate(${a})" d="M0-3C-7-9-6-20-1-22l1 3 1-3C6-20 7-9 0-3z"/>`).join("")}
      <circle class="g" r="4"/><path class="l" d="M0-4v-6M3.8-1.2l6-2M2.4 3.2l3.5 5M-2.4 3.2l-3.5 5M-3.8-1.2l-6-2" style="stroke:#C2402F"/></g>`,
  tsuru: `<path class="r" d="M32 30L10 14l14 24z"/><path class="r2" d="M32 30l22-16-14 24z"/>
    <path class="r" d="M24 38l8-8 8 8-8 10z"/><path class="r2" d="M32 48l-8-10 8 2z"/>
    <path class="r" d="M24 38L12 30l6-2z"/><path class="r" d="M12 30l-4-4 4 1z"/>
    <path class="r2" d="M40 38l12-6-2 6z"/><path class="l" d="M32 30v18"/>`,
  geta: `<rect class="wd" x="8" y="18" width="20" height="34" rx="8"/><rect class="wd" x="36" y="12" width="20" height="34" rx="8"/>
    <rect class="br" x="11" y="51" width="14" height="4"/><rect class="br" x="39" y="45" width="14" height="4"/>
    <path class="r" d="M12 40q6-14 6-14 0 0 6 14" style="fill:none;stroke-width:3.5;stroke:#D9483B"/>
    <path class="r" d="M40 34q6-14 6-14 0 0 6 14" style="fill:none;stroke-width:3.5;stroke:#D9483B"/>`,
  wagasa: `<path class="r" d="M6 30q26-26 52 0z"/>
    <path class="w n" d="M24 30q8-9 16 0z"/>
    <path class="l" d="M32 6L6 30M32 6L19 30M32 6v24M32 6l13 24M32 6l26 24M6 30q26-26 52 0"/>
    <path class="br" d="M31 30h2v24q0 4-4 4" style="fill:none;stroke:#3B342D;stroke-width:2.6"/>
    <circle class="k" cx="32" cy="6" r="2"/>`,
  kendama: `<path class="l" d="M32 30q-14 4-12-14"/>
    <circle class="r" cx="20" cy="14" r="9"/><ellipse class="w n" cx="17" cy="10" rx="3" ry="2" opacity=".6"/>
    <rect class="wd" x="18" y="28" width="28" height="7" rx="3.5"/><path class="wd" d="M18 28q-4 3.5 0 7zM46 28q4 3.5 0 7z"/>
    <path class="wd" d="M29 34h6v22h-6z"/><path class="wd" d="M27 36h10l-1 3h-8z"/>`,
  tanuki: `<path class="k" d="M14 20l14-10h8l14 10-4 2H18z"/><ellipse class="wd" cx="32" cy="21" rx="17" ry="4"/>
    <ellipse class="br" cx="32" cy="46" rx="16" ry="12"/><ellipse class="c" cx="32" cy="48" rx="10" ry="8"/>
    <circle class="br" cx="32" cy="30" r="11"/><circle class="br" cx="23" cy="22" r="3.5"/><circle class="br" cx="41" cy="22" r="3.5"/>
    <path class="k n" d="M22 30q4-5 8 0-4 4-8 0zM34 30q4-5 8 0-4 4-8 0z"/>
    <circle class="w n" cx="26" cy="29.5" r="1.4"/><circle class="w n" cx="38" cy="29.5" r="1.4"/>
    <ellipse class="c" cx="32" cy="35" rx="4" ry="3"/><circle class="k n" cx="32" cy="34" r="1.3"/>
    <path class="wd" d="M46 42l6-3 3 3-1 13h-8z"/><path class="w n" d="M48 46h5v5h-5z"/>`,
  kitsune: `<path class="w" d="M14 8l12 10-6 6zM50 8L38 18l6 6z"/><path class="r n" d="M17 13l5 5-2 2zM47 13l-5 5 2 2z"/>
    <path class="w" d="M16 20q16-8 32 0 2 14-8 24l-8 10-8-10q-10-10-8-24z"/>
    <path class="l" d="M21 29q5-4 9 1M43 29q-5-4-9 1" style="stroke:#D9483B;stroke-width:2.4"/>
    <path class="k n" d="M23 30q3-1 6 1-3 1-6-1zM41 30q-3-1-6 1 3 1 6-1z"/>
    <path class="r n" d="M30 18q2-4 4 0-2 3-4 0zM24 22q1-2 3-1M40 22q-1-2-3-1"/>
    <ellipse class="k" cx="32" cy="50" rx="2.5" ry="1.8"/>`,
  kingyo: `<path class="sk" d="M16 22q-4 34 16 36 20-2 16-36z" opacity=".85"/>
    <path class="l" d="M16 22q16 6 32 0"/><path class="r" d="M26 22q6-6 12 0l-3 3h-6z"/><path class="l" d="M28 14q4-6 8 0" style="stroke:#D9483B;stroke-width:2"/>
    <path class="o" d="M24 42q4-8 12-6 6 2 6 6-2 6-8 6-8 0-10-6z"/><path class="o" d="M42 40l8-6-2 8 2 8-8-6z"/>
    <circle class="k n" cx="28" cy="40" r="1.3"/><path class="l" d="M32 39q2 3 0 6"/>
    <circle class="w n" cx="22" cy="30" r="1.5" opacity=".9"/><circle class="w n" cx="25" cy="26" r="1" opacity=".9"/>`,
  uchiwa: `<rect class="wd" x="30" y="40" width="4" height="18" rx="2"/>
    <ellipse class="w" cx="32" cy="24" rx="20" ry="19"/>
    <circle class="r n" cx="32" cy="21" r="8"/>
    <path class="b n" d="M13.4 31q6.2-4 12.4 0t12.4 0 12.4 0A20 19 0 0 1 13.4 31z"/>
    <ellipse class="l" cx="32" cy="24" rx="20" ry="19"/>`,
  taiko: `<path class="l" d="M12 8l14 12M52 8L38 20" style="stroke:#9A6A3A;stroke-width:3.2"/>
    <circle class="c" cx="12" cy="8" r="2.5"/><circle class="c" cx="52" cy="8" r="2.5"/>
    <path class="r" d="M12 26q20-6 40 0 4 14 0 28-20 6-40 0-4-14 0-28z"/>
    <ellipse class="c" cx="32" cy="26" rx="20" ry="5"/>
    <path class="l" d="M12 34q20 5 40 0M12 46q20 5 40 0"/>
    <circle class="k n" cx="16" cy="29" r="1.2"/><circle class="k n" cx="24" cy="30.6" r="1.2"/><circle class="k n" cx="32" cy="31" r="1.2"/><circle class="k n" cx="40" cy="30.6" r="1.2"/><circle class="k n" cx="48" cy="29" r="1.2"/>
    <path class="g n" d="M28 38q4-4 8 0-4 4-8 0z"/>`,

  /* ---------- 食べ物 food ---------- */
  onigiri: `<path class="w" d="M32 10q5 0 20 32 3 10-8 12H20q-11-2-8-12 15-32 20-32z"/>
    <rect class="k" x="22" y="36" width="20" height="18" rx="2"/>
    <circle class="r n" cx="32" cy="27" r="3"/>
    <ellipse class="w n" cx="26" cy="22" rx="2" ry="4" transform="rotate(25 26 22)" opacity=".6" style="fill:#fff"/>`,
  sushi: `<ellipse class="gy" cx="32" cy="52" rx="26" ry="6"/>
    <rect class="w" x="14" y="30" width="36" height="20" rx="8"/>
    <path class="sl" d="M10 30q22-14 44-2 2 4-2 6-20-6-40 2-4-2-2-6z"/>
    <path class="l" d="M22 25q2 4 0 7M30 22q2 4 0 8M38 22q2 4 0 8M46 24q2 4 0 7" style="stroke:#fff;stroke-width:1.8"/>`,
  ramen: `<path class="r" d="M6 30h52q-2 20-18 24H24Q8 50 6 30z"/>
    <path class="l" d="M10 40h44" style="stroke:#fff;stroke-width:1.4;stroke-dasharray:3 3"/>
    <ellipse class="cr" cx="32" cy="30" rx="26" ry="6"/>
    <path class="y n" d="M14 30q4-3 8 0t8 0 8 0 8 0 6 0" style="fill:none;stroke:#F5CF52;stroke-width:2.2"/>
    <ellipse class="w" cx="22" cy="27" rx="5" ry="3.6"/><circle class="y n" cx="22" cy="27" r="2.2" style="fill:#F2A23A"/>
    <circle class="w" cx="36" cy="27" r="3.6"/><path class="p n" d="M36 27m-2 0a2 2 0 1 0 2-2" style="fill:none;stroke:#E86A86;stroke-width:1.2"/>
    <rect class="k" x="42" y="18" width="6" height="11" rx="1" transform="rotate(10 45 23)"/>
    <path class="br" d="M44 26L60 4M48 27L62 7" style="stroke:#9A6A3A;stroke-width:2.4"/>`,
  dango: `<path class="br" d="M31 4h2v56h-2z"/>
    <circle class="p" cx="32" cy="14" r="9"/><circle class="w" cx="32" cy="29" r="9"/><circle class="gr" cx="32" cy="44" r="9"/>
    <ellipse class="w n" cx="28" cy="11" rx="2.5" ry="1.6" opacity=".7"/><ellipse class="w n" cx="28" cy="41" rx="2.5" ry="1.6" opacity=".5"/>`,
  taiyaki: `<path class="cr" d="M6 32q8-16 30-14l16-8q-2 14 2 22-4 8-2 22l-16-8Q14 48 6 32z"/>
    <circle class="k n" cx="16" cy="28" r="2"/><path class="l" d="M10 36q4 2 8 0"/>
    <path class="l" d="M24 26q3 6 0 12M30 24q3 7 0 16M36 24q3 7 0 16M28 30h0M33 36h0"/>
    <path class="l" d="M48 16q-2 16 2 32"/>`,
  tempura: `<path class="y" d="M14 50q-6-8 2-14l26-24q8-4 10 4 2 6-6 12L22 50q-4 4-8 0z" style="fill:#F2C25C"/>
    <path class="l" d="M20 42l4 2M26 36l4 2M32 30l4 2M38 24l4 2"/>
    <path class="r" d="M46 12l6-8 2 6 8-2-6 8z"/>
    <path class="g n" d="M18 46l2-2M24 40l2-2M30 34l2-2" style="stroke:#D9983A;stroke-width:2"/>`,
  bento: `<rect class="k" x="6" y="12" width="52" height="42" rx="5"/>
    <rect class="w" x="10" y="16" width="24" height="34" rx="2"/><circle class="r" cx="22" cy="33" r="4"/>
    <rect class="y" x="38" y="16" width="16" height="10" rx="2"/><path class="l" d="M38 21h16"/>
    <circle class="gr" cx="42" cy="34" r="4"/><circle class="gr" cx="48" cy="32" r="3"/>
    <rect class="sl" x="38" y="40" width="16" height="10" rx="3"/>`,
  misoshiru: `<path class="r2" d="M8 28h48q-2 24-24 26Q10 52 8 28z"/>
    <ellipse class="cr" cx="32" cy="28" rx="24" ry="6" style="fill:#C98B4A"/>
    <rect class="w" x="20" y="25" width="5" height="4"/><rect class="w" x="34" y="26" width="5" height="4"/><rect class="w" x="27" y="27" width="4" height="3"/>
    <circle class="gr" cx="42" cy="27" r="1.6"/><circle class="gr" cx="16" cy="28" r="1.6"/><circle class="gr" cx="30" cy="24.5" r="1.4"/>
    <path class="l" d="M24 18q-3-4 0-8M32 16q-3-4 0-8M40 18q-3-4 0-8" style="stroke:#A9A499"/>`,
  takoyaki: `<path class="wd" d="M6 40h52l-6 14H12z"/>
    <circle class="cr" cx="20" cy="36" r="9"/><circle class="cr" cx="44" cy="36" r="9"/><circle class="cr" cx="32" cy="30" r="9"/>
    <path class="br n" d="M14 33q6-4 12 0M38 33q6-4 12 0M26 27q6-4 12 0" style="fill:none;stroke:#6B3E1E;stroke-width:3"/>
    <path class="w n" d="M15 36l3-3 3 3 3-3M39 36l3-3 3 3 3-3M27 30l3-3 3 3 3-3" style="fill:none;stroke:#fff;stroke-width:1.4"/>
    <circle class="gr n" cx="22" cy="31" r=".9"/><circle class="gr n" cx="34" cy="25" r=".9"/><circle class="gr n" cx="46" cy="31" r=".9"/>
    <path class="br" d="M48 20l8-14" style="stroke:#D3A26A;stroke-width:2"/>`,
  gyoza: `<path class="c" d="M4 40q4-18 22-18t22 18q-22 6-44 0z"/>
    <path class="l" d="M12 30l2 6M18 26l1 7M25 24v8M32 25l-1 7M39 28l-2 6"/>
    <path class="c" d="M20 48q4-16 20-16t20 16q-20 6-40 0z"/>
    <path class="cr n" d="M22 50q18 4 36 0l2-2q-20 6-40 0z" style="fill:#C98B4A"/>
    <path class="l" d="M28 40l2 5M34 37l1 6M41 36v7M48 38l-2 6"/>`,
  kakigori: `<path class="sk" d="M16 40h32l-6 16H22z" opacity=".9"/><rect class="sk" x="28" y="56" width="8" height="2"/>
    <path class="w" d="M12 40q0-22 20-26 20 4 20 26z"/>
    <path class="r n" d="M14 34q2-16 18-18 16 2 18 18-8-4-18-4t-18 4z"/>
    <circle class="g" cx="32" cy="13" r="3"/>
    <path class="l" d="M44 20l12-14" style="stroke:#A9A499;stroke-width:2.4"/>`,
  oden: `<path class="wd" d="M31 2h2v58h-2z"/>
    <path class="gy" d="M32 6l10 16H22z" style="fill:#8E8A80"/><path class="k n" d="M28 16h0M34 13h0M30 19h0" style="stroke:#3B342D;stroke-width:1.6"/>
    <circle class="cr" cx="32" cy="32" r="8" style="fill:#B9824A"/>
    <rect class="c" x="23" y="42" width="18" height="12" rx="3"/><path class="l" d="M23 46h18"/>`,
  senbei: `<circle class="cr" cx="32" cy="32" r="22" style="fill:#C98B4A"/>
    <path class="k" d="M10 28h44v10H10z"/>
    <circle class="br n" cx="22" cy="20" r="1.2"/><circle class="br n" cx="40" cy="18" r="1.2"/><circle class="br n" cx="30" cy="46" r="1.2"/><circle class="br n" cx="44" cy="44" r="1.2"/>
    <ellipse class="w n" cx="22" cy="18" rx="4" ry="2" opacity=".35"/>`,
  mochi: `<path class="wd" d="M12 50h40l-4 8H16z"/><rect class="w" x="8" y="46" width="48" height="5" rx="1"/>
    <ellipse class="w" cx="32" cy="40" rx="20" ry="8"/><ellipse class="w" cx="32" cy="29" rx="14" ry="7"/>
    <circle class="o" cx="32" cy="18" r="6"/><path class="dg" d="M32 12q4-6 9-3-4 4-9 3z"/>
    <path class="r n" d="M10 46l4-2v4z"/>`,
  curry: `<ellipse class="w" cx="32" cy="42" rx="28" ry="12"/>
    <path class="w" d="M8 40q4-14 18-14 8 6 4 18-14 2-22-4z" style="fill:#FFFDF8"/>
    <path class="cr" d="M28 32q16-8 28 6-4 10-26 8-4-8-2-14z" style="fill:#B3742F"/>
    <rect class="o" x="36" y="34" width="5" height="5" rx="1"/><rect class="y" x="46" y="36" width="5" height="4" rx="1" style="fill:#F2C25C"/><rect class="sl" x="40" y="40" width="5" height="4" rx="1"/>
    <path class="gy" d="M50 20l10-6 1 3-9 6z" style="fill:#C9C4BA"/>`,
  matcha: `<path class="k" d="M8 28h40q-2 26-20 26T8 28z" style="fill:#3D3A35"/>
    <ellipse class="mt" cx="28" cy="28" rx="20" ry="5"/>
    <path class="w n" d="M18 28q4-2 8 0t8 0" style="fill:none;stroke:#C7DFA0;stroke-width:1.4"/>
    <path class="wd" d="M50 34h10l-2 20h-6z"/><path class="l" d="M52 36l1 18M55 36v18M58 36l-1 18"/><rect class="wd" x="52" y="54" width="6" height="4"/>`,
  ramune: `<path class="sk" d="M26 58V36q0-6 4-10v-8h4v8q4 4 4 10v22z" style="fill:#A8D8EE"/>
    <path class="sk" d="M28 26q4 4 8 0" style="fill:none"/><circle class="sk" cx="32" cy="22" r="3.4" style="fill:#E5F4FB"/>
    <rect class="b" x="29" y="10" width="6" height="7" rx="1.5"/>
    <rect class="b" x="26" y="40" width="12" height="10"/><path class="w n" d="M29 45h6" style="stroke:#fff;stroke-width:1.6"/>
    <path class="w n" d="M29 52v4" style="stroke:#fff;stroke-width:1.8;opacity:.7"/>`,
  melonpan: `<ellipse class="y" cx="32" cy="38" rx="24" ry="16" style="fill:#E7C66A"/>
    <path class="y" d="M8 38q0-18 24-18t24 18q-24 6-48 0z" style="fill:#EFD97F"/>
    <path class="l" d="M16 28l12 10M24 24l14 12M34 22l12 10M44 26l6 5M12 34l8-8M20 36l12-12M30 36l12-12M42 34l6-6" style="stroke:#C9A445"/>`,
  purin: `<ellipse class="w" cx="32" cy="52" rx="24" ry="5"/>
    <path class="y" d="M16 50l5-26h22l5 26z" style="fill:#F5D77A"/>
    <path class="cr" d="M21 24q11-6 22 0l1 6q-12 4-24 0z" style="fill:#9A5A22"/>
    <circle class="r" cx="32" cy="16" r="4"/><path class="l" d="M32 12q2-6 6-6"/>
    <ellipse class="w n" cx="40" cy="22" rx="1.8" ry="1" opacity=".7"/>`,
  yakitori: `<path class="wd" d="M8 56L56 8" style="stroke:#D3A26A;stroke-width:3;fill:none"/>
    <rect class="br" x="12" y="38" width="12" height="11" rx="4" transform="rotate(-45 18 43)" style="fill:#A9673A"/>
    <rect class="gr" x="22" y="30" width="9" height="9" rx="2" transform="rotate(-45 26.5 34.5)"/>
    <rect class="br" x="30" y="20" width="12" height="11" rx="4" transform="rotate(-45 36 25)" style="fill:#A9673A"/>
    <rect class="br" x="40" y="12" width="10" height="10" rx="4" transform="rotate(-45 45 17)" style="fill:#A9673A"/>
    <path class="g n" d="M16 42l4-4M34 24l4-4" style="stroke:#6B3E1E;stroke-width:1.6"/>`,

  /* ---------- 町 around town ---------- */
  jihanki: `<rect class="r" x="14" y="6" width="36" height="52" rx="3"/>
    <rect class="w" x="18" y="10" width="28" height="26" rx="1"/>
    <rect class="b" x="21" y="13" width="4" height="8" rx="1"/><rect class="o" x="27" y="13" width="4" height="8" rx="1"/><rect class="gr" x="33" y="13" width="4" height="8" rx="1"/><rect class="y" x="39" y="13" width="4" height="8" rx="1"/>
    <rect class="k" x="21" y="25" width="4" height="8" rx="1"/><rect class="r" x="27" y="25" width="4" height="8" rx="1"/><rect class="sk" x="33" y="25" width="4" height="8" rx="1"/><rect class="p" x="39" y="25" width="4" height="8" rx="1"/>
    <rect class="k" x="38" y="40" width="8" height="6" rx="1"/><rect class="k" x="20" y="48" width="24" height="6" rx="1"/>`,
  posuto: `<rect class="r" x="18" y="16" width="28" height="38" rx="2"/><path class="r" d="M16 16q16-14 32 0z"/>
    <rect class="k" x="23" y="24" width="18" height="3" rx="1"/>
    <path class="l" d="M27 34h10M27 38h10M32 38v8" style="stroke:#fff;stroke-width:2"/>
    <rect class="k" x="16" y="54" width="32" height="4"/>`,
  densha: `<rect class="w" x="10" y="10" width="44" height="42" rx="8"/>
    <rect class="sk" x="15" y="15" width="34" height="16" rx="3"/><path class="l" d="M32 15v16"/>
    <rect class="gr" x="10" y="35" width="44" height="5"/>
    <circle class="y" cx="18" cy="45" r="3"/><circle class="y" cx="46" cy="45" r="3"/>
    <path class="k" d="M14 52h36l-4 6H18z"/><path class="l" d="M24 10l8-6 8 6"/>`,
  shinkansen: `<path class="w" d="M2 46V32q0-6 8-6h22q16 0 30 20z"/>
    <path class="sk" d="M40 28q8 2 13 9H40z"/>
    <rect class="sk" x="7" y="30" width="5" height="6" rx="1"/><rect class="sk" x="15" y="30" width="5" height="6" rx="1"/><rect class="sk" x="23" y="30" width="5" height="6" rx="1"/><rect class="sk" x="31" y="30" width="5" height="6" rx="1"/>
    <path class="b" d="M2 40h50l2.6 3H2z"/>
    <path class="gy" d="M2 46h60v3H2z"/><circle class="k" cx="12" cy="51" r="3"/><circle class="k" cx="44" cy="51" r="3"/>`,
  basu: `<rect class="y" x="6" y="14" width="52" height="34" rx="6" style="fill:#F2C25C"/>
    <rect class="sk" x="10" y="19" width="10" height="10" rx="1"/><rect class="sk" x="22" y="19" width="10" height="10" rx="1"/><rect class="sk" x="34" y="19" width="10" height="10" rx="1"/><rect class="sk" x="46" y="19" width="9" height="16" rx="1"/>
    <path class="gr" d="M6 36h40v4H6z"/><circle class="k" cx="17" cy="50" r="5"/><circle class="k" cx="45" cy="50" r="5"/>
    <circle class="gy n" cx="17" cy="50" r="2"/><circle class="gy n" cx="45" cy="50" r="2"/>`,
  takushi: `<rect class="g" x="26" y="12" width="12" height="6" rx="1"/>
    <path class="o" d="M6 44V34q2-4 8-6l6-8h22l8 8q8 2 8 6v10z" style="fill:#F2A23A"/>
    <path class="sk" d="M22 22h8v8H16zM34 22h7l6 8H34z"/>
    <circle class="k" cx="17" cy="46" r="5.5"/><circle class="k" cx="47" cy="46" r="5.5"/>
    <circle class="gy n" cx="17" cy="46" r="2"/><circle class="gy n" cx="47" cy="46" r="2"/>
    <path class="w n" d="M8 36h48" style="stroke:#fff;stroke-width:1.6;stroke-dasharray:3 2"/>`,
  jitensha: `<circle class="l" cx="16" cy="44" r="10" style="stroke-width:2.6"/><circle class="l" cx="48" cy="44" r="10" style="stroke-width:2.6"/>
    <path class="l" d="M16 44l10-16h16l6 16M26 28l8 16 8-16M34 44h-4M24 22h8M42 28l-2-8h6" style="stroke:#3D7A57;stroke-width:2.6"/>
    <path class="wd" d="M46 16h12v8H46z" style="fill:#C9C4BA"/><path class="l" d="M48 18h8M48 21h8"/>
    <path class="k" d="M22 22h10l-1 3h-8z"/>`,
  shingo: `<path class="gy" d="M30 34h4v24h-4z"/>
    <rect class="gy" x="4" y="14" width="56" height="20" rx="4" style="fill:#8E8A80"/>
    <circle class="gr" cx="16" cy="24" r="6" style="fill:#3FBF9A"/><circle class="k" cx="32" cy="24" r="6" style="fill:#5A5650"/><circle class="k" cx="48" cy="24" r="6" style="fill:#5A5650"/>
    <ellipse class="w n" cx="14" cy="21.5" rx="2" ry="1.2" opacity=".7"/>`,
  fumikiri: `<path class="k" d="M30 22h4v36h-4z"/>
    <path class="y" d="M8 6l48 20-2 4L6 10z"/><path class="y" d="M56 6L8 26l2 4 48-20z"/>
    <path class="k n" d="M14 9l-3 3M22 12l-4 4M30 16l-4 4M38 20l-4 3M46 24l-3 2M50 8l3 3M42 11l4 4M34 14l4 4" style="stroke:#2E2B27;stroke-width:2.4"/>
    <rect class="k" x="18" y="34" width="28" height="10" rx="5"/>
    <circle class="r" cx="23" cy="39" r="3.6"/><circle class="r" cx="41" cy="39" r="3.6" style="fill:#5A1F18"/>`,
  kon: `<path class="o" d="M26 8h12l10 44H16z" style="fill:#F07F2E"/>
    <path class="w n" d="M23.8 22h16.4l1.6 7H22.2zM20.6 36h22.8l1.6 7H19z"/>
    <rect class="o" x="10" y="52" width="44" height="6" rx="1" style="fill:#F07F2E"/>`,
  manhoru: `<circle class="gy" cx="32" cy="32" r="26" style="fill:#7C786F"/>
    <circle class="l" cx="32" cy="32" r="21"/>
    <g transform="translate(32 32)">${[0, 72, 144, 216, 288].map(a => `<path class="gy n" transform="rotate(${a})" d="M0-4C-5-8-4-15 0-16c4 1 5 8 0 12z" style="fill:#A9A499"/>`).join("")}
      <circle class="gy n" r="3" style="fill:#5A5650"/></g>`,
  denchu: `<rect class="gy" x="29" y="4" width="6" height="54" style="fill:#B9B3A6"/>
    <rect class="k" x="14" y="12" width="36" height="3"/><rect class="k" x="18" y="22" width="28" height="3"/>
    <path class="l" d="M0 10q16 10 16 2M64 10q-16 10-16 2M0 22q20 8 20 0M64 22q-20 8-20 0"/>
    <rect class="y" x="27" y="34" width="10" height="12" style="fill:#F2C25C"/><path class="l" d="M29 38h6M29 42h6"/>`,
  kippu: `<rect class="c" x="6" y="18" width="52" height="28" rx="2" style="fill:#F2E6C2"/>
    <rect class="b" x="6" y="18" width="52" height="7" rx="2"/>
    <path class="l" d="M12 32h18M12 38h12M38 32h14"/>
    <rect class="k" x="40" y="36" width="12" height="6" rx="1" style="fill:#5A5650"/>
    <circle class="w" cx="6" cy="34" r="3" style="fill:#FBFAF6"/><circle class="w" cx="58" cy="34" r="3" style="fill:#FBFAF6"/>`,
  randoseru: `<path class="r" d="M12 22q0-12 20-12t20 12v32H12z"/>
    <path class="r2" d="M12 24q20 8 40 0v18q-20 6-40 0z"/>
    <rect class="g" x="28" y="36" width="8" height="6" rx="1"/>
    <path class="l" d="M22 10q-4-6 10-6t10 6"/>`,
  denwa: `<rect class="gr" x="12" y="10" width="40" height="46" rx="4" style="fill:#4FA36A"/>
    <rect class="w" x="18" y="14" width="28" height="10" rx="2" style="fill:#DDEFD9"/>
    <path class="k" d="M14 26q-4 10 0 20h4q2-10 0-20z"/>
    <circle class="w n" cx="28" cy="32" r="1.6"/><circle class="w n" cx="34" cy="32" r="1.6"/><circle class="w n" cx="40" cy="32" r="1.6"/>
    <circle class="w n" cx="28" cy="38" r="1.6"/><circle class="w n" cx="34" cy="38" r="1.6"/><circle class="w n" cx="40" cy="38" r="1.6"/>
    <circle class="w n" cx="28" cy="44" r="1.6"/><circle class="w n" cx="34" cy="44" r="1.6"/><circle class="w n" cx="40" cy="44" r="1.6"/>
    <path class="l" d="M16 46q4 8 14 6"/>`,
  noren: `<rect class="br" x="6" y="8" width="52" height="4" rx="2"/>
    <path class="nv" d="M9 12h22v40H9zM33 12h22v40H33z"/>
    <text x="32" y="43" text-anchor="middle" font-size="27" font-weight="700" fill="#fff" font-family="Hiragino Sans, Noto Sans JP, sans-serif">ゆ</text>
    <path class="l" d="M32 12v40" style="stroke-width:2.4"/>`,
  robotto: `<path class="l" d="M32 8v-4" style="stroke-width:2"/><circle class="r" cx="32" cy="4" r="2.4"/>
    <rect class="gy" x="18" y="8" width="28" height="20" rx="4" style="fill:#C9C4BA"/>
    <rect class="k" x="22" y="13" width="20" height="9" rx="3"/><circle class="sk n" cx="27" cy="17.5" r="2.4" style="fill:#7FD4F4"/><circle class="sk n" cx="37" cy="17.5" r="2.4" style="fill:#7FD4F4"/>
    <rect class="b" x="16" y="30" width="32" height="20" rx="3"/><rect class="y" x="26" y="35" width="12" height="7" rx="1"/>
    <rect class="gy" x="8" y="31" width="7" height="14" rx="3" style="fill:#C9C4BA"/><rect class="gy" x="49" y="31" width="7" height="14" rx="3" style="fill:#C9C4BA"/>
    <rect class="k" x="20" y="50" width="9" height="8" rx="2"/><rect class="k" x="35" y="50" width="9" height="8" rx="2"/>`,
  gacha: `<rect class="r" x="14" y="34" width="36" height="24" rx="3"/>
    <circle class="sk" cx="32" cy="22" r="17" style="fill:#E1F1F8"/>
    <circle class="p" cx="24" cy="28" r="5"/><circle class="y" cx="35" cy="30" r="5"/><circle class="b" cx="30" cy="20" r="5"/><circle class="gr" cx="40" cy="20" r="4.5"/><circle class="o" cx="22" cy="17" r="4"/>
    <ellipse class="w n" cx="24" cy="12" rx="4" ry="2" opacity=".8"/>
    <circle class="w" cx="32" cy="44" r="5"/><path class="l" d="M28 44h8"/><rect class="k" x="38" y="50" width="8" height="5" rx="1"/>`,
  ie: `<rect class="c" x="14" y="30" width="36" height="26"/>
    <path class="k" d="M6 32L32 12l26 20-4 2L32 18 10 34z" style="fill:#4F5A6E"/>
    <rect class="br" x="27" y="40" width="10" height="16"/><rect class="sk" x="17" y="36" width="8" height="8"/><rect class="sk" x="39" y="36" width="8" height="8"/>
    <path class="l" d="M21 36v8M17 40h8M43 36v8M39 40h8"/>`,
  tower: `<path class="o" d="M30 4h4l2 14h-8z" style="fill:#E8553A"/>
    <path class="o" d="M28 18h8l4 16H24z" style="fill:#F2F0EA"/><path class="r" d="M24 34h16l8 24h-8l-8-12-8 12h-8z" style="fill:#E8553A"/>
    <rect class="w" x="22" y="26" width="20" height="4" style="fill:#F2F0EA"/><rect class="w" x="20" y="40" width="24" height="3" style="fill:#F2F0EA"/>
    <path class="l" d="M28 18l8 16M36 18l-8 16"/>`,
  /* ---------- 家 at home ---------- */
  tsukue: `<rect class="b" x="11" y="13" width="13" height="9" rx="1"/><path class="l" d="M14 16h7" style="stroke:#fff"/>
    <rect class="r" x="40" y="12" width="8" height="10" rx="1"/><path class="l" d="M42 12l-2-7M46 12l2-6M44 12V4" style="stroke-width:2"/>
    <rect class="br" x="9" y="28" width="5" height="30"/><rect class="br" x="50" y="28" width="5" height="30"/>
    <rect class="wd" x="30" y="28" width="22" height="13"/><rect class="br" x="38" y="33" width="6" height="2.4" rx="1"/>
    <rect class="wd" x="5" y="22" width="54" height="7" rx="1.5"/>`,
  isu: `<rect class="br" x="19" y="34" width="4" height="24"/><rect class="br" x="41" y="34" width="4" height="24"/>
    <rect class="wd" x="19" y="5" width="26" height="29" rx="5"/><rect class="c" x="24" y="10" width="16" height="17" rx="3"/>
    <rect class="r" x="13" y="31" width="38" height="8" rx="3"/>
    <rect class="br" x="15" y="39" width="4" height="19"/><rect class="br" x="45" y="39" width="4" height="19"/>`,
  beddo: `<rect class="br" x="4" y="20" width="6" height="38" rx="2"/><rect class="br" x="54" y="32" width="6" height="26" rx="2"/>
    <rect class="wd" x="8" y="42" width="48" height="9"/>
    <rect class="w" x="9" y="33" width="46" height="10" rx="3"/>
    <rect class="w" x="11" y="25" width="15" height="9" rx="4.5"/>
    <path class="b" d="M24 31h31v12H24q-3-6 0-12z"/>
    <path class="w n" d="M30 34v6M36 34v6M42 34v6M48 34v6" style="stroke:#fff;stroke-width:1.6;opacity:.7"/>`,
  terebi: `<path class="k" d="M26 44h12l3 9H23z"/><rect class="k" x="17" y="52" width="30" height="5" rx="2.5"/>
    <rect class="k" x="5" y="9" width="54" height="36" rx="3"/>
    <rect class="sk" x="9" y="13" width="46" height="28" rx="1"/>
    <path class="gr n" d="M9 41V34l11-9 9 8 7-5 19 11v2z"/><circle class="y n" cx="45" cy="20" r="3.6"/>
    <ellipse class="w n" cx="15" cy="17" rx="3" ry="1.6" opacity=".75"/>`,
  reizoko: `<rect class="w" x="15" y="4" width="34" height="53" rx="4"/>
    <path class="l" d="M15 22h34"/>
    <rect class="gy" x="19" y="9" width="3" height="9" rx="1.5"/><rect class="gy" x="19" y="27" width="3" height="15" rx="1.5"/>
    <circle class="r" cx="41" cy="11" r="2.6"/><circle class="y" cx="35" cy="14" r="2"/>
    <rect class="p" x="32" y="29" width="11" height="13" rx="1"/><path class="l" d="M34.5 33h6M34.5 36.5h6M34.5 40h3.5"/>
    <rect class="gy" x="18" y="57" width="6" height="2"/><rect class="gy" x="40" y="57" width="6" height="2"/>
    <rect class="w n" x="45" y="7" width="2" height="12" rx="1" opacity=".9" style="fill:#E6E1D6"/>`,
  sumaho: `<rect class="k" x="18" y="4" width="28" height="54" rx="5"/>
    <rect class="sk" x="21" y="10" width="22" height="42" rx="1.5"/>
    <rect class="r n" x="24" y="14" width="4.6" height="4.6" rx="1.2"/><rect class="gr n" x="29.7" y="14" width="4.6" height="4.6" rx="1.2"/><rect class="y n" x="35.4" y="14" width="4.6" height="4.6" rx="1.2"/>
    <rect class="b n" x="24" y="20.5" width="4.6" height="4.6" rx="1.2"/><rect class="p n" x="29.7" y="20.5" width="4.6" height="4.6" rx="1.2"/><rect class="o n" x="35.4" y="20.5" width="4.6" height="4.6" rx="1.2"/>
    <rect class="w n" x="24" y="32" width="13" height="5" rx="2.5"/><rect class="gr n" x="28" y="40" width="12" height="5" rx="2.5" style="fill:#8FD19B"/>
    <path class="l" d="M29 7h6" style="stroke:#6B665E;stroke-width:1.6"/>`,
  tokei: `<path class="l" d="M20 49l-5 9M44 49l5 9" style="stroke-width:3"/>
    <circle class="g" cx="16" cy="15" r="6.5"/><circle class="g" cx="48" cy="15" r="6.5"/>
    <path class="l" d="M32 13V7M27 6h10" style="stroke-width:2.2"/>
    <circle class="r" cx="32" cy="34" r="20"/>
    <circle class="w" cx="32" cy="34" r="15"/>
    <path class="l" d="M32 21.5v3M32 43.5v3M19.5 34h3M41.5 34h3"/>
    <path class="l" d="M32 34v-9M32 34l6.5 4" style="stroke-width:2.4"/><circle class="k" cx="32" cy="34" r="1.8"/>
    <ellipse class="w n" cx="22" cy="22" rx="3.2" ry="1.8" opacity=".45"/>`,
  kasa: `<path class="l" d="M32 29v21q0 6 6 6t6-6" style="stroke:#9A6A3A;stroke-width:3.4"/>
    <path class="l" d="M32 9V4" style="stroke-width:2.2"/>
    <path class="b" d="M5 30Q5 9 32 9T59 30q-4.5-4-9 0-4.5-4-9 0-4.5-4-9 0-4.5-4-9 0-4.5-4-9 0-4.5-4-9 0z"/>
    <path class="l" d="M32 9Q23 15 23 30M32 9Q41 15 41 30M32 9Q12 15 14 30M32 9Q52 15 50 30"/>
    <path class="w n" d="M14 22q5-9 14-11" style="stroke:#fff;stroke-width:2;fill:none;opacity:.55"/>`,
  kagi: `<circle class="g" cx="18" cy="30" r="12"/><circle class="w" cx="18" cy="30" r="4.6"/>
    <path class="g" d="M29 26.5h28v7h-4v7h-5v-7h-4v5h-5v-5H29z"/>
    <path class="l" d="M10 22q3-4 8-5" style="stroke:#fff;stroke-width:1.8;opacity:.8"/>
    <path class="r" d="M8 38q-4 6-2 14l4-1q-1-7 2-11z"/><circle class="r" cx="9" cy="38" r="2.6"/>`,
  kotatsu: `<path class="o" d="M17 26a6 6 0 1 0 12 0 6 6 0 1 0-12 0z"/><path class="o" d="M29 26.5a5.5 5.5 0 1 0 11 0 5.5 5.5 0 1 0-11 0z"/>
    <path class="gr" d="M23 20.5q3-4 6-1-3 3-6 1z"/><path class="gr" d="M34 21.5q3-3 5-.5-2.5 2.5-5 .5z"/>
    <rect class="br" x="44" y="22" width="8" height="10" rx="1.5" style="fill:#5E8C6A"/><path class="l" d="M52 25q3 0 3 3t-3 3"/>
    <path class="r" d="M6 35h52l3 19q-6 3-14.5 0-7.5 3-15 0-7.5 3-15 0-6.5 3-13 0z"/>
    <path class="w n" d="M11 41l3 3-3 3-3-3zM24 42l3 3-3 3-3-3zM37 42l3 3-3 3-3-3zM50 41l3 3-3 3-3-3z" opacity=".85"/>
    <rect class="wd" x="2" y="30" width="60" height="7" rx="2"/>`,
  futon: `<rect class="w" x="6" y="44" width="52" height="13" rx="5"/>
    <rect class="b" x="8" y="31" width="48" height="14" rx="5"/>
    <path class="w n" d="M14 35l2 2-2 2-2-2zM26 35l2 2-2 2-2-2zM38 35l2 2-2 2-2-2zM50 35l2 2-2 2-2-2zM20 40l2 2-2 2-2-2zM32 40l2 2-2 2-2-2zM44 40l2 2-2 2-2-2z" opacity=".8"/>
    <rect class="p" x="10" y="18" width="44" height="14" rx="5"/>
    <path class="l" d="M10 25h44" style="stroke:#fff;stroke-width:1.6;opacity:.7"/>
    <rect class="w" x="18" y="8" width="28" height="11" rx="5.5"/>`,
  makura: `<rect class="w" x="5" y="24" width="54" height="26" rx="13"/>
    <path class="b" d="M18 25.5h7v23h-7zM39 25.5h7v23h-7z"/>
    <path class="l" d="M5 37h54" style="stroke:#A9A499;stroke-dasharray:2 3"/>
    <ellipse class="w n" cx="14" cy="30" rx="4" ry="2" opacity=".9"/>`,
  koppu: `<path class="sk n" d="M17.4 10h29.2l-4 46H21.4z" style="fill:#E6F3FA"/>
    <path class="sk n" d="M19.2 27h25.6l-2.4 28H21.6z"/>
    <path class="l" d="M19.2 27h25.6" style="stroke:#4F7FC0;stroke-width:1.4"/>
    <circle class="w n" cx="28" cy="40" r="1.6"/><circle class="w n" cx="35" cy="46" r="1.2"/><circle class="w n" cx="31" cy="33" r="1"/>
    <path class="l" d="M17 10h30l-4 46H21z"/>
    <path class="l" d="M23 15l2 34" style="stroke:#fff;stroke-width:2.2;opacity:.9"/>`,
  hashi: `<path class="sk" d="M8 52q0-6 8-6h6q8 0 8 6v2q0 4-8 4h-6q-8 0-8-4z"/>
    <path class="r" d="M12 47L54 6l2.4 2L15 49.6z"/>
    <path class="r2" d="M17 49.5L58 12l2 2.4L20 52z"/>
    <path class="g" d="M45.5 14.3l3.6-3.5 2.2 2.1-3.6 3.5zM50 18.1l3.7-3.3 2 2.2-3.7 3.3z"/>`,
  chawan: `<path class="l" d="M25 13q-3-4 0-8M33 12q-3-4 0-8M41 13q-3-4 0-8" style="stroke:#A9A499;stroke-width:1.8"/>
    <path class="w" d="M12 30q2-13 20-13t20 13z"/>
    <circle class="w n" cx="22" cy="25" r="1.2" style="fill:#E8E2D4"/><circle class="w n" cx="30" cy="22" r="1.2" style="fill:#E8E2D4"/><circle class="w n" cx="38" cy="24" r="1.2" style="fill:#E8E2D4"/><circle class="w n" cx="44" cy="27" r="1.2" style="fill:#E8E2D4"/>
    <rect class="nv" x="24" y="49" width="16" height="7" rx="1.5"/>
    <path class="w" d="M8 29h48q-1 22-24 22T8 29z"/>
    <path class="l" d="M10.5 36q21.5 6 43 0" style="stroke:#2F4B7C;stroke-width:2.6"/>
    <path class="l" d="M18 42l2 2 2-2 2 2M40 42l2 2 2-2 2 2" style="stroke:#2F4B7C;stroke-width:1.4"/>`,
  yakan: `<path class="l" d="M60 20q-3-4 0-8M56 15q-3-4 0-8" style="stroke:#A9A499;stroke-width:1.8"/>
    <path class="l" d="M19 27q13-20 26 0" style="stroke-width:3.2"/>
    <path class="o" d="M48 40l9-15 3 2-6 16z"/>
    <path class="o" d="M10 54q-1-28 22-28t22 28z"/>
    <ellipse class="o" cx="32" cy="27" rx="10" ry="3"/><circle class="k" cx="32" cy="23" r="2.6"/>
    <rect class="k" x="9" y="53" width="46" height="4" rx="2"/>
    <path class="w n" d="M17 46q1-10 8-14" style="stroke:#fff;stroke-width:2.2;fill:none;opacity:.6"/>`,
  ofuro: `<path class="l" d="M20 14q-3-4 0-8M30 12q-3-4 0-8M40 14q-3-4 0-8" style="stroke:#A9A499;stroke-width:1.8"/>
    <path class="wd" d="M7 28v23q0 7 25 7t25-7V28z"/>
    <path class="l" d="M15 33v22M23 34v23M32 34v24M41 34v23M49 33v22" style="stroke:#B4834E"/>
    <path class="l" d="M7 39q25 9 50 0M7 49q25 9 50 0" style="stroke:#6E4B28;stroke-width:2.6"/>
    <ellipse class="sk" cx="32" cy="28" rx="25" ry="7"/>
    <path class="y" d="M36 30q-2-5 4-5h4q1-5 5-5 4 0 4 4t-3 5q1 3-3 4h-8q-3 0-3-3z"/>
    <path class="o" d="M53 23l4 1-4 1.6z"/><circle class="k n" cx="50" cy="22.5" r="0.9"/>`,
  hon: `<path class="nv" d="M3 18v39q15-4 29 1 14-5 29-1V18z"/>
    <path class="w" d="M32 18q-12-7-26-3v38q14-4 26 2z"/>
    <path class="w" d="M32 18q12-7 26-3v38q-14-4-26 2z"/>
    <path class="l" d="M32 18v37"/>
    <path class="l" d="M26 19v29M21 17v29M16 16v30M11 16v30M38 19v29M43 17v29M48 16v30M53 16v30" style="stroke:#B9B3A6;stroke-width:1.4"/>
    <path class="r" d="M44 12h4v12l-2-2-2 2z"/>`,
  mado: `<rect class="sk" x="12" y="8" width="40" height="43"/>
    <path class="w n" d="M17 25q0-4 4-4 1-4 5-4t5 4q4 0 4 4zM36 40q0-3 3-3 1-3 4-3t4 3q3 0 3 3z"/>
    <rect class="l" x="12" y="8" width="40" height="43" style="stroke:#9A6A3A;stroke-width:3.4"/>
    <path class="l" d="M32 8v43M12 29.5h40" style="stroke:#9A6A3A;stroke-width:3"/>
    <path class="p" d="M7 5h11q-3 22 1 46H7z"/><path class="p" d="M57 5H46q3 22-1 46h12z"/>
    <rect class="br" x="3" y="2" width="58" height="4" rx="2"/>
    <rect class="wd" x="7" y="51" width="50" height="6" rx="1.5"/>`,
  neko: `<path class="pu" d="M4 51q28-6 56 0l-2 7H6z"/><path class="g n" d="M8 53q24-4 48 0" style="stroke:#E6B23E;stroke-width:1.4;fill:none"/>
    <path class="o" d="M47 48q13 1 11-8-1-3-4-1 2 5-6 5z"/>
    <ellipse class="o" cx="33" cy="42" rx="19" ry="10"/>
    <path class="l" d="M30 33q2 4 0 8M37 32.5q2 4 0 8M44 34q2 3.5 0 7" style="stroke:#B8732E;stroke-width:2"/>
    <path class="o" d="M10 31l1-10 7 6zM22 27l5-7 2 9z"/>
    <circle class="o" cx="18" cy="36" r="10"/>
    <path class="l" d="M12 37q2 1.6 4 0M20 37q2 1.6 4 0M17 41q1 1 2 0"/>
    <ellipse class="p n" cx="11.5" cy="40" rx="2" ry="1.2" opacity=".8"/><ellipse class="p n" cx="25" cy="40" rx="2" ry="1.2" opacity=".8"/>
    <text x="46" y="20" font-size="10" font-weight="700" fill="#8E8A80" font-family="sans-serif">z</text><text x="53" y="12" font-size="7" font-weight="700" fill="#8E8A80" font-family="sans-serif">z</text>`,
  /* ---------- 気持ち feelings ---------- */
  ureshii: feel("y", `<path class="l" d="M20 39q4-5 8 0M36 39q4-5 8 0" style="stroke-width:2.2"/><path class="r2" d="M25 44q7 9 14 0z"/>${CHEEKS}`,
    `<path class="g n" d="M53 14l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z"/><path class="g n" d="M9 18l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z"/>`),
  kanashii: feel("sk", `<path class="l" d="M19 33l6-2.4M45 33l-6-2.4" style="stroke-width:1.8"/>${DOTS}<path class="l" d="M27 49q5-4.5 10 0" style="stroke-width:2"/>`,
    `<path class="sk" d="M22 42q-2.6 5 0 7 2.6-2 0-7z" style="fill:#4F9BD9"/><path class="sk" d="M42 42q-2.6 5 0 7 2.6-2 0-7z" style="fill:#4F9BD9"/>`),
  tanoshii: feel("o", `<path class="l" d="M20 38q4-5 8 0M36 38q4-5 8 0" style="stroke-width:2.2"/><path class="r2" d="M24 43h16q-2 9-8 9t-8-9z"/><path class="p n" d="M28 49q4-2 8 0-2 2.6-4 2.6T28 49z"/>${CHEEKS}`,
    `<path class="l" d="M52 6v11M58 4v11M52 6l6-2" style="stroke-width:1.8"/><ellipse class="k" cx="50.6" cy="17" rx="2.2" ry="1.7"/><ellipse class="k" cx="56.6" cy="15" rx="2.2" ry="1.7"/>`),
  kowai: feel("#C9B6E4", `<circle class="w" cx="24" cy="37" r="4.2"/><circle class="w" cx="40" cy="37" r="4.2"/><circle class="k n" cx="24" cy="37" r="1.3"/><circle class="k n" cx="40" cy="37" r="1.3"/>
    <path class="l" d="M24 48q2-3 4 0t4 0 4 0 4 0" style="stroke-width:1.8"/>`,
    `${SWEAT(50, 22)}${SWEAT(14, 26)}<path class="l" d="M6 34l-3-2M6 40H2M58 34l3-2M58 40h4" style="stroke-width:1.8"/>`),
  okotte: feel("r", `<path class="l" d="M19 32l8 4M45 32l-8 4" style="stroke-width:2.4"/><circle class="k n" cx="24" cy="39" r="2.2"/><circle class="k n" cx="40" cy="39" r="2.2"/><path class="l" d="M26 49q6-5 12 0" style="stroke-width:2.2"/>`,
    `<path class="l" d="M45 9q3 2.4 3 5.4M54 9q-3 2.4-3 5.4M45 20q3-2.4 3-5.4M54 20q-3-2.4-3-5.4" style="stroke:#A8362C;stroke-width:2.2"/>
    <path class="w" d="M8 22q-4-2-2-6 4-1 5 2 3-1 4 2-1 3-4 2z" style="fill:#EDEAE3"/>`),
  tsukareta: feel("gy", `<path class="l" d="M19 37h9M36 37h9" style="stroke-width:2"/><path class="l" d="M20 37q4 3.4 8 0M36 37q4 3.4 8 0"/><ellipse class="k" cx="32" cy="48" rx="2.6" ry="1.8"/>`,
    `${SWEAT(48, 22)}<path class="w" d="M38 50q7-3 10 1-2 4-7 2.6z" style="fill:#EDEAE3"/><path class="l" d="M19 30l6 2M45 30l-6 2"/>`),
  nemui: feel("#B9C3E6", `<path class="l" d="M20 38q4 3.4 8 0M36 38q4 3.4 8 0" style="stroke-width:2"/><path class="l" d="M29 47q3 2 6 0"/>`,
    `<circle class="sk" cx="40.5" cy="46" r="4.4" style="fill:#E6F3FA"/>
    <text x="46" y="18" font-size="11" font-weight="700" fill="#5F6EA8" font-family="sans-serif">z</text><text x="54" y="10" font-size="8" font-weight="700" fill="#5F6EA8" font-family="sans-serif">z</text>`),
  onaka: feel("wd", `<circle class="k n" cx="24" cy="36" r="2.2"/><circle class="k n" cx="40" cy="36" r="2.2"/><circle class="w n" cx="24.8" cy="35.2" r=".8"/><circle class="w n" cx="40.8" cy="35.2" r=".8"/>
    <path class="r2" d="M26 44q6 6 12 0z"/><path class="sk" d="M35.5 46q2 5 .2 6.6-1.8-1.6-.2-6.6z" style="fill:#9CCBEB"/>`,
    `<circle class="w" cx="12" cy="18" r="2"/><circle class="w" cx="15" cy="12" r="1.4"/><circle class="w" cx="50" cy="13" r="10"/>
    <path class="w" d="M50 6l6 10H44z" style="fill:#FFFDF8"/><rect class="k" x="46.5" y="12.5" width="7" height="4" rx=".6"/>`),
  nodo: feel("c", `<path class="l" d="M20 36l4 2.6-4 2.6M44 36l-4 2.6 4 2.6" style="stroke-width:2"/><path class="l" d="M27 45h10"/><path class="p" d="M29 45h6v3.4q-3 4-6 0z"/>`,
    `${SWEAT(50, 26)}<circle class="w" cx="51" cy="12" r="8"/><path class="sk" d="M51 6q-4.4 6 0 8.4 4.4-2.4 0-8.4z" style="fill:#4F9BD9"/>`),
  bikkuri: feel("g", `<circle class="w" cx="24" cy="37" r="5"/><circle class="w" cx="40" cy="37" r="5"/><circle class="k n" cx="24" cy="37" r="2"/><circle class="k n" cx="40" cy="37" r="2"/>
    <ellipse class="r2" cx="32" cy="48" rx="3.4" ry="4"/>`,
    `<path class="r" d="M51 4h5l-1.4 13h-2.2z"/><circle class="r" cx="53.5" cy="21" r="2"/><path class="l" d="M10 20l-4-4M14 14l-2-5M6 26H1" style="stroke-width:1.8"/>`),
  hazukashii: feel("#F9D2DA", `<path class="l" d="M20 36l4 2.4-4 2.4M44 36l-4 2.4 4 2.4" style="stroke-width:1.8"/><path class="l" d="M28 47q2-2 4 0t4 0"/>`,
    `<ellipse class="r n" cx="18" cy="44" rx="5" ry="3" opacity=".55"/><ellipse class="r n" cx="46" cy="44" rx="5" ry="3" opacity=".55"/>
    <path class="l" d="M15 43l2-2M19 44l2-2M43 43l2-2M47 44l2-2" style="stroke:#A8362C;stroke-width:1.2"/>${SWEAT(52, 18)}`),
  sabishii: feel("#AFC6D9", `<path class="l" d="M21 39q3 2.4 6 0M37 39q3 2.4 6 0" style="stroke-width:1.8"/><path class="l" d="M29 48h6"/>`,
    `<path class="o" d="M48 10q8 0 8 8-8 0-8-8z"/><path class="l" d="M48 10l8 8"/><path class="l" d="M50 26q2 2 0 4" style="stroke:#A9A499"/>`),
  shiawase: feel("#F7C9D4", `<path class="l" d="M20 39q4-5 8 0M36 39q4-5 8 0" style="stroke-width:2.2"/><path class="l" d="M27 45q5 5 10 0" style="stroke-width:2.2"/>${CHEEKS}`,
    `${HEART(52, 10, 1)}${HEART(10, 16, .8)}${HEART(58, 24, .6, "p")}<path class="g n" d="M32 4l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4z"/>`),
  genki: feel("gr", `<circle class="k n" cx="24" cy="37" r="2.4"/><circle class="k n" cx="40" cy="37" r="2.4"/><circle class="w n" cx="24.9" cy="36" r=".9"/><circle class="w n" cx="40.9" cy="36" r=".9"/>
    <path class="r2" d="M25 44q7 8 14 0z"/>${CHEEKS}`,
    `<path class="gr" d="M51 36q9-4 8-14-4-2-6 2 1 5-5 7z"/><path class="gr" d="M13 36q-9-4-8-14 4-2 6 2-1 5 5 7z"/>`),
  isogashii: feel("sl", `<path class="l" d="M19 33l7 3M45 33l-7 3" style="stroke-width:1.8"/>${DOTS}<path class="l" d="M27 47h10" style="stroke-width:2"/>`,
    `${SWEAT(50, 20)}${SWEAT(14, 22)}<path class="l" d="M1 34h5M2 40h5M1 46h5" style="stroke-width:2"/>
    <rect class="w" x="46" y="4" width="13" height="16" rx="1"/><path class="l" d="M49 9h7M49 12.5h7M49 16h5"/>`),
  hima: feel("mt", `<path class="l" d="M20 38h8M36 38h8" style="stroke-width:2"/><path class="l" d="M28 47h8"/>`,
    `<circle class="k n" cx="46" cy="14" r="1.6"/><circle class="k n" cx="51" cy="14" r="1.6"/><circle class="k n" cx="56" cy="14" r="1.6"/>
    <path class="w" d="M6 18l12-5-4 12-2-5z" style="fill:#FFFDF8"/>`),
  itai: feel("#F2D7B8", `<path class="l" d="M20 35l6 3-6 3M44 35l-6 3 6 3" style="stroke-width:2"/><path class="l" d="M26 48q1.5-2 3 0t3 0 3 0 3 0" style="stroke-width:1.8"/>`,
    `<g transform="rotate(-24 42 21)"><rect class="c" x="34" y="17" width="16" height="7" rx="2.4" style="fill:#F2C79A"/><rect class="w n" x="39" y="18.4" width="6" height="4.2" style="fill:#FBE3C8"/></g>
    <path class="y n" d="M10 14l1.6 3.6 3.6 1.6-3.6 1.6-1.6 3.6-1.6-3.6-3.6-1.6 3.6-1.6z" style="fill:#F2C25C"/>${SWEAT(52, 28)}`),
  shinpai: feel("#CFE0C3", `<path class="l" d="M19 34l7-3M45 34l-7-3" style="stroke-width:1.8"/>${DOTS}<path class="l" d="M27 48q2.5-3 5 0t5 0" style="stroke-width:1.8"/>`,
    `<path class="l" d="M46 15c1-7 12-7 11 0s-9 5-7-1 8-3 5 2-6 2-5-1" style="stroke:#6B665E;stroke-width:1.6"/>${SWEAT(13, 24)}`),
  dokidoki: feel("#F7B2A8", `<circle class="w" cx="24" cy="37" r="3.6"/><circle class="w" cx="40" cy="37" r="3.6"/><circle class="k n" cx="24" cy="37.4" r="1.6"/><circle class="k n" cx="40" cy="37.4" r="1.6"/>
    <path class="l" d="M27 48q2.5-2.4 5 0t5 0" style="stroke-width:1.8"/>`,
    `${HEART(51, 9, 1.3)}<path class="l" d="M42 9l-3-2M43 15h-4M60 9l3-2M59 15h4" style="stroke:#A8362C;stroke-width:1.6"/>${SWEAT(13, 26)}`),
  daisuki: feel("p", `${HEART(24, 34, .9)}${HEART(40, 34, .9)}<path class="r2" d="M25 44q7 8 14 0z"/>${CHEEKS}`,
    `${HEART(53, 8, 1.2)}${HEART(10, 12, .9)}<path class="r" d="M24 58q8-8 16 0z" style="fill:#E05A6E"/>`),

  /* ---------- 仕事 jobs ---------- */
  isha: who({ body: "w", over: `<path class="sk" d="M28 35l4 7 4-7z"/><path class="l" d="M32 42v11"/><path class="l" d="M26.5 36q-1 11 5.5 11.5T37.5 36" style="stroke:#2E2B27;stroke-width:1.8"/><circle class="gy" cx="32" cy="47.5" r="2.4" style="fill:#8E8A80"/>
    <rect class="b n" x="37" y="41" width="5" height="1.6" rx=".6"/>`,
    hat: `<circle class="gy" cx="32" cy="12.5" r="3.6" style="fill:#D8D4CB"/><circle class="w n" cx="32" cy="12.5" r="1.6"/>` }),
  kangoshi: who({ body: "p", hair: `<path class="br" d="M20 23q0-13 12-13t12 13q-2-6-12-6t-12 6z"/><circle class="br" cx="44" cy="25" r="3.4"/>`,
    over: `<path class="w n" d="M28 35l4 5 4-5z" style="fill:#FBE3EA"/><rect class="w n" x="37" y="42" width="5" height="3.4" rx=".6"/>`,
    hat: `<path class="w" d="M23 14q9-6 18 0l-2 4H25z"/><path class="r n" d="M31 12.4h2v4.4h-2zM29.8 13.6h4.4v2h-4.4z"/>` }),
  sensei: who({ body: "gr", hair: `<path class="gy" d="M20 22q0-12 12-12t12 12q-3-6-12-6t-12 6z" style="fill:#7C786F"/>`,
    face: `<circle class="l" cx="27.5" cy="24.5" r="3.2"/><circle class="l" cx="36.5" cy="24.5" r="3.2"/><path class="l" d="M30.7 24.5h2.6"/><circle class="k n" cx="27.5" cy="24.5" r="1.2"/><circle class="k n" cx="36.5" cy="24.5" r="1.2"/><path class="l" d="M29.5 29q2.5 2 5 0"/>`,
    over: `<path class="w n" d="M28 35l4 6 4-6z"/>`,
    back: `<rect class="dg" x="2" y="6" width="22" height="16" rx="1" style="fill:#3F6B52"/><path class="l" d="M6 11h8M6 15h12" style="stroke:#fff;stroke-width:1.4"/>`,
    prop: `<path class="l" d="M45 45l14-24" style="stroke:#9A6A3A;stroke-width:2.4"/>` }),
  gakusei: who({ body: "nv", over: `<path class="w" d="M21 41l11 4 11-4-3-6H24z"/><path class="r" d="M29 43l3 6 3-6z"/><path class="l" d="M23 38l9 4 9-4" style="stroke:#fff;stroke-width:1.2"/>`,
    hair: `<path class="k" d="M20 24q0-14 12-14t12 14v6h-3q1-8-3-11-3 3-12 3-2 3-1 8h-3z"/>` }),
  kaishain: who({ body: "#5A5650", over: `<path class="w" d="M27 35l5 9 5-9z"/><path class="r" d="M31 37h2l1 10-2 2.4-2-2.4z"/><path class="l" d="M27 35l3 8M37 35l-3 8" style="stroke:#2E2B27"/>`,
    prop: `<rect class="br" x="45" y="46" width="14" height="10" rx="1.6"/><path class="l" d="M49 46v-2.4h6V46"/>` }),
  keisatsu: who({ body: "nv", over: `<path class="sk n" d="M28 35l4 6 4-6z"/><path class="g n" d="M37.5 41l1.4 2.4 2.6.4-1.9 1.8.5 2.6-2.6-1.2-2.4 1.2.5-2.6-1.9-1.8 2.6-.4z"/>`,
    hat: `<path class="nv" d="M19 17q13-10 26 0v3H19z"/><rect class="k" x="18" y="18.5" width="28" height="3.4" rx="1.4"/><circle class="g" cx="32" cy="14.5" r="2.2"/>` }),
  shobo: who({ body: "#E8763A", over: `<path class="y n" d="M18 45h28v2.6H18z" style="fill:#F5E35A"/><path class="gy n" d="M18 48h28v1H18z" style="fill:#D8D4CB"/>`,
    hat: `<path class="r" d="M19 21q0-13 13-13t13 13z"/><path class="r" d="M16 20h32q-2 3-8 3H24q-6 0-8-3z"/><rect class="g" x="29" y="10" width="6" height="7" rx="1"/>`,
    prop: `<path class="l" d="M47 50q8 0 10-8" style="stroke:#2E2B27;stroke-width:3.4"/><rect class="gy" x="54" y="36" width="5" height="7" rx="1" transform="rotate(20 56 40)"/>` }),
  shefu: who({ body: "w", over: `<path class="r" d="M27 35h10l-5 6z"/><circle class="k n" cx="29" cy="44" r="1"/><circle class="k n" cx="35" cy="44" r="1"/><circle class="k n" cx="29" cy="49" r="1"/><circle class="k n" cx="35" cy="49" r="1"/>`,
    hair: "",
    hat: `<path class="w" d="M22 17q-7-9 2-11 2-6 8-6t8 6q9 2 2 11z"/><rect class="w" x="22" y="14" width="20" height="5" rx="1"/>`,
    prop: `<path class="gy" d="M46 42h12q0 6-6 6t-6-6z" style="fill:#8E8A80"/><path class="l" d="M58 43l5-3" style="stroke-width:2.4"/>` }),
  tenin: who({ body: "w", hair: `<path class="br" d="M20 23q0-13 12-13t12 13q-3-6-12-6t-12 6z"/>`,
    over: `<path class="gr" d="M23 40h18v13H23z"/><path class="l" d="M23 40l-2-5M41 40l2-5" style="stroke:#3F7D56;stroke-width:2"/><rect class="w n" x="26" y="43" width="7" height="3" rx=".6"/>`,
    prop: `<path class="r" d="M46 44h13l-2 10H48z"/><path class="l" d="M48 44q4.5-7 9 0" style="stroke-width:1.8"/>` }),
  enjinia: who({ body: "b", over: `<path class="l" d="M27 35q5 5 10 0" style="stroke:#fff;stroke-width:1.4"/>`,
    face: `<rect class="l" x="24" y="22" width="7" height="5" rx="1.4"/><rect class="l" x="33" y="22" width="7" height="5" rx="1.4"/><path class="l" d="M31 24h2"/><circle class="k n" cx="27.5" cy="24.5" r="1.1"/><circle class="k n" cx="36.5" cy="24.5" r="1.1"/><path class="l" d="M29.5 29.5q2.5 1.6 5 0"/>`,
    prop: `<path class="gy" d="M40 47l4-11h17l-4 11z" style="fill:#C9C4BA"/><path class="sk n" d="M45.4 37.6h13.6l-2.8 7.8H42.6z"/><rect class="gy" x="36" y="47" width="22" height="3" rx="1" style="fill:#A9A499"/>` }),
  kashu: who({ body: "pu", hair: `<path class="k" d="M19 25q0-15 13-15t13 15l2 8-5-2q0-9-4-13-6 3-14 3-1 4 0 10l-5 2z"/>`,
    over: `<path class="g n" d="M25 40l1 2 2 .5-1.6 1.4.4 2.2-1.8-1-1.8 1 .4-2.2L22 42.5l2-.5zM37 46l1 2 2 .5-1.6 1.4.4 2.2-1.8-1-1.8 1 .4-2.2L34 48.5l2-.5z"/>`,
    prop: `<path class="l" d="M42 42l7-11" style="stroke:#2E2B27;stroke-width:2.6"/><circle class="gy" cx="50" cy="29" r="3.8" style="fill:#8E8A80"/>
    <path class="l" d="M55 8v10M61 6v10M55 8l6-2" style="stroke-width:1.6"/><ellipse class="k" cx="53.6" cy="18" rx="2" ry="1.6"/><ellipse class="k" cx="59.6" cy="16" rx="2" ry="1.6"/>` }),
  untenshu: who({ body: "nv", over: `<path class="w n" d="M28 35l4 5 4-5z"/>`,
    hat: `<path class="nv" d="M20 18q12-9 24 0v2H20z"/><path class="k" d="M18 19h28q0 3-4 3H22q-4 0-4-3z"/>`,
    prop: `<circle class="l" cx="32" cy="47" r="9" style="stroke:#2E2B27;stroke-width:3.4"/><path class="l" d="M23 47h18M32 47v9" style="stroke:#2E2B27;stroke-width:2"/>
    <circle class="w" cx="23.5" cy="44" r="2.6"/><circle class="w" cx="40.5" cy="44" r="2.6"/>` }),
  pairotto: who({ body: "nv", over: `<path class="w n" d="M28 35l4 6 4-6z"/><path class="k n" d="M31 37h2l.6 6-1.6 1.6-1.6-1.6z"/><path class="g n" d="M18.6 47h6v1.4h-6zM18.4 49.6h6v1.4h-6zM39.4 47h6v1.4h-6zM39.6 49.6h6v1.4h-6z"/>`,
    hat: `<path class="w" d="M19 17q13-9 26 0v3H19z"/><rect class="k" x="18" y="18.6" width="28" height="3.2" rx="1.4"/><path class="g n" d="M26 14.4h12l-2 1.6h-8z"/><circle class="g" cx="32" cy="14" r="1.8"/>`,
    prop: `<path class="w" d="M50 12h10l3-3h1l-1 4 1 4h-1l-3-3H50z" style="fill:#FFFDF8"/><path class="w" d="M55 10l-3-5h2l4 5zM55 14l-3 5h2l4-5z" style="fill:#FFFDF8"/>` }),
  noka: who({ body: "b", over: `<path class="w n" d="M24 36h16v4H24z" style="fill:#F2EEE2"/><rect class="b" x="25" y="41" width="14" height="12" style="fill:#3C6CAE"/><circle class="g n" cx="27" cy="43" r="1"/><circle class="g n" cx="37" cy="43" r="1"/>`,
    hat: `<ellipse class="y" cx="32" cy="15" rx="17" ry="4" style="fill:#E9C778"/><path class="y" d="M24 15q0-8 8-8t8 8z" style="fill:#E9C778"/><path class="r n" d="M24 13.6h16v1.6H24z"/>`,
    prop: `<path class="o" d="M47 38l6 17 2-1-3-17z"/><path class="gr" d="M48 38q-3-6 0-8 1 4 2 6 1-4 4-5 1 3-2 7z"/>` }),
  daiku: who({ body: "#C9A46A", over: `<path class="br n" d="M18 46h28v2H18z"/>`,
    hat: `<path class="y" d="M20 20q0-12 12-12t12 12z"/><path class="y" d="M17 19h30v3H17z"/><path class="l" d="M32 8v5"/>`,
    prop: `<rect class="wd" x="50" y="34" width="3.4" height="20" rx="1" transform="rotate(25 51.7 44)"/><rect class="gy" x="45" y="31" width="13" height="6" rx="1.4" transform="rotate(25 51.5 34)" style="fill:#7C786F"/>` }),
  biyoshi: who({ body: "k", hair: `<path class="o" d="M19 24q-1-15 13-15 9 0 12 8 2-4 4-2-1 5-4 6-4-6-12-6-8 1-10 9z" style="fill:#C76A3A"/>`,
    over: `<path class="w n" d="M28 35l4 5 4-5z" style="fill:#EDEAE3"/>`,
    prop: `<circle class="l" cx="47" cy="49" r="2.6" style="stroke-width:1.8"/><circle class="l" cx="54" cy="50" r="2.6" style="stroke-width:1.8"/><path class="l" d="M48.6 47l9-13M52.4 48l-4-14" style="stroke-width:1.8"/>
    <rect class="r" x="6" y="40" width="11" height="3.4" rx="1"/><path class="l" d="M7.4 43v3M9.6 43v3M11.8 43v3M14 43v3"/>` }),
  haisha: who({ body: "sk", hair: `<path class="k" d="M20 22q0-12 12-12t12 12q-3-6-12-6t-12 6z"/>`,
    face: `<circle class="k n" cx="27.5" cy="23.5" r="1.5"/><circle class="k n" cx="36.5" cy="23.5" r="1.5"/><path class="w" d="M24 26h16v4q-8 4-16 0z" style="fill:#DDEFF7"/><path class="l" d="M24 27l-3-2M40 27l3-2" style="stroke-width:1"/>`,
    prop: `<path class="w" d="M45 31q4-3 7 0 3-3 7 0 2 6-1 12l-2 8-2.4-6h-2.2l-2.4 6-2-8q-3-6-2-12z"/><ellipse class="w n" cx="49" cy="34" rx="1.6" ry="1" opacity=".9"/>` }),
  bengoshi: who({ body: "k", over: `<path class="w" d="M27 35l5 8 5-8z"/><path class="nv" d="M31 37h2l.8 9-1.8 2-1.8-2z"/><circle class="g" cx="39.5" cy="40" r="2"/>`,
    hair: `<path class="k" d="M20 22q0-12 12-12t12 12q-6-3-13-4-5 1-11 4z"/>`,
    prop: `<path class="l" d="M53 34v20M48 54h10M46 36h14" style="stroke:#B8892E;stroke-width:2"/><path class="g" d="M43 44h7q-3.5 5-7 0zM56 44h7q-3.5 5-7 0z"/><path class="l" d="M46.5 36l-3 8M46.5 36l3 8M59.5 36l-3 8M59.5 36l3 8" style="stroke:#B8892E;stroke-width:1"/>` }),
  gaka: who({ body: "#E9E1CF", over: `<path class="r" d="M27 35h10l-5 5z"/>`,
    hat: `<path class="r" d="M19 16q4-8 15-7 10 1 11 6-12-2-26 1z"/><path class="l" d="M33 9l1-3"/>`,
    prop: `<path class="wd" d="M44 40q8-6 15-1t-1 9q-3 1-4-2-2-3-6 0-5 1-4-6z"/><circle class="r n" cx="49" cy="41" r="1.6"/><circle class="b n" cx="53.5" cy="40" r="1.6"/><circle class="y n" cx="57" cy="43" r="1.6"/><circle class="gr n" cx="56" cy="47" r="1.6"/>
    <path class="l" d="M10 54l10-16" style="stroke:#9A6A3A;stroke-width:2"/><path class="b" d="M19 36l3 1.4-1.4 2.4-3-1.4z"/>` }),
  uchu: who({ body: "w", legs: "w", hair: "",
    over: `<rect class="gy" x="27" y="39" width="10" height="7" rx="1" style="fill:#C9C4BA"/><circle class="r n" cx="30" cy="42.5" r="1.2"/><circle class="b n" cx="34" cy="42.5" r="1.2"/><path class="b n" d="M18 46h6v2.4h-6zM40 46h6v2.4h-6z"/>`,
    back: `<rect class="gy" x="15" y="34" width="34" height="16" rx="4" style="fill:#D8D4CB"/>`,
    hat: `<circle class="sk" cx="32" cy="23" r="14.5" style="fill:#CFE6F2;opacity:.55"/><path class="w n" d="M23 16q4-6 11-6" style="stroke:#fff;stroke-width:2;fill:none"/>`,
    prop: `<path class="y n" d="M55 6l1.6 3.6 3.6 1.6-3.6 1.6-1.6 3.6-1.6-3.6-3.6-1.6 3.6-1.6z"/><path class="y n" d="M8 10l1 2.4 2.4 1-2.4 1-1 2.4-1-2.4-2.4-1 2.4-1z"/>` }),
  /* ---------- 服 clothes ---------- */
  shatsu: `<path class="sk" d="M20 9L8 17l5 10 6-3v32h26V24l6 3 5-10L44 9q-6 5-12 5T20 9z"/>
    <path class="w" d="M24 8l8 8 8-8-2-2H26z"/><path class="l" d="M32 16v40"/>
    <circle class="w" cx="34.4" cy="23" r="1.3"/><circle class="w" cx="34.4" cy="31" r="1.3"/><circle class="w" cx="34.4" cy="39" r="1.3"/><circle class="w" cx="34.4" cy="47" r="1.3"/>
    <path class="l" d="M38 24h6v6.4h-6z"/>`,
  tshatsu: `<path class="r" d="M20 9L6 18l5 9 7-4v33h28V23l7 4 5-9-14-9q-3 6-12 6T20 9z"/>
    <path class="l" d="M22 10q10 9 20 0"/>
    <path class="w n" d="M32 26l2.4 5 5.4.7-4 3.8 1 5.4-4.8-2.6-4.8 2.6 1-5.4-4-3.8 5.4-.7z"/>`,
  zubon: `<path class="wd" d="M17 6h30l4 51H36.5L32 22l-4.5 35H13z" style="fill:#C9A46A"/>
    <rect class="br" x="17" y="6" width="30" height="5" rx="1"/><rect class="g" x="29.6" y="6.4" width="4.8" height="4.2" rx="1"/>
    <path class="l" d="M32 11v10M21 13q4 4 8 1M43 13q-4 4-8 1"/>`,
  sukato: `<rect class="r" x="19" y="9" width="26" height="5.4" rx="1"/>
    <path class="p" d="M19 14h26l11 38H8z"/>
    <path class="l" d="M25 14l-6 38M32 14v38M39 14l6 38"/><path class="r n" d="M9 46h46l1 4H8z" opacity=".5"/>`,
  wanpisu: `<path class="l" d="M24 4l2 10M40 4l-2 10" style="stroke-width:2"/>
    <path class="y" d="M24 13h16l2 14 14 27H8l14-27z"/>
    <path class="l" d="M22 27h20"/><path class="r" d="M22 26h20v3H22z"/>
    <circle class="w n" cx="20" cy="38" r="1.8"/><circle class="w n" cx="30" cy="44" r="1.8"/><circle class="w n" cx="42" cy="38" r="1.8"/><circle class="w n" cx="16" cy="49" r="1.8"/><circle class="w n" cx="46" cy="49" r="1.8"/><circle class="w n" cx="36" cy="33" r="1.8"/>`,
  kutsu: `<path class="br" d="M16 36q0-8 7-8h6q2 6 10 8l14 4q5 2 5 7v4H16z" style="fill:#7A4E2A"/>
    <path class="br" d="M6 44q0-8 7-8h6q2 6 10 8l14 4q5 2 5 7v3H6z"/>
    <path class="k" d="M6 55h42v3H6z"/><path class="l" d="M22 40l3 4M26 39l3 4" style="stroke:#F4E6C8"/>`,
  kutsushita: `<path class="w" d="M14 6h14v26l12 10q4 6-2 10-4 2-8-1L14 40z"/>
    <path class="r n" d="M14 10h14v3H14zM14 17h14v3H14zM14 24h14v3H14z"/><path class="r" d="M30 47q4-4 8-4 4 4-2 9-4 2-6-1z"/>
    <path class="w" d="M34 10h14v24l10 8q4 6-2 10-4 2-8-1L34 42z" style="fill:#F3EFE6"/>
    <path class="b n" d="M34 14h14v3H34zM34 21h14v3H34zM34 28h14v3H34z"/>`,
  boshi: `<ellipse class="wd" cx="32" cy="42" rx="28" ry="9" style="fill:#E9C778"/>
    <path class="wd" d="M16 41q0-24 16-24t16 24q-16 5-32 0z" style="fill:#E9C778"/>
    <path class="r" d="M16.4 36q15.6 5 31.2 0l.4 5q-16 5-32 0z"/><path class="r" d="M44 38l6 6-6 2z"/>`,
  megane: `<path class="l" d="M4 26l7-6M60 26l-7-6" style="stroke-width:2.4"/>
    <circle class="sk" cx="20" cy="32" r="11" style="fill:#E6F3FA"/><circle class="sk" cx="44" cy="32" r="11" style="fill:#E6F3FA"/>
    <circle class="l" cx="20" cy="32" r="11" style="stroke:#2E2B27;stroke-width:3"/><circle class="l" cx="44" cy="32" r="11" style="stroke:#2E2B27;stroke-width:3"/>
    <path class="l" d="M31 30q1-3 2 0" style="stroke:#2E2B27;stroke-width:2.6"/><path class="w n" d="M14 28q3-5 8-5M38 28q3-5 8-5" style="stroke:#fff;stroke-width:2;fill:none"/>`,
  koto: `<path class="wd" d="M21 6l-10 7 2 39h38l2-39-10-7-11 9z" style="fill:#C9A46A"/>
    <path class="wd" d="M21 6l11 24 11-24" style="fill:#B48E50"/><path class="l" d="M32 30v28"/>
    <path class="br" d="M12 36h40v4H12z"/><rect class="g" x="29.6" y="35.4" width="4.8" height="5" rx="1"/>
    <circle class="br" cx="28" cy="46" r="1.4"/><circle class="br" cx="36" cy="46" r="1.4"/><circle class="br" cx="28" cy="52" r="1.4"/><circle class="br" cx="36" cy="52" r="1.4"/>`,
  seta: `<path class="gr" d="M20 8L8 16l4 30 7-1V56h26V45l7 1 4-30-12-8q-4 6-12 6T20 8z"/>
    <path class="dg" d="M23 9q9 8 18 0l-1-2q-8 6-16 0z"/><path class="dg" d="M19 50h26v6H19zM10 41l9-1v5l-8 1z"/><path class="dg" d="M54 41l-9-1v5l8 1z"/>
    <path class="l" d="M20 26l4 4 4-4 4 4 4-4 4 4 4-4M20 34l4 4 4-4 4 4 4-4 4 4 4-4" style="stroke:#FFFDF8;stroke-width:1.6"/>`,
  jinzu: `<path class="b" d="M17 6h30l4 51H36.5L32 22l-4.5 35H13z" style="fill:#4A73B0"/>
    <rect class="b" x="17" y="6" width="30" height="5" rx="1" style="fill:#3C6098"/><circle class="g" cx="32" cy="8.6" r="1.6"/>
    <path class="l" d="M32 11v10M21 13q4 4 8 1M43 13q-4 4-8 1M15 50h12M37 50h12" style="stroke:#E6B23E;stroke-width:1.2;stroke-dasharray:2 1.4"/>`,
  mafura: `<path class="r" d="M18 7h28q5 0 5 5v7q0 5-5 5H18q-5 0-5-5v-7q0-5 5-5z"/>
    <path class="r" d="M19 21h11v31H19z"/><path class="r" d="M35 21h11l-2 29h-9z"/>
    <path class="w n" d="M19 30h11v3H19zM19 39h11v3H19zM35 30h10.4v3H35zM35 39h9.8v3H35zM16 13h32v2.4H16z"/>
    <path class="l" d="M20.5 52v5M23.5 52v5M26.5 52v5M29 52v5M36.5 50v5M39.5 50v5M42.5 50v5" style="stroke:#A8362C;stroke-width:1.6"/>`,
  tebukuro: `<path class="r" d="M8 28q0-14 10-14t10 14v14H8z"/><path class="r" d="M8 30q-6-6-2-11 4-2 6 4z"/><rect class="w" x="7" y="42" width="22" height="8" rx="2"/>
    <path class="b" d="M36 30q0-14 10-14t10 14v14H36z"/><path class="b" d="M56 32q6-6 2-11-4-2-6 4z"/><rect class="w" x="35" y="44" width="22" height="8" rx="2"/>
    <path class="w n" d="M14 26l4 4 4-4M42 28l4 4 4-4" style="stroke:#fff;stroke-width:1.6;fill:none"/>`,
  nekutai: `<path class="nv" d="M27 5h10l-1 7h-8z"/><path class="nv" d="M28 12h8l7 34-11 11-11-11z"/>
    <path class="r n" d="M28.6 18l7.6 5v3L28 20.4zM27.4 26l9.8 6.4v3l-10.8-7zM26.2 34.6l12 7.8v3L25 37z"/>`,
  pajama: `<path class="sk" d="M20 8L8 16l5 11 6-3v32h26V24l6 3 5-11-12-8q-6 4-12 4T20 8z" style="fill:#BFD7F0"/>
    <path class="w" d="M20 8l12 10 12-10" style="fill:none;stroke:#fff;stroke-width:2.4"/><path class="l" d="M32 18v38"/>
    <circle class="w" cx="34.6" cy="26" r="1.3"/><circle class="w" cx="34.6" cy="36" r="1.3"/><circle class="w" cx="34.6" cy="46" r="1.3"/>
    <path class="y n" d="M24 30a4 4 0 1 0 3 6 3.4 3.4 0 1 1-3-6z"/><path class="y n" d="M41 44l1 2.2 2.4.3-1.8 1.6.5 2.4-2.1-1.2-2.1 1.2.5-2.4-1.8-1.6 2.4-.3z"/>`,
  kaban: `<path class="l" d="M22 22q0-12 10-12t10 12" style="stroke:#7A4E2A;stroke-width:3.4"/>
    <rect class="br" x="10" y="22" width="44" height="34" rx="5"/>
    <path class="br" d="M10 27q0-5 5-5h34q5 0 5 5v9q-22 6-44 0z" style="fill:#7A4E2A"/>
    <rect class="g" x="28" y="34" width="8" height="6" rx="1.4"/>`,
  sunika: `<path class="w" d="M6 44q0-10 6-14l10-8q4-2 6 2l4 8q10 2 18 2 10 0 10 8v6H6z"/>
    <path class="b" d="M22 34q8 10 22 6l-2 6q-14 2-22-8z"/>
    <path class="l" d="M20 26l6 5M22 23l6 5M24 21l6 5" style="stroke-width:1.4"/>
    <path class="r" d="M5 50h55v5q-27 3-55 0z"/>`,
  udedokei: `<rect class="br" x="25" y="2" width="14" height="60" rx="4"/>
    <path class="l" d="M28 8h8M28 13h8M28 51h8M28 56h8" style="stroke:#5E3E22"/>
    <circle class="g" cx="32" cy="32" r="14"/><circle class="w" cx="32" cy="32" r="10.6"/>
    <path class="l" d="M32 32v-7M32 32l5 3" style="stroke-width:2"/><circle class="k n" cx="32" cy="32" r="1.4"/>
    <rect class="g" x="45" y="30" width="3.4" height="4" rx="1"/><ellipse class="w n" cx="26" cy="26" rx="2.4" ry="1.4" opacity=".6"/>`,
  kimono: `<path class="pu" d="M22 6L4 14l4 18 10-4v29h28V28l10 4 4-18L42 6l-10 10z"/>
    <path class="w" d="M22 6l10 22 10-22-3 0-7 15-7-15z"/>
    <rect class="g" x="18" y="30" width="28" height="9"/><path class="r n" d="M18 33h28v2.4H18z"/>
    <path class="p n" d="M24 46q2-3 4 0-2 3-4 0zM36 50q2-3 4 0-2 3-4 0zM10 20q2-3 4 0-2 3-4 0zM50 20q2-3 4 0-2 3-4 0z"/>`,

  /* ---------- 飲み物 drinks ---------- */
  mizu: `<rect class="sk" x="26" y="3" width="12" height="5" rx="1.4" style="fill:#4F7FC0"/>
    <path class="sk" d="M24 8h16v4q6 4 6 12v30q0 4-4 4H22q-4 0-4-4V24q0-8 6-12z" style="fill:#DDEFF7"/>
    <rect class="b" x="18" y="28" width="28" height="12"/><path class="w n" d="M26 31q6-3 12 2-6 3-12-2z"/>
    <path class="w n" d="M22 18q-1 6 0 8M22 44v6" style="stroke:#fff;stroke-width:2"/>`,
  oyu: `<path class="l" d="M22 14q-3-4 0-8M30 12q-3-4 0-8M38 14q-3-4 0-8" style="stroke:#A9A499;stroke-width:1.8"/>
    <path class="w" d="M14 20h32v30q0 6-6 6H20q-6 0-6-6z"/><path class="l" d="M46 26h4q5 0 5 7t-5 7h-4" style="stroke-width:3"/>
    <text x="30" y="44" text-anchor="middle" font-size="16" font-weight="700" fill="#D9483B" font-family="Hiragino Sans, Noto Sans JP, sans-serif">ゆ</text>`,
  kori: `<path class="sk" d="M8 34l12-6 12 6v14l-12 6-12-6z" style="fill:#CFE8F5"/><path class="l" d="M8 34l12 6 12-6M20 40v14"/>
    <path class="sk" d="M30 28l12-6 12 6v14l-12 6-12-6z" style="fill:#DDEFF7"/><path class="l" d="M30 28l12 6 12-6M42 34v14"/>
    <path class="sk" d="M18 16l12-6 12 6v12l-12 6-12-6z" style="fill:#E6F3FA"/><path class="l" d="M18 16l12 6 12-6M30 22v12"/>
    <path class="w n" d="M12 37l4 2M34 31l4 2M22 19l4 2" style="stroke:#fff;stroke-width:2"/>`,
  ocha: `<path class="l" d="M26 12q-3-4 0-8M36 12q-3-4 0-8" style="stroke:#A9A499;stroke-width:1.8"/>
    <path class="w" d="M16 16h32l-3 36q0 5-5 5H24q-5 0-5-5z" style="fill:#F2EEE2"/>
    <ellipse class="mt" cx="32" cy="17.6" rx="15" ry="2.6" style="fill:#9DBF5E"/>
    <path class="gr n" d="M17.6 30h29l-.4 5H18z" style="fill:#7A9A48"/><path class="dg" d="M27 42q5-6 10 0-5 6-10 0z" style="fill:#5E8C3A"/>`,
  gyunyu: `<path class="w" d="M18 18l6-10h16l6 10v38H18z"/><path class="w" d="M24 8l3-4h10l3 4z" style="fill:#EDEAE3"/>
    <path class="b" d="M18 28h28v16H18z"/><text x="32" y="40" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="Hiragino Sans, Noto Sans JP, sans-serif">MILK</text>
    <path class="l" d="M24 8l-6 10h28l-6-10"/>`,
  tonyu: `<rect class="w" x="18" y="12" width="28" height="44" rx="2" style="fill:#F4E9D2"/>
    <rect class="gr" x="18" y="12" width="28" height="9" rx="2" style="fill:#7FA35A"/><path class="l" d="M38 4l-2 9" style="stroke:#fff;stroke-width:2"/><rect class="w" x="36" y="2" width="3.4" height="4" rx="1" style="fill:#fff"/>
    <ellipse class="wd" cx="27" cy="37" rx="5" ry="6" style="fill:#D9B06A"/><ellipse class="wd" cx="37" cy="40" rx="5" ry="6" style="fill:#D9B06A"/><path class="gr" d="M30 30q4-6 8-4-2 5-8 4z"/>`,
  orenji: `<circle class="o" cx="44" cy="12" r="9"/><circle class="y n" cx="44" cy="12" r="6.4" style="fill:#F7C26B"/><path class="l" d="M44 6v12M38 12h12M40 8l8 8M48 8l-8 8" style="stroke:#EE8A3C;stroke-width:1"/>
    <path class="w" d="M16 14h28l-3 42H19z" style="fill:#F4F7F9"/><path class="o n" d="M17.3 24h25.4l-2.3 31H19.6z"/>
    <path class="l" d="M16 14h28l-3 42H19z"/><path class="l" d="M30 6l4 34" style="stroke:#D9483B;stroke-width:2.4"/>`,
  ringo: `<rect class="w" x="14" y="16" width="30" height="40" rx="2"/><path class="r n" d="M14 16h30v6H14z"/>
    <path class="r" d="M24 32q-6 0-6 8 0 10 7 10 2 0 4-1 2 1 4 1 7 0 7-10 0-8-6-8-3 0-5 2-2-2-5-2z"/><path class="gr" d="M29 32q0-5 5-6-1 5-5 6z"/>
    <path class="l" d="M38 16l4-12" style="stroke:#E6B23E;stroke-width:2.4"/><path class="w" d="M44 20h4v26h-4z" style="fill:#F2EEE2"/>`,
  kora: `<path class="k" d="M26 4h12v6q-2 4-2 8 6 8 2 16 4 10 2 22H24q-2-12 2-22-4-8 2-16 0-4-2-8z" style="fill:#4A2A1E"/>
    <rect class="r" x="25" y="4" width="14" height="5" rx="1"/><path class="r" d="M22.6 34h18.8v8H22.6z"/>
    <path class="w n" d="M26 37q6-3 12 2" style="stroke:#fff;stroke-width:1.6;fill:none"/><path class="w n" d="M29 14q-1 5 0 8" style="stroke:#fff;stroke-width:1.8;opacity:.5"/>`,
  saida: `<rect class="b" x="27" y="3" width="10" height="5" rx="1"/>
    <path class="sk" d="M27 8h10v6q8 6 8 16v24q0 4-4 4H23q-4 0-4-4V30q0-10 8-16z" style="fill:#E6F3FA"/>
    <rect class="b" x="19" y="32" width="26" height="12"/><path class="w n" d="M23 38h18" style="stroke:#fff;stroke-width:2"/>
    <circle class="w n" cx="26" cy="50" r="1.4"/><circle class="w n" cx="34" cy="48" r="1"/><circle class="w n" cx="30" cy="24" r="1.2"/><circle class="w n" cx="37" cy="27" r="1.4"/>`,
  supotsu: `<rect class="b" x="26" y="3" width="12" height="5" rx="1.4"/>
    <path class="sk" d="M24 8h16v4q6 4 6 12v30q0 4-4 4H22q-4 0-4-4V24q0-8 6-12z" style="fill:#E6F3FA"/>
    <rect class="w" x="18" y="26" width="28" height="18" style="fill:#FFFDF8"/><path class="b n" d="M18 26h28v5H18zM18 40h28v4H18z"/>
    <path class="b n" d="M24 33l3 0 2-3 2 7 2-4 4 0" style="stroke:#4F7FC0;stroke-width:1.6;fill:none"/>`,
  biru: `<path class="w" d="M13 12q0-6 8-6 4-4 10-2 6-2 10 2 8 0 8 6v4H13z"/>
    <path class="y" d="M14 16h32v36q0 4-4 4H18q-4 0-4-4z" style="fill:#F2B33C"/>
    <path class="l" d="M46 22h5q5 0 5 6v12q0 6-5 6h-5" style="stroke-width:3.4"/>
    <circle class="w n" cx="22" cy="30" r="1.4"/><circle class="w n" cx="30" cy="40" r="1"/><circle class="w n" cx="38" cy="26" r="1.2"/>
    <path class="w n" d="M18 20v28" style="stroke:#fff;stroke-width:2.4;opacity:.6"/>`,
  nihonshu: `<path class="w" d="M20 10h10v6q8 6 8 18 0 12-4 18q-2 4-9 4t-9-4q-4-6-4-18 0-12 8-18z" style="fill:#F2EEE2"/>
    <path class="nv n" d="M14.6 30h20.8v6H14.6z"/><path class="l" d="M22 10h6"/>
    <path class="w" d="M40 42h18l-2 12q-1 3-4 3h-6q-3 0-4-3z" style="fill:#F2EEE2"/><path class="nv n" d="M41.4 45h15.2l-.4 2H41.8z"/>
    <path class="g n" d="M28 6l1 2.2 2.4.3-1.8 1.6.5 2.4-2.1-1.2"/>`,
  shochu: `<rect class="br" x="26" y="2" width="12" height="7" rx="1.4" style="fill:#2E2B27"/>
    <path class="br" d="M27 9h10v8q10 4 10 14v23q0 4-4 4H21q-4 0-4-4V31q0-10 10-14z" style="fill:#6E4B28"/>
    <rect class="w" x="22" y="30" width="20" height="22" rx="1" style="fill:#F4ECD8"/>
    <text x="32" y="47" text-anchor="middle" font-size="14" font-weight="700" fill="#2E2B27" font-family="Hiragino Mincho ProN, Noto Serif JP, serif">焼</text>`,
  umeshu: `<rect class="r" x="16" y="6" width="32" height="6" rx="2"/>
    <path class="w" d="M14 14q0-2 4-2h28q4 0 4 2v38q0 6-6 6H20q-6 0-6-6z" style="fill:#F6E7B8"/>
    <circle class="mt" cx="24" cy="44" r="5" style="fill:#C9B24A"/><circle class="mt" cx="36" cy="46" r="5" style="fill:#B8A040"/><circle class="mt" cx="30" cy="36" r="5" style="fill:#D2BC55"/><circle class="mt" cx="40" cy="34" r="4.4" style="fill:#C9B24A"/>
    <path class="w n" d="M18 18v30" style="stroke:#fff;stroke-width:2.4;opacity:.7"/>`,
  wain: `<path class="w" d="M18 6h28q0 22-14 24Q18 28 18 6z" style="fill:#F4F7F9"/>
    <path class="r2" d="M18.6 14h26.8q-1 14-13.4 15.6Q19.6 28 18.6 14z" style="fill:#8E2238"/>
    <path class="l" d="M18 6h28q0 22-14 24Q18 28 18 6z"/><path class="l" d="M32 30v20" style="stroke-width:2.6"/>
    <ellipse class="w" cx="32" cy="54" rx="11" ry="3.4" style="fill:#F4F7F9"/><path class="w n" d="M22 10q0 10 4 14" style="stroke:#fff;stroke-width:2;fill:none"/>`,
  haiboru: `<path class="w" d="M18 6h28l-2 50H20z" style="fill:#F4F7F9"/>
    <path class="y n" d="M19 16h26l-1.6 39H20.6z" style="fill:#E8B04E"/>
    <rect class="sk" x="24" y="18" width="9" height="9" rx="1.4" style="fill:#F4F7F9;opacity:.85"/><rect class="sk" x="31" y="28" width="9" height="9" rx="1.4" style="fill:#F4F7F9;opacity:.85"/>
    <circle class="w n" cx="28" cy="44" r="1.4"/><circle class="w n" cx="36" cy="48" r="1.2"/><circle class="w n" cx="32" cy="40" r="1"/>
    <path class="l" d="M18 6h28l-2 50H20z"/><circle class="y" cx="44" cy="8" r="6" style="fill:#F5D84A"/><circle class="w n" cx="44" cy="8" r="3.6" style="fill:#FBEFA8"/>`,
  sawa: `<path class="w" d="M16 10h30v40q0 6-6 6H22q-6 0-6-6z" style="fill:#F4F7F9"/>
    <path class="y n" d="M17 18h28v32q0 5-5 5H22q-5 0-5-5z" style="fill:#F7EBA8"/>
    <path class="l" d="M46 18h4q5 0 5 6v12q0 6-5 6h-4" style="stroke-width:3"/>
    <circle class="y" cx="24" cy="10" r="8" style="fill:#F5D84A"/><circle class="w n" cx="24" cy="10" r="5.4" style="fill:#FBEFA8"/><path class="l" d="M24 5v10M19 10h10M20.4 6.4l7.2 7.2M27.6 6.4l-7.2 7.2" style="stroke:#E6B23E;stroke-width:1"/>
    <circle class="w n" cx="30" cy="40" r="1.4"/><circle class="w n" cx="38" cy="32" r="1.2"/>`,
  kakuteru: `<path class="w" d="M8 10h48L32 34z" style="fill:#F4F7F9"/><path class="p n" d="M13 14h38L32 31z" style="fill:#F28FB1"/>
    <path class="l" d="M8 10h48L32 34z"/><path class="l" d="M32 34v16" style="stroke-width:2.6"/><ellipse class="w" cx="32" cy="54" rx="11" ry="3.4" style="fill:#F4F7F9"/>
    <circle class="r" cx="40" cy="14" r="3.4"/><path class="l" d="M40 11q2-6 6-7" style="stroke:#3F7D56"/>
    <path class="y" d="M14 4l14 2-7 4z" style="fill:#F5CF52"/><path class="l" d="M21 8l3 10"/>`,
  shanpan: `<path class="dg" d="M14 4h8v8q6 4 6 12v30q0 3-3 3H11q-3 0-3-3V24q0-8 6-12z" style="fill:#2F5A3E"/>
    <path class="g" d="M13 3h10v9H13z"/><rect class="w" x="10" y="30" width="16" height="12" rx="1" style="fill:#F4ECD8"/><path class="g n" d="M12 34h12v2H12z"/>
    <path class="w" d="M42 14h12l-2 22q-1 4-4 4t-4-4z" style="fill:#F4F7F9"/><path class="y n" d="M42.6 20h10.8l-1.6 15q-1 3-3.8 3t-3.8-3z" style="fill:#F2DB8A"/>
    <path class="l" d="M42 14h12l-2 22q-1 4-4 4t-4-4z"/><path class="l" d="M48 40v12" style="stroke-width:2"/><ellipse class="w" cx="48" cy="55" rx="7" ry="2.4" style="fill:#F4F7F9"/>
    <circle class="w n" cx="46" cy="30" r="1"/><circle class="w n" cx="49" cy="26" r="1"/><circle class="w n" cx="47" cy="22" r=".8"/>`,

  /* ---------- コンビニ convenience store ---------- */
  sando: `<path class="w" d="M8 50L32 8l24 42z" style="fill:#F4F7F9"/>
    <path class="w" d="M13 46L32 13l19 33z" style="fill:#F2DDA6"/><path class="gr n" d="M18 40h28l-2 3H20z" style="fill:#7FB35A"/><path class="y n" d="M20 36h24l-2 3H22z" style="fill:#F5D84A"/><path class="p n" d="M23 31h18l-2 3H25z" style="fill:#F4A0A0"/>
    <path class="l" d="M8 50L32 8l24 42z"/><rect class="r" x="22" y="50" width="20" height="6" rx="1"/>`,
  karaage: `<path class="r" d="M14 26h36l-4 30H18z"/><path class="w n" d="M18 32h28l-.6 5H18.6z"/>
    <circle class="cr" cx="23" cy="22" r="7" style="fill:#C8823A"/><circle class="cr" cx="35" cy="20" r="8" style="fill:#B8732E"/><circle class="cr" cx="44" cy="24" r="6" style="fill:#C8823A"/>
    <path class="l" d="M20 20q3-2 5 0M32 17q3-2 6 0M42 22q2-2 4 0" style="stroke:#E8A85A"/><path class="l" d="M46 10l-6 12" style="stroke:#D3A26A;stroke-width:2.4"/>`,
  nikuman: `<path class="w" d="M8 44q0-26 24-26t24 26q0 10-24 10T8 44z" style="fill:#FBF7EE"/>
    <path class="l" d="M32 18l-1 10M32 18l-8 6M32 18l8 6M32 18l-12 3M32 18l12 3" style="stroke:#D8D0BE"/>
    <circle class="w n" cx="32" cy="19" r="2.6" style="fill:#EFE7D6"/><path class="wd" d="M6 52h52v4H6z" style="fill:#E9DCC0"/><ellipse class="w n" cx="20" cy="34" rx="4" ry="2" opacity=".9"/>`,
  aisu: `<path class="wd" d="M22 30h20l-10 28z" style="fill:#E0A85E"/><path class="l" d="M25 36l12 0M27 42h9M29 48h6" style="stroke:#B8732E"/>
    <path class="w" d="M20 30q-4-6 2-10-1-8 10-8 11 0 10 8 6 4 2 10z" style="fill:#FBF7EE"/>
    <path class="w" d="M26 14q2-10 6-10t6 10z" style="fill:#FBF7EE"/><path class="l" d="M24 22q8 3 16 0" style="stroke:#E6DDC8"/>`,
  chippusu: `<path class="y" d="M14 8h36l-2 6 2 6v28l-2 6 2 6H14l2-6-2-6V20l2-6z" style="fill:#F5CF52"/>
    <path class="l" d="M14 14h36M14 50h36" style="stroke:#C99A24"/>
    <ellipse class="o" cx="32" cy="32" rx="12" ry="9" style="fill:#F2B33C"/><path class="l" d="M24 30q8-4 16 0M25 35q7 3 14 0" style="stroke:#C8823A"/>
    <path class="r n" d="M18 20h28v4H18z"/>`,
  choko: `<path class="w" d="M10 22l38-10 6 22-38 10z" style="fill:#F4F7F9"/>
    <path class="br" d="M14 30l30-8 6 22-30 8z" style="fill:#5E3A22"/>
    <path class="l" d="M24 27.4l6 22M34 24.8l6 22M17 41l30-8" style="stroke:#3E2614"/>
    <path class="r" d="M30 44l26-7 2 8-26 7z"/><path class="g n" d="M34 46l18-5 .6 2-18 5z"/>`,
  kappumen: `<path class="w" d="M14 16h36l-4 40H18z"/><path class="r n" d="M15 24h34l-.8 8H15.8z"/>
    <ellipse class="w" cx="32" cy="16" rx="19" ry="4" style="fill:#E8E2D4"/><path class="w" d="M13 15q10-6 20-6l2 8q-12 0-22-2z" style="fill:#F4F7F9"/>
    <text x="32" y="46" text-anchor="middle" font-size="9" font-weight="700" fill="#D9483B" font-family="Hiragino Sans, Noto Sans JP, sans-serif">めん</text>`,
  shinbun: `<path class="w" d="M8 14h40l8 6v34H8z" style="fill:#F2EEE2"/><path class="l" d="M48 14v40"/>
    <text x="12" y="25" font-size="9" font-weight="700" fill="#2E2B27" font-family="Hiragino Mincho ProN, Noto Serif JP, serif">新聞</text>
    <rect class="gy" x="12" y="30" width="14" height="10" style="fill:#A9A499"/><path class="l" d="M30 30h14M30 34h14M30 38h14M12 44h32M12 48h32" style="stroke:#8E8A80"/>`,
  zasshi: `<rect class="p" x="14" y="6" width="36" height="50" rx="1" style="fill:#F28FB1"/>
    <text x="17" y="17" font-size="9" font-weight="800" fill="#fff" font-family="sans-serif">MAG</text>
    <circle class="c" cx="34" cy="34" r="7" style="fill:#F6D5B5"/><path class="k" d="M26 34q0-10 8-10t8 10q-3-5-8-5t-8 5z"/><path class="y" d="M24 56q0-12 10-12t10 12z"/>
    <path class="w n" d="M17 22h12M17 26h8" style="stroke:#fff;stroke-width:1.6"/>`,
  denchi: `<rect class="k" x="14" y="12" width="14" height="42" rx="2"/><rect class="gy" x="18" y="8" width="6" height="4" rx="1" style="fill:#C9C4BA"/><path class="g n" d="M14.8 12.8h12.4v14H14.8z"/>
    <rect class="k" x="36" y="12" width="14" height="42" rx="2"/><rect class="gy" x="40" y="8" width="6" height="4" rx="1" style="fill:#C9C4BA"/><path class="g n" d="M36.8 12.8h12.4v14H36.8z"/>
    <path class="l" d="M19 20h4M21 18v4M41 20h4M43 18v4" style="stroke:#2E2B27;stroke-width:1.6"/>`,
  haburashi: `<path class="b" d="M10 54l30-30 4 4-30 30q-2 2-4 0z" style="fill:#4F9BD9"/>
    <path class="w" d="M38 20l10-10 6 6-10 10z" style="fill:#F4F7F9"/><path class="l" d="M42 14l6 6M45 11l6 6" style="stroke:#9CCBEB"/>
    <path class="sk n" d="M44 8l8-6 2 2-6 8z" style="fill:#9CCBEB"/>`,
  masuku: `<path class="l" d="M10 26q-6 6 0 14M54 26q6 6 0 14" style="stroke-width:2"/>
    <path class="w" d="M10 22q22-6 44 0v22q-22 8-44 0z"/><path class="l" d="M12 30q20-4 40 0M12 36q20-4 40 0" style="stroke:#D8D4CB"/>`,
  waribashi: `<path class="w" d="M26 4h12l-1 54h-10z" style="fill:#F2E6C2"/><path class="l" d="M32 4v54" style="stroke:#C9A46A"/>
    <path class="w" d="M22 24h20v26H22z" style="fill:#F4F7F9"/><path class="r n" d="M22 28h20v3H22z"/><text x="32" y="44" text-anchor="middle" font-size="9" font-weight="700" fill="#D9483B" font-family="Hiragino Mincho ProN, Noto Serif JP, serif">箸</text>`,
  kitte: `<path class="w" d="M12 10h40v44H12z" style="fill:#FFFDF8"/>
    <rect class="sk" x="17" y="15" width="30" height="34" style="fill:#BFDDF0"/><path class="w" d="M20 44l10-16 6 8 3-4 7 12z"/><path class="w n" d="M27 33l3-5 3 5z"/><circle class="r" cx="40" cy="22" r="3.6"/>
    <path class="l" d="M12 14v4M12 22v4M12 30v4M12 38v4M12 46v4M52 14v4M52 22v4M52 30v4M52 38v4M52 46v4" style="stroke:#F3F0E8;stroke-width:2.4"/>`,
  judenki: `<rect class="w" x="12" y="12" width="20" height="22" rx="3"/><path class="l" d="M18 6v6M26 6v6" style="stroke:#A9A499;stroke-width:2.6"/>
    <path class="l" d="M22 34q0 14 14 14t14 6" style="stroke:#2E2B27;stroke-width:2.6"/>
    <rect class="k" x="44" y="50" width="10" height="7" rx="1.6"/><path class="g n" d="M20 18l-3 6h4l-2 6 6-8h-4l2-4z"/>`,
  gomibako: `<rect class="gy" x="14" y="16" width="36" height="40" rx="2" style="fill:#7C9B8A"/>
    <rect class="gy" x="11" y="10" width="42" height="7" rx="2" style="fill:#5E7C6C"/><path class="l" d="M28 10V6h8v4"/>
    <path class="l" d="M22 24v26M32 24v26M42 24v26" style="stroke:#5E7C6C;stroke-width:2"/>
    <path class="w n" d="M28 34l4-4 4 4M32 30v10" style="stroke:#fff;stroke-width:1.8;fill:none"/>`,
  rejibukuro: `<path class="l" d="M18 22q0-14 6-14t6 14M34 22q0-14 6-14t6 14" style="stroke:#D8D4CB;stroke-width:3.4"/>
    <path class="w" d="M12 22h40l-4 34H16z" style="fill:#FBFAF6"/><path class="l" d="M12 22h40" style="stroke:#D8D4CB"/>
    <path class="o n" d="M18 26h28v3H18z" style="fill:#3FA36A"/><path class="b n" d="M18 30h28v2H18z" style="fill:#F2A23A"/>
    <circle class="o" cx="40" cy="14" r="5" style="fill:#F2A23A"/><path class="gr" d="M38 9q2-4 5-3-1 4-5 3z"/>`,
  renji: `<rect class="w" x="6" y="14" width="52" height="36" rx="3"/>
    <rect class="k" x="10" y="18" width="32" height="28" rx="2" style="fill:#3B342D"/><rect class="sk n" x="13" y="21" width="26" height="22" rx="1" style="fill:#5A5650"/>
    <ellipse class="y n" cx="26" cy="38" rx="9" ry="2.4" style="fill:#F5CF52;opacity:.6"/>
    <rect class="gr" x="46" y="20" width="8" height="5" rx="1" style="fill:#7FD19B"/><circle class="gy" cx="50" cy="31" r="2.4"/><circle class="gy" cx="50" cy="39" r="2.4"/>
    <rect class="gy" x="10" y="50" width="6" height="4"/><rect class="gy" x="48" y="50" width="6" height="4"/>`,
  atm: `<rect class="sk" x="12" y="6" width="40" height="52" rx="3" style="fill:#6D95C8"/>
    <rect class="k" x="17" y="11" width="30" height="20" rx="1.4" style="fill:#3B342D"/><rect class="sk n" x="19" y="13" width="26" height="16" rx="1" style="fill:#9FD3E8"/>
    <text x="32" y="25" text-anchor="middle" font-size="8" font-weight="800" fill="#2F4B7C" font-family="sans-serif">ATM</text>
    <rect class="gy" x="17" y="34" width="16" height="12" rx="1" style="fill:#D8D4CB"/><path class="l" d="M20 37h3M25 37h3M20 40h3M25 40h3M20 43h3M25 43h3"/>
    <rect class="k" x="37" y="35" width="10" height="2.6" rx="1"/><rect class="k" x="37" y="42" width="10" height="3" rx="1"/><rect class="w n" x="40" y="44" width="6" height="6" style="fill:#7FD19B"/>`,
  kopiki: `<rect class="w" x="8" y="18" width="48" height="38" rx="3" style="fill:#EDEAE3"/>
    <path class="gy" d="M10 12h44v8H10z" style="fill:#C9C4BA"/><path class="gy" d="M14 12l4-6h28l4 6z" style="fill:#A9A499"/>
    <rect class="k" x="38" y="22" width="14" height="8" rx="1" style="fill:#3B342D"/><rect class="sk n" x="39.4" y="23.4" width="11.2" height="5.2" style="fill:#9FD3E8"/>
    <path class="l" d="M12 34h40M12 44h40"/><rect class="w" x="16" y="24" width="16" height="6" style="fill:#FFFDF8"/>
    <rect class="gr" x="44" y="34" width="5" height="5" rx="1" style="fill:#7FD19B"/>`,
};

function toyArt(id, cls = "") {
  return `<svg class="toy ${cls}" viewBox="0 0 64 64" aria-hidden="true">${TOY_ART[id] || ""}</svg>`;
}

/* ---------- the machine, a capsule, a coin ---------- */

/* The capsule machine: a glass dome of capsules on a red body, a handle
   that turns (.gm-knob, rotated by css on .turning) and the chute a capsule
   drops into (.gm-drop). */
const GACHA_HUES = ["#F4A9B8", "#F5CF52", "#4F7FC0", "#6BAF73", "#EE8A3C", "#B9DDF0", "#8E5A9A", "#D9483B"];
function gachaMachine() {
  const caps = [[70, 92], [96, 100], [124, 94], [82, 70], [110, 74], [58, 112], [140, 114], [100, 124], [76, 120], [124, 122], [96, 52], [128, 54], [66, 50]];
  return `<svg class="toy gm-art" viewBox="0 0 200 270" aria-hidden="true">
    <rect class="r2" x="50" y="252" width="22" height="12" rx="3"/><rect class="r2" x="128" y="252" width="22" height="12" rx="3"/>
    <rect class="r" x="36" y="146" width="128" height="108" rx="12"/>
    <rect class="w" x="56" y="158" width="88" height="22" rx="4"/>
    <text x="100" y="175" text-anchor="middle" font-size="16" font-weight="700" fill="#D9483B" font-family="Hiragino Sans, Noto Sans JP, sans-serif">ガチャ</text>
    <g class="gm-knob"><circle class="w" cx="100" cy="206" r="20"/><rect class="k" x="84" y="202" width="32" height="8" rx="4"/></g>
    <rect class="k" x="138" y="196" width="12" height="20" rx="3"/><rect class="g n" x="142" y="200" width="4" height="12" rx="1"/>
    <rect class="k" x="70" y="232" width="60" height="18" rx="5"/>
    <g class="gm-drop"><circle class="n" cx="100" cy="241" r="7" style="fill:#F5CF52"/></g>
    <rect class="r" x="44" y="138" width="112" height="14" rx="6"/>
    <circle class="sk gm-dome" cx="100" cy="86" r="66" style="fill:#E3F2F9"/>
    <g class="gm-caps">${caps.map(([x, y], i) => `<g transform="translate(${x} ${y}) rotate(${(i * 47) % 180})"><circle class="w" r="13"/><path class="n" d="M-13 0a13 13 0 0 1 26 0z" style="fill:${GACHA_HUES[i % GACHA_HUES.length]}"/><path class="l" d="M-13 0h26"/></g>`).join("")}</g>
    <path class="n" d="M58 54q16-30 52-34" style="fill:none;stroke:#fff;stroke-width:6;opacity:.75;stroke-linecap:round"/>
    <circle class="l" cx="100" cy="86" r="66"/>
    <rect class="r" x="84" y="14" width="32" height="10" rx="4"/>
  </svg>`;
}

/* One capsule, closed — its two halves are .cap-top and .cap-bot, which
   come apart when it's opened. A rare toy comes in gold. */
/* hue "rainbow": the big one that holds every turn of "Turn them all" */
function capsuleArt(hue, rare, cls = "") {
  const rainbow = hue === "rainbow";
  const top = rainbow ? "url(#capRainbow)" : rare ? "#E6B23E" : hue;
  return `<svg class="toy capsule ${cls}" viewBox="0 0 100 100" aria-hidden="true">
    ${rainbow ? `<defs><linearGradient id="capRainbow" x1="0" y1="0" x2="1" y2="0">${GACHA_HUES.slice(0, 7).map((c, i) => `<stop offset="${(i / 6).toFixed(3)}" stop-color="${c}"/>`).join("")}</linearGradient></defs>` : ""}
    <g class="cap-bot"><path class="w" d="M10 52a40 40 0 0 0 80 0z" style="fill:${rare || rainbow ? "#FBE7A8" : "#FFFDF8"}"/></g>
    <g class="cap-top"><path class="n" d="M10 50a40 40 0 0 1 80 0z" style="fill:${top};stroke:#3B342D;stroke-width:2"/>
      <rect class="n" x="6" y="46" width="88" height="8" rx="3" style="fill:${top};stroke:#3B342D;stroke-width:2"/>
      <path class="n" d="M24 30q10-14 26-16" style="fill:none;stroke:#fff;stroke-width:5;opacity:.7;stroke-linecap:round"/></g>
  </svg>`;
}

/* 小銭: a coin with a hole, like the five-yen piece */
function coinArt(cls = "") {
  return `<svg class="toy coin ${cls}" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.4" style="fill:#E6B23E;stroke:#9A6A1E;stroke-width:1.4"/><circle cx="10" cy="10" r="2.6" style="fill:var(--sheet, #FBFAF6);stroke:#9A6A1E;stroke-width:1.2"/></svg>`;
}
