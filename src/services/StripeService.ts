/**
 * Stripe Payment Integration Service
 * Handles Stripe checkout, webhooks, and subscription management
 */

import type { SubscriptionTier, BillingInterval } from '../types/subscription';
import { SUBSCRIPTION_PLANS } from '../config/subscription-tiers';
import { subscriptionService } from './SubscriptionService';
import { securityService } from './SecurityService';

/**
 * Stripe Configuration
 */
interface StripeConfig {
  publishableKey: string;
  secretKey?: string; // Server-side only
  webhookSecret?: string; // For webhook validation
  apiVersion: string;
}

/**
 * Stripe Checkout Session
 */
interface StripeCheckoutSession {
  id: string;
  url: string;
  customerId?: string;
  subscriptionId?: string;
  clientSecret?: string;
}

/**
 * Stripe Webhook Event
 */
interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      customer?: string;
      subscription?: string;
      metadata?: Record<string, string>;
      [key: string]: unknown;
    };
  };
  created: number;
}

/**
 * Stripe Service
 * Note: This is a client-side stub. In production, most Stripe operations
 * should happen server-side for security. This provides the interface.
 */
export class StripeService {
  private config: StripeConfig;
  private stripe: unknown; // Will be initialized with Stripe.js
  private isInitialized = false;

  constructor(config?: Partial<StripeConfig>) {
    this.config = {
      publishableKey:
        (import.meta as { env?: Record<string, string> }).env?.VITE_STRIPE_PUBLISHABLE_KEY || '',
      apiVersion: '2023-10-16',
      ...config,
    };
  }

