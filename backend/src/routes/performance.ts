import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireSubscription, AuthRequest } from '../middleware/auth';
import { getRedis } from '../services/redis';

export const performanceRouter = Router();

// ============================================================================
// GET /api/performance/global - Global platform performance
// ============================================================================

performanceRouter.get('/global', authenticate, async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const redis = getRedis();
    const cached = await redis?.get('performance:global');
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached), source: 'cache' });
    }

    const [totalSignals, wins, losses, avgConfidence] = await Promise.all([
      prisma.signal.count({ where: { status: { in: ['TP1_HIT', 'TP2_HIT', 'TP3_HIT', 'SL_HIT', 'CLOSED'] } } }),
      prisma.signal.count({ where: { result: 'WIN' } }),
      prisma.signal.count({ where: { result: 'LOSS' } }),
      prisma.signal.aggregate({
        where: { validationStatus: 'FULLY_VALIDATED' },
        _avg: { confidenceScore: true },
      }),
    ]);

    const totalPips = await prisma.signal.aggregate({
      where: { result: { not: null } },
      _sum: { pnlPips: true },
      _avg: { pnlPips: true },
    });

    const data = {
      totalSignals,
      wins,
      losses,
      winRate: totalSignals > 0 ? ((wins / totalSignals) * 100).toFixed(1) : '0',
      totalPips: totalPips._sum.pnlPips || 0,
      avgPips: totalPips._avg.pnlPips || 0,
      avgConfidence: avgConfidence._avg.confidenceScore || 0,
      activeSignals: await prisma.signal.count({
        where: { status: { in: ['ACTIVE', 'EXECUTED', 'TP1_HIT', 'TP2_HIT'] } },
      }),
    };

    await redis?.setex('performance:global', 60, JSON.stringify(data));

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/performance/by-asset - Performance per asset
// ============================================================================

performanceRouter.get('/by-asset', authenticate, requireSubscription, async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const metrics = await prisma.performanceMetric.findMany({
      where: {
        period: 'all_time',
        asset: { not: null },
      },
      orderBy: { winRate: 'desc' },
    });

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/performance/by-timeframe - Performance per timeframe
// ============================================================================

performanceRouter.get('/by-timeframe', authenticate, requireSubscription, async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const metrics = await prisma.performanceMetric.findMany({
      where: {
        period: 'all_time',
        asset: null,
        timeframe: { not: null },
      },
      orderBy: { winRate: 'desc' },
    });

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/performance/leaderboard - Top performing categories
// ============================================================================

performanceRouter.get('/leaderboard', authenticate, async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const redis = getRedis();
    const cached = await redis?.get('performance:leaderboard');
    if (cached) {
      return res.json({ success: true, data: JSON.parse(cached), source: 'cache' });
    }

    const metrics = await prisma.performanceMetric.findMany({
      where: {
        period: 'monthly',
        asset: null,
        timeframe: null,
      },
      orderBy: { periodDate: 'desc' },
      take: 12,
    });

    await redis?.setex('performance:leaderboard', 300, JSON.stringify(metrics));

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
});
