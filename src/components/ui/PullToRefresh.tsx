/**
 * Pull-to-Refresh Component for Mobile
 * Provides pull-to-refresh functionality with visual feedback
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '../../design-system/utils';
import { usePullToRefresh } from '../../hooks/useSwipeGesture';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  disabled?: boolean;
  pullText?: string;
  refreshingText?: string;
  releaseText?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
  threshold = 80,
  disabled = false,
  pullText = 'Pull to refresh',
  refreshingText = 'Refreshing...',
  releaseText = 'Release to refresh',
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  const { ref, pullDistance, pullProgress, isRefreshing: gestureRefreshing } = usePullToRefresh(
    handleRefresh,
    { pullThreshold: threshold }
  );

  const isCurrentlyRefreshing = isRefreshing || gestureRefreshing;
  const showIndicator = pullDistance > 10 && !isCurrentlyRefreshing;

  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      style={{
        transform: showIndicator ? `translateY(${Math.min(pullDistance * 0.5, threshold)}px)` : undefined,
        transition: showIndicator ? 'none' : 'transform 0.3s ease',
      }}
    >
      {/* Pull indicator */}
      {showIndicator && (
        <div
          className="pull-refresh-indicator"
          style={{
            opacity: Math.min(pullProgress, 1),
            transform: `translateX(-50%) rotate(${pullProgress * 180}deg)`,
          }}
        >
          <RefreshCw className="w-5 h-5" />
        </div>
      )}

      {/* Refreshing indicator */}
      {isCurrentlyRefreshing && (
        <div className="pull-refresh-indicator refreshing">
          <div className="spinner" />
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          'transition-transform duration-300 ease-out',
          isCurrentlyRefreshing && 'pointer-events-none'
        )}
        style={{
          transform: isCurrentlyRefreshing ? `translateY(${threshold}px)` : undefined,
        }}
      >
        {children}
      </div>

      {/* Status text for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isCurrentlyRefreshing ? refreshingText :
         pullProgress >= 1 ? releaseText :
         pullProgress > 0 ? pullText : ''}
      </div>
    </div>
  );
}

// Higher-level component for dashboard refresh
interface DashboardPullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  lastRefresh?: Date;
}

export function DashboardPullToRefresh({
  onRefresh,
  children,
  className,
  lastRefresh,
}: DashboardPullToRefreshProps) {
  const handleRefresh = useCallback(async () => {
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    await onRefresh();
  }, [onRefresh]);

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      className={className}
      pullText="Pull down to refresh data"
      refreshingText="Refreshing your pain data..."
      releaseText="Release to refresh"
    >
      {children}

      {/* Last refresh indicator */}
      {lastRefresh && (
        <div className="text-xs text-muted-foreground text-center py-2 border-t">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      )}
    </PullToRefresh>
  );
}