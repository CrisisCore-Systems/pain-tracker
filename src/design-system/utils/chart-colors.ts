// Chart color utilities for consistent, accessible chart styling
import { brand } from '../brand';

// Chart color palettes for different use cases
export const chartColors = {
  // Pain level colors (matches brand pain colors)
  pain: {
    none: brand.colors.pain.none,        // Green
    mild: brand.colors.pain.mild,        // Light green
    moderate: brand.colors.pain.moderate, // Yellow
    severe: brand.colors.pain.severe,    // Orange
    extreme: brand.colors.pain.extreme   // Red
  },

  // Treatment and medication colors
  treatment: {
    primary: brand.colors.secondary[500],    // Healing green
    medication: brand.colors.accent[500],    // Professional purple
    therapy: brand.colors.primary[600],      // Blue
    lifestyle: brand.colors.neutral[600]     // Gray
  },

  // Analytics and trends
  analytics: {
    trend: brand.colors.primary[500],        // Primary blue
    average: brand.colors.secondary[500],    // Healing green
    prediction: brand.colors.accent[400],    // Light purple
    baseline: brand.colors.neutral[500]      // Neutral gray
  },

  // Status and alerts
  status: {
    normal: brand.colors.status.info,        // Blue
    warning: brand.colors.status.warning,    // Orange
    critical: brand.colors.status.error,     // Red
    success: brand.colors.status.success     // Green
  },

  // Multi-series color palette (accessible and distinct)
  series: [
    brand.colors.primary[500],      // Blue
    brand.colors.secondary[500],    // Green
    brand.colors.accent[500],       // Purple
    brand.colors.pain.severe,       // Orange
    brand.colors.pain.mild,         // Light green
    brand.colors.neutral[600],      // Gray
    brand.colors.primary[700],      // Dark blue
    brand.colors.secondary[700],    // Dark green
    brand.colors.accent[700],       // Dark purple
    brand.colors.pain.extreme       // Red
  ]
};

// Helper functions for chart colors
export const getChartColor = (index: number, palette: keyof typeof chartColors = 'series'): string => {
  const colorArray = chartColors[palette];
  if (Array.isArray(colorArray)) {
    return colorArray[index % colorArray.length];
  }
  return chartColors.series[index % chartColors.series.length];
};

export const getChartColorAlpha = (index: number, alpha: number = 0.2, palette: keyof typeof chartColors = 'series'): string => {
  const color = getChartColor(index, palette);
  // Convert hex to rgba
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
    fill: getChartColorAlpha(0, 0.1, 'analytics')
  },
  bar: {
    background: chartColors.analytics.trend,
    border: chartColors.analytics.trend
  },
  treatment: {
    line: chartColors.treatment.primary,
    medication: chartColors.treatment.medication,
    therapy: chartColors.treatment.therapy
  }
};
