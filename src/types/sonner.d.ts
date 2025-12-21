declare module 'sonner' {
  export type ToastId = string | number;

  export interface ToastAPI {
    (message: string): ToastId;
    loading: (message: string) => ToastId;
    dismiss: (id?: ToastId) => void;
    success: (message: string) => void;
    error: (message: string) => void;
  }

  export const toast: ToastAPI;
  export const Toaster: unknown;

  declare const sonner: {
    toast: ToastAPI;
    Toaster: unknown;
  };
  export default sonner;
}
