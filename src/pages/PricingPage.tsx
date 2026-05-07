/**
 * Pricing Page Component
 * Displays subscription tiers, features, and pricing
 * Upgraded with dramatic editorial magazine treatment
 */

import React, { useEffect, useRef, useState } from 'react';
import '../styles/pages/landing.css';
import '../styles/pages/pricing.css';
import { Check, X, ChevronDown, Crown, Star, Users, Sparkles, Shield, Zap, ArrowRight, Activity } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSubscription } from '../contexts/SubscriptionContext';
import { SUBSCRIPTION_PLANS, FEATURE_COMPARISON } from '../config/subscription-tiers';
import type { SubscriptionTier } from '../types/subscription';
import { TierBadge } from '../components/subscription/FeatureGates';
import { useVaultStatus } from '../hooks/useVault';
import { createCheckoutSession, getTierForCheckout } from '../utils/stripe-checkout';
import { getLocalUserId } from '../utils/user-identity';
import { combineSchemas, generateBreadcrumbSchema } from '../lib/seo';
import { applyPageMetadata } from '../components/seo/applyPageMetadata';

const PRICING_PAGE_TITLE = 'PainTracker Pricing | Track, Explain, Document | PainTracker.ca';

type CheckoutTier = NonNullable<ReturnType<typeof getTierForCheckout>>;

function isCheckoutTier(value: string | null): value is CheckoutTier {
  return value === 'basic' || value === 'pro';
}

function isBillingInterval(value: string | null): value is 'monthly' | 'yearly' {
  return value === 'monthly' || value === 'yearly';
}

function buildResumeCheckoutPath(tier: CheckoutTier, interval: 'monthly' | 'yearly'): string {
  const params = new URLSearchParams({
    resumeCheckout: '1',
    tier,
    interval,
  });

  return `/pricing?${params.toString()}`;
}

