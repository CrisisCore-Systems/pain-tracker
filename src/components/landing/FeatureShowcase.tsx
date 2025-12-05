import React from 'react';
import { Activity, FileBarChart, Pill, Calendar, TrendingUp, MapPin, Sparkles, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: '7-Step Pain Assessment',
    description: 'Comprehensive tracking across 25+ anatomical locations with severity gradients.',
    colorClass: 'icon-sky',
    glowColor: 'rgba(14, 165, 233, 0.3)',
  },
  {
    icon: TrendingUp,
    title: 'Pattern Recognition',
    description: 'Advanced heuristic algorithms detect pain trends, flares, and correlations.',
    colorClass: 'icon-purple',
    glowColor: 'rgba(168, 85, 247, 0.3)',
  },
  {
    icon: FileBarChart,
    title: 'WorkSafe BC Export',
    description: 'Generate clinical reports for claims, healthcare providers, and legal documentation.',
    colorClass: 'icon-emerald',
    glowColor: 'rgba(16, 185, 129, 0.3)',
  },
  {
    icon: Pill,
    title: 'Medication Tracking',
    description: 'Monitor dosages, side effects, and treatment effectiveness over time.',
    colorClass: 'icon-amber',
    glowColor: 'rgba(245, 158, 11, 0.3)',
  },
  {
    icon: Calendar,
    title: 'Quality of Life Metrics',
    description: 'Track mood, sleep, and activity impact with correlation analysis.',
    colorClass: 'icon-pink',
    glowColor: 'rgba(236, 72, 153, 0.3)',
  },
  {
    icon: MapPin,
    title: 'Body Mapping',
    description: 'Visual anatomical heatmaps show pain distribution and progression.',
    colorClass: 'icon-indigo',
    glowColor: 'rgba(99, 102, 241, 0.3)',
  },
];

export const FeatureShowcase: React.FC = () => {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/50 to-slate-900" />
      
      {/* Decorative orbs */}
      <div className="orb-container">
        <div 
          className="orb-glow orb-glow-emerald" 
          style={{ width: '400px', height: '400px', top: '10%', left: '-5%' }}
        />
        <div 
          className="orb-glow orb-glow-sky" 
          style={{ width: '350px', height: '350px', bottom: '10%', right: '-5%', animationDelay: '8s' }}
        />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20 max-w-3xl mx-auto stagger-fade-up">
          <div className="badge-glow-emerald inline-flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Powerful Features</span>
          </div>
          
          <h2 className="landing-headline landing-headline-lg mb-6">
            <span className="text-white">Comprehensive Pain Management </span>
            <span className="gradient-text-animated">Tools</span>
          </h2>
          <p className="landing-subhead text-lg lg:text-xl">
            Everything you need to understand, track, and communicate your pain effectively.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto stagger-fade-up">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="feature-card-glow group flex gap-5 p-6"
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className={`icon-glow-container w-14 h-14 ${feature.colorClass}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-3 min-w-0 flex-1">
                  <h3 className="font-bold text-lg text-white group-hover:text-sky-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 mb-5">
            Ready to take control of your pain management?
          </p>
          <a
            href="/start"
            className="inline-flex items-center gap-2 text-lg font-semibold text-emerald-400 hover:text-emerald-300 transition-all group"
          >
            Get Started Now
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};
