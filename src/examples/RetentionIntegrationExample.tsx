/**
 * Retention Features Integration Example
 * 
 * Demonstrates how to integrate the retention loop components
 * into the main pain tracker application.
 */

import React, { useState } from 'react';
import {
  DailyCheckInPrompt,
  ReturnIncentiveWidget,
  IdentityDashboard,
  RitualSetup,
} from '../components/retention';
import { usePainTrackerStore } from '../stores/pain-tracker-store';

/**
 * Example: Main Dashboard with Retention Features
 */
export const DashboardWithRetention: React.FC = () => {
  const { entries } = usePainTrackerStore();
  const [showRitualSetup, setShowRitualSetup] = useState(false);

  const handleStartCheckIn = () => {
    // Navigate to pain entry form
    console.log('Navigate to pain entry form');
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Daily Check-In Prompt (shows once per day) */}
      <DailyCheckInPrompt
        onStartCheckIn={handleStartCheckIn}
        onDismiss={() => console.log('Prompt dismissed')}
      />

      {/* Return Incentive Widget */}
      <ReturnIncentiveWidget entries={entries} />

      {/* Identity Dashboard */}
      <IdentityDashboard entries={entries} />

      {/* Ritual Setup (show during onboarding or in settings) */}
      {showRitualSetup && (
        <RitualSetup
          entries={entries}
          onComplete={() => {
            setShowRitualSetup(false);
            console.log('Ritual setup complete');
          }}
        />
      )}

      {/* Rest of dashboard content */}
      <div className="mt-8">
        {/* Pain tracker form, charts, etc. */}
      </div>
    </div>
  );
};

/**
 * Example: Onboarding Flow with Ritual Setup
 */
export const OnboardingWithRitual: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'features' | 'ritual' | 'complete'>('welcome');
  const { entries } = usePainTrackerStore();

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Welcome to Pain Tracker</h2>
            <p className="mb-6">Let's get you set up for success</p>
            <button
              onClick={() => setStep('features')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              Get Started
            </button>
          </div>
        );
      
      case 'features':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Key Features</h2>
            <p className="mb-6">Daily tracking, insights, and support</p>
            <button
              onClick={() => setStep('ritual')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              Continue
            </button>
          </div>
        );
      
      case 'ritual':
        return (
          <RitualSetup
            entries={entries}
            onComplete={() => setStep('complete')}
          />
        );
      
      case 'complete':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">You're All Set! 🎉</h2>
            <p className="mb-6">Ready to start your tracking journey</p>
            <button
              onClick={() => console.log('Navigate to dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              Go to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {renderStep()}
      </div>
    </div>
  );
};

/**
 * Example: Settings Page Integration
 */
export const SettingsWithRetentionPreferences: React.FC = () => {
  const { entries } = usePainTrackerStore();
  const [showRitualSetup, setShowRitualSetup] = useState(false);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Existing settings sections */}
      
      {/* Retention & Habits Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Daily Habits & Check-Ins</h2>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Daily Prompts</h3>
              <p className="text-sm text-gray-600">
                Receive gentle reminders to check in
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Daily Ritual</h3>
              <p className="text-sm text-gray-600">
                Set up a consistent tracking routine
              </p>
            </div>
            <button
              onClick={() => setShowRitualSetup(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
            >
              Configure
            </button>
          </div>
        </div>
      </section>

      {/* Ritual Setup Modal */}
      {showRitualSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <RitualSetup
              entries={entries}
              onComplete={() => setShowRitualSetup(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
