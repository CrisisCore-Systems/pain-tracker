import React from 'react';
import { roadmapLinks, type RoadmapKey } from '../../constants/roadmapLinks';
import { cn } from '../../design-system/utils';

interface PlannedFeatureNoticeProps {
  feature: RoadmapKey;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const PlannedFeatureNotice: React.FC<PlannedFeatureNoticeProps> = ({
  feature,
  align = 'center',
  className,
}) => {
  const roadmap = roadmapLinks[feature];

  if (!roadmap) {
    return null;
  }

  const alignmentClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <p className={cn('text-sm text-gray-500 dark:text-gray-400', alignmentClass, className)}>
      {roadmap.summary} Follow the{' '}
      <a
        href={roadmap.href}
        className="text-primary hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {roadmap.label}
      </a>
      {roadmap.issueUrl && (
        <>
          {' '}
          or{' '}
          <a
            href={roadmap.issueUrl}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {roadmap.issueLabel ?? 'explore open issues'}
          </a>
        </>
      )}
      .
    </p>
  );
};

export default PlannedFeatureNotice;
