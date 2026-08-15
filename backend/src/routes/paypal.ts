import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  ApiError,
  CheckoutPaymentIntent,
  Client,
  Environment,
  LogLevel,
  OrdersController,
  OrderStatus,
  SubscriptionsController,
} from '@paypal/paypal-server-sdk';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { emitSubscriptionUpdated } from '../websocket/index';

export const paypalRouter = Router();

// ============================================================================
// PayPal client
// ============================================================================

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';

function getPayPalEnvironment(): Environment {
  const explicit = (process.env.PAYPAL_ENVIRONMENT || '').toLowerCase();
  if (explicit === 'sandbox') return Environment.Sandbox;
  if (explicit === 'production') return Environment.Production;
  // Fallback to NODE_ENV
  return process.env.NODE_ENV === 'production'
    ? Environment.Production
    : Environment.Sandbox;
}

const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID,
    oAuthClientSecret: PAYPAL_CLIENT_SECRET,
  },
  timeout: 0,
  environment: getPayPalEnvironment(),
  logging: {
    logLevel: LogLevel.Info,
    logRequest: { logBody: true },
    logResponse: { logHeaders: true },
  },
});

const ordersController = new OrdersController(client);
const subscriptionsController = new SubscriptionsController(client);

function isPayPalConfigured(): boolean {
  return Boolean(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET);
}

/**
 * Extract a human-readable message from a PayPal SDK error.
 */
function paypalErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const detail = (error as any).result || (error as any).body;
    const details = detail?.details?.[0];
    if (details) {
      return `${details.issue || 'PayPal error'} ${details.description || ''}`.trim();
    }
    return error.message || 'PayPal error';
  }
  if (error instanceof Error) return error.message;
  return 'PayPal error';
}

// ============================================================================
// POST /api/paypal/create-order - Create a one-time PayPal order (CAPTURE)
// ============================================================================

paypalRouter.post(
  '/create-order',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!isPayPalConfigured()) {
        return res.status(503).json({
          success: false,
          error: 'PayPal payment is not configured. Please contact support.',
        });
      }

      const { planSlug } = req.body;
      const user = req.user!;

      if (!planSlug) {
        return res.status(400).json({ success: false, error: 'planSlug is required' });
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

      if (
        existing &&
        existing.status === 'ACTIVE' &&
        existing.currentPeriodEnd > new Date()
      ) {
        return res.status(409).json({
          success: false,
          error: 'You already have an active subscription',
        });
      }

      const priceEur = Number(plan.priceEur);

      const { result: order } = await ordersController.createOrder({
        body: {
          intent: CheckoutPaymentIntent.Capture,
          purchaseUnits: [
            {
              referenceId: plan.slug,
              description: `MarketSignals24 - ${plan.name}`,
              customId: user.id,
              amount: {
                currencyCode: 'EUR',
                value: priceEur.toFixed(2),
              },
            },
          ],
        },
        prefer: 'return=minimal',
      });

      if (!order.id) {
        console.error('[PayPal] createOrder returned no id:', order);
        return res
          .status(502)
          .json({ success: false, error: 'Failed to create PayPal order' });
      }

      // Store a PENDING subscription + payment (mirrors the NOWPayments flow)
      const now = new Date();
      const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

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

      await prisma.payment.create({
        data: {
          subscriptionId: subscription.id,
          amount: priceEur,
          currency: 'EUR',
          status: 'PENDING',
          provider: 'paypal',
          paypalPaymentId: order.id,
        },
      });

      console.log(
        `[PayPal] ✅ Order ${order.id} created for user ${user.id}, plan: ${plan.slug}`
      );

      res.json({ success: true, data: { orderId: order.id } });
    } catch (error) {
      console.error('[PayPal] create-order error:', error);
      res.status(502).json({ success: false, error: paypalErrorMessage(error) });
    }
  }
);

// ============================================================================
// POST /api/paypal/capture-order/:orderID - Capture the approved payment
// ============================================================================

