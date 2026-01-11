import React from 'react';
import { Shield, Lock, Eye, Code, FileCheck, Users, ArrowRight } from 'lucide-react';

const trustBadges = [
  { icon: Shield, title: 'AES-256', description: 'Military-grade', colorClass: 'icon-emerald' },
  { icon: Lock, title: 'HIPAA-Aligned', description: 'Controls-focused', colorClass: 'icon-sky' },
  { icon: Eye, title: 'Zero Tracking', description: 'No analytics', colorClass: 'icon-purple' },
  { icon: Code, title: 'Open Source', description: 'Transparent code', colorClass: 'icon-pink' },
  { icon: FileCheck, title: 'WCAG 2.2 AA', description: 'Target', colorClass: 'icon-amber' },
  { icon: Users, title: 'Community', description: 'User-driven', colorClass: 'icon-indigo' },
];

export const TrustIndicators: React.FC = () => {
  return (
    <section className="landing-always-dark relative py-20 lg:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Subtle gradient divider at top */}
      <div className="section-divider-glow absolute top-0 left-0 right-0" />
      
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-14 lg:mb-16 max-w-3xl mx-auto stagger-fade-up">
          <h2 className="landing-headline text-3xl sm:text-4xl lg:text-5xl mb-4">
            <span className="text-white">Security & Trust </span>
            <span className="gradient-text-animated">You Can Verify</span>
          </h2>
          <p className="landing-subhead text-lg">
            Your health data deserves the highest level of protection
          </p>
        </div>

        {/* Trust Badges Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 lg:gap-6 max-w-5xl mx-auto mb-14 stagger-fade-up">
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.title}
                className="group flex flex-col items-center text-center p-4 lg:p-5 rounded-2xl transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div className={`icon-glow-container w-12 h-12 lg:w-14 lg:h-14 mb-3 ${badge.colorClass}`}>
                  <Icon className="h-6 w-6 lg:h-7 lg:w-7" />
                </div>
                <h3 className="font-bold text-white text-sm lg:text-base mb-1">{badge.title}</h3>
                <p className="text-xs text-slate-500 hidden sm:block">{badge.description}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-card-premium p-6 lg:p-8">
            <p className="text-slate-400 text-sm lg:text-base leading-relaxed">
              <strong className="text-white font-semibold">Your data, your device.</strong>{' '}
              We use local-first architecture with IndexedDB storage. No servers, no cloud, no third parties.{' '}
              Install it like an app (PWA) on desktop or mobile—no app store required.{" "}
              <a
                href="https://github.com/CrisisCore-Systems/pain-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition-colors font-medium group/link"
              >
                View source code
                <ArrowRight className="h-4 w-4 group-hover/link:translate-x-0.5 transition-transform" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
