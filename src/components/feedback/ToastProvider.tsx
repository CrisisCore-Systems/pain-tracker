/**
 * ToastProvider - Context provider for toast notifications
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastData } from './Toast';

interface ToastContextType {
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  addBottomLeftToast: (toast: Omit<ToastData, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

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

    setToasts(prev => [...prev, newToast]);
  };

  const addBottomLeftToast = (toastData: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastData = {
      ...toastData,
      id,
    };

    setBottomLeftToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
    setBottomLeftToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
    setBottomLeftToasts([]);
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast, clearToasts, addBottomLeftToast }}>
      {children}
      
      {/* Top-right toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={removeToast}
          />
        ))}
      </div>

      {/* Bottom-left toast container */}
      <div className="fixed bottom-4 left-4 z-[10000] flex flex-col space-y-2 pointer-events-none max-w-[90%]">
        {bottomLeftToasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onDismiss={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}