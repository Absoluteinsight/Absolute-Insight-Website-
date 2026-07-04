// Absolute Insight — Service Worker
// Caches the app shell so results/stats remain visible offline.
// Bump CACHE_VERSION whenever index.html structure changes significantly,
// to force clients to fetch a fresh copy rather than a stale cached shell.
const CACHE_VERSION = 'ai-v6';
const CACHE_NAME = `absolute-insight-${CACHE_VERSION}`;

const SHELL_URLS = [
  './',
  './index.html',
  './manifest.json'
];

// Install: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS))
  );
  self.skipWaiting();
});

// Activate: clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('absolute-insight-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy: network-first for index.html (so results stay fresh when online),
// falling back to cache when offline. Cache-first for everything else (fonts, icons).
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const isHTML = request.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
    })
  );
});
