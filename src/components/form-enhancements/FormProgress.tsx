/**
 * FormProgress - Visual progress indicator for multi-step forms
 */

import { Check } from 'lucide-react';

interface FormStep {
  label: string;
  description?: string;
  isOptional?: boolean;
}

interface FormProgressProps {
  steps: FormStep[];
  currentStep: number;
  completedSteps?: number[];
  className?: string;
}

export function FormProgress({
  steps,
  currentStep,
  completedSteps = [],
  className = '',
}: FormProgressProps) {
  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      return 'completed';
    } else if (stepIndex === currentStep) {
      return 'current';
    } else if (stepIndex < currentStep) {
      return 'completed';
    } else {
      return 'upcoming';
    }
  };

  const getStepClasses = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-primary text-primary-foreground border-primary';
      case 'current':
        return 'bg-primary/10 text-primary border-primary';
      case 'upcoming':
        return 'bg-muted text-muted-foreground border-muted';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getConnectorClasses = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    return status === 'completed' || stepIndex < currentStep ? 'bg-primary' : 'bg-muted';
  };

  return (
    <nav aria-label="Form progress" className={className}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <li key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                {/* Step circle */}
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-full border-2 
                    transition-all duration-200 ${getStepClasses(status)}
                  `}
                  aria-current={status === 'current' ? 'step' : undefined}
                >
                  {status === 'completed' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                {/* Step label */}
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      status === 'current'
                        ? 'text-primary'
                        : status === 'completed'
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                    {step.isOptional && (
                      <span className="text-xs text-muted-foreground ml-1">(optional)</span>
                    )}
                  </div>

                  {step.description && (
                    <div className="text-xs text-muted-foreground mt-1 max-w-24">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-4">
                  <div
                    className={`h-0.5 transition-all duration-200 ${getConnectorClasses(index)}`}
                    aria-hidden="true"
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
