# Testing Guide - Members Only Billing System

## 🚀 Quick Start Setup

### 1. **Environment Setup**

```bash
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your values
# POCKETBASE_URL=http://localhost:8090
# PORT=3001
# CORS_ORIGIN=http://localhost:3000
```

### 2. **Install Dependencies**

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd apps/api
npm install

# Install frontend dependencies
cd ../web
npm install
```

### 3. **Start Services**

**Terminal 1 - PocketBase:**
```bash
cd apps/api/pocketbase
./pocketbase serve
# Visit http://localhost:8090/_/ to access admin panel
```

**Terminal 2 - Backend API:**
```bash
cd apps/api
npm start
# API runs on http://localhost:3001
```

**Terminal 3 - Frontend:**
```bash
cd apps/web
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 🧪 Testing Workflows

### Workflow 1: Setup PayPal Sandbox Account

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Login or create account
3. Switch to **Sandbox** mode (toggle in top left)
4. In left menu: **Apps & Credentials**
5. Under **Sandbox** tab:
   - Find "Business" account
   - Copy **Client ID** → `PAYPAL_CLIENT_ID`
   - Click "Hidden" → show → Copy **Secret** → `PAYPAL_CLIENT_SECRET`
6. Set in `.env`:
   ```env
   PAYPAL_MODE=sandbox
   PAYPAL_CLIENT_ID=<paste_here>
   PAYPAL_CLIENT_SECRET=<paste_here>
   ```

### Workflow 2: Create PayPal Subscription Plans

1. In PayPal Dashboard, go to **Billing Plans** (or search for "Recurring")
2. Click **Create Plan**
3. Create 3 plans:

   **Plan 1: Fan Club**
   - Name: "Fan Club"
   - Pricing: $30/month
   - Trial: 14 days, $0
   - Save → Copy Plan ID → set `PAYPAL_PLAN_ID_FAN_MONTHLY`

   **Plan 2: VIP Lounge**
   - Name: "VIP Lounge"
   - Pricing: $45/month
   - Trial: 14 days, $0
   - Save → Copy Plan ID → set `PAYPAL_PLAN_ID_VIP_MONTHLY`

   **Plan 3: Elite Lounge**
   - Name: "Elite Lounge"
   - Pricing: $55/month
   - Trial: 14 days, $0
   - Save → Copy Plan ID → set `PAYPAL_PLAN_ID_ELITE_MONTHLY`

4. Update `.env`:
   ```env
   PAYPAL_PLAN_ID_FAN_MONTHLY=L3MKECMJ7PA52
   PAYPAL_PLAN_ID_VIP_MONTHLY=E23D4H78JSZCY
   PAYPAL_PLAN_ID_ELITE_MONTHLY=CPNYX2PLPG6CU
   ```

### Workflow 3: Configure Webhook

1. In PayPal Dashboard: **Webhooks** (left sidebar)
2. Click **Create webhook endpoint**
3. URL: `http://localhost:3001/api/billing/paypal/webhook` (local testing)
4. Select Events:
   - BILLING.SUBSCRIPTION.CREATED
   - BILLING.SUBSCRIPTION.ACTIVATED
   - BILLING.SUBSCRIPTION.TRIALING
   - BILLING.SUBSCRIPTION.PAYMENT.SUCCESS
   - BILLING.SUBSCRIPTION.CANCELLED
   - BILLING.SUBSCRIPTION.EXPIRED
   - BILLING.SUBSCRIPTION.SUSPENDED
   - BILLING.SUBSCRIPTION.PAST_DUE
5. Save → Copy **Webhook ID** → set `PAYPAL_WEBHOOK_ID` in `.env`

6. Update `.env`:
   ```env
   PAYPAL_WEBHOOK_ID=<paste_webhook_id_here>
   ```

**Note:** For local testing, PayPal can't send webhooks to localhost. Use **Webhook Simulator** instead (see Workflow 5).

---

## 🧮 Test Cases

### Test Case 1: View Available Plans

**Request:**
```bash
curl http://localhost:3001/api/billing/plans
```

**Expected Response:** (200 OK)
```json
[
  {
    "slug": "fan",
    "name": "Fan Club",
    "description": "...",
    "price_monthly": 30,
    "trial_days": 14,
    "rank": 1,
    "features": [...]
  },
  {
    "slug": "vip",
    "name": "VIP Lounge",
    "price_monthly": 45,
    "trial_days": 14,
    "rank": 2,
    "features": [...]
  },
  {
    "slug": "elite",
    "name": "Elite Lounge",
    "price_monthly": 55,
    "trial_days": 14,
    "rank": 3,
    "features": [...]
  }
]
```

**Status:** ✅ Passes if you see all 3 plans

---

### Test Case 2: Create Test User

**Via Frontend:**
1. Go to `http://localhost:3000/signup`
2. Enter email/password: `testuser@example.com` / `test123456`
3. Click "Sign Up"
4. ✅ Should redirect to dashboard

**Via API:**
```bash
curl -X POST http://localhost:8090/api/collections/users/records \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "test123456",
    "passwordConfirm": "test123456"
  }'
```

---

### Test Case 3: Create Subscription (Full Flow)

**Step 1: Get Auth Token**
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "test123456"
  }'

