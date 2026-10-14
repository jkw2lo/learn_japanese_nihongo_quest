/* Films the trailer's clips from the real app:  node tools/trailer/shoot.mjs [shot …]
   Needs the dev server (node tools/server.mjs) and Playwright (see cam.mjs).
   Writes trailer/clips/<shot>.mp4 + .jpg, and trailer/clips/said.json. */

import { open, film, tap, drag, pan, sleep } from './cam.mjs';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';

const OUT = fileURLToPath(new URL('../../trailer/clips/', import.meta.url));
mkdirSync(OUT, { recursive: true });

/* Write `glyph` into the open writing pad from its own stroke data, at a
   hand's pace, a little wobbly. */
async function write(page, glyph, { wobble = 14 } = {}) {
  await page.waitForFunction(g => window.NQ_STROKES && NQ_STROKES[g], glyph);
  const strokes = await page.evaluate(g => modelMedians(g), glyph);
  const r = await page.locator('#padInk').boundingBox();
  const to = ([x, y]) => [r.x + x / 1024 * r.width, r.y + y / 1024 * r.height];
  let seedN = glyph.codePointAt(0);
  const rnd = () => ((seedN = (seedN * 9301 + 49297) % 233280) / 233280 - .5) * wobble;
  for (const st of strokes) {
    const pts = st.map(p => to([p[0] + rnd(), p[1] + rnd()]));
    const len = pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
    await drag(page, pts, { ms: 140 + len * 1.7 });
    await sleep(220);
  }
}

const DESK = { w: 1440, h: 900 };
/* a place, opened and framed */
async function place(page, id, sel) {
  await page.evaluate(id => { go('menu'); menuId = id; renderMenu(); }, id);
  await sleep(900);
  if (sel) await page.evaluate(sel => document.querySelector(sel)?.scrollIntoView({ block: 'center' }), sel);
  await sleep(300);
}
const click = (page, sel) => tap(page, sel);
/* the k-th of sel that's actually in view (belts and shelves hold more than they show) */
async function inView(page, sel, k = 0) {
  const i = await page.evaluate(([sel, k]) => {
    const all = [...document.querySelectorAll(sel)];
    const seen = all.map((e, i) => [e, i]).filter(([e]) => {
      const r = e.getBoundingClientRect(); let p = e.parentElement;
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (r.width < 4 || x < 0 || x > innerWidth || y < 0 || y > innerHeight) return false;
      while (p) { const q = p.getBoundingClientRect(), cs = getComputedStyle(p);
        if (/(hidden|auto|scroll|clip)/.test(cs.overflowX + cs.overflow) && (x < q.left || x > q.right)) return false; p = p.parentElement; }
      return true;
    });
    return seen[Math.min(k, seen.length - 1)]?.[1] ?? -1;
  }, [sel, k]);
  if (i < 0) throw new Error(`nothing in view for ${sel}`);
  return page.locator(sel).nth(i);
}

