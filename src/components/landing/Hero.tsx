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
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Logo */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
              <span className="font-bold text-base sm:text-lg lg:text-xl truncate">Pain Tracker Pro</span>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
              {/* Pricing Link */}
              <Button
                variant="ghost"
                onClick={() => navigate('/pricing')}
                className="hidden lg:flex gap-1.5 sm:gap-2 px-2 sm:px-3"
                aria-label="View pricing plans"
              >
                <span className="text-sm">Pricing</span>
              </Button>

              {/* Returning User */}
              <Button
                variant="ghost"
                onClick={() => navigate('/start')}
                className="hidden md:flex gap-1.5 sm:gap-2 px-2 sm:px-3"
                aria-label="Sign in to your account"
              >
                <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-sm">Sign In</span>
              </Button>

              {/* Clinician Portal */}
              <Button
                variant="outline"
                onClick={() => navigate('/clinic')}
                className="gap-1 sm:gap-2 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-900 dark:hover:bg-blue-950 px-2 sm:px-3 text-xs sm:text-sm"
                aria-label="Access clinician portal"
              >
                <Stethoscope className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline sm:hidden lg:inline">Clinician</span>
                <span className="xs:hidden sm:inline lg:hidden">Clinic</span>
              </Button>

              {/* Primary CTA */}
              <Button
                onClick={() => navigate('/start')}
                className="gap-1 sm:gap-2 px-2 sm:px-3 text-xs sm:text-sm"
                aria-label="Start tracking your pain for free"
              >
                <span className="whitespace-nowrap">Get Started</span>
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs sm:text-sm font-medium text-primary flex-wrap justify-center lg:justify-start">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="whitespace-nowrap">100% Local & Private</span>
              <span className="hidden sm:inline">•</span>
              <span className="whitespace-nowrap">No Account Required</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl break-words">
              Professional Pain Management for{' '}
              <span className="text-primary">Patients & Clinicians</span>
            </h1>

            {/* Subheading */}
            <p className="text-base text-muted-foreground md:text-lg lg:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Clinical-grade pain tracking with AI-powered insights, automated WorkSafe BC reporting, and empathy-driven design. Your data stays on your device—secure, private, and always accessible.
            </p>

            {/* Key Features List */}
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span>AI Pattern Detection</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span>Military-Grade Security</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                <span>Trauma-Informed</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start pt-4 w-full sm:w-auto">
              {/* Patient CTA */}
              <Button
                size="lg"
                onClick={() => navigate('/start')}
                className="text-base sm:text-lg px-6 sm:px-8 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 w-full sm:w-auto whitespace-nowrap"
                aria-label="Start tracking your pain as a patient"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </Button>

              {/* Pricing CTA */}
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/pricing')}
                className="text-base sm:text-lg px-6 sm:px-8 border-2 hover:bg-primary/5 w-full sm:w-auto whitespace-nowrap"
              >
                <span>View Pricing</span>
              </Button>
            </div>

            {/* Trust Line */}
            <div className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
              <p className="break-words">
                ✨ <strong className="font-semibold">Start Free:</strong> <span className="inline-flex flex-wrap gap-1">50 entries • Basic analytics • No credit card • Upgrade anytime</span>
              </p>
              <p className="break-words">
                👨‍⚕️ <strong className="font-semibold">For Clinicians:</strong> <span className="inline-flex flex-wrap gap-1">AI insights • WCB reports • Real-time monitoring • <button onClick={() => navigate('/pricing')} className="text-primary hover:underline">View plans →</button></span>
              </p>
            </div>

            {/* Invite to submit story */}
            <div className="mt-4">
              <Button variant="ghost" onClick={() => navigate('/submit-story')} className="text-sm text-primary hover:underline">Share your story →</Button>
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
