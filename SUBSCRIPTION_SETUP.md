# Subscription System Setup & Implementation Guide

## Overview

This document outlines the complete subscription system for the Members Only membership platform. The system integrates PayPal subscriptions with PocketBase for managing users, plans, and subscription status.

## Architecture

### Database Schema

#### Plans Table
Stores available subscription plans with pricing and features:
- `id` - Primary key
- `name` - Display name (e.g., "Fan", "VIP", "Elite")
- `description` - Plan description
- `price` - Monthly price in USD
- `tier` - Tier level (select: fan/vip/elite)
- `features` - JSON array of included features
- `paypalPlanId` - PayPal subscription plan ID
- `active` - Whether plan is available for purchase

#### Subscriptions Table
Tracks individual user subscriptions:
- `id` - Primary key
- `user` - Relation to users collection
- `plan` - Relation to plans collection
- `status` - Subscription status (select: active/inactive/cancelled/suspended/expired)
- `startDate` - Subscription start date
- `endDate` - Subscription end date (if applicable)
- `paymentProvider` - Payment provider (e.g., "paypal")
- `providerSubscriptionId` - External subscription ID from provider

#### Profiles Table (Enhanced)
User profile information with tier tracking:
- `user` - Relation to users collection
- `tier` - Current tier (fan/vip/elite) - **fallback for legacy support**

### API Routes

#### Subscriptions Endpoints

**GET `/api/subscriptions/status`** (Authenticated)
Returns user's current subscription status:
```json
{
  "hasActiveSubscription": true,
  "tier": "vip",
  "subscription": {
    "id": "...",
    "status": "active",
    "startDate": "2024-01-15",
    "endDate": "2025-01-15",
    "paymentProvider": "paypal",
    "planId": "E23D4H78JSZCY"
  }
}
```

**GET `/api/subscriptions/tier`** (Authenticated)
Returns user's current tier:
```json
{
  "tier": "vip"
}
```

#### Products Endpoints (Gated)

**GET `/api/products/:id/download`** (Authenticated + VIP+ Subscription Required)
Secure download endpoint for digital products:
- Requires `Authorization: Bearer <token>` header
- Requires VIP or Elite subscription
- Returns redirect to file URL if authenticated and authorized
- Returns 401 if not authenticated
- Returns 403 if subscription insufficient

### Frontend Components

#### EcommerceApi Helper
New methods added to handle subscription queries:

```javascript
// Fetch user's subscription status
const status = await EcommerceApi.fetchSubscriptionStatus(token);
// Returns { hasActiveSubscription, tier, subscription }

// Fetch user's current tier
const tierInfo = await EcommerceApi.fetchUserTier(token);
// Returns { tier }
```

## Environment Setup

### 1. PayPal Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your PayPal credentials:

```env
# PayPal Integration (required for subscriptions)
PAYPAL_MODE=sandbox  # Use 'sandbox' for testing, 'live' for production
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_WEBHOOK_ID=your_webhook_id

# PayPal Plan IDs (from PayPal Business Account)
PAYPAL_PLAN_FAN=L3MKECMJ7PA52
PAYPAL_PLAN_VIP=E23D4H78JSZCY
PAYPAL_PLAN_ELITE=CPNYX2PLPG6CU
```

### 2. Get PayPal Credentials

1. **Create a PayPal Business Account**: https://www.paypal.com/us/business
2. **Access Developer Dashboard**: https://developer.paypal.com/dashboard
3. **Create or select an app**:
   - Go to Apps & Credentials
   - Highlight Sandbox or Live environment
   - Copy Client ID and Client Secret
4. **Set up subscription plans**:
   - Go to Billing Plans
   - Create Product (e.g., "Membership Products")
   - Create subscription plans with recurring billing
   - Copy Plan IDs and save to `.env`

### 3. Configure Webhooks

