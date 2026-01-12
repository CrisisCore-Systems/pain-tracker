# 💰 SaaS Subscription System - Complete Setup Guide

**Version**: 1.0  
**Status**: Production-Ready  
**Last Updated**: November 19, 2025

---

## 🎯 Overview

This guide walks you through setting up the complete SaaS subscription system for Pain Tracker, including Stripe integration, subscription tiers, feature gates, and user management.

### What's Included

✅ **4 Subscription Tiers**: Free, Basic, Pro, Enterprise  
✅ **Stripe Integration**: Checkout, webhooks, subscription management  
✅ **Feature Gates**: Conditional rendering based on subscription  
✅ **Usage Tracking**: Quota management and warnings  
✅ **Trial Management**: 14-30 day trials with automatic conversion  
✅ **Database Schema**: Subscription and billing event storage  

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Stripe account (https://stripe.com)
- PostgreSQL database (or SQLite for development)
- Vercel account (for deployment)

### Step 1: Clone and Install

```bash
git clone https://github.com/CrisisCore-Systems/pain-tracker.git
cd pain-tracker
npm install
```

### Step 2: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your Stripe credentials
```

Required variables:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_BASIC_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
DATABASE_URL=postgresql://...
```

### Step 3: Set Up Stripe Products

1. Go to https://dashboard.stripe.com/test/products
2. Create products with the following pricing:

**Basic Tier**:
- Monthly: $9.99/month
- Yearly: $99.90/year (save 17%)

**Pro Tier**:
- Monthly: $24.99/month
- Yearly: $249.90/year (save 21%)

3. Copy the Price IDs to your `.env.local`

### Step 4: Set Up Database

```bash
# Create database tables
npm run db:setup

# Or manually run SQL from database/schema.sql
psql $DATABASE_URL < database/schema.sql
```

### Step 5: Test Stripe Webhooks Locally

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Windows: Download from https://github.com/stripe/stripe-cli/releases

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook secret to .env.local as STRIPE_WEBHOOK_SECRET
```

### Step 6: Start Development Server

```bash
npm run dev
```

Visit:
- App: http://localhost:3000
- Pricing Page: http://localhost:3000/pricing

---

## 📊 Subscription Tiers

### Free Tier ($0/month)

**Storage**:
- 50 pain entries
- 90-day retention
- 50 MB storage

**Features**:
- Basic analytics
- CSV export (5/month)
- Community support

**Target**: Trial users, mild pain management

---

### Basic Tier ($9.99/month)

**Storage**:
- 500 pain entries
- 1-year retention
- 500 MB storage

**Features**:
- Advanced analytics
- Empathy Intelligence
- PDF & WorkSafe BC reports
- Family sharing (2 users)
- Email support (24h response)

**Trial**: 14 days free

**Target**: Individuals with chronic pain

---

### Pro Tier ($24.99/month)

**Storage**:
- Unlimited entries
- Unlimited retention
- 5 GB storage

**Features**:
- Predictive insights
- Clinical PDF export
- HIPAA compliance
- Healthcare API access
- Priority support (4h response)
- Wearable device integration

**Trial**: 30 days free

**Target**: Power users, healthcare coordination

---

### Enterprise Tier (Custom Pricing)

**Storage**: Unlimited everything

**Features**:
- Custom integrations
- White-label options
- SOC2 compliance
- Dedicated support (1h response)
- Custom training
- SLA agreements

**Trial**: 60 days free

**Target**: Healthcare organizations, clinics

---

## 🔧 Implementation Details

### Architecture Overview

```
User Action (e.g., Create Pain Entry)
    ↓
Check Feature Access (SubscriptionService)
    ↓
Track Usage (Update quota)
    ↓
Render Feature or Upgrade Prompt
```

### Core Components

#### 1. Subscription Service
**File**: `src/services/SubscriptionService.ts`

Handles:
- Subscription lifecycle (create, upgrade, downgrade, cancel)
- Feature access validation
- Usage tracking
- Quota management
- Analytics

#### 2. Subscription Context
**File**: `src/contexts/SubscriptionContext.tsx`

Provides:
- Global subscription state
- React hooks for feature access
- Tier management functions

#### 3. Feature Gates
**File**: `src/components/subscription/FeatureGates.tsx`

Components:
- `<FeatureGate>` - Conditional rendering by feature
- `<TierGate>` - Conditional rendering by tier
- `<UpgradePrompt>` - Upgrade call-to-action
- `<UsageWarning>` - Quota warnings
- `<TierBadge>` - Display subscription badge

#### 4. Pricing Page
**File**: `src/pages/PricingPage.tsx`

Features:
- Tier comparison
- Monthly/yearly toggle
- Feature matrix
- Upgrade flow
- FAQ section

---

## 💳 Stripe Integration

### Checkout Flow

1. User clicks "Upgrade to Pro" on pricing page
2. Frontend calls `/api/stripe/create-checkout-session`
3. Stripe checkout session created with:
   - Price ID for selected tier/interval
   - User ID in metadata
   - Trial period (14-30 days)
   - Success/cancel URLs
4. User completes payment
5. Stripe webhook fires `checkout.session.completed`
6. Backend creates subscription record in database
7. User redirected to success page

### Webhook Events

The webhook handler (`api/stripe/webhook.ts`) processes:

- `checkout.session.completed` - Initial subscription creation
- `customer.subscription.created` - Subscription created
- `customer.subscription.updated` - Status changes, tier changes
- `customer.subscription.deleted` - Cancellation
- `invoice.paid` - Successful payment
- `invoice.payment_failed` - Failed payment
- `customer.subscription.trial_will_end` - Trial ending soon

### Testing Webhooks

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

```bash
# Test checkout locally
node test-checkout.mjs

# Monitor webhook events
stripe listen --events checkout.session.completed,customer.subscription.created
```

---

## 🎨 Using Feature Gates

### Example 1: Gate a Feature by Tier

```tsx
import { TierGate } from './components/subscription/FeatureGates';

function AnalyticsDashboard() {
  return (
    <div>
      {/* Always available */}
      <BasicAnalytics />
      
      {/* Only for Pro+ */}
      <TierGate requiredTier="pro">
        <PredictiveInsights />
      </TierGate>
    </div>
  );
}
```

### Example 2: Gate by Specific Feature

```tsx
import { FeatureGate } from './components/subscription/FeatureGates';

function ExportButton() {
  return (
    <FeatureGate 
      feature="pdfReports"
      showUpgradePrompt={true}
    >
      <button onClick={exportToPDF}>
        Export to PDF
      </button>
    </FeatureGate>
  );
}
```

### Example 3: Track Usage

```tsx
import { useSubscription } from './contexts/SubscriptionContext';

function PainEntryForm() {
  const { trackUsage, checkFeatureAccess } = useSubscription();
  
  const handleSubmit = async (data) => {
    // Check quota before creating
    const access = await checkFeatureAccess('maxPainEntries');
    
    if (!access.hasAccess) {
      showUpgradePrompt();
      return;
    }
    
    // Create entry
    await createPainEntry(data);
    
    // Track usage
    await trackUsage('painEntries', 1);
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Example 4: Show Usage Warnings

```tsx
import { UsageWarning } from './components/subscription/FeatureGates';

function Dashboard() {
  return (
    <div>
      {/* Warn at 80% quota */}
      <UsageWarning 
        feature="maxPainEntries" 
        threshold={80} 
      />
      
      <PainEntriesList />
    </div>
  );
}
```

---

## 🗄️ Database Schema

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  customer_id VARCHAR(255) UNIQUE, -- Stripe customer ID
  subscription_id VARCHAR(255) UNIQUE, -- Stripe subscription ID
  
  -- Subscription details
  tier VARCHAR(50) NOT NULL DEFAULT 'free',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  billing_interval VARCHAR(20),
  
  -- Dates
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_start TIMESTAMP,
  trial_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  -- Usage tracking
  usage_pain_entries INTEGER DEFAULT 0,
  usage_mood_entries INTEGER DEFAULT 0,
  usage_activity_logs INTEGER DEFAULT 0,
  usage_storage_mb NUMERIC(10,2) DEFAULT 0,
  usage_api_calls INTEGER DEFAULT 0,
  usage_export_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT subscriptions_tier_check 
    CHECK (tier IN ('free', 'basic', 'pro', 'enterprise')),
  CONSTRAINT subscriptions_status_check 
    CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'expired'))
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_customer_id ON subscriptions(customer_id);
```

### Billing Events Table

```sql
CREATE TABLE billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id VARCHAR(255) NOT NULL,
  invoice_id VARCHAR(255),
  payment_intent_id VARCHAR(255),
  
  -- Event details
  event_type VARCHAR(100) NOT NULL,
  amount NUMERIC(10,2),
  currency VARCHAR(3),
  status VARCHAR(50),
  
  -- Timestamps
  occurred_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB,
  
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(subscription_id)
);

