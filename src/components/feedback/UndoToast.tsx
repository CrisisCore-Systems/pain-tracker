/**
 * UndoToast - Special toast for undo/redo operations
 */

import { useState, useEffect } from 'react';
import { RotateCcw, X } from 'lucide-react';

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: (id?: string) => void;
  duration?: number;
}

export function UndoToast({ message, onUndo, onDismiss, duration = 5000 }: UndoToastProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          onDismiss();
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onDismiss]);

  const handleUndo = () => {
    setIsVisible(false);
    onUndo();
    onDismiss();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible) return null;

  const progressPercentage = (timeLeft / duration) * 100;

  return (
    <div className="pointer-events-auto w-full max-w-sm rounded-lg border bg-card p-4 shadow-lg">
      <div className="flex items-center justify-between space-x-3">
        <div className="flex-1">
          <p className="text-sm text-foreground">{message}</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleUndo}
            className="flex items-center space-x-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Undo</span>
          </button>

          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-full bg-muted rounded-full h-1">
        <div
          className="bg-primary h-1 rounded-full transition-all duration-100 ease-linear"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}
