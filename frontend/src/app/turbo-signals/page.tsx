import type { Metadata } from 'next';
import Link from 'next/link';
import { seoClusterLanguageMap } from '@/lib/seo-clusters';

export const metadata: Metadata = {
  title: 'Turbo Trading Signals — 1–5 Min OTC Alerts | MarketSignals24',
  description:
    'High-accuracy turbo trading signals for 1, 2 and 5-minute expiries. AI-powered UP/DOWN alerts on OTC pairs. Available 24/7, week-ends included.',
  keywords:
    'MarketSignals24, turbo trading signals, free turbo signals, OTC signals, free OTC signals, 1 minute signals, 5 minute signals, short-term trading signals, high low signals, AI trading signals, OTC trading signals, forex OTC signals, turbo signal, live turbo alerts',
  alternates: {
    canonical: 'https://marketsignals24.com/turbo-signals',
    languages: seoClusterLanguageMap('turbo'),
  },
  openGraph: {
    title: 'Turbo Trading Signals & OTC Alerts | MarketSignals24',
    description:
      '1–5 min turbo trading signals on OTC pairs. UP/DOWN alerts with accuracy up to 82%. 24/7 coverage.',
    url: 'https://marketsignals24.com/turbo-signals',
    siteName: 'MarketSignals24',
    type: 'website',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What are turbo trading signals?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Turbo trading signals tell you when to open a short-term trade (up or down) on a specific asset, with an exact expiry — usually 1, 2 or 5 minutes. Every signal specifies the asset, the direction and the expiry duration. MarketSignals24 publishes them for OTC pairs which trade 24/7, even when standard forex markets are closed.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is an OTC signal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'OTC (Over-The-Counter) signals are for synthetic or broker-internal instruments that simulate forex price movements but trade continuously, including weekends. They are available on most modern trading platforms, whatever broker you use. Our AI generates signals specifically tuned for OTC volatility patterns, which differ from live market conditions.',
      },
    },
    {
      '@type': 'Question',
      name: 'What expiry times do your turbo signals use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our signals primarily target 1-minute, 2-minute, and 5-minute expiries — the most popular timeframes for short-term and OTC traders. Each signal specifies the exact expiry duration and the trend direction to trade.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use these signals with my broker platform?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Our OTC signals work with any broker that offers OTC instruments. Simply open the corresponding OTC pair on your platform and enter the direction specified by the signal at the published time.',
      },
    },    {
      '@type': 'Question',
      name: 'How many OTC signals can I expect per day?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The number of signals varies with market conditions. On average, our engine generates between 15 and 40 OTC signals per day. Signals are only issued when the AI confidence score exceeds the minimum threshold — we prefer quality over quantity.',
      },
    },
  ],
};

const pairs = [
  'EUR/USD OTC', 'GBP/USD OTC', 'USD/JPY OTC', 'AUD/USD OTC',
  'EUR/JPY OTC', 'GBP/JPY OTC', 'USD/CHF OTC', 'NZD/USD OTC',
  'EUR/GBP OTC', 'USD/CAD OTC', 'AUD/JPY OTC', 'EUR/AUD OTC',
];

