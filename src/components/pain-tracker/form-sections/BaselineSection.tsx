import React from 'react';
import { PAIN_LOCATIONS, SYMPTOMS } from "../../../utils/constants";
import { Button, Badge, Card, CardContent } from '../../../design-system';
import { Activity, MapPin, AlertTriangle } from 'lucide-react';

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

  const getPainLevelColor = (level: number) => {
    if (level <= 3) return 'success';
    if (level <= 6) return 'warning';
    return 'destructive';
  };

  const getPainLevelDescription = (level: number) => {
    if (level === 0) return 'No pain';
    if (level <= 3) return 'Mild pain';
    if (level <= 6) return 'Moderate pain';
    if (level <= 8) return 'Severe pain';
    return 'Worst possible pain';
  };

  return (
    <div className="space-y-6" role="group" aria-labelledby="pain-assessment-title">
      <div className="flex items-center space-x-3">
        <Activity className="h-5 w-5 text-primary" />
        <h3 id="pain-assessment-title" className="text-xl font-semibold text-foreground">
          Pain Assessment
        </h3>
      </div>

      {/* Pain Level Section */}
      <Card variant="elevated" className="p-6">
        <CardContent className="p-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="pain-level" className="text-sm font-medium text-foreground">
                Current Pain Level
              </label>
              <Badge variant={getPainLevelColor(pain)} className="text-xs">
                {pain}/10 - {getPainLevelDescription(pain)}
              </Badge>
            </div>

            <div className="space-y-3">
              <input
                id="pain-level"
                type="range"
                min="0"
                max="10"
                value={pain}
                onChange={(e) => onChange({ pain: parseInt(e.target.value) })}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                aria-label={`Pain level: ${pain} out of 10 - ${getPainLevelDescription(pain)}`}
              />

              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>0<br />No pain</span>
                <span>5<br />Moderate</span>
                <span>10<br />Worst</span>
              </div>
            </div>

            {/* Visual Pain Scale */}
            <div className="flex space-x-1 mt-4">
              {[...Array(11)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => onChange({ pain: i })}
                  className={`flex-1 h-8 rounded transition-all duration-200 ${
                    i === pain
                      ? 'bg-primary text-primary-foreground shadow-md scale-110'
                      : i <= pain
                      ? 'bg-primary/20 hover:bg-primary/30'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  aria-label={`Set pain level to ${i}`}
                >
                  <span className="text-xs font-medium">{i}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pain Locations Section */}
      <Card variant="outlined" className="p-6">
        <CardContent className="p-0">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-primary" />
              <label id="locations-label" className="text-sm font-medium text-foreground">
                Pain Locations
              </label>
              {locations.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {locations.length} selected
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Select all areas where you're experiencing pain
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PAIN_LOCATIONS.map((location: string) => (
                <Button
                  key={location}
                  onClick={() => toggleLocation(location)}
                  onKeyPress={(e) => handleKeyPress(e, () => toggleLocation(location))}
                  variant={locations.includes(location) ? "default" : "outline"}
                  size="sm"
                  className="justify-start h-auto py-2 px-3 text-left"
                  role="checkbox"
                  aria-checked={locations.includes(location)}
                  aria-label={`Pain location: ${location}`}
                >
                  {location}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Symptoms Section */}
      <Card variant="outlined" className="p-6">
        <CardContent className="p-0">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <label id="symptoms-label" className="text-sm font-medium text-foreground">
                Associated Symptoms
              </label>
              {symptoms.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {symptoms.length} selected
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Select any symptoms you're experiencing along with the pain
            </p>

            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              {SYMPTOMS.map((symptom: string) => (
                <Button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  onKeyPress={(e) => handleKeyPress(e, () => toggleSymptom(symptom))}
                  variant={symptoms.includes(symptom) ? "default" : "outline"}
                  size="sm"
                  className="justify-start h-auto py-2 px-3 text-left"
                  role="checkbox"
                  aria-checked={symptoms.includes(symptom)}
                  aria-label={`Symptom: ${symptom}`}
                >
                  {symptom}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
