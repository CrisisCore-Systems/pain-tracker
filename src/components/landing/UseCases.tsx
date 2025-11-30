import React from 'react';
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
  CheckCircle2
} from 'lucide-react';

const patientUseCases = [
  {
    icon: User,
    title: 'Track Your Journey',
    description: '7-step pain assessment with body mapping, medication tracking, and quality of life metrics.',
    features: ['Visual pain heatmaps', 'Medication side effects', 'Mood & sleep correlation'],
  },
  {
    icon: TrendingUp,
    title: 'Understand Patterns',
    description: 'AI-powered pattern detection identifies triggers, correlations, and trends in your pain.',
    features: ['Trigger identification', 'Weather correlations', 'Time-of-day analysis'],
  },
  {
    icon: FileText,
    title: 'Export Reports',
    description: 'Generate professional reports for healthcare providers, WorkSafe BC, or insurance claims.',
    features: ['One-click WCB export', 'Clinical summaries', 'CSV data exports'],
  },
];

const clinicianUseCases = [
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: '8 sophisticated algorithms analyze patient data for medication efficacy, triggers, and correlations.',
    features: ['Pearson correlation', 'Treatment efficacy', 'Confidence scoring'],
  },
  {
    icon: Bell,
    title: 'Real-Time Monitoring',
    description: 'Live patient alerts for pain escalation, missed medications, and crisis detection.',
    features: ['Pain escalation alerts', 'Medication adherence', 'Crisis warnings'],
  },
  {
    icon: FileText,
    title: 'Automated Reports',
    description: 'One-click generation of WorkSafe BC, insurance, and progress reports with clinical summaries.',
    features: ['SOAP format notes', 'Work capacity assessment', 'Treatment timelines'],
  },
];

export const UseCases: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900" />
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Patients Section */}
        <div className="mb-24">
          {/* Section Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div 
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-6"
              style={{ background: 'rgba(14, 165, 233, 0.1)', border: '1px solid rgba(14, 165, 233, 0.3)' }}
            >
              <User className="h-4 w-4" style={{ color: '#38bdf8' }} />
              <span style={{ color: '#7dd3fc' }}>For Patients</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Take Control of Your{' '}
              <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">Pain Management</span>
            </h2>
            <p className="text-lg text-slate-400">
              Comprehensive tools to track, understand, and communicate your pain effectively.
            </p>
          </div>

          {/* Patient Features Grid */}
          <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto mb-12">
            {patientUseCases.map((useCase) => {
              const Icon = useCase.icon;
              return (
                <div
                  key={useCase.title}
                  className="group relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 40px rgba(14, 165, 233, 0.2), 0 4px 20px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <div className="space-y-4">
                    {/* Icon */}
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ background: 'rgba(14, 165, 233, 0.15)', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)' }}
                    >
                      <Icon className="h-6 w-6" style={{ color: '#38bdf8' }} />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white">{useCase.title}</h3>

                    {/* Description */}
                    <p className="text-slate-400 text-sm leading-relaxed">{useCase.description}</p>

                    {/* Features List */}
                    <ul className="space-y-2 pt-2">
                      {useCase.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: '#38bdf8' }} />
                          <span className="text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
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
              className="text-lg px-8 py-6 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white shadow-xl shadow-sky-500/30 hover:shadow-sky-500/40 transition-all hover:scale-105"
            >
              <span>Start Tracking Free</span>
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <p className="text-sm text-slate-500 mt-4">
              No account required • 100% private • Works offline
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center mb-24">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          <div className="px-4 text-slate-600 text-sm">OR</div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        </div>

        {/* Clinicians Section */}
        <div>
          {/* Section Header */}
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div 
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-6"
              style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
            >
              <Stethoscope className="h-4 w-4" style={{ color: '#34d399' }} />
              <span style={{ color: '#6ee7b7' }}>For Healthcare Professionals</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Professional-Grade{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Clinical Tools</span>
            </h2>
            <p className="text-lg text-slate-400">
              Save 25+ hours per week with AI-powered insights and automated reporting.
            </p>
          </div>

          {/* Clinician Features Grid */}
          <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto mb-12">
            {clinicianUseCases.map((useCase) => {
              const Icon = useCase.icon;
              return (
                <div
                  key={useCase.title}
                  className="group relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 40px rgba(16, 185, 129, 0.2), 0 4px 20px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  <div className="space-y-4">
                    {/* Icon */}
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ background: 'rgba(16, 185, 129, 0.15)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                    >
                      <Icon className="h-6 w-6" style={{ color: '#34d399' }} />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white">{useCase.title}</h3>

                    {/* Description */}
                    <p className="text-slate-400 text-sm leading-relaxed">{useCase.description}</p>

                    {/* Features List */}
                    <ul className="space-y-2 pt-2">
                      {useCase.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: '#34d399' }} />
                          <span className="text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
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
              className="text-lg px-8 py-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all hover:scale-105"
            >
              <Stethoscope className="h-5 w-5 mr-2" />
              <span>Access Clinician Portal</span>
            </Button>
            <p className="text-sm text-slate-500 mt-4">
              Role-based access • AI insights • HIPAA-aligned security
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
