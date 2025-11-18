/**
 * Skeleton Loading Components with Shimmer Animation
 * Provides placeholder UI elements during loading states
 */

import React from 'react';
import { cn } from '../utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  animation?: 'pulse' | 'shimmer' | 'none';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'text',
  animation = 'shimmer',
  width,
  height,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'animate-shimmer',
    none: '',
  };

  const style: React.CSSProperties = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height }),
  };

  return (
    <div
      className={cn('bg-muted/50', variantClasses[variant], animationClasses[animation], className)}
      style={style}
      {...props}
    />
  );
}

// Card Skeleton for dashboard widgets
export function SkeletonCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="text" width="60%" height={32} />
        </div>
        <Skeleton variant="circular" width={48} height={48} />
      </div>
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="90%" />
    </div>
  );
}

// Metric Card Skeleton
export function SkeletonMetricCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" width={100} height={14} />
          <Skeleton variant="text" width={80} height={28} />
          <Skeleton variant="text" width={120} height={12} />
        </div>
        <Skeleton variant="circular" width={56} height={56} />
      </div>
    </div>
  );
}

// Chart Skeleton
export function SkeletonChart({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)} {...props}>
      <div className="flex items-center space-x-2">
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width={150} height={20} />
      </div>
      <div className="space-y-2">
        <Skeleton variant="rectangular" width="100%" height={200} />
        <div className="flex justify-between">
          <Skeleton variant="text" width={60} height={12} />
          <Skeleton variant="text" width={60} height={12} />
          <Skeleton variant="text" width={60} height={12} />
          <Skeleton variant="text" width={60} height={12} />
        </div>
      </div>
    </div>
  );
}

// Table/List Skeleton
export function SkeletonTable({
  rows = 5,
  className,
  ...props
}: { rows?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)} {...props}>
      <div className="flex items-center space-x-2 mb-4">
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width={150} height={20} />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg">
            <Skeleton variant="circular" width={40} height={40} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="60%" height={16} />
              <Skeleton variant="text" width="40%" height={12} />
            </div>
            <Skeleton variant="text" width={80} height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Form Skeleton
export function SkeletonForm({
  fields = 4,
  className,
  ...props
}: { fields?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-6', className)} {...props}>
      <Skeleton variant="text" width={200} height={24} />
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton variant="text" width={120} height={14} />
            <Skeleton variant="rounded" width="100%" height={40} />
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-2">
        <Skeleton variant="rounded" width={100} height={40} />
        <Skeleton variant="rounded" width={100} height={40} />
      </div>
    </div>
  );
}

// Dashboard Overview Skeleton
export function SkeletonDashboardOverview({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
        <SkeletonMetricCard />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      {/* Recent Activity */}
      <SkeletonTable rows={5} />
    </div>
  );
}

// Avatar Skeleton
export function SkeletonAvatar({
  size = 40,
  className,
  ...props
}: { size?: number } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Skeleton variant="circular" width={size} height={size} className={className} {...props} />
  );
}

// Button Skeleton
export function SkeletonButton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <Skeleton variant="rounded" width={100} height={40} className={className} {...props} />;
}

// Text Line Skeleton
export function SkeletonText({
  lines = 1,
  className,
  ...props
}: {
  lines?: number;
} & React.HTMLAttributes<HTMLDivElement>) {
  if (lines === 1) {
    return <Skeleton variant="text" className={className} {...props} />;
  }

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i === lines - 1 ? '60%' : '100%'} />
      ))}
    </div>
  );
}
