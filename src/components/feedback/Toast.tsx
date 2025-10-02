/**
 * Toast - Individual toast notification component
 */

import { useEffect, useState, useCallback } from 'react';
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
  onDismiss?: (id?: string) => void;
}

interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: { label: string; onClick: () => void };
  onDismiss: (id?: string) => void;
  onDismissHook?: (id?: string) => void;
}

export function Toast({ id, type, title, message, duration = 5000, action, onDismiss: onDismissRequired, onDismissHook }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismissRequired(id);
      onDismissHook?.(id);
    }, 150); // Animation duration
  }, [id, onDismissRequired, onDismissHook]);

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
        return <CheckCircle className="h-5 w-5 text-destructive-foreground" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive-foreground" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-accent-foreground" />;
      case 'info':
        return <Info className="h-5 w-5 text-primary-foreground" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-card border-border text-foreground';
      case 'error':
        return 'bg-card border-border text-foreground';
      case 'warning':
        return 'bg-card border-border text-foreground';
      case 'info':
        return 'bg-card border-border text-foreground';
      default:
        return 'bg-card border-border';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-lg
        transition-all duration-150 ease-in-out
        ${getBackgroundColor()}
        ${isExiting ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          {message && (
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          )}
          
          {action && (
            <button
              onClick={action.onClick}
              className="text-sm font-medium text-primary hover:text-primary/80 mt-2 block"
            >
              {action.label}
            </button>
          )}
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}