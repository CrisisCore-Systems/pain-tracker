import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { 
  User, 
  Stethoscope, 
  Brain, 
  FileText, 
  TrendingUp, 
  Bell,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap
} from 'lucide-react';

const patientUseCases = [
  {
    icon: User,
    title: 'Track Your Journey',
    description: '7-step pain assessment with body mapping, medication tracking, and quality of life metrics.',
    features: ['Visual pain heatmaps', 'Medication side effects', 'Mood & sleep correlation'],
    gradient: 'from-sky-500 to-cyan-500',
    glow: 'sky',
  },
  {
    icon: TrendingUp,
    title: 'Understand Patterns',
    description: 'Heuristic pattern detection identifies triggers, correlations, and trends in your pain.',
    features: ['Trigger identification', 'Weather correlations', 'Time-of-day analysis'],
    gradient: 'from-violet-500 to-purple-500',
    glow: 'violet',
  },
  {
    icon: FileText,
    title: 'Export Reports',
    description: 'Generate professional reports for healthcare providers, WorkSafe BC, or insurance claims.',
    features: ['One-click WCB export', 'PDF & clinical summaries', 'CSV/JSON exports'],
    gradient: 'from-amber-500 to-orange-500',
    glow: 'amber',
  },
];

const clinicianUseCases = [
  {
    icon: Brain,
    title: 'Pattern Analysis',
    description: '10+ local pattern tools analyze trends, triggers, and correlations using evidence-informed heuristics (not machine learning).',
    features: ['Pearson correlation', 'Treatment efficacy', 'Confidence scoring'],
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'emerald',
  },
  {
    icon: Bell,
    title: 'On-Device Alerts',
    description: 'Optional, on-device alerts for worsening patterns and missed routines—no servers and no background clinician monitoring.',
    features: ['Pattern-based alerts', 'Optional reminders', 'Private by design'],
    gradient: 'from-rose-500 to-pink-500',
    glow: 'rose',
  },
  {
    icon: FileText,
    title: 'Automated Reports',
    description: 'One-click generation of WorkSafe BC, insurance, and progress reports with clinical summaries.',
    features: ['SOAP format notes', 'Work capacity assessment', 'Treatment timelines'],
    gradient: 'from-indigo-500 to-blue-500',
    glow: 'indigo',
  },
];

