import React, { useState } from 'react';
import { Activity, Brain, Heart, Moon, Zap, TrendingUp, BookOpen, Users } from 'lucide-react';
import type { FibromyalgiaEntry } from '../../types/fibromyalgia';
import { usePainTrackerStore } from '../../stores/pain-tracker-store';

export const FibromyalgiaTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'track' | 'patterns' | 'education' | 'community'>('track');

  const tabs = [
    { id: 'track', label: 'Daily Tracking', icon: Activity },
    { id: 'patterns', label: 'Patterns & Insights', icon: TrendingUp },
    { id: 'education', label: 'Learn About Fibro', icon: BookOpen },
    { id: 'community', label: 'Support & Tips', icon: Users },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-purple-100 dark:border-purple-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Fibromyalgia Support Hub
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive tracking and support for living with fibromyalgia
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'track' && <DailyTracking />}
        {activeTab === 'patterns' && <PatternsInsights />}
        {activeTab === 'education' && <EducationResources />}
        {activeTab === 'community' && <CommunitySupport />}
      </div>
    </div>
  );
};

// Daily Tracking Component
const DailyTracking: React.FC = () => {
  const addFibromyalgiaEntry = usePainTrackerStore((state) => state.addFibromyalgiaEntry);
  const [wpiRegions, setWpiRegions] = useState<Record<string, boolean>>({});
  const [sssScores, setSssScores] = useState({
    fatigue: 0,
    waking_unrefreshed: 0,
    cognitive_symptoms: 0,
    somatic_symptoms: 0,
  });
  const [isSaving, setIsSaving] = useState(false);

  const wpiBodyRegions = [
    { id: 'leftShoulder', label: 'Left Shoulder', side: 'left' },
    { id: 'rightShoulder', label: 'Right Shoulder', side: 'right' },
    { id: 'leftUpperArm', label: 'Left Upper Arm', side: 'left' },
    { id: 'rightUpperArm', label: 'Right Upper Arm', side: 'right' },
    { id: 'leftLowerArm', label: 'Left Lower Arm', side: 'left' },
    { id: 'rightLowerArm', label: 'Right Lower Arm', side: 'right' },
    { id: 'leftHip', label: 'Left Hip', side: 'left' },
    { id: 'rightHip', label: 'Right Hip', side: 'right' },
    { id: 'leftUpperLeg', label: 'Left Upper Leg', side: 'left' },
    { id: 'rightUpperLeg', label: 'Right Upper Leg', side: 'right' },
    { id: 'leftLowerLeg', label: 'Left Lower Leg', side: 'left' },
    { id: 'rightLowerLeg', label: 'Right Lower Leg', side: 'right' },
    { id: 'jaw', label: 'Jaw', side: 'central' },
    { id: 'chest', label: 'Chest', side: 'central' },
    { id: 'abdomen', label: 'Abdomen', side: 'central' },
    { id: 'upperBack', label: 'Upper Back', side: 'central' },
    { id: 'lowerBack', label: 'Lower Back', side: 'central' },
    { id: 'neck', label: 'Neck', side: 'central' },
  ];

  const calculateWPI = () => {
    return Object.values(wpiRegions).filter(Boolean).length;
  };

  const calculateSSS = () => {
    return Object.values(sssScores).reduce((sum, val) => sum + val, 0);
  };

  const wpiScore = calculateWPI();
  const sssScore = calculateSSS();
  const meetsCriteria = (wpiScore >= 7 && sssScore >= 5) || (wpiScore >= 4 && wpiScore <= 6 && sssScore >= 9);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const entry: FibromyalgiaEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        
        // ACR 2016 Criteria - WPI as nested object
        wpi: {
          leftShoulder: wpiRegions.leftShoulder || false,
          rightShoulder: wpiRegions.rightShoulder || false,
          leftUpperArm: wpiRegions.leftUpperArm || false,
          rightUpperArm: wpiRegions.rightUpperArm || false,
          leftLowerArm: wpiRegions.leftLowerArm || false,
          rightLowerArm: wpiRegions.rightLowerArm || false,
          leftHip: wpiRegions.leftHip || false,
          rightHip: wpiRegions.rightHip || false,
          leftUpperLeg: wpiRegions.leftUpperLeg || false,
          rightUpperLeg: wpiRegions.rightUpperLeg || false,
          leftLowerLeg: wpiRegions.leftLowerLeg || false,
          rightLowerLeg: wpiRegions.rightLowerLeg || false,
          jaw: wpiRegions.jaw || false,
          chest: wpiRegions.chest || false,
          abdomen: wpiRegions.abdomen || false,
          upperBack: wpiRegions.upperBack || false,
          lowerBack: wpiRegions.lowerBack || false,
          neck: wpiRegions.neck || false,
        },
        
        // SSS as nested object
        sss: {
          fatigue: sssScores.fatigue as 0 | 1 | 2 | 3,
          waking_unrefreshed: sssScores.waking_unrefreshed as 0 | 1 | 2 | 3,
          cognitive_symptoms: sssScores.cognitive_symptoms as 0 | 1 | 2 | 3,
          somatic_symptoms: sssScores.somatic_symptoms as 0 | 1 | 2 | 3,
        },
        
        // Default symptoms object
        symptoms: {
          headache: false,
          migraine: false,
          ibs: false,
          temporomandibularDisorder: false,
          restlessLegSyndrome: false,
          lightSensitivity: false,
          soundSensitivity: false,
          temperatureSensitivity: false,
          chemicalSensitivity: false,
          clothingSensitivity: false,
          touchSensitivity: false,
          numbnessTingling: false,
          muscleStiffness: false,
          jointPain: false,
          brainfog: false,
          memoryProblems: false,
          concentrationDifficulty: false,
        },
        
        // Default triggers
        triggers: {},
        
        // Default impact
        impact: {
          sleepQuality: 2 as 0 | 1 | 2 | 3 | 4 | 5,
          moodRating: 2 as 0 | 1 | 2 | 3 | 4 | 5,
          anxietyLevel: 2 as 0 | 1 | 2 | 3 | 4 | 5,
          functionalAbility: 2 as 0 | 1 | 2 | 3 | 4 | 5,
        },
        
        // Default activity
        activity: {
          activityLevel: 'moderate',
          restPeriods: 0,
          overexerted: false,
          paybackPeriod: false,
        },
        
        // Default interventions
        interventions: {},
        
        // Metadata
        notes: '',
      };

      await addFibromyalgiaEntry(entry);
      
      // Reset form
      setWpiRegions({});
      setSssScores({
        fatigue: 0,
        waking_unrefreshed: 0,
        cognitive_symptoms: 0,
        somatic_symptoms: 0,
      });
      
      // Success feedback
      alert('Fibromyalgia entry saved successfully!');
    } catch (error) {
      console.error('Failed to save fibromyalgia entry:', error);
      alert('Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Diagnostic Criteria Card */}
      <div className={`
        p-6 rounded-xl shadow-lg border-2 transition-all
        ${meetsCriteria
          ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
        }
      `}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            ACR 2016 Diagnostic Criteria
          </h2>
          {meetsCriteria && (
            <span className="px-3 py-1 bg-purple-500 text-white text-sm font-medium rounded-full">
              Criteria Met
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Widespread Pain Index (WPI)</div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{wpiScore} / 19</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Need ≥7 for primary criteria</div>
          </div>
          
          <div className="p-4 bg-white dark:bg-gray-700 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400">Symptom Severity Scale (SSS)</div>
            <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{sssScore} / 12</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Need ≥5 for primary criteria</div>
          </div>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <strong>Diagnosis requires:</strong> WPI ≥7 AND SSS ≥5, OR WPI 4-6 AND SSS ≥9
        </div>
      </div>

      {/* Widespread Pain Index */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-500" />
          Widespread Pain Index (WPI)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Select all areas where you've had pain in the last week:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {wpiBodyRegions.map((region) => (
            <button
              key={region.id}
              onClick={() => setWpiRegions(prev => ({ ...prev, [region.id]: !prev[region.id] }))}
              className={`
                p-3 rounded-lg border-2 text-left transition-all
                ${wpiRegions[region.id]
                  ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 dark:border-purple-600'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-purple-300'
                }
              `}
            >
              <div className="font-medium text-gray-900 dark:text-white">{region.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{region.side}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Symptom Severity Scale */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-pink-500" />
          Symptom Severity Scale (SSS)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Rate each symptom over the past week (0 = No problem, 3 = Severe):
        </p>

        <div className="space-y-4">
          {[
            { id: 'fatigue', label: 'Fatigue', icon: Moon },
            { id: 'waking_unrefreshed', label: 'Waking Unrefreshed', icon: Moon },
            { id: 'cognitive_symptoms', label: 'Cognitive Symptoms (Fibro Fog)', icon: Brain },
            { id: 'somatic_symptoms', label: 'Somatic Symptoms (Headache, IBS, etc.)', icon: Heart },
          ].map((symptom) => {
            const Icon = symptom.icon;
            return (
              <div key={symptom.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">{symptom.label}</span>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((score) => (
                    <button
                      key={score}
                      onClick={() => setSssScores(prev => ({ ...prev, [symptom.id]: score as 0 | 1 | 2 | 3 }))}
                      className={`
                        flex-1 py-2 rounded-lg font-medium transition-all
                        ${sssScores[symptom.id as keyof typeof sssScores] === score
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-500'
                        }
                      `}
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>None</span>
                  <span>Severe</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? 'Saving...' : 'Save Today\'s Entry'}
      </button>
    </div>
  );
};

// Patterns & Insights Component
const PatternsInsights: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Pattern Analysis Coming Soon</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Track your entries to see patterns in your fibromyalgia symptoms, triggers, and effective interventions.
        </p>
      </div>
    </div>
  );
};

// Education Resources Component
const EducationResources: React.FC = () => {
  const resources = [
    {
      title: 'Understanding Fibromyalgia',
      description: 'Learn about the ACR diagnostic criteria, symptoms, and latest research',
      category: 'diagnosis',
    },
    {
      title: 'Managing Flare-Ups',
      description: 'Strategies for identifying triggers and reducing flare severity',
      category: 'management',
    },
    {
      title: 'Pacing & Energy Management',
      description: 'Learn the "energy envelope" theory and avoid boom-bust cycles',
      category: 'management',
    },
    {
      title: 'Latest Research',
      description: 'Stay informed about new treatments and clinical trials',
      category: 'research',
    },
  ];

  return (
    <div className="space-y-4">
      {resources.map((resource, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{resource.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{resource.description}</p>
            </div>
            <BookOpen className="w-5 h-5 text-purple-500 flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Community Support Component
const CommunitySupport: React.FC = () => {
  const tips = [
    {
      title: 'Pacing is Key',
      content: 'Break tasks into smaller chunks. Rest BEFORE you feel exhausted, not after.',
      author: 'Community Tip',
    },
    {
      title: 'Track Your Baseline',
      content: 'Find your "good day" activity level and stay at 70% of that to avoid crashes.',
      author: 'Clinical Guideline',
    },
    {
      title: 'Weather Watch',
      content: 'Many report flares with barometric pressure changes. Track weather alongside symptoms.',
      author: 'Community Insight',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">You Are Not Alone</h3>
        <p className="text-purple-100">
          Millions live with fibromyalgia. These community tips and validated strategies can help.
        </p>
      </div>

      <div className="space-y-4">
        {tips.map((tip, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">{tip.title}</h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{tip.content}</p>
                <span className="text-xs text-purple-600 dark:text-purple-400">— {tip.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
