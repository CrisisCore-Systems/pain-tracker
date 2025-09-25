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
    setInterval(() => this.updateStatus(), 30000);
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.status.isOnline = true;
      this.updateDisplay();
      this.updateStatus();
    });

    window.addEventListener('offline', () => {
      this.status.isOnline = false;
      this.updateDisplay();
    });

    // Listen for PWA events
    window.addEventListener('pwa-install-available', () => {
      this.showInstallPrompt();
    });

    window.addEventListener('pwa-installed', () => {
      this.status.isInstalled = true;
      this.hideInstallPrompt();
    });

    window.addEventListener('background-sync-sync-started', () => {
      this.status.isSyncing = true;
      this.updateDisplay();
    });

    window.addEventListener('background-sync-sync-completed', (event) => {
      this.status.isSyncing = false;
      if (event.detail && event.detail.successCount) {
        this.status.pendingSync = Math.max(0, this.status.pendingSync - event.detail.successCount);
      }
      this.updateDisplay();
    });
  }

  async updateStatus() {
    try {
      // Try to get pending sync count
      if (window.backgroundSync) {
        this.status.pendingSync = await window.backgroundSync.getPendingItemsCount();
      }
    } catch (error) {
      // Background sync not available (expected in some browsers)
      if (process && process.env && process.env.NODE_ENV === 'development') {
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
    
    let content = '<div style="display: flex; align-items: center; gap: 0.5rem;">';
    
    if (!isOnline) {
      content += `
        <div style="width: 0.5rem; height: 0.5rem; background: #ef4444; border-radius: 50%;"></div>
        <span style="font-weight: 500; color: #dc2626;">Offline</span>
      `;
    } else if (isSyncing) {
      content += `
        <div style="width: 0.5rem; height: 0.5rem; background: #3b82f6; border-radius: 50%; animation: pulse 2s infinite;"></div>
        <span style="font-weight: 500; color: #2563eb;">Syncing...</span>
      `;
    } else if (pendingSync > 0) {
      content += `
        <div style="width: 0.5rem; height: 0.5rem; background: #f59e0b; border-radius: 50%;"></div>
        <span style="font-weight: 500; color: #d97706;">${pendingSync} pending</span>
      `;
    }
    
    content += '</div>';
    
    if (!isOnline) {
      content += `
        <p style="margin: 0.25rem 0 0 0; font-size: 0.75rem; color: #6b7280;">
          Your data is saved locally and will sync when you're back online
        </p>
      `;
    }
    
    this.statusElement.innerHTML = content;
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
      try {
        if (window.pwaManager && window.pwaManager.showInstallPrompt) {
          await window.pwaManager.showInstallPrompt();
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

// PWA Initialization
async function initializePWA() {
  try {
    console.log('PWA: Initializing PWA features...');

    // Initialize PWA Manager
    if (window.pwaManager) {
      await window.pwaManager.isAppInstalled();
      console.log('PWA: PWA Manager initialized');
    }

    // Note: Offline Storage and Background Sync are initialized by the main React app
    // These features are handled by the TypeScript modules in src/lib/
    console.log('PWA: Offline storage and background sync handled by main app');

    // Initialize Status Manager
    new PWAStatusManager();
    console.log('PWA: Status manager initialized');

    // Enable health data sync if available
    if (window.pwaManager && window.pwaManager.enableHealthDataSync) {
      try {
        await window.pwaManager.enableHealthDataSync();
        console.log('PWA: Health data sync enabled');
      } catch (error) {
        console.warn('PWA: Health data sync not available:', error);
      }
    }

    // Add CSS animations
    if (!document.getElementById('pwa-styles')) {
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
    }

    console.log('PWA: Initialization complete');
    
    // Dispatch initialization event
    window.dispatchEvent(new CustomEvent('pwa-initialized'));

  } catch (error) {
    console.error('PWA: Initialization failed:', error);
  }
}

// Enhanced offline entry management
window.addPainEntryOffline = async function(entryData) {
  try {
    // Add entry to local store (assumes Zustand store is available)
    if (window.usePainTrackerStore) {
      const store = window.usePainTrackerStore.getState();
      store.addEntry(entryData);
    }

    // Store in IndexedDB if available
    if (window.offlineStorage) {
      await window.offlineStorage.storeData('pain-entry', entryData);
    }

    // Queue for sync if offline or background sync available
    const isOffline = !navigator.onLine;
    if (isOffline && window.backgroundSync) {
      await window.backgroundSync.queueForSync('/api/pain-entries', 'POST', entryData, 'high');
    }

    console.log('PWA: Pain entry saved offline');
    return true;
  } catch (error) {
    console.error('PWA: Failed to save pain entry offline:', error);
    return false;
  }
};

// Force sync function
window.forcePWASync = async function() {
  try {
    if (!navigator.onLine) {
      throw new Error('Cannot sync while offline');
    }

    if (window.backgroundSync) {
      await window.backgroundSync.forcSync();
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePWA);
} else {
  initializePWA();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PWAStatusManager, initializePWA };
}
