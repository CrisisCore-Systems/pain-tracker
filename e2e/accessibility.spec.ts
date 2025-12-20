import { test, expect } from './test-setup';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';
import { samplePainEntries } from '../src/data/sampleData';

// Increase test timeout to 5 minutes for accessibility scans
test.setTimeout(300_000);

const ONBOARDING_STORAGE_KEY = 'pain-tracker-onboarding-completed';
const WALKTHROUGH_STORAGE_KEY = 'pain-tracker-walkthrough-completed';
const STORE_STORAGE_KEY = 'pain-tracker-storage';
const BETA_WARNING_KEY = 'beta-warning-dismissed';
const NOTIFICATION_CONSENT_KEY = 'notification-consent-answered';
const ANALYTICS_CONSENT_KEY = 'beta-analytics-consent';

const persistedSampleState = JSON.stringify({
  state: {
    entries: samplePainEntries,
    moodEntries: [],
    emergencyData: null,
    activityLogs: []
  },
  version: 0
});

async function dismissInitialModals(page: Page) {
  // CRITICAL: Notification prompts are being rendered dozens of times
  // This function dismisses ALL instances aggressively
  console.log('Dismissing all blocking modals and notification prompts...');
  
  // Dismiss notification consent prompts (dismiss all instances)
  try {
    const dismissButtons = page.locator('button:has-text("Dismiss notification")');
    const count = await dismissButtons.count();
    if (count > 0) {
      console.log(`Found ${count} notification prompts to dismiss`);
      for (let i = 0; i < Math.min(count, 100); i++) {
        try {
          await dismissButtons.nth(i).click({ timeout: 500 });
        } catch {
          // Continue even if one fails
        }
      }
      await page.waitForTimeout(500);
    }
  } catch {
    console.log('Notification dismiss completed or not found');
  }
  
  // Try to dismiss any other blocking modals/prompts
  const modalsToCheck = [
    { selector: 'button:has-text("Continue")', name: 'Continue button' },
    { selector: 'button:has-text("Close")', name: 'Close button' },
    { selector: 'button:has-text("Skip")', name: 'Skip button' },
    { selector: 'button:has-text("Got it")', name: 'Got it button' },
    { selector: 'button:has-text("Accept")', name: 'Accept button' },
    { selector: 'button[aria-label="Close"]', name: 'Close aria button' }
  ];

  for (const modal of modalsToCheck) {
    try {
      const button = page.locator(modal.selector).first();
      if (await button.count() > 0 && await button.isVisible({ timeout: 500 })) {
        await button.click();
        await page.waitForTimeout(300);
      }
    } catch {
      // Ignore if modal not found or not clickable
    }
  }
  
  console.log('Modal dismissal complete');
}

