#!/usr/bin/env node

/**
 * Screenshot Portfolio Capture Script
 * Captures comprehensive screenshots for marketing, documentation, and social media
 */

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { 
  SCREENSHOT_PORTFOLIO, 
  getScreenshotsByPhase,
  getInfographicScreenshots
} from './screenshot-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const SCREENSHOTS_BASE_DIR = join(ROOT_DIR, 'public', 'screenshots');

// Command line arguments
const args = process.argv.slice(2);
const phase = args.find(arg => arg.startsWith('--phase='))?.split('=')[1] || 'all';
const categoryFilter = args.find(arg => arg.startsWith('--category='))?.split('=')[1];
const dryRun = args.includes('--dry-run');
const debug = args.includes('--debug');

if (debug) {
  process.on('unhandledRejection', (reason) => {
    console.error('[debug] unhandledRejection:', reason);
  });
  process.on('uncaughtException', (err) => {
    console.error('[debug] uncaughtException:', err);
  });
  process.on('beforeExit', (code) => {
    console.log(`[debug] beforeExit code=${code} exitCode=${process.exitCode ?? 'unset'}`);
  });
  process.on('exit', (code) => {
    console.log(`[debug] exit code=${code} exitCode=${process.exitCode ?? 'unset'}`);
  });
}

console.log('📸 Screenshot Portfolio Capture');
console.log('================================\n');
console.log(`Phase: ${phase}`);
if (categoryFilter) console.log(`Category: ${categoryFilter}`);
if (dryRun) console.log('DRY RUN - No screenshots will be saved\n');

