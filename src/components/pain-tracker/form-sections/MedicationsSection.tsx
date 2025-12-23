import React, { useMemo, useState } from 'react';
import { Input } from '../../../design-system/Input';
import { Alert } from '../../../design-system/Alert';
import { Button } from '../../../design-system/Button';
import { Card, CardContent } from '../../../design-system';
import { Autocomplete } from '../../../design-system/Autocomplete';

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
  onChange: (
    data: Partial<{
      current: Medication[];
      changes: string;
      effectiveness: string;
    }>
  ) => void;
}

// Local medication library (can be expanded)
const LOCAL_MEDICATION_LIBRARY = [
  'Acetaminophen',
  'Ibuprofen',
  'Aspirin',
  'Naproxen',
  'Diclofenac',
  'Gabapentin',
  'Pregabalin',
  'Amitriptyline',
  'Duloxetine',
  'Tramadol',
  'Morphine',
  'Hydromorphone',
  'Oxycodone',
  'Codeine',
  'Celecoxib',
  'Meloxicam',
  'Topiramate',
  'Sumatriptan',
  'Metformin',
  'Other',
];

export function MedicationsSection({
  current,
  changes,
  effectiveness,
  onChange,
}: MedicationsSectionProps) {
  // --- Analytics: count, effectiveness summary ---
  const medCount = current.length;
  const effectivenessStats = useMemo(() => {
    const summary = { very: 0, somewhat: 0, not: 0, worse: 0 };
    current.forEach(med => {
      if (med.effectiveness === 'Very Effective') summary.very++;
      else if (med.effectiveness === 'Somewhat Effective') summary.somewhat++;
      else if (med.effectiveness === 'Not Effective') summary.not++;
      else if (med.effectiveness === 'Made Things Worse') summary.worse++;
    });
    return summary;
  }, [current]);

  // --- Reminders: simple local reminder UI ---
  const [reminder, setReminder] = useState('');
  const [reminderSet, setReminderSet] = useState(false);

  const handleSetReminder = () => {
    if (reminder) setReminderSet(true);
  };
  const handleClearReminder = () => {
    setReminder('');
    setReminderSet(false);
  };

  // --- Side effect tracking ---
  const [sideEffects, setSideEffects] = useState<string[]>([]);
  const [newSideEffect, setNewSideEffect] = useState('');
  const addSideEffect = () => {
    if (newSideEffect.trim()) {
      setSideEffects([...sideEffects, newSideEffect.trim()]);
      setNewSideEffect('');
    }
  };
  const removeSideEffect = (idx: number) => {
    setSideEffects(sideEffects.filter((_, i) => i !== idx));
  };
  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const updatedMedications = [...current];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value,
    };
    onChange({ current: updatedMedications });
  };

  const addMedication = () => {
    onChange({
      current: [...current, { name: '', dosage: '', frequency: '', effectiveness: '' }],
    });
  };

  const removeMedication = (index: number) => {
    onChange({
      current: current.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6" role="group" aria-labelledby="medications-title">
      <div className="flex items-center space-x-3">
        <span className="text-2xl" role="img" aria-label="medications">💊</span>
        <h3 id="medications-title" className="text-xl font-semibold text-foreground">Medications</h3>
      </div>

      {/* --- Analytics --- */}
      <div className="mb-4">
        <div className="text-sm text-muted-foreground">Total medications: <b>{medCount}</b></div>
        <div className="text-xs text-muted-foreground">
          Very Effective: {effectivenessStats.very} | Somewhat: {effectivenessStats.somewhat} | Not Effective: {effectivenessStats.not} | Worse: {effectivenessStats.worse}
        </div>
      </div>

      {/* --- Reminders --- */}
      <div className="mb-4">
        <label htmlFor="medication-reminder" className="block text-sm font-medium text-foreground mb-1">Medication Reminder</label>
        <div className="flex gap-2">
          <Input
            id="medication-reminder"
            value={reminder}
            onChange={e => setReminder(e.target.value)}
            placeholder="e.g., Take Ibuprofen at 8am"
            disabled={reminderSet}
          />
          {!reminderSet ? (
            <Button type="button" onClick={handleSetReminder} size="sm">Set</Button>
          ) : (
            <Button type="button" onClick={handleClearReminder} size="sm" variant="outline">Clear</Button>
          )}
        </div>
        {reminderSet && (
          <div className="text-xs text-green-600 mt-1">Reminder set: {reminder}</div>
        )}
      </div>

      {/* --- Side Effect Tracking --- */}
      <div className="mb-4">
        <label htmlFor="side-effect-input" className="block text-sm font-medium text-foreground mb-1">Side Effects</label>
        <div className="flex gap-2 mb-2">
          <Input
            id="side-effect-input"
            value={newSideEffect}
            onChange={e => setNewSideEffect(e.target.value)}
            placeholder="e.g., Nausea, Drowsiness"
          />
          <Button type="button" onClick={addSideEffect} size="sm">Add</Button>
        </div>
        <ul className="list-disc pl-5 text-xs">
          {sideEffects.map((effect, idx) => (
            <li key={idx} className="flex items-center gap-2">
              {effect}
              <Button type="button" size="xs" variant="ghost" onClick={() => removeSideEffect(idx)} aria-label="Remove side effect">Remove</Button>
            </li>
          ))}
        </ul>
      </div>

      {/* --- Medication Entry --- */}
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
                >Remove</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Autocomplete
                  label="Name"
                  value={medication.name}
                  options={LOCAL_MEDICATION_LIBRARY}
                  onChange={value => handleMedicationChange(index, 'name', value)}
                  placeholder="e.g., Ibuprofen"
                  allowCustomValue
                  aria-label={`Medication name ${index + 1}`}
                />

                <Input
                  label="Dosage"
                  value={medication.dosage}
                  onChange={e => handleMedicationChange(index, 'dosage', e.target.value)}
                  placeholder="e.g., 200mg"
                />

                <Input
                  label="Frequency"
                  value={medication.frequency}
                  onChange={e => handleMedicationChange(index, 'frequency', e.target.value)}
                  placeholder="e.g., Twice daily"
                />

                <div className="space-y-1">
                  <label htmlFor={`effectiveness-${index}`} className="block text-sm font-medium text-foreground">Effectiveness</label>
                  <select
                    id={`effectiveness-${index}`}
                    value={medication.effectiveness}
                    onChange={e => handleMedicationChange(index, 'effectiveness', e.target.value)}
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
          variant="default"
          className="w-full py-3 border-2 border-dashed border-border rounded-md text-muted-foreground hover:border-primary hover:text-primary"
          leftIcon={<span className="text-lg">+</span>}
        >Add Medication</Button>
      </div>

      {/* --- Changes & Effectiveness --- */}
      <div className="space-y-4">
        <div>
          <label htmlFor="medication-changes" className="block text-sm font-medium text-foreground mb-2">Recent Changes in Medications</label>
          <textarea
            id="medication-changes"
            value={changes}
            onChange={e => onChange({ changes: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[80px] resize-vertical"
            rows={3}
            placeholder="Describe any recent changes to your medication regimen..."
            aria-describedby="medication-changes-hint"
          />
          <p id="medication-changes-hint" className="text-xs text-muted-foreground mt-1">Optional: Note any changes, side effects, or adjustments</p>
        </div>

        <div>
          <label htmlFor="overall-effectiveness" className="block text-sm font-medium text-foreground mb-2">Overall Medication Effectiveness</label>
          <select
            id="overall-effectiveness"
            value={effectiveness}
            onChange={e => onChange({ effectiveness: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-describedby="overall-effectiveness-hint"
          >
            <option value="">Select overall effectiveness</option>
            <option value="Very Effective">Very Effective</option>
            <option value="Somewhat Effective">Somewhat Effective</option>
            <option value="Not Effective">Not Effective</option>
            <option value="Mixed Results">Mixed Results</option>
          </select>
          <p id="overall-effectiveness-hint" className="text-xs text-muted-foreground mt-1">How effective has your current medication regimen been overall?</p>
        </div>
      </div>

      {current.length === 0 && (
        <Alert tone="info">No medications recorded yet. Add your current medications above to track their effectiveness.</Alert>
      )}
    </div>
  );
}
