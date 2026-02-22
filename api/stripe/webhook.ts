/**
 * Stripe Webhook Handler
 * POST /api/stripe/webhook
 * 
 * Processes Stripe webhook events for subscription lifecycle management
 * Updated: 2025-11-11 - Fixed database import path for Vercel
 */

import type { VercelRequest, VercelResponse } from '../../src/types/vercel';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { db } from '../../api-lib/database.js';
import { enforceRateLimit, getClientIp, hashForLogs, logError, logWarn } from '../../api-lib/http';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

const secretKey = process.env.STRIPE_SECRET_KEY;
if (secretKey?.startsWith('sk_live_')) {
  console.warn('Stripe webhook handler initialized with live mode secret key in development.');
}

type SubscriptionWithLegacyFields = Stripe.Subscription & {
  current_period_start?: number | null;
  current_period_end?: number | null;
  trial_start?: number | null;
  trial_end?: number | null;
};

type InvoiceWithLegacyFields = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription | null;
  payment_intent?: string | Stripe.PaymentIntent | null;
  status_transitions?: { paid_at?: number | null } | null;
};

// Webhook secret for signature validation
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

// Disable body parsing to get raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Utility: log DB operation timings for observability
 */
async function logDbTiming<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const t0 = Date.now();
  try {
    const res = await fn();
    console.log(`[WEBHOOK][DB] ${label} ms=`, Date.now() - t0);
    return res;
  } catch (err) {
    logError(`[WEBHOOK][DB] ${label} failed ms=${Date.now() - t0}`, err);
    throw err;
  }
}

/**
 * Verify Stripe webhook signature
 */
