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

  // Upper Body
  { id: 'left-shoulder', label: 'Left Shoulder', category: 'upper-body' },
  { id: 'right-shoulder', label: 'Right Shoulder', category: 'upper-body' },
  { id: 'chest', label: 'Chest', category: 'upper-body' },
  { id: 'upper-back', label: 'Upper Back', category: 'upper-body' },

  // Core/Torso
  { id: 'abdomen', label: 'Abdomen', category: 'lower-body' },
  { id: 'lower-back', label: 'Lower Back', category: 'lower-body' },
  { id: 'left-hip', label: 'Left Hip', category: 'lower-body' },
  { id: 'right-hip', label: 'Right Hip', category: 'lower-body' },

  // Upper Limbs
  { id: 'left-upper-arm', label: 'Left Upper Arm', category: 'limbs' },
  { id: 'right-upper-arm', label: 'Right Upper Arm', category: 'limbs' },
  { id: 'left-elbow', label: 'Left Elbow', category: 'limbs' },
  { id: 'right-elbow', label: 'Right Elbow', category: 'limbs' },
  { id: 'left-forearm', label: 'Left Forearm', category: 'limbs' },
  { id: 'right-forearm', label: 'Right Forearm', category: 'limbs' },
  { id: 'left-hand', label: 'Left Hand', category: 'limbs' },
  { id: 'right-hand', label: 'Right Hand', category: 'limbs' },

  // Lower Limbs - Thighs (detailed for nerve pain)
  { id: 'left-thigh-outer', label: 'Left Outer Thigh', category: 'limbs' },
  { id: 'left-thigh-inner', label: 'Left Inner Thigh', category: 'limbs' },
  { id: 'right-thigh-outer', label: 'Right Outer Thigh', category: 'limbs' },
  { id: 'right-thigh-inner', label: 'Right Inner Thigh', category: 'limbs' },

  // Knees (detailed for nerve pain)
  { id: 'left-knee-outer', label: 'Left Outer Knee', category: 'limbs' },
  { id: 'left-knee-inner', label: 'Left Inner Knee', category: 'limbs' },
  { id: 'right-knee-outer', label: 'Right Outer Knee', category: 'limbs' },
  { id: 'right-knee-inner', label: 'Right Inner Knee', category: 'limbs' },

  // Shins (front view)
  { id: 'left-shin-outer', label: 'Left Outer Shin', category: 'limbs' },
  { id: 'left-shin-inner', label: 'Left Inner Shin', category: 'limbs' },
  { id: 'right-shin-outer', label: 'Right Outer Shin', category: 'limbs' },
  { id: 'right-shin-inner', label: 'Right Inner Shin', category: 'limbs' },

  // Calves (back view)
  { id: 'left-calf-outer', label: 'Left Outer Calf', category: 'limbs' },
  { id: 'left-calf-inner', label: 'Left Inner Calf', category: 'limbs' },
  { id: 'right-calf-outer', label: 'Right Outer Calf', category: 'limbs' },
  { id: 'right-calf-inner', label: 'Right Inner Calf', category: 'limbs' },

  // Ankles
  { id: 'left-ankle', label: 'Left Ankle', category: 'limbs' },
  { id: 'right-ankle', label: 'Right Ankle', category: 'limbs' },

  // Feet (medial/lateral for nerve pain)
  { id: 'left-foot-lateral', label: 'Left Foot (Outer)', category: 'limbs' },
  { id: 'left-foot-medial', label: 'Left Foot (Inner)', category: 'limbs' },
  { id: 'right-foot-lateral', label: 'Right Foot (Outer)', category: 'limbs' },
  { id: 'right-foot-medial', label: 'Right Foot (Inner)', category: 'limbs' },

  // Toes (medial/lateral for nerve pain)
  { id: 'left-toes-lateral', label: 'Left Toes (Outer)', category: 'limbs' },
  { id: 'left-toes-medial', label: 'Left Toes (Inner)', category: 'limbs' },
  { id: 'right-toes-lateral', label: 'Right Toes (Outer)', category: 'limbs' },
  { id: 'right-toes-medial', label: 'Right Toes (Inner)', category: 'limbs' },
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
  className,
}: BodyMapAccessibleProps) {
  const [viewMode, setViewMode] = useState<'visual' | 'list'>('list');

  const toggleRegion = (regionId: string) => {
    if (selectedRegions.includes(regionId)) {
      onChange(selectedRegions.filter(id => id !== regionId));
    } else {
      onChange([...selectedRegions, regionId]);
    }
  };

  const groupedRegions = BODY_REGIONS.reduce(
    (acc, region) => {
      if (!acc[region.category]) {
        acc[region.category] = [];
      }
      acc[region.category].push(region);
      return acc;
    },
    {} as Record<string, BodyRegion[]>
  );

  const categoryLabels = {
    head: 'Head & Neck',
    'upper-body': 'Upper Body',
    'lower-body': 'Lower Body',
    limbs: 'Arms & Legs',
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
          : `${selectedRegions.length} region${selectedRegions.length > 1 ? 's' : ''} selected: ${selectedRegions
              .map(id => BODY_REGIONS.find(r => r.id === id)?.label)
              .join(', ')}`}
      </div>

      {/* Visual Mode - Placeholder for SVG Body Map */}
      {viewMode === 'visual' && showVisualMap && (
        <div className="bg-surface-800 border border-surface-600 rounded-xl p-8 text-center">
          <div className="text-ink-400 mb-4">
            <span className="text-4xl">🧍</span>
          </div>
          <p className="text-small text-ink-500 mb-2">Interactive SVG body map coming soon</p>
          <p className="text-small text-ink-600">Use list view below to select regions</p>
        </div>
      )}

      {/* List Mode - Accessible Checkbox Groups */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {Object.entries(categoryLabels).map(([category, label]) => {
            const regions = groupedRegions[category as keyof typeof groupedRegions] || [];

            return (
              <fieldset key={category} className="space-y-3">
                <legend className="text-body font-medium text-ink-200 mb-3">{label}</legend>

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
                            isSelected ? 'bg-primary-500 border-primary-500' : 'border-surface-500'
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
