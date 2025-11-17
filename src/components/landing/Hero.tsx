import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { Activity, Shield, Heart } from 'lucide-react';

export const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="hero relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column: Content */}
          <div className="space-y-6 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Shield className="h-4 w-4" />
              <span>100% Local & Private</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Transform Chronic Pain{' '}
              <span className="text-primary">
                Management
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto lg:mx-0">
              Clinical-grade pain tracking with empathy-driven design. Your data stays on your device—secure, private, and always accessible.
            </p>

            {/* Key Features List */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span>Advanced Analytics</span>
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
              <Button
                size="lg"
                onClick={() => navigate('/start')}
                className="text-lg px-8"
                aria-label="Start tracking your pain for free"
              >
                Start Free
                <span className="ml-2">→</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-lg px-8"
              >
                See Features
              </Button>
            </div>

            {/* Trust Line */}
            <p className="text-xs text-muted-foreground">
              No account required • No data collection • Works offline
            </p>
          </div>

          {/* Right Column: Visual */}
          <div className="relative">
            {/* Placeholder for screenshot/demo */}
            <div className="relative rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-8 shadow-2xl">
              <div className="aspect-video rounded-md bg-muted/50 flex items-center justify-center border border-border">
                <div className="text-center space-y-2 p-4">
                  <Activity className="h-12 w-12 mx-auto text-primary/50" />
                  <p className="text-sm text-muted-foreground">
                    Dashboard Preview
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Screenshot coming soon
                  </p>
                </div>
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
