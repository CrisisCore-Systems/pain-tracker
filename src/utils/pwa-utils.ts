// Enhanced PWA utility functions for Pain Tracker
// Note: offlineStorage and backgroundSync loaded dynamically for code splitting
import { formatNumber } from './formatting';
import { secureStorage } from '../lib/storage/secureStorage';

// Lightweight declaration for BeforeInstallPromptEvent for environments
// where the DOM lib may not include it by default.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface OfflineData {
  entries: unknown[];
  settings: Record<string, unknown>;
  timestamp: string;
  syncQueue?: unknown[];
}

interface SyncManager {
  register(tag: string): Promise<void>;
}

type MaybeForceSync = {
  forceSync?: () => Promise<unknown>;
  forcSync?: () => Promise<unknown>;
};

interface PWACapabilities {
  serviceWorker: boolean;
  pushNotifications: boolean;
  backgroundSync: boolean;
  persistentStorage: boolean;
  installPrompt: boolean;
  fullscreen: boolean;
}

export class PWAManager {
  private static instance: PWAManager;
  private installPromptEvent: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isInitialized = false;
  private capabilities: PWACapabilities = {
    serviceWorker: false,
    pushNotifications: false,
    backgroundSync: false,
    persistentStorage: false,
    installPrompt: false,
    fullscreen: false,
  };

  private constructor() {
    // Delayed initialization to ensure DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private async init() {
    if (this.isInitialized) return;

    if (process.env.NODE_ENV === 'development') {
      console.log('PWA: Initializing PWA Manager');
    }
    this.checkInstallStatus();
    this.setupInstallPromptListener();
    await this.detectCapabilities();
    await this.registerServiceWorker();
    await this.initializeOfflineStorage();
    this.setupOnlineOfflineListeners();
    this.setupPerformanceMonitoring();

    this.isInitialized = true;
    this.dispatchCustomEvent('pwa-initialized', { capabilities: this.capabilities });
  }

  // Capability Detection
  private async detectCapabilities(): Promise<void> {
    this.capabilities.serviceWorker = 'serviceWorker' in navigator;
    this.capabilities.pushNotifications = 'Notification' in window && 'PushManager' in window;
    this.capabilities.backgroundSync =
      'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype;
    this.capabilities.installPrompt = 'BeforeInstallPromptEvent' in window;
    this.capabilities.fullscreen = 'requestFullscreen' in document.documentElement;

    // Check for persistent storage
    if ('storage' in navigator && 'persist' in navigator.storage) {
      this.capabilities.persistentStorage = await navigator.storage.persist();
    }
  }

  getCapabilities(): PWACapabilities {
    return { ...this.capabilities };
  }

