import React from 'react';
import { Input } from '../../../design-system/Input';
import { Alert } from '../../../design-system/Alert';
import { Button } from '../../../design-system/Button';
import { Card, CardContent } from '../../../design-system';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  effectiveness: string;
}

interface MedicationsSectionProps {
  current: Medication[];
  changes: string;
  effectiveness: string;
  onChange: (data: Partial<{
    current: Medication[];
    changes: string;
    effectiveness: string;
  }>) => void;
}

export function MedicationsSection({
  current,
  changes,
  effectiveness,
  onChange
}: MedicationsSectionProps) {
  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const updatedMedications = [...current];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    onChange({ current: updatedMedications });
  };

  const addMedication = () => {
    onChange({
      current: [
        ...current,
        { name: "", dosage: "", frequency: "", effectiveness: "" }
      ]
    });
  };

  const removeMedication = (index: number) => {
    onChange({
      current: current.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6" role="group" aria-labelledby="medications-title">
      <div className="flex items-center space-x-3">
        <span className="text-2xl" role="img" aria-label="medications">💊</span>
        <h3 id="medications-title" className="text-xl font-semibold text-foreground">
          Medications
        </h3>
      </div>

      <div className="space-y-4">
        {current.map((medication, index) => (
          <Card key={index} variant="outlined" className="p-4">
            <CardContent className="p-0">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-foreground">Medication #{index + 1}</h4>
                <Button
                  onClick={() => removeMedication(index)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/80"
                  aria-label={`Remove medication ${index + 1}`}
                >
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={medication.name}
                  onChange={(e) => handleMedicationChange(index, "name", e.target.value)}
                  placeholder="e.g., Ibuprofen"
                />

                <Input
                  label="Dosage"
                  value={medication.dosage}
                  onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)}
                  placeholder="e.g., 200mg"
                />

                <Input
                  label="Frequency"
                  value={medication.frequency}
                  onChange={(e) => handleMedicationChange(index, "frequency", e.target.value)}
                  placeholder="e.g., Twice daily"
                />

                <div className="space-y-1">
                  <label htmlFor={`effectiveness-${index}`} className="block text-sm font-medium text-foreground">
                    Effectiveness
                  </label>
                  <select
                    id={`effectiveness-${index}`}
                    value={medication.effectiveness}
                    onChange={(e) => handleMedicationChange(index, "effectiveness", e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label={`Effectiveness of medication ${index + 1}`}
                  >
                    <option value="">Select effectiveness</option>
                    <option value="Very Effective">Very Effective</option>
                    <option value="Somewhat Effective">Somewhat Effective</option>
                    <option value="Not Effective">Not Effective</option>
                    <option value="Made Things Worse">Made Things Worse</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          onClick={addMedication}
          variant="outline"
          className="w-full py-3 border-2 border-dashed border-border rounded-md text-muted-foreground hover:border-primary hover:text-primary"
          leftIcon={<span className="text-lg">+</span>}
        >
          Add Medication
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="medication-changes" className="block text-sm font-medium text-foreground mb-2">
            Recent Changes in Medications
          </label>
          <textarea
            id="medication-changes"
            value={changes}
            onChange={(e) => onChange({ changes: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[80px] resize-vertical"
            rows={3}
            placeholder="Describe any recent changes to your medication regimen..."
            aria-describedby="medication-changes-hint"
          />
          <p id="medication-changes-hint" className="text-xs text-muted-foreground mt-1">
            Optional: Note any changes, side effects, or adjustments
          </p>
        </div>

        <div>
          <label htmlFor="overall-effectiveness" className="block text-sm font-medium text-foreground mb-2">
            Overall Medication Effectiveness
          </label>
          <select
            id="overall-effectiveness"
            value={effectiveness}
            onChange={(e) => onChange({ effectiveness: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-describedby="overall-effectiveness-hint"
          >
            <option value="">Select overall effectiveness</option>
            <option value="Very Effective">Very Effective</option>
            <option value="Somewhat Effective">Somewhat Effective</option>
            <option value="Not Effective">Not Effective</option>
            <option value="Mixed Results">Mixed Results</option>
          </select>
          <p id="overall-effectiveness-hint" className="text-xs text-muted-foreground mt-1">
            How effective has your current medication regimen been overall?
          </p>
        </div>
      </div>

      {current.length === 0 && (
        <Alert tone="info">
          No medications recorded yet. Add your current medications above to track their effectiveness.
        </Alert>
      )}
    </div>
  );
}