// Wait for server to be ready
async function waitForServer(url, maxAttempts = 30) {
  console.log('⏳ Waiting for dev server to be ready...');
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('✅ Server is ready!\n');
        return true;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Server did not start after ${maxAttempts} attempts`);
}

function normalizeBaseUrl(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

async function waitForAppContent(page) {
  const main = page.locator('#main-content, main#main-content, [role="application"]').first();
  await main.waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(400);
}

async function waitForProtectedAppShell(page, timeout = 60_000) {
  const appShell = page
    .locator('[role="application"][aria-label="Pain Tracker Pro Application"], .pt-app-shell[role="application"]')
    .first();
  return appShell
    .waitFor({ state: 'visible', timeout })
    .then(() => true)
    .catch(() => false);
}

async function ensureProtectedAppMounted(page, baseUrl, passphrase, { debug, debugDir } = {}) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    const mounted = await waitForProtectedAppShell(page, 60_000);
    if (mounted) return;

    if (debug && debugDir) {
      await page
        .screenshot({ path: join(debugDir, `protected-app-not-mounted-attempt-${attempt}.png`) })
        .catch(() => {});
    }

    // Important: do not force a full reload after unlock; some vault implementations
    // intentionally keep unlock state in-memory only.
    await page.goto(`${baseUrl}/app`, { waitUntil: 'networkidle' }).catch(() => {});
    await waitForAppContent(page);
    await ensureVaultUnlocked(page, passphrase);
  }

  throw new Error('Protected app shell did not mount in time after vault unlock/retries');
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

async function dismissOnboardingIfPresent(page) {
  const onboardingDialog = page.locator('[role="dialog"][aria-labelledby="onboarding-title"]').first();

  // Give onboarding a moment to appear (it can mount after initial paint).
  const visible = await onboardingDialog.isVisible({ timeout: 5_000 }).catch(() => false);
  if (!visible) return;

  // Click the Skip button *inside* the dialog so we don't hit an off-screen element.
  const skipButton = onboardingDialog
    .getByRole('button', { name: /skip/i })
    .first();

  // Retry a couple times; Playwright can race with animations.
  for (let i = 0; i < 3; i++) {
    const clicked = await skipButton
      .click({ timeout: 5_000 })
      .then(() => true)
      .catch(() => false);
    if (clicked) break;
    await page.waitForTimeout(250);
  }

  await onboardingDialog.waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => {});
}

async function ensureChronicPainTestDataLoaded(page, minEntries = 10) {
  // Ensure the protected app is actually mounted (the loader is installed by ProtectedAppShell).
  const isMounted = await waitForProtectedAppShell(page, 45_000);
  if (!isMounted) {
    console.log('   ⚠️  Protected app not mounted; cannot load seeded test data');
    return;
  }

  // Wait for the dev helper to be installed by ProtectedAppShell.
  const hasLoader = await page
    .waitForFunction(() => typeof window.loadChronicPainTestData === 'function', null, {
      timeout: 30_000,
    })
    .then(() => true)
    .catch(() => false);

  if (!hasLoader) {
    console.log('   ⚠️  Test data loader not available; continuing without seeded data');
    return;
  }

  await page.evaluate(() => {
    try {
      window.loadChronicPainTestData();
    } catch {
      // ignore
    }
  });

  // Wait for the UI to reflect a non-trivial entry count.
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
    .catch(() => {
      console.log('   ⚠️  Timed out waiting for entries count; continuing');
    });
}

async function ensureVaultUnlocked(page, passphrase) {
  // Be very specific here: the vault screen can also have #main-content.
  // The protected app shell renders a stable role+label.
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

  if (!isSetup && !isUnlock) {
    // Vault dialog may not be present even if title flickers.
    return;
  }

  if (isSetup) {
    await page.fill('#vault-passphrase', passphrase);
    await page.fill('#vault-passphrase-confirm', passphrase);
    await page.click(`${setupSelector} button[type="submit"]`);
  } else {
    await page.fill('#vault-passphrase-unlock', passphrase);
    await page.click(`${unlockSelector} button[type="submit"]`);
  }

  // Vault init/unlock can be slow on some machines.
  await Promise.race([
    page.locator('[role="dialog"][aria-modal="true"]').first().waitFor({ state: 'hidden', timeout: 90_000 }),
    appRoot.waitFor({ state: 'visible', timeout: 90_000 }),
  ]).catch(() => {});

  const stillLocked = await vaultTitle.isVisible({ timeout: 1000 }).catch(() => false);
  if (stillLocked) {
    const alertText = await page.getByRole('alert').first().textContent().catch(() => null);
    throw new Error(
      `Vault setup/unlock did not complete in time${alertText ? ` (alert: ${alertText.trim()})` : ''}`
    );
  }
}

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

// Filter screenshots based on command line arguments
function filterScreenshots() {
  let screenshots = [...SCREENSHOT_PORTFOLIO];

  // Filter by phase
  if (phase !== 'all') {
    screenshots = getScreenshotsByPhase(phase);
  }

  // Filter by category
  if (categoryFilter) {
    screenshots = screenshots.filter(s => s.category === categoryFilter);
  }

  return screenshots;
}

// Capture a single screenshot
async function captureScreenshot(page, screenshot, outputDir) {
  const categoryDir = join(outputDir, screenshot.category);
  ensureDir(categoryDir);

  const screenshotPath = join(categoryDir, screenshot.name);
  
  console.log(`\n📸 Capturing: ${screenshot.description}`);
  console.log(`   ID: ${screenshot.id}`);
  console.log(`   Category: ${screenshot.category}`);
  console.log(`   Size: ${screenshot.width}x${screenshot.height}`);
  
  if (screenshot.url) {
    console.log(`   URL: ${screenshot.url}`);
  }
  
  if (screenshot.useCase) {
    console.log(`   Use Case: ${screenshot.useCase}`);
  }

  try {
    // Set viewport size
    await page.setViewportSize({ 
      width: screenshot.width, 
      height: screenshot.height 
    });

    // Handle special screenshot types
    if (screenshot.isInfographic) {
      console.log('   ℹ️  Infographic - requires manual creation');
      console.log(`   Caption: ${screenshot.caption}`);
      return { success: true, skipped: true, reason: 'infographic' };
    }

    if (screenshot.multiDevice) {
      console.log('   📱 Multi-device - requires composite creation');
      return { success: true, skipped: true, reason: 'multi-device' };
    }

    // Navigate to URL if specified
    if (screenshot.url) {
      const baseUrl = normalizeBaseUrl(process.env.SCREENSHOT_BASE_URL || 'http://localhost:3000');
      const fullUrl = screenshot.url.startsWith('http') 
        ? screenshot.url 
        : `${baseUrl}${screenshot.url}`;
      
      await page.goto(fullUrl, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      await waitForAppContent(page);
    }

    // For protected-app shots: unlock and ensure the real app is mounted.
    if (screenshot.url && screenshot.url.startsWith('/app')) {
      const baseUrl = normalizeBaseUrl(process.env.SCREENSHOT_BASE_URL || 'http://localhost:3000');
      const testPassphrase = process.env.SCREENSHOT_VAULT_PASSPHRASE || 'screenshot-test-passphrase-2025';

      await ensureVaultUnlocked(page, testPassphrase);

      const mounted = await waitForProtectedAppShell(page, 60_000);
      if (!mounted) {
        if (debug) {
          const debugDir = join(outputDir, 'debug');
          ensureDir(debugDir);
          await page
            .screenshot({ path: join(debugDir, `protected-app-missing-${screenshot.id}.png`) })
            .catch(() => {});
        }
        throw new Error('Protected app shell not visible after vault unlock');
      }

      // Ensure overlays don't block interactions or pollute screenshots.
      await dismissOnboardingIfPresent(page);

      // Ensure stable seeded dataset before capturing /app views.
      await ensureChronicPainTestDataLoaded(page, 10);
    }

    // Handle offline mode screenshots
    if (screenshot.requiresOfflineMode) {
      await page.context().setOffline(true);
      console.log('   🔌 Offline mode enabled');
      await page.waitForTimeout(1000);
    }

    // Ensure overlays don't pollute screenshots or block interactions.
    await dismissOnboardingIfPresent(page);

    // Optional navigation inside the protected app
    if (screenshot.navTarget) {
      await dismissOnboardingIfPresent(page);
      const navButton = page.locator(`[data-nav-target="${screenshot.navTarget}"]`).first();
      const isVisible = await navButton
        .waitFor({ state: 'visible', timeout: 30_000 })
        .then(() => true)
        .catch(() => false);
      if (!isVisible) {
        console.log(`   ⚠️  navTarget '${screenshot.navTarget}' not found/visible; capturing current view`);
        if (debug) {
          const existingTargets = await page.evaluate(() =>
            Array.from(document.querySelectorAll('[data-nav-target]')).map((el) =>
              el.getAttribute('data-nav-target')
            )
          ).catch(() => null);
          console.log(`   [debug] data-nav-targets: ${existingTargets ? JSON.stringify(existingTargets) : 'unavailable'}`);
        }
      } else {
        await navButton.scrollIntoViewIfNeeded().catch(() => {});
        await navButton.click();
        await page.waitForTimeout(1000);
      }
    }

    if (!dryRun) {
      // Take screenshot
      await page.screenshot({ 
        path: screenshotPath,
        type: 'png'
      });
      console.log(`   ✅ Saved: ${screenshotPath}`);
    } else {
      console.log(`   🔍 Would save to: ${screenshotPath}`);
    }

    // Reset offline mode
    if (screenshot.requiresOfflineMode) {
      await page.context().setOffline(false);
    }

    return { success: true, skipped: false };
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Generate metadata file
function generateMetadata(screenshots, results) {
  const metadata = {
    generated: new Date().toISOString(),
    phase: phase,
    category: categoryFilter || 'all',
    screenshots: screenshots.map((screenshot, index) => ({
      ...screenshot,
      result: results[index]
    }))
  };

  const metadataPath = join(SCREENSHOTS_BASE_DIR, 'portfolio-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`\n📋 Metadata saved to: ${metadataPath}`);
}

// Generate README for screenshot portfolio
function generateReadme() {
  const readmeContent = `# Screenshot Portfolio

This directory contains a comprehensive screenshot portfolio for the Pain Tracker application.

## 📁 Directory Structure

- **marketing/** - Marketing and promotional screenshots
- **technical/** - Technical architecture and privacy screenshots  
- **social/** - Social media optimized screenshots
- **documentation/** - Documentation and tutorial screenshots
- **wcb-forms/** - WorkSafe BC form preview screenshots

## 📸 Screenshot Inventory

### Phase 1 (Essential - Week 1)
${getScreenshotsByPhase('phase1').map(s => `- **${s.name}** - ${s.description}\n  - Use Case: ${s.useCase}\n  - Caption: "${s.caption}"`).join('\n\n')}

### Phase 2 (Growth - Weeks 2-3)
${getScreenshotsByPhase('phase2').map(s => `- **${s.name}** - ${s.description}\n  - Use Case: ${s.useCase}\n  - Caption: "${s.caption}"`).join('\n\n')}

### Phase 3 (Advanced - Month 1)
${getScreenshotsByPhase('phase3').map(s => `- **${s.name}** - ${s.description}\n  - Use Case: ${s.useCase}\n  - Caption: "${s.caption}"`).join('\n\n')}

## 🎨 Manual Creation Required

The following screenshots require manual creation as infographics or composites:

${getInfographicScreenshots().map(s => `- **${s.name}** - ${s.description}`).join('\n')}

## 📐 Standard Sizes

- **Social Media Share**: 1200x630px (Open Graph / Twitter Card)
- **Instagram Post**: 1080x1080px (Square)
- **Instagram Story**: 1080x1920px (Vertical)
- **PWA Narrow**: 540x720px (Mobile)
- **PWA Wide**: 1280x720px (Desktop)

## 🔄 Regenerating Screenshots

To regenerate all screenshots:
\`\`\`bash
npm run screenshots:portfolio
\`\`\`

To regenerate specific phases:
\`\`\`bash
npm run screenshots:portfolio -- --phase=phase1
npm run screenshots:portfolio -- --phase=phase2
npm run screenshots:portfolio -- --phase=phase3
\`\`\`

To regenerate specific categories:
\`\`\`bash
npm run screenshots:portfolio -- --category=marketing
npm run screenshots:portfolio -- --category=technical
npm run screenshots:portfolio -- --category=social
\`\`\`

## 📊 Usage Guidelines

- All screenshots are optimized for 2x device pixel ratio (Retina displays)
- PNG format for transparency and quality
- Captions provided for each screenshot for consistent messaging
- Organized by use case for easy discovery

## 🤝 Contributing

When adding new screenshots:
1. Add configuration to \`scripts/screenshot-config.js\`
2. Assign appropriate phase and category
3. Include caption and use case
4. Run the capture script
5. Update this README

---

*Last updated: ${new Date().toLocaleDateString()}*
`;

  const readmePath = join(SCREENSHOTS_BASE_DIR, 'PORTFOLIO.md');
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`📖 Portfolio documentation saved to: ${readmePath}`);
}

// Main function
async function captureScreenshotPortfolio() {
  // Filter screenshots
  const screenshots = filterScreenshots();
  
  if (screenshots.length === 0) {
    console.log('❌ No screenshots match the filters');
    return;
  }

  console.log(`📋 Will capture ${screenshots.length} screenshots\n`);

  // Ensure base directory exists
  ensureDir(SCREENSHOTS_BASE_DIR);

  // Start dev server
  console.log('🚀 Starting dev server...');
  const devServer = spawn('npm', ['run', '-s', 'dev', '--', '--port', '3000'], {
    cwd: ROOT_DIR,
    stdio: 'pipe',
    shell: true
  });

  const devServerExit = new Promise((resolve) => {
    devServer.once('exit', (code, signal) => resolve({ code, signal }));
    devServer.once('close', (code, signal) => resolve({ code, signal }));
  });

  devServer.once('error', (err) => {
    if (debug) console.warn('[debug] dev server process error:', err);
  });

  // Try to detect the actual Vite URL (in case port 3000 is taken and it falls back).
  let detectedBaseUrl = null;
  const localUrlRegex = /(https?:\/\/localhost:\d+)(?:\/)?/;
  devServer.stdout.on('data', (data) => {
    const output = data.toString();
    const match = output.match(localUrlRegex);
    if (match && !detectedBaseUrl) {
      detectedBaseUrl = match[1];
      if (debug) console.log(`   🔎 Detected dev server URL: ${detectedBaseUrl}`);
    }
  });

  devServer.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Local:') && !dryRun) {
      console.log('   Server output:', output.trim());
    }
  });

  try {
    const baseUrl = normalizeBaseUrl(detectedBaseUrl || 'http://localhost:3000');
    process.env.SCREENSHOT_BASE_URL = baseUrl;

    // Wait for server to start
    await waitForServer(`${baseUrl}/`);

    // Launch browser
    console.log('🌐 Launching browser...');
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext({
      deviceScaleFactor: 2, // default; per-shot overrides via page.screenshot still use this context
      locale: 'en-US'
    });

    // Apply stable screenshot preferences before any app code runs.
    await context.addInitScript(() => {
      try {
        localStorage.setItem('pain-tracker:theme-mode', 'dark');
        // Set both legacy and secureStorage (pt: namespace) flags so onboarding never mounts.
        localStorage.setItem('pain-tracker-onboarding-completed', 'true');
        localStorage.setItem('pt:pain-tracker-onboarding-completed', 'true');
        localStorage.setItem('pain-tracker:notification-consent', 'dismissed');
        localStorage.setItem('pain-tracker:analytics-consent', 'declined');
      } catch {
        // ignore
      }
    });

    const page = await context.newPage();

    // Optional auth debug: hit /app once so we can capture the vault state.
    if (debug) {
      console.log('🔐 Debugging vault/app entry...');
      const debugDir = join(SCREENSHOTS_BASE_DIR, 'debug');
      ensureDir(debugDir);
      await page.goto(`${baseUrl}/app`, { waitUntil: 'networkidle' }).catch(() => {});
      await waitForAppContent(page);
      await page.screenshot({ path: join(debugDir, 'auth-screen.png') }).catch(() => {});
      console.log('   📸 Debug screenshot saved to debug/auth-screen.png');
    }

    // Capture each screenshot
    const results = [];
    for (const screenshot of screenshots) {
      const result = await captureScreenshot(page, screenshot, SCREENSHOTS_BASE_DIR);
      results.push(result);
    }

    await browser.close();

    // Clean up test vault data from localStorage
    console.log('🧹 Cleaning up test vault data...');
    const cleanupBrowser = await chromium.launch({ headless: true });
    const cleanupContext = await cleanupBrowser.newContext();
    const cleanupPage = await cleanupContext.newPage();
    
    await cleanupPage.goto(`${baseUrl}/app`);
    await cleanupPage.evaluate(() => {
      // Clear all localStorage (vault keys)
      localStorage.clear();
      // Clear all IndexedDB databases
      if (window.indexedDB && window.indexedDB.databases) {
        window.indexedDB.databases().then(dbs => {
          dbs.forEach(db => {
            if (db.name) window.indexedDB.deleteDatabase(db.name);
          });
        });
      }
    });
    
    await cleanupBrowser.close();
    console.log('   ✅ Test data cleared');

    // Generate metadata
    if (!dryRun) {
      generateMetadata(screenshots, results);
      generateReadme();
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Capture Summary');
    console.log('='.repeat(50));
    
    const successful = results.filter(r => r.success && !r.skipped).length;
    const skipped = results.filter(r => r.skipped).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📸 Total: ${results.length}`);
    
    if (skipped > 0) {
      console.log('\nℹ️  Skipped screenshots require manual creation:');
      screenshots.forEach((s, i) => {
        if (results[i].skipped) {
          console.log(`   - ${s.name} (${results[i].reason})`);
        }
      });
    }

    console.log('\n✅ Screenshot portfolio capture complete!\n');

    // Ensure a stable exit code for CI/automation.
    process.exitCode = failed > 0 ? 1 : 0;
    if (debug) console.log(`[debug] set process.exitCode=${process.exitCode}`);

  } catch (error) {
    console.error('❌ Error:', error);
    // Do not rethrow here: we want the script to keep its own exitCode logic
    // and not force a non-zero exit on non-fatal cleanup/shutdown errors.
    process.exitCode = 1;
  } finally {
    // Stop dev server (best-effort). On Windows, killing an already-exited process
    // can throw; don't let that flip an otherwise successful run to exit code 1.
    console.log('🛑 Stopping dev server...');
    if (debug) console.log(`[debug] shutdown start exitCode=${process.exitCode ?? 'unset'}`);
    try {
      if (devServer && !devServer.killed) {
        devServer.kill();
      }
    } catch (err) {
      if (debug) console.warn('[debug] dev server stop failed:', err);
    }

    // Wait for the dev server to actually exit; otherwise this script can hang and
    // the terminal wrapper may force-kill it (showing exit code 1 even when our
    // process.exitCode is 0).
    const stopTimeoutMs = 10_000;
    const stopResult = await Promise.race([
      devServerExit.then((result) => ({ done: true, result })),
      new Promise((resolve) => setTimeout(() => resolve({ done: false }), stopTimeoutMs)),
    ]);

    if (debug) {
      if (stopResult.done) {
        console.log(`[debug] dev server exited code=${stopResult.result.code} signal=${stopResult.result.signal}`);
      } else {
        console.log('[debug] dev server did not exit in time; forcing taskkill');
      }
    }

    if (!stopResult.done) {
      const pid = devServer?.pid;
      if (pid) {
        await new Promise((resolve) => {
          const killer = spawn('taskkill', ['/PID', String(pid), '/T', '/F'], {
            stdio: 'ignore',
            shell: true,
          });
          killer.once('exit', () => resolve());
          killer.once('error', () => resolve());
        });
      }

      // Give it a brief moment after the forced kill.
      await Promise.race([
        devServerExit,
        new Promise((resolve) => setTimeout(resolve, 2_000)),
      ]);
    }

    if (debug) console.log(`[debug] shutdown complete exitCode=${process.exitCode ?? 'unset'}`);
  }
}

// Run the script
captureScreenshotPortfolio()
  .then(() => {
    // Some environments will force-kill long-running Node processes that still have
    // stray handles (e.g. lingering HTTP keep-alives). Explicitly exit with our
    // computed exit code so successful runs consistently return 0.
    process.exit(process.exitCode ?? 0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(process.exitCode ?? 1);
  });
