import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

export const nowpaymentsRouter = Router();

const NP_API_URL = 'https://api.nowpayments.io/v1';
const NP_API_KEY = process.env.NOWPAYMENTS_API_KEY || '';
const NP_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || '';

// ============================================================================
// ============================================================================

async function npFetch(path: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${NP_API_URL}${path}`, {
    ...options,
    headers: {
      'x-api-key': NP_API_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  return res.json() as Promise<any>;
}

/**
 * Verify IPN signature from NOWPayments
 * They sort the body keys, JSON.stringify, then HMAC-SHA512 with the IPN secret.
 */
function verifyIpnSignature(body: Record<string, any>, receivedSig: string): boolean {
  if (!NP_IPN_SECRET) return false;

  // Remove 'signature' from the body, sort keys, stringify
  const { signature, ...rest } = body;
  const sortedKeys = Object.keys(rest).sort();
  const sortedObj: Record<string, any> = {};
  for (const key of sortedKeys) {
    sortedObj[key] = rest[key];
  }

  const hmac = crypto
    .createHmac('sha512', NP_IPN_SECRET)
    .update(JSON.stringify(sortedObj))
    .digest('hex');

  return hmac === receivedSig;
}

// ============================================================================
// POST /api/nowpayments/create-payment - Create a NOWPayments invoice
// ============================================================================

nowpaymentsRouter.post('/create-payment', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { planSlug } = req.body;
    const user = req.user!;

    if (!NP_API_KEY) {
      return res.status(500).json({ success: false, error: 'Crypto payments not configured' });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { slug: planSlug },
    });

    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, error: 'Plan not found' });
    }

    // Check existing active subscription
    const existing = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (existing && existing.status === 'ACTIVE' && existing.currentPeriodEnd > new Date()) {
      return res.status(409).json({
        success: false,
        error: 'You already have an active subscription',
      });
    }

    const priceEur = Number(plan.priceEur);
    const frontendUrl = (() => {
      const raw = process.env.FRONTEND_URL || 'https://marketsignals24.com';
      if (raw.includes('://62.') || raw.includes('://10.') || raw.includes('://172.') || raw.includes('://192.168.') || raw.startsWith('http://')) {
        return 'https://marketsignals24.com';
      }
      return raw;
    })();

    // Create NOWPayments invoice
    const invoice = await npFetch('/invoice', {
      method: 'POST',
      body: JSON.stringify({
        price_amount: priceEur,
        price_currency: 'eur',
        order_id: `${user.id}_${plan.slug}_${Date.now()}`,
        order_description: `MarketSignals24 - ${plan.name}`,
        ipn_callback_url: `${(process.env.API_URL || 'http://localhost:3001').replace(/\/api$/, '')}/api/nowpayments/webhook`,
        success_url: `${frontendUrl}/dashboard/signals?payment=success&plan=${plan.slug}`,
        cancel_url: `${frontendUrl}/tarifs?payment=cancelled`,
        is_fee_paid_by_user: false,
      }),
    });

    if (!invoice || !invoice.id) {
      console.error('[NOWPayments] Failed to create invoice:', invoice);
      return res.status(502).json({ success: false, error: 'Failed to create crypto payment' });
    }

    // Store the pending payment
    const now = new Date();
    const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    // Create or update subscription in PENDING state
    const subscription = existing
      ? await prisma.subscription.update({
          where: { id: existing.id },
          data: {
            planId: plan.id,
            status: 'PENDING',
            currentPeriodStart: now,
            currentPeriodEnd: endDate,
            canceledAt: null,
          },
        })
      : await prisma.subscription.create({
          data: {
            userId: user.id,
            planId: plan.id,
            status: 'PENDING',
            currentPeriodStart: now,
            currentPeriodEnd: endDate,
          },
        });

    // Record payment as pending
    await prisma.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount: priceEur,
        currency: 'EUR',
        status: 'PENDING',
        provider: 'nowpayments',
        nowPaymentId: String(invoice.id),
      },
    });

    // Return the invoice URL for redirect
    const invoiceUrl = invoice.invoice_url || `https://nowpayments.io/payment/?iid=${invoice.id}`;

    console.log(`[NOWPayments] ✅ Invoice ${invoice.id} created for user ${user.id}, plan: ${plan.slug}`);

    res.json({
      success: true,
      data: { url: invoiceUrl, invoiceId: invoice.id },
    });
  } catch (error) {
    console.error('[NOWPayments] create-payment error:', error);
    next(error);
  }
});

