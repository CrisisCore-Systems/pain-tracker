import React, { useEffect, useRef } from 'react';

interface KeyboardNavigationProps {
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

export const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({ 
  children, 
  className = '',
  'aria-label': ariaLabel 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="tab"]'
      ) as NodeListOf<HTMLElement>;

      const focusableArray = Array.from(focusableElements);
      const currentIndex = focusableArray.indexOf(document.activeElement as HTMLElement);

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % focusableArray.length;
          focusableArray[nextIndex]?.focus();
          break;

        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          const prevIndex = currentIndex <= 0 ? focusableArray.length - 1 : currentIndex - 1;
          focusableArray[prevIndex]?.focus();
          break;

        case 'Home':
          event.preventDefault();
          focusableArray[0]?.focus();
          break;

        case 'End':
          event.preventDefault();
          focusableArray[focusableArray.length - 1]?.focus();
          break;

        case 'Escape':
          // Allow escape to bubble up for modal/dialog handling
          break;
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={className}
      role="group"
      aria-label={ariaLabel}
      tabIndex={-1}
    >
      {children}
    </div>
  );
};

// Custom hook for focus management
export const useFocusManagement = () => {
  const restoreFocus = useRef<HTMLElement | null>(null);

  const captureFocus = () => {
    restoreFocus.current = document.activeElement as HTMLElement;
  };

  const restoreFocusToLastElement = () => {
    if (restoreFocus.current && restoreFocus.current.focus) {
      restoreFocus.current.focus();
    }
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  };

  return {
    captureFocus,
    restoreFocusToLastElement,
    trapFocus
  };
};
