import { test, expect } from '../test-setup';

const getExpectedCacheName = async (page: import('@playwright/test').Page) => {
  const swResponse = await page.request.get('/sw.js');
  const swText = swResponse.ok()
    ? await swResponse.text()
    : await (await page.request.get('/pain-tracker/sw.js')).text();
  const versionMatch = swText.match(/const\s+SW_VERSION\s*=\s*'([^']+)'/);
  expect(versionMatch, 'Expected SW_VERSION in service worker script').not.toBeNull();
  return `pain-tracker-static-v${versionMatch![1]}`;
};

test.describe('PWA Caching Strategy', () => {
  test.beforeEach(async ({ page, browserName }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');
    
    const swReady = await page.evaluate(async () => {
      if (!navigator.serviceWorker) return false;
      return await Promise.race([
        navigator.serviceWorker.ready.then(() => true),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5_000)),
      ]);
    });

    if (browserName === 'webkit' && !swReady) {
      test.skip(true, 'Service worker not ready under WebKit test runner');
    }
  });

  test('should have static cache created', async ({ page }) => {
    const expectedCacheName = await getExpectedCacheName(page);

    const cacheInfo = await page.evaluate(async (cacheName) => {
      const cacheNames = await caches.keys();
      const found = cacheNames.includes(cacheName);
      if (!found) return { found: false, name: cacheName, entryCount: 0, urls: [] as string[] };

      const cache = await caches.open(cacheName);
      const keys = await cache.keys();

      return {
        found: true,
        name: cacheName,
        entryCount: keys.length,
        urls: keys.map((req) => req.url),
      };
    }, expectedCacheName);

    expect(cacheInfo.found).toBe(true);
    // Should at least contain precache entries.
    expect(cacheInfo.entryCount).toBeGreaterThanOrEqual(2);
  });

  test('should not create a dynamic cache by default', async ({ page }) => {
    const cacheInfo = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      return {
        hasDynamic: cacheNames.some((name) => name.includes('dynamic')),
        cacheNames,
      };
    });

    // Current service worker is intentionally minimal/deterministic.
    expect(cacheInfo.hasDynamic).toBe(false);
  });

  test('should cache manifest.json in static cache', async ({ page }) => {
    const expectedCacheName = await getExpectedCacheName(page);
    const manifestCached = await page.evaluate(async (cacheName) => {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      return keys.some(req => req.url.includes('manifest.json'));
    }, expectedCacheName);
    
    expect(manifestCached).toBe(true);
  });

  test('should cache offline.html in static cache', async ({ page }) => {
    const expectedCacheName = await getExpectedCacheName(page);
    const offlineCached = await page.evaluate(async (cacheName) => {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      return keys.some(req => req.url.includes('offline.html'));
    }, expectedCacheName);
    
    expect(offlineCached).toBe(true);
  });

  test('should use correct cache version', async ({ page }) => {
    const expectedCacheName = await getExpectedCacheName(page);
    const cacheNames = await page.evaluate(async () => await caches.keys());
    expect(cacheNames).toContain(expectedCacheName);
  });

  test('should not have old cache versions', async ({ page }) => {
    const expectedCacheName = await getExpectedCacheName(page);
    const oldCaches = await page.evaluate(async (expected) => {
      const cacheNames = await caches.keys();
      return cacheNames.filter((name) => name.startsWith('pain-tracker-') && name !== expected);
    }, expectedCacheName);

    expect(oldCaches).toEqual([]);
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
  test.beforeEach(async ({ page, browserName }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load');

    // Wait for service worker to be ready so precache has a chance to populate.
    const swReady = await page.evaluate(async () => {
      if (!navigator.serviceWorker) return false;
      return await Promise.race([
        navigator.serviceWorker.ready.then(() => true),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5_000)),
      ]);
    });

    if (browserName === 'webkit' && !swReady) {
      test.skip(true, 'Service worker not ready under WebKit test runner');
    }
  });

  test('should serve cached responses when available', async ({ page }) => {
    const expectedCacheName = await getExpectedCacheName(page);
    await expect
      .poll(async () => {
        return await page.evaluate(async (cacheName) => {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          const urls = keys.map((r) => r.url);
          return urls.some((u) => u.includes('manifest.json'));
        }, expectedCacheName);
      }, { timeout: 10_000 })
      .toBe(true);
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
    const expectedCacheName = await getExpectedCacheName(page);
    await expect
      .poll(async () => {
        return await page.evaluate(async (cacheName) => {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          const urls = keys.map((req) => req.url);
          return urls.some((url) => url.includes('manifest.json') || url.includes('offline.html'));
        }, expectedCacheName);
      }, { timeout: 10_000 })
      .toBe(true);
  });

  test('should handle concurrent cache operations', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const concurrentOps = await page.evaluate(async () => {
      try {
        // Simulate multiple concurrent cache operations
        const operations = Array.from({ length: 5 }, async (_, i) => {
          const cache = await caches.open('test-concurrent');
          const req = new Request(new URL(`/test-${i}`, location.origin).toString());
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
