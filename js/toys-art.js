/* Nihongo Quest — the capsule toys, drawn (see js/data/toys.js).

   Little vinyl figures: flat colour, a dark outline, a highlight. Like the
   painted places, they have their own light — the same colours by day or
   night — so the palette is fixed here (css: .toy), not theme tokens. Each
   is a 64×64 drawing standing on y≈58. Fill classes:
     w white  c cream  r red  r2 deep red  g gold  k ink  p pink  b blue
     nv navy  sk sky  gr green  dg deep green  br brown  wd wood  o orange
     y yellow  gy grey  pu purple  mt matcha  cr caramel  sl salmon
   and two modifiers: n (no outline: a detail on top) and l (a line, no fill). */

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
function capsuleArt(hue, rare) {
  const top = rare ? "#E6B23E" : hue;
  return `<svg class="toy capsule" viewBox="0 0 100 100" aria-hidden="true">
    <g class="cap-bot"><path class="w" d="M10 52a40 40 0 0 0 80 0z" style="fill:${rare ? "#FBE7A8" : "#FFFDF8"}"/></g>
    <g class="cap-top"><path class="n" d="M10 50a40 40 0 0 1 80 0z" style="fill:${top};stroke:#3B342D;stroke-width:2"/>
      <rect class="n" x="6" y="46" width="88" height="8" rx="3" style="fill:${top};stroke:#3B342D;stroke-width:2"/>
      <path class="n" d="M24 30q10-14 26-16" style="fill:none;stroke:#fff;stroke-width:5;opacity:.7;stroke-linecap:round"/></g>
  </svg>`;
}

/* 小銭: a coin with a hole, like the five-yen piece */
function coinArt(cls = "") {
  return `<svg class="toy coin ${cls}" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.4" style="fill:#E6B23E;stroke:#9A6A1E;stroke-width:1.4"/><circle cx="10" cy="10" r="2.6" style="fill:var(--sheet, #FBFAF6);stroke:#9A6A1E;stroke-width:1.2"/></svg>`;
}
