import React from 'react';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export const Progress: React.FC<ProgressProps> = ({ value = 0, className = '', ...props }) => {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full h-2 bg-gray-200 rounded ${className}`} {...props}>
      <div className="h-2 bg-blue-600 rounded" style={{ width: `${pct}%` }} />
    </div>
  );
};

export default Progress;
