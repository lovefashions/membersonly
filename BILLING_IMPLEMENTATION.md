# Billing + Membership Fix Pack - Implementation Summary

## ✅ Completed Implementation

This document outlines the complete billing and membership system for the **Members Only** portal app (dashboards, games, leaderboards).

**Key Context:**
- App URL: `https://membersonly.applejucy.com`
- This is a **portal app** (NOT marketing website)
- Public pages hosted separately; only app routes and API endpoints
- Tier hierarchy: Fan (rank 1) → VIP (rank 2) → Elite (rank 3)
- Trial: 14 days free, then monthly billing

---

## 📋 New/Modified Files

### Backend (Node.js API)

#### New Files
1. **[apps/api/src/routes/billing.js](apps/api/src/routes/billing.js)**
   - `GET /api/billing/plans` — Returns all active plans
   - `POST /api/billing/create-subscription` — Creates PayPal subscription + PocketBase records
   - `POST /api/billing/paypal/webhook` — PayPal webhook handler with signature verification
   - `POST /api/billing/test-webhook` — Admin endpoint for testing webhooks

2. **[apps/api/src/utils/paypalClient.js](apps/api/src/utils/paypalClient.js)**
   - PayPal API client utilities
   - `createPayPalSubscription()` — Creates subscription in PayPal
   - `verifyPayPalWebhookSignature()` — Verifies webhook signatures
   - `getPayPalSubscription()` — Fetches subscription details
   - `getPayPalPlan()` — Fetches plan details

3. **[apps/api/pocketbase/pb_migrations/1785094802_created_entitlements.js](apps/api/pocketbase/pb_migrations/1785094802_created_entitlements.js)**
   - New `entitlements` collection (stores `user`, `max_rank`, `active`, `active_from`, `active_until`, `reason`)
   - RLS rules prevent user modification; only webhook/admin can update
   - Unique index on user to ensure one entitlements record per user

#### Modified Files
1. **[apps/api/src/routes/index.js](apps/api/src/routes/index.js)**
   - Added: `apiRouter.use('/billing', billingRouter)`

2. **[apps/api/pocketbase/pb_migrations/1785094801_created_subscriptions.js](apps/api/pocketbase/pb_migrations/1785094801_created_subscriptions.js)**
   - Added fields: `providerCustomerId`, `trialEndsAt`, `currentPeriodEnd`
   - Tracks full subscription lifecycle: pending → active/trialing → canceled/expired/suspended

