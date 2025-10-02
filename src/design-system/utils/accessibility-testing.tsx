/**
 * Accessibility Testing Utilities
 * Tools for testing and validating accessibility compliance
 */

import React from 'react';

/**
 * Test for keyboard navigation support
 */
export const testKeyboardNavigation = (element: HTMLElement): boolean => {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  return focusableElements.length > 0;
};

/**
 * Test for proper ARIA labels
 */
export const testAriaLabels = (element: HTMLElement): { passed: boolean; issues: string[] } => {
  const issues: string[] = [];
  const interactiveElements = element.querySelectorAll('button, input, select, textarea, [role]');

  interactiveElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const hasAriaLabel = htmlEl.hasAttribute('aria-label') || htmlEl.hasAttribute('aria-labelledby');
    const hasLabel = !!htmlEl.closest('label') || !!htmlEl.getAttribute('id') && !!document.querySelector(`label[for="${htmlEl.getAttribute('id')}"]`);

    if (!hasAriaLabel && !hasLabel && !htmlEl.textContent?.trim()) {
      issues.push(`Interactive element missing accessible label: ${htmlEl.tagName}${htmlEl.className ? '.' + htmlEl.className.split(' ').join('.') : ''}`);
    }
  });

  return {
    passed: issues.length === 0,
    issues,
  };
};

/**
 * Test for proper heading hierarchy
 */
export const testHeadingHierarchy = (element: HTMLElement): { passed: boolean; issues: string[] } => {
  const issues: string[] = [];
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;

  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level - lastLevel > 1) {
      issues.push(`Skipped heading level: ${heading.tagName} after h${lastLevel}`);
    }
    lastLevel = level;
  });

  return {
    passed: issues.length === 0,
    issues,
  };
};

/**
 * Test for sufficient color contrast
 */
export const testColorContrast = (element: HTMLElement): { passed: boolean; issues: string[] } => {
  const issues: string[] = [];

  // This is a simplified check - in a real implementation, you'd use a proper color contrast library
  const textElements = element.querySelectorAll('*');

  textElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const computedStyle = window.getComputedStyle(htmlEl);
    const backgroundColor = computedStyle.backgroundColor;

    // Basic check for transparent backgrounds
    if (backgroundColor.includes('rgba') && backgroundColor.includes('0)')) {
      issues.push(`Element may have insufficient contrast: ${htmlEl.tagName}${htmlEl.className ? '.' + htmlEl.className.split(' ').join('.') : ''}`);
    }
  });

  return {
    passed: issues.length === 0,
    issues,
  };
};

/**
 * Test for proper focus management
 */
export const testFocusManagement = (): { passed: boolean; issues: string[] } => {
  const issues: string[] = [];

  // Check for focus-visible styles
  const styleSheets = document.styleSheets;
  let hasFocusVisible = false;

  for (let i = 0; i < styleSheets.length; i++) {
    try {
      const rules = styleSheets[i].cssRules;
      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j] as CSSStyleRule;
        if (rule.selectorText && rule.selectorText.includes(':focus-visible')) {
          hasFocusVisible = true;
          break;
        }
      }
      if (hasFocusVisible) break;
    } catch {
      // Ignore cross-origin stylesheet errors
    }
  }

  if (!hasFocusVisible) {
    issues.push('No :focus-visible styles found - focus indicators may not be visible');
  }

  return {
    passed: issues.length === 0,
    issues,
  };
};

/**
 * Comprehensive accessibility test
 */
export const runAccessibilityTests = (element: HTMLElement): {
  keyboard: { passed: boolean; issues: string[] };
  aria: { passed: boolean; issues: string[] };
  headings: { passed: boolean; issues: string[] };
  contrast: { passed: boolean; issues: string[] };
  focus: { passed: boolean; issues: string[] };
  overall: { passed: boolean; totalIssues: number };
} => {
  const keyboard = { passed: testKeyboardNavigation(element), issues: [] };
  const aria = testAriaLabels(element);
  const headings = testHeadingHierarchy(element);
  const contrast = testColorContrast(element);
  const focus = testFocusManagement();

  const totalIssues = [
    ...aria.issues,
    ...headings.issues,
    ...contrast.issues,
    ...focus.issues,
  ].length;

  return {
    keyboard,
    aria,
    headings,
    contrast,
    focus,
    overall: {
      passed: totalIssues === 0,
      totalIssues,
    },
  };
};

/**
 * React hook for accessibility testing in development
 */
const getNodeEnv = () => {
  try {
    if (typeof (import.meta as any) !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env.MODE || (import.meta as any).env.NODE_ENV;
    }
  } catch {
    // import.meta not available, fall through to process.env
  }
  if (typeof process !== 'undefined' && (process as any).env) {
    return (process as any).env.NODE_ENV || (process as any).env.MODE;
  }
  return undefined;
};

export const useAccessibilityTesting = (enabled = getNodeEnv() === 'development') => {
  const [results, setResults] = React.useState<ReturnType<typeof runAccessibilityTests> | null>(null);

  const testElement = React.useCallback((element: HTMLElement | null) => {
    if (!enabled || !element) return;

    const testResults = runAccessibilityTests(element);
    setResults(testResults);

    // Log results to console in development
    if (!testResults.overall.passed) {
      console.warn('Accessibility Issues Found:', testResults);
    }
  }, [enabled]);

  return { results, testElement };
};
