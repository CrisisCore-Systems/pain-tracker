/**
 * AutoSave - Auto-save functionality for forms
 */

import { useEffect, useState, useRef } from 'react';
import { Check, Cloud, CloudOff, RotateCcw } from 'lucide-react';

interface AutoSaveProps {
  data: any;
  onSave: (data: any) => Promise<void> | void;
  delay?: number;
  storageKey?: string;
  className?: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function AutoSave({ 
  data, 
  onSave, 
  delay = 2000, 
  storageKey,
  className = '' 
}: AutoSaveProps) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef(data);

  useEffect(() => {
    // Check if data has actually changed
    if (JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    previousDataRef.current = data;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set status to indicate changes pending
    if (status !== 'saving') {
      setStatus('idle');
    }

    // Start new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        setStatus('saving');
        
        // Save to localStorage if storageKey provided
        if (storageKey) {
          localStorage.setItem(storageKey, JSON.stringify(data));
        }
        
        // Call the onSave function
        await onSave(data);
        
        setStatus('saved');
        setLastSaved(new Date());
        
        // Reset to idle after showing saved status
        setTimeout(() => setStatus('idle'), 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setStatus('error');
        
        // Reset to idle after showing error
        setTimeout(() => setStatus('idle'), 3000);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, onSave, delay, storageKey, status]);

  // Load from localStorage on mount
  useEffect(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const savedData = JSON.parse(saved);
          // Only use saved data if current data is empty/default
          if (Object.keys(data).length === 0 || JSON.stringify(data) === JSON.stringify({})) {
            previousDataRef.current = savedData;
          }
        }
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, [storageKey]);

  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <RotateCcw className="h-4 w-4 animate-spin" />,
          text: 'Saving...',
          color: 'text-blue-600'
        };
      case 'saved':
        return {
          icon: <Check className="h-4 w-4" />,
          text: 'Saved',
          color: 'text-green-600'
        };
      case 'error':
        return {
          icon: <CloudOff className="h-4 w-4" />,
          text: 'Save failed',
          color: 'text-red-600'
        };
      default:
        return {
          icon: <Cloud className="h-4 w-4" />,
          text: lastSaved ? `Last saved ${formatTime(lastSaved)}` : 'Auto-save enabled',
          color: 'text-muted-foreground'
        };
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // Less than 1 minute
      return 'just now';
    } else if (diff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className={`flex items-center space-x-2 text-sm ${statusDisplay.color} ${className}`}>
      {statusDisplay.icon}
      <span>{statusDisplay.text}</span>
    </div>
  );
}