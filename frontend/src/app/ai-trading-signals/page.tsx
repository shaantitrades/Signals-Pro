import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Trading Signals — How Our Engine Works | MarketSignals24',
  description:
    'Discover how MarketSignals24 uses artificial intelligence and machine learning to generate real-time trading signals for forex, crypto and binary options.',
  keywords:
    'AI trading signals, automated trading signals, machine learning trading, artificial intelligence trading, algorithmic signals, AI forex signals, smart trading alerts',
  alternates: {
    canonical: 'https://marketsignals24.com/ai-trading-signals',
  },
  openGraph: {
    title: 'AI Trading Signals — How Our Engine Works | MarketSignals24',
    description:
      'Machine learning + technical analysis = real-time trading signals. No emotions. No fatigue. 24/7.',
    url: 'https://marketsignals24.com/ai-trading-signals',
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
      name: 'What technology powers MarketSignals24 signals?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our signal engine uses a combination of classical technical analysis (40+ indicators), machine learning pattern recognition (trained on millions of historical candles), and volatility filtering to generate high-probability trade ideas. The engine is built in Python using FastAPI and runs continuously on cloud infrastructure with sub-second latency.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the AI fully automated or is there human oversight?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "The signal generation pipeline is fully automated — no human analyst reviews or approves signals before they are published. This eliminates emotional bias and guarantees consistent signal quality. Our engineering team monitors system performance, model accuracy, and infrastructure health 24/7 to ensure reliable operation.",
      },
    },
    {
      '@type': 'Question',
      name: 'How often is the AI model retrained?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The model is retrained on a rolling 90-day window of live market data every two weeks. This keeps the model adapted to current market regimes (trending vs. ranging, high vs. low volatility) without overfitting to short-term noise.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can the AI predict market crashes or black swan events?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No AI model can reliably predict extreme, one-off market events. In periods of unusually high volatility (e.g. central bank emergency announcements, geopolitical shocks), our engine automatically reduces signal frequency and lowers confidence thresholds to protect users from unreliable setups.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is AI-powered signal generation better than manual analysis?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'AI signal generation offers several advantages over manual analysis: it operates 24/7 without fatigue, processes dozens of indicators and timeframes simultaneously in milliseconds, applies consistent rules without emotional bias, and can detect subtle statistical patterns invisible to the human eye. Manual analysts are faster at qualitative reasoning (news interpretation, geopolitical context) but slower and less consistent at quantitative multi-indicator analysis.',
      },
    },
  ],
};

