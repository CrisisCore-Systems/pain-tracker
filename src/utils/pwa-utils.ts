// Enhanced PWA utility functions for Pain Tracker
// Note: backgroundSync remains dynamically loaded; offlineStorage is imported statically
// to avoid dynamic/static import conflicts that prevent effective chunking.
import { formatNumber } from './formatting';
import { secureStorage } from '../lib/storage/secureStorage';
import { offlineStorage } from '../lib/offline-storage';
import { TeardownCoordinator } from './TeardownCoordinator';

const isDev = import.meta.env.DEV;

// Lightweight declaration for BeforeInstallPromptEvent for environments
// where the DOM lib may not include it by default.
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
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

function normalizeAppPath(path: string): string {
  return path.replaceAll(/\/+/g, '/');
}

function getConnectionQuality(latency: number): 'good' | 'moderate' | 'poor' {
  if (latency < 100) {
    return 'good';
  }

  if (latency < 500) {
    return 'moderate';
  }

  return 'poor';
}

function getNotificationAssets(baseUrl: string) {
  return {
    icon: normalizeAppPath(`${baseUrl}icons/icon-192x192.png`),
    badge: normalizeAppPath(`${baseUrl}icons/badge-72x72.png`),
  };
}

export class PWAManager {
  private static instance: PWAManager;
  private installPromptEvent: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isInitialized = false;
  private readonly capabilities: PWACapabilities = {
    serviceWorker: false,
    pushNotifications: false,
    backgroundSync: false,
    persistentStorage: false,
    installPrompt: false,
    fullscreen: false,
  };

