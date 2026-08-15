/* CEUTA // SITUATION MONITOR — service worker: shell cache-first (v3: musica+hero+logo), datos network-first */
const CACHE = "ceuta-monitor-v3";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./favicon.svg", "./icon-192.png", "./icon-512.png", "./logo.png", "./hero.jpg", "./music.mp3"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // datos: network-first con fallback a cache (offline conserva la ultima foto)
  if (url.pathname.endsWith("feed.json") || url.pathname.endsWith("historial.json")) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request).then(m => m || caches.match("./index.html")))
    );
    return;
  }
  // assets multimedia: cache-first con revalidacion en background
  if (url.pathname.endsWith(".mp3") || url.pathname.endsWith(".jpg") || url.pathname.endsWith(".png")) {
    e.respondWith(
      caches.match(e.request).then(m => {
        const reval = fetch(e.request).then(r => {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
          return r;
        }).catch(() => m);
        return m || reval;
      })
    );
    return;
  }
  // shell: network-first (siempre version fresca) con fallback a cache (offline)
  e.respondWith(
    fetch(e.request).then(r => {
      const copy = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request).then(m => m || caches.match("./index.html")))
  );
});
