/**
 * Stripe Checkout Session Creation API
 * POST /api/stripe/create-checkout-session
 * 
 * Creates a Stripe checkout session for subscription purchases
 */

import type { VercelRequest, VercelResponse } from '../../src/types/vercel';
import Stripe from 'stripe';

// Price IDs from Stripe dashboard (set these in environment variables)
const PRICE_IDS = {
  basic_monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY || '',
  basic_yearly: process.env.STRIPE_PRICE_BASIC_YEARLY || '',
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
};

interface CreateCheckoutSessionRequest {
  userId: string;
  tier: 'basic' | 'pro';
  interval: 'monthly' | 'yearly';
  successUrl: string;
  cancelUrl: string;
  email?: string;
}

interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Re-initialize Stripe per-request so the latest env var is used and we can log a diagnostic
  const rawKey = process.env.STRIPE_SECRET_KEY || '';
  // Re-initialize Stripe with the current env var
  const stripe = new Stripe(rawKey, { apiVersion: '2025-10-29.clover' });
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const {
      userId,
      tier,
      interval,
      successUrl,
      cancelUrl,
      email,
    } = req.body as CreateCheckoutSessionRequest;

    // Validate required fields
    if (!userId || !tier || !interval || !successUrl || !cancelUrl) {
      res.status(400).json({ 
        error: 'Missing required fields',
        required: ['userId', 'tier', 'interval', 'successUrl', 'cancelUrl']
      });
      return;
    }

    // Validate tier and interval
    if (!['basic', 'pro'].includes(tier)) {
      res.status(400).json({ error: 'Invalid tier. Must be "basic" or "pro"' });
      return;
    }

    if (!['monthly', 'yearly'].includes(interval)) {
      res.status(400).json({ error: 'Invalid interval. Must be "monthly" or "yearly"' });
      return;
    }

    // Get the correct price ID
    const priceKey = `${tier}_${interval}` as keyof typeof PRICE_IDS;
    const priceId = PRICE_IDS[priceKey];

    if (!priceId) {
      res.status(500).json({ 
        error: 'Price ID not configured',
        message: `Missing STRIPE_PRICE_${tier.toUpperCase()}_${interval.toUpperCase()} environment variable`
      });
      return;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: userId, // Link session to user
      customer_email: email,
      metadata: {
        userId,
        tier,
        interval,
        source: 'pain-tracker-app',
      },
      subscription_data: {
        metadata: {
          userId,
          tier,
          interval,
        },
        trial_period_days: tier === 'basic' ? 14 : 30, // Basic: 14 days, Pro: 30 days
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    // Return session details
    const response: CreateCheckoutSessionResponse = {
      sessionId: session.id,
      url: session.url || '',
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      res.status(400).json({ 
        error: 'Stripe error',
        message: error.message,
        type: error.type,
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
