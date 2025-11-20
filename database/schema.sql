/**
 * Database Schema for Subscription System
 * 
 * This file defines the database schema for subscriptions and usage tracking.
 * Compatible with PostgreSQL, MySQL, and SQLite.
 * 
 * For production, use a migration tool like Prisma, TypeORM, or Knex.
 */

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  
  -- User identification
  user_id VARCHAR(255) NOT NULL UNIQUE,
  
  -- Stripe identifiers
  customer_id VARCHAR(255) NOT NULL,
  subscription_id VARCHAR(255) UNIQUE,
  
  -- Subscription details
  tier VARCHAR(50) NOT NULL DEFAULT 'free',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  billing_interval VARCHAR(20), -- 'monthly' or 'yearly'
  
  -- Timestamps
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  canceled_at TIMESTAMP,
  ended_at TIMESTAMP,
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancel_reason TEXT,
  
  -- Metadata
  metadata JSONB,
  
  -- Audit timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  CONSTRAINT chk_tier CHECK (tier IN ('free', 'basic', 'pro', 'enterprise')),
  CONSTRAINT chk_status CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid'))
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);

-- ============================================================================
-- USAGE TRACKING TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_tracking (
  id SERIAL PRIMARY KEY,
  
  -- User identification
  user_id VARCHAR(255) NOT NULL,
  
  -- Usage type and amount
  usage_type VARCHAR(100) NOT NULL, -- 'pain_entry', 'mood_entry', 'activity_log', 'export', 'storage'
  amount INTEGER DEFAULT 1,
  
  -- Period tracking
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Metadata
  metadata JSONB,
  
  -- Timestamps
  tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Composite unique constraint for deduplication
  CONSTRAINT uq_usage_period UNIQUE (user_id, usage_type, period_start, period_end)
);

CREATE INDEX idx_usage_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_type ON usage_tracking(usage_type);
CREATE INDEX idx_usage_period ON usage_tracking(period_start, period_end);
CREATE INDEX idx_usage_tracked_at ON usage_tracking(tracked_at);

-- ============================================================================
-- BILLING EVENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS billing_events (
  id SERIAL PRIMARY KEY,
  
  -- Stripe identifiers
  subscription_id VARCHAR(255) NOT NULL,
  invoice_id VARCHAR(255),
  payment_intent_id VARCHAR(255),
  
  -- Event details
  event_type VARCHAR(100) NOT NULL, -- 'invoice_paid', 'payment_failed', 'subscription_created', etc.
  amount DECIMAL(10, 2),
  currency VARCHAR(10),
  
  -- Status
  status VARCHAR(50),
  
  -- Metadata
  stripe_event_id VARCHAR(255) UNIQUE,
  metadata JSONB,
  
  -- Timestamps
  occurred_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(subscription_id) ON DELETE CASCADE
);

CREATE INDEX idx_billing_events_subscription_id ON billing_events(subscription_id);
CREATE INDEX idx_billing_events_invoice_id ON billing_events(invoice_id);
CREATE INDEX idx_billing_events_occurred_at ON billing_events(occurred_at);
CREATE INDEX idx_billing_events_stripe_event_id ON billing_events(stripe_event_id);

-- ============================================================================
-- USAGE QUOTAS VIEW (Current Period)
-- ============================================================================
CREATE OR REPLACE VIEW current_usage AS
SELECT 
  u.user_id,
  u.usage_type,
  SUM(u.amount) as total_usage,
  s.tier,
  CASE 
    WHEN s.tier = 'free' THEN 
      CASE u.usage_type
        WHEN 'pain_entry' THEN 50
        WHEN 'mood_entry' THEN 30
        WHEN 'activity_log' THEN 30
        WHEN 'export' THEN 5
        WHEN 'storage' THEN 10 -- MB
        ELSE 0
      END
    WHEN s.tier = 'basic' THEN
      CASE u.usage_type
        WHEN 'pain_entry' THEN 500
        WHEN 'mood_entry' THEN 300
        WHEN 'activity_log' THEN 300
        WHEN 'export' THEN 25
        WHEN 'storage' THEN 100 -- MB
        ELSE 0
      END
    WHEN s.tier IN ('pro', 'enterprise') THEN 999999 -- Unlimited
    ELSE 0
  END as quota_limit,
  s.current_period_end
