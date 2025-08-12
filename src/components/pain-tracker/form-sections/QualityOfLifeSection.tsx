import React from 'react';
import classNames from "classnames";

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
  
  const socialImpactOptions = [
    'Avoided social gatherings',
    'Cancelled plans with friends/family',
    'Difficulty maintaining relationships',
    'Reduced participation in hobbies',
    'Unable to participate in sports/exercise',
    'Avoided public places',
    'Feeling isolated or lonely',
    'Difficulty concentrating in social settings',
    'Reduced travel or outings',
    'Changes in sexual intimacy',
    'Difficulty caring for family members',
    'Unable to attend important events'
  ];

  const toggleSocialImpact = (impact: string) => {
    const newImpacts = socialImpact.includes(impact)
      ? socialImpact.filter(i => i !== impact)
      : [...socialImpact, impact];
    onChange({ socialImpact: newImpacts });
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Helper functions for slider colors and labels
  const getSleepColor = (level: number) => {
    if (level === 0) return 'bg-red-500';
    if (level <= 3) return 'bg-red-400';
    if (level <= 6) return 'bg-yellow-500';
    if (level <= 8) return 'bg-green-400';
    return 'bg-green-500';
  };

  const getSleepLabel = (level: number) => {
    if (level === 0) return 'No Sleep';
    if (level <= 3) return 'Poor Sleep';
    if (level <= 6) return 'Fair Sleep';
    if (level <= 8) return 'Good Sleep';
    return 'Excellent Sleep';
  };

  const getMoodColor = (level: number) => {
    if (level === 0) return 'bg-green-500';
    if (level <= 3) return 'bg-green-400';
    if (level <= 6) return 'bg-yellow-500';
    if (level <= 8) return 'bg-red-400';
    return 'bg-red-500';
  };

  const getMoodLabel = (level: number) => {
    if (level === 0) return 'No Impact';
    if (level <= 3) return 'Minimal Impact';
    if (level <= 6) return 'Moderate Impact';
    if (level <= 8) return 'Significant Impact';
    return 'Severe Impact';
  };

  return (
    <div className="space-y-6" role="group" aria-labelledby="quality-of-life-title">
      <div>
        <h3 id="quality-of-life-title" className="text-lg font-semibold text-gray-900 mb-1">
          Quality of Life Assessment
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Rate how pain affects your sleep, mood, and social activities
        </p>
      </div>
      
      {/* Sleep Quality Slider */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <label htmlFor="sleep-quality" className="text-sm font-medium text-gray-700">
            Sleep Quality
          </label>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium text-white rounded-full ${getSleepColor(sleepQuality)}`}>
              {sleepQuality}/10
            </span>
            <span className="text-sm text-gray-600 hidden sm:inline">
              {getSleepLabel(sleepQuality)}
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <input
              id="sleep-quality"
              type="range"
              min="0"
              max="10"
              value={sleepQuality}
              onChange={(e) => onChange({ sleepQuality: parseInt(e.target.value) })}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-mobile focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label={`Sleep quality: ${sleepQuality} out of 10 - ${getSleepLabel(sleepQuality)}`}
              style={{
                background: `linear-gradient(to right, ${getSleepColor(sleepQuality)} 0%, ${getSleepColor(sleepQuality)} ${sleepQuality * 10}%, #e5e7eb ${sleepQuality * 10}%, #e5e7eb 100%)`
              }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 px-1" aria-hidden="true">
            <span>Poor</span>
            <span className="hidden xs:inline">Fair</span>
            <span>Good</span>
            <span className="hidden xs:inline">Great</span>
            <span>Excellent</span>
          </div>
          
          <div className="text-center sm:hidden">
            <span className="text-sm font-medium text-gray-700">
              {getSleepLabel(sleepQuality)}
            </span>
          </div>
        </div>
      </div>

      {/* Mood Impact Slider */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <label htmlFor="mood-impact" className="text-sm font-medium text-gray-700">
            Mood Impact
          </label>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-medium text-white rounded-full ${getMoodColor(moodImpact)}`}>
              {moodImpact}/10
            </span>
            <span className="text-sm text-gray-600 hidden sm:inline">
              {getMoodLabel(moodImpact)}
            </span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="relative">
            <input
              id="mood-impact"
              type="range"
              min="0"
              max="10"
              value={moodImpact}
              onChange={(e) => onChange({ moodImpact: parseInt(e.target.value) })}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-mobile focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Mood impact: ${moodImpact} out of 10 - ${getMoodLabel(moodImpact)}`}
              style={{
                background: `linear-gradient(to right, ${getMoodColor(moodImpact)} 0%, ${getMoodColor(moodImpact)} ${moodImpact * 10}%, #e5e7eb ${moodImpact * 10}%, #e5e7eb 100%)`
              }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 px-1" aria-hidden="true">
            <span>None</span>
            <span className="hidden xs:inline">Minimal</span>
            <span>Moderate</span>
            <span className="hidden xs:inline">Significant</span>
            <span>Severe</span>
          </div>
          
          <div className="text-center sm:hidden">
            <span className="text-sm font-medium text-gray-700">
              {getMoodLabel(moodImpact)}
            </span>
          </div>
        </div>
      </div>

      {/* Social Impact */}
      <div role="group" aria-labelledby="social-impact-label">
        <label id="social-impact-label" className="block text-sm font-medium text-gray-700 mb-3">
          Social Impact <span className="text-gray-500">(select all that apply)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {socialImpactOptions.map((impact: string) => (
            <button
              key={impact}
              onClick={() => toggleSocialImpact(impact)}
              onKeyPress={(e) => handleKeyPress(e, () => toggleSocialImpact(impact))}
              type="button"
              className={classNames(
                "touch-target text-sm font-medium rounded-lg border-2 transition-all duration-200 text-left",
                socialImpact.includes(impact)
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-300 hover:bg-indigo-50"
              )}
              role="checkbox"
              aria-checked={socialImpact.includes(impact)}
              aria-label={`Social impact: ${impact}`}
            >
              <span className="flex items-center gap-3">
                <span className="flex-shrink-0">
                  {socialImpact.includes(impact) ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-400 rounded"></div>
                  )}
                </span>
                <span className="flex-1">{impact}</span>
              </span>
            </button>
          ))}
        </div>
        {socialImpact.length > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            {socialImpact.length} impact{socialImpact.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>
    </div>
  );
}
