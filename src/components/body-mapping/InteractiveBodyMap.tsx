import { useState, useRef, useMemo, useCallback } from 'react';
import { RotateCcw, Info, Maximize2, ZoomIn, ZoomOut, Download, MapPin, Eye, HelpCircle, Layers } from 'lucide-react';
import { formatNumber } from '../../utils/formatting';
import type { PainEntry } from '../../types';
import { getAllLocations } from '../../types/pain-entry';
import { trackUsageEvent, incrementSessionAction } from '../../utils/usage-tracking';
import { cn } from '../../design-system/utils';
import { locationsToRegions } from './mapping';

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

// Color classes mapping for body region categories - defined outside component to avoid recreation
const CATEGORY_COLOR_CLASSES: Record<string, { bg: string; border: string; text: string }> = {
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-400',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-400',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    text: 'text-orange-700 dark:text-orange-400',
  },
};

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

  // Calculate pain intensity for each region based on entries.
  // Important: this must be computed synchronously so the UI updates immediately after a new entry.
  const regionPainMap = useMemo(() => {
    if (mode !== 'heatmap' || entries.length === 0) {
      return new Map<string, { avg: number; max: number; count: number }>();
    }

    const painMap = new Map<string, { total: number; max: number; count: number }>();

    for (const entry of entries) {
      const locations = getAllLocations(entry);
      if (!locations || locations.length === 0) continue;

      for (const location of locations) {
        const regionIds = normalizeLocationToRegionIds(location);
        for (const regionId of regionIds) {
          if (!BODY_REGIONS.some(r => r.id === regionId)) continue;
          if (!painMap.has(regionId)) {
            painMap.set(regionId, { total: 0, max: 0, count: 0 });
          }
          const data = painMap.get(regionId)!;
          data.total += entry.baselineData.pain;
          data.max = Math.max(data.max, entry.baselineData.pain);
          data.count += 1;
        }
      }
    }

    const result = new Map<string, { avg: number; max: number; count: number }>();
    painMap.forEach((data, regionId) => {
      result.set(regionId, {
        avg: data.total / data.count,
        max: data.max,
        count: data.count,
      });
    });
    return result;
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
        action: isDeselecting ? 'deselected' : 'selected',
        totalSelected: newSelection.length,
      });
      incrementSessionAction();
    }
  }, [mode, onRegionSelect, selectedRegions]);

  const getRegionColor = (regionId: string): string => {
    if (mode === 'selection') {
      if (selectedRegions.includes(regionId)) {
        if (hoveredRegion === regionId) return '#dc2626'; // Deeper red on hover+selected
        return '#f87171'; // Softer rose-red for selected
      } else if (focusedRegion === regionId) {
        return '#818cf8'; // Indigo for keyboard focus
      } else if (hoveredRegion === regionId) {
        return '#93c5fd'; // Light blue for hover
      } else {
        return '#cbd5e1'; // Slate for unselected
      }
    } else if (mode === 'heatmap') {
      const painData = regionPainMap.get(regionId);
      if (!painData || painData.avg === 0) return '#e2e8f0';

      // Perceptually distinct color ramp — always clearly visible
      const intensity = painData.avg / 10;
      if (intensity < 0.2) return '#6ee7b7'; // Emerald-200 (0-2)
      if (intensity < 0.35) return '#34d399'; // Emerald-400 (2-3.5)
      if (intensity < 0.5) return '#fbbf24'; // Amber (3.5-5)
      if (intensity < 0.65) return '#f97316'; // Orange (5-6.5)
      if (intensity < 0.8) return '#ef4444'; // Red (6.5-8)
      return '#b91c1c'; // Deep red (8-10)
    }

    return '#e2e8f0';
  };

  const getRegionStroke = (regionId: string): { color: string; width: string } => {
    if (mode === 'selection') {
      if (selectedRegions.includes(regionId)) {
        return { color: hoveredRegion === regionId ? '#991b1b' : '#dc2626', width: '1.75' };
      }
      if (focusedRegion === regionId) return { color: '#4338ca', width: '2.25' };
      if (hoveredRegion === regionId) return { color: '#1e40af', width: '1.75' };
    } else if (mode === 'heatmap') {
      const painData = regionPainMap.get(regionId);
      if (painData && painData.avg > 0) {
        if (hoveredRegion === regionId) return { color: '#111827', width: '2' };
        return { color: '#6b7280', width: '0.75' };
      }
    }
    return { color: hoveredRegion === regionId ? '#374151' : '#94a3b8', width: hoveredRegion === regionId ? '1.5' : '0.75' };
  };

  const getRegionOpacity = (regionId: string): number => {
    if (mode === 'heatmap') {
      const painData = regionPainMap.get(regionId);
      if (!painData) return 0.18;
      // Perceptually uniform: opacity only varies modestly so color carries meaning
      const frequencyFactor = Math.min(painData.count / 8, 1);
      return 0.72 + frequencyFactor * 0.28;
    }
    if (selectedRegions.includes(regionId)) return 0.92;
    return hoveredRegion === regionId ? 0.88 : 0.72;
  };

  const getPainDataForRegion = (regionId: string) => {
    return regionPainMap.get(regionId) || { avg: 0, max: 0, count: 0 };
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
  const affectedRegionsCount = mode === 'heatmap' ? regionPainMap.size : 0;

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 px-1">
        {/* Title + count */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
            bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
            {mode === 'heatmap'
              ? <Layers className="h-4 w-4 text-white" />
              : <MapPin className="h-4 w-4 text-white" />}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">
              {mode === 'selection' ? 'Select Pain Locations' : 'Pain Heat Map'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              {mode === 'selection'
                ? `${selectedCount} region${selectedCount !== 1 ? 's' : ''} selected`
                : `${affectedRegionsCount} region${affectedRegionsCount !== 1 ? 's' : ''} with recorded pain`}
            </p>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* View Toggle — most prominent */}
          <button
            onClick={() => setShowFront(!showFront)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium text-sm
              bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600
              text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-gray-600
              min-h-[36px]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{showFront ? 'Front' : 'Back'}</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-600 overflow-hidden min-h-[36px]">
            <button
              onClick={handleZoomOut}
              className="px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
            </button>
            <span className="text-xs text-slate-600 dark:text-slate-400 px-1.5 min-w-[2.5rem] text-center tabular-nums" aria-live="polite">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Secondary controls */}
          <div className="flex items-center gap-1">
            {showAccessibilityFeatures && onRequestListView && (
              <button
                onClick={onRequestListView}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs
                  bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600
                  hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors min-h-[36px]"
                aria-label="Switch to accessible list view"
              >
                <Eye className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-slate-600 dark:text-slate-400">List</span>
              </button>
            )}

            {showAccessibilityFeatures && (
              <button
                onClick={() => setShowKeyboardHelp(true)}
                className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600
                  hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Show keyboard shortcuts"
                title="Keyboard shortcuts (?)"
              >
                <HelpCircle className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
              </button>
            )}

            <button
              onClick={exportAsPNG}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600
                hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Export as PNG"
              aria-label="Export as PNG"
            >
              <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600
                hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Toggle Fullscreen"
              aria-label="Toggle fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Compact header for form embedding */}
      {compact && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {mode === 'heatmap'
              ? `${affectedRegionsCount} region${affectedRegionsCount !== 1 ? 's' : ''} with recorded pain`
              : `${selectedCount} location${selectedCount !== 1 ? 's' : ''} selected`}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFront(!showFront)}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={`Switch to ${showFront ? 'back' : 'front'} view`}
            >
              {mode === 'heatmap'
                ? `Flip (${showFront ? 'Front' : 'Back'})`
                : showFront
                  ? 'Front'
                  : 'Back'}
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
      <div className="relative rounded-2xl border border-slate-200 dark:border-gray-700
        bg-gradient-to-b from-slate-50 via-white to-slate-50
        dark:from-gray-900 dark:via-gray-850 dark:to-gray-900
        shadow-[0_2px_16px_0_rgba(0,0,0,0.07)] overflow-hidden">

        <svg
          ref={svgRef}
          viewBox="0 0 300 530"
          className="w-full mx-auto transition-transform duration-300 portrait:max-h-[60vh] block"
          style={{
            maxHeight: compact ? '400px' : `${height}px`,
            maxWidth: compact ? '420px' : '520px',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center top',
          }}
        >
          <defs>
            {/* Gradient fills for body regions */}
            <linearGradient id="regionGradSelected" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <linearGradient id="regionGradHover" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#bfdbfe" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            <linearGradient id="regionGradIdle" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            {/* Silhouette fill */}
            <linearGradient id="silhouetteGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            {/* Drop shadow filter */}
            <filter id="regionShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.12" />
            </filter>
            <filter id="selectedGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Subtle body silhouette background — gives visual grounding */}
          {showFront ? (
            <path
              d="M150 33 C163 33,176 43,176 60 C176 72,171 81,163 88
                 L165 110 L178 110 C195 115,215 118,218 130
                 L215 240 L175 240 L170 280
                 C172 295,175 315,175 340
                 L168 370 L172 385 L172 430
                 L168 478 L184 478 L188 510 L162 510
                 L158 478 L142 478 L138 510 L112 510
                 L116 478 L132 478 L128 430
                 L128 385 L132 370 L125 340
                 C125 315,128 295,130 280
                 L125 240 L85 240 L82 130
                 C85 118,105 115,122 110 L137 110
                 L137 88 C129 81,124 72,124 60
                 C124 43,137 33,150 33 Z"
              fill="url(#silhouetteGrad)"
              stroke="#cbd5e1"
              strokeWidth="1"
              opacity="0.55"
            />
          ) : (
            <path
              d="M150 33 C163 33,176 43,176 60 C176 72,171 81,163 88
                 L165 110 L178 110 C195 115,215 118,218 130
                 L215 240 L175 240 L170 280
                 C172 295,175 315,175 340
                 L168 370 L172 385 L172 465
                 L168 478 L184 478 L188 510 L162 510
                 L158 478 L142 478 L138 510 L112 510
                 L116 478 L132 478 L128 465
                 L128 385 L132 370 L125 340
                 C125 315,128 295,130 280
                 L125 240 L85 240 L82 130
                 C85 118,105 115,122 110 L137 110
                 L137 88 C129 81,124 72,124 60
                 C124 43,137 33,150 33 Z"
              fill="url(#silhouetteGrad)"
              stroke="#cbd5e1"
              strokeWidth="1"
              opacity="0.55"
            />
          )}

          {/* Body Regions */}
          {visibleRegions.map(region => {
            const path = showFront ? region.frontPath : region.backPath;
            if (!path) return null;

            const painData = getPainDataForRegion(region.id);
            const isSelected = mode === 'selection' && selectedRegions.includes(region.id);
            const isHovered = hoveredRegion === region.id;
            const isFocused = focusedRegion === region.id;
            const hasPain = mode === 'heatmap' && painData.avg > 0;
            const stroke = getRegionStroke(region.id);

            return (
              <g key={region.id}>
                {/* Selection highlight ring */}
                {(isSelected || (isFocused && mode === 'selection')) && (
                  <path
                    d={path}
                    fill="none"
                    stroke={isFocused ? '#4338ca' : '#dc2626'}
                    strokeWidth="3"
                    opacity="0.35"
                    strokeLinejoin="round"
                  />
                )}

                {/* Heatmap glow for high pain */}
                {hasPain && painData.avg >= 7 && (
                  <path
                    d={path}
                    fill="#ef4444"
                    stroke="none"
                    opacity="0.18"
                    strokeWidth="6"
                    filter="url(#selectedGlow)"
                  />
                )}

                {/* Main region */}
                <path
                  d={path}
                  fill={getRegionColor(region.id)}
                  stroke={stroke.color}
                  strokeWidth={stroke.width}
                  strokeLinejoin="round"
                  opacity={getRegionOpacity(region.id)}
                  style={{ cursor: mode === 'selection' ? 'pointer' : 'default' }}
                  className="transition-all duration-150"
                  onClick={() => handleRegionClick(region.id)}
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  role={mode === 'selection' ? 'button' : undefined}
                  aria-label={mode === 'selection' ? `${region.name}${isSelected ? ' (selected)' : ''}` : region.name}
                  aria-pressed={mode === 'selection' ? isSelected : undefined}
                />

                {/* Pain level badge for heatmap — shown only on hover or high pain */}
                {mode === 'heatmap' && painData.avg > 0 && (isHovered || painData.avg >= 6) && (
                  <>
                    <circle
                      cx={region.center.x}
                      cy={region.center.y}
                      r="7"
                      fill={painData.avg >= 7 ? '#b91c1c' : painData.avg >= 5 ? '#ea580c' : '#ca8a04'}
                      opacity="0.9"
                    />
                    <text
                      x={region.center.x}
                      y={region.center.y + 0.5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="6"
                      fontWeight="700"
                      fill="#ffffff"
                      className="pointer-events-none select-none"
                    >
                      {Math.round(painData.avg)}
                    </text>
                  </>
                )}

                {/* Selection checkmark for selected regions */}
                {isSelected && !isHovered && (
                  <text
                    x={region.center.x}
                    y={region.center.y + 0.5}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="8"
                    fill="#991b1b"
                    className="pointer-events-none select-none"
                    opacity="0.8"
                  >
                    ✓
                  </text>
                )}
              </g>
            );
          })}

          {/* View Label */}
          <text x="150" y="20" textAnchor="middle" fontSize="9" fontWeight="600"
            letterSpacing="1.5" fill="#64748b">
            {showFront ? 'FRONT VIEW' : 'BACK VIEW'}
          </text>
        </svg>

        {/* Tooltip — positioned contextually based on region center */}
        {hoveredRegion && (() => {
          const region = BODY_REGIONS.find(r => r.id === hoveredRegion);
          const painData = getPainDataForRegion(hoveredRegion);
          // Use region center to decide tooltip side (left half → show right, right half → show left)
          const isLeftSide = (region?.center.x ?? 150) < 150;
          return (
            <div
              className={`absolute bottom-4 ${
                isLeftSide ? 'right-4' : 'left-4'
              } bg-gray-900/95 dark:bg-gray-800/95 backdrop-blur-sm text-white
              px-3.5 py-2.5 rounded-xl shadow-2xl pointer-events-none z-10 min-w-[160px] max-w-[220px]
              border border-white/10 text-sm`}
            >
              <div className="font-semibold text-sm mb-1 leading-tight">
                {region?.name}
              </div>
              {mode === 'heatmap' && (
                painData.avg > 0 ? (
                  <div className="space-y-0.5 text-xs">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">Avg</span>
                      <span className="font-semibold tabular-nums">{formatNumber(painData.avg, 1)}/10</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">Max</span>
                      <span className="font-semibold tabular-nums">{painData.max}/10</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-400">Entries</span>
                      <span className="font-semibold tabular-nums">{painData.count}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400">No pain recorded</div>
                )
              )}
              {mode === 'selection' && (
                <div className="text-xs text-gray-400 mt-0.5">
                  {selectedRegions.includes(hoveredRegion) ? '✓ Selected — click to remove' : 'Click to select'}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Legend & Statistics */}
      <div className="mt-6 space-y-4">
        {/* Heatmap Legend */}
        {mode === 'heatmap' && (
          <div className="rounded-xl p-3.5 border border-slate-200 dark:border-gray-700
            bg-white dark:bg-gray-900">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Pain Intensity Scale
              </span>
              <Info className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="relative h-4 rounded-lg overflow-hidden
              bg-gradient-to-r from-emerald-300 via-amber-400 via-60% to-red-700 shadow-inner mb-1.5" />
            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 tabular-nums">
              <span>0</span>
              <span>2</span>
              <span>4</span>
              <span>6</span>
              <span>8</span>
              <span>10</span>
            </div>
            <div className="flex gap-3 mt-2.5 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                <span className="text-slate-500 dark:text-slate-400">Mild (0–4)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <span className="text-slate-500 dark:text-slate-400">Moderate (4–7)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-600"></div>
                <span className="text-slate-500 dark:text-slate-400">Severe (7–10)</span>
              </div>
            </div>
          </div>
        )}

        {/* Selection Mode: Selected Regions */}
        {mode === 'selection' && selectedRegions.length > 0 && (
          <div className="rounded-xl p-3.5 border border-rose-200 dark:border-rose-900/40
            bg-rose-50/50 dark:bg-rose-950/20">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-400">
                Selected Locations ({selectedRegions.length})
              </span>
              <button
                onClick={() => onRegionSelect?.([])}
                className="text-xs text-rose-600 hover:text-rose-800 dark:text-rose-400 dark:hover:text-rose-300
                  font-medium transition-colors px-1.5 py-0.5 rounded hover:bg-rose-100 dark:hover:bg-rose-900/30"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {selectedRegions.map(regionId => {
                const region = BODY_REGIONS.find(r => r.id === regionId);
                const category = region?.category;
                const categoryColors = {
                  upper: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
                  core: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
                  lower: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
                  extremities: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
                };

                return (
                  <span
                    key={regionId}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                      ${categoryColors[category ?? 'core']} transition-all hover:shadow-sm`}
                  >
                    {region?.name}
                    <button
                      onClick={() => handleRegionClick(regionId)}
                      className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 leading-none transition-colors"
                      aria-label={`Remove ${region?.name}`}
                    >
                      <span aria-hidden>×</span>
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Statistics Panel for Heatmap */}
        {mode === 'heatmap' && affectedRegionsCount > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-3 border border-slate-200 dark:border-gray-700
              bg-white dark:bg-gray-900 text-center">
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                {affectedRegionsCount}
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400 mt-0.5">
                Regions
              </div>
            </div>
            <div className="rounded-xl p-3 border border-red-200 dark:border-red-900/40
              bg-red-50/50 dark:bg-red-950/20 text-center">
              <div className="text-xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                {Math.max(...Array.from(regionPainMap.values()).map(d => d.max), 0)}/10
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-red-400 mt-0.5">
                Peak Pain
              </div>
            </div>
            <div className="rounded-xl p-3 border border-amber-200 dark:border-amber-900/40
              bg-amber-50/50 dark:bg-amber-950/20 text-center">
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {formatNumber(
                  Array.from(regionPainMap.values()).reduce((sum, d) => sum + d.avg, 0) /
                    (affectedRegionsCount || 1),
                  1
                )}/10
              </div>
              <div className="text-[10px] font-medium uppercase tracking-wide text-amber-400 mt-0.5">
                Avg Pain
              </div>
            </div>
          </div>
        )}

        {/* Body Region Categories */}
        <div className="rounded-xl p-3 border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
            By Region
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { name: 'Upper', category: 'upper', color: 'purple', icon: '🧠' },
              { name: 'Core', category: 'core', color: 'blue', icon: '🫀' },
              { name: 'Lower', category: 'lower', color: 'green', icon: '🦵' },
              { name: 'Arms', category: 'extremities', color: 'orange', icon: '💪' },
            ].map(({ name, category, color, icon }) => {
              const count =
                mode === 'selection'
                  ? selectedRegions.filter(
                      id => BODY_REGIONS.find(r => r.id === id)?.category === category
                    ).length
                  : Array.from(regionPainMap.entries()).filter(
                      ([id]) => BODY_REGIONS.find(r => r.id === id)?.category === category
                    ).length;

              const classes = CATEGORY_COLOR_CLASSES[color] || CATEGORY_COLOR_CLASSES.blue;

              return (
                <div
                  key={category}
                  className={`${classes.bg} border ${classes.border} rounded-lg p-2 text-center transition-all`}
                >
                  <div className="text-lg mb-0.5 leading-tight">{icon}</div>
                  <div className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-tight">{name}</div>
                  <div className={`text-sm font-bold ${classes.text} mt-0.5 tabular-nums`}>{count}</div>
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
function normalizeLocationToRegionIds(location: string): string[] {
  const lower = location.trim().toLowerCase().replace(/\s+/g, ' ');

  // If the value already matches a known region ID, accept it.
  if (BODY_REGIONS.some(r => r.id === lower)) return [lower];

  // Handle QuickLogStepper-style tags like "Shoulder (L)"
  const sideMatch = lower.match(/^(.*)\s*\((l|r)\)$/);
  if (sideMatch) {
    const base = sideMatch[1].trim();
    const side = sideMatch[2];
    if (base === 'shoulder') return [side === 'l' ? 'left-shoulder' : 'right-shoulder'];
    if (base === 'hip') return [side === 'l' ? 'left-hip' : 'right-hip'];
    if (base === 'knee') return [side === 'l' ? 'left-knee-outer' : 'right-knee-outer'];
  }

  // Map higher-detail checklist labels (and some legacy buckets) to the closest body-map regions.
  // The goal is: heatmap should never appear empty just because a different logging UI was used.
  const multiMap: Record<string, string[]> = {
    // Spine-specific labels
    'cervical spine': ['neck'],
    'thoracic spine': ['upper-back'],
    'lumbar spine': ['lower-back'],

    // Ambiguous areas: paint the whole segment by covering both halves
    'left thigh': ['left-thigh-outer', 'left-thigh-inner'],
    'right thigh': ['right-thigh-outer', 'right-thigh-inner'],
    'left knee': ['left-knee-outer', 'left-knee-inner'],
    'right knee': ['right-knee-outer', 'right-knee-inner'],
    'left shin': ['left-shin-outer', 'left-shin-inner'],
    'right shin': ['right-shin-outer', 'right-shin-inner'],
    'left calf': ['left-calf-outer', 'left-calf-inner'],
    'right calf': ['right-calf-outer', 'right-calf-inner'],

    // Front/back shin tags from detailed checklist
    'left shin front': ['left-shin-outer', 'left-shin-inner'],
    'right shin front': ['right-shin-outer', 'right-shin-inner'],
    'left shin back': ['left-shin-outer', 'left-shin-inner'],
    'right shin back': ['right-shin-outer', 'right-shin-inner'],

    // Medial/lateral wording variants
    'left foot medial': ['left-foot-medial'],
    'right foot medial': ['right-foot-medial'],
    'left foot lateral': ['left-foot-lateral'],
    'right foot lateral': ['right-foot-lateral'],
    'left toes medial': ['left-toes-medial'],
    'right toes medial': ['right-toes-medial'],
    'left toes lateral': ['left-toes-lateral'],
    'right toes lateral': ['right-toes-lateral'],

    // Legacy buckets not represented 1:1 in the body map
    wrists: ['left-hand', 'right-hand'],
    'left wrist': ['left-hand'],
    'right wrist': ['right-hand'],
    feet: ['left-foot-medial', 'left-foot-lateral', 'right-foot-medial', 'right-foot-lateral'],
  };

  const multi = multiMap[lower];
  if (multi) return multi;

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

  const direct = locationMap[lower];
  if (direct) return [direct];

  // Fallback: map canonical stored categories (e.g., "shoulders", "hips") to all matching regions.
  // This keeps heatmap rendering consistent with the selection/list view mapping utilities.
  const categoryRegionIds = locationsToRegions([lower]);
  return categoryRegionIds;
}

