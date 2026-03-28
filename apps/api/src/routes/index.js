import { Router } from 'express';
import productsRouter from './products.js';
import checkoutRouter from './checkout.js';
import paypalRouter from './paypal.js';
import subscriptionsRouter from './subscriptions.js';
import billingRouter from './billing.js';
import healthCheckHandler from './health-check.js';

const apiRouter = Router();

apiRouter.get('/health-check', healthCheckHandler);
apiRouter.use('/products', productsRouter);
apiRouter.use('/checkout', checkoutRouter);
apiRouter.use('/paypal', paypalRouter);
apiRouter.use('/subscriptions', subscriptionsRouter);
apiRouter.use('/billing', billingRouter);

export default apiRouter;