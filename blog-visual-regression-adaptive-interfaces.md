# Visual Regression for Adaptive Interfaces: Testing That Crisis Mode Actually Looks Different

*Part of the CrisisCore Build Log - ensuring trauma-informed UI isn't just state management theater*

---

Here's a failure mode I didn't anticipate: tests passing while the UI does nothing.

```typescript
// ✅ Test passes
expect(preferences.simplifiedMode).toBe(true);
expect(preferences.touchTargetSize).toBe('extra-large');

// 🤷 But does the user actually see bigger buttons?
```

State management is easy to test. Visual transformation is not. And in a crisis, **what the user sees** is the only thing that matters.

This post covers how I verify that emergency mode isn't just flipping booleans—it's actually changing the experience.

---

## The Visual Verification Gap

Unit tests verify:
- ✅ State updated correctly
- ✅ CSS classes applied
- ✅ Component rendered

Unit tests **cannot** verify:
- ❌ Button actually looks bigger
- ❌ Contrast ratio actually increased
- ❌ Layout actually simplified
- ❌ Text actually readable

The gap between "test passed" and "user helped" is visual. Screenshot testing bridges that gap.

---

## Strategy 1: Before/After Screenshot Diffs

The core technique: capture the same component in normal mode and crisis mode, then verify they're meaningfully different.

### Playwright Visual Comparisons

```typescript
import { test, expect } from '@playwright/test';

test.describe('Crisis Mode Visual Transformations', () => {
  test('emergency mode visually differs from normal mode', async ({ page }) => {
    // Capture normal state
    await page.goto('/pain-entry');
    const normalScreenshot = await page.screenshot();
    
    // Activate crisis mode
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('activate-crisis-mode', {
        detail: { severity: 'emergency' }
      }));
    });
    
    // Wait for visual transition
    await page.waitForTimeout(500); // Allow CSS transitions
    
    // Capture crisis state
    const crisisScreenshot = await page.screenshot();
    
    // Verify they're different (this is the key assertion)
    expect(Buffer.compare(normalScreenshot, crisisScreenshot)).not.toBe(0);
  });

  test('emergency mode matches approved baseline', async ({ page }) => {
    await page.goto('/pain-entry?crisis=emergency');
    
    await expect(page).toHaveScreenshot('emergency-mode-pain-entry.png', {
      maxDiffPixels: 100, // Allow minor anti-aliasing differences
    });
  });
});
```

### Component-Level Screenshots

For faster feedback, capture individual components:

```typescript
test.describe('Touch Target Scaling', () => {
  test('buttons scale up in emergency mode', async ({ page }) => {
    await page.goto('/component-preview/button');
    
    // Normal size
    await expect(page.locator('[data-testid="primary-button"]'))
      .toHaveScreenshot('button-normal.png');
    
    // Emergency size
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-crisis-mode', 'emergency');
    });
    
    await expect(page.locator('[data-testid="primary-button"]'))
      .toHaveScreenshot('button-emergency.png');
  });
});
```

---

## Strategy 2: Dynamic Baseline Management

Here's the problem with standard visual regression: you have one baseline per test. But adaptive interfaces have **many valid states**.

A button in Pain Tracker can look correct in any of these combinations:

| Mode | Contrast | Font Size | Touch Targets | Result |
|------|----------|-----------|---------------|--------|
| Normal | Normal | Medium | Standard | Baseline A |
| Normal | High | Medium | Standard | Baseline B |
| Crisis | Normal | Large | Extra-Large | Baseline C |
| Crisis | High | Large | Extra-Large | Baseline D |
| ... | ... | ... | ... | 16+ combinations |

### Matrix Testing with Playwright

```typescript
const PREFERENCE_MATRIX = [
  { mode: 'normal', contrast: 'normal', fontSize: 'medium' },
  { mode: 'normal', contrast: 'high', fontSize: 'medium' },
  { mode: 'normal', contrast: 'normal', fontSize: 'large' },
  { mode: 'crisis', contrast: 'normal', fontSize: 'large' },
  { mode: 'crisis', contrast: 'high', fontSize: 'large' },
];

for (const prefs of PREFERENCE_MATRIX) {
  test(`pain entry form - ${prefs.mode}/${prefs.contrast}/${prefs.fontSize}`, async ({ page }) => {
    // Set preferences via URL params or localStorage
    await page.goto(`/pain-entry?mode=${prefs.mode}&contrast=${prefs.contrast}&fontSize=${prefs.fontSize}`);
    
    // Each combination has its own baseline
    const baselineName = `pain-entry-${prefs.mode}-${prefs.contrast}-${prefs.fontSize}.png`;
    await expect(page).toHaveScreenshot(baselineName);
  });
}
```

