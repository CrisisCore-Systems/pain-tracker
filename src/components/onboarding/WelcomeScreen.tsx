/**
 * WelcomeScreen - First step of onboarding
 * Welcomes new users and introduces the pain tracking concept
 */

import { Activity, Heart, TrendingUp } from 'lucide-react';
import { Button } from '../../design-system';

interface WelcomeScreenProps {
  onNext: () => void;
  onSkip: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function WelcomeScreen({ onNext, onSkip }: WelcomeScreenProps) {
  return (
    <div className="text-center space-y-6">
      <div className="mb-8">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Activity className="h-16 w-16 text-primary" />
            <Heart className="h-6 w-6 text-red-500 absolute -top-1 -right-1" />
          </div>
        </div>

        <h3 className="text-3xl font-bold text-foreground mb-4">Welcome to Pain Tracker</h3>

        <p className="text-lg text-muted-foreground mb-6 max-w-md mx-auto">
          Take control of your pain management journey with comprehensive tracking and insights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="text-center">
          <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <h4 className="font-semibold text-foreground mb-2">Track Daily</h4>
          <p className="text-sm text-muted-foreground">
            Record pain levels, symptoms, and daily activities
          </p>
        </div>

        <div className="text-center">
          <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <h4 className="font-semibold text-foreground mb-2">Analyze Trends</h4>
          <p className="text-sm text-muted-foreground">
            Visualize patterns and improvements over time
          </p>
        </div>

        <div className="text-center">
          <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
            <Heart className="h-6 w-6 text-primary" />
          </div>
          <h4 className="font-semibold text-foreground mb-2">Improve Life</h4>
          <p className="text-sm text-muted-foreground">
            Make informed decisions with your healthcare team
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button variant="outline" onClick={onSkip}>
          Skip Tour
        </Button>

        <Button onClick={onNext} className="min-w-24">
          Get Started
        </Button>
      </div>
    </div>
  );
}
