'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function TarifsPage() {
  const { t } = useI18n();

  const plans = [
    {
      nameKey: 'pricing.plan24h',
      price: '$9',
      popular: false,
      stripeLink: 'https://buy.stripe.com/test_24h',
    },
    {
      nameKey: 'pricing.plan48h',
      price: '$14',
      popular: false,
      stripeLink: 'https://buy.stripe.com/test_48h',
    },
    {
      nameKey: 'pricing.planWeekly',
      price: '$35',
      popular: true,
      stripeLink: 'https://buy.stripe.com/test_weekly',
    },
    {
      nameKey: 'pricing.planMonthly',
      price: '$99',
      popular: false,
      stripeLink: 'https://buy.stripe.com/test_monthly',
    },
  ];

  const features = [
    'pricing.feat1',
    'pricing.feat2',
    'pricing.feat3',
  ];

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
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-10 sm:mb-14">
            {t('pricing.desc')}
          </p>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.nameKey}
                className={`relative rounded-xl border p-6 flex flex-col ${
                  plan.popular
                    ? 'border-primary ring-2 ring-primary bg-card shadow-lg'
                    : 'border-border bg-card'
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-[#1a1a2e] text-white text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                      <span className="text-yellow-400">★</span> {t('pricing.mostPopular')}
                    </span>
                  </div>
                )}

                {/* Plan name + Price */}
                <h3 className="text-lg font-semibold text-center mb-3 mt-1">{t(plan.nameKey)}</h3>
                <div className="text-center mb-5">
                  <span className="text-4xl font-bold">{plan.price}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-1">
                  {features.map((fKey) => (
                    <li key={fKey} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500 font-bold">✓</span>
                      <span>{t(fKey)}</span>
                    </li>
                  ))}
                </ul>

                {/* Stripe button */}
                <a
                  href={plan.stripeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full bg-[#1a1a2e] hover:bg-[#2d1b69] text-white rounded-lg px-4 py-2.5 mb-3 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="bg-purple-500/30 text-purple-300 text-xs font-bold px-2 py-0.5 rounded">Stripe</span>
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide">
                    {t('pricing.buyStripe')}
                  </span>
                </a>

                {/* Crypto separator */}
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2 text-center">
                  {t('pricing.orPayCrypto')}
                </p>

                {/* Crypto button */}
                <a
                  href="#"
                  className="flex items-center justify-between w-full bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2.5 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{t('pricing.cryptoPayment')}</span>
                    <span className="text-xs text-white/70">{t('pricing.cryptoCoins')}</span>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide">
                    {t('pricing.choose')}
                  </span>
                </a>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <p className="text-center text-sm text-muted-foreground mt-10">
            {t('pricing.bottomNote')}
          </p>
        </div>
      </section>
    </div>
  );
}
