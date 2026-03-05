import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Crypto Trading Signals — Bitcoin, Ethereum, Altcoin Alerts | MarketSignals24',
  description:
    'Real-time AI crypto trading signals for Bitcoin, Ethereum, BNB and 20+ altcoins. Precise entry, stop-loss and take-profit alerts. Sign up from €6.',
  keywords:
    'MarketSignals24, crypto trading signals, free crypto signals, free bitcoin signals, free ethereum signals, best free crypto signals, crypto signals free, bitcoin signals, ethereum signals, altcoin signals, BTC signals, ETH signals, cryptocurrency alerts, crypto buy sell signals, AI crypto signals, real-time crypto signals, crypto trading alerts, daily crypto signals',
  alternates: {
    canonical: 'https://marketsignals24.com/crypto-signals',
  },
  openGraph: {
    title: 'Crypto Trading Signals — Bitcoin & Altcoin Alerts | MarketSignals24',
    description:
      'AI-powered crypto signals for BTC, ETH and 20+ coins. Real-time alerts with entry, SL and TP.',
    url: 'https://marketsignals24.com/crypto-signals',
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
      name: 'What crypto trading signals does MarketSignals24 provide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We provide real-time buy and sell signals for Bitcoin (BTC), Ethereum (ETH), Binance Coin (BNB), Solana (SOL), Cardano (ADA), XRP, and 15+ other major altcoins. Each signal includes an entry price, stop-loss, and take-profit level.',
      },
    },
    {
      '@type': 'Question',
      name: 'How are crypto signals different from forex signals?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Crypto markets trade 24/7 without centralized market hours, which means signals can trigger at any time including weekends. Crypto also tends to be more volatile than forex, so signal durations are typically shorter and position sizing should be more conservative.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use crypto signals with a small account?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Most signals can be traded with as little as $50-$100 per position on exchanges that allow fractional trading. We always recommend using at most 1-2% of your account per trade regardless of account size.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which exchanges support MarketSignals24 crypto signals?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our signals are exchange-agnostic — they indicate the asset and the price. You can execute them on any major exchange including Binance, Coinbase, Kraken, Bybit, or OKX. We do not hold or transfer your funds.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are crypto signals included in all plans?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Crypto signals are included in all subscription tiers starting from the Pass 24h at €6. The Monthly plan at €85 gives you unlimited access to all signal types — forex, crypto, binary options, and OTC — for the entire month.',
      },
    },
  ],
};

export default function CryptoSignalsPage() {
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
              BTC · ETH · 20+ Altcoins · 24/7
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="text-yellow-400">Crypto Trading Signals</span> — AI Alerts for Bitcoin &amp; Beyond
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Stop guessing where Bitcoin is going next. Our AI analyses on-chain data, technical indicators and market structure to deliver precise buy and sell signals for BTC, ETH and 20+ altcoins — 24 hours a day, 7 days a week.
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
              { value: '20+', label: 'Cryptocurrencies' },
              { value: '24/7', label: 'Market Coverage' },
              { value: '85%', label: 'Win Rate (backtest)' },
              { value: '<2s', label: 'Signal Delivery' },
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
            <h2 className="text-2xl font-bold mb-4">Why Trade Crypto with AI Signals?</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Cryptocurrency markets move faster and more unpredictably than any other asset class. A single tweet, regulatory announcement, or whale transaction can move Bitcoin 5–10% in minutes. Human traders simply cannot process this volume of information fast enough to react profitably.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              MarketSignals24 solves this with an AI model that ingests tick data, order book depth, social sentiment scores, and on-chain metrics simultaneously. The engine has no emotions, no fatigue, and no cognitive biases — it evaluates every potential trade objectively, around the clock, including weekends and bank holidays when traditional markets are closed.
            </p>
            <p className="text-gray-300 leading-relaxed">
              When the AI detects a confluence of bullish or bearish signals above a proprietary confidence threshold, it instantly publishes a signal to your dashboard and fires an audio alert in your browser. You get the opportunity — you just decide whether to act on it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Coins We Cover</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                'BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT',
                'ADA/USDT', 'XRP/USDT', 'DOT/USDT', 'MATIC/USDT',
                'AVAX/USDT', 'LINK/USDT', 'LTC/USDT', 'DOGE/USDT',
                'ATOM/USDT', 'UNI/USDT', 'TRX/USDT', 'NEAR/USDT',
                'ETC/USDT', 'FIL/USDT', 'APT/USDT', 'ARB/USDT',
              ].map((coin) => (
                <div key={coin} className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-center font-mono text-yellow-400 text-sm">
                  {coin}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">What Each Signal Includes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: '📈', title: 'Direction', text: 'Clear BUY (long) or SELL (short) instruction — no ambiguity.' },
                { icon: '🎯', title: 'Entry Price', text: 'The exact price at which to open the position for optimal risk/reward.' },
                { icon: '🛡️', title: 'Stop-Loss', text: 'Where to place your stop to limit losses if the trade goes against you.' },
                { icon: '💰', title: 'Take-Profit', text: 'One or two TP levels so you can partially close and lock in profits as price moves.' },
                { icon: '⏱️', title: 'Signal Duration', text: 'Estimated holding time from a few minutes to several hours.' },
                { icon: '📊', title: 'Confidence Score', text: 'A 0–100 score reflecting how strongly the indicators align for this signal.' },
              ].map((item) => (
                <div key={item.title} className="bg-gray-900 border border-white/10 rounded-xl p-5 flex gap-4">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-gray-400 text-sm">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Crypto Risk Disclaimer</h2>
            <p className="text-gray-300 leading-relaxed mb-3">
              Cryptocurrency trading is highly speculative and involves a substantial risk of loss. Prices can be extremely volatile. Unlike forex, most crypto assets are not regulated financial instruments and are subject to different legal protections depending on your jurisdiction.
            </p>
            <p className="text-gray-300 leading-relaxed">
              MarketSignals24 provides information and educational signals only. We are not a licensed financial adviser. Always conduct your own research and consult with a qualified financial professional before making any investment decisions.
            </p>
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
            <h2 className="text-2xl font-bold mb-4">Explore More Signal Types</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/forex-signals" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Forex Signals →</h3>
                <p className="text-gray-400 text-sm mt-1">30+ FX pairs, majors &amp; crosses</p>
              </Link>
              <Link href="/binary-options-signals" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Binary Options →</h3>
                <p className="text-gray-400 text-sm mt-1">1–5 min OTC signals, no market hours</p>
              </Link>
              <Link href="/ai-trading-signals" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">AI Technology →</h3>
                <p className="text-gray-400 text-sm mt-1">How our signal engine works</p>
              </Link>
            </div>
          </section>

          <section className="text-center bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/20 rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-3">Trade Crypto Smarter</h2>
            <p className="text-gray-300 mb-6">AI-powered signals. Real-time alerts. Precise entry and exit levels.</p>
            <Link href="/register" className="inline-block bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
              Get Started — Free
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
