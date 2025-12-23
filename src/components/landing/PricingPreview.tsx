import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Star, Zap, Crown, Users } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../../config/subscription-tiers';
import type { SubscriptionTier } from '../../types/subscription';

const TIERS: SubscriptionTier[] = ['free', 'basic', 'pro', 'enterprise'];

const tierIcons = {
  free: Star,
  basic: Zap,
  pro: Crown,
  enterprise: Users,
} as const;

export const PricingPreview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/70 to-slate-900" />

      <div className="relative container mx-auto px-4">
        <div className="text-center mb-16 lg:mb-20 max-w-3xl mx-auto stagger-fade-up">
          <div className="badge-glow-sky inline-flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Pricing</span>
          </div>

          <h2 className="landing-headline landing-headline-lg mb-6">
            <span className="text-white">Start free. </span>
            <span className="gradient-text-animated">Upgrade when you’re ready.</span>
          </h2>

          <p className="landing-subhead text-lg lg:text-xl">
            Clear tiers, no surprises. You can use core tracking forever on the Free plan.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto mb-12 stagger-fade-up">
          {TIERS.map((tier) => {
            const plan = SUBSCRIPTION_PLANS[tier];
            const Icon = tierIcons[tier];
            const isPro = tier === 'pro';
            const monthly = plan.pricing.monthly.display;
            const trialDays = plan.pricing.trial?.enabled ? plan.pricing.trial.days : 0;

            return (
              <div
                key={tier}
                className={`relative rounded-2xl overflow-hidden ${isPro ? 'lg:scale-105' : ''}`}
              >
                <div
                  className={`absolute inset-0 ${
                    isPro
                      ? 'bg-gradient-to-b from-purple-500/20 via-slate-800/95 to-slate-900/95'
                      : 'bg-gradient-to-b from-slate-800/80 to-slate-900/90'
                  }`}
                />
                <div
                  className={`absolute inset-0 rounded-2xl border ${isPro ? 'border-purple-500/50' : 'border-white/10'}`}
                />

                <div className="relative p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-2">
                      <div className={`p-2.5 rounded-xl ${isPro ? 'bg-purple-500/20' : 'bg-white/5'} border border-white/10`}>
                        <Icon className={`h-5 w-5 ${isPro ? 'text-purple-300' : 'text-slate-200'}`} />
                      </div>
                      <div>
                        <div className="font-bold text-white">{plan.name}</div>
                        <div className="text-xs text-slate-500">{plan.tagline}</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl font-extrabold text-white tracking-tight">
                      {monthly}
                      {tier !== 'enterprise' && <span className="text-base font-semibold text-slate-400">/mo</span>}
                    </div>
                    {trialDays > 0 ? (
                      <div className="text-xs text-emerald-300">Includes a {trialDays}-day trial</div>
                    ) : (
                      <div className="text-xs text-slate-500">No credit card required</div>
                    )}
                  </div>

                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-4">{plan.description}</p>

                  <button
                    type="button"
                    onClick={() => navigate('/pricing')}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                      isPro
                        ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30'
                        : 'bg-white/5 text-slate-200 border border-white/10 hover:bg-white/10'
                    }`}
                    aria-label={`View full pricing for ${plan.name}`}
                  >
                    View full pricing
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/pricing')}
            className="inline-flex items-center gap-2 text-lg font-semibold text-sky-400 hover:text-sky-300 transition-all group"
          >
            Compare plans
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
