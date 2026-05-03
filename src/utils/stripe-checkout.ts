/**
 * Stripe Checkout Utility
 * Handles redirection to Stripe checkout for subscriptions
 */

import type { SubscriptionTier } from '../types/subscription';
import { buildApiUrl, getApiRequestCredentials } from '../lib/api-url';

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

async function readCheckoutError(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const error = await response.json() as { error?: string; message?: string };
    return error.message || error.error || 'Failed to create checkout session';
  }

  const text = await response.text();
  return text.trim() || `Checkout request failed with status ${response.status}`;
}

/**
 * Create a Stripe checkout session and redirect user to payment
 */
export async function createCheckoutSession(options: CheckoutOptions): Promise<void> {
  const { userId, tier, interval, email } = options;

  // Determine success and cancel URLs
  const baseUrl = globalThis.location.origin;
  const successUrl = `${baseUrl}/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/pricing?checkout=canceled`;

  try {
    // Call API to create checkout session
    const response = await fetch(buildApiUrl('/stripe/create-checkout-session'), {
      method: 'POST',
      credentials: getApiRequestCredentials(),
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
      throw new Error(await readCheckoutError(response));
    }

    const data: CheckoutResponse = await response.json();

    // Redirect to Stripe Checkout
    if (data.url) {
      globalThis.location.href = data.url;
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
