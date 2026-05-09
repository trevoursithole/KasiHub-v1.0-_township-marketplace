// Load env vars FIRST before any other module touches process.env
require('dotenv').config();

const express          = require('express');
const cors             = require('cors');
const helmet           = require('helmet');
const morgan           = require('morgan');
const rateLimit        = require('express-rate-limit');
const path             = require('path');

const { initDb }       = require('./db/database');
const authRoutes       = require('./routes/auth');
const listingRoutes    = require('./routes/listings');
const apiRoutes        = require('./routes/api');

const app  = express();
const PORT = process.env.PORT || 4000;

/* ── Security middleware ─────────────────────────────────────────────── */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:4000',
  ],
  credentials: true,
}));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }));
app.use('/api',      rateLimit({ windowMs: 60 * 1000,      max: 300 }));

/* ── Body / logging ──────────────────────────────────────────────────── */
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

/* ── Static uploads ──────────────────────────────────────────────────── */
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/* ── API routes ──────────────────────────────────────────────────────── */
app.use('/api/auth',     authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api',          apiRoutes);

/* ── Health check ────────────────────────────────────────────────────── */
app.get('/health', (_req, res) => res.json({
  status:  'ok',
  service: 'KasiHub API',
  version: '1.0.0',
  env:     process.env.NODE_ENV || 'development',
  time:    new Date().toISOString(),
}));

/* ── Serve built React SPA ───────────────────────────────────────────── */
const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath));
// SPA fallback: any non-API request returns index.html
app.use((req, res, next) => {
  if (
    !req.path.startsWith('/api') &&
    !req.path.startsWith('/uploads') &&
    req.path !== '/health'
  ) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

/* ── Global error handler ────────────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

/* ── Boot ────────────────────────────────────────────────────────────── */
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🏪  KasiHub  →  http://localhost:${PORT}`);
      console.log(`    API      →  http://localhost:${PORT}/api`);
      console.log(`    Health   →  http://localhost:${PORT}/health\n`);
    });
  })
  .catch(err => {
    console.error('❌  Failed to initialise database:', err.message);
    process.exit(1);
  });

module.exports = app;
