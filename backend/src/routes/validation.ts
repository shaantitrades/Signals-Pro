import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { getIO } from '../websocket';
import { getRedis } from '../services/redis';

export const validationRouter = Router();

// ============================================================================
// Schemas
// ============================================================================

const validateSignalSchema = z.object({
  result: z.enum(['APPROVED', 'REJECTED', 'NEEDS_REVIEW']),
  validationType: z.enum([
    'AI_TECHNICAL', 'AI_SENTIMENT', 'AI_PATTERN',
    'HUMAN_TECHNICAL', 'HUMAN_FUNDAMENTAL',
    'MARKET_VOLUME', 'MARKET_SENTIMENT', 'MARKET_NEWS',
  ]),
  confidenceScore: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  metadata: z.any().optional(),
});

// ============================================================================
// GET /api/validation/pending - Get signals pending validation
// ============================================================================

validationRouter.get('/pending', authenticate, authorize('VALIDATOR', 'ADMIN', 'SUPER_ADMIN'), async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const pendingSignals = await prisma.signal.findMany({
      where: {
        validationStatus: {
          in: ['PENDING_AI', 'AI_APPROVED', 'PENDING_HUMAN', 'HUMAN_APPROVED', 'PENDING_MARKET'],
        },
      },
      orderBy: [
        { confidenceScore: 'desc' },
        { createdAt: 'asc' },
      ],
      include: {
        validations: true,
      },
    });

    res.json({
      success: true,
      data: pendingSignals,
      count: pendingSignals.length,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST /api/validation/:signalId - Validate a signal
// ============================================================================

validationRouter.post('/:signalId', authenticate, authorize('VALIDATOR', 'ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = validateSignalSchema.parse(req.body);
    const { signalId } = req.params;

    // Check signal exists
    const signal = await prisma.signal.findUnique({
      where: { id: signalId },
      include: { validations: true },
    });

    if (!signal) {
      throw new AppError('Signal not found', 404);
    }

    // Create validation record
    const validation = await prisma.signalValidation.create({
      data: {
        signalId,
        validatorId: data.validationType.startsWith('AI_') ? null : req.user!.id,
        validationType: data.validationType as any,
        result: data.result as any,
        confidenceScore: data.confidenceScore,
        notes: data.notes,
        metadata: data.metadata,
      },
    });

    // Determine new validation status based on all validations
    const allValidations = [...signal.validations, validation];
    const newValidationStatus = determineValidationStatus(allValidations);

    // Update signal status
    const updateData: any = { validationStatus: newValidationStatus };

    // If fully validated, activate the signal
    if (newValidationStatus === 'FULLY_VALIDATED') {
      updateData.status = 'ACTIVE';
      updateData.executedAt = new Date();
    } else if (newValidationStatus === 'REJECTED') {
      updateData.status = 'CANCELLED';
      updateData.closedAt = new Date();
    }

    const updatedSignal = await prisma.signal.update({
      where: { id: signalId },
      data: updateData,
      include: { validations: true },
    });

    // Audit log
    await prisma.signalAuditLog.create({
      data: {
        signalId,
        action: `validation_${data.result.toLowerCase()}`,
        userId: req.user!.id,
        details: {
          validationType: data.validationType,
          result: data.result,
          confidenceScore: data.confidenceScore,
          newStatus: newValidationStatus,
        },
      },
    });

    // Real-time notification
    const io = getIO();
    if (newValidationStatus === 'FULLY_VALIDATED') {
      io?.to('signals').emit('signal:activated', updatedSignal);
    }
    io?.to('validators').emit('validation:completed', {
      signalId,
      validationType: data.validationType,
      result: data.result,
      newStatus: newValidationStatus,
    });

    // Invalidate cache
    const redis = getRedis();
    await redis?.del('active_signals');

    res.json({
      success: true,
      data: {
        validation,
        signal: updatedSignal,
        newValidationStatus,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
});

// ============================================================================
// GET /api/validation/stats - Validation statistics
// ============================================================================

validationRouter.get('/stats', authenticate, authorize('VALIDATOR', 'ADMIN', 'SUPER_ADMIN'), async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [total, approved, rejected, pending] = await Promise.all([
      prisma.signalValidation.count(),
      prisma.signalValidation.count({ where: { result: 'APPROVED' } }),
      prisma.signalValidation.count({ where: { result: 'REJECTED' } }),
      prisma.signal.count({
        where: {
          validationStatus: {
            in: ['PENDING_AI', 'AI_APPROVED', 'PENDING_HUMAN', 'HUMAN_APPROVED', 'PENDING_MARKET'],
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        approved,
        rejected,
        pending,
        approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : '0',
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// Helper: Determine validation status from all validations
// ============================================================================

function determineValidationStatus(validations: any[]): string {
  const aiValidations = validations.filter(v => 
    ['AI_TECHNICAL', 'AI_SENTIMENT', 'AI_PATTERN'].includes(v.validationType)
  );
  const humanValidations = validations.filter(v =>
    ['HUMAN_TECHNICAL', 'HUMAN_FUNDAMENTAL'].includes(v.validationType)
  );
  const marketValidations = validations.filter(v =>
    ['MARKET_VOLUME', 'MARKET_SENTIMENT', 'MARKET_NEWS'].includes(v.validationType)
  );

  // Check for rejections at any level
  const hasRejection = validations.some(v => v.result === 'REJECTED');
  if (hasRejection) return 'REJECTED';

  // Level 1: AI validation
  const aiApproved = aiValidations.some(v => v.result === 'APPROVED');
  if (!aiApproved) return 'PENDING_AI';

  // Level 2: Human validation
  const humanApproved = humanValidations.some(v => v.result === 'APPROVED');
  if (!humanApproved) return 'PENDING_HUMAN';

  // Level 3: Market confirmation
  const marketApproved = marketValidations.some(v => v.result === 'APPROVED');
  if (!marketApproved) return 'PENDING_MARKET';

  // All 3 levels passed
  return 'FULLY_VALIDATED';
}
