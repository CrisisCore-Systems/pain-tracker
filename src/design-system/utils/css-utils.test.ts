import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  hexToRgb,
  rgbToHex,
  getCSSVariable,
  cssVar,
  hsl,
  hasAdequateContrast,
  getContrastRatio,
  getLuminance,
  getSeverityColor,
  createTransition,
  prefersReducedMotion,
  addThemeTransition,
  batchSetCSSProperties,
} from './css-utils';

describe('CSS Utilities', () => {
  describe('hexToRgb', () => {
    it('should convert hex to RGB string', () => {
      expect(hexToRgb('#3b82f6')).toBe('59 130 246');
      expect(hexToRgb('#ffffff')).toBe('255 255 255');
      expect(hexToRgb('#000000')).toBe('0 0 0');
    });

    it('should handle hex without #', () => {
      expect(hexToRgb('3b82f6')).toBe('59 130 246');
    });

    it('should return fallback for invalid hex', () => {
      expect(hexToRgb(undefined)).toBe('0 0 0');
      expect(hexToRgb('')).toBe('0 0 0');
      expect(hexToRgb('abc')).toBe('0 0 0');
      expect(hexToRgb('gggggg')).toBe('NaN NaN NaN');
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB string to hex', () => {
      expect(rgbToHex('59 130 246')).toBe('#3b82f6');
      expect(rgbToHex('255 255 255')).toBe('#ffffff');
      expect(rgbToHex('0 0 0')).toBe('#000000');
    });
  });

  describe('getCSSVariable', () => {
    beforeEach(() => {
      document.documentElement.style.setProperty('--test-var', 'test-value');
    });

    afterEach(() => {
      document.documentElement.style.removeProperty('--test-var');
    });

    it('should get CSS variable value from element', () => {
      const value = getCSSVariable('--test-var');
      expect(value).toBe('test-value');
    });
  });

  describe('cssVar', () => {
    it('should create CSS variable reference', () => {
      expect(cssVar('primary-500')).toBe('var(--primary-500)');
    });

    it('should include fallback when provided', () => {
      expect(cssVar('primary-500', '#3b82f6')).toBe('var(--primary-500, #3b82f6)');
    });
  });

  describe('hsl', () => {
    it('should create HSL color string', () => {
      expect(hsl(220, 50, 50)).toBe('hsl(220, 50%, 50%)');
      expect(hsl(0, 100, 50)).toBe('hsl(0, 100%, 50%)');
    });
  });

  describe('getLuminance', () => {
    it('should calculate relative luminance', () => {
      // White has luminance ~1
      expect(getLuminance('#ffffff')).toBeCloseTo(1, 2);
      // Black has luminance ~0
      expect(getLuminance('#000000')).toBeCloseTo(0, 2);
      // Gray should be somewhere in between
      const grayLum = getLuminance('#808080');
      expect(grayLum).toBeGreaterThan(0);
      expect(grayLum).toBeLessThan(1);
    });
  });

  describe('getContrastRatio', () => {
    it('should calculate contrast ratio between colors', () => {
      // Black on white should have max contrast (~21:1)
      expect(getContrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0);
      // Same color should have 1:1 ratio
      expect(getContrastRatio('#808080', '#808080')).toBeCloseTo(1, 1);
    });
  });

  describe('hasAdequateContrast', () => {
    it('should return true for adequate AA contrast', () => {
      expect(hasAdequateContrast('#000000', '#ffffff')).toBe(true);
      expect(hasAdequateContrast('#333333', '#ffffff')).toBe(true);
    });

    it('should return false for inadequate contrast', () => {
      expect(hasAdequateContrast('#777777', '#888888')).toBe(false);
    });

    it('should check AAA level when specified', () => {
      // Some combinations pass AA but not AAA
      const lightGray = '#767676';
      const white = '#ffffff';
      // This passes AA (4.54:1) but not AAA (7:1)
      expect(hasAdequateContrast(lightGray, white, 'AA')).toBe(true);
      expect(hasAdequateContrast(lightGray, white, 'AAA')).toBe(false);
    });
  });

  describe('getSeverityColor', () => {
    it('should return green-ish colors for low severity', () => {
      const color = getSeverityColor(0);
      expect(color).toContain('hsl(120'); // Green hue
    });

    it('should return red-ish colors for high severity', () => {
      const color = getSeverityColor(10);
      expect(color).toContain('hsl(0'); // Red hue
    });

    it('should clamp values outside 0-10 range', () => {
      const lowColor = getSeverityColor(-5);
      const zeroColor = getSeverityColor(0);
      expect(lowColor).toBe(zeroColor);

      const highColor = getSeverityColor(15);
      const tenColor = getSeverityColor(10);
      expect(highColor).toBe(tenColor);
    });

    it('should adjust for light/dark mode', () => {
      const darkColor = getSeverityColor(5, true);
      const lightColor = getSeverityColor(5, false);
      expect(darkColor).not.toBe(lightColor);
    });
  });

  describe('createTransition', () => {
    it('should create transition string for single property', () => {
      const transition = createTransition(['opacity']);
      expect(transition).toBe('opacity var(--duration-fast) var(--easing-standard)');
    });

    it('should create transition string for multiple properties', () => {
      const transition = createTransition(['opacity', 'transform']);
      expect(transition).toContain('opacity');
      expect(transition).toContain('transform');
    });

    it('should use custom duration and easing', () => {
      const transition = createTransition(['opacity'], '300ms', 'ease-in-out');
      expect(transition).toBe('opacity 300ms ease-in-out');
    });
  });

  describe('prefersReducedMotion', () => {
    let originalMatchMedia: typeof window.matchMedia;

    beforeEach(() => {
      originalMatchMedia = window.matchMedia;
    });

    afterEach(() => {
      window.matchMedia = originalMatchMedia;
    });

    it('should return true when reduced motion is preferred', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: true });
      expect(prefersReducedMotion()).toBe(true);
    });

    it('should return false when reduced motion is not preferred', () => {
      window.matchMedia = vi.fn().mockReturnValue({ matches: false });
      expect(prefersReducedMotion()).toBe(false);
    });
  });

  describe('addThemeTransition', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      document.documentElement.classList.remove('theme-transitioning');
    });

    afterEach(() => {
      vi.useRealTimers();
      document.documentElement.classList.remove('theme-transitioning');
    });

    it('should add and remove theme transition class', () => {
      addThemeTransition(100);

      expect(document.documentElement.classList.contains('theme-transitioning')).toBe(true);

      vi.advanceTimersByTime(100);

      expect(document.documentElement.classList.contains('theme-transitioning')).toBe(false);
    });

    it('should return cleanup function', () => {
      const cleanup = addThemeTransition(100);

      expect(document.documentElement.classList.contains('theme-transitioning')).toBe(true);

      cleanup();

      expect(document.documentElement.classList.contains('theme-transitioning')).toBe(false);
    });
  });

  describe('batchSetCSSProperties', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
      document.documentElement.style.removeProperty('--batch-test-1');
      document.documentElement.style.removeProperty('--batch-test-2');
    });

    it('should batch CSS property updates in animation frame', () => {
      batchSetCSSProperties({
        '--batch-test-1': 'value1',
        '--batch-test-2': 'value2',
      });

      // Not set immediately
      expect(document.documentElement.style.getPropertyValue('--batch-test-1')).toBe('');

      // Run animation frame
      vi.runAllTimers();

      expect(document.documentElement.style.getPropertyValue('--batch-test-1')).toBe('value1');
      expect(document.documentElement.style.getPropertyValue('--batch-test-2')).toBe('value2');
    });
  });
});
