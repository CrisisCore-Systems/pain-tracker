# Quick Start: Accessibility Screenshots

## View All Screenshots

All accessibility screenshots are organized by category in this directory:

```
accessibility/
├── text-size/          # 5 screenshots - Font sizes 14px to 20px
├── contrast/           # 4 screenshots - Normal, high, extra-high contrast
├── navigation/         # 3 screenshots - Full vs simplified navigation
└── cognitive-support/  # 2 screenshots - Memory aids and load indicators
```

## Quick Commands

### Generate All Screenshots
```bash
npm run screenshots:accessibility
```

### Generate Specific Categories
```bash
npm run screenshots:accessibility:text         # Text size options
npm run screenshots:accessibility:contrast     # Contrast modes
npm run screenshots:accessibility:navigation   # Navigation modes
npm run screenshots:accessibility:cognitive    # Cognitive support
```

## What Each Screenshot Shows

### Text Size Screenshots (5)
1. **text-size-small.png** - 14px font, compact interface
2. **text-size-medium.png** - 16px font, default interface
3. **text-size-large.png** - 18px font, enhanced readability
4. **text-size-xl.png** - 20px font, maximum readability
5. **mobile-large-text.png** - Mobile view with 72px touch targets

### Contrast Screenshots (4)
1. **contrast-normal.png** - Standard colors
2. **contrast-high.png** - Enhanced visibility
3. **contrast-extra-high.png** - Maximum visibility
4. **mobile-high-contrast.png** - Mobile extra-high contrast

### Navigation Screenshots (3)
1. **navigation-full.png** - All features visible
2. **navigation-simplified.png** - Essential features only
3. **accessibility-settings-panel.png** - Customization options

### Cognitive Support Screenshots (2)
1. **cognitive-support-full.png** - All aids enabled
2. **cognitive-load-indicators.png** - Mental effort feedback

## Documentation Links

- [Full README](./README.md) - Comprehensive screenshot documentation
- [Diverse Users Guide](../../ACCESSIBILITY_DIVERSE_USERS.md) - 8+ user diversity categories
- [Visual Comparison](../../ACCESSIBILITY_VISUAL_COMPARISON.md) - Side-by-side comparisons

## Technical Details

- **Format**: PNG
- **Color Space**: sRGB
- **Device Scale**: 2x (Retina)
- **Desktop Size**: 1920×1080px
- **Mobile Size**: 390×844px

## Standards Compliance

✅ WCAG 2.2 Level AA
✅ Section 508
✅ EN 301 549
✅ Trauma-Informed Design
