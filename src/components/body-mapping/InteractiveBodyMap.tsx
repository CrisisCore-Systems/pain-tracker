import { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCcw, Info, Maximize2, ZoomIn, ZoomOut, Download, User, Eye, HelpCircle } from 'lucide-react';
import { formatNumber } from '../../utils/formatting';
import type { PainEntry } from '../../types';
import { trackUsageEvent, incrementSessionAction } from '../../utils/usage-tracking';
import { cn } from '../../design-system/utils';

interface BodyRegion {
  id: string;
  name: string;
  frontPath?: string;
  backPath?: string;
  center: { x: number; y: number };
  category: 'upper' | 'core' | 'lower' | 'extremities';
}

interface InteractiveBodyMapProps {
  entries?: PainEntry[];
  selectedRegions?: string[];
  onRegionSelect?: (regions: string[]) => void;
  mode?: 'selection' | 'heatmap';
  className?: string;
  height?: number;
  /** Compact mode for embedding in forms */
  compact?: boolean;
  /** Show accessibility features (list view toggle, keyboard hints) */
  showAccessibilityFeatures?: boolean;
  /** Callback when user requests list view */
  onRequestListView?: () => void;
  /** Label for form association */
  'aria-labelledby'?: string;
  /** Description for form association */
  'aria-describedby'?: string;
}

