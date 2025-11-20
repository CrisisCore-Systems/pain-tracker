/**
 * Stripe Checkout Utility
 * Handles redirection to Stripe checkout for subscriptions
 */

import type { SubscriptionTier } from '../types/subscription';

interface CheckoutOptions {
  userId: string;
  tier: 'basic' | 'pro';
  interval: 'monthly' | 'yearly';
  email?: string;
}

interface CheckoutResponse {
  sessionId: string;
  url: string;
}

/**
 * Create a Stripe checkout session and redirect user to payment
 */
export async function createCheckoutSession(options: CheckoutOptions): Promise<void> {
  const { userId, tier, interval, email } = options;

  // Determine success and cancel URLs
  const baseUrl = window.location.origin;
  const successUrl = `${baseUrl}/app?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/pricing?checkout=canceled`;

  try {
    // Call API to create checkout session
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        tier,
        interval,
        successUrl,
        cancelUrl,
        email,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const data: CheckoutResponse = await response.json();

    // Redirect to Stripe Checkout
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('No checkout URL received');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
}

/**
 * Helper to get tier and interval from SubscriptionTier
 */
export function getTierForCheckout(tier: SubscriptionTier): 'basic' | 'pro' | null {
  if (tier === 'basic') return 'basic';
  if (tier === 'pro') return 'pro';
  return null; // Free and Enterprise don't use Stripe checkout
}
