/**
 * Enhanced Progressive Disclosure Patterns
 * Advanced components for trauma-informed information revelation
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Info,
  HelpCircle,
  Eye,
  EyeOff,
  Clock,
  Brain,
  Target,
  Layers,
} from 'lucide-react';
import { useTraumaInformed } from './TraumaInformedHooks';
import { TouchOptimizedButton } from './TraumaInformedUX';
import { CognitiveLoadIndicator } from './CognitiveLoadIndicator';

interface ProgressiveDisclosureProps {
  title: string;
  level: 'essential' | 'helpful' | 'advanced' | 'expert';
  children: React.ReactNode;
  memoryAid?: string;
  estimatedTime?: number; // in minutes
  cognitiveLoad?: 'minimal' | 'moderate' | 'high' | 'overwhelming';
  defaultOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  className?: string;
}

const levelConfig = {
  essential: {
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    priority: 1,
    description: 'Core information you need',
  },
  helpful: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    priority: 2,
    description: 'Additional context that may help',
  },
  advanced: {
    icon: Layers,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    priority: 3,
    description: 'Detailed information for deeper understanding',
  },
  expert: {
    icon: Brain,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    priority: 4,
    description: 'Technical details and comprehensive options',
  },
};

export function ProgressiveDisclosure({
  title,
  level,
  children,
  memoryAid,
  estimatedTime,
  cognitiveLoad,
  defaultOpen = false,
  onOpen,
  onClose,
  className = '',
}: ProgressiveDisclosureProps) {
  const { preferences } = useTraumaInformed();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [hasBeenOpened, setHasBeenOpened] = useState(defaultOpen);

  const config = levelConfig[level];
  const Icon = config.icon;

  // Auto-hide advanced content in simplified mode
  const shouldShow = !preferences.simplifiedMode || level === 'essential' || level === 'helpful';

  if (!shouldShow) {
    return null;
  }

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);

    if (newState) {
      setHasBeenOpened(true);
      if (onOpen) onOpen();
    } else {
      if (onClose) onClose();
    }
  };

  return (
    <div
      className={`
      rounded-lg border transition-all duration-200
      ${config.bgColor} ${config.borderColor} ${className}
    `}
    >
      <DisclosureHeader
        title={title}
        level={level}
        isOpen={isOpen}
        onToggle={handleToggle}
        icon={<Icon className={`w-5 h-5 ${config.color}`} />}
        memoryAid={memoryAid}
        estimatedTime={estimatedTime}
        description={config.description}
      />

      {isOpen && (
        <div className="p-4 pt-0">
          {cognitiveLoad && hasBeenOpened && (
            <div className="mb-4">
              <CognitiveLoadIndicator
                level={cognitiveLoad}
                description={`This ${level} section contains complex information`}
              />
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

// Header component for disclosure sections
function DisclosureHeader({
  title,
  level,
  isOpen,
  onToggle,
  icon,
  memoryAid,
  estimatedTime,
  description,
}: {
  title: string;
  level: string;
  isOpen: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  memoryAid?: string;
  estimatedTime?: number;
  description: string;
}) {
  return (
    <TouchOptimizedButton
      variant="secondary"
      onClick={onToggle}
      className="w-full p-4 text-left bg-transparent hover:bg-white/50 border-0 rounded-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {icon}

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
              <DisclosureBadge level={level} />
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{description}</p>

            <DisclosureMetadata memoryAid={memoryAid} estimatedTime={estimatedTime} />
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-3">
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          )}
        </div>
      </div>
    </TouchOptimizedButton>
  );
}

// Badge showing disclosure level
function DisclosureBadge({ level }: { level: string }) {
  const config = levelConfig[level as keyof typeof levelConfig];

  return (
    <span
      className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
      ${config.bgColor} ${config.color}
    `}
    >
      {level}
    </span>
  );
}

// Metadata display for disclosure sections
function DisclosureMetadata({
  memoryAid,
  estimatedTime,
}: {
  memoryAid?: string;
  estimatedTime?: number;
}) {
  if (!memoryAid && !estimatedTime) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
      {estimatedTime && (
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{estimatedTime} min read</span>
        </div>
      )}

      {memoryAid && (
        <div className="flex items-center space-x-1">
          <HelpCircle className="w-3 h-3" />
          <span>{memoryAid}</span>
        </div>
      )}
    </div>
  );
}

// Multi-level progressive disclosure with automatic organization
export function LayeredDisclosure({
  sections,
  title,
  showAllLevels = false,
}: {
  sections: DisclosureSection[];
  title: string;
  showAllLevels?: boolean;
}) {
  const { preferences } = useTraumaInformed();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  // Filter sections based on user preferences
  const visibleSections = sections.filter(section => {
    if (showAllLevels) return true;
    if (preferences.simplifiedMode) {
      return section.level === 'essential' || section.level === 'helpful';
    }
    return true;
  });

  // Sort sections by priority
  const sortedSections = visibleSections.sort(
    (a, b) => levelConfig[a.level].priority - levelConfig[b.level].priority
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
        <LayeredDisclosureControls
          sections={sortedSections}
          openSections={openSections}
          onToggleAll={allOpen => {
            if (allOpen) {
              setOpenSections(new Set(sortedSections.map(s => s.id)));
            } else {
              setOpenSections(new Set());
            }
          }}
        />
      </div>

      {sortedSections.map(section => (
        <ProgressiveDisclosure
          key={section.id}
          title={section.title}
          level={section.level}
          memoryAid={section.memoryAid}
          estimatedTime={section.estimatedTime}
          cognitiveLoad={section.cognitiveLoad}
          defaultOpen={openSections.has(section.id)}
          onOpen={() => setOpenSections(prev => new Set([...prev, section.id]))}
          onClose={() =>
            setOpenSections(prev => {
              const next = new Set(prev);
              next.delete(section.id);
              return next;
            })
          }
        >
          {section.content}
        </ProgressiveDisclosure>
      ))}
    </div>
  );
}

interface DisclosureSection {
  id: string;
  title: string;
  level: 'essential' | 'helpful' | 'advanced' | 'expert';
  content: React.ReactNode;
  memoryAid?: string;
  estimatedTime?: number;
  cognitiveLoad?: 'minimal' | 'moderate' | 'high' | 'overwhelming';
}

// Controls for layered disclosure
function LayeredDisclosureControls({
  sections,
  openSections,
  onToggleAll,
}: {
  sections: DisclosureSection[];
  openSections: Set<string>;
  onToggleAll: (allOpen: boolean) => void;
}) {
  const allOpen = sections.every(s => openSections.has(s.id));
  const someOpen = sections.some(s => openSections.has(s.id));

  return (
    <div className="flex items-center space-x-2">
      <TouchOptimizedButton
        variant="secondary"
        onClick={() => onToggleAll(!allOpen)}
        className="text-sm"
      >
        {allOpen ? (
          <>
            <EyeOff className="w-4 h-4 mr-1" />
            Collapse All
          </>
        ) : (
          <>
            <Eye className="w-4 h-4 mr-1" />
            {someOpen ? 'Show' : 'Expand'} All
          </>
        )}
      </TouchOptimizedButton>
    </div>
  );
}

// Smart disclosure that adapts to user behavior
export function AdaptiveDisclosure({
  children,
  title,
  adaptToUserBehavior = true,
}: {
  children: React.ReactNode;
  title: string;
  adaptToUserBehavior?: boolean;
}) {
  const { preferences } = useTraumaInformed();
  const [userEngagement, setUserEngagement] = useState({
    timeSpent: 0,
    interactionCount: 0,
    lastInteraction: Date.now(),
  });

  useEffect(() => {
    if (!adaptToUserBehavior) return;

    const interval = setInterval(() => {
      setUserEngagement(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [adaptToUserBehavior]);

  // Determine appropriate level based on user behavior and preferences
  const getAdaptiveLevel = (): 'essential' | 'helpful' | 'advanced' | 'expert' => {
    if (preferences.simplifiedMode) return 'essential';

    if (adaptToUserBehavior) {
      const { timeSpent, interactionCount } = userEngagement;

      if (timeSpent > 300 && interactionCount > 10) return 'expert';
      if (timeSpent > 120 && interactionCount > 5) return 'advanced';
      if (timeSpent > 60 || interactionCount > 2) return 'helpful';
    }

    return 'essential';
  };

  const level = getAdaptiveLevel();

  return (
    <ProgressiveDisclosure
      title={title}
      level={level}
      memoryAid={`Adapted to your ${preferences.simplifiedMode ? 'simplified' : 'standard'} preferences`}
      onOpen={() =>
        setUserEngagement(prev => ({
          ...prev,
          interactionCount: prev.interactionCount + 1,
          lastInteraction: Date.now(),
        }))
      }
    >
      {children}
    </ProgressiveDisclosure>
  );
}
