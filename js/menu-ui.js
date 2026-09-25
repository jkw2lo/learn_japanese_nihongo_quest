/* Nihongo Quest — Read a Menu: the side quest.

   A menu you read as you learn: each kana you know is inked in, the rest
   stay faint, and a dish you can read tells you what it is when you tap it.
   The game on the side is ordering for a friend — they tell you what they
   want in English, you find it on the menu — and it ends with a receipt,
   the total in yen, and what you'd say to order. It's practice: nothing
   here touches the review schedule. */

let menuId = "cafe";
let game = null;          /* { menu, targets, i, got, wrong } */
const revealed = new Set();

const menuOpen = M => M.tier === 1 ? kataOpen() : WORDS.filter(x => x.st === 5).every(x => isLearned(x.key));
const canReadItem = it => it.units.every(isLearned);
const numbersKnown = () => WORDS.filter(x => x.st === 3).every(x => isLearned(x.key));
const yen = n => "¥" + n.toLocaleString("en-US");

/* The shop curtain that hangs over a Japanese doorway, with the shop's
   name across it. */
function noren(text, cls = "") {
  const panels = [0, 1, 2].map(i => `<path class="nr-panel" d="M${14 + i * 64} 16h60v58q-30 8-60 0z"/>`).join("");
  return `<svg class="noren ${cls}" viewBox="0 0 220 86" aria-hidden="true">
    <rect class="nr-pole" x="4" y="8" width="212" height="8" rx="4"/>
    ${panels}
    <text class="nr-text" x="110" y="52" text-anchor="middle" lang="ja">${esc(text)}</text>
  </svg>`;
}

/* A dish's name, each kana inked if you know it. Diner dishes have kanji,
   and by then every kana is yours, so they're shown with furigana. */
