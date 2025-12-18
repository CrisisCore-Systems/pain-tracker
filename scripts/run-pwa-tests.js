#!/usr/bin/env node

/**
 * PWA Cross-Browser Test Runner
 * 
 * This script runs all PWA tests across multiple browsers and generates
 * a comprehensive test execution report.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
    return { success: true, output: result };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout || error.stderr || '',
    };
  }
}

async function main() {
  log('═══════════════════════════════════════════════════════', 'cyan');
  log('   PWA Cross-Browser Testing Suite', 'cyan');
  log('═══════════════════════════════════════════════════════', 'cyan');
  console.log();

  const browsers = ['chromium', 'firefox', 'webkit'];
  const testFiles = [
    'pwa-service-worker.spec.ts',
    'pwa-offline.spec.ts',
    'pwa-install.spec.ts',
    'pwa-caching.spec.ts',
    'pwa-background-sync.spec.ts',
    'pwa-performance-security.spec.ts',
  ];

  const results = {
    timestamp: new Date().toISOString(),
    browsers: {},
    summary: {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
    },
  };

  // Ensure results directory exists
  const resultsDir = path.join(__dirname, '..', 'e2e', 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  log('📋 Test Configuration:', 'blue');
  log(`   Browsers: ${browsers.join(', ')}`, 'blue');
  log(`   Test Files: ${testFiles.length}`, 'blue');
  console.log();

  // Check if Playwright browsers are installed
  log('🔍 Checking Playwright installation...', 'yellow');
  const checkInstall = execCommand('npx playwright --version', { silent: true });
  
  if (!checkInstall.success) {
    log('❌ Playwright not found. Installing...', 'red');
    execCommand('npx playwright install --with-deps');
  } else {
    log(`✅ Playwright installed: ${checkInstall.output.trim()}`, 'green');
  }
  console.log();

  // Run tests for each browser
  for (const browser of browsers) {
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'cyan');
    log(`🌐 Testing on ${browser.toUpperCase()}`, 'cyan');
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'cyan');
    console.log();

    results.browsers[browser] = {
      testFiles: {},
      summary: {
        passed: 0,
        failed: 0,
        skipped: 0,
      },
    };

    for (const testFile of testFiles) {
      log(`   📝 Running ${testFile}...`, 'yellow');

      const command = `npx playwright test e2e/tests/${testFile} --project=${browser} --reporter=json`;
      const result = execCommand(command, { silent: true });

      const testResult = {
        file: testFile,
        browser: browser,
        success: result.success,
        timestamp: new Date().toISOString(),
      };

      if (result.success) {
        log(`   ✅ ${testFile} passed`, 'green');
        results.browsers[browser].summary.passed++;
      } else {
        log(`   ❌ ${testFile} failed`, 'red');
        results.browsers[browser].summary.failed++;
        testResult.error = result.error;
      }

      results.browsers[browser].testFiles[testFile] = testResult;
      console.log();
    }

    // Update overall summary
    results.summary.passed += results.browsers[browser].summary.passed;
    results.summary.failed += results.browsers[browser].summary.failed;
    results.summary.skipped += results.browsers[browser].summary.skipped;
  }

  results.summary.totalTests =
    results.summary.passed + results.summary.failed + results.summary.skipped;

  // Generate summary report
  log('═══════════════════════════════════════════════════════', 'cyan');
  log('   Test Execution Summary', 'cyan');
  log('═══════════════════════════════════════════════════════', 'cyan');
  console.log();

  log(`📊 Overall Results:`, 'blue');
  log(`   Total Tests: ${results.summary.totalTests}`, 'blue');
  log(`   ✅ Passed: ${results.summary.passed}`, 'green');
  log(`   ❌ Failed: ${results.summary.failed}`, 'red');
  log(`   ⏭️  Skipped: ${results.summary.skipped}`, 'yellow');
  console.log();

  log(`📊 Browser Breakdown:`, 'blue');
  for (const browser of browsers) {
    const browserResults = results.browsers[browser].summary;
    log(`   ${browser}:`, 'blue');
    log(`      ✅ ${browserResults.passed} passed`, 'green');
    log(`      ❌ ${browserResults.failed} failed`, 'red');
    log(`      ⏭️  ${browserResults.skipped} skipped`, 'yellow');
  }
  console.log();

  // Save detailed results
  const reportPath = path.join(resultsDir, 'pwa-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  log(`💾 Detailed results saved to: ${reportPath}`, 'green');
  console.log();

  // Generate markdown report
  const markdownReport = generateMarkdownReport(results);
  const mdReportPath = path.join(resultsDir, 'pwa-test-report.md');
  fs.writeFileSync(mdReportPath, markdownReport);
  log(`📄 Markdown report saved to: ${mdReportPath}`, 'green');
  console.log();

  // Exit with appropriate code
  if (results.summary.failed > 0) {
    log('❌ Some tests failed. Please review the results.', 'red');
    process.exit(1);
  } else {
    log('✅ All tests passed!', 'green');
    process.exit(0);
  }
}

function generateMarkdownReport(results) {
  const lines = [];

  lines.push('# PWA Cross-Browser Test Execution Report');
  lines.push('');
  lines.push(`**Generated**: ${new Date(results.timestamp).toLocaleString()}`);
  lines.push('');

  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('|--------|-------|');
  lines.push(`| Total Tests | ${results.summary.totalTests} |`);
  lines.push(`| ✅ Passed | ${results.summary.passed} |`);
  lines.push(`| ❌ Failed | ${results.summary.failed} |`);
  lines.push(`| ⏭️ Skipped | ${results.summary.skipped} |`);
  lines.push('');

  lines.push('## Browser Results');
  lines.push('');

  for (const [browser, data] of Object.entries(results.browsers)) {
    lines.push(`### ${browser.charAt(0).toUpperCase() + browser.slice(1)}`);
    lines.push('');
    lines.push('| Test File | Status |');
    lines.push('|-----------|--------|');

    for (const [file, result] of Object.entries(data.testFiles)) {
      const status = result.success ? '✅ Passed' : '❌ Failed';
      lines.push(`| ${file} | ${status} |`);
    }

    lines.push('');
    lines.push(`**Summary**: ${data.summary.passed} passed, ${data.summary.failed} failed, ${data.summary.skipped} skipped`);
    lines.push('');
  }

  lines.push('## Browser Compatibility Matrix');
  lines.push('');
  lines.push('| Feature | Chrome | Firefox | Safari |');
  lines.push('|---------|--------|---------|--------|');
  lines.push('| Service Worker | ✅ | ✅ | ✅ |');
  lines.push('| Offline Caching | ✅ | ✅ | ✅ |');
  lines.push('| Install Prompt | ✅ | ⚠️ | ⚠️ |');
  lines.push('| Background Sync | ✅ | ⚠️ | ❌ |');
  lines.push('| Push Notifications | ✅ | ✅ | ⚠️ |');
  lines.push('');

  lines.push('## Notes');
  lines.push('');
  lines.push('- ✅ Full support');
  lines.push('- ⚠️ Limited support or browser-specific implementation');
  lines.push('- ❌ Not supported');
  lines.push('');

  return lines.join('\n');
}

// Run the main function
main().catch((error) => {
  log(`❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
