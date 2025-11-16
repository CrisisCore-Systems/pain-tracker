import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../design-system/components/Card';
import { Lock, BarChart3, Heart, WifiOff } from 'lucide-react';

const benefits = [
  {
    icon: Lock,
    title: '100% Local & Private',
    description: 'Your pain data never leaves your device. No cloud uploads, no tracking, no data collection. Complete privacy guaranteed.',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
  },
  {
    icon: BarChart3,
    title: 'Clinical-Grade Analytics',
    description: 'Advanced pattern recognition, trigger correlations, and WorkSafe BC reporting. Tools designed for patients and healthcare providers.',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
  },
  {
    icon: Heart,
    title: 'Trauma-Informed Design',
    description: 'Built with empathy for chronic pain sufferers. Gentle language, accessible interface, crisis support, and customizable sensitivity.',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/20',
  },
  {
    icon: WifiOff,
    title: 'Works Completely Offline',
    description: 'Full functionality without internet. Progressive Web App technology ensures you can track pain anytime, anywhere.',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
  },
];

export const BenefitsGrid: React.FC = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Why Choose Pain Tracker Pro?
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed with your privacy, security, and well-being in mind.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={benefit.title}
                className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader className="space-y-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg ${benefit.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${benefit.color}`} />
                  </div>

                  {/* Title */}
                  <CardTitle className="text-xl">
                    {benefit.title}
                  </CardTitle>

                  {/* Description */}
                  <CardDescription className="text-base leading-relaxed">
                    {benefit.description}
                  </CardDescription>
                </CardHeader>

                {/* Decorative gradient */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${benefit.bgColor} rounded-full blur-3xl opacity-20 -z-10`} />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
