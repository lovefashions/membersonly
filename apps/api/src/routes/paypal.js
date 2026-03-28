import express from 'express';
import pb from '../utils/pocketbase.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Map PayPal plan IDs to tiers
const planTierMap = {
  'L3MKECMJ7PA52': 'fan',
  'E23D4H78JSZCY': 'vip',
  'CPNYX2PLPG6CU': 'elite',
};

// PayPal webhook verification (simplified - in production use proper signature verification)
const verifyPayPalWebhook = (req) => {
  // In production, verify webhook signature using PayPal SDK
  // For now, just check if it's a valid request
  return true;
};

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    // Verify webhook (implement proper verification in production)
    if (!verifyPayPalWebhook(req)) {
      logger.warn('Invalid PayPal webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString());
    logger.info('PayPal webhook received:', event.event_type);

    // Handle different subscription events
    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.RE-ACTIVATED':
        await handleSubscriptionActivated(event);
        break;

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionCancelled(event);
        break;

      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(event);
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

async function handleSubscriptionActivated(event) {
  const subscription = event.resource;
  const planId = subscription.plan_id;
  const subscriber = subscription.subscriber;

  // Get tier from plan ID
  const tier = planTierMap[planId];
  if (!tier) {
    logger.warn('Unknown plan ID:', planId);
    return;
  }

  // Find user by email or custom_id
  let userEmail = subscriber.email_address;
  let customId = subscription.custom_id; // If set during button creation

  if (customId) {
    // custom_id could be user ID
    try {
      const profile = await pb.collection('profiles').getOne(customId);
      await pb.collection('profiles').update(customId, { tier });
      logger.info(`Updated tier to ${tier} for user ${customId}`);
    } catch (error) {
      logger.error('Failed to update profile by custom_id:', error);
    }
  } else if (userEmail) {
    // Find profile by email
    try {
      const profiles = await pb.collection('profiles').getList(1, 1, {
        filter: `email="${userEmail}"`
      });

      if (profiles.items.length > 0) {
        const profile = profiles.items[0];
        await pb.collection('profiles').update(profile.id, { tier });
        logger.info(`Updated tier to ${tier} for user ${userEmail}`);
      } else {
        logger.warn('Profile not found for email:', userEmail);
      }
    } catch (error) {
      logger.error('Failed to update profile by email:', error);
    }
  }
}

async function handleSubscriptionCancelled(event) {
  const subscription = event.resource;
  const subscriber = subscription.subscriber;
  const customId = subscription.custom_id;

  if (customId) {
    try {
      const profile = await pb.collection('profiles').getOne(customId);
      await pb.collection('profiles').update(customId, { tier: 'fan' });
      logger.info(`Subscription cancelled, tier reset to fan for user ${customId}`);
    } catch (error) {
      logger.error('Failed to update profile on cancellation:', error);
    }
  } else if (subscriber?.email_address) {
    try {
      const profiles = await pb.collection('profiles').getList(1, 1, {
        filter: `email="${subscriber.email_address}"`
      });

      if (profiles.items.length > 0) {
        const profile = profiles.items[0];
        await pb.collection('profiles').update(profile.id, { tier: 'fan' });
        logger.info(`Subscription cancelled, tier reset to fan for user ${subscriber.email_address}`);
      }
    } catch (error) {
      logger.error('Failed to update profile by email on cancellation:', error);
    }
  }
}

async function handlePaymentCompleted(event) {
  // Handle successful payments if needed
  logger.info('Payment completed:', event.resource.id);
}

export default router;