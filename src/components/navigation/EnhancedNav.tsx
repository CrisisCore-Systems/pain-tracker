import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../design-system/utils';
import { Badge } from '../../design-system';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  name: string;
  icon: LucideIcon;
  badge?: string | number;
  shortcut?: string; // e.g., "⌘1", "Ctrl+1"
  description?: string;
  disabled?: boolean;
}

interface EnhancedNavProps {
  items: NavItem[];
  activeId?: string;
  onNavigate: (id: string) => void;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'pills' | 'underline' | 'minimal';
  className?: string;
  showShortcuts?: boolean;
  enableKeyboardNav?: boolean;
}

/**
 * Enhanced Navigation Component with full keyboard support
 *
 * Features:
 * - Arrow key navigation (↑↓ for vertical, ←→ for horizontal)
 * - Tab/Shift+Tab support
 * - Enter/Space to activate
 * - Number keys (1-9) for quick navigation
 * - Custom keyboard shortcuts
 * - Full ARIA support
 * - Focus management
 * - Screen reader friendly
 *
 * Usage:
 * ```tsx
 * <EnhancedNav
 *   items={navigationItems}
 *   activeId={currentView}
 *   onNavigate={handleNavigate}
 *   orientation="vertical"
 *   showShortcuts
 *   enableKeyboardNav
 * />
 * ```
 */