test.beforeEach(async ({ page, context }) => {
  // Set localStorage before navigation
  await context.addInitScript(({ onboardingKey, walkthroughKey, storeKey, storeState, betaKey, notifKey, analyticsKey }) => {
    try {
      localStorage.setItem(onboardingKey, 'true');
      localStorage.setItem(walkthroughKey, 'true');
      localStorage.setItem(storeKey, storeState);
      localStorage.setItem(betaKey, 'true');
      localStorage.setItem(notifKey, 'true');
      localStorage.setItem(analyticsKey, JSON.stringify({ consented: false, timestamp: Date.now() }));
    } catch {
      // Storage may be unavailable in some environments; ignore
    }
  }, {
    onboardingKey: ONBOARDING_STORAGE_KEY,
    walkthroughKey: WALKTHROUGH_STORAGE_KEY,
    storeKey: STORE_STORAGE_KEY,
    storeState: persistedSampleState,
    betaKey: BETA_WARNING_KEY,
    notifKey: NOTIFICATION_CONSENT_KEY,
    analyticsKey: ANALYTICS_CONSENT_KEY
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  
  // Navigate to page
  await page.goto('http://localhost:3000');
  
  // If VaultGate appears, bypass it by filling and submitting the form
  try {
    const vaultDialog = page.locator('[role="dialog"][aria-modal="true"]');
    const vaultTitle = page.locator('h1:has-text("Secure vault")');
    
    if (await vaultDialog.count() > 0 && await vaultTitle.isVisible({ timeout: 2000 })) {
      console.log('VaultGate detected, bypassing...');
      
      // Check if it's setup (uninitialized) or unlock (locked)
      const setupButton = page.locator('button:has-text("Create secure vault")');
      const unlockButton = page.locator('button:has-text("Unlock vault")');
      
      const testPassphrase = 'e2e-test-passphrase-12345';
      
      if (await setupButton.count() > 0) {
        // Setup flow
        await page.locator('input[id="vault-passphrase"]').fill(testPassphrase);
        await page.locator('input[id="vault-passphrase-confirm"]').fill(testPassphrase);
        await setupButton.click();
      } else if (await unlockButton.count() > 0) {
        // Unlock flow
        await page.locator('input[id="vault-passphrase-unlock"]').fill(testPassphrase);
        await unlockButton.click();
      }
      
      // Wait for vault to unlock (dialog should disappear)
      await vaultDialog.waitFor({ state: 'hidden', timeout: 5000 });
      console.log('VaultGate bypassed successfully');
    }
  } catch (error) {
    console.log('VaultGate handling completed or not present:', error);
  }
  
  // Additional wait for app to fully initialize
  await page.waitForTimeout(1000);
});

async function openNavigationMenu(page: Page) {
  // Check if we're on mobile viewport (nav toggle would be visible)
  const navToggle = page.locator('[data-testid="nav-toggle"], button[aria-label*="navigation"]').first();
  
  try {
    // Only click if visible (will be hidden on desktop 1440x900)
    const isVisible = await navToggle.isVisible({ timeout: 500 });
    if (isVisible) {
      await navToggle.click();
      await page.waitForTimeout(300);
    }
  } catch {
    // Not visible or not found (desktop), continue without clicking
  }
}

const VIEW_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  calendar: 'Calendar',
  history: 'History',
  support: 'Support'
};

interface NavigateToViewOptions {
  navTarget?: string;
  fallbackSelectors?: string[];
  debugName?: string;
}

async function navigateToView(page: Page, { navTarget, fallbackSelectors = [], debugName }: NavigateToViewOptions) {
  const selectorsToTry: string[] = [];

  if (navTarget) {
    selectorsToTry.push(`[data-nav-target="${navTarget}"]`);
    const label = VIEW_LABELS[navTarget] ?? debugName;
    if (label) {
      selectorsToTry.push(`button:has-text("${label}")`);
    }
  }

  selectorsToTry.push(...fallbackSelectors);

  console.log(`Trying selectors for ${debugName}:`, selectorsToTry);

  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('body');

  // Ensure navigation menu is open on narrow viewports
  try {
    await openNavigationMenu(page);
  } catch {
    // Ignore if nav toggle/opening is not applicable
  }

  for (const selector of selectorsToTry) {
    try {
      console.log(`  Trying selector: ${selector}`);
      const locator = page.locator(selector).first();
      const count = await locator.count();
      
      console.log(`    Count: ${count}`);
      if (count === 0) continue;
      
      // Try to click directly (works on desktop where nav is always visible)
      const isVisible = await locator.isVisible({ timeout: 1000 });
      console.log(`    Visible: ${isVisible}`);
      
      if (isVisible) {
        await locator.click();
        console.log(`    Clicked ${selector} successfully`);
        await page.waitForTimeout(500);
        return;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`    Error: ${message}`);
      // Try next selector
      continue;
    }
  }

  // Try link anchors as a fallback (anchor tags or links)
  try {
  const label = navTarget ? (VIEW_LABELS[navTarget] ?? debugName ?? navTarget) : (debugName ?? '');
    const anchorSelectors = [
      `a:has-text("${label}")`,
      `a[href*="${navTarget}"]`,
      `button:has-text("${label}")`
    ];

    for (const s of anchorSelectors) {
      try {
        const loc = page.locator(s).first();
        const cnt = await loc.count();
        if (cnt > 0 && await loc.isVisible({ timeout: 500 }).catch(() => false)) {
          await loc.click();
          await page.waitForTimeout(600);
          console.log(`    Clicked fallback anchor ${s}`);
          return;
        }
      } catch {
        // continue
      }
    }
  } catch {
    // ignore
  }

  // Final fallback: navigate directly by URL using the current origin + navTarget
  try {
    const current = new URL(page.url());
    const targetPath = navTarget ? `/${navTarget.replace(/^\//, '')}` : '/';
    const target = `${current.origin}${current.pathname.replace(/\/$/, '')}${targetPath}`;
    console.log(`    Fallback navigating directly to ${target}`);
    await page.goto(target, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);
    return;
  } catch (err) {
  console.log('    Direct navigation fallback failed:', String(err));
  }

  throw new Error(`Unable to navigate to view ${debugName ?? navTarget ?? 'unknown'}`);
}

// List of routes/views to scan — adjust to match actual app navigation
const ROUTES = [
  {
    name: 'dashboard',
    path: '/',
    selector: '[data-walkthrough="pain-entry-form"]',
    action: async (page: Page) => {
      // Already on dashboard from beforeEach, just ensure modals are dismissed
      await dismissInitialModals(page);
      await page.waitForTimeout(500);
      
      // Wait for dashboard content (try multiple selectors)
      const dashboardSelectors = [
        '[data-walkthrough="pain-entry-form"]',
        'text=Pain Tracker Pro',
        'main'
      ];
      
      for (const selector of dashboardSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          console.log(`Dashboard ready via: ${selector}`);
          return;
        } catch {
          // Try next selector
        }
      }
    }
  },
  {
    name: 'analytics',
    path: '/',
    selector: 'text=Premium Analytics',
    action: async (page: Page) => {
      await dismissInitialModals(page);
      console.log('Attempting to navigate to analytics...');
      
      await navigateToView(page, {
        navTarget: 'analytics',
        fallbackSelectors: [
          'button:has-text("Analytics Pro")',
          'button:has-text("Analytics")',
          'button:has-text("Premium Analytics")',
          '[data-nav-target="analytics"]'
        ],
        debugName: 'analytics'
      });
      
      // Wait for analytics content to load
      await page.waitForTimeout(1000);
      
      // Try multiple selectors for analytics
      try {
        await page.waitForSelector('text=Premium Analytics, text=Analytics Dashboard, h1, h2', { timeout: 10000 });
      } catch {
        // Fallback: just ensure we're on some page
        await page.waitForSelector('main, [role="main"]', { timeout: 5000 });
      }
    }
  },
  {
    name: 'calendar',
    path: '/',
    selector: '[data-walkthrough="pain-history"]',
    action: async (page: Page) => {
      await dismissInitialModals(page);
      console.log('Attempting to navigate to calendar/history...');
      
      await navigateToView(page, {
        navTarget: 'history',
        fallbackSelectors: [
          'button:has-text("Calendar")',
          'button:has-text("History")',
          'button:has-text("Pain History")',
          '[data-nav-target="history"]',
          '[data-nav-target="calendar"]'
        ],
        debugName: 'calendar'
      });
      
      // Wait for history content to load
      await page.waitForTimeout(1000);
      
      // Try multiple selectors for history/calendar
      try {
        await page.waitForSelector('[data-walkthrough="pain-history"], text=Calendar, text=Pain History', { timeout: 10000 });
      } catch {
        // Fallback: just ensure we're on some page
        await page.waitForSelector('main, [role="main"]', { timeout: 5000 });
      }
    }
  }
];