const SHOTS = {
  /* the station: the right train, a seat, the doors, the tunnel */
  async ride() {
    const { browser, page } = await open(DESK);
    await place(page, 'station', '.sn-station');
    await page.evaluate(() => {
      const to = '新宿';
      trip.ticket = { from: hereSt(), to, who: 'adult', fare: fareFor(to, 'adult') };
      const n = [1, 2, 3, 4].find(n => trainAt(n).dir === bestDir(hereSt(), to));
      snGo(pairOf(n), n % 2 ? 0 : 1, 'u');
      trip.pop = null; kbDraw();
      document.querySelector('.sn-station').scrollIntoView({ block: 'center' });
    });
    await sleep(800);
    const r = await film(page, OUT, 'ride', async () => {
      await sleep(700);
      await click(page, '.sv-tdoor');
      await sleep(2200);
      await click(page, '[data-act="sn-board"]');
      await sleep(1500);
      await click(page, '[data-act="sn-sit"]');
      await sleep(1700);
      await click(page, '[data-act="sn-pop-ok"]');
      await sleep(2800);
      await click(page, '[data-act="sn-pop-ok"]');
      await sleep(1600);
      await click(page, '[data-act="sn-pop-ok"]');
      await sleep(2000);
    }, { crop: '.sn-station' });
    await browser.close();
    return r;
  },

  /* the cold open: asked for ツ, write シ — it reads it as シ — then ツ */
  async write() {
    const { browser, page } = await open({ settings: { writeCheck: 'read', autoplay: true } });
    await page.waitForFunction(() => window.NQ_STROKES);
    await page.evaluate(() => openSession({ kind: 'practice', title: '書く · Write it', queue: [qWrite('ツ', 'practice')] }));
    await sleep(700);
    const r = await film(page, OUT, 'write', async () => {
      await sleep(900);
      await write(page, 'シ');
      await sleep(300);
      await tap(page, '#nextBtn');
      await sleep(2600);
      await page.keyboard.press('Enter');
      await sleep(900);
      await write(page, 'ツ');
      await sleep(300);
      await tap(page, '#nextBtn');
      await page.evaluate(() => clearTimeout(advanceTimer));
      await sleep(2200);
    }, { crop: ['.q-w .q-ask', '#verdict'], pad: 12 });
    await browser.close();
    return r;
  },

  /* the kana chart: tap one, its card, its strokes drawn */
  async kana() {
    const { browser, page } = await open();
    await page.evaluate(() => go('kana'));
    await sleep(700);
    const r = await film(page, OUT, 'kana', async () => {
      await sleep(700);
      await tap(page, '[data-act="kana-cell"][data-k="ね"]');
      await sleep(1600);
      await tap(page, '[data-act="kd-strokes"]');
      await sleep(3600);
    });
    await browser.close();
    return r;
  },

  /* grammar: a sentence in chunks, each heard */
  async grammar() {
    const { browser, page } = await open();
    await page.evaluate(() => go('grammar'));
    await sleep(600);
    await page.evaluate(() => scrollTo(0, 60));
    await sleep(300);
    const r = await film(page, OUT, 'grammar', async () => {
      await sleep(500);
      const chunks = page.locator('#v-grammar .g-chunk');
      const n = Math.min(5, await chunks.count());
      for (let i = 0; i < n; i++) { await tap(page, chunks.nth(i)); await sleep(i === n - 1 ? 1500 : 1050); }
    });
    await browser.close();
    return r;
  },

  /* subtitles: a line flashes up, and goes; what did it say? */
  async subs() {
    const { browser, page } = await open();
    await page.evaluate(() => { state.read.subs.cps = 3.2; state.read.subs.len = 9; save(); });
    const r = await film(page, OUT, 'subs', async () => {
      await page.evaluate(() => openRead('subs'));
      for (let k = 0; k < 2; k++) {
        await page.waitForFunction(() => RD.q && RD.q.shown, null, { timeout: 15000 });
        await sleep(700);
        const i = await page.evaluate(() => RD.q.opts.indexOf(RD.q.x));
        await tap(page, page.locator('#sbOpts .opt').nth(i));
        await sleep(1500);
        if (k === 0) await page.evaluate(() => { const b = document.querySelector('#rdFoot .btn, [data-act="rd-next"]'); b ? b.click() : document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); });
      }
    });
    await browser.close();
    return r;
  },

  /* the sushi shop's door, and the cat who seats you */
  async hostess() {
    const { browser, page } = await open();
    await place(page, 'sushi', '.kb-gate');
    await page.evaluate(() => { const g = document.querySelector('.kb-gate'); scrollTo(0, scrollY + g.getBoundingClientRect().top - 60); });
    await sleep(300);
    const r = await film(page, OUT, 'hostess', async () => {
      await sleep(800);
      await tap(page, '[data-act="sushi-in"]');
      await sleep(2600);
      await tap(page, '[data-act="sushi-party"]');
      await sleep(2900);
      await tap(page, '[data-act="sushi-seat"]');
      await sleep(2600);
    });
    await browser.close();
    return r;
  },

  /* at the counter: the belt goes round, a plate is picked up */
  async sushi() {
    const { browser, page } = await open(DESK);
    await place(page, 'sushi');
    for (const a of ['sushi-in', 'sushi-party', 'sushi-seat', 'sushi-follow']) { await page.evaluate(a => document.querySelector(`[data-act="${a}"]`).click(), a); await sleep(500); }
    await page.evaluate(() => { const b = document.querySelector('.kb-body'); scrollTo(0, scrollY + b.getBoundingClientRect().top - 40); });
    await sleep(600);
    const r = await film(page, OUT, 'sushi', async () => {
      await sleep(600);
      await tap(page, '.kb-body [data-act="sushi-page"].r');
      await sleep(1300);
      await tap(page, '.kb-body [data-act="sushi-page"].r');
      await sleep(1300);
      await tap(page, await inView(page, '.kb-body [data-act="kb-pick"]', 1));
      await sleep(2200);
      await tap(page, await inView(page, '.kb-body [data-act="kb-pick"]', 3));
      await sleep(2200);
    }, { crop: '.kb-body' });
    await browser.close();
    return r;
  },

  /* the festival, by night: down the street of stalls */
  async festival() {
    const { browser, page } = await open({ scheme: 'dark' });
    await place(page, 'festival', '.kb-store');
    await page.evaluate(() => { const g = document.querySelector('.kb-store'); scrollTo(0, scrollY + g.getBoundingClientRect().top - 70); });
    await sleep(400);
    const r = await film(page, OUT, 'festival', async () => {
      await sleep(900);
      for (let k = 1; k <= 3; k++) {
        await page.evaluate(k => new Promise(res => {
          const el = document.querySelector('.ws-street-ps'), x0 = el.scrollLeft, x1 = k * el.clientWidth, t0 = performance.now();
          el.style.scrollSnapType = 'none';
          const f = t => { const u = Math.min(1, (t - t0) / 900), e = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
            el.scrollLeft = x0 + (x1 - x0) * e; u < 1 ? requestAnimationFrame(f) : res(); };
          requestAnimationFrame(f);
        }), k);
        await sleep(1100);
      }
      await tap(page, await inView(page, '.kb-store [data-act="kb-pick"]', 0));
      await sleep(2400);
    });
    await browser.close();
    return r;
  },

  /* the station: down the stairs, a ticket from the machine */
  async station() {
    const { browser, page } = await open(DESK);
    await place(page, 'station', '.sn-station');
    const r = await film(page, OUT, 'station', async () => {
      await sleep(800);
      await tap(page, '[data-act="sn-nav"][data-dir="d"]');
      await sleep(1600);
      await tap(page, page.locator('[data-act="sn-machine"]').nth(1));
      await sleep(1300);
      await tap(page, page.locator('[data-act="sn-dest"]').nth(0));
      await sleep(1200);
      await tap(page, '[data-act="sn-who"][data-who="adult"]');
      await sleep(1500);
      await tap(page, '[data-act="sn-pay"][data-v="500"]');
      await sleep(1600);
      await tap(page, '[data-act="sn-take"]');
      await sleep(1800);
    }, { crop: '.sn-station' });
    await browser.close();
    return r;
  },

  /* the konbini: along the shelves, a bottle picked up and turned over */
  async konbini() {
    const { browser, page } = await open(DESK);
    await place(page, 'konbini');
    await page.evaluate(() => { const b = document.querySelector('.kb-body'); scrollTo(0, scrollY + b.getBoundingClientRect().top - 40); });
    await sleep(600);
    const r = await film(page, OUT, 'konbini', async () => {
      await sleep(600);
      await tap(page, '.kb-body [data-act="kb-pick"][aria-label="Melon soda"]');
      await sleep(1800);
      await tap(page, page.locator('.kb-body [data-act="kb-side"]').last());
      await sleep(1900);
      await tap(page, '.kb-body [data-act="kb-walk"][aria-label="Walk right"]');
      await sleep(1400);
      await tap(page, await inView(page, '.kb-body [data-act="kb-pick"]', 2));
      await sleep(2000);
    }, { crop: '.kb-body' });
    await browser.close();
    return r;
  },

  /* ninja slice: a bot with a good eye */
  async ninja() {
    const { browser, page } = await open({ scheme: 'dark' });
    await page.evaluate(() => {
      Element.prototype.setPointerCapture = function () {};
      window.__bot = () => {
        const field = document.querySelector('#njField');
        let job = null;
        const ev = (type, x, y) => field.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, pointerId: 7, pointerType: 'touch', isPrimary: true }));
        const loop = () => {
          if (!RD || RD.rung !== 'ninja' || RD.done) return;
          const b = field.getBoundingClientRect();
          if (!job) {
            const it = RD.items.find(it => !it.sliced && it.target && it.y < b.height * 0.7 && it.vy > -260);
            if (it) job = { it, k: 0, n: 9, dx: Math.random() < .5 ? 1 : -1 };
          }
          if (job) {
            const { it, k, n, dx } = job, u = k / n;
            const x = b.left + it.x + dx * (-70 + 140 * u), y = b.top + it.y - 45 + 90 * u;
            ev(k === 0 ? 'pointerdown' : 'pointermove', x, y);
            if (++job.k > n) { ev('pointerup', x, y); job = null; }
          }
          requestAnimationFrame(loop);
        };
        loop();
      };
    });
    const r = await film(page, OUT, 'ninja', async () => {
      await page.evaluate(() => openRead('ninja'));
      await sleep(900);
      await page.evaluate(() => __bot());
      await sleep(11000);
    });
    await browser.close();
    return r;
  },

  /* the swipe deck: pass, pass, this one */
  async deck() {
    const { browser, page } = await open();
    await page.evaluate(() => { state.read.deck.mode = 'w'; save(); });
    const r = await film(page, OUT, 'deck', async () => {
      await page.evaluate(() => openRead('deck'));
      await sleep(1100);
      for (let q = 0; q < 3; q++) {
        for (let guard = 0; guard < 8; guard++) {
          const top = await page.evaluate(() => { const Q = RD.q, c = RD.qs[RD.i].cards[Q.live[Q.at]]; return { right: c === Q.answer, burnt: Q.tried }; });
          const b = await page.locator('#dkDeck .top').boundingBox();
          const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
          if (top.right) { await drag(page, [[cx, cy], [cx + 10, cy - 220]], { ms: 330 }); await sleep(1100); break; }
          if (q === 1 && !top.burnt) { await drag(page, [[cx, cy], [cx - 6, cy - 220]], { ms: 330 }); await sleep(900); continue; }
          await drag(page, [[cx, cy], [cx + 190, cy + 20]], { ms: 300 }); await sleep(420);
        }
      }
    });
    await browser.close();
    return r;
  },

  /* every coin at once: one rainbow capsule */
  async gachaAll() {
    const { browser, page } = await open();
    await page.evaluate(() => { state.gacha.earned += 200; save(); go('games'); });
    await sleep(500);
    await page.evaluate(() => document.querySelector('#gmStage').scrollIntoView({ block: 'center' }));
    await sleep(300);
    const r = await film(page, OUT, 'gachaAll', async () => {
      await sleep(600);
      await tap(page, '[data-act="ga-spin-all"]');
      await sleep(2600);
      await tap(page, '[data-act="ga-crack"]');
      await sleep(3600);
    });
    await browser.close();
    return r;
  },

  /* the phone's menu: a wheel of five groups, each with its squares */
  async wheel() {
    const { browser, page } = await open();
    await page.evaluate(() => go('today'));
    await sleep(500);
    const r = await film(page, OUT, 'wheel', async () => {
      await sleep(600);
      await tap(page, '#burger');
      await sleep(1100);
      for (const g of ['practise', 'play', 'out']) {
        await tap(page, page.locator(`#drawerNav [data-act="drawer-group"][data-g="${g}"]:not([aria-hidden])`).nth(2));
        await sleep(1300);
      }
      await tap(page, '#drawer [data-act="nav-place"][data-id="festival"]');
      await sleep(1600);
    });
    await browser.close();
    return r;
  },

  /* a milestone: the cat, a medal, petals */
  async milestone() {
    const { browser, page } = await open();
    await page.evaluate(() => go('record'));
    await sleep(500);
    const r = await film(page, OUT, 'milestone', async () => {
      await sleep(500);
      await page.evaluate(() => celebrate(MILESTONES.filter(m => ['kana-all', 'words-200', 'streak-7', 'hira-all', 'words-100', 'check'].includes(m.id))));
      await sleep(3800);
    });
    await browser.close();
    return r;
  },

  /* the capsule machine: a turn, a gold capsule, petals, its name said */
  async gacha() {
    const { browser, page } = await open();
    await page.evaluate(() => {
      go('games');
      const rare = TOY_SETS[1].toys.find(t => t.rare && !state.gacha.owned[t.id]);
      window.gachaPick = () => rare;
    });
    await sleep(500);
    await page.evaluate(() => document.querySelector('#gmStage').scrollIntoView({ block: 'center' }));
    await sleep(300);
    const r = await film(page, OUT, 'gacha', async () => {
      await sleep(600);
      await tap(page, '[data-act="ga-spin"]');
      await sleep(2300);
      await tap(page, '[data-act="ga-crack"]');
      await sleep(3200);
    });
    await browser.close();
    return r;
  },
};

const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SHOTS);
const saidPath = OUT + 'said.json';
const said = existsSync(saidPath) ? JSON.parse(readFileSync(saidPath, 'utf8')) : {};
for (const s of want) {
  if (!SHOTS[s]) { console.log(`no shot called ${s}`); continue; }
  try {
    const r = await SHOTS[s]();
    said[s] = { dur: +r.dur.toFixed(2), box: r.box || null, said: r.said };
  } catch (e) { console.log(`  ${s} failed: ${e.message.split('\n')[0]}`); }
}
writeFileSync(saidPath, JSON.stringify(said, null, 1));
