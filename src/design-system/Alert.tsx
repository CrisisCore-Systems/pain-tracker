import React from 'react';

type Tone = 'success' | 'error' | 'info' | 'warning';

interface Props {
  tone?: Tone;
  children: React.ReactNode;
}

// Map tones to runtime CSS styles using tokens defined in src/index.css
const toneStyles: Record<Tone, React.CSSProperties> = {
  success: { backgroundColor: 'rgb(var(--color-pain-none))', borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-foreground))' },
  error: { backgroundColor: 'rgb(var(--color-pain-extreme))', borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-primary-foreground))' },
  info: { backgroundColor: 'rgb(var(--color-chart-series-1) / 0.12)', borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-foreground))' },
  warning: { backgroundColor: 'rgb(var(--color-pain-moderate))', borderColor: 'rgb(var(--color-border))', color: 'rgb(var(--color-foreground))' },
};

export const Alert: React.FC<Props> = ({ tone = 'info', children }) => {
  const style = toneStyles[tone];
  return (
    <div role="status" aria-live="polite" className={`p-3 rounded-md border text-sm`} style={style}>
      {children}
    </div>
  );
};

export default Alert;
