# Accessibility Implementation Checklist

**Phase**: 1.5 (Nov 13-26, 2025) - **COMPLETE Dec 8, 2025**  
**Goal**: WCAG 2.2 AA Compliance + Trauma-Informed Comfort  
**Owner**: Engineering + Design  
**Status**: ✅ Complete

## Reality Check (2025-12-22)

This document contains a mix of “completed” claims and unchecked items.

- Verified accessibility preferences (Visual + Motor) are wired and in active use; see `docs/planning/PAIN_TRACKER_PRO_ACTION_PLAN.md` → Tier 3.3.
- Treat the remaining unchecked items below as an actionable backlog unless/until they are explicitly reclassified.

---

## December 2025 Updates - Phase 1.5 Complete ✅

### New Components Added (Dec 8, 2025)

- [x] **AccessiblePainSlider** (`src/components/accessibility/AccessiblePainSlider.tsx`)
  - WCAG 2.2 AA compliant pain rating slider
  - Keyboard: Arrow keys (±1), Home/End (0/10), PageUp/PageDown (±2)
  - ARIA labels and live region announcements
  - Optional haptic feedback for mobile
  - Direct numeric input field
  - Stepper buttons (±) for fine control

- [x] **FocusTrap** (`src/components/accessibility/FocusTrap.tsx`)
  - Automatic focus trapping within boundaries
  - Escape key handling for dismissal
  - Return focus to trigger element on close

- [x] **AccessibleModal** (`src/components/accessibility/FocusTrap.tsx`)
  - ARIA role="dialog" and aria-modal attributes
  - Proper heading hierarchy (aria-labelledby)
  - Backdrop click handling
  - Scroll lock to prevent background interaction

### Exports Updated
- [x] All new components exported from `src/components/accessibility/index.ts`

---

## Week 1: Core Accessibility (Nov 13-19)

### Focus Management

- [ ] **Focus rings**: Add 2px outline + 2px offset to all interactive elements
  - File: `src/design-system/tokens/fused-v2.css`
  - Add: `:focus { outline: 2px solid var(--accent); outline-offset: 2px; }`
- [ ] **Skip link**: Add hidden "Skip to main content" link
  - File: `src/containers/PainTrackerContainer.tsx`
  - Component: `<SkipLink href="#main-content" />`
- [ ] **Modal focus trap**: Implement in all dialogs
  - File: `src/components/feedback/Modal.tsx` (if exists, else create)
  - Hook: `useFocusTrap(modalRef, isOpen)`
- [ ] **Tab order audit**: Test logical flow on all screens
  - Screens: Dashboard, Log Pain, Analytics, Calendar

### Screen Reader Support

