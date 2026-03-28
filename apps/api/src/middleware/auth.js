import logger from '../utils/logger.js';
import pb from '../utils/pocketbase.js';

/**
 * Authentication middleware
 * Extracts Bearer token from Authorization header and verifies with PocketBase
 * Attaches user and token to req for downstream use
 */
export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      // Verify the token with PocketBase
      const authData = await pb.collection('users').authRefresh();

      // If we have a valid auth state, the user is authenticated
      if (pb.authStore.isValid && pb.authStore.model) {
        req.user = pb.authStore.model;
        req.token = token;
        next();
      } else {
        res.status(401).json({ error: 'Invalid token' });
      }
    } catch (error) {
      logger.warn('Token verification failed:', error.message);
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export default authMiddleware;
