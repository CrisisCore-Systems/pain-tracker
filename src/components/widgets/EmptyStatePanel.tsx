import { PlayCircle } from "lucide-react";
import { EmptyState, TrackingIllustration } from "../empty-state";
import { Card, CardContent } from "../../design-system";
import { usePainTrackerStore } from "../../stores/pain-tracker-store";
import { useAdaptiveCopy } from "../../contexts/useTone";
import { emptyStates } from "../../content/microcopy";

interface EmptyStatePanelProps {
  onStartWalkthrough: () => void;
}

export function EmptyStatePanel({ onStartWalkthrough }: EmptyStatePanelProps) {
  const { loadSampleData } = usePainTrackerStore();
  
  // Adaptive tone copy
  const noLogsHeadline = useAdaptiveCopy(emptyStates.noLogs.headline);
  const noLogsSubtext = useAdaptiveCopy(emptyStates.noLogs.subtext);
  const noLogsCTA = useAdaptiveCopy(emptyStates.noLogs.cta);
  const secondaryCTA = useAdaptiveCopy(emptyStates.noLogs.secondaryCta);

  const handleLoadSampleData = () => {
    loadSampleData();
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
            icon: <PlayCircle className="h-4 w-4" />
          }}
          secondaryAction={{
            label: secondaryCTA,
            onClick: handleLoadSampleData
          }}
          illustration={<TrackingIllustration />}
        />
      </CardContent>
    </Card>
  );
}