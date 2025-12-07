'use client';

import { useEffect, useState, useCallback } from 'react';

interface BackToTopProps {
  /** Scroll threshold before showing the button (in pixels) */
  threshold?: number;
  /** Whether to show on all pages or just long content */
  alwaysShow?: boolean;
}

export function BackToTop({ threshold = 400, alwaysShow = false }: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  const checkVisibility = useCallback(() => {
    const shouldShow = window.scrollY > threshold;
    
    // Only show if page is scrollable or alwaysShow is true
    if (!alwaysShow) {
      const isScrollable = document.documentElement.scrollHeight > window.innerHeight * 1.5;
      setIsVisible(shouldShow && isScrollable);
    } else {
      setIsVisible(shouldShow);
    }
  }, [threshold, alwaysShow]);

  useEffect(() => {
    // Throttled scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    checkVisibility(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [checkVisibility]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 p-4 rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/25 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-primary/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
      aria-label="Scroll to top"
      title="Back to top"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}
