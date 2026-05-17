import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

export const adminRouter = Router();

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

// ============================================================================
// GET /api/admin/users — list all users with their subscription
// ============================================================================

adminRouter.get('/users', authenticate, authorize(...ADMIN_ROLES), async (req: AuthRequest, res: Response, next) => {
  try {
    const { search } = req.query as { search?: string };

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        subscription: {
          select: {
            id: true,
            status: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            plan: { select: { name: true, slug: true, durationDays: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    res.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST /api/admin/activate-subscription — manually activate a user subscription
// ============================================================================

adminRouter.post('/activate-subscription', authenticate, authorize(...ADMIN_ROLES), async (req: AuthRequest, res: Response, next) => {
  try {
    const { userId, planSlug, days } = req.body as {
      userId: string;
      planSlug: string;
      days?: number;
    };

    if (!userId || !planSlug) {
      return res.status(400).json({ success: false, error: 'userId and planSlug are required' });
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } });
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    const durationDays = days ?? plan.durationDays;
    const now = new Date();
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const existing = await prisma.subscription.findUnique({ where: { userId } });

    const subscriptionData = {
      planId: plan.id,
      status: 'ACTIVE' as const,
      currentPeriodStart: now,
      currentPeriodEnd: endDate,
      canceledAt: null,
    };

    const subscription = existing
      ? await prisma.subscription.update({
          where: { id: existing.id },
          data: subscriptionData,
          include: { plan: true },
        })
      : await prisma.subscription.create({
          data: { userId, ...subscriptionData },
          include: { plan: true },
        });

    const admin = req.user!;
    console.log(`[Admin] ✅ ${admin.email} activated ${plan.slug} (${durationDays}d) for user ${userId}`);

    res.json({
      success: true,
      message: `Subscription ${plan.name} activated for ${durationDays} days`,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// GET /api/admin/plans — list all plans
// ============================================================================

adminRouter.get('/plans', authenticate, authorize(...ADMIN_ROLES), async (_req, res, next) => {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST /api/admin/revoke-subscription — revoke a user's subscription
// ============================================================================

adminRouter.post('/revoke-subscription', authenticate, authorize(...ADMIN_ROLES), async (req: AuthRequest, res: Response, next) => {
  try {
    const { userId } = req.body as { userId: string };
    if (!userId) return res.status(400).json({ success: false, error: 'userId is required' });

    const existing = await prisma.subscription.findUnique({ where: { userId } });
    if (!existing) return res.status(404).json({ success: false, error: 'No subscription found' });

    await prisma.subscription.update({
      where: { id: existing.id },
      data: { status: 'EXPIRED', canceledAt: new Date() },
    });

    console.log(`[Admin] ❌ ${req.user!.email} revoked subscription for user ${userId}`);
    res.json({ success: true, message: 'Subscription revoked' });
  } catch (error) {
    next(error);
  }
});
