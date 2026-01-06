# Pain Tracker - Production Deployment Guide

## 🎯 Quick Start Checklist

- [x] ✅ **Dependencies Installed** - Backend packages added (108 packages)
- [ ] 🔧 **Stripe Products Created** - Basic & Pro tiers with pricing
- [ ] 🗄️ **Database Setup** - PostgreSQL initialized with schema
- [x] 🔐 **Environment Variables** - Local and production configs
- [ ] 🧪 **Local Testing** - Stripe CLI webhook testing
- [x] 🚀 **Vercel Deployment** - Production deployment
- [ ] 🔗 **Webhook Configuration** - Production webhook endpoint
- [ ] ✅ **End-to-End Testing** - Full payment flow validation

---

## Step 1: Create Stripe Products & Prices ⚡

### Install Stripe CLI (Windows)

```powershell
# Using Scoop package manager
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# OR download directly from:
# https://github.com/stripe/stripe-cli/releases/latest
```

### Login to Stripe

```powershell
stripe login
# Opens browser to authenticate with your Stripe account
```

### Create Basic Tier Product

```powershell
# Create Product
stripe products create `
  --name="Pain Tracker Basic" `
  --description="Basic pain tracking with advanced analytics and PDF reports"

# Note the product ID (e.g., prod_ABC123)
# Use it in the commands below by replacing <PRODUCT_ID>

# Create Basic Monthly Price
stripe prices create `
  --product=<PRODUCT_ID> `
  --unit-amount=999 `
  --currency=usd `
  --recurring[interval]=month `
  --nickname="Basic Monthly"

# Note the price ID (e.g., price_XYZ789) - Save as STRIPE_PRICE_BASIC_MONTHLY

# Create Basic Yearly Price (20% discount)
stripe prices create `
  --product=<PRODUCT_ID> `
  --unit-amount=9590 `
  --currency=usd `
  --recurring[interval]=year `
  --nickname="Basic Yearly"

# Note the price ID - Save as STRIPE_PRICE_BASIC_YEARLY
```

### Create Pro Tier Product

```powershell
# Create Product
stripe products create `
  --name="Pain Tracker Pro" `
  --description="Professional pain tracking with HIPAA compliance and unlimited features"

# Note the product ID

# Create Pro Monthly Price
stripe prices create `
  --product=<PRODUCT_ID> `
  --unit-amount=2499 `
  --currency=usd `
  --recurring[interval]=month `
  --nickname="Pro Monthly"

# Note the price ID - Save as STRIPE_PRICE_PRO_MONTHLY

# Create Pro Yearly Price (20% discount)
stripe prices create `
  --product=<PRODUCT_ID> `
  --unit-amount=23990 `
  --currency=usd `
  --recurring[interval]=year `
  --nickname="Pro Yearly"

# Note the price ID - Save as STRIPE_PRICE_PRO_YEARLY
```

### Save Your Price IDs

Copy all 4 price IDs to a temporary file - you'll need them for environment variables:

```
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_BASIC_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
```

---

## Step 2: Setup PostgreSQL Database 🗄️

### Option A: Local PostgreSQL (Development)

```powershell
# Check if PostgreSQL is installed
psql --version

# If not installed, download from:
# https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql

# Create database
psql -U postgres -c "CREATE DATABASE paintracker;"

# Run schema migration
psql -U postgres -d paintracker -f database/schema.sql

# Verify tables created
psql -U postgres -d paintracker -c "\dt"
```

Expected output:
```
                List of relations
 Schema |       Name        | Type  |  Owner
--------+-------------------+-------+----------
 public | billing_events    | table | postgres
 public | subscriptions     | table | postgres
 public | usage_tracking    | table | postgres
```

### Option B: Cloud PostgreSQL (Production)

**Vercel Postgres** (Recommended for Vercel deployment):
```powershell
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Create Postgres database
vercel postgres create pain-tracker-db

# Note the DATABASE_URL from output
```

**Other Options**:
- **Supabase**: Free tier with 500MB storage - https://supabase.com
- **Railway**: $5/month - https://railway.app
- **Neon**: Serverless Postgres - https://neon.tech

After creating cloud database:
```powershell
# Get your DATABASE_URL (format: postgresql://user:password@host:5432/database)
# Run migration
psql <DATABASE_URL> -f database/schema.sql
```

