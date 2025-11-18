import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { cn } from '../utils';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: ModalSize;
  className?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  footer?: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  footer,
  headerClassName,
  contentClassName,
  footerClassName,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const trapRef = useFocusTrap(isOpen);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnBackdropClick) {
      onClose();
    }
  };

  return (
    <div
      ref={trapRef as React.RefObject<HTMLDivElement>}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={children ? 'modal-description' : undefined}
    >
      <div
        ref={modalRef}
        className={cn(
          'w-full bg-background rounded-lg shadow-xl animate-in zoom-in-95 duration-200',
          sizeClasses[size],
          className
        )}
        tabIndex={-1}
        role="document"
      >
        <Card className="border-0 shadow-none">
          {(title || showCloseButton) && (
            <CardHeader
              className={cn(
                'flex flex-row items-center justify-between space-y-0 pb-4',
                headerClassName
              )}
            >
              {title && (
                <CardTitle id="modal-title" className="text-lg font-semibold">
                  {title}
                </CardTitle>
              )}
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-muted"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
          )}

          <CardContent className={cn('pt-0', contentClassName)} id="modal-description">
            {children}
          </CardContent>

          {footer && (
            <div
              className={cn('flex justify-end space-x-2 pt-4 border-t px-6 pb-6', footerClassName)}
            >
              {footer}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Specialized modal components
export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertModalProps extends Omit<ModalProps, 'children'> {
  type: AlertType;
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const alertIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const alertColors: Record<AlertType, React.CSSProperties> = {
  success: { color: 'rgb(var(--color-pain-none))' },
  error: { color: 'rgb(var(--color-pain-extreme))' },
  warning: { color: 'rgb(var(--color-pain-moderate))' },
  info: { color: 'rgb(var(--color-chart-series-1))' },
};

export function AlertModal({
  type,
  message,
  description,
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  ...props
}: AlertModalProps) {
  const Icon = alertIcons[type];
  const colorClass = alertColors[type];

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <Modal
      {...props}
      onClose={onCancel ? handleCancel : onClose}
      footer={
        <div className="flex space-x-2">
          {onCancel && (
            <Button variant="outline" onClick={handleCancel}>
              {cancelText}
            </Button>
          )}
          <Button onClick={handleConfirm}>{confirmText}</Button>
        </div>
      }
    >
      <div className="flex items-start space-x-4">
        <div className={cn('flex-shrink-0 mt-0.5')} style={colorClass}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-foreground mb-2">{message}</h3>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      </div>
    </Modal>
  );
}

export interface ConfirmModalProps extends Omit<ModalProps, 'children'> {
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: 'default' | 'destructive';
}

export function ConfirmModal({
  message,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  variant = 'default',
  ...props
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <Modal
      {...props}
      onClose={handleCancel}
      footer={
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="text-center">
        <h3 className="text-lg font-medium text-foreground mb-2">{message}</h3>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
    </Modal>
  );
}
