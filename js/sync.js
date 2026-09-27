/* Nihongo Quest — sync: your progress on whatever you happen to be holding.

   Lifted from Hanzi Quest's js/sync.js, and the same Firebase project: sign
   in with Google once on each device and both read and write one document,
   progress-nihongo/<your account>. Everything stays in localStorage as
   before; this only keeps the copies in step. Nobody who never signs in
   loads any of it.

   The merge itself is in js/srs.js (mergeState): nothing learned on either
   device is lost.

   SETUP (already done for Hanzi Quest — only step 3 is new):
   1. The Firebase project hanzi-quest-3cf9c, Google sign-in enabled.
   2. Authentication → Settings → Authorised domains includes
      jkw2lo.github.io (and localhost, by default).
   3. Firestore → Rules: add, next to the progress-hanzi block,

          match /progress-nihongo/{uid} {
            allow read, write: if request.auth != null
                               && request.auth.uid == uid;
          }

      That rule is the whole security model: a signed-in person can read and
      write the one document named after their own account, and nothing else.

   The apiKey below is not a secret — it identifies the project to Google,
   it's in every Firebase web app ever shipped, and grants nothing on its
   own. The rules grant. */

/* Paste the config object from step 4 here. Empty apiKey = the feature is off
   and no part of this file runs. */
const SYNC_CONFIG = {
  apiKey: "AIzaSyCyLXH9h5N617ESj87NeK98HOj1RRN19cE",
  authDomain: "hanzi-quest-3cf9c.firebaseapp.com",
  projectId: "hanzi-quest-3cf9c",
  storageBucket: "hanzi-quest-3cf9c.firebasestorage.app",
  messagingSenderId: "1074304614247",
  appId: "1:1074304614247:web:587cfda254ef1a31f9f9c2"
};

/* Pinned. ~510KB across the three, so they are fetched when they are wanted
   and never on a cold first paint. */
const SYNC_SDK = "https://cdn.jsdelivr.net/npm/firebase@10.14.1/";
const SYNC_PARTS = ["firebase-app-compat.js", "firebase-auth-compat.js", "firebase-firestore-compat.js"];
/* Named per app, so the one Firebase project serves Hanzi Quest, Cantonese
   Quest and this — each its own record, none overwriting another. */
const SYNC_STORE = "progress-nihongo";
const SYNC_SEEN = "nq-signed-in";      /* has this browser ever signed in */

const syncConfigured = () => !!SYNC_CONFIG.apiKey;

/* off      — no project configured, the row never appears
   loading  — fetching the SDK or waiting on the first auth callback
   out      — ready, nobody signed in
   in       — signed in and syncing
   error    — something went wrong, and sync.msg says what */
const sync = { status: syncConfigured() ? "loading" : "off", user: null, msg: "", sdk: null };

/* set by app.js — the only thing on screen that shows any of this is the
   block in Settings, so a change repaints that and nothing else */
let onSyncChange = null;

function syncOne(src) {
  return new Promise((ok, no) => {
    const el = document.createElement("script");
    el.src = src; el.async = false;          /* async false keeps them in order */
    el.onload = ok;
    el.onerror = () => no(new Error("could not load " + src));
    document.head.appendChild(el);
  });
}

/* Loaded once, whoever asks. The three scripts have to arrive in order, so
   they are awaited in sequence rather than raced. */
async function syncSdk() {
  if (sync.sdk) return sync.sdk;
  sync.sdk = (async () => {
    for (const p of SYNC_PARTS) await syncOne(SYNC_SDK + p);
    firebase.initializeApp(SYNC_CONFIG);
    return firebase;
  })();
  try {
    return await sync.sdk;
  } catch (e) {
    sync.sdk = null;                          /* let a later attempt retry */
    throw e;
  }
}

/* The shape js/srs.js wants: an object with get() and set(). The record
   doesn't know what's storing it. */
function syncDoc(uid) {
  const ref = firebase.firestore().collection(SYNC_STORE).doc(uid);
  return {
    get: async () => {
      const snap = await ref.get();
      return { exists: snap.exists, data: () => snap.data() };
    },
    set: data => ref.set(data)
  };
}

function syncSet(status, msg = "") {
  sync.status = status;
  sync.msg = msg;
  if (typeof onSyncChange === "function") onSyncChange();
}

/* Set just before handing the page to Google in a redirect, so the page that
   comes back knows to finish the job — without it, a browser that had never
   signed in skipped the SDK on return and the sign-in simply vanished. */
const SYNC_PENDING = "nq-sign-in-pending";
const syncFlag = (k, v) => { try { v ? localStorage.setItem(k, "1") : localStorage.removeItem(k); } catch {} };
const syncHas = k => { try { return localStorage.getItem(k) === "1"; } catch { return false; } };

/* How long "Checking…" may last before it gives up and says so. A phone on a
   bad connection, a blocked script or a Firestore that never answers used to
   leave the button greyed out for good. */
const SYNC_PATIENCE_MS = 20000;
let syncWatchdog = null;
function syncLoading() {
  syncSet("loading");
  clearTimeout(syncWatchdog);
  syncWatchdog = setTimeout(() => {
    if (sync.status === "loading") syncSet("error", "Google didn't answer. Check the connection and try again.");
  }, SYNC_PATIENCE_MS);
}

/* Called once at boot. It does nothing at all unless a project is configured,
   and it only pulls the SDK down if this browser has signed in before (or is
   on its way back from Google) — a first-time visitor pays nothing until they
   ask for it. */
