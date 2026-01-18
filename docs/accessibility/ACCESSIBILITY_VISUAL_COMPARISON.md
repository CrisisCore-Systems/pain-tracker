# Visual Comparison: Accessibility Features

This document provides a quick visual reference for the accessibility features demonstrated in our screenshot portfolio.

## Text Size Comparison

### Small (14px) vs Medium (16px) vs Large (18px) vs Extra Large (20px)

The Pain Tracker supports four text sizes to accommodate different visual needs:

| Size | Font | Use Case | Screenshot |
|------|------|----------|------------|
| **Small** | 14px | Tech-savvy users, compact displays | `text-size-small.png` |
| **Medium** | 16px | Default for most users | `text-size-medium.png` |
| **Large** | 18px | Enhanced readability | `text-size-large.png` |
| **Extra Large** | 20px | Maximum readability for seniors/low vision | `text-size-xl.png` |

**Range**: 142% scaling from smallest to largest (14px → 20px)
**WCAG Target**: Supports large text settings; validate 200% zoom behavior in your environment

## Contrast Mode Comparison

### Normal vs High vs Extra-High Contrast

Three contrast levels ensure visibility for users with different visual needs:

| Mode | Description | Screenshot |
|------|-------------|------------|
| **Normal** | Standard interface colors | `contrast-normal.png` |
| **High** | Enhanced text/background contrast | `contrast-high.png` |
| **Extra-High** | Maximum contrast for low vision/color blind | `contrast-extra-high.png` |

**WCAG Target**: Designed to meet contrast targets; validate ratios in your environment

## Navigation Complexity Comparison

### Full Navigation vs Simplified Mode

Users can toggle between full-featured and simplified interfaces:

| Mode | Features | Use Case | Screenshot |
|------|----------|----------|------------|
| **Full** | All features visible | Advanced users, clinicians | `navigation-full.png` |
| **Simplified** | Essential features only | Cognitive impairments, fibro fog | `navigation-simplified.png` |

**Cognitive Load**: Simplified mode reduces visual elements by ~40%

## Cognitive Support Features

### Memory Aids and Load Indicators

Two key features help users with cognitive diversity:

| Feature | Purpose | Screenshot |
|---------|---------|------------|
| **Full Cognitive Support** | All aids enabled (memory, progress, auto-save) | `cognitive-support-full.png` |
| **Load Indicators** | Real-time feedback on mental effort required | `cognitive-load-indicators.png` |

**Features Include**:
- Progress indicators (shows task completion)
- Memory aids (contextual help)
- Auto-save (every 30 seconds)
- Cognitive load meters (traffic light system)

## Mobile Accessibility

### Touch-Optimized Interfaces

Mobile views demonstrate accessible design for on-the-go users:

| View | Features | Screenshot |
|------|----------|------------|
| **Large Text Mobile** | 18px text + 72px touch targets | `mobile-large-text.png` |
| **High Contrast Mobile** | Extra-high contrast on mobile | `mobile-high-contrast.png` |

**Touch Targets**: Up to 72px (3x WCAG minimum of 24px)
**Device**: iPhone 12/13/14 (390×844px)

## Accessibility Settings Panel

The settings panel provides complete customization control:

**Screenshot**: `accessibility-settings-panel.png`

**Categories**:
- Cognitive Support (simplified mode, memory aids, progress)
- Visual Preferences (text size, contrast, motion)
- Motor & Input (touch targets, voice input)
- Mobile Features (haptics, voice)
- Emotional Safety (gentle language, crisis detection)

## Side-by-Side Comparisons

### Recommended Viewing Order

For documentation or presentations, show screenshots in this order:

1. **Text Size Progression**: small → medium → large → xl
2. **Contrast Comparison**: normal → high → extra-high
3. **Navigation Modes**: full → simplified
4. **Cognitive Support**: full support → load indicators
5. **Mobile Views**: large text → high contrast
6. **Settings Panel**: Complete customization overview

## Key Metrics

- **14 Total Screenshots**: Covering 5 categories
- **4 Font Sizes**: 14px to 20px (142% range)
- **3 Contrast Modes**: Normal, high, extra-high
- **2 Complexity Levels**: Full and simplified
- **2 Mobile Views**: Text and contrast optimized
- **1 Settings Panel**: Complete customization

## Usage Examples

### For User Documentation
Show users how to customize their experience:
1. Start with `accessibility-settings-panel.png`
2. Show relevant feature screenshots (text size, contrast, etc.)
3. Demonstrate mobile optimization

### For Marketing Materials
Highlight inclusive design:
1. Use `text-size-xl.png` to show large text support
2. Use `contrast-extra-high.png` for visual diversity
3. Use `cognitive-support-full.png` for cognitive diversity

### For WCAG Target Documentation
Demonstrate standards alignment targets:
1. Text scaling: `text-size-small.png` to `text-size-xl.png`
2. Contrast ratios: `contrast-high.png` and `contrast-extra-high.png`
3. Simplified navigation: `navigation-simplified.png`
4. Cognitive support: `cognitive-load-indicators.png`

## Accessibility Statement

All screenshots demonstrate **real, working features** in the Pain Tracker application, not mockups or prototypes. Features shown are intended to be:

- ✅ User-configurable
- ✅ Persistent across sessions
- ✅ Built toward a WCAG 2.2 AA target (validate in your environment)
- ✅ Tested during development (details vary by feature)
- ✅ Documented in user guides

---

**For full screenshot documentation, see**: [`docs/screenshots/accessibility/README.md`](../screenshots/accessibility/README.md)

**For diverse user guide, see**: [`docs/accessibility/ACCESSIBILITY_DIVERSE_USERS.md`](./ACCESSIBILITY_DIVERSE_USERS.md)
