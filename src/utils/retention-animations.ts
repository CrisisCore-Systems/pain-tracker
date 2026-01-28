/**
 * Animation Utilities for Retention Components
 * 
 * Provides smooth, accessible animations for retention features.
 * Respects user's motion preferences.
 */

/**
 * CSS animation variants for different states
 */
export const animationVariants = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  },
  
  // Slide animations
  slideInFromTop: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  
  slideInFromBottom: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  
  // Scale animations
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  // Progress bar fill
  progressFill: {
    initial: { width: '0%' },
    animate: (width: number) => ({ width: `${width}%` }),
    transition: { duration: 1, ease: 'easeInOut' },
  },
  
  // Celebration/success animation
  celebration: {
    initial: { scale: 0.8, rotate: -5, opacity: 0 },
    animate: { scale: 1, rotate: 0, opacity: 1 },
    exit: { scale: 1.1, opacity: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  
  // Pulse for attention
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

/**
 * CSS classes for Tailwind-based animations
 */
export const animationClasses = {
  fadeIn: 'animate-fade-in',
  slideInFromTop: 'animate-slide-in-top',
  slideInFromBottom: 'animate-slide-in-bottom',
  scaleIn: 'animate-scale-in',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  spin: 'animate-spin',
};

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation config respecting user preferences
 */
export function getAnimationConfig(animationType: keyof typeof animationVariants) {
  const variant = animationVariants[animationType];
  
  if (prefersReducedMotion()) {
    // Return instant transitions for reduced motion
    return {
      ...variant,
      transition: { duration: 0 },
    };
  }
  
  return variant;
}

/**
 * Stagger delay for list animations
 */
export function getStaggerDelay(index: number, baseDelay: number = 0.1): number {
  if (prefersReducedMotion()) return 0;
  return index * baseDelay;
}

/**
 * Spring animation configuration
 */
export const springConfig = {
  gentle: {
    type: 'spring',
    stiffness: 100,
    damping: 15,
  },
  snappy: {
    type: 'spring',
    stiffness: 200,
    damping: 20,
  },
  bouncy: {
    type: 'spring',
    stiffness: 300,
    damping: 15,
  },
};

/**
 * Easing functions
 */
export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  sharp: [0.4, 0, 0.6, 1],
};

/**
 * Duration presets (in seconds)
 */
export const durations = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
};

/**
 * Create a CSS animation string
 */
export function createCSSAnimation(
  property: string,
  from: string | number,
  to: string | number,
  duration: number = 0.3,
  easing: string = 'ease-out'
): string {
  return `${property} ${duration}s ${easing}`;
}

/**
 * Confetti animation for celebrations
 */
export function triggerConfetti(element: HTMLElement) {
  if (prefersReducedMotion()) return;
  
  // Simple confetti effect using CSS
  const confetti = document.createElement('div');
  confetti.className = 'absolute inset-0 pointer-events-none overflow-hidden';
  confetti.innerHTML = Array.from({ length: 20 }, (_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = 1 + Math.random();
    return `
      <div 
        class="absolute w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
        style="
          left: ${left}%;
          top: -10px;
          animation: confetti-fall ${duration}s ease-out ${delay}s forwards;
        "
      ></div>
    `;
  }).join('');
  
  element.appendChild(confetti);
  
  setTimeout(() => {
    confetti.remove();
  }, 2000);
}

/**
 * Milestone celebration animation
 */
export function celebrateMilestone(element: HTMLElement, message: string) {
  if (prefersReducedMotion()) {
    // Just show the message
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
    return;
  }
  
  // Animated celebration
  triggerConfetti(element);
  
  const toast = document.createElement('div');
  toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform scale-0';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    toast.style.transform = 'scale(1)';
  });
  
  setTimeout(() => {
    toast.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
    toast.style.transform = 'scale(0.8)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
