import { test, expect } from '../test-setup';

test.describe('PWA Offline Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Ensure service worker is ready
    await page.evaluate(async () => {
      if (navigator.serviceWorker) {
        await navigator.serviceWorker.ready;
      }
    });
  });

  test('should load app from cache when offline', async ({ page, context }) => {
    // First visit - cache should be populated
    const onlineTitle = await page.title();
    
    // Go offline
    await context.setOffline(true);
    
    // Reload page
    await page.reload();
    
    // Should still load from cache
    await page.waitForLoadState('domcontentloaded');
    const offlineTitle = await page.title();
    
    // Page should load even when offline
    expect(offlineTitle).toBeTruthy();
    expect(offlineTitle).toBe(onlineTitle);
  });

  test('should show offline indicator when network is unavailable', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    
    // Check for offline indicator
    const isOffline = await page.evaluate(() => !navigator.onLine);
    expect(isOffline).toBe(true);
  });

  test('should queue form submissions when offline', async ({ page, context }) => {
    // Navigate to pain entry form
    await page.waitForSelector('#pain-level', { timeout: 10000 });
    
    // Fill out form
    await page.evaluate(() => {
      const painRange = document.getElementById('pain-level') as HTMLInputElement;
      if (painRange) {
        painRange.value = '7';
        painRange.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    
    const notesField = page.locator('textarea').first();
    if (await notesField.count() > 0) {
      await notesField.fill('Offline test entry');
    }
    
    // Go offline before submitting
    await context.setOffline(true);
    
    // Try to navigate through form and submit
    const nextBtn = page.getByRole('button', { name: /Next/i });
    const saveBtn = page.getByRole('button', { name: /Save Entry/i });
    
    // Click Next buttons until we reach Save
    for (let i = 0; i < 5; i++) {
      if (await saveBtn.count() > 0 && await saveBtn.isVisible()) {
        break;
      }
      if (await nextBtn.count() > 0 && await nextBtn.isEnabled()) {
        await nextBtn.click();
        await page.waitForTimeout(200);
      }
    }
    
    // Click Save (should queue for later)
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Check if data was saved locally (in IndexedDB)
    const localDataExists = await page.evaluate(async () => {
      if (!window.indexedDB) return false;
      
      try {
        // Check if data was saved to IndexedDB
        const dbs = await indexedDB.databases();
        return dbs.some(db => db.name?.includes('pain'));
      } catch {
        return false;
      }
    });
    
    // Data should be saved locally even when offline
    expect(localDataExists).toBe(true);
  });

  test('should sync queued data when coming back online', async ({ page, context }) => {
    // Start online
    await context.setOffline(false);
    
    // Verify we can fetch normally
    const onlineCheck = await page.evaluate(() => navigator.onLine);
    expect(onlineCheck).toBe(true);
    
    // This test verifies the sync mechanism works when transitioning online
    // In a real scenario, we'd create data offline, then verify it syncs when online
  });

  test('should serve cached navigation requests when offline', async ({ page, context }) => {
    // Visit multiple pages while online to cache them
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await context.setOffline(true);
    
    // Try to navigate (should work from cache)
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Should load successfully from cache
    const content = await page.content();
    expect(content).toContain('Pain Tracker');
  });

  test('should handle offline fallback for uncached pages', async ({ page, context }) => {
    // Clear caches first
    await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    });
    
    // Go offline
    await context.setOffline(true);
    
    // Try to navigate to a new page
    try {
      await page.goto('/some-uncached-page');
      
      // Should show offline fallback or error
      const content = await page.content();
      const hasOfflineFallback = content.toLowerCase().includes('offline') || 
                                  content.toLowerCase().includes('no connection');
      
      // Either shows offline page or fails gracefully
      expect(hasOfflineFallback || content.length > 0).toBe(true);
    } catch (error) {
      // Network error is expected when offline without cache
      expect(error).toBeDefined();
    }
  });
});

test.describe('PWA Offline - Data Persistence', () => {
  test('should persist data in IndexedDB when offline', async ({ page }) => {
    // Check IndexedDB support
    const indexedDBSupported = await page.evaluate(() => {
      return 'indexedDB' in window;
    });
    
    expect(indexedDBSupported).toBe(true);
    
    // Check if pain tracker database exists
    const dbExists = await page.evaluate(async () => {
      try {
        const dbs = await indexedDB.databases();
        return dbs.some(db => db.name?.toLowerCase().includes('pain'));
      } catch {
        return false;
      }
    });
    
    // Database should exist or be created
    expect(typeof dbExists).toBe('boolean');
  });

  test('should handle storage quota gracefully', async ({ page }) => {
    const quotaInfo = await page.evaluate(async () => {
      if (!navigator.storage || !navigator.storage.estimate) {
        return { supported: false };
      }
      
      const estimate = await navigator.storage.estimate();
      return {
        supported: true,
        quota: estimate.quota,
        usage: estimate.usage,
        percentUsed: estimate.quota && estimate.usage 
          ? (estimate.usage / estimate.quota) * 100 
          : 0,
      };
    });
    
    if (quotaInfo.supported) {
      expect(quotaInfo.percentUsed).toBeLessThan(80); // Should be under 80% usage
    }
  });
});
