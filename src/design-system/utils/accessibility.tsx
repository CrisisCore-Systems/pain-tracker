import React, { useEffect, useRef } from 'react';

/**
 * Accessibility utilities for enhanced screen reader and keyboard navigation support
 */

// ARIA live region utilities
export function useLiveRegion(politeness: 'polite' | 'assertive' = 'polite') {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const announce = (message: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
    }
  };

  useEffect(() => {
    if (liveRegionRef.current) {
      liveRegionRef.current.setAttribute('aria-live', politeness);
      liveRegionRef.current.setAttribute('aria-atomic', 'true');
      liveRegionRef.current.style.position = 'absolute';
      liveRegionRef.current.style.left = '-10000px';
      liveRegionRef.current.style.width = '1px';
      liveRegionRef.current.style.height = '1px';
      liveRegionRef.current.style.overflow = 'hidden';
    }
  }, [politeness]);

  return { liveRegionRef, announce };
}

// Focus management utilities
export function useFocusTrap() {
  const containerRef = useRef<HTMLElement>(null);

  const focusableElements = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  const getFocusableElements = () => {
    if (!containerRef.current) return [];
    return Array.from(containerRef.current.querySelectorAll(focusableElements));
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const focusableEls = getFocusableElements();
    if (focusableEls.length === 0) return;

    const firstElement = focusableEls[0] as HTMLElement;
    const lastElement = focusableEls[focusableEls.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        event.preventDefault();
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, []);

  return containerRef;
}

// Skip link component
export function SkipLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {children}
    </a>
  );
}

// Screen reader only text
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

// Accessible button with loading state
export interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function AccessibleButton({
  loading = false,
  loadingText = 'Loading...',
  disabled,
  children,
  ...props
}: AccessibleButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-describedby={loading ? 'loading-status' : undefined}
    >
      {loading ? (
        <>
          <span aria-hidden="true">{children}</span>
          <span id="loading-status" className="sr-only">
            {loadingText}
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Accessible form field wrapper
export interface AccessibleFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  id: string;
}

export function AccessibleField({
  label,
  description,
  error,
  required = false,
  children,
  id,
}: AccessibleFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <div>
        {React.cloneElement(children as React.ReactElement, {
          id,
          'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
          'aria-invalid': !!error,
          required,
        })}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Keyboard navigation hook
export function useKeyboardNavigation(
  items: unknown[],
  onSelect: (index: number) => void,
  loop = true
) {
  const handleKeyDown = (event: React.KeyboardEvent, currentIndex: number) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight': {
        event.preventDefault();
        const nextIndex = loop
          ? (currentIndex + 1) % items.length
          : Math.min(currentIndex + 1, items.length - 1);
        onSelect(nextIndex);
        break;
      }
      case 'ArrowUp':
      case 'ArrowLeft': {
        event.preventDefault();
        const prevIndex = loop
          ? (currentIndex - 1 + items.length) % items.length
          : Math.max(currentIndex - 1, 0);
        onSelect(prevIndex);
        break;
      }
      case 'Home':
        event.preventDefault();
        onSelect(0);
        break;
      case 'End':
        event.preventDefault();
        onSelect(items.length - 1);
        break;
    }
  };

  return { handleKeyDown };
}

// High contrast mode detection
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isHighContrast;
}

// Reduced motion detection
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

// Color scheme detection
export function useColorScheme() {
  const [colorScheme, setColorScheme] = React.useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setColorScheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (event: MediaQueryListEvent) => {
      setColorScheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return colorScheme;
}

// Announcement hook for dynamic content changes
export function useAnnouncer() {
  const [announcements, setAnnouncements] = React.useState<string[]>([]);

  const announce = React.useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      const id = Date.now().toString();
      setAnnouncements(prev => [...prev, `${priority}:${id}:${message}`]);

      // Clean up old announcements
      setTimeout(() => {
        setAnnouncements(prev => prev.filter(ann => !ann.includes(id)));
      }, 1000);
    },
    []
  );

  return {
    announcements,
    announce,
    clearAnnouncements: () => setAnnouncements([]),
  };
}
