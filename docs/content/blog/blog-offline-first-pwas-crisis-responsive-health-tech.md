---
title: "Offline-First PWAs: Why They Matter for Crisis-Responsive Health Tech"
seoTitle: "Build Offline-First Health Apps: Service Workers & IndexedDB Guide (2025)"
seoDescription: "Learn how to build crisis-responsive health apps that work without internet. Complete guide to Service Workers, IndexedDB, and PWA patterns for healthcare scenarios where connectivity fails."
datePublished: Mon Dec 01 2025 20:00:00 GMT+0000 (Coordinated Universal Time)
slug: offline-first-pwas-crisis-responsive-health-tech
cover: https://cdn.hashnode.com/res/hashnode/image/upload/v1764607200000/offline-first-pwa-health-tech-cover.png
tags: pwa, offline-first, healthcare, service-worker, indexeddb, javascript, typescript, webdev, progressive-web-apps

---

# Offline-First PWAs: Why They Matter for Crisis-Responsive Health Tech

> **TL;DR:** Health apps fail when users need them most—in hospitals with spotty WiFi, rural areas without coverage, or during emergencies when networks are overloaded. This guide shows you how to build offline-first PWAs using Service Workers and IndexedDB, with real code from a production health app, so your users can track their health data even when the internet can't.

---

Last year, I watched a chronic pain patient try to log a severe flare-up in the ER waiting room. The hospital's WiFi was overloaded. Her cellular signal was one bar. The pain tracking app she'd been using for months—the one with all her medication history, all her doctor notes, all her carefully documented patterns—just showed a spinner.

She couldn't add a single entry. Couldn't export her history for the ER doctor. Couldn't do anything except wait for the network to maybe come back.

**Her health app failed her at the exact moment she needed it most.**

That incident became the founding principle for how I built [Pain Tracker](https://paintracker.ca): **if it doesn't work offline, it doesn't work for healthcare.**

---

## The Connectivity Lie: When Health Apps Meet Reality

Most health apps are built with a hidden assumption: *the user will always have internet access.* This assumption is catastrophically wrong in exactly the scenarios where health tracking matters most.

### Real-World Scenarios Where Connectivity Fails

| Scenario | Why It Happens | Impact |
|----------|---------------|--------|
| **Hospital Emergency Rooms** | Overloaded WiFi, poor cellular penetration through concrete/metal | Can't access medication history when doctors need it |
| **Rural Areas** | No cell towers, satellite internet only | Chronic condition patients can't track during flares |
| **During Natural Disasters** | Cell towers down, infrastructure damaged | Health tracking fails when stress/pain is highest |
| **International Travel** | No data roaming, expensive/spotty WiFi | Patients lose continuity of care |
| **Low-Income Areas** | Limited data plans, throttled connections | Users forced to choose between data and health tracking |
| **Airplane Mode / Battery Saving** | User choice to conserve resources | App becomes useless |
| **Network Congestion** | Major events, peak hours | Timeout errors at unpredictable times |

### The Numbers Are Worse Than You Think

According to FCC data, **21 million Americans** lack access to broadband internet. In rural areas, that jumps to **27% of residents**. And even in urban areas with good coverage, hospital buildings are notorious dead zones for cellular signals.

**For chronic pain patients specifically:**
- 40% live in rural or semi-rural areas (CDC, 2023)
- Pain flares often correlate with weather events—the same events that disrupt connectivity
- ER visits (where connectivity is worst) are common for pain crises

If your health app requires a network connection, you're building a tool that fails exactly when your users need it most.

---

## The Architecture That Changes Everything: Local-First

The solution isn't to "handle offline gracefully" with error messages. It's to **design offline as the primary mode** and treat connectivity as a bonus.

```
┌─────────────────────────────────────────────────────────────────────┐
│              TRADITIONAL "OFFLINE-CAPABLE" ARCHITECTURE             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User Action ──► API Request ──► Cloud Server ──► Database         │
│                      │                               │              │
│                      ▼                               ▼              │
│                 [If offline]                    [Response]          │
│                      │                               │              │
│                      ▼                               │              │
│              "No connection"  ◄──────────────────────┘              │
│                error message                                        │
│                                                                     │
│  Problem: User CAN'T DO ANYTHING without network                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    LOCAL-FIRST ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User Action ──► Local State ──► IndexedDB ──► UI Updates          │
│                      │                 │                            │
│                      │                 └──► (Optional: Sync Queue)  │
│                      │                              │               │
│                      │                              ▼               │
│                      │               [When online: Background Sync] │
│                      │                              │               │
│                      ▼                              ▼               │
│            User sees immediate                  Backups via export  │
│            success. Always.                     (user-controlled)   │
│                                                                     │
│  Benefit: Works 100% offline, syncs when it can                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### The Core Principle

> **"The network is a sync mechanism, not a requirement."**

Your app should:
1. **Work completely offline** as the default state
2. **Store everything locally first** before any network activity
3. **Sync in the background** when connectivity is available
4. **Handle conflicts gracefully** when syncing delayed data

This isn't just about error handling—it's a fundamental rethinking of where data lives and how it flows.

---

## The Tech Stack: What You Actually Need

Building offline-first PWAs requires three core technologies working together:

| Technology | Purpose | Browser Support |
|------------|---------|-----------------|
| **Service Workers** | Intercept network requests, cache assets, enable offline | Chrome 40+, Firefox 44+, Safari 11.1+ |
| **IndexedDB** | Structured local database for complex data | Chrome 24+, Firefox 16+, Safari 10+ |
| **Cache API** | Store HTTP responses for offline access | Chrome 40+, Firefox 39+, Safari 11.1+ |

**Supporting technologies:**
- **Web App Manifest** — Makes your PWA installable
- **Background Sync API** — Retries failed requests when online (Chrome/Edge only)
- **Workbox** — Google's library for Service Worker patterns (optional but helpful)

Let me walk you through implementing each one.

---

## Part 1: Service Workers — The Offline Foundation

A Service Worker is a JavaScript file that runs separately from your main app, intercepting all network requests. This is what makes offline-first possible.

### Basic Service Worker Lifecycle

```javascript
// public/sw.js - The service worker file

const CACHE_NAME = 'my-health-app-v1.0';

// Assets to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js',
  '/offline.html'  // Fallback page
];

