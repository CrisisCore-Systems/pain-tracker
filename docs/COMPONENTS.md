# Component Documentation

This document serves as a reference for the core reusable components in the Pain Tracker design system.

## Design System Principles

- **Accessibility First**: All components must meet WCAG 2.2 AA standards.
- **Trauma-Informed**: Use gentle language, avoid alarmist colors, and provide "undo" capabilities.
- **Touch-Friendly**: Minimum touch targets of 44x44px.

## Core Components

### Button

`src/design-system/components/Button.tsx`

Accessible button component with support for variants, sizes, and loading states.
Supports ripple effects and haptic feedback (where available).

**Usage:**

```tsx
import { Button } from '@/design-system/components/Button';

<Button 
  variant="primary" 
  size="md" 
  onClick={handleClick}
  isLoading={isSaving}
>
  Save Entry
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean (shows spinner, disables interaction)
- `fullWidth`: boolean

### Card

`src/design-system/components/Card.tsx`

Container component for grouping related content. Supports "severity" borders for visual feedback.

**Usage:**

```tsx
import { Card } from '@/design-system/components/Card';

<Card severity="warning" className="p-4">
  <h3 className="text-lg font-bold">Pain Flares</h3>
  <p>Detected 3 flares this week.</p>
</Card>
```

**Props:**
- `severity`: 'safe' | 'warning' | 'danger' | 'info' (optional color coding)
- `variant`: 'default' | 'elevated' | 'outlined'

### PainEntryForm

`src/components/pain-tracker/PainEntryForm.tsx`

The primary data collection interface. Heavily modularized into sections.

**Key Sections:**
- **Pain Slider**: Large touch target slider for 0-10 intensity.
- **Body Map**: Interactive SVG map for location selection.
- **Keywords**: Pre-defined descriptors (Sharp, Dull, Throbbing).

### ActivityLog

`src/components/pain-tracker/ActivityLog.tsx`

Displays a historical list or aggregated view of activities and their impact on pain levels.

**Features:**
- Keyboard navigation (Arrow keys).
- Aggregated stats (frequency, avg pain).

## Theme

The design system uses Tailwind CSS with custom tokens defined in `tailwind.config.js`.

- **Colors**: Semantic naming (`primary`, `destructive`, `muted`).
- **Typography**: Inter font family, responsive type scale.
- **Dark Mode**: Fully supported via `dark:` class prefix.
