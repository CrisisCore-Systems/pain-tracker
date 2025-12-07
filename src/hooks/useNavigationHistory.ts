import { useEffect, useState, useCallback, useRef } from 'react';
import { secureStorage } from '../lib/storage/secureStorage';

export interface NavigationHistoryItem {
  id: string;
  label: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface UseNavigationHistoryOptions {
  maxHistory?: number;
  persistKey?: string; // LocalStorage key for persistence
  enableQuickSwitch?: boolean; // Alt+Tab style switching
}

/**
 * Navigation History Hook
 *
 * Tracks navigation history and provides Alt+Tab style quick switching
 *
 * Features:
 * - Track navigation history
 * - Quick switch between recent views (Alt+Tab)
 * - Persist history to localStorage
 * - LRU (Least Recently Used) eviction
 * - Keyboard shortcuts
 *
 * Usage:
 * ```tsx
 * const {
 *   history,
 *   currentIndex,
 *   goBack,
 *   goForward,
 *   canGoBack,
 *   canGoForward,
 *   pushHistory,
 *   quickSwitch,
 *   isQuickSwitching,
 * } = useNavigationHistory({
 *   maxHistory: 50,
 *   persistKey: 'pain-tracker-nav-history',
 *   enableQuickSwitch: true,
 * });
 *
 * // Push new navigation
 * pushHistory({
 *   id: 'analytics',
 *   label: 'Analytics Dashboard',
 *   metadata: { section: 'charts' },
 * });
 *
 * // Go back
 * const previousView = goBack();
 *
 * // Quick switch (Alt+Tab)
 * const switchedView = quickSwitch();
 * ```
 */
export function useNavigationHistory(options: UseNavigationHistoryOptions = {}) {
  const { maxHistory = 50, persistKey, enableQuickSwitch = true } = options;

  const [history, setHistory] = useState<NavigationHistoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isQuickSwitching, setIsQuickSwitching] = useState(false);
  const quickSwitchTimeoutRef = useRef<NodeJS.Timeout>();

  // Load from secureStorage on mount
  useEffect(() => {
    if (!persistKey) return;

    try {
      const stored = secureStorage.get<{ history: NavigationHistoryItem[]; currentIndex: number }>(persistKey);
      if (stored) {
        setHistory(stored.history || []);
        setCurrentIndex(stored.currentIndex ?? -1);
      }
    } catch (error) {
      console.error('Failed to load navigation history:', error);
    }
  }, [persistKey]);

  // Save to secureStorage when history changes
  useEffect(() => {
    if (!persistKey) return;

    try {
      secureStorage.set(persistKey, {
        history,
        currentIndex,
      });
    } catch (error) {
      console.error('Failed to save navigation history:', error);
    }
  }, [history, currentIndex, persistKey]);

  // Push new item to history
  const pushHistory = useCallback(
    (item: Omit<NavigationHistoryItem, 'timestamp'>) => {
      setHistory(prev => {
        // Remove any items after current position (branching)
        const newHistory = prev.slice(0, currentIndex + 1);

        // Check if same as current item (don't duplicate)
        if (newHistory.length > 0 && newHistory[newHistory.length - 1].id === item.id) {
          return prev;
        }

        // Add new item
        const newItem: NavigationHistoryItem = {
          ...item,
          timestamp: Date.now(),
        };

        newHistory.push(newItem);

        // Enforce max history (LRU eviction)
        if (newHistory.length > maxHistory) {
          newHistory.shift();
          setCurrentIndex(idx => idx - 1);
        } else {
          setCurrentIndex(newHistory.length - 1);
        }

        return newHistory;
      });
    },
    [currentIndex, maxHistory]
  );

  // Go back in history
  const goBack = useCallback((): NavigationHistoryItem | null => {
    if (currentIndex > 0) {
      setCurrentIndex(idx => idx - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  // Go forward in history
  const goForward = useCallback((): NavigationHistoryItem | null => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(idx => idx + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  // Quick switch (Alt+Tab style) - switch to previous view
  const quickSwitch = useCallback((): NavigationHistoryItem | null => {
    if (history.length < 2) return null;

    // If already quick switching, cycle through history
    if (isQuickSwitching) {
      const nextIndex = currentIndex > 0 ? currentIndex - 1 : history.length - 1;
      setCurrentIndex(nextIndex);
      return history[nextIndex];
    }

    // Start quick switching - go to previous item
    setIsQuickSwitching(true);
    if (currentIndex > 0) {
      setCurrentIndex(idx => idx - 1);
      return history[currentIndex - 1];
    }

    return null;
  }, [currentIndex, history, isQuickSwitching]);

  // End quick switching after timeout
  useEffect(() => {
    if (!isQuickSwitching) return;

    // Clear existing timeout
    if (quickSwitchTimeoutRef.current) {
      clearTimeout(quickSwitchTimeoutRef.current);
    }

    // Set new timeout
    quickSwitchTimeoutRef.current = setTimeout(() => {
      setIsQuickSwitching(false);
    }, 500); // 500ms to keep switching

    return () => {
      if (quickSwitchTimeoutRef.current) {
        clearTimeout(quickSwitchTimeoutRef.current);
      }
    };
  }, [isQuickSwitching, currentIndex]);

  // Global keyboard shortcuts
  useEffect(() => {
    if (!enableQuickSwitch) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+Left Arrow - Go back
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
      }

      // Alt+Right Arrow - Go forward
      if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        goForward();
      }

      // Alt+Tab - Quick switch
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        quickSwitch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableQuickSwitch, goBack, goForward, quickSwitch]);

  // Get recent items (excluding current)
  const getRecentItems = useCallback(
    (count: number = 5): NavigationHistoryItem[] => {
      return history
        .slice()
        .reverse()
        .filter((_, index) => index !== history.length - currentIndex - 1)
        .slice(0, count);
    },
    [history, currentIndex]
  );

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  // Jump to specific index
  const jumpToIndex = useCallback(
    (index: number): NavigationHistoryItem | null => {
      if (index >= 0 && index < history.length) {
        setCurrentIndex(index);
        return history[index];
      }
      return null;
    },
    [history]
  );

  return {
    // State
    history,
    currentIndex,
    currentItem: history[currentIndex] || null,
    isQuickSwitching,

    // Capabilities
    canGoBack: currentIndex > 0,
    canGoForward: currentIndex < history.length - 1,

    // Actions
    pushHistory,
    goBack,
    goForward,
    quickSwitch,
    clearHistory,
    jumpToIndex,

    // Utilities
    getRecentItems,
  };
}

export default useNavigationHistory;
