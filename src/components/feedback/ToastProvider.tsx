/**
 * ToastProvider - Context provider for toast notifications
 */

import { useState, ReactNode, Component, ErrorInfo } from 'react';
import { Toast, ToastData } from './Toast';
import { addToastToList, addBottomLeftToastToList, removeToastById } from './toastHelpers';
import { ToastContext } from './toastContext';

// Simple error boundary for toast rendering - prevents toast errors from crashing the app
// IMPORTANT: Does NOT try to recover/recreate toasts - just renders nothing on error
class ToastErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    // Mark as errored - will render nothing
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log but don't crash - toast errors are non-critical
    // DO NOT try to reset state or recreate - this causes infinite loops
    console.debug('Toast error caught (safe to ignore):', error.message, errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Render empty div - DO NOT try to recover, it causes infinite loops
      return <div style={{ display: 'none' }} aria-hidden="true" />;
    }
    return this.props.children;
  }
}

// ToastContext and hook live in `toastContext.ts` to keep this file focused on the provider component.

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [bottomLeftToasts, setBottomLeftToasts] = useState<ToastData[]>([]);

  const addToast = (toastData: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastData = {
      ...toastData,
      id,
    };

    setToasts(prev => addToastToList(prev, newToast));
  };

  const addBottomLeftToast = (toastData: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastData = {
      ...toastData,
      id,
    };

    setBottomLeftToasts(prev => addBottomLeftToastToList(prev, newToast));
  };

  const removeToast = (id: string) => {
    setToasts(prev => removeToastById(prev, id));
    setBottomLeftToasts(prev => removeToastById(prev, id));
  };

  const clearToasts = () => {
    setToasts([]);
    setBottomLeftToasts([]);
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearToasts, addBottomLeftToast }}>
      {children}

      {/* Top-right toast container - wrapped in error boundary to prevent crashes */}
      {/* Increased z-index to ensure toast appears above PWA install prompt (which uses z-index ~1001)
      and other floating UI. Using a very high explicit z-index to avoid stacking conflicts. */}
      <ToastErrorBoundary>
        <div className="fixed top-4 right-4 z-[10002] flex flex-col space-y-2 pointer-events-none">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              {...toast}
              customOnDismiss={toast.onDismiss}
              onDismiss={(id?: string) => removeToast(id ?? toast.id)}
            />
          ))}
        </div>
      </ToastErrorBoundary>

      {/* Bottom-left toast container - wrapped in error boundary to prevent crashes */}
      {/* Keep bottom-left toasts slightly lower than top-right but still very high to avoid being overlapped */}
      <ToastErrorBoundary>
        <div className="fixed bottom-4 left-4 z-[10000] flex flex-col space-y-2 pointer-events-none max-w-[90%]">
          {bottomLeftToasts.map(toast => (
            <Toast
              key={toast.id}
              {...toast}
              customOnDismiss={toast.onDismiss}
              onDismiss={(id?: string) => removeToast(id ?? toast.id)}
            />
          ))}
        </div>
      </ToastErrorBoundary>
    </ToastContext.Provider>
  );
}
