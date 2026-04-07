// Minimal deterministic service worker.
// Notes:
// - Navigations stay network-first to avoid stale HTML/module graph issues.
// - Only static GET assets are cached.

const SW_VERSION = '1.10.1';
const CACHE_NAME = `pain-tracker-static-v${SW_VERSION}`;

// Keep precache paths scope-safe for both root and /pain-tracker deployments.
const PRECACHE_URLS = ['/', '/manifest.json', '/pain-tracker/manifest.json', '/offline.html'];

const STATIC_PATH_PREFIXES = [
  '/assets/',
  '/pain-tracker/assets/',
  '/icons/',
  '/logos/',
  '/screenshots/'
];

function isSameOrigin(requestUrl) {
  return requestUrl.origin === globalThis.location.origin;
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}

function isApiRequest(url) {
  return (
    url.pathname === '/api' ||
    url.pathname.startsWith('/api/') ||
    url.pathname === '/pain-tracker/api' ||
    url.pathname.startsWith('/pain-tracker/api/')
  );
}

function isCacheableStaticAsset(url) {
  if (!isSameOrigin(url)) return false;
  if (url.pathname === '/sw-register.js') return false;
  if (STATIC_PATH_PREFIXES.some((pathPrefix) => url.pathname.startsWith(pathPrefix))) return true;

  // Allow common static extensions outside known prefixes.
  return /\.(?:js|css|png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname);
}

function isTrustedClientMessage(event) {
  const data = event.data;
  if (!data || typeof data !== 'object' || typeof data.type !== 'string') return false;
  if (!event.source || typeof event.source !== 'object' || !(event.source instanceof Client)) {
    return false;
  }

  try {
    const sourceUrl = new URL(event.source.url);
    return isSameOrigin(sourceUrl);
  } catch {
    return false;
  }
}

async function getTrustedMessageClient(event) {
  const eventOrigin = typeof event.origin === 'string' ? event.origin : '';
  if (eventOrigin && eventOrigin !== globalThis.location.origin) {
    return null;
  }

  if (!isTrustedClientMessage(event)) {
    return null;
  }

  const sourceId = typeof event.source?.id === 'string' ? event.source.id : '';
  const sourceClient = sourceId ? await globalThis.clients.get(sourceId) : event.source;
  if (!sourceClient) {
    return null;
  }

  try {
    const sourceUrl = new URL(sourceClient.url);
    return isSameOrigin(sourceUrl) ? sourceClient : null;
  } catch {
    return null;
  }
}

globalThis.addEventListener('install', (event) => {
  globalThis.skipWaiting();

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        // Partial success keeps offline fallback available even if one URL is missing.
        const results = await Promise.allSettled(PRECACHE_URLS.map((url) => cache.add(url)));
        const rejectedCount = results.filter((result) => result.status === 'rejected').length;
        if (rejectedCount > 0) {
          console.warn('[sw] precache partially failed', rejectedCount);
        }
      } catch (error) {
        console.warn('[sw] precache failed', error);
      }
    })()
  );
});

globalThis.addEventListener('activate', (event) => {
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

      await globalThis.clients.claim();

      const allClients = await globalThis.clients.matchAll({ includeUncontrolled: true });
      for (const client of allClients) {
        client.postMessage({ type: 'SW_READY', version: SW_VERSION });
      }
    })()
  );
});

globalThis.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  if (!isSameOrigin(requestUrl)) return;
  if (isApiRequest(requestUrl)) return;

  if (isNavigationRequest(event.request)) {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);

        // For SPA routes, prefer app-shell fallbacks before offline page.
        const rootShell = await cache.match('/');
        if (rootShell) return rootShell;

        const subpathShell = await cache.match('/pain-tracker/');
        if (subpathShell) return subpathShell;

        return (await cache.match('/offline.html')) || new Response(null, { status: 504 });
      })
    );
    return;
  }

  if (event.request.method !== 'GET' || !isCacheableStaticAsset(requestUrl)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      try {
        const response = await fetch(event.request);
        if (response?.status === 200 && response.type !== 'opaque') {
          cache.put(event.request, response.clone());
        }
        return response;
      } catch {
        return cached || new Response(null, { status: 504, statusText: 'Gateway Timeout' });
      }
    })
  );
});

async function handleTrustedMessageEvent(event, eventOrigin, sourceId) {
  const sourceClient = sourceId ? await globalThis.clients.get(sourceId) : undefined;
  if (!(sourceClient instanceof Client)) {
    return;
  }

  const sourceUrl = new URL(sourceClient.url);
  if (!isSameOrigin(sourceUrl)) {
    return;
  }

  if (eventOrigin && eventOrigin !== sourceUrl.origin) {
    return;
  }

  if (!isTrustedClientMessage(event)) {
    return;
  }

  const messageType = event.data?.type;

  if (messageType === 'SKIP_WAITING') {
    globalThis.skipWaiting();
    return;
  }

  if (messageType === 'PING') {
    try {
      sourceClient.postMessage({ type: 'PONG' });
    } catch {
      // Ignore cross-context postMessage failures.
    }
  }
}

globalThis.addEventListener('message', (event) => {
  if (typeof event.origin !== 'string') {
    return;
  }

  const eventOrigin = event.origin;
  if (eventOrigin !== globalThis.location.origin) {
    return;
  }

  const sourceClient = event.source;
  if (!(sourceClient instanceof Client)) {
    return;
  }

  const sourceUrl = new URL(sourceClient.url);
  if (!isSameOrigin(sourceUrl)) {
    return;
  }

  if (eventOrigin !== sourceUrl.origin) {
    return;
  }

  const sourceId = typeof sourceClient.id === 'string' ? sourceClient.id : '';
  if (!sourceId) {
    return;
  }

  event.waitUntil(handleTrustedMessageEvent(event, eventOrigin, sourceId));
});

// Expose version for diagnostics and tests.
globalThis.__SW_VERSION = SW_VERSION;
