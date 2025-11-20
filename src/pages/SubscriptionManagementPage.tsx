/**
 * Subscription Management Page
 * Allows users to view and manage their subscription
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  TrendingUp,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  Download,
  Settings,
  Shield,
} from 'lucide-react';
import { useSubscription, useTierBadge } from '../contexts/SubscriptionContext';
import { SUBSCRIPTION_PLANS, FEATURE_COMPARISON } from '../config/subscription-tiers';
import type { SubscriptionTier } from '../types/subscription';

export function SubscriptionManagementPage() {
  const navigate = useNavigate();
  const {
    subscription,
    currentTier,
    isLoading,
    upgradeTier,
    downgradeTier,
    cancelSubscription,
    reactivateSubscription,
  } = useSubscription();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const tierBadge = useTierBadge();
  const currentPlan = SUBSCRIPTION_PLANS[currentTier];

  // Calculate days remaining in trial
  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const handleUpgrade = async (newTier: SubscriptionTier) => {
    setProcessingAction('upgrade');
    try {
      // In production, this would redirect to Stripe checkout
      await upgradeTier(newTier, true);
      
      // Redirect to success page
      navigate('/subscription/success');
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Failed to upgrade subscription. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDowngrade = async (newTier: SubscriptionTier) => {
    setProcessingAction('downgrade');
    try {
      const changeOption = await downgradeTier(newTier);
      alert(
        `Downgrade scheduled for ${new Date(changeOption.effectiveDate || '').toLocaleDateString()}. ` +
        `You will continue to have ${currentTier} features until then.`
      );
    } catch (error) {
      console.error('Downgrade failed:', error);
      alert('Failed to schedule downgrade. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleCancel = async () => {
    setProcessingAction('cancel');
    try {
      await cancelSubscription(false); // Cancel at period end
      setShowCancelDialog(false);
      alert('Subscription canceled. You will retain access until the end of your billing period.');
    } catch (error) {
      console.error('Cancellation failed:', error);
      alert('Failed to cancel subscription. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  const handleReactivate = async () => {
    setProcessingAction('reactivate');
    try {
      await reactivateSubscription();
      alert('Subscription reactivated successfully!');
    } catch (error) {
      console.error('Reactivation failed:', error);
      alert('Failed to reactivate subscription. Please try again.');
    } finally {
      setProcessingAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Subscription Management
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Manage your Pain Tracker subscription and billing
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {tierBadge.icon} {tierBadge.label} Plan
                </h2>
                {subscription?.status === 'trialing' && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Trial
                  </span>
                )}
                {subscription?.cancelAtPeriodEnd && (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    Canceling
                  </span>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-400">{currentPlan.tagline}</p>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {currentPlan.pricing.monthly.display}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">per month</div>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {subscription?.status === 'trialing' && subscription.trialEnd && (
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Trial Ends</div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {getDaysRemaining(subscription.trialEnd)} days remaining
                  </div>
                </div>
              </div>
            )}

            {subscription?.currentPeriodEnd && (
              <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <Calendar className="w-5 h-5 text-slate-600" />
                <div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {subscription.cancelAtPeriodEnd ? 'Access Until' : 'Next Billing'}
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <Shield className="w-5 h-5 text-slate-600" />
              <div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Encryption</div>
                <div className="font-semibold text-slate-900 dark:text-white capitalize">
                  {currentPlan.features.encryption}
                </div>
              </div>
            </div>
          </div>

          {/* Usage Stats */}
          {subscription && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
                Usage This Period
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <UsageStat
                  label="Pain Entries"
                  current={subscription.usage.painEntries}
                  limit={currentPlan.features.maxPainEntries}
                />
                <UsageStat
                  label="Exports"
                  current={subscription.usage.exportCount}
                  limit={currentPlan.features.maxExportsPerMonth}
                />
                <UsageStat
                  label="Storage"
                  current={subscription.usage.storageMB}
                  limit={currentPlan.features.maxStorageMB}
                  unit="MB"
                />
                <UsageStat
                  label="Shared Users"
                  current={0} // TODO: Implement shared user tracking
                  limit={currentPlan.features.maxSharedUsers}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
            <div className="flex flex-wrap gap-3">
              {currentTier !== 'enterprise' && (
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Upgrade Plan
                </button>
              )}

              {subscription?.cancelAtPeriodEnd ? (
                <button
                  onClick={handleReactivate}
                  disabled={processingAction === 'reactivate'}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${processingAction === 'reactivate' ? 'animate-spin' : ''}`} />
                  Reactivate Subscription
                </button>
              ) : (
                currentTier !== 'free' && (
                  <button
                    onClick={() => setShowCancelDialog(true)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel Subscription
                  </button>
                )
              )}

              <button
                onClick={() => navigate('/settings')}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Account Settings
              </button>
            </div>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Your Plan Features
          </h2>

          <div className="space-y-6">
            {Object.entries(FEATURE_COMPARISON).map(([key, section]) => (
              <div key={key}>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item, index) => {
                    const currentValue = item[currentTier];
                    const hasFeature = typeof currentValue === 'boolean' ? currentValue : true;

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50"
                      >
                        <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                        <div className="flex items-center gap-2">
                          {hasFeature ? (
                            <>
                              <Check className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {typeof currentValue === 'boolean' ? 'Included' : currentValue}
                              </span>
                            </>
                          ) : (
                            <>
                              <X className="w-5 h-5 text-slate-400" />
                              <span className="text-sm text-slate-500">Not Available</span>
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

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Cancel Subscription?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  You will lose access to {tierBadge.label} features at the end of your billing period.
                  Your data will be retained according to the Free tier limits.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={processingAction === 'cancel'}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {processingAction === 'cancel' ? 'Canceling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for usage stats
interface UsageStatProps {
  label: string;
  current: number;
  limit: number;
  unit?: string;
}

function UsageStat({ label, current, limit, unit = '' }: UsageStatProps) {
  const percentage = limit === -1 ? 0 : Math.min(100, (current / limit) * 100);
  const isUnlimited = limit === -1;

  return (
    <div>
      <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">{label}</div>
      <div className="font-semibold text-slate-900 dark:text-white">
        {current} {unit} {!isUnlimited && `/ ${limit} ${unit}`}
        {isUnlimited && <span className="text-green-600 ml-1">∞</span>}
      </div>
      {!isUnlimited && (
        <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              percentage > 80 ? 'bg-red-600' : percentage > 60 ? 'bg-yellow-600' : 'bg-green-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
