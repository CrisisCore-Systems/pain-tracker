import { PlayCircle } from "lucide-react";
import { EmptyState, TrackingIllustration } from "../empty-state";
import { Card, CardContent } from "../../design-system";
import { usePainTrackerStore } from "../../stores/pain-tracker-store";

interface EmptyStatePanelProps {
  onStartWalkthrough: () => void;
}

export function EmptyStatePanel({ onStartWalkthrough }: EmptyStatePanelProps) {
  const { loadSampleData } = usePainTrackerStore();

  const handleLoadSampleData = () => {
    loadSampleData();
  };

  return (
    <Card>
      <CardContent className="pt-8 pb-8">
        <EmptyState
          title="Start Your Pain Tracking Journey"
          description="Begin by recording your first pain entry above. Track symptoms, triggers, and treatments to gain valuable insights into your pain patterns and improve your quality of life."
          primaryAction={{
            label: "Take Interactive Tour",
            onClick: onStartWalkthrough,
            icon: <PlayCircle className="h-4 w-4" />
          }}
          secondaryAction={{
            label: "View Sample Data",
            onClick: handleLoadSampleData
          }}
          illustration={<TrackingIllustration />}
        />
      </CardContent>
    </Card>
  );
}