// 1. INSTALL: Cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching critical assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .catch((err) => {
        console.error('[SW] Failed to cache:', err);
      })
  );
});

// 2. ACTIVATE: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  // Take control of all pages immediately
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Delete old cache versions
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
    ])
  );
});

// 3. FETCH: Intercept all requests
self.addEventListener('fetch', (event) => {
  // Handle the request
  event.respondWith(handleFetch(event.request));
});
```

### Cache Strategies for Health Apps

Different types of requests need different caching strategies. Here's the pattern I use:

```javascript
// public/sw.js - Continued

async function handleFetch(request) {
  const url = new URL(request.url);
  
  // Strategy 1: Cache-First for static assets
  // (CSS, JS, images - they don't change often)
  if (isStaticAsset(url)) {
    return cacheFirst(request);
  }
  
  // Strategy 2: Network-First for API data
  // (Try network, fall back to cache if offline)
  if (isApiRequest(url)) {
    return networkFirst(request);
  }
  
  // Strategy 3: Network-Only for analytics
  // (Don't cache, doesn't matter if it fails)
  if (isAnalytics(url)) {
    return fetch(request).catch(() => new Response(null, { status: 204 }));
  }
  
  // Default: Network with cache fallback
  return networkFirst(request);
}

// Cache-First: Serve from cache, update in background
async function cacheFirst(request) {
  const cached = await caches.match(request);
  
  if (cached) {
    // Serve cached version immediately
    // Update cache in background for next time
    fetchAndCache(request);
    return cached;
  }
  
  // Not in cache: fetch and cache
  return fetchAndCache(request);
}

// Network-First: Try network, fall back to cache
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses for offline fallback
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Network failed: try cache
    const cached = await caches.match(request);
    
    if (cached) {
      console.log('[SW] Serving from cache:', request.url);
      return cached;
    }
    
    // Nothing cached: return offline fallback
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    return new Response(null, { status: 504, statusText: 'Gateway Timeout' });
  }
}

