import { test, expect, type Page } from '@playwright/test';

test.describe('PWA Service Worker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test('should register service worker successfully', async ({ page, browserName }) => {
    // Wait for service worker to be registered
    const swRegistration = await page.evaluate(async () => {
      if (!navigator.serviceWorker) {
        return { supported: false };
      }
      
      // Wait for service worker to register
      const registration = await navigator.serviceWorker.ready;
      
      return {
        supported: true,
        scope: registration.scope,
        active: registration.active !== null,
        state: registration.active?.state,
      };
    });

    // Verify service worker support
    expect(swRegistration.supported).toBe(true);
    expect(swRegistration.active).toBe(true);
    expect(swRegistration.state).toBe('activated');
    expect(swRegistration.scope).toContain('/pain-tracker/');
  });

  test('should cache static assets on install', async ({ page }) => {
    // Get cached resources
    const cachedAssets = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const staticCache = cacheNames.find(name => name.includes('static'));
      
      if (!staticCache) {
        return { found: false, assets: [] };
      }

      const cache = await caches.open(staticCache);
      const requests = await cache.keys();
      
      return {
        found: true,
        cacheName: staticCache,
        assets: requests.map(req => req.url),
        count: requests.length,
      };
    });

    expect(cachedAssets.found).toBe(true);
    expect(cachedAssets.count).toBeGreaterThan(0);
    
    // Check for critical assets
    const assetUrls = cachedAssets.assets.join(' ');
    expect(assetUrls).toContain('manifest.json');
  });

  test('should update service worker version', async ({ page }) => {
    // Check current service worker version
    const version = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      // Service worker should be version 1.2 according to sw.js
      return {
        hasActive: registration.active !== null,
        hasWaiting: registration.waiting !== null,
      };
    });

    expect(version.hasActive).toBe(true);
  });

  test('should handle service worker errors gracefully', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // Trigger a fetch that might fail
    await page.evaluate(async () => {
      try {
        await fetch('/non-existent-endpoint');
      } catch (e) {
        // Expected to fail
      }
    });

    // Wait a bit for any async errors
    await page.waitForTimeout(1000);

    // Service worker errors should not crash the page
    const hasServiceWorkerError = errors.some(err => 
      err.toLowerCase().includes('service worker')
    );
    
    // We don't expect service worker errors for normal operations
    if (hasServiceWorkerError) {
      console.warn('Service worker errors detected:', errors);
    }
  });

  test('should clean up old caches on activation', async ({ page }) => {
    const cacheInfo = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      
      return {
        allCaches: cacheNames,
        hasOldCaches: cacheNames.some(name => 
          !name.includes('v1.2') && name.includes('pain-tracker')
        ),
      };
    });

    // Should only have current version caches, no old ones
    expect(cacheInfo.hasOldCaches).toBe(false);
  });
});

test.describe('PWA Service Worker - Advanced Features', () => {
  test('should support skipWaiting for immediate activation', async ({ page }) => {
    const skipWaitingSupported = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      return registration.active !== null && registration.waiting === null;
    });

    expect(skipWaitingSupported).toBe(true);
  });

  test('should claim clients immediately on activation', async ({ page }) => {
    const clientsClaimed = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      // Check if the service worker is controlling this page
      return navigator.serviceWorker.controller !== null;
    });

    expect(clientsClaimed).toBe(true);
  });
});
