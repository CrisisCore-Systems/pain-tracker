# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment (Completed)
- [x] SaaS implementation complete
- [x] Stripe live credentials configured in `.env`
- [x] TypeScript compilation passes
- [x] Test suite passes
- [x] Vercel configuration exists

## 📦 Step 1: Deploy to Vercel

### Option A: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI**
```powershell
npm install -g vercel
```

2. **Login to Vercel**
```powershell
vercel login
```

3. **Deploy to Production**
```powershell
vercel --prod
```

### Option B: Deploy via GitHub (Automated)

1. **Push to GitHub**
```powershell
git add .
git commit -m "feat: implement SaaS subscription system"
git push origin main
```

2. **Connect Vercel to GitHub**
   - Go to: https://vercel.com/new
   - Import your repository: `CrisisCore-Systems/pain-tracker`
   - Vercel will auto-detect settings from `vercel.json`

## 🔐 Step 2: Configure Environment Variables

### In Vercel Dashboard:

1. **Go to your project settings**
   - Visit: https://vercel.com/your-username/pain-tracker/settings/environment-variables

2. **Add the following variables** (copy from your `.env` file):

#### Stripe Configuration
```
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_STRIPE_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

#### Stripe Price IDs
```
STRIPE_PRICE_BASIC_MONTHLY=price_1SVStcKGjXPKI47ZwvDKfzgz
STRIPE_PRICE_BASIC_YEARLY=price_1SVSvYKGjXPKI47Z6Nezx94O
STRIPE_PRICE_PRO_MONTHLY=price_1SVSx7KGjXPKI47ZclwJTVgS
STRIPE_PRICE_PRO_YEARLY=price_1SVSxcKGjXPKI47ZKXcC1gCr
```

#### Database (if needed)
```
DATABASE_URL=your_production_database_url
```

#### Environment
```
NODE_ENV=production
VITE_APP_ENVIRONMENT=production
```

3. **Apply to:** Select "Production" environment

## 🔄 Step 3: Update Stripe Webhook URL

1. **Get your Vercel deployment URL**
   - After deployment, you'll get a URL like: `https://paintracker.ca` or `https://pain-tracker.vercel.app`

2. **Update Stripe Webhook**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click on your webhook endpoint
   - Update URL to: `https://your-domain.com/api/stripe-webhook`
   - Ensure these events are selected:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

## 🧪 Step 4: Test Checkout Flow

### Test with Real Payment Method

1. **Visit your production site**
   ```
   https://paintracker.ca/pricing
   ```

2. **Click "Subscribe" on a tier**

3. **Use Stripe test card (if still in test mode)**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

4. **Verify**
   - ✅ Redirects to success page
   - ✅ User sees subscription in account
   - ✅ Webhook received in Stripe Dashboard

### Test Subscription Management

1. **Go to subscription page**
   ```
   https://paintracker.ca/subscription
   ```

2. **Verify you can:**
   - ✅ See current subscription details
   - ✅ Access customer portal
   - ✅ Cancel/upgrade subscription
   - ✅ Update payment method

## 📊 Step 5: Monitor Webhooks

### Stripe Dashboard Monitoring

1. **View Webhook Events**
   - Go to: https://dashboard.stripe.com/webhooks
   - Click on your webhook endpoint
   - Monitor "Recent deliveries"

2. **Check for Errors**
   - Look for failed webhook deliveries
   - Review error messages
   - Verify response codes (should be 200)

3. **Test Webhook Manually**
   - Click "Send test webhook"
   - Select event type: `customer.subscription.created`
   - Verify your endpoint receives it

### Vercel Logs Monitoring

1. **View Function Logs**
   ```powershell
   vercel logs --follow
   ```

2. **Or check dashboard**
   - Go to: https://vercel.com/your-username/pain-tracker/logs
   - Filter by: "Functions"
   - Look for `/api/stripe-webhook` requests

## 🔒 Security Checklist

- [ ] **Environment variables** are set in Vercel (not in code)
- [ ] **Webhook signature** verification is enabled
- [ ] **HTTPS** is enabled (automatic with Vercel)
- [ ] **CSP headers** are configured in `vercel.json`
- [ ] **Rate limiting** is active on payment endpoints
- [ ] **Error logging** doesn't expose sensitive data

## 🎯 Post-Deployment Validation

### Automated Checks
```powershell
# Run health check
npm run deploy:healthcheck

# Verify deployment
npm run deploy:validate
```

### Manual Checks
- [ ] Homepage loads correctly
- [ ] Pain tracking works (free tier)
- [ ] Pricing page displays all tiers
- [ ] Checkout redirects to Stripe
- [ ] Webhooks process successfully
- [ ] Subscription management works
- [ ] Analytics are feature-gated correctly

## 📈 Monitoring Setup

### Stripe Dashboard
- Monitor: https://dashboard.stripe.com/dashboard
- Track: Revenue, subscriptions, failed payments

### Vercel Analytics
- Monitor: https://vercel.com/your-username/pain-tracker/analytics
- Track: Traffic, performance, errors

### Error Tracking (Optional)
- Set up Sentry: https://sentry.io
- `VITE_SENTRY_DSN` is reserved in env/templates and CI, but the current app runtime does not initialize Sentry automatically.
- If you wire up Sentry, treat it as telemetry and review privacy/security implications.

## 🆘 Troubleshooting

### Deployment Fails
```powershell
# Check build logs
vercel logs

# Test build locally
npm run build

# Verify environment
npm run doctor
```

### Webhook Not Receiving Events
1. Verify webhook URL is correct in Stripe
2. Check Vercel function logs for errors
3. Ensure `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
4. Test with Stripe CLI: `stripe trigger checkout.session.completed`

### Payment Not Processing
1. Verify Stripe keys are correct (live vs test)
2. Check price IDs match Stripe dashboard
3. Review Stripe Dashboard > Events for errors
4. Enable Stripe test mode for debugging

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Pain Tracker Docs**: `docs/` directory
- **Issues**: https://github.com/CrisisCore-Systems/pain-tracker/issues

---

## ✅ Deployment Complete!

Once all steps are done:
1. Share the production URL with stakeholders
2. Monitor for the first few transactions
3. Set up automated health checks
4. Plan for regular security audits

**Your SaaS is now live! 🎉**
