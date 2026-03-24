import express from 'express';
import logger from '../utils/logger.js';

const router = express.Router();

// POST /checkout - Create order
router.post('/', async (req, res) => {
  const { items, successUrl, cancelUrl } = req.body;

  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items must be a non-empty array' });
  }

  // Validate URLs
  if (!successUrl || typeof successUrl !== 'string') {
    return res.status(400).json({ error: 'successUrl must be a non-empty string' });
  }

  if (!cancelUrl || typeof cancelUrl !== 'string') {
    return res.status(400).json({ error: 'cancelUrl must be a non-empty string' });
  }

  logger.info(`Checkout request received with ${items.length} items`);

  // Placeholder response for future Gelato/Printful integration
  res.json({ orders: [] });
});

export default router;