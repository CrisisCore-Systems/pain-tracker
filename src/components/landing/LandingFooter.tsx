import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Heart, Shield, Activity, Mail, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '../../design-system/components/Button';

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: 'https://github.com/CrisisCore-Systems/pain-tracker', label: 'GitHub' },
    { icon: BookOpen, href: 'https://paintracker.hashnode.dev', label: 'Blog' },
    { icon: Mail, href: 'mailto:support@paintracker.ca', label: 'Email' },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Final CTA Section - Toned down for eye comfort */}
      <div 
        className="relative py-16"
        style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        }}
      >
        {/* Subtle background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div 
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
              style={{ background: 'rgba(100, 116, 139, 0.2)', border: '1px solid rgba(100, 116, 139, 0.3)' }}
            >
              <Sparkles className="h-4 w-4" style={{ color: '#94a3b8' }} />
              <span style={{ color: '#cbd5e1' }}>Start Your Journey Today</span>
            </div>
            
            <h2 
              className="text-3xl sm:text-4xl font-bold"
              style={{ color: '#e2e8f0' }}
            >
              Ready to Transform Your{' '}
              <span className="bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                Pain Management?
              </span>
            </h2>
            
            <p style={{ color: '#94a3b8' }} className="max-w-xl mx-auto">
              Join thousands of patients and clinicians using Pain Tracker Pro to understand, track, and manage chronic pain effectively.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/start')}
                className="px-8 py-4 text-white transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  boxShadow: '0 4px 15px rgba(14, 165, 233, 0.25)',
                }}
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/pricing')}
                className="px-8 py-4 transition-all"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                  color: '#94a3b8',
                }}
              >
                View Pricing
              </Button>
            </div>
            
            <p style={{ color: '#64748b' }} className="text-sm">
              Free forever with unlimited entries • Upgrade for AI insights & clinical exports • No credit card required
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div style={{ background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)' }}>
        <div className="container mx-auto px-4 py-16">
          <div className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {/* Brand */}
            <div className="space-y-4 col-span-2 md:col-span-3 lg:col-span-2">
              <div className="flex items-center gap-2">
                <div 
                  className="p-2 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)' }}
                >
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Pain Tracker Pro
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                Professional-grade chronic pain tracking with AI-powered insights, automated reporting, and trauma-informed design.
              </p>
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg transition-all duration-300 hover:scale-110"
                      style={{ background: 'rgba(51, 65, 85, 0.5)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(14, 165, 233, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)';
                      }}
                      aria-label={link.label}
                    >
                      <Icon className="h-5 w-5 text-slate-400 hover:text-sky-400 transition-colors" />
                    </a>
                  );
                })}
              </div>
            </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 
              className="font-semibold text-sm uppercase tracking-wider"
              style={{ color: '#e2e8f0' }}
            >
              Resources
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => navigate('/pricing')}
                  className="transition-colors duration-200 hover:translate-x-1 transform"
                  style={{ color: '#94a3b8' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  Pricing Plans
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/CrisisCore-Systems/pain-tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors duration-200"
                  style={{ color: '#94a3b8' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  <Github className="h-4 w-4" />
                  Source Code
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/CrisisCore-Systems/pain-tracker/blob/main/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200"
                  style={{ color: '#94a3b8' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/CrisisCore-Systems/pain-tracker/blob/main/SECURITY.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors duration-200"
                  style={{ color: '#94a3b8' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  <Shield className="h-4 w-4" />
                  Security Policy
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/CrisisCore-Systems/pain-tracker/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200"
                  style={{ color: '#94a3b8' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  Contributing
                </a>
              </li>
            </ul>
          </div>

          {/* Blog */}
          <div className="space-y-4">
            <h3 
              className="font-semibold text-sm uppercase tracking-wider flex items-center gap-2"
              style={{ color: '#a855f7' }}
            >
              <BookOpen className="h-4 w-4" />
              Blog
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://paintracker.hashnode.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate transition-colors duration-200"
                  style={{ color: '#94a3b8' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#a855f7'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  All Posts
                </a>
              </li>
              <li>
                <a
                  href="https://paintracker.hashnode.dev/building-a-pain-tracker-that-actually-gets-it-no-market-research-required"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate transition-colors duration-200"
                  title="Why We Built This"
                  style={{ color: '#94a3b8' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#a855f7'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  Why We Built This
                </a>
              </li>
              <li>
                <a
                  href="https://paintracker.hashnode.dev/i-built-a-crisis-detection-engine-that-never-phones-home"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate transition-colors duration-200"
                  title="Crisis Detection Engine"
                  style={{ color: '#94a3b8' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#a855f7'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  Crisis Detection
                </a>
              </li>
              <li>
                <a
                  href="https://paintracker.hashnode.dev/building-software-that-actually-gives-a-damn-my-journey-with-trauma-informed-design"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate transition-colors duration-200"
                  title="Trauma-Informed Design"
                  style={{ color: '#94a3b8' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#a855f7'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  Trauma-Informed Design
                </a>
              </li>
              <li>
                <a
                  href="https://paintracker.hashnode.dev/building-a-healthcare-pwa-that-actually-works-when-it-matters"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate transition-colors duration-200"
                  title="Healthcare PWA Guide"
                  style={{ color: '#94a3b8' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#a855f7'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  Healthcare PWA
                </a>
              </li>
              <li>
                <a
                  href="https://paintracker.hashnode.dev/stop-filling-worksafebc-forms-manually-this-auto-generates-them-for-free"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate transition-colors duration-200"
                  title="WorkSafe BC Auto-Fill"
                  style={{ color: '#94a3b8' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#a855f7'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                >
                  WorkSafe BC Auto-Fill
                </a>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 
              className="font-semibold text-sm uppercase tracking-wider"
              style={{ color: '#e2e8f0' }}
            >
              Key Features
            </h3>
            <ul className="space-y-3 text-sm" style={{ color: '#94a3b8' }}>
              <li className="flex items-center gap-2">
                <span style={{ color: '#34d399' }}>✓</span> 8 AI Algorithms
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#34d399' }}>✓</span> WorkSafe BC Reports
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#34d399' }}>✓</span> Real-Time Monitoring
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#34d399' }}>✓</span> 100% Offline
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#34d399' }}>✓</span> Military Encryption
              </li>
              <li className="flex items-center gap-2">
                <span style={{ color: '#34d399' }}>✓</span> Trauma-Informed
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div 
          className="mt-8 sm:mt-12 pt-6 sm:pt-8"
          style={{ borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}
        >
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs">
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ 
                background: 'rgba(56, 189, 248, 0.1)', 
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8'
              }}
            >
              <Shield className="h-4 w-4" />
              <span>AES-256 Encrypted</span>
            </div>
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ 
                background: 'rgba(168, 85, 247, 0.1)', 
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: '#a855f7'
              }}
            >
              <Heart className="h-4 w-4" />
              <span>WCAG 2.1 AA</span>
            </div>
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ 
                background: 'rgba(52, 211, 153, 0.1)', 
                border: '1px solid rgba(52, 211, 153, 0.3)',
                color: '#34d399'
              }}
            >
              <Activity className="h-4 w-4" />
              <span>HIPAA-Aligned</span>
            </div>
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ 
                background: 'rgba(245, 158, 11, 0.1)', 
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#f59e0b'
              }}
            >
              <Github className="h-4 w-4" />
              <span>Open Source</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm"
          style={{ borderTop: '1px solid rgba(148, 163, 184, 0.2)', color: '#94a3b8' }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>© {currentYear} CrisisCore Systems</p>
            <a
              href="https://github.com/CrisisCore-Systems/pain-tracker/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline transition-colors duration-200"
              style={{ color: '#38bdf8' }}
            >
              View License
            </a>
          </div>
          <p className="flex items-center gap-2">
            Made with <Heart className="h-4 w-4 fill-current" style={{ color: '#ef4444' }} /> for chronic pain survivors
          </p>
        </div>

        {/* Privacy Statement */}
        <div 
          className="mt-6 sm:mt-8 text-center p-4 sm:p-6 rounded-xl"
          style={{ 
            background: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            boxShadow: '0 0 20px rgba(56, 189, 248, 0.05)'
          }}
        >
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
            <strong style={{ color: '#e2e8f0' }}>Your Privacy is Guaranteed:</strong>{' '}
            <span className="hidden sm:inline">We don't collect any data, we don't use cookies, we don't track you. </span>
            Your pain data stays on your device, encrypted with AES-256.{' '}
            <a
              href="https://github.com/CrisisCore-Systems/pain-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline whitespace-nowrap transition-colors duration-200"
              style={{ color: '#38bdf8' }}
            >
              Verify our code →
            </a>
          </p>
        </div>

        {/* Build ID - helps verify deployments */}
        {import.meta.env.VITE_BUILD_HASH && (
          <p className="mt-4 text-center text-[10px]" style={{ color: '#475569' }}>
            Build: {import.meta.env.VITE_BUILD_HASH}
          </p>
        )}
        </div>
      </div>
    </footer>
  );
};