3. **[.env.example](.env.example)**
   - Added: `APP_URL`, `PAYPAL_MODE`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_PLAN_ID_*`
   - Added comprehensive setup instructions

### Frontend (React App)

#### New Files
1. **[apps/api/web/src/components/SubscriptionGate.jsx](apps/api/web/src/components/SubscriptionGate.jsx)**
   - React component for route protection
   - Usage: `<SubscriptionGate requiredTier="vip"><ProtectedContent /></SubscriptionGate>`
   - Maps tier names to rank requirements; redirects to `/pricing` if no access

#### Modified Files
1. **[apps/api/web/src/pages/UpgradePage.jsx](apps/api/web/src/pages/UpgradePage.jsx)**
   - Replaced client-side PayPal buttons with backend integration
   - Now calls `GET /api/billing/plans` to load plans dynamically
   - "Start Free Trial" button calls `POST /api/billing/create-subscription` → PayPal redirect
   - Shows loading states and error handling

2. **[apps/api/web/src/pages/AdminPage.jsx](apps/api/web/src/pages/AdminPage.jsx)**
   - Added webhook configuration section
   - Shows webhook URL, required env vars, and list of events to subscribe to
   - "Test Webhook" button calls `POST /api/billing/test-webhook` (admin-only)
   - Displays last webhook status

---

## 🔐 Environment Variables Required

### Critical (Must Have)
```env
APP_URL=https://membersonly.applejucy.com
PAYPAL_MODE=sandbox  # or "live"
PAYPAL_CLIENT_ID=<your_paypal_client_id>
PAYPAL_CLIENT_SECRET=<your_paypal_client_secret>
PAYPAL_WEBHOOK_ID=<your_webhook_id>
PAYPAL_PLAN_ID_FAN_MONTHLY=L3MKECMJ7PA52
PAYPAL_PLAN_ID_VIP_MONTHLY=E23D4H78JSZCY
PAYPAL_PLAN_ID_ELITE_MONTHLY=CPNYX2PLPG6CU
```

### Important (Configuration)
```env
POCKETBASE_URL=http://localhost:8090
PORT=3001
CORS_ORIGIN=https://membersonly.applejucy.com
NODE_ENV=development
```

### See [.env.example](.env.example) for full list with setup instructions

---

## 🌐 Webhook Configuration

### Webhook URL
```
https://membersonly.applejucy.com/api/billing/paypal/webhook
```

### Setup Steps
1. Go to [PayPal Developer Dashboard Webhooks](https://developer.paypal.com/dashboard/webhooks)
2. Click **"Create webhook endpoint"**
3. Enter URL: `https://membersonly.applejucy.com/api/billing/paypal/webhook`
4. Select these events:
   - BILLING.SUBSCRIPTION.CREATED
   - BILLING.SUBSCRIPTION.ACTIVATED
   - BILLING.SUBSCRIPTION.TRIALING
   - BILLING.SUBSCRIPTION.PAYMENT.SUCCESS
   - BILLING.SUBSCRIPTION.CANCELLED
   - BILLING.SUBSCRIPTION.EXPIRED
   - BILLING.SUBSCRIPTION.SUSPENDED
   - BILLING.SUBSCRIPTION.PAST_DUE
5. Copy the **Webhook ID** to `PAYPAL_WEBHOOK_ID` env var

### What Webhook Does
- **TRIALING/ACTIVE**: Sets `subscriptions.status` accordingly, `entitlements.active=true`
- **PAYMENT.SUCCESS**: Updates `subscriptions.currentPeriodEnd`, keeps `entitlements.active=true`
- **PAST_DUE/SUSPENDED**: Sets `subscriptions.status`, `entitlements.active=false` (show "Update billing")
- **CANCELLED/EXPIRED**: Sets `subscriptions.status`, `entitlements.active=false`

---

## 🔄 API Endpoints

### Public Endpoints

#### `GET /api/billing/plans`
Returns active plans sorted by rank.

**Response:**
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
  ...
]
```

#### `POST /api/billing/create-subscription` (Authenticated)
Creates subscription in PayPal and PocketBase.

**Request:**
```json
{
  "plan_slug": "vip"
}
```

**Response:**
```json
{
  "success": true,
  "subscription_id": "sub_12345",
  "approval_url": "https://www.paypal.com/checkoutnow?token=...",
  "provider_subscription_id": "I-ABC123"
}
```

#### `GET /api/subscriptions/status` (Authenticated)
Get user's current subscription status.

#### `GET /api/subscriptions/tier` (Authenticated)
Get user's current tier (fan/vip/elite).

### Webhook Endpoint

#### `POST /api/billing/paypal/webhook`
PayPal sends events here. **Signature verification required.**

### Admin Endpoints

#### `POST /api/billing/test-webhook` (Admin only)
For testing webhook configuration. Returns webhook URL and setup instructions.

---

## 🛡️ Data Models

### `subscriptions` Table
```
{
  id: string
  user: relation (users)
  plan: relation (plans)
  status: select (pending, trialing, active, past_due, suspended, cancelled, expired)
  startDate: date
  endDate: date (optional)
  trialEndsAt: date (optional)
  currentPeriodEnd: date (optional)
  paymentProvider: string (paypal)
  providerSubscriptionId: string (PayPal subscription ID)
  providerCustomerId: string (PayPal customer email)
  created: autodate
  updated: autodate
}
```

### `entitlements` Table
```
{
  id: string (unique per user)
  user: relation (users) - Unique constraint
  max_rank: number (1=fan, 2=vip, 3=elite)
  active: bool (derives from subscription status)
  active_from: date (optional)
  active_until: date (optional)
  reason: string (trial, paid, complimentary, suspended, cancelled)
  created: autodate
  updated: autodate
}
```

### `plans` Table
```
{
  id: string
  name: string (Fan Club, VIP Lounge, Elite Lounge)
  description: string
  price: number (monthly USD)
  tier: select (fan, vip, elite)
  rank: number (1, 2, 3)
  features: json (array of feature objects)
  paypalPlanId: string (PayPal subscription plan ID)
  active: bool
  created: autodate
  updated: autodate
}
```

---

## 🛣️ Redirect URLs

### Success/Cancel after PayPal approval
- Success: `https://membersonly.applejucy.com/account?subscription=success`
- Cancel: `https://membersonly.applejucy.com/pricing?subscription=cancelled`

