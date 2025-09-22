import React from 'react';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label: React.FC<LabelProps> = ({ className = '', ...props }) => (
  <label className={`text-sm font-medium ${className}`} {...props} />
);

export default Label;
