import React from 'react';
import { Input } from '../../../design-system/Input';
import { Alert } from '../../../design-system/Alert';
import { Button } from '../../../design-system/Button';
import { Card, CardContent } from '../../../design-system';

interface Treatment {
  type: string;
  provider: string;
  date: string;
  effectiveness: string;
}

interface TreatmentsSectionProps {
  recent: Treatment[];
  effectiveness: string;
  planned: string[];
  onChange: (
    data: Partial<{
      recent: Treatment[];
      effectiveness: string;
      planned: string[];
    }>
  ) => void;
}

export function TreatmentsSection({
  recent,
  effectiveness,
  planned,
  onChange,
}: TreatmentsSectionProps) {
  const handleTreatmentChange = (index: number, field: keyof Treatment, value: string) => {
    const updatedTreatments = [...recent];
    updatedTreatments[index] = {
      ...updatedTreatments[index],
      [field]: value,
    };
    onChange({ recent: updatedTreatments });
  };

  const addTreatment = () => {
    onChange({
      recent: [...recent, { type: '', provider: '', date: '', effectiveness: '' }],
    });
  };

  const removeTreatment = (index: number) => {
    onChange({
      recent: recent.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6" role="group" aria-labelledby="treatments-title">
      <div className="flex items-center space-x-3">
        <span className="text-2xl" role="img" aria-label="treatments">
          🏥
        </span>
        <h3 id="treatments-title" className="text-xl font-semibold text-foreground">
          Treatments
        </h3>
      </div>

      <div className="space-y-4">
        {recent.map((treatment, index) => (
          <Card key={index} variant="outlined" className="p-4">
            <CardContent className="p-0">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-foreground">Treatment #{index + 1}</h4>
                <Button
                  onClick={() => removeTreatment(index)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/80"
                  aria-label={`Remove treatment ${index + 1}`}
                >
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Type"
                  value={treatment.type}
                  onChange={e => handleTreatmentChange(index, 'type', e.target.value)}
                  placeholder="e.g., Physical Therapy, Massage"
                />

                <Input
                  label="Provider"
                  value={treatment.provider}
                  onChange={e => handleTreatmentChange(index, 'provider', e.target.value)}
                  placeholder="Healthcare provider name"
                />

                <div className="space-y-1">
                  <label
                    htmlFor={`treatment-date-${index}`}
                    className="block text-sm font-medium text-foreground"
                  >
                    Date
                  </label>
                  <input
                    id={`treatment-date-${index}`}
                    type="date"
                    value={treatment.date}
                    onChange={e => handleTreatmentChange(index, 'date', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label={`Date of treatment ${index + 1}`}
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor={`treatment-effectiveness-${index}`}
                    className="block text-sm font-medium text-foreground"
                  >
                    Effectiveness
                  </label>
                  <select
                    id={`treatment-effectiveness-${index}`}
                    value={treatment.effectiveness}
                    onChange={e => handleTreatmentChange(index, 'effectiveness', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label={`Effectiveness of treatment ${index + 1}`}
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
          onClick={addTreatment}
          variant="default"
          className="w-full py-3 border-2 border-dashed border-border rounded-md text-muted-foreground hover:border-primary hover:text-primary"
          leftIcon={<span className="text-lg">+</span>}
        >
          Add Treatment
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="overall-treatment-effectiveness"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Overall Treatment Effectiveness
          </label>
          <select
            id="overall-treatment-effectiveness"
            value={effectiveness}
            onChange={e => onChange({ effectiveness: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-describedby="overall-treatment-effectiveness-hint"
          >
            <option value="">Select overall effectiveness</option>
            <option value="Very Effective">Very Effective</option>
            <option value="Somewhat Effective">Somewhat Effective</option>
            <option value="Not Effective">Not Effective</option>
            <option value="Mixed Results">Mixed Results</option>
          </select>
          <p
            id="overall-treatment-effectiveness-hint"
            className="text-xs text-muted-foreground mt-1"
          >
            How effective have your treatments been overall?
          </p>
        </div>

        <div>
          <label
            htmlFor="planned-treatments"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Planned Treatments
          </label>
          <textarea
            id="planned-treatments"
            value={planned.join('\n')}
            onChange={e => onChange({ planned: e.target.value.split('\n').filter(Boolean) })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[80px] resize-vertical"
            rows={3}
            placeholder="Enter each planned treatment on a new line"
            aria-describedby="planned-treatments-hint"
          />
          <p id="planned-treatments-hint" className="text-xs text-muted-foreground mt-1">
            List upcoming treatments or appointments, one per line
          </p>
        </div>
      </div>

      {recent.length === 0 && (
        <Alert tone="info">
          No treatments recorded yet. Add your recent treatments above to track their effectiveness.
        </Alert>
      )}
    </div>
  );
}
