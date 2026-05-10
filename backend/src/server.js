require('dotenv').config();

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

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }));
app.use('/api',      rateLimit({ windowMs: 60 * 1000, max: 300 }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth',     authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api',          apiRoutes);

app.get('/health', (_req, res) => res.json({
  status: 'ok', service: 'KasiHub API', version: '1.0.0',
  env: process.env.NODE_ENV || 'development', time: new Date().toISOString(),
}));

const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads') && req.path !== '/health') {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🏪  KasiHub → http://localhost:${PORT}\n`);
    console.log(`    JWT_SECRET set: ${!!process.env.JWT_SECRET}`);
  });
}).catch(err => { console.error('❌ DB init failed:', err.message); process.exit(1); });

module.exports = app;
