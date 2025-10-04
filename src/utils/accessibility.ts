/**
 * Accessibility Utilities
 * 
 * Comprehensive utilities for accessibility enhancements including:
 * - Announce live regions
 * - Focus management
 * - Keyboard navigation helpers
 * - Screen reader optimizations
 */

/**
 * Announce a message to screen readers
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
  timeout = 100
): void => {
  // Find or create live region
  let liveRegion = document.getElementById('aria-live-region');
  
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }
  
  // Update aria-live priority if different
  if (liveRegion.getAttribute('aria-live') !== priority) {
    liveRegion.setAttribute('aria-live', priority);
  }
  
  // Clear and set new message with slight delay for SR detection
  liveRegion.textContent = '';
  setTimeout(() => {
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }, timeout);
};

/**
 * Focus management helper
 */
export class FocusManager {
  private static focusStack: HTMLElement[] = [];
  
  /**
   * Save current focus and move to new element
   */
  static saveFocusAndMoveTo(newElement: HTMLElement | null): void {
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus && currentFocus !== document.body) {
      this.focusStack.push(currentFocus);
    }
    
    if (newElement) {
      newElement.focus();
    }
  }
  
  /**
   * Restore previously saved focus
   */
  static restoreFocus(): void {
    const previousFocus = this.focusStack.pop();
    if (previousFocus && document.body.contains(previousFocus)) {
      previousFocus.focus();
    }
  }
  
  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');
    
    return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors))
      .filter(el => !el.hasAttribute('hidden') && el.offsetParent !== null);
  }
  
  /**
   * Create focus trap for modal dialogs
   */
  static createFocusTrap(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }
}

/**
 * Keyboard navigation helper
 */
export class KeyboardNavigationHelper {
  /**
   * Handle arrow key navigation in a list
   */
  static setupArrowKeyNavigation(
    container: HTMLElement,
    itemSelector: string,
    options: {
      loop?: boolean;
      orientation?: 'vertical' | 'horizontal' | 'grid';
      onSelect?: (item: HTMLElement) => void;
    } = {}
  ): () => void {
    const { loop = true, orientation = 'vertical', onSelect } = options;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const items = Array.from(container.querySelectorAll<HTMLElement>(itemSelector));
      const currentIndex = items.findIndex(item => item === document.activeElement);
      
      if (currentIndex === -1) return;
      
      let nextIndex = currentIndex;
      
      switch (e.key) {
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'grid') {
            e.preventDefault();
            nextIndex = currentIndex + 1;
          }
          break;
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'grid') {
            e.preventDefault();
            nextIndex = currentIndex - 1;
          }
          break;
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'grid') {
            e.preventDefault();
            nextIndex = currentIndex + 1;
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'grid') {
            e.preventDefault();
            nextIndex = currentIndex - 1;
          }
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = items.length - 1;
          break;
        case 'Enter':
        case ' ':
          if (onSelect) {
            e.preventDefault();
            onSelect(items[currentIndex]);
          }
          break;
        default:
          return;
      }
      
      // Handle looping
      if (loop) {
        nextIndex = (nextIndex + items.length) % items.length;
      } else {
        nextIndex = Math.max(0, Math.min(nextIndex, items.length - 1));
      }
      
      if (nextIndex !== currentIndex) {
        items[nextIndex]?.focus();
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }
}

/**
 * Skip link helper for main content navigation
 */
export const setupSkipLinks = (): void => {
  // Ensure skip links are present
  const skipLinks = [
    { id: 'skip-to-main', target: 'main-content', text: 'Skip to main content' },
    { id: 'skip-to-nav', target: 'main-navigation', text: 'Skip to navigation' },
    { id: 'skip-to-footer', target: 'page-footer', text: 'Skip to footer' },
  ];
  
  const existingContainer = document.getElementById('skip-links-container');
  if (existingContainer) return; // Already setup
  
  const container = document.createElement('div');
  container.id = 'skip-links-container';
  container.className = 'sr-only-focusable';
  
  skipLinks.forEach(({ id, target, text }) => {
    const targetElement = document.getElementById(target);
    if (!targetElement) return;
    
    const link = document.createElement('a');
    link.id = id;
    link.href = `#${target}`;
    link.textContent = text;
    link.className = 'skip-link';
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      targetElement.focus();
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    
    container.appendChild(link);
  });
  
  document.body.insertBefore(container, document.body.firstChild);
};

/**
 * Add ARIA labels to elements missing them
 */