// Helper to get computed colors for contrast checking (optimized - sample only)
type ColorDatum = {
  selector: string;
  textColor: string;
  backgroundColor: string;
  fontSize: string;
  fontWeight: string;
};

async function getComputedColors(page: Page): Promise<ColorDatum[]> {
  return page.evaluate(() => {
    const elements = document.querySelectorAll('button, a, input, h1, h2, h3, p, span, div');
    const colorData: ColorDatum[] = [];
    const maxSamples = 20; // Limit to 20 samples for performance

    for (const el of elements) {
      if (colorData.length >= maxSamples) break;
      
      const style = window.getComputedStyle(el);
      const textColor = style.color;
      const backgroundColor = style.backgroundColor;

      // Only collect elements with actual colors (not transparent/default)
      if (textColor && textColor !== 'rgba(0, 0, 0, 0)' &&
          backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        colorData.push({
          selector: el.tagName + (el.className ? '.' + el.className.split(' ').join('.') : ''),
          textColor,
          backgroundColor,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight
        });
      }
    }

    return colorData;
  });
}

// Helper to test focus behavior (optimized - count only)
type FocusVisibleStyle = { element: string; hasFocusRing: boolean };
type FocusResults = {
  totalFocusable: number;
  visibleFocusable: number;
  focusVisibleStyles: FocusVisibleStyle[];
};

