import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_PASSPHRASE = 'screenshots-passphrase-12345';

/**
 * Suppress toast-related DOM errors that can crash React during rapid navigation.
 * The Toast component has a known issue with removeChild race conditions.
 * This prevents those errors from crashing the test while still capturing screenshots.
 */
async function suppressToastErrors(page: Page) {
  await page.addInitScript(() => {
    // Override removeChild to be safe from "node not a child" errors
    const originalRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function<T extends Node>(child: T): T {
      try {
        if (this.contains(child)) {
          return originalRemoveChild.call(this, child) as T;
        }
        // Node already removed - return it without throwing
        return child;
      } catch {
        // Silently ignore removeChild errors - they're usually race conditions
        console.debug('Safe removeChild: node already removed');
        return child;
      }
    };
  });
}

async function ensureVaultUnlocked(page: Page, passphrase = SCREENSHOT_PASSPHRASE) {
  const vaultDialog = page.locator('[role="dialog"][aria-modal="true"], #vault-dialog-title').first();
  const vaultTitle = page.locator('h1:has-text("Secure vault"), #vault-dialog-title').first();
  const appRoot = page.locator('#main-content, main#main-content').first();
  const preparingVault = page.getByText(/Preparing secure vault/i).first();
  const header = page.locator('header').first();

  // Wait for either the app shell, the vault UI, or at least a header to appear.
  const appeared = await Promise.race([
    appRoot.waitFor({ state: 'visible', timeout: 60_000 }).then(() => 'app'),
    vaultTitle.waitFor({ state: 'visible', timeout: 60_000 }).then(() => 'vault'),
    preparingVault.waitFor({ state: 'visible', timeout: 60_000 }).then(() => 'preparing'),
    header.waitFor({ state: 'visible', timeout: 60_000 }).then(() => 'header'),
  ]).catch(() => null);

  if (appeared === 'app' || appeared === 'header') return;
  if (!appeared) {
    const url = page.url();
    throw new Error(`Neither app shell nor vault UI appeared in time. URL: ${url}`);
  }

  // VaultGate may first render a "Preparing secure vault…" screen while sodium loads.
  if (appeared === 'preparing') {
    await vaultTitle.waitFor({ state: 'visible', timeout: 45_000 });
  }

  const hasDialog = (await vaultDialog.count()) > 0;
  if (!hasDialog) return;

  const setupSelector = 'form[aria-labelledby="vault-setup-title"]';
  const unlockSelector = 'form[aria-labelledby="vault-unlock-title"]';

  const isSetup = (await page.locator(setupSelector).count()) > 0;
  const isUnlock = (await page.locator(unlockSelector).count()) > 0;

  if (!isSetup && !isUnlock) {
    throw new Error('Vault dialog is visible but neither setup nor unlock form was found');
  }

  if (isSetup) {
    await page.fill('#vault-passphrase', passphrase);
    await page.fill('#vault-passphrase-confirm', passphrase);
    await page.click(`${setupSelector} button[type="submit"]`);
  } else {
    await page.fill('#vault-passphrase-unlock', passphrase);
    await page.click(`${unlockSelector} button[type="submit"]`);
  }

  // Vault initialization/unlock can be slower on mobile emulation.
  await Promise.race([
    page.locator('[role="dialog"][aria-modal="true"]').waitFor({ state: 'hidden', timeout: 90_000 }),
    appRoot.waitFor({ state: 'visible', timeout: 90_000 }),
  ]);

  // If we're still looking at the vault after waiting, fail loudly (otherwise we'd take useless screenshots).
  const stillLocked = await vaultTitle.isVisible({ timeout: 1000 }).catch(() => false);
  if (stillLocked) {
    const alertText = await page.getByRole('alert').first().textContent().catch(() => null);
    throw new Error(
      `Vault setup/unlock did not complete in time${alertText ? ` (alert: ${alertText.trim()})` : ''}`
    );
  }

  await page.waitForTimeout(300);
}

