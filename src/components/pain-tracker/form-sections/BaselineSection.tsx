import React from 'react';
import { PAIN_LOCATIONS, SYMPTOMS } from '../../../utils/constants';
import classNames from 'classnames';

interface BaselineSectionProps {
  pain: number;
  locations: string[];
  symptoms: string[];
  onChange: (data: { pain?: number; locations?: string[]; symptoms?: string[] }) => void;
}

export function BaselineSection({ pain, locations, symptoms, onChange }: BaselineSectionProps) {
  const toggleLocation = (location: string) => {
    const newLocations = locations.includes(location)
      ? locations.filter(l => l !== location)
      : [...locations, location];
    onChange({ locations: newLocations });
  };

  const toggleSymptom = (symptom: string) => {
    const newSymptoms = symptoms.includes(symptom)
      ? symptoms.filter(s => s !== symptom)
      : [...symptoms, symptom];
    onChange({ symptoms: newSymptoms });
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="space-y-4" role="group" aria-labelledby="pain-assessment-title">
      <h3 id="pain-assessment-title" className="font-semibold text-lg">
        Pain Assessment
      </h3>

      <div>
        <label htmlFor="pain-level" className="block text-sm font-medium text-gray-700 mb-2">
          Pain Level: {pain}
        </label>
        <div className="flex items-center gap-2">
          <input
            id="pain-level"
            type="range"
            min="0"
            max="10"
            value={pain}
            onChange={e => onChange({ pain: parseInt(e.target.value) })}
            className="w-full"
            aria-label={`Pain level: ${pain} out of 10`}
          />
          <div className="grid grid-cols-11 w-full text-xs text-gray-500 px-1" aria-hidden="true">
            {[...Array(11)].map((_, i) => (
              <div key={i} className="text-center">
                {i}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div role="group" aria-labelledby="locations-label">
        <label id="locations-label" className="block text-sm font-medium text-gray-700 mb-2">
          Location (select all that apply)
        </label>
        <div className="flex flex-wrap gap-2">
          {PAIN_LOCATIONS.map((location: string) => (
            <button
              key={location}
              onClick={() => toggleLocation(location)}
              onKeyPress={e => handleKeyPress(e, () => toggleLocation(location))}
              type="button"
              className={classNames(
                'px-3 py-1 rounded-full text-sm',
                locations.includes(location)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
              role="checkbox"
              aria-checked={locations.includes(location)}
              aria-label={`Pain location: ${location}`}
            >
              {location}
            </button>
          ))}
        </div>
      </div>

      <div role="group" aria-labelledby="symptoms-label">
        <label id="symptoms-label" className="block text-sm font-medium text-gray-700 mb-2">
          Symptoms (select all that apply)
        </label>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map((symptom: string) => (
            <button
              key={symptom}
              onClick={() => toggleSymptom(symptom)}
              onKeyPress={e => handleKeyPress(e, () => toggleSymptom(symptom))}
              type="button"
              className={classNames(
                'px-3 py-1 rounded-full text-sm',
                symptoms.includes(symptom)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
              role="checkbox"
              aria-checked={symptoms.includes(symptom)}
              aria-label={`Symptom: ${symptom}`}
            >
              {symptom}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
