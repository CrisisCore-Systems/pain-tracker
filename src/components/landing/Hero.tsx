import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { Activity, Shield, Heart, Stethoscope, LogIn, ArrowRight, Sparkles, Zap, Star, ChevronDown } from 'lucide-react';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const _env = (import.meta.env ?? {}) as Record<string, string | undefined>;
  const [scrolled, setScrolled] = useState(false);

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
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Pain Tracker Pro
              </span>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              <a
                href="https://blog.paintracker.ca"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:flex items-center px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                Blog
              </a>
              
              <Button
                variant="ghost"
                onClick={() => navigate('/pricing')}
                className="hidden lg:flex text-slate-400 hover:text-white hover:bg-white/5"
              >
                Pricing
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate('/start')}
                className="hidden md:flex text-slate-400 hover:text-white hover:bg-white/5"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/clinic')}
                className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 transition-all"
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Clinician</span>
              </Button>

              <button
                onClick={() => navigate('/start')}
                className="btn-cta-primary flex items-center gap-2 text-sm px-5 py-2.5"
              >
                Get Started
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
                  <span>100% Local & Private</span>
                </span>
                <span className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  No Account Required
                </span>
              </div>

              {/* Headline */}
              <h1 className="landing-headline landing-headline-xl">
                <span className="text-white">Professional Pain</span>
                <br />
                <span className="text-white">Management for </span>
                <span className="gradient-text-animated">Everyone</span>
              </h1>

              {/* Subheading */}
              <p className="landing-subhead text-lg lg:text-xl max-w-xl mx-auto lg:mx-0">
                Clinical-grade pain tracking with{' '}
                <span className="text-sky-400 font-semibold">smart pattern detection</span>,{' '}
                automated WorkSafe BC reporting, and{' '}
                <span className="text-emerald-400 font-semibold">empathy-driven design</span>.{' '}
                Your data stays on your device.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <div className="badge-glow-sky flex items-center gap-2 text-sm">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Pattern Detection</span>
                </div>
                <div className="badge-glow-emerald flex items-center gap-2 text-sm">
                  <Shield className="h-3.5 w-3.5" />
                  <span>Encrypted</span>
                </div>
                <div className="badge-glow-purple flex items-center gap-2 text-sm">
                  <Heart className="h-3.5 w-3.5" />
                  <span>Trauma-Informed</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                <button
                  onClick={() => navigate('/start')}
                  className="btn-cta-primary text-lg px-8 py-4 flex items-center justify-center gap-3"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="h-5 w-5" />
                </button>

                <button
                  onClick={() => navigate('/pricing')}
                  className="btn-cta-outline text-lg px-8 py-4"
                >
                  View Pricing
                </button>
              </div>

              {/* Trust Line */}
              <div className="space-y-3 text-sm pt-4">
                <p className="flex items-center gap-3 justify-center lg:justify-start text-slate-500">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    Free Plan Available
                  </span>
                  <span className="text-slate-700">•</span>
                  <span>Unlimited entries</span>
                  <span className="text-slate-700">•</span>
                  <span>No credit card</span>
                </p>
                <p className="flex items-center gap-2 justify-center lg:justify-start text-slate-500">
                  <span className="text-sky-400 font-medium">Pro Features:</span>
                  <span>Advanced insights • WCB reports • Clinical exports</span>
                </p>
              </div>
            </div>

            {/* Right Column: Visual */}
            <div className="relative float-animate">
              {/* Glow effect behind card */}
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/30 via-purple-500/20 to-emerald-500/20 blur-3xl scale-110 opacity-60" />
              
              {/* Dashboard Card */}
              <div className="glass-card-premium relative overflow-hidden">
                {/* Browser-like header */}
                <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-lg shadow-red-500/30" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-lg shadow-yellow-500/30" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-lg shadow-green-500/30" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs text-slate-400 font-mono">paintracker.app/dashboard</span>
                    </div>
                  </div>
                </div>
                
                {/* Screenshot */}
                <div className="p-4 lg:p-6">
                  <img
                    src={_env.VITE_LANDING_SCREENSHOT || '/screenshots/marketing/analytics-dashboard.png'}
                    alt="Pain Tracker Pro Dashboard"
                    className="rounded-xl w-full h-auto shadow-2xl"
                    loading="lazy"
                  />
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
