/**
 * Customizable Interface Options
 * Settings panel for trauma-informed accessibility preferences
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { TouchOptimizedButton } from './TraumaInformedUX';
import { useTraumaInformed } from './TraumaInformedHooks';
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
  Smartphone
} from 'lucide-react';
import { useMobileAccessibility } from './MobileAccessibility';
import type { TraumaInformedPreferences } from './TraumaInformedTypes';

export function AccessibilitySettingsPanel() {
  const { preferences, updatePreferences } = useTraumaInformed();
  const { preferences: mobilePrefs, updatePreferences: updateMobilePrefs } = useMobileAccessibility();
  const [activeTab, setActiveTab] = useState<'cognitive' | 'visual' | 'motor' | 'emotional' | 'mobile'>('cognitive');

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
      description: 'Memory aids and cognitive load reduction'
    },
    {
      id: 'visual' as const,
      label: 'Visual Preferences',
      icon: <Eye className="w-5 h-5" />,
      description: 'Text size, contrast, and motion settings'
    },
    {
      id: 'motor' as const,
      label: 'Motor & Input',
      icon: <Hand className="w-5 h-5" />,
      description: 'Touch targets and alternative input methods'
    },
    {
      id: 'mobile' as const,
      label: 'Mobile Features',
      icon: <Smartphone className="w-5 h-5" />,
      description: 'Voice input, haptic feedback, and mobile accessibility'
    },
    {
      id: 'emotional' as const,
      label: 'Emotional Safety',
      icon: <Heart className="w-5 h-5" />,
      description: 'Trauma-informed interaction patterns'
    }
  ];

  return (
    <Card className="accessibility-settings w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Accessibility & Comfort Settings</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Customize the interface to work best for your needs
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <TouchOptimizedButton
              variant="secondary"
              onClick={resetToDefaults}
              size="normal"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </TouchOptimizedButton>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex space-x-4" aria-label="Settings categories">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-t-lg
                  transition-colors min-h-[var(--ti-touch-size)]
                  ${activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }
                `}
                aria-selected={activeTab === tab.id}
                role="tab"
              >
                {tab.icon}
                <div className="text-left">
                  <div>{tab.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{tab.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'cognitive' && (
            <CognitiveSettings 
              preferences={preferences} 
              onChange={handlePreferenceChange} 
            />
          )}
          
          {activeTab === 'visual' && (
            <VisualSettings 
              preferences={preferences} 
              onChange={handlePreferenceChange} 
            />
          )}
          
          {activeTab === 'motor' && (
            <MotorSettings 
              preferences={preferences} 
              onChange={handlePreferenceChange} 
            />
          )}
          
          {activeTab === 'mobile' && (
            <MobileSettings 
              preferences={mobilePrefs} 
              onChange={updateMobilePrefs} 
            />
          )}
          
          {activeTab === 'emotional' && (
            <EmotionalSafetySettings 
              preferences={preferences} 
              onChange={handlePreferenceChange} 
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Cognitive Settings Tab
function CognitiveSettings({ 
  preferences, 
  onChange 
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
          onChange={(checked) => onChange({ simplifiedMode: checked })}
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
          onChange={(checked) => onChange({ showMemoryAids: checked })}
        />
        
        <ToggleSetting
          label="Progress Indicators"
          description="Show your progress through forms and tasks"
          checked={preferences.showProgress}
          onChange={(checked) => onChange({ showProgress: checked })}
        />
        
        <ToggleSetting
          label="Auto-Save"
          description="Automatically save your work to prevent data loss"
          checked={preferences.autoSave}
          onChange={(checked) => onChange({ autoSave: checked })}
        />
      </SettingGroup>
    </div>
  );
}

// Visual Settings Tab
function VisualSettings({ 
  preferences, 
  onChange 
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
            { value: 'xl', label: 'Extra Large (20px)' }
          ]}
          onChange={(value) => onChange({ fontSize: value as TraumaInformedPreferences['fontSize'] })}
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
            { value: 'extra-high', label: 'Extra High Contrast' }
          ]}
          onChange={(value) => onChange({ contrast: value as TraumaInformedPreferences['contrast'] })}
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
          onChange={(checked) => onChange({ reduceMotion: checked })}
        />
      </SettingGroup>
    </div>
  );
}

// Motor Settings Tab
function MotorSettings({ 
  preferences, 
  onChange 
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
            { value: 'extra-large', label: 'Extra Large (72px)' }
          ]}
          onChange={(value) => onChange({ touchTargetSize: value as TraumaInformedPreferences['touchTargetSize'] })}
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
          onChange={(checked) => onChange({ voiceInput: checked })}
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
            { value: 'high', label: 'High - Confirm most actions' }
          ]}
          onChange={(value) => onChange({ confirmationLevel: value as TraumaInformedPreferences['confirmationLevel'] })}
        />
      </SettingGroup>
    </div>
  );
}

// Emotional Safety Settings Tab
function EmotionalSafetySettings({ 
  preferences, 
  onChange 
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
          onChange={(checked) => onChange({ gentleLanguage: checked })}
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
          onChange={(checked) => onChange({ hideDistressingContent: checked })}
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
          onChange={(checked) => onChange({ showComfortPrompts: checked })}
        />
      </SettingGroup>
    </div>
  );
}

// Mobile Settings Tab
function MobileSettings({ 
  preferences, 
  onChange 
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
          onChange={(checked) => onChange({ voiceInput: checked })}
        />
        
        <ToggleSetting
          label="Text-to-Speech"
          description="Read interface elements aloud when requested"
          checked={preferences.textToSpeech}
          onChange={(checked) => onChange({ textToSpeech: checked })}
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
          onChange={(checked) => onChange({ hapticFeedback: checked })}
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
          onChange={(checked) => onChange({ largeText: checked })}
        />
        
        <ToggleSetting
          label="High Contrast"
          description="Enhanced contrast for better visibility on mobile screens"
          checked={preferences.highContrast}
          onChange={(checked) => onChange({ highContrast: checked })}
        />
        
        <ToggleSetting
          label="Reduced Motion"
          description="Minimize animations that may cause motion sickness"
          checked={preferences.reducedMotion}
          onChange={(checked) => onChange({ reducedMotion: checked })}
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
  children 
}: { 
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start space-x-3 mb-4">
        {icon}
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// Toggle Setting Component
function ToggleSetting({ 
  label, 
  description, 
  checked, 
  onChange 
}: { 
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <label className="font-medium text-gray-900 dark:text-gray-100 text-sm">{label}</label>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${checked ? 'bg-blue-600' : 'bg-gray-200'}
        `}
        style={{ minHeight: 'var(--ti-touch-size)', minWidth: '44px' }}
        role="switch"
        aria-checked={checked}
        aria-labelledby={`toggle-${label.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <span
          className={`
            inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
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
  onChange 
}: { 
  label: string;
  description: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block font-medium text-gray-900 dark:text-gray-100 text-sm mb-1">{label}</label>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{description}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          text-sm
        "
        style={{ 
          minHeight: 'var(--ti-touch-size)',
          fontSize: 'var(--ti-font-size)'
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