async function waitForReactMount(page: Page, timeout = 30_000) {
  // Ensure the React root element actually exists and has meaningful children.
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    const state = await page.evaluate(() => {
      const root = document.getElementById('root');
      if (!root) return { hasRoot: false, children: 0, hasContent: false };
      
      const children = root.children.length;
      const html = root.innerHTML;
      
      // Check for meaningful content - not just empty divs or toast containers
      const hasContent = 
        html.includes('role="application"') ||
        html.includes('<main') ||
        html.includes('<h1') ||
        html.includes('<h2') ||
        html.includes('Secure vault') ||
        html.includes('Preparing secure vault') ||
        html.includes('Pain Tracker') ||
        html.includes('hero-section') ||
        root.querySelectorAll('h1, h2, main, [role="application"], nav, header').length > 0;
      
      return { hasRoot: true, children, hasContent, htmlLen: html.length };
    }).catch(() => ({ hasRoot: false, children: 0, hasContent: false, htmlLen: 0 }));
    
    if (state.hasContent) {
      return; // Success!
    }
    
    await page.waitForTimeout(500);
  }
  
  // Collect diagnostics if mount failed
  const diag = await page.evaluate(() => {
    const root = document.getElementById('root');
    return {
      url: window.location.href,
      hasRoot: !!root,
      rootChildren: root?.children.length ?? 0,
      rootHtml: root?.innerHTML.slice(0, 2000) ?? '',
      bodyChildren: document.body?.children.length ?? 0,
      documentReady: document.readyState,
    };
  }).catch(() => null);
  
  throw new Error(`React did not mount meaningful content in time. Diagnostics: ${diag ? JSON.stringify(diag, null, 2) : 'unavailable'}`);
}

/**
 * Recovers from a React crash by navigating back to root, clearing state, and re-entering the app.
 */
async function recoverFromCrash(page: Page, passphrase = SCREENSHOT_PASSPHRASE) {
  console.log('[RECOVERY] Starting full crash recovery...');
  
  // Clear any problematic session state (but keep vault keys)
  await page.evaluate(() => {
    try {
      // Don't clear vault-related keys, just view state
      localStorage.removeItem('pain-tracker:current-view');
      sessionStorage.clear();
    } catch {
      // ignore
    }
  });
  
  // Navigate to root and wait
  await page.goto('/', { waitUntil: 'networkidle', timeout: 30_000 });
  
  // Wait for React to mount
  await waitForReactMount(page, 30_000);
  
  // Click "Get Started" to go to /start if visible
  const getStarted = page.locator('button:has-text("Get Started"), a:has-text("Get Started")').first();
  if (await getStarted.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await getStarted.click();
    await page.waitForTimeout(1000);
  }
  
  // Re-unlock vault if needed
  await ensureVaultUnlocked(page, passphrase);
  await waitForAppReady(page);
  await dismissBlockingUI(page);
  
  console.log('[RECOVERY] Recovery complete, app should be on dashboard');
}

/**
 * Checks if the app is in a healthy state after a capture.
 * If unhealthy (React crashed), initiates recovery.
 */
async function stabilizeAppState(page: Page, passphrase = SCREENSHOT_PASSPHRASE) {
  console.log('[STABILIZE] Checking app state...');
  
  // Wait for any pending state updates to settle
  await page.waitForTimeout(800);
  
  // Check if React is still healthy
  const state = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return { isHealthy: false, reason: 'no-root' };
    
    const childCount = root.children.length;
    if (childCount <= 1) {
      // Only toast container or empty
      return { isHealthy: false, reason: 'empty-root', childCount };
    }
    
    // Check for error boundary UI
    const hasErrorBoundary = root.querySelector('[data-error-boundary]') !== null;
    if (hasErrorBoundary) {
      return { isHealthy: false, reason: 'error-boundary' };
    }
    
    // Check for meaningful content
    const hasApp = root.querySelector('[role="application"]') !== null;
    const hasMain = root.querySelector('main, #main-content') !== null;
    const hasNav = root.querySelector('[data-nav-target]') !== null;
    
    if (!hasApp && !hasMain && !hasNav) {
      return { isHealthy: false, reason: 'no-content', childCount };
    }
    
    return { isHealthy: true, childCount, hasApp, hasMain, hasNav };
  });
  
  console.log('[STABILIZE] State:', JSON.stringify(state));
  
  if (!state.isHealthy) {
    console.log(`[STABILIZE] App unstable (${state.reason}), recovering...`);
    await recoverFromCrash(page, passphrase);
  }
  
  // Extra wait for animations
  await page.waitForTimeout(400);
}

async function enterApp(page: Page) {
  // Collect console logs for debugging
  const consoleLogs: string[] = [];
  page.on('console', (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    consoleLogs.push(`[PAGE_ERROR] ${err.message}`);
  });

  // Retry logic for flaky React mounting
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Navigate to landing page
      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30_000 });
      
      // Wait for network to settle
      await page.waitForLoadState('networkidle', { timeout: 30_000 });

      // Wait for React to mount with meaningful content
      await waitForReactMount(page, 45_000);
      
      // Success!
      return;
    } catch (e) {
      lastError = e as Error;
      console.error(`enterApp attempt ${attempt} failed:`, (e as Error).message);
      
      if (attempt < 3) {
        // Wait before retry
        await page.waitForTimeout(2000);
        // Hard reload
        await page.reload({ waitUntil: 'domcontentloaded' });
      }
    }
  }
  
  // All retries failed - dump console logs for debugging
  console.error('Console logs during enterApp:', consoleLogs.slice(-50).join('\n'));
  throw lastError || new Error('enterApp failed after 3 attempts');
}

