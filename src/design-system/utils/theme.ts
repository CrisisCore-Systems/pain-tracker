// Theme helper utilities for design tokens
import { cssVariables, brand } from '../brand';

export const colorVar = (name: string) => {
  // Prefer runtime computed style in browser
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      const computed = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
      if (computed) return computed;
    } catch (err) {
       
      console.warn('colorVar computedStyle failed', err);
    }
  }

  // Fallback to brand-defined cssVariables (concrete hex values)
  try {
    if (cssVariables && cssVariables[':root'] && Object.prototype.hasOwnProperty.call(cssVariables[':root'], `--${name}`)) {
      return (cssVariables[':root'] as Record<string, string>)[`--${name}`];
    }
  } catch (err) {
    // ignore
  }

  // Final fallback to a neutral brand color
  return brand.colors.neutral?.[500] ?? '#64748b';
};

// Convert hex color (#rrggbb or #rgb) to rgba string with provided alpha
function hexToRgba(hex: string, alpha: number) {
  if (!hex) return '';
  const h = hex.trim().replace('#', '');
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return '';
}

export const colorVarAlpha = (name: string, alpha: number | string) => {
  const alphaNum = typeof alpha === 'string' ? parseFloat(alpha) : alpha;

  // Try computed style first (browser)
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      const computed = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
      if (computed) {
        if (computed.startsWith('#')) {
          const rgba = hexToRgba(computed, Number.isFinite(alphaNum) ? alphaNum : 1);
          if (rgba) return rgba;
        }

        const rgbMatch = computed.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
        if (rgbMatch) {
          const r = rgbMatch[1], g = rgbMatch[2], b = rgbMatch[3];
          return `rgba(${r}, ${g}, ${b}, ${Number.isFinite(alphaNum) ? alphaNum : 1})`;
        }
      }
    } catch (err) {
       
      console.warn('colorVarAlpha computedStyle failed', err);
    }
  }

  // Fallback to brand css variables
  try {
    if (cssVariables && cssVariables[':root'] && Object.prototype.hasOwnProperty.call(cssVariables[':root'], `--${name}`)) {
      const val = (cssVariables[':root'] as Record<string, string>)[`--${name}`];
      if (val && val.startsWith('#')) {
        const rgba = hexToRgba(val, Number.isFinite(alphaNum) ? alphaNum : 1);
        if (rgba) return rgba;
      }
      const rgbMatch = (val || '').match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
      if (rgbMatch) {
        const r = rgbMatch[1], g = rgbMatch[2], b = rgbMatch[3];
        return `rgba(${r}, ${g}, ${b}, ${Number.isFinite(alphaNum) ? alphaNum : 1})`;
      }
    }
  } catch (err) {
    // ignore
  }

  // Final fallback: neutral brand color with alpha
  const fallback = brand.colors.neutral?.[500] ?? '#64748b';
  if (fallback.startsWith('#')) {
    const rgba = hexToRgba(fallback, Number.isFinite(alphaNum) ? alphaNum : 1);
    if (rgba) return rgba;
  }

  return fallback;
};

export const shadowVar = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => `var(--shadow-${size})`;

export const radiusVar = () => `var(--radius)`;

export default {
  colorVar,
  colorVarAlpha,
  shadowVar,
  radiusVar,
};
