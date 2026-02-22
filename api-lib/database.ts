/**
 * Database Client for Subscription Management
 * 
 * Simple database client using PostgreSQL with pg library.
 * For production, consider using Prisma, TypeORM, or Drizzle ORM.
 */

import { Pool, PoolClient } from 'pg';

// Detect whether a real database is configured (required for production persistence)
const HAS_DATABASE = Boolean(process.env.DATABASE_URL);

// Database connection pool (only created when a connection string exists)
const pool = HAS_DATABASE
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  : (null as unknown as Pool);

// Handle pool errors
if (HAS_DATABASE && pool) {
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
}

/**
 * Subscription database interface
 */
export interface SubscriptionRecord {
  id: number;
  userId: string;
  customerId: string;
  subscriptionId?: string;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid';
  billingInterval?: 'monthly' | 'yearly';
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  endedAt?: Date;
  cancelAtPeriodEnd: boolean;
  cancelReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Usage tracking interface
 */
export interface UsageRecord {
  id: number;
  userId: string;
  usageType: 'pain_entry' | 'mood_entry' | 'activity_log' | 'export' | 'storage';
  amount: number;
  periodStart: Date;
  periodEnd: Date;
  metadata?: Record<string, unknown>;
  trackedAt: Date;
}

/**
 * Billing event interface
 */
export interface BillingEventRecord {
  id: number;
  subscriptionId: string;
  invoiceId?: string;
  paymentIntentId?: string;
  eventType: string;
  amount?: number;
  currency?: string;
  status?: string;
  stripeEventId?: string;
  metadata?: Record<string, unknown>;
  occurredAt: Date;
  createdAt: Date;
}

/**
 * Database client class
 */
// Input payloads for specific operations
export interface UpsertSubscriptionInput {
  userId: string;
  customerId: string;
  subscriptionId?: string;
  tier: SubscriptionRecord['tier'];
  status: SubscriptionRecord['status'];
  billingInterval?: SubscriptionRecord['billingInterval'];
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, unknown>;
}

export interface CreateBillingEventInput {
  subscriptionId: string;
  invoiceId?: string;
  paymentIntentId?: string;
  eventType: string;
  amount?: number;
  currency?: string;
  status?: string;
  stripeEventId?: string;
  metadata?: Record<string, unknown>;
  occurredAt: Date;
}

// Unified interface consumed by application code (real or no-op implementation)
export interface DatabaseClientInterface {
  getClient(): Promise<PoolClient>;
  query<T = unknown>(text: string, params?: unknown[]): Promise<T[]>;
  getSubscriptionByUserId(userId: string): Promise<SubscriptionRecord | null>;
  getSubscriptionByStripeId(subscriptionId: string): Promise<SubscriptionRecord | null>;
  upsertSubscription(data: UpsertSubscriptionInput): Promise<SubscriptionRecord>;
  updateSubscriptionStatus(subscriptionId: string, status: SubscriptionRecord['status'], cancelAtPeriodEnd?: boolean): Promise<SubscriptionRecord | null>;
  cancelSubscription(subscriptionId: string, reason?: string): Promise<SubscriptionRecord | null>;
  trackUsage(userId: string, usageType: UsageRecord['usageType'], amount?: number, metadata?: Record<string, unknown>): Promise<void>;
  getCurrentUsage(userId: string, usageType?: UsageRecord['usageType']): Promise<UsageRecord[]>;
  getUsageTotal(userId: string, usageType: UsageRecord['usageType']): Promise<number>;
  createBillingEvent(data: CreateBillingEventInput): Promise<BillingEventRecord>;
  getBillingEvents(subscriptionId: string, limit?: number): Promise<BillingEventRecord[]>;
  getSubscriptionAnalytics(): Promise<{ totalSubscriptions: number; byTier: Record<string, number>; byStatus: Record<string, number>; monthlyRecurringRevenue: number }>;
  close(): Promise<void>;
}

export class DatabaseClient implements DatabaseClientInterface {
  private pool: Pool;

