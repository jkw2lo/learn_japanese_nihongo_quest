/* Nihongo Quest — the offline copy, from the page's side.

   Registers sw.js (see it for the caches), and draws Settings → Offline: what's
   saved, what's still to fetch and how big it is, and one button to fetch the
   rest while there's Wi-Fi. Where the browser can tell Wi-Fi from a phone
   signal (Android Chrome; not Safari), there's also a switch to do that by
   itself.

   Off on the dev server, where a cached copy would hide every edit until the
   version was bumped. To try it there: localStorage.nqSw = 1, then reload. */

const OFFLINE_CLIPS = "nq-clips";
const offlineDev = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
const offline = {
  on: "serviceWorker" in navigator && "caches" in window && (!offlineDev || (() => { try { return !!localStorage.nqSw; } catch { return false; } })()),
  busy: false, done: 0, of: 0,
};

function offlineRegister() {
  if (!("serviceWorker" in navigator)) return;
  if (!offline.on) {
    /* a worker left over from trying it on the dev server */
    navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => {});
    return;
  }
  navigator.serviceWorker.register("sw.js").then(() => crumb("offline worker registered"), err => crumb(`offline worker failed: ${err.message}`));
}

/* Which of the heavy files (js/assets.js) aren't saved yet. */
async function offlineMissing() {
  const c = await caches.open(OFFLINE_CLIPS);
  const names = Object.keys(ASSET_HASH);
  const have = await Promise.all(names.map(n => c.match(assetUrl(n))));
  return names.filter((n, i) => !have[i]);
}

const mb = b => b < 95e3 ? `${Math.max(1, Math.round(b / 1e3))} KB` : `${(b / 1e6).toFixed(1)} MB`;
const offlineWifiKnown = () => !!(navigator.connection && "type" in navigator.connection);
const offlineOnWifi = () => offlineWifiKnown() && ["wifi", "ethernet"].includes(navigator.connection.type);

function offlineBlockHtml() {
  return `<div class="set-block" id="offlineBlock"><h3>Offline</h3><p class="small">Checking what's saved…</p></div>`;
}

/* Fills the block in Settings, if it's open. */
async function offlinePaint() {
  const box = $("#offlineBlock");
  if (!box) return;
  if (!offline.on) {
    box.innerHTML = `<h3>Offline</h3><p class="small">${offlineDev ? "Off on the dev server, so edits show up straight away." : "This browser can't keep an offline copy."}</p>`;
    return;
  }
  const [missing, core] = await Promise.all([offlineMissing(), caches.has(`nq-core-${APP_VERSION}`)]);
  const all = Object.keys(ASSET_HASH).length;
  const left = missing.reduce((n, k) => n + ASSET_HASH[k][1], 0);
  const total = Object.values(ASSET_HASH).reduce((n, h) => n + h[1], 0);
  const app = core ? "The app is saved, and opens without a signal."
    : "The app saves itself for offline the first time it fully loads, so it'll be ready next time.";
  const parts = missing.length
    ? `Sound and stroke drawings: <b>${all - missing.length} of ${all}</b> parts saved, <b>${mb(left)}</b> still to fetch. Parts you haven't saved download when you first need them, on whatever connection you're on.`
    : `Sound and stroke drawings: all ${all} parts saved (${mb(total)}).`;
  const btn = offline.busy
    ? `<button class="btn btn-sm" disabled>Downloading… ${offline.done} of ${offline.of}</button>`
    : missing.length ? `<button class="btn btn-sm" data-act="offline-get">Download the rest (${mb(left)})</button>` : "";
  box.innerHTML = `<h3>Offline</h3>
    <p class="small">${app} ${parts} Updates to the app don't fetch the sound again unless the sound itself changed.</p>
    ${btn}
    ${offlineWifiKnown() ? `<label class="set-row"><span>Download on Wi-Fi<small>Fetch whatever's missing by itself whenever you're on Wi-Fi, never on a phone signal.</small></span>
      <input type="checkbox" data-set="offlineWifi" ${state.settings.offlineWifi ? "checked" : ""}></label>` : ""}`;
}

async function offlineGet(quiet) {
  if (!offline.on || offline.busy) return;
  offline.busy = true;
  try {
    /* asks the browser not to clear the copy to make room (Safari otherwise
       may after a week unused, unless it's on the home screen) */
    navigator.storage?.persist?.().catch(() => {});
    const todo = await offlineMissing();
    offline.done = 0; offline.of = todo.length;
    if (!todo.length) return;
    crumb(`offline: fetching ${todo.length}`);
    offlinePaint();
    const c = await caches.open(OFFLINE_CLIPS);
    for (const name of todo) {
      await c.add(assetUrl(name));
      offline.done++;
      offlinePaint();
    }
    if (!quiet) toast("Saved for offline.");
  } catch (err) {
    crumb(`offline: ${err.message}`);
    if (!quiet) toast("The download stopped — check the connection and try again.");
  } finally {
    offline.busy = false;
    offlinePaint();
  }
}

function offlineAuto() {
  if (state.settings.offlineWifi && offlineOnWifi()) offlineGet(true);
}

Object.assign(ACTS, { "offline-get": () => offlineGet(false) });

addEventListener("load", () => {
  offlineRegister();
  /* well after the first screen and its own sound have had the connection */
  setTimeout(offlineAuto, 8000);
  navigator.connection?.addEventListener?.("change", offlineAuto);
});