export const PricingPage: React.FC = () => {
  const { currentTier } = useSubscription();
  const vaultStatus = useVaultStatus();
  const location = useLocation();
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [checkoutMessageTone, setCheckoutMessageTone] = useState<'info' | 'warning'>('info');
  const resumedCheckoutRef = useRef<string | null>(null);

  useEffect(() => applyPageMetadata({
    title: PRICING_PAGE_TITLE,
    description: 'Compare Free, Basic, Pro, and Enterprise plans for private, offline-capable pain tracking, clinician-friendly reports, and structured documentation workflows.',
    canonicalUrl: 'https://www.paintracker.ca/pricing',
  }), []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const checkoutState = params.get('checkout');

    if (checkoutState === 'canceled') {
      setCheckoutMessage('Checkout was canceled. Your current plan has not changed.');
      setCheckoutMessageTone('warning');
      return;
    }

    if (checkoutState === 'success') {
      setCheckoutMessage('Checkout completed. Your subscription status will refresh on this device as soon as Stripe confirms the payment.');
      setCheckoutMessageTone('info');
      return;
    }

    setCheckoutMessage(null);
    setCheckoutMessageTone('info');
  }, [location.search]);

  async function startCheckout(checkoutTier: CheckoutTier, interval: 'monthly' | 'yearly') {
    setIsUpgrading(true);
    try {
      const userId = getLocalUserId();

      await createCheckoutSession({
        userId,
        tier: checkoutTier,
        interval,
      });
    } catch (err) {
      console.error('Upgrade failed:', err);
      const message = err instanceof Error
        ? err.message
        : 'Failed to start checkout. Please try again.';
      setCheckoutMessage(message);
      setCheckoutMessageTone('warning');
    } finally {
      setIsUpgrading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('resumeCheckout') !== '1' || vaultStatus.state !== 'unlocked') {
      return;
    }

    const tier = params.get('tier');
    const interval = params.get('interval');
    if (!isCheckoutTier(tier) || !isBillingInterval(interval)) {
      return;
    }

    const resumeKey = `${tier}:${interval}`;
    if (resumedCheckoutRef.current === resumeKey) {
      return;
    }

    resumedCheckoutRef.current = resumeKey;
    setBillingInterval(interval);
    navigate('/pricing', { replace: true });
    void startCheckout(tier, interval);
  }, [location.search, navigate, vaultStatus.state]);

  const schema = combineSchemas(
    generateBreadcrumbSchema(
      [
        { name: 'Home', url: '/' },
        { name: 'Pricing', url: '/pricing' },
      ],
      { siteUrl: 'https://www.paintracker.ca' }
    )
  );

  const handleUpgrade = async (tier: SubscriptionTier) => {
    try {
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

      // Checkout is tied to the current browser profile after vault unlock.
      if (vaultStatus.state !== 'unlocked') {
        setCheckoutMessage('Please unlock your vault on this device before starting checkout.');
        setCheckoutMessageTone('warning');
        const redirect = encodeURIComponent(buildResumeCheckoutPath(checkoutTier, billingInterval));
        navigate(`/start?redirect=${redirect}`);
        return;
      }

      await startCheckout(checkoutTier, billingInterval);
    } catch (err) {
      console.error('Upgrade failed:', err);
      const message = err instanceof Error
        ? err.message
        : 'Failed to start checkout. Please try again.';
      setCheckoutMessage(message);
      setCheckoutMessageTone('warning');
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
      {/* Structured data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />
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
                Pain Tracker
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

      <main id="main-content" className="relative z-10 py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto text-center mb-16 stagger-fade-up">
          <div className="badge-glow-purple inline-flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Simple, Transparent Pricing</span>
          </div>
          
          <h1 className="landing-headline landing-headline-xl mb-6">
            <span className="text-white">Free helps you keep the record. </span>
            <span className="gradient-text-animated">Upgrade helps you use it.</span>
          </h1>
          <p className="landing-subhead text-lg lg:text-xl mb-10 max-w-2xl mx-auto">
            PainTracker Free is not a trial.
          </p>

          <p className="text-base text-slate-300 max-w-3xl mx-auto mb-4 leading-relaxed">
            You can track pain privately, use core features, and keep control of your records without upgrading.
          </p>

          <p className="text-base text-slate-300 max-w-3xl mx-auto mb-4 leading-relaxed">
            Upgrade when your records need to become easier to use.
          </p>

          <p className="text-sm text-slate-400 max-w-3xl mx-auto mb-4 leading-relaxed">
            Basic helps you organize pain history into cleaner summaries for appointments and personal review. Pro is for heavier documentation workflows, including disability notes, WorkSafeBC preparation, medication response patterns, and functional impact records.
          </p>

          <p className="text-sm text-slate-400 max-w-3xl mx-auto mb-10 font-medium">
            Free helps you track. Upgrade helps you explain.
          </p>

          {checkoutMessage && (
            <div
              role="status"
              aria-live="polite"
              className={`mb-10 rounded-2xl border px-5 py-4 text-sm sm:text-base ${
                checkoutMessageTone === 'warning'
                  ? 'border-amber-400/40 bg-amber-500/10 text-amber-100'
                  : 'border-sky-400/40 bg-sky-500/10 text-sky-100'
              }`}
            >
              {checkoutMessage}
            </div>
          )}

          {/* Current Tier Display */}
          {currentTier && (
            <div className="inline-flex items-center gap-3 mb-10 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <span className="text-sm text-slate-400">Current plan:</span>
              <TierBadge tier={currentTier} size="md" />
            </div>
          )}

          {/* Billing Interval Toggle */}
          <fieldset className="inline-flex items-center gap-1 p-1.5 rounded-full bg-slate-800/80 border border-white/10 backdrop-blur-sm">
            <legend className="sr-only">Billing interval</legend>
            <button
              onClick={() => setBillingInterval('monthly')}
              aria-pressed={billingInterval === 'monthly'}
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
              aria-pressed={billingInterval === 'yearly'}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all flex items-center gap-2 ${
                billingInterval === 'yearly'
                  ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Yearly</span>
              <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                -20%
              </span>
            </button>
          </fieldset>
        </div>

        <div className="max-w-5xl mx-auto mb-16 stagger-fade-up">
          <div className="glass-card-premium p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300 mb-3">Why upgrade exists</p>
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                  Pain tracking is only the first step.
                </h2>
                <p className="text-slate-300 leading-relaxed mb-4">
                  The hard part is turning scattered daily entries into something useful when you are tired, foggy, in pain, or sitting in front of a doctor trying to explain the last three weeks in ten minutes.
                </p>
                <p className="text-slate-400 leading-relaxed mb-4">
                  Upgrade when you want less manual rewriting, cleaner summaries, easier exports, and records that are easier to bring into appointments, claims, or long-term care conversations.
                </p>
                <p className="text-slate-300 leading-relaxed font-medium">
                  PainTracker Free helps you keep the record. Paid plans help you make the record usable.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
                <p className="text-sm font-semibold text-white mb-4">Track / Explain / Document</p>
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                    <span><strong className="text-white">Free:</strong> keep a private pain record and build the habit.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                    <span><strong className="text-white">Basic:</strong> use the record for cleaner summaries and appointment prep.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-4 w-4 mt-0.5 text-emerald-400 flex-shrink-0" />
                    <span><strong className="text-white">Pro:</strong> prepare the record when documentation starts asking more from you.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-24 stagger-fade-up">
          {(Object.keys(SUBSCRIPTION_PLANS) as SubscriptionTier[]).map(tierKey => {
            const plan = SUBSCRIPTION_PLANS[tierKey];
            const price = billingInterval === 'monthly' ? plan.pricing.monthly : plan.pricing.yearly;
            const isCurrentPlan = currentTier === tierKey;
            const isPro = tierKey === 'pro';
            const isEnterprise = tierKey === 'enterprise';
            const TierIcon = tierIcons[tierKey];
            const colors = tierColors[tierKey];

            const ctaVariantClassName = (() => {
              if (isCurrentPlan) return 'bg-slate-700 text-slate-500 cursor-not-allowed';
              if (isPro) return 'btn-cta-primary';
              if (isEnterprise) {
                return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/30 hover:scale-[1.02]';
              }
              return 'bg-white/10 text-white border border-white/20 hover:bg-white/20 hover:border-white/30';
            })();

            const ctaText = (() => {
              if (isCurrentPlan) return 'Current Plan';
              if (isEnterprise) return 'Contact Sales';
              if (tierKey === 'free') return 'Start tracking free';
              if (tierKey === 'basic') return 'Make my records easier to use';
              return 'Prepare stronger documentation';
            })();

            const planNoteByTier: Record<SubscriptionTier, string> = {
              free: 'Use PainTracker privately without needing to upgrade first. Track pain, build the habit, and keep control of your records.',
              basic: 'Basic is for people who already track pain and want less manual work before appointments, personal reviews, or support conversations.',
              pro: 'Pro is for people using pain records around disability notes, WorkSafeBC preparation, medication response, functional impact, or longer-term documentation conversations.',
              enterprise: 'Evaluation access available for organizations.',
            };

            const planNote = isCurrentPlan ? null : planNoteByTier[tierKey];

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
                    {isEnterprise ? (
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
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all mb-6 ${ctaVariantClassName}`}
                  >
                    {ctaText}
                  </button>

                  {/* Plan Note */}
                  {planNote && (
                    <p className="text-sm text-center text-slate-500 mb-6">
                      {planNote}
                    </p>
                  )}

                  {/* Features Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-6" />

                  {/* Top Features */}
                  <div className="space-y-3">
                    {getTopFeatures(tierKey).map((feature, idx) => (
                      <div key={`${tierKey}-${feature}`} className="flex items-start gap-3">
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

        <div className="max-w-6xl mx-auto mb-20 stagger-fade-up">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="glass-card-premium p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Free</h2>
              <p className="text-slate-400 mb-4">For starting and staying consistent.</p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-0.5 text-emerald-400 flex-shrink-0" /><span>Track pain privately</span></li>
                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-0.5 text-emerald-400 flex-shrink-0" /><span>Works offline</span></li>
                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-0.5 text-emerald-400 flex-shrink-0" /><span>No account required to start</span></li>
                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-0.5 text-emerald-400 flex-shrink-0" /><span>Printable templates and starter pack</span></li>
                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-0.5 text-emerald-400 flex-shrink-0" /><span>Basic record keeping</span></li>
                <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-0.5 text-emerald-400 flex-shrink-0" /><span>Good for building the habit</span></li>
              </ul>
            </div>

            <div className="glass-card-premium p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Upgrade</h2>
              <p className="text-slate-400 mb-4">When your pain records need to become easier to explain.</p>
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Basic</h3>
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-0.5 text-purple-400 flex-shrink-0" /><span>Cleaner pain summaries</span></li>
                    <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-0.5 text-purple-400 flex-shrink-0" /><span>Appointment-ready notes</span></li>
                    <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-0.5 text-purple-400 flex-shrink-0" /><span>Pattern review across days and weeks</span></li>
                    <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-0.5 text-purple-400 flex-shrink-0" /><span>Less manual rewriting</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Pro</h3>
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-0.5 text-purple-400 flex-shrink-0" /><span>Documentation-ready summaries</span></li>
                    <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-0.5 text-purple-400 flex-shrink-0" /><span>Functional impact organization</span></li>
                    <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-0.5 text-purple-400 flex-shrink-0" /><span>Medication response review</span></li>
                    <li className="flex items-start gap-3"><Check className="h-4 w-4 mt-0.5 text-purple-400 flex-shrink-0" /><span>Longer timeline review</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mb-20 stagger-fade-up">
          <div className="glass-card-premium overflow-hidden">
            <div className="px-6 py-5 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">What you need</h2>
              <p className="text-sm text-slate-400 mt-2">Choose the plan by the job the record needs to do, not by pressure to upgrade.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th scope="col" className="px-6 py-4 text-left text-slate-300 font-semibold">What you need</th>
                    <th scope="col" className="px-6 py-4 text-left text-slate-300 font-semibold">Best plan</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Start tracking pain privately', 'Free'],
                    ['Keep a simple daily record', 'Free'],
                    ['Prepare cleaner notes for appointments', 'Basic'],
                    ['Reduce manual rewriting before visits', 'Basic'],
                    ['Review patterns over time', 'Basic'],
                    ['Organize functional impact notes', 'Pro'],
                    ['Prepare disability or WorkSafeBC documentation', 'Pro'],
                    ['Track medication response more seriously', 'Pro'],
                    ['Build a longer-term record system', 'Pro'],
                  ].map(([need, plan]) => (
                    <tr key={need} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-slate-300">{need}</td>
                      <td className="px-6 py-4 font-semibold text-white">{plan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-7xl mx-auto mb-24">
          <h2 className="landing-headline text-3xl lg:text-4xl text-center mb-10">
            <span className="text-white">Compare </span>
            <span className="gradient-text-animated">What Changes</span>
          </h2>

          <div className="glass-card-premium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th scope="col" className="px-6 py-5 text-left text-sm font-semibold text-slate-300">
                      Workflow or safeguard
                    </th>
                    <th scope="col" className="px-6 py-5 text-center text-sm font-semibold text-slate-400">
                      Free
                    </th>
                    <th scope="col" className="px-6 py-5 text-center text-sm font-semibold text-emerald-400">
                      Basic
                    </th>
                    <th scope="col" className="px-6 py-5 text-center text-sm font-semibold text-purple-400 bg-purple-500/10">
                      Pro
                    </th>
                    <th scope="col" className="px-6 py-5 text-center text-sm font-semibold text-amber-400">
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
                          <th
                            scope="rowgroup"
                            colSpan={5}
                            className="px-6 py-3 text-sm font-bold text-white text-left"
                          >
                            {cat.category}
                          </th>
                        </tr>

                        {/* Category Items */}
                        {cat.items.map((item, idx) => (
                          <tr
                            key={`${categoryKey}-${item.name}`}
                            className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                          >
                            <th scope="row" className="px-6 py-4 text-sm text-slate-400 text-left font-normal">
                              {item.name}
                            </th>
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
              answer="Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately, while downgrades happen at the end of your current billing period. Free remains available as the trust anchor, not as a trial timer."
            />
            <FAQItem
              question="What happens to my data if I downgrade?"
              answer="Your data stays safe. Downgrading does not erase the record you already built. If you exceed limits after a downgrade, older entries may be archived rather than deleted, and you can upgrade again to restore the higher-tier workflow."
            />
            <FAQItem
              question="Do I need a credit card to start?"
              answer="No. You can use the Free plan indefinitely. Upgrade only when you need cleaner summaries, easier exports, or less manual work turning daily entries into useful records. Organizations can request evaluation access for Enterprise."
            />
            <FAQItem
              question="Is my health data secure?"
              answer="All plans use local-first storage and encryption at rest. Pro and Enterprise add audit logs and additional privacy-aligned security controls, and Enterprise customers can request security documentation for organizational review."
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
              Start free. Upgrade only when the burden shifts.
            </h3>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Free is for starting and staying in control. Paid plans are for the moment when the record needs to become easier to use before appointments, documentation, or care coordination.
            </p>
            <button
              onClick={() => navigate('/start')}
              className="btn-cta-primary text-lg px-10 py-4 inline-flex items-center gap-3"
            >
              Use the app free
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="text-sm text-slate-500 mt-4">
              Free plan available • No credit card required • Upgrade when you need cleaner summaries
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

/**
 * Helper: Get top features for each tier
 */
export function getTopFeatures(tier: SubscriptionTier): string[] {
  const features: Record<SubscriptionTier, string[]> = {
    free: ['Private pain tracking', 'Offline-first use', 'No account required to start', 'Printable templates and starter pack', 'Good for building the habit'],
    basic: [
      'Cleaner pain summaries',
      'Appointment-ready notes',
      'Pattern review across days and weeks',
      'Better export organization',
      'Less manual rewriting',
      'Good for doctor visits and personal documentation',
    ],
    pro: [
      'Documentation-ready summaries',
      'Functional impact organization',
      'Medication response review',
      'Claim-prep record structure',
      'Longer timeline review',
      'Priority access to advanced documentation tools',
    ],
    enterprise: [
      'Unlimited everything',
      'Custom features',
      'Organization-level customization',
      'Security documentation support',
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
        aria-expanded={isOpen}
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