export default function AiTradingSignalsPage() {
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
              Machine Learning · No Emotion · 24/7 Monitoring
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              <span className="text-yellow-400">AI Trading Signals</span> — The Technology Behind MarketSignals24
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Our proprietary AI engine analyses price action, 40+ technical indicators, and volatility patterns simultaneously to generate trading signals faster and more consistently than any human analyst — available from €6 per day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
                Try AI Signals Free
              </Link>
              <Link href="/tarifs" className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/20 transition-colors text-lg">
                View Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 px-4 border-y border-white/10 bg-gray-900/50">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '40+', label: 'Technical Indicators' },
              { value: '5', label: 'Timeframes Analysed' },
              { value: '<500ms', label: 'Signal Latency' },
              { value: '90-day', label: 'Rolling Training Window' },
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
            <h2 className="text-2xl font-bold mb-4">Why AI for Trading Signals?</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Financial markets generate billions of data points every day. Price ticks, order flow, volume profiles, technical indicator values, correlation matrices, volatility measures, sentiment indices — the sheer quantity of information is impossible for any individual trader to process fully in real time.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Artificial intelligence, specifically machine learning, was designed precisely for this problem. An AI model can ingest thousands of variables per second, identify patterns that correlate with profitable trades, and issue an actionable recommendation in milliseconds — consistently, 24 hours a day, without ever getting tired, emotional, or distracted.
            </p>
            <p className="text-gray-300 leading-relaxed">
              MarketSignals24 was built from the ground up as an AI-first signal service. We do not use rule-based systems with hardcoded thresholds. Our model learns continuously from the most recent market data, adapting to changing conditions every two weeks.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">The Signal Engine — Architecture Overview</h2>
            <div className="space-y-4">
              {[
                {
                  phase: 'Phase 1 — Data Ingestion',
                  color: 'blue',
                  text: 'Tick-by-tick price data is streamed from multiple liquidity providers and aggregated into OHLCV candles for M1, M5, M15, H1, and H4 timeframes. Data quality checks run in real time to detect stale, erroneous, or duplicate ticks.',
                },
                {
                  phase: 'Phase 2 — Feature Extraction',
                  color: 'yellow',
                  text: 'For each closed candle, the engine computes 40+ technical indicators: RSI, MACD, EMA (9/21/50/200), Bollinger Bands (20/2), ATR, Stochastic Oscillator, CCI, Williams %R, VWAP deviation, Ichimoku Cloud components, and more. The result is a high-dimensional feature vector.',
                },
                {
                  phase: 'Phase 3 — Pattern Detection',
                  color: 'green',
                  text: 'A gradient-boosted tree model scans the feature vector for patterns that have historically preceded strong directional moves. It assigns a directional probability score (0–100) and a confidence interval to each potential signal candidate.',
                },
                {
                  phase: 'Phase 4 — Risk Filter',
                  color: 'orange',
                  text: 'Candidates below the minimum confidence threshold (configurable, default: 65) are discarded. The risk filter also checks current spread, news calendar proximity (to avoid major economic event spikes), and whether the risk-reward ratio meets the minimum 1:1.5 requirement.',
                },
                {
                  phase: 'Phase 5 — Signal Publication',
                  color: 'purple',
                  text: 'Approved signals are published to a Redis Pub/Sub channel and forwarded to all active subscriber sessions via WebSocket. The entire pipeline from tick ingestion to user notification completes in under 500ms.',
                },
              ].map((item) => (
                <div key={item.phase} className="bg-gray-900 border border-white/10 rounded-xl p-5">
                  <h3 className="font-semibold text-yellow-400 mb-2">{item.phase}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Indicators Used by the AI Engine</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'RSI (14)', 'MACD (12/26/9)', 'Bollinger Bands', 'EMA 9', 'EMA 21', 'EMA 50',
                'EMA 200', 'SMA 100', 'ATR (14)', 'Stochastic (14/3)', 'CCI (20)', 'Williams %R',
                'VWAP', 'Ichimoku Cloud', 'Pivot Points', 'Support/Resistance', 'Volume Profile', 'ADX',
                'Parabolic SAR', 'Fibonacci Levels', 'OBV', 'MFI', 'ROC', 'Candlestick Patterns',
              ].map((ind) => (
                <div key={ind} className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-center text-sm text-gray-300">
                  {ind}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Human vs. AI Signal Generation</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400">Attribute</th>
                    <th className="text-center py-3 px-4 text-gray-400">Human Analyst</th>
                    <th className="text-center py-3 px-4 text-yellow-400">MarketSignals24 AI</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Availability', '8h/day, 5 days/week', '24/7, 365 days/year'],
                    ['Indicators analysed', '3–5 simultaneously', '40+ per signal'],
                    ['Timeframes scanned', '1–2', 'M5, M15, H1, H4, D1'],
                    ['Emotional bias', 'High', 'None'],
                    ['Signal latency', 'Minutes', '<500ms'],
                    ['Consistency', 'Variable', 'Deterministic'],
                    ['News interpretation', 'Excellent', 'Limited (calendar filter only)'],
                    ['Cost', 'High (salary/subscription)', 'From €6/day'],
                  ].map(([attr, human, ai]) => (
                    <tr key={attr} className="border-b border-white/5">
                      <td className="py-3 px-4 font-medium">{attr}</td>
                      <td className="py-3 px-4 text-center text-gray-400">{human}</td>
                      <td className="py-3 px-4 text-center text-green-400">{ai}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            <h2 className="text-2xl font-bold mb-4">Explore AI Signals by Asset Class</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/forex-signals" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Forex Signals →</h3>
                <p className="text-gray-400 text-sm mt-1">30+ currency pairs, majors &amp; crosses</p>
              </Link>
              <Link href="/crypto-signals" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Crypto Signals →</h3>
                <p className="text-gray-400 text-sm mt-1">BTC, ETH and 20+ altcoins</p>
              </Link>
              <Link href="/binary-options-signals" className="block bg-gray-900 border border-white/10 rounded-xl p-5 hover:border-yellow-400/50 transition-colors group">
                <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">OTC / Binary Options →</h3>
                <p className="text-gray-400 text-sm mt-1">1–5 min signals, 24/7</p>
              </Link>
            </div>
          </section>

          <section className="text-center bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/20 rounded-2xl p-10">
            <h2 className="text-2xl font-bold mb-3">Experience AI-Powered Trading Signals</h2>
            <p className="text-gray-300 mb-6">Fast, consistent, emotion-free signals across forex, crypto and OTC markets.</p>
            <Link href="/register" className="inline-block bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl hover:bg-yellow-300 transition-colors text-lg">
              Get Started Today
            </Link>
          </section>
        </article>
      </main>
    </>
  );
}
