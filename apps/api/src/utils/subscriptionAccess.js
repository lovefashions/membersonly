import pb from '../utils/pocketbase.js';

/**
 * Check if user has active subscription for a specific tier
 * @param {string} userId - User ID from auth
 * @param {string} requiredTier - Required tier: 'fan', 'vip', 'elite'
 * @returns {Promise<boolean>} True if user has active subscription at or above required tier
 */
export async function hasActiveSubscription(userId, requiredTier = 'fan') {
  try {
    const tierHierarchy = { fan: 0, vip: 1, elite: 2 };
    const requiredLevel = tierHierarchy[requiredTier] || 0;

    // Check for active subscription in subscriptions table
    const subscriptions = await pb.collection('subscriptions').getList(1, 1, {
      filter: `user="${userId}" && status="active"`,
      expand: 'plan',
    });

    if (subscriptions.items.length > 0) {
      const subscription = subscriptions.items[0];
      const plan = subscription.expand?.plan;
      const userTierLevel = tierHierarchy[plan?.tier] || 0;

      return userTierLevel >= requiredLevel;
    }

    // Fallback to profiles.tier if subscriptions table doesn't have an active record
    const profiles = await pb.collection('profiles').getList(1, 1, {
      filter: `user="${userId}"`,
    });

    if (profiles.items.length > 0) {
      const profile = profiles.items[0];
      const userTierLevel = tierHierarchy[profile.tier?.toLowerCase()] || 0;
      return userTierLevel >= requiredLevel;
    }

    return false;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

/**
 * Get user's current active subscription details
 * @param {string} userId - User ID from auth
 * @returns {Promise<object|null>} Subscription object or null if not found
 */
export async function getActiveSubscription(userId) {
  try {
    const subscriptions = await pb.collection('subscriptions').getList(1, 1, {
      filter: `user="${userId}" && status="active"`,
      expand: 'plan',
    });

    if (subscriptions.items.length > 0) {
      return subscriptions.items[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

/**
 * Get user's current tier from either subscriptions or profiles
 * @param {string} userId - User ID from auth
 * @returns {Promise<string>} Tier name: 'fan', 'vip', 'elite', or 'free'
 */
export async function getUserTier(userId) {
  try {
    // Check subscriptions table first
    const subscriptions = await pb.collection('subscriptions').getList(1, 1, {
      filter: `user="${userId}" && status="active"`,
      expand: 'plan',
    });

    if (subscriptions.items.length > 0) {
      const plan = subscriptions.items[0].expand?.plan;
      return plan?.tier || 'fan';
    }

    // Fallback to profiles table
    const profiles = await pb.collection('profiles').getList(1, 1, {
      filter: `user="${userId}"`,
    });

    if (profiles.items.length > 0) {
      return profiles.items[0].tier?.toLowerCase() || 'fan';
    }

    return 'fan';
  } catch (error) {
    console.error('Error getting user tier:', error);
    return 'fan';
  }
}

/**
 * Middleware to check subscription status
 * @param {string} requiredTier - Required tier: 'fan', 'vip', 'elite'
 * @returns {Function} Express middleware
 */
export function requireSubscription(requiredTier = 'fan') {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const hasAccess = await hasActiveSubscription(req.user.id, requiredTier);

      if (!hasAccess) {
        return res.status(403).json({
          error: `${requiredTier} subscription required`,
          requiredTier,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ error: 'Subscription verification failed' });
    }
  };
}
