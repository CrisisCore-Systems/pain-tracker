// User Agency Dashboard Component
// Reinforces user control, choice, and empowerment

import React, { useState, useEffect } from 'react';
import { formatNumber } from '../../utils/formatting';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../design-system';
import {
  User,
  Shield,
  CheckCircle,
  Lightbulb,
  Target,
  Settings,
  MessageSquare,
  Heart,
} from 'lucide-react';
import type { PainEntry } from '../../types';

interface UserAgencyDashboardProps {
  entries: PainEntry[];
  userId: string;
  onChoiceMade?: (choice: string, category: string) => void;
  onGoalSet?: (goal: string) => void;
  onPreferenceUpdated?: (preference: string, value: unknown) => void;
}

interface AgencyMetric {
  name: string;
  value: number;
  maxValue: number;
  description: string;
  color: string;
  improvements: string[];
}

interface ChoiceOption {
  id: string;
  title: string;
  description: string;
  category: 'tracking' | 'sharing' | 'goals' | 'support' | 'privacy';
  impact: 'high' | 'medium' | 'low';
  selected?: boolean;
}

interface EmpowermentAction {
  id: string;
  title: string;
  description: string;
  type: 'learn' | 'connect' | 'customize' | 'advocate' | 'plan';
  difficulty: 'easy' | 'moderate' | 'advanced';
  timeRequired: string;
  benefits: string[];
}

