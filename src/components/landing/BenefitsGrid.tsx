import React from 'react';
import { Lock, BarChart3, Heart, WifiOff, Zap, Users } from 'lucide-react';

const benefits = [
  {
    icon: Lock,
    title: '100% Local & Private',
    description: 'Your pain data never leaves your device. No cloud uploads, no tracking, no data collection. AES-256 encryption.',
    stat: 'Zero cloud storage',
    iconClass: 'icon-emerald',
    statClass: 'stat-counter-emerald',
  },
  {
    icon: BarChart3,
    title: 'Pattern Analytics',
    description: 'Advanced pattern recognition with 10+ heuristic algorithms detects medication efficacy, triggers, correlations, and trends.',
    stat: '10+ algorithms',
    iconClass: 'icon-sky',
    statClass: 'stat-counter-sky',
  },
  {
    icon: Heart,
    title: 'Trauma-Informed Design',
    description: 'Built with empathy for chronic pain sufferers. Gentle language, accessible interface, crisis detection, and panic mode.',
    stat: 'WCAG 2.1 AA',
    iconClass: 'icon-pink',
    statClass: 'stat-counter-pink',
  },
  {
    icon: WifiOff,
    title: 'Works Completely Offline',
    description: 'Full functionality without internet. Progressive Web App technology ensures you can track pain anytime, anywhere.',
    stat: '100% offline',
    iconClass: 'icon-purple',
    statClass: 'stat-counter-purple',
  },
  {
    icon: Zap,
    title: 'Instant Insights',
    description: 'Real-time pattern detection, automated alerts for pain escalation, and one-click report generation.',
    stat: 'One-click export',
    iconClass: 'icon-amber',
    statClass: 'stat-counter-amber',
  },
  {
    icon: Users,
    title: 'Built with Patients',
    description: 'Community-driven development with input from chronic pain sufferers, healthcare providers, and accessibility experts.',
    stat: 'Community driven',
    iconClass: 'icon-indigo',
    statClass: 'stat-counter-indigo',
  },
];

export const BenefitsGrid: React.FC = () => {
  return (
    <section id="features" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/50 to-slate-900" />
      
      {/* Decorative orbs */}
      <div className="orb-container">
        <div 
          className="orb-glow orb-glow-sky" 
          style={{ width: '450px', height: '450px', top: '20%', left: '-10%' }}
        />
        <div 
          className="orb-glow orb-glow-purple" 
          style={{ width: '400px', height: '400px', bottom: '20%', right: '-10%', animationDelay: '10s' }}
        />
      </div>
      
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20 max-w-3xl mx-auto stagger-fade-up">
          <div className="badge-glow-sky inline-flex items-center gap-2 mb-6">
            <Zap className="h-4 w-4" />
            <span>Powerful Features</span>
          </div>
          
          <h2 className="landing-headline landing-headline-lg mb-6">
            <span className="text-white">Why Choose </span>
            <span className="gradient-text-animated">Pain Tracker Pro?</span>
          </h2>
          <p className="landing-subhead text-lg lg:text-xl">
            Powerful features designed with your privacy, security, and well-being in mind.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto stagger-fade-up">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="glass-card-premium group relative p-7"
              >
                <div className="relative space-y-5">
                  {/* Icon and Stat Badge */}
                  <div className="flex items-start justify-between">
                    <div className={`icon-glow-container w-14 h-14 ${benefit.iconClass}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className={`badge-glow-${benefit.iconClass.replace('icon-', '')} text-xs font-bold uppercase tracking-wider px-3 py-1.5`}>
                      {benefit.stat}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                {/* Decorative corner gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-5 bg-gradient-to-br from-white to-transparent" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
