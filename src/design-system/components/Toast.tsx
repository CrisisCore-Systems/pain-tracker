/**
 * Toast Notification System
 * Animated toast notifications with auto-dismiss and accessibility support
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../utils';
import { Slide } from './PageTransition';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position = 'top-right',
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts(prev => {
      const updated = [...prev, newToast];
      // Limit number of toasts
      return updated.slice(-maxToasts);
    });

    // Auto-dismiss if duration is set
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  position: ToastPosition;
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, position, onRemove }: ToastContainerProps) {
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-2 pointer-events-none',
        positionClasses[position]
      )}
      aria-live="polite"
      aria-atomic="true"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const interval = 50;
      const decrement = (interval / toast.duration) * 100;

      const timer = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - decrement;
          return newProgress > 0 ? newProgress : 0;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [toast.duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Match animation duration
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  };

  const colorClasses = {
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: 'text-emerald-600 dark:text-emerald-400',
      text: 'text-emerald-900 dark:text-emerald-100',
      progress: 'bg-emerald-500',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-900 dark:text-red-100',
      progress: 'bg-red-500',
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      icon: 'text-amber-600 dark:text-amber-400',
      text: 'text-amber-900 dark:text-amber-100',
      progress: 'bg-amber-500',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-900 dark:text-blue-100',
      progress: 'bg-blue-500',
    },
  };

  const colors = colorClasses[toast.type];

  return (
    <Slide
      show={isVisible}
      direction="down"
      duration={300}
      className="pointer-events-auto"
    >
      <div
        className={cn(
          'min-w-[320px] max-w-md rounded-lg border-2 shadow-lg backdrop-blur-sm',
          'animate-[slideInRight_0.3s_ease-out]',
          colors.bg,
          colors.border
        )}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className={cn('flex-shrink-0', colors.icon)}>
              {icons[toast.type]}
            </div>

            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-semibold', colors.text)}>
                {toast.title}
              </p>
              {toast.message && (
                <p className={cn('text-sm mt-1 opacity-90', colors.text)}>
                  {toast.message}
                </p>
              )}

              {toast.action && (
                <button
                  onClick={() => {
                    toast.action!.onClick();
                    handleClose();
                  }}
                  className={cn(
                    'text-sm font-medium mt-2 hover:underline focus:outline-none focus:underline',
                    colors.icon
                  )}
                >
                  {toast.action.label}
                </button>
              )}
            </div>

            <button
              onClick={handleClose}
              className={cn(
                'flex-shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                'transition-colors',
                colors.icon
              )}
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {toast.duration && toast.duration > 0 && (
          <div className="h-1 bg-black/10 dark:bg-white/10 overflow-hidden rounded-b-lg">
            <div
              className={cn('h-full transition-all ease-linear', colors.progress)}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </Slide>
  );
}

// Convenience hooks for common toast types
export function useSuccessToast() {
  const { addToast } = useToast();
  return useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      return addToast({ type: 'success', title, message, ...options });
    },
    [addToast]
  );
}

export function useErrorToast() {
  const { addToast } = useToast();
  return useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      return addToast({ type: 'error', title, message, ...options });
    },
    [addToast]
  );
}

export function useWarningToast() {
  const { addToast } = useToast();
  return useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      return addToast({ type: 'warning', title, message, ...options });
    },
    [addToast]
  );
}

export function useInfoToast() {
  const { addToast } = useToast();
  return useCallback(
    (title: string, message?: string, options?: Partial<Toast>) => {
      return addToast({ type: 'info', title, message, ...options });
    },
    [addToast]
  );
}
