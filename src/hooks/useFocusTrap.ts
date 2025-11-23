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
        // In jsdom there is no layout information (offsetParent is null), so rely on tabindex only
        // For browser environments, this will still work since non-visible elements typically have
        // tabIndex -1.
        return el.tabIndex >= 0;
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

    // Add event listeners (listen on container and document for reliable tab capture
    // in test environments that may not bubble key events the same way as browsers)
    container.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleKeyDown);

    // As a fallback for environments that don't reliably bubble keydown events, trap
    // focus using focusin: if focus moves outside the container, bring it back to the
    // first focusable element.
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!container.contains(target)) {
        const focusable = getFocusableElements();
        if (focusable.length > 0) focusable[0].focus();
      }
    };
    document.addEventListener('focusin', handleFocusIn);

    // Cleanup function
    return () => {
  container.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('keydown', handleKeyDown);
  document.removeEventListener('focusin', handleFocusIn);

      // Restore focus to the element that had focus before the modal opened
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}
