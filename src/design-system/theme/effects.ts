/**
 * Modern Visual Effects System
 * Provides utilities for shadows, glows, glassmorphism, and depth
 */

export const shadows = {
  // Elevated shadows for cards and panels
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',

  // Colored shadows for emphasis
  primary: 'shadow-lg shadow-blue-500/20',
  secondary: 'shadow-lg shadow-purple-500/20',
  success: 'shadow-lg shadow-emerald-500/20',
  danger: 'shadow-lg shadow-red-500/20',

  // Glow effects
  glowSm: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]',
  glowMd: 'shadow-[0_0_30px_rgba(59,130,246,0.4)]',
  glowLg: 'shadow-[0_0_45px_rgba(59,130,246,0.5)]',

  // Inner shadows for depth
  inner: 'shadow-inner',
  inset: 'shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.06)]',

  // Soft shadows for light mode
  soft: 'shadow-[0_8px_30px_rgb(0,0,0,0.12)]',
  softXl: 'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)]',
} as const;

export const glassmorphism = {
  // Standard glass effect
  default: 'backdrop-blur-md bg-white/30 dark:bg-gray-900/30 border border-white/20',

  // Stronger blur
  strong: 'backdrop-blur-xl bg-white/40 dark:bg-gray-900/40 border border-white/30',

  // Subtle glass
  subtle: 'backdrop-blur-sm bg-white/20 dark:bg-gray-900/20 border border-white/10',

  // Card glass
  card: 'backdrop-blur-lg bg-white/50 dark:bg-gray-900/50 border border-white/20 shadow-xl',

  // Modal/overlay glass
  overlay: 'backdrop-blur-2xl bg-white/60 dark:bg-gray-900/60',

  // Navigation glass
  nav: 'backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-white/20',
} as const;

export const depth = {
  // Elevation levels
  flat: 'shadow-none',
  raised: 'shadow-md transform hover:shadow-lg transition-shadow',
  floating: 'shadow-lg transform hover:shadow-xl transition-all hover:-translate-y-0.5',
  lifted: 'shadow-xl transform hover:shadow-2xl transition-all hover:-translate-y-1',

  // 3D depth with perspective
  deep: 'shadow-2xl transform-gpu transition-transform hover:scale-[1.02]',
} as const;

export const blur = {
  none: 'backdrop-blur-none',
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
  '2xl': 'backdrop-blur-2xl',
  '3xl': 'backdrop-blur-3xl',
} as const;

export const animations = {
  // Entrance animations
  fadeIn: 'animate-[fadeIn_0.5s_ease-out]',
  fadeInUp: 'animate-[fadeInUp_0.5s_ease-out]',
  fadeInDown: 'animate-[fadeInDown_0.5s_ease-out]',
  scaleIn: 'animate-[scaleIn_0.3s_ease-out]',
  slideInRight: 'animate-[slideInRight_0.4s_ease-out]',
  slideInLeft: 'animate-[slideInLeft_0.4s_ease-out]',

  // Continuous animations
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  spin: 'animate-spin',
  ping: 'animate-ping',

  // Custom smooth animations
  smoothPulse: 'animate-[smoothPulse_3s_ease-in-out_infinite]',
  gentleFloat: 'animate-[gentleFloat_6s_ease-in-out_infinite]',
  subtleShake: 'animate-[subtleShake_0.5s_ease-in-out]',

  // Gradient animation
  gradientShift: 'animate-[gradientShift_3s_ease_infinite]',
} as const;

export const borders = {
  // Standard borders
  default: 'border border-gray-200 dark:border-gray-800',
  strong: 'border-2 border-gray-300 dark:border-gray-700',

  // Gradient borders
  gradient:
    'border border-transparent [background:linear-gradient(white,white)_padding-box,linear-gradient(135deg,#667eea_0%,#764ba2_100%)_border-box]',
  gradientPrimary:
    'border-2 border-transparent [background:linear-gradient(var(--background),var(--background))_padding-box,linear-gradient(135deg,rgb(59,130,246),rgb(147,51,234))_border-box]',

  // Glow borders
  glowPrimary: 'border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]',
  glowSuccess: 'border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]',

  // Soft borders
  soft: 'border border-gray-100 dark:border-gray-800/50',
} as const;

export const transforms = {
  // Hover effects
  hoverLift: 'transition-transform hover:-translate-y-1 hover:scale-[1.02]',
  hoverScale: 'transition-transform hover:scale-105',
  hoverRotate: 'transition-transform hover:rotate-1',

  // Active/pressed states
  activePress: 'active:scale-95 transition-transform',
  activeScale: 'active:scale-98 transition-transform',

  // Smooth transitions
  smooth: 'transition-all duration-300 ease-out',
  fast: 'transition-all duration-150 ease-out',
  slow: 'transition-all duration-500 ease-out',
} as const;

/**
 * Creates a custom glow effect with specified color
 */
export function createGlow(color: string, intensity: 'sm' | 'md' | 'lg' = 'md'): string {
  const sizes = {
    sm: '15px',
    md: '30px',
    lg: '45px',
  };

  return `shadow-[0_0_${sizes[intensity]}_${color}]`;
}

/**
 * Combines multiple effect classes
 */
export function combineEffects(...effects: string[]): string {
  return effects.join(' ');
}

/**
 * Gets elevation class based on level
 */
export function getElevation(level: 0 | 1 | 2 | 3 | 4): string {
  const elevations = ['shadow-none', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl'];
  return elevations[level];
}