### Chromatic for Storybook Integration

If you use Storybook, Chromatic handles matrix testing elegantly:

```typescript
// Button.stories.tsx
export default {
  title: 'Components/Button',
  component: Button,
};

// Generate stories for each state
export const Normal = () => <Button>Save Entry</Button>;
export const Emergency = () => (
  <CrisisModeProvider initialMode="emergency">
    <Button>Save Entry</Button>
  </CrisisModeProvider>
);
export const HighContrast = () => (
  <ThemeProvider contrast="high">
    <Button>Save Entry</Button>
  </ThemeProvider>
);
export const EmergencyHighContrast = () => (
  <CrisisModeProvider initialMode="emergency">
    <ThemeProvider contrast="high">
      <Button>Save Entry</Button>
    </ThemeProvider>
  </CrisisModeProvider>
);

// Chromatic captures each story as a separate baseline
```

---

## Strategy 3: Accessibility Tree Comparison

Visual changes should have semantic changes. If buttons get bigger, they should still be buttons. If the layout simplifies, the heading structure should remain coherent.

### Playwright Accessibility Snapshots

```typescript
test.describe('Crisis Mode Accessibility Structure', () => {
  test('normal mode has full navigation structure', async ({ page }) => {
    await page.goto('/pain-entry');
    
    await expect(page.locator('main')).toMatchAriaSnapshot(`
      - main:
        - heading "Log Pain Entry" [level=1]
        - navigation "Entry sections":
          - link "Basic Info"
          - link "Location"
          - link "Symptoms"
          - link "Triggers"
          - link "Medications"
        - form "Pain entry form":
          - group "Pain Level":
            - slider "Pain intensity"
          - group "Location":
            - button "Select body areas"
          - group "Notes":
            - textbox "Additional notes"
        - button "Save Entry"
        - button "Cancel"
    `);
  });

  test('emergency mode simplifies to essentials', async ({ page }) => {
    await page.goto('/pain-entry?crisis=emergency');
    
    // Emergency mode should have FEWER elements, not more
    await expect(page.locator('main')).toMatchAriaSnapshot(`
      - main:
        - heading "Quick Pain Log" [level=1]
        - form "Simplified pain entry":
          - group "How bad?":
            - slider "Pain level"
          - group "Where?":
            - button "Tap body location"
        - button "Save Now"
        - button "Need Help?"
    `);
  });
});
```

### Diff Detection for Accessibility Trees

```typescript
test('emergency mode reduces cognitive load', async ({ page }) => {
  // Count interactive elements in normal mode
  await page.goto('/pain-entry');
  const normalInteractive = await page.locator('[role="button"], [role="link"], input, select, textarea').count();
  
  // Count in emergency mode
  await page.goto('/pain-entry?crisis=emergency');
  const emergencyInteractive = await page.locator('[role="button"], [role="link"], input, select, textarea').count();
  
  // Emergency mode should have fewer interactive elements
  expect(emergencyInteractive).toBeLessThan(normalInteractive);
  
  // But not zero - core functionality must remain
  expect(emergencyInteractive).toBeGreaterThan(2);
});
```

---

## Strategy 4: Color Contrast Verification

"High contrast mode" is meaningless if the contrast ratios don't actually meet WCAG thresholds. Automated testing can verify this.