  constructor() {
    if (!HAS_DATABASE) {
      throw new Error('Database is not configured. Set DATABASE_URL to enable persistence.');
    }
    this.pool = pool;
  }

  /**
   * Get a client from the pool
   */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Execute a query
   */
  async query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
    const result = await this.pool.query(text, params);
    return result.rows as T[];
  }

  // ============================================================================
  // SUBSCRIPTION OPERATIONS
  // ============================================================================

  /**
   * Get subscription by user ID
   */
  async getSubscriptionByUserId(userId: string): Promise<SubscriptionRecord | null> {
    const result = await this.query<SubscriptionRecord>(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [userId]
    );
    return result[0] || null;
  }

  /**
   * Get subscription by Stripe subscription ID
   */
  async getSubscriptionByStripeId(subscriptionId: string): Promise<SubscriptionRecord | null> {
    const result = await this.query<SubscriptionRecord>(
      'SELECT * FROM subscriptions WHERE subscription_id = $1',
      [subscriptionId]
    );
    return result[0] || null;
  }

  /**
   * Create or update subscription
   */
  async upsertSubscription(data: UpsertSubscriptionInput): Promise<SubscriptionRecord> {
    const result = await this.query<SubscriptionRecord>(
      `INSERT INTO subscriptions (
        user_id, customer_id, subscription_id, tier, status, billing_interval,
        current_period_start, current_period_end, trial_start, trial_end,
        cancel_at_period_end, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (user_id) DO UPDATE SET
        customer_id = EXCLUDED.customer_id,
        subscription_id = EXCLUDED.subscription_id,
        tier = EXCLUDED.tier,
        status = EXCLUDED.status,
        billing_interval = EXCLUDED.billing_interval,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        trial_start = EXCLUDED.trial_start,
        trial_end = EXCLUDED.trial_end,
        cancel_at_period_end = EXCLUDED.cancel_at_period_end,
        metadata = EXCLUDED.metadata,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        data.userId,
        data.customerId,
        data.subscriptionId,
        data.tier,
        data.status,
        data.billingInterval,
        data.currentPeriodStart,
        data.currentPeriodEnd,
        data.trialStart,
        data.trialEnd,
        data.cancelAtPeriodEnd || false,
        data.metadata ? JSON.stringify(data.metadata) : null,
      ]
    );
    return result[0];
  }

  /**
   * Update subscription status
   */
  async updateSubscriptionStatus(
    subscriptionId: string,
    status: SubscriptionRecord['status'],
    cancelAtPeriodEnd?: boolean
  ): Promise<SubscriptionRecord | null> {
    const result = await this.query<SubscriptionRecord>(
      `UPDATE subscriptions 
       SET status = $1, cancel_at_period_end = $2, updated_at = CURRENT_TIMESTAMP
       WHERE subscription_id = $3
       RETURNING *`,
      [status, cancelAtPeriodEnd || false, subscriptionId]
    );
    return result[0] || null;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    reason?: string
  ): Promise<SubscriptionRecord | null> {
    const result = await this.query<SubscriptionRecord>(
      `UPDATE subscriptions 
       SET status = 'canceled', canceled_at = CURRENT_TIMESTAMP, cancel_reason = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE subscription_id = $2
       RETURNING *`,
      [reason, subscriptionId]
    );
    return result[0] || null;
  }

  // ============================================================================
  // USAGE TRACKING OPERATIONS
  // ============================================================================

  /**
   * Track usage for a user
   */
  async trackUsage(
    userId: string,
    usageType: UsageRecord['usageType'],
    amount: number = 1,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    await this.query(
      `INSERT INTO usage_tracking (user_id, usage_type, amount, period_start, period_end, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, usage_type, period_start, period_end)
       DO UPDATE SET 
         amount = usage_tracking.amount + $3,
         tracked_at = CURRENT_TIMESTAMP`,
      [userId, usageType, amount, periodStart, periodEnd, metadata ? JSON.stringify(metadata) : null]
    );
  }

  /**
   * Get current usage for a user
   */
  async getCurrentUsage(
    userId: string,
    usageType?: UsageRecord['usageType']
  ): Promise<UsageRecord[]> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const query = usageType
      ? `SELECT * FROM usage_tracking 
         WHERE user_id = $1 AND usage_type = $2 AND period_start = $3`
      : `SELECT * FROM usage_tracking 
         WHERE user_id = $1 AND period_start = $2`;

    const params = usageType ? [userId, usageType, periodStart] : [userId, periodStart];

    return await this.query<UsageRecord>(query, params);
  }

  /**
   * Get usage total for current period
   */
  async getUsageTotal(
    userId: string,
    usageType: UsageRecord['usageType']
  ): Promise<number> {
    const usage = await this.getCurrentUsage(userId, usageType);
    return usage.reduce((sum, record) => sum + record.amount, 0);
  }

  // ============================================================================
  // BILLING EVENTS OPERATIONS
  // ============================================================================

  /**
   * Create billing event
   */
  async createBillingEvent(data: CreateBillingEventInput): Promise<BillingEventRecord> {
    const result = await this.query<BillingEventRecord>(
      `INSERT INTO billing_events (
        subscription_id, invoice_id, payment_intent_id, event_type,
        amount, currency, status, stripe_event_id, metadata, occurred_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        data.subscriptionId,
        data.invoiceId,
        data.paymentIntentId,
        data.eventType,
        data.amount,
        data.currency,
        data.status,
        data.stripeEventId,
        data.metadata ? JSON.stringify(data.metadata) : null,
        data.occurredAt,
      ]
    );
    return result[0];
  }

