import { Plus } from "lucide-react";
import type { PainEntry } from "../../types";
import { PainEntryForm } from "../pain-tracker/PainEntryForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../design-system";

interface PainEntryWidgetProps {
  onSubmit: (entry: Omit<PainEntry, "id" | "timestamp">) => void;
}

export function PainEntryWidget({ onSubmit }: PainEntryWidgetProps) {
  return (
    <Card className="xl:col-span-1" data-walkthrough="pain-entry-form">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Record Pain Entry</span>
        </CardTitle>
        <CardDescription>
          Track your pain levels, symptoms, and daily impact
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PainEntryForm onSubmit={onSubmit} />
      </CardContent>
    </Card>
  );
}