/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Mobile-first breakpoints (Tailwind defaults are mobile-first already)
      screens: {
        'xs': '475px',
        // sm: '640px' (default)
        // md: '768px' (default) 
        // lg: '1024px' (default)
        // xl: '1280px' (default)
        // 2xl: '1536px' (default)
      },
      // Touch-friendly spacing
      spacing: {
        'touch': '44px', // Minimum touch target size
        'touch-lg': '48px', // Larger touch target
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Mobile-optimized font sizes
      fontSize: {
        'xs-mobile': ['0.75rem', { lineHeight: '1.25rem' }],
        'sm-mobile': ['0.875rem', { lineHeight: '1.375rem' }],
        'base-mobile': ['1rem', { lineHeight: '1.5rem' }],
        'lg-mobile': ['1.125rem', { lineHeight: '1.625rem' }],
        'xl-mobile': ['1.25rem', { lineHeight: '1.75rem' }],
      },
      // Mobile-specific container max widths
      maxWidth: {
        'mobile': '100vw',
        'mobile-form': 'calc(100vw - 2rem)',
      },
      // Touch-friendly minimum dimensions
      minHeight: {
        'touch': '44px',
        'touch-lg': '48px',
        'screen-mobile': '100vh',
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
      },
      minWidth: {
        'touch': '44px',
        'touch-lg': '48px',
      },
    },
  },
  plugins: [
    // Add custom mobile utilities
    function({ addUtilities }) {
      addUtilities({
        // Touch-friendly utilities
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        '.touch-target-lg': {
          minHeight: '48px',
          minWidth: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        // Mobile form utilities
        '.form-mobile': {
          width: '100%',
          fontSize: '16px', // Prevents iOS zoom
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
        },
        '.form-mobile:focus': {
          outline: 'none',
          borderColor: '#3b82f6',
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
        },
        // Mobile container utilities
        '.container-mobile': {
          width: '100%',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          marginLeft: 'auto',
          marginRight: 'auto',
        },
        // Mobile-safe scrolling
        '.scroll-mobile': {
          '-webkit-overflow-scrolling': 'touch',
          scrollBehavior: 'smooth',
        },
        // Mobile accordion utilities
        '.accordion-mobile': {
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        },
        '.accordion-mobile-header': {
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '48px',
        },
        '.accordion-mobile-content': {
          padding: '1rem',
          backgroundColor: '#ffffff',
        },
      });
    },
  ],
}