  // Enhanced Storage Initialization
  private async initializeOfflineStorage(): Promise<void> {
    try {
      const { offlineStorage } = await import('../lib/offline-storage');
      await offlineStorage.init();
      if (process.env.NODE_ENV === 'development') {
        console.log('PWA: Offline storage initialized');
      }

      // Request persistent storage for critical health data
      if ('storage' in navigator && 'persist' in navigator.storage) {
        const persistent = await navigator.storage.persist();
        if (process.env.NODE_ENV === 'development') {
          console.log('PWA: Persistent storage:', persistent ? 'granted' : 'denied');
        }

        if (persistent) {
          this.dispatchCustomEvent('pwa-persistent-storage-granted');
        }
      }
    } catch (error) {
      console.error('PWA: Failed to initialize offline storage:', error);
      this.dispatchCustomEvent('pwa-storage-error', { error });
    }
  }
  // Enhanced Service Worker Registration
  private async registerServiceWorker(): Promise<void> {
    if (!this.capabilities.serviceWorker) {
      console.warn('PWA: Service Workers not supported');
      return;
    }

    // Skip service worker in development if there are issues
    if (import.meta.env.DEV && import.meta.env.VITE_SKIP_SW === 'true') {
      if (process.env.NODE_ENV === 'development') {
        console.log('PWA: Service Worker disabled in development mode');
      }
      return;
    }

    try {
      // Prefer explicit Vite-provided base override (VITE_BASE) for test runs,
      // otherwise fall back to Vite's BASE_URL and finally '/'.
      const _env = import.meta.env as unknown as Record<string, string | undefined>;
      let baseUrl = (_env.VITE_BASE as string) || (import.meta.env.BASE_URL as string) || '/';

      // Normalise cases where Vite gives a relative './' base (e.g. relative build).
      // In test/dev servers the runtime location.pathname usually reflects the actual base
      // (for example '/pain-tracker/'), so prefer that when BASE_URL is './' or otherwise
      // doesn't start with '/'. This prevents registering './' as the scope which some
      // tests interpret literally and cause manifest/start_url mismatches.
      try {
        if (!baseUrl || baseUrl === './' || !baseUrl.startsWith('/')) {
          const locBase = location.pathname.endsWith('/') ? location.pathname : location.pathname + '/';
          baseUrl = locBase || '/';
        }
      } catch {
        // If location isn't available for some reason, fall back to '/'
        baseUrl = baseUrl === './' ? '/' : baseUrl;
      }

      const swPath = `${baseUrl}sw.js`.replace(/\/\/+/, '/'); // Clean up double slashes

      this.swRegistration = await navigator.serviceWorker.register(swPath, {
        scope: baseUrl,
        updateViaCache: 'none', // Force check for updates every time
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('PWA: Service Worker registered successfully', this.swRegistration);
      }

      // Listen for service worker updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available
                this.notifyUpdate();
              } else {
                // Content is cached for first time
                this.notifyInstalled();
              }
            }
          });
        }
      });

      // Setup message listener for service worker communication
      navigator.serviceWorker.addEventListener('message', event => {
        this.handleServiceWorkerMessage(event);
      });

      // Lightweight handshake: set a global flag when the service worker signals readiness
      try {
        // Listen for SW_READY or PONG messages (the SW posts SW_READY on activation and
        // responds to PING with PONG). This provides a reliable readiness signal for tests.
        navigator.serviceWorker.addEventListener('message', (ev) => {
          try {
            const data = (ev && ev.data) || {};
            if (data.type === 'SW_READY' || data.type === 'PONG') {
              // Mark page-level readiness for tests/tools that await this flag.
              // Use a typed-free assignment to avoid TSC strict-any lint errors.
              (window as unknown as Record<string, unknown>).__pwa_sw_ready = true;
              (window as unknown as Record<string, unknown>).__pwa_sw_version = data.version || (this.swRegistration && (this.swRegistration as unknown as Record<string, unknown>).__SW_VERSION) || null;
            }
          } catch {
            // ignore
          }
        });

        // If the registration is already active, probe it with a PING and set the flag
        // if we get a response. Don't block init if this fails.
        (async () => {
          try {
            if (this.swRegistration && this.swRegistration.active) {
              try {
                this.swRegistration.active.postMessage({ type: 'PING' });
              } catch {
                // ignore
              }
              // Also set the flag optimistically if the active worker exists
              (window as unknown as Record<string, unknown>).__pwa_sw_ready = true;
              (window as unknown as Record<string, unknown>).__pwa_sw_version = (this.swRegistration.active && (this.swRegistration as unknown as Record<string, unknown>).__SW_VERSION) || null;
            }
          } catch {
            // ignore
          }
        })();
      } catch {
        // ignore
      }

      // Setup background sync if supported
      if (this.capabilities.backgroundSync) {
        this.setupBackgroundSync();
      }

      // Monitor service worker performance
      this.monitorServiceWorkerPerformance();
    } catch (error) {
      console.error('PWA: Service Worker registration failed:', error);
      this.dispatchCustomEvent('pwa-sw-registration-failed', { error });
    }
  }

  /**
   * Test hook: triggers service worker registration explicitly for unit tests.
   * No-op if already registered or capability unsupported.
   */
  public async __test_registerSW(): Promise<void> {
    if (this.swRegistration || !this.capabilities.serviceWorker) return;
    await this.registerServiceWorker();
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { data } = event;

    switch (data.type) {
      case 'SW_UPDATE_AVAILABLE':
        this.dispatchCustomEvent('pwa-update-available');
        break;
      case 'SW_OFFLINE_FALLBACK':
        this.dispatchCustomEvent('pwa-offline-fallback', { url: data.url });
        break;
      case 'SW_CACHE_UPDATED':
        this.dispatchCustomEvent('pwa-cache-updated', { cacheName: data.cacheName });
        break;
      case 'SW_SYNC_COMPLETED':
        this.dispatchCustomEvent('pwa-sync-completed', { stats: data.stats });
        break;
    }
  }

  private monitorServiceWorkerPerformance(): void {
    if (!this.swRegistration) return;

    // Monitor cache hit ratio
    let cacheHits = 0;
    let cacheMisses = 0;

    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data.type === 'CACHE_HIT') {
        cacheHits++;
      } else if (event.data.type === 'CACHE_MISS') {
        cacheMisses++;
      }
    });

    // Report performance metrics periodically
    setInterval(() => {
      const total = cacheHits + cacheMisses;
      if (total > 0) {
        const hitRatio = (cacheHits / total) * 100;
        this.dispatchCustomEvent('pwa-cache-performance', {
          hitRatio: Number(formatNumber(hitRatio, 2)),
          totalRequests: total,
        });

        // Reset counters
        cacheHits = 0;
        cacheMisses = 0;
      }
    }, 60000); // Every minute
  }

  // Install Prompt Management
  private setupInstallPromptListener(): void {
    // cspell:ignore beforeinstallprompt appinstalled
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.installPromptEvent = e as BeforeInstallPromptEvent;
      if (process.env.NODE_ENV === 'development') {
        console.log('PWA: Install prompt available');
      }
      this.dispatchCustomEvent('pwa-install-available');
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.installPromptEvent = null;
      if (process.env.NODE_ENV === 'development') {
        console.log('PWA: App installed successfully');
      }
      this.dispatchCustomEvent('pwa-installed');
    });
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.installPromptEvent) {
      return false;
    }

    try {
      await this.installPromptEvent.prompt();
      const choiceResult = await this.installPromptEvent.userChoice;

      if (choiceResult.outcome === 'accepted') {
        if (process.env.NODE_ENV === 'development') {
          console.log('PWA: User accepted install prompt');
        }
        return true;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('PWA: User dismissed install prompt');
        }
        return false;
      }
    } catch (error) {
      console.error('PWA: Error showing install prompt:', error);
      return false;
    }
  }

  isInstallPromptAvailable(): boolean {
    return this.installPromptEvent !== null;
  }

  // Installation Status
  private checkInstallStatus(): void {
    // Check if running as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }

    // Check if running in mobile app mode
    if ((window.navigator as Navigator & { standalone?: boolean }).standalone) {
      this.isInstalled = true;
    }
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  // Enhanced Online/Offline Management with Background Sync Integration
  private setupOnlineOfflineListeners(): void {
    window.addEventListener('online', async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('PWA: Back online');
      }
      await this.handleOnlineStatus(true);
      this.dispatchCustomEvent('pwa-online');
    });

    window.addEventListener('offline', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('PWA: Gone offline');
      }
      this.handleOnlineStatus(false);
      this.dispatchCustomEvent('pwa-offline');
    });

    // Monitor connection quality
    this.monitorConnectionQuality();
  }

  private async handleOnlineStatus(isOnline: boolean): Promise<void> {
    if (isOnline) {
      // Trigger background sync when coming back online
      try {
        const { backgroundSync } = await import('../lib/background-sync');
        // Support legacy typo (forcSync) and future corrected (forceSync)
        const svc = backgroundSync as unknown as MaybeForceSync;
        if (typeof svc.forceSync === 'function') {
          await svc.forceSync();
        } else if (typeof svc.forcSync === 'function') {
          await svc.forcSync();
        }

        // Notify service worker
        if (this.swRegistration?.active) {
          this.swRegistration.active.postMessage({ type: 'ONLINE' });
        }

        // Trigger background sync registration if supported
        if ('sync' in this.swRegistration!) {
          try {
            const reg = this.swRegistration as ServiceWorkerRegistration & { sync: SyncManager };
            await reg.sync.register('pain-tracker-sync');
          } catch (error) {
            console.error('PWA: Background sync registration failed:', error);
          }
        }
      } catch (error) {
        console.error('PWA: Failed to sync data when coming online:', error);
      }
    }
  }

  private monitorConnectionQuality(): void {
    // Monitor connection using Network Information API if available
    if ('connection' in navigator) {
      type NetworkInformationLike = {
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
        saveData?: boolean;
        addEventListener?: (type: string, listener: () => void) => void;
      };
      const connection = (navigator as Navigator & { connection?: NetworkInformationLike })
        .connection;

      const updateConnectionInfo = () => {
        if (!connection) return;
        this.dispatchCustomEvent('pwa-connection-change', {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        });
      };

      if (connection && typeof connection.addEventListener === 'function') {
        connection.addEventListener('change', updateConnectionInfo);
      }
      updateConnectionInfo(); // Initial check
    }

    // Fallback: Periodic connection quality test
    this.startConnectionQualityTests();
  }

  private startConnectionQualityTests(): void {
    setInterval(async () => {
      if (!navigator.onLine) return;

      const startTime = performance.now();
      try {
        // Use the correct base URL for manifest.json
        const baseUrl = import.meta.env.BASE_URL || '/';
        const manifestUrl = `${baseUrl}manifest.json`.replace(/\/+/g, '/');

        await fetch(manifestUrl, {
          mode: 'cors',
          cache: 'no-cache',
        });
        const endTime = performance.now();
        const latency = endTime - startTime;

        this.dispatchCustomEvent('pwa-connection-test', {
          latency,
          quality: latency < 100 ? 'good' : latency < 500 ? 'moderate' : 'poor',
        });
      } catch {
        this.dispatchCustomEvent('pwa-connection-test', {
          latency: -1,
          quality: 'offline',
        });
      }
    }, 30000); // Test every 30 seconds
  }

  private setupPerformanceMonitoring(): void {
    // Monitor PWA performance metrics
    if ('performance' in window) {
      // Monitor navigation timing
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming;

          this.dispatchCustomEvent('pwa-performance-metrics', {
            loadTime: navigation.loadEventEnd - navigation.fetchStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            firstPaint: this.getFirstPaint(),
            cacheHitRatio: this.getCacheHitRatio(),
          });
        }, 0);
      });

      // Monitor resource timing
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const slowResources = entries.filter(entry => entry.duration > 1000);

        if (slowResources.length > 0) {
          this.dispatchCustomEvent('pwa-slow-resources', {
            resources: slowResources.map(entry => {
              const resource = entry as PerformanceResourceTiming;
              return {
                name: entry.name,
                duration: entry.duration,
                size: resource.transferSize || 0,
              };
            }),
          });
        }
      });

      observer.observe({ type: 'resource', buffered: true });
    }
  }

  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  private getCacheHitRatio(): number {
    // This would be populated by service worker messages
    // Non-sensitive metric; avoid encryption overhead
    const ratio = secureStorage.get<string>('pwa-cache-hit-ratio');
    return parseFloat(ratio || '0');
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  // Push Notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('PWA: This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.error('PWA: Service Worker not registered');
      return null;
    }

    try {
      const permission = await this.requestNotificationPermission();
      if (permission !== 'granted') {
        console.warn('PWA: Notification permission not granted');
        return null;
      }

      const applicationServerKey = (import.meta as unknown as { env?: Record<string, string> }).env
        ?.VITE_VAPID_PUBLIC_KEY;
      if (!applicationServerKey) {
        console.error('PWA: VAPID public key not found');
        return null;
      }

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(applicationServerKey)
          .buffer as ArrayBuffer,
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('PWA: Push subscription created:', subscription);
      }
      return subscription;
    } catch (error) {
      console.error('PWA: Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Medication Reminders
  async scheduleNotification(title: string, body: string, delay: number): Promise<void> {
    if (!('Notification' in window)) return;

    const permission = await this.requestNotificationPermission();
    if (permission !== 'granted') return;

    setTimeout(() => {
      const baseUrl = import.meta.env.BASE_URL || '/';
      new Notification(title, {
        body,
        icon: `${baseUrl}icons/icon-192x192.png`.replace(/\/+/g, '/'),
        badge: `${baseUrl}icons/badge-72x72.png`.replace(/\/+/g, '/'),
        tag: 'pain-tracker-reminder',
        requireInteraction: true,
      });
    }, delay);
  }

  // Background Sync
  private setupBackgroundSync(): void {
    if (this.swRegistration && 'sync' in this.swRegistration) {
      if (process.env.NODE_ENV === 'development') {
        console.log('PWA: Background sync is supported');
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log('PWA: Background sync is not supported');
      }
    }
  }

  // App Updates
  private notifyUpdate(): void {
    this.dispatchCustomEvent('pwa-update-available');
  }

  private notifyInstalled(): void {
    this.dispatchCustomEvent('pwa-content-cached');
  }

  async updateApp(): Promise<void> {
    if (this.swRegistration) {
      const registration = this.swRegistration;
      if (registration.waiting) {
        // Tell the waiting SW to skip waiting
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });

        // Reload the page to activate the new service worker
        window.location.reload();
      }
    }
  }

  // Utility Methods
  private dispatchCustomEvent(type: string, detail?: unknown): void {
    const event = new CustomEvent(type, { detail });
    window.dispatchEvent(event);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Cache Management
  async clearCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      if (process.env.NODE_ENV === 'development') {
        console.log('PWA: All caches cleared');
      }
    }
  }

  async getCacheSize(): Promise<number> {
    if (!('storage' in navigator && 'estimate' in navigator.storage)) {
      return 0;
    }

    try {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    } catch (error) {
      console.error('PWA: Failed to get cache size:', error);
      return 0;
    }
  }

  // Enhanced Data Management with Offline Support
  async exportOfflineData(): Promise<OfflineData> {
    try {
      // Export from IndexedDB for complete offline data
      const { offlineStorage } = await import('../lib/offline-storage');
      const offlineDataExport = await offlineStorage.exportData();

      // Combine with localStorage data
      const localData = {
        entries: secureStorage.safeJSON('painEntries', []),
        settings: secureStorage.safeJSON('pain-tracker-settings', {}),
        timestamp: new Date().toISOString(),
        syncQueue: offlineDataExport.syncQueue,
      };

      return localData;
    } catch (error) {
      console.error('PWA: Failed to export offline data:', error);
      throw error;
    }
  }

  async importOfflineData(data: OfflineData): Promise<void> {
    try {
      // Import to localStorage
      if (data.entries) secureStorage.set('painEntries', data.entries);
      if (data.settings) secureStorage.set('pain-tracker-settings', data.settings);

      // Import sync queue if available
      if (data.syncQueue) {
        // Import sync queue items to IndexedDB
        const { offlineStorage } = await import('../lib/offline-storage');
        for (const item of data.syncQueue) {
          // Ensure item matches expected sync queue shape before adding
          const queueItem = item as {
            url: string;
            method: string;
            headers?: Record<string, string>;
            body?: unknown;
            priority?: 'high' | 'medium' | 'low';
            type?: string;
            metadata?: Record<string, unknown>;
          };
          await offlineStorage.addToSyncQueue({
            url: queueItem.url,
            method: queueItem.method,
            headers: queueItem.headers || {},
            body:
              typeof queueItem.body === 'string'
                ? queueItem.body
                : JSON.stringify(queueItem.body || {}),
            priority: queueItem.priority || 'medium',
            type: queueItem.type || 'sync',
          });
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('PWA: Data imported successfully');
      }
      this.dispatchCustomEvent('pwa-data-imported');
    } catch (error) {
      console.error('PWA: Failed to import offline data:', error);
      throw error;
    }
  }

  // Health Data Specific PWA Features
  async enableHealthDataSync(): Promise<boolean> {
    try {
      // Request persistent storage for health data
      if ('storage' in navigator && 'persist' in navigator.storage) {
        const persistent = await navigator.storage.persist();
        if (!persistent) {
          console.warn('PWA: Persistent storage not granted for health data');
          return false;
        }
      }

      // Enable background sync for health data
      if (this.swRegistration && 'sync' in this.swRegistration) {
        const reg = this.swRegistration as ServiceWorkerRegistration & { sync: SyncManager };
        await reg.sync.register('health-data-sync');
        if (process.env.NODE_ENV === 'development') {
          console.log('PWA: Health data background sync enabled');
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error('PWA: Failed to enable health data sync:', error);
      return false;
    }
  }

  async scheduleHealthReminder(title: string, body: string, triggerTime: Date): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('PWA: Notifications not supported');
      return;
    }

    const permission = await this.requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('PWA: Notification permission not granted');
      return;
    }

    const now = new Date();
    const delay = triggerTime.getTime() - now.getTime();

    if (delay <= 0) {
      // Show immediately if time has passed
      this.showNotification(title, body);
      return;
    }

    // Schedule for future
    setTimeout(() => {
      this.showNotification(title, body);
    }, delay);

    if (process.env.NODE_ENV === 'development') {
      console.log(`PWA: Health reminder scheduled for ${triggerTime.toLocaleString()}`);
    }
  }

  private showNotification(title: string, body: string): void {
    const baseUrl = import.meta.env.BASE_URL || '/';
    new Notification(title, {
      body,
      icon: `${baseUrl}icons/icon-192x192.png`.replace(/\/+/g, '/'),
      badge: `${baseUrl}icons/badge-72x72.png`.replace(/\/+/g, '/'),
      tag: 'health-reminder',
      requireInteraction: true,
      data: {
        url: `${baseUrl}?reminder=true`.replace(/\/+/g, '/'),
        timestamp: new Date().toISOString(),
      },
    });
  }

  // PWA Status and Diagnostics
  async getDiagnostics(): Promise<{
    isInstalled: boolean;
    hasServiceWorker: boolean;
    isOnline: boolean;
    storageUsage: { used: number; quota: number };
    capabilities: PWACapabilities;
    pendingSyncItems: number;
    lastSync: string | null;
  }> {
    const { offlineStorage } = await import('../lib/offline-storage');
    const { backgroundSync } = await import('../lib/background-sync');
    const storageUsage = await offlineStorage.getStorageUsage();
    const pendingSyncItems = await backgroundSync.getPendingItemsCount();
    const lastSync = secureStorage.get<string>('last-sync-time');

    return {
      isInstalled: this.isInstalled,
      hasServiceWorker: !!this.swRegistration,
      isOnline: navigator.onLine,
      storageUsage,
      capabilities: this.capabilities,
      pendingSyncItems,
      lastSync,
    };
  }

  async clearPWAData(): Promise<void> {
    try {
      // Clear service worker caches
      await this.clearCaches();

      // Clear IndexedDB
      const { offlineStorage } = await import('../lib/offline-storage');
      await offlineStorage.clearAllData();

      // Clear all secureStorage-managed keys (namespaced)
      secureStorage.keys().forEach(k => secureStorage.remove(k));

      if (process.env.NODE_ENV === 'development') {
        console.log('PWA: All PWA data cleared');
      }
      this.dispatchCustomEvent('pwa-data-cleared');
    } catch (error) {
      console.error('PWA: Failed to clear PWA data:', error);
      throw error;
    }
  }

  // Complete service worker reset for debugging
  async resetServiceWorker(): Promise<void> {
    try {
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
        if (process.env.NODE_ENV === 'development') {
          console.log('PWA: All service workers unregistered');
        }
      }

      // Clear all caches
      await this.clearCaches();

      // Clear PWA data
      await this.clearPWAData();

      if (process.env.NODE_ENV === 'development') {
        console.log('PWA: Service worker completely reset');
      }
      this.dispatchCustomEvent('pwa-service-worker-reset');
    } catch (error) {
      console.error('PWA: Failed to reset service worker:', error);
      throw error;
    }
  }

  // Force refresh with cache bypass
  async forceRefresh(): Promise<void> {
    try {
      // Clear caches first
      await this.clearCaches();

      // Force reload without cache
      window.location.reload();
    } catch (error) {
      console.error('PWA: Failed to force refresh:', error);
      // Fallback to normal reload
      window.location.reload();
    }
  }

  // Check if app needs update
  async checkForUpdates(): Promise<boolean> {
    if (!this.swRegistration) return false;

    try {
      await this.swRegistration.update();
      return !!this.swRegistration.waiting;
    } catch (error) {
      console.error('PWA: Failed to check for updates:', error);
      return false;
    }
  }
}

// Export singleton instance
export const pwaManager = PWAManager.getInstance();
