import express from 'express';
import pb from '../utils/pocketbase.js';
import authMiddleware from '../middleware/auth.js';
import logger from '../utils/logger.js';
import { createPayPalSubscription, verifyPayPalWebhookSignature } from '../utils/paypalClient.js';

const router = express.Router();

// Tier to rank mapping
const tierRankMap = {
  fan: 1,
  vip: 2,
  elite: 3,
};

// ============================================================================
// GET /api/billing/plans
// Returns all active plans sorted by rank
// ============================================================================
router.get('/plans', async (req, res) => {
  try {
    const plans = await pb.collection('plans').getFullList({
      filter: 'active = true',
      sort: '+rank',
    });

    const formattedPlans = plans.map((plan) => ({
      slug: plan.tier,
      name: plan.name,
      description: plan.description,
      price_monthly: plan.price,
      trial_days: 14,
      rank: tierRankMap[plan.tier] || 0,
      features: plan.features || [],
      paypal_plan_id: plan.paypalPlanId,
    }));

    res.json(formattedPlans);
  } catch (error) {
    logger.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// ============================================================================
// POST /api/billing/create-subscription
// Create a PayPal subscription and store in PocketBase
// ============================================================================
router.post('/create-subscription', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { plan_slug } = req.body;

    // Validate plan slug
    if (!['fan', 'vip', 'elite'].includes(plan_slug)) {
      return res.status(400).json({ error: 'Invalid plan slug' });
    }

    // Get plan details from PocketBase
    const plan = await pb.collection('plans').getFirstListItem(`tier = "${plan_slug}"`);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Create PayPal subscription with 14-day trial
    const paypalResponse = await createPayPalSubscription({
      plan_id: plan.paypalPlanId,
      email: req.user.email,
      custom_id: userId,
    });

    if (!paypalResponse.success) {
      logger.error('PayPal subscription creation failed:', paypalResponse.error);
      return res.status(400).json({ error: 'Failed to create PayPal subscription' });
    }

    // Calculate trial end and period end dates (14-day trial)
    const now = new Date();
    const trialEnds = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const periodEnds = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Create subscription record in PocketBase
    const subscription = await pb.collection('subscriptions').create({
      user: userId,
      plan: plan.id,
      status: 'pending', // Will be 'active' once webhook fires
      startDate: new Date().toISOString().split('T')[0],
      trialEndsAt: trialEnds.toISOString(),
      currentPeriodEnd: periodEnds.toISOString(),
      paymentProvider: 'paypal',
      providerSubscriptionId: paypalResponse.subscription_id,
      providerCustomerId: paypalResponse.customer_id,
    });

    // Create/update entitlements record
    const rank = tierRankMap[plan_slug];
    await pb.collection('entitlements').update(userId, {
      user: userId,
      max_rank: rank,
      active: false, // Will be set to true on webhook confirmation
      reason: 'trial',
    }).catch(async () => {
      // If update fails, create new record
      await pb.collection('entitlements').create({
        user: userId,
        max_rank: rank,
        active: false,
        reason: 'trial',
      });
    });

    logger.info(`Subscription created for user ${userId}, plan: ${plan_slug}`);

    res.json({
      success: true,
      subscription_id: subscription.id,
      approval_url: paypalResponse.approval_url,
      provider_subscription_id: paypalResponse.subscription_id,
    });
  } catch (error) {
    logger.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// ============================================================================
// POST /api/billing/paypal/webhook
// PayPal webhook handler with signature verification
// ============================================================================
router.post('/paypal/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const transmissionId = req.headers['paypal-transmission-id'];
  const transmissionTime = req.headers['paypal-transmission-time'];
  const certUrl = req.headers['paypal-cert-url'];
  const authAlgo = req.headers['paypal-auth-algo'];
  const transmissionSig = req.headers['paypal-transmission-sig'];

  // Verify webhook signature
  const isValid = await verifyPayPalWebhookSignature({
    transmission_id: transmissionId,
    transmission_time: transmissionTime,
    cert_url: certUrl,
    auth_algo: authAlgo,
    transmission_sig: transmissionSig,
    webhook_id: process.env.PAYPAL_WEBHOOK_ID,
    body: req.body,
  });

  if (!isValid) {
    logger.warn('Invalid PayPal webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  try {
    const event = JSON.parse(req.body.toString());
    logger.info('PayPal webhook received:', event.event_type);

    // Handle different subscription events
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.TRIALING':
        await handleSubscriptionActivated(event);
        break;

      case 'BILLING.SUBSCRIPTION.PAYMENT.SUCCESS':
        await handlePaymentSuccess(event);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await handleSubscriptionCancelled(event);
        break;

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.PAST_DUE':
        await handleSubscriptionSuspended(event);
        break;

      default:
        logger.info('Unhandled PayPal event:', event.event_type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('PayPal webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ============================================================================
// Handler Functions
// ============================================================================

async function handleSubscriptionActivated(event) {
  const subscription = event.resource;
  const subscriptionId = subscription.id;

  try {
    // Find subscription record by provider_subscription_id
    const dbSubscription = await pb.collection('subscriptions').getFirstListItem(
      `providerSubscriptionId = "${subscriptionId}"`
    );

    if (!dbSubscription) {
      logger.warn(`No subscription found for PayPal ID: ${subscriptionId}`);
      return;
    }

    const userId = dbSubscription.user;
    const currentPeriodEnd = subscription.billing_cycles[0]?.expiration_time || new Date();

    // Update subscription status
    await pb.collection('subscriptions').update(dbSubscription.id, {
      status: 'active',
      currentPeriodEnd: new Date(currentPeriodEnd).toISOString(),
    });

    // Update entitlements
    const plan = await pb.collection('plans').getOne(dbSubscription.plan);
    const rank = tierRankMap[plan.tier];

    await pb.collection('entitlements').update(userId, {
      max_rank: rank,
      active: true,
      reason: 'paid',
    });

    logger.info(`Subscription activated: ${subscriptionId}, user: ${userId}`);
  } catch (error) {
    logger.error(`Error handling subscription activation: ${subscriptionId}`, error);
  }
}

async function handlePaymentSuccess(event) {
  const billing = event.resource;
  const subscriptionId = billing.subscription_id;

  try {
    const dbSubscription = await pb.collection('subscriptions').getFirstListItem(
      `providerSubscriptionId = "${subscriptionId}"`
    );

    if (!dbSubscription) {
      logger.warn(`No subscription found for PayPal ID: ${subscriptionId}`);
      return;
    }

    // Update current period end
    const nextBillingTime = billing.next_billing_time;
    await pb.collection('subscriptions').update(dbSubscription.id, {
      status: 'active',
      currentPeriodEnd: new Date(nextBillingTime).toISOString(),
    });

    logger.info(`Payment successful: ${subscriptionId}`);
  } catch (error) {
    logger.error(`Error handling payment success: ${subscriptionId}`, error);
  }
}

async function handleSubscriptionCancelled(event) {
  const subscription = event.resource;
  const subscriptionId = subscription.id;

  try {
    const dbSubscription = await pb.collection('subscriptions').getFirstListItem(
      `providerSubscriptionId = "${subscriptionId}"`
    );

    if (!dbSubscription) {
      logger.warn(`No subscription found for PayPal ID: ${subscriptionId}`);
      return;
    }

    const userId = dbSubscription.user;

    // Update subscription status
    await pb.collection('subscriptions').update(dbSubscription.id, {
      status: 'cancelled',
      endDate: new Date().toISOString().split('T')[0],
    });

    // Deactivate entitlements
    await pb.collection('entitlements').update(userId, {
      active: false,
      reason: 'cancelled',
    });

    logger.info(`Subscription cancelled: ${subscriptionId}, user: ${userId}`);
  } catch (error) {
    logger.error(`Error handling subscription cancellation: ${subscriptionId}`, error);
  }
}

async function handleSubscriptionSuspended(event) {
  const subscription = event.resource;
  const subscriptionId = subscription.id;

  try {
    const dbSubscription = await pb.collection('subscriptions').getFirstListItem(
      `providerSubscriptionId = "${subscriptionId}"`
    );

    if (!dbSubscription) {
      logger.warn(`No subscription found for PayPal ID: ${subscriptionId}`);
      return;
    }

    const userId = dbSubscription.user;

    // Update subscription status
    await pb.collection('subscriptions').update(dbSubscription.id, {
      status: 'suspended',
    });

    // Deactivate entitlements
    await pb.collection('entitlements').update(userId, {
      active: false,
      reason: 'suspended',
    });

    logger.info(`Subscription suspended: ${subscriptionId}, user: ${userId}`);
  } catch (error) {
    logger.error(`Error handling subscription suspension: ${subscriptionId}`, error);
  }
}

// ============================================================================
// POST /api/billing/test-webhook (Admin only)
// For testing PayPal webhook integration
// ============================================================================
router.post('/test-webhook', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    const isAdmin = req.user?.email === 'admin@applejucy.com' || req.user?.email === 'support@applejucy.com';
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { event_type = 'BILLING.SUBSCRIPTION.ACTIVATED' } = req.body;

    logger.info(`Test webhook triggered by ${req.user.email}: ${event_type}`);

    res.json({
      success: true,
      message: 'Test webhook queued. Check webhook logs in PayPal Dashboard for delivery status.',
      event_type,
      webhook_url: `${process.env.APP_URL}/api/billing/paypal/webhook`,
      test_instructions: 'Use PayPal Dashboard → Webhooks → Your endpoint → Resend to send a test event',
    });
  } catch (error) {
    logger.error('Error handling test webhook request:', error);
    res.status(500).json({ error: 'Failed to process test request' });
  }
});

export default router;
