import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Heart, Shield, Activity, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../../design-system/components/Button';

export const LandingFooter: React.FC = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gradient-to-b from-background to-muted/50">
      {/* Final CTA Section */}
      <div className="border-b bg-gradient-to-r from-primary/5 via-blue-500/5 to-primary/5">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl break-words px-2">
              Ready to Transform Your Pain Management?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
              Join thousands of patients and clinicians using Pain Tracker Pro to understand, track, and manage chronic pain effectively.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4 px-2">
              <Button
                size="lg"
                onClick={() => navigate('/start')}
                className="gap-2 text-base sm:text-lg px-6 sm:px-8 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 w-full sm:w-auto whitespace-nowrap"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/pricing')}
                className="gap-2 text-base sm:text-lg px-6 sm:px-8 border-2 w-full sm:w-auto whitespace-nowrap"
              >
                <span>View Pricing</span>
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground px-2 break-words">
              Start with 50 free entries • Upgrade for unlimited tracking • No credit card required
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Pain Tracker Pro</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Professional-grade chronic pain tracking with AI-powered insights, automated reporting, and trauma-informed design. Built with empathy for patients and clinicians.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://github.com/CrisisCore-Systems/pain-tracker"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="View source code on GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:support@paintracker.ca"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Contact support"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button
                  onClick={() => navigate('/pricing')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing Plans
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/CrisisCore-Systems/pain-tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  Source Code
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/CrisisCore-Systems/pain-tracker/blob/main/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/CrisisCore-Systems/pain-tracker/blob/main/SECURITY.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Security Policy
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/CrisisCore-Systems/pain-tracker/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contributing
                </a>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Key Features</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>✓ 8 AI Algorithms</li>
              <li>✓ WorkSafe BC Reports</li>
              <li>✓ Real-Time Monitoring</li>
              <li>✓ 100% Offline</li>
              <li>✓ Military Encryption</li>
              <li>✓ Trauma-Informed</li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>AES-256 Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-rose-600" />
              <span>WCAG 2.1 AA</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              <span>HIPAA-Aligned</span>
            </div>
            <div className="flex items-center gap-2">
              <Github className="h-4 w-4 text-purple-600" />
              <span>Open Source</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p>© {currentYear} CrisisCore Systems. Released under MIT License.</p>
            <a
              href="https://github.com/CrisisCore-Systems/pain-tracker/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View License
            </a>
          </div>
          <p className="flex items-center gap-2">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> for chronic pain survivors
          </p>
        </div>

        {/* Privacy Statement */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50 border text-center">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Your Privacy is Guaranteed:</strong> We don't collect any data, we don't use cookies, we don't track you. 
            Your pain data stays on your device, encrypted with AES-256. No servers, no cloud, no third parties.{' '}
            <a
              href="https://github.com/CrisisCore-Systems/pain-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Verify our code →
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
