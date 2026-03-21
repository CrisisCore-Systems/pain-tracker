/**
 * PWA Initialization Script
 * Simple vanilla JavaScript implementation for PWA features
 */

// SECURITY DISCLAIMER: This initialization script is for illustrative/demo purposes.
// It uses direct localStorage and unencrypted status flags. Avoid persisting
// sensitive information here; production logic relies on secureStorage.

// PWA Status Display
class PWAStatusManager {
  constructor() {
    this.status = {
      isOnline: navigator.onLine,
      pendingSync: 0,
      isSyncing: false,
      isInstalled: false
    };
    
    this.statusElement = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.createStatusIndicator();
    this.updateStatus();
    
    // Update status periodically
    globalThis.setInterval(() => this.updateStatus(), 30000);
  }

  setupEventListeners() {
    const runtime = globalThis;

    runtime.addEventListener('online', () => {
      this.status.isOnline = true;
      this.updateDisplay();
      this.updateStatus();
    });

    runtime.addEventListener('offline', () => {
      this.status.isOnline = false;
      this.updateDisplay();
    });

    // Listen for PWA events
    runtime.addEventListener('pwa-install-available', () => {
      this.showInstallPrompt();
    });

    runtime.addEventListener('pwa-installed', () => {
      this.status.isInstalled = true;
      this.hideInstallPrompt();
    });

    runtime.addEventListener('background-sync-sync-started', () => {
      this.status.isSyncing = true;
      this.updateDisplay();
    });

    runtime.addEventListener('background-sync-sync-completed', (event) => {
      this.status.isSyncing = false;
      const successCount = event.detail?.successCount ?? 0;
      if (successCount > 0) {
        this.status.pendingSync = Math.max(0, this.status.pendingSync - successCount);
      }
      this.updateDisplay();
    });
  }

  async updateStatus() {
    const runtime = globalThis;

    try {
      // Try to get pending sync count
      if (runtime.backgroundSync) {
        this.status.pendingSync = await runtime.backgroundSync.getPendingItemsCount();
      }
    } catch (error) {
      // Background sync not available (expected in some browsers)
      if (process?.env?.NODE_ENV === 'development') {
        console.debug('PWA: backgroundSync getPendingItemsCount unavailable', error);
      }
    }
    
    this.updateDisplay();
  }

  createStatusIndicator() {
    // Don't create if already exists
    if (document.getElementById('pwa-status-indicator')) return;

    const indicator = document.createElement('div');
    indicator.id = 'pwa-status-indicator';
    indicator.style.cssText = `
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      z-index: 1000;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      border-left: 4px solid #3b82f6;
      padding: 0.75rem;
      max-width: 20rem;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 0.875rem;
      display: none;
    `;

    document.body.appendChild(indicator);
    this.statusElement = indicator;
  }

  updateDisplay() {
    if (!this.statusElement) return;

    const { isOnline, pendingSync, isSyncing } = this.status;
    
    // Hide if everything is good
    if (isOnline && pendingSync === 0 && !isSyncing) {
      this.statusElement.style.display = 'none';
      return;
    }

    // Show status
    this.statusElement.style.display = 'block';

    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.alignItems = 'center';
    content.style.gap = '0.5rem';

    const statusIndicator = document.createElement('div');
    statusIndicator.style.width = '0.5rem';
    statusIndicator.style.height = '0.5rem';
    statusIndicator.style.borderRadius = '50%';

    const statusText = document.createElement('span');
    statusText.style.fontWeight = '500';

    if (!isOnline) {
      statusIndicator.style.background = '#ef4444';
      statusText.style.color = '#dc2626';
      statusText.textContent = 'Offline';
    } else if (isSyncing) {
      statusIndicator.style.background = '#3b82f6';
      statusIndicator.style.animation = 'pulse 2s infinite';
      statusText.style.color = '#2563eb';
      statusText.textContent = 'Syncing...';
    } else if (pendingSync > 0) {
      statusIndicator.style.background = '#f59e0b';
      statusText.style.color = '#d97706';
      statusText.textContent = `${pendingSync} pending`;
    }

    content.appendChild(statusIndicator);
    content.appendChild(statusText);

    while (this.statusElement.firstChild) {
      this.statusElement.firstChild.remove();
    }
    this.statusElement.appendChild(content);
  }

