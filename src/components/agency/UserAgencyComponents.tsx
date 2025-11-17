/**
 * User Agency Reinforcement Components
 * Emphasizes user control, choice, and empowerment in pain management
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { 
  Crown, Settings, Eye, ChevronDown, ChevronUp, Plus, Star, Shield,
  CheckCircle, Circle
} from 'lucide-react';
import { useTraumaInformed } from '../accessibility/TraumaInformedHooks';

// Types for user agency features
interface UserPreference {
  id: string;
  category: 'interface' | 'data' | 'privacy' | 'notifications' | 'accessibility';
  label: string;
  description: string;
  type: 'boolean' | 'select' | 'range' | 'color' | 'text';
  value: string | number | boolean;
  options?: Array<{ value: string | number | boolean; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  isUserDefined?: boolean;
}

// User Control Panel Component
export function UserControlPanel() {
  const { preferences, updatePreferences } = useTraumaInformed();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'preferences' | 'goals' | 'data' | 'privacy'>('preferences');

  const userPreferences: UserPreference[] = [
    {
      id: 'theme',
      category: 'interface',
      label: 'Color Theme',
      description: 'Choose your preferred color scheme',
      type: 'select',
      value: preferences.theme || 'light',
      options: [
        { value: 'light', label: 'Light Mode' },
        { value: 'dark', label: 'Dark Mode' },
        { value: 'high-contrast', label: 'High Contrast' },
        { value: 'auto', label: 'Auto (System)' }
      ]
    },
    {
      id: 'fontSize',
      category: 'accessibility',
      label: 'Text Size',
      description: 'Adjust text size for better readability',
      type: 'range',
      value: preferences.fontSize || 16,
      min: 12,
      max: 24,
      step: 1
    },
    {
      id: 'autoSave',
      category: 'data',
      label: 'Auto-Save',
      description: 'Automatically save your entries as you type',
      type: 'boolean',
      value: preferences.autoSave
    },
    {
      id: 'realTimeValidation',
      category: 'interface',
      label: 'Real-time Validation',
      description: 'Show supportive messages as you complete forms',
      type: 'boolean',
      value: preferences.realTimeValidation
    },
    {
      id: 'reminderFrequency',
      category: 'notifications',
      label: 'Entry Reminders',
      description: 'How often to remind you to track your pain',
      type: 'select',
      value: preferences.reminderFrequency || 'daily',
      options: [
        { value: 'none', label: 'No Reminders' },
        { value: 'daily', label: 'Daily' },
        { value: 'twice-daily', label: 'Twice Daily' },
        { value: 'weekly', label: 'Weekly' }
      ]
    }
  ];

  const updatePreference = useCallback((id: string, value: unknown) => {
    updatePreferences({ [id]: value });
  }, [updatePreferences]);

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="flex items-center text-blue-800">
            <Crown className="w-5 h-5 mr-2" />
            You're in Control
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-600">Customize your experience</span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-blue-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-blue-600" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white rounded-lg p-1 mb-6">
            {[
              { id: 'preferences', label: 'Preferences', icon: Settings },
              { id: 'goals', label: 'My Goals', icon: Star },
              { id: 'data', label: 'My Data', icon: Shield },
              { id: 'privacy', label: 'Privacy', icon: Eye }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
                <Settings className="w-4 h-4" />
                <span>These settings are saved locally and never shared without your permission.</span>
              </div>
              
              {userPreferences.map((pref) => (
                <div key={pref.id} className="bg-white p-4 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {pref.label}
                      </label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{pref.description}</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    {pref.type === 'boolean' && (
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={pref.value as boolean}
                          onChange={(e) => updatePreference(pref.id, e.target.checked)}
                          className="rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm">
                          {pref.value ? 'Enabled' : 'Disabled'}
                        </span>
                      </label>
                    )}
                    
                    {pref.type === 'select' && (
                      <select
                        value={String(pref.value)}
                        onChange={(e) => updatePreference(pref.id, e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {pref.options?.map((option) => (
                          <option key={String(option.value)} value={String(option.value)}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {pref.type === 'range' && (
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min={pref.min}
                          max={pref.max}
                          step={pref.step}
                          value={pref.value as number}
                          onChange={(e) => updatePreference(pref.id, parseInt(e.target.value))}
                          className="flex-1"
                        />
                        <span className="w-16 text-sm font-medium">
                          {pref.value}{pref.id === 'fontSize' ? 'px' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-blue-700">
                  <Star className="w-4 h-4" />
                  <span>Set and track your personal health goals</span>
                </div>
                <button className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                  <Plus className="w-4 h-4" />
                  <span>Add Goal</span>
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-lg border text-center">
                <Star className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Your Goals, Your Way</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create personal goals that matter to you. Track progress on your terms.
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Create Your First Goal
                </button>
              </div>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
                <Shield className="w-4 h-4" />
                <span>Your data belongs to you. Export, backup, or delete it anytime.</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Export Your Data</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Download all your pain tracking data in your preferred format.
                  </p>
                  <div className="space-y-2">
                    <button className="w-full p-2 text-left text-sm bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 rounded border transition-colors">
                      📄 Export as PDF Report
                    </button>
                    <button className="w-full p-2 text-left text-sm bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 rounded border transition-colors">
                      📊 Export as Spreadsheet (CSV)
                    </button>
                    <button className="w-full p-2 text-left text-sm bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 rounded border transition-colors">
                      🔧 Export Raw Data (JSON)
                    </button>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Data Backup</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Create a backup of all your data for peace of mind.
                  </p>
                  <button className="w-full p-2 bg-green-50 border border-green-200 text-green-700 rounded hover:bg-green-100 transition-colors">
                    Create Backup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-green-700 bg-green-100 p-3 rounded-lg">
                <Eye className="w-4 h-4" />
                <span>Your privacy is paramount. You control what's shared and with whom.</span>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Privacy Controls</h4>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <div>
                      <span className="text-sm font-medium">Share anonymized data for research</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Help improve pain management for others</p>
                    </div>
                    <input type="checkbox" className="rounded text-blue-600" />
                  </label>
                  
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <div>
                      <span className="text-sm font-medium">Analytics and improvements</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Help us improve the app experience</p>
                    </div>
                    <input type="checkbox" className="rounded text-blue-600" />
                  </label>
                  
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <div>
                      <span className="text-sm font-medium">Email notifications</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Receive updates and tips via email</p>
                    </div>
                    <input type="checkbox" className="rounded text-blue-600" />
                  </label>
                </div>
                
                <div className="mt-6 pt-4 border-t">
                  <button className="w-full p-2 text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors">
                    Delete All My Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// Choice Emphasis Component
interface ChoiceEmphasisProps {
  title: string;
  choices: Array<{
    id: string;
    label: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    recommended?: boolean;
  }>;
  selectedChoice?: string;
  onChoiceSelect: (choiceId: string) => void;
  allowMultiple?: boolean;
}

export function ChoiceEmphasis({
  title,
  choices,
  selectedChoice,
  onChoiceSelect,
  allowMultiple = false
}: ChoiceEmphasisProps) {
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);

  const handleChoice = (choiceId: string) => {
    if (allowMultiple) {
      const newChoices = selectedChoices.includes(choiceId)
        ? selectedChoices.filter(id => id !== choiceId)
        : [...selectedChoices, choiceId];
      setSelectedChoices(newChoices);
      onChoiceSelect(newChoices.join(','));
    } else {
      onChoiceSelect(choiceId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Crown className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {choices.map((choice) => {
          const isSelected = allowMultiple 
            ? selectedChoices.includes(choice.id)
            : selectedChoice === choice.id;
          const IconComponent = choice.icon || Circle;
          
          return (
            <button
              key={choice.id}
              onClick={() => handleChoice(choice.id)}
              className={`
                p-4 text-left rounded-lg border-2 transition-all
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }
                ${choice.recommended ? 'ring-1 ring-yellow-300 bg-yellow-50' : ''}
              `}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {isSelected ? (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  ) : (
                    <IconComponent className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{choice.label}</span>
                    {choice.recommended && (
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                        Recommended
                      </span>
                    )}
                  </div>
                  {choice.description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{choice.description}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="flex items-center space-x-2 text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
        <Shield className="w-4 h-4" />
        <span>
          {allowMultiple 
            ? 'Select as many options as feel right for you. You can change these anytime.'
            : 'Choose what feels right for you. You can change this anytime.'
          }
        </span>
      </div>
    </div>
  );
}

// Empowerment Messages Component
interface EmpowermentMessage {
  id: string;
  message: string;
  context: 'starting' | 'progress' | 'setback' | 'achievement' | 'general';
  tone: 'encouraging' | 'affirming' | 'celebrating' | 'supportive';
}

const empowermentMessages: EmpowermentMessage[] = [
  {
    id: '1',
    message: "You are the expert on your own body and experience. Trust yourself.",
    context: 'general',
    tone: 'affirming'
  },
  {
    id: '2',
    message: "Every entry you make is an act of self-advocacy and strength.",
    context: 'progress',
    tone: 'encouraging'
  },
  {
    id: '3',
    message: "You have the power to shape your pain management journey.",
    context: 'starting',
    tone: 'affirming'
  },
  {
    id: '4',
    message: "Setbacks don't erase your progress. You're still moving forward.",
    context: 'setback',
    tone: 'supportive'
  },
  {
    id: '5',
    message: "Look at what you've accomplished! Your dedication is inspiring.",
    context: 'achievement',
    tone: 'celebrating'
  }
];

export function EmpowermentMessageDisplay({ context = 'general' }: { context?: EmpowermentMessage['context'] }) {
  const relevantMessages = empowermentMessages.filter(msg => 
    msg.context === context || msg.context === 'general'
  );
  
  const message = relevantMessages[Math.floor(Math.random() * relevantMessages.length)];
  
  if (!message) return null;

  const colors = {
    encouraging: 'bg-blue-50 border-blue-200 text-blue-800',
    affirming: 'bg-green-50 border-green-200 text-green-800',
    celebrating: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    supportive: 'bg-purple-50 border-purple-200 text-purple-800'
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[message.tone]} mb-4`}>
      <div className="flex items-center space-x-3">
        <Crown className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{message.message}</p>
      </div>
    </div>
  );
}
