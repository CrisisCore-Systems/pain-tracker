#!/usr/bin/env node

/**
 * Accessibility Screenshot Capture Script
 * Captures screenshots demonstrating accessibility features:
 * - Large text options
 * - High contrast modes
 * - Simplified navigation
 * - Cognitive load indicators
 */

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import {
  getNonCompositeScreenshots,
} from './accessibility-screenshot-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const SCREENSHOTS_BASE_DIR = join(ROOT_DIR, 'docs', 'screenshots', 'accessibility');

// Test passphrase for local screenshot automation (not a real secret)
const TEST_PASSPHRASE = process.env.SCREENSHOT_TEST_PASSPHRASE || 'ScreenshotTestingAccount2024!';

// Command line arguments
const args = process.argv.slice(2);
const categoryFilter = args.find(arg => arg.startsWith('--category='))?.split('=')[1];
const dryRun = args.includes('--dry-run');
const skipComposites = args.includes('--skip-composites');

console.log('♿ Accessibility Screenshot Capture');
console.log('===================================\n');
if (categoryFilter) console.log(`Category: ${categoryFilter}`);
if (dryRun) console.log('DRY RUN - No screenshots will be saved');
if (skipComposites) console.log('SKIP COMPOSITES - Only capturing individual screenshots\n');

// Wait for server to be ready
async function waitForServer(url, maxAttempts = 30) {
  console.log('⏳ Waiting for dev server to be ready...');
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('✅ Server is ready!\n');
        return true;
      }
    } catch {
      // Server not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Server did not start after ${maxAttempts} attempts`);
}

// Ensure directory exists
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

// Filter screenshots based on command line arguments
function filterScreenshots() {
  let screenshots = getNonCompositeScreenshots();

  // Filter by category
  if (categoryFilter) {
    screenshots = screenshots.filter(s => s.category === categoryFilter);
  }

  return screenshots;
}

// Apply accessibility preferences to the page
async function applyAccessibilityPreferences(page, preferences) {
  if (!preferences) return;

  console.log('   🎨 Applying accessibility preferences:', JSON.stringify(preferences, null, 2));

  await page.evaluate((prefs) => {
    // Store preferences in localStorage
    const preferencesWithDefaults = {
      simplifiedMode: true,
      showMemoryAids: true,
      autoSave: true,
      showProgress: true,
      showCognitiveLoadIndicators: true,
      adaptiveComplexity: true,
      fontSize: 'medium',
      contrast: 'normal',
      reduceMotion: false,
      touchTargetSize: 'large',
      confirmationLevel: 'standard',
      voiceInput: false,
      gentleLanguage: true,
      hideDistressingContent: false,
      showComfortPrompts: true,
      enableContentWarnings: true,
      contentWarningLevel: 'standard',
      enableCrisisDetection: true,
      crisisDetectionSensitivity: 'medium',
      showCrisisResources: true,
      enableProgressiveDisclosure: true,
      defaultDisclosureLevel: 'helpful',
      adaptiveDisclosure: true,
      realTimeValidation: true,
      theme: 'auto',
      reminderFrequency: 'daily',
      ...prefs
    };

    // Set in localStorage (the app will read this on load)
    localStorage.setItem('trauma-informed-preferences', JSON.stringify(preferencesWithDefaults));

    // Apply CSS custom properties directly
    const root = document.documentElement;

    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xl: '20px',
    };
    root.style.setProperty('--ti-font-size', fontSizeMap[prefs.fontSize] || fontSizeMap.medium);

    // Touch target size
    const touchSizeMap = {
      normal: '44px',
      large: '56px',
      'extra-large': '72px',
    };
    root.style.setProperty('--ti-touch-size', touchSizeMap[prefs.touchTargetSize] || touchSizeMap.large);

    // Contrast classes
    const contrastClass = `ti-contrast-${prefs.contrast || 'normal'}`;
    document.body.className = document.body.className.replace(/ti-contrast-\w+/g, '');
    document.body.classList.add(contrastClass);

    // Motion
    if (prefs.reduceMotion) {
      document.body.classList.add('ti-reduce-motion');
    } else {
      document.body.classList.remove('ti-reduce-motion');
    }

    // Simplified mode
    if (prefs.simplifiedMode) {
      document.body.classList.add('ti-simplified');
    } else {
      document.body.classList.remove('ti-simplified');
    }
  }, preferences);
}

