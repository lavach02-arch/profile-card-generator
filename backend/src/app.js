import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import profileRoutes from './routes/profileRoutes.js';
import {
  renderCardPage,
  renderCardEmbed,
  renderCardSvg,
} from './controllers/profileController.js';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'user-profile-card-generator',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount Profile REST API
app.use('/api/profiles', profileRoutes);

// Standalone Card Render Endpoints (SSR HTML / Embed / SVG Badge)
app.get('/cards/:id', renderCardPage);
app.get('/cards/:id/embed', renderCardEmbed);
app.get('/cards/:id/svg', renderCardSvg);
app.get('/p/:id', renderCardPage);

// Serve static frontend assets (supports root public or frontend/public)
const rootPublicPath = path.resolve(__dirname, '../../public');
const frontendPublicPath = path.resolve(__dirname, '../../frontend/public');
const publicPath = fs.existsSync(rootPublicPath) ? rootPublicPath : frontendPublicPath;
app.use(express.static(publicPath));

// Fallback to index.html for client-side navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/cards/') || req.path.startsWith('/p/')) {
    return next();
  }
  const indexPath = path.join(publicPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

// 404 Not Found Handler for APIs
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
  });
});

export default app;
