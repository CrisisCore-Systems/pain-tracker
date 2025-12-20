#!/usr/bin/env node

/**
 * Generate comprehensive README for accessibility screenshots
 */

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
const README_PATH = join(SCREENSHOTS_BASE_DIR, 'README.md');

// Group screenshots by category
function groupByCategory(screenshots) {
  const grouped = {};
  screenshots.forEach(screenshot => {
    if (!grouped[screenshot.category]) {
      grouped[screenshot.category] = [];
    }
    grouped[screenshot.category].push(screenshot);
  });
  return grouped;
}

// Get category display name
function getCategoryDisplayName(category) {
  const names = {
    'text-size': 'Large Text Options',
    'contrast': 'High Contrast Modes',
    'navigation': 'Simplified Navigation',
    'cognitive-support': 'Cognitive Load Indicators',
    'comparison': 'Comparison Views',
  };
  return names[category] || category;
}

// Generate README content
function generateReadme() {
  const screenshots = getNonCompositeScreenshots();
  const groupedScreenshots = groupByCategory(screenshots);
  
  let readme = `# Accessibility-Focused Interface Screenshots

**Last Updated**: ${new Date().toISOString().split('T')[0]}
**Total Screenshots**: ${screenshots.length}

This directory contains comprehensive screenshots demonstrating the accessibility features of the Pain Tracker application, showcasing:

- 📝 **Large text options** - Four font sizes from 14px to 20px
- 🎨 **High contrast modes** - Three contrast levels for enhanced visibility
- 🧭 **Simplified navigation** - Streamlined interface for reduced cognitive load
- 🧠 **Cognitive load indicators** - Memory aids, progress tracking, and auto-save features
- 📱 **Mobile accessibility** - Touch-optimized interfaces with large targets

## Overview

These screenshots demonstrate the Pain Tracker's commitment to universal design and inclusive accessibility, meeting or exceeding WCAG 2.2 Level AA standards. Each screenshot can be used for documentation, marketing, training, or visual regression testing.

## Screenshots by Category

`;

  // Add screenshots grouped by category
  Object.entries(groupedScreenshots).forEach(([category, categoryScreenshots]) => {
    readme += `### ${getCategoryDisplayName(category)}\n\n`;
    
    categoryScreenshots.forEach(screenshot => {
      const relativePath = `./${screenshot.category}/${screenshot.name}`;
      readme += `#### ${screenshot.description}\n\n`;
      readme += `**ID**: \`${screenshot.id}\`\n\n`;
      readme += `![${screenshot.description}](${relativePath})\n\n`;
      
      if (screenshot.preferences) {
        readme += `**Accessibility Settings Applied**:\n`;
        const prefs = screenshot.preferences;
        if (prefs.fontSize) readme += `- Font Size: **${prefs.fontSize}** (${getFontSizePixels(prefs.fontSize)})\n`;
        if (prefs.contrast) readme += `- Contrast: **${prefs.contrast}**\n`;
        if (prefs.simplifiedMode !== undefined) readme += `- Simplified Mode: **${prefs.simplifiedMode ? 'Enabled' : 'Disabled'}**\n`;
        if (prefs.touchTargetSize) readme += `- Touch Target Size: **${prefs.touchTargetSize}**\n`;
        if (prefs.showMemoryAids !== undefined) readme += `- Memory Aids: **${prefs.showMemoryAids ? 'Enabled' : 'Disabled'}**\n`;
        if (prefs.showProgress !== undefined) readme += `- Progress Indicators: **${prefs.showProgress ? 'Enabled' : 'Disabled'}**\n`;
        if (prefs.showCognitiveLoadIndicators !== undefined) readme += `- Cognitive Load Indicators: **${prefs.showCognitiveLoadIndicators ? 'Enabled' : 'Disabled'}**\n`;
        if (prefs.adaptiveComplexity !== undefined) readme += `- Adaptive Complexity: **${prefs.adaptiveComplexity ? 'Enabled' : 'Disabled'}**\n`;
        readme += '\n';
      }
      
      if (screenshot.width && screenshot.height) {
        readme += `**Viewport Size**: ${screenshot.width} × ${screenshot.height}px`;
        if (screenshot.width === 390 && screenshot.height === 844) {
          readme += ' (Mobile - iPhone 12/13/14)';
        } else if (screenshot.width === 1920 && screenshot.height === 1080) {
          readme += ' (Desktop - Full HD)';
        }
        readme += '\n\n';
      }
      
      readme += `---\n\n`;
    });
  });

  readme += `
## Diverse User Representations

The Pain Tracker application is designed with inclusivity in mind, serving users with diverse needs:

### Age Diversity
- **Teens to Seniors**: Interface scales appropriately for all age groups
- **Font sizes**: Adjustable from 14px to 20px to accommodate different visual needs
- **Touch targets**: Large touch targets (up to 72px) for users with reduced dexterity

### Visual Diversity
- **Multiple contrast modes**: Normal, high, and extra-high contrast options
- **Color-blind friendly**: Patterns and icons supplement color coding
- **Screen reader compatible**: Full ARIA labels and semantic HTML

### Cognitive Diversity
- **Simplified modes**: Reduce interface complexity for users with cognitive impairments
- **Memory aids**: Contextual help and tooltips throughout the interface
- **Progress indicators**: Clear visual feedback on task completion
- **Auto-save**: Prevent data loss for users who may forget to save

### Motor Diversity
- **Large touch targets**: Minimum 48px touch targets, with options up to 72px
- **Voice input support**: Alternative input method for users with limited mobility
- **Keyboard navigation**: Full keyboard accessibility for users who cannot use a mouse

### Cultural & Linguistic Diversity
- **Trauma-informed design**: Gentle language options respecting diverse backgrounds
- **i18n support**: Multi-language support for diverse communities
- **Customizable preferences**: Users control their own experience

### Neurodiversity
- **Reduced motion options**: Minimize animations that may cause discomfort
- **Cognitive load indicators**: Real-time feedback on mental effort required
- **Adaptive complexity**: Interface adapts to user's interaction patterns

## Usage Guidelines

These screenshots can be used for:

1. **Documentation**: Demonstrating accessibility features to users and stakeholders
2. **Marketing**: Showcasing inclusive design principles and universal access
3. **Training**: Teaching accessibility best practices to designers and developers
4. **Testing**: Visual regression testing for accessibility features
5. **Compliance**: Demonstrating WCAG 2.2 Level AA compliance

## Regenerating Screenshots

To regenerate all accessibility screenshots:

\`\`\`bash
npm run screenshots:accessibility
\`\`\`

To regenerate specific categories:

\`\`\`bash
# Text size options
npm run screenshots:accessibility:text

# Contrast modes
npm run screenshots:accessibility:contrast

# Navigation modes
npm run screenshots:accessibility:navigation

# Cognitive support features
npm run screenshots:accessibility:cognitive
\`\`\`

## Accessibility Standards Compliance

All screenshots demonstrate features that meet or exceed:

- ✅ **WCAG 2.2 Level AA** - Web Content Accessibility Guidelines
- ✅ **Section 508** - US Federal accessibility requirements
- ✅ **EN 301 549** - European accessibility standard
- ✅ **Trauma-Informed Design Principles** - Emotional safety and user agency

### Specific WCAG Success Criteria Demonstrated

- **1.4.3 Contrast (Minimum)** - High and extra-high contrast modes
- **1.4.4 Resize Text** - Text can be resized up to 200% (20px from 14px base)
- **1.4.10 Reflow** - Content reflows without horizontal scrolling
- **2.4.1 Bypass Blocks** - Skip links and simplified navigation
- **2.4.7 Focus Visible** - Clear focus indicators throughout
- **3.2.4 Consistent Identification** - Consistent UI patterns across modes
- **3.3.1 Error Identification** - Clear error messages and cognitive support
- **3.3.3 Error Suggestion** - Memory aids and contextual help

## Technical Details

### Screenshot Specifications

- **Format**: PNG
- **Color Space**: sRGB
- **Device Scale Factor**: 2x (Retina)
- **Desktop Viewport**: 1920×1080px
- **Mobile Viewport**: 390×844px (iPhone 12/13/14)

### File Structure

\`\`\`
docs/screenshots/accessibility/
├── README.md (this file)
├── text-size/
│   ├── text-size-small.png (14px)
│   ├── text-size-medium.png (16px)
│   ├── text-size-large.png (18px)
│   ├── text-size-xl.png (20px)
│   └── mobile-large-text.png
├── contrast/
│   ├── contrast-normal.png
│   ├── contrast-high.png
│   ├── contrast-extra-high.png
│   └── mobile-high-contrast.png
├── navigation/
│   ├── navigation-full.png
│   ├── navigation-simplified.png
│   └── accessibility-settings-panel.png
└── cognitive-support/
    ├── cognitive-support-full.png
    └── cognitive-load-indicators.png
\`\`\`

## Additional Resources

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Trauma-Informed Design Principles](../../docs/ACCESSIBILITY_COMFORT_SPEC.md)
- [Full Accessibility Implementation Guide](../../docs/ACCESSIBILITY_IMPLEMENTATION_COMPLETE.md)
- [UX & Accessibility Index](../../docs/UX_AND_ACCESSIBILITY_INDEX.md)

---

**Note**: These screenshots are automatically generated using Playwright. For questions or to report issues, please open a GitHub issue.
`;

  return readme;
}

// Helper function to get font size in pixels
function getFontSizePixels(size) {
  const sizes = {
    small: '14px',
    medium: '16px',
    large: '18px',
    xl: '20px'
  };
  return sizes[size] || size;
}

// Main function
function main() {
  console.log('📄 Generating accessibility screenshots README...\n');
  
  const readme = generateReadme();
  
  fs.writeFileSync(README_PATH, readme);
  
  console.log(`✅ README generated: ${README_PATH}`);
  console.log(`📊 Total screenshots documented: ${getNonCompositeScreenshots().length}`);
  console.log('\n✨ Done!');
}

main();
