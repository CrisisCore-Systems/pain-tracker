/**
 * Enhanced Service Worker Integration
 * Advanced PWA features for health insights processing and offline resource management
 */

import { advancedOfflineManager } from './advanced-offline';

// Type definitions for service worker integration
interface HealthInsight {
  id: string;
  type: string;
  confidence: number;
  generatedAt: string;
  recommendations?: string[];
}

interface OfflineResource {
  id: string;
  title: string;
  type: string;
  priority: string;
  size: number;
}

interface OfflineStatus {
  resourcesAvailable: number;
  insightsGenerated: number;
  unresolvedConflicts: number;
  storageUsed: string;
}

// Message types for service worker communication
interface ServiceWorkerMessage {
  type:
    | 'PROCESS_INSIGHTS'
    | 'DOWNLOAD_RESOURCES'
    | 'SYNC_DATA'
    | 'GET_STATUS'
    | 'CONFLICT_RESOLVED';
  payload?: unknown;
  id?: string;
}

interface ServiceWorkerResponse {
  type: 'INSIGHTS_PROCESSED' | 'RESOURCES_DOWNLOADED' | 'DATA_SYNCED' | 'STATUS_UPDATE' | 'ERROR';
  payload?: unknown;
  id?: string;
  error?: string;
}

export class EnhancedServiceWorkerIntegration {
  private sw: ServiceWorker | null = null;
  private messageHandlers: Map<string, (response: ServiceWorkerResponse) => void> = new Map();
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.initializeServiceWorker();
    this.setupConnectivityListeners();
    this.setupMessageListeners();
  }

  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');

        if (registration.active) {
          this.sw = registration.active;
        } else if (registration.installing) {
          await this.waitForServiceWorker(registration.installing);
          this.sw = registration.active;
        } else if (registration.waiting) {
          this.sw = registration.waiting;
        }

        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                this.sw = newWorker;
                console.log('Service worker updated');
              }
            });
          }
        });

        console.log('Enhanced service worker integration initialized');
      } catch (error) {
        console.error('Failed to register service worker:', error);
      }
    }
  }

  private waitForServiceWorker(worker: ServiceWorker): Promise<void> {
    return new Promise(resolve => {
      worker.addEventListener('statechange', () => {
        if (worker.state === 'activated') {
          resolve();
        }
      });
    });
  }

  private setupConnectivityListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleConnectivityChange(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleConnectivityChange(false);
    });
  }

  private setupMessageListeners(): void {
    navigator.serviceWorker?.addEventListener('message', event => {
      const response: ServiceWorkerResponse = event.data;

      if (response.id && this.messageHandlers.has(response.id)) {
        const handler = this.messageHandlers.get(response.id)!;
        handler(response);
        this.messageHandlers.delete(response.id);
      }

      // Handle global messages
      switch (response.type) {
        case 'INSIGHTS_PROCESSED':
          this.handleInsightsProcessed(response.payload as HealthInsight[]);
          break;
        case 'STATUS_UPDATE':
          this.handleStatusUpdate(response.payload as OfflineStatus);
          break;
        case 'ERROR':
          console.error('Service worker error:', response.error);
          break;
      }
    });
  }

  private async handleConnectivityChange(isOnline: boolean): Promise<void> {
    if (isOnline) {
      // Trigger background sync when coming online
      await this.triggerBackgroundSync();

      // Process any pending insights
      await this.processHealthInsights();

      // Download new resources
      await this.downloadEssentialResources();
    }
  }

  private handleInsightsProcessed(insights: HealthInsight[]): void {
    // Emit custom event for UI to update
    window.dispatchEvent(
      new CustomEvent('health-insights-updated', {
        detail: { insights },
      })
    );
  }

  private handleStatusUpdate(status: OfflineStatus): void {
    // Emit status update event
    window.dispatchEvent(
      new CustomEvent('offline-status-updated', {
        detail: { status },
      })
    );
  }

  // Public API methods
  async processHealthInsights(): Promise<HealthInsight[]> {
    return this.sendMessage({
      type: 'PROCESS_INSIGHTS',
    }) as Promise<HealthInsight[]>;
  }

  async downloadEssentialResources(): Promise<boolean> {
    const result = await this.sendMessage({
      type: 'DOWNLOAD_RESOURCES',
      payload: { type: 'essential' },
    });
    return result as boolean;
  }

  async downloadResource(resourceId: string, url: string): Promise<boolean> {
    const result = await this.sendMessage({
      type: 'DOWNLOAD_RESOURCES',
      payload: { resourceId, url },
    });
    return result as boolean;
  }

  async triggerBackgroundSync(): Promise<void> {
    await this.sendMessage({
      type: 'SYNC_DATA',
    });
  }

  async getOfflineStatus(): Promise<OfflineStatus> {
    return this.sendMessage({
      type: 'GET_STATUS',
    }) as Promise<OfflineStatus>;
  }

  async resolveConflict(
    conflictId: string,
    resolution: { type: string; [key: string]: unknown }
  ): Promise<void> {
    return this.sendMessage({
      type: 'CONFLICT_RESOLVED',
      payload: { conflictId, resolution },
    }) as Promise<void>;
  }

  private sendMessage(message: ServiceWorkerMessage): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (!this.sw) {
        reject(new Error('Service worker not available'));
        return;
      }

      const messageId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      message.id = messageId;

      // Set up response handler
      this.messageHandlers.set(messageId, (response: ServiceWorkerResponse) => {
        if (response.type === 'ERROR') {
          reject(new Error(response.error));
        } else {
          resolve(response.payload);
        }
      });

      // Send message to service worker
      this.sw.postMessage(message);

      // Set timeout for message
      setTimeout(() => {
        if (this.messageHandlers.has(messageId)) {
          this.messageHandlers.delete(messageId);
          reject(new Error('Service worker message timeout'));
        }
      }, 30000); // 30 second timeout
    });
  }

  // Offline resource helpers
  async getCopingStrategies(painLevel: number, location?: string): Promise<OfflineResource[]> {
    return advancedOfflineManager.getOfflineCopingStrategies(painLevel, location);
  }

  async searchOfflineResources(query: string, type?: string): Promise<OfflineResource[]> {
    return advancedOfflineManager.resourceManager.searchOfflineResources(query, type);
  }

  async getHealthInsights(): Promise<HealthInsight[]> {
    return advancedOfflineManager.getHealthInsights();
  }

  // Utility methods
  isOffline(): boolean {
    return !this.isOnline;
  }

  getAdvancedOfflineManager() {
    return advancedOfflineManager;
  }
}

