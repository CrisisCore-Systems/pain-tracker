# End-to-End Testing Suite

## Overview

This directory contains automated end-to-end tests for the Pain Tracker application, including comprehensive PWA (Progressive Web App) cross-browser testing.

## Test Suites

### Regular E2E Tests
- **`tests/pain-entry-form.spec.ts`**: Form interaction and data persistence
- **`accessibility.spec.ts`**: Accessibility checks (a11y regressions)

### PWA Test Suite ⭐ NEW!

Comprehensive PWA testing across Chrome, Firefox, and Safari:

1. **`tests/pwa-service-worker.spec.ts`** - Service worker registration, caching, versioning
2. **`tests/pwa-offline.spec.ts`** - Offline functionality and data persistence
3. **`tests/pwa-install.spec.ts`** - Install prompts and manifest validation
4. **`tests/pwa-caching.spec.ts`** - Cache strategies and management
5. **`tests/pwa-background-sync.spec.ts`** - Background synchronization
6. **`tests/pwa-performance-security.spec.ts`** - Performance and security validation

## Quick Start

### Prerequisites

```bash
# Install dependencies (from project root)
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Run ALL e2e tests
npm run e2e

# Run ONLY PWA tests across all browsers
npm run e2e:pwa

# Run PWA tests on specific browser
npm run e2e:pwa:chromium
npm run e2e:pwa:firefox
npm run e2e:pwa:webkit

# Generate comprehensive PWA test report
npm run e2e:pwa:report

# Debug mode
npm run e2e:debug
```

## Browser Support Matrix

| Browser | Desktop | Mobile | PWA Support | Background Sync |
|---------|---------|--------|-------------|-----------------|
| Chrome/Chromium | ✅ Full | ✅ Full | ✅ Full | ✅ Yes |
| Firefox | ✅ Full | ✅ Full | ✅ Good | ⚠️ Limited |
| Safari/WebKit | ✅ Good | ⚠️ iOS 11.3+ | ✅ Good | ❌ No |

## Documentation

- **📋 PWA Test Execution Report**: [PWA_TEST_EXECUTION_REPORT.md](./PWA_TEST_EXECUTION_REPORT.md)
- **📖 PWA Implementation Guide**: [../docs/ops/PWA-IMPLEMENTATION.md](../docs/ops/PWA-IMPLEMENTATION.md)
- **📊 PWA Browser Test Plan**: [../docs/ops/PWA_BROWSER_TEST_PLAN.md](../docs/ops/PWA_BROWSER_TEST_PLAN.md)

## Viewing Results

```bash
# HTML report
npx playwright show-report e2e/results/html-report

# PWA test results
cat e2e/results/pwa-test-report.md

# JSON results
cat e2e/results/test-results.json
```

## Windows-Specific Setup

If you're on Windows and encounter `canvas` build errors:

```powershell
npm run bootstrap-windows
```

See `docs/ops/CANVAS_WINDOWS_PREREQS.md` for details.

## CI/CD Integration

The Playwright config starts a Vite dev server automatically if one is not found.

```yaml
# Example GitHub Actions workflow
- run: npx playwright install --with-deps
- run: npm run e2e:pwa
- uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: e2e/results/
```

## Troubleshooting

### Service Worker Not Registering
- Ensure HTTPS or localhost
- Check `public/sw.js` exists
- Clear browser cache

### Tests Timing Out
- Increase timeout: `test.setTimeout(180000)`
- Check network and server responsiveness

### Cache Failures
- Clear all caches before tests
- Verify service worker version
- Check cache naming

For more troubleshooting, see [PWA_TEST_EXECUTION_REPORT.md](./PWA_TEST_EXECUTION_REPORT.md).

---

**Last Updated**: 2025-11-16  
**Maintained By**: Development Team