FROM usage_tracking u
LEFT JOIN subscriptions s ON u.user_id = s.user_id
WHERE u.period_start >= DATE_TRUNC('month', CURRENT_DATE)
  AND u.period_end <= DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY u.user_id, u.usage_type, s.tier, s.current_period_end;

-- ============================================================================
-- UPDATE TIMESTAMP TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Get user's current subscription with usage
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id VARCHAR)
RETURNS TABLE (
  user_id VARCHAR,
  tier VARCHAR,
  status VARCHAR,
  trial_end TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN,
  pain_entries_used INTEGER,
  pain_entries_limit INTEGER,
  exports_used INTEGER,
  exports_limit INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.user_id,
    s.tier,
    s.status,
    s.trial_end,
    s.current_period_end,
    s.cancel_at_period_end,
    COALESCE((SELECT SUM(amount) FROM usage_tracking 
      WHERE user_id = p_user_id 
        AND usage_type = 'pain_entry'
        AND period_start >= DATE_TRUNC('month', CURRENT_DATE)), 0)::INTEGER as pain_entries_used,
    CASE s.tier
      WHEN 'free' THEN 50
      WHEN 'basic' THEN 500
      ELSE 999999
    END as pain_entries_limit,
    COALESCE((SELECT SUM(amount) FROM usage_tracking 
      WHERE user_id = p_user_id 
        AND usage_type = 'export'
        AND period_start >= DATE_TRUNC('month', CURRENT_DATE)), 0)::INTEGER as exports_used,
    CASE s.tier
      WHEN 'free' THEN 5
      WHEN 'basic' THEN 25
      ELSE 999999
    END as exports_limit
  FROM subscriptions s
  WHERE s.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Track usage
CREATE OR REPLACE FUNCTION track_usage(
  p_user_id VARCHAR,
  p_usage_type VARCHAR,
  p_amount INTEGER DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
  v_period_start DATE;
  v_period_end DATE;
BEGIN
  v_period_start := DATE_TRUNC('month', CURRENT_DATE);
  v_period_end := v_period_start + INTERVAL '1 month';
  
  INSERT INTO usage_tracking (user_id, usage_type, amount, period_start, period_end)
  VALUES (p_user_id, p_usage_type, p_amount, v_period_start, v_period_end)
  ON CONFLICT (user_id, usage_type, period_start, period_end)
  DO UPDATE SET 
    amount = usage_tracking.amount + p_amount,
    tracked_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA (Development Only)
-- ============================================================================

-- Insert sample free tier user
INSERT INTO subscriptions (user_id, customer_id, tier, status)
VALUES ('user_sample_free', 'cus_sample_free', 'free', 'active')
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample basic tier user
INSERT INTO subscriptions (user_id, customer_id, subscription_id, tier, status, billing_interval, trial_end, current_period_end)
VALUES (
  'user_sample_basic', 
  'cus_sample_basic',
  'sub_sample_basic',
  'basic',
  'active',
  'monthly',
  CURRENT_TIMESTAMP + INTERVAL '14 days',
  CURRENT_TIMESTAMP + INTERVAL '30 days'
)
ON CONFLICT (user_id) DO NOTHING;

-- Insert sample usage data
SELECT track_usage('user_sample_free', 'pain_entry', 25);
SELECT track_usage('user_sample_basic', 'pain_entry', 150);
SELECT track_usage('user_sample_basic', 'export', 5);

-- ============================================================================
-- CLEANUP (Development Only)
-- ============================================================================

-- DROP TABLE IF EXISTS billing_events CASCADE;
-- DROP TABLE IF EXISTS usage_tracking CASCADE;
-- DROP TABLE IF EXISTS subscriptions CASCADE;
-- DROP VIEW IF EXISTS current_usage CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
-- DROP FUNCTION IF EXISTS get_user_subscription CASCADE;
-- DROP FUNCTION IF EXISTS track_usage CASCADE;

-- ============================================================================
-- TESTIMONIALS TABLE (For verified user stories)
-- ============================================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  role VARCHAR(255),
  email VARCHAR(255),
  quote TEXT NOT NULL,
  anonymized BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_testimonials_verified ON testimonials(verified);

CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

