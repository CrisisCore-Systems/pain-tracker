/**
 * Stripe Webhook Handler
 * POST /api/stripe/webhook
 * 
 * Processes Stripe webhook events for subscription lifecycle management
 * Updated: 2025-11-11 - Fixed database import path for Vercel
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { db } from '../lib/database';

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
<<<<<<< HEAD
 * Utility: log DB operation timings for observability
 */
async function logDbTiming<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const t0 = Date.now();
  try {
    const res = await fn();
    console.log(`[WEBHOOK][DB] ${label} ms=`, Date.now() - t0);
    return res;
  } catch (err) {
    console.error(`[WEBHOOK][DB] ${label} failed ms=`, Date.now() - t0, err);
    throw err;
  }
}

/**
=======
>>>>>>> 52f81eb (chore: Trigger redeploy for health endpoint)
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
    userId,
    customerId,
    subscriptionId,
    tier: session.metadata?.tier,
    interval: session.metadata?.interval,
  });

  // Store subscription in database
<<<<<<< HEAD
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
=======
  await db.upsertSubscription({
    userId,
    customerId,
    subscriptionId,
    tier: session.metadata?.tier as 'free' | 'basic' | 'pro' | 'enterprise' || 'basic',
    status: 'active',
    billingInterval: session.metadata?.interval as 'monthly' | 'yearly',
  });
>>>>>>> 52f81eb (chore: Trigger redeploy for health endpoint)
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
    userId,
    subscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodEnd,
  });

  // Update database
<<<<<<< HEAD
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
=======
  await db.upsertSubscription({
    userId,
    subscriptionId: subscription.id,
    customerId: subscription.customer as string,
    status: subscription.status as 'active' | 'trialing' | 'past_due' | 'canceled',
    tier: subscription.metadata?.tier as 'free' | 'basic' | 'pro' | 'enterprise' || 'basic',
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
  });
>>>>>>> 52f81eb (chore: Trigger redeploy for health endpoint)
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
    userId,
    subscriptionId: subscription.id,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  // Update database
<<<<<<< HEAD
  await logDbTiming('updateSubscriptionStatus.subscription_updated', () =>
    db.updateSubscriptionStatus(
      subscription.id,
      subscription.status as 'active' | 'trialing' | 'past_due' | 'canceled',
      subscription.cancel_at_period_end
    )
=======
  await db.updateSubscriptionStatus(
    subscription.id,
    subscription.status as 'active' | 'trialing' | 'past_due' | 'canceled',
    subscription.cancel_at_period_end
>>>>>>> 52f81eb (chore: Trigger redeploy for health endpoint)
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
    userId,
    subscriptionId: subscription.id,
  });

  // Update database
<<<<<<< HEAD
  await logDbTiming('cancelSubscription.subscription_deleted', () =>
    db.cancelSubscription(subscription.id)
  );
=======
  await db.cancelSubscription(subscription.id);
>>>>>>> 52f81eb (chore: Trigger redeploy for health endpoint)
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
    invoiceId: invoice.id,
    subscriptionId,
    customerId,
    amountPaid: invoice.amount_paid / 100,
    currency: invoice.currency,
  });

  // Log successful payment
  if (subscriptionId) {
    const paidAt = invoiceWithLegacyFields.status_transitions?.paid_at;

<<<<<<< HEAD
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
=======
    await db.createBillingEvent({
      subscriptionId,
      invoiceId: invoice.id,
      paymentIntentId: invoiceWithLegacyFields.payment_intent as string,
      eventType: 'invoice_paid',
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: 'succeeded',
      occurredAt: paidAt ? new Date(paidAt * 1000) : new Date(),
    });
>>>>>>> 52f81eb (chore: Trigger redeploy for health endpoint)
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
    invoiceId: invoice.id,
    subscriptionId,
    customerId,
    amountDue: invoice.amount_due / 100,
  });

  // Update subscription status
  if (subscriptionId) {
<<<<<<< HEAD
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
=======
    await db.updateSubscriptionStatus(subscriptionId, 'past_due');
    
    // Log failed payment
    await db.createBillingEvent({
      subscriptionId,
      invoiceId: invoice.id,
      paymentIntentId: invoiceWithLegacyFields.payment_intent as string,
      eventType: 'payment_failed',
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      status: 'failed',
      occurredAt: new Date(),
    });
>>>>>>> 52f81eb (chore: Trigger redeploy for health endpoint)
  }
  
  // TODO: Send payment failed email
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
    userId,
    subscriptionId: subscription.id,
    trialEndDate,
  });

  // TODO: Send trial ending notification
  // await sendTrialEndingEmail(userId, trialEndDate);
}

/**
 * Main webhook handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
<<<<<<< HEAD
  // Quick visibility into whether a DB is configured in this environment
  console.log('[WEBHOOK] HAS_DATABASE=', process.env.DATABASE_URL ? 'yes' : 'no');

=======
>>>>>>> 52f81eb (chore: Trigger redeploy for health endpoint)
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Get raw body and signature
    const rawBody = await buffer(req);
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    const signatureValue = Array.isArray(signature) ? signature[0] : signature;

    if (!signatureValue) {
      res.status(400).json({ error: 'Invalid stripe-signature header' });
      return;
    }

    if (!WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      res.status(500).json({ error: 'Webhook secret not configured' });
      return;
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(rawBody, signatureValue, WEBHOOK_SECRET);

    console.log('Webhook received:', event.type);

    // Handle event based on type
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return success response
    res.status(200).json({ received: true, type: event.type });

  } catch (error) {
    console.error('Webhook error:', error);

    if (error instanceof Error && error.message.includes('signature verification')) {
      res.status(401).json({ error: 'Invalid signature' });
    } else {
      res.status(500).json({ 
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