// Enhanced Service Worker Registration with background processing
export async function registerEnhancedServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      // Request persistent storage for offline resources
      if ('storage' in navigator && 'persist' in navigator.storage) {
        const persistent = await navigator.storage.persist();
        console.log('Persistent storage:', persistent);
      }

      // Set up background sync (if supported)
      try {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          // Background sync will be handled by the service worker internally
          console.log('Background sync supported for registration:', registration.scope);
        }
      } catch (error) {
        console.warn('Background sync not supported:', error);
      }

      // Set up periodic background sync for health insights (experimental)
      try {
        if (
          'serviceWorker' in navigator &&
          'periodicSync' in window.ServiceWorkerRegistration.prototype
        ) {
          // Check for periodic sync support without using experimental API names
          console.log('Periodic sync API available (experimental feature)');
        }
      } catch (error) {
        console.warn('Periodic sync not supported:', error);
      }

      console.log('Enhanced service worker registered successfully');
    } catch (error) {
      console.error('Enhanced service worker registration failed:', error);
    }
  }
}

// Service Worker Message Handler (for inclusion in sw.js)
export const serviceWorkerMessageHandler = `
// Enhanced Service Worker Message Handler
self.addEventListener('message', async (event) => {
  const { type, payload, id } = event.data;
  
  try {
    let result;
    
    switch (type) {
      case 'PROCESS_INSIGHTS':
        result = await processHealthInsights();
        break;
      case 'DOWNLOAD_RESOURCES':
        result = await downloadResources(payload);
        break;
      case 'SYNC_DATA':
        result = await syncData();
        break;
      case 'GET_STATUS':
        result = await getOfflineStatus();
        break;
      case 'CONFLICT_RESOLVED':
        result = await resolveConflict(payload);
        break;
      default:
        throw new Error('Unknown message type: ' + type);
    }
    
    event.ports[0]?.postMessage({
      type: type.replace(/^(.*?)$/, '$1_COMPLETED'),
      payload: result,
      id
    });
  } catch (error) {
    event.ports[0]?.postMessage({
      type: 'ERROR',
      error: error.message,
      id
    });
  }
});

// Background processing functions
async function processHealthInsights() {
  // Import and use advanced offline manager
  const { advancedOfflineManager } = await import('/src/lib/advanced-offline.js');
  await advancedOfflineManager.insightsProcessor.processNewInsights();
  return advancedOfflineManager.insightsProcessor.getInsights();
}

async function downloadResources(payload) {
  const { advancedOfflineManager } = await import('/src/lib/advanced-offline.js');
  
  if (payload.type === 'essential') {
    await advancedOfflineManager.resourceManager.downloadEssentialResources();
    return true;
  } else if (payload.resourceId && payload.url) {
    return await advancedOfflineManager.resourceManager.downloadResource(payload.resourceId, payload.url);
  }
  
  return false;
}

async function syncData() {
  // Trigger background sync with existing service
  const { backgroundSync } = await import('/src/lib/background-sync.js');
  await backgroundSync.processQueue();
  return true;
}

async function getOfflineStatus() {
  const { advancedOfflineManager } = await import('/src/lib/advanced-offline.js');
  return advancedOfflineManager.getStatus();
}

async function resolveConflict(payload) {
  const { advancedOfflineManager } = await import('/src/lib/advanced-offline.js');
  const { conflictId, resolution } = payload;
  return await advancedOfflineManager.conflictResolver.resolveConflict(conflictId, resolution);
}

// Background sync handlers
self.addEventListener('sync', async (event) => {
  switch (event.tag) {
    case 'background-health-insights':
      event.waitUntil(processHealthInsights());
      break;
    case 'resource-download':
      event.waitUntil(downloadResources({ type: 'essential' }));
      break;
    case 'data-sync':
      event.waitUntil(syncData());
      break;
  }
});

// Periodic sync handler (if supported)
self.addEventListener('periodic-sync', async (event) => {
  if (event.tag === 'health-insights-processing') {
    event.waitUntil(processHealthInsights());
  }
});
`;

// Export singleton
export const enhancedSWIntegration = new EnhancedServiceWorkerIntegration();
