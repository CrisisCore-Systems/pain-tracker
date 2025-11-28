import { test, expect } from '../test-setup';

test.describe('Notification -> Check-in -> Insights modal', () => {
  test('opens check-in and shows interactive insights modal that blocks leaving until Done', async ({ page }) => {
  // App state normalized by shared test setup (disable onboarding + seeded entries)
  // Simulate user clicking the notification action by navigating to the action URL
  await page.goto('/app/checkin?test_show_insights=1');
  // Wait for app to finish loading (network idle) to ensure UI settled
  await page.waitForLoadState('networkidle');

    // Ensure the check-in UI is visible; if VaultGate appears, create a test passphrase to unlock
    const vaultTitle = page.getByRole('heading', { name: /Secure vault/i });
    if (await vaultTitle.isVisible().catch(() => false)) {
  // We're behind the VaultGate. Fill the setup form to create a vault for the test.
  await page.fill('#vault-passphrase', 'test-passphrase-123');
  await page.fill('#vault-passphrase-confirm', 'test-passphrase-123');
  await page.getByRole('button', { name: /Create secure vault/i }).click();
      // Wait for vault to initialize and the check-in UI to appear
      await expect(page.getByRole('heading', { name: /Daily Check-in/i })).toBeVisible();
    } else {
      await expect(page.getByRole('heading', { name: /Daily Check-in/i })).toBeVisible();
    }

  // The test flag opens the insights modal immediately; assert it appears
  await page.waitForSelector('#insights-title', { timeout: 10000 });
  const dialog = page.getByRole('dialog');
  await expect(page.locator('#insights-title')).toBeVisible();
  await expect(page.locator('#insights-title')).toHaveText(/Thoughtful follow-up/i);
  await expect(dialog.locator('strong', { hasText: 'Immediate test insight' })).toBeVisible();

  // While dialog is open, the route should remain on checkin (parent didn't navigate away)
  expect(page.url()).toContain('/app/checkin');

  // Click Done to finish the flow and allow the parent to navigate/show dashboard
  await dialog.getByRole('button', { name: /Done/i }).click();
  // Wait for the dialog to close first
  await expect(dialog).toBeHidden({ timeout: 5000 });

  // The app may show one of several valid post-checkin states depending on how much data exists:
  // - a "View analytics" button (when analytics are available),
  // - a "Log first entry" button (still in empty-state), or
  // - a save confirmation toast/text like "Entry saved successfully".
  // Wait for any one of these to appear and fail with a clear message if none do.
  const results = await Promise.allSettled([
    page.waitForSelector('button:has-text("View analytics")', { timeout: 5000 }),
    page.waitForSelector('button:has-text("Log first entry")', { timeout: 5000 }),
    page.waitForSelector('text=Entry saved successfully', { timeout: 5000 }),
  ]);

  const found = results.some((r) => r.status === 'fulfilled');
  if (!found) {
    // Capture a helpful debug snapshot in the test output if nothing matched
    const html = await page.content();
    console.error('Post-checkin UI did not show expected indicators. Page HTML snapshot length:', html.length);
  }
  expect(found).toBeTruthy();
  });
});