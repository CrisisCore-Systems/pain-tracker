import React from 'react';
import { Activity, FileBarChart, Pill, Calendar, TrendingUp, MapPin } from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: '7-Step Pain Assessment',
    description: 'Comprehensive tracking across 25+ anatomical locations with severity gradients.',
  },
  {
    icon: TrendingUp,
    title: 'Pattern Recognition',
    description: 'Advanced heuristic analysis detects pain trends, flares, and correlations.',
  },
  {
    icon: FileBarChart,
    title: 'WorkSafe BC Export',
    description: 'Generate clinical reports for claims, healthcare providers, and legal documentation.',
  },
  {
    icon: Pill,
    title: 'Medication Tracking',
    description: 'Monitor dosages, side effects, and treatment effectiveness over time.',
  },
  {
    icon: Calendar,
    title: 'Quality of Life Metrics',
    description: 'Track mood, sleep, and activity impact with correlation analysis.',
  },
  {
    icon: MapPin,
    title: 'Body Mapping',
    description: 'Visual anatomical heatmaps show pain distribution and progression.',
  },
];

export const FeatureShowcase: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Comprehensive Pain Management Tools
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to understand, track, and communicate your pain effectively.
          </p>
        </div>

        {/* Features List */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex gap-4 p-6 rounded-lg border bg-card hover:shadow-md transition-all duration-300"
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-base">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Ready to take control of your pain management?
          </p>
          <a
            href="/start"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline text-lg"
          >
            Get Started Now
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
};
