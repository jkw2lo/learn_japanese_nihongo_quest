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

/* Called once at boot. It does nothing at all unless a project is configured,
   and it only pulls the SDK down if this browser has signed in before — a
   first-time visitor pays nothing until they ask for it. */
async function syncInit() {
  if (!syncConfigured()) return;
  let seen = false;
  try { seen = localStorage.getItem(SYNC_SEEN) === "1"; } catch {}
  if (!seen) return syncSet("out");
  try { await syncStart(); } catch (e) { syncSet("error", e.message); }
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
    if (!user) { dropRemote(); return syncSet("out"); }
    try { localStorage.setItem(SYNC_SEEN, "1"); } catch {}
    syncSet("loading");
    try {
      const changed = await useRemote(syncDoc(user.uid));
      syncSet("in");
      /* the pull merged somebody else's afternoon into this device — repaint */
      if (changed && typeof onRemoteChange === "function") onRemoteChange();
    } catch (e) {
      syncSet("error", e.message || "could not reach the record");
    }
  });
  return fb;
}

async function syncSignIn() {
  if (!syncConfigured()) return;
  syncSet("loading");
  try {
    const fb = await syncStart();
    const provider = new fb.auth.GoogleAuthProvider();
    try {
      await fb.auth().signInWithPopup(provider);
    } catch (e) {
      /* A popup is the better experience — you stay on the page and keep your
         scroll position — but phones and in-app browsers block or simply do
         not support them. Falling back rather than reporting a failure means
         the button works everywhere without asking the device what it is. */
      const fall = ["auth/popup-blocked", "auth/popup-closed-by-user",
                    "auth/cancelled-popup-request",
                    "auth/operation-not-supported-in-this-environment"];
      if (!fall.includes(e.code)) throw e;
      if (e.code === "auth/popup-closed-by-user") return syncSet("out");
      await fb.auth().signInWithRedirect(provider);
    }
  } catch (e) {
    syncSet("error", syncReason(e));
  }
}

async function syncSignOut() {
  try {
    const fb = await syncSdk();
    await fb.auth().signOut();
  } catch { /* already gone */ }
  dropRemote();
  try { localStorage.removeItem(SYNC_SEEN); } catch {}
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
