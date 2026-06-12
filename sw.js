/* Mon Dashboard — service worker : rend l'app disponible hors-ligne.
   À placer dans le même dossier que index.html. */
const CACHE = "mon-dashboard-v1";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(["./"]).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Réseau d'abord (pour récupérer les mises à jour), cache en secours (hors-ligne)
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        return r;
      })
      .catch(() =>
        caches.match(e.request).then(m => m || caches.match("./"))
      )
  );
});
