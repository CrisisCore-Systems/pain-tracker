import React from 'react';

export interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked = false, onCheckedChange, className = '' }) => (
  <input
    type="checkbox"
    role="switch"
    className={className}
    checked={checked}
    onChange={(e) => onCheckedChange?.(e.target.checked)}
  />
);

export default Switch;
