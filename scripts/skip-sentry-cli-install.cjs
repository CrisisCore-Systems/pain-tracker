#!/usr/bin/env node

/**
 * Android/Termux Sentry CLI Configuration Helper
 * 
 * This script detects Android/Termux environments and configures npm to skip
 * Sentry CLI installation, preventing installation failures on unsupported platforms.
 */

/* eslint-env node */
/* global process, console */

'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * Detects if we're running on Android/Termux environment
 * @returns {boolean} true if Android/Termux detected
 */
function isAndroidTermux() {
  // Check for Termux-specific environment variables
  if (process.env.TERMUX_VERSION || process.env.ANDROID_ROOT || process.env.PREFIX) {
    return true;
  }

  // Check if HOME path contains termux (common in Termux environments)
  const home = process.env.HOME || '';
  if (home.includes('termux') || home.includes('/data/data/com.termux')) {
    return true;
  }

  // Check for Android-specific paths
  if (process.env.ANDROID_DATA || process.env.ANDROID_STORAGE) {
    return true;
  }

  // Check platform - some Android environments report as 'linux'
  // but have Android-specific characteristics
  if (os.platform() === 'linux') {
    // Additional Android/Termux indicators
    const paths = ['/system/bin/app_process', '/system/bin/toolbox'];
    try {
      for (const androidPath of paths) {
        if (fs.existsSync(androidPath)) {
          return true;
        }
      }
    } catch (e) {
      // Ignore file system errors
      void e; // Mark as used to satisfy linter
    }
  }

  return false;
}

/**
 * Configures npm to skip Sentry CLI download if on Android/Termux
 */
function configureSentrySkip() {
  const npmrcPath = path.join(process.cwd(), '.npmrc');
  const sentrySkipConfig = 'sentrycli_skip_download=true\n';
  
  try {
    let npmrcContent = '';
    if (fs.existsSync(npmrcPath)) {
      npmrcContent = fs.readFileSync(npmrcPath, 'utf8');
    }
    
    // Only add if not already present
    if (!npmrcContent.includes('sentrycli_skip_download')) {
      fs.writeFileSync(npmrcPath, npmrcContent + sentrySkipConfig, 'utf8');
      console.log('✓ Added Sentry CLI skip configuration to .npmrc');
    }
  } catch (e) {
    console.log('Warning: Could not write to .npmrc:', e.message);
  }
}

/**
 * Removes Sentry CLI skip configuration for supported platforms
 */
function removeSentrySkip() {
  const npmrcPath = path.join(process.cwd(), '.npmrc');
  
  try {
    if (fs.existsSync(npmrcPath)) {
      let npmrcContent = fs.readFileSync(npmrcPath, 'utf8');
      
      // Remove the sentrycli skip line
      npmrcContent = npmrcContent
        .split('\n')
        .filter(line => !line.includes('sentrycli_skip_download'))
        .join('\n');
      
      fs.writeFileSync(npmrcPath, npmrcContent, 'utf8');
    }
  } catch (e) {
    // Ignore errors when removing
    void e; // Mark as used to satisfy linter
  }
}

/**
 * Main execution function
 */
function main() {
  console.log('Pain Tracker: Configuring Sentry CLI for platform compatibility...');

  if (isAndroidTermux()) {
    console.log('✓ Android/Termux environment detected');
    console.log('✓ Configuring npm to skip Sentry CLI download for platform compatibility');
    
    // Set environment variable for this process
    process.env.SENTRYCLI_SKIP_DOWNLOAD = '1';
    
    // Configure .npmrc for future installs
    configureSentrySkip();
    
    console.log('✓ Sentry CLI will be skipped - application will work without source map features');
    console.log('✓ This allows npm install to succeed on Android/Termux');
  } else {
    console.log('✓ Standard platform detected - Sentry CLI will install normally');
    
    // Clean up any skip configuration from previous Android/Termux usage
    removeSentrySkip();
    
    console.log('✓ Full Sentry CLI functionality will be available');
  }
  
  process.exit(0);
}

// Only run if this script is executed directly (not required)
if (require.main === module) {
  main();
}

module.exports = {
  isAndroidTermux,
  configureSentrySkip,
  removeSentrySkip,
  main
};