  private constructor() {
    // Initialization is scheduled from getInstance to avoid async work in the constructor.
  }

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
      PWAManager.instance.scheduleInit();
    }
    return PWAManager.instance;
  }

  private scheduleInit(): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        void this.init();
      }, { once: true });
      return;
    }

    queueMicrotask(() => {
      void this.init();
    });
  }

  private async init() {
    if (this.isInitialized) return;

    if (isDev) {
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
    this.capabilities.pushNotifications = 'Notification' in globalThis && 'PushManager' in globalThis;
    this.capabilities.backgroundSync =
      'serviceWorker' in navigator && 'sync' in globalThis.ServiceWorkerRegistration.prototype;
    this.capabilities.installPrompt = 'BeforeInstallPromptEvent' in globalThis;
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
      await offlineStorage.init();
      if (isDev) {
        console.log('PWA: Offline storage initialized');
      }

      // Request persistent storage for critical health data
      if ('storage' in navigator && 'persist' in navigator.storage) {
        const persistent = await navigator.storage.persist();
        if (isDev) {
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
      if (isDev) {
        console.log('PWA: Service Worker disabled in development mode');
      }
      return;
    }

    try {
      // Prefer explicit Vite-provided base override (VITE_BASE) for test runs,
      // otherwise fall back to Vite's BASE_URL and finally '/'.
      const _env = import.meta.env as unknown as Record<string, string | undefined>;
      let baseUrl = _env.VITE_BASE || import.meta.env.BASE_URL || '/';

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

      if (isDev) {
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
            const data = ev?.data || {};
            if (data.type === 'SW_READY' || data.type === 'PONG') {
              // Mark page-level readiness for tests/tools that await this flag.
              // Use a typed-free assignment to avoid TSC strict-any lint errors.
              (globalThis as Record<string, unknown>).__pwa_sw_ready = true;
              (globalThis as Record<string, unknown>).__pwa_sw_version = data.version || ((this.swRegistration as unknown as Record<string, unknown> | null)?.__SW_VERSION ?? null);
            }
          } catch {
            // ignore
          }
        });

        // If the registration is already active, probe it with a PING and set the flag
        // if we get a response. Don't block init if this fails.
        (async () => {
          try {
            if (this.swRegistration?.active) {
              try {
                this.swRegistration.active?.postMessage({ type: 'PING' });
              } catch {
                // ignore
              }
              // Also set the flag optimistically if the active worker exists
              (globalThis as Record<string, unknown>).__pwa_sw_ready = true;
              (globalThis as Record<string, unknown>).__pwa_sw_version =
                ((this.swRegistration as unknown as Record<string, unknown> | null)?.__SW_VERSION ?? null);
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
    globalThis.setInterval(() => {
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
    globalThis.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.installPromptEvent = e as BeforeInstallPromptEvent;
      if (isDev) {
        console.log('PWA: Install prompt available');
      }
      this.dispatchCustomEvent('pwa-install-available');
    });

    globalThis.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.installPromptEvent = null;
      if (isDev) {
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
        if (isDev) {
          console.log('PWA: User accepted install prompt');
        }
        return true;
      }

      if (isDev) {
        console.log('PWA: User dismissed install prompt');
      }

      return false;
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
    if (globalThis.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
    }

    // Check if running in mobile app mode
    if ((globalThis.navigator as Navigator & { standalone?: boolean }).standalone) {
      this.isInstalled = true;
    }
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  // Enhanced Online/Offline Management with Background Sync Integration
  private setupOnlineOfflineListeners(): void {
    globalThis.addEventListener('online', async () => {
      if (isDev) {
        console.log('PWA: Back online');
      }
      await this.handleOnlineStatus(true);
      this.dispatchCustomEvent('pwa-online');
    });

    globalThis.addEventListener('offline', () => {
      if (isDev) {
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

      const startTime = globalThis.performance.now();
      try {
        // Use the correct base URL for manifest.json
        const baseUrl = import.meta.env.BASE_URL || '/';
        const manifestUrl = normalizeAppPath(`${baseUrl}manifest.json`);

        await globalThis.fetch(manifestUrl, {
          mode: 'cors',
          cache: 'no-cache',
        });
        const endTime = globalThis.performance.now();
        const latency = endTime - startTime;

        this.dispatchCustomEvent('pwa-connection-test', {
          latency,
          quality: getConnectionQuality(latency),
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
    if ('performance' in globalThis) {
      // Monitor navigation timing
      globalThis.addEventListener('load', () => {
        setTimeout(() => {
          const [navigation] = globalThis.performance.getEntriesByType('navigation');

          if (!(navigation instanceof PerformanceNavigationTiming)) {
            return;
          }

          this.dispatchCustomEvent('pwa-performance-metrics', {
            loadTime: navigation.loadEventEnd - navigation.fetchStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            firstPaint: this.getFirstPaint(),
            cacheHitRatio: this.getCacheHitRatio(),
          });
        }, 0);
      });

      // Monitor resource timing
      const observer = new globalThis.PerformanceObserver(list => {
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
    const paintEntries = globalThis.performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  private getCacheHitRatio(): number {
    // This would be populated by service worker messages
    // Non-sensitive metric; avoid encryption overhead
    const ratio = secureStorage.get<string>('pwa-cache-hit-ratio');
    return Number.parseFloat(ratio || '0');
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  // Push Notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in globalThis)) {
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

      const applicationServerKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!applicationServerKey) {
        console.error('PWA: VAPID public key not found');
        return null;
      }

      return await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(applicationServerKey)
          .buffer as ArrayBuffer,
      });
    } catch (error) {
      console.error('PWA: Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Medication Reminders
  async scheduleNotification(title: string, body: string, delay: number): Promise<void> {
    if (!('Notification' in globalThis)) return;

    const permission = await this.requestNotificationPermission();
    if (permission !== 'granted') return;

    globalThis.setTimeout(() => {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const assets = getNotificationAssets(baseUrl);
      new Notification(title, {
        body,
        icon: assets.icon,
        badge: assets.badge,
        tag: 'pain-tracker-reminder',
        requireInteraction: true,
      });
    }, delay);
  }

  // Background Sync
  private setupBackgroundSync(): void {
    if (this.swRegistration && 'sync' in this.swRegistration) {
      if (isDev) {
        console.log('PWA: Background sync is supported');
      }
      return;
    }

    if (isDev) {
      console.log('PWA: Background sync is not supported');
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
        globalThis.location.reload();
      }
    }
  }

  // Utility Methods
  private dispatchCustomEvent(type: string, detail?: unknown): void {
    const event = new CustomEvent(type, { detail });
    globalThis.dispatchEvent(event);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replaceAll('-', '+').replaceAll('_', '/');

    const rawData = globalThis.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.codePointAt(i) ?? 0;
    }
    return outputArray;
  }

  // Cache Management
  async clearCaches(): Promise<void> {
    if ('caches' in globalThis) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      if (isDev) {
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
  // NOTE: Plaintext offline export/import was removed.
  // Class A export/import must go through the Vault Export artifact.

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
        if (isDev) {
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
    if (!('Notification' in globalThis)) {
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
    globalThis.setTimeout(() => {
      this.showNotification(title, body);
    }, delay);

    if (isDev) {
      console.log(`PWA: Health reminder scheduled for ${triggerTime.toLocaleString()}`);
    }
  }

  private showNotification(title: string, body: string): void {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const assets = getNotificationAssets(baseUrl);
    new Notification(title, {
      body,
      icon: assets.icon,
      badge: assets.badge,
      tag: 'health-reminder',
      requireInteraction: true,
      data: {
        url: normalizeAppPath(`${baseUrl}?reminder=true`),
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
      const coordinator = new TeardownCoordinator();
      const report = await coordinator.run({
        canaryKey: 'pain-tracker-storage',
        beforeIndexedDbTeardown: async () => {
          const { secureAuditSink } = await import('../services/SecureAuditSink');
          await secureAuditSink.shutdown?.();
        },
        clearSecureStorage: () => {
          secureStorage.keys().forEach(k => secureStorage.remove(k));
        },
      });

      if (isDev) {
        console.log('PWA: Teardown report', report);
      }

      if (report.ok) {
        this.dispatchCustomEvent('pwa-data-cleared', report);
        return;
      }

      this.dispatchCustomEvent('pwa-data-clear-degraded', report);
    } catch (error) {
      console.error('PWA: Failed to clear PWA data:', error);
      this.dispatchCustomEvent('pwa-data-clear-degraded', {
        fatal: true,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // Complete service worker reset for debugging
  async resetServiceWorker(): Promise<void> {
    try {
      // Unregister all service workers
      if ('serviceWorker' in globalThis.navigator) {
        const registrations = await globalThis.navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
        if (isDev) {
          console.log('PWA: All service workers unregistered');
        }
      }

      // Clear all caches
      await this.clearCaches();

      // Clear PWA data
      await this.clearPWAData();

      if (isDev) {
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
      globalThis.location.reload();
    } catch (error) {
      console.error('PWA: Failed to force refresh:', error);
      // Fallback to normal reload
      globalThis.location.reload();
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
