import express from 'express';
import multer from 'multer';
import pb from '../utils/pocketbase.js';
import logger from '../utils/logger.js';
import authMiddleware from '../middleware/auth.js';
import { requireSubscription } from '../utils/subscriptionAccess.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF, ZIP, and other common file types
    const allowedTypes = [
      'application/pdf',
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, ZIP, DOC, and DOCX files are allowed.'), false);
    }
  }
});

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

// POST /products - Create a new product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, active, gelatoProductId, variants } = req.body;

    // Validation
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name, price' });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }

    // Create product record
    const product = await pb.collection('products').create({
      name,
      description: description || '',
      price,
      active: active !== undefined ? active : true,
      gelatoProductId: gelatoProductId || null,
      variants: variants || {},
    });

    logger.info(`Product created: ${product.id}`);
    res.status(201).json({ success: true, product });
  } catch (error) {
    logger.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PATCH /products/:id - Update a product
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate price if provided
    if (updates.price !== undefined) {
      if (typeof updates.price !== 'number' || updates.price < 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
    }

    const product = await pb.collection('products').update(id, updates);
    logger.info(`Product updated: ${id}`);
    res.json({ success: true, product });
  } catch (error) {
    logger.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /products/:id - Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pb.collection('products').delete(id);
    logger.info(`Product deleted: ${id}`);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    logger.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// GET /products/:id/download - Secure download for purchased products
router.get('/:id/download', authMiddleware, requireSubscription('vip'), async (req, res) => {
  try {
    const { id } = req.params;

    // Get product
    const product = await pb.collection('products').getOne(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.downloadFile) {
      return res.status(404).json({ error: 'No download file available for this product' });
    }

    // User has access - redirect to file download
    const fileUrl = pb.files.getUrl(product, product.downloadFile);
    res.redirect(fileUrl);
  } catch (error) {
    logger.error('Error downloading product:', error);
    res.status(500).json({ error: 'Failed to download product' });
  }
});

export default router;