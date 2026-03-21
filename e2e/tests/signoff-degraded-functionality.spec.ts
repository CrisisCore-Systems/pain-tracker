import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { getEvidenceDir } from '../utils/evidence';

const TEST_PASSPHRASE = process.env.TEST_VAULT_PASSPHRASE || 'test-vault-passphrase-2025';
const STABLE_LOCATION_LABEL = 'Lower back location';

function ensureEvidenceRoot(): string {
  const resolved = getEvidenceDir() ?? path.resolve(process.cwd(), 'evidence', 'degraded', 'manual_run');
  process.env.EVIDENCE_DIR = resolved;
  fs.mkdirSync(path.join(resolved, 'degraded'), { recursive: true });
  return resolved;
}

function writeArtifact(evidenceRoot: string, relativePath: string, contents: string): string {
  const outPath = path.join(evidenceRoot, relativePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, contents, 'utf8');
  return outPath;
}

async function saveArtifactScreenshot(
  page: import('@playwright/test').Page,
  evidenceRoot: string,
  relativePath: string
): Promise<string> {
  const outPath = path.join(evidenceRoot, relativePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await page.screenshot({ path: outPath, fullPage: true });
  return outPath;
}

async function dismissVaultGateIfPresent(page: import('@playwright/test').Page): Promise<void> {
  const dialog = page.locator('#vault-dialog-title');
  if (!(await dialog.count())) return;

  const setupButton = page.getByRole('button', { name: /Create secure vault/i });
  const unlockButton = page.getByRole('button', { name: /Unlock vault/i });

  if (await setupButton.count()) {
    await page.locator('#vault-passphrase').fill(TEST_PASSPHRASE);
    await page.locator('#vault-passphrase-confirm').fill(TEST_PASSPHRASE);
    await setupButton.click();
  } else if (await unlockButton.count()) {
    await page.locator('#vault-passphrase-unlock').fill(TEST_PASSPHRASE);
    await unlockButton.click();
  }

  await dialog.waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => undefined);
}

async function openMinimalNewEntryFlow(
  page: import('@playwright/test').Page,
  appUrl: string
): Promise<void> {
  await page.goto(appUrl, { waitUntil: 'commit', timeout: 120_000 });
  await page.waitForLoadState('domcontentloaded', { timeout: 120_000 }).catch(() => undefined);
  await dismissVaultGateIfPresent(page);
  await expect(page.locator('#main-content')).toBeVisible({ timeout: 120_000 });

  await page.keyboard.press('n').catch(() => undefined);

  const painSlider = page.locator('#pain-slider');
  if (await painSlider.isVisible().catch(() => false)) {
    await expect(painSlider).toBeVisible({ timeout: 30_000 });
    return;
  }

  const navToggle = page.locator('[data-testid="nav-toggle"]').first();
  if (await navToggle.isVisible().catch(() => false)) {
    await navToggle.click({ timeout: 10_000 });
  }

  await page.locator('[data-nav-target="new-entry"]').first().click({ timeout: 30_000 });
  await expect(painSlider).toBeVisible({ timeout: 30_000 });
}

test.use({
  video: 'on',
  trace: 'on',
});

test.describe('Degraded Functionality signoff evidence', () => {
  test('captures minimal pain-entry evidence under constraint', async ({ page, context, baseURL }) => {
    const evidenceRoot = ensureEvidenceRoot();
    const appUrl = `${baseURL ?? 'http://localhost:3000'}/app?pt_test_mode=1`;

    const mediaRequests: string[] = [];
    page.on('request', request => {
      const type = request.resourceType();
      if (type === 'media') mediaRequests.push(request.url());
    });

    await page.addInitScript(() => {
      localStorage.setItem('pt:pain-tracker-onboarding-completed', JSON.stringify('true'));
      localStorage.setItem('pt:test_mode', '1');
      localStorage.setItem('pain-tracker-walkthrough-completed', 'true');
      localStorage.setItem('pt:pain-tracker-walkthrough-completed', JSON.stringify('true'));
      localStorage.setItem('beta-warning-dismissed', 'true');
      localStorage.setItem('notification-consent-answered', 'true');
    });

    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    const startedAt = Date.now();

    await openMinimalNewEntryFlow(page, appUrl);

    await cdp.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 500,
      downloadThroughput: 50 * 1024,
      uploadThroughput: 20 * 1024,
      connectionType: 'cellular2g',
    });

    const axe = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    writeArtifact(
      evidenceRoot,
      'degraded/signoff-axe-results.json',
      JSON.stringify(axe, null, 2)
    );

    await expect(page.locator('#pain-slider')).toBeVisible();

    const painControl = page.locator('#pain-slider');
    await painControl.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');

    const locationOption = page.getByRole('checkbox', { name: new RegExp(`^${STABLE_LOCATION_LABEL}$`, 'i') });
    await expect(locationOption).toBeVisible({ timeout: 30_000 });
    await locationOption.focus();
    await page.keyboard.press('Space');

    const saveButton = page.getByRole('button', { name: /Save and finish|Save entry|Save/i }).last();
    await expect(saveButton).toBeVisible();
    await saveButton.focus();
    await page.keyboard.press('Enter');

    await expect(page.getByText(/Entry saved|saved successfully|recorded successfully/i).first()).toBeVisible({ timeout: 20_000 });

    const elapsedMs = Date.now() - startedAt;

    await saveArtifactScreenshot(page, evidenceRoot, 'degraded/signoff-complete.png');

    writeArtifact(
      evidenceRoot,
      'degraded/signoff-summary.txt',
      [
        `elapsed_ms=${elapsedMs}`,
        `media_requests=${mediaRequests.length}`,
        `selected_location=${STABLE_LOCATION_LABEL}`,
        `current_url=${page.url()}`,
        'route_note=/app/new-entry is not a live route in this repo; this run uses /app and opens the real new-entry view in-app.',
      ].join('\n')
    );

    expect(mediaRequests).toHaveLength(0);
  });
});