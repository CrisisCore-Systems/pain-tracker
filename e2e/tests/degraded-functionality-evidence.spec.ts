import fs from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { chromium, devices, expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';

test.describe.configure({ mode: 'serial' });
test.setTimeout(300_000);

const TEST_PASSPHRASE = process.env.TEST_VAULT_PASSPHRASE || 'test-vault-passphrase-2025';
const PACKET_DATE = new Date().toISOString().slice(0, 10);

function getBaseUrl(): string {
  return process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
}

function getPacketRoot(): string {
  return path.resolve(process.cwd(), 'evidence', 'degraded-functionality', PACKET_DATE);
}

function ensureDir(...parts: string[]): string {
  const dir = path.join(getPacketRoot(), ...parts);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function writePacketFile(relativePath: string, contents: string): string {
  const filePath = path.join(getPacketRoot(), relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, 'utf8');
  return filePath;
}

async function saveScreenshot(page: Page, relativePath: string): Promise<string> {
  const outPath = path.join(getPacketRoot(), relativePath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await page.screenshot({ path: outPath, fullPage: true });
  return outPath;
}

async function bootstrapContext(context: BrowserContext): Promise<void> {
  await context.addInitScript(() => {
    try {
      localStorage.setItem('pt:test_mode', '1');
      localStorage.setItem('pain-tracker-onboarding-completed', 'true');
      localStorage.setItem('pt:pain-tracker-onboarding-completed', JSON.stringify('true'));
      localStorage.setItem('beta-warning-dismissed', 'true');
      localStorage.setItem('notification-consent-answered', 'true');
      localStorage.setItem('beta-analytics-consent', JSON.stringify({ consented: false, timestamp: Date.now() }));
    } catch {
      // Ignore storage failures in restricted browsers.
    }
  });
}

async function dismissVaultGateIfPresent(page: Page): Promise<void> {
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

  await page.locator('#vault-dialog-title').waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => undefined);
}

async function gotoReadyApp(page: Page, baseUrl: string): Promise<void> {
  await page.goto(`${baseUrl}/app?pt_test_mode=1`, {
    waitUntil: 'commit',
    timeout: 120_000,
  });
  await page.waitForLoadState('domcontentloaded', { timeout: 120_000 }).catch(() => undefined);
  await dismissVaultGateIfPresent(page);
  await expect(page.locator('#main-content')).toBeVisible({ timeout: 120_000 });
}

async function openNewEntry(page: Page): Promise<void> {
  await page.keyboard.press('n').catch(() => undefined);
  const slider = page.locator('#pain-slider');
  if (await slider.isVisible().catch(() => false)) {
    return;
  }

  const navToggle = page.locator('[data-testid="nav-toggle"]').first();
  if (await navToggle.isVisible().catch(() => false)) {
    await navToggle.click({ timeout: 10_000 });
  }

  await page.locator('[data-nav-target="new-entry"]').first().click({ timeout: 30_000 });
  await expect(slider).toBeVisible({ timeout: 30_000 });
}

async function runEssentialEntryFlowPointer(page: Page): Promise<Record<string, number>> {
  const startedAt = Date.now();
  await openNewEntry(page);
  const newEntryReadyMs = Date.now() - startedAt;

  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: /Increase pain level/i }).click();
  }

  const firstLocation = page.locator('button[role="checkbox"][aria-label$=" location"]').first();
  await firstLocation.click();

  const saveButton = page.getByRole('button', { name: /Save and finish|Save entry|Save/i }).last();
  await expect(saveButton).toBeVisible();
  await saveButton.click();

  await expect(page.locator('#main-content')).toBeVisible({ timeout: 20_000 });
  await page.getByText(/Entry saved/i).waitFor({ state: 'visible', timeout: 10_000 }).catch(() => undefined);

  return {
    newEntryReadyMs,
    totalFlowMs: Date.now() - startedAt,
  };
}

async function focusByTab(page: Page, locator: import('@playwright/test').Locator, maxTabs = 80): Promise<number> {
  for (let tabCount = 0; tabCount < maxTabs; tabCount++) {
    const isFocused = await locator.evaluate((element) => element === document.activeElement).catch(() => false);
    if (isFocused) return tabCount;
    await page.keyboard.press('Tab');
  }

  throw new Error(`Unable to focus target with keyboard after ${maxTabs} tabs`);
}

async function runEssentialEntryFlowKeyboard(page: Page): Promise<Record<string, number>> {
  const startedAt = Date.now();

  await page.keyboard.press('n');
  await expect(page.locator('#pain-slider')).toBeVisible({ timeout: 30_000 });
  const newEntryReadyMs = Date.now() - startedAt;

  const slider = page.locator('#pain-slider');
  const locationButton = page.locator('button[role="checkbox"][aria-label$=" location"]').first();
  const saveButton = page.getByRole('button', { name: /Save and finish|Save entry|Save/i }).last();

  const tabStopsToSlider = await focusByTab(page, slider);
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('ArrowRight');
  }

  const tabStopsToLocation = await focusByTab(page, locationButton);
  await page.keyboard.press('Space');

  const tabStopsToSave = await focusByTab(page, saveButton);
  await page.keyboard.press('Enter');

  await expect(page.locator('#main-content')).toBeVisible({ timeout: 20_000 });
  await page.getByText(/Entry saved/i).waitFor({ state: 'visible', timeout: 10_000 }).catch(() => undefined);

  return {
    newEntryReadyMs,
    tabStopsToSlider,
    tabStopsToLocation,
    tabStopsToSave,
    totalFlowMs: Date.now() - startedAt,
  };
}

