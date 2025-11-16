import React from 'react';

interface Props {
  width?: string | number;
  height?: string | number;
  className?: string;
  srLabel?: string;
}

export const Skeleton: React.FC<Props> = ({ width = '100%', height = 16, className = '', srLabel }) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} style={style} role="status" aria-label={srLabel || 'loading'} />
  );
};

export default Skeleton;
