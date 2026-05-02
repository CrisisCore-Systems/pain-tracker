import Stripe from 'stripe';
import { z } from 'zod';
import { db } from '../../api-lib/database.js';
import {
  isSubscriptionOwnershipConfigured,
  readSubscriptionOwner,
} from '../../api-lib/subscriptionOwnership';
import { isAllowedReturnUrl } from '../../api-lib/http';
import type { VercelRequest, VercelResponse } from '../../src/types/vercel';

const CreatePortalSessionSchema = z
  .object({
    userId: z.string().min(1).max(128),
    returnUrl: z.string().url().max(2048),
  })
  .strict();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isSubscriptionOwnershipConfigured()) {
    res.status(503).json({ error: 'Subscription ownership is not configured' });
    return;
  }

  const parsed = CreatePortalSessionSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  const { userId, returnUrl } = parsed.data;
  if (!isAllowedReturnUrl(req, returnUrl)) {
    res.status(400).json({ error: 'Invalid return URL' });
    return;
  }

  const ownerUserId = readSubscriptionOwner(req);
  if (!ownerUserId || ownerUserId !== userId) {
    res.status(401).json({ error: 'Unauthorized billing portal request' });
    return;
  }

  const secretKey = process.env.STRIPE_SECRET_KEY || '';
  if (!secretKey) {
    res.status(501).json({ error: 'Stripe not configured' });
    return;
  }

  try {
    const subscription = await db.getSubscriptionByUserId(userId);
    if (!subscription?.customerId) {
      res.status(404).json({ error: 'No active customer billing record found' });
      return;
    }

    const stripe = new Stripe(secretKey, { apiVersion: '2025-10-29.clover' });
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.customerId,
      return_url: returnUrl,
    });

    res.status(200).json({ url: session.url });
  } catch {
    res.status(500).json({ error: 'Failed to create billing portal session' });
  }
}