function collectDirectoryArtifacts(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath).map((name) => path.join(dirPath, name));
}

test('captures 2G low-bandwidth essential workflow artifacts', async ({ browser }) => {
  const baseUrl = getBaseUrl();
  const artifactDir = ensureDir('01-low-bandwidth');
  const videoDir = path.join(artifactDir, 'video');
  fs.mkdirSync(videoDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordHar: {
      path: path.join(artifactDir, 'essential-flow-2g.har'),
      mode: 'full',
      content: 'embed',
    },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });

  await bootstrapContext(context);
  const page = await context.newPage();
  const client = await context.newCDPSession(page);

  await gotoReadyApp(page, baseUrl);

  await client.send('Network.enable');
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 1500,
    downloadThroughput: 31_250,
    uploadThroughput: 6_250,
    connectionType: 'cellular2g',
  });

  const flowStartedAt = Date.now();
  const flowTimings = await runEssentialEntryFlowPointer(page);
  const throttledWorkflowMs = Date.now() - flowStartedAt;

  await saveScreenshot(page, '01-low-bandwidth/app-ready-2g.png');

  const navigationTiming = await page.evaluate(() => {
    const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (!entry) return null;

    return {
      domContentLoadedMs: Math.round(entry.domContentLoadedEventEnd),
      loadEventMs: Math.round(entry.loadEventEnd),
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
    };
  });

  await context.close();

  writePacketFile(
    '01-low-bandwidth/timings.json',
    JSON.stringify(
      {
        profile: 'Chromium desktop with CDP Network.emulateNetworkConditions(cellular2g)',
        ...flowTimings,
          throttledWorkflowMs,
          navigationTiming,
        artifacts: {
          har: 'essential-flow-2g.har',
          screenshots: ['app-ready-2g.png'],
          videoFiles: collectDirectoryArtifacts(videoDir).map((fullPath) => path.basename(fullPath)),
        },
          note: 'Network throttling was applied to the essential workflow after the app shell loaded. This avoids conflating Vite dev-server bootstrap cost with release-surface behavior.',
      },
      null,
      2
    )
  );
});

test('captures CPU-throttled constrained-runtime artifacts and documents low-memory limitation', async () => {
  const baseUrl = getBaseUrl();
  const artifactDir = ensureDir('02-constrained-runtime');
  const videoDir = path.join(artifactDir, 'video');
  fs.mkdirSync(videoDir, { recursive: true });

  const lowEndBrowser: Browser = await chromium.launch({
    headless: true,
    args: ['--enable-low-end-device-mode', '--js-flags=--max-old-space-size=256'],
  });

  try {
    const context = await lowEndBrowser.newContext({
      ...devices['Pixel 5'],
      recordVideo: { dir: videoDir, size: { width: 393, height: 851 } },
    });

    await bootstrapContext(context);
    const page = await context.newPage();
    const client = await context.newCDPSession(page);
    await client.send('Performance.enable');
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    const navStartedAt = Date.now();
    await gotoReadyApp(page, baseUrl);
    const appReadyMs = Date.now() - navStartedAt;
    const flowTimings = await runEssentialEntryFlowPointer(page);

    const perfMetrics = await client.send('Performance.getMetrics');
    await saveScreenshot(page, '02-constrained-runtime/essential-flow-mobile-profile.png');

    await context.close();

    writePacketFile(
      '02-constrained-runtime/profile.json',
      JSON.stringify(
        {
          browser: 'Chromium',
          deviceProfile: 'Pixel 5',
          launchArgs: ['--enable-low-end-device-mode', '--js-flags=--max-old-space-size=256'],
          cpuThrottleRate: 4,
          appReadyMs,
          ...flowTimings,
          performanceMetrics: perfMetrics.metrics,
          artifacts: {
            screenshots: ['essential-flow-mobile-profile.png'],
            videoFiles: collectDirectoryArtifacts(videoDir).map((fullPath) => path.basename(fullPath)),
          },
        },
        null,
        2
      )
    );

    writePacketFile(
      '02-constrained-runtime/limitations.md',
      [
        '# Constrained Runtime Limitation',
        '',
        '- This run uses Chromium low-end-device flags, a reduced V8 old-space ceiling, mobile emulation, and 4x CPU throttling.',
        '- It is useful evidence for degraded behavior under browser-level constraint.',
        '- It is not sufficient proof of full 512MB-class device operation across the whole system.',
        '- A true 512MB signoff still requires either a real constrained device/emulator profile with recorded runs or an equivalent hardware-backed lab setup.',
      ].join('\n')
    );
  } finally {
    await lowEndBrowser.close();
  }
});

