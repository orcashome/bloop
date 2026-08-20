/* Robin — minimaler Service Worker.
 * Zweck: Die App laeuft nach dem ersten Besuch auch ohne Netz (Auto, Bahn, Keller).
 * WICHTIG beim Neu-Deployen: CACHE-Namen hochzaehlen, sonst sehen Rueckkehrer die alte Version.
 */
const CACHE = "bloop-v18";
// Wichtig: jede Datei hier MUSS existieren. addAll bricht sonst komplett ab,
// der Service Worker installiert nicht, und die App laeuft nicht offline.
// fonts.css ist entfallen - die runde Schrift kommt jetzt vom System.
const ASSETS = ["./", "./index.html", "./icon.svg", "./apple-touch-icon.png",
  "./icon-192.png", "./icon-512.png", "./icon-maskable.png", "./manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit || fetch(e.request).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return resp;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