### axe-core Contrast Checks

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Contrast Verification', () => {
  test('normal mode meets WCAG AA (4.5:1)', async ({ page }) => {
    await page.goto('/pain-entry');
    
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    
    expect(results.violations).toHaveLength(0);
  });

  test('high contrast mode exceeds WCAG AAA (7:1)', async ({ page }) => {
    await page.goto('/pain-entry?contrast=high');
    
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast-enhanced']) // AAA level
      .analyze();
    
    expect(results.violations).toHaveLength(0);
  });

  test('emergency mode maintains contrast despite color changes', async ({ page }) => {
    await page.goto('/pain-entry?crisis=emergency');
    
    // Emergency mode might use different colors (warmer, calmer)
    // but must still be accessible
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    
    expect(results.violations).toHaveLength(0);
  });
});
```

### Computed Style Verification

For specific elements, verify the actual computed contrast:

```typescript
test('crisis button has sufficient contrast', async ({ page }) => {
  await page.goto('/pain-entry?crisis=emergency');
  
  const button = page.locator('[data-testid="save-button"]');
  
  // Get computed styles
  const styles = await button.evaluate((el) => {
    const computed = window.getComputedStyle(el);
    return {
      backgroundColor: computed.backgroundColor,
      color: computed.color,
    };
  });
  
  // Calculate contrast ratio (you'd need a helper for this)
  const ratio = calculateContrastRatio(styles.backgroundColor, styles.color);
  
  // Emergency buttons should be highly visible
  expect(ratio).toBeGreaterThanOrEqual(7); // AAA level
});

// Helper function
function calculateContrastRatio(bg: string, fg: string): number {
  const bgLuminance = getLuminance(parseColor(bg));
  const fgLuminance = getLuminance(parseColor(fg));
  
  const lighter = Math.max(bgLuminance, fgLuminance);
  const darker = Math.min(bgLuminance, fgLuminance);
  
  return (lighter + 0.05) / (darker + 0.05);
}
```

---

## Strategy 5: Responsive Breakpoints for Trauma

Crisis doesn't wait for a desktop. The simplified interface must work on phones, tablets, and everything in between.

### Viewport Matrix Testing

```typescript
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
];

const MODES = ['normal', 'crisis'];

