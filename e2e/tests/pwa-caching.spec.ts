import { test, expect } from '@playwright/test';

test.describe('PWA Caching Strategy', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for service worker to be ready
    await page.evaluate(async () => {
      if (navigator.serviceWorker) {
        await navigator.serviceWorker.ready;
      }
    });
  });

  test('should have static cache created', async ({ page }) => {
    const cacheInfo = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const staticCache = cacheNames.find(name => name.includes('static'));
      
      if (!staticCache) {
        return { found: false };
      }
      
      const cache = await caches.open(staticCache);
      const keys = await cache.keys();
      
      return {
        found: true,
        name: staticCache,
        entryCount: keys.length,
        urls: keys.map(req => req.url),
      };
    });
    
    expect(cacheInfo.found).toBe(true);
    expect(cacheInfo.entryCount).toBeGreaterThan(0);
  });

  test('should have dynamic cache created', async ({ page }) => {
    const cacheInfo = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const dynamicCache = cacheNames.find(name => name.includes('dynamic'));
      
      return {
        found: dynamicCache !== undefined,
        name: dynamicCache,
        cacheNames: cacheNames,
      };
    });
    
    expect(cacheInfo.found).toBe(true);
  });

  test('should cache index.html in static cache', async ({ page }) => {
    const indexCached = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const staticCache = cacheNames.find(name => name.includes('static'));
      
      if (!staticCache) return false;
      
      const cache = await caches.open(staticCache);
      const keys = await cache.keys();
      
      return keys.some(req => req.url.includes('index.html'));
    });
    
    expect(indexCached).toBe(true);
  });

  test('should cache manifest.json in static cache', async ({ page }) => {
    const manifestCached = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const staticCache = cacheNames.find(name => name.includes('static'));
      
      if (!staticCache) return false;
      
      const cache = await caches.open(staticCache);
      const keys = await cache.keys();
      
      return keys.some(req => req.url.includes('manifest.json'));
    });
    
    expect(manifestCached).toBe(true);
  });

  test('should cache offline.html in static cache', async ({ page }) => {
    const offlineCached = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const staticCache = cacheNames.find(name => name.includes('static'));
      
      if (!staticCache) return false;
      
      const cache = await caches.open(staticCache);
      const keys = await cache.keys();
      
      return keys.some(req => req.url.includes('offline.html'));
    });
    
    expect(offlineCached).toBe(true);
  });

  test('should use correct cache version', async ({ page }) => {
    const cacheVersions = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      return cacheNames.filter(name => name.includes('pain-tracker'));
    });
    
    // Should have v1.2 caches according to sw.js
    const hasV12 = cacheVersions.some(name => name.includes('v1.2'));
    expect(hasV12).toBe(true);
  });

  test('should not have old cache versions', async ({ page }) => {
    const oldCaches = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      
      // Check for old versions (v1.0, v1.1, etc.)
      return cacheNames.filter(name => 
        name.includes('pain-tracker') && 
        (name.includes('v1.0') || name.includes('v1.1'))
      );
    });
    
    expect(oldCaches.length).toBe(0);
  });

  test('should handle cache storage properly', async ({ page }) => {
    const cacheOperations = await page.evaluate(async () => {
      try {
        // Try to open a cache
        const testCache = await caches.open('test-cache');
        
        // Try to store and retrieve
        const testRequest = new Request('/test-url');
        const testResponse = new Response('test data');
        
        await testCache.put(testRequest, testResponse);
        const retrieved = await testCache.match(testRequest);
        
        // Clean up
        await caches.delete('test-cache');
        
        return {
          canOpenCache: true,
          canPut: true,
          canMatch: retrieved !== undefined,
          canDelete: true,
        };
      } catch (e) {
        return {
          error: (e as Error).message,
        };
      }
    });
    
    expect(cacheOperations.canOpenCache).toBe(true);
    expect(cacheOperations.canPut).toBe(true);
    expect(cacheOperations.canMatch).toBe(true);
  });
});

test.describe('PWA Caching - Advanced', () => {
  test('should serve cached responses when available', async ({ page, context }) => {
    // Load a page to cache it
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if it was cached
    const wasCached = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const match = await cache.match('/pain-tracker/');
        if (match) return true;
      }
      
      return false;
    });
    
    expect(wasCached).toBe(true);
  });

  test('should update dynamic cache with new requests', async ({ page }) => {
    // Get initial dynamic cache size
    const initialSize = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const dynamicCache = cacheNames.find(name => name.includes('dynamic'));
      
      if (!dynamicCache) return 0;
      
      const cache = await caches.open(dynamicCache);
      const keys = await cache.keys();
      return keys.length;
    });
    
    // Navigate to trigger caching
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if cache grew (or stayed the same if already cached)
    const finalSize = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const dynamicCache = cacheNames.find(name => name.includes('dynamic'));
      
      if (!dynamicCache) return 0;
      
      const cache = await caches.open(dynamicCache);
      const keys = await cache.keys();
      return keys.length;
    });
    
    expect(finalSize).toBeGreaterThanOrEqual(initialSize);
  });

  test('should handle cache quota management', async ({ page }) => {
    const quotaInfo = await page.evaluate(async () => {
      if (!navigator.storage || !navigator.storage.estimate) {
        return { supported: false };
      }
      
      const estimate = await navigator.storage.estimate();
      const cacheNames = await caches.keys();
      
      return {
        supported: true,
        quota: estimate.quota,
        usage: estimate.usage,
        cacheCount: cacheNames.length,
      };
    });
    
    if (quotaInfo.supported) {
      expect(quotaInfo.cacheCount).toBeGreaterThan(0);
      expect(quotaInfo.usage).toBeGreaterThan(0);
    }
  });

  test('should implement cache-first strategy for static assets', async ({ page }) => {
    // This is validated by checking that static assets are in cache
    const staticAssetsCached = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const staticCache = cacheNames.find(name => name.includes('static'));
      
      if (!staticCache) return false;
      
      const cache = await caches.open(staticCache);
      const keys = await cache.keys();
      
      // Check for common static assets
      const urls = keys.map(req => req.url);
      const hasStatic = urls.some(url => 
        url.includes('.html') || 
        url.includes('.json')
      );
      
      return hasStatic;
    });
    
    expect(staticAssetsCached).toBe(true);
  });

  test('should handle concurrent cache operations', async ({ page }) => {
    const concurrentOps = await page.evaluate(async () => {
      try {
        // Simulate multiple concurrent cache operations
        const operations = Array.from({ length: 5 }, async (_, i) => {
          const cache = await caches.open('test-concurrent');
          const req = new Request(`/test-${i}`);
          const res = new Response(`data-${i}`);
          await cache.put(req, res);
          return cache.match(req);
        });
        
        const results = await Promise.all(operations);
        
        // Clean up
        await caches.delete('test-concurrent');
        
        return {
          success: true,
          allMatched: results.every(r => r !== undefined),
        };
      } catch (e) {
        return {
          success: false,
          error: (e as Error).message,
        };
      }
    });
    
    expect(concurrentOps.success).toBe(true);
    expect(concurrentOps.allMatched).toBe(true);
  });
});
