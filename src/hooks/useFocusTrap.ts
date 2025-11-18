import { useEffect, useRef } from 'react';

/**
 * Custom hook to trap focus within a modal or dialog component
 * Ensures keyboard users can't tab out of the modal until it's closed
 *
 * @param isActive - Whether the focus trap is currently active
 * @returns ref - Ref to attach to the container element
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const trapRef = useFocusTrap(isOpen);
 *
 *   if (!isOpen) return null;
 *
 *   return (
 *     <div ref={trapRef} role="dialog" aria-modal="true">
 *       <button onClick={onClose}>Close</button>
 *       {/* Modal content *\/}
 *     </div>
 *   );
 * }
 * ```
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Store the element that had focus before the modal opened
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements within the container
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');

      return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors)).filter(el => {
        // Exclude elements that are hidden or have negative tabindex
        return el.offsetParent !== null && el.tabIndex >= 0;
      });
    };

    // Focus the first focusable element when modal opens
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        focusableElements[0]?.focus();
      }, 10);
    }

    // Handle Tab key to trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab (backwards)
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      }
      // Tab (forwards)
      else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Add event listener
    container.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the element that had focus before the modal opened
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}
