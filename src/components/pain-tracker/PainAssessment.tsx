import React from 'react';
import { useState } from "react";
import type { PainEntry } from "../../types";

interface PainAssessmentProps {
  onSave: (data: Pick<PainEntry, "baselineData">) => void;
  initialData?: PainEntry["baselineData"];
}

const PAIN_LOCATIONS = [
  "Neck", "Upper Back", "Lower Back", "Shoulders",
  "Arms", "Hands", "Hips", "Legs", "Feet"
];

const PAIN_SYMPTOMS = [
  "Sharp", "Dull", "Burning", "Tingling",
  "Numbness", "Stiffness", "Weakness", "Spasms"
];

export function PainAssessment({ onSave, initialData }: PainAssessmentProps) {
  const [painLevel, setPainLevel] = useState(initialData?.pain ?? 0);
  const [locations, setLocations] = useState<string[]>(initialData?.locations ?? []);
  const [symptoms, setSymptoms] = useState<string[]>(initialData?.symptoms ?? []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      baselineData: {
        pain: painLevel,
        locations,
        symptoms,
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Pain Level (0-10)
        </label>
        <input
          type="range"
          min="0"
          max="10"
          value={painLevel}
          onChange={(e) => setPainLevel(Number(e.target.value))}
          className="w-full mt-1"
        />
        <span className="block text-center text-lg font-bold">{painLevel}</span>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pain Locations
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PAIN_LOCATIONS.map((location) => (
            <label key={location} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={locations.includes(location)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setLocations([...locations, location]);
                  } else {
                    setLocations(locations.filter(l => l !== location));
                  }
                }}
                className="rounded"
              />
              <span>{location}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Symptoms
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PAIN_SYMPTOMS.map((symptom) => (
            <label key={symptom} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={symptoms.includes(symptom)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSymptoms([...symptoms, symptom]);
                  } else {
                    setSymptoms(symptoms.filter(s => s !== symptom));
                  }
                }}
                className="rounded"
              />
              <span>{symptom}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        Save Pain Assessment
      </button>
    </form>
  );
}
