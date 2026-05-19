const CACHE_VERSION = 'garuda-web-2026-05-01-4';
const APP_SHELL = [
  './',
  './index.html',
  './garuda.js',
  './jsfxr.js',
  './assets/logo.jpg',
  './assets/Start.jpg',
  './assets/button_start.png',
  './assets/button_rank.png'
];

function shouldCache(request, url) {
  if (request.method !== 'GET')
    return false;
  if (request.headers.has('range'))
    return false;
  return url.origin === self.location.origin && (
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.includes('/assets/')
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => {
        if (key !== CACHE_VERSION)
          return caches.delete(key);
      })))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (!shouldCache(request, url))
    return;

  if (url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque')
          return response;
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached)
        return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque')
          return response;
        const copy = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