async function fetchAndCache(request) {
  const response = await fetch(request);
  
  if (response.ok && response.type !== 'opaque') {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  
  return response;
}

// Helper functions
function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|svg|gif|woff2?)$/i.test(url.pathname);
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isAnalytics(url) {
  return url.hostname.includes('analytics') || 
         url.hostname.includes('google-analytics');
}
```

### Registering the Service Worker

```typescript
// src/utils/pwa-registration.ts

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    console.log('Service worker registered:', registration.scope);
    
    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available
          console.log('New version available! Refresh to update.');
          dispatchUpdateEvent();
        }
      });
    });
    
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

function dispatchUpdateEvent() {
  window.dispatchEvent(new CustomEvent('sw-update-available'));
}
```

---

## Part 2: IndexedDB — Your Local Database

IndexedDB is a powerful client-side database that can store structured data, including files and blobs. It's essential for health apps that need to store complex entries locally.

### Why Not Just Use localStorage?

| Feature | localStorage | IndexedDB |
|---------|-------------|-----------|
| **Storage Limit** | ~5-10 MB | 50%+ of disk space |
| **Data Types** | Strings only | Objects, arrays, blobs, files |
| **Indexing** | None | Full index support |
| **Transactions** | None | ACID transactions |
| **Async** | ❌ Blocking | ✅ Non-blocking |
| **Query Capability** | None | Range queries, cursors |

For a pain tracking app storing hundreds or thousands of entries with complex data structures, IndexedDB is the only real option.

### Building an Offline Storage Service

Here's the complete implementation I use in Pain Tracker:

```typescript
// src/lib/offline-storage.ts

// Type definitions for stored data
interface PainEntry {
  id?: number;
  timestamp: string;
  painLevel: number;
  location: string;
  triggers?: string[];
  medications?: string[];
  notes?: string;
  synced: boolean;
  lastModified: string;
}

interface SyncQueueItem {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  priority: 'high' | 'medium' | 'low';
  retryCount: number;
  timestamp: string;
}

export class OfflineStorageService {
  private dbName = 'health-tracker-offline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  
  // Store names
  private stores = {
    entries: 'pain-entries',
    syncQueue: 'sync-queue',
    settings: 'settings'
  };

