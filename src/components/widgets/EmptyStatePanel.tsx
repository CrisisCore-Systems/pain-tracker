import { PlayCircle, Database } from 'lucide-react';
import { EmptyState, TrackingIllustration } from '../empty-state';
import { Button, Card, CardContent } from '../../design-system';
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
    <Card variant="gradient" hover="lift" padding="none" className="relative overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <EmptyState
          title={noLogsHeadline}
          description={noLogsSubtext}
          className="py-10 sm:py-12 px-0"
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
        <div className="mt-6 pt-6 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLoadChronicPainData}
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            leftIcon={<Database className="h-4 w-4" />}
          >
            Load 12-month chronic pain test data (~400 entries)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
