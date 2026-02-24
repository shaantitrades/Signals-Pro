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
import { performanceRouter } from './routes/performance';
import { assetRouter } from './routes/assets';
import { errorHandler } from './middleware/errorHandler';
import { initializeWebSocket } from './websocket';
import { initializeRedis } from './services/redis';
import { initializeSignalMonitor } from './services/signalMonitor';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// ============================================================================
// Middleware
// ============================================================================

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts, please try again later.' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

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
app.use('/api/performance', performanceRouter);
app.use('/api/assets', assetRouter);

// Error handler (must be last)
app.use(errorHandler);

// ============================================================================
// Start Server
// ============================================================================

async function start() {
  try {
    // Initialize Redis
    await initializeRedis();
    console.log('Ã¢Å“â€¦ Redis connected');

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