export const addMissingAriaLabels = (container: HTMLElement = document.body): void => {
  // Buttons without labels
  const buttons = container.querySelectorAll<HTMLButtonElement>('button:not([aria-label])');
  buttons.forEach(button => {
    if (!button.textContent?.trim() && !button.getAttribute('aria-labelledby')) {
      const iconHint = button.querySelector('[class*="icon"]')?.className || '';
      button.setAttribute('aria-label', `Button with ${iconHint || 'no label'}`);
      console.warn('Button missing aria-label:', button);
    }
  });
  
  // Links without text
  const links = container.querySelectorAll<HTMLAnchorElement>('a:not([aria-label])');
  links.forEach(link => {
    if (!link.textContent?.trim() && !link.getAttribute('aria-labelledby')) {
      const href = link.getAttribute('href');
      link.setAttribute('aria-label', `Link to ${href || 'unknown destination'}`);
      console.warn('Link missing aria-label:', link);
    }
  });
  
  // Form inputs without labels
  const inputs = container.querySelectorAll<HTMLInputElement>('input:not([aria-label]):not([aria-labelledby])');
  inputs.forEach(input => {
    const id = input.getAttribute('id');
    const label = id ? container.querySelector<HTMLLabelElement>(`label[for="${id}"]`) : null;
    
    if (!label) {
      const placeholder = input.getAttribute('placeholder');
      input.setAttribute('aria-label', placeholder || 'Input field');
      console.warn('Input missing label:', input);
    }
  });
};

/**
 * Validate ARIA implementation
 */
export const validateARIA = (container: HTMLElement = document.body): {
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for ARIA role validity
  const elementsWithRoles = container.querySelectorAll('[role]');
  const validRoles = [
    'alert', 'alertdialog', 'application', 'article', 'banner', 'button',
    'checkbox', 'dialog', 'grid', 'gridcell', 'heading', 'img', 'link',
    'list', 'listbox', 'listitem', 'main', 'menu', 'menubar', 'menuitem',
    'navigation', 'progressbar', 'radio', 'radiogroup', 'region', 'row',
    'rowheader', 'search', 'slider', 'spinbutton', 'status', 'tab',
    'tablist', 'tabpanel', 'textbox', 'toolbar', 'tooltip', 'tree',
    'treegrid', 'treeitem',
  ];
  
  elementsWithRoles.forEach(el => {
    const role = el.getAttribute('role');
    if (role && !validRoles.includes(role)) {
      errors.push(`Invalid ARIA role: ${role} on element ${el.tagName}`);
    }
  });
  
  // Check for required aria-labelledby references
  const labelledByElements = container.querySelectorAll('[aria-labelledby]');
  labelledByElements.forEach(el => {
    const ids = el.getAttribute('aria-labelledby')?.split(' ') || [];
    ids.forEach(id => {
      if (!document.getElementById(id)) {
        warnings.push(`aria-labelledby references non-existent ID: ${id}`);
      }
    });
  });
  
  // Check for required aria-describedby references
  const describedByElements = container.querySelectorAll('[aria-describedby]');
  describedByElements.forEach(el => {
    const ids = el.getAttribute('aria-describedby')?.split(' ') || [];
    ids.forEach(id => {
      if (!document.getElementById(id)) {
        warnings.push(`aria-describedby references non-existent ID: ${id}`);
      }
    });
  });
  
  return { errors, warnings };
};

/**
 * Enhance form accessibility
 */
export const enhanceFormAccessibility = (form: HTMLFormElement): void => {
  // Add required indicators
  const requiredInputs = form.querySelectorAll<HTMLInputElement>('[required]');
  requiredInputs.forEach(input => {
    input.setAttribute('aria-required', 'true');
    
    // Add visual indicator if missing
    const label = form.querySelector<HTMLLabelElement>(`label[for="${input.id}"]`);
    if (label && !label.querySelector('.required-indicator')) {
      const indicator = document.createElement('span');
      indicator.className = 'required-indicator text-red-500';
      indicator.setAttribute('aria-hidden', 'true');
      indicator.textContent = ' *';
      label.appendChild(indicator);
    }
  });
  
  // Enhance error messages
  const inputs = form.querySelectorAll<HTMLInputElement>('input, textarea, select');
  inputs.forEach(input => {
    input.addEventListener('invalid', (e) => {
      e.preventDefault();
      
      const errorId = `${input.id}-error`;
      let errorElement = document.getElementById(errorId);
      
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'error-message text-red-600 text-sm mt-1';
        errorElement.setAttribute('role', 'alert');
        input.parentElement?.appendChild(errorElement);
      }
      
      errorElement.textContent = input.validationMessage;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', errorId);
      
      announceToScreenReader(`Error: ${input.validationMessage}`, 'assertive');
    });
    
    input.addEventListener('input', () => {
      if (input.validity.valid) {
        input.removeAttribute('aria-invalid');
        const errorId = `${input.id}-error`;
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
          errorElement.remove();
        }
      }
    });
  });
};