function verifyWebhookSignature(
  payload: Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.client_reference_id || session.metadata?.userId;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  if (!userId) {
    console.error('No userId found in checkout session');
    return;
  }

  console.log('Checkout completed:', {
    userIdHash: userId ? hashForLogs(String(userId)) : null,
    customerIdHash: customerId ? hashForLogs(String(customerId)) : null,
    subscriptionIdHash: subscriptionId ? hashForLogs(String(subscriptionId)) : null,
    tier: session.metadata?.tier,
    interval: session.metadata?.interval,
  });

  // Store subscription in database
  await logDbTiming('upsertSubscription.checkout_completed', () =>
    db.upsertSubscription({
      userId,
      customerId,
      subscriptionId,
      tier: (session.metadata?.tier as 'free' | 'basic' | 'pro' | 'enterprise') || 'basic',
      status: 'active',
      billingInterval: session.metadata?.interval as 'monthly' | 'yearly',
    })
  );
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  const subscriptionWithLegacyFields = subscription as SubscriptionWithLegacyFields;
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  const currentPeriodEnd = subscriptionWithLegacyFields.current_period_end
    ? new Date(subscriptionWithLegacyFields.current_period_end * 1000)
    : undefined;

  console.log('Subscription created:', {
    userIdHash: userId ? hashForLogs(String(userId)) : null,
    subscriptionIdHash: subscription.id ? hashForLogs(String(subscription.id)) : null,
    status: subscription.status,
    currentPeriodEnd,
  });

  // Update database
  await logDbTiming('upsertSubscription.subscription_created', () =>
    db.upsertSubscription({
      userId,
      subscriptionId: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status as 'active' | 'trialing' | 'past_due' | 'canceled',
      tier: (subscription.metadata?.tier as 'free' | 'basic' | 'pro' | 'enterprise') || 'basic',
      billingInterval: subscription.metadata?.interval as 'monthly' | 'yearly',
      currentPeriodStart: subscriptionWithLegacyFields.current_period_start
        ? new Date(subscriptionWithLegacyFields.current_period_start * 1000)
        : undefined,
      currentPeriodEnd: subscriptionWithLegacyFields.current_period_end
        ? new Date(subscriptionWithLegacyFields.current_period_end * 1000)
        : undefined,
      trialStart: subscriptionWithLegacyFields.trial_start
        ? new Date(subscriptionWithLegacyFields.trial_start * 1000)
        : undefined,
      trialEnd: subscriptionWithLegacyFields.trial_end
        ? new Date(subscriptionWithLegacyFields.trial_end * 1000)
        : undefined,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    })
  );
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  console.log('Subscription updated:', {
    userIdHash: userId ? hashForLogs(String(userId)) : null,
    subscriptionIdHash: subscription.id ? hashForLogs(String(subscription.id)) : null,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  // Update database
  await logDbTiming('updateSubscriptionStatus.subscription_updated', () =>
    db.updateSubscriptionStatus(
      subscription.id,
      subscription.status as 'active' | 'trialing' | 'past_due' | 'canceled',
      subscription.cancel_at_period_end
    )
  );
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  console.log('Subscription deleted:', {
    userIdHash: userId ? hashForLogs(String(userId)) : null,
    subscriptionIdHash: subscription.id ? hashForLogs(String(subscription.id)) : null,
  });

  // Update database
  await logDbTiming('cancelSubscription.subscription_deleted', () =>
    db.cancelSubscription(subscription.id)
  );
}

/**
 * Handle invoice paid
 */
async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const invoiceWithLegacyFields = invoice as InvoiceWithLegacyFields;
  const subscriptionValue = invoiceWithLegacyFields.subscription;
  const subscriptionId = typeof subscriptionValue === 'string'
    ? subscriptionValue
    : subscriptionValue?.id;
  const customerId = invoice.customer as string;

  console.log('Invoice paid:', {
    invoiceIdHash: invoice.id ? hashForLogs(String(invoice.id)) : null,
    subscriptionIdHash: subscriptionId ? hashForLogs(String(subscriptionId)) : null,
    customerIdHash: customerId ? hashForLogs(String(customerId)) : null,
    amountPaid: invoice.amount_paid / 100,
    currency: invoice.currency,
  });

  // Log successful payment
  if (subscriptionId) {
    const paidAt = invoiceWithLegacyFields.status_transitions?.paid_at;

    await logDbTiming('createBillingEvent.invoice_paid', () =>
      db.createBillingEvent({
        subscriptionId,
        invoiceId: invoice.id,
        paymentIntentId: invoiceWithLegacyFields.payment_intent as string,
        eventType: 'invoice_paid',
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        status: 'succeeded',
        occurredAt: paidAt ? new Date(paidAt * 1000) : new Date(),
      })
    );
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const invoiceWithLegacyFields = invoice as InvoiceWithLegacyFields;
  const subscriptionValue = invoiceWithLegacyFields.subscription;
  const subscriptionId = typeof subscriptionValue === 'string'
    ? subscriptionValue
    : subscriptionValue?.id;
  const customerId = invoice.customer as string;

  console.log('Invoice payment failed:', {
    invoiceIdHash: invoice.id ? hashForLogs(String(invoice.id)) : null,
    subscriptionIdHash: subscriptionId ? hashForLogs(String(subscriptionId)) : null,
    customerIdHash: customerId ? hashForLogs(String(customerId)) : null,
    amountDue: invoice.amount_due / 100,
  });

  // Update subscription status
  if (subscriptionId) {
    await logDbTiming('updateSubscriptionStatus.invoice_payment_failed', () =>
      db.updateSubscriptionStatus(subscriptionId, 'past_due')
    );
    
    // Log failed payment
    await logDbTiming('createBillingEvent.payment_failed', () =>
      db.createBillingEvent({
        subscriptionId,
        invoiceId: invoice.id,
        paymentIntentId: invoiceWithLegacyFields.payment_intent as string,
        eventType: 'payment_failed',
        amount: invoice.amount_due / 100,
        currency: invoice.currency,
        status: 'failed',
        occurredAt: new Date(),
      })
    );
  }
  
  // Planned follow-up: send payment failed email
  // await sendPaymentFailedEmail(customerId, invoice);
}

/**
 * Handle trial ending soon
 */
async function handleTrialWillEnd(subscription: Stripe.Subscription): Promise<void> {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  const trialEndDate = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;

  console.log('Trial will end:', {
    userIdHash: userId ? hashForLogs(String(userId)) : null,
    subscriptionIdHash: subscription.id ? hashForLogs(String(subscription.id)) : null,
    trialEndDate,
  });

  // Planned follow-up: send trial ending notification
  // await sendTrialEndingEmail(userId, trialEndDate);
}

type SignatureReadResult =
  | { ok: true; value: string }
  | { ok: false; reason: 'missing' | 'invalid' };

function readStripeSignatureHeader(req: VercelRequest): SignatureReadResult {
  const signature = req.headers['stripe-signature'];
  if (!signature) return { ok: false, reason: 'missing' };

  const value = Array.isArray(signature) ? signature[0] : signature;
  const signatureValue = String(value || '').trim();
  if (!signatureValue) return { ok: false, reason: 'invalid' };

  return { ok: true, value: signatureValue };
}

async function rateLimitInvalidWebhookAttempt(req: VercelRequest, res: VercelResponse, ip: string): Promise<boolean> {
  return await enforceRateLimit({
    req,
    res,
    key: `ip:${ip}:stripe:webhook:invalid`,
    limit: Number(process.env.STRIPE_WEBHOOK_INVALID_RATE_LIMIT || 20),
    windowMs: Number(process.env.STRIPE_WEBHOOK_INVALID_WINDOW_MS || 10 * 60 * 1000),
  });
}

const EVENT_HANDLERS: Record<string, (obj: unknown) => Promise<void>> = {
  'checkout.session.completed': async (obj) => {
    await handleCheckoutCompleted(obj as Stripe.Checkout.Session);
  },
  'customer.subscription.created': async (obj) => {
    await handleSubscriptionCreated(obj as Stripe.Subscription);
  },
  'customer.subscription.updated': async (obj) => {
    await handleSubscriptionUpdated(obj as Stripe.Subscription);
  },
  'customer.subscription.deleted': async (obj) => {
    await handleSubscriptionDeleted(obj as Stripe.Subscription);
  },
  'invoice.paid': async (obj) => {
    await handleInvoicePaid(obj as Stripe.Invoice);
  },
  'invoice.payment_failed': async (obj) => {
    await handleInvoicePaymentFailed(obj as Stripe.Invoice);
  },
  'customer.subscription.trial_will_end': async (obj) => {
    await handleTrialWillEnd(obj as Stripe.Subscription);
  },
};

async function parseAndVerifyEvent(req: VercelRequest, res: VercelResponse): Promise<Stripe.Event | null> {
  const rawBody = await buffer(req);
  const ip = getClientIp(req);

  const sig = readStripeSignatureHeader(req);
  if (!sig.ok) {
    const ok = await rateLimitInvalidWebhookAttempt(req, res, ip);
    if (!ok) return null;
    res.status(400).json({
      error: sig.reason === 'missing' ? 'Missing stripe-signature header' : 'Invalid stripe-signature header',
    });
    return null;
  }

  if (!WEBHOOK_SECRET) {
    logError('[WEBHOOK] STRIPE_WEBHOOK_SECRET not configured');
    res.status(500).json({ error: 'Webhook secret not configured' });
    return null;
  }

  return verifyWebhookSignature(rawBody, sig.value, WEBHOOK_SECRET);
}

async function dispatchStripeEvent(event: Stripe.Event): Promise<void> {
  console.log('Webhook received:', event.type);

  const handlerFn = EVENT_HANDLERS[event.type];
  if (handlerFn) {
    await handlerFn(event.data.object);
    return;
  }

  console.log(`Unhandled event type: ${event.type}`);
}

async function handleWebhookError(req: VercelRequest, res: VercelResponse, error: unknown): Promise<void> {
  logError('Webhook error:', error);

  const isSignatureError = error instanceof Error && error.message.includes('signature verification');
  if (!isSignatureError) {
    res.status(500).json({ error: 'Webhook processing failed' });
    return;
  }

  try {
    const ip = getClientIp(req);
    const ok = await rateLimitInvalidWebhookAttempt(req, res, ip);
    if (!ok) return;
  } catch (e) {
    logWarn('[WEBHOOK] invalid signature rate limit error', e);
  }

  res.status(401).json({ error: 'Invalid signature' });
}

/**
 * Main webhook handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const event = await parseAndVerifyEvent(req, res);
    if (!event) return;

    await dispatchStripeEvent(event);
    res.status(200).json({ received: true, type: event.type });
  } catch (error) {
    await handleWebhookError(req, res, error);
  }
}
