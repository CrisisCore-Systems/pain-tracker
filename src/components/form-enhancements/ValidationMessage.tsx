/**
 * ValidationMessage - Accessible validation message component
 */

import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface ValidationMessageProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  fieldId?: string;
  className?: string;
}

export function ValidationMessage({ type, message, fieldId, className = '' }: ValidationMessageProps) {
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div
      id={fieldId ? `${fieldId}-${type}` : undefined}
      className={`flex items-start space-x-2 text-sm ${getStyles()} ${className}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <span>{message}</span>
    </div>
  );
}