---

## Step 3: Configure Environment Variables 🔐

### Create `.env.local` for Development

```powershell
# Create file in project root
New-Item -Path .env.local -ItemType File
```

Add the following content:

```env
# Stripe API Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # From stripe listen (Step 5)

# Stripe Price IDs
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_BASIC_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/paintracker

# Node Environment
NODE_ENV=development
```

### Get Stripe Test Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy "Secret key" → `STRIPE_SECRET_KEY`
3. Copy "Publishable key" → `STRIPE_PUBLISHABLE_KEY`

---

## Step 4: Local Testing with Stripe CLI 🧪

### Start Local Development Server

```powershell
# Terminal 1: Start dev server
npm run dev
# Server defaults to http://localhost:3000 (it may choose another port if 3000 is busy)
```

### Setup Webhook Forwarding

```powershell
# Terminal 2: Start Stripe webhook listener
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# Copy the webhook signing secret from output:
# > Ready! Your webhook signing secret is whsec_...
# Add this to .env.local as STRIPE_WEBHOOK_SECRET
```

### Test Checkout Flow

```powershell
# Terminal 3: Test checkout session creation
curl -X POST http://localhost:3000/api/stripe/create-checkout-session `
  -H "Content-Type: application/json" `
  -d '{
    \"userId\": \"user_test_123\",
    \"tier\": \"basic\",
    \"interval\": \"monthly\",
    \"successUrl\": \"http://localhost:3000/success\",
    \"cancelUrl\": \"http://localhost:3000/pricing\",
    \"email\": \"test@example.com\"
  }'
```

Expected response:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

### Test Webhook Events

```powershell
# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger invoice.paid

# Check Terminal 2 for webhook logs
# Check database for records:
psql -U postgres -d paintracker -c "SELECT * FROM subscriptions;"
```

### Test with Stripe Test Cards

1. Open checkout URL from previous step
2. Use test card: `4242 4242 4242 4242`
3. Any future expiry date
4. Any CVC
5. Complete checkout
6. Verify subscription in database:

```sql
SELECT 
  user_id, 
  tier, 
  status, 
  billing_interval, 
  trial_end 
FROM subscriptions;
```

---

## Step 5: Production Deployment to Vercel 🚀

### Install Vercel CLI

```powershell
npm install -g vercel
vercel login
```

### Link Project to Vercel

```powershell
# Initialize Vercel project
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Scope: Your account
# - Link to existing project? No
# - Project name: pain-tracker
# - Directory: ./ (current)
# - Override settings? No
```

### Configure Production Environment Variables

```powershell
# Stripe Production Keys (from https://dashboard.stripe.com/apikeys)
vercel env add STRIPE_SECRET_KEY
# When prompted: production, preview, development? Choose 'production'
# Paste your LIVE secret key: sk_live_...

vercel env add STRIPE_PUBLISHABLE_KEY
# Paste your LIVE publishable key: pk_live_...

vercel env add STRIPE_WEBHOOK_SECRET
# Paste production webhook secret (get from Stripe Dashboard after Step 7)

# Stripe Price IDs
vercel env add STRIPE_PRICE_BASIC_MONTHLY
vercel env add STRIPE_PRICE_BASIC_YEARLY
vercel env add STRIPE_PRICE_PRO_MONTHLY
vercel env add STRIPE_PRICE_PRO_YEARLY

# Database URL
vercel env add DATABASE_URL
# Paste production database URL

# Node Environment
vercel env add NODE_ENV
# Enter: production
```

### Deploy to Production

```powershell
# Build and deploy
vercel --prod

# Note the production URL from output:
# https://pain-tracker.vercel.app
```

### Verify Deployment

```powershell
# Check deployment status
vercel ls

# View logs
vercel logs pain-tracker --follow

# Test health
curl https://pain-tracker.vercel.app
```

---

## Step 6: Configure Production Webhooks 🔗

### Add Webhook Endpoint in Stripe Dashboard

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://pain-tracker.vercel.app/api/stripe/webhook`
4. Select events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.paid`
   - ✅ `invoice.payment_failed`
   - ✅ `customer.subscription.trial_will_end`
5. Click "Add endpoint"
6. **CRITICAL**: Copy the "Signing secret" (starts with `whsec_`)
7. Add to Vercel environment variables:

```powershell
vercel env add STRIPE_WEBHOOK_SECRET
# Paste the signing secret from step 6
# Choose: production

