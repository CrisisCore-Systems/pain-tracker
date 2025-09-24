import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
}

export const Input: React.FC<Props> = ({ label, error, hint, id, className = '', ...rest }) => {
  const inputId = id || `input-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-900">
        {label}
      </label>
      <input
        id={inputId}
        {...(error ? { 'aria-invalid': true } : {})}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-2 focus:ring-offset-1 focus-visible:ring-blue-500 ${error ? 'border-red-500' : ''}`}
        {...rest}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
