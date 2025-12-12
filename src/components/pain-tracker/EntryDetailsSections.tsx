import React from 'react';
import {
  Accessibility,
  Briefcase,
  Stethoscope,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Heart,
  Activity,
  Flame,
  Dumbbell,
} from 'lucide-react';
import { Badge } from '../../design-system';
import { cn } from '../../design-system/utils';
import type { PainEntry } from '../../types';

interface SectionProps {
  className?: string;
}

/**
 * Displays functional impact data (limited activities, assistance needed, mobility aids)
 */
export function FunctionalImpactSection({
  functionalImpact,
  className,
}: {
  functionalImpact: PainEntry['functionalImpact'];
} & SectionProps) {
  if (!functionalImpact) return null;

  const hasContent =
    (functionalImpact.limitedActivities?.length ?? 0) > 0 ||
    (functionalImpact.assistanceNeeded?.length ?? 0) > 0 ||
    (functionalImpact.mobilityAids?.length ?? 0) > 0;

  if (!hasContent) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Accessibility className="h-4 w-4 text-purple-500" />
        <span>Functional Impact</span>
      </div>
      <div className="ml-6 space-y-1.5 text-sm">
        {(functionalImpact.limitedActivities?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-gray-500 dark:text-gray-400">Limited activities:</span>
            {functionalImpact.limitedActivities?.map((activity, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs rounded-full border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
              >
                {activity}
              </Badge>
            ))}
          </div>
        )}
        {(functionalImpact.assistanceNeeded?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-gray-500 dark:text-gray-400">Assistance needed:</span>
            {functionalImpact.assistanceNeeded?.map((item, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs rounded-full border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300"
              >
                <Users className="h-3 w-3 mr-1" />
                {item}
              </Badge>
            ))}
          </div>
        )}
        {(functionalImpact.mobilityAids?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-gray-500 dark:text-gray-400">Mobility aids:</span>
            {functionalImpact.mobilityAids?.map((aid, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs rounded-full border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300"
              >
                {aid}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Displays work impact data (missed work days, modified duties, limitations)
 */
export function WorkImpactSection({
  workImpact,
  className,
}: {
  workImpact: PainEntry['workImpact'];
} & SectionProps) {
  if (!workImpact) return null;

  const hasContent =
    workImpact.missedWork > 0 ||
    (workImpact.modifiedDuties?.length ?? 0) > 0 ||
    (workImpact.workLimitations?.length ?? 0) > 0;

  if (!hasContent) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Briefcase className="h-4 w-4 text-blue-500" />
        <span>Work Impact</span>
      </div>
      <div className="ml-6 space-y-1.5 text-sm">
        {workImpact.missedWork > 0 && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-red-500" />
            <span className="text-red-600 dark:text-red-400">
              {workImpact.missedWork} day{workImpact.missedWork !== 1 ? 's' : ''} missed
            </span>
          </div>
        )}
        {(workImpact.modifiedDuties?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-gray-500 dark:text-gray-400">Modified duties:</span>
            {workImpact.modifiedDuties?.map((duty, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs rounded-full border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
              >
                {duty}
              </Badge>
            ))}
          </div>
        )}
        {(workImpact.workLimitations?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-gray-500 dark:text-gray-400">Limitations:</span>
            {workImpact.workLimitations?.map((limitation, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs rounded-full border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
              >
                {limitation}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Displays treatment data (recent treatments, planned treatments, effectiveness notes)
 */
export function TreatmentsSection({
  treatments,
  className,
}: {
  treatments: PainEntry['treatments'];
} & SectionProps) {
  if (!treatments) return null;

  const hasContent =
    (treatments.recent?.length ?? 0) > 0 ||
    (treatments.planned?.length ?? 0) > 0 ||
    treatments.effectiveness;

  if (!hasContent) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Stethoscope className="h-4 w-4 text-green-500" />
        <span>Treatments</span>
      </div>
      <div className="ml-6 space-y-1.5 text-sm">
        {(treatments.recent?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-gray-500 dark:text-gray-400">Recent:</span>
            {treatments.recent?.map((treatment, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs rounded-full border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
              >
                {treatment.type}{treatment.provider ? ` (${treatment.provider})` : ''}
              </Badge>
            ))}
          </div>
        )}
        {(treatments.planned?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-gray-500 dark:text-gray-400">Planned:</span>
            {treatments.planned?.map((treatment, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs rounded-full border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300"
              >
                <Clock className="h-3 w-3 mr-1" />
                {treatment}
              </Badge>
            ))}
          </div>
        )}
        {treatments.effectiveness && (
          <div className="flex items-start gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5" />
            <span className="text-emerald-600 dark:text-emerald-400 italic">
              "{treatments.effectiveness}"
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Displays comparison/progression data (worsening since, new limitations)
 */
export function ComparisonSection({
  comparison,
  className,
}: {
  comparison: PainEntry['comparison'];
} & SectionProps) {
  if (!comparison) return null;

  const hasContent =
    comparison.worseningSince || (comparison.newLimitations?.length ?? 0) > 0;

  if (!hasContent) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <TrendingUp className="h-4 w-4 text-rose-500" />
        <span>Progression</span>
      </div>
      <div className="ml-6 space-y-1.5 text-sm">
        {comparison.worseningSince && (
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-rose-600 dark:text-rose-400">
              Worsening since: {comparison.worseningSince}
            </span>
          </div>
        )}
        {(comparison.newLimitations?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-gray-500 dark:text-gray-400">New limitations:</span>
            {comparison.newLimitations?.map((limitation, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs rounded-full border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300"
              >
                {limitation}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Displays social impact from quality of life data
 */
export function SocialImpactSection({
  qualityOfLife,
  className,
}: {
  qualityOfLife: PainEntry['qualityOfLife'];
} & SectionProps) {
  if (!qualityOfLife?.socialImpact || qualityOfLife.socialImpact.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Users className="h-4 w-4 text-indigo-500" />
        <span>Social Impact</span>
      </div>
      <div className="ml-6 text-sm space-y-1">
        {qualityOfLife.socialImpact.map((impact, i) => (
          <p key={i} className="text-indigo-600 dark:text-indigo-400">
            • {impact}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * Displays triggers that may have contributed to pain
 */
export function TriggersSection({
  triggers,
  className,
}: {
  triggers?: string[];
} & SectionProps) {
  if (!triggers || triggers.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Zap className="h-4 w-4 text-amber-500" />
        <span>Triggers</span>
      </div>
      <div className="ml-6 flex flex-wrap gap-1.5">
        {triggers.map((trigger, i) => (
          <Badge
            key={i}
            variant="outline"
            className="text-xs rounded-full border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300"
          >
            {trigger}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/**
 * Displays relief methods that helped with pain
 */
export function ReliefMethodsSection({
  reliefMethods,
  className,
}: {
  reliefMethods?: string[];
} & SectionProps) {
  if (!reliefMethods || reliefMethods.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Heart className="h-4 w-4 text-green-500" />
        <span>What Helped</span>
      </div>
      <div className="ml-6 flex flex-wrap gap-1.5">
        {reliefMethods.map((method, i) => (
          <Badge
            key={i}
            variant="outline"
            className="text-xs rounded-full border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
          >
            {method}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/**
 * Displays activity level and stress level
 */
export function ActivityStressSection({
  activityLevel,
  stress,
  className,
}: {
  activityLevel?: number;
  stress?: number;
} & SectionProps) {
  if (activityLevel === undefined && stress === undefined) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Activity className="h-4 w-4 text-blue-500" />
        <span>Daily Levels</span>
      </div>
      <div className="ml-6 flex flex-wrap gap-3 text-sm">
        {activityLevel !== undefined && (
          <span className="text-blue-600 dark:text-blue-400">
            Activity: {activityLevel}/10
          </span>
        )}
        {stress !== undefined && (
          <span className="text-rose-600 dark:text-rose-400">
            Stress: {stress}/10
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Displays pain quality descriptors (sharp, dull, burning, etc.)
 */
export function PainQualitySection({
  quality,
  className,
}: {
  quality?: string[];
} & SectionProps) {
  if (!quality || quality.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Flame className="h-4 w-4 text-orange-500" />
        <span>Pain Type</span>
      </div>
      <div className="ml-6 flex flex-wrap gap-1.5">
        {quality.map((q, i) => (
          <Badge
            key={i}
            variant="outline"
            className="text-xs rounded-full border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300"
          >
            {q}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/**
 * Displays physical activities performed
 */
export function PhysicalActivitiesSection({
  activities,
  className,
}: {
  activities?: string[];
} & SectionProps) {
  if (!activities || activities.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Dumbbell className="h-4 w-4 text-purple-500" />
        <span>Activities Today</span>
      </div>
      <div className="ml-6 flex flex-wrap gap-1.5">
        {activities.map((activity, i) => (
          <Badge
            key={i}
            variant="outline"
            className="text-xs rounded-full border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
          >
            {activity}
          </Badge>
        ))}
      </div>
    </div>
  );
}

/**
 * Combined component that displays all extended entry details
 */
export function ExtendedEntryDetails({
  entry,
  className,
  compact = false,
}: {
  entry: Pick<PainEntry, 'functionalImpact' | 'workImpact' | 'treatments' | 'comparison' | 'qualityOfLife' | 'triggers' | 'reliefMethods' | 'activityLevel' | 'stress' | 'quality' | 'activities'>;
  compact?: boolean;
} & SectionProps) {
  const spacing = compact ? 'space-y-2' : 'space-y-4';

  return (
    <div className={cn(spacing, className)}>
      <FunctionalImpactSection functionalImpact={entry.functionalImpact} />
      <WorkImpactSection workImpact={entry.workImpact} />
      <TreatmentsSection treatments={entry.treatments} />
      <ComparisonSection comparison={entry.comparison} />
      <SocialImpactSection qualityOfLife={entry.qualityOfLife} />
      <PainQualitySection quality={entry.quality} />
      <PhysicalActivitiesSection activities={entry.activities} />
      <TriggersSection triggers={entry.triggers} />
      <ReliefMethodsSection reliefMethods={entry.reliefMethods} />
      <ActivityStressSection activityLevel={entry.activityLevel} stress={entry.stress} />
    </div>
  );
}

export default ExtendedEntryDetails;
