import { useState, useRef, useEffect } from 'react';
import { Palette, RotateCcw, Info } from 'lucide-react';
import type { PainEntry } from '../../types';

interface BodyRegion {
  id: string;
  name: string;
  path: string;
  center: { x: number; y: number };
}

interface InteractiveBodyMapProps {
  entries?: PainEntry[];
  selectedRegions?: string[];
  onRegionSelect?: (regions: string[]) => void;
  mode?: 'selection' | 'heatmap';
  className?: string;
}

// Simplified body regions for SVG mapping
const BODY_REGIONS: BodyRegion[] = [
  { id: 'head', name: 'Head', path: 'M150 50 C170 50, 180 60, 180 80 C180 100, 170 110, 150 110 C130 110, 120 100, 120 80 C120 60, 130 50, 150 50 Z', center: { x: 150, y: 80 } },
  { id: 'neck', name: 'Neck', path: 'M140 110 L160 110 L160 130 L140 130 Z', center: { x: 150, y: 120 } },
  { id: 'left-shoulder', name: 'Left Shoulder', path: 'M90 140 C110 130, 130 140, 140 160 C130 170, 110 170, 90 160 Z', center: { x: 115, y: 150 } },
  { id: 'right-shoulder', name: 'Right Shoulder', path: 'M160 160 C170 140, 190 130, 210 140 L210 160 C190 170, 170 170, 160 160 Z', center: { x: 185, y: 150 } },
  { id: 'left-arm', name: 'Left Arm', path: 'M90 160 L110 160 L110 240 L90 240 Z', center: { x: 100, y: 200 } },
  { id: 'right-arm', name: 'Right Arm', path: 'M190 160 L210 160 L210 240 L190 240 Z', center: { x: 200, y: 200 } },
  { id: 'chest', name: 'Chest', path: 'M140 130 L160 130 L180 160 L180 200 L120 200 L120 160 Z', center: { x: 150, y: 165 } },
  { id: 'upper-back', name: 'Upper Back', path: 'M120 130 L180 130 L180 180 L120 180 Z', center: { x: 150, y: 155 } },
  { id: 'abdomen', name: 'Abdomen', path: 'M120 200 L180 200 L180 260 L120 260 Z', center: { x: 150, y: 230 } },
  { id: 'lower-back', name: 'Lower Back', path: 'M120 180 L180 180 L180 260 L120 260 Z', center: { x: 150, y: 220 } },
  { id: 'left-hip', name: 'Left Hip', path: 'M120 260 L140 260 L140 300 L120 300 Z', center: { x: 130, y: 280 } },
  { id: 'right-hip', name: 'Right Hip', path: 'M160 260 L180 260 L180 300 L160 300 Z', center: { x: 170, y: 280 } },
  { id: 'left-thigh', name: 'Left Thigh', path: 'M120 300 L140 300 L140 380 L120 380 Z', center: { x: 130, y: 340 } },
  { id: 'right-thigh', name: 'Right Thigh', path: 'M160 300 L180 300 L180 380 L160 380 Z', center: { x: 170, y: 340 } },
  { id: 'left-knee', name: 'Left Knee', path: 'M120 380 L140 380 L140 400 L120 400 Z', center: { x: 130, y: 390 } },
  { id: 'right-knee', name: 'Right Knee', path: 'M160 380 L180 380 L180 400 L160 400 Z', center: { x: 170, y: 390 } },
  { id: 'left-calf', name: 'Left Calf', path: 'M120 400 L140 400 L140 480 L120 480 Z', center: { x: 130, y: 440 } },
  { id: 'right-calf', name: 'Right Calf', path: 'M160 400 L180 400 L180 480 L160 480 Z', center: { x: 170, y: 440 } },
  { id: 'left-foot', name: 'Left Foot', path: 'M115 480 L145 480 L145 500 L115 500 Z', center: { x: 130, y: 490 } },
  { id: 'right-foot', name: 'Right Foot', path: 'M155 480 L185 480 L185 500 L155 500 Z', center: { x: 170, y: 490 } },
];