  // Initialize the database
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      // Schema setup (runs on first open or version upgrade)
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Pain entries store
        if (!db.objectStoreNames.contains(this.stores.entries)) {
          const entriesStore = db.createObjectStore(this.stores.entries, {
            keyPath: 'id',
            autoIncrement: true
          });
          
          // Create indexes for querying
          entriesStore.createIndex('timestamp', 'timestamp', { unique: false });
          entriesStore.createIndex('synced', 'synced', { unique: false });
          entriesStore.createIndex('painLevel', 'painLevel', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains(this.stores.syncQueue)) {
          const syncStore = db.createObjectStore(this.stores.syncQueue, {
            keyPath: 'id',
            autoIncrement: true
          });
          
          syncStore.createIndex('priority', 'priority', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Settings store
        if (!db.objectStoreNames.contains(this.stores.settings)) {
          db.createObjectStore(this.stores.settings, { keyPath: 'key' });
        }
      };
    });
  }

  // Add a new pain entry
  async addEntry(entry: Omit<PainEntry, 'id'>): Promise<number> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.entries], 'readwrite');
      const store = transaction.objectStore(this.stores.entries);
      
      const entryWithMeta: Omit<PainEntry, 'id'> = {
        ...entry,
        timestamp: entry.timestamp || new Date().toISOString(),
        synced: false,
        lastModified: new Date().toISOString()
      };
      
      const request = store.add(entryWithMeta);
      
      request.onsuccess = () => {
        console.log('Entry saved locally:', request.result);
        resolve(request.result as number);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Get all entries (for display)
  async getAllEntries(): Promise<PainEntry[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.entries], 'readonly');
      const store = transaction.objectStore(this.stores.entries);
      const index = store.index('timestamp');
      
      // Get entries sorted by timestamp (most recent first)
      const request = index.openCursor(null, 'prev');
      const entries: PainEntry[] = [];
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        
        if (cursor) {
          entries.push(cursor.value);
          cursor.continue();
        } else {
          resolve(entries);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Get entries by date range
  async getEntriesByDateRange(startDate: Date, endDate: Date): Promise<PainEntry[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.entries], 'readonly');
      const store = transaction.objectStore(this.stores.entries);
      const index = store.index('timestamp');
      
      const range = IDBKeyRange.bound(
        startDate.toISOString(),
        endDate.toISOString()
      );
      
      const request = index.getAll(range);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get unsynced entries (for background sync)
  async getUnsyncedEntries(): Promise<PainEntry[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.entries], 'readonly');
      const store = transaction.objectStore(this.stores.entries);
      const index = store.index('synced');
      
      const request = index.getAll(false);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Mark entry as synced
  async markAsSynced(id: number): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.entries], 'readwrite');
      const store = transaction.objectStore(this.stores.entries);
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const entry = getRequest.result;
        if (entry) {
          entry.synced = true;
          const updateRequest = store.put(entry);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Entry not found'));
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Queue a request for later syncing
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'retryCount' | 'timestamp'>): Promise<number> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.syncQueue], 'readwrite');
      const store = transaction.objectStore(this.stores.syncQueue);
      
      const queueItem: Omit<SyncQueueItem, 'id'> = {
        ...item,
        timestamp: new Date().toISOString(),
        retryCount: 0
      };
      
      const request = store.add(queueItem);
      
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  // Get pending sync items (sorted by priority)
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.syncQueue], 'readonly');
      const store = transaction.objectStore(this.stores.syncQueue);
      
      const request = store.getAll();
      
      request.onsuccess = () => {
        // Sort by priority: high → medium → low
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        const sorted = request.result.sort((a, b) => {
          const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
        resolve(sorted);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Remove from sync queue (after successful sync)
  async removeFromSyncQueue(id: number): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.stores.syncQueue], 'readwrite');
      const store = transaction.objectStore(this.stores.syncQueue);
      
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Export all data (for backup or doctor reports)
  async exportAllData(): Promise<{ entries: PainEntry[]; exportDate: string }> {
    const entries = await this.getAllEntries();
    
    return {
      entries,
      exportDate: new Date().toISOString()
    };
  }

  // Get storage statistics
  async getStorageStats(): Promise<{ used: number; quota: number; percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      
      return {
        used,
        quota,
        percentage: quota > 0 ? (used / quota) * 100 : 0
      };
    }
    
    return { used: 0, quota: 0, percentage: 0 };
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageService();
```

### Using the Storage Service in React

```typescript
// src/hooks/usePainEntries.ts

import { useState, useEffect, useCallback } from 'react';
import { offlineStorage } from '../lib/offline-storage';

interface PainEntry {
  id?: number;
  timestamp: string;
  painLevel: number;
  location: string;
  triggers?: string[];
  notes?: string;
  synced: boolean;
  lastModified: string;
}

export function usePainEntries() {
  const [entries, setEntries] = useState<PainEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, []);
  
  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await offlineStorage.getAllEntries();
      setEntries(data);
    } catch (err) {
      setError('Failed to load entries');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const addEntry = useCallback(async (entry: Omit<PainEntry, 'id' | 'synced' | 'lastModified'>) => {
    try {
      // Save locally first (instant)
      const id = await offlineStorage.addEntry({
        ...entry,
        synced: false,
        lastModified: new Date().toISOString()
      });
      
      // Update local state immediately
      const newEntry: PainEntry = {
        ...entry,
        id,
        synced: false,
        lastModified: new Date().toISOString()
      };
      
      setEntries(prev => [newEntry, ...prev]);
      
      // Queue for background sync
      if (navigator.onLine) {
        // Try to sync immediately
        await syncEntry(newEntry);
      } else {
        // Queue for later
        await offlineStorage.addToSyncQueue({
          url: '/api/entries',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEntry),
          priority: 'high'
        });
      }
      
      return id;
    } catch (err) {
      setError('Failed to save entry');
      throw err;
    }
  }, []);
  
  return { entries, loading, error, addEntry, refresh: loadEntries };
}
```

---

## Part 3: Background Sync — The Reconnection Handler

When your user comes back online, you need to sync their offline data to the server. Here's a robust background sync implementation:

```typescript
// src/lib/background-sync.ts

