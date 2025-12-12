import React from 'react';
import { Card, CardContent, Badge } from '../../../design-system';
import { Zap, Heart, Activity, Flame, Dumbbell } from 'lucide-react';
import { PAIN_TRIGGERS, RELIEF_METHODS, PAIN_QUALITIES, PHYSICAL_ACTIVITIES } from '../../../utils/constants';

interface TriggersAndReliefSectionProps {
  triggers: string[];
  reliefMethods: string[];
  activityLevel: number;
  stress: number;
  quality: string[];
  activities: string[];
  onChange: (
    data: Partial<{
      triggers: string[];
      reliefMethods: string[];
      activityLevel: number;
      stress: number;
      quality: string[];
      activities: string[];
    }>
  ) => void;
}

export function TriggersAndReliefSection({
  triggers,
  reliefMethods,
  activityLevel,
  stress,
  quality,
  activities,
  onChange,
}: TriggersAndReliefSectionProps) {
  const toggleTrigger = (trigger: string) => {
    const newTriggers = triggers.includes(trigger)
      ? triggers.filter(t => t !== trigger)
      : [...triggers, trigger];
    onChange({ triggers: newTriggers });
  };

  const toggleReliefMethod = (method: string) => {
    const newMethods = reliefMethods.includes(method)
      ? reliefMethods.filter(m => m !== method)
      : [...reliefMethods, method];
    onChange({ reliefMethods: newMethods });
  };

  const toggleQuality = (q: string) => {
    const newQualities = quality.includes(q)
      ? quality.filter(x => x !== q)
      : [...quality, q];
    onChange({ quality: newQualities });
  };

  const toggleActivity = (activity: string) => {
    const newActivities = activities.includes(activity)
      ? activities.filter(a => a !== activity)
      : [...activities, activity];
    onChange({ activities: newActivities });
  };

  return (
    <div className="space-y-6" role="group" aria-labelledby="triggers-relief-title">
      <div className="flex items-center space-x-3">
        <span className="text-2xl" role="img" aria-label="triggers and relief">
          🔍
        </span>
        <h3 id="triggers-relief-title" className="text-xl font-semibold text-foreground">
          Triggers & Relief
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Understanding what triggers your pain and what helps can reveal valuable patterns over time.
      </p>

      {/* Activity Level */}
      <Card variant="elevated" className="p-4">
        <CardContent className="p-0 space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <label htmlFor="activity-level" className="text-sm font-medium text-foreground">
              Activity Level Today
            </label>
            <span className="ml-auto text-sm text-muted-foreground">{activityLevel}/10</span>
          </div>
          <input
            id="activity-level"
            type="range"
            min="0"
            max="10"
            value={activityLevel}
            onChange={e => onChange({ activityLevel: parseInt(e.target.value) })}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            aria-label={`Activity level: ${activityLevel} out of 10`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Sedentary</span>
            <span>Moderate</span>
            <span>Very Active</span>
          </div>
        </CardContent>
      </Card>

      {/* Stress Level */}
      <Card variant="elevated" className="p-4">
        <CardContent className="p-0 space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" />
            <label htmlFor="stress-level" className="text-sm font-medium text-foreground">
              Stress Level
            </label>
            <span className="ml-auto text-sm text-muted-foreground">{stress}/10</span>
          </div>
          <input
            id="stress-level"
            type="range"
            min="0"
            max="10"
            value={stress}
            onChange={e => onChange({ stress: parseInt(e.target.value) })}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            aria-label={`Stress level: ${stress} out of 10`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Relaxed</span>
            <span>Moderate</span>
            <span>High Stress</span>
          </div>
        </CardContent>
      </Card>

      {/* Pain Triggers */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          <label className="text-sm font-medium text-foreground">
            What might have triggered your pain?
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Select any factors that may have contributed to your pain today
        </p>
        <div className="flex flex-wrap gap-2">
          {PAIN_TRIGGERS.map(trigger => (
            <Badge
              key={trigger}
              variant={triggers.includes(trigger) ? 'default' : 'outline'}
              className={`cursor-pointer transition-colors ${
                triggers.includes(trigger)
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'hover:bg-amber-100 dark:hover:bg-amber-900/20'
              }`}
              onClick={() => toggleTrigger(trigger)}
              role="checkbox"
              aria-checked={triggers.includes(trigger)}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleTrigger(trigger);
                }
              }}
            >
              {trigger}
            </Badge>
          ))}
        </div>
      </div>

      {/* Relief Methods */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-green-500" />
          <label className="text-sm font-medium text-foreground">
            What has helped relieve your pain?
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Select methods you've tried that provided some relief
        </p>
        <div className="flex flex-wrap gap-2">
          {RELIEF_METHODS.map(method => (
            <Badge
              key={method}
              variant={reliefMethods.includes(method) ? 'default' : 'outline'}
              className={`cursor-pointer transition-colors ${
                reliefMethods.includes(method)
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'hover:bg-green-100 dark:hover:bg-green-900/20'
              }`}
              onClick={() => toggleReliefMethod(method)}
              role="checkbox"
              aria-checked={reliefMethods.includes(method)}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleReliefMethod(method);
                }
              }}
            >
              {method}
            </Badge>
          ))}
        </div>
      </div>

      {/* Pain Quality */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <label className="text-sm font-medium text-foreground">
            How would you describe your pain?
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Select words that best describe the sensation
        </p>
        <div className="flex flex-wrap gap-2">
          {PAIN_QUALITIES.map(q => (
            <Badge
              key={q}
              variant={quality.includes(q) ? 'default' : 'outline'}
              className={`cursor-pointer transition-colors ${
                quality.includes(q)
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'hover:bg-orange-100 dark:hover:bg-orange-900/20'
              }`}
              onClick={() => toggleQuality(q)}
              role="checkbox"
              aria-checked={quality.includes(q)}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleQuality(q);
                }
              }}
            >
              {q}
            </Badge>
          ))}
        </div>
      </div>

      {/* Physical Activities */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-purple-500" />
          <label className="text-sm font-medium text-foreground">
            What physical activities did you do today?
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          Select activities you engaged in
        </p>
        <div className="flex flex-wrap gap-2">
          {PHYSICAL_ACTIVITIES.map(activity => (
            <Badge
              key={activity}
              variant={activities.includes(activity) ? 'default' : 'outline'}
              className={`cursor-pointer transition-colors ${
                activities.includes(activity)
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'hover:bg-purple-100 dark:hover:bg-purple-900/20'
              }`}
              onClick={() => toggleActivity(activity)}
              role="checkbox"
              aria-checked={activities.includes(activity)}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleActivity(activity);
                }
              }}
            >
              {activity}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
