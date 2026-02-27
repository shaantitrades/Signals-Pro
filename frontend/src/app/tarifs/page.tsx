'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Plan {
  id: string;
  name: string;
  slug: string;
  priceEur: string | number;
  durationDays: number;
  features: string;
  stripePriceId: string | null;
  sortOrder: number;
}

// Slug → i18n key mapping
const slugNameKeys: Record<string, string> = {
  'pass-24h': 'pricing.plan24h',
  'pass-48h': 'pricing.plan48h',
  'weekly': 'pricing.planWeekly',
  'monthly': 'pricing.planMonthly',
};

// Original "before promo" prices (barré)
const originalPrices: Record<string, number> = {
  'pass-24h': 12,
  'pass-48h': 18,
  'weekly': 45,
  'monthly': 150,
};

// Discount percentages for badges
const discountPercent: Record<string, number> = {
  'pass-24h': 50,
  'pass-48h': 44,
  'weekly': 44,
  'monthly': 43,
};

const popularSlug = 'weekly';

export default function TarifsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutSlug, setCheckoutSlug] = useState<string | null>(null);
  const [cryptoSlug, setCryptoSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check for payment=cancelled query param
  const [cancelled, setCancelled] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'cancelled') {
        setCancelled(true);
      }
    }
  }, []);

  // Fetch plans from API
  useEffect(() => {
    api
      .get('/subscriptions/plans')
      .then((res) => {
        setPlans(res.data.data || []);
      })
      .catch(() => {
        setPlans([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const features = [
    'pricing.feat1',
    'pricing.feat2',
    'pricing.feat3',
  ];

  const handleCheckout = async (slug: string) => {
    setCheckoutSlug(slug);
    setError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      router.push(`/login?redirect=/tarifs`);
      return;
    }

    try {
      const res = await api.post('/subscriptions/create-checkout', { planSlug: slug });
      const url = res.data?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        setError(t('pricing.errorCheckout'));
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || t('pricing.errorCheckout');
      setError(msg);
    } finally {
      setCheckoutSlug(null);
    }
  };

  const handleCrypto = async (slug: string) => {
    setCryptoSlug(slug);
    setError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      router.push(`/login?redirect=/tarifs`);
      return;
    }

    try {
      const res = await api.post('/nowpayments/create-payment', { planSlug: slug });
      const url = res.data?.data?.url;
      if (url) {
        window.location.href = url;
      } else {
        setError(t('pricing.errorCheckout'));
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || t('pricing.errorCheckout');
      setError(msg);
    } finally {
      setCryptoSlug(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-border">
        <Link
          href="/dashboard/signals"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('pricing.backToSignals')}
        </Link>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </div>

      {/* Pricing Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-3">
            {t('pricing.title')}
          </h1>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-6">
            {t('pricing.desc')}
          </p>

          {/* Promo Banner */}
          <div className="mx-auto max-w-2xl mb-10 sm:mb-14 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-xl p-[2px]">
            <div className="bg-card rounded-[10px] px-5 py-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <span className="font-bold text-lg text-foreground">{t('pricing.promoTitle')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                  {t('pricing.promoLimited')}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t('pricing.promoExpiry')}
                </span>
              </div>
            </div>
          </div>

          {/* Cancelled banner */}
          {cancelled && (
            <div className="mx-auto max-w-lg mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 rounded-lg px-4 py-3 text-center text-sm">
              {t('pricing.paymentCancelled')}
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="mx-auto max-w-lg mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200 rounded-lg px-4 py-3 text-center text-sm">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            /* Plans Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {plans.map((plan) => {
                const isPopular = plan.slug === popularSlug;
                const price = typeof plan.priceEur === 'string' ? parseFloat(plan.priceEur) : plan.priceEur;
                const nameKey = slugNameKeys[plan.slug] || plan.slug;
                const oldPrice = originalPrices[plan.slug];
                const discount = discountPercent[plan.slug];

                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-xl border p-6 flex flex-col ${
                      isPopular
                        ? 'border-primary ring-2 ring-primary bg-card shadow-lg'
                        : 'border-border bg-card'
                    }`}
                  >
                    {/* Popular badge */}
                    {isPopular && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 bg-primary text-white text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                          <span className="text-yellow-300">★</span> {t('pricing.mostPopular')}
                        </span>
                      </div>
                    )}

                    {/* Discount badge */}
                    {discount && (
                      <div className="absolute -top-3 -right-3">
                        <span className="inline-flex items-center justify-center bg-red-500 text-white text-[11px] font-bold w-12 h-12 rounded-full shadow-lg">
                          -{discount}%
                        </span>
                      </div>
                    )}

                    {/* Plan name */}
                    <h3 className="text-lg font-semibold text-center mb-3 mt-1">{t(nameKey)}</h3>

                    {/* Old price (barré) */}
                    {oldPrice && (
                      <div className="text-center mb-1">
                        <span className="text-lg text-muted-foreground line-through">${oldPrice}</span>
                      </div>
                    )}

                    {/* Promo price */}
                    <div className="text-center mb-1">
                      <span className="text-4xl font-bold text-green-600 dark:text-green-400">${price}</span>
                    </div>

                    {/* Duration label */}
                    <p className="text-xs text-muted-foreground text-center mb-5">
                      {plan.durationDays === 1 && t('pricing.per24h')}
                      {plan.durationDays === 2 && t('pricing.per48h')}
                      {plan.durationDays === 7 && t('pricing.perWeek')}
                      {plan.durationDays === 30 && t('pricing.perMonth')}
                      {plan.durationDays === 90 && t('pricing.perQuarter')}
                    </p>

                    {/* Features */}
                    <ul className="space-y-3 mb-6 flex-1">
                      {features.map((fKey) => (
                        <li key={fKey} className="flex items-center gap-2 text-sm">
                          <span className="text-green-500 font-bold">✓</span>
                          <span>{t(fKey)}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Stripe checkout button — BLUE */}
                    <button
                      onClick={() => handleCheckout(plan.slug)}
                      disabled={checkoutSlug !== null}
                      className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 mb-3 transition-colors cursor-pointer font-semibold"
                    >
                      {checkoutSlug === plan.slug ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                          </svg>
                          <span className="text-[12px] uppercase tracking-wide">
                            {t('pricing.buyStripe')}
                          </span>
                        </>
                      )}
                    </button>

                    {/* Crypto separator */}
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2 text-center">
                      {t('pricing.orPayCrypto')}
                    </p>

                    {/* Crypto button */}
                    <button
                      onClick={() => handleCrypto(plan.slug)}
                      disabled={cryptoSlug !== null}
                      className="flex items-center justify-between w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 transition-colors cursor-pointer"
                    >
                      {cryptoSlug === plan.slug ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                      ) : (
                        <>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">{t('pricing.cryptoPayment')}</span>
                            <span className="text-xs text-white/70">{t('pricing.cryptoCoins')}</span>
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-wide">
                            {t('pricing.choose')}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom note */}
          <p className="text-center text-sm text-muted-foreground mt-10">
            {t('pricing.bottomNote')}
          </p>
        </div>
      </section>
    </div>
  );
}