1. In PayPal Developer Dashboard, go to Webhooks
2. Create webhook endpoint: `https://yoursite.com/api/paypal/webhook`
3. Subscribe to events:
   - `BILLING.SUBSCRIPTION.CREATED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.PAYMENT.COMPLETED`
   - `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
4. Copy Webhook ID to `.env` as `PAYPAL_WEBHOOK_ID`

## Access Control & Authorization

### Subscription Requirement Levels

The system uses tier hierarchy for access control:

```
Free (fan) < VIP < Elite
```

Users with higher tiers automatically have access to lower tier features.

### Protecting API Routes

Example of protecting a route with subscription requirement:

```javascript
import { requireSubscription } from '../utils/subscriptionAccess.js';
import authMiddleware from '../middleware/auth.js';

// Require VIP or higher subscription
router.get(
  '/premium-data',
  authMiddleware,
  requireSubscription('vip'),
  (req, res) => {
    // Only users with VIP+ subscriptions reach here
    res.json({ data: 'Premium content' });
  }
);
```

### Protecting Frontend Routes

Wrap components with subscription checks:

```jsx
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { currentUser, profile } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />

      {/* Protected: Requires authentication */}
      <Route
        path="/account"
        element={<ProtectedRoute>{<AccountPage />}</ProtectedRoute>}
      />

      {/* Protected: Requires VIP+ subscription */}
      <Route
        path="/premium"
        element={
          <ProtectedRoute requiredTier="vip">
            {<PremiumPage />}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## Subscription Lifecycle

### User Subscribes
1. User clicks PayPal button on UpgradePage
2. PayPal SDK shows subscription dialog
3. User authenticates and approves recurring charge
4. PayPal returns to success URL

### Webhook Activation
1. PayPal sends BILLING.SUBSCRIPTION.CREATED event
2. API receives at `/api/paypal/webhook`
3. Validates webhook signature
4. Extracts user ID from custom_id parameter
5. Creates record in `subscriptions` table with status='active'
6. Updates `profiles.tier` for backward compatibility

### User Cancels
1. User cancels subscription in PayPal account/app
2. PayPal sends BILLING.SUBSCRIPTION.CANCELLED event
3. API receives and validates webhook
4. Updates subscription status = 'cancelled'
5. Resets `profiles.tier` to 'fan'

### Subscription Expires
1. Subscription end date passes
2. System marks subscription status = 'expired'
3. User returned to 'fan' tier

## Testing the System

### Manual Testing Workflow

1. **Start the application**:
   ```bash
   npm run dev
   # Starts Vite (3000), API (3001), PocketBase (8090)
   ```

2. **Create test user** in PocketBase admin (http://localhost:8090):
   - Email: test@example.com
   - Password: testPassword
   - Verify: checked

3. **Create test profile** for user:
   - User: (select test user)
   - Tier: fan
   - (View Profile ID for later use)

4. **Test subscription endpoints**:
   ```bash
   # Get authentication token
   curl -X POST http://localhost:8090/api/collections/users/auth-with-password \
     -H "Content-Type: application/json" \
     -d '{"identity":"test@example.com","password":"testPassword"}'

   # Use token from response
   TOKEN="eyJ0eXAiOiJKV1QiLCJhbGc..."

   # Check subscription status
   curl http://localhost:3001/api/subscriptions/status \
     -H "Authorization: Bearer $TOKEN"

   # Check tier
   curl http://localhost:3001/api/subscriptions/tier \
     -H "Authorization: Bearer $TOKEN"
   ```

5. **Test product download** (without proper subscription):
   ```bash
   # Should return 403 (subscription required)
   curl http://localhost:3001/api/products/PRODUCT_ID/download \
     -H "Authorization: Bearer $TOKEN"
   ```

6. **Test via UI** (UpgradePage):
   - Navigate to `/upgrade`
   - You'll see three PayPal subscription buttons
   - In Sandbox mode, use PayPal test accounts:
     - Email: sb-xxxxx@business.example.com
     - Password: (from PayPal Sandbox settings)

### PayPal Sandbox Testing

1. Go to PayPal Sandbox Settings
2. Toggle "Use Sandbox" to enabled
3. Create test buyer and seller accounts
4. Use test accounts for subscription approvals
5. Monitor webhook deliveries in PayPal dashboard
6. Logs are available in `/api/paypal/webhook` debug output

## Webhook Signature Verification

Currently the webhook handler accepts all requests. For production:

1. Install PayPal SDK: `npm install @paypal/checkout-server-sdk`
2. Implement webhook verification:

```javascript
import { PayPalEnvironment, PayPalHttpClient } from '@paypal/checkout-server-sdk';

const environment = new PayPalEnvironment.Sandbox(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);

const client = new PayPalHttpClient(environment);

async function verifyWebhookSignature(body, headers) {
  const request = new signatureVerification.VerifyWebhookSignatureRequest(
    body,
    headers,
    process.env.PAYPAL_WEBHOOK_ID
  );
  
  const response = await client.execute(request);
  return response.result.verification_status === 'SUCCESS';
}
```

## Monitoring & Logging

### API Logger Configuration

Logs are written to the console with Morgan middleware. Set log level in `.env`:

```env
LOG_LEVEL=info  # error, warn, info, debug
```

### PayPal Webhook Logs

Monitor webhook processing:
- Logs all incoming webhooks with event type and user ID
- Logs subscription creation/cancellation
- Logs any signature verification failures
- Available in API container logs

### PocketBase Logs

View PocketBase activity:
- Admin UI: http://localhost:8090/_/
- Database activity tab
- User authentication logs

## Production Considerations

1. **Environment Variables**: Use secure secret management (AWS Secrets Manager, HashiCorp Vault, etc.)
2. **Webhook Verification**: Implement full PayPal signature verification
3. **SSL/TLS**: Webhooks require HTTPS (not localhost)
4. **Rate Limiting**: Implement rate limits on subscription endpoints
5. **Database Backups**: Regular backups of PocketBase SQLite database
6. **Monitoring**: Set up alerts for failed webhook deliveries
7. **Subscription Sync**: Consider periodic sync job to verify subscription status with PayPal
8. **PCI Compliance**: No credit card data handled - delegated to PayPal

## Troubleshooting

### Webhook Not Triggering
- Check PayPal webhook deliveries in dashboard
- Verify endpoint URL is publicly accessible
- Confirm `PAYPAL_WEBHOOK_ID` is set correctly
- Check API logs for errors

### Subscription Not Updating User Tier
- Verify webhook is being received (check logs)
- Check that custom_id is passed in subscription creation
- Verify user exists in PocketBase
- Check subscription table has records with correct user IDs

### Download Route Returns 403
- Verify user has active subscription in database
- Check subscription status = 'active'
- Verify subscription plan tier is VIP or higher
- Test with Bearer token authentication

### Payment Processing Issues
- Verify PayPal credentials are correct (sandbox vs live)
- Check plan IDs match PayPal business account
- Test webhook with PayPal's webhook simulator
- Review PayPal transaction logs in business account

## API Reference Summary

| Endpoint | Method | Auth | Requires Subscription | Description |
|----------|--------|------|----------------------|-------------|
| `/subscriptions/status` | GET | Yes | No | Get current subscription |
| `/subscriptions/tier` | GET | Yes | No | Get current tier |
| `/products` | GET | No | No | List products |
| `/products/:id` | GET | No | No | Get product details |
| `/products/:id/download` | GET | Yes | Yes (VIP+) | Download product file |
| `/paypal/webhook` | POST | No | No | Webhook receiver |

## Next Steps

1. Configure PayPal credentials in `.env`
2. Set up webhook in PayPal dashboard
3. Test subscription flow end-to-end
4. Implement webhook signature verification
5. Add email notifications for subscription events
6. Set up subscription management page for users
7. Implement subscription metrics tracking
