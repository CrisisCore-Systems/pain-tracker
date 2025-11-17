// Pain Tracker Service Worker - v1.3 (root path fix for Cloudflare deployment)
const CACHE_NAME = 'pain-tracker-v1';
const STATIC_CACHE_NAME = 'pain-tracker-static-v1.3'; // Incremented to force cache update
const DYNAMIC_CACHE_NAME = 'pain-tracker-dynamic-v1.3'; // Incremented to force cache update

// Files to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/404.html',
];

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
  /\/api\/pain-entries/,
  /\/api\/analytics/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== CACHE_NAME
            ) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests (SPA navigations / document requests)
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        // Optionally update dynamic cache
        const navDynCache = await caches.open(DYNAMIC_CACHE_NAME);
        navDynCache.put(request, networkResponse.clone()).catch(() => {});
        return networkResponse;
      } catch {
        // Try cached index.html first, then offline.html fallback
        const navStaticCache = await caches.open(STATIC_CACHE_NAME);
        const offline = await navStaticCache.match('/offline.html');
        const indexFallback = await navStaticCache.match('/index.html');
        return offline || indexFallback || new Response('Offline', { status: 503 });
      }
    })());
    return;
  }

  // Skip service worker for external resources (different origin)
  if (url.origin !== location.origin) {
    // Let external resources (like Google Fonts, CDNs) pass through normally
    // This prevents the service worker from interfering with external requests
    return;
  }

  // Handle different types of requests for same-origin only
  if (request.method === 'GET') {
    if (isStaticAsset(url)) {
      // Static assets: Cache First strategy
      event.respondWith(handleStaticAssets(request));
    } else if (isAPIRequest(url)) {
      // API requests: Network First with cache fallback
      event.respondWith(handleAPIRequests(request));
    } else {
      // Other requests: Network First with cache fallback
      event.respondWith(handleOtherRequests(request));
    }
  } else {
    // POST, PUT, DELETE requests: Network only with offline queue
    event.respondWith(handleMutatingRequests(request));
  }
});

// Handle static assets (CSS, JS, images)
async function handleStaticAssets(request) {
  try {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      // Serve from cache and update in background
      fetch(request).then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      }).catch(() => {
        // Network failed, but we have cache
      });
      
      return cachedResponse;
    }
    
    // Not in cache, try network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Failed to serve static asset:', error);
    // Return fallback if available
    return new Response('Asset not available offline', { status: 503 });
  }
}

// Handle API requests with offline support
async function handleAPIRequests(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch {
    console.log('Service Worker: Network failed for API request, trying cache');
    
    // Network failed, try cache
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // No cache available, return offline response
    return createOfflineResponse(request);
  }
}

// Handle other requests (HTML pages, etc.)
async function handleOtherRequests(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch {
    // Try cache
  const otherDynCache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await otherDynCache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline fallback asset (non-navigation)
  const otherStaticCache = await caches.open(STATIC_CACHE_NAME);
  const offlinePage = await otherStaticCache.match('/offline.html');
    return offlinePage || new Response('Offline - Content not available', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Handle mutating requests (POST, PUT, DELETE) with offline queue
async function handleMutatingRequests(request) {
  try {
    // Try network first
    return await fetch(request);
  } catch (error) {
    // Network failed, queue for later if it's important data
    if (isImportantRequest(request)) {
      await queueFailedRequest(request);
      return new Response(JSON.stringify({
        success: false,
        message: 'Request queued for when online',
        queued: true
      }), {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Not important, just fail
    return new Response(JSON.stringify({
      success: false,
      message: 'Request failed - you are offline',
      error: error.message
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Utility functions
function isStaticAsset(url) {
  return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico|json)$/);
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || 
         API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isImportantRequest(request) {
  const url = new URL(request.url);
  // Queue pain entries and other critical data
  return url.pathname.includes('/api/pain-entries') ||
         url.pathname.includes('/api/emergency');
}

function createOfflineResponse(request) {
  const url = new URL(request.url);
  
  if (url.pathname.includes('/api/pain-entries')) {
    // Return cached entries or empty array
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({
    error: 'Offline - data not available',
    offline: true
  }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Shared offline queue utilities (adapted from src/lib/offline/queue.ts)
async function swOpenCache(name) { return caches.open(name); }
async function swGetQueue() {
  try {
    const cache = await swOpenCache('offline-queue');
    const existing = await cache.match('offline-requests');
    if (existing) {
      const json = await existing.json();
      return Array.isArray(json) ? json : [];
    }
  } catch (e) { console.log('Service Worker: queue get error', e); }
  return [];
}
async function swSaveQueue(queue) {
  try {
    const cache = await swOpenCache('offline-queue');
    await cache.put('offline-requests', new Response(JSON.stringify(queue), { headers: { 'Content-Type': 'application/json' } }));
  } catch (e) { console.log('Service Worker: queue save error', e); }
}
async function queueFailedRequest(request) {
  const data = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.method !== 'GET' ? await request.clone().text() : null,
    timestamp: Date.now()
  };
  const queue = await swGetQueue();
  queue.push(data);
  await swSaveQueue(queue);
  console.log('Service Worker: Queued failed request:', data);
  return data;
}
async function processQueue() {
  const queue = await swGetQueue();
  if (!queue.length) return;
  const remaining = [];
  for (const item of queue) {
    try {
      const res = await fetch(item.url, { method: item.method, headers: item.headers, body: item.body });
      if (res.ok) {
        console.log('Service Worker: Successfully processed queued request:', item.url);
      } else {
        remaining.push(item);
        console.log('Service Worker: Failed queued request:', item.url, res.status);
      }
    } catch (e) {
      remaining.push(item);
      console.log('Service Worker: Error processing queued request:', item.url, e);
    }
  }
  await swSaveQueue(remaining);
}

// Listen for online event to process queue
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ONLINE') {
    processQueue();
  }
});

// Background sync for queued requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'pain-tracker-sync' || event.tag === 'health-data-sync') {
    event.waitUntil(processQueue());
  }
});

// Push notifications for medication reminders
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const notificationOptions = {
    title: data.title || 'Pain Tracker Reminder',
    body: data.body || 'Time to update your pain log',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'pain-tracker-notification',
    data: data.url || '/',
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(
      notificationOptions.title,
      notificationOptions
    )
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    const url = event.notification.data || '/';
    
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clients) => {
          // Check if app is already open
          for (const client of clients) {
            if (client.url.includes(url) && 'focus' in client) {
              return client.focus();
            }
          }
          
          // Open new window/tab
          if (self.clients.openWindow) {
            return self.clients.openWindow(url);
          }
        })
    );
  }
});

console.log('Service Worker: Loaded successfully - v1.3 with root path fix for Cloudflare deployment');