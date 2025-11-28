/**
 * Accessibility Screenshot Configuration
 * Defines screenshots demonstrating accessibility features
 */

export const ACCESSIBILITY_SCREENSHOT_CATEGORIES = {
  TEXT_SIZE: 'text-size',
  CONTRAST: 'contrast',
  NAVIGATION: 'navigation',
  COGNITIVE: 'cognitive-support',
  COMPARISON: 'comparison',
};

export const ACCESSIBILITY_SCREENSHOTS = [
  // Large Text Options
  {
    id: 'text-size-small',
    name: 'text-size-small.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.TEXT_SIZE,
    description: 'Small text size (14px) - Compact interface',
    url: '/app',
    width: 1920,
    height: 1080,
    priority: 'phase1',
    deviceScaleFactor: 2,
    waitForSelector: '[data-testid="pain-entry-form"], .pain-tracker-dashboard, main',
    preferences: {
      fontSize: 'small',
      contrast: 'normal',
      simplifiedMode: false,
    }
  },
  {
    id: 'text-size-medium',
    name: 'text-size-medium.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.TEXT_SIZE,
    description: 'Medium text size (16px) - Default interface',
    url: '/app',
    width: 1920,
    height: 1080,
    priority: 'phase1',
    deviceScaleFactor: 2,
    waitForSelector: '[data-testid="pain-entry-form"], .pain-tracker-dashboard, main',
    preferences: {
      fontSize: 'medium',
      contrast: 'normal',
      simplifiedMode: false,
    }
  },
  {
    id: 'text-size-large',
    name: 'text-size-large.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.TEXT_SIZE,
    description: 'Large text size (18px) - Enhanced readability',
    url: '/app',
    width: 1920,
    height: 1080,
    priority: 'phase1',
    deviceScaleFactor: 2,
    waitForSelector: '[data-testid="pain-entry-form"], .pain-tracker-dashboard, main',
    preferences: {
      fontSize: 'large',
      contrast: 'normal',
      simplifiedMode: false,
    }
  },
  {
    id: 'text-size-xl',
    name: 'text-size-xl.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.TEXT_SIZE,
    description: 'Extra large text size (20px) - Maximum readability',
    url: '/app',
    width: 1920,
    height: 1080,
    priority: 'phase1',
    deviceScaleFactor: 2,
    waitForSelector: '[data-testid="pain-entry-form"], .pain-tracker-dashboard, main',
    preferences: {
      fontSize: 'xl',
      contrast: 'normal',
      simplifiedMode: false,
    }
  },

  // High Contrast Modes
  {
    id: 'contrast-normal',
    name: 'contrast-normal.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.CONTRAST,
    description: 'Normal contrast - Standard interface colors',
    url: '/app',
    width: 1920,
    height: 1080,
    priority: 'phase1',
    deviceScaleFactor: 2,
    preferences: {
      fontSize: 'medium',
      contrast: 'normal',
      simplifiedMode: false,
    }
  },
  {
    id: 'contrast-high',
    name: 'contrast-high.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.CONTRAST,
    description: 'High contrast - Enhanced visibility',
    url: '/app',
    width: 1920,
    height: 1080,
    priority: 'phase1',
    deviceScaleFactor: 2,
    preferences: {
      fontSize: 'medium',
      contrast: 'high',
      simplifiedMode: false,
    }
  },
  {
    id: 'contrast-extra-high',
    name: 'contrast-extra-high.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.CONTRAST,
    description: 'Extra high contrast - Maximum visibility',
    url: '/app',
    width: 1920,
    height: 1080,
    priority: 'phase1',
    deviceScaleFactor: 2,
    preferences: {
      fontSize: 'medium',
      contrast: 'extra-high',
      simplifiedMode: false,
    }
  },

  // Simplified Navigation
  {
    id: 'navigation-full',
    name: 'navigation-full.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.NAVIGATION,
    description: 'Full navigation - All features visible',
    url: '/app',
    width: 1920,
    height: 1080,
    priority: 'phase1',
    deviceScaleFactor: 2,
    preferences: {
      fontSize: 'medium',
      contrast: 'normal',
      simplifiedMode: false,
      showMemoryAids: true,
    }
  },
  {
    id: 'navigation-simplified',
    name: 'navigation-simplified.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.NAVIGATION,
    description: 'Simplified navigation - Essential features only',
    url: '/app',
    width: 1920,
    height: 1080,
    priority: 'phase1',
    deviceScaleFactor: 2,
    preferences: {
      fontSize: 'medium',
      contrast: 'normal',
      simplifiedMode: true,
      showMemoryAids: true,
    }
  },

  // Cognitive Load Indicators
  {
    id: 'cognitive-support-full',
    name: 'cognitive-support-full.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.COGNITIVE,
    description: 'Full cognitive support - All aids enabled',
    url: '/app',
    width: 1920,
    height: 1080,
    priority: 'phase1',
    deviceScaleFactor: 2,
    preferences: {
      fontSize: 'large',
      contrast: 'normal',
      simplifiedMode: true,
      showMemoryAids: true,
      showProgress: true,
      showCognitiveLoadIndicators: true,
      autoSave: true,
    }
  },
  {
    id: 'cognitive-load-indicators',
    name: 'cognitive-load-indicators.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.COGNITIVE,
    description: 'Cognitive load indicators - Visual feedback for mental effort',
    url: '/app',
    width: 1920,
    height: 1080,
    priority: 'phase1',
    deviceScaleFactor: 2,
    preferences: {
      fontSize: 'medium',
      contrast: 'normal',
      simplifiedMode: true,
      showCognitiveLoadIndicators: true,
      adaptiveComplexity: true,
    }
  },

  // Accessibility Settings Panel
  {
    id: 'accessibility-settings-panel',
    name: 'accessibility-settings-panel.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.NAVIGATION,
    description: 'Accessibility settings panel - Full customization options',
    url: '/app',
    width: 1920,
    height: 1080,
    priority: 'phase1',
    deviceScaleFactor: 2,
    preferences: {
      fontSize: 'medium',
      contrast: 'normal',
      simplifiedMode: false,
    }
  },

  // Comparison Screenshots
  {
    id: 'comparison-text-sizes',
    name: 'comparison-text-sizes.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.COMPARISON,
    description: 'Side-by-side comparison of text sizes',
    width: 1920,
    height: 1080,
    priority: 'phase1',
    deviceScaleFactor: 2,
    isComposite: true,
    compositeOf: ['text-size-small', 'text-size-medium', 'text-size-large', 'text-size-xl']
  },
  {
    id: 'comparison-contrast-modes',
    name: 'comparison-contrast-modes.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.COMPARISON,
    description: 'Side-by-side comparison of contrast modes',
    width: 1920,
    height: 1080,
    priority: 'phase1',
    deviceScaleFactor: 2,
    isComposite: true,
    compositeOf: ['contrast-normal', 'contrast-high', 'contrast-extra-high']
  },
  {
    id: 'comparison-navigation-modes',
    name: 'comparison-navigation-modes.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.COMPARISON,
    description: 'Side-by-side comparison of full vs simplified navigation',
    width: 1920,
    height: 1080,
    priority: 'phase1',
    deviceScaleFactor: 2,
    isComposite: true,
    compositeOf: ['navigation-full', 'navigation-simplified']
  },

  // Mobile Accessibility
  {
    id: 'mobile-large-text',
    name: 'mobile-large-text.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.TEXT_SIZE,
    description: 'Mobile view with large text and touch targets',
    url: '/app',
    width: 390,
    height: 844,
    priority: 'phase1',
    deviceScaleFactor: 3,
    preferences: {
      fontSize: 'large',
      contrast: 'normal',
      simplifiedMode: true,
      touchTargetSize: 'extra-large',
    }
  },
  {
    id: 'mobile-high-contrast',
    name: 'mobile-high-contrast.png',
    category: ACCESSIBILITY_SCREENSHOT_CATEGORIES.CONTRAST,
    description: 'Mobile view with high contrast mode',
    url: '/app',
    width: 390,
    height: 844,
    priority: 'phase1',
    deviceScaleFactor: 3,
    preferences: {
      fontSize: 'medium',
      contrast: 'extra-high',
      simplifiedMode: true,
    }
  },
];

// Helper functions
export function getAccessibilityScreenshotsByCategory(category) {
  return ACCESSIBILITY_SCREENSHOTS.filter(s => s.category === category);
}

export function getAccessibilityScreenshotsByPriority(priority) {
  return ACCESSIBILITY_SCREENSHOTS.filter(s => s.priority === priority);
}

export function getNonCompositeScreenshots() {
  return ACCESSIBILITY_SCREENSHOTS.filter(s => !s.isComposite);
}

export function getCompositeScreenshots() {
  return ACCESSIBILITY_SCREENSHOTS.filter(s => s.isComposite);
}
