import React from 'react';
import { PAIN_LOCATIONS, SYMPTOMS } from "../../../utils/constants";
import classNames from "classnames";

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

  // Color mapping for pain levels
  const getPainColor = (level: number) => {
    if (level === 0) return 'bg-gray-200';
    if (level <= 3) return 'bg-green-500';
    if (level <= 6) return 'bg-yellow-500';
    if (level <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getPainLabel = (level: number) => {
    if (level === 0) return 'No Pain';
    if (level <= 3) return 'Mild Pain';
    if (level <= 6) return 'Moderate Pain';
    if (level <= 8) return 'Severe Pain';
    return 'Worst Pain';
  };

  return (
    <div className="space-y-6" role="group" aria-labelledby="pain-assessment-title">
      <div>
        <h3 id="pain-assessment-title" className="text-lg font-semibold text-gray-900 mb-1">
          Pain Assessment
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Rate your current pain level and select affected areas
        </p>
      </div>
      
      {/* Mobile-optimized pain level slider */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <label htmlFor="pain-level" className="text-sm font-medium text-gray-700">
            Pain Level
          </label>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium text-white rounded-full ${getPainColor(pain)}`}>
              {pain}/10
            </span>
            <span className="text-sm text-gray-600 hidden sm:inline">
              {getPainLabel(pain)}
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Mobile-friendly range slider */}
          <div className="relative">
            <input
              id="pain-level"
              type="range"
              min="0"
              max="10"
              value={pain}
              onChange={(e) => onChange({ pain: parseInt(e.target.value) })}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-mobile focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Pain level: ${pain} out of 10 - ${getPainLabel(pain)}`}
              style={{
                background: `linear-gradient(to right, ${getPainColor(pain)} 0%, ${getPainColor(pain)} ${pain * 10}%, #e5e7eb ${pain * 10}%, #e5e7eb 100%)`
              }}
            />
          </div>
          
          {/* Mobile-friendly scale labels */}
          <div className="flex justify-between text-xs text-gray-500 px-1" aria-hidden="true">
            <span>0</span>
            <span className="hidden xs:inline">2</span>
            <span className="hidden sm:inline">4</span>
            <span>5</span>
            <span className="hidden sm:inline">6</span>
            <span className="hidden xs:inline">8</span>
            <span>10</span>
          </div>
          
          <div className="text-center sm:hidden">
            <span className="text-sm font-medium text-gray-700">
              {getPainLabel(pain)}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile-optimized pain locations */}
      <div role="group" aria-labelledby="locations-label">
        <label id="locations-label" className="block text-sm font-medium text-gray-700 mb-3">
          Pain Locations <span className="text-gray-500">(select all that apply)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PAIN_LOCATIONS.map((location: string) => (
            <button
              key={location}
              onClick={() => toggleLocation(location)}
              onKeyPress={(e) => handleKeyPress(e, () => toggleLocation(location))}
              type="button"
              className={classNames(
                "touch-target text-sm font-medium rounded-lg border-2 transition-all duration-200",
                locations.includes(location)
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
              )}
              role="checkbox"
              aria-checked={locations.includes(location)}
              aria-label={`Pain location: ${location}`}
            >
              <span className="flex items-center justify-center gap-2">
                {locations.includes(location) && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {location}
              </span>
            </button>
          ))}
        </div>
        {locations.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {locations.length} location{locations.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Mobile-optimized symptoms */}
      <div role="group" aria-labelledby="symptoms-label">
        <label id="symptoms-label" className="block text-sm font-medium text-gray-700 mb-3">
          Symptoms <span className="text-gray-500">(select all that apply)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SYMPTOMS.map((symptom: string) => (
            <button
              key={symptom}
              onClick={() => toggleSymptom(symptom)}
              onKeyPress={(e) => handleKeyPress(e, () => toggleSymptom(symptom))}
              type="button"
              className={classNames(
                "touch-target text-sm font-medium rounded-lg border-2 transition-all duration-200",
                symptoms.includes(symptom)
                  ? "bg-green-600 text-white border-green-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-300 hover:border-green-300 hover:bg-green-50"
              )}
              role="checkbox"
              aria-checked={symptoms.includes(symptom)}
              aria-label={`Symptom: ${symptom}`}
            >
              <span className="flex items-center justify-center gap-2">
                {symptoms.includes(symptom) && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {symptom}
              </span>
            </button>
          ))}
        </div>
        {symptoms.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {symptoms.length} symptom{symptoms.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>
    </div>
  );
}
