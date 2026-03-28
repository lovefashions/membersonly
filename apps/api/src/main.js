import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';

import apiRouter from './routes/index.js';
import { errorMiddleware } from './middleware/index.js';
import logger from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Built frontend is at /dist/apps/web from the repo root
const frontendBuildPath = path.resolve(__dirname, '../../../dist/apps/web');

const app = express();

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection at:', promise, 'reason:', reason);
});

process.on('SIGINT', async () => {
  logger.info('Interrupted');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received');
  await new Promise(resolve => setTimeout(resolve, 3000));
  logger.info('Exiting');
  process.exit();
});

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy PocketBase — works on Railway (internal service URL) and Horizons (/hcgi/platform)
const pocketbaseUrl = process.env.POCKETBASE_URL || 'http://localhost:8090';
app.use('/hcgi/platform', createProxyMiddleware({
  target: pocketbaseUrl,
  changeOrigin: true,
  pathRewrite: { '^/hcgi/platform': '' },
  on: {
    error: (err, req, res) => {
      logger.error('PocketBase proxy error:', err.message);
      res.status(502).json({ error: 'PocketBase unavailable' });
    },
  },
}));

// API routes — accessible at both /api and /hcgi/api (Horizons compatibility)
app.use('/api', apiRouter);
app.use('/hcgi/api', apiRouter);

app.use(errorMiddleware);

// Serve built React frontend in production
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
}

// SPA catch-all: serve index.html for client-side routes; JSON 404 for unknown API paths
app.use((req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/hcgi/')) {
    return res.status(404).json({ error: 'Route not found' });
  }
  const indexPath = path.join(frontendBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(404).json({ error: 'Route not found' });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  logger.info(`🚀 API Server running on http://localhost:${port}`);
});

export default app;