import { Router, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

export const subscriptionRouter = Router();

// ============================================================================
// GET /api/subscriptions/plans - Available subscription plans
// ============================================================================

subscriptionRouter.get('/plans', async (_req, res, next) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST /api/subscriptions/create - Create subscription
// ============================================================================

subscriptionRouter.post('/create', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { planSlug } = req.body;

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    // Check existing subscription
    const existing = await prisma.subscription.findUnique({
      where: { userId: req.user!.id },
    });

    if (existing && existing.status === 'ACTIVE' && existing.currentPeriodEnd > new Date()) {
      return res.status(409).json({
        success: false,
        error: 'You already have an active subscription',
        data: existing,
      });
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    // Create or update subscription
    const subscription = existing
      ? await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            planId: plan.id,
            status: plan.slug === 'trial-24h' ? 'TRIAL' : 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: endDate,
            canceledAt: null,
          },
          include: { plan: true },
        })
      : await prisma.subscription.create({
          data: {
            userId: req.user!.id,
            planId: plan.id,
            status: plan.slug === 'trial-24h' ? 'TRIAL' : 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: endDate,
          },
          include: { plan: true },
        });

    // Create payment record
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: plan.priceEur,
        currency: 'EUR',
        status: 'COMPLETED',
      },
    });

    res.status(201).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/subscriptions/status - Current subscription status
// ============================================================================

subscriptionRouter.get('/status', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.id },
      include: {
        plan: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST /api/subscriptions/cancel - Cancel subscription
// ============================================================================

subscriptionRouter.post('/cancel', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.id },
    });

    if (!subscription || subscription.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        error: 'No active subscription found',
      });
    }

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Subscription cancelled. Access will remain until the end of the current period.',
    });
  } catch (error) {
    next(error);
  }
});
