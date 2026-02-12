import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Heart, Shield, Activity, Mail, ArrowRight, BookOpen, Sparkles, ExternalLink, Zap, type LucideIcon } from 'lucide-react';
import { Button } from '../../design-system/components/Button';

interface ResourceLink {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: LucideIcon;
}

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: 'https://github.com/CrisisCore-Systems/pain-tracker', label: 'GitHub' },
    { icon: BookOpen, href: 'https://blog.paintracker.ca', label: 'Blog' },
    { icon: Mail, href: 'mailto:support@paintracker.ca', label: 'Email' },
  ];

  return (
    <footer className="landing-always-dark relative overflow-hidden">
      {/* Final CTA Section - Premium Editorial Design */}
      <div className="relative py-24 overflow-hidden">
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
              Join patients and clinicians using Pain Tracker Pro to understand, track, and manage chronic pain effectively.
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
                  Start Tracking Free
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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Free forever with unlimited entries
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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
        
        <div className="container mx-auto px-4 py-20">
          <div className="grid gap-12 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {/* Brand */}
            <div className="space-y-6 col-span-2 md:col-span-3 lg:col-span-2">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2.5 rounded-xl"
                  style={{ 
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)', 
                    boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)' 
                  }}
                >
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-2xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Pain Tracker Pro
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
                  { label: 'Templates & Guides', onClick: () => navigate('/resources') },
                  { label: 'Download', onClick: () => navigate('/download') },
                  { label: 'Pricing Plans', onClick: () => navigate('/pricing') },
                  { label: 'Privacy Policy', onClick: () => navigate('/privacy'), icon: Shield },
                  { label: 'Source Code', href: 'https://github.com/CrisisCore-Systems/pain-tracker', icon: Github },
                  { label: 'Documentation', href: 'https://github.com/CrisisCore-Systems/pain-tracker/blob/main/README.md' },
                  { label: 'Security Policy', href: 'https://github.com/CrisisCore-Systems/pain-tracker/blob/main/SECURITY.md', icon: Shield },
                  { label: 'Contributing', href: 'https://github.com/CrisisCore-Systems/pain-tracker/blob/main/CONTRIBUTING.md' },
                ] as ResourceLink[]).map((item) => (
                  <li key={item.label}>
                    {item.onClick ? (
                      <button
                        onClick={item.onClick}
                        className="group flex items-center gap-2 text-slate-300 hover:text-sky-400 transition-all duration-200"
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                      </button>
                    ) : (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 text-slate-300 hover:text-sky-400 transition-all duration-200"
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Blog */}
            <div className="space-y-5">
              <h3 className="font-semibold text-sm uppercase tracking-wider flex items-center gap-2 text-purple-400">
                <BookOpen className="h-4 w-4" />
                Blog
              </h3>
              <ul className="space-y-4 text-sm">
                {[
                  { label: 'All Posts', href: 'https://blog.paintracker.ca' },
                  { label: 'Why We Built This', href: 'https://blog.paintracker.ca/building-a-pain-tracker-that-actually-gets-it-no-market-research-required' },
                  { label: 'Crisis Detection', href: 'https://blog.paintracker.ca/i-built-a-crisis-detection-engine-that-never-phones-home' },
                  { label: 'Trauma-Informed Design', href: 'https://blog.paintracker.ca/building-software-that-actually-gives-a-damn-my-journey-with-trauma-informed-design' },
                  { label: 'Healthcare PWA', href: 'https://blog.paintracker.ca/building-a-healthcare-pwa-that-actually-works-when-it-matters' },
                  { label: 'WorkSafe BC Auto-Fill', href: 'https://blog.paintracker.ca/stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free' },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center text-slate-400 hover:text-purple-400 transition-all duration-200"
                    >
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
          <div className="mt-16 pt-12 border-t border-white/5">
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: Shield, label: 'AES-256 Encrypted', color: 'sky' },
                { icon: Heart, label: 'WCAG 2.2 AA target', color: 'purple' },
                { icon: Activity, label: 'HIPAA-aligned controls', color: 'emerald' },
                { icon: Github, label: 'Open Source', color: 'amber' },
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
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-slate-500">
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
            <p className="flex items-center gap-2 text-slate-500">
              Made with <Heart className="h-4 w-4 fill-current text-rose-500 animate-pulse" style={{ animationDuration: '2s' }} /> for chronic pain survivors
            </p>
          </div>

          {/* Privacy Statement - Premium glass card */}
          <div 
            className="mt-10 text-center p-8 rounded-2xl backdrop-blur-xl"
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
              <p className="mt-6 text-center text-[10px] text-slate-700">
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
