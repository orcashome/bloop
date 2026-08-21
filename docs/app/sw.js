/* Bloop — Service Worker.
 * Zweck: Die App laeuft nach dem ersten Besuch auch ohne Netz (Auto, Bahn, Keller).
 *
 * STRATEGIE: Fuer die Seite selbst NETZ ZUERST, fuer alles andere Cache zuerst.
 *
 * Warum das wichtig ist: Vorher galt Cache zuerst - fuer ALLES. Die App kam
 * also aus dem Speicher, solange sie dort lag, und eine neue Fassung wurde erst
 * beim ZWEITEN Aufruf sichtbar. Wer einmal die Seite offen hatte, sah tagelang
 * den alten Stand und meldete Fehler, die laengst behoben waren.
 * Jetzt holt die Seite sich zuerst die aktuelle Fassung und faellt nur auf den
 * Speicher zurueck, wenn kein Netz da ist. Icons und Manifest bleiben bei Cache
 * zuerst - die aendern sich selten und sollen den Start nicht ausbremsen.
 *
 * Beim Neu-Deployen trotzdem CACHE hochzaehlen: das raeumt die alten Dateien weg.
 */
const CACHE = "bloop-v28";
// Wichtig: jede Datei hier MUSS existieren. addAll bricht sonst komplett ab,
// der Service Worker installiert nicht, und die App laeuft nicht offline.
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

  // Die Seite selbst: erst das Netz fragen, dann den Speicher.
  // `mode === "navigate"` trifft jeden Seitenaufruf, egal ueber welche Adresse.
  const istSeite = e.request.mode === "navigate";
  if (istSeite) {
    e.respondWith(
      fetch(e.request)
        .then((resp) => {
          const kopie = resp.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", kopie));
          return resp;
        })
        .catch(() => caches.match("./index.html").then((hit) => hit || caches.match("./")))
    );
    return;
  }

  // Alles andere: Speicher zuerst, sonst holen und ablegen.
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit || fetch(e.request).then((resp) => {
        const kopie = resp.clone();
        caches.open(CACHE).then((c) => c.put(e.request, kopie));
        return resp;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