async function syncInit() {
  if (!syncConfigured()) return;
  const pending = syncHas(SYNC_PENDING);
  if (!syncHas(SYNC_SEEN) && !pending) return syncSet("out");
  syncLoading();
  try {
    const fb = await syncStart();
    if (pending) {
      syncFlag(SYNC_PENDING, false);
      /* surfaces the redirect's error, if it had one; the user itself arrives
         through onAuthStateChanged */
      const res = await fb.auth().getRedirectResult();
      if (!res.user && !fb.auth().currentUser) {
        syncSet("error", "The sign-in didn't make it back to this page — some phone browsers block that on the way. "
          + "Tap Sign in again. If it keeps happening, open the page in Safari or Chrome itself, not inside another app.");
      }
    }
  } catch (e) { syncSet("error", syncReason(e)); }
}

/* Settings calls this as it opens, so the SDK is already here by the time
   the button is tapped. It matters on a phone: a popup is only allowed as
   the direct result of a tap, and waiting half a megabyte of script first
   used the tap up — the popup was blocked and the fallback redirect is the
   part phones break. */
function syncWarm() {
  if (!syncConfigured() || sync.status === "in") return;
  syncSdk().then(() => syncStart()).catch(() => {});
}

let syncWatching = false;
async function syncStart() {
  const fb = await syncSdk();
  if (syncWatching) return fb;
  syncWatching = true;
  /* onAuthStateChanged fires on every load for a session already established,
     which is what makes signing in a once-per-device act rather than a daily
     one. It also fires after signInWithRedirect returns. */
  fb.auth().onAuthStateChanged(async user => {
    sync.user = user ? { name: user.displayName || "", email: user.email || "" } : null;
    if (!user) {
      dropRemote();
      /* a redirect still being finished, or an error already on screen, says more than "out" */
      if (syncHas(SYNC_PENDING) || sync.status === "error") return;
      return syncSet("out");
    }
    syncFlag(SYNC_SEEN, true);
    syncFlag(SYNC_PENDING, false);
    syncLoading();
    try {
      const changed = await useRemote(syncDoc(user.uid));
      clearTimeout(syncWatchdog);
      syncSet("in");
      /* the pull merged somebody else's afternoon into this device — repaint */
      if (changed && typeof onRemoteChange === "function") onRemoteChange();
    } catch (e) {
      clearTimeout(syncWatchdog);
      syncSet("error", syncReason(e));
    }
  });
  return fb;
}

async function syncSignIn() {
  if (!syncConfigured()) return;
  /* The SDK usually arrived while Settings was open (syncWarm). If it did,
     the popup opens synchronously, inside the tap, which is the only way
     Safari on a phone lets it open at all. */
  const ready = typeof firebase !== "undefined" && firebase.apps && firebase.apps.length && syncWatching;
  let fb;
  try {
    fb = ready ? firebase : null;
    const popup = fb ? fb.auth().signInWithPopup(new fb.auth.GoogleAuthProvider()) : null;
    syncLoading();
    if (!fb) fb = await syncStart();
    try {
      await (popup || fb.auth().signInWithPopup(new fb.auth.GoogleAuthProvider()));
    } catch (e) {
      if (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") {
        clearTimeout(syncWatchdog);
        return syncSet(sync.user ? "in" : "out");
      }
      if (e.code === "auth/popup-blocked" && !ready) {
        /* The SDK had to be fetched first and the tap went stale on the way.
           It's here now, so a second tap opens the window properly. */
        clearTimeout(syncWatchdog);
        return syncSet("out", "retry");
      }
      /* Last resort, for browsers with no popups at all (some in-app
         browsers). A phone that blocks the redirect's return is caught by
         syncInit when the page comes back. */
      const fall = ["auth/popup-blocked", "auth/operation-not-supported-in-this-environment"];
      if (!fall.includes(e.code)) throw e;
      syncFlag(SYNC_PENDING, true);
      await fb.auth().signInWithRedirect(new fb.auth.GoogleAuthProvider());
    }
  } catch (e) {
    clearTimeout(syncWatchdog);
    syncSet("error", syncReason(e));
  }
}

async function syncSignOut() {
  try {
    const fb = await syncSdk();
    await fb.auth().signOut();
  } catch { /* already gone */ }
  dropRemote();
  syncFlag(SYNC_SEEN, false);
  syncFlag(SYNC_PENDING, false);
  sync.user = null;
  syncSet("out");
}

/* The three failures worth naming, because each one has a different fix and
   the raw message names none of them. */
function syncReason(e) {
  const code = (e && e.code) || "";
  if (code === "auth/unauthorized-domain") {
    return `${location.hostname} isn't on the project's authorised domains — `
         + "add it under Authentication → Settings.";
  }
  if (code === "auth/operation-not-allowed") {
    return "Google sign-in isn't switched on for this project — enable it under "
         + "Authentication → Sign-in method.";
  }
  if (code === "auth/network-request-failed") return "Couldn't reach Google — check the connection and try again.";
  if (code === "auth/web-storage-unsupported") {
    return "This browser is blocking the storage sign-in needs (private mode, or an in-app browser). Open the page in Safari or Chrome.";
  }
  if (code === "permission-denied") {
    return "Signed in, but the database refused the write — check the Firestore rules.";
  }
  return (e && e.message) || "something went wrong";
}

/* Coming back to the tab — the phone picked up after a session on the
   laptop — pulls again, so the two meet without a reload. Not mid-session:
   the lesson on screen was built from the record as it was. */
document.addEventListener("visibilitychange", async () => {
  if (document.visibilityState !== "visible" || sync.status !== "in" || !remoteDoc) return;
  if (typeof S !== "undefined" && S) return;
  try {
    const changed = await useRemote(remoteDoc);
    if (changed && typeof onRemoteChange === "function") onRemoteChange();
  } catch { /* offline — the next save will try again */ }
});
