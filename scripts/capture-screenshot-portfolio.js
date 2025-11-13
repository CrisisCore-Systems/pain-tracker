#!/usr/bin/env node

/**
 * Screenshot Portfolio Capture Script
 * Captures comprehensive screenshots for marketing, documentation, and social media
 */

import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { 
  SCREENSHOT_PORTFOLIO, 
  SCREENSHOT_CATEGORIES,
  getScreenshotsByPhase,
  getInfographicScreenshots
} from './screenshot-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const SCREENSHOTS_BASE_DIR = join(ROOT_DIR, 'public', 'screenshots');

// Command line arguments
const args = process.argv.slice(2);
const phase = args.find(arg => arg.startsWith('--phase='))?.split('=')[1] || 'all';
const categoryFilter = args.find(arg => arg.startsWith('--category='))?.split('=')[1];
const dryRun = args.includes('--dry-run');

console.log('📸 Screenshot Portfolio Capture');
console.log('================================\n');
console.log(`Phase: ${phase}`);
if (categoryFilter) console.log(`Category: ${categoryFilter}`);
if (dryRun) console.log('DRY RUN - No screenshots will be saved\n');

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
  let screenshots = [...SCREENSHOT_PORTFOLIO];

  // Filter by phase
  if (phase !== 'all') {
    screenshots = getScreenshotsByPhase(phase);
  }

  // Filter by category
  if (categoryFilter) {
    screenshots = screenshots.filter(s => s.category === categoryFilter);
  }

  return screenshots;
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
  
  if (screenshot.useCase) {
    console.log(`   Use Case: ${screenshot.useCase}`);
  }

  try {
    // Set viewport size
    await page.setViewportSize({ 
      width: screenshot.width, 
      height: screenshot.height 
    });

    // Handle special screenshot types
    if (screenshot.isInfographic) {
      console.log('   ℹ️  Infographic - requires manual creation');
      console.log(`   Caption: ${screenshot.caption}`);
      return { success: true, skipped: true, reason: 'infographic' };
    }

    if (screenshot.multiDevice) {
      console.log('   📱 Multi-device - requires composite creation');
      return { success: true, skipped: true, reason: 'multi-device' };
    }

    // Navigate to URL if specified
    if (screenshot.url) {
      await page.goto(screenshot.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Wait for content to settle
      await page.waitForTimeout(2000);
    }

    // Handle offline mode screenshots
    if (screenshot.requiresOfflineMode) {
      await page.context().setOffline(true);
      console.log('   🔌 Offline mode enabled');
      await page.waitForTimeout(1000);
    }

    if (!dryRun) {
      // Take screenshot
      await page.screenshot({ 
        path: screenshotPath,
        type: 'png'
      });
      console.log(`   ✅ Saved: ${screenshotPath}`);
    } else {
      console.log(`   🔍 Would save to: ${screenshotPath}`);
    }

    // Reset offline mode
    if (screenshot.requiresOfflineMode) {
      await page.context().setOffline(false);
    }

    return { success: true, skipped: false };
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Generate metadata file
function generateMetadata(screenshots, results) {
  const metadata = {
    generated: new Date().toISOString(),
    phase: phase,
    category: categoryFilter || 'all',
    screenshots: screenshots.map((screenshot, index) => ({
      ...screenshot,
      result: results[index]
    }))
  };

  const metadataPath = join(SCREENSHOTS_BASE_DIR, 'portfolio-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`\n📋 Metadata saved to: ${metadataPath}`);
}

// Generate README for screenshot portfolio
function generateReadme(screenshots) {
  const readmeContent = `# Screenshot Portfolio

This directory contains a comprehensive screenshot portfolio for the Pain Tracker application.

## 📁 Directory Structure

- **marketing/** - Marketing and promotional screenshots
- **technical/** - Technical architecture and privacy screenshots  
- **social/** - Social media optimized screenshots
- **documentation/** - Documentation and tutorial screenshots
- **wcb-forms/** - WorkSafe BC form preview screenshots

## 📸 Screenshot Inventory

### Phase 1 (Essential - Week 1)
${getScreenshotsByPhase('phase1').map(s => `- **${s.name}** - ${s.description}\n  - Use Case: ${s.useCase}\n  - Caption: "${s.caption}"`).join('\n\n')}

### Phase 2 (Growth - Weeks 2-3)
${getScreenshotsByPhase('phase2').map(s => `- **${s.name}** - ${s.description}\n  - Use Case: ${s.useCase}\n  - Caption: "${s.caption}"`).join('\n\n')}

### Phase 3 (Advanced - Month 1)
${getScreenshotsByPhase('phase3').map(s => `- **${s.name}** - ${s.description}\n  - Use Case: ${s.useCase}\n  - Caption: "${s.caption}"`).join('\n\n')}

## 🎨 Manual Creation Required

The following screenshots require manual creation as infographics or composites:

${getInfographicScreenshots().map(s => `- **${s.name}** - ${s.description}`).join('\n')}

## 📐 Standard Sizes

- **Social Media Share**: 1200x630px (Open Graph / Twitter Card)
- **Instagram Post**: 1080x1080px (Square)
- **Instagram Story**: 1080x1920px (Vertical)
- **PWA Narrow**: 540x720px (Mobile)
- **PWA Wide**: 1280x720px (Desktop)

## 🔄 Regenerating Screenshots

To regenerate all screenshots:
\`\`\`bash
npm run screenshots:portfolio
\`\`\`

To regenerate specific phases:
\`\`\`bash
npm run screenshots:portfolio -- --phase=phase1
npm run screenshots:portfolio -- --phase=phase2
npm run screenshots:portfolio -- --phase=phase3
\`\`\`

To regenerate specific categories:
\`\`\`bash
npm run screenshots:portfolio -- --category=marketing
npm run screenshots:portfolio -- --category=technical
npm run screenshots:portfolio -- --category=social
\`\`\`

## 📊 Usage Guidelines

- All screenshots are optimized for 2x device pixel ratio (Retina displays)
- PNG format for transparency and quality
- Captions provided for each screenshot for consistent messaging
- Organized by use case for easy discovery

## 🤝 Contributing

When adding new screenshots:
1. Add configuration to \`scripts/screenshot-config.js\`
2. Assign appropriate phase and category
3. Include caption and use case
4. Run the capture script
5. Update this README

---

*Last updated: ${new Date().toLocaleDateString()}*
`;

  const readmePath = join(SCREENSHOTS_BASE_DIR, 'PORTFOLIO.md');
  fs.writeFileSync(readmePath, readmeContent);
  console.log(`📖 Portfolio documentation saved to: ${readmePath}`);
}

// Main function
async function captureScreenshotPortfolio() {
  // Filter screenshots
  const screenshots = filterScreenshots();
  
  if (screenshots.length === 0) {
    console.log('❌ No screenshots match the filters');
    return;
  }

  console.log(`📋 Will capture ${screenshots.length} screenshots\n`);

  // Ensure base directory exists
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
    if (output.includes('Local:') && !dryRun) {
      console.log('   Server output:', output.trim());
    }
  });

  try {
    // Wait for server to start
    await waitForServer('http://localhost:3000/pain-tracker/');

    // Launch browser
    console.log('🌐 Launching browser...');
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const context = await browser.newContext({
      deviceScaleFactor: 2, // Retina display
      locale: 'en-US'
    });

    const page = await context.newPage();

    // Capture each screenshot
    const results = [];
    for (const screenshot of screenshots) {
      const result = await captureScreenshot(page, screenshot, SCREENSHOTS_BASE_DIR);
      results.push(result);
    }

    await browser.close();

    // Generate metadata
    if (!dryRun) {
      generateMetadata(screenshots, results);
      generateReadme(SCREENSHOT_PORTFOLIO);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Capture Summary');
    console.log('='.repeat(50));
    
    const successful = results.filter(r => r.success && !r.skipped).length;
    const skipped = results.filter(r => r.skipped).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`✅ Successful: ${successful}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📸 Total: ${results.length}`);
    
    if (skipped > 0) {
      console.log('\nℹ️  Skipped screenshots require manual creation:');
      screenshots.forEach((s, i) => {
        if (results[i].skipped) {
          console.log(`   - ${s.name} (${results[i].reason})`);
        }
      });
    }

    console.log('\n✅ Screenshot portfolio capture complete!\n');

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
captureScreenshotPortfolio().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