export const UserAgencyDashboard: React.FC<UserAgencyDashboardProps> = ({
  entries,
  userId,
  onChoiceMade,
  onGoalSet,
  onPreferenceUpdated,
}) => {
  const [agencyMetrics, setAgencyMetrics] = useState<AgencyMetric[]>([]);
  const [choiceOptions, setChoiceOptions] = useState<ChoiceOption[]>([]);
  const [empowermentActions, setEmpowermentActions] = useState<EmpowermentAction[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'choices' | 'actions' | 'goals'>(
    'overview'
  );
  const [personalGoals, setPersonalGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    calculateAgencyMetrics();
    generateChoiceOptions();
    generateEmpowermentActions();
    loadPersonalGoals();
  }, [entries, userId]);

  const calculateAgencyMetrics = () => {
    const totalEntries = entries.length;
    const entriesWithNotes = entries.filter(e => e.notes && e.notes.length > 0).length;
    const recentEntries = entries.filter(e => {
      const entryDate = new Date(e.timestamp);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return entryDate >= weekAgo;
    }).length;

    const metrics: AgencyMetric[] = [
      {
        name: 'Self-Advocacy',
        value: Math.min(100, (entriesWithNotes / Math.max(totalEntries, 1)) * 100),
        maxValue: 100,
        description: "How well you're documenting and expressing your experiences",
        color: 'bg-blue-500',
        improvements: [
          'Add more detailed notes to your entries',
          "Describe what helps and what doesn't",
          'Share your insights with your healthcare team',
        ],
      },
      {
        name: 'Consistency Control',
        value: Math.min(100, (recentEntries / 7) * 100),
        maxValue: 100,
        description: 'Your consistency in self-monitoring shows self-control',
        color: 'bg-green-500',
        improvements: [
          'Set daily reminder times that work for you',
          'Create a tracking routine that fits your lifestyle',
          'Celebrate small wins in consistency',
        ],
      },
      {
        name: 'Information Gathering',
        value: Math.min(100, totalEntries * 5), // 5 points per entry
        maxValue: 100,
        description: 'Knowledge about your patterns empowers better decisions',
        color: 'bg-purple-500',
        improvements: [
          'Look for patterns in your data',
          'Research topics that interest you',
          'Ask questions during medical appointments',
        ],
      },
      {
        name: 'Choice Ownership',
        value: 85, // This would be calculated based on user preferences set
        maxValue: 100,
        description: "How much you've customized your experience to fit your needs",
        color: 'bg-orange-500',
        improvements: [
          'Customize your tracking preferences',
          'Set personal goals that matter to you',
          'Choose how and when to share your data',
        ],
      },
    ];

    setAgencyMetrics(metrics);
  };

  const generateChoiceOptions = () => {
    const options: ChoiceOption[] = [
      {
        id: 'tracking-frequency',
        title: 'Tracking Frequency',
        description:
          'Choose how often you want to track - daily, every few days, or when you feel like it',
        category: 'tracking',
        impact: 'high',
      },
      {
        id: 'sharing-level',
        title: 'Data Sharing Control',
        description: 'Decide who can see your data and how much detail to share',
        category: 'privacy',
        impact: 'high',
      },
      {
        id: 'goal-setting',
        title: 'Personal Goal Setting',
        description: 'Define what success looks like for you, beyond just pain scores',
        category: 'goals',
        impact: 'high',
      },
      {
        id: 'reminder-style',
        title: 'Reminder Preferences',
        description: 'Choose gentle nudges, no reminders, or custom notification styles',
        category: 'tracking',
        impact: 'medium',
      },
      {
        id: 'support-network',
        title: 'Support Network',
        description: 'Decide how to connect with healthcare providers, family, or peer support',
        category: 'support',
        impact: 'high',
      },
      {
        id: 'data-export',
        title: 'Data Ownership',
        description: "Export your data anytime - it's yours to keep and use as you choose",
        category: 'privacy',
        impact: 'medium',
      },
    ];

    setChoiceOptions(options);
  };

  const generateEmpowermentActions = () => {
    const actions: EmpowermentAction[] = [
      {
        id: 'learn-patterns',
        title: 'Discover Your Patterns',
        description: 'Analyze your tracking data to identify personal patterns and triggers',
        type: 'learn',
        difficulty: 'easy',
        timeRequired: '10-15 minutes',
        benefits: ['Better self-understanding', 'Informed decision-making', 'Pattern recognition'],
      },
      {
        id: 'customize-dashboard',
        title: 'Customize Your Experience',
        description: 'Modify the interface, metrics, and features to match your preferences',
        type: 'customize',
        difficulty: 'easy',
        timeRequired: '5-10 minutes',
        benefits: ['Personalized experience', 'Increased engagement', 'Better usability'],
      },
      {
        id: 'set-boundaries',
        title: 'Set Digital Boundaries',
        description: 'Control notifications, sharing settings, and data privacy options',
        type: 'advocate',
        difficulty: 'moderate',
        timeRequired: '15-20 minutes',
        benefits: ['Privacy control', 'Reduced overwhelm', 'Intentional engagement'],
      },
      {
        id: 'join-community',
        title: 'Connect with Peers',
        description: 'Join support groups or forums with others who share similar experiences',
        type: 'connect',
        difficulty: 'moderate',
        timeRequired: '20-30 minutes',
        benefits: ['Peer support', 'Shared wisdom', 'Reduced isolation'],
      },
      {
        id: 'advocate-healthcare',
        title: 'Healthcare Self-Advocacy',
        description: 'Use your data to communicate more effectively with healthcare providers',
        type: 'advocate',
        difficulty: 'advanced',
        timeRequired: '30+ minutes',
        benefits: ['Better care coordination', 'Improved outcomes', 'Stronger voice'],
      },
      {
        id: 'create-plan',
        title: 'Personal Action Plan',
        description: 'Develop a personalized plan for managing your health based on your insights',
        type: 'plan',
        difficulty: 'advanced',
        timeRequired: '45+ minutes',
        benefits: ['Clear direction', 'Proactive approach', 'Increased confidence'],
      },
    ];

    setEmpowermentActions(actions);
  };

  const loadPersonalGoals = () => {
    // In a real app, this would load from user preferences/storage
    setPersonalGoals([
      'Understand my pain patterns better',
      'Communicate more effectively with my doctor',
      'Build a sustainable self-care routine',
    ]);
  };

  const handleChoiceSelect = (option: ChoiceOption) => {
    onChoiceMade?.(option.id, option.category);
    // Update the option as selected
    setChoiceOptions(prev => prev.map(o => (o.id === option.id ? { ...o, selected: true } : o)));
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setPersonalGoals(prev => [...prev, newGoal.trim()]);
      onGoalSet?.(newGoal.trim());
      setNewGoal('');
    }
  };

  const handleActionStart = (action: EmpowermentAction) => {
    // In a real app, this would guide the user through the action
    console.log('Starting action:', action.title);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'learn':
        return <Lightbulb className="w-4 h-4" />;
      case 'connect':
        return <MessageSquare className="w-4 h-4" />;
      case 'customize':
        return <Settings className="w-4 h-4" />;
      case 'advocate':
        return <Shield className="w-4 h-4" />;
      case 'plan':
        return <Target className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Agency Metrics */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <User className="w-5 h-5" />
            Your Agency & Control
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            These metrics reflect your empowerment and control over your health journey
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agencyMetrics.map((metric, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">{metric.name}</h4>
                  <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {formatNumber(metric.value, 0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                  <div
                    className={`${metric.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${(metric.value / metric.maxValue) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {metric.description}
                </p>
                {metric.value < 80 && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-xs font-medium text-blue-700 mb-2">WAYS TO INCREASE:</p>
                    <ul className="text-xs text-blue-800 space-y-1">
                      {metric.improvements.slice(0, 2).map((improvement, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Shield className="w-5 h-5" />
            Quick Empowerment Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {empowermentActions.slice(0, 4).map(action => (
              <div
                key={action.id}
                className="bg-white p-3 rounded-lg border cursor-pointer hover:border-green-300 transition-colors"
                onClick={() => handleActionStart(action)}
              >
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(action.type)}
                  <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                    {action.title}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {action.description}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(action.difficulty)}`}
                  >
                    {action.difficulty}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {action.timeRequired}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ChoicesTab = () => (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Settings className="w-5 h-5" />
            Your Choices & Control
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You have full control over how you use this tool. Make choices that feel right for you.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {choiceOptions.map(option => (
              <div
                key={option.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  option.selected
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
                onClick={() => handleChoiceSelect(option)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                        {option.title}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          option.impact === 'high'
                            ? 'bg-red-100 text-red-700'
                            : option.impact === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {option.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                  </div>
                  <div className="ml-4">
                    {option.selected ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const ActionsTab = () => (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Target className="w-5 h-5" />
            Empowerment Actions
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Take action to increase your agency and control over your health journey
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {empowermentActions.map(action => (
              <div key={action.id} className="bg-white p-4 rounded-lg border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="text-orange-600 mt-1">{getTypeIcon(action.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                          {action.title}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(action.difficulty)}`}
                        >
                          {action.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {action.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        Time needed: {action.timeRequired}
                      </p>
                      <div className="bg-orange-50 p-3 rounded-md">
                        <p className="text-xs font-medium text-orange-700 mb-2">BENEFITS:</p>
                        <div className="flex flex-wrap gap-1">
                          {action.benefits.map((benefit, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleActionStart(action)}
                    className="bg-orange-500 hover:bg-orange-600 text-white ml-4"
                  >
                    Start
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const GoalsTab = () => (
    <div className="space-y-6">
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Target className="w-5 h-5" />
            Your Personal Goals
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Define success on your own terms. What matters most to you?
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {personalGoals.map((goal, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{goal}</span>
              </div>
            ))}

            <div className="bg-white p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGoal}
                  onChange={e => setNewGoal(e.target.value)}
                  placeholder="Add a personal goal..."
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm"
                  onKeyPress={e => e.key === 'Enter' && handleAddGoal()}
                />
                <Button
                  onClick={handleAddGoal}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                >
                  Add
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Examples: "Feel more confident talking to my doctor", "Understand what triggers my
                symptoms", "Build a support network"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goal Categories */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Heart className="w-5 h-5" />
            Goal Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                Self-Understanding
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Learn about your patterns, triggers, and what helps
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Communication</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Express your needs and experiences more effectively
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Self-Care</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Develop sustainable practices that support your wellbeing
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Connection</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Build meaningful relationships and support networks
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Your Agency Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          You are in control of your health journey. This space celebrates your autonomy and
          empowers your choices.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg p-1 border">
          {[
            { key: 'overview', label: 'Overview', icon: User },
            { key: 'choices', label: 'Your Choices', icon: Settings },
            { key: 'actions', label: 'Take Action', icon: Target },
            { key: 'goals', label: 'Personal Goals', icon: Heart },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'overview' | 'choices' | 'actions' | 'goals')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === key ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'choices' && <ChoicesTab />}
      {activeTab === 'actions' && <ActionsTab />}
      {activeTab === 'goals' && <GoalsTab />}
    </div>
  );
};

export default UserAgencyDashboard;
