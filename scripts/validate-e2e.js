#!/usr/bin/env node
/**
 * E2E Test Setup Validation Script
 * Validates that all e2e testing infrastructure is properly configured
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFile(path, description) {
  const exists = existsSync(resolve(path));
  log(`${exists ? icons.success : icons.error} ${description}: ${path}`, 
      exists ? colors.green : colors.red);
  return exists;
}

function checkCommand(command, description) {
  try {
    execSync(command, { stdio: 'ignore' });
    log(`${icons.success} ${description}`, colors.green);
    return true;
  } catch (error) {
    log(`${icons.error} ${description}`, colors.red);
    return false;
  }
}

function checkPackageScript(scriptName) {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    const hasScript = packageJson.scripts && packageJson.scripts[scriptName];
    log(`${hasScript ? icons.success : icons.error} npm script "${scriptName}"`, 
        hasScript ? colors.green : colors.red);
    return hasScript;
  } catch (error) {
    log(`${icons.error} Error reading package.json`, colors.red);
    return false;
  }
}

function validateE2ESetup() {
  log(`${icons.info} ${colors.bold}Validating E2E Test Setup${colors.reset}`, colors.blue);
  console.log();

  const results = {
    files: 0,
    commands: 0,
    scripts: 0,
    total: 0
  };

  // Check required files
  log('📁 Checking Configuration Files:', colors.blue);
  const files = [
    ['playwright.config.ts', 'Playwright configuration'],
    ['tests/e2e/fixtures/index.ts', 'Test fixtures'],
    ['tests/e2e/pages/PainTrackerPage.ts', 'Page object model'],
    ['tests/e2e/utils/TestUtils.ts', 'Test utilities'],
    ['tests/e2e/README.md', 'E2E documentation'],
    ['.github/workflows/e2e-tests.yml', 'GitHub Actions workflow']
  ];

  files.forEach(([path, desc]) => {
    if (checkFile(path, desc)) results.files++;
    results.total++;
  });

  console.log();

  // Check test files
  log('🧪 Checking Test Files:', colors.blue);
  const testFiles = [
    ['tests/e2e/pain-tracker-core.spec.ts', 'Core functionality tests'],
    ['tests/e2e/analytics-export.spec.ts', 'Analytics and export tests'],
    ['tests/e2e/accessibility.spec.ts', 'Accessibility tests'],
    ['tests/e2e/error-handling.spec.ts', 'Error handling tests'],
    ['tests/e2e/cross-platform.spec.ts', 'Cross-platform tests'],
    ['tests/e2e/user-journey.spec.ts', 'User journey tests'],
    ['tests/e2e/api-integration.spec.ts', 'API integration tests']
  ];

  testFiles.forEach(([path, desc]) => {
    if (checkFile(path, desc)) results.files++;
    results.total++;
  });

  console.log();

  // Check npm scripts
  log('📜 Checking NPM Scripts:', colors.blue);
  const scripts = [
    'test:e2e',
    'test:e2e:ui',
    'test:e2e:headed',
    'test:e2e:debug',
    'test:e2e:report'
  ];

  scripts.forEach(script => {
    if (checkPackageScript(script)) results.scripts++;
    results.total++;
  });

  console.log();

  // Check dependencies
  log('📦 Checking Dependencies:', colors.blue);
  const commands = [
    ['npx playwright --version', 'Playwright CLI'],
    ['npm list @playwright/test --depth=0', 'Playwright test package']
  ];

  commands.forEach(([cmd, desc]) => {
    if (checkCommand(cmd, desc)) results.commands++;
    results.total++;
  });

  console.log();

  // Summary
  const passed = results.files + results.scripts + results.commands;
  const passRate = Math.round((passed / results.total) * 100);
  
  log(`${colors.bold}Summary:${colors.reset}`, colors.blue);
  log(`${icons.info} Total checks: ${results.total}`);
  log(`${passed === results.total ? icons.success : icons.warning} Passed: ${passed}/${results.total} (${passRate}%)`, 
      passed === results.total ? colors.green : colors.yellow);

  if (passed === results.total) {
    log(`\n${icons.success} ${colors.bold}E2E test setup is complete!${colors.reset}`, colors.green);
    log(`\nNext steps:`, colors.blue);
    log(`  • Install browsers: ${colors.yellow}npx playwright install${colors.reset}`);
    log(`  • Run tests: ${colors.yellow}npm run test:e2e${colors.reset}`);
    log(`  • View UI: ${colors.yellow}npm run test:e2e:ui${colors.reset}`);
  } else {
    log(`\n${icons.warning} ${colors.bold}Setup incomplete${colors.reset}`, colors.yellow);
    log(`Please address the missing items above.`, colors.yellow);
  }

  return passed === results.total;
}

function showUsage() {
  log(`\n${colors.bold}Available E2E Test Commands:${colors.reset}`, colors.blue);
  
  const commands = [
    ['npm run test:e2e', 'Run all e2e tests'],
    ['npm run test:e2e:ui', 'Run tests in UI mode'],
    ['npm run test:e2e:headed', 'Run tests in headed mode (visible browser)'],
    ['npm run test:e2e:debug', 'Run tests in debug mode'],
    ['npm run test:e2e:report', 'View test report'],
    ['npx playwright install', 'Install browser binaries'],
    ['npx playwright codegen', 'Generate test code interactively']
  ];

  commands.forEach(([cmd, desc]) => {
    log(`  ${colors.yellow}${cmd.padEnd(30)}${colors.reset}${desc}`);
  });

  log(`\n${colors.bold}Test Files Organization:${colors.reset}`, colors.blue);
  log(`  tests/e2e/                    # E2E test directory`);
  log(`  ├── fixtures/                 # Test fixtures and data`);
  log(`  ├── pages/                    # Page object models`);
  log(`  ├── utils/                    # Test utilities`);
  log(`  ├── *.spec.ts                 # Test files`);
  log(`  └── README.md                 # Documentation`);
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = validateE2ESetup();
  
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    showUsage();
  }
  
  process.exit(success ? 0 : 1);
}

export { validateE2ESetup };