paypalRouter.post(
  '/capture-order/:orderID',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!isPayPalConfigured()) {
        return res.status(503).json({
          success: false,
          error: 'PayPal payment is not configured. Please contact support.',
        });
      }

      const { orderID } = req.params;
      const user = req.user!;

      const payment = await prisma.payment.findFirst({
        where: { paypalPaymentId: orderID, provider: 'paypal' },
        include: { subscription: { include: { plan: true } } },
      });

      if (!payment) {
        return res
          .status(404)
          .json({ success: false, error: 'PayPal order not found' });
      }

      if (payment.subscription.userId !== user.id) {
        return res
          .status(403)
          .json({ success: false, error: 'This order does not belong to you' });
      }

      const { result: capture } = await ordersController.captureOrder({
        id: orderID,
        prefer: 'return=minimal',
      });

      if (capture.status === OrderStatus.Completed) {
        const sub = payment.subscription;
        const plan = sub.plan;
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

        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'COMPLETED' },
        });

        // Notify frontend via WebSocket (same as Stripe / NOWPayments)
        emitSubscriptionUpdated(user.id);

        console.log(
          `[PayPal] ✅ Order ${orderID} captured, subscription ACTIVATED for user ${user.id}`
        );

        return res.json({ success: true, data: { status: 'COMPLETED' } });
      }

      // Not completed (e.g. declined) — mark payment failed
      console.warn(`[PayPal] Order ${orderID} capture status: ${capture.status}`);
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      return res.status(402).json({
        success: false,
        error: `Payment not completed (${capture.status || 'UNKNOWN'})`,
      });
    } catch (error) {
      console.error('[PayPal] capture-order error:', error);
      res.status(502).json({ success: false, error: paypalErrorMessage(error) });
    }
  }
);

// ============================================================================
// Recurring payments (Subscriptions API)
// ============================================================================

function getFrontendUrl(): string {
  const raw = process.env.FRONTEND_URL || 'https://marketsignals24.com';
  if (
    raw.includes('://62.') ||
    raw.includes('://10.') ||
    raw.includes('://172.') ||
    raw.includes('://192.168.') ||
    raw.startsWith('http://')
  ) {
    return 'https://marketsignals24.com';
  }
  return raw;
}

// --- Webhook signature verification (PayPal) --------------------------------

const CRC_TABLE: number[] = (() => {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(str: string): number {
  let crc = 0 ^ -1;
  for (let i = 0; i < str.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ str.charCodeAt(i)) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

async function verifyPayPalWebhook(
  rawBody: string,
  headers: Record<string, string | string[] | undefined>
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID || '';
  if (!webhookId) return false;

  const get = (name: string): string | undefined => {
    const v = headers[name];
    return Array.isArray(v) ? v[0] : v;
  };

  const transmissionId = get('paypal-transmission-id');
  const transmissionTime = get('paypal-transmission-time');
  const transmissionSig = get('paypal-transmission-sig');
  const certUrl = get('paypal-cert-url');

  if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl) {
    return false;
  }

  const crc = crc32(rawBody);
  const expectedSignature = `${transmissionId}|${transmissionTime}|${webhookId}|${crc}`;

  try {
    const certRes = await fetch(certUrl);
    const cert = await certRes.text();
    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(expectedSignature);
    verifier.end();
    return verifier.verify(cert, transmissionSig, 'base64');
  } catch (err) {
    console.error('[PayPal Webhook] signature verification error:', err);
    return false;
  }
}

// ============================================================================
// POST /api/paypal/create-subscription - Start a recurring subscription
// ============================================================================

paypalRouter.post(
  '/create-subscription',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!isPayPalConfigured()) {
        return res.status(503).json({
          success: false,
          error: 'PayPal payment is not configured. Please contact support.',
        });
      }

      const { planSlug } = req.body;
      const user = req.user!;

      if (!planSlug) {
        return res.status(400).json({ success: false, error: 'planSlug is required' });
      }

      const plan = await prisma.subscriptionPlan.findUnique({
        where: { slug: planSlug },
      });

      if (!plan || !plan.isActive) {
        return res.status(404).json({ success: false, error: 'Plan not found' });
      }

      if (!plan.paypalPlanId) {
        return res.status(400).json({
          success: false,
          error: 'Plan is not configured for PayPal payments',
        });
      }

      // Check existing active subscription
      const existing = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      if (
        existing &&
        existing.status === 'ACTIVE' &&
        existing.currentPeriodEnd > new Date()
      ) {
        return res.status(409).json({
          success: false,
          error: 'You already have an active subscription',
        });
      }

      const frontendUrl = getFrontendUrl();

      const { result: subscription } =
        await subscriptionsController.createSubscription({
          body: {
            planId: plan.paypalPlanId,
            customId: user.id,
            subscriber: { emailAddress: user.email },
            applicationContext: {
              brandName: 'Market Signals24',
              returnUrl: `${frontendUrl}/dashboard/signals?payment=success&plan=${plan.slug}`,
              cancelUrl: `${frontendUrl}/tarifs?payment=cancelled`,
            },
          },
          prefer: 'return=representation',
        });

      if (!subscription.id) {
        console.error('[PayPal] createSubscription returned no id:', subscription);
        return res
          .status(502)
          .json({ success: false, error: 'Failed to create PayPal subscription' });
      }

      const approveUrl = subscription.links?.find((l) => l.rel === 'approve')?.href;

      // Store a PENDING subscription (activation happens via webhook)
      const now = new Date();
      const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

      const localSub = existing
        ? await prisma.subscription.update({
            where: { id: existing.id },
            data: {
              planId: plan.id,
              status: 'PENDING',
              currentPeriodStart: now,
              currentPeriodEnd: endDate,
              canceledAt: null,
              paypalSubId: subscription.id,
            },
          })
        : await prisma.subscription.create({
            data: {
              userId: user.id,
              planId: plan.id,
              status: 'PENDING',
              currentPeriodStart: now,
              currentPeriodEnd: endDate,
              paypalSubId: subscription.id,
            },
          });

      console.log(
        `[PayPal] ✅ Subscription ${subscription.id} created for user ${user.id}, plan: ${plan.slug} (local #${localSub.id})`
      );

      res.json({
        success: true,
        data: { subscriptionId: subscription.id, approveUrl },
      });
    } catch (error) {
      console.error('[PayPal] create-subscription error:', error);
      res.status(502).json({ success: false, error: paypalErrorMessage(error) });
    }
  }
);

