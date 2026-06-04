/**
 * SampleDataSetup - Final step of onboarding
 * Offers a temporary mock-data analytics preview or a fresh local start.
 */

import { useState } from 'react';
import { Database, Sparkles, User } from 'lucide-react';
import { Button } from '../../design-system';

interface SampleDataSetupProps {
  onComplete: (setupWithSampleData: boolean) => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function SampleDataSetup({ onComplete, onPrevious }: SampleDataSetupProps) {
  const [selectedOption, setSelectedOption] = useState<'sample' | 'fresh' | null>(null);

  const handleComplete = () => {
    onComplete(selectedOption === 'sample');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-3">How would you like to start?</h3>
        <p className="text-muted-foreground">
          Preview the workflow with mock data, or begin with your own first entry.
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setSelectedOption('sample')}
          className={`w-full p-6 rounded-lg border-2 transition-all ${
            selectedOption === 'sample'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className="rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0 bg-primary/10 dark:bg-primary/20">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="text-left flex-1">
              <h4 className="font-semibold text-foreground mb-2">Preview with Mock Data</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Browse example analytics before adding your own record. The preview is separate
                from your entries and ends when you start your own log.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-primary/10 text-primary-foreground px-2 py-1 rounded">
                  Mock entries only
                </span>
                <span className="text-xs bg-primary/10 text-primary-foreground px-2 py-1 rounded">
                  Temporary analytics preview
                </span>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setSelectedOption('fresh')}
          className={`w-full p-6 rounded-lg border-2 transition-all ${
            selectedOption === 'fresh'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className="rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0 bg-destructive/10 dark:bg-destructive/20">
              <User className="h-6 w-6 text-destructive-foreground" />
            </div>
            <div className="text-left flex-1">
              <h4 className="font-semibold text-foreground mb-2">Start with My Own Entry</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Go directly to the quick entry screen. Your first saved entry starts your local
                record.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-destructive/10 text-destructive-foreground px-2 py-1 rounded">
                  No mock data
                </span>
                <span className="text-xs bg-destructive/10 text-destructive-foreground px-2 py-1 rounded">
                  Local record
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Privacy Note</span>
        </div>
        <p className="text-xs text-muted-foreground">
          The preview uses local example data only. It does not grant a subscription, upload health
          data, or become part of your record.
        </p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>

        <Button onClick={handleComplete} disabled={!selectedOption} className="min-w-24">
          {selectedOption === 'sample'
            ? 'Preview Mock Analytics'
            : selectedOption === 'fresh'
              ? 'Start My Entry'
              : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
