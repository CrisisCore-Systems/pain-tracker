/**
 * EmptyStateCard - Card wrapper for empty states with benefits explanation
 */

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../design-system';
import { Lightbulb, TrendingUp, Shield, Clock } from 'lucide-react';

interface Benefit {
  icon: ReactNode;
  title: string;
  description: string;
}

interface EmptyStateCardProps {
  children: ReactNode;
  showBenefits?: boolean;
  customBenefits?: Benefit[];
  className?: string;
}

const defaultBenefits: Benefit[] = [
  {
    icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
    title: 'Track Progress',
    description: 'Visualize improvements and identify patterns in your pain levels over time.'
  },
  {
    icon: <Lightbulb className="h-5 w-5 text-yellow-600" />,
    title: 'Gain Insights',
    description: 'Understand triggers, effective treatments, and optimal times for activities.'
  },
  {
    icon: <Shield className="h-5 w-5 text-green-600" />,
    title: 'Support Care',
    description: 'Share comprehensive reports with healthcare providers for better treatment.'
  },
  {
    icon: <Clock className="h-5 w-5 text-purple-600" />,
    title: 'Save Time',
    description: 'Quick entry forms and smart suggestions make tracking effortless.'
  }
];

export function EmptyStateCard({ 
  children, 
  showBenefits = true, 
  customBenefits,
  className = '' 
}: EmptyStateCardProps) {
  const benefits = customBenefits || defaultBenefits;

  return (
    <Card className={className}>
      <CardContent className="pt-8">
        {children}
        
        {showBenefits && (
          <div className="mt-12 pt-8 border-t border-border">
            <div className="text-center mb-8">
              <h4 className="text-lg font-semibold text-foreground mb-2">
                Why Track Your Pain?
              </h4>
              <p className="text-sm text-muted-foreground">
                Understanding your pain patterns can lead to better management and improved quality of life
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 p-2 bg-muted rounded-lg">
                    {benefit.icon}
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground mb-1">{benefit.title}</h5>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}