/**
 * Enhanced Progressive Disclosure for Pain Management
 * Medical information organization with trauma-informed and pain-specific patterns
 */

import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Info, 
  Clock,
  Brain,
  Target,
  Layers,
  Activity,
  Heart,
  Pill,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Stethoscope
} from 'lucide-react';
import { useTraumaInformed } from './TraumaInformedHooks';
import { useCognitiveFog } from './useCognitiveFog';
import { TouchOptimizedButton } from './TraumaInformedUX';
import { CognitiveLoadIndicator } from './CognitiveLoadIndicator';

interface MedicalDisclosureProps {
  title: string;
  level: 'essential' | 'helpful' | 'advanced' | 'expert';
  medicalContext: 'symptoms' | 'treatments' | 'medications' | 'procedures' | 'emergency' | 'daily-care';
  children: React.ReactNode;
  painRelevance?: 'high' | 'medium' | 'low';
  cognitiveLoad?: 'minimal' | 'moderate' | 'high' | 'overwhelming';
  timeToRead?: number;
  prerequisites?: string[];
  actionRequired?: boolean;
  onInteraction?: () => void;
  defaultOpen?: boolean;
}

interface MedicalSectionGroup {
  id: string;
  title: string;
  sections: MedicalDisclosureSection[];
  medicalPriority: number;
  painRelevance: 'high' | 'medium' | 'low';
  userType: 'patient' | 'caregiver' | 'provider' | 'all';
}

interface MedicalDisclosureSection {
  id: string;
  title: string;
  level: 'essential' | 'helpful' | 'advanced' | 'expert';
  medicalContext: 'symptoms' | 'treatments' | 'medications' | 'procedures' | 'emergency' | 'daily-care';
  content: React.ReactNode;
  painRelevance?: 'high' | 'medium' | 'low';
  cognitiveLoad?: 'minimal' | 'moderate' | 'high' | 'overwhelming';
  timeToRead?: number;
  prerequisites?: string[];
  actionRequired?: boolean;
}

const medicalContextConfig = {
  'symptoms': {
    icon: Activity,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Symptoms & Tracking',
    priority: 1,
    description: 'Understanding and tracking your symptoms'
  },
  'emergency': {
    icon: AlertTriangle,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    label: 'Emergency Information',
    priority: 1,
    description: 'Critical emergency information and protocols'
  },
  'treatments': {
    icon: Heart,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Treatments & Therapies',
    priority: 2,
    description: 'Treatment options and therapeutic approaches'
  },
  'medications': {
    icon: Pill,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'Medications',
    priority: 2,
    description: 'Medication information and management'
  },
  'procedures': {
    icon: Stethoscope,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    label: 'Medical Procedures',
    priority: 3,
    description: 'Procedures, tests, and interventions'
  },
  'daily-care': {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Daily Care',
    priority: 2,
    description: 'Daily management and self-care strategies'
  }
};

const levelConfig = {
  essential: {
    icon: Target,
    color: 'text-green-600',
    priority: 1,
    description: 'Essential information you need to know',
    badge: 'Essential'
  },
  helpful: {
    icon: Info,
    color: 'text-blue-600',
    priority: 2,
    description: 'Additional helpful context',
    badge: 'Helpful'
  },
  advanced: {
    icon: Layers,
    color: 'text-purple-600',
    priority: 3,
    description: 'Advanced information for deeper understanding',
    badge: 'Advanced'
  },
  expert: {
    icon: Brain,
    color: 'text-gray-600',
    priority: 4,
    description: 'Comprehensive technical details',
    badge: 'Expert'
  }
};