Both URLs default to relative paths within the app (no external redirects).

---

## 🔓 Access Control

### Route Protection
Use the `SubscriptionGate` component to protect routes:

```jsx
import SubscriptionGate from '@/components/SubscriptionGate';

// Requires VIP tier (rank 2+)
<SubscriptionGate requiredTier="vip">
  <VIPOnlyDashboard />
</SubscriptionGate>

// Or by rank number
<SubscriptionGate requiredRank={3}>
  <EliteContent />
</SubscriptionGate>
```

### API Route Protection
Use the `requireSubscription()` middleware:

```js
router.get('/vip-only', requireSubscription('vip'), (req, res) => {
  // Only VIP+ users
});
```

### Tier Hierarchy
- **Fan (rank 1)**: Access tier-locked endpoints
- **VIP (rank 2)**: Access VIP + Fan content
- **Elite (rank 3)**: Access Elite + VIP + Fan content

---

## 🧪 Testing

### Test Webhook Delivery
1. Go to Admin page in app
2. Scroll to "PayPal Webhook Configuration"
3. Click "Test Webhook Connection"
4. Check [PayPal Webhook Logs](https://developer.paypal.com/dashboard/webhooks) for delivery status

### Simulate PayPal Events
1. Go to PayPal Dashboard → Webhooks → Your endpoint
2. Click **"Resend"** to resend a recent webhook event
3. Or use PayPal Webhook Simulator to send custom events

---

## 🔧 Key Features

✅ **14-day free trial** - Automatically set by PayPal subscription  
✅ **Tier hierarchy** - VIP includes Fan; Elite includes VIP+Fan  
✅ **Webhook signature verification** - PayPal events validated before processing  
✅ **Idempotent webhook handler** - Safe to receive duplicate events  
✅ **Admin webhook testing** - Test endpoint for validation  
✅ **Membership derived from tables** - No fields on Users table  
✅ **Real PayPal integration** - Live mode ready  
✅ **PocketBase RLS** - Entitlements only updated by webhooks/admins  

---

## ⚠️ Important Notes

1. **APP_URL must be set** — All redirects and webhook URLs derive from this
2. **Webhook ID is critical** — Copy exact ID from PayPal; typos break webhook verification
3. **Plan IDs must exist** — Ensure PayPal has these subscription plans with 14-day trial
4. **Signature verification required** — Never accept webhooks without verifying signature
5. **Tier stacking via rank** — max_rank = 3 means access to all tiers
6. **Trial is in PayPal** — Not stored in PocketBase; check subscription for trial status
7. **Admin email** — `admin@applejucy.com` or `support@applejucy.com` can access admin features

---

## 🚀 Next Steps

1. Copy `.env.example` to `.env` and fill in PayPal credentials
2. Create PayPal subscription plans (14-day trial, monthly billing)
3. Configure webhook in PayPal Dashboard (use webhook URL above)
4. Run PocketBase migrations to create tables
5. Deploy and test with sandbox mode first
6. Switch to live mode once tested

---

## 📞 Support

For issues with:
- **PayPal**: Check [PayPal Webhook Dashboard](https://developer.paypal.com/dashboard/webhooks)
- **PocketBase**: Verify migrations ran; check collection schemas
- **App**: Check browser console and server logs
