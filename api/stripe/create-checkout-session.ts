/**
 * Stripe Checkout Session Creation API
 * POST /api/stripe/create-checkout-session
 * 
 * Creates a Stripe checkout session for subscription purchases
 */

import type { VercelRequest, VercelResponse } from '../../src/types/vercel';
import Stripe from 'stripe';
import { z } from 'zod';
import { enforceRateLimit, getClientIp, isAllowedReturnUrl, logError } from '../../api-lib/http';

// Price IDs from Stripe dashboard (set these in environment variables)
const PRICE_IDS = {
  basic_monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY || '',
  basic_yearly: process.env.STRIPE_PRICE_BASIC_YEARLY || '',
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
};

interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

const CreateCheckoutSessionSchema = z
  .object({
    userId: z.string().min(1).max(128),
    tier: z.enum(['basic', 'pro']),
    interval: z.enum(['monthly', 'yearly']),
    successUrl: z.string().url().max(2048),
    cancelUrl: z.string().url().max(2048),
    email: z.string().email().max(320).optional(),
  })
  .strict();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Re-initialize Stripe per-request so the latest env var is used.
  const rawKey = process.env.STRIPE_SECRET_KEY || '';
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const ip = getClientIp(req);
  const windowMs = Number(process.env.REQ_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000);
  const limit = Number(process.env.STRIPE_CHECKOUT_RATE_LIMIT || 10);
  const ok = await enforceRateLimit({
    req,
    res,
    key: `ip:${ip}:stripe:create-checkout-session`,
    limit,
    windowMs,
  });
  if (!ok) return;

  if (!rawKey) {
    res.status(501).json({ error: 'Stripe not configured' });
    return;
  }

  // Re-initialize Stripe with the current env var
  const stripe = new Stripe(rawKey, { apiVersion: '2025-10-29.clover' });

  try {
    const parsed = CreateCheckoutSessionSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body' });
      return;
    }

    const { userId, tier, interval, successUrl, cancelUrl, email } = parsed.data;

    if (!isAllowedReturnUrl(req, successUrl) || !isAllowedReturnUrl(req, cancelUrl)) {
      res.status(400).json({ error: 'Invalid return URL' });
      return;
    }

    // Get the correct price ID
    const priceKey = `${tier}_${interval}` as keyof typeof PRICE_IDS;
    const priceId = PRICE_IDS[priceKey];

    if (!priceId) {
      res.status(500).json({ error: 'Checkout not configured' });
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
    logError('Stripe checkout session creation error:', error);
    
    if (error instanceof Stripe.errors.StripeError) {
      res.status(400).json({ 
        error: 'Stripe error',
        message: error.message,
        type: error.type,
      });
    } else {
      res.status(500).json({ 
        error: 'Internal server error'
      });
    }
  }
}
