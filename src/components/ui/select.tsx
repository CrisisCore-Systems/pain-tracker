import React from 'react';

export interface SelectRootProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectRootProps> = ({ children }) => {
  return <div data-select-root>{children}</div>;
};

export interface SelectTriggerProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({
  value,
  onValueChange,
  children,
  className = '',
  ...props
}) => {
  return (
    <select
      className={`mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`}
      value={value}
      onChange={e => onValueChange?.(e.target.value)}
      {...props}
    >
      {children}
    </select>
  );
};

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

export interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  value: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children, ...props }) => (
  <option value={value} {...props}>
    {children}
  </option>
);

export const SelectValue: React.FC<{ placeholder?: string; value?: string }> = ({
  placeholder,
  value,
}) => <span data-select-value>{value ?? placeholder ?? ''}</span>;

export default Select;
