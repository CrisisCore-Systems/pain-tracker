import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Code, Heart, Shield, Mail, ArrowRight, BookOpen, Sparkles, ExternalLink, Zap, type LucideIcon } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { BrandedLogo } from '../branding/BrandedLogo';

interface ResourceLink {
  label: string;
  to?: string;
  href?: string;
  icon?: LucideIcon;
}

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const footerNavLinkClass = 'group flex h-auto min-h-0 items-center gap-2 border-0 bg-transparent p-0 text-left text-slate-300 transition-all duration-200 hover:text-sky-400';
  const footerExternalLinkClass = 'group flex h-auto min-h-0 items-center gap-2 border-0 bg-transparent p-0 text-left text-slate-300 transition-all duration-200 hover:text-sky-400';
  const footerBlogLinkClass = 'group flex h-auto min-h-0 items-center border-0 bg-transparent p-0 text-left text-slate-400 transition-all duration-200 hover:text-purple-400';

  const socialLinks = [
    { icon: Code, href: 'https://github.com/CrisisCore-Systems', label: 'GitHub Org' },
    { icon: BookOpen, href: 'https://dev.to/crisiscoresystems', label: 'DEV' },
    { icon: Shield, href: 'https://protective-computing.github.io', label: 'Protective Computing' },
    { icon: Mail, href: 'mailto:support@paintracker.ca', label: 'Email' },
  ];

  const proofNetworkLinks: ResourceLink[] = [
    { label: 'CrisisCore Systems', href: 'https://crisiscore-systems.ca' },
    { label: 'GitHub Org', href: 'https://github.com/CrisisCore-Systems', icon: Code },
    { label: 'DEV Essays', href: 'https://dev.to/crisiscoresystems', icon: BookOpen },
    { label: 'Protective Computing Library', href: 'https://protective-computing.github.io', icon: Shield },
    { label: 'PainTracker', href: 'https://paintracker.ca', icon: Heart },
  ];

  return (
    <footer className="relative">
      {/* Final CTA Section - Premium Editorial Design */}
      <div className="relative overflow-hidden py-20 sm:py-24">
        {/* Background with gradient mesh */}
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(56,189,248,0.08)_0%,_transparent_70%)]" />
        
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '4s' }} />
        </div>

        {/* Gradient divider at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />

        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium bg-slate-800/80 border border-white/10 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-slate-200">Start Your Journey Today</span>
            </div>
            
            {/* Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              Ready to Transform Your{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Pain Management?
                </span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-sky-500/30" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M0 7 Q50 0 100 4 Q150 8 200 1" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </span>
            </h2>
            
            {/* Subheadline */}
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Used by patients and healthcare professionals to document, understand, and communicate chronic pain clearly.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/start')}
                className="group relative px-10 py-5 text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)',
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 3s ease-in-out infinite',
                  boxShadow: '0 10px 40px rgba(14, 165, 233, 0.3), 0 0 60px rgba(14, 165, 233, 0.1)',
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Use the app free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/pricing')}
                className="group px-10 py-5 text-lg transition-all duration-300 hover:scale-105"
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#e2e8f0',
                }}
              >
                <span className="flex items-center gap-2">
                  View Pricing
                  <ExternalLink className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </span>
              </Button>
            </div>
            
            {/* Trust points */}
            <p className="text-slate-500 text-sm flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{' '}
                Free forever with unlimited entries
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{' '}
                No credit card required
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative bg-slate-950">
        {/* Subtle top gradient */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        
        <div className="container mx-auto px-4 py-14 sm:py-16">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-12">
            {/* Brand */}
            <div className="col-span-1 space-y-6 sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3">
                <BrandedLogo variant="icon" size="md" />
                <span className="font-bold text-2xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Pain Tracker
                </span>
              </div>
              <p className="text-slate-300 max-w-md leading-relaxed">
                Privacy-first pain tracking with local insights, reporting tools, and trauma-informed design—built with empathy for those who need it most.
              </p>
              
              {/* Social links with premium styling */}
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3 rounded-xl transition-all duration-300 hover:scale-110"
                      style={{ 
                        background: 'rgba(51, 65, 85, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(14, 165, 233, 0.2)';
                        e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(14, 165, 233, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      aria-label={link.label}
                    >
                      <Icon className="h-5 w-5 text-slate-300 group-hover:text-sky-400 transition-colors" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-5">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-white">
                Resources
              </h3>
              <ul className="space-y-4 text-sm">
                {([
                  { label: 'Free Pain Tracker Templates', to: '/resources' },
                  { label: 'Pain Diary Starter Pack', href: '/assets/free-pain-tracking-starter-pack.zip' },
                  { label: 'Templates & Guides', to: '/resources' },
                  { label: 'Whitepaper (PDF)', to: '/whitepaper' },
                  { label: 'Overton Framework (Canon)', to: '/overton-framework', icon: BookOpen },
                  { label: 'Download', to: '/download' },
                  { label: 'Pricing Plans', to: '/pricing' },
                  { label: 'Privacy Policy', to: '/privacy', icon: Shield },
                  { label: 'Terms of Service', to: '/terms', icon: Shield },
                  { label: 'Tracking & Data Policy', to: '/tracking-data-policy', icon: Shield },
                  { label: 'Source Code', href: 'https://github.com/CrisisCore-Systems/pain-tracker', icon: Code },
                  { label: 'Documentation', href: 'https://github.com/CrisisCore-Systems/pain-tracker/blob/main/README.md' },
                  { label: 'Security Policy', href: 'https://github.com/CrisisCore-Systems/pain-tracker/blob/main/SECURITY.md', icon: Shield },
                  { label: 'Contributing', href: 'https://github.com/CrisisCore-Systems/pain-tracker/blob/main/CONTRIBUTING.md' },
                ] as ResourceLink[]).map((item) => (
                  <li key={item.label}>
                    {item.to ? (
                      <Link to={item.to} className={footerNavLinkClass}>
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={footerExternalLinkClass}
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Proof Network */}
            <div className="space-y-5">
              <h3 className="font-semibold text-sm uppercase tracking-wider flex items-center gap-2 text-sky-300">
                <Shield className="h-4 w-4" />
                Proof Network
              </h3>
              <ul className="space-y-4 text-sm">
                {proofNetworkLinks.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={footerBlogLinkClass}
                    >
                      {item.icon && <item.icon className="h-4 w-4" />}
                      <span className="group-hover:translate-x-1 transition-transform truncate">{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features */}
            <div className="space-y-5">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-white">
                Key Features
              </h3>
              <ul className="space-y-3 text-sm">
                {[
                  '10+ Pattern Tools',
                  'WorkSafe BC Reports',
                  'On-device alerts',
                  'Installable PWA',
                  'AES-256 Encryption',
                  'Trauma-Informed',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Trust Badges - Premium glass design */}
          <div className="mt-12 border-t border-white/5 pt-8 sm:mt-16 sm:pt-12">
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: Shield, label: 'AES-256 Encrypted', color: 'sky' },
                { icon: Heart, label: 'WCAG 2.2 AA target', color: 'purple' },
                { icon: Activity, label: 'Privacy-aligned security controls', color: 'emerald' },
                { icon: Code, label: 'Open Source', color: 'amber' },
              ].map((badge) => {
                const colors: Record<string, { bg: string; border: string; text: string }> = {
                  sky: { bg: 'rgba(56, 189, 248, 0.1)', border: 'rgba(56, 189, 248, 0.3)', text: '#38bdf8' },
                  purple: { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)', text: '#a855f7' },
                  emerald: { bg: 'rgba(52, 211, 153, 0.1)', border: 'rgba(52, 211, 153, 0.3)', text: '#34d399' },
                  amber: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b' },
                };
                const Icon = badge.icon;
                return (
                  <div
                    key={badge.label}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-sm"
                    style={{
                      background: colors[badge.color].bg,
                      border: `1px solid ${colors[badge.color].border}`,
                      color: colors[badge.color].text,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 pt-6 border-t border-white/5 flex flex-col items-center gap-3 text-sm text-center md:flex-row md:justify-between md:text-left">
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-slate-400 md:justify-start">
              <p>© {currentYear} CrisisCore Systems</p>
              <a
                href="https://github.com/CrisisCore-Systems/pain-tracker/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-sky-400 transition-colors duration-200"
              >
                View License
              </a>
            </div>
            <p className="flex flex-wrap items-center justify-center gap-2 text-slate-400 md:justify-end">
              Made with <Heart className="h-4 w-4 fill-current text-rose-500 animate-pulse" style={{ animationDuration: '2s' }} /> for chronic pain survivors
            </p>
          </div>

          {/* Privacy Statement - Premium glass card */}
          <div 
            className="mt-6 rounded-2xl p-6 text-center backdrop-blur-xl sm:p-8"
            style={{ 
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.15)',
              boxShadow: '0 0 40px rgba(56, 189, 248, 0.05)',
            }}
          >
            <p className="text-sm leading-relaxed text-slate-400">
              <strong className="text-white">Privacy-first by default:</strong>{' '}
              Core tracking data is stored on your device. Exports and optional backup/sync are user-initiated.{' '}
              Optional analytics can be enabled explicitly and is disabled by default.{' '}
              Built in accordance with{' '}
              <a
                href="https://github.com/CrisisCore-Systems/overton-framework/blob/pc-core-v1.0.0/protective-computing/spec/protective-computing-core-v1.0.md"
                className="text-sky-400 hover:text-sky-300 transition-colors duration-200"
                target="_blank"
                rel="noreferrer"
              >
                Protective Computing Core v1.0
              </a>
              .{' '}
              <a
                href="https://github.com/CrisisCore-Systems/pain-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors duration-200"
              >
                Verify our code
                <ArrowRight className="h-3 w-3" />
              </a>
            </p>
          </div>

          {/* Build ID (dev-only unless explicitly enabled) */}
          {(import.meta.env.DEV || import.meta.env.VITE_SHOW_BUILD_INFO === 'true') &&
            import.meta.env.VITE_BUILD_HASH && (
              <p className="mt-6 text-center text-[10px] text-slate-400">
                Build: {import.meta.env.VITE_BUILD_HASH}
              </p>
            )}
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </footer>
  );
};