// Animated counter component
const AnimatedCounter: React.FC<{ end: number; suffix?: string; duration?: number }> = ({ 
  end, 
  suffix = '', 
  duration = 2000 
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

export const UseCases: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 bg-slate-900" />
      
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_rgba(56,189,248,0.15)_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_rgba(52,211,153,0.15)_0%,_transparent_50%)]" />
      </div>

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-[10%] w-80 h-80 rounded-full bg-sky-500/10 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/2 left-[5%] w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-[20%] w-72 h-72 rounded-full bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      </div>

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative container mx-auto px-4">
        {/* Patients Section */}
        <div className="mb-32">
          {/* Section Header with editorial styling */}
          <div className="text-center mb-20 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium mb-8 bg-sky-500/10 border border-sky-500/30 backdrop-blur-sm">
              <User className="h-4 w-4 text-sky-400" />
              <span className="text-sky-300">For Patients</span>
            </div>
            
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
              Take Control of Your{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Pain Management
                </span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-sky-500/30" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M0 7 Q50 0 100 4 Q150 8 200 1" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </span>
            </h2>
            
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Comprehensive tools to track, understand, and communicate your pain effectively—built with empathy for chronic pain survivors.
            </p>
          </div>

          {/* Patient Features Grid - Premium Cards */}
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto mb-16">
            {patientUseCases.map((useCase, index) => {
              const Icon = useCase.icon;
              const glowColors: Record<string, string> = {
                sky: 'rgba(56, 189, 248, 0.2)',
                violet: 'rgba(139, 92, 246, 0.2)',
                amber: 'rgba(245, 158, 11, 0.2)',
              };
              const borderColors: Record<string, string> = {
                sky: 'rgba(56, 189, 248, 0.4)',
                violet: 'rgba(139, 92, 246, 0.4)',
                amber: 'rgba(245, 158, 11, 0.4)',
              };
              const iconBg: Record<string, string> = {
                sky: 'rgba(56, 189, 248, 0.15)',
                violet: 'rgba(139, 92, 246, 0.15)',
                amber: 'rgba(245, 158, 11, 0.15)',
              };
              const iconColor: Record<string, string> = {
                sky: '#38bdf8',
                violet: '#8b5cf6',
                amber: '#f59e0b',
              };
              
              return (
                <div
                  key={useCase.title}
                  className="group relative"
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                    opacity: 0,
                  }}
                >
                  {/* Card glow effect */}
                  <div 
                    className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                    style={{ background: glowColors[useCase.glow] }}
                  />
                  
                  <div 
                    className="relative h-full rounded-2xl p-8 backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-2"
                    style={{
                      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = borderColors[useCase.glow];
                      e.currentTarget.style.boxShadow = `0 20px 60px ${glowColors[useCase.glow]}, 0 4px 30px rgba(0, 0, 0, 0.3)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
                    }}
                  >
                    {/* Gradient line at top */}
                    <div 
                      className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r ${useCase.gradient} opacity-50`}
                    />
                    
                    <div className="space-y-6">
                      {/* Icon with glow */}
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{ 
                          background: iconBg[useCase.glow],
                          boxShadow: `0 8px 20px ${glowColors[useCase.glow]}`,
                        }}
                      >
                        <Icon className="h-7 w-7" style={{ color: iconColor[useCase.glow] }} />
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-white">{useCase.title}</h3>

                      {/* Description */}
                      <p className="text-slate-400 leading-relaxed">{useCase.description}</p>

                      {/* Features List */}
                      <ul className="space-y-3 pt-2">
                        {useCase.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: iconBg[useCase.glow] }}>
                              <CheckCircle2 className="h-3.5 w-3.5" style={{ color: iconColor[useCase.glow] }} />
                            </div>
                            <span className="text-slate-300 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Patient CTA */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => navigate('/start')}
              className="group relative text-lg px-10 py-6 text-white overflow-hidden transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradient-shift 3s ease-in-out infinite',
                boxShadow: '0 10px 40px rgba(14, 165, 233, 0.3), 0 0 60px rgba(14, 165, 233, 0.1)',
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Start Tracking Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
            <p className="text-sm text-slate-500 mt-6 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                No account required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                100% private
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Works offline
              </span>
            </p>
          </div>
        </div>

        {/* Premium Divider */}
        <div className="flex items-center justify-center mb-32">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />
          <div className="px-8 py-3 rounded-full bg-slate-800/50 border border-white/10 backdrop-blur-sm">
            <span className="text-slate-400 text-sm font-medium tracking-wider">OR</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        </div>

        {/* Clinicians Section */}
        <div>
          {/* Section Header */}
          <div className="text-center mb-20 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium mb-8 bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-sm">
              <Stethoscope className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-300">For Healthcare Professionals</span>
            </div>
            
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
              Clinic-ready{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Clinical Tools
                </span>
                <svg className="absolute -bottom-2 left-0 w-full h-3 text-emerald-500/30" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M0 7 Q50 0 100 4 Q150 8 200 1" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </span>
            </h2>
            
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Streamline documentation with <span className="text-emerald-400 font-semibold">pattern analysis</span> and one-click report generation.
            </p>
          </div>

          {/* Stats Banner */}
          <div className="max-w-4xl mx-auto mb-16">
            <div 
              className="relative rounded-2xl p-8 backdrop-blur-xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%)',
                border: '1px solid rgba(52, 211, 153, 0.2)',
              }}
            >
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                    <AnimatedCounter end={10} suffix="+" />
                  </div>
                  <p className="text-slate-400 text-sm">Pattern Tools</p>
                </div>
                <div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                    <AnimatedCounter end={25} suffix="+" />
                  </div>
                  <p className="text-slate-400 text-sm">Body Locations</p>
                </div>
                <div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                    <AnimatedCounter end={100} suffix="%" />
                  </div>
                  <p className="text-slate-400 text-sm">Local-Only</p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinician Features Grid */}
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto mb-16">
            {clinicianUseCases.map((useCase, index) => {
              const Icon = useCase.icon;
              const glowColors: Record<string, string> = {
                emerald: 'rgba(52, 211, 153, 0.2)',
                rose: 'rgba(244, 63, 94, 0.2)',
                indigo: 'rgba(99, 102, 241, 0.2)',
              };
              const borderColors: Record<string, string> = {
                emerald: 'rgba(52, 211, 153, 0.4)',
                rose: 'rgba(244, 63, 94, 0.4)',
                indigo: 'rgba(99, 102, 241, 0.4)',
              };
              const iconBg: Record<string, string> = {
                emerald: 'rgba(52, 211, 153, 0.15)',
                rose: 'rgba(244, 63, 94, 0.15)',
                indigo: 'rgba(99, 102, 241, 0.15)',
              };
              const iconColor: Record<string, string> = {
                emerald: '#34d399',
                rose: '#f43f5e',
                indigo: '#6366f1',
              };
              
              return (
                <div
                  key={useCase.title}
                  className="group relative"
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                    opacity: 0,
                  }}
                >
                  {/* Card glow effect */}
                  <div 
                    className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                    style={{ background: glowColors[useCase.glow] }}
                  />
                  
                  <div 
                    className="relative h-full rounded-2xl p-8 backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-2"
                    style={{
                      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = borderColors[useCase.glow];
                      e.currentTarget.style.boxShadow = `0 20px 60px ${glowColors[useCase.glow]}, 0 4px 30px rgba(0, 0, 0, 0.3)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
                    }}
                  >
                    {/* Gradient line at top */}
                    <div 
                      className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r ${useCase.gradient} opacity-50`}
                    />
                    
                    <div className="space-y-6">
                      {/* Icon with glow */}
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{ 
                          background: iconBg[useCase.glow],
                          boxShadow: `0 8px 20px ${glowColors[useCase.glow]}`,
                        }}
                      >
                        <Icon className="h-7 w-7" style={{ color: iconColor[useCase.glow] }} />
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-white">{useCase.title}</h3>

                      {/* Description */}
                      <p className="text-slate-400 leading-relaxed">{useCase.description}</p>

                      {/* Features List */}
                      <ul className="space-y-3 pt-2">
                        {useCase.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: iconBg[useCase.glow] }}>
                              <CheckCircle2 className="h-3.5 w-3.5" style={{ color: iconColor[useCase.glow] }} />
                            </div>
                            <span className="text-slate-300 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clinician CTA */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => navigate('/clinic')}
              className="group relative text-lg px-10 py-6 text-white overflow-hidden transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)',
                backgroundSize: '200% 200%',
                animation: 'gradient-shift 3s ease-in-out infinite',
                boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3), 0 0 60px rgba(16, 185, 129, 0.1)',
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Access Clinician Portal
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
            <p className="text-sm text-slate-500 mt-6 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Role-based access
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Automated insights
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                HIPAA-aligned controls
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* CSS for animations - fadeInUp is provided by Tailwind (animate-fadeInUp) */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  );
};
