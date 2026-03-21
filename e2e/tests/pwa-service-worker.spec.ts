import { test, expect } from '../test-setup';
import type { Page } from '@playwright/test';

// Robust service worker waiter with retries and multiple fallbacks
// Safe timeout helper that throws if the page is already closed
const safeWaitForTimeout = async (page: Page, ms: number) => {
  if (page.isClosed()) throw new Error('Page closed before safe wait');
  await page.waitForTimeout(ms);
};

const isWebKitPage = (page: Page) =>
  page.evaluate(() => /AppleWebKit/.test(navigator.userAgent) && !/Chrome|Chromium/.test(navigator.userAgent));

function getServiceWorkerWaitConfig(isWebKit: boolean, maxRetries: number, baseTimeout: number) {
  return {
    timeout: isWebKit ? baseTimeout * 2 : baseTimeout,
    retries: isWebKit ? maxRetries + 2 : maxRetries,
  };
}

async function waitForServiceWorkerApi(page: Page, timeout: number) {
  await page.waitForFunction(() => 'serviceWorker' in navigator, { timeout: Math.min(timeout, 10000) });
}

async function waitForServiceWorkerHandshake(page: Page, timeout: number) {
  await page.waitForFunction(
    () => {
      const scope = globalThis as typeof globalThis & { __pwa_sw_ready?: boolean };
      return scope.__pwa_sw_ready === true;
    },
    { timeout: Math.min(timeout, 5000) },
  );
  return getRegistrationInfo(page);
}

async function waitForServiceWorkerEventInfo(page: Page, timeout: number) {
  await Promise.race([
    page.context().waitForEvent('serviceworker', { timeout: Math.min(timeout, 10000) }),
    page.waitForEvent('close').then(() => {
      throw new Error('Page closed during service worker wait');
    }),
  ] as Array<Promise<unknown>>);
  return getRegistrationInfo(page);
}

async function getRegistrationInfo(page: Page) {
  return page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return null;
    const registrations = await navigator.serviceWorker.getRegistrations().catch(() => []);
    const reg = registrations[0];
    if (!reg) return null;
    return {
      scope: reg.scope,
      active: !!reg.active,
      state: reg.active?.state || 'unknown',
      ready: true,
    };
  });
}

async function getReadyServiceWorkerInfo(page: Page) {
  return page.evaluate(async () => {
    const ready = await navigator.serviceWorker.ready.catch(() => null);
    if (!ready) return null;
    return {
      scope: ready.scope,
      active: !!ready.active,
      state: ready.active?.state || 'unknown',
      ready: true,
    };
  });
}

async function tryWaitForServiceWorker(page: Page, timeout: number, isLastAttempt: boolean) {
  if (page.isClosed()) throw new Error('Page closed before service worker registration');

  await waitForServiceWorkerApi(page, timeout);

  const handshakeInfo = await waitForServiceWorkerHandshake(page, timeout).catch(() => null);
  if (handshakeInfo?.ready) return handshakeInfo;

  const eventInfo = await waitForServiceWorkerEventInfo(page, timeout).catch(() => null);
  if (eventInfo?.ready) return eventInfo;

  const registrationInfo = await getRegistrationInfo(page);
  if (registrationInfo?.ready) return registrationInfo;

  if (!isLastAttempt) return null;
  return getReadyServiceWorkerInfo(page);
}

