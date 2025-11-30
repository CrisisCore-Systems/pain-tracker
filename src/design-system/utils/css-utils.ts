/**
 * CSS Utilities for Theme Management
 * Provides optimized helpers for CSS variable manipulation and theme transitions
 */

/**
 * Batch update CSS custom properties for better performance
 * Uses requestAnimationFrame to batch DOM writes
 */
export function batchSetCSSProperties(
  properties: Record<string, string>,
  target: HTMLElement = document.documentElement
): void {
  requestAnimationFrame(() => {
    Object.entries(properties).forEach(([key, value]) => {
      target.style.setProperty(key, value);
    });
  });
}

/**
 * Convert hex color to RGB string format for CSS variables
 * @example hexToRgb('#3b82f6') => '59 130 246'
 */
export function hexToRgb(hex: string | undefined): string {
  if (!hex) return '0 0 0';
  const h = hex.replace('#', '').trim();
  if (h.length !== 6) return '0 0 0';
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/**
 * Convert RGB string back to hex
 * @example rgbToHex('59 130 246') => '#3b82f6'
 */
export function rgbToHex(rgb: string): string {
  const [r, g, b] = rgb.split(' ').map(Number);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * Get computed CSS variable value from an element
 */
export function getCSSVariable(
  name: string,
  target: HTMLElement = document.documentElement
): string {
  return getComputedStyle(target).getPropertyValue(name).trim();
}

/**
 * Create CSS variable string from value
 * @example cssVar('primary-500') => 'var(--primary-500)'
 */
export function cssVar(name: string, fallback?: string): string {
  return fallback ? `var(--${name}, ${fallback})` : `var(--${name})`;
}

/**
 * Generate HSL color with adjusted lightness for accessibility
 * @param h Hue (0-360)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 */
export function hsl(h: number, s: number, l: number): string {
  return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Ensure color has sufficient contrast ratio
 * Returns true if the contrast ratio is >= 4.5:1 (WCAG AA for normal text)
 */
export function hasAdequateContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AAA' ? ratio >= 7 : ratio >= 4.5;
}

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.1 guidelines
 */
export function getContrastRatio(foreground: string, background: string): number {
  const lum1 = getLuminance(foreground);
  const lum2 = getLuminance(background);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get relative luminance of a color
 * Per WCAG 2.1 definition
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex).split(' ').map(Number);
  const [r, g, b] = rgb.map((val) => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Generate a severity color based on pain scale (0-10)
 * Uses a perceptually uniform color scale
 */
export function getSeverityColor(level: number, isDark: boolean = true): string {
  // Clamp to 0-10
  const clampedLevel = Math.max(0, Math.min(10, level));

  // Use HSL for perceptually uniform gradients
  // Hue shifts from green (120) to red (0) as severity increases
  const hue = 120 - clampedLevel * 12;

  // Adjust saturation and lightness for dark/light modes
  const saturation = 50 + clampedLevel * 3;
  const lightness = isDark ? 55 - clampedLevel * 2 : 45 + clampedLevel * 2;

  return hsl(hue, saturation, lightness);
}

/**
 * CSS-in-JS helper to create transition string
 */
export function createTransition(
  properties: string[],
  duration: string = 'var(--duration-fast)',
  easing: string = 'var(--easing-standard)'
): string {
  return properties.map((prop) => `${prop} ${duration} ${easing}`).join(', ');
}

/**
 * Prefers reduced motion helper
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Add smooth theme transition class temporarily
 */
export function addThemeTransition(
  duration: number = 150,
  target: HTMLElement = document.documentElement
): () => void {
  target.classList.add('theme-transitioning');
  const timeout = setTimeout(() => {
    target.classList.remove('theme-transitioning');
  }, duration);

  return () => {
    clearTimeout(timeout);
    target.classList.remove('theme-transitioning');
  };
}
