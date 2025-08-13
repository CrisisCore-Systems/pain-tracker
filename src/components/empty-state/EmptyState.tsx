/**
 * EmptyState - Enhanced empty state component with illustrations and clear CTAs
 */

import { ReactNode } from 'react';
import { Button } from '../../design-system';
import { NoDataIllustration } from './NoDataIllustration';

interface EmptyStateProps {
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  primaryAction,
  secondaryAction,
  illustration,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      <div className="max-w-md mx-auto">
        {/* Illustration */}
        <div className="mb-8">
          {illustration || <NoDataIllustration />}
        </div>

        {/* Content */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-3">
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {primaryAction && (
              <Button
                onClick={primaryAction.onClick}
                className="flex items-center space-x-2"
              >
                {primaryAction.icon}
                <span>{primaryAction.label}</span>
              </Button>
            )}
            
            {secondaryAction && (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}