  /**
   * Get billing events for subscription
   */
  async getBillingEvents(subscriptionId: string, limit: number = 50): Promise<BillingEventRecord[]> {
    return await this.query<BillingEventRecord>(
      `SELECT * FROM billing_events 
       WHERE subscription_id = $1 
       ORDER BY occurred_at DESC 
       LIMIT $2`,
      [subscriptionId, limit]
    );
  }

  // ============================================================================
  // ANALYTICS OPERATIONS
  // ============================================================================

  /**
   * Get subscription analytics
   */
  async getSubscriptionAnalytics(): Promise<{
    totalSubscriptions: number;
    byTier: Record<string, number>;
    byStatus: Record<string, number>;
    monthlyRecurringRevenue: number;
  }> {
    const [totals, byTier, byStatus, mrr] = await Promise.all([
      this.query<{ count: number }>('SELECT COUNT(*) as count FROM subscriptions'),
      this.query<{ tier: string; count: number }>('SELECT tier, COUNT(*) as count FROM subscriptions GROUP BY tier'),
      this.query<{ status: string; count: number }>('SELECT status, COUNT(*) as count FROM subscriptions GROUP BY status'),
      this.query<{ mrr: number }>(
        `SELECT SUM(
          CASE tier
            WHEN 'basic' THEN CASE billing_interval WHEN 'yearly' THEN 9.99 WHEN 'monthly' THEN 9.99 ELSE 0 END
            WHEN 'pro' THEN CASE billing_interval WHEN 'yearly' THEN 24.99 WHEN 'monthly' THEN 24.99 ELSE 0 END
            ELSE 0
          END
        ) as mrr
        FROM subscriptions
        WHERE status IN ('active', 'trialing')`
      ),
    ]);

    return {
      totalSubscriptions: Number(totals[0]?.count || 0),
      byTier: Object.fromEntries(byTier.map(r => [r.tier, Number(r.count)])),
      byStatus: Object.fromEntries(byStatus.map(r => [r.status, Number(r.count)])),
      monthlyRecurringRevenue: Number(mrr[0]?.mrr || 0),
    };
  }

