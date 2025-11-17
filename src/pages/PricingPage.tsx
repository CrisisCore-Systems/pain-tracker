/**
 * Pricing Page Component
 * Displays subscription tiers, features, and pricing
 */

import React, { useState } from 'react';
import { Check, X, TrendingUp, Crown, Star, Users } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SUBSCRIPTION_PLANS, FEATURE_COMPARISON } from '../config/subscription-tiers';
import type { SubscriptionTier } from '../types/subscription';
import { TierBadge } from '../components/subscription/FeatureGates';

export const PricingPage: React.FC = () => {
  const { currentTier, upgradeTier } = useSubscription();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async (tier: SubscriptionTier) => {
    setIsUpgrading(true);
    try {
      await upgradeTier(tier);
      // In a real app, redirect to payment provider or confirmation page
      alert(`Upgrading to ${tier} plan...`);
    } catch (err) {
      console.error('Upgrade failed:', err);
      alert('Upgrade failed. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Start free, upgrade when you need more power
        </p>

        {/* Current Tier Display */}
        {currentTier && (
          <div className="inline-flex items-center gap-2 mb-8">
            <span className="text-sm text-gray-600 dark:text-gray-400">Current plan:</span>
            <TierBadge tier={currentTier} size="md" />
          </div>
        )}

        {/* Billing Interval Toggle */}
        <div className="inline-flex items-center gap-4 bg-white rounded-full p-1 border-2 border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${
              billingInterval === 'monthly'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
              billingInterval === 'yearly'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {(Object.keys(SUBSCRIPTION_PLANS) as SubscriptionTier[]).map(tierKey => {
          const plan = SUBSCRIPTION_PLANS[tierKey];
          const price = billingInterval === 'monthly' ? plan.pricing.monthly : plan.pricing.yearly;

          const isCurrentPlan = currentTier === tierKey;
          const isPremium = tierKey === 'pro' || tierKey === 'enterprise';

          return (
            <div
              key={tierKey}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-gradient-to-b from-purple-50 to-white border-4 border-purple-500 shadow-2xl scale-105'
                  : plan.recommended
                    ? 'bg-gradient-to-b from-blue-50 to-white border-2 border-blue-300 shadow-xl'
                    : 'bg-white border-2 border-gray-200 shadow-lg'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Tier Icon */}
              <div className="mb-4">
                {tierKey === 'free' && (
                  <Star className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                )}
                {tierKey === 'basic' && <Star className="w-12 h-12 text-blue-500" />}
                {tierKey === 'pro' && <Crown className="w-12 h-12 text-purple-500" />}
                {tierKey === 'enterprise' && <Users className="w-12 h-12 text-amber-500" />}
              </div>

              {/* Plan Name & Tagline */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {plan.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{plan.tagline}</p>

              {/* Price */}
              <div className="mb-6">
                {tierKey === 'enterprise' ? (
                  <div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      Custom
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Contact sales</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                        {price.display}
                      </span>
                      {tierKey !== 'free' && (
                        <span className="text-gray-600 dark:text-gray-400">
                          /{billingInterval === 'monthly' ? 'mo' : 'yr'}
                        </span>
                      )}
                    </div>
                    {billingInterval === 'yearly' && tierKey !== 'free' && (
                      <p className="text-sm text-green-600 mt-1">
                        Save {plan.pricing.yearly.savings}%
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleUpgrade(tierKey)}
                disabled={isCurrentPlan || isUpgrading}
                className={`w-full py-3 rounded-lg font-semibold transition-all mb-6 ${
                  isCurrentPlan
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : isPremium
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:scale-105'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {isCurrentPlan ? 'Current Plan' : `Get ${plan.name}`}
              </button>

              {/* Trial Info */}
              {plan.pricing.trial.enabled && !isCurrentPlan && (
                <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-6">
                  {plan.pricing.trial.days}-day free trial
                </p>
              )}

              {/* Top Features */}
              <div className="space-y-3">
                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  Top features:
                </p>
                {getTopFeatures(tierKey).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Compare All Features</h2>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Free
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Basic
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100 bg-purple-50">
                    Pro
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
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
                      <tr className="bg-gray-100 dark:bg-gray-800">
                        <td
                          colSpan={5}
                          className="px-6 py-3 text-sm font-bold text-gray-900 dark:text-gray-100"
                        >
                          {cat.category}
                        </td>
                      </tr>

                      {/* Category Items */}
                      {cat.items.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-100 hover:bg-gray-50 dark:bg-gray-900"
                        >
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <FeatureCell value={item.free} />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <FeatureCell value={item.basic} />
                          </td>
                          <td className="px-6 py-4 text-center bg-purple-50">
                            <FeatureCell value={item.pro} />
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

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-6">
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
const FeatureCell: React.FC<{ value: string | number | boolean }> = ({ value }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-green-500 mx-auto" />
    ) : (
      <X className="w-5 h-5 text-gray-300 dark:text-gray-600 mx-auto" />
    );
  }

  return <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>;
};

/**
 * FAQ Item Component
 */
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:bg-gray-900 transition-colors"
      >
        <span className="font-semibold text-gray-900 dark:text-gray-100">{question}</span>
        <TrendingUp
          className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-700 dark:text-gray-300">{answer}</p>
        </div>
      )}
    </div>
  );
};
