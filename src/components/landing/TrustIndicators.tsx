import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Code, FileCheck, Users, ArrowRight } from 'lucide-react';

const privacyProofCards = [
  {
    icon: Users,
    title: 'No account',
    description: 'No email, login, password reset, or profile is required before you can start tracking.',
    colorClass: 'icon-indigo',
  },
  {
    icon: Shield,
    title: 'Local-first storage',
    description: 'Routine pain records stay on your device by default instead of being pushed into a central database.',
    colorClass: 'icon-emerald',
  },
  {
    icon: Lock,
    title: 'Protected entries',
    description: 'Sensitive records are protected locally, with sharing and export left to deliberate user action.',
    colorClass: 'icon-sky',
  },
  {
    icon: Eye,
    title: 'No central health database',
    description: 'There is no backend database collecting your day-to-day pain history as a default operating model.',
    colorClass: 'icon-purple',
  },
  {
    icon: FileCheck,
    title: 'User-controlled exports',
    description: 'PDF, CSV, and JSON files are created only when you ask for them.',
    colorClass: 'icon-amber',
  },
  {
    icon: Code,
    title: 'Open source proof',
    description: 'The codebase is public so the privacy story can be inspected instead of taken on faith.',
    colorClass: 'icon-pink',
  },
];

const localDataRows = [
  {
    label: 'Pain entries',
    location: 'Your device',
    access: 'You',
  },
  {
    label: 'Passphrase',
    location: 'Your device',
    access: 'You',
  },
  {
    label: 'Exports',
    location: 'Created only when requested',
    access: 'Whoever you share them with',
  },
  {
    label: 'Cloud account',
    location: 'None',
    access: 'Nobody',
  },
  {
    label: 'Central health database',
    location: 'None',
    access: 'Nobody',
  },
];

export const TrustIndicators: React.FC = () => {
  return (
    <section id="trust-proof" className="landing-always-dark relative py-20 lg:py-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Subtle gradient divider at top */}
      <div className="section-divider-glow absolute top-0 left-0 right-0" />
      
      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-14 lg:mb-16 max-w-3xl mx-auto stagger-fade-up">
          <h2 className="landing-headline text-3xl sm:text-4xl lg:text-5xl mb-4">
            <span className="text-white">Privacy is not a setting. </span>
            <span className="gradient-text-animated">It is the architecture.</span>
          </h2>
          <p className="landing-subhead text-lg">
            The homepage should make the trust model legible fast: what stays local, what is never collected by default, and what only exists when you export it.
          </p>
        </div>

        {/* Privacy Proof Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 lg:gap-6 max-w-5xl mx-auto mb-14 stagger-fade-up">
          {privacyProofCards.map((badge) => {
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

        <div className="max-w-5xl mx-auto mb-10">
          <div className="glass-card-premium overflow-hidden">
            <div className="border-b border-white/10 px-6 py-5 text-left">
              <h3 className="text-xl font-semibold text-white">What stays on your device unless you export it</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                The privacy claim is strongest when the storage boundary is visible: what lives locally, what only exists after an export, and what simply does not exist at all.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-sm uppercase tracking-[0.18em] text-sky-300">
                    <th className="px-6 py-4 font-medium">Data</th>
                    <th className="px-6 py-4 font-medium">Where it lives</th>
                    <th className="px-6 py-4 font-medium">Who can access it</th>
                  </tr>
                </thead>
                <tbody>
                  {localDataRows.map((row) => (
                    <tr key={row.label} className="border-b border-white/5 last:border-b-0">
                      <td className="px-6 py-4 text-white font-medium">{row.label}</td>
                      <td className="px-6 py-4 text-slate-300">{row.location}</td>
                      <td className="px-6 py-4 text-slate-400">{row.access}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card-premium p-6 lg:p-8">
            <p className="text-slate-400 text-sm lg:text-base leading-relaxed mb-4">
              <strong className="text-white font-semibold">Important:</strong>{' '}
              local-first storage reduces exposure, but it also means browser-data cleanup, device loss, or forgotten passphrases can make records unrecoverable. Export backups regularly.
            </p>
            <div className="mb-4">
              <Link
                to="/privacy-architecture"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-300 hover:text-sky-200 transition-colors"
              >
                Read the privacy architecture
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <a
              href="https://github.com/CrisisCore-Systems/pain-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 transition-colors font-medium group/link"
            >
              View source code
              <ArrowRight className="h-4 w-4 group-hover/link:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
