// Chart color utilities for consistent, accessible chart styling
import { brand } from '../brand';

// Utility to read an RGB CSS variable (like "14 165 233") and return hex or rgba
const root = (typeof window !== 'undefined' && window?.document?.documentElement) || null;

function readCssRgbVar(varName: string): string | null {
  try {
    if (!root) return null;
    const val = getComputedStyle(root).getPropertyValue(varName).trim();
    if (!val) return null;
    // Expecting `r g b` or `r, g, b` or `#hex`
    if (val.startsWith('#')) return val;
    // normalize commas
    const cleaned = val.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
    const parts = cleaned.split(' ');
    if (parts.length === 3 && parts.every(p => /^\d+$/.test(p))) {
      const [r, g, b] = parts.map(Number);
      return `rgb(${r} ${g} ${b})`;
    }
    return val || null;
  } catch {
    return null;
  }
}

function rgbStringToRgba(rgbLike: string, alpha = 1): string {
  if (!rgbLike) return `rgba(0,0,0,${alpha})`;
  // handle formats like 'rgb(r g b)' or 'r g b' or '#rrggbb'
  const hexMatch = rgbLike.match(/^#([0-9a-fA-F]{6})$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const numMatch =
    rgbLike.match(/(\d+)\s*(?:[, ])\s*(\d+)\s*(?:[, ])\s*(\d+)/) ||
    rgbLike.match(/(\d+)\s+(\d+)\s+(\d+)/);
  if (numMatch) {
    const r = Number(numMatch[1]);
    const g = Number(numMatch[2]);
    const b = Number(numMatch[3]);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // fallback: return provided string with alpha using css color-function if possible
  return `rgba(0,0,0,${alpha})`;
}

// Resolve a CSS variable name to an rgba string, falling back to a brand value
function resolveColor(varName: string, fallbackHex?: string, alpha = 1): string {
  const cssVal = readCssRgbVar(varName);
  if (cssVal) return rgbStringToRgba(cssVal, alpha);
  if (fallbackHex) return rgbStringToRgba(fallbackHex, alpha);
  return `rgba(0,0,0,${alpha})`;
}

// Chart color palettes derived from CSS variables (ensures theme adaptability)
export const chartColors = {
  pain: {
    none: resolveColor('--color-pain-none', brand.colors.pain.none),
    mild: resolveColor('--color-pain-mild', brand.colors.pain.mild),
    moderate: resolveColor('--color-pain-moderate', brand.colors.pain.moderate),
    severe: resolveColor('--color-pain-severe', brand.colors.pain.severe),
    extreme: resolveColor('--color-pain-extreme', brand.colors.pain.extreme),
  },

  treatment: {
    primary: resolveColor('--chart-series-2', brand.colors.secondary[500]),
    medication: resolveColor('--chart-series-3', brand.colors.accent[500]),
    therapy: resolveColor('--chart-series-1', brand.colors.primary[600]),
    lifestyle: resolveColor('--chart-series-6', brand.colors.neutral[600]),
  },

  analytics: {
    trend: resolveColor('--chart-series-1', brand.colors.primary[500]),
    average: resolveColor('--chart-series-2', brand.colors.secondary[500]),
    prediction: resolveColor('--chart-series-3', brand.colors.accent[400]),
    baseline: resolveColor('--chart-series-6', brand.colors.neutral[500]),
  },

  status: {
    normal: resolveColor('--chart-series-1', brand.colors.status.info),
    warning: resolveColor('--chart-series-4', brand.colors.status.warning),
    critical: resolveColor('--chart-series-6', brand.colors.status.error),
    success: resolveColor('--chart-series-2', brand.colors.status.success),
  },

  series: [
    resolveColor('--chart-series-1', brand.colors.primary[500]),
    resolveColor('--chart-series-2', brand.colors.secondary[500]),
    resolveColor('--chart-series-3', brand.colors.accent[500]),
    resolveColor('--chart-series-4', brand.colors.pain.severe),
    resolveColor('--chart-series-5', brand.colors.pain.moderate),
    resolveColor('--chart-series-6', brand.colors.neutral[600]),
    resolveColor('--chart-series-1', brand.colors.primary[700]),
    resolveColor('--chart-series-2', brand.colors.secondary[700]),
    resolveColor('--chart-series-3', brand.colors.accent[700]),
    resolveColor('--chart-series-6', brand.colors.pain.extreme),
  ],
};

// Helper functions for chart colors
export const getChartColor = (
  index: number,
  palette: keyof typeof chartColors = 'series'
): string => {
  const colorArray = chartColors[palette] as unknown;
  if (Array.isArray(colorArray)) return colorArray[index % colorArray.length];
  // if palette is an object, return a stable value
  if (typeof colorArray === 'object' && colorArray !== null) {
    const values = Object.values(colorArray as Record<string, unknown>);
    return String(values[index % values.length]);
  }
  return chartColors.series[index % chartColors.series.length];
};

export const getChartColorAlpha = (
  index: number,
  alpha: number = 0.2,
  palette: keyof typeof chartColors = 'series'
): string => {
  const color = getChartColor(index, palette);
  // color is already an rgba string from resolveColor
  if (color.startsWith('rgba')) {
    // replace alpha
    return color.replace(
      /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)/,
      `rgba($1, $2, $3, ${alpha})`
    );
  }
  // fallback: try to parse numeric rgb
  return rgbStringToRgba(color, alpha);
};

// Pain level color mapping
export const getPainLevelColor = (painLevel: number): string => {
  if (painLevel === 0) return chartColors.pain.none;
  if (painLevel <= 2) return chartColors.pain.mild;
  if (painLevel <= 5) return chartColors.pain.moderate;
  if (painLevel <= 7) return chartColors.pain.severe;
  return chartColors.pain.extreme;
};

// Treatment type color mapping
export const getTreatmentColor = (treatmentType: string): string => {
  switch (treatmentType.toLowerCase()) {
    case 'medication':
    case 'meds':
      return chartColors.treatment.medication;
    case 'therapy':
    case 'physical therapy':
    case 'pt':
      return chartColors.treatment.therapy;
    case 'lifestyle':
    case 'exercise':
    case 'diet':
      return chartColors.treatment.lifestyle;
    default:
      return chartColors.treatment.primary;
  }
};

// Default chart configuration colors
export const defaultChartColors = {
  line: {
    stroke: chartColors.analytics.trend,
    fill: getChartColorAlpha(0, 0.1, 'analytics'),
  },
  bar: {
    background: chartColors.analytics.trend,
    border: chartColors.analytics.trend,
  },
  treatment: {
    line: chartColors.treatment.primary,
    medication: chartColors.treatment.medication,
    therapy: chartColors.treatment.therapy,
  },
};