// Anatomically accurate body regions with improved SVG paths
const BODY_REGIONS: BodyRegion[] = [
  // HEAD & NECK
  {
    id: 'head',
    name: 'Head',
    frontPath:
      'M150 35 C165 35, 175 45, 175 60 C175 70, 172 78, 165 85 C162 88, 158 90, 153 92 L147 92 C142 90, 138 88, 135 85 C128 78, 125 70, 125 60 C125 45, 135 35, 150 35 Z',
    backPath:
      'M150 35 C165 35, 175 45, 175 60 C175 70, 172 78, 165 85 C162 88, 158 90, 153 92 L147 92 C142 90, 138 88, 135 85 C128 78, 125 70, 125 60 C125 45, 135 35, 150 35 Z',
    center: { x: 150, y: 63 },
    category: 'upper',
  },
  {
    id: 'neck',
    name: 'Neck',
    frontPath: 'M142 92 L158 92 L160 110 L140 110 Z',
    backPath: 'M142 92 L158 92 L160 110 L140 110 Z',
    center: { x: 150, y: 101 },
    category: 'upper',
  },

  // SHOULDERS & ARMS
  {
    id: 'left-shoulder',
    name: 'Left Shoulder',
    frontPath: 'M85 115 C95 105, 115 105, 125 110 L130 125 C125 135, 110 140, 95 135 L85 120 Z',
    center: { x: 107, y: 120 },
    category: 'upper',
  },
  {
    id: 'right-shoulder',
    name: 'Right Shoulder',
    frontPath: 'M175 110 C185 105, 205 105, 215 115 L215 120 L205 135 C190 140, 175 135, 170 125 Z',
    center: { x: 193, y: 120 },
    category: 'upper',
  },
  {
    id: 'left-upper-arm',
    name: 'Left Upper Arm',
    frontPath: 'M85 135 L105 140 L107 200 L87 205 Z',
    center: { x: 96, y: 170 },
    category: 'extremities',
  },
  {
    id: 'right-upper-arm',
    name: 'Right Upper Arm',
    frontPath: 'M195 140 L215 135 L213 205 L193 200 Z',
    center: { x: 204, y: 170 },
    category: 'extremities',
  },
  {
    id: 'left-elbow',
    name: 'Left Elbow',
    frontPath: 'M87 205 L107 200 L108 220 L88 225 Z',
    center: { x: 97, y: 212 },
    category: 'extremities',
  },
  {
    id: 'right-elbow',
    name: 'Right Elbow',
    frontPath: 'M193 200 L213 205 L212 225 L192 220 Z',
    center: { x: 203, y: 212 },
    category: 'extremities',
  },
  {
    id: 'left-forearm',
    name: 'Left Forearm',
    frontPath: 'M88 225 L108 220 L110 285 L90 290 Z',
    center: { x: 99, y: 255 },
    category: 'extremities',
  },
  {
    id: 'right-forearm',
    name: 'Right Forearm',
    frontPath: 'M192 220 L212 225 L210 290 L190 285 Z',
    center: { x: 201, y: 255 },
    category: 'extremities',
  },
  {
    id: 'left-hand',
    name: 'Left Hand',
    frontPath: 'M90 290 L110 285 L112 308 L92 312 Z',
    center: { x: 101, y: 298 },
    category: 'extremities',
  },
  {
    id: 'right-hand',
    name: 'Right Hand',
    frontPath: 'M190 285 L210 290 L208 312 L188 308 Z',
    center: { x: 199, y: 298 },
    category: 'extremities',
  },

  // TORSO
  {
    id: 'chest',
    name: 'Chest',
    frontPath: 'M130 110 L170 110 L180 145 L178 180 L122 180 L120 145 Z',
    center: { x: 150, y: 145 },
    category: 'core',
  },
  {
    id: 'upper-back',
    name: 'Upper Back',
    backPath: 'M130 110 L170 110 L178 145 L180 180 L120 180 L122 145 Z',
    center: { x: 150, y: 145 },
    category: 'core',
  },
  {
    id: 'abdomen',
    name: 'Abdomen',
    frontPath: 'M122 180 L178 180 L175 235 L125 235 Z',
    center: { x: 150, y: 207 },
    category: 'core',
  },
  {
    id: 'lower-back',
    name: 'Lower Back',
    backPath: 'M120 180 L180 180 L178 235 L122 235 Z',
    center: { x: 150, y: 207 },
    category: 'core',
  },

  // HIPS & PELVIS
  {
    id: 'left-hip',
    name: 'Left Hip',
    frontPath: 'M125 235 L145 235 L148 275 L128 275 Z',
    backPath: 'M125 235 L145 235 L148 275 L128 275 Z',
    center: { x: 136, y: 255 },
    category: 'core',
  },
  {
    id: 'right-hip',
    name: 'Right Hip',
    frontPath: 'M155 235 L175 235 L172 275 L152 275 Z',
    backPath: 'M155 235 L175 235 L172 275 L152 275 Z',
    center: { x: 164, y: 255 },
    category: 'core',
  },

  // LEGS - Enhanced for nerve pain tracking
  {
    id: 'left-thigh-outer',
    name: 'Left Outer Thigh',
    frontPath: 'M128 275 L137 275 L136 365 L127 365 Z',
    backPath: 'M128 275 L137 275 L136 365 L127 365 Z',
    center: { x: 132, y: 320 },
    category: 'lower',
  },
  {
    id: 'left-thigh-inner',
    name: 'Left Inner Thigh',
    frontPath: 'M137 275 L148 275 L147 365 L136 365 Z',
    backPath: 'M137 275 L148 275 L147 365 L136 365 Z',
    center: { x: 142, y: 320 },
    category: 'lower',
  },
  {
    id: 'right-thigh-inner',
    name: 'Right Inner Thigh',
    frontPath: 'M152 275 L163 275 L164 365 L153 365 Z',
    backPath: 'M152 275 L163 275 L164 365 L153 365 Z',
    center: { x: 158, y: 320 },
    category: 'lower',
  },
  {
    id: 'right-thigh-outer',
    name: 'Right Outer Thigh',
    frontPath: 'M163 275 L172 275 L173 365 L164 365 Z',
    backPath: 'M163 275 L172 275 L173 365 L164 365 Z',
    center: { x: 168, y: 320 },
    category: 'lower',
  },
  {
    id: 'left-knee-outer',
    name: 'Left Outer Knee',
    frontPath: 'M127 365 L137 365 L137 385 L127 385 Z',
    backPath: 'M127 365 L137 365 L137 385 L127 385 Z',
    center: { x: 132, y: 375 },
    category: 'lower',
  },
  {
    id: 'left-knee-inner',
    name: 'Left Inner Knee',
    frontPath: 'M137 365 L147 365 L147 385 L137 385 Z',
    backPath: 'M137 365 L147 365 L147 385 L137 385 Z',
    center: { x: 142, y: 375 },
    category: 'lower',
  },
  {
    id: 'right-knee-inner',
    name: 'Right Inner Knee',
    frontPath: 'M153 365 L163 365 L163 385 L153 385 Z',
    backPath: 'M153 365 L163 365 L163 385 L153 385 Z',
    center: { x: 158, y: 375 },
    category: 'lower',
  },
  {
    id: 'right-knee-outer',
    name: 'Right Outer Knee',
    frontPath: 'M163 365 L173 365 L173 385 L163 385 Z',
    backPath: 'M163 365 L173 365 L173 385 L163 385 Z',
    center: { x: 168, y: 375 },
    category: 'lower',
  },
  {
    id: 'left-shin-outer',
    name: 'Left Outer Shin',
    frontPath: 'M127 385 L137 385 L136 425 L126 425 Z',
    center: { x: 131, y: 405 },
    category: 'lower',
  },
  {
    id: 'left-shin-inner',
    name: 'Left Inner Shin',
    frontPath: 'M137 385 L147 385 L146 425 L136 425 Z',
    center: { x: 141, y: 405 },
    category: 'lower',
  },
  {
    id: 'right-shin-inner',
    name: 'Right Inner Shin',
    frontPath: 'M153 385 L163 385 L164 425 L154 425 Z',
    center: { x: 159, y: 405 },
    category: 'lower',
  },
  {
    id: 'right-shin-outer',
    name: 'Right Outer Shin',
    frontPath: 'M163 385 L173 385 L174 425 L164 425 Z',
    center: { x: 169, y: 405 },
    category: 'lower',
  },
  {
    id: 'left-calf-outer',
    name: 'Left Outer Calf',
    backPath: 'M127 385 L137 385 L136 465 L125 465 Z',
    center: { x: 131, y: 425 },
    category: 'lower',
  },
  {
    id: 'left-calf-inner',
    name: 'Left Inner Calf',
    backPath: 'M137 385 L147 385 L145 465 L136 465 Z',
    center: { x: 141, y: 425 },
    category: 'lower',
  },
  {
    id: 'right-calf-inner',
    name: 'Right Inner Calf',
    backPath: 'M153 385 L163 385 L164 465 L155 465 Z',
    center: { x: 159, y: 425 },
    category: 'lower',
  },
  {
    id: 'right-calf-outer',
    name: 'Right Outer Calf',
    backPath: 'M163 385 L173 385 L175 465 L164 465 Z',
    center: { x: 169, y: 425 },
    category: 'lower',
  },
  {
    id: 'left-ankle',
    name: 'Left Ankle',
    frontPath: 'M125 465 L145 465 L144 478 L124 478 Z',
    backPath: 'M125 465 L145 465 L144 478 L124 478 Z',
    center: { x: 134, y: 471 },
    category: 'lower',
  },
  {
    id: 'right-ankle',
    name: 'Right Ankle',
    frontPath: 'M155 465 L175 465 L176 478 L156 478 Z',
    backPath: 'M155 465 L175 465 L176 478 L156 478 Z',
    center: { x: 166, y: 471 },
    category: 'lower',
  },
  // FEET - Divided into medial (inner) and lateral (outer) for nerve pain
  {
    id: 'left-foot-lateral',
    name: 'Left Foot (Outer/Lateral)',
    frontPath: 'M116 478 L134 478 L135 495 L116 495 Z',
    backPath: 'M116 478 L134 478 L135 495 L116 495 Z',
    center: { x: 125, y: 486 },
    category: 'lower',
  },
  {
    id: 'left-foot-medial',
    name: 'Left Foot (Inner/Medial)',
    frontPath: 'M134 478 L152 478 L152 495 L135 495 Z',
    backPath: 'M134 478 L152 478 L152 495 L135 495 Z',
    center: { x: 143, y: 486 },
    category: 'lower',
  },
  {
    id: 'right-foot-medial',
    name: 'Right Foot (Inner/Medial)',
    frontPath: 'M148 478 L166 478 L165 495 L148 495 Z',
    backPath: 'M148 478 L166 478 L165 495 L148 495 Z',
    center: { x: 157, y: 486 },
    category: 'lower',
  },
  {
    id: 'right-foot-lateral',
    name: 'Right Foot (Outer/Lateral)',
    frontPath: 'M166 478 L184 478 L184 495 L165 495 Z',
    backPath: 'M166 478 L184 478 L184 495 L165 495 Z',
    center: { x: 175, y: 486 },
    category: 'lower',
  },
  // TOES - Divided into halves for detailed nerve pain tracking
  {
    id: 'left-toes-lateral',
    name: 'Left Toes (Outer)',
    frontPath: 'M114 495 L130 495 L128 508 L112 508 Z',
    backPath: 'M114 495 L130 495 L128 508 L112 508 Z',
    center: { x: 121, y: 501 },
    category: 'lower',
  },
  {
    id: 'left-toes-medial',
    name: 'Left Toes (Inner)',
    frontPath: 'M130 495 L148 495 L146 508 L128 508 Z',
    backPath: 'M130 495 L148 495 L146 508 L128 508 Z',
    center: { x: 138, y: 501 },
    category: 'lower',
  },
  {
    id: 'right-toes-medial',
    name: 'Right Toes (Inner)',
    frontPath: 'M152 495 L170 495 L172 508 L154 508 Z',
    backPath: 'M152 495 L170 495 L172 508 L154 508 Z',
    center: { x: 162, y: 501 },
    category: 'lower',
  },
  {
    id: 'right-toes-lateral',
    name: 'Right Toes (Outer)',
    frontPath: 'M170 495 L186 495 L188 508 L172 508 Z',
    backPath: 'M170 495 L186 495 L188 508 L172 508 Z',
    center: { x: 179, y: 501 },
    category: 'lower',
  },
];

