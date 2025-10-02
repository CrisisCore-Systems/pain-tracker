/**
 * SampleDataSetup - Final step of onboarding
 * Offers to set up sample data for exploration
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
        <h3 className="text-2xl font-bold text-foreground mb-3">
          How would you like to start?
        </h3>
        <p className="text-muted-foreground">
          Choose your preferred way to begin your pain tracking journey
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
              <h4 className="font-semibold text-foreground mb-2">Start with Sample Data</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Explore Pain Tracker with pre-filled sample entries to see how features work. 
                Perfect for understanding the app before adding your own data.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-primary/10 text-primary-foreground px-2 py-1 rounded">
                  Try before you track
                </span>
                <span className="text-xs bg-primary/10 text-primary-foreground px-2 py-1 rounded">
                  See example reports
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
              <h4 className="font-semibold text-foreground mb-2">Start Fresh</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Begin with a clean slate and add your first real pain entry. 
                Best for users ready to start tracking immediately.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-destructive/10 text-destructive-foreground px-2 py-1 rounded">
                  Clean start
                </span>
                <span className="text-xs bg-destructive/10 text-destructive-foreground px-2 py-1 rounded">
                  Real data only
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
          All data is stored locally on your device. You can clear sample data anytime, 
          and no information is sent to external servers.
        </p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button
          variant="outline"
          onClick={onPrevious}
        >
          Previous
        </Button>
        
        <Button
          onClick={handleComplete}
          disabled={!selectedOption}
          className="min-w-24"
        >
          {selectedOption === 'sample' ? 'Setup with Samples' : selectedOption === 'fresh' ? 'Start Fresh' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}