import { PainTrackerIcon } from './BrandedLogo';
import {
  Brain,
  Smartphone,
  Shield,
  Zap,
  Users,
  BarChart3,
  Globe,
  Award,
  CheckCircle,
  Stethoscope,
} from 'lucide-react';

// Hero Banner Component
export function HeroBanner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-green-100 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <Award className="w-4 h-4 mr-2" />
              AI-Powered Pain Management Platform
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                Pain Tracker
                <span className="block text-transparent bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text">
                  Pro
                </span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-xl">
                Revolutionary pain management with predictive AI analytics, clinical integration,
                and evidence-based insights for better health outcomes.
              </p>
            </div>

            {/* Key Stats */}
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">95%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">FHIR</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Compliant</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">AI</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Powered</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Start Free Trial
              </button>
              <button className="px-8 py-4 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:border-blue-300 hover:text-blue-700 transition-all duration-300">
                View Demo
              </button>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
              {/* Mock App Interface */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <PainTrackerIcon size={32} />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        Pain Tracker Pro
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        AI-Powered Analytics
                      </div>
                    </div>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>

                {/* Pain Level Visualization */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-xl">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Current Pain Level
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl font-bold text-blue-600">4.2</div>
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div className="w-5/12 bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-xs text-green-600 mt-1">↓ 15% from last week</div>
                </div>

                {/* Features Preview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <Brain className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                    <div className="text-xs font-medium">AI Insights</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                    <div className="text-xs font-medium">Analytics</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-200 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-green-200 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Features Section
export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Predictions',
      description:
        'Machine learning algorithms predict pain patterns and provide personalized insights.',
      color: 'purple',
    },
    {
      icon: Stethoscope,
      title: 'FHIR Compliance',
      description: 'Full HL7 FHIR R4 compliance for seamless healthcare system integration.',
      color: 'blue',
    },
    {
      icon: Smartphone,
      title: 'Mobile-First Design',
      description: 'Touch-optimized interface with haptic feedback and offline capabilities.',
      color: 'green',
    },
    {
      icon: Shield,
      title: 'Privacy-First',
      description: 'End-to-end encryption with local-only storage and optional sharing.',
      color: 'red',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive pain analysis with trend detection and correlation mapping.',
      color: 'yellow',
    },
    {
      icon: Globe,
      title: 'Clinical Integration',
      description: 'Provider dashboards and patient management tools for healthcare teams.',
      color: 'indigo',
    },
  ];

  const colorMap = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  return (
    <div className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Everything You Need for
            <span className="text-transparent bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text">
              {' '}
              Pain Management
            </span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Comprehensive tools designed by healthcare professionals for evidence-based pain
            tracking and analysis.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colorMap[feature.color as keyof typeof colorMap]} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Trust Section
export function TrustSection() {
  const trustItems = [
    {
      icon: Shield,
      title: 'HIPAA Compliant',
      description: 'Full healthcare data protection compliance',
    },
    {
      icon: Award,
      title: 'Clinically Validated',
      description: 'Evidence-based algorithms and methodologies',
    },
    {
      icon: Users,
      title: 'Trusted by Providers',
      description: '500+ healthcare organizations worldwide',
    },
    {
      icon: Zap,
      title: 'Real-Time Sync',
      description: 'Instant data synchronization across devices',
    },
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-slate-900 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Trusted by Healthcare Professionals</h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Built to meet the highest standards of medical data security and clinical accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {trustItems.map((item, index) => (
            <div key={index} className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-800/50 rounded-2xl flex items-center justify-center">
                <item.icon className="w-8 h-8 text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-blue-200 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-300">500+</div>
            <div className="text-blue-200 text-sm">Healthcare Organizations</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-300">99.9%</div>
            <div className="text-blue-200 text-sm">Uptime Reliability</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-300">95%</div>
            <div className="text-blue-200 text-sm">Prediction Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-300">24/7</div>
            <div className="text-blue-200 text-sm">Support Available</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// CTA Section
export function CallToActionSection() {
  return (
    <div className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="flex justify-center">
            <PainTrackerIcon size={64} color="rgba(255,255,255,0.9)" />
          </div>

          <div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Pain Management?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of patients and healthcare providers using AI-powered insights to
              improve pain management outcomes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Start Free Trial
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300">
              Contact Sales
            </button>
          </div>

          <div className="flex items-center justify-center space-x-6 text-blue-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Full feature access</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
