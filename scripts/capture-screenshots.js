#!/usr/bin/env node

/**
 * Screenshot Capture Script
 * Captures live screenshots of the running application for PWA manifest
 */

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const SCREENSHOTS_DIR = join(ROOT_DIR, 'public', 'screenshots');

const SCREENSHOTS = [
  {
    name: 'dashboard-540x720.png',
    url: 'http://localhost:3000/app',
    width: 540,
    height: 720,
    description: 'Narrow (mobile) screenshot of dashboard'
  },
  {
    name: 'analytics-1280x720.png',
    url: 'http://localhost:3000/app',
    width: 1280,
    height: 720,
    description: 'Wide (desktop) screenshot of analytics'
  }
];

async function ensureVaultUnlocked(page, passphrase) {
  const appRoot = page
    .locator('[role="application"][aria-label="Pain Tracker Pro Application"], .pt-app-shell[role="application"]')
    .first();
  const vaultTitle = page.locator('h1:has-text("Secure vault"), #vault-dialog-title').first();
  const preparingVault = page.getByText(/Preparing secure vault/i).first();

  const appeared = await Promise.race([
    appRoot.waitFor({ state: 'visible', timeout: 60_000 }).then(() => 'app'),
    vaultTitle.waitFor({ state: 'visible', timeout: 60_000 }).then(() => 'vault'),
    preparingVault.waitFor({ state: 'visible', timeout: 60_000 }).then(() => 'preparing'),
  ]).catch(() => null);

  if (appeared === 'app') return;
  if (!appeared) throw new Error(`Neither app shell nor vault UI appeared in time. URL: ${page.url()}`);

  if (appeared === 'preparing') {
    await vaultTitle.waitFor({ state: 'visible', timeout: 45_000 });
  }

  const setupSelector = 'form[aria-labelledby="vault-setup-title"]';
  const unlockSelector = 'form[aria-labelledby="vault-unlock-title"]';
  const isSetup = (await page.locator(setupSelector).count()) > 0;
  const isUnlock = (await page.locator(unlockSelector).count()) > 0;

  if (!isSetup && !isUnlock) return;

  if (isSetup) {
    await page.fill('#vault-passphrase', passphrase);
    await page.fill('#vault-passphrase-confirm', passphrase);
    await page.click(`${setupSelector} button[type="submit"]`);
  } else {
    await page.fill('#vault-passphrase-unlock', passphrase);
    await page.click(`${unlockSelector} button[type="submit"]`);
  }

  await Promise.race([
    page.locator('[role="dialog"][aria-modal="true"]').first().waitFor({ state: 'hidden', timeout: 90_000 }),
    appRoot.waitFor({ state: 'visible', timeout: 90_000 }),
  ]).catch(() => {});
}

async function ensureDarkMode(page) {
  await page.evaluate(() => {
    try {
      localStorage.setItem('pain-tracker:theme-mode', 'dark');
    } catch {
      // ignore
    }
  });
}

async function ensureChronicPainTestDataLoaded(page, minEntries = 10) {
  // The loader is installed by ProtectedAppShell in DEV.
  const appShellVisible = await page
    .locator('[role="application"][aria-label="Pain Tracker Pro Application"], .pt-app-shell[role="application"]')
    .first()
    .waitFor({ state: 'visible', timeout: 60_000 })
    .then(() => true)
    .catch(() => false);

  if (!appShellVisible) return;

  const hasLoader = await page
    .waitForFunction(() => typeof window.loadChronicPainTestData === 'function', null, {
      timeout: 30_000,
    })
    .then(() => true)
    .catch(() => false);

  if (!hasLoader) return;

  await page.evaluate(() => {
    try {
      window.loadChronicPainTestData();
    } catch {
      // ignore
    }
  });

  await page
    .waitForFunction(
      (min) => {
        const text = document.body?.innerText || '';
        const match = text.match(/(\d+)\s+entries\b/i);
        if (!match) return false;
        const n = Number(match[1]);
        const minNum = typeof min === 'number' ? min : Number(min);
        return Number.isFinite(n) && Number.isFinite(minNum) && n >= minNum;
      },
      minEntries,
      { timeout: 60_000 }
    )
    .catch(() => {});
}

async function dismissOnboardingIfPresent(page) {
  const onboardingDialog = page.locator('[role="dialog"][aria-labelledby="onboarding-title"]').first();
  const visible = await onboardingDialog.isVisible({ timeout: 5_000 }).catch(() => false);
  if (!visible) return;

  const skipButton = onboardingDialog.getByRole('button', { name: /skip/i }).first();
  for (let i = 0; i < 3; i++) {
    const clicked = await skipButton.click({ timeout: 5_000 }).then(() => true).catch(() => false);
    if (clicked) break;
    await page.waitForTimeout(250);
  }
  await onboardingDialog.waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => {});
}

