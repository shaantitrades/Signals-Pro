import { Router, Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

export const subscriptionRouter = Router();

// ============================================================================
// Stripe client
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

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
// POST /api/subscriptions/create-checkout - Create a Stripe Checkout Session
// ============================================================================

subscriptionRouter.post('/create-checkout', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    // Validate Stripe is configured
    const stripeKey = process.env.STRIPE_SECRET_KEY || '';
    if (!stripeKey || stripeKey === 'sk_test_placeholder') {
      console.error('[Stripe] STRIPE_SECRET_KEY not configured');
      return res.status(503).json({ success: false, error: 'Payment system is not configured. Please contact support.' });
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

    if (!plan.stripePriceId) {
      return res.status(400).json({ success: false, error: 'Plan is not configured for Stripe payments' });
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

    // Get or create Stripe customer
    const fullUser = await prisma.user.findUnique({ where: { id: user.id } });
    let stripeCustomerId = fullUser?.stripeCustomerId;

    // Verify existing customer still exists in Stripe (handles account migration)
    if (stripeCustomerId) {
      try {
        await stripe.customers.retrieve(stripeCustomerId);
      } catch (err: any) {
        console.warn(`[Stripe] Customer ${stripeCustomerId} not found, creating new one`);
        stripeCustomerId = null;
      }
    }

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: fullUser!.email,
        name: `${fullUser!.firstName} ${fullUser!.lastName}`,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    // All plans are recurring subscriptions
    const frontendUrl = (() => {
      const raw = process.env.FRONTEND_URL || 'https://marketsignals24.com';
      // Guard against Coolify injecting internal IP addresses
      if (raw.includes('://62.') || raw.includes('://10.') || raw.includes('://172.') || raw.includes('://192.168.') || raw.startsWith('http://')) {
        return 'https://marketsignals24.com';
      }
      return raw;
    })();

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${frontendUrl}/dashboard/signals?payment=success&plan=${plan.slug}`,
      cancel_url: `${frontendUrl}/tarifs?payment=cancelled`,
      client_reference_id: user.id,
      metadata: {
        userId: user.id,
        planId: plan.id,
        planSlug: plan.slug,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: plan.id,
          planSlug: plan.slug,
        },
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({
      success: true,
      data: { url: session.url },
    });
  } catch (error: any) {
    console.error('[Stripe] create-checkout error:', error?.message || error);
    // Surface Stripe-specific errors to the client
    if (error?.type && error.type.startsWith('Stripe')) {
      return res.status(502).json({
        success: false,
        error: `Stripe error: ${error.message}`,
      });
    }
    // Surface raw message for better debugging
    if (error?.message) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
    next(error);
  }
});

// ============================================================================
// POST /api/subscriptions/create - Create subscription (manual / free trial)
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

    // Only allow manual creation for free/trial plans
    if (Number(plan.priceEur) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Paid plans must go through Stripe checkout',
      });
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
            status: 'TRIAL',
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
            status: 'TRIAL',
            currentPeriodStart: now,
            currentPeriodEnd: endDate,
          },
          include: { plan: true },
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

    // Cancel on Stripe if there's a Stripe subscription
    if (subscription.stripeSubId) {
      try {
        await stripe.subscriptions.update(subscription.stripeSubId, {
          cancel_at_period_end: true,
        });
      } catch (stripeError) {
        console.error('[Stripe] cancel error:', stripeError);
        // Continue with local cancellation even if Stripe fails
      }
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

// ============================================================================
// POST /api/subscriptions/webhook - Stripe Webhook
// ============================================================================

subscriptionRouter.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  let event: Stripe.Event;

  try {
    // req.body is a raw Buffer because of express.raw() middleware on this path
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook signature verification failed` });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      // ── Checkout completed ─────────────────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      // ── Subscription updated (renewal, plan change) ────────────────
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      // ── Subscription deleted / cancelled ───────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      // ── Invoice paid (recurring payment success) ───────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      // ── Invoice payment failed ─────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(invoice);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`[Stripe Webhook] Error handling ${event.type}:`, error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// ============================================================================
// Webhook Handlers
// ============================================================================

/**
 * Handle checkout.session.completed
 * Creates or updates the user's subscription and records the payment.
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  let userId = session.metadata?.userId;
  let planId = session.metadata?.planId;

  // Fallback: try client_reference_id for userId
  if (!userId && session.client_reference_id) {
    userId = session.client_reference_id;
  }

  // Fallback: try to get metadata from the Stripe subscription object
  if ((!userId || !planId) && session.subscription) {
    try {
      const stripeSub = await stripe.subscriptions.retrieve(String(session.subscription));
      if (!userId) userId = stripeSub.metadata?.userId;
      if (!planId) planId = stripeSub.metadata?.planId;
    } catch (err) {
      console.error('[Stripe Webhook] Failed to retrieve subscription for metadata fallback:', err);
    }
  }

  // Last resort: find user by Stripe customer ID
  if (!userId && session.customer) {
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: String(session.customer) },
    });
    if (user) userId = user.id;
  }

  if (!userId) {
    console.error('[Stripe Webhook] checkout.session.completed: could not determine userId from metadata, client_reference_id, or customer:', session.metadata);
    return;
  }

  // If planId is still missing, try to find it from subscription_data metadata or the plan slug in session metadata
  if (!planId && session.metadata?.planSlug) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: session.metadata.planSlug } });
    if (plan) planId = plan.id;
  }

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!plan) {
    console.error('[Stripe Webhook] Plan not found:', planId);
    return;
  }

  // Ensure stripeCustomerId is stored on the user
  if (session.customer) {
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: session.customer as string },
    });
  }

  const now = new Date();
  const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

  // Get Stripe subscription ID if mode is subscription
  const stripeSubId = session.subscription ? String(session.subscription) : null;

  // Create or update subscription
  const existing = await prisma.subscription.findUnique({ where: { userId } });

  const subscriptionData = {
    planId: plan.id,
    status: 'ACTIVE',
    stripeSubId,
    currentPeriodStart: now,
    currentPeriodEnd: endDate,
    canceledAt: null,
  };

  const subscription = existing
    ? await prisma.subscription.update({
        where: { id: existing.id },
        data: subscriptionData,
      })
    : await prisma.subscription.create({
        data: {
          userId,
          ...subscriptionData,
        },
      });

  // Record payment
  const amountPaid = session.amount_total ? session.amount_total / 100 : Number(plan.priceEur);
  await prisma.payment.create({
    data: {
      subscriptionId: subscription.id,
      amount: amountPaid,
      currency: (session.currency || 'eur').toUpperCase(),
      status: 'COMPLETED',
      stripePaymentId: session.payment_intent ? String(session.payment_intent) : session.id,
    },
  });

  console.log(`[Stripe Webhook] ✅ Subscription activated for user ${userId}, plan: ${plan.slug}`);
}

/**
 * Handle customer.subscription.updated (plan change, renewal)
 */
async function handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription) {
  const userId = stripeSubscription.metadata?.userId;
  if (!userId) {
    console.warn('[Stripe Webhook] subscription.updated missing userId in metadata');
    return;
  }

  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription) {
    console.warn('[Stripe Webhook] No local subscription found for user:', userId);
    return;
  }

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: 'ACTIVE',
    past_due: 'ACTIVE', // Keep active but flag
    canceled: 'CANCELED',
    unpaid: 'EXPIRED',
    incomplete: 'PENDING',
    incomplete_expired: 'EXPIRED',
    trialing: 'TRIAL',
  };

  const newStatus = statusMap[stripeSubscription.status] || 'ACTIVE';

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: newStatus,
      stripeSubId: stripeSubscription.id,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      canceledAt: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : null,
    },
  });

  console.log(`[Stripe Webhook] ✅ Subscription updated for user ${userId}: ${newStatus}`);
}