- [ ] **Pain slider ARIA**: Add proper roles and labels
  - File: `src/design-system/fused-v2/QuickLogStepper.tsx`
  - Update: Lines 80-120 (pain slider component)
  - Add: `aria-label`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`
- [ ] **Live regions**: Add for save confirmations and errors
  - File: `src/containers/PainTrackerContainer.tsx`
  - Add: `<div aria-live="polite" className="sr-only">{statusMessage}</div>`
- [ ] **Body map alternative**: Add checkbox list for SR users
  - File: Create `src/components/body-map/BodyMapAccessible.tsx`
  - Pattern: Dual-path (SVG visual + fieldset checkboxes)
- [ ] **Chart table toggle**: Add to all chart components
  - Files: `src/components/analytics/AdvancedAnalyticsView.tsx`
  - Pattern: `<ChartWithTable data={entries} />`

### Keyboard Navigation

- [ ] **QuickLogStepper keyboard**: Arrow keys for pain adjustment
  - File: `src/design-system/fused-v2/QuickLogStepper.tsx`
  - Add: `onKeyDown` handler (ArrowUp/Down for pain level)
- [ ] **Modal Escape key**: Close on Esc
  - File: All modal/overlay components
  - Add: `useEscapeKey(onClose)`
- [ ] **Command palette**: Create keyboard-first search (if not exists)
  - File: Create `src/components/CommandPalette.tsx`
  - Shortcut: Ctrl+K / Cmd+K
  - Pattern: Fuzzy search for navigation

### Testing Checkpoints

- [ ] **Keyboard-only**: Log pain entry without mouse
- [ ] **VoiceOver**: Navigate dashboard → log → save (iOS Safari)
- [ ] **TalkBack**: Same flow (Android Chrome)
- [ ] **NVDA**: Test on Windows (Chrome/Edge)

---

## Week 2: Comfort Features (Nov 20-26)

### Panic Mode

- [ ] **Create PanicMode component**
  - File: Create `src/components/comfort/PanicMode.tsx`
  - Features: Dim overlay, breathing guide, large exit button
- [ ] **Add panic button**: Bottom-right floating (≥56px)
  - File: `src/containers/PainTrackerContainer.tsx`
  - Position: `fixed bottom-4 right-4 z-50`
- [ ] **Breathing animation**: Slow pulse (4s cycle)
  - CSS: `@keyframes pulse-slow` with `prefers-reduced-motion` check
- [ ] **Haptic feedback**: On activate/deactivate
  - Util: `src/utils/haptics.ts` (create if needed)
  - Pattern: `navigator.vibrate([100, 50, 100])`
- [ ] **Redaction toggle**: Hide sensitive data
  - State: `redactionOn` boolean
  - Effect: Add `redacted` class to pain values, notes

### One-Handed Operation

- [ ] **Pain slider steppers**: Add ± buttons
  - File: `src/design-system/fused-v2/QuickLogStepper.tsx`
  - Pattern: Button group with numeric input center
  - Size: ≥48px tap targets
- [ ] **Sticky primary button**: Bottom of long forms
  - Files: All form components (QuickLogStepper, etc.)
  - CSS: `sticky bottom-0 p-4 bg-surface-900`
- [ ] **Thumb zone audit**: Test on 6.7" screen
  - Tool: Chrome DevTools mobile emulation
  - Check: Primary actions reachable with one thumb

### Dynamic Font Scaling

- [ ] **Replace px with rem**: All font sizes
  - Files: Check all components for hardcoded `font-size: 16px`
  - Replace with: `clamp(14px, 1rem, 20px)` pattern
- [ ] **Test 150% scale**: No overlap or truncation
  - Screens: Dashboard, QuickLogStepper, Analytics
  - Browser: Chrome Settings → Appearance → Font Size → Very Large
- [ ] **Test 200% scale**: Critical flows functional
  - Flow: Log pain → Save → View on dashboard
- [ ] **Line-height audit**: Ensure 1.5× body, 1.3× headings
  - File: `src/design-system/tokens/fused-v2.css`
  - Check: All typography tokens

### Dark Mode Optimization

- [ ] **Contrast audit**: All text ≥4.5:1 on surface-900
  - Tool: WebAIM Contrast Checker or browser extension
  - Tokens: `--fg`, `--fg-medium`, `--fg-subtle` on `--surface-900`
- [ ] **AAA for critical UI**: Labels, inputs, errors ≥7:1
  - Check: Pain slider labels, form labels, error messages
- [ ] **Color-blind test**: Severity scale distinguishable
  - Tool: Chromium DevTools → Rendering → Emulate vision deficiencies
  - Test: Protanopia, Deuteranopia, Tritanopia

### Testing Checkpoints

- [ ] **Panic Mode activation**: ≤2s from tap to breathing guide
- [ ] **200% font scale**: Log pain successfully
- [ ] **One-handed flow**: Complete entry with thumb only (video record)
- [ ] **Color-blind sim**: All states pass (screenshot each)

---

## Ongoing: QA & Compliance

### Automated Testing

- [ ] **Install axe-core**: Add to test suite
  - Command: `npm install --save-dev @axe-core/react`
  - File: `src/test/setup.ts`
  - Add: Axe violations reporter
- [ ] **Lighthouse CI**: Add to GitHub Actions
  - File: `.github/workflows/accessibility.yml`
  - Target: Accessibility score ≥95
- [ ] **Color contrast checker**: Add to design system docs
  - Tool: Stark plugin for Figma or online checker
  - Document: `docs/DESIGN_SYSTEM_AUDIT.md`

### Manual Testing (Repeated Weekly)

- [ ] **VoiceOver (iOS)**: Full pain log flow
  - Device: iPhone (physical or simulator)
  - Flow: Open app → Log pain → Select locations → Save → Verify dashboard
- [ ] **TalkBack (Android)**: Dashboard → Analytics → Export
  - Device: Android phone or emulator
  - Settings: TalkBack enabled
- [ ] **NVDA (Windows)**: Clinician patient review (when implemented)
  - Browser: Chrome or Edge
  - Flow: Open patient list → View details → Add note
- [ ] **Keyboard-only**: All critical workflows
  - No mouse/trackpad usage
  - Flows: Log, view calendar, export report

### Compliance Documentation

- [ ] **VPAT**: Create Voluntary Product Accessibility Template
  - File: `docs/VPAT_WCAG_2.2.md`
  - Sections: Level A, AA, AAA compliance checklist
- [ ] **Accessibility statement**: Public-facing page
  - File: `src/pages/Accessibility.tsx` (if applicable)
  - Content: Standards met, how to report issues, contact info
- [ ] **Audit log**: Track fixes and remaining issues
  - File: `docs/ACCESSIBILITY_AUDIT_LOG.md`
  - Format: Date | Issue | Status | Fix PR

---

## Definition of Done

### Week 1 Complete

- ✅ All interactive elements have visible focus rings
- ✅ Pain slider fully keyboard-accessible with ARIA labels
- ✅ Screen reader users can log pain without sighted help
- ✅ Charts have table view alternative
- ✅ Skip-to-content link implemented

### Week 2 Complete

- ✅ Panic Mode functional with ≤2s activation
- ✅ 200% font scale: no critical UI breaks
- ✅ One-handed operation verified on large screen
- ✅ Color-blind simulations pass for all severity states
- ✅ Haptic feedback working on supported devices

### Phase 1.5 Complete

- ✅ WCAG 2.2 AA compliance verified (automated + manual)
- ✅ Lighthouse accessibility score ≥95
- ✅ SR-only user can complete core tasks (95%+ success)
- ✅ Keyboard-only user can complete core tasks (95%+ success)
- ✅ All QA checkpoints passing
- ✅ VPAT document completed
- ✅ Accessibility statement published

---

## Resources

### Tools

- **Screen Readers**:
  - iOS: VoiceOver (Settings → Accessibility → VoiceOver)
  - Android: TalkBack (Settings → Accessibility → TalkBack)
  - Windows: NVDA (free, https://www.nvaccess.org/)
  - macOS: VoiceOver (Cmd+F5)
- **Testing**:
  - axe DevTools (Chrome/Firefox extension)
  - Lighthouse (Chrome DevTools → Lighthouse tab)
  - WAVE (browser extension)
  - Color Oracle (color-blind simulator app)
- **Contrast Checkers**:
  - WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/)
  - Accessible Colors (https://accessible-colors.com/)

### Documentation

- **WCAG 2.2**: https://www.w3.org/WAI/WCAG22/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **MDN Accessibility**: https://developer.mozilla.org/en-US/docs/Web/Accessibility
- **Our Spec**: `docs/accessibility/ACCESSIBILITY_COMFORT_SPEC.md`

### Testing Scripts

- **Patient Flow (SR)**:
  1. Open app with screen reader
  2. Navigate to "Log Pain"
  3. Adjust pain slider to level 6 (verify SR announces "6 of 10, Severe")
  4. Select "Lower back" location (verify checkbox alternative)
  5. Add note "Post-PT session"
  6. Save entry (verify "Saved" announcement)
  7. Navigate to dashboard (verify entry appears)

- **Clinician Flow (Keyboard)**:
  1. Open patient list
  2. Tab to first patient, press Enter
  3. Review summary (tab through sections)
  4. Press Ctrl+K to open command palette
  5. Type "note", press Enter
  6. Add note, press Tab to Save, press Enter
  7. Press Esc to close, verify focus returns to patient

---

## Notes for Engineering

### Priority Order

1. **Week 1, Day 1-2**: Focus management (biggest SR blocker)
2. **Week 1, Day 3-4**: ARIA labels on pain slider (core feature)
3. **Week 1, Day 5**: Chart table toggle (analytics accessibility)
4. **Week 2, Day 1-2**: Panic Mode (high impact, moderate effort)
5. **Week 2, Day 3-4**: Font scaling (test-intensive)
6. **Week 2, Day 5**: Color-blind testing and fixes

### Common Pitfalls

- ❌ Don't rely on `outline: none` - always provide visible focus
- ❌ Don't use `div` with `onClick` - use `button` or add `role="button"` + keyboard handler
- ❌ Don't use color alone to convey state - add icon or text
- ❌ Don't trap focus without Escape key handler
- ❌ Don't hardcode font sizes in px - use rem/clamp for scaling

### Code Review Checklist

- [ ] All new interactive elements have `aria-label` or visible text
- [ ] Forms have associated `<label>` elements
- [ ] Buttons have descriptive text or `aria-label`
- [ ] Images have `alt` text (empty `alt=""` if decorative)
- [ ] Color is not sole indicator of state
- [ ] Focus is visible (no `outline: none` without alternative)
- [ ] Keyboard handlers for custom controls (if not using native elements)

---

**Last Updated**: 2025-11-12  
**Review Cadence**: Daily during implementation  
**Blocker Protocol**: Flag in Slack #accessibility, tag @design-lead
