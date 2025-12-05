/**
 * ToastProvider - Context provider for toast notifications
 */

import { useState, ReactNode } from 'react';
import { Toast, ToastData } from './Toast';
import { addToastToList, addBottomLeftToastToList, removeToastById } from './toastHelpers';
import { ToastContext } from './toastContext';

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

      {/* Top-right toast container */}
      {/* Increased z-index to ensure toast appears above PWA install prompt (which uses z-index ~1001)
      and other floating UI. Using a very high explicit z-index to avoid stacking conflicts. */}
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

      {/* Bottom-left toast container */}
      {/* Keep bottom-left toasts slightly lower than top-right but still very high to avoid being overlapped */}
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
    </ToastContext.Provider>
  );
}
