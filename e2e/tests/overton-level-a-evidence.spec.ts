import { expect } from '@playwright/test';
import { test } from '../test-setup';
import {
  ensureEvidenceSubdir,
  saveEvidenceDownload,
  saveEvidenceScreenshot,
  writeEvidenceText,
} from '../utils/evidence';

async function gotoApp(page: import('@playwright/test').Page) {
  // Prefer the app entrypoint used by existing smoke tests.
  await page.goto('/start', { waitUntil: 'commit' }).catch(async () => {
    await page.goto('/app', { waitUntil: 'commit' });
  });

  await page.waitForURL(/\/app(\/.*)?$/i, { timeout: 45_000 }).catch(async () => {
    // If routing differs in a given environment, fall back to base.
    await page.goto('/app', { waitUntil: 'commit' });
  });

  await page.waitForLoadState('domcontentloaded');
  await expect(page.locator('#main-content')).toBeVisible({ timeout: 45_000 });
}

test.describe('Overton Level A evidence capture (self-assessed)', () => {
  test('PC-1 offline cache load (evidence)', async ({ page, context, browserName }) => {
    await gotoApp(page);

    const swReady = await page.evaluate(async () => {
      if (!navigator.serviceWorker) return false;
      return await Promise.race([
        navigator.serviceWorker.ready.then(() => true),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5_000)),
      ]);
    });

    // Mirror the repo's existing WebKit reliability guard.
    if (browserName === 'webkit' && !swReady) {
      test.skip(true, 'Service worker not ready under WebKit test runner');
    }

    const onlineTitle = await page.title();

    const cacheSummary = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      const ptCache = cacheNames.find((n) => n.startsWith('pain-tracker-')) ?? null;
      const hasOfflineHtml = ptCache
        ? (await (await caches.open(ptCache)).match('/offline.html')) !== undefined
        : false;

      return {
        navigatorOnLine: navigator.onLine,
        swSupported: !!navigator.serviceWorker,
        cacheNames,
        ptCache,
        hasOfflineHtml,
      };
    });

    // Toggle offline and reload.
    await context.setOffline(true);
    // When offline, some engines may surface ERR_INTERNET_DISCONNECTED even if a SW
    // serves from cache. Treat reload failures as evidence-relevant, but continue.
    await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => undefined);
    await page.waitForLoadState('domcontentloaded').catch(() => undefined);

    const offlineTitle = await page.title();
    expect(offlineTitle).toBeTruthy();
    expect(offlineTitle).toBe(onlineTitle);

    // Capture evidence artifacts if enabled.
    ensureEvidenceSubdir('01-offline');
    writeEvidenceText('01-offline/cache-summary.json', JSON.stringify(cacheSummary, null, 2));
    await saveEvidenceScreenshot(page, '01-offline/offline-reload.png');

    await context.setOffline(false);
  });

  test('PC-5 offline export (CSV/JSON/PDF/WCB) (evidence)', async ({ page }) => {
    await gotoApp(page);

    // Navigate to Reports via stable nav target.
    await page.locator('[data-nav-target="reports"]').first().click({ timeout: 45_000 });
    await expect(page.getByRole('heading', { name: 'Reports & Export' })).toBeVisible({ timeout: 45_000 });

    ensureEvidenceSubdir('02-exports');
    await saveEvidenceScreenshot(page, '02-exports/reports-page.png');

    const exportAndSave = async (buttonName: RegExp) => {
      const button = page.getByRole('button', { name: buttonName }).first();
      await expect(button).toBeEnabled();
      const downloadPromise = page.waitForEvent('download');
      await button.click();
      const download = await downloadPromise;
      const suggested = download.suggestedFilename();
      await saveEvidenceDownload(download, `02-exports/${suggested}`);
      return suggested;
    };

    await exportAndSave(/CSV Spreadsheet/i);
    await exportAndSave(/JSON Data/i);
    await exportAndSave(/PDF Report/i);

    // Specialized report: WCB PDF
    const wcbButton = page.getByRole('button', { name: /WorkSafe BC Report/i }).first();
    await expect(wcbButton).toBeEnabled();
    const wcbDownloadPromise = page.waitForEvent('download');
    await wcbButton.click();
    const wcbDownload = await wcbDownloadPromise;
    await saveEvidenceDownload(wcbDownload, `02-exports/${wcbDownload.suggestedFilename()}`);
  });

  test('PC-4 crisis UX: Panic overlay reachable + closable (evidence)', async ({ page }) => {
    await gotoApp(page);

    // Open panic overlay.
    await page.getByRole('button', { name: /Activate calm breathing mode/i }).click();
    await page.locator('div[role="dialog"]').first().waitFor({ state: 'visible', timeout: 15_000 });

    ensureEvidenceSubdir('04-crisis-ux');
    await saveEvidenceScreenshot(page, '04-crisis-ux/panic-mode-open.png');

    // Close via the visible close button.
    const dialog = page.locator('div[role="dialog"]').first();
    // PanicMode close button uses adaptive copy and does not include the word "close".
    const closeLabel = /Exit|Done|I'm feeling better/i;
    await dialog.getByRole('button', { name: closeLabel }).first().click({ timeout: 30_000 });
    await expect(page.locator('div[role="dialog"]')).toHaveCount(0);
    await saveEvidenceScreenshot(page, '04-crisis-ux/panic-mode-closed.png');
  });
});
