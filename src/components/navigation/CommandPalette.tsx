import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Command, ArrowRight, Clock, Star, Hash } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../design-system/utils';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  category?: string;
  keywords?: string[]; // For better search matching
  shortcut?: string;
  action: () => void | Promise<void>;
  recent?: boolean;
  favorite?: boolean;
}

export interface CommandGroup {
  name: string;
  items: CommandItem[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: CommandItem[];
  recentItems?: CommandItem[];
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

/**
 * Command Palette (⌘K / Ctrl+K)
 * 
 * Quick navigation and action launcher with fuzzy search
 * 
 * Features:
 * - Fuzzy search across commands
 * - Keyboard-first navigation (↑↓, Enter, Esc)
 * - Recent items tracking
 * - Favorites support
 * - Categorized results
 * - Global keyboard shortcut (⌘K / Ctrl+K)
 * - Accessible modal dialog
 * 
 * Usage:
 * ```tsx
 * const [commandOpen, setCommandOpen] = useState(false);
 * 
 * <CommandPalette
 *   isOpen={commandOpen}
 *   onClose={() => setCommandOpen(false)}
 *   items={commands}
 *   recentItems={recentCommands}
 * />
 * 
 * // Trigger with keyboard shortcut
 * useEffect(() => {
 *   const handleKeyDown = (e: KeyboardEvent) => {
 *     if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
 *       e.preventDefault();
 *       setCommandOpen(true);
 *     }
 *   };
 *   window.addEventListener('keydown', handleKeyDown);
 *   return () => window.removeEventListener('keydown', handleKeyDown);
 * }, []);
 * ```
 */
export function CommandPalette({
  isOpen,
  onClose,
  items,
  recentItems = [],
  placeholder = 'Type a command or search...',
  emptyMessage = 'No results found.',
  className,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Fuzzy search implementation
  const fuzzyMatch = (str: string, pattern: string): boolean => {
    const searchLower = pattern.toLowerCase();
    const strLower = str.toLowerCase();

    // Simple fuzzy: all characters of pattern must appear in order in str
    let patternIndex = 0;
    for (let i = 0; i < strLower.length && patternIndex < searchLower.length; i++) {
      if (strLower[i] === searchLower[patternIndex]) {
        patternIndex++;
      }
    }

    return patternIndex === searchLower.length;
  };

  // Filter and group items
  const groupedItems = useMemo(() => {
    const allItems = [...items];
    
    // Add recent items with flag
    const recentWithFlag = recentItems.map((item) => ({
      ...item,
      recent: true,
    }));

    if (!search) {
      // No search: show recents and all items grouped by category
      const groups: CommandGroup[] = [];

      if (recentWithFlag.length > 0) {
        groups.push({
          name: 'Recent',
          items: recentWithFlag.slice(0, 5),
        });
      }

      // Group by category
      const categorized = new Map<string, CommandItem[]>();
      allItems.forEach((item) => {
        const category = item.category || 'Commands';
        if (!categorized.has(category)) {
          categorized.set(category, []);
        }
        categorized.get(category)!.push(item);
      });

      categorized.forEach((items, category) => {
        groups.push({ name: category, items });
      });

      return groups;
    }

    // With search: filter and rank
    const filtered = allItems.filter((item) => {
      const searchable = [
        item.label,
        item.description || '',
        item.category || '',
        ...(item.keywords || []),
      ].join(' ');

      return fuzzyMatch(searchable, search);
    });

    // Sort by relevance (simple: exact match > starts with > contains)
    filtered.sort((a, b) => {
      const aLabel = a.label.toLowerCase();
      const bLabel = b.label.toLowerCase();
      const searchLower = search.toLowerCase();

      if (aLabel === searchLower) return -1;
      if (bLabel === searchLower) return 1;
      if (aLabel.startsWith(searchLower)) return -1;
      if (bLabel.startsWith(searchLower)) return 1;
      return aLabel.localeCompare(bLabel);
    });

    if (filtered.length === 0) {
      return [];
    }

    // Group search results by category
    const categorized = new Map<string, CommandItem[]>();
    filtered.forEach((item) => {
      const category = item.category || 'Commands';
      if (!categorized.has(category)) {
        categorized.set(category, []);
      }
      categorized.get(category)!.push(item);
    });

    const groups: CommandGroup[] = [];
    categorized.forEach((items, category) => {
      groups.push({ name: category, items });
    });

    return groups;
  }, [items, recentItems, search]);

  // Flatten for keyboard navigation
  const flatItems = useMemo(() => {
    return groupedItems.flatMap((group) => group.items);
  }, [groupedItems]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [groupedItems]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatItems.length);
        break;
      }

      case 'ArrowUp': {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
        break;
      }

      case 'Enter': {
        e.preventDefault();
        if (flatItems[selectedIndex]) {
          executeCommand(flatItems[selectedIndex]);
        }
        break;
      }

      case 'Escape': {
        e.preventDefault();
        onClose();
        break;
      }

      case 'Home': {
        e.preventDefault();
        setSelectedIndex(0);
        break;
      }

      case 'End': {
        e.preventDefault();
        setSelectedIndex(flatItems.length - 1);
        break;
      }
    }
  };

  const executeCommand = async (item: CommandItem) => {
    await item.action();
    onClose();
  };

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center p-4 sm:p-6 md:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Command Palette */}
      <div
        className={cn(
          'relative w-full max-w-2xl mt-16',
          'bg-white dark:bg-gray-900 rounded-2xl shadow-2xl',
          'border border-gray-200 dark:border-gray-700',
          'overflow-hidden',
          'transform transition-all',
          className
        )}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'flex-1 bg-transparent text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-600',
              'focus:outline-none text-sm'
            )}
            aria-label="Search commands"
            aria-autocomplete="list"
            aria-controls="command-list"
            aria-activedescendant={
              flatItems[selectedIndex] ? `command-item-${flatItems[selectedIndex].id}` : undefined
            }
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-xs font-mono text-gray-600 dark:text-gray-400">
            <Command className="h-3 w-3" aria-hidden="true" />K
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          id="command-list"
          role="listbox"
          className="max-h-[400px] overflow-y-auto overscroll-contain p-2"
        >
          {groupedItems.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              {emptyMessage}
            </div>
          ) : (
            groupedItems.map((group) => (
              <div key={group.name} className="mb-4 last:mb-0">
                {/* Group Header */}
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {group.name}
                </div>

                {/* Group Items */}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const itemIndex = flatIndex++;
                    const Icon = item.icon || Hash;
                    const isSelected = itemIndex === selectedIndex;

                    return (
                      <button
                        key={item.id}
                        ref={(el) => (itemRefs.current[itemIndex] = el)}
                        id={`command-item-${item.id}`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => executeCommand(item)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                          'focus:outline-none',
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 flex-shrink-0',
                            isSelected
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-400 dark:text-gray-600'
                          )}
                          aria-hidden="true"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {item.label}
                            </span>
                            {item.recent && (
                              <Clock
                                className="h-3 w-3 text-gray-400 dark:text-gray-500"
                                aria-label="Recent"
                              />
                            )}
                            {item.favorite && (
                              <Star
                                className="h-3 w-3 text-yellow-500 fill-yellow-500"
                                aria-label="Favorite"
                              />
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>

                        {item.shortcut && (
                          <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-[10px] font-mono text-gray-600 dark:text-gray-400">
                            {item.shortcut}
                          </kbd>
                        )}

                        {isSelected && (
                          <ArrowRight
                            className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 font-mono">
                ↑↓
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 font-mono">
                ↵
              </kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 font-mono">
                Esc
              </kbd>
              Close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