  /**
   * Close database connection pool
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// A no-op database client used when DATABASE_URL is not set. This lets webhooks
// succeed (200) in environments where a database is not reachable, while logging
// the intended operations. This is useful for initial integration testing on
// serverless deployments before wiring a cloud Postgres instance.
class NoopDatabaseClient implements DatabaseClientInterface {
  async getClient(): Promise<PoolClient> {
    console.warn('[DB:NOOP] getClient called with no DATABASE_URL configured');
    throw new Error('No database configured');
  }
  async query<T = unknown>(_text: string, _params?: unknown[]): Promise<T[]> {
    console.warn('[DB:NOOP] query called, returning empty result');
    return [] as T[];
  }

  async getSubscriptionByUserId(_userId: string): Promise<SubscriptionRecord | null> {
    console.warn('[DB:NOOP] getSubscriptionByUserId');
    return null;
  }
  async getSubscriptionByStripeId(_subscriptionId: string): Promise<SubscriptionRecord | null> {
    console.warn('[DB:NOOP] getSubscriptionByStripeId');
    return null;
  }
  async upsertSubscription(data: UpsertSubscriptionInput): Promise<SubscriptionRecord> {
    console.warn('[DB:NOOP] upsertSubscription', {
      tier: data.tier,
      status: data.status,
      billingInterval: data.billingInterval,
      hasMetadata: Boolean(data.metadata),
    });
    return {
      id: 0,
      userId: data.userId,
      customerId: data.customerId,
      subscriptionId: data.subscriptionId,
      tier: data.tier,
      status: data.status,
      billingInterval: data.billingInterval,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      trialStart: data.trialStart,
      trialEnd: data.trialEnd,
      canceledAt: undefined,
      endedAt: undefined,
      cancelAtPeriodEnd: !!data.cancelAtPeriodEnd,
      cancelReason: undefined,
      metadata: data.metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  async updateSubscriptionStatus(_subscriptionId: string, _status: SubscriptionRecord['status'], _cancel?: boolean): Promise<SubscriptionRecord | null> {
    console.warn('[DB:NOOP] updateSubscriptionStatus', { status: _status, cancelAtPeriodEnd: Boolean(_cancel) });
    return null;
  }
  async cancelSubscription(_subscriptionId: string, _reason?: string): Promise<SubscriptionRecord | null> {
    console.warn('[DB:NOOP] cancelSubscription');
    return null;
  }
  async trackUsage(_userId: string, _usageType: UsageRecord['usageType'], _amount?: number, _metadata?: Record<string, unknown>): Promise<void> {
    console.warn('[DB:NOOP] trackUsage');
  }
  async getCurrentUsage(_userId: string, _usageType?: UsageRecord['usageType']): Promise<UsageRecord[]> {
    console.warn('[DB:NOOP] getCurrentUsage');
    return [];
  }
  async getUsageTotal(_userId: string, _usageType: UsageRecord['usageType']): Promise<number> {
    console.warn('[DB:NOOP] getUsageTotal');
    return 0;
  }
  async createBillingEvent(data: CreateBillingEventInput): Promise<BillingEventRecord> {
    console.warn('[DB:NOOP] createBillingEvent', {
      eventType: data.eventType,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      hasMetadata: Boolean(data.metadata),
    });
    return {
      id: 0,
      subscriptionId: data.subscriptionId,
      invoiceId: data.invoiceId,
      paymentIntentId: data.paymentIntentId,
      eventType: data.eventType,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      stripeEventId: data.stripeEventId,
      metadata: data.metadata,
      occurredAt: data.occurredAt,
      createdAt: new Date()
    };
  }
  async getBillingEvents(_subscriptionId: string, _limit?: number): Promise<BillingEventRecord[]> {
    console.warn('[DB:NOOP] getBillingEvents');
    return [];
  }
  async getSubscriptionAnalytics(): Promise<{ totalSubscriptions: number; byTier: Record<string, number>; byStatus: Record<string, number>; monthlyRecurringRevenue: number }> {
    console.warn('[DB:NOOP] getSubscriptionAnalytics');
    return { totalSubscriptions: 0, byTier: {}, byStatus: {}, monthlyRecurringRevenue: 0 };
  }
  async close(): Promise<void> {
    console.warn('[DB:NOOP] close');
  }
}

// Export singleton instance (real DB when configured, otherwise a no-op shim)
export const db: DatabaseClientInterface = HAS_DATABASE ? new DatabaseClient() : new NoopDatabaseClient();
