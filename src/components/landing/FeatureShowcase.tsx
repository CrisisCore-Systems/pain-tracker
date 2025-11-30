import React from 'react';
import { Activity, FileBarChart, Pill, Calendar, TrendingUp, MapPin, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: '7-Step Pain Assessment',
    description: 'Comprehensive tracking across 25+ anatomical locations with severity gradients.',
    color: '#38bdf8',
  },
  {
    icon: TrendingUp,
    title: 'Pattern Recognition',
    description: 'Advanced heuristic analysis detects pain trends, flares, and correlations.',
    color: '#a855f7',
  },
  {
    icon: FileBarChart,
    title: 'WorkSafe BC Export',
    description: 'Generate clinical reports for claims, healthcare providers, and legal documentation.',
    color: '#34d399',
  },
  {
    icon: Pill,
    title: 'Medication Tracking',
    description: 'Monitor dosages, side effects, and treatment effectiveness over time.',
    color: '#f59e0b',
  },
  {
    icon: Calendar,
    title: 'Quality of Life Metrics',
    description: 'Track mood, sleep, and activity impact with correlation analysis.',
    color: '#ec4899',
  },
  {
    icon: MapPin,
    title: 'Body Mapping',
    description: 'Visual anatomical heatmaps show pain distribution and progression.',
    color: '#6366f1',
  },
];

export const FeatureShowcase: React.FC = () => {
  return (
    <section 
      className="py-16 md:py-24 relative overflow-hidden"
      style={{ background: '#0f172a' }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div 
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-6"
            style={{ 
              background: 'rgba(52, 211, 153, 0.15)', 
              border: '1px solid rgba(52, 211, 153, 0.3)' 
            }}
          >
            <Sparkles className="h-4 w-4" style={{ color: '#6ee7b7' }} />
            <span style={{ color: '#a7f3d0' }}>Powerful Features</span>
          </div>
          
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-white">
            Comprehensive Pain Management{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">
              Tools
            </span>
          </h2>
          <p className="text-lg" style={{ color: '#94a3b8' }}>
            Everything you need to understand, track, and communicate your pain effectively.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group flex gap-4 p-6 rounded-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = feature.color + '40';
                  e.currentTarget.style.boxShadow = `0 8px 30px ${feature.color}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.1)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
                }}
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ 
                      background: feature.color + '20',
                      boxShadow: `0 4px 15px ${feature.color}20`
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: feature.color }} />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2 min-w-0 flex-1">
                  <h3 
                    className="font-semibold text-base leading-tight"
                    style={{ color: '#e2e8f0' }}
                  >
                    {feature.title}
                  </h3>
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: '#94a3b8' }}
                  >
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="mb-4" style={{ color: '#64748b' }}>
            Ready to take control of your pain management?
          </p>
          <a
            href="/start"
            className="inline-flex items-center gap-2 font-semibold text-lg transition-all hover:gap-3"
            style={{ color: '#34d399' }}
          >
            Get Started Now
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
};
