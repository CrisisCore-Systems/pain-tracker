import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { 
  User, 
  Stethoscope, 
  Brain, 
  FileText, 
  TrendingUp, 
  Bell,
  ArrowRight 
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
    <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        {/* Patients Section */}
        <div className="mb-16">
          {/* Section Header */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 mb-4">
              <User className="h-4 w-4" />
              <span>For Patients</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Take Control of Your Pain Management
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive tools to track, understand, and communicate your pain effectively.
            </p>
          </div>

          {/* Patient Features Grid */}
          <div className="grid gap-6 md:grid-cols-3 lg:gap-8 max-w-6xl mx-auto mb-8">
            {patientUseCases.map(useCase => {
              const Icon = useCase.icon;
              return (
                <Card
                  key={useCase.title}
                  className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                >
                  <CardHeader className="space-y-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>

                    {/* Title */}
                    <CardTitle className="text-lg sm:text-xl break-words">{useCase.title}</CardTitle>

                    {/* Description */}
                    <CardDescription className="text-sm sm:text-base leading-relaxed break-words">
                      {useCase.description}
                    </CardDescription>

                    {/* Features List */}
                    <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                      {useCase.features.map(feature => (
                        <li key={feature} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5 sm:mt-1 flex-shrink-0">✓</span>
                          <span className="break-words">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {/* Patient CTA */}
          <div className="text-center px-4">
            <Button
              size="lg"
              onClick={() => navigate('/start')}
              className="gap-2 text-base sm:text-lg px-6 sm:px-8 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 w-full sm:w-auto whitespace-nowrap"
            >
              <span>Start Tracking Free</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 break-words">
              No account required • 100% private • Works offline
            </p>
          </div>
        </div>

        {/* Clinicians Section */}
        <div>
          {/* Section Header */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950 px-4 py-2 text-sm font-medium text-green-700 dark:text-green-300 mb-4">
              <Stethoscope className="h-4 w-4" />
              <span>For Healthcare Professionals</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Professional-Grade Clinical Tools
            </h2>
            <p className="text-lg text-muted-foreground">
              Save 25+ hours per week with AI-powered insights and automated reporting.
            </p>
          </div>

          {/* Clinician Features Grid */}
          <div className="grid gap-6 md:grid-cols-3 lg:gap-8 max-w-6xl mx-auto mb-8">
            {clinicianUseCases.map(useCase => {
              const Icon = useCase.icon;
              return (
                <Card
                  key={useCase.title}
                  className="relative overflow-hidden border-2 hover:border-green-600/50 transition-all duration-300 hover:shadow-lg"
                >
                  <CardHeader className="space-y-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>

                    {/* Title */}
                    <CardTitle className="text-lg sm:text-xl break-words">{useCase.title}</CardTitle>

                    {/* Description */}
                    <CardDescription className="text-sm sm:text-base leading-relaxed break-words">
                      {useCase.description}
                    </CardDescription>

                    {/* Features List */}
                    <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                      {useCase.features.map(feature => (
                        <li key={feature} className="flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 mt-0.5 sm:mt-1 flex-shrink-0">✓</span>
                          <span className="break-words">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {/* Clinician CTA */}
          <div className="text-center px-4">
            <Button
              size="lg"
              onClick={() => navigate('/clinic')}
              className="gap-2 text-base sm:text-lg px-6 sm:px-8 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-600/90 hover:to-emerald-600/90 w-full sm:w-auto whitespace-nowrap"
            >
              <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span>Access Clinician Portal</span>
            </Button>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3 break-words">
              Role-based access • AI insights • HIPAA-aligned security
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