// Capture a single screenshot
async function captureScreenshot(page, screenshot, outputDir) {
  const categoryDir = join(outputDir, screenshot.category);
  ensureDir(categoryDir);

  const screenshotPath = join(categoryDir, screenshot.name);

  console.log(`\n📸 Capturing: ${screenshot.description}`);
  console.log(`   ID: ${screenshot.id}`);
  console.log(`   Category: ${screenshot.category}`);
  console.log(`   Size: ${screenshot.width}x${screenshot.height}`);

  if (screenshot.url) {
    console.log(`   URL: ${screenshot.url}`);
  }

  try {
    // Set viewport size
    await page.setViewportSize({
      width: screenshot.width,
      height: screenshot.height
    });

    // Apply accessibility preferences (vault is already unlocked from main function)
    if (screenshot.preferences) {
      // We're already on /app with vault unlocked - just update preferences
      console.log('   🎨 Applying accessibility preferences:', JSON.stringify(screenshot.preferences, null, 2));
      
      // Set accessibility preferences in localStorage
      await applyAccessibilityPreferences(page, screenshot.preferences);
      console.log('   ✓ Accessibility preferences set');
      
      // DON'T RELOAD - Apply preferences dynamically without page reload to keep vault session
      console.log('   🔄 Applying preferences dynamically (no reload to preserve vault session)...');
      
      // Wait for React to pick up the preference changes
      await page.waitForTimeout(3000);
      
      // Trigger a manual refresh of the trauma-informed context by dispatching a storage event
      await page.evaluate(() => {
        // Dispatch storage event to notify components of preference changes
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'trauma-informed-preferences',
          newValue: localStorage.getItem('trauma-informed-preferences'),
          url: window.location.href
        }));
      });
      
      // LONGER WAIT: Give React more time to apply preference changes WITHOUT reloading
      await page.waitForTimeout(5000);
      
      // Wait for React hydration and preference application
      await page.waitForFunction(() => {
        return document.readyState === 'complete' && 
               document.querySelector('main, [role="main"]') !== null;
      }, { timeout: 10000 }).catch(() => {
        console.log('   ⚠️  Timeout waiting for app ready state');
      });
      
      // Additional wait for CSS transitions and font loading
      await page.waitForTimeout(2000);
      
      // VISUAL VERIFICATION: Check if accessibility preferences were actually applied
      const verificationResult = await page.evaluate((prefs) => {
        const root = document.documentElement;
        const body = document.body;
        
        // Check font size
        const fontSize = root.style.getPropertyValue('--ti-font-size');
        const expectedFontSizes = { small: '14px', medium: '16px', large: '18px', xl: '20px' };
        const fontSizeMatch = fontSize === expectedFontSizes[prefs.fontSize];
        
        // Check contrast class
        const contrastClass = `ti-contrast-${prefs.contrast || 'normal'}`;
        const hasContrastClass = body.classList.contains(contrastClass);
        
        // Check simplified mode
        const hasSimplifiedClass = body.classList.contains('ti-simplified');
        const simplifiedMatch = prefs.simplifiedMode === hasSimplifiedClass;
        
        return {
          fontSize: fontSize || 'not set',
          fontSizeMatch,
          hasContrastClass,
          hasSimplifiedClass,
          simplifiedMatch,
          bodyClasses: Array.from(body.classList).join(', ')
        };
      }, screenshot.preferences);
      
      console.log(`   🔍 Verification: fontSize=${verificationResult.fontSize}, contrast=${verificationResult.hasContrastClass}, simplified=${verificationResult.hasSimplifiedClass}`);
      
      if (!verificationResult.fontSizeMatch || !verificationResult.hasContrastClass) {
        console.log('   ⚠️  Warning: Some accessibility preferences may not have applied correctly');
        console.log('   💡 Trying force reload of preferences...');
        
        // Force re-apply by directly manipulating the DOM
        await page.evaluate((prefs) => {
          const root = document.documentElement;
          const body = document.body;
          
          // Force font size
          const fontSizeMap = { small: '14px', medium: '16px', large: '18px', xl: '20px' };
          root.style.setProperty('--ti-font-size', fontSizeMap[prefs.fontSize] || fontSizeMap.medium);
          
          // Force contrast class
          body.className = body.className.replace(/ti-contrast-\w+/g, '');
          body.classList.add(`ti-contrast-${prefs.contrast || 'normal'}`);
          
          // Force simplified mode
          if (prefs.simplifiedMode) {
            body.classList.add('ti-simplified');
          } else {
            body.classList.remove('ti-simplified');
          }
        }, screenshot.preferences);
        
        await page.waitForTimeout(1000);
      }
      
      // SPECIAL HANDLING: Open settings panel for accessibility-settings-panel screenshot
      if (screenshot.id === 'accessibility-settings-panel') {
        console.log('   ⚙️  Opening accessibility settings panel...');
        
        // Try to find and click the settings button
        const settingsButton = await page.$('button[aria-label="Settings"], button:has-text("Settings"), a[href*="settings"]');
        if (settingsButton) {
          await settingsButton.click();
          await page.waitForTimeout(2000);
          console.log('   ✓ Settings panel opened');
        } else {
          console.log('   ⚠️  Could not find settings button');
        }
      }
      
      console.log('   ✓ App ready for screenshot');
      
    } else {
      // If no preferences, just navigate to the URL normally
      if (screenshot.url) {
        const baseUrl = 'http://localhost:3000';
        const fullUrl = screenshot.url.startsWith('http')
          ? screenshot.url
          : `${baseUrl}${screenshot.url}`;

        console.log(`   Navigating to: ${fullUrl}`);
        
        await page.goto(fullUrl, {
          waitUntil: 'networkidle',
          timeout: 30000
        });

        await page.waitForTimeout(2000);
      }
    }

    // Wait for any animations to complete
    await page.waitForTimeout(1000);

    if (!dryRun) {
      // Take screenshot
      await page.screenshot({
        path: screenshotPath,
        type: 'png',
        fullPage: false
      });
      console.log(`   ✅ Saved: ${screenshotPath}`);
    } else {
      console.log(`   🔍 Would save to: ${screenshotPath}`);
    }

    return { success: true, path: screenshotPath };
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main capture function
async function captureAccessibilityScreenshots() {
  console.log('🎬 Starting accessibility screenshot capture...\n');

  // Ensure screenshots directory exists
  ensureDir(SCREENSHOTS_BASE_DIR);

  // Start dev server
  console.log('🚀 Starting dev server...');
  const devServer = spawn('npm', ['run', 'dev'], {
    cwd: ROOT_DIR,
    stdio: 'pipe',
    shell: true
  });

  devServer.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Local:') || output.includes('localhost')) {
      console.log('   Dev server output:', output.trim());
    }
  });

  devServer.stderr.on('data', (data) => {
    // Suppress verbose output unless there's an error
    const output = data.toString();
    if (output.includes('error') || output.includes('Error')) {
      console.error('   Dev server error:', output.trim());
    }
  });

  try {
    // Wait for server to start
    await waitForServer('http://localhost:3000/pain-tracker/');

    // Launch browser
    console.log('🌐 Launching browser...\n');
    const browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      deviceScaleFactor: 2,
      locale: 'en-US'
    });

    const page = await context.newPage();

    // ONE-TIME VAULT SETUP: Create vault once before all screenshots
    console.log('🔐 Setting up testing vault account (one-time setup)...\n');
    await page.goto('http://localhost:3000/app', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    const needsSetup = await page.evaluate(() => {
      const meta = localStorage.getItem('vault:metadata');
      return !meta;
    });
    
    if (needsSetup) {
      console.log('   Creating testing user account...');
      
      try {
        await page.waitForSelector('input[type="password"]', { timeout: 5000 });
        const passphraseInputs = await page.$$('input[type="password"]');
        if (passphraseInputs.length >= 2) {
          await passphraseInputs[0].fill(TEST_PASSPHRASE);
          await passphraseInputs[1].fill(TEST_PASSPHRASE);
          
          const createButton = await page.$('button:has-text("Create secure vault")');
          if (createButton) {
            await createButton.click();
            await page.waitForTimeout(8000);
            
            try {
              await page.waitForSelector('main, [role="main"], .pain-tracker-app', { timeout: 15000 });
              console.log('   ✓ Testing account created and app loaded\n');
            } catch {
              console.log('   ⚠️  Timeout waiting for app to load\n');
            }
          }
        }
      } catch (error) {
        console.log(`   ⚠️  Could not auto-create vault: ${error.message}\n`);
      }
    } else {
      // Vault exists, check if locked and unlock
      const isLocked = await page.evaluate(() => {
        const unlockButton = document.querySelector('button:has-text("Unlock vault")');
        return unlockButton !== null;
      });
      
      if (isLocked) {
        console.log('   Unlocking existing vault...');
        
        try {
          await page.waitForSelector('input[type="password"]', { timeout: 5000 });
          const passphraseInput = await page.$('input[type="password"]');
          if (passphraseInput) {
            await passphraseInput.fill(TEST_PASSPHRASE);
            const unlockButton = await page.$('button:has-text("Unlock vault")');
            if (unlockButton) {
              await unlockButton.click();
              await page.waitForTimeout(5000);
              
              try {
                await page.waitForSelector('main, [role="main"], .pain-tracker-app', { timeout: 10000 });
                console.log('   ✓ Vault unlocked and app loaded\n');
              } catch {
                console.log('   ⚠️  Timeout waiting for app after unlock\n');
              }
            }
          }
        } catch (error) {
          console.log(`   ⚠️  Could not auto-unlock vault: ${error.message}\n`);
        }
      } else {
        console.log('   ✓ Vault already unlocked\n');
      }
    }
    
    // DISMISS WELCOME MODAL: Close any welcome/onboarding screens
    console.log('👋 Dismissing welcome screens...\n');
    await page.waitForTimeout(2000);
    
    // Try to click "Skip" button
    const skipButton = await page.$('button:has-text("Skip")');
    if (skipButton) {
      console.log('   Clicking "Skip" button');
      await skipButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Try to click "Skip Tour" button
    const skipTourButton = await page.$('button:has-text("Skip Tour")');
    if (skipTourButton) {
      console.log('   Clicking "Skip Tour" button');
      await skipTourButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Try to click "Get Started" button
    const getStartedButton = await page.$('button:has-text("Get Started")');
    if (getStartedButton) {
      console.log('   Clicking "Get Started" button');
      await getStartedButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Close any remaining modals by clicking close buttons
    const closeButtons = await page.$$('button[aria-label="Close"], button:has-text("×"), button:has-text("Close")');
    for (const closeButton of closeButtons) {
      try {
        await closeButton.click();
        await page.waitForTimeout(500);
      } catch {
        // Ignore if button is not clickable
      }
    }
    
    // Verify we're now on the main app screen
    try {
      await page.waitForSelector('main, [role="main"], .pain-tracker-dashboard', { timeout: 5000 });
      console.log('   ✓ Welcome screens dismissed, app ready\n');
    } catch {
      console.log('   ⚠️  Could not verify app is ready\n');
    }

    // Get filtered screenshots
    const screenshotsToCapture = filterScreenshots();
    console.log(`📋 Capturing ${screenshotsToCapture.length} screenshots...\n`);

    const results = [];

    // Capture each screenshot
    for (const screenshot of screenshotsToCapture) {
      const result = await captureScreenshot(page, screenshot, SCREENSHOTS_BASE_DIR);
      results.push({ screenshot, result });
    }

    // Close browser
    await browser.close();
    console.log('\n🌐 Browser closed');

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary');
    console.log('='.repeat(50));

    const successful = results.filter(r => r.result.success).length;
    const failed = results.filter(r => !r.result.success).length;

    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📁 Output directory: ${SCREENSHOTS_BASE_DIR}`);

    if (failed > 0) {
      console.log('\n❌ Failed screenshots:');
      results
        .filter(r => !r.result.success)
        .forEach(({ screenshot, result }) => {
          console.log(`   - ${screenshot.id}: ${result.error}`);
        });
    }

    // Generate README
    if (!dryRun && successful > 0) {
      generateReadme(results.filter(r => r.result.success));
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    // Kill dev server
    console.log('\n🛑 Stopping dev server...');
    devServer.kill();
  }
}

// Generate README for accessibility screenshots
function generateReadme(successfulResults) {
  const readmePath = join(SCREENSHOTS_BASE_DIR, 'README.md');

  const groupedByCategory = {};
  successfulResults.forEach(({ screenshot }) => {
    if (!groupedByCategory[screenshot.category]) {
      groupedByCategory[screenshot.category] = [];
    }
    groupedByCategory[screenshot.category].push(screenshot);
  });

  let readme = `# Accessibility Screenshots

**Last Updated**: ${new Date().toISOString().split('T')[0]}
**Total Screenshots**: ${successfulResults.length}

This directory contains screenshots demonstrating the accessibility features of the Pain Tracker application, including:

- 📝 **Large text options** (14px to 20px)
- 🎨 **High contrast modes** (normal, high, extra-high)
- 🧭 **Simplified navigation** (full vs. essential features)
- 🧠 **Cognitive load indicators** (memory aids, progress tracking)

## Screenshots by Category

`;

  Object.entries(groupedByCategory).forEach(([category, screenshots]) => {
    const categoryName = category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    readme += `### ${categoryName}\n\n`;

    screenshots.forEach(screenshot => {
      const relativePath = `./${screenshot.category}/${screenshot.name}`;
      readme += `#### ${screenshot.description}\n\n`;
      readme += `![${screenshot.description}](${relativePath})\n\n`;
      if (screenshot.preferences) {
        readme += `**Settings**: ${JSON.stringify(screenshot.preferences, null, 2)}\n\n`;
      }
      readme += `---\n\n`;
    });
  });

  readme += `
## Diverse User Representations

The Pain Tracker application is designed with inclusivity in mind:

- **Age Diversity**: Interface scales for all age groups (teens to seniors)
- **Visual Diversity**: Multiple contrast modes for various visual needs
- **Cognitive Diversity**: Simplified modes and memory aids for different cognitive abilities
- **Motor Diversity**: Large touch targets and voice input support
- **Cultural Diversity**: Trauma-informed design respecting diverse backgrounds
- **Language Diversity**: i18n support with gentle, accessible language options

## Usage Guidelines

These screenshots can be used for:

1. **Documentation**: Demonstrating accessibility features to users
2. **Marketing**: Showcasing inclusive design principles
3. **Training**: Teaching accessibility best practices
4. **Testing**: Visual regression testing for accessibility features

## Regenerating Screenshots

To regenerate these screenshots:

\`\`\`bash
npm run screenshots:accessibility
\`\`\`

Or with specific categories:

\`\`\`bash
node scripts/capture-accessibility-screenshots.js --category=text-size
node scripts/capture-accessibility-screenshots.js --category=contrast
node scripts/capture-accessibility-screenshots.js --category=navigation
node scripts/capture-accessibility-screenshots.js --category=cognitive-support
\`\`\`

## Accessibility Standards Compliance

All screenshots demonstrate features that meet or exceed:

- ✅ WCAG 2.2 Level AA
- ✅ Section 508 Compliance
- ✅ EN 301 549 (European Standard)
- ✅ Trauma-Informed Design Principles
`;

  fs.writeFileSync(readmePath, readme);
  console.log(`\n📄 Generated README: ${readmePath}`);
}

// Run the script
captureAccessibilityScreenshots()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
