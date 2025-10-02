/**
 * Design System Theme Configuration
 * Modern design tokens following Material Design 3.0 principles
 */

export type ThemeMode = 'light' | 'dark' | 'high-contrast' | 'colorblind';

// Lightweight explicit shape for the small set of theme tokens returned by
// getThemeColors. Using an explicit interface keeps TypeScript happy when
// consumers access semantic keys like `warning`, `info`, `success`, etc.
export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  // Semantic helpers used across the app
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface Colors {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
}

export interface Typography {
  fontFamily: {
    sans: string[];
    mono: string[];
  };
  // Allow additional semantic font size keys (e.g. h1, h2, body, caption)
  fontSize: Record<string, [string, { lineHeight: string }]>;
  fontWeight: {
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
  };
}

export interface Spacing {
  // Allow arbitrary spacing tokens (including touch-sm/touch-md etc.)
  [key: string]: string;
}

export interface BorderRadius {
  none: string;
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface Shadows {
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

export interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
  transitions: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      easeInOut: string;
      easeOut: string;
      easeIn: string;
    };
  };
}

// Modern color palette with accessibility in mind
const colors: Colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  accent: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    950: '#4a044e',
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },
  info: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
    950: '#083344',
  },
};

const typography: Typography = {
  fontFamily: {
    sans: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif',
    ],
    mono: [
      'Fira Code',
      'JetBrains Mono',
      'Monaco',
      'Cascadia Code',
      'Segoe UI Mono',
      'Roboto Mono',
      'Oxygen Mono',
      'Ubuntu Monospace',
      'Source Code Pro',
      'Fira Mono',
      'Droid Sans Mono',
      'Courier New',
      'monospace',
    ],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

const spacing: Spacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

const borderRadius: BorderRadius = {
  none: '0px',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

const shadows: Shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
};

export const theme: Theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    },
  },
};

// CSS Custom Properties for theming
export const getCSSCustomProperties = (mode: ThemeMode) => {
  const themeColors = getThemeColors(mode);

  return {
    // Base colors
    '--background': themeColors.background,
    '--foreground': themeColors.foreground,
    '--card': themeColors.card,
    '--card-foreground': themeColors.cardForeground,
    '--popover': themeColors.popover,
    '--popover-foreground': themeColors.popoverForeground,
    '--primary': themeColors.primary,
    '--primary-foreground': themeColors.primaryForeground,
    '--secondary': themeColors.secondary,
    '--secondary-foreground': themeColors.secondaryForeground,
    '--muted': themeColors.muted,
    '--muted-foreground': themeColors.mutedForeground,
    '--accent': themeColors.accent,
    '--accent-foreground': themeColors.accentForeground,
    '--destructive': themeColors.destructive,
    '--destructive-foreground': themeColors.destructiveForeground,
    '--border': themeColors.border,
    '--input': themeColors.input,
    '--ring': themeColors.ring,

    // Extended colors for new variants
    '--success': colors.success[500],
    '--success-foreground': colors.success[50],
    '--warning': colors.warning[500],
    '--warning-foreground': colors.warning[50],
    '--info': colors.info[500],
    '--info-foreground': colors.info[50],

    // Semantic colors
    '--success-bg': colors.success[50],
    '--success-border': colors.success[200],
    '--warning-bg': colors.warning[50],
    '--warning-border': colors.warning[200],
    '--error-bg': colors.error[50],
    '--error-border': colors.error[200],
    '--info-bg': colors.info[50],
    '--info-border': colors.info[200],
  };
};

