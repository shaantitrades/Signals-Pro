import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { AppError } from './errorHandler';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

// Stripe statuses that mean the subscription is still alive (payment retrying)
const STRIPE_ACTIVE_STATUSES = new Set(['active', 'trialing', 'past_due']);


export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    
    next();
  };
}

export async function requireSubscription(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  // Admins and validators bypass subscription check
  if (['ADMIN', 'SUPER_ADMIN', 'VALIDATOR'].includes(req.user.role)) {
    return next();
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: req.user.id },
  });

  // ── Case 1: No subscription at all ───────────────────────────────────────
  if (!subscription) {
    return next(new AppError('Active subscription required', 403));
  }

  const now = new Date();
  const locallyValid =
    (subscription.status === 'ACTIVE' || subscription.status === 'TRIAL') &&
    now <= subscription.currentPeriodEnd;

  // ── Case 2: Locally valid → allow ────────────────────────────────────────
  if (locallyValid) {
    return next();
  }

  // ── Case 3: Expired/invalid locally, but has a Stripe subscription ID ───
  // Do a live Stripe check: the webhook may be delayed or payment is retrying
  if (subscription.stripeSubId) {
    try {
      const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubId);

      if (STRIPE_ACTIVE_STATUSES.has(stripeSub.status)) {
        // Stripe considers it alive — sync our DB and allow access
        const newPeriodEnd = new Date(stripeSub.current_period_end * 1000);
        const newPeriodStart = new Date(stripeSub.current_period_start * 1000);

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: 'ACTIVE',
            currentPeriodStart: newPeriodStart,
            currentPeriodEnd: newPeriodEnd,
            canceledAt: null,
          },
        });

        console.log(
          `[requireSubscription] 🔄 Live Stripe check: subscription ${subscription.id} ` +
          `synced to ACTIVE (Stripe status: ${stripeSub.status}, period end: ${newPeriodEnd.toISOString()})`
        );

        return next();
      }

      // Stripe also considers it expired/canceled → update our DB and block
      const finalStatus =
        stripeSub.status === 'canceled' ? 'CANCELED' : 'EXPIRED';
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: finalStatus },
      });
    } catch (err) {
      // If Stripe is unreachable, fail open: grant a short grace period
      // rather than blocking a potentially valid subscriber
      console.error('[requireSubscription] Stripe live check failed — granting grace access:', err);
      return next();
    }
  } else {
    // No stripeSubId (crypto/manual) — expire locally
    if (subscription.status === 'ACTIVE' || subscription.status === 'TRIAL') {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED' },
      });
    }
  }

  return next(new AppError('Subscription expired', 403));
}
