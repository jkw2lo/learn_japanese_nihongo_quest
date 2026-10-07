/* Nihongo Quest — the offline copy.

   Three caches:
     nq-core-<version>  index.html and everything it loads with ?v=. Filled
                        when this worker installs, dropped when the next
                        version's worker takes over.
     nq-clips           the audio bundles and strokes.js, keyed by ?h=<hash>
                        (tools/hashes.mjs). Kept across versions; an entry
                        whose hash is no longer current is pruned.
     nq-fonts           Google Fonts, as they're used.

   The page itself is network first, so a push shows up on the next open; it
   falls back to the saved copy when there's no signal, or when the signal is
   too slow to wait for. Everything with ?v= or ?h= in its URL never changes
   under that URL, so it's served from the cache whenever it's there.

   VERSION is stamped by tools/version.mjs. Changing it is what makes the
   browser install a new worker. */

const VERSION = "0.28.0";
const CORE = `nq-core-${VERSION}`, CLIPS = "nq-clips", FONTS = "nq-fonts";
const HOME = new URL("./", self.location).href;
const WAIT_MS = 4000;

const isThisVersion = html => html.includes(`const APP_VERSION = "${VERSION}"`);

self.addEventListener("install", e => e.waitUntil((async () => {
  const res = await fetch(HOME, { cache: "no-cache" });
  const html = await res.clone().text();
  /* a CDN still serving the previous index.html: try again on the next visit
     rather than save a copy whose files don't match */
  if (!res.ok || !isThisVersion(html)) throw new Error(`index.html isn't ${VERSION} yet`);
  const urls = [...html.matchAll(/(?:src|href)="((?:js|css)\/[^"]+\?v=[^"]+)"/g)].map(m => new URL(m[1], HOME).href);
  const c = await caches.open(CORE);
  await c.addAll(urls);
  await c.put(HOME, res);
  await self.skipWaiting();
})()));

self.addEventListener("activate", e => e.waitUntil((async () => {
  const names = await caches.keys();
  await Promise.all(names.filter(n => n.startsWith("nq-core-") && n !== CORE).map(n => caches.delete(n)));
  await pruneClips();
  await self.clients.claim();
})()));

/* Drop clips whose hash isn't the one this version's js/assets.js names. */
async function pruneClips() {
  const a = await caches.match(new URL(`js/assets.js?v=${VERSION}`, HOME).href);
  if (!a) return;
  const m = (await a.text()).match(/const ASSET_HASH = (\{[\s\S]*?\});/);
  if (!m) return;
  const hash = JSON.parse(m[1]);
  const c = await caches.open(CLIPS);
  for (const req of await c.keys()) {
    const u = new URL(req.url), name = (u.pathname.match(/([^/]+)\.js$/) || [])[1];
    if (!hash[name] || hash[name][0] !== u.searchParams.get("h")) await c.delete(req);
  }
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (req.mode === "navigate" && url.href.split(/[?#]/)[0].replace(/index\.html$/, "") === HOME) return e.respondWith(page(req));
  if (url.origin === self.location.origin) {
    if (url.searchParams.has("h")) return e.respondWith(kept(req, CLIPS));
    if (url.searchParams.has("v")) return e.respondWith(kept(req, CORE));
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") e.respondWith(kept(req, FONTS));
});

/* From the cache if it's there; otherwise fetched, and kept. */
async function kept(req, name) {
  const hit = await caches.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) (await caches.open(name)).put(req, res.clone()).catch(() => {});
  return res;
}

/* Network first, with the saved copy if the network fails or dawdles. */
async function page(req) {
  const saved = () => caches.open(CORE).then(c => c.match(HOME));
  const net = fetch(req).then(async res => {
    /* only this version's page goes in this version's cache: a newer one
       names files this cache doesn't have, and the browser installs its
       worker on its own */
    if (res.ok && isThisVersion(await res.clone().text())) (await caches.open(CORE)).put(HOME, res.clone());
    return res;
  });
  const slow = new Promise(r => setTimeout(r, WAIT_MS)).then(saved);
  try {
    return await Promise.race([net, slow.then(s => s || net)]);
  } catch {
    return (await saved()) || Response.error();
  }
}