// Theme context helpers
export const getThemeColors = (mode: ThemeMode): ThemeColors => {
  if (mode === 'high-contrast') {
    return {
      background: '#000000',
      foreground: '#ffffff',
      card: '#000000',
      cardForeground: '#ffffff',
      popover: '#000000',
      popoverForeground: '#ffffff',
      primary: '#ffff00',
      primaryForeground: '#000000',
      secondary: '#ffffff',
      secondaryForeground: '#000000',
      muted: '#333333',
      mutedForeground: '#ffffff',
      accent: '#00ffff',
      accentForeground: '#000000',
      destructive: '#ff0000',
      destructiveForeground: '#ffffff',
      // success/info/warning
      success: colors.success[500],
      successForeground: colors.success[50],
      warning: colors.warning[500],
      warningForeground: colors.warning[50],
      info: colors.info[500],
      infoForeground: colors.info[50],
      border: '#ffffff',
      input: '#ffffff',
      ring: '#ffff00',
    };
  }

  if (mode === 'colorblind') {
    return {
      background: colors.neutral[50],
      foreground: colors.neutral[900],
      card: colors.neutral[50],
      cardForeground: colors.neutral[900],
      popover: colors.neutral[50],
      popoverForeground: colors.neutral[900],
      primary: colors.neutral[800],
      primaryForeground: colors.neutral[50],
      secondary: colors.neutral[600],
      secondaryForeground: colors.neutral[50],
      muted: colors.neutral[100],
      mutedForeground: colors.neutral[700],
      accent: colors.neutral[500],
      accentForeground: colors.neutral[50],
      destructive: colors.neutral[900],
      destructiveForeground: colors.neutral[50],
      // semantic colors
      success: colors.success[500],
      successForeground: colors.success[50],
      warning: colors.warning[500],
      warningForeground: colors.warning[50],
      info: colors.info[500],
      infoForeground: colors.info[50],
      border: colors.neutral[300],
      input: colors.neutral[200],
      ring: colors.neutral[800],
    };
  }

  if (mode === 'dark') {
    return {
      background: colors.neutral[900],
      foreground: colors.neutral[50],
      card: colors.neutral[800],
      cardForeground: colors.neutral[100],
      popover: colors.neutral[800],
      popoverForeground: colors.neutral[100],
      primary: colors.primary[400],
      primaryForeground: colors.neutral[900],
      secondary: colors.neutral[700],
      secondaryForeground: colors.neutral[100],
      muted: colors.neutral[700],
      mutedForeground: colors.neutral[400],
      accent: colors.accent[400],
      accentForeground: colors.neutral[900],
      destructive: colors.error[500],
      destructiveForeground: '#ffffff',
      // semantic colors
      success: colors.success[500],
      successForeground: colors.success[50],
      warning: colors.warning[500],
      warningForeground: colors.warning[50],
      info: colors.info[500],
      infoForeground: colors.info[50],
      border: colors.neutral[700],
      input: colors.neutral[700],
      ring: colors.primary[400],
    };
  }

  return {
    background: colors.neutral[50],
    foreground: colors.neutral[900],
    card: colors.neutral[50],
    cardForeground: colors.neutral[900],
    popover: colors.neutral[50],
    popoverForeground: colors.neutral[900],
  primary: colors.primary[600],
  primaryForeground: colors.neutral[50],
    secondary: colors.neutral[100],
    secondaryForeground: colors.neutral[900],
    muted: colors.neutral[100],
    // increase muted foreground contrast for accessibility
    mutedForeground: colors.neutral[700],
    accent: colors.accent[600],
    accentForeground: colors.neutral[50],
  // use darker semantic shades for better contrast on light backgrounds
  destructive: colors.error[700],
  // ensure destructive foreground is pure white for contrast against red
  destructiveForeground: '#ffffff',
  // semantic colors (darker variants)
  success: colors.success[700],
  successForeground: colors.success[50],
  warning: colors.warning[700],
  warningForeground: colors.warning[50],
  info: colors.info[700],
  infoForeground: colors.info[50],
    border: colors.neutral[200],
    input: colors.neutral[200],
    ring: colors.primary[600],
  };
};

// Extend theme with explicit typographic scale and spacing tokens for accessibility
// Provide a small 4-step typographic scale (h1, h2, body, caption) used across the app
theme.typography.fontSize['h1'] = ['1.75rem', { lineHeight: '2.25rem' }]; // ~28px
theme.typography.fontSize['h2'] = ['1.25rem', { lineHeight: '1.75rem' }]; // ~20px
theme.typography.fontSize['body'] = theme.typography.fontSize.base; // 16px
theme.typography.fontSize['caption'] = ['0.75rem', { lineHeight: '1rem' }]; // 12px

// Add a couple of spacing tokens that map to touch-target friendly values
theme.spacing['touch-sm'] = '12px';
theme.spacing['touch-md'] = '16px';
theme.spacing['touch-lg'] = '24px';