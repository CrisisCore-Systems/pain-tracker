import { PlayCircle, Database } from 'lucide-react';
import { EmptyState, TrackingIllustration } from '../empty-state';
import { Card, CardContent } from '../../design-system';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';
import { useAdaptiveCopy } from '../../contexts/useTone';
import { emptyStates } from '../../content/microcopy';

interface EmptyStatePanelProps {
  onStartWalkthrough: () => void;
}

export function EmptyStatePanel({ onStartWalkthrough }: EmptyStatePanelProps) {
  const { loadSampleData, loadChronicPainTestData } = usePainTrackerStore();

  // Adaptive tone copy
  const noLogsHeadline = useAdaptiveCopy(emptyStates.noLogs.headline);
  const noLogsSubtext = useAdaptiveCopy(emptyStates.noLogs.subtext);
  const noLogsCTA = useAdaptiveCopy(emptyStates.noLogs.cta);
  const secondaryCTA = useAdaptiveCopy(emptyStates.noLogs.secondaryCta);

  const handleLoadSampleData = () => {
    loadSampleData();
  };

  const handleLoadChronicPainData = () => {
    loadChronicPainTestData();
  };

  return (
    <Card>
      <CardContent className="pt-8 pb-8">
        <EmptyState
          title={noLogsHeadline}
          description={noLogsSubtext}
          primaryAction={{
            label: noLogsCTA,
            onClick: onStartWalkthrough,
            icon: <PlayCircle className="h-4 w-4" />,
          }}
          secondaryAction={{
            label: secondaryCTA,
            onClick: handleLoadSampleData,
          }}
          illustration={<TrackingIllustration />}
        />
        {/* Dev/Testing option for 12-month chronic pain data */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLoadChronicPainData}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <Database className="h-4 w-4" />
            Load 12-month chronic pain test data (~400 entries)
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
