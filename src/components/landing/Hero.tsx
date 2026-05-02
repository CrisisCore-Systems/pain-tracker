import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { Activity, Shield, Heart, ArrowRight, Sparkles, FileText, Download } from 'lucide-react';

// Preload the main app chunks when user shows intent to navigate
const preloadAppChunks = () => {
  // Preload main app container and its dependencies
  import('../../containers/PainTrackerContainer');
  import('../../components/security/VaultGate');
};

const trustStripItems = [
  'No account required',
  'Works offline after first load',
  'Encrypted local storage',
  'PDF/CSV/JSON export',
  'Open source',
];

const screenshotHighlights = [
  {
    src: '/screenshots/marketing/pain-entry-interface.png',
    alt: 'PainTracker quick pain entry interface',
    label: 'Fast pain entry',
  },
  {
    src: '/screenshots/marketing/body-map-interaction.png',
    alt: 'PainTracker body map interaction',
    label: 'Body location mapping',
  },
  {
    src: '/screenshots/marketing/analytics-dashboard.png',
    alt: 'PainTracker analytics dashboard',
    label: 'Pattern review',
  },
  {
    src: '/screenshots/marketing/export-process.png',
    alt: 'PainTracker export options for reports and structured records',
    label: 'Report exports',
  },
];

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  
  // Preload on user intent (hover or focus)
  const handlePreload = useCallback(() => {
    preloadAppChunks();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="hero-section-dramatic">
      {/* Layered Background */}
      <div className="hero-bg-mesh" />
      <div className="hero-grid-pattern" />
      <div className="hero-noise-overlay" />
      
      {/* Animated Orbs */}
      <div className="orb-container">
        <div 
          className="orb-glow orb-glow-sky" 
          style={{ width: '500px', height: '500px', top: '-10%', left: '10%' }}
        />
        <div 
          className="orb-glow orb-glow-purple" 
          style={{ width: '600px', height: '600px', top: '20%', right: '-10%', animationDelay: '5s' }}
        />
        <div 
          className="orb-glow orb-glow-emerald" 
          style={{ width: '400px', height: '400px', bottom: '0%', left: '30%', animationDelay: '10s' }}
        />
        <div 
          className="orb-glow orb-glow-pink" 
          style={{ width: '350px', height: '350px', top: '60%', right: '20%', animationDelay: '15s' }}
        />
      </div>

      {/* Floating Navigation */}
      <nav className={`nav-floating-glass sticky top-0 z-50 ${scrolled ? 'scrolled' : ''}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg shadow-sky-500/30">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-sky-500 blur-xl opacity-40" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                Pain Tracker
              </span>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/resources')}
                className="hidden lg:flex text-slate-200 hover:text-white hover:bg-white/5"
              >
                Resources
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate('/download')}
                className="hidden lg:flex text-slate-200 hover:text-white hover:bg-white/5"
              >
                Download
              </Button>

              <button
                onClick={() => navigate('/start')}
                onMouseEnter={handlePreload}
                onFocus={handlePreload}
                className="btn-cta-primary flex items-center gap-2 text-sm px-5 py-2.5"
                data-testid="nav-cta-start"
              >
                <span>Start tracking free</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24 items-center">
            {/* Left Column: Content */}
            <div className="space-y-8 text-center lg:text-left stagger-fade-up">
              {/* Announcement Badge */}
              <div className="inline-flex items-center gap-3">
                <span className="badge-glow-sky flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Private by default</span>
                </span>
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>No account required</span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="landing-headline landing-headline-xl">
                <span className="text-white">Track chronic pain</span>
                <br />
                <span className="text-white">privately, even</span>
                <br />
                <span className="text-white">offline</span>
              </h1>

              {/* Subheading */}
              <p className="landing-subhead text-lg lg:text-xl max-w-xl mx-auto lg:mx-0">
                PainTracker is a free local-first pain journal for logging pain, flare ups, medications, triggers, daily function, and appointment-ready reports. No account. No cloud database. Your records stay on your device.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <div className="badge-glow-sky flex items-center gap-2 text-sm">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Works offline</span>
                </div>
                <div className="badge-glow-emerald flex items-center gap-2 text-sm">
                  <Heart className="h-3.5 w-3.5" />
                  <span>No account</span>
                </div>
                <div className="badge-glow-purple flex items-center gap-2 text-sm">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Doctor-ready reports</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 justify-center lg:justify-start pt-2">
                <button
                  onClick={() => navigate('/start')}
                  className="btn-cta-primary text-lg px-8 py-4 flex items-center justify-center gap-3"
                  data-testid="hero-cta-start"
                >
                  <span>Start tracking free</span>
                  <ArrowRight className="h-5 w-5" />
                </button>

                <button
                  onClick={() => navigate('/resources/pain-diary-template-pdf')}
                  className="btn-cta-outline text-lg px-8 py-4"
                >
                  <span className="inline-flex items-center gap-2"><Download className="h-5 w-5" />Download printable pain diary</span>
                </button>
              </div>

              {/* Trust Line */}
              <div className="space-y-3 text-sm pt-4">
                <p className="text-sky-200/90 font-medium text-center lg:text-left">
                  No account required · Works offline after first load · Encrypted local storage · PDF/CSV/JSON export · Open source
                </p>
                <div className="text-center lg:text-left">
                  <a
                    href="#trust-proof"
                    className="text-sm font-medium text-sky-300 underline decoration-sky-400/40 underline-offset-4 transition-colors hover:text-sky-200"
                  >
                    See privacy proof
                  </a>
                </div>
                <ul className="flex flex-wrap gap-x-4 gap-y-2 justify-center lg:justify-start text-slate-300">
                  {trustStripItems.map((item) => (
                    <li key={item} className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column: Visual */}
            <div className="relative float-animate">
              {/* Glow effect behind card */}
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/30 via-purple-500/20 to-emerald-500/20 blur-3xl scale-110 opacity-60" />
              
              {/* Screenshot Cluster */}
              <div className="glass-card-premium relative overflow-hidden p-5 lg:p-6">
                {/* Browser-like header */}
                <div className="flex items-center gap-2 px-1 pb-4 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-lg shadow-red-500/30" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-lg shadow-yellow-500/30" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-lg shadow-green-500/30" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs text-slate-300 font-mono">paintracker.ca/start</span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {screenshotHighlights.map((shot) => (
                      <figure key={shot.src} className="rounded-2xl overflow-hidden border border-white/10 bg-slate-950/40">
                        <img
                          src={shot.src}
                          alt={shot.alt}
                          width="1200"
                          height="800"
                          className="w-full h-auto"
                          loading="lazy"
                        />
                        <figcaption className="px-4 py-3 text-sm text-slate-200">{shot.label}</figcaption>
                      </figure>
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Log pain, map where it shows up, review patterns, and export structured reports without turning routine tracking into a cloud account problem.
                  </p>
                </div>
              </div>

              {/* Floating badges */}
              <div 
                className="absolute -top-4 -right-4 px-5 py-2.5 rounded-full text-sm font-bold float-animate float-animate-delay-1"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  boxShadow: '0 10px 40px rgba(14, 165, 233, 0.5)'
                }}
              >
                <span className="text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Open Source
                </span>
              </div>
              
              <div 
                className="absolute -bottom-4 -left-4 px-5 py-2.5 rounded-full text-sm font-bold float-animate float-animate-delay-2"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                  boxShadow: '0 10px 40px rgba(168, 85, 247, 0.5)'
                }}
              >
                <span className="text-white flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  WCAG 2.1 AA
                </span>
              </div>
              
              <div 
                className="absolute top-1/2 -right-8 px-4 py-2 rounded-full text-xs font-bold float-animate float-animate-delay-3 hidden xl:flex"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 8px 30px rgba(16, 185, 129, 0.5)'
                }}
              >
                <span className="text-white flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  AES-256
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3">
        <span className="text-xs text-slate-600 uppercase tracking-widest">Scroll to explore</span>
        <div className="scroll-indicator-elegant" />
      </div>
    </section>
  );
};
