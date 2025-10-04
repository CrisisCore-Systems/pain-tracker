# Screenshots

This directory contains actual screenshots of the Pain Tracker application for use in the PWA manifest and app store listings.

## Current Screenshots

- **dashboard-540x720.png** - Narrow (mobile) view of the main dashboard
  - Dimensions: 1080x1440 (2x scale for retina display)
  - Target size: 540x720
  - Form factor: narrow (mobile)

- **analytics-1280x720.png** - Wide (desktop) view of the analytics dashboard
  - Dimensions: 2560x1440 (2x scale for retina display)
  - Target size: 1280x720
  - Form factor: wide (desktop)

## Updating Screenshots

To regenerate screenshots when the app design changes:

```bash
npm run screenshots:capture
```

This will:
1. Start the development server
2. Launch a headless browser
3. Navigate to key pages
4. Capture screenshots at the correct dimensions
5. Save them as PNG files in this directory

## Technical Details

- Screenshots are captured at 2x device pixel ratio for retina displays
- Format: PNG (required for PWA manifest compatibility)
- Browser: Chromium via Playwright
- Script: `scripts/capture-screenshots.js`

## PWA Requirements

According to PWA best practices:
- Screenshots should be actual app screenshots (not mockups or placeholders)
- PNG or JPEG formats are required
- At least one screenshot should be provided
- Screenshots should represent actual functionality
- Recommended to provide both narrow and wide form factors
