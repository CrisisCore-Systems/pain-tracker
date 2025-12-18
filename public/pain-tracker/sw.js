// Minimal deterministic service worker.
// Notes:
// - In production, never cache navigations with cache-first (stale HTML can break module graphs).
// - Only cache static assets; always fetch fresh HTML.

const SW_VERSION = '1.8';
const CACHE_NAME = `pain-tracker-static-v${SW_VERSION}`;

// Use absolute paths so different browsers/dev servers resolve the same URL regardless of scope.
const PRECACHE_URLS = ['/pain-tracker/manifest.json', '/offline.html'];

const STATIC_PATH_PREFIXES = ['/pain-tracker/assets/', '/assets/', '/icons/', '/logos/', '/screenshots/'];

function isSameOrigin(requestUrl) {
  return requestUrl.origin === self.location.origin;
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}

function isCacheableStaticAsset(url) {
  if (!isSameOrigin(url)) return false;
  if (STATIC_PATH_PREFIXES.some((p) => url.pathname.startsWith(p))) return true;
  return /\.(?:js|css|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname);
}

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
  event.waitUntil(
    (async () => {
      await self.clients.claim();

      // Notify clients that the service worker is active and ready. Tests can listen for this message.
      const allClients = await self.clients.matchAll({ includeUncontrolled: true });
      for (const client of allClients) {
        client.postMessage({ type: 'SW_READY', version: SW_VERSION });
      }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (!isSameOrigin(url)) return;

  // Network-first for navigations to avoid stale HTML.
  if (isNavigationRequest(event.request)) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (
          (await cache.match('/offline.html')) ||
          (await cache.match('/pain-tracker/')) ||
          new Response(null, { status: 504 })
        );
      })
    );
    return;
  }

  if (event.request.method !== 'GET' || !isCacheableStaticAsset(url)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      try {
        const response = await fetch(event.request);
        if (response && response.status === 200 && response.type !== 'opaque') {
          cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        return cached || new Response(null, { status: 504, statusText: 'Gateway Timeout' });
      }
    })
  );
});

self.addEventListener('message', (event) => {
  // Support skipWaiting via postMessage from page (useful for tests)
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // Echo test ping messages
  if (event.data && event.data.type === 'PING') {
    try {
      if (event.source && typeof event.source.postMessage === 'function') {
        event.source.postMessage({ type: 'PONG' });
      }
    } catch {
      // ignore
    }
  }
});

// Expose version for introspection
self.__SW_VERSION = SW_VERSION;