# Copy the returned token
TOKEN="<token_from_response>"
```

**Step 2: Create Subscription**
```bash
curl -X POST http://localhost:3001/api/billing/create-subscription \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan_slug": "vip"}'
```

**Expected Response:** (200 OK)
```json
{
  "success": true,
  "subscription_id": "sub_12345",
  "approval_url": "https://www.sandbox.paypal.com/checkoutnow?token=EC-...",
  "provider_subscription_id": "I-ABC123XYZ"
}
```

**Step 3: Visit Approval URL**
1. Copy `approval_url` from response
2. Open in browser
3. Login to PayPal Sandbox account (test buyer):
   - Email: `sb-testbuyer123@business.example.com`
   - Password: `Test123456` (varies, check dashboard)
4. Click "Subscribe"
5. Should redirect to `http://localhost:3000/account?subscription=success`

---

### Test Case 4: Check User Entitlements

**After successful subscription:**
```bash
# Get user tier
curl http://localhost:3001/api/subscriptions/tier \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:** (200 OK)
```json
{
  "tier": "vip"
}
```

**Check PocketBase directly:**
1. Go to `http://localhost:8090/_/`
2. Collection: `entitlements`
3. Should see record: `max_rank: 2`, `active: true`, `reason: "paid"`

---

### Test Case 5: Test Webhook Simulator

**Manually trigger webhook event:**

1. Go to PayPal Dashboard → **Webhooks**
2. Find your endpoint → Click **Details**
3. Scroll to **Recent Events**
4. Select any event → Click **Resend**
5. Watch server logs (Terminal 2) for:
   ```
   PayPal webhook received: BILLING.SUBSCRIPTION.ACTIVATED
   Subscription activated: I-ABC123, user: <user_id>
   ```

---

### Test Case 6: Frontend Subscription Workflow

**Without Passing the App:**
1. Go to `http://localhost:3000/pricing` (or UpgradePage)
2. Click "Start Free Trial" for VIP
3. Redirected to PayPal
4. Login as test buyer
5. Return to `http://localhost:3000/account?subscription=success`
6. Dashboard should show "VIP Lounge" tier

**With SubscriptionGate:**
1. Wrap a page: `<SubscriptionGate requiredTier="elite"><ElitePage /></SubscriptionGate>`
2. User without Elite access → redirect to `/pricing`
3. After subscription → should see Elite page

---

### Test Case 7: Test Admin Webhook Test Endpoint

```bash
curl -X POST http://localhost:3001/api/billing/test-webhook \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Test webhook queued...",
  "webhook_url": "http://localhost:3001/api/billing/paypal/webhook"
}
```

---

## 🔍 Debugging Checklist

| Issue | Debug Steps |
|-------|------------|
| **Plans endpoint returns 500** | Check POCKETBASE_URL; verify Plans collection exists; check server logs |
| **Create subscription fails** | Verify auth token valid; check PAYPAL_CLIENT_ID/SECRET; check PayPal plan IDs exist |
| **Webhook not processing** | Check PAYPAL_WEBHOOK_ID correct; use Simulator instead of real events for localhost; check logs |
| **Entitlements not created** | Check subscription record created first; verify webhook handler ran; check PocketBase RLS |
| **Frontend redirect loop** | Clear browser cache; verify tier rank mapping correct; check localStorage |
| **PayPal buttons don't render** | Check PAYPAL_CLIENT_ID in frontend; verify PayPal SDK loaded; check browser console |

---

## 📊 Database State Checks

### Check Subscriptions Table
```sql
-- In PocketBase UI or via API
GET http://localhost:8090/api/collections/subscriptions/records?filter=user="<user_id>"
```

Expected fields:
- `user`, `plan`, `status`, `trialEndsAt`, `currentPeriodEnd`, `providerSubscriptionId`

### Check Entitlements Table
```sql
GET http://localhost:8090/api/collections/entitlements/records?filter=user="<user_id>"
```

Expected fields:
- `max_rank`, `active`, `reason` (trial/paid/suspended/cancelled)

---

## ✅ Success Criteria

- [ ] Plans endpoint returns all 3 tiers
- [ ] Can create test user
- [ ] Can initiate subscription → PayPal approval page
- [ ] Webhook processes (check logs)
- [ ] Entitlements updated after subscription approval
- [ ] User tier shows correctly in API
- [ ] Frontend routing works with SubscriptionGate
- [ ] Admin test webhook endpoint works

---

## 🐛 Common Issues & Fixes

### "PAYPAL_CLIENT_ID is undefined"
**Fix:** Make sure `.env` is in project root AND restart backend

### "Webhook signature verification failed"
**Fix:** For localhost, use PayPal Webhook Simulator instead of real events

### "User created but can't login"
**Fix:** Check PocketBase auth is enabled; verify email/password match

### "Subscription stuck in 'pending' status"
**Fix:** Manually trigger webhook simulator or check PayPal plan settings

---

## 🚀 Production Testing Prep

Once sandbox testing passes:

1. Create PayPal **Live** credentials
2. Create Live subscription plans (same setup, but in Live mode)
3. Update `.env`:
   ```env
   PAYPAL_MODE=live
   APP_URL=https://membersonly.applejucy.com
   # ... live IDs and webhook URL
   ```
4. Deploy and test with small amounts
5. Monitor webhook logs closely first week

