# 🚀 Quick Start Deployment Reference

**Created**: November 10, 2025  
**Status**: ✅ Dependencies Installed - Ready for Deployment


## 📋 Pre-Flight Checklist

- [x] **Backend Dependencies**: ✅ Installed (108 packages)
- [ ] **Stripe CLI**: Install & authenticate
- [ ] **PostgreSQL**: Database running locally
- [ ] **Environment Variables**: .env.local configured
- [ ] **Stripe Products**: Created in dashboard
- [ ] **Local Testing**: Working checkout flow
- [ ] **Production Deploy**: Vercel deployment complete
- [ ] **Webhooks**: Production endpoint configured


## ⚡ 5-Minute Local Setup

### 1. Install Stripe CLI (Windows)

```powershell
# Using Scoop
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe

# Authenticate
stripe login
```

### 2. Create Stripe Products

```powershell
# Basic Tier Product
stripe products create --name="Pain Tracker Basic" --description="Basic pain tracking features"
# Copy product ID → prod_XXX

# Basic Monthly ($9.99)
stripe prices create --product=prod_XXX --unit-amount=999 --currency=usd --recurring[interval]=month --nickname="Basic Monthly"
# Copy price ID → STRIPE_PRICE_BASIC_MONTHLY

# Basic Yearly ($95.90)
stripe prices create --product=prod_XXX --unit-amount=9590 --currency=usd --recurring[interval]=year --nickname="Basic Yearly"
# Copy price ID → STRIPE_PRICE_BASIC_YEARLY

# Pro Tier Product
stripe products create --name="Pain Tracker Pro" --description="Professional pain tracking with HIPAA compliance"
# Copy product ID → prod_YYY

# Pro Monthly ($24.99)
stripe prices create --product=prod_YYY --unit-amount=2499 --currency=usd --recurring[interval]=month --nickname="Pro Monthly"
# Copy price ID → STRIPE_PRICE_PRO_MONTHLY

# Pro Yearly ($239.90)
stripe prices create --product=prod_YYY --unit-amount=23990 --currency=usd --recurring[interval]=year --nickname="Pro Yearly"
# Copy price ID → STRIPE_PRICE_PRO_YEARLY
```

### 3. Setup Local Database

```powershell
# Create database
psql -U postgres -c "CREATE DATABASE paintracker;"

# Run migration
psql -U postgres -d paintracker -f database/schema.sql

# Verify
psql -U postgres -d paintracker -c "\dt"
```

### 4. Configure Environment (.env.local)

```env
# Get from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # From stripe listen (step 5)

# From step 2 above
STRIPE_PRICE_BASIC_MONTHLY=price_...
STRIPE_PRICE_BASIC_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...

# Local database
DATABASE_URL=postgresql://postgres:password@localhost:5432/paintracker

NODE_ENV=development
```

### 5. Test Locally

```powershell
# Terminal 1: Start dev server
npm run dev

# Vite defaults to http://localhost:3000 (it may choose another port if 3000 is busy).
# If your terminal shows a different port, replace the URLs below.

# Terminal 2: Start webhook listener
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
# Copy webhook secret → Add to .env.local as STRIPE_WEBHOOK_SECRET

# Terminal 3: Test checkout
curl -X POST http://localhost:3000/api/stripe/create-checkout-session `
  -H "Content-Type: application/json" `
  -d '{\"userId\":\"test_user\",\"tier\":\"basic\",\"interval\":\"monthly\",\"successUrl\":\"http://localhost:3000/success\",\"cancelUrl\":\"http://localhost:3000/cancel\"}'

# Open returned URL in browser, use test card: 4242 4242 4242 4242
```

---

## 🚀 Production Deployment

### 1. Deploy to Vercel

```powershell
# Install & login
npm install -g vercel
vercel login

# Deploy
vercel

# Add environment variables (get live keys from Stripe dashboard)
vercel env add STRIPE_SECRET_KEY # sk_live_...
vercel env add STRIPE_PUBLISHABLE_KEY # pk_live_...
vercel env add STRIPE_PRICE_BASIC_MONTHLY
vercel env add STRIPE_PRICE_BASIC_YEARLY
vercel env add STRIPE_PRICE_PRO_MONTHLY
vercel env add STRIPE_PRICE_PRO_YEARLY
vercel env add DATABASE_URL # Production database
vercel env add NODE_ENV # production

# Production deploy
vercel --prod
```

### 2. Configure Webhooks

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://your-app.vercel.app/api/stripe/webhook`
4. Events: Select all `checkout.*`, `customer.subscription.*`, `invoice.*`
5. Copy signing secret
6. Add to Vercel:

```powershell
vercel env add STRIPE_WEBHOOK_SECRET # whsec_...
vercel --prod # Redeploy
```

---

## 🧪 Test Stripe Cards

| Card Number | Result | Use Case |
|-------------|--------|----------|
| 4242 4242 4242 4242 | Success | Normal payment |
| 4000 0025 0000 3155 | Requires auth | 3D Secure |
| 4000 0000 0000 9995 | Declined | Payment failure |

---

## 📊 Verify Deployment

```powershell
# Check subscription created
psql $DATABASE_URL -c "SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;"

# Check webhook logs
vercel logs --follow

# Test API endpoint
curl https://your-app.vercel.app/api/stripe/create-checkout-session -X POST -H "Content-Type: application/json" -d '{...}'
```

---

## 🔧 Common Issues

| Issue | Solution |
|-------|----------|
| Webhook signature fails | Verify `STRIPE_WEBHOOK_SECRET` matches dashboard |
| Database timeout | Check `DATABASE_URL` connection string |
| Price not found | Verify price IDs in environment variables |
| 403 CORS error | Add allowed origins in Vercel settings |

---

## 📚 Full Documentation

- **Complete Guide**: `DEPLOYMENT_GUIDE.md` (detailed step-by-step)
- **Backend Technical**: `docs/BACKEND_INTEGRATION_COMPLETE.md`
- **Implementation Summary**: `docs/SAAS_COMPLETE.md`
- **Frontend Integration**: `docs/FEATURE_GATE_INTEGRATION.md`

---

## 🎯 Success Criteria

- [ ] Local checkout works with test card
- [ ] Webhooks received and logged
- [ ] Subscription in database
- [ ] Production checkout works
- [ ] Quota enforcement active
- [ ] Usage tracking working

---

**Next Step**: Run `stripe login` to begin setup

**Support**: See `DEPLOYMENT_GUIDE.md` for detailed troubleshooting