CREATE INDEX idx_billing_events_subscription ON billing_events(subscription_id);
CREATE INDEX idx_billing_events_occurred_at ON billing_events(occurred_at);
```

---

## 🧪 Testing

### Unit Tests

```bash
# Test subscription service
npm run test -- SubscriptionService.test.ts

# Test feature gates
npm run test -- FeatureGates.test.tsx
```

### Integration Tests

```bash
# Test complete checkout flow
npm run test:e2e -- subscription-flow.spec.ts
```

### Manual Testing Checklist

- [ ] Free user can create 50 pain entries
- [ ] Upgrade prompt shows at quota limit
- [ ] Checkout session created successfully
- [ ] Webhook updates database
- [ ] Tier change applies immediately (upgrade)
- [ ] Tier change scheduled for period end (downgrade)
- [ ] Trial countdown displays correctly
- [ ] Canceled subscription shows reactivate option
- [ ] Feature gates render/hide correctly
- [ ] Usage tracking increments properly

---

## 🚀 Deployment

### Vercel Deployment

1. **Add Environment Variables**:
```bash
vercel env add STRIPE_SECRET_KEY
vercel env add STRIPE_WEBHOOK_SECRET
vercel env add DATABASE_URL
# ... (all other Stripe price IDs)
```

2. **Configure Webhook Endpoint**:
- Go to https://dashboard.stripe.com/webhooks
- Add endpoint: `https://paintracker.ca/api/stripe/webhook`
- Select events: All subscription and invoice events
- Copy signing secret to Vercel environment