export function MedicalProgressiveDisclosure({
  title,
  level,
  medicalContext,
  children,
  painRelevance = 'medium',
  cognitiveLoad,
  timeToRead,
  prerequisites = [],
  actionRequired = false,
  onInteraction,
  defaultOpen = false
}: MedicalDisclosureProps) {
  const { preferences } = useTraumaInformed();
  const { hasFog, isSevere } = useCognitiveFog();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [hasBeenOpened, setHasBeenOpened] = useState(defaultOpen);
  const [userInteracted, setUserInteracted] = useState(false);

  const contextConfig = medicalContextConfig[medicalContext];
  const levelInfo = levelConfig[level];
  const ContextIcon = contextConfig.icon;
  const LevelIcon = levelInfo.icon;

  // Auto-hide complex content in simplified mode or cognitive fog
  const shouldShow = !preferences.simplifiedMode || 
    level === 'essential' || 
    (level === 'helpful' && painRelevance === 'high') ||
    (!hasFog || !isSevere);

  // Auto-expand essential emergency information
  useEffect(() => {
    if (medicalContext === 'emergency' && level === 'essential') {
      setIsOpen(true);
      setHasBeenOpened(true);
    }
  }, [medicalContext, level]);

  if (!shouldShow) {
    return null;
  }

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    setUserInteracted(true);
    
    if (newState) {
      setHasBeenOpened(true);
      if (onInteraction) onInteraction();
    }
  };

  // Calculate cognitive load if not provided
  const calculatedCognitiveLoad = cognitiveLoad || calculateMedicalCognitiveLoad(
    level, 
    medicalContext, 
    timeToRead || 3
  );

  return (
    <div className={`
      medical-disclosure rounded-lg border transition-all duration-200
      ${contextConfig.bgColor} ${contextConfig.borderColor}
      ${actionRequired ? 'ring-2 ring-yellow-300' : ''}
    `}>
      <MedicalDisclosureHeader
        title={title}
        level={level}
        medicalContext={medicalContext}
        painRelevance={painRelevance}
        isOpen={isOpen}
        onToggle={handleToggle}
        contextIcon={<ContextIcon className={`w-5 h-5 ${contextConfig.color}`} />}
        levelIcon={<LevelIcon className={`w-4 h-4 ${levelInfo.color}`} />}
        timeToRead={timeToRead}
        prerequisites={prerequisites}
        actionRequired={actionRequired}
        userInteracted={userInteracted}
      />
      
      {isOpen && (
        <div className="p-4 pt-0">
          {/* Cognitive Load Warning */}
          {hasBeenOpened && calculatedCognitiveLoad !== 'minimal' && (
            <div className="mb-4">
              <CognitiveLoadIndicator
                level={calculatedCognitiveLoad}
                description={`This ${level} medical information has ${calculatedCognitiveLoad} cognitive complexity`}
                showSuggestions={true}
              />
            </div>
          )}

          {/* Prerequisites Check */}
          {prerequisites.length > 0 && (
            <MedicalPrerequisites prerequisites={prerequisites} />
          )}

          {/* Main Content */}
          <div className="medical-disclosure-content">
            {children}
          </div>

          {/* Action Required Indicator */}
          {actionRequired && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Action Required: Please review this information with your healthcare provider
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Medical disclosure header
function MedicalDisclosureHeader({
  title,
  level,
  medicalContext,
  painRelevance,
  isOpen,
  onToggle,
  contextIcon,
  levelIcon,
  timeToRead,
  prerequisites,
  actionRequired,
  userInteracted
}: {
  title: string;
  level: string;
  medicalContext: string;
  painRelevance: string;
  isOpen: boolean;
  onToggle: () => void;
  contextIcon: React.ReactNode;
  levelIcon: React.ReactNode;
  timeToRead?: number;
  prerequisites: string[];
  actionRequired: boolean;
  userInteracted: boolean;
}) {
  const contextConfig = medicalContextConfig[medicalContext as keyof typeof medicalContextConfig];

  return (
    <TouchOptimizedButton
      variant="secondary"
      onClick={onToggle}
      className="w-full p-4 text-left bg-transparent hover:bg-white/50 border-0 rounded-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {contextIcon}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900 flex-1">
                {title}
              </h3>
              
              <div className="flex items-center space-x-1">
                {/* Pain Relevance Indicator */}
                <PainRelevanceBadge relevance={painRelevance} />
                
                {/* Level Badge */}
                <MedicalLevelBadge level={level} />
                
                {/* Action Required Badge */}
                {actionRequired && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Action Required
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">
              {contextConfig.description}
            </p>
            
            <MedicalDisclosureMetadata 
              timeToRead={timeToRead}
              prerequisites={prerequisites}
              userInteracted={userInteracted}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-3">
          {levelIcon}
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
    </TouchOptimizedButton>
  );
}

// Pain relevance badge
function PainRelevanceBadge({ relevance }: { relevance: string }) {
  const colors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
      ${colors[relevance as keyof typeof colors]}
    `}>
      Pain: {relevance}
    </span>
  );
}

// Medical level badge
function MedicalLevelBadge({ level }: { level: string }) {
  const levelInfo = levelConfig[level as keyof typeof levelConfig];
  
  return (
    <span className={`
      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
      bg-white border ${levelInfo.color}
    `}>
      {levelInfo.badge}
    </span>
  );
}

// Medical disclosure metadata
function MedicalDisclosureMetadata({
  timeToRead,
  prerequisites,
  userInteracted
}: {
  timeToRead?: number;
  prerequisites: string[];
  userInteracted: boolean;
}) {
  if (!timeToRead && prerequisites.length === 0 && !userInteracted) {
    return null;
  }
  
  return (
    <div className="flex items-center space-x-4 text-xs text-gray-500">
      {timeToRead && (
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{timeToRead} min read</span>
        </div>
      )}
      
      {prerequisites.length > 0 && (
        <div className="flex items-center space-x-1">
          <FileText className="w-3 h-3" />
          <span>{prerequisites.length} prerequisite{prerequisites.length > 1 ? 's' : ''}</span>
        </div>
      )}

      {userInteracted && (
        <div className="flex items-center space-x-1">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span className="text-green-600">Reviewed</span>
        </div>
      )}
    </div>
  );
}

// Prerequisites display
function MedicalPrerequisites({ prerequisites }: { prerequisites: string[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-800">
          📚 Before reading this section
        </span>
        {prerequisites.length > 2 && (
          <TouchOptimizedButton
            variant="secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600"
          >
            {isExpanded ? 'Less' : 'More'}
          </TouchOptimizedButton>
        )}
      </div>
      
      <div className="space-y-1 text-sm text-blue-700">
        {(isExpanded ? prerequisites : prerequisites.slice(0, 2)).map((prerequisite, index) => (
          <div key={index} className="flex items-start space-x-2">
            <span className="text-blue-400 mt-1">•</span>
            <span>{prerequisite}</span>
          </div>
        ))}
        
        {!isExpanded && prerequisites.length > 2 && (
          <div className="text-xs text-blue-600">
            +{prerequisites.length - 2} more prerequisites
          </div>
        )}
      </div>
    </div>
  );
}

// Organized medical sections with smart grouping
export function OrganizedMedicalSections({
  groups,
  userType = 'patient',
  currentPainLevel = 0
}: {
  groups: MedicalSectionGroup[];
  userType?: 'patient' | 'caregiver' | 'provider' | 'all';
  currentPainLevel?: number;
}) {
  const { preferences } = useTraumaInformed();
  const { hasFog } = useCognitiveFog();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  // Filter and sort groups based on user type, pain level, and preferences
  const relevantGroups = groups
    .filter(group => group.userType === 'all' || group.userType === userType)
    .sort((a, b) => {
      // Prioritize by pain relevance if user has high pain
      if (currentPainLevel >= 7) {
        if (a.painRelevance === 'high' && b.painRelevance !== 'high') return -1;
        if (b.painRelevance === 'high' && a.painRelevance !== 'high') return 1;
      }
      
      // Then by medical priority
      return a.medicalPriority - b.medicalPriority;
    });

  // Auto-open high priority groups for users with cognitive fog
  useEffect(() => {
    if (hasFog) {
      const highPriorityGroups = relevantGroups
        .filter(group => group.medicalPriority === 1)
        .map(group => group.id);
      setOpenGroups(new Set(highPriorityGroups));
    }
  }, [hasFog, relevantGroups]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      {/* User Context Indicator */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-gray-600" />
          <div>
            <h3 className="font-medium text-gray-800">
              Information organized for: {userType === 'patient' ? 'Patients' : userType === 'caregiver' ? 'Caregivers' : userType === 'provider' ? 'Healthcare Providers' : 'Everyone'}
            </h3>
            <p className="text-sm text-gray-600">
              Sections prioritized by relevance and current pain level ({currentPainLevel}/10)
            </p>
          </div>
        </div>
      </div>

      {/* Medical Section Groups */}
      {relevantGroups.map((group) => (
        <div key={group.id} className="medical-section-group">
          <MedicalGroupHeader
            group={group}
            isOpen={openGroups.has(group.id)}
            onToggle={() => toggleGroup(group.id)}
            currentPainLevel={currentPainLevel}
          />
          
          {openGroups.has(group.id) && (
            <div className="mt-4 space-y-4">
              {group.sections
                .filter(section => {
                  // Filter based on simplified mode
                  if (preferences.simplifiedMode) {
                    return section.level === 'essential' || 
                           (section.level === 'helpful' && section.painRelevance === 'high');
                  }
                  return true;
                })
                .map((section) => (
                  <MedicalProgressiveDisclosure
                    key={section.id}
                    title={section.title}
                    level={section.level}
                    medicalContext={section.medicalContext}
                    painRelevance={section.painRelevance}
                    cognitiveLoad={section.cognitiveLoad}
                    timeToRead={section.timeToRead}
                    prerequisites={section.prerequisites}
                    actionRequired={section.actionRequired}
                  >
                    {section.content}
                  </MedicalProgressiveDisclosure>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Medical group header
function MedicalGroupHeader({
  group,
  isOpen,
  onToggle,
  currentPainLevel
}: {
  group: MedicalSectionGroup;
  isOpen: boolean;
  onToggle: () => void;
  currentPainLevel: number;
}) {
  const isHighPriority = group.medicalPriority === 1 || 
    (currentPainLevel >= 7 && group.painRelevance === 'high');

  return (
    <TouchOptimizedButton
      variant="secondary"
      onClick={onToggle}
      className={`
        w-full p-4 text-left border-2 rounded-lg transition-all
        ${isHighPriority ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}
        hover:border-blue-400
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`
            w-3 h-3 rounded-full
            ${isHighPriority ? 'bg-blue-500' : 'bg-gray-400'}
          `} />
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {group.title}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <PainRelevanceBadge relevance={group.painRelevance} />
              {isHighPriority && (
                <span className="text-xs text-blue-600 font-medium">
                  High Priority
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {group.sections.length} section{group.sections.length > 1 ? 's' : ''}
          </span>
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
    </TouchOptimizedButton>
  );
}

// Utility function to calculate cognitive load for medical content
function calculateMedicalCognitiveLoad(
  level: string, 
  medicalContext: string, 
  timeToRead: number
): 'minimal' | 'moderate' | 'high' | 'overwhelming' {
  let score = 0;

  // Level complexity
  if (level === 'expert') score += 3;
  else if (level === 'advanced') score += 2;
  else if (level === 'helpful') score += 1;

  // Medical context complexity
  if (medicalContext === 'procedures' || medicalContext === 'emergency') score += 2;
  else if (medicalContext === 'medications' || medicalContext === 'treatments') score += 1;

  // Reading time
  if (timeToRead > 10) score += 2;
  else if (timeToRead > 5) score += 1;

  // Return appropriate level
  if (score >= 5) return 'overwhelming';
  if (score >= 3) return 'high';
  if (score >= 1) return 'moderate';
  return 'minimal';
}
