/**
 * Ritual Setup Component
 * 
 * Allows users to configure their daily ritual preferences.
 * Includes template selection, timing, and tone customization.
 */

import React, { useState, useEffect } from 'react';
import { dailyRitualService } from '@pain-tracker/services';
import type { RitualTemplate, TimingSuggestion } from '@pain-tracker/services';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../../design-system';
import { Clock, Moon, Sun, Zap, Settings } from 'lucide-react';

interface RitualSetupProps {
  entries: any[];
  onComplete?: () => void;
  className?: string;
}

export const RitualSetup: React.FC<RitualSetupProps> = ({
  entries,
  onComplete,
  className = '',
}) => {
  const [step, setStep] = useState<'type' | 'time' | 'tone' | 'complete'>('type');
  const [selectedType, setSelectedType] = useState<'morning' | 'evening' | 'both' | 'custom'>('evening');
  const [selectedTime, setSelectedTime] = useState<string>('20:00');
  const [selectedTone, setSelectedTone] = useState<'gentle' | 'encouraging' | 'structured' | 'minimal'>('gentle');
  const [timingSuggestions, setTimingSuggestions] = useState<TimingSuggestion[]>([]);
  const [templates, setTemplates] = useState<RitualTemplate[]>([]);

  useEffect(() => {
    const suggestions = dailyRitualService.getTimingSuggestions(entries);
    setTimingSuggestions(suggestions);
    
    const allTemplates = dailyRitualService.getRitualTemplates();
    setTemplates(allTemplates);
  }, [entries]);

  const handleComplete = () => {
    dailyRitualService.setupRitual({
      ritualEnabled: true,
      ritualType: selectedType,
      morningTime: selectedType === 'morning' || selectedType === 'both' ? '08:00' : null,
      eveningTime: selectedType === 'evening' || selectedType === 'both' ? selectedTime : null,
      ritualTone: selectedTone,
    });
    
    setStep('complete');
    setTimeout(() => {
      onComplete?.();
    }, 2000);
  };

  const renderTypeSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">When would you like to check in?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => setSelectedType('morning')}
          className={`p-4 border-2 rounded-lg text-left transition-all ${
            selectedType === 'morning'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Sun className="w-6 h-6 text-yellow-500" />
            <span className="font-semibold">Morning Check-In</span>
          </div>
          <p className="text-sm text-gray-600">Start your day with intention</p>
        </button>

        <button
          onClick={() => setSelectedType('evening')}
          className={`p-4 border-2 rounded-lg text-left transition-all ${
            selectedType === 'evening'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Moon className="w-6 h-6 text-purple-500" />
            <span className="font-semibold">Evening Reflection</span>
          </div>
          <p className="text-sm text-gray-600">Process your day before bed</p>
        </button>

        <button
          onClick={() => setSelectedType('both')}
          className={`p-4 border-2 rounded-lg text-left transition-all ${
            selectedType === 'both'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-blue-500" />
            <span className="font-semibold">Morning & Evening</span>
          </div>
          <p className="text-sm text-gray-600">Full daily practice</p>
        </button>

        <button
          onClick={() => setSelectedType('custom')}
          className={`p-4 border-2 rounded-lg text-left transition-all ${
            selectedType === 'custom'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 text-gray-500" />
            <span className="font-semibold">Custom Times</span>
          </div>
          <p className="text-sm text-gray-600">Set your own schedule</p>
        </button>
      </div>
      <Button onClick={() => setStep('time')} className="w-full mt-4">
        Continue
      </Button>
    </div>
  );

  const renderTimeSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">What time works best?</h3>
      
      {timingSuggestions.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">Based on your tracking history:</p>
          <div className="space-y-2">
            {timingSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setSelectedTime(suggestion.time)}
                className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                  selectedTime === suggestion.time
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{suggestion.time}</span>
                  <span className="text-sm text-gray-500">
                    {Math.round(suggestion.confidence * 100)}% match
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{suggestion.reason}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or choose a custom time:
        </label>
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={() => setStep('type')} className="flex-1">
          Back
        </Button>
        <Button onClick={() => setStep('tone')} className="flex-1">
          Continue
        </Button>
      </div>
    </div>
  );

  const renderToneSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">How should we remind you?</h3>
      <div className="space-y-3">
        <button
          onClick={() => setSelectedTone('gentle')}
          className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
            selectedTone === 'gentle'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="font-semibold">Gentle & Supportive</span>
          <p className="text-sm text-gray-600 mt-1">
            "Taking a moment to check in. How are you feeling?"
          </p>
        </button>

        <button
          onClick={() => setSelectedTone('encouraging')}
          className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
            selectedTone === 'encouraging'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="font-semibold">Encouraging & Uplifting</span>
          <p className="text-sm text-gray-600 mt-1">
            "You're doing great! Ready to check in?"
          </p>
        </button>

        <button
          onClick={() => setSelectedTone('structured')}
          className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
            selectedTone === 'structured'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="font-semibold">Structured & Clear</span>
          <p className="text-sm text-gray-600 mt-1">
            "Time for your daily check-in."
          </p>
        </button>

        <button
          onClick={() => setSelectedTone('minimal')}
          className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
            selectedTone === 'minimal'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="font-semibold">Minimal</span>
          <p className="text-sm text-gray-600 mt-1">
            "Check-in time"
          </p>
        </button>
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={() => setStep('time')} className="flex-1">
          Back
        </Button>
        <Button onClick={handleComplete} className="flex-1">
          Complete Setup
        </Button>
      </div>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Zap className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2">You're all set! 🎉</h3>
      <p className="text-gray-600">
        Your daily ritual is ready. We'll remind you at {selectedTime}.
      </p>
    </div>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Set Up Your Daily Ritual</CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'type' && renderTypeSelection()}
        {step === 'time' && renderTimeSelection()}
        {step === 'tone' && renderToneSelection()}
        {step === 'complete' && renderComplete()}
      </CardContent>
    </Card>
  );
};
