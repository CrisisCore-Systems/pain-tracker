/**
 * Enhanced Input Component
 * Modern input component with consistent styling and improved accessibility
 */

import React from 'react';
import { cn } from '../utils';
import { Eye, EyeOff } from 'lucide-react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    label,
    error,
    helperText,
    startIcon,
    endIcon,
    fullWidth = false,
    variant = 'default',
    id,
    required,
    disabled,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [inputId] = React.useState(id || `input-${Math.random().toString(36).substr(2, 9)}`);
    const [inputType, setInputType] = React.useState(type);

    React.useEffect(() => {
      if (type === 'password' && showPassword) {
        setInputType('text');
      } else {
        setInputType(type);
      }
    }, [type, showPassword]);

    const handleTogglePassword = () => {
      setShowPassword(!showPassword);
    };

    const baseInputClasses = cn(
      'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
      variant === 'filled' && 'bg-muted/50 border-muted',
      variant === 'outlined' && 'border-2',
      error && 'border-destructive focus-visible:ring-destructive',
      startIcon && 'pl-10',
      (endIcon || type === 'password') && 'pr-10',
      fullWidth && 'w-full'
    );

    return (
      <div className={cn('space-y-1', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              error && 'text-destructive'
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
          </label>
        )}

        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {startIcon}
            </div>
          )}

          <input
            id={inputId}
            type={inputType}
            className={cn(baseInputClasses, className)}
            ref={ref}
            disabled={disabled}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` :
              helperText ? `${inputId}-helper` :
              undefined
            }
            {...props}
          />

          {type === 'password' && (
            <button
              type="button"
              onClick={handleTogglePassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}

          {endIcon && type !== 'password' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {endIcon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };