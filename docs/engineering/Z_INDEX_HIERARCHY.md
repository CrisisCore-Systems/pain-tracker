# Z-Index Hierarchy

## Overview
This document defines the z-index layering system for Pain Tracker to ensure proper visual stacking of UI elements.

## Z-Index Scale

```
9999  - Panic Mode (highest priority - life-saving feature)
100   - Modals & Dialogs (overlays that block interaction)
80    - Dev Tools (ToneStateTester - development only)
70    - Floating Action Buttons (QuickActions)
60    - Banners (BetaWarning)
50    - Toast Notifications
40    - Header & Navigation
30    - Dropdowns & Popovers
20    - Sticky Elements
10    - Default elevated content
0     - Base content
```

## Component Z-Index Reference

### Critical Components
| Component | Z-Index | Rationale |
|-----------|---------|-----------|
| `PanicMode` | `z-[9999]` | Emergency feature - must always be accessible |
| `Modal` | `z-[100]` | Blocks interaction with underlying content |
| `VaultGate` | `z-[100]` | Security gate - must overlay everything except panic |
| `Dialog` (Radix UI) | `z-[100]` | Confirmation dialogs need to overlay modals |

### Floating UI Elements
| Component | Z-Index | Rationale |
|-----------|---------|-----------|
| `ToneStateTester` | `z-[80]` | Dev tool - should be above actions but below modals |
| `QuickActions` | `z-[70]` | Primary action button - always accessible |
| `BetaWarning` | `z-[60]` | Informational banner - visible but dismissible |
| `Toast` | `z-50` | Notifications - non-blocking but prominent |

### Navigation & Layout
| Component | Z-Index | Rationale |
|-----------|---------|-----------|
| Header/Navigation | `z-40` | Persistent navigation |
| Dropdowns | `z-30` | Must overlay content but below modals |
| Sticky elements | `z-20` | Scroll-persistent UI |

## Usage Guidelines

### Adding New Components
1. Consult this hierarchy before adding z-index
2. Use Tailwind's `z-[value]` syntax for custom values
3. Update this document when adding new layers
4. Test with all overlays visible

### Testing Checklist
- [ ] Open a modal while QuickActions is expanded
- [ ] Trigger PanicMode with modal open
- [ ] Show ToneStateTester with BetaWarning visible
- [ ] Verify toast notifications don't block modals
- [ ] Check VaultGate overlays everything except panic

### Common Issues
**Problem**: Modal hidden behind floating button
**Solution**: Ensure modal uses `z-[100]` or higher

**Problem**: Dev tools blocking user interaction
**Solution**: Dev tools should use `z-[80]` and be dismissible

**Problem**: Multiple modals fighting for priority
**Solution**: Use modal managers, not competing z-indexes

## Keyboard Shortcuts
To help users manage overlays:
- **Escape**: Close/minimize most overlays (modals, panels, etc.)
- **Ctrl+Q**: Toggle QuickActions
- **Ctrl+T**: Toggle ToneStateTester (dev only)

## Animation Considerations
When animating z-index changes, use Tailwind's `animate-in` utilities:
```tsx
className="animate-in fade-in slide-in-from-bottom-4 duration-300"
```

## Accessibility
- All overlays must be keyboard accessible
- Focus trap for modals (implemented via `useFocusTrap`)
- Screen readers should announce layer changes
- Escape key should close topmost overlay

## Future Considerations
- **Modal Stack Manager**: If we add multiple simultaneous modals
- **Portal System**: Consider React portals for cleaner DOM structure
- **Context-aware Z-index**: Adaptive layering based on user context

---

*Last Updated: 2025-11-12*
*Maintainer: Development Team*
