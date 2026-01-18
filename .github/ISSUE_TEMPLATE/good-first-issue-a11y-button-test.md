---
name: "Good First Issue: Add keyboard-focus a11y smoke test"
about: Add a simple accessibility test for keyboard focus on primary buttons
title: "[Good First Issue] Add keyboard-focus accessibility smoke test for primary button"
labels: ["good first issue", "accessibility", "testing", "a11y"]
assignees: ''
---

## 🎯 Goal

Add a simple smoke test to verify that primary buttons in the app are keyboard-focusable and have visible focus indicators.

## 📋 Background

Keyboard accessibility is critical for users who can't use a mouse. This project targets WCAG 2.2 AA compliance, which requires that all interactive elements be keyboard-accessible with visible focus indicators.

We already have comprehensive accessibility tests in `e2e/accessibility.spec.ts`. This issue is about adding a **simple smoke test** that can run quickly in CI to catch basic keyboard focus regressions.

## ✅ Acceptance Criteria

1. **Create a New Test File**:
   - [ ] Create `src/components/__tests__/keyboard-focus.smoke.test.tsx`
   - [ ] Use the existing test setup from `src/test/setup.ts`
   - [ ] Follow the pattern in `src/components/accessibility/TraumaInformedHooks.test.tsx`

2. **Test Primary Button Focus**:
   - [ ] Render a sample button component (or use an existing one)
   - [ ] Verify it has a `tabindex` that allows keyboard focus (0 or not set)
   - [ ] Verify it receives focus when `.focus()` is called
   - [ ] Verify focus indicator is present (check for outline or focus-visible styles)

3. **Test Requirements**:
   - [ ] Test runs with `npm run test`
   - [ ] Test completes in < 1 second (smoke test should be fast)
   - [ ] Test uses `@testing-library/react` (already in the project)
   - [ ] Test has clear, descriptive assertions
   - [ ] Test follows existing project patterns

4. **Documentation**:
   - [ ] Add a comment explaining what the test checks
   - [ ] Include a link to WCAG 2.2 focus indicator guidelines
   - [ ] Note that this is a smoke test, not comprehensive a11y testing

## 🛠️ How to Complete

### Step 1: Review Existing Tests
```bash
# Look at the existing test structure
cat src/components/accessibility/TraumaInformedHooks.test.tsx
cat src/test/setup.ts

# Run existing tests to understand the setup
npm run test -- src/components/accessibility/TraumaInformedHooks.test.tsx
```

### Step 2: Create the Test File
```typescript
// src/components/__tests__/keyboard-focus.smoke.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';

/**
 * Smoke test for keyboard focus accessibility.
 * 
 * Verifies that primary interactive elements (buttons) are keyboard-focusable
 * and have visible focus indicators.
 * 
 * WCAG 2.2 Success Criterion 2.4.7 (Focus Visible):
 * https://www.w3.org/WAI/WCAG22/Understanding/focus-visible
 */
describe('Keyboard Focus Smoke Test', () => {
  it('primary button should be keyboard focusable', () => {
    // TODO: Render a button component
    // TODO: Verify tabindex allows keyboard focus
    // TODO: Call .focus() and verify button receives focus
    // TODO: Check for focus indicator styles
  });

  it('primary button should have visible focus indicator', () => {
    // TODO: Render a button component
    // TODO: Focus the button
    // TODO: Verify outline, box-shadow, or other focus indicator is present
  });
});
```

### Step 3: Implement the Tests
Use `@testing-library/react` and look at how other components test focus:
```typescript
// Example pattern:
const button = screen.getByRole('button', { name: /submit/i });
button.focus();
expect(document.activeElement).toBe(button);
```

### Step 4: Run and Verify
```bash
# Run just your new test
npm run test -- src/components/__tests__/keyboard-focus.smoke.test.tsx

# Run all tests to ensure you didn't break anything
npm run test

# Check coverage (optional)
npm run test:coverage
```

## 📚 Resources

- [WCAG 2.2 Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Existing accessibility test](../../e2e/accessibility.spec.ts) - Comprehensive example
- [Vitest Docs](https://vitest.dev/)
- `src/test/setup.ts` - Test setup configuration

## 💡 Tips

- Start simple—just test that a button can receive focus
- Use `screen.getByRole('button')` to find buttons
- Check `document.activeElement` after calling `.focus()`
- For focus indicators, check computed styles or class names
- Don't worry about testing every component—just one or two buttons is enough for a smoke test
- Look at how the comprehensive e2e test checks focus in `e2e/accessibility.spec.ts` (line 400+)

## 🧪 What to Test

A minimal smoke test should verify:
1. **Keyboard reachability**: Can you focus the element via keyboard (tab/focus)?
2. **Focus indicator**: Is there a visible indicator when focused?

You can test:
- A primary "Submit" or "Save" button
- A "Cancel" button
- Any button from the main dashboard

## 🎁 Bonus Points

- Test multiple button variants (primary, secondary, danger)
- Add a test for links (`<a>` tags)
- Add a test for form inputs
- Check that focus indicators meet contrast requirements
- Add a test that verifies focus order makes sense

## 🤝 Need Help?

- Review the existing `TraumaInformedHooks.test.tsx` for patterns
- Ask in issue comments about which component to test
- Check the `src/components/` directory for button components
- Look at how `e2e/accessibility.spec.ts` tests focus behavior (line 400-450)
- The `testFocusBehavior` function in the e2e test is a good reference

## ⚠️ Important Notes

- This is a **smoke test**, not comprehensive accessibility testing
- The comprehensive a11y tests are in `e2e/accessibility.spec.ts`
- This test should run fast (< 1 second) and catch basic regressions
- Don't duplicate the comprehensive tests—keep this simple and focused
- Follow the existing test patterns in the repository