// ============================================================================
// POST /api/paypal/webhook - PayPal event notifications (recurring billing)
// ============================================================================

paypalRouter.post('/webhook', async (req: Request, res: Response) => {
  try {
    const rawBody =
      typeof req.body === 'string'
        ? req.body
        : Buffer.isBuffer(req.body)
          ? req.body.toString('utf8')
          : JSON.stringify(req.body);

    const headers = req.headers as Record<string, string | string[] | undefined>;

    // Verify signature when PAYPAL_WEBHOOK_ID is configured
    if (process.env.PAYPAL_WEBHOOK_ID && !(await verifyPayPalWebhook(rawBody, headers))) {
      console.error('[PayPal Webhook] ❌ Invalid signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody);
    const eventType: string = event?.event_type || '';
    const resource = event?.resource || {};

    console.log(`[PayPal Webhook] Received: ${eventType}`);

    // Payment events reference resource.billing_agreement_id (the subscription);
    // subscription events reference resource.id.
    const isSaleEvent = eventType.startsWith('PAYMENT.SALE.');
    const subscriptionId = isSaleEvent
      ? resource?.billing_agreement_id
      : resource?.id;

    const findLocalSub = () =>
      prisma.subscription.findFirst({
        where: { paypalSubId: subscriptionId },
        include: { plan: true },
      });

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const sub = await findLocalSub();
        if (!sub) {
          console.warn(`[PayPal Webhook] ACTIVATED: no local subscription for ${subscriptionId}`);
          break;
        }
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'ACTIVE', canceledAt: null },
        });
        emitSubscriptionUpdated(sub.userId);
        console.log(`[PayPal Webhook] ✅ Subscription ACTIVATED for user ${sub.userId}`);
        break;
      }

      case 'PAYMENT.SALE.COMPLETED': {
        const sub = await findLocalSub();
        if (!sub) {
          console.warn(`[PayPal Webhook] SALE.COMPLETED: no local subscription for ${subscriptionId}`);
          break;
        }

        const saleId: string | null = resource?.id || null;
        const amount = resource?.amount?.total
          ? Number(resource.amount.total)
          : Number(sub.plan?.priceEur || 0);
        const currency = (resource?.amount?.currency || 'EUR').toUpperCase();

        // Extend access period (initial payment + each renewal)
        const now = new Date();
        const endDate = sub.plan
          ? new Date(now.getTime() + sub.plan.durationDays * 24 * 60 * 60 * 1000)
          : sub.currentPeriodEnd;

        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: endDate,
            canceledAt: null,
          },
        });

        // Record the payment (idempotent)
        if (saleId) {
          const exists = await prisma.payment.findUnique({
            where: { paypalPaymentId: saleId },
          });
          if (!exists) {
            await prisma.payment.create({
              data: {
                subscriptionId: sub.id,
                amount,
                currency,
                status: 'COMPLETED',
                provider: 'paypal',
                paypalPaymentId: saleId,
              },
            });
          }
        }

        emitSubscriptionUpdated(sub.userId);
        console.log(`[PayPal Webhook] ✅ Payment ${amount} ${currency} recorded for user ${sub.userId}`);
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        const sub = await findLocalSub();
        if (!sub) break;
        const status =
          eventType === 'BILLING.SUBSCRIPTION.CANCELLED' ? 'CANCELED' : 'EXPIRED';
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status, canceledAt: new Date() },
        });
        emitSubscriptionUpdated(sub.userId);
        console.log(`[PayPal Webhook] Subscription ${status} for user ${sub.userId}`);
        break;
      }

      default:
        console.log(`[PayPal Webhook] Unhandled event: ${eventType}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('[PayPal Webhook] Error:', error);
    // Always return 200 so PayPal doesn't retry indefinitely
    res.json({ received: true });
  }
});
