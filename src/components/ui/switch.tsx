import React from 'react';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked = false,
  onCheckedChange,
  className = '',
  ...rest
}) => (
  <input
    type="checkbox"
    role="switch"
    className={className}
    checked={checked}
    onChange={e => onCheckedChange?.(e.target.checked)}
    {...rest}
  />
);

export default Switch;
