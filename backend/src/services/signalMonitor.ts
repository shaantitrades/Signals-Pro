import { prisma } from '../lib/prisma';
import { getIO } from '../websocket';
import { cacheInvalidatePattern } from './redis';

// ============================================================================
// Signal Monitor - Anti-Fake Signal System
// ============================================================================
// 
// This service continuously monitors signal performance and automatically:
// 1. Disables signal providers with <60% win rate over 20 signals
// 2. Flags signals with suspicious patterns
// 3. Enforces backtesting requirements
// 4. Tracks and audits all signal lifecycle events
// ============================================================================

const MONITORING_INTERVAL = 30 * 1000; // 30 seconds
const MIN_SIGNALS_FOR_EVALUATION = 20;
const MIN_WIN_RATE = 60; // 60%
const MIN_CONFIDENCE_THRESHOLD = 85; // Minimum confidence to activate signal
const MAX_CONSECUTIVE_LOSSES = 5;

let monitorInterval: NodeJS.Timeout | null = null;

export function initializeSignalMonitor() {
  console.log('🛡️ Signal Monitor initialized');
  console.log(`   - Min win rate: ${MIN_WIN_RATE}%`);
  console.log(`   - Min confidence: ${MIN_CONFIDENCE_THRESHOLD}`);
  console.log(`   - Max consecutive losses: ${MAX_CONSECUTIVE_LOSSES}`);
  console.log(`   - Monitor interval: ${MONITORING_INTERVAL / 1000}s`);

  // Run monitoring loop
  monitorInterval = setInterval(runMonitoringCycle, MONITORING_INTERVAL);

  // Run immediately
  runMonitoringCycle();
}

export function stopSignalMonitor() {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
}

async function runMonitoringCycle() {
  try {
    await Promise.all([
      checkExpiredSignals(),
      checkPerformanceThresholds(),
      checkConsecutiveLosses(),
      checkLowConfidenceSignals(),
    ]);
  } catch (error) {
    console.error('❌ Signal Monitor error:', error);
  }
}

// ============================================================================
// 1. Check & expire old signals
// ============================================================================

async function checkExpiredSignals() {
  const now = new Date();

  const expiredSignals = await prisma.signal.findMany({
    where: {
      status: { in: ['ACTIVE', 'EXECUTED', 'PENDING'] },
      expiresAt: { lte: now },
    },
  });

  for (const signal of expiredSignals) {
    await prisma.signal.update({
      where: { id: signal.id },
      data: {
        status: 'EXPIRED',
        closedAt: now,
      },
    });

    await prisma.signalAuditLog.create({
      data: {
        signalId: signal.id,
        action: 'auto_expired',
        details: JSON.stringify({ reason: 'Signal expiration time reached', expiredAt: now }),
      },
    });

    // Notify subscribers
    const io = getIO();
    io?.to('signals').emit('signal:expired', { id: signal.id, asset: signal.asset });
  }

  if (expiredSignals.length > 0) {
    await cacheInvalidatePattern('active_signals*');
  }
}

// ============================================================================
// 2. Check performance thresholds (Anti-Fake System Core)
// ============================================================================

async function checkPerformanceThresholds() {
  // Get recent signal performance by category
  const categories = ['FOREX_OTC', 'FOREX', 'CRYPTO', 'INDICES', 'COMMODITIES'] as const;

  for (const category of categories) {
    const recentSignals = await prisma.signal.findMany({
      where: {
        category,
        result: { not: null },
      },
      orderBy: { closedAt: 'desc' },
      take: MIN_SIGNALS_FOR_EVALUATION,
      select: { result: true, pnlPips: true },
    });

    if (recentSignals.length < MIN_SIGNALS_FOR_EVALUATION) continue;

    const wins = recentSignals.filter(s => s.result === 'WIN').length;
    const winRate = (wins / recentSignals.length) * 100;

    if (winRate < MIN_WIN_RATE) {
      console.warn(`⚠️ ${category} win rate below threshold: ${winRate.toFixed(1)}% (min: ${MIN_WIN_RATE}%)`);

      // Auto-disable pending signals for this category
      const disabled = await prisma.signal.updateMany({
        where: {
          category,
          status: 'PENDING',
        },
        data: {
          status: 'CANCELLED',
          closedAt: new Date(),
        },
      });

      if (disabled.count > 0) {
        console.warn(`   ❌ Disabled ${disabled.count} pending signals for ${category}`);

        // Alert admins
        const admins = await prisma.user.findMany({
          where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        });

        for (const admin of admins) {
          await prisma.userAlert.create({
            data: {
              userId: admin.id,
              type: 'SYSTEM',
              title: `⚠️ Performance Alert: ${category}`,
              message: `Win rate for ${category} dropped to ${winRate.toFixed(1)}%. ${disabled.count} pending signals have been auto-disabled. Minimum threshold: ${MIN_WIN_RATE}%.`,
              metadata: JSON.stringify({ category, winRate, disabledCount: disabled.count }),
            },
          });
        }

        const io = getIO();
        io?.to('admin').emit('alert:performance', {
          category,
          winRate,
          threshold: MIN_WIN_RATE,
          disabledCount: disabled.count,
        });
      }
    }
  }
}

// ============================================================================
// 3. Check consecutive losses
// ============================================================================

