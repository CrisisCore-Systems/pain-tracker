import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

// List of routes/views to scan — adjust to match actual app navigation
const ROUTES = [
  { name: 'dashboard', path: '/', selector: '[data-walkthrough="pain-entry-form"]' },
  { name: 'analytics', path: '/', selector: 'text=Advanced Analytics Dashboard', action: async (page: any) => {
    await page.click('button:has-text("Analytics")');
    await page.waitForSelector('text=Advanced Analytics Dashboard');
  }},
  { name: 'history', path: '/', selector: 'text=Pain History', action: async (page: any) => {
    await page.click('button:has-text("History")');
    await page.waitForSelector('text=Pain History');
  }}
];

// Helper to get computed colors for contrast checking
async function getComputedColors(page: any) {
  return page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const colorData = [];

    for (const el of elements) {
      const style = window.getComputedStyle(el);
      const textColor = style.color;
      const backgroundColor = style.backgroundColor;
      const borderColor = style.borderColor;

      // Only collect elements with actual colors (not transparent/default)
      if (textColor && textColor !== 'rgba(0, 0, 0, 0)' &&
          backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        colorData.push({
          selector: el.tagName + (el.className ? '.' + el.className.split(' ').join('.') : ''),
          textColor,
          backgroundColor,
          borderColor,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight
        });
      }
    }

    return colorData;
  });
}

// Helper to test focus behavior
async function testFocusBehavior(page: any) {
  const focusResults = await page.evaluate(() => {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const results = {
      totalFocusable: focusableElements.length,
      visibleFocusable: 0,
      focusVisibleStyles: [],
      tabOrder: []
    };

    focusableElements.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0 &&
                       window.getComputedStyle(el).visibility !== 'hidden';

      if (isVisible) {
        results.visibleFocusable++;

        // Check for focus-visible styles
        el.focus();
        const styles = window.getComputedStyle(el);
        const hasFocusRing = styles.boxShadow.includes('rgb') ||
                           styles.outline !== 'none' && styles.outline !== '';

        results.focusVisibleStyles.push({
          element: el.tagName + (el.id ? '#' + el.id : ''),
          hasFocusRing,
          tabIndex: index
        });

        results.tabOrder.push({
          element: el.tagName + (el.id ? '#' + el.id : ''),
          tabIndex: el.tabIndex
        });
      }
    });

    return results;
  });

  return focusResults;
}

// Generate HTML report
function generateHTMLReport(results: any, routeName: string) {
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
        <div class="metric">Critical: ${results.violations?.filter((v: any) => v.impact === 'critical').length || 0}</div>
        <div class="metric">Serious: ${results.violations?.filter((v: any) => v.impact === 'serious').length || 0}</div>
        <div class="metric">Moderate: ${results.violations?.filter((v: any) => v.impact === 'moderate').length || 0}</div>
        <div class="metric">Focusable Elements: ${results.focusResults?.totalFocusable || 0}</div>
        <div class="metric">Visible Focusable: ${results.focusResults?.visibleFocusable || 0}</div>
    </div>

    ${results.violations?.length > 0 ? `
    <div class="violations">
        <h2>Violations</h2>
        ${results.violations.map((violation: any) => `
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
        <p>Elements with focus-visible styles: ${results.focusResults?.focusVisibleStyles?.filter((f: any) => f.hasFocusRing).length || 0} / ${results.focusResults?.visibleFocusable || 0}</p>
    </div>

    <div class="colors">
        <h2>Computed Colors (Sample)</h2>
        ${results.colorData?.slice(0, 10).map((color: any) => `
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
      // Adjust base URL if different
      await page.goto(`http://localhost:3000/pain-tracker${route.path}`);

      // Wait for main content to render
      await page.waitForSelector('body');

      // Execute route-specific action if defined
      if (route.action) {
        await route.action(page);
        // Wait for navigation or content change
        await page.waitForTimeout(1000);
      }

      // Wait for specific selector if provided
      if (route.selector) {
        try {
          await page.waitForSelector(route.selector, { timeout: 5000 });
        } catch (e) {
          console.warn(`Selector ${route.selector} not found for route ${route.name}`);
        }
      }

      // Get computed colors for contrast analysis
      const colorData = await getComputedColors(page);

      // Test focus behavior
      const focusResults = await testFocusBehavior(page);

      // Run axe-core accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

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
      const violations = accessibilityScanResults.violations || [];
      const critical = violations.filter((v: any) => v.impact === 'critical' || v.impact === 'serious');

      if (critical.length > 0) {
        // Print summary for debugging
        console.error(`Accessibility violations for ${route.name}:`,
          critical.map((c: any) => ({ id: c.id, impact: c.impact, nodes: c.nodes?.length })));
      }

      // Check focus-visible implementation
      const focusVisibleCount = focusResults.focusVisibleStyles?.filter((f: any) => f.hasFocusRing).length || 0;
      const totalFocusable = focusResults.visibleFocusable || 0;

      // At least 80% of focusable elements should have visible focus indicators
      const focusVisibleRatio = totalFocusable > 0 ? focusVisibleCount / totalFocusable : 1;
      expect(focusVisibleRatio).toBeGreaterThanOrEqual(0.8);

      // Expect no critical or serious violations
      expect(critical.length).toBe(0);
    });
  }
});
