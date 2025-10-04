/**
 * Modern Gradient System for Pain Tracker Pro
 * Provides utility functions and classes for beautiful gradients
 */

export const gradients = {
  // Vibrant brand gradients
  primary: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600',
  secondary: 'bg-gradient-to-r from-purple-500 to-pink-500',
  success: 'bg-gradient-to-r from-emerald-500 to-teal-500',
  warning: 'bg-gradient-to-r from-amber-500 to-orange-500',
  danger: 'bg-gradient-to-r from-red-500 to-rose-500',
  
  // Subtle background gradients
  subtleLight: 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50',
  subtleDark: 'bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950',
  
  // Glass morphism gradients
  glass: 'bg-gradient-to-br from-white/40 to-white/10',
  glassDark: 'bg-gradient-to-br from-gray-900/40 to-gray-900/10',
  
  // Card gradients
  cardLight: 'bg-gradient-to-br from-white via-gray-50 to-blue-50',
  cardDark: 'bg-gradient-to-br from-gray-900 via-gray-800 to-blue-950',
  
  // Radial gradients for emphasis
  radialPrimary: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600 via-indigo-600 to-transparent',
  radialAccent: 'bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-600 via-pink-600 to-transparent',
  
  // Mesh gradients (multiple color stops)
  meshCool: 'bg-[linear-gradient(135deg,_#667eea_0%,_#764ba2_25%,_#f093fb_50%,_#4facfe_100%)]',
  meshWarm: 'bg-[linear-gradient(135deg,_#fa709a_0%,_#fee140_50%,_#fa709a_100%)]',
  
  // Status gradients with semantic meaning
  healing: 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500',
  alert: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500',
  critical: 'bg-gradient-to-r from-red-500 via-rose-500 to-pink-500',
  
  // Animated gradients (to be used with animation classes)
  animated: 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-[length:200%_auto]',
} as const;

export const textGradients = {
  primary: 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
  secondary: 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent',
  success: 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent',
  rainbow: 'bg-gradient-to-r from-red-600 via-yellow-600 via-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent',
  sunset: 'bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent',
} as const;

export const borderGradients = {
  primary: 'border-transparent bg-clip-padding [border-image:linear-gradient(to_right,#3b82f6,#8b5cf6,#a855f7)_1]',
  glow: 'border border-transparent [background:linear-gradient(white,white)_padding-box,linear-gradient(to_right,#60a5fa,#a78bfa)_border-box]',
} as const;

/**
 * Utility function to apply gradient animation
 */
export function animateGradient(element: HTMLElement) {
  element.style.backgroundSize = '200% auto';
  element.style.animation = 'gradient 3s ease infinite';
}

/**
 * CSS-in-JS gradient generator
 */
export function createGradient(
  direction: 'to right' | 'to left' | 'to top' | 'to bottom' | 'to top right' | 'to bottom right',
  colors: string[]
): string {
  return `linear-gradient(${direction}, ${colors.join(', ')})`;
}

/**
 * Gets a gradient class based on pain level (0-10)
 */
export function getPainLevelGradient(level: number): string {
  if (level <= 3) return gradients.healing;
  if (level <= 6) return gradients.alert;
  return gradients.critical;
}

/**
 * Gets text gradient for emphasis levels
 */
export function getEmphasisTextGradient(emphasis: 'low' | 'medium' | 'high'): string {
  switch (emphasis) {
    case 'low':
      return textGradients.secondary;
    case 'medium':
      return textGradients.primary;
    case 'high':
      return textGradients.sunset;
    default:
      return textGradients.primary;
  }
}