export function EnhancedNav({
  items,
  activeId,
  onNavigate,
  orientation = 'vertical',
  size = 'md',
  variant = 'default',
  className,
  showShortcuts = true,
  enableKeyboardNav = true,
}: EnhancedNavProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Update focused index when active item changes
  useEffect(() => {
    const activeIndex = items.findIndex(item => item.id === activeId);
    if (activeIndex !== -1) {
      setFocusedIndex(activeIndex);
    }
  }, [activeId, items]);

  // Keyboard navigation handler
  useEffect(() => {
    if (!enableKeyboardNav) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if nav is focused or one of its children is focused
      if (!navRef.current?.contains(document.activeElement as Node)) {
        return;
      }

      const enabledItems = items.filter(item => !item.disabled);
      const currentEnabledIndex = enabledItems.findIndex(
        item => items[focusedIndex].id === item.id
      );

      let handled = false;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight': {
          if (
            (orientation === 'vertical' && e.key === 'ArrowDown') ||
            (orientation === 'horizontal' && e.key === 'ArrowRight')
          ) {
            e.preventDefault();
            handled = true;
            const nextIndex = (currentEnabledIndex + 1) % enabledItems.length;
            const nextItem = enabledItems[nextIndex];
            const globalIndex = items.findIndex(item => item.id === nextItem.id);
            setFocusedIndex(globalIndex);
            itemRefs.current[globalIndex]?.focus();
          }
          break;
        }

        case 'ArrowUp':
        case 'ArrowLeft': {
          if (
            (orientation === 'vertical' && e.key === 'ArrowUp') ||
            (orientation === 'horizontal' && e.key === 'ArrowLeft')
          ) {
            e.preventDefault();
            handled = true;
            const prevIndex = (currentEnabledIndex - 1 + enabledItems.length) % enabledItems.length;
            const prevItem = enabledItems[prevIndex];
            const globalIndex = items.findIndex(item => item.id === prevItem.id);
            setFocusedIndex(globalIndex);
            itemRefs.current[globalIndex]?.focus();
          }
          break;
        }

        case 'Home': {
          e.preventDefault();
          handled = true;
          const firstEnabledItem = enabledItems[0];
          const globalIndex = items.findIndex(item => item.id === firstEnabledItem.id);
          setFocusedIndex(globalIndex);
          itemRefs.current[globalIndex]?.focus();
          break;
        }

        case 'End': {
          e.preventDefault();
          handled = true;
          const lastEnabledItem = enabledItems[enabledItems.length - 1];
          const globalIndex = items.findIndex(item => item.id === lastEnabledItem.id);
          setFocusedIndex(globalIndex);
          itemRefs.current[globalIndex]?.focus();
          break;
        }

        case 'Enter':
        case ' ': {
          e.preventDefault();
          handled = true;
          const currentItem = items[focusedIndex];
          if (!currentItem.disabled) {
            onNavigate(currentItem.id);
          }
          break;
        }

        default: {
          // Number key shortcuts (1-9)
          if (e.key >= '1' && e.key <= '9') {
            const index = parseInt(e.key) - 1;
            if (index < items.length && !items[index].disabled) {
              e.preventDefault();
              handled = true;
              setFocusedIndex(index);
              onNavigate(items[index].id);
              itemRefs.current[index]?.focus();
            }
          }
        }
      }

      if (handled) {
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardNav, focusedIndex, items, onNavigate, orientation]);

  const sizeClasses = {
    sm: 'text-xs px-2 py-1.5 gap-1.5',
    md: 'text-sm px-3 py-2 gap-2',
    lg: 'text-base px-4 py-3 gap-3',
  };

  const variantClasses = {
    default: {
      base: 'rounded-xl transition-all duration-200',
      active:
        'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30',
      inactive: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
    },
    pills: {
      base: 'rounded-full transition-all duration-200',
      active: 'bg-blue-600 text-white shadow-md',
      inactive:
        'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
    },
    underline: {
      base: 'rounded-none border-b-2 transition-all duration-200',
      active: 'border-blue-600 text-blue-600 dark:text-blue-400',
      inactive:
        'border-transparent text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
    },
    minimal: {
      base: 'rounded-md transition-all duration-200',
      active: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
      inactive: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
    },
  };

  const orientationClass =
    orientation === 'horizontal' ? 'flex flex-row flex-wrap' : 'flex flex-col';

  return (
    <nav
      ref={navRef}
      className={cn(orientationClass, 'gap-1', className)}
      role="navigation"
      aria-label="Main navigation"
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive = item.id === activeId;
        const isFocused = index === focusedIndex;
        const styles = variantClasses[variant];

        return (
          <button
            key={item.id}
            ref={el => (itemRefs.current[index] = el)}
            onClick={() => !item.disabled && onNavigate(item.id)}
            disabled={item.disabled}
            tabIndex={isFocused ? 0 : -1}
            className={cn(
              'group flex items-center justify-between font-medium transition-all',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              sizeClasses[size],
              styles.base,
              isActive ? styles.active : styles.inactive,
              isFocused && 'ring-2 ring-blue-400 ring-offset-1'
            )}
            role="button"
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.description ? `${item.name} - ${item.description}` : item.name}
            title={item.description}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Icon
                className={cn(
                  'transition-transform group-hover:scale-110 flex-shrink-0',
                  size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
                )}
                aria-hidden="true"
              />
              <span className="truncate">{item.name}</span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {item.badge && (
                <Badge
                  variant="outline"
                  className="rounded-full text-xs whitespace-nowrap"
                  aria-label={`${item.name} has ${item.badge} items`}
                >
                  {item.badge}
                </Badge>
              )}

              {showShortcuts && item.shortcut && (
                <kbd
                  className={cn(
                    'hidden lg:inline-flex items-center gap-0.5 rounded px-1.5 py-0.5',
                    'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
                    'text-[10px] font-mono text-gray-600 dark:text-gray-400'
                  )}
                  aria-label={`Keyboard shortcut: ${item.shortcut}`}
                >
                  {item.shortcut}
                </kbd>
              )}

              {index < 9 && showShortcuts && !item.shortcut && (
                <kbd
                  className={cn(
                    'hidden lg:inline-flex items-center gap-0.5 rounded px-1.5 py-0.5',
                    'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
                    'text-[10px] font-mono text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity'
                  )}
                  aria-label={`Keyboard shortcut: ${index + 1}`}
                >
                  {index + 1}
                </kbd>
              )}
            </div>
          </button>
        );
      })}

      {/* Screen reader helper text */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {items[focusedIndex] && (
          <>
            Currently focused: {items[focusedIndex].name}.
            {items[focusedIndex].description && <> {items[focusedIndex].description}.</>}
            {enableKeyboardNav && (
              <>
                {' '}
                Press {orientation === 'vertical' ? 'up or down arrow' : 'left or right arrow'} to
                navigate. Press Enter or Space to activate.
              </>
            )}
          </>
        )}
      </div>
    </nav>
  );
}

export default EnhancedNav;
