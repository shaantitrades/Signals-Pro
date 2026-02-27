import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const authRouter = Router();

// ============================================================================
// Schemas
// ============================================================================

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

// ============================================================================
// Helpers
// ============================================================================

function generateTokens(userId: string, email: string, role: string) {
  const accessToken = jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any }
  );

  const refreshToken = jwt.sign(
    { userId, tokenId: uuidv4() },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any }
  );

  return { accessToken, refreshToken };
}

// ============================================================================
// Routes
// ============================================================================

// POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    // Generate tokens
    const tokens = generateTokens(user.id, user.email, user.role);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tokens,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    // Google-only users can't login with password
    if (!user.passwordHash) {
      throw new AppError('Utilisez Google pour vous connecter', 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const tokens = generateTokens(user.id, user.email, user.role);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        tokens,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// POST /api/auth/refresh
authRouter.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      userId: string;
    };

    // Check if token exists in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Delete old refresh token
    await prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    // Generate new tokens
    const user = storedToken.user;
    const tokens = generateTokens(user.id, user.email, user.role);

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      data: { tokens },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
authRouter.post('/logout', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Delete all refresh tokens for this user
    await prisma.refreshToken.deleteMany({
      where: { userId: req.user!.id },
    });

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/google
authRouter.post('/google', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      throw new AppError('Google credential required', 400);
    }

    // Verify Google token
    const { OAuth2Client } = await import('google-auth-library');
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      throw new AppError('Google Sign-In is not configured on the server', 500);
    }

    const client = new OAuth2Client(googleClientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AppError('Invalid Google token', 401);
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          googleId: payload.sub,
          firstName: payload.given_name || 'Google',
          lastName: payload.family_name || 'User',
          avatarUrl: payload.picture || null,
          emailVerified: true,
        },
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: payload.sub,
          avatarUrl: user.avatarUrl || payload.picture || null,
          emailVerified: true,
        },
      });
    }

    // Generate tokens
    const tokens = generateTokens(user.id, user.email, user.role);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        subscription: {
          include: { plan: true },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        subscription: user.subscription,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/profile — update user profile
const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().optional(),
});

authRouter.put('/profile', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// PUT /api/auth/password — change password
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

authRouter.put('/password', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user || !user.passwordHash) {
      throw new AppError('Cannot change password for this account', 400);
    }

    const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    const newHash = await bcrypt.hash(data.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// ============================================================================
// POST /api/auth/forgot-password
// ============================================================================

authRouter.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond success to prevent email enumeration
    if (!user || !user.passwordHash) {
      return res.json({ success: true, message: 'If an account exists, a reset link has been generated.' });
    }

    // Generate a secure reset token
    const resetToken = uuidv4() + '-' + uuidv4();
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    // TODO: Send email with resetUrl when email service is configured
    console.log(`[Password Reset] Token for ${email}: ${resetUrl}`);

    res.json({
      success: true,
      message: 'If an account exists, a reset link has been generated.',
      // In development, return the URL (remove in production)
      ...(process.env.NODE_ENV !== 'production' ? { resetUrl } : {}),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// ============================================================================
// POST /api/auth/reset-password
// ============================================================================

authRouter.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = z.object({
      token: z.string().min(1),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    }).parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: { gte: new Date() },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExp: null,
      },
    });

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});
