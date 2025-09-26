/**
 * FeatureHighlights - Second step of onboarding
 * Showcases key features and capabilities
 */

import { BarChart, FileText, Clock, Shield } from 'lucide-react';
import { Button } from '../../design-system';

interface FeatureHighlightsProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function FeatureHighlights({ onNext, onPrevious }: FeatureHighlightsProps) {
  const features = [
    {
      icon: BarChart,
      title: 'Visual Analytics',
      description: 'Interactive charts and graphs to visualize your pain patterns, trends, and progress over time.',
      highlight: 'See your progress at a glance'
    },
    {
      icon: FileText,
      title: 'WCB Reports',
      description: 'Generate comprehensive reports for WorkSafe BC submissions with all required documentation.',
      highlight: 'Professional medical reports'
    },
    {
      icon: Clock,
      title: 'Smart Tracking',
      description: 'Quick and easy pain entry forms with intelligent suggestions and auto-save functionality.',
      highlight: 'Never lose your data'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'All your data stays on your device. No cloud storage, no tracking, complete privacy.',
      highlight: 'Your data is yours alone'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-3">
          Powerful Features for Better Health
        </h3>
        <p className="text-muted-foreground">
          Discover what makes Pain Tracker the complete solution for pain management
        </p>
      </div>

      <div className="space-y-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-4 p-4 rounded-lg border bg-card/50">
            <div className="bg-primary/10 rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-2">{feature.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                {feature.highlight}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Button
          variant="outline"
          onClick={onPrevious}
        >
          Previous
        </Button>
        
        <Button
          onClick={onNext}
          className="min-w-24"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}