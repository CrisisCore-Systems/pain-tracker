import { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface DailyLivingProps {
  qualityOfLife: {
    sleepQuality: number;
    moodImpact: number;
    socialImpact: string[];
  };
  onChange: (qualityOfLife: {
    sleepQuality: number;
    moodImpact: number;
    socialImpact: string[];
  }) => void;
}

const COMMON_SOCIAL_IMPACTS = [
  'Cancelled Social Plans',
  'Reduced Social Activities',
  'Difficulty Maintaining Relationships',
  'Isolation',
  'Limited Family Time',
  'Missed Social Events',
  'Communication Difficulties',
  'Reduced Community Participation'
];

const MOOD_DESCRIPTIONS = {
  1: 'Severely Impacted',
  2: 'Very Negative',
  3: 'Negative',
  4: 'Somewhat Negative',
  5: 'Neutral',
  6: 'Slightly Positive',
  7: 'Mostly Positive',
  8: 'Positive',
  9: 'Very Positive',
  10: 'Excellent'
};

const SLEEP_DESCRIPTIONS = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Fair',
  4: 'Moderate',
  5: 'Average',
  6: 'Above Average',
  7: 'Good',
  8: 'Very Good',
  9: 'Excellent',
  10: 'Perfect'
};

export default function DailyLiving({ qualityOfLife, onChange }: DailyLivingProps) {
  const [newImpact, setNewImpact] = useState('');

  const addSocialImpact = () => {
    if (!newImpact) return;
    onChange({
      ...qualityOfLife,
      socialImpact: [...qualityOfLife.socialImpact, newImpact]
    });
    setNewImpact('');
  };

  const removeSocialImpact = (index: number) => {
    onChange({
      ...qualityOfLife,
      socialImpact: qualityOfLife.socialImpact.filter((_, i) => i !== index)
    });
  };

  const toggleCommonImpact = (impact: string) => {
    const exists = qualityOfLife.socialImpact.includes(impact);
    onChange({
      ...qualityOfLife,
      socialImpact: exists
        ? qualityOfLife.socialImpact.filter(i => i !== impact)
        : [...qualityOfLife.socialImpact, impact]
    });
  };

  return (
    <div className="space-y-6">
      {/* Sleep Quality */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sleep Quality</h3>
        <div className="space-y-4">
          <input
            type="range"
            min="1"
            max="10"
            value={qualityOfLife.sleepQuality}
            onChange={(e) => onChange({
              ...qualityOfLife,
              sleepQuality: parseInt(e.target.value)
            })}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Poor</span>
            <span>{SLEEP_DESCRIPTIONS[qualityOfLife.sleepQuality as keyof typeof SLEEP_DESCRIPTIONS]}</span>
            <span>Excellent</span>
          </div>
        </div>
      </div>

      {/* Mood Impact */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Mood Impact</h3>
        <div className="space-y-4">
          <input
            type="range"
            min="1"
            max="10"
            value={qualityOfLife.moodImpact}
            onChange={(e) => onChange({
              ...qualityOfLife,
              moodImpact: parseInt(e.target.value)
            })}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>Severe Impact</span>
            <span>{MOOD_DESCRIPTIONS[qualityOfLife.moodImpact as keyof typeof MOOD_DESCRIPTIONS]}</span>
            <span>No Impact</span>
          </div>
        </div>
      </div>

      {/* Social Impact */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Social Impact</h3>
        
        {/* Current Impacts */}
        <div className="space-y-2 mb-4">
          {qualityOfLife.socialImpact.map((impact, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
              <span className="text-sm text-gray-700">{impact}</span>
              <button
                type="button"
                onClick={() => removeSocialImpact(index)}
                className="text-red-600 hover:text-red-800"
              >
                <TrashIcon className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Remove impact</span>
              </button>
            </div>
          ))}
        </div>

        {/* Common Impacts */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Common Impacts</h4>
          <div className="flex flex-wrap gap-2">
            {COMMON_SOCIAL_IMPACTS.map((impact) => (
              <button
                key={impact}
                type="button"
                onClick={() => toggleCommonImpact(impact)}
                className={`px-3 py-1 rounded-full text-sm ${
                  qualityOfLife.socialImpact.includes(impact)
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {impact}
              </button>
            ))}
          </div>
        </div>

        {/* Add Custom Impact */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newImpact}
            onChange={(e) => setNewImpact(e.target.value)}
            placeholder="Add custom social impact..."
            className="block flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <button
            type="button"
            onClick={addSocialImpact}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Add impact</span>
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Daily Living Summary</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li className="text-sm text-gray-600">
            Sleep Quality: {SLEEP_DESCRIPTIONS[qualityOfLife.sleepQuality as keyof typeof SLEEP_DESCRIPTIONS]}
          </li>
          <li className="text-sm text-gray-600">
            Mood: {MOOD_DESCRIPTIONS[qualityOfLife.moodImpact as keyof typeof MOOD_DESCRIPTIONS]}
          </li>
          <li className="text-sm text-gray-600">
            Social Impacts: {qualityOfLife.socialImpact.length} reported
          </li>
        </ul>
      </div>
    </div>
  );
} 