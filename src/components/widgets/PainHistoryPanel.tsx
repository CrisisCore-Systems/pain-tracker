import type { PainEntry } from '../../types';
import { PainHistory } from '../pain-tracker/PainHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../design-system';

interface PainHistoryPanelProps {
  entries: PainEntry[];
}

export function PainHistoryPanel({ entries }: PainHistoryPanelProps) {
  return (
    <Card data-walkthrough="pain-history">
      <CardHeader>
        <CardTitle>Pain History</CardTitle>
        <CardDescription>Detailed view of all your pain entries and patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <PainHistory entries={entries} />
      </CardContent>
    </Card>
  );
}