// ============================================================================
// POST /api/nowpayments/webhook - IPN (Instant Payment Notification)
// ============================================================================

nowpaymentsRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Verify signature
    const sig = body.signature || req.headers['x-nowpayments-sig'];
    if (NP_IPN_SECRET && sig) {
      if (!verifyIpnSignature(body, sig)) {
        console.error('[NOWPayments IPN] ❌ Invalid signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    const {
      payment_id,
      payment_status,
      order_id,
      price_amount,
      price_currency,
      pay_amount,
      pay_currency,
      invoice_id,
      actually_paid,
    } = body;

    console.log(`[NOWPayments IPN] Received: status=${payment_status}, invoice=${invoice_id}, payment=${payment_id}, order=${order_id}`);

    // Find the payment by nowPaymentId (invoice_id)
    const npId = String(invoice_id || payment_id);
    let payment = await prisma.payment.findUnique({
      where: { nowPaymentId: npId },
      include: { subscription: true },
    });

    // If not found by invoice_id, try with payment_id
    if (!payment && payment_id) {
      payment = await prisma.payment.findUnique({
        where: { nowPaymentId: String(payment_id) },
        include: { subscription: true },
      });
    }

    // If still not found, try to match via order_id (userId_planSlug_timestamp)
    if (!payment && order_id) {
      const parts = String(order_id).split('_');
      const userId = parts[0];
      if (userId) {
        const subscription = await prisma.subscription.findUnique({
          where: { userId },
          include: { plan: true },
        });
        if (subscription) {
          // Find pending payment for this subscription
          payment = await prisma.payment.findFirst({
            where: {
              subscriptionId: subscription.id,
              provider: 'nowpayments',
              status: 'PENDING',
            },
            include: { subscription: true },
          }) as any;
        }
      }
    }

    if (!payment) {
      console.warn(`[NOWPayments IPN] ⚠️ No matching payment found for invoice=${invoice_id}, payment=${payment_id}`);
      // Still return 200 so NOWPayments doesn't retry indefinitely
      return res.json({ received: true });
    }

    // Map NOWPayments status to our status
    // NOWPayments statuses: waiting, confirming, confirmed, sending, partially_paid, finished, failed, refunded, expired
    const statusMap: Record<string, string> = {
      waiting: 'PENDING',
      confirming: 'PENDING',
      confirmed: 'PENDING',
      sending: 'PENDING',
      partially_paid: 'PENDING',
      finished: 'COMPLETED',
      failed: 'FAILED',
      refunded: 'REFUNDED',
      expired: 'FAILED',
    };

    const newPaymentStatus = statusMap[payment_status] || 'PENDING';

    // Update payment record
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newPaymentStatus,
        nowPaymentId: String(payment_id || invoice_id),
        currency: pay_currency ? pay_currency.toUpperCase() : payment.currency,
      },
    });

    // If payment is finished → activate subscription
    if (payment_status === 'finished') {
      const sub = payment.subscription;
      if (sub) {
        const plan = await prisma.subscriptionPlan.findUnique({ where: { id: sub.planId } });
        const now = new Date();
        const endDate = plan
          ? new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000)
          : sub.currentPeriodEnd;

        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: endDate,
          },
        });

        console.log(`[NOWPayments IPN] ✅ Subscription ACTIVATED for user ${sub.userId}, payment ${payment_id}`);
      }
    }

    // If payment failed/expired → mark subscription as expired
    if (payment_status === 'failed' || payment_status === 'expired') {
      const sub = payment.subscription;
      if (sub && sub.status === 'PENDING') {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'EXPIRED' },
        });
        console.log(`[NOWPayments IPN] ❌ Payment ${payment_status} → subscription expired for user ${sub.userId}`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[NOWPayments IPN] Error:', error);
    // Return 200 to avoid infinite retries
    res.json({ received: true });
  }
});

