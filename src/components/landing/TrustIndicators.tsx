import React from 'react';
import { Shield, Lock, Eye, Code, FileCheck, Users } from 'lucide-react';

const trustBadges = [
  { icon: Shield, title: 'AES-256', description: 'Military-grade', color: '#34d399' },
  { icon: Lock, title: 'HIPAA-Aligned', description: 'Healthcare compliant', color: '#38bdf8' },
  { icon: Eye, title: 'Zero Tracking', description: 'No analytics', color: '#c084fc' },
  { icon: Code, title: 'Open Source', description: 'Transparent code', color: '#fb7185' },
  { icon: FileCheck, title: 'WCAG 2.1 AA', description: 'Accessible', color: '#fbbf24' },
  { icon: Users, title: 'Community', description: 'User-driven', color: '#818cf8' },
];

export const TrustIndicators: React.FC = () => {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%)' }} />
      
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Security & Trust <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">You Can Verify</span>
          </h2>
          <p className="text-slate-400">
            Your health data deserves the highest level of protection
          </p>
        </div>

        {/* Trust Badges Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-5xl mx-auto mb-12">
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.title}
                className="group flex flex-col items-center text-center p-4 rounded-xl transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                  style={{ 
                    background: `${badge.color}20`,
                    boxShadow: `0 4px 15px ${badge.color}30`
                  }}
                >
                  <Icon className="h-6 w-6" style={{ color: badge.color }} />
                </div>
                <h3 className="font-bold text-white text-sm">{badge.title}</h3>
                <p className="text-xs text-slate-500 hidden sm:block">{badge.description}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div 
          className="max-w-2xl mx-auto text-center p-6 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <p className="text-slate-400">
            <strong className="text-white">Your data, your device.</strong> We use local-first architecture with IndexedDB storage. No servers, no cloud, no third parties.{' '}
            <a
              href="https://github.com/CrisisCore-Systems/pain-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 hover:underline transition-colors"
            >
              View source code →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