/**
 * Handle customer.subscription.deleted
 */
async function handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription) {
  const userId = stripeSubscription.metadata?.userId;
  if (!userId) {
    // Try to find by stripeSubId
    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubId: stripeSubscription.id },
    });
    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'EXPIRED', canceledAt: new Date() },
      });
      console.log(`[Stripe Webhook] ✅ Subscription expired (by stripeSubId): ${stripeSubscription.id}`);
    }
    return;
  }

  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription) return;

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: 'EXPIRED',
      canceledAt: new Date(),
    },
  });

  console.log(`[Stripe Webhook] ✅ Subscription expired for user ${userId}`);
}

/**
 * Handle invoice.payment_succeeded (recurring billing)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubId: String(invoice.subscription) },
  });

  if (!subscription) return;

  // Record the payment
  await prisma.payment.create({
    data: {
      subscriptionId: subscription.id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'COMPLETED',
      stripePaymentId: invoice.payment_intent ? String(invoice.payment_intent) : invoice.id,
    },
  });

  // Ensure subscription is active
  if (subscription.status !== 'ACTIVE') {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'ACTIVE' },
    });
  }

  console.log(`[Stripe Webhook] ✅ Invoice paid for subscription ${subscription.id}`);
}

/**
 * Handle invoice.payment_failed
 */
async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  const subscription = await prisma.subscription.findFirst({
    where: { stripeSubId: String(invoice.subscription) },
  });

  if (!subscription) return;

  // Record the failed payment
  await prisma.payment.create({
    data: {
      subscriptionId: subscription.id,
      amount: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'FAILED',
      stripePaymentId: invoice.payment_intent ? String(invoice.payment_intent) : invoice.id,
    },
  });

  console.log(`[Stripe Webhook] ⚠️ Invoice payment failed for subscription ${subscription.id}`);
}