export function InteractiveBodyMap({
  entries = [],
  selectedRegions = [],
  onRegionSelect,
  mode = 'selection',
  className = '',
  height = 600,
  compact = false,
  showAccessibilityFeatures = true,
  onRequestListView,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}: InteractiveBodyMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [focusedRegion, setFocusedRegion] = useState<string | null>(null);
  const [showFront, setShowFront] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate pain intensity for each region based on entries
  const regionPainMap = useRef(new Map<string, { avg: number; max: number; count: number }>());

  useEffect(() => {
    if (mode === 'heatmap' && entries.length > 0) {
      const painMap = new Map<string, { total: number; max: number; count: number }>();

      entries.forEach(entry => {
        if (entry.baselineData?.locations) {
          entry.baselineData.locations.forEach(location => {
            const regionId = normalizeLocationToRegionId(location);
            if (regionId && BODY_REGIONS.find(r => r.id === regionId)) {
              if (!painMap.has(regionId)) {
                painMap.set(regionId, { total: 0, max: 0, count: 0 });
              }
              const data = painMap.get(regionId)!;
              data.total += entry.baselineData.pain;
              data.max = Math.max(data.max, entry.baselineData.pain);
              data.count += 1;
            }
          });
        }
      });

      regionPainMap.current.clear();
      painMap.forEach((data, regionId) => {
        regionPainMap.current.set(regionId, {
          avg: data.total / data.count,
          max: data.max,
          count: data.count,
        });
      });
    }
  }, [entries, mode]);

  const handleRegionClick = useCallback((regionId: string) => {
    if (mode === 'selection' && onRegionSelect) {
      const isDeselecting = selectedRegions.includes(regionId);
      const newSelection = isDeselecting
        ? selectedRegions.filter(id => id !== regionId)
        : [...selectedRegions, regionId];
      onRegionSelect(newSelection);

      // Track body map interaction
      trackUsageEvent('body_map_region_clicked', 'body_mapping', {
        region: regionId,
        action: isDeselecting ? 'deselected' : 'selected',
        totalSelected: newSelection.length,
      });
      incrementSessionAction();
    }
  }, [mode, onRegionSelect, selectedRegions]);

  const getRegionColor = (regionId: string): string => {
    if (mode === 'selection') {
      if (selectedRegions.includes(regionId)) {
        return '#ef4444'; // Red for selected
      } else if (hoveredRegion === regionId) {
        return '#60a5fa'; // Blue for hover
      } else {
        return '#e5e7eb'; // Gray for unselected
      }
    } else if (mode === 'heatmap') {
      const painData = regionPainMap.current.get(regionId);
      if (!painData || painData.avg === 0) return '#f3f4f6';

      // Enhanced color gradient based on average pain
      const intensity = painData.avg / 10;
      if (intensity < 0.25) return '#86efac'; // Light green (0-2.5)
      if (intensity < 0.4) return '#4ade80'; // Green (2.5-4)
      if (intensity < 0.6) return '#fbbf24'; // Yellow (4-6)
      if (intensity < 0.75) return '#fb923c'; // Orange (6-7.5)
      return '#ef4444'; // Red (7.5-10)
    }

    return '#e5e7eb';
  };

  const getRegionOpacity = (regionId: string): number => {
    if (mode === 'heatmap') {
      const painData = regionPainMap.current.get(regionId);
      if (!painData) return 0.2;
      // Opacity based on frequency + intensity
      const frequencyFactor = Math.min(painData.count / 10, 1); // More entries = more opaque
      const intensityFactor = painData.avg / 10;
      return 0.3 + frequencyFactor * 0.3 + intensityFactor * 0.4;
    }
    return hoveredRegion === regionId ? 0.9 : 0.7;
  };

  const getPainDataForRegion = (regionId: string) => {
    return regionPainMap.current.get(regionId) || { avg: 0, max: 0, count: 0 };
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.2, 0.5));

  const exportAsPNG = () => {
    if (!svgRef.current) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 300 * 2; // 2x for better quality
      canvas.height = 530 * 2;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `pain-map-${new Date().toISOString().split('T')[0]}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const visibleRegions = BODY_REGIONS.filter(region => {
    if (showFront) {
      return region.frontPath !== undefined;
    } else {
      return region.backPath !== undefined;
    }
  });

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!visibleRegions.length) return;

    const currentIndex = focusedRegion 
      ? visibleRegions.findIndex(r => r.id === focusedRegion)
      : -1;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % visibleRegions.length;
        setFocusedRegion(visibleRegions[nextIndex].id);
        setHoveredRegion(visibleRegions[nextIndex].id);
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        e.preventDefault();
        const prevIndex = currentIndex <= 0 ? visibleRegions.length - 1 : currentIndex - 1;
        setFocusedRegion(visibleRegions[prevIndex].id);
        setHoveredRegion(visibleRegions[prevIndex].id);
        break;
      }
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedRegion) {
          handleRegionClick(focusedRegion);
        }
        break;
      case 'Escape':
        setFocusedRegion(null);
        setHoveredRegion(null);
        break;
      case '?':
        setShowKeyboardHelp(prev => !prev);
        break;
      case 'f':
        if (e.ctrlKey || e.metaKey) return; // Don't interfere with browser search
        setShowFront(prev => !prev);
        break;
    }
  }, [focusedRegion, visibleRegions, handleRegionClick]);

  const selectedCount = selectedRegions.length;
  const affectedRegionsCount = mode === 'heatmap' ? regionPainMap.current.size : 0;

  // Generate live region announcement
  const getLiveAnnouncement = () => {
    if (hoveredRegion) {
      const region = BODY_REGIONS.find(r => r.id === hoveredRegion);
      const isSelected = selectedRegions.includes(hoveredRegion);
      return `${region?.name}. ${isSelected ? 'Selected.' : 'Not selected.'} Press Enter to toggle.`;
    }
    return '';
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'interactive-body-map',
        className,
        isFullscreen && 'fixed inset-0 z-50 bg-white',
        compact && 'p-2'
      )}
      role="application"
      aria-label="Interactive body map for selecting pain locations"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onBlur={() => setFocusedRegion(null)}
    >
      {/* Live region for screen readers */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {getLiveAnnouncement()}
      </div>

      {/* Keyboard help modal */}
      {showKeyboardHelp && showAccessibilityFeatures && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-lg">Keyboard Navigation</h4>
              <button 
                onClick={() => setShowKeyboardHelp(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close help"
              >
                ×
              </button>
            </div>
            <ul className="space-y-2 text-sm">
              <li><kbd className="px-2 py-1 bg-gray-100 rounded">↑↓←→</kbd> Navigate regions</li>
              <li><kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> or <kbd className="px-2 py-1 bg-gray-100 rounded">Space</kbd> Toggle selection</li>
              <li><kbd className="px-2 py-1 bg-gray-100 rounded">F</kbd> Flip front/back view</li>
              <li><kbd className="px-2 py-1 bg-gray-100 rounded">Esc</kbd> Clear focus</li>
              <li><kbd className="px-2 py-1 bg-gray-100 rounded">?</kbd> Toggle this help</li>
            </ul>
          </div>
        </div>
      )}

      {/* Header Controls */}
      {!compact && (
      <div className="flex justify-between items-center mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg border border-blue-200 dark:border-gray-600">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {mode === 'selection' ? 'Select Pain Locations' : 'Pain Heat Map'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mode === 'selection'
                ? `${selectedCount} region${selectedCount !== 1 ? 's' : ''} selected`
                : `${affectedRegionsCount} region${affectedRegionsCount !== 1 ? 's' : ''} with recorded pain`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Accessibility: List view toggle */}
          {showAccessibilityFeatures && onRequestListView && (
            <button
              onClick={onRequestListView}
              className="flex items-center space-x-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              aria-label="Switch to accessible list view"
            >
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">List View</span>
            </button>
          )}

          {/* Keyboard help button */}
          {showAccessibilityFeatures && (
            <button
              onClick={() => setShowKeyboardHelp(true)}
              className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Show keyboard shortcuts"
              title="Keyboard shortcuts (?)"
            >
              <HelpCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-xs text-gray-600 dark:text-gray-400 px-2 min-w-[3rem] text-center" aria-live="polite">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* View Toggle */}
          <button
            onClick={() => setShowFront(!showFront)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:bg-gray-900 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="text-sm font-medium">{showFront ? 'Front' : 'Back'}</span>
          </button>

          {/* Export Button */}
          <button
            onClick={exportAsPNG}
            className="p-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:bg-gray-900 transition-colors"
            title="Export as PNG"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:bg-gray-900 transition-colors"
            title="Toggle Fullscreen"
            aria-label="Toggle fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      )}

      {/* Compact header for form embedding */}
      {compact && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedCount} location{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFront(!showFront)}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={`Switch to ${showFront ? 'back' : 'front'} view`}
            >
              {showFront ? 'Front' : 'Back'}
            </button>
            {onRequestListView && (
              <button
                onClick={onRequestListView}
                className="text-xs px-2 py-1 text-blue-600 hover:underline"
                aria-label="Switch to list view"
              >
                List view
              </button>
            )}
          </div>
        </div>
      )}

      {/* Body Map SVG */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 shadow-lg overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%">
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="gray" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <svg
          ref={svgRef}
          viewBox="0 0 300 530"
          className="w-full mx-auto transition-transform duration-300"
          style={{
            maxHeight: `${height}px`,
            maxWidth: '400px',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center',
          }}
        >
          {/* Background */}
          <rect x="0" y="0" width="300" height="530" fill="#ffffff" rx="15" />

          {/* Body Outline Shadow */}
          <ellipse cx="150" cy="510" rx="40" ry="8" fill="#000000" opacity="0.1" />

          {/* Body Regions */}
          {visibleRegions.map(region => {
            const path = showFront ? region.frontPath : region.backPath;
            if (!path) return null;

            const painData = getPainDataForRegion(region.id);
            const isActive =
              mode === 'selection' ? selectedRegions.includes(region.id) : painData.avg > 0;

            return (
              <g key={region.id}>
                {/* Glow effect for selected/affected regions */}
                {isActive && (
                  <path
                    d={path}
                    fill="none"
                    stroke={mode === 'selection' ? '#ef4444' : '#fbbf24'}
                    strokeWidth="3"
                    opacity="0.4"
                    className="animate-pulse"
                    filter="blur(4px)"
                  />
                )}

                {/* Main region */}
                <path
                  d={path}
                  fill={getRegionColor(region.id)}
                  stroke={hoveredRegion === region.id ? '#1f2937' : '#6b7280'}
                  strokeWidth={hoveredRegion === region.id ? '2' : '1'}
                  opacity={getRegionOpacity(region.id)}
                  className="cursor-pointer transition-all duration-200 hover:brightness-110"
                  onClick={() => handleRegionClick(region.id)}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                />

                {/* Pain level indicator for heatmap */}
                {mode === 'heatmap' && painData.avg > 0 && (
                  <text
                    x={region.center.x}
                    y={region.center.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-xs font-bold pointer-events-none select-none"
                    fill="#ffffff"
                    stroke="#000000"
                    strokeWidth="0.5"
                  >
                    {formatNumber(painData.avg, 1)}
                  </text>
                )}
              </g>
            );
          })}

          {/* View Label */}
          <text x="150" y="20" textAnchor="middle" className="text-sm font-semibold" fill="#4b5563">
            {showFront ? 'FRONT VIEW' : 'BACK VIEW'}
          </text>
        </svg>

        {/* Hover Tooltip */}
        {hoveredRegion && (
          <div className="absolute top-8 right-8 bg-gray-900 dark:bg-gray-100 text-white px-4 py-3 rounded-lg shadow-xl pointer-events-none z-10 min-w-[200px]">
            <div className="font-semibold text-base mb-1">
              {BODY_REGIONS.find(r => r.id === hoveredRegion)?.name}
            </div>
            {mode === 'heatmap' &&
              (() => {
                const painData = getPainDataForRegion(hoveredRegion);
                return painData.avg > 0 ? (
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-300 dark:text-gray-600">Avg Pain:</span>
                      <span className="font-medium">{formatNumber(painData.avg, 1)}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 dark:text-gray-600">Max Pain:</span>
                      <span className="font-medium">{painData.max}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300 dark:text-gray-600">Entries:</span>
                      <span className="font-medium">{painData.count}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 dark:text-gray-500">No pain recorded</div>
                );
              })()}
            {mode === 'selection' && (
              <div className="text-sm text-gray-300 dark:text-gray-600">
                Click to {selectedRegions.includes(hoveredRegion) ? 'deselect' : 'select'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend & Statistics */}
      <div className="mt-6 space-y-4">
        {/* Heatmap Legend */}
        {mode === 'heatmap' && (
          <div className="bg-gradient-to-r from-green-50 via-yellow-50 to-red-50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Pain Intensity Scale
              </span>
              <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="h-8 rounded-lg bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 shadow-inner"></div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
                  <span>0</span>
                  <span>2.5</span>
                  <span>5</span>
                  <span>7.5</span>
                  <span>10</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-gray-600 dark:text-gray-400">Mild (0-4)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-gray-600 dark:text-gray-400">Moderate (4-7)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Severe (7-10)</span>
              </div>
            </div>
          </div>
        )}

        {/* Selection Mode: Selected Regions */}
        {mode === 'selection' && selectedRegions.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <div className="text-sm font-semibold text-blue-900 mb-3">
              Selected Locations ({selectedRegions.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedRegions.map(regionId => {
                const region = BODY_REGIONS.find(r => r.id === regionId);
                const category = region?.category;
                const categoryColors = {
                  upper: 'bg-purple-100 text-purple-800 border-purple-300',
                  core: 'bg-blue-100 text-blue-800 border-blue-300',
                  lower: 'bg-green-100 text-green-800 border-green-300',
                  extremities: 'bg-orange-100 text-orange-800 border-orange-300',
                };

                return (
                  <span
                    key={regionId}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${categoryColors[category || 'core']}`}
                  >
                    {region?.name}
                    <button
                      onClick={() => handleRegionClick(regionId)}
                      className="ml-2 hover:scale-125 transition-transform"
                      title="Remove"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
            <button
              onClick={() => onRegionSelect?.([])}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Statistics Panel for Heatmap */}
        {mode === 'heatmap' && affectedRegionsCount > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Affected Regions
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {affectedRegionsCount}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Highest Pain
              </div>
              <div className="text-2xl font-bold text-red-600">
                {Math.max(...Array.from(regionPainMap.current.values()).map(d => d.max), 0)}/10
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                Avg Pain
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatNumber(
                  Array.from(regionPainMap.current.values()).reduce((sum, d) => sum + d.avg, 0) /
                    (affectedRegionsCount || 1),
                  1
                )}
                /10
              </div>
            </div>
          </div>
        )}

        {/* Body Region Categories */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Body Region Categories
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'Upper Body', category: 'upper', color: 'purple', icon: '🧠' },
              { name: 'Core/Torso', category: 'core', color: 'blue', icon: '🫀' },
              { name: 'Lower Body', category: 'lower', color: 'green', icon: '🦵' },
              { name: 'Arms/Hands', category: 'extremities', color: 'orange', icon: '💪' },
            ].map(({ name, category, color, icon }) => {
              const count =
                mode === 'selection'
                  ? selectedRegions.filter(
                      id => BODY_REGIONS.find(r => r.id === id)?.category === category
                    ).length
                  : Array.from(regionPainMap.current.entries()).filter(
                      ([id]) => BODY_REGIONS.find(r => r.id === id)?.category === category
                    ).length;

              return (
                <div
                  key={category}
                  className={`bg-${color}-50 border border-${color}-200 rounded-md p-2 text-center`}
                >
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">{name}</div>
                  <div className={`text-sm font-bold text-${color}-700 mt-1`}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to normalize location strings to region IDs
function normalizeLocationToRegionId(location: string): string | null {
  const lower = location.toLowerCase();

  // Map common location names to region IDs
  const locationMap: Record<string, string> = {
    head: 'head',
    neck: 'neck',
    shoulder: 'left-shoulder', // Default to left, could be enhanced
    'left shoulder': 'left-shoulder',
    'right shoulder': 'right-shoulder',
    arm: 'left-upper-arm',
    'left arm': 'left-upper-arm',
    'right arm': 'right-upper-arm',
    elbow: 'left-elbow',
    'left elbow': 'left-elbow',
    'right elbow': 'right-elbow',
    forearm: 'left-forearm',
    'left forearm': 'left-forearm',
    'right forearm': 'right-forearm',
    hand: 'left-hand',
    'left hand': 'left-hand',
    'right hand': 'right-hand',
    chest: 'chest',
    back: 'upper-back',
    'upper back': 'upper-back',
    'lower back': 'lower-back',
    abdomen: 'abdomen',
    stomach: 'abdomen',
    hip: 'left-hip',
    'left hip': 'left-hip',
    'right hip': 'right-hip',
    // Thigh regions (inner/outer)
    thigh: 'left-thigh-outer',
    'left thigh': 'left-thigh-outer',
    'right thigh': 'right-thigh-outer',
    'left outer thigh': 'left-thigh-outer',
    'left inner thigh': 'left-thigh-inner',
    'right outer thigh': 'right-thigh-outer',
    'right inner thigh': 'right-thigh-inner',
    'left lateral thigh': 'left-thigh-outer',
    'left medial thigh': 'left-thigh-inner',
    'right lateral thigh': 'right-thigh-outer',
    'right medial thigh': 'right-thigh-inner',
    // Knee regions (inner/outer)
    knee: 'left-knee-outer',
    'left knee': 'left-knee-outer',
    'right knee': 'right-knee-outer',
    'left outer knee': 'left-knee-outer',
    'left inner knee': 'left-knee-inner',
    'right outer knee': 'right-knee-outer',
    'right inner knee': 'right-knee-inner',
    'left lateral knee': 'left-knee-outer',
    'left medial knee': 'left-knee-inner',
    'right lateral knee': 'right-knee-outer',
    'right medial knee': 'right-knee-inner',
    // Shin regions (front view)
    shin: 'left-shin-outer',
    'left shin': 'left-shin-outer',
    'right shin': 'right-shin-outer',
    'left outer shin': 'left-shin-outer',
    'left inner shin': 'left-shin-inner',
    'right outer shin': 'right-shin-outer',
    'right inner shin': 'right-shin-inner',
    // Calf regions (back view)
    leg: 'left-calf-outer',
    calf: 'left-calf-outer',
    'left calf': 'left-calf-outer',
    'right calf': 'right-calf-outer',
    'left outer calf': 'left-calf-outer',
    'left inner calf': 'left-calf-inner',
    'right outer calf': 'right-calf-outer',
    'right inner calf': 'right-calf-inner',
    // Ankle
    ankle: 'left-ankle',
    'left ankle': 'left-ankle',
    'right ankle': 'right-ankle',
    // Foot regions (medial/lateral)
    foot: 'left-foot-lateral',
    'left foot': 'left-foot-lateral',
    'right foot': 'right-foot-lateral',
    'left outer foot': 'left-foot-lateral',
    'left inner foot': 'left-foot-medial',
    'right outer foot': 'right-foot-lateral',
    'right inner foot': 'right-foot-medial',
    'left lateral foot': 'left-foot-lateral',
    'left medial foot': 'left-foot-medial',
    'right lateral foot': 'right-foot-lateral',
    'right medial foot': 'right-foot-medial',
    // Toe regions (medial/lateral halves)
    toes: 'left-toes-lateral',
    'left toes': 'left-toes-lateral',
    'right toes': 'right-toes-lateral',
    'left outer toes': 'left-toes-lateral',
    'left inner toes': 'left-toes-medial',
    'right outer toes': 'right-toes-lateral',
    'right inner toes': 'right-toes-medial',
    'left lateral toes': 'left-toes-lateral',
    'left medial toes': 'left-toes-medial',
    'right lateral toes': 'right-toes-lateral',
    'right medial toes': 'right-toes-medial',
    // Individual toe references (map to halves)
    'left big toe': 'left-toes-medial',
    'left great toe': 'left-toes-medial',
    'left little toe': 'left-toes-lateral',
    'left pinky toe': 'left-toes-lateral',
    'right big toe': 'right-toes-medial',
    'right great toe': 'right-toes-medial',
    'right little toe': 'right-toes-lateral',
    'right pinky toe': 'right-toes-lateral',
  };

  return locationMap[lower] || null;
}
