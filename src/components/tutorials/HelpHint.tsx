/**
 * HelpHint - Dismissible hint component for providing contextual tips
 */

import { useState, useEffect } from 'react';
import { secureStorage } from '../../lib/storage/secureStorage';
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
  const dismissed = secureStorage.get<string>(`hint-dismissed-${persistKey}`);
      if (dismissed === 'true') {
        setIsVisible(false);
      }
    }
  }, [persistKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Remember dismissal if persistKey is provided
    if (persistKey) {
  secureStorage.set(`hint-dismissed-${persistKey}`, 'true');
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
        // Use semantic primary token so colors follow ThemeProvider / CSS variables
        return 'bg-primary/10 border-primary text-primary-foreground dark:bg-primary/20 dark:border-primary';
      case 'warning':
        // Use destructive as a semantic warning/danger token
        return 'bg-destructive/10 border-destructive text-destructive-foreground dark:bg-destructive/20 dark:border-destructive';
      case 'tip':
      default:
        // Use accent for neutral tips
        return 'bg-accent/10 border-accent text-accent-foreground dark:bg-accent/20 dark:border-accent';
    }
  };

  const getIconStyles = () => {
    switch (type) {
      case 'info':
        return 'text-primary dark:text-primary-foreground';
      case 'warning':
        return 'text-destructive dark:text-destructive-foreground';
      case 'tip':
      default:
        return 'text-accent dark:text-accent-foreground';
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