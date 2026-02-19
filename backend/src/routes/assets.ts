import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

export const assetRouter = Router();

// ============================================================================
// GET /api/assets - List all assets
// ============================================================================

assetRouter.get('/', async (req, res, next) => {
  try {
    const category = req.query.category as string | undefined;
    
    const where: any = { isActive: true };
    if (category) where.category = category;

    const assets = await prisma.asset.findMany({
      where,
      orderBy: [{ category: 'asc' }, { symbol: 'asc' }],
    });

    // Group by category
    const grouped = assets.reduce((acc: any, asset) => {
      if (!acc[asset.category]) acc[asset.category] = [];
      acc[asset.category].push(asset);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        assets,
        grouped,
        total: assets.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/assets/:symbol - Get asset details
// ============================================================================

assetRouter.get('/:symbol', async (req, res, next) => {
  try {
    const asset = await prisma.asset.findUnique({
      where: { symbol: req.params.symbol.toUpperCase() },
    });

    if (!asset) {
      return res.status(404).json({ success: false, error: 'Asset not found' });
    }

    res.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    next(error);
  }
});
