import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../design-system/utils';

/**
 * Accessible body map component with dual-path interaction
 * - Visual users: SVG body map with click regions
 * - Screen reader users: Checkbox list with clear labels
 * 
 * Implements WCAG 2.2 AA dual-path pattern for complex graphics
 */

export interface BodyRegion {
  id: string;
  label: string;
  category: 'head' | 'upper-body' | 'lower-body' | 'limbs';
}

export const BODY_REGIONS: BodyRegion[] = [
  // Head & Neck
  { id: 'head', label: 'Head', category: 'head' },
  { id: 'neck', label: 'Neck', category: 'head' },
  { id: 'jaw', label: 'Jaw', category: 'head' },
  
  // Upper Body
  { id: 'shoulder-left', label: 'Left Shoulder', category: 'upper-body' },
  { id: 'shoulder-right', label: 'Right Shoulder', category: 'upper-body' },
  { id: 'chest', label: 'Chest', category: 'upper-body' },
  { id: 'upper-back', label: 'Upper Back', category: 'upper-body' },
  { id: 'mid-back', label: 'Mid Back', category: 'upper-body' },
  
  // Lower Body
  { id: 'lower-back', label: 'Lower Back', category: 'lower-body' },
  { id: 'abdomen', label: 'Abdomen', category: 'lower-body' },
  { id: 'hip-left', label: 'Left Hip', category: 'lower-body' },
  { id: 'hip-right', label: 'Right Hip', category: 'lower-body' },
  
  // Upper Limbs
  { id: 'arm-left-upper', label: 'Left Upper Arm', category: 'limbs' },
  { id: 'arm-right-upper', label: 'Right Upper Arm', category: 'limbs' },
  { id: 'elbow-left', label: 'Left Elbow', category: 'limbs' },
  { id: 'elbow-right', label: 'Right Elbow', category: 'limbs' },
  { id: 'forearm-left', label: 'Left Forearm', category: 'limbs' },
  { id: 'forearm-right', label: 'Right Forearm', category: 'limbs' },
  { id: 'wrist-left', label: 'Left Wrist', category: 'limbs' },
  { id: 'wrist-right', label: 'Right Wrist', category: 'limbs' },
  { id: 'hand-left', label: 'Left Hand', category: 'limbs' },
  { id: 'hand-right', label: 'Right Hand', category: 'limbs' },
  
  // Lower Limbs
  { id: 'thigh-left', label: 'Left Thigh', category: 'limbs' },
  { id: 'thigh-right', label: 'Right Thigh', category: 'limbs' },
  { id: 'knee-left', label: 'Left Knee', category: 'limbs' },
  { id: 'knee-right', label: 'Right Knee', category: 'limbs' },
  { id: 'shin-left', label: 'Left Shin', category: 'limbs' },
  { id: 'shin-right', label: 'Right Shin', category: 'limbs' },
  { id: 'ankle-left', label: 'Left Ankle', category: 'limbs' },
  { id: 'ankle-right', label: 'Right Ankle', category: 'limbs' },
  { id: 'foot-left', label: 'Left Foot', category: 'limbs' },
  { id: 'foot-right', label: 'Right Foot', category: 'limbs' },
];

interface BodyMapAccessibleProps {
  selectedRegions: string[];
  onChange: (regions: string[]) => void;
  showVisualMap?: boolean;
  className?: string;
}

export function BodyMapAccessible({
  selectedRegions,
  onChange,
  showVisualMap = true,
  className
}: BodyMapAccessibleProps) {
  const [viewMode, setViewMode] = useState<'visual' | 'list'>('list');

  const toggleRegion = (regionId: string) => {
    if (selectedRegions.includes(regionId)) {
      onChange(selectedRegions.filter(id => id !== regionId));
    } else {
      onChange([...selectedRegions, regionId]);
    }
  };

  const groupedRegions = BODY_REGIONS.reduce((acc, region) => {
    if (!acc[region.category]) {
      acc[region.category] = [];
    }
    acc[region.category].push(region);
    return acc;
  }, {} as Record<string, BodyRegion[]>);

  const categoryLabels = {
    'head': 'Head & Neck',
    'upper-body': 'Upper Body',
    'lower-body': 'Lower Body',
    'limbs': 'Arms & Legs'
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* View Mode Toggle */}
      {showVisualMap && (
        <div className="flex items-center justify-between">
          <h3 className="text-body-medium font-medium text-ink-200">Select Pain Locations</h3>
          <button
            onClick={() => setViewMode(viewMode === 'visual' ? 'list' : 'visual')}
            className="flex items-center gap-2 px-3 py-2 text-small text-ink-300 hover:text-ink-100 transition-colors rounded-lg hover:bg-surface-800"
            aria-label={viewMode === 'visual' ? 'Switch to list view' : 'Switch to visual body map'}
          >
            {viewMode === 'visual' ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>List View</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Visual Map</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Screen Reader Summary */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {selectedRegions.length === 0
          ? 'No body regions selected'
          : `${selectedRegions.length} region${selectedRegions.length > 1 ? 's' : ''} selected: ${
              selectedRegions.map(id => 
                BODY_REGIONS.find(r => r.id === id)?.label
              ).join(', ')
            }`
        }
      </div>

      {/* Visual Mode - Placeholder for SVG Body Map */}
      {viewMode === 'visual' && showVisualMap && (
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-8 text-center">
          <div className="text-ink-400 mb-4">
            <span className="text-4xl">🧍</span>
          </div>
          <p className="text-small text-ink-500 mb-2">
            Interactive SVG body map coming soon
          </p>
          <p className="text-small text-ink-600">
            Use list view below to select regions
          </p>
        </div>
      )}

      {/* List Mode - Accessible Checkbox Groups */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {Object.entries(categoryLabels).map(([category, label]) => {
            const regions = groupedRegions[category as keyof typeof groupedRegions] || [];
            
            return (
              <fieldset key={category} className="space-y-3">
                <legend className="text-body font-medium text-ink-200 mb-3">
                  {label}
                </legend>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {regions.map(region => {
                    const isSelected = selectedRegions.includes(region.id);
                    
                    return (
                      <label
                        key={region.id}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition-all',
                          'min-h-[48px] min-w-[48px]',
                          'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 focus-within:ring-offset-surface-900',
                          isSelected
                            ? 'bg-primary-500/20 border-primary-500 text-ink-50'
                            : 'bg-surface-800 border-surface-600 text-ink-300 hover:border-primary-500/50 hover:text-ink-100'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRegion(region.id)}
                          className="sr-only"
                          aria-label={region.label}
                        />
                        <div
                          className={cn(
                            'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                            isSelected
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-surface-500'
                          )}
                          aria-hidden="true"
                        >
                          {isSelected && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-small font-medium">{region.label}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
      )}

      {/* Selection Summary */}
      {selectedRegions.length > 0 && (
        <div className="surface-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-small font-medium text-ink-200">
              Selected Regions ({selectedRegions.length})
            </span>
            <button
              onClick={() => onChange([])}
              className="text-small text-primary-400 hover:text-primary-300 transition-colors"
              aria-label="Clear all selected regions"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedRegions.map(id => {
              const region = BODY_REGIONS.find(r => r.id === id);
              return region ? (
                <div
                  key={id}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-small text-ink-100"
                >
                  <span>{region.label}</span>
                  <button
                    onClick={() => toggleRegion(id)}
                    className="hover:text-primary-300 transition-colors"
                    aria-label={`Remove ${region.label}`}
                  >
                    ×
                  </button>
                </div>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
