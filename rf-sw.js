const CACHE_NAME = 'reflexwahr-v1';
const APP_SHELL = [
  './',
  './rf-index.html',
  './rf-app.html',
  './rf-style.css',
  './rf-app.js',
  './nozoom.js',
  './rf-app.webmanifest',
  './rf-impressum.html',
  './rf-datenschutz.html',
  './rf-icon-192.png',
  './rf-icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
