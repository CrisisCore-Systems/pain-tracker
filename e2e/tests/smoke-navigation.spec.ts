import { test, expect } from '../test-setup';
import { removeBlockingOverlays } from '../utils/test-harness';

function attachPageErrorCollector(page: import('@playwright/test').Page) {
  const pageErrors: string[] = [];
  page.on('pageerror', (err) => {
    pageErrors.push(String(err));
  });
  return pageErrors;
}

async function gotoAppFromLanding(page: import('@playwright/test').Page) {
  // Use `commit` to avoid rare hangs waiting for domcontentloaded on slow/contended dev servers.
  await page.goto('/', { waitUntil: 'commit' });

  // Ensure the landing page rendered something real. Cold-start Vite + large bundles
  // can leave us in a LoadingFallback for a while, so prefer a stable CTA selector
  // with a more generous timeout.
  await expect(page.locator('[data-testid="nav-cta-start"], [data-testid="hero-cta-start"]').first()).toBeVisible({
    timeout: 90_000,
  });

  // Clear transient prompts/toasts that can intercept clicks.
  await removeBlockingOverlays(page);

  const navCta = page.getByTestId('nav-cta-start');
  const heroCta = page.getByTestId('hero-cta-start');
  const cta = (await navCta.count()) ? navCta : heroCta;

  // Clicking can be flaky on mobile Safari if the element is mid-animation/reflow.
  // Try click first; if it fails, fall back to direct navigation.
  let clicked = false;
  try {
    await expect(cta).toBeVisible({ timeout: 10_000 });
    await cta.scrollIntoViewIfNeeded().catch(() => undefined);
    await cta.click({ timeout: 10_000 });
    clicked = true;
  } catch {
    clicked = false;
  }

  if (!clicked) {
    await page.goto('/start', { waitUntil: 'commit' });
  }

  // /start immediately redirects to /app behind VaultGate.
  await page.waitForURL(/\/app(\/.*)?$/i, { timeout: 45_000 });

  // App shell should appear.
  await expect(page.locator('#main-content')).toBeVisible({ timeout: 45_000 });

  // VaultGate dialog should not be present in DEV test-mode.
  await expect(page.locator('#vault-dialog-title')).toHaveCount(0);
}

test.describe('smoke: navigation + load stability', () => {
  test('landing → app loads without runtime errors', async ({ page }) => {
    const pageErrors = attachPageErrorCollector(page);

    await gotoAppFromLanding(page);

    expect(pageErrors, 'no pageerror exceptions').toEqual([]);
  });

  test('resources page loads and is not blank', async ({ page }) => {
    const pageErrors = attachPageErrorCollector(page);

    await page.goto('/resources/what-to-include-in-pain-journal', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: /what to include in a pain journal/i })).toBeVisible({
      timeout: 30_000,
    });

    expect(pageErrors, 'no pageerror exceptions').toEqual([]);
  });
});
