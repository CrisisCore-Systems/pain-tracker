/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class'], // Class-based dark mode - dark is our default (trauma-informed design)
  theme: {
    extend: {
      colors: {
        border: 'rgb(var(--color-border) / <alpha-value>)',
        input: 'rgb(var(--color-input) / <alpha-value>)',
        ring: 'rgb(var(--color-ring) / <alpha-value>)',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        foreground: 'rgb(var(--color-foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          foreground: 'rgb(var(--color-primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          foreground: 'rgb(var(--color-secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'rgb(var(--color-destructive) / <alpha-value>)',
          foreground: 'rgb(var(--color-destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--color-muted) / <alpha-value>)',
          foreground: 'rgb(var(--color-muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          foreground: 'rgb(var(--color-accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'rgb(var(--color-popover) / <alpha-value>)',
          foreground: 'rgb(var(--color-popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'rgb(var(--color-card) / <alpha-value>)',
          foreground: 'rgb(var(--color-card-foreground) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
          foreground: 'rgb(var(--color-success-foreground) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)',
          foreground: 'rgb(var(--color-warning-foreground) / <alpha-value>)',
        },
        error: {
          DEFAULT: 'rgb(var(--color-error) / <alpha-value>)',
          foreground: 'rgb(var(--color-error-foreground) / <alpha-value>)',
        },
        info: {
          DEFAULT: 'rgb(var(--color-info) / <alpha-value>)',
          foreground: 'rgb(var(--color-info-foreground) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
        '4xl': '1920px',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'fadeInUp': 'fadeInUp 0.5s ease-out',
        'fadeInDown': 'fadeInDown 0.5s ease-out',
        'slideInRight': 'slideInRight 0.5s ease-out',
        'slideInLeft': 'slideInLeft 0.5s ease-out',
        'smoothPulse': 'smoothPulse 2s ease-in-out infinite',
        'gentleFloat': 'gentleFloat 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        smoothPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        gentleFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [
    /* Accessibility helper plugin: inject light-mode base rules for pale badge backgrounds
       so text on those backgrounds uses the foreground color and a stronger weight.
       This centralizes the fixes in Tailwind's theme system rather than ad-hoc overrides.
       
       SELECTOR: Uses :root:not(.dark) for light mode detection.
       This matches Tailwind's darkMode: ['class'] strategy. */
    function ({ addBase, addUtilities, theme }) {
      addBase({
        // Pale badge backgrounds: make text use foreground color + heavier weight in light mode
        ':root:not(.dark) .bg-green-100': {
          color: theme('colors.foreground'),
          fontWeight: '700',
        },
        ':root:not(.dark) .bg-blue-100': {
          color: theme('colors.foreground'),
          fontWeight: '700',
        },
        ':root:not(.dark) .bg-rose-100': {
          color: theme('colors.foreground'),
          fontWeight: '700',
        },
        ':root:not(.dark) .bg-amber-100': {
          color: theme('colors.foreground'),
          fontWeight: '700',
        },
        // Header with translucent bg (bordered sticky header)
        ':root:not(.dark) .border-b.bg-white\\/80, :root:not(.dark) .border-b.bg-white\\/80 *': {
          color: theme('colors.foreground'),
        },
        // Ensure primary/accent colored backgrounds display light text in light mode
        ':root:not(.dark) .bg-primary, :root:not(.dark) .bg-primary *': {
          color: theme('colors.primary.foreground'),
        },
        ':root:not(.dark) .bg-accent, :root:not(.dark) .bg-accent *': {
          color: theme('colors.accent.foreground'),
        },
        // Light-mode hero safeguard
        ':root:not(.dark) .hero, :root:not(.dark) .hero *': {
          color: theme('colors.foreground'),
        },

        // Dark-mode compatibility layer: legacy Tailwind palette classes
        // Many older pages were built with `bg-white`/`text-gray-900` style utilities.
        // When the app runs in dark mode (default), those become unreadable.
        // These rules remap common legacy utilities to semantic token colors.
        '.dark .bg-white, [data-theme="dark"] .bg-white': {
          backgroundColor: theme('colors.card.DEFAULT'),
          color: theme('colors.foreground'),
        },
        '.dark .bg-gray-50, [data-theme="dark"] .bg-gray-50': {
          backgroundColor: theme('colors.card.DEFAULT'),
          color: theme('colors.foreground'),
        },
        '.dark .bg-gray-100, [data-theme="dark"] .bg-gray-100': {
          backgroundColor: theme('colors.muted.DEFAULT'),
          color: theme('colors.foreground'),
        },
        '.dark .bg-slate-50, [data-theme="dark"] .bg-slate-50': {
          backgroundColor: theme('colors.card.DEFAULT'),
          color: theme('colors.foreground'),
        },
        '.dark .bg-slate-100, [data-theme="dark"] .bg-slate-100': {
          backgroundColor: theme('colors.muted.DEFAULT'),
          color: theme('colors.foreground'),
        },

        '.dark .text-black, [data-theme="dark"] .text-black': {
          color: theme('colors.foreground'),
        },
        '.dark .text-gray-900, [data-theme="dark"] .text-gray-900': {
          color: theme('colors.foreground'),
        },
        '.dark .text-gray-800, [data-theme="dark"] .text-gray-800': {
          color: theme('colors.foreground'),
        },
        '.dark .text-gray-700, [data-theme="dark"] .text-gray-700': {
          color: theme('colors.muted.foreground'),
        },
        '.dark .text-gray-600, [data-theme="dark"] .text-gray-600': {
          color: theme('colors.muted.foreground'),
        },
        '.dark .text-gray-500, [data-theme="dark"] .text-gray-500': {
          color: theme('colors.muted.foreground'),
        },
        '.dark .text-slate-900, [data-theme="dark"] .text-slate-900': {
          color: theme('colors.foreground'),
        },
        '.dark .text-slate-800, [data-theme="dark"] .text-slate-800': {
          color: theme('colors.foreground'),
        },
        '.dark .text-slate-700, [data-theme="dark"] .text-slate-700': {
          color: theme('colors.muted.foreground'),
        },
        '.dark .text-slate-600, [data-theme="dark"] .text-slate-600': {
          color: theme('colors.muted.foreground'),
        },
        '.dark .text-slate-500, [data-theme="dark"] .text-slate-500': {
          color: theme('colors.muted.foreground'),
        },

        '.dark .border-gray-200, [data-theme="dark"] .border-gray-200': {
          borderColor: theme('colors.border'),
        },
        '.dark .border-gray-300, [data-theme="dark"] .border-gray-300': {
          borderColor: theme('colors.border'),
        },
        '.dark .border-slate-200, [data-theme="dark"] .border-slate-200': {
          borderColor: theme('colors.border'),
        },
        '.dark .border-slate-300, [data-theme="dark"] .border-slate-300': {
          borderColor: theme('colors.border'),
        },

        // Light-mode compatibility layer: dark-only pages
        // Some pages were authored assuming a permanently-dark surface (e.g. `bg-slate-900 text-white`).
        // When switching to light mode, those look like "half dark / half light".
        // Remap common dark palette utilities to semantic token colors in light mode.
        ':root:not(.dark) .bg-slate-900, [data-theme="light"] .bg-slate-900': {
          backgroundColor: theme('colors.background'),
          color: theme('colors.foreground'),
        },
        ':root:not(.dark) .bg-slate-800, [data-theme="light"] .bg-slate-800': {
          backgroundColor: theme('colors.card.DEFAULT'),
          color: theme('colors.card.foreground'),
        },
        ':root:not(.dark) .bg-slate-800\\/50, [data-theme="light"] .bg-slate-800\\/50': {
          backgroundColor: theme('colors.card.DEFAULT'),
          color: theme('colors.card.foreground'),
        },
        ':root:not(.dark) .bg-slate-900\\/50, [data-theme="light"] .bg-slate-900\\/50': {
          backgroundColor: theme('colors.muted.DEFAULT'),
          color: theme('colors.foreground'),
        },
        ':root:not(.dark) .bg-slate-900\\/95, [data-theme="light"] .bg-slate-900\\/95': {
          backgroundColor: theme('colors.background'),
          color: theme('colors.foreground'),
        },
        ':root:not(.dark) .bg-gray-900, [data-theme="light"] .bg-gray-900': {
          backgroundColor: theme('colors.background'),
          color: theme('colors.foreground'),
        },

        ':root:not(.dark) .text-white, [data-theme="light"] .text-white': {
          color: theme('colors.foreground'),
        },
        ':root:not(.dark) .text-slate-100, [data-theme="light"] .text-slate-100': {
          color: theme('colors.foreground'),
        },
        ':root:not(.dark) .text-slate-200, [data-theme="light"] .text-slate-200': {
          color: theme('colors.foreground'),
        },
        ':root:not(.dark) .text-slate-300, [data-theme="light"] .text-slate-300': {
          color: theme('colors.muted.foreground'),
        },
        ':root:not(.dark) .text-slate-400, [data-theme="light"] .text-slate-400': {
          color: theme('colors.muted.foreground'),
        },
        ':root:not(.dark) .text-slate-500, [data-theme="light"] .text-slate-500': {
          color: theme('colors.muted.foreground'),
        },

        ':root:not(.dark) .border-slate-700, [data-theme="light"] .border-slate-700': {
          borderColor: theme('colors.border'),
        },
        ':root:not(.dark) .border-slate-700\\/50, [data-theme="light"] .border-slate-700\\/50': {
          borderColor: theme('colors.border'),
        },
        ':root:not(.dark) .border-slate-600, [data-theme="light"] .border-slate-600': {
          borderColor: theme('colors.border'),
        },
      });

      addUtilities({
        ':root:not(.dark) .bg-green-100.text-green-600': {
          color: theme('colors.foreground'),
          fontWeight: '700',
        },
        ':root:not(.dark) .bg-green-100.text-green-800': {
          color: theme('colors.foreground'),
          fontWeight: '700',
        },
        ':root:not(.dark) .bg-blue-100.text-blue-600': {
          color: theme('colors.foreground'),
          fontWeight: '700',
        },
        ':root:not(.dark) .bg-rose-100.text-rose-600': {
          color: theme('colors.foreground'),
          fontWeight: '700',
        },
        ':root:not(.dark) .bg-amber-100.text-amber-600': {
          color: theme('colors.foreground'),
          fontWeight: '700',
        },
      });
    },
  ],
}