import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, requireSubscription, AuthRequest } from '../middleware/auth';
import { getIO } from '../websocket';

export const botRouter = Router();

// ============================================================================
// Schemas
// ============================================================================

const botConfigSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.enum(['FOREX_OTC', 'FOREX', 'CRYPTO', 'INDICES', 'COMMODITIES']),
  assets: z.array(z.string()).min(1),
  timeframes: z.array(z.enum(['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1'])).min(1),
  maxConcurrent: z.number().min(1).max(20).optional(),
  riskPerTrade: z.number().min(0.1).max(10).optional(),
  maxDailyLoss: z.number().min(1).max(50).optional(),
  minConfidence: z.number().min(50).max(100).optional(),
  allowedRiskLevels: z.array(z.enum(['LOW', 'MEDIUM', 'HIGH', 'EXTREME'])).optional(),
});

// ============================================================================
// POST /api/bot/start - Start bot for a configuration
// ============================================================================

botRouter.post('/start', authenticate, requireSubscription, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = botConfigSchema.parse(req.body);

    // Check if user has an existing active bot
    const existingBot = await prisma.botConfig.findFirst({
      where: { userId: req.user!.id, isActive: true, category: data.category },
    });

    if (existingBot) {
      throw new AppError('You already have an active bot for this category. Stop it first.', 409);
    }

    // Create or update bot config
    const botConfig = await prisma.botConfig.create({
      data: {
        userId: req.user!.id,
        name: data.name || `${data.category} Bot`,
        category: data.category,
        assets: data.assets,
        timeframes: data.timeframes,
        isActive: true,
        maxConcurrent: data.maxConcurrent || 3,
        riskPerTrade: data.riskPerTrade || 2.0,
        maxDailyLoss: data.maxDailyLoss || 5.0,
        minConfidence: data.minConfidence || 85.0,
        allowedRiskLevels: data.allowedRiskLevels || ['LOW', 'MEDIUM'],
      },
    });

    // Notify via WebSocket
    const io = getIO();
    io?.to(`user:${req.user!.id}`).emit('bot:started', {
      botId: botConfig.id,
      category: data.category,
      assets: data.assets,
    });

    // Create alert
    await prisma.userAlert.create({
      data: {
        userId: req.user!.id,
        type: 'BOT_STARTED',
        title: 'Bot démarré',
        message: `Votre bot ${data.category} est maintenant actif sur ${data.assets.join(', ')}`,
        metadata: { botId: botConfig.id },
      },
    });

    res.status(201).json({
      success: true,
      data: botConfig,
      message: `Bot ${data.category} started successfully`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// ============================================================================
// POST /api/bot/stop - Stop a bot
// ============================================================================

botRouter.post('/stop', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { botId, category } = req.body;

    const where: any = { userId: req.user!.id, isActive: true };
    if (botId) where.id = botId;
    if (category) where.category = category;

    const bot = await prisma.botConfig.findFirst({ where });

    if (!bot) {
      throw new AppError('No active bot found', 404);
    }

    await prisma.botConfig.update({
      where: { id: bot.id },
      data: { isActive: false },
    });

    const io = getIO();
    io?.to(`user:${req.user!.id}`).emit('bot:stopped', { botId: bot.id });

    await prisma.userAlert.create({
      data: {
        userId: req.user!.id,
        type: 'BOT_STOPPED',
        title: 'Bot arrêté',
        message: `Votre bot ${bot.category} a été arrêté`,
        metadata: { botId: bot.id },
      },
    });

    res.json({
      success: true,
      message: 'Bot stopped successfully',
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/bot/status - Get bot status
// ============================================================================

botRouter.get('/status', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const activeBots = await prisma.botConfig.findMany({
      where: { userId: req.user!.id, isActive: true },
    });

    const allBots = await prisma.botConfig.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        activeBots,
        allBots,
        activeCount: activeBots.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/bot/config - Get bot configurations
// ============================================================================

botRouter.get('/config', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const configs = await prisma.botConfig.findMany({
      where: { userId: req.user!.id },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: configs,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// PUT /api/bot/config/:id - Update bot config
// ============================================================================

botRouter.put('/config/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const config = await prisma.botConfig.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
    });

    if (!config) {
      throw new AppError('Bot configuration not found', 404);
    }

    const data = botConfigSchema.partial().parse(req.body);

    const updatedConfig = await prisma.botConfig.update({
      where: { id: req.params.id },
      data,
    });

    res.json({
      success: true,
      data: updatedConfig,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});
