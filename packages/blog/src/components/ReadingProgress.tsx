'use client';

import { useEffect, useState, useCallback } from 'react';

interface ReadingProgressProps {
  /** Color of the progress bar - uses CSS custom property format */
  color?: string;
  /** Height of the progress bar in pixels */
  height?: number;
  /** Target element selector to track scroll progress for. Defaults to document body */
  targetSelector?: string;
}

export function ReadingProgress({
  color = 'hsl(var(--primary))',
  height = 3,
  targetSelector,
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const calculateProgress = useCallback(() => {
    let scrollTop: number;
    let scrollHeight: number;
    let clientHeight: number;

    if (targetSelector) {
      const target = document.querySelector(targetSelector);
      if (!target) return;
      
      const rect = target.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const targetHeight = target.scrollHeight;
      
      // Calculate how much of the target has been scrolled past
      scrollTop = Math.max(0, -rect.top);
      scrollHeight = targetHeight;
      clientHeight = windowHeight;
    } else {
      scrollTop = window.scrollY;
      scrollHeight = document.documentElement.scrollHeight;
      clientHeight = window.innerHeight;
    }

    const totalScrollable = scrollHeight - clientHeight;
    const currentProgress = totalScrollable > 0 
      ? Math.min(100, (scrollTop / totalScrollable) * 100)
      : 0;
    
    setProgress(currentProgress);
    setIsVisible(scrollTop > 100);
  }, [targetSelector]);

  useEffect(() => {
    // Initial calculation
    calculateProgress();
    
    // Throttled scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', calculateProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', calculateProgress);
    };
  }, [calculateProgress]);

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      {/* Background track */}
      <div 
        className="w-full bg-border/30"
        style={{ height: `${height}px` }}
      />
      {/* Progress indicator */}
      <div
        className="absolute top-0 left-0 transition-all duration-150 ease-out"
        style={{
          width: `${progress}%`,
          height: `${height}px`,
          background: `linear-gradient(90deg, ${color}, hsl(var(--accent)))`,
          boxShadow: `0 0 10px ${color}`,
        }}
      />
    </div>
  );
}
