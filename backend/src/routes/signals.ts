import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, authorize, requireSubscription, AuthRequest } from '../middleware/auth';
import { getIO } from '../websocket';
import { getRedis } from '../services/redis';
import axios from 'axios';

const SIGNAL_ENGINE_URL = process.env.SIGNAL_ENGINE_URL || 'http://localhost:8000';

export const signalRouter = Router();

// ============================================================================
// Schemas
// ============================================================================

const createSignalSchema = z.object({
  asset: z.string().min(1),
  category: z.enum(['FOREX_OTC', 'FOREX', 'CRYPTO', 'INDICES', 'COMMODITIES']),
  action: z.enum(['BUY', 'SELL']),
  entryPrice: z.number().positive(),
  takeProfit1: z.number().positive(),
  takeProfit2: z.number().positive().optional(),
  takeProfit3: z.number().positive().optional(),
  stopLoss: z.number().positive(),
  timeframe: z.enum(['M1', 'M2', 'M3', 'M4', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1']),
  confidenceScore: z.number().min(0).max(100),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EXTREME']).optional(),
  analysis: z.string().optional(),
  marketContext: z.string().optional(),
  indicators: z.any().optional(),
  expiresAt: z.string().datetime().optional(),
});

const signalFiltersSchema = z.object({
  category: z.enum(['FOREX_OTC', 'FOREX', 'CRYPTO', 'INDICES', 'COMMODITIES']).optional(),
  asset: z.string().optional(),
  status: z.enum(['PENDING', 'ACTIVE', 'EXECUTED', 'TP1_HIT', 'TP2_HIT', 'TP3_HIT', 'SL_HIT', 'EXPIRED', 'CANCELLED', 'CLOSED']).optional(),
  timeframe: z.enum(['M1', 'M2', 'M3', 'M4', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1']).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EXTREME']).optional(),
  minConfidence: z.coerce.number().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'confidenceScore', 'pnlPips']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ============================================================================
// GET /api/signals - List signals with filters
// ============================================================================

signalRouter.get('/', authenticate, requireSubscription, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const filters = signalFiltersSchema.parse(req.query);
    const skip = (filters.page - 1) * filters.limit;

    const where: any = {};
    if (filters.category) where.category = filters.category;
    if (filters.asset) where.asset = { contains: filters.asset, mode: 'insensitive' };
    if (filters.status) where.status = filters.status;
    if (filters.timeframe) where.timeframe = filters.timeframe;
    if (filters.riskLevel) where.riskLevel = filters.riskLevel;
    if (filters.minConfidence) where.confidenceScore = { gte: filters.minConfidence };

    const [signals, total] = await Promise.all([
      prisma.signal.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy: { [filters.sortBy]: filters.sortOrder },
        include: {
          validations: {
            select: {
              validationType: true,
              result: true,
              confidenceScore: true,
              createdAt: true,
            },
          },
          _count: {
            select: { userTrades: true },
          },
        },
      }),
      prisma.signal.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        signals,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/signals/generate/:category/:asset/:timeframe - Fast Signal Generation
// Proxies to signal engine for real-time signal detection (< 30 seconds)
// Primary use: "Start Signals" feature (like realtimetradesignals.com)
// ============================================================================

const generateSignalSchema = z.object({
  category: z.enum(['FOREX_OTC', 'FOREX', 'CRYPTO', 'INDICES', 'COMMODITIES']),
  asset: z.string().min(1),
  timeframe: z.enum(['M1', 'M2', 'M3', 'M4', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1']),
});

signalRouter.get('/generate/:category/:asset/:timeframe', authenticate, requireSubscription, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { category, asset, timeframe } = generateSignalSchema.parse(req.params);

    // Call signal engine's fast signal endpoint
    const engineResponse = await axios.get(
      `${SIGNAL_ENGINE_URL}/signals/fast/${category}/${asset}/${timeframe}`,
      { timeout: 30000 }
    );

    const result = engineResponse.data;

    if (!result.signal) {
      return res.json({
        success: true,
        data: null,
        message: result.message || 'No signal found',
      });
    }

    // Auto-save the generated signal to DB
    const signal = result.signal;
    const saved = await prisma.signal.create({
      data: {
        asset: signal.asset,
        category: signal.category,
        action: signal.action,
        entryPrice: signal.entry_price,
        takeProfit1: signal.tp1,
        takeProfit2: signal.tp2,
        takeProfit3: signal.tp3,
        stopLoss: signal.sl,
        timeframe: signal.timeframe,
        confidenceScore: signal.confidence,
        riskLevel: signal.risk_level,
        analysis: signal.reasoning,
        status: 'ACTIVE',
        validationStatus: 'FULLY_VALIDATED',
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      },
    });

    // Emit via WebSocket
    const io = getIO();
    io?.to('signals').emit('signal:new', {
      id: saved.id,
      asset: saved.asset,
      category: saved.category,
      action: saved.action,
      entryPrice: saved.entryPrice,
      takeProfit1: saved.takeProfit1,
      stopLoss: saved.stopLoss,
      confidenceScore: saved.confidenceScore,
      riskLevel: saved.riskLevel,
      timeframe: saved.timeframe,
      status: saved.status,
    });

    // Invalidate cache
    const redis = getRedis();
    await redis?.del('active_signals');

    res.json({
      success: true,
      data: {
        ...saved,
        indicators: signal.indicators || [],
      },
      source_timeframe: result.source_timeframe,
      fast_mode: true,
    });
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED') {
      return next(new AppError('Signal engine is not running. Please start it.', 503));
    }
    if (error.code === 'ETIMEDOUT') {
      return next(new AppError('Signal generation timed out. Try again.', 504));
    }
    next(error);
  }
});

// ============================================================================
// GET /api/signals/active - Get active signals
// ============================================================================

signalRouter.get('/active', authenticate, requireSubscription, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Try Redis cache first
    const redis = getRedis();
    const cached = await redis?.get('active_signals');
    if (cached) {
      return res.json({
        success: true,
        data: JSON.parse(cached),
        source: 'cache',
      });
    }

    const activeSignals = await prisma.signal.findMany({
      where: {
        status: { in: ['ACTIVE', 'EXECUTED', 'TP1_HIT', 'TP2_HIT'] },
        validationStatus: 'FULLY_VALIDATED',
      },
      orderBy: { createdAt: 'desc' },
      include: {
        validations: {
          select: {
            validationType: true,
            result: true,
            confidenceScore: true,
          },
        },
      },
    });

    // Cache for 10 seconds
    await redis?.setex('active_signals', 10, JSON.stringify(activeSignals));

    res.json({
      success: true,
      data: activeSignals,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/signals/prices - Live prices proxy to signal-engine
// No auth required — used by frontend to update current prices in real time
// ============================================================================

signalRouter.get('/prices', async (req: any, res: Response, next: NextFunction) => {
  try {
    const assets = req.query.assets as string;
    if (!assets) {
      return res.json({ prices: {} });
    }
    const { data } = await axios.get(`${SIGNAL_ENGINE_URL}/prices/`, {
      params: { assets },
      timeout: 15000,
    });
    res.json(data);
  } catch (error: any) {
    // If signal-engine is down, return empty prices instead of 500
    console.warn('Price fetch from signal-engine failed:', error.message);
    res.json({ prices: {} });
  }
});

// ============================================================================
// GET /api/signals/recent - Public endpoint for recent signals from DB
// No auth required — serves signals already saved by the scheduler
// ============================================================================

signalRouter.get('/recent', async (req: any, res: Response, next: NextFunction) => {
  try {
    const category = req.query.category as string | undefined;
    const minConfidence = req.query.min_confidence ? parseFloat(req.query.min_confidence as string) : undefined;
    const limit = Math.min(parseInt(req.query.limit as string || '50', 10), 100);

    // Build filter: recent signals (last 48h) that are active/validated
    const where: any = {
      status: { in: ['ACTIVE', 'EXECUTED', 'TP1_HIT', 'TP2_HIT', 'PENDING'] },
      createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
    };

    if (category) where.category = category;
    if (minConfidence) where.confidenceScore = { gte: minConfidence };

    const signals = await prisma.signal.findMany({
      where,
      distinct: ['asset'],
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Map DB fields to signal-engine response format for frontend compatibility
    res.json({
      success: true,
      signals: signals.map((s: any) => ({
        id: s.id,
        asset: s.asset,
        category: s.category,
        action: s.action,
        entry_price: Number(s.entryPrice),
        tp1: Number(s.takeProfit1),
        tp2: s.takeProfit2 ? Number(s.takeProfit2) : null,
        tp3: s.takeProfit3 ? Number(s.takeProfit3) : null,
        sl: Number(s.stopLoss),
        confidence: s.confidenceScore,
        risk_level: s.riskLevel,
        timeframe: s.timeframe,
        status: s.status,
        pnl_pips: s.pnlPips || 0,
        reasoning: s.analysis,
        created_at: s.createdAt.toISOString(),
        indicators: [],
      })),
      source: 'database',
      total: signals.length,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/signals/:id - Get signal detail
// ============================================================================

signalRouter.get('/:id', authenticate, requireSubscription, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const signal = await prisma.signal.findUnique({
      where: { id: req.params.id },
      include: {
        validations: true,
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: {
          select: { userTrades: true },
        },
      },
    });

    if (!signal) {
      throw new AppError('Signal not found', 404);
    }

    res.json({
      success: true,
      data: signal,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST /api/signals - Create signal (Admin/Validator only)
// ============================================================================

signalRouter.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'VALIDATOR'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = createSignalSchema.parse(req.body);

    // Verify asset exists
    const asset = await prisma.asset.findFirst({
      where: { symbol: data.asset, isActive: true },
    });
    if (!asset) {
      throw new AppError(`Asset ${data.asset} not found or inactive`, 400);
    }

    // Create signal
    const signal = await prisma.signal.create({
      data: {
        asset: data.asset,
        category: data.category,
        action: data.action,
        entryPrice: data.entryPrice,
        takeProfit1: data.takeProfit1,
        takeProfit2: data.takeProfit2,
        takeProfit3: data.takeProfit3,
        stopLoss: data.stopLoss,
        timeframe: data.timeframe,
        confidenceScore: data.confidenceScore,
        riskLevel: data.riskLevel || 'MEDIUM',
        analysis: data.analysis,
        marketContext: data.marketContext,
        indicators: data.indicators,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        status: 'PENDING',
        validationStatus: 'PENDING_AI',
      },
    });

    // Create audit log
    await prisma.signalAuditLog.create({
      data: {
        signalId: signal.id,
        action: 'created',
        userId: req.user!.id,
        details: JSON.stringify({ source: 'manual', ip: req.ip }),
      },
    });

    // Emit to WebSocket for real-time update
    const io = getIO();
    io?.to('signals').emit('signal:new', {
      id: signal.id,
      asset: signal.asset,
      category: signal.category,
      action: signal.action,
      confidenceScore: signal.confidenceScore,
      status: signal.status,
    });

    // Invalidate cache
    const redis = getRedis();
    await redis?.del('active_signals');

    res.status(201).json({
      success: true,
      data: signal,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// ============================================================================
// PATCH /api/signals/:id - Update signal
// ============================================================================

signalRouter.patch('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'VALIDATOR'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const signal = await prisma.signal.findUnique({
      where: { id: req.params.id },
    });

    if (!signal) {
      throw new AppError('Signal not found', 404);
    }

    const updatedSignal = await prisma.signal.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        updatedAt: new Date(),
      },
    });

    // Audit log
    await prisma.signalAuditLog.create({
      data: {
        signalId: signal.id,
        action: 'updated',
        userId: req.user!.id,
        details: JSON.stringify({ changes: req.body }),
      },
    });

    // Emit update
    const io = getIO();
    io?.to('signals').emit('signal:updated', updatedSignal);

    // Invalidate cache
    const redis = getRedis();
    await redis?.del('active_signals');

    res.json({
      success: true,
      data: updatedSignal,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST /api/signals/internal - Receive signals from signal engine (API key auth)
// ============================================================================

const INTERNAL_ENGINE_KEY = process.env.ENGINE_API_KEY || 'dev_key';

signalRouter.post('/internal', async (req: any, res: Response, next: NextFunction) => {
  try {
    // Verify internal API key from the signal engine
    const engineKey = req.headers['x-engine-key'];
    if (!engineKey || engineKey !== INTERNAL_ENGINE_KEY) {
      return res.status(401).json({ success: false, error: 'Invalid engine key' });
    }

    const data = createSignalSchema.parse(req.body);

    // Create signal directly (no user auth needed — this is internal)
    const signal = await prisma.signal.create({
      data: {
        asset: data.asset,
        category: data.category,
        action: data.action,
        entryPrice: data.entryPrice,
        takeProfit1: data.takeProfit1,
        takeProfit2: data.takeProfit2,
        takeProfit3: data.takeProfit3,
        stopLoss: data.stopLoss,
        timeframe: data.timeframe,
        confidenceScore: data.confidenceScore,
        riskLevel: data.riskLevel || 'MEDIUM',
        analysis: data.analysis,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : new Date(Date.now() + 4 * 60 * 60 * 1000),
        status: 'ACTIVE',
        validationStatus: 'FULLY_VALIDATED',
      },
    });

    // Emit via WebSocket
    const io = getIO();
    io?.to('signals').emit('signal:new', {
      id: signal.id,
      asset: signal.asset,
      category: signal.category,
      action: signal.action,
      entryPrice: signal.entryPrice,
      takeProfit1: signal.takeProfit1,
      stopLoss: signal.stopLoss,
      confidenceScore: signal.confidenceScore,
      riskLevel: signal.riskLevel,
      timeframe: signal.timeframe,
      status: signal.status,
    });

    // Invalidate cache
    const redis = getRedis();
    await redis?.del('active_signals');

    res.status(201).json({ success: true, data: signal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// ============================================================================
// DELETE /api/signals/:id - Cancel signal
// ============================================================================

signalRouter.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const signal = await prisma.signal.update({
      where: { id: req.params.id },
      data: {
        status: 'CANCELLED',
        closedAt: new Date(),
      },
    });

    await prisma.signalAuditLog.create({
      data: {
        signalId: signal.id,
        action: 'cancelled',
        userId: req.user!.id,
      },
    });

    const io = getIO();
    io?.to('signals').emit('signal:cancelled', { id: signal.id });

    const redis = getRedis();
    await redis?.del('active_signals');

    res.json({
      success: true,
      message: 'Signal cancelled',
    });
  } catch (error) {
    next(error);
  }
});
