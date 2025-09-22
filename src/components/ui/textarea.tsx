import React from 'react';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea: React.FC<TextareaProps> = ({ className = '', ...props }) => (
  <textarea
    className={`block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`}
    {...props}
  />
);

export default Textarea;
