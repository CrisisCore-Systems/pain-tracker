import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { Activity, Shield, Heart, Stethoscope, LogIn, ArrowRight, Sparkles, Zap } from 'lucide-react';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const _env = (import.meta.env ?? {}) as Record<string, string | undefined>;

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-sky-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Top Navigation Bar */}
      <nav className="relative z-50 border-b border-white/10" style={{ background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(20px)' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 shadow-lg shadow-sky-500/25">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Pain Tracker Pro
              </span>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/pricing')}
                className="hidden lg:flex text-slate-300 hover:text-white hover:bg-white/10"
              >
                Pricing
              </Button>

              <Button
                variant="ghost"
                onClick={() => navigate('/start')}
                className="hidden md:flex text-slate-300 hover:text-white hover:bg-white/10"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/clinic')}
                className="border-sky-500/50 text-sky-400 hover:bg-sky-500/10 hover:border-sky-400"
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Clinician</span>
              </Button>

              <Button
                onClick={() => navigate('/start')}
                className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white shadow-lg shadow-sky-500/25"
              >
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 py-20 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
          {/* Left Column: Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
                 style={{ 
                   background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                   border: '1px solid rgba(14, 165, 233, 0.3)',
                   boxShadow: '0 0 20px rgba(14, 165, 233, 0.2)'
                 }}>
              <Sparkles className="h-4 w-4 text-sky-400" />
              <span className="text-sky-300">100% Local & Private</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">No Account Required</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1]">
              <span className="text-white">Professional Pain</span>
              <br />
              <span className="text-white">Management for </span>
              <span className="bg-gradient-to-r from-sky-400 via-sky-500 to-purple-500 bg-clip-text text-transparent">
                Everyone
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg lg:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Clinical-grade pain tracking with <span className="text-sky-400 font-medium">AI-powered insights</span>, 
              automated WorkSafe BC reporting, and <span className="text-emerald-400 font-medium">empathy-driven design</span>. 
              Your data stays on your device.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {[
                { icon: Zap, label: 'AI Detection', color: 'sky' },
                { icon: Shield, label: 'Encrypted', color: 'emerald' },
                { icon: Heart, label: 'Trauma-Informed', color: 'purple' },
              ].map((feature) => (
                <div 
                  key={feature.label}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full bg-${feature.color}-500/10 border border-${feature.color}-500/20`}
                  style={{
                    background: feature.color === 'sky' ? 'rgba(14, 165, 233, 0.1)' : 
                               feature.color === 'emerald' ? 'rgba(16, 185, 129, 0.1)' : 
                               'rgba(168, 85, 247, 0.1)',
                    borderColor: feature.color === 'sky' ? 'rgba(14, 165, 233, 0.2)' : 
                                 feature.color === 'emerald' ? 'rgba(16, 185, 129, 0.2)' : 
                                 'rgba(168, 85, 247, 0.2)'
                  }}
                >
                  <feature.icon className="h-4 w-4" style={{
                    color: feature.color === 'sky' ? '#38bdf8' : 
                           feature.color === 'emerald' ? '#34d399' : 
                           '#c084fc'
                  }} />
                  <span className="text-sm font-medium text-slate-300">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Button
                size="lg"
                onClick={() => navigate('/start')}
                className="text-lg px-8 py-6 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white shadow-xl shadow-sky-500/30 hover:shadow-sky-500/40 transition-all hover:scale-105"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/pricing')}
                className="text-lg px-8 py-6 border-2 border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-800/50"
              >
                View Pricing
              </Button>
            </div>

            {/* Trust Line */}
            <div className="space-y-3 text-sm text-slate-500 pt-4">
              <p className="flex items-center gap-2 justify-center lg:justify-start">
                <span className="text-emerald-400">✓</span>
                <span><strong className="text-slate-300">Free Forever:</strong> Unlimited entries • Basic analytics • No credit card</span>
              </p>
              <p className="flex items-center gap-2 justify-center lg:justify-start">
                <span className="text-emerald-400">✓</span>
                <span><strong className="text-slate-300">Pro Features:</strong> AI insights • WCB reports • Clinical exports •{' '}
                  <button onClick={() => navigate('/pricing')} className="text-sky-400 hover:text-sky-300 hover:underline">View plans →</button>
                </span>
              </p>
            </div>
          </div>

          {/* Right Column: Visual */}
          <div className="relative">
            {/* Glow effect behind card */}
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 via-purple-500/20 to-emerald-500/20 blur-3xl scale-110" />
            
            {/* Dashboard Card */}
            <div className="relative rounded-2xl overflow-hidden"
                 style={{
                   background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                   border: '1px solid rgba(255, 255, 255, 0.1)',
                   boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                 }}>
              {/* Browser-like header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-slate-500 font-mono">paintracker.app/dashboard</span>
                </div>
              </div>
              
              {/* Screenshot */}
              <div className="p-4">
                <img
                  src={_env.VITE_LANDING_SCREENSHOT || '/screenshots/marketing/analytics-dashboard.png'}
                  alt="Pain Tracker Pro Dashboard"
                  className="rounded-lg w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 px-4 py-2 rounded-full text-sm font-bold shadow-xl"
                 style={{
                   background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                   boxShadow: '0 10px 30px rgba(14, 165, 233, 0.4)'
                 }}>
              <span className="text-white">Open Source</span>
            </div>
            
            <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-full text-sm font-bold shadow-xl"
                 style={{
                   background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                   boxShadow: '0 10px 30px rgba(168, 85, 247, 0.4)'
                 }}>
              <span className="text-white">WCAG 2.1 AA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-slate-600 flex items-start justify-center p-2">
          <div className="w-1 h-2 rounded-full bg-slate-500 animate-pulse" />
        </div>
      </div>
    </section>
  );
};