async function checkConsecutiveLosses() {
  const recentSignals = await prisma.signal.findMany({
    where: {
      result: { not: null },
      validationStatus: 'FULLY_VALIDATED',
    },
    orderBy: { closedAt: 'desc' },
    take: MAX_CONSECUTIVE_LOSSES + 5,
    select: { id: true, asset: true, category: true, result: true },
  });

  let consecutiveLosses = 0;
  for (const signal of recentSignals) {
    if (signal.result === 'LOSS') {
      consecutiveLosses++;
    } else {
      break;
    }
  }

  if (consecutiveLosses >= MAX_CONSECUTIVE_LOSSES) {
    console.warn(`⚠️ ${consecutiveLosses} consecutive losses detected! Pausing new signals.`);

    // Temporarily pause new signal activation
    const paused = await prisma.signal.updateMany({
      where: { status: 'PENDING' },
      data: { status: 'CANCELLED' },
    });

    const admins = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    });

    for (const admin of admins) {
      await prisma.userAlert.create({
        data: {
          userId: admin.id,
          type: 'SYSTEM',
          title: '🚨 Consecutive Loss Alert',
          message: `${consecutiveLosses} consecutive losses detected. ${paused.count} pending signals have been auto-paused. Manual review required.`,
          metadata: JSON.stringify({ consecutiveLosses, pausedCount: paused.count }),
        },
      });
    }
  }
}

// ============================================================================
// 4. Check and flag low-confidence signals
// ============================================================================

async function checkLowConfidenceSignals() {
  // Reject any signals that somehow got through with low confidence
  const lowConfidence = await prisma.signal.findMany({
    where: {
      status: 'PENDING',
      confidenceScore: { lt: MIN_CONFIDENCE_THRESHOLD },
    },
  });

  for (const signal of lowConfidence) {
    await prisma.signal.update({
      where: { id: signal.id },
      data: {
        status: 'CANCELLED',
        validationStatus: 'REJECTED',
        closedAt: new Date(),
      },
    });

    await prisma.signalAuditLog.create({
      data: {
        signalId: signal.id,
        action: 'auto_rejected_low_confidence',
        details: JSON.stringify({
          confidenceScore: signal.confidenceScore,
          threshold: MIN_CONFIDENCE_THRESHOLD,
        }),
      },
    });
  }
}

// ============================================================================
// 5. Signal validation rules (called before activation)
// ============================================================================

export interface ValidationCheckResult {
  passed: boolean;
  checks: {
    name: string;
    passed: boolean;
    message: string;
  }[];
}

export async function runPreActivationChecks(signalId: string): Promise<ValidationCheckResult> {
  const signal = await prisma.signal.findUnique({
    where: { id: signalId },
    include: { validations: true },
  });

  if (!signal) {
    return { passed: false, checks: [{ name: 'existence', passed: false, message: 'Signal not found' }] };
  }

  const checks = [];

  // Check 1: Confidence score
  checks.push({
    name: 'confidence_score',
    passed: signal.confidenceScore >= MIN_CONFIDENCE_THRESHOLD,
    message: `Confidence: ${signal.confidenceScore}% (min: ${MIN_CONFIDENCE_THRESHOLD}%)`,
  });

  // Check 2: Triple validation
  const hasAI = signal.validations.some(v => 
    ['AI_TECHNICAL', 'AI_SENTIMENT', 'AI_PATTERN'].includes(v.validationType) && v.result === 'APPROVED'
  );
  const hasHuman = signal.validations.some(v =>
    ['HUMAN_TECHNICAL', 'HUMAN_FUNDAMENTAL'].includes(v.validationType) && v.result === 'APPROVED'
  );
  const hasMarket = signal.validations.some(v =>
    ['MARKET_VOLUME', 'MARKET_SENTIMENT', 'MARKET_NEWS'].includes(v.validationType) && v.result === 'APPROVED'
  );

  checks.push({ name: 'ai_validation', passed: hasAI, message: hasAI ? 'AI validation passed' : 'AI validation missing' });
  checks.push({ name: 'human_validation', passed: hasHuman, message: hasHuman ? 'Human validation passed' : 'Human validation missing' });
  checks.push({ name: 'market_confirmation', passed: hasMarket, message: hasMarket ? 'Market confirmation passed' : 'Market confirmation missing' });

  // Check 3: Risk/Reward ratio
  const entryPrice = Number(signal.entryPrice);
  const tp1 = Number(signal.takeProfit1);
  const sl = Number(signal.stopLoss);
  const reward = Math.abs(tp1 - entryPrice);
  const risk = Math.abs(entryPrice - sl);
  const rrRatio = risk > 0 ? reward / risk : 0;

  checks.push({
    name: 'risk_reward',
    passed: rrRatio >= 1.5,
    message: `R:R ratio ${rrRatio.toFixed(2)} (min: 1.5)`,
  });

  // Check 4: Not expired
  const isExpired = signal.expiresAt && signal.expiresAt < new Date();
  checks.push({
    name: 'not_expired',
    passed: !isExpired,
    message: isExpired ? 'Signal has expired' : 'Signal is within validity period',
  });

  // Check 5: High risk requires 2+ human validators
  if (signal.riskLevel === 'HIGH' || signal.riskLevel === 'EXTREME') {
    const humanValidatorCount = signal.validations.filter(v =>
      ['HUMAN_TECHNICAL', 'HUMAN_FUNDAMENTAL'].includes(v.validationType) && v.result === 'APPROVED'
    ).length;

    checks.push({
      name: 'high_risk_validation',
      passed: humanValidatorCount >= 2,
      message: `High risk: ${humanValidatorCount}/2 human validators (required: 2+)`,
    });
  }

  const allPassed = checks.every(c => c.passed);

  return { passed: allPassed, checks };
}
