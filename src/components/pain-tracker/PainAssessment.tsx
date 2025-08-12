import React, { useState, useEffect } from 'react';
import type { PainEntry } from "../../types";
import { PAIN_LOCATIONS, SYMPTOMS, type PainLocation, type Symptom } from "../../utils/constants";
import { savePainEntry, loadPainEntries } from "../../utils/pain-tracker/storage";
import { PainAnalytics } from "./PainAnalytics";

interface ValidationErrors {
  painLevel?: string;
  locations?: string;
  symptoms?: string;
}

interface PainAssessmentProps {
  onSave?: (entry: PainEntry) => void;
  initialData?: PainEntry["baselineData"];
}

export function PainAssessment({ onSave, initialData }: PainAssessmentProps) {
  const [painLevel, setPainLevel] = useState(initialData?.pain ?? 0);
  const [locations, setLocations] = useState<PainLocation[]>(initialData?.locations as PainLocation[] ?? []);
  const [symptoms, setSymptoms] = useState<Symptom[]>(initialData?.symptoms as Symptom[] ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [entries, setEntries] = useState<PainEntry[]>([]);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const loadedEntries = await loadPainEntries();
        setEntries(loadedEntries);
      } catch (err) {
        console.error('Failed to load pain entries:', err);
      }
    };
    loadEntries();
  }, []);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (painLevel < 0 || painLevel > 10) {
      errors.painLevel = 'Pain level must be between 0 and 10';
      isValid = false;
    }

    if (locations.length === 0) {
      errors.locations = 'Please select at least one pain location';
      isValid = false;
    }

    if (symptoms.length === 0) {
      errors.symptoms = 'Please select at least one symptom';
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Mark all fields as touched on submit
    setTouched({
      painLevel: true,
      locations: true,
      symptoms: true
    });

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const newEntry: PainEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        baselineData: {
          pain: painLevel,
          locations,
          symptoms,
        },
        functionalImpact: {
          limitedActivities: [],
          assistanceNeeded: [],
          mobilityAids: []
        },
        medications: {
          current: [],
          changes: '',
          effectiveness: ''
        },
        treatments: {
          recent: [],
          effectiveness: '',
          planned: []
        },
        qualityOfLife: {
          sleepQuality: 0,
          moodImpact: 0,
          socialImpact: []
        },
        workImpact: {
          missedWork: 0,
          modifiedDuties: [],
          workLimitations: []
        },
        comparison: {
          worseningSince: '',
          newLimitations: []
        },
        notes: ''
      };

      await savePainEntry(newEntry);
      onSave?.(newEntry);

      // Reset form
      setPainLevel(0);
      setLocations([]);
      setSymptoms([]);
      setTouched({});
      setValidationErrors({});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save pain entry');
    } finally {
      setSaving(false);
    }
  };

  const handleBlur = (field: keyof ValidationErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const toggleLocation = (location: PainLocation) => {
    setLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
    setTouched(prev => ({ ...prev, locations: true }));
  };

  const toggleSymptom = (symptom: Symptom) => {
    setSymptoms(prev => 
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
    setTouched(prev => ({ ...prev, symptoms: true }));
  };

  return (
    <div className="space-y-8">
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
            onBlur={() => handleBlur('painLevel')}
            className="w-full mt-1"
            aria-label="Pain level slider"
            aria-valuemin={0}
            aria-valuemax={10}
            aria-valuenow={painLevel}
          />
          <span className="block text-center text-lg font-bold">{painLevel}</span>
          {touched.painLevel && validationErrors.painLevel && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.painLevel}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pain Locations
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PAIN_LOCATIONS.map((location) => (
              <label key={location} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={locations.includes(location)}
                  onChange={() => toggleLocation(location)}
                  className="rounded text-blue-600"
                  aria-label={`Pain location: ${location}`}
                />
                <span className="text-sm">{location}</span>
              </label>
            ))}
          </div>
          {touched.locations && validationErrors.locations && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.locations}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Symptoms
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SYMPTOMS.map((symptom) => (
              <label key={symptom} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={symptoms.includes(symptom)}
                  onChange={() => toggleSymptom(symptom)}
                  className="rounded text-blue-600"
                  aria-label={`Symptom: ${symptom}`}
                />
                <span className="text-sm">{symptom}</span>
              </label>
            ))}
          </div>
          {touched.symptoms && validationErrors.symptoms && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.symptoms}</p>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-md" role="alert">
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${saving 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          aria-busy={saving}
        >
          {saving ? 'Saving...' : 'Save Pain Entry'}
        </button>
      </form>

      {/* Pain Analytics Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Pain Analysis</h2>
        <PainAnalytics entries={entries} />
      </div>
    </div>
  );
}