// ============================================================================
// GET /api/nowpayments/status/:invoiceId - Check payment status
// ============================================================================

nowpaymentsRouter.get('/status/:invoiceId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { invoiceId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { nowPaymentId: invoiceId },
      include: { subscription: true },
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment not found' });
    }

    // Optionally fetch latest status from NOWPayments API
    if (NP_API_KEY && payment.status === 'PENDING') {
      try {
        const npStatus = await npFetch(`/payment/${invoiceId}`);
        if (npStatus && npStatus.payment_status) {
          return res.json({
            success: true,
            data: {
              localStatus: payment.status,
              npStatus: npStatus.payment_status,
              subscription: payment.subscription,
            },
          });
        }
      } catch {
        // Fall through to return local data
      }
    }

    res.json({
      success: true,
      data: {
        localStatus: payment.status,
        subscription: payment.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// POST /api/nowpayments/sync - Sync pending payment → activate if confirmed
// Called by frontend when user returns from payment page
// ============================================================================

nowpaymentsRouter.post('/sync', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = req.user!;

    // Find user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      include: { plan: true },
    });

    if (!subscription) {
      return res.json({ success: true, data: { status: 'NO_SUBSCRIPTION' } });
    }

    // Already active? Return immediately
    if (subscription.status === 'ACTIVE' && subscription.currentPeriodEnd > new Date()) {
      return res.json({ success: true, data: { status: 'ACTIVE', subscription } });
    }

    // Find the latest pending nowpayments payment
    const payment = await prisma.payment.findFirst({
      where: {
        subscriptionId: subscription.id,
        provider: 'nowpayments',
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!payment || !payment.nowPaymentId) {
      return res.json({ success: true, data: { status: subscription.status } });
    }

    if (!NP_API_KEY) {
      return res.json({ success: true, data: { status: subscription.status } });
    }

    // Try fetching invoice status from NowPayments API
    let npPaymentStatus: string | null = null;

    // First try invoice endpoint
    try {
      const invoiceData = await npFetch(`/invoice/${payment.nowPaymentId}`);
      if (invoiceData?.payment_status) {
        npPaymentStatus = invoiceData.payment_status;
      }
    } catch { /* ignore */ }

    // Fallback: try payment endpoint
    if (!npPaymentStatus) {
      try {
        const paymentData = await npFetch(`/payment/${payment.nowPaymentId}`);
        if (paymentData?.payment_status) {
          npPaymentStatus = paymentData.payment_status;
        }
      } catch { /* ignore */ }
    }

    console.log(`[NOWPayments Sync] user=${user.id} invoiceId=${payment.nowPaymentId} status=${npPaymentStatus}`);

    if (npPaymentStatus === 'finished') {
      const plan = subscription.plan;
      const now = new Date();
      const endDate = plan
        ? new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000)
        : subscription.currentPeriodEnd;

      const updatedSub = await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'ACTIVE', currentPeriodStart: now, currentPeriodEnd: endDate },
        include: { plan: true },
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED' },
      });

      console.log(`[NOWPayments Sync] ✅ Subscription ACTIVATED for user ${user.id}`);
      return res.json({ success: true, data: { status: 'ACTIVE', subscription: updatedSub } });
    }

    return res.json({
      success: true,
      data: { status: subscription.status, npStatus: npPaymentStatus },
    });
  } catch (error) {
    next(error);
  }
});
