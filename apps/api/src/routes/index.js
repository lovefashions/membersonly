import { Router } from 'express';
import productsRouter from './products.js';
import checkoutRouter from './checkout.js';

const apiRouter = Router();

apiRouter.use('/products', productsRouter);
apiRouter.use('/checkout', checkoutRouter);

export default apiRouter;