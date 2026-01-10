import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system/components/Card';
import { PlannedFeatureNotice } from './PlannedFeatureNotice';
import { RoadmapKey } from '../../constants/roadmapLinks';
import { cn } from '../../design-system/utils';

interface FeaturePlaceholderPageProps {
  title: string;
  feature: RoadmapKey;
  className?: string; // Allow positioning overrides
}

export const FeaturePlaceholderPage: React.FC<FeaturePlaceholderPageProps> = ({
  title,
  feature,
  className,
}) => {
  return (
    <div className={cn("p-6 flex flex-col items-center justify-center min-h-[400px]", className)}>
        <Card className="w-full max-w-lg shadow-md transition-all">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                    {title}
                    <span className="ml-2 inline-block px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full dark:bg-amber-900/30 dark:text-amber-300">
                      Coming Soon
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pt-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg w-full border border-slate-100 dark:border-slate-800">
                     <PlannedFeatureNotice feature={feature} align="center" />
                </div>
            </CardContent>
        </Card>
    </div>
  );
};
