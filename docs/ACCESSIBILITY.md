# Accessibility Features & Compliance

This document describes the accessibility features implemented in Pain Tracker, their usage, and current limitations. The goal is to meet WCAG 2.1 AA standards and support a wide range of disabilities.

---

## Supported Features

### Visual Preferences
- **High Contrast Mode:** Increases text/button contrast to WCAG AAA level.
- **Font Size Adjuster:** Options for 150%, 200%, 250% font scaling.
- **Motion Reduction:** Disables non-essential animations for vestibular issues.
- **Color Blind Modes:** Deuteranopia, Protanopia, Tritanopia support.

### Motor & Input
- **Touch Target Size:** Enlarges buttons/inputs for tremor/fine motor issues.
- **Interaction Speed:** Slow/fast settings for debounce/delay.
- **Voice Commands:** Control app by voice (local-only, privacy-first).
- **Single-Handed Mode:** Reorganizes UI for thumb reach.

### Screen Reader Optimization
- ARIA labels, roles, and tabIndex added to all interactive controls.
- All tabs, toggles, and selectors are keyboard accessible.

### Cognitive Support
- Clear, non-blaming error messages.
- Trauma-informed language throughout UI.

---

## Limitations & Known Issues
- Voice command support is experimental and may not work in all browsers.
- Single-handed mode layout may require further user testing.
- Automated and manual accessibility audits are ongoing; some edge cases may remain.

---

## How to Enable Accessibility Features
- Go to the Accessibility Panel in Settings.
- Adjust preferences in the Visual Preferences and Motor & Input tabs.
- Changes apply instantly and persist across sessions.

---

## Testing & Audit
- Automated scans: axe-core, Playwright a11y tests.
- Manual testing: NVDA, JAWS, VoiceOver, and real disabled users.
- Target: WCAG 2.1 AA compliance, with AAA contrast option.

---

## Contact & Feedback
If you encounter accessibility barriers, please contact the development team or open an issue. User feedback is prioritized for accessibility improvements.
