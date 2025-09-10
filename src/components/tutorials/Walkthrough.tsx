/**
 * Walkthrough - Interactive walkthrough component for guiding users through features
 */

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Button } from '../../design-system';

interface WalkthroughStep {
  target: string; // CSS selector for the target element
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: string; // Optional action text
}

interface WalkthroughProps {
  steps: WalkthroughStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function Walkthrough({ steps, isActive, onComplete, onSkip }: WalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStepData = steps[currentStep];

  // Find and highlight target element
  useEffect(() => {
    if (!isActive || !currentStepData) return;

    const element = document.querySelector(currentStepData.target) as HTMLElement;
    if (element) {
      setTargetElement(element);
      
      // Scroll element into view
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });

      // Add highlight class
      element.classList.add('walkthrough-highlight');
      
      return () => {
        element.classList.remove('walkthrough-highlight');
      };
    }
  }, [currentStep, currentStepData, isActive]);

  // Position overlay near target element
  const getOverlayPosition = () => {
    if (!targetElement) return {};

    const rect = targetElement.getBoundingClientRect();
    const placement = currentStepData.placement || 'bottom';

    switch (placement) {
      case 'top':
        return {
          top: rect.top - 20,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - 20,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + 20,
          transform: 'translate(0, -50%)'
        };
      default:
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0)'
        };
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onSkip();
    } else if (e.key === 'ArrowLeft' && currentStep > 0) {
      handlePrevious();
    } else if (e.key === 'ArrowRight' && currentStep < steps.length - 1) {
      handleNext();
    }
  };

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerHTML = `
      .walkthrough-highlight {
        position: relative;
        z-index: 45;
        box-shadow: 0 0 0 4px rgba(var(--primary), 0.5);
        border-radius: 4px;
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  if (!isActive || !currentStepData) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" />
      
      {/* Walkthrough overlay */}
      <div
        ref={overlayRef}
        className="fixed z-50 max-w-sm"
        style={getOverlayPosition()}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className="bg-popover border rounded-lg shadow-lg p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <button
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Skip walkthrough"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex space-x-1 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="mb-4">
            <h3 className="font-semibold text-foreground mb-2">{currentStepData.title}</h3>
            <p className="text-sm text-muted-foreground">{currentStepData.content}</p>
            {currentStepData.action && (
              <p className="text-xs text-primary mt-2 font-medium">
                Try it: {currentStepData.action}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center space-x-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Previous</span>
            </Button>

            <Button
              size="sm"
              onClick={handleNext}
              className="flex items-center space-x-1"
            >
              <span>{currentStep === steps.length - 1 ? 'Finish' : 'Next'}</span>
              {currentStep < steps.length - 1 && <ArrowRight className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>

    </>
  );
}