function inked(it) {
  if (/[{]/.test(it.w)) return wordHtml(it.w);
  return it.units.map(u => `<span class="${isLearned(u) ? "" : "faint"}">${esc(u)}</span>`).join("");
}

function menuCardHtml() {
  const M = MENUS[0];
  const open = menuOpen(M);
  const items = menuItems(M);
  const n = items.filter(canReadItem).length;
  const orders = state.menu.days[today()] || 0;
  return `<section class="card menu-card">
    ${noren("さくら", "mini")}
    <div class="menu-card-text">
      <div class="eyebrow">メニュー · Read a Menu</div>
      ${open
        ? `<b lang="ja">カフェ さくら</b> — you can read ${n} of ${items.length} things on it${menuOpen(MENUS[1]) ? `, and <b lang="ja">まるや</b>, the diner, is open` : ""}${orders ? ` · ${orders} order${orders > 1 ? "s" : ""} today` : ""}.`
        : `A café menu, all in katakana. It opens with katakana — then it inks itself in as you learn.`}
    </div>
    <button class="btn btn-sm ${open ? "" : "btn-ghost"}" data-act="nav" data-nav="menu">${open ? "Open the menu" : "Have a look"}</button>
  </section>`;
}

function renderMenu() {
  const el = $("#v-menu");
  const M = MENUS.find(m => m.id === menuId) || MENUS[0];
  const open = menuOpen(M);
  const items = menuItems(M);
  const readable = items.filter(canReadItem);
  const target = game && !game.done ? game.targets[game.i] : null;

  const row = (it, key) => {
    const ok = canReadItem(it);
    const cls = [ok ? "" : "dim", revealed.has(key) ? "open" : "", game?.got?.includes(key) ? "got" : "", game?.wrong === key ? "wrong" : ""].join(" ");
    return `<li><button class="mi ${cls}" data-act="mi" data-k="${esc(key)}">
      <span class="mi-name" lang="ja">${inked(it)}</span><span class="mi-dots"></span><span class="mi-price">${yen(it.price)}</span>
      <span class="mi-m">${ok ? esc(it.m) : ""}</span>
    </button></li>`;
  };

  const tabs = MENUS.map(m => `<button class="${m.id === M.id ? "on" : ""}" data-act="menu-pick" data-id="${m.id}">
    ${menuOpen(m) ? "" : icon("lock")} <span lang="ja">${furiPlain(m.name)}</span></button>`).join("");

  let side;
  if (!open) {
    side = `<section class="card">${neko("sleepy", "mini")}
      <p>${M.tier === 1 ? "The café opens with katakana. You can look now — the faint kana are the ones you don't know yet." : "The diner opens once the food words — stage 5 — are yours."}</p></section>`;
  } else if (game && game.done) {
    const got = game.targets;
    const total = got.reduce((t, it) => t + it.price, 0);
    side = `<section class="card receipt">
      <div class="celebrate">${neko("cheer", "hop mini")}${stamp("ごちそうさま", "mini-long")}</div>
      <div class="eyebrow">レシート · Receipt</div>
      <ul class="rc">${got.map(it => `<li><span lang="ja">${wordHtml(it.w)}</span><span class="mi-dots"></span><span>${yen(it.price)}</span></li>`).join("")}</ul>
      <div class="rc-total"><span>Total</span><b>${yen(total)}</b></div>
      ${numbersKnown() ? `<p class="rc-say" lang="ja">${esc(numberKana(total))}えん</p>` : `<p class="muted tiny">Stage 3 teaches you to say that total.</p>`}
      <div class="eyebrow">To order, you'd say</div>
      ${got.map(it => `<button class="ex-sent" data-act="say" data-say="${esc(it.kana)}"><span lang="ja">${wordHtml(it.w)}をください</span><small>${esc(it.m)}, please</small></button>`).join("")}
      <p class="muted tiny">${game.misses ? `${game.misses} wrong turn${game.misses > 1 ? "s" : ""} on the way.` : "Straight to every one."}</p>
      <button class="btn cta" data-act="menu-game">Another order</button>
    </section>`;
  } else if (game) {
    side = `<section class="card order">
      <div class="order-head">${neko("think", "mini")}<div>
        <div class="eyebrow">Order ${game.i + 1} of ${game.targets.length}</div>
        <p class="order-ask">Your friend would like <b>${esc(target.m)}</b>.</p>
        <p class="muted tiny">Find it on the menu and tap it.</p>
      </div></div>
      ${game.msg ? `<p class="order-msg">${game.msg}</p>` : ""}
      <div class="order-dots">${game.targets.map((_, i) => `<i class="${i < game.i ? "on" : ""}"></i>`).join("")}</div>
      <button class="btn btn-ghost btn-sm" data-act="menu-quit">Stop</button>
    </section>`;
  } else {
    side = `<section class="card order">
      <div class="order-head">${neko("happy", "mini bob")}<div>
        <div class="eyebrow">注文 · Order for a friend</div>
        <p>They say what they want in English; you find it on the menu. Three things, then the bill.</p>
      </div></div>
      ${readable.length >= 4 ? `<button class="btn cta" data-act="menu-game">Take an order</button>`
        : `<p class="muted small">You need to be able to read four things on the menu first — ${readable.length} so far.</p>`}
      <p class="muted tiny">${state.menu.orders} order${state.menu.orders === 1 ? "" : "s"} taken so far.</p>
    </section>`;
  }

  el.innerHTML = `
    <div class="chart-head">
      <button class="link" data-act="nav" data-nav="today">${icon("back")} Today</button>
      <div class="seg">${tabs}</div>
      <span class="muted">${open ? `${readable.length} of ${items.length} you can read · tap one to hear it` : ""}</span>
    </div>
    <div class="menu-layout">
      <section class="card menu-board ${open ? "" : "locked"}">
        ${noren(furiPlain(M.name).split(" ").pop(), M.tier === 2 ? "diner" : "")}
        <h1 class="menu-name" lang="ja">${wordHtml(M.name)}</h1>
        <div class="menu-en">${esc(M.en)}</div>
        ${M.sections.map((S, si) => `<div class="menu-sec">
          <h3><span lang="ja">${wordHtml(S.jp)}</span> <small>${esc(S.en)}</small></h3>
          <ul class="mi-list">${S.items.map((it, ii) => row(it, `${M.id}:${si}:${ii}`)).join("")}</ul>
        </div>`).join("")}
      </section>
      <aside class="menu-side">
        ${side}
        <section class="card">
          <div class="eyebrow">Useful at the table</div>
          ${MENU_PHRASES.map(([jp, en]) => `<button class="ex-sent" data-act="say" data-say="${esc(furiKana(jp).replace("〜", ""))}">
            <span lang="ja">${wordHtml(jp)}</span><small>${esc(en)}</small></button>`).join("")}
        </section>
      </aside>
    </div>`;
}

function itemByKey(key) {
  const [id, si, ii] = key.split(":");
  return MENUS.find(m => m.id === id).sections[+si].items[+ii];
}

function tapItem(key) {
  const it = itemByKey(key);
  const M = MENUS.find(m => m.id === menuId);
  if (!menuOpen(M)) { toast("Not open yet — this is a preview."); return; }
  if (!canReadItem(it)) {
    const miss = [...new Set(it.units.filter(u => !isLearned(u)))];
    toast(`You'll read this once you know ${miss.join(" ")}.`);
    return;
  }
  say(it.kana);
  if (game && !game.done) {
    const want = game.targets[game.i];
    if (it === want) {
      game.got.push(key);
      game.i++;
      game.msg = "";
      game.wrong = null;
      if (game.i >= game.targets.length) {
        game.done = true;
        state.menu.orders++;
        state.menu.days[today()] = (state.menu.days[today()] || 0) + 1;
        day().n++;
        save();
        crumb("menu order done");
        renderMenu();
        petals($("#v-menu").closest("main") || document.body, 20);
        return;
      }
    } else {
      game.misses++;
      game.wrong = key;
      game.msg = `That's <b>${esc(it.m)}</b> — keep looking.`;
    }
    renderMenu();
    return;
  }
  revealed.has(key) ? revealed.delete(key) : revealed.add(key);
  renderMenu();
}

function startMenuGame() {
  const M = MENUS.find(m => m.id === menuId);
  const pool = menuItems(M).filter(canReadItem);
  if (pool.length < 4) return;
  game = { menu: M.id, targets: sample(pool, 3), i: 0, got: [], misses: 0, msg: "", done: false };
  crumb("menu order start");
  renderMenu();
}

/* Tier-2 dishes are recorded with the word stages. */
Object.assign(ACTS, {
  mi: el => tapItem(el.dataset.k),
  "menu-pick": el => { menuId = el.dataset.id; game = null; renderMenu(); },
  "menu-game": () => startMenuGame(),
  "menu-quit": () => { game = null; renderMenu(); },
});
