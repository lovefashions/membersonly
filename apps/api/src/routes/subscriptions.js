import express from 'express';
import { getUserTier, getActiveSubscription } from '../utils/subscriptionAccess.js';
import authMiddleware from '../middleware/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Apply authentication middleware to all subscription routes
router.use(authMiddleware);

// GET /subscriptions/status - Get user's subscription status
router.get('/status', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const tier = await getUserTier(userId);
    const subscription = await getActiveSubscription(userId);

    if (subscription) {
      return res.json({
        hasActiveSubscription: true,
        tier,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          paymentProvider: subscription.paymentProvider,
          planId: subscription.plan,
        },
      });
    } else {
      return res.json({
        hasActiveSubscription: false,
        tier: 'fan',
        subscription: null,
      });
    }
  } catch (error) {
    logger.error('Error fetching subscription status:', error);
    res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
});

// GET /subscriptions/tier - Get user's current tier
router.get('/tier', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found' });
    }

    const tier = await getUserTier(userId);
    res.json({ tier });
  } catch (error) {
    logger.error('Error fetching user tier:', error);
    res.status(500).json({ error: 'Failed to fetch user tier' });
  }
});

export default router;

