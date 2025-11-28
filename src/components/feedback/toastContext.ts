import { createContext, useContext } from 'react';
import { ToastData } from './Toast';

export interface ToastContextType {
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  addBottomLeftToast: (toast: Omit<ToastData, 'id'>) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}
