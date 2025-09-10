import type { PainEntry } from "../../types";
import { PainChart } from "../pain-tracker/PainChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../design-system";

interface PainVisualizationPanelProps {
  entries: Pick<PainEntry, "timestamp" | "baselineData">[];
}

export function PainVisualizationPanel({ entries }: PainVisualizationPanelProps) {
  return (
    <Card className="xl:col-span-1" data-walkthrough="pain-chart">
      <CardHeader>
        <CardTitle>Pain History Chart</CardTitle>
        <CardDescription>
          Visual representation of your pain patterns over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PainChart entries={entries} />
      </CardContent>
    </Card>
  );
}