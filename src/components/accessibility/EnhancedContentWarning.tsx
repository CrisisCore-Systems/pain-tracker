/**
 * Enhanced Content Warning System for Pain Management
 * Improved trigger detection and management specifically for pain-related content
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Shield,
  X,
  ChevronDown,
  ChevronRight,
  Settings,
  Heart,
  Brain,
  Activity,
  Pill,
} from 'lucide-react';
import { useTraumaInformed } from './TraumaInformedHooks';
import { TouchOptimizedButton } from './TraumaInformedUX';

interface EnhancedContentWarningProps {
  level: 'mild' | 'moderate' | 'severe';
  triggerTypes: PainTriggerType[];
  title?: string;
  description?: string;
  children: React.ReactNode;
  onProceed?: () => void;
  onSkip?: () => void;
  autoAnalyze?: boolean;
  customContext?: string;
  allowCustomization?: boolean;
}

interface PainTriggerType {
  category:
    | 'pain-descriptions'
    | 'medical-procedures'
    | 'mental-health'
    | 'disability'
    | 'medication'
    | 'emergency';
  subcategory?: string;
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  alternativeApproach?: string;
}

interface TriggerAnalysisResult {
  triggers: PainTriggerType[];
  overallSeverity: 'mild' | 'moderate' | 'severe';
  recommendations: string[];
  safetyTips: string[];
}

const painTriggerCategories = {
  'pain-descriptions': {
    icon: Activity,
    color: 'text-red-600',
    label: 'Pain Descriptions',
    subcategories: [
      'severe-pain',
      'chronic-pain',
      'acute-pain',
      'breakthrough-pain',
      'pain-scales',
      'pain-flares',
      'pain-crisis',
    ],
  },
  'medical-procedures': {
    icon: Heart,
    color: 'text-blue-600',
    label: 'Medical Procedures',
    subcategories: [
      'surgery',
      'injections',
      'diagnostics',
      'emergency-procedures',
      'invasive-treatments',
      'hospital-stays',
    ],
  },
  'mental-health': {
    icon: Brain,
    color: 'text-purple-600',
    label: 'Mental Health',
    subcategories: [
      'depression',
      'anxiety',
      'trauma',
      'suicidal-thoughts',
      'self-harm',
      'emotional-distress',
    ],
  },
  disability: {
    icon: Shield,
    color: 'text-green-600',
    label: 'Disability & Accessibility',
    subcategories: [
      'mobility-loss',
      'cognitive-impairment',
      'daily-living-challenges',
      'accessibility-barriers',
      'independence-loss',
    ],
  },
  medication: {
    icon: Pill,
    color: 'text-orange-600',
    label: 'Medication',
    subcategories: [
      'side-effects',
      'addiction-concerns',
      'withdrawal',
      'drug-interactions',
      'dosage-changes',
      'medication-failures',
    ],
  },
  emergency: {
    icon: AlertTriangle,
    color: 'text-red-600',
    label: 'Emergency Situations',
    subcategories: ['emergency-rooms', 'hospitalization', 'life-threatening', 'crisis-situations'],
  },
};

const warningLevelConfig = {
  mild: {
    icon: Eye,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    message: 'This content discusses pain-related topics that some may find difficult',
  },
  moderate: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    message: 'This content contains potentially distressing pain-related information',
  },
  severe: {
    icon: Shield,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    message:
      'This content contains sensitive material about pain, medical procedures, or trauma that may be triggering',
  },
};

export function EnhancedContentWarning({
  level,
  triggerTypes,
  title = 'Content Warning',
  description,
  children,
  onProceed,
  onSkip,
  autoAnalyze = false,
  customContext = '',
  allowCustomization = true,
}: EnhancedContentWarningProps) {
  const { preferences, updatePreferences } = useTraumaInformed();
  const [isVisible, setIsVisible] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const config = warningLevelConfig[level];
  const Icon = config.icon;

  // Auto-analyze content if requested
  const analysisResult = autoAnalyze
    ? analyzePainContent(customContext, triggerTypes)
    : { triggers: triggerTypes, overallSeverity: level, recommendations: [], safetyTips: [] };

  // Check user preferences for this warning level
  if (!preferences.enableContentWarnings) {
    return <>{children}</>;
  }

  if (level === 'mild' && preferences.contentWarningLevel === 'minimal') {
    return <>{children}</>;
  }

  if (!isVisible || showContent) {
    return showContent ? (
      <div className="space-y-4">
        <ContentWarningReminder
          level={level}
          onHide={() => setShowContent(false)}
          triggers={analysisResult.triggers}
        />
        {children}
      </div>
    ) : (
      <>{children}</>
    );
  }

  const handleProceed = () => {
    setShowContent(true);
    if (onProceed) onProceed();
  };

  const handleSkip = () => {
    setIsVisible(false);
    if (onSkip) onSkip();
  };

  return (
    <div
      className={`
      rounded-lg border-2 p-6 transition-all duration-200
      ${config.bgColor} ${config.borderColor}
    `}
    >
      <div className="flex items-start space-x-4">
        <Icon className={`w-6 h-6 mt-1 flex-shrink-0 ${config.color}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-lg font-semibold ${config.color}`}>{title}</h3>

            <div className="flex items-center space-x-2">
              {allowCustomization && (
                <TouchOptimizedButton
                  variant="secondary"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Settings
                </TouchOptimizedButton>
              )}

              <TouchOptimizedButton
                variant="secondary"
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-400"
                aria-label="Dismiss warning"
              >
                <X className="w-4 h-4" />
              </TouchOptimizedButton>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-4">{description || config.message}</p>

          {/* Enhanced Trigger Display */}
          <EnhancedTriggerDisplay triggers={analysisResult.triggers} />

          {/* Safety Recommendations */}
          {analysisResult.recommendations.length > 0 && (
            <SafetyRecommendations
              recommendations={analysisResult.recommendations}
              safetyTips={analysisResult.safetyTips}
            />
          )}

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap gap-3">
              <TouchOptimizedButton
                variant="primary"
                onClick={handleProceed}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />I Understand, Continue
              </TouchOptimizedButton>

              <TouchOptimizedButton variant="secondary" onClick={handleSkip}>
                <EyeOff className="w-4 h-4 mr-2" />
                Skip This Section
              </TouchOptimizedButton>

              {level === 'severe' && (
                <TouchOptimizedButton
                  variant="secondary"
                  onClick={() => {
                    /* Implement support resources */
                  }}
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Get Support First
                </TouchOptimizedButton>
              )}
            </div>

            {/* Advanced Settings */}
            {showAdvanced && allowCustomization && (
              <AdvancedWarningSettings
                currentLevel={level}
                onUpdatePreferences={updatePreferences}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced trigger display with categorization
function EnhancedTriggerDisplay({ triggers }: { triggers: PainTriggerType[] }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (triggers.length === 0) return null;

  const groupedTriggers = triggers.reduce(
    (acc, trigger) => {
      if (!acc[trigger.category]) {
        acc[trigger.category] = [];
      }
      acc[trigger.category].push(trigger);
      return acc;
    },
    {} as Record<string, PainTriggerType[]>
  );

  const displayCategories = isExpanded
    ? Object.keys(groupedTriggers)
    : Object.keys(groupedTriggers).slice(0, 3);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Content includes:
        </span>
        {Object.keys(groupedTriggers).length > 3 && (
          <TouchOptimizedButton
            variant="secondary"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="w-3 h-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronRight className="w-3 h-3 mr-1" />+{Object.keys(groupedTriggers).length - 3}{' '}
                more categories
              </>
            )}
          </TouchOptimizedButton>
        )}
      </div>

      <div className="space-y-3">
        {displayCategories.map(category => {
          const categoryConfig =
            painTriggerCategories[category as keyof typeof painTriggerCategories];
          const CategoryIcon = categoryConfig.icon;
          const categoryTriggers = groupedTriggers[category];

          return (
            <div key={category} className="flex items-start space-x-3">
              <CategoryIcon className={`w-4 h-4 mt-0.5 ${categoryConfig.color}`} />
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-800 dark:text-gray-200 mb-1">
                  {categoryConfig.label}
                </div>
                <div className="flex flex-wrap gap-1">
                  {categoryTriggers.map((trigger, index) => (
                    <span
                      key={index}
                      className={`
                        px-2 py-1 text-xs rounded-md
                        ${
                          trigger.severity === 'severe'
                            ? 'bg-red-100 text-red-700'
                            : trigger.severity === 'moderate'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }
                      `}
                    >
                      {trigger.description}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Safety recommendations display
function SafetyRecommendations({
  recommendations,
  safetyTips,
}: {
  recommendations: string[];
  safetyTips: string[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (recommendations.length === 0 && safetyTips.length === 0) return null;

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-800">💡 Safety Recommendations</span>
        <TouchOptimizedButton
          variant="secondary"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue-600"
        >
          {isExpanded ? 'Hide' : 'Show'}
        </TouchOptimizedButton>
      </div>

      {isExpanded && (
        <div className="space-y-2 text-sm text-blue-700">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>{rec}</span>
            </div>
          ))}

          {safetyTips.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="font-medium mb-2">Safety Tips:</div>
              {safetyTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Advanced warning settings
function AdvancedWarningSettings({
  currentLevel,
  onUpdatePreferences,
}: {
  currentLevel: 'mild' | 'moderate' | 'severe';
  onUpdatePreferences: (updates: {
    contentWarningLevel?: 'minimal' | 'standard' | 'comprehensive';
    hideDistressingContent?: boolean;
  }) => void;
}) {
  const [customTriggers, setCustomTriggers] = useState<string>('');

  return (
    <div className="border-t pt-4 mt-4 space-y-3">
      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">Warning Preferences</h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="warningLevel"
              value="minimal"
              onChange={e =>
                onUpdatePreferences({
                  contentWarningLevel: e.target.value as 'minimal' | 'standard' | 'comprehensive',
                })
              }
              className="w-4 h-4 text-blue-600"
            />
            <span>Minimal warnings</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="warningLevel"
              value="standard"
              defaultChecked
              onChange={e =>
                onUpdatePreferences({
                  contentWarningLevel: e.target.value as 'minimal' | 'standard' | 'comprehensive',
                })
              }
              className="w-4 h-4 text-blue-600"
            />
            <span>Standard warnings</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="warningLevel"
              value="comprehensive"
              onChange={e =>
                onUpdatePreferences({
                  contentWarningLevel: e.target.value as 'minimal' | 'standard' | 'comprehensive',
                })
              }
              className="w-4 h-4 text-blue-600"
            />
            <span>Comprehensive warnings</span>
          </label>
        </div>

        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              onChange={e => onUpdatePreferences({ hideDistressingContent: e.target.checked })}
              className="w-4 h-4 text-blue-600"
            />
            <span>Auto-hide distressing content</span>
          </label>

          {currentLevel === 'mild' && (
            <TouchOptimizedButton
              variant="secondary"
              onClick={() =>
                onUpdatePreferences({
                  contentWarningLevel: 'minimal',
                })
              }
              className="text-xs w-full justify-start"
            >
              Don't warn for mild content like this
            </TouchOptimizedButton>
          )}
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Custom trigger words (optional):
        </label>
        <input
          type="text"
          value={customTriggers}
          onChange={e => setCustomTriggers(e.target.value)}
          placeholder="Add personal trigger words, separated by commas"
          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md"
        />
      </div>
    </div>
  );
}

// Content warning reminder banner
function ContentWarningReminder({
  level,
  onHide,
  triggers,
}: {
  level: 'mild' | 'moderate' | 'severe';
  onHide: () => void;
  triggers: PainTriggerType[];
}) {
  const config = warningLevelConfig[level];

  return (
    <div
      className={`
      rounded-md border px-4 py-3 flex items-center justify-between
      ${config.bgColor} ${config.borderColor}
    `}
    >
      <div className="flex items-center space-x-3">
        <Shield className={`w-4 h-4 ${config.color}`} />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Content warning acknowledged - {triggers.length} trigger{triggers.length !== 1 ? 's' : ''}{' '}
          present
        </span>
      </div>

      <TouchOptimizedButton variant="secondary" onClick={onHide} className="text-xs">
        <EyeOff className="w-3 h-3 mr-1" />
        Hide Content
      </TouchOptimizedButton>
    </div>
  );
}

// Enhanced content analysis function
function analyzePainContent(
  text: string,
  existingTriggers: PainTriggerType[]
): TriggerAnalysisResult {
  const triggers = [...existingTriggers];
  const recommendations: string[] = [];
  const safetyTips: string[] = [];
  let severityScore = 0;

  const textLower = text.toLowerCase();

  // Pain-specific trigger detection
  const painKeywords = {
    'severe pain': {
      severity: 3,
      category: 'pain-descriptions' as const,
      description: 'Severe pain descriptions',
    },
    'chronic pain': {
      severity: 2,
      category: 'pain-descriptions' as const,
      description: 'Chronic pain discussions',
    },
    'pain crisis': {
      severity: 3,
      category: 'pain-descriptions' as const,
      description: 'Pain crisis situations',
    },
    'breakthrough pain': {
      severity: 2,
      category: 'pain-descriptions' as const,
      description: 'Breakthrough pain',
    },
    surgery: {
      severity: 2,
      category: 'medical-procedures' as const,
      description: 'Surgical procedures',
    },
    'emergency room': {
      severity: 3,
      category: 'emergency' as const,
      description: 'Emergency situations',
    },
    'medication withdrawal': {
      severity: 3,
      category: 'medication' as const,
      description: 'Withdrawal experiences',
    },
    disability: {
      severity: 2,
      category: 'disability' as const,
      description: 'Disability discussions',
    },
    depression: {
      severity: 2,
      category: 'mental-health' as const,
      description: 'Depression topics',
    },
    suicidal: { severity: 3, category: 'mental-health' as const, description: 'Suicidal thoughts' },
  };

  // Detect triggers
  Object.entries(painKeywords).forEach(([keyword, config]) => {
    if (textLower.includes(keyword)) {
      triggers.push({
        category: config.category,
        severity: config.severity >= 3 ? 'severe' : config.severity >= 2 ? 'moderate' : 'mild',
        description: config.description,
      });
      severityScore += config.severity;
    }
  });

  // Generate recommendations based on detected triggers
  if (triggers.some(t => t.category === 'pain-descriptions' && t.severity === 'severe')) {
    recommendations.push('Consider having support available while reading this content');
    safetyTips.push('Take breaks if you feel overwhelmed');
  }

  if (triggers.some(t => t.category === 'mental-health')) {
    recommendations.push('Mental health support resources are available if needed');
    safetyTips.push('Remember that seeking help is a sign of strength');
  }

  if (triggers.some(t => t.category === 'medical-procedures')) {
    recommendations.push('Medical information here is for educational purposes only');
    safetyTips.push('Consult your healthcare provider for personalized advice');
  }

  // Determine overall severity
  let overallSeverity: 'mild' | 'moderate' | 'severe' = 'mild';
  if (severityScore >= 6) overallSeverity = 'severe';
  else if (severityScore >= 3) overallSeverity = 'moderate';

  return {
    triggers: triggers.filter(
      (trigger, index, self) => index === self.findIndex(t => t.description === trigger.description)
    ),
    overallSeverity,
    recommendations,
    safetyTips,
  };
}

// Auto content warning wrapper
export function AutoPainContentWarning({
  children,
  analysisText = '',
  customTriggers = [],
}: {
  children: React.ReactNode;
  analysisText?: string;
  customTriggers?: PainTriggerType[];
}) {
  const analysisResult = analyzePainContent(analysisText, customTriggers);

  if (analysisResult.triggers.length === 0) {
    return <>{children}</>;
  }

  return (
    <EnhancedContentWarning
      level={analysisResult.overallSeverity}
      triggerTypes={analysisResult.triggers}
      description="This content has been automatically analyzed for pain-related triggers"
      autoAnalyze={true}
      customContext={analysisText}
    >
      {children}
    </EnhancedContentWarning>
  );
}
