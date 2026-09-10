const CACHE_NAME = 'narzissmuswahr-v2';
const APP_SHELL = [
  './',
  './nz-index.html',
  './nz-app.html',
  './nz-style.css',
  './nz-app.js',
  './nozoom.js',
  './nz-app.webmanifest',
  './nz-impressum.html',
  './nz-datenschutz.html',
  './nz-icon-192.png',
  './nz-icon-512.png',
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
