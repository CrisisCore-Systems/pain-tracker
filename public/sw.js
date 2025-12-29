// Minimal deterministic service worker.
// Notes:
// - In production, never cache navigations with cache-first (stale HTML can break module graphs).
// - Only cache static assets; always fetch fresh HTML.

const SW_VERSION = '1.10';
const CACHE_NAME = `pain-tracker-static-v${SW_VERSION}`;
const PRECACHE_URLS = ['/manifest.json', '/offline.html'];

const STATIC_PATH_PREFIXES = ['/assets/', '/icons/', '/logos/', '/screenshots/'];

function isSameOrigin(requestUrl) {
  return requestUrl.origin === self.location.origin;
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}

function isCacheableStaticAsset(url) {
  if (!isSameOrigin(url)) return false;
  if (STATIC_PATH_PREFIXES.some((p) => url.pathname.startsWith(p))) return true;

  // Allow common static extensions outside the prefixes (e.g., /favicon.ico, /apple-touch-icon.png)
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
  // Clean up old caches and claim clients immediately
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith('pain-tracker-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[sw] Deleting old cache:', name);
            return caches.delete(name);
          })
      );

      await self.clients.claim();

      // Notify clients that the service worker is active and ready.
      const allClients = await self.clients.matchAll({ includeUncontrolled: true });
      for (const client of allClients) {
        client.postMessage({ type: 'SW_READY', version: SW_VERSION });
      }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip external URLs - let the browser handle them directly.
  if (!isSameOrigin(url)) return;

  // Network-first for navigations to avoid stale HTML.
  if (isNavigationRequest(event.request)) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('/offline.html')) || (await cache.match('/')) || new Response(null, { status: 504 });
      })
    );
    return;
  }

  // Only cache GET static assets.
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