3. **Deploy**:
```bash
vercel --prod
```

### Post-Deployment

1. Test live mode with real card
2. Monitor webhook events in Stripe Dashboard
3. Verify database updates
4. Check error logs in Vercel

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

- **Conversion Rate**: Free → Paid
- **Trial Conversion**: Trial → Paid
- **Churn Rate**: Monthly cancellations
- **MRR**: Monthly Recurring Revenue
- **ARR**: Annual Recurring Revenue
- **LTV**: Customer Lifetime Value
- **Feature Adoption**: Usage by tier

### Stripe Dashboard

- Revenue: https://dashboard.stripe.com/revenue
- Subscriptions: https://dashboard.stripe.com/subscriptions
- Webhooks: https://dashboard.stripe.com/webhooks

---

## 🔒 Security Considerations

### Production Checklist

- [ ] Use `sk_live_` keys in production
- [ ] Verify webhook signatures
- [ ] Encrypt subscription data at rest
- [ ] Rate limit API endpoints
- [ ] Monitor for unusual activity
- [ ] Implement CSRF protection
- [ ] Use HTTPS only
- [ ] Regular security audits
- [ ] PCI compliance (handled by Stripe)

### HIPAA Compliance (Pro+ Tiers)

- Enable audit logging
- Use enterprise encryption
- Sign BAA with Stripe
- Implement access controls
- Regular compliance audits

---

## 🆘 Troubleshooting

### Webhook Not Receiving Events

```bash
# Check webhook endpoint status
curl https://paintracker.ca/api/stripe/webhook

# Verify webhook secret
stripe listen --events customer.subscription.created --forward-to localhost:3000/api/stripe/webhook
```

### Database Connection Issues

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT NOW();"

# Check Vercel logs
vercel logs
```

### Subscription Not Updating

1. Check Stripe Dashboard webhook logs
2. Verify webhook signature
3. Check database for errors
4. Review Vercel function logs

---

## 📚 Additional Resources

- [Stripe Subscriptions Guide](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Testing](https://stripe.com/docs/testing)
- [SAAS_IMPLEMENTATION.md](./SAAS_IMPLEMENTATION.md) - Technical details
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## 🎉 Success Criteria

Your SaaS system is ready when:

✅ Pricing page displays all tiers correctly  
✅ Checkout flow completes without errors  
✅ Webhooks update database in real-time  
✅ Feature gates hide/show content properly  
✅ Usage tracking increments accurately  
✅ Upgrade/downgrade flows work smoothly  
✅ Trial management functions correctly  
✅ Cancellation and reactivation work  

---

**Need Help?** Open an issue on GitHub or contact support@paintracker.ca

*Last updated: November 19, 2025*
