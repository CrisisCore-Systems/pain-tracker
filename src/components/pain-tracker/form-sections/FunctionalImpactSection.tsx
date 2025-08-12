import React from 'react';
import { ACTIVITIES } from "../../../utils/constants";
import classNames from "classnames";

interface FunctionalImpactSectionProps {
  limitedActivities: string[];
  mobilityAids: string[];
  assistanceNeeded: string[];
  onChange: (data: Partial<{
    limitedActivities: string[];
    mobilityAids: string[];
    assistanceNeeded: string[];
  }>) => void;
}

export function FunctionalImpactSection({
  limitedActivities,
  mobilityAids,
  assistanceNeeded,
  onChange
}: FunctionalImpactSectionProps) {
  const allActivities = [
    ...ACTIVITIES.BASIC,
    ...ACTIVITIES.HOUSEHOLD,
    ...ACTIVITIES.WORK_RELATED,
    ...ACTIVITIES.SOCIAL
  ];

  const mobilityAidsList = ACTIVITIES.MOBILITY_AIDS || [
    'cane', 'walker', 'wheelchair', 'crutches', 'braces', 'orthopedic shoes', 'mobility scooter'
  ];

  const assistanceList = [
    'bathing/showering', 'dressing', 'meal preparation', 'housework', 'shopping', 
    'transportation', 'medication management', 'climbing stairs', 'lifting objects'
  ];

  const toggleActivity = (activity: string) => {
    const newActivities = limitedActivities.includes(activity)
      ? limitedActivities.filter(a => a !== activity)
      : [...limitedActivities, activity];
    onChange({ limitedActivities: newActivities });
  };

  const toggleMobilityAid = (aid: string) => {
    const newAids = mobilityAids.includes(aid)
      ? mobilityAids.filter(a => a !== aid)
      : [...mobilityAids, aid];
    onChange({ mobilityAids: newAids });
  };

  const toggleAssistance = (assistance: string) => {
    const newAssistance = assistanceNeeded.includes(assistance)
      ? assistanceNeeded.filter(a => a !== assistance)
      : [...assistanceNeeded, assistance];
    onChange({ assistanceNeeded: newAssistance });
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="space-y-6" role="group" aria-labelledby="functional-impact-title">
      <div>
        <h3 id="functional-impact-title" className="text-lg font-semibold text-gray-900 mb-1">
          Functional Impact Assessment
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select activities affected by your pain and any assistance needed
        </p>
      </div>

      {/* Limited Activities */}
      <div role="group" aria-labelledby="activities-label">
        <label id="activities-label" className="block text-sm font-medium text-gray-700 mb-3">
          Limited Activities <span className="text-gray-500">(select all that apply)</span>
        </label>
        
        {/* Activity Categories */}
        <div className="space-y-4">
          {/* Basic Activities */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Daily Living</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACTIVITIES.BASIC.map((activity: string) => (
                <button
                  key={activity}
                  onClick={() => toggleActivity(activity)}
                  onKeyPress={(e) => handleKeyPress(e, () => toggleActivity(activity))}
                  type="button"
                  className={classNames(
                    "touch-target text-sm font-medium rounded-lg border-2 transition-all duration-200",
                    limitedActivities.includes(activity)
                      ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50"
                  )}
                  role="checkbox"
                  aria-checked={limitedActivities.includes(activity)}
                  aria-label={`Activity limitation: ${activity}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {limitedActivities.includes(activity) && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {activity}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Household Activities */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Household Tasks</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACTIVITIES.HOUSEHOLD.map((activity: string) => (
                <button
                  key={activity}
                  onClick={() => toggleActivity(activity)}
                  onKeyPress={(e) => handleKeyPress(e, () => toggleActivity(activity))}
                  type="button"
                  className={classNames(
                    "touch-target text-sm font-medium rounded-lg border-2 transition-all duration-200",
                    limitedActivities.includes(activity)
                      ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50"
                  )}
                  role="checkbox"
                  aria-checked={limitedActivities.includes(activity)}
                  aria-label={`Activity limitation: ${activity}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {limitedActivities.includes(activity) && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {activity}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Work-Related Activities */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Work & Occupation</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACTIVITIES.WORK_RELATED.map((activity: string) => (
                <button
                  key={activity}
                  onClick={() => toggleActivity(activity)}
                  onKeyPress={(e) => handleKeyPress(e, () => toggleActivity(activity))}
                  type="button"
                  className={classNames(
                    "touch-target text-sm font-medium rounded-lg border-2 transition-all duration-200",
                    limitedActivities.includes(activity)
                      ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50"
                  )}
                  role="checkbox"
                  aria-checked={limitedActivities.includes(activity)}
                  aria-label={`Activity limitation: ${activity}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {limitedActivities.includes(activity) && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {activity}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Social Activities */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Social & Recreation</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACTIVITIES.SOCIAL.map((activity: string) => (
                <button
                  key={activity}
                  onClick={() => toggleActivity(activity)}
                  onKeyPress={(e) => handleKeyPress(e, () => toggleActivity(activity))}
                  type="button"
                  className={classNames(
                    "touch-target text-sm font-medium rounded-lg border-2 transition-all duration-200",
                    limitedActivities.includes(activity)
                      ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                      : "bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50"
                  )}
                  role="checkbox"
                  aria-checked={limitedActivities.includes(activity)}
                  aria-label={`Activity limitation: ${activity}`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {limitedActivities.includes(activity) && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {activity}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {limitedActivities.length > 0 && (
          <p className="text-xs text-gray-500 mt-3">
            {limitedActivities.length} activit{limitedActivities.length !== 1 ? 'ies' : 'y'} selected
          </p>
        )}
      </div>

      {/* Mobility Aids */}
      <div role="group" aria-labelledby="mobility-aids-label">
        <label id="mobility-aids-label" className="block text-sm font-medium text-gray-700 mb-3">
          Mobility Aids Used <span className="text-gray-500">(select all that apply)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {mobilityAidsList.map((aid: string) => (
            <button
              key={aid}
              onClick={() => toggleMobilityAid(aid)}
              onKeyPress={(e) => handleKeyPress(e, () => toggleMobilityAid(aid))}
              type="button"
              className={classNames(
                "touch-target text-sm font-medium rounded-lg border-2 transition-all duration-200",
                mobilityAids.includes(aid)
                  ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:bg-purple-50"
              )}
              role="checkbox"
              aria-checked={mobilityAids.includes(aid)}
              aria-label={`Mobility aid: ${aid}`}
            >
              <span className="flex items-center justify-center gap-2">
                {mobilityAids.includes(aid) && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {aid}
              </span>
            </button>
          ))}
        </div>
        {mobilityAids.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {mobilityAids.length} aid{mobilityAids.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Assistance Needed */}
      <div role="group" aria-labelledby="assistance-label">
        <label id="assistance-label" className="block text-sm font-medium text-gray-700 mb-3">
          Assistance Needed <span className="text-gray-500">(select all that apply)</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {assistanceList.map((assistance: string) => (
            <button
              key={assistance}
              onClick={() => toggleAssistance(assistance)}
              onKeyPress={(e) => handleKeyPress(e, () => toggleAssistance(assistance))}
              type="button"
              className={classNames(
                "touch-target text-sm font-medium rounded-lg border-2 transition-all duration-200",
                assistanceNeeded.includes(assistance)
                  ? "bg-red-600 text-white border-red-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:bg-red-50"
              )}
              role="checkbox"
              aria-checked={assistanceNeeded.includes(assistance)}
              aria-label={`Assistance needed: ${assistance}`}
            >
              <span className="flex items-center justify-center gap-2">
                {assistanceNeeded.includes(assistance) && (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {assistance}
              </span>
            </button>
          ))}
        </div>
        {assistanceNeeded.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            {assistanceNeeded.length} assistance{assistanceNeeded.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>
    </div>
  );
}