  showInstallPrompt() {
    // Simple install prompt - you can enhance this
    const existingPrompt = document.getElementById('pwa-install-prompt');
    if (existingPrompt) return;

    const prompt = document.createElement('div');
    prompt.id = 'pwa-install-prompt';
    prompt.style.cssText = `
      position: fixed;
      bottom: 1rem;
      left: 1rem;
      right: 1rem;
      z-index: 1001;
      background: white;
      border-radius: 0.5rem;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      padding: 1rem;
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 24rem;
      margin: 0 auto;
    `;

    prompt.innerHTML = `
      <div style="display: flex; align-items: start; gap: 0.75rem;">
        <div style="width: 2.5rem; height: 2.5rem; background: #dbeafe; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          📱
        </div>
        <div style="flex: 1; min-width: 0;">
          <h3 style="margin: 0 0 0.25rem 0; font-size: 0.875rem; font-weight: 600;">Install Pain Tracker</h3>
          <p style="margin: 0 0 0.75rem 0; font-size: 0.75rem; color: #6b7280;">
            Add to your home screen for quick access and offline use
          </p>
          <div style="display: flex; gap: 0.5rem;">
            <button id="pwa-install-btn" style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; font-size: 0.875rem; cursor: pointer;">
              Install
            </button>
            <button id="pwa-dismiss-btn" style="background: transparent; color: #6b7280; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 0.375rem; font-size: 0.875rem; cursor: pointer;">
              Not now
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(prompt);

    // Add event listeners
    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
      const runtime = globalThis;

      try {
        if (runtime.pwaManager?.showInstallPrompt) {
          await runtime.pwaManager.showInstallPrompt();
        }
      } catch (error) {
        console.error('Failed to show install prompt:', error);
      }
      this.hideInstallPrompt();
    });

    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
      this.hideInstallPrompt();
      sessionStorage.setItem('pwa-install-dismissed', 'true');
    });
  }

  hideInstallPrompt() {
    const prompt = document.getElementById('pwa-install-prompt');
    if (prompt) {
      prompt.remove();
    }
  }
}

function initializePWA() {
  const runtime = globalThis;

  console.log('PWA: Initializing PWA features...');

  const pwaManagerInit = runtime.pwaManager
    ? Promise.resolve(runtime.pwaManager.isAppInstalled()).then(() => {
        console.log('PWA: PWA Manager initialized');
      })
    : Promise.resolve();

  pwaManagerInit
    .then(() => {
      // Note: Offline Storage and Background Sync are initialized by the main React app.
      // These features are handled by the TypeScript modules in src/lib/.
      console.log('PWA: Offline storage and background sync handled by main app');

      runtime.pwaStatusManager = new PWAStatusManager();
      console.log('PWA: Status manager initialized');
    })
    .then(() => {
      if (!runtime.pwaManager?.enableHealthDataSync) {
        return undefined;
      }

      return Promise.resolve(runtime.pwaManager.enableHealthDataSync())
        .then(() => {
          console.log('PWA: Health data sync enabled');
        })
        .catch((error) => {
          console.warn('PWA: Health data sync not available:', error);
        });
    })
    .then(() => {
      if (document.getElementById('pwa-styles')) {
        return;
      }

      const style = document.createElement('style');
      style.id = 'pwa-styles';
      style.textContent = `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        #pwa-status-indicator {
          transition: all 0.3s ease;
        }

        #pwa-install-prompt {
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    })
    .then(() => {
      console.log('PWA: Initialization complete');
      globalThis.dispatchEvent(new CustomEvent('pwa-initialized'));
    })
    .catch((error) => {
      console.error('PWA: Initialization failed:', error);
    });
}

// Enhanced offline entry management
globalThis.addPainEntryOffline = async function(entryData) {
  const runtime = globalThis;

  try {
    // Add entry to local store (assumes Zustand store is available)
    if (runtime.usePainTrackerStore) {
      const store = runtime.usePainTrackerStore.getState();
      store.addEntry(entryData);
    }

    // Store in IndexedDB if available
    if (runtime.offlineStorage) {
      await runtime.offlineStorage.storeData('pain-entry', entryData);
    }

    // Queue for sync if offline or background sync available
    const isOffline = !navigator.onLine;
    if (isOffline && runtime.backgroundSync) {
      await runtime.backgroundSync.queueForSync('/api/pain-entries', 'POST', entryData, 'high');
    }

    console.log('PWA: Pain entry saved offline');
    return true;
  } catch (error) {
    console.error('PWA: Failed to save pain entry offline:', error);
    return false;
  }
};

// Force sync function
globalThis.forcePWASync = async function() {
  const runtime = globalThis;

  try {
    if (!navigator.onLine) {
      throw new Error('Cannot sync while offline');
    }

    if (runtime.backgroundSync) {
      await runtime.backgroundSync.forcSync();
      localStorage.setItem('last-sync-time', new Date().toISOString());
      console.log('PWA: Force sync completed');
      return true;
    } else {
      throw new Error('Background sync not available');
    }
  } catch (error) {
    console.error('PWA: Force sync failed:', error);
    return false;
  }
};

function initializePWAWhenReady() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializePWA();
    }, { once: true });
    return;
  }

  initializePWA();
}

// Initialize when DOM is ready
initializePWAWhenReady();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PWAStatusManager, initializePWA };
}
