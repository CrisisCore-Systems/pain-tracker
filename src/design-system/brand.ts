// Pain Tracker Brand Identity System

// Helper function to get correct asset URLs with base path
const getAssetUrl = (path: string): string => {
  if (typeof window !== 'undefined') {
    // Client-side: use import.meta.env if available
    const baseUrl = import.meta.env?.BASE_URL || '/';
    return `${baseUrl}${path}`.replace(/\/+/g, '/');
  }
  // Fallback for SSR or other contexts
  return path.startsWith('/') ? path : `/${path}`;
};

export const brand = {
  // Brand Identity
  name: 'Pain Tracker Pro',
  tagline: 'Privacy-First Pain Tracking',
  description: 'Local-first pain tracking with insights and shareable exports',

  // Brand Colors - Medical/Healthcare Palette
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9', // Primary brand color
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },

    // Secondary - Healing Green
    secondary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Secondary brand color
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },

    // Accent - Professional Purple
    accent: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7', // Accent color
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
    },

    // Pain Level Colors
    pain: {
      none: '#10b981', // Green - No pain
      mild: '#84cc16', // Light green - Mild pain
      moderate: '#eab308', // Yellow - Moderate pain
      severe: '#f59e0b', // Orange - Severe pain
      extreme: '#ef4444', // Red - Extreme pain
    },

    // Status Colors
    status: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },

    // Neutral Colors
    neutral: {
      0: '#ffffff',
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
    },
  },

  // Typography System
  typography: {
    fonts: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      mono: ['Fira Code', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
    },

    scale: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
      '6xl': '3.75rem', // 60px
    },

    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },

  // Logo Variations
  logos: {
    primary: getAssetUrl('logos/pain-tracker-logo.svg'),
    wordmark: getAssetUrl('logos/pain-tracker-wordmark.svg'),
    icon: getAssetUrl('logos/pain-tracker-icon.svg'),
    iconWhite: getAssetUrl('logos/pain-tracker-icon-white.svg'),

    // App Icons
    appIcon: getAssetUrl('icons/app-icon-512.png'),
    favicon: getAssetUrl('icons/favicon.ico'),
  },

  // Brand Voice
  voice: {
    tone: 'Professional, Empathetic, Modern',
    personality: [
      'Trustworthy and medical-grade reliable',
      'Empathetic to pain experiences',
      'Modern technology',
      'Accessible and user-friendly',
      'Evidence-based and scientific',
    ],
  },

  // Visual Elements
  visual: {
    borderRadius: {
      sm: '0.375rem', // 6px
      md: '0.5rem', // 8px
      lg: '0.75rem', // 12px
      xl: '1rem', // 16px
      '2xl': '1.5rem', // 24px
    },

    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },

    gradients: {
      primary: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      secondary: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      accent: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
      healing: 'linear-gradient(135deg, #0ea5e9 0%, #22c55e 100%)',
    },
  },

  // Iconography
  icons: {
    style: 'Lucide React - consistent, medical-friendly',
    weight: 'medium',
    size: {
      xs: 12,
      sm: 16,
      md: 20,
      lg: 24,
      xl: 32,
    },
  },

  // Animation & Motion
  motion: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },

    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    },
  },
};

// Brand Guidelines
export const brandGuidelines = {
  logo: {
    clearSpace: 'Minimum clear space should be 1/2 the height of the logo',
    minSize: {
      digital: '24px height',
      print: '0.5 inch height',
    },
    usage: [
      'Always maintain aspect ratio',
      'Use high contrast backgrounds',
      'Prefer primary logo on light backgrounds',
      'Use white version on dark backgrounds',
    ],
  },

  colors: {
    accessibility: 'All color combinations meet WCAG 2.1 AA standards',
    usage: [
      'Primary blue for main actions and navigation',
      'Secondary green for positive states and healing',
      'Accent purple for premium features',
      'Pain colors for medical visualizations',
      'Neutral grays for text and backgrounds',
    ],
  },

  typography: {
    hierarchy: [
      'Use display font for marketing headlines',
      'Use Inter for all UI text and body copy',
      'Maintain consistent line heights',
      'Ensure 16px minimum for body text',
    ],
  },
};

// CSS Custom Properties Export
export const cssVariables = {
  ':root': {
    // Colors
    '--color-primary': brand.colors.primary[500],
    '--color-primary-foreground': brand.colors.neutral[0],
    '--color-secondary': brand.colors.secondary[500],
    '--color-secondary-foreground': brand.colors.neutral[0],
    '--color-accent': brand.colors.accent[500],
    '--color-accent-foreground': brand.colors.neutral[0],

    // Pain Colors
    '--color-pain-none': brand.colors.pain.none,
    '--color-pain-mild': brand.colors.pain.mild,
    '--color-pain-moderate': brand.colors.pain.moderate,
    '--color-pain-severe': brand.colors.pain.severe,
    '--color-pain-extreme': brand.colors.pain.extreme,

    // Typography
    '--font-sans': brand.typography.fonts.sans.join(', '),
    '--font-mono': brand.typography.fonts.mono.join(', '),
    '--font-display': brand.typography.fonts.display.join(', '),

    // Visual
    '--radius': brand.visual.borderRadius.md,
    '--shadow-sm': brand.visual.shadows.sm,
    '--shadow-md': brand.visual.shadows.md,
    '--shadow-lg': brand.visual.shadows.lg,

    // Motion
    '--duration-fast': brand.motion.duration.fast,
    '--duration-normal': brand.motion.duration.normal,
    '--duration-slow': brand.motion.duration.slow,
    '--easing': brand.motion.easing.ease,
  },
};
