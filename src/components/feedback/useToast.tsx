/**
 * useToast - Hook for using toast notifications
 */

import { useToastContext } from './ToastProvider';

export function useToast() {
  const { addToast, removeToast, clearToasts, addBottomLeftToast } = useToastContext();

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

    bottomLeft: {
      success: (title: string, message?: string, action?: { label: string; onClick: () => void }, options?: { onDismiss?: () => void }) => {
        addBottomLeftToast({
          type: 'success',
          title,
          message,
          action,
          onDismiss: options?.onDismiss,
        });
      },

      error: (title: string, message?: string, action?: { label: string; onClick: () => void }, options?: { onDismiss?: () => void }) => {
        addBottomLeftToast({
          type: 'error',
          title,
          message,
          action,
          duration: 7000,
          onDismiss: options?.onDismiss,
        });
      },

      warning: (title: string, message?: string, action?: { label: string; onClick: () => void }, options?: { onDismiss?: () => void }) => {
        addBottomLeftToast({
          type: 'warning',
          title,
          message,
          action,
          duration: 6000,
          onDismiss: options?.onDismiss,
        });
      },

      info: (title: string, message?: string, action?: { label: string; onClick: () => void }, options?: { onDismiss?: () => void }) => {
        addBottomLeftToast({
          type: 'info',
          title,
          message,
          action,
          onDismiss: options?.onDismiss,
        });
      },
    },

    custom: (toastData: Parameters<typeof addToast>[0]) => {
      addToast(toastData);
    },

    dismiss: removeToast,
    clear: clearToasts,
  };

  return toast;
}