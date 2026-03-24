import express from 'express';
import pb from '../utils/pocketbase.js';
import logger from '../utils/logger.js';

const router = express.Router();

// GET /products - List products with pagination
router.get('/', async (req, res) => {
  const records = await pb.collection('products').getList(1, 50);
  res.json({ products: records.items || [] });
});

// GET /products/:id - Get product by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  const product = await pb.collection('products').getOne(id);

  if (!product) {
    logger.warn(`Product not found: ${id}`);
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({ product });
});

export default router;