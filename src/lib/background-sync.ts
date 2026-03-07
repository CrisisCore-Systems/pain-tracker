/**
 * Background Sync Service
 * Handles synchronization of offline data when connection is restored
 */

import { offlineStorage } from './offline-storage';
import { secureStorage } from './storage/secureStorage';
import { ALLOWED_SYNC_ROUTES } from './background-sync-allowlist';

interface SyncResult {
  success: boolean;
  itemId: number;
  error?: string;
  retryAfter?: number;
}

interface SyncStats {
  totalItems: number;
  successCount: number;
  failureCount: number;
  skippedCount: number;
  errors: string[];
}

// Shape of items stored in the sync queue (mirrors offlineStorage SyncQueueItem)
interface SyncQueueItemShape {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp?: string;
  priority: 'high' | 'medium' | 'low';
  retryCount?: number;
  type: string;
  metadata?: Record<string, unknown>;
}

// Payload convenience types for public API methods
type GenericRecord = Record<string, unknown>;
type QueuePayload = GenericRecord | FormData | string | number | boolean | null | undefined;

export class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private readonly retryTimeouts: Map<number, NodeJS.Timeout> = new Map();
  private readonly maxRetries: number = 3;
  private readonly retryDelays: number[] = [1000, 5000, 15000]; // Progressive delays in ms

  private readonly allowedSyncMatchers: Array<{ method: string; path: RegExp }>;

  private getAllowedApiPathPrefixes(): string[] {
    const prefixes = new Set<string>();
    prefixes.add('/api');

    const configured = import.meta.env.VITE_API_BASE_URL;
    if (typeof configured === 'string' && configured.startsWith('/')) {
      const normalized = configured.replace(/\/+$/, '');
      if (normalized.length > 0) prefixes.add(normalized);
    }

    return Array.from(prefixes);
  }

  private buildAllowedSyncMatchers(): Array<{ method: string; path: RegExp }> {
    const escapeRe = (s: string) =>
      s.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\\$&`);
    const prefixes = this.getAllowedApiPathPrefixes().map(p => p.replace(/\/+$/, ''));
    const out: Array<{ method: string; path: RegExp }> = [];

    const compile = (prefix: string, canonicalApiPath: string): RegExp => {
      // Map canonical `/api/...` path to configured prefix (e.g. `/pain-tracker/api`).
      const effective = canonicalApiPath.replace(/^\/api/, prefix);

      const segments = effective.split('/').filter(Boolean);
      const reSegments = segments.map(seg => {
        if (seg.startsWith(':')) {
          const name = seg.slice(1);
          // Governance: only allow numeric IDs unless explicitly expanded.
          if (name === 'id') return String.raw`\\d+`;
          throw new Error(`Unsupported sync allowlist param :${name}`);
        }
        return escapeRe(seg);
      });

      return new RegExp(`^/${reSegments.join('/')}$`);
    };

    // Allowlist: only the routes we explicitly permit for offline replay.
    // Governance: adding a new route MUST update the pinned allowlist + tests.
    for (const prefix of prefixes) {
      for (const route of ALLOWED_SYNC_ROUTES) {
        if (!route.path.startsWith('/api/')) {
          throw new Error(`ALLOWED_SYNC_ROUTES path must start with /api/: ${route.path}`);
        }
        out.push({ method: route.method, path: compile(prefix, route.path) });
      }
    }

    return out;
  }

  private isAllowedSyncRequest(method: string, url: string): boolean {
    let parsed: URL;
    try {
      parsed = new URL(url, globalThis.location.origin);
    } catch {
      return false;
    }

    if (parsed.origin !== globalThis.location.origin) return false;

    const m = method.toUpperCase();
    const path = parsed.pathname;
    return this.allowedSyncMatchers.some(r => r.method === m && r.path.test(path));
  }

  private sanitizeReplayHeaders(headers: Record<string, string>): Record<string, string> {
    // Defense-in-depth: only forward a small allowlist of headers.
    // (Prevents queued items from smuggling unexpected headers on replay.)
    const allowed = new Set(['authorization', 'content-type', 'accept']);
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(headers)) {
      const key = k.toLowerCase();
      if (allowed.has(key)) out[k] = v;
    }
    return out;
  }

  private constructor() {
    this.allowedSyncMatchers = this.buildAllowedSyncMatchers();
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  private setupEventListeners(): void {
    // Listen for online/offline events
    globalThis.addEventListener('online', () => {
      this.isOnline = true;
      console.log('BackgroundSync: Connection restored, starting sync');
      this.syncAllPendingData();
    });

    globalThis.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('BackgroundSync: Connection lost');
    });

    // Listen for visibility change to sync when app becomes active
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isOnline) {
        this.syncAllPendingData();
      }
    });

    // Listen for PWA events
    globalThis.addEventListener('pwa-online', () => {
      this.isOnline = true;
      this.syncAllPendingData();
    });
  }

  private async dropDisallowedReplayItem(item: SyncQueueItemShape, stats: SyncStats): Promise<void> {
    stats.failureCount++;
    stats.errors.push(`Blocked sync replay to disallowed URL: ${item.url}`);
    try {
      if (item.id != null) await offlineStorage.removeSyncQueueItem(item.id);
    } catch {
      // ignore removal errors; we still don't attempt replay
    }
  }

  private async handleSyncResult(
    item: SyncQueueItemShape,
    result: SyncResult,
    stats: SyncStats
  ): Promise<void> {
    if (result.success) {
      stats.successCount++;
      await offlineStorage.removeSyncQueueItem(item.id!);
      console.log(`BackgroundSync: Successfully synced ${item.method} ${item.url}`);
      return;
    }

    if (!result.error) return;

    if ((item.retryCount || 0) >= this.maxRetries) {
      stats.failureCount++;
      stats.errors.push(`Max retries exceeded for ${item.url}: ${result.error}`);
      await offlineStorage.removeSyncQueueItem(item.id!);
      console.error(`BackgroundSync: Max retries exceeded for ${item.url}`);
      return;
    }

    await this.scheduleRetry(item, result);
    stats.skippedCount++;
  }

  private async processSyncQueueItem(item: SyncQueueItemShape, stats: SyncStats): Promise<void> {
    try {
      // Defense-in-depth: never replay queued requests to unexpected URLs.
      if (!this.isAllowedSyncRequest(item.method, item.url)) {
        await this.dropDisallowedReplayItem(item, stats);
        return;
      }

      const result = await this.syncItem(item);
      await this.handleSyncResult(item, result, stats);
    } catch (error) {
      stats.failureCount++;
      stats.errors.push(`Sync error for ${item.url}: ${error}`);
      console.error(`BackgroundSync: Error syncing ${item.url}:`, error);
    }
  }

  private startPeriodicSync(): void {
    // Sync every 5 minutes when online
    setInterval(
      () => {
        if (this.isOnline && !this.syncInProgress) {
          this.syncAllPendingData();
        }
      },
      5 * 60 * 1000
    );
  }

  async queueForSync(
    url: string,
    method: string,
    data?: QueuePayload,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<void> {
    try {
      // Defense-in-depth: never enqueue requests we would refuse to replay.
      if (!this.isAllowedSyncRequest(method, url)) {
        console.warn(`BackgroundSync: Refusing to queue disallowed URL: ${url}`);
        return;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authentication headers if available
      const token = secureStorage.get<string>('auth-token', { encrypt: true });
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await offlineStorage.addToSyncQueue({
        url,
        method: method.toUpperCase(),
        headers,
        body: data ? JSON.stringify(data) : undefined,
        priority,
        type: 'api-request',
      });

      console.log(`BackgroundSync: Queued ${method} ${url} for sync`);

      // Try to sync immediately if online
      if (this.isOnline) {
        this.syncAllPendingData();
      }
    } catch (error) {
      console.error('BackgroundSync: Failed to queue item for sync:', error);
      throw error;
    }
  }

  async syncAllPendingData(): Promise<SyncStats> {
    if (this.syncInProgress) {
      console.log('BackgroundSync: Sync already in progress');
      return this.getEmptyStats();
    }

    if (!this.isOnline) {
      console.log('BackgroundSync: Cannot sync while offline');
      return this.getEmptyStats();
    }

    this.syncInProgress = true;
    console.log('BackgroundSync: Starting sync process');

    const stats: SyncStats = {
      totalItems: 0,
      successCount: 0,
      failureCount: 0,
      skippedCount: 0,
      errors: [],
    };

    try {
      // Get all pending sync items
      const syncQueue = await offlineStorage.getSyncQueue();
      stats.totalItems = syncQueue.length;

      if (syncQueue.length === 0) {
        console.log('BackgroundSync: No items to sync');
        return stats;
      }

      console.log(`BackgroundSync: Found ${syncQueue.length} items to sync`);

      // Process each item
      for (const item of syncQueue) {
        await this.processSyncQueueItem(item, stats);
      }

      // Update local store if we synced pain entries
      if (stats.successCount > 0) {
        await this.updateLocalStore();
      }

      console.log('BackgroundSync: Sync completed', stats);
      this.dispatchSyncEvent('sync-completed', stats);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('BackgroundSync: Sync process failed:', error);
      stats.errors.push(`Sync process failed: ${errorMessage}`);
      this.dispatchSyncEvent('sync-error', { error: errorMessage });
    } finally {
      this.syncInProgress = false;
    }

    return stats;
  }

  private async syncItem(item: SyncQueueItemShape): Promise<SyncResult> {
    try {
      // Check if we're still online
      if (!this.isOnline) {
        return { success: false, itemId: item.id!, error: 'Offline' };
      }

      if (!this.isAllowedSyncRequest(item.method, item.url)) {
        return { success: false, itemId: item.id!, error: 'Disallowed URL' };
      }

      const headers = this.sanitizeReplayHeaders(item.headers);

      const response = await fetch(item.url, {
        method: item.method,
        headers,
        body: item.body,
      });

      if (response.ok) {
        return { success: true, itemId: item.id! };
      } else {
        let errorMessage = `HTTP ${response.status}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }

        // Determine if we should retry based on status code
        const shouldRetry = response.status >= 500 || response.status === 429;

        return {
          success: false,
          itemId: item.id!,
          error: errorMessage,
          retryAfter: shouldRetry ? this.getRetryDelay(item.retryCount || 0) : undefined,
        };
      }
    } catch (error) {
      return {
        success: false,
        itemId: item.id!,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  private async scheduleRetry(item: SyncQueueItemShape, result: SyncResult): Promise<void> {
    const delay = result.retryAfter || this.getRetryDelay(item.retryCount || 0);

    // Clear existing timeout for this item
    if (item.id != null) {
      const existing = this.retryTimeouts.get(item.id);
      if (existing) clearTimeout(existing);
    }

    // Update retry count
    await offlineStorage.updateSyncQueueItem(item.id!, {
      retryCount: (item.retryCount || 0) + 1,
    });

    // Schedule retry
    const timeout = setTimeout(() => {
      this.retryTimeouts.delete(item.id!);
      this.syncAllPendingData();
    }, delay);

    this.retryTimeouts.set(item.id!, timeout);

    console.log(`BackgroundSync: Scheduled retry for ${item.url} in ${delay}ms`);
  }

  private getRetryDelay(retryCount: number): number {
    if (retryCount < this.retryDelays.length) {
      return this.retryDelays[retryCount];
    }
    // Exponential backoff for higher retry counts
    const lastDelay = this.retryDelays.at(-1) ?? 15000;
    return Math.min(
      30000,
      lastDelay * Math.pow(2, retryCount - this.retryDelays.length)
    );
  }

  private async updateLocalStore(): Promise<void> {
    try {
      // Get all unsynced data
      const unsyncedData = await offlineStorage.getUnsyncedData();

      // Update Zustand store with synced data
      for (const item of unsyncedData) {
        if (item.type === 'pain-entry' && item.synced) {
          // Update the entry in the store to reflect sync status
          // This could include updating a 'synced' flag or handling conflicts
        }
      }
    } catch (error) {
      console.error('BackgroundSync: Failed to update local store:', error);
    }
  }

  private getEmptyStats(): SyncStats {
    return {
      totalItems: 0,
      successCount: 0,
      failureCount: 0,
      skippedCount: 0,
      errors: [],
    };
  }

  private dispatchSyncEvent(type: string, detail: unknown): void {
    const event = new CustomEvent(`background-sync-${type}`, { detail });
    globalThis.dispatchEvent(event);
  }

  // Public methods for managing sync
  async forcSync(): Promise<SyncStats> {
    // cspell:ignore forc
    console.log('BackgroundSync: Force sync requested');
    return this.syncAllPendingData();
  }

  // Backwards-compatible correctly spelled alias - prefer this going forward
  async forceSync(): Promise<SyncStats> {
    return this.forcSync();
  }

  async clearFailedItems(): Promise<void> {
    try {
      const syncQueue = await offlineStorage.getSyncQueue();
      const failedItems = syncQueue.filter(item => (item.retryCount || 0) >= this.maxRetries);

      await Promise.all(failedItems.map(item => offlineStorage.removeSyncQueueItem(item.id!)));

      console.log(`BackgroundSync: Cleared ${failedItems.length} failed items`);
    } catch (error) {
      console.error('BackgroundSync: Failed to clear failed items:', error);
    }
  }

  async getPendingItemsCount(): Promise<number> {
    try {
      const syncQueue = await offlineStorage.getSyncQueue();
      return syncQueue.length;
    } catch (error) {
      console.error('BackgroundSync: Failed to get pending items count:', error);
      return 0;
    }
  }

  getSyncStatus(): { isOnline: boolean; isSyncing: boolean } {
    return {
      isOnline: this.isOnline,
      isSyncing: this.syncInProgress,
    };
  }

  // Emergency sync for critical data
  async emergencySync(data: QueuePayload, endpoint: string): Promise<boolean> {
    if (!this.isOnline) {
      await this.queueForSync(endpoint, 'POST', data, 'high');
      return false;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secureStorage.get<string>('auth-token', { encrypt: true }) || ''}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log('BackgroundSync: Emergency sync successful');
        return true;
      } else {
        // Queue for retry even if it failed
        await this.queueForSync(endpoint, 'POST', data, 'high');
        return false;
      }
    } catch (error) {
      console.error('BackgroundSync: Emergency sync failed:', error);
      await this.queueForSync(endpoint, 'POST', data, 'high');
      return false;
    }
  }
}

