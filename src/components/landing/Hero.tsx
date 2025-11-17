import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { Activity, Shield, Heart, Stethoscope, LogIn, ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="hero relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Top Navigation Bar */}
      <div className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Pain Tracker Pro</span>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-3">
              {/* Returning User */}
              <Button
                variant="ghost"
                onClick={() => navigate('/start')}
                className="hidden sm:flex gap-2"
                aria-label="Sign in to your account"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>

              {/* Clinician Portal */}
              <Button
                variant="outline"
                onClick={() => navigate('/clinic')}
                className="gap-2 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-950"
                aria-label="Access clinician portal"
              >
                <Stethoscope className="h-4 w-4" />
                <span className="hidden sm:inline">Clinician Portal</span>
                <span className="sm:hidden">Clinic</span>
              </Button>

              {/* Primary CTA */}
              <Button
                onClick={() => navigate('/start')}
                className="gap-2"
                aria-label="Start tracking your pain for free"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <div className="space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Shield className="h-4 w-4" />
              <span>100% Local & Private • No Account Required</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Professional Pain Management for{' '}
              <span className="text-primary">Patients & Clinicians</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto lg:mx-0">
              Clinical-grade pain tracking with AI-powered insights, automated WorkSafe BC reporting, and empathy-driven design. Your data stays on your device—secure, private, and always accessible.
            </p>

            {/* Key Features List */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span>AI Pattern Detection</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Military-Grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                <span>Trauma-Informed</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              {/* Patient CTA */}
              <Button
                size="lg"
                onClick={() => navigate('/start')}
                className="text-lg px-8 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                aria-label="Start tracking your pain as a patient"
              >
                Start as Patient
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              {/* Clinician CTA */}
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/clinic')}
                className="text-lg px-8 border-2 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <Stethoscope className="mr-2 h-5 w-5" />
                Clinician Login
              </Button>
            </div>

            {/* Trust Line */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                🏥 <strong>For Patients:</strong> No account required • Works offline • Export to providers
              </p>
              <p className="text-xs text-muted-foreground">
                👨‍⚕️ <strong>For Clinicians:</strong> AI insights • One-click WCB reports • Real-time monitoring
              </p>
            </div>
          </div>

          {/* Right Column: Visual */}
          <div className="relative">
            {/* Dashboard Screenshot */}
            <div className="relative rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-8 shadow-2xl">
              <div className="rounded-md overflow-hidden border border-border shadow-lg">
                <img
                  src="/main-dashboard.png"
                  alt="Pain Tracker Pro Dashboard featuring the 7-step pain assessment form, customizable widgets, analytics visualizations, and trauma-informed design"
                  className="mx-auto max-h-[420px] w-auto max-w-full object-contain md:max-h-[480px]"
                  loading="lazy"
                />
              </div>

              {/* Floating badges for visual interest */}
              <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-full px-4 py-2 text-sm font-medium shadow-lg">
                Open Source
              </div>
              <div className="absolute -bottom-4 -left-4 bg-accent text-accent-foreground rounded-full px-4 py-2 text-sm font-medium shadow-lg">
                WCAG 2.1 AA
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
    </section>
  );
};