export default function TurboTradingSignalsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="min-h-screen bg-gray-950 text-white">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-black py-20 px-4">
          <div className="absolute inset-0 bg-yellow-400/5 pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="inline-block bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-sm font-medium px-4 py-1 rounded-full mb-6">
              OTC · 1–5 Min Expiry · 24/7 · Works With All Major Platforms
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="text-yellow-400">Turbo Trading &amp; OTC Signals</span> — AI-Powered UP/DOWN Alerts
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get ultra-short-term trade signals for OTC pairs and synthetic assets. Our AI fires UP or DOWN alerts for 1, 2, and 5-minute expiries — available 24/7, even on weekends when standard forex markets are closed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
                Start Free Today
              </Link>
              <Link href="/tarifs" className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-lg">
                Plans from €6
              </Link>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="py-12 px-4 border-y border-white/10 bg-gray-900/50">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '82%', label: 'Avg Win Rate (OTC)' },
              { value: '12+', label: 'OTC Pairs' },
              { value: '24/7', label: 'Including Weekends' },
              { value: '1–5m', label: 'Expiry Timeframes' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-yellow-400">{s.value}</p>
                <p className="text-gray-400 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <article className="max-w-4xl mx-auto px-4 py-16 space-y-12">

          <section>
            <h2 className="text-2xl font-bold mb-4">What Are Turbo OTC Signals?</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Turbo trading is a simplified form of short-term trading: you anticipate whether an asset's price will be higher or lower at a very short expiry — 1, 2 or 5 minutes. Each signal we publish states the asset, the direction (UP or DOWN), the exact expiry and the AI confidence score, so you always know what to trade and when.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              OTC (Over-The-Counter) instruments are synthetic assets that mirror real forex pairs but trade independently of live market hours. This means you can trade EUR/USD OTC on a Saturday evening when the actual forex market is closed. The price action is generated by the broker's internal model and tends to exhibit unique technical patterns that differ from live markets.
            </p>
            <p className="text-gray-300 leading-relaxed">
              MarketSignals24's AI has been specifically trained on OTC price data to recognise these patterns and generate high-accuracy signals for 1, 2, and 5-minute expiries. When the engine detects a strong directional signal, it publishes a UP or DOWN recommendation to your dashboard and fires an audio alert so you can react within seconds.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">OTC Pairs Covered</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {pairs.map((pair) => (
                <div key={pair} className="bg-gray-900 border border-white/10 rounded-lg px-4 py-2 text-center font-mono text-yellow-400 text-sm">
                  {pair}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">How to Use OTC Signals Step by Step</h2>
            <ol className="space-y-4">
              {[
                { step: '1', title: 'Log in to your MarketSignals24 dashboard', text: 'Navigate to the OTC Signals section. This is the dedicated tab for OTC asset signals, separate from the standard forex/crypto signals.' },
                { step: '2', title: 'Enable sound alerts', text: 'Click "Enable Sound" before a signal arrives. Your browser requires a user gesture before it allows audio — clicking this button unlocks the chime that fires when each new signal appears.' },
                { step: '3', title: 'Wait for a signal', text: 'When the AI fires a signal you will see: asset name, direction (UP/DOWN), expiry duration, and confidence score. A chime plays simultaneously.' },
                { step: '4', title: 'Open your broker platform', text: 'Go to your broker platform and select the same OTC pair. Set the expiry duration to match the signal.' },
                { step: '5', title: 'Place the trade', text: 'Select UP or DOWN according to the signal. Enter your stake amount. Never stake more than 2–3% of your account balance on a single trade.' },
                { step: '6', title: 'Wait for expiry', text: 'Do not close the trade early. Turbo signals are calibrated for the stated expiry. Closing early reduces statistical advantage.' },
              ].map((item) => (
                <li key={item.step} className="flex gap-4 bg-gray-900 border border-white/10 rounded-xl p-5">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 text-black font-bold flex items-center justify-center text-sm">{item.step}</span>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Important Risk Warning</h2>
            <div className="bg-red-900/20 border border-red-400/30 rounded-xl p-5 text-sm text-gray-300 leading-relaxed space-y-3">
              <p>Short-term trading involves substantial risk of loss and is not suitable for all investors. The majority of retail traders lose money. Past performance of signals does not guarantee future results.</p>
              <p>MarketSignals24 provides signals for informational and educational purposes only. We do not provide investment advice and we are not responsible for any losses incurred from trading decisions made using our signals.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqSchema.mainEntity.map((item) => (
                <div key={item.name} className="bg-gray-900 border border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold mb-2 text-yellow-400">{item.name}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Related Signal Types</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/forex-signals" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Forex Signals →</h3>
                <p className="text-gray-400 text-sm mt-1">30+ currency pairs, live markets</p>
              </Link>
              <Link href="/crypto-signals" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Crypto Signals →</h3>
                <p className="text-gray-400 text-sm mt-1">BTC, ETH and 20+ altcoins</p>
              </Link>
              <Link href="/ai-trading-signals" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">AI Technology →</h3>
                <p className="text-gray-400 text-sm mt-1">How the engine generates signals</p>
              </Link>
            </div>
          </section>

          <section className="text-center bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/20 rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-3">Ready to Trade OTC with Confidence?</h2>
            <p className="text-gray-300 mb-6">AI-powered UP/DOWN signals. Available 24/7. Start with just €6.</p>
            <Link href="/register" className="inline-block bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
              Create Free Account
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
