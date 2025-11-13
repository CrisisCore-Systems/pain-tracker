# 📸 Screenshot Portfolio Documentation

## Overview

This directory contains a comprehensive screenshot portfolio for the Pain Tracker application, organized for marketing, social media, technical documentation, and WorkSafe BC form demonstrations.

## 📁 Directory Structure

```
public/screenshots/
├── marketing/          # Marketing and promotional screenshots
├── technical/          # Technical architecture and privacy screenshots
├── social/            # Social media optimized screenshots
├── documentation/     # Documentation and tutorial screenshots
├── wcb-forms/        # WorkSafe BC form preview screenshots
├── PORTFOLIO.md      # Auto-generated portfolio inventory
└── portfolio-metadata.json  # Screenshot metadata
```

## 🎯 Screenshot Categories

### Phase 1: Essential (Week 1)

These are the highest priority screenshots needed for immediate marketing and user acquisition.

#### Marketing Screenshots
1. **pain-entry-interface.png** - Core pain tracking interface
   - Shows the 7-step pain assessment form
   - Demonstrates ease of use
   - Use: Demo sequences, feature explanations

2. **export-modal-solution.png** - Export modal with WorkSafe BC options
   - The "hero" screenshot showing one-click form generation
   - Use: Landing page hero, conversion content

3. **export-process.png** - Export process demonstration
   - Shows Form 6/7 generation options
   - Use: Conversion-focused content

#### WorkSafe BC Forms
4. **generated-form-6-preview.png** - Auto-filled Form 6
   - Demonstrates automated form completion
   - Use: Trust-building, result demonstrations

5. **generated-form-7-preview.png** - Auto-filled Form 7
   - Shows employer report generation
   - Use: Comprehensive solution showcasing

#### Technical/Privacy
6. **privacy-security-settings.png** - Privacy and security highlights
   - Shows local storage, encryption status
   - Use: Privacy-focused marketing, addressing concerns

### Phase 2: Growth (Weeks 2-3)

Screenshots for expanding reach and demonstrating advanced features.

7. **body-map-interaction.png** - Interactive body map
8. **analytics-dashboard.png** - Advanced analytics
9. **offline-functionality.png** - Offline mode demonstration
10. **comparison-grid.png** - Feature comparison table
11. **mobile-responsiveness.png** - Multi-device views

### Phase 3: Advanced (Month 1)

Screenshots for specialized audiences and advanced marketing.

12. **trauma-informed-mode.png** - Gentle vs clinical language
13. **process-flow.png** - User journey infographic
14. **architecture-diagram.png** - Technical architecture
15. **built-in-bc.png** - BC branding elements
16. **crisis-support-feature.png** - Crisis detection UI

## 🚀 Generating Screenshots

### Prerequisites

```bash
# Ensure Playwright is installed
npm run playwright:install

# Or manually install browsers
npx playwright install chromium
```

### Quick Start

Generate all screenshots:
```bash
npm run screenshots:portfolio
```

### Phase-Based Generation

Generate specific phases:
```bash
# Phase 1 only (highest priority)
npm run screenshots:portfolio:phase1

# Phase 2 only
npm run screenshots:portfolio:phase2

# Phase 3 only
npm run screenshots:portfolio:phase3
```

### Category-Based Generation

Generate specific categories:
```bash
# Marketing screenshots only
npm run screenshots:portfolio -- --category=marketing

# Technical screenshots only
npm run screenshots:portfolio -- --category=technical

# Social media screenshots
npm run screenshots:portfolio -- --category=social

# WorkSafe BC forms
npm run screenshots:portfolio -- --category=wcb-forms
```

### Dry Run Mode

Preview what would be captured without actually saving:
```bash
npm run screenshots:portfolio -- --dry-run
```

## 🎨 Screenshot Specifications

### Social Media Sizes
- **Twitter/Facebook Share**: 1200x630px (Open Graph standard)
- **Instagram Post**: 1080x1080px (Square)
- **Instagram Story**: 1080x1920px (Vertical)

### PWA Manifest Sizes
- **Narrow (Mobile)**: 540x720px
- **Wide (Desktop)**: 1280x720px

### Documentation
- **High-res**: 1920x1080px

### Device Scale
- All screenshots captured at 2x device pixel ratio (Retina displays)
- Format: PNG with transparency where applicable

## 📋 Screenshot Metadata

Each screenshot includes:
- **ID**: Unique identifier
- **Name**: Filename
- **Category**: marketing, technical, social, documentation, wcb-forms
- **Description**: What the screenshot shows
- **Caption**: Ready-to-use social media caption
- **Use Case**: Where and how to use the screenshot
- **Priority**: phase1, phase2, or phase3
- **URL**: Demo route for clean capture

