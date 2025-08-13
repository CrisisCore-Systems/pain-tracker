/**
 * HelpHint - Dismissible hint component for providing contextual tips
 */

import { useState, useEffect } from 'react';
import { X, Lightbulb, Info, AlertTriangle } from 'lucide-react';

interface HelpHintProps {
  message: string;
  type?: 'tip' | 'info' | 'warning';
  persistKey?: string; // Key for localStorage to remember dismissal
  className?: string;
  onDismiss?: () => void;
}

export function HelpHint({ 
  message, 
  type = 'tip', 
  persistKey, 
  className = '',
  onDismiss 
}: HelpHintProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Check if hint was previously dismissed
  useEffect(() => {
    if (persistKey) {
      const dismissed = localStorage.getItem(`hint-dismissed-${persistKey}`);
      if (dismissed === 'true') {
        setIsVisible(false);
      }
    }
  }, [persistKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Remember dismissal if persistKey is provided
    if (persistKey) {
      localStorage.setItem(`hint-dismissed-${persistKey}`, 'true');
    }
    
    onDismiss?.();
  };

  const getIcon = () => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'tip':
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-200';
      case 'tip':
      default:
        return 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200';
    }
  };

  const getIconStyles = () => {
    switch (type) {
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'tip':
      default:
        return 'text-emerald-600 dark:text-emerald-400';
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`flex items-start space-x-3 p-4 rounded-lg border ${getStyles()} ${className}`}
      role="note"
      aria-live="polite"
    >
      <div className={`flex-shrink-0 ${getIconStyles()}`}>
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm">{message}</p>
      </div>
      
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-current hover:opacity-70 transition-opacity"
        aria-label="Dismiss hint"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}