import { offlineStorage } from './offline-storage';

interface SyncResult {
  success: boolean;
  itemId: number;
  error?: string;
}

interface SyncStats {
  total: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

export class BackgroundSyncService {
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private retryDelays = [1000, 5000, 15000, 30000]; // Progressive backoff
  private maxRetries = 4;

  constructor() {
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  private setupEventListeners(): void {
    // Listen for connection changes
    window.addEventListener('online', () => {
      console.log('[Sync] Connection restored');
      this.isOnline = true;
      this.syncAll();
    });

    window.addEventListener('offline', () => {
      console.log('[Sync] Connection lost');
      this.isOnline = false;
    });

    // Sync when app becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isOnline) {
        this.syncAll();
      }
    });
  }

  private startPeriodicSync(): void {
    // Try to sync every 5 minutes while online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncAll();
      }
    }, 5 * 60 * 1000);
  }

  async syncAll(): Promise<SyncStats> {
    if (this.syncInProgress) {
      console.log('[Sync] Already in progress, skipping');
      return { total: 0, succeeded: 0, failed: 0, errors: [] };
    }

    if (!this.isOnline) {
      console.log('[Sync] Offline, cannot sync');
      return { total: 0, succeeded: 0, failed: 0, errors: ['Offline'] };
    }

    this.syncInProgress = true;
    console.log('[Sync] Starting sync process');

    const stats: SyncStats = { total: 0, succeeded: 0, failed: 0, errors: [] };

    try {
      const queue = await offlineStorage.getSyncQueue();
      stats.total = queue.length;

      if (queue.length === 0) {
        console.log('[Sync] Nothing to sync');
        return stats;
      }

      console.log(`[Sync] Processing ${queue.length} items`);

      for (const item of queue) {
        const result = await this.syncItem(item);

        if (result.success) {
          stats.succeeded++;
          await offlineStorage.removeFromSyncQueue(item.id!);
          console.log(`[Sync] ✓ Synced: ${item.method} ${item.url}`);
        } else {
          if (item.retryCount >= this.maxRetries) {
            stats.failed++;
            stats.errors.push(`Max retries exceeded: ${item.url}`);
            await offlineStorage.removeFromSyncQueue(item.id!);
            console.error(`[Sync] ✗ Giving up: ${item.url}`);
          } else {
            // Schedule retry with backoff
            await this.scheduleRetry(item);
            console.log(`[Sync] ⟳ Will retry: ${item.url}`);
          }
        }
      }

      this.dispatchSyncComplete(stats);
    } catch (error) {
      console.error('[Sync] Sync process failed:', error);
      stats.errors.push(String(error));
    } finally {
      this.syncInProgress = false;
    }

    return stats;
  }

  private async syncItem(item: any): Promise<SyncResult> {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body
      });

      if (response.ok) {
        return { success: true, itemId: item.id };
      }

      // Determine if we should retry
      const shouldRetry = response.status >= 500 || response.status === 429;
      
      return {
        success: false,
        itemId: item.id,
        error: `HTTP ${response.status}`,
        ...(shouldRetry ? {} : { noRetry: true })
      };
    } catch (error) {
      return {
        success: false,
        itemId: item.id,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  private async scheduleRetry(item: any): Promise<void> {
    const delay = this.retryDelays[Math.min(item.retryCount, this.retryDelays.length - 1)];
    
    // Update retry count in IndexedDB
    // (Implementation depends on your schema)
    
    setTimeout(() => {
      if (this.isOnline) {
        this.syncAll();
      }
    }, delay);
  }

  private dispatchSyncComplete(stats: SyncStats): void {
    window.dispatchEvent(new CustomEvent('sync-complete', { detail: stats }));
  }

  // Force immediate sync (user-triggered)
  async forceSync(): Promise<SyncStats> {
    return this.syncAll();
  }

  // Get sync status
  getStatus(): { online: boolean; syncing: boolean } {
    return {
      online: this.isOnline,
      syncing: this.syncInProgress
    };
  }
}

export const backgroundSync = new BackgroundSyncService();
```

---

## Part 4: Putting It All Together — Complete PWA Integration

Here's how all the pieces connect in a real application:

### React App Structure

```
src/
├── lib/
│   ├── offline-storage.ts      # IndexedDB wrapper
│   ├── background-sync.ts      # Sync service
│   └── pwa-manager.ts          # PWA utilities
├── hooks/
│   ├── usePainEntries.ts       # Data management hook
│   ├── useOnlineStatus.ts      # Connection monitoring
│   └── usePWAInstall.ts        # Install prompt handling
├── components/
│   ├── OfflineIndicator.tsx    # Shows offline status
│   ├── SyncStatus.tsx          # Shows pending syncs
│   └── InstallPrompt.tsx       # PWA install banner
└── App.tsx
```

### Connection Status Hook

```typescript
// src/hooks/useOnlineStatus.ts

import { useState, useEffect } from 'react';
import { backgroundSync } from '../lib/background-sync';

interface OnlineStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  lastSyncTime: Date | null;
}

