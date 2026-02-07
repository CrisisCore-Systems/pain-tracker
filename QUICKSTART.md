# 🚀 Quick Start Deployment Reference

**Created**: November 10, 2025  
**Status**: ✅ Dependencies Installed - Ready for Deployment


## 📋 Pre-Flight Checklist

- [x] **Backend Dependencies**: ✅ Installed (108 packages)
- [ ] **Environment Variables**: .env.local configured (optional)
- [ ] **PostgreSQL**: Database running locally (optional)
- [ ] **Local Testing**: Core app workflows verified
- [ ] **Production Deploy**: Vercel deployment complete


## ⚡ 5-Minute Local Setup

### 1. Run the app locally

```powershell
npm install
npm run dev
```

Notes:
- The core app is local-first and does not require a payments/subscriptions backend.
- If you see historical references to Stripe in older docs, treat them as archived experiments, not a supported path.

### 2. Setup Local Database (optional)

```powershell
# Create database
psql -U postgres -c "CREATE DATABASE paintracker;"

# Run migration
psql -U postgres -d paintracker -f database/schema.sql

# Verify
psql -U postgres -d paintracker -c "\dt"
```

### 3. Configure Environment (.env.local) (optional)

```env
# Local database
DATABASE_URL=postgresql://postgres:password@localhost:5432/paintracker

NODE_ENV=development
```

### 4. Test Locally

```powershell
# Terminal 1: Start frontend dev server
npm run dev

# Vite is configured to use http://localhost:3000 (it may choose another port if 3000 is busy).

# Terminal 2: Start local API server (runs Vercel-style functions locally)
# This powers clinic auth endpoints via Vite's /api proxy.
npm run dev:api

---

## 💳 Payments / Subscriptions

Payments/subscriptions are intentionally out of scope for this quickstart until a backend architecture exists.
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

# Add environment variables
vercel env add DATABASE_URL # Production database (optional, if using server-side features)
vercel env add NODE_ENV # production

# Production deploy
vercel --prod
```

---

## 📊 Verify Deployment

```powershell
# Check subscription created
psql $DATABASE_URL -c "SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;"

# Check webhook logs
vercel logs --follow

# Test API endpoint
curl https://your-app.vercel.app/api/health -X GET
```

---

## 🔧 Common Issues

| Issue | Solution |
|-------|----------|
| Database timeout | Check `DATABASE_URL` connection string |
| 403 CORS error | Add allowed origins in Vercel settings |

---

## 📚 Full Documentation

- **Complete Guide**: `docs/ops/DEPLOYMENT_GUIDE.md` (detailed step-by-step)
- **Backend Technical**: `docs/engineering/BACKEND_INTEGRATION_COMPLETE.md`
- **Implementation Summary**: `docs/archive/saas/SAAS_COMPLETE.md`
- **Frontend Integration**: `docs/product/FEATURE_GATE_INTEGRATION.md`

---

## 🎯 Success Criteria

- [ ] Core app loads and can create entries
- [ ] Offline-first flows verified
- [ ] Optional server-side endpoints (if enabled) behave as expected

---

**Next Step**: Run `npm run dev` to begin.

**Support**: See `docs/ops/DEPLOYMENT_GUIDE.md` for detailed troubleshooting