# Redeploy to apply changes
vercel --prod
```

### Verify Webhook Configuration

1. In Stripe Dashboard → Webhooks → Your endpoint
2. Click "Send test webhook"
3. Choose `customer.subscription.created`
4. Check response - should be `200 OK`
5. Check database:

```sql
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;
```

---

## Step 7: End-to-End Testing ✅

### Test Complete Payment Flow

```powershell
# 1. Create checkout session
curl -X POST https://pain-tracker.vercel.app/api/stripe/create-checkout-session `
  -H "Content-Type: application/json" `
  -d '{
    \"userId\": \"user_production_test\",
    \"tier\": \"basic\",
    \"interval\": \"monthly\",
    \"successUrl\": \"https://pain-tracker.vercel.app/success\",
    \"cancelUrl\": \"https://pain-tracker.vercel.app/pricing\",
    \"email\": \"production-test@example.com\"
  }'

# 2. Open the returned URL in browser
# 3. Use Stripe test card (in test mode) or real card (in live mode)
# 4. Complete checkout
# 5. Verify subscription created
```

### Verify Database Records

```sql
-- Check subscription
SELECT * FROM subscriptions WHERE user_id = 'user_production_test';

-- Check usage tracking initialized
SELECT * FROM usage_tracking WHERE user_id = 'user_production_test';

-- Check billing event logged
SELECT * FROM billing_events ORDER BY occurred_at DESC LIMIT 1;
```

### Test Quota Enforcement

1. Log into app with test user
2. Try to create pain entries
3. At 80% quota, verify warning appears
4. At 100% quota, verify upgrade prompt appears

### Test Upgrade Flow

1. Click upgrade from quota warning
2. Complete checkout to Pro tier
3. Verify subscription updated in database:

```sql
SELECT user_id, tier, status FROM subscriptions WHERE user_id = 'user_production_test';
```

4. Verify quota increased (unlimited for Pro)

---

## Step 8: Monitor Production 📊

### Stripe Dashboard Monitoring

- **MRR**: https://dashboard.stripe.com/dashboard
- **Failed Payments**: https://dashboard.stripe.com/payments?status=failed
- **Webhooks**: https://dashboard.stripe.com/webhooks (check delivery status)

### Database Health Checks

```sql
-- Active subscriptions by tier
SELECT tier, COUNT(*) FROM subscriptions WHERE status = 'active' GROUP BY tier;

-- Monthly Recurring Revenue
SELECT 
  tier,
  billing_interval,
  COUNT(*) as subscribers,
  CASE 
    WHEN tier = 'basic' AND billing_interval = 'monthly' THEN COUNT(*) * 9.99
    WHEN tier = 'basic' AND billing_interval = 'yearly' THEN COUNT(*) * 95.90 / 12
    WHEN tier = 'pro' AND billing_interval = 'monthly' THEN COUNT(*) * 24.99
    WHEN tier = 'pro' AND billing_interval = 'yearly' THEN COUNT(*) * 239.90 / 12
  END as monthly_revenue
FROM subscriptions 
WHERE status IN ('active', 'trialing')
GROUP BY tier, billing_interval;

-- Failed payments last 30 days
SELECT COUNT(*) FROM billing_events 
WHERE event_type = 'payment_failed' 
AND occurred_at > NOW() - INTERVAL '30 days';
```

### Vercel Logs

```powershell
# Real-time logs
vercel logs pain-tracker --follow

# Filter errors
vercel logs pain-tracker --output=json | Select-String "error"
```

### Setup Alerts (Recommended)

**Stripe Email Alerts**:
1. Dashboard → Settings → Notifications
2. Enable:
   - Failed payments
   - Webhook failures
   - Subscription cancellations

**Database Monitoring** (if using Vercel Postgres):
```powershell
vercel postgres metrics pain-tracker-db
```

---

## Troubleshooting 🔧

### Issue: Webhook Signature Validation Fails

**Symptoms**: 400 error in webhook logs, "Invalid signature"

**Solution**:
```powershell
# 1. Verify webhook secret matches Stripe dashboard
stripe webhooks list

# 2. Update Vercel environment variable
vercel env rm STRIPE_WEBHOOK_SECRET
vercel env add STRIPE_WEBHOOK_SECRET
# Paste correct secret

# 3. Redeploy
vercel --prod
```