  /**
   * Initialize Stripe.js
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load Stripe.js from CDN
      await this.loadStripeScript();

      // Initialize Stripe instance
      // @ts-expect-error - Stripe is loaded from CDN
      if (typeof window !== 'undefined' && window.Stripe) {
        // @ts-expect-error - Stripe is loaded from CDN
        this.stripe = window.Stripe(this.config.publishableKey);
        this.isInitialized = true;

        await securityService.logSecurityEvent({
          type: 'audit',
          level: 'info',
          message: 'Stripe initialized successfully',
          timestamp: new Date(),
        });
      } else {
        throw new Error('Stripe.js not loaded');
      }
    } catch (err) {
      await securityService.logSecurityEvent({
        type: 'error',
        level: 'error',
        message: `Stripe initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
      });
      throw err;
    }
  }

  /**
   * Load Stripe.js script
   */
  private async loadStripeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window not available'));
        return;
      }

      // Check if already loaded
      // @ts-expect-error - Stripe is loaded from CDN
      if (window.Stripe) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Stripe.js'));
      document.head.appendChild(script);
    });
  }

  /**
   * Create checkout session (server-side operation)
   * In production, this should call your backend API
   */
  async createCheckoutSession(
    userId: string,
    tier: SubscriptionTier,
    interval: BillingInterval
  ): Promise<StripeCheckoutSession> {
    await this.initialize();

    const plan = SUBSCRIPTION_PLANS[tier];
    const price = interval === 'monthly' ? plan.pricing.monthly : plan.pricing.yearly;

    try {
      // In production, call your backend:
      // const response = await fetch('/api/create-checkout-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId, tier, interval })
      // });
      // const session = await response.json();

      // For now, return mock session
      const mockSession: StripeCheckoutSession = {
        id: `cs_test_${Date.now()}`,
        url: `https://checkout.stripe.com/pay/${Date.now()}`,
        customerId: `cus_${userId}`,
        subscriptionId: `sub_${Date.now()}`,
      };

      await securityService.logSecurityEvent({
        type: 'audit',
        level: 'info',
        message: `Checkout session created: ${tier} tier, ${interval} billing`,
        userId,
        metadata: { tier, interval, amount: price.amount },
        timestamp: new Date(),
      });

      return mockSession;
    } catch (err) {
      await securityService.logSecurityEvent({
        type: 'error',
        level: 'error',
        message: `Checkout session creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        userId,
        timestamp: new Date(),
      });
      throw err;
    }
  }

  /**
   * Redirect to Stripe checkout
   */
  async redirectToCheckout(sessionId: string): Promise<void> {
    await this.initialize();

    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    try {
      // @ts-expect-error - Stripe types
      const { error } = await this.stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      await securityService.logSecurityEvent({
        type: 'error',
        level: 'error',
        message: `Checkout redirect failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        timestamp: new Date(),
      });
      throw err;
    }
  }

  /**
   * Create customer portal session (for subscription management)
   */
  async createPortalSession(
    userId: string,
    customerId: string,
    _returnUrl: string = window.location.origin
  ): Promise<{ url: string }> {
    try {
      // In production, call your backend:
      // const response = await fetch('/api/create-portal-session', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ customerId, returnUrl })
      // });
      // const session = await response.json();

      // Mock portal session
      const mockSession = {
        url: `https://billing.stripe.com/p/session/${Date.now()}`,
      };

      await securityService.logSecurityEvent({
        type: 'audit',
        level: 'info',
        message: 'Customer portal session created',
        userId,
        timestamp: new Date(),
      });

      return mockSession;
    } catch (err) {
      await securityService.logSecurityEvent({
        type: 'error',
        level: 'error',
        message: `Portal session creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        userId,
        timestamp: new Date(),
      });
      throw err;
    }
  }

  /**
   * Handle webhook events (server-side operation)
   * This should be implemented on your backend
   */
  async handleWebhook(event: StripeWebhookEvent): Promise<void> {
    try {
      const userId = event.data.object.metadata?.userId;
      if (!userId) {
        throw new Error('User ID not found in webhook metadata');
      }

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event, userId);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event, userId);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event, userId);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event, userId);
          break;

        case 'invoice.paid':
          await this.handleInvoicePaid(event, userId);
          break;

        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event, userId);
          break;

        case 'customer.subscription.trial_will_end':
          await this.handleTrialEnding(event, userId);
          break;

        default:
          console.log(`Unhandled webhook event: ${event.type}`);
      }

      await securityService.logSecurityEvent({
        type: 'audit',
        level: 'info',
        message: `Webhook processed: ${event.type}`,
        userId,
        metadata: { eventId: event.id, type: event.type },
        timestamp: new Date(),
      });
    } catch (err) {
      await securityService.logSecurityEvent({
        type: 'error',
        level: 'error',
        message: `Webhook processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
        metadata: { eventId: event.id, type: event.type },
        timestamp: new Date(),
      });
      throw err;
    }
  }

  /**
   * Handle checkout completed
   */
  private async handleCheckoutCompleted(event: StripeWebhookEvent, userId: string): Promise<void> {
    const session = event.data.object;
    const tier = (session.metadata?.tier as SubscriptionTier) || 'basic';
    const interval = (session.metadata?.interval as BillingInterval) || 'monthly';

    // Create or update subscription in our system
    const subscription = await subscriptionService.getSubscription(userId);

    if (!subscription) {
      await subscriptionService.createSubscription(userId, tier, interval);
    } else {
      await subscriptionService.upgradeTier(userId, tier, true);
    }

    console.log(`Checkout completed for user ${userId}: ${tier} tier`);
  }

  /**
   * Handle subscription created
   */
  private async handleSubscriptionCreated(
    event: StripeWebhookEvent,
    userId: string
  ): Promise<void> {
    const subscription = event.data.object;
    const tier = (subscription.metadata?.tier as SubscriptionTier) || 'basic';

    console.log(`Subscription created for user ${userId}: ${tier} tier`);
  }

  /**
   * Handle subscription updated
   */
  private async handleSubscriptionUpdated(
    event: StripeWebhookEvent,
    userId: string
  ): Promise<void> {
    const subscription = event.data.object;
    const tier = subscription.metadata?.tier as SubscriptionTier;

    if (tier) {
      await subscriptionService.upgradeTier(userId, tier, true);
    }

    console.log(`Subscription updated for user ${userId}`);
  }

  /**
   * Handle subscription deleted (canceled)
   */
  private async handleSubscriptionDeleted(
    event: StripeWebhookEvent,
    userId: string
  ): Promise<void> {
    await subscriptionService.cancelSubscription(userId, true);
    console.log(`Subscription canceled for user ${userId}`);
  }

  /**
   * Handle invoice paid
   */
  private async handleInvoicePaid(event: StripeWebhookEvent, userId: string): Promise<void> {
    const invoice = event.data.object;
    console.log(`Invoice paid for user ${userId}: ${invoice.id}`);
  }

  /**
   * Handle payment failed
   */
  private async handlePaymentFailed(event: StripeWebhookEvent, userId: string): Promise<void> {
    const invoice = event.data.object;

    // Update subscription status to past_due
    const subscription = await subscriptionService.getSubscription(userId);
    if (subscription) {
      subscription.status = 'past_due';
    }

    console.log(`Payment failed for user ${userId}: ${invoice.id}`);
  }

  /**
   * Handle trial ending soon
   */
  private async handleTrialEnding(event: StripeWebhookEvent, userId: string): Promise<void> {
    // Send notification to user
    console.log(`Trial ending soon for user ${userId}`);
  }

  /**
   * Get Stripe pricing for display
   */
  getStripePricing(tier: SubscriptionTier, interval: BillingInterval) {
    const plan = SUBSCRIPTION_PLANS[tier];
    const price = interval === 'monthly' ? plan.pricing.monthly : plan.pricing.yearly;

    return {
      amount: price.amount,
      currency: price.currency,
      display: price.display,
      interval: interval === 'monthly' ? 'month' : 'year',
    };
  }

  /**
   * Validate webhook signature (server-side)
   */
  validateWebhookSignature(_payload: string, _signature: string, _secret: string): boolean {
    // In production, use Stripe's webhook signature validation
    // const event = stripe.webhooks.constructEvent(payload, signature, secret);
    // For now, just return true
    return true;
  }
}

/**
 * Stripe Elements Configuration
 * For custom payment forms
 */
export interface StripeElementsOptions {
  clientSecret: string;
  appearance?: {
    theme?: 'stripe' | 'night' | 'flat';
    variables?: Record<string, string>;
  };
}

/**
 * Create Stripe Elements instance
 */
export async function createStripeElements(options: StripeElementsOptions): Promise<unknown> {
  const stripeService = new StripeService();
  await stripeService.initialize();

  // @ts-expect-error - Stripe types
  return stripeService.stripe?.elements(options);
}

// Export singleton instance
export const stripeService = new StripeService();
