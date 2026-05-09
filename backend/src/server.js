// Load .env file ONLY in development — in production, env vars come from the platform
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const morgan        = require('morgan');
const rateLimit     = require('express-rate-limit');
const path          = require('path');

const { initDb }    = require('./db/database');
const authRoutes    = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const apiRoutes     = require('./routes/api');

// ── Validate required env vars before anything else ───────────────────
const REQUIRED_ENV = ['JWT_SECRET'];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`\n❌  Missing required environment variables: ${missing.join(', ')}`);
  console.error(`    Set them in your .env file (local) or platform dashboard (production).\n`);
  process.exit(1);
}

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || '*',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:4000',
  ],
  credentials: true,
}));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false }));
app.use('/api',      rateLimit({ windowMs: 60 * 1000,      max: 300 }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Routes ────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api',          apiRoutes);

// ── Health ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({
  status:  'ok',
  service: 'KasiHub API',
  version: '1.0.0',
  env:     process.env.NODE_ENV || 'development',
  time:    new Date().toISOString(),
}));

// ── Serve React SPA ───────────────────────────────────────────────────
const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (!req.path.startsWith('/api') &&
      !req.path.startsWith('/uploads') &&
       req.path !== '/health') {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

// ── Error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Boot ──────────────────────────────────────────────────────────────
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n🏪  KasiHub  →  http://localhost:${PORT}`);
      console.log(`    Health   →  http://localhost:${PORT}/health`);
      console.log(`    Env      :  ${process.env.NODE_ENV || 'development'}\n`);
    });
  })
  .catch(err => {
    console.error('❌  DB init failed:', err.message);
    process.exit(1);
  });

module.exports = app;
