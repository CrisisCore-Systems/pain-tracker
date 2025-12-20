#!/usr/bin/env node
/**
 * Pre-Deployment Validation Script
 * Runs all necessary checks before deploying to any environment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const icon = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: '🔍',
  rocket: '🚀',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`${icon.info} ${description}...`, colors.cyan);
  try {
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    log(`${icon.success} ${description} passed`, colors.green);
    return true;
  } catch {
    log(`${icon.error} ${description} failed`, colors.red);
    return false;
  }
}

function checkFile(filePath, description) {
  log(`${icon.info} Checking ${description}...`, colors.cyan);
  if (fs.existsSync(filePath)) {
    log(`${icon.success} ${description} exists`, colors.green);
    return true;
  } else {
    log(`${icon.error} ${description} not found: ${filePath}`, colors.red);
    return false;
  }
}

function checkManifestAssets() {
  log(`${icon.info} Validating manifest.json assets...`, colors.cyan);
  
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    log(`${icon.error} manifest.json not found`, colors.red);
    return false;
  }
  
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  let allAssetsExist = true;
  
  // Check icons
  if (manifest.icons) {
    for (const icon of manifest.icons) {
      const assetPath = path.join(process.cwd(), 'public', icon.src);
      if (!fs.existsSync(assetPath)) {
        log(`${icon.error} Missing icon: ${icon.src}`, colors.red);
        allAssetsExist = false;
      }
    }
  }
  
  if (allAssetsExist) {
    log(`${icon.success} All manifest assets exist`, colors.green);
  }
  
  return allAssetsExist;
}

async function main() {
  log(`\n${icon.rocket} ${colors.bold}Pre-Deployment Validation${colors.reset}\n`, colors.blue);
  
  const checks = [];
  
  // Environment checks
  log(`\n${colors.bold}Environment Checks${colors.reset}`, colors.blue);
  checks.push(checkFile('.env.example', '.env.example'));
  checks.push(checkFile('package.json', 'package.json'));
  checks.push(checkFile('vite.config.ts', 'vite.config.ts'));
  
  // Asset checks
  log(`\n${colors.bold}Asset Checks${colors.reset}`, colors.blue);
  checks.push(checkFile('public/manifest.json', 'PWA manifest'));
  checks.push(checkFile('public/favicon.svg', 'favicon.svg'));
  checks.push(checkFile('public/apple-touch-icon.png', 'apple-touch-icon.png'));
  checks.push(checkManifestAssets());
  
  // Security checks
  log(`\n${colors.bold}Security Checks${colors.reset}`, colors.blue);
  checks.push(runCommand('npm run scan-secrets', 'Secret scanning'));
  
  // Build checks
  log(`\n${colors.bold}Build Checks${colors.reset}`, colors.blue);
  checks.push(runCommand('npm run typecheck', 'TypeScript type checking'));
  checks.push(runCommand('npm run build', 'Production build'));
  
  // Deployment configuration
  log(`\n${colors.bold}Deployment Configuration${colors.reset}`, colors.blue);
  checks.push(runCommand('npm run deploy:validate', 'Deployment validation'));
  
  // Summary
  log(`\n${colors.bold}Validation Summary${colors.reset}`, colors.blue);
  const passed = checks.filter(Boolean).length;
  const total = checks.length;
  
  if (passed === total) {
    log(`\n${icon.success} ${colors.green}${colors.bold}All checks passed (${passed}/${total})${colors.reset}`, colors.green);
    log(`${icon.rocket} Ready for deployment!\n`, colors.green);
    process.exit(0);
  } else {
    const failed = total - passed;
    log(`\n${icon.error} ${colors.red}${colors.bold}${failed} check(s) failed (${passed}/${total} passed)${colors.reset}`, colors.red);
    log(`${icon.warning} Fix the issues above before deploying\n`, colors.yellow);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Validation error:', error);
  process.exit(1);
});
