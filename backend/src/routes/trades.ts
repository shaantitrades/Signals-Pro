import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, requireSubscription, AuthRequest } from '../middleware/auth';

export const tradeRouter = Router();

// ============================================================================
// GET /api/trades - User's trade history
// ============================================================================

tradeRouter.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const where: any = { userId: req.user!.id };
    if (req.query.result) where.result = req.query.result;

    const [trades, total] = await Promise.all([
      prisma.userTrade.findMany({
        where,
        skip,
        take: limit,
        orderBy: { executedAt: 'desc' },
        include: {
          signal: {
            select: {
              asset: true,
              category: true,
              action: true,
              timeframe: true,
              confidenceScore: true,
            },
          },
        },
      }),
      prisma.userTrade.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        trades,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/trades/stats - Trading statistics
// ============================================================================

tradeRouter.get('/stats', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const [totals, wins, losses] = await Promise.all([
      prisma.userTrade.aggregate({
        where: { userId },
        _count: { id: true },
        _sum: { pnlPips: true, pnlPercent: true },
        _avg: { pnlPips: true, pnlPercent: true },
      }),
      prisma.userTrade.count({ where: { userId, result: 'WIN' } }),
      prisma.userTrade.count({ where: { userId, result: 'LOSS' } }),
    ]);

    const totalTrades = totals._count.id || 0;
    const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : '0';

    // Best and worst trades
    const [bestTrade, worstTrade] = await Promise.all([
      prisma.userTrade.findFirst({
        where: { userId },
        orderBy: { pnlPips: 'desc' },
        include: { signal: { select: { asset: true, action: true } } },
      }),
      prisma.userTrade.findFirst({
        where: { userId },
        orderBy: { pnlPips: 'asc' },
        include: { signal: { select: { asset: true, action: true } } },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalTrades,
        wins,
        losses,
        winRate: parseFloat(winRate),
        totalPips: totals._sum.pnlPips || 0,
        avgPips: totals._avg.pnlPips || 0,
        totalPnlPercent: totals._sum.pnlPercent || 0,
        avgPnlPercent: totals._avg.pnlPercent || 0,
        bestTrade,
        worstTrade,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST /api/trades - Record a trade execution
// ============================================================================

tradeRouter.post('/', authenticate, requireSubscription, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      signalId: z.string().uuid(),
      executionPrice: z.number().positive(),
      lotSize: z.number().positive().max(100),
      isAutoExecuted: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    // Verify signal exists and is active
    const signal = await prisma.signal.findUnique({
      where: { id: data.signalId },
    });

    if (!signal) {
      throw new AppError('Signal not found', 404);
    }

    if (!['ACTIVE', 'EXECUTED'].includes(signal.status)) {
      throw new AppError('Signal is not active', 400);
    }

    // Check for duplicate trade
    const existing = await prisma.userTrade.findFirst({
      where: {
        userId: req.user!.id,
        signalId: data.signalId,
        closedAt: null,
      },
    });

    if (existing) {
      throw new AppError('You already have an open trade for this signal', 409);
    }

    const trade = await prisma.userTrade.create({
      data: {
        userId: req.user!.id,
        signalId: data.signalId,
        executionPrice: data.executionPrice,
        lotSize: data.lotSize,
        isAutoExecuted: data.isAutoExecuted || false,
      },
      include: {
        signal: {
          select: { asset: true, category: true, action: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: trade,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});
