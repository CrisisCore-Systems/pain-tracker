import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * Focus Trap Component - WCAG 2.2 AA Compliant
 * 
 * Features:
 * - Traps focus within the component
 * - Returns focus to trigger element on close
 * - Escape key closes (optional)
 * - Focus loops at boundaries
 * - Works with all focusable elements
 */

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  onEscape?: () => void;
  returnFocusOnDeactivate?: boolean;
  autoFocus?: boolean;
  /** Selector for the element to focus on activation */
  initialFocusSelector?: string;
  /** Selector for the element to focus on deactivation */
  finalFocusSelector?: string;
}

const FOCUSABLE_ELEMENTS = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]:not([disabled])',
  '[role="tab"]:not([disabled])',
  '[role="menuitem"]:not([disabled])',
  '[role="option"]:not([disabled])',
].join(', ');

export function FocusTrap({
  children,
  active = true,
  onEscape,
  returnFocusOnDeactivate = true,
  autoFocus = true,
  initialFocusSelector,
  finalFocusSelector,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Store the previously focused element
  useEffect(() => {
    if (active) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [active]);

  // Get all focusable elements within the trap
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)
    ).filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1);
  }, []);

  // Focus the first element or the specified element
  useEffect(() => {
    if (!active || !autoFocus) return;

    const focusFirst = () => {
      if (!containerRef.current) return;

      // Try to focus the initial focus selector if provided
      if (initialFocusSelector) {
        const initialElement = containerRef.current.querySelector<HTMLElement>(initialFocusSelector);
        if (initialElement) {
          initialElement.focus();
          return;
        }
      }

      // Otherwise focus the first focusable element
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    };

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(focusFirst, 10);
    return () => clearTimeout(timeoutId);
  }, [active, autoFocus, initialFocusSelector, getFocusableElements]);

  // Return focus when deactivating
  useEffect(() => {
    return () => {
      if (returnFocusOnDeactivate && previousActiveElement.current) {
        // Try final focus selector first
        if (finalFocusSelector) {
          const finalElement = document.querySelector<HTMLElement>(finalFocusSelector);
          if (finalElement) {
            finalElement.focus();
            return;
          }
        }
        // Otherwise return to the previous active element
        previousActiveElement.current.focus();
      }
    };
  }, [returnFocusOnDeactivate, finalFocusSelector]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!active) return;

      // Handle Escape key
      if (event.key === 'Escape' && onEscape) {
        event.preventDefault();
        event.stopPropagation();
        onEscape();
        return;
      }

      // Handle Tab key for focus trapping
      if (event.key === 'Tab') {
        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) {
          event.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Shift+Tab on first element -> go to last
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
        // Tab on last element -> go to first
        else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [active, onEscape, getFocusableElements]
  );

  // Prevent focus from leaving the trap
  const handleFocusOut = useCallback(
    (event: React.FocusEvent) => {
      if (!active || !containerRef.current) return;

      // If focus is moving outside the trap, prevent it
      if (
        event.relatedTarget &&
        !containerRef.current.contains(event.relatedTarget as Node)
      ) {
        event.preventDefault();
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    },
    [active, getFocusableElements]
  );

  if (!active) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      onBlur={handleFocusOut}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}

/**
 * Modal Component with Focus Trap
 * 
 * Complete accessible modal implementation with:
 * - Focus trapping
 * - Escape to close
 * - Click outside to close (optional)
 * - Scroll lock
 * - Backdrop
 */

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  description?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

export function AccessibleModal({
  isOpen,
  onClose,
  children,
  title,
  description,
  closeOnBackdrop = true,
  closeOnEscape = true,
  size = 'md',
  className = '',
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = description ? `modal-desc-${Math.random().toString(36).substr(2, 9)}` : undefined;

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (closeOnBackdrop && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose]
  );

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        aria-hidden="true"
      />

      {/* Modal */}
      <FocusTrap
        active={isOpen}
        onEscape={closeOnEscape ? onClose : undefined}
        returnFocusOnDeactivate={true}
      >
        <div
          ref={modalRef}
          className={`
            relative w-full ${SIZE_CLASSES[size]}
            bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl
            animate-in zoom-in-95 fade-in duration-200
            ${className}
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 id={titleId} className="text-xl font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Description (optional) */}
          {description && (
            <p id={descriptionId} className="px-6 pt-4 text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </FocusTrap>
    </div>,
    document.body
  );
}

export default FocusTrap;