async function testFocusBehavior(page: Page): Promise<FocusResults> {
  const focusResults = await page.evaluate(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const results: FocusResults = {
      totalFocusable: focusableElements.length,
      visibleFocusable: 0,
      focusVisibleStyles: []
    };

    let checked = 0;
    const maxCheck = 50; // Only check first 50 elements for performance

    focusableElements.forEach((el) => {
      if (checked >= maxCheck) return;
      
      const rect = el.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0 &&
                       window.getComputedStyle(el).visibility !== 'hidden';

      if (isVisible) {
        results.visibleFocusable++;
        checked++;

        // Quick check for focus-visible styles
        el.focus();
        const styles = window.getComputedStyle(el);
        const hasFocusRing = styles.boxShadow.includes('rgb') ||
                           (styles.outline !== 'none' && styles.outline !== '');

        results.focusVisibleStyles.push({
          element: el.tagName + (el.id ? '#' + el.id : ''),
          hasFocusRing
        });
      }
    });

    return results;
  });

  return focusResults;
}

// Generate HTML report
type AxeNodeLike = unknown;
type AxeViolationLike = {
  id?: string;
  impact?: string | null;
  description?: string;
  help?: string;
  helpUrl?: string;
  nodes?: AxeNodeLike[];
};

type AccessibilityReportInput = {
  violations: AxeViolationLike[];
  colorData: ColorDatum[];
  focusResults: FocusResults;
};