export function useOnlineStatus(): OnlineStatus {
  const [status, setStatus] = useState<OnlineStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingSyncCount: 0,
    lastSyncTime: null
  });

  useEffect(() => {
    const updateOnline = () => setStatus(s => ({ ...s, isOnline: true }));
    const updateOffline = () => setStatus(s => ({ ...s, isOnline: false }));
    
    const handleSyncComplete = (event: CustomEvent) => {
      setStatus(s => ({
        ...s,
        isSyncing: false,
        pendingSyncCount: 0,
        lastSyncTime: new Date()
      }));
    };

    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOffline);
    window.addEventListener('sync-complete', handleSyncComplete as EventListener);

    // Get initial pending count
    import('../lib/offline-storage').then(({ offlineStorage }) => {
      offlineStorage.getSyncQueue().then(queue => {
        setStatus(s => ({ ...s, pendingSyncCount: queue.length }));
      });
    });

    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOffline);
      window.removeEventListener('sync-complete', handleSyncComplete as EventListener);
    };
  }, []);

  return status;
}
```

### Offline Indicator Component

```typescript
// src/components/OfflineIndicator.tsx

import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingSyncCount } = useOnlineStatus();

  if (isOnline && pendingSyncCount === 0) {
    return null; // All good, show nothing
  }

  return (
    <div 
      className={`fixed bottom-4 left-4 px-4 py-2 rounded-lg shadow-lg
        ${isOnline ? 'bg-blue-500' : 'bg-yellow-500'} text-white`}
      role="status"
      aria-live="polite"
    >
      {!isOnline && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-yellow-200 rounded-full animate-pulse" />
          <span>You're offline — data saved locally</span>
        </div>
      )}
      
      {isOnline && isSyncing && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-spin" />
          <span>Syncing...</span>
        </div>
      )}
      
      {isOnline && !isSyncing && pendingSyncCount > 0 && (
        <div className="flex items-center gap-2">
          <span>{pendingSyncCount} items pending sync</span>
        </div>
      )}
    </div>
  );
}
```

---

## Healthcare-Specific Patterns

When building offline-first for healthcare specifically, there are additional considerations:

### 1. Priority-Based Sync Queue

Not all data is equally urgent. Pain entries should sync before analytics.

```typescript
// Sync priority levels for healthcare
const SYNC_PRIORITIES = {
  // Critical: sync immediately when online
  EMERGENCY_CONTACT: 'high',
  MEDICATION_CHANGE: 'high',
  CRISIS_ENTRY: 'high',
  
  // Important: sync soon
  PAIN_ENTRY: 'high',
  SYMPTOM_LOG: 'medium',
  
  // Can wait: sync when convenient
  SETTINGS_CHANGE: 'low',
  ANALYTICS: 'low',
  ACTIVITY_LOG: 'low'
};
```

### 2. Persistent Storage Request

For health data, you want to prevent the browser from evicting your data:

```typescript
async function requestPersistentStorage(): Promise<boolean> {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    const persistent = await navigator.storage.persist();
    
    if (persistent) {
      console.log('Storage will not be cleared except by explicit user action');
    } else {
      console.warn('Storage may be cleared under storage pressure');
    }
    
    return persistent;
  }
  
  return false;
}
```

### 3. Data Export for Doctor Visits

Users need to be able to export their data even when offline:

```typescript
async function exportForDoctor(format: 'pdf' | 'csv' | 'json'): Promise<Blob> {
  // All data is local, so this works offline
  const data = await offlineStorage.exportAllData();
  
  switch (format) {
    case 'json':
      return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    
    case 'csv':
      return new Blob([convertToCSV(data.entries)], { type: 'text/csv' });
    
    case 'pdf':
      // Use a library like jsPDF that works client-side
      return generatePDF(data.entries);
  }
}
```

### 4. Crisis Detection That Works Offline

For apps with crisis detection features, this must work without network:

```typescript
// All analysis happens in the browser
function detectCrisisIndicators(entry: PainEntry): CrisisLevel {
  const indicators = [];
  
  // High pain level
  if (entry.painLevel >= 9) {
    indicators.push('severe_pain');
  }
  
  // Concerning language in notes
  if (entry.notes && containsConcerningLanguage(entry.notes)) {
    indicators.push('concerning_language');
  }
  
  // Rapid escalation (check against local history)
  const recentEntries = await offlineStorage.getEntriesByDateRange(
    new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    new Date()
  );
  
  if (detectEscalation(recentEntries)) {
    indicators.push('rapid_escalation');
  }
  
  return calculateCrisisLevel(indicators);
}
```

---

## Best Practices & Gotchas

### ✅ Do This

| Practice | Why |
|----------|-----|
| **Save locally first, always** | User gets instant feedback even offline |
| **Show sync status clearly** | Users need to know their data is safe |
| **Request persistent storage** | Prevents accidental data loss |
| **Implement retry with backoff** | Avoids hammering servers when they're down |
| **Test with airplane mode** | Simulate real offline scenarios |
| **Handle storage quota errors** | IndexedDB isn't unlimited |

### ❌ Avoid This

| Anti-Pattern | Why It's Bad |
|--------------|--------------|
| **Requiring account creation** | Can't create accounts offline |
| **Showing spinners for local operations** | Local should be instant |
| **Deleting unsynced data on logout** | Users will lose work |
| **Ignoring iOS Safari limitations** | Different storage behavior |
| **Syncing everything at once** | Can block UI on large datasets |

### Browser-Specific Quirks

```typescript
// Check for IndexedDB quirks
function checkStorageSupport(): StorageSupport {
  return {
    // Safari has IndexedDB but behaves differently
    indexedDB: 'indexedDB' in window,
    
    // Safari private mode used to block IndexedDB entirely
    // Now it works but clears on close
    privateMode: isPrivateBrowsing(),
    
    // Background sync is Chromium-only
    backgroundSync: 'sync' in (window.ServiceWorkerRegistration?.prototype || {}),
    
    // Persistent storage permission
    persistentStorage: 'storage' in navigator && 'persist' in navigator.storage
  };
}
```

---

## Testing Your Offline Implementation

### Chrome DevTools Method

```
1. Open DevTools (F12)
2. Go to Application tab → Service Workers
3. Check "Offline" checkbox
4. Test your app
5. Check Application → IndexedDB to see stored data
```

### Playwright E2E Test

```typescript
// e2e/tests/pwa-offline.spec.ts

