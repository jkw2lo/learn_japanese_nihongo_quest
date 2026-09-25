/* Nihongo Quest — the Grammar tab: a reference to come back to.

   How a sentence is built, what each particle does, the polite endings on
   one table, and every pattern — the ones you've learned open to their
   examples; the ones still to come are there to look ahead at. */

/* Authored text that mixes HTML emphasis with furigana markup: only the
   {漢字|かな} runs are converted — the rest is ours, and trusted. */
const richHtml = s => s.replace(/\{[^|}]+\|[^}]+\}/g, m => wordHtml(m));

function renderGrammar() {
  loadBundle("grammar");
  const el = $("#v-grammar");
  const shape = SENTENCE_SHAPE;
  const learnedN = learnedPatterns().length;

  const shapeHtml = `<section class="card g-shape">
    <div class="card-head"><h2>How a sentence is built</h2>
      <button class="link" data-act="say" data-say="${esc(furiKana(SHAPE_SENTENCE))}">${icon("speaker")} Hear it</button></div>
    <div class="g-chunks" lang="ja">${shape.chunks.map(([jp, role, note], i) => `
      <div class="g-chunk ${i === shape.chunks.length - 1 ? "verb" : ""}"><span class="g-jp">${wordHtml(jp)}</span>
        <span class="g-role">${esc(role)}</span>${note ? `<small>${esc(note)}</small>` : ""}</div>`).join("")}</div>
    <p class="g-en">${esc(shape.en)}</p>
    <ul class="g-points">${shape.points.map(p => `<li>${richHtml(p)}</li>`).join("")}</ul>
  </section>`;

  const particlesHtml = `<section class="card">
    <div class="card-head"><h2>Particles</h2><span class="count">the little words that say what each part is doing · tap to hear</span></div>
    <div class="g-parts">${PARTICLE_GUIDE.map(([p, r, job, ex, en]) => `
      <button class="g-part" data-act="say" data-say="${esc(furiKana(ex))}">
        <span class="g-p" lang="ja">${esc(p)}</span><span class="g-r">${esc(r)}</span>
        <span class="g-job">${esc(job)}</span>
        <span class="g-ex" lang="ja">${wordHtml(ex)}</span><span class="g-exen">${esc(en)}</span>
      </button>`).join("")}</div>
  </section>`;

  const endingsHtml = `<section class="card">
    <div class="card-head"><h2>Endings at a glance</h2><span class="count">polite forms — what you'd say to a stranger</span></div>
    <div class="g-table-wrap"><table class="g-table">
      <thead><tr><th></th><th>now</th><th>not</th><th>past</th><th>past, not</th></tr></thead>
      <tbody>${ENDINGS.map(([kind, a, b, c, d, ex]) => `<tr><th>${esc(kind)}<small lang="ja">${wordHtml(ex)}</small></th>${[a, b, c, d].map(x => `<td lang="ja">${esc(x)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>
    <p class="muted small">The casual forms friends use — <span lang="ja">${wordHtml("{行|い}く, {行|い}かない, {行|い}った")}</span> — come in stage 10.</p>
  </section>`;

  const patternRow = p => {
    const on = isLearned(p.key);
    return `<details class="pat-item ${on ? "" : "ahead"}">
      <summary><span class="pat-name" lang="ja">${on ? "" : icon("lock")}${wordHtml(p.pat)}</span><span class="pat-m">${esc(p.m)}</span></summary>
      <p class="small">${wordHtml(p.note)}</p>
      ${p.ex.map(e => `<button class="ex-sent" data-act="say" data-say="${esc(e.kana)}"><span lang="ja">${e.gap ? gapHtml(e, e.gap) : wordHtml(e.jp)}</span><small>${esc(e.en)}</small></button>`).join("")}
      ${on ? "" : `<p class="muted tiny">Taught in stage ${p.st}.</p>`}
    </details>`;
  };
  const patternsHtml = WORD_STAGES.filter(S => PATTERNS.some(p => p.st === S.st)).map(S => `
    <section class="card">
      <div class="card-head"><h2><span lang="ja">${esc(S.jp)}</span> ${esc(S.en)}</h2><span class="count">stage ${S.st}</span></div>
      <div class="pat-list">${PATTERNS.filter(p => p.st === S.st).map(patternRow).join("")}</div>
    </section>`).join("");

  el.innerHTML = `
    <div class="g-head">
      <div><div class="eyebrow">文法 · Grammar</div>
        <h1>The shapes Japanese comes in.</h1>
        <p class="lede">A reference to come back to. You learn each pattern in its lesson; this is the whole map.
          ${learnedN} of ${PATTERNS.length} patterns learned.</p></div>
      ${learnedN ? `<button class="btn cta" data-act="deeper" data-kind="g">Practise the patterns you know</button>` : ""}
    </div>
    <div class="g-grid">
      <div>${shapeHtml}${endingsHtml}</div>
      <div>${particlesHtml}</div>
    </div>
    <h2 class="g-sub">All the patterns</h2>
    ${patternsHtml}`;
}