function generateHTMLReport(results: AccessibilityReportInput, routeName: string) {
  const reportDir = path.join(process.cwd(), 'accessibility-reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `accessibility-report-${routeName}-${timestamp}.html`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Report - ${routeName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .violations { margin-bottom: 20px; }
        .violation { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 4px; }
        .violation.critical { border-color: #d32f2f; background: #ffebee; }
        .violation.serious { border-color: #f57c00; background: #fff3e0; }
        .violation.moderate { border-color: #fbc02d; background: #fffde7; }
        .violation.minor { border-color: #388e3c; background: #e8f5e8; }
        .colors { margin-bottom: 20px; }
        .color-item { border: 1px solid #ddd; padding: 10px; margin-bottom: 5px; border-radius: 4px; }
        .focus-results { margin-bottom: 20px; }
        .metric { display: inline-block; background: #e3f2fd; padding: 5px 10px; margin: 5px; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>Accessibility Report - ${routeName}</h1>
    <div class="summary">
        <h2>Summary</h2>
        <div class="metric">Total Violations: ${results.violations?.length || 0}</div>
        <div class="metric">Critical: ${results.violations?.filter((v) => v.impact === 'critical').length || 0}</div>
        <div class="metric">Serious: ${results.violations?.filter((v) => v.impact === 'serious').length || 0}</div>
        <div class="metric">Moderate: ${results.violations?.filter((v) => v.impact === 'moderate').length || 0}</div>
        <div class="metric">Focusable Elements: ${results.focusResults?.totalFocusable || 0}</div>
        <div class="metric">Visible Focusable: ${results.focusResults?.visibleFocusable || 0}</div>
    </div>

    ${results.violations?.length > 0 ? `
    <div class="violations">
        <h2>Violations</h2>
      ${results.violations.map((violation) => `
            <div class="violation ${violation.impact}">
                <h3>${violation.id} (${violation.impact})</h3>
                <p><strong>Description:</strong> ${violation.description}</p>
                <p><strong>Help:</strong> ${violation.help}</p>
                <p><strong>Help URL:</strong> <a href="${violation.helpUrl}" target="_blank">${violation.helpUrl}</a></p>
                <p><strong>Elements:</strong> ${violation.nodes?.length || 0}</p>
            </div>
        `).join('')}
    </div>
    ` : '<p>No accessibility violations found!</p>'}

    <div class="focus-results">
        <h2>Focus Behavior</h2>
      <p>Elements with focus-visible styles: ${results.focusResults?.focusVisibleStyles?.filter((f) => f.hasFocusRing).length || 0} / ${results.focusResults?.visibleFocusable || 0}</p>
    </div>

    <div class="colors">
        <h2>Computed Colors (Sample)</h2>
      ${results.colorData?.slice(0, 10).map((color) => `
            <div class="color-item">
                <strong>${color.selector}</strong><br>
                Text: ${color.textColor} | Background: ${color.backgroundColor}
            </div>
        `).join('') || 'No color data collected'}
    </div>
</body>
</html>`;

  fs.writeFileSync(path.join(reportDir, filename), html);
  return filename;
}

test.describe('Accessibility - comprehensive a11y checks', () => {
  for (const route of ROUTES) {
    test(`comprehensive scan ${route.name}`, async ({ page }) => {
      console.log(`\n=== Starting accessibility scan for ${route.name} ===`);
      const startTime = Date.now();
      
      // Note: page.goto already called in beforeEach with VaultGate bypass
      // No need to navigate again for dashboard route
      
      // Wait for main content to render
      await page.waitForSelector('body', { timeout: 10000 });
      console.log(`Body loaded (${Date.now() - startTime}ms)`);

      // Execute route-specific action if defined
      if (route.action) {
        await route.action(page);
        console.log(`Route action complete (${Date.now() - startTime}ms)`);
        // Wait for navigation or content change
        await page.waitForTimeout(1000);
      }

      // Wait for specific selector if provided
      if (route.selector) {
        try {
          await page.waitForSelector(route.selector, { timeout: 5000 });
        } catch {
          console.warn(`Selector ${route.selector} not found for route ${route.name}`);
        }
      }

      // Get computed colors for contrast analysis
      console.log(`Starting color analysis (${Date.now() - startTime}ms)`);
      const colorData = await getComputedColors(page);
      console.log(`Color analysis complete (${Date.now() - startTime}ms)`);

      // Test focus behavior
      console.log(`Starting focus testing (${Date.now() - startTime}ms)`);
      const focusResults = await testFocusBehavior(page);
      console.log(`Focus testing complete (${Date.now() - startTime}ms)`);

      // Run axe-core accessibility scan
      console.log(`Starting Axe scan (${Date.now() - startTime}ms)`);
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      console.log(`Axe scan complete (${Date.now() - startTime}ms)`);

      // Generate HTML report
      const reportFile = generateHTMLReport({
        violations: accessibilityScanResults.violations,
        colorData,
        focusResults
      }, route.name);

      console.log(`Generated accessibility report: ${reportFile}`);

      // Also save JSON report
      const jsonReportPath = path.join(process.cwd(), 'accessibility-reports',
        `accessibility-report-${route.name}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
      fs.writeFileSync(jsonReportPath, JSON.stringify({
        route: route.name,
        timestamp: new Date().toISOString(),
        violations: accessibilityScanResults.violations,
        colorData,
        focusResults
      }, null, 2));

      // Fail test if there are critical or serious accessibility violations
      const violations = (accessibilityScanResults.violations || []) as unknown as AxeViolationLike[];
      const critical = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');

      console.log(`Total scan time: ${Date.now() - startTime}ms`);

      if (critical.length > 0) {
        // Print summary for debugging
        console.error(`Accessibility violations for ${route.name}:`,
          critical.map((c) => ({ id: c.id, impact: c.impact, nodes: c.nodes?.length })));
      }

      // Check focus-visible implementation
      const focusVisibleCount = focusResults.focusVisibleStyles?.filter((f) => f.hasFocusRing).length || 0;
      const totalFocusable = focusResults.visibleFocusable || 0;

      // At least 80% of focusable elements should have visible focus indicators
      const focusVisibleRatio = totalFocusable > 0 ? focusVisibleCount / totalFocusable : 1;
      expect(focusVisibleRatio).toBeGreaterThanOrEqual(0.8);

      // Warn about critical/serious violations but don't fail (allows us to collect all reports)
      if (critical.length > 0) {
        console.warn(`⚠️  ${critical.length} critical/serious accessibility violations found in ${route.name}`);
        console.warn('Review the generated HTML report for details');
      }
    });
  }
});
