/**
 * useToast - Hook for using toast notifications
 */

import { useToastContext } from './ToastProvider';

export function useToast() {
  const { addToast, removeToast, clearToasts } = useToastContext();

  const toast = {
    success: (title: string, message?: string, action?: { label: string; onClick: () => void }) => {
      addToast({
        type: 'success',
        title,
        message,
        action,
      });
    },

    error: (title: string, message?: string, action?: { label: string; onClick: () => void }) => {
      addToast({
        type: 'error',
        title,
        message,
        action,
        duration: 7000, // Longer duration for errors
      });
    },

    warning: (title: string, message?: string, action?: { label: string; onClick: () => void }) => {
      addToast({
        type: 'warning',
        title,
        message,
        action,
        duration: 6000,
      });
    },

    info: (title: string, message?: string, action?: { label: string; onClick: () => void }) => {
      addToast({
        type: 'info',
        title,
        message,
        action,
      });
    },

    custom: (toastData: Parameters<typeof addToast>[0]) => {
      addToast(toastData);
    },

    dismiss: removeToast,
    clear: clearToasts,
  };

  return toast;
}