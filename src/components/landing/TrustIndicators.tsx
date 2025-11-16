import React from 'react';
import { Shield, Lock, Eye, Code, FileCheck, Users } from 'lucide-react';

const trustBadges = [
  {
    icon: Shield,
    title: 'AES-256 Encryption',
    description: 'Military-grade encryption',
  },
  {
    icon: Lock,
    title: 'HIPAA-Aligned',
    description: 'Healthcare data standards',
  },
  {
    icon: Eye,
    title: 'Zero Tracking',
    description: 'No analytics or cookies',
  },
  {
    icon: Code,
    title: 'Open Source',
    description: 'Auditable & transparent',
  },
  {
    icon: FileCheck,
    title: 'WCAG 2.1 AA',
    description: 'Accessibility certified',
  },
  {
    icon: Users,
    title: 'Community-Driven',
    description: 'Built with patients',
  },
];

export const TrustIndicators: React.FC = () => {
  return (
    <section className="py-12 md:py-16 border-y bg-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl mb-2">
            Security & Trust You Can Verify
          </h2>
          <p className="text-muted-foreground">
            Your health data deserves the highest level of protection
          </p>
        </div>

        {/* Trust Badges Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
          {trustBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.title}
                className="flex flex-col items-center text-center space-y-2 p-4 rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-sm">
                  {badge.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            <strong>Your data, your device.</strong> We use local-first architecture with IndexedDB storage. 
            No servers, no cloud, no third parties. <a href="https://github.com/CrisisCore-Systems/pain-tracker" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View source code →</a>
          </p>
        </div>
      </div>
    </section>
  );
};
