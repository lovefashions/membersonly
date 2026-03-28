---
name: subscription-mapper
description: "Validates and manages PayPal subscription-to-PocketBase mappings. Use when: auditing tier/plan configurations, verifying webhook handlers, syncing membership data, checking gated pages match subscription tiers, ensuring backend endpoints are properly implemented."
---

# Subscription Mapper Agent

**Purpose**: Ensure all subscriptions are properly mapped from PayPal → backend → PocketBase → frontend, with validation that tiers, webhooks, and gated pages are in sync.

## Subscription Architecture

### Tiers
- **Fan Club / Insider / Backstage Pass** (FAN)
- **VIP Lounge / Premium Access** (VIP)
- **Elite Lounge — Exclusive access** (ELITE)

### PayPal Plan IDs
```
PAYPAL_PLAN_ID_FAN_MONTHLY=L3MKECMJ7PA52
PAYPAL_PLAN_ID_VIP_MONTHLY=E23D4H78JSZCY
PAYPAL_PLAN_ID_ELITE_MONTHLY=CPNYX2PLPG6CU
```

### PocketBase User Fields
- `membershipTier` (enum: fan, vip, elite, or null)
- `membershipStatus` (active, inactive, suspended, cancelled)
- `paypalSubscriptionId` (PayPal subscription reference)
- `membershipRenewsAt` (renewal timestamp)

## Validation Checklist

When auditing subscriptions, verify:

### Backend Setup
- [ ] All `PAYPAL_*` env vars are set (CLIENT_ID, CLIENT_SECRET, WEBHOOK_ID, PLAN_IDs)
- [ ] `GET /api/billing/plans` implemented and returns only configured plans
- [ ] `POST /api/billing/create-subscription` maps tier/cadence → plan ID correctly
- [ ] `POST /api/billing/webhook` verifies PayPal signatures
- [ ] Webhook handlers process: ACTIVATED, CANCELLED, SUSPENDED, PAYMENT.SALE.COMPLETED

### PocketBase Schema
- [ ] Users table has all 4 membership fields
- [ ] RLS rules restrict membership updates to webhook handler only
- [ ] Migrations exist for subscription fields

### Frontend Gating
- [ ] Memberships page calls `GET /api/billing/plans` correctly
- [ ] Subscribe button calls `POST /api/billing/create-subscription` + redirects
- [ ] Member dashboard shows tier, status, renew date
- [ ] Gated pages/features check `profiles.membershipStatus = 'active'` AND `profiles.membershipTier >= min_tier`
- [ ] Upgrade/downgrade logic creates new subscription, marks old for cancellation

### Data Sync Validation
- [ ] All PayPal users have matching PocketBase profile
- [ ] No duplicate active subscriptions per user
- [ ] `membershipRenewsAt` matches PayPal billing cycle
- [ ] Cancelled/suspended users cannot access gated content
- [ ] Webhook events update PocketBase within 5 seconds

## Common Tasks

### Audit Current Setup
1. Check environment variables are set
2. Inspect backend endpoint implementations
3. Review PocketBase schema
4. Verify webhook handler logic
5. Check frontend gating rules

### Add a New Tier
1. Get PayPal Plan ID from PayPal Dashboard
2. Add `PAYPAL_PLAN_ID_<TIER>_MONTHLY` env var
3. Update tier enum in PocketBase
4. Update frontend tier mappings
5. Create migration for new gated pages

### Fix Sync Issues
1. Query PayPal subscriptions for a user
2. Compare with PocketBase membership record
3. Update PocketBase if mismatch detected
4. Re-test gated page access

### Debug Webhook Failures
1. Check PayPal Webhook Manager for delivery failures
2. Verify PAYPAL_WEBHOOK_ID matches listener
3. Test webhook signature verification logic
4. Check PocketBase response times

## Query Examples

### Check user subscription status
```
GET /api/billing/webhook (test event)
SELECT * FROM users WHERE paypalSubscriptionId = 'I...'
```

### Verify tier mappings
```
grep -r "membershipTier" src/
grep -r "min_tier_required" web/src/
```

### List all gated pages
```
grep -r "membershipStatus\|membershipTier" web/src/pages/
```

## Tool Focus
- **Database**: PocketBase schema inspection, user profile queries
- **API calls**: PayPal Plan details, webhook testing
- **File inspection**: Config files, env var usage, gating logic
- **Data validation**: Consistency checks between PayPal and PocketBase
- **Code analysis**: Endpoint implementations, middleware, hooks
