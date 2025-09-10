// Pain Tracker Service Worker
const CACHE_NAME = 'pain-tracker-v1';
const STATIC_CACHE_NAME = 'pain-tracker-static-v1';
const DYNAMIC_CACHE_NAME = 'pain-tracker-dynamic-v1';

// Files to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/404.html',
  // Add other static assets as needed
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

  // Handle different types of requests
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
  } catch (error) {
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
  } catch (error) {
    // Try cache
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline fallback page
    const offlinePage = await caches.match('/404.html');
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
  return url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico)$/);
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

// Queue failed requests for retry when online
async function queueFailedRequest(request) {
  const queue = await getQueue();
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: request.method !== 'GET' ? await request.text() : null,
    timestamp: Date.now()
  };
  
  queue.push(requestData);
  await saveQueue(queue);
  
  console.log('Service Worker: Queued failed request:', requestData);
}

// Get queue from IndexedDB
async function getQueue() {
  try {
    const cache = await caches.open('offline-queue');
    const response = await cache.match('offline-requests');
    
    if (response) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.log('Service Worker: Error getting queue:', error);
  }
  
  return [];
}

// Save queue to IndexedDB
async function saveQueue(queue) {
  try {
    const cache = await caches.open('offline-queue');
    const response = new Response(JSON.stringify(queue), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put('offline-requests', response);
  } catch (error) {
    console.log('Service Worker: Error saving queue:', error);
  }
}

// Process queued requests when back online
async function processQueue() {
  const queue = await getQueue();
  const processed = [];
  
  for (const requestData of queue) {
    try {
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body
      });
      
      if (response.ok) {
        processed.push(requestData);
        console.log('Service Worker: Successfully processed queued request:', requestData.url);
      } else {
        console.log('Service Worker: Failed to process queued request:', requestData.url, response.status);
      }
    } catch (error) {
      console.log('Service Worker: Error processing queued request:', requestData.url, error);
    }
  }
  
  // Remove processed requests from queue
  if (processed.length > 0) {
    const remainingQueue = queue.filter(req => !processed.includes(req));
    await saveQueue(remainingQueue);
  }
}

// Listen for online event to process queue
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'ONLINE') {
    processQueue();
  }
});

// Background sync for queued requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'pain-tracker-sync') {
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

console.log('Service Worker: Loaded successfully');