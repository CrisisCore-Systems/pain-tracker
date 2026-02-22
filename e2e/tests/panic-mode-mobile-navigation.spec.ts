import { test, expect } from '../test-setup';

const closeLabel = /(?:i'm feeling better|exit|done)/i;

test.describe('Panic Mode: mobile navigation safety', () => {
  test('close control remains reachable on small screens', async ({ page }, testInfo) => {
    test.skip(!testInfo.project.name.startsWith('mobile-'), 'Mobile-only regression');

    await page.goto('/app', { waitUntil: 'commit' });
    await page.waitForLoadState('networkidle');

    // Ensure the app shell is present before interacting.
    await expect(page.locator('#main-content')).toBeVisible({ timeout: 45_000 });

    // VaultGate dialog should not be present in DEV test-mode.
    await expect(page.locator('#vault-dialog-title')).toHaveCount(0);

    // Open Panic Mode (floating action button).
    await page.getByRole('button', { name: /activate calm breathing mode/i }).click();

    const dialog = page.locator('[role="dialog"][aria-labelledby="panic-mode-title"]');
    await expect(dialog).toBeVisible({ timeout: 10_000 });

    // The top-right close icon is the critical escape hatch.
    const closeIconButton = dialog.locator('button[aria-label]').first();
    await expect(closeIconButton).toBeVisible({ timeout: 10_000 });
    await expect(closeIconButton).toHaveAttribute('aria-label', closeLabel);

    // If zoom/suppression breaks mobile layout, this click is likely to fail.
    await closeIconButton.click({ timeout: 10_000 });
    await expect(dialog).toHaveCount(0);

    // Ensure the user can re-open after closing (no navigation dead-end).
    await expect(page.getByRole('button', { name: /activate calm breathing mode/i })).toBeVisible({ timeout: 10_000 });
  });
});
