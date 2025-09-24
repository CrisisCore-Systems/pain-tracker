import React from 'react';
import { Input } from '../../../design-system/Input';
import { Alert } from '../../../design-system/Alert';
import { Card, CardContent } from '../../../design-system';

interface QualityOfLifeSectionProps {
  sleepQuality: number;
  moodImpact: number;
  socialImpact: string[];
  onChange: (data: Partial<{
    sleepQuality: number;
    moodImpact: number;
    socialImpact: string[];
  }>) => void;
}

export function QualityOfLifeSection({
  sleepQuality,
  moodImpact,
  socialImpact,
  onChange
}: QualityOfLifeSectionProps) {
  const getSleepQualityDescription = (level: number) => {
    if (level <= 3) return 'Poor sleep quality';
    if (level <= 6) return 'Fair sleep quality';
    return 'Good sleep quality';
  };

  const getMoodImpactDescription = (level: number) => {
    if (level <= 3) return 'Minimal mood impact';
    if (level <= 6) return 'Moderate mood impact';
    return 'Significant mood impact';
  };

  return (
    <div className="space-y-6" role="group" aria-labelledby="quality-of-life-title">
      <div className="flex items-center space-x-3">
        <span className="text-2xl" role="img" aria-label="quality of life">😴</span>
        <h3 id="quality-of-life-title" className="text-xl font-semibold text-foreground">
          Quality of Life Impact
        </h3>
      </div>

      <Card variant="elevated" className="p-6">
        <CardContent className="p-0">
          <div className="space-y-6">
            {/* Sleep Quality Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="sleep-quality" className="text-sm font-medium text-foreground">
                  Sleep Quality
                </label>
                <span className="text-sm text-muted-foreground">
                  {sleepQuality}/10 - {getSleepQualityDescription(sleepQuality)}
                </span>
              </div>

              <div className="space-y-3">
                <input
                  id="sleep-quality"
                  type="range"
                  min="0"
                  max="10"
                  value={sleepQuality}
                  onChange={(e) => onChange({ sleepQuality: parseInt(e.target.value) })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  aria-label={`Sleep quality: ${sleepQuality} out of 10 - ${getSleepQualityDescription(sleepQuality)}`}
                />

                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>0<br />No sleep</span>
                  <span>5<br />Fair</span>
                  <span>10<br />Excellent</span>
                </div>
              </div>
            </div>

            {/* Mood Impact Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="mood-impact" className="text-sm font-medium text-foreground">
                  Mood Impact
                </label>
                <span className="text-sm text-muted-foreground">
                  {moodImpact}/10 - {getMoodImpactDescription(moodImpact)}
                </span>
              </div>

              <div className="space-y-3">
                <input
                  id="mood-impact"
                  type="range"
                  min="0"
                  max="10"
                  value={moodImpact}
                  onChange={(e) => onChange({ moodImpact: parseInt(e.target.value) })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  aria-label={`Mood impact: ${moodImpact} out of 10 - ${getMoodImpactDescription(moodImpact)}`}
                />

                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>0<br />No impact</span>
                  <span>5<br />Moderate</span>
                  <span>10<br />Severe</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Impact Section */}
      <div className="space-y-4">
        <label htmlFor="social-impact" className="block text-sm font-medium text-foreground">
          Social Impact
        </label>
        <textarea
          id="social-impact"
          value={socialImpact.join("\n")}
          onChange={(e) => onChange({ socialImpact: e.target.value.split("\n").filter(Boolean) })}
          className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-h-[80px] resize-vertical"
          rows={3}
          placeholder="Enter each social impact on a new line (e.g., 'Unable to attend social gatherings')"
          aria-describedby="social-impact-hint"
        />
        <p id="social-impact-hint" className="text-xs text-muted-foreground">
          How has pain affected your social life and relationships?
        </p>
      </div>

      {(sleepQuality === 0 && moodImpact === 0 && socialImpact.length === 0) && (
        <Alert tone="info">
          Quality of life metrics help track how pain affects your daily life. Consider rating your sleep quality and mood impact above.
        </Alert>
      )}
    </div>
  );
}
