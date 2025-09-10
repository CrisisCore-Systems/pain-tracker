// PWA utility functions for Pain Tracker

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export class PWAManager {
  private static instance: PWAManager;
  private installPromptEvent: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private swRegistration: ServiceWorkerRegistration | null = null;

  private constructor() {
    this.init();
  }

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private async init() {
    this.checkInstallStatus();
    this.setupInstallPromptListener();
    await this.registerServiceWorker();
    this.setupOnlineOfflineListeners();
  }

  // Service Worker Registration
  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('PWA: Service Worker registered successfully', this.swRegistration);
        
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
        
        // Setup background sync
        this.setupBackgroundSync();
        
      } catch (error) {
        console.error('PWA: Service Worker registration failed:', error);
      }
    }
  }

  // Install Prompt Management
  private setupInstallPromptListener(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPromptEvent = e as BeforeInstallPromptEvent;
      console.log('PWA: Install prompt available');
      this.dispatchCustomEvent('pwa-install-available');
    });

    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.installPromptEvent = null;
      console.log('PWA: App installed successfully');
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
        console.log('PWA: User accepted install prompt');
        return true;
      } else {
        console.log('PWA: User dismissed install prompt');
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
    if ((window.navigator as any).standalone) {
      this.isInstalled = true;
    }
  }

  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  // Online/Offline Management
  private setupOnlineOfflineListeners(): void {
    window.addEventListener('online', () => {
      console.log('PWA: Back online');
      this.processOfflineQueue();
      this.dispatchCustomEvent('pwa-online');
    });

    window.addEventListener('offline', () => {
      console.log('PWA: Gone offline');
      this.dispatchCustomEvent('pwa-offline');
    });
  }

  private async processOfflineQueue(): Promise<void> {
    if (this.swRegistration) {
      // Notify service worker to process queue
      const sw = this.swRegistration.active;
      if (sw) {
        sw.postMessage({ type: 'ONLINE' });
      }
      
      // Trigger background sync if available
      if ('sync' in this.swRegistration) {
        try {
          await this.swRegistration.sync.register('pain-tracker-sync');
        } catch (error) {
          console.error('PWA: Background sync registration failed:', error);
        }
      }
    }
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

      const applicationServerKey = process.env.VITE_VAPID_PUBLIC_KEY;
      if (!applicationServerKey) {
        console.error('PWA: VAPID public key not found');
        return null;
      }

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          applicationServerKey
        ) as any
      });

      console.log('PWA: Push subscription created:', subscription);
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
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'pain-tracker-reminder',
        requireInteraction: true
      });
    }, delay);
  }

  // Background Sync
  private setupBackgroundSync(): void {
    if (this.swRegistration && 'sync' in this.swRegistration) {
      console.log('PWA: Background sync is supported');
    } else {
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
        window.location.reload();
      }
    }
  }

  // Utility Methods
  private dispatchCustomEvent(type: string, detail?: any): void {
    const event = new CustomEvent(type, { detail });
    window.dispatchEvent(event);
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

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
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('PWA: All caches cleared');
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

  // Data Management
  async exportOfflineData(): Promise<any> {
    // Export cached data for backup
    const data = {
      entries: JSON.parse(localStorage.getItem('painEntries') || '[]'),
      settings: JSON.parse(localStorage.getItem('pain-tracker-settings') || '{}'),
      timestamp: new Date().toISOString()
    };
    
    return data;
  }

  async importOfflineData(data: any): Promise<void> {
    // Import data for restore
    if (data.entries) {
      localStorage.setItem('painEntries', JSON.stringify(data.entries));
    }
    if (data.settings) {
      localStorage.setItem('pain-tracker-settings', JSON.stringify(data.settings));
    }
    
    console.log('PWA: Data imported successfully');
  }
}

// Export singleton instance
export const pwaManager = PWAManager.getInstance();