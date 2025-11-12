import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../design-system/utils';

export interface BreadcrumbItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ElementType;
  isCurrent?: boolean;
}

interface CollapsedBreadcrumbItem extends BreadcrumbItem {
  collapsed: true;
  collapsedItems: BreadcrumbItem[];
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (id: string) => void;
  showHome?: boolean;
  separator?: React.ReactNode;
  className?: string;
  maxItems?: number; // Collapse middle items if exceeded
}

/**
 * Breadcrumb Navigation Component
 * 
 * Provides hierarchical navigation context and quick backtracking
 * 
 * Features:
 * - ARIA-compliant navigation
 * - Keyboard accessible
 * - Responsive (collapses on mobile)
 * - Customizable separators
 * - Home icon shortcut
 * - Screen reader friendly
 * 
 * Usage:
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { id: 'dashboard', label: 'Dashboard' },
 *     { id: 'analytics', label: 'Analytics' },
 *     { id: 'charts', label: 'Pain Charts', isCurrent: true },
 *   ]}
 *   onNavigate={handleNavigate}
 *   showHome
 * />
 * ```
 */
export function Breadcrumbs({
  items,
  onNavigate,
  showHome = true,
  separator,
  className,
  maxItems = 4,
}: BreadcrumbsProps) {
  // Collapse items if too many
  const displayItems = React.useMemo(() => {
    if (items.length <= maxItems) {
      return items;
    }

    // Keep first, last, and collapse middle
    const first = items[0];
    const last = items[items.length - 1];
    const beforeLast = items[items.length - 2];

    const collapsed: CollapsedBreadcrumbItem = {
      id: 'ellipsis',
      label: '...',
      collapsed: true,
      collapsedItems: items.slice(1, -2),
    };

    return [first, collapsed, beforeLast, last];
  }, [items, maxItems]);

  const handleClick = (item: BreadcrumbItem, e: React.MouseEvent) => {
    if (item.isCurrent) {
      e.preventDefault();
      return;
    }

    if (onNavigate) {
      e.preventDefault();
      onNavigate(item.id);
    }
  };

  const defaultSeparator = (
    <ChevronRight
      className="h-4 w-4 text-gray-400 dark:text-gray-600"
      aria-hidden="true"
    />
  );

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm', className)}
    >
      <ol
        className="flex items-center space-x-2"
        role="list"
      >
        {/* Home icon */}
        {showHome && (
          <li>
            <button
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.('dashboard');
              }}
              className={cn(
                'flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                'transition-colors rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              )}
              aria-label="Home"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </button>
          </li>
        )}

        {/* Breadcrumb items */}
        {displayItems.map((item, index) => {
          const Icon = item.icon;
          const isCollapsed = 'collapsed' in item && item.collapsed;

          return (
            <li
              key={item.id}
              className="flex items-center space-x-2"
            >
              {/* Separator */}
              {(showHome || index > 0) && (
                <span aria-hidden="true">
                  {separator || defaultSeparator}
                </span>
              )}

              {/* Collapsed indicator (dropdown could be added here) */}
              {isCollapsed ? (
                <span
                  className="text-gray-400 dark:text-gray-600 px-1"
                  aria-label={`${(item as CollapsedBreadcrumbItem).collapsedItems?.length} items`}
                  title={`Skipped: ${(item as CollapsedBreadcrumbItem).collapsedItems
                    ?.map((i: BreadcrumbItem) => i.label)
                    .join(', ')}`}
                >
                  {item.label}
                </span>
              ) : (
                /* Regular item */
                <div className="flex items-center">
                  {item.isCurrent ? (
                    <span
                      className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-100"
                      aria-current="page"
                    >
                      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                      {item.label}
                    </span>
                  ) : (
                    <a
                      href={item.href || '#'}
                      onClick={(e) => handleClick(item, e)}
                      className={cn(
                        'flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
                        'transition-colors rounded-md px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      )}
                      aria-label={`Navigate to ${item.label}`}
                    >
                      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                      <span className="hidden sm:inline">{item.label}</span>
                      <span className="sm:hidden truncate max-w-[100px]">
                        {item.label}
                      </span>
                    </a>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