import { test, expect } from '@playwright/test';

test('should work offline after initial load', async ({ page, context }) => {
  // Load app online first (caches assets)
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Go offline
  await context.setOffline(true);
  
  // Reload page
  await page.reload();
  
  // App should still load
  await expect(page.locator('h1')).toBeVisible();
  
  // Add an entry while offline
  await page.fill('[data-testid="pain-level"]', '7');
  await page.click('[data-testid="save-entry"]');
  
  // Should show success (saved locally)
  await expect(page.locator('[data-testid="save-success"]')).toBeVisible();
  
  // Should show offline indicator
  await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
});

test('should sync when coming back online', async ({ page, context }) => {
  await page.goto('/');
  
  // Go offline and create entry
  await context.setOffline(true);
  await page.fill('[data-testid="pain-level"]', '5');
  await page.click('[data-testid="save-entry"]');
  
  // Verify pending sync indicator
  await expect(page.locator('[data-testid="pending-sync"]')).toContainText('1');
  
  // Come back online
  await context.setOffline(false);
  
  // Wait for sync
  await expect(page.locator('[data-testid="pending-sync"]')).not.toBeVisible();
});
```

---

## Frequently Asked Questions

**Q: How much can I store in IndexedDB?**

A: It varies by browser, but typically 50% of available disk space. In practice, that's often hundreds of GB. For a pain tracking app, you could store millions of entries.

**Q: What if the user clears their browser data?**

A: They lose local data. This is why:
1. Request persistent storage (prevents automatic eviction)
2. Encourage data export/backup
3. Encourage regular password-protected exports

**Q: Does this work on iOS Safari?**

A: Yes, but with caveats:
- Storage in private browsing mode clears on close
- Background sync isn't supported (manual sync only)
- PWA installation requires "Add to Home Screen"

**Q: How do I handle conflicts when syncing?**

A: Common strategies:
- **Last-write-wins**: Simpler, but can lose data
- **Merge**: Combine server and local changes
- **User resolution**: Show conflicts and let user choose

**Q: What about HIPAA and similar regulatory requirements?**

A: Offline-first can reduce server-side handling of sensitive data:
- More data can stay on the user’s device by default
- You may avoid routinely storing sensitive health data on your servers
- Encryption at rest helps with lost/stolen device risk
- But: consult a compliance expert for your specific situation and role

---

## The Crisis-Responsive Payoff

When you build offline-first, something magical happens: **your app becomes crisis-responsive by default.**

That chronic pain patient in the ER? She can:
- ✅ Log her current flare immediately
- ✅ Pull up her complete medication history
- ✅ Export a PDF summary for the ER doctor
- ✅ All without a single network request

The rural fibromyalgia patient? They can:
- ✅ Track their symptoms during a flare
- ✅ Review their patterns over months
- ✅ Prepare for their next telemedicine appointment
- ✅ Even when their satellite internet is down

The traveling patient? They can:
- ✅ Maintain continuity of care across time zones
- ✅ Track without expensive roaming data
- ✅ Never lose an entry due to airplane mode

**This is what healthcare software should have been all along.**

---

## Try It Yourself

Want to see offline-first health tech in action? [Pain Tracker](https://paintracker.ca) implements everything in this article:

- Local-first storage with IndexedDB
- Full offline functionality
- Background sync when available
- Crisis detection that works offline
- Export your data anytime, anywhere

**Test the offline experience yourself:**
1. Visit [paintracker.ca](https://paintracker.ca)
2. Add a few pain entries
3. Turn on airplane mode
4. Keep using the app
5. Everything still works

The source code is open on [GitHub](https://github.com/CrisisCore-Systems/pain-tracker) — fork it, learn from it, or use it as a reference for your own offline-first projects.

---

## Resources & Further Reading

**Fundamentals:**
- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN: IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [web.dev: Offline Cookbook](https://web.dev/articles/offline-cookbook)

**Tools:**
- [Workbox](https://developers.google.com/web/tools/workbox) — Google's Service Worker library
- [idb](https://github.com/jakearchibald/idb) — IndexedDB wrapper by Jake Archibald
- [localForage](https://localforage.github.io/localForage/) — Simple async storage

**Testing:**
- [Playwright PWA Testing](https://playwright.dev/docs/test-webserver#pwa)
- [Chrome DevTools: Application Tab](https://developer.chrome.com/docs/devtools/storage/)

**Healthcare-Specific:**
- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [FDA Mobile Medical Applications Guidance](https://www.fda.gov/medical-devices/digital-health-center-excellence/device-software-functions-including-mobile-medical-applications)

---

*Building healthcare software that doesn't fail when users need it most isn't just good engineering — it's a moral imperative. The techniques in this article aren't new or complex. The only reason most health apps don't work offline is because their developers chose not to prioritize it.*

*Choose differently.*

---

*Questions about offline-first health app development? Want to contribute to Pain Tracker? Find me on [GitHub](https://github.com/CrisisCore-Systems) or open a discussion. I'm always happy to talk about building technology that actually serves patients.*
