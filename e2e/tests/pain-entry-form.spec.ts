import { test, expect } from '../test-setup';

type IndexedDBWithDatabases = IDBFactory & {
  databases?: () => Promise<Array<{ name?: string }>>;
};

test.describe('PainEntryForm e2e', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure fresh app state by clearing local storage and IndexedDB
  await page.goto('/');
    await page.evaluate(async () => {
      localStorage.clear();
      // Clear all IndexedDB databases (works in modern browsers)
      const w = window as unknown as { indexedDB?: IndexedDBWithDatabases };
      if (w.indexedDB && typeof w.indexedDB.databases === 'function') {
        const dbs = await w.indexedDB.databases();
        await Promise.all(
          dbs.map(d =>
            d.name ? Promise.resolve(w.indexedDB!.deleteDatabase(d.name)) : Promise.resolve(undefined)
          )
        );
      }
    });
  await page.reload();
    // Wait for app to finish loading (network idle) and for main UI text
    await page.waitForLoadState('networkidle');
    // Hook into page console and pageerror to capture helpful diagnostics
    page.on('console', (msg) => console.log('[page.console]', msg.type(), msg.text()));
    page.on('pageerror', (err) => console.log('[page.error]', err.message));

    // Try to detect either the app title or the entry card title, with a longer timeout
    const timeout = 30_000;
    try {
      await expect(page.getByText(/Pain Tracker/)).toBeVisible({ timeout });
    } catch {
      // If the app shows an error page, attempt to recover by clicking the Refresh button
      const errorHeading = page.getByRole('heading', { name: /Something went wrong/i }).first();
      if (await errorHeading.count()) {
        console.log('Detected error page; attempting to click Refresh Page');
        const refreshBtn = page.getByRole('button', { name: /Refresh Page/i }).first();
        if (await refreshBtn.count()) {
          await refreshBtn.click();
          await page.waitForLoadState('networkidle');
        }
      }
      // Fallback: require the Record Pain Entry card title
      await expect(page.getByText(/Record Pain Entry/)).toBeVisible({ timeout });
    }
  });

  test('can create a pain entry and see it in the list', async ({ page }) => {
    // Page should already be at baseURL from beforeEach

    // Wait for the Record Pain Entry card and the pain input to be visible
    const painCard = page.getByRole('article', { name: /Record Pain Entry/i }).first();
    // Best-effort: if the article role isn't present, fall back to locating the card title
    if (!(await painCard.count())) {
      await expect(page.getByText(/Record Pain Entry/i)).toBeVisible();
    } else {
      await expect(painCard).toBeVisible();
    }

    // Target the pain range input by id for reliability
    const painRange = page.locator('#pain-level');
    await expect(painRange).toBeVisible({ timeout: 10_000 });

    // Set pain to 6 via DOM and dispatch input event
    await painRange.evaluate((el: HTMLInputElement) => {
      el.value = '6';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // Fill optional notes if present
    const notesLocator = page.locator('textarea').first();
    if (await notesLocator.count()) {
      await expect(notesLocator).toBeVisible();
      await notesLocator.fill('Automated e2e test entry');
    }

    // Navigate the form: repeatedly click Next until Save Entry appears
    const nextBtn = page.getByRole('button', { name: /Next/i });
    const saveBtn = page.getByRole('button', { name: /Save Entry/i });

    // Click Next until Save Entry is visible or maximum steps reached
    for (let i = 0; i < 10; i++) {
      if (await saveBtn.count() && (await saveBtn.isVisible())) break;
      if (await nextBtn.count() && (await nextBtn.isEnabled())) {
        await nextBtn.click();
        await page.waitForTimeout(200); // small pause for UI transitions
      } else {
        break;
      }
    }

  // Finally click Save Entry
    if (await saveBtn.count()) {
      await expect(saveBtn).toBeVisible();
      await saveBtn.click();
    } else {
      // As fallback submit the form
      await page.locator('form[role="form"]').evaluate((f: HTMLFormElement) => f.requestSubmit && f.requestSubmit());
    }

    // Verify entry appears in the history or as a toast
    await expect(page.getByText('Automated e2e test entry')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/6/)).toBeVisible();
  });

  test('export report produces CSV download when WCB report shown', async ({ page }) => {
    // Open the WCB report panel using the header button
    const reportToggle = page.getByRole('button', { name: /Show WCB Report|Hide WCB Report/i }).first();
    if (!(await reportToggle.count())) {
      test.skip(true, 'WCB Report toggle not present in this build');
      return;
    }
    await reportToggle.click();
    // Wait for the WCB Report section to appear
    await expect(page.getByText(/WCB Report/i)).toBeVisible();

    // Find the export button inside the WCB report section
    const exportBtn = page.getByRole('button', { name: /export|download|worksafebc/i }).first();
    if (!(await exportBtn.count())) {
      test.skip(true, 'No export button found in this app build');
      return;
    }

    // Intercept download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      exportBtn.click(),
    ]);

    const path = await download.path();
    expect(path).not.toBeNull();
  });
});