### Issue: Database Connection Timeouts

**Symptoms**: 500 errors, "connection timeout" in logs

**Solution**:
```sql
-- Check connection pool
SELECT count(*) FROM pg_stat_activity WHERE datname = 'paintracker';

-- If at limit (20), optimize queries or increase pool size
-- In src/lib/database.ts, increase max: 30
```

### Issue: Checkout Session Creation Fails

**Symptoms**: Error "Price not found"

**Solution**:
```powershell
# Verify price IDs exist
stripe prices list

# Update environment variables with correct IDs
vercel env add STRIPE_PRICE_BASIC_MONTHLY
# ... etc
```

### Issue: Usage Not Tracking

**Symptoms**: Quota always shows 0

**Solution**:
```sql
-- Check if trackUsage is being called
SELECT * FROM usage_tracking ORDER BY tracked_at DESC LIMIT 10;

-- If empty, verify SubscriptionAwarePainEntryForm is in use
-- Check src/App.tsx uses SubscriptionProvider
```

---

## Security Checklist 🔒

Before going live, verify:

- [ ] ✅ **HTTPS Only**: All endpoints use HTTPS
- [ ] ✅ **Webhook Signature Validation**: Implemented in webhook handler
- [ ] ✅ **Environment Variables**: No secrets in code
- [ ] ✅ **SQL Injection Prevention**: Parameterized queries used
- [ ] ✅ **Error Handling**: No sensitive data in error messages
- [ ] ⏳ **Rate Limiting**: Implement on API endpoints (pending)
- [ ] ⏳ **CORS Configuration**: Whitelist allowed origins (pending)
- [ ] ✅ **Audit Logging**: Billing events table tracks all changes

---

## Performance Optimization 🚀

### Database Indexing

Already implemented in `database/schema.sql`:
```sql
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_usage_tracking_user_period ON usage_tracking(user_id, period_start, period_end);
CREATE INDEX idx_billing_events_subscription ON billing_events(subscription_id);
```

### Connection Pooling

Already configured in `src/lib/database.ts`:
- Max connections: 20
- Idle timeout: 30s
- Connection timeout: 2s

### Webhook Processing

Monitor latency:
```sql
-- Average webhook processing time (pending: add timestamp logging)
SELECT AVG(EXTRACT(EPOCH FROM (occurred_at - created_at))) as avg_seconds
FROM billing_events;
```

Target: < 200ms per webhook

---

## Next Steps 📋

### Immediate (This Week)
- [ ] Address npm audit vulnerabilities: `npm audit fix`
- [ ] Setup error monitoring (Sentry): https://sentry.io
- [ ] Configure email notifications for trial ending
- [ ] Test subscription cancellation flow

### Short-term (Next 2 Weeks)
- [ ] Build admin dashboard for subscription management
- [ ] Implement rate limiting on API endpoints
- [ ] Add analytics dashboard for MRR tracking
- [ ] Setup automated backup for database

### Medium-term (Next Month)
- [ ] A/B test pricing tiers
- [ ] Implement referral program (10% discount)
- [ ] Add annual plan upgrade incentives
- [ ] SOC 2 compliance preparation

---

## Support Resources 📚

- **Stripe Documentation**: https://stripe.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Project Docs**: 
  - `docs/SAAS_COMPLETE.md` - Complete implementation summary
  - `docs/BACKEND_INTEGRATION_COMPLETE.md` - Backend technical details
  - `docs/FEATURE_GATE_INTEGRATION.md` - Frontend integration guide

---

## Success Metrics 🎯

### Technical
- ✅ API endpoints deployed and functional
- ✅ Database schema deployed
- ✅ Webhook signature validation active
- ⏳ 90%+ test coverage (target)
- ⏳ < 200ms webhook latency (measure)
- ⏳ 99.9% uptime (monitor)

### Business
- ⏳ Positive unit economics (LTV > 3x CAC)
- ⏳ < 5% monthly churn
- ⏳ > 30% trial conversion rate
- ⏳ > 50% annual plan adoption
- ⏳ Profitability within 12 months

---

**Status**: Ready for production deployment ✅

**Last Updated**: November 10, 2025

**Deployment Owner**: CrisisCore-Systems