test('captures keyboard-only essential workflow artifacts', async ({ browser }) => {
  const baseUrl = getBaseUrl();
  const artifactDir = ensureDir('03-keyboard-only');
  const videoDir = path.join(artifactDir, 'video');
  fs.mkdirSync(videoDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });

  await bootstrapContext(context);
  const page = await context.newPage();
  await gotoReadyApp(page, baseUrl);
  const flowTimings = await runEssentialEntryFlowKeyboard(page);
  await saveScreenshot(page, '03-keyboard-only/post-save.png');
  await context.close();

  writePacketFile(
    '03-keyboard-only/keyboard-flow.json',
    JSON.stringify(
      {
        workflow: 'App open -> keyboard shortcut to new entry -> slider -> location -> save',
        ...flowTimings,
        blockedControls: [],
        artifacts: {
          screenshots: ['post-save.png'],
          videoFiles: collectDirectoryArtifacts(videoDir).map((fullPath) => path.basename(fullPath)),
        },
      },
      null,
      2
    )
  );
});

test('captures automated accessibility scan artifacts and manual screen-reader gap note', async ({ browser }) => {
  const baseUrl = getBaseUrl();
  ensureDir('04-accessibility');

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await bootstrapContext(context);
  const page = await context.newPage();

  await gotoReadyApp(page, baseUrl);
  const dashboardResults = await new AxeBuilder({ page }).analyze();
  await saveScreenshot(page, '04-accessibility/dashboard.png');

  await openNewEntry(page);
  const newEntryResults = await new AxeBuilder({ page }).analyze();
  await saveScreenshot(page, '04-accessibility/new-entry.png');

  await context.close();

  writePacketFile('04-accessibility/axe-dashboard.json', JSON.stringify(dashboardResults, null, 2));
  writePacketFile('04-accessibility/axe-new-entry.json', JSON.stringify(newEntryResults, null, 2));
  writePacketFile(
    '04-accessibility/manual-screen-reader-walkthrough.md',
    [
      '# Manual Screen Reader Walkthrough',
      '',
      'Status: not executed in this CLI automation environment.',
      '',
      'Required human run before final signoff:',
      '- Screen reader: Narrator, NVDA, JAWS, or VoiceOver.',
      '- Critical path 1: launch app and confirm dashboard headings, landmarks, and panic-mode button announcement.',
      '- Critical path 2: open New Entry and confirm pain slider, location buttons, and save action are announced clearly.',
      '- Critical path 3: open Reports & Export and confirm export controls announce selected policy and warnings.',
      '',
      'Reason this is still manual:',
      '- Automated axe scans do not prove screen-reader speech output or announcement quality.',
      '- This remains an evidence gap until a human walkthrough is recorded or explicitly accepted as a limitation.',
    ].join('\n')
  );
});

test('captures no-media-autoload network trace for essential flows', async ({ browser }) => {
  const baseUrl = getBaseUrl();
  ensureDir('05-network');

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await bootstrapContext(context);
  const page = await context.newPage();

  const requests: Array<{ url: string; resourceType: string; method: string }> = [];
  page.on('request', (request) => {
    requests.push({
      url: request.url(),
      resourceType: request.resourceType(),
      method: request.method(),
    });
  });

  await gotoReadyApp(page, baseUrl);
  await openNewEntry(page);
  await saveScreenshot(page, '05-network/new-entry-no-media.png');

  const mediaRequests = requests.filter((request) => request.resourceType === 'media');

  await context.close();

  writePacketFile(
    '05-network/no-media-autoload.json',
    JSON.stringify(
      {
        scope: 'Initial app load plus New Entry open, with no explicit user media action.',
        totalRequests: requests.length,
        mediaRequests,
        sampleRequests: requests.slice(0, 100),
      },
      null,
      2
    )
  );

  expect(mediaRequests).toHaveLength(0);

  writePacketFile(
    'README.md',
    [
      `# Degraded Functionality Evidence Packet (${PACKET_DATE})`,
      '',
      'Artifacts captured:',
      '- `01-low-bandwidth/`: 2G-throttled HAR, timings, screenshot, and video.',
      '- `02-constrained-runtime/`: CPU-throttled low-end mobile profile, logs, screenshot, video, and limitation note.',
      '- `03-keyboard-only/`: keyboard-only essential workflow timings, screenshot, and video.',
      '- `04-accessibility/`: automated axe reports, screenshots, and manual screen-reader gap note.',
      '- `05-network/`: request trace proving no media autoload during essential flows.',
      '',
      'Known remaining signoff gaps:',
      '- True 512MB-class proof is not established by browser-only low-end emulation.',
      '- Manual screen-reader walkthrough is still required for full WCAG/screen-reader evidence.',
    ].join('\n')
  );
});