export function InteractiveBodyMap({
  entries = [],
  selectedRegions = [],
  onRegionSelect,
  mode = 'selection',
  className = ''
}: InteractiveBodyMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [showFront, setShowFront] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate pain intensity for each region based on entries
  const regionPainMap = useRef(new Map<string, number>());

  useEffect(() => {
    if (mode === 'heatmap' && entries.length > 0) {
      const painMap = new Map<string, { total: number; count: number }>();
      
      entries.forEach(entry => {
        entry.baselineData.locations.forEach(location => {
          const regionId = normalizeLocationToRegionId(location);
          if (regionId && BODY_REGIONS.find(r => r.id === regionId)) {
            if (!painMap.has(regionId)) {
              painMap.set(regionId, { total: 0, count: 0 });
            }
            const data = painMap.get(regionId)!;
            data.total += entry.baselineData.pain;
            data.count += 1;
          }
        });
      });

      regionPainMap.current.clear();
      painMap.forEach((data, regionId) => {
        regionPainMap.current.set(regionId, data.total / data.count);
      });
    }
  }, [entries, mode]);

  const handleRegionClick = (regionId: string) => {
    if (mode === 'selection' && onRegionSelect) {
      const newSelection = selectedRegions.includes(regionId)
        ? selectedRegions.filter(id => id !== regionId)
        : [...selectedRegions, regionId];
      onRegionSelect(newSelection);
    }
  };

  const getRegionColor = (regionId: string): string => {
    if (mode === 'selection') {
      if (selectedRegions.includes(regionId)) {
        return '#ef4444'; // Red for selected
      } else if (hoveredRegion === regionId) {
        return '#3b82f6'; // Blue for hover
      } else {
        return '#e5e7eb'; // Gray for unselected
      }
    } else if (mode === 'heatmap') {
      const painLevel = regionPainMap.current.get(regionId) || 0;
      if (painLevel === 0) return '#e5e7eb';
      
      // Color gradient from green (low pain) to red (high pain)
      const intensity = painLevel / 10; // Normalize to 0-1
      if (intensity < 0.3) return `rgba(34, 197, 94, ${0.3 + intensity * 0.7})`;
      if (intensity < 0.6) return `rgba(251, 191, 36, ${0.3 + intensity * 0.7})`;
      return `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`;
    }
    
    return '#e5e7eb';
  };

  const getRegionOpacity = (regionId: string): number => {
    if (mode === 'heatmap') {
      const painLevel = regionPainMap.current.get(regionId) || 0;
      return painLevel === 0 ? 0.3 : 0.7;
    }
    return hoveredRegion === regionId ? 0.8 : 0.6;
  };

  const getPainLevelForRegion = (regionId: string): number => {
    return regionPainMap.current.get(regionId) || 0;
  };

  return (
    <div className={`interactive-body-map ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Palette className="h-5 w-5" />
          <span className="font-medium">
            {mode === 'selection' ? 'Select Pain Locations' : 'Pain Heat Map'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFront(!showFront)}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{showFront ? 'Show Back' : 'Show Front'}</span>
          </button>
          {mode === 'heatmap' && (
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Info className="h-4 w-4" />
              <span>Color intensity = pain level</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative bg-white rounded-lg border p-4">
        <svg
          ref={svgRef}
          viewBox="0 0 300 520"
          className="w-full max-w-md mx-auto"
          style={{ maxHeight: '600px' }}
        >
          {/* Body outline */}
          <rect
            x="0"
            y="0"
            width="300"
            height="520"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="2"
            rx="10"
          />

          {/* Body regions */}
          {BODY_REGIONS.map((region) => {
            // Filter regions based on front/back view
            const isFrontRegion = !region.id.includes('back');
            if (showFront !== isFrontRegion) return null;

            return (
              <g key={region.id}>
                <path
                  d={region.path}
                  fill={getRegionColor(region.id)}
                  stroke="#374151"
                  strokeWidth="1"
                  opacity={getRegionOpacity(region.id)}
                  className="cursor-pointer transition-all duration-200 hover:stroke-2"
                  onClick={() => handleRegionClick(region.id)}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                />
                
                {/* Region labels */}
                <text
                  x={region.center.x}
                  y={region.center.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-xs font-medium pointer-events-none select-none"
                  fill="#374151"
                >
                  {mode === 'heatmap' && getPainLevelForRegion(region.id) > 0 
                    ? getPainLevelForRegion(region.id).toFixed(1)
                    : ''}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredRegion && (
          <div className="absolute top-4 right-4 bg-black text-white px-3 py-2 rounded-md text-sm pointer-events-none">
            <div className="font-medium">
              {BODY_REGIONS.find(r => r.id === hoveredRegion)?.name}
            </div>
            {mode === 'heatmap' && (
              <div className="text-xs">
                Pain Level: {getPainLevelForRegion(hoveredRegion).toFixed(1)}/10
              </div>
            )}
            {mode === 'selection' && (
              <div className="text-xs">
                Click to {selectedRegions.includes(hoveredRegion) ? 'deselect' : 'select'}
              </div>
            )}
          </div>
        )}

        {/* Legend for heatmap mode */}
        {mode === 'heatmap' && (
          <div className="mt-4 flex justify-center">
            <div className="flex items-center space-x-2 text-sm">
              <span>Low Pain</span>
              <div className="flex space-x-1">
                <div className="w-4 h-4 bg-green-400 rounded"></div>
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <div className="w-4 h-4 bg-red-400 rounded"></div>
              </div>
              <span>High Pain</span>
            </div>
          </div>
        )}

        {/* Selected regions display for selection mode */}
        {mode === 'selection' && selectedRegions.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <div className="text-sm font-medium text-blue-900 mb-2">
              Selected Locations ({selectedRegions.length}):
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedRegions.map(regionId => {
                const region = BODY_REGIONS.find(r => r.id === regionId);
                return (
                  <span
                    key={regionId}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {region?.name}
                    <button
                      onClick={() => handleRegionClick(regionId)}
                      className="ml-1 hover:text-blue-600"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to normalize location strings to region IDs
function normalizeLocationToRegionId(location: string): string | null {
  const lower = location.toLowerCase();
  
  // Map common location names to region IDs
  const locationMap: Record<string, string> = {
    'head': 'head',
    'neck': 'neck',
    'shoulder': 'left-shoulder', // Default to left, could be enhanced
    'left shoulder': 'left-shoulder',
    'right shoulder': 'right-shoulder',
    'arm': 'left-arm',
    'left arm': 'left-arm',
    'right arm': 'right-arm',
    'chest': 'chest',
    'back': 'upper-back',
    'upper back': 'upper-back',
    'lower back': 'lower-back',
    'abdomen': 'abdomen',
    'stomach': 'abdomen',
    'hip': 'left-hip',
    'left hip': 'left-hip',
    'right hip': 'right-hip',
    'thigh': 'left-thigh',
    'left thigh': 'left-thigh',
    'right thigh': 'right-thigh',
    'knee': 'left-knee',
    'left knee': 'left-knee',
    'right knee': 'right-knee',
    'leg': 'left-calf',
    'calf': 'left-calf',
    'left calf': 'left-calf',
    'right calf': 'right-calf',
    'foot': 'left-foot',
    'left foot': 'left-foot',
    'right foot': 'right-foot'
  };

  return locationMap[lower] || null;
}