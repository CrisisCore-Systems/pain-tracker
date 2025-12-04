/**
 * Pricing Page Component
 * Displays subscription tiers, features, and pricing
 * Upgraded with dramatic editorial magazine treatment
 */

import React, { useState } from 'react';
import { Check, X, ChevronDown, Crown, Star, Users, Sparkles, Shield, Zap, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SUBSCRIPTION_PLANS, FEATURE_COMPARISON } from '../config/subscription-tiers';
import type { SubscriptionTier } from '../types/subscription';
import { TierBadge } from '../components/subscription/FeatureGates';
import { useVaultStatus } from '../hooks/useVault';
import { createCheckoutSession, getTierForCheckout } from '../utils/stripe-checkout';

export const PricingPage: React.FC = () => {
  const { currentTier } = useSubscription();
  const vaultStatus = useVaultStatus();
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    setIsUpgrading(true);
    try {
      // Check if user is authenticated
      if (vaultStatus.state !== 'unlocked') {
        // Redirect to login/setup page
        alert('Please sign in or create an account to subscribe.');
        navigate('/start?redirect=/pricing');
        return;
      }

      // Free tier doesn't need payment
      if (tier === 'free') {
        alert('You are already on the Free plan!');
        return;
      }

      // Enterprise requires contacting sales
      if (tier === 'enterprise') {
        alert('Please contact sales@paintracker.ca for Enterprise plans.');
        return;
      }

      // Get tier for checkout (basic or pro)
      const checkoutTier = getTierForCheckout(tier);
      if (!checkoutTier) {
        throw new Error('Invalid tier for checkout');
      }

      // Get user ID - generate a unique ID based on vault creation time
      // TODO: Replace with actual user ID from authentication system
      const userId = vaultStatus.metadata?.createdAt 
        ? `vault-${vaultStatus.metadata.createdAt.replace(/[^0-9]/g, '').substring(0, 13)}`
        : `user-${Date.now()}`;

      // Redirect to Stripe Checkout
      await createCheckoutSession({
        userId,
        tier: checkoutTier,
        interval: billingInterval,
      });

    } catch (err) {
      console.error('Upgrade failed:', err);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const tierIcons = {
    free: Star,
    basic: Zap,
    pro: Crown,
    enterprise: Users,
  };

  const tierColors = {
    free: { icon: 'icon-sky', badge: 'badge-glow-sky', gradient: 'from-slate-500 to-slate-600' },
    basic: { icon: 'icon-emerald', badge: 'badge-glow-emerald', gradient: 'from-emerald-500 to-teal-500' },
    pro: { icon: 'icon-purple', badge: 'badge-glow-purple', gradient: 'from-purple-500 to-violet-500' },
    enterprise: { icon: 'icon-amber', badge: 'badge-glow-amber', gradient: 'from-amber-500 to-orange-500' },
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
      
      {/* Animated Orbs */}
      <div className="orb-container">
        <div className="orb-glow orb-glow-purple" style={{ width: '500px', height: '500px', top: '-10%', right: '10%' }} />
        <div className="orb-glow orb-glow-sky" style={{ width: '400px', height: '400px', top: '40%', left: '-5%', animationDelay: '8s' }} />
        <div className="orb-glow orb-glow-emerald" style={{ width: '350px', height: '350px', bottom: '10%', right: '20%', animationDelay: '15s' }} />
      </div>
      
      {/* Grid Pattern */}
      <div className="hero-grid-pattern" />

      {/* Navigation */}
      <nav className="nav-floating-glass sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button onClick={() => navigate('/')} className="flex items-center gap-3">
              <div className="relative">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 shadow-lg shadow-sky-500/30">
                  <Activity className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Pain Tracker Pro
              </span>
            </button>
            <button
              onClick={() => navigate('/start')}
              className="btn-cta-primary flex items-center gap-2 text-sm px-5 py-2.5"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16 stagger-fade-up">
          <div className="badge-glow-purple inline-flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Simple, Transparent Pricing</span>
          </div>
          
          <h1 className="landing-headline landing-headline-xl mb-6">
            <span className="text-white">Choose Your </span>
            <span className="gradient-text-animated">Perfect Plan</span>
          </h1>
          <p className="landing-subhead text-lg lg:text-xl mb-10 max-w-2xl mx-auto">
            Start free, upgrade when you need more power. All plans include our core 
            privacy-first, offline-capable pain tracking.
          </p>

          {/* Current Tier Display */}
          {currentTier && (
            <div className="inline-flex items-center gap-3 mb-10 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <span className="text-sm text-slate-400">Current plan:</span>
              <TierBadge tier={currentTier} size="md" />
            </div>
          )}

          {/* Billing Interval Toggle */}
          <div className="inline-flex items-center gap-1 p-1.5 rounded-full bg-slate-800/80 border border-white/10 backdrop-blur-sm">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${
                billingInterval === 'yearly'
                  ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly
              <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-24 stagger-fade-up">
          {(Object.keys(SUBSCRIPTION_PLANS) as SubscriptionTier[]).map(tierKey => {
            const plan = SUBSCRIPTION_PLANS[tierKey];
            const price = billingInterval === 'monthly' ? plan.pricing.monthly : plan.pricing.yearly;
            const isCurrentPlan = currentTier === tierKey;
            const isPro = tierKey === 'pro';
            const TierIcon = tierIcons[tierKey];
            const colors = tierColors[tierKey];

            return (
              <div
                key={tierKey}
                className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
                  isPro 
                    ? 'lg:scale-105 z-10' 
                    : 'hover:scale-[1.02]'
                }`}
              >
                {/* Card Background */}
                <div className={`absolute inset-0 ${
                  isPro 
                    ? 'bg-gradient-to-b from-purple-500/20 via-slate-800/95 to-slate-900/95' 
                    : 'bg-gradient-to-b from-slate-800/80 to-slate-900/90'
                }`} />
                
                {/* Glow Effect for Pro */}
                {isPro && (
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
                )}
                
                {/* Border */}
                <div className={`absolute inset-0 rounded-2xl border ${
                  isPro 
                    ? 'border-purple-500/50' 
                    : 'border-white/10'
                }`} />

                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-violet-500 to-purple-500" />
                )}

                <div className="relative p-6 lg:p-8">
                  {/* Popular Tag */}
                  {plan.popular && (
                    <div className="absolute top-4 right-4">
                      <span className="badge-glow-purple text-xs flex items-center gap-1.5">
                        <Crown className="h-3 w-3" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Tier Icon */}
                  <div className={`icon-glow-container w-14 h-14 mb-5 ${colors.icon}`}>
                    <TierIcon className="h-7 w-7" />
                  </div>

                  {/* Plan Name & Tagline */}
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-6 min-h-[40px]">{plan.tagline}</p>

                  {/* Price */}
                  <div className="mb-6">
                    {tierKey === 'enterprise' ? (
                      <div>
                        <div className="text-3xl font-extrabold text-white">Custom</div>
                        <p className="text-sm text-slate-500 mt-1">Contact sales</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl lg:text-5xl font-extrabold text-white">
                            {price.display}
                          </span>
                          {tierKey !== 'free' && (
                            <span className="text-slate-500 text-lg">
                              /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                            </span>
                          )}
                        </div>
                        {billingInterval === 'yearly' && tierKey !== 'free' && (
                          <p className="text-sm text-emerald-400 mt-1 font-medium">
                            Save {plan.pricing.yearly.savings}% annually
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(tierKey)}
                    disabled={isCurrentPlan || isUpgrading}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all mb-6 ${
                      isCurrentPlan
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : isPro
                          ? 'btn-cta-primary'
                          : tierKey === 'enterprise'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02]'
                            : 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30'
                    }`}
                  >
                    {isCurrentPlan ? 'Current Plan' : tierKey === 'enterprise' ? 'Contact Sales' : `Get ${plan.name}`}
                  </button>

                  {/* Trial Info */}
                  {plan.pricing.trial.enabled && !isCurrentPlan && (
                    <p className="text-sm text-center text-slate-500 mb-6">
                      {plan.pricing.trial.days}-day free trial • No credit card
                    </p>
                  )}

                  {/* Features Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-6" />

                  {/* Top Features */}
                  <div className="space-y-3">
                    {getTopFeatures(tierKey).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0">
                          <Check className={`w-4 h-4 ${
                            isPro ? 'text-purple-400' : 'text-emerald-400'
                          }`} />
                        </div>
                        <span className="text-sm text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-7xl mx-auto mb-24">
          <h2 className="landing-headline text-3xl lg:text-4xl text-center mb-10">
            <span className="text-white">Compare </span>
            <span className="gradient-text-animated">All Features</span>
          </h2>

          <div className="glass-card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-5 text-left text-sm font-semibold text-slate-300">
                      Feature
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-slate-400">
                      Free
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-emerald-400">
                      Basic
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-purple-400 bg-purple-500/10">
                      Pro
                    </th>
                    <th className="px-6 py-5 text-center text-sm font-semibold text-amber-400">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(FEATURE_COMPARISON).map(([categoryKey, category]) => {
                    const cat = category as {
                      category: string;
                      items: Array<{
                        name: string;
                        free: string | boolean;
                        basic: string | boolean;
                        pro: string | boolean;
                        enterprise: string | boolean;
                      }>;
                    };
                    return (
                      <React.Fragment key={categoryKey}>
                        {/* Category Header */}
                        <tr className="bg-slate-800/50">
                          <td
                            colSpan={5}
                            className="px-6 py-3 text-sm font-bold text-white"
                          >
                            {cat.category}
                          </td>
                        </tr>

                        {/* Category Items */}
                        {cat.items.map((item, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-6 py-4 text-sm text-slate-400">
                              {item.name}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <FeatureCell value={item.free} />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <FeatureCell value={item.basic} />
                            </td>
                            <td className="px-6 py-4 text-center bg-purple-500/5">
                              <FeatureCell value={item.pro} isPro />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <FeatureCell value={item.enterprise} />
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="max-w-4xl mx-auto mb-24">
          <div className="trust-badge-row">
            <div className="trust-badge-item">
              <Shield className="text-emerald-400" />
              <span>AES-256 Encrypted</span>
            </div>
            <div className="trust-badge-item">
              <Zap className="text-sky-400" />
              <span>Instant Setup</span>
            </div>
            <div className="trust-badge-item">
              <Star className="text-amber-400" />
              <span>No Credit Card Required</span>
            </div>
            <div className="trust-badge-item">
              <Users className="text-purple-400" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="landing-headline text-3xl lg:text-4xl text-center mb-10">
            <span className="text-white">Frequently Asked </span>
            <span className="gradient-text-animated">Questions</span>
          </h2>
          <div className="space-y-4">
            <FAQItem
              question="Can I change plans at any time?"
              answer="Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades happen at the end of your current billing period."
            />
            <FAQItem
              question="What happens to my data if I downgrade?"
              answer="Your data is always safe. If you exceed limits after downgrading, older entries will be archived but not deleted. You can upgrade again to restore full access."
            />
            <FAQItem
              question="Is there a free trial?"
              answer="Yes! Basic, Pro, and Enterprise plans all come with free trials (14, 30, and 60 days respectively). No credit card required to start."
            />
            <FAQItem
              question="Is my health data secure?"
              answer="Absolutely. All plans include end-to-end encryption. Pro and Enterprise plans add HIPAA compliance and SOC2 certification for healthcare organizations."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards, debit cards, and PayPal through our secure Stripe payment processing. Enterprise customers can pay via invoice."
            />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-3xl mx-auto mt-20 text-center">
          <div className="glass-card-premium p-8 lg:p-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Ready to transform your pain management?
            </h3>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Join thousands of patients and clinicians using Pain Tracker Pro to understand, 
              track, and communicate chronic pain effectively.
            </p>
            <button
              onClick={() => navigate('/start')}
              className="btn-cta-primary text-lg px-10 py-4 inline-flex items-center gap-3"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="text-sm text-slate-500 mt-4">
              No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Helper: Get top features for each tier
 */
export function getTopFeatures(tier: SubscriptionTier): string[] {
  const features: Record<SubscriptionTier, string[]> = {
    free: ['50 pain entries', 'Basic analytics', 'CSV export', 'Offline mode', 'Mobile app access'],
    basic: [
      '500 entries',
      'Advanced analytics',
      'PDF & WCB reports',
      'Family sharing (2 users)',
      'Empathy intelligence',
      '2FA security',
    ],
    pro: [
      'Unlimited entries',
      'Predictive insights',
      'Clinical PDF export',
      'HIPAA compliance',
      'Healthcare API access',
      'Priority support (4h)',
    ],
    enterprise: [
      'Unlimited everything',
      'Custom features',
      'White-label options',
      'SOC2 compliance',
      'Dedicated support (1h)',
      'Custom training',
    ],
  };
  return features[tier];
}

/**
 * Feature Cell Component
 */
const FeatureCell: React.FC<{ value: string | number | boolean; isPro?: boolean }> = ({ value, isPro }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className={`w-5 h-5 mx-auto ${isPro ? 'text-purple-400' : 'text-emerald-400'}`} />
    ) : (
      <X className="w-5 h-5 text-slate-600 mx-auto" />
    );
  }

  return <span className={`text-sm ${isPro ? 'text-purple-300' : 'text-slate-400'}`}>{value}</span>;
};

/**
 * FAQ Item Component
 */
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`glass-card-premium overflow-hidden transition-all duration-300 ${isOpen ? 'ring-1 ring-purple-500/30' : ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-semibold text-white pr-4">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-500 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48' : 'max-h-0'}`}>
        <div className="px-6 pb-5 pt-0">
          <p className="text-slate-400 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
};
