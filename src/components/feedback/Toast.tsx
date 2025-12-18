/**
 * Toast - Individual toast notification component
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

interface ToastProps extends Omit<ToastData, 'onDismiss'> {
  onDismiss: (id: string) => void;
  customOnDismiss?: () => void;
}

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  action,
  customOnDismiss,
  onDismiss,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const isMountedRef = useRef(true);
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track mounted state to prevent state updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Clear any pending timeouts on unmount
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }
    };
  }, []);

  const handleDismiss = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setIsExiting(true);
    
    // Clear any existing timeout
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
    }
    
    dismissTimeoutRef.current = setTimeout(() => {
      // Check if still mounted before updating state
      if (!isMountedRef.current) return;
      
      setIsVisible(false);
      try {
        onDismiss(id);
        customOnDismiss?.();
      } catch (error) {
        // Silently handle errors during dismiss - component may be unmounting
        console.debug('Toast dismiss error (safe to ignore):', error);
      }
    }, 150); // Animation duration
  }, [id, onDismiss, customOnDismiss]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, handleDismiss]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800';
      default:
        return 'bg-card border-border';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        w-full max-w-sm rounded-lg border p-4 shadow-lg
        transition-all duration-150 ease-in-out
        ${getBackgroundColor()}
        ${isExiting ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          {message && <p className="text-sm text-muted-foreground mt-1">{message}</p>}

          {action && (
            <button
              onClick={action.onClick}
              className="pointer-events-auto text-sm font-medium text-primary hover:text-primary/80 mt-2 block"
            >
              {action.label}
            </button>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="pointer-events-auto flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
