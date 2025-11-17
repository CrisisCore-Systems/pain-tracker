/**
 * User Agency Reinforcement System
 * Emphasizes user control, choice, and autonomy in pain management journey
 */

import React, { useState, useEffect } from 'react';
import {
  Crown,
  Compass,
  Target,
  Shield,
  Settings,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  Lightbulb,
  Heart,
  Star,
  User,
  Sliders,
  Lock,
  Unlock,
  Maximize,
  Minimize,
} from 'lucide-react';
import { TouchOptimizedButton } from './TraumaInformedUX';

interface AgencyChoice {
  id: string;
  category:
    | 'data-control'
    | 'interaction-style'
    | 'content-filtering'
    | 'privacy'
    | 'customization';
  title: string;
  description: string;
  userBenefit: string;
  options: AgencyOption[];
  currentSelection?: string;
  onSelectionChange?: (optionId: string) => void;
}

interface AgencyOption {
  id: string;
  label: string;
  description: string;
  empowermentMessage: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface UserControlPanelProps {
  onAgencyChoice?: (choice: AgencyChoice, selectedOption: string) => void;
  onCustomizationChange?: (setting: string, value: string | number | boolean) => void;
  showAdvancedControls?: boolean;
}

// Agency choices that emphasize user control
const agencyChoices: AgencyChoice[] = [
  {
    id: 'data-ownership',
    category: 'data-control',
    title: 'Your Data, Your Rules',
    description: 'You decide what happens with your pain tracking information',
    userBenefit: 'Complete transparency and control over your personal health data',
    options: [
      {
        id: 'local-only',
        label: 'Keep everything on my device',
        description: 'Nothing leaves your device without your explicit permission',
        empowermentMessage: 'You maintain complete privacy and control',
        icon: Shield,
      },
      {
        id: 'selective-sync',
        label: 'I choose what to share',
        description: 'Select specific data to sync for backup or sharing',
        empowermentMessage: 'You have granular control over your information',
        icon: Sliders,
      },
      {
        id: 'full-sync',
        label: 'Sync for convenience',
        description: 'Encrypted sync across devices for easy access',
        empowermentMessage: 'Convenience with security - still your choice',
        icon: RotateCcw,
      },
    ],
  },
  {
    id: 'interaction-autonomy',
    category: 'interaction-style',
    title: 'How You Want to Interact',
    description: 'Choose the interaction style that feels right for you',
    userBenefit: 'Your comfort and preferences shape every interaction',
    options: [
      {
        id: 'gentle-guidance',
        label: 'Gentle suggestions',
        description: 'Soft prompts and optional guidance',
        empowermentMessage: 'Support when you want it, space when you need it',
        icon: Heart,
      },
      {
        id: 'expert-mode',
        label: 'Direct control',
        description: 'Minimal guidance, maximum control',
        empowermentMessage: 'You are the expert on your own experience',
        icon: Crown,
      },
      {
        id: 'collaborative',
        label: 'Partnership approach',
        description: 'Work together to understand patterns',
        empowermentMessage: 'Your insights drive the experience',
        icon: Compass,
      },
    ],
  },
  {
    id: 'content-filtering',
    category: 'content-filtering',
    title: 'Content That Serves You',
    description: 'Filter information based on what helps you most',
    userBenefit: 'See only content that supports your current needs',
    options: [
      {
        id: 'hope-focused',
        label: 'Focus on possibilities',
        description: 'Emphasize positive trends and potential',
        empowermentMessage: 'Hope and possibility guide your experience',
        icon: Star,
      },
      {
        id: 'practical-focused',
        label: 'Show me actionable insights',
        description: 'Highlight patterns and practical next steps',
        empowermentMessage: 'Knowledge becomes power through action',
        icon: Target,
      },
      {
        id: 'balanced-view',
        label: 'Complete picture',
        description: 'Show all data with context and support',
        empowermentMessage: 'Full information with compassionate framing',
        icon: Lightbulb,
      },
    ],
  },
  {
    id: 'privacy-control',
    category: 'privacy',
    title: 'Your Privacy Boundaries',
    description: 'Set boundaries around sharing and visibility',
    userBenefit: 'Your privacy comfort level is always respected',
    options: [
      {
        id: 'completely-private',
        label: 'Just for me',
        description: 'No sharing features or suggestions',
        empowermentMessage: 'Your journey is completely private',
        icon: Lock,
      },
      {
        id: 'healthcare-sharing',
        label: 'Healthcare team access',
        description: 'Easy sharing with your medical providers',
        empowermentMessage: 'You control who sees what, when',
        icon: Unlock,
      },
      {
        id: 'community-connection',
        label: 'Connect with others',
        description: 'Optional community features and peer support',
        empowermentMessage: 'Choose your level of connection',
        icon: User,
      },
    ],
  },
  {
    id: 'customization-level',
    category: 'customization',
    title: 'How Much Control Do You Want?',
    description: 'Choose your level of customization and control',
    userBenefit: 'The interface adapts to your preferred level of control',
    options: [
      {
        id: 'simplified',
        label: 'Keep it simple',
        description: 'Smart defaults with minimal configuration',
        empowermentMessage: 'Simplicity is a choice, not a limitation',
        icon: Minimize,
      },
      {
        id: 'customizable',
        label: 'Some customization',
        description: 'Key settings you can adjust as needed',
        empowermentMessage: 'Balance between simplicity and control',
        icon: Settings,
      },
      {
        id: 'full-control',
        label: 'Maximum customization',
        description: 'Deep control over every aspect of the experience',
        empowermentMessage: 'Every detail reflects your preferences',
        icon: Maximize,
      },
    ],
  },
];

export function UserAgencyReinforcementPanel({
  onAgencyChoice,
  onCustomizationChange,
  showAdvancedControls = false,
}: UserControlPanelProps) {
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [expandedChoice, setExpandedChoice] = useState<string | null>(null);
  const [showAgencyAffirmation, setShowAgencyAffirmation] = useState(false);

  // Show agency affirmation when user makes choices
  useEffect(() => {
    const choiceCount = Object.keys(selectedChoices).length;
    if (choiceCount > 0 && choiceCount % 2 === 0) {
      setShowAgencyAffirmation(true);
      setTimeout(() => setShowAgencyAffirmation(false), 5000);
    }
  }, [selectedChoices]);

  const handleChoiceSelection = (choice: AgencyChoice, optionId: string) => {
    setSelectedChoices(prev => ({ ...prev, [choice.id]: optionId }));

    if (onAgencyChoice) {
      onAgencyChoice(choice, optionId);
    }

    // Show empowerment message
    const selectedOption = choice.options.find(opt => opt.id === optionId);
    if (selectedOption) {
      // Could trigger a toast or notification here
    }
  };

  return (
    <div className="user-agency-panel">
      {/* Agency Affirmation */}
      {showAgencyAffirmation && (
        <AgencyAffirmation onClose={() => setShowAgencyAffirmation(false)} />
      )}

      {/* Header */}
      <div className="bg-white border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <Crown className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">You're In Control</h2>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          Your pain tracking experience should work exactly the way you need it to. Every choice
          below puts you in the driver's seat of your health journey.
        </p>

        <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
          <p className="text-sm text-purple-800">
            💜 <strong>Remember:</strong> You can change any of these choices at any time. There are
            no wrong answers - only what works best for you right now.
          </p>
        </div>
      </div>

      {/* Agency Choices */}
      <div className="space-y-4">
        {agencyChoices.map(choice => (
          <AgencyChoiceCard
            key={choice.id}
            choice={choice}
            isExpanded={expandedChoice === choice.id}
            selectedOption={selectedChoices[choice.id]}
            onExpand={() => setExpandedChoice(expandedChoice === choice.id ? null : choice.id)}
            onOptionSelect={optionId => handleChoiceSelection(choice, optionId)}
          />
        ))}
      </div>

      {/* Advanced Controls */}
      {showAdvancedControls && (
        <AdvancedAgencyControls onCustomizationChange={onCustomizationChange} />
      )}

      {/* Agency Summary */}
      {Object.keys(selectedChoices).length > 0 && (
        <AgencySummary selections={selectedChoices} choices={agencyChoices} />
      )}
    </div>
  );
}

// Individual agency choice card
function AgencyChoiceCard({
  choice,
  isExpanded,
  selectedOption,
  onExpand,
  onOptionSelect,
}: {
  choice: AgencyChoice;
  isExpanded: boolean;
  selectedOption?: string;
  onExpand: () => void;
  onOptionSelect: (optionId: string) => void;
}) {
  const selectedOpt = choice.options.find(opt => opt.id === selectedOption);

  return (
    <div className="bg-white border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <TouchOptimizedButton
        variant="secondary"
        onClick={onExpand}
        className="w-full p-4 text-left bg-transparent hover:bg-gray-50 dark:bg-gray-900 border-0 rounded-none"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{choice.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{choice.description}</p>

            {selectedOpt && (
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">{selectedOpt.label}</span>
              </div>
            )}
          </div>

          <ChevronRight
            className={`
            w-5 h-5 text-gray-400 transition-transform
            ${isExpanded ? 'rotate-90' : ''}
          `}
          />
        </div>
      </TouchOptimizedButton>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 pt-0 border-t border-gray-100">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Why this matters:</strong> {choice.userBenefit}
            </p>
          </div>

          <div className="space-y-3">
            {choice.options.map(option => {
              const Icon = option.icon;
              const isSelected = selectedOption === option.id;

              return (
                <TouchOptimizedButton
                  key={option.id}
                  variant={isSelected ? 'primary' : 'secondary'}
                  onClick={() => onOptionSelect(option.id)}
                  className={`
                    w-full p-4 text-left border-2 rounded-lg transition-all
                    ${
                      isSelected
                        ? 'border-purple-300 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-200'
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                    {Icon && (
                      <Icon
                        className={`
                        w-5 h-5 mt-0.5
                        ${isSelected ? 'text-purple-600' : 'text-gray-600'}
                      `}
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {option.label}
                        </h4>
                        {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {option.description}
                      </p>

                      {isSelected && (
                        <div className="p-2 bg-white/70 rounded-md">
                          <p className="text-xs text-purple-700 italic">
                            ✨ {option.empowermentMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </TouchOptimizedButton>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Agency affirmation popup
function AgencyAffirmation({ onClose }: { onClose: () => void }) {
  const affirmations = [
    'You are the expert on your own experience',
    'Your choices and preferences matter',
    'Taking control of your health journey shows strength',
    'You have the right to customize your care experience',
    'Your autonomy and agency are respected here',
  ];

  const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];

  return (
    <div className="fixed top-4 right-4 z-50 bg-purple-100 border border-purple-300 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-start space-x-3">
        <Crown className="w-5 h-5 text-purple-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-purple-900 mb-1">Your Agency Matters</h4>
          <p className="text-sm text-purple-800 italic">{randomAffirmation}</p>
        </div>
        <TouchOptimizedButton
          variant="secondary"
          onClick={onClose}
          className="text-xs text-purple-600 hover:text-purple-800"
        >
          <X className="w-4 h-4" />
        </TouchOptimizedButton>
      </div>
    </div>
  );
}

// Advanced agency controls
function AdvancedAgencyControls({
  onCustomizationChange,
}: {
  onCustomizationChange?: (setting: string, value: string | number | boolean) => void;
}) {
  const [advancedSettings, setAdvancedSettings] = useState({
    dataRetention: 'user-controlled',
    exportFormat: 'comprehensive',
    reminderStyle: 'gentle',
    progressVisualization: 'holistic',
  });

  const handleSettingChange = (setting: string, value: string) => {
    setAdvancedSettings(prev => ({ ...prev, [setting]: value }));
    if (onCustomizationChange) {
      onCustomizationChange(setting, value);
    }
  };

  return (
    <div className="bg-white border border-gray-200 dark:border-gray-700 rounded-lg p-6 mt-6">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Advanced Control Options
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data Retention Control
          </label>
          <select
            value={advancedSettings.dataRetention}
            onChange={e => handleSettingChange('dataRetention', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500"
          >
            <option value="user-controlled">I control everything</option>
            <option value="auto-archive">Auto-archive old data</option>
            <option value="never-delete">Keep all data forever</option>
          </select>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            You decide how long your data is kept and when it's removed
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Export Format Preference
          </label>
          <select
            value={advancedSettings.exportFormat}
            onChange={e => handleSettingChange('exportFormat', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500"
          >
            <option value="comprehensive">Complete data with context</option>
            <option value="clinical">Medical format for providers</option>
            <option value="personal">Personal summary format</option>
          </select>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Choose how your data is formatted when you share it
          </p>
        </div>
      </div>
    </div>
  );
}

// Agency choices summary
function AgencySummary({
  selections,
  choices,
}: {
  selections: Record<string, string>;
  choices: AgencyChoice[];
}) {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mt-6">
      <div className="flex items-center space-x-2 mb-4">
        <Star className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-purple-900">Your Agency in Action</h3>
      </div>

      <p className="text-purple-800 mb-4">
        You've made {Object.keys(selections).length} choices that put you in control of your
        experience:
      </p>

      <div className="space-y-2">
        {Object.entries(selections).map(([choiceId, optionId]) => {
          const choice = choices.find(c => c.id === choiceId);
          const option = choice?.options.find(o => o.id === optionId);

          if (!choice || !option) return null;

          return (
            <div key={choiceId} className="bg-white/70 rounded-md p-3">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-purple-900">{choice.title}:</span>
                <span className="text-sm text-purple-700">{option.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-white/50 rounded-md">
        <p className="text-sm text-purple-800 italic">
          Remember: You can change any of these choices at any time. Your agency and autonomy are
          always respected.
        </p>
      </div>
    </div>
  );
}