// Wait for server to be ready
async function waitForServer(url, maxAttempts = 30) {
  console.log('⏳ Waiting for dev server to be ready...');
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('✅ Server is ready!');
        return true;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Server did not start after ${maxAttempts} attempts`);
}

async function captureScreenshots() {
  console.log('🎬 Starting screenshot capture...\n');
  
  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  // Start dev server
  console.log('🚀 Starting dev server...');
  const devServer = spawn('npm', ['run', 'dev'], {
    cwd: ROOT_DIR,
    stdio: 'pipe',
    shell: true
  });

  try {
    // Wait for server to start
    await waitForServer('http://localhost:3000/');

    // Launch browser
    console.log('🌐 Launching browser...\n');
    const browser = await chromium.launch({
      headless: true,
      args: ['--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext({
      deviceScaleFactor: 2, // Retina display
      locale: 'en-US'
    });

    await context.addInitScript(() => {
      try {
        localStorage.setItem('pain-tracker:theme-mode', 'dark');
        localStorage.setItem('pain-tracker-onboarding-completed', 'true');
        localStorage.setItem('pt:pain-tracker-onboarding-completed', 'true');
        localStorage.setItem('pain-tracker:notification-consent', 'dismissed');
        localStorage.setItem('pain-tracker:analytics-consent', 'declined');
      } catch {
        // ignore
      }
    });

    // Capture each screenshot
    for (const screenshot of SCREENSHOTS) {
      console.log(`📸 Capturing: ${screenshot.description}`);
      console.log(`   URL: ${screenshot.url}`);
      console.log(`   Size: ${screenshot.width}x${screenshot.height}`);

      const page = await context.newPage();
      await page.setViewportSize({ 
        width: screenshot.width, 
        height: screenshot.height 
      });

      try {
        // Navigate to the page
        await page.goto(screenshot.url, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });

        // Ensure the vault doesn't block screenshots
        const passphrase = process.env.SCREENSHOT_VAULT_PASSPHRASE || 'screenshot-test-passphrase-2025';
        await ensureVaultUnlocked(page, passphrase);

        // Ensure the protected app is actually mounted before continuing.
        const mounted = await page
          .locator('[role="application"][aria-label="Pain Tracker Pro Application"], .pt-app-shell[role="application"]')
          .first()
          .waitFor({ state: 'visible', timeout: 60_000 })
          .then(() => true)
          .catch(() => false);
        if (!mounted) {
          throw new Error('Protected app shell not visible; refusing to capture a likely-vault screenshot');
        }

        // Reduce UI noise that can block navigation or clutter screenshots.
        await page.evaluate(() => {
          try {
            localStorage.setItem('pain-tracker-onboarding-completed', 'true');
            localStorage.setItem('pain-tracker:notification-consent', 'dismissed');
            localStorage.setItem('pain-tracker:analytics-consent', 'declined');
          } catch {
            // ignore
          }
        });

        await dismissOnboardingIfPresent(page);
        await ensureDarkMode(page);
        await ensureChronicPainTestDataLoaded(page, 10);

        // Basic in-app navigation for analytics capture
        if (screenshot.name.includes('analytics')) {
          await dismissOnboardingIfPresent(page);
          const navButton = page.locator('[data-nav-target="analytics"]').first();
          if (await navButton.waitFor({ state: 'visible', timeout: 30_000 }).then(() => true).catch(() => false)) {
            await navButton.click();
            await page.waitForTimeout(1000);
          }
        }

        // Wait a bit for any animations to complete
        await page.waitForTimeout(2000);

        // Take screenshot
        const screenshotPath = join(SCREENSHOTS_DIR, screenshot.name);
        await page.screenshot({ 
          path: screenshotPath,
          type: 'png'
        });

        console.log(`   ✅ Saved: ${screenshotPath}\n`);
      } catch (error) {
        console.error(`   ❌ Failed to capture ${screenshot.name}:`, error.message);
      } finally {
        await page.close();
      }
    }

    await browser.close();
    console.log('✅ All screenshots captured successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    // Stop dev server
    console.log('🛑 Stopping dev server...');
    devServer.kill('SIGTERM');
    
    // Give it a moment to clean up
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run the script
captureScreenshots().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
