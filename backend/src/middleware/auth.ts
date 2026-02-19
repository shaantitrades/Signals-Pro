import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AppError } from './errorHandler';

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

  if (!subscription || subscription.status !== 'ACTIVE') {
    return next(new AppError('Active subscription required', 403));
  }

  if (new Date() > subscription.currentPeriodEnd) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'EXPIRED' },
    });
    return next(new AppError('Subscription expired', 403));
  }

  next();
}