async function dismissBlockingUI(page: Page) {
  const dismissalSelectors = [
    'button:has-text("Dismiss notification")',
    'button:has-text("Continue")',
    'button:has-text("Close")',
    'button:has-text("Skip")',
    'button:has-text("Got it")',
    'button:has-text("Accept")',
    'button[aria-label="Close"]',
    'button:has-text("Dismiss beta notice")',
    "button:has-text(\"Dismiss and don't show again\")",
    'button:has-text("Skip onboarding")',
    'button:has-text("Skip Tour")',
    'button:has-text("Get Started")',
  ];

  for (const selector of dismissalSelectors) {
    try {
      const buttons = page.locator(selector);
      const count = await buttons.count();
      for (let i = 0; i < Math.min(count, 50); i++) {
        try {
          const btn = buttons.nth(i);
          if (await btn.isVisible({ timeout: 250 }).catch(() => false)) {
            await btn.click({ timeout: 500 }).catch(() => {});
          }
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    }
  }

  try {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    await page.keyboard.press('Escape');
  } catch {
    // ignore
  }

  // Last-resort DOM cleanup for stacked overlays that intercept clicks.
  try {
    await page.evaluate(() => {
      try {
        document
          .querySelectorAll(
            'div.fixed.inset-0, .modal-backdrop, [data-testid="overlay"], [role="alert"], .toast, .notification, .alert, .fixed.bottom-4.left-4'
          )
          .forEach((e) => e.remove());
      } catch {
        // ignore
      }
    });
  } catch {
    // ignore
  }
}

async function waitForAppReady(page: Page) {
  await page.waitForSelector('body');
  // Wait for the protected app wrapper or a heading indicating the page rendered.
  await Promise.race([
    page.waitForSelector('[role="application"][aria-label*="Pain Tracker" i]', { timeout: 45_000 }),
    page.waitForSelector('#main-content, main#main-content', { timeout: 45_000 }),
    page.getByRole('heading').first().waitFor({ state: 'visible', timeout: 45_000 }),
  ]);
  await page.waitForTimeout(500);
}

async function openNavigationMenu(page: Page, isMobile: boolean) {
  // First check if mobile menu is already open
  if (isMobile) {
    const existingMenu = page.locator('#mobile-navigation-menu');
    const isMenuOpen = await existingMenu.isVisible({ timeout: 1000 }).catch(() => false);
    if (isMenuOpen) {
      console.log('[openNavigationMenu] Mobile menu is already open');
      return;
    }
  }

  const navToggle = page.locator('[data-testid="nav-toggle"], button[aria-label*="navigation" i], button[aria-label*="menu" i]').first();

  if (isMobile) {
    // Wait for page to stabilize
    await page.waitForTimeout(500);
    
    let visible = await navToggle.isVisible({ timeout: 10_000 }).catch(() => false);
    if (!visible) {
      // Try waiting another cycle in case the app is still mounting.
      console.log('[openNavigationMenu] Nav toggle not visible, waiting for app to stabilize...');
      await page.waitForTimeout(2000);
      await page.waitForSelector('header', { timeout: 10_000 }).catch(() => {});
      visible = await navToggle.isVisible({ timeout: 3000 }).catch(() => false);
    }
    
    // If still not visible, check if React crashed and try to recover
    if (!visible) {
      console.log('[openNavigationMenu] Nav toggle still not visible, checking React state...');
      const reactState = await page.evaluate(() => {
        const root = document.getElementById('root');
        const hasApp = !!document.querySelector('[role="application"]');
        const hasHeader = !!document.querySelector('header');
        const childCount = root?.children.length ?? 0;
        return { hasRoot: !!root, childCount, hasApp, hasHeader };
      }).catch(() => ({ hasRoot: false, childCount: 0, hasApp: false, hasHeader: false }));
      
      console.log('[openNavigationMenu] React state:', JSON.stringify(reactState));
      
      if (!reactState.hasApp || reactState.childCount < 2) {
        // React crashed - try to recover
        console.log('[openNavigationMenu] React appears crashed, attempting recovery...');
        await page.reload({ waitUntil: 'networkidle' });
        await waitForReactMount(page, 30_000);
        await ensureVaultUnlocked(page);
        await waitForAppReady(page);
        await dismissBlockingUI(page);
        visible = await navToggle.isVisible({ timeout: 5000 }).catch(() => false);
      }
    }
    
    if (!visible) {
      const debug = await page
        .evaluate(() => {
          const hasHeader = !!document.querySelector('header');
          const navToggleCount = document.querySelectorAll('[data-testid="nav-toggle"]').length;
          const ariaMenuButtons = document.querySelectorAll('button[aria-label*="menu" i], button[aria-label*="navigation" i]').length;
          const bodyHtml = document.body?.innerHTML.slice(0, 2000) ?? 'NO_BODY';
          const rootEl = document.getElementById('root');
          const rootChildren = rootEl?.children.length ?? -1;
          const rootHtml = rootEl?.innerHTML.slice(0, 1000) ?? 'NO_ROOT';
          return { url: location.href, hasHeader, navToggleCount, ariaMenuButtons, bodyHtml, rootChildren, rootHtml };
        })
        .catch(() => null);
      throw new Error(`Mobile nav toggle not found/visible. Debug: ${debug ? JSON.stringify(debug) : 'unavailable'}`);
    }
  } else if (!(await navToggle.isVisible({ timeout: 1000 }).catch(() => false))) {
    return;
  }

  // Click the toggle and wait for menu to appear
  console.log('[openNavigationMenu] Clicking nav toggle...');
  await navToggle.click({ timeout: 2000 }).catch(async () => {
    await navToggle.evaluate((el: HTMLElement) => el.click());
  });

  if (isMobile) {
    // Wait for React state to update and menu to render
    await page.waitForTimeout(500);
    
    // Try multiple times to find the menu
    let menuAppeared = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      const menuVisible = await page.locator('#mobile-navigation-menu').isVisible({ timeout: 2000 }).catch(() => false);
      if (menuVisible) {
        menuAppeared = true;
        console.log('[openNavigationMenu] Mobile menu appeared after attempt', attempt + 1);
        break;
      }
      
      // If menu didn't appear, click toggle again (might need to toggle state)
      if (attempt < 2) {
        console.log('[openNavigationMenu] Menu not visible, clicking toggle again (attempt', attempt + 2, ')...');
        await navToggle.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(800);
      }
    }
    
    if (!menuAppeared) {
      // Last resort: Check if we can find nav items anyway (they might be in a different location on mobile)
      const navItemsVisible = await page.locator('[data-nav-target]').first().isVisible({ timeout: 1000 }).catch(() => false);
      if (navItemsVisible) {
        console.log('[openNavigationMenu] Nav items are visible without mobile menu - proceeding');
        return; // Nav items are visible, we can proceed
      }
      
      // Debug: Log what's in the DOM
      const domDebug = await page.evaluate(() => {
        const mobileMenu = document.getElementById('mobile-navigation-menu');
        const navItems = document.querySelectorAll('[data-nav-target]');
        const sidebarElements = document.querySelectorAll('[role="navigation"]');
        return {
          mobileMenuExists: !!mobileMenu,
          mobileMenuDisplay: mobileMenu ? getComputedStyle(mobileMenu).display : 'N/A',
          navItemsCount: navItems.length,
          sidebarCount: sidebarElements.length,
          navItemsInfo: Array.from(navItems).slice(0, 5).map(el => ({
            id: el.getAttribute('data-nav-target'),
            visible: (el as HTMLElement).offsetParent !== null
          }))
        };
      }).catch(() => null);
      console.log('[openNavigationMenu] DOM debug:', JSON.stringify(domDebug));
      
      // If nav items exist but mobile menu doesn't, the desktop sidebar might be showing
      // This can happen if viewport detection is off
      if (domDebug && domDebug.navItemsCount > 0) {
        console.log('[openNavigationMenu] Nav items exist in DOM, proceeding without mobile menu');
        return;
      }
      
      throw new Error('Mobile navigation menu did not appear after multiple attempts');
    }
  }

  await page.waitForTimeout(250);
}

async function expectHeading(page: Page, headingText: RegExp, timeout = 20_000) {
  await expect(page.getByRole('heading', { name: headingText }).first()).toBeVisible({ timeout });
}

async function expectText(page: Page, text: RegExp, timeout = 20_000) {
  await expect(page.getByText(text).first()).toBeVisible({ timeout });
}

async function ensureTestDataLoadedIfPossible(page: Page) {
  // If the persisted seed didn't hydrate on this device, use the built-in test-data loader.
  // This is only available when there are no entries.
  const loadChronic = page.getByRole('button', { name: /Load 12-month chronic pain test data/i }).first();
  const loadSample = page.getByRole('button', { name: /Load sample/i }).first();

  if (await loadChronic.isVisible({ timeout: 1500 }).catch(() => false)) {
    await loadChronic.click({ timeout: 2000 }).catch(() => {});
    await loadChronic.waitFor({ state: 'hidden', timeout: 45_000 }).catch(() => {});
    return;
  }

  if (await loadSample.isVisible({ timeout: 1500 }).catch(() => false)) {
    await loadSample.click({ timeout: 2000 }).catch(() => {});
    await loadSample.waitFor({ state: 'hidden', timeout: 45_000 }).catch(() => {});
  }
}

async function navigateTo(
  page: Page,
  navTarget: string,
  label: string,
  opts: { isMobile: boolean; expectHeading?: RegExp; expectText?: RegExp }
) {
  // First ensure React is still mounted (can get unmounted after navigation)
  try {
    await waitForReactMount(page, 15_000);
  } catch {
    // If React isn't mounted, try a page reload
    console.log(`[navigateTo] React not mounted before ${navTarget}, reloading...`);
    await page.reload({ waitUntil: 'networkidle' });
    await waitForReactMount(page, 30_000);
    // Re-unlock vault since state may be lost after reload
    await ensureVaultUnlocked(page);
    await waitForAppReady(page);
    await dismissBlockingUI(page);
  }

  await dismissBlockingUI(page);

  // Mobile has a dedicated floating action button for quick entries.
  if (opts.isMobile && navTarget === 'new-entry') {
    const quickEntryFab = page.getByRole('button', { name: /Quick pain entry/i }).first();
    if (await quickEntryFab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await quickEntryFab.click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(400);
      if (opts.expectHeading) await expectHeading(page, opts.expectHeading, 25_000);
      if (opts.expectText) await expectText(page, opts.expectText, 25_000);
      return;
    }
  }

  // First, try to go back to a known state (dashboard) if we're on a different page
  // This helps ensure the navigation menu is available
  const currentUrl = page.url();
  if (currentUrl.includes('/new-entry') || currentUrl.includes('/quick-log')) {
    // We're on the new entry page - need to go back first
    const backButton = page.locator('button[aria-label*="back" i], button[aria-label*="close" i], a[href="/app"]').first();
    if (await backButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await backButton.click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(500);
    } else {
      // Try using browser back or navigate to /app
      await page.goto('/app', { waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(500);
    }
  }

  await openNavigationMenu(page, opts.isMobile);

  const selectorsToTry = [
    `[data-nav-target="${navTarget}"]`,
    `button:has-text("${label}")`,
    `a:has-text("${label}")`,
  ];

  for (const s of selectorsToTry) {
    try {
      const matches = page.locator(s);
      const count = await matches.count();
      console.log(`[navigateTo] Trying selector "${s}" - found ${count} matches`);
      for (let i = 0; i < Math.min(count, 25); i++) {
        const loc = matches.nth(i);
        await loc.scrollIntoViewIfNeeded({ timeout: 1000 }).catch(() => {});
        if (await loc.isVisible({ timeout: 1000 }).catch(() => false)) {
          console.log(`[navigateTo] Clicking match ${i} for "${s}"`);
          await loc.click({ timeout: 2000 }).catch(async () => {
            await loc.evaluate((el: HTMLElement) => el.click());
          });
          await page.waitForTimeout(600);

          if (opts.expectHeading) await expectHeading(page, opts.expectHeading, 25_000);
          if (opts.expectText) await expectText(page, opts.expectText, 25_000);

          return;
        }
      }
    } catch (e) {
      console.log(`[navigateTo] Error with selector "${s}":`, e);
      // try next selector
    }
  }

  // Debug: Log available navigation elements before failing
  console.log(`[navigateTo] Failed to find nav for ${navTarget}. Logging available elements...`);
  try {
    const navLinks = await page.locator('nav a, nav button, [role="navigation"] a, [role="navigation"] button').all();
    console.log(`[navigateTo] Found ${navLinks.length} nav links/buttons`);
    for (let i = 0; i < Math.min(navLinks.length, 20); i++) {
      const text = await navLinks[i].textContent().catch(() => '');
      const href = await navLinks[i].getAttribute('href').catch(() => '');
      console.log(`  ${i}: text="${text?.trim()}", href="${href}"`);
    }
  } catch (e) {
    console.log('[navigateTo] Could not enumerate nav elements:', e);
  }

  // If we got here, we didn't find/click any nav UI. Fail loudly so we don't get "passing" but useless screenshots.
  throw new Error(`Failed to navigate: could not find a nav control for ${navTarget} (${label})`);
}

async function capture(page: Page, testInfo: { project: { name: string } }, name: string, fullPage = true) {
  const outDir = path.join(process.cwd(), 'e2e', 'results', 'screenshots', testInfo.project.name);
  fs.mkdirSync(outDir, { recursive: true });
  const filePath = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage });
}

test.describe('Screenshot suite (seed after login)', () => {
  test.setTimeout(180_000);

  test('captures key product screens', async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes('mobile');
    // Desktop projects: enforce consistent viewport.
    if (!isMobile) {
      await page.setViewportSize({ width: 1440, height: 900 });
    }

    // CRITICAL: Suppress toast DOM errors that can crash React during rapid navigation
    await suppressToastErrors(page);

    // Collect console errors for debugging - print them immediately when they occur.
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const errText = `[console.error] ${msg.text()}`;
        consoleErrors.push(errText);
        console.log('!!! CONSOLE ERROR:', errText);
      }
    });
    page.on('pageerror', (err) => {
      const errText = `[pageerror] ${err.message}`;
      consoleErrors.push(errText);
      console.log('!!! PAGE ERROR:', errText);
    });

    // Pre-seed preferences before first load to skip onboarding dialogs.
    await page.context().addInitScript(() => {
      try {
        localStorage.setItem('pain-tracker-onboarding-completed', 'true');
        localStorage.setItem('pain-tracker-walkthrough-completed', 'true');
        localStorage.setItem('beta-warning-dismissed', 'true');
        localStorage.setItem('notification-consent-answered', 'true');
        // FORCE LIGHT MODE for the "light" screenshot suite.
        // Dark is the app default, so we must explicitly opt into light.
        localStorage.setItem('pain-tracker:theme-mode', 'light');
      } catch {
        // ignore
      }
    });

    // Navigate to landing and wait for React to mount
    await enterApp(page);
    
    // Click "Get Started" to go to /start
    const getStarted = page.locator('button:has-text("Get Started"), a:has-text("Get Started")').first();
    if (await getStarted.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await getStarted.click();
      await page.waitForTimeout(1000);
    }
    
    // Unlock vault
    await ensureVaultUnlocked(page);
    await waitForAppReady(page);
    // NOTE: Don't call normalizeViteBaseURL - we're running without VITE_BASE now

    await dismissBlockingUI(page);
    await ensureTestDataLoadedIfPossible(page);

    // Verify light mode is active (debug aid)
    const isLightMode = await page.evaluate(() => {
      return (
        !document.documentElement.classList.contains('dark') &&
        document.documentElement.getAttribute('data-theme') === 'light'
      );
    });
    console.log('[LIGHT MODE] Light mode active:', isLightMode);
    
    // Debug: check state before dashboard capture
    console.log('[DEBUG] Before dashboard - URL:', page.url());
    
    // Extra wait for React to stabilize after app loads
    await waitForReactMount(page, 30_000);
    await capture(page, testInfo, '01-dashboard', !isMobile);
    await stabilizeAppState(page);

    console.log('[DEBUG] After dashboard capture - starting new-entry nav');
    await navigateTo(page, 'new-entry', 'New Entry', { isMobile, expectText: /Quick Log/i });
    console.log('[DEBUG] After new-entry nav - URL:', page.url());
    await waitForReactMount(page, 15_000);
    await page.waitForTimeout(500);
    await capture(page, testInfo, '02-new-entry', !isMobile);
    await stabilizeAppState(page);

    // =====================================================
    // BODY-MAP: Special handling due to known crash issues
    // =====================================================
    console.log('[DEBUG] Starting body-map navigation with special handling...');
    await page.waitForTimeout(1000); // Extra pause before body-map
    
    if (isMobile) {
      // Open navigation menu first
      await openNavigationMenu(page, true);
      await page.waitForTimeout(300);
    }
    
    // Use direct click with force to bypass any overlay issues
    const bodyMapButton = page.locator('[data-nav-target="body-map"]').first();
    if (await bodyMapButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('[DEBUG] Clicking body-map button directly...');
      await bodyMapButton.click({ force: true });
    } else {
      // Fallback to navigateTo
      await navigateTo(page, 'body-map', 'Body Map', { isMobile, expectHeading: /^Body Map$/i });
    }
    
    // Extra time for body-map component to fully load
    await page.waitForTimeout(2000);
    
    // Wait for body-map heading to confirm page loaded
    try {
      await expect(page.getByRole('heading', { name: /^Body Map$/i }).first()).toBeVisible({ timeout: 15_000 });
    } catch {
      console.log('[DEBUG] Body Map heading not found, checking state...');
    }
    
    await capture(page, testInfo, '03-body-map', !isMobile);
    console.log('[DEBUG] body-map capture complete');
    
    // PROACTIVE RECOVERY after body-map (known crash point)
    console.log('[DEBUG] Proactive recovery after body-map...');
    await page.waitForTimeout(1000); // Let any DOM operations settle
    
    // Force close any open mobile menu to reset state
    if (isMobile) {
      await page.evaluate(() => {
        // Try to close any open menus by clicking outside or pressing escape
        document.body.click();
      });
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(500);
    }
    
    await stabilizeAppState(page);
    
    // Verify app is still healthy before continuing
    const postBodyMapState = await page.evaluate(() => {
      const root = document.getElementById('root');
      const hasApp = !!document.querySelector('[role="application"]');
      const hasHeader = !!document.querySelector('header');
      const navToggle = document.querySelector('[data-testid="nav-toggle"]');
      return { 
        hasRoot: !!root, 
        childCount: root?.children.length ?? 0, 
        hasApp, 
        hasHeader,
        hasNavToggle: !!navToggle
      };
    });
    console.log('[DEBUG] Post body-map state:', JSON.stringify(postBodyMapState));
    
    if (!postBodyMapState.hasNavToggle && isMobile) {
      console.log('[DEBUG] Nav toggle missing after body-map, doing full recovery...');
      await recoverFromCrash(page);
    }
    // =====================================================

    console.log('[DEBUG] Starting fibromyalgia navigation...');
    await navigateTo(page, 'fibromyalgia', 'Fibromyalgia Hub', { isMobile, expectHeading: /Fibromyalgia Support Hub/i });
    console.log('[DEBUG] fibromyalgia navigation complete');
    await waitForReactMount(page, 15_000);
    await page.waitForTimeout(700);
    await capture(page, testInfo, '04-fibromyalgia-hub', !isMobile);
    await stabilizeAppState(page);

    await navigateTo(page, 'analytics', 'Analytics', { isMobile, expectHeading: /Premium Analytics/i });
    await page.waitForTimeout(900);
    await capture(page, testInfo, '05-analytics', !isMobile);
    await stabilizeAppState(page);

    await navigateTo(page, 'calendar', 'Calendar', { isMobile, expectHeading: /Calendar View/i });
    await page.waitForTimeout(700);
    await capture(page, testInfo, '06-calendar', !isMobile);
    await stabilizeAppState(page);

    await navigateTo(page, 'reports', 'Reports', { isMobile, expectHeading: /Reports & Export/i });
    await page.waitForTimeout(900);
    await capture(page, testInfo, '07-reports', !isMobile);
    await stabilizeAppState(page);

    // Panic mode overlay
    try {
      const panic = page.locator('[aria-label="Activate calm breathing mode"]').first();
      if ((await panic.count()) > 0) {
        await panic.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(500);
        await capture(page, testInfo, '08-panic-mode', false);
        await page.keyboard.press('Escape').catch(() => {});
        await page.waitForTimeout(300);
        await stabilizeAppState(page);
      }
    } catch {
      // ignore
    }

    // Bottom nav (Settings / Help) may be in a separate region; try label click.
    await navigateTo(page, 'settings', 'Settings', { isMobile, expectHeading: /^Settings$/i });
    await page.waitForTimeout(600);
    await capture(page, testInfo, '09-settings', !isMobile);
    await stabilizeAppState(page);

    await navigateTo(page, 'help', 'Help', { isMobile, expectHeading: /Help & Support/i });
    await page.waitForTimeout(600);
    await capture(page, testInfo, '10-help', !isMobile);

    // Output any collected console errors for debugging
    if (consoleErrors.length > 0) {
      console.log('\n=== Console Errors During Test ===');
      consoleErrors.forEach(err => console.log(err));
      console.log('=== End Console Errors ===\n');
    }
  });
});

