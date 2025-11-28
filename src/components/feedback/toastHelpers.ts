import { ToastData } from './Toast';

export function addToastToList(prev: ToastData[], newToast: ToastData, maxToasts = 6): ToastData[] {
  // Deduplicate by type + title + message to avoid repeating identical toasts
  const exists = prev.find(t => t.type === newToast.type && t.title === newToast.title && t.message === newToast.message);
  if (exists) {
    // Refresh existing toast by moving it to the end and preserving its id
    const filtered = prev.filter(t => t.id !== exists.id);
    return [...filtered, { ...exists, id: exists.id }];
  }

  const next = [...prev, newToast];
  if (next.length > maxToasts) return next.slice(next.length - maxToasts);
  return next;
}

export function addBottomLeftToastToList(prev: ToastData[], newToast: ToastData, maxBottomToasts = 3): ToastData[] {
  // Bottom-left toasts are deduplicated strongly and have a smaller cap.
  const exists = prev.find(t => t.type === newToast.type && t.title === newToast.title && t.message === newToast.message);
  if (exists) {
    const filtered = prev.filter(t => t.id !== exists.id);
    return [...filtered, { ...exists, id: exists.id }];
  }

  const next = [...prev, newToast];
  if (next.length > maxBottomToasts) return next.slice(next.length - maxBottomToasts);
  return next;
}

export function removeToastById(prev: ToastData[], id: string): ToastData[] {
  return prev.filter(t => t.id !== id);
}