for (const viewport of VIEWPORTS) {
  for (const mode of MODES) {
    test(`pain entry - ${viewport.name} - ${mode}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(`/pain-entry?crisis=${mode === 'crisis' ? 'emergency' : 'none'}`);
      
      await expect(page).toHaveScreenshot(
        `pain-entry-${viewport.name}-${mode}.png`
      );
    });
  }
}
```

### Touch Target Size Verification

WCAG requires 44x44px minimum touch targets. In crisis mode, we want larger:

```typescript
test.describe('Touch Target Sizing', () => {
  test('normal mode meets minimum touch targets (44px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.goto('/pain-entry');
    
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const box = await button.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('emergency mode has enlarged touch targets (56px+)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/pain-entry?crisis=emergency');
    
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const box = await button.boundingBox();
      // Emergency mode should have larger targets
      expect(box?.width).toBeGreaterThanOrEqual(56);
      expect(box?.height).toBeGreaterThanOrEqual(56);
    }
  });

  test('extra-large touch targets for tremor support (72px+)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/pain-entry?touchTargets=extra-large');
    
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const box = await button.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(72);
      expect(box?.height).toBeGreaterThanOrEqual(72);
    }
  });
});
```

### Layout Stability Under Stress

When touch targets grow, the layout shouldn't break:

```typescript
test('enlarged touch targets do not cause overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/pain-entry?crisis=emergency&touchTargets=extra-large');
  
  // Check for horizontal overflow
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  
  expect(hasHorizontalScroll).toBe(false);
  
  // Check that primary CTA is visible without scrolling
  const saveButton = page.locator('[data-testid="save-button"]');
  await expect(saveButton).toBeInViewport();
});
```

---

## Strategy 6: Animation and Motion Verification

`prefers-reduced-motion` should actually reduce motion. Let's verify:

```typescript
test.describe('Motion Preferences', () => {
  test('animations run in normal mode', async ({ page }) => {
    await page.goto('/pain-entry');
    
    // Trigger an animation (e.g., form submission feedback)
    await page.click('[data-testid="save-button"]');
    
    // Capture frames to detect animation
    const frames: Buffer[] = [];
    for (let i = 0; i < 5; i++) {
      frames.push(await page.screenshot());
      await page.waitForTimeout(100);
    }
    
    // At least some frames should differ (animation happening)
    let differences = 0;
    for (let i = 1; i < frames.length; i++) {
      if (Buffer.compare(frames[i], frames[i-1]) !== 0) {
        differences++;
      }
    }
    
    expect(differences).toBeGreaterThan(0); // Animation detected
  });

  test('animations disabled with reduced motion', async ({ page }) => {
    // Emulate prefers-reduced-motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/pain-entry');
    
    await page.click('[data-testid="save-button"]');
    
    const frames: Buffer[] = [];
    for (let i = 0; i < 5; i++) {
      frames.push(await page.screenshot());
      await page.waitForTimeout(100);
    }
    
    // Frames should be identical (no animation)
    let differences = 0;
    for (let i = 1; i < frames.length; i++) {
      if (Buffer.compare(frames[i], frames[i-1]) !== 0) {
        differences++;
      }
    }
    
    // Allow 1 difference for state change, but no animation
    expect(differences).toBeLessThanOrEqual(1);
  });

  test('emergency mode forces reduced motion', async ({ page }) => {
    // Even without system preference, emergency mode should be calm
    await page.goto('/pain-entry?crisis=emergency');
    
    const hasAnimations = await page.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);
      return style.getPropertyValue('--animation-duration') !== '0ms';
    });
    
    expect(hasAnimations).toBe(false);
  });
});
```

---

## CI Integration: Putting It All Together

### GitHub Actions Workflow

```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression Tests

on:
  pull_request:
    branches: [main]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Build app
        run: npm run build
      
      - name: Start preview server
        run: npm run preview &
        
      - name: Wait for server
        run: npx wait-on http://localhost:4173
      
      - name: Run visual regression tests
        run: npx playwright test --project=visual-regression
      
      - name: Upload diff artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-regression-diffs
          path: test-results/
          retention-days: 7

  contrast-audit:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      # ... setup steps ...
      
      - name: Run contrast verification
        run: npx playwright test --project=accessibility
      
      - name: Upload accessibility report
        uses: actions/upload-artifact@v4
        with:
          name: accessibility-report
          path: accessibility-reports/
```

### Playwright Config for Visual Testing

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  
  projects: [
    // Visual regression across viewports
    {
      name: 'visual-regression',
      testMatch: '**/visual-*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'visual-regression-mobile',
      testMatch: '**/visual-*.spec.ts',
      use: {
        ...devices['iPhone 13'],
      },
    },
    
    // Accessibility testing
    {
      name: 'accessibility',
      testMatch: '**/a11y-*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  
  // Screenshot comparison settings
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.1,
    },
  },
  
  // Retry flaky visual tests
  retries: 2,
});
```

---

## Common Failures and What They Mean

| Failure | Likely Cause | Fix |
|---------|--------------|-----|
| Screenshots identical when they should differ | CSS not applied, wrong selector | Check class application, specificity |
| Diff on every run | Dynamic content, timestamps, animations | Add `data-testid`, mock dates, disable animations in tests |
| Contrast check passes but looks wrong | Computed vs. rendered difference | Check for overlays, gradients, images |
| Touch targets correct but layout broken | Missing responsive styles | Add breakpoint-specific sizing |
| Accessibility tree wrong | Semantic HTML issues | Fix heading levels, landmark regions |

---

## The Visual Contract

Visual regression for adaptive interfaces is about enforcing a contract:

> **When the system says "emergency mode is active," the user should see and feel a meaningfully different experience.**

State tests verify the promise was made.
Visual tests verify the promise was kept.

Both are required.

---

## Resources

- [Playwright Visual Comparisons](https://playwright.dev/docs/test-snapshots)
- [Chromatic](https://www.chromatic.com/) — Storybook visual regression
- [axe-core](https://github.com/dequelabs/axe-core) — Accessibility testing
- [WCAG Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- Pain Tracker source: [github.com/CrisisCore-Systems/pain-tracker](https://github.com/CrisisCore-Systems/pain-tracker)

---

*Next in the series: "Offline Crisis Support: What Happens When the Network Dies at the Worst Moment"*

---

If your pages look anything like mine:
- In Canada, call or text **9-8-8**
- In the US, call or text **988**

You're not invisible. You're just in a state that needs different rendering.