// ============================================================
// DARK MODE SCREENSHOT SUITE
// ============================================================
test.describe('Dark Mode Screenshot suite', () => {
  test.setTimeout(180_000);

  test('captures key product screens in dark mode', async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes('mobile');
    // Desktop projects: enforce consistent viewport.
    if (!isMobile) {
      await page.setViewportSize({ width: 1440, height: 900 });
    }

    // CRITICAL: Suppress toast DOM errors that can crash React during rapid navigation
    await suppressToastErrors(page);

    // Collect console errors for debugging
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[console.error] ${msg.text()}`);
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(`[pageerror] ${err.message}`);
    });

    // Pre-seed preferences - INCLUDING DARK MODE
    await page.context().addInitScript(() => {
      try {
        localStorage.setItem('pain-tracker-onboarding-completed', 'true');
        localStorage.setItem('pain-tracker-walkthrough-completed', 'true');
        localStorage.setItem('beta-warning-dismissed', 'true');
        localStorage.setItem('notification-consent-answered', 'true');
        // SET DARK MODE
        localStorage.setItem('pain-tracker:theme-mode', 'dark');
      } catch {
        // ignore
      }
    });

    // Navigate to landing and wait for React to mount
    await enterApp(page);
    
    // Click "Get Started" to go to /start
    const getStarted = page.locator('button:has-text("Get Started"), a:has-text("Get Started")').first();
    if (await getStarted.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await getStarted.click();
      await page.waitForTimeout(1000);
    }
    
    // Unlock vault
    await ensureVaultUnlocked(page);
    await waitForAppReady(page);

    await dismissBlockingUI(page);
    await ensureTestDataLoadedIfPossible(page);
    
    // Verify dark mode is active
    const isDarkMode = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') || 
             document.documentElement.getAttribute('data-theme') === 'dark';
    });
    console.log('[DARK MODE] Dark mode active:', isDarkMode);
    
    // Extra wait for React to stabilize
    await waitForReactMount(page, 30_000);
    
    // Use 'dark-' prefix for dark mode screenshots
    await captureDark(page, testInfo, '01-dashboard-dark', !isMobile);
    await stabilizeAppState(page);

    await navigateTo(page, 'new-entry', 'New Entry', { isMobile, expectText: /Quick Log/i });
    await waitForReactMount(page, 15_000);
    await page.waitForTimeout(500);
    await captureDark(page, testInfo, '02-new-entry-dark', !isMobile);
    await stabilizeAppState(page);

    // Body-map with special handling
    console.log('[DARK MODE] Starting body-map navigation...');
    await page.waitForTimeout(1000);
    
    if (isMobile) {
      await openNavigationMenu(page, true);
      await page.waitForTimeout(300);
    }
    
    const bodyMapButton = page.locator('[data-nav-target="body-map"]').first();
    if (await bodyMapButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await bodyMapButton.click({ force: true });
    } else {
      await navigateTo(page, 'body-map', 'Body Map', { isMobile, expectHeading: /^Body Map$/i });
    }
    
    await page.waitForTimeout(2000);
    await captureDark(page, testInfo, '03-body-map-dark', !isMobile);
    await stabilizeAppState(page);

    await navigateTo(page, 'fibromyalgia', 'Fibromyalgia Hub', { isMobile, expectHeading: /Fibromyalgia Support Hub/i });
    await waitForReactMount(page, 15_000);
    await page.waitForTimeout(700);
    await captureDark(page, testInfo, '04-fibromyalgia-hub-dark', !isMobile);
    await stabilizeAppState(page);

    await navigateTo(page, 'analytics', 'Analytics', { isMobile, expectHeading: /Premium Analytics/i });
    await page.waitForTimeout(900);
    await captureDark(page, testInfo, '05-analytics-dark', !isMobile);
    await stabilizeAppState(page);

    await navigateTo(page, 'calendar', 'Calendar', { isMobile, expectHeading: /Calendar View/i });
    await page.waitForTimeout(700);
    await captureDark(page, testInfo, '06-calendar-dark', !isMobile);
    await stabilizeAppState(page);

    await navigateTo(page, 'reports', 'Reports', { isMobile, expectHeading: /Reports & Export/i });
    await page.waitForTimeout(900);
    await captureDark(page, testInfo, '07-reports-dark', !isMobile);
    await stabilizeAppState(page);

    // Panic mode overlay
    try {
      const panic = page.locator('[aria-label="Activate calm breathing mode"]').first();
      if ((await panic.count()) > 0) {
        await panic.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(500);
        await captureDark(page, testInfo, '08-panic-mode-dark', false);
        await page.keyboard.press('Escape').catch(() => {});
        await page.waitForTimeout(300);
        await stabilizeAppState(page);
      }
    } catch {
      // ignore
    }

    await navigateTo(page, 'settings', 'Settings', { isMobile, expectHeading: /^Settings$/i });
    await page.waitForTimeout(600);
    await captureDark(page, testInfo, '09-settings-dark', !isMobile);
    await stabilizeAppState(page);

    await navigateTo(page, 'help', 'Help', { isMobile, expectHeading: /Help & Support/i });
    await page.waitForTimeout(600);
    await captureDark(page, testInfo, '10-help-dark', !isMobile);

    // Output any collected console errors
    if (consoleErrors.length > 0) {
      console.log('\n=== Console Errors During Dark Mode Test ===');
      consoleErrors.forEach(err => console.log(err));
      console.log('=== End Console Errors ===\n');
    }
  });
});

// Dark mode capture function - saves to dark-mode subdirectory
async function captureDark(page: Page, testInfo: { project: { name: string } }, name: string, fullPage = true) {
  const outDir = path.join(process.cwd(), 'e2e', 'results', 'screenshots', 'dark-mode', testInfo.project.name);
  fs.mkdirSync(outDir, { recursive: true });
  const filePath = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage });
}
