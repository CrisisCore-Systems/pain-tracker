/**
 * Customizable Interface Options
 * Settings panel for trauma-informed accessibility preferences
 */

import React, { useState } from 'react';
import {
  Settings,
  Eye,
  Type,
  Palette,
  Hand,
  Volume2,
  Heart,
  Shield,
  Brain,
  Zap,
  RotateCcw,
  Smartphone,
} from 'lucide-react';
import { useMobileAccessibility } from './MobileAccessibility';
import { useTraumaInformed } from './TraumaInformedHooks';
import type { TraumaInformedPreferences } from './TraumaInformedTypes';

export function AccessibilitySettingsPanel() {
  const { preferences, updatePreferences } = useTraumaInformed();
  const { preferences: mobilePrefs, updatePreferences: updateMobilePrefs } =
    useMobileAccessibility();
  const [activeTab, setActiveTab] = useState<
    'cognitive' | 'visual' | 'motor' | 'emotional' | 'mobile'
  >('cognitive');

  const handlePreferenceChange = (updates: Partial<TraumaInformedPreferences>) => {
    updatePreferences(updates);
  };

  const resetToDefaults = () => {
    updatePreferences({
      simplifiedMode: true,
      showMemoryAids: true,
      autoSave: true,
      showProgress: true,
      fontSize: 'medium',
      contrast: 'normal',
      reduceMotion: false,
      touchTargetSize: 'large',
      confirmationLevel: 'standard',
      voiceInput: false,
      gentleLanguage: true,
      hideDistressingContent: false,
      showComfortPrompts: true,
    });
  };

  const tabs = [
    {
      id: 'cognitive' as const,
      label: 'Cognitive Support',
      icon: <Brain className="w-5 h-5" />,
      description: 'Memory aids and cognitive load reduction',
    },
    {
      id: 'visual' as const,
      label: 'Visual Preferences',
      icon: <Eye className="w-5 h-5" />,
      description: 'Text size, contrast, and motion settings',
    },
    {
      id: 'motor' as const,
      label: 'Motor & Input',
      icon: <Hand className="w-5 h-5" />,
      description: 'Touch targets and alternative input methods',
    },
    {
      id: 'mobile' as const,
      label: 'Mobile Features',
      icon: <Smartphone className="w-5 h-5" />,
      description: 'Voice input, haptic feedback, and mobile accessibility',
    },
    {
      id: 'emotional' as const,
      label: 'Emotional Safety',
      icon: <Heart className="w-5 h-5" />,
      description: 'Trauma-informed interaction patterns',
    },
  ];

  return (
    <div 
      className="accessibility-settings w-full max-w-4xl mx-auto rounded-xl p-5 bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div 
            className="p-2 rounded-lg bg-sky-100 dark:bg-sky-500/15"
          >
            <Settings className="w-6 h-6 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Accessibility & Comfort Settings</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              Customize the interface to work best for your needs
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={resetToDefaults}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </button>
        </div>
      </div>

      <div>
        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200 dark:border-white/5">
          <nav className="w-full overflow-x-auto pb-2" aria-label="Settings categories">
            <div className="inline-flex flex-nowrap gap-2 whitespace-nowrap min-w-max">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all min-h-[44px] whitespace-nowrap overflow-hidden ${
                      isActive
                        ? 'bg-sky-100 dark:bg-sky-500/15 border border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-400'
                        : 'bg-transparent border border-transparent text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300'
                    }`}
                    aria-selected={isActive}
                    role="tab"
                  >
                    {tab.icon}
                    <div className="text-left min-w-0">
                      <div className="truncate">{tab.label}</div>
                      <div className="hidden sm:block text-xs opacity-70 truncate">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'cognitive' && (
            <CognitiveSettings preferences={preferences} onChange={handlePreferenceChange} />
          )}

          {activeTab === 'visual' && (
            <VisualSettings preferences={preferences} onChange={handlePreferenceChange} />
          )}

          {activeTab === 'motor' && (
            <MotorSettings preferences={preferences} onChange={handlePreferenceChange} />
          )}

          {activeTab === 'mobile' && (
            <MobileSettings preferences={mobilePrefs} onChange={updateMobilePrefs} />
          )}

          {activeTab === 'emotional' && (
            <EmotionalSafetySettings preferences={preferences} onChange={handlePreferenceChange} />
          )}
        </div>
      </div>
    </div>
  );
}

// Cognitive Settings Tab
function CognitiveSettings({
  preferences,
  onChange,
}: {
  preferences: TraumaInformedPreferences;
  onChange: (updates: Partial<TraumaInformedPreferences>) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingGroup
        title="Interface Complexity"
        description="Reduce cognitive load by simplifying the interface"
        icon={<Brain className="w-5 h-5 text-purple-500" />}
      >
        <ToggleSetting
          label="Simplified Mode"
          description="Show only essential features and reduce interface complexity"
          checked={preferences.simplifiedMode}
          onChange={checked => onChange({ simplifiedMode: checked })}
        />
      </SettingGroup>

      <SettingGroup
        title="Memory Support"
        description="Tools to help remember and navigate the interface"
        icon={<Zap className="w-5 h-5 text-yellow-500" />}
      >
        <ToggleSetting
          label="Memory Aids"
          description="Show helpful tips and reminders throughout the interface"
          checked={preferences.showMemoryAids}
          onChange={checked => onChange({ showMemoryAids: checked })}
        />

        <ToggleSetting
          label="Progress Indicators"
          description="Show your progress through forms and tasks"
          checked={preferences.showProgress}
          onChange={checked => onChange({ showProgress: checked })}
        />

        <ToggleSetting
          label="Auto-Save"
          description="Automatically save your work to prevent data loss"
          checked={preferences.autoSave}
          onChange={checked => onChange({ autoSave: checked })}
        />
      </SettingGroup>
    </div>
  );
}

// Visual Settings Tab
function VisualSettings({
  preferences,
  onChange,
}: {
  preferences: TraumaInformedPreferences;
  onChange: (updates: Partial<TraumaInformedPreferences>) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingGroup
        title="Text & Typography"
        description="Adjust text size for comfortable reading"
        icon={<Type className="w-5 h-5 text-blue-500" />}
      >
        <SelectSetting
          label="Font Size"
          description="Choose a comfortable text size for reading"
          value={preferences.fontSize}
          options={[
            { value: 'small', label: 'Small (14px)' },
            { value: 'medium', label: 'Medium (16px)' },
            { value: 'large', label: 'Large (18px)' },
            { value: 'xl', label: 'Extra Large (20px)' },
          ]}
          onChange={value => onChange({ fontSize: value as TraumaInformedPreferences['fontSize'] })}
        />
      </SettingGroup>

      <SettingGroup
        title="Contrast & Colors"
        description="Adjust visual contrast for better visibility"
        icon={<Palette className="w-5 h-5 text-green-500" />}
      >
        <SelectSetting
          label="Contrast Level"
          description="Higher contrast can improve text readability"
          value={preferences.contrast}
          options={[
            { value: 'normal', label: 'Normal Contrast' },
            { value: 'high', label: 'High Contrast' },
            { value: 'extra-high', label: 'Extra High Contrast' },
          ]}
          onChange={value => onChange({ contrast: value as TraumaInformedPreferences['contrast'] })}
        />
      </SettingGroup>

      <SettingGroup
        title="Motion & Animation"
        description="Control movement and transitions in the interface"
        icon={<Zap className="w-5 h-5 text-orange-500" />}
      >
        <ToggleSetting
          label="Reduce Motion"
          description="Minimize animations and transitions that may cause discomfort"
          checked={preferences.reduceMotion}
          onChange={checked => onChange({ reduceMotion: checked })}
        />
      </SettingGroup>
    </div>
  );
}

// Motor Settings Tab
function MotorSettings({
  preferences,
  onChange,
}: {
  preferences: TraumaInformedPreferences;
  onChange: (updates: Partial<TraumaInformedPreferences>) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingGroup
        title="Touch & Click Targets"
        description="Adjust the size of buttons and interactive elements"
        icon={<Hand className="w-5 h-5 text-blue-500" />}
      >
        <SelectSetting
          label="Touch Target Size"
          description="Larger targets are easier to tap accurately"
          value={preferences.touchTargetSize}
          options={[
            { value: 'normal', label: 'Normal (44px)' },
            { value: 'large', label: 'Large (56px)' },
            { value: 'extra-large', label: 'Extra Large (72px)' },
          ]}
          onChange={value =>
            onChange({ touchTargetSize: value as TraumaInformedPreferences['touchTargetSize'] })
          }
        />
      </SettingGroup>

      <SettingGroup
        title="Alternative Input"
        description="Enable alternative ways to interact with the interface"
        icon={<Volume2 className="w-5 h-5 text-green-500" />}
      >
        <ToggleSetting
          label="Voice Input"
          description="Use speech-to-text for filling out forms (requires microphone)"
          checked={preferences.voiceInput}
          onChange={checked => onChange({ voiceInput: checked })}
        />
      </SettingGroup>

      <SettingGroup
        title="Interaction Feedback"
        description="Control confirmation prompts and feedback"
        icon={<Shield className="w-5 h-5 text-purple-500" />}
      >
        <SelectSetting
          label="Confirmation Level"
          description="How much confirmation do you want for actions?"
          value={preferences.confirmationLevel}
          options={[
            { value: 'minimal', label: 'Minimal - Few confirmations' },
            { value: 'standard', label: 'Standard - Important actions only' },
            { value: 'high', label: 'High - Confirm most actions' },
          ]}
          onChange={value =>
            onChange({ confirmationLevel: value as TraumaInformedPreferences['confirmationLevel'] })
          }
        />
      </SettingGroup>
    </div>
  );
}

// Emotional Safety Settings Tab
function EmotionalSafetySettings({
  preferences,
  onChange,
}: {
  preferences: TraumaInformedPreferences;
  onChange: (updates: Partial<TraumaInformedPreferences>) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingGroup
        title="Language & Communication"
        description="How the interface communicates with you"
        icon={<Heart className="w-5 h-5 text-pink-500" />}
      >
        <ToggleSetting
          label="Gentle Language"
          description="Use supportive, non-judgmental language in messages and feedback"
          checked={preferences.gentleLanguage}
          onChange={checked => onChange({ gentleLanguage: checked })}
        />
      </SettingGroup>

      <SettingGroup
        title="Content Controls"
        description="Control what content is displayed"
        icon={<Shield className="w-5 h-5 text-green-500" />}
      >
        <ToggleSetting
          label="Hide Distressing Content"
          description="Filter out potentially triggering medical images or detailed descriptions"
          checked={preferences.hideDistressingContent}
          onChange={checked => onChange({ hideDistressingContent: checked })}
        />
      </SettingGroup>

      <SettingGroup
        title="Comfort & Support"
        description="Gentle reminders and encouragement"
        icon={<Heart className="w-5 h-5 text-red-500" />}
      >
        <ToggleSetting
          label="Comfort Prompts"
          description="Show gentle reminders to take breaks and practice self-care"
          checked={preferences.showComfortPrompts}
          onChange={checked => onChange({ showComfortPrompts: checked })}
        />
      </SettingGroup>
    </div>
  );
}

// Mobile Settings Tab
function MobileSettings({
  preferences,
  onChange,
}: {
  preferences: any;
  onChange: (updates: any) => void;
}) {
  return (
    <div className="space-y-6">
      <SettingGroup
        title="Voice & Speech"
        description="Voice input and text-to-speech features"
        icon={<Volume2 className="w-5 h-5 text-blue-500" />}
      >
        <ToggleSetting
          label="Voice Input"
          description="Enable voice commands for navigation and form input"
          checked={preferences.voiceInput}
          onChange={checked => onChange({ voiceInput: checked })}
        />

        <ToggleSetting
          label="Text-to-Speech"
          description="Read interface elements aloud when requested"
          checked={preferences.textToSpeech}
          onChange={checked => onChange({ textToSpeech: checked })}
        />
      </SettingGroup>

      <SettingGroup
        title="Haptic Feedback"
        description="Vibration feedback for interactions"
        icon={<Zap className="w-5 h-5 text-purple-500" />}
      >
        <ToggleSetting
          label="Haptic Feedback"
          description="Vibrate device for button presses and confirmations"
          checked={preferences.hapticFeedback}
          onChange={checked => onChange({ hapticFeedback: checked })}
        />
      </SettingGroup>

      <SettingGroup
        title="Text & Display"
        description="Mobile-specific text and display preferences"
        icon={<Type className="w-5 h-5 text-green-500" />}
      >
        <ToggleSetting
          label="Large Text"
          description="Increase text size for better mobile readability"
          checked={preferences.largeText}
          onChange={checked => onChange({ largeText: checked })}
        />

        <ToggleSetting
          label="High Contrast"
          description="Enhanced contrast for better visibility on mobile screens"
          checked={preferences.highContrast}
          onChange={checked => onChange({ highContrast: checked })}
        />

        <ToggleSetting
          label="Reduced Motion"
          description="Minimize animations that may cause motion sickness"
          checked={preferences.reducedMotion}
          onChange={checked => onChange({ reducedMotion: checked })}
        />
      </SettingGroup>
    </div>
  );
}

// Setting Group Component
function SettingGroup({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div 
      className="rounded-xl p-4 bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-white/5"
    >
      <div className="flex items-start space-x-3 mb-4">
        <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-white/5">
          {icon}
        </div>
        <div>
          <h3 className="font-medium text-gray-800 dark:text-slate-200">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// Toggle Setting Component
function ToggleSetting({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <label className="font-medium text-gray-800 dark:text-slate-200 text-sm">{label}</label>
        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 ${
          checked 
            ? 'bg-gradient-to-r from-sky-500 to-cyan-500 shadow-lg shadow-sky-500/30' 
            : 'bg-gray-300 dark:bg-slate-600'
        }`}
        style={{
          minHeight: 'var(--ti-touch-size, 44px)',
          minWidth: '48px',
        }}
        role="switch"
        aria-checked={checked}
        aria-labelledby={`toggle-${label.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <span
          className="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out"
          style={{
            transform: checked ? 'translateX(22px)' : 'translateX(2px)',
            marginTop: '2px',
          }}
        />
      </button>
    </div>
  );
}

// Select Setting Component
function SelectSetting({
  label,
  description,
  value,
  options,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block font-medium text-gray-800 dark:text-slate-200 text-sm mb-1">
        {label}
      </label>
      <p className="text-xs text-gray-600 dark:text-slate-400 mb-3">{description}</p>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="block w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-slate-200"
        style={{
          minHeight: 'var(--ti-touch-size, 44px)',
          fontSize: 'var(--ti-font-size, 14px)',
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