### Example Metadata
```json
{
  "id": "export-modal",
  "name": "export-modal-solution.png",
  "category": "marketing",
  "description": "Export Modal - The Solution",
  "caption": "This is the alternative - one click to generate perfect forms",
  "url": "/pain-tracker/#demo-export",
  "width": 1200,
  "height": 630,
  "priority": "phase1",
  "useCase": "Hero image, landing page above the fold"
}
```

## 🎬 Demo Routes

The application includes special demo routes for clean screenshot capture:

- `#demo-export` - Export modal showcase
- `#demo-body-map` - Body map interaction
- `#demo-settings` - Privacy/security settings
- `#demo-comparison` - Comparison grid
- `#demo-crisis` - Crisis support feature
- `#demo-benefits` - Benefits grid

Navigate to these routes to see clean, demo-ready views without UI chrome.

## 🖼️ Manual Creation Required

Some screenshots require manual creation as infographics or composites:

### Infographics
- **comparison-grid.png** - Feature comparison table
- **benefit-icons-grid.png** - Benefits icon grid
- **process-flow.png** - User journey flowchart
- **architecture-diagram.png** - Technical architecture diagram

### Composites
- **mobile-responsiveness.png** - Multi-device mockup

Tools for manual creation:
- Figma, Canva, or Adobe Illustrator for infographics
- MockUPhone, Mockup World for device mockups
- Follow brand colors from `BRANDING_GUIDE.md`

## 📝 Captions Library

Pre-written captions for each screenshot are included in the metadata. Use these for consistent messaging across platforms.

### Example Captions
- **Pain Entry**: "Track your pain in 30 seconds - no complex interfaces"
- **Export Modal**: "One click exports your data to WorkSafeBC-ready formats"
- **Privacy**: "Your data never leaves your device - unlike cloud-based competitors"
- **Analytics**: "Advanced analytics competitors charge for - included free"

## 🎯 Use Case Mapping

### Social Media Posts (Twitter, Facebook, LinkedIn)
- pain-entry-interface.png
- export-modal-solution.png
- comparison-grid.png
- benefit-icons-grid.png

### Blog Posts & Articles
- All Phase 1 screenshots
- analytics-dashboard.png
- body-map-interaction.png

### Landing Page
- export-modal-solution.png (hero)
- privacy-security-settings.png
- analytics-dashboard.png

### Technical Documentation
- architecture-diagram.png
- privacy-security-settings.png
- mobile-responsiveness.png

### Community Outreach
- built-in-bc.png
- crisis-support-feature.png
- trauma-informed-mode.png

## 🔄 Updating Screenshots

When the app design changes:

1. **Run the capture script**:
   ```bash
   npm run screenshots:portfolio
   ```

2. **Review generated files**:
   - Check `public/screenshots/` directories
   - Review `portfolio-metadata.json`

3. **Update manual screenshots**:
   - Recreate infographics if needed
   - Update composite images

4. **Commit changes**:
   ```bash
   git add public/screenshots/
   git commit -m "Update screenshot portfolio"
   ```

## 🧪 Testing Screenshot Routes

Test demo routes locally:

```bash
# Start dev server
npm run dev

# Navigate to demo routes in browser
# http://localhost:3000/pain-tracker/#demo-export
# http://localhost:3000/pain-tracker/#demo-settings
# etc.
```

## 📊 Screenshot Quality Checklist

Before using screenshots publicly:

- [ ] Image is clear and high-resolution
- [ ] No sensitive/personal data visible
- [ ] Branding is consistent (colors, fonts)
- [ ] Text is readable at target size
- [ ] Background is appropriate for use case
- [ ] File size is optimized (< 500KB for web)
- [ ] Alt text is prepared for accessibility

## 🔐 Privacy Considerations

All screenshots use:
- Anonymized demo data only
- No real patient information
- Generic placeholder names and dates
- Sanitized sample entries

## 📈 Performance Tips

- Screenshots are PNG format for quality
- Optimize for web delivery using tools like TinyPNG
- Consider WebP format for web use (convert from PNG)
- Use appropriate sizes for each platform

## 🆘 Troubleshooting

### Screenshots not generating
- Ensure dev server can start: `npm run dev`
- Check Playwright installation: `npx playwright install chromium`
- Verify no port conflicts (default: 3000)

### Demo routes not working
- Clear browser cache
- Check for JavaScript errors in console
- Verify App.tsx includes ScreenshotShowcase

### Poor quality screenshots
- Increase deviceScaleFactor in config
- Use higher resolution settings
- Ensure retina display capture (2x)

## 📚 Additional Resources

- [BRANDING_GUIDE.md](../../BRANDING_GUIDE.md) - Brand colors and guidelines
- [screenshot-config.js](../../scripts/screenshot-config.js) - Full configuration
- [capture-screenshot-portfolio.js](../../scripts/capture-screenshot-portfolio.js) - Capture script

---

**Last Updated**: November 2024  
**Maintainer**: CrisisCore Systems Development Team
