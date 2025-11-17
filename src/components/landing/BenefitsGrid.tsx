import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../design-system/components/Card';
import { Lock, BarChart3, Heart, WifiOff, Zap, Users } from 'lucide-react';

const benefits = [
  {
    icon: Lock,
    title: '100% Local & Private',
    description:
      'Your pain data never leaves your device. No cloud uploads, no tracking, no data collection. Military-grade AES-256 encryption keeps your health data completely private.',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/20',
    stat: 'Zero data breaches',
  },
  {
    icon: BarChart3,
    title: 'AI-Powered Analytics',
    description:
      'Advanced pattern recognition with 8 AI algorithms detects medication efficacy, triggers, correlations, and trends. Professional WorkSafe BC reporting included.',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    stat: '8 AI algorithms',
  },
  {
    icon: Heart,
    title: 'Trauma-Informed Design',
    description:
      'Built with empathy for chronic pain sufferers. Gentle language, accessible interface, crisis detection, panic mode, and customizable sensitivity settings.',
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/20',
    stat: 'WCAG 2.1 AA certified',
  },
  {
    icon: WifiOff,
    title: 'Works Completely Offline',
    description:
      'Full functionality without internet. Progressive Web App technology with background sync ensures you can track pain anytime, anywhere.',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    stat: '100% offline capable',
  },
  {
    icon: Zap,
    title: 'Instant Insights',
    description:
      'Real-time pattern detection, automated alerts for pain escalation, and one-click report generation. Save 25+ hours per week on documentation.',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/20',
    stat: '95% time savings',
  },
  {
    icon: Users,
    title: 'Built with Patients',
    description:
      'Community-driven development with input from chronic pain sufferers, healthcare providers, and accessibility experts. Open source and transparent.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
    stat: 'Community verified',
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8 max-w-7xl mx-auto">
          {benefits.map(benefit => {
            const Icon = benefit.icon;
            return (
              <Card
                key={benefit.title}
                className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
              >
                <CardHeader className="space-y-4">
                  {/* Icon and Stat Badge */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-12 h-12 rounded-lg ${benefit.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`h-6 w-6 ${benefit.color}`} />
                    </div>
                    <div className={`text-xs font-semibold ${benefit.color} px-2 py-1 rounded-full ${benefit.bgColor}`}>
                      {benefit.stat}
                    </div>
                  </div>

                  {/* Title */}
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>

                  {/* Description */}
                  <CardDescription className="text-base leading-relaxed">
                    {benefit.description}
                  </CardDescription>
                </CardHeader>

                {/* Decorative gradient */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 ${benefit.bgColor} rounded-full blur-3xl opacity-20 -z-10`}
                />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
