import React from 'react';
import { Lock, BarChart3, Heart, WifiOff, Zap, Users } from 'lucide-react';

const benefits = [
  {
    icon: Lock,
    title: '100% Local & Private',
    description: 'Your pain data never leaves your device. No cloud uploads, no tracking, no data collection. Military-grade AES-256 encryption.',
    stat: 'Zero data breaches',
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16, 185, 129, 0.3)',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#34d399',
  },
  {
    icon: BarChart3,
    title: 'AI-Powered Analytics',
    description: 'Advanced pattern recognition with 8 AI algorithms detects medication efficacy, triggers, correlations, and trends.',
    stat: '8 AI algorithms',
    gradient: 'from-sky-500 to-blue-500',
    glow: 'rgba(14, 165, 233, 0.3)',
    iconBg: 'rgba(14, 165, 233, 0.15)',
    iconColor: '#38bdf8',
  },
  {
    icon: Heart,
    title: 'Trauma-Informed Design',
    description: 'Built with empathy for chronic pain sufferers. Gentle language, accessible interface, crisis detection, and panic mode.',
    stat: 'WCAG 2.1 AA',
    gradient: 'from-rose-500 to-pink-500',
    glow: 'rgba(244, 63, 94, 0.3)',
    iconBg: 'rgba(244, 63, 94, 0.15)',
    iconColor: '#fb7185',
  },
  {
    icon: WifiOff,
    title: 'Works Completely Offline',
    description: 'Full functionality without internet. Progressive Web App technology ensures you can track pain anytime, anywhere.',
    stat: '100% offline',
    gradient: 'from-purple-500 to-violet-500',
    glow: 'rgba(168, 85, 247, 0.3)',
    iconBg: 'rgba(168, 85, 247, 0.15)',
    iconColor: '#c084fc',
  },
  {
    icon: Zap,
    title: 'Instant Insights',
    description: 'Real-time pattern detection, automated alerts for pain escalation, and one-click report generation.',
    stat: '95% time savings',
    gradient: 'from-amber-500 to-orange-500',
    glow: 'rgba(245, 158, 11, 0.3)',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#fbbf24',
  },
  {
    icon: Users,
    title: 'Built with Patients',
    description: 'Community-driven development with input from chronic pain sufferers, healthcare providers, and accessibility experts.',
    stat: 'Community verified',
    gradient: 'from-indigo-500 to-blue-500',
    glow: 'rgba(99, 102, 241, 0.3)',
    iconBg: 'rgba(99, 102, 241, 0.15)',
    iconColor: '#818cf8',
  },
];

export const BenefitsGrid: React.FC = () => {
  return (
    <section id="features" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/50 to-slate-900" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
               style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
            <Zap className="h-4 w-4 text-sky-400" />
            <span className="text-sm font-medium text-sky-300">Powerful Features</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Why Choose <span className="bg-gradient-to-r from-sky-400 to-purple-400 bg-clip-text text-transparent">Pain Tracker Pro?</span>
          </h2>
          <p className="text-lg text-slate-400">
            Powerful features designed with your privacy, security, and well-being in mind.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 8px 40px ${benefit.glow}, 0 4px 20px rgba(0, 0, 0, 0.3)`;
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                {/* Hover glow effect */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${benefit.glow} 0%, transparent 70%)` }}
                />
                
                <div className="relative space-y-4">
                  {/* Icon and Stat Badge */}
                  <div className="flex items-start justify-between">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: benefit.iconBg, boxShadow: `0 4px 12px ${benefit.glow}` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: benefit.iconColor }} />
                    </div>
                    <span 
                      className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                      style={{ background: benefit.iconBg, color: benefit.iconColor }}
                    >
                      {benefit.stat}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all"
                      style={{ backgroundImage: `linear-gradient(135deg, ${benefit.iconColor}, white)` }}>
                    {benefit.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                {/* Decorative corner gradient */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10"
                  style={{ background: `linear-gradient(135deg, ${benefit.iconColor} 0%, transparent 100%)` }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