// Background sync helper for pain tracker specific operations
export class PainTrackerSync {
  private readonly backgroundSync: BackgroundSyncService;
  private readonly baseUrl: string;

  constructor() {
    this.backgroundSync = BackgroundSyncService.getInstance();
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  }

  async syncPainEntry(entry: QueuePayload): Promise<void> {
    const endpoint = `${this.baseUrl}/pain-entries`;
    await this.backgroundSync.queueForSync(endpoint, 'POST', entry, 'high');
  }

  async syncPainEntryUpdate(id: number, updates: QueuePayload): Promise<void> {
    const endpoint = `${this.baseUrl}/pain-entries/${id}`;
    await this.backgroundSync.queueForSync(endpoint, 'PUT', updates, 'medium');
  }

  async syncEmergencyData(data: QueuePayload): Promise<boolean> {
    const endpoint = `${this.baseUrl}/emergency`;
    return this.backgroundSync.emergencySync(data, endpoint);
  }

  async syncActivityLog(log: QueuePayload): Promise<void> {
    const endpoint = `${this.baseUrl}/activity-logs`;
    await this.backgroundSync.queueForSync(endpoint, 'POST', log, 'low');
  }

  async syncSettings(settings: QueuePayload): Promise<void> {
    const endpoint = `${this.baseUrl}/settings`;
    await this.backgroundSync.queueForSync(endpoint, 'PUT', settings, 'low');
  }

  // Get sync status specifically for pain tracker data
  async getSyncStatus(): Promise<{
    pendingEntries: number;
    lastSync: string | null;
    isOnline: boolean;
    isSyncing: boolean;
  }> {
    const syncQueue = await offlineStorage.getSyncQueue();
    const painEntryQueue = syncQueue.filter(item => item.url.includes('/pain-entries'));

    const lastSyncTime = secureStorage.get<string>('last-sync-time');
    const { isOnline, isSyncing } = this.backgroundSync.getSyncStatus();

    return {
      pendingEntries: painEntryQueue.length,
      lastSync: lastSyncTime,
      isOnline,
      isSyncing,
    };
  }

  async forceSync(): Promise<void> {
    const stats = await this.backgroundSync.forceSync();

    if (stats.successCount > 0) {
      secureStorage.set('last-sync-time', new Date().toISOString());
    }
  }
}

// Export singleton instances
export const backgroundSync = BackgroundSyncService.getInstance();
export const painTrackerSync = new PainTrackerSync();
