// Minimal deterministic development service worker
// Purpose: ensure Playwright E2E can reliably observe installation, activation,
// client claiming and a predictable cache name + precached assets for tests.

const CACHE_NAME = 'pain-tracker-static-v1.2';
// Keep precache minimal to avoid dev server index fetch races — manifest is the critical asset the tests check for
const PRECACHE_URLS = ['manifest.json'];

self.addEventListener('install', (event) => {
  // Activate as soon as installed
  self.skipWaiting();

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch((err) => {
        console.warn('[sw] precache failed', err);
      })
  );
});

self.addEventListener('activate', (event) => {
  // Claim clients immediately so pages are controlled
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple cache-first strategy for dev: serve from cache if available, else network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          // Optionally cache successful GET requests for later
          if (
            event.request.method === 'GET' &&
            response &&
            response.status === 200 &&
            response.type !== 'opaque'
          ) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // Fallbacks: if request is navigation then return cached root if present
          if (event.request.mode === 'navigate') {
            return caches.match('.');
          }
          return new Response(null, { status: 504, statusText: 'Gateway Timeout' });
        });
    })
  );
});

self.addEventListener('message', (event) => {
  // Support skipWaiting via postMessage from page (useful for tests)
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Expose version for introspection
self.__SW_VERSION = '1.2';
