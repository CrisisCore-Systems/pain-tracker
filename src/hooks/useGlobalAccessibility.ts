import { useEffect } from 'react';
import {
  setupSkipLinks,
  addMissingAriaLabels,
  validateARIA,
  announceToScreenReader,
} from '../utils/accessibility';

/**
 * Global Accessibility Hook
 *
 * Initializes and maintains accessibility features across the application.
 * Should be called once at the app level.
 */
export const useGlobalAccessibility = (
  options: {
    enableValidation?: boolean;
    enableAutoLabeling?: boolean;
    announceRouteChanges?: boolean;
  } = {}
) => {
  const {
    enableValidation = import.meta.env.DEV,
    enableAutoLabeling = import.meta.env.DEV,
    announceRouteChanges = true,
  } = options;

  useEffect(() => {
    // Setup skip links
    setupSkipLinks();

    // Add missing ARIA labels in development
    if (enableAutoLabeling) {
      // Run once immediately, then periodically (for dynamic UI updates)
      addMissingAriaLabels();

      const interval = setInterval(() => {
        addMissingAriaLabels();
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [enableAutoLabeling]);

  useEffect(() => {
    // Validate ARIA in development
    if (enableValidation) {
      let lastErrorsKey = '';
      let lastWarningsKey = '';

      const validateInterval = setInterval(() => {
        const { errors, warnings } = validateARIA();

        const errorsKey = errors.join('\n');
        const warningsKey = warnings.join('\n');

        if (errorsKey !== lastErrorsKey) {
          lastErrorsKey = errorsKey;
          if (errors.length > 0) {
            console.error('ARIA Validation Errors:', errors);
          }
        }

        if (warningsKey !== lastWarningsKey) {
          lastWarningsKey = warningsKey;
          if (warnings.length > 0) {
            console.warn('ARIA Validation Warnings:', warnings);
          }
        }
      }, 10000); // Check every 10 seconds

      return () => clearInterval(validateInterval);
    }
  }, [enableValidation]);

  useEffect(() => {
    // Announce route changes
    if (announceRouteChanges) {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.target === document.body) {
            const title = document.title;
            announceToScreenReader(`Navigated to: ${title}`, 'polite', 1000);
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
  }, [announceRouteChanges]);

  // Add global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyboard = (e: KeyboardEvent) => {
      // Ctrl/Cmd + / to show keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        const event = new CustomEvent('showKeyboardShortcuts');
        window.dispatchEvent(event);
      }

      // Escape to close modals (handled by components but announced here)
      if (e.key === 'Escape') {
        const openModal = document.querySelector('[role="dialog"][aria-modal="true"]');
        if (openModal) {
          announceToScreenReader('Modal closed', 'polite');
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyboard);
    return () => document.removeEventListener('keydown', handleGlobalKeyboard);
  }, []);

  return {
    announceMessage: announceToScreenReader,
  };
};
