import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';

import { authRouter } from './routes/auth';
import { signalRouter } from './routes/signals';
import { botRouter } from './routes/bot';
import { tradeRouter } from './routes/trades';
import { validationRouter } from './routes/validation';
import { subscriptionRouter } from './routes/subscriptions';
import { nowpaymentsRouter } from './routes/nowpayments';
import { performanceRouter } from './routes/performance';
import { assetRouter } from './routes/assets';
import { adminRouter } from './routes/admin';
import { errorHandler } from './middleware/errorHandler';
import { initializeWebSocket } from './websocket';
import { initializeRedis } from './services/redis';
import { initializeSignalMonitor } from './services/signalMonitor';
import { prisma } from './lib/prisma';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// ============================================================================
// Middleware
// ============================================================================

// CORS must be FIRST — before helmet, rate-limiters, and everything else
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://marketsignals24.com',
  'https://www.marketsignals24.com',
  'http://localhost:3000',
].filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400, // Cache preflight for 24h
};

// Handle OPTIONS preflight globally — BEFORE any other middleware
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false,
}));
app.use(morgan('dev'));

// Stripe webhook needs raw body for signature verification — must come BEFORE express.json()
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting — skip OPTIONS preflight to avoid blocking CORS
const skipOptions = (req: express.Request) => req.method === 'OPTIONS';

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOptions,
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts, please try again later.' },
  skip: skipOptions,
});

app.use('/api/', apiLimiter);
// Apply strict auth limiter only to sensitive POST endpoints, NOT GET /auth/me
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/google', authLimiter);

// ============================================================================
// Routes
// ============================================================================

app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/signals', signalRouter);
app.use('/api/bot', botRouter);
app.use('/api/trades', tradeRouter);
app.use('/api/validation', validationRouter);
app.use('/api/subscriptions', subscriptionRouter);
app.use('/api/nowpayments', nowpaymentsRouter);
app.use('/api/performance', performanceRouter);
app.use('/api/assets', assetRouter);
app.use('/api/admin', adminRouter);

// Error handler (must be last)
app.use(errorHandler);

// ============================================================================
// Auto-seed subscription plans (ensures plans exist in production DB)
// ============================================================================

async function seedPlans() {
  const planData = [
    { slug: 'pass-24h', name: 'Pass 24h', priceEur: 6, durationDays: 1, sortOrder: 1, stripePriceId: 'price_1T5LVF8uXGeIyMMqbiHBpsFh' },
    { slug: 'pass-48h', name: 'Pass 48h', priceEur: 10, durationDays: 2, sortOrder: 2, stripePriceId: 'price_1T5M4u8uXGeIyMMqcQgTyCol' },
    { slug: 'weekly', name: 'Hebdomadaire', priceEur: 25, durationDays: 7, sortOrder: 3, stripePriceId: 'price_1T5Laa8uXGeIyMMqw7ia4HOp' },
    { slug: 'monthly', name: 'Mensuel', priceEur: 85, durationDays: 30, sortOrder: 4, stripePriceId: 'price_1T5LbF8uXGeIyMMq1Du3EpUL' },
  ];

  for (const p of planData) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: p.slug },
      update: { priceEur: p.priceEur, stripePriceId: p.stripePriceId, sortOrder: p.sortOrder },
      create: {
        name: p.name,
        slug: p.slug,
        priceEur: p.priceEur,
        durationDays: p.durationDays,
        sortOrder: p.sortOrder,
        stripePriceId: p.stripePriceId,
        features: JSON.stringify({ signals: true, bot: true, dashboard: true }),
      },
    });
  }
  console.log('✅ Subscription plans seeded');
}

// ============================================================================
// Start Server
// ============================================================================

async function start() {
  try {
    // Initialize Redis
    await initializeRedis();
    console.log('✅ Redis connected');

    // Auto-seed subscription plans
    await seedPlans();

    // Initialize WebSocket
    initializeWebSocket(server);
    console.log('Ã¢Å“â€¦ WebSocket initialized');

    // Initialize Signal Monitor (anti-fake system)
    initializeSignalMonitor();
    console.log('Ã¢Å“â€¦ Signal Monitor initialized');

    server.listen(PORT, () => {
      console.log(`\nÃ°Å¸Å¡â‚¬ Market Signals24 API Server running on port ${PORT}`);
      console.log(`Ã°Å¸â€œÂ¡ WebSocket server ready`);
      console.log(`Ã°Å¸Å’Â Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`Ã°Å¸â€œÅ  Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('Ã¢ÂÅ’ Failed to start server:', error);
    process.exit(1);
  }
}

start();

export { app, server };
