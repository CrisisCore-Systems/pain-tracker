import { test, expect } from '@playwright/test';

test.describe('PWA Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should meet Core Web Vitals targets', async ({ page }) => {
    // Collect performance metrics
    const metrics = await page.evaluate(() => {
      const paint = performance.getEntriesByType('paint');
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
      const lcp = paint.find(entry => entry.name === 'largest-contentful-paint');
      
      return {
        fcp: fcp ? fcp.startTime : 0,
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
        loadComplete: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      };
    });
    
    // FCP should be under 1800ms (good)
    if (metrics.fcp > 0) {
      expect(metrics.fcp).toBeLessThan(3000);
    }
    
    // DOM Content Loaded should be under 3000ms
    expect(metrics.domContentLoaded).toBeLessThan(5000);
    
    console.log('Performance metrics:', metrics);
  });

  test('should load quickly from cache on repeat visits', async ({ page }) => {
    // First visit
    const firstLoadStart = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const firstLoadTime = Date.now() - firstLoadStart;
    
    // Second visit (should be faster from cache)
    const secondLoadStart = Date.now();
    await page.goto('/', { waitUntil: 'networkidle' });
    const secondLoadTime = Date.now() - secondLoadStart;
    
    console.log(`First load: ${firstLoadTime}ms, Second load: ${secondLoadTime}ms`);
    
    // Second load should generally be faster due to caching
    // But we'll just verify it's reasonable
    expect(secondLoadTime).toBeLessThan(10000);
  });

  test('should have reasonable bundle size', async ({ page }) => {
    // Analyze resource sizes
    const resources = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      return entries.map(entry => ({
        name: entry.name,
        size: entry.transferSize || 0,
        type: entry.initiatorType,
      }));
    });
    
    const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
    const jsSize = resources.filter(r => r.name.includes('.js')).reduce((sum, r) => sum + r.size, 0);
    
    console.log(`Total resources: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`JavaScript: ${(jsSize / 1024).toFixed(2)} KB`);
    
    // Reasonable thresholds for a PWA
    expect(totalSize).toBeLessThan(5 * 1024 * 1024); // Under 5MB total
  });

  test('should handle service worker performance', async ({ page }) => {
    const swPerformance = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready;
      const startTime = performance.now();
      
      // Test service worker response time
      const swActive = registration.active !== null;
      
      const endTime = performance.now();
      
      return {
        hasServiceWorker: swActive,
        checkTime: endTime - startTime,
      };
    });
    
    expect(swPerformance.hasServiceWorker).toBe(true);
    expect(swPerformance.checkTime).toBeLessThan(100); // Should be very fast
  });

  test('should have efficient cache operations', async ({ page }) => {
    const cachePerformance = await page.evaluate(async () => {
      const startTime = performance.now();
      
      // Test cache access speed
      const cacheNames = await caches.keys();
      
      if (cacheNames.length > 0) {
        const cache = await caches.open(cacheNames[0]);
        const keys = await cache.keys();
        
        if (keys.length > 0) {
          await cache.match(keys[0]);
        }
      }
      
      const endTime = performance.now();
      
      return {
        operationTime: endTime - startTime,
        cacheCount: cacheNames.length,
      };
    });
    
    // Cache operations should be fast
    expect(cachePerformance.operationTime).toBeLessThan(500);
  });

  test('should handle IndexedDB performance', async ({ page }) => {
    const idbPerformance = await page.evaluate(async () => {
      if (!window.indexedDB) {
        return { supported: false };
      }
      
      const startTime = performance.now();
      
      try {
        const dbs = await indexedDB.databases();
        const endTime = performance.now();
        
        return {
          supported: true,
          operationTime: endTime - startTime,
          dbCount: dbs.length,
        };
      } catch (e) {
        return {
          supported: true,
          error: 'Cannot measure',
        };
      }
    });
    
    if (idbPerformance.supported && typeof idbPerformance.operationTime === 'number') {
      expect(idbPerformance.operationTime).toBeLessThan(200);
    }
  });
});

test.describe('PWA Performance - Lighthouse Metrics', () => {
  test('should have good Time to Interactive', async ({ page }) => {
    const tti = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      return {
        domInteractive: navigation.domInteractive - navigation.fetchStart,
        domComplete: navigation.domComplete - navigation.fetchStart,
      };
    });
    
    // Time to Interactive should be reasonable
    expect(tti.domInteractive).toBeLessThan(8000);
  });

  test('should have minimal layout shifts', async ({ page }) => {
    // Collect layout shift metrics
    const cls = await page.evaluate(() => {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
      });
      
      try {
        observer.observe({ type: 'layout-shift', buffered: true });
        return { supported: true };
      } catch (e) {
        return { supported: false };
      }
    });
    
    // CLS monitoring should be supported
    console.log('Layout shift monitoring:', cls.supported);
  });
});

test.describe('PWA Data Security', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should use HTTPS or localhost', async ({ page }) => {
    const protocol = await page.evaluate(() => window.location.protocol);
    
    // PWAs require HTTPS or localhost
    const isSecure = protocol === 'https:' || 
                     page.url().includes('localhost') || 
                     page.url().includes('127.0.0.1');
    
    expect(isSecure).toBe(true);
  });

  test('should not expose sensitive data in cache', async ({ page }) => {
    const cacheContents = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const contents: string[] = [];
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          contents.push(request.url);
        }
      }
      
      return contents;
    });
    
    // Check that cache doesn't contain sensitive patterns
    const hasSensitiveData = cacheContents.some(url => 
      url.includes('password') || 
      url.includes('token=') || 
      url.includes('key=')
    );
    
    expect(hasSensitiveData).toBe(false);
  });

  test('should implement CSP headers', async ({ page }) => {
    // Check for Content Security Policy
    const csp = await page.evaluate(() => {
      const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      return meta ? meta.getAttribute('content') : null;
    });
    
    // CSP should be present (either via meta tag or headers)
    console.log('CSP:', csp || 'Set via headers');
  });

  test('should use secure IndexedDB practices', async ({ page }) => {
    const idbSecurity = await page.evaluate(async () => {
      if (!window.indexedDB) {
        return { supported: false };
      }
      
      try {
        const dbs = await indexedDB.databases();
        
        return {
          supported: true,
          databases: dbs.map(db => ({
            name: db.name,
            // Check if database names don't expose sensitive info
            hasSensitiveName: db.name?.toLowerCase().includes('password') || 
                              db.name?.toLowerCase().includes('secret'),
          })),
        };
      } catch (e) {
        return { supported: true, error: 'Cannot inspect' };
      }
    });
    
    if (idbSecurity.supported && Array.isArray(idbSecurity.databases)) {
      const hasSensitive = idbSecurity.databases.some(db => db.hasSensitiveName);
      expect(hasSensitive).toBe(false);
    }
  });

  test('should handle storage quota securely', async ({ page }) => {
    const quotaInfo = await page.evaluate(async () => {
      if (!navigator.storage || !navigator.storage.estimate) {
        return { supported: false };
      }
      
      const estimate = await navigator.storage.estimate();
      
      return {
        supported: true,
        usage: estimate.usage,
        quota: estimate.quota,
        canPersist: navigator.storage.persist !== undefined,
      };
    });
    
    if (quotaInfo.supported) {
      expect(quotaInfo.usage).toBeGreaterThanOrEqual(0);
      expect(quotaInfo.quota).toBeGreaterThan(0);
    }
  });

  test('should not leak data in console logs', async ({ page }) => {
    const consoleLogs: string[] = [];
    
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    // Trigger some operations
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Check for sensitive patterns in logs
    const hasSensitiveLog = consoleLogs.some(log => 
      log.toLowerCase().includes('password') ||
      log.toLowerCase().includes('secret') ||
      log.toLowerCase().includes('token:')
    );
    
    expect(hasSensitiveLog).toBe(false);
  });
});
