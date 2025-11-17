import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
}

export const Input: React.FC<Props> = ({ label, error, hint, id, className = '', ...rest }) => {
  const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const baseStyle: React.CSSProperties = {
    borderColor: 'rgb(var(--color-input))',
    boxShadow: 'none',
  };

  const focusStyle: React.CSSProperties = {
    outline: 'none',
    boxShadow: `0 0 0 3px rgba(var(--color-ring), 0.18)`,
    borderColor: 'rgb(var(--color-ring))',
  };

  const errorStyle: React.CSSProperties = error
    ? { borderColor: 'rgb(var(--color-destructive))' }
    : {};

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium"
        style={{ color: 'rgb(var(--color-foreground))' }}
      >
        {label}
      </label>
      <input
        id={inputId}
        {...(error ? { 'aria-invalid': true } : {})}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={`mt-1 block w-full rounded-md shadow-sm`}
        style={{ ...(baseStyle as any), ...(errorStyle as any) }}
        onFocus={e => Object.assign((e.target as HTMLInputElement).style, focusStyle)}
        onBlur={e => Object.assign((e.target as HTMLInputElement).style, baseStyle, errorStyle)}
        {...rest}
      />
      {hint && !error && (
        <p
          id={`${inputId}-hint`}
          style={{ color: 'rgb(var(--color-muted-foreground))' }}
          className="text-xs"
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${inputId}-error`}
          className="text-xs"
          role="alert"
          style={{ color: 'rgb(var(--color-destructive))' }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
