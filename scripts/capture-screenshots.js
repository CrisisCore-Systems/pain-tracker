#!/usr/bin/env node

/**
 * Screenshot Capture Script
 * Captures live screenshots of the running application for PWA manifest
 */

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const SCREENSHOTS_DIR = join(ROOT_DIR, 'public', 'screenshots');

const SCREENSHOTS = [
  {
    name: 'dashboard-540x720.png',
    url: 'http://localhost:3000/pain-tracker/',
    width: 540,
    height: 720,
    description: 'Narrow (mobile) screenshot of dashboard'
  },
  {
    name: 'analytics-1280x720.png',
    url: 'http://localhost:3000/pain-tracker/dashboard',
    width: 1280,
    height: 720,
    description: 'Wide (desktop) screenshot of analytics'
  }
];

// Wait for server to be ready
async function waitForServer(url, maxAttempts = 30) {
  console.log('⏳ Waiting for dev server to be ready...');
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('✅ Server is ready!');
        return true;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Server did not start after ${maxAttempts} attempts`);
}

async function captureScreenshots() {
  console.log('🎬 Starting screenshot capture...\n');
  
  // Ensure screenshots directory exists
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  // Start dev server
  console.log('🚀 Starting dev server...');
  const devServer = spawn('npm', ['run', 'dev'], {
    cwd: ROOT_DIR,
    stdio: 'pipe',
    shell: true
  });

  try {
    // Wait for server to start
    await waitForServer('http://localhost:3000/pain-tracker/');

    // Launch browser
    console.log('🌐 Launching browser...\n');
    const browser = await chromium.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext({
      deviceScaleFactor: 2, // Retina display
      locale: 'en-US'
    });

    // Capture each screenshot
    for (const screenshot of SCREENSHOTS) {
      console.log(`📸 Capturing: ${screenshot.description}`);
      console.log(`   URL: ${screenshot.url}`);
      console.log(`   Size: ${screenshot.width}x${screenshot.height}`);

      const page = await context.newPage();
      await page.setViewportSize({ 
        width: screenshot.width, 
        height: screenshot.height 
      });

      try {
        // Navigate to the page
        await page.goto(screenshot.url, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });

        // Wait a bit for any animations to complete
        await page.waitForTimeout(2000);

        // Take screenshot
        const screenshotPath = join(SCREENSHOTS_DIR, screenshot.name);
        await page.screenshot({ 
          path: screenshotPath,
          type: 'png'
        });

        console.log(`   ✅ Saved: ${screenshotPath}\n`);
      } catch (error) {
        console.error(`   ❌ Failed to capture ${screenshot.name}:`, error.message);
      } finally {
        await page.close();
      }
    }

    await browser.close();
    console.log('✅ All screenshots captured successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    // Stop dev server
    console.log('🛑 Stopping dev server...');
    devServer.kill('SIGTERM');
    
    // Give it a moment to clean up
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run the script
captureScreenshots().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
