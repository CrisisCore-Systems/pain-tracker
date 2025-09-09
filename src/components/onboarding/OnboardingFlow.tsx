/**
 * OnboardingFlow - Main onboarding orchestrator component
 * Manages the multi-step onboarding experience for new users
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../design-system';
import { WelcomeScreen } from './WelcomeScreen';
import { FeatureHighlights } from './FeatureHighlights';
import { SampleDataSetup } from './SampleDataSetup';

interface OnboardingFlowProps {
  onComplete: (setupWithSampleData: boolean) => void;
  onSkip: () => void;
}

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const steps = [
    { component: WelcomeScreen, title: 'Welcome' },
    { component: FeatureHighlights, title: 'Features' },
    { component: SampleDataSetup, title: 'Setup' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = (setupWithSampleData: boolean) => {
    setIsVisible(false);
    onComplete(setupWithSampleData);
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  // Focus management for accessibility
  useEffect(() => {
    const stepElement = document.querySelector('[data-onboarding-step]');
    if (stepElement) {
      (stepElement as HTMLElement).focus();
    }
  }, [currentStep]);

  if (!isVisible) return null;

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardContent className="p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 
                id="onboarding-title"
                className="text-2xl font-bold text-foreground"
              >
                {steps[currentStep].title}
              </h2>
              <button
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Skip onboarding"
                type="button"
              >
                Skip
              </button>
            </div>
            
            {/* Progress indicator */}
            <div className="flex space-x-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 flex-1 rounded ${
                    index <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                  role="progressbar"
                  aria-label={`Onboarding step ${index + 1} of ${steps.length}`}
                  aria-valuenow={currentStep + 1}
                  aria-valuemax={steps.length}
                />
              ))}
            </div>
          </div>

          <div data-onboarding-step tabIndex={-1}>
            <CurrentStepComponent
              onNext={handleNext}
              onPrevious={handlePrevious}
              onComplete={handleComplete}
              onSkip={handleSkip}
              isFirstStep={currentStep === 0}
              isLastStep={currentStep === steps.length - 1}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}