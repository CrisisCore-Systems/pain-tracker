/**
 * Subscription Management Page
 * Allows users to view and manage their subscription
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Check,
  ExternalLink,
  RefreshCw,
  Settings,
  Shield,
  X,
  Crown,
  Sparkles,
  ArrowLeft,
  TrendingUp,
} from 'lucide-react';
import { useSubscription, useTierBadge } from '../contexts/SubscriptionContext';
import { SUBSCRIPTION_PLANS, FEATURE_COMPARISON } from '../config/subscription-tiers';
import { openBillingPortal } from '../utils/stripe-portal';

export function SubscriptionManagementPage() {
  const navigate = useNavigate();
  const {
    subscription,
    currentTier,
    isLoading,
  } = useSubscription();

  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const tierBadge = useTierBadge();
  const currentPlan = SUBSCRIPTION_PLANS[currentTier];

  // Calculate days remaining in evaluation
  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleOpenBillingPortal = async () => {
    if (!subscription?.userId) {
      alert('No subscription is available to manage from this device.');
      return;
    }

    setProcessingAction('portal');
    try {
      await openBillingPortal({ userId: subscription.userId });
    } catch (error) {
      console.error('Billing portal failed:', error);
      alert('Billing changes are unavailable right now. Please try again from this device later.');
    } finally {
      setProcessingAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
              <Crown className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Subscription Management
              </h1>
              <p className="text-muted-foreground">
                Review billing details tied to this browser profile and current subscription
              </p>
            </div>
          </div>
        </div>

        {/* Current Plan Card */}
        <div 
          className="rounded-2xl p-6 mb-8 border border-border relative overflow-hidden bg-card"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
          
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                  {tierBadge.icon} {tierBadge.label} Plan
                </h2>
                {subscription?.status === 'trialing' && (
                  <span className="px-3 py-1 bg-sky-500/20 text-sky-400 rounded-full text-sm font-medium border border-sky-500/30">
                    Evaluation
                  </span>
                )}
                {subscription?.cancelAtPeriodEnd && (
                  <span className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full text-sm font-medium border border-rose-500/30">
                    Canceling
                  </span>
                )}
              </div>
              <p className="text-muted-foreground">{currentPlan.tagline}</p>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                {currentPlan.pricing.monthly.display}
              </div>
              <div className="text-sm text-muted-foreground">per month</div>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {subscription?.status === 'trialing' && subscription.trialEnd && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
                <Calendar className="w-5 h-5 text-sky-400" />
                <div>
                  <div className="text-sm text-muted-foreground">Evaluation Ends</div>
                  <div className="font-semibold text-foreground">
                    {getDaysRemaining(subscription.trialEnd)} days remaining
                  </div>
                </div>
              </div>
            )}

            {subscription?.currentPeriodEnd && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted border border-border">
                <Calendar className="w-5 h-5 text-violet-400" />
                <div>
                  <div className="text-sm text-muted-foreground">
                    {subscription.cancelAtPeriodEnd ? 'Access Until' : 'Next Billing'}
                  </div>
                  <div className="font-semibold text-foreground">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 rounded-xl bg-muted border border-border">
              <Shield className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-sm text-muted-foreground">Encryption</div>
                <div className="font-semibold text-foreground capitalize">
                  {currentPlan.features.encryption}
                </div>
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          {subscription && (
            <div className="border-t border-slate-700/50 pt-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                Usage This Period
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <UsageStat
                  label="Pain Entries"
                  current={subscription.usage.painEntries}
                  limit={currentPlan.features.maxPainEntries}
                  color="sky"
                />
                <UsageStat
                  label="Exports"
                  current={subscription.usage.exportCount}
                  limit={currentPlan.features.maxExportsPerMonth}
                  color="violet"
                />
                <UsageStat
                  label="Storage"
                  current={subscription.usage.storageMB}
                  limit={currentPlan.features.maxStorageMB}
                  unit="MB"
                  color="emerald"
                />
                <UsageStat
                  label="Shared Users"
                  current={subscription.usage.sharedUsers}
                  limit={currentPlan.features.maxSharedUsers}
                  color="amber"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-slate-700/50 pt-6 mt-6">
            <div className="flex flex-wrap gap-3">
              {currentTier !== 'enterprise' && (
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                  }}
                >
                  <TrendingUp className="w-4 h-4" />
                  Upgrade Plan
                </button>
              )}

              {currentTier !== 'free' && (
                <button
                  onClick={handleOpenBillingPortal}
                  disabled={processingAction === 'portal'}
                  className="px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-white disabled:opacity-50 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  }}
                >
                  <ExternalLink className={`w-4 h-4 ${processingAction === 'portal' ? 'animate-spin' : ''}`} />
                  Open Billing Portal
                </button>
              )}

              <button
                onClick={() => navigate('/settings')}
                className="px-5 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-muted-foreground border border-border hover:bg-muted hover:-translate-y-0.5"
              >
                <Settings className="w-4 h-4" />
                App Settings
              </button>
            </div>

            {currentTier !== 'free' && (
              <p className="mt-4 text-sm text-slate-400 bg-slate-800/70 border border-white/10 rounded-xl p-3">
                Billing changes open in Stripe&apos;s hosted portal and are limited to the subscription linked to this browser profile.
              </p>
            )}
          </div>
        </div>

        {/* Feature Comparison */}
        <div 
          className="rounded-2xl p-6 border border-border relative overflow-hidden bg-card"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Gradient accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500" />
          
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Check className="w-6 h-6 text-emerald-400" />
            Your Plan Features
          </h2>

          <div className="space-y-6">
            {Object.entries(FEATURE_COMPARISON).map(([key, section]) => (
              <div key={key}>
                <h3 className="font-semibold text-foreground mb-3 text-lg">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item, index) => {
                    const currentValue = item[currentTier];
                    const hasFeature = typeof currentValue === 'boolean' ? currentValue : true;

                    return (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted border border-slate-700/30 hover:border-border/50 transition-colors"
                      >
                        <span className="text-muted-foreground">{item.name}</span>
                        <div className="flex items-center gap-2">
                          {hasFeature ? (
                            <>
                              <Check className="w-5 h-5 text-emerald-400" />
                              <span className="text-sm font-medium text-foreground">
                                {typeof currentValue === 'boolean' ? 'Included' : currentValue}
                              </span>
                            </>
                          ) : (
                            <>
                              <X className="w-5 h-5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Not Available</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

// Helper component for usage stats
interface UsageStatProps {
  label: string;
  current: number;
  limit: number;
  unit?: string;
  color?: 'sky' | 'violet' | 'emerald' | 'amber';
}

function UsageStat({ label, current, limit, unit = '', color = 'sky' }: Readonly<UsageStatProps>) {
  const percentage = limit === -1 ? 0 : Math.min(100, (current / limit) * 100);
  const isUnlimited = limit === -1;

  const colorClasses = {
    sky: { bar: 'from-sky-500 to-cyan-500', text: 'text-sky-400' },
    violet: { bar: 'from-violet-500 to-purple-500', text: 'text-violet-400' },
    emerald: { bar: 'from-emerald-500 to-green-500', text: 'text-emerald-400' },
    amber: { bar: 'from-amber-500 to-yellow-500', text: 'text-amber-400' },
  };

  const getBarColor = () => {
    if (percentage > 80) return 'from-rose-500 to-red-500';
    if (percentage > 60) return 'from-amber-500 to-yellow-500';
    return colorClasses[color].bar;
  };

  return (
    <div className="p-4 rounded-xl bg-muted border border-border">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="font-semibold text-foreground">
        {current} {unit} {!isUnlimited && <span className="text-muted-foreground">/ {limit} {unit}</span>}
        {isUnlimited && <span className={`ml-1 ${colorClasses[color].text}`}></span>}
      </div>
      {!isUnlimited && (
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getBarColor()} transition-all rounded-full`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}