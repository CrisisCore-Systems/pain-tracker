import React from 'react';

type Tone = 'success' | 'error' | 'info' | 'warning';

interface Props {
  tone?: Tone;
  children: React.ReactNode;
}

const toneClasses: Record<Tone, string> = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error: 'bg-red-50 border-red-400 text-red-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
};

export const Alert: React.FC<Props> = ({ tone = 'info', children }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`p-3 rounded-md border ${toneClasses[tone]} text-sm`}
    >
      {children}
    </div>
  );
};

export default Alert;
