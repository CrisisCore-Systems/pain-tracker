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
  ACCESSIBILITY_SCREENSHOTS,
  ACCESSIBILITY_SCREENSHOT_CATEGORIES,
  getNonCompositeScreenshots,
  getCompositeScreenshots,
} from './accessibility-screenshot-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const SCREENSHOTS_BASE_DIR = join(ROOT_DIR, 'docs', 'screenshots', 'accessibility');

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
    } catch (error) {
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

    // Navigate to URL
    if (screenshot.url) {
      const baseUrl = 'http://localhost:3000';
      const fullUrl = screenshot.url.startsWith('http')
        ? screenshot.url
        : `${baseUrl}${screenshot.url}`;

      await page.goto(fullUrl, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      // Wait for content to settle
      await page.waitForTimeout(1000);
    }

    // Apply accessibility preferences
    if (screenshot.preferences) {
      await applyAccessibilityPreferences(page, screenshot.preferences);
      // Wait for preferences to take effect
      await page.waitForTimeout(1000);
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
