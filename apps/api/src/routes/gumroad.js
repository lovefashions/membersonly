import express from 'express';
import pb from '../utils/pocketbase.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Map product_id to tier
const productTierMap = {
  'fan': 'fan',
  'vip': 'vip',
  'elite': 'elite',
};

router.post('/webhook', async (req, res) => {
  // Get expected secret from environment or fallback constant
  const expected = process.env.GUMROAD_WEBHOOK_SECRET || 'PUT_A_LONG_RANDOM_SECRET_HERE';

  // Check if secret is configured
  if (!expected) {
    logger.error('Webhook secret not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  // Validate webhook secret
  if (req.query.secret !== expected) {
    logger.warn('Invalid webhook secret provided');
    return res.status(401).json({ error: 'Invalid webhook secret' });
  }

  const { user_id, email, product_id, product_name } = req.body;

  // Priority: (1) user_id, (2) email
  if (!user_id && !email) {
    logger.warn('Missing user_id and email in webhook payload');
    return res.status(400).json({ error: 'Missing user_id and email in webhook payload' });
  }

  // Determine tier from product_id or product_name
  let tier = null;

  if (product_id) {
    tier = productTierMap[product_id.toLowerCase()];
  }

  if (!tier && product_name) {
    // Try to extract tier from product name (e.g., "Fan Plan" → "fan", "VIP Plan" → "vip", "Elite Plan" → "elite")
    const nameMatch = product_name.match(/(fan|vip|elite)/i);
    if (nameMatch) {
      tier = nameMatch[1].toLowerCase();
    }
  }

  if (!tier) {
    logger.warn(`Could not determine tier for product_id: ${product_id}, product_name: ${product_name}`);
    return res.status(400).json({ error: 'Could not determine tier from product information' });
  }

  // Lookup profile: priority (1) user_id, (2) email
  let records = [];

  if (user_id) {
    records = await pb.collection('profiles').getFullList({
      filter: `user_id="${user_id}"`,
    });
  }

  if (records.length === 0 && email) {
    records = await pb.collection('profiles').getFullList({
      filter: `email="${email}"`,
    });
  }

  if (records.length === 0) {
    logger.warn(`No profile found for user_id: ${user_id}, email: ${email}`);
    return res.status(400).json({ error: 'Profile not found' });
  }

  const profileId = records[0].id;

  await pb.collection('profiles').update(profileId, {
    tier: tier,
    status: 'active',
  });

  logger.info(`Updated profile ${profileId}: tier=${tier}, status=active (user_id: ${user_id}, email: ${email})`);

  res.json({ success: true });
});

export default router;