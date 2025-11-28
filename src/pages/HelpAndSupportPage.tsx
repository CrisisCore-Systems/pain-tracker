import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../design-system';
import { AlertTriangle, BookOpen, HelpCircle, LifeBuoy } from 'lucide-react';
import { usePainTrackerStore } from '../stores/pain-tracker-store';

export default function HelpAndSupportPage() {
  const setShowWalkthrough = usePainTrackerStore(state => state.setShowWalkthrough);

  const handleViewTutorials = () => {
    setShowWalkthrough(true);
  };

  const handleOpenFaq = () => {
    window.open('https://paintracker.ca/docs/faq', '_blank', 'noopener');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@paintracker.ca?subject=Pain%20Tracker%20Support%20Request';
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold">Help &amp; Support</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          If something feels confusing or overwhelming, you&apos;re not alone. These options can help
          you get oriented, find answers, or reach out for technical support.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Getting started</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Walk through the core features step by step, at your own pace, inside the app.
            </p>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={handleViewTutorials}>
                View tutorials in the app
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <CardTitle>FAQs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Find answers to common questions about privacy, backups, and everyday use.
            </p>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={handleOpenFaq}>
                Browse FAQs
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <LifeBuoy className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Contact support</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If something doesn&apos;t feel right in the app or you&apos;re stuck, you can email our
              team for technical help.
            </p>
            <div className="mt-3">
              <Button variant="default" size="sm" onClick={handleContactSupport}>
                Contact support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="rounded-lg border bg-muted/40 p-4 flex gap-3 items-start">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">If you&apos;re in crisis</h3>
          <p className="text-xs text-muted-foreground">
            Pain Tracker can&apos;t monitor your safety or respond to emergencies. If you&apos;re in
            immediate danger or thinking about harming yourself, please contact your local emergency
            services or crisis line right away.
          </p>
        </div>
      </section>
    </div>
  );
}