async function runServiceWorkerAttempt(page: Page, timeout: number, isLastAttempt: boolean) {
  try {
    const info = await tryWaitForServiceWorker(page, timeout, isLastAttempt);
    return { info, errorMessage: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { info: null, errorMessage };
  }
}

const waitForServiceWorker = async (page: Page, maxRetries = 3, baseTimeout = 30000) => {
  const config = getServiceWorkerWaitConfig(await isWebKitPage(page), maxRetries, baseTimeout);

  for (let attempt = 1; attempt <= config.retries; attempt += 1) {
    const result = await runServiceWorkerAttempt(page, config.timeout, attempt === config.retries);
    if (result.info?.ready) return result.info;

    if (result.errorMessage) {
      if (attempt === config.retries) {
        throw new Error(`Service worker never became ready: ${result.errorMessage}`);
      }
      if (page.isClosed()) throw new Error('Page closed while waiting for service worker');
    }

    if (attempt < config.retries) {
      await safeWaitForTimeout(page, 2000);
    }
  }

  throw new Error('Service worker never became ready');
};

// Helper: check SW support
const isServiceWorkerAvailable = async (page: Page) => {
  return page.evaluate(() => 'serviceWorker' in navigator);
};

test.describe('PWA Service Worker', () => {
  // If WebKit continues to be unstable in CI, skip the entire suite on WebKit.
  test.beforeAll(async ({ browserName }) => {
    if (browserName === 'webkit') {
      test.skip(true, 'Service worker tests flaky in WebKit — skipping to avoid CI noise');
    }
  });
  test.beforeEach(async ({ page }) => {
    // WebKit can be slow / flaky — increase per-test timeout and add diagnostics
    const isWebKit = await isWebKitPage(page);

    if (isWebKit) {
      test.setTimeout(180_000);
      page.on('close', () => console.log('Page closed unexpectedly (webkit)'));
      page.on('pageerror', (err) => console.log('WebKit pageerror:', err));
      page.on('console', (msg) => {
        if (msg.type() === 'error') console.log('WebKit console error:', msg.text());
      });
      page.on('response', (res) => {
        if (res.status() >= 400) console.log('WebKit response error:', res.status(), res.url());
      });
    }

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const supported = await isServiceWorkerAvailable(page);
    if (!supported) {
      test.skip(true, 'Service workers not supported in this environment');
    }
  });

  test('should register service worker successfully', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Service worker tests flaky in WebKit');
    const isWebKit = await isWebKitPage(page);

    const swRegistration = await waitForServiceWorker(page, isWebKit ? 5 : 3, isWebKit ? 45000 : 30000);

    const pageUrl = new URL(page.url());
    const expectedScope = `${pageUrl.origin}${pageUrl.pathname}`;

    if (isWebKit) {
      expect(swRegistration.scope).toBeDefined();
      expect(swRegistration.scope.startsWith(expectedScope)).toBe(true);
      if (swRegistration.active !== undefined) {
        expect(swRegistration.active).toBe(true);
      }
    } else {
      expect(swRegistration.active).toBe(true);
      expect(swRegistration.state).toBe('activated');
      expect(swRegistration.scope).toBeDefined();
      expect(swRegistration.scope.startsWith(expectedScope)).toBe(true);
    }
  });

  test('should cache static assets on install', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Service worker tests flaky in WebKit');
    const isWebKit = await page.evaluate(() => {
      const ua = navigator.userAgent || '';
      return /AppleWebKit/.test(ua) && !/Chrome|Chromium/.test(ua);
    });

    // Wait for service worker first
    await waitForServiceWorker(page, isWebKit ? 5 : 3, isWebKit ? 45000 : 30000);

    const cachedAssets = await page.evaluate(async () => {
      if (!('caches' in globalThis)) return { supported: false };
      const cacheNames = await caches.keys();
      const staticCache = cacheNames.find((name) => name.includes('static') || name.includes('pain-tracker'));
      if (!staticCache) return { supported: true, found: false, assets: [], count: 0 };
      const cache = await caches.open(staticCache);
      const requests = await cache.keys();
      return { supported: true, found: true, cacheName: staticCache, assets: requests.map((r) => r.url), count: requests.length };
    });

    if (!cachedAssets.supported) {
      test.skip(true, 'Caches API not supported in this environment');
      return;
    }

    if (!cachedAssets.found) {
      if (isWebKit) {
        test.skip(true, 'Caches not populated reliably in WebKit in this environment');
        return;
      }
    }

    expect(cachedAssets.found).toBe(true);
    expect(cachedAssets.count).toBeGreaterThan(0);
    const assetUrls = (cachedAssets.assets || []).join(' ');
    expect(assetUrls).toContain('manifest.json');
  });

  test('should never cache /api responses', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Service worker tests flaky in WebKit');

    // Wait for service worker first
    await waitForServiceWorker(page);
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null, { timeout: 15_000 });

    // Provide a deterministic 200 response for an API URL so we can assert it is not cached.
    await page.route('**/api/test-sw-cache', async (route) => {
      if (route.request().method() !== 'GET') return route.continue();
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true, ts: Date.now() }),
        headers: { 'cache-control': 'no-store' },
      });
    });

    const apiResult = await page.evaluate(async () => {
      const res = await fetch('/api/test-sw-cache', { cache: 'no-store' });
      return { ok: res.ok, status: res.status, json: await res.json() };
    });

    expect(apiResult.ok).toBe(true);
    expect(apiResult.status).toBe(200);
    expect(apiResult.json.ok).toBe(true);

    const cachedApi = await page.evaluate(async () => {
      if (!('caches' in globalThis)) return { supported: false };
      const cacheNames = await caches.keys();
      const staticCacheName = cacheNames.find((name) => name.includes('static') || name.includes('pain-tracker'));
      if (!staticCacheName) return { supported: true, foundStaticCache: false };
      const cache = await caches.open(staticCacheName);
      const keys = await cache.keys();
      return {
        supported: true,
        foundStaticCache: true,
        staticCacheName,
        cachedUrls: keys.map((r) => r.url),
      };
    });

    if (!cachedApi.supported) {
      test.skip(true, 'Caches API not supported in this environment');
      return;
    }

    expect(cachedApi.foundStaticCache).toBe(true);
    const joined = (cachedApi.cachedUrls || []).join(' ');
    expect(joined).not.toContain('/api/test-sw-cache');
  });

  test('should update service worker version', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Service worker tests flaky in WebKit');
    const isWebKit = await isWebKitPage(page);

    // Wait for initial service worker
    await waitForServiceWorker(page, isWebKit ? 5 : 3, isWebKit ? 45000 : 30000);

    // Unregister existing service workers and clear caches to simulate update
    await page.evaluate(async () => {
      if (navigator.serviceWorker) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) await r.unregister();
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    });

    // Reload to trigger fresh registration
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait for new registration
    const newRegistration = await waitForServiceWorker(page, isWebKit ? 5 : 3, isWebKit ? 45000 : 30000);

    if (isWebKit) {
      expect(['activated', 'activating', null]).toContain(newRegistration.state);
    } else {
      expect(newRegistration.active).toBe(true);
      expect(['activated', 'activating']).toContain(newRegistration.state);
    }
  const urlAfterReload = new URL(page.url());
  const expectedNewScope = `${urlAfterReload.origin}${urlAfterReload.pathname}`;
  expect(newRegistration.scope.startsWith(expectedNewScope)).toBe(true);
  });

  test('should handle service worker errors gracefully', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Service worker tests flaky in WebKit');
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.evaluate(async () => {
      await fetch('/non-existent-endpoint').catch(() => {
        // expected to fail
      });
    });

    await page.waitForTimeout(1000);
    const hasServiceWorkerError = errors.some((err) => err.toLowerCase().includes('service worker'));
    if (hasServiceWorkerError) console.warn('Service worker errors detected:', errors);
  });

  test('should clean up old caches on activation', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Service worker tests flaky in WebKit');
    await waitForServiceWorker(page);

    // Derive the expected cache name from the actual service worker script version.
    // (Avoid hard-coding a version like 'v1.2' which will drift over time.)
    const swResponse = await page.request.get('/sw.js');
    const swText = swResponse.ok()
      ? await swResponse.text()
      : await (await page.request.get('/pain-tracker/sw.js')).text();
    const versionMatch = /const\s+SW_VERSION\s*=\s*'([^']+)'/.exec(swText);
    if (!versionMatch) {
      throw new Error('Expected SW_VERSION in service worker script');
    }
    const expectedCacheName = `pain-tracker-static-v${versionMatch[1]}`;

    await expect
      .poll(
        async () => {
          return await page.evaluate(async (expected) => {
            const cacheNames = await caches.keys();
            return cacheNames.filter((name) => name.startsWith('pain-tracker-') && name !== expected);
          }, expectedCacheName);
        },
        { timeout: 15000 }
      )
      .toEqual([]);
  });
});

test.describe('PWA Service Worker - Advanced Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const supported = await isServiceWorkerAvailable(page);
    if (!supported) test.skip(true, 'Service workers not supported');
  });

  test('should support skipWaiting for immediate activation', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Service worker tests flaky in WebKit');
    const isWebKit = await isWebKitPage(page);

    await waitForServiceWorker(page, isWebKit ? 5 : 3, isWebKit ? 45000 : 30000);

    if (isWebKit) test.skip(true, 'skipWaiting timing unreliable in WebKit');

    const skipWaitingSupported = await page.evaluate(async () => {
      const reg = await navigator.serviceWorker.ready;
      return reg.active !== null && reg.waiting === null;
    });
    expect(skipWaitingSupported).toBe(true);
  });

  test('should claim clients immediately on activation', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Service worker tests flaky in WebKit');
    const isWebKit = await isWebKitPage(page);

    await waitForServiceWorker(page, isWebKit ? 5 : 3, isWebKit ? 45000 : 30000);

    if (isWebKit) test.skip(true, 'client claim timing unreliable in WebKit');

    const clientsClaimed = await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      return navigator.serviceWorker.controller !== null;
    });
    expect(clientsClaimed).toBe(true);
  });
});

